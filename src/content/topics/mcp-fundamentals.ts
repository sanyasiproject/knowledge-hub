import type { TopicContent } from "../types";

export const mcpFundamentals: TopicContent = {
  quickSummary: [
    "The Model Context Protocol (MCP) is an open standard that defines how LLM applications (clients) connect to external data sources and tools (servers) through a unified interface, replacing fragmented custom integrations.",
    "MCP uses a client-server architecture: the host application (like Claude Desktop or an IDE) runs MCP clients that connect to MCP servers, each exposing tools, resources, and prompts.",
    "Transports define how clients and servers communicate: stdio (local processes via stdin/stdout) and SSE/Streamable HTTP (remote servers over HTTP) are the two primary options.",
    "The MCP lifecycle includes initialization (capability negotiation), operation (tool calls, resource reads), and shutdown, with both client and server declaring their supported features upfront.",
  ],
  detailed: [
    "## Why MCP?\n\nBefore MCP, every LLM application built custom integrations for each data source and tool. This created an N x M problem: N applications each implementing M integrations. MCP reduces this to N + M: applications implement the MCP client protocol once, and tool/data providers implement the server protocol once. Any MCP client can connect to any MCP server. This is analogous to how USB standardized peripheral connections or how LSP (Language Server Protocol) standardized IDE language support. MCP was created by Anthropic and is open-source, with growing adoption across the ecosystem.",
    "## Client-Server Architecture\n\nThe architecture has three layers: **Host** (the user-facing application like Claude Desktop, Cursor, or a custom agent), **Client** (an MCP client within the host that manages connections to servers), and **Server** (a process exposing tools, resources, and prompts via the MCP protocol). A single host can run multiple clients, each connected to a different server. For example, Claude Desktop might connect to a GitHub MCP server, a Slack MCP server, and a database MCP server simultaneously. Each server is isolated: it only exposes what it is designed to, and the client mediates access.",
    "## Transports\n\n**stdio transport**: The server runs as a local child process. Communication happens over stdin/stdout using JSON-RPC 2.0 messages. This is the simplest transport: no network setup, works offline, and is the default for local tools. **Streamable HTTP transport**: The server runs as a remote HTTP service. The client sends requests via HTTP POST and receives responses or streams via Server-Sent Events (SSE). This enables remote servers, shared infrastructure, and cloud-hosted integrations. The transport is pluggable: the protocol layer is transport-agnostic, so new transports can be added without changing the protocol.",
    "## Lifecycle and Capability Negotiation\n\nWhen a client connects to a server, they perform a handshake: the client sends an `initialize` request with its supported protocol version and capabilities. The server responds with its protocol version, capabilities (which features it supports: tools, resources, prompts, sampling), and server info. The client then sends `initialized` to confirm. During operation, the client can call tools, read resources, and use prompts. Either side can send notifications (one-way messages). The connection is stateful: the server can maintain state across calls within a session. Shutdown is initiated by closing the transport connection.",
    "## JSON-RPC 2.0\n\nMCP uses JSON-RPC 2.0 as its message format. There are three message types: **requests** (with an id, method, and optional params; expect a response), **responses** (matching a request id, with result or error), and **notifications** (like requests but without an id; no response expected). This is the same protocol used by LSP, making it familiar to developers who have worked with IDE tooling. Batching is not used; each message is a standalone JSON object, one per line in stdio or one per HTTP request/SSE event.",
  ],
  interviewQA: [
    {
      q: "What problem does MCP solve?",
      a: "MCP solves the N x M integration problem. Without MCP, every LLM application must build custom integrations for every tool and data source. With MCP, applications implement the client protocol once and tool providers implement the server protocol once. Any client can connect to any server. This is the same pattern as USB (standardized peripheral connections) or LSP (standardized IDE language support). It enables an ecosystem of interoperable tools and applications.",
    },
    {
      q: "What is the difference between stdio and HTTP transports?",
      a: "stdio transport runs the server as a local child process, communicating via stdin/stdout. It is simple, works offline, and requires no network setup, making it ideal for local tools. HTTP transport (Streamable HTTP) runs the server as a remote HTTP service, with requests via POST and responses/streams via SSE. It enables remote/cloud-hosted servers and shared infrastructure. The protocol layer is transport-agnostic, so both transports use the same JSON-RPC messages.",
    },
    {
      q: "How does capability negotiation work in MCP?",
      a: "During initialization, the client sends its supported protocol version and capabilities (what it can do: sampling, roots). The server responds with its version and capabilities (what it offers: tools, resources, prompts). Both sides then operate within the intersection of their capabilities. If the server offers tools but the client does not support tool calling, tools are not used. This handshake ensures compatibility and allows gradual feature adoption.",
    },
  ],
  mcqs: [
    {
      q: "What architectural pattern does MCP follow?",
      options: [
        "Peer-to-peer mesh",
        "Client-server with host, client, and server layers",
        "Publish-subscribe event bus",
        "Monolithic single-process design",
      ],
      answerIndex: 1,
      explanation:
        "MCP uses a three-layer client-server architecture: the host (user-facing app), clients (protocol handlers within the host), and servers (processes exposing tools/resources).",
    },
    {
      q: "What message format does MCP use?",
      options: [
        "Protocol Buffers",
        "GraphQL",
        "JSON-RPC 2.0",
        "REST with OpenAPI",
      ],
      answerIndex: 2,
      explanation:
        "MCP uses JSON-RPC 2.0 for all messages, supporting requests (with id, expect response), responses, and notifications (no id, no response expected).",
    },
    {
      q: "What is the primary advantage of the stdio transport?",
      options: [
        "Supports remote servers across the internet",
        "Enables multiple clients to share one server",
        "Simple, works offline, no network setup required",
        "Higher throughput than HTTP",
      ],
      answerIndex: 2,
      explanation:
        "stdio runs the server as a local child process using stdin/stdout. It requires no network configuration, works offline, and is the simplest transport to set up.",
    },
  ],
  flashcards: [
    { front: "What does MCP stand for?", back: "Model Context Protocol. An open standard for connecting LLM applications to external tools and data sources through a unified interface." },
    { front: "What is the N x M problem MCP solves?", back: "Without MCP, N applications each build M custom integrations. MCP reduces this to N + M: each side implements the protocol once." },
    { front: "What are MCP's two primary transports?", back: "stdio (local process via stdin/stdout) and Streamable HTTP (remote server via HTTP POST and Server-Sent Events)." },
    { front: "What are the three JSON-RPC 2.0 message types?", back: "Requests (have id, expect response), Responses (match request id), and Notifications (no id, no response expected)." },
    { front: "What happens during MCP initialization?", back: "Client sends its protocol version and capabilities. Server responds with its version and capabilities. Client sends 'initialized' to confirm. Both operate within agreed capabilities." },
    { front: "Who created MCP?", back: "Anthropic created MCP as an open-source standard. It has growing adoption across LLM applications and tool providers." },
    { front: "What is analogous to MCP in the IDE world?", back: "LSP (Language Server Protocol). Like MCP, LSP standardized the interface between IDEs and language support, solving the same N x M integration problem." },
  ],
  glossary: [
    { term: "MCP (Model Context Protocol)", definition: "An open standard protocol for connecting LLM applications to external tools and data sources through a unified client-server interface." },
    { term: "Host", definition: "The user-facing application (e.g., Claude Desktop, Cursor) that contains one or more MCP clients." },
    { term: "MCP Client", definition: "A protocol handler within the host that manages the connection to an MCP server." },
    { term: "MCP Server", definition: "A process that exposes tools, resources, and prompts to MCP clients via the MCP protocol." },
    { term: "stdio Transport", definition: "Communication via stdin/stdout with a local child process, using JSON-RPC 2.0 messages." },
    { term: "Streamable HTTP", definition: "Transport using HTTP POST for requests and Server-Sent Events for responses/streams, enabling remote MCP servers." },
    { term: "JSON-RPC 2.0", definition: "A lightweight remote procedure call protocol using JSON, with request/response/notification message types." },
  ],
  deepDive: [
    "## How MCP Bridges the Gap Between LLMs and the Real World\n\nLarge language models are powerful reasoners, but they are fundamentally stateless and isolated: they cannot read your files, query your databases, or call your APIs without explicit wiring. Before MCP, every application that wanted to give an LLM access to external context had to build bespoke integrations -- one for Slack, another for GitHub, another for Postgres, and so on. Each integration was a custom protocol with its own authentication, serialization, error handling, and lifecycle management. This duplication meant that tool authors had to support dozens of LLM platforms, and platform builders had to maintain dozens of connectors. MCP eliminates this by defining a single, open protocol that any host application can implement once (as a client) and any tool or data provider can implement once (as a server). The result is a composable ecosystem: a Postgres MCP server works with Claude Desktop, Cursor, a custom Python agent, or any future MCP-compatible host without modification.",
    "## The Protocol in Depth: Messages, Capabilities, and Stateful Sessions\n\nMCP is built on JSON-RPC 2.0, which provides a minimal but sufficient message format: requests carry an `id` and expect a response; notifications omit the `id` and are fire-and-forget. On top of this, MCP defines a structured lifecycle. The client opens a transport (stdio pipe or HTTP connection) and sends an `initialize` request containing its protocol version and a capabilities object listing what the client supports (e.g., `sampling`, `roots`). The server responds with its own protocol version and capabilities (e.g., `tools`, `resources`, `prompts`). This negotiation is critical: it means both sides agree on what is available before any work begins, and features can be added incrementally without breaking existing implementations. Once initialized, the session is stateful -- the server can maintain context across multiple tool calls within the same session, enabling multi-step workflows like database transactions or interactive debugging sessions.",
    "## Building and Deploying MCP Servers in Practice\n\nCreating an MCP server typically involves choosing an SDK (the official TypeScript SDK `@modelcontextprotocol/sdk` or the Python SDK `mcp`), defining tools (functions the LLM can call with structured inputs and outputs), resources (data the LLM can read, like files or database rows), and optionally prompts (reusable prompt templates). The server is then packaged as either a local CLI tool (for stdio transport) or a web service (for Streamable HTTP). For local servers, the host application spawns the server as a child process and communicates via stdin/stdout. For remote servers, the host sends HTTP POST requests and receives responses or streams via SSE. Authentication for remote servers is handled via OAuth 2.0 or API keys in HTTP headers. In production, servers should implement proper error handling (returning JSON-RPC error responses with meaningful codes), logging (via the MCP logging capability), and graceful shutdown (responding to transport close events).",
  ],
  code: [
    {
      language: "typescript",
      caption: "A minimal MCP server over stdio",
      source: `import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "orders", version: "1.0.0" });

// A TOOL is model-invoked: the model decides to call it.
server.tool(
  "get_order",
  "Fetch one order by its exact ID (format ORD-12345). " +
    "To search by customer email, use search_orders instead.",
  { order_id: z.string().regex(/^ORD-\\d+$/) },
  async ({ order_id }) => {
    const order = await db.orders.findById(order_id);
    return {
      content: [{ type: "text", text: JSON.stringify(order ?? { error: "not found" }) }],
    };
  }
);

// A RESOURCE is application-controlled: the host decides what to put in context.
server.resource(
  "order-schema",
  "schema://orders",
  async () => ({
    contents: [{ uri: "schema://orders", text: await fs.readFile("schema.sql", "utf8") }],
  })
);

// A PROMPT is user-selected: it appears as a command in the host's UI.
server.prompt(
  "investigate-order",
  { order_id: z.string() },
  ({ order_id }) => ({
    messages: [{
      role: "user",
      content: { type: "text", text: \`Investigate order \${order_id}: fetch it, check its payment and shipment status, and summarise anything unusual.\` },
    }],
  })
);

await server.connect(new StdioServerTransport());

// The point of the protocol is collapsing N×M into N+M: before MCP, every
// application that wanted a model to reach your issue tracker wrote its own
// integration. Write one server and any MCP-compatible host can use it.
//
// The three primitives differ by WHO initiates:
//   tool     -> the model
//   resource -> the host application
//   prompt   -> the user
//
// Security: the host mediates and should require consent before invoking a
// tool. Installing a third-party server is like installing a plugin — it sees
// whatever the host sends it, so provenance matters.`,
    },
    {
      language: "typescript",
      caption: "Creating a simple MCP server with the TypeScript SDK",
      source: `import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "weather-server",
  version: "1.0.0",
});

// Define a tool that the LLM can call
server.tool(
  "get_weather",
  "Get the current weather for a city",
  { city: z.string().describe("City name, e.g. 'San Francisco'") },
  async ({ city }) => {
    // In production, call a real weather API here
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            city,
            temperature: 72,
            conditions: "sunny",
          }),
        },
      ],
    };
  }
);

// Define a resource the LLM can read
server.resource("config", "config://app", async (uri) => ({
  contents: [
    {
      uri: uri.href,
      mimeType: "application/json",
      text: JSON.stringify({ version: "1.0", region: "us-west" }),
    },
  ],
}));

// Start the server with stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);`,
    },
    {
      language: "json",
      caption: "JSON-RPC 2.0 message examples used in MCP",
      source: `// 1. Client sends initialize request
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2025-03-26",
    "capabilities": { "sampling": {} },
    "clientInfo": { "name": "my-agent", "version": "1.0.0" }
  }
}

// 2. Server responds with its capabilities
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2025-03-26",
    "capabilities": {
      "tools": { "listChanged": true },
      "resources": { "subscribe": true }
    },
    "serverInfo": { "name": "weather-server", "version": "1.0.0" }
  }
}

// 3. Client confirms initialization
{
  "jsonrpc": "2.0",
  "method": "notifications/initialized"
}

// 4. Client calls a tool
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "get_weather",
    "arguments": { "city": "San Francisco" }
  }
}

// 5. Server returns tool result
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\\"city\\":\\"San Francisco\\",\\"temperature\\":72}"
      }
    ]
  }
}`,
    },
  ],
  diagrams: [
    {
      title: "MCP Host-Client-Server Architecture",
      kind: "architecture",
      caption: "A host application contains MCP clients, each connected to a separate MCP server via stdio or HTTP transport. Servers expose tools, resources, and prompts.",
      mermaid: `graph TD
    subgraph Host["Host Application - Claude Desktop or IDE"]
        LLM["LLM Engine"]
        C1["MCP Client 1"]
        C2["MCP Client 2"]
        C3["MCP Client 3"]
        LLM --> C1
        LLM --> C2
        LLM --> C3
    end
    subgraph S1["MCP Server - Filesystem"]
        T1["Tools - read_file, write_file"]
        R1["Resources - file URIs"]
    end
    subgraph S2["MCP Server - Database"]
        T2["Tools - query, insert"]
        R2["Resources - schema URIs"]
    end
    subgraph S3["MCP Server - Web Search"]
        T3["Tools - search, fetch"]
    end
    C1 -->|stdio transport| S1
    C2 -->|HTTP transport| S2
    C3 -->|stdio transport| S3`,
    },
    {
      title: "MCP Connection Initialisation Sequence",
      kind: "sequence",
      caption: "Messages exchanged during MCP session setup: initialize request, capabilities response, and initialized notification.",
      mermaid: `sequenceDiagram
    participant H as Host
    participant C as MCP Client
    participant S as MCP Server

    H->>S: Spawn process or open HTTP connection
    C->>S: initialize - protocolVersion, clientInfo, capabilities
    S-->>C: initialize response - protocolVersion, serverInfo, capabilities
    Note over C,S: Capabilities negotiated: tools, resources, prompts, sampling
    C->>S: notifications/initialized
    Note over C,S: Session active - client may now send requests
    C->>S: tools/list
    S-->>C: Array of tool definitions with inputSchema
    C->>S: resources/list
    S-->>C: Array of available resource URIs`,
    },
    {
      title: "MCP Tool Call Flow",
      kind: "flow",
      caption: "Flow from user prompt through LLM tool selection, client dispatch, server execution, and result incorporation.",
      mermaid: `flowchart TD
    A["User sends message to Host"] --> B["LLM receives message and tool definitions"]
    B --> C{"LLM decides to\ncall a tool?"}
    C -->|No| D["LLM responds directly to user"]
    C -->|Yes| E["LLM produces tool name and arguments"]
    E --> F["Host shows confirmation if configured"]
    F --> G["Client sends tools/call to MCP Server"]
    G --> H["Server validates input against JSON Schema"]
    H --> I{"Validation\npassed?"}
    I -->|No| J["Return error content with isError true"]
    I -->|Yes| K["Server executes tool logic"]
    K --> L["Return content array - text, image, or resource"]
    J --> M["LLM receives result and incorporates into response"]
    L --> M
    M --> N["LLM responds to user or calls another tool"]`,
    },
  ],
  animations: [
    {
      title: "MCP Connection Lifecycle",
      steps: [
        {
          label: "Transport Setup",
          detail:
            "The host spawns the MCP server process (stdio) or opens an HTTP connection (Streamable HTTP). The transport layer is now ready to carry JSON-RPC messages.",
        },
        {
          label: "Initialize Request",
          detail:
            "The client sends an 'initialize' request containing its protocol version, client info (name and version), and a capabilities object listing what features the client supports (e.g., sampling, roots).",
        },
        {
          label: "Initialize Response",
          detail:
            "The server responds with its own protocol version, server info, and capabilities object declaring what it offers: tools, resources, prompts, and optional features like logging or subscription support.",
        },
        {
          label: "Initialized Notification",
          detail:
            "The client sends an 'initialized' notification (no response expected) to confirm the handshake. Both sides now operate within the agreed capabilities. The session is active.",
        },
        {
          label: "Operation Phase",
          detail:
            "The client can now call tools (tools/call), list and read resources (resources/list, resources/read), use prompts (prompts/get), and receive notifications from the server. The session is stateful.",
        },
        {
          label: "Shutdown",
          detail:
            "Either side can close the connection. The client closes the transport (ends the process for stdio, closes the HTTP connection for Streamable HTTP). The server performs cleanup and exits gracefully.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Feature", "MCP", "REST API", "GraphQL", "LSP"],
    rows: [
      [
        "Primary purpose",
        "Connect LLMs to tools and data",
        "General-purpose web APIs",
        "Flexible data querying",
        "IDE language support",
      ],
      [
        "Message format",
        "JSON-RPC 2.0",
        "HTTP methods + JSON/XML",
        "JSON over HTTP POST",
        "JSON-RPC 2.0",
      ],
      [
        "Connection model",
        "Stateful session",
        "Stateless request/response",
        "Stateless (subscriptions optional)",
        "Stateful session",
      ],
      [
        "Discovery",
        "Capability negotiation at init",
        "OpenAPI / Swagger docs",
        "Schema introspection",
        "Capability negotiation at init",
      ],
      [
        "Transport",
        "stdio, Streamable HTTP",
        "HTTP/HTTPS",
        "HTTP/HTTPS, WebSocket",
        "stdio, pipe, socket",
      ],
      [
        "Streaming",
        "SSE for HTTP transport",
        "Not built-in (polling/webhooks)",
        "Subscriptions via WebSocket",
        "Notifications via JSON-RPC",
      ],
      [
        "Schema typing",
        "JSON Schema for tool inputs",
        "OpenAPI schemas",
        "Strong type system (SDL)",
        "JSON Schema in capabilities",
      ],
      [
        "Ecosystem focus",
        "LLM applications and agents",
        "Web and mobile apps",
        "Frontend-driven data fetching",
        "Code editors and IDEs",
      ],
    ],
  },
  exercises: [
    "Build a local MCP server (using the Python or TypeScript SDK) that exposes a 'search_notes' tool. The tool should accept a query string and return matching notes from a list of in-memory note objects. Test it by connecting to it from Claude Desktop via stdio transport.",
    "Write the raw JSON-RPC 2.0 messages (by hand, not using an SDK) for a complete MCP session: initialize, list tools, call a tool, and receive the result. Validate that your messages conform to the MCP specification.",
    "Create an MCP server that exposes a resource (e.g., a configuration file or a database table summary). Connect to it and verify that the client can list and read the resource. Experiment with what happens when the resource changes -- does the client see the update?",
    "Set up two MCP servers (e.g., a file-reader and a web-search server) and connect both to a single host application. Observe how the host manages multiple client connections and how the LLM decides which server's tools to use based on the user's query.",
    "Implement error handling in an MCP server: return proper JSON-RPC error responses for invalid tool arguments, missing resources, and internal failures. Test each error path and verify that the client receives meaningful error messages.",
  ],
  cheatSheet: [
    "MCP = Model Context Protocol. Open standard by Anthropic for connecting LLM apps to external tools and data via a unified client-server interface.",
    "Architecture layers: **Host** (user-facing app) > **Client** (protocol handler) > **Server** (exposes tools/resources/prompts). One host can have many clients.",
    "Transports: **stdio** (local process, stdin/stdout) for local tools; **Streamable HTTP** (POST + SSE) for remote servers. Protocol is transport-agnostic.",
    "Message format: JSON-RPC 2.0. Three types: **Request** (has id, expects response), **Response** (matches request id), **Notification** (no id, fire-and-forget).",
    "Lifecycle: `initialize` (capability negotiation) -> `initialized` (confirmation) -> operation (tool calls, resource reads) -> shutdown (close transport).",
    "Server capabilities: `tools` (functions LLM can call), `resources` (data LLM can read), `prompts` (reusable templates). Declared during init.",
    "Client capabilities: `sampling` (server can request LLM completions), `roots` (client exposes filesystem roots). Also declared during init.",
    "Tool definition: each tool has a name, description, and JSON Schema for its input parameters. Tools return content blocks (text, images, or embedded resources).",
  ],
  revisionNotes: [
    "MCP solves the N x M integration problem: N apps x M tools becomes N + M. Analogous to USB for peripherals or LSP for IDE language support.",
    "Three-layer architecture: Host contains Clients, each Client connects to one Server. Servers are isolated from each other.",
    "Two transports: stdio (local, simple, offline) and Streamable HTTP (remote, SSE streaming). Both carry the same JSON-RPC 2.0 messages.",
    "Initialization handshake: client sends `initialize` with version + capabilities, server responds with its version + capabilities, client sends `initialized` notification.",
    "Sessions are stateful: servers can maintain context across multiple calls. This enables multi-step workflows within a single session.",
    "JSON-RPC 2.0 message types: Request (id + method + params), Response (id + result/error), Notification (method + params, no id).",
    "Servers expose three primitives: **Tools** (callable functions), **Resources** (readable data), **Prompts** (reusable templates). Each is optional.",
    "Error handling uses JSON-RPC error codes. Standard codes: -32700 (parse error), -32600 (invalid request), -32601 (method not found), -32602 (invalid params), -32603 (internal error).",
  ],
  resources: [
    {
      label: "MCP Specification (Official)",
      kind: "docs",
      note: "The authoritative specification for the Model Context Protocol, including message formats, lifecycle, and transport details.",
    },
    {
      label: "Model Context Protocol Documentation",
      kind: "docs",
      note: "Official MCP documentation site with guides, tutorials, and SDK references for TypeScript and Python.",
    },
    {
      label: "MCP TypeScript SDK (@modelcontextprotocol/sdk)",
      kind: "repo",
      note: "Official TypeScript SDK for building MCP servers and clients. Includes examples and transport implementations.",
    },
    {
      label: "MCP Python SDK (mcp)",
      kind: "repo",
      note: "Official Python SDK with the FastMCP high-level API for quickly building MCP servers.",
    },
    {
      label: "Anthropic Blog: Introducing the Model Context Protocol",
      kind: "article",
      note: "Launch announcement explaining the motivation, design, and ecosystem vision behind MCP.",
    },
    {
      label: "JSON-RPC 2.0 Specification",
      kind: "docs",
      note: "The underlying message protocol used by MCP. Understanding JSON-RPC is essential for debugging MCP communication.",
    },
  ],
  followUps: [
    "How do you implement authentication and authorization for remote MCP servers?",
    "What are MCP sampling and roots capabilities, and when would a server use them?",
    "How does MCP compare to function calling / tool use built into LLM APIs?",
    "What strategies exist for testing and debugging MCP servers during development?",
    "How can you build a multi-agent system where agents communicate via MCP?",
  ],
};
