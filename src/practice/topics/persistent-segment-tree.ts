import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Persistent Segment Tree (Introduction)",
      difficulty: "Easy",
      variation: "Path copying, versioned point assign and range sum",
      question: [
        "Design a segment tree that never destroys its own history. It is built once over an array a of length n (version 0). An assign(version, pos, val) operation must not modify the version it is given: it produces a brand new version whose array equals that version's array with a[pos] replaced by val, and returns the new version id. A rangeSum(version, l, r) operation returns the sum of a[l..r] as it looked in that version. Every version stays queryable forever, and the whole structure must use O(log n) extra memory per update rather than O(n).",
        "Example 1:\nInput:\na = [1, 2, 3, 4, 5]\nrangeSum(0, 1, 3)\nassign(0, 2, 10)\nrangeSum(1, 1, 3)\nrangeSum(0, 1, 3)\nOutput: 9, then version 1 is created, then 16, then 9\nExplanation: version 0 is [1,2,3,4,5] so a[1..3] = 2+3+4 = 9. Version 1 is [1,2,10,4,5] so a[1..3] = 2+10+4 = 16. Version 0 is untouched and still answers 9.",
        "Example 2:\nInput:\na = [4, 4]\nassign(0, 0, 1)\nassign(1, 1, 1)\nrangeSum(2, 0, 1)\nrangeSum(1, 0, 1)\nrangeSum(0, 0, 1)\nOutput: 2, 5, 8\nExplanation: version 1 is [1,4] and version 2 is [1,1], built on top of it. The three sums are 1+1, 1+4 and 4+4.",
        "Constraints:\n- 1 <= n <= 2 * 10^5\n- number of versions created <= 2 * 10^5\n- values fit in a 64-bit signed integer",
      ],
      code: `struct PersistentSegTree {
    struct Node { long long sum; int lc, rc; };
    vector<Node> t;
    vector<int> root;                 // root[v] = root node id of version v
    int n;

    PersistentSegTree(const vector<long long>& a) : n((int)a.size()) {
        t.push_back({0, 0, 0});       // node 0 is the shared empty node
        root.push_back(build(a, 0, n - 1));
    }

    int make(long long s, int l, int r) { t.push_back({s, l, r}); return (int)t.size() - 1; }

    int build(const vector<long long>& a, int lo, int hi) {
        if (lo == hi) return make(a[lo], 0, 0);
        int mid = (lo + hi) / 2;
        int L = build(a, lo, mid), R = build(a, mid + 1, hi);
        return make(t[L].sum + t[R].sum, L, R);
    }

    int upd(int prev, int lo, int hi, int pos, long long val) {
        if (lo == hi) return make(val, 0, 0);
        int mid = (lo + hi) / 2;
        int L = t[prev].lc, R = t[prev].rc;              // start by reusing both children
        if (pos <= mid) L = upd(L, lo, mid, pos, val);   // only the side containing pos is rebuilt
        else R = upd(R, mid + 1, hi, pos, val);
        return make(t[L].sum + t[R].sum, L, R);
    }

    long long qry(int node, int lo, int hi, int l, int r) {
        if (r < lo || hi < l) return 0;
        if (l <= lo && hi <= r) return t[node].sum;
        int mid = (lo + hi) / 2;
        return qry(t[node].lc, lo, mid, l, r) + qry(t[node].rc, mid + 1, hi, l, r);
    }

    int assign(int version, int pos, long long val) {
        root.push_back(upd(root[version], 0, n - 1, pos, val));
        return (int)root.size() - 1;                     // id of the freshly created version
    }

    long long rangeSum(int version, int l, int r) {
        return qry(root[version], 0, n - 1, l, r);
    }
};`,
      explanation: [
        "The whole idea is path copying. A point update in an ordinary segment tree rewrites exactly the log n nodes on the root-to-leaf path of pos; every other node keeps the value it already had. So instead of overwriting those log n nodes, allocate log n fresh ones and let each of them point at the untouched sibling subtree of the old version. The new root is a complete, correct tree that physically shares everything it did not need to change.",
        "Nodes are therefore immutable: once written, a node is never modified again. That immutability is the invariant that makes every old root still describe a valid tree - no version can be corrupted by a later update, because later updates only ever append.",
        "Nodes live in one flat vector and children are stored as integer indices rather than pointers. This matters for two reasons: allocation is a push_back instead of a new, and index-based children survive the vector reallocating, which raw pointers into the vector would not.",
        "The tempting wrong approach is to copy the whole array (or whole tree) per version, which is O(n) memory per update and blows up at 2 * 10^5 versions. The other classic slip is calling the update in place, mutating t[prev] - that silently destroys every earlier version that shares the node.",
        "Time: O(n) to build, O(log n) per update, O(log n) per query. Space: O(n + u log n) for u updates.",
      ],
    },
    {
      name: "Range Queries and Copies",
      difficulty: "Medium",
      variation: "Explicit version copies, O(1) copy operation",
      link: "https://cses.fi/problemset/task/1737",
      question: [
        "You are given an array of n integers. Initially there is one list, list 1, holding that array. You must process q queries of three kinds:\n1 k a x: in list k, set the value at position a to x.\n2 k a b: print the sum of values in positions a..b of list k.\n3 k: create a copy of list k and append it as a new list, which gets the next unused number.",
        "Positions are 1-indexed and lists are numbered starting from 1 in the order they are created. A copy is fully independent: later updates to one list must not be visible in the other.",
        "Example 1:\nInput:\n4 5\n1 2 3 4\n2 1 1 4\n3 1\n1 2 1 5\n2 2 1 4\n2 1 1 4\nOutput:\n10\n14\n10\nExplanation: list 1 is [1,2,3,4] with sum 10. Query 3 makes list 2 an identical copy. Setting position 1 of list 2 to 5 makes it [5,2,3,4] with sum 14, while list 1 is unaffected and still sums to 10.",
        "Example 2:\nInput:\n3 4\n5 5 5\n3 1\n1 1 2 0\n2 1 1 3\n2 2 1 3\nOutput:\n10\n15\nExplanation: list 2 is copied first, then list 1 becomes [5,0,5] summing to 10, while the copy still holds [5,5,5] summing to 15.",
        "Constraints:\n- 1 <= n, q <= 2 * 10^5\n- 1 <= values, x <= 10^9\n- k always refers to an already existing list",
      ],
      code: `struct Node { long long sum; int lc, rc; };
vector<Node> t;

int build(const vector<long long>& a, int lo, int hi) {
    if (lo == hi) { t.push_back({a[lo], 0, 0}); return (int)t.size() - 1; }
    int mid = (lo + hi) / 2;
    int L = build(a, lo, mid), R = build(a, mid + 1, hi);
    t.push_back({t[L].sum + t[R].sum, L, R});
    return (int)t.size() - 1;
}

int update(int prev, int lo, int hi, int pos, long long val) {
    if (lo == hi) { t.push_back({val, 0, 0}); return (int)t.size() - 1; }
    int mid = (lo + hi) / 2;
    int L = t[prev].lc, R = t[prev].rc;
    if (pos <= mid) L = update(L, lo, mid, pos, val);
    else R = update(R, mid + 1, hi, pos, val);
    t.push_back({t[L].sum + t[R].sum, L, R});
    return (int)t.size() - 1;
}

long long query(int node, int lo, int hi, int l, int r) {
    if (r < lo || hi < l) return 0;
    if (l <= lo && hi <= r) return t[node].sum;
    int mid = (lo + hi) / 2;
    return query(t[node].lc, lo, mid, l, r) + query(t[node].rc, mid + 1, hi, l, r);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    vector<long long> a(n);
    for (auto& x : a) cin >> x;
    t.push_back({0, 0, 0});                     // null node
    vector<int> root(1, 0);                     // root[0] unused, lists are 1-indexed
    root.push_back(build(a, 0, n - 1));
    while (q--) {
        int type;
        cin >> type;
        if (type == 1) {
            int k, i;
            long long x;
            cin >> k >> i >> x;
            root[k] = update(root[k], 0, n - 1, i - 1, x);
        } else if (type == 2) {
            int k, l, r;
            cin >> k >> l >> r;
            cout << query(root[k], 0, n - 1, l - 1, r - 1) << "\\n";
        } else {
            int k;
            cin >> k;
            root.push_back(root[k]);            // copying a list is copying one integer
        }
    }
    return 0;
}`,
      explanation: [
        "This is the problem persistence was invented for. A list is nothing but a root id, so query type 3 is a single push_back: two lists that share a root share their entire tree, which is legal precisely because nodes are immutable.",
        "The divergence happens lazily. When one of the two lists is later updated, path copying allocates log n new nodes for that list only and leaves the other list pointing at the old root, so the two lists differ in exactly the log n nodes that had to change and share the rest.",
        "Note that an update here reassigns root[k] rather than appending a version. Updating a list means that list moves to a new root; the old root becomes unreachable through root[] but may still be referenced by a copy, which is exactly what keeps the copy correct.",
        "The naive alternative, memcpy of the array per type-3 query, is O(n) per copy and 2 * 10^5 copies of a 2 * 10^5 array is 4 * 10^10 words - hopeless. Also note values reach 10^9 across 2 * 10^5 positions, so sums need 64 bits.",
        "Time: O(n + q log n). Space: O(n + q log n).",
      ],
    },
    {
      name: "Count of Smaller Numbers After Self",
      difficulty: "Medium",
      variation: "Prefix versions over the value axis, counting queries",
      link: "https://leetcode.com/problems/count-of-smaller-numbers-after-self/",
      question: [
        "You are given an integer array nums. Return an array counts where counts[i] is the number of indices j with j > i and nums[j] < nums[i].",
        "Example 1:\nInput: nums = [5,2,6,1]\nOutput: [2,1,1,0]\nExplanation: To the right of 5 there are 2 and 1, so 2 smaller values. To the right of 2 there is only 1, so 1. To the right of 6 there is only 1, so 1. Nothing is to the right of 1.",
        "Example 2:\nInput: nums = [-1,-1]\nOutput: [0,0]\nExplanation: Neither element has a strictly smaller element after it.",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- -10^4 <= nums[i] <= 10^4",
      ],
      code: `vector<int> countSmaller(vector<int>& nums) {
    int n = nums.size();
    vector<int> vals = nums;
    sort(vals.begin(), vals.end());
    vals.erase(unique(vals.begin(), vals.end()), vals.end());
    int m = vals.size();

    // Persistent counting tree over the compressed value axis.
    vector<int> cnt(1, 0), lc(1, 0), rc(1, 0);      // node 0 is the empty node
    function<int(int,int,int,int)> insert = [&](int prev, int lo, int hi, int pos) {
        int cur = (int)cnt.size();
        cnt.push_back(cnt[prev] + 1);
        lc.push_back(lc[prev]);
        rc.push_back(rc[prev]);
        if (lo < hi) {
            int mid = (lo + hi) / 2;
            if (pos <= mid) { int c = insert(lc[prev], lo, mid, pos); lc[cur] = c; }
            else { int c = insert(rc[prev], mid + 1, hi, pos); rc[cur] = c; }
        }
        return cur;
    };

    vector<int> root(n + 1, 0);
    vector<int> rk(n);
    for (int i = 0; i < n; i++) {
        rk[i] = (int)(lower_bound(vals.begin(), vals.end(), nums[i]) - vals.begin());
        root[i + 1] = insert(root[i], 0, m - 1, rk[i]);
    }

    // Difference of two versions counts the elements sitting between them.
    function<int(int,int,int,int,int,int)> countIn = [&](int hiV, int loV, int lo, int hi, int l, int r) {
        if (r < lo || hi < l) return 0;
        if (l <= lo && hi <= r) return cnt[hiV] - cnt[loV];
        int mid = (lo + hi) / 2;
        return countIn(lc[hiV], lc[loV], lo, mid, l, r) + countIn(rc[hiV], rc[loV], mid + 1, hi, l, r);
    };

    vector<int> ans(n, 0);
    for (int i = 0; i < n; i++) {
        if (rk[i] > 0) ans[i] = countIn(root[n], root[i + 1], 0, m - 1, 0, rk[i] - 1);
    }
    return ans;
}`,
      explanation: [
        "Build one version per prefix: root[i] is a segment tree over the compressed value axis holding the multiset of nums[0..i-1]. Version i+1 is version i plus one insertion, so it costs log n new nodes and all n+1 versions coexist.",
        "The key algebraic fact is that node counts are additive, so subtracting two versions node by node gives the multiset of an index window: root[n] minus root[i+1] is exactly the elements at indices i+1..n-1. Counting values in [0, rank(nums[i]) - 1] inside that difference answers the question directly. The recursion walks both versions in lockstep and takes the difference at every node it stops on.",
        "Subtraction only works for invertible aggregates such as count or sum. If the node stored a minimum or a gcd, the difference trick would be meaningless, and you would have to merge versions instead (see the subtree-minimum variation).",
        "Merge sort with a modified merge step, or a Fenwick tree swept from the right, both solve this in fewer lines. The reason to write it with a persistent tree is that the prefix-version layout generalises to arbitrary index windows given online, which a right-to-left Fenwick sweep cannot do.",
        "Time: O(n log n). Space: O(n log n).",
      ],
    },
    {
      name: "Distinct Values Queries",
      difficulty: "Medium",
      variation: "Prefix versions marking last occurrences",
      link: "https://cses.fi/problemset/task/1734",
      question: [
        "You are given an array of n integers and q queries. Each query gives a range a..b (1-indexed) and asks for the number of distinct values in that range of the array.",
        "Example 1:\nInput:\n5 3\n3 2 3 1 2\n1 5\n2 4\n1 3\nOutput:\n3\n3\n2\nExplanation: positions 1..5 hold {3,2,3,1,2} whose distinct values are 3, 2 and 1. Positions 2..4 hold {2,3,1}, three distinct. Positions 1..3 hold {3,2,3}, only 3 and 2.",
        "Example 2:\nInput:\n4 2\n7 7 7 7\n1 4\n3 3\nOutput:\n1\n1\nExplanation: every element is the same value, so any non-empty range has exactly one distinct value.",
        "Constraints:\n- 1 <= n, q <= 2 * 10^5\n- 1 <= array values <= 10^9",
      ],
      code: `vector<int> sm, lc, rc;

int addAt(int prev, int lo, int hi, int pos, int delta) {
    int cur = (int)sm.size();
    sm.push_back(sm[prev] + delta);
    lc.push_back(lc[prev]);
    rc.push_back(rc[prev]);
    if (lo < hi) {
        int mid = (lo + hi) / 2;
        if (pos <= mid) { int c = addAt(lc[prev], lo, mid, pos, delta); lc[cur] = c; }
        else { int c = addAt(rc[prev], mid + 1, hi, pos, delta); rc[cur] = c; }
    }
    return cur;
}

int qsum(int node, int lo, int hi, int l, int r) {
    if (node == 0 || r < lo || hi < l) return 0;
    if (l <= lo && hi <= r) return sm[node];
    int mid = (lo + hi) / 2;
    return qsum(lc[node], lo, mid, l, r) + qsum(rc[node], mid + 1, hi, l, r);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    vector<int> a(n + 1);
    for (int i = 1; i <= n; i++) cin >> a[i];

    unordered_map<int,int> last;
    last.reserve(2 * n);
    vector<int> prv(n + 1, 0);
    for (int i = 1; i <= n; i++) {
        auto it = last.find(a[i]);
        prv[i] = (it == last.end()) ? 0 : it->second;   // previous position of the same value
        last[a[i]] = i;
    }

    sm.assign(1, 0); lc.assign(1, 0); rc.assign(1, 0);
    vector<int> root(n + 1, 0);
    for (int i = 1; i <= n; i++) {
        int cur = addAt(root[i - 1], 1, n, i, 1);                       // i is now a last occurrence
        if (prv[i] > 0) cur = addAt(cur, 1, n, prv[i], -1);             // and prv[i] no longer is
        root[i] = cur;
    }

    while (q--) {
        int l, r;
        cin >> l >> r;
        cout << qsum(root[r], 1, n, l, r) << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Invariant to maintain: in version r, position i carries a 1 if and only if i <= r and i is the last occurrence of its value among positions 1..r; everything else carries 0. Building version r from version r-1 needs two point updates, +1 at r and -1 at prv[r], so it costs O(log n).",
        "Why that answers the query: for any distinct value present in l..r, its last occurrence within 1..r is the unique marked position for that value, and that position lies in [l, r] exactly when the value appears in [l, r]. Marked positions in [l, r] are therefore in bijection with distinct values in [l, r], so the plain range sum is the answer.",
        "Here the version axis is the right endpoint of the query, not the query time. That is what makes the query a single-version range sum rather than a difference of versions: the answer needs version r specifically, and any earlier version would still mark occurrences that r has since superseded.",
        "The standard alternative is to sort the queries by r and run the same +1/-1 marking on an ordinary Fenwick tree. It is faster and shorter, but it is offline; the persistent version answers arbitrary (l, r) online, which is what you need when the query depends on the previous answer.",
        "Time: O((n + q) log n). Space: O(n log n).",
      ],
    },
    {
      name: "K-th Number (MKTHNUM)",
      difficulty: "Medium",
      variation: "K-th smallest in a range by descending two versions",
      link: "https://www.spoj.com/problems/MKTHNUM/",
      question: [
        "You are given a static array a of n integers and m queries. Each query gives i, j and k and asks for the k-th smallest value among a[i..j] (1-indexed, inclusive). The array is never modified.",
        "Example 1:\nInput:\n7 3\n1 5 2 6 3 7 4\n2 5 3\n4 4 1\n1 7 3\nOutput:\n5\n6\n3\nExplanation: a[2..5] = [5,2,6,3] sorts to [2,3,5,6] so the 3rd smallest is 5. a[4..4] = [6] so the 1st smallest is 6. The whole array sorts to [1,2,3,4,5,6,7] so the 3rd smallest is 3.",
        "Example 2:\nInput:\n4 2\n2 2 2 2\n1 4 4\n2 3 1\nOutput:\n2\n2\nExplanation: with all values equal, every order statistic of every range is 2.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= m <= 5000\n- |a[i]| <= 10^9\n- 1 <= k <= j - i + 1",
      ],
      code: `vector<int> cnt, lc, rc;

int insertPos(int prev, int lo, int hi, int pos) {
    int cur = (int)cnt.size();
    cnt.push_back(cnt[prev] + 1);
    lc.push_back(lc[prev]);
    rc.push_back(rc[prev]);
    if (lo < hi) {
        int mid = (lo + hi) / 2;
        if (pos <= mid) { int c = insertPos(lc[prev], lo, mid, pos); lc[cur] = c; }
        else { int c = insertPos(rc[prev], mid + 1, hi, pos); rc[cur] = c; }
    }
    return cur;
}

// u = version i-1, v = version j: the difference is exactly the multiset of a[i..j].
int kth(int u, int v, int lo, int hi, int k) {
    if (lo == hi) return lo;
    int mid = (lo + hi) / 2;
    int leftCnt = cnt[lc[v]] - cnt[lc[u]];      // how many of a[i..j] fall in the left half
    if (k <= leftCnt) return kth(lc[u], lc[v], lo, mid, k);
    return kth(rc[u], rc[v], mid + 1, hi, k - leftCnt);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<int> a(n);
    for (int& x : a) cin >> x;
    vector<int> vals = a;
    sort(vals.begin(), vals.end());
    vals.erase(unique(vals.begin(), vals.end()), vals.end());
    int sz = vals.size();

    cnt.assign(1, 0); lc.assign(1, 0); rc.assign(1, 0);
    cnt.reserve(20 * n + 10); lc.reserve(20 * n + 10); rc.reserve(20 * n + 10);
    vector<int> root(n + 1, 0);
    for (int i = 0; i < n; i++) {
        int p = (int)(lower_bound(vals.begin(), vals.end(), a[i]) - vals.begin());
        root[i + 1] = insertPos(root[i], 0, sz - 1, p);
    }

    while (m--) {
        int i, j, k;
        cin >> i >> j >> k;
        cout << vals[kth(root[i - 1], root[j], 0, sz - 1, k)] << "\\n";
    }
    return 0;
}`,
      explanation: [
        "This is the flagship application. Compress the values, then let version i be a counting tree over the value axis holding a[1..i]. Since counts subtract, version j minus version i-1 is a counting tree over precisely the multiset a[i..j] - conceptually a segment tree you never actually built.",
        "Finding the k-th smallest in a counting tree is a single root-to-leaf descent: if the left half holds at least k elements the answer is there, otherwise recurse right with k reduced by the left count. Doing that descent on the difference of two versions means carrying both node ids down together and subtracting at each step, which is still one descent and so O(log n), not O(log^2 n).",
        "Compression is not optional cosmetics. Values reach 10^9 and a tree over the raw value range would need dynamic nodes and a deeper descent; compressing to at most n distinct values also makes the returned leaf index a direct lookup into vals.",
        "The tempting wrong approach is a merge sort tree with binary search on the answer, which is O(log^2 n) per query, or sorting each range, which is O(n log n) per query. Also beware the off-by-one: the left version must be i-1, not i, or the i-th element is silently excluded.",
        "Time: O(n log n) to build, O(log n) per query. Space: O(n log n).",
      ],
    },
    {
      name: "Army Creation",
      difficulty: "Hard",
      variation: "Range count of positions whose k-th previous occurrence is out of range",
      link: "https://codeforces.com/problemset/problem/813/E",
      question: [
        "There are n soldiers in a row; soldier i has type a[i]. A squad is valid if no type appears in it more than k times. For each query (l, r) report the largest number of soldiers you can pick from positions l..r so that the picked multiset contains at most k soldiers of each type.",
        "On the judge the queries are encoded to force an online solution: given x and y, set l = ((x + last) mod n) + 1 and r = ((y + last) mod n) + 1, swap them if l > r, where last is the previous answer and 0 before the first query. The examples below use the already decoded l and r.",
        "Example 1:\nInput:\n6 2\n1 1 1 2 2 2\n3\n1 6\n1 3\n2 5\nOutput:\n4\n2\n4\nExplanation: in 1..6 type 1 appears 3 times and type 2 appears 3 times, so keep 2 of each for 4. In 1..3 only type 1 appears, 3 times, so keep 2. In 2..5 the segment is [1,1,2,2] and both counts are already at most 2, so all 4 are kept.",
        "Example 2:\nInput:\n5 1\n4 4 4 4 4\n2\n1 5\n3 3\nOutput:\n1\n1\nExplanation: with k = 1 only one soldier of the single type can be picked from any range.",
        "Constraints:\n- 1 <= n, number of queries <= 10^5\n- 1 <= k <= n\n- 1 <= a[i] <= n",
      ],
      code: `vector<int> cnt, lc, rc;

int insertVal(int prev, int lo, int hi, int pos) {
    int cur = (int)cnt.size();
    cnt.push_back(cnt[prev] + 1);
    lc.push_back(lc[prev]);
    rc.push_back(rc[prev]);
    if (lo < hi) {
        int mid = (lo + hi) / 2;
        if (pos <= mid) { int c = insertVal(lc[prev], lo, mid, pos); lc[cur] = c; }
        else { int c = insertVal(rc[prev], mid + 1, hi, pos); rc[cur] = c; }
    }
    return cur;
}

int countIn(int v, int u, int lo, int hi, int l, int r) {
    if (r < lo || hi < l) return 0;
    if (l <= lo && hi <= r) return cnt[v] - cnt[u];
    int mid = (lo + hi) / 2;
    return countIn(lc[v], lc[u], lo, mid, l, r) + countIn(rc[v], rc[u], mid + 1, hi, l, r);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, k;
    cin >> n >> k;
    vector<int> a(n + 1), pk(n + 1, 0);
    vector<vector<int>> occ(n + 1);
    for (int i = 1; i <= n; i++) {
        cin >> a[i];
        occ[a[i]].push_back(i);
        int j = (int)occ[a[i]].size();                     // i is the j-th soldier of its type
        pk[i] = (j > k) ? occ[a[i]][j - k - 1] : 0;         // position of the k-th earlier one
    }

    cnt.assign(1, 0); lc.assign(1, 0); rc.assign(1, 0);
    vector<int> root(n + 1, 0);
    for (int i = 1; i <= n; i++) root[i] = insertVal(root[i - 1], 0, n, pk[i]);

    int q;
    cin >> q;
    while (q--) {
        int l, r;
        cin >> l >> r;
        // count positions in [l, r] whose k-th previous occurrence sits strictly before l
        cout << countIn(root[r], root[l - 1], 0, n, 0, l - 1) << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Turn the counting statement into a per-position predicate. Greedily, from each type you keep its first k occurrences inside [l, r]. Position i is one of those first k exactly when fewer than k occurrences of a[i] lie in [l, i-1], which is exactly when pk[i], the position of the k-th previous occurrence of a[i], is strictly less than l. So the answer is the number of i in [l, r] with pk[i] < l.",
        "That is a two-dimensional count: index in [l, r], value pk in [0, l-1]. Prefix versions over the index axis reduce it to one dimension - version r minus version l-1 is the multiset of pk values for indices l..r, and one range-count on that difference finishes it.",
        "pk[i] is computed in one pass by keeping the occurrence list of each type: if i is the j-th occurrence and j > k, then pk[i] is the (j-k)-th occurrence, otherwise 0. Using k-1 there instead of k is the classic off-by-one and gives an answer that is too small.",
        "This problem is why persistence rather than an offline sweep is required: the decoded l and r depend on the previous answer, so the queries cannot be sorted by r and answered with a single Fenwick sweep. An O(n sqrt n) Mo-style solution exists offline but is illegal here.",
        "Time: O((n + q) log n). Space: O(n log n).",
      ],
    },
    {
      name: "One Occurrence",
      difficulty: "Hard",
      variation: "Range minimum over previous-occurrence values, descend to witness",
      link: "https://codeforces.com/problemset/problem/1000/F",
      question: [
        "You are given an array a of n integers and q queries. For each query (l, r) print any value that occurs exactly once in a[l..r], or 0 if every value in that range occurs at least twice. Queries must be answered online.",
        "Example 1:\nInput:\n6 3\n1 1 2 3 2 4\n1 3\n3 5\n1 2\nOutput:\n2\n3\n0\nExplanation: in a[1..3] = [1,1,2] the value 1 appears twice and 2 appears once, so 2. In a[3..5] = [2,3,2] only 3 appears once. In a[1..2] = [1,1] nothing appears exactly once, so 0.",
        "Example 2:\nInput:\n5 2\n5 5 5 5 9\n1 4\n4 5\nOutput:\n0\n5\nExplanation: a[1..4] is four copies of 5, so nothing is unique. In a[4..5] = [5,9] both 5 and 9 occur once; printing either is accepted.",
        "Constraints:\n- 1 <= n, q <= 5 * 10^5\n- 1 <= a[i] <= 5 * 10^5",
      ],
      code: `const int INF = 1e9;
vector<int> mn, lc, rc;

int buildAll(int lo, int hi) {
    int cur = (int)mn.size();
    mn.push_back(INF); lc.push_back(0); rc.push_back(0);
    if (lo < hi) {
        int mid = (lo + hi) / 2;
        int L = buildAll(lo, mid), R = buildAll(mid + 1, hi);
        lc[cur] = L; rc[cur] = R;
    }
    return cur;
}

int setAt(int prev, int lo, int hi, int pos, int val) {
    int cur = (int)mn.size();
    mn.push_back(INF); lc.push_back(lc[prev]); rc.push_back(rc[prev]);
    if (lo == hi) { mn[cur] = val; return cur; }
    int mid = (lo + hi) / 2;
    if (pos <= mid) { int c = setAt(lc[prev], lo, mid, pos, val); lc[cur] = c; }
    else { int c = setAt(rc[prev], mid + 1, hi, pos, val); rc[cur] = c; }
    mn[cur] = min(mn[lc[cur]], mn[rc[cur]]);
    return cur;
}

// first position in [l, r] whose stored value is < limit, or -1
int findPos(int node, int lo, int hi, int l, int r, int limit) {
    if (r < lo || hi < l || mn[node] >= limit) return -1;   // prune whole subtrees by their min
    if (lo == hi) return lo;
    int mid = (lo + hi) / 2;
    int res = findPos(lc[node], lo, mid, l, r, limit);
    if (res != -1) return res;
    return findPos(rc[node], mid + 1, hi, l, r, limit);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    vector<int> a(n + 1);
    int maxVal = 1;
    for (int i = 1; i <= n; i++) { cin >> a[i]; maxVal = max(maxVal, a[i]); }
    vector<int> last(maxVal + 1, 0), prv(n + 1, 0);
    for (int i = 1; i <= n; i++) { prv[i] = last[a[i]]; last[a[i]] = i; }

    mn.assign(1, INF); lc.assign(1, 0); rc.assign(1, 0);
    vector<int> root(n + 1, 0);
    root[0] = buildAll(1, n);
    for (int i = 1; i <= n; i++) {
        int cur = setAt(root[i - 1], 1, n, i, prv[i]);              // i is the newest occurrence
        if (prv[i] > 0) cur = setAt(cur, 1, n, prv[i], INF);        // retire the older one
        root[i] = cur;
    }

    while (q--) {
        int l, r;
        cin >> l >> r;
        int pos = findPos(root[r], 1, n, l, r, l);
        cout << (pos == -1 ? 0 : a[pos]) << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Version r stores, at every position that is the last occurrence of its value within 1..r, the position of the previous occurrence of that value, and INF everywhere else. Two point assignments per step maintain it: write prv[i] at i, and overwrite position prv[i] with INF because it stopped being a last occurrence.",
        "Correctness of the test: if p lies in [l, r], is marked in version r, and its stored value prv[p] is < l, then a[p] has no occurrence in [l, p-1] and none in [p+1, r] (p is the last one up to r), so a[p] occurs exactly once. Conversely a value occurring exactly once in [l, r] at p is automatically the last occurrence up to r and has prv[p] < l, so the test misses nothing.",
        "Nodes store a minimum, which is not invertible, so the difference-of-versions trick is unavailable - the whole query must run inside the single version r. That is also why the search is a guided descent: use each subtree's minimum to prune, and stop at the first leaf whose value is below l. The descent visits O(log n) nodes because a subtree is entered only when its minimum promises a witness.",
        "Note the memory: about 2n log n nodes across three int arrays is tens of millions of ints, which is the real difficulty of this problem. If that does not fit, the offline alternative is to sort queries by r and run the same marking on a non-persistent min segment tree.",
        "Time: O((n + q) log n). Space: O(n log n).",
      ],
    },
    {
      name: "Count on a Tree (COT)",
      difficulty: "Hard",
      variation: "Versions along root-to-node paths plus LCA",
      link: "https://www.spoj.com/problems/COT/",
      question: [
        "You are given a tree with n nodes; node i carries the weight w[i]. Answer m queries (u, v, k): the k-th smallest weight among the weights of the nodes on the unique path from u to v, endpoints included. The tree never changes.",
        "Example 1:\nInput:\n8 5\n105 2 9 3 8 5 7 7\n1 2\n1 3\n1 4\n3 5\n3 6\n3 7\n4 8\n2 5 1\n2 5 2\n2 5 3\n2 5 4\n7 8 2\nOutput:\n2\n8\n9\n105\n7\nExplanation: the path from 2 to 5 is 2-1-3-5 with weights {2,105,9,8}, sorting to [2,8,9,105], which gives the first four answers. The path from 7 to 8 is 7-3-1-4-8 with weights {7,9,105,3,7}, sorting to [3,7,7,9,105], so the 2nd smallest is 7.",
        "Example 2:\nInput:\n3 2\n4 1 6\n1 2\n2 3\n1 3 2\n2 2 1\nOutput:\n4\n1\nExplanation: the path 1-2-3 has weights {4,1,6} sorting to [1,4,6] so the 2nd smallest is 4. The path from 2 to itself is the single node 2 with weight 1.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= m <= 10^5\n- 0 <= w[i] <= 10^9\n- 1 <= k <= number of nodes on the path",
      ],
      code: `const int LOG = 17;
vector<int> cnt, lc, rc;

int insertVal(int prev, int lo, int hi, int pos) {
    int cur = (int)cnt.size();
    cnt.push_back(cnt[prev] + 1);
    lc.push_back(lc[prev]);
    rc.push_back(rc[prev]);
    if (lo < hi) {
        int mid = (lo + hi) / 2;
        if (pos <= mid) { int c = insertVal(lc[prev], lo, mid, pos); lc[cur] = c; }
        else { int c = insertVal(rc[prev], mid + 1, hi, pos); rc[cur] = c; }
    }
    return cur;
}

// counts on the path = A + B - C - D with C = lca, D = parent(lca)
int kthPath(int A, int B, int C, int D, int lo, int hi, int k) {
    if (lo == hi) return lo;
    int mid = (lo + hi) / 2;
    int leftCnt = cnt[lc[A]] + cnt[lc[B]] - cnt[lc[C]] - cnt[lc[D]];
    if (k <= leftCnt) return kthPath(lc[A], lc[B], lc[C], lc[D], lo, mid, k);
    return kthPath(rc[A], rc[B], rc[C], rc[D], mid + 1, hi, k - leftCnt);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<int> w(n + 1);
    for (int i = 1; i <= n; i++) cin >> w[i];
    vector<int> vals(w.begin() + 1, w.end());
    sort(vals.begin(), vals.end());
    vals.erase(unique(vals.begin(), vals.end()), vals.end());
    int sz = vals.size();

    vector<vector<int>> adj(n + 1);
    for (int e = 0; e < n - 1; e++) {
        int x, y;
        cin >> x >> y;
        adj[x].push_back(y);
        adj[y].push_back(x);
    }

    cnt.assign(1, 0); lc.assign(1, 0); rc.assign(1, 0);
    vector<int> root(n + 1, 0), par(n + 1, 0), dep(n + 1, 0);
    vector<vector<int>> up(n + 1, vector<int>(LOG, 0));
    vector<char> vis(n + 1, 0);

    // BFS so that a parent's version exists before its child extends it
    queue<int> bfs;
    bfs.push(1); vis[1] = 1;
    while (!bfs.empty()) {
        int u = bfs.front(); bfs.pop();
        int p = (int)(lower_bound(vals.begin(), vals.end(), w[u]) - vals.begin());
        root[u] = insertVal(root[par[u]], 0, sz - 1, p);        // root[0] = 0, the empty tree
        up[u][0] = par[u];
        for (int j = 1; j < LOG; j++) up[u][j] = up[up[u][j - 1]][j - 1];
        for (int v : adj[u]) if (!vis[v]) { vis[v] = 1; par[v] = u; dep[v] = dep[u] + 1; bfs.push(v); }
    }

    auto lca = [&](int u, int v) {
        if (dep[u] < dep[v]) swap(u, v);
        int diff = dep[u] - dep[v];
        for (int j = 0; j < LOG; j++) if ((diff >> j) & 1) u = up[u][j];
        if (u == v) return u;
        for (int j = LOG - 1; j >= 0; j--) if (up[u][j] != up[v][j]) { u = up[u][j]; v = up[v][j]; }
        return up[u][0];
    };

    while (m--) {
        int u, v, k;
        cin >> u >> v >> k;
        int a = lca(u, v);
        cout << vals[kthPath(root[u], root[v], root[a], root[par[a]], 0, sz - 1, k)] << "\\n";
    }
    return 0;
}`,
      explanation: [
        "The array version of k-th-in-range used prefix versions along the index axis. On a tree the analogous axis is depth: version of node u is version of parent(u) plus one insertion of w[u], so version u is a counting tree over the whole root-to-u path. Each node still costs only O(log n) new nodes.",
        "Path decomposition replaces the prefix difference. For nodes u and v with a = lca(u, v), count(u) + count(v) - count(a) - count(parent(a)) equals the multiset of the path u..v: strict ancestors of a are counted twice and removed twice, while a itself is counted twice and removed once, so it survives exactly once. Using count(a) twice instead would drop a from the path, which is the standard bug.",
        "Because the aggregate is a count, the four versions can be descended in lockstep exactly as two were in the array version, so a query is one O(log n) descent plus one O(log n) LCA lookup rather than anything quadratic.",
        "Build the versions in BFS order, not with a recursive DFS: a parent's root must exist before the child extends it, and at n = 10^5 a recursive DFS on a path-shaped tree risks a stack overflow. Weights are up to 10^9 so they must be compressed first.",
        "Time: O(n log n) to build, O(log n) per query. Space: O(n log n).",
      ],
    },
    {
      name: "Subtree Minimum Query",
      difficulty: "Hard",
      variation: "Merging persistent segment trees, non-invertible aggregate",
      link: "https://codeforces.com/problemset/problem/893/F",
      question: [
        "You are given a tree of n vertices rooted at vertex r; vertex i carries the value a[i]. Answer m queries (x, k): the minimum value a[j] over all vertices j in the subtree of x whose distance from x is at most k. Note that x itself is included, at distance 0.",
        "On the judge the queries are encoded to force an online solution: given p and q, set x = ((p + last) mod n) + 1 and k = (q + last) mod n, where last is the previous answer and 0 before the first query. The examples below use the already decoded x and k.",
        "Example 1:\nInput:\n5 1\n10 3 7 1 4\n1 2\n1 3\n2 4\n2 5\n4\n1 1\n1 2\n2 1\n3 5\nOutput:\n3\n1\n1\n7\nExplanation: with root 1 the depths are 1 at 0, vertices 2 and 3 at 1, vertices 4 and 5 at 2. Query (1,1) sees values 10, 3, 7 so the minimum is 3. Query (1,2) sees everything, minimum 1. Query (2,1) sees the subtree of 2, values 3, 1, 4, minimum 1. Query (3,5) sees only vertex 3, value 7.",
        "Example 2:\nInput:\n3 2\n8 5 2\n2 1\n1 3\n2\n2 0\n2 2\nOutput:\n5\n2\nExplanation: rooted at 2 the subtree of 2 is the whole tree with depths 2 at 0, 1 at 1 and 3 at 2. Distance 0 gives only a[2] = 5; distance 2 gives min(5, 8, 2) = 2.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= m <= 10^6\n- 1 <= a[i] <= 10^9\n- 0 <= k < n",
      ],
      code: `const int INF = 1e9;
vector<int> mnv, lc, rc;

int newNode(int v, int L, int R) {
    mnv.push_back(v); lc.push_back(L); rc.push_back(R);
    return (int)mnv.size() - 1;
}

// a single-element tree keyed by depth
int insertOne(int lo, int hi, int pos, int val) {
    if (lo == hi) return newNode(val, 0, 0);
    int mid = (lo + hi) / 2;
    if (pos <= mid) { int L = insertOne(lo, mid, pos, val); return newNode(val, L, 0); }
    int R = insertOne(mid + 1, hi, pos, val);
    return newNode(val, 0, R);
}

// merge without touching either input: both stay valid afterwards
int mergeT(int x, int y, int lo, int hi) {
    if (x == 0) return y;
    if (y == 0) return x;
    if (lo == hi) return newNode(min(mnv[x], mnv[y]), 0, 0);
    int mid = (lo + hi) / 2;
    int L = mergeT(lc[x], lc[y], lo, mid);
    int R = mergeT(rc[x], rc[y], mid + 1, hi);
    return newNode(min(mnv[L], mnv[R]), L, R);
}

int qmin(int node, int lo, int hi, int l, int r) {
    if (node == 0 || r < lo || hi < l) return INF;
    if (l <= lo && hi <= r) return mnv[node];
    int mid = (lo + hi) / 2;
    return min(qmin(lc[node], lo, mid, l, r), qmin(rc[node], mid + 1, hi, l, r));
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, r;
    cin >> n >> r;
    vector<int> a(n + 1);
    for (int i = 1; i <= n; i++) cin >> a[i];
    vector<vector<int>> adj(n + 1);
    for (int e = 0; e < n - 1; e++) {
        int x, y;
        cin >> x >> y;
        adj[x].push_back(y);
        adj[y].push_back(x);
    }

    vector<int> par(n + 1, 0), dep(n + 1, 0), order;
    order.reserve(n);
    vector<char> vis(n + 1, 0);
    vector<int> st{r};
    vis[r] = 1;
    while (!st.empty()) {                       // iterative preorder
        int u = st.back(); st.pop_back();
        order.push_back(u);
        for (int v : adj[u]) if (!vis[v]) { vis[v] = 1; par[v] = u; dep[v] = dep[u] + 1; st.push_back(v); }
    }

    mnv.assign(1, INF); lc.assign(1, 0); rc.assign(1, 0);
    int maxd = n - 1;
    vector<int> tr(n + 1, 0);
    for (int i = (int)order.size() - 1; i >= 0; i--) {      // children before parents
        int u = order[i];
        tr[u] = mergeT(tr[u], insertOne(0, maxd, dep[u], a[u]), 0, maxd);
        if (u != r) tr[par[u]] = mergeT(tr[par[u]], tr[u], 0, maxd);
    }

    int m;
    cin >> m;
    while (m--) {
        int x, k;
        cin >> x >> k;
        cout << qmin(tr[x], 0, maxd, dep[x], min(maxd, dep[x] + k)) << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Rewrite the query without the word distance: a vertex j in the subtree of x is at distance dep[j] - dep[x] from x, so the query is the minimum value among subtree vertices with absolute depth in [dep[x], dep[x] + k]. If every vertex owned a segment tree over absolute depth covering its subtree, each query would be a single range-min on it.",
        "Those n trees are built bottom-up by merging: tr[u] is the merge of all tr[child] plus a single-element tree holding a[u] at depth dep[u]. Merging two segment trees costs one new node per pair of overlapping nodes, and over the whole tree the total number of merge steps is O(n log n), so the construction is near-linear.",
        "Persistence is what makes the merge legal. tr[u] is still needed to answer queries at u after it has been folded into its parent, so mergeT must allocate new nodes rather than rewrite the nodes of its inputs. A destructive segment-tree merge - the usual small-to-large trick - would answer the parent's queries correctly and silently corrupt every child's.",
        "This is the case where the prefix-difference layout fails outright. Minimum is not invertible, so an Euler-tour prefix version cannot be subtracted to isolate a subtree; merging is the alternative. Also note the queries are decoded from the previous answer, so no offline reordering is available.",
        "Time: O(n log n) to build, O(log n) per query. Space: O(n log n).",
      ],
    },
    {
      name: "Sign on Fence",
      difficulty: "Hard",
      variation: "Versions ordered by value plus binary search on the answer",
      link: "https://codeforces.com/problemset/problem/484/E",
      question: [
        "A fence has n planks in a row; plank i has height h[i] and width 1. For each query (l, r, w) you must hang a sign of width w somewhere inside planks l..r: the sign covers w consecutive planks, all of which must lie inside [l, r], and it hangs at the height of the lowest plank it covers. Print the maximum height at which the sign can hang.",
        "Equivalently, over all windows of exactly w consecutive positions contained in [l, r], maximise the minimum height in the window.",
        "Example 1:\nInput:\n5\n1 2 2 3 3\n3\n2 5 3\n2 5 2\n1 5 5\nOutput:\n2\n3\n1\nExplanation: for (2,5,3) the windows are [2,4] with minimum 2 and [3,5] with minimum 2, so 2. For (2,5,2) the windows are [2,3] with 2, [3,4] with 2 and [4,5] with 3, so 3. For (1,5,5) the only window is the whole fence whose minimum is 1.",
        "Example 2:\nInput:\n4\n5 1 5 5\n2\n1 4 2\n1 4 1\nOutput:\n5\n5\nExplanation: the window [3,4] has minimum 5, and a width-1 sign can sit on any plank of height 5.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= number of queries <= 10^5\n- 1 <= h[i] <= 10^9\n- 1 <= w <= r - l + 1",
      ],
      code: `struct Node { int pref, suf, best, lc, rc; };
vector<Node> t;

int upd(int prev, int lo, int hi, int pos) {
    if (lo == hi) { t.push_back({1, 1, 1, 0, 0}); return (int)t.size() - 1; }
    int mid = (lo + hi) / 2;
    int L = t[prev].lc, R = t[prev].rc;
    if (pos <= mid) L = upd(L, lo, mid, pos);
    else R = upd(R, mid + 1, hi, pos);
    int lenL = mid - lo + 1, lenR = hi - mid;
    int pf = t[L].pref + (t[L].pref == lenL ? t[R].pref : 0);   // prefix spills over only if full
    int sf = t[R].suf + (t[R].suf == lenR ? t[L].suf : 0);
    int bs = max(max(t[L].best, t[R].best), t[L].suf + t[R].pref);
    t.push_back({pf, sf, bs, L, R});
    return (int)t.size() - 1;
}

struct Res { int pref, suf, best, len; };

Res joinRes(const Res& x, const Res& y) {
    if (x.len == 0) return y;
    if (y.len == 0) return x;
    Res z;
    z.len = x.len + y.len;
    z.pref = x.pref + (x.pref == x.len ? y.pref : 0);
    z.suf = y.suf + (y.suf == y.len ? x.suf : 0);
    z.best = max(max(x.best, y.best), x.suf + y.pref);
    return z;
}

Res ask(int node, int lo, int hi, int l, int r) {
    if (r < lo || hi < l) return {0, 0, 0, 0};
    if (l <= lo && hi <= r) return {t[node].pref, t[node].suf, t[node].best, hi - lo + 1};
    int mid = (lo + hi) / 2;
    return joinRes(ask(t[node].lc, lo, mid, l, r), ask(t[node].rc, mid + 1, hi, l, r));
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> h(n + 1);
    for (int i = 1; i <= n; i++) cin >> h[i];
    vector<int> ord(n);
    for (int i = 0; i < n; i++) ord[i] = i + 1;
    sort(ord.begin(), ord.end(), [&](int x, int y) { return h[x] > h[y]; });

    t.push_back({0, 0, 0, 0, 0});               // node 0 stands for an all-zero subtree
    vector<int> root(n + 1, 0);
    for (int k = 1; k <= n; k++) root[k] = upd(root[k - 1], 1, n, ord[k - 1]);

    int q;
    cin >> q;
    while (q--) {
        int l, r, w;
        cin >> l >> r >> w;
        int lo = w, hi = n, res = n;
        while (lo <= hi) {                      // smallest k whose run of ones reaches w
            int mid = (lo + hi) / 2;
            if (ask(root[mid], 1, n, l, r).best >= w) { res = mid; hi = mid - 1; }
            else lo = mid + 1;
        }
        cout << h[ord[res - 1]] << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Fix a candidate height H and mark every plank with h >= H as 1. A sign of width w fits inside [l, r] at height H exactly when [l, r] contains a run of w consecutive ones. So the answer is the largest H for which the longest run of ones inside [l, r] is at least w.",
        "Sort the planks by decreasing height and let version k be the 0/1 array with exactly the k tallest planks set. As k grows, ones are only added, so the longest run inside any fixed [l, r] is non-decreasing in k - that monotonicity is what licenses a binary search over the version index. The smallest feasible k gives the answer h[ord[k-1]], and building the versions incrementally is one point update each.",
        "Each node stores the longest prefix, longest suffix and longest internal run of ones. Merging two children needs the child lengths, which are known from the recursion bounds: a prefix extends into the right child only if it already fills the left child. The query must return the same triple rather than a single number, because partial nodes have to be stitched together in order - reporting only best would lose runs that straddle a boundary.",
        "The tempting shortcut of binary searching on the height value instead of the version index does not work, since there is no single tree per height; the versions are indexed by rank, which also handles duplicate heights correctly because the first feasible rank still reports its own height.",
        "Time: O(n log n) to build, O(log^2 n) per query. Space: O(n log n).",
      ],
    },
  ],
};
