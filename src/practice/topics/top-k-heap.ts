import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Kth Largest Element in a Stream",
      difficulty: "Easy",
      variation: "Streaming kth largest with a size-k min-heap",
      link: "https://leetcode.com/problems/kth-largest-element-in-a-stream/",
      question: [
        "Design a class that finds the kth largest element in a stream of integers (kth largest in sorted order, not kth distinct). Implement KthLargest(int k, vector<int> nums) and int add(int val), which appends val to the stream and returns the current kth largest element.",
        "Example 1:\nInput: KthLargest(3, [4,5,8,2]); add(3); add(5); add(10); add(9); add(4)\nOutput: 4, 5, 5, 8, 8",
        "Constraints:\n- 1 <= k <= 10^4\n- 0 <= nums.length <= 10^4\n- -10^4 <= nums[i], val <= 10^4\n- At most 10^4 calls to add\n- It is guaranteed the stream has at least k elements when add is called",
      ],
      code: `class KthLargest {
public:
    KthLargest(int k, vector<int>& nums) : k(k) {
        for (int x : nums) add(x);
    }

    int add(int val) {
        pq.push(val);
        if ((int)pq.size() > k) pq.pop();
        return pq.top();
    }

private:
    int k;
    priority_queue<int, vector<int>, greater<int>> pq;
};`,
      explanation: [
        "Maintain a min-heap holding only the k largest values seen so far. Every new value is pushed, and if the heap exceeds size k the smallest is evicted.",
        "The invariant is that the heap always contains exactly the k largest stream elements, so its minimum (the top) is the kth largest at all times.",
        "Time: O(log k) per add. Space: O(k).",
      ],
    },
    {
      name: "Last Stone Weight",
      difficulty: "Easy",
      variation: "Repeated extract-max",
      link: "https://leetcode.com/problems/last-stone-weight/",
      question: [
        "You are given an array of stone weights. On each turn, pick the two heaviest stones x <= y and smash them: if x == y both are destroyed, otherwise the stone of weight y - x remains. Return the weight of the last remaining stone, or 0 if none remain.",
        "Example 1:\nInput: stones = [2,7,4,1,8,1]\nOutput: 1\nExplanation: 8 and 7 leave 1; 4 and 2 leave 2; 2 and 1 leave 1; 1 and 1 leave 0; final stone is 1.",
        "Constraints:\n- 1 <= stones.length <= 30\n- 1 <= stones[i] <= 1000",
      ],
      code: `int lastStoneWeight(vector<int>& stones) {
    priority_queue<int> pq(stones.begin(), stones.end());
    while (pq.size() > 1) {
        int y = pq.top(); pq.pop();
        int x = pq.top(); pq.pop();
        if (y > x) pq.push(y - x);
    }
    return pq.empty() ? 0 : pq.top();
}`,
      explanation: [
        "A max-heap gives the two heaviest stones in O(log n) each turn. Smash them and push back the difference if it is non-zero.",
        "Each smash removes at least one stone, so the loop runs at most n - 1 times.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Kth Largest Element in an Array",
      difficulty: "Medium",
      variation: "Kth largest with a size-k min-heap",
      link: "https://leetcode.com/problems/kth-largest-element-in-an-array/",
      question: [
        "Given an integer array nums and an integer k, return the kth largest element in the array (kth largest in sorted order, not kth distinct). Solve it without fully sorting the array.",
        "Example 1:\nInput: nums = [3,2,1,5,6,4], k = 2\nOutput: 5",
        "Example 2:\nInput: nums = [3,2,3,1,2,4,5,5,6], k = 4\nOutput: 4",
        "Constraints:\n- 1 <= k <= nums.length <= 10^5\n- -10^4 <= nums[i] <= 10^4",
      ],
      code: `int findKthLargest(vector<int>& nums, int k) {
    priority_queue<int, vector<int>, greater<int>> pq;
    for (int x : nums) {
        pq.push(x);
        if ((int)pq.size() > k) pq.pop();
    }
    return pq.top();
}`,
      explanation: [
        "Stream the array through a min-heap capped at size k. Anything smaller than the current k largest values is evicted immediately.",
        "After processing all elements the heap holds exactly the k largest values and its top is the answer. This beats sorting when k is much smaller than n.",
        "Time: O(n log k). Space: O(k).",
      ],
    },
    {
      name: "K Closest Points to Origin",
      difficulty: "Medium",
      variation: "K closest with a size-k max-heap",
      link: "https://leetcode.com/problems/k-closest-points-to-origin/",
      question: [
        "Given an array of points on the plane and an integer k, return the k points closest to the origin (0, 0) measured by Euclidean distance. The answer may be returned in any order.",
        "Example 1:\nInput: points = [[1,3],[-2,2]], k = 1\nOutput: [[-2,2]]\nExplanation: Squared distances are 10 and 8, so [-2,2] is closer.",
        "Constraints:\n- 1 <= k <= points.length <= 10^4\n- -10^4 <= xi, yi <= 10^4",
      ],
      code: `vector<vector<int>> kClosest(vector<vector<int>>& points, int k) {
    priority_queue<pair<long long, int>> pq;
    for (int i = 0; i < (int)points.size(); i++) {
        long long d = (long long)points[i][0] * points[i][0] +
                      (long long)points[i][1] * points[i][1];
        pq.push({d, i});
        if ((int)pq.size() > k) pq.pop();
    }
    vector<vector<int>> res;
    while (!pq.empty()) {
        res.push_back(points[pq.top().second]);
        pq.pop();
    }
    return res;
}`,
      explanation: [
        "Keep a max-heap of size k keyed by squared distance (no square roots needed, since squaring preserves order). Whenever the heap grows past k, the farthest candidate is evicted.",
        "The invariant is the mirror image of the kth-largest pattern: for k smallest items use a max-heap so the worst kept element is always on top and cheap to replace.",
        "Time: O(n log k). Space: O(k).",
      ],
    },
    {
      name: "Top K Frequent Elements",
      difficulty: "Medium",
      variation: "Frequency count + size-k min-heap",
      link: "https://leetcode.com/problems/top-k-frequent-elements/",
      question: [
        "Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order. The answer is guaranteed to be unique.",
        "Example 1:\nInput: nums = [1,1,1,2,2,3], k = 2\nOutput: [1,2]",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- -10^4 <= nums[i] <= 10^4\n- k is in the range [1, number of unique elements]",
      ],
      code: `vector<int> topKFrequent(vector<int>& nums, int k) {
    unordered_map<int, int> freq;
    for (int x : nums) freq[x]++;
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> pq;
    for (auto& [num, cnt] : freq) {
        pq.push({cnt, num});
        if ((int)pq.size() > k) pq.pop();
    }
    vector<int> res;
    while (!pq.empty()) {
        res.push_back(pq.top().second);
        pq.pop();
    }
    return res;
}`,
      explanation: [
        "Count frequencies with a hash map, then run the size-k min-heap pattern over (count, value) pairs so the least frequent kept element is always on top.",
        "Only distinct values enter the heap, so the heap work is bounded by the number of unique elements, not n.",
        "Time: O(n + u log k) where u is the number of unique values. Space: O(u).",
      ],
    },
    {
      name: "Top K Frequent Words",
      difficulty: "Medium",
      variation: "Top-k with composite tie-breaking",
      link: "https://leetcode.com/problems/top-k-frequent-words/",
      question: [
        "Given an array of strings words and an integer k, return the k most frequent strings, sorted by frequency from highest to lowest, with ties broken by lexicographical order.",
        "Example 1:\nInput: words = [\"i\",\"love\",\"leetcode\",\"i\",\"love\",\"coding\"], k = 2\nOutput: [\"i\",\"love\"]\nExplanation: Both appear twice; \"i\" comes before \"love\" alphabetically.",
        "Constraints:\n- 1 <= words.length <= 500\n- 1 <= words[i].length <= 10\n- k is in the range [1, number of unique words]",
      ],
      code: `vector<string> topKFrequent(vector<string>& words, int k) {
    unordered_map<string, int> freq;
    for (auto& w : words) freq[w]++;
    auto cmp = [](const pair<int, string>& a, const pair<int, string>& b) {
        if (a.first != b.first) return a.first > b.first;
        return a.second < b.second;
    };
    priority_queue<pair<int, string>, vector<pair<int, string>>, decltype(cmp)> pq(cmp);
    for (auto& [w, c] : freq) {
        pq.push({c, w});
        if ((int)pq.size() > k) pq.pop();
    }
    vector<string> res(pq.size());
    for (int i = (int)pq.size() - 1; i >= 0; i--) {
        res[i] = pq.top().second;
        pq.pop();
    }
    return res;
}`,
      explanation: [
        "Same size-k heap pattern, but the comparator must put the worst kept word on top: lower frequency first, and among equal frequencies the lexicographically larger word, since larger words lose ties.",
        "Popping the heap yields words from worst to best, so filling the result array backwards produces the required order without an extra sort.",
        "Time: O(n + u log k). Space: O(u).",
      ],
    },
    {
      name: "Sort Characters By Frequency",
      difficulty: "Medium",
      variation: "Full ordering by frequency via max-heap",
      link: "https://leetcode.com/problems/sort-characters-by-frequency/",
      question: [
        "Given a string s, sort it in decreasing order based on the frequency of characters and return the sorted string. Characters with equal frequency may appear in any relative order.",
        "Example 1:\nInput: s = \"tree\"\nOutput: \"eert\"\nExplanation: e appears twice, t and r once each; \"eetr\" is also valid.",
        "Constraints:\n- 1 <= s.length <= 5 * 10^5\n- s consists of uppercase and lowercase English letters and digits",
      ],
      code: `string frequencySort(string s) {
    unordered_map<char, int> freq;
    for (char c : s) freq[c]++;
    priority_queue<pair<int, char>> pq;
    for (auto& [c, cnt] : freq) pq.push({cnt, c});
    string res;
    res.reserve(s.size());
    while (!pq.empty()) {
        auto [cnt, c] = pq.top();
        pq.pop();
        res.append(cnt, c);
    }
    return res;
}`,
      explanation: [
        "Count each character, push (count, char) pairs into a max-heap, and pop them in decreasing frequency order, appending each character count times.",
        "The alphabet is bounded, so the heap holds at most 62 entries and heap operations are effectively constant.",
        "Time: O(n). Space: O(1) beyond the output.",
      ],
    },
    {
      name: "Find K Closest Elements",
      difficulty: "Medium",
      variation: "K closest to a target x",
      link: "https://leetcode.com/problems/find-k-closest-elements/",
      question: [
        "Given a sorted integer array arr, two integers k and x, return the k closest integers to x in the array, sorted in ascending order. An integer a is closer to x than b if |a - x| < |b - x|, or |a - x| == |b - x| and a < b.",
        "Example 1:\nInput: arr = [1,2,3,4,5], k = 4, x = 3\nOutput: [1,2,3,4]",
        "Example 2:\nInput: arr = [1,2,3,4,5], k = 4, x = -1\nOutput: [1,2,3,4]",
        "Constraints:\n- 1 <= k <= arr.length <= 10^4\n- arr is sorted in ascending order\n- -10^4 <= arr[i], x <= 10^4",
      ],
      code: `vector<int> findClosestElements(vector<int>& arr, int k, int x) {
    priority_queue<pair<int, int>> pq;
    for (int v : arr) {
        pq.push({abs(v - x), v});
        if ((int)pq.size() > k) pq.pop();
    }
    vector<int> res;
    while (!pq.empty()) {
        res.push_back(pq.top().second);
        pq.pop();
    }
    sort(res.begin(), res.end());
    return res;
}`,
      explanation: [
        "Keep a max-heap of (distance to x, value) capped at size k. The pair ordering evicts the entry with the largest distance, and on equal distance the larger value, which is exactly the tie-breaking rule the problem specifies.",
        "A final sort restores ascending order for the output. A binary-search sliding window is faster on this sorted input, but the heap version generalizes to unsorted data.",
        "Time: O(n log k + k log k). Space: O(k).",
      ],
    },
    {
      name: "Least Number of Unique Integers after K Removals",
      difficulty: "Medium",
      variation: "Greedy eviction of smallest counts",
      link: "https://leetcode.com/problems/least-number-of-unique-integers-after-k-removals/",
      question: [
        "Given an array of integers arr and an integer k, remove exactly k elements. Return the least number of unique integers that can remain after the removals.",
        "Example 1:\nInput: arr = [5,5,4], k = 1\nOutput: 1\nExplanation: Remove the single 4; only 5 remains.",
        "Example 2:\nInput: arr = [4,3,1,1,3,3,2], k = 3\nOutput: 2\nExplanation: Remove 4, 2 and one 1; 1 and 3 remain.",
        "Constraints:\n- 1 <= arr.length <= 10^5\n- 1 <= arr[i] <= 10^9\n- 0 <= k <= arr.length",
      ],
      code: `int findLeastNumOfUniqueInts(vector<int>& arr, int k) {
    unordered_map<int, int> freq;
    for (int x : arr) freq[x]++;
    priority_queue<int, vector<int>, greater<int>> pq;
    for (auto& [v, c] : freq) pq.push(c);
    int unique = pq.size();
    while (k > 0 && !pq.empty() && pq.top() <= k) {
        k -= pq.top();
        pq.pop();
        unique--;
    }
    return unique;
}`,
      explanation: [
        "To eliminate as many unique values as possible, always spend removals on the value with the smallest count first, which a min-heap of frequencies serves directly.",
        "The greedy choice is safe because any removal budget that can wipe out a value with a larger count could instead wipe out one with a smaller count, never doing worse.",
        "Time: O(n log u). Space: O(u).",
      ],
    },
    {
      name: "Reorganize String",
      difficulty: "Medium",
      variation: "Interleaving via max-heap on counts",
      link: "https://leetcode.com/problems/reorganize-string/",
      question: [
        "Given a string s, rearrange its characters so that no two adjacent characters are the same. Return any valid rearrangement, or an empty string if none is possible.",
        "Example 1:\nInput: s = \"aab\"\nOutput: \"aba\"",
        "Example 2:\nInput: s = \"aaab\"\nOutput: \"\"",
        "Constraints:\n- 1 <= s.length <= 500\n- s consists of lowercase English letters",
      ],
      code: `string reorganizeString(string s) {
    int cnt[26] = {0};
    for (char c : s) cnt[c - 'a']++;
    priority_queue<pair<int, char>> pq;
    for (int i = 0; i < 26; i++) {
        if (cnt[i] > ((int)s.size() + 1) / 2) return "";
        if (cnt[i] > 0) pq.push({cnt[i], (char)('a' + i)});
    }
    string res;
    while ((int)pq.size() >= 2) {
        auto [c1, a] = pq.top(); pq.pop();
        auto [c2, b] = pq.top(); pq.pop();
        res += a;
        res += b;
        if (--c1 > 0) pq.push({c1, a});
        if (--c2 > 0) pq.push({c2, b});
    }
    if (!pq.empty()) res += pq.top().second;
    return res;
}`,
      explanation: [
        "If any character appears more than ceil(n / 2) times, no arrangement exists. Otherwise repeatedly pop the two most frequent characters and append both, which guarantees the same character is never placed twice in a row.",
        "Taking two at a time keeps the counts balanced: the most frequent character can never build up enough surplus to force an adjacent repeat, and at most one character (count 1) remains at the end.",
        "Time: O(n log 26) = O(n). Space: O(1) beyond the output.",
      ],
    },
    {
      name: "Task Scheduler",
      difficulty: "Medium",
      variation: "Max-heap + cooldown queue",
      link: "https://leetcode.com/problems/task-scheduler/",
      question: [
        "You are given a list of CPU tasks labeled A to Z and an integer n. Each interval the CPU runs one task or idles, and two identical tasks must be at least n intervals apart. Return the minimum number of intervals required to finish all tasks.",
        "Example 1:\nInput: tasks = [\"A\",\"A\",\"A\",\"B\",\"B\",\"B\"], n = 2\nOutput: 8\nExplanation: A -> B -> idle -> A -> B -> idle -> A -> B.",
        "Constraints:\n- 1 <= tasks.length <= 10^4\n- tasks[i] is an uppercase English letter\n- 0 <= n <= 100",
      ],
      code: `int leastInterval(vector<char>& tasks, int n) {
    int cnt[26] = {0};
    for (char c : tasks) cnt[c - 'A']++;
    priority_queue<int> pq;
    for (int i = 0; i < 26; i++) {
        if (cnt[i] > 0) pq.push(cnt[i]);
    }
    queue<pair<int, int>> cooldown;
    int time = 0;
    while (!pq.empty() || !cooldown.empty()) {
        time++;
        if (!cooldown.empty() && cooldown.front().second <= time) {
            pq.push(cooldown.front().first);
            cooldown.pop();
        }
        if (!pq.empty()) {
            int c = pq.top() - 1;
            pq.pop();
            if (c > 0) cooldown.push({c, time + n + 1});
        }
    }
    return time;
}`,
      explanation: [
        "Greedily run the task with the highest remaining count each interval, then park it in a FIFO cooldown queue stamped with the time it becomes runnable again (current time plus n plus 1).",
        "Running the most abundant task first is optimal because it is the task most likely to force idle time later; the cooldown queue re-releases tasks in order, and ticks with an empty heap represent forced idles.",
        "Time: O(t log 26) = O(t) where t is the answer. Space: O(1).",
      ],
    },
    {
      name: "Furthest Building You Can Reach",
      difficulty: "Medium",
      variation: "Greedy resource assignment with min-heap",
      link: "https://leetcode.com/problems/furthest-building-you-can-reach/",
      question: [
        "You are given building heights, a number of bricks, and a number of ladders. Moving from building i to i + 1 costs nothing if the next building is not taller; otherwise you must use one ladder or (height difference) bricks. Return the furthest building index you can reach (0-indexed).",
        "Example 1:\nInput: heights = [4,2,7,6,9,14,12], bricks = 5, ladders = 1\nOutput: 4\nExplanation: Use bricks for the +5 climb to index 2, the ladder for the +3 climb to index 4, and stop before the +5 climb to index 5.",
        "Constraints:\n- 1 <= heights.length <= 10^5\n- 1 <= heights[i] <= 10^6\n- 0 <= bricks <= 10^9\n- 0 <= ladders <= heights.length",
      ],
      code: `int furthestBuilding(vector<int>& heights, int bricks, int ladders) {
    priority_queue<int, vector<int>, greater<int>> pq;
    for (int i = 0; i + 1 < (int)heights.size(); i++) {
        int diff = heights[i + 1] - heights[i];
        if (diff <= 0) continue;
        pq.push(diff);
        if ((int)pq.size() > ladders) {
            bricks -= pq.top();
            pq.pop();
            if (bricks < 0) return i;
        }
    }
    return (int)heights.size() - 1;
}`,
      explanation: [
        "Ladders should cover the largest climbs. Keep a min-heap of the climbs currently assigned to ladders; when it overflows the ladder count, the smallest of those climbs is downgraded to bricks.",
        "This maintains the invariant that at every position, ladders are spent on exactly the largest climbs seen so far, which is the assignment that stretches bricks furthest. The first moment bricks go negative marks the last reachable building.",
        "Time: O(n log L). Space: O(L) where L is the number of ladders.",
      ],
    },
    {
      name: "Kth Smallest Element in a Sorted Matrix",
      difficulty: "Medium",
      variation: "Kth smallest via heap over row heads",
      link: "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/",
      question: [
        "Given an n x n matrix where each row and each column is sorted in ascending order, return the kth smallest element in the matrix (in sorted order, counting duplicates).",
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
        "Treat each row as a sorted list and merge them: seed the heap with the first element of each row, then pop the global minimum k times, replacing each popped element with its right neighbor.",
        "The heap always contains the smallest not-yet-consumed candidate from every row, so the tth pop is exactly the tth smallest matrix element. Seeding only min(n, k) rows is enough because the kth smallest cannot start deeper.",
        "Time: O(k log n). Space: O(n).",
      ],
    },
    {
      name: "Ugly Number II",
      difficulty: "Medium",
      variation: "Generate ordered sequence with heap + dedup",
      link: "https://leetcode.com/problems/ugly-number-ii/",
      question: [
        "An ugly number is a positive integer whose prime factors are limited to 2, 3, and 5. Given an integer n, return the nth ugly number (the sequence starts 1, 2, 3, 4, 5, 6, 8, 10, 12, ...).",
        "Example 1:\nInput: n = 10\nOutput: 12",
        "Constraints:\n- 1 <= n <= 1690",
      ],
      code: `int nthUglyNumber(int n) {
    priority_queue<long long, vector<long long>, greater<long long>> pq;
    unordered_set<long long> seen;
    pq.push(1);
    seen.insert(1);
    long long cur = 1;
    for (int i = 0; i < n; i++) {
        cur = pq.top();
        pq.pop();
        for (long long f : {2LL, 3LL, 5LL}) {
            long long nxt = cur * f;
            if (seen.insert(nxt).second) pq.push(nxt);
        }
    }
    return (int)cur;
}`,
      explanation: [
        "Every ugly number except 1 is a previous ugly number times 2, 3, or 5. A min-heap seeded with 1 pops ugly numbers in increasing order while pushing the three children of each popped value.",
        "The hash set prevents the same product from entering the heap twice (for example 6 = 2 * 3 = 3 * 2), and long long avoids overflow on intermediate products.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Meeting Rooms II",
      difficulty: "Medium",
      variation: "Min-heap of end times",
      link: "https://leetcode.com/problems/meeting-rooms-ii/",
      question: [
        "Given an array of meeting time intervals where intervals[i] = [start, end), return the minimum number of conference rooms required so that no two overlapping meetings share a room.",
        "Example 1:\nInput: intervals = [[0,30],[5,10],[15,20]]\nOutput: 2\nExplanation: [0,30] overlaps both other meetings, so two rooms are needed.",
        "Example 2:\nInput: intervals = [[7,10],[2,4]]\nOutput: 1",
        "Constraints:\n- 1 <= intervals.length <= 10^4\n- 0 <= start < end <= 10^6",
      ],
      code: `int minMeetingRooms(vector<vector<int>>& intervals) {
    sort(intervals.begin(), intervals.end());
    priority_queue<int, vector<int>, greater<int>> ends;
    for (auto& in : intervals) {
        if (!ends.empty() && ends.top() <= in[0]) ends.pop();
        ends.push(in[1]);
    }
    return ends.size();
}`,
      explanation: [
        "Sort meetings by start time and keep a min-heap of end times, one entry per occupied room. For each meeting, if the room that frees earliest is already free, reuse it; otherwise open a new room.",
        "The heap size never shrinks below the true peak concurrency, and reusing the earliest-ending room is always safe, so the final heap size is the minimum number of rooms.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Single-Threaded CPU",
      difficulty: "Medium",
      variation: "Event simulation with availability heap",
      link: "https://leetcode.com/problems/single-threaded-cpu/",
      question: [
        "You are given tasks where tasks[i] = [enqueueTime, processingTime]. A single-threaded CPU processes at most one task at a time: when idle, it picks the available task with the shortest processing time (smallest index on ties), runs it to completion without preemption, and idles if nothing is available. Return the order in which the CPU processes the tasks (by original index).",
        "Example 1:\nInput: tasks = [[1,2],[2,4],[3,2],[4,1]]\nOutput: [0,2,3,1]\nExplanation: At time 1 run task 0 (until 3); at 3 pick task 2 (until 5); at 5 pick task 3 (until 6); finally task 1.",
        "Constraints:\n- 1 <= tasks.length <= 10^5\n- 1 <= enqueueTime, processingTime <= 10^9",
      ],
      code: `vector<int> getOrder(vector<vector<int>>& tasks) {
    int n = tasks.size();
    vector<int> idx(n);
    iota(idx.begin(), idx.end(), 0);
    sort(idx.begin(), idx.end(), [&](int a, int b) {
        return tasks[a][0] < tasks[b][0];
    });
    priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> pq;
    vector<int> order;
    order.reserve(n);
    long long time = 0;
    int i = 0;
    while ((int)order.size() < n) {
        while (i < n && tasks[idx[i]][0] <= time) {
            pq.push({(long long)tasks[idx[i]][1], idx[i]});
            i++;
        }
        if (pq.empty()) {
            time = tasks[idx[i]][0];
            continue;
        }
        auto [dur, j] = pq.top();
        pq.pop();
        time += dur;
        order.push_back(j);
    }
    return order;
}`,
      explanation: [
        "Sort task indices by enqueue time and sweep a clock. At each decision point, push every task that has arrived into a min-heap keyed by (processing time, index), then pop the best one and jump the clock past its completion.",
        "When the heap is empty the CPU idles, so the clock jumps directly to the next arrival. The pair key encodes both tie-breaking rules for free, and long long protects the running clock from overflow.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "IPO",
      difficulty: "Hard",
      variation: "Two-phase greedy with unlock + max-heap",
      link: "https://leetcode.com/problems/ipo/",
      question: [
        "You are given k, initial capital w, and arrays profits and capital, where project i requires at least capital[i] to start and yields pure profit profits[i] added to your capital. You can finish at most k distinct projects. Return the maximum capital after at most k projects.",
        "Example 1:\nInput: k = 2, w = 0, profits = [1,2,3], capital = [0,1,1]\nOutput: 4\nExplanation: Do project 0 for profit 1, unlocking projects 1 and 2; then project 2 for profit 3. Final capital is 0 + 1 + 3 = 4.",
        "Constraints:\n- 1 <= k <= 10^5\n- 0 <= w <= 10^9\n- n == profits.length == capital.length, 1 <= n <= 10^5\n- 0 <= profits[i] <= 10^4\n- 0 <= capital[i] <= 10^9",
      ],
      code: `int findMaximizedCapital(int k, int w, vector<int>& profits, vector<int>& capital) {
    int n = profits.size();
    vector<int> idx(n);
    iota(idx.begin(), idx.end(), 0);
    sort(idx.begin(), idx.end(), [&](int a, int b) {
        return capital[a] < capital[b];
    });
    priority_queue<int> pq;
    long long cur = w;
    int i = 0;
    for (int t = 0; t < k; t++) {
        while (i < n && capital[idx[i]] <= cur) {
            pq.push(profits[idx[i]]);
            i++;
        }
        if (pq.empty()) break;
        cur += pq.top();
        pq.pop();
    }
    return (int)cur;
}`,
      explanation: [
        "Sort projects by required capital. Before each of the k picks, unlock every project whose requirement is within current capital into a max-heap of profits, then greedily take the most profitable unlocked project.",
        "Capital only grows, so unlocked projects never re-lock and each project enters the heap exactly once. Taking the maximum available profit each round is optimal because profits are pure gains with no downside.",
        "Time: O(n log n + k log n). Space: O(n).",
      ],
    },
  ],
};
