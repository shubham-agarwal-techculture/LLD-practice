import React, { useState, useEffect } from 'react';
import { Terminal, Flame, Clock, BookOpen, Plus, Bot, Sun, Moon, Cpu } from 'lucide-react';
import { getTimeUntilNextScenario } from '../data/scenarios';
import { AI_PROVIDERS } from '../data/aiProviders';

export default function Navbar({
  streak = 3,
  theme = 'dark',
  onToggleTheme,
  onOpenLibrary,
  onOpenGenerator,
  onToggleMentor,
  onOpenAISettings,
  isMentorOpen,
  aiConfig,
  totalScenarios = 7
}) {
  const [timeLeft, setTimeLeft] = useState(getTimeUntilNextScenario());

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeUntilNextScenario()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeProvider = AI_PROVIDERS.find(p => p.id === aiConfig?.providerId) || AI_PROVIDERS[0];
  const providerLabel = activeProvider.id === 'ollama'
    ? `ollama/${aiConfig?.model || 'llama3'}`
    : activeProvider.name.split(' ')[0].toLowerCase();

  return (
    <header className="navbar">
      <div className="navbar-inner">

        {/* Brand */}
        <div className="navbar-brand">
          <div className="brand-icon">
            <Terminal size={15} color="#fff" />
          </div>
          <span className="brand-name">
            LLD<span>STUDIO</span>
          </span>
          <span className="mono-tag" style={{ fontSize: '0.62rem' }}>v2.4</span>
        </div>

        {/* Center Telemetry */}
        <div className="navbar-meta">
          <span className="mono-tag" style={{ color: 'var(--accent-amber)', borderColor: 'var(--border-amber)' }}>
            <Flame size={11} />
            {streak}d streak
          </span>

          <span className="mono-tag">
            <Clock size={11} style={{ color: 'var(--accent-indigo)' }} />
            next:
            <strong className="text-primary">
              {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
            </strong>
          </span>
        </div>

        {/* Actions */}
        <div className="navbar-actions">
          <button
            onClick={onOpenGenerator}
            className="btn btn-primary btn-sm"
            id="nav-btn-generate-scenario"
          >
            <Plus size={13} />
            New Scenario
          </button>

          <button
            onClick={onOpenLibrary}
            className="btn btn-secondary btn-sm"
            id="nav-btn-library"
          >
            <BookOpen size={13} />
            Library ({totalScenarios})
          </button>

          <button
            onClick={onOpenAISettings}
            className="btn btn-secondary btn-sm"
            id="nav-btn-ai-settings"
            title="Configure AI Engine"
          >
            <Cpu size={13} style={{ color: 'var(--accent-emerald)' }} />
            <span className="font-mono" style={{ fontSize: '0.72rem' }}>{providerLabel}</span>
          </button>

          <button
            onClick={onToggleTheme}
            className="btn btn-ghost btn-icon btn-sm"
            id="nav-btn-theme"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark'
              ? <Sun size={15} style={{ color: 'var(--accent-amber)' }} />
              : <Moon size={15} style={{ color: 'var(--deco-indigo)' }} />}
          </button>

          <button
            onClick={onToggleMentor}
            className={isMentorOpen ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
            id="nav-btn-mentor"
          >
            <Bot size={14} />
            Copilot
          </button>
        </div>
      </div>
    </header>
  );
}
