import React, { useState } from 'react';
import { UserCheck, Layers, ArrowRight, Code2, Sparkles, BookOpen } from 'lucide-react';

export default function MilestoneEntities({ scenario, onProceedNext, onProceedPrev }) {
  const [selectedEntity, setSelectedEntity] = useState(0);

  const actors = scenario.entities?.actors || [];
  const entities = scenario.entities?.coreEntities || [];
  const currentEntity = entities[selectedEntity] || entities[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Stage Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Sparkles size={18} color="#34d399" />
          <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Stage 2: Actors, Entities & Domain Modeling</h3>
        </div>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
          Identify the key actors interacting with the system, separate data models from behavior, and assign single responsibilities. Select any entity below to inspect its attributes, methods, and relationships.
        </p>
      </div>

      {/* Actors Section */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <UserCheck size={18} color="#a5b4fc" />
          <h4 style={{ fontSize: '0.95rem', color: '#fff' }}>Identified Actors (Who triggers actions?)</h4>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          {actors.map((actor, idx) => (
            <div
              key={idx}
              style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(9, 13, 22, 0.7)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.1rem' }}>👤</span>
                <span style={{ fontWeight: '600', fontSize: '0.9rem', color: '#cbd5e1' }}>{actor.name}</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                {actor.role}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Core Domain Entities Explorer (Split Screen) */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px' }}>
        {/* Entity Selector List */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            Domain Classes ({entities.length})
          </div>

          {entities.map((ent, idx) => {
            const isSelected = selectedEntity === idx;
            return (
              <button
                key={idx}
                onClick={() => setSelectedEntity(idx)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: isSelected ? '1px solid var(--accent-indigo)' : '1px solid transparent',
                  background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.02)',
                  color: isSelected ? '#a5b4fc' : '#cbd5e1',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontWeight: isSelected ? '600' : '400',
                  fontSize: '0.84rem'
                }}
              >
                <span>{ent.name}</span>
                {isSelected && <ArrowRight size={14} color="#818cf8" />}
              </button>
            );
          })}
        </div>

        {/* Selected Entity Deep-Dive Card */}
        {currentEntity && (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span className="badge badge-primary">{currentEntity.name}</span>
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                {currentEntity.description}
              </p>
            </div>

            {/* Attributes Grid */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>
                Key Attributes & State Fields
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                {currentEntity.attributes?.map((attr, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(9, 13, 22, 0.8)',
                      border: '1px solid var(--border-subtle)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.78rem',
                      color: '#6ee7b7'
                    }}
                  >
                    {attr}
                  </div>
                ))}
              </div>
            </div>

            {/* Methods Grid */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>
                Key Methods & Behavior
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                {currentEntity.methods?.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(9, 13, 22, 0.8)',
                      border: '1px solid var(--border-subtle)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.78rem',
                      color: '#93c5fd'
                    }}
                  >
                    {m}
                  </div>
                ))}
              </div>
            </div>

            {/* Relationships & Couplings */}
            {currentEntity.relationships?.length > 0 && (
              <div style={{
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px dashed rgba(99, 102, 241, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px'
              }}>
                <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#a5b4fc', marginBottom: '6px' }}>
                  🔗 Relationships & Structural Dependencies
                </div>
                <ul style={{ paddingLeft: '18px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {currentEntity.relationships.map((rel, idx) => (
                    <li key={idx}>{rel}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onProceedPrev} className="btn btn-secondary">
          ← Back: Clarify Requirements
        </button>
        <button onClick={onProceedNext} className="btn btn-primary">
          Next: Class Design & UML →
        </button>
      </div>
    </div>
  );
}
