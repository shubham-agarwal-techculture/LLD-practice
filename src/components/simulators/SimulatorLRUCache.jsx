import React, { useState } from 'react';
import { Database, ArrowRight, ArrowLeft, Plus, Search, Trash2 } from 'lucide-react';

export default function SimulatorLRUCache() {
  const CAPACITY = 4;
  const [cache, setCache] = useState([
    { key: 'user:101', val: '{"name": "Alice"}', accessCount: 1 },
    { key: 'user:102', val: '{"name": "Bob"}', accessCount: 1 },
    { key: 'user:103', val: '{"name": "Charlie"}', accessCount: 1 }
  ]);
  const [keyInput, setKeyInput] = useState('user:104');
  const [valInput, setValInput] = useState('{"name": "Diana"}');
  const [lastOp, setLastOp] = useState('Initial state loaded with 3 items.');

  const handlePut = (e) => {
    e.preventDefault();
    if (!keyInput.trim()) return;

    const existingIdx = cache.findIndex(item => item.key === keyInput);
    if (existingIdx !== -1) {
      // Update & move to head
      const updated = [...cache];
      const [item] = updated.splice(existingIdx, 1);
      item.val = valInput;
      item.accessCount += 1;
      updated.unshift(item);
      setCache(updated);
      setLastOp(`PUT: Updated existing key "${keyInput}" and moved to HEAD.`);
    } else {
      let updated = [...cache];
      let evictedMsg = '';
      if (updated.length >= CAPACITY) {
        const evicted = updated.pop();
        evictedMsg = ` Evicted LRU key "${evicted.key}" from TAIL.`;
      }
      updated.unshift({ key: keyInput, val: valInput, accessCount: 1 });
      setCache(updated);
      setLastOp(`PUT: Inserted new key "${keyInput}" at HEAD.${evictedMsg}`);
    }

    // Auto generate next key
    const nextNum = Math.floor(100 + Math.random() * 900);
    setKeyInput(`user:${nextNum}`);
  };

  const handleGet = (keyToGet) => {
    const existingIdx = cache.findIndex(item => item.key === keyToGet);
    if (existingIdx !== -1) {
      const updated = [...cache];
      const [item] = updated.splice(existingIdx, 1);
      item.accessCount += 1;
      updated.unshift(item);
      setCache(updated);
      setLastOp(`GET("${keyToGet}"): Cache HIT! Value returned & node promoted to HEAD.`);
    } else {
      setLastOp(`GET("${keyToGet}"): Cache MISS! Key not present.`);
    }
  };

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
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>O(1) LRU Cache: Doubly Linked List + HashMap Visualizer</h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Capacity: <strong>{CAPACITY} entries</strong>. Observe how hits promote to HEAD and full capacity evicts TAIL in O(1).
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
        {/* Put / Get Form */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-indigo)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={16} /> Cache Operations
          </h4>

          <form onSubmit={handlePut} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Cache Key (String)
              </label>
              <input
                type="text"
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-medium)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Value
              </label>
              <input
                type="text"
                value={valInput}
                onChange={e => setValInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-medium)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              <Plus size={15} /> PUT(key, value)
            </button>
          </form>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Quick GET lookup:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {cache.map(item => (
                <button
                  key={item.key}
                  onClick={() => handleGet(item.key)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.74rem', padding: '4px 8px' }}
                >
                  <Search size={12} /> {item.key}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Doubly Linked List Visual Nodes */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Doubly Linked List Structure</h4>
            <div style={{
              fontSize: '0.78rem',
              color: '#a5b4fc',
              background: 'rgba(99, 102, 241, 0.15)',
              padding: '4px 10px',
              borderRadius: '9999px'
            }}>
              Last Op: {lastOp}
            </div>
          </div>

          {/* List Chain */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            padding: '16px 8px',
            background: 'rgba(9, 13, 22, 0.9)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            {/* Dummy Head */}
            <div style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10b981',
              color: '#34d399',
              fontWeight: '700',
              fontSize: '0.8rem',
              textAlign: 'center'
            }}>
              [HEAD]
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Most Recent</div>
            </div>

            <span style={{ color: 'var(--text-muted)' }}>⇄</span>

            {cache.map((node, idx) => (
              <React.Fragment key={node.key}>
                <div style={{
                  minWidth: '150px',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: idx === 0 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.04)',
                  border: idx === 0 ? '1px solid #6366f1' : '1px solid var(--border-medium)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <div style={{ fontSize: '0.72rem', color: idx === 0 ? '#a5b4fc' : 'var(--text-secondary)', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
                    {node.key}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {node.val}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    Hits: {node.accessCount}
                  </div>
                </div>

                <span style={{ color: 'var(--text-muted)' }}>⇄</span>
              </React.Fragment>
            ))}

            {/* Dummy Tail */}
            <div style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid #f43f5e',
              color: '#fb7185',
              fontWeight: '700',
              fontSize: '0.8rem',
              textAlign: 'center'
            }}>
              [TAIL]
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Next Evicted</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
