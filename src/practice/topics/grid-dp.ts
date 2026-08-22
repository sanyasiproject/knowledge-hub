import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Unique Paths II",
      difficulty: "Medium",
      variation: "Counting paths with blocked cells",
      link: "https://leetcode.com/problems/unique-paths-ii/",
      question: [
        "You are given an m x n integer grid where obstacleGrid[i][j] is 1 if the cell contains an obstacle and 0 otherwise. A robot starts at the top-left corner and wants to reach the bottom-right corner, moving only right or down, and it cannot enter an obstacle. Return the number of distinct paths. The answer is guaranteed to be at most 2 * 10^9.",
        "Example 1:\nInput: obstacleGrid = [[0,0,0],[0,1,0],[0,0,0]]\nOutput: 2\nExplanation: The single obstacle in the middle leaves two routes around it.",
        "Example 2:\nInput: obstacleGrid = [[0,1],[0,0]]\nOutput: 1",
        "Constraints:\n- 1 <= m, n <= 100\n- obstacleGrid[i][j] is 0 or 1",
      ],
      code: `int uniquePathsWithObstacles(vector<vector<int>>& g) {
    int m = g.size(), n = g[0].size();
    if (g[0][0] == 1) return 0;
    vector<long long> dp(n, 0);
    dp[0] = 1;
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            if (g[i][j] == 1) { dp[j] = 0; continue; }   // no path may pass through
            if (j > 0) dp[j] += dp[j - 1];
        }
    }
    return (int)dp[n - 1];
}`,
      explanation: [
        "The recurrence is unchanged from Unique Paths - dp[i][j] = dp[i-1][j] + dp[i][j-1] - with one extra rule: an obstacle cell has zero paths through it, full stop.",
        "Setting dp[j] = 0 on an obstacle is what makes obstacles propagate correctly. Cells downstream read that zero, so an obstacle blocking a whole column of the first row correctly zeroes everything to its right.",
        "That is why the first row and column cannot be hard-coded to 1 as in the obstacle-free version. An obstacle at (0, 2) means every later cell in row 0 is unreachable, and the general recurrence handles that automatically once dp starts as [1, 0, 0, ...].",
        "The rolling single array works for the same reason as before: when the inner loop reaches column j, dp[j] still holds the previous row's value and dp[j-1] already holds this row's. Left-to-right order is mandatory.",
        "Time: O(m*n). Space: O(n).",
      ],
    },
    {
      name: "Minimum Path Sum",
      difficulty: "Medium",
      variation: "Minimisation over a grid",
      link: "https://leetcode.com/problems/minimum-path-sum/",
      question: [
        "Given an m x n grid filled with non-negative numbers, find a path from the top-left to the bottom-right which minimises the sum of all numbers along the path. You may only move right or down.",
        "Example 1:\nInput: grid = [[1,3,1],[1,5,1],[4,2,1]]\nOutput: 7\nExplanation: The path 1 -> 3 -> 1 -> 1 -> 1 sums to 7.",
        "Example 2:\nInput: grid = [[1,2,3],[4,5,6]]\nOutput: 12",
        "Constraints:\n- 1 <= m, n <= 200\n- 0 <= grid[i][j] <= 200",
      ],
      code: `int minPathSum(vector<vector<int>>& grid) {
    int m = grid.size(), n = grid[0].size();
    vector<int> dp(n);
    dp[0] = grid[0][0];
    for (int j = 1; j < n; j++) dp[j] = dp[j - 1] + grid[0][j];   // top row: only from the left
    for (int i = 1; i < m; i++) {
        dp[0] += grid[i][0];                                      // first column: only from above
        for (int j = 1; j < n; j++) {
            dp[j] = min(dp[j], dp[j - 1]) + grid[i][j];
        }
    }
    return dp[n - 1];
}`,
      explanation: [
        "Identical structure to path counting with + replaced by min: dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1]).",
        "The edges need separate handling because they have only one predecessor. In the counting version they were all 1; here they are running prefix sums along the top row and down the left column.",
        "In the rolling array, dp[j] on the right-hand side is the cell above and dp[j-1] is the cell to the left - the same read-before-write trick, now feeding a min instead of a sum.",
        "Greedy 'always step to the smaller neighbour' fails: [[1,3,1],[1,5,1],[4,2,1]] lures you down into the 4. The DP evaluates all prefixes, so it cannot be fooled by a locally attractive step.",
        "Time: O(m*n). Space: O(n).",
      ],
    },
    {
      name: "Triangle",
      difficulty: "Medium",
      variation: "Ragged grid, bottom-up avoids edge cases",
      link: "https://leetcode.com/problems/triangle/",
      question: [
        "Given a triangle array where row i has i+1 elements, return the minimum path sum from top to bottom. At each step you may move to either of the two adjacent numbers on the row below: from index i on the current row you may move to index i or i+1 on the next row.",
        "Example 1:\nInput: triangle = [[2],[3,4],[6,5,7],[4,1,8,3]]\nOutput: 11\nExplanation: 2 + 3 + 5 + 1 = 11.",
        "Example 2:\nInput: triangle = [[-10]]\nOutput: -10",
        "Constraints:\n- 1 <= triangle.length <= 200\n- -10^4 <= triangle[i][j] <= 10^4",
      ],
      code: `int minimumTotal(vector<vector<int>>& triangle) {
    vector<int> dp(triangle.back());          // start from the last row
    for (int i = (int)triangle.size() - 2; i >= 0; i--) {
        for (int j = 0; j <= i; j++) {
            dp[j] = triangle[i][j] + min(dp[j], dp[j + 1]);
        }
    }
    return dp[0];
}`,
      explanation: [
        "Working bottom-up is the whole trick. dp[j] means 'cheapest way from cell (i, j) down to the bottom', and every interior cell has exactly two successors, (i+1, j) and (i+1, j+1), both of which always exist. Top-down instead would force you to special-case the two ends of every row, where a cell has only one predecessor.",
        "Choosing the direction that makes the transition uniform is a general tactic, not a trick specific to triangles. Whenever one direction has ragged boundaries and the other does not, take the other.",
        "The array is reused in place, shrinking by one usable slot per row. Reading dp[j] and dp[j+1] while writing dp[j] is safe because both reads are for indices >= j and are consumed before being overwritten in this pass.",
        "Negative values are allowed, which is why nothing here may assume monotonicity or use 0 as a starting bound.",
        "Time: O(n^2) over the triangle's cells. Space: O(n).",
      ],
    },
    {
      name: "Maximum Path Sum in a Matrix",
      difficulty: "Medium",
      variation: "Free start and end, three downward moves",
      link: "https://www.geeksforgeeks.org/problems/path-in-matrix3805/1",
      question: [
        "Given an n x m matrix of integers, find the maximum sum path from any cell in the first row to any cell in the last row. From a cell (i, j) you may move to (i+1, j-1), (i+1, j) or (i+1, j+1), provided the target is inside the matrix.",
        "Example 1:\nInput: matrix = [[10, 10, 2, 0, 20, 4], [1, 0, 0, 30, 2, 5], [0, 10, 4, 0, 2, 0], [1, 0, 2, 20, 0, 4]]\nOutput: 74\nExplanation: 20 -> 30 -> 4 -> 20.",
        "Example 2:\nInput: matrix = [[1, 2], [3, 4]]\nOutput: 6\nExplanation: Start at 2 and move down-left to 4, or start at 2 and move down to 4.",
        "Constraints:\n- 1 <= n, m <= 500\n- -1000 <= matrix[i][j] <= 1000",
      ],
      code: `int maximumPath(vector<vector<int>>& mat) {
    int n = mat.size(), m = mat[0].size();
    const int NEG = INT_MIN / 2;
    vector<int> prev(mat[0]);
    for (int i = 1; i < n; i++) {
        vector<int> cur(m, NEG);
        for (int j = 0; j < m; j++) {
            int best = prev[j];
            if (j > 0)     best = max(best, prev[j - 1]);
            if (j + 1 < m) best = max(best, prev[j + 1]);
            cur[j] = mat[i][j] + best;
        }
        prev = move(cur);
    }
    return *max_element(prev.begin(), prev.end());
}`,
      explanation: [
        "Two things change relative to Minimum Path Sum. There are three incoming directions instead of two, and neither the start nor the end cell is fixed - so the whole first row is a valid base case and the answer is the maximum over the whole last row.",
        "Not pinning the endpoints is a common variation and it costs nothing: initialise every entry of the base row, and take a max over the final row instead of reading one corner. Forgetting the second half of that is a frequent wrong answer.",
        "Two separate rows are used rather than one in-place array, because the transition reads j-1, j and j+1 from the previous row. An in-place update would clobber prev[j-1] before the neighbour needs it, so this is exactly the case where a single rolling array is *not* safe.",
        "Values can be negative, so bounds start at a large negative sentinel rather than 0, and no path can be pruned for being 'worse so far'.",
        "Time: O(n*m). Space: O(m).",
      ],
    },
    {
      name: "Minimum Falling Path Sum",
      difficulty: "Medium",
      variation: "Same shape as the previous, minimising",
      link: "https://leetcode.com/problems/minimum-falling-path-sum/",
      question: [
        "Given an n x n array of integers matrix, return the minimum sum of any falling path through it. A falling path starts at any element in the first row and chooses the element in the next row that is either directly below or diagonally left or right of it.",
        "Example 1:\nInput: matrix = [[2,1,3],[6,5,4],[7,8,9]]\nOutput: 13\nExplanation: 1 -> 5 -> 7 sums to 13.",
        "Example 2:\nInput: matrix = [[-19,57],[-40,-5]]\nOutput: -59",
        "Constraints:\n- 1 <= n <= 100\n- -100 <= matrix[i][j] <= 100",
      ],
      code: `int minFallingPathSum(vector<vector<int>>& matrix) {
    int n = matrix.size();
    vector<int> prev(matrix[0]);
    for (int i = 1; i < n; i++) {
        vector<int> cur(n);
        for (int j = 0; j < n; j++) {
            int best = prev[j];
            if (j > 0)     best = min(best, prev[j - 1]);
            if (j + 1 < n) best = min(best, prev[j + 1]);
            cur[j] = matrix[i][j] + best;
        }
        prev = move(cur);
    }
    return *min_element(prev.begin(), prev.end());
}`,
      explanation: [
        "The same three-direction falling-path DP with max swapped for min. Presenting it right after the maximisation version is deliberate: once you have the state and the transition, the objective is a one-token change.",
        "The follow-up worth knowing is Minimum Falling Path Sum II, where the next row's column must *differ* from the current one. There the inner loop over columns would be O(n) per cell, making it O(n^3); keeping the smallest and second-smallest value of the previous row - and using the second-smallest exactly when the smallest sits in the forbidden column - brings it back to O(n^2).",
        "Negative numbers again rule out any early-exit pruning: a partial path that looks bad can still win.",
        "Time: O(n^2). Space: O(n).",
      ],
    },
    {
      name: "Dungeon Game",
      difficulty: "Hard",
      variation: "Reverse-direction DP when the constraint is on the prefix",
      link: "https://leetcode.com/problems/dungeon-game/",
      question: [
        "A knight enters the top-left room of an m x n dungeon and must rescue the princess in the bottom-right room, moving only right or down. Each room's value is added to the knight's health: negative values are demons, positive values are magic orbs. If the knight's health drops to 0 or below at any point he dies. Return the knight's minimum initial health so that he can reach the princess alive.",
        "Example 1:\nInput: dungeon = [[-2,-3,3],[-5,-10,1],[10,30,-5]]\nOutput: 7\nExplanation: With 7 health the route right-right-down-down survives every room.",
        "Example 2:\nInput: dungeon = [[0]]\nOutput: 1",
        "Constraints:\n- 1 <= m, n <= 200\n- -1000 <= dungeon[i][j] <= 1000",
      ],
      code: `int calculateMinimumHP(vector<vector<int>>& dungeon) {
    int m = dungeon.size(), n = dungeon[0].size();
    const int INF = INT_MAX / 2;
    // dp[i][j] = minimum health required upon ENTERING cell (i, j).
    // One extra row and column act as sentinels past the princess's room.
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, INF));
    dp[m][n - 1] = 1;
    dp[m - 1][n] = 1;
    for (int i = m - 1; i >= 0; i--) {
        for (int j = n - 1; j >= 0; j--) {
            int need = min(dp[i + 1][j], dp[i][j + 1]) - dungeon[i][j];
            dp[i][j] = max(1, need);          // health must stay at least 1
        }
    }
    return dp[0][0];
}`,
      explanation: [
        "Forward DP fails here, and understanding why is the whole problem. 'Maximum health collected so far' is not enough state: a route with more health at cell (i, j) can still be worse, because the requirement is that health never dipped to zero anywhere along the way. Two quantities would have to be tracked at once, and they trade off.",
        "Turn it around. Let dp[i][j] be the minimum health needed *on entering* (i, j) to survive from there to the exit. That quantity depends only on the future, which is unambiguous. Entering (i, j) you immediately apply dungeon[i][j], then must have at least min(dp[i+1][j], dp[i][j+1]) left, so need = min(down, right) - dungeon[i][j], clamped to at least 1.",
        "The clamp is the rule 'health must stay positive'. A big orb can make need non-positive, but the knight still has to be alive to walk in, so 1 is the floor.",
        "Sentinels past the last row and column are INF so they are never chosen, except the two cells adjacent to the princess's room, which are 1 - the knight needs only to be alive when he arrives.",
        "The general lesson: when a constraint applies to every prefix of a path rather than to its total, try defining the state over the remaining suffix instead.",
        "Time: O(m*n). Space: O(m*n), reducible to O(n) with a rolling row.",
      ],
    },
    {
      name: "Maximal Square",
      difficulty: "Medium",
      variation: "DP where the state is a geometric quantity",
      link: "https://leetcode.com/problems/maximal-square/",
      question: [
        "Given an m x n binary matrix filled with '0' and '1' characters, find the largest square containing only '1's and return its area.",
        'Example 1:\nInput: matrix = [["1","0","1","0","0"],["1","0","1","1","1"],["1","1","1","1","1"],["1","0","0","1","0"]]\nOutput: 4\nExplanation: A 2 x 2 square of ones exists; no 3 x 3 one does.',
        'Example 2:\nInput: matrix = [["0","1"],["1","0"]]\nOutput: 1',
        "Constraints:\n- 1 <= m, n <= 300\n- matrix[i][j] is '0' or '1'",
      ],
      code: `int maximalSquare(vector<vector<char>>& matrix) {
    int m = matrix.size(), n = matrix[0].size(), best = 0;
    vector<int> dp(n + 1, 0);      // dp[j+1] = side of the largest square ending at (i, j)
    int prevDiag = 0;
    for (int i = 0; i < m; i++) {
        prevDiag = 0;
        for (int j = 0; j < n; j++) {
            int temp = dp[j + 1];                 // this is dp[i-1][j] before overwriting
            if (matrix[i][j] == '1') {
                dp[j + 1] = 1 + min({ dp[j], dp[j + 1], prevDiag });
                best = max(best, dp[j + 1]);
            } else {
                dp[j + 1] = 0;
            }
            prevDiag = temp;                      // becomes dp[i-1][j] for the next column
        }
    }
    return best * best;
}`,
      explanation: [
        "dp[i][j] is the side length of the largest all-ones square whose bottom-right corner is (i, j). Every cell then contributes one candidate answer and the largest wins.",
        "The transition dp[i][j] = 1 + min(left, up, diagonal) reads as: a k x k square at (i, j) requires (k-1) x (k-1) squares at the three neighbouring corners simultaneously, so the binding constraint is the smallest of them. Taking a max or a sum instead is the classic mistake - all three must hold at once.",
        "This is the pattern where the state is not a count or a cost but a geometric size. The recurrence works because 'largest square here' is enough to reconstruct whether a bigger one fits, without remembering the squares themselves.",
        "The 1D compression needs three values: dp[j] is already this row (left), dp[j+1] is still the previous row (up), and prevDiag holds the previous row's value one column back. Saving temp before overwriting is what keeps the diagonal available.",
        "Time: O(m*n). Space: O(n).",
      ],
    },
    {
      name: "Count Square Submatrices with All Ones",
      difficulty: "Medium",
      variation: "The same table, summed instead of maximised",
      link: "https://leetcode.com/problems/count-square-submatrices-with-all-ones/",
      question: [
        "Given an m x n matrix of ones and zeros, return how many square submatrices have all ones. Squares of different sizes and different positions count separately, and a single 1 counts as a 1 x 1 square.",
        "Example 1:\nInput: matrix = [[0,1,1,1],[1,1,1,1],[0,1,1,1]]\nOutput: 15\nExplanation: 10 squares of side 1, 4 of side 2, 1 of side 3.",
        "Example 2:\nInput: matrix = [[1,0,1],[1,1,0],[1,1,0]]\nOutput: 7",
        "Constraints:\n- 1 <= m, n <= 300\n- matrix[i][j] is 0 or 1",
      ],
      code: `int countSquares(vector<vector<int>>& matrix) {
    int m = matrix.size(), n = matrix[0].size();
    long long total = 0;
    vector<int> dp(n + 1, 0);
    for (int i = 0; i < m; i++) {
        int prevDiag = 0;
        for (int j = 0; j < n; j++) {
            int temp = dp[j + 1];
            dp[j + 1] = matrix[i][j] ? 1 + min({ dp[j], dp[j + 1], prevDiag }) : 0;
            total += dp[j + 1];
            prevDiag = temp;
        }
    }
    return (int)total;
}`,
      explanation: [
        "Exactly the Maximal Square table. The observation that turns it into a count: if the largest square ending at (i, j) has side k, then squares of side 1, 2, ..., k all end at (i, j) and each is distinct. So that cell contributes precisely k.",
        "Summing dp over every cell therefore counts every all-ones square exactly once, because each square is charged to its unique bottom-right corner. That 'charge each object to a canonical cell' argument is what makes the count come out without double counting.",
        "Worth internalising as a pair with the previous problem: same state, same transition, and the only difference is whether you reduce the table with max or with sum. Interviewers use one to test whether you actually understood the other.",
        "Time: O(m*n). Space: O(n).",
      ],
    },
    {
      name: "Longest Increasing Path in a Matrix",
      difficulty: "Hard",
      variation: "Memoised DFS — DP on an implicit DAG",
      link: "https://leetcode.com/problems/longest-increasing-path-in-a-matrix/",
      question: [
        "Given an m x n integers matrix, return the length of the longest strictly increasing path. From each cell you may move in four directions - left, right, up, down - and you may not move diagonally or outside the boundary.",
        "Example 1:\nInput: matrix = [[9,9,4],[6,6,8],[2,1,1]]\nOutput: 4\nExplanation: The path [1, 2, 6, 9].",
        "Example 2:\nInput: matrix = [[3,4,5],[3,2,6],[2,2,1]]\nOutput: 4\nExplanation: The path [3, 4, 5, 6]. Diagonal moves are not allowed.",
        "Constraints:\n- 1 <= m, n <= 200\n- 0 <= matrix[i][j] <= 2^31 - 1",
      ],
      code: `class Solution {
    int m, n;
    vector<vector<int>> memo;
    const int dx[4] = {1, -1, 0, 0};
    const int dy[4] = {0, 0, 1, -1};

    int dfs(vector<vector<int>>& a, int i, int j) {
        if (memo[i][j]) return memo[i][j];
        int best = 1;
        for (int d = 0; d < 4; d++) {
            int x = i + dx[d], y = j + dy[d];
            if (x < 0 || x >= m || y < 0 || y >= n) continue;
            if (a[x][y] <= a[i][j]) continue;             // must strictly increase
            best = max(best, 1 + dfs(a, x, y));
        }
        return memo[i][j] = best;
    }

public:
    int longestIncreasingPath(vector<vector<int>>& matrix) {
        m = matrix.size();
        n = matrix[0].size();
        memo.assign(m, vector<int>(n, 0));
        int ans = 0;
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++)
                ans = max(ans, dfs(matrix, i, j));
        return ans;
    }
};`,
      explanation: [
        "Movement is in all four directions, so there is no row-by-row fill order to exploit. What saves it is the strictly-increasing rule: every legal move goes to a larger value, so no path can revisit a cell. The reachability graph is a DAG and a DP over it is well-defined.",
        "Memoised DFS is the natural way to evaluate a DP whose dependency order you do not want to compute by hand - the recursion discovers a valid order for you. This is the main reason to reach for top-down over tabulation.",
        "memo[i][j] holds the longest increasing path *starting* at (i, j) and never depends on how the cell was entered, so one value per cell is enough. Because every cell is memoised on first visit, the total work is linear in cells times four edges.",
        "0 doubles as the 'not computed' marker because a real answer is at least 1 - every cell is a path of length one by itself.",
        "The answer requires trying every start, since nothing tells you where the longest path begins. The memo makes those m*n launches nearly free.",
        "Time: O(m*n). Space: O(m*n), with recursion depth up to m*n in the worst case.",
      ],
    },
    {
      name: "Cherry Pickup II",
      difficulty: "Hard",
      variation: "Two agents moving in lockstep — one extra state dimension",
      link: "https://leetcode.com/problems/cherry-pickup-ii/",
      question: [
        "You are given a rows x cols matrix grid where grid[i][j] is the number of cherries in cell (i, j). Two robots start at (0, 0) and (0, cols-1). Each robot moves to the row below, to the column left, the same column, or the column right. When a robot passes through a cell it collects all cherries there and the cell becomes empty; if both robots are on the same cell, only one of them collects. Both robots must finish in the last row. Return the maximum number of cherries collected.",
        "Example 1:\nInput: grid = [[3,1,1],[2,5,1],[1,5,5],[2,1,1]]\nOutput: 24\nExplanation: Robot 1 walks down the left side collecting 3 + 2 + 5 + 2 = 12 and robot 2 walks down the right side collecting 1 + 1 + 5 + 1; the optimal pair of routes totals 24.",
        "Example 2:\nInput: grid = [[1,0,0,0,0,0,1],[2,0,0,0,0,3,0],[2,0,9,0,0,0,0],[0,3,0,5,4,0,0],[1,0,2,3,0,0,6]]\nOutput: 28",
        "Constraints:\n- 2 <= rows, cols <= 70\n- 0 <= grid[i][j] <= 100",
      ],
      code: `int cherryPickup(vector<vector<int>>& grid) {
    int rows = grid.size(), cols = grid[0].size();
    const int NEG = -1e9;
    vector<vector<int>> dp(cols, vector<int>(cols, NEG));
    dp[0][cols - 1] = grid[0][0] + grid[0][cols - 1];

    for (int r = 1; r < rows; r++) {
        vector<vector<int>> nxt(cols, vector<int>(cols, NEG));
        for (int a = 0; a < cols; a++) {
            for (int b = 0; b < cols; b++) {
                if (dp[a][b] == NEG) continue;
                for (int da = -1; da <= 1; da++) {
                    for (int db = -1; db <= 1; db++) {
                        int na = a + da, nb = b + db;
                        if (na < 0 || na >= cols || nb < 0 || nb >= cols) continue;
                        int gain = grid[r][na] + (na == nb ? 0 : grid[r][nb]);
                        nxt[na][nb] = max(nxt[na][nb], dp[a][b] + gain);
                    }
                }
            }
        }
        dp = move(nxt);
    }

    int ans = 0;
    for (auto& row : dp)
        for (int v : row) ans = max(ans, v);
    return ans;
}`,
      explanation: [
        "Running one robot's DP and then the other's is wrong, because the first robot's route changes the grid the second one sees. The two decisions are coupled, so they must live in one state.",
        "The saving observation is that both robots advance exactly one row per step, so their row index is always equal. One row counter plus two column counters fully describes the configuration: dp[r][a][b] = best cherries collected with robot 1 in column a and robot 2 in column b of row r.",
        "Nine transitions per state, one for each pair of moves. The shared-cell rule is handled at the moment of collection: if na == nb, count that cell once. Forgetting this over-counts every crossing.",
        "There is no need to forbid the robots from swapping sides or occupying the same cell - the max over all final states naturally ignores anything suboptimal, and the same-cell rule makes overlap unprofitable rather than illegal.",
        "The row dimension rolls away since only the previous row is read, so memory is O(cols^2).",
        "Time: O(rows * cols^2 * 9). Space: O(cols^2).",
      ],
    },
    {
      name: "Out of Boundary Paths",
      difficulty: "Medium",
      variation: "Grid DP with a move-count dimension",
      link: "https://leetcode.com/problems/out-of-boundary-paths/",
      question: [
        "There is an m x n grid with a ball starting at position (startRow, startColumn). You may move the ball to an adjacent cell in one of four directions, but at most maxMove moves in total. Return the number of paths that move the ball out of the grid boundary, modulo 10^9 + 7.",
        "Example 1:\nInput: m = 2, n = 2, maxMove = 2, startRow = 0, startColumn = 0\nOutput: 6",
        "Example 2:\nInput: m = 1, n = 3, maxMove = 3, startRow = 0, startColumn = 1\nOutput: 12",
        "Constraints:\n- 1 <= m, n <= 50\n- 0 <= maxMove <= 50\n- 0 <= startRow < m, 0 <= startColumn < n",
      ],
      code: `int findPaths(int m, int n, int maxMove, int startRow, int startColumn) {
    const long long MOD = 1e9 + 7;
    vector<vector<long long>> cur(m, vector<long long>(n, 0));
    cur[startRow][startColumn] = 1;
    long long ans = 0;

    const int dx[4] = {1, -1, 0, 0};
    const int dy[4] = {0, 0, 1, -1};

    for (int step = 0; step < maxMove; step++) {
        vector<vector<long long>> nxt(m, vector<long long>(n, 0));
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (!cur[i][j]) continue;
                for (int d = 0; d < 4; d++) {
                    int x = i + dx[d], y = j + dy[d];
                    if (x < 0 || x >= m || y < 0 || y >= n) ans = (ans + cur[i][j]) % MOD;
                    else nxt[x][y] = (nxt[x][y] + cur[i][j]) % MOD;
                }
            }
        }
        cur = move(nxt);
    }
    return (int)ans;
}`,
      explanation: [
        "Because moves go in all four directions, the position alone is not an acyclic state - the ball can return to a cell. The move count is what makes the DP well-founded: dp[k][i][j] = number of ways to be at (i, j) after exactly k moves, and k strictly increases, so there are no cycles.",
        "Adding a step dimension is the standard repair when a grid DP would otherwise cycle. It is also what distinguishes this from a shortest-path problem: here paths of different lengths are all counted, so every step layer contributes.",
        "Exits are accumulated the moment a move leaves the grid, not stored in the table. A path that leaves is finished and must not be extended, which falls out for free since off-grid cells have no state.",
        "Counting can explode combinatorially, hence the modulus at every addition and the long long accumulators to keep intermediate sums from wrapping.",
        "Time: O(maxMove * m * n * 4). Space: O(m*n) with the step dimension rolled away.",
      ],
    },
    {
      name: "Knight Probability in Chessboard",
      difficulty: "Medium",
      variation: "Probabilities instead of counts",
      link: "https://leetcode.com/problems/knight-probability-in-chessboard/",
      question: [
        "On an n x n chessboard a knight starts at cell (row, column) and attempts to make exactly k moves. The knight has eight possible moves, chosen uniformly at random each time, and it may move off the board - if it does, it stops moving. Return the probability that the knight remains on the board after it has stopped moving.",
        "Example 1:\nInput: n = 3, k = 2, row = 0, column = 0\nOutput: 0.06250\nExplanation: Of the knight's two first moves that stay on the board, each has two of eight second moves staying on: 2 * 2 / 8^2.",
        "Example 2:\nInput: n = 1, k = 0, row = 0, column = 0\nOutput: 1.00000",
        "Constraints:\n- 1 <= n <= 25\n- 0 <= k <= 100\n- 0 <= row, column <= n - 1",
      ],
      code: `double knightProbability(int n, int k, int row, int column) {
    const int dx[8] = {1, 1, -1, -1, 2, 2, -2, -2};
    const int dy[8] = {2, -2, 2, -2, 1, -1, 1, -1};

    vector<vector<double>> cur(n, vector<double>(n, 0.0));
    cur[row][column] = 1.0;

    for (int step = 0; step < k; step++) {
        vector<vector<double>> nxt(n, vector<double>(n, 0.0));
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (cur[i][j] == 0.0) continue;
                for (int d = 0; d < 8; d++) {
                    int x = i + dx[d], y = j + dy[d];
                    if (x < 0 || x >= n || y < 0 || y >= n) continue;   // moves off: mass is lost
                    nxt[x][y] += cur[i][j] / 8.0;
                }
            }
        }
        cur = move(nxt);
    }

    double total = 0.0;
    for (auto& r : cur)
        for (double v : r) total += v;
    return total;
}`,
      explanation: [
        "Structurally this is Out of Boundary Paths with counts replaced by probabilities: same step-layered state, same push of each cell's value to its neighbours, with each of the eight moves carrying a factor of 1/8.",
        "Probability mass that leaves the board is simply not written anywhere, so it disappears from the table. Summing what remains after k layers is exactly the probability of surviving all k moves - no separate bookkeeping of failures is needed.",
        "You could equally count surviving move sequences as integers and divide by 8^k at the end, but 8^100 is astronomically large. Carrying doubles keeps the values in a sane range at the cost of tiny rounding error, which is well within the 10^-5 tolerance these problems allow.",
        "k = 0 works without a special case: no layers run and the single starting cell holds 1.0.",
        "Time: O(k * n^2 * 8). Space: O(n^2).",
      ],
    },
  ],
};
