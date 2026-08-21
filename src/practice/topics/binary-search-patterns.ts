import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Binary Search",
      difficulty: "Easy",
      variation: "Exact find",
      link: "https://leetcode.com/problems/binary-search/",
      question: [
        "Given a sorted array of distinct integers nums and a target, return the index of target, or -1 if it is not present. You must write an O(log n) algorithm.",
        "Example 1:\nInput: nums = [-1,0,3,5,9,12], target = 9\nOutput: 4",
        "Example 2:\nInput: nums = [-1,0,3,5,9,12], target = 2\nOutput: -1",
        "Constraints:\n- 1 <= nums.length <= 10^4\n- -10^4 < nums[i], target < 10^4\n- nums is sorted in strictly ascending order",
      ],
      code: `int search(vector<int>& nums, int target) {
    int lo = 0, hi = nums.size() - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}`,
      explanation: [
        "Each comparison halves the search interval while maintaining the invariant that target, if present, lies within [lo, hi].",
        "Because the array is sorted, comparing nums[mid] with target tells us which half can be discarded safely.",
        "Time: O(log n). Space: O(1).",
      ],
    },
    {
      name: "Search Insert Position",
      difficulty: "Easy",
      variation: "Lower bound",
      link: "https://leetcode.com/problems/search-insert-position/",
      question: [
        "Given a sorted array of distinct integers and a target value, return the index of the target if found. If not, return the index where it would be inserted to keep the array sorted. You must write an O(log n) algorithm.",
        "Example 1:\nInput: nums = [1,3,5,6], target = 5\nOutput: 2",
        "Example 2:\nInput: nums = [1,3,5,6], target = 2\nOutput: 1",
        "Constraints:\n- 1 <= nums.length <= 10^4\n- -10^4 <= nums[i], target <= 10^4\n- nums contains distinct values sorted in ascending order",
      ],
      code: `int searchInsert(vector<int>& nums, int target) {
    int lo = 0, hi = nums.size();
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] < target) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}`,
      explanation: [
        "This is the classic lower-bound pattern: find the first index whose value is greater than or equal to target.",
        "Invariant: every index before lo holds a value strictly less than target, and every index at or after hi holds a value greater than or equal to target. When lo == hi they meet at the answer.",
        "Time: O(log n). Space: O(1).",
      ],
    },
    {
      name: "First Bad Version",
      difficulty: "Easy",
      variation: "Boundary on monotonic predicate",
      link: "https://leetcode.com/problems/first-bad-version/",
      question: [
        "You have n versions [1, 2, ..., n] and all versions after a bad version are also bad. Given an API bool isBadVersion(version), find the first bad version while minimizing API calls.",
        "Example 1:\nInput: n = 5, bad = 4\nOutput: 4\nExplanation: isBadVersion(3) -> false, isBadVersion(5) -> true, isBadVersion(4) -> true, so 4 is the first bad version.",
        "Constraints:\n- 1 <= bad <= n <= 2^31 - 1",
      ],
      code: `bool isBadVersion(int version);

int firstBadVersion(int n) {
    int lo = 1, hi = n;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (isBadVersion(mid)) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}`,
      explanation: [
        "The predicate isBadVersion is monotonic: false, false, ..., true, true. Binary search finds the false-to-true boundary.",
        "If mid is bad the answer is at mid or before it, so keep mid in range (hi = mid); if mid is good the answer is strictly after mid (lo = mid + 1). Using lo + (hi - lo) / 2 avoids integer overflow.",
        "Time: O(log n). Space: O(1).",
      ],
    },
    {
      name: "Sqrt(x)",
      difficulty: "Easy",
      variation: "Search on answer (integer)",
      link: "https://leetcode.com/problems/sqrtx/",
      question: [
        "Given a non-negative integer x, return the square root of x rounded down to the nearest integer. You must not use any built-in exponent function or operator.",
        "Example 1:\nInput: x = 8\nOutput: 2\nExplanation: The square root of 8 is 2.82842..., and rounding down gives 2.",
        "Constraints:\n- 0 <= x <= 2^31 - 1",
      ],
      code: `int mySqrt(int x) {
    if (x < 2) return x;
    long long lo = 1, hi = x / 2;
    while (lo < hi) {
        long long mid = lo + (hi - lo + 1) / 2;
        if (mid * mid <= (long long)x) lo = mid;
        else hi = mid - 1;
    }
    return (int)lo;
}`,
      explanation: [
        "We binary search the answer space [1, x/2] for the largest value whose square does not exceed x. The predicate mid*mid <= x is monotonic (true then false).",
        "Because we search for the last true, mid is biased upward with (hi - lo + 1) / 2 to guarantee progress. Squaring is done in long long to avoid overflow.",
        "Time: O(log x). Space: O(1).",
      ],
    },
    {
      name: "Guess Number Higher or Lower",
      difficulty: "Easy",
      variation: "Interactive exact find",
      link: "https://leetcode.com/problems/guess-number-higher-or-lower/",
      question: [
        "I picked a number from 1 to n. You call a predefined API int guess(int num) which returns -1 if my number is lower, 1 if it is higher, and 0 if num equals my number. Return the number I picked.",
        "Example 1:\nInput: n = 10, pick = 6\nOutput: 6",
        "Constraints:\n- 1 <= n <= 2^31 - 1\n- 1 <= pick <= n",
      ],
      code: `int guess(int num);

int guessNumber(int n) {
    int lo = 1, hi = n;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        int res = guess(mid);
        if (res == 0) return mid;
        if (res < 0) hi = mid - 1;
        else lo = mid + 1;
    }
    return -1;
}`,
      explanation: [
        "The API acts exactly like a comparison in a sorted array, so a standard exact-find binary search applies.",
        "Each call eliminates half of the remaining candidates while the invariant keeps the pick inside [lo, hi].",
        "Time: O(log n). Space: O(1).",
      ],
    },
    {
      name: "Find First and Last Position of Element in Sorted Array",
      difficulty: "Medium",
      variation: "First/last occurrence",
      link: "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/",
      question: [
        "Given an array of integers nums sorted in non-decreasing order, find the starting and ending position of a given target value. If target is not found, return [-1, -1]. You must write an O(log n) algorithm.",
        "Example 1:\nInput: nums = [5,7,7,8,8,10], target = 8\nOutput: [3,4]",
        "Example 2:\nInput: nums = [5,7,7,8,8,10], target = 6\nOutput: [-1,-1]",
        "Constraints:\n- 0 <= nums.length <= 10^5\n- -10^9 <= nums[i], target <= 10^9\n- nums is sorted in non-decreasing order",
      ],
      code: `vector<int> searchRange(vector<int>& nums, int target) {
    auto lowerBoundOf = [&](int value) {
        int lo = 0, hi = (int)nums.size();
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] < value) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    };
    int first = lowerBoundOf(target);
    if (first == (int)nums.size() || nums[first] != target) return {-1, -1};
    int last = lowerBoundOf(target + 1) - 1;
    return {first, last};
}`,
      explanation: [
        "Two lower-bound searches solve this: the first index of target is lowerBound(target), and the last index is lowerBound(target + 1) - 1.",
        "The lower-bound loop maintains the invariant that all indices before lo are strictly less than the value and all indices at or after hi are greater than or equal, so it always lands on the leftmost boundary.",
        "Time: O(log n). Space: O(1).",
      ],
    },
    {
      name: "Search a 2D Matrix",
      difficulty: "Medium",
      variation: "Flattened index mapping",
      link: "https://leetcode.com/problems/search-a-2d-matrix/",
      question: [
        "You are given an m x n matrix where each row is sorted in non-decreasing order and the first integer of each row is greater than the last integer of the previous row. Given an integer target, return true if target is in the matrix. You must write an O(log(m*n)) algorithm.",
        "Example 1:\nInput: matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3\nOutput: true",
        "Constraints:\n- 1 <= m, n <= 100\n- -10^4 <= matrix[i][j], target <= 10^4",
      ],
      code: `bool searchMatrix(vector<vector<int>>& matrix, int target) {
    int m = matrix.size(), n = matrix[0].size();
    int lo = 0, hi = m * n - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        int value = matrix[mid / n][mid % n];
        if (value == target) return true;
        if (value < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return false;
}`,
      explanation: [
        "Because rows are sorted and each row continues where the previous one ended, reading the matrix row by row gives one fully sorted virtual array of length m*n.",
        "A single binary search runs over virtual indices, converting index k back to cell (k / n, k % n) on each probe.",
        "Time: O(log(m*n)). Space: O(1).",
      ],
    },
    {
      name: "Find Peak Element",
      difficulty: "Medium",
      variation: "Peak / slope descent",
      link: "https://leetcode.com/problems/find-peak-element/",
      question: [
        "A peak element is an element strictly greater than its neighbours. Given an array nums where nums[i] != nums[i+1] for all valid i, return the index of any peak. Imagine nums[-1] and nums[n] are negative infinity. You must write an O(log n) algorithm.",
        "Example 1:\nInput: nums = [1,2,3,1]\nOutput: 2\nExplanation: 3 is a peak element at index 2.",
        "Constraints:\n- 1 <= nums.length <= 1000\n- -2^31 <= nums[i] <= 2^31 - 1\n- nums[i] != nums[i + 1] for all valid i",
      ],
      code: `int findPeakElement(vector<int>& nums) {
    int lo = 0, hi = nums.size() - 1;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] < nums[mid + 1]) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}`,
      explanation: [
        "If nums[mid] < nums[mid + 1] we are on an ascending slope, so a peak must exist to the right (values cannot ascend forever because the boundary is negative infinity). Otherwise a peak exists at mid or to its left.",
        "The invariant is that [lo, hi] always contains at least one peak, and the range shrinks every iteration, so the loop terminates on a peak.",
        "Time: O(log n). Space: O(1).",
      ],
    },
    {
      name: "Search in Rotated Sorted Array",
      difficulty: "Medium",
      variation: "Rotated array, distinct values",
      link: "https://leetcode.com/problems/search-in-rotated-sorted-array/",
      question: [
        "An ascending sorted array of distinct integers is rotated at an unknown pivot. Given the rotated array nums and a target, return the index of target or -1 if it is not present. You must write an O(log n) algorithm.",
        "Example 1:\nInput: nums = [4,5,6,7,0,1,2], target = 0\nOutput: 4",
        "Example 2:\nInput: nums = [4,5,6,7,0,1,2], target = 3\nOutput: -1",
        "Constraints:\n- 1 <= nums.length <= 5000\n- -10^4 <= nums[i], target <= 10^4\n- All values of nums are unique",
      ],
      code: `int search(vector<int>& nums, int target) {
    int lo = 0, hi = nums.size() - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] == target) return mid;
        if (nums[lo] <= nums[mid]) {
            if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
            else lo = mid + 1;
        } else {
            if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
            else hi = mid - 1;
        }
    }
    return -1;
}`,
      explanation: [
        "In a rotated sorted array, at least one of the halves [lo, mid] or [mid, hi] is fully sorted. Comparing nums[lo] with nums[mid] identifies which one.",
        "If target lies inside the sorted half's value range we recurse into it; otherwise it must be in the other half. Each step still halves the interval.",
        "Time: O(log n). Space: O(1).",
      ],
    },
    {
      name: "Search in Rotated Sorted Array II",
      difficulty: "Medium",
      variation: "Rotated array with duplicates",
      link: "https://leetcode.com/problems/search-in-rotated-sorted-array-ii/",
      question: [
        "A non-decreasing sorted array (possibly with duplicates) is rotated at an unknown pivot. Given the rotated array nums and a target, return true if target is in nums, false otherwise. Minimize operation steps as much as possible.",
        "Example 1:\nInput: nums = [2,5,6,0,0,1,2], target = 0\nOutput: true",
        "Example 2:\nInput: nums = [2,5,6,0,0,1,2], target = 3\nOutput: false",
        "Constraints:\n- 1 <= nums.length <= 5000\n- -10^4 <= nums[i], target <= 10^4\n- nums is guaranteed to be rotated at some pivot",
      ],
      code: `bool search(vector<int>& nums, int target) {
    int lo = 0, hi = nums.size() - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] == target) return true;
        if (nums[lo] == nums[mid] && nums[mid] == nums[hi]) {
            ++lo;
            --hi;
        } else if (nums[lo] <= nums[mid]) {
            if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
            else lo = mid + 1;
        } else {
            if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
            else hi = mid - 1;
        }
    }
    return false;
}`,
      explanation: [
        "Duplicates can make nums[lo] == nums[mid] == nums[hi], in which case we cannot tell which half is sorted; shrinking both ends by one is safe because those equal values are not the target.",
        "In every other case the same sorted-half reasoning as the distinct-values version applies, halving the range.",
        "Time: O(log n) on average, O(n) worst case when the array is mostly duplicates. Space: O(1).",
      ],
    },
    {
      name: "Find Minimum in Rotated Sorted Array",
      difficulty: "Medium",
      variation: "Rotation point / minimum",
      link: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/",
      question: [
        "An ascending sorted array of unique elements is rotated between 1 and n times. Given the rotated array nums, return its minimum element. You must write an O(log n) algorithm.",
        "Example 1:\nInput: nums = [3,4,5,1,2]\nOutput: 1\nExplanation: The original array was [1,2,3,4,5] rotated 3 times.",
        "Constraints:\n- 1 <= nums.length <= 5000\n- -5000 <= nums[i] <= 5000\n- All the integers of nums are unique",
      ],
      code: `int findMin(vector<int>& nums) {
    int lo = 0, hi = nums.size() - 1;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] > nums[hi]) lo = mid + 1;
        else hi = mid;
    }
    return nums[lo];
}`,
      explanation: [
        "Compare the middle with the right end. If nums[mid] > nums[hi], the rotation point (minimum) must be strictly to the right of mid; otherwise the minimum is at mid or to its left.",
        "The invariant is that the minimum always stays inside [lo, hi]. Comparing against nums[hi] (not nums[lo]) is what makes the fully-sorted case work correctly.",
        "Time: O(log n). Space: O(1).",
      ],
    },
    {
      name: "Koko Eating Bananas",
      difficulty: "Medium",
      variation: "Search on answer (minimize feasible speed)",
      link: "https://leetcode.com/problems/koko-eating-bananas/",
      question: [
        "Koko has n piles of bananas, piles[i] in the i-th pile. Guards return in h hours. Each hour she picks a pile and eats up to k bananas from it (if the pile has fewer than k, she finishes the pile and stops for that hour). Return the minimum integer k such that she can eat all bananas within h hours.",
        "Example 1:\nInput: piles = [3,6,7,11], h = 8\nOutput: 4",
        "Example 2:\nInput: piles = [30,11,23,4,20], h = 5\nOutput: 30",
        "Constraints:\n- 1 <= piles.length <= 10^4\n- piles.length <= h <= 10^9\n- 1 <= piles[i] <= 10^9",
      ],
      code: `int minEatingSpeed(vector<int>& piles, int h) {
    int lo = 1, hi = *max_element(piles.begin(), piles.end());
    auto hoursNeeded = [&](int k) {
        long long hours = 0;
        for (int p : piles) hours += (p + (long long)k - 1) / k;
        return hours;
    };
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (hoursNeeded(mid) <= h) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}`,
      explanation: [
        "The predicate 'speed k finishes within h hours' is monotonic: if k works, any faster speed also works. So we binary search the smallest feasible k in [1, max pile].",
        "For a candidate k, each pile of size p costs ceil(p / k) hours; summing in long long avoids overflow. The loop converges on the boundary between infeasible and feasible speeds.",
        "Time: O(n log(max pile)). Space: O(1).",
      ],
    },
    {
      name: "Capacity To Ship Packages Within D Days",
      difficulty: "Medium",
      variation: "Search on answer (minimize capacity)",
      link: "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/",
      question: [
        "Packages must be shipped in order within days days. The i-th package has weight weights[i]. Each day the ship loads consecutive packages without exceeding its capacity. Return the least ship capacity that ships all packages within days days.",
        "Example 1:\nInput: weights = [1,2,3,4,5,6,7,8,9,10], days = 5\nOutput: 15\nExplanation: Days split as (1,2,3,4,5), (6,7), (8), (9), (10).",
        "Constraints:\n- 1 <= days <= weights.length <= 5 * 10^4\n- 1 <= weights[i] <= 500",
      ],
      code: `int shipWithinDays(vector<int>& weights, int days) {
    int lo = *max_element(weights.begin(), weights.end());
    int hi = accumulate(weights.begin(), weights.end(), 0);
    auto daysNeeded = [&](int cap) {
        int used = 1, load = 0;
        for (int w : weights) {
            if (load + w > cap) {
                ++used;
                load = 0;
            }
            load += w;
        }
        return used;
    };
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (daysNeeded(mid) <= days) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}`,
      explanation: [
        "Feasibility is monotonic in capacity: any capacity that works keeps working when increased. The answer lies in [max weight, total weight].",
        "For a candidate capacity we greedily pack each day as full as possible; greedy packing yields the minimum number of days for that capacity, so the check is exact.",
        "Time: O(n log(sum of weights)). Space: O(1).",
      ],
    },
    {
      name: "Aggressive Cows",
      difficulty: "Medium",
      variation: "Search on answer (maximize minimum distance)",
      question: [
        "You are given n stall positions on a line and k cows. Place all k cows in stalls so that the minimum distance between any two cows is as large as possible, and return that largest minimum distance.",
        "Example 1:\nInput: stalls = [1,2,4,8,9], k = 3\nOutput: 3\nExplanation: Place cows at positions 1, 4 and 8 (or 1, 4 and 9); the minimum pairwise distance is 3, which cannot be improved.",
        "Constraints:\n- 2 <= k <= n <= 10^5\n- 0 <= stalls[i] <= 10^9",
      ],
      code: `int aggressiveCows(vector<int>& stalls, int k) {
    sort(stalls.begin(), stalls.end());
    auto canPlace = [&](int gap) {
        int placed = 1, last = stalls[0];
        for (int i = 1; i < (int)stalls.size(); ++i) {
            if (stalls[i] - last >= gap) {
                ++placed;
                last = stalls[i];
                if (placed >= k) return true;
            }
        }
        return placed >= k;
    };
    int lo = 0, hi = stalls.back() - stalls.front();
    while (lo < hi) {
        int mid = lo + (hi - lo + 1) / 2;
        if (canPlace(mid)) lo = mid;
        else hi = mid - 1;
    }
    return lo;
}`,
      explanation: [
        "This is the mirror of minimize-max problems: we maximize the minimum gap. The predicate 'k cows fit with pairwise distance >= gap' is monotonic (true for small gaps, false past some threshold), so we binary search the largest true.",
        "The greedy check places a cow in the first stall and then in every stall at least gap away from the last placed cow; greedy placement maximizes the number of cows that fit for a given gap, making the check exact.",
        "Because we search for the last true, mid is rounded up with (hi - lo + 1) / 2 to avoid an infinite loop.",
        "Time: O(n log n + n log(range)). Space: O(1) beyond sorting.",
      ],
    },
    {
      name: "Split Array Largest Sum",
      difficulty: "Hard",
      variation: "Search on answer (minimize the maximum subarray sum)",
      link: "https://leetcode.com/problems/split-array-largest-sum/",
      question: [
        "Given an integer array nums and an integer k, split nums into k non-empty contiguous subarrays so that the largest subarray sum is minimized. Return the minimized largest sum.",
        "Example 1:\nInput: nums = [7,2,5,10,8], k = 2\nOutput: 18\nExplanation: The best split is [7,2,5] and [10,8], where the largest sum is 18.",
        "Constraints:\n- 1 <= nums.length <= 1000\n- 0 <= nums[i] <= 10^6\n- 1 <= k <= min(50, nums.length)",
      ],
      code: `int splitArray(vector<int>& nums, int k) {
    long long lo = *max_element(nums.begin(), nums.end());
    long long hi = accumulate(nums.begin(), nums.end(), 0LL);
    auto piecesNeeded = [&](long long cap) {
        int pieces = 1;
        long long sum = 0;
        for (int x : nums) {
            if (sum + x > cap) {
                ++pieces;
                sum = 0;
            }
            sum += x;
        }
        return pieces;
    };
    while (lo < hi) {
        long long mid = lo + (hi - lo) / 2;
        if (piecesNeeded(mid) <= k) hi = mid;
        else lo = mid + 1;
    }
    return (int)lo;
}`,
      explanation: [
        "Instead of enumerating splits, binary search the answer: for a candidate cap, greedily cut a new subarray whenever adding the next number would exceed cap. Greedy cutting gives the fewest pieces achievable under that cap.",
        "The number of pieces needed is non-increasing as cap grows, so 'piecesNeeded(cap) <= k' is a monotonic predicate; the smallest cap satisfying it is the answer.",
        "Time: O(n log(sum - max)). Space: O(1).",
      ],
    },
    {
      name: "Find K-th Smallest Pair Distance",
      difficulty: "Hard",
      variation: "Search on answer + two-pointer counting",
      link: "https://leetcode.com/problems/find-k-th-smallest-pair-distance/",
      question: [
        "The distance of a pair (a, b) is |a - b|. Given an integer array nums and an integer k, return the k-th smallest distance among all pairs nums[i], nums[j] with 0 <= i < j < nums.length.",
        "Example 1:\nInput: nums = [1,3,1], k = 1\nOutput: 0\nExplanation: The pairs are (1,3), (1,1), (3,1) with distances 2, 0, 2; the 1st smallest is 0.",
        "Constraints:\n- n == nums.length\n- 2 <= n <= 10^4\n- 0 <= nums[i] <= 10^6\n- 1 <= k <= n * (n - 1) / 2",
      ],
      code: `int smallestDistancePair(vector<int>& nums, int k) {
    sort(nums.begin(), nums.end());
    int n = nums.size();
    auto pairsWithin = [&](int d) {
        long long count = 0;
        int left = 0;
        for (int right = 0; right < n; ++right) {
            while (nums[right] - nums[left] > d) ++left;
            count += right - left;
        }
        return count;
    };
    int lo = 0, hi = nums.back() - nums.front();
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (pairsWithin(mid) >= k) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}`,
      explanation: [
        "We binary search over the distance value d, not over indices. pairsWithin(d), the number of pairs with distance <= d, is non-decreasing in d, so 'pairsWithin(d) >= k' is monotonic and the smallest such d is the k-th smallest distance.",
        "After sorting, a sliding window counts pairs in O(n): for each right endpoint, advance left until the window span is at most d; every element in the window pairs with right.",
        "The answer is always an achievable distance: if d were not realized by any pair, pairsWithin(d) would equal pairsWithin(d - 1) and the search would have settled on d - 1 instead.",
        "Time: O(n log n + n log(max distance)). Space: O(1) beyond sorting.",
      ],
    },
    {
      name: "Median of Two Sorted Arrays",
      difficulty: "Hard",
      variation: "Partition binary search",
      link: "https://leetcode.com/problems/median-of-two-sorted-arrays/",
      question: [
        "Given two sorted arrays nums1 and nums2 of sizes m and n, return the median of the two sorted arrays. The overall run time complexity should be O(log(m + n)).",
        "Example 1:\nInput: nums1 = [1,3], nums2 = [2]\nOutput: 2.0\nExplanation: Merged array = [1,2,3] and the median is 2.",
        "Example 2:\nInput: nums1 = [1,2], nums2 = [3,4]\nOutput: 2.5",
        "Constraints:\n- 0 <= m, n <= 1000\n- 1 <= m + n <= 2000\n- -10^6 <= nums1[i], nums2[i] <= 10^6",
      ],
      code: `double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
    if (nums1.size() > nums2.size()) return findMedianSortedArrays(nums2, nums1);
    int m = nums1.size(), n = nums2.size();
    int lo = 0, hi = m;
    while (lo <= hi) {
        int i = lo + (hi - lo) / 2;
        int j = (m + n + 1) / 2 - i;
        int aLeft = (i == 0) ? INT_MIN : nums1[i - 1];
        int aRight = (i == m) ? INT_MAX : nums1[i];
        int bLeft = (j == 0) ? INT_MIN : nums2[j - 1];
        int bRight = (j == n) ? INT_MAX : nums2[j];
        if (aLeft <= bRight && bLeft <= aRight) {
            if ((m + n) % 2 == 1) return max(aLeft, bLeft);
            return (max(aLeft, bLeft) + min(aRight, bRight)) / 2.0;
        }
        if (aLeft > bRight) hi = i - 1;
        else lo = i + 1;
    }
    return 0.0;
}`,
      explanation: [
        "Binary search the cut position i in the shorter array; j is forced so the combined left side holds exactly half the elements. A cut is valid when every left element is <= every right element, i.e. aLeft <= bRight and bLeft <= aRight.",
        "If aLeft > bRight, the cut in nums1 is too far right, so move hi left; otherwise move lo right. Validity is monotonic in i, so the search converges on the unique valid partition.",
        "For an odd total the median is the maximum of the left side; for an even total it is the average of the two middle values across the cut.",
        "Time: O(log(min(m, n))). Space: O(1).",
      ],
    },
  ],
};
