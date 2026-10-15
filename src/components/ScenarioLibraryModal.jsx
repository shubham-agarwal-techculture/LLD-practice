import React, { useState } from 'react';
import { X, Search, CheckCircle, ArrowRight, Trash2, Plus } from 'lucide-react';
import { LLD_SCENARIOS } from '../data/scenarios';

export default function ScenarioLibraryModal({
  isOpen,
  onClose,
  onSelectScenario,
  currentScenarioId,
  solvedMap,
  customScenarios = [],
  onDeleteCustomScenario,
  onOpenGenerator
}) {
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState('ALL');

  if (!isOpen) return null;

  const allScenarios = [...customScenarios, ...LLD_SCENARIOS];
  const filtered = allScenarios.filter(s => {
    const q = search.toLowerCase();
    const matchesSearch = s.title.toLowerCase().includes(q) ||
      s.company.toLowerCase().includes(q) ||
      s.tags.some(t => t.toLowerCase().includes(q));
    if (filterTab === 'CURATED') return matchesSearch && !s.isCustom;
    if (filterTab === 'ON-DEMAND') return matchesSearch && s.isCustom;
    return matchesSearch;
  });

  const tabs = [
    { id: 'ALL', label: `All (${allScenarios.length})` },
    { id: 'CURATED', label: `Curated (${LLD_SCENARIOS.length})` },
    { id: 'ON-DEMAND', label: `Custom (${customScenarios.length})` },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-box modal-box-lg"
        style={{ maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="flex items-center gap-2">
              <h2>Scenario Registry</h2>
              <span className="mono-tag">{allScenarios.length} specs</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Curated FAANG blueprints + your on-demand synthesized problems
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { onClose(); onOpenGenerator(); }}
              className="btn btn-primary btn-sm"
            >
              <Plus size={13} /> New Custom
            </button>
            <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          padding: '12px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          background: 'var(--bg-raised)'
        }}>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <Search size={13} style={{
              position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-muted)', pointerEvents: 'none'
            }} />
            <input
              type="text"
              placeholder="Search by title, company, or pattern…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 32 }}
            />
          </div>
          <div className="flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={filterTab === tab.id ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scenario list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: '0.84rem' }}>
              No scenarios found. Try a different search or create one on-demand!
            </div>
          ) : filtered.map(s => {
            const isCurrent = s.id === currentScenarioId;
            const isSolved = !!solvedMap?.[s.id];
            const diffClass = s.difficulty === 'Easy' ? 'badge-easy' : s.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard';

            return (
              <div
                key={s.id}
                style={{
                  padding: '14px 16px',
                  borderRadius: 8,
                  background: isCurrent ? 'var(--surface-indigo)' : 'var(--bg-raised)',
                  border: `1px solid ${isCurrent ? 'var(--border-indigo)' : 'var(--border-subtle)'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 14,
                  transition: 'all 0.15s'
                }}
              >
                <div className="flex-col gap-2" style={{ flex: 1 }}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`badge ${diffClass}`}>{s.difficulty}</span>
                    <span className="badge badge-company">{s.company}</span>
                    {s.isCustom && (
                      <span className="mono-tag" style={{ color: 'var(--accent-emerald)', borderColor: 'var(--border-emerald)' }}>
                        {s.sourceMetadata?.label || 'custom'}
                      </span>
                    )}
                    {isSolved && (
                      <span className="mono-tag" style={{ color: 'var(--accent-emerald)', borderColor: 'var(--border-emerald)', fontWeight: 700 }}>
                        <CheckCircle size={10} /> solved
                      </span>
                    )}
                  </div>
                  <h4 style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: isCurrent ? 'var(--deco-indigo)' : 'var(--text-primary)'
                  }}>
                    {s.title}
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {s.summary}
                  </p>
                </div>

                <div className="flex gap-2 items-center" style={{ flexShrink: 0 }}>
                  {s.isCustom && onDeleteCustomScenario && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        if (window.confirm(`Delete "${s.title}"?`)) onDeleteCustomScenario(s.id);
                      }}
                      className="btn btn-danger btn-sm btn-icon"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                  <button
                    onClick={() => { onSelectScenario(s); onClose(); }}
                    className={isCurrent ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm'}
                  >
                    {isCurrent ? 'Active' : 'Load'} <ArrowRight size={12} />
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
