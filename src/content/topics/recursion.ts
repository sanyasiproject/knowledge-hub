import type { TopicContent } from "../types";

export const recursion: TopicContent = {
  quickSummary: [
    "Recursion is a technique where a function calls itself to solve a problem by breaking it into smaller, self-similar subproblems. Every recursive function must have at least one base case (termination condition) and at least one recursive case that moves toward that base case.",
    "Recursive thinking means identifying the self-similar structure in a problem: express the solution for input of size N in terms of the solution for a smaller input. Classic examples include factorials (n! = n * (n-1)!), Fibonacci numbers, tree traversals, and divide-and-conquer algorithms like merge sort.",
    "Each recursive call creates a new stack frame containing local variables, parameters, and a return address. Deep recursion can exhaust the call stack, causing a stack overflow. Tail call optimization (TCO) eliminates this overhead when the recursive call is the last operation in the function, reusing the current frame.",
    "Memoization transforms exponential recursive algorithms into polynomial ones by caching results of previously computed subproblems. This is the top-down counterpart to bottom-up dynamic programming, and it applies whenever recursive calls overlap -- computing the same subproblem multiple times."
  ],

  detailed: [
    "## Base Cases and Recursive Cases\n\nA base case is the simplest instance of the problem that can be answered directly without further recursion. Without it, the function recurses infinitely until a stack overflow occurs. Many problems have multiple base cases: binary search has 'element found' and 'search space empty'; tree operations have 'null node' and sometimes 'leaf node'. The recursive case reduces the problem toward a base case. Correctness requires that every chain of recursive calls eventually reaches a base case -- this is typically proven by identifying a quantity that strictly decreases (or increases toward a bound) with each call. This quantity is called the variant or termination measure. For factorial, the variant is n (decreases by 1 each call, base case at n=0). For binary search, the variant is the size of the search range.",

    "## Recursive vs Iterative Solutions\n\nAny recursive algorithm can be converted to an iterative one by managing an explicit stack. Iteration is generally more efficient because it avoids the overhead of function calls (stack frame allocation, register saving/restoring, return address bookkeeping). However, recursion often produces clearer, more concise code -- especially for problems with inherent recursive structure like trees, graphs, nested data, and divide-and-conquer algorithms. The choice depends on: (1) depth of recursion vs available stack space, (2) whether the language optimizes tail calls, (3) readability and maintainability tradeoffs, and (4) performance requirements. Languages like Scheme mandate TCO, making recursion as efficient as iteration for tail-recursive functions.",

    "## Stack Frames and Stack Overflow\n\nWhen a function is called, the runtime allocates a stack frame (also called an activation record) containing: the function's parameters, local variables, the return address (where to resume the caller), and saved registers. For recursion, each call pushes a new frame. Default stack sizes vary: ~1-8 MB on most platforms, meaning a recursion depth of roughly 10,000-100,000 calls (depending on frame size) before a StackOverflowError or segfault. Tail call optimization reuses the current frame instead of pushing a new one, converting the recursion into a jump instruction. Without TCO, deep recursion must be converted to iteration with an explicit stack (stored on the heap, which has far more space).",

    "## Tail Call Optimization (TCO)\n\nA tail call is a function call that is the very last operation in a function -- nothing is done with the return value except returning it. In a tail-recursive function, the recursive call is in tail position. The compiler can optimize this by replacing the call with a jump back to the function's entry point, reusing the current stack frame. This transforms O(n) stack space into O(1). Not all languages support TCO: Scheme mandates it by spec, Haskell and Erlang support it, some C/C++ compilers optimize it as an implementation detail, but Java, Python, and JavaScript (despite ES6 spec) generally do not. To make a function tail-recursive, accumulate results in a parameter rather than building them up through return values.",

    "## Mutual Recursion and Indirect Recursion\n\nMutual recursion occurs when two or more functions call each other in a cycle: A calls B, B calls A. Classic examples include even/odd checking (isEven(n) calls isOdd(n-1) and vice versa), recursive descent parsers (where grammar rules reference each other), and state machines where each state is a function that transitions to other states. Mutual recursion requires forward declarations in languages that process definitions top-to-bottom (C, Pascal). In functional languages, it requires special syntax (let rec ... and ... in OCaml, mutual blocks in Haskell). Mutual tail calls can be optimized via trampolining: instead of calling the next function directly, return a thunk that the trampoline loop invokes.",

    "## Tree Recursion and Multiple Branching\n\nTree recursion occurs when a function makes multiple recursive calls per invocation, creating a tree-shaped call graph. The naive Fibonacci implementation is the canonical example: fib(n) calls fib(n-1) and fib(n-2), producing O(2^n) calls. Tree traversals (preorder, inorder, postorder), divide-and-conquer algorithms (merge sort splits into two halves), and combinatorial generation (subsets, permutations) are naturally tree-recursive. The time complexity follows the recurrence relation: T(n) = a*T(n/b) + O(n^d), solvable by the Master Theorem. Tree recursion often benefits enormously from memoization when subproblems overlap."
  ],

  deepDive: [
    "## Memoization: Top-Down Dynamic Programming\n\nMemoization caches results of expensive function calls so that repeated calls with the same arguments return instantly. It converts tree-recursive algorithms with overlapping subproblems from exponential to polynomial time. For Fibonacci, memoization reduces O(2^n) to O(n) with O(n) space. Implementation strategies: (1) hash map keyed by arguments (general, slight overhead from hashing), (2) array indexed by argument value (faster, requires integer arguments in a bounded range), (3) decorator/higher-order function pattern (Python's @functools.lru_cache, custom memoize wrappers). Memoization is the top-down complement to bottom-up tabulation (iterative DP). Top-down is easier to write (just add a cache) and only computes needed subproblems; bottom-up avoids recursion overhead and stack limits, and can optimize space by discarding old entries.",

    "## Divide and Conquer\n\nDivide and conquer is a recursive strategy that (1) divides a problem into smaller subproblems of the same type, (2) conquers each subproblem recursively (base case: subproblem is trivially solvable), and (3) combines the subproblem solutions into the overall solution. Classic algorithms: merge sort (divide array in half, sort each, merge), quicksort (partition around pivot, sort partitions), binary search (halve search space), Strassen's matrix multiplication (split into submatrices), closest pair of points (split by x-coordinate). The Master Theorem analyzes time complexity: T(n) = aT(n/b) + f(n). Merge sort: a=2, b=2, f(n)=O(n), giving O(n log n). The efficiency of divide and conquer depends critically on the combine step and the balance of subproblem sizes.",

    "## Continuation-Passing Style (CPS) and Trampolining\n\nCPS transforms recursion so that each function takes an explicit continuation -- a callback representing 'what to do next'. This places all calls in tail position, enabling TCO even for non-tail-recursive algorithms. However, CPS trades stack space for closure/heap allocation. Trampolining is a technique for languages without TCO: instead of making a recursive call, return a thunk (a zero-argument function wrapping the call). A trampoline loop repeatedly invokes thunks until a final value is produced. This flattens the call stack to O(1) frames. Libraries like clojure.core/trampoline, Scala's TailCalls, and JavaScript's trampoline utilities implement this pattern. The cost is heap allocation for each thunk and the loop overhead.",

    "## Recursion in Functional Languages\n\nIn pure functional languages, recursion replaces loops entirely -- there are no mutable loop variables. Haskell's laziness interacts with recursion in powerful ways: infinite recursive definitions like 'fibs = 0 : 1 : zipWith (+) fibs (tail fibs)' define infinite lists that are computed only as needed. Tail recursion in Haskell is nuanced because laziness can build up unevaluated thunks (space leaks); strict accumulator patterns (using seq or BangPatterns) are needed. Erlang/Elixir use recursion with tail call optimization for server loops that run indefinitely without growing the stack. Scheme's guarantee of proper tail calls means recursion is idiomatic for all iteration, and named let provides a concise syntax for tail-recursive loops.",

    "## Common Recursion Pitfalls\n\nThe most frequent bugs: (1) **Missing base case**: infinite recursion leading to stack overflow. (2) **Wrong base case**: off-by-one errors, empty vs singleton confusion. (3) **Not making progress**: recursive call does not reduce the problem (e.g., forgetting to decrement the index). (4) **Redundant computation**: tree recursion without memoization, leading to exponential blowup. (5) **Excessive copying**: creating new data structures at each level instead of passing indices or slices. (6) **Stack overflow in production**: recursive algorithms that work for small inputs but crash on large ones. (7) **Mutation in recursive context**: modifying shared state during recursion without proper backtracking (common in backtracking algorithms where state must be restored)."
  ],

  code: [
    {
      language: "typescript",
      caption: "Recursive patterns in TypeScript -- factorial, Fibonacci with memoization, and tree traversal",
      source: `// --- Factorial: simple linear recursion ---
function factorial(n: number): number {
  if (n < 0) throw new Error("Negative input");
  if (n <= 1) return 1;           // base case
  return n * factorial(n - 1);    // recursive case
}

// --- Tail-recursive factorial with accumulator ---
function factorialTR(n: number, acc: number = 1): number {
  if (n <= 1) return acc;
  return factorialTR(n - 1, n * acc);  // tail position
}

// --- Fibonacci with memoization ---
function fibMemo(n: number, memo: Map<number, number> = new Map()): number {
  if (n <= 0) return 0;
  if (n === 1) return 1;
  if (memo.has(n)) return memo.get(n)!;

  const result = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  memo.set(n, result);
  return result;
}

// --- Generic memoize higher-order function ---
function memoize<Args extends unknown[], R>(
  fn: (...args: Args) => R,
  keyFn: (...args: Args) => string = (...args) => JSON.stringify(args)
): (...args: Args) => R {
  const cache = new Map<string, R>();
  return (...args: Args): R => {
    const key = keyFn(...args);
    if (cache.has(key)) return cache.get(key)!;
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

// --- Binary tree traversal ---
interface TreeNode<T> {
  value: T;
  left: TreeNode<T> | null;
  right: TreeNode<T> | null;
}

function inorder<T>(node: TreeNode<T> | null): T[] {
  if (node === null) return [];         // base case
  return [
    ...inorder(node.left),              // left subtree
    node.value,                         // visit node
    ...inorder(node.right),             // right subtree
  ];
}

// --- Flatten nested arrays (tree recursion) ---
type Nested<T> = T | Nested<T>[];

function flatten<T>(arr: Nested<T>[]): T[] {
  const result: T[] = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...flatten(item));    // recursive case
    } else {
      result.push(item);               // base case
    }
  }
  return result;
}

// --- Trampoline for stack-safe recursion ---
type Thunk<T> = () => Thunk<T> | T;

function trampoline<T>(fn: Thunk<T>): T {
  let result: Thunk<T> | T = fn;
  while (typeof result === "function") {
    result = (result as Thunk<T>)();
  }
  return result;
}

function sumToTrampoline(n: number, acc: number = 0): Thunk<number> | number {
  if (n <= 0) return acc;
  return () => sumToTrampoline(n - 1, acc + n);
}

// Safe for n = 1,000,000+
const bigSum = trampoline(() => sumToTrampoline(1_000_000));`
    },
    {
      language: "cpp",
      caption: "C++ recursion -- merge sort, permutations, and memoization with unordered_map",
      source: `#include <iostream>
#include <vector>
#include <unordered_map>
#include <string>

// --- Merge sort: divide and conquer ---
std::vector<int> merge(const std::vector<int>& left,
                       const std::vector<int>& right) {
    std::vector<int> result;
    result.reserve(left.size() + right.size());
    size_t i = 0, j = 0;
    while (i < left.size() && j < right.size()) {
        if (left[i] <= right[j]) {
            result.push_back(left[i++]);
        } else {
            result.push_back(right[j++]);
        }
    }
    result.insert(result.end(), left.begin() + i, left.end());
    result.insert(result.end(), right.begin() + j, right.end());
    return result;
}

std::vector<int> mergeSort(std::vector<int> arr) {
    if (arr.size() <= 1) return arr;    // base case

    size_t mid = arr.size() / 2;
    std::vector<int> left(arr.begin(), arr.begin() + mid);    // divide
    std::vector<int> right(arr.begin() + mid, arr.end());     // divide
    return merge(mergeSort(left), mergeSort(right));           // combine
}

// --- Permutations via backtracking ---
std::vector<std::vector<int>> permutations(std::vector<int> items) {
    if (items.size() <= 1) return {items};  // base case

    std::vector<std::vector<int>> result;
    for (size_t i = 0; i < items.size(); ++i) {
        std::vector<int> rest;
        for (size_t j = 0; j < items.size(); ++j) {
            if (j != i) rest.push_back(items[j]);
        }
        for (auto& perm : permutations(rest)) {
            perm.insert(perm.begin(), items[i]);
            result.push_back(std::move(perm));
        }
    }
    return result;
}

// --- Memoization with std::unordered_map ---
std::unordered_map<int, long long> fibCache;

long long fib(int n) {
    if (n <= 0) return 0;
    if (n == 1) return 1;
    auto it = fibCache.find(n);
    if (it != fibCache.end()) return it->second;
    long long result = fib(n - 1) + fib(n - 2);
    fibCache[n] = result;
    return result;
}

// --- Mutual recursion: even/odd ---
bool isOdd(int n);  // forward declaration

bool isEven(int n) {
    if (n == 0) return true;
    return isOdd(n - 1);
}

bool isOdd(int n) {
    if (n == 0) return false;
    return isEven(n - 1);
}

// --- Tower of Hanoi ---
void hanoi(int n, const std::string& source,
           const std::string& target, const std::string& auxiliary) {
    if (n == 1) {
        std::cout << "Move disk 1 from " << source
                  << " to " << target << std::endl;
        return;
    }
    hanoi(n - 1, source, auxiliary, target);
    std::cout << "Move disk " << n << " from " << source
              << " to " << target << std::endl;
    hanoi(n - 1, auxiliary, target, source);
}`
    },
    {
      language: "haskell",
      caption: "Haskell recursion -- pattern matching, infinite lists, and accumulator patterns",
      source: `-- Factorial with pattern matching
factorial :: Integer -> Integer
factorial 0 = 1                      -- base case
factorial n = n * factorial (n - 1)  -- recursive case

-- Tail-recursive factorial with strict accumulator
factorial' :: Integer -> Integer
factorial' n = go n 1
  where
    go 0 !acc = acc                  -- BangPattern forces evaluation
    go k !acc = go (k - 1) (k * acc) -- tail position

-- Fibonacci via infinite list (lazy evaluation + recursion)
fibs :: [Integer]
fibs = 0 : 1 : zipWith (+) fibs (tail fibs)

-- nth Fibonacci: fibs !! 100 computes only what is needed

-- Merge sort
mergeSort :: Ord a => [a] -> [a]
mergeSort []  = []
mergeSort [x] = [x]
mergeSort xs  = merge (mergeSort left) (mergeSort right)
  where
    (left, right) = splitAt (length xs \`div\` 2) xs

merge :: Ord a => [a] -> [a] -> [a]
merge [] ys = ys
merge xs [] = xs
merge (x:xs) (y:ys)
  | x <= y   = x : merge xs (y:ys)
  | otherwise = y : merge (x:xs) ys

-- Tree data type and traversals
data Tree a = Empty | Node (Tree a) a (Tree a)

inorder :: Tree a -> [a]
inorder Empty        = []
inorder (Node l v r) = inorder l ++ [v] ++ inorder r

-- Fold over a tree (generalized recursion)
foldTree :: b -> (b -> a -> b -> b) -> Tree a -> b
foldTree z _ Empty        = z
foldTree z f (Node l v r) = f (foldTree z f l) v (foldTree z f r)

treeSum :: Num a => Tree a -> a
treeSum = foldTree 0 (\\l v r -> l + v + r)

-- Mutual recursion
isEven' :: Int -> Bool
isEven' 0 = True
isEven' n = isOdd' (n - 1)

isOdd' :: Int -> Bool
isOdd' 0 = False
isOdd' n = isEven' (n - 1)

-- Ackermann function (grows faster than any primitive recursive function)
ackermann :: Integer -> Integer -> Integer
ackermann 0 n = n + 1
ackermann m 0 = ackermann (m - 1) 1
ackermann m n = ackermann (m - 1) (ackermann m (n - 1))`
    }
  ],

  diagrams: [
    {
      title: "Recursive Call Stack for factorial(4)",
      kind: "flow",
      caption: "Each call pushes a new frame onto the call stack. The base case returns 1, and values propagate back up as frames are popped: factorial(4) -> 4 * factorial(3) -> 3 * factorial(2) -> 2 * factorial(1) -> 1. Return path: 1 -> 2 -> 6 -> 24."
    },
    {
      title: "Tree Recursion Call Graph for fib(5)",
      kind: "architecture",
      caption: "fib(5) branches into fib(4) and fib(3). fib(4) branches into fib(3) and fib(2). Overlapping subproblems are highlighted: fib(3) is computed twice, fib(2) three times, fib(1) five times. Total calls without memoization: 15. With memoization: 9 (each unique subproblem computed once, rest served from cache)."
    }
  ],

  animations: [
    {
      title: "Merge Sort Divide and Conquer",
      steps: [
        { label: "Initial array", detail: "[38, 27, 43, 3, 9, 82, 10] -- the unsorted input" },
        { label: "Divide", detail: "Split into [38, 27, 43] and [3, 9, 82, 10]" },
        { label: "Divide left", detail: "[38, 27, 43] splits into [38] and [27, 43]" },
        { label: "Divide further", detail: "[27, 43] splits into [27] and [43] -- both base cases (single element)" },
        { label: "Merge leaves", detail: "Merge [27] and [43] into [27, 43]" },
        { label: "Merge left half", detail: "Merge [38] and [27, 43] into [27, 38, 43]" },
        { label: "Divide right", detail: "[3, 9, 82, 10] splits into [3, 9] and [82, 10]" },
        { label: "Merge right leaves", detail: "Merge [3] and [9] into [3, 9]. Merge [82] and [10] into [10, 82]" },
        { label: "Merge right half", detail: "Merge [3, 9] and [10, 82] into [3, 9, 10, 82]" },
        { label: "Final merge", detail: "Merge [27, 38, 43] and [3, 9, 10, 82] into [3, 9, 10, 27, 38, 43, 82]" }
      ]
    },
    {
      title: "Fibonacci with Memoization: fib(5)",
      steps: [
        { label: "Call fib(5)", detail: "Cache is empty. Need fib(4) and fib(3)." },
        { label: "Call fib(4)", detail: "Cache miss. Need fib(3) and fib(2)." },
        { label: "Call fib(3)", detail: "Cache miss. Need fib(2) and fib(1)." },
        { label: "Call fib(2)", detail: "Cache miss. Need fib(1) and fib(0)." },
        { label: "Base cases", detail: "fib(1) = 1, fib(0) = 0. Return to fib(2)." },
        { label: "Compute fib(2)", detail: "fib(2) = 1 + 0 = 1. Store in cache: {2: 1}" },
        { label: "fib(1) base case", detail: "fib(1) = 1 (base case). fib(3) = 1 + 1 = 2. Cache: {2: 1, 3: 2}" },
        { label: "Cache hit for fib(2)", detail: "fib(4) needs fib(2) -- cache hit! fib(4) = 2 + 1 = 3. Cache: {2: 1, 3: 2, 4: 3}" },
        { label: "Cache hit for fib(3)", detail: "fib(5) needs fib(3) -- cache hit! fib(5) = 3 + 2 = 5. Cache: {2: 1, 3: 2, 4: 3, 5: 5}" }
      ]
    }
  ],

  comparison: {
    columns: ["Aspect", "Recursion", "Iteration", "Tail Recursion"],
    rows: [
      ["Stack usage", "O(n) frames -- one per call", "O(1) -- single frame", "O(1) with TCO -- frame reuse"],
      ["Readability", "Natural for trees, graphs, divide-and-conquer", "Natural for linear sequences", "Requires accumulator refactoring"],
      ["Performance", "Function call overhead per level", "Minimal overhead, tight loops", "Equivalent to iteration with TCO"],
      ["Stack overflow risk", "High for deep recursion (>10K calls)", "None", "None with TCO; same as recursion without it"],
      ["State management", "Implicit via stack frames and parameters", "Explicit via mutable variables", "Explicit via accumulator parameters"],
      ["Debugging", "Deeper stack traces, harder to step through", "Simple linear flow", "Optimized frames may hide call history"],
      ["Language support", "All languages", "All languages", "Scheme (required), Haskell, Erlang, some C/C++ compilers"],
      ["Conversion", "Any recursion can become iteration + explicit stack", "Any loop can become tail recursion", "Tail recursion is mechanically convertible to a loop"]
    ]
  },

  interviewQA: [
    {
      q: "What are the two essential components of a recursive function, and what happens if one is missing?",
      a: "Every recursive function needs a base case and a recursive case. The base case provides a direct answer without further recursion (e.g., factorial(0) = 1). The recursive case breaks the problem into smaller subproblems and calls the function again. If the base case is missing, the function recurses infinitely until a stack overflow occurs. If the recursive case is missing, the function simply returns the base case value for all inputs, which is incorrect for non-trivial problems.",
      followUps: [
        "Can a recursive function have multiple base cases? Give an example.",
        "How do you prove that a recursive function terminates?",
        "What is the variant or termination measure in recursion?"
      ]
    },
    {
      q: "Explain tail call optimization. Why do some languages support it and others do not?",
      a: "A tail call is a function call that is the last operation in a function -- nothing is done with the result except returning it. TCO reuses the current stack frame for the tail call instead of pushing a new one, converting O(n) stack usage to O(1). Scheme mandates TCO by specification because recursion is the primary looping mechanism. Haskell and Erlang support it because they are designed around recursion. Java and Python do not implement TCO because: (1) it complicates stack traces for debugging, (2) Python's Guido van Rossum explicitly rejected it to keep stack traces meaningful, and (3) the JVM's security model and bytecode verification rely on predictable stack frames. JavaScript's ES6 spec includes TCO but only Safari implements it.",
      followUps: [
        "How do you convert a non-tail-recursive function to a tail-recursive one?",
        "What is trampolining and when would you use it?",
        "Does TypeScript/JavaScript actually optimize tail calls in practice?"
      ]
    },
    {
      q: "How does memoization improve recursive Fibonacci from O(2^n) to O(n)?",
      a: "Naive recursive Fibonacci has a tree-shaped call graph where fib(n) calls fib(n-1) and fib(n-2), and many subproblems are recomputed. For example, fib(5) computes fib(3) twice and fib(2) three times. The total number of calls is O(2^n). Memoization stores each fib(k) result after the first computation. On subsequent calls with the same argument, the cached result is returned in O(1). Since there are only n unique subproblems (fib(0) through fib(n)), and each is computed exactly once in O(1) time (excluding recursive calls), the total time becomes O(n). Space is also O(n) for the cache plus O(n) for the call stack.",
      followUps: [
        "When would you prefer bottom-up DP over memoization?",
        "Can you reduce the space complexity of Fibonacci to O(1)?",
        "What are the tradeoffs between memoization and tabulation?"
      ]
    },
    {
      q: "What is the difference between linear recursion, tree recursion, and mutual recursion?",
      a: "Linear recursion makes exactly one recursive call per invocation, creating a chain of calls (factorial, binary search, linked list traversal). Time is O(n) calls. Tree recursion makes multiple recursive calls per invocation, creating a tree-shaped call graph (naive Fibonacci makes 2 calls, merge sort makes 2 calls). The number of calls grows exponentially unless memoized or the problem size reduces geometrically (divide-and-conquer). Mutual recursion involves two or more functions calling each other cyclically: function A calls B, B calls A. Examples include recursive descent parsers and the isEven/isOdd pair. All three can be converted to iteration, but the complexity of the conversion varies.",
      followUps: [
        "Give an example of tree recursion that is efficient without memoization.",
        "How does the Master Theorem analyze divide-and-conquer recurrences?",
        "How would you implement mutual recursion in a language that requires forward declarations?"
      ]
    },
    {
      q: "When should you prefer recursion over iteration in production code?",
      a: "Prefer recursion when: (1) the data structure is inherently recursive (trees, graphs, nested JSON, file systems), (2) the algorithm is naturally expressed recursively (quicksort, merge sort, DFS, backtracking), (3) the recursion depth is bounded and manageable (e.g., balanced tree of depth log n), and (4) clarity and correctness matter more than micro-optimization. Prefer iteration when: (1) the recursion depth could be large and TCO is unavailable, (2) performance is critical and function call overhead matters, (3) the problem is naturally sequential (processing a list, counting), or (4) you need fine-grained control over memory and state. In practice, many recursive algorithms in production use iterative implementations with explicit stacks for reliability."
    }
  ],

  mcqs: [
    {
      q: "What is the time complexity of naive recursive Fibonacci fib(n)?",
      options: ["O(n)", "O(n log n)", "O(2^n)", "O(n^2)"],
      answerIndex: 2,
      explanation: "Each call branches into two sub-calls, and the recursion tree has depth n. The number of nodes grows exponentially as O(2^n). More precisely, it is O(phi^n) where phi is the golden ratio (~1.618), but O(2^n) is the standard upper bound."
    },
    {
      q: "Which of the following is a tail-recursive function?",
      options: [
        "function f(n) { return n == 0 ? 1 : n * f(n-1); }",
        "function f(n, acc=1) { return n == 0 ? acc : f(n-1, n*acc); }",
        "function f(n) { if (n == 0) return 0; return f(n-1) + f(n-2); }",
        "function f(n) { return n == 0 ? 0 : 1 + f(n-1); }"
      ],
      answerIndex: 1,
      explanation: "In option B, the recursive call f(n-1, n*acc) is the last operation -- nothing is done with its return value except returning it. In option A, the result of f(n-1) is multiplied by n, so the call is not in tail position. Option C makes two calls. Option D adds 1 to the result."
    },
    {
      q: "What problem does memoization solve in recursive algorithms?",
      options: [
        "Stack overflow from deep recursion",
        "Redundant computation of overlapping subproblems",
        "Excessive memory allocation for stack frames",
        "Inability to parallelize recursive calls"
      ],
      answerIndex: 1,
      explanation: "Memoization caches results of previously computed subproblems so they are not recomputed. This is specifically useful when the recursion tree contains overlapping subproblems (the same inputs are computed multiple times). It does not address stack depth, stack frame size, or parallelism."
    },
    {
      q: "What is the maximum recursion depth before stack overflow on a typical system with default settings?",
      options: [
        "~100 calls",
        "~1,000 calls",
        "~10,000 to 100,000 calls",
        "Unlimited"
      ],
      answerIndex: 2,
      explanation: "Default stack sizes are typically 1-8 MB. Each stack frame is usually 64-256 bytes depending on local variables. This allows roughly 10,000 to 100,000 recursive calls. Python defaults to a recursion limit of 1,000 (configurable via sys.setrecursionlimit), but the actual limit is higher on most systems."
    },
    {
      q: "Which technique converts deep recursion to constant stack space in languages without TCO?",
      options: [
        "Memoization",
        "Trampolining",
        "Currying",
        "Partial application"
      ],
      answerIndex: 1,
      explanation: "Trampolining replaces recursive calls with returned thunks (zero-argument functions). A trampoline loop repeatedly invokes thunks until a final value is produced. This uses only one stack frame for the loop, achieving O(1) stack space. Memoization reduces time but not stack depth."
    }
  ],

  flashcards: [
    { front: "What are the two essential parts of any recursive function?", back: "A base case (termination condition that returns directly) and a recursive case (reduces the problem and calls itself). Without a base case, recursion is infinite." },
    { front: "What is tail call optimization (TCO)?", back: "A compiler optimization that reuses the current stack frame when a function call is in tail position (the last operation). Converts O(n) stack usage to O(1). Supported by Scheme (mandatory), Haskell, Erlang." },
    { front: "How does memoization improve recursive Fibonacci?", back: "It caches previously computed results. Naive fib(n) is O(2^n) because subproblems overlap. Memoization ensures each fib(k) is computed once, reducing time to O(n) with O(n) space." },
    { front: "What is tree recursion?", back: "A recursive function that makes multiple recursive calls per invocation, creating a tree-shaped call graph. Examples: naive Fibonacci (2 branches), merge sort (2 branches), generating permutations." },
    { front: "What is a stack frame / activation record?", back: "Memory allocated on the call stack for each function call, containing parameters, local variables, return address, and saved registers. Recursive calls push one frame per level." },
    { front: "What is mutual recursion?", back: "Two or more functions that call each other in a cycle. Example: isEven(n) calls isOdd(n-1) and vice versa. Requires forward declarations in some languages." },
    { front: "What is trampolining?", back: "A technique for stack-safe recursion without TCO. Instead of calling recursively, return a thunk. A loop repeatedly invokes thunks until a value is produced. Trades stack space for heap allocation." },
    { front: "What is the Master Theorem?", back: "Solves recurrences of the form T(n) = aT(n/b) + O(n^d). Compares log_b(a) with d to determine if the answer is O(n^d log n), O(n^(log_b a)), or O(n^d). Used to analyze divide-and-conquer algorithms." }
  ],

  revisionNotes: [
    "Every recursive function needs a base case (stops recursion) and a recursive case (moves toward base case). Missing either causes infinite recursion or incorrect results.",
    "Each recursive call creates a stack frame. Default stack sizes (1-8 MB) allow roughly 10K-100K calls. For deeper recursion, convert to iteration with an explicit stack or use trampolining.",
    "Tail call optimization reuses the current frame when the recursive call is the last operation. Convert to tail form by using an accumulator parameter. Not available in Python, Java, or most JS engines.",
    "Tree recursion (multiple recursive calls per invocation) often leads to exponential time due to overlapping subproblems. Memoization or bottom-up DP fixes this by caching results.",
    "Divide and conquer splits the problem, solves subproblems recursively, and combines results. Time complexity follows T(n) = aT(n/b) + f(n), analyzed by the Master Theorem.",
    "Mutual recursion (A calls B, B calls A) appears in parsers, state machines, and mathematical definitions. Can be optimized via trampolining for stack safety.",
    "In functional languages (Haskell, Scheme, Erlang), recursion replaces loops entirely. Lazy evaluation enables elegant infinite recursive definitions like the Fibonacci sequence.",
    "Common pitfalls: missing/wrong base case, not making progress toward base case, exponential recomputation without memoization, stack overflow on large inputs, mutation without proper backtracking."
  ],

  cheatSheet: [
    "Base case: the simplest input that returns directly -- factorial(0) = 1, fib(0) = 0, fib(1) = 1, empty list = []",
    "Recursive case: reduce the problem -- factorial(n) = n * factorial(n-1), mergeSort splits array in half",
    "Tail recursion: recursive call must be the LAST operation. Use accumulator: f(n, acc) instead of n * f(n-1)",
    "Memoization: cache results by arguments. Python: @lru_cache. JS/TS: Map<string, result>. Turns O(2^n) fib into O(n)",
    "Stack depth: ~10K-100K calls max. Python default limit: 1000. Increase with sys.setrecursionlimit() cautiously",
    "Trampolining: return thunks instead of calling recursively. Loop invokes thunks until a value is produced. O(1) stack",
    "Master Theorem: T(n) = aT(n/b) + O(n^d). Compare log_b(a) vs d. Merge sort: a=2, b=2, d=1 -> O(n log n)",
    "Conversion: any recursion -> iteration + explicit stack. Any tail recursion -> while loop with reassignment"
  ],

  resources: [
    { label: "Structure and Interpretation of Computer Programs (SICP), Chapters 1.2-1.3", kind: "book", note: "The gold standard introduction to recursive processes, tree recursion, and iterative vs recursive processes in Scheme" },
    { label: "Introduction to Algorithms (CLRS), Chapter 4: Divide-and-Conquer", kind: "book", note: "Rigorous treatment of the Master Theorem, recurrence relations, and divide-and-conquer algorithm design" },
    { label: "Computerphile - Recursion (YouTube)", kind: "video", note: "Visual explanation of recursion, call stacks, and base cases with clear animations" },
    { label: "Haskell Wiki: Recursion Patterns", kind: "docs", note: "Covers fold, unfold, hylomorphism, and other recursion schemes in Haskell" },
    { label: "tail-call-optimization tag on Stack Overflow", kind: "article", note: "Community discussions on TCO support across languages, with benchmarks and workarounds" }
  ],

  glossary: [
    { term: "Base Case", definition: "The condition under which a recursive function returns a result directly without making further recursive calls. Acts as the termination condition." },
    { term: "Recursive Case", definition: "The branch of a recursive function that reduces the problem and makes one or more recursive calls, moving toward the base case." },
    { term: "Stack Frame", definition: "A block of memory on the call stack allocated for each function invocation, holding parameters, local variables, return address, and saved registers." },
    { term: "Tail Call Optimization (TCO)", definition: "A compiler optimization that reuses the current stack frame for a function call in tail position, eliminating stack growth for tail-recursive functions." },
    { term: "Memoization", definition: "An optimization technique that caches the results of expensive function calls and returns the cached result when the same inputs recur. Top-down dynamic programming." },
    { term: "Tree Recursion", definition: "Recursion where each function invocation makes multiple recursive calls, producing a branching call tree. Common in Fibonacci, combinatorics, and divide-and-conquer." },
    { term: "Mutual Recursion", definition: "A pattern where two or more functions are defined in terms of each other, forming a cycle of recursive calls." },
    { term: "Trampolining", definition: "A technique for achieving stack-safe recursion without TCO by returning thunks (deferred computations) that a loop repeatedly invokes until a final value is produced." }
  ],
  exercises: [
    "Implement **merge sort** recursively in C++. Identify the **base case**, **divide step**, and **combine step**. Trace the full call tree for the input `[5, 2, 8, 1, 9, 3]`. Then analyze the time complexity using the **Master Theorem**: what are the values of *a*, *b*, and *d*?",
    "Write a naive recursive `fib(n)` function and count the total number of function calls for `fib(6)`. Draw the **recursion tree** and circle the overlapping subproblems. Then add **memoization** using a `std::unordered_map` and verify that the call count drops from exponential to linear.",
    "Convert the recursive `factorial(n)` function into a **tail-recursive** version using an accumulator parameter. Show both versions side by side. Then explain: if you run `factorial(1000000)` in Python (which lacks TCO), what happens? Implement a **trampoline** in Python to make it stack-safe.",
    "Implement a recursive **subset generator**: given a set `{1, 2, 3}`, produce all `2^n` subsets. Trace the recursion tree, identifying how each recursive call either *includes* or *excludes* the current element. What is the time complexity, and can memoization help here? Why or why not?",
    "Write a recursive solution to the **N-Queens problem** using backtracking. For `N=4`, trace the algorithm step by step: show which squares are tried, when conflicts are detected, and when the algorithm *backtracks*. Explain why proper **state restoration** (undoing the queen placement) is critical for correctness.",
  ],
};
