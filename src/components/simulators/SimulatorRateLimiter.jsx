import React, { useState, useEffect } from 'react';
import { ShieldAlert, Zap, Send, RefreshCw, CheckCircle2, AlertOctagon } from 'lucide-react';

export default function SimulatorRateLimiter() {
  const CAPACITY = 10;
  const REFILL_RATE = 2; // 2 tokens per sec

  const [tokens, setTokens] = useState(10);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ total: 0, passed: 0, throttled: 0 });

  // Refill timer every 500ms
  useEffect(() => {
    const interval = setInterval(() => {
      setTokens(prev => Math.min(CAPACITY, prev + REFILL_RATE * 0.5));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const sendRequest = (count = 1) => {
    let currentTokens = tokens;
    const newLogs = [];
    let passedCount = 0;
    let throttledCount = 0;

    for (let i = 0; i < count; i++) {
      const now = new Date().toLocaleTimeString();
      if (currentTokens >= 1) {
        currentTokens -= 1;
        passedCount++;
        newLogs.unshift({
          time: now,
          status: 200,
          msg: '200 OK — Request processed successfully',
          remaining: Math.floor(currentTokens)
        });
      } else {
        throttledCount++;
        newLogs.unshift({
          time: now,
          status: 429,
          msg: '429 Too Many Requests — Token bucket depleted!',
          remaining: 0
        });
      }
    }

    setTokens(currentTokens);
    setLogs(prev => [...newLogs, ...prev].slice(0, 10));
    setStats(prev => ({
      total: prev.total + count,
      passed: prev.passed + passedCount,
      throttled: prev.throttled + throttledCount
    }));
  };

  const tokenPercent = Math.min(100, Math.round((tokens / CAPACITY) * 100));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="pulse-indicator"></span>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>Token Bucket Rate Limiter Runtime</h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Simulates thread-safe token consumption, continuous background refill, and HTTP 429 backoff headers.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => sendRequest(1)} className="btn btn-primary btn-sm">
              <Send size={14} /> Send 1 Request
            </button>
            <button onClick={() => sendRequest(5)} className="btn btn-secondary btn-sm">
              <Zap size={14} color="#f59e0b" /> Burst 5 Requests
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
        {/* Token Bucket Visual Gauge */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <h4 style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Bucket State & Capacity</h4>

          {/* Visual Tank */}
          <div style={{
            width: '140px',
            height: '180px',
            borderRadius: '0 0 16px 16px',
            border: '3px solid #6366f1',
            borderTop: 'none',
            position: 'relative',
            background: 'rgba(10, 15, 26, 0.9)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'flex-end'
          }}>
            <div style={{
              width: '100%',
              height: `${tokenPercent}%`,
              background: tokenPercent > 20 ? 'linear-gradient(180deg, #6366f1 0%, #3b82f6 100%)' : 'linear-gradient(180deg, #f43f5e 0%, #e11d48 100%)',
              transition: 'height 0.4s ease-out'
            }} />

            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontFamily: 'var(--font-mono)',
              fontWeight: '700',
              fontSize: '1.2rem',
              color: '#fff',
              textShadow: '0 2px 4px rgba(0,0,0,0.8)'
            }}>
              {Math.floor(tokens)} / {CAPACITY}
            </div>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            <div>Refill Rate: <strong>+{REFILL_RATE} tokens/sec</strong></div>
            <div>Max Burst Capacity: <strong>{CAPACITY} tokens</strong></div>
          </div>

          {/* Telemetry Stats */}
          <div style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            fontSize: '0.75rem',
            textAlign: 'center'
          }}>
            <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '6px' }}>
              <div style={{ color: '#34d399', fontWeight: '700', fontSize: '1rem' }}>{stats.passed}</div>
              <div style={{ color: 'var(--text-muted)' }}>Allowed (200)</div>
            </div>
            <div style={{ padding: '8px', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '6px' }}>
              <div style={{ color: '#fb7185', fontWeight: '700', fontSize: '1rem' }}>{stats.throttled}</div>
              <div style={{ color: 'var(--text-muted)' }}>Throttled (429)</div>
            </div>
          </div>
        </div>

        {/* HTTP Headers & Log Stream */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-indigo)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={16} /> HTTP Client Interceptor Stream
          </h4>

          <div style={{
            background: 'var(--bg-code)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '12px',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-mono)'
          }}>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>// Current Outgoing Headers:</div>
            <div style={{ color: '#cbd5e1' }}>X-RateLimit-Limit: {CAPACITY}</div>
            <div style={{ color: '#6ee7b7' }}>X-RateLimit-Remaining: {Math.floor(tokens)}</div>
            <div style={{ color: '#fcd34d' }}>X-RateLimit-Reset-After: {((CAPACITY - tokens) / REFILL_RATE).toFixed(1)}s</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', maxHeight: '240px' }}>
            {logs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Click "Send 1 Request" or "Burst 5 Requests" to test rate limiter behavior!
              </div>
            ) : (
              logs.map((log, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: log.status === 200 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.12)',
                    border: `1px solid ${log.status === 200 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.35)'}`,
                    fontSize: '0.78rem',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {log.status === 200 ? <CheckCircle2 size={14} color="#34d399" /> : <AlertOctagon size={14} color="#fb7185" />}
                    <span style={{ color: log.status === 200 ? '#34d399' : '#fb7185', fontWeight: '700' }}>
                      {log.status}
                    </span>
                    <span style={{ color: '#cbd5e1' }}>{log.msg}</span>
                  </div>

                  <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                    Rem: {log.remaining} | {log.time}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
