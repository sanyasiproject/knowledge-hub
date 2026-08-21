import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Meeting Rooms",
      difficulty: "Easy",
      variation: "Sort by start time",
      link: "https://leetcode.com/problems/meeting-rooms/",
      question: [
        "Given an array of meeting time intervals where intervals[i] = [start_i, end_i], determine if a person could attend all meetings (no two meetings overlap).",
        "Example 1:\nInput: intervals = [[0,30],[5,10],[15,20]]\nOutput: false",
        "Example 2:\nInput: intervals = [[7,10],[2,4]]\nOutput: true",
        "Constraints:\n- 0 <= intervals.length <= 10^4\n- 0 <= start_i < end_i <= 10^6",
      ],
      code: `bool canAttendMeetings(vector<vector<int>>& intervals) {
    sort(intervals.begin(), intervals.end());
    for (size_t i = 1; i < intervals.size(); ++i) {
        if (intervals[i][0] < intervals[i - 1][1]) return false;
    }
    return true;
}`,
      explanation: [
        "After sorting by start time, any overlap must occur between adjacent intervals: if a meeting starts before the previous one ends, the schedule conflicts.",
        "Sorting reduces a quadratic all-pairs overlap check to a single linear scan.",
        "Time: O(n log n). Space: O(1) beyond sorting.",
      ],
    },
    {
      name: "Relative Sort Array",
      difficulty: "Easy",
      variation: "Custom order via counting",
      link: "https://leetcode.com/problems/relative-sort-array/",
      question: [
        "Given two arrays arr1 and arr2 where arr2 elements are distinct and all appear in arr1, sort arr1 so its elements follow the relative order in arr2; elements not in arr2 go at the end in ascending order.",
        "Example 1:\nInput: arr1 = [2,3,1,3,2,4,6,7,9,2,19], arr2 = [2,1,4,3,9,6]\nOutput: [2,2,2,1,4,3,3,9,6,7,19]",
        "Constraints:\n- 1 <= arr1.length, arr2.length <= 1000\n- 0 <= arr1[i], arr2[i] <= 1000\n- All elements of arr2 are distinct and appear in arr1",
      ],
      code: `vector<int> relativeSortArray(vector<int>& arr1, vector<int>& arr2) {
    vector<int> count(1001, 0);
    for (int x : arr1) ++count[x];
    vector<int> result;
    for (int x : arr2) {
        while (count[x]-- > 0) result.push_back(x);
    }
    for (int x = 0; x <= 1000; ++x) {
        while (count[x]-- > 0) result.push_back(x);
    }
    return result;
}`,
      explanation: [
        "The small value range (0 to 1000) makes counting sort natural: tally arr1, emit values in arr2's order first, then sweep the remaining counts in ascending value order.",
        "This avoids writing a comparator with a rank map and runs in linear time relative to input plus range.",
        "Time: O(n + m + range). Space: O(range).",
      ],
    },
    {
      name: "Counting Sort",
      difficulty: "Easy",
      variation: "Implement non-comparison sort",
      question: [
        "Implement counting sort: given an array of n integers where every value lies in [0, k], return the array sorted in ascending order without using any comparison-based sort. The sort must be stable when extended to records.",
        "Example 1:\nInput: a = [4,2,2,8,3,3,1], k = 8\nOutput: [1,2,2,3,3,4,8]",
        "Constraints:\n- 1 <= n <= 10^6\n- 0 <= a[i] <= k <= 10^6",
      ],
      code: `vector<int> countingSort(vector<int>& a, int k) {
    vector<int> count(k + 1, 0);
    for (int x : a) ++count[x];
    for (int v = 1; v <= k; ++v) count[v] += count[v - 1];
    vector<int> output(a.size());
    for (int i = (int)a.size() - 1; i >= 0; --i) {
        output[--count[a[i]]] = a[i];
    }
    return output;
}`,
      explanation: [
        "Counting sort beats the O(n log n) comparison lower bound by exploiting the bounded value range: prefix sums of the counts give each value its final position block.",
        "Filling the output from right to left preserves the input order of equal keys, which is what makes the sort stable and usable as a radix-sort subroutine.",
        "Time: O(n + k). Space: O(n + k).",
      ],
    },
    {
      name: "Sort Colors",
      difficulty: "Medium",
      variation: "Dutch national flag partition",
      link: "https://leetcode.com/problems/sort-colors/",
      question: [
        "Given an array nums with n objects colored red (0), white (1) or blue (2), sort them in-place so that objects of the same color are adjacent in the order red, white, blue. Do not use the library sort. Follow up: solve it in one pass with constant space.",
        "Example 1:\nInput: nums = [2,0,2,1,1,0]\nOutput: [0,0,1,1,2,2]",
        "Constraints:\n- 1 <= nums.length <= 300\n- nums[i] is 0, 1, or 2",
      ],
      code: `void sortColors(vector<int>& nums) {
    int low = 0, mid = 0, high = (int)nums.size() - 1;
    while (mid <= high) {
        if (nums[mid] == 0) {
            swap(nums[low++], nums[mid++]);
        } else if (nums[mid] == 2) {
            swap(nums[mid], nums[high--]);
        } else {
            ++mid;
        }
    }
}`,
      explanation: [
        "The Dutch national flag scheme keeps three regions: [0, low) holds 0s, [low, mid) holds 1s, (high, end) holds 2s, and [mid, high] is unexplored.",
        "Each step either classifies nums[mid] into a region or shrinks the unknown zone; mid does not advance after swapping with high because the swapped-in value is unexamined.",
        "Time: O(n) in one pass. Space: O(1).",
      ],
    },
    {
      name: "Merge Intervals",
      difficulty: "Medium",
      variation: "Sort then sweep",
      link: "https://leetcode.com/problems/merge-intervals/",
      question: [
        "Given an array of intervals where intervals[i] = [start_i, end_i], merge all overlapping intervals and return an array of the non-overlapping intervals that cover all the input intervals.",
        "Example 1:\nInput: intervals = [[1,3],[2,6],[8,10],[15,18]]\nOutput: [[1,6],[8,10],[15,18]]",
        "Constraints:\n- 1 <= intervals.length <= 10^4\n- 0 <= start_i <= end_i <= 10^4",
      ],
      code: `vector<vector<int>> merge(vector<vector<int>>& intervals) {
    sort(intervals.begin(), intervals.end());
    vector<vector<int>> merged;
    for (auto& interval : intervals) {
        if (!merged.empty() && interval[0] <= merged.back()[1]) {
            merged.back()[1] = max(merged.back()[1], interval[1]);
        } else {
            merged.push_back(interval);
        }
    }
    return merged;
}`,
      explanation: [
        "Sorting by start time guarantees that any interval overlapping an earlier one overlaps the most recently merged block, so a single sweep suffices.",
        "Each interval either extends the current block's end or starts a new block; the invariant is that merged always holds disjoint intervals covering everything processed so far.",
        "Time: O(n log n). Space: O(n) for the output.",
      ],
    },
    {
      name: "Custom Sort String",
      difficulty: "Medium",
      variation: "Ordering by external key",
      link: "https://leetcode.com/problems/custom-sort-string/",
      question: [
        "You are given two strings order (distinct characters) and s. Permute the characters of s so that characters appearing in order respect that order; characters not in order may be placed anywhere. Return any valid permutation.",
        "Example 1:\nInput: order = \"cba\", s = \"abcd\"\nOutput: \"cbad\"",
        "Constraints:\n- 1 <= order.length <= 26\n- 1 <= s.length <= 200\n- order and s consist of lowercase English letters\n- All characters of order are distinct",
      ],
      code: `string customSortString(string order, string s) {
    int count[26] = {0};
    for (char c : s) ++count[c - 'a'];
    string result;
    for (char c : order) {
        result.append(count[c - 'a'], c);
        count[c - 'a'] = 0;
    }
    for (int i = 0; i < 26; ++i) {
        result.append(count[i], (char)('a' + i));
    }
    return result;
}`,
      explanation: [
        "Because keys are only 26 letters, a counting-sort approach beats a comparator: tally s, emit letters following order, then flush the leftovers.",
        "The alternative is sorting s with a comparator on rank-in-order; the counting version is linear and avoids comparator subtleties for missing characters.",
        "Time: O(n + 26). Space: O(26).",
      ],
    },
    {
      name: "H-Index",
      difficulty: "Medium",
      variation: "Sorting to expose a threshold",
      link: "https://leetcode.com/problems/h-index/",
      question: [
        "Given an array citations where citations[i] is the number of citations for the i-th paper, return the researcher's h-index: the maximum h such that at least h papers have at least h citations each.",
        "Example 1:\nInput: citations = [3,0,6,1,5]\nOutput: 3\nExplanation: 3 papers have at least 3 citations each.",
        "Constraints:\n- 1 <= citations.length <= 5000\n- 0 <= citations[i] <= 1000",
      ],
      code: `int hIndex(vector<int>& citations) {
    sort(citations.begin(), citations.end(), greater<int>());
    int h = 0;
    while (h < (int)citations.size() && citations[h] >= h + 1) ++h;
    return h;
}`,
      explanation: [
        "Sorting in descending order makes the definition scannable: after sorting, the first h papers are the most cited, so 'citations[h] >= h + 1' checks whether an (h+1)-index is achievable.",
        "The scan stops at the first position where the paper's citations fall below its 1-based rank, which is exactly the maximal h.",
        "Time: O(n log n). Space: O(1) beyond sorting.",
      ],
    },
    {
      name: "Insertion Sort List",
      difficulty: "Medium",
      variation: "Insertion sort on a linked list",
      link: "https://leetcode.com/problems/insertion-sort-list/",
      question: [
        "Given the head of a singly linked list, sort the list using insertion sort and return the sorted list's head. At each step, remove one node from the input and insert it into the correct position of the sorted part.",
        "Example 1:\nInput: head = [4,2,1,3]\nOutput: [1,2,3,4]",
        "Constraints:\n- 1 <= number of nodes <= 5000\n- -5000 <= Node.val <= 5000",
      ],
      code: `struct ListNode {
    int val;
    ListNode* next;
    ListNode(int x) : val(x), next(nullptr) {}
};

ListNode* insertionSortList(ListNode* head) {
    ListNode dummy(0);
    ListNode* curr = head;
    while (curr != nullptr) {
        ListNode* next = curr->next;
        ListNode* prev = &dummy;
        while (prev->next != nullptr && prev->next->val < curr->val) {
            prev = prev->next;
        }
        curr->next = prev->next;
        prev->next = curr;
        curr = next;
    }
    return dummy.next;
}`,
      explanation: [
        "A dummy head anchors the growing sorted prefix. For each node we walk the sorted list from the front to find its insertion point, then splice it in.",
        "Linked lists suit insertion sort because splicing is O(1); the cost is the O(n) search per node since there is no backward traversal or binary search.",
        "Time: O(n^2) worst case, O(n) if nearly sorted. Space: O(1).",
      ],
    },
    {
      name: "Sort an Array",
      difficulty: "Medium",
      variation: "Implement merge sort",
      link: "https://leetcode.com/problems/sort-an-array/",
      question: [
        "Given an array of integers nums, sort it in ascending order without using built-in O(n log n) sort functions. Implement merge sort: solve in O(n log n) time with the smallest space complexity you can.",
        "Example 1:\nInput: nums = [5,2,3,1]\nOutput: [1,2,3,5]",
        "Constraints:\n- 1 <= nums.length <= 5 * 10^4\n- -5 * 10^4 <= nums[i] <= 5 * 10^4",
      ],
      code: `void mergeSort(vector<int>& nums, vector<int>& buffer, int lo, int hi) {
    if (hi - lo <= 1) return;
    int mid = lo + (hi - lo) / 2;
    mergeSort(nums, buffer, lo, mid);
    mergeSort(nums, buffer, mid, hi);
    int i = lo, j = mid, k = lo;
    while (i < mid && j < hi) {
        if (nums[i] <= nums[j]) buffer[k++] = nums[i++];
        else buffer[k++] = nums[j++];
    }
    while (i < mid) buffer[k++] = nums[i++];
    while (j < hi) buffer[k++] = nums[j++];
    for (int t = lo; t < hi; ++t) nums[t] = buffer[t];
}

vector<int> sortArray(vector<int>& nums) {
    vector<int> buffer(nums.size());
    mergeSort(nums, buffer, 0, (int)nums.size());
    return nums;
}`,
      explanation: [
        "Merge sort divides the range in half, sorts each half recursively, and merges two sorted runs in linear time. Using <= when taking from the left run keeps the sort stable.",
        "A single reusable buffer avoids allocating temporaries at every level, keeping the auxiliary space at one extra array.",
        "Time: O(n log n) guaranteed. Space: O(n) buffer plus O(log n) recursion.",
      ],
    },
    {
      name: "Sort an Array",
      difficulty: "Medium",
      variation: "Implement randomized quick sort",
      link: "https://leetcode.com/problems/sort-an-array/",
      question: [
        "Given an array of integers nums, sort it in ascending order without using built-in sort functions. Implement quick sort with a randomized pivot so adversarial inputs cannot force quadratic behaviour.",
        "Example 1:\nInput: nums = [5,1,1,2,0,0]\nOutput: [0,0,1,1,2,5]",
        "Constraints:\n- 1 <= nums.length <= 5 * 10^4\n- -5 * 10^4 <= nums[i] <= 5 * 10^4\n- Duplicates may appear many times",
      ],
      code: `void quickSort(vector<int>& nums, int lo, int hi) {
    if (lo >= hi) return;
    int pivot = nums[lo + rand() % (hi - lo + 1)];
    int lt = lo, i = lo, gt = hi;
    while (i <= gt) {
        if (nums[i] < pivot) swap(nums[lt++], nums[i++]);
        else if (nums[i] > pivot) swap(nums[i], nums[gt--]);
        else ++i;
    }
    quickSort(nums, lo, lt - 1);
    quickSort(nums, gt + 1, hi);
}

vector<int> sortArray(vector<int>& nums) {
    srand(12345);
    quickSort(nums, 0, (int)nums.size() - 1);
    return nums;
}`,
      explanation: [
        "Random pivot selection makes every input behave like an average case, giving expected O(n log n) regardless of initial order.",
        "Three-way (Dutch flag) partitioning groups elements equal to the pivot in the middle and excludes them from recursion, which is essential when the array contains many duplicates.",
        "Time: O(n log n) expected. Space: O(log n) expected recursion depth.",
      ],
    },
    {
      name: "Sort an Array",
      difficulty: "Medium",
      variation: "Implement heap sort",
      link: "https://leetcode.com/problems/sort-an-array/",
      question: [
        "Given an array of integers nums, sort it in ascending order without using built-in sort functions. Implement heap sort: build a max-heap in place, then repeatedly move the maximum to the end.",
        "Example 1:\nInput: nums = [5,2,3,1]\nOutput: [1,2,3,5]",
        "Constraints:\n- 1 <= nums.length <= 5 * 10^4\n- -5 * 10^4 <= nums[i] <= 5 * 10^4",
      ],
      code: `void siftDown(vector<int>& nums, int start, int end) {
    int root = start;
    while (2 * root + 1 < end) {
        int child = 2 * root + 1;
        if (child + 1 < end && nums[child + 1] > nums[child]) ++child;
        if (nums[root] >= nums[child]) return;
        swap(nums[root], nums[child]);
        root = child;
    }
}

vector<int> sortArray(vector<int>& nums) {
    int n = nums.size();
    for (int i = n / 2 - 1; i >= 0; --i) siftDown(nums, i, n);
    for (int end = n - 1; end > 0; --end) {
        swap(nums[0], nums[end]);
        siftDown(nums, 0, end);
    }
    return nums;
}`,
      explanation: [
        "Heapify runs bottom-up in O(n); afterwards the array satisfies the max-heap property with the largest element at index 0.",
        "Each extraction swaps the root with the last unsorted slot and restores the heap over the shrunken prefix, growing a sorted suffix. Heap sort gives a worst-case O(n log n) guarantee with no extra memory, at the cost of stability.",
        "Time: O(n log n) worst case. Space: O(1).",
      ],
    },
    {
      name: "Largest Number",
      difficulty: "Medium",
      variation: "Custom comparator",
      link: "https://leetcode.com/problems/largest-number/",
      question: [
        "Given a list of non-negative integers nums, arrange them so that they form the largest number and return it as a string.",
        "Example 1:\nInput: nums = [10,2]\nOutput: \"210\"",
        "Example 2:\nInput: nums = [3,30,34,5,9]\nOutput: \"9534330\"",
        "Constraints:\n- 1 <= nums.length <= 100\n- 0 <= nums[i] <= 10^9",
      ],
      code: `string largestNumber(vector<int>& nums) {
    vector<string> parts;
    for (int x : nums) parts.push_back(to_string(x));
    sort(parts.begin(), parts.end(), [](const string& a, const string& b) {
        return a + b > b + a;
    });
    if (parts[0] == "0") return "0";
    string result;
    for (const string& p : parts) result += p;
    return result;
}`,
      explanation: [
        "Order strings a and b by whether the concatenation a+b beats b+a. This relation is a strict weak ordering (it is transitive because comparison of a+b vs b+a behaves like comparing infinite repetitions of a and b), so std::sort is safe.",
        "Greedy concatenation in that order is optimal: swapping any adjacent out-of-order pair would produce a smaller number, so the sorted arrangement cannot be improved. The all-zeros case collapses to \"0\".",
        "Time: O(n log n * L) where L is the average digit length. Space: O(n * L).",
      ],
    },
    {
      name: "Top K Frequent Elements",
      difficulty: "Medium",
      variation: "Bucket sort by frequency",
      link: "https://leetcode.com/problems/top-k-frequent-elements/",
      question: [
        "Given an integer array nums and an integer k, return the k most frequent elements in any order. Your algorithm should be better than O(n log n).",
        "Example 1:\nInput: nums = [1,1,1,2,2,3], k = 2\nOutput: [1,2]",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- -10^4 <= nums[i] <= 10^4\n- k is in the range [1, number of unique elements]\n- The answer is guaranteed to be unique",
      ],
      code: `vector<int> topKFrequent(vector<int>& nums, int k) {
    unordered_map<int, int> freq;
    for (int x : nums) ++freq[x];
    int n = nums.size();
    vector<vector<int>> buckets(n + 1);
    for (auto& entry : freq) buckets[entry.second].push_back(entry.first);
    vector<int> result;
    for (int f = n; f >= 1 && (int)result.size() < k; --f) {
        for (int value : buckets[f]) {
            result.push_back(value);
            if ((int)result.size() == k) break;
        }
    }
    return result;
}`,
      explanation: [
        "Frequencies are integers in [1, n], so instead of comparison-sorting by frequency we drop each distinct value into bucket[frequency] and read buckets from high to low.",
        "This is bucket sort with a naturally bounded key, giving linear time where a heap solution would cost O(n log k).",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Wiggle Sort",
      difficulty: "Medium",
      variation: "One-pass local reordering",
      link: "https://leetcode.com/problems/wiggle-sort/",
      question: [
        "Given an integer array nums, reorder it in place so that nums[0] <= nums[1] >= nums[2] <= nums[3] and so on. Any valid answer is accepted. Follow up: do it in O(n) time.",
        "Example 1:\nInput: nums = [3,5,2,1,6,4]\nOutput: [3,5,1,6,2,4]\nExplanation: [1,6,2,5,3,4] is also accepted.",
        "Constraints:\n- 1 <= nums.length <= 5 * 10^4\n- 0 <= nums[i] <= 10^4",
      ],
      code: `void wiggleSort(vector<int>& nums) {
    for (size_t i = 1; i < nums.size(); ++i) {
        bool shouldBeGreater = (i % 2 == 1);
        if (shouldBeGreater ? nums[i - 1] > nums[i] : nums[i - 1] < nums[i]) {
            swap(nums[i - 1], nums[i]);
        }
    }
}`,
      explanation: [
        "Walk left to right and fix each adjacent pair to match its required direction (<= at odd positions, >= at even).",
        "Swapping to fix position i never breaks position i-1: if the pair (i-1, i) is wrong, the swapped-in value satisfies the previous constraint at least as well as the old one did, so a single pass suffices — no full sort needed.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Pancake Sorting",
      difficulty: "Medium",
      variation: "Sorting with prefix reversals",
      link: "https://leetcode.com/problems/pancake-sorting/",
      question: [
        "Given an array of integers arr (a permutation of 1..n), sort it using only pancake flips: choose k and reverse the prefix arr[0..k-1]. Return a sequence of k values that sorts the array using at most 10 * n flips.",
        "Example 1:\nInput: arr = [3,2,4,1]\nOutput: [4,2,4,3]\nExplanation: Any valid flip sequence that sorts the array is accepted.",
        "Constraints:\n- 1 <= arr.length <= 100\n- arr is a permutation of the integers from 1 to arr.length",
      ],
      code: `vector<int> pancakeSort(vector<int>& arr) {
    vector<int> flips;
    for (int size = (int)arr.size(); size > 1; --size) {
        int maxPos = 0;
        for (int i = 1; i < size; ++i) {
            if (arr[i] > arr[maxPos]) maxPos = i;
        }
        if (maxPos == size - 1) continue;
        if (maxPos > 0) {
            reverse(arr.begin(), arr.begin() + maxPos + 1);
            flips.push_back(maxPos + 1);
        }
        reverse(arr.begin(), arr.begin() + size);
        flips.push_back(size);
    }
    return flips;
}`,
      explanation: [
        "This is selection sort expressed in flips: for each suffix size, bring the largest unplaced value to the front with one flip, then flip it into its final slot with another.",
        "Each value costs at most two flips, so the sequence length is at most 2n, well under the 10n budget.",
        "Time: O(n^2). Space: O(1) beyond the output.",
      ],
    },
    {
      name: "Sort List",
      difficulty: "Medium",
      variation: "Merge sort on a linked list",
      link: "https://leetcode.com/problems/sort-list/",
      question: [
        "Given the head of a linked list, return the list after sorting it in ascending order. Follow up: can you sort it in O(n log n) time and O(1) auxiliary memory (ignoring recursion)?",
        "Example 1:\nInput: head = [4,2,1,3]\nOutput: [1,2,3,4]",
        "Constraints:\n- 0 <= number of nodes <= 5 * 10^4\n- -10^5 <= Node.val <= 10^5",
      ],
      code: `struct ListNode {
    int val;
    ListNode* next;
    ListNode(int x) : val(x), next(nullptr) {}
};

ListNode* mergeLists(ListNode* a, ListNode* b) {
    ListNode dummy(0);
    ListNode* tail = &dummy;
    while (a != nullptr && b != nullptr) {
        if (a->val <= b->val) { tail->next = a; a = a->next; }
        else { tail->next = b; b = b->next; }
        tail = tail->next;
    }
    tail->next = (a != nullptr) ? a : b;
    return dummy.next;
}

ListNode* sortList(ListNode* head) {
    if (head == nullptr || head->next == nullptr) return head;
    ListNode* slow = head;
    ListNode* fast = head->next;
    while (fast != nullptr && fast->next != nullptr) {
        slow = slow->next;
        fast = fast->next->next;
    }
    ListNode* second = slow->next;
    slow->next = nullptr;
    return mergeLists(sortList(head), sortList(second));
}`,
      explanation: [
        "Merge sort is the natural choice for linked lists: splitting via slow/fast pointers and merging by pointer splicing both avoid the random access that quick sort and heap sort rely on.",
        "Starting fast at head->next makes slow stop at the end of the first half, so a 2-node list splits 1 and 1 and recursion always terminates.",
        "Time: O(n log n). Space: O(log n) recursion; the merge itself uses no extra nodes.",
      ],
    },
    {
      name: "Wiggle Sort II",
      difficulty: "Medium",
      variation: "Strict wiggle via sort and interleave",
      link: "https://leetcode.com/problems/wiggle-sort-ii/",
      question: [
        "Given an integer array nums, reorder it so that nums[0] < nums[1] > nums[2] < nums[3] and so on (strict inequalities). You may assume the input always has a valid answer.",
        "Example 1:\nInput: nums = [1,5,1,1,6,4]\nOutput: [1,6,1,5,1,4]\nExplanation: [1,4,1,5,1,6] is also accepted.",
        "Constraints:\n- 1 <= nums.length <= 5 * 10^4\n- 0 <= nums[i] <= 5000\n- A valid answer is guaranteed to exist",
      ],
      code: `void wiggleSort(vector<int>& nums) {
    vector<int> sorted(nums);
    sort(sorted.begin(), sorted.end());
    int n = nums.size();
    int j = n - 1;
    for (int i = 1; i < n; i += 2) nums[i] = sorted[j--];
    for (int i = 0; i < n; i += 2) nums[i] = sorted[j--];
}`,
      explanation: [
        "Sort a copy, then deal the larger half of the values into odd positions and the smaller half into even positions, both taken from largest to smallest.",
        "Filling both halves in decreasing order pushes duplicates on the boundary as far apart as possible, which is what prevents equal neighbours when many values repeat — the failure mode of the naive one-pass swap on this strict variant.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Maximum Gap",
      difficulty: "Hard",
      variation: "Bucket sort / pigeonhole",
      link: "https://leetcode.com/problems/maximum-gap/",
      question: [
        "Given an integer array nums, return the maximum difference between two successive elements in its sorted form. If the array contains fewer than two elements, return 0. You must write an algorithm that runs in linear time and uses linear extra space.",
        "Example 1:\nInput: nums = [3,6,9,1]\nOutput: 3\nExplanation: Sorted form is [1,3,6,9]; the largest successive gap is 3.",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- 0 <= nums[i] <= 10^9",
      ],
      code: `int maximumGap(vector<int>& nums) {
    int n = nums.size();
    if (n < 2) return 0;
    long long lowest = *min_element(nums.begin(), nums.end());
    long long highest = *max_element(nums.begin(), nums.end());
    if (lowest == highest) return 0;
    long long width = max(1LL, (highest - lowest) / (n - 1));
    int bucketCount = (int)((highest - lowest) / width) + 1;
    vector<long long> bucketMin(bucketCount, LLONG_MAX);
    vector<long long> bucketMax(bucketCount, LLONG_MIN);
    for (int x : nums) {
        int b = (int)((x - lowest) / width);
        bucketMin[b] = min(bucketMin[b], (long long)x);
        bucketMax[b] = max(bucketMax[b], (long long)x);
    }
    long long answer = 0, prevMax = lowest;
    for (int b = 0; b < bucketCount; ++b) {
        if (bucketMin[b] == LLONG_MAX) continue;
        answer = max(answer, bucketMin[b] - prevMax);
        prevMax = bucketMax[b];
    }
    return (int)answer;
}`,
      explanation: [
        "By pigeonhole, with n numbers spread across range R, the maximum sorted gap is at least R / (n - 1). Choosing bucket width around that value guarantees the answer never occurs between two numbers inside one bucket.",
        "Therefore only gaps between the maximum of one non-empty bucket and the minimum of the next matter, and one linear pass over buckets finds the largest.",
        "Time: O(n). Space: O(n).",
      ],
    },
  ],
};
