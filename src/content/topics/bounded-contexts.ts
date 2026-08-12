import type { TopicContent } from "../types";

export const boundedContexts: TopicContent = {
  quickSummary: [
    "A bounded context is an explicit boundary within which a particular domain model applies; the same concept (e.g., 'Customer') can have different meanings and representations across different contexts.",
    "Context mapping defines the relationships between bounded contexts -- how they communicate, who has authority over shared concepts, and where translation occurs.",
    "The Anti-Corruption Layer (ACL) is a translation boundary that prevents one context's model from leaking into another, preserving each context's integrity and autonomy.",
    "Bounded contexts align naturally with team ownership and microservice boundaries, making them the primary decomposition strategy in DDD-based architectures.",
  ],
  detailed: [
    `## What Are Bounded Contexts?

A bounded context is the central pattern in Domain-Driven Design for dealing with large models. It defines an explicit boundary within which a domain model is consistent, coherent, and meaningful.

**Why bounded contexts exist:**
Large domains contain ambiguity. The word "Order" means something different to the warehouse team (a pick list), the finance team (an invoice trigger), and the customer support team (a complaint reference). Attempting a single unified model forces awkward compromises that serve no one well.

**Key characteristics:**
- **Linguistic boundary** -- each context has its own ubiquitous language. The same word can mean different things across contexts.
- **Model boundary** -- each context has its own domain model with its own entities, value objects, and aggregates.
- **Ownership boundary** -- each context is owned by one team. Ownership clarity prevents design-by-committee.
- **Technical boundary** -- each context can have its own database, deployment pipeline, and technology stack.

**Identifying bounded contexts:**
- Listen for language shifts in domain conversations ("When we say 'product' in catalog, we mean... but in pricing, it means...").
- Look for organizational boundaries -- different departments often imply different contexts.
- Use event storming to identify clusters of related events that form natural groupings.`,

    `## Context Mapping

Context mapping is the practice of explicitly documenting the relationships between bounded contexts. Eric Evans defined several relationship patterns:

**Upstream-Downstream patterns:**
- **Customer-Supplier** -- the downstream context depends on the upstream context. The upstream team accommodates downstream needs within reason, like a supplier-customer relationship.
- **Conformist** -- the downstream context conforms entirely to the upstream model with no translation. Used when the upstream team has no incentive to accommodate and the cost of translation is too high.
- **Anti-Corruption Layer (ACL)** -- the downstream context translates upstream concepts into its own language, preventing model contamination.

**Mutual patterns:**
- **Shared Kernel** -- two contexts share a small subset of the model. Changes require coordination between both teams. Use sparingly; shared kernels become maintenance bottlenecks.
- **Partnership** -- two contexts evolve together with mutual coordination. Both teams align planning and releases.

**Decoupled patterns:**
- **Published Language** -- a well-documented, versioned schema (events, APIs) that serves as the official communication contract.
- **Open Host Service** -- a context exposes a public API designed for general consumption by multiple downstream contexts.
- **Separate Ways** -- contexts have no relationship; they solve their problems independently.`,

    `## Anti-Corruption Layer (ACL)

The ACL is one of the most important tactical patterns for maintaining model integrity at context boundaries.

**What it does:**
The ACL sits between two bounded contexts and translates concepts, data structures, and protocols from one context's language into the other's. It prevents "model leakage" -- where foreign concepts and assumptions infiltrate and corrupt the local model.

**Implementation components:**
- **Facade** -- provides a simplified interface to the external context, hiding its complexity.
- **Adapter** -- converts external data formats into local domain objects.
- **Translator** -- maps between vocabularies (e.g., external "SKU" to local "ProductId").

**Example:**
An e-commerce application integrating with a legacy ERP system:
\`\`\`typescript
// ACL adapter translating ERP concepts to local domain
class ErpOrderAdapter implements OrderPort {
  async getOrder(orderId: OrderId): Promise<Order> {
    const erpData = await this.erpClient.fetchSalesDocument(orderId.value);
    return new Order(
      new OrderId(erpData.doc_number),
      this.translateLineItems(erpData.positions),
      this.translateStatus(erpData.status_code),
      Money.of(erpData.net_value, erpData.currency)
    );
  }

  private translateStatus(erpStatus: string): OrderStatus {
    const mapping: Record<string, OrderStatus> = {
      "10": OrderStatus.CREATED,
      "20": OrderStatus.CONFIRMED,
      "30": OrderStatus.SHIPPED,
      "90": OrderStatus.CANCELLED,
    };
    return mapping[erpStatus] ?? OrderStatus.UNKNOWN;
  }
}
\`\`\`

**When to use an ACL:**
- Integrating with legacy systems whose model you cannot change.
- Consuming third-party APIs with different domain concepts.
- When the upstream model is unstable or poorly designed and you want to insulate your context.`,

    `## Context Boundaries and Microservices

Bounded contexts provide the natural decomposition boundary for microservices.

**Alignment principles:**
- **One bounded context = one service (or a small cluster of services)** -- this ensures each service has a coherent model and clear ownership.
- **Database per context** -- each context owns its data; no shared databases that would couple contexts at the persistence layer.
- **Events as the primary integration mechanism** -- contexts publish domain events at boundaries; other contexts consume and translate them through their ACL.

**Common mistakes:**
- **Too granular** -- splitting a single bounded context into multiple services creates unnecessary inter-service communication for operations that should be local.
- **Too coarse** -- lumping multiple contexts into one service recreates the problems of a monolithic model within a service.
- **Shared database** -- two services accessing the same database tables couples their models and evolution.
- **Distributed monolith** -- services that must be deployed together because of shared state or synchronous dependency chains provide the worst of both worlds.

**Practical guidance:**
Start with a modular monolith where each module represents a bounded context with clear interfaces. When a module needs independent scaling, deployment, or team ownership, extract it into a microservice. The module boundary (already a context boundary) becomes the service boundary with minimal redesign.`,

    `## Evolving Context Boundaries

Bounded context boundaries are not fixed at project inception. They evolve as domain understanding deepens and organizational needs change.

**Signs that boundaries need adjustment:**
- **Frequent cross-context changes** -- if most features require coordinated changes across multiple contexts, boundaries may be wrong.
- **Model clashes within a context** -- if the same entity has conflicting meanings within a single context, it may need splitting.
- **Team friction** -- if multiple teams work in the same context and step on each other, the context may be too large.
- **Unnecessary complexity** -- if a context has become so small that it adds integration overhead without meaningful isolation, consider merging.

**Refactoring strategies:**
- **Context splitting** -- extract a subdomain that has grown complex enough to warrant its own model and team.
- **Context merging** -- combine contexts that have become too fine-grained, especially when they share most of their data and behavior.
- **Boundary redefinition** -- shift where the boundary falls when the current split does not align with how the business actually operates.

**Key insight:** The cost of getting boundaries wrong is proportional to the coupling between contexts. Invest in clean interfaces (events, APIs) so boundaries can be moved without cascading redesigns.`,
  ],
  interviewQA: [
    {
      q: "What is a bounded context and how do you identify one?",
      a: "A bounded context is an explicit boundary within which a domain model is consistent and a specific ubiquitous language applies. Identify them by listening for language shifts in domain conversations (the same word meaning different things to different groups), observing organizational boundaries (different teams or departments), and using event storming to find natural clusters of related domain events. A well-defined bounded context has its own language, model, data store, and team ownership.",
    },
    {
      q: "What is the Anti-Corruption Layer and when should you use it?",
      a: "The ACL is a translation boundary that converts concepts from an external or upstream context into your local domain language, preventing foreign models from contaminating your domain. Use it when integrating with legacy systems, third-party APIs, or upstream contexts whose model is unstable, poorly designed, or simply different from yours. It typically consists of facades, adapters, and translators that map external data structures and terminology to local domain objects.",
    },
    {
      q: "How do bounded contexts relate to microservice boundaries?",
      a: "Bounded contexts provide the natural decomposition boundary for microservices. Each bounded context maps to one service or a small cluster of services, owns its data store, and communicates with other contexts through events or APIs. Start with a modular monolith where each module is a bounded context; extract services when scaling, deployment independence, or team ownership demands it. The module boundary becomes the service boundary with minimal redesign.",
    },
    {
      q: "What is the difference between a Shared Kernel and an Anti-Corruption Layer?",
      a: "A Shared Kernel is a small, jointly owned subset of the domain model that two contexts share directly -- changes require coordination between both teams. An ACL is a one-way translation layer where the downstream context converts upstream concepts into its own language with zero shared model. Shared Kernels create coupling and should be used sparingly for closely collaborating teams. ACLs provide isolation and are preferred when contexts are owned by different teams or evolve at different rates.",
    },
  ],
  followUps: [
    "How do you find a context boundary in an existing system?",
    "What is an anti-corruption layer protecting you from?",
    "Why can the same real-world thing be two different models in two contexts?",
  ],
  mcqs: [
    {
      q: "What is the primary purpose of a bounded context in DDD?",
      options: [
        "To limit the number of classes in a code module",
        "To define an explicit boundary within which a domain model is consistent and a ubiquitous language applies",
        "To restrict database access to authorized users",
        "To create API rate limiting boundaries",
      ],
      answerIndex: 1,
      explanation:
        "A bounded context defines where a particular domain model applies, ensuring terms have precise, consistent meanings within that boundary. Different contexts can have different interpretations of the same business concept.",
    },
    {
      q: "Which context mapping pattern provides the most isolation between contexts?",
      options: [
        "Shared Kernel",
        "Conformist",
        "Anti-Corruption Layer",
        "Partnership",
      ],
      answerIndex: 2,
      explanation:
        "The ACL provides the most isolation by translating all upstream concepts into the downstream context's own language. No upstream model details leak through. Shared Kernel and Partnership require coordination; Conformist adopts the upstream model entirely.",
    },
    {
      q: "What is a 'distributed monolith'?",
      options: [
        "A monolith deployed across multiple data centers for high availability",
        "Services that must be deployed together due to shared state or tight coupling, providing the worst of both architectures",
        "A monolith that uses distributed caching for performance",
        "A single service that processes distributed events",
      ],
      answerIndex: 1,
      explanation:
        "A distributed monolith results from splitting a system into services without proper context boundaries. The services remain tightly coupled -- sharing databases, requiring synchronized deployments -- adding network complexity without gaining independence.",
    },
    {
      q: "When should two bounded contexts use a Shared Kernel?",
      options: [
        "When the contexts are owned by different organizations",
        "When both contexts need a small, jointly maintained subset of the model and their teams collaborate closely",
        "When one context is a legacy system that cannot be modified",
        "When the contexts communicate only through asynchronous events",
      ],
      answerIndex: 1,
      explanation:
        "Shared Kernels are appropriate only when two closely collaborating teams need to share a small subset of the model and can coordinate changes. They create coupling, so they should be used sparingly and only between teams with strong communication.",
    },
  ],
  flashcards: [
    {
      front: "Bounded Context vs. Subdomain",
      back: "A subdomain is a part of the problem space (the business reality). A bounded context is a part of the solution space (the software model). Ideally, they align one-to-one, but in practice a bounded context may cover multiple subdomains or a subdomain may be split across contexts.",
    },
    {
      front: "What is the Conformist pattern?",
      back: "A context mapping pattern where the downstream context adopts the upstream model as-is with no translation. Used when the upstream team has no incentive to accommodate downstream needs and the cost of building an ACL outweighs the cost of conforming.",
    },
    {
      front: "Open Host Service pattern",
      back: "A context exposes a well-defined public API (the 'open host') designed for general consumption by multiple downstream contexts. The API is a stable contract, often paired with a Published Language for the data format.",
    },
    {
      front: "Why avoid shared databases between bounded contexts?",
      back: "Shared databases couple contexts at the persistence layer. Schema changes in one context can break the other. Each context loses the freedom to choose the storage technology that best fits its needs. Use events or APIs for cross-context data access instead.",
    },
    {
      front: "Signs that bounded context boundaries are wrong",
      back: "Frequent cross-context changes for single features, conflicting meanings of the same entity within a context, multiple teams stepping on each other in the same context, or excessive integration overhead from overly fine-grained contexts.",
    },
    {
      front: "What is a Context Map?",
      back: "A visual diagram documenting all bounded contexts in a system and the relationships between them (Customer-Supplier, ACL, Shared Kernel, etc.). It provides a high-level view of system integration architecture.",
    },
    {
      front: "Partnership context mapping pattern",
      back: "Two bounded contexts evolve together with mutual coordination. Both teams align their planning, releases, and model changes. Suitable when contexts are interdependent and teams are co-located or closely collaborating.",
    },
  ],
  deepDive: [
    `## The Linguistics of Bounded Contexts

Bounded contexts are, at their core, a **linguistic construct** before they are a technical one. Eric Evans coined the term because he observed that the biggest source of project failure was not bad code but **ambiguous language**. When two teams say "Customer," they may carry entirely different mental models -- the *billing* team thinks of a **tax entity** with a VAT number and payment terms, while the *support* team thinks of a **person** with a sentiment score and ticket history. A bounded context draws a line and says: "within *this* boundary, the word Customer means exactly *this*, with *these* attributes and *these* behaviors, and nothing else." The ubiquitous language is enforced not by a glossary document gathering dust on Confluence, but by the **code itself** -- class names, method signatures, event names, and database columns all reflect the agreed-upon vocabulary. When you see a pull request that introduces a term from another context without translation, that is a **context leak**, and it should be treated with the same urgency as a security vulnerability. The discipline of maintaining linguistic purity within a boundary is what makes bounded contexts powerful: it ensures that every developer, product manager, and domain expert can communicate without hidden misunderstandings.`,

    `## Strategic Context Mapping in Practice

Context mapping is the **cartography of your system's integration landscape**. In practice, drawing a context map is one of the highest-leverage activities a software architect can perform, yet it is frequently skipped in favor of jumping straight to API design. A good context map captures not just *which* contexts exist but the **power dynamics** between them. An *upstream* context dictates; a *downstream* context adapts. When you integrate with a third-party payment provider like Stripe, you are in a **Conformist** or **ACL** relationship -- Stripe will never change its API to suit your domain model. Internally, two teams building \`Catalog\` and \`Pricing\` might start as **Partners**, co-evolving their models, but as the organization scales, one team inevitably becomes the upstream supplier and the other the downstream consumer. Recognizing this shift early and introducing an **Anti-Corruption Layer** prevents the downstream team from accumulating technical debt in the form of foreign concepts scattered through their codebase. Context maps should be **living documents** -- updated during architecture reviews, referenced during sprint planning, and consulted before any new integration is approved. Teams that maintain accurate context maps consistently make better decomposition decisions and avoid the trap of the *distributed monolith*.`,

    `## Bounded Contexts and the Modular Monolith Strategy

The modern consensus among DDD practitioners is to **start with a modular monolith** rather than microservices. In a modular monolith, each bounded context is implemented as a **separate module** with a well-defined public API (typically a set of interfaces or facade classes), its own internal domain model, and -- critically -- **no direct database access across module boundaries**. Modules communicate through **in-process events** or **explicit service interfaces**, mirroring the integration patterns that would later become network calls. This approach gives you the **design discipline** of microservices without the operational complexity of distributed systems. When a module genuinely needs independent scaling, a different technology stack, or separate team ownership and deployment cadence, you extract it into a service. Because the module already communicates through a clean boundary, the extraction is largely mechanical: replace in-process calls with HTTP/gRPC and in-process events with a message broker. The key insight is that **bounded context boundaries are a design decision, not a deployment decision**. Getting the boundaries right matters far more than whether those boundaries are enforced by process isolation or by module conventions. Teams that skip the modular monolith phase and jump straight to microservices almost always discover their context boundaries are wrong -- and redrawing boundaries across services is an order of magnitude more expensive than refactoring modules within a monolith.`,
  ],

  code: [
    {
      language: "cpp",
      caption: "Anti-Corruption Layer translating an external ERP model into the local Order context",
      source: `#include <string>
#include <unordered_map>
#include <vector>
#include <stdexcept>

// --- External ERP model (upstream context) ---
struct ErpSalesDocument {
    std::string doc_number;
    std::string status_code;   // "10", "20", "30", "90"
    double      net_value;
    std::string currency;
    // ... many ERP-specific fields we do not care about
};

// --- Local Order context (downstream) ---
enum class OrderStatus { Created, Confirmed, Shipped, Cancelled, Unknown };

struct Money {
    double      amount;
    std::string currency;
};

struct Order {
    std::string id;
    OrderStatus status;
    Money       total;
};

// **Anti-Corruption Layer** -- translates ERP concepts into our domain
class ErpOrderAdapter {
public:
    Order translate(const ErpSalesDocument& erp) const {
        return Order{
            .id     = erp.doc_number,
            .status = translateStatus(erp.status_code),
            .total  = Money{ erp.net_value, erp.currency }
        };
    }

private:
    OrderStatus translateStatus(const std::string& code) const {
        static const std::unordered_map<std::string, OrderStatus> mapping = {
            {"10", OrderStatus::Created},
            {"20", OrderStatus::Confirmed},
            {"30", OrderStatus::Shipped},
            {"90", OrderStatus::Cancelled},
        };
        auto it = mapping.find(code);
        return (it != mapping.end()) ? it->second : OrderStatus::Unknown;
    }
};`,
    },
    {
      language: "cpp",
      caption: "Bounded context modules with explicit public interfaces and domain event communication",
      source: `#include <string>
#include <vector>
#include <functional>
#include <iostream>

// ---- Shared infrastructure: lightweight domain event bus ----
struct DomainEvent {
    std::string type;
    std::string payload;   // JSON or serialized data
};

class EventBus {
    std::vector<std::function<void(const DomainEvent&)>> subscribers_;
public:
    void subscribe(std::function<void(const DomainEvent&)> handler) {
        subscribers_.push_back(std::move(handler));
    }
    void publish(const DomainEvent& event) const {
        for (auto& handler : subscribers_) handler(event);
    }
};

// ---- **Catalog** bounded context ----
namespace Catalog {
    struct Product {
        std::string sku;
        std::string name;
        std::string description;
    };

    // Public facade -- the *only* entry point other contexts may use
    class CatalogService {
        EventBus& bus_;
    public:
        explicit CatalogService(EventBus& bus) : bus_(bus) {}

        void registerProduct(const std::string& sku,
                             const std::string& name,
                             const std::string& desc) {
            // ... persist internally ...
            bus_.publish(DomainEvent{
                "catalog.product_registered",
                "{\\"sku\\":\\"" + sku + "\\"}"
            });
        }
    };
}

// ---- **Pricing** bounded context ----
namespace Pricing {
    // Pricing has its *own* view of a product -- only what it needs
    struct PricedItem {
        std::string productRef;   // NOT a Catalog::Product -- translated ID
        double      basePrice;
    };

    class PricingService {
    public:
        explicit PricingService(EventBus& bus) {
            // ACL: consume Catalog events and translate into local concepts
            bus.subscribe([this](const DomainEvent& e) {
                if (e.type == "catalog.product_registered") {
                    onProductRegistered(e.payload);
                }
            });
        }

    private:
        void onProductRegistered(const std::string& payload) {
            // Parse payload, create a *local* PricedItem with default price
            std::cout << "Pricing context: new product registered, "
                      << "creating default price entry.\\n";
        }
    };
}`,
    },
    {
      language: "cpp",
      caption: "Shared Kernel -- a small, jointly owned value object used by two contexts",
      source: `#include <string>
#include <stdexcept>

// **Shared Kernel** -- both Catalog and Pricing agree on this value object.
// Changes here require coordination between *both* teams.
namespace SharedKernel {

    // A strongly-typed SKU that both contexts reference
    class SKU {
        std::string value_;
    public:
        explicit SKU(const std::string& raw) {
            if (raw.empty() || raw.size() > 20)
                throw std::invalid_argument("SKU must be 1-20 characters");
            value_ = raw;
        }

        const std::string& value() const { return value_; }

        bool operator==(const SKU& other) const {
            return value_ == other.value_;
        }
        bool operator!=(const SKU& other) const {
            return !(*this == other);
        }
    };

    // A Money value object shared across financial contexts
    class Money {
        long        cents_;       // store as minor units to avoid floating-point
        std::string currency_;    // ISO 4217 code
    public:
        Money(long cents, const std::string& currency)
            : cents_(cents), currency_(currency) {
            if (currency.size() != 3)
                throw std::invalid_argument("Currency must be ISO 4217");
        }

        long cents()                    const { return cents_; }
        const std::string& currency()   const { return currency_; }

        Money operator+(const Money& other) const {
            if (currency_ != other.currency_)
                throw std::logic_error("Cannot add different currencies");
            return Money(cents_ + other.cents_, currency_);
        }
    };
}`,
    },
  ],

  diagrams: [
    {
      title: "Context Map — E-Commerce System",
      kind: "architecture",
      caption: "Bounded contexts and their integration relationships: Shared Kernel, Open Host Service, ACL, and Conformist.",
      mermaid: `graph TD
    CAT["Catalog Context - Core Domain"]
    PRC["Pricing Context"]
    ORD["Ordering Context"]
    INV["Inventory Context"]
    PAY["Payments Context"]
    SHIP["Shipping Context"]
    ERP["Legacy ERP - External"]
    STRIPE["Stripe - Third Party"]
    CAT -- "Shared Kernel" --- PRC
    CAT -- "Open Host Service" --> ORD
    CAT -- "Open Host Service" --> INV
    ORD -- "Customer-Supplier" --> SHIP
    ORD -- "ACL" --> ERP
    PAY -- "Conformist" --> STRIPE
    ORD -- "Published Language" --> PAY
    INV -- "ACL" --> ERP`,
    },
    {
      title: "Anti-Corruption Layer Internal Flow",
      kind: "flow",
      caption: "The ACL translates the upstream foreign model into the downstream domain model through Facade, Adapter, and Translator.",
      mermaid: `flowchart LR
    API["ERP API - foreign model"]
    FAC["Facade - simplified interface"]
    ADP["Adapter - format conversion"]
    TRN["Translator - vocabulary mapping"]
    DOM["Local Domain Model"]
    API --> FAC --> ADP --> TRN --> DOM`,
    },
    {
      title: "Bounded Context Evolution",
      kind: "state",
      caption: "How a context evolves from a tangled monolith module through a well-defined module to an independent microservice.",
      mermaid: `stateDiagram-v2
    [*] --> Monolith : start
    Monolith --> EventStorming : run event storming workshop
    EventStorming --> ModularMonolith : extract into bounded modules
    ModularMonolith --> Microservice : need independent scaling
    ModularMonolith --> ModularMonolith : team stays aligned
    Microservice --> Microservice : own DB and deploy pipeline`,
    },
    {
      title: "Ubiquitous Language Scope",
      kind: "mindmap",
      caption: "Each bounded context owns its own vocabulary — the same word can mean different things in different contexts.",
      mermaid: `mindmap
  root((Bounded Context))
    Catalog Context
      Product means listing with price
      SKU identifier
    Ordering Context
      Product means ordered line item
      Customer identity
    Shipping Context
      Product means physical parcel
      Address destination
    Payments Context
      Product means chargeable amount
      Invoice reference`,
    },
  ],

  animations: [
    {
      title: "Finding a boundary in an existing system",
      steps: [
        {
          label: "Look for language shifts",
          detail: "Where the same word starts meaning something different, there's a boundary.",
        },
        {
          label: "Look at change patterns",
          detail: "Modules that always change together belong together; ones that never do are separable.",
        },
        {
          label: "Look at ownership",
          detail: "Who is asked when a rule changes? That's a strong signal of a context.",
        },
        {
          label: "Draw the boundary",
          detail: "Define what's inside, and what the context exposes.",
        },
        {
          label: "Anti-corruption layer",
          detail: "Translate at the edge, so another context's model — or a legacy system's — doesn't leak into yours.",
        },
        {
          label: "Then, maybe, split",
          detail: "A bounded context is a modelling boundary. It may or may not become a separate service.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Pattern",
      "Coupling Level",
      "Translation Required",
      "Team Coordination",
      "Best Used When",
    ],
    rows: [
      [
        "**Shared Kernel**",
        "High -- shared code/model",
        "None (same model)",
        "Tight -- joint ownership",
        "Closely collaborating teams sharing a small, stable subset",
      ],
      [
        "**Partnership**",
        "Medium -- mutual dependency",
        "Minimal",
        "Tight -- aligned roadmaps",
        "Two interdependent contexts evolving together",
      ],
      [
        "**Customer-Supplier**",
        "Medium -- one-way dependency",
        "Optional (downstream adapts)",
        "Moderate -- upstream accommodates",
        "Upstream team willing to serve downstream needs",
      ],
      [
        "**Conformist**",
        "Medium -- one-way, no negotiation",
        "None (adopt upstream model)",
        "None -- accept what is given",
        "Upstream will not change; translation cost too high",
      ],
      [
        "**Anti-Corruption Layer**",
        "Low -- full isolation",
        "Full translation at boundary",
        "None -- teams are independent",
        "Legacy integration, third-party APIs, unstable upstream",
      ],
      [
        "**Open Host Service**",
        "Low -- stable public API",
        "Published Language as contract",
        "Minimal -- API versioning only",
        "One context serving many downstream consumers",
      ],
      [
        "**Separate Ways**",
        "None -- no relationship",
        "N/A",
        "None",
        "Contexts genuinely have no integration need",
      ],
    ],
  },

  exercises: [
    "**Context Discovery Exercise:** Take a familiar domain (e.g., a university system) and identify at least **four bounded contexts**. For each context, list the *ubiquitous language* terms, key entities, and which team would own it. Draw a **context map** showing the relationships (ACL, Shared Kernel, etc.) between them.",
    "**ACL Implementation:** You are integrating with a third-party weather API that returns temperatures in Fahrenheit, wind speed in mph, and uses numeric status codes (`1` = clear, `2` = cloudy, `3` = rain). Write a C++ **Anti-Corruption Layer** that translates these into your local domain model using Celsius, km/h, and a `WeatherCondition` enum.",
    "**Boundary Refactoring:** Given a monolithic e-commerce codebase where `Product` has fields for catalog info (`name`, `description`, `images`), pricing info (`basePrice`, `discountRules`), and inventory info (`warehouseLocation`, `stockCount`), refactor it into **three bounded contexts** with separate `Product` representations in each. Define the **domain events** that flow between them.",
    "**Context Map Analysis:** A startup has these services: *UserAuth*, *ProfileManager*, *ContentFeed*, *Notifications*, *Analytics*, and *BillingGateway*. The *ContentFeed* directly queries the *ProfileManager* database for user display names. The *BillingGateway* conforms to Stripe's model. *Analytics* consumes events from all other services. Identify the **context mapping patterns** in use, point out the **anti-pattern**, and propose a fix.",
    "**Shared Kernel Design:** Two teams (Catalog and Pricing) need to share a `Money` value object and a `SKU` identifier. Design a **Shared Kernel** in C++ with proper value semantics, validation, and equality. Discuss the **governance rules** -- who approves changes, how are they versioned, and what happens when one team needs an incompatible change.",
  ],

  cheatSheet: [
    "**One context = one ubiquitous language.** If the same word means different things, you have crossed a context boundary. Never force a single model to serve multiple meanings.",
    "**ACL = Facade + Adapter + Translator.** The Facade simplifies the external interface, the Adapter converts data formats, and the Translator maps vocabulary. Together they prevent upstream model leakage.",
    "**Start modular monolith, extract services later.** Each module is a bounded context with a public facade, private internals, and no cross-module database access. Extract to a microservice only when scaling, deployment, or team ownership demands it.",
    "**Context map power dynamics matter.** Upstream dictates, downstream adapts. Know whether you are in a *Customer-Supplier* (negotiable), *Conformist* (take it or leave it), or *ACL* (translate and isolate) relationship.",
    "**Shared Kernels are high-maintenance.** Only share a kernel when both teams are tightly collaborating and the shared subset is small and stable. Prefer duplication over coupling when in doubt.",
    "**Domain events are the primary cross-context integration mechanism.** Contexts publish events at boundaries; consumers translate through their ACL. This keeps contexts temporally decoupled and independently deployable.",
  ],

  revisionNotes: [
    "A **bounded context** defines where a domain model applies and where a specific **ubiquitous language** is valid. It is both a *linguistic* and *technical* boundary -- same word, different context, different meaning.",
    "**Context mapping** documents the relationships between bounded contexts: *Shared Kernel* (jointly owned model), *Customer-Supplier* (upstream accommodates), *Conformist* (downstream conforms), *ACL* (downstream translates), *Partnership* (mutual evolution), *Open Host Service* (public API), *Published Language* (versioned schema), and *Separate Ways* (no relationship).",
    "The **Anti-Corruption Layer** (ACL) is the most important integration pattern for maintaining model integrity. It consists of a **Facade** (simplified interface), **Adapter** (format conversion), and **Translator** (vocabulary mapping). Use it for legacy systems, third-party APIs, and any upstream whose model you want to isolate from.",
    "**Modular monolith first, microservices second.** Each bounded context becomes a module with a public interface, private domain model, and its own data store. Extract to a service only when you need independent scaling, deployment cadence, or team ownership. The module boundary becomes the service boundary.",
    "**Signs of wrong boundaries:** frequent cross-context changes for single features, conflicting entity meanings within one context, multiple teams colliding in the same context, or excessive integration overhead from over-splitting. Boundaries should be **refactored** (split, merge, or redefine) as domain understanding evolves.",
  ],

  resources: [
    {
      label: "Domain-Driven Design — Eric Evans",
      kind: "book",
    },
    {
      label: "BoundedContext — Martin Fowler",
      kind: "article",
    },
  ],
  glossary: [
    {
      term: "Bounded Context",
      definition:
        "An explicit boundary within which a domain model is defined and applicable. Each context has its own ubiquitous language, model, and typically its own team and data store.",
    },
    {
      term: "Context Map",
      definition:
        "A diagram or document that shows all bounded contexts in a system and the relationships (integration patterns) between them.",
    },
    {
      term: "Anti-Corruption Layer (ACL)",
      definition:
        "A translation boundary that converts concepts from an external context into the local context's domain language, preventing model contamination.",
    },
    {
      term: "Shared Kernel",
      definition:
        "A small, jointly owned subset of the domain model shared by two bounded contexts. Changes require coordination between both teams.",
    },
    {
      term: "Published Language",
      definition:
        "A well-documented, versioned schema (event contracts, API specifications) used as the official communication format between bounded contexts.",
    },
    {
      term: "Conformist",
      definition:
        "A context mapping pattern where the downstream context adopts the upstream model as-is without translation, accepting the upstream team's design decisions.",
    },
    {
      term: "Open Host Service",
      definition:
        "A bounded context that exposes a well-defined, stable public API designed for consumption by multiple downstream contexts.",
    },
  ],
};
