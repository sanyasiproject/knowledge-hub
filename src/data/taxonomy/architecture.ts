import type { Domain } from "../schema";

export const architectureAndDesign: Domain[] = [
  {
    slug: "architecture-patterns",
    title: "Architecture Patterns",
    summary: "The high-level shapes systems take, and when each fits.",
    icon: "🏛️",
    group: "Architecture & Design",
    categories: [
      {
        slug: "structural-styles",
        title: "Structural Styles",
        summary: "How a system is decomposed.",
        topics: [
          { slug: "monolith", title: "Monolithic Architecture", summary: "One deployable unit — simple until it isn't.", level: "Beginner", tags: ["architecture"] },
          { slug: "microservices", title: "Microservices", summary: "Independently deployable services around business capabilities.", level: "Advanced", tags: ["architecture"], contentReady: ["quick-summary", "detailed-explanation", "comparison", "diagrams", "interview-qa"] },
          { slug: "layered-hexagonal", title: "Layered & Hexagonal", summary: "Organizing code around boundaries and ports.", level: "Intermediate", tags: ["architecture"] },
          { slug: "serverless-arch", title: "Serverless Architecture", summary: "Functions and managed services with no servers to run.", level: "Advanced", tags: ["architecture"] },
        ],
      },
    ],
  },
  {
    slug: "domain-driven-design",
    title: "Domain-Driven Design",
    summary: "Aligning software design with the business domain.",
    icon: "🗺️",
    group: "Architecture & Design",
    categories: [
      {
        slug: "strategic-ddd",
        title: "Strategic Design",
        summary: "Modeling the big picture.",
        topics: [
          { slug: "ubiquitous-language", title: "Ubiquitous Language", summary: "A shared language between devs and domain experts.", level: "Intermediate", tags: ["ddd"] },
          { slug: "bounded-contexts", title: "Bounded Contexts", summary: "Explicit boundaries around models.", level: "Advanced", tags: ["ddd"] },
        ],
      },
      {
        slug: "tactical-ddd",
        title: "Tactical Design",
        summary: "Modeling within a context.",
        topics: [
          { slug: "entities-value-objects", title: "Entities & Value Objects", summary: "Identity vs value in the model.", level: "Intermediate", tags: ["ddd"] },
          { slug: "aggregates", title: "Aggregates & Repositories", summary: "Consistency boundaries and persistence.", level: "Advanced", tags: ["ddd"] },
        ],
      },
    ],
  },
  {
    slug: "high-level-design",
    title: "High-Level Design (HLD)",
    summary: "Designing the architecture and major components of a system.",
    icon: "🏗️",
    group: "Architecture & Design",
    categories: [
      {
        slug: "hld-core",
        title: "Core HLD",
        summary: "The building blocks and how to reason about them.",
        topics: [
          { slug: "hld-fundamentals", title: "HLD Fundamentals", summary: "Components, data flow, and boundaries.", level: "Intermediate", tags: ["hld", "system-design"] },
          { slug: "estimation", title: "Back-of-Envelope Estimation", summary: "Sizing traffic, storage, and bandwidth.", level: "Advanced", tags: ["hld", "system-design"] },
          { slug: "tradeoff-analysis", title: "Trade-off Analysis", summary: "Reasoning about competing designs.", level: "Advanced", tags: ["hld", "system-design"] },
        ],
      },
    ],
  },
  {
    slug: "low-level-design",
    title: "Low-Level Design (LLD)",
    summary: "Designing classes, interfaces, and interactions in detail.",
    icon: "🧰",
    group: "Architecture & Design",
    categories: [
      {
        slug: "lld-core",
        title: "Core LLD",
        summary: "Turning requirements into clean object models.",
        topics: [
          { slug: "lld-fundamentals", title: "LLD Fundamentals", summary: "Responsibilities, interfaces, and interactions.", level: "Intermediate", tags: ["lld"] },
          { slug: "class-design", title: "Class & API Design", summary: "Designing cohesive, well-encapsulated classes.", level: "Advanced", tags: ["lld"] },
          { slug: "lld-case-studies", title: "LLD Case Studies", summary: "Parking lot, elevator, rate limiter, and more.", level: "Advanced", tags: ["lld"] },
        ],
      },
    ],
  },
  {
    slug: "system-design",
    title: "System Design",
    summary: "Designing large-scale systems end to end — the interview and the craft.",
    icon: "🧭",
    group: "Architecture & Design",
    categories: [
      {
        slug: "system-design-core",
        title: "Framework & Building Blocks",
        summary: "A repeatable approach and the reusable pieces.",
        topics: [
          { slug: "system-design-framework", title: "A System Design Framework", summary: "Requirements, estimation, high-level design, deep dive.", level: "Intermediate", tags: ["system-design"], contentReady: ["quick-summary", "detailed-explanation", "diagrams", "interview-qa"] },
          { slug: "building-blocks", title: "Common Building Blocks", summary: "Load balancers, caches, queues, CDNs, databases.", level: "Intermediate", tags: ["system-design"] },
        ],
      },
      {
        slug: "system-design-problems",
        title: "Classic Problems",
        summary: "The systems asked about again and again.",
        topics: [
          { slug: "design-url-shortener", title: "Design a URL Shortener", summary: "Hashing, storage, and redirects at scale.", level: "Intermediate", tags: ["system-design"] },
          { slug: "design-news-feed", title: "Design a News Feed", summary: "Fan-out on write vs read.", level: "Advanced", tags: ["system-design"] },
          { slug: "design-chat-system", title: "Design a Chat System", summary: "Real-time messaging and presence.", level: "Advanced", tags: ["system-design"] },
          { slug: "design-rate-limiter", title: "Design a Rate Limiter", summary: "Algorithms and distributed enforcement.", level: "Advanced", tags: ["system-design"] },
        ],
      },
    ],
  },
];
