import React, { useState } from 'react';
import { Code2, Play, Copy, Check, Sparkles, Award } from 'lucide-react';
import SimulatorParkingLot from './simulators/SimulatorParkingLot';
import SimulatorSplitwise from './simulators/SimulatorSplitwise';
import SimulatorElevator from './simulators/SimulatorElevator';
import SimulatorRateLimiter from './simulators/SimulatorRateLimiter';
import SimulatorLRUCache from './simulators/SimulatorLRUCache';
import SimulatorVendingMachine from './simulators/SimulatorVendingMachine';
import SimulatorBookMyShow from './simulators/SimulatorBookMyShow';

export default function MilestoneCodeSim({ scenario, onProceedPrev }) {
  const [activeTab, setActiveTab] = useState('simulator');
  const [lang, setLang] = useState('java');
  const [copied, setCopied] = useState(false);

  const codeMap = scenario.referenceCode || {};
  const currentCode = codeMap[lang] || codeMap.java || '// Implementation available in Java and Python';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderSimulator = () => {
    switch (scenario.simulatorType) {
      case 'splitwise':        return <SimulatorSplitwise />;
      case 'elevator':         return <SimulatorElevator />;
      case 'rate-limiter':     return <SimulatorRateLimiter />;
      case 'lru-cache':        return <SimulatorLRUCache />;
      case 'vending-machine':  return <SimulatorVendingMachine />;
      case 'bookmyshow':       return <SimulatorBookMyShow />;
      default:                 return <SimulatorParkingLot />;
    }
  };

  const solidPrinciples = [
    { letter: 'S', label: 'Single Responsibility', desc: 'Controllers orchestrate, models store invariants, strategies compute policies.' },
    { letter: 'O', label: 'Open/Closed', desc: 'New vehicle types or pricing rules plug in without changing core classes.' },
    { letter: 'L', label: 'Liskov Substitution', desc: 'Subclasses satisfy contracts cleanly without violating invariants.' },
    { letter: 'I·D', label: 'Interface Segregation & DIP', desc: 'Narrow interfaces injected via constructors, not hard concrete instantiations.' },
  ];

  return (
    <div className="flex-col gap-6">

      {/* Stage Header */}
      <div className="card flex justify-between items-center flex-wrap gap-4"
        style={{ background: 'var(--surface-indigo)', border: '1px solid var(--border-indigo)' }}>
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
            <Sparkles size={18} style={{ color: 'var(--deco-indigo)' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Stage 5 — Production Code & Live Runtime Simulator
            </h3>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Experience your design running live in memory or inspect the multi-threaded reference implementation.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('simulator')}
            className={activeTab === 'simulator' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
            id="tab-btn-simulator"
          >
            <Play size={14} /> Simulator
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={activeTab === 'code' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
            id="tab-btn-code"
          >
            <Code2 size={14} /> Reference Code
          </button>
        </div>
      </div>

      {activeTab === 'simulator' ? (
        <div>{renderSimulator()}</div>
      ) : (
        <div className="flex-col gap-5">
          {/* Code viewer */}
          <div className="sim-panel">
            <div className="sim-panel-header">
              <div className="flex gap-2">
                <button
                  onClick={() => setLang('java')}
                  className={lang === 'java' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                >
                  ☕ Java
                </button>
                <button
                  onClick={() => setLang('python')}
                  className={lang === 'python' ? 'btn btn-success btn-sm' : 'btn btn-secondary btn-sm'}
                >
                  🐍 Python
                </button>
              </div>
              <button onClick={handleCopyCode} className="btn btn-secondary btn-sm">
                {copied
                  ? <><Check size={13} style={{ color: 'var(--accent-emerald)' }} /> Copied!</>
                  : <><Copy size={13} /> Copy Code</>}
              </button>
            </div>
            <div className="code-block" style={{
              maxHeight: 560,
              overflowY: 'auto',
              borderRadius: 0,
              border: 'none',
              borderTop: '1px solid var(--border-subtle)'
            }}>
              <pre><code>{currentCode}</code></pre>
            </div>
          </div>

          {/* SOLID Audit */}
          <div className="card">
            <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
              <Award size={17} style={{ color: 'var(--accent-emerald)' }} />
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                SOLID Principles Audit
              </h4>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
              {solidPrinciples.map(p => (
                <div key={p.letter} className="card-raised">
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: 4 }}>
                    {p.letter} — {p.label}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {p.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div>
        <button onClick={onProceedPrev} className="btn btn-secondary">← Design Patterns</button>
      </div>
    </div>
  );
}
