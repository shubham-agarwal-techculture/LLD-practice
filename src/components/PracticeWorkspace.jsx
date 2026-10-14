import React, { useState, useEffect } from 'react';
import {
  PenTool, CheckSquare, Trophy, Sparkles, Copy, Check,
  Bot, RefreshCw, Send, Settings2, Trash2, Code2, Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { callAIProvider, AI_PROVIDERS } from '../data/aiProviders';
import { generateOfflineMentorResponse, QUICK_PROMPTS } from '../data/mentorEngine';

export default function PracticeWorkspace({
  scenario,
  currentStage = 0,
  aiConfig,
  onOpenAISettings,
  onCompleteScenario,
  isSolved = false
}) {
  const [activeTab, setActiveTab] = useState('draft'); // 'draft' | 'rubric' | 'copilot'
  const storageKey = `lld_notes_${scenario.id}`;

  const defaultStarter = `// ==========================================
// LLD Solution Architecture: ${scenario.title}
// ==========================================

// 1. CORE INTERFACES & CONTRACTS
public interface I${scenario.id.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')}Service {
    // Define public operations
}

// 2. DOMAIN MODELS & STATE
public class DomainModel {
    private final String id;
    // Encapsulate invariants
}

// 3. CONCURRENCY & THREAD-SAFETY STRATEGY
// - Lock mechanism: ReentrantLock / Synchronized / Atomic
// - Race condition mitigations:
`;

  const [notes, setNotes] = useState(() =>
    localStorage.getItem(storageKey) || defaultStarter
  );

  const [checklist, setChecklist] = useState({
    scope: false,
    solid: false,
    concurrency: false,
    patterns: false,
    cleanCode: false
  });
  const [submitted, setSubmitted] = useState(isSolved);
  const [copied, setCopied] = useState(false);

  // Embedded AI Copilot Chat state
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'ai',
      text: `Hello architect! I'm your deliberate practice AI copilot for **${scenario.title}**. Ask me to review your draft, explore race conditions, or suggest design pattern trade-offs.`
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(storageKey, notes);
  }, [notes, storageKey]);

  // When scenario changes, reload notes if different
  useEffect(() => {
    const saved = localStorage.getItem(`lld_notes_${scenario.id}`);
    if (saved) {
      setNotes(saved);
    } else {
      setNotes(defaultStarter);
    }
  }, [scenario.id]);

  const checkedCount = Object.values(checklist).filter(Boolean).length;
  const scorePercent = Math.round((checkedCount / 5) * 100);

  const handleCopyNotes = () => {
    navigator.clipboard.writeText(notes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsertSnippet = (type) => {
    let snippet = '';
    switch (type) {
      case 'interface':
        snippet = `\npublic interface CustomStrategy {\n    void executeStrategy();\n}\n`;
        break;
      case 'singleton':
        snippet = `\n// Thread-safe Double-Checked Locking Singleton\npublic class Manager {\n    private static volatile Manager instance;\n    private Manager() {}\n    public static Manager getInstance() {\n        if (instance == null) {\n            synchronized (Manager.class) {\n                if (instance == null) instance = new Manager();\n            }\n        }\n        return instance;\n    }\n}\n`;
        break;
      case 'lock':
        snippet = `\n// Explicit ReentrantLock block\nprivate final ReentrantLock lock = new ReentrantLock();\npublic void criticalSection() {\n    lock.lock();\n    try {\n        // mutate shared state\n    } finally {\n        lock.unlock();\n    }\n}\n`;
        break;
      case 'factory':
        snippet = `\n// Factory Method Pattern\npublic class EntityFactory {\n    public static Entity create(String type) {\n        // return concrete implementation\n    }\n}\n`;
        break;
      default:
        break;
    }
    setNotes(prev => prev + snippet);
  };

  const handleSubmit = () => {
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    setSubmitted(true);
    onCompleteScenario?.(scenario.id);
  };

  const handleSendChatMessage = async (promptText) => {
    const query = promptText || chatInput;
    if (!query.trim() || isAiLoading) return;

    const newMessages = [...chatMessages, { role: 'user', text: query }];
    setChatMessages(newMessages);
    if (!promptText) setChatInput('');
    setIsAiLoading(true);

    const systemPrompt = `You are a Principal Software Architect interviewing a candidate on LLD. Scenario: ${scenario.title}. Current stage: ${currentStage}. Candidate notes: ${notes.slice(0, 500)}`;

    try {
      if (!aiConfig || aiConfig.provider === 'offline' || !aiConfig.apiKey && aiConfig.provider !== 'ollama') {
        const offlineReply = generateOfflineMentorResponse({
          userPrompt: query,
          scenario,
          stageIndex: currentStage,
          persona: 'faang'
        });
        setChatMessages(prev => [...prev, { role: 'ai', text: offlineReply }]);
      } else {
        const aiResponse = await callAIProvider(aiConfig, systemPrompt, query);
        setChatMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
      }
    } catch (err) {
      const offlineReply = generateOfflineMentorResponse({
        userPrompt: query,
        scenario,
        stageIndex: currentStage,
        persona: 'faang'
      });
      setChatMessages(prev => [
        ...prev,
        { role: 'ai', text: `*[Network fallback]*\n\n${offlineReply}` }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const rubricItems = [
    { key: 'scope',       label: 'Clarified scope & edge case boundaries', tip: 'Explicit constraints & error returns' },
    { key: 'solid',       label: 'Applied SOLID principles throughout', tip: 'Inverted dependencies, single responsibilities' },
    { key: 'concurrency', label: 'Guarded race conditions & thread safety', tip: 'Atomic checks, mutex locks, no deadlocks' },
    { key: 'patterns',    label: 'Applied Strategy / State / Observer', tip: 'Clean separation of variable behavior' },
    { key: 'cleanCode',   label: 'Domain exceptions & clean signatures', tip: 'Idiomatic API names, invariants preserved' },
  ];

  return (
    <div className="card flex-col gap-4" style={{ height: '100%', minHeight: '560px' }}>
      {/* Workbench Header & Tabs */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="workbench-tabs" style={{ flex: 1 }}>
          <button
            type="button"
            onClick={() => setActiveTab('draft')}
            className={`workbench-tab${activeTab === 'draft' ? ' active' : ''}`}
          >
            <PenTool size={13} />
            <span>Solution Draft</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rubric')}
            className={`workbench-tab${activeTab === 'rubric' ? ' active' : ''}`}
          >
            <CheckSquare size={13} />
            <span>Rubric ({scorePercent}%)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('copilot')}
            className={`workbench-tab${activeTab === 'copilot' ? ' active' : ''}`}
          >
            <Bot size={13} />
            <span>Copilot</span>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-emerald)' }} />
          </button>
        </div>

        <span className="mono-tag" style={{ fontSize: '0.68rem' }}>
          auto-saved
        </span>
      </div>

      {/* TAB 1: SOLUTION DRAFT */}
      {activeTab === 'draft' && (
        <div className="flex-col gap-3" style={{ flex: 1, display: 'flex' }}>
          {/* Snippet Insert Bar */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1 flex-wrap">
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginRight: 2 }}>
                Insert:
              </span>
              <button
                type="button"
                onClick={() => handleInsertSnippet('interface')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.7rem', padding: '2px 7px', borderRadius: 4 }}
              >
                + Interface
              </button>
              <button
                type="button"
                onClick={() => handleInsertSnippet('singleton')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.7rem', padding: '2px 7px', borderRadius: 4 }}
              >
                + Singleton
              </button>
              <button
                type="button"
                onClick={() => handleInsertSnippet('lock')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.7rem', padding: '2px 7px', borderRadius: 4 }}
              >
                + Lock
              </button>
              <button
                type="button"
                onClick={() => handleInsertSnippet('factory')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.7rem', padding: '2px 7px', borderRadius: 4 }}
              >
                + Factory
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleCopyNotes}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.7rem', padding: '3px 8px' }}
                title="Copy solution draft to clipboard"
              >
                {copied ? <Check size={12} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Reset your draft solution to default outline?')) {
                    setNotes(defaultStarter);
                  }
                }}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.7rem', padding: '3px 6px', color: 'var(--accent-rose)' }}
                title="Reset solution outline"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          {/* Solution Editor Textarea */}
          <div style={{ position: 'relative', flex: 1, minHeight: '360px', display: 'flex' }}>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="// Start drafting your classes, interfaces, and concurrency contracts here..."
              style={{
                width: '100%',
                flex: 1,
                minHeight: '360px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.81rem',
                lineHeight: 1.6,
                background: 'var(--bg-code)',
                color: '#e2e8f0',
                border: '1px solid var(--border-medium)',
                borderRadius: 8,
                padding: '12px',
                resize: 'vertical'
              }}
            />
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTION RUBRIC & ASSESSMENT */}
      {activeTab === 'rubric' && (
        <div className="flex-col gap-4" style={{ flex: 1 }}>
          {/* Score Header */}
          <div className="card-raised flex-col gap-3">
            <div className="flex justify-between items-center">
              <div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Architectural Readiness Score
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {scorePercent === 100
                    ? '🎉 L6 / Staff Engineer standard achieved!'
                    : `${checkedCount} of 5 core architectural criteria verified.`}
                </p>
              </div>

              <span className="mono-tag" style={{
                fontSize: '0.92rem',
                fontWeight: 800,
                color: scorePercent >= 80 ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                borderColor: scorePercent >= 80 ? 'var(--border-emerald)' : 'var(--border-amber)'
              }}>
                {scorePercent}%
              </span>
            </div>

            {/* Progress Track */}
            <div className="progress-track" style={{ height: 6 }}>
              <div
                className="progress-fill"
                style={{
                  width: `${scorePercent}%`,
                  background: scorePercent >= 80 ? 'var(--accent-emerald)' : 'var(--accent-indigo)'
                }}
              />
            </div>
          </div>

          {/* Checklist Items */}
          <div className="flex-col gap-2">
            {rubricItems.map(item => (
              <label
                key={item.key}
                className="card-raised"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  cursor: 'pointer',
                  padding: '10px 12px',
                  border: checklist[item.key] ? '1px solid var(--border-emerald)' : '1px solid var(--border-faint)',
                  background: checklist[item.key] ? 'var(--surface-emerald)' : 'var(--bg-raised)'
                }}
              >
                <input
                  type="checkbox"
                  checked={checklist[item.key]}
                  onChange={() => setChecklist(p => ({ ...p, [item.key]: !p[item.key] }))}
                  style={{ marginTop: 2, accentColor: 'var(--accent-emerald)', flexShrink: 0 }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {item.tip}
                  </div>
                </div>
              </label>
            ))}
          </div>

          {/* Submit / Solved Button */}
          <div style={{ marginTop: 'auto', paddingTop: 10 }}>
            <button
              onClick={handleSubmit}
              className="btn btn-success w-full"
              id="btn-submit-solution"
              style={{ padding: '12px', width: '100%', fontSize: '0.86rem' }}
            >
              <Trophy size={16} />
              {submitted ? 'Solved & Verified! 🎉' : 'Mark Scenario as Solved'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: INLINE AI COPILOT */}
      {activeTab === 'copilot' && (
        <div className="flex-col gap-3" style={{ flex: 1, display: 'flex' }}>
          {/* Provider status bar */}
          <div className="flex justify-between items-center" style={{ fontSize: '0.72rem' }}>
            <span className="mono-tag" style={{ color: 'var(--deco-indigo)' }}>
              Model: {aiConfig?.provider || 'offline'} / {aiConfig?.model || 'built-in'}
            </span>
            {onOpenAISettings && (
              <button
                type="button"
                onClick={onOpenAISettings}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.7rem', padding: '2px 7px' }}
              >
                <Settings2 size={11} /> Settings
              </button>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="flex gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => handleSendChatMessage('Please review my current solution draft for SOLID adherence and race conditions.')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.68rem', padding: '3px 8px' }}
            >
              ⚡ Review Draft
            </button>
            <button
              type="button"
              onClick={() => handleSendChatMessage('What are the top 3 concurrency bottlenecks and race conditions in this scenario?')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.68rem', padding: '3px 8px' }}
            >
              🔒 Race Conditions
            </button>
            <button
              type="button"
              onClick={() => handleSendChatMessage('What clarifying questions should I ask before writing code?')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.68rem', padding: '3px 8px' }}
            >
              ❓ Clarifications
            </button>
          </div>

          {/* Messages Container */}
          <div
            style={{
              flex: 1,
              minHeight: '260px',
              maxHeight: '340px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              padding: '10px',
              background: 'var(--bg-raised)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 8
            }}
          >
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={msg.role === 'user' ? 'message-user' : 'message-ai'}
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '90%',
                  padding: '9px 12px',
                  borderRadius: 8,
                  fontSize: '0.8rem',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap'
                }}
              >
                {msg.text}
              </div>
            ))}
            {isAiLoading && (
              <div className="message-ai" style={{ padding: '8px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <RefreshCw size={12} className="spin" /> Thinking...
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChatMessage();
            }}
            style={{ display: 'flex', gap: 6 }}
          >
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Ask copilot about classes, locks, or patterns..."
              disabled={isAiLoading}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid var(--border-medium)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '0.8rem'
              }}
            />
            <button
              type="submit"
              disabled={isAiLoading || !chatInput.trim()}
              className="btn btn-primary"
              style={{ padding: '8px 12px' }}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
