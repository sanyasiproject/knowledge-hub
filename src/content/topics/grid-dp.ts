import type { TopicContent } from "../types";

export const gridDp: TopicContent = {
  quickSummary: [
    "State is a cell: `dp[i][j]` = the answer for reaching `(i, j)`, combining the cell above and the cell to the left.",
    "Baseline is **O(m·n) time, O(m·n) space**; because each row reads only the row above, space drops to **O(n)** with a rolling row — or one in-place row.",
    "Obstacles are not a new algorithm: force `dp[i][j] = 0` (unreachable) for counting, or `INF` for minimisation, and the recurrence handles the rest.",
  ],
  detailed: [
    "Grid DP works because movement is restricted to directions that go strictly *forward* in the scan order — typically right and down. That restriction is what makes the dependency graph acyclic and lets a plain row-major double loop be a valid evaluation order: when you reach `(i, j)`, both `(i-1, j)` and `(i, j-1)` are already final.\n\nWarning: the moment moves can also go up or left, the dependencies form cycles and this is no longer DP. That is a shortest-path problem — use BFS on an unweighted grid or Dijkstra with weights.",
    "## The three standard variants\n\n- **Unique paths** — count: `dp[i][j] = dp[i-1][j] + dp[i][j-1]`, with the whole first row and first column set to 1.\n- **Minimum path sum** — optimise: `dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1])`, first row and column being prefix sums.\n- **Obstacles** — same as unique paths, but a blocked cell contributes nothing: set `dp[i][j] = 0` and continue. Once a first-row cell is blocked, every cell after it in that row is unreachable too, which falls out automatically.\n\nCommon mistake: initialising the first row of the obstacle variant to all 1s. It must stop at the first blocked cell — write the row with the recurrence rather than a blanket fill.",
    "## Rolling the space down to O(n)\n\nRow `i` reads only row `i-1` and cells already written in row `i`. Keep a single array `dp` of length `n` and sweep left to right: at column `j`, `dp[j]` still holds the value from the previous row (the cell above) and `dp[j-1]` already holds the current row (the cell to the left). So `dp[j] += dp[j-1]` *is* the unique-paths transition, in place.\n\nIn practice: always roll the *shorter* dimension — for an `m × n` grid use `min(m, n)` as the array length by transposing the loops if needed.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Unique paths with obstacles — in-place O(n) row",
      source: `// grid[i][j] == 1 means blocked. Count paths from (0,0) to (m-1,n-1)
// moving only right or down.
// Time O(m*n).  Space O(n) -- a single in-place row.
long long uniquePathsWithObstacles(const vector<vector<int>>& grid) {
    int m = (int)grid.size();
    if (m == 0) return 0;
    int n = (int)grid[0].size();

    vector<long long> dp(n, 0);
    dp[0] = (grid[0][0] == 1) ? 0 : 1;     // start may itself be blocked

    for (int i = 0; i < m; ++i) {
        for (int j = 0; j < n; ++j) {
            if (grid[i][j] == 1) {
                dp[j] = 0;                  // unreachable: kills this cell
            } else if (j > 0) {
                // dp[j]   = value from row i-1 (cell above)
                // dp[j-1] = value from row i   (cell to the left)
                dp[j] += dp[j - 1];
            }
            // j == 0 and not blocked: dp[0] keeps the cell above. Correct.
        }
    }
    return dp[n - 1];
}`,
    },
    {
      language: "cpp",
      caption: "Minimum path sum — rolling row with an INF sentinel",
      source: `// Minimum sum of cell values on a right/down path from (0,0) to (m-1,n-1).
// Time O(m*n).  Space O(n).
long long minPathSum(const vector<vector<int>>& grid) {
    int m = (int)grid.size();
    int n = (int)grid[0].size();
    const long long INF = LLONG_MAX / 4;   // /4 leaves room for additions

    vector<long long> dp(n, INF);
    for (int i = 0; i < m; ++i) {
        for (int j = 0; j < n; ++j) {
            if (i == 0 && j == 0)      dp[0] = grid[0][0];   // base case
            else if (j == 0)           dp[0] = dp[0] + grid[i][0];   // only from above
            else if (i == 0)           dp[j] = dp[j - 1] + grid[0][j]; // only from left
            else                       dp[j] = min(dp[j], dp[j - 1]) + grid[i][j];
            //                                    ^above    ^left
        }
    }
    return dp[n - 1];
}`,
    },
  ],
  cheatSheet: [
    "`dp[i][j] = dp[i-1][j] + dp[i][j-1]` to count; `grid[i][j] + min(dp[i-1][j], dp[i][j-1])` to minimise.",
    "O(m·n) time always. Space O(m·n) → O(min(m, n)) with a rolling row.",
    "In place, left-to-right: `dp[j]` is still the row above, `dp[j-1]` is already the current row.",
    "Obstacle = `dp[i][j] = 0` when counting, `INF` when minimising. Never blanket-fill the first row.",
    "Moves in all four directions ⇒ not DP. Use BFS (unweighted) or Dijkstra (weighted).",
  ],
  interviewQA: [
    {
      q: "Why can grid DP use a simple nested loop, and when does that break?",
      a: "Because the allowed moves — right and down — always increase `i + j`, the dependency graph is a DAG whose topological order is exactly row-major traversal. By the time the loop reaches `(i, j)`, both cells it reads, `(i-1, j)` and `(i, j-1)`, are already final, so no state is ever read before it is written. It breaks the moment moves can decrease `i` or `j`: then `(i, j)` and its neighbour can depend on each other, there is no valid static order, and no fixed loop nest is correct. At that point I switch to BFS for an unweighted grid or Dijkstra for weighted cells — O(m·n) and O(m·n log(m·n)) respectively — because those compute a fixed point rather than assuming an order.",
      followUps: [
        "What if diagonal moves are also allowed but still forward-only?",
        "How would you count paths modulo 10^9+7 without overflow?",
      ],
    },
    {
      q: "Reduce minimum path sum to O(n) space and justify that it is still correct.",
      a: "I keep one array `dp` of length `n` representing the row currently being computed, and sweep columns left to right. At column `j`, `dp[j]` has not been overwritten yet this row, so it still holds row `i-1`'s value — the cell above. `dp[j-1]` was overwritten one step ago, so it holds row `i`'s value — the cell to the left. Both operands are therefore exactly what the 2D recurrence wants, and `dp[j] = min(dp[j], dp[j-1]) + grid[i][j]` is a faithful in-place rewrite. The direction matters: sweeping right to left would read `dp[j-1]` from the previous row and be wrong. Time stays O(m·n), space becomes O(n), and I would roll along the shorter dimension. The one thing I lose is path reconstruction — for that I need the full table, or I re-walk the grid from the end.",
      followUps: [
        "How do you reconstruct the actual path if you only keep one row?",
        "Why do you initialise INF as LLONG_MAX/4 rather than LLONG_MAX?",
      ],
    },
  ],
  flashcards: [
    {
      front: "Grid DP space reduction",
      back: "Each row reads only the row above ⇒ keep one array of length n and sweep left to right, so `dp[j]` = above and `dp[j-1]` = left. O(m·n) time, O(n) space.",
    },
    {
      front: "How are obstacles handled in path-counting DP?",
      back: "Set `dp[i][j] = 0` for a blocked cell (or `INF` when minimising) and let the recurrence propagate. Do not pre-fill the first row/column with 1s.",
    },
    {
      front: "When is a grid problem NOT DP?",
      back: "When moves go in all four directions — dependencies become cyclic. Use BFS (unweighted) or Dijkstra (weighted) instead.",
    },
  ],
};
