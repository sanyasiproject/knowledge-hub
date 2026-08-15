import type { TopicContent } from "../types";

export const meetInTheMiddle: TopicContent = {
  quickSummary: [
    "Splits n items into two halves, enumerates all 2^(n/2) combinations of each, sorts one side and binary-searches it from the other — turning O(2ⁿ) into O(2^(n/2)·n).",
    "O(2^(n/2)·n) time, O(2^(n/2)) space. That is the difference between 10¹² and 10⁶ at n = 40, which is exactly the constraint that signals this technique.",
    "**Precondition:** the objective must decompose *additively and independently* across the split — a choice in the left half must not constrain which choices are legal in the right half.",
  ],
  detailed: [
    `Subset sum over n = 40 items is hopeless by brute force (2⁴⁰ ≈ 10¹²) and hopeless by the classic pseudo-polynomial DP when the values are large (the table is indexed by sum). Meet in the middle threads the gap: split the items into halves of size roughly n/2, enumerate every subset sum of each half independently, then recombine.

Recombination is where the win lands. Sort the right half's 2^(n/2) sums once, then for each left sum \`x\` binary-search for the best partner \`y\` — the largest \`y ≤ target - x\` for a maximisation, or an \`equal_range\` for an exact count. Enumeration is 2·2^(n/2), the sort is 2^(n/2)·(n/2), and the search loop is another 2^(n/2)·(n/2), so the whole thing is O(2^(n/2)·n).`,
    `## What the precondition actually rules out

The technique needs the two halves to be **independent**: fixing the left choices must not change which right choices are legal, and the objective must combine as \`f(left) + f(right)\`.

That holds for subset sum, subset XOR, counting subsets with a given sum, and the 4-sum problem. It **fails** the moment items interact across the split — a knapsack with a pairwise conflict graph, or a TSP path, cannot be cut this way, because the right half's feasibility depends on which left items were taken.

For example, "choose any subset of 40 weights maximising the total without exceeding W" splits cleanly; "choose 40 items where item 3 and item 25 are mutually exclusive" does not, unless you branch on that one interaction separately.

Key insight: unlike almost every other exponential-to-subexponential trick, this one assumes nothing about the *values* — negatives, huge magnitudes, and duplicates all work. That is precisely why it beats the sum-indexed DP when the values are large.`,
    `## Practical notes

Enumerating a half naively is O(2^k·k) because of the inner bit loop. The standard improvement uses the low-bit recurrence \`s[mask] = s[mask & (mask-1)] + a[lowestSetBit(mask)]\`, giving O(2^k) — worth it when k = 20 and memory bandwidth is the bottleneck.

Split as evenly as possible. The cost is dominated by \`2^max(k1, k2)\`, so an uneven split of 25/15 costs 2²⁵, four times more than 20/20.

Warning: memory is the real ceiling. 2²⁰ \`long long\` values is 8 MB per half, which is fine; 2²⁵ is 256 MB per half, which is not. Sort in place and avoid keeping both the sorted and unsorted copies.

Common mistake: writing \`if (x > target) continue;\` in the recombination loop. That is only valid when all values are non-negative — with negatives in play a left sum above the target can still be rescued by a negative right partner, and the guard silently discards valid answers. Also watch \`target - x\` for overflow when \`x\` is large in magnitude.

A prefix-maximum array over the sorted right half generalises this to "best \`y\` at most \`t\`" when the sorted key and the optimised value differ — for instance, sorting by weight and taking the best value seen so far.`,
  ],
  code: [
    {
      language: "cpp",
      caption: "Meet in the middle: maximum subset sum not exceeding a target, n ≈ 40",
      source: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

// Largest achievable subset sum that does not exceed \`target\`.
// PRECONDITION: the objective is additive and the halves are independent --
// no cross-half constraints. Values MAY be negative; no assumption on magnitude.
//
// O(2^(n/2) * n) time, O(2^(n/2)) space. n up to ~40.
ll maxSubsetSumAtMost(const vector<ll>& a, ll target) {
    int n = a.size(), h = n / 2;   // split as evenly as possible: cost is 2^max(h, n-h)

    // All 2^k subset sums of a[lo..hi). O(2^k) via the low-bit recurrence
    // (the naive inner bit loop would be O(2^k * k)).
    auto enumerate = [&](int lo, int hi) {
        int k = hi - lo;
        vector<ll> s(size_t(1) << k, 0);
        for (int mask = 1; mask < (1 << k); ++mask) {
            int b = __builtin_ctz(mask);              // lowest set bit
            s[mask] = s[mask & (mask - 1)] + a[lo + b];
        }
        return s;
    };

    vector<ll> L = enumerate(0, h), R = enumerate(h, n);
    sort(R.begin(), R.end());

    ll best = LLONG_MIN;
    for (ll x : L) {
        // NOTE: no "if (x > target) continue" -- with negative values a large x
        // can still be rescued by a negative partner. Correct for any signs.
        auto it = upper_bound(R.begin(), R.end(), target - x);
        if (it != R.begin()) best = max(best, x + *prev(it));   // largest y <= target - x
    }
    return best;   // >= 0 whenever the empty subset is allowed and target >= 0
}`,
    },
    {
      language: "cpp",
      caption: "Counting variant: how many subsets sum to exactly the target",
      source: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

// Number of subsets of \`a\` whose sum is exactly \`target\`.
// Same split, but equal_range replaces the "largest y <= t" search.
// O(2^(n/2) * n) time, O(2^(n/2)) space.
ll countSubsetsWithSum(const vector<ll>& a, ll target) {
    int n = a.size(), h = n / 2;

    auto enumerate = [&](int lo, int hi) {
        int k = hi - lo;
        vector<ll> s(size_t(1) << k, 0);
        for (int mask = 1; mask < (1 << k); ++mask)
            s[mask] = s[mask & (mask - 1)] + a[lo + __builtin_ctz(mask)];
        return s;
    };

    vector<ll> L = enumerate(0, h), R = enumerate(h, n);
    sort(R.begin(), R.end());

    ll total = 0;
    for (ll x : L) {
        auto range = equal_range(R.begin(), R.end(), target - x);
        total += (ll)(range.second - range.first);   // every matching partner counts
    }
    return total;   // includes the empty subset when target == 0
}`,
    },
  ],
  cheatSheet: [
    "Trigger: n ≈ 30–45 with an additive objective and no cross-half constraints. 2⁴⁰ → 2·2²⁰.",
    "Split evenly — cost is 2^max(k1, k2), so 25/15 is 4× worse than 20/20.",
    "O(2^(n/2)·n) time, O(2^(n/2)) space; the sort dominates the recombination.",
    "Enumerate in O(2^k): `s[mask] = s[mask & (mask-1)] + a[ctz(mask)]`.",
    "Max ≤ target → `upper_bound` then `prev`; exact count → `equal_range`.",
    "No assumption on values (negatives and huge magnitudes fine) — that is why it beats sum-indexed DP.",
  ],
  interviewQA: [
    {
      q: "Given 40 integers, find the largest subset sum that does not exceed a target. The values are up to 10⁹.",
      a: "Brute force is 2⁴⁰, about 10¹², and the classic sum-indexed subset-sum DP is unusable because the values are up to 10⁹ so the table would be astronomically wide. Meet in the middle handles it. I split the array into halves of 20, enumerate all 2²⁰ subset sums of each half, sort the right half's sums, and then for every left sum x binary-search the right array for the largest y with y ≤ target - x, tracking the best x + y. Enumeration is 2^20 per side using the low-bit recurrence s[mask] = s[mask without its lowest bit] + a[index of that bit], which is O(2^k) rather than O(2^k · k). The sort and the search loop are each 2²⁰ · 20, so the total is O(2^(n/2) · n) time and O(2^(n/2)) space — roughly a million elements per side, 8 MB each, entirely practical. The precondition is that the objective decomposes additively and the halves are independent, which subset sum satisfies. Two details I would be careful about: I would split as evenly as possible since the cost is 2 to the max half size, and I would not add a shortcut skipping left sums above the target, because with negative values a negative partner can still bring the total under.",
      followUps: [
        "What kinds of problems is this not applicable to?",
        "How would you count subsets with an exact sum instead?",
      ],
    },
    {
      q: "When does meet in the middle fail to apply, even though n is around 40?",
      a: "It fails whenever the two halves are not independent. The technique enumerates each half in isolation and then recombines by a single scalar, so it requires that the objective be f(left) + f(right) and that fixing the left choices does not change which right choices are legal. Subset sum, subset XOR, counting subsets with a given sum, and 4-sum all satisfy that. A knapsack with pairwise conflicts between items does not, because whether a right item may be taken depends on which left items were taken — the recombination would need to carry the entire conflict state, which is the exponential blow-up you were trying to avoid. Similarly a TSP path cannot be cut in half this way, since the cost of the right portion depends on which vertex the left portion ended at. The workaround, when there are only a handful of cross-half interactions, is to branch on those explicitly and run meet in the middle inside each branch, which multiplies the cost by 2 to the number of interactions. The other failure mode is purely resource-based: the memory ceiling. At n = 50, 2²⁵ long long values is 256 MB per half, so even though the time might be tolerable the space is not.",
    },
  ],
  flashcards: [
    {
      front: "Meet in the middle: complexity, and what n range signals it?",
      back: "O(2^(n/2)·n) time, O(2^(n/2)) space. n ≈ 30–45 — where 2ⁿ is impossible but 2^(n/2) is around 10⁶.",
    },
    {
      front: "What is the precondition for splitting a problem in half this way?",
      back: "The objective must be additive across the split AND the halves independent — a left-half choice must not constrain which right-half choices are legal. Rules out cross-item conflicts and TSP-style path state.",
    },
    {
      front: "Why does meet in the middle beat the sum-indexed subset-sum DP?",
      back: "It makes no assumption about the values. The DP's table width scales with the target sum, so it dies on values around 10⁹; MITM handles huge and negative values identically.",
    },
  ],
};
