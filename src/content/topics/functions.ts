import type { TopicContent } from "../types";

export const functions: TopicContent = {
  quickSummary: [
    "Functions should be small -- ideally under 20 lines -- because small functions are easier to name, understand, test, and reuse. If a function does not fit on a single screen, it is probably doing too much.",
    "Every function should do one thing, do it well, and do it only. If a function performs multiple steps, each step should be one level of abstraction below the function's name, and those steps should be extractable into their own functions.",
    "The ideal number of function arguments is zero (niladic), followed by one (monadic), then two (dyadic). Three arguments (triadic) should be avoided, and more than three requires strong justification -- consider wrapping related arguments into a parameter object.",
    "Functions should have no side effects: a function named 'checkPassword' should not also initialize a session. Command-Query Separation says a function should either change state (command) or return information (query), never both."
  ],

  detailed: [
    "The 'do one thing' rule has a precise definition: a function does one thing if you cannot meaningfully extract another function from it with a name that is not merely a restatement of its implementation. If you can extract a 'validateInput' step and an 'executeQuery' step from a function called 'processRequest', then processRequest is doing at least two things.",
    "The Stepdown Rule says that code should read like a top-down narrative. Every function should be followed by those at the next level of abstraction, so that reading the program is like reading a set of 'TO' paragraphs: 'To render the page, we include headers, then the content, then the footer. To include headers, we...' This keeps each function at a single level of abstraction.",
    "Function arguments form part of the function's conceptual weight. A monadic function like 'fileExists(path)' has a clear, natural form. A dyadic function like 'assertEquals(expected, actual)' forces the reader to remember argument order. Flag arguments (booleans) are particularly bad because they signal the function does two things -- one when the flag is true, another when false. Split it into two functions instead.",
    "Side effects are lies: if a function promises to do one thing but also modifies global state, writes to a file, or changes its arguments, callers cannot trust it. Temporal coupling -- where a function can only be called at certain times because of hidden side effects -- makes code fragile. Pure functions (no side effects, same input always produces same output) are the gold standard for testability and reasoning.",
    "Command-Query Separation (CQS), coined by Bertrand Meyer, states that a method should either be a command that performs an action (and returns void) or a query that returns data (and has no side effects), but not both. This prevents confusing patterns like 'if (set(\"username\", \"bob\"))' where the reader cannot tell if 'set' returns the old value, a success flag, or modifies state. Exceptions exist: stack.pop() is both a query and a command, and is universally understood.",
    "Extracting functions is the most common refactoring. The trigger is whenever you feel the need to write a comment explaining what a block of code does -- extract that block into a function whose name replaces the comment. The extracted function documents the intent, reduces the parent function's complexity, and can be tested independently."
  ],

  deepDive: [
    "The relationship between function size and cyclomatic complexity is well-studied. McCabe's cyclomatic complexity measures the number of independent paths through a function. Small functions naturally have low complexity (1-4), making them fully testable with a handful of cases. Large functions can easily reach complexity 20+, requiring hundreds of test cases for full branch coverage. Many teams enforce complexity limits (e.g., max 10) through static analysis tools like SonarQube, ESLint (complexity rule), or Pylint.",
    "The argument against flag arguments runs deeper than readability. A boolean parameter doubles the function's behavior space, making it harder to name, document, and test. Martin Fowler's 'Replace Flag Argument with Overloading' and 'Replace Conditional with Polymorphism' are the standard remedies. In TypeScript and Python, discriminated unions and literal types provide a middle ground: `render(mode: 'draft' | 'published')` is more readable than `render(isDraft: boolean)` because it is self-documenting and extensible.",
    "Functional programming takes the 'no side effects' principle to its logical extreme. In Haskell, side effects are encoded in the type system (IO monad), making it impossible to accidentally mix pure and impure code. In pragmatic languages like TypeScript and Python, the discipline is voluntary: push side effects to the edges of the system (controllers, entry points) and keep the core logic pure. This 'functional core, imperative shell' pattern, popularized by Gary Bernhardt, produces highly testable code.",
    "The concept of function 'levels of abstraction' maps to the idea of stratified design from Structure and Interpretation of Computer Programs. Each layer of your system is a new language built on the layer below. High-level functions read like domain operations (processOrder, sendNotification), medium-level functions handle data transformation (calculateTax, formatAddress), and low-level functions deal with infrastructure (readFile, executeQuery). Mixing levels within a single function is the most common violation of the Stepdown Rule."
  ],

  code: [
    {
      language: "java",
      caption: "Refactoring a large function into small, single-purpose functions",
      source: `// BAD: This function does too many things at too many levels of abstraction
public void processEmployeePayroll(List<Employee> employees) {
    for (Employee emp : employees) {
        if (emp.getStatus().equals("ACTIVE")) {
            double baseSalary = emp.getBaseSalary();
            double bonus = 0;
            if (emp.getPerformanceRating() > 8) {
                bonus = baseSalary * 0.15;
            } else if (emp.getPerformanceRating() > 5) {
                bonus = baseSalary * 0.08;
            }
            double tax = (baseSalary + bonus) * 0.30;
            double netPay = baseSalary + bonus - tax;
            emp.setNetPay(netPay);
            emailService.send(emp.getEmail(), "Pay slip", "Net: " + netPay);
            database.save(emp);
        }
    }
}

// GOOD: Each function does one thing at one level of abstraction
public void processEmployeePayroll(List<Employee> employees) {
    employees.stream()
        .filter(Employee::isActive)
        .forEach(this::processPayrollForEmployee);
}

private void processPayrollForEmployee(Employee employee) {
    PaySlip paySlip = calculatePaySlip(employee);
    employee.recordPayment(paySlip);
    notifyEmployee(employee, paySlip);
    savePayrollRecord(employee);
}

private PaySlip calculatePaySlip(Employee employee) {
    Money baseSalary = employee.getBaseSalary();
    Money bonus = calculateBonus(employee);
    Money grossPay = baseSalary.add(bonus);
    Money tax = calculateTax(grossPay);
    return new PaySlip(baseSalary, bonus, tax, grossPay.subtract(tax));
}

private Money calculateBonus(Employee employee) {
    int rating = employee.getPerformanceRating();
    if (rating > 8) return employee.getBaseSalary().multiplyBy(0.15);
    if (rating > 5) return employee.getBaseSalary().multiplyBy(0.08);
    return Money.ZERO;
}

private Money calculateTax(Money grossPay) {
    return grossPay.multiplyBy(TAX_RATE);
}

private void notifyEmployee(Employee employee, PaySlip paySlip) {
    emailService.sendPaySlip(employee.getEmail(), paySlip);
}

private void savePayrollRecord(Employee employee) {
    payrollRepository.save(employee);
}`
    },
    {
      language: "typescript",
      caption: "Command-Query Separation and parameter objects",
      source: `// BAD: Mixing command and query -- does this modify state or return data?
function setAndGetPreviousValue(key: string, newValue: string): string {
  const oldValue = cache.get(key);  // query
  cache.set(key, newValue);          // command
  return oldValue;                   // also a query
}

// GOOD: Separated into query and command
function getValue(key: string): string | undefined {
  return cache.get(key);
}

function setValue(key: string, newValue: string): void {
  cache.set(key, newValue);
}

// BAD: Too many arguments, order is confusing
function createUser(
  name: string,
  email: string,
  age: number,
  role: string,
  department: string,
  isActive: boolean
): User { /* ... */ }

// GOOD: Parameter object groups related arguments
interface CreateUserRequest {
  name: string;
  email: string;
  age: number;
  role: UserRole;
  department: Department;
}

function createUser(request: CreateUserRequest): User {
  validateCreateUserRequest(request);
  const user = mapToUser(request);
  return userRepository.save(user);
}

// BAD: Flag argument -- the function does two different things
function renderPage(content: string, isDraft: boolean): string { /* ... */ }

// GOOD: Two distinct functions with clear names
function renderPublishedPage(content: string): string { /* ... */ }
function renderDraftPreview(content: string): string { /* ... */ }`
    },
    {
      language: "cpp",
      caption: "Pure functions and the functional core / imperative shell pattern",
      source: `#include <iostream>
#include <numeric>
#include <string>
#include <vector>
#include <cmath>

// --- PURE FUNCTIONS: No side effects, testable with simple assertions ---

struct OrderItem {
    std::string product_name;
    double unit_price;
    int quantity;
};

struct PricingResult {
    double subtotal;
    double discount;
    double tax;
    double total;
};

// Pure: same input always produces same output, no side effects
double sum_line_totals(const std::vector<OrderItem>& items) {
    return std::accumulate(items.begin(), items.end(), 0.0,
        [](double acc, const OrderItem& item) {
            return acc + item.unit_price * item.quantity;
        });
}

double apply_discount(double subtotal, double rate) {
    return subtotal > 100.0 ? subtotal * rate : 0.0;
}

double calculate_tax(double amount, double tax_rate = 0.18) {
    return std::round(amount * tax_rate * 100.0) / 100.0;
}

PricingResult calculate_pricing(const std::vector<OrderItem>& items,
                                double discount_rate) {
    double subtotal = sum_line_totals(items);
    double discount = apply_discount(subtotal, discount_rate);
    double taxable  = subtotal - discount;
    double tax      = calculate_tax(taxable);
    double total    = taxable + tax;
    return {subtotal, discount, tax, total};
}

// --- IMPERATIVE SHELL: Side effects live at the edges ---
// In a real application, process_order would call repositories and services.
// void process_order(const std::string& order_id) {
//     auto order = order_repository.find_by_id(order_id);   // side effect: DB
//     auto items = to_order_items(order.lines);
//     double rate = loyalty_service.get_rate(order.customer_id); // side effect
//     auto pricing = calculate_pricing(items, rate);          // PURE
//     auto invoice = create_invoice(order, pricing);          // pure: builds data
//     invoice_repository.save(invoice);                       // side effect: DB
//     notification_service.send(order.email, invoice);        // side effect
// }

int main() {
    std::vector<OrderItem> items = {
        {"Widget",  25.00, 3},
        {"Gadget",  50.00, 2},
        {"Gizmo",   15.50, 4},
    };

    auto result = calculate_pricing(items, 0.10);

    std::cout << "Subtotal: " << result.subtotal << "\\n";
    std::cout << "Discount: " << result.discount << "\\n";
    std::cout << "Tax:      " << result.tax      << "\\n";
    std::cout << "Total:    " << result.total     << "\\n";
    return 0;
}`
    },
  ],

  diagrams: [
    {
      title: "Function Abstraction Levels (Stepdown Rule)",
      kind: "architecture",
      caption: "Shows how a high-level function calls mid-level functions, which call low-level functions. Each layer operates at a single level of abstraction. High: processOrder(). Mid: validateOrder(), calculateTotal(), applyPayment(). Low: checkInventory(), computeTax(), chargeCard()."
    },
    {
      title: "Functional Core / Imperative Shell Pattern",
      kind: "architecture",
      caption: "The outer shell handles I/O (HTTP requests, database, files, APIs) and passes data to the inner pure functional core. The core computes results with no side effects and returns them to the shell, which handles persisting the results. Arrows show data flowing inward (pure) and effects flowing outward (impure)."
    }
  ],

  animations: [
    {
      title: "Extract Method Refactoring Step by Step",
      steps: [
        { label: "Identify the code block", detail: "Find a block of code inside a large function that serves a distinct purpose. It often has a comment above it explaining what it does -- that comment is a sign it should be a function." },
        { label: "Determine inputs and outputs", detail: "Identify which local variables the block reads (these become parameters) and which it modifies (these become return values). If it modifies multiple variables, consider returning a data object." },
        { label: "Create the new function", detail: "Write a new function with a descriptive name (the name replaces the comment). Copy the code block into it. Add parameters for the inputs and a return type for the output." },
        { label: "Replace the block with a call", detail: "In the original function, delete the code block and replace it with a call to the new function. Pass the required arguments and capture the return value." },
        { label: "Test and verify", detail: "Run existing tests to confirm behavior is unchanged. Add a new unit test for the extracted function in isolation. The parent function is now shorter and reads at a higher level of abstraction." }
      ]
    }
  ],

  comparison: {
    columns: ["Aspect", "Good Practice", "Bad Practice", "Rationale"],
    rows: [
      ["Size", "5-20 lines", "100+ lines", "Small functions have lower complexity and are easier to name and test"],
      ["Arguments", "0-2 arguments", "5+ arguments", "Fewer arguments mean less conceptual weight; use parameter objects for related groups"],
      ["Abstraction", "Single level per function", "Mixed levels", "Mixing high-level logic with low-level details makes the function hard to follow"],
      ["Side effects", "Pure functions where possible", "Hidden mutations", "Side effects make functions unpredictable and hard to test in isolation"],
      ["Return type", "Single clear return type", "Return null, throw, or return value randomly", "Consistent return types let callers handle results uniformly"],
      ["Naming", "Verb phrase describing action", "Generic names like doWork, handle, process", "The name should tell the reader what happens without reading the body"],
      ["Flag arguments", "Separate functions for each behavior", "Boolean parameter toggling behavior", "Flag arguments mean the function does two things; split it"],
      ["Error handling", "Separate try/catch into its own function", "Mixed business logic and error handling", "Error handling is 'one thing'; mixing it with logic violates the single-purpose rule"]
    ]
  },

  interviewQA: [
    {
      q: "What does 'do one thing' mean for a function, and how do you know if a function does more than one thing?",
      a: "A function does one thing if all the statements within it are at one level of abstraction below the function's stated name, and you cannot extract another function from it that is not merely a restatement of its implementation. For example, if a function called 'processOrder' contains inline validation logic, tax calculation, and database saving, you can extract validateOrder(), calculateTax(), and saveOrder() -- proving it was doing three things. After extraction, processOrder() just orchestrates calls, which is its one thing.",
      followUps: [
        "How do you determine the right level of granularity when extracting functions?",
        "Can a function that calls five other functions still be considered as doing 'one thing'?",
        "How does this relate to the Single Responsibility Principle for classes?"
      ]
    },
    {
      q: "Why are flag (boolean) arguments considered a code smell?",
      a: "A boolean argument loudly proclaims that the function does two things: one when the flag is true and another when it is false. It complicates the function's name (what does render(true) mean?), makes call sites unreadable (you have to look up the parameter name to understand what 'true' means), and doubles the test matrix. The fix is to replace the flag with two well-named functions: renderForPrint() and renderForScreen() instead of render(isPrintMode: boolean). If the difference is minor, you can extract the diverging behavior into a strategy passed as an argument.",
      followUps: [
        "What about enum arguments -- are they equally problematic?",
        "How do you handle the case where you need many behavioral variations, not just two?",
        "Does this advice change for private helper methods?"
      ]
    },
    {
      q: "Explain Command-Query Separation (CQS) and when it is acceptable to violate it.",
      a: "CQS states that a function should either change state (command, returns void) or return information (query, no side effects), never both. This makes code predictable: queries can be called any number of times without worry, and commands clearly signal they modify something. Acceptable violations include atomic operations like stack.pop() (removes and returns) or compareAndSwap in concurrent programming, where separating the query and command would introduce race conditions. The key is that violations should be well-known idioms, not surprises.",
      followUps: [
        "How does CQS relate to CQRS (Command Query Responsibility Segregation)?",
        "How do builders and fluent APIs interact with CQS?",
        "What about methods like Map.computeIfAbsent() -- are they CQS violations?"
      ]
    },
    {
      q: "How does the number of function arguments affect code quality?",
      a: "Each argument increases the function's conceptual weight. Niladic (zero args) functions are trivial to call and test. Monadic (one arg) functions have a clear input-output relationship. Dyadic functions (two args) introduce ordering concerns -- is it assertEquals(expected, actual) or assertEquals(actual, expected)? Triadic functions are hard to remember and test (3 args with 3 possible values each means 27 test cases). Beyond three, use a parameter object. The Introduce Parameter Object refactoring groups related arguments into a named class, which often reveals a missing domain concept.",
      followUps: [
        "How do optional parameters and default values interact with this guidance?",
        "Should constructors follow the same argument-count guidance?",
        "How does this apply in functional programming with currying?"
      ]
    },
    {
      q: "What is the Stepdown Rule and why does it matter for code readability?",
      a: "The Stepdown Rule says that a source file should read like a top-down narrative. Each function should be at a single level of abstraction, and it should be followed by the functions it calls, which are at the next level of abstraction. Reading the file from top to bottom, you descend through layers: the high-level policy at the top, then its implementation details, then their implementation details. This mirrors how humans read -- headlines first, then paragraphs, then footnotes. It allows a reader to stop at the level of detail they need without wading through implementation noise.",
      followUps: [
        "How do you organize files when functions at the same level call each other?",
        "Does the Stepdown Rule conflict with alphabetical ordering of methods?",
        "How does this apply in languages with forward declaration requirements?"
      ]
    },
    {
      q: "What is the 'functional core, imperative shell' pattern?",
      a: "This pattern, popularized by Gary Bernhardt, separates code into two categories. The functional core contains pure functions -- no side effects, no I/O, deterministic outputs for given inputs. These are trivially testable with simple assertions. The imperative shell handles all side effects: reading from databases, writing files, making HTTP calls, and user interaction. It calls into the functional core for computation and then acts on the results. This concentrates the hard-to-test, hard-to-reason-about code in a thin shell while the bulk of the logic is pure and easily verified.",
      followUps: [
        "How do you handle cases where the computation depends on I/O mid-stream?",
        "How does this pattern relate to hexagonal architecture?",
        "How do you test the imperative shell itself?"
      ]
    }
  ],

  followUps: [
    "How do closures and lambda expressions change the guidance on function size and argument counts?",
    "What tools can automatically measure function complexity and flag functions that are too large?",
    "How do async/await functions interact with the 'do one thing' principle?",
    "Should error handling functions be separated from business logic functions?",
    "How do you decide between a method on an object versus a standalone function?",
    "What is the relationship between function design and the Open/Closed Principle?"
  ],

  mcqs: [
    {
      q: "According to Clean Code principles, what is the ideal number of arguments for a function?",
      options: ["One (monadic)", "Zero (niladic)", "Two (dyadic)", "Three (triadic)"],
      answerIndex: 1,
      explanation: "Zero arguments (niladic) is ideal because it minimizes conceptual weight and makes the function trivially easy to call and test. Each additional argument increases complexity."
    },
    {
      q: "What does Command-Query Separation (CQS) state?",
      options: [
        "Commands should be separate classes from queries",
        "A function should either change state or return information, not both",
        "Database reads and writes should use different connections",
        "GET requests should not modify server state"
      ],
      answerIndex: 1,
      explanation: "CQS, coined by Bertrand Meyer, says functions should be either commands (change state, return void) or queries (return data, no side effects), but not both."
    },
    {
      q: "Why are boolean (flag) arguments considered a code smell?",
      options: [
        "They waste memory compared to enums",
        "They indicate the function does two different things based on the flag value",
        "They are not supported in all programming languages",
        "They make the function harder to compile"
      ],
      answerIndex: 1,
      explanation: "A boolean parameter signals the function has two behavioral paths, violating the 'do one thing' principle. The call site is also unreadable: render(true) is meaningless without context."
    },
    {
      q: "What is the Stepdown Rule?",
      options: [
        "Functions should be sorted alphabetically",
        "Each function should be followed by functions at the next level of abstraction, reading top-down",
        "Functions should gradually reduce their argument count",
        "Functions should decrease in size from top to bottom of the file"
      ],
      answerIndex: 1,
      explanation: "The Stepdown Rule means the source file reads like a top-down narrative: high-level functions at the top, calling mid-level functions below, which call low-level functions further down."
    },
    {
      q: "What is the 'functional core, imperative shell' pattern?",
      options: [
        "Writing the core in a functional language and the shell in an imperative language",
        "Keeping pure business logic in the core and pushing side effects to the outer layer",
        "Using functional programming for performance-critical code only",
        "A pattern for writing Unix shell scripts in a functional style"
      ],
      answerIndex: 1,
      explanation: "This pattern isolates pure, side-effect-free business logic (the core) from I/O and state mutations (the shell), making the core trivially testable and the system easier to reason about."
    },
    {
      q: "How do you know if a function does more than 'one thing'?",
      options: [
        "It has more than 10 lines of code",
        "It has more than 2 parameters",
        "You can extract another function from it that is not a restatement of its implementation",
        "It uses more than one loop or conditional"
      ],
      answerIndex: 2,
      explanation: "If you can extract a meaningfully named function from part of the body -- one that is not just restating the implementation -- then the original function was doing more than one thing."
    }
  ],

  exercises: [
    "Find the longest function in your current project. Identify distinct responsibilities within it and extract each into a well-named function. Verify that the parent function now reads as a high-level summary.",
    "Identify a function in your codebase with more than 3 parameters. Apply the Introduce Parameter Object refactoring: create a data class for the related parameters, update the function signature, and update all call sites.",
    "Find a function that has a boolean parameter. Split it into two separate functions, each handling one of the boolean's cases. Compare readability at the call sites before and after.",
    "Take a function that mixes business logic with I/O (e.g., reading from a database, computing a result, writing to a file). Refactor it into a pure function for the computation and an imperative wrapper that handles the I/O.",
    "Measure cyclomatic complexity for the 5 most complex functions in your project using a tool like SonarQube, ESLint, or radon (Python). Refactor any function with complexity above 10."
  ],

  flashcards: [
    { front: "What is the 'do one thing' rule for functions?", back: "A function should perform one clearly defined task. If you can extract a meaningful sub-function from it, the original was doing more than one thing." },
    { front: "What are the argument count categories?", back: "Niladic (0 args -- ideal), Monadic (1 arg -- good), Dyadic (2 args -- acceptable), Triadic (3 args -- avoid), Polyadic (4+ args -- requires strong justification, use parameter objects)." },
    { front: "What is Command-Query Separation?", back: "A function should either change state (command, returns void) or return data (query, no side effects), but not both. Coined by Bertrand Meyer." },
    { front: "What is the Stepdown Rule?", back: "Source files should read top-down: high-level functions first, calling functions at the next abstraction level below, creating a readable narrative from general to specific." },
    { front: "Why are flag arguments bad?", back: "They signal the function does two things. They make call sites unreadable (what does render(true) mean?). They double the test matrix. Split into two named functions instead." },
    { front: "What is a side effect in a function?", back: "An observable change beyond returning a value: modifying global state, writing to a file, changing an argument, initializing a session. Side effects make functions unpredictable and hard to test." },
    { front: "What is the 'functional core, imperative shell' pattern?", back: "Keep pure, side-effect-free business logic in the core (easy to test). Push I/O and state changes to the outer shell (thin, hard to test). The shell calls the core for computation." },
    { front: "When is it OK to violate CQS?", back: "For well-known atomic idioms like stack.pop() or compareAndSwap(), where separating query from command would introduce race conditions or be universally confusing." }
  ],

  revisionNotes: [
    "Small functions (under 20 lines) are easier to name, understand, test, and compose. Large functions are the root cause of most complexity.",
    "The 'do one thing' test: can you extract a meaningfully named function from the body? If yes, the function does more than one thing.",
    "The Stepdown Rule: read the file top-down, each function at a single abstraction level, calling helpers at the next level below.",
    "Argument count matters: 0 is best, 1 is fine, 2 is OK, 3 is suspicious, 4+ needs a parameter object.",
    "Flag arguments are a code smell -- they mean the function has two modes. Replace with two functions.",
    "Command-Query Separation: commands change state (return void), queries return data (no side effects). Do not mix.",
    "Side effects are lies: a function named checkPassword should not also start a session.",
    "Extract functions whenever you write a comment explaining a code block -- the function name replaces the comment."
  ],

  cheatSheet: [
    "Function should fit on one screen (~20 lines max)",
    "Name = verb phrase describing what it does (calculateTax, sendEmail, validateOrder)",
    "0-2 arguments; group 3+ related args into a parameter object",
    "No flag (boolean) arguments -- split into separate functions",
    "One level of abstraction per function (Stepdown Rule)",
    "No side effects -- or at least document them clearly in the name",
    "CQS: return data OR modify state, not both",
    "Extract a function whenever you write a comment above a code block",
    "Push side effects to the edges (imperative shell), keep core logic pure (functional core)",
    "Error handling is 'one thing' -- isolate try/catch into its own function"
  ],

  resources: [
    { label: "Clean Code, Chapter 3: Functions", kind: "book", note: "Robert C. Martin's definitive guide to writing clean functions with before/after examples" },
    { label: "Refactoring, Chapter 6: Composing Methods", kind: "book", note: "Martin Fowler covers Extract Method, Inline Method, Replace Temp with Query, and more" },
    { label: "Boundaries (Gary Bernhardt talk)", kind: "video", note: "The original presentation of the functional core / imperative shell pattern" },
    { label: "Structure and Interpretation of Computer Programs", kind: "book", note: "Foundational text on stratified design and abstraction layers in function composition" },
    { label: "Cyclomatic Complexity (McCabe, 1976)", kind: "paper", note: "The original paper defining the complexity metric used to measure function complexity" }
  ],

  glossary: [
    { term: "Niladic Function", definition: "A function that takes zero arguments. The ideal form because it is simplest to understand, call, and test." },
    { term: "Monadic Function", definition: "A function that takes one argument. Natural for transformations (convert), questions (fileExists), and event handlers (onButtonClick)." },
    { term: "Dyadic Function", definition: "A function that takes two arguments. Acceptable but introduces argument-ordering concerns (assertEquals: expected first or actual first?)." },
    { term: "Side Effect", definition: "Any observable state change caused by a function beyond returning its result: modifying a global variable, writing to a file, mutating an argument." },
    { term: "Command-Query Separation (CQS)", definition: "A principle stating that functions should either change state (command) or return data (query), but not both. Coined by Bertrand Meyer." },
    { term: "Stepdown Rule", definition: "The principle that source code should read top-down, with each function at a single abstraction level, followed by the functions it calls at the next level." },
    { term: "Cyclomatic Complexity", definition: "A quantitative measure of the number of linearly independent paths through a function's source code, proposed by Thomas McCabe in 1976." },
    { term: "Pure Function", definition: "A function that always returns the same output for the same input and has no side effects. The foundation of functional programming and highly testable code." }
  ]
};
