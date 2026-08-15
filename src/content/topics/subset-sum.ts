import type { TopicContent } from "../types";

export const subsetSum: TopicContent = {
  quickSummary: [
    "`dp[w]` is a **boolean**: can some subset of the items seen so far sum to exactly `w`? Start with `dp[0] = true`.",
    "For 0/1 semantics (each item used at most once) the capacity loop must run **backwards** — forward reuses the item and silently solves the unbounded problem instead.",
    "O(n·S) time, O(S) space with S the target sum — pseudo-polynomial. Equal partition is just `subsetSum(total / 2)`; minimum difference reads the same table.",
  ],
  detailed: [
    "Subset sum is knapsack with the value axis deleted: there is nothing to maximise, only reachability. `dp[i][w]` = \"is `w` reachable using the first `i` items?\", with `dp[i][w] = dp[i-1][w] || dp[i-1][w - a[i-1]]` — skip the item, or take it. Since row `i` only reads row `i-1`, the table collapses to a single boolean array.\n\nKey insight: reachability makes the whole table a set of achievable sums, which is why one pass answers *many* questions — exact target, closest achievable sum, and the partition variants all read the same final array.",
    "## The reverse loop, and why it is not optional\n\nSweeping `w` downward means `dp[w - a[i]]` still describes the state *before* item `i` was offered, so item `i` is added at most once. Sweeping upward, `dp[w - a[i]]` may already contain item `i`, so the item gets used repeatedly — correct for unbounded coin change, wrong for 0/1.\n\nCommon mistake: writing `for (int w = a[i]; w <= S; ++w)` out of habit from coin change. It compiles, it runs, and it reports that `{3}` can reach 9. Loop down to `a[i]` and stop.",
    "## The two classic variants\n\n- **Equal partition** — split the array into two equal-sum halves. If `total` is odd the answer is immediately false; otherwise it is exactly `subsetSum(total / 2)`.\n- **Minimum difference** — after filling `dp` up to `total / 2`, scan downward for the largest reachable `s`; the best split is `total − 2·s`. One table, no second pass.\n\nIn practice: for feasibility-only problems, `std::bitset<MAXS>` replaces the loop entirely — `bits |= bits << a[i]` is the same recurrence at 64 sums per word, cutting the runtime by a large constant factor.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Subset sum and equal partition — reverse capacity loop",
      source: `// Can some subset of 'a' sum to exactly S?
// Time O(n*S).  Space O(S).
bool subsetSum(const vector<int>& a, int S) {
    vector<char> dp(S + 1, 0);
    dp[0] = 1;                            // the empty subset reaches 0

    for (int x : a)
        for (int w = S; w >= x; --w)      // DOWNWARD => each item used once
            if (dp[w - x]) dp[w] = 1;     // dp[w-x] is still the previous row
    return dp[S];
}

// Split the array into two subsets of equal sum?
bool canPartition(const vector<int>& a) {
    int total = 0;
    for (int x : a) total += x;
    if (total % 2) return false;          // odd total can never split evenly
    return subsetSum(a, total / 2);
}`,
    },
    {
      language: "cpp",
      caption: "Minimum subset-sum difference — read the same table backwards",
      source: `// Partition 'a' into two subsets minimising |sum1 - sum2|.
// If one side sums to s <= total/2, the difference is total - 2*s,
// so we want the LARGEST reachable s <= total/2.
// Time O(n*total).  Space O(total).
int minSubsetDifference(const vector<int>& a) {
    int total = 0;
    for (int x : a) total += x;
    int half = total / 2;

    vector<char> dp(half + 1, 0);
    dp[0] = 1;
    for (int x : a)
        for (int w = half; w >= x; --w)
            if (dp[w - x]) dp[w] = 1;

    for (int s = half; s >= 0; --s)       // first hit is the best split
        if (dp[s]) return total - 2 * s;
    return total;                          // unreachable: dp[0] always true
}`,
    },
  ],
  cheatSheet: [
    "`dp[0] = true`; for each item sweep `w` from `S` down to `a[i]`: `dp[w] |= dp[w - a[i]]`.",
    "**Backward loop = 0/1 (use once). Forward loop = unbounded (reuse).** One character apart.",
    "O(n·S) time, O(S) space — pseudo-polynomial, dies when S is huge.",
    "Equal partition: odd total ⇒ false; else `subsetSum(total / 2)`.",
    "Min difference: largest reachable `s ≤ total/2`, answer `total − 2·s`. Feasibility only ⇒ use `bitset`: `b |= b << a[i]`.",
  ],
  interviewQA: [
    {
      q: "Why must the capacity loop run backwards in 1D subset sum?",
      a: "The 1D array is a compressed two-row table: before item `i` is processed, `dp` holds row `i-1`, and the transition `dp[w] |= dp[w - a[i]]` must read row `i-1` on the right-hand side. Sweeping `w` downward guarantees that, because `w - a[i]` is smaller than `w` and has not been touched yet in this item's sweep — it still describes the state without item `i`, so the item is added at most once. Sweeping upward, `dp[w - a[i]]` may already have been updated during this same sweep, meaning it already includes item `i`; taking it again uses the item twice. That is not a subtle inefficiency, it is a different problem — the forward loop correctly solves *unbounded* subset sum. So the loop direction is the whole 0/1-versus-unbounded distinction, and it is the first thing I check when a knapsack-family solution returns too-large answers.",
      followUps: [
        "How would you reconstruct which items form the subset?",
        "What changes if each item has a bounded count k rather than 1 or infinity?",
      ],
    },
    {
      q: "Solve minimum subset-sum difference and explain the complexity honestly.",
      a: "If one subset sums to `s`, the other sums to `total − s` and the difference is `|total − 2s|`, minimised by making `s` as close to `total/2` as possible from below. So I run standard 0/1 subset-sum reachability up to `half = total/2`, then scan downward from `half` for the first reachable `s` and return `total − 2s`. One table, no second DP. Time is O(n·total) and space O(total). I would flag that this is pseudo-polynomial, not polynomial: the cost scales with the numeric value of `total`, not with the input size in bits. With `n = 100` and values up to 10^9 the table is impossible, and the problem becomes NP-hard in general — at that scale I would switch to meet-in-the-middle at O(2^(n/2)) instead. If only feasibility matters and `total` is a few million, a `std::bitset` with `b |= b << a[i]` keeps the same asymptotics but runs about 64 times faster.",
      followUps: [
        "Why is O(n·S) called pseudo-polynomial?",
        "How does meet-in-the-middle work for this problem?",
      ],
    },
  ],
  flashcards: [
    {
      front: "0/1 subset sum, 1D form",
      back: "`dp[0]=true`; for each item, `for (w = S; w >= x; --w) dp[w] |= dp[w-x];`. Backward loop keeps the right-hand side on the previous row. O(n·S) time, O(S) space.",
    },
    {
      front: "Equal-sum partition in one line",
      back: "Odd total ⇒ impossible. Otherwise it is exactly `subsetSum(total / 2)` — the two halves are forced once one reaches half.",
    },
    {
      front: "Minimum subset-sum difference formula",
      back: "Find the largest reachable `s ≤ total/2`; the answer is `total − 2·s`. Same reachability table, scanned downward.",
    },
  ],
};
