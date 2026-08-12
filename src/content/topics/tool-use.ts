import type { TopicContent } from "../types";

export const toolUse: TopicContent = {
  quickSummary: [
    "Tool use (function calling) allows LLMs to invoke external functions by generating structured JSON arguments that match predefined schemas, bridging the gap between language understanding and real-world action.",
    "Tool schemas define the interface: name, description, parameter types, required fields, and constraints. The quality of schemas directly determines how reliably the model calls tools.",
    "Error handling in tool use requires graceful degradation: retrying with corrected arguments, falling back to alternative tools, or surfacing clear error messages to the user.",
    "Parallel tool use enables the model to invoke multiple independent tools simultaneously, reducing latency for tasks that require several data sources.",
  ],
  detailed: [
    "## Function Calling Mechanics\n\nWhen an LLM supports tool use, you provide a list of tool definitions alongside the conversation. The model decides whether to call a tool, selects which one, and generates a JSON object with the required arguments. The system executes the function and returns the result to the model, which incorporates it into its response. This is not the model executing code: the model generates a structured request, and your application handles execution. Models like Claude, GPT-4, and Gemini all support this pattern with slightly different API formats, but the concept is identical.",
    "## Designing Tool Schemas\n\nA tool schema includes: **name** (concise, descriptive verb-noun like `search_documents`), **description** (when to use it, what it returns, edge cases), and **parameters** (JSON Schema with types, descriptions, enums, defaults, and required fields). Best practices: use enums to constrain categorical parameters, provide parameter descriptions with examples, mark optional parameters with defaults, and include negative guidance (when NOT to use the tool). The description is the most important field: it is the model's primary signal for tool selection. Treat it like API documentation for an LLM reader.",
    "## Error Handling Patterns\n\nTool calls can fail in several ways: invalid arguments (schema violation), tool execution errors (API timeouts, not found), and semantic errors (tool succeeds but returns unhelpful results). Robust error handling includes: returning structured error objects with error type and message, allowing the model to retry with corrected arguments, implementing fallback chains (try tool A, if it fails try tool B), and setting maximum retry limits to prevent loops. The error message should be informative enough for the model to correct its approach, not just 'error occurred'.",
    "## Parallel Tool Use\n\nSome APIs allow the model to request multiple tool calls in a single turn. This is useful when several independent pieces of information are needed: for example, fetching weather, calendar, and email simultaneously. The system executes all calls in parallel and returns all results at once. This reduces round trips and latency. Not all calls can be parallelized: if tool B's arguments depend on tool A's result, they must be sequential. The model should be able to express these dependencies, and the orchestration layer should respect them.",
    "## Security Considerations\n\nTool use introduces security surface area. Key concerns: **prompt injection** (malicious input causing unintended tool calls), **argument injection** (crafted inputs that exploit tool parameters), **excessive permissions** (tools with destructive capabilities like delete or write), and **data exfiltration** (tools that send data to external endpoints). Mitigations include: input validation before tool execution, least-privilege tool permissions, confirmation prompts for destructive operations, output sanitization, and audit logging of all tool invocations.",
  ],
  deepDive: [
    "## Advanced Tool Orchestration Patterns\n\nBeyond simple single-tool calls, production systems employ sophisticated orchestration patterns. **Routing** uses a classifier (often the LLM itself) to select which tool or toolset is appropriate before making the call, reducing irrelevant tool invocations and lowering latency. **Chaining** sequences tool calls so the output of one becomes the input of the next, e.g., `search_documents` -> `summarize_text` -> `send_email`. Orchestration frameworks like LangGraph or custom state machines manage these chains, handling branching logic, error recovery, and conditional execution. The key design decision is whether orchestration is model-driven (the LLM decides the next step) or system-driven (a deterministic workflow invokes the LLM at specific nodes).",
    "## Multi-Agent Tool Sharing\n\nIn multi-agent architectures, multiple LLM agents may need access to overlapping toolsets. A shared tool registry acts as a central catalog: agents discover tools dynamically, and access control policies determine which agents can invoke which tools. This avoids tool definition duplication and ensures consistent schemas. Patterns include **tool delegation** (Agent A asks Agent B to run a tool on its behalf), **tool namespacing** (each agent sees a scoped subset of tools), and **capability-based access** (agents request tool permissions at runtime). MCP (Model Context Protocol) standardizes this by exposing tools as server-hosted resources that any compliant client can discover and invoke.",
    "## Tool Schema Evolution and Versioning\n\nAs systems evolve, tool schemas change: parameters are added, types are refined, or tools are deprecated. Without versioning, schema changes can silently break tool calls. Best practices include: **semantic versioning** of tool schemas (breaking changes increment the major version), **additive-only changes** where possible (new optional parameters preserve backward compatibility), **deprecation periods** where old and new versions coexist, and **schema migration tooling** that validates existing prompts and few-shot examples against updated schemas. Include a `version` field in your tool registry and test schema changes against a suite of historical tool call examples to catch regressions.",
  ],
  code: [
    {
      language: "typescript",
      caption: "Defining tools — the description is a prompt, not documentation",
      source: `import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// Few, sharply-distinguished tools. Selection accuracy falls as the list grows,
// and two tools with overlapping descriptions is the usual cause of the model
// picking the wrong one.
const tools: Anthropic.Tool[] = [
  {
    name: "get_order",
    description:
      "Fetch one order by its exact order ID (format ORD-12345). " +
      "Use when the customer gives an order number. " +
      "To find orders by customer email or date, use search_orders instead.",
    input_schema: {
      type: "object",
      properties: { order_id: { type: "string", pattern: "^ORD-\\\\d+$" } },
      required: ["order_id"],
    },
  },
  {
    name: "search_orders",
    description:
      "Find orders by customer email and optional date range. " +
      "Returns at most 20 results, newest first. " +
      "Use when you do NOT have an exact order ID.",
    input_schema: {
      type: "object",
      properties: {
        email: { type: "string", format: "email" },
        since: { type: "string", description: "ISO 8601 date" },
      },
      required: ["email"],
    },
  },
];

// What makes these descriptions work:
// - Each says when to use it AND when not to, naming the alternative.
// - The pattern on order_id makes a hallucinated ID a schema violation.
// - Result size is stated, so the model knows the output is bounded.`,
    },
    {
      language: "typescript",
      caption: "The tool loop — your code executes, the model only requests",
      source: `type ToolFn = (input: any) => Promise<unknown>;

const handlers: Record<string, ToolFn> = {
  get_order: async ({ order_id }) => db.orders.findById(order_id),
  search_orders: async ({ email, since }) => db.orders.search({ email, since }),
};

export async function runAgent(userMessage: string, maxSteps = 8) {
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: userMessage }];

  for (let step = 0; step < maxSteps; step++) {   // ALWAYS bound the loop
    const res = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1024,
      tools,
      messages,
    });

    messages.push({ role: "assistant", content: res.content });

    if (res.stop_reason !== "tool_use") {
      return res.content.find((b) => b.type === "text");
    }

    const calls = res.content.filter((b) => b.type === "tool_use");

    // Independent calls run concurrently — the model can request several at once.
    const results = await Promise.all(
      calls.map(async (call) => {
        try {
          const out = await handlers[call.name]?.(call.input);
          return {
            type: "tool_result" as const,
            tool_use_id: call.id,
            content: JSON.stringify(out ?? { error: "unknown tool" }).slice(0, 4000),
          };
        } catch (err) {
          // Return the error TO the model — it can often recover. Throwing
          // here ends the run for what may be a retryable problem.
          return {
            type: "tool_result" as const,
            tool_use_id: call.id,
            is_error: true,
            content: \`\${(err as Error).message}. Check the arguments and try again.\`,
          };
        }
      })
    );

    messages.push({ role: "user", content: results });
  }

  throw new Error("agent exceeded step budget"); // a loop, not progress
}

// The security boundary lives here, not in the model:
// authorisation, rate limits, and "is this caller allowed to read this order"
// are enforced in handlers[]. The model can request delete_everything(); whether
// that runs is entirely your code's decision.
//
// Note the truncation on tool output. An unbounded dump fills the context and
// degrades every later step in the run.`,
    },
  ],
  comparison: {
    columns: ["Feature", "Claude (Anthropic)", "GPT-4 (OpenAI)", "Gemini (Google)"],
    rows: [
      ["Schema format", "JSON Schema in `input_schema`", "JSON Schema in `parameters`", "OpenAPI-subset in `parameters`"],
      ["Parallel tool calls", "Yes, multiple `tool_use` blocks in one response", "Yes, multiple tool calls in one message", "Yes, multiple `functionCall` parts"],
      ["Tool choice control", "`tool_choice`: `auto`, `any`, or `{name}`", "`tool_choice`: `auto`, `required`, or `{name}`", "`tool_config` with `mode` and `allowed_function_names`"],
      ["Result format", "`tool_result` content block with `tool_use_id`", "`tool` role message with `tool_call_id`", "`functionResponse` part with `name`"],
      ["Streaming tool calls", "SSE with `content_block_delta` for incremental JSON", "SSE with `tool_calls` delta chunks", "SSE with `functionCall` chunks"],
      ["Max tools per request", "No hard limit (recommended < 64)", "128 tools per request", "No documented hard limit"],
      ["Nested/complex schemas", "Full JSON Schema support including `$ref`", "Full JSON Schema support", "Subset of OpenAPI 3.0 schema"],
    ],
  },
  diagrams: [
    {
      title: "Tool Use Agentic Loop",
      kind: "flow",
      caption: "How an LLM iterates through tool calls, receiving results, until it produces a final answer.",
      mermaid: `flowchart TD
    A["User Message"] --> B["LLM processes prompt
and tool definitions"]
    B --> C{LLM decides}
    C -->|tool call needed| D["Generate tool call
name and arguments"]
    D --> E["Execute tool
function or API"]
    E --> F["Append tool result
to context"]
    F --> B
    C -->|final answer ready| G["Generate text response"]
    G --> H["Return to user"]`,
    },
    {
      title: "Tool Definition Structure",
      kind: "architecture",
      caption: "Anatomy of a tool definition passed to the LLM including name, description, and JSON schema parameters.",
      mermaid: `graph TD
    TD["Tool Definition"] --> N["name
string identifier"]
    TD --> D["description
tells model when to use"]
    TD --> P["parameters
JSON Schema object"]
    P --> PR["properties
name + type + description"]
    P --> RE["required
array of required fields"]
    N --> LLM["LLM uses to select
correct tool"]
    D --> LLM
    P --> LLM`,
    },
    {
      title: "Multi-Tool Orchestration",
      kind: "sequence",
      caption: "LLM orchestrating multiple tool calls in sequence to answer a complex question.",
      mermaid: `sequenceDiagram
    participant U as User
    participant L as LLM
    participant S as Search Tool
    participant C as Calculator Tool
    U->>L: What is the GDP growth rate difference?
    L->>S: search(query="US GDP 2023")
    S-->>L: result: 2.5%
    L->>S: search(query="EU GDP 2023")
    S-->>L: result: 0.5%
    L->>C: subtract(2.5, 0.5)
    C-->>L: result: 2.0
    L-->>U: The difference is 2.0 percentage points`,
    },
    {
      title: "Tool Use vs RAG",
      kind: "mindmap",
      caption: "Comparing tool use with retrieval-augmented generation for extending LLM capabilities.",
      mermaid: `mindmap
  root((LLM Extensions))
    Tool Use
      Real-time actions
      APIs and functions
      Calculator
      Code execution
      Write and modify state
    RAG
      Static knowledge
      Vector search
      Document retrieval
      Read-only context
      Grounding responses`,
    },
  ],
  animations: [
    {
      title: "Tool Call Cycle",
      steps: [
        { label: "User sends message", detail: "The user sends a natural language request like 'What is the weather in Paris?' to the application." },
        { label: "Message sent with tool definitions", detail: "The application forwards the user message to the LLM API along with an array of tool schemas (name, description, input_schema) that define available capabilities." },
        { label: "Model selects tool and generates arguments", detail: "The model analyzes the request against available tools, selects `get_weather`, and generates a JSON object `{\"location\": \"Paris, France\"}` matching the tool's input schema." },
        { label: "Application executes the tool", detail: "The application receives the `tool_use` block, extracts the tool name and arguments, validates them against the schema, and calls the actual weather API." },
        { label: "Tool result returned to model", detail: "The application sends a `tool_result` message back to the model containing the API response: temperature, conditions, humidity, etc." },
        { label: "Model generates final response", detail: "The model incorporates the tool result into a natural language response: 'The weather in Paris is currently 18 degrees C and partly cloudy with 72% humidity.'" },
      ],
    },
  ],
  interviewQA: [
    {
      q: "How does function calling work in LLMs?",
      a: "You provide tool definitions (name, description, parameter schema) alongside the conversation. The model analyzes the user's request and decides whether a tool call is needed. If so, it generates a JSON object with the tool name and arguments matching the schema. Your application executes the function with those arguments and returns the result to the model. The model then uses the result to formulate its response. The model never executes code directly: it produces structured requests that your code handles.",
    },
    {
      q: "What makes a good tool description?",
      a: "A good description tells the model: what the tool does, when to use it, when NOT to use it, what it returns, and any limitations. It should include examples of appropriate use cases and edge cases. Think of it as API documentation written for an LLM reader. Avoid vague descriptions like 'searches things': instead, say 'Searches the product catalog by name or category. Use when the user asks about specific products. Returns top 10 matches with name, price, and availability.'",
    },
    {
      q: "How should you handle tool call errors?",
      a: "Return structured error objects with error type and a descriptive message the model can act on. Allow the model to retry with corrected arguments (e.g., if a parameter was out of range). Implement fallback chains for critical operations. Set maximum retry limits to prevent infinite loops. Log all errors for debugging. The error message should guide correction: 'date must be in YYYY-MM-DD format, received: tomorrow' is actionable; 'invalid input' is not.",
    },
  ],
  mcqs: [
    {
      q: "What is the model's role in function calling?",
      options: [
        "Executing the function directly",
        "Generating structured JSON arguments for the function",
        "Compiling and running the function code",
        "Storing the function results in memory",
      ],
      answerIndex: 1,
      explanation:
        "The model generates a JSON object with the tool name and arguments. The application is responsible for actually executing the function and returning results to the model.",
    },
    {
      q: "Why should tool parameters use enums where possible?",
      options: [
        "Enums make the schema file smaller",
        "Enums constrain the model to valid values, reducing argument errors",
        "Enums are required by the JSON Schema specification",
        "Enums allow the model to skip validation",
      ],
      answerIndex: 1,
      explanation:
        "Enums restrict parameter values to a predefined set of valid options, preventing the model from generating invalid or unexpected argument values.",
    },
    {
      q: "When is parallel tool use beneficial?",
      options: [
        "When tool B's arguments depend on tool A's results",
        "When multiple independent data sources need to be queried simultaneously",
        "When only one tool is available",
        "When the model needs to reduce token usage",
      ],
      answerIndex: 1,
      explanation:
        "Parallel tool use reduces latency by executing independent tool calls simultaneously. It is only applicable when calls have no dependencies on each other's results.",
    },
    {
      q: "What is the primary security risk of tool use?",
      options: [
        "The model generates too many tokens",
        "Prompt injection causing unintended tool calls with malicious arguments",
        "Tool descriptions being too verbose",
        "The model refusing to call tools",
      ],
      answerIndex: 1,
      explanation:
        "Prompt injection can cause the model to invoke tools with arguments crafted by an attacker embedded in the input, potentially causing data exfiltration, unauthorized actions, or destructive operations.",
    },
  ],
  flashcards: [
    { front: "What are the three parts of a tool schema?", back: "Name (concise verb-noun), description (when/how to use), and parameters (JSON Schema with types, constraints, and required fields)." },
    { front: "What is the difference between tool calling and code execution?", back: "In tool calling, the model generates structured arguments (JSON); the application executes the function. The model never runs code directly." },
    { front: "What is a fallback chain in tool use?", back: "A pattern where if the primary tool fails, the system automatically tries alternative tools that can accomplish the same task." },
    { front: "What is parallel tool use?", back: "The model requesting multiple independent tool calls in a single turn, which are executed simultaneously to reduce latency." },
    { front: "Why is negative guidance important in tool descriptions?", back: "Telling the model when NOT to use a tool prevents incorrect tool selection. For example: 'Do not use for real-time data; results may be up to 24 hours old.'" },
    { front: "What is argument injection?", back: "A security attack where malicious input is crafted to manipulate tool call arguments, potentially causing unintended actions or data access." },
    { front: "What makes an error message actionable for an LLM?", back: "It describes what went wrong, what the correct format/values should be, and provides enough context for the model to retry with corrected arguments." },
  ],
  followUps: [
    "How does MCP (Model Context Protocol) standardize tool discovery and invocation across different LLM providers?",
    "What are the trade-offs between model-driven vs. system-driven tool orchestration in production?",
    "How do you test and validate tool schemas against a suite of expected tool call patterns?",
    "What strategies exist for gracefully deprecating tools without breaking existing agent workflows?",
    "How do you implement rate limiting and cost controls when an LLM agent has access to paid external APIs?",
  ],
  exercises: [
    "Build a tool-calling loop that handles three tools (`search_web`, `get_weather`, `calculate`) with proper error handling and a maximum of 3 retries per tool call.",
    "Design a tool schema for a `manage_calendar` tool that supports creating, updating, deleting, and listing events, using discriminated unions for the action parameter.",
    "Implement a fallback chain where if `search_primary_db` fails, the system tries `search_cache`, then `search_backup_db`, returning the first successful result to the model.",
    "Write input validation middleware that sanitizes tool call arguments before execution, blocking SQL injection patterns and path traversal attempts in string parameters.",
    "Create an audit logging system that records every tool invocation (tool name, arguments, result, latency, caller identity) and flags anomalous patterns like rapid repeated calls to destructive tools.",
  ],
  cheatSheet: [
    "Tool schema = `name` + `description` + `input_schema` (JSON Schema with types, required, enums)",
    "The `description` field is the most important: it drives tool selection more than the name",
    "Use `tool_choice: 'any'` to force the model to call a tool; `auto` lets it decide; `{name: 'x'}` forces a specific tool",
    "Always return `tool_use_id` in tool results so the model can match results to requests",
    "Parallel tool calls: check for multiple `tool_use` blocks in `response.content` and execute concurrently",
    "Error responses should include error type, message, and corrective guidance, not just 'failed'",
    "Validate arguments before execution: check types, ranges, enum membership, and sanitize strings",
    "Set `max_tokens` high enough that the model can generate complete tool call JSON without truncation",
  ],
  revisionNotes: [
    "Tool use is a structured I/O protocol: the model outputs JSON, the application executes, the result feeds back into the conversation",
    "Schema quality directly determines tool call reliability; invest in descriptions, examples, and constraints",
    "Parallel tool calls reduce latency for independent operations but require careful dependency analysis",
    "Security surface area includes prompt injection, argument injection, excessive permissions, and data exfiltration",
    "Orchestration patterns: routing (select tool), chaining (sequence tools), branching (conditional paths), and looping (retry/iterate)",
    "Multi-agent tool sharing requires a registry, access control, and namespacing to prevent conflicts",
    "Schema versioning prevents silent breakage: use semantic versioning, additive changes, and deprecation periods",
    "Always implement audit logging, rate limiting, and confirmation prompts for destructive tool operations",
  ],
  resources: [
    { label: "Anthropic Tool Use Documentation", kind: "docs", note: "Official guide covering tool definition, tool choice, parallel calls, and best practices for Claude" },
    { label: "OpenAI Function Calling Guide", kind: "docs", note: "Comparison reference for OpenAI's function calling API, useful for understanding cross-provider differences" },
    { label: "Model Context Protocol (MCP) Specification", kind: "docs", note: "Open standard for connecting LLMs to external tools and data sources via a unified protocol" },
    { label: "Building Effective Agents - Anthropic Cookbook", kind: "article", note: "Practical patterns for tool-calling agents including orchestration, error handling, and evaluation" },
    { label: "Gorilla: Large Language Model Connected with Massive APIs", kind: "paper", note: "Research on training LLMs for accurate API/tool invocation with reduced hallucination" },
  ],
  glossary: [
    { term: "Function Calling", definition: "An LLM capability where the model generates structured JSON arguments to invoke external functions, with execution handled by the application." },
    { term: "Tool Schema", definition: "A JSON Schema definition of a tool's name, description, and parameters that tells the model how to invoke it." },
    { term: "Parallel Tool Use", definition: "Invoking multiple independent tools simultaneously in a single model turn to reduce latency." },
    { term: "Prompt Injection", definition: "An attack where malicious instructions are embedded in input to manipulate the model's behavior, including tool calls." },
    { term: "Fallback Chain", definition: "A sequence of alternative tools tried in order when the primary tool fails." },
    { term: "JSON Schema", definition: "A vocabulary for annotating and validating JSON documents, used to define tool parameter types and constraints." },
    { term: "Structured Output", definition: "Model output constrained to a specific format (like JSON matching a schema) rather than free-form text." },
  ],
};
