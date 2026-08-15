import type { TopicContent } from "../types";

export const dpSpaceOptimization: TopicContent = {
  quickSummary: [
    "If the transition only reads the previous row (or the previous k rows), you never need the whole table — keep 2 rows, or 1 row updated in place.",
    "Time is unchanged; space drops from O(n·m) to O(m). Always roll along the **smaller** dimension.",
    "In-place rolling is only correct with the right loop direction: **backwards** when the transition reads `dp[j - w]` from the previous row, forwards when it should read the current one.",
  ],
  detailed: [
    "The reduction is mechanical. Look at the recurrence and list every state it reads. If `dp[i][*]` only mentions `dp[i-1][*]`, then row `i-2` is dead the moment row `i` starts, so two arrays suffice: compute `curr` from `prev`, then `prev = move(curr)`. That is the safest form — it always works and needs no reasoning about loop direction.\n\nKey insight: rolling changes the *representation*, never the recurrence. If the two-row version disagrees with the full table, the bug is in the index mapping, not in the DP.",
    "## Going from two rows to one\n\nA single array works when each cell of row `i` reads at most one cell of row `i-1` plus cells of row `i` already written. Then `dp[j]` doubles as \"row `i-1` at `j`\" before the write and \"row `i` at `j`\" after it. Direction decides which meaning you get:\n\n| Transition reads | Sweep | Effect |\n|---|---|---|\n| `dp[i-1][j-w]` (previous row) | **descending** `j` | 0/1 — each item used once |\n| `dp[i][j-w]` (current row) | **ascending** `j` | unbounded — item reusable |\n| `dp[i-1][j]` and `dp[i][j-1]` | ascending `j` | grid DP: above and left, both correct |\n\nCommon mistake: copy-pasting a 0/1 knapsack inner loop and flipping it to ascending \"for readability\". That silently converts it into the unbounded problem — it still compiles and still returns plausible numbers.",
    "## When you must keep the full table\n\nRolling destroys history, so it rules out anything that needs to walk back through the decisions:\n\n1. **Path reconstruction** — recovering *which* items, *which* cells, or the actual LCS string.\n2. **Answering queries against intermediate rows** afterwards.\n3. **Non-adjacent dependencies** — a transition reading `dp[i-1]` and `dp[i/2]`, or interval DP where `dp[l][r]` reads arbitrary shorter intervals in the same table.\n\nIn practice: two escape hatches exist. Store a compact `choice[i][j]` bit-array instead of the full value table, or use Hirschberg's divide-and-conquer, which reconstructs an LCS alignment in O(n·m) time and only O(min(n, m)) space.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Three forms of the same 0/1 knapsack — full table, two rows, one row",
      source: `// A) Full table: O(n*W) time, O(n*W) space. Keeps history for reconstruction.
int knapFull(const vector<int>& wt, const vector<int>& val, int W) {
    int n = (int)wt.size();
    vector<vector<int>> dp(n + 1, vector<int>(W + 1, 0));
    for (int i = 1; i <= n; ++i)
        for (int j = 0; j <= W; ++j) {
            dp[i][j] = dp[i - 1][j];                                  // skip
            if (wt[i - 1] <= j)
                dp[i][j] = max(dp[i][j], val[i - 1] + dp[i - 1][j - wt[i - 1]]);
        }
    return dp[n][W];
}

// B) Two rows: O(W) space. Always safe -- no loop-direction reasoning needed.
int knapTwoRows(const vector<int>& wt, const vector<int>& val, int W) {
    int n = (int)wt.size();
    vector<int> prev(W + 1, 0), curr(W + 1, 0);
    for (int i = 1; i <= n; ++i) {
        for (int j = 0; j <= W; ++j) {
            curr[j] = prev[j];
            if (wt[i - 1] <= j)
                curr[j] = max(curr[j], val[i - 1] + prev[j - wt[i - 1]]);
        }
        prev = curr;                       // or swap(prev, curr)
    }
    return prev[W];
}

// C) One row in place: O(W) space, half the traffic of (B).
// The DESCENDING sweep keeps dp[j - wt] on the PREVIOUS row => used once.
int knapOneRow(const vector<int>& wt, const vector<int>& val, int W) {
    vector<int> dp(W + 1, 0);
    for (size_t i = 0; i < wt.size(); ++i)
        for (int j = W; j >= wt[i]; --j)   // flip to ascending => UNBOUNDED knapsack
            dp[j] = max(dp[j], val[i] + dp[j - wt[i]]);
    return dp[W];
}`,
    },
    {
      language: "cpp",
      caption: "Keeping only the choices — O(n·W) bits instead of O(n·W) ints",
      source: `// When reconstruction is required but the value table will not fit,
// store one bit per state instead of a full int.
// Time O(n*W).  Space O(W) ints + O(n*W) bits.
vector<int> knapWithItems(const vector<int>& wt, const vector<int>& val, int W) {
    int n = (int)wt.size();
    vector<int> dp(W + 1, 0);
    vector<vector<char>> took(n, vector<char>(W + 1, 0));   // 1 bit per state

    for (int i = 0; i < n; ++i)
        for (int j = W; j >= wt[i]; --j)
            if (val[i] + dp[j - wt[i]] > dp[j]) {
                dp[j] = val[i] + dp[j - wt[i]];
                took[i][j] = 1;
            }

    // Walk backwards through the choices to recover the chosen items.
    vector<int> chosen;
    int j = W;
    for (int i = n - 1; i >= 0; --i)
        if (took[i][j]) { chosen.push_back(i); j -= wt[i]; }
    reverse(chosen.begin(), chosen.end());
    return chosen;
}`,
    },
  ],
  cheatSheet: [
    "Reads only row `i-1` ⇒ two arrays (`prev`, `curr`). Reads only `dp[j]` and `dp[j−w]` ⇒ one array in place.",
    "**Descending inner loop = previous row = 0/1. Ascending = current row = unbounded.**",
    "Time never changes; space O(n·m) → O(min(n, m)). Roll the shorter dimension.",
    "Full table still required for: path reconstruction, queries on old rows, non-adjacent or interval dependencies.",
    "Need the path but not the memory? Store a `choice` bit per state, or use Hirschberg — O(n·m) time, O(min(n, m)) space.",
  ],
  interviewQA: [
    {
      q: "Walk through reducing a 2D DP to 1D and say exactly when it is unsafe.",
      a: "First I write down which states the transition reads. If row `i` only reads row `i-1`, everything older is dead, so two arrays `prev` and `curr` are enough — that form is always safe because the two rows are physically distinct. Compressing further to one array is only valid when each cell reads at most one cell of the previous row plus cells of the current row already written, and then the loop direction carries the meaning: descending `j` keeps `dp[j - w]` on the previous row, giving 0/1 semantics, while ascending `j` reads the already-updated current row and gives unbounded semantics. Time is unaffected in every case; space goes from O(n·m) to O(min(n, m)), and I roll along the smaller dimension. It is unsafe whenever I need history: reconstructing the chosen items or the actual path, answering later queries about intermediate rows, or when the recurrence reaches non-adjacent states — interval DP where `dp[l][r]` reads arbitrary shorter intervals cannot be rolled at all.",
      followUps: [
        "How would you verify a rolled implementation against the full table?",
        "Which is faster in practice, two rows or one row in place?",
      ],
    },
    {
      q: "You need the actual sequence of choices but the full table does not fit in memory. What are your options?",
      a: "Three options, in increasing sophistication. First, store choices rather than values: one bit or byte per state saying whether the item was taken, alongside a rolled value array. That is O(n·W) bits instead of O(n·W) ints — an 8- to 32-fold reduction, often enough, and reconstruction is a simple backward walk. Second, recompute: keep the rolled DP, and once you know the optimal value, re-derive the path by rerunning the DP over shrinking prefixes; that costs an extra factor but no extra memory. Third, and best for sequence alignment problems, Hirschberg's algorithm: split the first string at its midpoint, compute forward and backward rolled DP rows to find where the optimal alignment crosses, and recurse on the two halves. That gives the full alignment in O(n·m) time — about twice the constant of the plain DP — with only O(min(n, m)) space. I would pick the choice-bits approach unless the table is genuinely enormous, since it is far easier to get right under interview conditions.",
      followUps: [
        "Why does Hirschberg's recursion still total O(n·m) rather than O(n·m·log n)?",
        "How much memory does the choice-bit table actually save for n = m = 10^4?",
      ],
    },
  ],
  flashcards: [
    {
      front: "The rule for dropping a DP dimension",
      back: "If the transition reads only the previous row, keep two rows (always safe) — or one row in place when each cell reads one previous-row cell plus already-written current-row cells.",
    },
    {
      front: "Loop direction in an in-place 1D DP",
      back: "Descending inner loop ⇒ `dp[j-w]` is still the previous row ⇒ 0/1, item used once. Ascending ⇒ current row ⇒ unbounded, item reusable.",
    },
    {
      front: "When can you NOT roll the table away?",
      back: "Path reconstruction, queries against intermediate rows, and non-adjacent or interval dependencies. Workarounds: store choice bits, or Hirschberg — O(n·m) time, O(min(n,m)) space.",
    },
  ],
};
