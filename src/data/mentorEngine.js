// Socratic LLD Mentor Engine with Offline Intelligence + Optional Live LLM Integration

export const MENTOR_PERSONAS = [
  {
    id: 'socratic',
    name: 'Socrates (Coach)',
    tagline: 'Guides via probing questions & hints',
    avatar: '🦉',
    accentColor: '#6366f1'
  },
  {
    id: 'architect',
    name: 'Ada (Staff Architect)',
    tagline: 'Deep dive into trade-offs & SOLID',
    avatar: '📐',
    accentColor: '#10b981'
  },
  {
    id: 'interviewer',
    name: 'Marcus (FAANG Lead)',
    tagline: 'Edge cases & concurrency grilling',
    avatar: '⚡',
    accentColor: '#f59e0b'
  }
];

export const QUICK_PROMPTS = [
  { label: '💡 Level 1 Hint', prompt: 'Give me a gentle hint to point me in the right direction without spoiling the solution.' },
  { label: '🔒 Concurrency & Race Conditions', prompt: 'What concurrency bottlenecks or race conditions exist in this design, and how should we lock/synchronize?' },
  { label: '🏛️ SOLID Compliance', prompt: 'How do we strictly adhere to the Open/Closed and Single Responsibility principles here?' },
  { label: '⚠️ Edge Cases & Pitfalls', prompt: 'What are the top 3 sneaky edge cases an interviewer will grill me on for this problem?' },
  { label: '🔄 Pattern Alternatives', prompt: 'What alternative design patterns could be used here, and why is the chosen pattern superior?' }
];

// Offline Intelligent Response Generator based on current scenario and stage
export function generateOfflineMentorResponse(scenario, stageIndex, userQuery, personaId = 'socratic') {
  const queryLower = userQuery.toLowerCase();

  // 1. Level 1 Hint / Gentle Guidance
  if (queryLower.includes('hint') || queryLower.includes('level 1')) {
    if (stageIndex === 0) {
      return `🦉 **Socratic Hint for Scoping:**
Before writing any classes for **${scenario.title}**, ask yourself:
*What is the atomic transaction here?*
In real systems, scope creep kills LLD interviews. Focus strictly on:
1. Identifying the core flow (e.g. entry -> processing -> exit/settlement).
2. Clarifying whether you need dynamic extensibility or hardcoded rules.

*Question for you:* Which requirement here do you think has the highest chance of causing a race condition?`;
    }
    if (stageIndex === 1) {
      return `🦉 **Entity Discovery Hint:**
Look at the nouns in the functional requirements!
Avoid God Objects (e.g., putting all logic inside \`${scenario.entities?.coreEntities[0]?.name || 'Manager'}\`).
Separate:
- **Value Objects / Enums** (Statuses, Types)
- **Domain Entities** (Hold state + identity)
- **Orchestrators / Services** (Stateless coordinators)

Which entity do you think should own the state transitions?`;
    }
    if (stageIndex === 2 || stageIndex === 3) {
      return `🦉 **Architecture & Patterns Hint:**
Look closely at what varies in this problem!
If the algorithms or policies vary (e.g., allocation, pricing, scheduling, splitting), that is a prime candidate for the **Strategy Pattern**.
If the object undergoes distinct lifecycle phases, that screams **State Pattern**.

Ask yourself: *If a product manager asks for a new rule tomorrow, do you need to modify existing files or just add a new class?*`;
    }
    return `🦉 **Implementation Hint:**
Focus on writing clean, readable contracts (interfaces) first. Implement thread-safety with granular locks rather than synchronizing the entire root class!`;
  }

  // 2. Concurrency & Race conditions
  if (queryLower.includes('concurrency') || queryLower.includes('race condition') || queryLower.includes('lock') || queryLower.includes('thread')) {
    return `⚡ **Concurrency Architecture Analysis:**
In **${scenario.title}**, concurrency is the primary failure mode in production interviews!

**Key Race Conditions to Defend Against:**
1. **Double-Allocation / Reservation Collision:**
   Two threads querying simultaneously see a resource as *Available*, both grab it, and both write *Occupied*.
   *Solution:* Use optimistic locking with version numbers or fine-grained \`ReentrantLock\` on the individual resource, rather than synchronizing the whole system.
2. **Atomic State Transitions:**
   State changes must be atomic (\`AVAILABLE -> RESERVED -> OCCUPIED\`).
3. **Deadlock Prevention:**
   If a transaction requires locking multiple resources (e.g., locking two users in Splitwise or two spots), **always acquire locks in a consistent canonical order** (e.g. ordered by resource ID).`;
  }

  // 3. SOLID Compliance
  if (queryLower.includes('solid') || queryLower.includes('open/closed') || queryLower.includes('single responsibility')) {
    return `📐 **Staff Architect SOLID Review for ${scenario.title}:**

1. **S - Single Responsibility:**
   Notice how we split the data entities from the calculation logic. E.g., a Ticket or Entity holds its own attributes, while a Strategy handles fee/split algorithms.
2. **O - Open/Closed Principle:**
   The core engine depends on interfaces (\`${scenario.designPatterns[0]?.appliedTo || 'Strategy Interface'}\`). You can add 10 new behaviors by adding new classes without editing a single line of tested code.
3. **L - Liskov Substitution:**
   All subclasses can be used interchangeably via base interfaces without breaking contract invariants.
4. **I - Interface Segregation:**
   Avoid fat interfaces. Keep strategy methods focused and cohesive.
5. **D - Dependency Inversion:**
   High-level orchestrators depend on abstractions, injected via constructor parameters.`;
  }

  // 4. Edge cases
  if (queryLower.includes('edge case') || queryLower.includes('pitfall') || queryLower.includes('interview')) {
    return `⚡ **Top Interviewer Traps & Edge Cases for ${scenario.title}:**

1. **System Resource Exhaustion (Full Capacity):**
   What happens when capacity hits 100%? Does the system fail fast with an informative error or block indefinitely?
2. **Mid-Flight Hardware / Payment Failure:**
   If a user begins a flow and their network drops or payment times out, how are reserved items released? (Hint: Time-To-Live / background expiration daemon).
3. **Floating Point Rounding Errors:**
   Never use double or float for financial amounts or splits! Always use integers (in cents/paise) or \`BigDecimal\` to avoid rounding leakages.
4. **Idempotency:**
   What if a network glitch causes the client to send the same request twice? How do you prevent duplicate bookings or deductions?`;
  }

  // Default contextual guidance
  if (personaId === 'architect') {
    return `📐 **Ada (Staff Architect):**
For **${scenario.title}**, keep your architecture decoupled. Notice how this problem cleanly separates into:
1. **Domain State**
2. **Business Rules / Strategies**
3. **Orchestrator**

Would you like to analyze the trade-offs between Optimistic vs Pessimistic concurrency control, or review the class diagram structure?`;
  }

  if (personaId === 'interviewer') {
    return `⚡ **Marcus (FAANG Interviewer):**
Good start on **${scenario.title}**. In an interview, I would immediately test your design with this question:
*"Suppose we scale this from 1 instance to 10 instances behind a load balancer. Which part of your in-memory LLD breaks first, and how would you adapt your locks?"*
Think about whether your locks rely on JVM memory or an external distributed lock like Redis Redlock.`;
  }

  // Default Socratic response
  return `🦉 **Socrates:**
I see you're working on **${scenario.title}** in stage: *${['Clarify Requirements', 'Entities & Domain', 'Class Design & UML', 'Design Patterns', 'Code & Simulator'][stageIndex] || 'Practice'}*.

What is your immediate intuition for the main responsibility of the top-level controller? Would you like me to walk you through the key decisions step-by-step?`;
}
