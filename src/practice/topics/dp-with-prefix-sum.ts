import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Range Sum Query - Immutable",
      difficulty: "Easy",
      variation: "The prefix sum array itself, as a one-line DP",
      link: "https://leetcode.com/problems/range-sum-query-immutable/",
      question: [
        "Given an integer array nums, handle many queries of the form sumRange(left, right) that return the sum of nums[left] + nums[left+1] + ... + nums[right] inclusive. Implement a class NumArray whose constructor takes nums and whose sumRange answers each query in constant time.",
        "Example 1:\nInput: nums = [-2, 0, 3, -5, 2, -1], queries = sumRange(0,2), sumRange(2,5), sumRange(0,5)\nOutput: 1, -1, -3\nExplanation: -2+0+3 = 1, 3-5+2-1 = -1, and the whole array sums to -3.",
        "Constraints:\n- 1 <= nums.length <= 10^4\n- -10^5 <= nums[i] <= 10^5\n- 0 <= left <= right < nums.length\n- up to 10^4 calls to sumRange",
      ],
      code: `class NumArray {
    vector<long long> pre;   // pre[i] = sum of the first i elements

public:
    NumArray(vector<int>& nums) {
        pre.assign(nums.size() + 1, 0);
        // this loop IS a DP: pre[i+1] = pre[i] + nums[i]
        for (size_t i = 0; i < nums.size(); i++) pre[i + 1] = pre[i] + nums[i];
    }

    int sumRange(int left, int right) {
        return (int)(pre[right + 1] - pre[left]);   // telescoping difference
    }
};`,
      explanation: [
        "The state is pre[i] = sum of nums[0..i-1], and the transition pre[i+1] = pre[i] + nums[i] is the simplest possible DP recurrence. Every problem in this topic is built on top of this one array, so it is worth seeing it as a DP rather than as a trick.",
        "Correctness of the query is a telescoping argument: pre[right+1] counts nums[0..right] and pre[left] counts nums[0..left-1], so the difference counts exactly nums[left..right]. Nothing is double counted because the two prefixes are nested.",
        "The off-by-one is the whole difficulty. Size the array n+1 and define pre[0] = 0 for the empty prefix; then sumRange never needs a special case for left = 0. Sizing it n and defining pre[i] as the sum through i forces an if-statement at every call site and is where bugs come from.",
        "Use a 64-bit accumulator even when each element fits in an int: 10^4 elements of magnitude 10^5 reach 10^9, which is uncomfortably close to the int limit.",
        "Time: O(n) to build, O(1) per query. Space: O(n).",
      ],
    },
    {
      name: "Dice Combinations",
      difficulty: "Easy",
      variation: "Fixed-width window sum, kept as a rolling total",
      link: "https://cses.fi/problemset/task/1633",
      question: [
        "Your task is to count the number of ways to construct sum n by throwing a six-sided die one or more times. Two ways are different if the sequence of throws differs, so 1+2 and 2+1 are counted separately. Print the answer modulo 10^9+7.",
        "Example 1:\nInput:\n3\nOutput: 4\nExplanation: The four sequences are 1+1+1, 1+2, 2+1, and 3.",
        "Example 2:\nInput:\n8\nOutput: 125",
        "Constraints:\n- 1 <= n <= 10^6",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    const long long MOD = 1000000007;
    vector<long long> dp(n + 1, 0);
    dp[0] = 1;                       // one way to make sum 0: throw nothing
    long long window = 1;            // running sum of dp[i-6 .. i-1]
    for (int i = 1; i <= n; i++) {
        dp[i] = window;
        window = (window + dp[i]) % MOD;                 // slide right edge in
        if (i - 6 >= 0) window = (window - dp[i - 6] + MOD) % MOD;   // slide left edge out
    }
    cout << dp[n] << "\\n";
    return 0;
}`,
      explanation: [
        "State: dp[i] = number of throw sequences summing to exactly i. The last throw was one of 1..6, and those six cases are disjoint (they differ in the value of the final throw) and exhaustive, so dp[i] = dp[i-1] + dp[i-2] + ... + dp[i-6] with negative indices treated as zero.",
        "Written literally that is six additions per state, which is fine here but is the shape that generalises badly. The window of summed terms is contiguous and slides by one each step, so instead of re-adding six values keep the total: when i advances, dp[i-1] enters the window and dp[i-7] leaves it. That is the prefix-sum idea in its cheapest incremental form.",
        "The tempting wrong move is to reset the window from scratch or to forget the eviction, which silently turns the recurrence into a sum over all previous states and gives powers of two forever. Verify against the first terms 1, 2, 4, 8, 16, 32, 63 - the drop from 64 to 63 at i = 7 is exactly the first eviction.",
        "Subtraction under a modulus must add MOD before taking the remainder, otherwise C++ leaves a negative value.",
        "Time: O(n). Space: O(n) for the table; the window itself is O(1).",
      ],
    },
    {
      name: "Maximum Subarray",
      difficulty: "Easy",
      variation: "Best prefix difference via a running prefix minimum",
      link: "https://leetcode.com/problems/maximum-subarray/",
      question: [
        "Given an integer array nums, find the contiguous subarray containing at least one number which has the largest sum, and return that sum.",
        "Example 1:\nInput: nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]\nOutput: 6\nExplanation: The subarray [4, -1, 2, 1] has sum 6.",
        "Example 2:\nInput: nums = [5, 4, -1, 7, 8]\nOutput: 23\nExplanation: The whole array is best.",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- -10^4 <= nums[i] <= 10^4",
      ],
      code: `int maxSubArray(vector<int>& nums) {
    long long pre = 0;                 // prefix sum through the current index
    long long minPre = 0;              // smallest prefix seen strictly earlier
    long long best = LLONG_MIN;
    for (int x : nums) {
        pre += x;
        best = max(best, pre - minPre);   // close a subarray ending here
        minPre = min(minPre, pre);        // only now may this prefix be a left cut
    }
    return (int)best;
}`,
      explanation: [
        "Any subarray sum is pre[r+1] - pre[l], so maximising the sum means, for each right end r, subtracting the smallest prefix that lies strictly to its left. Scanning left to right lets that minimum be maintained in a single variable - a prefix minimum instead of a prefix sum, but the same collapse of a range query into O(1).",
        "The ordering inside the loop carries the correctness. best is updated before minPre, which guarantees the left cut is strictly before the right end and so the chosen subarray is non-empty. Swapping the two lines allows pre - pre = 0 and returns 0 for an all-negative array.",
        "minPre starts at 0, the empty prefix, so a subarray starting at index 0 is reachable.",
        "This is Kadane's algorithm in prefix-sum clothing: Kadane's dp[i] = max(dp[i-1] + x, x) is the same quantity expressed without ever materialising the prefixes. Knowing both forms matters because the prefix form generalises to 'best subarray with length between L and R', where the running minimum becomes a monotonic deque over a window of prefixes.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Subarray Sum Equals K",
      difficulty: "Medium",
      variation: "Counting prefix-sum values with a hash map",
      link: "https://leetcode.com/problems/subarray-sum-equals-k/",
      question: [
        "Given an array of integers nums and an integer k, return the total number of contiguous subarrays whose elements sum to exactly k. Elements may be negative.",
        "Example 1:\nInput: nums = [1, 1, 1], k = 2\nOutput: 2\nExplanation: The subarrays [1,1] at indices 0..1 and 1..2.",
        "Example 2:\nInput: nums = [1, 2, 3], k = 3\nOutput: 2\nExplanation: [1,2] and [3].",
        "Constraints:\n- 1 <= nums.length <= 2 * 10^4\n- -1000 <= nums[i] <= 1000\n- -10^7 <= k <= 10^7",
      ],
      code: `int subarraySum(vector<int>& nums, int k) {
    unordered_map<long long, int> seen;
    seen[0] = 1;                 // the empty prefix, so subarrays from index 0 count
    long long pre = 0;
    int ans = 0;
    for (int x : nums) {
        pre += x;
        auto it = seen.find(pre - k);
        if (it != seen.end()) ans += it->second;   // every earlier cut that closes a valid subarray
        seen[pre]++;
    }
    return ans;
}`,
      explanation: [
        "A subarray (l, r] sums to k exactly when pre[r] - pre[l] = k, i.e. pre[l] = pre[r] - k. So for each right end the answer contribution is the number of earlier prefix values equal to pre[r] - k, which a hash map of counts answers in O(1). Think of it as a DP over prefix-sum values rather than over indices.",
        "Counting, not membership, is the point: with repeated prefix values a set would count one subarray where several exist. On [1,1,1] with k = 2 the prefixes are 1, 2, 3 and the map must remember that 0 and 1 each occurred once.",
        "The map is queried before pre is inserted, which enforces l < r and rules out the empty subarray. Seeding seen[0] = 1 is what makes prefixes that start at index 0 count.",
        "The tempting wrong approach is a sliding window. That needs the sum to be monotone in the window length, which only holds for non-negative arrays; with negatives present, shrinking the window can increase the sum and no two-pointer schedule is valid. This is the standard trap on this problem.",
        "Time: O(n) expected. Space: O(n) for the map.",
      ],
    },
    {
      name: "Number of Dice Rolls With Target Sum",
      difficulty: "Medium",
      variation: "Layered counting DP, window sum of the previous layer",
      link: "https://leetcode.com/problems/number-of-dice-rolls-with-target-sum/",
      question: [
        "You have n dice and each die has k faces numbered 1 to k. Return the number of possible ways, modulo 10^9+7, to roll the dice so that the sum of the face-up numbers equals target.",
        "Example 1:\nInput: n = 1, k = 6, target = 3\nOutput: 1\nExplanation: Only a single roll of 3.",
        "Example 2:\nInput: n = 2, k = 6, target = 7\nOutput: 6\nExplanation: 1+6, 2+5, 3+4, 4+3, 5+2, 6+1.",
        "Constraints:\n- 1 <= n, k <= 30\n- 1 <= target <= 1000",
      ],
      code: `int numRollsToTarget(int n, int k, int target) {
    const long long MOD = 1000000007;
    vector<long long> dp(target + 1, 0), nxt(target + 1), pre(target + 2);
    dp[0] = 1;
    for (int die = 1; die <= n; die++) {
        pre[0] = 0;
        for (int t = 0; t <= target; t++) pre[t + 1] = (pre[t] + dp[t]) % MOD;
        for (int t = 0; t <= target; t++) {
            if (t == 0) { nxt[t] = 0; continue; }        // a die always adds at least 1
            int lo = max(0, t - k);                      // window is dp[t-k .. t-1]
            nxt[t] = (pre[t] - pre[lo] + MOD) % MOD;
        }
        dp = nxt;
    }
    return (int)dp[target];
}`,
      explanation: [
        "State: dp[i][t] = ways to make sum t with the first i dice. The i-th die shows some f in 1..k, so dp[i][t] = dp[i-1][t-1] + dp[i-1][t-2] + ... + dp[i-1][t-k]. That is a contiguous window of the previous layer, clamped at zero on the left - the canonical shape this whole topic exists for.",
        "Build a prefix-sum array of the previous layer once per die, then every state is one subtraction: pre[t] - pre[max(0, t-k)]. This turns O(n * target * k) into O(n * target). At the stated limits both pass, but the same collapse is what makes k up to 10^9 tractable in harder variants.",
        "The prefix array must be taken over the previous layer, not the one being written. Overwriting dp in place while reading prefixes of it counts a die being used more than once, which is exactly the difference between counting compositions and counting unbounded combinations.",
        "Note pre[t] rather than pre[t+1] as the right end: the window stops at t-1, since a die contributes at least 1 and t itself is unreachable in this layer.",
        "Time: O(n * target). Space: O(target).",
      ],
    },
    {
      name: "Candies (AtCoder Educational DP Contest M)",
      difficulty: "Medium",
      variation: "Per-item bounded window, prefix sums of the previous layer",
      link: "https://atcoder.jp/contests/dp/tasks/dp_m",
      question: [
        "There are N children numbered 1 to N and K candies to distribute. Child i must receive between 0 and a[i] candies inclusive, and all K candies must be handed out. Find the number of ways to distribute the candies, modulo 10^9+7. Two ways differ if some child receives a different number of candies.",
        "Example 1:\nInput:\n3 4\n1 2 3\nOutput: 5\nExplanation: The distributions are (0,1,3), (0,2,2), (1,0,3), (1,1,2), (1,2,1).",
        "Example 2:\nInput:\n1 10\n9\nOutput: 0\nExplanation: The single child cannot take more than 9 candies, so 10 is impossible.",
        "Constraints:\n- 1 <= N <= 100\n- 0 <= K <= 10^5\n- 0 <= a[i] <= K",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    int k;
    cin >> n >> k;
    const long long MOD = 1000000007;
    vector<long long> dp(k + 1, 0), nxt(k + 1), pre(k + 2);
    dp[0] = 1;
    for (int i = 0; i < n; i++) {
        int a;
        cin >> a;
        pre[0] = 0;
        for (int j = 0; j <= k; j++) pre[j + 1] = (pre[j] + dp[j]) % MOD;
        for (int j = 0; j <= k; j++) {
            int lo = max(0, j - a);                      // this child took 0..a candies
            nxt[j] = (pre[j + 1] - pre[lo] + MOD) % MOD;
        }
        dp = nxt;
    }
    cout << dp[k] << "\\n";
    return 0;
}`,
      explanation: [
        "State: dp[i][j] = ways to give exactly j candies to the first i children. Child i takes some c in 0..a[i], so dp[i][j] = sum over c of dp[i-1][j-c] = dp[i-1][j-a[i]] + ... + dp[i-1][j], again a contiguous window of the previous row. Note the window includes j itself here, because taking zero candies is allowed - hence pre[j+1] rather than pre[j] as the right end.",
        "The naive transition is O(N * K * max a), which at N = 100 and K = 10^5 is 10^12 operations. One prefix-sum pass per child makes each state O(1) and the whole solve O(N * K) = 10^7. This problem is the cleanest illustration of why the pattern exists: the recurrence is unchanged, only its evaluation gets cheaper.",
        "The window's left end is clamped with max(0, j - a[i]), which is not cosmetic: an unclamped index would read garbage, and clamping to 0 correctly says that dp[i-1][negative] = 0 rather than wrapping around.",
        "A bounded-count knapsack is the general form of this. Solving it by simulating each unit of the bound separately (splitting a child with limit a into a copies of a 0-or-1 choice) is the wrong-but-tempting move: it recounts the same distribution many times, since the units are indistinguishable.",
        "Time: O(N * K). Space: O(K) with two rolling rows.",
      ],
    },
    {
      name: "Largest Sum of Averages",
      difficulty: "Medium",
      variation: "Partition DP with O(1) segment sums",
      link: "https://leetcode.com/problems/largest-sum-of-averages/",
      question: [
        "You are given an integer array nums and an integer k. Partition the array into at most k non-empty contiguous groups. The score of a partition is the sum of the averages of each group. Return the maximum score achievable. Answers within 10^-6 of the correct value are accepted.",
        "Example 1:\nInput: nums = [9, 1, 2, 3, 9], k = 3\nOutput: 20.00000\nExplanation: Split as [9], [1,2,3], [9] giving 9 + 2 + 9 = 20. Any other split scores less.",
        "Example 2:\nInput: nums = [1, 2, 3, 4, 5, 6, 7], k = 4\nOutput: 20.50000",
        "Constraints:\n- 1 <= nums.length <= 100\n- 1 <= nums[i] <= 10^4\n- 1 <= k <= nums.length",
      ],
      code: `double largestSumOfAverages(vector<int>& nums, int k) {
    int n = nums.size();
    vector<double> pre(n + 1, 0.0);
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + nums[i];

    // dp[i] = best score for the suffix starting at i, using the current group budget
    vector<double> dp(n + 1, 0.0);
    for (int i = 0; i < n; i++) dp[i] = (pre[n] - pre[i]) / (n - i);   // budget 1

    for (int g = 2; g <= k; g++) {
        vector<double> nd = dp;   // carrying dp over handles 'at most k' groups
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++)
                nd[i] = max(nd[i], (pre[j] - pre[i]) / (j - i) + dp[j]);
        dp = nd;
    }
    return dp[0];
}`,
      explanation: [
        "State: dp[g][i] = the best score obtainable from the suffix nums[i..n-1] cut into at most g groups. The first group is nums[i..j-1] for some j > i, so dp[g][i] = max over j of average(i, j) + dp[g-1][j]. The base layer dp[1][i] puts the whole suffix in one group.",
        "The prefix sums are what make each candidate cut O(1). Without them, evaluating average(i, j) costs O(j - i) and the solve becomes O(k * n^3); with them it is O(k * n^2). This is the second common role of prefix sums in DP: not collapsing a sum of dp values, but making the cost of a segment constant so the transition stays cheap.",
        "Two correctness points. Averages are not additive, so there is no greedy 'always cut at the largest drop' rule - a partition DP is genuinely needed. And 'at most k' is handled by seeding each new layer from the previous one, so a partition using fewer groups is never lost; with all-positive values more groups usually help, but the code should not rely on that.",
        "Keep pre in double here rather than integer: the values are small enough that the exact prefix is representable, and mixing integer division into the average is the classic silent bug.",
        "Time: O(k * n^2). Space: O(n).",
      ],
    },
    {
      name: "Number of Submatrices That Sum to Target",
      difficulty: "Hard",
      variation: "2D prefix sums reduced to the 1D counting problem",
      link: "https://leetcode.com/problems/number-of-submatrices-that-sum-to-target/",
      question: [
        "Given a matrix of integers and an integer target, count the number of non-empty submatrices whose elements sum to target. A submatrix is defined by a row range and a column range. Two submatrices are different if their row or column ranges differ, even if their contents are identical.",
        "Example 1:\nInput: matrix = [[0,1,0],[1,1,1],[0,1,0]], target = 0\nOutput: 4\nExplanation: The four single-cell submatrices holding a 0.",
        "Example 2:\nInput: matrix = [[1,-1],[-1,1]], target = 0\nOutput: 5\nExplanation: Four 1x2 or 2x1 submatrices summing to 0, plus the full 2x2 matrix.",
        "Constraints:\n- 1 <= matrix.length, matrix[0].length <= 100\n- -1000 <= matrix[i][j] <= 1000\n- -10^8 <= target <= 10^8",
      ],
      code: `int numSubmatrixSumTarget(vector<vector<int>>& matrix, int target) {
    int r = matrix.size(), c = matrix[0].size();
    // rowPre[i][j] = sum of row i over columns 0..j-1
    vector<vector<long long>> rowPre(r, vector<long long>(c + 1, 0));
    for (int i = 0; i < r; i++)
        for (int j = 0; j < c; j++) rowPre[i][j + 1] = rowPre[i][j] + matrix[i][j];

    int ans = 0;
    for (int c1 = 0; c1 < c; c1++) {
        for (int c2 = c1; c2 < c; c2++) {
            // strip[i] = sum of row i between columns c1..c2; now it is Subarray Sum Equals K
            unordered_map<long long, int> seen;
            seen[0] = 1;
            long long pre = 0;
            for (int i = 0; i < r; i++) {
                pre += rowPre[i][c2 + 1] - rowPre[i][c1];
                auto it = seen.find(pre - target);
                if (it != seen.end()) ans += it->second;
                seen[pre]++;
            }
        }
    }
    return ans;
}`,
      explanation: [
        "Fix the pair of column bounds. Collapsing each row to its sum between those columns turns the 2D problem into a 1D array, and counting submatrices with sum target becomes counting subarrays with sum target - the hash-map prefix count from earlier, reused verbatim. Every submatrix is generated exactly once because each has a unique column pair and a unique row range.",
        "The row prefix sums are what make the collapse free: without them, rebuilding the strip for each column pair costs O(c) per row and the total becomes O(r * c^3).",
        "Iterating over column pairs and rows rather than over row pairs and columns is a real choice, not a stylistic one - the outer loop should run over the smaller dimension so the map is rebuilt fewer times. On a 1 by 10^4 shaped input the wrong orientation is thousands of times slower.",
        "The tempting wrong approach is a sliding window in each direction. Negative entries kill monotonicity in both dimensions, so only the counting form works.",
        "Time: O(c^2 * r) expected. Space: O(r * c) for the prefix table plus O(r) for the map.",
      ],
    },
    {
      name: "K Inverse Pairs Array",
      difficulty: "Hard",
      variation: "Sliding window over the previous DP row",
      link: "https://leetcode.com/problems/k-inverse-pairs-array/",
      question: [
        "For an integer array nums, an inverse pair is a pair of indices (i, j) with i < j and nums[i] > nums[j]. Given two integers n and k, return the number of different arrays consisting of the numbers 1 to n, each used exactly once, that have exactly k inverse pairs. The answer may be large, so return it modulo 10^9+7.",
        "Example 1:\nInput: n = 3, k = 0\nOutput: 1\nExplanation: Only the sorted array [1,2,3] has no inverse pair.",
        "Example 2:\nInput: n = 3, k = 1\nOutput: 2\nExplanation: [1,3,2] and [2,1,3] each have exactly one inverse pair.",
        "Constraints:\n- 1 <= n <= 1000\n- 0 <= k <= 1000",
      ],
      code: `int kInversePairs(int n, int k) {
    const long long MOD = 1000000007;
    vector<long long> dp(k + 1, 0), pre(k + 2, 0);
    dp[0] = 1;                       // a single element has 0 inverse pairs
    for (int i = 2; i <= n; i++) {
        pre[0] = 0;
        for (int j = 0; j <= k; j++) pre[j + 1] = (pre[j] + dp[j]) % MOD;
        for (int j = 0; j <= k; j++) {
            int lo = max(0, j - (i - 1));            // inserting i adds 0..i-1 new pairs
            dp[j] = (pre[j + 1] - pre[lo] + MOD) % MOD;
        }
    }
    return (int)dp[k];
}`,
      explanation: [
        "State: dp[i][j] = permutations of 1..i with exactly j inverse pairs. Build the permutation by inserting the largest value i into a permutation of 1..i-1. Since i is larger than everything present, placing it with t elements to its right creates exactly t new inverse pairs and changes no existing one, and t ranges over 0..i-1. So dp[i][j] = dp[i-1][j] + dp[i-1][j-1] + ... + dp[i-1][j-(i-1)].",
        "That insert-the-maximum argument is what makes the transition a clean contiguous window - inserting an arbitrary value would disturb the pairs already counted and the recurrence would not close. Once the window is contiguous, one prefix-sum pass per row makes each of the n*k states O(1), replacing an O(n * k * n) triple loop.",
        "Writing dp[j] in place is safe here only because pre was computed from the full previous row before any write. If you skip the separate pre array and try to subtract dp values as you go, you mix the two rows and get nonsense.",
        "Clamping lo at 0 encodes both boundary facts at once: j fewer than i-1 means the window is truncated, and there is no way to have a negative number of inverse pairs.",
        "A subtle limit check: k can exceed the maximum possible n*(n-1)/2 inverse pairs, in which case the table naturally holds 0 and no special case is needed.",
        "Time: O(n * k). Space: O(k).",
      ],
    },
    {
      name: "Build Array Where You Can Find The Maximum Exactly K Comparisons",
      difficulty: "Hard",
      variation: "Three-dimensional DP, prefix sums over the maximum",
      link: "https://leetcode.com/problems/build-array-where-you-can-find-the-maximum-exactly-k-comparisons/",
      question: [
        "Consider the algorithm that finds the maximum of an array by scanning left to right, keeping a running maximum, and incrementing a counter every time it assigns a new running maximum (the first element always counts as one such assignment). Given three integers n, m and k, count the arrays of length n whose values are in the range 1 to m and for which that counter ends at exactly k. Return the count modulo 10^9+7.",
        "Example 1:\nInput: n = 2, m = 3, k = 1\nOutput: 6\nExplanation: The arrays are [1,1], [2,1], [2,2], [3,1], [3,2], [3,3] - in each the running maximum is set only once, by the first element.",
        "Example 2:\nInput: n = 5, m = 2, k = 3\nOutput: 0\nExplanation: With only two distinct values the counter can never exceed 2.",
        "Example 3:\nInput: n = 9, m = 1, k = 1\nOutput: 1\nExplanation: Only the all-ones array exists, and its counter is 1.",
        "Constraints:\n- 1 <= n <= 50\n- 1 <= m <= 100\n- 0 <= k <= n",
      ],
      code: `int numOfArrays(int n, int m, int k) {
    if (k == 0) return 0;            // the first element always costs one assignment
    const long long MOD = 1000000007;
    // dp[j][c] = arrays built so far whose maximum is j and whose counter is c
    vector<vector<long long>> dp(m + 1, vector<long long>(k + 1, 0));
    for (int j = 1; j <= m; j++) dp[j][1] = 1;

    for (int i = 2; i <= n; i++) {
        vector<vector<long long>> pre(m + 1, vector<long long>(k + 1, 0));
        for (int j = 1; j <= m; j++)
            for (int c = 0; c <= k; c++) pre[j][c] = (pre[j - 1][c] + dp[j][c]) % MOD;

        vector<vector<long long>> nd(m + 1, vector<long long>(k + 1, 0));
        for (int j = 1; j <= m; j++)
            for (int c = 1; c <= k; c++)
                // either append a value <= j (j choices, counter unchanged),
                // or make j the brand new maximum over any smaller old maximum
                nd[j][c] = ((long long)j * dp[j][c] + pre[j - 1][c - 1]) % MOD;
        dp = nd;
    }

    long long ans = 0;
    for (int j = 1; j <= m; j++) ans = (ans + dp[j][k]) % MOD;
    return (int)ans;
}`,
      explanation: [
        "State: dp[i][j][c] = number of length-i prefixes whose maximum is exactly j and whose assignment counter is c. Appending one element splits into two disjoint cases. If the new element is at most the current maximum j, the counter and maximum are unchanged and there are j such values, giving j * dp[i-1][j][c]. If the new element becomes the new maximum j, the previous maximum was some j' < j and the counter was c-1, giving sum over j' < j of dp[i-1][j'][c-1].",
        "That inner sum is a prefix over the maximum dimension, so one prefix table per length removes the innermost loop: O(n * m * k) instead of O(n * m^2 * k). At m = 100 the naive version is only 25 million operations and also passes, but the prefix form is the one that survives when m grows.",
        "The subtle correctness point is that the new maximum is the value being appended, not a free choice - there is exactly one value that makes j the maximum, which is why the second term has no multiplier. Multiplying it by anything is the most common wrong transition here.",
        "The prefix index is pre[j-1][c-1], strictly below j, because the previous maximum must be smaller. Using pre[j][c-1] would let a value equal the old maximum and count it as a new assignment, which the scanning algorithm would not do since it only reassigns on a strict increase.",
        "k = 0 is impossible for any non-empty array, and is handled up front so the layers never have to represent it.",
        "Time: O(n * m * k). Space: O(m * k).",
      ],
    },
    {
      name: "Number of Ways of Cutting a Pizza",
      difficulty: "Hard",
      variation: "2D suffix sums inside a guillotine-cut DP",
      link: "https://leetcode.com/problems/number-of-ways-of-cutting-a-pizza/",
      question: [
        "Given a rectangular pizza represented by a grid of characters where 'A' is an apple and '.' is empty, and an integer k, cut the pizza into k pieces using k-1 cuts. Each cut is made on the piece that currently contains the upper-left corner: choose a horizontal or vertical line, give away the upper piece or the left piece, and keep the rest. Every one of the k pieces must contain at least one apple. Return the number of ways to do this, modulo 10^9+7.",
        "Example 1:\nInput: pizza = ['A..', 'AAA', '...'], k = 3\nOutput: 3\nExplanation: There are three ways to make two cuts so that all three pieces hold an apple.",
        "Example 2:\nInput: pizza = ['A..', 'AA.', '...'], k = 3\nOutput: 1",
        "Constraints:\n- 1 <= rows, cols <= 50\n- 1 <= k <= 10\n- pizza consists only of the characters 'A' and '.'",
      ],
      code: `int ways(vector<string>& pizza, int k) {
    const long long MOD = 1000000007;
    int r = pizza.size(), c = pizza[0].size();
    // suf[i][j] = apples in the rectangle rows i..r-1, cols j..c-1
    vector<vector<int>> suf(r + 1, vector<int>(c + 1, 0));
    for (int i = r - 1; i >= 0; i--)
        for (int j = c - 1; j >= 0; j--)
            suf[i][j] = (pizza[i][j] == 'A') + suf[i + 1][j] + suf[i][j + 1] - suf[i + 1][j + 1];

    // dp[i][j] = ways to finish, given the kept piece starts at (i, j) and no cuts remain
    vector<vector<long long>> dp(r + 1, vector<long long>(c + 1, 0));
    for (int i = 0; i < r; i++)
        for (int j = 0; j < c; j++) dp[i][j] = suf[i][j] > 0 ? 1 : 0;

    for (int cut = 1; cut < k; cut++) {
        vector<vector<long long>> nd(r + 1, vector<long long>(c + 1, 0));
        for (int i = 0; i < r; i++) {
            for (int j = 0; j < c; j++) {
                long long s = 0;
                // horizontal cut: give away rows i..ni-1, keep from row ni
                for (int ni = i + 1; ni < r; ni++)
                    if (suf[i][j] - suf[ni][j] > 0) s += dp[ni][j];
                // vertical cut: give away cols j..nj-1, keep from col nj
                for (int nj = j + 1; nj < c; nj++)
                    if (suf[i][j] - suf[i][nj] > 0) s += dp[i][nj];
                nd[i][j] = s % MOD;
            }
        }
        dp = nd;
    }
    return (int)dp[0][0];
}`,
      explanation: [
        "Because every cut discards the top or left part and keeps the rest, the piece still in play is always a suffix rectangle anchored at some (i, j) with the bottom-right corner fixed. So the state is just (i, j, cuts remaining) - a three-dimensional DP of size 50 * 50 * 10.",
        "2D suffix sums make the apple test O(1). The piece given away by a horizontal cut at row ni is rows i..ni-1 over columns j..c-1, whose apple count is suf[i][j] - suf[ni][j] because the two rectangles share their right and bottom edges. The vertical case is symmetric. Building suf itself uses inclusion-exclusion: add the cell, add the rectangle below and the rectangle to the right, then subtract their doubly-counted overlap.",
        "Both pieces must be validated, not just one. The discarded piece is checked by the if-condition; the kept piece is checked by the base layer, where dp with zero cuts remaining is 1 only when the remaining rectangle still holds an apple. Dropping either check is the usual wrong answer.",
        "The cuts are counted, not the pieces: k pieces need k-1 cuts, hence the loop bound cut < k. Off-by-one here produces an answer that is wrong by a whole layer.",
        "A pure counting-of-apples shortcut is tempting - divide the apples into k groups - but the cut geometry is guillotine-restricted and always anchored at the corner, so most groupings are unreachable and only the DP is correct.",
        "Time: O(k * r * c * (r + c)). Space: O(r * c).",
      ],
    },
  ],
};
