import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Subset Sum Problem",
      difficulty: "Medium",
      variation: "Boolean reachability, the template",
      link: "https://www.geeksforgeeks.org/problems/subset-sum-problem-1611555638/1",
      question: [
        "Given an array arr of non-negative integers and a value sum, determine whether there is a subset of arr with total equal to sum.",
        "Example 1:\nInput: arr = [3, 34, 4, 12, 5, 2], sum = 9\nOutput: true\nExplanation: 4 + 5 = 9.",
        "Example 2:\nInput: arr = [3, 34, 4, 12, 5, 2], sum = 30\nOutput: false",
        "Constraints:\n- 1 <= arr.length <= 200\n- 0 <= arr[i] <= 200\n- 0 <= sum <= 10^4",
      ],
      code: `bool isSubsetSum(vector<int>& arr, int sum) {
    vector<char> dp(sum + 1, false);
    dp[0] = true;                       // the empty subset reaches 0
    for (int x : arr) {
        for (int s = sum; s >= x; s--)  // BACKWARDS: each item used at most once
            if (dp[s - x]) dp[s] = true;
    }
    return dp[sum];
}`,
      explanation: [
        "dp[s] means 'some subset of the items processed so far sums to exactly s'. Adding item x lets every reachable s become s + x, so dp[s] |= dp[s-x].",
        "The backwards inner loop is the entire 0/1 discipline and it is worth being able to explain out loud. Going down from sum, dp[s-x] is still the value from *before* x was considered, so x is used at most once. Going forwards, dp[s-x] may already include x, which would allow using it repeatedly - that is the unbounded/coin-change behaviour.",
        "dp[0] = true is the base case: the empty subset. Everything else is derived from it.",
        "The 2D formulation dp[i][s] - first i items, sum s - is the version to write first if the 1D one feels like a trick. Compressing it is then just the observation that row i only reads row i-1.",
        "This is pseudo-polynomial, not polynomial: the runtime depends on the numeric value of sum, not only on n. Subset Sum is NP-complete, and the DP is efficient only because sum is bounded here.",
        "Time: O(n * sum). Space: O(sum).",
      ],
    },
    {
      name: "Partition Equal Subset Sum",
      difficulty: "Medium",
      variation: "Reduce a partition question to one target",
      link: "https://leetcode.com/problems/partition-equal-subset-sum/",
      question: [
        "Given an integer array nums, return true if you can partition the array into two subsets such that the sum of the elements in both subsets is equal.",
        "Example 1:\nInput: nums = [1, 5, 11, 5]\nOutput: true\nExplanation: [1, 5, 5] and [11].",
        "Example 2:\nInput: nums = [1, 2, 3, 5]\nOutput: false",
        "Constraints:\n- 1 <= nums.length <= 200\n- 1 <= nums[i] <= 100",
      ],
      code: `bool canPartition(vector<int>& nums) {
    int total = accumulate(nums.begin(), nums.end(), 0);
    if (total % 2) return false;              // an odd total cannot split evenly
    int target = total / 2;

    vector<char> dp(target + 1, false);
    dp[0] = true;
    for (int x : nums) {
        for (int s = target; s >= x; s--)
            if (dp[s - x]) dp[s] = true;
        if (dp[target]) return true;          // early exit
    }
    return dp[target];
}`,
      explanation: [
        "The two halves are complements, so one of them sums to total/2 exactly when the other does. Asking about a partition therefore collapses to a single subset-sum query with target = total/2 - no second dimension for 'which side' is needed.",
        "The parity check is not just an optimisation, it is a correctness guard: with an odd total no split exists and total/2 would silently truncate.",
        "The DP itself is unchanged, including the backwards loop. Recognising 'this is subset sum wearing a different hat' is the skill being tested; the recurrence is not the hard part.",
        "With n <= 200 and values <= 100 the target is at most 10^4, so the table is small. The same DP with a std::bitset - dp |= dp << x - runs 64 times faster and is the standard trick when the target reaches 10^5 or more.",
        "Time: O(n * total). Space: O(total).",
      ],
    },
    {
      name: "Minimum Subset Sum Difference",
      difficulty: "Medium",
      variation: "Reading the answer off the reachable set",
      link: "https://www.geeksforgeeks.org/problems/minimum-sum-partition3317/1",
      question: [
        "Given an array arr of non-negative integers, partition it into two subsets S1 and S2 (either may be empty) so that abs(sum(S1) - sum(S2)) is minimised. Return that minimum difference.",
        "Example 1:\nInput: arr = [1, 6, 11, 5]\nOutput: 1\nExplanation: [1, 5, 6] sums to 12 and [11] sums to 11.",
        "Example 2:\nInput: arr = [1, 4]\nOutput: 3",
        "Constraints:\n- 1 <= arr.length <= 100\n- 0 <= arr[i] <= 500",
      ],
      code: `int minDifference(vector<int>& arr) {
    int total = accumulate(arr.begin(), arr.end(), 0);
    int half = total / 2;

    vector<char> dp(half + 1, false);
    dp[0] = true;
    for (int x : arr)
        for (int s = half; s >= x; s--)
            if (dp[s - x]) dp[s] = true;

    for (int s = half; s >= 0; s--)
        if (dp[s]) return total - 2 * s;      // the largest reachable sum <= half
    return total;
}`,
      explanation: [
        "If one side sums to s the other sums to total - s, so the difference is total - 2s. Minimising the difference means maximising s subject to s <= total/2 - and the set of achievable s is exactly what the subset-sum table already contains.",
        "So the DP is not modified at all; only the way its output is consumed changes. Computing the full reachable set and then querying it is a recurring pattern - the table is more informative than any single yes/no answer.",
        "Scanning down from half and returning the first reachable value gives the largest such s. dp[0] is always true, so the loop always terminates and an all-zero or single-element array is handled with no special case.",
        "Capping the table at total/2 is safe by symmetry: any reachable sum above the halfway point has a complement below it with the same difference.",
        "Time: O(n * total). Space: O(total).",
      ],
    },
    {
      name: "Count of Subsets with a Given Sum",
      difficulty: "Medium",
      variation: "Counting instead of reachability — and the zeros trap",
      link: "https://www.geeksforgeeks.org/problems/perfect-sum-problem5633/1",
      question: [
        "Given an array arr of non-negative integers and an integer target, count the number of subsets whose elements sum to target. Subsets are distinguished by which positions they use, so equal values at different positions give different subsets. Return the count modulo 10^9 + 7.",
        "Example 1:\nInput: arr = [5, 2, 3, 10, 6, 8], target = 10\nOutput: 3\nExplanation: [5, 2, 3], [10], [2, 8].",
        "Example 2:\nInput: arr = [0, 0, 1], target = 1\nOutput: 4\nExplanation: The 1 must be chosen; each of the two zeros may independently be in or out.",
        "Constraints:\n- 1 <= arr.length <= 10^3\n- 0 <= arr[i] <= 10^3\n- 0 <= target <= 10^3",
      ],
      code: `int countSubsets(vector<int>& arr, int target) {
    const long long MOD = 1e9 + 7;
    vector<long long> dp(target + 1, 0);
    dp[0] = 1;                                  // the empty subset
    for (int x : arr) {
        for (int s = target; s >= x; s--)       // note: s >= x, so x = 0 updates dp[s] from dp[s]
            dp[s] = (dp[s] + dp[s - x]) % MOD;
    }
    return (int)dp[target];
}`,
      explanation: [
        "Replace the boolean OR with addition and reachability becomes a count: dp[s] += dp[s-x] says every subset summing to s-x extends to one summing to s.",
        "The backwards loop still enforces 'each position used at most once', for the same reason as the boolean version. Forwards would count multisets with repetition.",
        "Zeros are the classic trap, and this loop handles them correctly - but only just. When x = 0 the update is dp[s] += dp[s], doubling every count, which is right: each zero can independently be included or excluded, so k zeros multiply the answer by 2^k. Solutions that skip x = 0 or that iterate s > x silently under-count example 2.",
        "The counts blow up quickly - with 1000 items there can be astronomically many subsets - so the modulus is part of the specification, and the accumulator is 64-bit so the pre-modulo sum cannot wrap.",
        "Time: O(n * target). Space: O(target).",
      ],
    },
    {
      name: "Target Sum",
      difficulty: "Medium",
      variation: "Signs rewritten as a subset choice",
      link: "https://leetcode.com/problems/target-sum/",
      question: [
        "You are given an integer array nums and an integer target. You want to build an expression by adding one of the symbols '+' or '-' before each integer in nums and then concatenating them. Return the number of different expressions that evaluate to target.",
        "Example 1:\nInput: nums = [1, 1, 1, 1, 1], target = 3\nOutput: 5\nExplanation: Exactly one of the five ones is negated.",
        "Example 2:\nInput: nums = [1], target = 1\nOutput: 1",
        "Constraints:\n- 1 <= nums.length <= 20\n- 0 <= nums[i] <= 1000\n- -1000 <= target <= 1000",
      ],
      code: `int findTargetSumWays(vector<int>& nums, int target) {
    int total = accumulate(nums.begin(), nums.end(), 0);
    // P - N = target and P + N = total  =>  P = (total + target) / 2
    if (abs(target) > total) return 0;
    if ((total + target) % 2) return 0;
    int P = (total + target) / 2;

    vector<int> dp(P + 1, 0);
    dp[0] = 1;
    for (int x : nums)
        for (int s = P; s >= x; s--)
            dp[s] += dp[s - x];
    return dp[P];
}`,
      explanation: [
        "Let P be the sum of the numbers given a plus sign and N the sum of those given a minus. Then P - N = target and P + N = total, so P = (total + target) / 2. Counting sign assignments is therefore counting subsets with sum P - the previous problem, unchanged.",
        "The two guards handle the cases where no such P exists: an unreachable magnitude, and a parity mismatch that would make P non-integral. Skipping either produces a wrong answer or a negative-size table rather than 0.",
        "This algebraic rewrite is the point of the problem. Brute force over 2^20 sign choices happens to pass here, but the transformation is what generalises - and it is what the interviewer is looking for.",
        "Zeros are handled by the same s >= x loop as before, which matters because nums[i] may be 0 and each zero doubles the count.",
        "With n <= 20 and values <= 1000, P is at most 20000 and int counts suffice - the number of expressions cannot exceed 2^20.",
        "Time: O(n * total). Space: O(total).",
      ],
    },
    {
      name: "Last Stone Weight II",
      difficulty: "Medium",
      variation: "Disguised minimum-subset-difference",
      link: "https://leetcode.com/problems/last-stone-weight-ii/",
      question: [
        "You are given an array of integers stones where stones[i] is the weight of the i-th stone. On each turn you choose any two stones and smash them together: if they have weights x and y with x <= y, the result is either nothing (when x == y) or a new stone of weight y - x. At the end at most one stone remains. Return the smallest possible weight of the remaining stone, or 0 if none remains.",
        "Example 1:\nInput: stones = [2, 7, 4, 1, 8, 1]\nOutput: 1",
        "Example 2:\nInput: stones = [31, 26, 33, 21, 40]\nOutput: 5",
        "Constraints:\n- 1 <= stones.length <= 30\n- 1 <= stones[i] <= 100",
      ],
      code: `int lastStoneWeightII(vector<int>& stones) {
    int total = accumulate(stones.begin(), stones.end(), 0);
    int half = total / 2;

    vector<char> dp(half + 1, false);
    dp[0] = true;
    for (int x : stones)
        for (int s = half; s >= x; s--)
            if (dp[s - x]) dp[s] = true;

    for (int s = half; s >= 0; s--)
        if (dp[s]) return total - 2 * s;
    return total;
}`,
      explanation: [
        "The smashing process looks sequential and stateful, but every outcome is just a signed sum: each stone ends up contributing either +w or -w to the final weight, since smashing is repeated subtraction. Conversely every assignment of signs whose total is non-negative is achievable by a suitable order of smashes.",
        "So the answer is the minimum non-negative value of abs(sum of one group - sum of the other) - literally Minimum Subset Sum Difference, and the code is character-for-character the same.",
        "Spotting that a process problem is really a partition problem is the whole difficulty. The tell is that each element influences the result by exactly plus-or-minus its value, with no interaction beyond the sum.",
        "Greedy 'always smash the two largest', the natural first instinct, fails on [31, 26, 33, 21, 40].",
        "Time: O(n * total). Space: O(total).",
      ],
    },
    {
      name: "Ones and Zeroes",
      difficulty: "Medium",
      variation: "Two capacity dimensions",
      link: "https://leetcode.com/problems/ones-and-zeroes/",
      question: [
        "You are given an array of binary strings strs and two integers m and n. Return the size of the largest subset of strs such that there are at most m zeros and at most n ones in the chosen strings in total.",
        'Example 1:\nInput: strs = ["10","0001","111001","1","0"], m = 5, n = 3\nOutput: 4\nExplanation: {"10", "0001", "1", "0"} uses 5 zeros and 3 ones.',
        'Example 2:\nInput: strs = ["10","0","1"], m = 1, n = 1\nOutput: 2\nExplanation: {"0", "1"}.',
        "Constraints:\n- 1 <= strs.length <= 600\n- 1 <= strs[i].length <= 100\n- 1 <= m, n <= 100",
      ],
      code: `int findMaxForm(vector<string>& strs, int m, int n) {
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
    for (auto& s : strs) {
        int zeros = count(s.begin(), s.end(), '0');
        int ones = (int)s.size() - zeros;
        for (int i = m; i >= zeros; i--)             // both loops backwards
            for (int j = n; j >= ones; j--)
                dp[i][j] = max(dp[i][j], dp[i - zeros][j - ones] + 1);
    }
    return dp[m][n];
}`,
      explanation: [
        "Each string is an item consuming two resources at once, so the capacity becomes a pair and dp[i][j] is the largest subset fitting in i zeros and j ones. The structure is 0/1 knapsack with a two-dimensional weight.",
        "Both loops must run backwards, for exactly the same reason one loop did in the 1D case: it guarantees dp[i-zeros][j-ones] is still the value from before this string was considered, so each string is taken at most once.",
        "'At most' capacities need no separate handling - dp[i][j] is monotone in both arguments because a subset fitting in a smaller budget also fits in a larger one, so reading dp[m][n] gives the answer directly.",
        "Adding resource dimensions is the standard way knapsack scales to real constraints - weight and volume, time and money. The cost is multiplicative in the capacities, which is why three or more dimensions usually needs a different approach.",
        "Time: O(L * m * n) where L is the number of strings. Space: O(m*n).",
      ],
    },
    {
      name: "Money Sums",
      difficulty: "Medium",
      variation: "Report every reachable sum",
      link: "https://cses.fi/problemset/task/1745",
      question: [
        "You have n coins with certain values. Your task is to find all the money sums you can create using these coins. Print the number of distinct positive sums, then the sums themselves in increasing order.",
        "Example 1:\nInput:\n4\n4 2 5 2\nOutput:\n9\n2 4 5 6 7 8 9 11 13",
        "Constraints:\n- 1 <= n <= 100\n- 1 <= coin value <= 1000",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> a(n);
    int total = 0;
    for (int& x : a) { cin >> x; total += x; }

    bitset<100001> dp;
    dp[0] = 1;
    for (int x : a) dp |= dp << x;      // every reachable sum shifts up by x

    vector<int> sums;
    for (int s = 1; s <= total; s++) if (dp[s]) sums.push_back(s);

    cout << sums.size() << "\\n";
    for (size_t i = 0; i < sums.size(); i++) cout << sums[i] << " \\n"[i + 1 == sums.size()];
    return 0;
}`,
      explanation: [
        "The question asks for the whole reachable set rather than one query, which is what the subset-sum table has been computing all along. Nothing changes but the output step.",
        "dp |= dp << x is the boolean DP expressed as one machine operation per 64 bits. It is exactly the backwards loop - the shift produces the new sums, the OR merges them with the old, and because the shifted copy is taken from the pre-update value each coin is still used at most once.",
        "That gives a 64x constant-factor speed-up over the byte-per-state loop and turns targets of 10^5 or more from borderline into trivial. It is the single most useful optimisation for boolean DP, and it applies whenever the transition is a fixed shift plus an OR.",
        "The bitset size must be a compile-time constant, so pick a bound from the constraints - 100 coins of value 1000 gives at most 10^5.",
        "Time: O(n * total / 64). Space: O(total / 8) bytes.",
      ],
    },
    {
      name: "Partition to K Equal Sum Subsets",
      difficulty: "Hard",
      variation: "k-way partition via bitmask DP",
      link: "https://leetcode.com/problems/partition-to-k-equal-sum-subsets/",
      question: [
        "Given an integer array nums and an integer k, return true if it is possible to divide this array into k non-empty subsets whose sums are all equal.",
        "Example 1:\nInput: nums = [4, 3, 2, 3, 5, 2, 1], k = 4\nOutput: true\nExplanation: [5], [1,4], [2,3], [2,3].",
        "Example 2:\nInput: nums = [1, 2, 3, 4], k = 3\nOutput: false",
        "Constraints:\n- 1 <= k <= nums.length <= 16\n- 1 <= nums[i] <= 10^4",
      ],
      code: `class Solution {
public:
    bool canPartitionKSubsets(vector<int>& nums, int k) {
        int total = accumulate(nums.begin(), nums.end(), 0);
        if (total % k) return false;
        int target = total / k;
        sort(nums.rbegin(), nums.rend());          // big items first: fail fast
        if (nums[0] > target) return false;

        int n = nums.size();
        vector<char> memo(1 << n, 0);              // 0 unknown, 1 true, 2 false

        // cur = sum already placed in the bucket being filled, always
        // (sum of chosen items) mod target — so the mask determines it.
        function<bool(int,int)> dfs = [&](int mask, int cur) -> bool {
            if (mask == (1 << n) - 1) return true;
            if (memo[mask]) return memo[mask] == 1;
            bool ok = false;
            for (int i = 0; i < n && !ok; i++) {
                if (mask >> i & 1) continue;
                if (cur + nums[i] > target) continue;
                ok = dfs(mask | (1 << i), (cur + nums[i]) % target);
            }
            memo[mask] = ok ? 1 : 2;
            return ok;
        };
        return dfs(0, 0);
    }
};`,
      explanation: [
        "For k = 2 the complement trick reduced everything to one target. For general k it does not: knowing one subset's sum says nothing about whether the rest split correctly, so the state has to record which items are already used.",
        "With n <= 16 a bitmask over used items is affordable. Fill buckets one at a time to exactly target, then start the next - so a single running partial sum is enough, and it resets via the modulo when a bucket closes.",
        "The reason memoising on mask alone is valid: the total of the chosen items is determined by the mask, so the partial sum is always that total mod target. cur carries no information the mask does not already have - it is passed only to avoid recomputing it.",
        "Sorting descending is the important pruning. The largest item is placed first, so an oversized item is rejected immediately and dead branches are cut near the root rather than at the leaves.",
        "Time: O(2^n * n). Space: O(2^n).",
      ],
    },
    {
      name: "Count Subsets with Sum Divisible by M",
      difficulty: "Medium",
      variation: "State on the residue, not the sum",
      link: "https://www.geeksforgeeks.org/count-of-subsets-with-sum-divisible-by-m/",
      question: [
        "Given an array arr of non-negative integers and an integer m, count the non-empty subsets whose element sum is divisible by m. Return the count modulo 10^9 + 7.",
        "Example 1:\nInput: arr = [4, 3, 2, 6], m = 3\nOutput: 7\nExplanation: [3], [6], [3,6], [4,2], [4,3,2], [4,2,6], [4,3,2,6].",
        "Example 2:\nInput: arr = [1, 2], m = 5\nOutput: 0",
        "Constraints:\n- 1 <= arr.length <= 10^4\n- 1 <= m <= 1000\n- 0 <= arr[i] <= 10^9",
      ],
      code: `int countDivisibleSubsets(vector<int>& arr, int m) {
    const long long MOD = 1e9 + 7;
    vector<long long> dp(m, 0);
    dp[0] = 1;                                  // the empty subset, residue 0
    for (int x : arr) {
        int r = x % m;
        vector<long long> nxt = dp;             // "skip this item" carries over
        for (int j = 0; j < m; j++) {
            if (!dp[j]) continue;
            int nj = (j + r) % m;
            nxt[nj] = (nxt[nj] + dp[j]) % MOD;  // "take this item"
        }
        dp = move(nxt);
    }
    return (int)((dp[0] - 1 + MOD) % MOD);      // drop the empty subset
}`,
      explanation: [
        "The sums themselves are far too large to index - values reach 10^9 and there are 10^4 of them. But the question only cares about divisibility, so the state can be the sum modulo m, collapsing an unbounded axis to m slots.",
        "Choosing a coarser state that still answers the question is the reusable idea here. It works because the transition respects the quotient: (j + x) mod m depends only on j mod m and x mod m, so no information is lost.",
        "The fresh nxt array, seeded with dp, is the 0/1 discipline in a setting where the backwards-loop trick does not apply - residues wrap around, so there is no safe direction to iterate in place.",
        "dp[0] counts the empty subset too, hence the final subtraction. Adding MOD before the modulo keeps the result non-negative in case dp[0] is 0.",
        "Time: O(n*m). Space: O(m).",
      ],
    },
  ],
};
