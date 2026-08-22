import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Fibonacci Number",
      difficulty: "Easy",
      variation: "Top-down memoization, the template",
      link: "https://leetcode.com/problems/fibonacci-number/",
      question: [
        "The Fibonacci numbers are defined by F(0) = 0, F(1) = 1, and F(n) = F(n-1) + F(n-2) for n > 1. Given n, return F(n).",
        "Example 1:\nInput: n = 4\nOutput: 3\nExplanation: F(4) = F(3) + F(2) = 2 + 1 = 3.",
        "Constraints:\n- 0 <= n <= 30",
      ],
      code: `class Solution {
    vector<int> memo;

    int solve(int n) {
        if (n <= 1) return n;                 // base case
        if (memo[n] != -1) return memo[n];    // already computed
        return memo[n] = solve(n - 1) + solve(n - 2);   // transition
    }

public:
    int fib(int n) {
        memo.assign(n + 1, -1);
        return solve(n);
    }
};`,
      explanation: [
        "This is the smallest problem that shows all four parts of a DP. State: the single index n, because F(n) depends on nothing else. Transition: F(n) = F(n-1) + F(n-2). Base case: n = 0 and n = 1 are known outright. Order: recursion picks the order for you - a subproblem is only returned after its children are solved.",
        "Plain recursion is exponential because F(n-2) is recomputed inside both F(n-1) and F(n). Memoization fixes exactly that: the first call for a value computes it, every later call reads the cache, so each of the n+1 distinct states is evaluated once.",
        "Use -1 as the 'not computed' marker only when -1 is not a legal answer. When it can be (say a signed DP value), keep a separate visited array or use an optional sentinel, otherwise a real -1 answer gets recomputed forever.",
        "Time: O(n) - one evaluation per state, O(1) work inside each. Space: O(n) for the table plus O(n) recursion stack.",
      ],
    },
    {
      name: "Fibonacci Number — Bottom-Up and O(1) Space",
      difficulty: "Easy",
      variation: "Tabulation, then rolling variables",
      link: "https://leetcode.com/problems/fibonacci-number/",
      question: [
        "Same problem as above: return F(n) for the Fibonacci sequence F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2). This time solve it iteratively, without recursion, and then reduce the memory to a constant number of variables.",
        "Example 1:\nInput: n = 10\nOutput: 55",
        "Constraints:\n- 0 <= n <= 90 (use 64-bit values beyond n = 46)",
      ],
      code: `// Step 1: tabulation - the memo table filled in dependency order.
long long fibTable(int n) {
    if (n <= 1) return n;
    vector<long long> dp(n + 1);
    dp[0] = 0;
    dp[1] = 1;
    for (int i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
    return dp[n];
}

// Step 2: the transition only looks back two rows, so two variables suffice.
long long fib(int n) {
    if (n <= 1) return n;
    long long prev2 = 0, prev1 = 1;
    for (int i = 2; i <= n; i++) {
        long long cur = prev1 + prev2;
        prev2 = prev1;
        prev1 = cur;
    }
    return prev1;
}`,
      explanation: [
        "Converting memoization to tabulation is mechanical: iterate the state in an order where every dependency is already filled. Here dp[i] needs i-1 and i-2, so increasing i works. The recursion's base cases become the array's initial values.",
        "Tabulation trades the recursion stack for an explicit loop. That matters when n is large - a recursive Fibonacci at n = 10^5 overflows the stack while the loop is fine.",
        "The space cut follows from one observation: the transition reads a window of the last two entries only, so nothing older ever needs to exist. Keeping prev1 and prev2 is the same algorithm with the dead history dropped. This is the pattern behind almost every 'reduce the DP to O(1) or O(n)' optimisation.",
        "Time: O(n). Space: O(n) for the table version, O(1) for the rolling version.",
      ],
    },
    {
      name: "Climbing Stairs",
      difficulty: "Easy",
      variation: "Counting paths, one-dimensional state",
      link: "https://leetcode.com/problems/climbing-stairs/",
      question: [
        "You are climbing a staircase that takes n steps to reach the top. Each time you can climb either 1 or 2 steps. In how many distinct ways can you climb to the top?",
        "Example 1:\nInput: n = 3\nOutput: 3\nExplanation: 1+1+1, 1+2, and 2+1.",
        "Constraints:\n- 1 <= n <= 45",
      ],
      code: `int climbStairs(int n) {
    int prev2 = 1;  // ways to stand on step 0 (do nothing)
    int prev1 = 1;  // ways to reach step 1
    for (int i = 2; i <= n; i++) {
        int cur = prev1 + prev2;
        prev2 = prev1;
        prev1 = cur;
    }
    return prev1;
}`,
      explanation: [
        "Define dp[i] as the number of ways to reach step i. The last move into step i was either a single step from i-1 or a double step from i-2, and those two sets of paths are disjoint and cover everything, so dp[i] = dp[i-1] + dp[i-2].",
        "That disjoint-and-exhaustive check is the whole job in a counting DP. If the cases can overlap you double count; if they miss a case you undercount. Here the cases are distinguished by the size of the final move, which every path has exactly one of.",
        "dp[0] = 1 is the subtle base case: there is exactly one way to be at the bottom - take no steps. Setting it to 0 would collapse the whole table to zero.",
        "It is Fibonacci shifted by one, which is a useful sanity check but not the reason it is correct.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Min Cost Climbing Stairs",
      difficulty: "Easy",
      variation: "Minimisation instead of counting",
      link: "https://leetcode.com/problems/min-cost-climbing-stairs/",
      question: [
        "You are given an integer array cost where cost[i] is the cost of the i-th step on a staircase. Once you pay the cost, you can climb either one or two steps. You can start from the step with index 0, or the step with index 1. Return the minimum cost to reach the top of the floor (index cost.size()).",
        "Example 1:\nInput: cost = [10, 15, 20]\nOutput: 15\nExplanation: Start at index 1, pay 15, and climb two steps to the top.",
        "Example 2:\nInput: cost = [1, 100, 1, 1, 1, 100, 1, 1, 100, 1]\nOutput: 6\nExplanation: Start at index 0 and step over every 100.",
        "Constraints:\n- 2 <= cost.length <= 1000\n- 0 <= cost[i] <= 999",
      ],
      code: `int minCostClimbingStairs(vector<int>& cost) {
    int n = cost.size();
    int prev2 = 0, prev1 = 0;   // cost to reach index 0 and index 1: free starts
    for (int i = 2; i <= n; i++) {
        int cur = min(prev1 + cost[i - 1], prev2 + cost[i - 2]);
        prev2 = prev1;
        prev1 = cur;
    }
    return prev1;
}`,
      explanation: [
        "Same state and same two incoming moves as Climbing Stairs; only the combining operator changes. Counting sums the branches, minimisation takes the smaller one. Recognising that a problem is 'a DP I already know with + swapped for min' is most of what pattern practice buys you.",
        "Define dp[i] as the cheapest way to *reach* index i, not to leave it. Then arriving at i costs the price of the step you departed from: dp[i] = min(dp[i-1] + cost[i-1], dp[i-2] + cost[i-2]). Keeping 'reach' and 'leave' straight is where most wrong answers come from here.",
        "The top of the floor is index n, one past the last step, which is why the loop runs to i = n inclusive.",
        "Both dp[0] and dp[1] are 0 because either index is a legal free starting point.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "N-th Tribonacci Number",
      difficulty: "Easy",
      variation: "Widening the look-back window",
      link: "https://leetcode.com/problems/n-th-tribonacci-number/",
      question: [
        "The Tribonacci sequence is defined by T(0) = 0, T(1) = 1, T(2) = 1, and T(n+3) = T(n) + T(n+1) + T(n+2) for n >= 0. Given n, return T(n).",
        "Example 1:\nInput: n = 4\nOutput: 4\nExplanation: T(3) = 0 + 1 + 1 = 2, T(4) = 1 + 1 + 2 = 4.",
        "Constraints:\n- 0 <= n <= 37, and the answer fits in a 32-bit integer",
      ],
      code: `int tribonacci(int n) {
    if (n == 0) return 0;
    if (n <= 2) return 1;
    int a = 0, b = 1, c = 1;   // T(i-3), T(i-2), T(i-1)
    for (int i = 3; i <= n; i++) {
        int cur = a + b + c;
        a = b;
        b = c;
        c = cur;
    }
    return c;
}`,
      explanation: [
        "The look-back window is three instead of two, so three rolling variables replace two. The number of variables you must keep is exactly the depth the transition reaches back - not a property you have to guess.",
        "Because the window widens, so does the set of base cases: a k-term recurrence needs k of them. Deriving T(3) from the recurrence requires T(0), T(1), T(2) to already be pinned down.",
        "The shifting order matters. Assigning a = b then b = c then c = cur moves the window forward one position; doing it in the reverse order would overwrite values still needed.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Frog Jump with K Distances",
      difficulty: "Medium",
      variation: "Transition over a loop of choices",
      link: "https://www.geeksforgeeks.org/minimal-cost/",
      question: [
        "A frog starts on stone 0 and wants to reach stone n-1. Stone i has height h[i]. From stone i the frog may jump to any of stones i+1, i+2, ..., i+k, and a jump from stone i to stone j costs abs(h[i] - h[j]) energy. Return the minimum total energy needed to reach stone n-1.",
        "Example 1:\nInput: h = [10, 30, 40, 50, 20], k = 3\nOutput: 30\nExplanation: 0 -> 1 -> 4 costs abs(10-30) + abs(30-20) = 20 + 10 = 30.",
        "Example 2:\nInput: h = [10, 20, 10], k = 1\nOutput: 20\nExplanation: The frog must take every stone: 10 + 10.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= k <= 100\n- 0 <= h[i] <= 10^4",
      ],
      code: `int minimizeCost(vector<int>& h, int k) {
    int n = h.size();
    const int INF = 1e9;
    vector<int> dp(n, INF);
    dp[0] = 0;
    for (int i = 1; i < n; i++) {
        for (int j = 1; j <= k && j <= i; j++) {
            if (dp[i - j] == INF) continue;
            dp[i] = min(dp[i], dp[i - j] + abs(h[i] - h[i - j]));
        }
    }
    return dp[n - 1];
}`,
      explanation: [
        "Up to now each state had a fixed two or three predecessors. Here the frog can arrive from any of the previous k stones, so the transition becomes a loop over choices and dp[i] takes the minimum across all of them. The state is unchanged - still just 'the stone I am standing on'.",
        "The guard j <= i keeps the index in range near the start of the array, and skipping unreachable predecessors avoids adding a cost on top of INF.",
        "Note where the cost lives: it depends on both i and the stone jumped from, so it must be computed inside the choice loop, not hoisted out. A common bug is folding a per-choice cost into the state as if it were fixed.",
        "The O(1)-space trick no longer applies as written, because the window is k wide - you would keep a k-sized circular buffer instead of two scalars. With k up to 100 and n up to 10^5 the full array is cheap, so there is no reason to.",
        "Time: O(n*k). Space: O(n).",
      ],
    },
    {
      name: "Count Ways to Reach the N-th Stair with Steps of 1, 2 or 3",
      difficulty: "Easy",
      variation: "Counting with three choices, modular arithmetic",
      link: "https://www.geeksforgeeks.org/count-ways-reach-nth-stair-using-step-1-2-3/",
      question: [
        "Count the number of distinct ways to climb n stairs when each move can be 1, 2 or 3 stairs. Two ways are different if the sequence of move sizes differs. Return the count modulo 10^9 + 7.",
        "Example 1:\nInput: n = 4\nOutput: 7\nExplanation: 1+1+1+1, 1+1+2, 1+2+1, 2+1+1, 2+2, 1+3, 3+1.",
        "Constraints:\n- 1 <= n <= 10^5",
      ],
      code: `int countWays(int n) {
    const long long MOD = 1e9 + 7;
    vector<long long> dp(n + 1, 0);
    dp[0] = 1;
    for (int i = 1; i <= n; i++) {
        dp[i] = dp[i - 1];
        if (i >= 2) dp[i] = (dp[i] + dp[i - 2]) % MOD;
        if (i >= 3) dp[i] = (dp[i] + dp[i - 3]) % MOD;
    }
    return (int)dp[n];
}`,
      explanation: [
        "Splitting on the size of the last move again: the paths ending in a 1-step, a 2-step and a 3-step are disjoint, so dp[i] = dp[i-1] + dp[i-2] + dp[i-3].",
        "Order matters here and the problem says so - 1+3 and 3+1 both count. That is what makes this a sequence count rather than a combination count. If order did not matter the recurrence would be wrong and you would need the coin-change 'count combinations' loop structure instead.",
        "The count grows roughly like 1.84^n, so it overflows a 64-bit integer well before n = 100. Reducing modulo 10^9+7 at every addition, with the table typed long long so the intermediate sum cannot wrap, is the standard defence.",
        "Time: O(n). Space: O(n), reducible to O(1) with three rolling variables.",
      ],
    },
    {
      name: "Tiling a 2 x N Floor with 2 x 1 Dominoes",
      difficulty: "Easy",
      variation: "Deriving the recurrence from the shape of the last move",
      link: "https://www.geeksforgeeks.org/tiling-problem/",
      question: [
        "Given a 2 x n board and an unlimited supply of 2 x 1 dominoes, count the number of ways to tile the board completely. A domino may be placed vertically (covering a 2 x 1 area) or horizontally (covering a 1 x 2 area). Return the count modulo 10^9 + 7.",
        "Example 1:\nInput: n = 3\nOutput: 3\nExplanation: three verticals; one vertical then two stacked horizontals; two stacked horizontals then one vertical.",
        "Example 2:\nInput: n = 4\nOutput: 5",
        "Constraints:\n- 1 <= n <= 10^5",
      ],
      code: `int numberOfWays(int n) {
    const long long MOD = 1e9 + 7;
    if (n <= 2) return n;
    long long prev2 = 1, prev1 = 2;   // dp[1] = 1, dp[2] = 2
    for (int i = 3; i <= n; i++) {
        long long cur = (prev1 + prev2) % MOD;
        prev2 = prev1;
        prev1 = cur;
    }
    return (int)prev1;
}`,
      explanation: [
        "Look only at how the rightmost column is finished. Either one vertical domino covers it, leaving a 2 x (n-1) board, or two horizontal dominoes stack to cover the last two columns, leaving 2 x (n-2). There is no third way - a single horizontal domino would leave a lone uncovered cell that nothing can fill.",
        "So dp[n] = dp[n-1] + dp[n-2], with dp[1] = 1 and dp[2] = 2. This is the lesson worth taking: the recurrence is not memorised, it is read off from an exhaustive case split on the last decision.",
        "Notice that a *pair* of horizontals is one case, not two. Counting them separately would double count - a reminder that the case split must be on distinct final configurations, not on individual pieces.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Dice Combinations",
      difficulty: "Easy",
      variation: "Counting ordered sequences, six choices",
      link: "https://cses.fi/problemset/task/1633",
      question: [
        "Your task is to count the number of ways to construct sum n by throwing a standard six-sided die one or more times. Each throw contributes a value between 1 and 6, and two constructions differ if the sequence of throws differs. Print the answer modulo 10^9 + 7.",
        "Example 1:\nInput: n = 3\nOutput: 4\nExplanation: 1+1+1, 1+2, 2+1, 3.",
        "Constraints:\n- 1 <= n <= 10^6",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const long long MOD = 1e9 + 7;
    int n;
    cin >> n;
    vector<long long> dp(n + 1, 0);
    dp[0] = 1;
    for (int i = 1; i <= n; i++) {
        for (int face = 1; face <= 6 && face <= i; face++) {
            dp[i] = (dp[i] + dp[i - face]) % MOD;
        }
    }
    cout << dp[n] << "\\n";
    return 0;
}`,
      explanation: [
        "The stair-climbing recurrence with six choices instead of two: dp[i] = sum of dp[i-face] for face in 1..6, split on the value of the *last* throw.",
        "dp[0] = 1 encodes the empty sequence, which is what makes dp[face] come out right for the single-throw cases.",
        "Because n reaches 10^6, this is where iteration stops being a stylistic choice. A memoised recursion here recurses a million frames deep and segfaults on most judges; the bottom-up loop has no stack at all.",
        "Time: O(6n). Space: O(n).",
      ],
    },
    {
      name: "Removing Digits",
      difficulty: "Easy",
      variation: "State = the number itself, choices = its digits",
      link: "https://cses.fi/problemset/task/1637",
      question: [
        "You are given an integer n. On each step you may subtract from n one of the digits that currently appears in n. Print the minimum number of steps required to make n equal to 0.",
        "Example 1:\nInput: n = 27\nOutput: 5\nExplanation: 27 -> 20 -> 18 -> 10 -> 9 -> 0.",
        "Constraints:\n- 1 <= n <= 10^6",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> dp(n + 1, 0);
    for (int v = 1; v <= n; v++) {
        int best = INT_MAX;
        for (int x = v; x > 0; x /= 10) {
            int d = x % 10;
            if (d > 0) best = min(best, dp[v - d] + 1);
        }
        dp[v] = best;
    }
    cout << dp[n] << "\\n";
    return 0;
}`,
      explanation: [
        "The state is the current value v and dp[v] is the fewest steps to drive v to zero. Every legal move subtracts one of v's own digits, so the choices are read off the state rather than given by the problem as a fixed list.",
        "That is the point of this problem: a state does not have to be an array index. Anything that fully determines the remaining subproblem works, and here the number itself is enough - how you got to v does not matter.",
        "Greedy 'always subtract the largest digit' is the trap and it is nearly right, which is what makes it dangerous. dp is unconditionally safe and still linear, so there is no reason to gamble.",
        "Every move subtracts at least 1, so dp[v-d] is always a strictly smaller state and increasing v is a valid fill order.",
        "Time: O(n log n) - about seven digit extractions per value. Space: O(n).",
      ],
    },
    {
      name: "Perfect Squares",
      difficulty: "Medium",
      variation: "Unbounded choices generated from the state",
      link: "https://leetcode.com/problems/perfect-squares/",
      question: [
        "Given an integer n, return the least number of perfect square numbers that sum to n. A perfect square is the product of an integer with itself (1, 4, 9, 16, ...). The same square may be used any number of times.",
        "Example 1:\nInput: n = 12\nOutput: 3\nExplanation: 12 = 4 + 4 + 4.",
        "Example 2:\nInput: n = 13\nOutput: 2\nExplanation: 13 = 4 + 9.",
        "Constraints:\n- 1 <= n <= 10^4",
      ],
      code: `int numSquares(int n) {
    vector<int> dp(n + 1, INT_MAX);
    dp[0] = 0;
    for (int v = 1; v <= n; v++) {
        for (int r = 1; r * r <= v; r++) {
            dp[v] = min(dp[v], dp[v - r * r] + 1);
        }
    }
    return dp[n];
}`,
      explanation: [
        "dp[v] is the fewest squares summing to v. Split on the last square used: if it is r*r then the rest costs dp[v - r*r], so dp[v] = 1 + min over r of dp[v - r*r].",
        "Reusing the same square any number of times needs no extra state - dp[v - r*r] is free to use r again. Contrast this with a 'use each item once' problem, which genuinely does need a second dimension tracking what has been consumed.",
        "dp[0] = 0 is the anchor and it is reachable from every v via some square, so no INT_MAX ever survives into the answer and the min never overflows.",
        "Lagrange's four-square theorem guarantees the answer is always 1, 2, 3 or 4, which gives an O(sqrt n) number-theoretic solution. The DP is the one worth knowing - it generalises to any coin set, while the theorem does not.",
        "Time: O(n * sqrt n). Space: O(n).",
      ],
    },
    {
      name: "Unique Paths",
      difficulty: "Medium",
      variation: "Two-dimensional state, fill order in 2D",
      link: "https://leetcode.com/problems/unique-paths/",
      question: [
        "A robot sits at the top-left corner of an m x n grid and wants to reach the bottom-right corner. It can only move right or down. Return the number of distinct paths.",
        "Example 1:\nInput: m = 3, n = 7\nOutput: 28",
        "Example 2:\nInput: m = 3, n = 2\nOutput: 3\nExplanation: down-down-right, down-right-down, right-down-down.",
        "Constraints:\n- 1 <= m, n <= 100, and the answer is at most 2 * 10^9",
      ],
      code: `int uniquePaths(int m, int n) {
    vector<int> dp(n, 1);           // top row: exactly one way to reach each cell
    for (int i = 1; i < m; i++) {
        for (int j = 1; j < n; j++) {
            dp[j] += dp[j - 1];     // dp[j] is still row i-1; dp[j-1] is already row i
        }
    }
    return dp[n - 1];
}`,
      explanation: [
        "First problem here where the state needs two numbers. dp[i][j] is the number of paths to cell (i, j), and since the robot enters from the left or from above, dp[i][j] = dp[i-1][j] + dp[i][j-1]. The whole first row and first column are 1 - there is a single straight-line path along each edge.",
        "The fill order generalises from 1D: process states so that every dependency is already computed. Row by row, left to right, does it - both predecessors are above or to the left.",
        "The single-array version deserves a careful read, because it is the pattern behind most 2D-to-1D space cuts. When the loop reaches column j, dp[j] has not been touched this row so it still holds dp[i-1][j], while dp[j-1] was updated a moment ago and holds dp[i][j-1]. So `dp[j] += dp[j-1]` is exactly the intended transition. Reversing the inner loop would break it.",
        "Time: O(m*n). Space: O(n). There is a closed form C(m+n-2, m-1), but the DP is the version that survives obstacles being added.",
      ],
    },
  ],
};
