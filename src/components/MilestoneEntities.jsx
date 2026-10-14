import React, { useState } from 'react';
import { UserCheck, ArrowRight, Sparkles } from 'lucide-react';

export default function MilestoneEntities({ scenario, onProceedNext, onProceedPrev }) {
  const [selectedEntity, setSelectedEntity] = useState(0);

  const actors = scenario.entities?.actors || [];
  const entities = scenario.entities?.coreEntities || [];
  const currentEntity = entities[selectedEntity] || entities[0];

  return (
    <div className="flex-col gap-6">

      {/* Stage Header */}
      <div className="stage-header card-emerald">
        <div className="stage-header-title">
          <Sparkles size={18} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
          <h3>Stage 2 — Actors, Entities & Domain Modeling</h3>
        </div>
        <p>
          Identify key actors interacting with the system, separate data models from behavior,
          and assign single responsibilities. Select any entity to inspect its attributes,
          methods, and structural relationships.
        </p>
      </div>

      {/* Actors */}
      <div className="card">
        <div className="flex items-center gap-2" style={{ marginBottom: '14px' }}>
          <UserCheck size={17} style={{ color: 'var(--deco-indigo)' }} />
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Identified Actors</h4>
          <span className="mono-tag" style={{ marginLeft: 'auto', fontSize: '0.68rem' }}>
            {actors.length} actors
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
          {actors.map((actor, idx) => (
            <div key={idx} className="card-raised" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: '1rem' }}>👤</span>
                <span style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-primary)' }}>{actor.name}</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{actor.role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Entity Explorer */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '16px' }}>

        {/* Selector */}
        <div className="card" style={{ padding: '14px' }}>
          <div className="section-label">Domain Classes ({entities.length})</div>
          <div className="flex-col gap-1">
            {entities.map((ent, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedEntity(idx)}
                className={`entity-selector-btn${selectedEntity === idx ? ' selected' : ''}`}
              >
                <span>{ent.name}</span>
                {selectedEntity === idx && <ArrowRight size={13} />}
              </button>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        {currentEntity && (
          <div className="card flex-col gap-5">
            <div>
              <span className="badge badge-primary" style={{ marginBottom: '8px', display: 'inline-flex' }}>{currentEntity.name}</span>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {currentEntity.description}
              </p>
            </div>

            {/* Attributes */}
            <div>
              <div className="section-label">Attributes & State Fields</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '7px' }}>
                {currentEntity.attributes?.map((attr, i) => (
                  <div key={i} className="attr-chip">{attr}</div>
                ))}
              </div>
            </div>

            {/* Methods */}
            <div>
              <div className="section-label">Methods & Behavior</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '7px' }}>
                {currentEntity.methods?.map((m, i) => (
                  <div key={i} className="method-chip">{m}</div>
                ))}
              </div>
            </div>

            {/* Relationships */}
            {currentEntity.relationships?.length > 0 && (
              <div className="card-indigo" style={{ padding: '12px 16px', borderRadius: 8 }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--deco-indigo)', marginBottom: '6px' }}>
                  🔗 Relationships & Dependencies
                </div>
                <ul style={{ paddingLeft: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {currentEntity.relationships.map((rel, i) => <li key={i}>{rel}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button onClick={onProceedPrev} className="btn btn-secondary">← Clarify Requirements</button>
        <button onClick={onProceedNext} className="btn btn-primary">Next: Class UML →</button>
      </div>
    </div>
  );
}
