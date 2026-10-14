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
import ScenarioGeneratorModal from './components/ScenarioGeneratorModal';
import AISettingsModal from './components/AISettingsModal';
import { getScenarioOfTheDay, LLD_SCENARIOS } from './data/scenarios';
import { DEFAULT_AI_CONFIG } from './data/aiProviders';

export default function App() {
  // Custom On-Demand Scenarios
  const [customScenarios, setCustomScenarios] = useState(() => {
    try {
      const saved = localStorage.getItem('lld_custom_scenarios');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('lld_custom_scenarios', JSON.stringify(customScenarios));
  }, [customScenarios]);

  // Current Scenario Selection
  const [scenario, setScenario] = useState(() => getScenarioOfTheDay());
  const [currentStage, setCurrentStage] = useState(0); // 0 to 4
  const [isMentorOpen, setIsMentorOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
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

  // AI Multi-Provider Config (Ollama, Gemini, OpenAI, Groq, etc.)
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

  const handleScenarioGenerated = (newScenario) => {
    setCustomScenarios(prev => [newScenario, ...prev]);
    setScenario(newScenario);
    setCurrentStage(0);
  };

  const handleDeleteCustomScenario = (scenarioId) => {
    setCustomScenarios(prev => prev.filter(s => s.id !== scenarioId));
    if (scenario.id === scenarioId) {
      setScenario(getScenarioOfTheDay());
      setCurrentStage(0);
    }
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

  // Layout View Mode: 'split' | 'guide' | 'workbench'
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('lld_view_mode') || 'split';
  });

  const handleSelectViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('lld_view_mode', mode);
  };

  return (
    <div className="app-container">
      {/* Top Engineering Navbar */}
      <Navbar
        streak={streak}
        theme={theme}
        onToggleTheme={toggleTheme}
        totalScenarios={LLD_SCENARIOS.length + customScenarios.length}
        onOpenLibrary={() => setIsLibraryOpen(true)}
        onOpenGenerator={() => setIsGeneratorOpen(true)}
        onToggleMentor={() => setIsMentorOpen(!isMentorOpen)}
        onOpenAISettings={() => setIsAISettingsOpen(true)}
        isMentorOpen={isMentorOpen}
        aiConfig={aiConfig}
      />

      {/* Main Studio Content Area */}
      <main className="main-content">
        {/* Architectural Problem Brief, Layout Selector & Milestone Stepper */}
        <DailyBanner
          scenario={scenario}
          currentStage={currentStage}
          onSelectStage={setCurrentStage}
          isSolved={!!solvedMap[scenario.id]}
          viewMode={viewMode}
          onSelectViewMode={handleSelectViewMode}
        />

        {/* Studio Workspace Layout */}
        {viewMode === 'split' && (
          <div className="studio-layout">
            <div className="studio-guide-pane">
              {renderActiveStage()}
            </div>
            <div className="studio-workbench-pane">
              <PracticeWorkspace
                scenario={scenario}
                currentStage={currentStage}
                aiConfig={aiConfig}
                onOpenAISettings={() => setIsAISettingsOpen(true)}
                onCompleteScenario={handleCompleteScenario}
                isSolved={!!solvedMap[scenario.id]}
              />
            </div>
          </div>
        )}

        {viewMode === 'guide' && (
          <div className="studio-guide-pane">
            {renderActiveStage()}
          </div>
        )}

        {viewMode === 'workbench' && (
          <div className="flex-col gap-4">
            <PracticeWorkspace
              scenario={scenario}
              currentStage={currentStage}
              aiConfig={aiConfig}
              onOpenAISettings={() => setIsAISettingsOpen(true)}
              onCompleteScenario={handleCompleteScenario}
              isSolved={!!solvedMap[scenario.id]}
            />
          </div>
        )}
      </main>

      {/* Slide-out AI Mentor Assistant */}
      <AIMentorDrawer
        isOpen={isMentorOpen}
        onClose={() => setIsMentorOpen(false)}
        currentScenario={scenario}
        currentStageIndex={currentStage}
        aiConfig={aiConfig}
        onOpenSettings={() => setIsAISettingsOpen(true)}
      />

      {/* AI Multi-Provider Configuration Modal (Ollama, Gemini, OpenAI, Groq) */}
      <AISettingsModal
        isOpen={isAISettingsOpen}
        onClose={() => setIsAISettingsOpen(false)}
        currentConfig={aiConfig}
        onSaveConfig={setAiConfig}
      />

      {/* On-Demand Scenario Architect Modal */}
      <ScenarioGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        aiConfig={aiConfig}
        onScenarioGenerated={handleScenarioGenerated}
      />

      {/* Scenario Registry / Library Modal */}
      <ScenarioLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelectScenario={handleSelectScenario}
        currentScenarioId={scenario.id}
        solvedMap={solvedMap}
        customScenarios={customScenarios}
        onDeleteCustomScenario={handleDeleteCustomScenario}
        onOpenGenerator={() => setIsGeneratorOpen(true)}
      />

      {/* Technical Footer */}
      <footer className="app-footer">
        <span>LLD STUDIO · DELIBERATE ARCHITECTURAL PRACTICE</span>
        <span>OLLAMA · GEMINI · GROQ · OPENAI · OFFLINE</span>
      </footer>
    </div>
  );
}
