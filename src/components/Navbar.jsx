import React, { useState, useEffect } from 'react';
import { Layers, Flame, Clock, BookOpen, Wand2, Bot, Sun, Moon, Settings2, Cpu } from 'lucide-react';
import { getTimeUntilNextScenario } from '../data/scenarios';
import { AI_PROVIDERS } from '../data/aiProviders';

export default function Navbar({
  streak = 3,
  theme = 'dark',
  onToggleTheme,
  onOpenLibrary,
  onOpenCustom,
  onToggleMentor,
  onOpenAISettings,
  isMentorOpen,
  aiConfig,
  totalScenarios = 7
}) {
  const [timeLeft, setTimeLeft] = useState(getTimeUntilNextScenario());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeUntilNextScenario());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeProvider = AI_PROVIDERS.find(p => p.id === aiConfig?.providerId) || AI_PROVIDERS[0];

  return (
    <header style={{
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      transition: 'background-color 0.25s, border-color 0.25s'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Brand / Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)'
          }}>
            <Layers size={22} color="#fff" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.2rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                LLD<span style={{ color: '#818cf8' }}>Craft</span>
              </h1>
              <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                Daily Edition
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '-2px' }}>
              Interactive Low-Level Design System & Socratic Guide
            </p>
          </div>
        </div>

        {/* Center / Daily Countdown & Streak */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {/* Streak Counter */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '9999px',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#f59e0b',
            fontSize: '0.8rem',
            fontWeight: '700'
          }}>
            <Flame size={15} color="#f59e0b" />
            <span>{streak} Day Streak</span>
          </div>

          {/* Daily Timer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            background: 'var(--bg-tertiary)',
            padding: '5px 12px',
            borderRadius: '9999px',
            border: '1px solid var(--border-subtle)'
          }}>
            <Clock size={14} color="#818cf8" />
            <span>Next Scenario in:</span>
            <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
              {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
            </strong>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Theme Toggle Button (Dark / Light) */}
          <button
            onClick={onToggleTheme}
            className="btn btn-secondary btn-sm"
            id="nav-btn-theme"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            style={{ padding: '6px 10px', fontSize: '0.78rem' }}
          >
            {theme === 'dark' ? (
              <>
                <Sun size={15} color="#f59e0b" />
                <span style={{ fontSize: '0.75rem' }}>Light</span>
              </>
            ) : (
              <>
                <Moon size={15} color="#818cf8" />
                <span style={{ fontSize: '0.75rem' }}>Dark</span>
              </>
            )}
          </button>

          {/* AI Settings Button */}
          <button
            onClick={onOpenAISettings}
            className="btn btn-secondary btn-sm"
            id="nav-btn-ai-settings"
            title="Configure AI Providers (Ollama, Gemini, OpenAI, etc.)"
            style={{ padding: '6px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <Cpu size={14} color="#10b981" />
            <span>{activeProvider.id === 'ollama' ? '🦙 Ollama' : activeProvider.name.split(' ')[0]}</span>
          </button>

          <button
            onClick={onOpenLibrary}
            className="btn btn-secondary btn-sm"
            id="nav-btn-library"
          >
            <BookOpen size={14} /> Library ({totalScenarios})
          </button>

          <button
            onClick={onOpenCustom}
            className="btn btn-secondary btn-sm"
            id="nav-btn-custom"
          >
            <Wand2 size={14} /> Custom
          </button>

          <button
            onClick={onToggleMentor}
            className="btn btn-primary btn-sm"
            id="nav-btn-mentor"
            style={{ position: 'relative' }}
          >
            <Bot size={15} />
            <span>AI Mentor</span>
            {!isMentorOpen && (
              <span style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 6px #10b981'
              }} />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
