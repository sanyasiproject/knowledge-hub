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
          { slug: "ml-basics", title: "ML Fundamentals for Engineers", summary: "Training, inference, features, and evaluation.", level: "Beginner", tags: ["ai"] },
          { slug: "model-serving", title: "Model Serving", summary: "Deploying models behind low-latency APIs.", level: "Intermediate", tags: ["ai"] },
          { slug: "ml-evaluation", title: "Evaluation & Monitoring", summary: "Measuring quality and detecting drift.", level: "Advanced", tags: ["ai"] },
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
          { slug: "llm-fundamentals", title: "LLM Fundamentals", summary: "Transformers, context windows, and generation.", level: "Beginner", tags: ["llm"], contentReady: ["quick-summary", "detailed-explanation", "diagrams", "interview-qa"] },
          { slug: "tokenization-embeddings", title: "Tokenization & Embeddings", summary: "Turning text into vectors the model understands.", level: "Intermediate", tags: ["llm"] },
          { slug: "fine-tuning", title: "Fine-tuning & Adaptation", summary: "LoRA, PEFT, and when to fine-tune.", level: "Advanced", tags: ["llm"] },
          { slug: "inference-optimization", title: "Inference Optimization", summary: "Quantization, batching, and KV caching.", level: "Advanced Concepts", tags: ["llm"] },
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
          { slug: "prompting-fundamentals", title: "Prompting Fundamentals", summary: "Clear instructions, context, and examples.", level: "Beginner", tags: ["prompting"] },
          { slug: "prompting-techniques", title: "Techniques (Few-shot, CoT, ReAct)", summary: "Structured prompting patterns.", level: "Intermediate", tags: ["prompting"] },
          { slug: "structured-output", title: "Structured Output", summary: "Getting JSON and tool calls reliably.", level: "Advanced", tags: ["prompting"] },
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
          { slug: "rag-fundamentals", title: "RAG Fundamentals", summary: "Why and how to ground generation in retrieval.", level: "Beginner", tags: ["rag"], contentReady: ["quick-summary", "detailed-explanation", "diagrams", "animations", "interview-qa"] },
          { slug: "chunking-embeddings", title: "Chunking & Embeddings", summary: "Splitting and vectorizing documents.", level: "Intermediate", tags: ["rag"] },
          { slug: "retrieval-strategies", title: "Retrieval Strategies", summary: "Vector, hybrid, and re-ranking.", level: "Advanced", tags: ["rag"] },
          { slug: "advanced-rag", title: "Advanced RAG", summary: "Query rewriting, agentic and graph RAG.", level: "Advanced Concepts", tags: ["rag"] },
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
          { slug: "agent-fundamentals", title: "Agent Fundamentals", summary: "The perceive-plan-act loop.", level: "Intermediate", tags: ["agents"] },
          { slug: "tool-use", title: "Tool Use & Function Calling", summary: "Letting models take real actions.", level: "Intermediate", tags: ["agents"] },
          { slug: "planning-memory", title: "Planning & Memory", summary: "Decomposition and remembering across steps.", level: "Advanced", tags: ["agents"] },
          { slug: "multi-agent", title: "Multi-Agent Systems", summary: "Coordinating specialized agents.", level: "Advanced Concepts", tags: ["agents"] },
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
          { slug: "mcp-fundamentals", title: "MCP Fundamentals", summary: "Why a standard protocol for context matters.", level: "Beginner", tags: ["mcp"] },
          { slug: "mcp-servers-tools", title: "Servers, Tools & Resources", summary: "The primitives an MCP server exposes.", level: "Intermediate", tags: ["mcp"] },
          { slug: "building-mcp-servers", title: "Building MCP Servers", summary: "Implementing a server end to end.", level: "Advanced", tags: ["mcp"] },
        ],
      },
    ],
  },
];
