import type { TopicContent } from "../types";

export const linearDp: TopicContent = {
  quickSummary: [
    "One-dimensional state where `dp[i]` depends only on `dp[i-1]` and `dp[i-2]` — climbing stairs, house robber, and their variants.",
    "Every one of them is **O(n) time and O(1) space** once you keep two rolling variables instead of the full array.",
    "The circular house-robber trick: the first and last element can never both be taken, so run the linear solver twice and drop one end each time.",
  ],
  detailed: [
    "Linear DP is the smallest interesting DP shape: the state is a single position `i`, and the transition looks back a constant number of steps. Climbing stairs asks *how many ways* to reach step `i` — `dp[i] = dp[i-1] + dp[i-2]`, because the last move was either a 1-step or a 2-step. House robber asks for the *best value* under an adjacency constraint — `dp[i] = max(dp[i-1], dp[i-2] + a[i])`, the choice being skip or take.\n\nKey insight: counting problems sum the branches, optimisation problems take a max or min over them. Same skeleton, different combining operator.",
    "## Getting the base cases right\n\nWith `dp[i]` meaning \"best answer for the prefix `a[0..i]`\", the transition reads `dp[i-2]`, which is undefined at `i = 1`. Two clean fixes: either seed `dp[0] = a[0]`, `dp[1] = max(a[0], a[1])` and start the loop at `i = 2`, or shift to \"first `i` elements\" indexing with `dp[0] = 0`, `dp[1] = a[0]` so that `dp[i] = max(dp[i-1], dp[i-2] + a[i-1])` is valid for all `i ≥ 1`.\n\nCommon mistake: hand-rolling `prev`/`prev2` variables and forgetting the `n == 1` case. The prefix-shifted form has no special case at all, which is why it is worth the index arithmetic.",
    "## The circular variant\n\nWhen the houses are arranged in a circle, house `0` and house `n-1` are adjacent, so no valid selection contains both. Split on that fact: the answer is `max(linear(a[0 .. n-2]), linear(a[1 .. n-1]))`. The first run forbids the last house, the second forbids the first, and every valid circular selection is covered by at least one of them.\n\nWarning: guard `n == 1` before splitting — both slices would be empty and you would return 0 instead of `a[0]`.",
    "Once the transition looks back further than a couple of fixed positions — at *all* previous indices, or at a second dimension — you have left linear DP. That is the doorway to **Longest Increasing Subsequence** (O(n²) or O(n log n)) and to the knapsack family, where a capacity axis joins the position axis.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Climbing stairs and house robber — O(n) time, O(1) space",
      source: `// Climbing stairs: number of ways to reach step n using 1- or 2-steps.
// dp[i] = dp[i-1] + dp[i-2].  Time O(n), Space O(1).
long long climbStairs(int n) {
    if (n <= 1) return 1;                 // one empty way to stand at step 0/1
    long long prev2 = 1, prev1 = 1;       // dp[0], dp[1]
    for (int i = 2; i <= n; ++i) {
        long long cur = prev1 + prev2;
        prev2 = prev1;
        prev1 = cur;
    }
    return prev1;
}

// House robber: max sum with no two adjacent picks.
// Prefix-shifted state: dp[i] = best over the first i houses.
// dp[0] = 0, dp[i] = max(dp[i-1], dp[i-2] + a[i-1]).  No n==1 special case.
long long rob(const vector<int>& a) {
    long long prev2 = 0, prev1 = 0;       // dp[i-2], dp[i-1]
    for (int x : a) {
        long long cur = max(prev1, prev2 + x);
        prev2 = prev1;
        prev1 = cur;
    }
    return prev1;                          // Time O(n), Space O(1)
}`,
    },
    {
      language: "cpp",
      caption: "Circular house robber — run the linear solver twice",
      source: `// Same recurrence, restricted to the index window [l, r].
long long robRange(const vector<int>& a, int l, int r) {
    long long prev2 = 0, prev1 = 0;
    for (int i = l; i <= r; ++i) {
        long long cur = max(prev1, prev2 + a[i]);
        prev2 = prev1;
        prev1 = cur;
    }
    return prev1;
}

// Houses in a circle: index 0 and n-1 are adjacent, so they can never both
// be robbed. Every valid selection excludes at least one of them.
long long robCircular(const vector<int>& a) {
    int n = (int)a.size();
    if (n == 0) return 0;
    if (n == 1) return a[0];              // both slices would be empty
    return max(robRange(a, 0, n - 2),     // drop the last house
               robRange(a, 1, n - 1));    // drop the first house
}
// Two linear passes: Time O(n), Space O(1).`,
    },
  ],
  cheatSheet: [
    "Stairs: `dp[i] = dp[i-1] + dp[i-2]` (count → sum). Robber: `dp[i] = max(dp[i-1], dp[i-2] + a[i])` (optimise → max).",
    "Prefix-shifted state `dp[i]` = \"first `i` elements\" removes every base-case special case.",
    "O(n) time, O(1) space — two rolling variables, roll `prev2 = prev1` *before* `prev1 = cur`.",
    "Circular: `max(linear(0..n-2), linear(1..n-1))`, with an `n == 1` guard.",
    "k-step stairs: `dp[i] = sum(dp[i-1..i-k])` → O(n·k), or O(n) with a running window sum.",
  ],
  interviewQA: [
    {
      q: "Solve house robber, then extend it to houses arranged in a circle.",
      a: "Linear case: `dp[i]` is the best total over the first `i` houses. At each house I either skip it, keeping `dp[i-1]`, or rob it, which forbids house `i-1` and gives `dp[i-2] + a[i-1]`. So `dp[i] = max(dp[i-1], dp[i-2] + a[i-1])` with `dp[0] = dp[1] = 0` in the shifted indexing — O(n) time, and O(1) space with two rolling variables. For the circle, the only new fact is that house 0 and house n-1 are now adjacent, so no valid answer contains both. That means every valid selection is entirely inside `[0, n-2]` or entirely inside `[1, n-1]`, and the answer is the max of the linear solver over those two windows. I guard `n == 1` separately because both windows would be empty. Still O(n) time and O(1) space — just two passes.",
      followUps: [
        "How would you also recover *which* houses were robbed?",
        "What changes if the constraint is 'no two picks within distance k'?",
      ],
    },
    {
      q: "Climbing stairs and house robber have nearly the same recurrence. What is the actual difference, and why does it matter?",
      a: "The state and the branching are identical — at position `i` the last decision was one of a constant number of options, each pointing at a strictly earlier state. What differs is the combining operator: stairs *counts* paths so it sums the branches, robber *optimises* so it takes a max. That distinction drives everything downstream. Counting needs overflow care — `long long` or a modulus, since the values grow like Fibonacci — while optimisation needs a correct identity element, typically 0 for a max of non-negative values or a large `INF` for a min. It also changes what a base case means: for counting, `dp[0] = 1` denotes the one empty way, whereas for optimisation `dp[0] = 0` denotes an empty selection worth nothing. Getting that backwards is the single most common bug in this family.",
      followUps: [
        "Why does the stairs count equal a Fibonacci number?",
        "When would you need a modulus, and where exactly do you apply it?",
      ],
    },
  ],
  flashcards: [
    {
      front: "House robber recurrence",
      back: "`dp[i] = max(dp[i-1], dp[i-2] + a[i])` — skip or take, taking forbids the neighbour. O(n) time, O(1) space with two rolling variables.",
    },
    {
      front: "Circular house robber trick",
      back: "First and last are adjacent, so they can't both be taken: answer = `max(linear(0..n-2), linear(1..n-1))`. Special-case `n == 1`.",
    },
    {
      front: "Counting DP vs optimising DP — what changes?",
      back: "Only the combining operator (sum vs max/min) and the base-case identity (`dp[0] = 1` for the empty way vs `dp[0] = 0` for the empty selection).",
    },
  ],
};
