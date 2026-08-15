import type { TopicContent } from "../types";

export const knuthOptimization: TopicContent = {
  quickSummary: [
    "For interval DPs `dp[i][j] = min over k in [i, j) of (dp[i][k] + dp[k+1][j]) + C(i, j)`, restricting k to `[opt[i][j-1], opt[i+1][j]]` cuts O(n³) down to O(n²). Space stays O(n²).",
    "**Precondition:** the two-sided argmin sandwich `opt[i][j-1] ≤ opt[i][j] ≤ opt[i+1][j]`, which follows when C satisfies the quadrangle inequality *and* is monotone on nested intervals.",
    "Classic instances: optimal binary search trees, merging n files/stones with cost equal to the merged size, and optimal alphabetic coding.",
  ],
  detailed: [
    `Interval DP over all O(n²) intervals with an inner split loop is O(n³): for each interval [i, j] you try every split point k. Knuth's observation is that the *optimal* split point is sandwiched by the optimal split points of the two intervals one shorter — it cannot be left of \`opt[i][j-1]\` nor right of \`opt[i+1][j]\`.

So the inner loop shrinks from \`j - i\` candidates to \`opt[i+1][j] - opt[i][j-1] + 1\`. That looks like a constant-factor win but it is asymptotic: sum those widths across all intervals of a fixed length and the bounds telescope, leaving O(n) work per length and O(n²) overall.`,
    `## Why the widths telescope

Fix a length L and sum the inner-loop widths over all intervals of that length:

\`\`\`
sum over i of (opt[i+1][i+L] - opt[i][i+L-1] + 1)
\`\`\`

Consecutive terms cancel — \`opt[i+1][i+L]\` from one term is the subtrahend of a later one — so the whole sum collapses to roughly \`opt[last] - opt[first] + n\`, which is O(n). With n possible lengths, total time is **O(n²)**, and the two tables \`dp\` and \`opt\` give **O(n²)** space.

Key insight: the speedup comes entirely from the telescoping sum, not from any per-interval saving. Any individual interval may still scan a wide window; the guarantee is only about the total.`,
    `## Getting the precondition right

The sandwich \`opt[i][j-1] <= opt[i][j] <= opt[i+1][j]\` follows from two properties of the cost function C:

- **Quadrangle inequality:** \`C(a,c) + C(b,d) <= C(a,d) + C(b,c)\` for a ≤ b ≤ c ≤ d.
- **Monotone on nested intervals:** \`C(b,c) <= C(a,d)\` whenever a ≤ b ≤ c ≤ d.

For example, when \`C(i,j)\` is the sum of a non-negative array over [i, j], both hold immediately — which is why the merge-stones family is the textbook case.

Warning: the sandwich must be maintained by *your own* base cases too. Seed \`opt[i][i] = i\` before the length loop; leaving it at zero makes the lower bound bogus for length-2 intervals and the code quietly skips the true optimum.

Common mistake: forgetting to clamp the upper bound. \`opt[i+1][j]\` for a length-2 interval is \`opt[j][j] = j\`, but k must satisfy k < j — take \`min(j - 1, opt[i+1][j])\` or you read \`dp[j+1][j]\`, which is out of the intended triangle.

Knuth optimization is the interval-DP sibling of divide-and-conquer DP optimization. D&C handles *layered* DPs with a one-dimensional \`opt[i]\` per layer and gives O(n log n) per layer; Knuth handles *interval* DPs with the two-sided bound and gives O(n²) flat. Same underlying quadrangle inequality, different monotonicity statement, not interchangeable.`,
  ],
  code: [
    {
      language: "cpp",
      caption: "Knuth optimization on an interval DP — O(n²) time, O(n²) space",
      source: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

// Solves dp[i][j] = min over k in [i, j) of (dp[i][k] + dp[k+1][j]) + cost(i, j)
// for the whole range [0, n-1].
//
// PRECONDITION: opt[i][j-1] <= opt[i][j] <= opt[i+1][j].
// Sufficient: cost satisfies the quadrangle inequality
//   cost(a,c) + cost(b,d) <= cost(a,d) + cost(b,c)   for a <= b <= c <= d
// AND is monotone on nested intervals: cost(b,c) <= cost(a,d) for a <= b <= c <= d.
//
// O(n^2) time (the inner-loop widths telescope), O(n^2) space.
ll knuth(int n, const function<ll(int, int)>& cost) {
    vector<vector<ll>> dp(n, vector<ll>(n, 0));
    vector<vector<int>> opt(n, vector<int>(n, 0));

    // Base case: single elements cost nothing to "merge", and -- critically --
    // seed opt[i][i] = i so the length-2 lower bound is correct.
    for (int i = 0; i < n; ++i) opt[i][i] = i;

    for (int len = 2; len <= n; ++len) {
        for (int i = 0; i + len - 1 < n; ++i) {
            int j = i + len - 1;

            int lo = opt[i][j - 1];
            int hi = min(j - 1, opt[i + 1][j]);   // clamp: k must be < j
            if (lo > hi) lo = hi;                 // defensive; should not fire

            dp[i][j] = LLONG_MAX;
            for (int k = lo; k <= hi; ++k) {
                ll cand = dp[i][k] + dp[k + 1][j];
                if (cand < dp[i][j]) {
                    dp[i][j] = cand;
                    opt[i][j] = k;
                }
            }
            dp[i][j] += cost(i, j);               // cost added once, outside the scan
        }
    }
    return dp[0][n - 1];
}`,
    },
    {
      language: "cpp",
      caption: "Worked instance: minimum cost to merge adjacent stone piles",
      source: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

// Merging piles i..j always costs their total weight, so cost(i,j) = prefix sum.
// That cost is a sum over a non-negative array, which satisfies BOTH the
// quadrangle inequality and nested-interval monotonicity -- the precondition holds.
// O(n^2) time, O(n^2) space.
ll mergeStones(const vector<ll>& w) {
    int n = w.size();
    vector<ll> pre(n + 1, 0);
    for (int i = 0; i < n; ++i) pre[i + 1] = pre[i] + w[i];
    auto cost = [&](int i, int j) { return pre[j + 1] - pre[i]; };

    vector<vector<ll>> dp(n, vector<ll>(n, 0));
    vector<vector<int>> opt(n, vector<int>(n, 0));
    for (int i = 0; i < n; ++i) opt[i][i] = i;

    for (int len = 2; len <= n; ++len)
        for (int i = 0; i + len - 1 < n; ++i) {
            int j = i + len - 1;
            int lo = opt[i][j - 1], hi = min(j - 1, opt[i + 1][j]);
            dp[i][j] = LLONG_MAX;
            for (int k = lo; k <= hi; ++k)
                if (dp[i][k] + dp[k + 1][j] < dp[i][j]) {
                    dp[i][j] = dp[i][k] + dp[k + 1][j];
                    opt[i][j] = k;
                }
            dp[i][j] += cost(i, j);
        }
    return dp[0][n - 1];
}`,
    },
  ],
  cheatSheet: [
    "Shape: `dp[i][j] = min_{i≤k<j} (dp[i][k] + dp[k+1][j]) + C(i,j)` — interval DP, O(n³) naive.",
    "Precondition: `opt[i][j-1] ≤ opt[i][j] ≤ opt[i+1][j]` (from QI + nested-interval monotonicity of C).",
    "Inner loop becomes `for k in [opt[i][j-1], min(j-1, opt[i+1][j])]`.",
    "O(n²) time, O(n²) space — the widths telescope per length, giving O(n) per length.",
    "Seed `opt[i][i] = i` and clamp `hi` to `j-1`, or the bounds are wrong for length-2 intervals.",
    "Layered DP with a 1-D `opt[i]` instead → divide-and-conquer optimization, O(n log n) per layer.",
  ],
  interviewQA: [
    {
      q: "Merging n adjacent piles, where merging two piles costs their combined weight, has an O(n³) interval DP. How do you get it to O(n²)?",
      a: "Apply Knuth optimization. The DP is dp[i][j] = min over k in [i, j) of dp[i][k] + dp[k+1][j], plus the cost of the interval, which here is the prefix sum of the weights over [i, j]. Knuth's observation is that the optimal split point is sandwiched: opt[i][j-1] ≤ opt[i][j] ≤ opt[i+1][j]. So instead of scanning all j - i split points I scan only that window. The win is asymptotic rather than constant-factor because for a fixed interval length the window widths telescope — consecutive terms cancel — leaving O(n) work per length and O(n²) in total, with O(n²) space for the dp and opt tables. The precondition is what I would justify explicitly: the sandwich follows when the cost function satisfies the quadrangle inequality and is monotone on nested intervals, and a sum over a non-negative array satisfies both trivially, which is exactly why this problem family is the textbook case. Two implementation details bite people: you must seed opt[i][i] = i before the length loop, otherwise the lower bound is wrong for length-2 intervals, and you must clamp the upper bound to j - 1 because opt[i+1][j] can equal j.",
      followUps: [
        "Why does the total work telescope to O(n²)?",
        "When would you reach for divide-and-conquer optimization instead?",
      ],
    },
    {
      q: "Knuth optimization and divide-and-conquer DP optimization both rest on the quadrangle inequality. When do you use which?",
      a: "They apply to different DP shapes and consume different monotonicity statements. Knuth is for interval DPs, dp[i][j] over a contiguous range with an inner split point k, and it uses the two-sided sandwich opt[i][j-1] ≤ opt[i][j] ≤ opt[i+1][j] to shrink the split scan. It takes O(n³) to O(n²), with O(n²) space, and the classic instances are optimal binary search trees and merging adjacent piles. Divide-and-conquer optimization is for layered DPs, dp[k][i] depending on dp[k-1][j] for j < i, where each layer has a one-dimensional argmin opt[i]. It needs only that opt[i] is non-decreasing in i, and it computes a layer by recursion in O(n log n) instead of O(n²), so k layers cost O(k·n log n) with O(n) space if you roll the layers. The shared root is that the quadrangle inequality on the cost implies argmin monotonicity, but the one-dimensional statement D&C needs is weaker than Knuth's two-sided sandwich. They are not interchangeable — you cannot apply Knuth's bounds to a layered DP, and D&C's single recursion has nothing to say about a two-index interval table.",
    },
  ],
  flashcards: [
    {
      front: "Knuth optimization: what bound restricts the split point, and what does it cost?",
      back: "`opt[i][j-1] ≤ opt[i][j] ≤ opt[i+1][j]`. Scanning only that window takes the interval DP from O(n³) to O(n²) time, O(n²) space.",
    },
    {
      front: "What must the cost function C satisfy for Knuth optimization?",
      back: "The quadrangle inequality `C(a,c)+C(b,d) ≤ C(a,d)+C(b,c)` AND monotonicity on nested intervals `C(b,c) ≤ C(a,d)`, for a ≤ b ≤ c ≤ d. A sum over a non-negative array satisfies both.",
    },
    {
      front: "Why is Knuth O(n²) rather than just a faster O(n³)?",
      back: "For a fixed interval length the inner-loop widths telescope — consecutive bounds cancel — so all intervals of one length cost O(n) total, over n lengths.",
    },
  ],
};
