import type { TopicContent } from "../types";

export const planningMemory: TopicContent = {
  quickSummary: [
    "Planning enables agents to decompose complex tasks into manageable sub-tasks, order them by dependencies, and execute them systematically rather than attempting everything at once.",
    "Working memory is the agent's short-term context: the current conversation, recent tool outputs, and scratchpad notes that inform immediate decisions within a single session.",
    "Long-term memory persists across sessions using external stores (vector databases, key-value stores) to recall past interactions, user preferences, and learned facts.",
    "Effective memory management is critical because LLM context windows are finite: agents must decide what to remember, what to summarize, and what to discard.",
  ],
  detailed: [
    "## Task Decomposition\n\nTask decomposition is the process of breaking a high-level goal into a sequence of actionable sub-tasks. Approaches include: **LLM-based planning** (ask the model to generate a step-by-step plan), **fixed decomposition** (predefined task templates for known workflows), and **recursive decomposition** (break tasks into sub-tasks, then break those further until each is atomic). Good decomposition produces tasks that are independently verifiable, have clear inputs/outputs, and can be executed by available tools. The plan should include dependencies between tasks (task B needs task A's output) to enable parallel execution where possible.",
    "## Working Memory\n\nWorking memory is everything the agent can access in its current context window: the system prompt, conversation history, tool results, and any scratchpad notes. As conversations grow, working memory fills up and critical context may be pushed out. Strategies to manage this include: **summarization** (compress old conversation turns into summaries), **selective retention** (keep only relevant turns), **scratchpad patterns** (maintain a structured state object updated each turn), and **context window management** (prioritize recent and task-relevant information). The scratchpad pattern is particularly powerful: the agent maintains a JSON object with current plan status, findings, and next steps, updated each iteration.",
    "## Long-Term Memory\n\nLong-term memory persists information across sessions. Implementation patterns include: **vector store memory** (embed and store conversation summaries or facts, retrieve relevant ones in future sessions), **key-value memory** (store user preferences, facts, and decisions by key for exact retrieval), **episodic memory** (store complete interaction episodes for similar-situation retrieval), and **semantic memory** (store facts and relationships in a knowledge graph). The retrieval mechanism matters: vector similarity works for topical relevance, but structured queries are needed for exact facts like user preferences or account details.",
    "## Memory Architecture Patterns\n\nProduction agents often use a tiered memory architecture: **L1 (context window)** holds the current turn's context, **L2 (session memory)** maintains a summarized history of the current conversation, and **L3 (persistent memory)** stores long-term facts across sessions. Each tier has different capacity, latency, and retrieval characteristics. The agent decides what to promote from L1 to L2 (summarize and keep) and from L2 to L3 (persist for future sessions). Forgetting is as important as remembering: stale or contradicted information must be updated or removed to prevent the agent from acting on outdated context.",
    "## Plan Execution and Replanning\n\nPlans rarely survive contact with reality. Agents need replanning capability: when a sub-task fails, returns unexpected results, or reveals new information, the agent should reassess and revise its plan. This includes: detecting plan failures, identifying which remaining steps are affected, generating a revised plan, and continuing execution. Over-planning (detailed plans for uncertain future steps) is wasteful; under-planning (no plan at all) leads to inefficient exploration. The sweet spot is planning 2-3 steps ahead and replanning after each execution cycle.",
  ],
  interviewQA: [
    {
      q: "How does an agent decide what to keep in working memory as context grows?",
      a: "Agents use several strategies: summarizing older conversation turns to compress context, selectively retaining only task-relevant information, maintaining a structured scratchpad with current state and findings that is updated each turn, and prioritizing recent interactions over old ones. The key principle is that working memory should contain everything needed for the current decision and nothing else. Some systems use an LLM call to decide what to summarize or drop.",
    },
    {
      q: "What is the difference between episodic and semantic long-term memory?",
      a: "Episodic memory stores complete interaction episodes (what happened in a specific past session) and retrieves similar episodes when the current situation resembles a past one. Semantic memory stores facts and relationships (user preferences, domain knowledge) in a structured way for exact retrieval. Episodic memory is useful for 'how did I handle this before?' while semantic memory is useful for 'what do I know about this user/topic?'",
    },
    {
      q: "When should an agent replan rather than continue executing the original plan?",
      a: "Replanning is needed when: a sub-task fails and cannot be retried, a tool returns unexpected results that invalidate assumptions, new information reveals the original plan is suboptimal, or the user changes requirements mid-task. The agent should detect these conditions, assess which remaining steps are affected, generate a revised plan, and continue. Good agents distinguish between recoverable errors (retry) and plan-breaking failures (replan).",
    },
  ],
  mcqs: [
    {
      q: "What is the scratchpad pattern in agent memory?",
      options: [
        "A temporary file system for storing documents",
        "A structured state object updated each turn with plan status, findings, and next steps",
        "A separate LLM instance that tracks memory",
        "A database table for conversation logs",
      ],
      answerIndex: 1,
      explanation:
        "The scratchpad pattern maintains a structured JSON object within the context window that the agent updates each iteration, tracking current plan status, intermediate findings, and planned next steps.",
    },
    {
      q: "Why is forgetting important in agent memory systems?",
      options: [
        "To reduce storage costs",
        "To prevent the agent from acting on stale or contradicted information",
        "To make the agent seem more human-like",
        "To comply with data retention regulations",
      ],
      answerIndex: 1,
      explanation:
        "Stale or contradicted information in memory can cause the agent to make incorrect decisions. Active forgetting (updating or removing outdated facts) keeps memory accurate and relevant.",
    },
    {
      q: "What is recursive task decomposition?",
      options: [
        "Running the same task multiple times",
        "Breaking tasks into sub-tasks, then breaking those further until each is atomic",
        "Using recursion in the agent's code",
        "Decomposing tasks based on user feedback only",
      ],
      answerIndex: 1,
      explanation:
        "Recursive decomposition repeatedly breaks complex tasks into simpler sub-tasks until each sub-task is small enough to be executed directly by a single tool call or action.",
    },
  ],
  flashcards: [
    { front: "What are the three tiers in a tiered memory architecture?", back: "L1: context window (current turn). L2: session memory (summarized conversation history). L3: persistent memory (long-term facts across sessions)." },
    { front: "What is the scratchpad pattern?", back: "A structured state object (usually JSON) maintained in the context window that the agent updates each iteration with plan status, findings, and next steps." },
    { front: "What is episodic memory?", back: "Long-term memory that stores complete interaction episodes and retrieves similar past episodes when the current situation resembles one." },
    { front: "What is the danger of over-planning?", back: "Creating detailed plans for uncertain future steps wastes tokens and may be invalidated by unexpected results. Better to plan 2-3 steps ahead and replan after execution." },
    { front: "How does vector store memory work?", back: "Conversation summaries or facts are embedded and stored in a vector database. In future sessions, relevant memories are retrieved by semantic similarity to the current context." },
    { front: "What triggers replanning?", back: "Sub-task failure, unexpected tool results, new information that invalidates assumptions, or changed user requirements." },
  ],
  glossary: [
    { term: "Task Decomposition", definition: "Breaking a complex goal into a sequence of smaller, actionable sub-tasks with clear inputs, outputs, and dependencies." },
    { term: "Working Memory", definition: "The agent's short-term context: everything available in the current context window including conversation history, tool results, and scratchpad." },
    { term: "Long-Term Memory", definition: "Persistent storage (vector DB, key-value store) that allows agents to recall information across sessions." },
    { term: "Scratchpad", definition: "A structured state object maintained in context that tracks plan progress, intermediate findings, and next actions." },
    { term: "Episodic Memory", definition: "Memory of complete past interaction episodes, retrieved when the current situation resembles a stored episode." },
    { term: "Semantic Memory", definition: "Structured storage of facts, relationships, and knowledge that can be queried directly." },
    { term: "Replanning", definition: "Revising the execution plan when sub-tasks fail, return unexpected results, or new information changes the task landscape." },
  ],
};
