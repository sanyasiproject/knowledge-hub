import type { TopicContent } from "../types";

export const mcpServersTools: TopicContent = {
  quickSummary: [
    "MCP servers expose three primary primitives: tools (executable functions the LLM can call), resources (data the client can read), and prompts (reusable prompt templates).",
    "Tools are the most common primitive: they have a name, description, and JSON Schema for input parameters. The LLM decides when to call them based on the description.",
    "Resources provide read access to data (files, database records, API responses) identified by URIs, separate from tool invocation.",
    "Sampling allows servers to request LLM completions from the client, enabling server-side AI workflows without the server needing its own model access.",
  ],
  detailed: [
    "## Tools\n\nTools are executable functions exposed by the server. Each tool has a `name`, `description`, and `inputSchema` (JSON Schema defining parameters). When the LLM decides to call a tool, the client sends a `tools/call` request with the tool name and arguments. The server executes the function and returns a result containing text, images, or embedded resources. Tool descriptions are critical: the LLM uses them to decide when and how to invoke the tool. Tools can be listed via `tools/list`, and servers can notify clients when the tool list changes. Tools are model-controlled: the LLM decides when to call them.",
    "## Resources\n\nResources represent data the server makes available for reading. Each resource has a URI (like `file:///path/to/doc.md` or `db://users/123`), a name, optional description, and MIME type. Clients can read resources via `resources/read` or subscribe to changes via `resources/subscribe`. Resources can be static (listed upfront via `resources/list`) or dynamic (resolved via URI templates like `db://users/{id}`). Unlike tools, resources are application-controlled: the host application decides when to read them, not the LLM. Resources are useful for providing context without tool invocation overhead.",
    "## Prompts\n\nPrompts are reusable prompt templates exposed by the server. Each prompt has a name, description, and optional arguments. When requested via `prompts/get`, the server returns a structured prompt with role-tagged messages (user/assistant). This allows servers to package domain-specific prompt engineering: a code review server might expose a `review-pull-request` prompt that structures the review workflow. Prompts are user-controlled: the user or host application selects them explicitly, rather than the LLM choosing them autonomously.",
    "## Sampling\n\nSampling is a unique MCP capability that inverts the typical flow: instead of the client sending data to the server, the server requests an LLM completion from the client. This enables servers to build AI-powered workflows (summarization, classification, extraction) without needing their own model access. The server sends a `sampling/createMessage` request with messages and model preferences. The client (which has model access) fulfills the request and returns the completion. The host application mediates this to prevent abuse: it can show the user what the server is requesting and get approval.",
    "## Capability Declaration\n\nServers declare which primitives they support during initialization. A server might support tools but not resources, or resources but not prompts. The capability declaration includes: `tools` (tool listing and calling), `resources` (resource reading and subscribing), `prompts` (prompt listing and getting), and `sampling` (requesting LLM completions). Clients also declare their capabilities: not all clients support all features. The intersection of client and server capabilities determines what is available in a given session. This makes MCP flexible: simple servers can implement just tools, while rich servers can offer the full primitive set.",
  ],
  interviewQA: [
    {
      q: "What is the difference between tools and resources in MCP?",
      a: "Tools are executable functions that the LLM decides when to invoke (model-controlled). They perform actions and return results. Resources are data endpoints identified by URIs that the host application reads (application-controlled). Resources provide context without the overhead of tool invocation. Think of tools as 'do something' and resources as 'read something'. Tools have side effects; resources are typically read-only.",
    },
    {
      q: "How does sampling work in MCP and why is it useful?",
      a: "Sampling lets the server request an LLM completion from the client. The server sends a createMessage request with messages and preferences, and the client (which has model access) fulfills it. This enables server-side AI workflows (summarization, classification) without the server needing its own API key or model. The host mediates to prevent abuse. It is useful for servers that want to add intelligence to their processing without managing LLM infrastructure.",
    },
    {
      q: "What are MCP prompts and how do they differ from tools?",
      a: "Prompts are reusable prompt templates that the server packages for specific workflows. Unlike tools (which the LLM invokes autonomously), prompts are user-controlled: the user or host explicitly selects them. A prompt returns structured messages with role tags. They encode domain-specific prompt engineering: for example, a 'summarize-document' prompt that structures the summarization request optimally. Prompts are about providing the right instructions; tools are about executing actions.",
    },
  ],
  mcqs: [
    {
      q: "Who controls when MCP tools are invoked?",
      options: [
        "The server decides when to run tools",
        "The user must explicitly request each tool call",
        "The LLM decides based on tool descriptions (model-controlled)",
        "Tools run automatically on a schedule",
      ],
      answerIndex: 2,
      explanation:
        "Tools are model-controlled: the LLM reads tool descriptions and decides when to invoke them based on the user's request and conversation context.",
    },
    {
      q: "What identifies a resource in MCP?",
      options: [
        "A numeric ID assigned by the server",
        "A URI (e.g., file:///path or db://table/id)",
        "The tool name that created it",
        "A hash of its content",
      ],
      answerIndex: 1,
      explanation:
        "Resources are identified by URIs, which can follow any scheme (file://, db://, custom://). URI templates enable dynamic resource resolution.",
    },
    {
      q: "What does sampling allow in MCP?",
      options: [
        "The client to sample random data from the server",
        "The server to request LLM completions from the client",
        "Statistical sampling of tool call results",
        "A/B testing of different server implementations",
      ],
      answerIndex: 1,
      explanation:
        "Sampling inverts the typical flow: the server asks the client for an LLM completion, enabling server-side AI workflows without the server needing its own model access.",
    },
  ],
  flashcards: [
    { front: "What are MCP's three primary primitives?", back: "Tools (executable functions, model-controlled), Resources (readable data via URIs, application-controlled), and Prompts (reusable prompt templates, user-controlled)." },
    { front: "What is the control model for each MCP primitive?", back: "Tools: model-controlled (LLM decides). Resources: application-controlled (host decides). Prompts: user-controlled (user selects)." },
    { front: "What is MCP sampling?", back: "A capability where the server requests LLM completions from the client, enabling server-side AI workflows without the server needing model access." },
    { front: "How are dynamic resources resolved?", back: "Via URI templates (e.g., db://users/{id}). The client provides the template parameters, and the server resolves the actual resource." },
    { front: "What does a tool definition include?", back: "Name, description (critical for LLM tool selection), and inputSchema (JSON Schema defining parameters with types and constraints)." },
    { front: "How do prompts differ from system prompts?", back: "MCP prompts are reusable templates exposed by servers for specific workflows. They return structured role-tagged messages. System prompts are fixed instructions set by the host." },
    { front: "What is tools/list used for?", back: "A client request to enumerate all tools available on the server. Servers can notify clients when the list changes via notifications." },
  ],
  glossary: [
    { term: "Tool (MCP)", definition: "An executable function exposed by a server with a name, description, and JSON Schema input, invoked by the LLM via tools/call." },
    { term: "Resource (MCP)", definition: "A data endpoint identified by a URI that clients can read, providing context without tool invocation." },
    { term: "Prompt (MCP)", definition: "A reusable prompt template exposed by a server, returning structured role-tagged messages for specific workflows." },
    { term: "Sampling", definition: "An MCP capability allowing servers to request LLM completions from the client without needing their own model access." },
    { term: "URI Template", definition: "A parameterized URI pattern (e.g., db://users/{id}) used for dynamic resource resolution." },
    { term: "inputSchema", definition: "A JSON Schema object defining a tool's parameter types, constraints, and required fields." },
    { term: "Capability", definition: "A feature (tools, resources, prompts, sampling) that a server or client declares support for during initialization." },
  ],
  deepDive: [
    "## How MCP Primitives Compose Into Real Server Architectures\n\nThe three primitives -- tools, resources, and prompts -- are not isolated features; they compose into cohesive server architectures that serve different layers of an AI application. A database MCP server, for instance, might expose resources for reading table schemas (`db://schemas/users`), tools for executing parameterized queries (`run_query`), and prompts for common analytical workflows (`analyze-table`). The resource gives the LLM context about what data is available, the tool lets it act on that data, and the prompt packages expert SQL knowledge. This layering means the LLM can discover what exists (resources), understand how to interact (prompts), and execute actions (tools) -- all through a single server connection. The capability declaration at initialization ensures clients only see what the server actually supports, preventing runtime errors from calling unsupported primitives.",
    "## The Control Model Spectrum and Its Security Implications\n\nMCP's control model -- model-controlled tools, application-controlled resources, user-controlled prompts -- is a deliberate security architecture, not just an API design choice. Tools are the most powerful and most dangerous primitive: they let the LLM execute arbitrary server-side functions. This is why tool descriptions must be carefully crafted and why hosts typically implement confirmation dialogs before tool execution. Resources are safer because the host application decides when to read them; the LLM can suggest reading a resource, but the application mediates. Prompts are safest because the user explicitly selects them. Sampling adds a fourth dimension: the server requests LLM completions, but the client mediates every request through the host application. This human-in-the-loop design for sampling prevents a malicious server from using the client's model access for unauthorized purposes. Understanding this control spectrum is essential for building secure MCP integrations.",
    "## Pagination, Change Notifications, and Dynamic Discovery\n\nProduction MCP servers often manage hundreds of tools and resources. MCP addresses this with pagination (`cursor`-based) on list operations (`tools/list`, `resources/list`, `prompts/list`) so clients can incrementally discover available primitives without overwhelming memory. Beyond static listing, servers can send change notifications (`notifications/tools/list_changed`, `notifications/resources/list_changed`) to inform clients that the available set has changed -- for example, when a new database table is created or a plugin is installed. Resources also support subscriptions (`resources/subscribe`) for content-level change tracking: a client can subscribe to `file:///config.yaml` and receive `notifications/resources/updated` whenever the file changes. This dynamic discovery model means MCP servers can adapt to their environment in real time rather than requiring restarts when the underlying system changes."
  ],
  code: [
    {
      language: "typescript",
      caption: "Tool design — descriptions and schemas are what drive selection accuracy",
      source: `import { z } from "zod";

// Constrain the arguments so a wrong call is impossible rather than merely
// discouraged. An enum beats "a string describing the status" every time.
const SearchInput = {
  email: z.string().email().describe("Customer email, exact match"),
  status: z.enum(["pending", "shipped", "delivered", "cancelled"]).optional(),
  since: z.string().datetime().optional().describe("ISO 8601; defaults to 90 days ago"),
  limit: z.number().int().min(1).max(50).default(20),
};

server.tool(
  "search_orders",
  // The description is read as an instruction. Say when to use it, when NOT to,
  // and name the alternative — overlapping descriptions are the usual cause of
  // the model picking the wrong tool.
  "Search orders by customer email, optionally filtered by status and date. " +
    "Returns at most 50, newest first. " +
    "If you already have an exact order ID, use get_order instead — it is cheaper and exact.",
  SearchInput,
  async ({ email, status, since, limit }) => {
    const rows = await db.orders.search({ email, status, since, limit });

    // Return CONCISE, structured results. Dumping full records burns context
    // budget and buries the signal the model needs.
    const summary = rows.map((r) => ({
      id: r.id,
      status: r.status,
      total: r.totalPence,
      placedAt: r.createdAt,
    }));

    return {
      content: [{
        type: "text",
        text: JSON.stringify({ count: rows.length, orders: summary }),
      }],
    };
  }
);

// Errors should be actionable text the model can respond to, not a stack trace:
//   bad:  "PG::UndefinedColumn: column orders.stat does not exist"
//   good: "No such status. Valid values: pending, shipped, delivered, cancelled."
//
// And test selection as a classification problem: given a query, was the right
// tool chosen with the right arguments? That is measurable, and it is where
// almost all "the agent is unreliable" complaints actually resolve.`,
    },
    {
      language: "typescript",
      caption: "Defining an MCP tool with inputSchema in the MCP SDK",
      source: `import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const server = new McpServer({
  name: "weather-server",
  version: "1.0.0",
});

// Define a tool with typed parameters using Zod schemas
server.tool(
  "get_weather",
  "Get the current weather for a given city. Returns temperature, conditions, and humidity.",
  {
    city: z.string().describe("City name, e.g. 'San Francisco'"),
    units: z.enum(["celsius", "fahrenheit"]).default("celsius")
      .describe("Temperature unit preference"),
  },
  async ({ city, units }) => {
    // In production, call a real weather API here
    const temp = units === "celsius" ? 22 : 72;
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            city,
            temperature: temp,
            units,
            conditions: "partly cloudy",
            humidity: 65,
          }, null, 2),
        },
      ],
    };
  }
);`,
    },
    {
      language: "typescript",
      caption: "Defining a resource and resource template for data access",
      source: `import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";

const server = new McpServer({
  name: "docs-server",
  version: "1.0.0",
});

// Static resource: listed upfront via resources/list
server.resource(
  "project-readme",
  "file:///project/README.md",
  { mimeType: "text/markdown" },
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "text/markdown",
        text: "# My Project\\nThis is the project readme content...",
      },
    ],
  })
);

// Dynamic resource template: resolved on demand via URI pattern
server.resource(
  "user-profile",
  new ResourceTemplate("db://users/{userId}", { list: undefined }),
  { mimeType: "application/json" },
  async (uri, { userId }) => {
    // Look up user from database
    const user = { id: userId, name: "Alice", role: "admin" };
    return {
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(user, null, 2),
        },
      ],
    };
  }
);`,
    },
    {
      language: "typescript",
      caption: "Server-side sampling: requesting an LLM completion from the client",
      source: `import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const server = new McpServer({
  name: "summarizer-server",
  version: "1.0.0",
});

// A tool that uses sampling to get an LLM completion
server.tool(
  "summarize_document",
  "Summarize a document using the client's LLM via sampling",
  { documentUri: z.string().describe("URI of the document to summarize") },
  async ({ documentUri }, { sendRequest }) => {
    // Read the document content (from a resource or filesystem)
    const docContent = await fetchDocument(documentUri);

    // Request an LLM completion from the client via sampling
    const result = await sendRequest({
      method: "sampling/createMessage",
      params: {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: \`Summarize the following document in 3 bullet points:\\n\\n\${docContent}\`,
            },
          },
        ],
        maxTokens: 500,
        modelPreferences: {
          hints: [{ name: "claude-sonnet-4-20250514" }],
          intelligencePriority: 0.7,
          speedPriority: 0.3,
        },
      },
    });

    return {
      content: [{ type: "text", text: result.content.text }],
    };
  }
);

async function fetchDocument(uri: string): Promise<string> {
  // Implementation: read from filesystem, database, or API
  return "Document content here...";
}`,
    },
  ],
  diagrams: [
    {
      title: "MCP Primitives Architecture",
      kind: "architecture",
      caption: "How tools, resources, prompts, and sampling relate within the MCP server-client architecture and their control models.",
      mermaid: `graph TD
    subgraph Server["MCP Server"]
        T["Tools - model-controlled\nexecute actions and computations"]
        R["Resources - application-controlled\nread-only data access via URI"]
        P["Prompts - user-controlled\nreusable message templates"]
        SA["Sampling - server-initiated\nLLM completion requests"]
    end
    subgraph Client["MCP Client inside Host"]
        LLM["LLM - selects tools"]
        APP["Application - reads resources"]
        USR["User - picks prompts"]
        MED["Host mediates sampling"]
    end
    T -->|tools/call result| LLM
    LLM -->|tools/call request| T
    APP -->|resources/read| R
    USR -->|prompts/get| P
    SA -->|sampling/createMessage| MED
    MED -->|LLM completion| SA`,
    },
    {
      title: "Tool Call Lifecycle Sequence",
      kind: "sequence",
      caption: "Complete sequence from tool discovery through execution and result incorporation into the LLM context.",
      mermaid: `sequenceDiagram
    participant U as User
    participant H as Host LLM
    participant C as MCP Client
    participant S as MCP Server

    C->>S: tools/list
    S-->>C: Tool definitions with inputSchema
    U->>H: Send message
    H->>H: Select tool and generate arguments
    H->>C: Request tool execution
    C->>S: tools/call with name and arguments
    S->>S: Validate input against JSON Schema
    S->>S: Execute tool logic
    S-->>C: Result content array and optional isError
    C-->>H: Tool result in context
    H-->>U: Final response incorporating result`,
    },
    {
      title: "Server-Initiated Sampling Flow",
      kind: "flow",
      caption: "Flow of a server-initiated sampling request, showing host mediation and the security boundary between server and LLM.",
      mermaid: `flowchart TD
    A["Server needs LLM completion during tool execution"] --> B["Server sends sampling/createMessage to Client"]
    B --> C["Host intercepts sampling request"]
    C --> D{"Host policy\nallows request?"}
    D -->|No| E["Host rejects - returns error to server"]
    D -->|Yes| F["Host may modify or augment messages"]
    F --> G["Client sends messages to LLM"]
    G --> H["LLM produces completion"]
    H --> I["Client returns result to Server\nwith model name and stop reason"]
    I --> J["Server uses completion in tool result or workflow"]
    E --> K["Server handles rejection gracefully"]`,
    },
    {
      title: "Resource Discovery and Subscription",
      kind: "sequence",
      caption: "How a client discovers static resources, resolves URI templates, and subscribes to change notifications.",
      mermaid: `sequenceDiagram
    participant C as MCP Client
    participant S as MCP Server

    C->>S: resources/list
    S-->>C: Static resource URIs and URI templates
    C->>S: resources/read with static URI
    S-->>C: Resource content with MIME type
    C->>S: resources/read with template URI resolved
    S-->>C: Dynamic resource content
    C->>S: resources/subscribe with URI
    S-->>C: Subscription confirmed
    Note over S: Resource changes
    S->>C: notifications/resources/updated with URI
    C->>S: resources/read to fetch updated content
    S-->>C: Fresh resource content`,
    },
  ],
  animations: [
    {
      title: "Tool Invocation Lifecycle",
      steps: [
        { label: "Client connects", detail: "The MCP client establishes a connection to the server via stdio or SSE transport and performs the initialize handshake, exchanging capability declarations." },
        { label: "Tool discovery", detail: "The client sends tools/list to enumerate available tools. The server responds with an array of tool definitions, each containing name, description, and inputSchema (JSON Schema)." },
        { label: "LLM selects tool", detail: "The user sends a message. The LLM reads the tool descriptions and decides which tool to call and what arguments to pass, based on the conversation context and the tool's description." },
        { label: "Client sends tools/call", detail: "The client sends a tools/call JSON-RPC request to the server with the tool name and validated arguments. The client may show a confirmation dialog to the user before sending." },
        { label: "Server executes", detail: "The server receives the request, validates the input against the schema, executes the tool logic (API call, database query, file operation, etc.), and constructs the result." },
        { label: "Result returned", detail: "The server returns a result object containing content items (text, images, or embedded resources) and an optional isError flag. The client feeds this back into the LLM context." },
        { label: "LLM incorporates result", detail: "The LLM receives the tool result, interprets it, and either responds to the user with a synthesized answer or decides to call another tool for further information." }
      ]
    },
    {
      title: "Sampling Request Flow",
      steps: [
        { label: "Server needs LLM", detail: "During tool execution or background processing, the server determines it needs an LLM completion -- for example, to summarize fetched data or classify an input." },
        { label: "Server sends sampling/createMessage", detail: "The server sends a sampling/createMessage request to the client, including the messages array, maxTokens, and optional modelPreferences with hints and priority weights." },
        { label: "Host mediates", detail: "The host application intercepts the sampling request. It may display the request to the user for approval, modify the messages, or reject the request entirely for security reasons." },
        { label: "Client fulfills completion", detail: "After approval, the client sends the messages to its LLM (e.g., Claude) and receives the completion. The client returns the result to the server with the model name and stop reason." },
        { label: "Server uses result", detail: "The server receives the LLM completion and incorporates it into its processing -- perhaps returning it as part of a tool result or using it to make a decision in a workflow." }
      ]
    }
  ],
  comparison: {
    columns: ["Aspect", "Tools", "Resources", "Prompts"],
    rows: [
      ["Control model", "Model-controlled (LLM decides)", "Application-controlled (host decides)", "User-controlled (user selects)"],
      ["Primary purpose", "Execute actions and computations", "Provide read access to data", "Package reusable prompt templates"],
      ["Invocation method", "tools/call with name + arguments", "resources/read with URI", "prompts/get with name + arguments"],
      ["Discovery method", "tools/list (paginated)", "resources/list + URI templates", "prompts/list (paginated)"],
      ["Input definition", "inputSchema (JSON Schema)", "URI or URI template parameters", "arguments array with name and description"],
      ["Return type", "Content array (text, image, resource)", "Content array with URI and MIME type", "Structured messages with roles"],
      ["Side effects", "Yes -- can modify state", "No -- read-only by convention", "No -- returns template only"],
      ["Change notification", "notifications/tools/list_changed", "notifications/resources/list_changed + subscribe", "notifications/prompts/list_changed"],
      ["Typical use case", "API calls, DB queries, file writes", "Config files, schemas, documents", "Code review workflows, analysis templates"],
      ["Security concern", "Highest -- executes arbitrary logic", "Low -- read-only data access", "Low -- user explicitly selects"]
    ]
  },
  exercises: [
    "Build an MCP server that exposes a `search_files` tool accepting a query string and directory path, and returns matching filenames with line numbers. Include proper inputSchema with required/optional fields and descriptions.",
    "Create a resource provider that serves database table schemas via URIs like `db://schemas/{tableName}`. Implement both `resources/list` to enumerate available tables and the URI template handler for dynamic resolution.",
    "Implement a prompt template called `code-review` that takes a `language` argument and a `diff` argument, and returns structured messages guiding the LLM through a systematic code review with specific checkpoints.",
    "Design an MCP server that combines all three primitives: resources for reading log files, tools for searching and filtering logs, and a prompt template for incident investigation workflows. Consider how the primitives reference each other.",
    "Extend an existing tool definition to use sampling: build a `classify_ticket` tool that reads a support ticket (via resource), then uses sampling to ask the client's LLM to classify its priority and category before returning the result."
  ],
  cheatSheet: [
    "**Tool definition**: `server.tool(name, description, zodSchema, handler)` -- description drives LLM selection, keep it specific and action-oriented",
    "**Resource definition**: `server.resource(name, uri | ResourceTemplate, options, handler)` -- use static URIs for fixed data, URI templates for parameterized access",
    "**Prompt definition**: `server.prompt(name, description, argsSchema, handler)` -- return `{ messages: [{ role, content }] }` with role-tagged structured messages",
    "**Sampling request**: `sendRequest({ method: 'sampling/createMessage', params: { messages, maxTokens, modelPreferences } })` -- always set maxTokens to prevent runaway completions",
    "**Control spectrum**: Tools = model-controlled, Resources = application-controlled, Prompts = user-controlled -- this determines who initiates the action",
    "**List operations** support cursor-based pagination: pass `cursor` from previous response to get the next page of results",
    "**Change notifications**: servers emit `notifications/tools/list_changed`, `notifications/resources/list_changed`, `notifications/prompts/list_changed` when primitives are added or removed",
    "**Tool results** can contain mixed content types: `{ type: 'text', text }`, `{ type: 'image', data, mimeType }`, or `{ type: 'resource', resource: { uri, text } }`"
  ],
  revisionNotes: [
    "MCP servers expose three core primitives: **tools** (executable functions), **resources** (readable data), and **prompts** (reusable templates), plus **sampling** (server-requested LLM completions).",
    "Each primitive has a distinct control model: tools are model-controlled (LLM decides), resources are application-controlled (host decides), prompts are user-controlled (user selects).",
    "Tools require a `name`, `description`, and `inputSchema` (JSON Schema). The description is critical because the LLM uses it to decide when and how to call the tool.",
    "Resources are identified by URIs and can be static (listed via `resources/list`) or dynamic (resolved via URI templates like `db://users/{id}`).",
    "Sampling inverts the flow: the server requests an LLM completion from the client via `sampling/createMessage`. The host application mediates every request for security.",
    "All list operations (`tools/list`, `resources/list`, `prompts/list`) support cursor-based pagination for servers with many primitives.",
    "Servers declare supported capabilities during initialization; clients also declare theirs. The intersection determines what is available in the session.",
    "Change notifications (`notifications/tools/list_changed`, etc.) allow servers to dynamically add or remove primitives without requiring reconnection."
  ],
  resources: [
    { label: "MCP Specification", url: "https://modelcontextprotocol.io/", kind: "docs", note: "The official Model Context Protocol specification covering all primitives, transport, and lifecycle" },
    { label: "MCP TypeScript SDK", kind: "repo", note: "Official TypeScript SDK with McpServer class, Zod schema integration, and transport implementations" },
    { label: "MCP Python SDK", kind: "repo", note: "Official Python SDK with decorator-based tool/resource/prompt registration" },
    { label: "Building MCP Servers (Anthropic Docs)", url: "https://docs.anthropic.com/", kind: "docs", note: "Step-by-step guide to building MCP servers with tool, resource, and prompt examples" },
    { label: "MCP Tools Documentation", kind: "docs", note: "Detailed reference for tool definitions, inputSchema, and tool call lifecycle" },
    { label: "MCP Resources Documentation", kind: "docs", note: "Reference for resource URIs, templates, subscriptions, and change notifications" },
    { label: "Model Context Protocol GitHub", url: "https://modelcontextprotocol.io/", kind: "repo", note: "Main MCP organization with specification, SDKs, and reference server implementations" },
    { label: "Introduction to MCP (Anthropic Blog)", url: "https://docs.anthropic.com/", kind: "article", note: "High-level overview of MCP architecture, primitives, and the problems it solves" }
  ],
  followUps: [
    "How does MCP transport (stdio vs SSE vs Streamable HTTP) affect which primitives are available?",
    "What are best practices for writing tool descriptions that help the LLM make accurate invocation decisions?",
    "How do you implement authorization and access control for sensitive MCP tools?",
    "What is the relationship between MCP sampling and prompt injection risks?",
    "How do you test MCP servers -- unit testing tools, integration testing with a client, and end-to-end testing?",
    "How do resource subscriptions work under the hood, and when should you use them versus polling?",
    "What patterns exist for composing multiple MCP servers in a single client session?"
  ],
};
