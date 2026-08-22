import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Merge Sort Tree for Range Order Statistics",
      difficulty: "Easy",
      variation: "Template: count values <= x in a range",
      question: [
        "Given a static array a of n integers, answer q queries of the form (l, r, x): how many indices i with l <= i <= r satisfy a[i] <= x? The array is never modified. Build a segment tree in which every node stores the elements of its own range in sorted order (a merge sort tree), then answer each query by binary searching inside the O(log n) nodes that cover the range.",
        "Example 1:\nInput: a = [2, 5, 1, 4, 9, 3], query l = 1, r = 4, x = 4\nOutput: 2\nExplanation: The subarray a[1..4] is [5, 1, 4, 9]. The values at most 4 are 1 and 4, so the answer is 2.",
        "Example 2:\nInput: a = [2, 5, 1, 4, 9, 3], query l = 0, r = 5, x = 9\nOutput: 6\nExplanation: Every one of the six elements is at most 9.",
        "Constraints:\n- 1 <= n <= 2 * 10^5\n- 1 <= q <= 2 * 10^5\n- -10^9 <= a[i], x <= 10^9",
      ],
      code: `template<class T> struct MST {
    int n;
    vector<vector<T>> t;                    // t[p] = elements of node p's range, sorted
    MST(const vector<T>& a) : n((int)a.size()), t(4 * a.size() + 4) {
        if (n) build(1, 0, n - 1, a);
    }
    void build(int p, int lo, int hi, const vector<T>& a) {
        if (lo == hi) { t[p] = {a[lo]}; return; }
        int mid = (lo + hi) / 2;
        build(2 * p, lo, mid, a);
        build(2 * p + 1, mid + 1, hi, a);
        t[p].resize(hi - lo + 1);
        // children are already sorted, so one linear merge builds the parent
        merge(t[2 * p].begin(), t[2 * p].end(),
              t[2 * p + 1].begin(), t[2 * p + 1].end(), t[p].begin());
    }
    int cnt(int p, int lo, int hi, int l, int r, T x) const {
        if (r < lo || hi < l) return 0;
        if (l <= lo && hi <= r)
            return (int)(upper_bound(t[p].begin(), t[p].end(), x) - t[p].begin());
        int mid = (lo + hi) / 2;
        return cnt(2 * p, lo, mid, l, r, x) + cnt(2 * p + 1, mid + 1, hi, l, r, x);
    }
    int atMost(int l, int r, T x) const { return l > r ? 0 : cnt(1, 0, n - 1, l, r, x); }
};

vector<int> rangeCountAtMost(vector<int>& a, vector<array<int,3>>& queries) {
    MST<int> st(a);
    vector<int> ans;
    ans.reserve(queries.size());
    for (auto& q : queries) ans.push_back(st.atMost(q[0], q[1], q[2]));
    return ans;
}`,
      explanation: [
        "The state stored at a node is the multiset of its range, kept sorted. That is exactly enough information to answer 'how many of my elements are <= x' in O(log(size)) by binary search, and nothing about the positions inside the node is needed.",
        "Building is a bottom-up merge sort: a node of size s is produced by merging its two sorted children in O(s). Summed over a level that is O(n), and there are O(log n) levels, so build is O(n log n) time and the same in memory.",
        "A query decomposes [l, r] into O(log n) fully covered nodes, exactly as in any segment tree, and each contributes one binary search. The counts are disjoint and additive, which is why the decomposition is sound - unlike, say, a median, which cannot be combined from the pieces.",
        "The trap is trying to support point updates. Inserting into a sorted vector is O(size), so an update costs O(n) in the worst case; use a Fenwick tree over compressed values, a wavelet tree, or sqrt decomposition when updates are required.",
        "Time: O(n log n) build, O(log^2 n) per query. Space: O(n log n).",
      ],
    },
    {
      name: "Count of Smaller Numbers After Self",
      difficulty: "Medium",
      variation: "Suffix count of strictly smaller values",
      link: "https://leetcode.com/problems/count-of-smaller-numbers-after-self/",
      question: [
        "You are given an integer array nums. Return an array counts where counts[i] is the number of indices j with j > i and nums[j] < nums[i].",
        "Example 1:\nInput: nums = [5, 2, 6, 1]\nOutput: [2, 1, 1, 0]\nExplanation: To the right of 5 there are two smaller elements (2 and 1); to the right of 2 there is one (1); to the right of 6 there is one (1); to the right of 1 there are none.",
        "Example 2:\nInput: nums = [-1, -1]\nOutput: [0, 0]\nExplanation: Neither element has a strictly smaller element after it.",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- -10^4 <= nums[i] <= 10^4",
      ],
      code: `template<class T> struct MST {
    int n;
    vector<vector<T>> t;
    MST(const vector<T>& a) : n((int)a.size()), t(4 * a.size() + 4) {
        if (n) build(1, 0, n - 1, a);
    }
    void build(int p, int lo, int hi, const vector<T>& a) {
        if (lo == hi) { t[p] = {a[lo]}; return; }
        int mid = (lo + hi) / 2;
        build(2 * p, lo, mid, a);
        build(2 * p + 1, mid + 1, hi, a);
        t[p].resize(hi - lo + 1);
        merge(t[2 * p].begin(), t[2 * p].end(),
              t[2 * p + 1].begin(), t[2 * p + 1].end(), t[p].begin());
    }
    int cnt(int p, int lo, int hi, int l, int r, T x) const {
        if (r < lo || hi < l) return 0;
        if (l <= lo && hi <= r)
            return (int)(upper_bound(t[p].begin(), t[p].end(), x) - t[p].begin());
        int mid = (lo + hi) / 2;
        return cnt(2 * p, lo, mid, l, r, x) + cnt(2 * p + 1, mid + 1, hi, l, r, x);
    }
    int atMost(int l, int r, T x) const { return l > r ? 0 : cnt(1, 0, n - 1, l, r, x); }
};

vector<int> countSmaller(vector<int>& nums) {
    int n = nums.size();
    MST<int> st(nums);
    vector<int> res(n);
    // strictly smaller than nums[i] is the same as at most nums[i] - 1
    for (int i = 0; i < n; i++) res[i] = st.atMost(i + 1, n - 1, nums[i] - 1);
    return res;
}`,
      explanation: [
        "Each answer is a two-dimensional count: a constraint on position (j > i) and a constraint on value (nums[j] < nums[i]). The merge sort tree resolves the position constraint by range decomposition and the value constraint by binary search, so no sorting of the queries is needed.",
        "Because the values are integers, 'strictly less than v' is rewritten as 'at most v - 1', which lets one upper_bound primitive serve both flavours. Getting this off by one wrong is the usual source of a wrong answer when nums contains duplicates - see example 2, where equal elements must not be counted.",
        "The classic alternative is the merge step of merge sort itself, or a Fenwick tree over compressed values swept from right to left; both are O(n log n) and asymptotically better than this O(n log^2 n). The merge sort tree earns its keep when the queries are arbitrary ranges rather than suffixes, since it needs no offline sweep at all.",
        "Time: O(n log^2 n). Space: O(n log n).",
      ],
    },
    {
      name: "K-query",
      difficulty: "Medium",
      variation: "Range count of values greater than k (offline or online)",
      link: "https://www.spoj.com/problems/KQUERY/",
      question: [
        "You are given a sequence of n integers a[1], a[2], ..., a[n] and q queries. Each query is a triple (i, j, k) and asks for the number of positions p with i <= p <= j and a[p] > k. Print one answer per query, each on its own line.",
        "Example 1:\nInput:\n5\n5 1 2 3 4\n3\n2 4 1\n4 4 4\n1 5 2\nOutput:\n2\n0\n3\nExplanation: a[2..4] = [1, 2, 3] has two values above 1. a[4..4] = [3] has none above 4. The whole array has three values above 2, namely 5, 3 and 4.",
        "Constraints:\n- 1 <= n <= 30000\n- 1 <= q <= 200000\n- 1 <= a[p] <= 10^9\n- 1 <= k <= 10^9",
      ],
      code: `template<class T> struct MST {
    int n;
    vector<vector<T>> t;
    MST(const vector<T>& a) : n((int)a.size()), t(4 * a.size() + 4) {
        if (n) build(1, 0, n - 1, a);
    }
    void build(int p, int lo, int hi, const vector<T>& a) {
        if (lo == hi) { t[p] = {a[lo]}; return; }
        int mid = (lo + hi) / 2;
        build(2 * p, lo, mid, a);
        build(2 * p + 1, mid + 1, hi, a);
        t[p].resize(hi - lo + 1);
        merge(t[2 * p].begin(), t[2 * p].end(),
              t[2 * p + 1].begin(), t[2 * p + 1].end(), t[p].begin());
    }
    int cnt(int p, int lo, int hi, int l, int r, T x) const {
        if (r < lo || hi < l) return 0;
        if (l <= lo && hi <= r)
            return (int)(upper_bound(t[p].begin(), t[p].end(), x) - t[p].begin());
        int mid = (lo + hi) / 2;
        return cnt(2 * p, lo, mid, l, r, x) + cnt(2 * p + 1, mid + 1, hi, l, r, x);
    }
    int atMost(int l, int r, T x) const { return l > r ? 0 : cnt(1, 0, n - 1, l, r, x); }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    MST<int> st(a);
    int q;
    cin >> q;
    string out;
    while (q--) {
        int i, j, k;
        cin >> i >> j >> k;
        i--; j--;                                  // input is 1-indexed
        int above = (j - i + 1) - st.atMost(i, j, k);
        out += to_string(above);
        out += "\\n";
    }
    cout << out;
    return 0;
}`,
      explanation: [
        "The structure only knows how to count values at most x, so 'greater than k' is obtained by complement: the length of the range minus the count of values at most k. Complementing is safe here because the two sets partition the range exactly.",
        "This is the canonical merge sort tree problem, and it is worth seeing why the naive alternatives fail. Sorting the whole array loses positions; a prefix-sum-per-threshold table would need O(n) distinct thresholds and O(n^2) memory. The tree trades a log factor for O(n log n) memory and answers arbitrary (range, threshold) pairs.",
        "The classic offline solution is faster: sort the queries by k descending, insert array elements into a Fenwick tree in descending value order, and answer each query with a prefix-sum difference in O(log n). That is O((n + q) log n) versus O(q log^2 n) here, and on this judge the constant matters. The merge sort tree is the one to reach for when the queries are forced online, as in the K-query Online variant.",
        "Time: O(n log n) build plus O(q log^2 n) queries. Space: O(n log n).",
      ],
    },
    {
      name: "Distinct Values Queries",
      difficulty: "Medium",
      variation: "Previous-occurrence trick for distinct counts",
      link: "https://cses.fi/problemset/task/1734",
      question: [
        "You are given an array of n integers and q queries. Each query gives a range [a, b] (1-indexed) and asks how many distinct values appear in x[a], x[a+1], ..., x[b]. Print one answer per query.",
        "Example 1:\nInput:\n5 3\n3 2 3 1 2\n1 5\n2 4\n1 2\nOutput:\n3\n3\n2\nExplanation: The whole array contains the distinct values 3, 2 and 1. The range [2, 4] is [2, 3, 1], also three distinct values. The range [1, 2] is [3, 2], two distinct values.",
        "Constraints:\n- 1 <= n, q <= 2 * 10^5\n- 1 <= x[i] <= 10^9\n- 1 <= a <= b <= n",
      ],
      code: `template<class T> struct MST {
    int n;
    vector<vector<T>> t;
    MST(const vector<T>& a) : n((int)a.size()), t(4 * a.size() + 4) {
        if (n) build(1, 0, n - 1, a);
    }
    void build(int p, int lo, int hi, const vector<T>& a) {
        if (lo == hi) { t[p] = {a[lo]}; return; }
        int mid = (lo + hi) / 2;
        build(2 * p, lo, mid, a);
        build(2 * p + 1, mid + 1, hi, a);
        t[p].resize(hi - lo + 1);
        merge(t[2 * p].begin(), t[2 * p].end(),
              t[2 * p + 1].begin(), t[2 * p + 1].end(), t[p].begin());
    }
    int cnt(int p, int lo, int hi, int l, int r, T x) const {
        if (r < lo || hi < l) return 0;
        if (l <= lo && hi <= r)
            return (int)(upper_bound(t[p].begin(), t[p].end(), x) - t[p].begin());
        int mid = (lo + hi) / 2;
        return cnt(2 * p, lo, mid, l, r, x) + cnt(2 * p + 1, mid + 1, hi, l, r, x);
    }
    int atMost(int l, int r, T x) const { return l > r ? 0 : cnt(1, 0, n - 1, l, r, x); }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    vector<int> x(n);
    for (int i = 0; i < n; i++) cin >> x[i];
    vector<int> prv(n);
    unordered_map<int,int> last;
    last.reserve(2 * n);
    for (int i = 0; i < n; i++) {
        auto it = last.find(x[i]);
        prv[i] = (it == last.end()) ? -1 : it->second;   // previous index of same value
        last[x[i]] = i;
    }
    MST<int> st(prv);
    string out;
    while (q--) {
        int a, b;
        cin >> a >> b;
        a--; b--;
        // an element is the first of its value inside [a, b] iff its previous occurrence is before a
        out += to_string(st.atMost(a, b, a - 1));
        out += "\\n";
    }
    cout << out;
    return 0;
}`,
      explanation: [
        "The reformulation is the whole problem. Define prv[i] as the largest j < i with x[j] == x[i], or -1 if none. Inside a range [a, b] every distinct value is represented by exactly one element: its leftmost occurrence in that range, and that element is characterised by prv[i] < a.",
        "So the count of distinct values equals the count of indices i in [a, b] whose prv value is at most a - 1 - a plain (range, threshold) count, which is precisely what the merge sort tree answers. The mapping is a bijection, so nothing is double counted and nothing is missed.",
        "The tempting wrong approach is Mo's algorithm with a frequency table; it works and is O((n + q) sqrt(n)), but it is offline. This solution is online and needs no query reordering. A Fenwick tree offline sweep over queries sorted by right endpoint is the fastest option of the three.",
        "Values reach 10^9, so prv is computed through a hash map rather than a direct-address array; compressing the values first with sort plus lower_bound works equally well and is more predictable in speed.",
        "Time: O(n log n) build plus O(q log^2 n). Space: O(n log n).",
      ],
    },
    {
      name: "Reverse Pairs",
      difficulty: "Hard",
      variation: "Weighted inversion count (nums[i] > 2 * nums[j])",
      link: "https://leetcode.com/problems/reverse-pairs/",
      question: [
        "Given an integer array nums, a reverse pair is a pair of indices (i, j) with 0 <= i < j < nums.length and nums[i] > 2 * nums[j]. Return the number of reverse pairs in the array.",
        "Example 1:\nInput: nums = [1, 3, 2, 3, 1]\nOutput: 2\nExplanation: The reverse pairs are (1, 4) because 3 > 2 * 1, and (3, 4) because 3 > 2 * 1.",
        "Example 2:\nInput: nums = [2, 4, 3, 5, 1]\nOutput: 3\nExplanation: The reverse pairs are (1, 4), (2, 4) and (3, 4), since 4 > 2, 3 > 2 and 5 > 2 while the trailing element is 1.",
        "Constraints:\n- 1 <= nums.length <= 5 * 10^4\n- -2^31 <= nums[i] <= 2^31 - 1",
      ],
      code: `template<class T> struct MST {
    int n;
    vector<vector<T>> t;
    MST(const vector<T>& a) : n((int)a.size()), t(4 * a.size() + 4) {
        if (n) build(1, 0, n - 1, a);
    }
    void build(int p, int lo, int hi, const vector<T>& a) {
        if (lo == hi) { t[p] = {a[lo]}; return; }
        int mid = (lo + hi) / 2;
        build(2 * p, lo, mid, a);
        build(2 * p + 1, mid + 1, hi, a);
        t[p].resize(hi - lo + 1);
        merge(t[2 * p].begin(), t[2 * p].end(),
              t[2 * p + 1].begin(), t[2 * p + 1].end(), t[p].begin());
    }
    int cnt(int p, int lo, int hi, int l, int r, T x) const {
        if (r < lo || hi < l) return 0;
        if (l <= lo && hi <= r)
            return (int)(upper_bound(t[p].begin(), t[p].end(), x) - t[p].begin());
        int mid = (lo + hi) / 2;
        return cnt(2 * p, lo, mid, l, r, x) + cnt(2 * p + 1, mid + 1, hi, l, r, x);
    }
    int atMost(int l, int r, T x) const { return l > r ? 0 : cnt(1, 0, n - 1, l, r, x); }
};

int reversePairs(vector<int>& nums) {
    int n = nums.size();
    vector<long long> a(nums.begin(), nums.end());       // 2 * nums[j] overflows int
    MST<long long> st(a);
    long long ans = 0;
    for (int j = 0; j < n; j++) {
        long long thr = 2LL * a[j];
        ans += j - st.atMost(0, j - 1, thr);             // count of a[i] > thr among i < j
    }
    return (int)ans;
}`,
      explanation: [
        "Fix the right endpoint j and ask how many earlier elements exceed 2 * nums[j]. That is one prefix-range, value-threshold count per j, so the merge sort tree answers the whole problem in a single left-to-right pass with no extra bookkeeping.",
        "Counting 'greater than thr' as j minus 'at most thr' is exact because the prefix [0, j-1] has exactly j elements. Note that the threshold 2 * nums[j] need not appear in the array at all, which is why a value-indexed Fenwick tree here has to compress both the nums values and the doubled values, or binary search for the threshold's rank - a step that is easy to forget.",
        "The real trap is overflow: nums[j] can be -2^31, so 2 * nums[j] leaves int range. Promoting the array to long long before building removes the problem entirely and keeps the comparisons honest for negative values too.",
        "The textbook solution is a modified merge sort that counts qualifying pairs during each merge in O(n log n); this tree is a log factor slower but generalises immediately to a version of the question restricted to a subarray.",
        "Time: O(n log^2 n). Space: O(n log n).",
      ],
    },
    {
      name: "Number of Pairs Satisfying Inequality",
      difficulty: "Hard",
      variation: "Rearranged two-array inequality",
      link: "https://leetcode.com/problems/number-of-pairs-satisfying-inequality/",
      question: [
        "You are given two 0-indexed integer arrays nums1 and nums2, each of size n, and an integer diff. Count the number of pairs (i, j) with 0 <= i < j <= n - 1 such that nums1[i] - nums1[j] <= nums2[i] - nums2[j] + diff. Return that count.",
        "Example 1:\nInput: nums1 = [3, 2, 5], nums2 = [2, 2, 1], diff = 1\nOutput: 3\nExplanation: With c[i] = nums1[i] - nums2[i] the array c is [1, 0, 4] and the condition becomes c[i] <= c[j] + 1. All three pairs (0,1), (0,2) and (1,2) satisfy it.",
        "Example 2:\nInput: nums1 = [3, -1], nums2 = [-2, 2], diff = -1\nOutput: 0\nExplanation: c = [5, -3], and the only pair needs 5 <= -3 - 1 = -4, which is false.",
        "Constraints:\n- 2 <= n <= 10^5\n- -10^4 <= nums1[i], nums2[i] <= 10^4\n- -10^4 <= diff <= 10^4",
      ],
      code: `template<class T> struct MST {
    int n;
    vector<vector<T>> t;
    MST(const vector<T>& a) : n((int)a.size()), t(4 * a.size() + 4) {
        if (n) build(1, 0, n - 1, a);
    }
    void build(int p, int lo, int hi, const vector<T>& a) {
        if (lo == hi) { t[p] = {a[lo]}; return; }
        int mid = (lo + hi) / 2;
        build(2 * p, lo, mid, a);
        build(2 * p + 1, mid + 1, hi, a);
        t[p].resize(hi - lo + 1);
        merge(t[2 * p].begin(), t[2 * p].end(),
              t[2 * p + 1].begin(), t[2 * p + 1].end(), t[p].begin());
    }
    int cnt(int p, int lo, int hi, int l, int r, T x) const {
        if (r < lo || hi < l) return 0;
        if (l <= lo && hi <= r)
            return (int)(upper_bound(t[p].begin(), t[p].end(), x) - t[p].begin());
        int mid = (lo + hi) / 2;
        return cnt(2 * p, lo, mid, l, r, x) + cnt(2 * p + 1, mid + 1, hi, l, r, x);
    }
    int atMost(int l, int r, T x) const { return l > r ? 0 : cnt(1, 0, n - 1, l, r, x); }
};

long long numberOfPairs(vector<int>& nums1, vector<int>& nums2, int diff) {
    int n = nums1.size();
    vector<int> c(n);
    for (int i = 0; i < n; i++) c[i] = nums1[i] - nums2[i];   // condition folds into one array
    MST<int> st(c);
    long long ans = 0;
    for (int j = 0; j < n; j++) ans += st.atMost(0, j - 1, c[j] + diff);
    return ans;
}`,
      explanation: [
        "Algebra first, data structure second. Moving the index-i terms to one side turns nums1[i] - nums1[j] <= nums2[i] - nums2[j] + diff into (nums1[i] - nums2[i]) <= (nums1[j] - nums2[j]) + diff, so a single derived array c decides everything and the two input arrays are never needed again.",
        "With c in hand the problem is 'for each j, how many earlier c[i] are at most c[j] + diff', an ordinary prefix-range threshold count. Sweeping j upward means the prefix [0, j-1] is exactly the set of legal partners, so the i < j constraint is enforced by the range and never by a filter.",
        "The inequality is non-strict, so the primitive must be at-most, not less-than. Example 1 hinges on this: the pair (0, 1) is counted only because 1 <= 1 is allowed.",
        "The answer can reach about n^2 / 2 = 5 * 10^9, which does not fit in a 32-bit int even though every intermediate count does.",
        "Time: O(n log^2 n). Space: O(n log n).",
      ],
    },
    {
      name: "Count of Range Sum",
      difficulty: "Hard",
      variation: "Prefix sums plus a two-sided value window",
      link: "https://leetcode.com/problems/count-of-range-sum/",
      question: [
        "Given an integer array nums and two integers lower and upper, return the number of range sums that lie in [lower, upper] inclusive. A range sum S(i, j) is the sum of nums[i] through nums[j] with i <= j.",
        "Example 1:\nInput: nums = [-2, 5, -1], lower = -2, upper = 2\nOutput: 3\nExplanation: The qualifying ranges are [0,0] with sum -2, [2,2] with sum -1, and [0,2] with sum 2.",
        "Example 2:\nInput: nums = [0], lower = 0, upper = 0\nOutput: 1\nExplanation: The only range sum is 0, which lies in the window.",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- -2^31 <= nums[i] <= 2^31 - 1\n- -3 * 10^4 <= lower <= upper <= 3 * 10^4",
      ],
      code: `template<class T> struct MST {
    int n;
    vector<vector<T>> t;
    MST(const vector<T>& a) : n((int)a.size()), t(4 * a.size() + 4) {
        if (n) build(1, 0, n - 1, a);
    }
    void build(int p, int lo, int hi, const vector<T>& a) {
        if (lo == hi) { t[p] = {a[lo]}; return; }
        int mid = (lo + hi) / 2;
        build(2 * p, lo, mid, a);
        build(2 * p + 1, mid + 1, hi, a);
        t[p].resize(hi - lo + 1);
        merge(t[2 * p].begin(), t[2 * p].end(),
              t[2 * p + 1].begin(), t[2 * p + 1].end(), t[p].begin());
    }
    int cnt(int p, int lo, int hi, int l, int r, T x) const {
        if (r < lo || hi < l) return 0;
        if (l <= lo && hi <= r)
            return (int)(upper_bound(t[p].begin(), t[p].end(), x) - t[p].begin());
        int mid = (lo + hi) / 2;
        return cnt(2 * p, lo, mid, l, r, x) + cnt(2 * p + 1, mid + 1, hi, l, r, x);
    }
    int atMost(int l, int r, T x) const { return l > r ? 0 : cnt(1, 0, n - 1, l, r, x); }
};

int countRangeSum(vector<int>& nums, int lower, int upper) {
    int n = nums.size();
    vector<long long> pre(n + 1, 0);
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + nums[i];
    MST<long long> st(pre);                       // tree is over the n + 1 prefix sums
    long long lo = lower, up = upper;
    int ans = 0;
    for (int j = 1; j <= n; j++) {
        // need pre[j] - up <= pre[i] <= pre[j] - lo for some i < j
        ans += st.atMost(0, j - 1, pre[j] - lo) - st.atMost(0, j - 1, pre[j] - up - 1);
    }
    return ans;
}`,
      explanation: [
        "Rewrite S(i, j) as pre[j+1] - pre[i], so counting range sums in a window becomes counting pairs of prefix sums whose difference lands in that window. Building the tree over the prefix array rather than over nums is the key step.",
        "For a fixed right prefix index j, the condition lower <= pre[j] - pre[i] <= upper is equivalent to pre[i] lying in the closed interval [pre[j] - upper, pre[j] - lower]. A count over a closed value interval is two at-most queries subtracted, and the lower bound is made exclusive by shifting it down by one, which is legal because all prefix sums are integers.",
        "Only i < j is allowed, and restricting the tree query to the index range [0, j-1] enforces that. Querying the whole array instead would count each qualifying pair twice and also count i == j.",
        "Everything must be 64-bit: 10^5 values near 2^31 give prefix sums around 2 * 10^14, and the shifted thresholds pre[j] - upper - 1 must be computed in the same width to avoid silent wraparound.",
        "Time: O(n log^2 n). Space: O(n log n).",
      ],
    },
    {
      name: "Count the Number of K-Big Indices",
      difficulty: "Hard",
      variation: "Prefix and suffix counts at the same index",
      link: "https://leetcode.com/problems/count-the-number-of-k-big-indices/",
      question: [
        "You are given a 0-indexed integer array nums and a positive integer k. An index i is k-big if there exist at least k indices j1 < i with nums[j1] < nums[i], and at least k indices j2 > i with nums[j2] < nums[i]. Return the number of k-big indices.",
        "Example 1:\nInput: nums = [2, 3, 6, 5, 2, 3], k = 2\nOutput: 2\nExplanation: Index 2 (value 6) has 2 smaller values before it and 3 after it. Index 3 (value 5) has 2 smaller values before it (2 and 3) and 2 after it (2 and 3). No other index qualifies.",
        "Example 2:\nInput: nums = [1, 1, 1], k = 3\nOutput: 0\nExplanation: No element has any strictly smaller element on either side.",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- 1 <= nums[i], k <= nums.length",
      ],
      code: `template<class T> struct MST {
    int n;
    vector<vector<T>> t;
    MST(const vector<T>& a) : n((int)a.size()), t(4 * a.size() + 4) {
        if (n) build(1, 0, n - 1, a);
    }
    void build(int p, int lo, int hi, const vector<T>& a) {
        if (lo == hi) { t[p] = {a[lo]}; return; }
        int mid = (lo + hi) / 2;
        build(2 * p, lo, mid, a);
        build(2 * p + 1, mid + 1, hi, a);
        t[p].resize(hi - lo + 1);
        merge(t[2 * p].begin(), t[2 * p].end(),
              t[2 * p + 1].begin(), t[2 * p + 1].end(), t[p].begin());
    }
    int cnt(int p, int lo, int hi, int l, int r, T x) const {
        if (r < lo || hi < l) return 0;
        if (l <= lo && hi <= r)
            return (int)(upper_bound(t[p].begin(), t[p].end(), x) - t[p].begin());
        int mid = (lo + hi) / 2;
        return cnt(2 * p, lo, mid, l, r, x) + cnt(2 * p + 1, mid + 1, hi, l, r, x);
    }
    int atMost(int l, int r, T x) const { return l > r ? 0 : cnt(1, 0, n - 1, l, r, x); }
};

int kBigIndices(vector<int>& nums, int k) {
    int n = nums.size();
    MST<int> st(nums);
    int ans = 0;
    for (int i = 0; i < n; i++) {
        int left = st.atMost(0, i - 1, nums[i] - 1);
        if (left < k) continue;                              // cheap early reject
        if (st.atMost(i + 1, n - 1, nums[i] - 1) >= k) ans++;
    }
    return ans;
}`,
      explanation: [
        "One tree, two queries per index: the count of strictly smaller values in the prefix [0, i-1] and in the suffix [i+1, n-1]. Both are the same primitive with a different index range, which is exactly the flexibility a merge sort tree buys over a one-directional sweep.",
        "Strictness matters. Because nums holds integers, 'less than nums[i]' is 'at most nums[i] - 1'; using at-most nums[i] would count equal neighbours and turn example 2 into a wrong answer of 3.",
        "The alternative is two Fenwick sweeps over compressed values, left to right and right to left, storing both counts per index. That is O(n log n) and is what a contest submission should use; the tree version is a log slower but needs only one pass and no auxiliary arrays.",
        "Skipping the second query when the left count already fails is worth doing: it halves the work on typical data at zero cost in correctness, since the condition is a conjunction.",
        "Time: O(n log^2 n). Space: O(n log n).",
      ],
    },
    {
      name: "Count Good Triplets in an Array",
      difficulty: "Hard",
      variation: "Counting increasing triples via left and right counts",
      link: "https://leetcode.com/problems/count-good-triplets-in-an-array/",
      question: [
        "You are given two 0-indexed arrays nums1 and nums2 of length n, both permutations of the integers 0 through n - 1. A good triplet is a set of three distinct values (x, y, z) that appears in increasing position order in nums1 and also in increasing position order in nums2. Return the total number of good triplets.",
        "Example 1:\nInput: nums1 = [2, 0, 1, 3], nums2 = [0, 1, 2, 3]\nOutput: 1\nExplanation: Mapping each value of nums1 to its position in nums2 gives b = [2, 0, 1, 3]. The only strictly increasing triple of b in index order is (0, 1, 3), which corresponds to the values 0, 1, 3.",
        "Example 2:\nInput: nums1 = [4, 0, 1, 3, 2], nums2 = [4, 1, 0, 2, 3]\nOutput: 4\nExplanation: The mapped array is b = [0, 2, 1, 4, 3], which contains four strictly increasing triples in index order.",
        "Constraints:\n- 3 <= n <= 10^5\n- 0 <= nums1[i], nums2[i] <= n - 1\n- nums1 and nums2 are permutations of 0..n-1",
      ],
      code: `template<class T> struct MST {
    int n;
    vector<vector<T>> t;
    MST(const vector<T>& a) : n((int)a.size()), t(4 * a.size() + 4) {
        if (n) build(1, 0, n - 1, a);
    }
    void build(int p, int lo, int hi, const vector<T>& a) {
        if (lo == hi) { t[p] = {a[lo]}; return; }
        int mid = (lo + hi) / 2;
        build(2 * p, lo, mid, a);
        build(2 * p + 1, mid + 1, hi, a);
        t[p].resize(hi - lo + 1);
        merge(t[2 * p].begin(), t[2 * p].end(),
              t[2 * p + 1].begin(), t[2 * p + 1].end(), t[p].begin());
    }
    int cnt(int p, int lo, int hi, int l, int r, T x) const {
        if (r < lo || hi < l) return 0;
        if (l <= lo && hi <= r)
            return (int)(upper_bound(t[p].begin(), t[p].end(), x) - t[p].begin());
        int mid = (lo + hi) / 2;
        return cnt(2 * p, lo, mid, l, r, x) + cnt(2 * p + 1, mid + 1, hi, l, r, x);
    }
    int atMost(int l, int r, T x) const { return l > r ? 0 : cnt(1, 0, n - 1, l, r, x); }
};

long long goodTriplets(vector<int>& nums1, vector<int>& nums2) {
    int n = nums1.size();
    vector<int> pos(n), b(n);
    for (int i = 0; i < n; i++) pos[nums2[i]] = i;
    for (int i = 0; i < n; i++) b[i] = pos[nums1[i]];    // b[i] = rank of nums1[i] inside nums2
    MST<int> st(b);
    long long ans = 0;
    for (int j = 0; j < n; j++) {
        long long left = st.atMost(0, j - 1, b[j] - 1);
        long long smallerRight = st.atMost(j + 1, n - 1, b[j] - 1);
        long long right = (long long)(n - 1 - j) - smallerRight;   // strictly greater after j
        ans += left * right;
    }
    return ans;
}`,
      explanation: [
        "Relabel by position: replace each value with its index in nums2. Then a triple appears in increasing order in both arrays exactly when it appears in increasing index order in nums1 and its labels are increasing, that is, when b has a strictly increasing triple at increasing indices. Both permutation constraints collapse into one condition on one array.",
        "Count by the middle element, never by the ends. For each j, the number of increasing triples with j in the middle is (values smaller than b[j] before j) times (values larger than b[j] after j), and these two factors are independent. Summing over j visits every triple exactly once, since a triple has a unique middle.",
        "Counting 'larger after j' as (n - 1 - j) minus 'at most b[j] - 1 after j' is exact only because b is a permutation, so no element equals b[j]. On a general array with duplicates you would need a separate equal-count subtraction.",
        "Products of two counts near n/2 reach about 2.5 * 10^9 per index and the total is far larger, so the accumulator and both factors must be 64-bit.",
        "Time: O(n log^2 n). Space: O(n log n).",
      ],
    },
    {
      name: "K-th Number",
      difficulty: "Hard",
      variation: "Range k-th smallest by binary search on the value",
      link: "https://www.spoj.com/problems/MKTHNUM/",
      question: [
        "You are given an array a of n distinct integers and m queries. Each query is a triple (i, j, k) asking for the k-th smallest number among a[i], a[i+1], ..., a[j], where the array is 1-indexed. Print one answer per query.",
        "Example 1:\nInput:\n7 3\n1 5 2 6 3 7 4\n2 5 3\n4 4 1\n1 7 3\nOutput:\n5\n6\n3\nExplanation: a[2..5] is [5, 2, 6, 3], which sorted is [2, 3, 5, 6], so the 3rd smallest is 5. a[4..4] is [6] and its 1st smallest is 6. The whole array sorted is [1..7], so the 3rd smallest is 3.",
        "Constraints:\n- 1 <= n <= 100000\n- 1 <= m <= 5000\n- -10^9 <= a[i] <= 10^9\n- 1 <= k <= j - i + 1",
      ],
      code: `template<class T> struct MST {
    int n;
    vector<vector<T>> t;
    MST(const vector<T>& a) : n((int)a.size()), t(4 * a.size() + 4) {
        if (n) build(1, 0, n - 1, a);
    }
    void build(int p, int lo, int hi, const vector<T>& a) {
        if (lo == hi) { t[p] = {a[lo]}; return; }
        int mid = (lo + hi) / 2;
        build(2 * p, lo, mid, a);
        build(2 * p + 1, mid + 1, hi, a);
        t[p].resize(hi - lo + 1);
        merge(t[2 * p].begin(), t[2 * p].end(),
              t[2 * p + 1].begin(), t[2 * p + 1].end(), t[p].begin());
    }
    int cnt(int p, int lo, int hi, int l, int r, T x) const {
        if (r < lo || hi < l) return 0;
        if (l <= lo && hi <= r)
            return (int)(upper_bound(t[p].begin(), t[p].end(), x) - t[p].begin());
        int mid = (lo + hi) / 2;
        return cnt(2 * p, lo, mid, l, r, x) + cnt(2 * p + 1, mid + 1, hi, l, r, x);
    }
    int atMost(int l, int r, T x) const { return l > r ? 0 : cnt(1, 0, n - 1, l, r, x); }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    MST<int> st(a);
    vector<int> sorted = a;
    sort(sorted.begin(), sorted.end());
    string out;
    while (m--) {
        int i, j, k;
        cin >> i >> j >> k;
        i--; j--;
        int lo = 0, hi = n - 1;                 // binary search over candidate values
        while (lo < hi) {
            int mid = (lo + hi) / 2;
            if (st.atMost(i, j, sorted[mid]) >= k) hi = mid;
            else lo = mid + 1;
        }
        out += to_string(sorted[lo]);
        out += "\\n";
    }
    cout << out;
    return 0;
}`,
      explanation: [
        "The k-th smallest value in a range is the smallest value v for which the range contains at least k elements <= v. The function v -> count(<= v) is non-decreasing, so that smallest v can be found by binary search, and the answer is always an element that actually occurs in the array - hence the search runs over the globally sorted value list rather than over the raw integer interval.",
        "Each probe is one merge sort tree count in O(log^2 n), and there are O(log n) probes, giving O(log^3 n) per query. With m at most 5000 that is comfortable; with 10^5 queries it would not be, and the intended structures are then a persistent segment tree over values (O(log n) per query) or a wavelet tree.",
        "Note the invariant of the binary search: hi is always a value whose count reaches k, lo is always a candidate. Using a strict comparison, or searching over the numeric interval [-10^9, 10^9] and returning mid, both produce values that may not be in the range at all.",
        "Descending the tree by rank does not work on a merge sort tree the way it does on a value-indexed segment tree, because the nodes here are split by position, not by value. That confusion is the usual first wrong attempt.",
        "Time: O(n log n) build plus O(m log^3 n) queries. Space: O(n log n).",
      ],
    },
    {
      name: "Online Majority Element In Subarray",
      difficulty: "Hard",
      variation: "Segment tree of aggregates plus sorted occurrence lists",
      link: "https://leetcode.com/problems/online-majority-element-in-subarray/",
      question: [
        "Design a data structure MajorityChecker over a fixed integer array arr that supports query(left, right, threshold): return any element of the subarray arr[left..right] that occurs at least threshold times, or -1 if no such element exists. It is guaranteed that 2 * threshold > right - left + 1, so at most one element can qualify.",
        "Example 1:\nInput:\nMajorityChecker(arr = [1, 1, 2, 2, 1, 1])\nquery(0, 5, 4)\nquery(0, 3, 3)\nquery(2, 3, 2)\nOutput: [1, -1, 2]\nExplanation: In arr[0..5] the value 1 occurs four times, meeting the threshold of 4. In arr[0..3] both 1 and 2 occur twice, short of 3, so -1. In arr[2..3] the value 2 occurs twice, meeting the threshold of 2.",
        "Constraints:\n- 1 <= arr.length <= 2 * 10^4\n- 1 <= arr[i] <= 2 * 10^4\n- 0 <= left <= right < arr.length\n- at most 10^4 calls to query\n- 2 * threshold > right - left + 1",
      ],
      code: `class MajorityChecker {
public:
    int n;
    vector<int> cd, ct;                       // Boyer-Moore (candidate, surplus) per node
    unordered_map<int, vector<int>> pos;      // value -> sorted list of its indices

    MajorityChecker(vector<int>& arr) {
        n = arr.size();
        cd.assign(4 * n + 4, 0);
        ct.assign(4 * n + 4, 0);
        for (int i = 0; i < n; i++) pos[arr[i]].push_back(i);
        build(1, 0, n - 1, arr);
    }

    static pair<int,int> combine(pair<int,int> a, pair<int,int> b) {
        if (a.second == 0) return b;
        if (b.second == 0) return a;
        if (a.first == b.first) return {a.first, a.second + b.second};
        if (a.second >= b.second) return {a.first, a.second - b.second};
        return {b.first, b.second - a.second};
    }

    void build(int p, int lo, int hi, vector<int>& a) {
        if (lo == hi) { cd[p] = a[lo]; ct[p] = 1; return; }
        int mid = (lo + hi) / 2;
        build(2 * p, lo, mid, a);
        build(2 * p + 1, mid + 1, hi, a);
        pair<int,int> m = combine({cd[2 * p], ct[2 * p]}, {cd[2 * p + 1], ct[2 * p + 1]});
        cd[p] = m.first;
        ct[p] = m.second;
    }

    pair<int,int> ask(int p, int lo, int hi, int l, int r) {
        if (r < lo || hi < l) return {0, 0};
        if (l <= lo && hi <= r) return {cd[p], ct[p]};
        int mid = (lo + hi) / 2;
        return combine(ask(2 * p, lo, mid, l, r), ask(2 * p + 1, mid + 1, hi, l, r));
    }

    int query(int left, int right, int threshold) {
        int c = ask(1, 0, n - 1, left, right).first;
        auto it = pos.find(c);
        if (it == pos.end()) return -1;
        const vector<int>& v = it->second;
        // occurrences of c inside [left, right], by binary search on its index list
        int occ = (int)(upper_bound(v.begin(), v.end(), right) - lower_bound(v.begin(), v.end(), left));
        return occ >= threshold ? c : -1;
    }
};`,
      explanation: [
        "This is the merge sort tree idea generalised: instead of storing each node's whole range sorted, store a mergeable summary per node and store the sorted position lists once, keyed by value. Both halves of the pattern are still here - range decomposition through the tree, and binary search inside sorted lists.",
        "The node summary is a Boyer-Moore vote: a candidate and a surplus. Two summaries merge by cancelling opposing surpluses. The invariant is that any value occupying strictly more than half of a range survives as the candidate of that range, because every occurrence of it can cancel at most one other element. So a strict majority is never missed, though the candidate returned for a range with no majority is arbitrary.",
        "That is why verification is mandatory. Look up the candidate's sorted index list and count how many of its positions fall in [left, right] with two binary searches; only then compare against threshold. Trusting the candidate without this check is the classic bug.",
        "The guarantee 2 * threshold > length is what makes the vote applicable: any element meeting the threshold is a strict majority. Without it, a value occurring, say, a third of the time could qualify while never becoming the candidate, and the whole approach collapses.",
        "The popular alternative is randomised: sample about 20 random indices in the range and verify each candidate by binary search, failing with probability under 2^-20. It is simpler but only probabilistic; this version is deterministic.",
        "Time: O(n) build, O(log n) per query. Space: O(n).",
      ],
    },
  ],
};
