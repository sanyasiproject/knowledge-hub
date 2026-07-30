import type { TopicContent } from "../types";

export const functorsMonads: TopicContent = {
  quickSummary: [
    "A functor is any type that implements a mapping operation (fmap/map) preserving structure, obeying identity and composition laws.",
    "A monad extends a functor with flatMap/bind (>>=) and a unit/return constructor, enabling sequential composition of effectful computations while satisfying left identity, right identity, and associativity laws.",
    "Common monads include Maybe/Option (nullable values), Either/Result (error handling), IO (side effects), and Promise (async computation).",
    "Applicative functors sit between functors and monads, allowing application of wrapped functions to wrapped values without needing the result of one computation to determine the next.",
  ],

  detailed: [
    "Functors abstract over container-like types that can be mapped over. The functor laws guarantee that mapping the identity function returns the same structure (identity law) and that mapping a composed function is the same as mapping each function sequentially (composition law). In Haskell: fmap id == id, and fmap (f . g) == fmap f . fmap g. Arrays, Options, Trees, and Promises are all functors.",
    "Applicative functors introduce `apply` (or `<*>` in Haskell) which lets you lift multi-argument functions into a functor context. Where a plain functor can only map a single-argument function, applicatives handle functions already wrapped in the functor. This is useful for independent computations that can be combined, such as validating multiple form fields in parallel and collecting all errors.",
    "Monads add `bind` (>>= in Haskell, flatMap in Scala/TS, and_then in Rust) which takes a wrapped value and a function that returns a wrapped value, flattening the nested wrapper. The three monad laws ensure predictable composition: left identity (return a >>= f === f a), right identity (m >>= return === m), and associativity ((m >>= f) >>= g === m >>= (\\x -> f x >>= g)).",
    "Maybe/Option represents computations that might not return a value. Instead of null checks, you chain operations with map/flatMap; if any step yields Nothing/None the rest of the chain is skipped. Either/Result generalises this by carrying an error value in the Left/Err branch, enabling typed error handling without exceptions.",
    "The IO monad wraps side-effectful computations so that a pure functional language like Haskell can sequence I/O while keeping referential transparency. The IO type acts as a recipe: it describes what to do, and the runtime executes it. This separation lets you reason about, test, and compose I/O actions as pure values.",
    "JavaScript Promises resemble monads: .then acts like flatMap (auto-flattening nested Promises), and Promise.resolve acts like return/unit. However, Promises break the monad laws in subtle ways: they eagerly evaluate (no lazy IO), auto-flatten recursively (Promise<Promise<A>> is impossible), conflate map and flatMap in .then, and throw-based rejection breaks referential transparency.",
  ],

  deepDive: [
    "Monad transformers solve the problem of combining multiple monadic effects. For example, MaybeT layered over IO gives you computations that can both fail and perform I/O. In Haskell, transformer stacks like ReaderT Config (ExceptT AppError IO) a are idiomatic for application architecture, providing dependency injection (Reader), error handling (Except), and side effects (IO) in a single composable type. The lift function promotes a computation from an inner monad into the transformer stack.",
    "Do-notation in Haskell and for-comprehensions in Scala desugar into chains of >>= and >> calls, making monadic code look imperative. Each `<-` binding extracts a value from the monad, and the compiler rewrites it as a flatMap. This syntactic sugar is critical for readability: without it, deeply nested bind chains become unmanageable. TypeScript lacks native do-notation, but libraries like fp-ts provide pipe/chain combinators, and generator-based Do simulations approximate it.",
    "The relationship between Functor, Applicative, and Monad forms a hierarchy: every Monad is an Applicative, and every Applicative is a Functor. This means if you implement bind and return, you get map (fmap f m = m >>= return . f) and apply (mf <*> mx = mf >>= \\f -> mx >>= \\x -> return (f x)) for free. Choosing the weakest abstraction that solves your problem leads to more general, parallelisable code -- Applicative validation can collect all errors, while monadic validation short-circuits on the first.",
    "Free monads reify the monadic structure itself as a data type, separating the description of a program from its interpretation. You define an algebra of operations as a functor, then Free lifts it into a monad. Different interpreters can run the same program against a real database, an in-memory mock, or a log. This pattern underpins effect systems like Polysemy (Haskell) and ZIO (Scala), and is conceptually similar to the interpreter/command pattern in OOP.",
    "Algebraic effects and effect handlers (as seen in languages like Eff, Koka, and OCaml 5) offer an alternative to monad transformers. Instead of stacking transformers, you declare which effects a function may perform, and handlers at call sites define how to interpret them. This avoids the quadratic boilerplate of transformer lift calls and the ordering sensitivity of transformer stacks, while preserving type-safe effect tracking.",
  ],

  code: [
    {
      language: "typescript",
      caption: "Maybe/Option monad implementation with map, flatMap, and functor law demonstration",
      source: `\
// A minimal Maybe<A> monad in TypeScript
type Maybe<A> = { tag: "just"; value: A } | { tag: "nothing" };

const just = <A>(value: A): Maybe<A> => ({ tag: "just", value });
const nothing = <A>(): Maybe<A> => ({ tag: "nothing" });

// Functor: map
const map = <A, B>(ma: Maybe<A>, f: (a: A) => B): Maybe<B> =>
  ma.tag === "just" ? just(f(ma.value)) : nothing();

// Monad: flatMap (bind / >>=)
const flatMap = <A, B>(ma: Maybe<A>, f: (a: A) => Maybe<B>): Maybe<B> =>
  ma.tag === "just" ? f(ma.value) : nothing();

// Monad: unit / return
const unit = just; // wraps a pure value

// ── Functor laws ──
const id = <A>(x: A) => x;
const x = just(42);

// 1. Identity:  map(x, id) === x
console.log(map(x, id));        // { tag: "just", value: 42 }

// 2. Composition: map(x, a => g(f(a))) === map(map(x, f), g)
const f = (n: number) => n + 1;
const g = (n: number) => n * 2;
console.log(map(x, a => g(f(a))));     // { tag: "just", value: 86 }
console.log(map(map(x, f), g));        // { tag: "just", value: 86 }

// ── Monad laws ──
const h = (n: number): Maybe<number> =>
  n > 0 ? just(n * 10) : nothing();

// 1. Left identity:  flatMap(unit(a), h) === h(a)
console.log(flatMap(unit(5), h)); // { tag: "just", value: 50 }
console.log(h(5));                // { tag: "just", value: 50 }

// 2. Right identity: flatMap(m, unit) === m
console.log(flatMap(just(5), unit)); // { tag: "just", value: 5 }

// 3. Associativity:  flatMap(flatMap(m, f'), g') === flatMap(m, x => flatMap(f'(x), g'))
const f2 = (n: number): Maybe<number> => just(n + 1);
const g2 = (n: number): Maybe<number> => n > 0 ? just(n * 2) : nothing();
const m = just(3);

console.log(flatMap(flatMap(m, f2), g2));             // { tag: "just", value: 8 }
console.log(flatMap(m, x => flatMap(f2(x), g2)));     // { tag: "just", value: 8 }

// ── Practical chaining ──
type User = { name: string; addressId?: number };
type Address = { id: number; street: string };

const users: User[] = [{ name: "Alice", addressId: 1 }, { name: "Bob" }];
const addresses: Address[] = [{ id: 1, street: "123 Elm St" }];

const findUser = (name: string): Maybe<User> => {
  const u = users.find(u => u.name === name);
  return u ? just(u) : nothing();
};

const getAddress = (user: User): Maybe<Address> => {
  if (user.addressId == null) return nothing();
  const a = addresses.find(a => a.id === user.addressId);
  return a ? just(a) : nothing();
};

const getStreet = (name: string): Maybe<string> =>
  flatMap(flatMap(findUser(name), getAddress), a => just(a.street));

console.log(getStreet("Alice")); // { tag: "just", value: "123 Elm St" }
console.log(getStreet("Bob"));   // { tag: "nothing" }
console.log(getStreet("Eve"));   // { tag: "nothing" }`,
    },
    {
      language: "haskell",
      caption: "Either monad, do-notation, and monad transformer stack (MaybeT over IO)",
      source: `\
import Control.Monad.Trans.Maybe (MaybeT(..), runMaybeT)
import Control.Monad.IO.Class    (liftIO)
import Data.Char                 (digitToInt, isDigit)

-- ── Either as an error-handling monad ──
type AppError = String

parseAge :: String -> Either AppError Int
parseAge s
  | all isDigit s = let n = read s in
      if n >= 0 && n <= 150
        then Right n
        else Left "Age out of range"
  | otherwise = Left "Not a number"

parseName :: String -> Either AppError String
parseName s
  | null s    = Left "Name cannot be empty"
  | otherwise = Right s

-- do-notation desugars to >>= chains
validateUser :: String -> String -> Either AppError (String, Int)
validateUser name ageStr = do
  n   <- parseName name       -- parseName name >>= \\n ->
  age <- parseAge ageStr      -- parseAge ageStr >>= \\age ->
  pure (n, age)               -- pure (n, age)

-- ghci> validateUser "Alice" "30"   => Right ("Alice", 30)
-- ghci> validateUser "" "30"        => Left "Name cannot be empty"
-- ghci> validateUser "Alice" "xyz"  => Left "Not a number"

-- ── Monad transformer: MaybeT IO ──
-- Combines Maybe (failure) with IO (side effects)
askInput :: String -> MaybeT IO String
askInput prompt = do
  liftIO $ putStrLn prompt        -- lift IO action into the stack
  line <- liftIO getLine
  if null line
    then MaybeT (pure Nothing)    -- short-circuit on empty input
    else pure line

interactiveGreet :: MaybeT IO ()
interactiveGreet = do
  name <- askInput "Enter your name (empty to quit):"
  age  <- askInput "Enter your age (empty to quit):"
  liftIO $ putStrLn ("Hello " ++ name ++ ", age " ++ age)

-- runMaybeT interactiveGreet :: IO (Maybe ())
-- Returns Nothing if the user enters empty input at any step.

-- ── Demonstrating monad laws in Haskell ──
-- Left identity:   return a >>= f  ===  f a
-- Right identity:  m >>= return    ===  m
-- Associativity:   (m >>= f) >>= g ===  m >>= (\\x -> f x >>= g)

demo :: IO ()
demo = do
  let f x = Just (x + 1)
      g x = if x > 0 then Just (x * 2) else Nothing
      m   = Just 5

  -- Left identity
  print $ (return 5 >>= f)               -- Just 6
  print $ f 5                             -- Just 6

  -- Right identity
  print $ (m >>= return)                  -- Just 5
  print $ m                               -- Just 5

  -- Associativity
  print $ ((m >>= f) >>= g)              -- Just 12
  print $ (m >>= (\\x -> f x >>= g))      -- Just 12`,
    },
    {
      language: "rust",
      caption: "Option and Result monads in Rust with combinators and the ? operator",
      source: `\
use std::num::ParseIntError;

// ── Option<T> as Maybe monad ──
// map  = Functor's fmap
// and_then = Monad's bind / flatMap

fn find_user(name: &str) -> Option<u32> {
    match name {
        "Alice" => Some(1),
        "Bob"   => Some(2),
        _       => None,
    }
}

fn find_email(user_id: u32) -> Option<String> {
    match user_id {
        1 => Some("alice@example.com".into()),
        _ => None,
    }
}

fn get_email(name: &str) -> Option<String> {
    find_user(name).and_then(find_email)  // flatMap / >>=
}

// ── Result<T, E> as Either monad ──
#[derive(Debug)]
enum AppError {
    ParseErr(ParseIntError),
    OutOfRange(i32),
}

fn parse_age(s: &str) -> Result<i32, AppError> {
    let n: i32 = s.parse().map_err(AppError::ParseErr)?; // ? is sugar for early return on Err
    if (0..=150).contains(&n) {
        Ok(n)
    } else {
        Err(AppError::OutOfRange(n))
    }
}

fn validate_user(name: &str, age_str: &str) -> Result<(String, i32), AppError> {
    // The ? operator desugars to match + early return,
    // analogous to do-notation / flatMap
    let age = parse_age(age_str)?;
    Ok((name.to_string(), age))
}

// ── Functor laws with Option ──
fn functor_laws_demo() {
    let x: Option<i32> = Some(42);

    // Identity: x.map(|a| a) == x
    assert_eq!(x.map(|a| a), x);

    // Composition: x.map(|a| g(f(a))) == x.map(f).map(g)
    let f = |n: i32| n + 1;
    let g = |n: i32| n * 2;
    assert_eq!(x.map(|a| g(f(a))), x.map(f).map(g));
}

// ── Monad laws with Option ──
fn monad_laws_demo() {
    let unit = Some;  // return / pure
    let f = |n: i32| if n > 0 { Some(n * 10) } else { None };
    let g = |n: i32| Some(n + 1);
    let m = Some(5);

    // Left identity: unit(a).and_then(f) == f(a)
    assert_eq!(unit(5).and_then(f), f(5));

    // Right identity: m.and_then(unit) == m
    assert_eq!(m.and_then(|x| Some(x)), m);

    // Associativity
    assert_eq!(
        m.and_then(f).and_then(g),
        m.and_then(|x| f(x).and_then(g))
    );
}

fn main() {
    println!("{:?}", get_email("Alice")); // Some("alice@example.com")
    println!("{:?}", get_email("Bob"));   // None
    println!("{:?}", get_email("Eve"));   // None

    println!("{:?}", validate_user("Alice", "30"));  // Ok(("Alice", 30))
    println!("{:?}", validate_user("Alice", "abc")); // Err(ParseErr(...))

    functor_laws_demo();
    monad_laws_demo();
    println!("All law checks passed.");
}`,
    },
    {
      language: "typescript",
      caption: "Promise as a monad -- where it works and where it breaks the laws",
      source: `\
// Promise.resolve = return / unit
// .then           = flatMap (auto-flattens nested Promises)

// ── Where Promise DOES behave monadically ──

const f = (x: number) => Promise.resolve(x + 1);
const g = (x: number) => Promise.resolve(x * 2);

// Left identity:  Promise.resolve(a).then(f) ~ f(a)
Promise.resolve(5).then(f).then(console.log); // 6
f(5).then(console.log);                       // 6

// Right identity: m.then(x => Promise.resolve(x)) ~ m
Promise.resolve(5).then(x => Promise.resolve(x)).then(console.log); // 5

// Associativity:
//   m.then(f).then(g) ~ m.then(x => f(x).then(g))
Promise.resolve(3).then(f).then(g).then(console.log);              // 8
Promise.resolve(3).then(x => f(x).then(g)).then(console.log);      // 8

// ── Where Promise BREAKS the monad laws ──

// 1. Auto-flattening destroys the nested structure.
//    You cannot have Promise<Promise<number>> -- .then always unwraps.
//    This means Promise is not a true endofunctor on the JS type system.

// 2. Eager evaluation: Promises execute immediately on construction.
//    A true IO monad is lazy -- it describes a computation without running it.
const eager = new Promise<number>((resolve) => {
  console.log("I run immediately!"); // This prints even if .then is never called
  resolve(42);
});

// 3. .then conflates map and flatMap:
//    .then(x => x + 1)           -- acts as map (Functor)
//    .then(x => Promise.resolve(x + 1)) -- acts as flatMap (Monad)
//    A lawful monad keeps these as distinct operations.

// 4. Error channel (rejection) doesn't compose cleanly.
//    throw inside .then rejects, mixing exceptions with the monadic pipeline.
//    A lawful Either/Result monad makes the error path explicit and typed.

// ── Applicative-style with Promise.all ──
// Promise.all applies a "pure" combining function to independent async values,
// running them concurrently -- this is Applicative, not Monad.

const fetchName = (): Promise<string> => Promise.resolve("Alice");
const fetchAge = (): Promise<number> => Promise.resolve(30);

const buildUser = async () => {
  const [name, age] = await Promise.all([fetchName(), fetchAge()]);
  return { name, age };
};

buildUser().then(console.log); // { name: "Alice", age: 30 }`,
    },
  ],

  diagrams: [
    {
      title: "Functor / Applicative / Monad hierarchy",
      kind: "architecture",
      caption:
        "Shows the typeclass hierarchy: Functor (map) -> Applicative (apply + pure) -> Monad (bind + return). Each layer adds power but restricts generality. Arrows indicate 'is-a' relationships; every Monad is an Applicative, every Applicative is a Functor.",
    },
    {
      title: "Maybe monad chain -- short-circuit flow",
      kind: "flow",
      caption:
        "Illustrates how a chain of flatMap/bind operations on Maybe propagates Nothing: Just(x) -> f -> Just(y) -> g -> Nothing -> h (skipped) -> Nothing. Once a Nothing is produced, all subsequent steps are bypassed without executing.",
    },
  ],

  animations: [
    {
      title: "Monadic bind (>>=) step-by-step on Maybe",
      steps: [
        {
          label: "Start with a wrapped value",
          detail:
            "We have Just(5) -- a value 5 wrapped in the Maybe context.",
        },
        {
          label: "Apply first bind",
          detail:
            "flatMap(Just(5), x => x > 0 ? Just(x * 2) : Nothing()) extracts 5, applies the function, yields Just(10).",
        },
        {
          label: "Apply second bind",
          detail:
            "flatMap(Just(10), x => x > 20 ? Just(x) : Nothing()) extracts 10, applies the predicate, yields Nothing because 10 <= 20.",
        },
        {
          label: "Short-circuit on Nothing",
          detail:
            "flatMap(Nothing, ...) does not invoke the function at all. The chain stops and the final result is Nothing.",
        },
        {
          label: "Result",
          detail:
            "The entire chain Just(5) >>= f >>= g evaluates to Nothing. No null checks were needed; the monad handled the failure path automatically.",
        },
      ],
    },
    {
      title: "Either/Result railway-oriented programming",
      steps: [
        {
          label: "Two tracks",
          detail:
            "Imagine two parallel railway tracks: the top track carries Ok/Right values (the happy path), the bottom carries Err/Left values (the error path).",
        },
        {
          label: "First function succeeds",
          detail:
            "parseName(\"Alice\") returns Right(\"Alice\"). The value stays on the top track.",
        },
        {
          label: "Second function succeeds",
          detail:
            "parseAge(\"30\") returns Right(30). Still on the top track.",
        },
        {
          label: "A function fails",
          detail:
            "parseAge(\"xyz\") returns Left(\"Not a number\"). The value switches to the bottom (error) track.",
        },
        {
          label: "Remaining functions are bypassed",
          detail:
            "Once on the error track, subsequent bind operations pass the Left value through unchanged -- just like Nothing in Maybe, but carrying an error message.",
        },
        {
          label: "Final result",
          detail:
            "At the end of the chain you pattern-match on Right/Left (or use unwrap/?) to handle success and failure. All errors are explicit and typed.",
        },
      ],
    },
  ],

  comparison: {
    columns: [
      "Aspect",
      "Functor (map)",
      "Applicative (apply)",
      "Monad (bind)",
    ],
    rows: [
      [
        "Core operation",
        "fmap / map: (A -> B) -> F<A> -> F<B>",
        "apply / <*>: F<A -> B> -> F<A> -> F<B>",
        "bind / >>=: F<A> -> (A -> F<B>) -> F<B>",
      ],
      [
        "Can introduce new effects?",
        "No -- maps pure function over existing structure",
        "No -- combines independent effects",
        "Yes -- each step can produce new effects based on previous result",
      ],
      [
        "Dependency between steps",
        "None -- single transformation",
        "None -- values are independent",
        "Sequential -- output of step N determines step N+1",
      ],
      [
        "Parallelism potential",
        "N/A (single operation)",
        "High -- independent branches can run concurrently",
        "Low -- inherently sequential",
      ],
      [
        "Error accumulation",
        "N/A",
        "Can collect all errors (e.g., Validation)",
        "Short-circuits on first error",
      ],
      [
        "Example in Haskell",
        "fmap (+1) (Just 5)",
        "Just (+1) <*> Just 5",
        "Just 5 >>= \\x -> Just (x+1)",
      ],
      [
        "Example in TypeScript",
        "[1,2,3].map(x => x+1)",
        "Promise.all([p1, p2]).then(([a,b]) => a+b)",
        "promise.then(x => fetchNext(x))",
      ],
    ],
  },

  interviewQA: [
    {
      q: "What are the functor laws, and why do they matter?",
      a: "The two functor laws are: (1) Identity -- mapping the identity function over a functor returns the same functor: fmap id === id. (2) Composition -- mapping a composed function is the same as composing two mappings: fmap (g . f) === fmap g . fmap f. These laws guarantee that map is structure-preserving and predictable. If a type violates these laws, code that relies on equational reasoning (refactoring, optimisation, testing) will produce surprising results.",
      followUps: [
        "Can you give an example of a type whose map implementation violates the functor laws?",
        "How do the functor laws relate to parametricity and free theorems?",
      ],
    },
    {
      q: "Explain the three monad laws and give a practical consequence of each.",
      a: "Left identity: return a >>= f === f a. This means wrapping a value and immediately binding should be the same as just calling the function -- so you can refactor 'Promise.resolve(x).then(f)' to 'f(x)'. Right identity: m >>= return === m. Binding with the wrapper function is a no-op -- useful for knowing that '.then(x => Promise.resolve(x))' can be eliminated. Associativity: (m >>= f) >>= g === m >>= (x => f(x) >>= g). This lets you refactor nested chains freely without changing behavior, just like how (a + b) + c === a + (b + c) lets you regroup arithmetic.",
      followUps: [
        "Does JavaScript's Promise satisfy all three laws?",
        "What goes wrong in practice when a monad-like type breaks associativity?",
      ],
    },
    {
      q: "How does Promise differ from a lawful monad?",
      a: "Promise breaks monad laws in several ways: (1) Auto-flattening -- you cannot construct Promise<Promise<A>>, so the type does not form a proper endofunctor. (2) Eager evaluation -- Promises execute their constructor callback immediately, unlike a lazy IO monad. (3) .then conflates map and flatMap, making it impossible to distinguish pure transformation from effectful binding. (4) Rejection uses JavaScript's throw mechanism, breaking referential transparency. Despite these, Promise is 'monad-like' enough for practical async composition.",
      followUps: [
        "How would you design a lazy, lawful async monad in TypeScript?",
        "What is the Task type in fp-ts and how does it differ from Promise?",
      ],
    },
    {
      q: "What problem do monad transformers solve, and what are their drawbacks?",
      a: "Monad transformers let you combine multiple monadic effects into a single stack. For example, MaybeT IO gives you computations that can both fail (Maybe) and perform side effects (IO). Without transformers, you would need to manually nest pattern matches. The main drawbacks are: (1) Performance overhead from wrapping/unwrapping layers. (2) The 'n-squared' problem -- adding a new effect to k existing effects requires k lift definitions. (3) Ordering sensitivity -- StateT s (ExceptT e IO) behaves differently from ExceptT e (StateT s IO) regarding whether state is rolled back on error. Algebraic effects are an emerging alternative that avoids these issues.",
      followUps: [
        "How do algebraic effects compare to monad transformers?",
        "What is the ReaderT design pattern?",
      ],
    },
    {
      q: "What is the difference between Applicative and Monad, and when would you prefer Applicative?",
      a: "An Applicative lets you combine independent effectful computations, while a Monad lets each step depend on the result of the previous one. Prefer Applicative when your computations are independent -- for example, validating multiple form fields. With Applicative (Validation), you can collect ALL errors rather than short-circuiting on the first one. Applicative also enables better parallelism since the runtime knows the computations are independent. Haskell's ApplicativeDo extension can even rewrite do-notation to use Applicative when possible.",
    },
  ],

  mcqs: [
    {
      q: "Which of the following is the correct statement of the functor identity law?",
      options: [
        "fmap f . fmap g === fmap (f . g)",
        "fmap id === id",
        "fmap return === id",
        "fmap (f . id) === fmap f . fmap id",
      ],
      answerIndex: 1,
      explanation:
        "The identity law states that mapping the identity function over a functor must return the same functor unchanged. Option A is the composition law (with arguments reversed). Option D, while true, is a consequence of both laws combined, not the identity law itself.",
    },
    {
      q: "What does the monad left identity law state?",
      options: [
        "m >>= return === m",
        "return a >>= f === f a",
        "(m >>= f) >>= g === m >>= (\\x -> f x >>= g)",
        "fmap f (return a) === return (f a)",
      ],
      answerIndex: 1,
      explanation:
        "Left identity says that wrapping a value with return and then binding with f is the same as directly applying f to the value. Option A is right identity. Option C is associativity. Option D is a naturality condition, not a monad law.",
    },
    {
      q: "Why can't JavaScript's Promise form a true monad?",
      options: [
        "Promise lacks a .then method",
        "Promise.resolve is not referentially transparent",
        "Promise auto-flattens nested Promises, making Promise<Promise<A>> impossible",
        "Promise does not support error handling",
      ],
      answerIndex: 2,
      explanation:
        "A monad requires the type constructor to be an endofunctor -- you need to be able to have M<M<A>> before flattening. Promise automatically and recursively unwraps thenables, so Promise<Promise<A>> collapses to Promise<A>. This breaks the categorical requirements for a monad.",
    },
    {
      q: "In railway-oriented programming with Either/Result, what happens when a function in the middle of a bind chain returns Left/Err?",
      options: [
        "An exception is thrown",
        "The error is logged and the chain continues with a default value",
        "All subsequent bind operations are skipped, propagating the Left/Err value",
        "The chain restarts from the beginning",
      ],
      answerIndex: 2,
      explanation:
        "Either's bind (>>=) short-circuits on Left: once any step returns Left(error), subsequent functions are never called and the error propagates to the end of the chain. This is analogous to how Nothing propagates in Maybe.",
    },
    {
      q: "Which abstraction allows independent effectful computations to be combined, enabling parallel execution and error accumulation?",
      options: [
        "Functor",
        "Monad",
        "Applicative Functor",
        "Comonad",
      ],
      answerIndex: 2,
      explanation:
        "Applicative functors combine independent computations -- since no step depends on the result of another, they can run in parallel and accumulate errors (as in the Validation type). Monads are inherently sequential because each bind can depend on the previous result.",
    },
  ],

  flashcards: [
    {
      front: "What is a Functor?",
      back: "A type F that supports a map operation: (A -> B) -> F<A> -> F<B>, obeying identity (fmap id = id) and composition (fmap (f . g) = fmap f . fmap g) laws.",
    },
    {
      front: "What does flatMap / >>= (bind) do?",
      back: "Takes a monadic value M<A> and a function A -> M<B>, applies the function to the unwrapped value, and returns M<B> -- flattening the nested M<M<B>> that map alone would produce.",
    },
    {
      front: "State the three monad laws.",
      back: "Left identity: return a >>= f === f a. Right identity: m >>= return === m. Associativity: (m >>= f) >>= g === m >>= (\\x -> f x >>= g).",
    },
    {
      front: "Maybe/Option monad -- what does it model?",
      back: "Computations that may not return a value. Just/Some wraps a value; Nothing/None represents absence. Chaining with flatMap short-circuits on Nothing without explicit null checks.",
    },
    {
      front: "Either/Result monad -- what does it model?",
      back: "Computations that may fail with a typed error. Right/Ok carries the success value; Left/Err carries the error. flatMap short-circuits on Left/Err, propagating the error through the chain.",
    },
    {
      front: "How does Applicative differ from Monad?",
      back: "Applicative combines independent effectful values (apply: F<A->B> -> F<A> -> F<B>), while Monad allows sequential dependency (bind: F<A> -> (A -> F<B>) -> F<B>). Applicative enables parallelism and error accumulation.",
    },
    {
      front: "What is do-notation / for-comprehension?",
      back: "Syntactic sugar in Haskell (do) and Scala (for) that desugars sequential bindings into >>= / flatMap chains. Each '<-' extracts a value from the monad and passes it to the next line.",
    },
    {
      front: "Why is Promise not a lawful monad?",
      back: "Promise auto-flattens (no Promise<Promise<A>>), eagerly evaluates (not lazy), conflates map and flatMap in .then, and uses throw-based rejection that breaks referential transparency.",
    },
  ],

  revisionNotes: [
    "Functor = mappable container. Two laws: identity (fmap id = id) and composition (fmap (f.g) = fmap f . fmap g).",
    "Applicative = functor with apply (<*>). Lifts multi-arg functions into functor context. Independent computations, so parallelisable and can accumulate errors (Validation).",
    "Monad = applicative with bind (>>=). Enables sequential composition where each step depends on the prior result. Three laws: left identity, right identity, associativity.",
    "Maybe/Option: models nullable values. Just/Some or Nothing/None. flatMap short-circuits on Nothing.",
    "Either/Result: models fallible computations with typed errors. Right/Ok or Left/Err. flatMap short-circuits on Left/Err (railway-oriented programming).",
    "IO monad: wraps side effects in a pure description. Lazy -- builds a recipe that the runtime executes. Enables referential transparency for I/O in Haskell.",
    "Promise is monad-like but breaks laws: auto-flattening, eager evaluation, conflated map/flatMap, exception-based rejection.",
    "Monad transformers (MaybeT, ExceptT, ReaderT, StateT) stack multiple effects. Use lift to promote inner monad operations. Order of stacking matters for semantics.",
  ],

  cheatSheet: [
    "Functor: fmap / map -- transform the value inside without changing the structure.",
    "Applicative: pure + <*> / apply -- wrap a value and apply wrapped functions to wrapped args.",
    "Monad: return + >>= / flatMap -- wrap and chain computations that produce wrapped results.",
    "Maybe/Option: Just(x)/Some(x) or Nothing/None. Use map for pure transforms, flatMap for functions returning Maybe.",
    "Either/Result: Right(x)/Ok(x) or Left(e)/Err(e). Pattern match at the end to handle success/error.",
    "Haskell do-notation: do { x <- ma; y <- mb; return (x, y) } desugars to ma >>= \\x -> mb >>= \\y -> return (x, y).",
    "Rust ? operator: sugar for match expr { Ok(v) => v, Err(e) => return Err(e.into()) }.",
    "Promise.all = Applicative (independent, concurrent). .then chaining = Monad (sequential, dependent).",
  ],

  resources: [
    {
      label: "Learn You a Haskell -- Functors, Applicatives, and Monads",
      kind: "book",
      note: "Gentle, illustrated introduction to the typeclass hierarchy with Haskell examples.",
    },
    {
      label: "Category Theory for Programmers by Bartosz Milewski",
      kind: "book",
      note: "Deep dive into the category-theoretic foundations of functors, natural transformations, and monads.",
    },
    {
      label: "Railway Oriented Programming (Scott Wlaschin, F# for Fun and Profit)",
      kind: "article",
      note: "Excellent visual explanation of Either/Result-based error handling as two-track computation.",
    },
    {
      label: "fp-ts documentation and Getting Started guide",
      kind: "docs",
      note: "TypeScript library implementing Option, Either, Task, IO, and the full functor-applicative-monad hierarchy.",
    },
    {
      label: "Rust std::option and std::result module documentation",
      kind: "docs",
      note: "Official Rust docs showing Option and Result combinators (map, and_then, unwrap_or) as practical monadic patterns.",
    },
  ],

  glossary: [
    {
      term: "Functor",
      definition:
        "A type constructor with a map operation that preserves structure, satisfying identity and composition laws. Informally, a 'mappable' container.",
    },
    {
      term: "Applicative Functor",
      definition:
        "A functor with pure (wrapping a value) and apply (applying a wrapped function to a wrapped value). Sits between Functor and Monad in the typeclass hierarchy.",
    },
    {
      term: "Monad",
      definition:
        "A type with return/unit (wrapping) and bind/flatMap (chaining), satisfying left identity, right identity, and associativity. Enables sequential composition of effectful computations.",
    },
    {
      term: "bind / >>= / flatMap",
      definition:
        "The core monadic operation: takes M<A> and a function A -> M<B>, applies the function to the unwrapped value, and returns M<B>, flattening the result.",
    },
    {
      term: "Maybe / Option",
      definition:
        "A monad representing a value that may or may not exist. Just/Some wraps a present value; Nothing/None represents absence.",
    },
    {
      term: "Either / Result",
      definition:
        "A monad representing success (Right/Ok) or failure with a typed error (Left/Err). Used for explicit error handling without exceptions.",
    },
    {
      term: "Monad Transformer",
      definition:
        "A type constructor that takes a monad as a parameter and adds an additional effect. Examples: MaybeT (adds failure), ReaderT (adds environment), StateT (adds mutable state). Combined via lift.",
    },
    {
      term: "Do-notation / For-comprehension",
      definition:
        "Syntactic sugar (Haskell's do, Scala's for) that rewrites sequential monadic bindings into >>= / flatMap chains, making monadic code look imperative.",
    },
  ],
};
