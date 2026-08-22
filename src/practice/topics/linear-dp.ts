import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "House Robber",
      difficulty: "Medium",
      variation: "Pick / skip with a no-adjacent constraint",
      link: "https://leetcode.com/problems/house-robber/",
      question: [
        "You are a robber planning to rob houses along a street. Each house has a certain amount of money stashed, given by nums[i]. Adjacent houses have connected security systems, so you cannot rob two adjacent houses on the same night. Return the maximum amount you can rob.",
        "Example 1:\nInput: nums = [1, 2, 3, 1]\nOutput: 4\nExplanation: Rob house 0 (1) and house 2 (3).",
        "Example 2:\nInput: nums = [2, 7, 9, 3, 1]\nOutput: 12\nExplanation: Rob houses 0, 2 and 4: 2 + 9 + 1.",
        "Constraints:\n- 1 <= nums.length <= 100\n- 0 <= nums[i] <= 400",
      ],
      code: `int rob(vector<int>& nums) {
    int prev2 = 0;   // best over nums[0..i-2]
    int prev1 = 0;   // best over nums[0..i-1]
    for (int x : nums) {
        int cur = max(prev1, prev2 + x);   // skip i, or take i
        prev2 = prev1;
        prev1 = cur;
    }
    return prev1;
}`,
      explanation: [
        "dp[i] is the best loot considering the first i houses. At house i there are exactly two options: skip it and keep dp[i-1], or rob it, which forbids house i-1 and gives nums[i] + dp[i-2]. Take the max.",
        "This pick-or-skip shape is the backbone of linear DP. Read the constraint carefully: it restricts what a *take* costs you (it forces skipping the neighbour), which is why taking indexes back two rows rather than one.",
        "Both prev1 and prev2 start at 0, standing for the empty prefixes. Because values are non-negative this needs no special casing; with possible negative values you would want the base cases to be nums[0] and max(nums[0], nums[1]) instead.",
        "A greedy 'take every other house' or 'take the largest first' fails on [2,7,9,3,1] and [2,1,1,2] respectively - the DP is doing real work here.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "House Robber II",
      difficulty: "Medium",
      variation: "Circular array — break the cycle by casework",
      link: "https://leetcode.com/problems/house-robber-ii/",
      question: [
        "Same rules as House Robber, except the houses are arranged in a circle: the first house is the neighbour of the last one, so they cannot both be robbed. Return the maximum amount you can rob.",
        "Example 1:\nInput: nums = [2, 3, 2]\nOutput: 3\nExplanation: You cannot rob houses 0 and 2 because they are now adjacent.",
        "Example 2:\nInput: nums = [1, 2, 3, 1]\nOutput: 4\nExplanation: Rob houses 0 and 2, as before.",
        "Constraints:\n- 1 <= nums.length <= 100\n- 0 <= nums[i] <= 1000",
      ],
      code: `class Solution {
    int robLine(vector<int>& nums, int lo, int hi) {   // inclusive range
        int prev2 = 0, prev1 = 0;
        for (int i = lo; i <= hi; i++) {
            int cur = max(prev1, prev2 + nums[i]);
            prev2 = prev1;
            prev1 = cur;
        }
        return prev1;
    }

public:
    int rob(vector<int>& nums) {
        int n = nums.size();
        if (n == 1) return nums[0];
        // Either house 0 is excluded, or house n-1 is excluded. One of the two must hold.
        return max(robLine(nums, 0, n - 2), robLine(nums, 1, n - 1));
    }
};`,
      explanation: [
        "A cycle is not a DP-friendly shape: dp[n-1] would depend on dp[0], which depends on dp[n-1]. The standard fix is to split on one binding decision until the structure becomes linear again.",
        "Here the decision is house 0. If it is robbed, house n-1 cannot be, so the problem is the line 0..n-2. If it is not robbed, the problem is the line 1..n-1. Any valid circular selection falls into at least one of those two lines, and neither line can produce an invalid circular selection - so the max over both is exactly right.",
        "Note that the two cases overlap (a solution robbing neither end appears in both). Overlap is harmless when you are maximising; it would be fatal if you were counting. Keep that distinction in mind whenever you break a cycle this way.",
        "n = 1 must be special-cased, because 0..n-2 is an empty range and the answer would come out as 0.",
        "Time: O(n) - two linear passes. Space: O(1).",
      ],
    },
    {
      name: "Delete and Earn",
      difficulty: "Medium",
      variation: "Re-index the problem, then apply House Robber",
      link: "https://leetcode.com/problems/delete-and-earn/",
      question: [
        "You are given an integer array nums. You want to maximise the number of points you get by performing the following operation any number of times: pick any nums[i] and delete it to earn nums[i] points; afterwards you must delete every element equal to nums[i] - 1 and every element equal to nums[i] + 1. Return the maximum number of points you can earn.",
        "Example 1:\nInput: nums = [3, 4, 2]\nOutput: 6\nExplanation: Delete 4 to earn 4, which also deletes 3. Then delete 2 to earn 2. Total 6.",
        "Example 2:\nInput: nums = [2, 2, 3, 3, 3, 4]\nOutput: 9\nExplanation: Delete a 3 to earn 3 - this removes every 2 and every 4. Then delete the remaining two 3s. Total 9.",
        "Constraints:\n- 1 <= nums.length <= 2 * 10^4\n- 1 <= nums[i] <= 10^4",
      ],
      code: `int deleteAndEarn(vector<int>& nums) {
    const int MAXV = 10001;
    vector<long long> total(MAXV, 0);
    for (int x : nums) total[x] += x;      // taking a value takes all of its copies

    long long prev2 = 0, prev1 = 0;
    for (int v = 1; v < MAXV; v++) {
        long long cur = max(prev1, prev2 + total[v]);
        prev2 = prev1;
        prev1 = cur;
    }
    return (int)prev1;
}`,
      explanation: [
        "The key move is to stop thinking about array positions. Once you delete one copy of value v, every v+1 and v-1 is gone, so nothing stops you from deleting the remaining copies of v for free points. Deciding about v is therefore all-or-nothing.",
        "Bucket the input into total[v] = v * (count of v), and the problem becomes: choose a set of values with no two consecutive values, maximising the summed buckets. That is House Robber on the value axis instead of the index axis.",
        "This 'change the indexing, reuse a known DP' step is worth more than any single recurrence. The tell is when a choice at one element forcibly determines other elements - that usually means the natural state is not the array index.",
        "Iterating the full 1..10^4 range keeps the code simple. If values were up to 10^9 you would sort the distinct values instead and check whether the previous distinct value is exactly v-1 before treating it as adjacent.",
        "Time: O(n + V). Space: O(V).",
      ],
    },
    {
      name: "Decode Ways",
      difficulty: "Medium",
      variation: "Counting with validity-conditioned transitions",
      link: "https://leetcode.com/problems/decode-ways/",
      question: [
        "A message containing letters A-Z was encoded by mapping 'A' -> \"1\", 'B' -> \"2\", ..., 'Z' -> \"26\", and then concatenating the numbers. Given a string s of digits, return the number of ways to decode it. Note that groupings with a leading zero, such as \"06\", are invalid.",
        "Example 1:\nInput: s = \"226\"\nOutput: 3\nExplanation: \"BZ\" (2 26), \"VF\" (22 6), \"BBF\" (2 2 6).",
        "Example 2:\nInput: s = \"06\"\nOutput: 0\nExplanation: \"06\" cannot be mapped, and neither can a leading 0 alone.",
        "Constraints:\n- 1 <= s.length <= 100\n- s contains digits only",
      ],
      code: `int numDecodings(string s) {
    int n = s.size();
    int prev2 = 1;   // dp[0]: one way to decode the empty prefix
    int prev1 = 1;   // dp[1], fixed up below
    if (s[0] == '0') return 0;

    for (int i = 2; i <= n; i++) {
        int cur = 0;
        if (s[i - 1] != '0') cur += prev1;                       // take one digit
        int two = (s[i - 2] - '0') * 10 + (s[i - 1] - '0');      // take two digits
        if (two >= 10 && two <= 26) cur += prev2;
        if (cur == 0) return 0;                                  // dead prefix
        prev2 = prev1;
        prev1 = cur;
    }
    return prev1;
}`,
      explanation: [
        "Same two-way split as Climbing Stairs - the last group was either one digit or two - but each branch is now guarded by a validity test, so it contributes only when the group actually decodes.",
        "The two guards are different and both matter. A single digit is valid unless it is '0'. A two-digit group is valid only in 10..26, and the lower bound is what rejects a leading zero: \"06\" gives two = 6, which fails >= 10.",
        "dp[0] = 1 for the empty prefix is what makes a valid two-digit opening like \"12\" count correctly.",
        "The early return on cur == 0 is optional but it documents the real structure: once a prefix has zero decodings every longer prefix has zero too, because both transitions multiply through it.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Jump Game",
      difficulty: "Medium",
      variation: "Reachability — DP collapsing into a single running bound",
      link: "https://leetcode.com/problems/jump-game/",
      question: [
        "You are given an integer array nums. You start at index 0, and nums[i] is the maximum jump length you can take from index i. Return true if you can reach the last index, and false otherwise.",
        "Example 1:\nInput: nums = [2, 3, 1, 1, 4]\nOutput: true\nExplanation: Jump 1 step to index 1, then 3 steps to the last index.",
        "Example 2:\nInput: nums = [3, 2, 1, 0, 4]\nOutput: false\nExplanation: Every route lands on index 3, whose jump length is 0.",
        "Constraints:\n- 1 <= nums.length <= 10^4\n- 0 <= nums[i] <= 10^5",
      ],
      code: `bool canJump(vector<int>& nums) {
    int reach = 0;                       // furthest index provably reachable
    for (int i = 0; i < (int)nums.size(); i++) {
        if (i > reach) return false;      // a gap we can never cross
        reach = max(reach, i + nums[i]);
    }
    return true;
}`,
      explanation: [
        "The literal DP is dp[i] = 'index i is reachable', with dp[j] |= dp[i] for every j in i+1..i+nums[i]. That is O(n^2) and it passes here, but it hides the structure.",
        "The set of reachable indices from a prefix is always a contiguous range [0, reach] - if you can land on i you can land on every index between, because you may always jump shorter. A range only needs its right endpoint, so the whole boolean table collapses to one integer.",
        "The scan is then: before using index i, check it is inside the reachable range; then extend the range with i + nums[i]. Reaching the end of the loop means no gap was ever hit.",
        "Recognising that a monotone or interval-shaped DP table can be summarised by an endpoint is the standard way linear DPs turn into O(1)-space greedy scans. The greedy is not a separate insight, it is the DP with the redundancy removed.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Jump Game II",
      difficulty: "Medium",
      variation: "Minimum jumps — DP or level-by-level scan",
      link: "https://leetcode.com/problems/jump-game-ii/",
      question: [
        "You are given an array nums of length n. You start at index 0 and nums[i] is the maximum jump length from index i. It is guaranteed you can reach the last index. Return the minimum number of jumps needed to get there.",
        "Example 1:\nInput: nums = [2, 3, 1, 1, 4]\nOutput: 2\nExplanation: index 0 -> 1 -> 4.",
        "Example 2:\nInput: nums = [2, 3, 0, 1, 4]\nOutput: 2",
        "Constraints:\n- 1 <= nums.length <= 10^4\n- 0 <= nums[i] <= 1000",
      ],
      code: `int jump(vector<int>& nums) {
    int n = nums.size();
    int jumps = 0, curEnd = 0, farthest = 0;
    for (int i = 0; i < n - 1; i++) {       // no need to jump from the last index
        farthest = max(farthest, i + nums[i]);
        if (i == curEnd) {                  // exhausted the current jump's range
            jumps++;
            curEnd = farthest;
        }
    }
    return jumps;
}`,
      explanation: [
        "dp[i] = 1 + min over all i reachable from j of dp[j] is the direct formulation, O(n^2). The linear solution is that same DP exploiting one fact: dp is non-decreasing in i, so the indices needing k jumps form a contiguous band.",
        "That makes it a BFS over levels, done without a queue. curEnd is the right edge of the current band; farthest is the right edge of the next one, accumulated as the scan passes over the band. Hitting i == curEnd means the band is finished, so bump the jump count and move to the next band.",
        "The loop stops at n-2 deliberately. Standing on the last index requires no further jump, and including it would increment jumps one time too many when the last index happens to be a band edge.",
        "Because the problem guarantees reachability, no unreachable check is needed. Without that guarantee you would also test farthest <= i at the band boundary and report -1.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Word Break",
      difficulty: "Medium",
      variation: "Prefix feasibility over a split point",
      link: "https://leetcode.com/problems/word-break/",
      question: [
        "Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words. The same dictionary word may be reused any number of times.",
        'Example 1:\nInput: s = "leetcode", wordDict = ["leet", "code"]\nOutput: true\nExplanation: "leetcode" = "leet code".',
        'Example 2:\nInput: s = "catsandog", wordDict = ["cats", "dog", "sand", "and", "cat"]\nOutput: false',
        "Constraints:\n- 1 <= s.length <= 300\n- 1 <= wordDict.length <= 1000\n- 1 <= wordDict[i].length <= 20",
      ],
      code: `bool wordBreak(string s, vector<string>& wordDict) {
    unordered_set<string> dict(wordDict.begin(), wordDict.end());
    int n = s.size(), maxLen = 0;
    for (auto& w : wordDict) maxLen = max(maxLen, (int)w.size());

    vector<char> dp(n + 1, false);
    dp[0] = true;                            // the empty prefix is segmentable
    for (int i = 1; i <= n; i++) {
        for (int len = 1; len <= maxLen && len <= i; len++) {
            if (dp[i - len] && dict.count(s.substr(i - len, len))) {
                dp[i] = true;
                break;
            }
        }
    }
    return dp[n];
}`,
      explanation: [
        "dp[i] means the first i characters can be segmented. Split on the last word: if it occupies s[j..i-1] then dp[i] is true when dp[j] is true and that substring is in the dictionary. Loop j over the possible starts.",
        "The word-length cap is the practical optimisation. Without it the inner loop runs i times; capping it at the longest dictionary word bounds it by 20 here, since no longer substring can possibly match.",
        "dp[0] = true is what lets the first word match at all - the same empty-prefix base case as every other counting or feasibility DP on strings.",
        "Naive recursion without memoisation is exponential on inputs like \"aaaaaaab\" with dictionary [\"a\",\"aa\",\"aaa\"], because the same suffix is re-explored through many different splits. The table is what kills that blow-up.",
        "Time: O(n * L) substring checks, each costing O(L) to hash, so O(n * L^2). Space: O(n) plus the dictionary.",
      ],
    },
    {
      name: "Best Time to Buy and Sell Stock with Cooldown",
      difficulty: "Medium",
      variation: "State machine DP — several states per index",
      link: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/",
      question: [
        "You are given an array prices where prices[i] is the price of a stock on day i. Find the maximum profit you can achieve with as many transactions as you like, subject to two rules: you must sell before buying again, and after you sell you cannot buy on the very next day (a one-day cooldown).",
        "Example 1:\nInput: prices = [1, 2, 3, 0, 2]\nOutput: 3\nExplanation: buy at 1, sell at 2, cooldown, buy at 0, sell at 2.",
        "Example 2:\nInput: prices = [1]\nOutput: 0",
        "Constraints:\n- 1 <= prices.length <= 5000\n- 0 <= prices[i] <= 1000",
      ],
      code: `int maxProfit(vector<int>& prices) {
    const int NEG = INT_MIN / 2;
    int hold = NEG;    // best profit while holding a share
    int sold = NEG;    // best profit having sold today (in cooldown)
    int rest = 0;      // best profit holding nothing and free to buy
    for (int p : prices) {
        int prevHold = hold, prevSold = sold, prevRest = rest;
        hold = max(prevHold, prevRest - p);        // keep holding, or buy today
        sold = prevHold + p;                       // sell today
        rest = max(prevRest, prevSold);            // stay free, or cooldown ends
    }
    return max(sold, rest);
}`,
      explanation: [
        "One number per day is not enough state here: whether you may buy today depends on what happened yesterday. Add the missing information to the state - what position you are in - and the transitions become mechanical.",
        "Three states per day suffice. hold = own a share. sold = just sold today, so buying is blocked tomorrow. rest = own nothing and free to buy. The cooldown is encoded purely by the fact that rest can only be entered from sold on the *following* day, never on the same day.",
        "All three transitions must read yesterday's values, which is why they are snapshotted first. Updating hold before computing sold would let a buy and a sell happen on the same day.",
        "hold and sold start impossible rather than 0, since you cannot own or have sold a share before day 0. Using INT_MIN/2 rather than INT_MIN leaves headroom so prevHold + p cannot overflow.",
        "The answer is max(sold, rest) - never hold, because ending while still holding a share leaves the purchase price unrecovered.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Longest Arithmetic Subsequence of Given Difference",
      difficulty: "Medium",
      variation: "State keyed by value rather than by index",
      link: "https://leetcode.com/problems/longest-arithmetic-subsequence-of-given-difference/",
      question: [
        "Given an integer array arr and an integer difference, return the length of the longest subsequence in arr which is an arithmetic sequence such that the difference between adjacent elements in the subsequence equals difference. A subsequence keeps the original order but need not be contiguous.",
        "Example 1:\nInput: arr = [1, 5, 7, 8, 5, 3, 4, 2, 1], difference = -2\nOutput: 4\nExplanation: The longest such subsequence is [7, 5, 3, 1].",
        "Example 2:\nInput: arr = [1, 2, 3, 4], difference = 1\nOutput: 4",
        "Constraints:\n- 1 <= arr.length <= 10^5\n- -10^4 <= arr[i], difference <= 10^4",
      ],
      code: `int longestSubsequence(vector<int>& arr, int difference) {
    unordered_map<int,int> best;    // value -> longest chain ending at that value
    int ans = 0;
    for (int x : arr) {
        int len = 1;
        auto it = best.find(x - difference);
        if (it != best.end()) len = it->second + 1;
        best[x] = max(best[x], len);
        ans = max(ans, len);
    }
    return ans;
}`,
      explanation: [
        "The generic longest-arithmetic-subsequence DP is O(n^2) over pairs of indices. Here the difference is fixed, which pins down the predecessor exactly: the element before x must equal x - difference. With only one candidate predecessor there is nothing to loop over.",
        "So the state becomes 'longest valid chain ending with value v', stored in a hash map instead of an array. Scanning left to right guarantees any chain read from the map was built from earlier positions, which is what keeps it a genuine subsequence.",
        "Writing best[x] = max(best[x], len) rather than a plain assignment matters when a value repeats and the later occurrence would produce a shorter chain - the longer one must survive for later elements to extend.",
        "Because values fit in a small range you could use a 40001-slot array offset by 20000 and drop the hashing constant, which is usually the faster submission.",
        "Time: O(n) expected. Space: O(n).",
      ],
    },
    {
      name: "Partition Array for Maximum Sum",
      difficulty: "Medium",
      variation: "Partition into bounded-length runs",
      link: "https://leetcode.com/problems/partition-array-for-maximum-sum/",
      question: [
        "Given an integer array arr, partition it into contiguous subarrays of length at most k. After partitioning, each subarray has all of its values changed to that subarray's maximum. Return the largest sum of the resulting array.",
        "Example 1:\nInput: arr = [1, 15, 7, 9, 2, 5, 10], k = 3\nOutput: 84\nExplanation: [15,15,15,9,10,10,10] - partition as [1,15,7], [9], [2,5,10].",
        "Example 2:\nInput: arr = [1, 4, 1, 5, 7, 3, 6, 1, 9, 9, 3], k = 4\nOutput: 83",
        "Constraints:\n- 1 <= arr.length <= 500\n- 0 <= arr[i] <= 10^9\n- 1 <= k <= arr.length",
      ],
      code: `int maxSumAfterPartitioning(vector<int>& arr, int k) {
    int n = arr.size();
    vector<long long> dp(n + 1, 0);
    for (int i = 1; i <= n; i++) {
        int mx = 0;
        for (int len = 1; len <= k && len <= i; len++) {
            mx = max(mx, arr[i - len]);                     // max of the last 'len' elements
            dp[i] = max(dp[i], dp[i - len] + (long long)mx * len);
        }
    }
    return (int)dp[n];
}`,
      explanation: [
        "dp[i] is the best total for the first i elements. Split on the length of the final block: if it covers the last len elements then dp[i] = dp[i-len] + len * (max of that block). Try every legal len from 1 to k.",
        "The important detail is that the block maximum is maintained incrementally as len grows. Recomputing it with a nested scan would make the whole thing O(n*k^2); extending the window by one element and taking a max keeps the inner loop O(1) per candidate.",
        "This 'partition into runs, cost depends on the run' shape recurs constantly - line wrapping, splitting an array to minimise the largest sum, palindrome partitioning. The state is always the prefix boundary and the split is always on the last run.",
        "Values reach 10^9 and a block contributes len * max, so accumulate in 64-bit even though the final answer is stated to fit in an int.",
        "Time: O(n*k). Space: O(n).",
      ],
    },
    {
      name: "Painting Houses with Three Colours",
      difficulty: "Medium",
      variation: "One DP row per category",
      link: "https://www.geeksforgeeks.org/problems/paint-house-1587115620/1",
      question: [
        "There are n houses in a row, each to be painted red, green or blue. costs[i][0], costs[i][1] and costs[i][2] give the cost of painting house i red, green and blue respectively. No two adjacent houses may share a colour. Return the minimum total cost of painting all the houses.",
        "Example 1:\nInput: costs = [[14, 2, 11], [11, 14, 5], [14, 3, 10]]\nOutput: 10\nExplanation: green (2) + blue (5) + green (3) = 10.",
        "Example 2:\nInput: costs = [[7, 6, 2]]\nOutput: 2",
        "Constraints:\n- 1 <= n <= 100\n- 1 <= costs[i][j] <= 20",
      ],
      code: `int minCost(vector<vector<int>>& costs) {
    int r = costs[0][0], g = costs[0][1], b = costs[0][2];
    for (size_t i = 1; i < costs.size(); i++) {
        int nr = costs[i][0] + min(g, b);
        int ng = costs[i][1] + min(r, b);
        int nb = costs[i][2] + min(r, g);
        r = nr; g = ng; b = nb;
    }
    return min({r, g, b});
}`,
      explanation: [
        "'Adjacent houses differ' means the choice at house i is constrained by the choice at house i-1, so the colour must be part of the state. dp[i][c] is the cheapest way to paint the first i houses with house i painted colour c.",
        "The transition takes the cheaper of the two other colours at i-1 and adds this house's cost: dp[i][c] = costs[i][c] + min over c' != c of dp[i-1][c'].",
        "Snapshotting into nr, ng, nb before the assignment is not optional. Overwriting r first would let the computation of ng read the *current* house's red cost, silently allowing two adjacent reds.",
        "For k colours instead of 3 the same DP is O(n*k^2) naively, and O(n*k) if you keep the smallest and second-smallest values of the previous row - the standard follow-up. That is worth knowing because interviewers ask for it directly.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Minimum Cost For Tickets",
      difficulty: "Medium",
      variation: "DP over a time axis, not over the input array",
      link: "https://leetcode.com/problems/minimum-cost-for-tickets/",
      question: [
        "You have planned some train travel one year in advance. The days of the year on which you will travel are given as a sorted array days, with values in 1..365. Train tickets are sold in three ways: a 1-day pass for costs[0], a 7-day pass for costs[1], and a 30-day pass for costs[2]. A pass allows travel for that many consecutive days - for example, a 7-day pass bought on day 2 covers days 2 through 8. Return the minimum money needed to travel on every day in days.",
        "Example 1:\nInput: days = [1, 4, 6, 7, 8, 20], costs = [2, 7, 15]\nOutput: 11\nExplanation: A 1-day pass on day 1 (2), a 7-day pass on day 3 covering days 3-9 (7), and a 1-day pass on day 20 (2).",
        "Example 2:\nInput: days = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 30, 31], costs = [2, 7, 15]\nOutput: 17\nExplanation: A 30-day pass on day 1 (15) plus a 1-day pass on day 31 (2).",
        "Constraints:\n- 1 <= days.length <= 365, strictly increasing, 1 <= days[i] <= 365\n- 1 <= costs[i] <= 1000",
      ],
      code: `int mincostTickets(vector<int>& days, vector<int>& costs) {
    int last = days.back();
    vector<char> travel(last + 1, false);
    for (int d : days) travel[d] = true;

    vector<int> dp(last + 1, 0);
    for (int d = 1; d <= last; d++) {
        if (!travel[d]) { dp[d] = dp[d - 1]; continue; }   // no ticket needed today
        dp[d] = min({ dp[d - 1] + costs[0],
                      dp[max(0, d - 7)]  + costs[1],
                      dp[max(0, d - 30)] + costs[2] });
    }
    return dp[last];
}`,
      explanation: [
        "The natural index looks like the days array, but a 7-day pass covers a span of *calendar* days, not a fixed number of travel days. Indexing by calendar day makes the transition trivial; indexing by travel day would need a search for where each pass's coverage ends.",
        "dp[d] is the cheapest way to cover all travel up to and including day d. On a non-travel day nothing changes, so dp[d] = dp[d-1]. On a travel day, split on the pass that covers day d: it started at or before d, so the rest of the bill is dp[d-1], dp[d-7] or dp[d-30] plus that pass's price.",
        "Using max(0, d-30) treats a pass that begins before day 1 as covering everything up to d, which is exactly right - buying early is never cheaper but it is legal, and clamping avoids a negative index.",
        "There is no need to model *when* to buy a pass. Assuming the covering pass ends on day d is without loss of generality: any pass covering d could be slid later to end on d without losing coverage of d.",
        "Time: O(365) here, O(maxDay) in general. Space: O(maxDay).",
      ],
    },
  ],
};
