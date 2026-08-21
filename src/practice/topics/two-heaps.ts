import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Last Stone Weight",
      difficulty: "Easy",
      variation: "Single max-heap warmup",
      link: "https://leetcode.com/problems/last-stone-weight/",
      question: [
        "You are given an array of integers stones where stones[i] is the weight of the ith stone. On each turn, pick the two heaviest stones and smash them together. If they are equal, both are destroyed; otherwise the heavier stone becomes the difference of the two weights. Return the weight of the last remaining stone, or 0 if none remain.",
        "Example 1:\nInput: stones = [2,7,4,1,8,1]\nOutput: 1\nExplanation: 8 and 7 -> 1, then 4 and 2 -> 2, then 2 and 1 -> 1, then 1 and 1 -> 0. One stone of weight 1 remains.",
        "Constraints:\n- 1 <= stones.length <= 30\n- 1 <= stones[i] <= 1000",
      ],
      code: `class Solution {
public:
    int lastStoneWeight(vector<int>& stones) {
        priority_queue<int> pq(stones.begin(), stones.end());
        while (pq.size() > 1) {
            int a = pq.top(); pq.pop();
            int b = pq.top(); pq.pop();
            if (a != b) pq.push(a - b);
        }
        return pq.empty() ? 0 : pq.top();
    }
};`,
      explanation: [
        "A max-heap always exposes the two heaviest stones at the top, so each smash is a pop-pop-push sequence and the simulation follows directly.",
        "The heap invariant guarantees we never smash the wrong pair, and each smash reduces the stone count by at least one, so the loop terminates with at most one stone.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Kth Largest Element in a Stream",
      difficulty: "Easy",
      variation: "Fixed-size min-heap over a stream",
      link: "https://leetcode.com/problems/kth-largest-element-in-a-stream/",
      question: [
        "Design a class that finds the kth largest element in a stream of integers. Implement KthLargest(k, nums) which initializes the object with the integer k and initial stream nums, and add(val) which appends val to the stream and returns the current kth largest element.",
        "Example 1:\nInput: KthLargest(3, [4,5,8,2]), add(3), add(5), add(10), add(9), add(4)\nOutput: 4, 5, 5, 8, 8",
        "Constraints:\n- 1 <= k <= 10^4\n- 0 <= nums.length <= 10^4\n- -10^4 <= nums[i], val <= 10^4\n- At most 10^4 calls to add\n- It is guaranteed that there are at least k elements when you search for the kth largest",
      ],
      code: `class KthLargest {
    priority_queue<int, vector<int>, greater<int>> pq;
    int k;
public:
    KthLargest(int k, vector<int>& nums) : k(k) {
        for (int n : nums) add(n);
    }
    int add(int val) {
        pq.push(val);
        if ((int)pq.size() > k) pq.pop();
        return pq.top();
    }
};`,
      explanation: [
        "Keep a min-heap of only the k largest elements seen so far; anything smaller than the heap top can never be the kth largest, so it is evicted immediately.",
        "The invariant is that the heap always holds exactly the top k elements, which makes the heap top the kth largest at all times.",
        "Time: O(log k) per add. Space: O(k).",
      ],
    },
    {
      name: "Kth Largest Element in an Array",
      difficulty: "Medium",
      variation: "Top-k selection with a bounded heap",
      link: "https://leetcode.com/problems/kth-largest-element-in-an-array/",
      question: [
        "Given an integer array nums and an integer k, return the kth largest element in the array. Note that it is the kth largest element in sorted order, not the kth distinct element. Solve it without fully sorting the array.",
        "Example 1:\nInput: nums = [3,2,1,5,6,4], k = 2\nOutput: 5",
        "Example 2:\nInput: nums = [3,2,3,1,2,4,5,5,6], k = 4\nOutput: 4",
        "Constraints:\n- 1 <= k <= nums.length <= 10^5\n- -10^4 <= nums[i] <= 10^4",
      ],
      code: `class Solution {
public:
    int findKthLargest(vector<int>& nums, int k) {
        priority_queue<int, vector<int>, greater<int>> pq;
        for (int n : nums) {
            pq.push(n);
            if ((int)pq.size() > k) pq.pop();
        }
        return pq.top();
    }
};`,
      explanation: [
        "Stream the array through a min-heap capped at size k; every pop removes an element that is provably smaller than at least k others.",
        "After processing all elements the heap contains exactly the k largest values, so the heap top is the answer. Quickselect gives O(n) average but the heap version is simpler and works for streams.",
        "Time: O(n log k). Space: O(k).",
      ],
    },
    {
      name: "Seat Reservation Manager",
      difficulty: "Medium",
      variation: "Min-heap of released resources",
      link: "https://leetcode.com/problems/seat-reservation-manager/",
      question: [
        "Design a system that manages the reservation state of n seats numbered from 1 to n. Implement SeatManager(n) which initializes all seats as unreserved, reserve() which fetches the smallest-numbered unreserved seat, reserves it, and returns its number, and unreserve(seatNumber) which unreserves the given seat.",
        "Example 1:\nInput: SeatManager(5), reserve(), reserve(), unreserve(2), reserve(), reserve(), reserve(), reserve(), unreserve(5)\nOutput: 1, 2, 2, 3, 4, 5",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= seatNumber <= n\n- At most 10^5 calls in total to reserve and unreserve\n- Calls are guaranteed valid",
      ],
      code: `class SeatManager {
    priority_queue<int, vector<int>, greater<int>> avail;
    int nextSeat = 1;
public:
    SeatManager(int n) {}
    int reserve() {
        if (!avail.empty()) {
            int s = avail.top();
            avail.pop();
            return s;
        }
        return nextSeat++;
    }
    void unreserve(int seatNumber) {
        avail.push(seatNumber);
    }
};`,
      explanation: [
        "Seats that were never reserved form a contiguous suffix tracked by a single counter, while seats that were released come back through a min-heap; the smallest available seat is always min(heap top, counter), and every released seat number is strictly below the counter.",
        "This lazy split avoids pushing all n seats up front and keeps both operations logarithmic.",
        "Time: O(log n) per operation. Space: O(n).",
      ],
    },
    {
      name: "Furthest Building You Can Reach",
      difficulty: "Medium",
      variation: "Greedy resource allocation with a min-heap",
      link: "https://leetcode.com/problems/furthest-building-you-can-reach/",
      question: [
        "You are given an integer array heights, some bricks, and some ladders. Moving from building i to i+1 costs nothing if the next building is not taller; otherwise you must use one ladder or (heights[i+1] - heights[i]) bricks. Return the furthest building index you can reach starting from building 0.",
        "Example 1:\nInput: heights = [4,2,7,6,9,14,12], bricks = 5, ladders = 1\nOutput: 4\nExplanation: Use bricks for the climb of 5 (2 to 7), a ladder for the climb of 3 (6 to 9), and you cannot afford the climb of 5 to reach index 5.",
        "Constraints:\n- 1 <= heights.length <= 10^5\n- 1 <= heights[i] <= 10^6\n- 0 <= bricks <= 10^9\n- 0 <= ladders <= heights.length",
      ],
      code: `class Solution {
public:
    int furthestBuilding(vector<int>& heights, int bricks, int ladders) {
        priority_queue<int, vector<int>, greater<int>> largest;
        for (int i = 0; i + 1 < (int)heights.size(); ++i) {
            int diff = heights[i + 1] - heights[i];
            if (diff <= 0) continue;
            largest.push(diff);
            if ((int)largest.size() > ladders) {
                bricks -= largest.top();
                largest.pop();
                if (bricks < 0) return i;
            }
        }
        return (int)heights.size() - 1;
    }
};`,
      explanation: [
        "Ladders should cover the largest climbs, but we do not know which climbs those are in advance, so we tentatively assign a ladder to every climb and keep the assignments in a min-heap of size at most ladders.",
        "When the heap overflows, the smallest ladder-covered climb is downgraded to bricks; at every prefix the ladders are on the largest climbs seen so far, which is exactly the optimal allocation for that prefix.",
        "Time: O(n log L) where L is the ladder count. Space: O(L).",
      ],
    },
    {
      name: "Find K Pairs with Smallest Sums",
      difficulty: "Medium",
      variation: "Kth smallest sums via frontier heap",
      link: "https://leetcode.com/problems/find-k-pairs-with-smallest-sums/",
      question: [
        "You are given two integer arrays nums1 and nums2 sorted in non-decreasing order and an integer k. Define a pair (u, v) as one element from the first array and one from the second. Return the k pairs with the smallest sums.",
        "Example 1:\nInput: nums1 = [1,7,11], nums2 = [2,4,6], k = 3\nOutput: [[1,2],[1,4],[1,6]]\nExplanation: The first 3 pairs from the sequence of all pairs sorted by sum.",
        "Constraints:\n- 1 <= nums1.length, nums2.length <= 10^5\n- -10^9 <= nums1[i], nums2[i] <= 10^9\n- Both arrays are sorted in non-decreasing order\n- 1 <= k <= 10^4",
      ],
      code: `class Solution {
public:
    vector<vector<int>> kSmallestPairs(vector<int>& nums1, vector<int>& nums2, int k) {
        using T = tuple<long long, int, int>;
        priority_queue<T, vector<T>, greater<T>> pq;
        int m = nums1.size(), n = nums2.size();
        for (int i = 0; i < min(m, k); ++i)
            pq.emplace((long long)nums1[i] + nums2[0], i, 0);
        vector<vector<int>> res;
        while (k-- > 0 && !pq.empty()) {
            auto [s, i, j] = pq.top();
            pq.pop();
            res.push_back({nums1[i], nums2[j]});
            if (j + 1 < n)
                pq.emplace((long long)nums1[i] + nums2[j + 1], i, j + 1);
        }
        return res;
    }
};`,
      explanation: [
        "Treat the pair grid as k sorted lists: row i is nums1[i] paired with nums2 in order. Seed the heap with the head of each of the first k rows, then repeatedly pop the smallest sum and push that row's next element.",
        "The heap always contains a candidate that is no larger than every unpopped pair, because each row is non-decreasing and every row head at or before the answer is in the heap, so pairs come out in globally sorted order.",
        "Time: O(k log k). Space: O(k).",
      ],
    },
    {
      name: "Kth Smallest Element in a Sorted Matrix",
      difficulty: "Medium",
      variation: "Kth smallest via merged sorted rows",
      link: "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/",
      question: [
        "Given an n x n matrix where each row and each column is sorted in ascending order, return the kth smallest element in the matrix. Note that it is the kth smallest in sorted order, not the kth distinct element.",
        "Example 1:\nInput: matrix = [[1,5,9],[10,11,13],[12,13,15]], k = 8\nOutput: 13\nExplanation: The elements in sorted order are [1,5,9,10,11,12,13,13,15]; the 8th smallest is 13.",
        "Constraints:\n- n == matrix.length == matrix[i].length\n- 1 <= n <= 300\n- -10^9 <= matrix[i][j] <= 10^9\n- 1 <= k <= n^2",
      ],
      code: `class Solution {
public:
    int kthSmallest(vector<vector<int>>& matrix, int k) {
        int n = matrix.size();
        using T = tuple<int, int, int>;
        priority_queue<T, vector<T>, greater<T>> pq;
        for (int i = 0; i < min(n, k); ++i)
            pq.emplace(matrix[i][0], i, 0);
        int ans = 0;
        while (k-- > 0) {
            auto [v, i, j] = pq.top();
            pq.pop();
            ans = v;
            if (j + 1 < n)
                pq.emplace(matrix[i][j + 1], i, j + 1);
        }
        return ans;
    }
};`,
      explanation: [
        "This is a k-way merge of the sorted rows: the heap holds one frontier cell per active row, and popping the minimum k times yields the kth smallest overall.",
        "The invariant is that the true next-smallest unvisited cell is always in the heap, since its left neighbor in the same row was popped earlier. A binary search on value achieves O(n log range) but the heap merge is the canonical pattern drill.",
        "Time: O(k log n). Space: O(n).",
      ],
    },
    {
      name: "Find Right Interval",
      difficulty: "Medium",
      variation: "Two coordinated min-heaps (heap variant)",
      link: "https://leetcode.com/problems/find-right-interval/",
      question: [
        "You are given an array of intervals where intervals[i] = [start_i, end_i] and each start is unique. The right interval for interval i is an interval j such that start_j >= end_i and start_j is minimized (i may equal j). Return an array of right-interval indices for each interval, or -1 if none exists.",
        "Example 1:\nInput: intervals = [[3,4],[2,3],[1,2]]\nOutput: [-1,0,1]\nExplanation: [3,4] has no right interval; the right interval of [2,3] is [3,4]; the right interval of [1,2] is [2,3].",
        "Constraints:\n- 1 <= intervals.length <= 2 * 10^4\n- intervals[i].length == 2\n- -10^6 <= start_i <= end_i <= 10^6\n- Each start point is unique",
      ],
      code: `class Solution {
public:
    vector<int> findRightInterval(vector<vector<int>>& intervals) {
        int n = intervals.size();
        using P = pair<int, int>;
        priority_queue<P, vector<P>, greater<P>> byEnd, byStart;
        for (int i = 0; i < n; ++i) {
            byEnd.emplace(intervals[i][1], i);
            byStart.emplace(intervals[i][0], i);
        }
        vector<int> res(n, -1);
        while (!byEnd.empty()) {
            auto [e, i] = byEnd.top();
            byEnd.pop();
            while (!byStart.empty() && byStart.top().first < e)
                byStart.pop();
            if (!byStart.empty())
                res[i] = byStart.top().second;
        }
        return res;
    }
};`,
      explanation: [
        "Process intervals in increasing order of end using one min-heap while a second min-heap serves starts. Any start smaller than the current end is useless for this and every later (larger) end, so it can be discarded permanently.",
        "After discarding, the start-heap top is the smallest start that is >= the current end, which is exactly the right interval; it is peeked, not popped, because it may also serve later ends.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Total Cost to Hire K Workers",
      difficulty: "Medium",
      variation: "Two heaps over opposite ends of an array",
      link: "https://leetcode.com/problems/total-cost-to-hire-k-workers/",
      question: [
        "You are given an array costs where costs[i] is the cost of hiring the ith worker, and integers k and candidates. In each of k hiring rounds, consider the first candidates workers and the last candidates workers still available, and hire the one with the lowest cost (break ties by smaller index). Return the total cost to hire k workers.",
        "Example 1:\nInput: costs = [17,12,10,2,7,2,11,20,8], k = 3, candidates = 4\nOutput: 11\nExplanation: Hire cost 2 (index 3), then cost 2 (index 4 after shifting), then cost 7; total 2 + 2 + 7 = 11.",
        "Constraints:\n- 1 <= costs.length <= 10^5\n- 1 <= costs[i] <= 10^5\n- 1 <= k, candidates <= costs.length",
      ],
      code: `class Solution {
public:
    long long totalCost(vector<int>& costs, int k, int candidates) {
        priority_queue<int, vector<int>, greater<int>> lo, hi;
        int i = 0, j = (int)costs.size() - 1;
        long long total = 0;
        while (k-- > 0) {
            while ((int)lo.size() < candidates && i <= j)
                lo.push(costs[i++]);
            while ((int)hi.size() < candidates && i <= j)
                hi.push(costs[j--]);
            int a = lo.empty() ? INT_MAX : lo.top();
            int b = hi.empty() ? INT_MAX : hi.top();
            if (a <= b) {
                total += a;
                lo.pop();
            } else {
                total += b;
                hi.pop();
            }
        }
        return total;
    }
};`,
      explanation: [
        "Maintain one min-heap for the front window of candidates and one for the back window. Each round compares the two heap tops, hires the cheaper (front wins ties, matching the smaller-index rule), and refills that heap from the untouched middle.",
        "The two pointers i and j guarantee no worker is ever placed in both heaps, and refilling only after a hire keeps each window at exactly the candidates cheapest eligible workers on its side.",
        "Time: O((k + candidates) log candidates). Space: O(candidates).",
      ],
    },
    {
      name: "Single-Threaded CPU",
      difficulty: "Medium",
      variation: "Event-time scheduling with an availability heap",
      link: "https://leetcode.com/problems/single-threaded-cpu/",
      question: [
        "You are given tasks where tasks[i] = [enqueueTime_i, processingTime_i]. A single-threaded CPU processes tasks one at a time: when idle, if no task is available it idles until the next enqueue time; otherwise it picks the available task with the shortest processing time (ties broken by smaller index) and runs it to completion. Return the order in which the CPU processes the tasks.",
        "Example 1:\nInput: tasks = [[1,2],[2,4],[3,2],[4,1]]\nOutput: [0,2,3,1]\nExplanation: At time 1 run task 0 until 3; at time 3 tasks 1 and 2 are available, pick 2 (shorter); then 3, then 1.",
        "Constraints:\n- tasks.length == n\n- 1 <= n <= 10^5\n- 1 <= enqueueTime_i, processingTime_i <= 10^9",
      ],
      code: `class Solution {
public:
    vector<int> getOrder(vector<vector<int>>& tasks) {
        int n = tasks.size();
        vector<int> idx(n);
        iota(idx.begin(), idx.end(), 0);
        sort(idx.begin(), idx.end(), [&](int a, int b) {
            return tasks[a][0] < tasks[b][0];
        });
        using P = pair<int, int>;
        priority_queue<P, vector<P>, greater<P>> pq;
        vector<int> order;
        long long time = 0;
        int i = 0;
        while ((int)order.size() < n) {
            while (i < n && tasks[idx[i]][0] <= time) {
                pq.emplace(tasks[idx[i]][1], idx[i]);
                ++i;
            }
            if (pq.empty()) {
                time = tasks[idx[i]][0];
                continue;
            }
            auto [dur, id] = pq.top();
            pq.pop();
            time += dur;
            order.push_back(id);
        }
        return order;
    }
};`,
      explanation: [
        "Sort task indices by enqueue time, then sweep a clock: everything enqueued at or before the current time moves into a min-heap keyed by (processingTime, index), and the heap top is always the correct next task per the tie rules.",
        "When the heap is empty the clock jumps forward to the next enqueue time, which is safe because nothing can become available in between. Time is kept in a 64-bit integer since completion times can exceed 32 bits.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Process Tasks Using Servers",
      difficulty: "Medium",
      variation: "Scheduling with two priority queues (free and busy)",
      link: "https://leetcode.com/problems/process-tasks-using-servers/",
      question: [
        "You are given arrays servers and tasks, where servers[i] is the weight of the ith server and tasks[j] is the time needed for the jth task. Task j arrives at second j and must be assigned to the free server with the smallest weight (ties by smallest index). If no server is free, the task waits for the earliest-freed server (ties by weight, then index). Return ans where ans[j] is the index of the server assigned to task j.",
        "Example 1:\nInput: servers = [3,3,2], tasks = [1,2,3,2,1,2]\nOutput: [2,2,0,2,1,2]",
        "Constraints:\n- servers.length == n, 1 <= n <= 2 * 10^5\n- tasks.length == m, 1 <= m <= 2 * 10^5\n- 1 <= servers[i], tasks[j] <= 2 * 10^5",
      ],
      code: `class Solution {
public:
    vector<int> assignTasks(vector<int>& servers, vector<int>& tasks) {
        using B = tuple<long long, int, int>;
        using F = pair<int, int>;
        priority_queue<F, vector<F>, greater<F>> freeQ;
        priority_queue<B, vector<B>, greater<B>> busyQ;
        for (int i = 0; i < (int)servers.size(); ++i)
            freeQ.emplace(servers[i], i);
        vector<int> ans(tasks.size());
        long long time = 0;
        for (int j = 0; j < (int)tasks.size(); ++j) {
            time = max(time, (long long)j);
            if (freeQ.empty())
                time = max(time, get<0>(busyQ.top()));
            while (!busyQ.empty() && get<0>(busyQ.top()) <= time) {
                auto [t, w, id] = busyQ.top();
                busyQ.pop();
                freeQ.emplace(w, id);
            }
            auto [w, id] = freeQ.top();
            freeQ.pop();
            ans[j] = id;
            busyQ.emplace(time + tasks[j], w, id);
        }
        return ans;
    }
};`,
      explanation: [
        "Two heaps model the two server states: a free heap ordered by (weight, index) and a busy heap ordered by (freeTime, weight, index). Advancing the clock migrates every server whose free time has passed from busy to free.",
        "If no server is free when a task arrives, the clock jumps to the earliest busy free-time; the busy heap's tie-break order means the migration plus free-heap ordering reproduces the problem's exact selection rules.",
        "Time: O((n + m) log n). Space: O(n).",
      ],
    },
    {
      name: "Meeting Rooms II",
      difficulty: "Medium",
      variation: "Median sweep / interval overlap with an end-time heap",
      link: "https://leetcode.com/problems/meeting-rooms-ii/",
      question: [
        "Given an array of meeting time intervals where intervals[i] = [start_i, end_i], return the minimum number of conference rooms required so that no two overlapping meetings share a room.",
        "Example 1:\nInput: intervals = [[0,30],[5,10],[15,20]]\nOutput: 2\nExplanation: [0,30] overlaps both other meetings, so two rooms are needed.",
        "Constraints:\n- 1 <= intervals.length <= 10^4\n- 0 <= start_i < end_i <= 10^6",
      ],
      code: `class Solution {
public:
    int minMeetingRooms(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end());
        priority_queue<int, vector<int>, greater<int>> ends;
        for (auto& in : intervals) {
            if (!ends.empty() && ends.top() <= in[0])
                ends.pop();
            ends.push(in[1]);
        }
        return (int)ends.size();
    }
};`,
      explanation: [
        "Sweep meetings by start time while a min-heap holds the end times of meetings currently occupying rooms. If the earliest-ending room is free by the new meeting's start, reuse it (pop then push); otherwise open a new room.",
        "The heap size at any moment equals the number of simultaneously running meetings, and its maximum is forced by the point of maximum overlap, so the final size is both achievable and necessary.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Find Median from Data Stream",
      difficulty: "Hard",
      variation: "Running median (canonical two heaps)",
      link: "https://leetcode.com/problems/find-median-from-data-stream/",
      question: [
        "Design a data structure that supports adding integers from a data stream and finding the median of all elements added so far. The median is the middle value of the sorted list, or the mean of the two middle values when the count is even.",
        "Example 1:\nInput: addNum(1), addNum(2), findMedian(), addNum(3), findMedian()\nOutput: 1.5, 2.0",
        "Constraints:\n- -10^5 <= num <= 10^5\n- There will be at least one element before findMedian is called\n- Up to 5 * 10^4 calls to addNum and findMedian",
      ],
      code: `class MedianFinder {
    priority_queue<int> lo;
    priority_queue<int, vector<int>, greater<int>> hi;
public:
    void addNum(int num) {
        lo.push(num);
        hi.push(lo.top());
        lo.pop();
        if (hi.size() > lo.size()) {
            lo.push(hi.top());
            hi.pop();
        }
    }
    double findMedian() {
        return lo.size() > hi.size() ? lo.top() : (lo.top() + hi.top()) / 2.0;
    }
};`,
      explanation: [
        "A max-heap lo holds the smaller half and a min-heap hi the larger half. Each insert flows through lo into hi and rebalances back, which simultaneously enforces the ordering (every lo element <= every hi element) and the size rule (lo has equal or one more element).",
        "With both invariants held, the median is always lo.top() for odd counts or the average of the two tops for even counts.",
        "Time: O(log n) per insert, O(1) per query. Space: O(n).",
      ],
    },
    {
      name: "Sliding Window Median",
      difficulty: "Hard",
      variation: "Sliding window median (two halves with deletion)",
      link: "https://leetcode.com/problems/sliding-window-median/",
      question: [
        "You are given an integer array nums and an integer k. A sliding window of size k moves from the left to the right of the array one position at a time. Return the median of each window.",
        "Example 1:\nInput: nums = [1,3,-1,-3,5,3,6,7], k = 3\nOutput: [1.0,-1.0,-1.0,3.0,5.0,6.0]",
        "Constraints:\n- 1 <= k <= nums.length <= 10^5\n- -2^31 <= nums[i] <= 2^31 - 1",
      ],
      code: `class Solution {
    multiset<int> lo, hi;
    void rebalance() {
        while (lo.size() > hi.size() + 1) {
            hi.insert(*lo.rbegin());
            lo.erase(prev(lo.end()));
        }
        while (hi.size() > lo.size()) {
            lo.insert(*hi.begin());
            hi.erase(hi.begin());
        }
    }
    void add(int x) {
        if (lo.empty() || x <= *lo.rbegin()) lo.insert(x);
        else hi.insert(x);
        rebalance();
    }
    void remove(int x) {
        if (!lo.empty() && x <= *lo.rbegin()) lo.erase(lo.find(x));
        else hi.erase(hi.find(x));
        rebalance();
    }
public:
    vector<double> medianSlidingWindow(vector<int>& nums, int k) {
        vector<double> res;
        for (int i = 0; i < (int)nums.size(); ++i) {
            add(nums[i]);
            if (i >= k) remove(nums[i - k]);
            if (i >= k - 1) {
                if (k % 2 == 1) res.push_back((double)*lo.rbegin());
                else res.push_back(((double)*lo.rbegin() + (double)*hi.begin()) / 2.0);
            }
        }
        return res;
    }
};`,
      explanation: [
        "The two-heaps idea needs deletions of arbitrary elements when the window slides, so each half is stored in an ordered multiset acting as a heap with erase: lo keeps the smaller half (its max at rbegin) and hi the larger half (its min at begin).",
        "After every add and remove, rebalancing restores the size invariant (lo equals hi or has one extra), so the window median is read directly off the boundary elements. Doubles are used for output since values reach 2^31 - 1.",
        "Time: O(n log k). Space: O(k).",
      ],
    },
    {
      name: "IPO",
      difficulty: "Hard",
      variation: "Maximize capital with capital-heap and profit-heap",
      link: "https://leetcode.com/problems/ipo/",
      question: [
        "You are given k, initial capital w, and arrays profits and capital describing n projects: project i requires at least capital[i] to start and yields a pure profit profits[i] added to your capital. You can complete at most k distinct projects. Return the maximum capital after at most k projects.",
        "Example 1:\nInput: k = 2, w = 0, profits = [1,2,3], capital = [0,1,1]\nOutput: 4\nExplanation: Start project 0 (capital becomes 1), then project 2 (capital becomes 4).",
        "Constraints:\n- 1 <= k <= 10^5\n- 0 <= w <= 10^9\n- n == profits.length == capital.length, 1 <= n <= 10^5\n- 0 <= profits[i] <= 10^4\n- 0 <= capital[i] <= 10^9",
      ],
      code: `class Solution {
public:
    int findMaximizedCapital(int k, int w, vector<int>& profits, vector<int>& capital) {
        int n = profits.size();
        vector<pair<int, int>> projects(n);
        for (int i = 0; i < n; ++i)
            projects[i] = {capital[i], profits[i]};
        sort(projects.begin(), projects.end());
        priority_queue<int> best;
        long long cur = w;
        int i = 0;
        while (k-- > 0) {
            while (i < n && projects[i].first <= cur)
                best.push(projects[i++].second);
            if (best.empty()) break;
            cur += best.top();
            best.pop();
        }
        return (int)cur;
    }
};`,
      explanation: [
        "Sort projects by required capital (an implicit min-heap on capital) and maintain a max-heap of profits for every project currently affordable. Each round unlocks newly affordable projects, then greedily takes the most profitable one.",
        "The greedy choice is safe because capital only grows: taking the max profit now never locks out any project that a different choice would have unlocked, since anything affordable stays affordable.",
        "Time: O(n log n + k log n). Space: O(n).",
      ],
    },
    {
      name: "Minimize Deviation in Array",
      difficulty: "Hard",
      variation: "Max-heap shrink with parity normalization",
      link: "https://leetcode.com/problems/minimize-deviation-in-array/",
      question: [
        "You are given an array nums. You may repeatedly pick any element and either divide it by 2 if it is even, or multiply it by 2 if it is odd. The deviation is the maximum difference between any two elements. Return the minimum deviation the array can have.",
        "Example 1:\nInput: nums = [1,2,3,4]\nOutput: 1\nExplanation: Transform to [2,2,3,2] then [2,2,3,4] variants; best is deviation 1 with [2,2,3,2].",
        "Constraints:\n- n == nums.length, 2 <= n <= 5 * 10^4\n- 1 <= nums[i] <= 10^9",
      ],
      code: `class Solution {
public:
    int minimumDeviation(vector<int>& nums) {
        priority_queue<int> pq;
        int lo = INT_MAX;
        for (int x : nums) {
            if (x % 2 == 1) x *= 2;
            pq.push(x);
            lo = min(lo, x);
        }
        int res = INT_MAX;
        while (pq.top() % 2 == 0) {
            int top = pq.top();
            pq.pop();
            res = min(res, top - lo);
            top /= 2;
            lo = min(lo, top);
            pq.push(top);
        }
        return min(res, pq.top() - lo);
    }
};`,
      explanation: [
        "Doubling every odd number first pushes each element to the top of its reachable range, after which the only remaining move is halving evens. From that normalized state, only shrinking the current maximum can ever reduce the deviation, so a max-heap drives the process.",
        "Each step records the current spread, halves the maximum, and updates the running minimum; the loop stops when the maximum is odd, since it can only grow from there. Every element is halved at most about 31 times, bounding the work.",
        "Time: O(n log n log M) where M is the largest value. Space: O(n).",
      ],
    },
  ],
};
