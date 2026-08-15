import type { TopicContent } from "../types";

export const multiAgent: TopicContent = {
  quickSummary: [
    "Multi-agent systems use multiple specialized LLM agents that collaborate, delegate, and communicate to solve complex tasks that exceed the capability of any single agent.",
    "Orchestration patterns define how agents coordinate: supervisor (one agent delegates to others), pipeline (agents process sequentially), and swarm (agents self-organize based on task signals).",
    "Delegation allows a generalist agent to route sub-tasks to specialists (code agent, research agent, data agent) based on task type, improving quality through specialization.",
    "Debate and verification patterns use multiple agents to critique, verify, or vote on outputs, reducing errors through redundancy and diverse perspectives.",
  ],
  detailed: [
    "## Why Multi-Agent?\n\nSingle agents struggle with tasks that require diverse expertise, long execution chains, or parallel workstreams. Multi-agent architectures address this by decomposing work across specialized agents, each with its own system prompt, tools, and memory. Benefits include: **specialization** (each agent is optimized for a narrow domain), **parallelism** (independent sub-tasks run concurrently), **modularity** (agents can be developed, tested, and updated independently), and **reliability** (failures in one agent do not crash the entire system). The trade-off is increased complexity in orchestration, communication, and debugging.",
    "## Orchestration Patterns\n\n**Supervisor pattern**: A coordinator agent receives the task, creates a plan, and delegates sub-tasks to worker agents. The supervisor aggregates results and handles failures. This is the most common pattern (used by CrewAI, AutoGen). **Pipeline pattern**: Agents are chained sequentially, each transforming the output of the previous one (e.g., researcher -> writer -> editor). Simple but inflexible. **Swarm pattern**: Agents self-organize without a central coordinator, picking up tasks based on their capabilities and available work. More resilient but harder to debug. **Hierarchical pattern**: Multiple layers of supervisors, with top-level coordinators delegating to mid-level managers who delegate to workers. Used for very complex tasks.",
    "## Delegation and Specialization\n\nEffective delegation requires: clear task descriptions for each worker, well-defined input/output contracts between agents, routing logic to match tasks to the right specialist, and fallback handling when a specialist fails. Specialization is achieved through system prompts (different instructions per agent), tool access (code agent gets code execution, research agent gets web search), and context (each agent only receives relevant context, not the entire conversation). Over-specialization is a risk: too many narrow agents increase orchestration complexity without proportional quality gains.",
    "## Debate and Verification\n\nMulti-agent debate uses two or more agents to argue different positions on a question, with a judge agent selecting the best answer. This reduces confident errors because agents must defend their reasoning against challenges. Verification patterns include: **critic agent** (a dedicated agent reviews and critiques the primary agent's output), **voting** (multiple agents independently solve the task and the majority answer wins), and **red team/blue team** (one agent tries to find flaws while another defends). These patterns trade latency and cost for accuracy on high-stakes outputs.",
    "## Communication and State\n\nAgents communicate through shared message channels, shared memory stores, or direct message passing. Key design decisions include: message format (structured JSON vs. natural language), visibility (can all agents see all messages, or only direct communications?), and state management (shared blackboard vs. private state per agent). Shared state enables collaboration but introduces concurrency issues. Message-passing is cleaner but requires well-defined protocols. Most frameworks use a combination: a shared conversation history plus private scratchpads per agent.",
  ],
  interviewQA: [
    {
      q: "When would you choose a multi-agent architecture over a single agent?",
      a: "Multi-agent is justified when: the task requires diverse expertise that is hard to encode in one system prompt, sub-tasks can run in parallel for speed, you need independent testing and updating of components, or reliability requires redundancy (one agent verifies another). Single agents are simpler and sufficient for most tasks. The threshold is when a single agent's context window, tool set, or reliability is insufficient for the task complexity.",
    },
    {
      q: "How does the supervisor pattern work?",
      a: "A coordinator agent receives the user's request, analyzes it, creates a plan with sub-tasks, and delegates each sub-task to a specialized worker agent. Workers execute independently and return results to the supervisor. The supervisor aggregates results, handles any failures (retrying or reassigning), and synthesizes a final response. The supervisor maintains the overall plan state and decides when the task is complete.",
    },
    {
      q: "What are the trade-offs of multi-agent debate?",
      a: "Benefits: reduces confident errors through adversarial critique, surfaces edge cases one agent might miss, produces more robust reasoning. Costs: 2-3x more LLM calls (latency and cost), increased complexity in managing the debate protocol, potential for agents to converge on a wrong consensus, and the judge agent must be reliable. Best suited for high-stakes decisions where accuracy matters more than speed or cost.",
    },
  ],
  mcqs: [
    {
      q: "In the supervisor pattern, which agent creates the execution plan?",
      options: [
        "Each worker agent creates its own plan",
        "The supervisor/coordinator agent",
        "A separate planning agent not involved in execution",
        "The user specifies the plan directly",
      ],
      answerIndex: 1,
      explanation:
        "The supervisor agent analyzes the task, decomposes it into sub-tasks, delegates them to workers, and aggregates results. It owns the plan and orchestration logic.",
    },
    {
      q: "What is the main advantage of the swarm pattern?",
      options: [
        "Simplest to implement and debug",
        "Resilience: no single point of failure since there is no central coordinator",
        "Lowest latency of all patterns",
        "Requires the fewest agents",
      ],
      answerIndex: 1,
      explanation:
        "Swarm patterns have no central coordinator, so the failure of any single agent does not halt the entire system. Agents self-organize based on available tasks and capabilities.",
    },
    {
      q: "Why is over-specialization a risk in multi-agent systems?",
      options: [
        "Specialized agents are harder to train",
        "Too many narrow agents increase orchestration complexity without proportional quality gains",
        "Specialized agents consume more memory",
        "Specialized agents cannot communicate with each other",
      ],
      answerIndex: 1,
      explanation:
        "Each additional specialized agent adds routing logic, communication overhead, and failure modes. The quality improvement from narrow specialization eventually plateaus while complexity continues to grow.",
    },
  ],
  flashcards: [
    { front: "What are the four main multi-agent orchestration patterns?", back: "Supervisor (central coordinator delegates), Pipeline (sequential chain), Swarm (self-organizing, no coordinator), and Hierarchical (multi-level supervisors)." },
    { front: "What is multi-agent debate?", back: "Two or more agents argue different positions on a question. A judge agent evaluates the arguments and selects the best answer. Reduces confident errors through adversarial critique." },
    { front: "What is the critic agent pattern?", back: "A dedicated agent reviews and critiques the primary agent's output, identifying errors, gaps, or improvements before the result is returned to the user." },
    { front: "What is a shared blackboard?", back: "A shared state space that all agents can read and write to, enabling collaboration by making intermediate results visible to the entire system." },
    { front: "How does the pipeline pattern work?", back: "Agents are chained sequentially: each agent transforms the output of the previous one (e.g., researcher -> writer -> editor). Simple but inflexible." },
    { front: "What is the main trade-off of multi-agent systems?", back: "Better specialization, parallelism, and reliability at the cost of increased orchestration complexity, communication overhead, latency, and debugging difficulty." },
    { front: "What is agent routing?", back: "The logic that matches incoming tasks or sub-tasks to the most appropriate specialized agent based on task type, required tools, or domain expertise." },
  ],
  glossary: [
    { term: "Supervisor Pattern", definition: "A multi-agent orchestration where a central coordinator delegates sub-tasks to specialized workers and aggregates their results." },
    { term: "Swarm Pattern", definition: "Decentralized multi-agent orchestration where agents self-select tasks without a central coordinator." },
    { term: "Agent Delegation", definition: "Routing a sub-task from a generalist or coordinator agent to a specialized agent best suited for that task." },
    { term: "Multi-Agent Debate", definition: "Multiple agents argue different positions, with a judge selecting the best answer to reduce errors." },
    { term: "Blackboard Architecture", definition: "A shared state space where agents post and read intermediate results, enabling asynchronous collaboration." },
    { term: "Pipeline Pattern", definition: "Sequential chaining of agents where each transforms the previous agent's output." },
    { term: "Agent Specialization", definition: "Configuring an agent with a focused system prompt, specific tools, and narrow context for optimal performance on a particular task type." },
  ],
  deepDive: [
    "## The Mechanics of Agent Coordination\n\nAt the core of every multi-agent system lies a coordination protocol that determines how agents discover tasks, exchange information, and resolve conflicts. In a **supervisor-based** design, the coordinator maintains an explicit task graph: it decomposes the user request into a directed acyclic graph (DAG) of sub-tasks, assigns each node to a worker agent, and tracks completion status. When a worker finishes, the supervisor evaluates the output quality (often using an LLM-as-judge call), decides whether to accept, retry, or reassign, and then releases dependent tasks. This is fundamentally a workflow-engine problem, which is why frameworks like LangGraph model it as a state machine with typed edges and conditional transitions. The supervisor's system prompt is the most critical piece: it must encode task-decomposition heuristics, agent capability descriptions, and failure-handling policies. A common failure mode is the supervisor becoming a bottleneck when it tries to micro-manage workers or when the task graph is too deep, causing token-budget exhaustion in the supervisor's context window.",
    "## Communication Topologies and Message Protocols\n\nThe choice of communication topology profoundly affects system behavior. **Star topology** (supervisor pattern) centralizes all communication through one node, making it easy to log and debug but creating a single point of failure. **Ring topology** (pipeline) gives each agent exactly one upstream and one downstream neighbor, minimizing coordination overhead but preventing parallelism. **Mesh topology** (swarm) allows any-to-any communication, enabling emergent collaboration but making it hard to trace causality. In practice, most production systems use a **hybrid**: a star topology for task assignment with direct peer-to-peer channels for specific interactions (e.g., a code agent asking a research agent for documentation). Message protocols range from unstructured natural language (simple but ambiguous) to strongly-typed JSON schemas (precise but brittle). The sweet spot is structured messages with natural-language fields: a JSON envelope with `task_id`, `agent_id`, `status`, and a free-text `content` field. This gives you programmatic routing with flexible content.",
    "## Failure Handling, Observability, and Cost Control\n\nMulti-agent systems multiply failure modes: any individual agent can hallucinate, time out, exceed its token budget, or produce malformed output. Robust systems implement **circuit breakers** (stop retrying after N failures), **fallback chains** (try agent A, then B, then return a graceful degradation response), and **output validation** (schema checks, assertion agents, or human-in-the-loop gates for high-stakes outputs). Observability requires structured logging of every agent invocation with: input tokens, output tokens, latency, tool calls made, and a trace ID linking all agents working on the same user request. Without this, debugging a five-agent pipeline is nearly impossible. Cost control is equally critical: a naive supervisor that retries aggressively or spawns too many workers can burn through API budgets quickly. Best practices include setting per-agent token limits, implementing cost-aware routing (use cheaper models for simple sub-tasks), and adding a global budget cap per user request that the supervisor checks before spawning new work."
  ],
  code: [
    {
      language: "typescript",
      caption: "Orchestrator with short-lived sub-agents — context isolation, not an org chart",
      source: `type SubAgentResult = { task: string; findings: string; sourcesUsed: string[] };

/**
 * The genuine argument for multi-agent is CONTEXT ISOLATION: a sub-agent works
 * in a fresh window on a self-contained task and returns only its conclusion,
 * so the parent's context stays clean. Parallelism is the second reason.
 *
 * "Specialisation" is a weak third — one agent with clear instructions and the
 * right tools usually matches several narrow ones, without the handoff losses.
 */
export async function research(question: string): Promise<string> {
  // 1. Decompose — the orchestrator holds the whole picture.
  const subTasks = await decompose(question);

  // 2. Fan out. Each sub-agent gets a FRESH context: it never sees the
  //    orchestrator's history, which is the point and also the cost.
  const results = await Promise.all(
    subTasks.map(async (task): Promise<SubAgentResult | null> => {
      try {
        return await runSubAgent(task, {
          maxSteps: 6,                 // sub-agents get tight budgets
          maxMs: 60_000,
          tools: [searchTool, fetchTool],
        });
      } catch (err) {
        console.warn(\`sub-agent failed: \${task}\`, err);
        return null;                   // one failure must not sink the run
      }
    })
  );

  const succeeded = results.filter((r): r is SubAgentResult => r !== null);
  if (succeeded.length === 0) throw new Error("every sub-agent failed");

  // 3. Synthesise. Only conclusions come back, not the sub-agents' working.
  const res = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 4096,
    system: "Synthesise the findings into one answer. Note explicitly where findings conflict or where a sub-task returned nothing — do not paper over gaps.",
    messages: [{
      role: "user",
      content: [
        \`Question: \${question}\`,
        "",
        ...succeeded.map((r) => \`## \${r.task}\\n\${r.findings}\\nSources: \${r.sourcesUsed.join(", ")}\`),
        succeeded.length < subTasks.length
          ? \`\\nNote: \${subTasks.length - succeeded.length} sub-task(s) failed and are missing.\`
          : "",
      ].join("\\n"),
    }],
  });

  const block = res.content.find((b) => b.type === "text");
  return block?.type === "text" ? block.text : "";
}

// What this costs, stated honestly:
// - Information is lost at every handoff — the parent gets a summary, not the
//   evidence, and cannot ask a follow-up without re-running the sub-agent.
// - Debugging spans N agents; without per-agent tracing it is guesswork.
// - You pay for N model runs, and the slowest sub-agent sets the latency.
//
// So: use it when subtasks are genuinely separable AND their context is worth
// discarding. Not because the problem resembles a team of people.`,
    },
  ],
  diagrams: [
    {
      title: "Supervisor Pattern Architecture",
      kind: "architecture",
      caption: "Central supervisor decomposes tasks, delegates to specialist workers, and aggregates results.",
      mermaid: `graph TD
    User["User Request"] --> Sup["Supervisor Agent"]
    Sup -->|research subtask| RA["Research Agent"]
    Sup -->|code subtask| CA["Code Agent"]
    Sup -->|review subtask| RevA["Review Agent"]
    RA -->|findings| Sup
    CA -->|implementation| Sup
    RevA -->|feedback| Sup
    Sup --> Out["Aggregated Response to User"]`,
    },
    {
      title: "Multi-Agent Debate Flow",
      kind: "flow",
      caption: "Two debater agents argue positions while a judge evaluates and selects the best answer.",
      mermaid: `flowchart TD
    Q["Question or Problem"] --> D1["Debater A\nargues position 1"]
    Q --> D2["Debater B\nargues position 2"]
    D1 -->|argument| Judge["Judge Agent"]
    D2 -->|argument| Judge
    Judge --> Eval{"Sufficient quality?"}
    Eval -->|No| Rebut["Request rebuttals"]
    Rebut --> D1
    Rebut --> D2
    Eval -->|Yes| V["Judge selects best answer"]
    V --> Out["Final Response"]`,
    },
    {
      title: "Agent Message Passing",
      kind: "sequence",
      caption: "Message flow between supervisor, research agent, and code agent during a coding task.",
      mermaid: `sequenceDiagram
    participant U as User
    participant Sup as Supervisor
    participant RA as Research Agent
    participant CA as Code Agent

    U->>Sup: implement feature X
    Sup->>RA: research best approach for X
    RA->>RA: search docs and examples
    RA-->>Sup: findings and recommendations
    Sup->>CA: implement X using approach Y
    CA->>CA: write and test code
    CA-->>Sup: implementation + tests
    Sup->>Sup: review and merge results
    Sup-->>U: final implementation`,
    },
    {
      title: "Multi-Agent Orchestration Patterns",
      kind: "mindmap",
      caption: "Overview of orchestration patterns, communication topologies, and failure-handling strategies.",
      mermaid: `mindmap
    root["Multi-Agent Systems"]
      Orchestration Patterns
        Supervisor-worker
        Peer debate
        Pipeline chain
        Hierarchical
      Communication
        Message passing
        Shared memory
        Tool calls
      Failure Handling
        Retry with backoff
        Fallback agent
        Human escalation
      Use Cases
        Code generation
        Research synthesis
        Complex reasoning`,
    },
  ],
  animations: [
    {
      title: "Supervisor Delegation and Aggregation",
      steps: [
        { label: "User submits request", detail: "The user sends a complex task (e.g., 'Build a data pipeline with tests') to the system entry point." },
        { label: "Supervisor decomposes task", detail: "The supervisor agent analyzes the request, identifies required sub-tasks, and creates a task plan: [research, code, test, review]." },
        { label: "Delegate to Research Agent", detail: "The supervisor sends the first sub-task to the research agent with context: 'Find best practices for data pipeline architecture.'" },
        { label: "Research agent returns results", detail: "The research agent completes its work and returns structured findings to the supervisor. The supervisor validates the output quality." },
        { label: "Delegate to Code Agent", detail: "The supervisor sends the coding sub-task along with the research findings to the code agent: 'Implement the pipeline based on these patterns.'" },
        { label: "Code agent returns implementation", detail: "The code agent writes the implementation and returns code artifacts. The supervisor checks for completeness." },
        { label: "Delegate to Test Agent", detail: "The supervisor sends the code to the test agent: 'Write and run tests for this pipeline implementation.'" },
        { label: "Parallel review and aggregation", detail: "The test agent returns results. The supervisor runs a final review, aggregates all outputs, and synthesizes the final response for the user." }
      ]
    },
    {
      title: "Multi-Agent Debate Protocol",
      steps: [
        { label: "Question posed to debaters", detail: "The judge agent distributes the question to two debater agents, each assigned to argue a different position or approach." },
        { label: "Round 1: Initial arguments", detail: "Each debater independently formulates its initial argument with evidence and reasoning. Neither can see the other's response yet." },
        { label: "Arguments exchanged", detail: "The judge shares Debater A's argument with Debater B and vice versa. Each debater now sees the opposing position." },
        { label: "Round 2: Rebuttals", detail: "Each debater critiques the other's argument, identifying weaknesses, logical gaps, or missing evidence, and strengthens its own position." },
        { label: "Judge evaluates", detail: "The judge agent reviews both final arguments, scores them on reasoning quality, evidence strength, and completeness, and selects the winner." },
        { label: "Final answer synthesized", detail: "The judge produces the final answer, incorporating the strongest points from both sides and noting any unresolved disagreements." }
      ]
    }
  ],
  comparison: {
    columns: ["Aspect", "Supervisor", "Pipeline", "Swarm", "Hierarchical"],
    rows: [
      ["Coordination", "Central coordinator manages all delegation", "Sequential handoff between agents", "Decentralized, agents self-select tasks", "Multi-level coordinators with manager agents"],
      ["Parallelism", "High: supervisor can dispatch independent tasks concurrently", "None: strictly sequential processing", "High: agents work independently on available tasks", "High: parallelism at each level of the hierarchy"],
      ["Fault tolerance", "Low: supervisor is a single point of failure", "Low: any agent failure breaks the chain", "High: no single point of failure", "Medium: loss of a sub-supervisor only affects its subtree"],
      ["Complexity", "Medium: one coordinator, clear delegation logic", "Low: simple linear chain, easy to reason about", "High: emergent behavior is hard to predict and debug", "High: multiple coordination layers and routing logic"],
      ["Best for", "Most general tasks, when a clear plan can be formed", "Content pipelines, ETL, sequential transformations", "Large-scale tasks with many independent sub-problems", "Very complex tasks requiring multiple management layers"],
      ["Debugging", "Moderate: trace through supervisor decisions", "Easy: linear execution log", "Hard: no central log, emergent interactions", "Hard: must trace across multiple supervisor levels"],
      ["Frameworks", "CrewAI, AutoGen, LangGraph", "LangChain LCEL, simple chaining", "OpenAI Swarm, custom implementations", "AutoGen nested chat, custom hierarchies"],
      ["Latency", "Medium: supervisor overhead per delegation", "High: sequential, total is sum of all agents", "Low: parallel execution, limited by slowest agent", "Medium-High: multiple coordination rounds"]
    ]
  },
  exercises: [
    "Design a multi-agent system for automated code review: define the agents needed (linter, security scanner, logic reviewer, style checker), the orchestration pattern, message format between agents, and how the supervisor aggregates their findings into a single review.",
    "Implement a two-agent debate system where Agent A argues for microservices and Agent B argues for a monolith, given a specific application scenario. Include a judge agent that scores arguments on feasibility, scalability, and team-fit criteria.",
    "Build a fault-tolerant supervisor that handles three failure modes: agent timeout (no response within 30 seconds), malformed output (response does not match the expected schema), and quality failure (the critic agent rejects the output). Implement retry, reassignment, and graceful degradation strategies.",
    "Create a cost-aware routing system that analyzes incoming sub-tasks and routes simple tasks to a smaller/cheaper model and complex tasks to a larger/more capable model. Track cumulative cost per request and enforce a budget cap.",
    "Design an observability dashboard for a multi-agent system: define what metrics to collect (latency per agent, token usage, success/failure rates, retry counts), how to correlate events across agents using trace IDs, and how to set up alerts for anomalous patterns."
  ],
  cheatSheet: [
    "Supervisor pattern: one coordinator decomposes the task, delegates sub-tasks to workers, and aggregates results. Use when a clear plan can be formed upfront.",
    "Pipeline pattern: agents chained sequentially (A -> B -> C). Best for content transformation workflows. Simplest to implement but no parallelism.",
    "Swarm pattern: agents self-select tasks with no central coordinator. Most resilient but hardest to debug. Use for embarrassingly parallel workloads.",
    "Use structured JSON messages with a free-text content field for agent communication: gives you programmatic routing with flexible payloads.",
    "Implement circuit breakers: stop retrying an agent after N consecutive failures. Combine with fallback chains (try agent A, then B, then degrade gracefully).",
    "Always propagate a trace_id across all agent calls in a single user request. Without it, debugging multi-agent interactions is nearly impossible.",
    "Cost control: set per-agent token limits, route simple tasks to cheaper models, and enforce a global budget cap per user request.",
    "Validate agent outputs with schema checks or a dedicated critic agent before passing results downstream. Never trust raw LLM output in a multi-agent pipeline."
  ],
  revisionNotes: [
    "Multi-agent systems decompose complex tasks across specialized agents, trading simplicity for better specialization, parallelism, and reliability.",
    "Four orchestration patterns: Supervisor (central coordinator), Pipeline (sequential), Swarm (decentralized), and Hierarchical (multi-level supervisors).",
    "Communication topologies: Star (supervisor), Ring (pipeline), Mesh (swarm). Most production systems use hybrids.",
    "Agent delegation requires clear task descriptions, typed input/output contracts, capability-based routing, and fallback handling for failures.",
    "Multi-agent debate reduces confident errors: two agents argue positions, a judge selects the best answer. Trades 2-3x cost for higher accuracy.",
    "Failure handling must cover timeouts, malformed outputs, and quality failures. Use circuit breakers, fallback chains, and output validation.",
    "Observability requires structured logging with trace IDs linking all agents in a single request. Track tokens, latency, and success rates per agent.",
    "Avoid over-specialization: each additional narrow agent adds orchestration complexity. Start with fewer, broader agents and split only when quality demands it."
  ],
  resources: [
    { label: "LangGraph Multi-Agent Documentation", kind: "docs", note: "Official guide for building stateful multi-agent workflows with LangGraph's state machine abstraction" },
    { label: "CrewAI Documentation", kind: "docs", note: "Framework for orchestrating role-playing AI agents with built-in delegation and sequential/hierarchical processes" },
    { label: "AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation", kind: "paper", note: "Microsoft Research paper introducing the AutoGen framework for multi-agent conversation patterns" },
    { label: "OpenAI Swarm (Experimental)", kind: "repo", note: "Lightweight multi-agent orchestration framework demonstrating handoffs and routines patterns" },
    { label: "Multi-Agent Debate Improves LLM Reasoning (Du et al.)", kind: "paper", note: "Research showing that multi-agent debate significantly improves mathematical and strategic reasoning accuracy" },
    { label: "Building Effective Agents - Anthropic", url: "https://docs.anthropic.com/", kind: "article", note: "Anthropic's guide to agent architectures including orchestrator-workers and evaluator-optimizer patterns" },
    { label: "Andrew Ng's Multi-Agent Design Patterns", kind: "video", note: "Lecture covering reflection, tool use, planning, and multi-agent collaboration as agentic design patterns" },
    { label: "LangChain Multi-Agent Architectures Blog", kind: "article", note: "Practical comparison of supervisor, hierarchical, and custom multi-agent patterns with LangGraph examples" }
  ],
  followUps: [
    "How do you handle shared memory and context windows across agents without exceeding token limits?",
    "What are the trade-offs between using a framework (CrewAI, LangGraph) vs. building custom multi-agent orchestration?",
    "How do you implement human-in-the-loop checkpoints in a multi-agent pipeline for high-stakes tasks?",
    "What evaluation metrics and benchmarks exist for measuring multi-agent system performance?",
    "How do multi-agent systems handle conflicting outputs when two specialist agents disagree?",
    "What security considerations arise when agents can invoke tools or access external systems on behalf of each other?"
  ],
};
