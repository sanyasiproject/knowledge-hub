import type { TopicContent } from "../types";

export const bigONotation: TopicContent = {
  quickSummary: [
    "Big-O describes how an algorithm's running time or memory grows as the input size (n) grows — it captures the growth rate, not the exact time.",
    "We keep only the dominant term and drop constants: 3n² + 5n + 9 is O(n²).",
    "Common classes, best to worst: O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ) < O(n!).",
  ],
  detailed: [
    "Big-O notation is an upper bound on the growth rate of a function. When we say an algorithm is O(n), we mean that beyond some input size, its cost grows at most linearly with n, ignoring constant factors.",
    "We drop constants and lower-order terms because they stop mattering as n gets large. For a big enough input, an O(n²) algorithm will always eventually be slower than an O(n) one, regardless of the constants involved.",
    "Big-O specifically describes the worst case. Related notations describe other cases: Big-Ω (Omega) is a lower bound (best case), and Big-Θ (Theta) is a tight bound that applies when the upper and lower bounds match.",
    "In interviews you're almost always asked for the worst-case time and space complexity in Big-O terms, so it is the notation worth mastering first.",
  ],
  deepDive: [
    "Formally, f(n) = O(g(n)) if there exist positive constants c and n₀ such that f(n) ≤ c·g(n) for all n ≥ n₀. The constants let us ignore hardware and implementation details and focus purely on scaling.",
    "Amortized complexity matters for structures like dynamic arrays: a single append can trigger an O(n) resize, but across n appends the total work is O(n), so each append is O(1) amortized.",
    "Beware hidden costs: string concatenation in a loop, or copying a collection inside a loop, can silently turn an O(n) algorithm into O(n²).",
  ],
  code: [
    {
      language: "typescript",
      caption: "O(1) vs O(n) vs O(n²) — the same work at three growth rates",
      source: `// O(1) — constant: one operation regardless of n
function first<T>(items: T[]): T | undefined {
  return items[0];
}

// O(n) — linear: work grows in step with n
function contains<T>(items: T[], target: T): boolean {
  for (const x of items) {        // runs n times
    if (x === target) return true;
  }
  return false;
}

// O(n²) — quadratic: a nested loop over n
function hasDuplicateSlow<T>(items: T[]): boolean {
  for (let i = 0; i < items.length; i++) {          // n
    for (let j = i + 1; j < items.length; j++) {    // n
      if (items[i] === items[j]) return true;
    }
  }
  return false;
}

// The same answer in O(n) time — we traded O(n) memory for it.
function hasDuplicateFast<T>(items: T[]): boolean {
  const seen = new Set<T>();
  for (const x of items) {
    if (seen.has(x)) return true; // Set lookup is O(1) average
    seen.add(x);
  }
  return false;
}

// n = 10      -> quadratic does 100 comparisons
// n = 100,000 -> quadratic does 10,000,000,000. This is the whole point.`,
    },
  ],
  animations: [
    {
      title: "Comparing growth rates as n grows",
      steps: [
        {
          label: "n = 10",
          detail: "O(1) does 1 step, O(log n) ~3, O(n) 10, O(n log n) ~33, O(n²) 100. Everything looks fine at this size.",
        },
        {
          label: "n = 1,000",
          detail: "O(1) still 1, O(log n) ~10, O(n) 1,000, O(n log n) ~10,000, O(n²) 1,000,000. The quadratic is now 1000× the linear.",
        },
        {
          label: "n = 1,000,000",
          detail: "O(n) is a million steps — milliseconds. O(n²) is a trillion — hours. This is the gap Big-O exists to expose.",
        },
        {
          label: "Constants dropped",
          detail: "3n² + 5n + 9 → O(n²). At n = 1,000,000 the n² term is ~10¹² and the rest ~10⁶ — the lower terms are noise.",
        },
        {
          label: "Why worst case",
          detail: "An average-case win doesn't help when the adversarial input is the one that takes your service down.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Complexity", "Name", "n = 10", "n = 1,000", "Typical example"],
    rows: [
      ["O(1)", "Constant", "1", "1", "Hash lookup, array index"],
      ["O(log n)", "Logarithmic", "~3", "~10", "Binary search"],
      ["O(n)", "Linear", "10", "1,000", "Single loop / scan"],
      ["O(n log n)", "Linearithmic", "~33", "~10,000", "Merge sort, heapsort"],
      ["O(n²)", "Quadratic", "100", "1,000,000", "Nested loops"],
      ["O(2ⁿ)", "Exponential", "1,024", "astronomical", "Naive recursive subsets"],
    ],
  },
  diagrams: [
    {
      title: "Complexity Class Hierarchy",
      kind: "architecture",
      caption: "How the common complexity classes nest inside each other — each class is strictly slower than the one above it as n grows.",
      mermaid: `graph TD
    O1["O(1) — Constant"]
    OLOGN["O(log n) — Logarithmic"]
    ON["O(n) — Linear"]
    ONLOGN["O(n log n) — Linearithmic"]
    ON2["O(n²) — Quadratic"]
    O2N["O(2ⁿ) — Exponential"]
    ONF["O(n!) — Factorial"]
    O1 --> OLOGN --> ON --> ONLOGN --> ON2 --> O2N --> ONF`,
    },
    {
      title: "Algorithm Analysis Decision Flow",
      kind: "flow",
      caption: "Step-by-step process for determining the Big-O complexity of a given algorithm.",
      mermaid: `flowchart TD
    A([Start]) --> B{Nested loops?}
    B -->|Yes| C{Both over n?}
    C -->|Yes| D["O(n²) or higher"]
    C -->|No| E["O(n log n) likely"]
    B -->|No| F{Single loop?}
    F -->|Yes| G["O(n)"]
    F -->|No| H{Halving each step?}
    H -->|Yes| I["O(log n)"]
    H -->|No| J["O(1)"]`,
    },
    {
      title: "Amortized Cost — Dynamic Array Append",
      kind: "sequence",
      caption: "Most appends are O(1). Occasional resize doubles capacity and copies all elements, but amortizes to O(1) per append.",
      mermaid: `sequenceDiagram
    participant App
    participant Array
    participant Memory
    App->>Array: append(x) — capacity available
    Array-->>App: O(1) insert
    App->>Array: append(y) — array full
    Array->>Memory: allocate 2× capacity
    Array->>Memory: copy all elements O(n)
    Array-->>App: insert complete
    Note over Array: amortized cost per append = O(1)`,
    },
    {
      title: "Complexity Classes Mind Map",
      kind: "mindmap",
      caption: "Common algorithms grouped by their Big-O complexity class for quick reference.",
      mermaid: `mindmap
  root((Big-O))
    O_1[O of 1]
      Hash lookup
      Array index
      Stack push/pop
    O_logn[O of log n]
      Binary search
      BST lookup
    O_n[O of n]
      Linear scan
      Single loop
    O_nlogn[O of n log n]
      Merge sort
      Heap sort
      Quick sort avg
    O_n2[O of n squared]
      Bubble sort
      Nested loops
    O_2n[O of 2 to n]
      Subset enumeration`,
    },
  ],
  interviewQA: [
    {
      q: "What is the time complexity of binary search, and why?",
      a: "O(log n). Each comparison halves the remaining search space, so the number of steps is log₂(n).",
      followUps: [
        "What must be true about the input for binary search to work? (It must be sorted.)",
        "What is the space complexity of iterative vs recursive binary search? (O(1) vs O(log n) for the call stack.)",
      ],
    },
    {
      q: "Why do we drop constants and lower-order terms in Big-O?",
      a: "Because Big-O describes asymptotic growth. As n grows large, the dominant term determines the cost, and constants depend on hardware/implementation, not the algorithm's scalability.",
    },
    {
      q: "Is an O(n) algorithm always faster than an O(n²) one?",
      a: "No — only for sufficiently large n. For small inputs, constant factors can make an O(n²) algorithm faster. Big-O is about scaling, not absolute speed on a given input.",
    },
  ],
  followUps: [
    "Difference between Big-O, Big-Θ, and Big-Ω.",
    "Amortized vs worst-case complexity (dynamic array append).",
    "Complexity of common operations on arrays, hash maps, and balanced trees.",
    "Frequently confused: O(log n) vs O(n log n).",
  ],
  mcqs: [
    {
      q: "What is the worst-case time complexity of inserting into a hash table?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
      answerIndex: 2,
      explanation: "Average case is O(1), but with many collisions (worst case) all keys land in one bucket, degrading to O(n).",
    },
    {
      q: "3n² + 100n + 500 simplifies in Big-O to:",
      options: ["O(n)", "O(n²)", "O(3n²)", "O(n² + n)"],
      answerIndex: 1,
      explanation: "Keep only the dominant term and drop constants: O(n²).",
    },
  ],
  exercises: [
    "Determine the time and space complexity of a function that finds the two-sum using a hash map.",
    "Given a nested loop where the inner loop runs from i to n, prove the total work is O(n²).",
    "Refactor an O(n²) duplicate-detection function into an O(n) one and state the space trade-off.",
  ],
  flashcards: [
    { front: "O(1)", back: "Constant time — cost is independent of input size." },
    { front: "O(log n)", back: "Logarithmic — each step reduces the problem by a constant factor (e.g. binary search)." },
    { front: "O(n log n)", back: "Linearithmic — the best achievable for comparison-based sorting." },
    { front: "Why drop constants?", back: "Big-O describes asymptotic growth; constants depend on hardware, not scalability." },
  ],
  revisionNotes: [
    "Big-O = worst-case upper bound on growth rate.",
    "Drop constants and lower-order terms.",
    "Order: 1 < log n < n < n log n < n² < 2ⁿ < n!.",
    "Θ = tight bound, Ω = lower bound.",
    "Amortized ≠ average ≠ worst case.",
  ],
  cheatSheet: [
    "Array access: O(1) | search: O(n) | sorted binary search: O(log n)",
    "Hash map: avg O(1), worst O(n)",
    "Balanced BST: O(log n) for search/insert/delete",
    "Comparison sort: O(n log n) lower bound",
    "Recursion cost = (number of calls) × (work per call)",
  ],
  resources: [
    { label: "Introduction to Algorithms (CLRS), Ch. 3", kind: "book", note: "The definitive treatment of asymptotic notation." },
    { label: "Big-O Cheat Sheet (bigocheatsheet.com)", kind: "article", note: "Complexity of common data structures and algorithms." },
    { label: "MIT 6.006 — Introduction to Algorithms", kind: "video", note: "Free lecture series covering complexity analysis." },
  ],
  glossary: [
    { term: "Asymptotic", definition: "Describing behavior as the input size approaches infinity." },
    { term: "Dominant term", definition: "The fastest-growing term in a cost expression; the only one Big-O keeps." },
    { term: "Amortized cost", definition: "Average cost per operation over a sequence, smoothing out occasional expensive operations." },
  ],
};
