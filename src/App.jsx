import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DailyBanner from './components/DailyBanner';
import MilestoneClarify from './components/MilestoneClarify';
import MilestoneEntities from './components/MilestoneEntities';
import MilestoneUML from './components/MilestoneUML';
import MilestonePatterns from './components/MilestonePatterns';
import MilestoneCodeSim from './components/MilestoneCodeSim';
import AIMentorDrawer from './components/AIMentorDrawer';
import PracticeWorkspace from './components/PracticeWorkspace';
import ScenarioLibraryModal from './components/ScenarioLibraryModal';
import CustomScenarioModal from './components/CustomScenarioModal';
import AISettingsModal from './components/AISettingsModal';
import { getScenarioOfTheDay, LLD_SCENARIOS } from './data/scenarios';
import { DEFAULT_AI_CONFIG } from './data/aiProviders';

export default function App() {
  const [scenario, setScenario] = useState(() => getScenarioOfTheDay());
  const [currentStage, setCurrentStage] = useState(0); // 0 to 4
  const [isMentorOpen, setIsMentorOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [isAISettingsOpen, setIsAISettingsOpen] = useState(false);

  // Theme State: 'dark' | 'light'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('lld_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('lld_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // AI Multi-Provider Config
  const [aiConfig, setAiConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('lld_ai_config');
      return saved ? JSON.parse(saved) : DEFAULT_AI_CONFIG;
    } catch {
      return DEFAULT_AI_CONFIG;
    }
  });

  useEffect(() => {
    localStorage.setItem('lld_ai_config', JSON.stringify(aiConfig));
  }, [aiConfig]);

  // Solved tracking
  const [solvedMap, setSolvedMap] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lld_solved_map') || '{}');
    } catch {
      return {};
    }
  });

  const [streak, setStreak] = useState(() => {
    try {
      return parseInt(localStorage.getItem('lld_streak') || '3', 10);
    } catch {
      return 3;
    }
  });

  useEffect(() => {
    localStorage.setItem('lld_solved_map', JSON.stringify(solvedMap));
  }, [solvedMap]);

  useEffect(() => {
    localStorage.setItem('lld_streak', streak.toString());
  }, [streak]);

  const handleCompleteScenario = (scenarioId) => {
    if (!solvedMap[scenarioId]) {
      setSolvedMap(prev => ({ ...prev, [scenarioId]: true }));
      setStreak(prev => prev + 1);
    }
  };

  const handleSelectScenario = (newScenario) => {
    setScenario(newScenario);
    setCurrentStage(0);
  };

  const handleAddCustomScenario = (newScenario) => {
    setScenario(newScenario);
    setCurrentStage(0);
  };

  const renderActiveStage = () => {
    switch (currentStage) {
      case 0:
        return (
          <MilestoneClarify
            scenario={scenario}
            onProceedNext={() => setCurrentStage(1)}
          />
        );
      case 1:
        return (
          <MilestoneEntities
            scenario={scenario}
            onProceedNext={() => setCurrentStage(2)}
            onProceedPrev={() => setCurrentStage(0)}
          />
        );
      case 2:
        return (
          <MilestoneUML
            scenario={scenario}
            onProceedNext={() => setCurrentStage(3)}
            onProceedPrev={() => setCurrentStage(1)}
          />
        );
      case 3:
        return (
          <MilestonePatterns
            scenario={scenario}
            onProceedNext={() => setCurrentStage(4)}
            onProceedPrev={() => setCurrentStage(2)}
          />
        );
      case 4:
        return (
          <MilestoneCodeSim
            scenario={scenario}
            onProceedPrev={() => setCurrentStage(3)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      {/* Top Navbar with Theme Switcher & AI Provider Status */}
      <Navbar
        streak={streak}
        theme={theme}
        onToggleTheme={toggleTheme}
        totalScenarios={LLD_SCENARIOS.length}
        onOpenLibrary={() => setIsLibraryOpen(true)}
        onOpenCustom={() => setIsCustomOpen(true)}
        onToggleMentor={() => setIsMentorOpen(!isMentorOpen)}
        onOpenAISettings={() => setIsAISettingsOpen(true)}
        isMentorOpen={isMentorOpen}
        aiConfig={aiConfig}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {/* Daily Scenario Banner & Stage Pills */}
        <DailyBanner
          scenario={scenario}
          currentStage={currentStage}
          onSelectStage={setCurrentStage}
          isSolved={!!solvedMap[scenario.id]}
        />

        {/* Active Stage Guided Milestone */}
        {renderActiveStage()}

        {/* User Practice Workspace & Solution Submission Rubric */}
        <PracticeWorkspace
          scenario={scenario}
          onCompleteScenario={handleCompleteScenario}
        />
      </main>

      {/* Slide-out AI Mentor Drawer with Multi-Provider Support */}
      <AIMentorDrawer
        isOpen={isMentorOpen}
        onClose={() => setIsMentorOpen(false)}
        currentScenario={scenario}
        currentStageIndex={currentStage}
        aiConfig={aiConfig}
        onOpenSettings={() => setIsAISettingsOpen(true)}
      />

      {/* AI Multi-Provider Configuration Modal (Ollama, Gemini, OpenAI, etc.) */}
      <AISettingsModal
        isOpen={isAISettingsOpen}
        onClose={() => setIsAISettingsOpen(false)}
        currentConfig={aiConfig}
        onSaveConfig={setAiConfig}
      />

      {/* Scenario Library Modal */}
      <ScenarioLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelectScenario={handleSelectScenario}
        currentScenarioId={scenario.id}
        solvedMap={solvedMap}
      />

      {/* Custom Scenario Generator Modal */}
      <CustomScenarioModal
        isOpen={isCustomOpen}
        onClose={() => setIsCustomOpen(false)}
        onAddCustomScenario={handleAddCustomScenario}
      />

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-glass)',
        padding: '24px',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            <strong>LLD Craft</strong> — Daily Low-Level Design Practice & Socratic Mentoring Platform.
          </div>
          <div>
            Supports <strong>Ollama (Local)</strong>, Google Gemini, OpenAI, Groq, DeepSeek, and offline Socratic tutoring in Dark & Light modes.
          </div>
        </div>
      </footer>
    </div>
  );
}
