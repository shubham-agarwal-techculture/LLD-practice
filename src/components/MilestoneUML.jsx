import React, { useState } from 'react';
import { GitBranch, Copy, Check, Sparkles } from 'lucide-react';

export default function MilestoneUML({ scenario, onProceedNext, onProceedPrev }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('visual');
  const mermaidCode = scenario.classDiagram?.mermaid || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(mermaidCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const entities = scenario.entities?.coreEntities || [];
  const lastEntity = entities[entities.length - 1];
  const firstEntity = entities[0];

  return (
    <div className="flex-col gap-6">

      {/* Stage Header */}
      <div className="stage-header" style={{
        background: 'var(--surface-cyan)',
        border: '1px solid rgba(6,182,212,0.3)',
        borderRadius: 10,
        padding: 20
      }}>
        <div className="stage-header-title">
          <GitBranch size={18} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
          <h3>Stage 3 — Class Hierarchy, Relationships & UML</h3>
        </div>
        <p>
          Visualize object-oriented relationships and structural blueprints. Orchestrators,
          abstract entities, strategy interfaces, and composition hierarchies are all captured here.
        </p>
      </div>

      {/* UML Viewer Card */}
      <div className="card flex-col gap-4">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('visual')}
              className={activeTab === 'visual' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
            >
              Architecture Overview
            </button>
            <button
              onClick={() => setActiveTab('mermaid')}
              className={activeTab === 'mermaid' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
            >
              Mermaid Source
            </button>
          </div>
          <button onClick={handleCopy} className="btn btn-secondary btn-sm">
            {copied
              ? <><Check size={13} style={{ color: 'var(--accent-emerald)' }} /> Copied!</>
              : <><Copy size={13} /> Copy Mermaid</>}
          </button>
        </div>

        {activeTab === 'visual' ? (
          <div className="flex-col gap-4">
            {/* Architecture cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
              <div className="card-indigo" style={{ borderRadius: 8, padding: 16 }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--deco-indigo)', letterSpacing: '0.06em', marginBottom: 6 }}>
                  ROOT ORCHESTRATOR · SINGLETON
                </div>
                <h4 style={{ fontSize: '0.95rem', marginBottom: 4, color: 'var(--text-primary)' }}>
                  {lastEntity?.name || 'Manager'}
                </h4>
                <p style={{ fontSize: '0.77rem', color: 'var(--text-secondary)' }}>
                  Thread-safe entry point. Orchestrates strategy plugins and maintains core collections.
                </p>
              </div>

              <div className="card-emerald" style={{ borderRadius: 8, padding: 16 }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-emerald)', letterSpacing: '0.06em', marginBottom: 6 }}>
                  STRATEGY INTERFACE · OPEN/CLOSED
                </div>
                <h4 style={{ fontSize: '0.95rem', marginBottom: 4, color: 'var(--text-primary)' }}>
                  {scenario.designPatterns?.[0]?.appliedTo || 'Strategy Interface'}
                </h4>
                <p style={{ fontSize: '0.77rem', color: 'var(--text-secondary)' }}>
                  Enables swappable policies without modifying orchestrator internals.
                </p>
              </div>

              <div className="card-amber" style={{ borderRadius: 8, padding: 16 }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-amber)', letterSpacing: '0.06em', marginBottom: 6 }}>
                  DOMAIN HIERARCHY · POLYMORPHISM
                </div>
                <h4 style={{ fontSize: '0.95rem', marginBottom: 4, color: 'var(--text-primary)' }}>
                  {firstEntity?.name || 'Base Entity'}
                </h4>
                <p style={{ fontSize: '0.77rem', color: 'var(--text-secondary)' }}>
                  Abstract base extended by specialized concrete sub-types with overridden contracts.
                </p>
              </div>
            </div>

            {/* Mermaid preview */}
            <div className="code-block" style={{ maxHeight: 300, overflowY: 'auto' }}>
              <pre style={{ fontSize: '0.78rem', whiteSpace: 'pre' }}>{mermaidCode}</pre>
            </div>
          </div>
        ) : (
          <div className="code-block" style={{ maxHeight: 420, overflowY: 'auto' }}>
            <pre style={{ fontSize: '0.82rem', whiteSpace: 'pre', color: 'var(--deco-indigo)' }}>{mermaidCode}</pre>
          </div>
        )}

        {/* Relationship Legend */}
        <div className="card-raised" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: 10,
          fontSize: '0.75rem'
        }}>
          {[
            { sym: '──▶', label: 'Inheritance', desc: '"is-a" (Car is a Vehicle)', color: 'var(--accent-indigo)' },
            { sym: '··▶', label: 'Realization', desc: 'Implements interface contract', color: 'var(--accent-emerald)' },
            { sym: '◆──', label: 'Composition', desc: 'Child dies with parent', color: 'var(--accent-amber)' },
            { sym: '◇──', label: 'Aggregation', desc: 'Weak: strategy injected', color: 'var(--accent-cyan)' },
          ].map(rel => (
            <div key={rel.label}>
              <span className="font-mono" style={{ color: rel.color, fontWeight: 700 }}>{rel.sym} {rel.label}</span>
              <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>{rel.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button onClick={onProceedPrev} className="btn btn-secondary">← Domain Entities</button>
        <button onClick={onProceedNext} className="btn btn-primary">Next: Design Patterns →</button>
      </div>
    </div>
  );
}
