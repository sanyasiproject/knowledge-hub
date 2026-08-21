import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Running Sum of 1d Array",
      difficulty: "Easy",
      variation: "Build a prefix sum",
      link: "https://leetcode.com/problems/running-sum-of-1d-array/",
      question: [
        "Given an array nums, return the running sum of nums, where runningSum[i] = sum(nums[0] ... nums[i]).",
        "Example 1:\nInput: nums = [1,2,3,4]\nOutput: [1,3,6,10]\nExplanation: Running sum is [1, 1+2, 1+2+3, 1+2+3+4].",
        "Constraints:\n- 1 <= nums.length <= 1000\n- -10^6 <= nums[i] <= 10^6",
      ],
      code: `class Solution {
public:
    vector<int> runningSum(vector<int>& nums) {
        vector<int> res(nums.size());
        int run = 0;
        for (size_t i = 0; i < nums.size(); i++) {
            run += nums[i];
            res[i] = run;
        }
        return res;
    }
};`,
      explanation: [
        "This is the prefix-sum construction itself: each output element is the previous running total plus the current value.",
        "Every other problem in this topic builds on this single pass, so internalize the invariant: after step i, run holds the sum of the first i+1 elements.",
        "Time: O(n). Space: O(n) for the output.",
      ],
    },
    {
      name: "Range Sum Query - Immutable",
      difficulty: "Easy",
      variation: "1D prefix sum",
      link: "https://leetcode.com/problems/range-sum-query-immutable/",
      question: [
        "Given an integer array nums, handle multiple queries sumRange(left, right) returning the sum of nums between indices left and right inclusive.",
        "Example 1:\nInput: nums = [-2,0,3,-5,2,-1]; sumRange(0,2); sumRange(2,5); sumRange(0,5)\nOutput: 1, -1, -3",
        "Constraints:\n- 1 <= nums.length <= 10^4\n- -10^5 <= nums[i] <= 10^5\n- Up to 10^4 sumRange calls",
      ],
      code: `class NumArray {
    vector<long long> pre;
public:
    NumArray(vector<int>& nums) : pre(nums.size() + 1, 0) {
        for (size_t i = 0; i < nums.size(); i++) pre[i + 1] = pre[i] + nums[i];
    }
    int sumRange(int left, int right) {
        return (int)(pre[right + 1] - pre[left]);
    }
};`,
      explanation: [
        "pre[i] stores the sum of the first i elements, so any range sum is one subtraction of two precomputed values: sum(left..right) = pre[right+1] - pre[left].",
        "The extra leading zero in pre removes all edge cases at left = 0.",
        "Time: O(n) build, O(1) per query. Space: O(n).",
      ],
    },
    {
      name: "Find Pivot Index",
      difficulty: "Easy",
      variation: "Left sum vs right sum",
      link: "https://leetcode.com/problems/find-pivot-index/",
      question: [
        "Given an array of integers nums, return the leftmost pivot index: the index where the sum of all numbers strictly to its left equals the sum of all numbers strictly to its right. Return -1 if no such index exists.",
        "Example 1:\nInput: nums = [1,7,3,6,5,6]\nOutput: 3\nExplanation: Left sum = 1+7+3 = 11, right sum = 5+6 = 11.",
        "Constraints:\n- 1 <= nums.length <= 10^4\n- -1000 <= nums[i] <= 1000",
      ],
      code: `class Solution {
public:
    int pivotIndex(vector<int>& nums) {
        long long total = 0;
        for (int x : nums) total += x;
        long long left = 0;
        for (int i = 0; i < (int)nums.size(); i++) {
            if (left == total - left - nums[i]) return i;
            left += nums[i];
        }
        return -1;
    }
};`,
      explanation: [
        "Instead of storing a full prefix array, keep a running left sum; the right sum is derived as total - left - nums[i], so one pass after computing the total suffices.",
        "This is the space-optimized form of a prefix sum: when queries arrive in index order, the prefix can be a single scalar.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Maximum Population Year",
      difficulty: "Easy",
      variation: "Difference array over a small domain",
      link: "https://leetcode.com/problems/maximum-population-year/",
      question: [
        "You are given a 2D array logs where logs[i] = [birth_i, death_i] indicates the birth and death years of the i-th person. A person is counted in year x if birth <= x < death. Return the earliest year with the maximum population.",
        "Example 1:\nInput: logs = [[1993,1999],[2000,2010]]\nOutput: 1993\nExplanation: The maximum population is 1, first reached in 1993.",
        "Constraints:\n- 1 <= logs.length <= 100\n- 1950 <= birth_i < death_i <= 2050",
      ],
      code: `class Solution {
public:
    int maximumPopulation(vector<vector<int>>& logs) {
        int diff[102] = {0};
        for (auto& log : logs) {
            diff[log[0] - 1950]++;
            diff[log[1] - 1950]--;
        }
        int best = 0, bestYear = 1950, run = 0;
        for (int y = 0; y <= 100; y++) {
            run += diff[y];
            if (run > best) {
                best = run;
                bestYear = 1950 + y;
            }
        }
        return bestYear;
    }
};`,
      explanation: [
        "Each life span is a range update: +1 at the birth year, -1 at the death year (deaths are exclusive). A prefix sum over the difference array recovers the population per year.",
        "Because the year domain is tiny (1950..2050), the difference array is a fixed-size buffer and the sweep is trivial.",
        "Time: O(n + Y) where Y = 101 years. Space: O(Y).",
      ],
    },
    {
      name: "Interval Point Coverage Drill",
      difficulty: "Easy",
      variation: "Difference array + point queries",
      question: [
        "You are given n intervals [l, r] with 1 <= l <= r <= 100000, and q query points. For each query point p, report how many intervals cover p (l <= p <= r).",
        "Example 1:\nInput: intervals = [[1,4],[3,7],[5,5]], queries = [3,5,8]\nOutput: [2,2,0]\nExplanation: Point 3 is covered by [1,4] and [3,7]; point 5 by [3,7] and [5,5]; point 8 by none.",
        "Constraints:\n- 1 <= n, q <= 10^5\n- 1 <= l <= r <= 10^5\n- 1 <= p <= 10^5",
      ],
      code: `#include <bits/stdc++.h>
using namespace std;

vector<int> countCoverage(vector<pair<int, int>>& intervals, vector<int>& queries) {
    const int MAXC = 100001;
    vector<int> diff(MAXC + 2, 0);
    for (auto& iv : intervals) {
        diff[iv.first]++;
        diff[iv.second + 1]--;
    }
    vector<int> cover(MAXC + 1, 0);
    int run = 0;
    for (int p = 1; p <= MAXC; p++) {
        run += diff[p];
        cover[p] = run;
    }
    vector<int> ans;
    ans.reserve(queries.size());
    for (int p : queries) ans.push_back(cover[p]);
    return ans;
}`,
      explanation: [
        "Every interval becomes two point events on a difference array: +1 at l and -1 at r+1. A single prefix sweep converts the events into exact coverage counts for every coordinate.",
        "This is the canonical offline pattern: pay O(1) per interval, then answer any number of point queries in O(1) each.",
        "Time: O(n + q + C) where C is the coordinate range. Space: O(C).",
      ],
    },
    {
      name: "Range Sum Query 2D - Immutable",
      difficulty: "Medium",
      variation: "2D prefix sum",
      link: "https://leetcode.com/problems/range-sum-query-2d-immutable/",
      question: [
        "Given a 2D matrix, handle multiple queries sumRegion(row1, col1, row2, col2) returning the sum of the elements inside the rectangle with upper-left corner (row1, col1) and lower-right corner (row2, col2).",
        "Example 1:\nInput: matrix = [[3,0,1,4,2],[5,6,3,2,1],[1,2,0,1,5],[4,1,0,1,7],[1,0,3,0,5]]; sumRegion(2,1,4,3)\nOutput: 8",
        "Constraints:\n- 1 <= m, n <= 200\n- -10^4 <= matrix[i][j] <= 10^4\n- Up to 10^4 sumRegion calls",
      ],
      code: `class NumMatrix {
    vector<vector<int>> pre;
public:
    NumMatrix(vector<vector<int>>& matrix) {
        int m = matrix.size(), n = matrix[0].size();
        pre.assign(m + 1, vector<int>(n + 1, 0));
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++)
                pre[i + 1][j + 1] = matrix[i][j] + pre[i][j + 1] + pre[i + 1][j] - pre[i][j];
    }
    int sumRegion(int row1, int col1, int row2, int col2) {
        return pre[row2 + 1][col2 + 1] - pre[row1][col2 + 1] - pre[row2 + 1][col1] + pre[row1][col1];
    }
};`,
      explanation: [
        "pre[i][j] holds the sum of the i-by-j top-left submatrix. It is built with inclusion-exclusion: add the two adjacent prefixes and subtract their overlap.",
        "A query is the same inclusion-exclusion in reverse: whole rectangle minus the strip above, minus the strip to the left, plus the doubly-subtracted corner.",
        "Time: O(mn) build, O(1) per query. Space: O(mn).",
      ],
    },
    {
      name: "Product of Array Except Self",
      difficulty: "Medium",
      variation: "Prefix and suffix products",
      link: "https://leetcode.com/problems/product-of-array-except-self/",
      question: [
        "Given an integer array nums, return an array answer such that answer[i] is the product of all elements of nums except nums[i]. You must not use division and must run in O(n) time.",
        "Example 1:\nInput: nums = [1,2,3,4]\nOutput: [24,12,8,6]",
        "Constraints:\n- 2 <= nums.length <= 10^5\n- -30 <= nums[i] <= 30\n- The product of any prefix or suffix fits in a 32-bit integer",
      ],
      code: `class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        int n = nums.size();
        vector<int> res(n, 1);
        int prefix = 1;
        for (int i = 0; i < n; i++) {
            res[i] = prefix;
            prefix *= nums[i];
        }
        int suffix = 1;
        for (int i = n - 1; i >= 0; i--) {
            res[i] *= suffix;
            suffix *= nums[i];
        }
        return res;
    }
};`,
      explanation: [
        "The answer at i is (product of everything before i) times (product of everything after i) — the multiplicative analogue of prefix sums.",
        "Two sweeps do it in place: the forward pass writes prefix products into the result, the backward pass multiplies in suffix products with a single scalar accumulator.",
        "Time: O(n). Space: O(1) beyond the output.",
      ],
    },
    {
      name: "Subarray Sum Equals K",
      difficulty: "Medium",
      variation: "Prefix sum + hashmap",
      link: "https://leetcode.com/problems/subarray-sum-equals-k/",
      question: [
        "Given an array of integers nums and an integer k, return the total number of contiguous subarrays whose sum equals k.",
        "Example 1:\nInput: nums = [1,1,1], k = 2\nOutput: 2\nExample 2:\nInput: nums = [1,2,3], k = 3\nOutput: 2",
        "Constraints:\n- 1 <= nums.length <= 2 * 10^4\n- -1000 <= nums[i] <= 1000\n- -10^7 <= k <= 10^7",
      ],
      code: `class Solution {
public:
    int subarraySum(vector<int>& nums, int k) {
        unordered_map<long long, int> seen;
        seen[0] = 1;
        long long sum = 0;
        int count = 0;
        for (int x : nums) {
            sum += x;
            auto it = seen.find(sum - k);
            if (it != seen.end()) count += it->second;
            seen[sum]++;
        }
        return count;
    }
};`,
      explanation: [
        "A subarray (i, j] sums to k exactly when pre[j] - pre[i] = k, i.e. some earlier prefix equals pre[j] - k. A hashmap counts how many times each prefix value has occurred.",
        "Seeding the map with {0: 1} counts subarrays that start at index 0. Negative numbers are fine, which is why sliding window cannot replace this technique here.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Subarray Sums Divisible by K",
      difficulty: "Medium",
      variation: "Prefix sum modulo classes",
      link: "https://leetcode.com/problems/subarray-sums-divisible-by-k/",
      question: [
        "Given an integer array nums and an integer k, return the number of non-empty subarrays that have a sum divisible by k.",
        "Example 1:\nInput: nums = [4,5,0,-2,-3,1], k = 5\nOutput: 7",
        "Constraints:\n- 1 <= nums.length <= 3 * 10^4\n- -10^4 <= nums[i] <= 10^4\n- 2 <= k <= 10^4",
      ],
      code: `class Solution {
public:
    int subarraysDivByK(vector<int>& nums, int k) {
        vector<int> count(k, 0);
        count[0] = 1;
        int mod = 0, ans = 0;
        for (int x : nums) {
            mod = ((mod + x) % k + k) % k;
            ans += count[mod];
            count[mod]++;
        }
        return ans;
    }
};`,
      explanation: [
        "A subarray sum is divisible by k exactly when its two bounding prefix sums are congruent mod k. So group prefixes by remainder and, for each new prefix, add how many earlier prefixes share its remainder.",
        "The double-mod ((x % k) + k) % k normalizes negative remainders in C++, which would otherwise break the bucketing.",
        "Time: O(n + k). Space: O(k).",
      ],
    },
    {
      name: "Continuous Subarray Sum",
      difficulty: "Medium",
      variation: "Earliest remainder index",
      link: "https://leetcode.com/problems/continuous-subarray-sum/",
      question: [
        "Given an integer array nums and an integer k, return true if nums has a good subarray: a contiguous subarray of length at least two whose sum is a multiple of k.",
        "Example 1:\nInput: nums = [23,2,4,6,7], k = 6\nOutput: true\nExplanation: [2,4] sums to 6.\nExample 2:\nInput: nums = [23,2,6,4,7], k = 13\nOutput: false",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- 0 <= nums[i] <= 10^9\n- 1 <= k <= 2^31 - 1",
      ],
      code: `class Solution {
public:
    bool checkSubarraySum(vector<int>& nums, int k) {
        unordered_map<int, int> firstIndex;
        firstIndex[0] = -1;
        long long sum = 0;
        for (int i = 0; i < (int)nums.size(); i++) {
            sum += nums[i];
            int mod = (int)(sum % k);
            auto it = firstIndex.find(mod);
            if (it != firstIndex.end()) {
                if (i - it->second >= 2) return true;
            } else {
                firstIndex[mod] = i;
            }
        }
        return false;
    }
};`,
      explanation: [
        "Same congruence idea as counting divisible subarrays, but here we only need existence with length >= 2, so we store the earliest index of each remainder and check the gap.",
        "Storing only the first occurrence maximizes the subarray length for each remainder, so if any valid subarray exists the check i - first >= 2 will catch it.",
        "Time: O(n). Space: O(min(n, k)).",
      ],
    },
    {
      name: "Contiguous Array",
      difficulty: "Medium",
      variation: "0/1 balance as prefix sum",
      link: "https://leetcode.com/problems/contiguous-array/",
      question: [
        "Given a binary array nums, return the maximum length of a contiguous subarray with an equal number of 0 and 1.",
        "Example 1:\nInput: nums = [0,1]\nOutput: 2\nExample 2:\nInput: nums = [0,1,0]\nOutput: 2",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- nums[i] is 0 or 1",
      ],
      code: `class Solution {
public:
    int findMaxLength(vector<int>& nums) {
        unordered_map<int, int> firstIndex;
        firstIndex[0] = -1;
        int balance = 0, best = 0;
        for (int i = 0; i < (int)nums.size(); i++) {
            balance += nums[i] == 1 ? 1 : -1;
            auto it = firstIndex.find(balance);
            if (it != firstIndex.end()) best = max(best, i - it->second);
            else firstIndex[balance] = i;
        }
        return best;
    }
};`,
      explanation: [
        "Map 0 to -1 so the problem becomes: find the longest subarray with sum zero. Two equal prefix balances bracket a zero-sum subarray.",
        "Keeping only the first index where each balance appears makes every later match as long as possible.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Range Addition",
      difficulty: "Medium",
      variation: "Difference array, batch range updates",
      link: "https://leetcode.com/problems/range-addition/",
      question: [
        "You are given an integer length and an array updates where updates[i] = [startIdx, endIdx, inc]. Starting from an array of zeros of the given length, apply every update by adding inc to each element in [startIdx, endIdx], then return the final array.",
        "Example 1:\nInput: length = 5, updates = [[1,3,2],[2,4,3],[0,2,-2]]\nOutput: [-2,0,3,5,3]",
        "Constraints:\n- 1 <= length <= 10^5\n- 0 <= updates.length <= 10^4\n- 0 <= startIdx <= endIdx < length\n- -1000 <= inc <= 1000",
      ],
      code: `class Solution {
public:
    vector<int> getModifiedArray(int length, vector<vector<int>>& updates) {
        vector<int> diff(length + 1, 0);
        for (auto& u : updates) {
            diff[u[0]] += u[2];
            diff[u[1] + 1] -= u[2];
        }
        vector<int> res(length);
        int run = 0;
        for (int i = 0; i < length; i++) {
            run += diff[i];
            res[i] = run;
        }
        return res;
    }
};`,
      explanation: [
        "This is the difference array in its purest form: a range update becomes two point writes (+inc at start, -inc after end), and one final prefix sweep materializes all updates at once.",
        "The order of updates never matters because addition commutes — every update is O(1) regardless of range width.",
        "Time: O(n + u). Space: O(n).",
      ],
    },
    {
      name: "Corporate Flight Bookings",
      difficulty: "Medium",
      variation: "Difference array, 1-indexed ranges",
      link: "https://leetcode.com/problems/corporate-flight-bookings/",
      question: [
        "There are n flights labeled 1 to n. You are given bookings where bookings[i] = [first, last, seats] reserves seats on every flight from first to last inclusive. Return an array answer where answer[i] is the total seats reserved for flight i+1.",
        "Example 1:\nInput: bookings = [[1,2,10],[2,3,20],[2,5,25]], n = 5\nOutput: [10,55,45,25,25]",
        "Constraints:\n- 1 <= n <= 2 * 10^4\n- 1 <= bookings.length <= 2 * 10^4\n- 1 <= first <= last <= n\n- 1 <= seats <= 10^4",
      ],
      code: `class Solution {
public:
    vector<int> corpFlightBookings(vector<vector<int>>& bookings, int n) {
        vector<int> diff(n + 2, 0);
        for (auto& b : bookings) {
            diff[b[0]] += b[2];
            diff[b[1] + 1] -= b[2];
        }
        vector<int> res(n);
        int run = 0;
        for (int i = 1; i <= n; i++) {
            run += diff[i];
            res[i - 1] = run;
        }
        return res;
    }
};`,
      explanation: [
        "Identical to Range Addition but with 1-indexed flights: each booking contributes +seats at first and -seats at last+1, then a prefix sweep yields per-flight totals.",
        "Sizing the difference array n+2 lets last+1 land safely without a bounds check.",
        "Time: O(n + b). Space: O(n).",
      ],
    },
    {
      name: "Car Pooling",
      difficulty: "Medium",
      variation: "Difference array + feasibility check",
      link: "https://leetcode.com/problems/car-pooling/",
      question: [
        "You drive east only. Given trips where trips[i] = [numPassengers, from, to] and a capacity, return true if you can pick up and drop off all passengers without ever exceeding capacity.",
        "Example 1:\nInput: trips = [[2,1,5],[3,3,7]], capacity = 4\nOutput: false\nExample 2:\nInput: trips = [[2,1,5],[3,3,7]], capacity = 5\nOutput: true",
        "Constraints:\n- 1 <= trips.length <= 1000\n- 1 <= numPassengers <= 100\n- 0 <= from < to <= 1000\n- 1 <= capacity <= 10^5",
      ],
      code: `class Solution {
public:
    bool carPooling(vector<vector<int>>& trips, int capacity) {
        int diff[1002] = {0};
        for (auto& t : trips) {
            diff[t[1]] += t[0];
            diff[t[2]] -= t[0];
        }
        int load = 0;
        for (int mile = 0; mile <= 1001; mile++) {
            load += diff[mile];
            if (load > capacity) return false;
        }
        return true;
    }
};`,
      explanation: [
        "Each trip adds passengers over the half-open range [from, to): +p at pickup, -p at drop-off. Sweeping the difference array simulates the drive and tracks the live load.",
        "Drop-off is exclusive because passengers leaving at mile x free seats for passengers boarding at mile x — hence -p at to rather than to+1.",
        "Time: O(t + M) with M = 1001 miles. Space: O(M).",
      ],
    },
    {
      name: "XOR Queries of a Subarray",
      difficulty: "Medium",
      variation: "Prefix XOR",
      link: "https://leetcode.com/problems/xor-queries-of-a-subarray/",
      question: [
        "Given an array arr of positive integers and queries where queries[i] = [left, right], return an array where each answer is the XOR of arr[left] through arr[right].",
        "Example 1:\nInput: arr = [1,3,4,8], queries = [[0,1],[1,2],[0,3],[3,3]]\nOutput: [2,7,14,8]",
        "Constraints:\n- 1 <= arr.length, queries.length <= 3 * 10^4\n- 1 <= arr[i] <= 10^9\n- 0 <= left <= right < arr.length",
      ],
      code: `class Solution {
public:
    vector<int> xorQueries(vector<int>& arr, vector<vector<int>>& queries) {
        int n = arr.size();
        vector<int> pre(n + 1, 0);
        for (int i = 0; i < n; i++) pre[i + 1] = pre[i] ^ arr[i];
        vector<int> res;
        res.reserve(queries.size());
        for (auto& q : queries) res.push_back(pre[q[1] + 1] ^ pre[q[0]]);
        return res;
    }
};`,
      explanation: [
        "XOR is its own inverse, so the prefix trick transfers directly: pre[r+1] XOR pre[l] cancels every element before l, leaving exactly the XOR of arr[l..r].",
        "Any associative operation with an inverse (sum, XOR, modular product with coprime values) admits the same prefix-and-cancel structure.",
        "Time: O(n + q). Space: O(n).",
      ],
    },
    {
      name: "Vowel Count Queries Drill",
      difficulty: "Medium",
      variation: "Prefix counts over characters",
      question: [
        "Given a lowercase string s and q queries [l, r], return for each query the number of vowels (a, e, i, o, u) in the substring s[l..r] inclusive (0-indexed).",
        "Example 1:\nInput: s = \"prefixsums\", queries = [[0,3],[2,9],[5,5]]\nOutput: [1,3,0]\nExplanation: \"pref\" has 1 vowel; \"efixsums\" has 3; \"x\" has 0.",
        "Constraints:\n- 1 <= s.length <= 10^5\n- 1 <= q <= 10^5\n- 0 <= l <= r < s.length",
      ],
      code: `#include <bits/stdc++.h>
using namespace std;

vector<int> vowelCounts(const string& s, vector<pair<int, int>>& queries) {
    int n = s.size();
    vector<int> pre(n + 1, 0);
    auto isVowel = [](char c) {
        return c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u';
    };
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + (isVowel(s[i]) ? 1 : 0);
    vector<int> res;
    res.reserve(queries.size());
    for (auto& q : queries) res.push_back(pre[q.second + 1] - pre[q.first]);
    return res;
}`,
      explanation: [
        "Turn the string into a 0/1 indicator array (1 where the character is a vowel) and build a prefix sum over it; each range query is then one subtraction.",
        "The same indicator-prefix trick answers any counting query over ranges: uppercase letters, digits, matches of a fixed character, and so on.",
        "Time: O(n + q). Space: O(n).",
      ],
    },
    {
      name: "Matrix Block Sum",
      difficulty: "Medium",
      variation: "2D prefix sum with clamped windows",
      link: "https://leetcode.com/problems/matrix-block-sum/",
      question: [
        "Given an m x n matrix mat and an integer k, return a matrix answer where answer[i][j] is the sum of all elements mat[r][c] with i-k <= r <= i+k and j-k <= c <= j+k, clamped to valid positions.",
        "Example 1:\nInput: mat = [[1,2,3],[4,5,6],[7,8,9]], k = 1\nOutput: [[12,21,16],[27,45,33],[24,39,28]]",
        "Constraints:\n- 1 <= m, n, k <= 100\n- 1 <= mat[i][j] <= 100",
      ],
      code: `class Solution {
public:
    vector<vector<int>> matrixBlockSum(vector<vector<int>>& mat, int k) {
        int m = mat.size(), n = mat[0].size();
        vector<vector<int>> pre(m + 1, vector<int>(n + 1, 0));
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++)
                pre[i + 1][j + 1] = mat[i][j] + pre[i][j + 1] + pre[i + 1][j] - pre[i][j];
        vector<vector<int>> ans(m, vector<int>(n));
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++) {
                int r1 = max(0, i - k), c1 = max(0, j - k);
                int r2 = min(m - 1, i + k), c2 = min(n - 1, j + k);
                ans[i][j] = pre[r2 + 1][c2 + 1] - pre[r1][c2 + 1] - pre[r2 + 1][c1] + pre[r1][c1];
            }
        return ans;
    }
};`,
      explanation: [
        "Build the standard 2D prefix table once, then each answer cell is one O(1) inclusion-exclusion query over its (2k+1)-square window, clamped to the matrix borders.",
        "Without the prefix table, each cell would rescan up to (2k+1)^2 entries — the prefix turns an O(mn k^2) brute force into O(mn).",
        "Time: O(mn). Space: O(mn).",
      ],
    },
    {
      name: "Number of Submatrices That Sum to Target",
      difficulty: "Hard",
      variation: "2D reduction to prefix + hashmap",
      link: "https://leetcode.com/problems/number-of-submatrices-that-sum-to-target/",
      question: [
        "Given a matrix and an integer target, return the number of non-empty submatrices whose elements sum to target.",
        "Example 1:\nInput: matrix = [[0,1,0],[1,1,1],[0,1,0]], target = 0\nOutput: 4\nExample 2:\nInput: matrix = [[1,-1],[-1,1]], target = 0\nOutput: 5",
        "Constraints:\n- 1 <= matrix.length, matrix[0].length <= 100\n- -1000 <= matrix[i][j] <= 1000\n- -10^8 <= target <= 10^8",
      ],
      code: `class Solution {
public:
    int numSubmatrixSumTarget(vector<vector<int>>& matrix, int target) {
        int m = matrix.size(), n = matrix[0].size();
        for (auto& row : matrix)
            for (int j = 1; j < n; j++) row[j] += row[j - 1];
        int count = 0;
        for (int c1 = 0; c1 < n; c1++) {
            for (int c2 = c1; c2 < n; c2++) {
                unordered_map<int, int> seen;
                seen[0] = 1;
                int sum = 0;
                for (int r = 0; r < m; r++) {
                    sum += matrix[r][c2] - (c1 > 0 ? matrix[r][c1 - 1] : 0);
                    auto it = seen.find(sum - target);
                    if (it != seen.end()) count += it->second;
                    seen[sum]++;
                }
            }
        }
        return count;
    }
};`,
      explanation: [
        "Precompute row-wise prefix sums so the strip between columns c1..c2 collapses each row to a single number. Every column pair then reduces the 2D problem to Subarray Sum Equals K on that 1D strip.",
        "For each column pair, a hashmap of vertical prefix sums counts submatrices ending at each row in O(1), exactly like the 1D prefix + hashmap pattern.",
        "Time: O(n^2 * m). Space: O(m) per column pair.",
      ],
    },
  ],
};
