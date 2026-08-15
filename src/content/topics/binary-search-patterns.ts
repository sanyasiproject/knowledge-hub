import type { TopicContent } from "../types";

export const binarySearchPatterns: TopicContent = {
  quickSummary: [
    "Three canonical forms: exact find, boundary search (`lower_bound` / `upper_bound`), and binary search on the **answer**.",
    "All three are O(log n) time and O(1) space — the only thing that changes is the predicate and what you return.",
    "Correctness comes from a loop invariant, not from memorising `lo`/`hi` arithmetic.",
  ],
  detailed: [
    "Binary search does not require a sorted array — it requires a **monotone predicate**. Sortedness is just the most common way to get one. If you can write a boolean `ok(x)` that is false, false, ..., false, true, true, ..., true over the search space, you can binary search for the first `true`. That reframing is what turns binary search from an array trick into a general technique.\n\nKey insight: stop thinking \"find the value\" and start thinking \"find the boundary where the predicate flips\".",
    "## The half-open invariant\n\nUse the range `[lo, hi)` and maintain one invariant: *the answer lies in `[lo, hi)`*. Initialise `lo = 0`, `hi = n`. Each step computes `mid = lo + (hi - lo) / 2` and shrinks exactly one side — `lo = mid + 1` or `hi = mid`. The loop runs while `lo < hi`, and on exit `lo == hi` is the boundary.\n\nCommon mistake: writing `hi = mid - 1` in a boundary search. That discards a candidate answer and produces an off-by-one. In the half-open form `hi` is exclusive, so `hi = mid` is the correct shrink and the loop always terminates because the range strictly shrinks.",
    "## Binary search on the answer\n\nWhen the question is \"minimise the maximum\" or \"maximise the minimum\" (ship capacity, page allocation, Koko eating bananas), the search space is the *answer range*, not the input. Write a feasibility check `ok(x)` — usually a greedy O(n) pass — and binary search over `[minAnswer, maxAnswer]`. Total cost is O(n log(range)), space O(1).\n\nIn practice: the hard part is proving monotonicity. If `x` works, does `x + 1` always work? If not, binary search is invalid no matter how the bounds are written.",
    "## Overflow and floats\n\nUse `lo + (hi - lo) / 2`, never `(lo + hi) / 2`, when bounds can approach `INT_MAX`. For real-valued answers, drop the integer loop and iterate a fixed 100 times (or `while (hi - lo > 1e-9)`) — a fixed iteration count is immune to precision stalls where `mid` equals `lo` forever.",
  ],
  code: [
    {
      language: "cpp",
      caption: "The three canonical forms — exact, boundary, and predicate",
      source: `// 1) Exact find: returns index of target, or -1.
int findExact(const vector<int>& a, int target) {
    int lo = 0, hi = (int)a.size() - 1;   // closed range [lo, hi]
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] == target) return mid;
        if (a[mid] < target) lo = mid + 1;
        else                 hi = mid - 1;
    }
    return -1;
}

// 2) lower_bound: first index i with a[i] >= target (may be a.size()).
int lowerBound(const vector<int>& a, int target) {
    int lo = 0, hi = (int)a.size();       // half-open [lo, hi)
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] < target) lo = mid + 1;  // mid can't be the answer
        else                 hi = mid;      // mid might be the answer
    }
    return lo;
}

// 3) upper_bound: first index i with a[i] > target.
int upperBound(const vector<int>& a, int target) {
    int lo = 0, hi = (int)a.size();
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] <= target) lo = mid + 1;
        else                  hi = mid;
    }
    return lo;
}
// count of target == upperBound(a, t) - lowerBound(a, t)`,
    },
    {
      language: "cpp",
      caption: "Binary search on the answer — minimise the maximum load",
      source: `// Split 'a' into at most k contiguous parts; minimise the largest part sum.
// ok(cap) is monotone: if cap works, every larger cap works too.
bool ok(const vector<int>& a, int k, long long cap) {
    long long cur = 0;
    int parts = 1;
    for (int x : a) {
        if (x > cap) return false;        // a single element cannot fit
        if (cur + x > cap) { ++parts; cur = x; }
        else                cur += x;
    }
    return parts <= k;
}

long long minMaxLoad(const vector<int>& a, int k) {
    long long lo = 0, hi = 0;
    for (int x : a) { lo = max(lo, (long long)x); hi += x; }
    while (lo < hi) {                     // invariant: answer in [lo, hi]
        long long mid = lo + (hi - lo) / 2;
        if (ok(a, k, mid)) hi = mid;      // feasible -> try smaller
        else               lo = mid + 1;  // infeasible -> must grow
    }
    return lo;
}
// Time: O(n log(sum)).  Space: O(1).`,
    },
  ],
  cheatSheet: [
    "Half-open `[lo, hi)` + `while (lo < hi)` + `hi = mid` / `lo = mid + 1` — one invariant, no off-by-one.",
    "`mid = lo + (hi - lo) / 2` to avoid signed overflow.",
    "`lower_bound` = first `>= x`; `upper_bound` = first `> x`; count = upper − lower.",
    "Answer-search: define a monotone `ok(x)`, then binary search the answer range. O(n log range).",
    "Float answers: loop a fixed ~100 iterations instead of comparing `lo < hi`.",
  ],
  interviewQA: [
    {
      q: "Why does your binary search never have an off-by-one bug?",
      a: "Because I fix one invariant and let it drive the code: with the half-open range `[lo, hi)`, the answer is always inside `[lo, hi)`. That forces `while (lo < hi)`, and forces the two shrink steps to be `lo = mid + 1` (when `mid` is provably not the answer) and `hi = mid` (when `mid` might still be the answer). Since `mid` is always in `[lo, hi)` and each branch strictly shrinks the range, the loop terminates, and on exit `lo == hi` is exactly the boundary index. I never write `hi = mid - 1` in a boundary search — that is the classic bug, because it throws away a candidate.",
      followUps: [
        "How would you adapt this to find the last index satisfying a predicate?",
        "Why is `lo + (hi - lo) / 2` preferred over `(lo + hi) / 2`?",
      ],
    },
    {
      q: "When can you binary search on the answer, and how do you justify it?",
      a: "When the feasibility check is monotone: there is a threshold such that every value on one side is feasible and every value on the other is not. For example, in 'minimise the maximum subarray sum with k splits', if a capacity of 100 lets you fit within k parts, then 101 certainly does too — feasibility is monotone increasing in capacity, so the feasible set is a suffix and I can binary search for its first element. The check itself is a linear greedy pass, giving O(n log(range)) time and O(1) extra space. If I cannot argue that monotonicity, binary search is simply invalid — no amount of careful bound handling fixes a non-monotone predicate.",
      followUps: [
        "What is the search range and why do you start `lo` at max(element)?",
        "How does this change if the answer is a real number rather than an integer?",
      ],
    },
  ],
  flashcards: [
    {
      front: "What does binary search actually require?",
      back: "A monotone predicate over the search space (false...false, true...true). Sortedness is just the common way to get one. O(log n) time, O(1) space.",
    },
    {
      front: "lower_bound vs upper_bound",
      back: "`lower_bound` = first index with `a[i] >= x`; `upper_bound` = first index with `a[i] > x`. Their difference is the number of occurrences of x.",
    },
    {
      front: "Half-open binary search skeleton",
      back: "`lo=0, hi=n; while (lo<hi) { mid=lo+(hi-lo)/2; if (bad(mid)) lo=mid+1; else hi=mid; } return lo;` — invariant: answer stays in [lo, hi).",
    },
  ],
};
