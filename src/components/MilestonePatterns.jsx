import React, { useState } from 'react';
import { Cpu, AlertOctagon, CheckCircle2, Sparkles, Scale } from 'lucide-react';

export default function MilestonePatterns({ scenario, onProceedNext, onProceedPrev }) {
  const [revealedAntiPattern, setRevealedAntiPattern] = useState(false);
  const patterns = scenario.designPatterns || [];

  return (
    <div className="flex-col gap-6">

      {/* Stage Header */}
      <div className="stage-header card-amber">
        <div className="stage-header-title">
          <Sparkles size={18} style={{ color: 'var(--accent-amber)', flexShrink: 0 }} />
          <h3>Stage 4 — Design Patterns & Trade-Off Analysis</h3>
        </div>
        <p>
          Design patterns are reusable solutions to recurring problems. Senior interviews require
          explaining <em>why</em> a pattern was chosen and what trade-offs it introduces versus alternatives.
        </p>
      </div>

      {/* Patterns */}
      <div className="flex-col gap-4">
        {patterns.map((item, idx) => (
          <div key={idx} className="card">
            <div className="flex justify-between items-center flex-wrap gap-2" style={{ marginBottom: '14px' }}>
              <div className="flex items-center gap-2">
                <Cpu size={17} style={{ color: 'var(--accent-indigo)' }} />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.pattern}</h4>
              </div>
              <span className="badge badge-primary">Applied: {item.appliedTo}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="card-emerald" style={{ borderRadius: 8, padding: '14px' }}>
                <div className="flex items-center gap-2" style={{ marginBottom: '8px', color: 'var(--accent-emerald)', fontSize: '0.78rem', fontWeight: 700 }}>
                  <CheckCircle2 size={14} />
                  Why This Pattern is Superior
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {item.whyChosen}
                </p>
              </div>

              <div className="card-amber" style={{ borderRadius: 8, padding: '14px' }}>
                <div className="flex items-center gap-2" style={{ marginBottom: '8px', color: 'var(--accent-amber)', fontSize: '0.78rem', fontWeight: 700 }}>
                  <Scale size={14} />
                  Trade-offs vs Alternatives
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {item.alternatives}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Anti-Patterns */}
      <div className="card-rose" style={{ borderRadius: 10 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: '10px' }}>
          <AlertOctagon size={17} style={{ color: 'var(--accent-rose)' }} />
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Common Anti-Patterns to Avoid</h4>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '12px' }}>
          Avoid the <strong>God Object Anti-Pattern</strong> where one class knows too much and does too much
          (violating SRP). Also avoid <strong>Premature Synchronization</strong> that serializes the entire
          system throughput.
        </p>

        {!revealedAntiPattern ? (
          <button
            onClick={() => setRevealedAntiPattern(true)}
            className="btn btn-danger btn-sm"
          >
            Reveal 3 Red Flags Interviewers Dislike
          </button>
        ) : (
          <ul style={{ paddingLeft: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '7px' }}>
            <li><strong style={{ color: 'var(--deco-rose)' }}>Red Flag 1:</strong> Using public static mutable fields without thread locks (data race hazards).</li>
            <li><strong style={{ color: 'var(--deco-rose)' }}>Red Flag 2:</strong> Calling external APIs inside synchronized blocks (locks held during network timeouts).</li>
            <li><strong style={{ color: 'var(--deco-rose)' }}>Red Flag 3:</strong> Hardcoding strings like "CAR", "BIKE" in if-else trees instead of typed Enums/Polymorphism.</li>
          </ul>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button onClick={onProceedPrev} className="btn btn-secondary">← Class UML</button>
        <button onClick={onProceedNext} className="btn btn-primary">Next: Code & Simulator →</button>
      </div>
    </div>
  );
}
