import React, { useState } from 'react';
import { CheckCircle2, Circle, HelpCircle, ChevronDown, ChevronUp, AlertTriangle, Lightbulb, Sparkles } from 'lucide-react';

export default function MilestoneClarify({ scenario, onProceedNext }) {
  const [checkedFR, setCheckedFR] = useState({});
  const [checkedNFR, setCheckedNFR] = useState({});
  const [openQA, setOpenQA] = useState({ 0: true });
  const [quizAnswer, setQuizAnswer] = useState(null);

  const toggleFR = (idx) => {
    setCheckedFR(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleNFR = (idx) => {
    setCheckedNFR(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleQA = (idx) => {
    setOpenQA(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const allFunctionalCount = scenario.requirements?.functional?.length || 0;
  const checkedFunctionalCount = Object.values(checkedFR).filter(Boolean).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Intro Context Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Sparkles size={18} color="#818cf8" />
          <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Stage 1: Clarify Requirements & Scope Boundaries</h3>
        </div>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
          In real senior engineering interviews, candidates fail not on coding, but by jumping straight into code before clarifying ambiguous assumptions. Review the requirements and check off items as you solidify your mental model.
        </p>

        {/* Progress bar */}
        <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            flex: 1,
            height: '6px',
            borderRadius: '9999px',
            background: 'rgba(255,255,255,0.1)',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${allFunctionalCount > 0 ? (checkedFunctionalCount / allFunctionalCount) * 100 : 0}%`,
              background: 'linear-gradient(90deg, #6366f1, #10b981)',
              transition: 'width 0.3s'
            }} />
          </div>
          <span style={{ fontSize: '0.78rem', color: '#a5b4fc', fontWeight: '600' }}>
            {checkedFunctionalCount}/{allFunctionalCount} Requirements Checked
          </span>
        </div>
      </div>

      {/* Two Column Layout: FR & NFR */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Functional Requirements */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1' }}></span>
            <h4 style={{ fontSize: '0.95rem', color: '#fff' }}>Functional Requirements (What it must do)</h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {scenario.requirements?.functional?.map((req, idx) => {
              const isChecked = !!checkedFR[idx];
              return (
                <div
                  key={idx}
                  onClick={() => toggleFR(idx)}
                  id={`fr-item-${idx}`}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: isChecked ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255,255,255,0.02)',
                    border: isChecked ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ marginTop: '2px', color: isChecked ? '#818cf8' : 'var(--text-muted)' }}>
                    {isChecked ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                  </div>
                  <span style={{
                    fontSize: '0.84rem',
                    color: isChecked ? '#e2e8f0' : 'var(--text-secondary)',
                    textDecoration: isChecked ? 'none' : 'none'
                  }}>
                    {req}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Non-Functional Requirements & Out of Scope */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* NFR */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
              <h4 style={{ fontSize: '0.95rem', color: '#fff' }}>Non-Functional Requirements (Quality Invariants)</h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {scenario.requirements?.nonFunctional?.map((nfr, idx) => {
                const isChecked = !!checkedNFR[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleNFR(idx)}
                    id={`nfr-item-${idx}`}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: isChecked ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.02)',
                      border: isChecked ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ marginTop: '2px', color: isChecked ? '#34d399' : 'var(--text-muted)' }}>
                      {isChecked ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                    </div>
                    <span style={{ fontSize: '0.84rem', color: isChecked ? '#e2e8f0' : 'var(--text-secondary)' }}>
                      {nfr}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Out of scope */}
          {scenario.requirements?.outOfScope?.length > 0 && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.05)',
              border: '1px dashed rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#fb7185', fontSize: '0.86rem', fontWeight: '700' }}>
                <AlertTriangle size={15} /> Explicitly Out of Scope
              </div>
              <ul style={{ paddingLeft: '18px', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {scenario.requirements.outOfScope.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Socratic Clarifying Questions Accordion */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <HelpCircle size={18} color="#a5b4fc" />
          <h4 style={{ fontSize: '1rem', color: '#fff' }}>
            Key Clarifying Questions an Interviewer Expects You to Ask
          </h4>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {scenario.requirements?.clarifyingQuestions?.map((item, idx) => {
            const isOpen = !!openQA[idx];
            return (
              <div
                key={idx}
                style={{
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(9, 13, 22, 0.6)',
                  overflow: 'hidden'
                }}
              >
                <div
                  onClick={() => toggleQA(idx)}
                  style={{
                    padding: '14px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <span style={{ fontSize: '0.88rem', fontWeight: '600', color: '#cbd5e1' }}>
                    Q{idx + 1}: {item.q}
                  </span>
                  {isOpen ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
                </div>

                {isOpen && (
                  <div style={{
                    padding: '0 16px 14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                    paddingTop: '12px'
                  }}>
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                      <strong style={{ color: '#34d399' }}>Clarification: </strong>
                      {item.a}
                    </div>
                    {item.hint && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '6px',
                        background: 'rgba(99, 102, 241, 0.1)',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.78rem',
                        color: '#a5b4fc'
                      }}>
                        <Lightbulb size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
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

      {/* Mini Quiz / Self-Check */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="badge badge-medium" style={{ fontSize: '0.72rem' }}>Quick Self-Check</span>
          <h4 style={{ fontSize: '0.92rem', color: '#fff' }}>
            Why must spot allocation or locks be atomic rather than plain read-then-write?
          </h4>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
          <button
            onClick={() => setQuizAnswer('a')}
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: quizAnswer === 'a' ? '1px solid #f43f5e' : '1px solid var(--border-subtle)',
              background: quizAnswer === 'a' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255,255,255,0.03)',
              color: '#cbd5e1',
              textAlign: 'left',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            A) To reduce RAM memory usage in the database.
          </button>

          <button
            onClick={() => setQuizAnswer('b')}
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: quizAnswer === 'b' ? '1px solid #10b981' : '1px solid var(--border-subtle)',
              background: quizAnswer === 'b' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)',
              color: '#cbd5e1',
              textAlign: 'left',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            B) To prevent Time-of-Check to Time-of-Use (TOCTOU) race condition when 2 concurrent clients pick the same resource.
          </button>
        </div>

        {quizAnswer && (
          <div style={{
            marginTop: '12px',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            background: quizAnswer === 'b' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
            color: quizAnswer === 'b' ? '#34d399' : '#fb7185'
          }}>
            {quizAnswer === 'b'
              ? '✅ Correct! Atomic check-and-reserve eliminates race conditions where two threads allocate the same spot or lock.'
              : '❌ Incorrect. Atomicity is required for concurrency safety to eliminate double-allocation race conditions!'}
          </div>
        )}
      </div>

      {/* Milestone Footer Action */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={onProceedNext}
          className="btn btn-primary"
          id="btn-proceed-to-entities"
        >
          Next: Identify Entities & Actors →
        </button>
      </div>
    </div>
  );
}
