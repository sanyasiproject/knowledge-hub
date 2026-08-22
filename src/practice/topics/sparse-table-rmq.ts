import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Static Range Minimum Queries",
      difficulty: "Easy",
      variation: "Sparse table for min, the template",
      link: "https://cses.fi/problemset/task/1647",
      question: [
        "You are given an array of n integers that never changes, and q queries. Each query gives a range [a, b] (1-indexed, inclusive) and asks for the minimum value inside that range. Print one answer per query.",
        "Example 1:\nInput:\n8 4\n3 2 4 5 1 1 5 3\n2 4\n5 6\n1 8\n3 3\nOutput:\n2\n1\n1\n4\nExplanation: Range [2,4] holds 2, 4, 5 so the minimum is 2. Range [5,6] holds 1, 1. Range [1,8] contains the global minimum 1. Range [3,3] is the single element 4.",
        "Example 2:\nInput:\n3 2\n7 7 7\n1 2\n2 3\nOutput:\n7\n7\nExplanation: Every element is equal, so every range minimum is 7.",
        "Constraints:\n- 1 <= n, q <= 2 * 10^5\n- 1 <= array values <= 10^9\n- 1 <= a <= b <= n\n- The array is never updated",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    vector<int> a(n);
    for (int &x : a) cin >> x;

    // lg[len] = floor(log2(len)), computed without any floating point
    vector<int> lg(n + 1, 0);
    for (int i = 2; i <= n; i++) lg[i] = lg[i / 2] + 1;

    int K = lg[n] + 1;                       // number of levels we actually need
    vector<vector<int>> sp(K, vector<int>(n));
    for (int i = 0; i < n; i++) sp[0][i] = a[i];
    for (int j = 1; j < K; j++)
        for (int i = 0; i + (1 << j) <= n; i++)
            // a block of length 2^j is two adjacent blocks of length 2^(j-1)
            sp[j][i] = min(sp[j - 1][i], sp[j - 1][i + (1 << (j - 1))]);

    while (q--) {
        int l, r;
        cin >> l >> r;
        --l; --r;
        int j = lg[r - l + 1];               // largest power of two that fits
        // the two blocks overlap in the middle; harmless for min
        cout << min(sp[j][l], sp[j][r - (1 << j) + 1]) << "\\n";
    }
    return 0;
}`,
      explanation: [
        "The state is sp[j][i] = the minimum of the block of length 2^j that starts at index i. Level 0 is the array itself, and each higher level is built by merging two already-computed blocks of half the length, so the whole table costs O(n log n) to fill.",
        "A query on [l, r] takes j = floor(log2(r-l+1)) and merges the block starting at l with the block ending at r. Those two blocks each have length 2^j, together they are at least the length of the range, and neither leaves it - so they cover the range exactly, with an overlap in the middle. Min is idempotent, meaning min(x, x) = x, so counting the overlapped elements twice changes nothing and the answer is exact in O(1).",
        "That idempotence is the whole contract. Sum, product and XOR are not idempotent, so this two-block trick silently double-counts and gives wrong answers; use prefix sums or a segment tree there, or a disjoint sparse table. What does work here: min, max, gcd, lcm, bitwise AND, bitwise OR.",
        "Compute floor(log2) with the integer recurrence lg[i] = lg[i/2] + 1 rather than calling log2 - a floating-point log2 of a perfect power of two can round down to the wrong integer and corrupt one query in a million.",
        "Time: O(n log n) build, O(1) per query. Space: O(n log n).",
      ],
    },
    {
      name: "RMQSQ - Range Minimum Query",
      difficulty: "Easy",
      variation: "Zero-indexed min queries, reusable struct",
      link: "https://www.spoj.com/problems/RMQSQ/",
      question: [
        "You are given an array of N integers and Q queries. Each query gives two 0-indexed positions i and j and asks for the smallest value among a[i], a[i+1], ..., a[j]. The array is static. Print one answer per line.",
        "Example 1:\nInput:\n3\n1 4 1\n2\n1 1\n1 2\nOutput:\n4\n1\nExplanation: The first query is the single element a[1] = 4. The second covers a[1] and a[2], whose minimum is 1.",
        "Example 2:\nInput:\n5\n5 4 3 2 1\n2\n0 4\n0 1\nOutput:\n1\n4\nExplanation: The array is strictly decreasing, so a prefix range minimum is always its last element.",
        "Constraints:\n- 1 <= N <= 10^5\n- 1 <= Q <= 10^4\n- 0 <= a[i] <= 10^9\n- 0 <= i <= j < N",
      ],
      code: `struct SparseMin {
    vector<vector<int>> sp;
    vector<int> lg;

    void build(const vector<int>& a) {
        int n = a.size();
        lg.assign(n + 1, 0);
        for (int i = 2; i <= n; i++) lg[i] = lg[i / 2] + 1;
        int K = lg[n] + 1;
        sp.assign(K, vector<int>(n));
        for (int i = 0; i < n; i++) sp[0][i] = a[i];
        for (int j = 1; j < K; j++)
            for (int i = 0; i + (1 << j) <= n; i++)
                sp[j][i] = min(sp[j - 1][i], sp[j - 1][i + (1 << (j - 1))]);
    }

    int query(int l, int r) const {          // inclusive, 0-indexed
        int j = lg[r - l + 1];
        return min(sp[j][l], sp[j][r - (1 << j) + 1]);
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> a(n);
    for (int &x : a) cin >> x;
    SparseMin st;
    st.build(a);
    int q;
    cin >> q;
    while (q--) {
        int l, r;
        cin >> l >> r;
        if (l > r) swap(l, r);              // defensive: some judges give them unordered
        cout << st.query(l, r) << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Same structure as the template, packaged so the table can be dropped into any problem. Keeping lg as a member array matters: recomputing logs per query, or calling __builtin_clz in a hot loop, is where naive implementations lose their constant factor.",
        "Note the memory layout - levels first, positions second. sp[j] is one contiguous vector, so the build loop walks memory linearly. The transposed layout sp[i][j] has the same asymptotics but roughly halves the cache hit rate on large n.",
        "The tempting wrong approach at this size is a segment tree, which is not wrong but is strictly worse here: the array is static, so paying O(log n) per query buys nothing over O(1). Conversely, if a single update were allowed the sparse table would have to be rebuilt from scratch and the segment tree would win outright.",
        "Time: O(n log n) build, O(1) per query. Space: O(n log n).",
      ],
    },
    {
      name: "Sliding Window Maximum",
      difficulty: "Medium",
      variation: "Fixed-width window max via O(1) RMQ",
      link: "https://leetcode.com/problems/sliding-window-maximum/",
      question: [
        "You are given an integer array nums and an integer k. A window of size k slides from the very left of the array to the very right, moving one position at a time. Return an array containing the maximum of each window position, in order.",
        "Example 1:\nInput: nums = [1,3,-1,-3,5,3,6,7], k = 3\nOutput: [3,3,5,5,6,7]\nExplanation: The windows are [1,3,-1] -> 3, [3,-1,-3] -> 3, [-1,-3,5] -> 5, [-3,5,3] -> 5, [5,3,6] -> 6, [3,6,7] -> 7.",
        "Example 2:\nInput: nums = [9,10,9,-7,-4,-8,2,-6], k = 5\nOutput: [10,10,9,2]\nExplanation: The four windows are [9,10,9,-7,-4], [10,9,-7,-4,-8], [9,-7,-4,-8,2] and [-7,-4,-8,2,-6], with maxima 10, 10, 9 and 2.",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- -10^4 <= nums[i] <= 10^4\n- 1 <= k <= nums.length",
      ],
      code: `vector<int> maxSlidingWindow(vector<int>& nums, int k) {
    int n = nums.size();
    vector<int> lg(n + 1, 0);
    for (int i = 2; i <= n; i++) lg[i] = lg[i / 2] + 1;
    int K = lg[n] + 1;
    vector<vector<int>> sp(K, vector<int>(n));
    for (int i = 0; i < n; i++) sp[0][i] = nums[i];
    for (int j = 1; j < K; j++)
        for (int i = 0; i + (1 << j) <= n; i++)
            sp[j][i] = max(sp[j - 1][i], sp[j - 1][i + (1 << (j - 1))]);

    int j = lg[k];                            // every window has the same length
    vector<int> res;
    res.reserve(n - k + 1);
    for (int l = 0; l + k <= n; l++) {
        int r = l + k - 1;
        res.push_back(max(sp[j][l], sp[j][r - (1 << j) + 1]));
    }
    return res;
}`,
      explanation: [
        "Max is idempotent, so the same two-overlapping-blocks query works with min replaced by max. Because every window has the identical length k, the level index j = lg[k] is loop-invariant and each window costs two array reads and one comparison.",
        "This is worth knowing precisely because it is not the intended solution. The monotonic deque solves this in O(n) time and O(k) space, and it is the better answer in an interview. The sparse table earns its keep the moment the windows stop being uniform - variable-length ranges, or ranges chosen adaptively by a later phase of the algorithm.",
        "The trap in the sparse table version is memory, not time: K is about 17 for n = 10^5, so the table is roughly 1.7 million ints. That is fine here but becomes the binding constraint around n = 10^7, where the deque still works and the table does not.",
        "Time: O(n log n) build, O(1) per window. Space: O(n log n).",
      ],
    },
    {
      name: "Longest Continuous Subarray With Absolute Diff Less Than or Equal to Limit",
      difficulty: "Medium",
      variation: "Two sparse tables (max and min) plus sliding window",
      link: "https://leetcode.com/problems/longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit/",
      question: [
        "Given an array of integers nums and an integer limit, return the length of the longest non-empty subarray such that the absolute difference between any two elements of that subarray is at most limit. Equivalently, the subarray's maximum minus its minimum must be at most limit.",
        "Example 1:\nInput: nums = [8,2,4,7], limit = 4\nOutput: 2\nExplanation: [8,2] spreads 6, [2,4] spreads 2 (valid), [4,7] spreads 3 (valid), [2,4,7] spreads 5. The longest valid subarray has length 2.",
        "Example 2:\nInput: nums = [10,1,2,4,7,2], limit = 5\nOutput: 4\nExplanation: [2,4,7,2] has maximum 7 and minimum 2, a spread of exactly 5, and no valid subarray is longer.",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- 1 <= nums[i] <= 10^9\n- 0 <= limit <= 10^9",
      ],
      code: `int longestSubarray(vector<int>& nums, int limit) {
    int n = nums.size();
    vector<int> lg(n + 1, 0);
    for (int i = 2; i <= n; i++) lg[i] = lg[i / 2] + 1;
    int K = lg[n] + 1;
    vector<vector<int>> mx(K, vector<int>(n)), mn(K, vector<int>(n));
    for (int i = 0; i < n; i++) { mx[0][i] = nums[i]; mn[0][i] = nums[i]; }
    for (int j = 1; j < K; j++)
        for (int i = 0; i + (1 << j) <= n; i++) {
            mx[j][i] = max(mx[j - 1][i], mx[j - 1][i + (1 << (j - 1))]);
            mn[j][i] = min(mn[j - 1][i], mn[j - 1][i + (1 << (j - 1))]);
        }

    auto spread = [&](int l, int r) {          // max - min over [l, r] in O(1)
        int j = lg[r - l + 1];
        int hi = max(mx[j][l], mx[j][r - (1 << j) + 1]);
        int lo = min(mn[j][l], mn[j][r - (1 << j) + 1]);
        return hi - lo;
    };

    int best = 0, l = 0;
    for (int r = 0; r < n; r++) {
        // shrinking from the left can only reduce the spread, so l never moves back
        while (spread(l, r) > limit) l++;
        best = max(best, r - l + 1);
    }
    return best;
}`,
      explanation: [
        "The predicate 'spread(l, r) <= limit' is monotone in both directions: extending a range can only widen the spread, shrinking it can only narrow it. That is exactly the condition a two-pointer scan needs, so for each right endpoint the smallest feasible left endpoint never moves backwards.",
        "Each step of the scan needs one range max and one range min, which is what the two sparse tables provide in constant time. Total work is O(n log n) for the build and O(n) for the scan.",
        "The trap: with only a max table you cannot recover the answer, and with a single table storing pairs you must keep the two aggregates independent - a combined 'spread' cannot be merged, because the max of two blocks and the min of two blocks come from different positions. Merge max and min separately, then subtract at the very end.",
        "The textbook O(n) solution keeps two monotonic deques instead. The sparse table version is longer but generalises: once you also need to answer arbitrary offline range-spread questions, the tables are already built.",
        "Time: O(n log n). Space: O(n log n).",
      ],
    },
    {
      name: "Company Queries II",
      difficulty: "Medium",
      variation: "LCA as an Euler-tour RMQ",
      link: "https://cses.fi/problemset/task/1688",
      question: [
        "A company has n employees numbered 1..n. Employee 1 is the general director, and the second input line gives the direct boss of employees 2, 3, ..., n, so the reporting structure is a tree rooted at employee 1. For each of q queries (a, b), report the lowest employee who is a boss of both a and b, where an employee counts as a boss of itself.",
        "Example 1:\nInput:\n5 3\n1 1 2 2\n4 5\n3 5\n2 4\nOutput:\n2\n1\n2\nExplanation: The bosses of employees 2, 3, 4, 5 are 1, 1, 2, 2, so the tree is 1 -> {2, 3} and 2 -> {4, 5}. Employees 4 and 5 are siblings under 2. Employees 3 and 5 only share the director 1. Employee 2 is itself an ancestor of 4.",
        "Example 2:\nInput:\n4 2\n1 2 3\n2 4\n1 1\nOutput:\n2\n1\nExplanation: The tree is a chain 1 -> 2 -> 3 -> 4. On a chain the answer is whichever of the two nodes is closer to the root, and a node paired with itself answers itself.",
        "Constraints:\n- 1 <= n, q <= 2 * 10^5\n- The input describes a tree rooted at employee 1",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    vector<vector<int>> ch(n + 1);
    for (int i = 2; i <= n; i++) { int p; cin >> p; ch[p].push_back(i); }

    // Iterative Euler tour: the node is re-appended every time a child returns.
    vector<int> euler, depth(n + 1, 0), first(n + 1, -1), ptr(n + 1, 0), stk;
    euler.reserve(2 * n);
    stk.push_back(1);
    first[1] = 0;
    euler.push_back(1);
    while (!stk.empty()) {
        int u = stk.back();
        if (ptr[u] < (int)ch[u].size()) {
            int v = ch[u][ptr[u]++];
            depth[v] = depth[u] + 1;
            first[v] = euler.size();
            euler.push_back(v);
            stk.push_back(v);
        } else {
            stk.pop_back();
            if (!stk.empty()) euler.push_back(stk.back());
        }
    }

    int m = euler.size();
    vector<int> lg(m + 1, 0);
    for (int i = 2; i <= m; i++) lg[i] = lg[i / 2] + 1;
    int K = lg[m] + 1;
    vector<vector<int>> sp(K, vector<int>(m));
    for (int i = 0; i < m; i++) sp[0][i] = euler[i];
    // "min" here means the shallower of two nodes
    auto up = [&](int x, int y) { return depth[x] <= depth[y] ? x : y; };
    for (int j = 1; j < K; j++)
        for (int i = 0; i + (1 << j) <= m; i++)
            sp[j][i] = up(sp[j - 1][i], sp[j - 1][i + (1 << (j - 1))]);

    while (q--) {
        int a, b;
        cin >> a >> b;
        int l = first[a], r = first[b];
        if (l > r) swap(l, r);
        int j = lg[r - l + 1];
        cout << up(sp[j][l], sp[j][r - (1 << j) + 1]) << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Walk the tree and write down every node each time the walk touches it. That Euler tour has length 2n-1. Between the first occurrence of a and the first occurrence of b the walk must climb to their lowest common ancestor and cannot climb any higher, because leaving the LCA's subtree would require passing through the LCA's parent, which only happens after the whole subtree is finished. So the minimum-depth node in that slice of the tour is exactly the LCA.",
        "That turns LCA into a range-minimum query on an array of size 2n-1, keyed by depth. Storing node ids and comparing by depth is cleaner than storing pairs, and 'shallower of two' is idempotent, so the standard overlapping-blocks query is valid.",
        "The alternative is binary lifting, which answers in O(log n) with O(n log n) memory. Euler tour plus sparse table answers in O(1) with the same memory order, and it is the natural choice when the query count dwarfs n. Binary lifting stays preferable when you also need the k-th ancestor for arbitrary k.",
        "Do the DFS iteratively. A tree of 2 * 10^5 nodes can be a single chain, and a recursive tour blows the stack on many judges - a wrong answer that looks like a runtime error rather than a logic bug.",
        "Time: O(n log n) build, O(1) per query. Space: O(n log n).",
      ],
    },
    {
      name: "Find Building Where Alice and Bob Can Meet",
      difficulty: "Hard",
      variation: "First index exceeding a value, by binary search over RMQ",
      link: "https://leetcode.com/problems/find-building-where-alice-and-bob-can-meet/",
      question: [
        "You are given a 0-indexed array heights of building heights, and a list of queries where queries[i] = [a, b]. Alice starts in building a and Bob in building b. A person in building i can move to building j only if i < j and heights[i] < heights[j]. For each query return the leftmost building index where Alice and Bob can meet, or -1 if they cannot meet. They may also meet where they already stand.",
        "Example 1:\nInput: heights = [6,4,8,5,2,7], queries = [[0,1],[0,3],[2,4],[3,4],[2,2]]\nOutput: [2,5,-1,5,2]\nExplanation: For [0,1] both must reach a building right of index 1 that is taller than 6, and index 2 (height 8) is the first. For [0,3] the first index right of 3 taller than 6 is 5 (height 7). For [2,4] nothing right of index 4 exceeds 8, so -1. For [2,2] they already stand together.",
        "Example 2:\nInput: heights = [5,3,8,2,6,1,4,6], queries = [[0,7],[3,5],[5,2],[3,0],[1,6]]\nOutput: [7,6,-1,4,6]\nExplanation: For [0,7], heights[0] = 5 < heights[7] = 6, so Alice simply walks to Bob at index 7. For [5,2] Bob stands at height 8 and no building right of index 5 exceeds 8, so -1. For [3,0], heights[0] = 5 > heights[3] = 2 and index 4 (height 6) is the first index right of 3 exceeding 5.",
        "Constraints:\n- 1 <= heights.length <= 5 * 10^4\n- 1 <= heights[i] <= 10^9\n- 1 <= queries.length <= 5 * 10^4\n- 0 <= a, b < heights.length",
      ],
      code: `vector<int> leftmostBuildingQueries(vector<int>& heights, vector<vector<int>>& queries) {
    int n = heights.size();
    vector<int> lg(n + 1, 0);
    for (int i = 2; i <= n; i++) lg[i] = lg[i / 2] + 1;
    int K = lg[n] + 1;
    vector<vector<int>> sp(K, vector<int>(n));
    for (int i = 0; i < n; i++) sp[0][i] = heights[i];
    for (int j = 1; j < K; j++)
        for (int i = 0; i + (1 << j) <= n; i++)
            sp[j][i] = max(sp[j - 1][i], sp[j - 1][i + (1 << (j - 1))]);

    auto qmax = [&](int l, int r) {
        int j = lg[r - l + 1];
        return max(sp[j][l], sp[j][r - (1 << j) + 1]);
    };

    vector<int> ans;
    ans.reserve(queries.size());
    for (auto& q : queries) {
        int a = q[0], b = q[1];
        if (a > b) swap(a, b);                 // b is now the rightmost start
        if (a == b || heights[a] < heights[b]) { ans.push_back(b); continue; }
        int need = max(heights[a], heights[b]);
        // qmax(b+1, mid) is non-decreasing in mid, so binary search the first hit
        int lo = b + 1, hi = n - 1, res = -1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (qmax(b + 1, mid) > need) { res = mid; hi = mid - 1; }
            else lo = mid + 1;
        }
        ans.push_back(res);
    }
    return ans;
}`,
      explanation: [
        "Normalise so a <= b. Two easy cases close first: if the starts coincide they are already together, and if heights[a] < heights[b] then Alice can jump straight to b, which is the leftmost possible meeting point since no index below b is reachable by Bob.",
        "Otherwise heights[a] >= heights[b] and the meeting point must lie strictly right of b with height strictly greater than max(heights[a], heights[b]). Crucially, that single condition is enough for both people: a building taller than both can be reached in one hop from either start, so no multi-hop reasoning is needed.",
        "The remaining question - the first index after b whose height exceeds a threshold - is answered by binary searching on the prefix maximum. qmax(b+1, mid) is non-decreasing as mid grows, so the predicate 'some index up to mid exceeds need' flips exactly once, and the search finds the flip in O(log n) with O(1) range queries.",
        "The tempting wrong move is to search for the first index taller than heights[b] alone, forgetting that Alice must also be able to hop there. Using max of the two heights as the threshold is what makes the answer symmetric and correct.",
        "Time: O(n log n) build plus O(log n) per query. Space: O(n log n).",
      ],
    },
    {
      name: "FREQUENT - Frequent Values",
      difficulty: "Hard",
      variation: "RMQ over run-length blocks",
      link: "https://www.spoj.com/problems/FREQUENT/",
      question: [
        "You are given a sequence of n integers in non-decreasing order. For each of q queries (i, j), 1-indexed and inclusive, report how many times the most frequent value occurs inside a[i..j]. The input holds several test cases, each starting with a line 'n q' and ending with a line containing a single 0 in place of n.",
        "Example 1:\nInput:\n10 3\n-1 -1 1 1 1 1 3 10 10 10\n2 3\n1 10\n5 10\n0\nOutput:\n1\n4\n3\nExplanation: The range [2,3] holds -1 and 1, each once, so the answer is 1. Over the whole array the value 1 occurs four times. The range [5,10] holds 1, 1, 3, 10, 10, 10, and 10 occurs three times.",
        "Example 2:\nInput:\n5 2\n2 2 2 5 5\n1 3\n3 5\n0\nOutput:\n3\n2\nExplanation: The range [1,3] is entirely inside the run of 2s, giving 3. The range [3,5] holds one 2 and two 5s, so the answer is 2.",
        "Constraints:\n- 1 <= n, q <= 10^5\n- -10^5 <= a[i] <= 10^5, and the sequence is sorted non-decreasing\n- 1 <= i <= j <= n",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    while (cin >> n && n) {
        cin >> q;
        vector<int> a(n);
        for (int &x : a) cin >> x;

        // Sorted input means equal values form maximal contiguous runs.
        vector<int> id(n), cnt;
        int b = -1;
        for (int i = 0; i < n; i++) {
            if (i == 0 || a[i] != a[i - 1]) { b++; cnt.push_back(0); }
            id[i] = b;
            cnt[b]++;
        }
        int m = cnt.size();
        vector<int> st(m), en(m);
        for (int i = 0; i < n; i++) {
            if (i == 0 || id[i] != id[i - 1]) st[id[i]] = i;
            if (i == n - 1 || id[i] != id[i + 1]) en[id[i]] = i;
        }

        vector<int> lg(m + 1, 0);
        for (int i = 2; i <= m; i++) lg[i] = lg[i / 2] + 1;
        int K = lg[m] + 1;
        vector<vector<int>> sp(K, vector<int>(m));
        for (int i = 0; i < m; i++) sp[0][i] = cnt[i];
        for (int j = 1; j < K; j++)
            for (int i = 0; i + (1 << j) <= m; i++)
                sp[j][i] = max(sp[j - 1][i], sp[j - 1][i + (1 << (j - 1))]);
        auto qmax = [&](int l, int r) {
            int j = lg[r - l + 1];
            return max(sp[j][l], sp[j][r - (1 << j) + 1]);
        };

        while (q--) {
            int l, r;
            cin >> l >> r;
            --l; --r;
            if (id[l] == id[r]) { cout << r - l + 1 << "\\n"; continue; }
            // clipped ends counted directly, whole runs in between via RMQ
            int ans = max(en[id[l]] - l + 1, r - st[id[r]] + 1);
            if (id[l] + 1 <= id[r] - 1) ans = max(ans, qmax(id[l] + 1, id[r] - 1));
            cout << ans << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "Sortedness is the whole idea: equal values are contiguous, so the array compresses into m runs, and any query range touches at most two partial runs (the leftmost and the rightmost) with a block of complete runs between them.",
        "The complete runs in the middle contribute their full lengths, and the maximum of those lengths is a range-maximum query over the run-length array - O(1) with a sparse table. The two clipped ends must be counted by hand from their run boundaries, since their contribution depends on where the query cuts them.",
        "The single-run case has to be special-cased first. If l and r fall in the same run the answer is simply r-l+1, and the general formula would index a middle range that does not exist.",
        "The classic bug is querying the middle over [id[l], id[r]] instead of [id[l]+1, id[r]-1], which credits the boundary runs with their full length even though the query only covers part of them - producing answers that are too large exactly on the interesting inputs.",
        "Time: O(n + m log m) per test case, O(1) per query. Space: O(m log m).",
      ],
    },
    {
      name: "Find a Value of a Mysterious Function Closest to Target",
      difficulty: "Hard",
      variation: "Bitwise AND sparse table plus equal-value block search",
      link: "https://leetcode.com/problems/find-a-value-of-a-mysterious-function-closest-to-target/",
      question: [
        "Given an array arr of positive integers and an integer target, consider every non-empty subarray and let its value be the bitwise AND of all its elements. Return the minimum possible absolute difference between such a value and target.",
        "Example 1:\nInput: arr = [9,12,3,7,15], target = 5\nOutput: 2\nExplanation: The subarray [3] has AND 3 with difference 2, and [7] has AND 7 also with difference 2. No subarray AND lands closer to 5 - for instance [9,12] has AND 8 (difference 3) and [12,3] has AND 0 (difference 5).",
        "Example 2:\nInput: arr = [1000000,1000000,1000000], target = 1\nOutput: 999999\nExplanation: Every subarray ANDs to 1000000, so the difference is always 999999.",
        "Example 3:\nInput: arr = [1,2,4,8,16], target = 0\nOutput: 0\nExplanation: The elements are disjoint powers of two, so any subarray of length two or more ANDs to 0, matching the target exactly.",
        "Constraints:\n- 1 <= arr.length <= 10^5\n- 1 <= arr[i] <= 10^6\n- 0 <= target <= 10^7",
      ],
      code: `int closestToTarget(vector<int>& arr, int target) {
    int n = arr.size();
    vector<int> lg(n + 1, 0);
    for (int i = 2; i <= n; i++) lg[i] = lg[i / 2] + 1;
    int K = lg[n] + 1;
    vector<vector<int>> sp(K, vector<int>(n));
    for (int i = 0; i < n; i++) sp[0][i] = arr[i];
    for (int j = 1; j < K; j++)
        for (int i = 0; i + (1 << j) <= n; i++)
            sp[j][i] = sp[j - 1][i] & sp[j - 1][i + (1 << (j - 1))];   // AND is idempotent

    auto qand = [&](int l, int r) {
        int j = lg[r - l + 1];
        return sp[j][l] & sp[j][r - (1 << j) + 1];
    };

    int best = INT_MAX;
    for (int l = 0; l < n; l++) {
        int r = l;
        while (r < n) {
            int v = qand(l, r);
            best = min(best, abs(v - target));
            // AND over [l, r] only loses bits as r grows, so equal values are contiguous
            int lo = r, hi = n - 1, last = r;
            while (lo <= hi) {
                int mid = lo + (hi - lo) / 2;
                if (qand(l, mid) == v) { last = mid; lo = mid + 1; }
                else hi = mid - 1;
            }
            r = last + 1;                     // jump straight to the next distinct value
        }
    }
    return best;
}`,
      explanation: [
        "Bitwise AND is idempotent, so the overlapping two-block query is valid and any subarray AND is available in O(1). That alone is not enough - there are O(n^2) subarrays.",
        "The saving observation: for a fixed left end l, the value qand(l, r) is monotonically non-increasing in r as a bitmask, because extending the range can only clear bits, never set them. With values under 10^6 only 20 bits exist, so along the whole sweep of r there are at most 21 distinct values, each occupying a contiguous block of r.",
        "So instead of stepping r one at a time, binary search the last r that keeps the current value and jump past it. Each left end costs O(log(maxV) * log n), giving about 20 * 17 constant-time queries rather than n of them.",
        "The wrong-but-tempting shortcut is a two-pointer sweep, as if the AND were a sliding-window aggregate with a monotone feasibility predicate. It is not: |AND - target| is not monotone in the window, so a window that gets worse may get better again, and the pointer logic silently skips the optimum. Enumerate the distinct AND values instead.",
        "Time: O(n log n) build plus O(n log(maxV) log n) for the sweep. Space: O(n log n).",
      ],
    },
    {
      name: "Rectangle GCD",
      difficulty: "Hard",
      variation: "GCD sparse table over difference arrays",
      link: "https://atcoder.jp/contests/abc254/tasks/abc254_f",
      question: [
        "You are given two sequences A and B, each of length N. They define an N x N grid whose cell (i, j) holds A[i] + B[j]. Answer Q queries: given h1, h2, w1, w2 (all 1-indexed, h1 <= h2 and w1 <= w2), print the greatest common divisor of all cells (i, j) with h1 <= i <= h2 and w1 <= j <= w2.",
        "Example 1:\nInput:\n3 2\n3 5 2\n8 1 3\n1 2 2 3\n1 3 1 1\nOutput:\n2\n1\nExplanation: The grid rows are (11, 4, 6), (13, 6, 8) and (10, 3, 5). The first query covers rows 1-2 and columns 2-3, that is 4, 6, 6, 8, whose gcd is 2. The second covers column 1 of all rows, that is 11, 13, 10, whose gcd is 1.",
        "Example 2:\nInput:\n2 1\n4 4\n2 6\n1 2 1 2\nOutput:\n2\nExplanation: The grid is (6, 10) and (6, 10). The gcd of 6 and 10 is 2, and repeating the identical row changes nothing.",
        "Constraints:\n- 1 <= N, Q <= 2 * 10^5\n- 1 <= A[i], B[j] <= 10^9\n- 1 <= h1 <= h2 <= N and 1 <= w1 <= w2 <= N",
      ],
      code: `long long gcdl(long long a, long long b) { while (b) { long long t = a % b; a = b; b = t; } return a; }

struct GcdTable {
    vector<vector<long long>> sp;
    vector<int> lg;
    int n = 0;

    void build(const vector<long long>& a) {
        n = a.size();
        if (n == 0) return;                    // N = 1 leaves an empty difference array
        lg.assign(n + 1, 0);
        for (int i = 2; i <= n; i++) lg[i] = lg[i / 2] + 1;
        int K = lg[n] + 1;
        sp.assign(K, vector<long long>(n));
        for (int i = 0; i < n; i++) sp[0][i] = a[i];
        for (int j = 1; j < K; j++)
            for (int i = 0; i + (1 << j) <= n; i++)
                sp[j][i] = gcdl(sp[j - 1][i], sp[j - 1][i + (1 << (j - 1))]);
    }

    long long query(int l, int r) const {      // returns 0 (the gcd identity) if empty
        if (l > r || n == 0) return 0;
        int j = lg[r - l + 1];
        return gcdl(sp[j][l], sp[j][r - (1 << j) + 1]);
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    vector<long long> A(n), B(n);
    for (auto &x : A) cin >> x;
    for (auto &x : B) cin >> x;
    vector<long long> dA(max(0, n - 1)), dB(max(0, n - 1));
    for (int i = 0; i + 1 < n; i++) dA[i] = llabs(A[i + 1] - A[i]);
    for (int i = 0; i + 1 < n; i++) dB[i] = llabs(B[i + 1] - B[i]);
    GcdTable ta, tb;
    ta.build(dA);
    tb.build(dB);
    while (q--) {
        int h1, h2, w1, w2;
        cin >> h1 >> h2 >> w1 >> w2;
        --h1; --h2; --w1; --w2;
        long long g = A[h1] + B[w1];           // one anchor cell
        g = gcdl(g, ta.query(h1, h2 - 1));     // row differences inside the block
        g = gcdl(g, tb.query(w1, w2 - 1));     // column differences inside the block
        cout << g << "\\n";
    }
    return 0;
}`,
      explanation: [
        "The key identity is gcd(x, y) = gcd(x, y - x): subtracting one argument from another never changes the gcd. Applying it across a row, the gcd of the whole submatrix equals the gcd of one anchor cell together with all consecutive differences inside the block.",
        "Because cell (i, j) is A[i] + B[j], the difference between vertically adjacent cells is A[i+1] - A[i] regardless of the column, and horizontally it is B[j+1] - B[j] regardless of the row. So the submatrix gcd collapses to gcd of A[h1]+B[w1], the gcd of A-differences over [h1, h2-1], and the gcd of B-differences over [w1, w2-1] - three numbers, not (h2-h1+1)*(w2-w1+1).",
        "Those two difference gcds are exactly range-gcd queries on static arrays. Gcd is idempotent, since gcd(x, x) = x, so the overlapping-blocks sparse table applies unchanged and each query is O(1) up to the O(log) cost of the Euclidean merges.",
        "Two edge cases decide whether this passes: a single-row or single-column block has an empty difference range, and the query must then return the gcd identity 0 rather than reading out of bounds; and take absolute values of the differences so the Euclidean loop is never handed a negative. Cells reach 2 * 10^9, so 64-bit arithmetic is mandatory.",
        "Time: O(n log n log V) build, O(log V) per query. Space: O(n log n).",
      ],
    },
    {
      name: "CGCDSSQ",
      difficulty: "Hard",
      variation: "Counting subarrays by gcd with equal-value block jumps",
      link: "https://codeforces.com/problemset/problem/475/D",
      question: [
        "You are given an array a of n positive integers. For each of q queries with value x, count the number of index pairs (i, j) with i <= j such that the greatest common divisor of a[i], a[i+1], ..., a[j] equals exactly x.",
        "Example 1:\nInput:\n3\n2 6 3\n5\n1\n2\n3\n4\n6\nOutput:\n1\n2\n2\n0\n1\nExplanation: The six subarrays have gcds 2, 6, 3, gcd(2,6) = 2, gcd(6,3) = 3 and gcd(2,6,3) = 1. So gcd 1 occurs once, 2 occurs twice, 3 occurs twice, 4 never and 6 once.",
        "Example 2:\nInput:\n4\n4 4 4 4\n2\n4\n2\nOutput:\n10\n0\nExplanation: Every one of the 4*5/2 = 10 subarrays has gcd 4, and no subarray has gcd 2.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= a[i] <= 10^9\n- 1 <= q <= 3 * 10^5\n- 1 <= x <= 10^9",
      ],
      code: `long long gcdl(long long a, long long b) { while (b) { long long t = a % b; a = b; b = t; } return a; }

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<long long> a(n);
    for (auto &x : a) cin >> x;

    vector<int> lg(n + 1, 0);
    for (int i = 2; i <= n; i++) lg[i] = lg[i / 2] + 1;
    int K = lg[n] + 1;
    vector<vector<long long>> sp(K, vector<long long>(n));
    for (int i = 0; i < n; i++) sp[0][i] = a[i];
    for (int j = 1; j < K; j++)
        for (int i = 0; i + (1 << j) <= n; i++)
            sp[j][i] = gcdl(sp[j - 1][i], sp[j - 1][i + (1 << (j - 1))]);
    auto qgcd = [&](int l, int r) {
        int j = lg[r - l + 1];
        return gcdl(sp[j][l], sp[j][r - (1 << j) + 1]);
    };

    map<long long, long long> cnt;
    for (int l = 0; l < n; l++) {
        int r = l;
        while (r < n) {
            long long v = qgcd(l, r);
            // gcd(l, .) is non-increasing in r, so equal values form one block
            int lo = r, hi = n - 1, last = r;
            while (lo <= hi) {
                int mid = lo + (hi - lo) / 2;
                if (qgcd(l, mid) == v) { last = mid; lo = mid + 1; }
                else hi = mid - 1;
            }
            cnt[v] += last - r + 1;            // that many right ends share this gcd
            r = last + 1;
        }
    }

    int q;
    cin >> q;
    while (q--) {
        long long x;
        cin >> x;
        auto it = cnt.find(x);
        cout << (it == cnt.end() ? 0LL : it->second) << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Answer all queries offline from a single table: count how many subarrays produce each gcd value, then look each query up. The count can exceed 2^31 (n = 10^5 gives about 5 * 10^9 subarrays), so the tallies must be 64-bit.",
        "Fix the left end l. As r grows, gcd(a[l..r]) is non-increasing and each step either keeps the value or divides it by at least 2, so at most log2(10^9) < 30 distinct values appear. Equal values occupy contiguous blocks of r, which is what makes a binary search over the sparse table legal: the predicate 'gcd(l, mid) == v' is true on a prefix of the remaining range.",
        "For each block, all of its right ends contribute one subarray each to that gcd, so add the block length to the map in one step and jump past it. Total work is O(n log(maxV) log n) queries plus map insertions.",
        "The alternative without a sparse table is the classic 'map of gcds ending at position r' rolled forward, which is also O(n log maxV) and arguably simpler. Both beat the trap of enumerating all O(n^2) subarrays, which is 5 * 10^9 gcd calls.",
        "Time: O(n log n log V) build plus O(n log V (log n + log n)) counting, and O(log n) per query. Space: O(n log n).",
      ],
    },
  ],
};
