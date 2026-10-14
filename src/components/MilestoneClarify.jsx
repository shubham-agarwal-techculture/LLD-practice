import React, { useState } from 'react';
import { CheckCircle2, Circle, HelpCircle, ChevronDown, ChevronUp, AlertTriangle, Lightbulb, Sparkles } from 'lucide-react';

export default function MilestoneClarify({ scenario, onProceedNext }) {
  const [checkedFR, setCheckedFR] = useState({});
  const [checkedNFR, setCheckedNFR] = useState({});
  const [openQA, setOpenQA] = useState({ 0: true });
  const [quizAnswer, setQuizAnswer] = useState(null);

  const allFR = scenario.requirements?.functional?.length || 0;
  const checkedFRCount = Object.values(checkedFR).filter(Boolean).length;
  const progress = allFR > 0 ? (checkedFRCount / allFR) * 100 : 0;

  return (
    <div className="flex-col gap-6">

      {/* Stage Header */}
      <div className="stage-header card-indigo">
        <div className="stage-header-title">
          <Sparkles size={18} style={{ color: 'var(--deco-indigo)', flexShrink: 0 }} />
          <h3>Stage 1 — Clarify Requirements & Scope</h3>
        </div>
        <p>
          In real senior engineering interviews, candidates fail not by coding poorly, but by jumping
          straight to implementation before clarifying assumptions. Review each requirement below and
          check it off as you internalize it.
        </p>

        {/* Progress */}
        <div className="flex items-center gap-3" style={{ marginTop: '6px' }}>
          <div className="progress-track" style={{ flex: 1 }}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--deco-indigo)', fontWeight: 600, whiteSpace: 'nowrap' }}>
            {checkedFRCount}/{allFR} checked
          </span>
        </div>
      </div>

      {/* FR & NFR columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Functional Requirements */}
        <div className="card">
          <div className="flex items-center gap-2" style={{ marginBottom: '12px' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-indigo)', flexShrink: 0 }} />
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700 }}>Functional Requirements</h4>
          </div>
          <div className="flex-col gap-2">
            {scenario.requirements?.functional?.map((req, idx) => {
              const checked = !!checkedFR[idx];
              return (
                <div
                  key={idx}
                  id={`fr-item-${idx}`}
                  onClick={() => setCheckedFR(p => ({ ...p, [idx]: !p[idx] }))}
                  className={`req-item${checked ? ' checked' : ''}`}
                >
                  <div className="req-icon">
                    {checked ? <CheckCircle2 size={15} /> : <Circle size={15} />}
                  </div>
                  <span className="req-text">{req}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* NFR + Out of Scope */}
        <div className="flex-col gap-4">
          <div className="card">
            <div className="flex items-center gap-2" style={{ marginBottom: '12px' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-emerald)', flexShrink: 0 }} />
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700 }}>Non-Functional Requirements</h4>
            </div>
            <div className="flex-col gap-2">
              {scenario.requirements?.nonFunctional?.map((nfr, idx) => {
                const checked = !!checkedNFR[idx];
                return (
                  <div
                    key={idx}
                    id={`nfr-item-${idx}`}
                    onClick={() => setCheckedNFR(p => ({ ...p, [idx]: !p[idx] }))}
                    className={`req-item${checked ? ' checked-green' : ''}`}
                  >
                    <div className="req-icon">
                      {checked ? <CheckCircle2 size={15} /> : <Circle size={15} />}
                    </div>
                    <span className="req-text">{nfr}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {scenario.requirements?.outOfScope?.length > 0 && (
            <div className="card-rose" style={{ borderStyle: 'dashed' }}>
              <div className="flex items-center gap-2" style={{ marginBottom: '8px', color: 'var(--accent-rose)' }}>
                <AlertTriangle size={14} />
                <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>OUT OF SCOPE</span>
              </div>
              <ul style={{ paddingLeft: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {scenario.requirements.outOfScope.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Clarifying Questions Accordion */}
      <div className="card">
        <div className="flex items-center gap-2" style={{ marginBottom: '14px' }}>
          <HelpCircle size={17} style={{ color: 'var(--deco-indigo)', flexShrink: 0 }} />
          <h4 style={{ fontSize: '0.92rem', fontWeight: 700 }}>Clarifying Questions to Ask the Interviewer</h4>
        </div>

        <div className="flex-col gap-2">
          {scenario.requirements?.clarifyingQuestions?.map((item, idx) => {
            const isOpen = !!openQA[idx];
            return (
              <div key={idx} className="accordion-item">
                <button
                  className="accordion-trigger"
                  onClick={() => setOpenQA(p => ({ ...p, [idx]: !p[idx] }))}
                >
                  <span>Q{idx + 1}: {item.q}</span>
                  {isOpen
                    ? <ChevronUp size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    : <ChevronDown size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
                </button>
                {isOpen && (
                  <div className="accordion-content">
                    <p className="accordion-answer">
                      <strong style={{ color: 'var(--accent-emerald)' }}>Answer: </strong>
                      {item.a}
                    </p>
                    {item.hint && (
                      <div className="accordion-hint">
                        <Lightbulb size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                        <span><strong>Design Tip:</strong> {item.hint}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Self-Check Quiz */}
      <div className="card-amber" style={{ borderRadius: 10 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: '10px' }}>
          <span className="badge badge-medium">Self-Check</span>
          <h4 style={{ fontSize: '0.88rem', fontWeight: 700 }}>
            Why must spot allocation be atomic rather than plain read-then-write?
          </h4>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
          <button
            className={`quiz-option${quizAnswer === 'a' ? ' wrong' : ''}`}
            onClick={() => setQuizAnswer('a')}
          >
            A) To reduce RAM memory usage in the database.
          </button>
          <button
            className={`quiz-option${quizAnswer === 'b' ? ' correct' : ''}`}
            onClick={() => setQuizAnswer('b')}
          >
            B) To prevent TOCTOU race conditions when 2 concurrent clients pick the same resource.
          </button>
        </div>
        {quizAnswer && (
          <div style={{
            marginTop: '10px',
            padding: '10px 14px',
            borderRadius: '7px',
            fontSize: '0.81rem',
            background: quizAnswer === 'b' ? 'var(--surface-emerald)' : 'var(--surface-rose)',
            color: quizAnswer === 'b' ? 'var(--accent-emerald)' : 'var(--accent-rose)',
            border: `1px solid ${quizAnswer === 'b' ? 'var(--border-emerald)' : 'var(--border-rose)'}`
          }}>
            {quizAnswer === 'b'
              ? '✅ Correct! Atomic check-and-reserve eliminates race conditions where two threads allocate the same spot.'
              : '❌ Incorrect. Atomicity ensures concurrency safety and prevents double-allocation.'}
          </div>
        )}
      </div>

      {/* Footer action */}
      <div className="flex justify-end">
        <button onClick={onProceedNext} className="btn btn-primary" id="btn-proceed-to-entities">
          Next: Identify Entities →
        </button>
      </div>
    </div>
  );
}
