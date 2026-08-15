import type { TopicContent } from "../types";

export const divideConquerOptimization: TopicContent = {
  quickSummary: [
    "Applies to layered DPs `dp[k][i] = min over j < i of (dp[k-1][j] + C(j, i))`, cutting one layer from O(n²) to O(n log n) — total O(k·n log n) time, O(n) space per layer.",
    "**Precondition:** the argmin `opt[k][i]` must be non-decreasing in i. That is guaranteed when the cost `C` satisfies the quadrangle inequality `C(a,c) + C(b,d) ≤ C(a,d) + C(b,c)` for a ≤ b ≤ c ≤ d.",
    "Implementation is one recursion: `solve(l, r, optl, optr)` computes the midpoint's answer by scanning only `[optl, optr]`, then recurses left with the tightened upper bound and right with the tightened lower bound.",
  ],
  detailed: [
    `The target shape is a DP computed in layers, where layer k depends only on layer k-1: \`dp[k][i] = min over j < i of (dp[k-1][j] + C(j, i))\`. Splitting an array into exactly k contiguous groups to minimise a total group cost is the canonical instance.

Evaluated naively each layer costs O(n²). The optimisation exploits a structural fact about *where* the minimum is attained rather than about its value: if the optimal split point \`opt[k][i]\` never moves left as i moves right, then knowing \`opt\` at a midpoint immediately bounds \`opt\` for everything on either side.`,
    `## The recursion, and why it is O(n log n)

\`solve(l, r, optl, optr)\` promises that for every i in [l, r] the optimal j lies in [optl, optr]. Take \`mid\`, scan j across [optl, min(mid-1, optr)] to find both \`dp[mid]\` and its argmin \`best\`, then recurse on \`(l, mid-1, optl, best)\` and \`(mid+1, r, best, optr)\` — monotonicity is exactly what licenses those two tightened windows.

Each recursion level covers the index range [l, r] disjointly, and the candidate windows at one level overlap only at their shared endpoints, so a level does O(n) work in total. There are O(log n) levels, giving O(n log n) per layer and O(k·n log n) overall. Space is O(n) if you keep only the previous and current layer, plus O(log n) recursion stack.

Key insight: this never proves anything about the DP *values* — only about the location of the argmin. That is why it composes with any cost function you can evaluate in O(1), including ones you compute on the fly with a Mo's-algorithm-style moving window.`,
    `## Establishing the precondition

You need \`opt[i] <= opt[i+1]\`. Three ways to get there, in increasing order of rigour:

- **Prove the quadrangle inequality** on C: for all a ≤ b ≤ c ≤ d, \`C(a,c) + C(b,d) <= C(a,d) + C(b,c)\`. QI implies argmin monotonicity, which is the theorem doing the real work here. Costs built from sums over a submatrix of a non-negative array, or from convex functions of the interval length, usually satisfy it.
- **Check it empirically**: compute \`opt\` by brute force on random small inputs and assert it is non-decreasing.
- **Recognise the problem family**: k-way array partitioning, k-medians on a line, and "split into k segments minimising the sum of segment costs" almost always qualify.

Warning: monotone \`opt\` is an assumption the code cannot verify at runtime. If it fails, the recursion simply never examines the true optimum and returns a value that is too large — no crash, no assertion, just a wrong answer that looks plausible. Verify it before you trust the speedup.

Common mistake: confusing this with Knuth optimization. Divide and conquer applies to *layered* DPs with a one-dimensional \`opt[i]\` per layer and gives O(n log n) per layer; Knuth applies to *interval* DPs \`dp[i][j]\` with the two-sided bound \`opt[i][j-1] <= opt[i][j] <= opt[i+1][j]\` and gives O(n²) overall. They need different monotonicity statements and are not interchangeable.`,
  ],
  code: [
    {
      language: "cpp",
      caption: "Layered D&C optimization — note the recursion bounds and the empty-window guard",
      source: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

const ll INF = LLONG_MAX / 4;   // /4 so that INF + cost never overflows

int n;
vector<ll> prv, cur;            // prv = dp[k-1][*], cur = dp[k][*]

// Cost of taking elements (j, i] as one group. Must be O(1) here, e.g. via
// prefix sums. Replace with the problem's own cost.
ll cost(int j, int i);

// INVARIANT / PRECONDITION: for every i in [l, r], the optimal j lies in [optl, optr],
// which holds because opt[i] is non-decreasing in i.
// O(n log n) per layer, O(n) space per layer plus O(log n) stack.
void solve(int l, int r, int optl, int optr) {
    if (l > r) return;
    int mid = l + (r - l) / 2;

    ll bestVal = INF;
    int bestJ = -1;
    // j must satisfy j < mid, and monotonicity confines it to [optl, optr].
    int hi = min(mid - 1, optr);
    for (int j = optl; j <= hi; ++j) {
        if (prv[j] >= INF) continue;                 // layer k-1 unreachable at j
        ll cand = prv[j] + cost(j, mid);
        if (cand < bestVal) { bestVal = cand; bestJ = j; }
    }
    cur[mid] = bestVal;

    // If no candidate existed, bestJ is -1; fall back to optl so the recursion
    // bounds stay valid (and stay a superset of the true range).
    int pivot = (bestJ == -1 ? optl : bestJ);
    solve(l, mid - 1, optl, pivot);      // opt[i] <= opt[mid] for i < mid
    solve(mid + 1, r, pivot, optr);      // opt[i] >= opt[mid] for i > mid
}

// Full k-layer driver. Total O(k * n log n) time, O(n) space.
ll partitionIntoK(int k) {
    prv.assign(n + 1, INF);
    cur.assign(n + 1, INF);
    prv[0] = 0;                          // 0 elements, 0 groups
    for (int layer = 1; layer <= k; ++layer) {
        cur.assign(n + 1, INF);
        solve(1, n, 0, n - 1);
        prv.swap(cur);
    }
    return prv[n];
}`,
    },
    {
      language: "cpp",
      caption: "Sanity check: brute-force opt[] on small inputs and assert it is monotone",
      source: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

// Run this on random small n BEFORE trusting the D&C speedup. The optimisation
// cannot detect a violated precondition at runtime -- it just returns a value
// that is too large. O(n^2) per layer, which is the point: it is the reference.
bool optIsMonotone(int n, const vector<ll>& prv,
                   const function<ll(int, int)>& cost) {
    vector<int> opt(n + 1, -1);
    for (int i = 1; i <= n; ++i) {
        ll best = LLONG_MAX;
        for (int j = 0; j < i; ++j) {
            ll cand = prv[j] + cost(j, i);
            if (cand < best) { best = cand; opt[i] = j; }
        }
    }
    for (int i = 2; i <= n; ++i)
        if (opt[i] < opt[i - 1]) return false;   // precondition violated
    return true;
}`,
    },
  ],
  cheatSheet: [
    "Shape: `dp[k][i] = min_{j<i} (dp[k-1][j] + C(j,i))` — layered, one `opt[i]` per layer.",
    "Precondition: `opt[i]` non-decreasing in i; implied by QI `C(a,c)+C(b,d) ≤ C(a,d)+C(b,c)` for a≤b≤c≤d.",
    "`solve(l,r,optl,optr)`: scan j in `[optl, min(mid-1, optr)]`, recurse `(l,mid-1,optl,best)` and `(mid+1,r,best,optr)`.",
    "O(n log n) per layer, O(k·n log n) total; O(n) space with two rolling layers.",
    "A violated precondition gives a silently too-large answer — brute-force-verify `opt` on small n.",
    "Interval DP with `opt[i][j]` instead → use Knuth optimization, not this.",
  ],
  interviewQA: [
    {
      q: "Split an array into exactly k contiguous groups minimising the total group cost. The O(k·n²) DP is too slow. What do you do?",
      a: "The DP is layered: dp[k][i] = min over j < i of dp[k-1][j] + C(j, i). If the argmin opt[k][i] is non-decreasing in i, I can compute a whole layer with divide and conquer instead of a full scan. The routine solve(l, r, optl, optr) carries the promise that every i in [l, r] has its optimum inside [optl, optr]. It takes the midpoint, scans j only across that window to get both the value and the argmin, then recurses on the left half with the argmin as the new upper bound and the right half with it as the new lower bound. Each recursion level touches the index range disjointly and the candidate windows overlap only at endpoints, so a level is O(n) and there are O(log n) levels — O(n log n) per layer, O(k·n log n) in total, with O(n) space if I keep only the previous and current layer. The precondition is the whole skill: opt must be monotone, which is guaranteed if C satisfies the quadrangle inequality, C(a,c) + C(b,d) ≤ C(a,d) + C(b,c) for a ≤ b ≤ c ≤ d. Costs formed as sums over a submatrix of a non-negative array typically do. Because the code cannot check that at runtime and a violation just returns a too-large answer with no crash, I verify it by brute-forcing opt on small random inputs first.",
      followUps: [
        "How does this differ from Knuth optimization?",
        "What happens to the recursion bounds when no valid j exists for the midpoint?",
      ],
    },
    {
      q: "What exactly does the quadrangle inequality buy you, and what does it not?",
      a: "The quadrangle inequality is a statement about the cost function: for a ≤ b ≤ c ≤ d, C(a,c) + C(b,d) ≤ C(a,d) + C(b,c). Informally, the crossing pair of intervals is never cheaper than the nested pair. What it buys is monotonicity of the argmin — if C satisfies QI then opt[i] is non-decreasing in i — and that monotonicity is the only thing divide-and-conquer optimization actually consumes. What it does not buy is any bound on the DP values, any concavity of dp itself, or any guarantee that a greedy choice is correct. This distinction matters practically: the optimization is agnostic to how C is computed, so any O(1)-evaluable cost works, and if you can establish argmin monotonicity by some other argument you do not need QI at all. It is a sufficient condition, not a necessary one. Note also that QI plus monotonicity on intervals is the stronger precondition that Knuth optimization needs for the two-sided bound opt[i][j-1] ≤ opt[i][j] ≤ opt[i+1][j] on interval DPs — a different statement for a different DP shape.",
    },
  ],
  flashcards: [
    {
      front: "Precondition for divide-and-conquer DP optimization?",
      back: "The argmin `opt[i]` must be non-decreasing in i — guaranteed when the cost satisfies the quadrangle inequality `C(a,c)+C(b,d) ≤ C(a,d)+C(b,c)` for a ≤ b ≤ c ≤ d.",
    },
    {
      front: "Complexity of D&C optimization, and why?",
      back: "O(n log n) per layer, O(k·n log n) total, O(n) space. Each of the O(log n) recursion levels does O(n) work because the candidate windows overlap only at endpoints.",
    },
    {
      front: "What are the two recursive calls in `solve(l, r, optl, optr)`?",
      back: "After finding `best` = argmin at `mid`: `solve(l, mid-1, optl, best)` and `solve(mid+1, r, best, optr)`. Monotonicity is what makes both tightened windows valid.",
    },
  ],
};
