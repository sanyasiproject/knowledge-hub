import type { TopicContent } from "../types";

export const slidingWindow: TopicContent = {
  quickSummary: [
    "Maintain a contiguous range `[l, r]` plus an incremental summary, so extending or shrinking it costs O(1) instead of rescanning.",
    "**Fixed window**: slide by adding `r` and removing `r - k`. **Variable window**: expand `r` always, shrink `l` while the window is invalid.",
    "O(n) time amortised — each pointer advances at most n times — and O(1) or O(k) space for the window state.",
  ],
  detailed: [
    "A sliding window turns \"check every subarray\" from O(n²) into O(n) by never recomputing a range from scratch. The requirement is that the window's answer be **incrementally maintainable**: adding one element on the right and removing one on the left must each be O(1) (or O(log n) with a multiset). Sums, counts, and frequency maps qualify; \"number of distinct values ≥ k\" qualifies via a hash map; arbitrary non-invertible aggregates do not.\n\nKey insight: the window is a data structure with `push_back` and `pop_front`, and the loop is just deciding when to call each.",
    "## The expand/shrink skeleton\n\nThe variable-window loop has one shape worth memorising:\n\n1. Advance `r` and add `a[r]` to the window state.\n2. `while` the window violates the constraint, remove `a[l]` and advance `l`.\n3. The window `[l, r]` is now valid — record the answer.\n\nFor \"longest valid\" problems the `while` shrinks until valid and you record `r - l + 1`. For \"shortest valid\" problems you invert it: shrink `while` the window is *still* valid, recording as you go.\n\nCommon mistake: using `if` instead of `while` in the shrink step. One removal is not always enough to restore the invariant, and the window silently goes stale.",
    "## Why it is amortised O(n)\n\nThe inner `while` looks like it makes the loop quadratic, but `l` only ever increases and is bounded by n. Across the whole run the shrink step executes at most n times in total, so the combined work is at most 2n pointer moves — O(n) time regardless of how lopsided any individual iteration is. This is the same amortisation argument as the two-pointer technique.\n\nIn practice: the window only applies to **contiguous** subarrays. For subsequences or when negative numbers break the monotonicity of a sum constraint, reach for prefix sums with a hash map instead.",
    "## Fixed vs variable\n\nA fixed window of size k needs no shrink loop at all — once `r - l + 1` exceeds k you remove exactly one element per step, so the window size is invariant and the code is a single pass with a subtraction. Variable windows are driven by a predicate (sum ≤ S, at most k distinct, no repeated character), and their size fluctuates. Space is O(1) for numeric aggregates and O(k) or O(alphabet) when a frequency map is needed.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Fixed window — maximum sum of any k consecutive elements",
      source: `long long maxSumK(const vector<int>& a, int k) {
    int n = (int)a.size();
    if (n < k) return 0;
    long long sum = 0;
    for (int i = 0; i < k; ++i) sum += a[i];   // first window
    long long best = sum;
    for (int r = k; r < n; ++r) {
        sum += a[r] - a[r - k];                // add new, drop old: O(1)
        best = max(best, sum);
    }
    return best;
}
// Time O(n), space O(1).`,
    },
    {
      language: "cpp",
      caption: "Variable window — longest substring with at most k distinct characters",
      source: `int longestAtMostKDistinct(const string& s, int k) {
    unordered_map<char, int> cnt;   // window frequency map
    int best = 0, l = 0;
    for (int r = 0; r < (int)s.size(); ++r) {
        ++cnt[s[r]];                            // 1. expand
        while ((int)cnt.size() > k) {           // 2. shrink WHILE invalid
            if (--cnt[s[l]] == 0) cnt.erase(s[l]);
            ++l;
        }
        best = max(best, r - l + 1);            // 3. window is valid
    }
    return best;
}

// "Shortest" variant: minimal-length subarray with sum >= target (a[i] > 0).
int minLenAtLeast(const vector<int>& a, long long target) {
    long long sum = 0;
    int best = INT_MAX, l = 0;
    for (int r = 0; r < (int)a.size(); ++r) {
        sum += a[r];
        while (sum - a[l] >= target) sum -= a[l++];  // shrink while still valid
        if (sum >= target) best = min(best, r - l + 1);
    }
    return best == INT_MAX ? 0 : best;
}
// Both: O(n) amortised time; space O(k) and O(1) respectively.`,
    },
  ],
  cheatSheet: [
    "Skeleton: expand `r` → `while (invalid) shrink l` → record answer for `[l, r]`.",
    "Use `while`, never `if`, in the shrink step — one removal may not restore the invariant.",
    "Fixed size k: `sum += a[r] - a[r-k]` — no shrink loop needed.",
    "O(n) amortised: `l` and `r` each advance at most n times. Space O(1) or O(distinct keys).",
    "Contiguous ranges only; negatives usually break sum-based windows → use prefix sums + hash map.",
  ],
  interviewQA: [
    {
      q: "The inner while-loop looks like it makes sliding window O(n²). Why is it O(n)?",
      a: "Because the two pointers are monotonic. The outer loop advances `r` exactly n times. The inner loop only ever advances `l`, and `l` never decreases and never exceeds `r`, so across the entire execution the inner loop body runs at most n times in total — not n times per iteration. Total pointer movement is bounded by 2n, giving O(n) time. This is an amortised argument: a single outer iteration may shrink the window by many elements, but every element it removes was added exactly once, so the total is still linear. Space is O(1) for a running sum, or O(k) when I need a frequency map of the window contents.",
      followUps: [
        "Where does this argument break if l could move backwards?",
        "What is the complexity if the window state needs a multiset instead of a counter?",
      ],
    },
    {
      q: "When does the sliding window technique NOT apply?",
      a: "Three cases. First, when the target is a subsequence rather than a contiguous subarray — the window's whole premise is contiguity. Second, when the validity predicate is not monotone in the window: for 'subarray sum ≥ target' with negative numbers, extending the window can decrease the sum, so shrinking is no longer guaranteed to make an invalid window valid, and the correct tool is prefix sums with a hash map (or a monotonic deque). Third, when the window summary cannot be updated incrementally — if removing the left element requires rescanning the whole window, each step costs O(k) and the total degrades to O(nk). Sums, counts and frequency maps update in O(1); a window maximum needs a monotonic deque to keep it amortised O(1).",
      followUps: [
        "How does a monotonic deque give the sliding-window maximum in O(n)?",
        "Show the prefix-sum-plus-hash-map approach for subarray sum equals k with negatives.",
      ],
    },
  ],
  flashcards: [
    {
      front: "Sliding window skeleton",
      back: "For each r: add a[r]; `while (window invalid) { remove a[l]; ++l; }`; record answer for [l, r]. Use while, not if.",
    },
    {
      front: "Why is sliding window O(n) despite a nested loop?",
      back: "Amortisation: `l` only increases and is bounded by n, so the shrink body runs ≤ n times in total. Combined pointer movement ≤ 2n.",
    },
    {
      front: "Fixed vs variable window",
      back: "Fixed k: no shrink loop, just `sum += a[r] - a[r-k]`, O(1) space. Variable: predicate-driven shrink loop, size fluctuates, O(1)–O(k) space.",
    },
  ],
};
