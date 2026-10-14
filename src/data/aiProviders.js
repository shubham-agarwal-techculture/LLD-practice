// Multi-Provider AI Engine for LLD Craft
// Supports: Ollama (Local), Google Gemini, OpenAI, Groq, DeepSeek, OpenRouter, Anthropic, and Offline Built-in

export const AI_PROVIDERS = [
  {
    id: 'offline',
    name: 'Built-in Socratic (Offline)',
    badge: 'No Key Needed',
    type: 'offline',
    defaultModel: 'socratic-v1',
    description: 'Instant heuristic expert guidance tailored to each LLD milestone without internet or keys.',
    requiresApiKey: false
  },
  {
    id: 'ollama',
    name: 'Ollama (Local AI)',
    badge: '100% Private / Free',
    type: 'local',
    defaultUrl: 'http://localhost:11434',
    defaultModel: 'llama3',
    popularModels: ['llama3', 'deepseek-r1', 'qwen2.5-coder', 'mistral', 'codellama', 'llama3.2', 'phi3'],
    description: 'Run completely locally on your machine via Ollama. No data leaves your computer.',
    requiresApiKey: false
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    badge: 'Google AI',
    type: 'cloud',
    defaultUrl: 'https://generativelanguage.googleapis.com',
    defaultModel: 'gemini-1.5-flash',
    popularModels: ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'],
    description: 'Ultra fast multi-modal AI from Google with generous free tier.',
    requiresApiKey: true
  },
  {
    id: 'openai',
    name: 'OpenAI (GPT-4o)',
    badge: 'Cloud API',
    type: 'cloud',
    defaultUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    popularModels: ['gpt-4o-mini', 'gpt-4o', 'o3-mini', 'gpt-4-turbo'],
    description: 'State of the art reasoning models from OpenAI.',
    requiresApiKey: true
  },
  {
    id: 'groq',
    name: 'Groq (Ultra-Fast LPU)',
    badge: 'High Speed',
    type: 'cloud',
    defaultUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    popularModels: ['llama-3.3-70b-versatile', 'deepseek-r1-distill-llama-70b', 'mixtral-8x7b-32768'],
    description: 'Blazing fast inference powered by Groq LPUs.',
    requiresApiKey: true
  },
  {
    id: 'deepseek',
    name: 'DeepSeek API',
    badge: 'Reasoning AI',
    type: 'cloud',
    defaultUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    popularModels: ['deepseek-chat', 'deepseek-reasoner'],
    description: 'DeepSeek reasoning models specialized in code and system architecture.',
    requiresApiKey: true
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    badge: 'Unified Gateway',
    type: 'cloud',
    defaultUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'meta-llama/llama-3.3-70b-instruct',
    popularModels: [
      'meta-llama/llama-3.3-70b-instruct',
      'deepseek/deepseek-r1',
      'anthropic/claude-3.5-sonnet',
      'google/gemini-flash-1.5'
    ],
    description: 'Access any AI model in the world through a single API key.',
    requiresApiKey: true
  }
];

export const DEFAULT_AI_CONFIG = {
  providerId: 'offline',
  apiKey: '',
  baseUrl: 'http://localhost:11434',
  model: 'llama3',
  systemPromptPreset: 'socratic'
};

// Helper to construct the system prompt tailored to the current LLD scenario, stage, and persona
export function buildSystemPrompt(scenario, stageIndex, personaId = 'socratic') {
  const stageNames = [
    'Stage 1: Clarifying Requirements & Scope',
    'Stage 2: Identifying Domain Entities & Actors',
    'Stage 3: Class Hierarchy & UML Design',
    'Stage 4: Design Patterns & Architectural Trade-offs',
    'Stage 5: Implementation, Concurrency & Code'
  ];

  const personaInstruction = {
    socratic: 'You are Socrates, a world-class Low-Level Design (LLD) coach. Do NOT immediately dump full code unless requested. Ask probing questions, nudge the user toward discovering trade-offs, explain core invariants, and guide step-by-step.',
    architect: 'You are Ada, a Staff Distributed Systems Architect. Focus deeply on SOLID principles, coupling vs cohesion, concurrency locks, data races, deadlocks, and why specific design patterns are chosen over alternatives.',
    interviewer: 'You are Marcus, a Principal FAANG Mock Interviewer. Pressure-test the design for sneaky edge cases, race conditions, memory limits, and single-point-of-failure bottlenecks. Be direct, insightful, and rigorous.'
  }[personaId] || 'You are an expert Low-Level Design tutor.';

  return `${personaInstruction}

CURRENT SCENARIO CONTEXT:
- Problem: "${scenario.title}"
- Target Company: ${scenario.company}
- Difficulty: ${scenario.difficulty}
- Summary: ${scenario.summary}
- Primary Patterns: ${scenario.tags?.join(', ')}
- Current Milestone: ${stageNames[stageIndex] || 'General Practice'}

INSTRUCTIONS:
1. Provide actionable, concise, engineering-grade low-level design advice.
2. Format your response cleanly in GitHub Markdown (use bullet points, code snippets, and bold text).
3. If discussing concurrency, always pinpoint exact race conditions and atomic synchronization techniques (e.g., ReentrantLock, versioning, CAS, TTL).`;
}

// Check if local Ollama server is reachable and fetch available models
export async function testOllamaConnection(baseUrl = 'http://localhost:11434') {
  try {
    const url = baseUrl.replace(/\/+$/, '') + '/api/tags';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const models = data.models?.map(m => m.name) || [];
      return { success: true, models, message: `Connected! Found ${models.length} local models.` };
    }
    return { success: false, message: `Server responded with HTTP ${response.status}` };
  } catch (err) {
    if (err.name === 'AbortError') {
      return { success: false, message: 'Connection timed out. Is Ollama running on localhost:11434?' };
    }
    return {
      success: false,
      message: `Cannot reach Ollama at ${baseUrl}. Ensure Ollama is running ('ollama serve' or 'ollama run <model>').`
    };
  }
}

// Universal Chat Execution across all providers
export async function callAIProvider({
  config,
  scenario,
  stageIndex,
  personaId,
  messages, // array of { sender: 'user'|'mentor', text: string }
  offlineFallbackHandler
}) {
  const provider = AI_PROVIDERS.find(p => p.id === config.providerId) || AI_PROVIDERS[0];
  const systemPrompt = buildSystemPrompt(scenario, stageIndex, personaId);

  // 1. Offline heuristic fallback
  if (provider.id === 'offline') {
    const lastUserQuery = messages.filter(m => m.sender === 'user').pop()?.text || '';
    return offlineFallbackHandler(scenario, stageIndex, lastUserQuery, personaId);
  }

  // 2. Ollama Local AI
  if (provider.id === 'ollama') {
    const baseUrl = (config.baseUrl || 'http://localhost:11434').replace(/\/+$/, '');
    const model = config.model || 'llama3';

    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }))
    ];

    try {
      const res = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: formattedMessages,
          stream: false
        })
      });

      if (!res.ok) {
        throw new Error(`Ollama returned status ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      return data.message?.content || 'No response from local Ollama model.';
    } catch (err) {
      console.warn('Ollama call failed, falling back to offline mentor:', err);
      const offlineAnswer = offlineFallbackHandler(scenario, stageIndex, messages[messages.length - 1]?.text || '', personaId);
      return `⚠️ **Ollama Local Connection Error:** ${err.message}\n\n*(Note: Ensure Ollama is running locally: \`ollama run ${model}\`. If CORS blocks browser access, launch Ollama with \`OLLAMA_ORIGINS="*" ollama serve\`.)*\n\n---\n\n${offlineAnswer}`;
    }
  }

  // 3. Google Gemini
  if (provider.id === 'gemini') {
    if (!config.apiKey) {
      throw new Error('Gemini API key is required. Please enter your API key in AI Settings.');
    }

    const model = config.model || 'gemini-1.5-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey.trim()}`;

    // Convert messages to Gemini contents format
    const contents = messages.map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    // Inject system instruction if supported
    const body = {
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: contents.slice(-10) // last 10 messages for context
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Gemini API returned HTTP ${res.status}`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response returned from Gemini.';
  }

  // 4. OpenAI / Groq / DeepSeek / OpenRouter (OpenAI-compatible chat completions standard)
  if (['openai', 'groq', 'deepseek', 'openrouter'].includes(provider.id)) {
    if (!config.apiKey) {
      throw new Error(`${provider.name} API key is required. Please configure it in AI Settings.`);
    }

    const defaultUrls = {
      openai: 'https://api.openai.com/v1',
      groq: 'https://api.groq.com/openai/v1',
      deepseek: 'https://api.deepseek.com/v1',
      openrouter: 'https://openrouter.ai/api/v1'
    };

    const baseUrl = (config.baseUrl || defaultUrls[provider.id]).replace(/\/+$/, '');
    const model = config.model || provider.defaultModel;

    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-8).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }))
    ];

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey.trim()}`
    };

    if (provider.id === 'openrouter') {
      headers['HTTP-Referer'] = 'http://localhost:5173';
      headers['X-Title'] = 'LLD Craft Daily Practice';
    }

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        temperature: 0.6
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || `${provider.name} API returned HTTP ${res.status}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'No completion returned.';
  }

  // Default fallback
  const lastUserQuery = messages.filter(m => m.sender === 'user').pop()?.text || '';
  return offlineFallbackHandler(scenario, stageIndex, lastUserQuery, personaId);
}

// -------------------------------------------------------------------------
// ON-DEMAND SCENARIO ARCHITECT ENGINE
// Generates complete, production-grade LLD specifications on demand
// -------------------------------------------------------------------------

export async function generateScenarioOnDemand({
  config,
  prompt,
  domain = 'General',
  difficulty = 'Medium',
  focus = 'Concurrency & Extensibility',
  language = 'Java'
}) {
  const provider = AI_PROVIDERS.find(p => p.id === config.providerId) || AI_PROVIDERS[0];

  const systemInstructions = `You are a Principal Software Architect and Staff Interviewer at a Tier-1 tech company (Google/Uber/Stripe).
Generate an exhaustive, realistic Low-Level Design (LLD) problem specification based on the user's prompt.
Respond ONLY with a valid JSON object (no markdown code blocks, no preamble, raw JSON only) matching this exact schema:
{
  "title": string,
  "difficulty": "Easy" | "Medium" | "Hard",
  "company": string,
  "estimatedTime": string,
  "category": string,
  "tags": string[],
  "summary": string,
  "realWorldContext": string,
  "requirements": {
    "functional": string[],
    "nonFunctional": string[],
    "outOfScope": string[],
    "clarifyingQuestions": [
      { "q": string, "a": string, "hint": string }
    ]
  },
  "entities": {
    "actors": [ { "name": string, "role": string } ],
    "coreEntities": [
      {
        "name": string,
        "description": string,
        "attributes": string[],
        "methods": string[],
        "relationships": string[]
      }
    ]
  },
  "classDiagram": {
    "mermaid": string
  },
  "designPatterns": [
    {
      "pattern": string,
      "appliedTo": string,
      "whyChosen": string,
      "alternatives": string
    }
  ],
  "referenceCode": {
    "java": string,
    "python": string
  }
}`;

  const userQuery = `Create an on-demand LLD scenario for: "${prompt}".
Domain: ${domain}
Target Difficulty: ${difficulty}
Architectural Focus: ${focus}
Primary Code Target: ${language}`;

  // If Cloud/Local AI is available, attempt live generation
  if (provider.id !== 'offline') {
    try {
      let rawJson = '';

      if (provider.id === 'ollama') {
        const baseUrl = (config.baseUrl || 'http://localhost:11434').replace(/\/+$/, '');
        const model = config.model || 'llama3';
        const res = await fetch(`${baseUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemInstructions },
              { role: 'user', content: userQuery }
            ],
            stream: false,
            format: 'json'
          })
        });
        if (res.ok) {
          const data = await res.json();
          rawJson = data.message?.content || '';
        }
      } else if (provider.id === 'gemini') {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${config.model || 'gemini-1.5-flash'}:generateContent?key=${config.apiKey.trim()}`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstructions }] },
            contents: [{ role: 'user', parts: [{ text: userQuery }] }],
            generationConfig: { responseMimeType: 'application/json' }
          })
        });
        if (res.ok) {
          const data = await res.json();
          rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }
      } else if (['openai', 'groq', 'deepseek', 'openrouter'].includes(provider.id)) {
        const defaultUrls = {
          openai: 'https://api.openai.com/v1',
          groq: 'https://api.groq.com/openai/v1',
          deepseek: 'https://api.deepseek.com/v1',
          openrouter: 'https://openrouter.ai/api/v1'
        };
        const baseUrl = (config.baseUrl || defaultUrls[provider.id]).replace(/\/+$/, '');
        const res = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey.trim()}`
          },
          body: JSON.stringify({
            model: config.model || provider.defaultModel,
            messages: [
              { role: 'system', content: systemInstructions },
              { role: 'user', content: userQuery }
            ],
            response_format: { type: 'json_object' }
          })
        });
        if (res.ok) {
          const data = await res.json();
          rawJson = data.choices?.[0]?.message?.content || '';
        }
      }

      if (rawJson) {
        // Strip markdown backticks if returned
        const cleaned = rawJson.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
        const parsed = JSON.parse(cleaned);
        return {
          id: 'custom-' + Date.now(),
          dayIndex: 0,
          isCustom: true,
          simulatorType: 'parking-lot',
          ...parsed
        };
      }
    } catch (err) {
      console.warn('Live AI scenario generation failed, using parametric synthesizer:', err);
    }
  }

  // High-Quality Parametric Fallback Synthesizer (Zero-Failure Guarantee)
  return buildParametricScenario(prompt, domain, difficulty, focus, language);
}

function buildParametricScenario(prompt, domain, difficulty, focus, language) {
  const cleanTitle = prompt.trim();
  const slug = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const entityBase = cleanTitle.replace(/[^a-zA-Z]/g, '');

  return {
    id: 'on-demand-' + Date.now(),
    dayIndex: 0,
    isCustom: true,
    title: cleanTitle.startsWith('Design') ? cleanTitle : `Design a ${cleanTitle}`,
    difficulty,
    company: domain === 'Fintech' ? 'Stripe / PayPal' : domain === 'Ride-Sharing' ? 'Uber / Lyft' : domain === 'E-Commerce' ? 'Amazon / Shopify' : 'Google / Meta / Netflix',
    estimatedTime: difficulty === 'Hard' ? '55 mins' : difficulty === 'Medium' ? '45 mins' : '30 mins',
    category: `${domain} Architecture & ${focus}`,
    tags: [focus.split('&')[0].trim(), 'SOLID', 'Clean Architecture', domain],
    summary: `Architect a production-ready, fault-tolerant low-level design for ${cleanTitle}. Prioritizes ${focus.toLowerCase()} and high extensibility.`,
    realWorldContext: `Production systems managing ${cleanTitle} face high concurrent traffic and strict latency SLAs. A clean object-oriented contract prevents race conditions, simplifies unit testing, and adheres to the Open/Closed Principle.`,
    
    requirements: {
      functional: [
        `Register and initialize core state for ${cleanTitle}.`,
        'Support end-to-end transaction processing and state transitions.',
        'Provide pluggable execution strategies for dynamic business rules.',
        'Support concurrent access from multiple worker threads without data races.',
        'Issue immutable audit receipts / event records for every state mutation.'
      ],
      nonFunctional: [
        'Sub-50ms execution latency under high concurrent load.',
        'Thread safety: Granular resource locking to eliminate TOCTOU race conditions.',
        'Open/Closed Principle: Introduce new policies without altering tested orchestrators.'
      ],
      outOfScope: [
        'Distributed network cluster consensus protocols (assume single node LLD).',
        'Physical hardware sensor device drivers.'
      ],
      clarifyingQuestions: [
        {
          q: `How should concurrent mutations to ${cleanTitle} be synchronized?`,
          a: 'Use atomic check-and-set operations or fine-grained ReentrantLocks on individual resource IDs, avoiding monolithic synchronized methods on the root manager.',
          hint: 'Always acquire locks in a consistent canonical order to avoid deadlock.'
        },
        {
          q: 'What architectural pattern allows extending algorithms without modifying existing code?',
          a: 'The Strategy Pattern decouples execution policies from data orchestrators, allowing new behaviors to be injected via dependency injection.',
          hint: 'Define an interface with single responsibility and implement concrete classes.'
        }
      ]
    },

    entities: {
      actors: [
        { name: 'Client / Operator', role: 'Submits incoming requests and triggers lifecycle operations.' },
        { name: 'System Auditor', role: 'Monitors event logs, health metrics, and reconciliation ledger.' }
      ],
      coreEntities: [
        {
          name: `${entityBase}Orchestrator`,
          description: 'Root service coordinating worker pools, state transitions, and pluggable strategies.',
          attributes: ['id: string', 'status: ServiceStatus', 'activeContexts: ConcurrentMap'],
          methods: ['processRequest(Request req): Result', 'updateStrategy(Strategy s): void'],
          relationships: ['Manages lifecycle of domain entities and invokes strategies.']
        },
        {
          name: `${entityBase}Item`,
          description: 'Domain entity holding state invariants with fine-grained lock protection.',
          attributes: ['id: string', 'state: EntityState', 'lock: ReentrantLock', 'version: long'],
          methods: ['transitionTo(EntityState next): boolean', 'isLocked(): boolean'],
          relationships: ['Contained in repository collections.']
        },
        {
          name: `${entityBase}Strategy (Interface)`,
          description: 'Contract defining pluggable algorithmic policies.',
          attributes: ['name: string'],
          methods: ['execute(Context ctx): StrategyResult'],
          relationships: ['Implemented by specialized concrete strategies.']
        }
      ]
    },

    classDiagram: {
      mermaid: `classDiagram
    direction TB
    class ${entityBase}Orchestrator {
      -static ${entityBase}Orchestrator instance
      -Map items
      -Strategy strategy
      +process(Request) Result
    }
    class ${entityBase}Item {
      -string id
      -State state
      -Lock lock
      +updateState()
    }
    class Strategy {
      <<interface>>
      +execute(Context)
    }
    class DefaultPolicy
    class OptimizedPolicy
    Strategy <|.. DefaultPolicy
    Strategy <|.. OptimizedPolicy

    ${entityBase}Orchestrator *-- ${entityBase}Item
    ${entityBase}Orchestrator o-- Strategy`
    },

    designPatterns: [
      {
        pattern: 'Strategy Pattern',
        appliedTo: `${entityBase}Strategy Interface`,
        whyChosen: 'Allows swapping execution algorithms dynamically based on request load or customer tier.',
        alternatives: 'Nested if/else blocks that violate Open/Closed principle.'
      },
      {
        pattern: 'State Pattern',
        appliedTo: `${entityBase}Item State Transitions`,
        whyChosen: 'Enforces valid state transition invariants without scattered boolean flags.',
        alternatives: 'Loose integer status codes prone to invalid state jumps.'
      }
    ],

    referenceCode: {
      java: `// Production Implementation for ${cleanTitle}
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantLock;

public class ${entityBase}Service {
    private final ConcurrentHashMap<String, ReentrantLock> locks = new ConcurrentHashMap<>();

    public boolean executeOperation(String resourceId) {
        ReentrantLock lock = locks.computeIfAbsent(resourceId, k -> new ReentrantLock());
        lock.lock();
        try {
            // Atomic critical section
            System.out.println("Processing " + resourceId + " in " + Thread.currentThread().getName());
            return true;
        } finally {
            lock.unlock();
        }
    }
}`,
      python: `# Production Implementation for ${cleanTitle}
import threading
from collections import defaultdict

class ${entityBase}Service:
    def __init__(self):
        self._locks = defaultdict(threading.Lock)

    def execute_operation(self, resource_id: str) -> bool:
        with self._locks[resource_id]:
            # Atomic critical section
            print(f"Processing {resource_id} safely with thread lock")
            return True`
    },

    simulatorType: 'parking-lot'
  };
}

