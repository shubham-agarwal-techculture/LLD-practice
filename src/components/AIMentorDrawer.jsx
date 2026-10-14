import React, { useState } from 'react';
import { Bot, X, Send, Sparkles, Settings2, RefreshCw } from 'lucide-react';
import { MENTOR_PERSONAS, QUICK_PROMPTS, generateOfflineMentorResponse } from '../data/mentorEngine';
import { callAIProvider, AI_PROVIDERS } from '../data/aiProviders';

export default function AIMentorDrawer({
  isOpen,
  onClose,
  currentScenario,
  currentStageIndex,
  aiConfig,
  onOpenSettings
}) {
  const [selectedPersona, setSelectedPersona] = useState('socratic');
  const [messages, setMessages] = useState([{
    sender: 'mentor',
    text: `Hello! I'm your LLD mentor. Today we're tackling **${currentScenario.title}**.\nAsk me for hints, edge cases, trade-offs, or concurrency reviews!`
  }]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const currentPersonaObj = MENTOR_PERSONAS.find(p => p.id === selectedPersona) || MENTOR_PERSONAS[0];
  const activeProvider = AI_PROVIDERS.find(p => p.id === aiConfig?.providerId) || AI_PROVIDERS[0];

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isTyping) return;

    const userMsg = { sender: 'user', text: query };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputQuery('');
    setIsTyping(true);

    try {
      const responseText = await callAIProvider({
        config: aiConfig,
        scenario: currentScenario,
        stageIndex: currentStageIndex,
        personaId: selectedPersona,
        messages: updatedMessages,
        offlineFallbackHandler: generateOfflineMentorResponse
      });
      setMessages(prev => [...prev, { sender: 'mentor', text: responseText }]);
    } catch (err) {
      const fallback = generateOfflineMentorResponse(currentScenario, currentStageIndex, query, selectedPersona);
      setMessages(prev => [...prev, {
        sender: 'mentor',
        text: `⚠️ **Provider Notice:** ${err.message}\n\n*Falling back to built-in engine:*\n\n${fallback}`
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`mentor-drawer${isOpen ? ' open' : ''}`}>
      {/* Header */}
      <div className="mentor-drawer-header">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '1.2rem' }}>{currentPersonaObj.avatar}</span>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {currentPersonaObj.name}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {currentPersonaObj.tagline}
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={onOpenSettings} className="btn btn-secondary btn-sm btn-icon" title="AI Settings">
            <Settings2 size={13} style={{ color: 'var(--deco-indigo)' }} />
          </button>
          <button
            onClick={() => setMessages([{ sender: 'mentor', text: `Chat reset. Ready to help with **${currentScenario.title}**!` }])}
            className="btn btn-secondary btn-sm btn-icon"
            title="Reset conversation"
          >
            <RefreshCw size={13} />
          </button>
          <button onClick={onClose} className="btn btn-secondary btn-sm btn-icon" title="Close">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Provider indicator */}
      <div style={{
        padding: '6px 16px',
        background: activeProvider.id === 'ollama' ? 'var(--surface-emerald)' : 'var(--surface-indigo)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.72rem'
      }}>
        <div className="flex items-center gap-2">
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: activeProvider.id === 'ollama' ? 'var(--accent-emerald)' : 'var(--accent-indigo)'
          }} />
          <span style={{ color: 'var(--text-secondary)' }}>
            {activeProvider.name} <span style={{ color: 'var(--text-muted)' }}>·</span>{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{aiConfig?.model || activeProvider.defaultModel}</strong>
          </span>
        </div>
        <button
          onClick={onOpenSettings}
          style={{ background: 'none', border: 'none', color: 'var(--accent-indigo)', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600 }}
        >
          Change →
        </button>
      </div>

      {/* Persona Switcher */}
      <div style={{
        padding: '8px 14px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'grid',
        gridTemplateColumns: `repeat(${MENTOR_PERSONAS.length}, 1fr)`,
        gap: 5,
        background: 'var(--bg-raised)'
      }}>
        {MENTOR_PERSONAS.map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedPersona(p.id)}
            style={{
              padding: '6px 4px',
              borderRadius: 6,
              border: selectedPersona === p.id ? `1px solid ${p.accentColor}` : '1px solid transparent',
              background: selectedPersona === p.id ? 'var(--bg-hover)' : 'transparent',
              color: selectedPersona === p.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '0.72rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              transition: 'all 0.13s'
            }}
          >
            <span>{p.avatar}</span> {p.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Quick Prompts */}
      <div style={{
        padding: '8px 14px',
        display: 'flex',
        gap: 6,
        overflowX: 'auto',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-raised)'
      }}>
        {QUICK_PROMPTS.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qp.prompt)}
            className="btn btn-secondary btn-sm"
            style={{ whiteSpace: 'nowrap', borderRadius: 9999, padding: '4px 10px', fontSize: '0.7rem' }}
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="mentor-messages">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={m.sender === 'user' ? 'message-user' : 'message-ai'}
            style={{ whiteSpace: 'pre-line' }}
          >
            {m.text}
          </div>
        ))}
        {isTyping && (
          <div className="message-ai" style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-muted)', fontSize: '0.79rem' }}>
            <Sparkles size={13} className="spin" style={{ color: 'var(--accent-indigo)' }} />
            Consulting {activeProvider.name}…
          </div>
        )}
      </div>

      {/* Input */}
      <div className="mentor-input-area">
        <form
          onSubmit={e => { e.preventDefault(); handleSendMessage(); }}
          style={{ display: 'flex', gap: 8, width: '100%' }}
        >
          <input
            type="text"
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            disabled={isTyping}
            placeholder={`Ask about ${currentScenario.title}…`}
            style={{ flex: 1 }}
          />
          <button
            type="submit"
            disabled={isTyping || !inputQuery.trim()}
            className="btn btn-primary"
            style={{ padding: '0 14px', flexShrink: 0 }}
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}
