import type { TopicContent } from "../types";

export const functionComposition: TopicContent = {
  quickSummary: [
    "Function composition is the process of combining two or more functions to produce a new function, where the output of one function becomes the input of the next. Mathematically, (f . g)(x) = f(g(x)). It is the fundamental building block of declarative, pipeline-oriented programming.",
    "Compose applies functions right-to-left (matching mathematical notation), while pipe applies them left-to-right (matching reading order and data flow). Both produce the same result -- the choice is about readability and convention. Haskell and Ramda prefer compose; Elixir, F#, and most modern TypeScript utilities prefer pipe.",
    "Currying transforms a function of N arguments into a chain of N single-argument functions: f(a, b, c) becomes f(a)(b)(c). Partial application fixes some arguments of a function, producing a new function that takes the remaining ones. Currying enables partial application, which enables point-free composition.",
    "Point-free (tacit) style defines functions without explicitly mentioning their arguments. Instead of x => toUpper(trim(x)), you write compose(toUpper, trim). This focuses on data flow and transformation rather than naming intermediate values, but overuse reduces readability.",
  ],

  detailed: [
    "## Compose vs Pipe\n\nCompose and pipe are duals: compose(f, g, h)(x) = f(g(h(x))) applies right-to-left, while pipe(f, g, h)(x) = h(g(f(x))) applies left-to-right. Compose mirrors mathematical notation and is natural when reading expressions as nested function calls. Pipe mirrors execution order and is natural when thinking of data flowing through a pipeline. In Haskell, the (.) operator is compose and (|>) is pipe (though pipe is less common). F# and Elixir use the |> operator natively. In JavaScript/TypeScript, neither exists natively -- TC39 has a Stage 2 pipe operator proposal (x |> f). Libraries like Ramda provide compose/pipe, and fp-ts provides flow (pipe) and pipe (with value).",

    "## Currying in Depth\n\nCurrying (named after Haskell Curry, though Moses Schoenfinkel invented it) converts a multi-argument function into a chain of unary functions. In Haskell, ALL functions are curried by default: add :: Int -> Int -> Int is really Int -> (Int -> Int). This means add 3 is a valid expression returning a function that adds 3. In JavaScript/TypeScript, manual currying is verbose: const add = (a: number) => (b: number) => a + b. Auto-curry utilities (Ramda's R.curry, lodash/fp) detect arity and return a curried version that can be called with any number of arguments. The Schoenfinkel-Curry isomorphism proves that any function of N arguments can be represented as N nested unary functions, and vice versa -- they are computationally equivalent.",

    "## Partial Application\n\nPartial application fixes one or more arguments of a function, returning a new function with reduced arity. Unlike currying (which always produces unary functions in a chain), partial application can fix arguments at any position. JavaScript's Function.prototype.bind performs partial application: multiply.bind(null, 2) fixes the first argument to 2. Lodash's _.partial and Ramda's R.partial provide more flexible partial application. In Haskell, partial application is trivial because of default currying -- map (+3) [1,2,3] partially applies (+) with 3. The distinction matters: currying is a transformation of function shape, while partial application is a use of that shape to create specialized functions.",

    "## Point-Free Style\n\nPoint-free (tacit) programming defines functions without naming their arguments. Instead of const shout = (s: string) => toUpper(trim(s)), write const shout = compose(toUpper, trim). The 'points' being freed are not dots but rather the named variables (from topology -- 'points in a space'). Benefits: (1) emphasizes data flow over plumbing, (2) eliminates naming of trivial intermediate values, (3) often produces more composable code. Risks: (1) 'pointless style' -- excessive point-free code becomes unreadable, (2) debugging is harder without named variables, (3) TypeScript type inference degrades in complex compositions. Haskell programmers use hlint to suggest point-free refactorings. The eta-reduction rule formalizes this: if f x = g x for all x, then f = g.",

    "## Function Pipelines and Transducers\n\nA pipeline chains transformations on data: data |> parse |> validate |> transform |> serialize. Each step is a pure function that returns new data. In array processing, chained .map().filter().map() creates intermediate arrays at each step. Transducers (coined by Rich Hickey for Clojure) solve this by composing the transformations themselves rather than the data. A transducer transforms a reducing function into another reducing function, enabling a single pass through the data. The key insight: map, filter, and take can all be expressed as reducer transformers. Composing transducers with compose gives a single reducer that applies all transformations in one pass -- no intermediate collections, no multiple iterations.",

    "## Monadic Composition\n\nWhen functions return wrapped values (Maybe, Either, Promise, Result), simple compose breaks because the types don't align: f: A -> Maybe<B> and g: B -> Maybe<C> cannot be composed with (.). Kleisli composition (>=> in Haskell) solves this: (f >=> g)(a) = f(a) >>= g. This is monadic composition -- chaining computations that produce effects. In TypeScript with fp-ts, this is flow(f, chain(g)). Promise.then is essentially monadic composition for async effects. Understanding this connection reveals that async/await, Optional chaining (?.), and Result/Either error handling are all instances of the same pattern: composing functions that produce wrapped values.",
  ],

  deepDive: [
    "## Category Theory Foundations\n\nFunction composition is the core operation in category theory. A category consists of objects, morphisms (arrows between objects), and a composition operation that is associative with identity. In the category **Set**, objects are types and morphisms are functions. Composition (.) is associative: f . (g . h) = (f . g) . h. The identity function id satisfies f . id = id . f = f. Haskell's Category type class captures this: class Category cat where id :: cat a a; (.) :: cat b c -> cat a b -> cat a c. Kleisli categories model effectful composition: the Kleisli category for Maybe has morphisms a -> Maybe b, composed with (>=>). Understanding categories reveals that compose, pipe, Promise.then, and array flatMap are all instances of the same abstract structure.",

    "## Transducers: Implementation and Theory\n\nA transducer is a function from one reducing function to another: type Transducer<A, B> = (step: (acc: R, b: B) => R) => (acc: R, a: A) => R. The mapping transducer transforms values: const map = (f) => (step) => (acc, x) => step(acc, f(x)). The filtering transducer skips values: const filter = (pred) => (step) => (acc, x) => pred(x) ? step(acc, x) : acc. Crucially, transducers compose with regular function composition -- compose(map(f), filter(p)) produces a single transducer that maps then filters in one pass. The composition order matches the logical data flow (left-to-right), even though compose is right-to-left, because transducers are 'inside-out' -- each wraps the next step. This inversion is the key insight that makes transducers both efficient and composable.",

    "## Lenses as Composed Accessors\n\nLenses are composable getter/setter pairs that provide a point-free way to access and update nested data structures. A lens for a property is: const lensProp = (key) => ({ get: obj => obj[key], set: (val, obj) => ({...obj, [key]: val}) }). Lenses compose: composeLens(lensA, lensB) produces a lens that focuses through A then B into nested structure. In Haskell, lens composition uses (.) because lenses are functions (specifically, they are van Laarhoven lenses: Functor f => (a -> f a) -> s -> f s). The composability of lenses demonstrates how function composition scales to complex data access patterns -- address.street.name becomes compose(nameLens, streetLens, addressLens) with no intermediate variables.",

    "## Continuation-Passing and CPS Transform\n\nContinuation-Passing Style (CPS) transforms f(x) into f(x, k) where k is the continuation -- what to do next. CPS makes composition explicit: instead of compose(f, g)(x), you write g(x, result => f(result, k)). The CPS transform turns any program into one where every function call is a tail call, enabling guaranteed stack safety. This is deeply connected to function composition: a continuation is the 'rest of the computation', and composing continuations builds up the full computation. Haskell's Cont monad (newtype Cont r a = Cont { runCont :: (a -> r) -> r }) makes this explicit. In JavaScript, Promises are CPS with automatic chaining -- .then(f).then(g) is CPS composition where the runtime manages the continuations.",

    "## Compile-Time Composition and Inlining\n\nIn optimizing compilers, composed functions can be inlined and fused into a single function body, eliminating call overhead. GHC (Haskell) applies rewrite rules: map f . map g = map (f . g) (map fusion). This means compose(map(f), map(g)) compiles to a single-pass map(x => f(g(x))). Rust's iterator adaptors use the same principle -- .map(f).filter(p).map(g) compiles to a single loop with no intermediate allocations. V8 and JIT compilers inline small functions aggressively, making pipe(f, g, h)(x) as fast as f(g(h(x))) after optimization. The theoretical backing is deforestation (Wadler, 1988) -- removing intermediate data structures from compositions of producers and consumers.",
  ],

  code: [
    {
      language: "typescript",
      caption: "Compose, pipe, curry, and partial application utilities in TypeScript",
      source: `// --- compose: right-to-left function composition ---
type Fn<A, B> = (a: A) => B;

function compose<A, B, C>(f: Fn<B, C>, g: Fn<A, B>): Fn<A, C>;
function compose<A, B, C, D>(f: Fn<C, D>, g: Fn<B, C>, h: Fn<A, B>): Fn<A, D>;
function compose(...fns: Function[]) {
  return (x: unknown) => fns.reduceRight((acc, fn) => fn(acc), x);
}

// --- pipe: left-to-right function composition ---
function pipe<A, B, C>(f: Fn<A, B>, g: Fn<B, C>): Fn<A, C>;
function pipe<A, B, C, D>(f: Fn<A, B>, g: Fn<B, C>, h: Fn<C, D>): Fn<A, D>;
function pipe(...fns: Function[]) {
  return (x: unknown) => fns.reduce((acc, fn) => fn(acc), x);
}

// --- curry: auto-curry with TypeScript types ---
function curry<A, B, R>(fn: (a: A, b: B) => R): (a: A) => (b: B) => R;
function curry<A, B, C, R>(fn: (a: A, b: B, c: C) => R): (a: A) => (b: B) => (c: C) => R;
function curry(fn: Function) {
  const arity = fn.length;
  return function curried(...args: unknown[]): unknown {
    if (args.length >= arity) return fn(...args);
    return (...more: unknown[]) => curried(...args, ...more);
  };
}

// --- partial: fix leading arguments ---
function partial<A, B, R>(fn: (a: A, b: B) => R, a: A): (b: B) => R;
function partial(fn: Function, ...fixed: unknown[]) {
  return (...rest: unknown[]) => fn(...fixed, ...rest);
}

// --- Usage: building a text processing pipeline ---
const trim = (s: string) => s.trim();
const toLower = (s: string) => s.toLowerCase();
const split = curry((sep: string, s: string) => s.split(sep));
const join = curry((sep: string, arr: string[]) => arr.join(sep));
const map = curry(<A, B>(f: Fn<A, B>, xs: A[]): B[] => xs.map(f));

// Point-free pipeline: normalize whitespace in a string
const normalizeWhitespace = pipe(
  trim,
  split(/\\s+/),        // split on any whitespace (curried)
  join(" ")             // rejoin with single space
);

console.log(normalizeWhitespace("  hello   world  ")); // "hello world"

// Compose example: slugify
const replace = curry((pattern: RegExp, replacement: string, s: string) =>
  s.replace(pattern, replacement)
);

const slugify = compose(
  replace(/[^a-z0-9-]/g, ""),   // remove non-alphanumeric
  replace(/\\s+/g, "-"),         // spaces to hyphens
  toLower,
  trim
);

console.log(slugify("  Hello World! ")); // "hello-world"

// --- Transducer: compose map/filter into single pass ---
type Reducer<Acc, Val> = (acc: Acc, val: Val) => Acc;
type Transducer<A, B> = <R>(step: Reducer<R, B>) => Reducer<R, A>;

const xmap = <A, B>(f: Fn<A, B>): Transducer<A, B> =>
  (step) => (acc, val) => step(acc, f(val));

const xfilter = <A>(pred: (a: A) => boolean): Transducer<A, A> =>
  (step) => (acc, val) => pred(val) ? step(acc, val) : acc;

// Compose transducers: double then keep evens -- single pass
const xform = compose(
  xmap((n: number) => n * 2),
  xfilter((n: number) => n % 4 === 0)
);

const result = [1, 2, 3, 4, 5].reduce(
  xform<number[]>((acc, val) => [...acc, val]),
  []
);
console.log(result); // [4, 8]`,
    },
    {
      language: "cpp",
      caption: "Compose, pipe, and partial application in C++ using templates and lambdas",
      source: `#include <algorithm>
#include <functional>
#include <iostream>
#include <numeric>
#include <string>
#include <vector>

// --- compose: right-to-left composition of two functions ---
template <typename F, typename G>
auto compose(F f, G g) {
    return [f, g](auto x) { return f(g(x)); };
}

// --- pipe: left-to-right composition of two functions ---
template <typename F, typename G>
auto pipe(F f, G g) {
    return [f, g](auto x) { return g(f(x)); };
}

// --- Variadic compose: compose(f, g, h)(x) = f(g(h(x))) ---
template <typename F>
auto compose_all(F f) { return f; }

template <typename F, typename... Fs>
auto compose_all(F f, Fs... rest) {
    return [f, rest...](auto x) {
        return f(compose_all(rest...)(x));
    };
}

// --- Variadic pipe: pipe_all(f, g, h)(x) = h(g(f(x))) ---
template <typename F>
auto pipe_all(F f) { return f; }

template <typename F, typename... Fs>
auto pipe_all(F f, Fs... rest) {
    return [f, rest...](auto x) {
        return pipe_all(rest...)(f(x));
    };
}

// --- Curried functions via nested lambdas ---
auto add = [](int a) {
    return [a](int b) { return a + b; };
};

auto multiply = [](int a) {
    return [a](int b) { return a * b; };
};

int main() {
    // Partial application via currying
    auto add_10 = add(10);      // fixes first argument
    auto doubler = multiply(2);

    // Pipe: left-to-right composition
    auto transform = pipe(add_10, doubler);
    std::cout << transform(5) << "\\n"; // (5 + 10) * 2 = 30

    // --- String processing pipeline ---
    auto trim = [](std::string s) {
        auto start = s.find_first_not_of(" ");
        auto end   = s.find_last_not_of(" ");
        return (start == std::string::npos) ? "" : s.substr(start, end - start + 1);
    };
    auto to_lower = [](std::string s) {
        std::transform(s.begin(), s.end(), s.begin(), ::tolower);
        return s;
    };
    auto replace_spaces = [](std::string s) {
        std::replace(s.begin(), s.end(), ' ', '-');
        return s;
    };

    auto slugify = pipe_all(trim, to_lower, replace_spaces);
    std::cout << slugify(std::string("  Hello World  ")) << "\\n"; // "hello-world"

    // --- Transducer-like pattern: single-pass map + filter ---
    auto xmap = [](auto f) {
        return [f](auto step) {
            return [f, step](auto acc, auto val) {
                return step(acc, f(val));
            };
        };
    };
    auto xfilter = [](auto pred) {
        return [pred](auto step) {
            return [pred, step](auto acc, auto val) {
                return pred(val) ? step(acc, val) : acc;
            };
        };
    };

    // compose transducers: double then keep multiples of 4
    auto xform = compose(
        xmap([](int n) { return n * 2; }),
        xfilter([](int n) { return n % 4 == 0; })
    );

    std::vector<int> data = {1, 2, 3, 4, 5};
    auto appender = [](std::vector<int> acc, int val) {
        acc.push_back(val);
        return acc;
    };

    auto result = std::accumulate(
        data.begin(), data.end(),
        std::vector<int>{},
        xform(appender)
    );
    for (int v : result) std::cout << v << " "; // 4 8
    std::cout << "\\n";

    return 0;
}`,
    },
    {
      language: "haskell",
      caption: "Native composition, currying, and point-free style in Haskell",
      source: `-- In Haskell, all functions are curried by default.
-- add :: Int -> Int -> Int  is really  Int -> (Int -> Int)
add :: Int -> Int -> Int
add x y = x + y

add10 :: Int -> Int
add10 = add 10          -- partial application: just supply fewer args

double :: Int -> Int
double = (* 2)          -- operator section: another form of partial application

-- (.) is function composition: (f . g) x = f (g x)
transform :: Int -> Int
transform = double . add10
-- transform 5 = double (add10 5) = double 15 = 30

-- Point-free style: no explicit argument
slugify :: String -> String
slugify = intercalate "-" . words . map toLower . filter (not . isSymbol)
-- Reads right-to-left: filter symbols, lowercase, split words, join with "-"

-- The pipe operator (less common in Haskell, but available)
(|>) :: a -> (a -> b) -> b
x |> f = f x
infixl 1 |>

example :: Int
example = 5 |> add10 |> double |> show |> length
-- Reads left-to-right: 5 -> add10 -> double -> show -> length = 2

-- Kleisli composition for Maybe (monadic composition)
import Control.Monad ((>=>))

safeDivide :: Int -> Int -> Maybe Int
safeDivide _ 0 = Nothing
safeDivide x y = Just (x \\\`div\\\` y)

safeHead :: [a] -> Maybe a
safeHead []    = Nothing
safeHead (x:_) = Just x

-- (>=>) :: (a -> m b) -> (b -> m c) -> a -> m c
-- Composes functions that return Maybe, threading the Nothing case
lookupAndDivide :: [(String, Int)] -> String -> Maybe Int
lookupAndDivide table =
  flip lookup table >=> safeDivide 100
  -- First looks up the key, then divides 100 by the result
  -- If either step fails, the whole chain returns Nothing

-- Transducer-like pattern with foldr
mapT :: (a -> b) -> ((b -> r -> r) -> (a -> r -> r))
mapT f step = \\a r -> step (f a) r

filterT :: (a -> Bool) -> ((a -> r -> r) -> (a -> r -> r))
filterT p step = \\a r -> if p a then step a r else r

-- Compose transformations, single-pass fold
xform :: (Int -> [Int] -> [Int]) -> (Int -> [Int] -> [Int])
xform = mapT (* 2) . filterT even

result :: [Int]
result = foldr (xform (:)) [] [1, 2, 3, 4, 5]
-- [4, 8]`,
    },
  ],

  diagrams: [
    {
      title: "Compose vs Pipe Data Flow",
      kind: "flow",
      caption: "Compose applies functions right-to-left while pipe applies left-to-right; both are equivalent with reversed order.",
      mermaid: `flowchart LR
    INPUT["Input x"]
    subgraph PIPE["pipe(h, g, f)(x) — left to right"]
      PH["h(x)"] --> PG["g(h(x))"] --> PF["f(g(h(x)))"]
    end
    subgraph COMPOSE["compose(f, g, h)(x) — right to left"]
      CH["h(x)"] --> CG["g(h(x))"] --> CF["f(g(h(x)))"]
    end
    INPUT --> PIPE
    INPUT --> COMPOSE`,
    },
    {
      title: "Currying and Partial Application",
      kind: "architecture",
      caption: "Currying transforms a multi-argument function into a chain of unary functions; partial application fixes early arguments.",
      mermaid: `graph TD
    ORIG["f(a, b, c)\nmulti-arg function"]
    ORIG --> CURRY["Curried: f(a)(b)(c)\neach call returns a new function"]
    CURRY --> PA["Partial Application\nconst g = f(a)\ng is waiting for b and c"]
    PA --> POINT["Point-Free Composition\nconst transform = compose(f(a), f(b))\nno explicit data argument"]`,
    },
    {
      title: "Functor Map in Composition",
      kind: "flow",
      caption: "How map lifts a plain function into a container context so it can participate in composed pipelines.",
      mermaid: `flowchart TD
    A["Plain function: f: a -> b"]
    A --> B["map(f) lifts it\nfmap: F a -> F b"]
    B --> C{What container?}
    C -->|Array| D["arr.map(f)\napplied to each element"]
    C -->|Maybe| E["Just(x).map(f) = Just(f(x))\nNothing.map(f) = Nothing"]
    C -->|Promise| F["promise.then(f)\napplied on resolve"]
    D --> G["Composable in pipelines\npipe(map(f), map(g))"]
    E --> G
    F --> G`,
    },
  ],

  animations: [
    {
      title: "Pipe Execution Step-Through",
      steps: [
        { label: "Input value", detail: "Start with raw input: \"  Hello World!  \"" },
        { label: "Step 1: trim", detail: "trim(\"  Hello World!  \") produces \"Hello World!\"" },
        { label: "Step 2: toLower", detail: "toLower(\"Hello World!\") produces \"hello world!\"" },
        { label: "Step 3: replace spaces", detail: "replace(/ /g, \"-\")(\"hello world!\") produces \"hello-world!\"" },
        { label: "Step 4: remove non-alnum", detail: "replace(/[^a-z0-9-]/g, \"\")(\"hello-world!\") produces \"hello-world\"" },
        { label: "Final result", detail: "The pipe produced \"hello-world\" by threading the value through four functions in reading order, each transforming the output of the previous step." },
      ],
    },
    {
      title: "Transducer Composition vs Chained Arrays",
      steps: [
        { label: "Chained approach", detail: "[1,2,3,4,5].map(n => n*2).filter(n => n%4===0) creates TWO intermediate arrays: first [2,4,6,8,10], then [4,8]." },
        { label: "Build transducer", detail: "compose(xmap(n => n*2), xfilter(n => n%4===0)) produces a single combined reducer -- no arrays allocated yet." },
        { label: "Process element 1", detail: "Element 1: multiply by 2 = 2, check 2%4===0? No. Skip. No intermediate array." },
        { label: "Process element 2", detail: "Element 2: multiply by 2 = 4, check 4%4===0? Yes. Append 4 to result." },
        { label: "Remaining elements", detail: "Elements 3,4,5 processed identically in single pass. 6 skipped, 8 appended, 10 skipped." },
        { label: "Result", detail: "[4, 8] produced in a single pass with zero intermediate arrays. O(n) time, O(1) extra space versus O(2n) for chained approach." },
      ],
    },
  ],

  comparison: {
    columns: ["Aspect", "Compose", "Pipe", "Currying", "Partial Application"],
    rows: [
      ["Direction", "Right-to-left: f(g(h(x)))", "Left-to-right: h(g(f(x)))", "N/A -- transforms function shape", "N/A -- fixes arguments"],
      ["Primary use", "Match mathematical notation", "Match reading order / data flow", "Enable point-free style", "Create specialized functions"],
      ["Haskell", "(.) operator, native", "(&) or custom |>", "All functions curried by default", "Just supply fewer arguments"],
      ["TypeScript", "Ramda R.compose, manual", "fp-ts flow, TC39 |> proposal", "R.curry or manual nesting", "bind(), R.partial, lodash"],
      ["Python", "functools.reduce + reversed", "functools.reduce", "Manual or decorator", "functools.partial"],
      ["Arity", "N functions -> 1 function", "N functions -> 1 function", "N-ary -> chain of unary", "N-ary -> (N-k)-ary"],
      ["Type safety", "Hard in TS without overloads", "Same challenge as compose", "Overloads or generics", "Straightforward typing"],
      ["Debugging", "Hard -- nested calls in stack", "Easier -- linear stack trace", "Extra frames from closures", "Clear -- standard closure"],
    ],
  },

  interviewQA: [
    {
      q: "What is the difference between currying and partial application?",
      a: "Currying transforms a function of N arguments into N nested unary functions: f(a, b, c) becomes f(a)(b)(c). It changes the function's structure. Partial application fixes specific arguments of a function to produce a new function with fewer parameters: partial(f, 1) gives g(b, c) = f(1, b, c). Currying is a prerequisite that enables convenient partial application -- in a curried function, just calling with fewer arguments IS partial application. In Haskell, all functions are curried by default, so partial application is free. In JavaScript, you need curry utilities or manual nesting.",
      followUps: [
        "How does Ramda's R.curry handle variable arity and placeholder arguments?",
        "What is the Schoenfinkel-Curry isomorphism and why does it matter?",
        "When does auto-currying hurt performance in JavaScript?",
      ],
    },
    {
      q: "What is point-free style and when should you avoid it?",
      a: "Point-free (tacit) style defines functions without naming their arguments. Instead of const process = x => toUpper(trim(x)), you write const process = compose(toUpper, trim). The 'points' are the named variables (from topology). Benefits: focuses on transformations rather than plumbing, often more concise, and naturally composable. Avoid it when: (1) the composition is complex enough that naming intermediate values aids understanding, (2) TypeScript type inference breaks down in deep compositions, (3) debugging is needed -- named variables appear in stack traces and debugger watches, (4) the function takes multiple arguments that need destructuring or reordering.",
      followUps: [
        "What is eta-reduction and how does it relate to point-free style?",
        "How does hlint detect opportunities for point-free refactoring?",
      ],
    },
    {
      q: "Explain transducers and why they are useful.",
      a: "Transducers are composable transformation functions that operate on reducing functions rather than on data directly. A transducer takes a reducer (acc, val) => acc and returns a new reducer that transforms values before passing them to the original. For example, a mapping transducer wraps a reducer to apply a function to each value before accumulating. The key benefit: when you chain .map().filter().map() on an array, each step creates an intermediate array and iterates the full collection. Transducers compose these transformations into a single reducer that processes each element once in a single pass. They are also decoupled from the data structure -- the same transducer works with arrays, streams, channels, or any foldable structure.",
      followUps: [
        "How does transducer composition order relate to logical data flow order?",
        "What is the relationship between transducers and the reducer protocol?",
        "How do early-termination transducers like take() work?",
      ],
    },
    {
      q: "How does monadic composition (Kleisli composition) extend function composition?",
      a: "Regular composition combines f: A -> B with g: B -> C to get A -> C. But when functions return wrapped values -- f: A -> Maybe<B> and g: B -> Maybe<C> -- regular composition fails because the types don't align (g expects B, not Maybe<B>). Kleisli composition (>=> in Haskell) threads the monadic context: (f >=> g)(a) unwraps f(a), and if it succeeds, passes the inner value to g. This generalizes to any monad: Maybe (short-circuit on Nothing), Either (short-circuit on Left/error), Promise (chain async operations), List (flatMap). In JavaScript, Promise.then is essentially Kleisli composition. In fp-ts, chain and flow combine to give typed Kleisli composition.",
      followUps: [
        "What is a Kleisli category?",
        "How does async/await relate to monadic composition?",
      ],
    },
  ],

  mcqs: [
    {
      q: "What does compose(f, g)(x) evaluate to?",
      options: ["g(f(x))", "f(g(x))", "f(x)(g(x))", "x(f)(g)"],
      answerIndex: 1,
      explanation: "compose applies functions right-to-left: compose(f, g)(x) = f(g(x)). The rightmost function (g) is applied first, and its result is passed to f.",
    },
    {
      q: "In Haskell, what does the expression `map (+3) [1,2,3]` demonstrate?",
      options: ["Function composition", "Partial application", "Monadic binding", "Pattern matching"],
      answerIndex: 1,
      explanation: "(+3) is a partially applied addition operator -- it fixes one argument of (+) to 3, producing a unary function. This is passed to map, which applies it to each element. Haskell's default currying makes this natural.",
    },
    {
      q: "What problem do transducers solve?",
      options: [
        "Type inference in generic functions",
        "Intermediate collection allocation in chained transformations",
        "Callback hell in asynchronous code",
        "Circular dependencies between modules",
      ],
      answerIndex: 1,
      explanation: "Chaining .map().filter().map() on arrays creates an intermediate array at each step. Transducers compose the transformations into a single reducing function, processing all elements in one pass with no intermediate allocations.",
    },
    {
      q: "What is the key difference between currying and partial application?",
      options: [
        "Currying is for OOP, partial application is for FP",
        "Currying transforms structure (N-ary to chain of unary), partial application fixes arguments",
        "Partial application is a special case that only works with two arguments",
        "They are different names for the same concept",
      ],
      answerIndex: 1,
      explanation: "Currying is a structural transformation: f(a,b,c) becomes f(a)(b)(c). Partial application is the act of fixing some arguments to create a specialized function. Currying enables convenient partial application but they are distinct concepts.",
    },
    {
      q: "What does the Haskell operator (>=>) do?",
      options: [
        "Regular function composition",
        "Kleisli (monadic) composition of functions returning wrapped values",
        "Parallel function application",
        "Lazy evaluation of composed functions",
      ],
      answerIndex: 1,
      explanation: "(>=>) is Kleisli composition: it composes functions of type a -> m b and b -> m c into a -> m c, threading the monadic context (Maybe, Either, IO, etc.) through the chain. It extends regular composition to effectful functions.",
    },
  ],

  flashcards: [
    { front: "What is compose(f, g)(x)?", back: "f(g(x)) -- compose applies functions right-to-left, matching mathematical notation (f . g)(x) = f(g(x))." },
    { front: "What is pipe(f, g)(x)?", back: "g(f(x)) -- pipe applies functions left-to-right, matching reading order and data flow direction." },
    { front: "What is currying?", back: "Transforming a function of N arguments into a chain of N unary functions: f(a, b, c) becomes f(a)(b)(c). In Haskell, all functions are curried by default." },
    { front: "What is partial application?", back: "Fixing one or more arguments of a function to produce a new function with fewer parameters. Example: const add5 = add(5) where add is curried." },
    { front: "What does 'point-free' mean?", back: "Defining functions without naming their arguments (the 'points'). Instead of x => f(g(x)), write compose(f, g). Also called tacit programming." },
    { front: "What is a transducer?", back: "A composable transformation that operates on reducing functions rather than data. It transforms one reducer into another, enabling single-pass processing without intermediate collections." },
    { front: "What is Kleisli composition (>=>)?", back: "Composition for functions that return monadic/wrapped values (a -> m b). It threads the monadic context so that f: A -> Maybe<B> and g: B -> Maybe<C> compose into A -> Maybe<C>." },
    { front: "What is eta-reduction?", back: "The rule that if f(x) = g(x) for all x, then f = g. It is the formal basis for point-free refactoring: const f = x => g(x) simplifies to const f = g." },
  ],

  revisionNotes: [
    "compose(f, g)(x) = f(g(x)) is right-to-left; pipe(f, g)(x) = g(f(x)) is left-to-right. They are duals -- reverse the argument order to convert between them.",
    "Currying transforms f(a, b, c) into f(a)(b)(c). Partial application fixes arguments: f(a) returns g(b, c). Currying enables partial application. In Haskell, all functions are curried automatically.",
    "Point-free style eliminates named arguments: const shout = compose(toUpper, trim) instead of const shout = s => toUpper(trim(s)). Use when it improves clarity; avoid when it obscures intent.",
    "Transducers compose transformations (map, filter) into a single reducing function. compose(xmap(f), xfilter(p)) processes data in one pass with no intermediate collections. Composition order matches logical data flow.",
    "Kleisli composition (>=>) extends compose to functions returning wrapped values (Maybe, Either, Promise). Promise.then is Kleisli composition for async effects.",
    "Function composition is associative: compose(f, compose(g, h)) = compose(compose(f, g), h). The identity function is its neutral element: compose(f, id) = f.",
    "TypeScript pipe/compose require function overloads for type safety. Libraries like fp-ts provide typed versions. The TC39 pipe operator proposal (|>) would add native syntax.",
    "Lenses are composable getter/setter pairs that use function composition to access nested data structures. In Haskell, lens composition uses the (.) operator because lenses are functions.",
  ],

  cheatSheet: [
    "compose(f, g)(x) = f(g(x)) -- right-to-left",
    "pipe(f, g)(x) = g(f(x)) -- left-to-right",
    "curry: f(a, b, c) -> f(a)(b)(c) -- chain of unary functions",
    "partial(f, a) -> g(b, c) = f(a, b, c) -- fix leading arguments",
    "Point-free: const fn = compose(f, g) instead of const fn = x => f(g(x))",
    "Eta-reduction: (x => f(x)) simplifies to f",
    "Transducer: (step => (acc, val) => step(acc, f(val))) -- transforms reducers",
    "Kleisli: (f >=> g)(x) = f(x) >>= g -- compose effectful functions",
    "Haskell (.) = compose, (&) or |> = pipe, all functions auto-curried",
    "JS/TS: Ramda R.compose/R.pipe/R.curry, fp-ts flow/pipe, lodash/fp",
  ],

  exercises: [
    "Implement a **slugify pipeline** using `pipe` in TypeScript: `trim` -> `toLowerCase` -> replace spaces with hyphens -> remove non-alphanumeric characters (except hyphens). Write each step as a *curried* function and compose them point-free. Test with input `'  Hello, World!  '` and verify the output is `'hello-world'`.",
    "Build a **transducer** in TypeScript that composes `xmap(x => x * 3)`, `xfilter(x => x > 10)`, and `xmap(x => x.toString())` into a single pass over an array of numbers. Run it on `[1, 2, 3, 4, 5]` using `Array.prototype.reduce`. Compare the result and performance characteristics against the equivalent chained `.map().filter().map()` approach.",
    "Write a `compose` function in C++ using **templates and lambdas** that composes two unary functions: `compose(f, g)(x) = f(g(x))`. Then extend it to a *variadic* version that composes N functions using fold expressions (C++17). Demonstrate it with a pipeline that converts a `std::string` to lowercase, trims whitespace, and reverses it.",
    "Implement **Kleisli composition** for `std::optional` in C++: write a function `kleisli` that takes two functions `f: A -> optional<B>` and `g: B -> optional<C>` and returns `A -> optional<C>`. Use it to compose `safeDivide(100, x)` and `safeSqrt(x)` where each returns `std::nullopt` on invalid input. Verify that the composed function short-circuits on `0`.",
    "Refactor an imperative data processing function into a **point-free pipeline** using Ramda or fp-ts. The function should: parse a JSON string, extract the `users` array, filter for `active: true`, sort by `name`, and return an array of email addresses. Identify where *currying* and *partial application* enable the point-free style.",
  ],
  resources: [
    { label: "Professor Frisby's Mostly Adequate Guide to FP (Ch. 5-6: Compose & Curry)", kind: "book", note: "Free online book covering composition and currying with practical JavaScript examples" },
    { label: "Haskell Wiki: Function Composition", kind: "docs", note: "Definitive reference for (.), ($), point-free style, and eta-reduction in Haskell" },
    { label: "Rich Hickey - Transducers (Strange Loop 2014)", kind: "video", note: "Original talk introducing transducers, their motivation, and implementation in Clojure" },
    { label: "Ramda Documentation", kind: "docs", note: "JavaScript library designed for function composition: R.compose, R.pipe, R.curry, R.partial" },
    { label: "fp-ts: Getting Started with Composition", kind: "article", note: "TypeScript-first functional programming with typed pipe, flow, and monadic composition" },
  ],

  glossary: [
    { term: "Compose", definition: "Right-to-left function composition: compose(f, g)(x) = f(g(x)). Mirrors mathematical notation." },
    { term: "Pipe", definition: "Left-to-right function composition: pipe(f, g)(x) = g(f(x)). Mirrors reading order and data flow." },
    { term: "Currying", definition: "Transforming a function that takes N arguments into N nested functions each taking one argument." },
    { term: "Partial application", definition: "Fixing some arguments of a function to produce a new function with fewer parameters." },
    { term: "Point-free / Tacit style", definition: "Defining functions without explicitly naming their arguments, focusing on composition over variable binding." },
    { term: "Transducer", definition: "A composable transformation that maps one reducing function to another, enabling single-pass data processing." },
    { term: "Kleisli composition", definition: "Monadic composition (>=>) for functions returning wrapped values like Maybe, Either, or Promise." },
    { term: "Eta-reduction", definition: "Simplifying (x => f(x)) to f. The formal rule: if f(x) = g(x) for all x, then f = g." },
  ],
};
