import type { TopicContent } from "../types";

export const dryKissYagni: TopicContent = {
  quickSummary: [
    "DRY (Don't Repeat Yourself): every piece of knowledge should have a single, unambiguous, authoritative representation in a system.",
    "KISS (Keep It Simple, Stupid): prefer the simplest solution that works; complexity should be added only when justified.",
    "YAGNI (You Aren't Gonna Need It): do not build features, abstractions, or infrastructure until they are actually needed.",
    "These three principles balance each other: DRY without KISS leads to over-abstraction; KISS without DRY leads to duplication; YAGNI prevents premature complexity from both."
  ],
  detailed: [
    "DRY, coined by Andy Hunt and Dave Thomas in 'The Pragmatic Programmer,' is often misunderstood as 'don't copy-paste code.' The real meaning is broader: every piece of knowledge -- business rules, configuration, schemas, algorithms -- should have a single source of truth. Duplicated knowledge (not just duplicated code) means changes must be made in multiple places, risking inconsistency.",
    "The wrong kind of DRY occurs when developers extract a shared abstraction from code that looks similar but represents different concepts. Two functions that happen to have similar implementations but serve different business domains should remain separate. Merging them couples unrelated concerns, and when one domain's requirements change, the shared abstraction becomes a liability. This is the 'wrong abstraction' problem described by Sandi Metz.",
    "KISS warns against clever, over-engineered solutions. A straightforward if/else chain is often better than a complex pattern-based design when there are only 2-3 cases. KISS does not mean 'write naive code' -- it means choose the appropriate level of sophistication for the problem at hand. The simplest solution that handles current and reasonably foreseeable requirements is the right one.",
    "YAGNI, from Extreme Programming, states that you should not add functionality, build frameworks, or create abstractions until you have a concrete, current need. Speculative development wastes effort, adds complexity, and often produces the wrong abstraction because you cannot predict future requirements accurately. YAGNI applies to features, infrastructure, abstractions, and design patterns.",
    "These three principles interact: DRY eliminates redundancy but risks over-abstraction (KISS violation). KISS keeps solutions simple but may tolerate some duplication. YAGNI prevents premature abstraction, deferring DRY extraction until the third occurrence (Rule of Three). The balance: duplicate until a pattern emerges, then extract a simple abstraction, and resist building for hypothetical future needs."
  ],
  deepDive: [
    "Sandi Metz's influential article 'The Wrong Abstraction' argues that duplication is far cheaper than the wrong abstraction. When developers extract a shared function from two similar code blocks, they create a coupling point. As requirements diverge, they add conditionals and parameters to the shared function until it becomes an incomprehensible mess. The cure: prefer duplication over a premature or incorrect abstraction. When you do extract, ensure the duplicates genuinely represent the same knowledge, not just similar code.",
    "DRY applies beyond code. Database schemas, API specifications, configuration files, documentation, and build scripts can all violate DRY. Code generation (OpenAPI to client SDKs, Protobuf to language bindings, ORM models to SQL schemas) is a DRY-preserving technique: a single source of truth generates all derived artifacts. However, this adds tooling complexity (KISS trade-off).",
    "YAGNI has economic roots. In software projects, the cost of building a feature includes not just development time but also testing, documentation, maintenance, and the opportunity cost of not building something else. Studies in Extreme Programming found that a large percentage of speculative features (by some estimates over 60%) are never used. YAGNI directs investment toward proven, current needs.",
    "KISS is context-dependent. What is 'simple' varies by team expertise, domain complexity, and scale. A microservices architecture is more complex than a monolith, but for a large team with independent deployment needs, it may be the simpler operational choice. KISS is about appropriate simplicity for the context, not absolute minimalism."
  ],
  code: [
    {
      language: "typescript",
      caption: "Wrong DRY: forcing unrelated logic into a shared abstraction",
      source: `// Two functions that look similar but serve different domains
// BAD: extracting a shared "calculateAmount" because the code looks alike

// Version 1: Wrong DRY -- shared function with growing conditionals
function calculateAmount(
  type: "invoice" | "refund",
  items: LineItem[],
  customer: Customer
): number {
  let total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (type === "invoice") {
    // Invoice-specific: apply volume discounts
    if (total > 10000) total *= 0.95;
    // Invoice-specific: add tax
    total *= 1 + customer.taxRate;
    // Invoice-specific: apply payment terms surcharge
    if (customer.paymentTerms > 30) total *= 1.02;
  } else if (type === "refund") {
    // Refund-specific: cap at original purchase amount
    total = Math.min(total, customer.lastPurchaseAmount);
    // Refund-specific: deduct restocking fee
    total *= 0.85;
    // Refund-specific: no tax on refunds in some jurisdictions
    if (!customer.taxOnRefunds) { /* no tax */ }
    else { total *= 1 + customer.taxRate; }
  }

  return total;
}

// Version 2: Correct -- separate functions for separate concerns
function calculateInvoiceTotal(items: LineItem[], customer: Customer): number {
  let total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  if (total > 10000) total *= 0.95;           // volume discount
  total *= 1 + customer.taxRate;              // tax
  if (customer.paymentTerms > 30) total *= 1.02; // late payment surcharge
  return total;
}

function calculateRefundAmount(items: LineItem[], customer: Customer): number {
  let total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  total = Math.min(total, customer.lastPurchaseAmount); // cap
  total *= 0.85;                                        // restocking fee
  if (customer.taxOnRefunds) total *= 1 + customer.taxRate;
  return total;
}
// Yes, the reduce line is duplicated. That's fine -- these are different
// business concepts that happen to share a calculation step today.`
    },
    {
      language: "python",
      caption: "YAGNI violation: building a generic framework for a simple need",
      source: `# YAGNI VIOLATION: Building an elaborate plugin system for one use case

class PluginRegistry:
    """Generic plugin registry with lifecycle hooks, priorities, and dependencies."""
    def __init__(self):
        self._plugins = {}
        self._hooks = {}
        self._priorities = {}

    def register(self, name, plugin, priority=0, depends_on=None):
        self._plugins[name] = plugin
        self._priorities[name] = priority
        # ... topological sort for dependencies
        # ... lifecycle management
        # ... hot-reload support
        # ... plugin versioning
        # 200 lines of framework code for... one plugin.

    def execute_hook(self, hook_name, *args, **kwargs):
        # Complex dispatch with error handling, retries, timeouts...
        pass

# All of this to support ONE discount calculator.
# registry.register("discount", DiscountPlugin())

# --- KISS/YAGNI APPLIED: Just write what you need ---

def apply_discount(order: Order) -> float:
    """Simple discount logic. Will refactor if/when more discount types emerge."""
    if order.total > 100:
        return order.total * 0.1  # 10% discount over $100
    return 0.0

# When (if!) you need multiple discount strategies, THEN introduce a list:
# discount_strategies: list[Callable[[Order], float]] = [
#     volume_discount,
#     loyalty_discount,
#     seasonal_discount,
# ]
# total_discount = sum(strategy(order) for strategy in discount_strategies)`
    },
    {
      language: "java",
      caption: "Correct DRY: extracting genuine shared knowledge",
      source: `// GOOD DRY: Tax calculation is genuine shared business knowledge.
// If the tax rules change, they should change in one place.

public class TaxCalculator {
    private final Map<String, Double> taxRates;

    public TaxCalculator(Map<String, Double> taxRatesByRegion) {
        this.taxRates = Map.copyOf(taxRatesByRegion);
    }

    public double calculateTax(double amount, String region) {
        double rate = taxRates.getOrDefault(region, 0.0);
        return amount * rate;
    }

    public double addTax(double amount, String region) {
        return amount + calculateTax(amount, region);
    }
}

// Used consistently across the system -- single source of truth
public class InvoiceService {
    private final TaxCalculator taxCalc;
    // ...
    public double calculateTotal(Invoice invoice) {
        double subtotal = invoice.getLineItems().stream()
            .mapToDouble(li -> li.getPrice() * li.getQuantity())
            .sum();
        return taxCalc.addTax(subtotal, invoice.getRegion());
    }
}

public class QuoteService {
    private final TaxCalculator taxCalc;
    // ...
    public double estimateTotal(Quote quote) {
        double subtotal = quote.getItems().stream()
            .mapToDouble(Item::getEstimatedPrice)
            .sum();
        return taxCalc.addTax(subtotal, quote.getRegion());
    }
}

// GOOD DRY: Configuration as single source of truth
// application.yml defines regions and rates once.
// Both services use the same TaxCalculator instance.
// If tax law changes, update one place.`
    }
  ],
  diagrams: [
    {
      title: "DRY / KISS / YAGNI Balance",
      kind: "mindmap",
      caption: "Central node: Pragmatic Design. Three branches: DRY (eliminate knowledge duplication, but not code similarity), KISS (simplest adequate solution), YAGNI (build only what's needed now). Interactions: DRY without KISS = over-abstraction, KISS without DRY = scattered knowledge, YAGNI moderates both."
    },
    {
      title: "The Wrong Abstraction Lifecycle",
      kind: "flow",
      caption: "Similar code appears -> Developer extracts shared function -> Requirements diverge -> Conditionals/parameters grow -> Function becomes incomprehensible -> Developer is afraid to touch it -> Better path: tolerate duplication until the abstraction is clear."
    }
  ],
  animations: [
    {
      title: "Rule of Three: When to Extract",
      steps: [
        { label: "First occurrence", detail: "Write the code. Do not abstract. There is no pattern yet -- just one instance." },
        { label: "Second occurrence", detail: "You see similarity with the first. Resist the urge to abstract. Note the duplication but keep the code separate. Two points do not define a trend." },
        { label: "Third occurrence", detail: "Now you have three instances. A pattern has emerged. Evaluate: are these the same knowledge or just similar code? If same knowledge, extract. If different concepts, keep separate." },
        { label: "Extract carefully", detail: "Create a simple, well-named abstraction. Parameterize only the actual differences. Do not add parameters for hypothetical future variations (YAGNI)." },
        { label: "Validate", detail: "Ensure all three callers use the abstraction cleanly without special cases. If any caller needs conditionals or ignores parameters, the abstraction may be wrong." }
      ]
    }
  ],
  comparison: {
    columns: ["Principle", "States", "When Violated", "Risk of Over-Application"],
    rows: [
      ["DRY", "Every piece of knowledge has a single source of truth", "Same knowledge exists in multiple places; changes must be synchronized", "Wrong abstraction: merging similar-looking but conceptually different code"],
      ["KISS", "Prefer the simplest solution that meets current needs", "Over-engineered solutions with unnecessary patterns, layers, or indirection", "Under-engineering: ignoring legitimate complexity, writing naive code that breaks at scale"],
      ["YAGNI", "Do not build until you have a concrete, current need", "Speculative features, frameworks, and abstractions built for hypothetical future requirements", "Under-investing in architecture: deferring too long on genuinely needed infrastructure"],
      ["Rule of Three", "Wait for three occurrences before extracting a shared abstraction", "Extracting after the first or second occurrence, before a pattern is clear", "Waiting too long while duplication causes real maintenance pain"]
    ]
  },
  interviewQA: [
    {
      q: "What does DRY really mean?",
      a: "DRY means 'every piece of knowledge should have a single, unambiguous, authoritative representation in a system.' It is NOT just about avoiding copy-paste code. It applies to business rules, configuration, schemas, and any knowledge that could become inconsistent if maintained in multiple places. Two functions with identical code but representing different business concepts are NOT a DRY violation -- they are coincidentally similar implementations of different knowledge.",
      followUps: [
        "What is the difference between code duplication and knowledge duplication?",
        "How does code generation support DRY?"
      ]
    },
    {
      q: "What is 'the wrong abstraction' problem?",
      a: "Sandi Metz coined this: when developers see similar code and extract a shared abstraction, they create a coupling point. As the use cases diverge, the abstraction accumulates conditionals and parameters to accommodate differences. It becomes harder to understand and change than the original duplication. The lesson: duplication is far cheaper than the wrong abstraction. Wait until you have enough instances (Rule of Three) and are confident the duplication represents the same knowledge.",
      followUps: [
        "How do you recover from a wrong abstraction?",
        "What is the Rule of Three?"
      ]
    },
    {
      q: "When does KISS conflict with other principles like SOLID?",
      a: "SOLID principles encourage abstractions, interfaces, and indirection that add complexity. KISS says prefer simplicity. The resolution: apply SOLID at boundaries where the cost of coupling is high (between modules, services, layers) and keep it simple within those boundaries. A 50-line function with clear if/else logic is simpler and better than an over-engineered Strategy pattern for 2 cases. Apply patterns when the complexity they solve exceeds the complexity they introduce.",
      followUps: [
        "How do you decide when a pattern is justified?",
        "Is premature optimization related to KISS?"
      ]
    },
    {
      q: "What does YAGNI say about future-proofing?",
      a: "YAGNI says do not build for hypothetical future needs. This does not mean ignore the future entirely -- it means do not invest in building features, frameworks, or abstractions until you have a concrete, current requirement. The cost of speculative development includes building, testing, maintaining, and often discarding code. Instead, design code that is easy to change (clean, well-tested, loosely coupled) so you can add capabilities when they are actually needed.",
      followUps: [
        "How do you balance YAGNI with architecture decisions that are hard to change later?",
        "What about database schema design -- should you future-proof schemas?"
      ]
    },
    {
      q: "How do DRY, KISS, and YAGNI interact in practice?",
      a: "They form a pragmatic triangle: DRY says eliminate knowledge duplication. KISS says do it simply. YAGNI says do it only when needed. When you see duplication (DRY concern), ask: is this the same knowledge or coincidental similarity? If same knowledge, extract, but do it simply (KISS). If you are tempted to build a generic framework for the extraction, ask: do you need that generality now (YAGNI)? Usually, a simple shared function is enough. The framework can come later if the need materializes.",
      followUps: [
        "Can you give a concrete example of all three principles in tension?",
        "Which principle should take priority when they conflict?"
      ]
    }
  ],
  followUps: [
    "What is the difference between incidental duplication and knowledge duplication?",
    "How does the Rule of Three guide when to apply DRY?",
    "What role does refactoring play in balancing DRY, KISS, and YAGNI?",
    "How do microservices architectures handle DRY across service boundaries?",
    "What is 'accidental complexity' vs 'essential complexity' in the context of KISS?",
    "How does test-driven development (TDD) naturally support YAGNI?"
  ],
  mcqs: [
    {
      q: "According to the original definition, what does DRY apply to?",
      options: [
        "Only source code",
        "Only database schemas",
        "Every piece of knowledge in the system",
        "Only configuration files"
      ],
      answerIndex: 2,
      explanation: "DRY from 'The Pragmatic Programmer' applies to all knowledge: business rules, schemas, configs, build scripts -- not just code."
    },
    {
      q: "What does Sandi Metz mean by 'the wrong abstraction'?",
      options: [
        "Using the wrong design pattern",
        "An abstraction extracted from coincidentally similar code that couples unrelated concerns",
        "An interface with too many methods",
        "A class that is too abstract to instantiate"
      ],
      answerIndex: 1,
      explanation: "The wrong abstraction is created when developers merge similar-looking code into a shared function, even though the code represents different concerns that will diverge."
    },
    {
      q: "What does YAGNI advise against?",
      options: [
        "Writing any documentation",
        "Using version control",
        "Building features and abstractions before they are concretely needed",
        "Refactoring existing code"
      ],
      answerIndex: 2,
      explanation: "YAGNI says do not invest in speculative features, frameworks, or abstractions. Build for current, concrete needs. This avoids wasted effort and wrong design decisions."
    },
    {
      q: "What is the Rule of Three?",
      options: [
        "A class should have at most three methods",
        "Wait until you see three occurrences of duplication before extracting a shared abstraction",
        "Every function should have at most three parameters",
        "Code reviews should be done by three people"
      ],
      answerIndex: 1,
      explanation: "The Rule of Three suggests waiting for three instances of duplication before abstracting, giving enough data points to distinguish genuine patterns from coincidental similarity."
    },
    {
      q: "When do DRY and KISS conflict?",
      options: [
        "They never conflict",
        "When eliminating duplication requires a complex abstraction that is harder to understand than the duplication itself",
        "When using simple data structures",
        "When writing unit tests"
      ],
      answerIndex: 1,
      explanation: "DRY may push you to extract a shared abstraction, but if that abstraction is convoluted and harder to understand than the original duplication, it violates KISS."
    },
    {
      q: "In a microservices architecture, how should DRY be applied across service boundaries?",
      options: [
        "Share a common library for all business logic",
        "Tolerate some duplication across services to maintain independence; DRY within, not across, service boundaries",
        "Use a single database for all services",
        "Merge services that have any shared logic"
      ],
      answerIndex: 1,
      explanation: "Across microservice boundaries, coupling (shared libraries) is more costly than duplication. Apply DRY within each service but tolerate some duplication between services."
    }
  ],
  exercises: [
    "Find a codebase with copy-pasted logic. Categorize each instance as (a) knowledge duplication (should be extracted) or (b) incidental similarity (should remain separate). Extract only the genuine knowledge duplications.",
    "Take an over-engineered class or module (one with many unused abstractions, layers, or configurability). Simplify it by applying KISS and YAGNI: remove what is not currently needed and flatten unnecessary indirection.",
    "Implement a feature three different ways: (1) with maximum DRY (every possible extraction), (2) with maximum KISS (simplest possible code), and (3) with a pragmatic balance. Compare readability, maintainability, and line count.",
    "Review a project's configuration management: database connection strings, API keys, feature flags. Identify DRY violations where the same configuration value is defined in multiple places. Consolidate to a single source of truth."
  ],
  flashcards: [
    { front: "What does DRY stand for and what does it really mean?", back: "Don't Repeat Yourself. Every piece of knowledge (not just code) should have a single, unambiguous, authoritative representation in the system." },
    { front: "What is the difference between code duplication and knowledge duplication?", back: "Code duplication is identical lines of code. Knowledge duplication is the same business concept expressed in multiple places. Similar code may represent different knowledge (acceptable). Different code may represent the same knowledge (DRY violation)." },
    { front: "What is KISS?", back: "Keep It Simple, Stupid. Prefer the simplest solution that adequately meets current requirements. Complexity should be justified, not assumed." },
    { front: "What is YAGNI?", back: "You Aren't Gonna Need It. Do not build features, frameworks, or abstractions until there is a concrete, current need. Avoid speculative development." },
    { front: "What is the Rule of Three?", back: "Wait until you see three instances of the same knowledge before extracting a shared abstraction. Two instances may be coincidental; three suggest a real pattern." },
    { front: "What is 'the wrong abstraction'?", back: "An abstraction extracted from coincidentally similar code that couples unrelated concerns. As requirements diverge, it accumulates conditionals and becomes harder to maintain than the original duplication." },
    { front: "How do DRY, KISS, and YAGNI balance each other?", back: "DRY eliminates knowledge duplication. KISS keeps the extraction simple. YAGNI prevents premature extraction. Together: duplicate until a clear pattern emerges, then extract simply, without over-generalizing." }
  ],
  revisionNotes: [
    "DRY is about knowledge, not code. Same code, different knowledge = fine. Different code, same knowledge = violation.",
    "The wrong abstraction (Sandi Metz): duplication is cheaper than a premature or incorrect abstraction.",
    "Rule of Three: wait for three occurrences before extracting to ensure a genuine pattern.",
    "KISS: choose the appropriate level of sophistication for the problem. Simple does not mean naive.",
    "YAGNI: build for current needs. Design for changeability, not for hypothetical features.",
    "These principles interact: DRY without KISS = over-abstraction. KISS without DRY = scattered knowledge. YAGNI moderates both.",
    "Across microservice boundaries, prefer duplication over coupling (DRY within, not across, services).",
    "Code generation is a DRY-preserving technique for schemas, APIs, and configurations."
  ],
  cheatSheet: [
    "DRY: Is this the same knowledge or just similar code? Only extract same knowledge.",
    "Rule of Three: first time just write it, second time note it, third time extract it.",
    "KISS: Would a junior developer understand this? If not, simplify.",
    "YAGNI: Are you building this for a current requirement or a hypothetical one? If hypothetical, stop.",
    "Prefer duplication over the wrong abstraction.",
    "Apply SOLID patterns at boundaries, KISS within boundaries.",
    "Code generation (protobuf, OpenAPI) keeps schemas DRY across languages/services.",
    "In microservices, DRY within a service, tolerate duplication across services."
  ],
  resources: [
    { label: "The Pragmatic Programmer by Andy Hunt and Dave Thomas", kind: "book", note: "Origin of the DRY principle with its full definition beyond just code." },
    { label: "The Wrong Abstraction (Sandi Metz)", kind: "article", note: "Influential post arguing that duplication is far cheaper than the wrong abstraction." },
    { label: "Extreme Programming Explained by Kent Beck", kind: "book", note: "Origin of YAGNI and its economic rationale in iterative development." },
    { label: "Clean Code by Robert C. Martin", kind: "book", note: "Practical guidance on keeping code simple and avoiding unnecessary complexity." },
    { label: "A Philosophy of Software Design by John Ousterhout", kind: "book", note: "Deep treatment of complexity management and when abstraction helps vs hurts." }
  ],
  glossary: [
    { term: "DRY (Don't Repeat Yourself)", definition: "Every piece of knowledge should have a single, unambiguous, authoritative representation in a system." },
    { term: "KISS (Keep It Simple, Stupid)", definition: "Prefer the simplest solution that adequately meets requirements. Complexity should be justified by concrete need." },
    { term: "YAGNI (You Aren't Gonna Need It)", definition: "Do not build features, abstractions, or infrastructure until they are concretely needed." },
    { term: "Rule of Three", definition: "Wait for three occurrences of the same knowledge before extracting a shared abstraction." },
    { term: "The Wrong Abstraction", definition: "An abstraction extracted from coincidentally similar code that becomes a maintenance burden as use cases diverge." },
    { term: "Incidental Duplication", definition: "Code that looks similar but represents different business concepts. Not a DRY violation." },
    { term: "Knowledge Duplication", definition: "The same business concept or rule expressed in multiple places. A genuine DRY violation." },
    { term: "Speculative Generality", definition: "Building abstractions, frameworks, or features for anticipated but unrealized future needs. The anti-pattern YAGNI warns against." }
  ]
};
