import React, { useState } from 'react';
import { Bot, X, Send, Sparkles, Key, MessageSquare, RefreshCw } from 'lucide-react';
import { MENTOR_PERSONAS, QUICK_PROMPTS, generateOfflineMentorResponse } from '../data/mentorEngine';

export default function AIMentorDrawer({ isOpen, onClose, currentScenario, currentStageIndex }) {
  const [selectedPersona, setSelectedPersona] = useState('socratic');
  const [messages, setMessages] = useState([
    {
      sender: 'mentor',
      text: `Hello! I'm your LLD practice mentor. Today we're tackling **${currentScenario.title}**. Ask me for hints, edge cases, trade-offs, or concurrency reviews at any step!`
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const currentPersonaObj = MENTOR_PERSONAS.find(p => p.id === selectedPersona) || MENTOR_PERSONAS[0];

  const handleSendMessage = (textToSend) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg = { sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      const responseText = generateOfflineMentorResponse(
        currentScenario,
        currentStageIndex,
        query,
        selectedPersona
      );

      setMessages(prev => [...prev, { sender: 'mentor', text: responseText }]);
      setIsTyping(false);
    }, 600);
  };

  const handleResetChat = () => {
    setMessages([
      {
        sender: 'mentor',
        text: `Chat reset. I am ready to guide you on **${currentScenario.title}**!`
      }
    ]);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '420px',
      maxWidth: '100vw',
      background: 'rgba(11, 15, 25, 0.95)',
      backdropFilter: 'blur(20px)',
      borderLeft: '1px solid var(--border-medium)',
      boxShadow: '-10px 0 30px rgba(0,0,0,0.7)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Drawer Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(15, 23, 42, 0.8)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.3rem' }}>{currentPersonaObj.avatar}</span>
          <div>
            <h4 style={{ fontSize: '0.95rem', color: '#fff' }}>{currentPersonaObj.name}</h4>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{currentPersonaObj.tagline}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setShowKeyModal(!showKeyModal)}
            title="Configure Live LLM API Key"
            className="btn btn-secondary btn-sm"
            style={{ padding: '6px' }}
          >
            <Key size={14} color={apiKey ? '#34d399' : '#94a3b8'} />
          </button>
          <button
            onClick={handleResetChat}
            title="Reset Conversation"
            className="btn btn-secondary btn-sm"
            style={{ padding: '6px' }}
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ padding: '6px' }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* API Key Modal Banner (if toggled) */}
      {showKeyModal && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(99, 102, 241, 0.1)',
          borderBottom: '1px solid rgba(99, 102, 241, 0.3)',
          fontSize: '0.78rem'
        }}>
          <div style={{ fontWeight: '600', color: '#a5b4fc', marginBottom: '4px' }}>
            Optional: Custom Gemini / OpenAI API Key
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Built-in Socratic mentor works offline! Or supply your API key for unrestricted custom prompting.
          </p>
          <div style={{ display: 'flex', gap: '6px' }}>
            <input
              type="password"
              placeholder="sk-... or AIzaSy..."
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-medium)',
                background: '#090d16',
                color: '#fff',
                fontSize: '0.75rem'
              }}
            />
            <button
              onClick={() => setShowKeyModal(false)}
              className="btn btn-primary btn-sm"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Persona Switcher Tabs */}
      <div style={{
        padding: '10px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '6px'
      }}>
        {MENTOR_PERSONAS.map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedPersona(p.id)}
            style={{
              padding: '6px 4px',
              borderRadius: 'var(--radius-sm)',
              border: selectedPersona === p.id ? `1px solid ${p.accentColor}` : '1px solid transparent',
              background: selectedPersona === p.id ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: selectedPersona === p.id ? '#fff' : 'var(--text-secondary)',
              fontSize: '0.74rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            <span>{p.avatar}</span> {p.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Quick Prompts Carousel */}
      <div style={{
        padding: '10px 16px',
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(9, 13, 22, 0.4)'
      }}>
        {QUICK_PROMPTS.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qp.prompt)}
            style={{
              whiteSpace: 'nowrap',
              padding: '4px 10px',
              borderRadius: '9999px',
              border: '1px solid var(--border-subtle)',
              background: 'rgba(255,255,255,0.04)',
              color: 'var(--text-secondary)',
              fontSize: '0.72rem',
              cursor: 'pointer'
            }}
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.map((m, idx) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={idx}
              style={{
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '88%',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: isUser ? 'rgba(99, 102, 241, 0.25)' : 'rgba(30, 41, 59, 0.7)',
                border: isUser ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--border-subtle)',
                fontSize: '0.82rem',
                color: '#e2e8f0',
                lineHeight: '1.5',
                whiteSpace: 'pre-line'
              }}
            >
              {m.text}
            </div>
          );
        })}

        {isTyping && (
          <div style={{
            alignSelf: 'flex-start',
            padding: '8px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(30, 41, 59, 0.5)',
            fontSize: '0.78rem',
            color: 'var(--text-muted)'
          }}>
            Thinking & formulating architectural feedback...
          </div>
        )}
      </div>

      {/* Chat Input Bar */}
      <div style={{
        padding: '14px 16px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(15, 23, 42, 0.9)'
      }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          style={{ display: 'flex', gap: '8px' }}
        >
          <input
            type="text"
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            placeholder="Ask mentor (e.g. 'How to handle concurrency?')"
            style={{
              flex: 1,
              padding: '9px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              background: '#090d16',
              color: '#fff',
              fontSize: '0.82rem'
            }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0 14px' }}>
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
