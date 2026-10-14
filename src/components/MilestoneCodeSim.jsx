import React, { useState } from 'react';
import { Code2, Play, Copy, Check, Sparkles, Award } from 'lucide-react';
import SimulatorParkingLot from './simulators/SimulatorParkingLot';
import SimulatorSplitwise from './simulators/SimulatorSplitwise';
import SimulatorElevator from './simulators/SimulatorElevator';
import SimulatorRateLimiter from './simulators/SimulatorRateLimiter';
import SimulatorLRUCache from './simulators/SimulatorLRUCache';

export default function MilestoneCodeSim({ scenario, onProceedPrev }) {
  const [activeTab, setActiveTab] = useState('simulator'); // 'simulator' | 'code'
  const [lang, setLang] = useState('java'); // 'java' | 'python'
  const [copied, setCopied] = useState(false);

  const codeMap = scenario.referenceCode || {};
  const currentCode = codeMap[lang] || codeMap.java || '// Implementation available in Java and Python';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderSimulator = () => {
    const simType = scenario.simulatorType || 'parking-lot';
    switch (simType) {
      case 'splitwise':
        return <SimulatorSplitwise />;
      case 'elevator':
        return <SimulatorElevator />;
      case 'rate-limiter':
        return <SimulatorRateLimiter />;
      case 'lru-cache':
        return <SimulatorLRUCache />;
      case 'parking-lot':
      default:
        return <SimulatorParkingLot />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Stage Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
        border: '1px solid var(--border-glow)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Sparkles size={18} color="#6366f1" />
            <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Stage 5: Production Implementation & Live Runtime Simulator</h3>
          </div>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            Experience your low-level design running live in memory or inspect the production-grade multi-threaded reference code.
          </p>
        </div>

        {/* View Toggle */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('simulator')}
            className={activeTab === 'simulator' ? 'btn btn-primary' : 'btn btn-secondary'}
            id="tab-btn-simulator"
          >
            <Play size={15} /> Interactive Simulator
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={activeTab === 'code' ? 'btn btn-primary' : 'btn btn-secondary'}
            id="tab-btn-code"
          >
            <Code2 size={15} /> Production Code
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'simulator' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {renderSimulator()}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Code Viewer Panel */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden'
          }}>
            {/* Code Header Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 18px',
              background: 'rgba(9, 13, 22, 0.95)',
              borderBottom: '1px solid var(--border-subtle)',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setLang('java')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: lang === 'java' ? '1px solid #6366f1' : '1px solid transparent',
                    background: lang === 'java' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255,255,255,0.04)',
                    color: lang === 'java' ? '#a5b4fc' : 'var(--text-secondary)',
                    fontWeight: '600',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  ☕ Java (Thread-Safe)
                </button>
                <button
                  onClick={() => setLang('python')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: lang === 'python' ? '1px solid #10b981' : '1px solid transparent',
                    background: lang === 'python' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255,255,255,0.04)',
                    color: lang === 'python' ? '#34d399' : 'var(--text-secondary)',
                    fontWeight: '600',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  🐍 Python 3
                </button>
              </div>

              <button onClick={handleCopyCode} className="btn btn-secondary btn-sm">
                {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>

            {/* Syntax Display */}
            <div style={{
              padding: '20px',
              background: '#090d16',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.84rem',
              lineHeight: '1.65',
              overflowX: 'auto',
              maxHeight: '560px',
              color: '#cbd5e1'
            }}>
              <pre>
                <code>{currentCode}</code>
              </pre>
            </div>
          </div>

          {/* SOLID Principles Compliance Audit */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} color="#10b981" />
              <h4 style={{ fontSize: '0.95rem', color: '#fff' }}>SOLID Principles Architectural Audit</h4>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
              <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'rgba(9, 13, 22, 0.7)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: '#6ee7b7', fontWeight: '700', fontSize: '0.82rem' }}>S — Single Responsibility</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Controllers orchestrate, models store domain invariants, strategies compute policies.
                </div>
              </div>

              <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'rgba(9, 13, 22, 0.7)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: '#6ee7b7', fontWeight: '700', fontSize: '0.82rem' }}>O — Open/Closed Principle</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  New vehicle types, pricing formulas, or dispatch rules plug in without changing core classes.
                </div>
              </div>

              <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'rgba(9, 13, 22, 0.7)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: '#6ee7b7', fontWeight: '700', fontSize: '0.82rem' }}>L — Liskov Substitution</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Subclasses satisfy contracts cleanly without violating invariants or throwing UnsupportedOperationException.
                </div>
              </div>

              <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'rgba(9, 13, 22, 0.7)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: '#6ee7b7', fontWeight: '700', fontSize: '0.82rem' }}>I & D — Interface Segregation & DIP</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Narrow, client-tailored interfaces injected via constructors rather than hard concrete instantiations.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <button onClick={onProceedPrev} className="btn btn-secondary">
          ← Back: Design Patterns
        </button>
      </div>
    </div>
  );
}
