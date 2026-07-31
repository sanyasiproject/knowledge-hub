import type { TopicContent } from "../types";

export const agentFundamentals: TopicContent = {
  quickSummary: [
    "An AI agent is a system that perceives its environment, reasons about goals, plans actions, executes them using tools, and observes outcomes in a loop until the task is complete.",
    "The core agent loop is Perceive-Reason-Plan-Act-Observe: the agent takes in context, thinks about what to do, selects and executes actions, then evaluates results to decide the next step.",
    "Reasoning is the agent's ability to break down problems, evaluate options, and make decisions. Chain-of-thought, ReAct, and reflection patterns enable structured reasoning.",
    "Tool selection is how agents choose which capability to invoke. It depends on understanding tool descriptions, matching them to the current sub-task, and handling tool outputs correctly.",
  ],
  detailed: [
    "## The Agent Loop\n\nEvery agent follows a loop: (1) **Perceive** the current state (user input, tool outputs, environment observations), (2) **Reason** about what has been accomplished and what remains, (3) **Plan** the next action or sequence of actions, (4) **Act** by calling a tool or generating output, (5) **Observe** the result and update internal state. The loop continues until the task is complete, an error requires human intervention, or a maximum iteration limit is reached. This loop distinguishes agents from simple prompt-response systems: agents maintain state across multiple turns and adapt based on intermediate results.",
    "## Reasoning Patterns\n\nAgents use structured reasoning to solve complex tasks. **Chain-of-thought (CoT)** has the model think step-by-step before acting. **ReAct** (Reasoning + Acting) interleaves reasoning traces with tool calls: the model explains its thinking, takes an action, observes the result, and reasons again. **Reflection** has the agent critique its own output and retry if unsatisfied. **Tree-of-thought** explores multiple reasoning paths in parallel. The choice of reasoning pattern affects reliability: ReAct is the most common for tool-using agents because it creates an auditable trace of decisions.",
    "## Tool Selection and Invocation\n\nAgents are given descriptions of available tools (name, description, parameters, return type). The LLM must: understand what each tool does from its description, match the current sub-task to the appropriate tool, extract and format the correct arguments, and handle the tool's response (including errors). Good tool descriptions are critical: vague descriptions lead to incorrect tool selection. Tool schemas should include parameter constraints, example values, and expected output format. Agents should gracefully handle tool failures by retrying, falling back to alternative tools, or asking for clarification.",
    "## Stopping Conditions and Guardrails\n\nAgents need clear stopping conditions to avoid infinite loops or runaway costs. Common patterns include: maximum iteration limits, budget caps (token or API call limits), confidence thresholds (stop when the agent believes the answer is sufficient), and human-in-the-loop checkpoints for high-stakes decisions. Guardrails include input/output validation, tool call sandboxing, and monitoring for off-topic or harmful behavior. Without these safeguards, agents can waste resources on unproductive loops or take unintended actions.",
  ],
  interviewQA: [
    {
      q: "What distinguishes an AI agent from a standard LLM prompt-response system?",
      a: "An agent operates in a loop: it maintains state across multiple steps, uses tools to interact with the environment, observes results, and adapts its plan based on intermediate outcomes. A standard prompt-response system processes each request independently without state, tool use, or iterative refinement. Agents have autonomy to decide what to do next, while prompt-response systems only react to explicit inputs.",
    },
    {
      q: "How does the ReAct pattern work?",
      a: "ReAct interleaves reasoning and acting in a structured loop. The agent first writes a thought explaining its reasoning and plan, then selects and executes an action (tool call), then observes the result. Based on the observation, it writes another thought, potentially takes another action, and repeats until the task is complete. This creates an auditable trace of why each action was taken, making debugging and evaluation easier than opaque end-to-end generation.",
    },
    {
      q: "Why are good tool descriptions critical for agent performance?",
      a: "The LLM selects tools based solely on their descriptions, parameter schemas, and names. If a description is vague, the model may choose the wrong tool or pass incorrect arguments. Effective descriptions include: what the tool does, when to use it (and when not to), parameter constraints and examples, expected output format, and error conditions. This is essentially prompt engineering for tool selection.",
    },
  ],
  mcqs: [
    {
      q: "In the agent loop, what happens after the 'Act' step?",
      options: [
        "The agent immediately plans the next action",
        "The agent observes the result and reasons about it",
        "The loop terminates",
        "The agent restarts from the beginning",
      ],
      answerIndex: 1,
      explanation:
        "After acting (executing a tool or generating output), the agent observes the result and uses it to update its understanding of the current state before deciding the next step.",
    },
    {
      q: "Which reasoning pattern interleaves explicit thinking with tool invocations?",
      options: [
        "Chain-of-thought only",
        "ReAct (Reasoning + Acting)",
        "Few-shot prompting",
        "Self-consistency",
      ],
      answerIndex: 1,
      explanation:
        "ReAct explicitly alternates between reasoning traces (Thought) and tool calls (Action/Observation), creating an auditable decision trace.",
    },
    {
      q: "Why do agents need maximum iteration limits?",
      options: [
        "To improve response quality",
        "To prevent infinite loops and runaway costs",
        "To reduce model context window usage",
        "To ensure tools are called in the correct order",
      ],
      answerIndex: 1,
      explanation:
        "Without iteration limits, an agent could get stuck in unproductive loops, retrying failed actions or exploring dead ends indefinitely, wasting tokens and API calls.",
    },
    {
      q: "What is reflection in the context of AI agents?",
      options: [
        "Mirroring the user's input back to them",
        "The agent critiquing its own output and retrying if unsatisfied",
        "Embedding the agent's memory into a vector store",
        "Generating multiple responses and voting on the best one",
      ],
      answerIndex: 1,
      explanation:
        "Reflection is a pattern where the agent evaluates its own output against quality criteria and, if the output is insufficient, revises its approach and tries again.",
    },
  ],
  flashcards: [
    { front: "What are the five steps of the agent loop?", back: "Perceive, Reason, Plan, Act, Observe. The agent takes in context, thinks, plans actions, executes them, and evaluates results in a continuous loop." },
    { front: "What is ReAct?", back: "Reasoning + Acting. A pattern where the agent alternates between writing explicit reasoning traces and executing tool calls, creating an auditable decision trail." },
    { front: "What is chain-of-thought (CoT)?", back: "A prompting technique where the model is encouraged to think step-by-step before producing a final answer, improving accuracy on complex reasoning tasks." },
    { front: "What is tree-of-thought?", back: "A reasoning pattern that explores multiple reasoning paths in parallel, evaluates them, and selects the most promising one. More thorough than linear chain-of-thought." },
    { front: "Why is tool description quality important?", back: "The LLM selects tools based on their descriptions. Vague descriptions lead to wrong tool selection or incorrect arguments. Descriptions should include purpose, usage conditions, parameter constraints, and examples." },
    { front: "What are common agent guardrails?", back: "Max iteration limits, token/cost budgets, input/output validation, tool call sandboxing, human-in-the-loop checkpoints, and monitoring for off-topic behavior." },
    { front: "What is the difference between an agent and a chain?", back: "A chain follows a fixed, predetermined sequence of steps. An agent dynamically decides which steps to take based on intermediate results, adapting its plan at runtime." },
  ],
  glossary: [
    { term: "Agent Loop", definition: "The perceive-reason-plan-act-observe cycle that agents execute repeatedly until a task is complete or a stopping condition is met." },
    { term: "ReAct", definition: "Reasoning and Acting. A prompting framework where the model interleaves explicit reasoning traces with tool invocations." },
    { term: "Chain-of-Thought (CoT)", definition: "A technique prompting the model to produce intermediate reasoning steps before a final answer." },
    { term: "Reflection", definition: "An agent pattern where the model critiques its own output and iterates to improve quality." },
    { term: "Tool Schema", definition: "A structured description of a tool's name, purpose, parameters, and return type that the LLM uses for tool selection." },
    { term: "Guardrails", definition: "Safety mechanisms (iteration limits, budgets, validation) that prevent agents from undesirable behaviors like infinite loops or harmful actions." },
    { term: "Scratchpad", definition: "A working memory area where agents record intermediate findings, reasoning, and state across loop iterations." },
  ],
  deepDive: [
    "## How the Agent Loop Really Works Under the Hood\n\nAt its core, every agent system — from a simple ReAct loop to a multi-agent orchestrator — runs the same fundamental cycle: read context, reason about it, decide on an action, execute it, and fold the result back into context. What distinguishes production-grade agents from toy demos is how each of these phases is implemented. The context window is the agent's working memory, and managing it is the single most important engineering challenge. Each iteration appends new observations (tool outputs, error messages, intermediate results), and without careful summarization or truncation, the context grows until it exceeds the model's window or degrades performance due to attention dilution. Production systems use strategies like sliding-window summarization (condensing older turns into summaries), retrieval-augmented context (pulling in only relevant prior observations), and hierarchical memory (short-term scratchpad plus long-term vector store) to keep the context focused and within budget.",
    "## The Mechanics of Tool Selection and Invocation\n\nWhen an LLM-based agent decides to use a tool, the process involves several layers of translation. The model receives tool definitions as part of its system prompt or via a structured tool-use API (like Anthropic's tool_use blocks or OpenAI's function calling). It generates a structured output — typically JSON — specifying the tool name and arguments. The agent runtime parses this output, validates the arguments against the tool's schema, executes the tool in a sandboxed environment, and returns the result as a new message in the conversation. The quality of this pipeline depends on three factors: (1) how well the tool descriptions convey semantics (not just syntax), (2) how reliably the model generates valid JSON with correct types, and (3) how gracefully the runtime handles malformed outputs, timeouts, and tool errors. A common failure mode is argument hallucination — the model invents plausible-sounding but incorrect parameter values, especially for IDs, file paths, or URLs it has not actually observed. Mitigation strategies include constraining outputs with enums, providing recent context that contains valid values, and validating arguments before execution.",
    "## Reasoning Patterns in Depth: Trade-offs and Selection Criteria\n\nChoosing the right reasoning pattern for an agent is an architectural decision with significant implications for cost, latency, reliability, and debuggability. **Chain-of-thought (CoT)** is the simplest: the model reasons in a single pass before producing output. It works well for problems that can be solved in one shot but cannot recover from reasoning errors mid-stream. **ReAct** adds the ability to interleave reasoning with actions, making it self-correcting: if a tool call returns unexpected results, the model can reason about the failure and try a different approach. The cost is higher token usage and latency due to multiple round trips. **Reflection** adds an explicit self-critique step after generating output: the model evaluates its own work against criteria and revises if needed. This is powerful for tasks with clear quality signals (code that must compile, math that must verify) but adds another LLM call per iteration. **Tree-of-thought (ToT)** explores multiple reasoning branches in parallel and selects the best one. It is the most expensive pattern — proportional to the branching factor — but excels at problems with large search spaces like puzzle-solving, planning, or code generation where multiple valid approaches exist. In practice, most production agents use ReAct as the default and layer in reflection for critical outputs."
  ],
  code: [
    {
      language: "cpp",
      caption: "A minimal ReAct loop — C++ pseudocode showing the agent architecture",
      source: `#include <string>
#include <vector>
#include <map>
#include <iostream>
#include <functional>

// --- Tool definitions ---

struct ToolParameter {
    std::string name;
    std::string type;
    std::string description;
    bool required;
};

struct ToolDefinition {
    std::string name;
    std::string description;
    std::vector<ToolParameter> parameters;
};

// --- Message types for the conversation ---

struct Message {
    std::string role;      // "user", "assistant", or "tool_result"
    std::string content;
    std::string tool_name; // populated when role == "tool_result"
    std::string tool_id;
};

// --- LLM response types ---

struct ToolCall {
    std::string id;
    std::string name;
    std::map<std::string, std::string> arguments;
};

struct LLMResponse {
    std::string stop_reason;  // "end_turn" or "tool_use"
    std::string text_content;
    std::vector<ToolCall> tool_calls;
};

// --- LLM Client (wraps API calls) ---

class LLMClient {
public:
    LLMResponse create_message(
        const std::string& model,
        const std::string& system_prompt,
        const std::vector<ToolDefinition>& tools,
        const std::vector<Message>& messages,
        int max_tokens = 1024
    ) {
        // In production: serialize tools + messages to JSON,
        // call the chat API (e.g., Anthropic Messages API),
        // parse the response into LLMResponse
        return {};  // placeholder
    }
};

// --- Tool execution dispatcher ---

std::string execute_tool(const std::string& name,
                         const std::map<std::string, std::string>& args) {
    if (name == "search_web") {
        // In production: call a real search API
        return "Search results for '" + args.at("query") + "': [simulated results]";
    }
    if (name == "calculator") {
        // In production: use a safe expression evaluator
        return "42";  // placeholder result
    }
    return "Unknown tool: " + name;
}

// --- The ReAct agent loop ---

std::string run_agent(LLMClient& client,
                      const std::vector<ToolDefinition>& tools,
                      const std::string& user_task,
                      int max_iterations = 10) {
    std::vector<Message> messages;
    messages.push_back({"user", user_task, "", ""});

    std::string system_prompt =
        "You are a helpful agent. Think step by step. "
        "Use tools when you need external information or computation. "
        "When you have enough information, provide the final response.";

    for (int iteration = 0; iteration < max_iterations; ++iteration) {
        std::cout << "--- Iteration " << (iteration + 1) << " ---\\n";

        auto response = client.create_message(
            "claude-sonnet-4-20250514", system_prompt, tools, messages);

        if (response.stop_reason == "tool_use") {
            // Process each tool call from the model
            for (const auto& tc : response.tool_calls) {
                std::cout << "  Tool: " << tc.name << "\\n";
                std::string result = execute_tool(tc.name, tc.arguments);
                std::cout << "  Result: " << result << "\\n";

                // Feed the tool result back into the conversation
                messages.push_back({
                    "tool_result", result, tc.name, tc.id
                });
            }
        } else {
            // stop_reason == "end_turn": model produced final answer
            std::cout << "  Final answer: "
                      << response.text_content.substr(0, 200) << "...\\n";
            return response.text_content;
        }
    }
    return "Agent reached maximum iterations without completing the task.";
}

int main() {
    LLMClient client;

    std::vector<ToolDefinition> tools = {
        {"search_web",
         "Search the web for current information.",
         {{"query", "string", "The search query", true}}},
        {"calculator",
         "Evaluate a mathematical expression.",
         {{"expression", "string", "e.g. '2 + 2' or 'sqrt(144)'", true}}},
    };

    std::string answer = run_agent(
        client, tools, "What is 15% of the population of France?");
}`
    },
    {
      language: "cpp",
      caption: "ReAct agent with reflection — C++ pseudocode showing self-critique and retry pattern",
      source: `#include <string>
#include <vector>
#include <map>
#include <iostream>
#include <functional>

// Forward declarations (see previous example for full definitions)
struct ToolDefinition;
struct Message;
struct LLMResponse;

// --- Reflection result ---

struct ReflectionResult {
    bool is_satisfactory;
    std::string critique;
    std::string suggestion;
};

// --- LLM Client ---

class LLMClient {
public:
    LLMResponse create_message(
        const std::string& model,
        const std::vector<ToolDefinition>& tools,
        const std::vector<Message>& messages,
        int max_tokens = 1024);

    // Simplified call for reflection (no tools needed)
    std::string complete(const std::string& prompt, int max_tokens = 512);
};

// --- Reflection step: ask the model to critique its own answer ---

ReflectionResult reflect_on_answer(
    LLMClient& client,
    const std::string& question,
    const std::string& answer
) {
    std::string prompt =
        "You previously answered this question:\\n"
        "Question: " + question + "\\n"
        "Your answer: " + answer + "\\n\\n"
        "Critically evaluate your answer:\\n"
        "1. Is it factually accurate based on the information you gathered?\\n"
        "2. Does it fully address the question?\\n"
        "3. Are there gaps or unsupported claims?\\n\\n"
        "Respond in JSON: "
        R"({"is_satisfactory": true/false, "critique": "...", "suggestion": "..."})";

    std::string response_text = client.complete(prompt);

    // In production: parse JSON from response_text
    // Extract is_satisfactory, critique, suggestion fields
    // Handle malformed JSON by searching for '{' ... '}'
    ReflectionResult result;
    result.is_satisfactory = true;  // placeholder — parse from response
    result.critique = "";
    result.suggestion = "";
    return result;
}

// --- Tool executor function type ---
using ToolExecutor = std::function<std::string(
    const std::string& name,
    const std::map<std::string, std::string>& args)>;

// --- Agent loop with reflection ---

std::string agent_with_reflection(
    LLMClient& client,
    const std::string& question,
    const std::vector<ToolDefinition>& tools,
    ToolExecutor execute_tool,
    int max_iterations = 10,
    int max_reflections = 2
) {
    std::vector<Message> messages;
    messages.push_back({"user", question, "", ""});
    std::string answer;

    for (int attempt = 0; attempt < max_reflections; ++attempt) {

        // --- Standard ReAct loop ---
        bool completed = false;
        for (int iter = 0; iter < max_iterations; ++iter) {
            auto response = client.create_message(
                "claude-sonnet-4-20250514", tools, messages);

            if (response.stop_reason == "tool_use") {
                for (const auto& tc : response.tool_calls) {
                    std::string result = execute_tool(tc.name, tc.arguments);
                    messages.push_back({
                        "tool_result", result, tc.name, tc.id});
                }
            } else {
                // Model produced an answer
                answer = response.text_content;
                completed = true;
                break;
            }
        }
        if (!completed)
            answer = "Max iterations reached.";

        // --- Reflection step ---
        auto reflection = reflect_on_answer(client, question, answer);
        std::cout << "Reflection (attempt " << (attempt + 1) << "): "
                  << (reflection.is_satisfactory ? "satisfactory" : "needs revision")
                  << " — " << reflection.critique << "\\n";

        if (reflection.is_satisfactory)
            return answer;

        // Not satisfactory: feed critique back and retry
        messages.push_back({"assistant", answer, "", ""});
        messages.push_back({"user",
            "Your answer was not satisfactory. Critique: " +
            reflection.critique + ". Suggestion: " +
            (reflection.suggestion.empty()
                ? "Try again with more care."
                : reflection.suggestion) +
            " Please try again.",
            "", ""});
    }

    return answer;  // best effort after max reflections
}`
    },
    {
      language: "typescript",
      caption: "TypeScript agent with structured tool definitions using the Anthropic SDK",
      source: `import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// Type-safe tool definitions
interface ToolDefinition {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

const tools: ToolDefinition[] = [
  {
    name: "get_weather",
    description:
      "Get the current weather for a location. Returns temperature, conditions, and humidity.",
    input_schema: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "City name, e.g. 'San Francisco, CA'",
        },
        unit: {
          type: "string",
          enum: ["celsius", "fahrenheit"],
          description: "Temperature unit (default: celsius)",
        },
      },
      required: ["location"],
    },
  },
  {
    name: "read_file",
    description:
      "Read the contents of a file at the given path. Returns the file text or an error.",
    input_schema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Absolute or relative file path",
        },
      },
      required: ["path"],
    },
  },
];

// Tool execution dispatcher
async function executeTool(
  name: string,
  input: Record<string, unknown>
): Promise<string> {
  switch (name) {
    case "get_weather":
      // Simulated — replace with real API call
      return JSON.stringify({
        location: input.location,
        temperature: 22,
        unit: input.unit ?? "celsius",
        conditions: "Partly cloudy",
        humidity: 65,
      });
    case "read_file":
      // Simulated — replace with fs.readFile in production
      return \`Contents of \${input.path}: [simulated file data]\`;
    default:
      return \`Error: Unknown tool "\${name}"\`;
  }
}

async function runAgent(userMessage: string): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: userMessage },
  ];

  const MAX_ITERATIONS = 15;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      tools: tools as Anthropic.Tool[],
      messages,
    });

    // If the model is done, extract and return the text
    if (response.stop_reason === "end_turn") {
      return response.content
        .filter((block): block is Anthropic.TextBlock => block.type === "text")
        .map((block) => block.text)
        .join("\\n");
    }

    // Process tool calls
    if (response.stop_reason === "tool_use") {
      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const block of response.content) {
        if (block.type === "tool_use") {
          console.log(\`  Tool call: \${block.name}(\${JSON.stringify(block.input)})\`);
          const result = await executeTool(
            block.name,
            block.input as Record<string, unknown>
          );
          console.log(\`  Result: \${result}\`);
          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: result,
          });
        }
      }

      messages.push({ role: "assistant", content: response.content });
      messages.push({ role: "user", content: toolResults });
    }
  }

  return "Agent did not complete within the iteration limit.";
}

// Usage
runAgent("What is the weather in Tokyo and Paris?").then(console.log);`
    }
  ],
  diagrams: [
    {
      title: "The Agent Loop",
      kind: "flow",
      caption: "The core perceive-reason-plan-act-observe cycle that every agent executes. The loop continues until a stopping condition is met (task complete, error, or iteration limit)."
    },
    {
      title: "Agent States and Transitions",
      kind: "state",
      caption: "State diagram showing the possible states of an agent (idle, reasoning, awaiting tool result, reflecting, completed, error) and the transitions between them."
    },
    {
      title: "Tool Selection Decision Flow",
      kind: "flow",
      caption: "How an agent decides which tool to invoke: parse the sub-task, match against tool descriptions, validate arguments, execute, and handle the result or error."
    },
  ],
  animations: [
    {
      title: "ReAct Reasoning Cycle: Step-by-Step",
      steps: [
        {
          label: "User Query Received",
          detail: "The user asks: 'What is the GDP per capita of Norway and how does it compare to Sweden?' The agent receives this as the initial input and begins the loop."
        },
        {
          label: "Thought 1 — Decompose the Task",
          detail: "The agent reasons: 'I need two pieces of information — the GDP per capita of Norway and of Sweden. I should search for each. Let me start with Norway.' This is the explicit reasoning trace."
        },
        {
          label: "Action 1 — Search for Norway GDP",
          detail: "The agent selects the search_web tool with query 'Norway GDP per capita 2024'. The tool call is formatted as structured JSON and sent to the runtime for execution."
        },
        {
          label: "Observation 1 — Process Search Results",
          detail: "The search returns: 'Norway GDP per capita: approximately $87,000 (2024 estimate, World Bank).' The agent receives this as a new context message and updates its scratchpad."
        },
        {
          label: "Thought 2 — Plan Next Action",
          detail: "The agent reasons: 'I have Norway's GDP per capita ($87,000). Now I need Sweden's GDP per capita for comparison. Let me search for that.' The intermediate result is retained in context."
        },
        {
          label: "Action 2 — Search for Sweden GDP",
          detail: "The agent calls search_web with query 'Sweden GDP per capita 2024'. This demonstrates the iterative nature of ReAct — each action is informed by prior observations."
        },
        {
          label: "Observation 2 — Receive Second Result",
          detail: "The search returns: 'Sweden GDP per capita: approximately $55,000 (2024 estimate, World Bank).' The agent now has both data points needed to answer the question."
        },
        {
          label: "Thought 3 — Synthesize and Respond",
          detail: "The agent reasons: 'Norway ($87,000) has a significantly higher GDP per capita than Sweden ($55,000), roughly 58% higher. I can now compose a complete answer.' No more tool calls are needed."
        },
        {
          label: "Final Answer",
          detail: "The agent generates the final response with both figures, the comparison, and context about why Norway's figure is higher (oil revenues, sovereign wealth fund). The loop terminates with stop_reason 'end_turn'."
        }
      ]
    }
  ],
  comparison: {
    columns: ["Aspect", "ReAct", "Chain-of-Thought (CoT)", "Reflection", "Tree-of-Thought (ToT)"],
    rows: [
      [
        "Core idea",
        "Interleave reasoning traces with tool actions in a loop",
        "Think step-by-step in a single pass before answering",
        "Generate answer, then self-critique and revise",
        "Explore multiple reasoning branches in parallel, select best"
      ],
      [
        "Tool use",
        "Yes — tools are called between reasoning steps",
        "No — pure reasoning without external actions",
        "Optional — reflection can trigger new tool calls",
        "Optional — each branch can independently use tools"
      ],
      [
        "Error recovery",
        "Strong — can observe failures and adapt in the next iteration",
        "Weak — single-pass, no opportunity to recover from errors",
        "Moderate — can catch errors in the critique step and retry",
        "Strong — if one branch fails, others may succeed"
      ],
      [
        "Cost (tokens)",
        "Medium — multiple LLM calls per loop iteration",
        "Low — single LLM call",
        "Medium-High — at least 2x calls (generate + reflect per attempt)",
        "High — proportional to branching factor times depth"
      ],
      [
        "Latency",
        "Medium — sequential tool calls add round-trip time",
        "Low — single inference pass",
        "Medium — additional inference for each reflection",
        "High — parallel branches, but overall wall time increases"
      ],
      [
        "Debuggability",
        "Excellent — explicit thought-action-observation trace",
        "Good — reasoning steps are visible but no action trace",
        "Good — critique provides insight into failure modes",
        "Moderate — many branches to inspect, harder to follow"
      ],
      [
        "Best for",
        "Tool-using agents, research tasks, multi-step workflows",
        "Math, logic, simple Q&A without external data",
        "Code generation, writing, tasks with verifiable quality",
        "Planning, puzzles, creative tasks with large solution spaces"
      ],
      [
        "Example use case",
        "Customer support agent querying databases and APIs",
        "Solving a word problem or summarizing a document",
        "Writing code that must compile and pass tests",
        "Generating a project plan with multiple viable strategies"
      ]
    ]
  },
  exercises: [
    "Implement a ReAct agent in Python that uses two tools — a dictionary lookup API and a calculator — to answer the question: 'If the word \"sesquipedalian\" has N letters, what is N factorial?' Ensure the agent calls the dictionary tool first to count letters, then uses the calculator for the factorial.",
    "Design a set of tool descriptions for a file-management agent that can read, write, list, and delete files. Write descriptions that are clear enough to prevent the model from choosing 'delete' when the user says 'remove the last line from the file' (which should use 'write').",
    "Build a reflection loop that generates a Python function, runs it against 3 test cases, and retries with the error feedback if any test fails. Limit to 3 reflection attempts. Measure how often it self-corrects successfully.",
    "Create an agent with a maximum budget of 5 tool calls. The agent must answer a multi-part question that ideally requires 8 tool calls. Observe how the agent prioritizes which information to gather when constrained. Document the trade-offs it makes.",
    "Implement a simple tree-of-thought system that generates 3 different approaches to a coding problem, evaluates each by running test cases, and returns the approach that passes the most tests. Compare its success rate to a single-pass CoT approach on 10 problems."
  ],
  cheatSheet: [
    "The agent loop is Perceive-Reason-Plan-Act-Observe. Every agent, regardless of framework, implements this cycle.",
    "ReAct = Thought + Action + Observation in a loop. It is the default pattern for tool-using agents because it produces an auditable trace.",
    "Tool descriptions are prompt engineering: include what the tool does, when to use it, parameter constraints, examples, and error conditions.",
    "Always set a max_iterations limit (typically 10-25). Without it, agents can loop indefinitely on unsolvable tasks.",
    "Context window management is the top engineering challenge: summarize old turns, use retrieval for long histories, prune irrelevant observations.",
    "Argument hallucination is the most common tool-use failure. Mitigate with enums, recent context containing valid values, and pre-execution validation.",
    "Reflection adds cost but catches errors: generate an answer, critique it, revise if needed. Best for tasks with verifiable quality (code, math).",
    "Stop_reason tells you what happened: 'end_turn' means the model is done, 'tool_use' means it wants to call a tool, 'max_tokens' means it was cut off."
  ],
  revisionNotes: [
    "An AI agent is distinguished from a simple LLM by its loop (state across turns), tool use (environment interaction), and autonomy (deciding what to do next).",
    "The five steps of the agent loop — Perceive, Reason, Plan, Act, Observe — repeat until a stopping condition is met (task done, error, or iteration cap).",
    "ReAct interleaves Thought (explicit reasoning), Action (tool call), and Observation (tool result). It is self-correcting because the agent can adapt after seeing tool outputs.",
    "Chain-of-thought is single-pass reasoning without tools. Cheap and fast, but no error recovery and no access to external information.",
    "Tree-of-thought explores multiple reasoning paths in parallel. Most expensive pattern, but excels at problems with large solution spaces.",
    "Reflection = generate + self-critique + revise. Powerful for tasks where quality is verifiable (compilable code, correct math), but doubles the cost per iteration.",
    "Tool selection depends on description quality. Vague descriptions cause wrong tool picks. Include purpose, usage conditions, parameter types, examples, and error modes.",
    "Guardrails are essential in production: max iterations, token budgets, input/output validation, sandboxed execution, and human-in-the-loop for high-stakes decisions."
  ],
  resources: [
    {
      label: "ReAct: Synergizing Reasoning and Acting in Language Models (Yao et al., 2023)",
      kind: "paper",
      note: "The foundational paper introducing the ReAct framework, showing how interleaving reasoning and acting outperforms both alone."
    },
    {
      label: "Anthropic Tool Use Documentation",
      kind: "docs",
      note: "Official Anthropic documentation on implementing tool use with Claude, including tool definitions, structured outputs, and best practices."
    },
    {
      label: "Tree of Thoughts: Deliberate Problem Solving with Large Language Models (Yao et al., 2023)",
      kind: "paper",
      note: "Introduces the tree-of-thought framework for exploring multiple reasoning paths with LLMs."
    },
    {
      label: "Building Effective Agents — Anthropic Cookbook",
      kind: "docs",
      note: "Practical guide covering agent architectures, common patterns, and production deployment considerations."
    },
    {
      label: "LangGraph Documentation",
      kind: "docs",
      note: "Framework for building stateful, multi-step agent workflows with cycles, branching, and persistence."
    },
    {
      label: "Reflexion: Language Agents with Verbal Reinforcement Learning (Shinn et al., 2023)",
      kind: "paper",
      note: "Introduces the reflection pattern where agents use verbal self-feedback to improve performance across episodes."
    },
    {
      label: "The AI Agent Infrastructure Stack (Lilian Weng, 2023)",
      kind: "article",
      note: "Comprehensive survey of agent components: memory, planning, tool use, and their implementation trade-offs."
    },
  ],
  followUps: [
    "Multi-agent systems: how do agents coordinate, delegate, and communicate in a team?",
    "Memory architectures: short-term scratchpads, long-term vector stores, and episodic memory for agents.",
    "Agent evaluation and benchmarks: how do you measure whether an agent is reliable (SWE-bench, GAIA, ToolBench)?",
    "Production deployment: error handling, observability, cost control, and scaling agent workloads.",
    "Human-in-the-loop patterns: when should an agent ask for help vs. proceed autonomously?",
  ],
};
