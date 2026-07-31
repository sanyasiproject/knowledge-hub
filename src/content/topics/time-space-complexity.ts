import type { TopicContent } from "../types";

export const timeSpaceComplexity: TopicContent = {
  quickSummary: [
    "Time complexity measures how the number of operations grows with input size n; space complexity measures how memory usage grows with n.",
    "Big-O (upper bound), Big-Omega (lower bound), and Big-Theta (tight bound) are the three asymptotic notations — Big-O is used most in practice because worst-case guarantees matter.",
    "Analyzing loops means multiplying nested iteration counts; analyzing recursion uses recurrence relations solved by the Master theorem, recursion trees, or substitution.",
    "Space analysis must account for both auxiliary memory (extra data structures) and implicit stack frames from recursion.",
  ],
  detailed: [
    "Time complexity quantifies the number of primitive operations an algorithm performs as a function of input size n. We express it using asymptotic notation to abstract away hardware-dependent constants. Big-O gives an upper bound: f(n) = O(g(n)) means there exist constants c > 0 and n₀ such that f(n) ≤ c·g(n) for all n ≥ n₀. Big-Omega gives a lower bound: f(n) = Ω(g(n)) means f(n) ≥ c·g(n) for large n. Big-Theta is a tight bound combining both: f(n) = Θ(g(n)) when f is both O(g(n)) and Ω(g(n)). In interviews, 'time complexity' almost always means worst-case Big-O unless stated otherwise.",
    "To analyze iterative code, count the work inside each loop and multiply across nesting levels. A single loop over n elements is O(n). Two nested loops each running n times give O(n²). If the inner loop depends on the outer (e.g., j goes from i to n), the total is the sum 1+2+...+n = n(n+1)/2 = O(n²). Loops that halve or double their iterator (i *= 2 or i /= 2) contribute O(log n) iterations. A loop over n with an inner loop that halves gives O(n log n).",
    "Recursive algorithms are analyzed by writing a recurrence relation. For divide-and-conquer, the Master theorem handles recurrences of the form T(n) = aT(n/b) + O(n^d). Compare log_b(a) with d: if log_b(a) > d, T(n) = O(n^{log_b(a)}); if equal, T(n) = O(n^d log n); if less, T(n) = O(n^d). For example, merge sort has T(n) = 2T(n/2) + O(n), so a=2, b=2, d=1, log_2(2)=1=d, giving O(n log n). When the Master theorem doesn't apply (unequal subproblems, non-polynomial extra work), use a recursion tree or the Akra-Bazzi method.",
    "Space complexity counts the maximum memory an algorithm uses at any point during execution, measured as a function of n. It includes auxiliary space (extra arrays, hash maps, buffers) plus the call stack (each recursive call adds a frame). An in-place sorting algorithm like heapsort uses O(1) auxiliary space but still O(log n) stack space for its recursive variant. Merge sort uses O(n) auxiliary space for the temporary merge buffer. Tail-recursive functions can be optimized to O(1) stack space by some compilers, but you should not assume this in interviews unless the language guarantees it (e.g., Scheme).",
    "Best, worst, and average case describe different input scenarios, not different notations. Quicksort is O(n²) worst case (already sorted, bad pivot), O(n log n) average case (random input), and O(n log n) best case. Average-case analysis requires a probability distribution over inputs and is harder to reason about. In practice, expected complexity (average over randomness in the algorithm, not the input) is often more useful — randomized quicksort has O(n log n) expected time regardless of input.",
  ],
  deepDive: [
    "The Master theorem has three cases but also has gaps. When the extra work f(n) falls between the polynomial cases (e.g., f(n) = n log n for T(n) = 2T(n/2) + n log n), the basic Master theorem doesn't directly apply. The extended version handles f(n) = Θ(n^{log_b(a)} · log^k(n)) cases: the solution is Θ(n^{log_b(a)} · log^{k+1}(n)). For truly irregular recurrences like T(n) = T(n/3) + T(2n/3) + O(n), the recursion tree method is more illuminating: every level sums to O(n), and the tree depth is log_{3/2}(n), giving O(n log n).",
    "Stack space in recursion is often overlooked. A naive recursive Fibonacci uses O(2^n) time but only O(n) space because the call stack never exceeds depth n — branches are explored sequentially, not in parallel. DFS on a graph uses O(V) stack space (the longest path), while BFS uses O(V) queue space (the widest level). In tree problems, recursive DFS uses O(h) stack space where h is the tree height — O(log n) for balanced trees, O(n) for skewed ones.",
    "Hidden complexity traps are common in real code. String concatenation in a loop (s += char) in languages with immutable strings (Java, Python) creates a new string each iteration, turning an apparent O(n) loop into O(n²) total work due to copying. Similarly, list slicing in Python (arr[1:]) creates a copy in O(n), so a recursive function that slices on each call can be O(n²) instead of O(n). Hash map operations are O(1) amortized but O(n) worst case due to hash collisions; in adversarial settings (e.g., competitive programming), this matters.",
    "When analyzing space, distinguish between input space and auxiliary space. Some definitions of space complexity include the input; others (more common in interviews) count only extra space. For example, reversing an array in place is O(1) auxiliary space but O(n) total space because the array itself occupies O(n). Always clarify which convention you're using. Also note that bit complexity can differ: storing n integers each up to value M requires O(n log M) bits, which matters in problems involving very large numbers or cryptographic applications.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Analyzing time complexity of common patterns",
      source: `#include <vector>
#include <utility>
#include <algorithm>

// Pattern 1: Simple loop -- O(n)
bool linear_search(const std::vector<int>& arr, int target) {
    for (int x : arr) {           // n iterations
        if (x == target) return true;
    }
    return false;
}

// Pattern 2: Nested loops -- O(n^2)
std::vector<std::pair<int,int>> all_pairs(const std::vector<int>& arr) {
    std::vector<std::pair<int,int>> pairs;
    for (size_t i = 0; i < arr.size(); ++i) {           // n
        for (size_t j = i + 1; j < arr.size(); ++j) {   // n-1, n-2, ... => n(n-1)/2
            pairs.emplace_back(arr[i], arr[j]);
        }
    }
    return pairs;
}

// Pattern 3: Logarithmic -- O(log n)
int binary_search(const std::vector<int>& arr, int target) {
    int lo = 0, hi = static_cast<int>(arr.size()) - 1;
    while (lo <= hi) {                   // halves each time => log n
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}

// Pattern 4: Divide and conquer -- O(n log n)
std::vector<int> merge(const std::vector<int>& left,
                       const std::vector<int>& right) {
    std::vector<int> result;
    size_t i = 0, j = 0;
    while (i < left.size() && j < right.size()) {
        if (left[i] <= right[j]) { result.push_back(left[i++]); }
        else                     { result.push_back(right[j++]); }
    }
    while (i < left.size()) result.push_back(left[i++]);
    while (j < right.size()) result.push_back(right[j++]);
    return result;
}

std::vector<int> merge_sort(std::vector<int> arr) {
    if (arr.size() <= 1) return arr;
    size_t mid = arr.size() / 2;
    std::vector<int> left(arr.begin(), arr.begin() + mid);    // T(n/2)
    std::vector<int> right(arr.begin() + mid, arr.end());     // T(n/2)
    return merge(merge_sort(left), merge_sort(right));        // O(n) merge step
}`,
    },
    {
      language: "cpp",
      caption: "Space complexity examples -- stack frames vs auxiliary space",
      source: `#include <vector>
#include <algorithm>

// O(n) auxiliary space -- new array created
std::vector<int> reverse_copy(const std::vector<int>& arr) {
    return std::vector<int>(arr.rbegin(), arr.rend());  // new vector of size n
}

// O(1) auxiliary space -- in-place reversal
void reverse_inplace(std::vector<int>& arr) {
    int lo = 0, hi = static_cast<int>(arr.size()) - 1;
    while (lo < hi) {
        std::swap(arr[lo], arr[hi]);
        ++lo; --hi;
    }
}

// O(n) stack space -- linear recursion
long long factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);   // n stack frames
}

// O(log n) stack space -- balanced recursive splitting
int sum_array(const std::vector<int>& arr, int lo, int hi) {
    if (lo == hi) return arr[lo];
    int mid = lo + (hi - lo) / 2;
    return sum_array(arr, lo, mid) + sum_array(arr, mid + 1, hi);
    // depth = log n, only one branch active at a time
}

// O(2^n) time but O(n) space -- branching recursion
int fib(int n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
    // 2^n calls total, but max stack depth is n
}`,
    },
  ],
  diagrams: [
    {
      title: "Recursion tree for merge sort T(n) = 2T(n/2) + O(n)",
      kind: "flow",
      caption: "Each level does O(n) total work across all nodes. There are log₂(n) levels, giving O(n log n) total.",
    },
    {
      title: "Master theorem decision flowchart",
      kind: "flow",
      caption: "Given T(n) = aT(n/b) + O(n^d): compare log_b(a) with d to determine which case applies and the resulting complexity.",
    },
  ],
  animations: [
    {
      title: "Tracing time complexity of nested loops",
      steps: [
        {
          label: "Identify the loops",
          detail: "Outer loop: i from 0 to n-1 (n iterations). Inner loop: j from i+1 to n-1 (depends on i).",
        },
        {
          label: "Count inner iterations per outer step",
          detail: "When i=0: n-1 iterations. When i=1: n-2. ... When i=n-2: 1. When i=n-1: 0.",
        },
        {
          label: "Sum the total iterations",
          detail: "Total = (n-1) + (n-2) + ... + 1 + 0 = n(n-1)/2.",
        },
        {
          label: "Apply asymptotic notation",
          detail: "n(n-1)/2 = (n² - n)/2. Drop the constant 1/2 and lower-order term n: result is O(n²).",
        },
        {
          label: "Verify with the body cost",
          detail: "If the body of the inner loop is O(1), total time is O(n²). If the body itself is O(n) (e.g., string comparison), total becomes O(n³).",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Notation", "Meaning", "Intuition", "Use case"],
    rows: [
      ["Big-O: f = O(g)", "f grows no faster than g", "Upper bound / ceiling on growth", "Worst-case guarantees"],
      ["Big-Ω: f = Ω(g)", "f grows at least as fast as g", "Lower bound / floor on growth", "Best-case or proving algorithm optimality"],
      ["Big-Θ: f = Θ(g)", "f grows at the same rate as g", "Tight bound (both upper and lower)", "Exact characterization of growth"],
      ["Little-o: f = o(g)", "f grows strictly slower than g", "g dominates f completely", "Proving one function is negligible vs another"],
      ["Little-ω: f = ω(g)", "f grows strictly faster than g", "f dominates g completely", "Showing a lower bound is not tight"],
    ],
  },
  interviewQA: [
    {
      q: "How do you determine the time complexity of a recursive function?",
      a: "Write the recurrence relation by identifying: (1) how many recursive calls are made, (2) the size of each subproblem, and (3) the non-recursive work done at each level. Then solve using the Master theorem if it fits T(n) = aT(n/b) + O(n^d), a recursion tree for irregular splits, or the substitution method for formal proofs. For example, binary search makes 1 call on n/2 elements with O(1) extra work: T(n) = T(n/2) + O(1), which gives O(log n) by the Master theorem (a=1, b=2, d=0, log_2(1)=0=d).",
      followUps: [
        "What if the recursive function makes calls of unequal size, like T(n) = T(n/3) + T(2n/3) + O(n)?",
        "How does memoization change the time complexity of a recursive function?",
      ],
    },
    {
      q: "What is the space complexity of recursive DFS on a graph vs BFS?",
      a: "Recursive DFS uses O(V) space for the call stack in the worst case (a path graph with V vertices creates V stack frames) plus O(V) for the visited set, totaling O(V). BFS uses O(V) space for the queue (worst case: all vertices at one level in a star graph) plus O(V) for the visited set, also O(V) total. The practical difference is that DFS stack space can cause stack overflow on very deep graphs while BFS heap space is limited only by available memory.",
      followUps: [
        "How can you implement DFS iteratively to avoid stack overflow?",
        "What is the space complexity of DFS on a balanced binary tree vs a skewed tree?",
      ],
    },
    {
      q: "Why is the time complexity of quicksort O(n²) worst case but O(n log n) average case?",
      a: "Worst case occurs when the pivot consistently lands at the extreme (smallest or largest element), creating one subproblem of size n-1 and one of size 0. The recurrence T(n) = T(n-1) + O(n) solves to O(n²). Average case assumes each element is equally likely to be the pivot. On average, the pivot falls near the middle, giving roughly balanced splits. The recurrence averages out to T(n) = 2T(n/2) + O(n) = O(n log n). Randomized pivot selection ensures O(n log n) expected time regardless of input ordering.",
      followUps: [
        "How does the choice of pivot strategy affect the constant factors?",
        "What is the space complexity of quicksort in the best and worst cases?",
      ],
    },
    {
      q: "Explain the difference between auxiliary space and total space complexity.",
      a: "Auxiliary space is the extra memory an algorithm allocates beyond the input data — temporary arrays, hash maps, recursive stack frames, etc. Total space includes the input itself plus the auxiliary space. For example, merge sort on an array of n elements uses O(n) total input space plus O(n) auxiliary space for the merge buffer, giving O(n) auxiliary and O(n) total (we typically don't double-count). In-place quicksort uses O(log n) auxiliary space (stack frames) with the input occupying O(n). When someone asks 'space complexity' in an interview, they usually mean auxiliary space unless they specify otherwise.",
      followUps: [
        "Does the language's memory model (stack vs heap) affect space complexity analysis?",
      ],
    },
  ],
  followUps: [
    "How does amortized analysis differ from average-case analysis?",
    "What are the time and space complexities of common data structure operations (arrays, linked lists, hash maps, BSTs)?",
    "How do you analyze the complexity of algorithms with multiple input parameters (e.g., graph algorithms with V vertices and E edges)?",
    "What is the significance of the Master theorem's regularity condition?",
  ],
  mcqs: [
    {
      q: "What is the time complexity of the following code?\n\nfor i in range(n):\n    for j in range(n):\n        for k in range(n):\n            print(i + j + k)",
      options: ["O(n)", "O(n²)", "O(n³)", "O(n² log n)"],
      answerIndex: 2,
      explanation: "Three nested loops each running n times gives n × n × n = n³ iterations. The body is O(1), so total is O(n³).",
    },
    {
      q: "What is the time complexity of binary search?",
      options: ["O(n)", "O(n log n)", "O(log n)", "O(1)"],
      answerIndex: 2,
      explanation: "Binary search halves the search space each step. Starting with n elements, after k steps we have n/2^k elements. We stop when n/2^k = 1, so k = log₂(n). The complexity is O(log n).",
    },
    {
      q: "For T(n) = 2T(n/2) + O(n), what does the Master theorem give?",
      options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
      answerIndex: 1,
      explanation: "Here a=2, b=2, d=1. log_b(a) = log₂(2) = 1 = d. This is Case 2 of the Master theorem, giving O(n^d · log n) = O(n log n).",
    },
    {
      q: "What is the space complexity of a recursive Fibonacci function fib(n)?",
      options: ["O(2^n)", "O(n²)", "O(n)", "O(log n)"],
      answerIndex: 2,
      explanation: "Although fib(n) makes 2^n calls total, the maximum call stack depth at any point is n (following the fib(n-1) chain down). Since branches complete before siblings start, at most n frames exist simultaneously.",
    },
    {
      q: "Which of the following is TRUE about Big-Theta notation?",
      options: [
        "Θ(g(n)) is only an upper bound on f(n)",
        "Θ(g(n)) means f(n) grows at exactly the same rate as g(n) asymptotically",
        "Θ(g(n)) is only a lower bound on f(n)",
        "Θ(g(n)) is used exclusively for best-case analysis",
      ],
      answerIndex: 1,
      explanation: "Big-Theta is a tight bound: f(n) = Θ(g(n)) means there exist constants c₁, c₂ > 0 such that c₁·g(n) ≤ f(n) ≤ c₂·g(n) for all sufficiently large n. It captures the exact growth rate.",
    },
  ],
  exercises: [
    "Analyze the time complexity of the following: for i in range(1, n+1): for j in range(1, n+1, i): print(i, j). Hint: the inner loop runs n/i times for each i, so the total is the harmonic series n(1 + 1/2 + 1/3 + ... + 1/n) = O(n log n).",
    "Prove using the substitution method that T(n) = 2T(n/2) + n has the solution T(n) = O(n log n). Assume T(1) = 1 and use strong induction.",
    "Write a function that finds all triplets in an array summing to zero. Analyze its time and space complexity. Then optimize from O(n³) to O(n²) using sorting and two pointers.",
    "Given a recursive function T(n) = 3T(n/4) + O(n²), use the Master theorem to determine the time complexity. Verify your answer by drawing the recursion tree.",
  ],
  flashcards: [
    { front: "What does f(n) = O(g(n)) formally mean?", back: "There exist constants c > 0 and n₀ ≥ 0 such that f(n) ≤ c·g(n) for all n ≥ n₀. It is an asymptotic upper bound." },
    { front: "What are the three cases of the Master theorem for T(n) = aT(n/b) + O(n^d)?", back: "Case 1: log_b(a) > d → O(n^{log_b(a)}). Case 2: log_b(a) = d → O(n^d log n). Case 3: log_b(a) < d → O(n^d)." },
    { front: "What is the difference between time and space complexity?", back: "Time complexity measures growth of operations/steps; space complexity measures growth of memory usage. Both are functions of input size n." },
    { front: "Why is recursive Fibonacci O(2^n) time but only O(n) space?", back: "It makes 2^n total calls, but only n frames exist on the stack at once — the left branch completes before the right branch starts at each level." },
    { front: "What is the space complexity of merge sort?", back: "O(n) auxiliary space for the merge buffer (or O(n) total extra), plus O(log n) for the recursion stack. Often cited as O(n) overall." },
    { front: "How do you analyze a loop with iterator i *= 2?", back: "i takes values 1, 2, 4, 8, ..., n. It doubles each step, so after k steps i = 2^k = n, meaning k = log₂(n). The loop is O(log n)." },
    { front: "What is the difference between Big-O and Big-Theta?", back: "Big-O is only an upper bound (f grows at most as fast as g). Big-Theta is a tight bound (f grows at exactly the same rate as g, within constant factors)." },
    { front: "What is the harmonic series sum and its complexity?", back: "H(n) = 1 + 1/2 + 1/3 + ... + 1/n ≈ ln(n) + γ (Euler-Mascheroni constant). So H(n) = Θ(log n)." },
  ],
  revisionNotes: [
    "Big-O = upper bound, Big-Omega = lower bound, Big-Theta = tight bound. Interviews almost always want Big-O (worst case).",
    "Loop analysis: multiply iteration counts across nesting. Watch for loops with i *= 2 (log n), loops depending on outer variable (sum the series), and hidden O(n) operations inside loops.",
    "Master theorem: T(n) = aT(n/b) + O(n^d). Compare log_b(a) with d. Equal → n^d log n. Greater → n^{log_b(a)}. Less → n^d.",
    "Space = auxiliary (extra structures + stack frames). Recursive DFS: O(depth). BFS: O(width). Merge sort: O(n) buffer + O(log n) stack.",
    "Best/worst/average are input scenarios, not notations. Quicksort: O(n²) worst, O(n log n) average. Binary search: O(1) best, O(log n) worst.",
    "Beware hidden costs: string concatenation in loops, list slicing in recursion, hash collision chains — all can silently increase complexity.",
  ],
  cheatSheet: [
    "O(1): hash table lookup, array index access, stack push/pop",
    "O(log n): binary search, balanced BST operations, exponentiation by squaring",
    "O(n): linear scan, single-pass algorithms, counting sort setup",
    "O(n log n): comparison-based sorting lower bound, merge sort, heap sort",
    "O(n²): nested loops over n, bubble/insertion/selection sort, naive matrix operations",
    "O(2^n): exhaustive subsets, naive recursive Fibonacci, brute-force SAT",
    "Master theorem quick check: T(n) = aT(n/b) + n^d → compare log_b(a) vs d",
  ],
  resources: [
    { label: "Introduction to Algorithms (CLRS) — Chapters 3-4", kind: "book", note: "The gold standard reference for asymptotic notation, recurrences, and the Master theorem." },
    { label: "MIT 6.006 Lecture on Asymptotic Analysis", kind: "video", note: "Erik Demaine's lecture clearly explains Big-O, Omega, Theta with visual examples." },
    { label: "Big-O Cheat Sheet (bigocheatsheet.com)", kind: "article", note: "Quick reference for time and space complexities of common algorithms and data structures." },
    { label: "Algorithm Design Manual by Skiena — Chapter 2", kind: "book", note: "Practical approach to algorithm analysis with real-world examples and war stories." },
  ],
  glossary: [
    { term: "Big-O (O)", definition: "Asymptotic upper bound on a function's growth rate. f(n) = O(g(n)) means f grows no faster than g for large n, up to a constant factor." },
    { term: "Big-Omega (Ω)", definition: "Asymptotic lower bound. f(n) = Ω(g(n)) means f grows at least as fast as g for large n." },
    { term: "Big-Theta (Θ)", definition: "Tight asymptotic bound. f(n) = Θ(g(n)) means f grows at the same rate as g (both O and Ω)." },
    { term: "Recurrence relation", definition: "An equation defining a function in terms of its value on smaller inputs. Used to express the running time of recursive algorithms." },
    { term: "Master theorem", definition: "A formula for solving recurrences of the form T(n) = aT(n/b) + O(n^d) by comparing log_b(a) with d." },
    { term: "Auxiliary space", definition: "Extra memory allocated by an algorithm beyond the input — includes temporary data structures, buffers, and (in some definitions) stack frames." },
    { term: "Amortized complexity", definition: "The average cost per operation over a worst-case sequence of operations. A single operation may be expensive, but the cost is spread across many cheap ones." },
    { term: "Recursion tree", definition: "A tree diagram showing the recursive calls of an algorithm, used to visualize and sum work at each level to solve recurrences." },
  ],
};
