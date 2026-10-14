import React, { useState } from 'react';
import { X, Search, CheckCircle, ArrowRight } from 'lucide-react';
import { LLD_SCENARIOS } from '../data/scenarios';

export default function ScenarioLibraryModal({ isOpen, onClose, onSelectScenario, currentScenarioId, solvedMap }) {
  const [search, setSearch] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('ALL');

  if (!isOpen) return null;

  const filtered = LLD_SCENARIOS.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.company.toLowerCase().includes(search.toLowerCase()) ||
      s.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesDiff = filterDifficulty === 'ALL' || s.difficulty.toUpperCase() === filterDifficulty;
    return matchesSearch && matchesDiff;
  });

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      zIndex: 1100
    }}>
      <div style={{
        width: '760px',
        maxWidth: '100%',
        maxHeight: '85vh',
        background: 'rgba(15, 23, 42, 0.98)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>Curated LLD Scenario Library</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Practice any daily low-level design problem from top tech companies.
            </p>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Filters */}
        <div style={{
          padding: '14px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          background: 'rgba(9, 13, 22, 0.5)'
        }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search by topic, company, or pattern..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-medium)',
                background: '#090d16',
                color: '#fff',
                fontSize: '0.82rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {['ALL', 'EASY', 'MEDIUM', 'HARD'].map(diff => (
              <button
                key={diff}
                onClick={() => setFilterDifficulty(diff)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: filterDifficulty === diff ? '1px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                  background: filterDifficulty === diff ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)',
                  color: filterDifficulty === diff ? '#a5b4fc' : 'var(--text-secondary)',
                  fontSize: '0.74rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Scenario List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {filtered.map(s => {
            const isCurrent = s.id === currentScenarioId;
            const isSolved = !!solvedMap?.[s.id];

            return (
              <div
                key={s.id}
                onClick={() => {
                  onSelectScenario(s);
                  onClose();
                }}
                id={`scenario-card-${s.id}`}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  background: isCurrent ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                  border: isCurrent ? '1px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '14px',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span className={`badge ${s.difficulty === 'Easy' ? 'badge-easy' : s.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard'}`}>
                      {s.difficulty}
                    </span>
                    <span className="badge badge-company">{s.company}</span>
                    {isSolved && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#34d399', fontWeight: '700' }}>
                        <CheckCircle size={14} /> Solved
                      </span>
                    )}
                  </div>

                  <h4 style={{ fontSize: '0.98rem', color: isCurrent ? '#a5b4fc' : '#fff' }}>
                    Day {s.dayIndex}: {s.title}
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {s.summary}
                  </p>
                </div>

                <div style={{ flexShrink: 0 }}>
                  <button className="btn btn-secondary btn-sm" style={{ padding: '6px 12px', fontSize: '0.76rem' }}>
                    {isCurrent ? 'Practicing' : 'Select'} <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
