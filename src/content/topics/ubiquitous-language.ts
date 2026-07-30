import type { TopicContent } from "../types";

export const ubiquitousLanguage: TopicContent = {
  quickSummary: [
    "Ubiquitous Language is a shared vocabulary developed collaboratively by developers and domain experts, used consistently in code, documentation, conversations, and user interfaces.",
    "It bridges the communication gap between technical and business teams by ensuring everyone uses the same terms with the same meaning, eliminating translation overhead and misunderstandings.",
    "The language is scoped to a specific bounded context -- the same word may have different meanings in different contexts (e.g., 'Account' in banking vs. identity management).",
    "Domain expert collaboration through techniques like event storming and domain storytelling is essential for discovering and refining the ubiquitous language iteratively.",
  ],
  detailed: [
    `## What Is Ubiquitous Language?

Coined by Eric Evans in Domain-Driven Design, Ubiquitous Language is a rigorous, shared vocabulary that both developers and domain experts use to describe the domain model.

**Key principles:**
- **Shared ownership** -- the language is not defined by developers alone or business people alone; it emerges from collaboration.
- **Used everywhere** -- the same terms appear in conversations, requirements, code (class names, method names, variable names), tests, documentation, and UI labels.
- **Precise, not generic** -- instead of vague terms like "process" or "handle," use domain-specific terms like "underwrite a policy" or "fulfill an order."
- **Evolving** -- the language is refined as understanding deepens. When a term proves ambiguous, the team discusses and resolves the ambiguity.

**Why it matters:**
Without a shared vocabulary, developers build mental models that diverge from the business reality. This divergence manifests as bugs, missed requirements, and expensive rework. Ubiquitous Language eliminates the "translation layer" between what the business says and what the code does.`,

    `## Building the Shared Vocabulary

**Discovery techniques:**

1. **Event Storming** -- a workshop where domain experts and developers collaboratively map business processes as a sequence of domain events on sticky notes. Events naturally surface the domain vocabulary: "Order Placed," "Payment Captured," "Shipment Dispatched."

2. **Domain Storytelling** -- domain experts narrate real scenarios while a facilitator diagrams the interactions between actors, work objects, and activities. The diagram captures the vocabulary as it is naturally used.

3. **Example Mapping** -- for each user story, the team maps concrete examples, rules, and questions. The language used in examples reveals implicit domain concepts.

4. **Glossary workshops** -- dedicated sessions to document, debate, and align on term definitions. Useful for resolving ambiguities discovered during development.

**Practical tips:**
- Record the vocabulary in a living glossary accessible to the entire team (wiki, README, or code comments).
- Challenge vague terms immediately: "What exactly do we mean by 'active user'?"
- Listen for domain experts correcting developers' terminology -- those corrections are linguistic gold.
- Pay attention to terms that domain experts use naturally but developers have not yet encoded in the model.`,

    `## Ubiquitous Language in Code

The language must be reflected directly in the codebase. If domain experts say "underwrite a policy," the code should have an \`underwrite()\` method on a \`Policy\` class, not a generic \`process()\` method.

**Good example:**
\`\`\`typescript
class LoanApplication {
  submit(applicant: Applicant, requestedAmount: Money): void { ... }
  approve(underwriter: Underwriter, conditions: ApprovalCondition[]): void { ... }
  decline(reason: DeclineReason): void { ... }
  disburse(bankAccount: BankAccount): void { ... }
}
\`\`\`

**Poor example (generic, no domain language):**
\`\`\`typescript
class Request {
  process(user: User, data: any): void { ... }
  updateStatus(status: string): void { ... }
  execute(target: any): void { ... }
}
\`\`\`

**Guidelines:**
- Class names should be nouns from the domain (Policy, Claim, Shipment), not technical patterns (Manager, Handler, Processor).
- Method names should be verbs from the domain (approve, underwrite, fulfill), not CRUD operations (update, set, process).
- Enums and constants should use domain terminology (PolicyStatus.UNDERWRITING, not Status.STEP_3).
- Test names should read like domain specifications: "a submitted loan application can be approved with conditions."`,

    `## Context-Specific Language

A critical insight from DDD is that the same word often means different things in different parts of the business. Ubiquitous Language is scoped to a bounded context.

**Example -- "Customer":**
- **Sales context:** a lead or prospect with contact info, deal stage, and sales history.
- **Billing context:** an account holder with payment methods, invoices, and credit terms.
- **Support context:** a ticket requester with issue history and satisfaction scores.

Trying to create a single "Customer" model that serves all contexts leads to a bloated, incoherent god-object. Instead, each bounded context defines its own Customer concept with only the attributes it needs.

**Context mapping:**
When two contexts need to communicate, define an explicit translation at the boundary:
- **Shared Kernel** -- two contexts share a subset of the model (high coupling, use sparingly).
- **Customer-Supplier** -- upstream context provides data; downstream context adapts it.
- **Anti-Corruption Layer** -- downstream context translates upstream concepts into its own language, preventing foreign terms from leaking in.
- **Published Language** -- a well-documented, versioned schema (e.g., an event contract) used for inter-context communication.`,

    `## Domain Expert Collaboration

The quality of ubiquitous language depends directly on the depth of collaboration between developers and domain experts.

**Collaboration anti-patterns:**
- **Requirements hand-off** -- business analysts write specs, developers implement without direct domain expert contact. Language diverges.
- **Developer-invented terminology** -- developers name concepts based on technical patterns rather than business vocabulary. Domain experts cannot read or validate the code.
- **Frozen vocabulary** -- the language is defined once at project start and never revisited. As understanding evolves, the code and the business drift apart.

**Effective collaboration patterns:**
- **Pair modeling** -- a developer and domain expert jointly model a subdomain, discussing each concept and its relationships.
- **Model exploration whirlpool** -- iterative cycles of scenario walkthrough, modeling, and code prototyping with immediate domain expert feedback.
- **Code review with domain experts** -- domain experts review class names, method names, and test descriptions (not implementation details) to verify the language is accurate.
- **Living documentation** -- tools like Cucumber/Gherkin generate documentation from executable specifications written in domain language, keeping docs and code in sync.

**Sign of success:** When a domain expert can read a test name like "a policy in underwriting can be approved if all conditions are met" and confirm it is correct without explanation.`,
  ],
  interviewQA: [
    {
      q: "What is Ubiquitous Language and why is it important in DDD?",
      a: "Ubiquitous Language is a shared vocabulary collaboratively developed by developers and domain experts, used consistently in code, conversations, documentation, and UI. It eliminates the translation layer between business concepts and technical implementation, reducing misunderstandings and bugs. Without it, developers build mental models that diverge from business reality, leading to software that solves the wrong problems or encodes incorrect assumptions.",
    },
    {
      q: "How do you discover and develop a ubiquitous language for a new domain?",
      a: "Use collaborative discovery techniques with domain experts: event storming to map business processes through domain events, domain storytelling to capture real scenarios, and example mapping to surface concrete rules and edge cases. Listen carefully to domain experts' natural vocabulary, challenge vague terms, and record definitions in a living glossary. The language evolves -- revisit and refine terms as the team's understanding deepens through modeling and implementation.",
    },
    {
      q: "Why should ubiquitous language be scoped to a bounded context rather than be organization-wide?",
      a: "The same word often means different things in different parts of the business. 'Customer' in Sales is a prospect; in Billing, it is an account holder; in Support, it is a ticket requester. A single universal definition forces a bloated model that serves no context well. Scoping language to bounded contexts allows each team to define precise, fit-for-purpose models. Context mapping patterns (ACL, Published Language) handle translation at boundaries.",
    },
    {
      q: "How do you ensure the code reflects the ubiquitous language over time?",
      a: "Enforce naming conventions in code reviews: class names as domain nouns, method names as domain verbs, enums using domain terminology. Write tests that read like domain specifications. Use living documentation tools (Gherkin/Cucumber) to keep specs and code in sync. Involve domain experts in reviewing class and method names. When the language evolves, refactor the code to match -- renaming is not cosmetic, it is a correction of the model.",
    },
  ],
  mcqs: [
    {
      q: "What is the primary purpose of Ubiquitous Language in DDD?",
      options: [
        "To create technical documentation for API consumers",
        "To establish a shared vocabulary between developers and domain experts used consistently in code and communication",
        "To standardize programming language choice across the organization",
        "To define database schema naming conventions",
      ],
      answerIndex: 1,
      explanation:
        "Ubiquitous Language bridges the communication gap between technical and business teams by creating a shared vocabulary that is used consistently in conversations, documentation, code, and tests.",
    },
    {
      q: "Why is Ubiquitous Language scoped to a bounded context rather than the entire organization?",
      options: [
        "To reduce the size of the glossary document",
        "Because the same term often has different meanings in different business contexts",
        "To allow each team to use their preferred programming language",
        "Because bounded contexts are always in different code repositories",
      ],
      answerIndex: 1,
      explanation:
        "Terms like 'Customer,' 'Account,' or 'Order' carry different meanings in different parts of the business. Scoping language to bounded contexts allows precise, context-specific definitions without forced compromises.",
    },
    {
      q: "Which technique is most effective for initially discovering the ubiquitous language of a domain?",
      options: [
        "Reading the existing database schema and extracting table names",
        "Event storming workshops with domain experts and developers",
        "Analyzing competitor product documentation",
        "Having developers independently name classes based on design patterns",
      ],
      answerIndex: 1,
      explanation:
        "Event storming brings domain experts and developers together to collaboratively map business processes as domain events, naturally surfacing the vocabulary used by the business in a shared, visual format.",
    },
    {
      q: "Which code naming approach best reflects ubiquitous language?",
      options: [
        "class DataProcessor { handle(input: any): void }",
        "class LoanApplication { approve(underwriter: Underwriter): void }",
        "class EntityManager { update(entity: BaseEntity): void }",
        "class ServiceHandler { execute(request: Request): Response }",
      ],
      answerIndex: 1,
      explanation:
        "Domain-specific names (LoanApplication, approve, Underwriter) directly reflect the ubiquitous language. Generic names (DataProcessor, handle, EntityManager) obscure domain meaning and prevent domain experts from validating the model.",
    },
  ],
  flashcards: [
    {
      front: "What is Event Storming?",
      back: "A collaborative workshop technique where domain experts and developers map business processes as sequences of domain events on sticky notes. It surfaces ubiquitous language naturally through discussion and helps identify bounded contexts, aggregates, and commands.",
    },
    {
      front: "How does Ubiquitous Language differ from a glossary?",
      back: "A glossary is a static document listing term definitions. Ubiquitous Language is a living practice -- the terms are actively used in code, tests, conversations, and documentation. It evolves through ongoing collaboration and is enforced through code reviews and refactoring.",
    },
    {
      front: "What is the 'translation layer' problem?",
      back: "When developers use different terms than domain experts, every conversation requires mental translation. This introduces misunderstandings, delays, and bugs. Ubiquitous Language eliminates this translation by ensuring both groups use identical terms with identical meanings.",
    },
    {
      front: "What is Domain Storytelling?",
      back: "A discovery technique where domain experts narrate real business scenarios while a facilitator diagrams actors, work objects, and activities. The natural vocabulary used in storytelling reveals domain concepts for the ubiquitous language.",
    },
    {
      front: "Sign that Ubiquitous Language is working",
      back: "A domain expert can read a test name like 'a policy in underwriting can be approved if all conditions are met' and confirm its correctness without any additional explanation from developers.",
    },
    {
      front: "Anti-Corruption Layer and language",
      back: "An ACL translates concepts from an external or upstream context into the current context's ubiquitous language, preventing foreign terminology from leaking into and corrupting the local domain model.",
    },
    {
      front: "Why avoid generic class names like Manager, Handler, Processor?",
      back: "These names carry no domain meaning. They prevent domain experts from understanding the code and allow developers to bypass the discipline of modeling the domain correctly. Use domain nouns (Policy, Claim, Order) and domain verbs (approve, underwrite, fulfill) instead.",
    },
  ],
  glossary: [
    {
      term: "Ubiquitous Language",
      definition:
        "A shared, precise vocabulary developed collaboratively by developers and domain experts, used consistently in code, documentation, conversations, and UI within a bounded context.",
    },
    {
      term: "Event Storming",
      definition:
        "A collaborative workshop technique for discovering domain events, commands, aggregates, and bounded contexts by mapping business processes on a timeline with sticky notes.",
    },
    {
      term: "Domain Expert",
      definition:
        "A person with deep knowledge of the business domain who collaborates with developers to shape the domain model and ubiquitous language. Also called a subject matter expert (SME).",
    },
    {
      term: "Living Glossary",
      definition:
        "A continuously maintained, easily accessible document recording the ubiquitous language terms and their definitions, updated as the team's understanding evolves.",
    },
    {
      term: "Example Mapping",
      definition:
        "A collaborative technique that maps concrete examples, rules, and open questions for each user story, surfacing domain vocabulary and edge cases through structured discussion.",
    },
    {
      term: "Published Language",
      definition:
        "A well-documented, versioned schema used for communication between bounded contexts, enabling translation between different ubiquitous languages at context boundaries.",
    },
    {
      term: "Model Exploration Whirlpool",
      definition:
        "An iterative modeling process involving cycles of scenario walkthrough, domain modeling, and code prototyping with continuous domain expert feedback to refine the ubiquitous language.",
    },
  ],
};
