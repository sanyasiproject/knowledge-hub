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
};
