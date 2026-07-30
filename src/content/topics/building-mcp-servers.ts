import type { TopicContent } from "../types";

export const buildingMcpServers: TopicContent = {
  quickSummary: [
    "Building an MCP server involves choosing an SDK (TypeScript or Python are most common), defining tool handlers and resource providers, and exposing them via a transport (stdio or HTTP).",
    "The TypeScript SDK (`@modelcontextprotocol/sdk`) provides a `Server` class with methods to register tool handlers, resource providers, and prompt templates using decorators or explicit registration.",
    "Tool handlers receive validated arguments and return structured results. They should handle errors gracefully, validate inputs, and return informative error messages the LLM can act on.",
    "Resource providers expose data via URI patterns, supporting both static listings and dynamic URI template resolution for parameterized data access.",
  ],
  detailed: [
    "## SDK Setup\n\nThe fastest way to build an MCP server is with the official SDKs. For TypeScript: `npm install @modelcontextprotocol/sdk`. For Python: `pip install mcp`. The SDK handles protocol negotiation, message serialization, transport management, and capability declaration. You create a `Server` instance, register handlers for tools/resources/prompts, and connect it to a transport. The SDK validates incoming arguments against your JSON Schemas and routes requests to the correct handler. For TypeScript, the `McpServer` high-level class provides a simpler API, while the `Server` low-level class offers more control.",
    "## Tool Handlers\n\nA tool handler is a function that receives the tool name and arguments, executes logic, and returns a result. The result is an object with a `content` array containing text, image, or resource items. Best practices: validate inputs beyond what JSON Schema catches (e.g., business rules), handle errors by returning informative error content rather than throwing, use `isError: true` flag for error results so the LLM knows the call failed, and keep handlers focused on a single responsibility. Tool definitions should include detailed descriptions with usage examples and parameter constraints to guide LLM tool selection.",
    "## Resource Providers\n\nResource providers implement `resources/list` (enumerate available resources) and `resources/read` (return content for a URI). For dynamic resources, implement `resources/templates/list` to expose URI templates (e.g., `users/{userId}/profile`). Resource content is returned as text or binary (base64-encoded) with a MIME type. Resources can support subscriptions: the server notifies the client when resource content changes via `notifications/resources/updated`. This enables live data feeds like log streams or database change notifications.",
    "## Error Handling and Validation\n\nRobust error handling is critical for good LLM interaction. Use JSON Schema validation for parameter types and constraints (the SDK does this automatically). Add business logic validation in handlers (e.g., date ranges, permission checks). Return structured error messages that tell the LLM what went wrong and how to fix it. Use MCP error codes for protocol-level errors (InvalidRequest, MethodNotFound, InternalError). Never expose internal stack traces or sensitive information in error responses. Log errors server-side for debugging while returning user-friendly messages.",
    "## Testing and Debugging\n\nTest MCP servers using the MCP Inspector (`npx @modelcontextprotocol/inspector`), which provides a web UI to connect to your server, list tools/resources, and execute calls interactively. For automated testing, use the SDK's in-memory transport to connect a test client directly to your server without stdio or HTTP. Write unit tests for individual tool handlers and integration tests for the full server lifecycle (init, tool calls, shutdown). Debug protocol issues by enabling verbose logging of JSON-RPC messages. The Inspector is the single most useful debugging tool during development.",
  ],
  interviewQA: [
    {
      q: "How would you structure an MCP server for a database?",
      a: "I would expose tools for write operations (insert, update, delete) and resources for read operations (query results by URI). Tool handlers would validate SQL parameters, use parameterized queries to prevent injection, and return row counts or inserted IDs. Resources would use URI templates like `db://tables/{table}/rows?limit={limit}` for flexible querying. I would declare both tools and resources capabilities, implement connection pooling, and handle database errors with informative messages the LLM can understand.",
    },
    {
      q: "What is the difference between McpServer and Server in the TypeScript SDK?",
      a: "McpServer is the high-level API: it provides convenient methods like `server.tool()` and `server.resource()` for registering handlers with minimal boilerplate. Server is the low-level API: it gives direct access to request/notification handlers and protocol internals. Use McpServer for most servers. Use Server when you need custom protocol handling, middleware, or non-standard message processing.",
    },
    {
      q: "How do you test an MCP server?",
      a: "Three levels: (1) Use the MCP Inspector for interactive testing during development: it connects to your server and lets you call tools, read resources, and see responses. (2) Use the SDK's in-memory transport for unit/integration tests: create a test client connected directly to your server without network. (3) Write unit tests for individual tool handler functions with mocked dependencies. Always test error paths: invalid arguments, missing resources, and handler exceptions.",
    },
  ],
  mcqs: [
    {
      q: "What does the MCP Inspector do?",
      options: [
        "Generates MCP server code from a specification",
        "Provides a web UI to connect to, test, and debug MCP servers interactively",
        "Monitors MCP servers in production",
        "Validates JSON Schema definitions",
      ],
      answerIndex: 1,
      explanation:
        "The MCP Inspector (`npx @modelcontextprotocol/inspector`) is a development tool that provides a web interface to connect to your server, list its tools/resources, and execute calls interactively for testing and debugging.",
    },
    {
      q: "How should tool handlers report errors to the LLM?",
      options: [
        "Throw uncaught exceptions",
        "Return empty results silently",
        "Return content with isError: true and an informative error message",
        "Log errors to a file and return success",
      ],
      answerIndex: 2,
      explanation:
        "Tool handlers should return structured error content with isError: true and a descriptive message that tells the LLM what went wrong and how to correct the call.",
    },
    {
      q: "What transport is best for a cloud-hosted MCP server?",
      options: [
        "stdio (stdin/stdout)",
        "Streamable HTTP with SSE",
        "WebSocket only",
        "gRPC",
      ],
      answerIndex: 1,
      explanation:
        "Streamable HTTP transport uses HTTP POST for requests and SSE for streaming responses, making it suitable for cloud-hosted remote servers accessible over the network.",
    },
    {
      q: "How do you support dynamic resources in MCP?",
      options: [
        "Create a tool that returns resource data",
        "Implement resources/templates/list with URI templates",
        "Hard-code all possible resource URIs at startup",
        "Use a separate REST API endpoint",
      ],
      answerIndex: 1,
      explanation:
        "Dynamic resources use URI templates (e.g., users/{id}/profile) exposed via resources/templates/list. The client fills in template parameters to request specific resources.",
    },
  ],
  flashcards: [
    { front: "What package provides the TypeScript MCP SDK?", back: "`@modelcontextprotocol/sdk`. Install with `npm install @modelcontextprotocol/sdk`. Provides McpServer (high-level) and Server (low-level) classes." },
    { front: "What is the MCP Inspector?", back: "A development tool (`npx @modelcontextprotocol/inspector`) providing a web UI to connect to, test, and debug MCP servers interactively." },
    { front: "How do tool handlers return errors?", back: "Return a result with `isError: true` and content describing what went wrong. Never throw uncaught exceptions or return empty results." },
    { front: "What is the in-memory transport used for?", back: "Automated testing. It connects a test client directly to your server without stdio or HTTP, enabling fast unit and integration tests." },
    { front: "How do resource subscriptions work?", back: "The client subscribes to a resource URI. When content changes, the server sends a `notifications/resources/updated` notification. The client can then re-read the resource." },
    { front: "What is McpServer vs Server?", back: "McpServer is the high-level API with convenient registration methods. Server is the low-level API for custom protocol handling. Most servers should use McpServer." },
  ],
  glossary: [
    { term: "MCP SDK", definition: "Official libraries (TypeScript, Python) that handle protocol negotiation, serialization, transport, and handler registration for building MCP servers." },
    { term: "Tool Handler", definition: "A function registered with the server that executes when a specific tool is called, receiving validated arguments and returning structured results." },
    { term: "Resource Provider", definition: "Server-side implementation of resources/list and resources/read that exposes data via URIs." },
    { term: "MCP Inspector", definition: "A development tool providing a web UI for interactive testing and debugging of MCP servers." },
    { term: "URI Template", definition: "A parameterized URI pattern (e.g., users/{id}) that enables dynamic resource resolution." },
    { term: "In-Memory Transport", definition: "A transport that connects client and server directly in the same process, used for automated testing without I/O." },
    { term: "isError Flag", definition: "A boolean on tool call results indicating the call failed, signaling the LLM to adjust its approach." },
  ],
};
