import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Cyclic Sort",
      difficulty: "Easy",
      variation: "Core drill: sort a 1..n permutation in place",
      question: [
        "You are given an array containing each number from 1 to n exactly once, in arbitrary order. Sort the array in place in O(n) time without using extra space, by repeatedly placing each number at its correct index.",
        "Example 1:\nInput: nums = [3,1,5,4,2]\nOutput: [1,2,3,4,5]",
        "Example 2:\nInput: nums = [2,6,4,3,1,5]\nOutput: [1,2,3,4,5,6]",
        "Constraints:\n- 1 <= n <= 10^5\n- nums is a permutation of 1..n",
      ],
      code: `class Solution {
public:
    void cyclicSort(vector<int>& nums) {
        int i = 0;
        while (i < (int)nums.size()) {
            int correct = nums[i] - 1;
            if (nums[i] != nums[correct])
                swap(nums[i], nums[correct]);
            else
                ++i;
        }
    }
};`,
      explanation: [
        "Value v belongs at index v - 1. At each position, either the current value is already home (advance) or it is swapped directly to its home index.",
        "Every swap places at least one number at its final index permanently, so there are at most n swaps in total even though the index pointer sometimes stays put; that is the core invariant behind the whole pattern.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Build Array from Permutation",
      difficulty: "Easy",
      variation: "In-place permutation encoding at indices",
      link: "https://leetcode.com/problems/build-array-from-permutation/",
      question: [
        "Given a zero-based permutation nums, build an array ans of the same length where ans[i] = nums[nums[i]] for each i, and return it. Follow-up: do it in O(1) extra space by encoding two values in each slot.",
        "Example 1:\nInput: nums = [0,2,1,5,3,4]\nOutput: [0,1,2,4,5,3]",
        "Constraints:\n- 1 <= nums.length <= 1000\n- 0 <= nums[i] < nums.length\n- The elements of nums are distinct",
      ],
      code: `class Solution {
public:
    vector<int> buildArray(vector<int>& nums) {
        int n = nums.size();
        for (int i = 0; i < n; ++i)
            nums[i] += n * (nums[nums[i]] % n);
        for (int i = 0; i < n; ++i)
            nums[i] /= n;
        return nums;
    }
};`,
      explanation: [
        "Since every value is in [0, n), each slot can hold both the old value (value mod n) and the new value (value / n) as old + n * new. The mod in nums[nums[i]] % n recovers the original value even if that slot was already updated.",
        "A second pass divides by n to keep only the new values. This index-arithmetic encoding is the same trick used by many cyclic-sort marking solutions.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Missing Number",
      difficulty: "Easy",
      variation: "Single missing value in 0..n",
      link: "https://leetcode.com/problems/missing-number/",
      question: [
        "Given an array nums containing n distinct numbers in the range [0, n], return the only number in the range that is missing from the array. Solve it in O(n) time and O(1) extra space.",
        "Example 1:\nInput: nums = [3,0,1]\nOutput: 2",
        "Example 2:\nInput: nums = [9,6,4,2,3,5,7,0,1]\nOutput: 8",
        "Constraints:\n- n == nums.length\n- 1 <= n <= 10^4\n- 0 <= nums[i] <= n\n- All the numbers of nums are unique",
      ],
      code: `class Solution {
public:
    int missingNumber(vector<int>& nums) {
        int n = nums.size(), i = 0;
        while (i < n) {
            if (nums[i] < n && nums[i] != nums[nums[i]])
                swap(nums[i], nums[nums[i]]);
            else
                ++i;
        }
        for (int j = 0; j < n; ++j)
            if (nums[j] != j) return j;
        return n;
    }
};`,
      explanation: [
        "Values here are zero-based, so value v belongs at index v; the value n has no valid index and is simply skipped during placement.",
        "After cyclic placement every index holds its own value except the one where n landed or where a gap remains, and that index is the missing number; if all indices match, the missing number is n itself.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Kth Missing Positive Number",
      difficulty: "Easy",
      variation: "Kth missing in a sorted array (counting gap)",
      link: "https://leetcode.com/problems/kth-missing-positive-number/",
      question: [
        "Given a strictly increasing array arr of positive integers and an integer k, return the kth positive integer that is missing from the array.",
        "Example 1:\nInput: arr = [2,3,4,7,11], k = 5\nOutput: 9\nExplanation: The missing positives are [1,5,6,8,9,10,12,...]; the 5th is 9.",
        "Example 2:\nInput: arr = [1,2,3,4], k = 2\nOutput: 6",
        "Constraints:\n- 1 <= arr.length <= 1000\n- 1 <= arr[i] <= 1000\n- 1 <= k <= 1000\n- arr is strictly increasing",
      ],
      code: `class Solution {
public:
    int findKthPositive(vector<int>& arr, int k) {
        int lo = 0, hi = arr.size();
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (arr[mid] - mid - 1 < k)
                lo = mid + 1;
            else
                hi = mid;
        }
        return lo + k;
    }
};`,
      explanation: [
        "If every value were in its cyclic-sort spot, index i would hold i + 1; the difference arr[i] - (i + 1) therefore counts how many positives are missing before arr[i]. That count is non-decreasing, so binary search finds the first index with at least k missing.",
        "All k missing numbers then lie before index lo, so the answer is lo + k (each of the lo present values shifts the kth missing up by one).",
        "Time: O(log n). Space: O(1).",
      ],
    },
    {
      name: "Set Mismatch",
      difficulty: "Easy",
      variation: "One duplicate and one missing (corrupt pair)",
      link: "https://leetcode.com/problems/set-mismatch/",
      question: [
        "You have a set of integers 1 to n, but one number got duplicated, overwriting another number which is now missing. Given the resulting array nums, return the duplicated number followed by the missing number.",
        "Example 1:\nInput: nums = [1,2,2,4]\nOutput: [2,3]",
        "Example 2:\nInput: nums = [1,1]\nOutput: [1,2]",
        "Constraints:\n- 2 <= nums.length <= 10^4\n- 1 <= nums[i] <= 10^4",
      ],
      code: `class Solution {
public:
    vector<int> findErrorNums(vector<int>& nums) {
        int n = nums.size(), i = 0;
        while (i < n) {
            if (nums[i] != nums[nums[i] - 1])
                swap(nums[i], nums[nums[i] - 1]);
            else
                ++i;
        }
        for (int j = 0; j < n; ++j)
            if (nums[j] != j + 1)
                return {nums[j], j + 1};
        return {};
    }
};`,
      explanation: [
        "Cyclic placement puts each value at index value - 1; when a value's home already holds the same value, the swap condition fails and the pointer moves on, leaving the duplicate stranded at a wrong index.",
        "In the verification pass, the single index j where nums[j] != j + 1 exposes both answers at once: nums[j] is the duplicated value and j + 1 is the missing one.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Find All Numbers Disappeared in an Array",
      difficulty: "Easy",
      variation: "All missing values in 1..n with duplicates",
      link: "https://leetcode.com/problems/find-all-numbers-disappeared-in-an-array/",
      question: [
        "Given an array nums of n integers where nums[i] is in the range [1, n], return an array of all the integers in [1, n] that do not appear in nums. Solve it without extra space (the returned list does not count) and in O(n) time.",
        "Example 1:\nInput: nums = [4,3,2,7,8,2,3,1]\nOutput: [5,6]",
        "Example 2:\nInput: nums = [1,1]\nOutput: [2]",
        "Constraints:\n- n == nums.length\n- 1 <= n <= 10^5\n- 1 <= nums[i] <= n",
      ],
      code: `class Solution {
public:
    vector<int> findDisappearedNumbers(vector<int>& nums) {
        int n = nums.size(), i = 0;
        while (i < n) {
            if (nums[i] != nums[nums[i] - 1])
                swap(nums[i], nums[nums[i] - 1]);
            else
                ++i;
        }
        vector<int> res;
        for (int j = 0; j < n; ++j)
            if (nums[j] != j + 1)
                res.push_back(j + 1);
        return res;
    }
};`,
      explanation: [
        "Cyclic placement sends every value it can to index value - 1; duplicates cannot displace their twin, so they end up parked at indices whose true owner is absent.",
        "Every index that does not hold its own value afterwards corresponds to exactly one missing number, namely index + 1, so a single scan collects them all.",
        "Time: O(n). Space: O(1) beyond the output.",
      ],
    },
    {
      name: "Find the Duplicate Number",
      difficulty: "Medium",
      variation: "Single duplicate via index placement",
      link: "https://leetcode.com/problems/find-the-duplicate-number/",
      question: [
        "Given an array nums containing n + 1 integers where each integer is in the range [1, n], there is exactly one repeated number (possibly repeated multiple times). Return this repeated number. This drill allows modifying the array; see the cycle-detection drill for the read-only variant.",
        "Example 1:\nInput: nums = [1,3,4,2,2]\nOutput: 2",
        "Example 2:\nInput: nums = [3,1,3,4,2]\nOutput: 3",
        "Constraints:\n- 1 <= n <= 10^5\n- nums.length == n + 1\n- 1 <= nums[i] <= n\n- Exactly one value is repeated",
      ],
      code: `class Solution {
public:
    int findDuplicate(vector<int>& nums) {
        while (nums[0] != nums[nums[0]])
            swap(nums[0], nums[nums[0]]);
        return nums[0];
    }
};`,
      explanation: [
        "Treat index v as the home of value v (valid because values are 1..n and the array has n + 1 slots). Repeatedly send the value at index 0 to its home; each swap permanently settles one value, so the loop runs at most n times.",
        "The loop can only stop when the value at index 0 already sits at its home index too, which means two positions hold the same value: that value is the duplicate.",
        "Time: O(n). Space: O(1), but the input is mutated.",
      ],
    },
    {
      name: "Find the Duplicate Number (Cycle Detection)",
      difficulty: "Medium",
      variation: "Read-only variant via Floyd's tortoise and hare",
      link: "https://leetcode.com/problems/find-the-duplicate-number/",
      question: [
        "Same setup as the previous drill: nums has n + 1 integers in [1, n] with exactly one repeated value. This time you must not modify the array and must use O(1) extra space.",
        "Example 1:\nInput: nums = [1,3,4,2,2]\nOutput: 2",
        "Constraints:\n- 1 <= n <= 10^5\n- nums.length == n + 1\n- 1 <= nums[i] <= n\n- The array must not be modified\n- O(1) extra space required",
      ],
      code: `class Solution {
public:
    int findDuplicate(vector<int>& nums) {
        int slow = nums[0], fast = nums[0];
        do {
            slow = nums[slow];
            fast = nums[nums[fast]];
        } while (slow != fast);
        slow = nums[0];
        while (slow != fast) {
            slow = nums[slow];
            fast = nums[fast];
        }
        return slow;
    }
};`,
      explanation: [
        "View i -> nums[i] as a functional graph; because two indices map to the duplicate value, the walk from index 0 enters a cycle whose entry node is exactly the duplicate.",
        "Floyd's algorithm first finds a meeting point inside the cycle with two speeds, then restarts one pointer from the start; moving both one step at a time, they meet precisely at the cycle entrance.",
        "Time: O(n). Space: O(1), array untouched.",
      ],
    },
    {
      name: "Find All Duplicates in an Array",
      difficulty: "Medium",
      variation: "All values appearing twice",
      link: "https://leetcode.com/problems/find-all-duplicates-in-an-array/",
      question: [
        "Given an integer array nums of length n where all integers are in the range [1, n] and each integer appears once or twice, return an array of all the integers that appear twice. You must write an algorithm that runs in O(n) time and uses only constant auxiliary space.",
        "Example 1:\nInput: nums = [4,3,2,7,8,2,3,1]\nOutput: [2,3]",
        "Example 2:\nInput: nums = [1,1,2]\nOutput: [1]",
        "Constraints:\n- n == nums.length\n- 1 <= n <= 10^5\n- 1 <= nums[i] <= n\n- Each element appears once or twice",
      ],
      code: `class Solution {
public:
    vector<int> findDuplicates(vector<int>& nums) {
        int n = nums.size(), i = 0;
        while (i < n) {
            if (nums[i] != nums[nums[i] - 1])
                swap(nums[i], nums[nums[i] - 1]);
            else
                ++i;
        }
        vector<int> res;
        for (int j = 0; j < n; ++j)
            if (nums[j] != j + 1)
                res.push_back(nums[j]);
        return res;
    }
};`,
      explanation: [
        "After cyclic placement, one copy of every duplicated value occupies its home index and the second copy is stuck at some other index, because the swap condition refuses to move a value onto an identical value.",
        "Each mismatched index therefore holds a duplicate (contrast with the disappeared-numbers drill, where the same scan reports the index instead of the value).",
        "Time: O(n). Space: O(1) beyond the output.",
      ],
    },
    {
      name: "Array Nesting",
      difficulty: "Medium",
      variation: "Longest permutation cycle",
      link: "https://leetcode.com/problems/array-nesting/",
      question: [
        "You are given a zero-based permutation nums of length n. Build sets s[k] = {nums[k], nums[nums[k]], nums[nums[nums[k]]], ...} stopping just before a value repeats. Return the size of the largest such set.",
        "Example 1:\nInput: nums = [5,4,0,3,1,6,2]\nOutput: 4\nExplanation: s[0] = {5, 6, 2, 0} has 4 elements.",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- 0 <= nums[i] < nums.length\n- All values of nums are unique",
      ],
      code: `class Solution {
public:
    int arrayNesting(vector<int>& nums) {
        int best = 0, n = nums.size();
        for (int i = 0; i < n; ++i) {
            int len = 0, j = i;
            while (nums[j] != -1) {
                int next = nums[j];
                nums[j] = -1;
                j = next;
                ++len;
            }
            best = max(best, len);
        }
        return best;
    }
};`,
      explanation: [
        "A permutation decomposes into disjoint cycles, and s[k] is exactly the cycle containing k, so the answer is the length of the longest cycle.",
        "Walking a cycle while stamping visited slots with -1 ensures every element is traversed once across all starts; disjointness means no cycle is ever counted twice or truncated.",
        "Time: O(n). Space: O(1), using the array itself as the visited set.",
      ],
    },
    {
      name: "Minimum Swaps to Sort",
      difficulty: "Medium",
      variation: "Counting swaps via cycle decomposition",
      link: "https://www.geeksforgeeks.org/problems/minimum-swaps/1",
      question: [
        "Given an array of n distinct integers, find the minimum number of swaps (of any two elements) required to sort the array in increasing order.",
        "Example 1:\nInput: nums = [2,8,5,4]\nOutput: 1\nExplanation: Swap 8 and 4 to get [2,4,5,8].",
        "Example 2:\nInput: nums = [10,19,6,3,5]\nOutput: 2",
        "Constraints:\n- 1 <= n <= 10^5\n- Elements are distinct\n- Values may be arbitrary integers (not necessarily 1..n)",
      ],
      code: `class Solution {
public:
    int minSwaps(vector<int>& arr) {
        int n = arr.size();
        vector<pair<int, int>> pos(n);
        for (int i = 0; i < n; ++i)
            pos[i] = {arr[i], i};
        sort(pos.begin(), pos.end());
        vector<bool> seen(n, false);
        int swaps = 0;
        for (int i = 0; i < n; ++i) {
            if (seen[i] || pos[i].second == i) continue;
            int cycleLen = 0, j = i;
            while (!seen[j]) {
                seen[j] = true;
                j = pos[j].second;
                ++cycleLen;
            }
            swaps += cycleLen - 1;
        }
        return swaps;
    }
};`,
      explanation: [
        "Sorting the (value, originalIndex) pairs reveals where each element must go, turning the problem into a permutation whose cycles can be walked exactly as in cyclic sort.",
        "A cycle of length L needs exactly L - 1 swaps: each swap can fix at most one element permanently, and placing elements around the cycle one at a time achieves that bound. Summing over cycles gives the minimum.",
        "Time: O(n log n) for the sort. Space: O(n).",
      ],
    },
    {
      name: "Missing Element in Sorted Array",
      difficulty: "Medium",
      variation: "Kth missing from a sorted range (offset counting)",
      link: "https://leetcode.com/problems/missing-element-in-sorted-array/",
      question: [
        "Given a sorted array nums of unique integers and an integer k, return the kth missing number starting from the leftmost number of the array.",
        "Example 1:\nInput: nums = [4,7,9,10], k = 1\nOutput: 5\nExplanation: The missing numbers after 4 are [5,6,8,...]; the 1st is 5.",
        "Example 2:\nInput: nums = [4,7,9,10], k = 3\nOutput: 8",
        "Constraints:\n- 1 <= nums.length <= 5 * 10^4\n- 1 <= nums[i] <= 10^7\n- nums is sorted in ascending order with unique elements\n- 1 <= k <= 10^7",
      ],
      code: `class Solution {
public:
    int missingElement(vector<int>& nums, int k) {
        int n = nums.size();
        auto missing = [&](int i) { return nums[i] - nums[0] - i; };
        if (k > missing(n - 1))
            return nums[n - 1] + k - missing(n - 1);
        int lo = 0, hi = n - 1;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (missing(mid) < k)
                lo = mid + 1;
            else
                hi = mid;
        }
        return nums[lo - 1] + k - missing(lo - 1);
    }
};`,
      explanation: [
        "In a gapless array, index i would hold nums[0] + i, so missing(i) = nums[i] - nums[0] - i counts the numbers skipped before index i. The count is monotone, enabling binary search for the first index with at least k missing.",
        "The kth missing then lies in the gap just before that index: take the last element with fewer than k missing and add the remaining shortfall. If even the last element has fewer than k missing, extend past the end.",
        "Time: O(log n). Space: O(1).",
      ],
    },
    {
      name: "Find the First K Missing Positive Numbers",
      difficulty: "Medium",
      variation: "First k missing positives from an unsorted array",
      question: [
        "Given an unsorted integer array nums (which may contain duplicates, zero, and negative numbers) and an integer k, return the first k missing positive integers in increasing order.",
        "Example 1:\nInput: nums = [3,-1,4,5,5], k = 3\nOutput: [1,2,6]\nExplanation: 1 and 2 are missing within the range, and 6 is the next missing positive beyond the array values.",
        "Example 2:\nInput: nums = [2,3,4], k = 3\nOutput: [1,5,6]",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- -10^6 <= nums[i] <= 10^6\n- 1 <= k <= 1000",
      ],
      code: `class Solution {
public:
    vector<int> firstKMissing(vector<int> nums, int k) {
        int n = nums.size(), i = 0;
        while (i < n) {
            int v = nums[i];
            if (v >= 1 && v <= n && nums[v - 1] != v)
                swap(nums[i], nums[v - 1]);
            else
                ++i;
        }
        vector<int> res;
        unordered_set<int> extras;
        for (int j = 0; j < n && (int)res.size() < k; ++j) {
            if (nums[j] != j + 1) {
                res.push_back(j + 1);
                extras.insert(nums[j]);
            }
        }
        for (int cand = n + 1; (int)res.size() < k; ++cand)
            if (!extras.count(cand))
                res.push_back(cand);
        return res;
    }
};`,
      explanation: [
        "Cyclic placement moves every value in [1, n] to its home index while ignoring out-of-range values; afterwards each mismatched index j reveals the missing positive j + 1, collected in increasing order.",
        "If fewer than k are missing inside [1, n], continue counting upward from n + 1, skipping values that were stranded at mismatched slots (they exist in the array even though they are above n at those positions).",
        "Time: O(n + k). Space: O(k) for the extras set.",
      ],
    },
    {
      name: "First Missing Positive",
      difficulty: "Hard",
      variation: "Smallest missing positive with arbitrary values",
      link: "https://leetcode.com/problems/first-missing-positive/",
      question: [
        "Given an unsorted integer array nums, return the smallest positive integer that is not present in nums. You must implement an algorithm that runs in O(n) time and uses O(1) auxiliary space.",
        "Example 1:\nInput: nums = [1,2,0]\nOutput: 3",
        "Example 2:\nInput: nums = [3,4,-1,1]\nOutput: 2",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- -2^31 <= nums[i] <= 2^31 - 1",
      ],
      code: `class Solution {
public:
    int firstMissingPositive(vector<int>& nums) {
        int n = nums.size(), i = 0;
        while (i < n) {
            int v = nums[i];
            if (v >= 1 && v <= n && nums[v - 1] != v)
                swap(nums[i], nums[v - 1]);
            else
                ++i;
        }
        for (int j = 0; j < n; ++j)
            if (nums[j] != j + 1)
                return j + 1;
        return n + 1;
    }
};`,
      explanation: [
        "The answer must lie in [1, n + 1], because n slots cannot contain all of 1..n+1. So only values in [1, n] matter; cyclic placement swaps each such value to index value - 1 and skips negatives, zeros, values above n, and duplicates.",
        "The guard nums[v - 1] != v prevents infinite swapping on duplicates. The first index not holding its own value is the answer; if all match, the array is exactly 1..n and the answer is n + 1.",
        "Time: O(n) since each swap permanently settles one value. Space: O(1).",
      ],
    },
    {
      name: "Couples Holding Hands",
      difficulty: "Hard",
      variation: "Index placement with a position map (swap to home pair)",
      link: "https://leetcode.com/problems/couples-holding-hands/",
      question: [
        "There are n couples sitting in 2n seats arranged in a row, and they want to hold hands. The people are given by row, where row[i] is the ID of the person in the ith seat. Couples are numbered so that persons 2k and 2k + 1 form a couple. Return the minimum number of swaps (any two people may swap) so that every couple sits side by side.",
        "Example 1:\nInput: row = [0,2,1,3]\nOutput: 1\nExplanation: Swap the persons at seats 1 and 2 to get [0,1,2,3].",
        "Example 2:\nInput: row = [3,2,0,1]\nOutput: 0",
        "Constraints:\n- 2n == row.length\n- 2 <= n <= 30\n- n is even in seat count terms (row length is even)\n- 0 <= row[i] < 2n, all values distinct",
      ],
      code: `class Solution {
public:
    int minSwapsCouples(vector<int>& row) {
        int n = row.size();
        vector<int> pos(n);
        for (int i = 0; i < n; ++i)
            pos[row[i]] = i;
        int swaps = 0;
        for (int i = 0; i < n; i += 2) {
            int partner = row[i] ^ 1;
            if (row[i + 1] != partner) {
                int j = pos[partner];
                pos[row[i + 1]] = j;
                pos[partner] = i + 1;
                swap(row[i + 1], row[j]);
                ++swaps;
            }
        }
        return swaps;
    }
};`,
      explanation: [
        "Person p's partner is p XOR 1. Walk the seats two at a time; whenever the partner is not adjacent, swap the partner into the adjacent seat using a live position map, exactly like cyclic sort placing a value at its home index.",
        "Greedy is optimal by the cycle argument: viewing couches as graph nodes joined when they share members of a couple, a component of size L needs exactly L - 1 swaps, and each greedy swap completes one couple without splitting any other component further.",
        "Time: O(n). Space: O(n) for the position map.",
      ],
    },
  ],
};
