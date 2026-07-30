import type { TopicContent } from "../types";

export const propertyBasedTesting: TopicContent = {
  quickSummary: [
    "Property-based testing (PBT) generates hundreds of random inputs to verify that universal properties (invariants) hold for all values, rather than checking specific hand-picked examples.",
    "When a test fails, the framework automatically shrinks the failing input to the smallest, simplest counterexample that still triggers the failure, making debugging dramatically easier.",
    "Common property patterns include roundtrip (encode then decode), idempotency (applying twice equals applying once), commutativity (order independence), invariant preservation, and oracle comparison against a reference implementation.",
    "Major PBT frameworks include QuickCheck (Haskell, the original), fast-check (TypeScript/JavaScript), Hypothesis (Python), ScalaCheck (Scala), and PropEr (Erlang) -- all share the core concepts of generators, shrinking, and property declarations.",
  ],
  detailed: [
    "Property-based testing inverts the traditional testing approach. Instead of writing specific input-output pairs, you declare properties that must hold for all valid inputs, and the framework generates random test cases to try to falsify them. A property is a universally quantified boolean predicate: 'for all lists xs, sorting xs twice yields the same result as sorting once.' The framework runs the property against hundreds or thousands of randomly generated inputs, searching for a counterexample. If none is found after sufficient attempts, the test passes -- not proving correctness, but building substantial confidence.",
    "Generators are the engine of PBT. A generator is a composable description of how to produce random values of a given type. Primitive generators produce integers, strings, booleans, and floats within configurable ranges. Composite generators build complex structures: arrays of integers, trees of strings, valid JSON documents, or domain objects like user profiles. The key insight is that generators compose: if you have generators for names and ages, you can trivially build a generator for Person records. Frameworks provide combinators like map, flatMap/chain, filter, and oneOf to construct arbitrarily complex generators from simple ones.",
    "Shrinking is what makes PBT practical rather than merely interesting. When a property fails on a randomly generated input -- say a list of 47 elements -- the raw counterexample is usually too large and noisy to debug. The shrinker systematically reduces the failing input toward simpler forms while preserving the failure. For a list, it tries removing elements, shortening subsequences, and shrinking individual elements toward zero. For a tree, it tries replacing subtrees with leaves. The result is typically a minimal counterexample: the smallest input that still violates the property. Integrated shrinking (used by Hypothesis and fast-check) ties shrinking to the generator, guaranteeing that shrunk values always satisfy the generator's preconditions.",
    "The art of PBT lies in identifying good properties. Roundtrip properties verify encode/decode pairs: serializing a value to JSON and parsing it back should yield the original value. Idempotency properties check that applying an operation twice gives the same result as applying it once: formatting code, normalizing URLs, or deduplicating a list. Commutativity properties verify order independence: merging two CRDTs in either order should produce the same result. Invariant properties check that a postcondition holds regardless of input: a sorted list has each element less than or equal to the next. Oracle properties compare your implementation against a known-correct but slower reference: your optimized cache should return the same results as a simple hash map.",
    "Stateful property-based testing extends PBT to systems with mutable state. Instead of testing pure functions, you model a sequence of commands (insert, delete, lookup) against both your real system and a simplified reference model. The framework generates random command sequences, executes them against both implementations, and checks that all observable outputs match. This technique has found bugs in production databases, file systems, and distributed systems that years of example-based testing missed. Erlang's PropEr and Hypothesis's stateful testing module are particularly strong here.",
    "PBT shines when testing pure functions with clear algebraic properties, serialization round-trips, data structure invariants, parsers (parse then pretty-print), state machines, and any code where the space of valid inputs is large but the expected behavior can be stated concisely. It struggles when properties are hard to articulate (UI rendering), when the system under test is slow (each run needs hundreds of executions), or when the input space requires very specific structure that is hard to generate (valid compiler ASTs with correct type annotations). The best testing strategy combines both: example-based tests for specific edge cases and regression tests, and property-based tests for broad invariant coverage.",
    "Configuration matters. Most frameworks let you control the number of test cases (typically 100-1000), the random seed (for reproducibility), and the maximum size parameter that governs how large generated values can grow. Running more cases increases confidence but slows the suite. A common pattern is to run a small number (100) in CI for speed and a large number (10,000) in nightly builds for thoroughness. Always log the failing seed so you can reproduce failures deterministically.",
  ],
  deepDive: [
    "Integrated shrinking vs type-based shrinking represents a fundamental design split in PBT frameworks. QuickCheck uses type-based shrinking: each type defines its own Arbitrary instance with a shrink function. This is simple but has a critical flaw -- if your generator uses a filter (e.g., generate even numbers by filtering), the shrinker does not know about the filter and may produce odd numbers that violate the precondition, causing the shrink to stall. Hypothesis pioneered integrated shrinking, where the generator and shrinker are unified: the framework records the random choices made during generation and shrinks at the choice level, guaranteeing that shrunk values always pass through the same generator logic. fast-check adopted this approach. The practical effect is that integrated shrinking reliably finds minimal counterexamples even with complex, filtered, or dependent generators.",
    "Coverage-guided property testing combines PBT with coverage instrumentation. Instead of purely random generation, the framework tracks which code paths each input exercises and biases future generation toward inputs that explore new paths. This bridges the gap between fuzzing and PBT: you get the structured generation and shrinking of PBT with the path-exploration power of coverage-guided fuzzing. Hypothesis includes a coverage-guided mode, and research tools like CrowBar (for OCaml) and FuzzChick (for Coq) explore this space. This is particularly powerful for testing parsers, interpreters, and protocol implementations where random inputs rarely exercise deep code paths.",
    "The model-based (stateful) testing approach deserves deeper examination. You define a set of commands (e.g., Push, Pop, Size for a stack), each with a precondition (Pop requires non-empty), a state transition on the model (a simple list), and a postcondition (Pop returns the model's last element). The framework generates sequences of valid commands, executes them against the real implementation, and checks postconditions at each step. When a failure is found, the entire command sequence is shrunk -- not just individual commands, but the sequence itself is reduced to the shortest sequence that triggers the bug. John Hughes's company QuviQ used this approach to find critical bugs in automotive AUTOSAR implementations, distributed databases like Riak, and telecom switches.",
    "PBT intersects with formal methods in interesting ways. A property is essentially a lightweight specification. Some teams use PBT as a stepping stone: write properties first to build confidence, then selectively prove the most critical ones using theorem provers or dependent types. The Hedgehog library (Haskell) and its ports blur this line further by supporting golden testing and diff-based output alongside property testing. In practice, PBT catches a different class of bugs than example-based testing -- typically boundary conditions, off-by-one errors, and unexpected interactions between features that humans would not think to test manually.",
  ],
  code: [
    {
      language: "haskell",
      caption:
        "QuickCheck: testing a binary search tree maintains the BST invariant after insertion",
      source: `module BSTSpec where

import Test.QuickCheck
import Data.List (nub, sort)

-- A simple BST type
data BST a = Leaf | Node (BST a) a (BST a) deriving (Show)

insert :: Ord a => a -> BST a -> BST a
insert x Leaf = Node Leaf x Leaf
insert x (Node l v r)
  | x < v    = Node (insert x l) v r
  | x > v    = Node l v (insert x r)
  | otherwise = Node l v r

toList :: BST a -> [a]
toList Leaf = []
toList (Node l v r) = toList l ++ [v] ++ toList r

isBST :: Ord a => BST a -> Bool
isBST Leaf = True
isBST (Node l v r) =
  all (< v) (toList l) && all (> v) (toList r)
  && isBST l && isBST r

-- Build a BST from a list by folding inserts
fromList :: Ord a => [a] -> BST a
fromList = foldr insert Leaf

-- Property: inserting into a BST preserves the BST invariant
prop_insertMaintainsBST :: [Int] -> Int -> Bool
prop_insertMaintainsBST xs x =
  let tree = fromList xs
  in isBST (insert x tree)

-- Property: toList of a BST is sorted with no duplicates
prop_toListSorted :: [Int] -> Bool
prop_toListSorted xs =
  let result = toList (fromList xs)
  in result == sort (nub xs)

-- Property: inserted element is found in the tree
prop_insertMember :: [Int] -> Int -> Bool
prop_insertMember xs x =
  let tree = insert x (fromList xs)
  in x \`elem\` toList tree

-- Run all properties
main :: IO ()
main = do
  quickCheck prop_insertMaintainsBST
  quickCheck prop_toListSorted
  quickCheck prop_insertMember`,
    },
    {
      language: "typescript",
      caption:
        "fast-check: testing a URL parser/serializer roundtrip and a sorted merge invariant",
      source: `import fc from "fast-check";

// --- Example 1: Roundtrip property for a URL parser ---

interface ParsedUrl {
  protocol: string;
  host: string;
  port?: number;
  path: string;
}

function parseUrl(raw: string): ParsedUrl {
  const u = new URL(raw);
  return {
    protocol: u.protocol.replace(":", ""),
    host: u.hostname,
    port: u.port ? parseInt(u.port, 10) : undefined,
    path: u.pathname,
  };
}

function serializeUrl(p: ParsedUrl): string {
  const port = p.port ? \`:\${p.port}\` : "";
  return \`\${p.protocol}://\${p.host}\${port}\${p.path}\`;
}

// Custom generator for valid URLs
const urlArb = fc
  .record({
    protocol: fc.constantFrom("http", "https"),
    host: fc.stringOf(fc.constantFrom(..."abcdefghijklmnopqrstuvwxyz0123456789".split("")), { minLength: 1, maxLength: 10 })
      .map((s) => s + ".example.com"),
    port: fc.option(fc.integer({ min: 1, max: 65535 }), { nil: undefined }),
    path: fc.array(fc.stringOf(fc.constantFrom(..."abcdefghijklmnopqrstuvwxyz".split("")), { minLength: 1, maxLength: 8 }), { maxLength: 4 })
      .map((parts) => "/" + parts.join("/")),
  })
  .map((r) => ({ ...r, raw: serializeUrl(r) }));

test("parseUrl -> serializeUrl roundtrip", () => {
  fc.assert(
    fc.property(urlArb, ({ raw, ...expected }) => {
      const parsed = parseUrl(raw);
      const reserialized = serializeUrl(parsed);
      const reparsed = parseUrl(reserialized);
      expect(reparsed).toEqual(parsed);
    }),
    { numRuns: 500 }
  );
});

// --- Example 2: Sorted merge invariant ---

function sortedMerge(a: number[], b: number[]): number[] {
  const result: number[] = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) result.push(a[i++]);
    else result.push(b[j++]);
  }
  while (i < a.length) result.push(a[i++]);
  while (j < b.length) result.push(b[j++]);
  return result;
}

const sortedArrayArb = fc
  .array(fc.integer({ min: -1000, max: 1000 }))
  .map((xs) => xs.sort((a, b) => a - b));

test("sortedMerge preserves sorted order", () => {
  fc.assert(
    fc.property(sortedArrayArb, sortedArrayArb, (a, b) => {
      const merged = sortedMerge(a, b);
      for (let i = 1; i < merged.length; i++) {
        expect(merged[i]).toBeGreaterThanOrEqual(merged[i - 1]);
      }
    })
  );
});

test("sortedMerge preserves all elements", () => {
  fc.assert(
    fc.property(sortedArrayArb, sortedArrayArb, (a, b) => {
      const merged = sortedMerge(a, b);
      expect(merged.length).toBe(a.length + b.length);
      expect(merged.sort()).toEqual([...a, ...b].sort());
    })
  );
});`,
    },
    {
      language: "python",
      caption:
        "Hypothesis: stateful testing of a cache with an oracle (dict) model",
      source: `from hypothesis import given, settings, note
from hypothesis import strategies as st
from hypothesis.stateful import (
    RuleBasedStateMachine, rule, precondition,
    initialize, invariant
)
from collections import OrderedDict


class LRUCache:
    """Simple LRU cache implementation to test."""
    def __init__(self, capacity: int):
        self.capacity = capacity
        self._store: OrderedDict = OrderedDict()

    def get(self, key: str) -> str | None:
        if key in self._store:
            self._store.move_to_end(key)
            return self._store[key]
        return None

    def put(self, key: str, value: str) -> None:
        if key in self._store:
            self._store.move_to_end(key)
        self._store[key] = value
        if len(self._store) > self.capacity:
            self._store.popitem(last=False)

    def size(self) -> int:
        return len(self._store)


class LRUCacheStateMachine(RuleBasedStateMachine):
    """
    Stateful test: generate random sequences of get/put
    operations and verify against a reference model (plain dict
    with manual LRU eviction).
    """

    @initialize(capacity=st.integers(min_value=1, max_value=5))
    def init_cache(self, capacity):
        self.capacity = capacity
        self.cache = LRUCache(capacity)
        # Model: ordered dict tracking access order
        self.model: OrderedDict = OrderedDict()

    @rule(key=st.text(min_size=1, max_size=3,
                      alphabet="abcde"),
          value=st.text(min_size=1, max_size=5,
                        alphabet="xyz12"))
    def put(self, key, value):
        # Apply to real implementation
        self.cache.put(key, value)
        # Apply to model
        if key in self.model:
            self.model.move_to_end(key)
        self.model[key] = value
        if len(self.model) > self.capacity:
            self.model.popitem(last=False)

    @rule(key=st.text(min_size=1, max_size=3,
                      alphabet="abcde"))
    def get(self, key):
        real_result = self.cache.get(key)
        model_result = self.model.get(key)
        if key in self.model:
            self.model.move_to_end(key)
        # Oracle check: real matches model
        assert real_result == model_result, (
            f"get({key!r}): cache={real_result!r}, "
            f"model={model_result!r}"
        )

    @invariant()
    def size_bounded(self):
        assert self.cache.size() <= self.capacity, (
            f"Cache size {self.cache.size()} exceeds "
            f"capacity {self.capacity}"
        )

    @invariant()
    def model_matches(self):
        assert self.cache.size() == len(self.model), (
            f"Size mismatch: cache={self.cache.size()}, "
            f"model={len(self.model)}"
        )


# Run the stateful test
TestLRUCache = LRUCacheStateMachine.TestCase
TestLRUCache.settings = settings(
    max_examples=200, stateful_step_count=30
)


# --- Non-stateful property: roundtrip for a custom codec ---
def run_length_encode(data: list[int]) -> list[tuple[int, int]]:
    """Encode consecutive runs: [1,1,2,3,3,3] -> [(1,2),(2,1),(3,3)]"""
    if not data:
        return []
    result = []
    current, count = data[0], 1
    for val in data[1:]:
        if val == current:
            count += 1
        else:
            result.append((current, count))
            current, count = val, 1
    result.append((current, count))
    return result


def run_length_decode(encoded: list[tuple[int, int]]) -> list[int]:
    return [val for val, count in encoded for _ in range(count)]


@given(st.lists(st.integers(min_value=0, max_value=5),
                min_size=0, max_size=50))
def test_rle_roundtrip(data):
    """Encode then decode should return the original list."""
    encoded = run_length_encode(data)
    decoded = run_length_decode(encoded)
    assert decoded == data


@given(st.lists(st.integers(min_value=0, max_value=5),
                min_size=1, max_size=50))
def test_rle_idempotent_length(data):
    """Total of all run lengths equals original list length."""
    encoded = run_length_encode(data)
    total = sum(count for _, count in encoded)
    assert total == len(data)`,
    },
  ],
  diagrams: [
    {
      title: "Property-Based Testing Lifecycle",
      kind: "flow",
      caption:
        "The PBT loop: define property, generate inputs, evaluate, shrink on failure, report minimal counterexample",
    },
    {
      title: "Shrinking Search Tree",
      kind: "state",
      caption:
        "How the shrinker explores progressively simpler inputs, pruning branches that no longer fail, converging on the minimal counterexample",
    },
  ],
  animations: [
    {
      title: "Shrinking a Failing Input to a Minimal Counterexample",
      steps: [
        {
          label: "Initial failure",
          detail:
            "The property fails on a randomly generated list: [42, -7, 15, 0, 99, -3, 28, 11, -1, 66]. This is the raw counterexample -- too noisy to immediately understand the bug.",
        },
        {
          label: "Remove elements",
          detail:
            "The shrinker tries removing chunks of the list. Removing the first half still fails: [99, -3, 28, 11, -1, 66]. Removing the second half does not fail, so the first reduction stands.",
        },
        {
          label: "Narrow further",
          detail:
            "The shrinker tries smaller sublists. [99, -3] fails. [-3] alone does not fail. [99, -3, 28] fails. Binary search continues.",
        },
        {
          label: "Shrink individual values",
          detail:
            "With the list narrowed to [99, -3], the shrinker tries simplifying each element toward zero. [1, -3] fails. [1, -1] fails. [0, -1] fails. [1, 0] does not fail.",
        },
        {
          label: "Minimal counterexample found",
          detail:
            "The shrinker converges on [0, -1] -- the smallest list with the simplest values that still triggers the failure. The bug is now obvious: the function does not handle negative numbers correctly when preceded by zero.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Feature",
      "QuickCheck (Haskell)",
      "fast-check (TypeScript)",
      "Hypothesis (Python)",
      "ScalaCheck (Scala)",
      "PropEr (Erlang)",
    ],
    rows: [
      [
        "Shrinking approach",
        "Type-based (Arbitrary typeclass)",
        "Integrated (choice-sequence)",
        "Integrated (choice-sequence)",
        "Type-based (Shrink typeclass)",
        "Type-based (custom shrinkers)",
      ],
      [
        "Stateful testing",
        "Via quickcheck-state-machine",
        "fc.commands / fc.modelRun",
        "Built-in RuleBasedStateMachine",
        "Via commands API",
        "Built-in statem module",
      ],
      [
        "Generator composability",
        "Excellent (Monad instance)",
        "Excellent (chain/map/filter)",
        "Excellent (flatmap/composite)",
        "Good (Gen monad)",
        "Good (let/sized macros)",
      ],
      [
        "Reproducibility",
        "Seed-based replay",
        "Seed-based replay",
        "Database of failing examples",
        "Seed-based replay",
        "Seed-based replay",
      ],
      [
        "Coverage guidance",
        "No",
        "No",
        "Yes (experimental)",
        "No",
        "No (but see PropEr testing)",
      ],
      [
        "CI integration",
        "Cabal test / Stack test",
        "Jest / Vitest / Mocha",
        "pytest plugin (native)",
        "sbt test",
        "rebar3 proper",
      ],
      [
        "Example database",
        "No (manual seed storage)",
        "No",
        "Yes (.hypothesis directory)",
        "No",
        "No",
      ],
      [
        "Community maturity",
        "Pioneer, large ecosystem",
        "Growing, well-maintained",
        "Very mature, large ecosystem",
        "Mature, strong Scala adoption",
        "Mature, strong in telecom",
      ],
    ],
  },
  interviewQA: [
    {
      q: "What is property-based testing and how does it differ from example-based testing?",
      a: "Property-based testing declares universal properties that must hold for all valid inputs, then generates hundreds of random inputs to try to falsify them. Example-based testing checks specific hand-picked input-output pairs. PBT explores a much larger input space and often finds edge cases humans would not think to write, but requires the tester to identify meaningful properties rather than just expected outputs.",
      followUps: [
        "Can you use both approaches together?",
        "What kinds of bugs does PBT catch that example-based testing typically misses?",
      ],
    },
    {
      q: "Explain shrinking and why it matters.",
      a: "When a property fails on a randomly generated input, the raw counterexample is usually large and hard to interpret. Shrinking systematically reduces the failing input toward simpler forms -- shorter lists, smaller numbers, simpler strings -- while preserving the failure. The result is the minimal counterexample: the simplest input that still violates the property. Without shrinking, debugging random test failures would be impractical. Integrated shrinking (used by Hypothesis and fast-check) ties the shrinker to the generator so that shrunk values always satisfy generator constraints.",
      followUps: [
        "What is the difference between integrated and type-based shrinking?",
      ],
    },
    {
      q: "Name five common property patterns and give an example of each.",
      a: "Roundtrip: serialize then deserialize returns the original (JSON.parse(JSON.stringify(x)) equals x for serializable x). Idempotency: sorting an already-sorted list returns the same list. Commutativity: set union is order-independent (A union B equals B union A). Invariant: a balanced BST maintains its balance factor after any insertion. Oracle: your optimized function returns the same result as a naive reference implementation for all inputs.",
    },
    {
      q: "How does stateful property-based testing work?",
      a: "You define a set of commands with preconditions (when can the command run), a state transition on a simplified model, and postconditions (what should be true after). The framework generates random sequences of valid commands, executes them against both the real system and the model, and checks that all postconditions hold at each step. When a failure is found, the entire command sequence is shrunk to the shortest sequence that reproduces the bug. This is powerful for testing databases, caches, queues, and any stateful API.",
      followUps: [
        "What makes a good model for stateful testing?",
        "How is the command sequence shrunk?",
      ],
    },
    {
      q: "When should you prefer property-based testing over example-based testing?",
      a: "PBT shines for pure functions with algebraic properties (monoid laws, codec roundtrips), data structures with invariants (BSTs, heaps, balanced trees), parsers and serializers, state machines, and any code with a large input space where edge cases hide. It is less suitable when properties are hard to articulate (UI rendering correctness), when each test run is slow (PBT needs hundreds of runs), or when inputs require extremely specific structure that is hard to generate.",
    },
    {
      q: "How do you write a custom generator and why would you need one?",
      a: "Custom generators produce domain-specific random values that satisfy particular constraints. You build them by composing primitive generators (integers, strings) using combinators like map (transform output), flatMap/chain (dependent generation where one value determines the next), filter (reject invalid values, use sparingly as it can be slow), and oneOf (choose among alternatives). You need them when the default generators produce too many invalid inputs (e.g., generating valid email addresses, syntactically correct SQL queries, or balanced binary trees) and when domain constraints are complex.",
      followUps: [
        "Why should you avoid using filter/suchThat excessively?",
      ],
    },
    {
      q: "What is an oracle property and when is it applicable?",
      a: "An oracle property compares the output of your implementation against a known-correct reference (the oracle) for all generated inputs. For example, testing an optimized sorting algorithm against a simple insertion sort, or testing a compiled query against the same query interpreted. It is applicable whenever a simpler, trusted implementation exists -- even if it is too slow for production, it can serve as a test oracle. The oracle can also be a previous version of the same code or a specification-derived implementation.",
    },
  ],
  mcqs: [
    {
      q: "What is the primary purpose of shrinking in property-based testing?",
      options: [
        "To reduce the size of the test suite",
        "To minimize failing counterexamples to the simplest reproducing input",
        "To compress test output for faster CI pipelines",
        "To eliminate redundant generators",
      ],
      answerIndex: 1,
      explanation:
        "Shrinking reduces a failing input to its minimal form while preserving the failure, making the bug easier to understand and fix.",
    },
    {
      q: "Which property pattern verifies that encode(decode(x)) == x?",
      options: ["Idempotency", "Commutativity", "Roundtrip", "Invariant"],
      answerIndex: 2,
      explanation:
        "Roundtrip properties check that a value survives a transformation and its inverse, such as serialization followed by deserialization.",
    },
    {
      q: "What distinguishes integrated shrinking from type-based shrinking?",
      options: [
        "Integrated shrinking is faster but produces larger counterexamples",
        "Type-based shrinking requires no Arbitrary instances",
        "Integrated shrinking ensures shrunk values always satisfy generator constraints",
        "Type-based shrinking supports stateful testing while integrated does not",
      ],
      answerIndex: 2,
      explanation:
        "Integrated shrinking operates at the level of random choices made during generation, so the shrunk value always passes through the same generator logic and never violates filters or preconditions.",
    },
    {
      q: "In stateful property-based testing, what role does the model play?",
      options: [
        "It replaces the real implementation in production",
        "It serves as a simplified reference to verify the real system's behavior",
        "It generates random command sequences",
        "It provides type information for the shrinker",
      ],
      answerIndex: 1,
      explanation:
        "The model is a simplified implementation (e.g., a dictionary for a cache) that defines expected behavior. The framework checks that the real system matches the model after each command.",
    },
    {
      q: "Why should you avoid excessive use of filter/suchThat in generators?",
      options: [
        "It makes the generator impure",
        "It can cause the framework to give up if too many generated values are rejected",
        "It disables shrinking entirely",
        "It violates the generator monad laws",
      ],
      answerIndex: 1,
      explanation:
        "Filters discard values that do not match a predicate. If the predicate is too restrictive, the framework wastes most of its budget generating and discarding values, and may give up entirely. Prefer constructing valid values directly using map and flatMap.",
    },
    {
      q: "Which framework pioneered the concept of property-based testing?",
      options: ["Hypothesis", "fast-check", "ScalaCheck", "QuickCheck"],
      answerIndex: 3,
      explanation:
        "QuickCheck was created by Koen Claessen and John Hughes in 2000 for Haskell and introduced the core concepts of generators, shrinking, and property declarations that all subsequent PBT frameworks adopted.",
    },
    {
      q: "What is an oracle property?",
      options: [
        "A property that always returns true",
        "A property verified by comparing output against a trusted reference implementation",
        "A property that uses database queries for validation",
        "A property specific to the Oracle database system",
      ],
      answerIndex: 1,
      explanation:
        "An oracle property uses a known-correct (possibly slower) implementation as a reference and checks that your implementation produces the same output for all generated inputs.",
    },
  ],
  flashcards: [
    {
      front: "What is a generator in PBT?",
      back: "A composable description of how to produce random values of a given type. Generators combine via map, flatMap, filter, and oneOf to build complex domains from simple primitives.",
    },
    {
      front: "What is shrinking?",
      back: "The process of systematically simplifying a failing counterexample to the smallest input that still triggers the failure, making debugging practical.",
    },
    {
      front: "Roundtrip property",
      back: "Verifies that decode(encode(x)) == x. Used for testing serializers, parsers, compressors, and any encode/decode pair.",
    },
    {
      front: "Idempotency property",
      back: "f(f(x)) == f(x). Applying the operation twice yields the same result as once. Examples: formatting code, normalizing URLs, deduplication.",
    },
    {
      front: "Integrated shrinking vs type-based shrinking",
      back: "Integrated shrinking (Hypothesis, fast-check) shrinks at the random-choice level, guaranteeing shrunk values satisfy generator constraints. Type-based shrinking (QuickCheck) defines shrinking per type, which can violate generator filters.",
    },
    {
      front: "Stateful property-based testing",
      back: "Generates random sequences of commands, executes them against both the real system and a simplified model, and verifies that outputs match after each step. The command sequence itself is shrunk on failure.",
    },
    {
      front: "Why does PBT need many runs (100+)?",
      back: "Each run tests a different random input. More runs explore more of the input space, increasing confidence. PBT does not prove correctness -- it searches for counterexamples probabilistically.",
    },
    {
      front: "Oracle property",
      back: "Compares your implementation against a known-correct reference for all generated inputs. Applicable when a simpler, trusted implementation exists (even if too slow for production).",
    },
    {
      front: "Coverage-guided property testing",
      back: "Combines PBT with code coverage instrumentation to bias generation toward inputs that explore new code paths. Bridges the gap between structured PBT and coverage-guided fuzzing.",
    },
  ],
  revisionNotes: [
    "PBT tests universal properties against random inputs rather than specific examples; it does not prove correctness but finds counterexamples probabilistically.",
    "Generators compose: primitive generators (int, string) combine via map, flatMap, filter, oneOf to produce complex domain objects.",
    "Shrinking reduces failing inputs to minimal counterexamples; integrated shrinking (Hypothesis, fast-check) is superior to type-based (QuickCheck) because it respects generator constraints.",
    "Five key property patterns: roundtrip (encode/decode), idempotency (f(f(x))=f(x)), commutativity (order independence), invariant (postcondition always holds), oracle (compare against reference).",
    "Stateful PBT models command sequences against a reference model; it has found critical bugs in databases, file systems, and distributed systems.",
    "Avoid heavy use of filter/suchThat -- prefer constructing valid values directly to prevent generator exhaustion.",
    "Always log the random seed for reproducibility; run fewer iterations in CI (100) and more in nightly builds (10,000).",
    "PBT complements example-based testing -- use both: examples for known edge cases and regressions, properties for broad invariant coverage.",
  ],
  cheatSheet: [
    "fc.property(arb, val => { ... }) -- declare a property in fast-check",
    "fc.assert(property, { numRuns: 500 }) -- run and assert a property",
    "fc.record({ name: fc.string(), age: fc.nat() }) -- composite generator",
    "fc.oneof(fc.constant('a'), fc.constant('b')) -- choose among generators",
    "arb.chain(val => genDependentOn(val)) -- dependent generation",
    "arb.filter(x => isValid(x)) -- filter generator (use sparingly)",
    "@given(st.lists(st.integers())) -- Hypothesis decorator for property",
    "st.composite -- Hypothesis decorator for custom multi-step generators",
    "RuleBasedStateMachine -- Hypothesis class for stateful testing",
    "quickCheck prop_myProperty -- run a QuickCheck property in GHCi",
    "Arbitrary instance: defines both generation (arbitrary) and shrinking (shrink)",
    "Always check: is the property actually falsifiable? A tautology catches nothing.",
  ],
  resources: [
    {
      label: "QuickCheck: A Lightweight Tool for Random Testing of Haskell Programs",
      kind: "paper",
      note: "The original 2000 paper by Claessen and Hughes that introduced property-based testing",
    },
    {
      label: "Hypothesis documentation",
      kind: "docs",
      note: "Comprehensive guide to Python's most popular PBT framework, including stateful testing",
    },
    {
      label: "fast-check documentation and examples",
      kind: "docs",
      note: "Official docs for the TypeScript/JavaScript PBT framework with integrated shrinking",
    },
    {
      label: "John Hughes - Don't Write Tests (talk)",
      kind: "video",
      note: "Conference talk by QuickCheck's co-creator demonstrating PBT finding real-world bugs",
    },
    {
      label: "Choosing properties for property-based testing (F# for Fun and Profit)",
      kind: "article",
      note: "Practical guide to identifying good properties, with the 'test oracle' and 'different paths same destination' patterns",
    },
    {
      label: "Hypothesis for the Scientific Stack",
      kind: "article",
      note: "How Hypothesis integrates with NumPy, Pandas, and scientific Python for testing numerical code",
    },
    {
      label: "fast-check GitHub repository",
      kind: "repo",
      note: "Source code, examples, and API reference for fast-check",
    },
    {
      label: "PropEr Testing (book)",
      kind: "book",
      note: "Fred Hebert's free online book on property-based testing in Erlang with PropEr",
    },
  ],
  glossary: [
    {
      term: "Property",
      definition:
        "A universally quantified predicate that must hold for all valid inputs; the core assertion in PBT.",
    },
    {
      term: "Generator (Arbitrary)",
      definition:
        "A composable specification for producing random values of a given type, supporting combinators like map, flatMap, filter, and oneOf.",
    },
    {
      term: "Shrinking",
      definition:
        "The process of systematically simplifying a failing counterexample to the smallest input that still triggers the property violation.",
    },
    {
      term: "Counterexample",
      definition:
        "A specific input for which the property evaluates to false, demonstrating a bug.",
    },
    {
      term: "Integrated shrinking",
      definition:
        "A shrinking approach (used by Hypothesis and fast-check) that operates on the random choices made during generation, guaranteeing shrunk values always satisfy generator constraints.",
    },
    {
      term: "Oracle",
      definition:
        "A known-correct reference implementation used to verify the system under test by comparing outputs for all generated inputs.",
    },
    {
      term: "Stateful testing",
      definition:
        "A PBT technique that generates random command sequences, executes them against both a real system and a simplified model, and checks that all observable behaviors match.",
    },
    {
      term: "Idempotency",
      definition:
        "The property that applying an operation twice produces the same result as applying it once: f(f(x)) == f(x).",
    },
    {
      term: "Roundtrip property",
      definition:
        "A property verifying that a value survives a transformation and its inverse: decode(encode(x)) == x.",
    },
    {
      term: "Commutativity",
      definition:
        "The property that the order of operands does not affect the result: f(a, b) == f(b, a).",
    },
  ],
};
