import React, { useState } from 'react';
import { Calendar, Briefcase, Clock, Check, Terminal, ChevronDown, ChevronUp, Columns, BookOpen, PenTool } from 'lucide-react';

export default function DailyBanner({
  scenario,
  currentStage,
  onSelectStage,
  isSolved = false,
  viewMode = 'split',
  onSelectViewMode
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const todayDate = new Date().toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  const stages = [
    { id: 0, code: '01', label: 'SCOPE' },
    { id: 1, code: '02', label: 'ENTITIES' },
    { id: 2, code: '03', label: 'CLASS UML' },
    { id: 3, code: '04', label: 'PATTERNS' },
    { id: 4, code: '05', label: 'CODE & SIM' },
  ];

  const specCode = scenario.isCustom ? 'ON-DEMAND' : `SPEC-D0${scenario.dayIndex || 1}`;
  const diffClass = scenario.difficulty === 'Easy' ? 'badge-easy'
    : scenario.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard';

  return (
    <div className="banner">
      <div className="banner-body">
        {/* Top meta & layout controls row */}
        <div className="banner-meta">
          <div className="banner-meta-left">
            <span className="mono-tag" style={{ color: 'var(--deco-indigo)', borderColor: 'var(--border-indigo)' }}>
              <Terminal size={11} />
              {specCode}
            </span>

            <span className={`badge ${diffClass}`}>
              {scenario.difficulty}
            </span>

            <span className="badge badge-company">
              <Briefcase size={10} />
              {scenario.company}
            </span>

            {scenario.isCustom ? (
              <span className="mono-tag" style={{ color: 'var(--accent-emerald)', borderColor: 'var(--border-emerald)' }}>
                ✦ ON-DEMAND
              </span>
            ) : (
              <span className="mono-tag">
                <Calendar size={10} />
                {todayDate}
              </span>
            )}

            {isSolved && (
              <span className="mono-tag" style={{ color: 'var(--accent-emerald)', borderColor: 'var(--border-emerald)', fontWeight: 700 }}>
                <Check size={10} />
                SOLVED
              </span>
            )}

            <span className="mono-tag">
              <Clock size={10} />
              {scenario.estimatedTime || '45m'}
            </span>
          </div>

          {/* Layout Mode Switcher */}
          {onSelectViewMode && (
            <div className="view-mode-toggle">
              <button
                type="button"
                onClick={() => onSelectViewMode('split')}
                className={`view-mode-btn${viewMode === 'split' ? ' active' : ''}`}
                title="Side-by-side Guided Journey and Solution Workbench"
              >
                <Columns size={12} />
                <span>Split Studio</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectViewMode('guide')}
                className={`view-mode-btn${viewMode === 'guide' ? ' active' : ''}`}
                title="Full-width view of architectural specs & diagrams"
              >
                <BookOpen size={12} />
                <span>Guide Focus</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectViewMode('workbench')}
                className={`view-mode-btn${viewMode === 'workbench' ? ' active' : ''}`}
                title="Full-width solution drafting and rubric scoring"
              >
                <PenTool size={12} />
                <span>Workbench</span>
              </button>
            </div>
          )}
        </div>

        {/* Title & Context Brief */}
        <div className="flex-col gap-2">
          <div className="flex justify-between items-start gap-4 flex-wrap">
            <h2 className="banner-title" style={{ fontSize: '1.25rem' }}>{scenario.title}</h2>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.72rem', padding: '4px 8px', borderRadius: 6 }}
            >
              {isExpanded ? <><ChevronUp size={12} /> Less</> : <><ChevronDown size={12} /> Details</>}
            </button>
          </div>

          <p className="banner-summary" style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
            {scenario.summary}
          </p>

          {isExpanded && scenario.realWorldContext && (
            <div className="card-raised" style={{ marginTop: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Industry Context: </strong>
              {scenario.realWorldContext}
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="banner-tags" style={{ marginTop: '2px' }}>
          {scenario.tags?.map((t, i) => (
            <span key={i} className="mono-tag" style={{ fontSize: '0.7rem' }}>#{t}</span>
          ))}
        </div>
      </div>

      {/* Stage Stepper Tab Bar */}
      <div className="stage-bar">
        {stages.map(st => {
          const isActive = currentStage === st.id;
          const isPassed = currentStage > st.id;
          return (
            <button
              key={st.id}
              onClick={() => onSelectStage(st.id)}
              id={`stage-tab-${st.id}`}
              className={`stage-tab${isActive ? ' active' : isPassed ? ' passed' : ''}`}
            >
              {isPassed ? <Check size={11} /> : <span style={{ opacity: 0.5 }}>{st.code}</span>}
              <span>{st.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
