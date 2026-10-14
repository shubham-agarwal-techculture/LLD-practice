import React, { useState } from 'react';
import { X, Sparkles, Wand2, Terminal, Cpu, Layers, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { generateScenarioOnDemand, AI_PROVIDERS } from '../data/aiProviders';

const DOMAIN_PRESETS = [
  { id: 'Fintech', label: '💳 Fintech & Ledgers', example: 'Double-entry digital wallet with idempotency and audit logs' },
  { id: 'Logistics', label: '🚚 Logistics & Fleet', example: 'Food delivery partner dispatching and batch matching' },
  { id: 'Messaging', label: '⚡ Pub/Sub & Infra', example: 'In-memory message broker with consumer groups and offsets' },
  { id: 'Gaming', label: '🎮 Real-Time Games', example: 'Chess game engine with move validation, undo/redo, checkmate' },
  { id: 'E-Commerce', label: '🛒 High-Load Commerce', example: 'Flash sale inventory reservation with 10-minute hold lock' },
  { id: 'Security', label: '🛡️ Gateway & Auth', example: 'Dynamic API Gateway with JWT validation and tier rate limiting' }
];

const FOCUS_PRESETS = [
  'Concurrency & Fine-Grained Locking',
  'State Machine & Lifecycle Transitions',
  'Extensible Strategy & Factory Core',
  'Event-Driven Pub/Sub & Observer',
  'Memory-Bounded Cache & Eviction'
];

export default function ScenarioGeneratorModal({ isOpen, onClose, aiConfig, onScenarioGenerated }) {
  const [prompt, setPrompt] = useState('');
  const [domain, setDomain] = useState('Logistics');
  const [focus, setFocus] = useState('Concurrency & Fine-Grained Locking');
  const [difficulty, setDifficulty] = useState('Medium');
  const [language, setLanguage] = useState('Java');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStep, setGenStep] = useState('');

  if (!isOpen) return null;

  const activeProvider = AI_PROVIDERS.find(p => p.id === aiConfig?.providerId) || AI_PROVIDERS[0];

  const handleSelectPreset = (preset) => {
    setDomain(preset.id);
    setPrompt(preset.example);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setGenStep(`Querying ${activeProvider.name} for architectural specification...`);

    try {
      const generated = await generateScenarioOnDemand({
        config: aiConfig,
        prompt: prompt.trim(),
        domain,
        difficulty,
        focus,
        language
      });

      onScenarioGenerated(generated);
      onClose();
    } catch (err) {
      console.error('Generation error:', err);
      alert(`Generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
      setGenStep('');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      zIndex: 1200
    }}>
      <div style={{
        width: '680px',
        maxWidth: '100%',
        maxHeight: '92vh',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Studio Header */}
        <div style={{
          padding: '16px 22px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-tertiary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Terminal size={15} color="#fff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                  SCENARIO ARCHITECT
                </h3>
                <span style={{
                  fontSize: '0.65rem',
                  fontFamily: 'var(--font-mono)',
                  padding: '1px 6px',
                  borderRadius: '3px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--accent-indigo)',
                  border: '1px solid rgba(99, 102, 241, 0.3)'
                }}>
                  ON-DEMAND SYNTHESIS
                </span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Synthesize custom LLD problem blueprints powered by {activeProvider.name}.
              </p>
            </div>
          </div>

          <button onClick={onClose} disabled={isGenerating} className="btn btn-secondary btn-sm" style={{ padding: '6px' }}>
            <X size={15} />
          </button>
        </div>

        {/* Generator Form */}
        <form onSubmit={handleGenerate} style={{
          padding: '20px 22px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Prompt Specification */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                System Specification / Problem Description
              </label>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                e.g. Real-world service or algorithm
              </span>
            </div>
            <textarea
              rows={3}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g. Design a Delivery Partner Assignment System with real-time location batching, order matching heuristics, and driver acceptance timeouts"
              required
              disabled={isGenerating}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-medium)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.84rem',
                lineHeight: '1.5',
                resize: 'none'
              }}
            />
          </div>

          {/* Quick Preset Templates */}
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Quick Architecture Blueprints:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '6px' }}>
              {DOMAIN_PRESETS.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  disabled={isGenerating}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: domain === p.id ? '1px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                    background: domain === p.id ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-card)',
                    color: domain === p.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                    textAlign: 'left',
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s'
                  }}
                >
                  <span>{p.label}</span>
                  {domain === p.id && <Check size={12} color="#6366f1" />}
                </button>
              ))}
            </div>
          </div>

          {/* Architectural Focus & Difficulty Matrix */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.76rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Architectural Invariant Focus
              </label>
              <select
                value={focus}
                onChange={e => setFocus(e.target.value)}
                disabled={isGenerating}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-medium)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem'
                }}
              >
                {FOCUS_PRESETS.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.76rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Interview Rigor (Difficulty)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                {['Easy', 'Medium', 'Hard'].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    disabled={isGenerating}
                    style={{
                      padding: '8px 4px',
                      borderRadius: 'var(--radius-sm)',
                      border: difficulty === d ? '1px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                      background: difficulty === d ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-card)',
                      color: difficulty === d ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontSize: '0.74rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Language Selection */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.76rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Primary Language Target
              </label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                disabled={isGenerating}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-medium)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem'
                }}
              >
                <option value="Java">Java (ReentrantLock & Concurrency)</option>
                <option value="Python">Python 3 (Threading & Data classes)</option>
                <option value="Go">Go (Goroutines & Channels)</option>
                <option value="TypeScript">TypeScript (Interfaces & Async)</option>
                <option value="C++">C++ (std::mutex & Modern OOP)</option>
              </select>
            </div>

            {/* Provider indicator */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.74rem'
            }}>
              <span style={{ color: 'var(--text-muted)' }}>Synthesizer Engine:</span>
              <strong style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Cpu size={13} color="#10b981" /> {activeProvider.name}
              </strong>
            </div>
          </div>

          {/* Generation Progress Indicator */}
          {isGenerating && (
            <div style={{
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.8rem',
              color: 'var(--text-primary)'
            }}>
              <Sparkles size={16} className="spin" color="#818cf8" />
              <span>{genStep || 'Synthesizing requirements, domain contracts, and UML graph...'}</span>
            </div>
          )}

          {/* Footer Controls */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating || !prompt.trim()}
              className="btn btn-primary btn-sm"
              id="btn-submit-generate-scenario"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Wand2 size={14} />
              <span>{isGenerating ? 'Synthesizing...' : 'Generate Scenario'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
