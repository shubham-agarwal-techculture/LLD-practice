import React, { useState, useEffect } from 'react';
import { Film, Clock, ShieldCheck, Ticket, Users, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

const INITIAL_SEATS = [
  // Row A: Platinum ($20)
  { id: 'A1', row: 'A', num: 1, type: 'Platinum', price: 20, status: 'AVAILABLE' },
  { id: 'A2', row: 'A', num: 2, type: 'Platinum', price: 20, status: 'AVAILABLE' },
  { id: 'A3', row: 'A', num: 3, type: 'Platinum', price: 20, status: 'BOOKED' },
  { id: 'A4', row: 'A', num: 4, type: 'Platinum', price: 20, status: 'AVAILABLE' },
  // Row B: Gold ($15)
  { id: 'B1', row: 'B', num: 1, type: 'Gold', price: 15, status: 'AVAILABLE' },
  { id: 'B2', row: 'B', num: 2, type: 'Gold', price: 15, status: 'AVAILABLE' },
  { id: 'B3', row: 'B', num: 3, type: 'Gold', price: 15, status: 'AVAILABLE' },
  { id: 'B4', row: 'B', num: 4, type: 'Gold', price: 15, status: 'BOOKED' },
  // Row C: Silver ($10)
  { id: 'C1', row: 'C', num: 1, type: 'Silver', price: 10, status: 'AVAILABLE' },
  { id: 'C2', row: 'C', num: 2, type: 'Silver', price: 10, status: 'AVAILABLE' },
  { id: 'C3', row: 'C', num: 3, type: 'Silver', price: 10, status: 'AVAILABLE' },
  { id: 'C4', row: 'C', num: 4, type: 'Silver', price: 10, status: 'AVAILABLE' },
];

export default function SimulatorBookMyShow() {
  const [seats, setSeats] = useState(INITIAL_SEATS);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [lockTimeLeft, setLockTimeLeft] = useState(0);
  const [concurrencyLog, setConcurrencyLog] = useState([
    'System ready. Distributed lock manager initialized for Seat Inventory.'
  ]);
  const [bookingConfirmed, setBookingConfirmed] = useState(null);

  const addLog = (msg) => {
    setConcurrencyLog(prev => [msg, ...prev.slice(0, 15)]);
  };

  // Lock countdown timer
  useEffect(() => {
    if (lockTimeLeft <= 0) {
      if (selectedSeatIds.length > 0 && !bookingConfirmed) {
        // Unlock seats on expiry
        setSeats(prev => prev.map(s => selectedSeatIds.includes(s.id) ? { ...s, status: 'AVAILABLE' } : s));
        setSelectedSeatIds([]);
        addLog('[Lock Expired] 10-minute hold reservation expired! Seats unlocked back to AVAILABLE.');
      }
      return;
    }
    const timer = setInterval(() => {
      setLockTimeLeft(t => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [lockTimeLeft, selectedSeatIds, bookingConfirmed]);

  const toggleSelectSeat = (seat) => {
    if (seat.status === 'BOOKED') {
      addLog(`[Unavailable] Seat ${seat.id} is already permanently booked.`);
      return;
    }
    if (seat.status === 'LOCKED' && !selectedSeatIds.includes(seat.id)) {
      addLog(`[Concurrency Conflict] Seat ${seat.id} is temporarily LOCKED by another user checkout session!`);
      return;
    }

    if (selectedSeatIds.includes(seat.id)) {
      // Deselect
      setSelectedSeatIds(prev => prev.filter(id => id !== seat.id));
      setSeats(prev => prev.map(s => s.id === seat.id ? { ...s, status: 'AVAILABLE' } : s));
      addLog(`[Seat Released] User released seat ${seat.id}.`);
    } else {
      // Lock seat for this user
      setSelectedSeatIds(prev => [...prev, seat.id]);
      setSeats(prev => prev.map(s => s.id === seat.id ? { ...s, status: 'LOCKED' } : s));
      setLockTimeLeft(60); // 60s demo lock
      addLog(`[Atomic Lock Acquired] Seat ${seat.id} locked in memory (60s hold).`);
    }
  };

  // Simulate 2 users racing for the same seat
  const simulateRaceCondition = () => {
    const targetSeat = seats.find(s => s.id === 'C2');
    if (!targetSeat || targetSeat.status === 'BOOKED') {
      addLog('[Sim] Target seat C2 already booked. Resetting C2 to Available first...');
      setSeats(prev => prev.map(s => s.id === 'C2' ? { ...s, status: 'AVAILABLE' } : s));
      return;
    }

    addLog('⚡ [RACE CONDITION TEST] User A and User B concurrently submit lock request for Seat C2...');

    setTimeout(() => {
      // User A wins atomic lock
      setSeats(prev => prev.map(s => s.id === 'C2' ? { ...s, status: 'LOCKED' } : s));
      addLog(' Thread A (User A): ACQUIRED synchronized lock on Seat C2 -> Status: LOCKED (HTTP 200 OK)');
    }, 150);

    setTimeout(() => {
      // User B fails
      addLog('❌ Thread B (User B): REJECTED - Seat C2 already locked -> 409 Conflict: SeatCurrentlyHeldException');
    }, 280);
  };

  const handleCheckout = () => {
    if (selectedSeatIds.length === 0) return;
    const total = selectedSeatIds.reduce((sum, id) => {
      const s = seats.find(seat => seat.id === id);
      return sum + (s?.price || 0);
    }, 0);

    const bookingId = 'BMS-' + Math.floor(100000 + Math.random() * 900000);
    setSeats(prev => prev.map(s => selectedSeatIds.includes(s.id) ? { ...s, status: 'BOOKED' } : s));
    setBookingConfirmed({
      id: bookingId,
      seats: [...selectedSeatIds],
      total,
      time: new Date().toLocaleTimeString()
    });
    setSelectedSeatIds([]);
    setLockTimeLeft(0);
    addLog(`🎉 [Payment Success] Booking ${bookingId} confirmed for seats [${selectedSeatIds.join(', ')}]! Total: $${total}`);
  };

  const resetAll = () => {
    setSeats(INITIAL_SEATS);
    setSelectedSeatIds([]);
    setLockTimeLeft(0);
    setBookingConfirmed(null);
    setConcurrencyLog(['Hall state reset. All locks released.']);
  };

  const selectedSeatsData = seats.filter(s => selectedSeatIds.includes(s.id));
  const subtotal = selectedSeatsData.reduce((acc, s) => acc + s.price, 0);

  return (
    <div className="flex-col gap-5">
      {/* Simulation Header */}
      <div className="card-raised flex justify-between items-center flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Film size={17} style={{ color: 'var(--accent-indigo)' }} />
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              BookMyShow Seat Lock & Concurrency Simulator
            </h4>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Demonstrates distributed 2-step locking: <code>AVAILABLE</code> → <code>LOCKED (TTL 60s)</code> → <code>BOOKED</code>
          </p>
        </div>

        <div className="flex gap-2">
          <button onClick={simulateRaceCondition} className="btn btn-secondary btn-sm" style={{ borderColor: 'var(--border-amber)', color: 'var(--accent-amber)' }}>
            ⚡ Simulate Race Condition
          </button>
          <button onClick={resetAll} className="btn btn-secondary btn-sm">
            <RefreshCw size={13} /> Reset Hall
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px' }}>
        {/* Cinema Hall & Seats Grid */}
        <div className="card flex-col gap-4">
          {/* Movie Screen Indicator */}
          <div
            style={{
              textAlign: 'center',
              padding: '6px',
              background: 'var(--surface-indigo)',
              border: '1px solid var(--border-indigo)',
              borderRadius: '6px',
              fontSize: '0.74rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: 'var(--deco-indigo)'
            }}
          >
            SCREEN THIS WAY
          </div>

          {/* Seat Grid */}
          <div className="flex-col gap-3" style={{ padding: '10px 0' }}>
            {['Platinum', 'Gold', 'Silver'].map(category => (
              <div key={category} className="flex-col gap-1">
                <div className="flex justify-between items-center" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  <span>{category.toUpperCase()} SEATS</span>
                  <span>${category === 'Platinum' ? 20 : category === 'Gold' ? 15 : 10}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {seats.filter(s => s.type === category).map(seat => {
                    const isSelected = selectedSeatIds.includes(seat.id);
                    const isBooked = seat.status === 'BOOKED';
                    const isLocked = seat.status === 'LOCKED' && !isSelected;

                    let bg = 'var(--bg-raised)';
                    let border = 'var(--border-medium)';
                    let color = 'var(--text-primary)';

                    if (isBooked) {
                      bg = 'rgba(244, 63, 94, 0.15)';
                      border = 'var(--border-rose)';
                      color = 'var(--accent-rose)';
                    } else if (isSelected) {
                      bg = 'var(--accent-indigo)';
                      border = 'var(--accent-indigo)';
                      color = '#fff';
                    } else if (isLocked) {
                      bg = 'rgba(245, 158, 11, 0.15)';
                      border = 'var(--border-amber)';
                      color = 'var(--accent-amber)';
                    }

                    return (
                      <button
                        key={seat.id}
                        onClick={() => toggleSelectSeat(seat)}
                        disabled={isBooked}
                        className="btn"
                        style={{
                          background: bg,
                          borderColor: border,
                          color: color,
                          padding: '12px 6px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '2px',
                          cursor: isBooked ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <Ticket size={14} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{seat.id}</span>
                        <span style={{ fontSize: '0.64rem', opacity: 0.85 }}>
                          {isBooked ? 'SOLD' : isSelected ? 'HELD' : isLocked ? 'LOCK' : 'FREE'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex justify-between items-center flex-wrap gap-2 pt-2" style={{ borderTop: '1px solid var(--border-faint)', fontSize: '0.72rem' }}>
            <span className="flex items-center gap-1"><span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--bg-raised)', border: '1px solid var(--border-medium)' }} /> Available</span>
            <span className="flex items-center gap-1"><span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--accent-indigo)' }} /> Your Selection</span>
            <span className="flex items-center gap-1"><span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--accent-amber)' }} /> Locked (TTL)</span>
            <span className="flex items-center gap-1"><span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--accent-rose)' }} /> Booked</span>
          </div>
        </div>

        {/* Checkout & Lock Status */}
        <div className="flex-col gap-4">
          <div className="card flex-col gap-3">
            <div className="section-label">Reservation & Checkout</div>

            {selectedSeatIds.length > 0 ? (
              <div className="flex-col gap-3">
                <div className="card-emerald" style={{ padding: '10px 12px' }}>
                  <div className="flex justify-between items-center">
                    <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--accent-emerald)' }}>
                      Seats Held: {selectedSeatIds.join(', ')}
                    </span>
                    <span className="mono-tag" style={{ color: 'var(--accent-emerald)' }}>
                      <Clock size={11} /> {lockTimeLeft}s left
                    </span>
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, marginTop: '6px', color: 'var(--text-primary)' }}>
                    Total: ${subtotal.toFixed(2)}
                  </div>
                </div>

                <button onClick={handleCheckout} className="btn btn-success w-full" style={{ padding: '11px' }}>
                  <ShieldCheck size={15} /> Confirm & Pay ${subtotal.toFixed(2)}
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Click on any free seat in the cinema hall to temporarily lock and checkout.
              </div>
            )}

            {bookingConfirmed && (
              <div className="card-indigo" style={{ padding: '12px' }}>
                <div className="flex items-center gap-2" style={{ color: 'var(--accent-emerald)', fontWeight: 700, fontSize: '0.82rem' }}>
                  <CheckCircle2 size={15} /> Booking Confirmed!
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  ID: <code>{bookingConfirmed.id}</code> | Seats: <strong>{bookingConfirmed.seats.join(', ')}</strong> | Paid: <strong>${bookingConfirmed.total}</strong>
                </div>
              </div>
            )}
          </div>

          {/* Concurrency Audit Trail */}
          <div className="card flex-col gap-2">
            <div className="section-label">Lock Manager Concurrency Log</div>
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
              {concurrencyLog.map((log, i) => (
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
