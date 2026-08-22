import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Climbing Stairs",
      difficulty: "Easy",
      variation: "Rolling variables, the template",
      link: "https://leetcode.com/problems/climbing-stairs/",
      question: [
        "You are climbing a staircase of n steps. Each move climbs either 1 or 2 steps. Return the number of distinct ways to reach the top. Write the O(n) table version first, then keep only the entries the transition actually reads.",
        "Example 1:\nInput: n = 3\nOutput: 3\nExplanation: 1+1+1, 1+2 and 2+1.",
        "Example 2:\nInput: n = 5\nOutput: 8\nExplanation: The counts run 1, 1, 2, 3, 5, 8 for n = 0..5.",
        "Constraints:\n- 1 <= n <= 45",
      ],
      code: `int climbStairsTable(int n) {
    vector<int> dp(n + 1);
    dp[0] = 1;
    dp[1] = 1;
    for (int i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
    return dp[n];
}

int climbStairs(int n) {
    // dp[i] reads only i-1 and i-2, so a two-slot window is enough.
    int prev2 = 1, prev1 = 1;
    for (int i = 2; i <= n; i++) {
        int cur = prev1 + prev2;
        prev2 = prev1;   // slide the window forward before the next round
        prev1 = cur;
    }
    return prev1;
}`,
      explanation: [
        "State is dp[i] = number of ways to stand on step i. The last move into step i was a single step from i-1 or a double step from i-2, and those two families of paths are disjoint and cover every path, so dp[i] = dp[i-1] + dp[i-2].",
        "The space argument is purely mechanical and is the whole topic in miniature: look at the transition, list the indices it reads, and keep exactly that window. Here the window is the last two values, so two scalars replace the array. Nothing about the arithmetic changes - only the storage of values that will never be read again.",
        "The order of the three assignments in the loop matters. Overwriting prev1 before saving it into prev2 loses the value the next iteration needs, which is the same class of bug as sweeping a 1D knapsack array in the wrong direction.",
        "The trap is dp[0] = 0. There is exactly one way to be at the bottom, namely take no steps, so dp[0] = 1; a zero there collapses the whole sequence.",
        "Time: O(n). Space: O(n) for the table version, O(1) for the rolling version.",
      ],
    },
    {
      name: "Pascal's Triangle II",
      difficulty: "Easy",
      variation: "One row updated in place, backward sweep",
      link: "https://leetcode.com/problems/pascals-triangle-ii/",
      question: [
        "Given an integer rowIndex, return the rowIndex-th (0-indexed) row of Pascal's triangle. Row i has i+1 entries, the first and last are 1, and every interior entry is the sum of the two entries above it. Solve it using only O(rowIndex) extra space.",
        "Example 1:\nInput: rowIndex = 3\nOutput: [1,3,3,1]\nExplanation: Row 2 is [1,2,1], and 1+2 = 3, 2+1 = 3.",
        "Example 2:\nInput: rowIndex = 0\nOutput: [1]\nExplanation: The apex row has a single entry.",
        "Constraints:\n- 0 <= rowIndex <= 33\n- Every value fits in a 32-bit signed integer",
      ],
      code: `vector<int> getRow(int rowIndex) {
    vector<int> row(rowIndex + 1, 0);
    row[0] = 1;
    for (int i = 1; i <= rowIndex; i++) {
        // Sweep right-to-left: row[j-1] is still the previous row's value.
        for (int j = i; j >= 1; j--) row[j] += row[j - 1];
    }
    return row;
}`,
      explanation: [
        "The 2D recurrence is C[i][j] = C[i-1][j] + C[i-1][j-1]. Row i reads only row i-1, so one array can play both roles if the sweep order guarantees that each slot is read as 'old' before it is written as 'new'.",
        "Position j is written using j and j-1. Going from high j down to 1, slot j-1 has not been touched yet in this round, so it still holds the previous row's value - exactly what the transition wants. That is the invariant to state out loud whenever you collapse a row.",
        "Sweeping left to right instead gives row[j] += already-updated row[j-1], which counts contributions from the current row and produces garbage: for rowIndex = 2 you would get [1,2,3] instead of [1,2,1].",
        "Computing the entries as factorials is the tempting shortcut but overflows long before rowIndex = 33 unless you build the ratio incrementally; the additive sweep never leaves the range of the answer itself.",
        "Time: O(rowIndex^2). Space: O(rowIndex), only the output row.",
      ],
    },
    {
      name: "Unique Paths",
      difficulty: "Medium",
      variation: "Grid rows collapsed to one row, forward sweep",
      link: "https://leetcode.com/problems/unique-paths/",
      question: [
        "A robot starts at the top-left corner of an m x n grid and wants to reach the bottom-right corner. It can only move right or down. Return the number of distinct paths. Use O(n) extra space rather than the full m x n table.",
        "Example 1:\nInput: m = 3, n = 7\nOutput: 28\nExplanation: Any path makes 2 downs among 8 moves, so the count is C(8,2) = 28.",
        "Example 2:\nInput: m = 3, n = 2\nOutput: 3\nExplanation: DDR, DRD and RDD.",
        "Constraints:\n- 1 <= m, n <= 100\n- The answer fits in a 32-bit signed integer",
      ],
      code: `int uniquePaths(int m, int n) {
    vector<int> dp(n, 1);          // top row: exactly one path to each cell
    for (int i = 1; i < m; i++) {
        for (int j = 1; j < n; j++) {
            // dp[j] is still row i-1, dp[j-1] is already row i - both wanted.
            dp[j] += dp[j - 1];
        }
    }
    return dp[n - 1];
}`,
      explanation: [
        "dp[i][j] = dp[i-1][j] + dp[i][j-1]: paths arriving from above plus paths arriving from the left. Two of the three indices sit in the current row, one in the row above.",
        "Because the transition needs the current row on the left and the previous row directly above, the sweep must go left to right - the mirror image of Pascal's Triangle II. Reading dp[j-1] after it has been updated is not a bug here, it is precisely the dp[i][j-1] term.",
        "That contrast is the thing worth internalising: the direction of a safe in-place sweep is dictated by which neighbours belong to the current row and which to the previous one, not by habit.",
        "dp[0] stays 1 forever without any special handling, since the only way down the first column is straight down. Column 0 is never written inside the loop.",
        "Time: O(m*n). Space: O(n) instead of O(m*n).",
      ],
    },
    {
      name: "Minimum Path Sum",
      difficulty: "Medium",
      variation: "Rolling row with an in-place min",
      link: "https://leetcode.com/problems/minimum-path-sum/",
      question: [
        "Given an m x n grid of non-negative numbers, find a path from the top-left to the bottom-right that minimises the sum of the numbers along it. You may only move right or down. Return that minimum sum, using O(n) extra space.",
        "Example 1:\nInput: grid = [[1,3,1],[1,5,1],[4,2,1]]\nOutput: 7\nExplanation: The path 1 -> 3 -> 1 -> 1 -> 1 sums to 7.",
        "Example 2:\nInput: grid = [[1,2,3],[4,5,6]]\nOutput: 12\nExplanation: 1 + 2 + 3 + 6 = 12 beats going down early.",
        "Constraints:\n- 1 <= m, n <= 200\n- 0 <= grid[i][j] <= 200",
      ],
      code: `int minPathSum(vector<vector<int>>& grid) {
    int m = grid.size(), n = grid[0].size();
    vector<int> dp(n);
    dp[0] = grid[0][0];
    for (int j = 1; j < n; j++) dp[j] = dp[j - 1] + grid[0][j];   // top row
    for (int i = 1; i < m; i++) {
        dp[0] += grid[i][0];                                      // first column
        for (int j = 1; j < n; j++)
            dp[j] = min(dp[j], dp[j - 1]) + grid[i][j];           // dp[j] = above, dp[j-1] = left
    }
    return dp[n - 1];
}`,
      explanation: [
        "Same shape as Unique Paths with min replacing plus: dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1]). The two candidate predecessors are the cell above and the cell to the left, both of which are already final when the sweep reaches j.",
        "In the collapsed array, at the moment dp[j] is written it still holds row i-1 column j (the cell above) while dp[j-1] already holds row i column j-1 (the cell to the left). Reading both before the assignment is what makes the single array legal.",
        "The boundary handling is where this goes wrong in practice. dp[0] for row i must be updated as dp[0] + grid[i][0] before the inner loop, because column 0 has no left neighbour; forgetting it leaves the previous row's value and understates every path.",
        "Padding the array with a large sentinel instead is fine, but INT_MAX plus a cell value overflows - use a value like 1e9 if you go that route.",
        "Time: O(m*n). Space: O(n).",
      ],
    },
    {
      name: "Triangle",
      difficulty: "Medium",
      variation: "Bottom-up single array over a ragged grid",
      link: "https://leetcode.com/problems/triangle/",
      question: [
        "Given a triangle array where row i has i+1 elements, return the minimum path sum from top to bottom. From index j on row i you may move to index j or index j+1 on row i+1. Use O(n) extra space where n is the number of rows.",
        "Example 1:\nInput: triangle = [[2],[3,4],[6,5,7],[4,1,8,3]]\nOutput: 11\nExplanation: 2 + 3 + 5 + 1 = 11.",
        "Example 2:\nInput: triangle = [[-10]]\nOutput: -10\nExplanation: A single row, so the apex is the whole path.",
        "Constraints:\n- 1 <= triangle.size() <= 200\n- -10^4 <= triangle[i][j] <= 10^4",
      ],
      code: `int minimumTotal(vector<vector<int>>& triangle) {
    int n = triangle.size();
    vector<int> dp = triangle[n - 1];      // last row is its own answer
    for (int i = n - 2; i >= 0; i--) {
        // Row i has i+1 cells; dp[j] and dp[j+1] still hold row i+1 here.
        for (int j = 0; j <= i; j++)
            dp[j] = triangle[i][j] + min(dp[j], dp[j + 1]);
    }
    return dp[0];
}`,
      explanation: [
        "Working bottom-up makes the state dp[j] = cheapest way from cell (i, j) down to the last row. The transition dp[i][j] = triangle[i][j] + min(dp[i+1][j], dp[i+1][j+1]) reads two adjacent entries of the row below.",
        "Sweeping j upward is safe because writing dp[j] only destroys the value at index j, and index j of the lower row is never needed again once row i's cell j is computed - every later j reads indices strictly greater than j.",
        "Bottom-up also removes all the boundary special cases that a top-down version needs: going downward, cell (i, j) can be reached only from (i-1, j-1) and (i-1, j), and the two edges of the triangle have a single predecessor each. Choosing the direction that has uniform transitions is a real optimisation, not just taste.",
        "Values can be negative, so initialising with 0 rather than copying the last row silently caps the answer; and no greedy 'always take the smaller neighbour' walk works - [[2],[3,4],[6,5,7],[4,1,8,3]] sends greedy through 3 then 5 by luck, but a single large number under a small one breaks it.",
        "Time: O(n^2). Space: O(n).",
      ],
    },
    {
      name: "Partition Equal Subset Sum",
      difficulty: "Medium",
      variation: "0/1 knapsack: capacity loop must run backwards",
      link: "https://leetcode.com/problems/partition-equal-subset-sum/",
      question: [
        "Given an integer array nums, return true if the array can be split into two subsets whose sums are equal, and false otherwise. Each element must land in exactly one subset. Solve it with a single 1D boolean array over the target sum.",
        "Example 1:\nInput: nums = [1,5,11,5]\nOutput: true\nExplanation: Total is 22, and [11] and [1,5,5] both sum to 11.",
        "Example 2:\nInput: nums = [1,2,3,5]\nOutput: false\nExplanation: Total is 11, which is odd, so no equal split exists.",
        "Constraints:\n- 1 <= nums.length <= 200\n- 1 <= nums[i] <= 100",
      ],
      code: `bool canPartition(vector<int>& nums) {
    int total = accumulate(nums.begin(), nums.end(), 0);
    if (total % 2) return false;                 // odd total can never split
    int target = total / 2;
    vector<char> dp(target + 1, 0);
    dp[0] = 1;                                   // empty subset reaches sum 0
    for (int v : nums) {
        // Backwards: dp[j - v] must still describe the items before v.
        for (int j = target; j >= v; j--)
            if (dp[j - v]) dp[j] = 1;
    }
    return dp[target];
}`,
      explanation: [
        "The 2D form is dp[i][j] = dp[i-1][j] or dp[i-1][j-nums[i]]: reachable without item i, or reachable with it. Every read is from row i-1, so one array works if no read ever sees a value already updated in the current round.",
        "Descending j guarantees that: when dp[j] is written, index j-v is smaller and therefore untouched this round, so it still means 'reachable using items before v'. That is what enforces using each item at most once.",
        "Ascending j is the classic wrong answer. dp[j-v] would already include v, so v gets used repeatedly and the code solves the unbounded version instead - for nums = [3] and target 6 it would wrongly report true.",
        "Checking the parity of the total first is not just an optimisation, it also keeps target integral. With the given limits target is at most 10000, and swapping vector<char> for bitset<10001> with dp |= dp << v does the same work about 64 times faster.",
        "Time: O(n * target). Space: O(target).",
      ],
    },
    {
      name: "Book Shop",
      difficulty: "Medium",
      variation: "0/1 knapsack with values, 1D array on a judge",
      link: "https://cses.fi/problemset/task/1158",
      question: [
        "You are in a book shop selling n books. You know the price and the number of pages of each book, and you have x units of money. Buy a set of books whose total price is at most x and whose total page count is as large as possible, and print that maximum number of pages. Each book can be bought at most once.",
        "Example 1:\nInput:\n4 10\n4 8 5 3\n5 12 8 1\nOutput: 13\nExplanation: Prices are 4, 8, 5, 3 and pages are 5, 12, 8, 1. Buying books 1 and 3 costs 9 <= 10 and gives 5 + 8 = 13 pages, beating the 12 pages of book 2 alone.",
        "Constraints:\n- 1 <= n <= 1000\n- 1 <= x <= 10^5\n- 1 <= price of each book, pages of each book <= 1000",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, x;
    cin >> n >> x;
    vector<int> price(n), pages(n);
    for (int i = 0; i < n; i++) cin >> price[i];
    for (int i = 0; i < n; i++) cin >> pages[i];
    vector<int> dp(x + 1, 0);            // dp[j] = best pages with budget exactly at most j
    for (int i = 0; i < n; i++) {
        for (int j = x; j >= price[i]; j--)        // descending keeps book i single-use
            dp[j] = max(dp[j], dp[j - price[i]] + pages[i]);
    }
    cout << dp[x] << "\\n";
    return 0;
}`,
      explanation: [
        "The full table is n x (x+1) booleans of int, which at n = 1000 and x = 100000 is 10^8 ints - far past any memory limit. The transition only reads row i-1, so the 1D collapse is not a nicety here, it is the only way the solution fits.",
        "dp[j] is defined as the best page count achievable with budget at most j, which makes the answer dp[x] directly and lets the array start all zeros: spending nothing is always allowed. With a strict 'exactly j' definition you would need a negative-infinity sentinel and a final scan.",
        "Descending j is the single-use guarantee, exactly as in Partition Equal Subset Sum. Reversing it turns this into the unbounded problem where you could buy the same book many times.",
        "Order of the two loops matters for the collapse but not for the answer: items must be outer. With capacity outer and items inner on a 1D array you would mix rows and get an unbounded-style result.",
        "Time: O(n * x), about 10^8 very cheap operations - keep the inner loop free of allocation. Space: O(x).",
      ],
    },
    {
      name: "Coin Change",
      difficulty: "Medium",
      variation: "Unbounded knapsack: capacity loop runs forwards",
      link: "https://leetcode.com/problems/coin-change/",
      question: [
        "You are given an array coins of distinct denominations and an integer amount. Return the fewest number of coins needed to make up that amount, assuming an unlimited supply of each denomination. If the amount cannot be formed, return -1.",
        "Example 1:\nInput: coins = [1,2,5], amount = 11\nOutput: 3\nExplanation: 11 = 5 + 5 + 1.",
        "Example 2:\nInput: coins = [2], amount = 3\nOutput: -1\nExplanation: Every combination of 2s is even.",
        "Constraints:\n- 1 <= coins.length <= 12\n- 1 <= coins[i] <= 2^31 - 1\n- 0 <= amount <= 10^4",
      ],
      code: `int coinChange(vector<int>& coins, int amount) {
    const int INF = 1e9;
    vector<int> dp(amount + 1, INF);
    dp[0] = 0;
    for (int c : coins) {
        // Ascending: dp[a - c] may already use coin c, which is exactly what we want.
        for (int a = c; a <= amount; a++)
            if (dp[a - c] + 1 < dp[a]) dp[a] = dp[a - c] + 1;
    }
    return dp[amount] >= INF ? -1 : dp[amount];
}`,
      explanation: [
        "This is the deliberate mirror of the previous two problems. Reusing an item is allowed, so the correct 2D transition is dp[i][a] = min(dp[i-1][a], dp[i][a - c]) - the second term stays on the current row. Collapsing to one array therefore requires the ascending sweep, because dp[a-c] must already reflect coin c.",
        "The pair of rules is worth memorising as one sentence: on a 1D knapsack array, descending capacity means each item once, ascending capacity means unlimited copies. Nothing else about the code changes.",
        "Using INT_MAX as the unreachable marker overflows at dp[a-c] + 1 and wraps to a negative number that then wins the min. A finite sentinel like 1e9 keeps the comparison honest, and the final check must be >= INF rather than == INF once you allow sentinel+1 to be stored.",
        "The greedy 'take the largest coin that fits' is wrong for general denominations: coins = [1,3,4] and amount 6 gives 4+1+1 greedily but 3+3 is optimal.",
        "Time: O(amount * number of coins). Space: O(amount).",
      ],
    },
    {
      name: "Longest Common Subsequence",
      difficulty: "Medium",
      variation: "Two rolling rows, then one row plus a saved diagonal",
      link: "https://leetcode.com/problems/longest-common-subsequence/",
      question: [
        "Given two strings text1 and text2, return the length of their longest common subsequence, or 0 if there is none. A subsequence keeps the relative order of characters but may delete any of them. Solve it in O(min(n, m)) extra space.",
        "Example 1:\nInput: text1 = 'abcde', text2 = 'ace'\nOutput: 3\nExplanation: 'ace' is a subsequence of both strings.",
        "Example 2:\nInput: text1 = 'abc', text2 = 'def'\nOutput: 0\nExplanation: The strings share no character at all.",
        "Constraints:\n- 1 <= text1.length, text2.length <= 1000\n- Both strings consist of lowercase English letters",
      ],
      code: `int longestCommonSubsequence(string a, string b) {
    if (a.size() < b.size()) swap(a, b);      // keep the shorter string as the row
    int n = a.size(), m = b.size();
    vector<int> dp(m + 1, 0);
    for (int i = 1; i <= n; i++) {
        int prevDiag = 0;                      // holds dp[i-1][j-1] for the current j
        for (int j = 1; j <= m; j++) {
            int save = dp[j];                  // this is dp[i-1][j], the next diagonal
            if (a[i - 1] == b[j - 1]) dp[j] = prevDiag + 1;
            else dp[j] = max(dp[j], dp[j - 1]);   // dp[i-1][j] vs dp[i][j-1]
            prevDiag = save;
        }
    }
    return dp[m];
}`,
      explanation: [
        "The transition reads three neighbours: dp[i-1][j-1] on a match, and dp[i-1][j] and dp[i][j-1] otherwise. Two of them survive the one-array collapse for free - dp[j] before its write is dp[i-1][j], and dp[j-1] after its write is dp[i][j-1].",
        "The diagonal is the one value that gets destroyed too early, because dp[j-1] was overwritten on the previous iteration. Saving dp[j] into a scalar just before writing it, and carrying that scalar forward as prevDiag, restores it. Resetting prevDiag to 0 at the start of each row encodes dp[i-1][0] = 0.",
        "Two full rows (prev and cur) is the easier intermediate step and worth writing first if the diagonal juggling feels risky; it costs 2m instead of m and no correctness subtleties. Swapping so the shorter string indexes the row bounds the space by min(n, m).",
        "The cost of the collapse is that you can no longer walk the table backwards to recover the actual subsequence - reconstruction needs either the full O(n*m) table or Hirschberg's divide-and-conquer. Compress only after checking that the problem asks for a value, not a witness.",
        "Time: O(n*m). Space: O(min(n, m)).",
      ],
    },
    {
      name: "Edit Distance",
      difficulty: "Medium",
      variation: "One row plus diagonal temp, with a live first column",
      link: "https://leetcode.com/problems/edit-distance/",
      question: [
        "Given two strings word1 and word2, return the minimum number of single-character operations needed to turn word1 into word2. The allowed operations are insert a character, delete a character, and replace a character. Use O(m) extra space where m is the length of word2.",
        "Example 1:\nInput: word1 = 'horse', word2 = 'ros'\nOutput: 3\nExplanation: horse -> rorse (replace h with r) -> rose (delete r) -> ros (delete e).",
        "Example 2:\nInput: word1 = 'intention', word2 = 'execution'\nOutput: 5\nExplanation: One optimal script is five operations: intention -> inention -> enention -> exention -> exection -> execution.",
        "Constraints:\n- 0 <= word1.length, word2.length <= 500\n- Both strings consist of lowercase English letters",
      ],
      code: `int minDistance(string s, string t) {
    int n = s.size(), m = t.size();
    vector<int> dp(m + 1);
    for (int j = 0; j <= m; j++) dp[j] = j;      // row 0: insert every char of t
    for (int i = 1; i <= n; i++) {
        int prevDiag = dp[0];                    // dp[i-1][0]
        dp[0] = i;                               // first column: delete i chars of s
        for (int j = 1; j <= m; j++) {
            int save = dp[j];                    // dp[i-1][j]
            if (s[i - 1] == t[j - 1]) dp[j] = prevDiag;
            else dp[j] = 1 + min({prevDiag, dp[j - 1], dp[j]});   // replace, insert, delete
            prevDiag = save;
        }
    }
    return dp[m];
}`,
      explanation: [
        "State dp[i][j] is the edit distance between the first i characters of s and the first j of t. On a mismatch the last operation is a replace (diagonal), an insert (left) or a delete (above), so the cost is one plus the cheapest of the three; on a match no operation is needed and the answer is the diagonal unchanged.",
        "The collapse is the same trick as LCS with one extra wrinkle: the first column is not constant. dp[i][0] = i, so dp[0] must be captured into prevDiag as dp[i-1][0] and then overwritten with i before the inner loop starts. Doing those two steps in the wrong order corrupts the diagonal for j = 1 and produces answers that are off by one on strings starting with different characters.",
        "Both boundary rows carry real meaning and cannot be zero: turning a prefix of s into the empty string costs one delete per character, and the reverse costs one insert per character.",
        "A tempting shortcut is to compute length(s) + length(t) - 2 * LCS length; that is the correct answer only when replacement is disallowed, since a replace does the work of a delete plus an insert for a single unit of cost.",
        "Time: O(n*m). Space: O(m).",
      ],
    },
    {
      name: "Cheapest Flights Within K Stops",
      difficulty: "Medium",
      variation: "Layered DP where an in-place update is wrong",
      link: "https://leetcode.com/problems/cheapest-flights-within-k-stops/",
      question: [
        "There are n cities numbered 0..n-1 connected by directed flights, where flights[i] = [from, to, price]. Given src, dst and an integer k, return the cheapest price from src to dst using at most k stops, or -1 if there is no such route. At most k stops means at most k+1 flights.",
        "Example 1:\nInput: n = 4, flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src = 0, dst = 3, k = 1\nOutput: 700\nExplanation: 0 -> 1 -> 3 costs 700 and uses one stop. The cheaper 0 -> 1 -> 2 -> 3 at 400 needs two stops and is not allowed.",
        "Example 2:\nInput: n = 3, flights = [[0,1,100],[1,2,100],[0,2,500]], src = 0, dst = 2, k = 1\nOutput: 200\nExplanation: 0 -> 1 -> 2 uses one stop and costs 200.",
        "Example 3:\nInput: n = 3, flights = [[0,1,100],[1,2,100],[0,2,500]], src = 0, dst = 2, k = 0\nOutput: 500\nExplanation: With no stops allowed only the direct flight qualifies.",
        "Constraints:\n- 1 <= n <= 100\n- 0 <= flights.length <= (n * (n - 1) / 2)\n- 1 <= price <= 10^4\n- 0 <= k < n",
      ],
      code: `int findCheapestPrice(int n, vector<vector<int>>& flights, int src, int dst, int k) {
    const int INF = 1e9;
    vector<int> dist(n, INF);
    dist[src] = 0;
    for (int round = 0; round <= k; round++) {         // k+1 edge relaxation rounds
        vector<int> next = dist;                       // snapshot: reads must see round-1 only
        for (auto& f : flights) {
            int u = f[0], v = f[1], w = f[2];
            if (dist[u] != INF && dist[u] + w < next[v]) next[v] = dist[u] + w;
        }
        dist = move(next);
    }
    return dist[dst] == INF ? -1 : dist[dst];
}`,
      explanation: [
        "The natural state is dp[e][v] = cheapest cost to reach v using at most e edges, giving a table of size (k+2) x n. Since round e reads only round e-1, the table collapses to two arrays - but here the second array is mandatory, not optional.",
        "Relaxing edges directly into a single array lets one round chain several edges together, so a path with more than k+1 flights can leak into the answer. On Example 1, processing the edges in the given order in place would find 0 -> 1 -> 2 -> 3 for 400 in the very first round and report a route with two stops as legal.",
        "So the rule is about what the transition reads, not about how many arrays feel elegant: dist is the previous layer and stays frozen while next is filled. This is exactly why textbook Bellman-Ford, which does allow in-place relaxation, can only bound the number of edges by the number of full rounds and not by anything finer.",
        "Plain Dijkstra on cost is wrong for the same reason it is wrong for any hop-limited problem - the cheapest way to reach an intermediate city may use too many hops, so cost alone is not a valid settling key.",
        "Time: O(k * E). Space: O(n), two arrays of size n.",
      ],
    },
    {
      name: "Wildcard Matching",
      difficulty: "Hard",
      variation: "1D rolling row for a 2D string DP with a non-trivial base row",
      link: "https://leetcode.com/problems/wildcard-matching/",
      question: [
        "Given an input string s and a pattern p, return true if p matches the whole of s. The pattern may contain '?', which matches exactly one character, and '*', which matches any sequence of characters including the empty sequence. Solve it with O(length of p) extra space.",
        "Example 1:\nInput: s = 'adceb', p = '*a*b'\nOutput: true\nExplanation: The first star matches the empty string and the second matches 'dce'.",
        "Example 2:\nInput: s = 'cb', p = '?a'\nOutput: false\nExplanation: '?' matches 'c' but 'a' does not match 'b'.",
        "Constraints:\n- 0 <= s.length, p.length <= 2000\n- s contains only lowercase English letters\n- p contains lowercase English letters, '?' and '*'",
      ],
      code: `bool isMatch(string s, string p) {
    int n = s.size(), m = p.size();
    vector<char> dp(m + 1, 0);
    dp[0] = 1;                                   // empty pattern matches empty string
    for (int j = 1; j <= m; j++)
        dp[j] = dp[j - 1] && p[j - 1] == '*';    // base row: only all-star prefixes match ''
    for (int i = 1; i <= n; i++) {
        char prevDiag = dp[0];                   // dp[i-1][0]
        dp[0] = 0;                               // a non-empty string never matches ''
        for (int j = 1; j <= m; j++) {
            char save = dp[j];                   // dp[i-1][j]
            if (p[j - 1] == '*')
                dp[j] = dp[j] || dp[j - 1];      // star eats s[i-1], or matches empty
            else
                dp[j] = prevDiag && (p[j - 1] == '?' || p[j - 1] == s[i - 1]);
            prevDiag = save;
        }
    }
    return dp[m];
}`,
      explanation: [
        "State dp[i][j] = does the first i characters of s match the first j of p. For a literal or '?' the only option is to consume one character from each side, so dp[i][j] = dp[i-1][j-1] and a character test. For '*' there are two options: the star absorbs s[i-1], giving dp[i-1][j], or it matches nothing, giving dp[i][j-1].",
        "In the collapsed array both star terms are already available - dp[j] before the write is dp[i-1][j] and dp[j-1] after its write is dp[i][j-1] - so the star branch needs no scalar at all. Only the literal branch needs the saved diagonal, kept exactly as in Edit Distance.",
        "The base row is the part people get wrong. dp[0][j] is true only while every pattern character seen so far is a star, which is why it is computed as a running conjunction rather than set to false. And dp[i][0] must be forced to false for i >= 1 inside the row loop, after its old value has been captured as the diagonal.",
        "The greedy two-pointer solution that backtracks to the last star uses genuinely O(1) space, but the recurrence is the safer thing to reach for under time pressure. The wrong-but-tempting simplification is treating '*' as 'one or more characters', which rejects s = 'ab' against p = 'a*b' even though the star is allowed to match nothing.",
        "Time: O(n*m). Space: O(m).",
      ],
    },
  ],
};
