import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Subset Sum Exists (n up to 40)",
      difficulty: "Easy",
      variation: "Existence check with two halves",
      question: [
        "Given an array a of up to 40 positive integers (each up to 10^12) and a target T, determine whether some subset of a sums exactly to T. Classic DP is impossible because both n = 40 (2^40 subsets) and the value range rule out standard approaches.",
        "Example 1:\nInput: a = [7, 3, 9, 15], T = 12\nOutput: true\nExplanation: 3 + 9 = 12.",
        "Constraints:\n- 1 <= n <= 40\n- 1 <= a[i] <= 10^12\n- 0 <= T <= 4 * 10^13",
      ],
      code: `bool subsetSumExists(vector<long long>& a, long long target) {
    int n = a.size(), h = n / 2;
    vector<long long> left, right;
    for (int mask = 0; mask < (1 << h); mask++) {
        long long s = 0;
        for (int i = 0; i < h; i++)
            if (mask & (1 << i)) s += a[i];
        left.push_back(s);
    }
    int m = n - h;
    for (int mask = 0; mask < (1 << m); mask++) {
        long long s = 0;
        for (int i = 0; i < m; i++)
            if (mask & (1 << i)) s += a[h + i];
        right.push_back(s);
    }
    sort(right.begin(), right.end());
    for (long long s : left)
        if (binary_search(right.begin(), right.end(), target - s)) return true;
    return false;
}`,
      explanation: [
        "Split the array into two halves of about 20 elements and enumerate all subset sums of each half (about 2^20 = 1M per side). Every subset of the full array is uniquely a subset of the left half combined with one of the right half, so a subset summing to T exists iff some left sum s has T - s among the right sums.",
        "Sorting the right sums lets each left sum be checked with a binary search instead of a quadratic pairing.",
        "Time: O(2^(n/2) * n/2 + 2^(n/2) log 2^(n/2)). Space: O(2^(n/2)).",
      ],
    },
    {
      name: "Number of Ways to Buy Pens and Pencils",
      difficulty: "Medium",
      variation: "Enumerate one side, count the other",
      link: "https://leetcode.com/problems/number-of-ways-to-buy-pens-and-pencils/",
      question: [
        "You are given an integer total, the amount of money you have, and integers cost1 and cost2, the prices of a pen and a pencil. Return the number of distinct ways to buy some number of pens and pencils (possibly zero of each) without exceeding total.",
        "Example 1:\nInput: total = 20, cost1 = 10, cost2 = 5\nOutput: 9",
        "Constraints:\n- 1 <= total, cost1, cost2 <= 10^6",
      ],
      code: `long long waysToBuyPensPencils(int total, int cost1, int cost2) {
    long long ways = 0;
    for (long long pens = 0; pens * cost1 <= total; pens++) {
        long long remaining = total - pens * cost1;
        ways += remaining / cost2 + 1;
    }
    return ways;
}`,
      explanation: [
        "Fix the count of pens (one half of the decision) and count the compatible pencil counts on the other half in closed form: with 'remaining' money there are floor(remaining / cost2) + 1 valid pencil counts, including zero.",
        "This enumerate-one-side, count-the-other-side structure is the simplest instance of the meet-in-the-middle idea: the search space is total/cost1 * total/cost2 pairs, but only one dimension is enumerated.",
        "Time: O(total / cost1). Space: O(1).",
      ],
    },
    {
      name: "Count Subsets with Sum at Most K (n up to 40)",
      difficulty: "Medium",
      variation: "Counting with sorted half sums",
      question: [
        "Given an array a of up to 40 non-negative integers and a limit K, count the subsets of a (the empty subset included) whose sum is at most K. Values are large enough that value-indexed DP is impossible.",
        "Example 1:\nInput: a = [2, 5, 9], K = 7\nOutput: 4\nExplanation: {}, {2}, {5}, and {2,5} have sums 0, 2, 5, 7; every subset containing 9 exceeds K.",
        "Constraints:\n- 1 <= n <= 40\n- 0 <= a[i] <= 10^12\n- 0 <= K <= 4 * 10^13",
      ],
      code: `long long countSubsetsAtMostK(vector<long long>& a, long long k) {
    int n = a.size(), h = n / 2;
    vector<long long> left, right;
    for (int mask = 0; mask < (1 << h); mask++) {
        long long s = 0;
        for (int i = 0; i < h; i++)
            if (mask & (1 << i)) s += a[i];
        left.push_back(s);
    }
    int m = n - h;
    for (int mask = 0; mask < (1 << m); mask++) {
        long long s = 0;
        for (int i = 0; i < m; i++)
            if (mask & (1 << i)) s += a[h + i];
        right.push_back(s);
    }
    sort(right.begin(), right.end());
    long long count = 0;
    for (long long s : left) {
        if (s > k) continue;
        count += upper_bound(right.begin(), right.end(), k - s) - right.begin();
    }
    return count;
}`,
      explanation: [
        "Enumerate all subset sums of each half. Every full subset pairs one left subset with one right subset, so for each left sum s the number of valid completions is the number of right sums at most K - s, found by upper_bound on the sorted right list.",
        "The pairing is a bijection (each half-choice is independent), so nothing is missed or double counted.",
        "Time: O(2^(n/2) * (n/2 + log 2^(n/2))). Space: O(2^(n/2)).",
      ],
    },
    {
      name: "Maximum Subset Sum Not Exceeding K (n up to 40)",
      difficulty: "Medium",
      variation: "Optimization with binary search on half sums",
      question: [
        "Given an array a of up to 40 positive integers and a budget K, find the maximum subset sum that does not exceed K (the empty subset gives 0).",
        "Example 1:\nInput: a = [8, 9, 10], K = 18\nOutput: 18\nExplanation: 8 + 10 = 18.",
        "Constraints:\n- 1 <= n <= 40\n- 1 <= a[i] <= 10^12\n- 0 <= K <= 4 * 10^13",
      ],
      code: `long long maxSubsetSumAtMostK(vector<long long>& a, long long k) {
    int n = a.size(), h = n / 2;
    vector<long long> left, right;
    for (int mask = 0; mask < (1 << h); mask++) {
        long long s = 0;
        for (int i = 0; i < h; i++)
            if (mask & (1 << i)) s += a[i];
        left.push_back(s);
    }
    int m = n - h;
    for (int mask = 0; mask < (1 << m); mask++) {
        long long s = 0;
        for (int i = 0; i < m; i++)
            if (mask & (1 << i)) s += a[h + i];
        right.push_back(s);
    }
    sort(right.begin(), right.end());
    long long best = 0;
    for (long long s : left) {
        if (s > k) continue;
        auto it = upper_bound(right.begin(), right.end(), k - s);
        if (it != right.begin()) best = max(best, s + *prev(it));
    }
    return best;
}`,
      explanation: [
        "For every left-half subset sum s within budget, the best completion is the largest right-half sum not exceeding K - s, located as the predecessor of upper_bound in the sorted right list. Both half lists include 0 (the empty mask), so pure-left and pure-right subsets are covered.",
        "This is the optimization variant of the two-halves pattern: instead of counting matches, binary search fetches the best match per left sum.",
        "Time: O(2^(n/2) log 2^(n/2)). Space: O(2^(n/2)).",
      ],
    },
    {
      name: "4Sum II",
      difficulty: "Medium",
      variation: "Two-halves pair hashing across four arrays",
      link: "https://leetcode.com/problems/4sum-ii/",
      question: [
        "Given four integer arrays nums1, nums2, nums3, nums4 all of length n, count the tuples (i, j, k, l) such that nums1[i] + nums2[j] + nums3[k] + nums4[l] == 0.",
        "Example 1:\nInput: nums1 = [1,2], nums2 = [-2,-1], nums3 = [-1,2], nums4 = [0,2]\nOutput: 2",
        "Constraints:\n- 1 <= n <= 200\n- -2^28 <= values <= 2^28",
      ],
      code: `int fourSumCount(vector<int>& nums1, vector<int>& nums2,
                 vector<int>& nums3, vector<int>& nums4) {
    unordered_map<long long, int> pairSums;
    for (int a : nums1)
        for (int b : nums2)
            pairSums[(long long)a + b]++;
    int count = 0;
    for (int c : nums3)
        for (int d : nums4) {
            auto it = pairSums.find(-((long long)c + d));
            if (it != pairSums.end()) count += it->second;
        }
    return count;
}`,
      explanation: [
        "Split the four arrays into two halves: hash every sum a + b from the first two arrays with its multiplicity, then for each sum c + d from the last two arrays add the count of stored pairs equal to -(c + d).",
        "This meets in the middle at n^2 pairs per side instead of n^4 quadruples, and the hash map makes each lookup O(1) on average.",
        "Time: O(n^2). Space: O(n^2).",
      ],
    },
    {
      name: "Sum of Four Values",
      difficulty: "Medium",
      variation: "Distinct-index 4-sum with incremental pair map",
      link: "https://cses.fi/problemset/task/1642",
      question: [
        "You are given an array of n integers and a target x. Find four distinct positions whose values sum to x, and report their 1-based indices, or determine that no solution exists.",
        "Example 1:\nInput: n = 8, x = 15, a = [3, 2, 5, 8, 1, 3, 2, 3]\nOutput: 2 4 6 7\nExplanation: 2 + 8 + 3 + 2 = 15.",
        "Constraints:\n- 4 <= n <= 1000\n- 1 <= x, a[i] <= 10^9",
      ],
      code: `vector<int> sumOfFourValues(vector<long long>& a, long long x) {
    int n = a.size();
    unordered_map<long long, pair<int, int>> pairSum; // sum -> 1-based (i, j)
    for (int c = 0; c < n; c++) {
        for (int d = c + 1; d < n; d++) {
            long long need = x - a[c] - a[d];
            auto it = pairSum.find(need);
            if (it != pairSum.end())
                return {it->second.first, it->second.second, c + 1, d + 1};
        }
        for (int b = 0; b < c; b++)
            pairSum[a[b] + a[c]] = {b + 1, c + 1};
    }
    return {};
}`,
      explanation: [
        "Any solution i < j < k < l can be viewed as a pair (i, j) with j < k plus the pair (k, l). Iterating c = k in increasing order, the map contains exactly the pair sums whose larger index is below c, so a hit guarantees four distinct indices without any collision handling.",
        "Pairs ending at c are inserted only after c has been fully processed as the third index, preserving the invariant. Only one representative pair per sum is needed because any representative works.",
        "Time: O(n^2) average with hashing. Space: O(n^2).",
      ],
    },
    {
      name: "Meet in the Middle (CSES)",
      difficulty: "Medium",
      variation: "Count subsets with exact sum, n up to 40",
      link: "https://cses.fi/problemset/task/1628",
      question: [
        "You are given an array of n numbers and a target x. Count the subsets of the array whose sum is exactly x.",
        "Example 1:\nInput: n = 4, x = 5, a = [1, 2, 3, 2]\nOutput: 3\nExplanation: {1,2,2}, {2,3}, {2,3} (using either 2) sum to 5.",
        "Constraints:\n- 1 <= n <= 40\n- 1 <= x, a[i] <= 10^9",
      ],
      code: `long long countSubsetsWithSum(vector<long long>& a, long long x) {
    int n = a.size(), h = n / 2;
    vector<long long> left, right;
    for (int mask = 0; mask < (1 << h); mask++) {
        long long s = 0;
        for (int i = 0; i < h; i++)
            if (mask & (1 << i)) s += a[i];
        left.push_back(s);
    }
    int m = n - h;
    for (int mask = 0; mask < (1 << m); mask++) {
        long long s = 0;
        for (int i = 0; i < m; i++)
            if (mask & (1 << i)) s += a[h + i];
        right.push_back(s);
    }
    sort(right.begin(), right.end());
    long long count = 0;
    for (long long s : left) {
        auto lo = lower_bound(right.begin(), right.end(), x - s);
        auto hi = upper_bound(right.begin(), right.end(), x - s);
        count += hi - lo;
    }
    return count;
}`,
      explanation: [
        "Enumerate all 2^(n/2) subset sums of each half. Each full subset corresponds to exactly one (left subset, right subset) pair, so the answer is the sum over left sums s of the multiplicity of x - s among the right sums.",
        "Sorting the right sums and taking upper_bound minus lower_bound counts duplicates correctly; the total can reach 2^40 so a 64-bit counter is required.",
        "Time: O(2^(n/2) * n). Space: O(2^(n/2)).",
      ],
    },
    {
      name: "Equal Sum Split Count (n up to 40)",
      difficulty: "Medium",
      variation: "Exact-sum counting applied to total/2",
      question: [
        "Given an array a of up to 40 positive integers, count the ways to color every element red or blue so that the red sum equals the blue sum. Two colorings are different if any element differs in color. Report 0 if the total sum is odd.",
        "Example 1:\nInput: a = [1, 1, 2]\nOutput: 2\nExplanation: Red {2} vs blue {1,1}, and red {1,1} vs blue {2}.",
        "Constraints:\n- 1 <= n <= 40\n- 1 <= a[i] <= 10^12",
      ],
      code: `long long equalSplitCount(vector<long long>& a) {
    long long total = accumulate(a.begin(), a.end(), 0LL);
    if (total % 2 != 0) return 0;
    long long half = total / 2;
    int n = a.size(), h = n / 2;
    vector<long long> left, right;
    for (int mask = 0; mask < (1 << h); mask++) {
        long long s = 0;
        for (int i = 0; i < h; i++)
            if (mask & (1 << i)) s += a[i];
        left.push_back(s);
    }
    int m = n - h;
    for (int mask = 0; mask < (1 << m); mask++) {
        long long s = 0;
        for (int i = 0; i < m; i++)
            if (mask & (1 << i)) s += a[h + i];
        right.push_back(s);
    }
    sort(right.begin(), right.end());
    long long count = 0;
    for (long long s : left) {
        auto lo = lower_bound(right.begin(), right.end(), half - s);
        auto hi = upper_bound(right.begin(), right.end(), half - s);
        count += hi - lo;
    }
    return count;
}`,
      explanation: [
        "A coloring balances iff the red set sums to total / 2, so the task reduces to counting subsets with an exact target sum — the CSES meet-in-the-middle pattern with x = total / 2. Each balanced subset yields exactly one coloring (its complement is blue), so subsets and colorings are in bijection.",
        "With an odd total no split exists. Values up to 10^12 rule out DP; the two-halves enumeration handles n = 40 in about a million sums per side.",
        "Time: O(2^(n/2) * n). Space: O(2^(n/2)).",
      ],
    },
    {
      name: "Count Subsets with XOR Equal to K (n up to 40)",
      difficulty: "Medium",
      variation: "Two-halves hashing under XOR",
      question: [
        "Given an array a of up to 40 non-negative integers (up to 10^18) and a value K, count the subsets of a whose bitwise XOR equals K. The empty subset has XOR 0.",
        "Example 1:\nInput: a = [1, 2, 3], K = 3\nOutput: 2\nExplanation: {3} and {1,2} both XOR to 3.",
        "Constraints:\n- 1 <= n <= 40\n- 0 <= a[i] < 2^60\n- 0 <= K < 2^60",
      ],
      code: `long long countSubsetsWithXor(vector<unsigned long long>& a, unsigned long long k) {
    int n = a.size(), h = n / 2;
    unordered_map<unsigned long long, long long> leftCount;
    for (int mask = 0; mask < (1 << h); mask++) {
        unsigned long long x = 0;
        for (int i = 0; i < h; i++)
            if (mask & (1 << i)) x ^= a[i];
        leftCount[x]++;
    }
    int m = n - h;
    long long count = 0;
    for (int mask = 0; mask < (1 << m); mask++) {
        unsigned long long x = 0;
        for (int i = 0; i < m; i++)
            if (mask & (1 << i)) x ^= a[h + i];
        auto it = leftCount.find(k ^ x);
        if (it != leftCount.end()) count += it->second;
    }
    return count;
}`,
      explanation: [
        "XOR is invertible: a left-half XOR l combines with a right-half XOR r into K exactly when l = K ^ r. Hash the multiplicities of all left-half subset XORs, then for each right-half subset XOR add the count of matching left values.",
        "This works because subsets of the whole array decompose uniquely into a left part and a right part, and XOR of the union is the XOR of the parts.",
        "Time: O(2^(n/2) * n) average. Space: O(2^(n/2)).",
      ],
    },
    {
      name: "Closest Subsequence Sum",
      difficulty: "Hard",
      variation: "Minimize |goal - sum| over all subsequences",
      link: "https://leetcode.com/problems/closest-subsequence-sum/",
      question: [
        "You are given an integer array nums (up to 40 elements, values may be negative) and an integer goal. Choose a subsequence (possibly empty) whose sum is as close to goal as possible, and return the minimum absolute difference abs(sum - goal).",
        "Example 1:\nInput: nums = [5,-7,3,5], goal = 6\nOutput: 0\nExplanation: The subsequence [5,-7,3,5] sums to 6.",
        "Example 2:\nInput: nums = [7,-9,15,-2], goal = -5\nOutput: 1",
        "Constraints:\n- 1 <= nums.length <= 40\n- -10^7 <= nums[i] <= 10^7\n- -10^9 <= goal <= 10^9",
      ],
      code: `int minAbsDifference(vector<int>& nums, int goal) {
    int n = nums.size(), h = n / 2;
    vector<long long> left, right;
    auto gen = [](vector<int>::iterator first, vector<int>::iterator last,
                  vector<long long>& out) {
        int m = last - first;
        for (int mask = 0; mask < (1 << m); mask++) {
            long long s = 0;
            for (int i = 0; i < m; i++)
                if (mask & (1 << i)) s += *(first + i);
            out.push_back(s);
        }
    };
    gen(nums.begin(), nums.begin() + h, left);
    gen(nums.begin() + h, nums.end(), right);
    sort(right.begin(), right.end());
    long long best = LLONG_MAX;
    for (long long s : left) {
        long long need = (long long)goal - s;
        auto it = lower_bound(right.begin(), right.end(), need);
        if (it != right.end()) best = min(best, llabs(need - *it));
        if (it != right.begin()) best = min(best, llabs(need - *prev(it)));
    }
    return (int)best;
}`,
      explanation: [
        "Enumerate all subset sums of each half (about 2^20 each). For a fixed left sum s, the ideal right sum is need = goal - s; in the sorted right list the closest value is either the first element >= need or its predecessor, so two candidates per left sum suffice.",
        "Negative values are handled naturally because sums are enumerated exactly rather than indexed. Both halves include the empty-subset sum 0, covering one-sided and empty choices.",
        "Time: O(2^(n/2) log 2^(n/2)). Space: O(2^(n/2)).",
      ],
    },
    {
      name: "Partition Array Into Two Arrays to Minimize Sum Difference",
      difficulty: "Hard",
      variation: "Fixed-size halves, grouped by chosen count",
      link: "https://leetcode.com/problems/partition-array-into-two-arrays-to-minimize-sum-difference/",
      question: [
        "You are given an array nums of 2 * n integers. Partition it into two arrays of length n each, minimizing the absolute difference of their sums. Return that minimum difference.",
        "Example 1:\nInput: nums = [3,9,7,3]\nOutput: 2\nExplanation: [3,9] and [7,3] give |12 - 10| = 2.",
        "Example 2:\nInput: nums = [2,-1,0,4,-2,-9]\nOutput: 3",
        "Constraints:\n- 1 <= n <= 15\n- nums.length == 2 * n\n- -10^7 <= nums[i] <= 10^7",
      ],
      code: `int minimumDifference(vector<int>& nums) {
    int n = nums.size() / 2;
    long long total = accumulate(nums.begin(), nums.end(), 0LL);
    vector<vector<long long>> left(n + 1), right(n + 1);
    for (int mask = 0; mask < (1 << n); mask++) {
        long long sl = 0, sr = 0;
        int c = __builtin_popcount((unsigned)mask);
        for (int i = 0; i < n; i++) {
            if (mask & (1 << i)) {
                sl += nums[i];
                sr += nums[n + i];
            }
        }
        left[c].push_back(sl);
        right[c].push_back(sr);
    }
    for (int c = 0; c <= n; c++) sort(right[c].begin(), right[c].end());
    long long best = LLONG_MAX;
    for (int k = 0; k <= n; k++) {
        vector<long long>& cand = right[n - k];
        for (long long sl : left[k]) {
            long long target = (total - 2 * sl) / 2;
            auto it = lower_bound(cand.begin(), cand.end(), target);
            if (it != cand.end())
                best = min(best, llabs(total - 2 * (sl + *it)));
            if (it != cand.begin())
                best = min(best, llabs(total - 2 * (sl + *prev(it))));
        }
    }
    return (int)best;
}`,
      explanation: [
        "Split nums into two physical halves of n elements. The first partition takes k elements from the left half (sum sl) and n - k from the right half (sum sr); the difference is |total - 2 * (sl + sr)|. Enumerate all masked sums of both halves, bucketed by how many elements the mask picks.",
        "For each left choice, the ideal right sum is (total - 2 * sl) / 2; binary searching the sorted bucket right[n - k] and checking both neighbors of the insertion point covers the closest achievable value on either side (the integer pivot is within 1 of the real optimum, so the two neighbors suffice).",
        "Time: O(2^n * n) to enumerate plus O(2^n log 2^n) to match, with n <= 15. Space: O(2^n).",
      ],
    },
    {
      name: "Minimum Partition Difference, Any Sizes (n up to 40)",
      difficulty: "Hard",
      variation: "Unrestricted split minimizing |sumA - sumB|",
      question: [
        "Given an array a of up to 40 positive integers, split its elements into two groups (either may be empty, sizes unrestricted) minimizing the absolute difference of the group sums. Return that minimum. Values are far too large for the classic O(n * sum) partition DP.",
        "Example 1:\nInput: a = [3, 1, 4, 2, 2]\nOutput: 0\nExplanation: {3, 2, 1} and {4, 2} both sum to 6.",
        "Constraints:\n- 1 <= n <= 40\n- 1 <= a[i] <= 10^12",
      ],
      code: `long long minPartitionDifference(vector<long long>& a) {
    long long total = accumulate(a.begin(), a.end(), 0LL);
    int n = a.size(), h = n / 2;
    vector<long long> left, right;
    for (int mask = 0; mask < (1 << h); mask++) {
        long long s = 0;
        for (int i = 0; i < h; i++)
            if (mask & (1 << i)) s += a[i];
        left.push_back(s);
    }
    int m = n - h;
    for (int mask = 0; mask < (1 << m); mask++) {
        long long s = 0;
        for (int i = 0; i < m; i++)
            if (mask & (1 << i)) s += a[h + i];
        right.push_back(s);
    }
    sort(right.begin(), right.end());
    long long best = LLONG_MAX;
    for (long long s : left) {
        long long target = (total - 2 * s) / 2;
        auto it = lower_bound(right.begin(), right.end(), target);
        if (it != right.end())
            best = min(best, llabs(total - 2 * (s + *it)));
        if (it != right.begin())
            best = min(best, llabs(total - 2 * (s + *prev(it))));
    }
    return best;
}`,
      explanation: [
        "If one group has sum S, the difference is |total - 2S|, so the goal is a subset sum as close to total / 2 as possible. Enumerate subset sums of each half; for each left sum, binary search the sorted right sums for the value bringing the combined sum nearest total / 2, checking both neighbors of the insertion point.",
        "Every subset decomposes uniquely across the halves and both lists contain 0, so all 2^n candidate groups are represented.",
        "Time: O(2^(n/2) log 2^(n/2)). Space: O(2^(n/2)).",
      ],
    },
  ],
};
