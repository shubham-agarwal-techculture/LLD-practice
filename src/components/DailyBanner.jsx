import React from 'react';
import { Calendar, Briefcase, Clock, Tag, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function DailyBanner({
  scenario,
  currentStage,
  onSelectStage,
  isSolved = false
}) {
  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const stages = [
    { id: 0, label: '1. Clarify Scope' },
    { id: 1, label: '2. Domain Entities' },
    { id: 2, label: '3. Class UML' },
    { id: 3, label: '4. Design Patterns' },
    { id: 4, label: '5. Code & Sim' }
  ];

  return (
    <div style={{
      background: 'var(--bg-card)',
      backdropFilter: 'blur(16px)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-xl)',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '18px',
      boxShadow: 'var(--shadow-card)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative gradient orb */}
      <div style={{
        position: 'absolute',
        top: '-40px',
        right: '-40px',
        width: '180px',
        height: '180px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      {/* Top Meta Line: Today's Date & Company Tag */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#a5b4fc', fontWeight: '600' }}>
            <Calendar size={14} />
            <span>TODAY'S SCENARIO • {todayDate}</span>
          </div>

          <span className={`badge ${scenario.difficulty === 'Easy' ? 'badge-easy' : scenario.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard'}`}>
            {scenario.difficulty}
          </span>

          <span className="badge badge-company">
            <Briefcase size={12} /> {scenario.company}
          </span>

          {isSolved && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#34d399', fontWeight: '700' }}>
              <CheckCircle2 size={15} /> SOLVED TODAY
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <Clock size={13} />
          <span>Estimated: {scenario.estimatedTime || '45 mins'}</span>
        </div>
      </div>

      {/* Title & Summary */}
      <div>
        <h2 style={{ fontSize: '1.6rem', color: '#fff', marginBottom: '8px', lineHeight: '1.3' }}>
          {scenario.title}
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '980px', lineHeight: '1.55' }}>
          {scenario.summary}
        </p>
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {scenario.tags?.map((t, idx) => (
          <span
            key={idx}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.72rem',
              color: '#cbd5e1'
            }}
          >
            #{t}
          </span>
        ))}
      </div>

      {/* 5-Step Milestone Navigation Tabs */}
      <div style={{
        marginTop: '6px',
        paddingTop: '16px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '8px'
      }}>
        {stages.map((st) => {
          const isActive = currentStage === st.id;
          const isPassed = currentStage > st.id;

          return (
            <button
              key={st.id}
              onClick={() => onSelectStage(st.id)}
              id={`stage-tab-${st.id}`}
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                border: isActive ? '1px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                background: isActive
                  ? 'rgba(99, 102, 241, 0.22)'
                  : isPassed
                  ? 'rgba(16, 185, 129, 0.08)'
                  : 'rgba(255, 255, 255, 0.02)',
                color: isActive ? '#fff' : isPassed ? '#6ee7b7' : 'var(--text-secondary)',
                fontWeight: isActive ? '700' : '500',
                fontSize: '0.82rem',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              {isPassed && <CheckCircle2 size={13} color="#10b981" />}
              <span>{st.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
