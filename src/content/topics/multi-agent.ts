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
      language: "cpp",
      caption: "Supervisor pattern: a coordinator delegates to research and code agents in C++",
      source: `// Supervisor pattern implementation in C++.
// A coordinator decomposes tasks and delegates to specialist workers.

#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <functional>
#include <memory>

struct AgentState {
    std::vector<std::string> messages;
    std::string next_agent;
    std::vector<std::string> task_plan;
    std::map<std::string, std::string> results;
};

// Base agent interface
class Agent {
public:
    virtual ~Agent() = default;
    virtual void execute(AgentState& state) = 0;
};

// Supervisor: decomposes tasks, routes to workers, aggregates results
class SupervisorAgent : public Agent {
public:
    void execute(AgentState& state) override {
        if (state.task_plan.empty()) {
            // First call: create the execution plan
            state.task_plan = {"research", "code", "review"};
            state.next_agent = "research";
            state.messages.push_back("[Supervisor] Plan: research -> code -> review");
            return;
        }

        // Check if all tasks are done
        bool all_done = true;
        std::string next_incomplete;
        for (const auto& task : state.task_plan) {
            if (state.results.find(task) == state.results.end()) {
                all_done = false;
                if (next_incomplete.empty()) next_incomplete = task;
            }
        }

        if (all_done) {
            state.next_agent = "done";
            std::string summary = "[Supervisor] All tasks complete:\\n";
            for (const auto& [k, v] : state.results)
                summary += "  [" + k + "]: " + v + "\\n";
            state.messages.push_back(summary);
        } else {
            state.next_agent = next_incomplete;
        }
    }
};

// Specialist: research agent
class ResearchAgent : public Agent {
public:
    void execute(AgentState& state) override {
        // In production: call LLM with research tools
        state.results["research"] = "Found 3 relevant papers on agent coordination.";
        state.next_agent = "supervisor";
        state.messages.push_back("[Research] Research complete.");
    }
};

// Specialist: code agent
class CodeAgent : public Agent {
public:
    void execute(AgentState& state) override {
        state.results["code"] = "Implemented solution with tests passing.";
        state.next_agent = "supervisor";
        state.messages.push_back("[Code] Code complete.");
    }
};

// Specialist: review agent
class ReviewAgent : public Agent {
public:
    void execute(AgentState& state) override {
        state.results["review"] = "Review passed. No issues found.";
        state.next_agent = "supervisor";
        state.messages.push_back("[Review] Review complete.");
    }
};

// State graph: routes execution based on next_agent
class StateGraph {
public:
    void add_node(const std::string& name, std::shared_ptr<Agent> agent) {
        agents_[name] = std::move(agent);
    }

    void run(AgentState& state, const std::string& entry_point, int max_steps = 20) {
        state.next_agent = entry_point;
        for (int step = 0; step < max_steps; ++step) {
            if (state.next_agent == "done") break;
            auto it = agents_.find(state.next_agent);
            if (it == agents_.end()) {
                std::cerr << "Unknown agent: " << state.next_agent << std::endl;
                break;
            }
            it->second->execute(state);
        }
    }

private:
    std::map<std::string, std::shared_ptr<Agent>> agents_;
};

int main() {
    StateGraph graph;
    graph.add_node("supervisor", std::make_shared<SupervisorAgent>());
    graph.add_node("research",   std::make_shared<ResearchAgent>());
    graph.add_node("code",       std::make_shared<CodeAgent>());
    graph.add_node("review",     std::make_shared<ReviewAgent>());

    AgentState state;
    state.messages.push_back("[User] Build a data pipeline");

    graph.run(state, "supervisor");

    std::cout << "=== Execution Log ===" << std::endl;
    for (const auto& msg : state.messages)
        std::cout << msg << std::endl;

    return 0;
}`
    },
    {
      language: "cpp",
      caption: "Agent-to-agent message passing with structured messages and a message bus in C++",
      source: `// Thread-safe message bus for agent-to-agent communication in C++.
// Uses condition variables for blocking receive and a shared log for tracing.

#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <queue>
#include <mutex>
#include <condition_variable>
#include <thread>
#include <functional>
#include <memory>
#include <chrono>
#include <atomic>
#include <sstream>

enum class MessageType { TASK, RESULT, ERROR, QUERY };

struct AgentMessage {
    std::string sender;
    std::string receiver;
    MessageType msg_type;
    std::string content;
    std::string trace_id;
};

class MessageBus {
public:
    void register_agent(const std::string& agent_id) {
        std::lock_guard<std::mutex> lock(mutex_);
        queues_[agent_id];  // default-construct the queue entry
    }

    void send(const AgentMessage& msg) {
        std::lock_guard<std::mutex> lock(mutex_);
        log_.push_back(msg);
        queues_[msg.receiver].push(msg);
        cv_.notify_all();
    }

    AgentMessage receive(const std::string& agent_id,
                         std::chrono::milliseconds timeout = std::chrono::milliseconds(5000)) {
        std::unique_lock<std::mutex> lock(mutex_);
        cv_.wait_for(lock, timeout, [&] {
            return !queues_[agent_id].empty();
        });
        if (queues_[agent_id].empty())
            throw std::runtime_error("Receive timeout for agent: " + agent_id);
        auto msg = queues_[agent_id].front();
        queues_[agent_id].pop();
        return msg;
    }

    std::vector<AgentMessage> get_trace(const std::string& trace_id) const {
        std::lock_guard<std::mutex> lock(mutex_);
        std::vector<AgentMessage> result;
        for (const auto& m : log_)
            if (m.trace_id == trace_id) result.push_back(m);
        return result;
    }

private:
    mutable std::mutex mutex_;
    std::condition_variable cv_;
    std::map<std::string, std::queue<AgentMessage>> queues_;
    std::vector<AgentMessage> log_;
};

class BaseAgent {
public:
    BaseAgent(const std::string& id, MessageBus& bus)
        : agent_id_(id), bus_(bus), running_(true) {
        bus_.register_agent(id);
    }
    virtual ~BaseAgent() { stop(); }

    void start() {
        thread_ = std::thread([this] {
            while (running_) {
                try {
                    auto msg = bus_.receive(agent_id_);
                    handle(msg);
                } catch (...) { /* timeout, retry */ }
            }
        });
    }

    void stop() {
        running_ = false;
        if (thread_.joinable()) thread_.join();
    }

    void send(const std::string& receiver, MessageType type,
              const std::string& content, const std::string& trace = "t001") {
        bus_.send({agent_id_, receiver, type, content, trace});
    }

    virtual void handle(const AgentMessage& msg) = 0;

protected:
    std::string agent_id_;
    MessageBus& bus_;
    std::atomic<bool> running_;
    std::thread thread_;
};

class ResearchAgent : public BaseAgent {
public:
    using BaseAgent::BaseAgent;
    void handle(const AgentMessage& msg) override {
        if (msg.msg_type == MessageType::TASK) {
            std::string result = "Research findings for: " + msg.content;
            send(msg.sender, MessageType::RESULT, result, msg.trace_id);
        }
    }
};

class CoderAgent : public BaseAgent {
public:
    using BaseAgent::BaseAgent;
    void handle(const AgentMessage& msg) override {
        if (msg.msg_type == MessageType::TASK) {
            std::string result = "Code implementation for: " + msg.content;
            send(msg.sender, MessageType::RESULT, result, msg.trace_id);
        }
    }
};

int main() {
    MessageBus bus;
    bus.register_agent("supervisor");

    ResearchAgent researcher("researcher", bus);
    CoderAgent coder("coder", bus);

    researcher.start();
    coder.start();

    // Supervisor sends tasks
    bus.send({"supervisor", "researcher", MessageType::TASK,
              "Find auth best practices", "trace-001"});
    bus.send({"supervisor", "coder", MessageType::TASK,
              "Implement JWT handler", "trace-001"});

    // Collect results
    auto r1 = bus.receive("supervisor");
    auto r2 = bus.receive("supervisor");
    std::cout << "Got: " << r1.content << std::endl;
    std::cout << "Got: " << r2.content << std::endl;

    researcher.stop();
    coder.stop();

    return 0;
}`
    },
    {
      language: "cpp",
      caption: "Multi-agent pipeline team: research, write, and edit a technical report in C++",
      source: `// Pipeline pattern: specialized agents process work sequentially.
// Each agent transforms the output of the previous one.
// Demonstrates the CrewAI-style role/goal/backstory pattern in C++.

#include <iostream>
#include <string>
#include <vector>
#include <functional>
#include <memory>

struct AgentConfig {
    std::string role;
    std::string goal;
    std::string backstory;
};

struct TaskDef {
    std::string description;
    std::string expected_output;
};

// A pipeline agent processes input from the previous stage
class PipelineAgent {
public:
    PipelineAgent(AgentConfig config, TaskDef task,
                  std::function<std::string(const std::string&)> executor)
        : config_(std::move(config)), task_(std::move(task)),
          executor_(std::move(executor)) {}

    std::string execute(const std::string& input) const {
        std::cout << "[" << config_.role << "] Starting: "
                  << task_.description.substr(0, 60) << "..." << std::endl;
        std::string result = executor_(input);
        std::cout << "[" << config_.role << "] Done. Output length: "
                  << result.size() << " chars" << std::endl;
        return result;
    }

    const std::string& role() const { return config_.role; }

private:
    AgentConfig config_;
    TaskDef task_;
    std::function<std::string(const std::string&)> executor_;
};

// Sequential pipeline: agents process in order, passing results forward
class Pipeline {
public:
    void add_agent(std::shared_ptr<PipelineAgent> agent) {
        agents_.push_back(std::move(agent));
    }

    std::string run(const std::string& initial_input) const {
        std::string current = initial_input;
        for (const auto& agent : agents_) {
            current = agent->execute(current);
        }
        return current;
    }

private:
    std::vector<std::shared_ptr<PipelineAgent>> agents_;
};

int main() {
    // Define specialized agents with roles and tasks
    auto researcher = std::make_shared<PipelineAgent>(
        AgentConfig{
            "Senior Research Analyst",
            "Uncover cutting-edge developments in AI multi-agent systems",
            "Expert AI researcher at a leading tech think tank."
        },
        TaskDef{
            "Research the latest multi-agent orchestration patterns. "
            "Cover supervisor, swarm, and hierarchical approaches.",
            "A detailed research brief with findings and sources."
        },
        [](const std::string& input) -> std::string {
            // In production: call LLM with research tools
            return "RESEARCH BRIEF: Found supervisor, swarm, and hierarchical "
                   "patterns in production. Key examples: CrewAI (supervisor), "
                   "OpenAI Swarm (decentralized), AutoGen (hierarchical).";
        }
    );

    auto writer = std::make_shared<PipelineAgent>(
        AgentConfig{
            "Technical Writer",
            "Write a clear, engaging technical report based on research findings",
            "Skilled writer who translates complex research into documents."
        },
        TaskDef{
            "Write a 1500-word technical report with executive summary.",
            "A well-structured technical report in markdown format."
        },
        [](const std::string& research) -> std::string {
            return "# Multi-Agent Orchestration Patterns\\n\\n"
                   "## Executive Summary\\n"
                   "Based on research: " + research.substr(0, 100) + "...\\n\\n"
                   "## Pattern Comparison\\n"
                   "Three dominant patterns emerge: supervisor, swarm, hierarchical.";
        }
    );

    auto editor = std::make_shared<PipelineAgent>(
        AgentConfig{
            "Senior Editor",
            "Review and polish the report for accuracy and clarity",
            "Meticulous editor with deep technical knowledge."
        },
        TaskDef{
            "Review the technical report for accuracy and completeness.",
            "A polished, publication-ready technical report."
        },
        [](const std::string& draft) -> std::string {
            return "[REVIEWED] " + draft + "\\n\\n[Editor note: Verified accuracy.]";
        }
    );

    // Assemble pipeline (sequential processing)
    Pipeline crew;
    crew.add_agent(researcher);
    crew.add_agent(writer);
    crew.add_agent(editor);

    std::string result = crew.run("Topic: Multi-agent orchestration patterns");
    std::cout << "\\n=== Final Output ===\\n" << result << std::endl;

    return 0;
}`
    }
  ],
  diagrams: [
    {
      title: "Supervisor Pattern Architecture",
      kind: "architecture",
      caption: "Central supervisor decomposes tasks, delegates to specialist workers, and aggregates results"
    },
    {
      title: "Multi-Agent Debate Flow",
      kind: "flow",
      caption: "Two debater agents argue positions while a judge evaluates and selects the best answer"
    },
    {
      title: "Agent Message Passing Sequence",
      kind: "sequence",
      caption: "Sequence of messages between supervisor, research agent, and code agent during task execution"
    },
    {
      title: "Multi-Agent Orchestration Patterns Mind Map",
      kind: "mindmap",
      caption: "Overview of orchestration patterns, communication topologies, and failure-handling strategies"
    }
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
    { label: "Building Effective Agents - Anthropic", kind: "article", note: "Anthropic's guide to agent architectures including orchestrator-workers and evaluator-optimizer patterns" },
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
