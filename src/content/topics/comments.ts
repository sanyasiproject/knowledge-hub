import type { TopicContent } from "../types";

export const comments: TopicContent = {
  quickSummary: [
    "The best comment is a well-named function or variable that makes the comment unnecessary. Comments are a compensating mechanism for when we fail to express ourselves in code.",
    "Good comments include legal notices, explanations of intent (why, not what), clarifications of obscure arguments, warnings of consequences, TODO markers, and documentation comments for public APIs.",
    "Bad comments include redundant comments that restate the code, misleading comments that lie about what the code does, mandated comments that exist to satisfy policy, journal comments replaced by version control, and noise comments that add no information.",
    "Comments rot: code changes but comments often do not. A misleading comment is worse than no comment because it actively deceives the reader."
  ],

  detailed: [
    "Legal comments are sometimes required by corporate or open-source policy. These belong at the top of source files and reference the license rather than embedding the full text: `// Copyright 2024 Acme Corp. Licensed under Apache 2.0. See LICENSE file.` Modern build tools can auto-insert these, keeping them out of developers' way.",
    "Informative comments add value when they explain something that is genuinely difficult to express in code. Regular expression patterns are a classic case: `// Matches ISO 8601 date format: YYYY-MM-DD` above a regex is valuable because the regex itself is not human-readable. Similarly, a comment explaining the return format of a method (`// Returns an empty list if the user has no permissions, never null`) provides a contract guarantee.",
    "Explanation of intent comments are the most valuable kind. They answer 'why' rather than 'what': `// We sort by age descending because the business rule prioritizes senior employees for early retirement packages`. The code shows what happens (sorting); the comment explains why this particular ordering was chosen. This context is often lost in commit messages that no one reads during debugging.",
    "Warning comments alert other developers about consequences: `// Do not run this test in parallel -- it modifies the shared database schema` or `// This method takes 10+ minutes for datasets over 1M rows`. These prevent costly mistakes that would otherwise require tribal knowledge.",
    "TODO comments are acceptable as long as they include a name, date, or ticket reference and are regularly cleaned up. `// TODO(alice, JIRA-1234): Replace with bulk insert for better performance` is useful; `// TODO: fix this later` is noise that will live forever. Many teams run linting rules that fail the build if TODOs lack a ticket reference.",
    "Bad comments fall into several categories. Redundant comments restate the obvious: `i++; // increment i`. Misleading comments describe what the code used to do but not what it does now. Mandated comments exist because a policy says every function needs a Javadoc, even private one-liners, creating boilerplate that everyone ignores. Journal comments (`// 2023-01-15 alice: fixed the null check`) are replaced by version control history. Position markers (`// ===== HELPER METHODS =====`) are a sign the class is too large and should be split.",
    "Code as documentation is the primary goal. Instead of writing a comment, rename the variable, extract a function, introduce an explaining variable, or use a well-named constant. The comment `// Check if the employee is eligible for benefits` should become `if (employee.isEligibleForBenefits())`. The comment `// 86400 is the number of seconds in a day` should become `const SECONDS_PER_DAY = 86400`."
  ],

  deepDive: [
    "The relationship between comments and design quality is inverse. A codebase that needs many comments is often poorly designed -- the abstractions are wrong, the names are unclear, or the functions are too long. Ward Cunningham's standard is that you know you are working with clean code when each function does pretty much what you expected. If you need comments to understand what a function does, the function should be rewritten, not commented.",
    "Documentation comments (Javadoc, TSDoc, Python docstrings) occupy a middle ground. For public APIs -- libraries, frameworks, SDKs -- documentation comments are essential because users cannot read the implementation. They should describe the contract (preconditions, postconditions, exceptions, thread safety), not the implementation. For internal code, the value depends on the audience: if the code is read by people who can also read the implementation, documentation comments add less value and higher maintenance cost.",
    "The 'comments as code smells' philosophy has nuances. In some domains, comments are indispensable. Algorithmic code implementing a research paper should reference the paper and annotate which line implements which equation. Financial code must explain regulatory rules that are not obvious from the logic. Concurrency code should explain synchronization strategies. The rule is not 'never comment' but 'do not use comments to compensate for bad code.'",
    "Annotation-based documentation in modern frameworks blurs the line between comments and code. Java annotations like @Deprecated, @Nullable, @ThreadSafe, and TypeScript decorators serve as machine-readable comments that tools can enforce. This is strictly superior to text comments because violations are caught at compile time rather than during code review."
  ],

  code: [
    {
      language: "java",
      caption: "Good comments vs. bad comments in Java",
      source: `// ===== GOOD COMMENTS =====

// Legal comment -- required, references external file
// Copyright 2024 Acme Corp. Licensed under Apache 2.0. See LICENSE.

// Explanation of intent -- answers WHY, not WHAT
// We use a LinkedHashMap (not HashMap) to preserve insertion order,
// because downstream consumers depend on the order of fields in the JSON output.
Map<String, Object> response = new LinkedHashMap<>();

// Clarification of obscure library behavior
// Note: Collections.sort() is stable, so equal elements retain their
// relative order from the original list. We rely on this for tie-breaking.
Collections.sort(candidates, Comparator.comparing(Candidate::getScore).reversed());

// Warning of consequences
// WARNING: This regex compilation takes ~200ms on first call.
// Cache the Pattern if calling in a loop.
Pattern pattern = Pattern.compile(COMPLEX_VALIDATION_REGEX);

// TODO with ticket reference and owner
// TODO(BILLING-4521, sarah): Migrate to streaming API to handle invoices > 100MB
byte[] invoiceData = loadEntireInvoice(invoiceId);

/**
 * Javadoc for a public API method -- describes contract, not implementation.
 *
 * @param customerId the unique identifier of the customer; must not be null
 * @return the customer's current balance, or {@link Money#ZERO} if no transactions exist
 * @throws CustomerNotFoundException if no customer exists with the given ID
 * @throws IllegalArgumentException if customerId is null or blank
 */
public Money getCustomerBalance(String customerId) {
    // ...
}


// ===== BAD COMMENTS =====

// Redundant -- restates what the code obviously does
int count = 0; // set count to zero

// Misleading -- says "returns true if active" but the code checks for non-null email
// Returns true if the user is active
public boolean isActive(User user) {
    return user.getEmail() != null; // actually checks email, not active status
}

// Mandated boilerplate -- adds no information
/**
 * Gets the name.
 * @return the name
 */
public String getName() {
    return name;
}

// Journal comment -- this belongs in version control history
// 2023-01-15 alice: Added null check
// 2023-02-20 bob: Changed return type from int to long
// 2023-03-10 alice: Fixed off-by-one error

// Noise comment -- adds zero value
// Default constructor
public Employee() {
}

// Position marker -- sign of a class that is too large
// ==================== PRIVATE METHODS ====================`
    },
    {
      language: "typescript",
      caption: "Replacing comments with self-documenting code",
      source: `// BEFORE: Comments compensate for unclear code
function process(items: any[]): number {
  let result = 0;
  for (const item of items) {
    // Skip inactive items
    if (!item.active) continue;

    // Calculate the discounted price
    let price = item.price;
    if (item.discount > 0) {
      price = price - (price * item.discount / 100);
    }

    // Add tax
    price = price * 1.18;

    // Round to 2 decimal places
    price = Math.round(price * 100) / 100;

    result += price;
  }
  return result;
}


// AFTER: Self-documenting code -- no comments needed
interface LineItem {
  readonly productName: string;
  readonly unitPrice: number;
  readonly discountPercent: number;
  readonly isActive: boolean;
}

const TAX_RATE = 0.18;

function calculateTotalWithTax(lineItems: LineItem[]): number {
  return lineItems
    .filter(isActiveItem)
    .map(calculateNetPrice)
    .map(applyTax)
    .reduce(sumAmounts, 0);
}

function isActiveItem(item: LineItem): boolean {
  return item.isActive;
}

function calculateNetPrice(item: LineItem): number {
  const discountMultiplier = 1 - item.discountPercent / 100;
  return item.unitPrice * discountMultiplier;
}

function applyTax(price: number): number {
  return roundToTwoDecimals(price * (1 + TAX_RATE));
}

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

function sumAmounts(total: number, amount: number): number {
  return total + amount;
}`
    },
    {
      language: "cpp",
      caption: "C++ Doxygen comments: when they add value vs. when they are noise",
      source: `#include <functional>
#include <thread>
#include <random>
#include <stdexcept>
#include <chrono>

// GOOD: Doxygen for a public API function with non-obvious behavior

/// @brief Execute a function with exponential backoff retry on failure.
///
/// Retries the given function up to @p max_attempts times. Each retry waits
/// base_delay_seconds * (backoff_factor ^ attempt_number) before trying
/// again. Adds up to 25% random jitter to prevent thundering herd.
///
/// @tparam T         The return type of the callable.
/// @param func       A zero-argument callable to execute. Must be idempotent
///                   since it may be called multiple times.
/// @param max_attempts Total attempts including the first call.
/// @param base_delay_seconds Initial delay before the first retry.
/// @param backoff_factor Multiplier applied to the delay after each failure.
/// @return The return value of func on success.
/// @throws The last exception thrown by func if all attempts fail.
///
/// @code
///   auto result = retry_with_backoff<std::string>(
///       [&]() { return http_client.get(url); }, 5);
/// @endcode
template <typename T>
T retry_with_backoff(
    std::function<T()> func,
    int max_attempts = 3,
    double base_delay_seconds = 1.0,
    double backoff_factor = 2.0)
{
    std::exception_ptr last_exception;
    std::mt19937 rng(std::random_device{}());

    for (int attempt = 0; attempt < max_attempts; ++attempt) {
        try {
            return func();
        } catch (...) {
            last_exception = std::current_exception();
            if (attempt < max_attempts - 1) {
                double delay = base_delay_seconds * std::pow(backoff_factor, attempt);
                std::uniform_real_distribution<double> jitter_dist(0.0, 0.25 * delay);
                std::this_thread::sleep_for(
                    std::chrono::duration<double>(delay + jitter_dist(rng)));
            }
        }
    }
    std::rethrow_exception(last_exception);
}


// BAD: Doxygen that restates the obvious

/** @brief Add two integers.
 *  @param a The first integer.
 *  @param b The second integer.
 *  @return The sum of a and b.
 */
int add(int a, int b) {
    return a + b;
}
// The function signature already tells you everything. No doc comment needed.


// GOOD: Brief doc comment explaining non-obvious business logic

/// @brief Determine loyalty tier based on 12-month rolling spend.
///
/// Business rule (Product Decision #147): Tiers reset on the customer's
/// anniversary date, not the calendar year. Spend from refunded orders
/// is excluded per Finance policy updated 2024-03.
LoyaltyTier calculate_loyalty_tier(const Customer& customer) {
    auto rolling_spend = get_rolling_spend_excluding_refunds(customer);
    return tier_from_spend(rolling_spend);
}`
    }
  ],

  diagrams: [
    {
      title: "Comment Decision Flowchart",
      kind: "flow",
      caption: "Decision tree: Can you rename a variable/function to eliminate the comment? -> Yes: rename and delete comment. No -> Does the comment explain WHY (not WHAT)? -> Yes: keep the comment. No -> Does it warn about consequences or clarify non-obvious behavior? -> Yes: keep it. No -> Delete it, it is likely noise or will become misleading."
    },
    {
      title: "Good vs Bad Comments Taxonomy",
      kind: "mindmap",
      caption: "Mindmap showing two branches: Good Comments (legal, explanation of intent, clarification, warning, TODO with ticket, API documentation) and Bad Comments (redundant, misleading, mandated/boilerplate, journal, noise, position markers, commented-out code, attribution)."
    }
  ],

  animations: [
    {
      title: "Eliminating a Comment by Improving the Code",
      steps: [
        { label: "Spot the comment", detail: "You find `// Check if user is eligible for premium features` above a complex conditional expression with multiple boolean checks." },
        { label: "Extract a boolean function", detail: "Move the conditional logic into a method named `isEligibleForPremiumFeatures()`. The function name now says exactly what the comment said." },
        { label: "Delete the comment", detail: "The comment is now redundant -- the code itself communicates the intent through its name. Delete the comment to prevent future rot." },
        { label: "Verify readability", detail: "The calling code now reads: `if (user.isEligibleForPremiumFeatures())` which is clearer than the comment ever was because it is executable and verifiable." },
        { label: "Add a WHY comment if needed", detail: "If the eligibility rules are non-obvious (e.g., regulatory), add an intent comment inside the function: `// Per GDPR Article 22, users who opted out of profiling are excluded from premium targeting.`" }
      ]
    }
  ],

  comparison: {
    columns: ["Comment Type", "Good or Bad", "Example", "Better Alternative"],
    rows: [
      ["Redundant", "Bad", "// increment counter\\ni++", "Delete the comment -- the code is obvious"],
      ["Intent explanation", "Good", "// Use insertion order to match legacy API contract", "Keep -- the code cannot express this business reason"],
      ["Misleading", "Bad", "// Returns the user's age (but actually returns birth year)", "Fix the comment or rename the function to match behavior"],
      ["Warning", "Good", "// Not thread-safe -- synchronize externally", "Keep, or use @NotThreadSafe annotation if available"],
      ["TODO with ticket", "Good", "// TODO(PERF-123): Replace O(n^2) search with index", "Keep temporarily -- clean up when the ticket is resolved"],
      ["TODO without ticket", "Bad", "// TODO: fix this", "Add a ticket reference or fix it now"],
      ["Journal", "Bad", "// 2023-01-15 alice: changed sort order", "Delete -- this information lives in git history"],
      ["API documentation", "Good", "/** @throws IOException if the file cannot be read */", "Keep for public APIs -- callers need contract documentation"],
      ["Mandated boilerplate", "Bad", "/** Gets the name. @return the name */", "Delete -- trivial getters need no documentation"],
      ["Commented-out code", "Bad", "// oldValue = computeOld(x); // unused since 2022", "Delete it -- version control preserves it if needed"]
    ]
  },

  interviewQA: [
    {
      q: "Why does Clean Code say that comments are a 'failure'?",
      a: "Robert C. Martin argues that comments represent a failure to express yourself in code. If you need a comment to explain what a block of code does, you should first try to make the code self-explanatory: rename variables, extract functions, use meaningful constants. Comments are a compensating mechanism -- sometimes necessary, but always a sign that the code could potentially be clearer. The failure is not in writing the comment but in not making the code expressive enough to stand alone.",
      followUps: [
        "Are there domains where this philosophy does not apply?",
        "How do you balance this with the need for onboarding documentation in complex systems?",
        "Does this advice change for dynamically typed languages where the code reveals less?"
      ]
    },
    {
      q: "What is the difference between a 'what' comment and a 'why' comment?",
      a: "A 'what' comment describes what the code does: `// sort the list by price`. This is redundant because anyone reading `list.sort(byPrice)` can see that. A 'why' comment explains the business reason or design decision: `// Sort by price ascending because the product team found that users convert 23% more when cheaper options appear first (A/B test GROWTH-456)`. The 'why' cannot be expressed in code and provides context that would otherwise be lost.",
      followUps: [
        "Should 'why' comments reference tickets, experiments, or external documents?",
        "How do you prevent 'why' comments from becoming stale as business rules change?",
        "Where should architectural 'why' decisions live -- comments, ADRs, or wikis?"
      ]
    },
    {
      q: "When are documentation comments (Javadoc, TSDoc, docstrings) valuable?",
      a: "Documentation comments are most valuable for public APIs consumed by developers who cannot read the implementation: library methods, SDK functions, framework hooks. They should describe the contract -- preconditions, postconditions, exceptions thrown, thread safety, and edge cases -- not the algorithm. For internal code, documentation comments have diminishing returns because readers can inspect the source. Mandated documentation on trivial methods like getters and setters is actively harmful because it creates noise that developers learn to ignore.",
      followUps: [
        "How do you decide which internal methods deserve documentation comments?",
        "Should private methods ever have documentation comments?",
        "How do tools like Swagger/OpenAPI relate to code-level documentation?"
      ]
    },
    {
      q: "What should you do when you encounter commented-out code?",
      a: "Delete it. Commented-out code is one of the most insidious forms of bad comments. It sits in the codebase forever because no one knows why it was commented out, so no one dares delete it. Maybe it was experimental. Maybe it was a rollback. Maybe it is important. The answer is always the same: version control preserves every line ever written. If the code is needed again, it can be recovered from git history. Leaving it in place confuses readers, clutters the file, and is never maintained when surrounding code changes.",
      followUps: [
        "What if the commented-out code contains a useful algorithm for future reference?",
        "How do you handle this in code reviews -- is there a polite way to flag it?",
        "Are there linting rules that can automatically flag commented-out code?"
      ]
    },
    {
      q: "How do you handle the 'TODO' problem -- TODOs that never get resolved?",
      a: "The solution is process, not discipline. Require every TODO to include a ticket reference (e.g., `TODO(JIRA-1234)`). Run a CI check that fails the build if a TODO lacks a reference. Periodically run a report that lists all TODOs in the codebase with their associated ticket statuses -- any TODO whose ticket is closed or abandoned should be removed. Some teams go further and set an expiration date on TODOs: `TODO(PERF-789, expires: 2024-06-01)` with a CI rule that fails the build after the date.",
      followUps: [
        "What about FIXME, HACK, and XXX markers -- should they follow the same rules?",
        "Is it better to fix the issue immediately rather than writing a TODO?",
        "How do you handle TODOs in open-source projects where there is no ticket system?"
      ]
    },
    {
      q: "Can you give an example of a comment that is both good and will remain good over time?",
      a: "A comment that references an external, immutable fact is unlikely to rot. For example: `// Per RFC 7231 Section 6.5.1, a 400 response MUST include a body explaining the error` or `// IEEE 754 floating point: 0.1 + 0.2 != 0.3, so we use BigDecimal for currency`. These comments explain constraints imposed by standards or mathematical realities that will not change. Similarly, comments that reference specific regulatory requirements (`// GDPR Article 17: Right to erasure -- we must delete all PII within 30 days of request`) are valuable because the regulation is the source of truth and changes are versioned.",
      followUps: [
        "What about comments that reference internal architecture decisions -- do those age well?",
        "How do you link a code comment to an external document without the link rotting?"
      ]
    }
  ],

  followUps: [
    "How do AI code assistants change the economics of code documentation?",
    "What is the role of Architecture Decision Records (ADRs) as a replacement for design comments?",
    "How should comments differ in test code versus production code?",
    "What are the best tools for enforcing comment quality in CI pipelines?",
    "How do you document a complex algorithm without over-commenting?",
    "Should comments be written for the current team or for future developers who know less context?"
  ],

  mcqs: [
    {
      q: "Which of the following is an example of a GOOD comment?",
      options: [
        "// increment i by 1",
        "// Set the count to zero",
        "// We use a LinkedHashMap to preserve insertion order for JSON serialization",
        "// Default constructor"
      ],
      answerIndex: 2,
      explanation: "This comment explains WHY a specific implementation choice was made (LinkedHashMap for insertion order). The others are redundant or noise."
    },
    {
      q: "What should you do when you find commented-out code in a codebase?",
      options: [
        "Leave it in case someone needs it later",
        "Add a comment explaining why it was commented out",
        "Delete it -- version control preserves the history",
        "Move it to a separate 'archive' file"
      ],
      answerIndex: 2,
      explanation: "Commented-out code should be deleted. Git preserves all historical code. Leaving commented-out code creates confusion and clutter."
    },
    {
      q: "What is the best alternative to writing a comment like '// check if user is eligible'?",
      options: [
        "Write a longer, more detailed comment",
        "Extract the condition into a method named isEligible()",
        "Add a unit test that verifies the eligibility check",
        "Use a named constant for the eligibility threshold"
      ],
      answerIndex: 1,
      explanation: "Extracting the condition into a well-named method replaces the comment with executable, verifiable code that communicates the same intent."
    },
    {
      q: "What makes a TODO comment acceptable?",
      options: [
        "It starts with the word TODO",
        "It includes a ticket reference and an owner",
        "It is placed at the end of the line",
        "It explains what the code currently does"
      ],
      answerIndex: 1,
      explanation: "A TODO is acceptable when it references a tracked ticket and has an owner, ensuring it will be addressed. Orphaned TODOs without tracking live forever."
    },
    {
      q: "When are documentation comments (Javadoc/TSDoc) most valuable?",
      options: [
        "On every method, as a matter of policy",
        "On private helper methods to explain implementation details",
        "On public API methods consumed by developers who cannot read the source",
        "On getter and setter methods"
      ],
      answerIndex: 2,
      explanation: "Documentation comments are most valuable for public APIs where consumers cannot see the implementation. They describe the contract, not the algorithm."
    },
    {
      q: "Which type of comment is most resistant to becoming stale?",
      options: [
        "A comment describing what the code does step by step",
        "A comment referencing an external standard or RFC",
        "A comment explaining the current implementation approach",
        "A comment listing the last 5 developers who modified the file"
      ],
      answerIndex: 1,
      explanation: "Comments referencing external, immutable standards (RFCs, IEEE specs, regulations) are unlikely to rot because the referenced facts do not change."
    }
  ],

  exercises: [
    "Audit a module in your codebase and classify every comment as good (intent, warning, clarification, legal, API doc) or bad (redundant, misleading, noise, journal, mandated). Delete all bad comments and replace at least three with self-documenting code.",
    "Find a function that has inline comments explaining each step. Refactor it by extracting each commented block into a well-named function. Verify that the parent function reads cleanly without any comments.",
    "Search your codebase for all TODO comments. For each one, determine whether it has a ticket reference. Create tickets for orphaned TODOs and add references, or delete TODOs that are no longer relevant.",
    "Take a complex regular expression in your code and write a good clarification comment for it. Then consider whether the regex should be broken into named parts or replaced with a parser for better readability.",
    "Review the documentation comments (Javadoc/TSDoc/docstrings) in a public API module. Identify any that describe implementation rather than contract, and rewrite them to focus on preconditions, postconditions, exceptions, and edge cases."
  ],

  flashcards: [
    { front: "What is the primary purpose of a code comment?", back: "To express something that the code itself cannot: the WHY behind a decision, a warning about consequences, or a clarification of non-obvious behavior. If the comment restates the code, it is noise." },
    { front: "Name three types of good comments.", back: "1) Explanation of intent (why a decision was made). 2) Warning of consequences (performance, thread safety). 3) API documentation for public contracts (preconditions, postconditions, exceptions)." },
    { front: "Name three types of bad comments.", back: "1) Redundant comments that restate the code. 2) Misleading comments that no longer match the code. 3) Journal comments that belong in version control history." },
    { front: "What should you do before writing a comment?", back: "Ask: Can I rename a variable, extract a function, or introduce a constant to make this comment unnecessary? Comments should be a last resort, not a first instinct." },
    { front: "Why is commented-out code harmful?", back: "Nobody knows why it was commented out, so nobody dares delete it. It rots as surrounding code changes, creates confusion, and clutters the file. Version control preserves history; delete the code." },
    { front: "What makes a TODO comment acceptable?", back: "It includes a ticket reference (e.g., JIRA-1234), an owner, and optionally an expiration date. CI rules should enforce this format and flag orphaned TODOs." },
    { front: "When should you write documentation comments (Javadoc/TSDoc)?", back: "For public APIs consumed by developers who cannot read the source. Focus on the contract: preconditions, postconditions, exceptions, thread safety, and edge cases. Do not describe the algorithm." }
  ],

  revisionNotes: [
    "Comments are a compensating mechanism -- prefer making the code self-documenting through better names, smaller functions, and meaningful constants.",
    "Good comments explain WHY (intent, business rules, design decisions), not WHAT (which the code already shows).",
    "Warning comments prevent costly mistakes: performance traps, thread-safety issues, side effects.",
    "API documentation comments describe the contract (pre/postconditions, exceptions), not the implementation.",
    "Bad comments include: redundant, misleading, mandated boilerplate, journal entries, position markers, and commented-out code.",
    "Commented-out code should be deleted immediately -- git preserves history.",
    "TODOs must have ticket references; orphaned TODOs should be caught by CI rules.",
    "Comments rot because code changes but comments often do not. A misleading comment is worse than no comment."
  ],

  cheatSheet: [
    "Before writing a comment, ask: can I rename, extract, or restructure to make it unnecessary?",
    "Good: WHY comments -- explain business rules, design decisions, regulatory requirements",
    "Good: WARNING comments -- flag performance traps, thread safety, non-obvious side effects",
    "Good: API docs -- describe contract (pre/post conditions, exceptions) for public methods",
    "Good: Clarification -- explain regex patterns, magic numbers tied to external specs",
    "Bad: Redundant -- do not restate what the code obviously does",
    "Bad: Misleading -- update or delete comments that no longer match the code",
    "Bad: Journal -- git log replaces change-history comments",
    "Bad: Commented-out code -- delete it, git preserves everything",
    "TODO format: TODO(TICKET-123, owner): description. Enforce via CI linting."
  ],

  resources: [
    { label: "Clean Code, Chapter 4: Comments", kind: "book", note: "Robert C. Martin's comprehensive guide to good and bad comments with extensive examples" },
    { label: "Code Complete, Chapter 32: Self-Documenting Code", kind: "book", note: "Steve McConnell's balanced view on when comments add value and when they indicate design issues" },
    { label: "A Philosophy of Software Design, Chapter 12-13", kind: "book", note: "John Ousterhout argues for more comments than Clean Code recommends, especially for 'cognitive load' reduction" },
    { label: "Google Style Guides (Java, Python, TypeScript)", kind: "docs", note: "Google's comment and documentation standards with examples of required vs. optional comments" },
    { label: "The Art of Readable Code, Chapter 5-6", kind: "book", note: "Dustin Boswell covers commenting best practices with a focus on the reader's perspective" }
  ],

  glossary: [
    { term: "Intent Comment", definition: "A comment that explains WHY the code does something rather than WHAT it does. The most valuable type of comment because the reasoning cannot be expressed in code alone." },
    { term: "Redundant Comment", definition: "A comment that restates what the code already clearly expresses. Adds noise and maintenance burden without providing additional information." },
    { term: "Documentation Comment", definition: "A structured comment (Javadoc, TSDoc, docstring) that describes a public API's contract: parameters, return values, exceptions, and behavior. Consumed by documentation generators." },
    { term: "Comment Rot", definition: "The phenomenon where comments become misleading over time because the code they describe changes but the comments are not updated." },
    { term: "Self-Documenting Code", definition: "Code that communicates its purpose and behavior through clear naming, small functions, and good structure, minimizing the need for comments." },
    { term: "Noise Comment", definition: "A comment that adds no information whatsoever, such as '// default constructor' or '// the name field'. These teach developers to ignore all comments." },
    { term: "Journal Comment", definition: "A comment that logs who changed what and when. Made obsolete by version control systems like Git." }
  ]
};
