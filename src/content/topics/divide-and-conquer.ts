import type { TopicContent } from "../types";

export const divideAndConquer: TopicContent = {
  quickSummary: [
    "Three steps: **split** the input into subproblems, **solve** each recursively, **combine** the results. The combine step is where the algorithm actually lives.",
    "Cost obeys T(n) = a·T(n/b) + f(n); the Master Theorem just asks whether the leaves, the root, or every level dominates.",
    "Merge sort is O(n log n) time and O(n) space; count-inversions is the same recursion with a counter added to the merge.",
  ],
  detailed: [
    "Divide and conquer wins when the combine step is cheaper than solving the whole problem directly. Splitting an array in half is free; merging two sorted halves is O(n); so sorting collapses from O(n^2) to O(n log n). If combining were as expensive as the original problem, you would gain nothing.",
    "## Master Theorem, without the algebra\nFor T(n) = a·T(n/b) + f(n), compare f(n) against n^(log_b a) — the total work at the leaf level.\n\n1. **Leaves dominate** — f(n) is smaller: T(n) = Θ(n^(log_b a)). Binary search style trees where recursion outweighs the merge.\n2. **Balanced** — f(n) ≈ n^(log_b a): T(n) = Θ(f(n)·log n). Merge sort is a = 2, b = 2, f(n) = n, giving Θ(n log n).\n3. **Root dominates** — f(n) is larger: T(n) = Θ(f(n)). The top-level combine swamps everything below.\n\nKey insight: you are only asking whether work grows, shrinks, or stays flat as you descend the recursion tree. Sum the level that dominates.",
    "## Canonical examples\n\n- **Merge sort** — split in half, sort each, merge with two pointers. O(n log n) time, O(n) auxiliary space, stable.\n- **Count inversions** — the identical recursion; when the right half's element is taken during the merge, every remaining element in the left half forms an inversion, so add `mid - i + 1`. Same O(n log n) time and O(n) space, versus O(n^2) for the brute-force double loop.\n- **Binary search** — a = 1, b = 2, f(n) = O(1), giving O(log n) time and O(1) space iteratively.\n- **Closest pair of points** — split by x, recurse, then combine over a strip of width 2d: O(n log n).",
    "## When it loses\nIn practice: recursion is not free. Each call costs a stack frame, and for small n the constant factor beats the asymptotics — which is why real sort implementations (introsort in libstdc++) switch to insertion sort below roughly 16 elements.\n\nIf a single linear pass solves the problem, divide and conquer is strictly worse. Maximum subarray via D&C is O(n log n); Kadane's algorithm is O(n) time and O(1) space. Finding an array's max via D&C is O(n) with log n stack depth; a loop is O(n) with O(1) space. Reach for D&C only when the combine buys you something a single pass cannot.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Merge sort + inversion count — one recursion, O(n log n) time, O(n) space",
      source: `#include <vector>
using namespace std;

// Sorts a[lo..hi] in place and returns the number of inversions in it.
long long sortCount(vector<int>& a, int lo, int hi, vector<int>& buf) {
    if (lo >= hi) return 0;                       // base case: 0 or 1 element
    int mid = lo + (hi - lo) / 2;                 // overflow-safe midpoint

    long long inv = sortCount(a, lo, mid, buf)    // divide + conquer
                  + sortCount(a, mid + 1, hi, buf);

    int i = lo, j = mid + 1, k = lo;              // combine: merge two runs
    while (i <= mid && j <= hi) {
        if (a[i] <= a[j]) {                       // <= keeps the sort stable
            buf[k++] = a[i++];
        } else {
            // a[i..mid] are all > a[j], so each is an inversion with a[j].
            inv += (mid - i + 1);
            buf[k++] = a[j++];
        }
    }
    while (i <= mid) buf[k++] = a[i++];
    while (j <= hi)  buf[k++] = a[j++];
    for (int t = lo; t <= hi; ++t) a[t] = buf[t];
    return inv;
}

long long countInversions(vector<int> a) {
    if (a.empty()) return 0;
    vector<int> buf(a.size());
    return sortCount(a, 0, (int)a.size() - 1, buf);
}   // O(n log n) time, O(n) buffer + O(log n) stack`,
    },
  ],
  comparison: {
    columns: ["Recurrence", "Algorithm", "Master case", "Result"],
    rows: [
      ["T(n) = 2T(n/2) + O(n)", "Merge sort, count inversions", "Balanced", "Θ(n log n)"],
      ["T(n) = T(n/2) + O(1)", "Binary search", "Balanced (a=1)", "Θ(log n)"],
      ["T(n) = 2T(n/2) + O(1)", "Tree traversal / array max", "Leaves dominate", "Θ(n)"],
      ["T(n) = 7T(n/2) + O(n^2)", "Strassen matrix multiply", "Leaves dominate", "Θ(n^2.81)"],
    ],
  },
  interviewQA: [
    {
      q: "Count inversions in an array better than O(n^2).",
      a: "Piggyback on merge sort. Recurse on both halves, counting inversions within each, then count cross-half inversions during the merge: when you take an element from the right half at index j, every element still unconsumed in the left half (indices i through mid) is greater than it, so add mid - i + 1 in one shot rather than element by element. Summing over the recursion gives O(n log n) time with O(n) auxiliary buffer and O(log n) stack. The correctness hinges on both halves already being sorted when you merge, which is exactly what the recursion guarantees. Brute force is O(n^2) time, O(1) space — fine only for tiny n.",
      followUps: [
        "How would you do this with a BIT / Fenwick tree instead?",
        "Does the merge need to be stable for the count to be right?",
      ],
    },
    {
      q: "When is divide and conquer the wrong choice?",
      a: "When a single linear pass achieves the same result, or when the combine step is as expensive as the original problem. Maximum subarray via divide and conquer is O(n log n); Kadane's is O(n) time and O(1) space. Finding a maximum via recursion is O(n) time but adds O(log n) stack and per-call overhead versus an O(1)-space loop. There is also a constant-factor floor: function call overhead and cache behaviour make recursion lose on small inputs, which is why production sorts cut over to insertion sort below about 16 elements and why introsort switches to heapsort when quicksort's recursion goes too deep. Deep recursion also risks stack overflow on adversarial inputs unless you recurse into the smaller side.",
      followUps: [
        "How does introsort combine three algorithms and why?",
        "What is the recursion depth risk in naive quicksort and how do you bound it?",
      ],
    },
  ],
  flashcards: [
    {
      front: "Master Theorem for T(n) = a·T(n/b) + f(n) — the three cases in one line?",
      back: "Compare f(n) to n^(log_b a): smaller means leaves dominate, Θ(n^(log_b a)); equal means Θ(f(n)·log n); larger means the root dominates, Θ(f(n)).",
    },
    {
      front: "How does merge sort count inversions?",
      back: "During the merge, when you consume a[j] from the right half, add (mid - i + 1) — every remaining left-half element exceeds it. O(n log n) time, O(n) buffer, O(log n) stack.",
    },
    {
      front: "When does divide and conquer lose to a linear scan?",
      back: "When the combine step buys nothing: max subarray (Kadane O(n)/O(1) beats D&C O(n log n)), or array max. Also on small n, where call overhead dominates — hence the insertion-sort cutoff around 16.",
    },
  ],
  cheatSheet: [
    "Shape: split → recurse → combine; the combine step is the algorithm.",
    "Merge sort: O(n log n) time, O(n) auxiliary space, stable.",
    "Count inversions: same recursion, `inv += mid - i + 1` when taking from the right half.",
    "Master Theorem: compare f(n) with n^(log_b a); merge sort is the balanced case, Θ(n log n).",
    "Use `lo + (hi - lo) / 2` for the midpoint — `(lo + hi) / 2` can overflow.",
  ],
};
