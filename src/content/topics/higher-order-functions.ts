import type { TopicContent } from "../types";

export const higherOrderFunctions: TopicContent = {
  quickSummary: [
    "A higher-order function (HOF) is a function that either takes one or more functions as arguments, returns a function as its result, or both. This is the foundational abstraction of functional programming and is ubiquitous in modern JavaScript/TypeScript, Python, Haskell, Scala, and most mainstream languages.",
    "The canonical trio -- map, filter, and reduce -- are HOFs that transform collections declaratively. map applies a function to each element, filter selects elements by predicate, and reduce (fold) collapses a collection into a single accumulated value. Together they replace the vast majority of imperative loops.",
    "Closures are the mechanism that makes HOFs powerful: a returned function captures (closes over) variables from its enclosing scope, enabling partial application, currying, memoization, and factory patterns. Without closures, returning functions would have no way to carry state.",
    "Function composition -- combining simple functions to build complex transformations -- is the design pattern HOFs unlock. Pipelines like `pipe(parse, validate, normalize, save)` express data transformations as readable, testable, reusable stages rather than deeply nested or imperative code."
  ],

  detailed: [
    "## What Makes a Function Higher-Order\n\nIn mathematical terms, a higher-order function operates on the function space itself -- it maps functions to values or values to functions. In programming, this means accepting a callback parameter (`Array.prototype.sort(compareFn)`), returning a new function (`function multiplier(n) { return x => x * n; }`), or both (`function compose(f, g) { return x => f(g(x)); }`). First-class functions (functions as values that can be assigned to variables, stored in data structures, and passed as arguments) are the language prerequisite. JavaScript, Python, Haskell, Scala, Kotlin, Swift, Rust, and modern C++ all support first-class functions. Java gained them with lambdas in Java 8. C requires explicit function pointers, which are first-class but syntactically cumbersome.",

    "## map, filter, and reduce in Depth\n\n**map** (known as `fmap` in Haskell, `Select` in C#/LINQ) applies a transformation function to every element of a collection, producing a new collection of the same shape. It preserves structure: mapping over a list of N elements yields a list of N elements. The generalized form (Functor) applies to any container -- Option/Maybe, Result/Either, Promises, trees, streams.\n\n**filter** (known as `where` in C#/LINQ) applies a predicate (a function returning boolean) to each element, keeping only those that satisfy the predicate. It preserves element values but changes collection size.\n\n**reduce** (known as `fold`, `foldl`/`foldr` in Haskell, `Aggregate` in C#, `inject` in Ruby) is the most general: it collapses a collection into a single value by repeatedly applying a binary function (accumulator, current) -> newAccumulator. Both map and filter can be implemented in terms of reduce, making it the universal iterator. The choice between left-fold and right-fold matters for associativity and lazy evaluation: `foldl` processes left-to-right (tail-recursive with strict accumulator), `foldr` processes right-to-left (can short-circuit on infinite lists in lazy languages like Haskell).",

    "## Callbacks and Callback Patterns\n\nA callback is simply a function passed as an argument to be invoked later -- it is the most basic use of HOFs. Synchronous callbacks (like `Array.prototype.sort(compareFn)` or `qsort` in C) execute immediately within the calling function. Asynchronous callbacks (like Node.js `fs.readFile(path, callback)`) execute later when an operation completes. The Node.js convention of error-first callbacks `(err, result) => {}` standardized async callback interfaces before Promises. Callback hell (deeply nested callbacks) was the primary pain point that led to Promises, async/await, and reactive streams. Event listeners (`element.addEventListener('click', handler)`) are callbacks registered with an event system. The Strategy pattern in OOP is essentially passing a callback that encapsulates an algorithm.",

    "## Closures and Their Relationship to HOFs\n\nA closure is a function bundled with its lexical environment -- the variables from enclosing scopes that it references. When a HOF returns a function, that returned function is almost always a closure. Example: `function makeCounter() { let n = 0; return () => ++n; }` -- the returned arrow function closes over `n`, and each call to `makeCounter()` creates an independent counter with its own `n`. Closures enable: (1) **Data privacy** -- `n` is inaccessible except through the returned function, similar to private fields. (2) **Partial application** -- `const add5 = x => add(5, x)` captures `5` in the closure. (3) **Memoization** -- a cache object lives in the closure scope. (4) **Module pattern** -- IIFEs returning objects with methods that close over shared private state (pre-ES6 module pattern). In Python, closures have a subtle gotcha: variables are captured by reference, not by value, so a lambda in a loop captures the loop variable's final value unless you use a default parameter trick `lambda x, i=i: ...`.",

    "## Function Composition with HOFs\n\nComposition is the act of combining two or more functions to produce a new function: `compose(f, g)(x) = f(g(x))`. The related concept `pipe` applies functions left-to-right: `pipe(f, g)(x) = g(f(x))`, which reads more naturally as a data pipeline. Haskell provides the `.` operator for composition and `$` for application. Ramda and lodash/fp provide `compose` and `flow`/`pipe` in JavaScript. Function composition is associative: `compose(f, compose(g, h)) === compose(compose(f, g), h)`, which means you can break pipelines into reusable sub-pipelines. Point-free style (tacit programming) writes functions as compositions without mentioning arguments: `const getActiveUserEmails = pipe(filter(isActive), map(prop('email')))`. This style improves readability when functions are well-named but hurts it when compositions become deeply nested or overly clever.",

    "## Performance Considerations\n\nChaining map/filter/reduce creates intermediate arrays in JavaScript: `arr.map(f).filter(p).reduce(r)` allocates two temporary arrays. For small arrays this is negligible; for large datasets it matters. Solutions: (1) **Transducers** (Clojure, JS libraries) compose transformations without intermediate collections by combining the reducing functions. (2) **Lazy evaluation** -- Haskell's lists are lazy by default, so `map f . filter p` fuses into a single pass. Java Streams and C# LINQ are also lazy. (3) **Manual loop fusion** -- write a single reduce that combines the map/filter/reduce logic. (4) **Generator-based pipelines** in Python (`(f(x) for x in xs if p(x))`) are lazy and avoid intermediate lists. Callback overhead in hot loops can be significant in interpreted languages -- V8 aggressively inlines simple callbacks, but complex closures may not inline. In Rust, iterators with closures compile to the same machine code as hand-written loops due to monomorphization and inlining (zero-cost abstractions)."
  ],

  deepDive: [
    "## Algebraic Foundations: Functors, Monads, and HOFs\n\nThe map operation generalizes to the Functor type class in Haskell: `class Functor f where fmap :: (a -> b) -> f a -> f b`. This says: given a function from `a` to `b` and a container of `a`, produce a container of `b` -- regardless of the container type. Lists, Maybe, Either, IO, and custom types can all be Functors. Monads extend this with `bind` (>>=): `(>>=) :: m a -> (a -> m b) -> m b`, a HOF that chains operations where each step produces a wrapped value. Promises in JavaScript are roughly monadic: `.then(f)` takes a callback that can return a plain value or another Promise. Understanding this algebraic structure reveals that map/flatMap/filter are not ad-hoc utility methods but instances of deep mathematical patterns -- which is why they appear independently in every language.",

    "## Continuation-Passing Style (CPS) and Trampolining\n\nCPS is a programming style where every function takes an extra argument: a continuation (callback) that receives the result. Instead of returning a value, the function passes it to the continuation: `function add(a, b, k) { k(a + b); }`. CPS makes control flow explicit and enables: (1) non-blocking I/O (Node.js is essentially CPS), (2) implementing coroutines and generators, (3) call/cc (call-with-current-continuation) in Scheme which captures the entire remaining computation as a first-class value. Trampolining solves stack overflow in recursive HOFs: instead of recursing, return a thunk (zero-argument function), and a trampoline loop repeatedly calls the thunk until it returns a non-function value. This converts stack-consuming recursion into a flat loop, critical for languages without tail-call optimization (JavaScript engines largely do not implement TCO despite ES6 specifying it).",

    "## Defunctionalization and Closure Conversion\n\nCompilers transform HOFs into first-order code through two techniques. **Closure conversion** replaces free variables in a function with an explicit environment record: `let y = 5; let f = x => x + y` becomes `let f = { env: { y: 5 }, code: (env, x) => x + env.y }`. This is how closures are implemented at the machine level -- a closure is a pair of (function pointer, environment pointer). **Defunctionalization** (Reynolds, 1972) replaces higher-order functions entirely: each lambda is assigned a tag, and a single `apply` function dispatches on the tag. This is used in whole-program compilers (MLton for Standard ML) and yields very efficient code because the function argument becomes a simple integer dispatch. Understanding these transformations demystifies what closures and HOFs actually cost at runtime.",

    "## Transducers: Composable Algorithmic Transformations\n\nTransducers, introduced by Rich Hickey in Clojure, decouple the transformation logic from the input/output source. A transducer is a function that takes a reducing function and returns a new reducing function: `type Transducer = (reducer) => reducer`. Composing transducers with `compose` builds a pipeline that processes elements in a single pass with no intermediate collections. In JavaScript: `const xform = compose(map(double), filter(isEven), take(5))` creates a transducer that can be applied to arrays, streams, channels, or observables. The key insight is that map, filter, and take are reimplemented as transducer-returning functions, not as methods on a collection. This gives maximum reuse: the same `xform` works on any data source. Libraries like transducers-js and xstream bring this pattern to JavaScript.",

    "## Monadic Composition and Kleisli Arrows\n\nWhen composing functions that return wrapped values (Maybe, Result, Promise, List), ordinary function composition breaks: `compose(f: A -> Maybe<B>, g: B -> Maybe<C>)` does not type-check because `f` returns `Maybe<B>`, not `B`. Kleisli composition solves this: `(>=>) :: (a -> m b) -> (b -> m c) -> (a -> m c)`, which chains monadic functions by binding through the monad. In practice, this is what Promise chaining does: `.then(f).then(g)` is Kleisli composition for the Promise monad. In Haskell, `>=>` and `<=<` compose monadic functions left-to-right and right-to-left respectively. Railway-oriented programming (Scott Wlaschin) visualizes this as a two-track railway where the happy path flows through composed functions and errors shunt to the error track -- a practical metaphor for Result/Either monadic composition."
  ],

  code: [
    {
      language: "typescript",
      caption: "map, filter, reduce fundamentals and custom implementations",
      source: `// Built-in HOFs on arrays
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// map: transform each element
const doubled = numbers.map(n => n * 2);
// [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]

// filter: keep elements matching predicate
const evens = numbers.filter(n => n % 2 === 0);
// [2, 4, 6, 8, 10]

// reduce: collapse to single value
const sum = numbers.reduce((acc, n) => acc + n, 0);
// 55

// Chaining: get sum of squares of even numbers
const result = numbers
  .filter(n => n % 2 === 0)
  .map(n => n * n)
  .reduce((acc, n) => acc + n, 0);
// 220

// --- Custom implementations ---

function myMap<T, U>(arr: T[], fn: (item: T, index: number) => U): U[] {
  const result: U[] = [];
  for (let i = 0; i < arr.length; i++) {
    result.push(fn(arr[i], i));
  }
  return result;
}

function myFilter<T>(arr: T[], predicate: (item: T) => boolean): T[] {
  const result: T[] = [];
  for (const item of arr) {
    if (predicate(item)) result.push(item);
  }
  return result;
}

function myReduce<T, U>(
  arr: T[],
  reducer: (acc: U, item: T) => U,
  initial: U
): U {
  let accumulator = initial;
  for (const item of arr) {
    accumulator = reducer(accumulator, item);
  }
  return accumulator;
}

// Implementing map and filter in terms of reduce
function mapViaReduce<T, U>(arr: T[], fn: (item: T) => U): U[] {
  return arr.reduce<U[]>((acc, item) => [...acc, fn(item)], []);
}

function filterViaReduce<T>(arr: T[], pred: (item: T) => boolean): T[] {
  return arr.reduce<T[]>((acc, item) => pred(item) ? [...acc, item] : acc, []);
}`
    },
    {
      language: "typescript",
      caption: "Closures, currying, partial application, and composition",
      source: `// --- Closures ---

// Factory using closure for data privacy
function createCounter(initial = 0) {
  let count = initial;
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count,
  };
}
const counter = createCounter(10);
counter.increment(); // 11
counter.increment(); // 12
// \`count\` is not accessible from outside

// Memoization via closure
function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key)!;
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

const expensiveFib = memoize((n: number): number =>
  n <= 1 ? n : expensiveFib(n - 1) + expensiveFib(n - 2)
);

// --- Currying ---

function curry<A, B, C>(fn: (a: A, b: B) => C): (a: A) => (b: B) => C {
  return (a: A) => (b: B) => fn(a, b);
}

const add = (a: number, b: number) => a + b;
const curriedAdd = curry(add);
const add5 = curriedAdd(5);
add5(3); // 8

// --- Function composition ---

type Fn<A, B> = (a: A) => B;

function compose<A, B, C>(f: Fn<B, C>, g: Fn<A, B>): Fn<A, C> {
  return (x: A) => f(g(x));
}

function pipe<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
  return (x: T) => fns.reduce((acc, fn) => fn(acc), x);
}

// Pipeline example: process user input
const processInput = pipe(
  (s: string) => s.trim(),
  (s: string) => s.toLowerCase(),
  (s: string) => s.replace(/[^a-z0-9\\s]/g, ""),
  (s: string) => s.replace(/\\s+/g, "-"),
);

processInput("  Hello, World!  "); // "hello-world"

// --- Real-world: middleware-like pattern ---

type Middleware<T> = (value: T, next: (value: T) => T) => T;

function applyMiddleware<T>(
  middlewares: Middleware<T>[],
  initial: T
): T {
  const chain = middlewares.reduceRight(
    (next: (value: T) => T, mw: Middleware<T>) =>
      (value: T) => mw(value, next),
    (value: T) => value
  );
  return chain(initial);
}`
    },
    {
      language: "python",
      caption: "HOFs in Python: built-ins, functools, decorators as HOFs",
      source: `from functools import reduce, partial, lru_cache
from typing import Callable, TypeVar, List

T = TypeVar("T")
U = TypeVar("U")

# --- Built-in HOFs ---
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

doubled = list(map(lambda n: n * 2, numbers))
evens = list(filter(lambda n: n % 2 == 0, numbers))
total = reduce(lambda acc, n: acc + n, numbers, 0)

# Pythonic alternatives using comprehensions (often preferred)
doubled_comp = [n * 2 for n in numbers]
evens_comp = [n for n in numbers if n % 2 == 0]

# --- Decorators are HOFs ---
def retry(max_attempts: int = 3):
    """Decorator factory (HOF returning a HOF)."""
    def decorator(fn: Callable) -> Callable:
        def wrapper(*args, **kwargs):
            last_error = None
            for attempt in range(1, max_attempts + 1):
                try:
                    return fn(*args, **kwargs)
                except Exception as e:
                    last_error = e
                    print(f"Attempt {attempt} failed: {e}")
            raise last_error
        return wrapper
    return decorator

@retry(max_attempts=3)
def fetch_data(url: str) -> dict:
    ...

# --- Closure gotcha in Python ---
# BAD: all lambdas capture the same variable i
fns_bad = [lambda: i for i in range(5)]
[f() for f in fns_bad]  # [4, 4, 4, 4, 4]

# GOOD: default parameter captures current value
fns_good = [lambda i=i: i for i in range(5)]
[f() for f in fns_good]  # [0, 1, 2, 3, 4]

# --- Partial application with functools.partial ---
def power(base: int, exponent: int) -> int:
    return base ** exponent

square = partial(power, exponent=2)
cube = partial(power, exponent=3)

# --- compose and pipe ---
def compose(*fns: Callable) -> Callable:
    """Right-to-left function composition."""
    return reduce(lambda f, g: lambda *a, **kw: f(g(*a, **kw)), fns)

def pipe(*fns: Callable) -> Callable:
    """Left-to-right function composition."""
    return reduce(lambda f, g: lambda *a, **kw: g(f(*a, **kw)), fns)

process = pipe(
    str.strip,
    str.lower,
    lambda s: s.replace(" ", "-"),
)
process("  Hello World  ")  # "hello-world"

# --- lru_cache: memoization as a HOF ---
@lru_cache(maxsize=None)
def fibonacci(n: int) -> int:
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)`
    },
    {
      language: "haskell",
      caption: "HOFs in Haskell: currying, composition, folds, and Functor/Monad",
      source: `-- All functions in Haskell are curried by default.
-- add :: Int -> Int -> Int is actually Int -> (Int -> Int)
add :: Int -> Int -> Int
add x y = x + y

add5 :: Int -> Int
add5 = add 5   -- partial application, no special syntax needed

-- map, filter, foldl, foldr are the fundamental HOFs
doubled :: [Int]
doubled = map (* 2) [1..10]           -- [2,4,6,8,10,12,14,16,18,20]

evens :: [Int]
evens = filter even [1..10]            -- [2,4,6,8,10]

total :: Int
total = foldl (+) 0 [1..10]            -- 55

-- Function composition with (.)
-- (.) :: (b -> c) -> (a -> b) -> a -> c
processInput :: String -> String
processInput = map toLower . filter isAlpha . trim
  where trim = dropWhile isSpace . reverse . dropWhile isSpace . reverse

-- Point-free style: no explicit argument
sumOfSquaresOfEvens :: [Int] -> Int
sumOfSquaresOfEvens = sum . map (^2) . filter even

-- foldr can work on infinite lists (due to lazy evaluation)
-- Take first 5 even numbers from infinite list
firstFiveEvens :: [Int]
firstFiveEvens = take 5 $ filter even [1..]  -- [2,4,6,8,10]

-- Implementing map via foldr
myMap :: (a -> b) -> [a] -> [b]
myMap f = foldr (\\x acc -> f x : acc) []

-- Functor: generalized map
-- class Functor f where
--   fmap :: (a -> b) -> f a -> f b

-- Maybe is a Functor
safeHead :: [a] -> Maybe a
safeHead []    = Nothing
safeHead (x:_) = Just x

-- fmap applies the function inside the Maybe
doubled' :: Maybe Int
doubled' = fmap (* 2) (safeHead [3, 1, 4])  -- Just 6

-- Monad bind (>>=) chains computations that may fail
safeDivide :: Int -> Int -> Maybe Int
safeDivide _ 0 = Nothing
safeDivide x y = Just (x \`div\` y)

-- Kleisli composition (>=>)
-- (>=>) :: (a -> m b) -> (b -> m c) -> a -> m c
import Control.Monad ((>=>))

safeComputation :: Int -> Maybe Int
safeComputation = (\\x -> safeDivide 100 x) >=> (\\y -> safeDivide y 2)`
    }
  ],

  diagrams: [
    {
      title: "HOF Data Flow: map/filter/reduce Pipeline",
      kind: "flow",
      caption: "Shows how data flows through a chain of higher-order functions. Input collection enters map (transformation), flows to filter (selection), then to reduce (aggregation), producing a single output value. Intermediate arrays are created at each step unless transducers or lazy evaluation are used."
    },
    {
      title: "Closure Memory Model",
      kind: "architecture",
      caption: "Illustrates how a closure captures its lexical environment. The outer function's activation record (stack frame) contains local variables. The inner function holds a reference to this environment, keeping it alive after the outer function returns. Multiple closures from the same invocation share the same environment object."
    }
  ],

  animations: [
    {
      title: "reduce Step-by-Step Execution",
      steps: [
        { label: "Initialize", detail: "Set accumulator to initial value (0). Input: [3, 1, 4, 1, 5]. Reducer: (acc, n) => acc + n." },
        { label: "Step 1", detail: "acc = 0, current = 3. Reducer returns 0 + 3 = 3. Accumulator is now 3." },
        { label: "Step 2", detail: "acc = 3, current = 1. Reducer returns 3 + 1 = 4. Accumulator is now 4." },
        { label: "Step 3", detail: "acc = 4, current = 4. Reducer returns 4 + 4 = 8. Accumulator is now 8." },
        { label: "Step 4", detail: "acc = 8, current = 1. Reducer returns 8 + 1 = 9. Accumulator is now 9." },
        { label: "Step 5", detail: "acc = 9, current = 5. Reducer returns 9 + 5 = 14. No more elements. Final result: 14." }
      ]
    },
    {
      title: "Closure Creation and Invocation",
      steps: [
        { label: "Define outer function", detail: "function makeAdder(x) { return y => x + y; } -- The outer function takes x and returns an inner function." },
        { label: "Call makeAdder(5)", detail: "A new execution context is created with x = 5. The inner arrow function y => x + y is created. It captures a reference to the environment where x = 5." },
        { label: "Return the closure", detail: "makeAdder returns the inner function. The outer execution context would normally be garbage collected, but the inner function holds a reference to it, keeping x = 5 alive." },
        { label: "Invoke add5(3)", detail: "The closure is called with y = 3. It looks up x in its captured environment (x = 5). Returns 5 + 3 = 8. The closure can be called repeatedly; x remains 5." },
        { label: "Independent closures", detail: "Calling makeAdder(10) creates a separate closure with its own environment where x = 10. add5 and add10 do not share state -- each has its own captured environment." }
      ]
    }
  ],

  comparison: {
    columns: ["Aspect", "map", "filter", "reduce", "flatMap"],
    rows: [
      ["Purpose", "Transform each element", "Select elements by predicate", "Collapse to single value", "Transform and flatten one level"],
      ["Input → Output shape", "N elements → N elements", "N elements → 0..N elements", "N elements → 1 value", "N elements → 0..M elements"],
      ["Callback signature", "(element, index) => newElement", "(element, index) => boolean", "(accumulator, element) => newAcc", "(element, index) => Array"],
      ["Can implement others?", "No (preserves length)", "No (preserves values)", "Yes (most general iterator)", "Yes (subsumes map and filter)"],
      ["Lazy in JS?", "No (eager, creates new array)", "No (eager, creates new array)", "No (eager, single pass)", "No (eager, creates new array)"],
      ["Haskell equivalent", "fmap / map", "filter", "foldl / foldr", "concatMap / (>>=) for lists"]
    ]
  },

  interviewQA: [
    {
      q: "What is a higher-order function? Give examples from JavaScript.",
      a: "A higher-order function is a function that takes one or more functions as arguments, returns a function, or both. JavaScript examples: Array.prototype.map(callback) takes a function and applies it to each element; Array.prototype.sort(compareFn) takes a comparison function; Function.prototype.bind() returns a new function with a bound this; setTimeout(callback, ms) takes a callback to execute later; addEventListener takes an event handler function. Even simple patterns like const double = x => x * 2; [1,2,3].map(double) demonstrate HOFs -- map is higher-order because it accepts double as an argument.",
      followUps: [
        "Can you implement map using reduce?",
        "What is the difference between a callback and a higher-order function?",
        "Are all functions that accept callbacks considered higher-order?"
      ]
    },
    {
      q: "Explain closures and how they relate to higher-order functions.",
      a: "A closure is a function that retains access to variables from its lexical scope even after the outer function has returned. Closures are the mechanism that makes HOFs that return functions useful. When a HOF like function makeMultiplier(x) { return y => x * y; } returns the inner function, that inner function closes over x -- it captures a reference to the variable, not a copy of its value. This enables patterns like partial application (const double = makeMultiplier(2)), factory functions, memoization (the cache lives in the closure), and the module pattern. Without closures, a returned function could not carry any state from its creation context, severely limiting what HOFs can express.",
      followUps: [
        "What is the difference between closing over a variable by reference vs by value?",
        "How do closures interact with garbage collection?",
        "Explain the classic loop-closure bug in JavaScript."
      ]
    },
    {
      q: "When would you use reduce over a for loop? What are the tradeoffs?",
      a: "Use reduce when you are accumulating a single result from a collection -- summing values, building an object from an array, grouping items, or implementing other HOFs like map/filter. The advantage is declarative intent: reduce signals 'I am collapsing this collection' in a way a for loop does not. It is also composable -- you can pass different reducers to the same reduce call. However, reduce has tradeoffs: (1) readability suffers for complex reductions -- a multi-line reducer with nested conditionals is harder to read than a for loop, (2) performance -- reduce creates a new accumulator each iteration if you use immutable patterns like [...acc, item], vs mutating in a loop, (3) debugging -- you cannot set a breakpoint on a specific iteration as easily, (4) early termination -- reduce processes all elements (no break), while a for loop can exit early. The pragmatic answer: use reduce for simple, well-understood aggregations; use for loops (or for...of) for complex logic with early exits or side effects.",
      followUps: [
        "How would you implement early termination with reduce?",
        "Can reduce cause stack overflow? When?",
        "What are transducers and how do they solve the intermediate array problem?"
      ]
    },
    {
      q: "What is function composition and why is it useful?",
      a: "Function composition combines two or more functions to produce a new function where the output of one feeds into the input of the next: compose(f, g)(x) = f(g(x)). The pipe variant reverses the order: pipe(f, g)(x) = g(f(x)), reading left-to-right like a data pipeline. Composition is useful because it lets you build complex transformations from simple, tested, reusable pieces. Instead of writing a monolithic function that parses, validates, transforms, and formats data, you compose parse |> validate |> transform |> format. Each piece can be tested independently, reused in other pipelines, and reasoned about in isolation. Composition is the fundamental operation of functional programming -- category theory defines it as the essential operation on morphisms. Practical benefits: point-free style reduces naming overhead, pipelines are self-documenting, and adding/removing a transformation step is a one-line change.",
      followUps: [
        "How does composition work with functions that return Promises or Maybe values?",
        "What is point-free style and when does it help or hurt readability?",
        "How would you type a generic compose function in TypeScript?"
      ]
    },
    {
      q: "Compare HOF approaches in JavaScript, Python, and Haskell.",
      a: "JavaScript: first-class functions with arrow syntax, array methods (map/filter/reduce), closures with lexical this binding, no built-in composition operator but libraries like Ramda/lodash provide it. Python: first-class functions, but the community prefers list comprehensions and generator expressions over map/filter; functools provides reduce, partial, lru_cache; decorators are the primary HOF pattern; lambda is limited to single expressions. Haskell: all functions are curried by default (no special partial application syntax), the (.) operator composes functions, ($) applies functions, fold is the primitive iterator, lazy evaluation means map/filter on infinite lists works naturally, and the type system (Functor, Applicative, Monad) formalizes HOF patterns algebraically. Key difference: Haskell's type system enforces HOF contracts at compile time (a map over Maybe is type-checked), while JS/Python rely on runtime behavior."
    }
  ],

  mcqs: [
    {
      q: "What does the following code return?\n[1, 2, 3, 4, 5].reduce((acc, n) => acc + n, 10)",
      options: ["15", "25", "10", "TypeError"],
      answerIndex: 1,
      explanation: "reduce starts with initial value 10, then adds each element: 10+1=11, 11+2=13, 13+3=16, 16+4=20, 20+5=25."
    },
    {
      q: "Which of the following is NOT a higher-order function?",
      options: [
        "Array.prototype.map",
        "Array.prototype.sort",
        "Math.max",
        "Array.prototype.filter"
      ],
      answerIndex: 2,
      explanation: "Math.max takes numbers as arguments and returns a number -- it neither accepts nor returns functions. map, sort, and filter all accept callback functions, making them higher-order."
    },
    {
      q: "What will this code output?\nfunction make() { let x = 0; return () => ++x; }\nconst a = make();\nconst b = make();\nconsole.log(a(), a(), b());",
      options: ["1 2 3", "1 2 1", "1 1 1", "0 1 0"],
      answerIndex: 1,
      explanation: "Each call to make() creates a new closure with its own x variable. a() increments its x: 1, then 2. b() has a separate x, so b() returns 1. Output: 1 2 1."
    },
    {
      q: "In Haskell, what is the type of the function composition operator (.)?",
      options: [
        "(a -> b) -> (a -> b) -> a -> b",
        "(b -> c) -> (a -> b) -> a -> c",
        "(a -> b) -> (b -> c) -> a -> c",
        "(a -> b) -> a -> b"
      ],
      answerIndex: 1,
      explanation: "(.) takes a function (b -> c) and a function (a -> b), and returns a function (a -> c). It applies the second function first, then the first -- right-to-left composition."
    },
    {
      q: "What problem do transducers solve?",
      options: [
        "Type safety in functional pipelines",
        "Intermediate collection allocation in chained map/filter/reduce",
        "Callback hell in asynchronous code",
        "Mutable state in closures"
      ],
      answerIndex: 1,
      explanation: "Transducers compose transformation steps (map, filter, take) into a single reducing function, eliminating the intermediate arrays/collections that chained operations create. They process elements in a single pass regardless of how many transformations are composed."
    }
  ],

  flashcards: [
    { front: "What makes a function 'higher-order'?", back: "It takes one or more functions as arguments, returns a function as its result, or both. This requires the language to support first-class functions." },
    { front: "What is the difference between map and flatMap?", back: "map applies a function to each element and wraps results in the same container structure (N inputs -> N outputs). flatMap applies a function that returns a container, then flattens one level (N inputs -> 0..M outputs). flatMap is equivalent to map followed by flatten." },
    { front: "What is a closure?", back: "A function bundled with references to variables from its enclosing lexical scope. The closed-over variables survive even after the outer function returns, because the closure holds a reference to the environment." },
    { front: "Why can reduce implement map and filter?", back: "reduce is the most general collection iterator -- it visits every element with full control over the accumulator. map can be expressed as reduce that appends fn(element) to an array accumulator. filter can be expressed as reduce that conditionally appends elements." },
    { front: "What is currying?", back: "Transforming a function of multiple arguments into a sequence of functions each taking one argument: f(a, b, c) becomes f(a)(b)(c). In Haskell, all functions are curried by default. In JS/TS, currying must be done manually or via utility functions." },
    { front: "What is function composition?", back: "Creating a new function by combining two or more functions: compose(f, g)(x) = f(g(x)). The output of g becomes the input of f. Pipe is left-to-right composition: pipe(f, g)(x) = g(f(x))." },
    { front: "What is the closure 'loop bug' in JavaScript?", back: "Using var in a for loop and creating closures (e.g., event handlers) inside it -- all closures share the same variable, which ends up with the final loop value. Fix: use let (block-scoped), an IIFE, or forEach." },
    { front: "What are transducers?", back: "Composable algorithmic transformations that decouple the 'what' (map/filter/take) from the 'how' (array, stream, channel). A transducer transforms a reducer into another reducer, enabling single-pass processing without intermediate collections." }
  ],

  revisionNotes: [
    "HOF = takes function as argument OR returns function. First-class functions are the prerequisite.",
    "map preserves structure (same number of elements), filter preserves values (same elements, fewer), reduce is the universal iterator (can implement both).",
    "Closures capture variables by reference, not by value. In Python loops, use default parameters to capture current values.",
    "Currying: f(a, b) -> f(a)(b). Partial application: fix some arguments, get a new function. Currying enables easy partial application.",
    "compose(f, g)(x) = f(g(x)) right-to-left. pipe(f, g)(x) = g(f(x)) left-to-right. Composition is associative.",
    "JavaScript map/filter/reduce are eager and create intermediate arrays. Use transducers, generators, or manual loop fusion to avoid this.",
    "Haskell: all functions curried, (.) for composition, lazy evaluation enables map/filter on infinite lists, Functor/Monad formalize HOF patterns.",
    "Decorators in Python are syntactic sugar for HOFs: @decorator means func = decorator(func)."
  ],

  cheatSheet: [
    "arr.map(fn) -- transform each element, returns new array of same length",
    "arr.filter(pred) -- keep elements where pred returns true",
    "arr.reduce((acc, el) => newAcc, initial) -- collapse array to single value",
    "arr.flatMap(fn) -- map then flatten one level (fn returns arrays)",
    "const compose = (f, g) => x => f(g(x)) -- right-to-left composition",
    "const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x) -- left-to-right pipeline",
    "const curry = f => a => b => f(a, b) -- manual currying for 2-arg function",
    "const memoize = fn => { const c = new Map(); return (...a) => { const k = JSON.stringify(a); return c.has(k) ? c.get(k) : (c.set(k, fn(...a)), c.get(k)); }; }"
  ],

  resources: [
    { label: "MDN - Array.prototype.reduce()", kind: "docs", note: "Definitive reference for JavaScript's reduce with examples and edge cases" },
    { label: "Professor Frisby's Mostly Adequate Guide to Functional Programming", kind: "book", note: "Free online book covering HOFs, composition, functors, and monads in JavaScript" },
    { label: "Learn You a Haskell for Great Good!", kind: "book", note: "Gentle introduction to Haskell covering currying, HOFs, and type classes" },
    { label: "Composing Software by Eric Elliott", kind: "article", note: "Blog series on function composition, transducers, and functional patterns in JavaScript" },
    { label: "Rich Hickey - Transducers (Strange Loop 2014)", kind: "video", note: "Original talk introducing transducers and the rationale behind composable algorithmic transformations" }
  ],

  glossary: [
    { term: "Higher-Order Function (HOF)", definition: "A function that takes one or more functions as arguments, returns a function, or both. Requires first-class function support in the language." },
    { term: "First-Class Function", definition: "A function treated as a value: it can be assigned to variables, passed as arguments, returned from functions, and stored in data structures." },
    { term: "Closure", definition: "A function that captures and retains access to variables from its lexical (enclosing) scope, even after the enclosing function has finished executing." },
    { term: "Callback", definition: "A function passed as an argument to another function to be invoked at a specific point -- synchronously (sort comparator) or asynchronously (event handler, I/O completion)." },
    { term: "Currying", definition: "Transforming a function that takes multiple arguments into a chain of functions each taking a single argument: f(a, b, c) becomes f(a)(b)(c)." },
    { term: "Partial Application", definition: "Creating a new function by fixing one or more arguments of an existing function. Related to but distinct from currying -- partial application can fix any number of arguments at once." },
    { term: "Functor", definition: "A type that implements a map operation (fmap in Haskell) satisfying identity and composition laws. Arrays, Maybe, Either, Promises, and trees are all functors." },
    { term: "Transducer", definition: "A composable transformation that takes a reducing function and returns a new reducing function, enabling single-pass processing of data without intermediate collections." }
  ],
};
