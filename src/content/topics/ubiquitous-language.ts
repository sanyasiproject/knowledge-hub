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
  followUps: [
    "What breaks when engineers and domain experts use the same word differently?",
    "How does the language differ across bounded contexts, legitimately?",
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
  resources: [
    {
      label: "Domain-Driven Design — Eric Evans",
      kind: "book",
    },
    {
      label: "Implementing Domain-Driven Design — Vaughn Vernon",
      kind: "book",
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
  deepDive: [
    `**Ubiquitous Language and the C++ Type System** offer a uniquely powerful combination. In C++, the type system can *enforce* the ubiquitous language at compile time. Instead of using \`std::string\` for every domain concept, create *strongly-typed wrappers*: \`class PolicyNumber\`, \`class ClaimId\`, \`class Premium\`. These types make it impossible to accidentally pass a \`PolicyNumber\` where a \`ClaimId\` is expected -- the compiler catches the error. \`enum class\` replaces magic strings for domain states: \`PolicyStatus::UNDERWRITING\` instead of \`status == "step_3"\`. Template parameters can encode domain constraints: \`Amount<Currency::USD>\` is a different type from \`Amount<Currency::EUR>\`, preventing currency mixing at *compile time*. This goes beyond naming conventions -- the ubiquitous language is woven into the *type lattice* itself, making domain violations a compilation error rather than a runtime bug.`,

    `**Bounded Contexts and C++ Module Boundaries** align naturally with C++20 modules and the traditional header/library organization. Each bounded context maps to a *namespace* (or nested namespace) and a distinct set of headers or module partitions. The \`Sales::Customer\` type is completely independent from \`Billing::Customer\` -- they share no code, no base class, and no header. At context boundaries, an **Anti-Corruption Layer** translates between representations: a function or adapter class that converts \`Sales::Customer\` into \`Billing::AccountHolder\`, explicitly mapping field by field. This translation is *not* a cast or reinterpret -- it is a deliberate, documented mapping that preserves the integrity of each context's language. In C++ build systems (CMake, Bazel), bounded contexts become separate *libraries* with explicit dependency declarations, making unauthorized cross-context coupling a link error.`,

    `**Living Documentation** in C++ codebases takes the form of *self-documenting types* and *expressive tests*. Unlike dynamically-typed languages where domain intent can be obscured by generic types, C++ classes and method signatures serve as *executable documentation*. A method signature like \`Claim Claim::submit(const PolicyHolder& holder, const IncidentReport& report)\` documents the domain operation, its participants, and its result without any comments. Test names written in domain language -- \`TEST(LoanApplication, submitted_application_can_be_approved_with_conditions)\` -- serve as living specifications that domain experts can read and validate. **Concepts** (C++20) add another layer: \`template <Serializable T>\` documents that a type must satisfy a domain contract. When the ubiquitous language evolves, *renaming* in C++ is a refactoring operation -- the compiler finds every usage, and any mismatch between old and new names produces an error, ensuring the entire codebase updates atomically.`,
  ],
  code: [
    {
      language: "cpp",
      caption: "Strongly-typed domain vocabulary using the C++ type system",
      source: `#include <string>
#include <stdexcept>
#include <utility>

// Each domain concept gets its own type -- the compiler enforces vocabulary
class PolicyNumber {
public:
    explicit PolicyNumber(std::string value) : value_(std::move(value)) {
        if (value_.empty())
            throw std::invalid_argument("PolicyNumber cannot be empty");
        // Domain rule: policy numbers start with "POL-"
        if (value_.substr(0, 4) != "POL-")
            throw std::invalid_argument("PolicyNumber must start with POL-");
    }
    const std::string& value() const { return value_; }
    bool operator==(const PolicyNumber&) const = default;
private:
    std::string value_;
};

class ClaimId {
public:
    explicit ClaimId(std::string value) : value_(std::move(value)) {}
    const std::string& value() const { return value_; }
    bool operator==(const ClaimId&) const = default;
private:
    std::string value_;
};

// Compile-time safety: you CANNOT pass a PolicyNumber where ClaimId is expected
// This function signature IS the ubiquitous language
class Claim {
public:
    static Claim file(ClaimId id, PolicyNumber policy, std::string description) {
        return Claim(std::move(id), std::move(policy), std::move(description));
    }

    void approve(const std::string& adjuster_name) {
        if (status_ != Status::FILED)
            throw std::logic_error("Only filed claims can be approved");
        status_ = Status::APPROVED;
    }

    void deny(const std::string& reason) {
        if (status_ != Status::FILED)
            throw std::logic_error("Only filed claims can be denied");
        status_ = Status::DENIED;
        denial_reason_ = reason;
    }

private:
    enum class Status { FILED, APPROVED, DENIED, SETTLED };

    Claim(ClaimId id, PolicyNumber policy, std::string desc)
        : id_(std::move(id)), policy_(std::move(policy)),
          description_(std::move(desc)), status_(Status::FILED) {}

    ClaimId id_;
    PolicyNumber policy_;
    std::string description_;
    Status status_;
    std::string denial_reason_;
};`,
    },
    {
      language: "cpp",
      caption: "Bounded Context separation with Anti-Corruption Layer translation",
      source: `#include <string>
#include <vector>
#include <utility>

// ---- Sales Bounded Context ----
namespace Sales {
    struct Customer {
        std::string customer_id;
        std::string company_name;
        std::string contact_email;
        std::string deal_stage;     // Sales-specific concept
        double pipeline_value;      // Sales-specific concept
    };
}

// ---- Billing Bounded Context ----
namespace Billing {
    enum class PaymentTerms { NET_30, NET_60, PREPAID };

    struct AccountHolder {
        std::string account_id;
        std::string legal_name;
        std::string billing_email;
        PaymentTerms terms;        // Billing-specific concept
        double credit_limit;       // Billing-specific concept
    };
}

// ---- Anti-Corruption Layer ----
// Explicit translation between bounded contexts
// This is NOT a simple cast -- it is a deliberate domain mapping
namespace ACL {
    Billing::AccountHolder translate_to_account_holder(
        const Sales::Customer& customer,
        Billing::PaymentTerms default_terms = Billing::PaymentTerms::NET_30,
        double default_credit_limit = 10000.0
    ) {
        return Billing::AccountHolder{
            .account_id    = customer.customer_id,  // Same identity
            .legal_name    = customer.company_name,  // Different name!
            .billing_email = customer.contact_email,
            .terms         = default_terms,          // Billing-specific default
            .credit_limit  = default_credit_limit,   // Not from Sales at all
        };
        // Note: deal_stage and pipeline_value are intentionally dropped
        // They have no meaning in the Billing context
    }
}`,
    },
    {
      language: "cpp",
      caption: "Domain-language test names as living specifications",
      source: `// Tests read like domain specifications that domain experts can validate
// Using a test framework like Google Test or Catch2

#include <gtest/gtest.h>

// Domain-language test fixture
class LoanApplicationTest : public ::testing::Test {
protected:
    // Setup uses domain vocabulary
    Applicant qualified_applicant{"Alice", CreditScore(750), Income::annual(85000)};
    Applicant unqualified_applicant{"Bob", CreditScore(500), Income::annual(20000)};
    Money standard_amount = Money::of(50000, Currency::USD);
};

TEST_F(LoanApplicationTest,
       submitted_application_can_be_approved_with_conditions) {
    auto app = LoanApplication::submit(qualified_applicant, standard_amount);

    Underwriter underwriter{"Jane", SeniorityLevel::SENIOR};
    std::vector<ApprovalCondition> conditions{
        ApprovalCondition::proof_of_income(),
        ApprovalCondition::property_appraisal()
    };

    app.approve(underwriter, conditions);

    EXPECT_EQ(app.status(), LoanStatus::APPROVED);
    EXPECT_EQ(app.conditions().size(), 2);
}

TEST_F(LoanApplicationTest,
       application_exceeding_credit_limit_is_automatically_declined) {
    auto excessive_amount = Money::of(500000, Currency::USD);
    auto app = LoanApplication::submit(unqualified_applicant, excessive_amount);

    // Domain rule: auto-decline if amount > 10x annual income
    EXPECT_EQ(app.status(), LoanStatus::DECLINED);
    EXPECT_EQ(app.decline_reason(), DeclineReason::EXCEEDS_CREDIT_LIMIT);
}

TEST_F(LoanApplicationTest,
       approved_application_can_be_disbursed_to_bank_account) {
    auto app = LoanApplication::submit(qualified_applicant, standard_amount);
    app.approve(Underwriter{"Jane"}, {});

    BankAccount account{"ACCT-001", "Alice", RoutingNumber("021000021")};
    app.disburse(account);

    EXPECT_EQ(app.status(), LoanStatus::DISBURSED);
}`,
    },
  ],
  diagrams: [
    {
      title: "Ubiquitous Language in DDD",
      kind: "mindmap",
      caption: "How ubiquitous language connects domain experts, developers, and code through a shared vocabulary.",
      mermaid: `mindmap
  root((Ubiquitous Language))
    Domain Experts
      Business terms
      Processes and rules
      Edge cases
    Developers
      Model in code
      Class and method names
      Tests as documentation
    Shared Artifacts
      Glossary
      Event storming board
      Domain model diagrams
    Bounded Context
      Language scoped per context
      Shipping vs Billing Order`,
    },
    {
      title: "Language Discovery Process",
      kind: "flow",
      caption: "Iterative process for discovering and refining the ubiquitous language with domain experts.",
      mermaid: `flowchart TD
    A([Start]) --> B["Domain expert workshops
Event storming"]
    B --> C["Extract candidate terms
verbs and nouns"]
    C --> D["Define terms precisely
build glossary"]
    D --> E["Model in code
classes reflect terms"]
    E --> F["Review with experts
spot mismatches"]
    F --> G{Language aligned?}
    G -->|No| H["Refine terms
update model and glossary"]
    H --> D
    G -->|Yes| I["Evolve continuously
as domain grows"]`,
    },
    {
      title: "Bounded Context Language Isolation",
      kind: "architecture",
      caption: "Same word Order meaning different things in different bounded contexts of the same system.",
      mermaid: `graph LR
    subgraph Sales Context
    SO["Order
products + customer
credit check"]
    end
    subgraph Shipping Context
    ShO["Order
delivery address
tracking number"]
    end
    subgraph Billing Context
    BO["Order
line items
tax + invoice"]
    end
    SO -->|context map| ShO
    ShO -->|context map| BO`,
    },
    {
      title: "Code as Model Alignment",
      kind: "sequence",
      caption: "How a developer translates domain expert language directly into code class and method names.",
      mermaid: `sequenceDiagram
    participant DE as Domain Expert
    participant Dev as Developer
    participant Code as Codebase
    DE->>Dev: When a customer places an order we reserve inventory
    Dev->>Dev: identify entities: Customer, Order, Inventory
    Dev->>Code: class Order with placeOrder() method
    Dev->>Code: class Inventory with reserve(quantity) method
    DE->>Dev: If payment fails we release the reservation
    Dev->>Code: order.cancelPayment() calls inventory.release()
    DE->>Dev: Review - yes that matches our language`,
    },
  ],
  animations: [
    {
      title: "One word, three meanings",
      steps: [
        {
          label: "Sales says 'customer'",
          detail: "Someone in the pipeline who may never have bought anything.",
        },
        {
          label: "Billing says 'customer'",
          detail: "An entity with a payment method and an invoice history.",
        },
        {
          label: "Support says 'customer'",
          detail: "Anyone with a login, including free users.",
        },
        {
          label: "The bug",
          detail: "A single `Customer` model tries to satisfy all three and satisfies none, accumulating nullable fields and conditional logic.",
        },
        {
          label: "The fix",
          detail: "Separate models per bounded context — `Lead`, `Account`, `User` — each precise inside its own boundary.",
        },
        {
          label: "The discipline",
          detail: "Code, conversation, and documentation use the same word for the same thing within a context.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Aspect", "With Ubiquitous Language", "Without Ubiquitous Language"],
    rows: [
      ["**Code readability**", "Domain experts *can read and validate* class/method names", "Only developers understand the code; domain experts are *excluded*"],
      ["**Bug surface**", "Mismatched terminology is caught in *code review* with domain experts", "Misunderstandings hide until *production bugs* surface"],
      ["**Onboarding**", "New developers learn domain concepts *from the code itself*", "New developers must learn a *separate mapping* between code and business terms"],
      ["**Refactoring safety**", "Renaming aligns code with evolved understanding; compiler *catches all usages*", "Renaming is feared because the mapping between *old generic names* and business concepts is undocumented"],
      ["**Cross-team communication**", "Developers and domain experts use *identical vocabulary* -- no translation needed", "Every conversation requires *mental translation* between technical and business terms"],
      ["**Type safety (C++)**", "Strongly-typed wrappers (`PolicyNumber`, `ClaimId`) prevent *compile-time* misuse", "Raw `std::string` and `int` for everything -- errors caught only at *runtime*"],
      ["**Testing**", "Test names read as *domain specifications*: \"submitted application can be approved\"", "Test names are *technical*: \"test_update_status_3\" -- no domain meaning"],
      ["**Bounded contexts**", "Each context has *precise, local* definitions -- no ambiguity", "One bloated *universal model* with conflicting definitions across teams"],
    ],
  },
  exercises: [
    "**Vocabulary extraction exercise**: Take a real-world domain you are familiar with (e.g., hotel booking, food delivery, library management). List *10 domain terms* with precise definitions. For each term, write the C++ class or `enum class` declaration that encodes it. Identify at least *two terms* that would have different meanings in different bounded contexts.",
    "**Rename for domain alignment**: You have a codebase with these classes: `DataProcessor`, `RequestHandler`, `EntityManager`, `ServiceHelper`, and `RecordUpdater`. For a *loan origination* domain, rename each class using ubiquitous language. Write the new header file with domain-appropriate method names (e.g., `submit()`, `underwrite()`, `approve()` instead of `process()`, `handle()`, `update()`).",
    "**Anti-Corruption Layer implementation**: You receive data from an external partner API that uses the terms `client` (with `client_code`), `transaction` (with `txn_type`), and `amount_cents`. Your domain uses `Customer` (with `CustomerId`), `Payment` (with `PaymentMethod`), and `Money`. Write the ACL adapter class in C++ that translates between the external vocabulary and your *ubiquitous language*, including validation and type conversion.",
    "**Event Storming simulation**: For an e-commerce order fulfillment domain, write out *8 domain events* in past tense (e.g., \"Order Placed\", \"Payment Captured\"). For each event, identify the *command* that triggers it and the *aggregate* that emits it. Implement the events as C++ structs with domain-typed fields, and write an `enum class OrderStatus` with states derived from the events.",
    "**Living documentation test suite**: Write 5 test cases for a `Policy` class in an insurance domain. Each test name must be a *complete domain sentence* that a non-technical stakeholder could read and validate (e.g., `a_policy_in_underwriting_can_be_approved_if_all_conditions_are_met`). Implement the test bodies using domain-typed parameters, not primitives.",
  ],
  cheatSheet: [
    "**Ubiquitous Language** = shared vocabulary used *everywhere*: code, tests, conversations, docs, UI. If the domain expert says \"underwrite,\" the code has an `underwrite()` method -- not `process()` or `handle()`.",
    "**Strongly-typed vocabulary** in C++: Wrap domain concepts in *dedicated types* (`PolicyNumber`, `ClaimId`, `Premium`). The compiler prevents misuse. Never use raw `std::string` or `int` for domain identifiers.",
    "**Bounded context scoping**: The same word means *different things* in different contexts. `Customer` in Sales != `Customer` in Billing. Each context has its own namespace, types, and definitions.",
    "**Anti-Corruption Layer**: When crossing context boundaries, *explicitly translate* between vocabularies. No implicit casting, no shared base classes. A function that maps `Sales::Customer` to `Billing::AccountHolder` field by field.",
    "**Test names as specs**: Write test names in *domain language*: `submitted_application_can_be_approved_with_conditions`. Domain experts should be able to read test names and confirm correctness.",
    "**Evolving vocabulary**: When the team discovers a better term, *rename everywhere* -- code, tests, docs. In C++, the compiler catches every usage. Renaming is not cosmetic; it is a *model correction*.",
  ],
  revisionNotes: [
    "**Ubiquitous Language** is a *shared vocabulary* collaboratively developed by developers and domain experts. It eliminates the translation layer between business concepts and code. Every class name, method name, and enum value should use *domain terms*, not technical patterns.",
    "**Strongly-typed wrappers** in C++ enforce the ubiquitous language at *compile time*. `PolicyNumber`, `ClaimId`, and `Premium` are distinct types -- the compiler prevents accidental misuse. `enum class` replaces magic strings for domain states.",
    "**Bounded contexts** scope the language: `Customer` means different things in Sales, Billing, and Support. Each context has its *own types and definitions*. At boundaries, an **Anti-Corruption Layer** explicitly translates between vocabularies.",
    "**Discovery techniques**: *Event Storming* maps business processes as domain events. *Domain Storytelling* captures real scenarios in domain vocabulary. *Example Mapping* surfaces concrete rules and edge cases. All require *direct collaboration* with domain experts.",
    "**Living documentation**: Test names written in domain language serve as *executable specifications*. Domain experts can read test names and validate correctness without understanding implementation. In C++, self-documenting type signatures reinforce the vocabulary.",
  ],
};
