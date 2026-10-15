import React, { useState } from 'react';
import { X, Sparkles, Wand2, Terminal, Cpu, Check, Search, ExternalLink, Link2, Dice5 } from 'lucide-react';
import { generateScenarioOnDemand, AI_PROVIDERS } from '../data/aiProviders';
import { fetchScenarioSource, searchOnlineScenarios } from '../data/scenarioSources';

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

const SURPRISE_PROMPTS = [
  { prompt: 'Design a concert ticket booking platform with seat holds, concurrent checkout, and payment expiry', domain: 'E-Commerce' },
  { prompt: 'Design a smart elevator control system that schedules requests across multiple elevators', domain: 'Logistics' },
  { prompt: 'Design a multi-channel notification service with retries, templates, and delivery preferences', domain: 'Messaging' },
  { prompt: 'Design a digital wallet with double-entry ledger, transfers, and idempotent payments', domain: 'Fintech' },
  { prompt: 'Design a board game engine with turn validation, undo, and game state transitions', domain: 'Gaming' },
  { prompt: 'Design an API rate limiter with per-user quotas and pluggable algorithms', domain: 'Security' }
];

export default function ScenarioGeneratorModal({ isOpen, onClose, aiConfig, onScenarioGenerated, onOpenManual }) {
  const [prompt, setPrompt] = useState('');
  const [domain, setDomain] = useState('Logistics');
  const [focus, setFocus] = useState('Concurrency & Fine-Grained Locking');
  const [difficulty, setDifficulty] = useState('Medium');
  const [language, setLanguage] = useState('Java');
  const [sourceMode, setSourceMode] = useState('generate');
  const [onlineQuery, setOnlineQuery] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [onlineResults, setOnlineResults] = useState([]);
  const [sourceErrors, setSourceErrors] = useState([]);
  const [sourceError, setSourceError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
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

    await createScenario(prompt.trim(), domain);
  };

  const createScenario = async (scenarioPrompt, scenarioDomain, sourceMetadata) => {
    if (isGenerating) return;
    setIsGenerating(true);
    setGenStep(`Querying ${activeProvider.name} for architectural specification...`);

    try {
      const generated = await generateScenarioOnDemand({
        config: aiConfig,
        prompt: scenarioPrompt,
        domain: scenarioDomain,
        difficulty,
        focus,
        language
      });

      onScenarioGenerated({
        ...generated,
        ...(sourceMetadata?.title ? { title: sourceMetadata.title } : {}),
        ...(sourceMetadata ? { sourceMetadata } : {})
      });
      onClose();
    } catch (err) {
      console.error('Generation error:', err);
      setSourceError(`Generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
      setGenStep('');
    }
  };

  const handleSurpriseMe = () => {
    const randomIndex = window.crypto.getRandomValues(new Uint32Array(1))[0] % SURPRISE_PROMPTS.length;
    const pick = SURPRISE_PROMPTS[randomIndex];
    setDomain(pick.domain);
    setPrompt(pick.prompt);
    void createScenario(pick.prompt, pick.domain, { type: 'generated', label: 'Surprise me' });
  };

  const handleSearchOnline = async (event) => {
    event.preventDefault();
    if (isSearching) return;
    setIsSearching(true);
    setSourceError('');
    setSourceErrors([]);
    setOnlineResults([]);
    try {
      const { results, errors } = await searchOnlineScenarios(onlineQuery);
      setOnlineResults(results);
      setSourceErrors(errors);
      if (results.length === 0) setSourceError('No matching public scenarios were found. Try another topic.');
    } catch (error) {
      setSourceError(error.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleImportUrl = async (event) => {
    event.preventDefault();
    if (isSearching) return;
    setIsSearching(true);
    setSourceError('');
    try {
      const result = await fetchScenarioSource(sourceUrl);
      setIsSearching(false);
      await createScenario(result.prompt, 'Internet import', {
        type: 'internet',
        label: result.source,
        url: result.url,
        title: result.title
      });
    } catch (error) {
      setSourceError(`Could not import this URL: ${error.message}`);
      setIsSearching(false);
    }
  };

  const handleCreateFromResult = async (result) => {
    setSourceError('');
    await createScenario(result.prompt, 'Internet discovery', {
      type: 'internet',
      label: result.source,
      url: result.url,
      title: result.title
    });
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

        <div style={{
          padding: '10px 22px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <button type="button" onClick={() => { setSourceMode('generate'); setSourceError(''); }} className={sourceMode === 'generate' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}>
            <Wand2 size={13} /> Generate
          </button>
          <button type="button" onClick={() => { setSourceMode('internet'); setSourceError(''); }} className={sourceMode === 'internet' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}>
            <Search size={13} /> Find online
          </button>
          <button type="button" onClick={handleSurpriseMe} disabled={isGenerating} className="btn btn-secondary btn-sm">
            <Dice5 size={13} /> Surprise me
          </button>
          <button type="button" onClick={() => { onClose(); onOpenManual?.(); }} className="btn btn-secondary btn-sm">
            <Link2 size={13} /> Add manually
          </button>
        </div>

        {/* Generator Form */}
        {sourceMode === 'generate' ? <form onSubmit={handleGenerate} style={{
          padding: '20px 22px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {sourceError && (
            <div role="alert" style={{ color: '#fca5a5', fontSize: '0.78rem', lineHeight: 1.5 }}>{sourceError}</div>
          )}
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
        </form> : (
          <div style={{ padding: '20px 22px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <h4 style={{ color: 'var(--text-primary)', fontSize: '0.92rem', marginBottom: 4 }}>Discover a public source</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.76rem', lineHeight: 1.5 }}>
                Search GitHub, Stack Overflow, and Wikipedia, then use a result as context for a complete practice scenario.
              </p>
            </div>
            <form onSubmit={handleSearchOnline} style={{ display: 'flex', gap: 8 }}>
              <input
                value={onlineQuery}
                onChange={event => setOnlineQuery(event.target.value)}
                placeholder="e.g. parking system, ride sharing, rate limiter"
                disabled={isSearching || isGenerating}
                required
                style={{ flex: 1, minWidth: 0 }}
              />
              <button type="submit" className="btn btn-primary btn-sm" disabled={isSearching || isGenerating}>
                <Search size={13} /> {isSearching ? 'Searching...' : 'Search'}
              </button>
            </form>
            <form onSubmit={handleImportUrl} style={{ display: 'flex', gap: 8 }}>
              <input
                type="url"
                value={sourceUrl}
                onChange={event => setSourceUrl(event.target.value)}
                placeholder="Or paste a public URL (GitHub repositories supported)"
                disabled={isSearching || isGenerating}
                required
                style={{ flex: 1, minWidth: 0 }}
              />
              <button type="submit" className="btn btn-secondary btn-sm" disabled={isSearching || isGenerating}>
                <Link2 size={13} /> Import URL
              </button>
            </form>
            {sourceError && (
              <div role="alert" style={{ color: '#fca5a5', fontSize: '0.78rem', lineHeight: 1.5 }}>{sourceError}</div>
            )}
            {sourceErrors.length > 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                Some sources could not be searched: {sourceErrors.join(' · ')}
              </div>
            )}
            {onlineResults.map((result, index) => (
              <article key={`${result.url}-${index}`} style={{
                padding: 12,
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-tertiary)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: 'var(--accent-indigo)', fontSize: '0.68rem', marginBottom: 3 }}>{result.source}</div>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '0.82rem', marginBottom: 3 }}>{result.title}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', lineHeight: 1.4 }}>{result.description}</p>
                  <a href={result.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 5 }}>
                    View source <ExternalLink size={10} />
                  </a>
                </div>
                <button type="button" onClick={() => handleCreateFromResult(result)} disabled={isGenerating} className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>
                  <Wand2 size={12} /> Use
                </button>
              </article>
            ))}
            {isGenerating && (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{genStep || 'Building scenario...'}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
