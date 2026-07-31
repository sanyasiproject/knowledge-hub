import type { TopicContent } from "../types";

export const pureFunctions: TopicContent = {
  quickSummary: [
    "A pure function always returns the same output for the same input and produces no side effects — no mutation, no I/O, no observable interaction with the outside world.",
    "Referential transparency means you can replace a function call with its result without changing program behavior. Pure functions are referentially transparent by definition.",
    "Side effects include mutating state, reading/writing files, network calls, printing to console, generating random numbers, and reading the system clock — anything beyond computing a return value.",
    "Pure functions are easier to test (no mocks needed), safe to parallelize (no shared mutable state), and can be memoized (cached by input since output is deterministic).",
  ],
  detailed: [
    "A pure function satisfies two properties: (1) determinism — given the same arguments, it always returns the same result, and (2) no side effects — it does not modify any state outside its scope or interact with the external world. The function Math.max(a, b) is pure: it depends only on its arguments and changes nothing. The function Date.now() is impure: it returns different values on each call and depends on external state (the system clock).",
    "Referential transparency is the formal property underlying purity. An expression is referentially transparent if it can be replaced with its value without changing the program's behavior. If f(3) always returns 9, you can replace every occurrence of f(3) with 9 and the program behaves identically. This property enables equational reasoning — you can reason about programs by substituting equals for equals, just like algebra.",
    "Side effects are not inherently bad — every useful program must eventually perform I/O, mutate a database, or display output. The goal is to separate pure computation from effectful operations. The 'functional core, imperative shell' pattern pushes all pure logic into an inner core that is easy to test, and confines all side effects to a thin outer shell that orchestrates I/O. This maximizes the testable, composable surface area of your codebase.",
    "Idempotency is related but distinct from purity. An idempotent operation produces the same result when applied multiple times (PUT /users/1 with the same body always yields the same state). An idempotent function may still have side effects (writing to a database) — it just guarantees that repeating the operation is safe. Pure functions are always idempotent, but idempotent functions are not always pure.",
    "Languages enforce purity to varying degrees. Haskell enforces purity at the type level — all side effects must be expressed in the IO monad, and the type system prevents mixing pure and impure code accidentally. Rust does not enforce purity but its ownership system prevents many classes of side effects (data races, dangling references). TypeScript and Python rely on discipline — there is no compiler enforcement of purity, but conventions and linting rules can help.",
  ],
  deepDive: [
    "The IO monad in Haskell is the canonical solution to the 'how do pure programs do I/O' question. An IO action is a value that describes a side effect but does not execute it. The function getLine :: IO String does not read from stdin — it returns a description of reading from stdin. The Haskell runtime executes IO actions only when they are part of the main function's IO chain. This means all Haskell functions are pure, including those that 'do I/O' — they are just building data structures that describe effects. Monadic bind (>>=) sequences these descriptions.",
    "Effect systems generalize the IO monad. Instead of one opaque IO type, languages like ZIO (Scala), Eff (OCaml), and Polysemy (Haskell) track specific effects in the type signature. A function might have type ZIO[Database & Logging, AppError, User] — indicating it needs Database and Logging capabilities, might fail with AppError, and succeeds with User. This makes dependencies explicit, enables effect interpretation (swap real database for test double), and provides finer-grained control than the all-or-nothing IO monad.",
    "Memoization is a direct consequence of purity. Since pure functions always return the same output for the same input, you can cache results by input without risking stale data. This is trivial for functions with simple arguments (numbers, strings) but requires structural hashing for complex inputs. React.useMemo and React.memo exploit this — if props haven't changed (same input), skip re-rendering (same output). Memoization is unsafe for impure functions because the cached result might not reflect the current state of the world.",
    "Testing pure functions is dramatically simpler than testing impure ones. You need no mocks, no dependency injection, no setup/teardown, no database fixtures. You just call the function with inputs and assert the output. Property-based testing (QuickCheck, fast-check) is especially powerful with pure functions — you can generate thousands of random inputs and verify properties (e.g., sort(sort(xs)) === sort(xs)) because there is no environmental state to manage. This is why maximizing the pure core of your application directly improves testability.",
    "Concurrency safety follows from purity. Pure functions cannot cause data races because they do not access shared mutable state. Two threads calling the same pure function simultaneously will always produce correct results independently. This is why functional languages like Erlang and Haskell can safely run massive concurrency — pure computations are inherently parallelizable. The MapReduce paradigm relies on map and reduce functions being pure to safely distribute computation across thousands of nodes.",
  ],
  code: [
    {
      language: "typescript",
      caption: "Pure vs impure functions — recognizing the difference",
      source: `// PURE: same input → same output, no side effects
function add(a: number, b: number): number {
  return a + b;  // depends only on arguments, mutates nothing
}

function sortArray(arr: readonly number[]): number[] {
  return [...arr].sort((a, b) => a - b);  // returns new array, does not mutate input
}

function formatName(first: string, last: string): string {
  return \`\${last}, \${first}\`;  // deterministic, no side effects
}

// IMPURE: depends on external state
let discount = 0.1;
function getPrice(base: number): number {
  return base * (1 - discount);  // depends on external 'discount' variable
}

// IMPURE: mutates external state
let callCount = 0;
function track(event: string): void {
  callCount++;  // side effect: mutates external state
  console.log(event);  // side effect: I/O
}

// IMPURE: non-deterministic
function generateId(): string {
  return Math.random().toString(36).slice(2);  // different output each call
}

// Refactoring impure → pure: make dependencies explicit
function getPricePure(base: number, discountRate: number): number {
  return base * (1 - discountRate);  // now pure — discount is an argument
}

// Functional core, imperative shell
// Pure core: all business logic, easy to test
function calculateTotal(items: { price: number; qty: number }[]): number {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function applyDiscount(total: number, rate: number): number {
  return Math.round(total * (1 - rate) * 100) / 100;
}

// Imperative shell: orchestrates I/O
async function processOrder(orderId: string): Promise<void> {
  const items = await fetchItems(orderId);        // impure: I/O
  const total = calculateTotal(items);            // pure
  const final = applyDiscount(total, 0.1);        // pure
  await saveInvoice(orderId, final);              // impure: I/O
  await sendConfirmation(orderId);                // impure: I/O
}`,
    },
    {
      language: "haskell",
      caption: "IO monad — separating effect description from execution",
      source: `-- Pure function: no IO in the type
add :: Int -> Int -> Int
add x y = x + y

-- Pure: transforms data without effects
capitalize :: String -> String
capitalize [] = []
capitalize (x:xs) = toUpper x : xs

-- IO action: describes a side effect (does not execute it)
greet :: String -> IO ()
greet name = putStrLn ("Hello, " ++ name ++ "!")

-- Composing IO actions with do-notation (monadic bind)
main :: IO ()
main = do
    putStrLn "What is your name?"   -- IO action: print
    name <- getLine                  -- IO action: read stdin
    let greeting = capitalize name   -- pure computation (let, not <-)
    greet greeting                   -- IO action: print

-- The type system enforces purity:
-- You CANNOT call an IO action from a pure function.
-- This won't compile:
-- pureFunction :: Int -> Int
-- pureFunction x = do
--     putStrLn "side effect!"  -- ERROR: can't use IO in pure context
--     return (x + 1)

-- Memoization is safe because functions are pure
memoFib :: Int -> Integer
memoFib = (map fib [0..] !!)
  where fib 0 = 0
        fib 1 = 1
        fib n = memoFib (n-1) + memoFib (n-2)`,
    },
    {
      language: "cpp",
      caption: "Pure functions, memoization, and compile-time purity",
      source: `#include <iostream>
#include <vector>
#include <unordered_map>
#include <algorithm>
#include <string>
#include <cassert>
#include <sstream>
#include <fstream>

// Pure function: deterministic, no side effects
std::vector<int> mergeSorted(const std::vector<int>& a, const std::vector<int>& b) {
    std::vector<int> result;
    result.reserve(a.size() + b.size());
    size_t i = 0, j = 0;
    while (i < a.size() && j < b.size()) {
        if (a[i] <= b[j]) {
            result.push_back(a[i++]);
        } else {
            result.push_back(b[j++]);
        }
    }
    result.insert(result.end(), a.begin() + i, a.end());
    result.insert(result.end(), b.begin() + j, b.end());
    return result;
}

// Memoization: safe because the function is pure
class Fibonacci {
public:
    long long compute(int n) {
        if (n < 2) return n;
        auto it = cache_.find(n);
        if (it != cache_.end()) return it->second;
        long long result = compute(n - 1) + compute(n - 2);
        cache_[n] = result;
        return result;
    }
private:
    std::unordered_map<int, long long> cache_;
};

// constexpr: compile-time purity enforcement (C++17)
constexpr int factorial(int n) {
    return (n <= 1) ? 1 : n * factorial(n - 1);
}
static_assert(factorial(5) == 120, "Compile-time pure computation");

// Property-based testing concept (manual approach)
void testSortIdempotent() {
    // Sorting a sorted vector gives the same result -- a property of pure sort
    std::vector<int> xs = {3, 1, 4, 1, 5, 9, 2, 6};
    auto sorted1 = xs;
    std::sort(sorted1.begin(), sorted1.end());
    auto sorted2 = sorted1;
    std::sort(sorted2.begin(), sorted2.end());
    assert(sorted1 == sorted2);  // idempotent
}

void testMergeSortedPreservesElements() {
    std::vector<int> a = {1, 3, 5};
    std::vector<int> b = {2, 4, 6};
    auto merged = mergeSorted(a, b);
    auto expected = a;
    expected.insert(expected.end(), b.begin(), b.end());
    std::sort(expected.begin(), expected.end());
    assert(merged == expected);
}

// Impure -> pure refactoring
// Pure: parses config string into key-value pairs
std::unordered_map<std::string, std::string> parseConfig(const std::string& raw) {
    std::unordered_map<std::string, std::string> config;
    std::istringstream stream(raw);
    std::string line;
    while (std::getline(stream, line)) {
        auto pos = line.find('=');
        if (pos != std::string::npos) {
            config[line.substr(0, pos)] = line.substr(pos + 1);
        }
    }
    return config;
}

// Pure: merges two config maps
std::unordered_map<std::string, std::string> mergeConfigs(
    const std::unordered_map<std::string, std::string>& base,
    const std::unordered_map<std::string, std::string>& overrides) {
    auto merged = base;
    for (const auto& [key, value] : overrides) {
        merged[key] = value;  // override wins
    }
    return merged;
}

// Shell handles I/O
std::unordered_map<std::string, std::string> loadConfig(const std::string& path) {
    std::ifstream file(path);                        // impure: I/O (thin shell)
    std::string raw((std::istreambuf_iterator<char>(file)),
                     std::istreambuf_iterator<char>());
    return parseConfig(raw);                         // pure core
}`,
    },
    {
      language: "rust",
      caption: "Ownership system as implicit purity enforcement",
      source: `// Rust's ownership prevents many accidental side effects

// Pure function — takes ownership or borrows immutably
fn sum(numbers: &[i32]) -> i32 {
    numbers.iter().sum()  // borrows immutably, no mutation possible
}

// Pure: returns new Vec, does not mutate input
fn sorted(mut numbers: Vec<i32>) -> Vec<i32> {
    numbers.sort();  // takes ownership — original is moved, not mutated
    numbers
}

// The borrow checker prevents shared mutable state
fn process(data: &mut Vec<i32>) {
    // While this &mut reference exists, no other reference to data
    // can exist — preventing data races at compile time
    data.push(42);
}

// fn data_race_prevented() {
//     let mut v = vec![1, 2, 3];
//     let r1 = &v;         // immutable borrow
//     let r2 = &mut v;     // ERROR: can't borrow mutably while immutably borrowed
//     println!("{}", r1[0]);
// }

// Functional patterns: iterators + closures for pure transformations
fn transform_pipeline(data: &[i32]) -> Vec<i32> {
    data.iter()
        .filter(|&&x| x > 0)          // pure predicate
        .map(|&x| x * 2)              // pure transformation
        .collect()                      // collect into new Vec
}

// Result type for explicit error handling (no exceptions = no hidden effects)
fn parse_age(input: &str) -> Result<u8, String> {
    input
        .trim()
        .parse::<u8>()
        .map_err(|e| format!("Invalid age: {}", e))
}

// Pure business logic, testable without mocks
#[derive(Debug, PartialEq)]
enum PricingTier { Free, Basic, Premium }

fn determine_tier(monthly_spend: f64, months_active: u32) -> PricingTier {
    match (monthly_spend, months_active) {
        (s, m) if s > 100.0 && m > 12 => PricingTier::Premium,
        (s, _) if s > 20.0 => PricingTier::Basic,
        _ => PricingTier::Free,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_tier_determination() {
        // No mocks, no setup — just input → output
        assert_eq!(determine_tier(150.0, 24), PricingTier::Premium);
        assert_eq!(determine_tier(50.0, 3), PricingTier::Basic);
        assert_eq!(determine_tier(5.0, 1), PricingTier::Free);
    }
}`,
    },
    {
      language: "scala",
      caption: "ZIO effect system — tracking effects in types",
      source: `import zio._

// ZIO[R, E, A] — needs environment R, may fail with E, succeeds with A

// Pure function — no effects needed
def calculateDiscount(price: Double, rate: Double): Double =
  price * (1 - rate)

// Effect that needs Console capability
def greetUser: ZIO[Console, Nothing, Unit] =
  for {
    _    <- Console.printLine("What is your name?").orDie
    name <- Console.readLine.orDie
    _    <- Console.printLine(s"Hello, $name!").orDie
  } yield ()

// Effect that needs Database capability, may fail with AppError
trait Database {
  def findUser(id: String): IO[AppError, User]
  def saveUser(user: User): IO[AppError, Unit]
}

def updateUserEmail(
  id: String,
  newEmail: String
): ZIO[Database, AppError, User] =
  for {
    db   <- ZIO.service[Database]
    user <- db.findUser(id)
    updated = user.copy(email = newEmail)  // pure transformation
    _    <- db.saveUser(updated)
  } yield updated

// Testing: provide a test implementation of Database
val testDb = new Database {
  private var users = Map("1" -> User("1", "old@test.com"))
  def findUser(id: String) = ZIO.fromOption(users.get(id))
    .mapError(_ => AppError.NotFound(id))
  def saveUser(user: User) = ZIO.succeed {
    users = users.updated(user.id, user)
  }
}

// Type tells you EXACTLY what effects a function needs
// No hidden surprises, no "this function secretly calls the database"`,
    },
  ],
  diagrams: [
    {
      title: "Functional Core / Imperative Shell Architecture",
      kind: "architecture",
      caption: "Pure business logic in the core (testable, composable). Impure I/O in the outer shell (thin, orchestrating). Data flows inward as arguments, outward as return values.",
    },
    {
      title: "Side Effect Categories",
      kind: "mindmap",
      caption: "Classification of side effects: State mutation (variables, collections), I/O (files, network, console), Non-determinism (random, time, threading), Exceptions (thrown errors, panics).",
    },
    {
      title: "IO Monad Execution Flow",
      kind: "flow",
      caption: "Pure functions build IO action descriptions. The runtime executes the description tree. At no point does a pure function perform a side effect — it only constructs a blueprint.",
    },
  ],
  animations: [
    {
      title: "Refactoring Impure to Pure",
      steps: [
        { label: "Identify the impure function", detail: "processOrder() reads from database, calculates totals, writes invoice, sends email — mixing I/O with business logic." },
        { label: "Extract pure computations", detail: "Pull out calculateTotal(items) and applyDiscount(total, rate) as standalone pure functions. They take data in, return data out." },
        { label: "Create the thin shell", detail: "processOrder() now only orchestrates: fetch data (I/O), call pure functions, write results (I/O). The shell is thin and linear." },
        { label: "Test the pure core", detail: "calculateTotal and applyDiscount can be tested with simple assertions — no database mocks, no email stubs, no setup/teardown." },
      ],
    },
    {
      title: "Memoization of Pure Functions",
      steps: [
        { label: "First call: fib(5)", detail: "No cached result. Recursively computes fib(4) + fib(3). Each sub-call is also cached after computation." },
        { label: "Cache populated", detail: "Cache now holds: fib(0)=0, fib(1)=1, fib(2)=1, fib(3)=2, fib(4)=3, fib(5)=5." },
        { label: "Second call: fib(5)", detail: "Cache hit. Returns 5 immediately without any computation. Safe because fib is pure — same input always gives same output." },
        { label: "Call fib(6)", detail: "Only needs to compute fib(6) = fib(5) + fib(4). Both are cached. O(1) instead of O(2^n)." },
      ],
    },
  ],
  comparison: {
    columns: ["Aspect", "Pure Function", "Impure Function"],
    rows: [
      ["Determinism", "Always same output for same input", "May return different results (time, random, external state)"],
      ["Side effects", "None — only computes and returns", "May mutate state, perform I/O, throw exceptions"],
      ["Testability", "Trivial — just assert input/output", "Requires mocks, stubs, fixtures, setup/teardown"],
      ["Memoization", "Safe — cache by input", "Unsafe — cached result may be stale"],
      ["Parallelism", "Safe — no shared mutable state", "Requires synchronization (locks, atomics)"],
      ["Referential transparency", "Yes — can substitute call with result", "No — substitution may change behavior"],
      ["Debugging", "Easy — output depends only on input", "Hard — must consider all external state"],
      ["Composability", "High — pipe output to next function", "Low — hidden dependencies create coupling"],
    ],
  },
  interviewQA: [
    {
      q: "What makes a function pure?",
      a: "A pure function satisfies two conditions: (1) determinism — it always returns the same output for the same input, and (2) no side effects — it does not modify any state outside its scope or interact with the external world (no I/O, no mutation of global variables, no reading the clock). Examples: Math.max(a, b) is pure; Date.now() is impure (non-deterministic); array.push(x) is impure (mutates state).",
      followUps: [
        "Is a function that throws an exception pure?",
        "Is a function that reads from a constant/config pure?",
      ],
    },
    {
      q: "What is referential transparency?",
      a: "An expression is referentially transparent if it can be replaced with its value without changing the program's behavior. For example, if f(3) always returns 9, then everywhere f(3) appears, you can substitute 9 and the program behaves identically. Pure functions are referentially transparent. Referential transparency enables equational reasoning — reasoning about programs by substituting equals for equals, like in algebra.",
    },
    {
      q: "How does the 'functional core, imperative shell' pattern work?",
      a: "You structure your application with a pure core containing all business logic (calculations, validations, transformations) and a thin impure shell that handles I/O (database, network, filesystem, user interaction). The shell reads data from the world, passes it into the pure core as arguments, gets results back, and writes those results to the world. This maximizes the testable, composable surface area and confines hard-to-test I/O to a minimal shell.",
      followUps: [
        "How does this relate to hexagonal architecture?",
        "What does the shell look like in practice?",
      ],
    },
    {
      q: "What is the difference between purity and idempotency?",
      a: "A pure function has no side effects and is deterministic. An idempotent operation can be applied multiple times without changing the result beyond the first application — but it MAY have side effects. For example, HTTP PUT is idempotent (sending the same body repeatedly produces the same state) but not pure (it writes to a database). All pure functions are idempotent, but not all idempotent operations are pure.",
    },
    {
      q: "How does Haskell enforce purity?",
      a: "Haskell's type system separates pure and impure code via the IO monad. Functions that perform side effects have IO in their return type (e.g., getLine :: IO String). Pure functions cannot call IO functions — the type system prevents it at compile time. IO actions are values that describe effects; they are only executed when composed into the main function's IO chain. This means all Haskell functions are technically pure — even I/O functions just build descriptions of effects.",
      followUps: [
        "What are the practical implications of the IO monad for testing?",
        "How do effect systems like ZIO improve on the IO monad?",
      ],
    },
    {
      q: "Why are pure functions easier to test?",
      a: "Pure functions depend only on their arguments and produce only a return value. This means testing requires no mocks, no dependency injection, no database fixtures, no setup/teardown. You simply call the function with known inputs and assert the output. Property-based testing is especially powerful — you can verify invariants (sort is idempotent, reverse of reverse is identity) across thousands of generated inputs with no environmental concerns.",
    },
    {
      q: "Why are pure functions safe for concurrent execution?",
      a: "Pure functions do not access shared mutable state. Two threads calling the same pure function simultaneously cannot interfere with each other because neither modifies anything — they only read their arguments and compute a return value. This eliminates data races, the need for locks, and the entire class of concurrency bugs related to shared state. This is why MapReduce requires map and reduce functions to be pure — it enables safe distribution across thousands of nodes.",
    },
  ],
  followUps: [
    "Immutability — immutable data is the complement of pure functions; together they eliminate shared mutable state",
    "Functional Programming Fundamentals — higher-order functions, closures, currying",
    "Monads and Functors — the IO monad, Maybe/Option, and other effect containers",
    "Reactive Programming — streams as lazy, composable effect descriptions",
    "Testing Strategies — property-based testing, snapshot testing, and how purity enables them",
    "Concurrency & Parallelism — how purity eliminates data races",
  ],
  mcqs: [
    {
      q: "Which of the following is a pure function?",
      options: [
        "function now() { return Date.now(); }",
        "function add(a, b) { return a + b; }",
        "function log(msg) { console.log(msg); return msg; }",
        "function rand() { return Math.random(); }",
      ],
      answerIndex: 1,
      explanation: "add(a, b) depends only on its arguments and produces no side effects. now() and rand() are non-deterministic. log() has a side effect (console output).",
    },
    {
      q: "What is referential transparency?",
      options: [
        "A function that can see variables in its parent scope",
        "An expression that can be replaced with its value without changing program behavior",
        "A transparent proxy that intercepts function calls",
        "A function that returns a reference instead of a value",
      ],
      answerIndex: 1,
      explanation: "Referential transparency means an expression can be substituted with its computed value without affecting the program. This is the defining property of pure expressions.",
    },
    {
      q: "Why is memoization safe for pure functions but not impure ones?",
      options: [
        "Memoization requires more memory for impure functions",
        "Pure functions always return the same output for the same input, so cached results are always valid",
        "Impure functions cannot be called with the same arguments twice",
        "Memoization only works with numeric arguments",
      ],
      answerIndex: 1,
      explanation: "Since pure functions are deterministic, caching the result of f(x) is guaranteed to be correct for all future calls with x. An impure function might return a different result next time (e.g., reading from a database that changed), making the cached value stale.",
    },
    {
      q: "In the 'functional core, imperative shell' pattern, where does I/O happen?",
      options: [
        "In the pure functional core",
        "Distributed throughout all layers",
        "In the thin outer imperative shell",
        "In a separate I/O thread",
      ],
      answerIndex: 2,
      explanation: "All I/O (database, network, filesystem) is confined to the imperative shell. The functional core contains only pure business logic that takes data as arguments and returns results. The shell orchestrates data flow between I/O and the pure core.",
    },
    {
      q: "How does Haskell's IO monad enforce purity?",
      options: [
        "It runs all I/O in a separate process",
        "It makes side-effectful functions return IO types that pure functions cannot call",
        "It encrypts I/O operations",
        "It logs all side effects for auditing",
      ],
      answerIndex: 1,
      explanation: "Functions with side effects return IO a types. The type system prevents pure functions from calling IO functions — you can only compose IO actions within other IO contexts. This creates a compile-time boundary between pure and impure code.",
    },
    {
      q: "What is the relationship between purity and idempotency?",
      options: [
        "They are the same thing",
        "All pure functions are idempotent, but not all idempotent functions are pure",
        "All idempotent functions are pure, but not all pure functions are idempotent",
        "They are completely unrelated concepts",
      ],
      answerIndex: 1,
      explanation: "Pure functions are always idempotent (calling them repeatedly with the same input always gives the same result). But idempotent operations can have side effects (e.g., HTTP PUT writes to a database, which is a side effect, but the result is the same if repeated).",
    },
  ],
  exercises: [
    "Take an impure function that reads a config file, transforms the data, and writes the result to a database. Refactor it into a pure core (data transformation) and an impure shell (file read + database write). Write tests for the pure core without any mocks.",
    "Implement a memoize() higher-order function in TypeScript that caches results of any pure function. Handle multi-argument functions by serializing arguments as cache keys. Demonstrate that it produces incorrect results when used with an impure function.",
    "Write a pure markdown-to-HTML converter function. It should take a markdown string and return an HTML string with no I/O, no mutation, and no dependencies. Test it with property-based testing to verify that the output always contains valid HTML for any input.",
    "Implement the functional core / imperative shell pattern for an e-commerce pricing engine. The pure core calculates prices, applies discounts, computes taxes, and determines shipping costs. The shell fetches product data and tax rates, calls the core, and saves the invoice.",
    "In Haskell or a language with an effect system, write a program that reads user input, processes it, and writes output. Identify which functions are in the IO monad and which are pure. Refactor to maximize the pure surface area.",
  ],
  flashcards: [
    { front: "What two properties define a pure function?", back: "(1) Determinism — same input always produces same output. (2) No side effects — does not modify external state or perform I/O." },
    { front: "What is referential transparency?", back: "An expression is referentially transparent if it can be replaced with its value without changing program behavior. f(3) = 9 means you can replace every f(3) with 9." },
    { front: "Name four categories of side effects.", back: "State mutation (variables, collections), I/O (files, network, console), non-determinism (random numbers, system clock), and exceptions/errors." },
    { front: "What is the functional core / imperative shell pattern?", back: "Pure business logic in an inner core (easy to test, composable). Thin impure outer shell handles I/O and orchestrates data flow. Maximizes testable surface area." },
    { front: "Why is memoization safe for pure functions?", back: "Pure functions are deterministic — same input always gives same output. So cached results are guaranteed correct for all future calls with the same input." },
    { front: "How does Haskell enforce purity?", back: "The IO monad: side-effectful functions return IO types. The type system prevents pure functions from calling IO functions. IO actions describe effects; the runtime executes them." },
    { front: "What is the difference between pure and idempotent?", back: "Pure = no side effects + deterministic. Idempotent = applying multiple times gives same result. All pure functions are idempotent. Idempotent functions may have side effects (e.g., HTTP PUT)." },
    { front: "Why are pure functions safe for parallelism?", back: "They do not access shared mutable state, so two threads calling the same pure function cannot interfere with each other. No locks needed, no data races possible." },
  ],
  revisionNotes: [
    "Pure function = deterministic + no side effects. The two properties are both required.",
    "Referential transparency: replace f(x) with its result without changing behavior. Enables equational reasoning.",
    "Side effects: mutation, I/O, randomness, time, exceptions. Not bad, but should be isolated.",
    "Functional core / imperative shell: pure logic inside, thin I/O orchestration outside. Maximizes testability.",
    "Memoization is safe for pure functions because determinism guarantees cached results are always valid.",
    "Haskell's IO monad: functions describe effects as data. The runtime executes them. Type system enforces the boundary.",
    "Effect systems (ZIO, Polysemy) track specific effects in types — finer-grained than the all-or-nothing IO monad.",
  ],
  cheatSheet: [
    "Pure function: same input → same output, no side effects",
    "Test: can you replace the call with its result? If yes → referentially transparent → pure",
    "Date.now(), Math.random(), console.log() → impure (non-deterministic or side-effectful)",
    "Memoize pure functions freely. Never memoize impure functions.",
    "Functional core (pure, testable) + imperative shell (thin, I/O) = clean architecture",
    "Pure functions are inherently thread-safe — no shared mutable state = no data races",
    "Haskell IO monad: IO String means 'a description of an action that produces a String'",
    "All pure functions are idempotent. Not all idempotent operations are pure.",
  ],
  resources: [
    { label: "Professor Frisby's Mostly Adequate Guide to Functional Programming", kind: "book", note: "Free online book covering pure functions, referential transparency, and functional composition in JavaScript." },
    { label: "Haskell Wiki — IO Inside", kind: "docs", note: "Deep explanation of how Haskell's IO monad works and why all Haskell functions are technically pure." },
    { label: "Gary Bernhardt — Boundaries (talk)", kind: "video", note: "The definitive talk on functional core / imperative shell architecture. Explains how to structure code for testability." },
    { label: "ZIO Documentation", kind: "docs", note: "Scala effect system that tracks capabilities (Database, Console, Clock) in the type signature." },
    { label: "Eric Normand — Grokking Simplicity", kind: "book", note: "Practical guide to separating pure calculations from actions (side effects) in everyday code." },
    { label: "Mark Seemann — Purity in an impure language (blog series)", kind: "article", note: "How to apply functional purity principles in C# and other OOP languages." },
  ],
  glossary: [
    { term: "Pure Function", definition: "A function that is deterministic (same input, same output) and has no side effects (no mutation, no I/O)." },
    { term: "Side Effect", definition: "Any observable interaction with the outside world: mutating state, I/O operations, throwing exceptions, reading non-deterministic sources." },
    { term: "Referential Transparency", definition: "The property that an expression can be replaced with its value without changing program behavior." },
    { term: "Idempotency", definition: "An operation that produces the same result when applied multiple times. Related to but broader than purity — idempotent operations may have side effects." },
    { term: "IO Monad", definition: "A type (in Haskell) that wraps side-effectful computations, allowing them to be composed while keeping the function definitions pure." },
    { term: "Effect System", definition: "A type-level mechanism (ZIO, Polysemy) that tracks which side effects a function may perform, enabling compile-time enforcement and testing." },
    { term: "Memoization", definition: "Caching a function's results by input. Safe for pure functions because determinism guarantees cached results are always valid." },
    { term: "Functional Core / Imperative Shell", definition: "Architecture pattern where pure business logic is in an inner core and I/O is confined to a thin outer shell." },
  ],
};
