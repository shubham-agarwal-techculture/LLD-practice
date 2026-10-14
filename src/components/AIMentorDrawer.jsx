import React, { useState } from 'react';
import { Bot, X, Send, Sparkles, Settings2, RefreshCw, Cpu } from 'lucide-react';
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
  const [messages, setMessages] = useState([
    {
      sender: 'mentor',
      text: `Hello! I'm your LLD practice mentor. Today we're tackling **${currentScenario.title}**.\nAsk me for hints, edge cases, trade-offs, or concurrency reviews at any step!`
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

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
      console.error('AI provider error:', err);
      // Fallback response with error note
      const fallback = generateOfflineMentorResponse(
        currentScenario,
        currentStageIndex,
        query,
        selectedPersona
      );
      setMessages(prev => [
        ...prev,
        {
          sender: 'mentor',
          text: `⚠️ **AI Provider Notice:** ${err.message}\n\n*Falling back to built-in knowledge base:*\n\n${fallback}`
        }
      ]);
    } finally {
      setIsTyping(false);
    }
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
      width: '450px',
      maxWidth: '100vw',
      background: 'var(--bg-secondary)',
      backdropFilter: 'blur(20px)',
      borderLeft: '1px solid var(--border-medium)',
      boxShadow: 'var(--shadow-card)',
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
        background: 'var(--bg-tertiary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.3rem' }}>{currentPersonaObj.avatar}</span>
          <div>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{currentPersonaObj.name}</h4>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{currentPersonaObj.tagline}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* AI Settings Button */}
          <button
            onClick={onOpenSettings}
            title={`Configure AI Provider (Current: ${activeProvider.name})`}
            className="btn btn-secondary btn-sm"
            id="btn-open-ai-settings"
            style={{ padding: '6px 8px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem' }}
          >
            <Settings2 size={13} color="#818cf8" />
            <span style={{ maxWidth: '85px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeProvider.id === 'ollama' ? '🦙 Ollama' : activeProvider.name.split(' ')[0]}
            </span>
          </button>

          <button
            onClick={handleResetChat}
            title="Reset Conversation"
            className="btn btn-secondary btn-sm"
            style={{ padding: '6px' }}
          >
            <RefreshCw size={13} />
          </button>

          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ padding: '6px' }}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Active Provider Indicator Bar */}
      <div style={{
        padding: '6px 16px',
        background: activeProvider.id === 'ollama' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.08)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.72rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: activeProvider.id === 'ollama' ? '#10b981' : '#6366f1'
          }} />
          <span style={{ color: 'var(--text-secondary)' }}>
            Active AI: <strong style={{ color: 'var(--text-primary)' }}>{activeProvider.name}</strong> ({aiConfig?.model || activeProvider.defaultModel})
          </span>
        </div>
        <button
          onClick={onOpenSettings}
          style={{ background: 'none', border: 'none', color: 'var(--accent-indigo)', cursor: 'pointer', fontSize: '0.7rem' }}
        >
          Change
        </button>
      </div>

      {/* Persona Switcher Tabs */}
      <div style={{
        padding: '8px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '6px',
        background: 'var(--bg-secondary)'
      }}>
        {MENTOR_PERSONAS.map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedPersona(p.id)}
            style={{
              padding: '6px 4px',
              borderRadius: 'var(--radius-sm)',
              border: selectedPersona === p.id ? `1px solid ${p.accentColor}` : '1px solid transparent',
              background: selectedPersona === p.id ? 'var(--bg-card-hover)' : 'transparent',
              color: selectedPersona === p.id ? 'var(--text-primary)' : 'var(--text-secondary)',
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
        padding: '8px 16px',
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-tertiary)'
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
              background: 'var(--bg-card)',
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
        gap: '12px',
        background: 'var(--bg-primary)'
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
                background: isUser ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-card)',
                border: isUser ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--border-subtle)',
                fontSize: '0.82rem',
                color: 'var(--text-primary)',
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
            background: 'var(--bg-card)',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Sparkles size={14} className="spin" color="#6366f1" />
            <span>Consulting {activeProvider.name} with {currentPersonaObj.name}...</span>
          </div>
        )}
      </div>

      {/* Chat Input Bar */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-secondary)'
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
            disabled={isTyping}
            placeholder={`Ask ${activeProvider.name.split(' ')[0]} (e.g. 'How to handle concurrency?')`}
            style={{
              flex: 1,
              padding: '9px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '0.82rem'
            }}
          />
          <button type="submit" disabled={isTyping || !inputQuery.trim()} className="btn btn-primary" style={{ padding: '0 14px' }}>
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
