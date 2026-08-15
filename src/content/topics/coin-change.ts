import type { TopicContent } from "../types";

export const coinChange: TopicContent = {
  quickSummary: [
    "Two different questions share one table: **fewest coins** to make `amount`, and **how many ways** to make it. Both are O(n·amount) time, O(amount) space.",
    "Coins are unbounded (reusable), so the capacity loop runs **forward** — that is what lets a coin be picked again in the same state chain.",
    "Loop order decides the counting semantics: **coins outside** counts combinations, **coins inside** counts permutations. This is the single most tested detail in the topic.",
  ],
  detailed: [
    "Min-coins uses `dp[x]` = fewest coins summing exactly to `x`, with `dp[0] = 0` and every other entry starting at an `INF` sentinel meaning *unreachable*. The transition is `dp[x] = min(dp[x], dp[x - c] + 1)` for each coin `c ≤ x`. At the end, `dp[amount] == INF` means no combination exists — return -1, not `INF`.\n\nWarning: use `INF = amount + 1` rather than `INT_MAX`. `INT_MAX + 1` overflows, and any real answer is at most `amount` coins, so `amount + 1` is a safe \"impossible\" marker that survives the `+ 1`.",
    "## Why the coin loop must be outside for combinations\n\nWith coins on the outer loop, coin `c` is fully processed before coin `c'` is ever considered, so every counted sequence uses the coins in a fixed order — `{1,2}` and `{2,1}` collapse into one. That counts **combinations** (multisets).\n\nSwap the loops so the amount is outside and the coin inside, and at each amount every coin gets a chance to be the *last* one added, which distinguishes `1+2` from `2+1`. That counts **permutations** (ordered sequences).\n\nKey insight: the outer loop is the axis you never revisit. Coins outside = each coin considered once = order forgotten. Amount outside = coins re-offered at every amount = order remembered.",
    "## Min-coins is order-blind\n\nFor the *minimum* version the loop order does not matter, because `min` is idempotent and commutative — counting the same solution twice changes nothing. Only the counting version is sensitive. That asymmetry is what makes the mistake so easy to miss: people write min-coins with either loop order, it passes, and then reuse the same shape for count-ways and get the wrong number.\n\nCommon mistake: nesting `for amount { for coin }` in the count-ways version and reporting permutations when the problem asked for combinations. For example, amount 3 with coins {1,2} has **2** combinations but **3** permutations.",
    "This is the unbounded sibling of the 0/1 family. Change the inner loop to run **backwards** and each coin can be used at most once — that is exactly **Subset Sum** and **0/1 Knapsack**, the natural next step.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Minimum coins — INF sentinel, forward loop (unbounded)",
      source: `// Fewest coins summing to exactly 'amount'; -1 if impossible.
// Time O(n * amount).  Space O(amount).
int coinChangeMin(const vector<int>& coins, int amount) {
    const int INF = amount + 1;           // safe: any real answer <= amount
    vector<int> dp(amount + 1, INF);
    dp[0] = 0;                            // base case: zero coins make 0

    for (int c : coins) {
        for (int x = c; x <= amount; ++x) {   // FORWARD => coin reusable
            // dp[x - c] may already include coin c -> unbounded supply
            if (dp[x - c] + 1 < dp[x]) dp[x] = dp[x - c] + 1;
        }
    }
    return dp[amount] >= INF ? -1 : dp[amount];
}`,
    },
    {
      language: "cpp",
      caption: "Count ways — combinations vs permutations is just the loop order",
      source: `// COMBINATIONS: {1,2} and {2,1} count once. Coin loop OUTSIDE.
// Time O(n * amount).  Space O(amount).
long long countCombinations(const vector<int>& coins, int amount) {
    vector<long long> dp(amount + 1, 0);
    dp[0] = 1;                            // one way to make 0: take nothing

    for (int c : coins)                   // <-- coin fixed for a whole sweep
        for (int x = c; x <= amount; ++x)
            dp[x] += dp[x - c];
    return dp[amount];
}

// PERMUTATIONS: {1,2} and {2,1} count separately. Coin loop INSIDE.
long long countPermutations(const vector<int>& coins, int amount) {
    vector<long long> dp(amount + 1, 0);
    dp[0] = 1;

    for (int x = 1; x <= amount; ++x)     // <-- every coin re-offered here
        for (int c : coins)
            if (c <= x) dp[x] += dp[x - c];
    return dp[amount];
}

// coins = {1,2}, amount = 3:
//   countCombinations -> 2   ({1,1,1}, {1,2})
//   countPermutations -> 3   (1+1+1, 1+2, 2+1)`,
    },
  ],
  cheatSheet: [
    "Min-coins: `dp[0]=0`, rest `INF = amount+1`; `dp[x] = min(dp[x], dp[x-c] + 1)`; return -1 if still ≥ INF.",
    "Count-ways: `dp[0] = 1` (the empty selection), then `dp[x] += dp[x-c]`.",
    "**Coins outside → combinations. Amount outside → permutations.** Min-coins is immune to the order.",
    "Forward capacity loop = unbounded reuse. Backward = 0/1, use each coin once.",
    "O(n·amount) time, O(amount) space. Counting overflows fast — use `long long` or take a modulus.",
  ],
  interviewQA: [
    {
      q: "In coin change, why must the coin loop be the outer loop when counting combinations?",
      a: "Because the outer loop is the axis you commit to and never revisit. With coins outside, the table is fully updated for coin `c` before coin `c'` is even seen, so every counted way uses the coins in one canonical order — non-decreasing by coin index. `1+2` and `2+1` therefore collapse to the same entry, which is exactly what a combination means. If I put the amount outside and the coin inside, then at every amount `x` each coin gets a chance to be the last one added, so the same multiset is reached along several distinct orderings and each is counted — that is a permutation count. Concretely, coins {1,2} with amount 3 gives 2 combinations but 3 permutations. Both versions are O(n·amount) time and O(amount) space; only the semantics differ. Note that the *minimum*-coins version is insensitive to loop order, because taking a min of duplicated candidates is harmless — which is precisely why people copy the wrong loop nest into the counting version.",
      followUps: [
        "How would you count combinations if each coin could be used at most once?",
        "Where would you apply a modulus, and why does it not break correctness?",
      ],
    },
    {
      q: "Why initialise the min-coins table to `amount + 1` rather than INT_MAX?",
      a: "The transition is `dp[x] = min(dp[x], dp[x - c] + 1)`. If `dp[x - c]` holds INT_MAX, adding 1 is signed overflow, which is undefined behaviour in C++ and in practice wraps to a large negative number that then wins the `min` and corrupts the table. I need a sentinel that is (a) larger than any achievable answer and (b) safe to add 1 to. Since every coin is at least 1, no valid answer exceeds `amount` coins, so `amount + 1` satisfies both. At the end I test `dp[amount] >= INF` rather than `== INF`, because the sentinel may have been incremented along the way, and return -1 for the unreachable case. An alternative is to guard the transition with `if (dp[x - c] != INF)`, but the sized sentinel keeps the inner loop branch-free and is the version I prefer.",
      followUps: [
        "How would you also return which coins were used?",
        "What if coin values could be zero or negative?",
      ],
    },
  ],
  flashcards: [
    {
      front: "Coin change: combinations vs permutations",
      back: "Coin loop OUTSIDE, amount inside → combinations. Amount OUTSIDE, coin inside → permutations. Min-coins is unaffected by the order.",
    },
    {
      front: "Min-coins sentinel",
      back: "Initialise `dp` to `amount + 1` (not INT_MAX — `+1` would overflow). `dp[0] = 0`. Return -1 when `dp[amount] >= amount + 1`.",
    },
    {
      front: "Forward vs backward capacity loop",
      back: "Forward = unbounded supply (a coin may be reused); backward = 0/1, each item used at most once. Same table, one loop direction apart.",
    },
  ],
};
