import type { TopicContent } from "../types";

export const refactoringSafely: TopicContent = {
  quickSummary: [
    "Refactoring is restructuring existing code without changing its observable behavior — the key word is 'observable', meaning all existing tests must still pass and all external contracts must remain identical after every change.",
    "The golden rule is: never refactor without a safety net. That safety net is a combination of automated tests (unit, integration, contract), version control discipline (small commits, feature branches), and CI/CD pipelines that catch regressions within minutes.",
    "Prefer many small, reversible refactoring steps over one large rewrite. Each step should compile, pass tests, and be independently deployable. If any step breaks something, you revert that single commit — not an entire week of work.",
    "The Strangler Fig pattern lets you refactor or replace legacy systems incrementally in production by routing traffic gradually from old code to new code, avoiding a risky big-bang cutover.",
  ],
  detailed: [
    "Test coverage before refactoring is non-negotiable. Before touching any code, establish a characterization test suite — tests that document the current behavior, including edge cases and known quirks. Michael Feathers calls this 'getting the code into a test harness' in Working Effectively with Legacy Code. If the code has no tests, your first job is to write them. Measure coverage not just by line percentage but by branch coverage and mutation testing scores. A module with 90% line coverage but 30% mutation score gives you false confidence — mutants that survive mean your tests do not actually verify the behavior you are about to change.",
    "Small steps are the discipline that separates safe refactoring from risky editing. Martin Fowler's refactoring catalog lists dozens of named transformations (Extract Method, Inline Variable, Move Field, Replace Conditional with Polymorphism) and each one is designed to be atomic: apply it, run tests, commit. If tests break, revert immediately. This red-green-refactor rhythm keeps your codebase in a working state at all times. IDE refactoring tools (IntelliJ's rename, VS Code's extract function) automate many of these steps and handle all reference updates, reducing the chance of manual errors.",
    "Version control discipline means treating your commit history as a refactoring journal. Each commit should contain exactly one refactoring step with a descriptive message: 'Extract PaymentProcessor from OrderService', not 'refactoring'. Use feature branches or short-lived branches so that main/trunk always compiles and passes. Squash-merge only when the intermediate history has no diagnostic value. If you are refactoring and adding features simultaneously, separate the two into different commits or pull requests — mixing them makes code review nearly impossible and makes bisecting regressions much harder.",
    "Feature flags (feature toggles) are essential for large refactoring efforts in production systems. They let you deploy new code paths alongside old ones and switch between them at runtime without redeploying. You can enable the new path for a percentage of users (canary), for internal users only, or for specific tenants. If the new code path has a bug, you flip the flag back to the old path instantly. LaunchDarkly, Unleash, and even simple environment variables can serve as feature flag systems. The key discipline is to clean up stale flags — every flag should have an expiration date and an owner.",
    "The Strangler Fig pattern, named by Martin Fowler after a tropical fig that grows around a host tree and eventually replaces it, is the safest approach for replacing legacy systems. You build new functionality alongside the old system, route specific requests or features to the new code, and gradually expand until the old system handles nothing. This works at every scale: replacing a single class, a microservice, or an entire monolith. The critical infrastructure is a routing layer (API gateway, proxy, or facade) that can direct traffic to old or new implementations based on feature, user, or percentage.",
  ],
  deepDive: [
    "Refactoring versus rewriting is a decision with enormous consequences. Joel Spolsky's famous essay 'Things You Should Never Do' argues that rewrites destroy years of accumulated bug fixes and domain knowledge embedded in the old code. A rewrite also has no intermediate deliverable — it is all-or-nothing, and the old system keeps evolving while you rewrite, creating a moving target. However, there are cases where refactoring is genuinely not viable: when the technology stack is obsolete (COBOL with no maintainers), when the architecture fundamentally cannot support new requirements (a single-threaded system that must become concurrent), or when the codebase is so tangled that every change takes orders of magnitude longer than it should. In these cases, a Strangler Fig migration — which is technically a controlled rewrite, not a refactor — is the safest path.",
    "Knowing when NOT to refactor is as important as knowing how. Do not refactor code that works, has no upcoming changes, and nobody needs to understand. Do not refactor in the middle of a production incident — stabilize first. Do not refactor without stakeholder buy-in: if the team or manager sees refactoring as wasted time, the effort will be cut short, leaving the code in a worse half-refactored state. Do not refactor code you do not understand yet — read it, write characterization tests, and build a mental model first. And never refactor to satisfy aesthetic preferences alone; there must be a concrete benefit: reduced bug rate, faster feature delivery, improved performance, or reduced cognitive load for the team.",
    "CI/CD integration is what makes safe refactoring possible at scale. Every refactoring commit should trigger a pipeline that runs unit tests, integration tests, contract tests, and static analysis. The pipeline should catch not just functional regressions but also performance regressions (via benchmark tests), API contract breaks (via consumer-driven contract tests like Pact), and dependency issues. Trunk-based development with short-lived feature branches and merge queues ensures that the main branch is always deployable. If your pipeline takes more than 10 minutes, you will be tempted to skip it — invest in parallelization, test splitting, and caching to keep feedback fast. Blue-green deployments or canary releases add another layer of safety: even if your tests miss a regression, you catch it in production with real traffic before it affects all users.",
    "Parallel change (also called expand-and-contract) is a technique for refactoring interfaces that have external consumers. Instead of changing the interface in one step (which breaks all callers), you expand the interface to support both old and new signatures, migrate all callers to the new signature, then contract by removing the old signature. In APIs, this means supporting both v1 and v2 simultaneously, with deprecation warnings on v1. In databases, this means adding a new column, writing dual-write code, backfilling, switching reads, then dropping the old column. Each phase is a separate deployment, and at every point both old and new code paths work correctly.",
  ],
  code: [
    {
      language: "java",
      caption:
        "Characterization tests: capturing legacy behavior before refactoring",
      source: `// Before refactoring PricingEngine, write characterization tests
// that document CURRENT behavior — including bugs you discover.
public class PricingEngineCharacterizationTest {

    private PricingEngine engine;

    @BeforeEach
    void setUp() {
        engine = new PricingEngine(
            new InMemoryProductCatalog(),
            new StubTaxService(),
            new StubDiscountProvider()
        );
    }

    // Characterization test: document exact current behavior
    @Test
    void bulkDiscountAppliedAbove100Units() {
        Order order = OrderBuilder.anOrder()
            .withProduct("SKU-100", 150, Money.of(10.00))
            .build();
        Invoice invoice = engine.calculatePrice(order);
        // Current behavior: 15% bulk discount above 100 units
        assertThat(invoice.totalBeforeTax())
            .isEqualTo(Money.of(1275.00)); // 150 * 10.00 * 0.85
    }

    // Characterization test: document a known quirk
    @Test
    void negativeQuantityTreatedAsZero_quirk() {
        Order order = OrderBuilder.anOrder()
            .withProduct("SKU-100", -5, Money.of(10.00))
            .build();
        Invoice invoice = engine.calculatePrice(order);
        // Known quirk: negative qty gives $0, no exception thrown
        assertThat(invoice.totalBeforeTax())
            .isEqualTo(Money.of(0.00));
    }

    // Boundary test: exact threshold
    @Test
    void bulkDiscountNotAppliedAtExactly100Units() {
        Order order = OrderBuilder.anOrder()
            .withProduct("SKU-100", 100, Money.of(10.00))
            .build();
        Invoice invoice = engine.calculatePrice(order);
        // Current behavior: discount is > 100, NOT >= 100
        assertThat(invoice.totalBeforeTax())
            .isEqualTo(Money.of(1000.00)); // no discount at exactly 100
    }

    // Mutation testing: verify tests are actually sensitive to changes
    // Run: mvn pitest:mutationCoverage
    // Target: > 80% mutation score before starting refactoring
}`,
    },
    {
      language: "typescript",
      caption:
        "Feature flag controlled refactoring: old and new code paths side by side",
      source: `// feature-flags.ts — simple feature flag service
interface FeatureFlagService {
  isEnabled(flag: string, context?: { userId?: string }): boolean;
}

// payment-processor.ts — using flags to safely swap implementations
class PaymentService {
  constructor(
    private legacyProcessor: LegacyPaymentProcessor,
    private newProcessor: StripePaymentProcessor,
    private flags: FeatureFlagService,
    private metrics: MetricsClient,
    private logger: Logger
  ) {}

  async processPayment(payment: Payment): Promise<PaymentResult> {
    const useNewProcessor = this.flags.isEnabled("use-stripe-processor", {
      userId: payment.userId,
    });

    if (useNewProcessor) {
      try {
        const result = await this.newProcessor.charge(payment);
        this.metrics.increment("payment.new_processor.success");
        return result;
      } catch (error) {
        this.metrics.increment("payment.new_processor.failure");
        this.logger.error("New processor failed, falling back", { error, payment });
        // Fallback to legacy on failure during migration
        return this.legacyProcessor.charge(payment);
      }
    }

    return this.legacyProcessor.charge(payment);
  }
}

// Parallel validation: run both, compare, but only return legacy result
async processPaymentWithShadow(payment: Payment): Promise<PaymentResult> {
  const legacyResult = await this.legacyProcessor.charge(payment);

  if (this.flags.isEnabled("shadow-test-stripe")) {
    // Fire-and-forget: run new processor to compare results
    this.newProcessor.dryRun(payment).then((newResult) => {
      if (!deepEqual(legacyResult, newResult)) {
        this.logger.warn("Shadow mismatch", {
          legacy: legacyResult,
          new: newResult,
          paymentId: payment.id,
        });
        this.metrics.increment("payment.shadow.mismatch");
      } else {
        this.metrics.increment("payment.shadow.match");
      }
    }).catch((err) => {
      this.metrics.increment("payment.shadow.error");
    });
  }

  return legacyResult; // always return legacy during shadow testing
}`,
    },
    {
      language: "cpp",
      caption:
        "Strangler Fig pattern: gradually migrating a monolith endpoint",
      source: `// strangler_proxy.cpp — routing layer that migrates traffic incrementally
#include <string>
#include <unordered_map>
#include <functional>
#include <chrono>
#include <random>
#include <iostream>

// Configuration for each endpoint's migration state
struct MigrationEntry {
    std::string new_service;
    int percentage; // 0-100
};

const std::unordered_map<std::string, MigrationEntry> MIGRATION_CONFIG = {
    {"/api/users",     {"http://users-v2:8080",     100}},
    {"/api/orders",    {"http://orders-v2:8080",      50}},
    {"/api/inventory", {"http://inventory-v2:8080",    0}},
};
const std::string LEGACY_SERVICE = "http://monolith:3000";

// Forward declarations
void emit_metric(const std::string& name,
                 const std::unordered_map<std::string, std::string>& tags);

bool should_route_to_new(const std::string& endpoint,
                         const std::string& user_id = "") {
    auto it = MIGRATION_CONFIG.find(endpoint);
    if (it == MIGRATION_CONFIG.end() || it->second.percentage == 0)
        return false;
    if (it->second.percentage == 100)
        return true;
    // Deterministic routing by user_id for session consistency
    if (!user_id.empty()) {
        size_t h = std::hash<std::string>{}(user_id);
        return (h % 100) < static_cast<size_t>(it->second.percentage);
    }
    static thread_local std::mt19937 rng{std::random_device{}()};
    std::uniform_int_distribution<int> dist(1, 100);
    return dist(rng) <= it->second.percentage;
}

// Simplified proxy handler (conceptual — use cpp-httplib, Crow, or Drogon)
struct ProxyResult {
    std::string body;
    int status_code;
    std::unordered_map<std::string, std::string> headers;
};

ProxyResult proxy(const std::string& method,
                  const std::string& path,
                  const std::unordered_map<std::string, std::string>& req_headers,
                  const std::string& req_body) {
    // Extract top-level endpoint from path, e.g. "/api/orders"
    std::string endpoint = "/api/" + path.substr(0, path.find('/'));
    std::string full_path = "/api/" + path;

    std::string user_id;
    if (auto it = req_headers.find("X-User-Id"); it != req_headers.end())
        user_id = it->second;

    std::string target_url = LEGACY_SERVICE;
    if (should_route_to_new(endpoint, user_id)) {
        target_url = MIGRATION_CONFIG.at(endpoint).new_service;
    }

    // Forward the request (pseudocode — use an HTTP client library)
    auto start = std::chrono::steady_clock::now();
    // auto resp = http_client::request(method, target_url + full_path, ...);
    auto end = std::chrono::steady_clock::now();
    double duration_ms =
        std::chrono::duration<double, std::milli>(end - start).count();

    // Emit metrics for monitoring migration health
    emit_metric("proxy.request", {
        {"endpoint",    endpoint},
        {"target",      target_url != LEGACY_SERVICE ? "new" : "legacy"},
        {"status",      "200" /* resp.status_code */},
        {"duration_ms", std::to_string(duration_ms)},
    });

    return {"/* response body */", 200, {}};
}

void emit_metric(const std::string& name,
                 const std::unordered_map<std::string, std::string>& tags) {
    // Send metric to monitoring system (Datadog, Prometheus, etc.)
    // Implementation depends on your monitoring stack
}`,
    },
  ],
  diagrams: [
    {
      title: "Safe Refactoring Workflow",
      kind: "flow",
      caption: "The recommended process for refactoring safely: ensure tests pass first, make small incremental changes, and verify at each step.",
      mermaid: `flowchart TD
    A([Start refactoring]) --> B{Tests passing?}
    B -->|No| C[Fix failing tests first]
    C --> B
    B -->|Yes| D[Identify smallest change]
    D --> E[Make the change]
    E --> F[Run tests]
    F --> G{Tests pass?}
    G -->|No| H[Revert change]
    H --> D
    G -->|Yes| I{More to refactor?}
    I -->|Yes| D
    I -->|No| J([Refactoring complete])`,
    },
    {
      title: "Refactoring Safety Net Layers",
      kind: "architecture",
      caption: "Multiple layers of safety that enable confident refactoring: automated tests, version control, feature flags, and continuous integration.",
      mermaid: `graph TD
    A[Refactoring Change] --> B[Unit Tests]
    A --> C[Integration Tests]
    A --> D[Version Control - Git]
    B --> E[CI Pipeline]
    C --> E
    D --> F[Easy Revert]
    E --> G{All Checks Pass?}
    G -->|Yes| H[Merge Safely]
    G -->|No| I[Investigate and Fix]
    I --> A`,
    },
    {
      title: "Strangler Fig Pattern for Large Refactors",
      kind: "sequence",
      caption: "Gradually replace legacy code by routing traffic to new implementation. Old and new code coexist until migration is complete.",
      mermaid: `sequenceDiagram
    participant Client
    participant Router
    participant Legacy as Legacy System
    participant New as New Implementation

    Client->>Router: Request
    Note over Router: Phase 1 - All to Legacy
    Router->>Legacy: Forward all
    Legacy-->>Client: Response

    Note over Router: Phase 2 - Partial migration
    Router->>New: Forward new features
    New-->>Client: Response

    Note over Router: Phase 3 - Full migration
    Router->>New: Forward all
    New-->>Client: Response`,
    },
    {
      title: "Refactoring Risk Assessment",
      kind: "state",
      caption: "State machine showing how a refactoring task moves through risk levels and validation stages before being considered safe to ship.",
      mermaid: `stateDiagram-v2
    [*] --> Identified
    Identified --> Assessed: Scope analyzed
    Assessed --> TestsCovered: Tests written
    TestsCovered --> InProgress: Refactoring started
    InProgress --> UnderReview: Change complete
    UnderReview --> Validated: Tests and review pass
    UnderReview --> Reverted: Issues found
    Reverted --> Identified: Re-scope
    Validated --> [*]`,
    },
  ],
  animations: [
    {
      title: "Safe Refactoring Workflow: Extract Method Step by Step",
      steps: [
        {
          label: "Identify the target",
          detail:
            "Locate a long method (e.g., processOrder is 80 lines). Read through it and identify a cohesive block of code that performs a single responsibility — for example, lines 34-52 calculate shipping costs based on weight, destination, and shipping tier.",
        },
        {
          label: "Write characterization tests",
          detail:
            "Before touching the code, write tests that capture the current behavior of the block you want to extract. Test normal cases, edge cases (zero weight, international shipping, free shipping tier), and any known quirks. Run mutation testing to ensure test sensitivity.",
        },
        {
          label: "Run all tests (green baseline)",
          detail:
            "Execute the full test suite and confirm everything passes. This is your green baseline. Commit this state with the message 'Add characterization tests for shipping calculation in processOrder'. You now have a safe revert point.",
        },
        {
          label: "Extract the method",
          detail:
            "Use your IDE's Extract Method refactoring (IntelliJ: Ctrl+Alt+M, VS Code: Ctrl+Shift+R). Select lines 34-52, name the new method 'calculateShippingCost', let the IDE determine parameters (weight, destination, tier) and return type (Money). The IDE updates all references automatically.",
        },
        {
          label: "Run all tests again",
          detail:
            "Execute the full test suite. If everything passes, the extraction preserved behavior. If anything fails, undo the extraction immediately (Ctrl+Z or git checkout) and investigate why — often the IDE missed a side effect or the block modifies shared state.",
        },
        {
          label: "Commit the extraction",
          detail:
            "Commit with message 'Extract calculateShippingCost from processOrder'. This commit contains exactly one refactoring step. If anything goes wrong later, you can revert this single commit without losing other work.",
        },
        {
          label: "Improve the extracted method",
          detail:
            "Now that calculateShippingCost is isolated, you can refactor it further: simplify conditionals, add parameter validation, improve naming. Each improvement is a separate commit. The characterization tests ensure you do not change behavior.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Aspect",
      "Refactoring",
      "Rewriting",
      "Strangler Fig Migration",
    ],
    rows: [
      [
        "Risk level",
        "Low — each step is small and reversible",
        "Very high — all-or-nothing big bang",
        "Low to moderate — incremental migration with rollback",
      ],
      [
        "Delivery timeline",
        "Continuous — improvements delivered incrementally",
        "Long — no value delivered until rewrite is complete",
        "Gradual — new features available as each slice migrates",
      ],
      [
        "Knowledge preservation",
        "High — existing code and bug fixes are preserved",
        "Low — risk of losing years of embedded domain knowledge",
        "Moderate — old code remains as reference during migration",
      ],
      [
        "Team productivity during change",
        "Normal — team can ship features alongside refactoring",
        "Halved — team split between maintaining old and building new",
        "Mostly normal — new features built on new system",
      ],
      [
        "Test requirement",
        "Existing tests must be comprehensive before starting",
        "New test suite must be built from scratch",
        "Both old and new systems need tests plus integration tests at the seam",
      ],
      [
        "When to choose",
        "Architecture is sound but code quality is poor",
        "Technology is obsolete or architecture is fundamentally wrong",
        "System is large, must stay live, and migration will take months",
      ],
    ],
  },
  interviewQA: [
    {
      q: "How do you approach refactoring a large legacy codebase that has no tests?",
      a: "You start by identifying the specific area you need to change and write characterization tests around it — tests that document the current behavior, not the desired behavior. Use techniques from Michael Feathers' Working Effectively with Legacy Code: find seams in the code where you can inject test doubles without modifying the production code (constructor injection, subclass-and-override, extract interface). Aim for high mutation testing scores on the area you are about to refactor, not just line coverage. Only after you have a reliable safety net do you begin making small, named refactoring steps (Extract Method, Replace Conditional with Polymorphism), running tests after each step.",
      followUps: [
        "What is a seam in the context of legacy code, and what types of seams exist?",
        "How would you prioritize which parts of a legacy system to refactor first?",
        "What is the difference between characterization tests and specification tests?",
      ],
    },
    {
      q: "When would you choose to rewrite a system rather than refactor it?",
      a: "A rewrite is justified when the technology stack is genuinely obsolete (no available developers, no security patches, no library support), when the architecture fundamentally cannot support new requirements (a single-process system that must become distributed), or when the cost of every change is so high that the system has negative velocity — every feature takes longer than building it from scratch would. However, even in these cases, I would not do a big-bang rewrite. I would use the Strangler Fig pattern: build the new system incrementally, route traffic gradually, and decommission the old system piece by piece. The key metric is: can the team deliver value continuously throughout the migration, or is there a long period of zero delivery?",
      followUps: [
        "How do you convince stakeholders that a rewrite is necessary versus just more development time?",
        "What are the risks of the 'second system effect' in rewrites?",
      ],
    },
    {
      q: "How do feature flags help with safe refactoring?",
      a: "Feature flags decouple deployment from release. You deploy the new refactored code path to production behind a flag set to off. Then you enable it incrementally: first for internal users, then for a small percentage of production traffic (canary), then for everyone. If metrics show problems (increased error rate, higher latency, incorrect results), you flip the flag back instantly — no rollback deployment needed. For critical refactorings, I use shadow mode: the old path handles all real traffic, but the new path runs in parallel on a copy of the request, and the results are compared. Mismatches are logged and investigated before enabling the new path for real traffic. The discipline is to always clean up flags after migration — every flag should have an expiration date and an owner.",
      followUps: [
        "What are the risks of accumulating too many feature flags?",
        "How do you test all the different flag combinations?",
      ],
    },
    {
      q: "Explain the Strangler Fig pattern and when you would use it.",
      a: "The Strangler Fig pattern places a routing layer (API gateway, reverse proxy, or facade) in front of a legacy system. New functionality is built in a new system, and the routing layer directs specific requests to the new system while everything else continues to go to the legacy system. Over time, more and more routes are migrated until the legacy system handles nothing and can be decommissioned. I would use it when replacing a large system that must stay live during migration — for example, migrating a monolith to microservices. The routing layer is the critical piece: it must support percentage-based routing, user-based routing, and instant rollback. You also need comprehensive monitoring at the routing layer to compare error rates and latency between old and new paths.",
      followUps: [
        "How do you handle shared state (like a database) during a Strangler Fig migration?",
        "What happens when the old and new systems need to share session state?",
      ],
    },
    {
      q: "How do you ensure refactoring does not break your CI/CD pipeline or production systems?",
      a: "First, the CI pipeline must run the full test suite on every commit — unit tests, integration tests, and contract tests. I add specific regression tests for any behavior I am about to refactor. For API changes, I use consumer-driven contract tests (Pact) so that refactoring an API does not break any consumer. I run performance benchmarks in CI to catch performance regressions — a refactoring that makes code cleaner but 10x slower is not safe. The deployment pipeline should use progressive delivery: blue-green or canary deployments that expose new code to a small percentage of traffic first. Monitoring and alerting must be in place to detect increases in error rates, latency, or resource usage within minutes of deployment. The pipeline should support automatic rollback if key metrics degrade beyond thresholds.",
      followUps: [
        "How do you handle database schema changes during refactoring without breaking the pipeline?",
        "What is the role of contract testing in safe refactoring?",
      ],
    },
    {
      q: "What is the parallel change (expand-and-contract) pattern?",
      a: "Parallel change is a technique for safely modifying interfaces that have multiple consumers. Instead of changing the interface in one step (which breaks all callers), you expand the interface to support both old and new shapes simultaneously. Then you migrate all callers to use the new shape, verifying each migration independently. Finally, you contract by removing the old shape once no callers remain. In a REST API, this means supporting both the old and new request/response formats, adding a deprecation header to the old format, and removing the old format after all clients have migrated. In a database, this means adding new columns, running dual-writes, backfilling data, switching reads, and then dropping old columns — each step is a separate, reversible deployment.",
      followUps: [
        "How long should you maintain the expanded interface before contracting?",
        "How do you handle expand-and-contract for a database with billions of rows?",
      ],
    },
  ],
  followUps: [
    "How do you measure the ROI of refactoring — what metrics prove it was worth the investment?",
    "What is the relationship between technical debt, refactoring, and the concept of 'code entropy'?",
    "How do you refactor across microservice boundaries when the change spans multiple services?",
    "What role does static analysis (linting, type checking, architectural fitness functions) play in preventing the need for future refactoring?",
    "How do you handle database schema refactoring (rename columns, split tables, change relationships) safely in production?",
    "What is the difference between opportunistic refactoring (Boy Scout Rule) and planned refactoring sprints, and when is each appropriate?",
    "How does trunk-based development change your approach to refactoring compared to long-lived feature branches?",
  ],
  mcqs: [
    {
      q: "What should you do FIRST before starting to refactor a module?",
      options: [
        "Create a new branch and start making changes",
        "Write or verify comprehensive tests for the module's current behavior",
        "Read Martin Fowler's Refactoring book",
        "Get approval from the product manager",
      ],
      answerIndex: 1,
      explanation:
        "Tests are the safety net that allows you to refactor with confidence. Without tests that verify current behavior (characterization tests), you have no way to confirm that your refactoring preserved correctness. The tests must be in place and passing before you change any production code.",
    },
    {
      q: "Which pattern incrementally replaces a legacy system by routing traffic between old and new implementations?",
      options: [
        "Observer pattern",
        "Strangler Fig pattern",
        "Adapter pattern",
        "Circuit Breaker pattern",
      ],
      answerIndex: 1,
      explanation:
        "The Strangler Fig pattern uses a routing layer to gradually shift traffic from a legacy system to a new system. Named by Martin Fowler after a tropical fig vine that grows around and eventually replaces its host tree. It avoids the risk of a big-bang rewrite by allowing incremental migration with rollback capability.",
    },
    {
      q: "In the parallel change (expand-and-contract) pattern, what is the correct order of phases?",
      options: [
        "Contract old interface, expand new interface, migrate callers",
        "Migrate callers, expand new interface, contract old interface",
        "Expand interface to support both old and new, migrate callers, contract by removing old",
        "Remove old interface, build new interface, update callers",
      ],
      answerIndex: 2,
      explanation:
        "The three phases must happen in order: (1) Expand — add the new interface alongside the old so both work simultaneously. (2) Migrate — move all callers to the new interface. (3) Contract — remove the old interface once no callers remain. Each phase is a separate deployment, and the system works correctly at every point.",
    },
    {
      q: "Which of the following is a valid reason to NOT refactor?",
      options: [
        "The code is ugly but stable, rarely changed, and not blocking any work",
        "The code has high test coverage",
        "The code is in a frequently modified module",
        "The code has multiple known bugs",
      ],
      answerIndex: 0,
      explanation:
        "Refactoring has a cost, and the return on that cost comes from future changes. Code that is stable, rarely changed, and not impeding anyone does not benefit from refactoring — the investment will not pay off. Refactoring should target code that is actively worked on, hard to understand, or causing bugs.",
    },
    {
      q: "What does mutation testing measure that line coverage does not?",
      options: [
        "How fast the tests run",
        "Whether the tests actually detect changes (mutations) in the code",
        "How many lines of code are executed",
        "Whether the code compiles correctly",
      ],
      answerIndex: 1,
      explanation:
        "Mutation testing introduces small changes (mutations) to the code — like changing > to >=, or true to false — and checks whether any test fails. If a mutation survives (no test fails), the tests do not actually verify that behavior. A codebase can have 95% line coverage but low mutation scores, meaning the tests run the code but do not assert on its results.",
    },
    {
      q: "What is the primary risk of refactoring and adding features in the same commit?",
      options: [
        "The commit message will be too long",
        "It is impossible to separate a refactoring regression from a feature bug during bisection",
        "The CI pipeline will run slower",
        "Code reviewers will be more impressed",
      ],
      answerIndex: 1,
      explanation:
        "When refactoring and feature work are mixed in one commit, a regression could be caused by either the refactoring or the new feature. Git bisect becomes useless because you cannot isolate which change introduced the bug. Separating them into distinct commits allows you to revert the refactoring independently and pinpoint problems precisely.",
    },
  ],
  exercises: [
    "Take an existing method in your codebase that is longer than 30 lines. Without modifying any behavior: (1) write characterization tests covering all branches and edge cases, (2) run mutation testing and achieve at least 80% mutation kill rate, (3) extract at least two well-named private methods using your IDE's refactoring tools, (4) commit each extraction separately, and (5) verify all tests still pass after each commit.",
    "Implement the Strangler Fig pattern for a simple REST API: create a proxy service that routes /api/users to a new implementation and /api/orders to the legacy implementation. Add percentage-based routing so you can control what fraction of user requests go to the new service. Include health check endpoints and a dashboard showing the routing split.",
    "Practice the parallel change (expand-and-contract) pattern on a database: (1) add a new 'full_name' column alongside existing 'first_name' and 'last_name' columns, (2) write dual-write code that populates both old and new, (3) create a backfill migration, (4) switch all reads to use 'full_name', (5) remove the old columns. Write tests for each phase and perform each as a separate migration/deployment.",
    "Set up a feature flag system for a web application: implement a FeatureFlagService that reads flags from a configuration file, build a toggle for switching between two implementations of a service, add metrics tracking for each code path, implement a fallback mechanism if the new path fails, and add an admin endpoint to flip flags at runtime without redeployment.",
  ],
  flashcards: [
    {
      front: "What is a characterization test?",
      back: "A test that documents the current actual behavior of existing code, including quirks and bugs. It is written before refactoring to create a safety net — if the test breaks after a refactoring step, the refactoring changed behavior. Coined by Michael Feathers in Working Effectively with Legacy Code.",
    },
    {
      front: "What is the Strangler Fig pattern?",
      back: "An incremental migration strategy where a routing layer (proxy/gateway) sits in front of a legacy system and gradually redirects traffic to a new system. Named by Martin Fowler after a vine that grows around a host tree. Traffic shifts from 0% new to 100% new over time, with rollback possible at every step.",
    },
    {
      front: "What is mutation testing?",
      back: "A technique that evaluates test quality by making small changes (mutations) to the source code — such as flipping operators, changing constants, or negating conditions — and checking if any test fails. Surviving mutants indicate gaps in test assertions. Tools: PIT (Java), Stryker (JS/TS), mutmut (Python).",
    },
    {
      front: "What is the parallel change (expand-and-contract) pattern?",
      back: "A safe way to modify interfaces with external consumers: (1) Expand the interface to support both old and new shapes, (2) Migrate all callers to the new shape, (3) Contract by removing the old shape. Each phase is a separate, reversible deployment. Also called 'expand and contract'.",
    },
    {
      front: "Why should refactoring and feature work be in separate commits?",
      back: "Mixing them makes it impossible to determine whether a regression was caused by the refactoring or the new feature. Separate commits enable precise git bisect, independent reverts, easier code review, and clearer commit history. This is a core version control discipline for safe refactoring.",
    },
    {
      front: "What is a seam (in legacy code)?",
      back: "A place in the code where you can change behavior without editing the code at that point. Types include object seams (override methods via subclassing), preprocessor seams (C/C++ macros), and link seams (swap implementations at link time). Seams let you inject test doubles into legacy code without modifying production code. From Michael Feathers.",
    },
    {
      front: "When should you NOT refactor?",
      back: "When the code works, is rarely changed, and is not blocking anyone. During a production incident (stabilize first). Without stakeholder buy-in (risk of half-finished state). Before you understand the code (write characterization tests first). For purely aesthetic reasons with no measurable benefit.",
    },
  ],
  revisionNotes: [
    "Always establish test coverage before refactoring — specifically characterization tests that document current behavior, verified with mutation testing (target >80% kill rate). Line coverage alone is insufficient because tests can execute code without asserting on results.",
    "Each refactoring step should be atomic: apply one named transformation (Extract Method, Inline Variable, Move Class), run all tests, commit with a descriptive message. If tests fail, revert immediately. Never combine refactoring with feature work in the same commit.",
    "The Strangler Fig pattern uses a routing layer to incrementally migrate traffic from legacy to new system. Key infrastructure: API gateway or proxy with percentage-based routing, feature flags for rollback, and monitoring to compare error rates and latency between old and new paths.",
    "Feature flags decouple deployment from release. Deploy new code behind a disabled flag, enable for internal users first (dogfooding), then canary (small percentage), then full rollout. Always implement a fallback to the old path. Every flag must have an owner and expiration date to prevent flag debt.",
    "Parallel change (expand-and-contract) is the safe way to modify interfaces: expand to support both old and new, migrate all callers, then contract by removing the old. This applies to APIs (v1+v2 simultaneously), database schemas (add column, dual-write, backfill, switch reads, drop old column), and function signatures.",
    "Know when NOT to refactor: stable code that nobody changes, during incidents, without team buy-in, before understanding the code, or for aesthetic reasons alone. Refactoring without a concrete benefit (fewer bugs, faster feature delivery, reduced cognitive load) is waste.",
    "CI/CD is the enforcement mechanism: every refactoring commit triggers unit tests, integration tests, contract tests (Pact), static analysis, and performance benchmarks. Progressive delivery (canary, blue-green) catches regressions that tests miss. Keep pipeline feedback under 10 minutes to maintain discipline.",
  ],
  cheatSheet: [
    "Pre-refactoring checklist: (1) identify the area to change, (2) write characterization tests, (3) run mutation testing, (4) commit the tests, (5) only then start refactoring.",
    "Atomic refactoring rhythm: apply one transformation -> run tests -> green? commit. Red? revert immediately. Never proceed with failing tests.",
    "Commit message format for refactoring: use the refactoring name — 'Extract calculateShipping from processOrder', 'Inline temporary variable in PriceCalculator', 'Replace type code with State pattern in OrderStatus'.",
    "Feature flag rollout stages: OFF -> internal users -> 1% canary -> 10% -> 50% -> 100%. Monitor error rate, latency, and business metrics at each stage. Keep old code path until flag is at 100% for at least one full business cycle.",
    "Strangler Fig routing layer options: API gateway (Kong, AWS API Gateway), reverse proxy (nginx, Envoy), application-level facade (Spring Cloud Gateway). Choose based on granularity needed: gateway for URL-level routing, facade for method-level routing.",
    "Parallel change phases: EXPAND (add new alongside old) -> MIGRATE (move all callers) -> CONTRACT (remove old). Never skip the expand phase — breaking callers is not safe refactoring.",
    "Database refactoring pattern: add new column -> deploy dual-write code -> backfill existing data -> switch reads to new column -> remove old column. Each step is a separate migration and deployment.",
    "Refactoring vs rewriting decision criteria: Can the team deliver features on the current codebase? Is the technology supported? Does the architecture support required non-functional requirements? If yes to all three, refactor. If no to any, consider Strangler Fig migration.",
  ],
  resources: [
    {
      label: "Refactoring: Improving the Design of Existing Code — Martin Fowler",
      kind: "book",
      note: "The definitive reference on refactoring. The catalog of named refactorings (Extract Method, Move Field, Replace Conditional with Polymorphism) provides a shared vocabulary. The 2nd edition uses JavaScript examples and covers modern practices.",
    },
    {
      label: "Working Effectively with Legacy Code — Michael Feathers",
      kind: "book",
      note: "Essential for refactoring code without tests. Introduces characterization tests, seams, and techniques for breaking dependencies in untested code. Every senior engineer should read this before tackling legacy systems.",
    },
    {
      label: "StranglerFigApplication — Martin Fowler (martinfowler.com)",
      kind: "article",
      note: "The original description of the Strangler Fig pattern for incrementally replacing legacy systems. Short, clear, and foundational for anyone planning a migration from monolith to microservices or any system replacement.",
    },
    {
      label: "Refactoring Catalog — refactoring.com",
      kind: "docs",
      note: "Online companion to Fowler's book. Each refactoring is described with motivation, mechanics (step-by-step procedure), and before/after code examples. Useful as a quick reference when you know the smell but not the specific refactoring to apply.",
    },
    {
      label: "PIT Mutation Testing (pitest.org)",
      kind: "docs",
      note: "The standard mutation testing tool for Java/JVM. Documentation covers setup, configuration, and interpreting mutation scores. Understanding mutation testing is critical for knowing whether your test suite is actually a reliable safety net for refactoring.",
    },
  ],
  glossary: [
    {
      term: "Characterization Test",
      definition:
        "A test written to document the current actual behavior of existing code, including bugs and quirks. Used as a safety net before refactoring — if a characterization test breaks after a change, the change altered behavior. Term from Michael Feathers.",
    },
    {
      term: "Strangler Fig Pattern",
      definition:
        "An incremental system replacement strategy where a routing layer sits in front of a legacy system and gradually diverts traffic to a new implementation. Named by Martin Fowler after Ficus species that grow around host trees. Avoids big-bang rewrite risk.",
    },
    {
      term: "Mutation Testing",
      definition:
        "A test quality assessment technique that introduces small syntactic changes (mutations) to source code and checks if any test fails. Surviving mutants indicate untested behaviors. Provides a more rigorous metric than line coverage. Tools: PIT (Java), Stryker (JS/TS), mutmut (Python).",
    },
    {
      term: "Seam",
      definition:
        "A place in code where behavior can be altered without editing the code at that location. Object seams use subclassing, link seams swap implementations at build time, and preprocessor seams use macros. Seams enable testing and refactoring of legacy code without modifying production code.",
    },
    {
      term: "Feature Flag (Feature Toggle)",
      definition:
        "A runtime switch that enables or disables a code path without redeploying. Used during refactoring to deploy new code alongside old code and switch between them. Supports canary releases, A/B testing, and instant rollback. Must be cleaned up after migration to avoid flag debt.",
    },
    {
      term: "Parallel Change (Expand and Contract)",
      definition:
        "A pattern for safely modifying interfaces: expand the interface to support both old and new consumers, migrate all consumers to the new interface, then contract by removing the old interface. Ensures no consumer is broken at any point during the migration.",
    },
    {
      term: "Technical Debt",
      definition:
        "The implied cost of future rework caused by choosing a quick solution over a better approach. Like financial debt, it accumulates interest — each change becomes harder and riskier. Refactoring is the primary mechanism for paying down technical debt. Term coined by Ward Cunningham.",
    },
  ],
};
