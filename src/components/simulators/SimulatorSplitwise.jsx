import React, { useState } from 'react';
import { Users, DollarSign, ArrowRight, RefreshCw, PlusCircle, CheckCircle2 } from 'lucide-react';

const INITIAL_USERS = [
  { id: 'u1', name: 'Alice', avatar: '👩' },
  { id: 'u2', name: 'Bob', avatar: '👨' },
  { id: 'u3', name: 'Charlie', avatar: '🧑' },
  { id: 'u4', name: 'Diana', avatar: '👩‍🦰' }
];

export default function SimulatorSplitwise() {
  const [users] = useState(INITIAL_USERS);
  const [expenses, setExpenses] = useState([
    {
      id: 'e1',
      desc: 'Weekend Airbnb Villa',
      amount: 4000,
      paidBy: 'u1', // Alice paid 4000
      splitType: 'EQUAL',
      shares: { u1: 1000, u2: 1000, u3: 1000, u4: 1000 }
    },
    {
      id: 'e2',
      desc: 'Dinner & Drinks',
      amount: 1200,
      paidBy: 'u2', // Bob paid 1200
      splitType: 'EQUAL',
      shares: { u1: 300, u2: 300, u3: 300, u4: 300 }
    }
  ]);

  const [desc, setDesc] = useState('Groceries & Snacks');
  const [amount, setAmount] = useState(800);
  const [paidBy, setPaidBy] = useState('u3'); // Charlie
  const [splitType, setSplitType] = useState('EQUAL');

  // Compute Net Balances
  // Positive = Owed money (Creditor), Negative = Owes money (Debtor)
  const netBalances = {};
  users.forEach(u => (netBalances[u.id] = 0));

  expenses.forEach(exp => {
    // Payer credited total amount
    netBalances[exp.paidBy] = (netBalances[exp.paidBy] || 0) + exp.amount;
    // Each participant debited their share
    Object.entries(exp.shares).forEach(([uid, share]) => {
      netBalances[uid] = (netBalances[uid] || 0) - share;
    });
  });

  // Simplified Settlement Graph (Min-Cash-Flow Algorithm)
  const computeSimplifiedSettlements = () => {
    const debtors = [];
    const creditors = [];

    Object.entries(netBalances).forEach(([uid, net]) => {
      if (net < -0.01) debtors.push({ uid, amount: -net });
      else if (net > 0.01) creditors.push({ uid, amount: net });
    });

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const transactions = [];
    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const settleAmount = Math.min(debtor.amount, creditor.amount);

      transactions.push({
        from: debtor.uid,
        to: creditor.uid,
        amount: Math.round(settleAmount)
      });

      debtor.amount -= settleAmount;
      creditor.amount -= settleAmount;

      if (debtor.amount < 0.01) i++;
      if (creditor.amount < 0.01) j++;
    }

    return transactions;
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    const sharePerUser = numAmount / users.length;
    const shares = {};
    users.forEach(u => (shares[u.id] = sharePerUser));

    const newExp = {
      id: 'e-' + Date.now(),
      desc: desc || 'Expense',
      amount: numAmount,
      paidBy,
      splitType,
      shares
    };

    setExpenses([newExp, ...expenses]);
    setDesc('');
    setAmount(500);
  };

  const getUserName = (id) => users.find(u => u.id === id)?.name || id;
  const getUserAvatar = (id) => users.find(u => u.id === id)?.avatar || '👤';

  const transactions = computeSimplifiedSettlements();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid var(--border-glow)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        boxShadow: 'var(--shadow-glow)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="pulse-indicator"></span>
              <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>Splitwise Graph & Balance Settlement Engine</h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Live execution of Strategy Pattern expense splits and greedy Min-Cash-Flow graph debt simplification.
            </p>
          </div>
        </div>

        {/* User Balance Cards Grid */}
        <div style={{
          marginTop: '16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px'
        }}>
          {users.map(u => {
            const net = netBalances[u.id] || 0;
            return (
              <div
                key={u.id}
                style={{
                  background: 'rgba(9, 13, 22, 0.9)',
                  border: `1px solid ${net > 0 ? 'rgba(16, 185, 129, 0.4)' : net < 0 ? 'rgba(244, 63, 94, 0.4)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <div style={{ fontSize: '1.6rem' }}>{u.avatar}</div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '0.88rem' }}>{u.name}</div>
                  <div style={{
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    color: net > 0 ? '#34d399' : net < 0 ? '#fb7185' : 'var(--text-muted)'
                  }}>
                    {net > 0 ? `+₹${Math.round(net)} (Gets back)` : net < 0 ? `-₹${Math.abs(Math.round(net))} (Owes)` : 'Settled up'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 360px) 1fr', gap: '20px' }}>
        {/* Add Expense Form */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '18px'
        }}>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: '#a5b4fc' }}>
            <PlusCircle size={16} /> Record New Split Expense
          </h4>

          <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Description
              </label>
              <input
                type="text"
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="e.g. Flight tickets"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-medium)',
                  background: 'rgba(10, 15, 26, 0.8)',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Total Amount (₹)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-medium)',
                    background: 'rgba(10, 15, 26, 0.8)',
                    color: '#fff',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Paid By
                </label>
                <select
                  value={paidBy}
                  onChange={e => setPaidBy(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-medium)',
                    background: 'rgba(10, 15, 26, 0.8)',
                    color: '#fff',
                    fontSize: '0.85rem'
                  }}
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Split Strategy
              </label>
              <div style={{
                display: 'flex',
                gap: '8px',
                padding: '6px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.78rem'
              }}>
                <span style={{ color: '#a5b4fc', fontWeight: '600' }}>EQUAL SPLIT</span>
                <span style={{ color: 'var(--text-muted)' }}>({users.length} members each get 25%)</span>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '6px' }}>
              <DollarSign size={16} /> Add Expense
            </button>
          </form>
        </div>

        {/* Simplified Settlement Graph (Min Cash Flow) */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} color="#10b981" /> Simplified Debt Settlement (Min Cash Flow)
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Total Transactions: <strong>{transactions.length}</strong> (reduced from {users.length * (users.length - 1)})
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                All balances are perfectly settled! No pending debt transfers required.
              </div>
            ) : (
              transactions.map((tx, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(9, 13, 22, 0.85)',
                    border: '1px solid rgba(99, 102, 241, 0.25)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{getUserAvatar(tx.from)}</span>
                    <span style={{ fontWeight: '600', color: '#fda4af' }}>{getUserName(tx.from)}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      background: 'rgba(99, 102, 241, 0.15)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      color: '#a5b4fc',
                      fontWeight: '700',
                      fontSize: '0.85rem'
                    }}>
                      pays ₹{tx.amount}
                    </div>
                    <ArrowRight size={16} color="#94a3b8" />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: '600', color: '#6ee7b7' }}>{getUserName(tx.to)}</span>
                    <span style={{ fontSize: '1.2rem' }}>{getUserAvatar(tx.to)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
