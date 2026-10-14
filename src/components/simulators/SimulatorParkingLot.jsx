import React, { useState } from 'react';
import { Car, Bike, Truck, ShieldCheck, CreditCard, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

const INITIAL_SPOTS = [
  // Floor 1
  { id: 'F1-B1', floor: 1, type: 'BIKE', label: 'Bike 1', vehicle: null },
  { id: 'F1-B2', floor: 1, type: 'BIKE', label: 'Bike 2', vehicle: null },
  { id: 'F1-C1', floor: 1, type: 'CAR', label: 'Car 1', vehicle: null },
  { id: 'F1-C2', floor: 1, type: 'CAR', label: 'Car 2', vehicle: null },
  { id: 'F1-T1', floor: 1, type: 'TRUCK', label: 'Truck 1', vehicle: null },
  // Floor 2
  { id: 'F2-B1', floor: 2, type: 'BIKE', label: 'Bike 3', vehicle: null },
  { id: 'F2-C1', floor: 2, type: 'CAR', label: 'Car 3', vehicle: null },
  { id: 'F2-C2', floor: 2, type: 'CAR', label: 'Car 4', vehicle: null },
  { id: 'F2-T1', floor: 2, type: 'TRUCK', label: 'Truck 2', vehicle: null }
];

export default function SimulatorParkingLot() {
  const [spots, setSpots] = useState(INITIAL_SPOTS);
  const [vehicleType, setVehicleType] = useState('CAR');
  const [plate, setPlate] = useState('KA-05-EV-4099');
  const [tickets, setTickets] = useState([]);
  const [recentReceipt, setRecentReceipt] = useState(null);
  const [notification, setNotification] = useState(null);

  const vehicleRates = { BIKE: 15, CAR: 30, TRUCK: 60 };

  const notify = (msg, type = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleParkVehicle = (e) => {
    e.preventDefault();
    if (!plate.trim()) {
      notify('Please enter a valid license plate number', 'error');
      return;
    }

    // Check if plate already inside
    if (tickets.some(t => t.plate.toUpperCase() === plate.trim().toUpperCase())) {
      notify(`Vehicle ${plate} is already parked inside!`, 'error');
      return;
    }

    // Nearest Available Spot Strategy
    const availableSpotIndex = spots.findIndex(s => s.type === vehicleType && !s.vehicle);

    if (availableSpotIndex === -1) {
      notify(`Sorry, Parking is Full for vehicle type: ${vehicleType}!`, 'error');
      return;
    }

    const assignedSpot = spots[availableSpotIndex];
    const ticketId = 'TCK-' + Math.floor(1000 + Math.random() * 9000);
    const newTicket = {
      ticketId,
      plate: plate.trim().toUpperCase(),
      vehicleType,
      spotId: assignedSpot.id,
      floor: assignedSpot.floor,
      entryTime: new Date(),
      simulatedDurationHours: Math.floor(1 + Math.random() * 4) // random 1-4 hrs for fee demo
    };

    const updatedSpots = [...spots];
    updatedSpots[availableSpotIndex] = {
      ...assignedSpot,
      vehicle: { plate: newTicket.plate, type: vehicleType, ticketId }
    };

    setSpots(updatedSpots);
    setTickets([newTicket, ...tickets]);
    notify(`Ticket ${ticketId} issued! Spot ${assignedSpot.id} on Floor ${assignedSpot.floor} allocated.`, 'success');
    
    // Auto-generate random next plate
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    setPlate(`KA-01-LLD-${randomDigits}`);
  };

  const handleUnpark = (ticket) => {
    const rate = vehicleRates[ticket.vehicleType] || 25;
    const fee = ticket.simulatedDurationHours * rate;

    // Release spot
    const updatedSpots = spots.map(s => {
      if (s.id === ticket.spotId) {
        return { ...s, vehicle: null };
      }
      return s;
    });

    setSpots(updatedSpots);
    setTickets(tickets.filter(t => t.ticketId !== ticket.ticketId));

    setRecentReceipt({
      receiptId: 'RCP-' + Math.floor(1000 + Math.random() * 9000),
      ticketId: ticket.ticketId,
      plate: ticket.plate,
      vehicleType: ticket.vehicleType,
      spotId: ticket.spotId,
      hours: ticket.simulatedDurationHours,
      rate,
      totalFee: fee,
      paidAt: new Date().toLocaleTimeString()
    });

    notify(`Vehicle ${ticket.plate} checked out! Paid: ₹${fee}. Spot ${ticket.spotId} is now FREE.`, 'success');
  };

  const resetSimulation = () => {
    setSpots(INITIAL_SPOTS);
    setTickets([]);
    setRecentReceipt(null);
    notify('Simulation reset to initial state.', 'info');
  };

  const getAvailableCount = (floorNum, type) => {
    return spots.filter(s => s.floor === floorNum && s.type === type && !s.vehicle).length;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Simulation Header with Real-Time Display Board */}
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
              <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>Live Smart Parking Facility Simulator</h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Interactive runtime simulation of your LLD Strategy & Concurrency design. Test entry spot allocation and checkout billing!
            </p>
          </div>

          <button onClick={resetSimulation} className="btn btn-secondary btn-sm" id="btn-reset-sim">
            <RefreshCw size={14} /> Reset State
          </button>
        </div>

        {/* Real-Time Display Board (Observer Pattern) */}
        <div style={{
          marginTop: '16px',
          background: 'rgba(9, 13, 22, 0.9)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#34d399', letterSpacing: '0.05em' }}>
              📟 ENTRANCE DISPLAY BOARD (OBSERVER PATTERN)
            </span>
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.82rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Floor 1: </span>
              <span style={{ color: '#6ee7b7', fontWeight: '600' }}>Car: {getAvailableCount(1, 'CAR')}</span> |{' '}
              <span style={{ color: '#93c5fd', fontWeight: '600' }}>Bike: {getAvailableCount(1, 'BIKE')}</span> |{' '}
              <span style={{ color: '#fcd34d', fontWeight: '600' }}>Truck: {getAvailableCount(1, 'TRUCK')}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Floor 2: </span>
              <span style={{ color: '#6ee7b7', fontWeight: '600' }}>Car: {getAvailableCount(2, 'CAR')}</span> |{' '}
              <span style={{ color: '#93c5fd', fontWeight: '600' }}>Bike: {getAvailableCount(2, 'BIKE')}</span> |{' '}
              <span style={{ color: '#fcd34d', fontWeight: '600' }}>Truck: {getAvailableCount(2, 'TRUCK')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div style={{
          padding: '10px 16px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: notification.type === 'error' ? 'rgba(244, 63, 94, 0.2)' : notification.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)',
          border: `1px solid ${notification.type === 'error' ? '#fb7185' : notification.type === 'success' ? '#34d399' : '#818cf8'}`,
          color: '#fff'
        }}>
          {notification.type === 'error' ? <AlertCircle size={16} color="#fb7185" /> : <ShieldCheck size={16} color="#34d399" />}
          {notification.msg}
        </div>
      )}

      {/* Main Interactive Grid: Entry Gate Form & Floor Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) 1fr', gap: '20px' }}>
        {/* Entry Gate Controller */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '18px'
        }}>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: '#a5b4fc' }}>
            <Sparkles size={16} /> Entry Gate Controller
          </h4>

          <form onSubmit={handleParkVehicle} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Vehicle Classification
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                <button
                  type="button"
                  id="btn-select-car"
                  onClick={() => setVehicleType('CAR')}
                  style={{
                    padding: '8px 4px',
                    borderRadius: 'var(--radius-sm)',
                    border: vehicleType === 'CAR' ? '1px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                    background: vehicleType === 'CAR' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255,255,255,0.03)',
                    color: vehicleType === 'CAR' ? '#fff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem'
                  }}
                >
                  <Car size={16} /> Car
                </button>

                <button
                  type="button"
                  id="btn-select-bike"
                  onClick={() => setVehicleType('BIKE')}
                  style={{
                    padding: '8px 4px',
                    borderRadius: 'var(--radius-sm)',
                    border: vehicleType === 'BIKE' ? '1px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                    background: vehicleType === 'BIKE' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255,255,255,0.03)',
                    color: vehicleType === 'BIKE' ? '#fff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem'
                  }}
                >
                  <Bike size={16} /> Bike
                </button>

                <button
                  type="button"
                  id="btn-select-truck"
                  onClick={() => setVehicleType('TRUCK')}
                  style={{
                    padding: '8px 4px',
                    borderRadius: 'var(--radius-sm)',
                    border: vehicleType === 'TRUCK' ? '1px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                    background: vehicleType === 'TRUCK' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255,255,255,0.03)',
                    color: vehicleType === 'TRUCK' ? '#fff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem'
                  }}
                >
                  <Truck size={16} /> Large/Truck
                </button>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                License Plate Number
              </label>
              <input
                id="input-license-plate"
                type="text"
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                placeholder="e.g. MH-12-DE-9999"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-medium)',
                  background: 'rgba(10, 15, 26, 0.8)',
                  color: '#fff',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.88rem'
                }}
              />
            </div>

            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Pricing Strategy: <strong style={{ color: '#cbd5e1' }}>HourlyRateStrategy</strong> (₹{vehicleRates[vehicleType]}/hr)
            </div>

            <button type="submit" id="btn-issue-ticket" className="btn btn-primary" style={{ width: '100%' }}>
              <CreditCard size={15} /> Issue Ticket & Assign Spot
            </button>
          </form>

          {/* Active Receipt preview if available */}
          {recentReceipt && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px dashed rgba(16, 185, 129, 0.4)',
              fontSize: '0.78rem'
            }}>
              <div style={{ fontWeight: '700', color: '#34d399', marginBottom: '6px' }}>
                🧾 LAST EXIT RECEIPT ({recentReceipt.receiptId})
              </div>
              <div>Vehicle: <strong>{recentReceipt.plate}</strong> ({recentReceipt.vehicleType})</div>
              <div>Parked Spot: <strong>{recentReceipt.spotId}</strong></div>
              <div>Duration: <strong>{recentReceipt.hours} hrs</strong> @ ₹{recentReceipt.rate}/hr</div>
              <div style={{ marginTop: '4px', fontSize: '0.85rem', color: '#10b981', fontWeight: 'bold' }}>
                Total Paid: ₹{recentReceipt.totalFee}
              </div>
            </div>
          )}
        </div>

        {/* Physical Parking Floors Visualization */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Floor 1 */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontWeight: '700', fontSize: '0.88rem', color: '#cbd5e1' }}>
                LEVEL 1 (GROUND FLOOR)
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Nearest to Entry Gate
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px' }}>
              {spots.filter(s => s.floor === 1).map(spot => (
                <div
                  key={spot.id}
                  id={`spot-${spot.id}`}
                  style={{
                    padding: '12px 8px',
                    borderRadius: 'var(--radius-md)',
                    border: spot.vehicle ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid rgba(16, 185, 129, 0.35)',
                    background: spot.vehicle ? 'rgba(244, 63, 94, 0.12)' : 'rgba(16, 185, 129, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                    {spot.id}
                  </div>

                  {spot.vehicle ? (
                    <>
                      {spot.vehicle.type === 'CAR' ? <Car size={20} color="#fb7185" /> : spot.vehicle.type === 'BIKE' ? <Bike size={20} color="#fb7185" /> : <Truck size={20} color="#fb7185" />}
                      <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#fda4af', fontFamily: 'var(--font-mono)' }}>
                        {spot.vehicle.plate}
                      </span>
                    </>
                  ) : (
                    <>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399' }} />
                      <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: '600' }}>
                        FREE
                      </span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        {spot.type}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Floor 2 */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontWeight: '700', fontSize: '0.88rem', color: '#cbd5e1' }}>
                LEVEL 2 (UPPER DECK)
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Elevator / Ramp Access
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px' }}>
              {spots.filter(s => s.floor === 2).map(spot => (
                <div
                  key={spot.id}
                  id={`spot-${spot.id}`}
                  style={{
                    padding: '12px 8px',
                    borderRadius: 'var(--radius-md)',
                    border: spot.vehicle ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid rgba(16, 185, 129, 0.35)',
                    background: spot.vehicle ? 'rgba(244, 63, 94, 0.12)' : 'rgba(16, 185, 129, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                    {spot.id}
                  </div>

                  {spot.vehicle ? (
                    <>
                      {spot.vehicle.type === 'CAR' ? <Car size={20} color="#fb7185" /> : spot.vehicle.type === 'BIKE' ? <Bike size={20} color="#fb7185" /> : <Truck size={20} color="#fb7185" />}
                      <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#fda4af', fontFamily: 'var(--font-mono)' }}>
                        {spot.vehicle.plate}
                      </span>
                    </>
                  ) : (
                    <>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399' }} />
                      <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: '600' }}>
                        FREE
                      </span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        {spot.type}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Active Tickets & Exit Gate Checkout Table */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.7)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '18px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h4 style={{ fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={16} color="#6366f1" /> Active Tickets at Exit Gate ({tickets.length} Parked)
          </h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Simulate Exit Gate Barrier Release & Payment Strategy
          </span>
        </div>

        {tickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No vehicles currently parked. Issue a ticket above to park a car, bike, or truck!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                  <th style={{ padding: '8px' }}>Ticket ID</th>
                  <th style={{ padding: '8px' }}>Plate</th>
                  <th style={{ padding: '8px' }}>Vehicle</th>
                  <th style={{ padding: '8px' }}>Spot ID</th>
                  <th style={{ padding: '8px' }}>Floor</th>
                  <th style={{ padding: '8px' }}>Simulated Duration</th>
                  <th style={{ padding: '8px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(t => (
                  <tr key={t.ticketId} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '8px', fontFamily: 'var(--font-mono)', color: '#a5b4fc', fontWeight: '600' }}>
                      {t.ticketId}
                    </td>
                    <td style={{ padding: '8px', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
                      {t.plate}
                    </td>
                    <td style={{ padding: '8px' }}>
                      <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>{t.vehicleType}</span>
                    </td>
                    <td style={{ padding: '8px', color: '#6ee7b7', fontWeight: '600' }}>
                      {t.spotId}
                    </td>
                    <td style={{ padding: '8px' }}>
                      Floor {t.floor}
                    </td>
                    <td style={{ padding: '8px', color: 'var(--text-muted)' }}>
                      ~{t.simulatedDurationHours} hrs (Est. ₹{t.simulatedDurationHours * (vehicleRates[t.vehicleType] || 25)})
                    </td>
                    <td style={{ padding: '8px' }}>
                      <button
                        onClick={() => handleUnpark(t)}
                        className="btn btn-accent btn-sm"
                        id={`btn-unpark-${t.ticketId}`}
                        style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                      >
                        💳 Checkout & Release
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
