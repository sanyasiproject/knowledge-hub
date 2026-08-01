import type { Domain } from "../schema";

export const aiEngineering: Domain[] = [
  {
    slug: "ai-engineering",
    title: "AI Engineering",
    summary: "Building, serving, and operating machine-learning-powered products.",
    icon: "🤖",
    group: "AI Engineering",
    categories: [
      {
        slug: "ai-eng-core",
        title: "Core AI Engineering",
        summary: "From models to production systems.",
        topics: [
          { slug: "ml-basics", title: "ML Fundamentals for Engineers", summary: "Training, inference, features, and evaluation.", level: "Beginner", tags: ["ai"], related: ["model-serving", "ml-evaluation", "fine-tuning", "inference-optimization", "llm-fundamentals"] },
          { slug: "model-serving", title: "Model Serving", summary: "Deploying models behind low-latency APIs.", level: "Intermediate", tags: ["ai"], related: ["ml-basics", "inference-optimization", "ml-evaluation", "fine-tuning", "microservices"] },
          { slug: "ml-evaluation", title: "Evaluation & Monitoring", summary: "Measuring quality and detecting drift.", level: "Advanced", tags: ["ai"], related: ["ml-basics", "model-serving", "fine-tuning", "metrics", "sli-slo-sla"] },
        ],
      },
    ],
  },
  {
    slug: "llm-engineering",
    title: "LLM Engineering",
    summary: "Engineering with large language models — from tokens to inference.",
    icon: "🧠",
    group: "AI Engineering",
    categories: [
      {
        slug: "llm-core",
        title: "Core LLM Engineering",
        summary: "How LLMs work and how to run them well.",
        topics: [
          { slug: "llm-fundamentals", title: "LLM Fundamentals", summary: "Transformers, context windows, and generation.", level: "Beginner", tags: ["llm"], contentReady: ["quick-summary", "detailed-explanation", "diagrams", "interview-qa"], related: ["tokenization-embeddings", "prompting-fundamentals", "rag-fundamentals", "fine-tuning", "ml-basics"] },
          { slug: "tokenization-embeddings", title: "Tokenization & Embeddings", summary: "Turning text into vectors the model understands.", level: "Intermediate", tags: ["llm"], related: ["llm-fundamentals", "chunking-embeddings", "fine-tuning", "ml-basics", "vectors-matrices"] },
          { slug: "fine-tuning", title: "Fine-tuning & Adaptation", summary: "LoRA, PEFT, and when to fine-tune.", level: "Advanced", tags: ["llm"], related: ["llm-fundamentals", "ml-basics", "inference-optimization", "model-serving", "ml-evaluation"] },
          { slug: "inference-optimization", title: "Inference Optimization", summary: "Quantization, batching, and KV caching.", level: "Advanced Concepts", tags: ["llm"], related: ["model-serving", "fine-tuning", "llm-fundamentals", "ml-evaluation", "capacity-planning"] },
        ],
      },
    ],
  },
  {
    slug: "prompt-engineering",
    title: "Prompt Engineering",
    summary: "Getting reliable, high-quality output from language models.",
    icon: "✍️",
    group: "AI Engineering",
    categories: [
      {
        slug: "prompting-core",
        title: "Core Prompting",
        summary: "The techniques that reliably improve results.",
        topics: [
          { slug: "prompting-fundamentals", title: "Prompting Fundamentals", summary: "Clear instructions, context, and examples.", level: "Beginner", tags: ["prompting"], related: ["prompting-techniques", "structured-output", "llm-fundamentals", "rag-fundamentals", "tool-use"] },
          { slug: "prompting-techniques", title: "Techniques (Few-shot, CoT, ReAct)", summary: "Structured prompting patterns.", level: "Intermediate", tags: ["prompting"], related: ["prompting-fundamentals", "structured-output", "llm-fundamentals", "agent-fundamentals", "rag-fundamentals"] },
          { slug: "structured-output", title: "Structured Output", summary: "Getting JSON and tool calls reliably.", level: "Advanced", tags: ["prompting"], related: ["prompting-techniques", "prompting-fundamentals", "tool-use", "llm-fundamentals", "agent-fundamentals"] },
        ],
      },
    ],
  },
  {
    slug: "rag",
    title: "RAG",
    summary: "Retrieval-Augmented Generation — grounding LLMs in your own data.",
    icon: "📚",
    group: "AI Engineering",
    categories: [
      {
        slug: "rag-core",
        title: "Core RAG",
        summary: "The retrieval-then-generate pipeline.",
        topics: [
          { slug: "rag-fundamentals", title: "RAG Fundamentals", summary: "Why and how to ground generation in retrieval.", level: "Beginner", tags: ["rag"], contentReady: ["quick-summary", "detailed-explanation", "diagrams", "animations", "interview-qa"], related: ["chunking-embeddings", "retrieval-strategies", "advanced-rag", "llm-fundamentals", "prompting-fundamentals"] },
          { slug: "chunking-embeddings", title: "Chunking & Embeddings", summary: "Splitting and vectorizing documents.", level: "Intermediate", tags: ["rag"], related: ["rag-fundamentals", "retrieval-strategies", "tokenization-embeddings", "advanced-rag", "inverted-index"] },
          { slug: "retrieval-strategies", title: "Retrieval Strategies", summary: "Vector, hybrid, and re-ranking.", level: "Advanced", tags: ["rag"], related: ["rag-fundamentals", "chunking-embeddings", "advanced-rag", "inverted-index", "es-querying"] },
          { slug: "advanced-rag", title: "Advanced RAG", summary: "Query rewriting, agentic and graph RAG.", level: "Advanced Concepts", tags: ["rag"], related: ["rag-fundamentals", "retrieval-strategies", "agent-fundamentals", "multi-agent", "chunking-embeddings"] },
        ],
      },
    ],
  },
  {
    slug: "ai-agents",
    title: "AI Agents",
    summary: "LLMs that plan, use tools, and act toward goals.",
    icon: "🕹️",
    group: "AI Engineering",
    categories: [
      {
        slug: "agents-core",
        title: "Core Agents",
        summary: "The anatomy of an agentic system.",
        topics: [
          { slug: "agent-fundamentals", title: "Agent Fundamentals", summary: "The perceive-plan-act loop.", level: "Intermediate", tags: ["agents"], related: ["tool-use", "planning-memory", "multi-agent", "prompting-techniques", "rag-fundamentals"] },
          { slug: "tool-use", title: "Tool Use & Function Calling", summary: "Letting models take real actions.", level: "Intermediate", tags: ["agents"], related: ["agent-fundamentals", "structured-output", "mcp-fundamentals", "planning-memory", "multi-agent"] },
          { slug: "planning-memory", title: "Planning & Memory", summary: "Decomposition and remembering across steps.", level: "Advanced", tags: ["agents"], related: ["agent-fundamentals", "multi-agent", "tool-use", "rag-fundamentals", "advanced-rag"] },
          { slug: "multi-agent", title: "Multi-Agent Systems", summary: "Coordinating specialized agents.", level: "Advanced Concepts", tags: ["agents"], related: ["agent-fundamentals", "planning-memory", "tool-use", "mcp-fundamentals", "building-mcp-servers"] },
        ],
      },
    ],
  },
  {
    slug: "mcp",
    title: "MCP",
    summary: "The Model Context Protocol — a standard for connecting models to tools and data.",
    icon: "🔗",
    group: "AI Engineering",
    categories: [
      {
        slug: "mcp-core",
        title: "Core MCP",
        summary: "The protocol and how to build with it.",
        topics: [
          { slug: "mcp-fundamentals", title: "MCP Fundamentals", summary: "Why a standard protocol for context matters.", level: "Beginner", tags: ["mcp"], related: ["mcp-servers-tools", "building-mcp-servers", "tool-use", "agent-fundamentals", "grpc"] },
          { slug: "mcp-servers-tools", title: "Servers, Tools & Resources", summary: "The primitives an MCP server exposes.", level: "Intermediate", tags: ["mcp"], related: ["mcp-fundamentals", "building-mcp-servers", "tool-use", "structured-output", "agent-fundamentals"] },
          { slug: "building-mcp-servers", title: "Building MCP Servers", summary: "Implementing a server end to end.", level: "Advanced", tags: ["mcp"], related: ["mcp-fundamentals", "mcp-servers-tools", "tool-use", "grpc", "agent-fundamentals"] },
        ],
      },
    ],
  },
];
