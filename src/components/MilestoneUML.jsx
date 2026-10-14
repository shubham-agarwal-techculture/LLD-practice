import React, { useState } from 'react';
import { GitBranch, Copy, Check, Info, Sparkles, BookOpen } from 'lucide-react';

export default function MilestoneUML({ scenario, onProceedNext, onProceedPrev }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('visual'); // 'visual' | 'mermaid'

  const mermaidCode = scenario.classDiagram?.mermaid || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(mermaidCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Stage Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%)',
        border: '1px solid rgba(139, 92, 246, 0.25)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Sparkles size={18} color="#c084fc" />
          <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Stage 3: Class Hierarchy, Relationships & UML Diagram</h3>
        </div>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
          Visualize object-oriented relationships and structural blueprints. High-level orchestrators, abstract entities, strategy interfaces, and composition hierarchies.
        </p>
      </div>

      {/* UML Viewer & Tabs */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('visual')}
              className={activeTab === 'visual' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
            >
              Class Architecture Structure
            </button>
            <button
              onClick={() => setActiveTab('mermaid')}
              className={activeTab === 'mermaid' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
            >
              Raw Mermaid.js Definition
            </button>
          </div>

          <button onClick={handleCopy} className="btn btn-secondary btn-sm">
            {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
            {copied ? 'Copied to Clipboard!' : 'Copy Mermaid Code'}
          </button>
        </div>

        {/* Tab 1: Visual Blueprint Cards */}
        {activeTab === 'visual' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '14px'
            }}>
              {/* Orchestrator Card */}
              <div style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: '#a5b4fc', fontWeight: '700' }}>ROOT ORCHESTRATOR (SINGLETON)</span>
                  <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>Controller</span>
                </div>
                <h4 style={{ fontSize: '1rem', color: '#fff' }}>{scenario.entities?.coreEntities[scenario.entities.coreEntities.length - 1]?.name || 'Manager'}</h4>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Maintains thread-safe collections, entry points, and orchestrates strategy plugins.
                </div>
              </div>

              {/* Strategy Interface Card */}
              <div style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: '700' }}>STRATEGY INTERFACE</span>
                  <span className="badge badge-easy" style={{ fontSize: '0.65rem' }}>Open/Closed</span>
                </div>
                <h4 style={{ fontSize: '1rem', color: '#fff' }}>{scenario.designPatterns[0]?.appliedTo || 'Strategy Interface'}</h4>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Enables swappable policies without modifying core orchestrator classes.
                </div>
              </div>

              {/* Domain Entity Hierarchy */}
              <div style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: '700' }}>DOMAIN HIERARCHY</span>
                  <span className="badge badge-medium" style={{ fontSize: '0.65rem' }}>Polymorphism</span>
                </div>
                <h4 style={{ fontSize: '1rem', color: '#fff' }}>{scenario.entities?.coreEntities[0]?.name || 'Base Entity'}</h4>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Abstract base classes extended by specialized concrete sub-types.
                </div>
              </div>
            </div>

            {/* Mermaid Preview Box */}
            <div style={{
              background: 'rgba(9, 13, 22, 0.95)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              color: '#cbd5e1',
              maxHeight: '320px',
              overflowY: 'auto',
              whiteSpace: 'pre'
            }}>
              {mermaidCode}
            </div>
          </div>
        ) : (
          /* Tab 2: Raw Mermaid Code */
          <div style={{
            background: 'rgba(9, 13, 22, 0.95)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.82rem',
            color: '#a5b4fc',
            maxHeight: '400px',
            overflowY: 'auto',
            whiteSpace: 'pre'
          }}>
            {mermaidCode}
          </div>
        )}

        {/* Relationship Legend */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '10px',
          fontSize: '0.76rem'
        }}>
          <div>
            <span style={{ color: '#6366f1', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>──▶ Inheritance</span>
            <div style={{ color: 'var(--text-muted)' }}>"is-a" relationship (e.g. Car is a Vehicle)</div>
          </div>
          <div>
            <span style={{ color: '#10b981', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>··▶ Realization</span>
            <div style={{ color: 'var(--text-muted)' }}>Implements interface contract</div>
          </div>
          <div>
            <span style={{ color: '#f59e0b', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>◆── Composition</span>
            <div style={{ color: 'var(--text-muted)' }}>Strong ownership: child dies if parent dies</div>
          </div>
          <div>
            <span style={{ color: '#06b6d4', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>◇── Aggregation</span>
            <div style={{ color: 'var(--text-muted)' }}>Weak reference: Strategy injected into Manager</div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onProceedPrev} className="btn btn-secondary">
          ← Back: Domain Entities
        </button>
        <button onClick={onProceedNext} className="btn btn-primary">
          Next: Design Patterns & Trade-offs →
        </button>
      </div>
    </div>
  );
}
