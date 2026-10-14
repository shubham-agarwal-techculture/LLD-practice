import React, { useState, useEffect } from 'react';
import { PenTool, CheckSquare, Sparkles, Trophy, Save, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PracticeWorkspace({ scenario, onCompleteScenario }) {
  const storageKey = `lld_notes_${scenario.id}`;

  const [notes, setNotes] = useState(() => {
    return localStorage.getItem(storageKey) || `// Draft your LLD solution for ${scenario.title}\n// 1. Core Interfaces:\n// 2. Concrete Classes:\n// 3. Concurrency / Synchronization Strategy:`;
  });

  const [checklist, setChecklist] = useState({
    scope: false,
    solid: false,
    concurrency: false,
    patterns: false,
    cleanCode: false
  });

  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    localStorage.setItem(storageKey, notes);
  }, [notes, storageKey]);

  const toggleChecklist = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = Object.values(checklist).every(Boolean);

  const handleSubmit = () => {
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 }
    });
    setSubmitted(true);
    if (onCompleteScenario) {
      onCompleteScenario(scenario.id);
    }
  };

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PenTool size={18} color="#6366f1" />
          <h3 style={{ fontSize: '1.05rem', color: '#fff' }}>Your Solution Scratchpad & Self-Assessment</h3>
        </div>

        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Auto-saved locally
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
        {/* Solution Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Code / Class Outline Draft:
          </div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={14}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              background: '#090d16',
              color: '#f8fafc',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.84rem',
              lineHeight: '1.6',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Self-Evaluation Rubric */}
        <div style={{
          background: 'rgba(9, 13, 22, 0.7)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <h4 style={{ fontSize: '0.88rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckSquare size={16} color="#10b981" /> LLD Production Rubric
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={checklist.scope}
                onChange={() => toggleChecklist('scope')}
              />
              <span style={{ color: checklist.scope ? '#6ee7b7' : 'var(--text-secondary)' }}>
                Clarified scope & handled boundaries
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={checklist.solid}
                onChange={() => toggleChecklist('solid')}
              />
              <span style={{ color: checklist.solid ? '#6ee7b7' : 'var(--text-secondary)' }}>
                Followed SOLID (Single Resp. & Open/Closed)
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={checklist.concurrency}
                onChange={() => toggleChecklist('concurrency')}
              />
              <span style={{ color: checklist.concurrency ? '#6ee7b7' : 'var(--text-secondary)' }}>
                Guarded race conditions & thread-safety
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={checklist.patterns}
                onChange={() => toggleChecklist('patterns')}
              />
              <span style={{ color: checklist.patterns ? '#6ee7b7' : 'var(--text-secondary)' }}>
                Applied Strategy / State / Observer pattern
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={checklist.cleanCode}
                onChange={() => toggleChecklist('cleanCode')}
              />
              <span style={{ color: checklist.cleanCode ? '#6ee7b7' : 'var(--text-secondary)' }}>
                Clean method signatures & domain exceptions
              </span>
            </label>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              onClick={handleSubmit}
              className="btn btn-accent"
              id="btn-submit-solution"
              style={{ width: '100%', padding: '10px' }}
            >
              <Trophy size={16} /> {submitted ? 'Solution Completed! 🎉' : 'Mark Daily Scenario Solved'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
