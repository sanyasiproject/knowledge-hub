import type { Domain } from "../schema";

export const career: Domain[] = [
  {
    slug: "behavioral-interviews",
    title: "Behavioral Interviews",
    summary: "Telling your engineering story with structure and impact.",
    icon: "🗣️",
    group: "Career",
    categories: [
      {
        slug: "behavioral-core",
        title: "Core Behavioral",
        summary: "Frameworks and the questions that recur.",
        topics: [
          { slug: "star-method", title: "The STAR Method", summary: "Situation, Task, Action, Result.", level: "Beginner", tags: ["behavioral"], contentReady: ["quick-summary", "detailed-explanation", "interview-qa"], related: ["common-behavioral-questions", "leadership-principles", "common-hr-questions", "hr-fundamentals", "salary-negotiation"] },
          { slug: "common-behavioral-questions", title: "Common Behavioral Questions", summary: "Conflict, failure, leadership, ambiguity.", level: "Beginner", tags: ["behavioral"], related: ["star-method", "leadership-principles", "common-hr-questions", "hr-fundamentals", "salary-negotiation"] },
          { slug: "leadership-principles", title: "Leadership Principles", summary: "Answering values-based interviews.", level: "Intermediate", tags: ["behavioral"], related: ["common-behavioral-questions", "star-method", "common-hr-questions", "hr-fundamentals", "salary-negotiation"] },
        ],
      },
    ],
  },
  {
    slug: "hr-interviews",
    title: "HR Interviews",
    summary: "Navigating screening, culture-fit, and offer conversations.",
    icon: "💼",
    group: "Career",
    categories: [
      {
        slug: "hr-core",
        title: "Core HR",
        summary: "The non-technical rounds and negotiation.",
        topics: [
          { slug: "hr-fundamentals", title: "HR Round Fundamentals", summary: "What HR screens for and how to prepare.", level: "Beginner", tags: ["hr"], related: ["common-hr-questions", "star-method", "salary-negotiation", "common-behavioral-questions", "leadership-principles"] },
          { slug: "common-hr-questions", title: "Common HR Questions", summary: "Strengths, weaknesses, and 'why us?'.", level: "Beginner", tags: ["hr"], related: ["hr-fundamentals", "salary-negotiation", "star-method", "common-behavioral-questions", "leadership-principles"] },
          { slug: "salary-negotiation", title: "Salary Negotiation", summary: "Getting to a fair offer, professionally.", level: "Intermediate", tags: ["hr"], related: ["common-hr-questions", "hr-fundamentals", "common-behavioral-questions", "star-method", "leadership-principles"] },
        ],
      },
    ],
  },
];
