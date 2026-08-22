import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Maximum Subarray",
      difficulty: "Medium",
      variation: "Kadane's algorithm, the template",
      link: "https://leetcode.com/problems/maximum-subarray/",
      question: [
        "Given an integer array nums, find the contiguous subarray containing at least one number which has the largest sum, and return that sum.",
        "Example 1:\nInput: nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]\nOutput: 6\nExplanation: The subarray [4, -1, 2, 1] has the largest sum, 6.",
        "Example 2:\nInput: nums = [-1]\nOutput: -1\nExplanation: A subarray must be non-empty, so the single element is the answer.",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- -10^4 <= nums[i] <= 10^4",
      ],
      code: `int maxSubArray(vector<int>& nums) {
    int best = nums[0];
    int cur = nums[0];          // best sum of a subarray ending exactly at i
    for (size_t i = 1; i < nums.size(); i++) {
        cur = max(nums[i], cur + nums[i]);   // start fresh, or extend
        best = max(best, cur);
    }
    return best;
}`,
      explanation: [
        "The DP behind Kadane: let cur[i] be the largest sum of a subarray that *ends at index i*. Such a subarray either consists of nums[i] alone, or it is a subarray ending at i-1 extended by nums[i]. So cur[i] = max(nums[i], cur[i-1] + nums[i]).",
        "Fixing the right endpoint is what makes the problem one-dimensional. Every subarray ends somewhere, so scanning i and taking the maximum of cur covers all O(n^2) subarrays in O(n) steps.",
        "Read the transition as a decision rule: extend the running subarray while it is helping, abandon it the moment cur[i-1] is negative, because a negative prefix can only drag down whatever follows.",
        "Initialising best to 0 is the classic bug. With all-negative input the empty subarray is not allowed, so best must start at nums[0] - or at LLONG_MIN if you prefer - never at 0.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Maximum Subarray — Return the Subarray Itself",
      difficulty: "Medium",
      variation: "Reconstructing the boundaries",
      link: "https://www.geeksforgeeks.org/problems/kadanes-algorithm-1587115620/1",
      question: [
        "Given an integer array arr, find the contiguous subarray with the largest sum and return its start and end indices (0-based). If several subarrays tie on sum, return the one with the smallest start index, and among those the shortest one.",
        "Example 1:\nInput: arr = [-2, -3, 4, -1, -2, 1, 5, -3]\nOutput: start = 2, end = 6\nExplanation: [4, -1, -2, 1, 5] sums to 7.",
        "Example 2:\nInput: arr = [-3, -1, -2]\nOutput: start = 1, end = 1",
        "Constraints:\n- 1 <= arr.length <= 10^5\n- -10^4 <= arr[i] <= 10^4",
      ],
      code: `pair<int,int> maxSubArrayRange(vector<int>& arr) {
    int best = arr[0], cur = arr[0];
    int bestL = 0, bestR = 0, curL = 0;
    for (int i = 1; i < (int)arr.size(); i++) {
        if (cur + arr[i] < arr[i]) {    // abandoning beats extending
            cur = arr[i];
            curL = i;                   // the running subarray restarts here
        } else {
            cur += arr[i];
        }
        if (cur > best) {               // strict > keeps the earliest, shortest winner
            best = cur;
            bestL = curL;
            bestR = i;
        }
    }
    return {bestL, bestR};
}`,
      explanation: [
        "Reconstruction is where the two branches of the max must be separated. Whenever starting fresh wins, the running subarray's left edge moves to i; whenever extending wins, the left edge is unchanged. Tracking curL alongside cur is all the bookkeeping needed.",
        "The right edge is always the current i, so it is only recorded when a new global best appears.",
        "The comparison must stay strict. Using >= would replace a tied answer with a later one, which violates the smallest-start-index tie-break; the strict version keeps the first subarray that achieved the maximum.",
        "This is the general recipe for turning any DP into a solution that reports *which* choices were made: store the decision alongside the value, or store a parent pointer and walk it backwards at the end.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Maximum Sum Circular Subarray",
      difficulty: "Medium",
      variation: "Wrap-around via the complement",
      link: "https://leetcode.com/problems/maximum-sum-circular-subarray/",
      question: [
        "Given a circular integer array nums of length n, return the maximum possible sum of a non-empty subarray. The array is circular, so the element after nums[n-1] is nums[0]. A subarray may wrap around, but it may not include any element more than once.",
        "Example 1:\nInput: nums = [1, -2, 3, -2]\nOutput: 3\nExplanation: The best subarray is [3].",
        "Example 2:\nInput: nums = [5, -3, 5]\nOutput: 10\nExplanation: [5, 5] wrapping around the end.",
        "Example 3:\nInput: nums = [-3, -2, -3]\nOutput: -2",
        "Constraints:\n- 1 <= nums.length <= 3 * 10^4\n- -3 * 10^4 <= nums[i] <= 3 * 10^4",
      ],
      code: `int maxSubarraySumCircular(vector<int>& nums) {
    long long total = 0;
    long long maxCur = nums[0], maxBest = nums[0];
    long long minCur = nums[0], minBest = nums[0];

    total = nums[0];
    for (size_t i = 1; i < nums.size(); i++) {
        total += nums[i];
        maxCur = max((long long)nums[i], maxCur + nums[i]);
        maxBest = max(maxBest, maxCur);
        minCur = min((long long)nums[i], minCur + nums[i]);
        minBest = min(minBest, minCur);
    }

    if (maxBest < 0) return (int)maxBest;      // every element is negative
    return (int)max(maxBest, total - minBest);  // non-wrapping, or the complement of the worst middle
}`,
      explanation: [
        "Split on whether the answer wraps. If it does not, plain Kadane finds it. If it does, the elements it *excludes* form one contiguous non-wrapping block in the middle, so the wrapping answer equals total - (minimum-sum subarray). Running Kadane twice, once for max and once for min, covers both cases.",
        "The all-negative case must be special-cased. There the minimum-sum subarray is the entire array, so total - minBest is 0, which corresponds to the empty subarray - not allowed. Detect it with maxBest < 0 and return maxBest, the least-negative single element.",
        "Both Kadane runs share the scan, so this is still a single pass. Accumulate in 64-bit: 3*10^4 elements of magnitude 3*10^4 reach 9*10^8, close enough to the int limit to be worth avoiding.",
        "The 'complement of the middle' trick generalises: whenever a circular structure allows a wrapping selection, describing the answer by what it leaves out often turns it back into a linear problem.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Maximum Product Subarray",
      difficulty: "Medium",
      variation: "Two running extremes, because sign flips",
      link: "https://leetcode.com/problems/maximum-product-subarray/",
      question: [
        "Given an integer array nums, find a contiguous non-empty subarray within the array that has the largest product, and return that product. The answer is guaranteed to fit in a 32-bit integer.",
        "Example 1:\nInput: nums = [2, 3, -2, 4]\nOutput: 6\nExplanation: [2, 3] has product 6.",
        "Example 2:\nInput: nums = [-2, 0, -1]\nOutput: 0\nExplanation: [-2, -1] is not contiguous, so the best is [0].",
        "Constraints:\n- 1 <= nums.length <= 2 * 10^4\n- -10 <= nums[i] <= 10",
      ],
      code: `int maxProduct(vector<int>& nums) {
    int best = nums[0];
    int hi = nums[0];   // largest product of a subarray ending here
    int lo = nums[0];   // smallest product of a subarray ending here
    for (size_t i = 1; i < nums.size(); i++) {
        int x = nums[i];
        int prevHi = hi, prevLo = lo;
        hi = max({ x, prevHi * x, prevLo * x });
        lo = min({ x, prevHi * x, prevLo * x });
        best = max(best, hi);
    }
    return best;
}`,
      explanation: [
        "Kadane's single running maximum breaks under multiplication: a large negative product becomes the *best* product as soon as the next element is negative. One value per index is therefore not enough state.",
        "Carrying both extremes fixes it. hi and lo are the largest and smallest products of a subarray ending at i, and both candidates for the next step come from multiplying either extreme by nums[i] - plus the option of starting fresh at x.",
        "Snapshotting prevHi and prevLo is essential. Overwriting hi first would feed the new value into lo's computation and quietly produce nonsense.",
        "Zeros need no special handling: multiplying through gives 0, and the 'start fresh at x' branch lets the scan recover on the next element.",
        "The general lesson: when the combining operation is not monotone, the DP state must carry every extreme the transition can turn into an optimum.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Maximum Absolute Sum of Any Subarray",
      difficulty: "Medium",
      variation: "Max and min Kadane, combined",
      link: "https://leetcode.com/problems/maximum-absolute-sum-of-any-subarray/",
      question: [
        "You are given an integer array nums. The absolute sum of a subarray is abs(sum of its elements). Return the maximum absolute sum of any (possibly empty) subarray of nums.",
        "Example 1:\nInput: nums = [1, -3, 2, 3, -4]\nOutput: 5\nExplanation: The subarray [2, 3] has absolute sum 5.",
        "Example 2:\nInput: nums = [2, -5, 1, -4, 3, -2]\nOutput: 8\nExplanation: The subarray [-5, 1, -4] has absolute sum 8.",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- -10^4 <= nums[i] <= 10^4",
      ],
      code: `int maxAbsoluteSum(vector<int>& nums) {
    int maxCur = 0, minCur = 0, best = 0;
    for (int x : nums) {
        maxCur = max(0, maxCur + x);   // empty subarray is allowed, so clamp at 0
        minCur = min(0, minCur + x);
        best = max(best, max(maxCur, -minCur));
    }
    return best;
}`,
      explanation: [
        "The largest absolute value is achieved either by the most positive subarray or by the most negative one, so run both Kadanes and take max(maxSum, -minSum).",
        "The empty subarray being allowed is what lets both running values clamp at 0 - it is the reason this code is shorter than the circular-subarray version, which had to reject the empty case explicitly. Always check which convention the problem uses; it changes the initialisation.",
        "An equivalent solution runs over prefix sums and returns max(prefix) - min(prefix), including the empty prefix 0. Both views are worth having: the prefix-sum framing is often easier to extend when extra constraints appear on the subarray's length.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Best Time to Buy and Sell Stock",
      difficulty: "Easy",
      variation: "Kadane on the difference array",
      link: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
      question: [
        "You are given an array prices where prices[i] is the price of a stock on day i. You want to maximise profit by choosing a single day to buy and a different, later day to sell. Return the maximum profit, or 0 if no profit is possible.",
        "Example 1:\nInput: prices = [7, 1, 5, 3, 6, 4]\nOutput: 5\nExplanation: Buy on day 1 at 1 and sell on day 4 at 6.",
        "Example 2:\nInput: prices = [7, 6, 4, 3, 1]\nOutput: 0\nExplanation: Prices only fall, so no transaction is made.",
        "Constraints:\n- 1 <= prices.length <= 10^5\n- 0 <= prices[i] <= 10^4",
      ],
      code: `int maxProfit(vector<int>& prices) {
    int cur = 0, best = 0;
    for (size_t i = 1; i < prices.size(); i++) {
        int diff = prices[i] - prices[i - 1];
        cur = max(0, cur + diff);      // Kadane over daily changes, empty allowed
        best = max(best, cur);
    }
    return best;
}

// The equivalent, more common phrasing: track the cheapest price seen so far.
int maxProfitMinSoFar(vector<int>& prices) {
    int minPrice = INT_MAX, best = 0;
    for (int p : prices) {
        minPrice = min(minPrice, p);
        best = max(best, p - minPrice);
    }
    return best;
}`,
      explanation: [
        "Profit from buying at i and selling at j > i is prices[j] - prices[i], which telescopes into the sum of the daily changes over (i, j]. So maximum profit is the maximum subarray sum of the difference array - Kadane, exactly.",
        "The clamp at 0 encodes 'no transaction is allowed', which matches the problem's requirement to return 0 rather than a loss.",
        "The min-so-far version is the same computation reorganised, and is usually the one to write in an interview since it needs no telescoping argument. Knowing they are the same is what lets you attack the harder variants - at most two transactions, at most k, with a fee - as state-machine DPs rather than as unrelated tricks.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Maximum Sum Rectangle in a 2D Matrix",
      difficulty: "Hard",
      variation: "Kadane inside a loop over row pairs",
      link: "https://www.geeksforgeeks.org/problems/maximum-sum-rectangle2948/1",
      question: [
        "Given a 2D matrix of integers (which may contain negative numbers), find the submatrix with the largest sum and return that sum.",
        "Example 1:\nInput: matrix = [[1, 2, -1, -4, -20], [-8, -3, 4, 2, 1], [3, 8, 10, 1, 3], [-4, -1, 1, 7, -6]]\nOutput: 29\nExplanation: The rectangle spanning rows 1-3 and columns 1-3 sums to 29.",
        "Example 2:\nInput: matrix = [[-1, -2], [-3, -4]]\nOutput: -1",
        "Constraints:\n- 1 <= R, C <= 100\n- -1000 <= matrix[i][j] <= 1000",
      ],
      code: `long long maxSumRectangle(vector<vector<int>>& mat) {
    int R = mat.size(), C = mat[0].size();
    long long best = LLONG_MIN;
    for (int top = 0; top < R; top++) {
        vector<long long> col(C, 0);              // column sums for rows top..bottom
        for (int bottom = top; bottom < R; bottom++) {
            for (int c = 0; c < C; c++) col[c] += mat[bottom][c];

            long long cur = col[0], localBest = col[0];   // Kadane on the collapsed row
            for (int c = 1; c < C; c++) {
                cur = max(col[c], cur + col[c]);
                localBest = max(localBest, cur);
            }
            best = max(best, localBest);
        }
    }
    return best;
}`,
      explanation: [
        "Fix the top and bottom rows of the rectangle. Everything between them collapses into a single array of column sums, and the best rectangle with those two rows is the best subarray of that array - which is Kadane. Iterating over all O(R^2) row pairs covers every rectangle.",
        "The inner column-sum array is built incrementally: extending the bottom row by one adds that row's values in O(C), instead of recomputing the whole band. Without this the algorithm becomes O(R^2 * C^2).",
        "This 'reduce one dimension by brute force, solve the other with a linear algorithm' pattern shows up again and again in 2D problems - maximum rectangle of ones, count submatrices with a target sum, largest square. The 1D subroutine changes; the outer loop over row pairs does not.",
        "Because negatives are allowed, both the Kadane inside and the global best must start from actual values, not 0.",
        "Time: O(R^2 * C). Space: O(C).",
      ],
    },
    {
      name: "Maximum Subarray Sum After One Deletion",
      difficulty: "Medium",
      variation: "Kadane with an extra 'used my deletion' state",
      link: "https://leetcode.com/problems/maximum-subarray-sum-with-one-deletion/",
      question: [
        "Given an array of integers arr, return the maximum sum for a non-empty subarray (contiguous elements) with at most one element deletion. In other words, you want to choose a subarray and optionally delete one element from it so that the remaining sum is maximum, and the remaining part must be non-empty.",
        "Example 1:\nInput: arr = [1, -2, 0, 3]\nOutput: 4\nExplanation: Take [1, -2, 0, 3] and delete -2.",
        "Example 2:\nInput: arr = [1, -2, -2, 3]\nOutput: 3\nExplanation: Deleting one element cannot beat simply taking [3].",
        "Example 3:\nInput: arr = [-1, -1, -1, -1]\nOutput: -1\nExplanation: One element must remain.",
        "Constraints:\n- 1 <= arr.length <= 10^5\n- -10^4 <= arr[i] <= 10^4",
      ],
      code: `int maximumSum(vector<int>& arr) {
    const long long NEG = LLONG_MIN / 4;
    long long noDel = arr[0];      // best subarray ending here, nothing deleted
    long long oneDel = NEG;        // best subarray ending here, one element deleted
    long long best = arr[0];

    for (size_t i = 1; i < arr.size(); i++) {
        long long x = arr[i];
        oneDel = max(oneDel + x, noDel);   // extend the deleted case, or delete x itself
        noDel = max(x, noDel + x);
        best = max({ best, noDel, oneDel });
    }
    return (int)best;
}`,
      explanation: [
        "'At most one deletion' is a budget, and a budget belongs in the state. Two running values suffice: the best subarray ending at i with the deletion still unused, and with it already spent.",
        "The deleted case has two ways to arrive. Either the deletion happened earlier and this element is appended (oneDel + x), or the deletion is x itself, in which case the sum is whatever the undeleted subarray ending at i-1 was (noDel). That second branch is the one people miss.",
        "Update order matters: oneDel must read the *previous* noDel, so it is computed first. Swapping the two lines would allow deleting an element and then re-including it.",
        "oneDel starts at a large negative sentinel because at index 0 there is no non-empty remainder after deleting the only element - the state is genuinely unreachable, not merely bad.",
        "The all-negative case comes out right because best is seeded with arr[0] and the non-empty requirement is enforced by never letting noDel be empty.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "K-Concatenation Maximum Sum",
      difficulty: "Medium",
      variation: "Kadane over a repeated array, in closed form",
      link: "https://leetcode.com/problems/k-concatenation-maximum-sum/",
      question: [
        "Given an integer array arr and an integer k, modify the array by repeating it k times - for example [1, 2] with k = 3 becomes [1, 2, 1, 2, 1, 2]. Return the maximum subarray sum in the modified array, modulo 10^9 + 7. Note that the subarray may be empty, in which case its sum is 0.",
        "Example 1:\nInput: arr = [1, 2], k = 3\nOutput: 9",
        "Example 2:\nInput: arr = [1, -2, 1], k = 5\nOutput: 2",
        "Example 3:\nInput: arr = [-1, -2], k = 7\nOutput: 0\nExplanation: The empty subarray wins.",
        "Constraints:\n- 1 <= arr.length <= 10^5\n- 1 <= k <= 10^5\n- -10^4 <= arr[i] <= 10^4",
      ],
      code: `int kConcatenationMaxSum(vector<int>& arr, int k) {
    const long long MOD = 1e9 + 7;
    long long total = 0, cur = 0, best = 0;      // best: empty subarray allowed
    for (int x : arr) {
        total += x;
        cur = max(0LL, cur + x);
        best = max(best, cur);
    }

    long long pre = 0, run = 0;                  // best prefix sum
    for (int x : arr) { run += x; pre = max(pre, run); }
    long long suf = 0;
    run = 0;
    for (int i = (int)arr.size() - 1; i >= 0; i--) { run += arr[i]; suf = max(suf, run); }

    long long ans = best;
    if (k > 1) ans = max(ans, suf + pre + max(0LL, total) * (k - 2));
    return (int)(ans % MOD);
}`,
      explanation: [
        "Building the concatenation and running Kadane would be O(n*k) - up to 10^10 elements. Instead classify the answer by how many copies it touches.",
        "It touches one copy: plain Kadane on arr. It touches two or more: it must be a suffix of some copy, then some number of whole copies, then a prefix of a later copy. The whole copies in the middle are each worth total, so include them only when total > 0, and there are at most k-2 of them.",
        "That gives the single formula suf + pre + max(0, total) * (k - 2), guarded by k > 1. Comparing it against the one-copy answer covers every case, including all-negative input, where every candidate is 0 and the empty subarray wins.",
        "Take the modulus only at the very end. Reducing intermediate values would break the max comparisons - a wrapped value can look smaller than a genuinely smaller one, which is a classic wrong answer on this problem.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Longest Turbulent Subarray",
      difficulty: "Medium",
      variation: "Kadane's shape applied to a length, with two alternating states",
      link: "https://leetcode.com/problems/longest-turbulent-subarray/",
      question: [
        "A subarray is turbulent if the comparison sign flips between each adjacent pair of elements - that is, it alternates strictly increasing and strictly decreasing. Given an integer array arr, return the length of the maximum-size turbulent subarray.",
        "Example 1:\nInput: arr = [9, 4, 2, 10, 7, 8, 8, 1, 9]\nOutput: 5\nExplanation: arr[1..5] = [4, 2, 10, 7, 8] alternates down, up, down, up.",
        "Example 2:\nInput: arr = [4, 8, 12, 16]\nOutput: 2",
        "Example 3:\nInput: arr = [100]\nOutput: 1",
        "Constraints:\n- 1 <= arr.length <= 4 * 10^4\n- 0 <= arr[i] <= 10^9",
      ],
      code: `int maxTurbulenceSize(vector<int>& arr) {
    int n = arr.size();
    int up = 1, down = 1, ans = 1;   // longest turbulent run ending here, last step up / down
    for (int i = 1; i < n; i++) {
        if (arr[i] > arr[i - 1]) {
            up = down + 1;           // an up-step can only follow a down-step
            down = 1;
        } else if (arr[i] < arr[i - 1]) {
            down = up + 1;
            up = 1;
        } else {
            up = down = 1;           // equal values break turbulence entirely
        }
        ans = max({ ans, up, down });
    }
    return ans;
}`,
      explanation: [
        "Same skeleton as Kadane - a running value that extends or resets, with a global maximum - but the tracked quantity is a length and the state carries which direction the last step went, because that is what determines whether the next step may extend the run.",
        "up is the longest turbulent subarray ending at i whose final comparison was an increase, and it can only be built from a run ending in a decrease, hence up = down + 1. The mirror holds for down.",
        "The resets are the part to get right. After an up-step, a run ending in an up-step is impossible to extend, so down resets to 1 - a length-1 subarray is trivially turbulent. Equal adjacent values kill both.",
        "The generalisable idea: when 'can I extend?' depends on a property of the last step, put that property in the state and keep one running value per case. This is the same move as the buy/sell/cooldown state machine, applied to lengths.",
        "Time: O(n). Space: O(1).",
      ],
    },
  ],
};
