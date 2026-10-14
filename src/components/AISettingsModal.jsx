import React, { useState } from 'react';
import { X, Check, Server, Key, Sparkles, RefreshCw, AlertCircle, Cpu, ExternalLink } from 'lucide-react';
import { AI_PROVIDERS, testOllamaConnection } from '../data/aiProviders';

export default function AISettingsModal({ isOpen, onClose, currentConfig, onSaveConfig }) {
  const [config, setConfig] = useState(currentConfig);
  const [testStatus, setTestStatus] = useState(null); // { loading, success, message }
  const [showKey, setShowKey] = useState(false);

  if (!isOpen) return null;

  const selectedProvider = AI_PROVIDERS.find(p => p.id === config.providerId) || AI_PROVIDERS[0];

  const handleProviderChange = (newProviderId) => {
    const prov = AI_PROVIDERS.find(p => p.id === newProviderId);
    setConfig(prev => ({
      ...prev,
      providerId: newProviderId,
      baseUrl: prov.defaultUrl || '',
      model: prov.defaultModel || prev.model
    }));
    setTestStatus(null);
  };

  const handleTestOllama = async () => {
    setTestStatus({ loading: true, message: 'Pinging Ollama endpoint...' });
    const res = await testOllamaConnection(config.baseUrl);
    setTestStatus({ loading: false, success: res.success, message: res.message });
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSaveConfig(config);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      zIndex: 1200
    }}>
      <div style={{
        width: '560px',
        maxWidth: '100%',
        maxHeight: '90vh',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Cpu size={18} color="#818cf8" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>AI Provider Configuration</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Configure local Ollama, Google Gemini, OpenAI, Groq, or offline mode.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '6px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSave} style={{
          padding: '20px 24px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Provider Selection Cards */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              Select Active AI Provider
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
              {AI_PROVIDERS.map(p => {
                const isSelected = config.providerId === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleProviderChange(p.id)}
                    style={{
                      padding: '10px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-card)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: '700', color: isSelected ? 'var(--accent-indigo)' : 'var(--text-primary)' }}>
                        {p.name.split(' (')[0]}
                      </span>
                      {isSelected && <Check size={14} color="#6366f1" />}
                    </div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      {p.badge}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Provider Description Banner */}
          <div style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)'
          }}>
            {selectedProvider.description}
          </div>

          {/* OLLAMA LOCAL CONFIG */}
          {selectedProvider.id === 'ollama' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              background: 'rgba(16, 185, 129, 0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: '700', fontSize: '0.84rem' }}>
                <Server size={16} /> Local Ollama Settings (100% Free & Private)
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Ollama Base URL
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={config.baseUrl || 'http://localhost:11434'}
                    onChange={e => setConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                    placeholder="http://localhost:11434"
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-medium)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.82rem',
                      fontFamily: 'var(--font-mono)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleTestOllama}
                    disabled={testStatus?.loading}
                    className="btn btn-secondary btn-sm"
                  >
                    {testStatus?.loading ? <RefreshCw size={14} className="spin" /> : 'Ping Ollama'}
                  </button>
                </div>
              </div>

              {testStatus && (
                <div style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.76rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: testStatus.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                  color: testStatus.success ? '#10b981' : '#f43f5e',
                  border: `1px solid ${testStatus.success ? '#10b981' : '#f43f5e'}`
                }}>
                  {testStatus.success ? <Check size={14} /> : <AlertCircle size={14} />}
                  <span>{testStatus.message}</span>
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Model Name (e.g. llama3, deepseek-r1, qwen2.5-coder)
                </label>
                <input
                  type="text"
                  value={config.model || 'llama3'}
                  onChange={e => setConfig(prev => ({ ...prev, model: e.target.value }))}
                  placeholder="llama3"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-medium)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem',
                    fontFamily: 'var(--font-mono)'
                  }}
                />
              </div>

              {/* Quick Model Chips */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {selectedProvider.popularModels?.map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, model: m }))}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      border: config.model === m ? '1px solid #10b981' : '1px solid var(--border-subtle)',
                      background: config.model === m ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-card)',
                      color: config.model === m ? '#10b981' : 'var(--text-secondary)',
                      fontSize: '0.7rem',
                      cursor: 'pointer'
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                💡 <strong>Ollama Tip:</strong> In your terminal, run <code>ollama run llama3</code> or <code>ollama run deepseek-r1</code>. If browser calls are blocked by CORS, start with <code>OLLAMA_ORIGINS="*" ollama serve</code>.
              </div>
            </div>
          )}

          {/* CLOUD API KEYS (Gemini, OpenAI, Groq, DeepSeek, OpenRouter) */}
          {selectedProvider.requiresApiKey && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              background: 'var(--bg-tertiary)'
            }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  {selectedProvider.name} API Key
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={config.apiKey || ''}
                    onChange={e => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="Enter your API key..."
                    required
                    style={{
                      width: '100%',
                      padding: '8px 60px 8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-medium)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.82rem',
                      fontFamily: 'var(--font-mono)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '6px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '0.72rem'
                    }}
                  >
                    {showKey ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Model Selector
                </label>
                <input
                  type="text"
                  value={config.model || selectedProvider.defaultModel}
                  onChange={e => setConfig(prev => ({ ...prev, model: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-medium)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem',
                    fontFamily: 'var(--font-mono)'
                  }}
                />
              </div>

              {/* Popular Models */}
              {selectedProvider.popularModels?.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {selectedProvider.popularModels.map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, model: m }))}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        border: config.model === m ? '1px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                        background: config.model === m ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-card)',
                        color: config.model === m ? 'var(--accent-indigo)' : 'var(--text-secondary)',
                        fontSize: '0.7rem',
                        cursor: 'pointer'
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" id="btn-save-ai-settings">
              <Sparkles size={15} /> Save & Apply Provider
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
