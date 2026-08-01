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
  deepDive: [
    "## Plan Representations: DAGs, Trees, and Flat Lists\n\nThe internal structure an agent uses to represent its plan has profound implications for execution flexibility. A **flat list** (step 1 → step 2 → step 3) is simplest but forces strictly sequential execution and makes replanning expensive—inserting or removing a step requires reindexing everything downstream. A **tree** structure models hierarchical decomposition naturally (goal → sub-goals → atomic actions), supports partial replanning at any subtree, and reflects how humans reason about nested tasks. However, trees cannot express shared dependencies (two branches needing the same prerequisite). A **directed acyclic graph (DAG)** is the most expressive: nodes are tasks, edges are dependencies, and any topological ordering is a valid execution sequence. DAGs enable maximum parallelism (independent branches run concurrently), clear dependency tracking, and surgical replanning (only downstream nodes of a failed task are affected). In practice, frameworks like LangGraph use DAG-based state machines, while simpler agents (ReAct, Plan-and-Execute) use flat lists with implicit replanning loops.",
    "## Memory Consolidation and Forgetting Curves\n\nBiologically inspired memory research shows that **Ebbinghaus forgetting curves** apply to AI memory systems by analogy: without reinforcement, stored information degrades in usefulness over time as context drifts. Memory consolidation in agents involves three processes: **encoding** (deciding what to store and how to represent it—raw text, summary, embedding, or structured fact), **consolidation** (periodically reviewing stored memories to merge duplicates, resolve contradictions, and update stale entries), and **retrieval-based reinforcement** (memories accessed more frequently are ranked higher in future retrievals). Effective forgetting is equally critical: an agent that never forgets accumulates contradictory facts, outdated user preferences, and irrelevant context that pollutes retrieval. Strategies include **time-decay scoring** (reduce relevance scores over time), **contradiction detection** (when a new fact contradicts a stored one, update or remove the old), and **capacity-based eviction** (when memory exceeds a budget, evict lowest-scored entries). The optimal forgetting strategy depends on the domain: customer support agents should forget less (long relationship context) while coding agents can forget more aggressively (each task is relatively self-contained).",
    "## Real-World Memory Architectures: MemGPT and Letta\n\n**MemGPT** (now evolved into the **Letta** framework) pioneered the idea of treating LLM memory management as a virtual memory system analogous to OS-level paging. The core insight: just as an OS pages data between fast RAM and slow disk, an agent can page context between the limited context window (main context) and external storage (archival memory). MemGPT defines explicit memory tiers: **main context** (the active context window, ~8K tokens reserved), **recall storage** (searchable conversation history in a database), and **archival storage** (a vector database for long-term facts and knowledge). The agent has explicit tool calls to manage memory: `core_memory_append`, `core_memory_replace`, `archival_memory_insert`, `archival_memory_search`, and `conversation_search`. This makes memory management an *agentic* action—the LLM itself decides when to save, retrieve, or update information rather than relying on hard-coded heuristics. Letta extends this with a production-ready server, multi-agent support, tool sandboxing, and a REST API for building memory-augmented agents at scale.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Planning agent with a ReAct loop",
      source: `#include <iostream>
#include <string>
#include <vector>
#include <functional>
#include <map>
#include <sstream>
#include <cmath>

// A tool has a name, description, and a function that takes a string and returns a string
struct Tool {
    std::string name;
    std::string description;
    std::function<std::string(const std::string&)> func;
};

// Define tools the agent can use
std::string search(const std::string& query) {
    return "Results for: " + query;
}

std::string calculator(const std::string& expression) {
    // Simplified: evaluate basic arithmetic (production code would use a proper parser)
    try {
        double result = std::stod(expression); // placeholder for real evaluation
        std::ostringstream oss;
        oss << result;
        return oss.str();
    } catch (...) {
        return "Error: could not evaluate expression";
    }
}

// Simulate an LLM call that returns the next action or final answer
// In production, this would call an actual LLM API
struct AgentResponse {
    std::string thought;
    std::string action;       // empty if final answer
    std::string action_input;
    std::string final_answer; // non-empty when the agent is done
};

AgentResponse call_llm(const std::string& prompt, const std::string& scratchpad) {
    // Placeholder: a real implementation sends prompt + scratchpad to an LLM
    // and parses the Thought/Action/Action Input or Final Answer from the response
    AgentResponse resp;
    resp.thought = "I need to search for the population of France.";
    resp.action = "Search";
    resp.action_input = "population of France";
    if (!scratchpad.empty()) {
        resp.thought = "I now know the answer.";
        resp.action.clear();
        resp.final_answer = "Approximately 22,500,000";
    }
    return resp;
}

int main() {
    // Register tools in a lookup map
    std::vector<Tool> tools = {
        {"Search", "Search for information", search},
        {"Calculator", "Do math", calculator},
    };
    std::map<std::string, std::function<std::string(const std::string&)>> tool_map;
    for (const auto& t : tools) {
        tool_map[t.name] = t.func;
    }

    // ReAct loop: Thought -> Action -> Observation, repeat until Final Answer
    const int max_iterations = 5;
    std::string scratchpad;
    std::string input = "What is the population of France divided by 3?";

    for (int i = 0; i < max_iterations; ++i) {
        AgentResponse resp = call_llm(input, scratchpad);
        std::cout << "Thought: " << resp.thought << "\\n";

        if (!resp.final_answer.empty()) {
            std::cout << "Final Answer: " << resp.final_answer << "\\n";
            break;
        }

        // Execute the chosen tool
        std::string observation = "Tool not found";
        auto it = tool_map.find(resp.action);
        if (it != tool_map.end()) {
            observation = it->second(resp.action_input);
        }
        std::cout << "Action: " << resp.action << "\\n";
        std::cout << "Action Input: " << resp.action_input << "\\n";
        std::cout << "Observation: " << observation << "\\n\\n";

        // Append to scratchpad for next iteration
        scratchpad += "Thought: " + resp.thought + "\\n";
        scratchpad += "Action: " + resp.action + "\\n";
        scratchpad += "Observation: " + observation + "\\n";
    }
    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Memory manager with conversation summarization",
      source: `#include <iostream>
#include <string>
#include <vector>
#include <deque>

// A single message in the conversation
struct Message {
    std::string role; // "user" or "assistant"
    std::string content;
};

// Memory manager that keeps recent messages verbatim and summarizes older ones
class ConversationSummaryBufferMemory {
    std::deque<Message> buffer_;         // recent messages kept verbatim
    std::string running_summary_;        // summary of older messages
    size_t max_buffer_size_;             // max number of recent messages to keep

    // Placeholder: in production, call an LLM to summarize
    std::string summarize(const std::string& existing_summary,
                          const std::vector<Message>& messages_to_summarize) {
        std::string combined = existing_summary;
        if (!combined.empty()) combined += " ";
        for (const auto& msg : messages_to_summarize) {
            combined += msg.role + " said: " + msg.content + ". ";
        }
        // A real implementation would call an LLM here to produce a concise summary
        return combined;
    }

public:
    explicit ConversationSummaryBufferMemory(size_t max_buffer_size = 4)
        : max_buffer_size_(max_buffer_size) {}

    void add_message(const std::string& role, const std::string& content) {
        buffer_.push_back({role, content});

        // When buffer exceeds limit, summarize the oldest messages
        while (buffer_.size() > max_buffer_size_) {
            std::vector<Message> to_summarize = { buffer_.front() };
            buffer_.pop_front();
            running_summary_ = summarize(running_summary_, to_summarize);
        }
    }

    std::string get_context() const {
        std::string ctx;
        if (!running_summary_.empty()) {
            ctx += "Summary of earlier conversation: " + running_summary_ + "\\n\\n";
        }
        ctx += "Recent messages:\\n";
        for (const auto& msg : buffer_) {
            ctx += "[" + msg.role + "]: " + msg.content + "\\n";
        }
        return ctx;
    }

    const std::string& summary() const { return running_summary_; }
    const std::deque<Message>& buffer() const { return buffer_; }
};

int main() {
    ConversationSummaryBufferMemory memory(3); // keep last 3 messages verbatim

    // Simulate a multi-turn conversation
    memory.add_message("user", "Hi, I'm building a RAG pipeline for legal docs.");
    memory.add_message("user", "I'm using Pinecone for the vector store.");
    memory.add_message("user", "The chunk size is 512 tokens with 50 token overlap.");
    memory.add_message("user", "Can you remind me what vector store I chose?");
    // Older messages are summarized; "Pinecone" is preserved in the summary

    // Inspect what the memory looks like
    std::cout << "Full context:\\n" << memory.get_context() << "\\n";
    std::cout << "Summary: " << memory.summary() << "\\n";
    std::cout << "Buffer size: " << memory.buffer().size() << "\\n";
    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Vector-based long-term memory store with cosine similarity",
      source: `#include <iostream>
#include <string>
#include <vector>
#include <cmath>
#include <algorithm>
#include <chrono>
#include <iomanip>
#include <sstream>
#include <optional>

// A single memory entry with its embedding and metadata
struct MemoryEntry {
    std::string id;
    std::string content;
    std::vector<double> embedding;
    std::string category;    // "fact", "preference", "episode"
    std::string session_id;
    std::string timestamp;
};

// Cosine similarity between two vectors
double cosine_similarity(const std::vector<double>& a, const std::vector<double>& b) {
    if (a.size() != b.size() || a.empty()) return 0.0;
    double dot = 0.0, norm_a = 0.0, norm_b = 0.0;
    for (size_t i = 0; i < a.size(); ++i) {
        dot += a[i] * b[i];
        norm_a += a[i] * a[i];
        norm_b += b[i] * b[i];
    }
    double denom = std::sqrt(norm_a) * std::sqrt(norm_b);
    return (denom > 0.0) ? (dot / denom) : 0.0;
}

// Get the current timestamp as an ISO string
std::string now_iso() {
    auto now = std::chrono::system_clock::now();
    auto time = std::chrono::system_clock::to_time_t(now);
    std::ostringstream oss;
    oss << std::put_time(std::gmtime(&time), "%Y-%m-%dT%H:%M:%SZ");
    return oss.str();
}

// Placeholder embedding function
// In production, call an embedding API (e.g., OpenAI text-embedding-3-small)
std::vector<double> embed(const std::string& text) {
    // Simple hash-based mock embedding for demonstration
    std::vector<double> vec(64, 0.0);
    for (size_t i = 0; i < text.size(); ++i) {
        vec[i % vec.size()] += static_cast<double>(text[i]) / 128.0;
    }
    // Normalize
    double norm = 0.0;
    for (double v : vec) norm += v * v;
    norm = std::sqrt(norm);
    if (norm > 0.0) {
        for (double& v : vec) v /= norm;
    }
    return vec;
}

// In-memory vector store for long-term memory
class VectorMemoryStore {
    std::vector<MemoryEntry> entries_;

public:
    void store_memory(const std::string& content, const std::string& category,
                      const std::string& session_id) {
        MemoryEntry entry;
        entry.id = session_id + "_" + now_iso();
        entry.content = content;
        entry.embedding = embed(content);
        entry.category = category;
        entry.session_id = session_id;
        entry.timestamp = now_iso();
        entries_.push_back(std::move(entry));
    }

    // Retrieve top-N memories by cosine similarity, optionally filtered by category
    std::vector<MemoryEntry> recall(const std::string& query, int n_results = 3,
                                    const std::optional<std::string>& category = std::nullopt) {
        auto query_embedding = embed(query);

        // Score each entry
        struct Scored { double score; size_t index; };
        std::vector<Scored> scored;
        for (size_t i = 0; i < entries_.size(); ++i) {
            if (category.has_value() && entries_[i].category != category.value())
                continue;
            double sim = cosine_similarity(query_embedding, entries_[i].embedding);
            scored.push_back({sim, i});
        }

        // Sort by descending similarity
        std::sort(scored.begin(), scored.end(),
                  [](const Scored& a, const Scored& b) { return a.score > b.score; });

        // Return top N
        std::vector<MemoryEntry> results;
        for (int i = 0; i < n_results && i < static_cast<int>(scored.size()); ++i) {
            results.push_back(entries_[scored[i].index]);
        }
        return results;
    }
};

int main() {
    VectorMemoryStore store;

    // Store memories
    store.store_memory("User prefers dark mode and vim keybindings", "preference", "sess_001");
    store.store_memory("Deployed v2.3 to production on 2025-01-15", "episode", "sess_002");
    store.store_memory("Project uses PostgreSQL 16 with pgvector extension", "fact", "sess_003");

    // Later, in a new session: recall relevant memories
    auto memories = store.recall("What database does the project use?");
    for (const auto& m : memories) {
        std::cout << "[" << m.category << "] " << m.content << "\\n";
    }
    return 0;
}`,
    },
  ],
  comparison: {
    columns: ["Aspect", "Working Memory", "Episodic Memory", "Semantic Memory", "Procedural Memory"],
    rows: [
      ["Analogy", "CPU registers / L1 cache", "Diary or journal", "Encyclopedia / knowledge base", "Muscle memory / habits"],
      ["Persistence", "Current context window only", "Stored per interaction episode", "Permanent structured facts", "Encoded in prompts or fine-tuning"],
      ["Capacity", "Limited by token window (4K-200K)", "Scales with storage backend", "Scales with storage backend", "Fixed at training / prompt design time"],
      ["Retrieval", "Directly in context, zero latency", "Similarity search over past episodes", "Exact key lookup or graph query", "Implicitly activated by task context"],
      ["Update cost", "Immediate (append to context)", "Moderate (embed + index)", "Low (upsert key-value pair)", "High (re-training or prompt edit)"],
      ["Use case", "Current task reasoning, scratchpad", "\"How did I handle this before?\"", "\"What are the user's preferences?\"", "\"How do I format a SQL query?\""],
      ["Example store", "LLM context window", "Vector DB (ChromaDB, Pinecone)", "Key-value DB, knowledge graph", "System prompt, few-shot examples"],
      ["Forgetting strategy", "Summarize or truncate old turns", "Time-decay on relevance scores", "Explicit contradiction resolution", "Rarely forgotten; updated via retraining"],
    ],
  },
  diagrams: [
    {
      title: "Tiered Memory Architecture",
      kind: "architecture",
      caption: "Three-tier memory system showing data flow between context window (L1), session memory (L2), and persistent storage (L3) with promotion and eviction paths.",
      mermaid: `graph TD
    L1[L1 Context Window\nActive working memory\nTokens in prompt] -->|Eviction on overflow| L2
    L2[L2 Session Memory\nRunning summaries\nScratchpad buffer] -->|Persist on session end| L3
    L3[L3 Persistent Storage\nVector store\nKey-value facts] -->|Retrieval by similarity| L1
    L2 -->|Inject relevant facts| L1
    New[New Information] --> L1
    L1 -->|Flag durable facts| L2`,
    },
    {
      title: "Planning-Execution-Replanning Cycle",
      kind: "flow",
      caption: "Cyclic flow from goal decomposition through task execution, result evaluation, and conditional replanning when failures or new information arise.",
      mermaid: `flowchart TD
    Goal([Receive Goal]) --> Decompose[Decompose into\nSubtasks]
    Decompose --> Prioritize[Prioritize and\nSequence Tasks]
    Prioritize --> Execute[Execute Next Task\nvia Tool or LLM]
    Execute --> Observe[Observe Result]
    Observe --> Eval{Success?}
    Eval -->|Yes| More{More tasks?}
    More -->|Yes| Execute
    More -->|No| Done([Goal Complete])
    Eval -->|No| Analyze[Analyze Failure]
    Analyze --> Replan{Recoverable?}
    Replan -->|Yes| Decompose
    Replan -->|No| Escalate[Escalate to User]`,
    },
    {
      title: "Memory Retrieval in Agent Loop",
      kind: "sequence",
      caption: "How an agent retrieves relevant memories from long-term storage and injects them into the context before generating a response.",
      mermaid: `sequenceDiagram
    participant U as User
    participant A as Agent
    participant LT as Long-Term Store
    participant LLM as Language Model
    U->>A: New message
    A->>LT: Embed message, similarity search
    LT-->>A: Top-k relevant memories
    A->>A: Build context: system + memories + history + message
    A->>LLM: Send constructed prompt
    LLM-->>A: Response
    A->>A: Identify facts worth storing
    A->>LT: Write new memories with metadata
    A-->>U: Return response`,
    },
  ],
  animations: [
    {
      title: "Memory Promotion from L1 to L3",
      steps: [
        { label: "L1: New information enters context", detail: "User says 'I prefer Python for data pipelines.' This fact enters the agent's context window as part of the current conversation turn." },
        { label: "L1: Agent identifies memorable fact", detail: "The agent's memory management logic detects this is a durable user preference, not a transient instruction. It flags the fact for promotion." },
        { label: "L2: Summarize and store in session memory", detail: "The fact is extracted from raw conversation, summarized as 'User preference: Python for data pipelines', and written to session-level memory (e.g., a running summary buffer or scratchpad)." },
        { label: "L2: Session memory consolidation", detail: "At the end of the session (or periodically), the session memory is reviewed. The preference is confirmed as a stable, non-contradicted fact worth persisting." },
        { label: "L3: Persist to long-term store", detail: "The fact is embedded and written to the persistent vector store (or key-value store) with metadata: category='preference', timestamp, session_id. It is now available for retrieval in all future sessions." },
        { label: "L3: Future retrieval", detail: "In a new session, when the user asks about pipeline tooling, the agent queries long-term memory. The stored preference is retrieved by semantic similarity and injected into the context window, completing the L3→L1 recall loop." },
      ],
    },
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
  followUps: [
    "How do multi-agent systems coordinate shared memory—do agents read/write to the same store or maintain separate memories with a sync protocol?",
    "What are the trade-offs between using a vector database vs. a knowledge graph for semantic long-term memory in production agents?",
    "How does MemGPT/Letta handle memory conflicts when a new fact contradicts an existing long-term memory entry?",
    "What planning strategies work best for agents that operate in highly dynamic environments where the world state changes between planning and execution?",
    "How can agents learn to improve their planning and memory strategies over time (meta-learning for memory management)?",
  ],
  exercises: [
    "Build a ReAct agent that decomposes a research question into sub-queries, executes web searches for each, and synthesizes a final answer with source citations.",
    "Implement a tiered memory system (L1/L2/L3) using LangChain's memory classes and ChromaDB. Demonstrate a fact surviving across three separate conversation sessions.",
    "Create a plan-and-execute agent that builds a DAG of tasks, runs independent branches in parallel using asyncio, and replans when a branch fails.",
    "Write a memory consolidation script that takes a conversation transcript, extracts durable facts and user preferences, deduplicates against an existing memory store, and persists only net-new information.",
    "Design an experiment comparing flat-list planning vs. DAG-based planning on a multi-step task (e.g., trip planning). Measure replanning frequency, total LLM calls, and task completion rate.",
  ],
  cheatSheet: [
    "**ReAct loop**: Thought → Action → Observation → repeat. Cap iterations to prevent runaway loops.",
    "**Scratchpad pattern**: Maintain a JSON state object in context with `plan`, `completed`, `findings`, `next_step` keys. Update every turn.",
    "**Memory tiers**: L1 = context window (fast, small). L2 = session summary (medium). L3 = vector/KV store (slow, large, persistent).",
    "**Forgetting heuristics**: Time-decay scoring, contradiction detection, capacity-based eviction. Never let stale facts accumulate.",
    "**Plan representation**: Flat list for simple tasks, DAG for complex tasks with parallelism and shared dependencies.",
    "**Replan triggers**: Task failure, unexpected output, new information, changed requirements. Plan 2-3 steps ahead, not the entire task.",
    "**Embedding models for memory**: Use `text-embedding-3-small` for cost efficiency, `text-embedding-3-large` for higher recall on nuanced queries.",
    "**MemGPT memory tools**: `core_memory_append`, `core_memory_replace`, `archival_memory_insert`, `archival_memory_search`, `conversation_search`.",
  ],
  revisionNotes: [
    "Planning is about decomposition + dependency ordering. Good sub-tasks are independently verifiable with clear inputs and outputs.",
    "Working memory = context window contents. Manage it with summarization, selective retention, and the scratchpad pattern.",
    "Long-term memory comes in four types: working (context), episodic (past interactions), semantic (facts/preferences), procedural (how-to knowledge).",
    "Vector similarity retrieval is great for topical relevance but poor for exact facts—use key-value or structured queries for those.",
    "MemGPT treats memory as virtual memory with OS-style paging between context window and external storage.",
    "DAG-based plans enable parallel execution and surgical replanning; flat lists force sequential execution.",
    "Over-planning wastes tokens on steps that may be invalidated. Plan 2-3 steps ahead and replan after each execution cycle.",
    "Forgetting is as important as remembering. Implement active eviction of stale, contradicted, or low-relevance memories.",
  ],
  resources: [
    { label: "MemGPT: Towards LLMs as Operating Systems", kind: "paper", note: "The foundational paper introducing virtual context management for LLM agents with tiered memory." },
    { label: "Letta Framework (formerly MemGPT)", kind: "repo", note: "Production-ready open-source framework for building agents with persistent, managed memory. github.com/letta-ai/letta" },
    { label: "LangChain Memory Documentation", kind: "docs", note: "Comprehensive guide to memory classes in LangChain: buffer, summary, vector-backed, entity, and conversation memory." },
    { label: "LLM Powered Autonomous Agents (Lilian Weng)", kind: "article", note: "Influential blog post covering planning, memory, and tool use in LLM agents. Excellent diagrams and taxonomy." },
    { label: "Building AI Agents (Anthropic Cookbook)", kind: "docs", note: "Practical patterns for agent loops, tool use, planning, and memory management with Claude." },
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
