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
};
