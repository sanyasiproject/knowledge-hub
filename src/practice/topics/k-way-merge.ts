import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Merge Two Sorted Lists",
      difficulty: "Easy",
      variation: "Two-way merge of linked lists",
      link: "https://leetcode.com/problems/merge-two-sorted-lists/",
      question: [
        "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists into one sorted list by splicing together the nodes of the input lists, and return the head of the merged list.",
        "Example 1:\nInput: list1 = [1,2,4], list2 = [1,3,4]\nOutput: [1,1,2,3,4,4]",
        "Example 2:\nInput: list1 = [], list2 = [0]\nOutput: [0]",
        "Constraints:\n- The number of nodes in both lists is in the range [0, 50]\n- -100 <= Node.val <= 100\n- Both lists are sorted in non-decreasing order",
      ],
      code: `ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
    ListNode dummy(0);
    ListNode* tail = &dummy;
    while (list1 && list2) {
        if (list1->val <= list2->val) {
            tail->next = list1;
            list1 = list1->next;
        } else {
            tail->next = list2;
            list2 = list2->next;
        }
        tail = tail->next;
    }
    tail->next = list1 ? list1 : list2;
    return dummy.next;
}`,
      explanation: [
        "This is the k = 2 base case of k-way merge: repeatedly take the smaller of the two front nodes and splice it onto the result tail behind a dummy head.",
        "The invariant is that everything already spliced is sorted and no larger than either remaining front, so appending the smaller front preserves order. The leftover list is appended wholesale.",
        "Time: O(m + n). Space: O(1).",
      ],
    },
    {
      name: "Merge Sorted Array",
      difficulty: "Easy",
      variation: "In-place two-way merge from the back",
      link: "https://leetcode.com/problems/merge-sorted-array/",
      question: [
        "You are given two integer arrays nums1 and nums2 sorted in non-decreasing order, and integers m and n. nums1 has length m + n where the last n slots are zero placeholders. Merge nums2 into nums1 so nums1 becomes the full sorted array, in place.",
        "Example 1:\nInput: nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3\nOutput: [1,2,2,3,5,6]",
        "Constraints:\n- nums1.length == m + n, nums2.length == n\n- 0 <= m, n <= 200, 1 <= m + n <= 200\n- -10^9 <= nums1[i], nums2[j] <= 10^9",
      ],
      code: `void merge(vector<int>& nums1, int m, vector<int>& nums2, int n) {
    int i = m - 1, j = n - 1, k = m + n - 1;
    while (j >= 0) {
        if (i >= 0 && nums1[i] > nums2[j]) {
            nums1[k--] = nums1[i--];
        } else {
            nums1[k--] = nums2[j--];
        }
    }
}`,
      explanation: [
        "Merging forward would overwrite unread values of nums1, so merge backwards: fill the largest remaining value into the last free slot.",
        "The write index k always stays ahead of the read index i (k - i = j + 1 > 0 while nums2 has elements), so no unread element is ever clobbered. When nums2 is exhausted the remaining nums1 prefix is already in place.",
        "Time: O(m + n). Space: O(1).",
      ],
    },
    {
      name: "Merge Two 2D Arrays by Summing Values",
      difficulty: "Easy",
      variation: "Merge keyed streams with combine step",
      link: "https://leetcode.com/problems/merge-two-2d-arrays-by-summing-values/",
      question: [
        "You are given two 2D arrays nums1 and nums2 where each element is [id, value], each array is sorted strictly ascending by id, and ids are unique within each array. Merge them into one array sorted by id where an id present in both arrays gets the sum of its two values.",
        "Example 1:\nInput: nums1 = [[1,2],[2,3],[4,5]], nums2 = [[1,4],[3,2],[4,1]]\nOutput: [[1,6],[2,3],[3,2],[4,6]]",
        "Constraints:\n- 1 <= nums1.length, nums2.length <= 200\n- 1 <= id, value <= 1000\n- Both arrays are strictly increasing by id",
      ],
      code: `vector<vector<int>> mergeArrays(vector<vector<int>>& nums1, vector<vector<int>>& nums2) {
    vector<vector<int>> res;
    int i = 0, j = 0;
    int n1 = nums1.size(), n2 = nums2.size();
    while (i < n1 && j < n2) {
        if (nums1[i][0] < nums2[j][0]) {
            res.push_back(nums1[i++]);
        } else if (nums1[i][0] > nums2[j][0]) {
            res.push_back(nums2[j++]);
        } else {
            res.push_back({nums1[i][0], nums1[i][1] + nums2[j][1]});
            i++;
            j++;
        }
    }
    while (i < n1) res.push_back(nums1[i++]);
    while (j < n2) res.push_back(nums2[j++]);
    return res;
}`,
      explanation: [
        "A classic two-pointer merge with a third branch: when both fronts carry the same id, emit one combined record and advance both pointers.",
        "This is the merge-join pattern used in databases and log compaction: sorted keyed inputs merge in linear time while aggregating duplicate keys.",
        "Time: O(n1 + n2). Space: O(1) beyond the output.",
      ],
    },
    {
      name: "Sort a K-Sorted Array",
      difficulty: "Easy",
      variation: "Sliding min-heap of size k + 1",
      link: "https://www.geeksforgeeks.org/nearly-sorted-algorithm/",
      question: [
        "Given an array of n integers where each element is at most k positions away from its position in the fully sorted array, sort the array efficiently (faster than a general comparison sort when k is small).",
        "Example 1:\nInput: arr = [6,5,3,2,8,10,9], k = 3\nOutput: [2,3,5,6,8,9,10]",
        "Constraints:\n- 1 <= n <= 10^6\n- 0 <= k < n",
      ],
      code: `vector<int> sortKSortedArray(vector<int>& arr, int k) {
    priority_queue<int, vector<int>, greater<int>> pq;
    vector<int> res;
    res.reserve(arr.size());
    for (int x : arr) {
        pq.push(x);
        if ((int)pq.size() > k + 1) {
            res.push_back(pq.top());
            pq.pop();
        }
    }
    while (!pq.empty()) {
        res.push_back(pq.top());
        pq.pop();
    }
    return res;
}`,
      explanation: [
        "The element belonging at output position i must lie within the first i + k + 1 input elements, so a min-heap holding a sliding window of k + 1 candidates always contains the correct next output at its top.",
        "Push each element, and once the heap exceeds k + 1 entries, pop the minimum into the output; drain the heap at the end. This is the same bounded-buffer idea behind replacement selection in external sorting.",
        "Time: O(n log k). Space: O(k).",
      ],
    },
    {
      name: "Merge K Sorted Arrays",
      difficulty: "Medium",
      variation: "Canonical k-way merge over arrays",
      link: "https://www.geeksforgeeks.org/merge-k-sorted-arrays/",
      question: [
        "Given k sorted integer arrays (possibly of different lengths), merge them into a single sorted array.",
        "Example 1:\nInput: arrays = [[1,4,7],[2,5],[3,6,8,9]]\nOutput: [1,2,3,4,5,6,7,8,9]",
        "Constraints:\n- 1 <= k <= 10^4\n- Total number of elements N <= 10^6\n- Each input array is sorted in non-decreasing order",
      ],
      code: `vector<int> mergeKArrays(vector<vector<int>>& arrays) {
    using T = tuple<int, int, int>;
    priority_queue<T, vector<T>, greater<T>> pq;
    for (int a = 0; a < (int)arrays.size(); a++) {
        if (!arrays[a].empty()) pq.push({arrays[a][0], a, 0});
    }
    vector<int> res;
    while (!pq.empty()) {
        auto [val, a, i] = pq.top();
        pq.pop();
        res.push_back(val);
        if (i + 1 < (int)arrays[a].size()) {
            pq.push({arrays[a][i + 1], a, i + 1});
        }
    }
    return res;
}`,
      explanation: [
        "Seed a min-heap with the head of every array as a (value, array index, element index) tuple. Repeatedly pop the global minimum and push that array's next element.",
        "The invariant is that the heap always holds the current front of every non-exhausted array, so each pop emits the smallest remaining element overall. Each element enters and leaves the heap exactly once.",
        "Time: O(N log k). Space: O(k) beyond the output.",
      ],
    },
    {
      name: "Kth Smallest Element in a Sorted Matrix",
      difficulty: "Medium",
      variation: "K-way merge of matrix rows, stop at k",
      link: "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/",
      question: [
        "Given an n x n matrix where each row and each column is sorted ascending, return the kth smallest element in the matrix counting duplicates.",
        "Example 1:\nInput: matrix = [[1,5,9],[10,11,13],[12,13,15]], k = 8\nOutput: 13",
        "Constraints:\n- n == matrix.length == matrix[i].length\n- 1 <= n <= 300\n- -10^9 <= matrix[i][j] <= 10^9\n- 1 <= k <= n^2",
      ],
      code: `int kthSmallest(vector<vector<int>>& matrix, int k) {
    int n = matrix.size();
    using T = tuple<int, int, int>;
    priority_queue<T, vector<T>, greater<T>> pq;
    for (int r = 0; r < min(n, k); r++) {
        pq.push({matrix[r][0], r, 0});
    }
    int ans = 0;
    for (int t = 0; t < k; t++) {
        auto [val, r, c] = pq.top();
        pq.pop();
        ans = val;
        if (c + 1 < n) pq.push({matrix[r][c + 1], r, c + 1});
    }
    return ans;
}`,
      explanation: [
        "The n sorted rows are n sorted lists; run a k-way merge but stop after popping k elements instead of merging everything.",
        "Seeding only min(n, k) rows is safe because the kth smallest element cannot come from a row whose first element already has k smaller-or-equal elements above it.",
        "Time: O(k log n). Space: O(n).",
      ],
    },
    {
      name: "Find K Pairs with Smallest Sums",
      difficulty: "Medium",
      variation: "Merge implicit sorted lists of pair sums",
      link: "https://leetcode.com/problems/find-k-pairs-with-smallest-sums/",
      question: [
        "Given two integer arrays nums1 and nums2 sorted ascending and an integer k, return the k pairs (u, v) with the smallest sums, where u is from nums1 and v is from nums2.",
        "Example 1:\nInput: nums1 = [1,7,11], nums2 = [2,4,6], k = 3\nOutput: [[1,2],[1,4],[1,6]]",
        "Example 2:\nInput: nums1 = [1,1,2], nums2 = [1,2,3], k = 2\nOutput: [[1,1],[1,1]]",
        "Constraints:\n- 1 <= nums1.length, nums2.length <= 10^5\n- -10^9 <= nums1[i], nums2[i] <= 10^9\n- 1 <= k <= 10^4",
      ],
      code: `vector<vector<int>> kSmallestPairs(vector<int>& nums1, vector<int>& nums2, int k) {
    using T = tuple<long long, int, int>;
    priority_queue<T, vector<T>, greater<T>> pq;
    for (int i = 0; i < (int)nums1.size() && i < k; i++) {
        pq.push({(long long)nums1[i] + nums2[0], i, 0});
    }
    vector<vector<int>> res;
    while ((int)res.size() < k && !pq.empty()) {
        auto [sum, i, j] = pq.top();
        pq.pop();
        res.push_back({nums1[i], nums2[j]});
        if (j + 1 < (int)nums2.size()) {
            pq.push({(long long)nums1[i] + nums2[j + 1], i, j + 1});
        }
    }
    return res;
}`,
      explanation: [
        "Each fixed element of nums1 defines an implicit sorted list of sums nums1[i] + nums2[j] over increasing j. The problem is then a k-way merge of those lists, stopped after k pops.",
        "Seed the heap with the first pair of each of the first min(k, len1) lists; whenever a pair (i, j) is emitted, its in-list successor (i, j + 1) is pushed, so the heap always holds every list's current front. Long long guards against sum overflow.",
        "Time: O(k log k). Space: O(k).",
      ],
    },
    {
      name: "Super Ugly Number",
      difficulty: "Medium",
      variation: "K-way merge of implicit multiple streams",
      link: "https://leetcode.com/problems/super-ugly-number/",
      question: [
        "A super ugly number is a positive integer whose prime factors are all in the given array primes. Given n and primes, return the nth super ugly number. The sequence starts with 1.",
        "Example 1:\nInput: n = 12, primes = [2,7,13,19]\nOutput: 32\nExplanation: The sequence is [1,2,4,7,8,13,14,16,19,26,28,32].",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= primes.length <= 100\n- 2 <= primes[i] <= 1000, primes[i] is prime\n- The nth super ugly number fits in a 32-bit signed integer",
      ],
      code: `int nthSuperUglyNumber(int n, vector<int>& primes) {
    int m = primes.size();
    vector<long long> ugly(n);
    ugly[0] = 1;
    vector<int> ptr(m, 0);
    vector<long long> nxt(m);
    for (int j = 0; j < m; j++) nxt[j] = primes[j];
    for (int i = 1; i < n; i++) {
        long long mn = nxt[0];
        for (int j = 1; j < m; j++) mn = min(mn, nxt[j]);
        ugly[i] = mn;
        for (int j = 0; j < m; j++) {
            if (nxt[j] == mn) {
                ptr[j]++;
                nxt[j] = (long long)primes[j] * ugly[ptr[j]];
            }
        }
    }
    return (int)ugly[n - 1];
}`,
      explanation: [
        "Each prime p defines an implicit sorted stream p * ugly[0], p * ugly[1], and so on. The next super ugly number is always the minimum over the current front of these m streams, which is exactly a k-way merge that feeds back into itself.",
        "Advancing every stream whose front equals the chosen minimum deduplicates values produced by multiple primes. Each stream pointer only moves forward through the ugly array, bounding total work.",
        "Time: O(n * m). Space: O(n + m).",
      ],
    },
    {
      name: "Kth Smallest Number in M Sorted Lists",
      difficulty: "Medium",
      variation: "Truncated k-way merge drill",
      question: [
        "Given m sorted integer lists and an integer k, return the kth smallest number across all lists combined (counting duplicates). It is guaranteed the lists contain at least k numbers in total.",
        "Example 1:\nInput: lists = [[2,6,8],[3,6,7],[1,3,4]], k = 5\nOutput: 4\nExplanation: The merged order starts 1, 2, 3, 3, 4, so the 5th smallest is 4.",
        "Constraints:\n- 1 <= m <= 10^4\n- 1 <= k <= total number of elements\n- Each list is sorted in non-decreasing order",
      ],
      code: `int kthSmallestInLists(vector<vector<int>>& lists, int k) {
    using T = tuple<int, int, int>;
    priority_queue<T, vector<T>, greater<T>> pq;
    for (int a = 0; a < (int)lists.size(); a++) {
        if (!lists[a].empty()) pq.push({lists[a][0], a, 0});
    }
    int ans = 0;
    for (int t = 0; t < k; t++) {
        auto [val, a, i] = pq.top();
        pq.pop();
        ans = val;
        if (i + 1 < (int)lists[a].size()) {
            pq.push({lists[a][i + 1], a, i + 1});
        }
    }
    return ans;
}`,
      explanation: [
        "Run the standard k-way merge but stop after the kth pop. Because each pop emits the globally smallest remaining element, the kth pop is the kth smallest overall.",
        "This truncated merge is the template behind many derived problems, including kth smallest in a sorted matrix and k smallest pair sums.",
        "Time: O(k log m + m log m) for the pops plus seeding. Space: O(m).",
      ],
    },
    {
      name: "Kth Smallest Prime Fraction",
      difficulty: "Medium",
      variation: "K-way merge over fraction lists",
      link: "https://leetcode.com/problems/k-th-smallest-prime-fraction/",
      question: [
        "You are given a sorted array arr containing 1 and unique primes, and an integer k. For every i < j consider the fraction arr[i] / arr[j]. Return the kth smallest fraction as [arr[i], arr[j]].",
        "Example 1:\nInput: arr = [1,2,3,5], k = 3\nOutput: [2,5]\nExplanation: Sorted fractions are 1/5, 1/3, 2/5, 1/2, 3/5, 2/3; the third is 2/5.",
        "Constraints:\n- 2 <= arr.length <= 1000\n- 1 <= arr[i] <= 3 * 10^4\n- arr[0] == 1, other elements are unique primes, arr is sorted\n- 1 <= k <= number of fractions",
      ],
      code: `vector<int> kthSmallestPrimeFraction(vector<int>& arr, int k) {
    int n = arr.size();
    auto cmp = [&](const pair<int, int>& a, const pair<int, int>& b) {
        return (long long)arr[a.first] * arr[b.second] >
               (long long)arr[b.first] * arr[a.second];
    };
    priority_queue<pair<int, int>, vector<pair<int, int>>, decltype(cmp)> pq(cmp);
    for (int i = 0; i + 1 < n; i++) pq.push({i, n - 1});
    for (int t = 0; t < k - 1; t++) {
        auto [i, j] = pq.top();
        pq.pop();
        if (j - 1 > i) pq.push({i, j - 1});
    }
    return {arr[pq.top().first], arr[pq.top().second]};
}`,
      explanation: [
        "For a fixed numerator index i, the fractions arr[i] / arr[j] increase as j decreases, so each i defines a sorted list starting at arr[i] / arr[n - 1]. Merge these n - 1 lists and stop at the kth element.",
        "Fractions are compared by cross-multiplication to avoid floating point error, and each popped fraction pushes its in-list successor with the next smaller denominator.",
        "Time: O((n + k) log n). Space: O(n).",
      ],
    },
    {
      name: "Merge k Sorted Lists",
      difficulty: "Hard",
      variation: "Canonical k-way merge over linked lists",
      link: "https://leetcode.com/problems/merge-k-sorted-lists/",
      question: [
        "You are given an array of k linked lists, each sorted in ascending order. Merge all the linked lists into one sorted linked list and return it.",
        "Example 1:\nInput: lists = [[1,4,5],[1,3,4],[2,6]]\nOutput: [1,1,2,3,4,4,5,6]",
        "Constraints:\n- k == lists.length, 0 <= k <= 10^4\n- 0 <= lists[i].length <= 500\n- -10^4 <= lists[i][j] <= 10^4\n- The total number of nodes will not exceed 10^4",
      ],
      code: `ListNode* mergeKLists(vector<ListNode*>& lists) {
    auto cmp = [](ListNode* a, ListNode* b) {
        return a->val > b->val;
    };
    priority_queue<ListNode*, vector<ListNode*>, decltype(cmp)> pq(cmp);
    for (ListNode* head : lists) {
        if (head) pq.push(head);
    }
    ListNode dummy(0);
    ListNode* tail = &dummy;
    while (!pq.empty()) {
        ListNode* node = pq.top();
        pq.pop();
        tail->next = node;
        tail = node;
        if (node->next) pq.push(node->next);
    }
    return dummy.next;
}`,
      explanation: [
        "Keep a min-heap of the current head node of each non-empty list. Pop the smallest node, splice it onto the result, and push its successor.",
        "The heap never exceeds k entries and always contains each remaining list's front, so every pop emits the globally smallest remaining node. Every node passes through the heap exactly once.",
        "Time: O(N log k) for N total nodes. Space: O(k).",
      ],
    },
    {
      name: "Smallest Range Covering Elements from K Lists",
      difficulty: "Hard",
      variation: "K-way sweep tracking min and max",
      link: "https://leetcode.com/problems/smallest-range-covering-elements-from-k-lists/",
      question: [
        "You have k sorted integer lists. Find the smallest range [a, b] that includes at least one number from each of the k lists. Range [a, b] is smaller than [c, d] if b - a < d - c, or b - a == d - c and a < c.",
        "Example 1:\nInput: nums = [[4,10,15,24,26],[0,9,12,20],[5,18,22,30]]\nOutput: [20,24]\nExplanation: The range [20,24] contains 24 from list 1, 20 from list 2, and 22 from list 3.",
        "Constraints:\n- nums.length == k, 1 <= k <= 3500\n- 1 <= nums[i].length <= 50\n- -10^5 <= nums[i][j] <= 10^5\n- nums[i] is sorted in non-decreasing order",
      ],
      code: `vector<int> smallestRange(vector<vector<int>>& nums) {
    using T = tuple<int, int, int>;
    priority_queue<T, vector<T>, greater<T>> pq;
    int curMax = INT_MIN;
    for (int a = 0; a < (int)nums.size(); a++) {
        pq.push({nums[a][0], a, 0});
        curMax = max(curMax, nums[a][0]);
    }
    int bestLo = 0, bestHi = INT_MAX;
    while (true) {
        auto [lo, a, i] = pq.top();
        pq.pop();
        if ((long long)curMax - lo < (long long)bestHi - bestLo) {
            bestLo = lo;
            bestHi = curMax;
        }
        if (i + 1 == (int)nums[a].size()) break;
        curMax = max(curMax, nums[a][i + 1]);
        pq.push({nums[a][i + 1], a, i + 1});
    }
    return {bestLo, bestHi};
}`,
      explanation: [
        "Maintain one cursor per list via a min-heap and separately track the maximum among the k current cursor values. At every step the window [heap minimum, current maximum] covers all lists, so it is a candidate range.",
        "The only way to shrink a window is to advance the list holding the minimum; when that list is exhausted, no further complete window exists and the best candidate seen is optimal. Popping in order also means the minimum never decreases, so candidates are explored exhaustively.",
        "Time: O(N log k) where N is the total element count. Space: O(k).",
      ],
    },
    {
      name: "Find the Kth Smallest Sum of a Matrix With Sorted Rows",
      difficulty: "Hard",
      variation: "Iterated pairwise k-way merging",
      link: "https://leetcode.com/problems/find-the-kth-smallest-sum-of-a-matrix-with-sorted-rows/",
      question: [
        "You are given an m x n matrix mat with rows sorted in non-decreasing order, and an integer k. Choose exactly one element from each row to form an array; return the kth smallest possible array sum.",
        "Example 1:\nInput: mat = [[1,3,11],[2,4,6]], k = 5\nOutput: 7\nExplanation: The smallest sums are 3, 5, 7, 7, 9; the 5th is 7 (from 1+6 or 3+4).",
        "Constraints:\n- m == mat.length, n == mat[i].length\n- 1 <= m, n <= 40\n- 1 <= mat[i][j] <= 5000\n- 1 <= k <= min(200, n^m)",
      ],
      code: `int kthSmallest(vector<vector<int>>& mat, int k) {
    vector<int> cur = {0};
    for (auto& row : mat) {
        priority_queue<int> keep;
        for (int a : cur) {
            for (int b : row) {
                int s = a + b;
                if ((int)keep.size() < k) {
                    keep.push(s);
                } else if (s < keep.top()) {
                    keep.pop();
                    keep.push(s);
                } else {
                    break;
                }
            }
        }
        cur.assign(keep.size(), 0);
        for (int i = (int)cur.size() - 1; i >= 0; i--) {
            cur[i] = keep.top();
            keep.pop();
        }
    }
    return cur[k - 1];
}`,
      explanation: [
        "Fold the rows one at a time: keep only the k smallest partial sums after each row, since any larger partial sum can never be part of one of the k smallest final sums (all matrix values are positive additions).",
        "A size-k max-heap retains the k best sums of the cross product; because each row is sorted, the inner loop can break as soon as a sum no longer beats the heap top. Draining the heap backwards leaves the partial sums sorted for the next round.",
        "Time: O(m * k * n * log k) worst case. Space: O(k).",
      ],
    },
    {
      name: "External Merge of Sorted Runs",
      difficulty: "Hard",
      variation: "External-sort style bounded-memory merge",
      question: [
        "You are given m sorted runs (chunks of a dataset that were sorted individually, as in the run-generation phase of an external sort). Each run can only be read sequentially one element at a time through a cursor. Merge all runs into a single sorted output while holding at most one buffered element per run in memory. Return the merged output.",
        "Example 1:\nInput: runs = [[1,8,9],[2,3,10],[4,7],[5,6]]\nOutput: [1,2,3,4,5,6,7,8,9,10]",
        "Constraints:\n- 1 <= m <= 10^5\n- Total number of elements N <= 10^7\n- Each run is sorted in non-decreasing order\n- Memory for buffered elements is limited to O(m)",
      ],
      code: `vector<int> externalMerge(vector<vector<int>>& runs) {
    struct Cursor {
        int value;
        int run;
        int pos;
    };
    auto cmp = [](const Cursor& a, const Cursor& b) {
        return a.value > b.value;
    };
    priority_queue<Cursor, vector<Cursor>, decltype(cmp)> pq(cmp);
    for (int r = 0; r < (int)runs.size(); r++) {
        if (!runs[r].empty()) pq.push({runs[r][0], r, 0});
    }
    vector<int> out;
    while (!pq.empty()) {
        Cursor c = pq.top();
        pq.pop();
        out.push_back(c.value);
        if (c.pos + 1 < (int)runs[c.run].size()) {
            pq.push({runs[c.run][c.pos + 1], c.run, c.pos + 1});
        }
    }
    return out;
}`,
      explanation: [
        "This is the merge phase of an external sort: with only one buffered element per run allowed, a loser-tree or min-heap of run cursors is the standard structure. Each cursor exposes the next unread element of its run.",
        "Popping the minimum cursor and refilling it from the same run guarantees sequential access per run (disk friendly) while emitting globally sorted output. In a real system the output would be flushed in blocks, and multi-pass merging caps m at the available buffer count.",
        "Time: O(N log m). Space: O(m) beyond the output.",
      ],
    },
    {
      name: "Kth Smallest in a Conceptually Infinite Merge",
      difficulty: "Hard",
      variation: "Lazy k-way merge of generated streams",
      question: [
        "Given a sorted array of positive integers seeds (all distinct) and an integer k, consider the infinite multiset containing seed * t for every seed and every integer t >= 1. Return the kth smallest value in this multiset, counting duplicates produced by different seeds.",
        "Example 1:\nInput: seeds = [3,5], k = 6\nOutput: 12\nExplanation: The merged stream is 3, 5, 6, 9, 10, 12, 15, 15, ... so the 6th value is 12.",
        "Constraints:\n- 1 <= seeds.length <= 100\n- 1 <= seeds[i] <= 10^4, all distinct\n- 1 <= k <= 10^6\n- The answer fits in a 64-bit signed integer",
      ],
      code: `long long kthOfInfiniteMerge(vector<int>& seeds, int k) {
    using T = pair<long long, int>;
    priority_queue<T, vector<T>, greater<T>> pq;
    for (int i = 0; i < (int)seeds.size(); i++) {
        pq.push({(long long)seeds[i], i});
    }
    long long ans = 0;
    for (int t = 0; t < k; t++) {
        auto [val, i] = pq.top();
        pq.pop();
        ans = val;
        pq.push({val + seeds[i], i});
    }
    return ans;
}`,
      explanation: [
        "Each seed defines an infinite sorted stream of its multiples. Because streams are infinite, they must be merged lazily: the heap holds exactly one frontier element per stream, and popping a value immediately pushes that stream's next multiple.",
        "This drill isolates the core k-way merge insight: you never need more than the current front of each source, no matter how long (even unbounded) the sources are. Duplicates across seeds are naturally emitted once per producing stream.",
        "Time: O(k log m + m log m). Space: O(m).",
      ],
    },
  ],
};
