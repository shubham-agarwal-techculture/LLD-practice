import React, { useState, useEffect } from 'react';
import { Play, Pause, ChevronUp, ChevronDown, Check, AlertCircle } from 'lucide-react';

export default function SimulatorElevator() {
  const [currentFloor, setCurrentFloor] = useState(1);
  const [direction, setDirection] = useState('IDLE'); // 'UP', 'DOWN', 'IDLE'
  const [destinations, setDestinations] = useState(new Set());
  const [doorState, setDoorState] = useState('CLOSED'); // 'OPEN', 'CLOSED'
  const [autoRun, setAutoRun] = useState(false);
  const [log, setLog] = useState(['Elevator system initialized at Floor 1 (IDLE).']);

  const addLog = (msg) => {
    setLog(prev => [msg, ...prev.slice(0, 7)]);
  };

  const handleRequestFloor = (floor) => {
    if (floor === currentFloor && doorState === 'OPEN') return;
    
    const newDests = new Set(destinations);
    newDests.add(floor);
    setDestinations(newDests);

    addLog(`Floor ${floor} requested.`);

    if (direction === 'IDLE') {
      setDirection(floor > currentFloor ? 'UP' : floor < currentFloor ? 'DOWN' : 'IDLE');
    }
  };

  const stepSimulation = () => {
    if (doorState === 'OPEN') {
      setDoorState('CLOSED');
      addLog(`Doors closed at Floor ${currentFloor}.`);
      return;
    }

    if (destinations.size === 0) {
      setDirection('IDLE');
      return;
    }

    let nextFloor = currentFloor;
    let nextDir = direction;

    if (direction === 'UP') {
      const upStops = Array.from(destinations).filter(f => f > currentFloor);
      if (upStops.length > 0) {
        nextFloor = currentFloor + 1;
      } else {
        // Change direction or go IDLE
        const downStops = Array.from(destinations).filter(f => f < currentFloor);
        if (downStops.length > 0) {
          nextDir = 'DOWN';
          nextFloor = currentFloor - 1;
        } else {
          nextDir = 'IDLE';
        }
      }
    } else if (direction === 'DOWN') {
      const downStops = Array.from(destinations).filter(f => f < currentFloor);
      if (downStops.length > 0) {
        nextFloor = currentFloor - 1;
      } else {
        const upStops = Array.from(destinations).filter(f => f > currentFloor);
        if (upStops.length > 0) {
          nextDir = 'UP';
          nextFloor = currentFloor + 1;
        } else {
          nextDir = 'IDLE';
        }
      }
    } else {
      // Was IDLE, determine direction
      const nextTarget = Array.from(destinations)[0];
      if (nextTarget > currentFloor) {
        nextDir = 'UP';
        nextFloor = currentFloor + 1;
      } else if (nextTarget < currentFloor) {
        nextDir = 'DOWN';
        nextFloor = currentFloor - 1;
      }
    }

    setCurrentFloor(nextFloor);
    setDirection(nextDir);

    if (destinations.has(nextFloor)) {
      const newDests = new Set(destinations);
      newDests.delete(nextFloor);
      setDestinations(newDests);
      setDoorState('OPEN');
      addLog(`Elevator arrived at Floor ${nextFloor}. Doors OPEN.`);
    } else {
      addLog(`Elevator moving ${nextDir} through Floor ${nextFloor}...`);
    }
  };

  useEffect(() => {
    let timer;
    if (autoRun) {
      timer = setInterval(() => {
        stepSimulation();
      }, 1200);
    }
    return () => clearInterval(timer);
  }, [autoRun, currentFloor, direction, destinations, doorState]);

  const floors = [6, 5, 4, 3, 2, 1];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Elevator Simulator Header */}
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
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>Elevator State Machine & LOOK Dispatch Simulator</h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Simulates elevator car state transitions: IDLE, MOVING_UP, MOVING_DOWN, and DOOR_OPEN.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setAutoRun(!autoRun)}
              className={autoRun ? 'btn btn-accent btn-sm' : 'btn btn-secondary btn-sm'}
            >
              {autoRun ? <><Pause size={14} /> Pause Auto-Step</> : <><Play size={14} /> Auto-Step Clock</>}
            </button>
            <button onClick={stepSimulation} className="btn btn-primary btn-sm">
              ▶ Step Once
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
        {/* Elevator Shaft Visualization */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {floors.map(floorNum => {
              const isCarHere = currentFloor === floorNum;
              const hasRequest = destinations.has(floorNum);

              return (
                <div
                  key={floorNum}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '70px 1fr 140px',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: isCarHere ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255,255,255,0.02)'
                  }}
                >
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', color: isCarHere ? '#a5b4fc' : 'var(--text-secondary)' }}>
                    Floor {floorNum}
                  </div>

                  {/* Shaft Slot */}
                  <div style={{
                    height: '42px',
                    borderRadius: 'var(--radius-sm)',
                    border: isCarHere ? '2px solid #6366f1' : '1px dashed rgba(255,255,255,0.1)',
                    background: isCarHere ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    transition: 'all 0.3s'
                  }}>
                    {isCarHere && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          background: doorState === 'OPEN' ? '#10b981' : '#6366f1',
                          color: '#fff'
                        }}>
                          {doorState === 'OPEN' ? '🚪 DOORS OPEN' : '🛗 CAR [BUSY]'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                          Dir: <strong>{direction}</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Hall Call Button */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                    <button
                      onClick={() => handleRequestFloor(floorNum)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-sm)',
                        border: hasRequest ? '1px solid #10b981' : '1px solid var(--border-medium)',
                        background: hasRequest ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)',
                        color: hasRequest ? '#34d399' : '#fff',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {hasRequest ? <Check size={12} /> : null}
                      Call Floor {floorNum}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* In-Cabin Panel & Telemetry */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px'
          }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', color: 'var(--accent-indigo)' }}>
              🎛️ In-Cabin Destination Buttons
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {floors.map(f => (
                <button
                  key={f}
                  onClick={() => handleRequestFloor(f)}
                  style={{
                    padding: '10px 4px',
                    borderRadius: 'var(--radius-sm)',
                    border: destinations.has(f) ? '1px solid #6366f1' : '1px solid var(--border-medium)',
                    background: destinations.has(f) ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255,255,255,0.05)',
                    color: destinations.has(f) ? '#a5b4fc' : '#fff',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Event Log */}
          <div style={{
            background: 'rgba(9, 13, 22, 0.9)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
            fontSize: '0.75rem'
          }}>
            <h5 style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.78rem' }}>
              📜 Real-Time Dispatch Log
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontFamily: 'var(--font-mono)' }}>
              {log.map((entry, idx) => (
                <div key={idx} style={{ color: idx === 0 ? '#6ee7b7' : 'var(--text-muted)' }}>
                  › {entry}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
