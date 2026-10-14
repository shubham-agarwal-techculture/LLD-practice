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
import { getScenarioOfTheDay, LLD_SCENARIOS } from './data/scenarios';

export default function App() {
  const [scenario, setScenario] = useState(() => getScenarioOfTheDay());
  const [currentStage, setCurrentStage] = useState(0); // 0 to 4
  const [isMentorOpen, setIsMentorOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isCustomOpen, setIsCustomOpen] = useState(false);

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
      {/* Top Navbar */}
      <Navbar
        streak={streak}
        totalScenarios={LLD_SCENARIOS.length}
        onOpenLibrary={() => setIsLibraryOpen(true)}
        onOpenCustom={() => setIsCustomOpen(true)}
        onToggleMentor={() => setIsMentorOpen(!isMentorOpen)}
        isMentorOpen={isMentorOpen}
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

      {/* Slide-out AI Mentor Drawer */}
      <AIMentorDrawer
        isOpen={isMentorOpen}
        onClose={() => setIsMentorOpen(false)}
        currentScenario={scenario}
        currentStageIndex={currentStage}
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
        background: 'rgba(9, 13, 22, 0.95)',
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
            Master SOLID Principles, Design Patterns, Concurrency Locks, and System Architecture through deliberate daily practice.
          </div>
        </div>
      </footer>
    </div>
  );
}
