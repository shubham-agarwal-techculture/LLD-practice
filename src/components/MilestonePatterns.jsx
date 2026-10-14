import React, { useState } from 'react';
import { Cpu, ShieldCheck, AlertOctagon, CheckCircle2, Sparkles, Scale } from 'lucide-react';

export default function MilestonePatterns({ scenario, onProceedNext, onProceedPrev }) {
  const [revealedAntiPattern, setRevealedAntiPattern] = useState(false);

  const patterns = scenario.designPatterns || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Stage Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Sparkles size={18} color="#fbbf24" />
          <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Stage 4: Design Patterns Selection & Trade-Off Analysis</h3>
        </div>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
          Design patterns are reusable solutions to common recurring problems. But senior engineering interviews require explaining <em>why</em> a pattern was chosen and what trade-offs it introduces versus alternatives.
        </p>
      </div>

      {/* Patterns Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {patterns.map((item, idx) => (
          <div
            key={idx}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={18} color="#6366f1" />
                <h4 style={{ fontSize: '1rem', color: '#fff' }}>{item.pattern}</h4>
              </div>
              <span className="badge badge-primary">
                Applied To: {item.appliedTo}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Why Chosen */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>
                  <CheckCircle2 size={15} /> Why This Pattern is Superior
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  {item.whyChosen}
                </p>
              </div>

              {/* Trade-offs & Alternatives */}
              <div style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>
                  <Scale size={15} /> Trade-offs vs Alternatives
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  {item.alternatives}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Anti-Patterns Warning Alert */}
      <div style={{
        background: 'rgba(244, 63, 94, 0.08)',
        border: '1px solid rgba(244, 63, 94, 0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fb7185', marginBottom: '8px' }}>
          <AlertOctagon size={18} />
          <h4 style={{ fontSize: '0.95rem', color: '#fff' }}>Common Anti-Patterns to Avoid</h4>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '12px' }}>
          Avoid the <strong>God Object Anti-Pattern</strong> where one class knows too much and does too much (violating Single Responsibility). Also avoid <strong>Premature Synchronization</strong> that serializes the entire system throughput.
        </p>

        {!revealedAntiPattern ? (
          <button
            onClick={() => setRevealedAntiPattern(true)}
            className="btn btn-secondary btn-sm"
          >
            Reveal 3 Red Flags Interviewers Dislike
          </button>
        ) : (
          <ul style={{ paddingLeft: '18px', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li><strong style={{ color: '#fda4af' }}>Red Flag 1:</strong> Using public static mutable fields without thread locks (data race hazards).</li>
            <li><strong style={{ color: '#fda4af' }}>Red Flag 2:</strong> Calling external payment or hardware network APIs inside synchronized blocks (locks held during network timeouts!).</li>
            <li><strong style={{ color: '#fda4af' }}>Red Flag 3:</strong> Hardcoding strings like "CAR", "BIKE" in if-else trees rather than using typed Enums or Polymorphism.</li>
          </ul>
        )}
      </div>

      {/* Navigation Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onProceedPrev} className="btn btn-secondary">
          ← Back: Class UML
        </button>
        <button onClick={onProceedNext} className="btn btn-primary">
          Next: Production Code & Live Simulator →
        </button>
      </div>
    </div>
  );
}
