import type { TopicContent } from "../types";

export const naming: TopicContent = {
  quickSummary: [
    "Good names reveal intent -- a reader should understand what a variable holds, what a function does, or what a class represents without reading its implementation.",
    "Names should avoid disinformation (misleading abbreviations, platform-specific terms used incorrectly) and make meaningful distinctions rather than relying on noise words like 'data', 'info', or numeric suffixes.",
    "Naming conventions vary by language (camelCase in Java/TypeScript, snake_case in Python, PascalCase for classes) but the underlying principles -- clarity, consistency, and searchability -- are universal.",
    "Renaming is one of the safest and highest-value refactorings; modern IDEs make it nearly free, so there is no excuse for living with a bad name."
  ],

  detailed: [
    "Intention-revealing names answer three questions: why does this thing exist, what does it do, and how is it used? A variable named `d` tells you nothing; `elapsedTimeInDays` tells you everything. The cost of a longer name is far less than the cost of deciphering a cryptic one during a debugging session at 2 AM.",
    "Avoiding disinformation means not using names that imply something false. Do not call a group of accounts `accountList` unless it is literally a List; use `accounts` or `accountGroup`. Do not use lowercase-L or uppercase-O as variable names because they look like 1 and 0. Do not use `hp`, `aix`, or `sco` as variable names because they are Unix platform names.",
    "Meaningful distinctions require that if two things have different names, they must actually differ in meaning. Names like `getActiveAccount()`, `getActiveAccountInfo()`, and `getActiveAccountData()` are indistinguishable. Noise words like 'the', 'a', 'an' as prefixes, or 'variable', 'string', 'object' as suffixes, add length without meaning.",
    "Pronounceable names matter because programming is a social activity. If you cannot pronounce a name, you cannot discuss it without sounding foolish. Compare `genymdhms` (generation date, year, month, day, hour, minute, second) with `generationTimestamp`. The latter can appear naturally in conversation.",
    "Searchable names are essential in large codebases. A single-letter name like `e` is nearly impossible to grep for. The length of a name should correspond to the size of its scope: a loop counter `i` in a 3-line for-loop is fine; a constant used across 50 files should be `MAX_CLASSES_PER_STUDENT`, not `7`.",
    "Class names should be nouns or noun phrases (Customer, WikiPage, AccountParser), never verbs. Method names should be verbs or verb phrases (postPayment, deletePage, save). Accessors, mutators, and predicates should follow JavaBean conventions: get, set, is prefixes. For static factory methods, use names that describe the argument: `Complex.fromRealNumber(23.0)` is clearer than `new Complex(23.0)`."
  ],

  deepDive: [
    "The Hungarian Notation debate illustrates how naming conventions evolve. In the era of C and untyped languages, prefixes like `szName` (string, zero-terminated) and `iCount` (integer) were valuable because the compiler did not catch type mismatches. In modern statically-typed languages with IDE support, Hungarian Notation adds noise without benefit. However, a lighter form -- Apps Hungarian, where the prefix encodes the variable's semantic role rather than its type (e.g., `usName` for unsafe string, `sName` for safe string) -- can still prevent security bugs by making categories visible. The key insight is that naming conventions should encode information the toolchain cannot enforce.",
    "Domain-driven design elevates naming to a strategic concern through the concept of Ubiquitous Language. Every name in the codebase should come from the domain model agreed upon by developers and domain experts. When the business says 'policy', the code should not say 'rule' or 'contract'. This alignment reduces translation errors and makes the code a living model of the business. Bounded contexts allow the same word to mean different things in different modules, which maps naturally to how businesses actually work (a 'customer' in sales is different from a 'customer' in support).",
    "Naming anti-patterns in large codebases tend to compound. One poorly named function leads to callers that invent their own terminology, which leads to documentation that uses yet another vocabulary. Tools like architecture decision records (ADRs) and glossaries embedded in the repository help fight this drift. Some teams enforce naming rules through custom linter plugins -- for example, requiring that all repository classes end in 'Repository', all DTOs end in 'Dto', and all event handlers start with 'on'. This mechanical enforcement frees code reviewers to focus on deeper semantic correctness.",
    "Renaming strategies in legacy codebases require care. A rename refactoring in a single repository is straightforward with IDE support, but in a distributed system with shared APIs, renaming a field in a protobuf message or a JSON response requires versioning, deprecation periods, and coordinated rollouts. Techniques include: adding the new name alongside the old one, marking the old one as deprecated, migrating consumers, and finally removing the old name. This is why getting names right early matters disproportionately in API design."
  ],

  code: [
    {
      language: "java",
      caption: "Before and after: intention-revealing names",
      source: `// BAD: What does this function do? What are d, t, l?
public List<int[]> getThem() {
    List<int[]> list1 = new ArrayList<>();
    for (int[] x : theList) {
        if (x[0] == 4) {
            list1.add(x);
        }
    }
    return list1;
}

// GOOD: Names reveal the domain (minesweeper board)
public List<Cell> getFlaggedCells() {
    List<Cell> flaggedCells = new ArrayList<>();
    for (Cell cell : gameBoard) {
        if (cell.isFlagged()) {
            flaggedCells.add(cell);
        }
    }
    return flaggedCells;
}`
    },
    {
      language: "typescript",
      caption: "Naming conventions in TypeScript: interfaces, types, enums, and functions",
      source: `// Interfaces: PascalCase, describe a capability or shape
interface PaymentProcessor {
  processPayment(amount: Money): Promise<PaymentResult>;
  refund(transactionId: string): Promise<RefundResult>;
}

// Types: PascalCase, often describe a union or computed shape
type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered";

// Enums: PascalCase for the enum, PascalCase for members
enum HttpStatusCode {
  Ok = 200,
  Created = 201,
  BadRequest = 400,
  NotFound = 404,
  InternalServerError = 500,
}

// Functions: camelCase, verb phrases, parameters describe what they hold
function calculateShippingCost(
  packageWeight: Kilograms,
  destination: Address,
  shippingMethod: ShippingMethod
): Money {
  const baseRate = getBaseRate(shippingMethod);
  const distanceSurcharge = computeDistanceSurcharge(destination);
  return baseRate.add(distanceSurcharge.multiply(packageWeight.value));
}

// Boolean variables and functions: use is/has/can/should prefixes
const isEligibleForDiscount = customer.loyaltyYears > 2;
const hasActiveSubscription = subscriptions.some(s => s.isActive());
function canUserEditDocument(user: User, doc: Document): boolean {
  return doc.ownerId === user.id || user.role === "admin";
}`
    },
    {
      language: "cpp",
      caption: "C++ naming conventions",
      source: `#include <iostream>
#include <vector>
#include <string>
#include <numeric>
#include <stdexcept>
#include <sstream>

// Classes: PascalCase
class InvoiceLineItem {
public:
    // Constants: UPPER_SNAKE_CASE (or constexpr)
    static constexpr int MAX_DESCRIPTION_LENGTH = 500;
    static constexpr double DEFAULT_TAX_RATE = 0.18;

    // Constructor
    InvoiceLineItem(const std::string& description, double unitPrice, int quantity)
        : description_(description)    // Trailing underscore = private member convention
        , unitPrice_(unitPrice)
        , quantity_(quantity) {}

    // Getters for computed values: noun-like names
    double totalBeforeTax() const {
        return unitPrice_ * quantity_;
    }

    double taxAmount() const {
        return totalBeforeTax() * DEFAULT_TAX_RATE;
    }

    // Methods: camelCase verb phrases
    void applyDiscount(double discountPercentage) {
        if (discountPercentage < 0 || discountPercentage > 100) {
            throw std::invalid_argument(
                "Discount must be 0-100, got " + std::to_string(discountPercentage));
        }
        double multiplier = 1.0 - (discountPercentage / 100.0);
        unitPrice_ *= multiplier;
    }

    // Operator overload for stream output
    friend std::ostream& operator<<(std::ostream& os, const InvoiceLineItem& item) {
        return os << "InvoiceLineItem(\\"" << item.description_ << "\\", "
                  << item.unitPrice_ << ", " << item.quantity_ << ")";
    }

private:
    std::string description_;
    double unitPrice_;
    int quantity_;
};

// Free functions: camelCase or snake_case (team convention)
double calculateInvoiceTotal(const std::vector<InvoiceLineItem>& lineItems) {
    return std::accumulate(lineItems.begin(), lineItems.end(), 0.0,
        [](double sum, const InvoiceLineItem& item) {
            return sum + item.totalBeforeTax() + item.taxAmount();
        });
}`
    }
  ],

  diagrams: [
    {
      title: "Naming Decision Flowchart",
      kind: "flow",
      caption: "Decision tree for choosing good names: start with intent, check for disinformation, verify searchability.",
      mermaid: `flowchart TD
    A["Choose a name"] --> B{"Reveals intent?"}
    B -->|No| C["Describe what it holds or does"]
    B -->|Yes| D{"Contains disinformation?"}
    D -->|Yes| E["Remove misleading type hints or false context"]
    D -->|No| F{"Pronounceable and searchable?"}
    F -->|No| G["Avoid abbreviations and acronyms"]
    F -->|Yes| H{"Correct naming convention for language?"}
    H -->|No| I["Apply language conventions"]
    H -->|Yes| J["Name is good"]
    C --> B
    E --> D
    G --> F
    I --> H`,
    },
    {
      title: "Naming Conventions by Language",
      kind: "mindmap",
      caption: "Naming conventions across Java, Python, TypeScript, and Go.",
      mermaid: `mindmap
    root["Naming Conventions"]
      Java
        camelCase methods and variables
        PascalCase classes
        UPPER_SNAKE constants
      Python
        snake_case functions and variables
        PascalCase classes
        _private convention
      TypeScript
        camelCase functions and variables
        PascalCase types interfaces enums
        UPPER_SNAKE constants
      Go
        PascalCase exported identifiers
        camelCase unexported
        Short names for narrow scope`,
    },
    {
      title: "Name Quality Spectrum",
      kind: "architecture",
      caption: "Progression from cryptic names to intention-revealing names with examples.",
      mermaid: `graph LR
    Bad1["d\ncryptic single letter"] -->|improve| OK1["days\nbetter but vague"]
    OK1 -->|improve| Good1["elapsedDays\nclear intent"]
    Bad2["getInfo\nvague verb noun"] -->|improve| OK2["fetchUser\nbetter action"]
    OK2 -->|improve| Good2["fetchUserById\ncomplete intent"]
    Bad3["flag\nno meaning"] -->|improve| OK3["isActive\nboolean revealed"]
    OK3 -->|improve| Good3["isAccountActive\ndomain context"]`,
    },
    {
      title: "Variable Name Length Guidelines",
      kind: "flow",
      caption: "Name length should scale with scope size and usage distance.",
      mermaid: `flowchart TD
    A["Variable scope"] --> B{"Loop counter or\nvery narrow scope?"}
    B -->|Yes| C["Short name: i j k x OK"]
    B -->|No| D{"Used only in one method?"}
    D -->|Yes| E["Medium name: userId total count"]
    D -->|No| F{"Used across modules or classes?"}
    F -->|Yes| G["Full descriptive name:\ncurrentUserAccountId"]
    F -->|No| E`,
    },
  ],

  animations: [
    {
      title: "Renaming a Poorly Named Variable Through Successive Refinements",
      steps: [
        { label: "Original cryptic name", detail: "The variable is named `d` -- no one knows what it holds. A new developer has to read three functions to figure out it holds elapsed time." },
        { label: "First improvement: add type hint", detail: "Renamed to `days` -- better, but days of what? The reader still needs context. Also could be confused with a list of Day objects." },
        { label: "Second improvement: add domain context", detail: "Renamed to `elapsedDays` -- now we know it is a duration, not a date. But elapsed since when?" },
        { label: "Final form: full intent revealed", detail: "Renamed to `daysSinceLastLogin` -- any reader immediately knows what this variable holds, why it exists, and how to use it. Zero additional context needed." }
      ]
    }
  ],

  comparison: {
    columns: ["Aspect", "Bad Name", "Good Name", "Why It Matters"],
    rows: [
      ["Variable", "d", "daysSinceModification", "Reveals what the value represents"],
      ["Function", "process()", "validateAndSubmitOrder()", "Tells caller what happens and scope of work"],
      ["Boolean", "flag", "isEligibleForRefund", "Reads naturally in if-statements"],
      ["Collection", "list1", "activeSubscriptions", "Describes contents, not container type"],
      ["Class", "DataManager", "InventoryRepository", "Specific role in the domain, not vague responsibility"],
      ["Constant", "7", "MAX_RETRY_ATTEMPTS", "Eliminates magic numbers, searchable, single point of change"],
      ["Interface", "IDoStuff", "PaymentGateway", "Describes the contract, no need for 'I' prefix in modern languages"],
      ["Enum", "Status.s1", "OrderStatus.Shipped", "Self-documenting, no lookup table needed"]
    ]
  },

  interviewQA: [
    {
      q: "Why does Robert C. Martin say that naming is the hardest part of programming?",
      a: "Because a good name must compress the full context of a concept into a few words. It must be accurate today and remain accurate as the code evolves. It must communicate across team members with different backgrounds. And it must work at multiple levels of abstraction -- a variable name needs local clarity, while a module name needs architectural clarity. The difficulty is not in the typing but in the thinking: choosing a name forces you to understand what the thing actually is, and that understanding is the hard part.",
      followUps: [
        "How do you decide when a name is 'good enough' versus when to keep refining?",
        "What is the relationship between naming and the Single Responsibility Principle?",
        "How do you handle naming when the domain experts use ambiguous terms?"
      ]
    },
    {
      q: "What is the difference between 'noise words' and 'meaningful qualifiers' in names?",
      a: "Noise words are additions that do not help distinguish one thing from another: 'ProductInfo' vs 'ProductData' vs 'Product' are indistinguishable. Meaningful qualifiers add real information: 'rawInput' vs 'sanitizedInput' vs 'validatedInput' tell you the processing stage. The test is whether removing the word changes the reader's understanding. If 'AccountData' means the same as 'Account', then 'Data' is noise. If 'AccountSummary' is genuinely different from 'AccountDetail', then 'Summary' and 'Detail' are meaningful qualifiers.",
      followUps: [
        "How do you enforce consistent qualifier usage across a large team?",
        "When is it acceptable to use 'Manager' or 'Helper' in a class name?"
      ]
    },
    {
      q: "Should you use abbreviations in code?",
      a: "Generally, no. Abbreviations save keystrokes for the author but cost time for every reader. However, there are three exceptions: (1) universally understood abbreviations in the domain, like 'URL', 'HTTP', 'ID', 'HTML'; (2) single-letter loop variables in very short scopes (i, j, k for indices); and (3) abbreviations established by the project's ubiquitous language that are documented in a shared glossary. The key rule is that the abbreviation must be unambiguous -- 'gen' could mean generate, generation, generator, or generic.",
      followUps: [
        "How do you handle abbreviations in API contracts that are shared across teams?",
        "What about mathematical code where single-letter variables match the equations?"
      ]
    },
    {
      q: "How do you name things in a microservices architecture where the same concept exists across services?",
      a: "Domain-driven design addresses this with Bounded Contexts. Each service owns its own model and naming. A 'Customer' in the billing service might have fields like creditLimit and paymentMethod, while a 'Customer' in the shipping service has fields like shippingAddress and deliveryPreferences. The names are the same but the models are different, and that is correct because they represent different facets of the same real-world entity. Anti-corruption layers at service boundaries translate between models. The mistake is trying to create one canonical 'Customer' class shared across all services.",
      followUps: [
        "How do you name the translation/mapping classes between bounded contexts?",
        "What happens when teams disagree on naming within a single bounded context?"
      ]
    },
    {
      q: "What naming strategies help when writing unit tests?",
      a: "Test method names should describe the scenario and expected outcome, not the method under test. The pattern 'methodName_scenario_expectedResult' works well: `calculateDiscount_loyalCustomerWithBulkOrder_applies15Percent()`. For test fixtures and builders, use names that describe the archetype: `aGoldCustomer()`, `anExpiredSubscription()`, `aFullShoppingCart()`. Avoid generic names like `testData` or `fixture1`. The test name should read like a specification -- if all tests pass, the names form a readable list of what the system does.",
      followUps: [
        "How do you balance descriptive test names with keeping them short enough to read?",
        "Should test helper methods follow the same naming conventions as production code?"
      ]
    },
    {
      q: "How should you name boolean variables and functions?",
      a: "Boolean names should read naturally in conditional expressions. Use prefixes like is, has, can, should, will, or was: `isValid`, `hasPermission`, `canEdit`, `shouldRetry`. Avoid negated names like `isNotEmpty` because double negatives in conditions are confusing: `if (!isNotEmpty)` is much harder to parse than `if (isEmpty)`. For functions that return booleans, phrase them as yes/no questions: `user.hasActiveSubscription()`, `order.isEligibleForFreeShipping()`. The name should make the true and false cases obvious.",
      followUps: [
        "Is it ever acceptable to name a boolean without a prefix, like 'visible' or 'enabled'?",
        "How do you name boolean parameters that configure function behavior?"
      ]
    }
  ],

  followUps: [
    "How does naming interact with code generation tools and AI assistants?",
    "What is the role of a project glossary or data dictionary in maintaining naming consistency?",
    "How do you handle naming across different natural languages in international teams?",
    "What naming conventions work best for event-driven architectures (event names, handler names, topic names)?",
    "How do you rename a widely-used public API field without breaking consumers?",
    "When does a name become so long that it hurts readability?"
  ],

  mcqs: [
    {
      q: "Which of the following is the best name for a variable that stores the number of items in a shopping cart?",
      options: ["n", "count", "itemCount", "cartItemCount"],
      answerIndex: 3,
      explanation: "'cartItemCount' reveals both the domain (cart) and what is being counted (items). 'count' and 'itemCount' are progressively better but lack the full context. 'n' is cryptic."
    },
    {
      q: "What is wrong with the name 'accountList' for a variable of type Set<Account>?",
      options: [
        "It is too long",
        "It encodes the container type, which may be misleading if the type changes",
        "It uses camelCase instead of snake_case",
        "It should start with a capital letter"
      ],
      answerIndex: 1,
      explanation: "Encoding the container type in the name creates disinformation. If the implementation changes from List to Set, the name becomes a lie. Use 'accounts' instead."
    },
    {
      q: "Which naming convention does PEP 8 recommend for Python module-level constants?",
      options: ["camelCase", "PascalCase", "UPPER_SNAKE_CASE", "lowercase"],
      answerIndex: 2,
      explanation: "PEP 8 specifies UPPER_SNAKE_CASE for module-level constants, e.g., MAX_CONNECTIONS = 100."
    },
    {
      q: "What is 'Ubiquitous Language' in the context of naming?",
      options: [
        "Using English for all code regardless of the team's native language",
        "A shared vocabulary between developers and domain experts used consistently in code and conversation",
        "A programming language that can be used on all platforms",
        "The practice of using the same variable names across all microservices"
      ],
      answerIndex: 1,
      explanation: "Ubiquitous Language is a Domain-Driven Design concept where the same terms used by business stakeholders appear in the code, tests, and documentation, ensuring alignment between the model and the domain."
    },
    {
      q: "Why should boolean variables avoid negated names like 'isNotValid'?",
      options: [
        "They use more memory than positive names",
        "They violate PEP 8 and Java naming conventions",
        "Double negation in conditions (e.g., if !isNotValid) is confusing to read",
        "They cannot be serialized to JSON"
      ],
      answerIndex: 2,
      explanation: "Negated boolean names lead to double negatives in conditions, which are harder to parse mentally. 'if (!isNotValid)' is much less clear than 'if (isValid)'."
    },
    {
      q: "When is it acceptable to use single-letter variable names?",
      options: [
        "Always, to keep code concise",
        "Never, they always reduce readability",
        "In very short scopes like loop counters, or in mathematical code matching equations",
        "Only in dynamically typed languages"
      ],
      answerIndex: 2,
      explanation: "Single-letter names are acceptable in very small scopes (e.g., 'i' in a 3-line loop) or in mathematical code where they match standard notation (e.g., 'x', 'y' for coordinates). Outside these cases, longer descriptive names are preferred."
    }
  ],

  exercises: [
    "Take a function from your current project that has poorly named parameters. Rename each parameter to reveal its intent, then update all call sites. Measure whether the function's purpose is clearer without reading the body.",
    "Review a class in your codebase and identify any noise words in its methods (e.g., getData, fetchInfo, processResult). Replace them with domain-specific names that distinguish each method's actual purpose.",
    "Create a naming glossary for your project: list the 20 most important domain terms, their definitions, and the exact names used in code. Identify any inconsistencies where the same concept has different names in different modules.",
    "Find all magic numbers and magic strings in a module. Replace each with a named constant whose name explains the business rule (e.g., `MINIMUM_PASSWORD_LENGTH = 8` instead of bare `8`).",
    "Practice the 'newspaper metaphor': restructure a source file so that the most important, high-level functions appear at the top with descriptive names, and implementation details (helper functions) appear below. The file should read like a newspaper article -- headline first, details later."
  ],

  flashcards: [
    { front: "What three questions should a good variable name answer?", back: "Why does it exist? What does it do? How is it used?" },
    { front: "What is 'disinformation' in naming?", back: "Using a name that implies something false about the thing it represents -- e.g., calling a Set 'accountList', or using 'hp' which could be mistaken for a Unix platform name." },
    { front: "What is the scope-length rule for names?", back: "The length of a name should be proportional to the size of its scope. Short scopes (3-line loops) can use short names (i, j). Large scopes (module-level constants) need long, descriptive, searchable names." },
    { front: "What prefixes are recommended for boolean variables?", back: "is, has, can, should, will, was -- e.g., isActive, hasPermission, canEdit, shouldRetry." },
    { front: "What is the difference between a noise word and a meaningful qualifier?", back: "A noise word (Data, Info, Manager) adds no distinguishing information. A meaningful qualifier (Summary vs Detail, Raw vs Sanitized) conveys a real difference in what the thing represents." },
    { front: "What is Ubiquitous Language?", back: "A DDD concept where developers and domain experts share the same vocabulary, and that vocabulary is used consistently in code, tests, documentation, and conversations." },
    { front: "Why is 'processData()' a bad function name?", back: "It says nothing about what kind of processing or what kind of data. Every function processes some data. A name like 'validateOrderItems()' or 'calculateShippingCost()' reveals what actually happens." }
  ],

  revisionNotes: [
    "Names are the primary way code communicates intent. A well-named codebase needs fewer comments and less documentation.",
    "Avoid encoding types in names (Hungarian Notation) in modern typed languages -- the compiler and IDE already know the types.",
    "Class names should be nouns (Customer, Order), method names should be verbs (calculate, validate, send). Factory methods should describe what is being created (fromJson, withDefaults).",
    "The 'Boy Scout Rule' applies to naming: if you encounter a bad name while working on a feature, rename it. Leave the codebase with better names than you found.",
    "In API design, names are contracts. Renaming an API field is a breaking change that requires versioning. Invest extra time in API naming because the cost of change is high.",
    "Test method names serve as documentation. A well-named test suite reads like a specification: 'shouldRejectOrderWhenInventoryInsufficient', 'shouldApplyDiscountForLoyalCustomer'.",
    "Use the team's agreed-upon glossary. If the business calls it a 'policy', do not call it a 'rule' in code just because you prefer that word."
  ],

  cheatSheet: [
    "Variables: use nouns/noun phrases that describe contents -- daysSinceCreation, activeUsers, shippingAddress",
    "Functions/methods: use verb phrases that describe action -- calculateTotal(), sendNotification(), validateInput()",
    "Booleans: prefix with is/has/can/should -- isActive, hasPermission, canEdit",
    "Classes: PascalCase nouns -- OrderProcessor, UserRepository, PaymentGateway",
    "Constants: UPPER_SNAKE_CASE with business meaning -- MAX_LOGIN_ATTEMPTS, DEFAULT_TIMEOUT_MS",
    "Interfaces (TypeScript/Java): describe capability, no 'I' prefix -- Serializable, PaymentProcessor, not IPaymentProcessor",
    "Enums: PascalCase name, PascalCase members -- OrderStatus.Shipped, not status.SHIPPED",
    "Avoid noise words: use 'account' not 'accountData', 'customer' not 'customerInfo'",
    "Avoid abbreviations unless universally known: use 'message' not 'msg', but 'URL' and 'HTTP' are fine",
    "Scope-length rule: short scope = short name OK (i in loop); large scope = long descriptive name required"
  ],

  resources: [
    { label: "Clean Code, Chapter 2: Meaningful Names", kind: "book", note: "Robert C. Martin's definitive guide to naming conventions with before/after examples" },
    { label: "Refactoring, Chapter 9: Organizing Data", kind: "book", note: "Martin Fowler covers Rename Field, Rename Variable, and strategies for safe renaming across codebases" },
    { label: "PEP 8 -- Style Guide for Python Code", url: "https://peps.python.org/pep-0008/", kind: "docs", note: "The official Python naming convention reference covering modules, classes, functions, variables, and constants" },
    { label: "Google Java Style Guide: Naming", kind: "docs", note: "Google's naming rules for Java covering packages, classes, methods, constants, and type variables" },
    { label: "Domain-Driven Design by Eric Evans", kind: "book", note: "Chapters on Ubiquitous Language and Bounded Contexts explain how naming bridges code and business" },
    { label: "Naming Things in Code (CodeAesthetic YouTube)", kind: "video", note: "Visual walkthrough of naming principles with real-world refactoring examples" }
  ],

  glossary: [
    { term: "Intention-Revealing Name", definition: "A name that communicates why the thing exists, what it does, and how it should be used, without requiring the reader to look at the implementation." },
    { term: "Disinformation", definition: "Using a name that implies something false about the named entity, such as calling a Set a 'List' or using a platform-specific acronym unintentionally." },
    { term: "Noise Word", definition: "An addition to a name that provides no distinguishing information, such as 'Data', 'Info', 'Object', or 'The' prefixed to a variable or class name." },
    { term: "Ubiquitous Language", definition: "A shared vocabulary between developers and domain experts, used consistently in code, documentation, and conversation, as defined in Domain-Driven Design." },
    { term: "Hungarian Notation", definition: "A naming convention that prefixes variable names with type information (e.g., strName, iCount). Deprecated in modern typed languages but its semantic variant (Apps Hungarian) can still be useful." },
    { term: "Scope-Length Rule", definition: "The principle that the length and descriptiveness of a name should be proportional to the size of the scope in which it is used." },
    { term: "Meaningful Distinction", definition: "Using different names only when the things they refer to are genuinely different, avoiding arbitrary distinctions like 'data' vs 'info' for the same concept." }
  ]
};
