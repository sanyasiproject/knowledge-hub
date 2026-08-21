import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Third Maximum Number",
      difficulty: "Easy",
      variation: "Constant-k selection by tracking",
      link: "https://leetcode.com/problems/third-maximum-number/",
      question: [
        "Given an integer array nums, return the third distinct maximum number. If the third maximum does not exist, return the maximum number.",
        "Example 1:\nInput: nums = [3,2,1]\nOutput: 1\nExample 2:\nInput: nums = [2,2,3,1]\nOutput: 1\nExplanation: Duplicates count once; the third distinct maximum is 1.",
        "Constraints:\n- 1 <= nums.length <= 10^4\n- -2^31 <= nums[i] <= 2^31 - 1",
      ],
      code: `class Solution {
public:
    int thirdMax(vector<int>& nums) {
        long long first = LLONG_MIN, second = LLONG_MIN, third = LLONG_MIN;
        for (int x : nums) {
            if (x == first || x == second || x == third) continue;
            if (x > first) {
                third = second;
                second = first;
                first = x;
            } else if (x > second) {
                third = second;
                second = x;
            } else if (x > third) {
                third = x;
            }
        }
        return third == LLONG_MIN ? (int)first : (int)third;
    }
};`,
      explanation: [
        "When k is a small constant, full quickselect is overkill: three sliding registers hold the top three distinct values, shifting down whenever a larger value arrives.",
        "long long sentinels are needed because INT_MIN is a legal array value and would collide with an int sentinel.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Kth Largest Element in an Array",
      difficulty: "Medium",
      variation: "Classic quickselect",
      link: "https://leetcode.com/problems/kth-largest-element-in-an-array/",
      question: [
        "Given an integer array nums and an integer k, return the k-th largest element in the array (in sorted order, not the k-th distinct element). Solve it without fully sorting the array.",
        "Example 1:\nInput: nums = [3,2,1,5,6,4], k = 2\nOutput: 5\nExample 2:\nInput: nums = [3,2,3,1,2,4,5,5,6], k = 4\nOutput: 4",
        "Constraints:\n- 1 <= k <= nums.length <= 10^5\n- -10^4 <= nums[i] <= 10^4",
      ],
      code: `class Solution {
public:
    int findKthLargest(vector<int>& nums, int k) {
        int target = (int)nums.size() - k;
        int lo = 0, hi = (int)nums.size() - 1;
        mt19937 rng(1234567);
        while (lo < hi) {
            int pivot = nums[lo + rng() % (hi - lo + 1)];
            int lt = lo, i = lo, gt = hi;
            while (i <= gt) {
                if (nums[i] < pivot) swap(nums[lt++], nums[i++]);
                else if (nums[i] > pivot) swap(nums[i], nums[gt--]);
                else i++;
            }
            if (target < lt) hi = lt - 1;
            else if (target > gt) lo = gt + 1;
            else return nums[target];
        }
        return nums[lo];
    }
};`,
      explanation: [
        "The k-th largest is the element at sorted index n-k. Quickselect partitions around a random pivot and recurses into only the side containing that index, discarding the other side entirely.",
        "The three-way (Dutch flag) partition puts all values equal to the pivot in a middle block [lt, gt]; this is what keeps the algorithm linear even on arrays full of duplicates, where a two-way partition degrades to quadratic.",
        "Random pivots make the expected work n + n/2 + n/4 + ... = O(n).",
        "Time: O(n) expected, O(n^2) worst case. Space: O(1).",
      ],
    },
    {
      name: "Kth Smallest Element",
      difficulty: "Medium",
      variation: "Quickselect for k-th smallest",
      link: "https://www.geeksforgeeks.org/problems/kth-smallest-element5635/1",
      question: [
        "Given an array arr of distinct elements and a number k (1 <= k <= arr.length), return the k-th smallest element in the array.",
        "Example 1:\nInput: arr = [7,10,4,3,20,15], k = 3\nOutput: 7\nExplanation: Sorted order is [3,4,7,10,15,20]; the 3rd smallest is 7.",
        "Constraints:\n- 1 <= arr.length <= 10^6\n- 1 <= k <= arr.length\n- All elements are distinct",
      ],
      code: `class Solution {
public:
    int kthSmallest(vector<int>& arr, int k) {
        int target = k - 1;
        int lo = 0, hi = (int)arr.size() - 1;
        mt19937 rng(987654);
        while (lo < hi) {
            int pivot = arr[lo + rng() % (hi - lo + 1)];
            int lt = lo, i = lo, gt = hi;
            while (i <= gt) {
                if (arr[i] < pivot) swap(arr[lt++], arr[i++]);
                else if (arr[i] > pivot) swap(arr[i], arr[gt--]);
                else i++;
            }
            if (target < lt) hi = lt - 1;
            else if (target > gt) lo = gt + 1;
            else return arr[target];
        }
        return arr[lo];
    }
};`,
      explanation: [
        "Mirror of k-th largest: the k-th smallest lives at sorted index k-1, so quickselect narrows the window until that index falls inside the pivot's equal block.",
        "Each partition costs linear time in the current window and the window shrinks geometrically in expectation, giving expected linear total work — far better than the O(n log n) full sort.",
        "Time: O(n) expected. Space: O(1).",
      ],
    },
    {
      name: "K Closest Points to Origin",
      difficulty: "Medium",
      variation: "Quickselect with custom comparator",
      link: "https://leetcode.com/problems/k-closest-points-to-origin/",
      question: [
        "Given an array of points on the plane and an integer k, return the k points closest to the origin (0, 0) by Euclidean distance. The answer may be returned in any order.",
        "Example 1:\nInput: points = [[1,3],[-2,2]], k = 1\nOutput: [[-2,2]]\nExplanation: Distance of (1,3) is sqrt(10), of (-2,2) is sqrt(8); the closer point is (-2,2).",
        "Constraints:\n- 1 <= k <= points.length <= 10^4\n- -10^4 <= x, y <= 10^4",
      ],
      code: `class Solution {
public:
    vector<vector<int>> kClosest(vector<vector<int>>& points, int k) {
        auto dist = [](const vector<int>& p) {
            return (long long)p[0] * p[0] + (long long)p[1] * p[1];
        };
        nth_element(points.begin(), points.begin() + (k - 1), points.end(),
                    [&](const vector<int>& a, const vector<int>& b) {
                        return dist(a) < dist(b);
                    });
        return vector<vector<int>>(points.begin(), points.begin() + k);
    }
};`,
      explanation: [
        "Compare by squared distance (no sqrt needed, and long long avoids overflow). nth_element is the standard library's quickselect: after the call, the first k points are exactly the k closest, in unspecified order.",
        "Because the problem accepts any order, no follow-up sort is required — quickselect alone finishes the job, beating the O(n log k) heap approach in expectation.",
        "Time: O(n) expected. Space: O(1) beyond the output.",
      ],
    },
    {
      name: "Top K Frequent Elements",
      difficulty: "Medium",
      variation: "Quickselect on frequencies",
      link: "https://leetcode.com/problems/top-k-frequent-elements/",
      question: [
        "Given an integer array nums and an integer k, return the k most frequent elements. The answer may be returned in any order, and it is guaranteed to be unique.",
        "Example 1:\nInput: nums = [1,1,1,2,2,3], k = 2\nOutput: [1,2]\nExample 2:\nInput: nums = [1], k = 1\nOutput: [1]",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- k is in the range [1, number of unique elements]",
      ],
      code: `class Solution {
public:
    vector<int> topKFrequent(vector<int>& nums, int k) {
        unordered_map<int, int> freq;
        for (int x : nums) freq[x]++;
        vector<pair<int, int>> items(freq.begin(), freq.end());
        nth_element(items.begin(), items.begin() + (k - 1), items.end(),
                    [](const pair<int, int>& a, const pair<int, int>& b) {
                        return a.second > b.second;
                    });
        vector<int> res;
        res.reserve(k);
        for (int i = 0; i < k; i++) res.push_back(items[i].first);
        return res;
    }
};`,
      explanation: [
        "Count frequencies with a hashmap, then quickselect the (value, count) pairs by descending count: after partitioning, the first k pairs are the k most frequent.",
        "This achieves expected O(u) selection over u unique values, versus O(u log u) for sorting or O(u log k) for a heap.",
        "Time: O(n + u) expected. Space: O(u).",
      ],
    },
    {
      name: "Top K Frequent Words",
      difficulty: "Medium",
      variation: "Selection with tie-breaking order",
      link: "https://leetcode.com/problems/top-k-frequent-words/",
      question: [
        "Given an array of strings words and an integer k, return the k most frequent strings, sorted by frequency from highest to lowest, with ties broken by lexicographical order.",
        "Example 1:\nInput: words = [\"i\",\"love\",\"leetcode\",\"i\",\"love\",\"coding\"], k = 2\nOutput: [\"i\",\"love\"]\nExplanation: \"i\" and \"love\" both occur twice; \"i\" comes first alphabetically.",
        "Constraints:\n- 1 <= words.length <= 500\n- 1 <= k <= number of unique words",
      ],
      code: `class Solution {
public:
    vector<string> topKFrequent(vector<string>& words, int k) {
        unordered_map<string, int> freq;
        for (auto& w : words) freq[w]++;
        vector<pair<string, int>> items(freq.begin(), freq.end());
        auto better = [](const pair<string, int>& a, const pair<string, int>& b) {
            if (a.second != b.second) return a.second > b.second;
            return a.first < b.first;
        };
        nth_element(items.begin(), items.begin() + (k - 1), items.end(), better);
        sort(items.begin(), items.begin() + k, better);
        vector<string> res;
        res.reserve(k);
        for (int i = 0; i < k; i++) res.push_back(items[i].first);
        return res;
    }
};`,
      explanation: [
        "The comparator is a total order (frequency descending, then word ascending — no two map entries compare equal), so quickselect isolates exactly the true top-k set in expected linear time.",
        "Because the output must be ordered, we finish with a sort of only the k selected entries — selection first, then sort the small piece, is the standard trick when order matters only within the answer.",
        "Time: O(n + u + k log k) expected, where u is the number of unique words. Space: O(u).",
      ],
    },
    {
      name: "Least Number of Unique Integers after K Removals",
      difficulty: "Medium",
      variation: "Selection over frequency counts",
      link: "https://leetcode.com/problems/least-number-of-unique-integers-after-k-removals/",
      question: [
        "Given an array of integers arr and an integer k, remove exactly k elements so that the number of distinct integers remaining is minimized, and return that minimum.",
        "Example 1:\nInput: arr = [5,5,4], k = 1\nOutput: 1\nExplanation: Remove the single 4; only 5 remains.\nExample 2:\nInput: arr = [4,3,1,1,3,3,2], k = 3\nOutput: 2",
        "Constraints:\n- 1 <= arr.length <= 10^5\n- 1 <= k <= arr.length",
      ],
      code: `class Solution {
public:
    int findLeastNumOfUniqueInts(vector<int>& arr, int k) {
        unordered_map<int, int> freq;
        for (int x : arr) freq[x]++;
        vector<int> counts;
        counts.reserve(freq.size());
        for (auto& p : freq) counts.push_back(p.second);
        sort(counts.begin(), counts.end());
        int remaining = counts.size();
        for (int c : counts) {
            if (k >= c) {
                k -= c;
                remaining--;
            } else {
                break;
            }
        }
        return remaining;
    }
};`,
      explanation: [
        "To eliminate the most distinct values with a fixed removal budget, always delete the value with the smallest count first — an exchange argument shows swapping any deletion toward a rarer value never hurts.",
        "Sort (or repeatedly select) the frequency multiset ascending and consume counts until the budget runs out; whatever counts survive are the remaining distinct integers.",
        "Time: O(n + u log u). Space: O(u).",
      ],
    },
    {
      name: "Median of an Unsorted Array Drill",
      difficulty: "Medium",
      variation: "Median via selection",
      question: [
        "Given an unsorted integer array nums, return its median without fully sorting the array. For odd length, the median is the middle element of the sorted order; for even length, it is the average of the two middle elements.",
        "Example 1:\nInput: nums = [7,1,5,3]\nOutput: 4.0\nExplanation: Sorted order is [1,3,5,7]; the median is (3+5)/2 = 4.0.\nExample 2:\nInput: nums = [2,9,4]\nOutput: 4.0",
        "Constraints:\n- 1 <= nums.length <= 10^6\n- -10^9 <= nums[i] <= 10^9",
      ],
      code: `#include <bits/stdc++.h>
using namespace std;

double findMedian(vector<int> nums) {
    int n = nums.size();
    auto mid = nums.begin() + n / 2;
    nth_element(nums.begin(), mid, nums.end());
    if (n % 2 == 1) return (double)*mid;
    int lowerMax = *max_element(nums.begin(), mid);
    return (lowerMax + (double)*mid) / 2.0;
}`,
      explanation: [
        "One quickselect places the upper-middle element at index n/2 and guarantees everything to its left is <= it. For odd n that element is the median.",
        "For even n, the other middle value is simply the maximum of the left partition — no second selection pass is needed, just a linear max scan.",
        "Time: O(n) expected. Space: O(1) beyond the working copy.",
      ],
    },
    {
      name: "Find the Kth Largest Integer in the Array",
      difficulty: "Medium",
      variation: "Selection with big-number comparator",
      link: "https://leetcode.com/problems/find-the-kth-largest-integer-in-the-array/",
      question: [
        "You are given an array of strings nums where each string represents a non-negative integer without leading zeros (values can exceed 64-bit range), and an integer k. Return the string that represents the k-th largest integer. Duplicates are counted separately.",
        "Example 1:\nInput: nums = [\"3\",\"6\",\"7\",\"10\"], k = 4\nOutput: \"3\"\nExample 2:\nInput: nums = [\"0\",\"0\"], k = 2\nOutput: \"0\"",
        "Constraints:\n- 1 <= k <= nums.length <= 10^4\n- 1 <= nums[i].length <= 100\n- No leading zeros",
      ],
      code: `class Solution {
public:
    string kthLargestNumber(vector<string>& nums, int k) {
        auto larger = [](const string& a, const string& b) {
            if (a.size() != b.size()) return a.size() > b.size();
            return a > b;
        };
        nth_element(nums.begin(), nums.begin() + (k - 1), nums.end(), larger);
        return nums[k - 1];
    }
};`,
      explanation: [
        "The numbers overflow every native type, so compare them as strings: with no leading zeros, a longer string is always the larger number, and equal lengths compare lexicographically.",
        "Quickselect with that comparator places the k-th largest at index k-1 directly — no big-integer arithmetic and no full sort.",
        "Time: O(n * L) expected, where L is the maximum string length. Space: O(1).",
      ],
    },
    {
      name: "Sort a K-Sorted (Nearly Sorted) Array Drill",
      difficulty: "Medium",
      variation: "Partial order exploitation",
      question: [
        "Given an array where every element is at most k positions away from its position in the fully sorted array, sort the array efficiently (faster than a general comparison sort when k is much smaller than n).",
        "Example 1:\nInput: arr = [6,5,3,2,8,10,9], k = 3\nOutput: [2,3,5,6,8,9,10]",
        "Constraints:\n- 1 <= arr.length <= 10^6\n- 0 <= k < arr.length",
      ],
      code: `#include <bits/stdc++.h>
using namespace std;

vector<int> sortKSorted(vector<int>& arr, int k) {
    priority_queue<int, vector<int>, greater<int>> window;
    vector<int> res;
    res.reserve(arr.size());
    for (int x : arr) {
        window.push(x);
        if ((int)window.size() > k) {
            res.push_back(window.top());
            window.pop();
        }
    }
    while (!window.empty()) {
        res.push_back(window.top());
        window.pop();
    }
    return res;
}`,
      explanation: [
        "The next element of the sorted output must lie within the first k+1 unplaced elements, so a min-heap of size k+1 always has the true minimum at its top.",
        "This is the selection mindset applied incrementally: instead of one k-th element, we repeatedly select the 1st element from a window that the displacement bound keeps small.",
        "Time: O(n log k). Space: O(k).",
      ],
    },
    {
      name: "Kth Smallest Element in a Sorted Matrix",
      difficulty: "Medium",
      variation: "K-th element by counting / value binary search",
      link: "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/",
      question: [
        "Given an n x n matrix where each row and each column is sorted in ascending order, return the k-th smallest element in the matrix (with duplicates counted).",
        "Example 1:\nInput: matrix = [[1,5,9],[10,11,13],[12,13,15]], k = 8\nOutput: 13",
        "Constraints:\n- 1 <= n <= 300\n- -10^9 <= matrix[i][j] <= 10^9\n- 1 <= k <= n^2",
      ],
      code: `class Solution {
public:
    int kthSmallest(vector<vector<int>>& matrix, int k) {
        int n = matrix.size();
        int lo = matrix[0][0], hi = matrix[n - 1][n - 1];
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            long long cnt = 0;
            int j = n - 1;
            for (int i = 0; i < n; i++) {
                while (j >= 0 && matrix[i][j] > mid) j--;
                cnt += j + 1;
            }
            if (cnt < k) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    }
};`,
      explanation: [
        "Instead of partitioning positions, binary search on the value: count how many entries are <= mid using the sorted-matrix staircase walk (the column pointer j only ever moves left as rows advance).",
        "The loop converges on the smallest value v with count(v) >= k, which must itself be present in the matrix — the standard k-th element technique when the data supports cheap rank counting.",
        "Time: O(n log(maxVal - minVal)). Space: O(1).",
      ],
    },
    {
      name: "Wiggle Sort II",
      difficulty: "Medium",
      variation: "Median quickselect + three-way partition",
      link: "https://leetcode.com/problems/wiggle-sort-ii/",
      question: [
        "Given an integer array nums, reorder it in place so that nums[0] < nums[1] > nums[2] < nums[3] and so on. You may assume the input always has a valid answer.",
        "Example 1:\nInput: nums = [1,5,1,1,6,4]\nOutput: [1,6,1,5,1,4] (one valid answer)\nExample 2:\nInput: nums = [1,3,2,2,3,1]\nOutput: [2,3,1,3,1,2] (one valid answer)",
        "Constraints:\n- 1 <= nums.length <= 5 * 10^4\n- 0 <= nums[i] <= 5000",
      ],
      code: `class Solution {
public:
    void wiggleSort(vector<int>& nums) {
        int n = nums.size();
        auto midIt = nums.begin() + n / 2;
        nth_element(nums.begin(), midIt, nums.end());
        int median = *midIt;
        auto idx = [n](int i) { return (1 + 2 * i) % (n | 1); };
        int i = 0, j = 0, k = n - 1;
        while (j <= k) {
            if (nums[idx(j)] > median) {
                swap(nums[idx(i++)], nums[idx(j++)]);
            } else if (nums[idx(j)] < median) {
                swap(nums[idx(j)], nums[idx(k--)]);
            } else {
                j++;
            }
        }
    }
};`,
      explanation: [
        "Find the median with quickselect, then do a Dutch-flag three-way partition through the virtual index map (1+2i) mod (n or 1), which visits odd positions first and then even positions.",
        "The virtual indexing places elements greater than the median into odd slots and elements smaller into even slots in one pass, so every odd position strictly beats its even neighbors — the wiggle property.",
        "Time: O(n) expected. Space: O(1).",
      ],
    },
    {
      name: "Kth Largest Pair Sum Drill",
      difficulty: "Medium",
      variation: "Quickselect over derived values",
      question: [
        "Given an integer array nums with n <= 2000 and an integer k (1 <= k <= n*(n-1)/2), return the k-th largest value among all pair sums nums[i] + nums[j] with i < j.",
        "Example 1:\nInput: nums = [3,1,4,2], k = 2\nOutput: 6\nExplanation: Pair sums are 4,7,5,5,3,6; sorted descending they are 7,6,5,5,4,3, so the 2nd largest is 6.",
        "Constraints:\n- 2 <= n <= 2000\n- -10^9 <= nums[i] <= 10^9\n- 1 <= k <= n*(n-1)/2",
      ],
      code: `#include <bits/stdc++.h>
using namespace std;

long long kthLargestPairSum(vector<int>& nums, long long k) {
    int n = nums.size();
    vector<long long> sums;
    sums.reserve((size_t)n * (n - 1) / 2);
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            sums.push_back((long long)nums[i] + nums[j]);
    nth_element(sums.begin(), sums.begin() + (k - 1), sums.end(), greater<long long>());
    return sums[k - 1];
}`,
      explanation: [
        "The selection target does not have to be an input element: materialize the O(n^2) derived pair sums (about 2 million values at n = 2000) and quickselect the k-th largest among them.",
        "Selecting is expected linear in the number of candidates, so the pair generation dominates — sorting all sums would add an unnecessary log factor.",
        "Time: O(n^2) expected. Space: O(n^2).",
      ],
    },
    {
      name: "Find K-th Smallest Pair Distance",
      difficulty: "Hard",
      variation: "K-th element via binary search + two pointers",
      link: "https://leetcode.com/problems/find-k-th-smallest-pair-distance/",
      question: [
        "The distance of a pair (a, b) is |a - b|. Given an integer array nums and an integer k, return the k-th smallest distance among all pairs nums[i], nums[j] with i < j.",
        "Example 1:\nInput: nums = [1,3,1], k = 1\nOutput: 0\nExplanation: Pair distances are 2, 0, 2; the smallest is 0.",
        "Constraints:\n- 2 <= nums.length <= 10^4\n- 0 <= nums[i] <= 10^6\n- 1 <= k <= n*(n-1)/2",
      ],
      code: `class Solution {
public:
    int smallestDistancePair(vector<int>& nums, int k) {
        sort(nums.begin(), nums.end());
        int n = nums.size();
        int lo = 0, hi = nums[n - 1] - nums[0];
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            long long cnt = 0;
            for (int i = 0, j = 0; i < n; i++) {
                while (nums[i] - nums[j] > mid) j++;
                cnt += i - j;
            }
            if (cnt < k) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    }
};`,
      explanation: [
        "There are O(n^2) pair distances — too many to materialize — so binary search the answer value instead: count(mid) = number of pairs with distance <= mid, computed with a sliding two-pointer window over the sorted array.",
        "count is monotone in mid, so the search converges on the smallest distance whose count reaches k, which is exactly the k-th smallest pair distance.",
        "Time: O(n log n + n log W) where W is the value range. Space: O(1).",
      ],
    },
    {
      name: "Median of Two Sorted Arrays",
      difficulty: "Hard",
      variation: "K-th element of two sorted arrays",
      link: "https://leetcode.com/problems/median-of-two-sorted-arrays/",
      question: [
        "Given two sorted arrays nums1 and nums2 of sizes m and n, return the median of the two sorted arrays combined. The overall run time complexity should be O(log(m+n)).",
        "Example 1:\nInput: nums1 = [1,3], nums2 = [2]\nOutput: 2.0\nExample 2:\nInput: nums1 = [1,2], nums2 = [3,4]\nOutput: 2.5",
        "Constraints:\n- 0 <= m, n <= 1000\n- 1 <= m + n\n- -10^6 <= values <= 10^6",
      ],
      code: `class Solution {
public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        if (nums1.size() > nums2.size()) return findMedianSortedArrays(nums2, nums1);
        int m = nums1.size(), n = nums2.size();
        int lo = 0, hi = m;
        while (lo <= hi) {
            int i = (lo + hi) / 2;
            int j = (m + n + 1) / 2 - i;
            int leftA = (i == 0) ? INT_MIN : nums1[i - 1];
            int rightA = (i == m) ? INT_MAX : nums1[i];
            int leftB = (j == 0) ? INT_MIN : nums2[j - 1];
            int rightB = (j == n) ? INT_MAX : nums2[j];
            if (leftA <= rightB && leftB <= rightA) {
                if ((m + n) % 2 == 1) return max(leftA, leftB);
                return (max(leftA, leftB) + min(rightA, rightB)) / 2.0;
            }
            if (leftA > rightB) hi = i - 1;
            else lo = i + 1;
        }
        return 0.0;
    }
};`,
      explanation: [
        "The median is a rank query: split both arrays so the combined left half has exactly (m+n+1)/2 elements. Binary search the cut in the shorter array; the cut in the longer array is then forced.",
        "A cut is correct when every left element is <= every right element across both arrays (leftA <= rightB and leftB <= rightA). If leftA is too big, move the cut left; otherwise move right. Sentinels handle empty sides.",
        "Time: O(log(min(m, n))). Space: O(1).",
      ],
    },
    {
      name: "Quickselect with Median of Medians Drill",
      difficulty: "Hard",
      variation: "Deterministic worst-case linear selection",
      question: [
        "Implement selectKth(nums, k) returning the k-th smallest element (0-indexed) of an unsorted array in guaranteed worst-case linear time, without randomization, using the median-of-medians pivot strategy.",
        "Example 1:\nInput: nums = [9,1,8,2,7,3,6,4,5], k = 4\nOutput: 5\nExplanation: The 0-indexed 4th smallest of [1..9] is 5.",
        "Constraints:\n- 1 <= nums.length <= 10^6\n- 0 <= k < nums.length\n- The bound must hold for every input, including adversarial orderings",
      ],
      code: `#include <bits/stdc++.h>
using namespace std;

int selectKth(vector<int> a, int k) {
    while (true) {
        int n = a.size();
        if (n <= 5) {
            sort(a.begin(), a.end());
            return a[k];
        }
        vector<int> medians;
        medians.reserve((n + 4) / 5);
        for (int i = 0; i < n; i += 5) {
            int end = min(i + 5, n);
            sort(a.begin() + i, a.begin() + end);
            medians.push_back(a[i + (end - i) / 2]);
        }
        int pivot = selectKth(medians, (int)medians.size() / 2);
        vector<int> less, greater;
        int equalCount = 0;
        for (int x : a) {
            if (x < pivot) less.push_back(x);
            else if (x > pivot) greater.push_back(x);
            else equalCount++;
        }
        if (k < (int)less.size()) {
            a = move(less);
        } else if (k < (int)less.size() + equalCount) {
            return pivot;
        } else {
            k -= (int)less.size() + equalCount;
            a = move(greater);
        }
    }
}`,
      explanation: [
        "Split the array into groups of five, take each group's median, and recursively select the median of those medians as the pivot. At least half the group medians are <= the pivot, and each such group contributes three elements <= it, so at least roughly 3n/10 elements fall on each side.",
        "That guarantee caps the surviving partition at about 7n/10 elements, giving the recurrence T(n) <= T(n/5) + T(7n/10) + O(n), which solves to O(n) because 1/5 + 7/10 < 1. No random choice, so no adversarial worst case.",
        "The three-way split (less / equal / greater) also makes the routine immune to duplicate-heavy inputs.",
        "Time: O(n) worst case. Space: O(n) for the working copies.",
      ],
    },
  ],
};
