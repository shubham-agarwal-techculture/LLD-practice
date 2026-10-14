import React, { useState } from 'react';
import { Coffee, Coins, ArrowRight, RefreshCw, CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react';

const INITIAL_ITEMS = [
  { id: 'A1', name: 'Sparkling Cola', price: 2.00, stock: 3, icon: '🥤' },
  { id: 'A2', name: 'Crunchy Chips', price: 1.50, stock: 2, icon: '🍟' },
  { id: 'B1', name: 'Dark Chocolate', price: 1.00, stock: 4, icon: '🍫' },
  { id: 'B2', name: 'Mineral Water', price: 1.00, stock: 5, icon: '💧' },
];

export default function SimulatorVendingMachine() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [balance, setBalance] = useState(0);
  const [state, setState] = useState('IDLE'); // 'IDLE' | 'HAS_MONEY' | 'DISPENSING' | 'SOLD_OUT'
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [logs, setLogs] = useState([
    'Vending machine initialized in State: IDLE. Ready for user coin insertion.'
  ]);
  const [dispensedItem, setDispensedItem] = useState(null);

  const addLog = (msg) => {
    setLogs(prev => [msg, ...prev.slice(0, 15)]);
  };

  const handleInsertMoney = (amount) => {
    if (state === 'DISPENSING') return;
    const newBal = Number((balance + amount).toFixed(2));
    setBalance(newBal);
    setState('HAS_MONEY');
    addLog(`[State: HAS_MONEY] Inserted $${amount.toFixed(2)}. Total balance: $${newBal.toFixed(2)}`);
  };

  const handleSelectItem = (item) => {
    if (item.stock <= 0) {
      addLog(`[Error] Slot ${item.id} (${item.name}) is SOLD OUT!`);
      return;
    }
    setSelectedSlot(item.id);
    addLog(`Selected item ${item.name} ($${item.price.toFixed(2)})`);

    if (balance < item.price) {
      addLog(`Insufficient funds! Need $${(item.price - balance).toFixed(2)} more to purchase.`);
    }
  };

  const handleDispense = () => {
    if (!selectedSlot) {
      addLog('[Error] No product selected.');
      return;
    }
    const item = items.find(i => i.id === selectedSlot);
    if (!item) return;

    if (item.stock <= 0) {
      addLog(`[State: SOLD_OUT] ${item.name} is out of stock.`);
      return;
    }

    if (balance < item.price) {
      addLog(`[Validation] Cannot dispense. Required: $${item.price.toFixed(2)}, Current: $${balance.toFixed(2)}`);
      return;
    }

    // Transition to DISPENSING
    setState('DISPENSING');
    addLog(`[State: DISPENSING] Dispensing ${item.name}...`);

    setTimeout(() => {
      const change = Number((balance - item.price).toFixed(2));
      // Decrement stock
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, stock: i.stock - 1 } : i));
      setDispensedItem(item);
      setBalance(0);
      setSelectedSlot(null);
      setState('IDLE');
      addLog(`[Success] Dispensed ${item.name}! Returned change: $${change.toFixed(2)}. State reset to IDLE.`);
    }, 700);
  };

  const handleRefund = () => {
    if (balance === 0) return;
    const refunded = balance;
    setBalance(0);
    setSelectedSlot(null);
    setState('IDLE');
    addLog(`[Refund] Returned $${refunded.toFixed(2)} to customer. State reverted to IDLE.`);
  };

  const resetAll = () => {
    setItems(INITIAL_ITEMS);
    setBalance(0);
    setState('IDLE');
    setSelectedSlot(null);
    setDispensedItem(null);
    setLogs(['Machine reset to initial state. State: IDLE']);
  };

  return (
    <div className="flex-col gap-5">
      {/* State Machine Overview Header */}
      <div className="card-raised flex justify-between items-center flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-indigo)' }} />
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              State Pattern Vending Machine Simulator
            </h4>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Encapsulates state transitions: <code>IdleState</code> → <code>HasMoneyState</code> → <code>DispenseState</code> → <code>SoldOutState</code>
          </p>
        </div>

        <button onClick={resetAll} className="btn btn-secondary btn-sm">
          <RefreshCw size={13} /> Reset Machine
        </button>
      </div>

      {/* State Banner */}
      <div className="card flex items-center justify-between flex-wrap gap-3" style={{ background: 'var(--surface-indigo)', borderColor: 'var(--border-indigo)' }}>
        <div className="flex items-center gap-3">
          <span className="mono-tag" style={{ background: 'var(--accent-indigo)', color: '#fff', border: 'none', fontWeight: 700 }}>
            CURRENT STATE
          </span>
          <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
            {state}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Inserted Balance:</span>
            <span className="mono-tag" style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent-emerald)', borderColor: 'var(--border-emerald)' }}>
              ${balance.toFixed(2)}
            </span>
          </div>

          {balance > 0 && (
            <button onClick={handleRefund} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px' }}>
              Return Coins (${balance.toFixed(2)})
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px' }}>
        {/* Products Grid */}
        <div className="card flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="section-label">Inventory Slots</div>
            <span className="mono-tag">Select product to vend</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {items.map(item => {
              const isSelected = selectedSlot === item.id;
              const isOutOfStock = item.stock <= 0;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className="card-raised"
                  style={{
                    cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                    border: isSelected ? '2px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                    opacity: isOutOfStock ? 0.45 : 1,
                    position: 'relative',
                    transition: 'all 0.15s ease',
                    transform: isSelected ? 'scale(1.02)' : 'none'
                  }}
                >
                  <div className="flex justify-between items-start">
                    <span style={{ fontSize: '1.8rem' }}>{item.icon}</span>
                    <span className="mono-tag" style={{ fontWeight: 700 }}>{item.id}</span>
                  </div>

                  <div style={{ marginTop: '8px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary)' }}>{item.name}</div>
                    <div className="flex justify-between items-center" style={{ marginTop: '4px' }}>
                      <span style={{ color: 'var(--accent-emerald)', fontWeight: 700, fontSize: '0.84rem' }}>
                        ${item.price.toFixed(2)}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: isOutOfStock ? 'var(--accent-rose)' : 'var(--text-secondary)' }}>
                        {isOutOfStock ? 'SOLD OUT' : `${item.stock} left`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dispenser Tray */}
          {dispensedItem && (
            <div className="card-emerald flex items-center justify-between" style={{ padding: '12px 16px' }}>
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} style={{ color: 'var(--accent-emerald)' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                    Dispenser Tray: Pick up your {dispensedItem.name} {dispensedItem.icon}!
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Enjoy your item!</div>
                </div>
              </div>
              <button onClick={() => setDispensedItem(null)} className="btn btn-secondary btn-sm">
                Collect
              </button>
            </div>
          )}
        </div>

        {/* Coin Inserter & Controls */}
        <div className="flex-col gap-4">
          <div className="card flex-col gap-3">
            <div className="section-label">Coin & Note Inserter</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              <button onClick={() => handleInsertMoney(0.50)} className="btn btn-secondary" style={{ padding: '10px' }}>
                + $0.50 Coin
              </button>
              <button onClick={() => handleInsertMoney(1.00)} className="btn btn-secondary" style={{ padding: '10px' }}>
                + $1.00 Coin
              </button>
              <button onClick={() => handleInsertMoney(2.00)} className="btn btn-secondary" style={{ padding: '10px' }}>
                + $2.00 Note
              </button>
              <button onClick={() => handleInsertMoney(5.00)} className="btn btn-secondary" style={{ padding: '10px' }}>
                + $5.00 Note
              </button>
            </div>

            <button
              onClick={handleDispense}
              disabled={!selectedSlot || state === 'DISPENSING'}
              className="btn btn-primary w-full"
              style={{ marginTop: '8px', padding: '12px' }}
            >
              {state === 'DISPENSING' ? 'Dispensing...' : 'Press Dispense Button'}
            </button>
          </div>

          {/* Activity / State Transition Log */}
          <div className="card flex-col gap-2">
            <div className="section-label">State Machine Event Log</div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                lineHeight: 1.5,
                background: 'var(--bg-code)',
                color: '#e2e8f0',
                padding: '10px',
                borderRadius: '6px',
                maxHeight: '180px',
                overflowY: 'auto'
              }}
            >
              {logs.map((log, i) => (
                <div key={i} style={{ marginBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '3px' }}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
