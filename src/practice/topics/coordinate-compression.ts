import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Rank Transform of an Array",
      difficulty: "Easy",
      variation: "Dense ranking, the template",
      link: "https://leetcode.com/problems/rank-transform-of-an-array/",
      question: [
        "Given an array of integers arr, replace each element by its rank. The rank is an integer starting from 1 that represents how large the element is: the smallest value gets rank 1, the next distinct value gets rank 2, and equal values always get the same rank. Return the array of ranks.",
        "Example 1:\nInput: arr = [40, 10, 20, 30]\nOutput: [4, 1, 2, 3]\nExplanation: 10 is the smallest so it gets rank 1, then 20, 30, 40 get ranks 2, 3, 4.",
        "Example 2:\nInput: arr = [37, 12, 28, 9, 100, 56, 80, 5, 12]\nOutput: [5, 3, 4, 2, 8, 6, 7, 1, 3]\nExplanation: The sorted distinct values are 5, 9, 12, 28, 37, 56, 80, 100, which take ranks 1 through 8. Both copies of 12 map to rank 3.",
        "Constraints:\n- 0 <= arr.length <= 10^5\n- -10^9 <= arr[i] <= 10^9",
      ],
      code: `vector<int> arrayRankTransform(vector<int>& arr) {
    vector<int> sorted = arr;
    sort(sorted.begin(), sorted.end());
    // erase+unique is the whole compression step: sorted distinct values in place
    sorted.erase(unique(sorted.begin(), sorted.end()), sorted.end());

    vector<int> res(arr.size());
    for (size_t i = 0; i < arr.size(); i++) {
        // index of arr[i] inside the distinct list == its 0-based rank
        res[i] = (int)(lower_bound(sorted.begin(), sorted.end(), arr[i]) - sorted.begin()) + 1;
    }
    return res;
}`,
      explanation: [
        "This is coordinate compression in its purest form. The only information any later structure needs from a value is its position in the sorted order, so replace the value by that position. Copy, sort, unique, and then lower_bound gives you the map from value to rank without ever building a hash table.",
        "Why lower_bound and not upper_bound: after unique the list has no duplicates, so lower_bound lands exactly on the element equal to arr[i]. Using upper_bound would return one past it and shift every rank by one.",
        "The tempting alternative is a map<int,int> filled by iterating the sorted values. It gives the same answer but costs a pointer-chasing lookup per query and far worse cache behaviour. The sorted vector plus binary search is the version you want when this feeds a Fenwick or segment tree in a tight loop.",
        "Dense versus sparse ranking is a real decision. Here equal values must share a rank (dense), which is what unique buys you. If instead every occurrence needed its own slot you would skip unique and rank by sorted index of (value, original index) pairs.",
        "Time: O(n log n) for the sort plus O(n log n) for n binary searches. Space: O(n).",
      ],
    },
    {
      name: "Relative Ranks",
      difficulty: "Easy",
      variation: "Rank by argsort, write back by index",
      link: "https://leetcode.com/problems/relative-ranks/",
      question: [
        "You are given an integer array score of size n, where score[i] is the score of the i-th athlete in a competition. All scores are distinct. The athletes are ranked by score in decreasing order: the highest score gets place 1, the second highest place 2, and so on. The athlete in place 1 receives 'Gold Medal', place 2 receives 'Silver Medal', place 3 receives 'Bronze Medal', and every other athlete receives their place number as a string. Return an array answer where answer[i] is the award of the i-th athlete.",
        "Example 1:\nInput: score = [5, 4, 3, 2, 1]\nOutput: ['Gold Medal', 'Silver Medal', 'Bronze Medal', '4', '5']\nExplanation: The array is already in decreasing order, so athlete i is in place i+1.",
        "Example 2:\nInput: score = [10, 3, 8, 9, 4]\nOutput: ['Gold Medal', '5', 'Bronze Medal', 'Silver Medal', '4']\nExplanation: Sorted decreasing the scores are 10, 9, 8, 4, 3, so 10 is place 1, 9 is place 2, 8 is place 3, 4 is place 4 and 3 is place 5.",
        "Constraints:\n- 1 <= score.length <= 10^4\n- 0 <= score[i] <= 10^6\n- All values in score are unique",
      ],
      code: `vector<string> findRelativeRanks(vector<int>& score) {
    int n = (int)score.size();
    vector<int> idx(n);
    iota(idx.begin(), idx.end(), 0);
    // argsort: sort the indices, not the values, so the original positions survive
    sort(idx.begin(), idx.end(), [&](int a, int b) { return score[a] > score[b]; });

    vector<string> res(n);
    for (int place = 0; place < n; place++) {
        int who = idx[place];
        if (place == 0) res[who] = "Gold Medal";
        else if (place == 1) res[who] = "Silver Medal";
        else if (place == 2) res[who] = "Bronze Medal";
        else res[who] = to_string(place + 1);
    }
    return res;
}`,
      explanation: [
        "Compression has two directions and this problem needs the other one. Rank Transform asked 'given a value, what is its rank', answered by binary search. Here you want 'given a rank, which original index sits there', answered by an argsort - sort a permutation of indices by their values and read it off.",
        "The argsort is the standard way to keep the link back to the input. Sorting score itself destroys the positions, and then you would need a value-to-index map, which breaks the moment values repeat.",
        "Because the ranking is decreasing, the comparator is > rather than <. Everything else is identical to ascending compression; the direction of the order is a comparator choice, not a different algorithm.",
        "The problem guarantees distinct scores, which is why a plain permutation works. With ties you would have to decide dense ranking (equal scores share a place) or an arbitrary but stable tie-break, and the comparator would need a secondary key on the index to stay deterministic.",
        "Time: O(n log n). Space: O(n) for the index permutation and the output.",
      ],
    },
    {
      name: "Number of Flowers in Full Bloom",
      difficulty: "Medium",
      variation: "Compressed event sweep via sorted endpoints",
      link: "https://leetcode.com/problems/number-of-flowers-in-full-bloom/",
      question: [
        "You are given a 2D array flowers where flowers[i] = [start_i, end_i] means the i-th flower is in full bloom for every time t with start_i <= t <= end_i. You are also given an array people, where people[j] is the time the j-th person arrives. Return an array answer where answer[j] is the number of flowers in full bloom when person j arrives.",
        "Example 1:\nInput: flowers = [[1,6],[3,7],[9,12],[4,13]], people = [2,3,7,11]\nOutput: [1, 2, 2, 2]\nExplanation: At time 2 only [1,6] is open. At time 3 both [1,6] and [3,7] are open. At time 7 the intervals [3,7] and [4,13] are open. At time 11 the intervals [9,12] and [4,13] are open.",
        "Example 2:\nInput: flowers = [[1,10],[3,3]], people = [3,3,2]\nOutput: [2, 2, 1]\nExplanation: At time 3 both flowers are open. At time 2 only [1,10] is open.",
        "Constraints:\n- 1 <= flowers.length <= 5 * 10^4\n- 1 <= start_i <= end_i <= 10^9\n- 1 <= people.length <= 5 * 10^4\n- 1 <= people[j] <= 10^9",
      ],
      code: `vector<int> fullBloomFlowers(vector<vector<int>>& flowers, vector<int>& people) {
    vector<int> starts, ends;
    starts.reserve(flowers.size());
    ends.reserve(flowers.size());
    for (auto& f : flowers) {
        starts.push_back(f[0]);
        ends.push_back(f[1]);
    }
    sort(starts.begin(), starts.end());
    sort(ends.begin(), ends.end());

    vector<int> res;
    res.reserve(people.size());
    for (int t : people) {
        // flowers that have already opened: start <= t
        int opened = (int)(upper_bound(starts.begin(), starts.end(), t) - starts.begin());
        // flowers that have already closed: end < t
        int closed = (int)(lower_bound(ends.begin(), ends.end(), t) - ends.begin());
        res.push_back(opened - closed);
    }
    return res;
}`,
      explanation: [
        "Times run up to 10^9 so no array can be indexed by time. The realisation is that a person's answer depends only on how many endpoints lie on each side of their arrival, and counting 'how many of these numbers are <= t' is exactly a binary search into a sorted list - compression without ever assigning explicit ranks.",
        "Open at time t means started and not yet ended: (count of start <= t) minus (count of end < t). Every flower counted in the second term is also counted in the first, since start <= end, so the subtraction never goes negative.",
        "The off-by-one here is the whole problem. Intervals are closed, so a flower with end == t is still open and must NOT be subtracted: that forces lower_bound (strictly less) on ends and upper_bound (less or equal) on starts. Swap either one and Example 2, where a flower is [3,3], breaks immediately.",
        "The two sorted lists can be decoupled because the query is a point query, not a range query. If you needed the whole timeline you would instead compress all endpoints together, build a +1/-1 delta array over the compressed points, and prefix-sum it.",
        "Time: O((f + p) log f) where f is the number of flowers and p the number of people. Space: O(f).",
      ],
    },
    {
      name: "Count Inversions",
      difficulty: "Medium",
      variation: "Compression feeding a Fenwick tree",
      link: "https://www.geeksforgeeks.org/counting-inversions/",
      question: [
        "Given an array of integers, count the number of inversions. An inversion is a pair of indices (i, j) with i < j and arr[i] > arr[j]. The inversion count measures how far the array is from being sorted in increasing order.",
        "Example 1:\nInput: arr = [2, 4, 1, 3, 5]\nOutput: 3\nExplanation: The inversions are (2,1), (4,1) and (4,3).",
        "Example 2:\nInput: arr = [2, 3, 4, 5, 6]\nOutput: 0\nExplanation: The array is already sorted, so no pair is out of order.",
        "Constraints:\n- 1 <= arr.length <= 10^5\n- -10^9 <= arr[i] <= 10^9",
      ],
      code: `long long countInversions(vector<int>& arr) {
    int n = (int)arr.size();
    vector<int> vals = arr;
    sort(vals.begin(), vals.end());
    vals.erase(unique(vals.begin(), vals.end()), vals.end());
    int m = (int)vals.size();

    vector<int> bit(m + 1, 0);
    // ranks are 0-based on the outside, 1-based inside the tree
    auto add = [&](int r) { for (r++; r <= m; r += r & -r) bit[r]++; };
    auto pref = [&](int r) { long long s = 0; for (r++; r > 0; r -= r & -r) s += bit[r]; return s; };

    long long inv = 0;
    for (int i = n - 1; i >= 0; i--) {
        int r = (int)(lower_bound(vals.begin(), vals.end(), arr[i]) - vals.begin());
        if (r > 0) inv += pref(r - 1);   // already-inserted values strictly smaller than arr[i]
        add(r);
    }
    return inv;
}`,
      explanation: [
        "A Fenwick tree is an array indexed by value, so a value range of 10^9 makes it unbuildable. Compression fixes that without changing any answer: inversions depend only on the comparison arr[i] > arr[j], and ranks preserve every comparison exactly because the rank map is strictly increasing. This equivalence is the licence to compress, and it is worth stating explicitly - it fails for any query that depends on the actual magnitudes, such as differences or sums.",
        "Sweep right to left. When index i is processed the tree holds exactly the ranks of the elements to its right, so a prefix query up to rank(arr[i]) - 1 counts the j > i with arr[j] < arr[i], which is the number of inversions whose left endpoint is i. Summing over i counts every inversion once.",
        "Dense ranking (with unique) is what makes 'strictly smaller' expressible as 'prefix up to r-1'. If you kept duplicate ranks, equal values would land on different indices and the prefix would count some equal pairs as inversions.",
        "The count can reach n*(n-1)/2, about 5 * 10^9 for n = 10^5, so the accumulator must be long long. An int here silently overflows on adversarial input - a reversed array.",
        "Merge sort counts inversions too, in the same complexity and without compression. The Fenwick version is the one that generalises: swap the query and you get counts of smaller-after-self, range sums, or k-th order statistics.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "My Calendar III",
      difficulty: "Hard",
      variation: "Implicit compression with an ordered map (max overlap)",
      link: "https://leetcode.com/problems/my-calendar-iii/",
      question: [
        "Implement a MyCalendarThree class that supports booking half-open intervals. A k-booking is a set of k events that all share some common time instant. Implement book(startTime, endTime), which adds the half-open interval [startTime, endTime) to the calendar and then returns the largest k such that a k-booking exists anywhere in the calendar. Events are never rejected.",
        "Example 1:\nInput:\nMyCalendarThree()\nbook(10, 20) -> 1\nbook(50, 60) -> 1\nbook(10, 40) -> 2\nbook(5, 15) -> 3\nbook(5, 10) -> 3\nbook(25, 55) -> 3\nOutput: [1, 1, 2, 3, 3, 3]\nExplanation: After the first two disjoint bookings the maximum overlap is 1. [10,40) overlaps [10,20) so the maximum becomes 2. [5,15) overlaps both [10,20) and [10,40) on [10,15), giving 3. Neither [5,10) nor [25,55) pushes any instant above 3.",
        "Constraints:\n- 0 <= startTime < endTime <= 10^9\n- At most 400 calls to book",
      ],
      code: `class MyCalendarThree {
    // only the endpoints ever matter: an ordered map is compression maintained online
    map<int, int> delta;

public:
    MyCalendarThree() {}

    int book(int startTime, int endTime) {
        delta[startTime]++;    // one more event alive from here
        delta[endTime]--;      // half-open: it is already gone at endTime

        int cur = 0, best = 0;
        for (auto& [t, d] : delta) {   // map order == sorted coordinate order
            cur += d;
            best = max(best, cur);
        }
        return best;
    }
};`,
      explanation: [
        "The count of active events is a step function that can only change at a booking endpoint. So the only coordinates that matter are the endpoints seen so far, and walking them in sorted order while accumulating the +1/-1 deltas reproduces the whole function. An ordered map is exactly a compressed coordinate set that you can extend online, which is why it beats sorting up front when the points arrive one at a time.",
        "The half-open convention makes the boundary correct for free. Booking [5,10) and [10,20) puts a -1 and a +1 at the same key 10, they cancel inside one map slot, and the overlap at instant 10 is correctly 1 and not 2. With closed intervals you would have to place the decrement at end+1 instead.",
        "The maximum of the prefix sums is the answer because a k-booking exists if and only if some instant is covered k times, and the prefix sum at a coordinate is the coverage of the whole gap starting there.",
        "Recomputing the full sweep on every call is O(n) per call, fine at 400 calls. The scalable version is a segment tree over the compressed endpoints (offline) or a dynamic segment tree with lazy range-add and a global max (online), giving O(log C) per booking.",
        "The wrong-but-tempting approach is to store the intervals and, on each insertion, only compare the new interval against the old ones. That finds pairwise overlaps but not the point where three or more intervals happen to coincide.",
        "Time: O(n) per book call, O(n^2) over n bookings. Space: O(n).",
      ],
    },
    {
      name: "Count of Smaller Numbers After Self",
      difficulty: "Hard",
      variation: "Per-index suffix counting over ranks",
      link: "https://leetcode.com/problems/count-of-smaller-numbers-after-self/",
      question: [
        "You are given an integer array nums. Return an array counts where counts[i] is the number of indices j with j > i and nums[j] < nums[i].",
        "Example 1:\nInput: nums = [5, 2, 6, 1]\nOutput: [2, 1, 1, 0]\nExplanation: To the right of 5 there are 2 and 1, so 2 smaller. To the right of 2 there is 1, so 1 smaller. To the right of 6 there is 1, so 1 smaller. Nothing is right of 1.",
        "Example 2:\nInput: nums = [-1, -1]\nOutput: [0, 0]\nExplanation: The two values are equal, and equal is not smaller.",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- -10^4 <= nums[i] <= 10^4",
      ],
      code: `vector<int> countSmaller(vector<int>& nums) {
    int n = (int)nums.size();
    vector<int> vals = nums;
    sort(vals.begin(), vals.end());
    vals.erase(unique(vals.begin(), vals.end()), vals.end());
    int m = (int)vals.size();

    vector<int> bit(m + 1, 0);
    auto add = [&](int r) { for (r++; r <= m; r += r & -r) bit[r]++; };
    auto pref = [&](int r) { int s = 0; for (r++; r > 0; r -= r & -r) s += bit[r]; return s; };

    vector<int> res(n, 0);
    for (int i = n - 1; i >= 0; i--) {
        int r = (int)(lower_bound(vals.begin(), vals.end(), nums[i]) - vals.begin());
        res[i] = (r > 0) ? pref(r - 1) : 0;   // suffix elements with a strictly smaller rank
        add(r);
    }
    return res;
}`,
      explanation: [
        "This is the inversion count with the total broken out per index instead of summed. The sweep and the invariant are identical: process right to left, and before inserting nums[i] the tree contains exactly the suffix to its right, so one prefix query answers index i in O(log n).",
        "Order matters inside the loop body. Query first, then insert. Inserting nums[i] before querying would let an element count itself whenever the prefix bound is inclusive, and more subtly it destroys the invariant that the tree equals the strict suffix.",
        "Strictly smaller, so the query stops at rank r - 1. With duplicates collapsed into a single rank by unique, all copies of a value share r and none of them contributes to pref(r - 1) - which is exactly why Example 2 answers [0, 0]. Forget unique and equal values get different ranks, turning ties into false counts.",
        "Here the values fit in [-10^4, 10^4], so you could index a Fenwick tree by nums[i] + 10001 and skip compression entirely. Compression is what makes the same code survive a constraint change to 10^9, and it costs one sort - which is why it is the default habit rather than an optimisation.",
        "A merge sort that carries original indices also works, and a balanced BST or an order-statistic tree does too. The Fenwick version is the shortest correct one.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Reverse Pairs",
      difficulty: "Hard",
      variation: "Query key outside the compressed set",
      link: "https://leetcode.com/problems/reverse-pairs/",
      question: [
        "Given an integer array nums, a reverse pair is a pair of indices (i, j) with 0 <= i < j < nums.length and nums[i] > 2 * nums[j]. Return the number of reverse pairs in the array.",
        "Example 1:\nInput: nums = [1, 3, 2, 3, 1]\nOutput: 2\nExplanation: The reverse pairs are (1, 4) since 3 > 2 * 1, and (3, 4) since 3 > 2 * 1. The pair (2, 4) fails because 2 > 2 * 1 is false.",
        "Example 2:\nInput: nums = [2, 4, 3, 5, 1]\nOutput: 3\nExplanation: All three pairs pick j = 4 where nums[j] = 1 and the threshold is 2: the values 4, 3 and 5 to its left all exceed 2. Value 2 does not.",
        "Constraints:\n- 1 <= nums.length <= 5 * 10^4\n- -2^31 <= nums[i] <= 2^31 - 1",
      ],
      code: `int reversePairs(vector<int>& nums) {
    int n = (int)nums.size();
    vector<int> vals = nums;
    sort(vals.begin(), vals.end());
    vals.erase(unique(vals.begin(), vals.end()), vals.end());
    int m = (int)vals.size();

    vector<int> bit(m + 1, 0);
    auto add = [&](int r) { for (r++; r <= m; r += r & -r) bit[r]++; };
    auto pref = [&](int r) { int s = 0; for (r++; r > 0; r -= r & -r) s += bit[r]; return s; };

    long long ans = 0;
    for (int j = 0; j < n; j++) {
        long long limit = 2LL * nums[j];   // 64-bit: 2 * nums[j] can exceed int range
        // how many distinct compressed values are <= limit; limit itself need not be in vals
        int cnt = (int)(upper_bound(vals.begin(), vals.end(), limit,
                                   [](long long v, int e) { return v < e; }) - vals.begin());
        int notGreater = (cnt > 0) ? pref(cnt - 1) : 0;
        ans += j - notGreater;             // j items inserted so far, minus those <= limit
        add((int)(lower_bound(vals.begin(), vals.end(), nums[j]) - vals.begin()));
    }
    return (int)ans;
}`,
      explanation: [
        "Sweep left to right this time, because the condition constrains the left element by a function of the right one. Before inserting nums[j] the tree holds the ranks of the j elements before it, so the answer for j is (how many are there) minus (how many are <= 2 * nums[j]).",
        "The new idea is that the query key 2 * nums[j] is generally not a value present in the array, so it has no rank. That is fine: compression maps any key to a position in the sorted list, and upper_bound returns the number of distinct stored values that are <= the key. Querying prefix up to that position minus one counts every inserted element that is <= the key. This works because the map from value to rank is monotone, so a key that falls between two stored values sits unambiguously between their ranks.",
        "Complementing (total inserted minus not-greater) is easier to get right than a suffix query over the tree, and avoids a second off-by-one on the upper end.",
        "The overflow trap is real and specific: nums[j] can be 2^31 - 1, so 2 * nums[j] overflows int and wraps negative, which quietly reports zero pairs for the largest inputs. Compute the threshold in long long, and use a comparator so upper_bound can compare a long long key against int elements without a narrowing conversion.",
        "The answer is bounded by n*(n-1)/2, about 1.25 * 10^9 for n = 5 * 10^4, which exceeds int, so accumulate in long long even though the return type is int.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Count of Range Sum",
      difficulty: "Hard",
      variation: "Compressing prefix sums, range query by two binary searches",
      link: "https://leetcode.com/problems/count-of-range-sum/",
      question: [
        "Given an integer array nums and two integers lower and upper, return the number of range sums that lie in [lower, upper] inclusive. A range sum S(i, j) is the sum of the elements in nums between indices i and j inclusive, with i <= j.",
        "Example 1:\nInput: nums = [-2, 5, -1], lower = -2, upper = 2\nOutput: 3\nExplanation: The qualifying ranges are [0,0] with sum -2, [2,2] with sum -1, and [0,2] with sum 2.",
        "Example 2:\nInput: nums = [0], lower = 0, upper = 0\nOutput: 1\nExplanation: The single range [0,0] has sum 0, which is inside the window.",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- -2^31 <= nums[i] <= 2^31 - 1\n- -10^5 <= lower <= upper <= 10^5",
      ],
      code: `int countRangeSum(vector<int>& nums, int lower, int upper) {
    int n = (int)nums.size();
    vector<long long> pre(n + 1, 0);
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + nums[i];

    vector<long long> vals = pre;          // compress the prefix sums, not the input values
    sort(vals.begin(), vals.end());
    vals.erase(unique(vals.begin(), vals.end()), vals.end());
    int m = (int)vals.size();

    vector<int> bit(m + 1, 0);
    auto add = [&](int r) { for (r++; r <= m; r += r & -r) bit[r]++; };
    auto pref = [&](int r) { int s = 0; for (r++; r > 0; r -= r & -r) s += bit[r]; return s; };
    auto rankOf = [&](long long v) {
        return (int)(lower_bound(vals.begin(), vals.end(), v) - vals.begin());
    };

    long long ans = 0;
    add(rankOf(pre[0]));
    for (int j = 1; j <= n; j++) {
        // need pre[j] - upper <= pre[i] <= pre[j] - lower for some i < j
        int lo = (int)(lower_bound(vals.begin(), vals.end(), pre[j] - upper) - vals.begin());
        int hi = (int)(upper_bound(vals.begin(), vals.end(), pre[j] - lower) - vals.begin()) - 1;
        if (lo <= hi) ans += pref(hi) - (lo > 0 ? pref(lo - 1) : 0);
        add(rankOf(pre[j]));
    }
    return (int)ans;
}`,
      explanation: [
        "Rewrite the condition on prefix sums: lower <= pre[j] - pre[i] <= upper with i < j is the same as pre[j] - upper <= pre[i] <= pre[j] - lower. So for each right endpoint j you need a count of earlier prefix sums inside a value window, which is a Fenwick range query - once the prefix sums have ranks.",
        "The values being compressed are the prefix sums, not the array elements, and that is the whole insight. With 10^5 elements near 2^31 the sums reach roughly 2 * 10^14, so they must be 64-bit and can never index an array directly. There are only n+1 of them, so after compression the tree has at most n+1 slots.",
        "Both window bounds are arbitrary integers that usually do not appear among the prefix sums, so they get no rank of their own. lower_bound on the low end gives the first stored rank that is >= the bound, and upper_bound minus one on the high end gives the last stored rank that is <= it. The lo <= hi guard handles a window that falls entirely between two stored values, or entirely outside their span.",
        "Inserting pre[0] = 0 before the loop is what lets ranges that start at index 0 be counted; forgetting it drops every prefix of the array. And inserting pre[j] only after querying keeps i < j strict, so no range is paired with itself.",
        "The divide-and-conquer merge sort alternative counts the same pairs during the merge step and needs no Fenwick tree, but it is longer and much easier to get wrong on the two-pointer bounds.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Falling Squares",
      difficulty: "Hard",
      variation: "Compressed segment tree with range assign",
      link: "https://leetcode.com/problems/falling-squares/",
      question: [
        "There are several squares being dropped onto the number line. You are given a 2D array positions where positions[i] = [left_i, sideLength_i] means the i-th square has its left edge at left_i and side length sideLength_i, so it occupies the interval [left_i, left_i + sideLength_i). Each square is dropped one at a time and lands on top of whatever is already there (the ground, or the tallest stack strictly overlapping its interval). Return an array ans where ans[i] is the height of the tallest stack anywhere after the i-th square has landed.",
        "Example 1:\nInput: positions = [[1,2],[2,3],[6,1]]\nOutput: [2, 5, 5]\nExplanation: The first square covers [1,3) and rests on the ground at height 2. The second covers [2,5), overlaps the first on [2,3) whose height is 2, so its top is 2 + 3 = 5. The third covers [6,7), overlaps nothing and reaches height 1, so the tallest stack is still 5.",
        "Example 2:\nInput: positions = [[100,100],[200,100]]\nOutput: [100, 100]\nExplanation: The intervals [100,200) and [200,300) touch but do not overlap, so both squares sit on the ground at height 100.",
        "Constraints:\n- 1 <= positions.length <= 1000\n- 1 <= left_i <= 10^8\n- 1 <= sideLength_i <= 10^6",
      ],
      code: `class Solution {
    int cells = 0;
    vector<int> mx, lz;   // lz == 0 means no pending assignment, since heights are >= 1

    void assign(int node, int v) {
        mx[node] = v;
        lz[node] = v;
    }
    void push(int node) {
        if (lz[node] != 0) {
            assign(2 * node, lz[node]);
            assign(2 * node + 1, lz[node]);
            lz[node] = 0;
        }
    }
    void update(int node, int nl, int nr, int l, int r, int v) {
        if (r < nl || nr < l) return;
        if (l <= nl && nr <= r) { assign(node, v); return; }
        push(node);
        int mid = (nl + nr) / 2;
        update(2 * node, nl, mid, l, r, v);
        update(2 * node + 1, mid + 1, nr, l, r, v);
        mx[node] = max(mx[2 * node], mx[2 * node + 1]);
    }
    int query(int node, int nl, int nr, int l, int r) {
        if (r < nl || nr < l) return 0;
        if (l <= nl && nr <= r) return mx[node];
        push(node);
        int mid = (nl + nr) / 2;
        return max(query(2 * node, nl, mid, l, r), query(2 * node + 1, mid + 1, nr, l, r));
    }

public:
    vector<int> fallingSquares(vector<vector<int>>& positions) {
        vector<int> xs;
        for (auto& p : positions) {
            xs.push_back(p[0]);
            xs.push_back(p[0] + p[1]);   // right edge is exclusive
        }
        sort(xs.begin(), xs.end());
        xs.erase(unique(xs.begin(), xs.end()), xs.end());

        cells = (int)xs.size() - 1;       // elementary gaps between consecutive coordinates
        mx.assign(4 * max(cells, 1), 0);
        lz.assign(4 * max(cells, 1), 0);

        vector<int> res;
        int best = 0;
        for (auto& p : positions) {
            int l = (int)(lower_bound(xs.begin(), xs.end(), p[0]) - xs.begin());
            int r = (int)(lower_bound(xs.begin(), xs.end(), p[0] + p[1]) - xs.begin()) - 1;
            int base = query(1, 0, cells - 1, l, r);
            update(1, 0, cells - 1, l, r, base + p[1]);
            best = max(best, base + p[1]);
            res.push_back(best);
        }
        return res;
    }
};`,
      explanation: [
        "Positions reach 10^8 but there are at most 2000 distinct edges, so compress the edges and let the segment tree index the gaps between consecutive edges rather than the coordinates themselves. Every square's interval is exactly a contiguous block of those gaps, and within one gap the height is constant at all times, so a per-gap value loses nothing.",
        "Indexing gaps and not points is the subtle part. There are k distinct coordinates and k-1 gaps, and the half-open interval [left, left+side) maps to gaps [rank(left), rank(left+side) - 1]. Indexing the points instead would make two squares that merely touch, as in Example 2, share the boundary point and stack wrongly.",
        "Each drop is a range max query followed by a range assign of base + side over the same range - assign, not add, because after landing the square makes its whole footprint flat at one height. Lazy propagation with an assignment tag is therefore the right tag type, and 0 is a safe 'no tag' sentinel because every real height is at least 1.",
        "The answer is a running maximum: a square can only raise the skyline where it lands, and it never lowers anything, so ans[i] = max(ans[i-1], top of square i). Reporting the local top instead of the running max is the common wrong answer, visible on Example 1 at i = 2.",
        "With only 1000 squares an O(n^2) scan over previously dropped squares also passes. The compressed segment tree is the version that survives a larger n, and it is the standard way to run any array structure over sparse coordinates.",
        "Time: O(n log n) for n squares over O(n) compressed cells. Space: O(n).",
      ],
    },
    {
      name: "The Skyline Problem",
      difficulty: "Hard",
      variation: "Sweep line over compressed x events with a multiset",
      link: "https://leetcode.com/problems/the-skyline-problem/",
      question: [
        "A city's skyline is the outer contour formed by all its buildings when viewed from a distance. You are given buildings where buildings[i] = [left_i, right_i, height_i] describes a rectangle whose base sits on the ground, spanning x from left_i to right_i with height height_i. Return the skyline as a list of key points [x, y] sorted by x. A key point is the left endpoint of a horizontal segment of the contour, and the last point always has y = 0 to mark where the skyline ends. There must be no consecutive horizontal segments of the same height.",
        "Example 1:\nInput: buildings = [[2,9,10],[3,7,15],[5,12,12],[15,20,10],[19,24,8]]\nOutput: [[2,10],[3,15],[7,12],[12,0],[15,10],[20,8],[24,0]]\nExplanation: The contour rises to 10 at x = 2, to 15 at x = 3, drops to 12 when the height-15 building ends at 7, drops to 0 at 12, and the second cluster contributes 10 from 15, 8 from 20, and ends at 24.",
        "Example 2:\nInput: buildings = [[0,2,3],[2,5,3]]\nOutput: [[0,3],[5,0]]\nExplanation: The two buildings have the same height and meet exactly at x = 2, so they form a single horizontal segment and no key point is emitted at 2.",
        "Constraints:\n- 1 <= buildings.length <= 10^4\n- 0 <= left_i < right_i <= 2^31 - 1\n- 1 <= height_i <= 2^31 - 1\n- buildings is sorted by left_i in non-decreasing order",
      ],
      code: `vector<vector<int>> getSkyline(vector<vector<int>>& buildings) {
    vector<pair<int, int>> events;   // (x, h): a negative h marks a left edge
    events.reserve(buildings.size() * 2);
    for (auto& b : buildings) {
        events.push_back({b[0], -b[2]});
        events.push_back({b[1], b[2]});
    }
    // sorting pairs gives: x ascending, then left edges before right edges,
    // then taller left edges first and shorter right edges first
    sort(events.begin(), events.end());

    multiset<int> active{0};          // 0 is the ground, so the set is never empty
    vector<vector<int>> res;
    int prev = 0;
    for (auto& [x, h] : events) {
        if (h < 0) active.insert(-h);
        else active.erase(active.find(h));   // find() erases one copy, not all of them
        int cur = *active.rbegin();
        if (cur != prev) {
            res.push_back({x, cur});
            prev = cur;
        }
    }
    return res;
}`,
      explanation: [
        "The contour height is a step function that can only change at a building edge, so the only x values worth visiting are the 2n edges. Sorting them is the compression: the continuous x axis collapses to a list of at most 2n interesting coordinates, and between two consecutive ones nothing happens.",
        "State at each event is the multiset of heights currently covering x. Its maximum is the contour height there, and a key point is emitted exactly when that maximum changes from the previous event, which is also what enforces the no-consecutive-equal-heights rule for free.",
        "The tie-breaking at a shared x is where this problem is won or lost, and encoding left edges as negative heights makes the plain pair sort do all of it. Left edges sort before right edges at the same x, so a building starting where another ends does not produce a spurious dip to 0 - Example 2 depends on this. Among left edges the taller comes first, so no intermediate rise is reported; among right edges the shorter comes first, so no intermediate dip is.",
        "Use active.erase(active.find(h)) and never active.erase(h): the second form deletes every copy of that height, which corrupts the count as soon as two buildings share a height.",
        "The tempting wrong approach is a max-heap with lazy deletion of ended buildings. It can be made to work but needs care about when to purge; a multiset supports true deletion and keeps the invariant obvious.",
        "Time: O(n log n) - sorting 2n events, then a logarithmic multiset operation each. Space: O(n).",
      ],
    },
    {
      name: "Rectangle Area II",
      difficulty: "Hard",
      variation: "Two-dimensional compression into an elementary grid",
      link: "https://leetcode.com/problems/rectangle-area-ii/",
      question: [
        "You are given a list of axis-aligned rectangles, where rectangles[i] = [x1, y1, x2, y2] has bottom-left corner (x1, y1) and top-right corner (x2, y2). Rectangles may overlap. Return the total area covered by at least one rectangle, taken modulo 10^9 + 7. Area covered by two or more rectangles must be counted only once.",
        "Example 1:\nInput: rectangles = [[0,0,2,2],[1,0,2,3],[1,0,3,1]]\nOutput: 6\nExplanation: Slice by x: on [0,1) only the first rectangle covers y in [0,2), giving area 2. On [1,2) the union of y coverage is [0,3), giving area 3. On [2,3) only the third rectangle covers y in [0,1), giving area 1. Total 2 + 3 + 1 = 6.",
        "Example 2:\nInput: rectangles = [[0,0,1000000000,1000000000]]\nOutput: 49\nExplanation: The true area is 10^18, and 10^18 modulo 10^9 + 7 is 49.",
        "Constraints:\n- 1 <= rectangles.length <= 200\n- 0 <= x1 < x2 <= 10^9\n- 0 <= y1 < y2 <= 10^9",
      ],
      code: `int rectangleArea(vector<vector<int>>& rectangles) {
    const long long MOD = 1000000007LL;
    vector<int> xs, ys;
    for (auto& r : rectangles) {
        xs.push_back(r[0]); xs.push_back(r[2]);
        ys.push_back(r[1]); ys.push_back(r[3]);
    }
    sort(xs.begin(), xs.end()); xs.erase(unique(xs.begin(), xs.end()), xs.end());
    sort(ys.begin(), ys.end()); ys.erase(unique(ys.begin(), ys.end()), ys.end());

    long long total = 0;
    for (size_t i = 0; i + 1 < xs.size(); i++) {
        vector<char> covered(ys.size(), 0);
        for (auto& r : rectangles) {
            if (r[0] <= xs[i] && xs[i + 1] <= r[2]) {         // spans this whole x-slab
                for (size_t j = 0; j + 1 < ys.size(); j++)
                    if (r[1] <= ys[j] && ys[j + 1] <= r[3]) covered[j] = 1;
            }
        }
        long long height = 0;   // exact, up to 10^9, so no modular reduction needed yet
        for (size_t j = 0; j + 1 < ys.size(); j++)
            if (covered[j]) height += ys[j + 1] - ys[j];
        long long width = xs[i + 1] - xs[i];
        total = (total + (height % MOD) * (width % MOD)) % MOD;
    }
    return (int)total;
}`,
      explanation: [
        "Compress both axes independently. With n rectangles there are at most 2n distinct x values and 2n distinct y values, and they cut the plane into at most (2n-1) by (2n-1) elementary cells. Inside one cell every rectangle either covers all of it or none of it - no rectangle boundary passes through a cell interior, because every boundary is one of the compressed lines. That is the invariant that makes the whole grid argument valid.",
        "So the union area is the sum of the true geometric areas of the covered cells: width times height taken from the original coordinates, never from the ranks. Forgetting to un-compress and summing 1 per covered cell is the classic bug - it computes a cell count, not an area.",
        "Sweeping x-slabs and rebuilding the covered y-cells per slab is O(n^2) work per slab and O(n^3) overall, which at n = 200 is a few million operations. The asymptotically better version replaces the inner rescan with a segment tree over compressed y that maintains the covered length under interval insert and delete, giving O(n log n).",
        "Half-open cells are what keep touching rectangles from double counting. A cell is the region [xs[i], xs[i+1]) by [ys[j], ys[j+1]), and a rectangle claims it only when it contains both endpoints, so a shared edge belongs to no cell twice.",
        "Take the modulus only at the end of each slab. The height is a genuine length bounded by 10^9 and must be summed exactly before it is multiplied; reducing partial heights modulo the prime first would still be correct here, but reducing anything used as a length in a later comparison is how this problem gets silently broken.",
        "Time: O(n^3) with the rescan, O(n^2 log n) with a segment tree over compressed y. Space: O(n).",
      ],
    },
  ],
};
