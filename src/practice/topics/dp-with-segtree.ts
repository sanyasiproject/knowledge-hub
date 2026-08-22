import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Longest Increasing Subsequence",
      difficulty: "Medium",
      variation: "Prefix max over the value axis, the template",
      link: "https://leetcode.com/problems/longest-increasing-subsequence/",
      question: [
        "Given an integer array nums, return the length of the longest strictly increasing subsequence. A subsequence keeps the original order but may skip elements. Solve it with the segment-tree formulation: index the DP by value instead of by position, so the transition dp[i] = 1 + max(dp[j] for j < i with nums[j] < nums[i]) becomes a single range-maximum query over all values smaller than nums[i].",
        "Example 1:\nInput: nums = [10,9,2,5,3,7,101,18]\nOutput: 4\nExplanation: One longest increasing subsequence is [2,3,7,18], of length 4.",
        "Example 2:\nInput: nums = [0,1,0,3,2,3]\nOutput: 4\nExplanation: [0,1,2,3] has length 4.",
        "Constraints:\n- 1 <= nums.length <= 2500\n- -10^4 <= nums[i] <= 10^4",
      ],
      code: `class Solution {
    vector<int> seg;   // iterative bottom-up max tree over compressed values
    int n;

    void update(int pos, int val) {
        pos += n;
        seg[pos] = max(seg[pos], val);   // point maximum, never a plain overwrite
        for (pos /= 2; pos >= 1; pos /= 2) seg[pos] = max(seg[2 * pos], seg[2 * pos + 1]);
    }

    int query(int l, int r) {            // max on [l, r], 0 when the range is empty
        int res = 0;
        if (l > r) return res;
        for (l += n, r += n + 1; l < r; l /= 2, r /= 2) {
            if (l & 1) res = max(res, seg[l++]);
            if (r & 1) res = max(res, seg[--r]);
        }
        return res;
    }

public:
    int lengthOfLIS(vector<int>& nums) {
        vector<int> vals = nums;
        sort(vals.begin(), vals.end());
        vals.erase(unique(vals.begin(), vals.end()), vals.end());
        n = vals.size();
        seg.assign(2 * n, 0);
        int ans = 0;
        for (int x : nums) {
            int r = lower_bound(vals.begin(), vals.end(), x) - vals.begin();
            int best = query(0, r - 1) + 1;   // r - 1 keeps the comparison strict
            ans = max(ans, best);
            update(r, best);
        }
        return ans;
    }
};`,
      explanation: [
        "The naive state is dp[i] = length of the best increasing subsequence ending exactly at index i, and the transition scans every earlier index. That inner scan is not really asking about positions - it is asking for the maximum dp value among elements whose value is smaller. Re-index the table by value and that becomes a prefix maximum.",
        "So the real state is seg[v] = best length of any increasing subsequence seen so far whose last element has value v. Sweeping left to right guarantees the tree only ever contains elements at positions before the current one, which is exactly the j < i restriction - order of insertion enforces it for free, so the tree never has to know about indices.",
        "Strictness lives in one place: querying [0, r-1] excludes the value's own bucket. Query [0, r] instead and you get the longest non-decreasing subsequence. Getting these two mixed up is the single most common bug in this family.",
        "The point update must be a maximum, not an assignment. Several elements share a compressed value, and a later one with a shorter chain must not erase a better earlier chain.",
        "The patience-sorting solution is shorter for plain LIS, but it does not generalise: it cannot answer 'only look at values in a window' or 'count how many optimal chains there are'. The segment tree formulation does, which is why it is worth learning here.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Maximum Sum Increasing Subsequence",
      difficulty: "Medium",
      variation: "Weighted LIS, sums instead of lengths",
      question: [
        "Given an array arr of positive integers, find the maximum sum of an increasing subsequence of arr. The subsequence must be strictly increasing in value and must keep the original order.",
        "Example 1:\nInput: arr = [1,101,2,3,100,4,5]\nOutput: 106\nExplanation: The increasing subsequence [1,2,3,100] sums to 106, which beats [1,2,3,4,5] (15) and [1,101] (102).",
        "Example 2:\nInput: arr = [10,5,4,3]\nOutput: 10\nExplanation: The array is decreasing, so the best increasing subsequence is a single element, and 10 is the largest.",
        "Constraints:\n- 1 <= arr.length <= 10^5\n- 1 <= arr[i] <= 10^5",
      ],
      code: `struct SegMax {
    int n;
    vector<long long> t;
    SegMax(int sz) : n(sz), t(2 * sz, 0) {}

    void update(int pos, long long val) {
        pos += n;
        t[pos] = max(t[pos], val);
        for (pos /= 2; pos >= 1; pos /= 2) t[pos] = max(t[2 * pos], t[2 * pos + 1]);
    }

    long long query(int l, int r) {
        long long res = 0;
        if (l > r) return res;
        for (l += n, r += n + 1; l < r; l /= 2, r /= 2) {
            if (l & 1) res = max(res, t[l++]);
            if (r & 1) res = max(res, t[--r]);
        }
        return res;
    }
};

long long maxSumIS(vector<int>& arr) {
    vector<int> vals = arr;
    sort(vals.begin(), vals.end());
    vals.erase(unique(vals.begin(), vals.end()), vals.end());
    SegMax seg(vals.size());
    long long ans = 0;
    for (int x : arr) {
        int r = lower_bound(vals.begin(), vals.end(), x) - vals.begin();
        long long best = seg.query(0, r - 1) + x;   // 0 for an empty prefix means 'start here'
        ans = max(ans, best);
        seg.update(r, best);
    }
    return ans;
}`,
      explanation: [
        "Identical structure to LIS with one change: the value stored at a leaf is the best achievable sum ending at that value, not the best length, and the transition adds x rather than 1. The monoid is still max, so the tree code is untouched.",
        "The identity element 0 doubles as a correct base case here because all values are positive: an empty query result means no smaller element exists yet, and starting a fresh subsequence at x gives exactly x. If the array could contain negatives you would need a genuine negative-infinity identity and an explicit max(0, prev) at the transition, otherwise a single very negative prefix would be silently treated as a free 0.",
        "Sums reach 10^5 elements times 10^5 each, so the accumulator must be 64-bit even though the inputs are ints.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Flowers (Educational DP Contest Q)",
      difficulty: "Medium",
      variation: "Weighted LIS over a permutation, no compression needed",
      link: "https://atcoder.jp/contests/dp/tasks/dp_q",
      question: [
        "There are N flowers in a row. Flower i has height h_i and beauty a_i, and the heights are a permutation of 1..N. You must remove some flowers (possibly none) so that the remaining flowers, read left to right, have strictly increasing heights. Maximise the sum of beauties of the remaining flowers.",
        "Example 1:\nInput:\n4\n3 1 4 2\n10 20 30 40\nOutput: 60\nExplanation: Keep flowers 2 and 4 (heights 1 then 2, increasing) for beauty 20 + 40 = 60. Keeping flowers 2 and 3 gives 50 and keeping 1 and 3 gives 40.",
        "Example 2:\nInput:\n1\n1\n10\nOutput: 10\nExplanation: The single flower is trivially increasing.",
        "Constraints:\n- 1 <= N <= 2 * 10^5\n- 1 <= h_i <= N, all h_i distinct\n- 1 <= a_i <= 10^9",
      ],
      code: `int n;
vector<long long> seg;

void update(int pos, long long val) {
    pos += n;
    seg[pos] = max(seg[pos], val);
    for (pos /= 2; pos >= 1; pos /= 2) seg[pos] = max(seg[2 * pos], seg[2 * pos + 1]);
}

long long query(int l, int r) {
    long long res = 0;
    if (l > r) return res;
    for (l += n, r += n + 1; l < r; l /= 2, r /= 2) {
        if (l & 1) res = max(res, seg[l++]);
        if (r & 1) res = max(res, seg[--r]);
    }
    return res;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int N;
    cin >> N;
    vector<int> h(N);
    for (int& x : h) cin >> x;
    vector<long long> a(N);
    for (long long& x : a) cin >> x;
    n = N;                      // heights are a permutation of 1..N: the height IS the index
    seg.assign(2 * n, 0);
    long long ans = 0;
    for (int i = 0; i < N; i++) {
        int p = h[i] - 1;
        long long best = query(0, p - 1) + a[i];   // best chain ending below this height
        ans = max(ans, best);
        update(p, best);
    }
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "This is maximum-sum increasing subsequence in judge form, and it is the cleanest illustration of the pattern because the heights are already a permutation of 1..N - no coordinate compression, the height itself is the leaf index.",
        "State: seg[height] = maximum beauty of a valid arrangement whose rightmost kept flower has that height. Processing flowers left to right means every value currently in the tree belongs to a flower positioned earlier, so a prefix query over heights strictly below h_i returns exactly max over the legal predecessors.",
        "The tempting O(N^2) DP over pairs of positions is correct but 4 * 10^10 operations at N = 2 * 10^5; the range query replaces the inner loop with a log factor. Beauties up to 10^9 times 2 * 10^5 flowers overflow 32 bits, so every accumulator is long long.",
        "Time: O(N log N). Space: O(N).",
      ],
    },
    {
      name: "Best Team With No Conflicts",
      difficulty: "Medium",
      variation: "Sort by one key, range query on the other",
      link: "https://leetcode.com/problems/best-team-with-no-conflicts/",
      question: [
        "You are the manager of a basketball team. Player i has score scores[i] and age ages[i]. A team has a conflict if a younger player has a strictly higher score than an older player; players of the same age never conflict. Choose a set of players with no conflict that maximises the total score, and return that total.",
        "Example 1:\nInput: scores = [1,3,5,10,15], ages = [1,2,3,4,5]\nOutput: 34\nExplanation: Scores and ages increase together, so all five players can be picked: 1 + 3 + 5 + 10 + 15 = 34.",
        "Example 2:\nInput: scores = [4,5,6,5], ages = [2,1,2,1]\nOutput: 16\nExplanation: Pick both age-1 players (scores 5 and 5) and the age-2 player with score 6: 5 + 5 + 6 = 16. Adding the age-2 player with score 4 would conflict with the younger score-5 players.",
        "Constraints:\n- 1 <= scores.length == ages.length <= 1000\n- 1 <= scores[i] <= 10^6\n- 1 <= ages[i] <= 1000",
      ],
      code: `class Solution {
    int n;
    vector<int> seg;

    void update(int pos, int val) {
        pos += n;
        seg[pos] = max(seg[pos], val);
        for (pos /= 2; pos >= 1; pos /= 2) seg[pos] = max(seg[2 * pos], seg[2 * pos + 1]);
    }

    int query(int l, int r) {
        int res = 0;
        if (l > r) return res;
        for (l += n, r += n + 1; l < r; l /= 2, r /= 2) {
            if (l & 1) res = max(res, seg[l++]);
            if (r & 1) res = max(res, seg[--r]);
        }
        return res;
    }

public:
    int bestTeamScore(vector<int>& scores, vector<int>& ages) {
        int m = scores.size();
        vector<pair<int,int>> p(m);
        for (int i = 0; i < m; i++) p[i] = {ages[i], scores[i]};
        sort(p.begin(), p.end());        // age ascending, then score ascending

        vector<int> vals = scores;
        sort(vals.begin(), vals.end());
        vals.erase(unique(vals.begin(), vals.end()), vals.end());
        n = vals.size();
        seg.assign(2 * n, 0);

        int ans = 0;
        for (auto& [age, sc] : p) {
            int r = lower_bound(vals.begin(), vals.end(), sc) - vals.begin();
            int best = query(0, r) + sc;   // inclusive: equal scores are allowed
            ans = max(ans, best);
            update(r, best);
        }
        return ans;
    }
};`,
      explanation: [
        "A set is conflict-free exactly when, sorted by age, the scores are non-decreasing. So after sorting players by age the problem is 'maximum-sum non-decreasing subsequence of scores' - the weighted LIS pattern again, with the sort turning a two-dimensional condition into a one-dimensional one.",
        "The secondary sort key matters. Within one age group any subset is legal, so those players must be able to chain among themselves; sorting equal ages by ascending score means an earlier same-age player always has a score at most the current one and is therefore reachable by the inclusive prefix query. Sorting equal ages descending would make same-age combinations invisible and undercount.",
        "The query is [0, r] rather than [0, r-1] because equal scores are compatible. This is the non-strict twin of the LIS query, and it is the only line that differs from the strict version.",
        "The O(n^2) DP passes at n = 1000, which is why this problem is usually seen in its quadratic form - but writing it as a range query is what makes it survive n = 10^5.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Number of Longest Increasing Subsequence",
      difficulty: "Medium",
      variation: "Segment tree over a compound node (length, count)",
      link: "https://leetcode.com/problems/number-of-longest-increasing-subsequence/",
      question: [
        "Given an integer array nums, return the number of longest strictly increasing subsequences. Two subsequences are different if they use a different set of indices, even when the values are the same.",
        "Example 1:\nInput: nums = [1,3,5,4,7]\nOutput: 2\nExplanation: The longest increasing subsequences have length 4: [1,3,5,7] and [1,3,4,7].",
        "Example 2:\nInput: nums = [2,2,2,2,2]\nOutput: 5\nExplanation: No two elements are strictly increasing, so every longest increasing subsequence has length 1 and there are 5 of them.",
        "Constraints:\n- 1 <= nums.length <= 2000\n- -10^6 <= nums[i] <= 10^6\n- The answer fits in a 32-bit signed integer",
      ],
      code: `class Solution {
    struct Node { int len = 0; long long cnt = 0; };

    // Combine two subtree answers: keep the longer length, add counts on a tie.
    static Node merge(const Node& a, const Node& b) {
        if (a.len > b.len) return a;
        if (b.len > a.len) return b;
        return Node{a.len, a.cnt + b.cnt};
    }

    int n;
    vector<Node> seg;

    void update(int pos, Node v) {
        pos += n;
        seg[pos] = merge(seg[pos], v);   // merge, so several elements sharing a value accumulate
        for (pos /= 2; pos >= 1; pos /= 2) seg[pos] = merge(seg[2 * pos], seg[2 * pos + 1]);
    }

    Node query(int l, int r) {
        Node res;
        if (l > r) return res;
        for (l += n, r += n + 1; l < r; l /= 2, r /= 2) {
            if (l & 1) res = merge(res, seg[l++]);
            if (r & 1) res = merge(res, seg[--r]);
        }
        return res;
    }

public:
    int findNumberOfLIS(vector<int>& nums) {
        vector<int> vals = nums;
        sort(vals.begin(), vals.end());
        vals.erase(unique(vals.begin(), vals.end()), vals.end());
        n = vals.size();
        seg.assign(2 * n, Node());
        for (int x : nums) {
            int r = lower_bound(vals.begin(), vals.end(), x) - vals.begin();
            Node best = query(0, r - 1);
            Node cur{best.len + 1, best.len == 0 ? 1 : best.cnt};   // empty prefix: one way
            update(r, cur);
        }
        return (int)query(0, n - 1).cnt;
    }
};`,
      explanation: [
        "The lesson here is that the segment tree does not have to store a number. Any associative merge works, so store a pair (best length, number of ways to achieve that length) and define merge as 'take the larger length, sum the counts when the lengths are equal'. That operation is associative and commutative with identity (0, 0), so it is a valid monoid and both the point update and the range query are unchanged.",
        "State: leaf v holds the best (length, count) over all processed elements whose value is v. The query over [0, r-1] returns the aggregate over all strictly smaller values in one shot, which is precisely the information the O(n^2) two-array DP recomputes with an inner loop.",
        "The base case needs care. When the prefix query is empty its count is 0, not 1, so writing cnt = best.cnt blindly would give every chain a count of zero. The empty subsequence must be counted as exactly one way to start, hence the explicit len == 0 branch.",
        "The point update must merge rather than overwrite: duplicate values each contribute their own chains, and [2,2,2,2,2] returning 5 depends entirely on that accumulation.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Russian Doll Envelopes",
      difficulty: "Hard",
      variation: "Two-dimensional LIS via sort plus range query",
      link: "https://leetcode.com/problems/russian-doll-envelopes/",
      question: [
        "You are given envelopes where envelopes[i] = [w, h] is the width and height of envelope i. One envelope fits inside another only if both its width and its height are strictly smaller. Return the maximum number of envelopes you can nest, one inside the next.",
        "Example 1:\nInput: envelopes = [[5,4],[6,4],[6,7],[2,3]]\nOutput: 3\nExplanation: The chain is [2,3] inside [5,4] inside [6,7].",
        "Example 2:\nInput: envelopes = [[1,1],[1,1],[1,1]]\nOutput: 1\nExplanation: Identical envelopes cannot nest because nesting needs both dimensions strictly smaller.",
        "Constraints:\n- 1 <= envelopes.length <= 10^5\n- 1 <= w, h <= 10^5",
      ],
      code: `class Solution {
    int n;
    vector<int> seg;

    void update(int pos, int val) {
        pos += n;
        seg[pos] = max(seg[pos], val);
        for (pos /= 2; pos >= 1; pos /= 2) seg[pos] = max(seg[2 * pos], seg[2 * pos + 1]);
    }

    int query(int l, int r) {
        int res = 0;
        if (l > r) return res;
        for (l += n, r += n + 1; l < r; l /= 2, r /= 2) {
            if (l & 1) res = max(res, seg[l++]);
            if (r & 1) res = max(res, seg[--r]);
        }
        return res;
    }

public:
    int maxEnvelopes(vector<vector<int>>& envelopes) {
        // width ascending; on equal width, height DESCENDING
        sort(envelopes.begin(), envelopes.end(), [](const vector<int>& a, const vector<int>& b) {
            if (a[0] != b[0]) return a[0] < b[0];
            return a[1] > b[1];
        });

        vector<int> vals;
        for (auto& e : envelopes) vals.push_back(e[1]);
        sort(vals.begin(), vals.end());
        vals.erase(unique(vals.begin(), vals.end()), vals.end());
        n = vals.size();
        seg.assign(2 * n, 0);

        int ans = 0;
        for (auto& e : envelopes) {
            int r = lower_bound(vals.begin(), vals.end(), e[1]) - vals.begin();
            int best = query(0, r - 1) + 1;   // strictly smaller height
            ans = max(ans, best);
            update(r, best);
        }
        return ans;
    }
};`,
      explanation: [
        "Sorting by width reduces a two-dimensional dominance chain to a one-dimensional LIS on heights: after the sort, anything appearing earlier already has width less than or equal to the current one, so only the height needs checking.",
        "The whole difficulty is the equal-width tie. If two envelopes share a width they can never nest, yet a plain ascending sort would let the earlier one be picked as a predecessor of the later one whenever its height is smaller. Sorting equal widths by descending height kills that: within a width block heights decrease, so no element of the block can ever be a strictly-smaller-height predecessor of a later element of the same block. The trick encodes an exclusion into the ordering rather than into the query.",
        "With that in place the sweep is the LIS template verbatim: leaf h holds the longest chain seen so far whose outermost envelope has height h, and the query over strictly smaller heights gives the transition.",
        "The tempting wrong fix is to keep the ascending tie-break and try to filter same-width predecessors inside the loop - that needs the width in the tree as well, and turns a clean O(n log n) into a two-dimensional structure for no reason.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Maximum Profit in Job Scheduling",
      difficulty: "Hard",
      variation: "DP over a compressed time axis",
      link: "https://leetcode.com/problems/maximum-profit-in-job-scheduling/",
      question: [
        "You are given n jobs, where job i runs on the half-open interval [startTime[i], endTime[i]) and pays profit[i]. You can take any subset of jobs as long as no two chosen jobs overlap in time; a job may start at exactly the moment another one ends. Return the maximum profit obtainable.",
        "Example 1:\nInput: startTime = [1,2,3,3], endTime = [3,4,5,6], profit = [50,10,40,70]\nOutput: 120\nExplanation: Take job 1 (1 to 3, profit 50) and job 4 (3 to 6, profit 70). Job 4 starts exactly when job 1 ends, which is allowed.",
        "Example 2:\nInput: startTime = [1,2,3,4,6], endTime = [3,5,10,6,9], profit = [20,20,100,70,60]\nOutput: 150\nExplanation: Take job 1 (1 to 3, 20), job 4 (4 to 6, 70) and job 5 (6 to 9, 60) for 150. The single job paying 100 runs from 3 to 10 and blocks everything else.",
        "Constraints:\n- 1 <= startTime.length == endTime.length == profit.length <= 5 * 10^4\n- 1 <= startTime[i] < endTime[i] <= 10^9\n- 1 <= profit[i] <= 10^4",
      ],
      code: `class Solution {
    int n;
    vector<int> seg;

    void update(int pos, int val) {
        pos += n;
        seg[pos] = max(seg[pos], val);
        for (pos /= 2; pos >= 1; pos /= 2) seg[pos] = max(seg[2 * pos], seg[2 * pos + 1]);
    }

    int query(int l, int r) {
        int res = 0;
        if (l > r) return res;
        for (l += n, r += n + 1; l < r; l /= 2, r /= 2) {
            if (l & 1) res = max(res, seg[l++]);
            if (r & 1) res = max(res, seg[--r]);
        }
        return res;
    }

public:
    int jobScheduling(vector<int>& startTime, vector<int>& endTime, vector<int>& profit) {
        int m = startTime.size();
        vector<array<int,3>> jobs(m);
        for (int i = 0; i < m; i++) jobs[i] = {endTime[i], startTime[i], profit[i]};
        sort(jobs.begin(), jobs.end());   // by end time, so predecessors are always ready

        vector<int> vals;
        vals.reserve(2 * m);
        for (int i = 0; i < m; i++) { vals.push_back(startTime[i]); vals.push_back(endTime[i]); }
        sort(vals.begin(), vals.end());
        vals.erase(unique(vals.begin(), vals.end()), vals.end());
        n = vals.size();
        seg.assign(2 * n, 0);

        for (auto& j : jobs) {
            // largest compressed time <= this job's start
            int s = upper_bound(vals.begin(), vals.end(), j[1]) - vals.begin() - 1;
            int e = lower_bound(vals.begin(), vals.end(), j[0]) - vals.begin();
            update(e, query(0, s) + j[2]);
        }
        return query(0, n - 1);
    }
};`,
      explanation: [
        "State: seg[t] = maximum profit achievable using only jobs that finish at time exactly t. A range query over [0, t] then answers 'best profit using jobs that all finish by time t', which is exactly what a job starting at t needs, since the intervals are half-open.",
        "Times reach 10^9 so the axis must be compressed; both endpoints go into the same coordinate list, otherwise a start time would have no leaf to query at. The prefix query is inclusive of the start time because a job may begin the instant another ends.",
        "Processing jobs in increasing end time is what makes the DP well founded. Any job that finishes at or before the current job's start must have a strictly smaller end time (its end is at most the current start, which is below the current end), so it has already been inserted when the query runs.",
        "The identity 0 is the correct base case: taking no earlier job is always allowed, and profits are positive so an empty prefix never loses anything.",
        "The classic alternative is sort by end time plus binary search over a running prefix-maximum array; that works only because the DP is a prefix maximum. The segment tree version is the one that still works when the transition needs an arbitrary window rather than a prefix.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Longest Increasing Subsequence II",
      difficulty: "Hard",
      variation: "Bounded window range max, not a prefix",
      link: "https://leetcode.com/problems/longest-increasing-subsequence-ii/",
      question: [
        "You are given an integer array nums and an integer k. Find the length of the longest subsequence of nums that is strictly increasing and in which the difference between adjacent chosen elements is at most k. Formally, for consecutive picked elements a then b we need 0 < b - a <= k.",
        "Example 1:\nInput: nums = [4,2,1,4,3,4,5,8,15], k = 3\nOutput: 5\nExplanation: [1,3,4,5,8] is increasing and every adjacent gap (2, 1, 1, 3) is at most 3. Extending with 15 would need a gap of 7.",
        "Example 2:\nInput: nums = [7,4,5,1,8,12,4,7], k = 5\nOutput: 4\nExplanation: [4,5,8,12] has gaps 1, 3, 4, all at most 5.",
        "Example 3:\nInput: nums = [1,5], k = 1\nOutput: 1\nExplanation: 5 - 1 = 4 exceeds k, so no pair can be chained and a single element is the best.",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- 1 <= nums[i] <= 10^5\n- 1 <= k <= 10^5",
      ],
      code: `class Solution {
    int n;
    vector<int> seg;

    void update(int pos, int val) {
        pos += n;
        seg[pos] = max(seg[pos], val);
        for (pos /= 2; pos >= 1; pos /= 2) seg[pos] = max(seg[2 * pos], seg[2 * pos + 1]);
    }

    int query(int l, int r) {
        int res = 0;
        if (l > r) return res;
        for (l += n, r += n + 1; l < r; l /= 2, r /= 2) {
            if (l & 1) res = max(res, seg[l++]);
            if (r & 1) res = max(res, seg[--r]);
        }
        return res;
    }

public:
    int lengthOfLIS(vector<int>& nums, int k) {
        n = *max_element(nums.begin(), nums.end()) + 1;   // values are small: index directly
        seg.assign(2 * n, 0);
        int ans = 0;
        for (int x : nums) {
            int lo = max(0, x - k);
            int best = query(lo, x - 1) + 1;   // window of admissible predecessors
            ans = max(ans, best);
            update(x, best);
        }
        return ans;
    }
};`,
      explanation: [
        "This is the problem that justifies the whole technique. The state is the same as in plain LIS - seg[v] = best chain ending at value v - but the set of legal predecessors is now the value window [x-k, x-1] instead of the whole prefix [0, x-1]. A prefix-maximum array or patience sorting cannot answer that; a segment tree answers an arbitrary window at the same cost as a prefix.",
        "Correctness of the sweep is unchanged: elements enter the tree in left-to-right order, so any value found in the tree belongs to an earlier index. The window handles the value constraint and the sweep handles the index constraint, and the two are independent.",
        "The left end must be clamped with max(0, x - k), and the right end is x - 1 to keep the increase strict. An off-by-one on the right silently allows equal adjacent values and inflates the answer.",
        "Because nums[i] <= 10^5 the values can index the tree directly, which is cheaper and simpler than compression. Compression would still be correct for the strict prefix case but is actively wrong for a window query unless you map x-k with a binary search, since compressed ranks are not spaced like the original values.",
        "Time: O(n log M) where M is the maximum value. Space: O(M).",
      ],
    },
    {
      name: "Maximum Balanced Subsequence Sum",
      difficulty: "Hard",
      variation: "Rewrite the condition into a monotone key",
      link: "https://leetcode.com/problems/maximum-balanced-subsequence-sum/",
      question: [
        "A subsequence of nums at indices i_0 < i_1 < ... < i_(m-1) is balanced if for every consecutive pair nums[i_j] - nums[i_(j-1)] >= i_j - i_(j-1). A subsequence of length 1 is always balanced. Return the maximum possible sum of elements of a balanced subsequence of nums.",
        "Example 1:\nInput: nums = [3,3,5,6]\nOutput: 14\nExplanation: The subsequence at indices 0, 2, 3 (values 3, 5, 6) is balanced: 5 - 3 = 2 >= 2 - 0 and 6 - 5 = 1 >= 3 - 2. Its sum is 14.",
        "Example 2:\nInput: nums = [5,-1,-3,8]\nOutput: 13\nExplanation: Indices 0 and 3 give 8 - 5 = 3 >= 3 - 0, so the sum is 5 + 8 = 13. Including any negative element only lowers the total.",
        "Example 3:\nInput: nums = [-2,-1]\nOutput: -1\nExplanation: Every element is negative, so the best balanced subsequence is the single largest element.",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- -10^9 <= nums[i] <= 10^9",
      ],
      code: `class Solution {
    static constexpr long long NEG = -(1LL << 62);   // true identity for max
    int n;
    vector<long long> seg;

    void update(int pos, long long val) {
        pos += n;
        seg[pos] = max(seg[pos], val);
        for (pos /= 2; pos >= 1; pos /= 2) seg[pos] = max(seg[2 * pos], seg[2 * pos + 1]);
    }

    long long query(int l, int r) {
        long long res = NEG;
        if (l > r) return res;
        for (l += n, r += n + 1; l < r; l /= 2, r /= 2) {
            if (l & 1) res = max(res, seg[l++]);
            if (r & 1) res = max(res, seg[--r]);
        }
        return res;
    }

public:
    long long maxBalancedSubsequenceSum(vector<int>& nums) {
        int m = nums.size();
        vector<long long> key(m);
        for (int i = 0; i < m; i++) key[i] = (long long)nums[i] - i;   // the condition, rearranged

        vector<long long> vals = key;
        sort(vals.begin(), vals.end());
        vals.erase(unique(vals.begin(), vals.end()), vals.end());
        n = vals.size();
        seg.assign(2 * n, NEG);

        long long ans = NEG;
        for (int i = 0; i < m; i++) {
            int r = lower_bound(vals.begin(), vals.end(), key[i]) - vals.begin();
            long long prev = query(0, r);              // inclusive: keys may repeat
            long long cur = nums[i] + max(0LL, prev);  // 0 means 'start a new subsequence here'
            ans = max(ans, cur);
            update(r, cur);
        }
        return ans;
    }
};`,
      explanation: [
        "Rearranging nums[j] - nums[i] >= j - i into nums[j] - j >= nums[i] - i is the whole insight: a subsequence is balanced exactly when the key nums[i] - i is non-decreasing along it. So this is maximum-sum non-decreasing subsequence on the key array, with the original values as weights.",
        "State: leaf value = best sum of a balanced subsequence whose last chosen index has that key. Sweeping i upward keeps the index ordering automatic, and the inclusive prefix query over keys returns max over all valid predecessors.",
        "Negatives make the identity element matter. A max-tree over sums that can be negative must be initialised to a real negative infinity, not 0, otherwise an empty query would masquerade as a free 0 and let a chain skip its own history. The 'start fresh' option is then reintroduced deliberately as max(0LL, prev), which is what lets a length-1 subsequence be the answer when everything is negative.",
        "Sums reach 10^5 times 10^9, so the answer is long long; keys are computed in long long too, although nums[i] - i cannot actually overflow an int here.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Pillars",
      difficulty: "Hard",
      variation: "Two-sided range max plus answer reconstruction",
      link: "https://codeforces.com/problemset/problem/474/E",
      question: [
        "There are n pillars in a row, the i-th of height h_i. A bear jumps from pillar to pillar moving only to the right, and can jump from pillar i to pillar j (i < j) only if the absolute difference of their heights is at least d. Find the maximum number of pillars the bear can visit, and print one sequence of visited pillar indices achieving it. Indices are 1-based, and any optimal sequence is accepted.",
        "Example 1:\nInput:\n5 2\n1 3 6 7 4\nOutput:\n4\n1 2 4 5\nExplanation: Heights 1, 3, 7, 4 have consecutive differences 2, 4 and 3, all at least 2. No sequence of 5 pillars works. The sequence 1 2 3 5 is also optimal and equally acceptable.",
        "Example 2:\nInput:\n10 3\n2 1 3 6 9 11 7 3 20 18\nOutput:\n6\n3 4 6 7 8 9\nExplanation: Heights 3, 6, 11, 7, 3, 20 have differences 3, 5, 4, 4 and 17, all at least 3, giving 6 pillars.",
        "Constraints:\n- 1 <= n <= 10^5\n- 0 <= d <= 10^9\n- 1 <= h_i <= 10^15",
      ],
      code: `struct SegMax {
    int n;
    vector<pair<int,int>> t;   // (best length, index achieving it)
    SegMax(int sz) : n(sz), t(2 * sz, make_pair(0, -1)) {}

    void update(int pos, pair<int,int> v) {
        pos += n;
        t[pos] = max(t[pos], v);
        for (pos /= 2; pos >= 1; pos /= 2) t[pos] = max(t[2 * pos], t[2 * pos + 1]);
    }

    pair<int,int> query(int l, int r) {
        pair<int,int> res(0, -1);
        if (l > r) return res;
        for (l += n, r += n + 1; l < r; l /= 2, r /= 2) {
            if (l & 1) res = max(res, t[l++]);
            if (r & 1) res = max(res, t[--r]);
        }
        return res;
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int N;
    long long d;
    cin >> N >> d;
    vector<long long> h(N);
    for (auto& x : h) cin >> x;

    vector<long long> vals = h;
    sort(vals.begin(), vals.end());
    vals.erase(unique(vals.begin(), vals.end()), vals.end());
    int m = vals.size();
    SegMax seg(m);

    vector<int> dp(N), par(N, -1);
    int bestLen = 0, bestIdx = 0;
    for (int i = 0; i < N; i++) {
        // heights <= h[i] - d, and heights >= h[i] + d
        int a = upper_bound(vals.begin(), vals.end(), h[i] - d) - vals.begin() - 1;
        int b = lower_bound(vals.begin(), vals.end(), h[i] + d) - vals.begin();
        pair<int,int> cand = max(seg.query(0, a), seg.query(b, m - 1));
        dp[i] = cand.first + 1;
        par[i] = cand.second;                    // -1 when this pillar starts the path
        int pos = lower_bound(vals.begin(), vals.end(), h[i]) - vals.begin();
        seg.update(pos, make_pair(dp[i], i));
        if (dp[i] > bestLen) { bestLen = dp[i]; bestIdx = i; }
    }

    vector<int> path;
    for (int i = bestIdx; i != -1; i = par[i]) path.push_back(i + 1);
    reverse(path.begin(), path.end());
    cout << bestLen << "\\n";
    for (int i = 0; i < (int)path.size(); i++) cout << path[i] << " \\n"[i + 1 == (int)path.size()];
    return 0;
}`,
      explanation: [
        "State: dp[i] = longest valid path ending at pillar i. The predecessors of i are the earlier pillars whose height lies outside the open band (h_i - d, h_i + d), which is the union of two ranges on the value axis. A segment tree serves both with one query each, so the O(n^2) inner loop disappears.",
        "Storing (length, index) instead of just the length is what makes reconstruction possible. Because the pair comparison is lexicographic, max still selects a genuine maximum length and hands back some index realising it; that index becomes the parent pointer, and walking the parents from the global best gives the actual sequence. Any tie is fine since the problem accepts any optimal path.",
        "The two boundaries need different binary searches: upper_bound minus one for 'the last value at most h_i - d' and lower_bound for 'the first value at least h_i + d'. Reusing lower_bound for both is the classic off-by-one that drops legal predecessors whose height equals h_i - d exactly.",
        "Note d may be 0, in which case the two ranges overlap and cover everything - harmless, because max over a max-tree is idempotent. Heights reach 10^15, so h[i] + d must be computed in 64-bit and compared against a 64-bit coordinate list.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Intervals (Educational DP Contest W)",
      difficulty: "Hard",
      variation: "Lazy segment tree: range add plus range max",
      link: "https://atcoder.jp/contests/dp/tasks/dp_w",
      question: [
        "You are given an integer N and M restrictions. The i-th restriction is a triple (l_i, r_i, a_i). Consider a string of length N made of the characters 0 and 1. Its score is the sum of a_i over all restrictions i such that the substring from position l_i to position r_i contains at least one 1. Find the maximum possible score over all 2^N strings.",
        "Example 1:\nInput:\n5 3\n1 3 10\n2 4 -10\n3 5 10\nOutput: 20\nExplanation: The string 10001 satisfies restriction 1 (position 1 is a 1) and restriction 3 (position 5 is a 1) but not restriction 2, giving 10 + 10 = 20.",
        "Example 2:\nInput:\n2 2\n1 2 -5\n2 2 3\nOutput: 0\nExplanation: Any string containing a 1 also triggers the restriction worth -5, and the best it can gain back is 3, so the all-zero string with score 0 is optimal.",
        "Constraints:\n- 1 <= N <= 2 * 10^5\n- 1 <= M <= 2 * 10^5\n- 1 <= l_i <= r_i <= N\n- -10^9 <= a_i <= 10^9",
      ],
      code: `const long long NEG = -(1LL << 62);
int N;
vector<long long> mx, lz;

void applyAdd(int node, long long v) { mx[node] += v; lz[node] += v; }

void push(int node) {
    if (lz[node] != 0) {
        applyAdd(2 * node, lz[node]);
        applyAdd(2 * node + 1, lz[node]);
        lz[node] = 0;
    }
}

void rangeAdd(int node, int l, int r, int ql, int qr, long long v) {
    if (qr < l || r < ql) return;
    if (ql <= l && r <= qr) { applyAdd(node, v); return; }
    push(node);
    int mid = (l + r) / 2;
    rangeAdd(2 * node, l, mid, ql, qr, v);
    rangeAdd(2 * node + 1, mid + 1, r, ql, qr, v);
    mx[node] = max(mx[2 * node], mx[2 * node + 1]);
}

void pointSet(int node, int l, int r, int pos, long long v) {
    if (l == r) { mx[node] = v; return; }
    push(node);
    int mid = (l + r) / 2;
    if (pos <= mid) pointSet(2 * node, l, mid, pos, v);
    else pointSet(2 * node + 1, mid + 1, r, pos, v);
    mx[node] = max(mx[2 * node], mx[2 * node + 1]);
}

long long queryMax(int node, int l, int r, int ql, int qr) {
    if (qr < l || r < ql) return NEG;
    if (ql <= l && r <= qr) return mx[node];
    push(node);
    int mid = (l + r) / 2;
    return max(queryMax(2 * node, l, mid, ql, qr), queryMax(2 * node + 1, mid + 1, r, ql, qr));
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int M;
    cin >> N >> M;
    vector<vector<pair<int,long long>>> byEnd(N + 1);
    for (int i = 0; i < M; i++) {
        int l, r;
        long long a;
        cin >> l >> r >> a;
        byEnd[r].push_back({l, a});      // bucket each restriction by its right end
    }

    mx.assign(4 * (N + 1), NEG);
    lz.assign(4 * (N + 1), 0);
    pointSet(1, 0, N, 0, 0);             // state 0 = no 1 placed yet, score 0

    for (int i = 1; i <= N; i++) {
        long long best = queryMax(1, 0, N, 0, i - 1);
        pointSet(1, 0, N, i, best);      // place a 1 at position i
        // every restriction ending at i is now satisfied iff the last 1 is at or after l
        for (auto& [l, a] : byEnd[i]) rangeAdd(1, 0, N, l, i, a);
    }

    cout << queryMax(1, 0, N, 0, N) << "\\n";
    return 0;
}`,
      explanation: [
        "State: after deciding positions 1..i, dp[j] = best score counting only restrictions with r <= i, given that the rightmost 1 so far sits at position j (j = 0 meaning no 1 at all). That single number j is enough, because whether a restriction [l, r] with r <= i is satisfied depends only on whether the last 1 up to r is at least l.",
        "The transition is the interesting part. Moving from i-1 to i, placing a 1 at position i creates the new state j = i whose value is max over all previous states dp[0..i-1] - one range-max query, one point assignment. Then each restriction ending exactly at i is satisfied precisely by the states j in [l, i], so its a_i is added to that whole block at once: one range add. Restrictions are grouped by right endpoint so each is applied exactly once.",
        "That combination - range add on the DP layer, range max to read it - is why a lazy segment tree is required rather than the plain point-update tree used by every earlier problem here. The naive O(N * M) or O(N^2) DP updates each state individually and is far too slow at 2 * 10^5.",
        "Unreachable states start at negative infinity so they can never win a max, and the lazy adds they accumulate keep them hugely negative; NEG must therefore leave headroom for up to 2 * 10^5 additions of magnitude 10^9. Keeping dp[0] = 0 in the tree is what allows the all-zero string, which is the answer whenever every restriction is a net loss.",
        "Time: O((N + M) log N). Space: O(N + M).",
      ],
    },
  ],
};
