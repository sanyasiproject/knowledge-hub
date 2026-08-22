import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Coin Change",
      difficulty: "Medium",
      variation: "Minimum coins, unbounded supply",
      link: "https://leetcode.com/problems/coin-change/",
      question: [
        "You are given an integer array coins representing coins of different denominations and an integer amount. Return the fewest number of coins needed to make up that amount. If that amount cannot be made up by any combination of the coins, return -1. You may use each denomination an unlimited number of times.",
        "Example 1:\nInput: coins = [1, 2, 5], amount = 11\nOutput: 3\nExplanation: 11 = 5 + 5 + 1.",
        "Example 2:\nInput: coins = [2], amount = 3\nOutput: -1",
        "Example 3:\nInput: coins = [1], amount = 0\nOutput: 0",
        "Constraints:\n- 1 <= coins.length <= 12\n- 1 <= coins[i] <= 2^31 - 1\n- 0 <= amount <= 10^4",
      ],
      code: `int coinChange(vector<int>& coins, int amount) {
    const int INF = 1e9;
    vector<int> dp(amount + 1, INF);
    dp[0] = 0;                              // zero coins make zero
    for (int a = 1; a <= amount; a++) {
        for (int c : coins) {
            if (c <= a && dp[a - c] != INF) {
                dp[a] = min(dp[a], dp[a - c] + 1);
            }
        }
    }
    return dp[amount] == INF ? -1 : dp[amount];
}`,
      explanation: [
        "dp[a] is the fewest coins summing to exactly a. Split on the last coin used: if it is c then the rest costs dp[a-c], so dp[a] = 1 + min over c of dp[a-c].",
        "Unbounded supply is what makes this a one-dimensional DP. dp[a-c] may itself contain more copies of c, and that is legal, so no state is needed to remember which coins have been spent.",
        "The INF guard keeps unreachable amounts unreachable. Without it dp[a-c] + 1 would turn a genuinely impossible amount into a finite bogus value that then propagates.",
        "Greedy - take the largest coin that fits - is wrong in general. coins = [1, 3, 4], amount = 6 gives 4 + 1 + 1 greedily but 3 + 3 optimally. Greedy is only safe for canonical systems such as ordinary currency, and the problem gives arbitrary denominations.",
        "The loop order is irrelevant here because minimisation does not care about ordering of coins - unlike the counting versions below, where it decides the whole answer.",
        "Time: O(amount * number of coins). Space: O(amount).",
      ],
    },
    {
      name: "Coin Change II",
      difficulty: "Medium",
      variation: "Counting combinations — coin loop outside",
      link: "https://leetcode.com/problems/coin-change-ii/",
      question: [
        "You are given an integer array coins representing coins of different denominations and an integer amount. Return the number of combinations that make up that amount. If that amount cannot be made up, return 0. You may use each denomination an unlimited number of times, and two combinations are the same if they use the same multiset of coins - order does not matter. The answer is guaranteed to fit in a signed 32-bit integer.",
        "Example 1:\nInput: amount = 5, coins = [1, 2, 5]\nOutput: 4\nExplanation: 5; 2+2+1; 2+1+1+1; 1+1+1+1+1.",
        "Example 2:\nInput: amount = 3, coins = [2]\nOutput: 0",
        "Constraints:\n- 1 <= coins.length <= 300\n- 1 <= coins[i] <= 5000, all distinct\n- 0 <= amount <= 5000",
      ],
      code: `int change(int amount, vector<int>& coins) {
    vector<unsigned int> dp(amount + 1, 0);
    dp[0] = 1;                          // one way to make 0: take nothing
    for (int c : coins) {               // OUTER loop over coins fixes the order
        for (int a = c; a <= amount; a++) {
            dp[a] += dp[a - c];
        }
    }
    return (int)dp[amount];
}`,
      explanation: [
        "This is the single most important loop-order fact in DP. With coins on the outside, dp[a] after processing the first i coins counts the ways to make a using only those i denominations. Each combination is therefore built in one fixed order - non-decreasing coin index - so it is counted exactly once.",
        "Flip the loops, amount outside and coins inside, and you count *sequences* instead: 1+2 and 2+1 become different, which is the answer to the next problem, not this one. The recurrence is identical; only the iteration order distinguishes combinations from permutations.",
        "Why does this work? Fixing an order for each multiset is a canonical-form argument. Every combination has exactly one non-decreasing arrangement, so counting arrangements in that order counts multisets.",
        "The inner loop runs forward from c, which lets dp[a-c] already include the current coin - that is what makes the supply unbounded. Running it backwards would use each coin at most once, which is 0/1 knapsack.",
        "Time: O(amount * number of coins). Space: O(amount).",
      ],
    },
    {
      name: "Combination Sum IV",
      difficulty: "Medium",
      variation: "Counting sequences — target loop outside",
      link: "https://leetcode.com/problems/combination-sum-iv/",
      question: [
        "Given an array of distinct integers nums and a target integer target, return the number of possible combinations that add up to target. Despite the name, different orderings count as different combinations. The answer is guaranteed to fit in a 32-bit integer.",
        "Example 1:\nInput: nums = [1, 2, 3], target = 4\nOutput: 7\nExplanation: (1,1,1,1), (1,1,2), (1,2,1), (2,1,1), (1,3), (3,1), (2,2).",
        "Example 2:\nInput: nums = [9], target = 3\nOutput: 0",
        "Constraints:\n- 1 <= nums.length <= 200\n- 1 <= nums[i] <= 1000, all distinct\n- 1 <= target <= 1000",
      ],
      code: `int combinationSum4(vector<int>& nums, int target) {
    vector<unsigned long long> dp(target + 1, 0);
    dp[0] = 1;
    for (int t = 1; t <= target; t++) {       // OUTER loop over the target
        for (int x : nums) {
            if (x <= t) dp[t] += dp[t - x];
        }
    }
    return (int)dp[target];
}`,
      explanation: [
        "The mirror image of Coin Change II. Here the split is on the *last* element of the sequence: dp[t] = sum over x of dp[t-x]. Because the last element is what varies, every ordering is generated separately, which is exactly what the problem wants.",
        "Put side by side with the previous problem, the rule is easy to remember: item loop outside counts combinations; target loop outside counts permutations. If you ever cannot recall which is which, hand-trace nums = [1,2], target = 3 - combinations give 2, permutations give 3.",
        "Intermediate counts can overflow a signed int even when the final answer does not, since nothing bounds the partial sums for smaller targets in adversarial inputs. Accumulating in an unsigned 64-bit type sidesteps it; the problem's own note that the answer fits is only about the final value.",
        "If negative numbers were allowed the DP would break entirely - sequences could be infinitely long. That is the standard follow-up question, and the correct answer is that the problem becomes ill-posed without a length limit.",
        "Time: O(target * n). Space: O(target).",
      ],
    },
    {
      name: "Coin Change — Report the Coins Used",
      difficulty: "Medium",
      variation: "Reconstructing the optimal choice set",
      link: "https://www.geeksforgeeks.org/problems/number-of-coins1824/1",
      question: [
        "Given a list of coin denominations with unlimited supply and a target sum, return one multiset of coins of minimum size that sums to the target, not just its size. If the target cannot be reached, return an empty list.",
        "Example 1:\nInput: coins = [1, 2, 5], amount = 11\nOutput: [5, 5, 1]\nExplanation: Any minimum-size answer is acceptable.",
        "Example 2:\nInput: coins = [4, 6], amount = 5\nOutput: []",
        "Constraints:\n- 1 <= coins.length <= 100\n- 1 <= coins[i] <= 10^4\n- 0 <= amount <= 10^5",
      ],
      code: `vector<int> minCoinsUsed(vector<int>& coins, int amount) {
    const int INF = 1e9;
    vector<int> dp(amount + 1, INF), pick(amount + 1, -1);
    dp[0] = 0;
    for (int a = 1; a <= amount; a++) {
        for (int c : coins) {
            if (c <= a && dp[a - c] + 1 < dp[a]) {
                dp[a] = dp[a - c] + 1;
                pick[a] = c;               // the coin that achieved dp[a]
            }
        }
    }
    if (dp[amount] >= INF) return {};

    vector<int> used;
    for (int a = amount; a > 0; a -= pick[a]) used.push_back(pick[a]);
    return used;
}`,
      explanation: [
        "The value DP is unchanged; the addition is a parent array recording which choice produced each state's optimum. Walking those pointers backwards from the target reconstructs one optimal solution.",
        "This is the general recipe and it costs O(states) extra memory: store the decision, not the whole solution, at every state. Storing an actual coin list per state would be O(states * answer length) memory and is the usual over-engineered mistake.",
        "The dp[a-c] + 1 < dp[a] comparison must be strict so pick[a] is only overwritten when the value genuinely improves - otherwise the recorded choice can drift out of sync with dp.",
        "Note that dp[a-c] can be INF, in which case dp[a-c] + 1 is still enormous and fails the comparison, so no explicit reachability guard is needed here.",
        "Every recorded coin is at least 1, so the reconstruction loop strictly decreases a and terminates in dp[amount] steps.",
        "Time: O(amount * number of coins). Space: O(amount).",
      ],
    },
    {
      name: "Minimizing Coins",
      difficulty: "Easy",
      variation: "Judge version — large amount, impossible case",
      link: "https://cses.fi/problemset/task/1634",
      question: [
        "Consider a money system consisting of n coins, each with a positive value. Your task is to produce a sum of money x using the available coins in such a way that the number of coins is minimal. Print the minimum number of coins, or -1 if it is not possible.",
        "Example 1:\nInput:\n3 11\n1 5 7\nOutput: 3\nExplanation: 11 = 5 + 5 + 1, or 7 + 1 + 1 + 1 + 1 which is worse.",
        "Constraints:\n- 1 <= n <= 100\n- 1 <= x <= 10^6\n- 1 <= coin value <= 10^6",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, x;
    cin >> n >> x;
    vector<int> coins(n);
    for (int& c : coins) cin >> c;

    const int INF = 1e9;
    vector<int> dp(x + 1, INF);
    dp[0] = 0;
    for (int a = 1; a <= x; a++) {
        for (int c : coins) {
            if (c <= a && dp[a - c] < INF) dp[a] = min(dp[a], dp[a - c] + 1);
        }
    }
    cout << (dp[x] == INF ? -1 : dp[x]) << "\\n";
    return 0;
}`,
      explanation: [
        "Structurally identical to Coin Change; included because the constraints are what make it interesting on a real judge. x reaches 10^6 with 100 coins, so the loop runs 10^8 times and the constant factor matters.",
        "Keep the inner loop over a flat vector of ints, avoid recursion entirely, and untie the streams. A memoised recursion here would recurse up to 10^6 frames deep and crash before it got slow.",
        "The unreachable check is what produces -1 rather than an overflowed value. Coin values can exceed x, in which case no coin ever fits and the answer is correctly -1.",
        "Time: O(n*x). Space: O(x).",
      ],
    },
    {
      name: "Coin Combinations I",
      difficulty: "Easy",
      variation: "Counting ordered ways, modular",
      link: "https://cses.fi/problemset/task/1635",
      question: [
        "You have n coins with certain values. Your task is to count the number of distinct ordered ways you can produce a money sum x using the available coins. For example, if the coins are {2, 3, 5} and the desired sum is 9, there are 8 ways, and 2+2+5 and 2+5+2 are counted separately. Print the answer modulo 10^9 + 7.",
        "Example 1:\nInput:\n3 9\n2 3 5\nOutput: 8",
        "Constraints:\n- 1 <= n <= 100\n- 1 <= x <= 10^6\n- 1 <= coin value <= 10^6",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const long long MOD = 1e9 + 7;
    int n, x;
    cin >> n >> x;
    vector<int> coins(n);
    for (int& c : coins) cin >> c;

    vector<long long> dp(x + 1, 0);
    dp[0] = 1;
    for (int a = 1; a <= x; a++) {          // sum outside -> ordered ways
        for (int c : coins) {
            if (c <= a) dp[a] = (dp[a] + dp[a - c]) % MOD;
        }
    }
    cout << dp[x] << "\\n";
    return 0;
}`,
      explanation: [
        "Ordered ways, so the sum loop goes outside and the coin loop inside - the Combination Sum IV structure. dp[a] splits on which coin was paid last.",
        "This problem and the next one are the same input with the loops swapped, which is why CSES puts them adjacent. Solving one and then failing the other by leaving the loop order alone is a rite of passage.",
        "With x up to 10^6 the counts are astronomically large, so reduce modulo 10^9+7 at every addition and keep the table in long long so the pre-modulo sum cannot overflow.",
        "Time: O(n*x). Space: O(x).",
      ],
    },
    {
      name: "Coin Combinations II",
      difficulty: "Medium",
      variation: "Counting unordered ways, modular",
      link: "https://cses.fi/problemset/task/1636",
      question: [
        "You have n coins with certain values. Your task is to count the number of distinct unordered ways you can produce a money sum x. For coins {2, 3, 5} and sum 9 there are 3 ways: 2+2+5, 2+2+2+3, and 3+3+3. Print the answer modulo 10^9 + 7.",
        "Example 1:\nInput:\n3 9\n2 3 5\nOutput: 3",
        "Constraints:\n- 1 <= n <= 100\n- 1 <= x <= 10^6\n- 1 <= coin value <= 10^6",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const long long MOD = 1e9 + 7;
    int n, x;
    cin >> n >> x;
    vector<int> coins(n);
    for (int& c : coins) cin >> c;

    vector<long long> dp(x + 1, 0);
    dp[0] = 1;
    for (int c : coins) {                    // coin outside -> unordered ways
        for (int a = c; a <= x; a++) {
            dp[a] = (dp[a] + dp[a - c]) % MOD;
        }
    }
    cout << dp[x] << "\\n";
    return 0;
}`,
      explanation: [
        "Same recurrence as Coin Combinations I, loops swapped. Processing one coin fully before moving to the next means every multiset is assembled in a single canonical order - by coin index - so each is counted once.",
        "A useful way to see it: after the k-th outer iteration, dp is the complete answer table for the sub-problem that only has the first k denominations. Nothing about coin k+1 can retroactively reorder what came before.",
        "Note that the outer version needs no bounds check inside, because the inner loop already starts at c. That small asymmetry between the two loop orders is a handy visual cue for which one you have written.",
        "Time: O(n*x). Space: O(x).",
      ],
    },
    {
      name: "Number of Dice Rolls With Target Sum",
      difficulty: "Medium",
      variation: "Exactly n items — a second dimension",
      link: "https://leetcode.com/problems/number-of-dice-rolls-with-target-sum/",
      question: [
        "You have n dice, and each die has k faces numbered from 1 to k. Return the number of possible ways, modulo 10^9 + 7, to roll the dice so that the sum of the face-up numbers equals target.",
        "Example 1:\nInput: n = 2, k = 6, target = 7\nOutput: 6\nExplanation: 1+6, 2+5, 3+4, 4+3, 5+2, 6+1.",
        "Example 2:\nInput: n = 30, k = 30, target = 500\nOutput: 222616187",
        "Constraints:\n- 1 <= n, k <= 30\n- 1 <= target <= 1000",
      ],
      code: `int numRollsToTarget(int n, int k, int target) {
    const long long MOD = 1e9 + 7;
    vector<long long> dp(target + 1, 0);
    dp[0] = 1;
    for (int die = 1; die <= n; die++) {
        vector<long long> nxt(target + 1, 0);
        for (int t = 0; t <= target; t++) {
            if (!dp[t]) continue;
            for (int f = 1; f <= k && t + f <= target; f++) {
                nxt[t + f] = (nxt[t + f] + dp[t]) % MOD;
            }
        }
        dp = move(nxt);
    }
    return (int)dp[target];
}`,
      explanation: [
        "Unlike coin change, the number of items is fixed: exactly n dice, no more and no fewer. 'Exactly n' cannot be expressed with a single sum dimension, so the count of dice used becomes the second dimension - here rolled forward one layer at a time.",
        "Each layer is a fresh array because a die may be used only once. Accumulating in place would let one die contribute several faces, which is the unbounded-coin behaviour and wrong here.",
        "Order is naturally distinguished - die 1 showing 2 and die 2 showing 5 is a different roll from the reverse - and the layered structure gives that for free, since each layer corresponds to one specific die.",
        "The skip on dp[t] == 0 prunes unreachable sums, which matters because the reachable band is only [die, die*k].",
        "Time: O(n * target * k). Space: O(target).",
      ],
    },
    {
      name: "Number of Ways to Earn Points",
      difficulty: "Hard",
      variation: "Bounded count per denomination",
      link: "https://leetcode.com/problems/number-of-ways-to-earn-points/",
      question: [
        "There is a test with n types of questions. You are given an integer target and a 0-indexed 2D array types where types[i] = [count_i, marks_i] indicates that there are count_i questions of the i-th type, and each one is worth marks_i points. Return the number of ways you can earn exactly target points, modulo 10^9 + 7. Questions of the same type are indistinguishable, so only how many of each type you solve matters.",
        "Example 1:\nInput: target = 6, types = [[6,1],[3,2],[2,3]]\nOutput: 7",
        "Example 2:\nInput: target = 5, types = [[50,1],[50,2],[50,5]]\nOutput: 4",
        "Constraints:\n- 1 <= target <= 1000\n- 1 <= types.length <= 50\n- 1 <= count_i, marks_i <= 50",
      ],
      code: `int waysToReachTarget(int target, vector<vector<int>>& types) {
    const long long MOD = 1e9 + 7;
    vector<long long> dp(target + 1, 0);
    dp[0] = 1;
    for (auto& t : types) {
        int cnt = t[0], mark = t[1];
        vector<long long> nxt(target + 1, 0);
        for (int s = 0; s <= target; s++) {
            if (!dp[s]) continue;
            for (int q = 0; q <= cnt && s + q * mark <= target; q++) {
                nxt[s + q * mark] = (nxt[s + q * mark] + dp[s]) % MOD;
            }
        }
        dp = move(nxt);
    }
    return (int)dp[target];
}`,
      explanation: [
        "This sits exactly between the two coin-change extremes. Unbounded supply gives the forward in-place loop; a supply of one gives 0/1 knapsack; a supply of count_i needs an explicit inner loop over how many of that type are taken.",
        "Because questions of a type are indistinguishable, only the count matters - so this is a combination count, and the type loop stays on the outside. Each type is processed once into a fresh layer, which enforces the bound.",
        "Writing into a separate nxt array is what keeps the bound honest. An in-place forward loop would silently allow unlimited questions of one type; an in-place backward loop over multiples is possible but far easier to get wrong.",
        "Complexity is O(target * sum of counts), at most 1000 * 2500 here, comfortably fast. The general bounded-knapsack speed-up - binary splitting of the counts, or a monotonic deque per residue class - is only needed when counts get large.",
        "Time: O(target * sum of count_i). Space: O(target).",
      ],
    },
  ],
};
