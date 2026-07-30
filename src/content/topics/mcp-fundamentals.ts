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
};
