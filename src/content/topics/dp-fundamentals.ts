import type { TopicContent } from "../types";

export const dpFundamentals: TopicContent = {
  quickSummary: [
    "A problem is DP when it has **optimal substructure** (answer built from answers to smaller instances) and **overlapping subproblems** (the same smaller instance is asked for many times).",
    "Write it in four fixed steps: **state → transition → base case → evaluation order**. Everything else is bookkeeping.",
    "Complexity is mechanical: *time = (number of states) × (cost per transition)*, *space = number of states* unless you roll a dimension away.",
  ],
  detailed: [
    "DP is recursion plus a memo, nothing more mystical than that. If a recursive solution is correct but exponential because it recomputes the same call, caching those calls makes it polynomial. If there is no repetition — as in plain binary search or merge sort — memoising buys nothing and the problem is divide-and-conquer, not DP.\n\nKey insight: the two conditions are separate tests. Greedy problems have optimal substructure without overlap; graph traversals can have overlap without a clean optimal substructure. You need both.",
    "## The four-step discipline\n\n1. **State** — what does `dp[...]` *mean*? Write it as an English sentence before writing code. `dp[i]` = \"the best answer considering the first `i` items\".\n2. **Transition** — how does one state read from strictly smaller states? This is the recurrence.\n3. **Base case** — the smallest states the transition cannot compute, filled directly.\n4. **Order** — evaluate states only after everything they depend on is final.\n\nCommon mistake: writing the loop first and inventing the meaning of `dp[i]` afterwards. Almost every DP bug traces back to a state whose definition was never pinned down, so the transition silently means two different things in two branches.",
    "## Top-down vs bottom-up\n\n| | Memoization (top-down) | Tabulation (bottom-up) |\n|---|---|---|\n| Order | implicit — recursion finds it | explicit — you write the loops |\n| Visits | only *reachable* states | every state in the table |\n| Risk | stack overflow on deep chains | wasted work on unreachable states |\n| Space trick | hard to roll dimensions | easy to drop to a rolling array |\n\nStart top-down when the recurrence is easy to see but the ordering is awkward (tree or graph shaped states). Convert to bottom-up when you need the constant factor or the space optimisation.",
    "## Counting states for complexity\n\nMultiply the ranges of every index in the state, then multiply by the work done inside one transition. `dp[i][w]` with `i ≤ n`, `w ≤ W` and an O(1) transition is **O(n·W) time, O(n·W) space** — and O(W) space once you keep only the previous row.\n\nWarning: O(n·W) is *pseudo-polynomial*, not polynomial. It scales with the numeric value of `W`, not the bits used to write it, which is why knapsack-style DP dies when capacities reach 10^18.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Same recurrence, three ways — naive, memoized, tabulated",
      source: `// Toy recurrence: f(n) = f(n-1) + f(n-2), to show the mechanics.

// 1) Naive recursion: O(2^n) time. Recomputes f(n-2) twice, f(n-3) three times...
long long naive(int n) {
    if (n <= 1) return n;
    return naive(n - 1) + naive(n - 2);
}

// 2) Memoization (top-down): each state computed once.
// Time O(n) states x O(1) transition. Space O(n) table + O(n) recursion stack.
long long memo(int n, vector<long long>& dp) {
    if (n <= 1) return n;                 // base case
    if (dp[n] != -1) return dp[n];        // already final
    return dp[n] = memo(n - 1, dp) + memo(n - 2, dp);
}
// call: vector<long long> dp(n + 1, -1); memo(n, dp);

// 3) Tabulation (bottom-up): loop in dependency order, no stack.
// Time O(n). Space O(n) -- and O(1) after rolling (see below).
long long table(int n) {
    if (n <= 1) return n;
    vector<long long> dp(n + 1);
    dp[0] = 0; dp[1] = 1;                 // base cases
    for (int i = 2; i <= n; ++i)          // order: i depends only on i-1, i-2
        dp[i] = dp[i - 1] + dp[i - 2];
    return dp[n];
}

// 4) Rolled to O(1) space: the transition reads only the last two states.
long long rolled(int n) {
    if (n <= 1) return n;
    long long a = 0, b = 1;
    for (int i = 2; i <= n; ++i) { long long c = a + b; a = b; b = c; }
    return b;
}`,
    },
  ],
  cheatSheet: [
    "DP = optimal substructure **and** overlapping subproblems. Missing either one means it is not DP.",
    "State → transition → base case → order. Say the state out loud in English first.",
    "Time = states × transition cost. Space = states (before rolling).",
    "Top-down: only reachable states, recursion stack. Bottom-up: full table, easy rolling.",
    "Sentinels: `-1` for \"not computed\", a large `INF` for \"unreachable minimum\", `0` for \"no way to do it\" when counting.",
  ],
  interviewQA: [
    {
      q: "How do you recognise that a problem needs DP rather than greedy?",
      a: "I check the two conditions. Optimal substructure means the optimal answer is composed of optimal answers to subproblems — both greedy and DP need that. The distinguishing test is whether a local choice can be committed to safely. Greedy works when one choice is provably always part of some optimal solution (an exchange argument). If I cannot make that argument — if taking the locally best item can be regretted later — then I must explore both branches, and if those branches revisit the same subproblems, that overlap is what makes memoisation turn an exponential search into a polynomial one. For example, in 0/1 knapsack no greedy ratio rule is safe, and the recursion on (index, remaining capacity) hits the same pair repeatedly, so it is DP with O(n·W) states.",
      followUps: [
        "How would you prove optimal substructure for a specific recurrence?",
        "What does it cost you if you use DP where greedy would have sufficed?",
      ],
    },
    {
      q: "When would you choose memoization over tabulation?",
      a: "Memoization when the state space is large but sparsely reached, or when the dependency order is awkward to express as loops — states over tree nodes, subsets reached only along valid paths, or recurrences with irregular jumps. The recursion discovers the order for me and only touches reachable states. I switch to tabulation when I need the constant factor (no call overhead, cache-friendly array walks), when recursion depth would overflow the stack — say 10^6 deep — or when I want to roll the table down to a single row for O(W) space, which is much harder to do top-down. In interviews I often write the memoized version first because it maps directly to the recurrence, then convert it once the recurrence is agreed.",
      followUps: [
        "How do you convert a top-down solution to bottom-up mechanically?",
        "What is the memory cost of deep recursion versus an explicit table?",
      ],
    },
  ],
  flashcards: [
    {
      front: "The two conditions for DP",
      back: "Optimal substructure (answer builds from optimal sub-answers) **and** overlapping subproblems (same sub-instance recurs). Both required — greedy has the first without the second mattering.",
    },
    {
      front: "How do you compute a DP's complexity?",
      back: "Time = (number of states) × (cost of one transition). Space = number of states, reducible if the transition only reads the previous layer.",
    },
    {
      front: "The four-step DP recipe",
      back: "1) Define the state in English. 2) Write the transition from smaller states. 3) Fill base cases. 4) Choose an evaluation order where dependencies are already final.",
    },
  ],
};
