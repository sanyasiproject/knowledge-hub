import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "0 - 1 Knapsack Problem",
      difficulty: "Medium",
      variation: "One copy per item, the template",
      link: "https://www.geeksforgeeks.org/0-1-knapsack-problem-dp-10/",
      question: [
        "You are given n items, where item i weighs wt[i] and is worth val[i], and a bag that can carry a total weight of at most W. Each item exists in exactly one copy: you either put the whole item in the bag or leave it out, you cannot take a fraction of it. Return the maximum total value you can carry.",
        "Example 1:\nInput: W = 50, wt = [10, 20, 30], val = [60, 100, 120]\nOutput: 220\nExplanation: Taking items 2 and 3 fills the bag exactly (20 + 30 = 50) for 100 + 120 = 220. Taking items 1 and 2 gives only 160, and item 3 alone gives 120.",
        "Example 2:\nInput: W = 4, wt = [4, 5, 1], val = [1, 2, 3]\nOutput: 3\nExplanation: Only item 3 (weight 1) and item 1 (weight 4) fit at all, and item 3 alone is worth more than item 1.",
        "Constraints:\n- 1 <= n <= 1000\n- 1 <= W <= 1000\n- 1 <= wt[i], val[i] <= 1000",
      ],
      code: `// Textbook 2D form: dp[i][w] = best value using the first i items with capacity w.
int knapSack2D(int W, vector<int>& wt, vector<int>& val) {
    int n = wt.size();
    vector<vector<int>> dp(n + 1, vector<int>(W + 1, 0));
    for (int i = 1; i <= n; i++) {
        for (int w = 0; w <= W; w++) {
            dp[i][w] = dp[i - 1][w];                       // skip item i
            if (wt[i - 1] <= w)                            // or take it once
                dp[i][w] = max(dp[i][w], dp[i - 1][w - wt[i - 1]] + val[i - 1]);
        }
    }
    return dp[n][W];
}

// Rolled to one row. The capacity loop MUST run downwards so that
// dp[w - wt[i]] still refers to the previous item's row - that is what
// enforces "at most one copy".
int knapSack(int W, vector<int>& wt, vector<int>& val) {
    int n = wt.size();
    vector<int> dp(W + 1, 0);
    for (int i = 0; i < n; i++)
        for (int w = W; w >= wt[i]; w--)
            dp[w] = max(dp[w], dp[w - wt[i]] + val[i]);
    return dp[W];
}`,
      explanation: [
        "State: dp[i][w] is the best value obtainable from the first i items under capacity w. The decision for item i is binary, so the two branches 'leave it' and 'take it' are exhaustive and disjoint, and the recurrence is just the max of the two.",
        "The 1D version is the same table with only the previous row kept alive. Descending w is the entire trick: when dp[w] is written, dp[w - wt[i]] has not been touched yet in this item's pass, so it is still the value from row i-1 and item i cannot be reused. Flip the loop to ascending and you have silently solved the unbounded knapsack instead - that single direction is the difference between the two classic variants.",
        "The tempting wrong approach is greedy by value/weight ratio. That is optimal only when items can be split (fractional knapsack); with indivisible items it fails on cases like W = 4, wt = [3, 2, 2], val = [5, 3, 3], where the best ratio item blocks the optimal pair.",
        "The complexity is pseudo-polynomial: it is linear in the numeric value of W, not in its bit length, so a knapsack with W = 10^12 is out of reach for this table even with few items.",
        "Time: O(n * W). Space: O(W) for the rolled version, O(n * W) for the 2D table.",
      ],
    },
    {
      name: "Book Shop",
      difficulty: "Medium",
      variation: "0/1 knapsack on a judge, exact input/output",
      link: "https://cses.fi/problemset/task/1158",
      question: [
        "You are in a book shop that sells n different books. You know the price and the number of pages of every book. You have x units of money. Each book can be bought at most once. Print the maximum number of pages you can buy.",
        "Input: the first line has two integers n and x. The second line has n integers h[1..n], the prices. The third line has n integers s[1..n], the page counts.",
        "Example 1:\nInput:\n4 10\n4 8 5 3\n5 12 8 1\nOutput: 13\nExplanation: Buying book 1 (price 4, 5 pages) and book 3 (price 5, 8 pages) costs 9 and gives 13 pages. Book 2 alone gives 12 pages, and no affordable pair beats 13.",
        "Constraints:\n- 1 <= n <= 1000\n- 1 <= x <= 10^5\n- 1 <= h[i], s[i] <= 1000",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, x;
    cin >> n >> x;
    vector<int> price(n), pages(n);
    for (int i = 0; i < n; i++) cin >> price[i];
    for (int i = 0; i < n; i++) cin >> pages[i];
    vector<int> dp(x + 1, 0);            // dp[b] = best pages with budget b
    for (int i = 0; i < n; i++)
        for (int b = x; b >= price[i]; b--)   // descending: one copy per book
            dp[b] = max(dp[b], dp[b - price[i]] + pages[i]);
    cout << dp[x] << "\\n";
    return 0;
}`,
      explanation: [
        "This is the plain 0/1 knapsack with money as the capacity and pages as the value. Recognising the mapping is the whole exercise: 'each item at most once' plus 'a single additive budget' is always this table.",
        "dp[b] means 'best pages achievable spending at most b', not 'exactly b'. Initialising the whole array to 0 rather than to minus infinity is what makes it an at-most table, so no separate feasibility check is needed and dp[x] is directly the answer.",
        "1000 * 100001 states is about 10^8 single-int max operations, fine in C++ with the flat 1D array but not with a 2D vector of vectors, which would also need 400 MB. The rolled row is required here, not just tidier.",
        "Both dimensions fit in int: at most 1000 books of 1000 pages is 10^6.",
        "Time: O(n * x). Space: O(x).",
      ],
    },
    {
      name: "Knapsack with Duplicate Items (Unbounded Knapsack)",
      difficulty: "Medium",
      variation: "Unlimited copies per item type",
      question: [
        "You are given n item types, where type i weighs wt[i] and is worth val[i], and a bag of capacity W. Unlike the 0/1 version, each type is available in unlimited supply: you may take the same type as many times as it fits. Return the maximum total value you can carry.",
        "Example 1:\nInput: W = 3, wt = [2, 1], val = [1, 1]\nOutput: 3\nExplanation: Take type 2 three times for a value of 3, which beats one copy of type 1 plus one of type 2 (value 2).",
        "Example 2:\nInput: W = 8, wt = [1, 3, 4, 5], val = [10, 40, 50, 70]\nOutput: 110\nExplanation: Weights 5 and 3 fill the bag exactly for 70 + 40 = 110. Two copies of weight 4 give 100, and eight copies of weight 1 give only 80.",
        "Constraints:\n- 1 <= n <= 1000\n- 1 <= W <= 1000\n- 1 <= wt[i], val[i] <= 1000",
      ],
      code: `int unboundedKnapsack(int W, vector<int>& wt, vector<int>& val) {
    int n = wt.size();
    vector<int> dp(W + 1, 0);            // dp[w] = best value with capacity w
    for (int i = 0; i < n; i++)
        for (int w = wt[i]; w <= W; w++)  // ascending: reuse of item i is intended
            dp[w] = max(dp[w], dp[w - wt[i]] + val[i]);
    return dp[W];
}

// Equivalent capacity-outer form: often easier to reason about, because
// dp[w] just asks "which type did I put in last?".
int unboundedKnapsackByCapacity(int W, vector<int>& wt, vector<int>& val) {
    vector<int> dp(W + 1, 0);
    for (int w = 1; w <= W; w++)
        for (size_t i = 0; i < wt.size(); i++)
            if (wt[i] <= w) dp[w] = max(dp[w], dp[w - wt[i]] + val[i]);
    return dp[W];
}`,
      explanation: [
        "State: dp[w] is the best value for capacity w with all types always available. Because supply is unlimited, the item index is not part of the state at all - that is why the second form, which loops over capacity and tries every type as the last item taken, is also correct here but would be wrong for 0/1.",
        "In the item-outer form the ascending capacity loop is deliberate. dp[w - wt[i]] has already been updated in this same pass, so it may already contain copies of item i, and adding one more copy is exactly the behaviour we want. Compare with the descending loop of the 0/1 version: same three lines, opposite meaning.",
        "The tempting wrong approach is to take as many of the best ratio item as fit and then fill the remainder greedily. With W = 8 and weights [5, 4] valued [70, 50] the ratios say 5 first (14 per unit) leaving 3 wasted for 70, while two copies of 4 give 100.",
        "For maximisation dp starts at 0 everywhere, meaning 'at most w'. If the problem instead demanded the capacity be filled exactly, initialise dp[0] = 0 and the rest to a negative sentinel and never relax from an unreachable cell.",
        "Time: O(n * W). Space: O(W).",
      ],
    },
    {
      name: "Perfect Squares",
      difficulty: "Medium",
      variation: "Unbounded knapsack, minimise item count",
      link: "https://leetcode.com/problems/perfect-squares/",
      question: [
        "Given an integer n, return the least number of perfect square numbers that sum to n. A perfect square is an integer that is the square of an integer, so 1, 4, 9 and 16 are perfect squares while 3 and 11 are not. Squares may be repeated.",
        "Example 1:\nInput: n = 12\nOutput: 3\nExplanation: 12 = 4 + 4 + 4. No two squares sum to 12.",
        "Example 2:\nInput: n = 13\nOutput: 2\nExplanation: 13 = 4 + 9.",
        "Constraints:\n- 1 <= n <= 10^4",
      ],
      code: `int numSquares(int n) {
    const int INF = 1e9;
    vector<int> dp(n + 1, INF);
    dp[0] = 0;                                  // empty sum
    for (int i = 1; i <= n; i++)
        for (int j = 1; j * j <= i; j++)        // j*j is the last square used
            dp[i] = min(dp[i], dp[i - j * j] + 1);
    return dp[n];
}`,
      explanation: [
        "The item types are the squares 1, 4, 9, ... up to n, each with unlimited supply and unit cost, and the capacity must be hit exactly. So this is an unbounded knapsack that minimises the number of items instead of maximising value.",
        "Exact-fill changes the initialisation, not the transition: dp[0] = 0 and everything else infinity, so a cell only becomes finite when some real decomposition reaches it. Here every n is reachable (n copies of 1), so no unreachable-state guard is needed, but with arbitrary item weights you must check dp[i - w] != INF before adding.",
        "The greedy 'subtract the largest square that fits' is wrong: for n = 12 it takes 9 then 1 + 1 + 1 for four terms, while the optimum is three fours. Greedy on the largest denomination only works for special coin systems, never in general.",
        "Lagrange's four-square theorem bounds the answer at 4 and gives an O(sqrt n) case analysis, but the DP is the pattern worth carrying: any 'fewest items summing to a target' question is this table.",
        "Time: O(n * sqrt n). Space: O(n).",
      ],
    },
    {
      name: "Coin Change II",
      difficulty: "Medium",
      variation: "Unbounded counting, combinations",
      link: "https://leetcode.com/problems/coin-change-ii/",
      question: [
        "You are given an integer array coins holding distinct coin denominations and an integer amount. Return the number of different combinations of coins that add up to amount. You have an infinite number of each coin. Two combinations that use the same multiset of coins in a different order count as one. If no combination reaches amount, return 0.",
        "Example 1:\nInput: amount = 5, coins = [1, 2, 5]\nOutput: 4\nExplanation: The combinations are 5, 2+2+1, 2+1+1+1 and 1+1+1+1+1.",
        "Example 2:\nInput: amount = 3, coins = [2]\nOutput: 0\nExplanation: Only even totals are reachable with a single coin of value 2.",
        "Constraints:\n- 1 <= coins.length <= 300\n- 1 <= coins[i] <= 5000\n- 0 <= amount <= 5000\n- The answer fits in a signed 32-bit integer",
      ],
      code: `int change(int amount, vector<int>& coins) {
    vector<unsigned int> dp(amount + 1, 0);
    dp[0] = 1;                                  // one way to make 0: take nothing
    for (int c : coins)                         // coin OUTER: fixes an order on
        for (int a = c; a <= amount; a++)       // the coins, so each multiset is
            dp[a] += dp[a - c];                 // counted exactly once
    return (int)dp[amount];
}`,
      explanation: [
        "State: dp[a] is the number of combinations summing to a using the coin types processed so far. Processing coins in the outer loop means that after coin c is done, dp[] accounts for every multiset drawn from the prefix of coin types up to c - and a multiset has exactly one representation as 'how many of coin 1, how many of coin 2, ...', so nothing is double counted.",
        "The inner loop ascends because a combination may reuse coin c any number of times; dp[a - c] already includes combinations that contain c.",
        "Swapping the loops is the classic trap. With amount outer and coins inner you count ordered sequences instead, turning 2+1 and 1+2 into two answers - that is Combination Sum IV, a different problem. Loop order is not a style choice in unbounded counting DP, it decides which quantity you compute.",
        "dp[0] = 1 is the seed that makes the whole thing work: the empty selection is one valid way of reaching 0. Setting it to 0 zeroes the entire table.",
        "The intermediate sums can exceed the signed range on adversarial inputs even when the final answer fits, so accumulating in unsigned int (or long long) avoids undefined overflow.",
        "Time: O(n * amount). Space: O(amount).",
      ],
    },
    {
      name: "Combination Sum IV",
      difficulty: "Medium",
      variation: "Unbounded counting, permutations (loop order flipped)",
      link: "https://leetcode.com/problems/combination-sum-iv/",
      question: [
        "Given an array of distinct positive integers nums and a target integer target, return the number of possible ordered combinations that add up to target. Sequences using the same numbers in a different order count as different answers, and each number may be used any number of times.",
        "Example 1:\nInput: nums = [1, 2, 3], target = 4\nOutput: 7\nExplanation: The sequences are (1,1,1,1), (1,1,2), (1,2,1), (2,1,1), (1,3), (3,1) and (2,2).",
        "Example 2:\nInput: nums = [9], target = 3\nOutput: 0\nExplanation: 9 already exceeds the target.",
        "Constraints:\n- 1 <= nums.length <= 200\n- 1 <= nums[i] <= 1000, all values distinct\n- 1 <= target <= 1000\n- The answer fits in a signed 32-bit integer",
      ],
      code: `int combinationSum4(int target, vector<int>& nums) {
    vector<unsigned int> dp(target + 1, 0);
    dp[0] = 1;
    for (int t = 1; t <= target; t++)           // target OUTER
        for (int v : nums)                      // v is the LAST element chosen
            if (v <= t) dp[t] += dp[t - v];
    return (int)dp[target];
}`,
      explanation: [
        "Here dp[t] counts ordered sequences summing to t, and the natural decomposition is by the last element of the sequence: every sequence ending in v corresponds to exactly one shorter sequence summing to t - v. Because the last element is a well-defined property of a sequence, the cases are disjoint and complete.",
        "That decomposition needs every value available at every t, which is precisely why the target must be the outer loop. This is the mirror image of Coin Change II: identical array, identical single-line transition, opposite loop nesting, and the two answers differ (7 versus 4 on nums = [1,2,3], target = 4).",
        "Practical rule to memorise: item outer counts combinations (multisets), capacity outer counts permutations (sequences). Say out loud which one the statement asks for before writing the loops.",
        "Negative numbers would break the DP entirely - a sequence could grow without bound and the count becomes infinite, which is why the constraint says positive. The follow-up question on LeetCode is exactly this.",
        "Time: O(target * n). Space: O(target).",
      ],
    },
    {
      name: "Ones and Zeroes",
      difficulty: "Medium",
      variation: "0/1 knapsack with two capacities",
      link: "https://leetcode.com/problems/ones-and-zeroes/",
      question: [
        "You are given an array of binary strings strs and two integers m and n. Return the size of the largest subset of strs such that the strings in it contain at most m zeros and at most n ones in total. Each string may be used at most once.",
        "Example 1:\nInput: strs = ['10', '0001', '111001', '1', '0'], m = 5, n = 3\nOutput: 4\nExplanation: The subset {'10', '0001', '1', '0'} uses 5 zeros and 3 ones, which is exactly the budget. No subset of size 5 fits, because including '111001' would need 4 ones.",
        "Example 2:\nInput: strs = ['10', '0', '1'], m = 1, n = 1\nOutput: 2\nExplanation: {'0', '1'} uses one zero and one one. The string '10' alone also fits but only gives size 1.",
        "Constraints:\n- 1 <= strs.length <= 600\n- 1 <= strs[i].length <= 100\n- 1 <= m, n <= 100",
      ],
      code: `int findMaxForm(vector<string>& strs, int m, int n) {
    // dp[i][j] = largest subset using at most i zeros and j ones
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
    for (const string& s : strs) {
        int zeros = count(s.begin(), s.end(), '0');
        int ones = (int)s.size() - zeros;
        for (int i = m; i >= zeros; i--)          // both capacity loops descend,
            for (int j = n; j >= ones; j--)       // so each string is used once
                dp[i][j] = max(dp[i][j], dp[i - zeros][j - ones] + 1);
    }
    return dp[m][n];
}`,
      explanation: [
        "Each string is an item with a two-dimensional weight (its zero count and its one count) and value 1, and there are two independent budgets. The knapsack template generalises to any fixed number of additive capacities: add a dimension to the table, nothing else changes.",
        "Both capacity loops must run downwards for the same reason as the 1D case. Descending order guarantees dp[i - zeros][j - ones] is still the value from before this string was considered, so no string is counted twice. Getting one of the two loops ascending is the usual bug and quietly allows repeats.",
        "Maximising the subset size, not the number of characters, is why the value added is 1 rather than the string length - a common misreading.",
        "Greedy by shortest string first is wrong because the two budgets are separate: a short string may consume the scarce resource. For example with m = 0, n = 3 the string '0' is short but unusable, while '111' is the only useful item.",
        "Time: O(L * m * n) where L is the total number of characters plus 600 * m * n table updates. Space: O(m * n).",
      ],
    },
    {
      name: "Number of Dice Rolls With Target Sum",
      difficulty: "Medium",
      variation: "Group knapsack, exactly one item per group",
      link: "https://leetcode.com/problems/number-of-dice-rolls-with-target-sum/",
      question: [
        "You have n dice, and each die has k faces numbered from 1 to k. Return the number of possible ways to roll the dice so that the sum of the face-up numbers equals target. Two ways are different if any die shows a different face. Since the answer may be large, return it modulo 10^9 + 7.",
        "Example 1:\nInput: n = 1, k = 6, target = 3\nOutput: 1\nExplanation: The single die must show 3.",
        "Example 2:\nInput: n = 2, k = 6, target = 7\nOutput: 6\nExplanation: The pairs are (1,6), (2,5), (3,4), (4,3), (5,2) and (6,1).",
        "Constraints:\n- 1 <= n, k <= 30\n- 1 <= target <= 1000",
      ],
      code: `int numRollsToTarget(int n, int k, int target) {
    const int MOD = 1e9 + 7;
    vector<int> dp(target + 1, 0);
    dp[0] = 1;
    for (int d = 1; d <= n; d++) {              // one group per die
        vector<int> ndp(target + 1, 0);         // fresh row: exactly one face is
        for (int t = 0; t <= target; t++) {     // chosen from this group
            if (!dp[t]) continue;
            for (int f = 1; f <= k && t + f <= target; f++)
                ndp[t + f] = (ndp[t + f] + dp[t]) % MOD;
        }
        dp = move(ndp);
    }
    return dp[target];
}`,
      explanation: [
        "This is the grouped variant: the item types are partitioned into n groups (the dice) and exactly one item must be picked from each group, rather than at most one overall. The extra requirement is encoded by the group index being part of the state - dp after d rounds means 'd dice already rolled'.",
        "Writing into a fresh row ndp is what enforces 'exactly one per group': a value written in round d can only be read in round d+1, so two faces of the same die can never both be charged. Updating dp in place would let one die contribute several faces. If you want the in-place 1D form you must keep the die count as a real second dimension.",
        "Because every die must be used, dp[target] at the end already excludes short rolls; there is no separate check that all n dice were spent. Note also that target < n or target > n * k gives 0 automatically, no special case needed.",
        "Take the modulus at every addition. Two int values below 10^9 + 7 sum to under 2^31, so int arithmetic is safe here, but one more addition without reducing would overflow.",
        "Time: O(n * target * k). Space: O(target).",
      ],
    },
    {
      name: "Number of Ways to Earn Points",
      difficulty: "Hard",
      variation: "Bounded knapsack, limited copies per type",
      link: "https://leetcode.com/problems/number-of-ways-to-earn-points/",
      question: [
        "There is a test with types.length question types. types[i] = [count_i, marks_i] means there are count_i questions of the i-th type, and each of them is worth marks_i marks. Return the number of ways you can earn exactly target marks. Two ways are different if they answer a different number of questions of some type; questions of the same type are indistinguishable. Return the answer modulo 10^9 + 7.",
        "Example 1:\nInput: target = 6, types = [[6,1],[3,2],[2,3]]\nOutput: 7\nExplanation: Writing the counts as (ones, twos, threes): (6,0,0), (4,1,0), (2,2,0), (0,3,0), (3,0,1), (1,1,1) and (0,0,2).",
        "Example 2:\nInput: target = 5, types = [[50,1],[50,2],[50,5]]\nOutput: 4\nExplanation: (5,0,0), (3,1,0), (1,2,0) and (0,0,1).",
        "Constraints:\n- 1 <= target <= 1000\n- 1 <= types.length <= 50\n- 1 <= count_i <= 50\n- 1 <= marks_i <= 50",
      ],
      code: `int waysToReachTarget(int target, vector<vector<int>>& types) {
    const int MOD = 1e9 + 7;
    vector<int> dp(target + 1, 0);
    dp[0] = 1;
    for (auto& t : types) {
        int cnt = t[0], mk = t[1];
        vector<int> ndp(target + 1, 0);          // new row per type: the count of
        for (int s = 0; s <= target; s++) {      // copies is bounded, so we must
            if (!dp[s]) continue;                // not read this type's own results
            for (int c = 0; c <= cnt && s + (long long)c * mk <= target; c++)
                ndp[s + c * mk] = (ndp[s + c * mk] + dp[s]) % MOD;
        }
        dp = move(ndp);
    }
    return dp[target];
}`,
      explanation: [
        "Bounded knapsack sits between the two classics: item i may be taken 0..count_i times. The honest transition enumerates that choice explicitly, dp_new[s + c * marks] += dp_old[s] for c = 0..count, which is why a separate previous row is needed - reading the row being written would let the count exceed its cap, collapsing back to the unbounded version.",
        "Counting distinct multisets of answered questions is exactly 'how many of each type', so iterating c per type once counts each way exactly once and no ordering correction is needed.",
        "The naive cost is O(target * sum of counts), here 1000 * 2500 = 2.5 * 10^6, comfortably fast. When the counts are large the standard upgrade is binary splitting: replace a type with count copies by items of size 1, 2, 4, ..., remainder and run plain 0/1 knapsack, since those powers can represent every count from 0 to count exactly once. That turns each type into O(log count) items.",
        "Do not try to emulate the bound by 'run unbounded, then subtract the overcounts' - inclusion-exclusion over per-type caps is possible but far more delicate than a second row.",
        "The tempting shortcut of skipping the c = 0 branch breaks it: a type may legitimately be left unanswered, and c = 0 is what carries dp_old[s] forward.",
        "Time: O(target * sum of count_i). Space: O(target).",
      ],
    },
    {
      name: "Buns",
      difficulty: "Hard",
      variation: "Mixed bounded and unbounded items, derived counts",
      link: "https://codeforces.com/problemset/problem/106/C",
      question: [
        "Lavrenty has n grams of dough and m kinds of stuffing; he has a_i grams of the i-th stuffing. A bun with the i-th stuffing needs b_i grams of that stuffing and c_i grams of dough, and sells for d_i tugriks. A bun with no stuffing needs c0 grams of dough and sells for d0 tugriks. Dough and stuffing cannot be produced, only used. Print the maximum number of tugriks Lavrenty can earn.",
        "Input: the first line has n, m, c0, d0. Each of the next m lines has a_i, b_i, c_i, d_i.",
        "Example 1:\nInput:\n10 2 2 1\n7 3 2 100\n12 3 1 10\nOutput: 241\nExplanation: Stuffing 1 allows floor(7/3) = 2 buns, costing 2 grams of dough each, so 2 buns use 4 dough for 200. Stuffing 2 allows floor(12/3) = 4 buns at 1 dough each, another 4 dough for 40. The remaining 2 dough makes one plain bun for 1, giving 241.",
        "Example 2:\nInput:\n100 1 25 50\n15 5 20 10\nOutput: 200\nExplanation: Plain buns pay 50 per 25 dough (2 per gram) while the stuffed ones pay 10 per 20 dough, so all 100 grams go to 4 plain buns.",
        "Constraints:\n- 1 <= n <= 1000\n- 1 <= m <= 10\n- 1 <= c0, d0 <= 100\n- 1 <= a_i, b_i, c_i, d_i <= 100",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m, c0, d0;
    cin >> n >> m >> c0 >> d0;
    vector<int> dp(n + 1, 0);                 // dp[g] = best profit using at most g dough
    // Plain buns: unlimited supply, so ascending capacity loop (unbounded item).
    for (int g = c0; g <= n; g++)
        dp[g] = max(dp[g], dp[g - c0] + d0);
    for (int i = 0; i < m; i++) {
        int a, b, c, d;
        cin >> a >> b >> c >> d;
        int cnt = a / b;                      // stuffing caps this type at cnt buns
        for (int g = n; g >= 0; g--)          // descending + explicit copy count
            for (int k = 1; k <= cnt && (long long)k * c <= g; k++)
                dp[g] = max(dp[g], dp[g - k * c] + k * d);
    }
    cout << dp[n] << "\\n";
    return 0;
}`,
      explanation: [
        "The single shared resource is dough, so dough is the knapsack capacity. Each stuffing is a bounded item whose cap is not given directly but derived: floor(a_i / b_i) buns, because leftover stuffing below b_i grams is useless. Plain buns are an unbounded item. Handling both kinds against one capacity array is the point of this problem.",
        "The plain bun is done with the ascending loop (reuse intended) and each stuffed type with the descending loop plus an explicit k = 1..cnt (reuse capped). Descending order means dp[g - k*c] is still free of this type, so exactly one k is charged per type. This mixed-direction pass is the general recipe: pick the loop shape per item class, all writing into the same dp.",
        "dp[g] is 'at most g dough', which is why the array starts at all zeros and the answer is dp[n] with no need to scan for a maximum - leaving dough unused is always allowed.",
        "The tempting greedy of sorting by tugriks per gram of dough fails: in example 1 the plain bun has the worst rate but still earns the last 2 grams, and in general the bounded caps make the greedy remainder wrong.",
        "Sizes are tiny (n <= 1000, m <= 10, cnt <= 100) so the naive per-copy loop is fine; binary splitting of the counts would be the move if the caps were large.",
        "Time: O(n * sum of cnt_i), at most about 10^6 here. Space: O(n).",
      ],
    },
    {
      name: "Tallest Billboard",
      difficulty: "Hard",
      variation: "Three-way choice per item, difference as the state",
      link: "https://leetcode.com/problems/tallest-billboard/",
      question: [
        "You are installing a billboard and want its two steel supports to be of equal height. You have a collection of rods that can be welded together. Given an array rods of rod lengths, return the largest possible height of the billboard installation, that is the common height of the two equal supports. If the supports cannot be made equal (other than both empty), return 0. Each rod is used at most once and may be left unused.",
        "Example 1:\nInput: rods = [1, 2, 3, 6]\nOutput: 6\nExplanation: One support is 1 + 2 + 3 and the other is 6, both of height 6.",
        "Example 2:\nInput: rods = [1, 2, 3, 4, 5, 6]\nOutput: 10\nExplanation: Use 2 + 3 + 5 against 4 + 6, both of height 10, and leave rod 1 unused.",
        "Example 3:\nInput: rods = [1, 2]\nOutput: 0\nExplanation: No non-empty split makes the two sides equal.",
        "Constraints:\n- 1 <= rods.length <= 20\n- 1 <= rods[i] <= 1000\n- The total sum of rods does not exceed 5000",
      ],
      code: `int tallestBillboard(vector<int>& rods) {
    // dp[diff] = tallest SHORTER side achievable when the two sides differ by diff
    unordered_map<int,int> dp;
    dp[0] = 0;
    for (int x : rods) {
        unordered_map<int,int> cur = dp;      // snapshot: each rod used at most once
        for (auto& [diff, shorter] : cur) {
            // 1) put x on the taller side: gap grows, shorter side unchanged
            int& a = dp[diff + x];
            a = max(a, shorter);
            // 2) put x on the shorter side: it closes min(diff, x) of the gap
            int nd = abs(diff - x);
            int ns = shorter + min(diff, x);
            int& b = dp[nd];
            b = max(b, ns);
        }
    }
    return dp[0];                             // difference zero: both sides equal
}`,
      explanation: [
        "Each rod has three options - left support, right support, or unused - so a raw search is 3^20, about 3.5 * 10^9. The compression is to notice the answer only cares about the difference between the two sides, not their individual heights, so key the state by that difference and store the best shorter-side height for it.",
        "Why storing the shorter side is the right value: for a fixed difference, a taller shorter-side dominates, since anything you can build on top of one arrangement you can build on the other. Adding rod x to the taller side leaves the shorter side alone and grows the gap by x; adding it to the shorter side lifts the shorter side by min(diff, x) - it either closes the gap partly, or overshoots and the roles swap, which is exactly why abs(diff - x) and min(diff, x) appear together.",
        "Iterating over a snapshot cur while writing into dp is the 0/1 discipline in map form: it stops a rod from being welded onto both sides. The 'unused' option needs no code, since dp already carries the old entries forward.",
        "The tempting reduction to 'partition into two equal-sum halves' (subset sum on total/2) is wrong because rods may be discarded, so the two supports need not use every rod - [1,2,3,4,5,6] has odd total 21 yet answers 10.",
        "The state count is bounded by the range of achievable differences, at most sum + 1 = 5001 keys, so an array of size sum + 1 with a -1 sentinel is a faster drop-in replacement for the hash map.",
        "Time: O(n * S) where S is the total rod length. Space: O(S).",
      ],
    },
  ],
};
