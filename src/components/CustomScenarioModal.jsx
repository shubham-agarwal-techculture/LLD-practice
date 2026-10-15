import React, { useState } from 'react';
import { X, Sparkles, Wand2 } from 'lucide-react';

export default function CustomScenarioModal({ isOpen, onClose, onAddCustomScenario }) {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('Uber / Swiggy');
  const [difficulty, setDifficulty] = useState('Medium');
  const [pattern, setPattern] = useState('Strategy Pattern');

  if (!isOpen) return null;

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const customId = 'custom-' + Date.now();
    const newScenario = {
      id: customId,
      dayIndex: 99,
      isCustom: true,
      sourceMetadata: { type: 'manual', label: 'Manually added' },
      title: title.trim(),
      difficulty,
      company,
      estimatedTime: '45 mins',
      category: 'Object-Oriented Design',
      tags: [pattern, 'SOLID', 'Concurrency'],
      summary: `Design a production-ready, extensible low-level design for ${title.trim()} adhering to SOLID principles and clean modular architecture.`,
      realWorldContext: `Enterprise production architecture for ${title.trim()} requiring robust concurrency safety, high availability, and decoupled design patterns.`,
      requirements: {
        functional: [
          `Core CRUD and lifecycle operations for ${title.trim()}.`,
          'Support concurrent user actions without race conditions.',
          `Pluggable algorithms governed by the ${pattern}.`,
          'Audit logging and transaction receipt issuance.'
        ],
        nonFunctional: [
          'High throughput & sub-100ms response times.',
          'Thread-safe data structures & granular locking.',
          'Open/Closed extensibility for new business policies.'
        ],
        outOfScope: ['Third-party hardware protocol drivers.'],
        clarifyingQuestions: [
          {
            q: `What is the primary architectural trade-off for ${title.trim()}?`,
            a: `Balancing consistency versus throughput under heavy concurrent write loads. Use the ${pattern} to decouple policies.`,
            hint: 'Define clean interface contracts before writing concrete classes.'
          }
        ]
      },
      entities: {
        actors: [
          { name: 'End User / Client', role: 'Initiates transactions and requests operations' },
          { name: 'System Administrator', role: 'Configures rules and monitors health' }
        ],
        coreEntities: [
          {
            name: `${title.split(' ').pop()}Controller`,
            description: 'Central orchestrator managing lifecycle and dispatching operations.',
            attributes: ['id: string', 'status: Status', 'activeWorkers: Map'],
            methods: ['processRequest()', 'executeStrategy()'],
            relationships: ['Orchestrates core domain services.']
          }
        ]
      },
      classDiagram: {
        mermaid: `classDiagram
    class ${title.replace(/[^a-zA-Z]/g, '')}Controller {
      -Strategy strategy
      +process()
    }
    class Strategy {
      <<interface>>
      +execute()
    }
    ${title.replace(/[^a-zA-Z]/g, '')}Controller o-- Strategy`
      },
      designPatterns: [
        {
          pattern,
          appliedTo: 'Core Policy Execution',
          whyChosen: 'Enables hot-swapping algorithms without modifying tested orchestration code.',
          alternatives: 'Rigid switch-case statements.'
        }
      ],
      referenceCode: {
        java: `// Skeleton for ${title.trim()}
public class ${title.replace(/[^a-zA-Z]/g, '')}Service {
    public void execute() {
        System.out.println("Processing ${title.trim()}...");
    }
}`,
        python: `# Skeleton for ${title.trim()}
class ${title.replace(/[^a-zA-Z]/g, '')}Service:
    def execute(self):
        print("Processing ${title.trim()}...")`
      },
      simulatorType: 'parking-lot'
    };

    onAddCustomScenario(newScenario);
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
      zIndex: 1100
    }}>
      <div style={{
        width: '540px',
        maxWidth: '100%',
        background: 'rgba(15, 23, 42, 0.98)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wand2 size={20} color="#818cf8" />
            <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>Generate Custom LLD Scenario</h3>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '6px' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Problem Title / Scenario Prompt
            </label>
            <input
              type="text"
              placeholder="e.g. Design Swiggy Delivery Partner Allocation System"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-medium)',
                background: '#090d16',
                color: '#fff',
                fontSize: '0.86rem'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Target Company
              </label>
              <input
                type="text"
                value={company}
                onChange={e => setCompany(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-medium)',
                  background: '#090d16',
                  color: '#fff',
                  fontSize: '0.86rem'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-medium)',
                  background: '#090d16',
                  color: '#fff',
                  fontSize: '0.86rem'
                }}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Primary Design Pattern Focus
            </label>
            <select
              value={pattern}
              onChange={e => setPattern(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-medium)',
                background: '#090d16',
                color: '#fff',
                fontSize: '0.86rem'
              }}
            >
              <option value="Strategy Pattern">Strategy Pattern (Pluggable Algorithms)</option>
              <option value="State Pattern">State Pattern (Finite State Machine)</option>
              <option value="Observer Pattern">Observer Pattern (Pub-Sub & Event Listeners)</option>
              <option value="Factory Pattern">Factory Pattern (Object Instantiation)</option>
              <option value="Decorator Pattern">Decorator Pattern (Dynamic Extensibility)</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
            <Sparkles size={16} /> Scaffold & Begin Practice
          </button>
        </form>
      </div>
    </div>
  );
}
