import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Line Add Get Min",
      difficulty: "Easy",
      variation: "The template: insert lines online, query the minimum at a point",
      link: "https://judge.yosupo.jp/problem/line_add_get_min",
      question: [
        "You maintain a set of lines. Each line is a pair (a, b) representing the function f(x) = a*x + b. Initially the set holds N lines. Then Q operations follow. An operation of the form '0 a b' inserts the line a*x + b into the set. An operation of the form '1 p' asks for the minimum value of f(p) over every line currently in the set. Print one line per query.",
        "The slopes arrive in arbitrary order and the query points arrive in arbitrary order, so neither the insertions nor the queries can be assumed monotone.",
        "Example 1:\nInput:\n2 4\n-1 -1\n0 1\n1 -1\n0 1 -3\n1 -2\n1 2\nOutput:\n0\n-5\n-3\nExplanation: The starting lines are y = -x - 1 and y = 1. At p = -1 they give 0 and 1, so the minimum is 0. Then y = x - 3 is inserted. At p = -2 the three lines give 1, 1 and -5, so the answer is -5. At p = 2 they give -3, 1 and -1, so the answer is -3.",
        "Constraints:\n- 1 <= N, Q <= 2 * 10^5\n- |a| <= 10^9, |b| <= 10^9\n- |p| <= 10^9",
      ],
      code: `const long long INFL = (long long)4e18;

// Dynamic (implicit) Li Chao tree for minimum over lines on the integer range [LO, HI].
struct LiChaoMin {
    struct Node { long long m, c; int l, r; };
    vector<Node> t;
    long long LO, HI;
    int root = -1;

    LiChaoMin(long long lo, long long hi) : LO(lo), HI(hi) {}

    static long long val(long long m, long long c, long long x) { return m * x + c; }

    int insert(int node, long long lo, long long hi, long long m, long long c) {
        if (node == -1) { t.push_back({m, c, -1, -1}); return (int)t.size() - 1; }
        long long mid = lo + (hi - lo) / 2;          // floor mid, safe for negative lo
        bool atLo  = val(m, c, lo)  < val(t[node].m, t[node].c, lo);
        bool atMid = val(m, c, mid) < val(t[node].m, t[node].c, mid);
        if (atMid) { swap(t[node].m, m); swap(t[node].c, c); }  // keep the better line at mid here
        if (lo == hi) return node;
        // The loser can only win on the half where the two lines cross.
        if (atLo != atMid) { int ch = insert(t[node].l, lo, mid, m, c); t[node].l = ch; }
        else               { int ch = insert(t[node].r, mid + 1, hi, m, c); t[node].r = ch; }
        return node;
    }

    long long query(int node, long long lo, long long hi, long long x) const {
        if (node == -1) return INFL;
        long long mid = lo + (hi - lo) / 2;
        long long res = val(t[node].m, t[node].c, x);
        if (x <= mid) return min(res, query(t[node].l, lo, mid, x));
        return min(res, query(t[node].r, mid + 1, hi, x));
    }

    void addLine(long long m, long long c) { root = insert(root, LO, HI, m, c); }
    long long getMin(long long x) const { return query(root, LO, HI, x); }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    LiChaoMin tree(-1000000000LL, 1000000000LL);
    for (int i = 0; i < n; i++) {
        long long a, b;
        cin >> a >> b;
        tree.addLine(a, b);
    }
    while (q--) {
        int type;
        cin >> type;
        if (type == 0) {
            long long a, b;
            cin >> a >> b;
            tree.addLine(a, b);
        } else {
            long long p;
            cin >> p;
            cout << tree.getMin(p) << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "The structure is a segment tree over the x-axis where every node stores one line: the line that is currently the best (smallest) at the midpoint of that node's interval. It is not a set of candidates, it is exactly one line per node, and the answer at x is the minimum over the O(log C) nodes on the root-to-leaf path of x.",
        "Insertion is the whole trick. Two straight lines cross at most once, so on any interval the incoming line can only beat the resident line on a prefix or a suffix. Compare both lines at lo and at mid: keep whichever is smaller at mid as the resident, then the other one can only ever win inside one child - the left child when the verdicts at lo and mid differ, the right child otherwise. So one line descends one path and insertion is O(log C), not O(log^2 C).",
        "Why the query is complete: for a fixed x, every line that was ever inserted either lives on x's root-to-leaf path or was pushed down past x's path only after losing at a midpoint that separates it from x, in which case some line on the path is already at least as good at x. That is the invariant the insertion maintains.",
        "The tempting wrong approach is a monotone convex hull trick with a stack and a pointer. That needs slopes inserted in sorted order and queries in sorted order; here both arrive arbitrarily, so the hull would have to support arbitrary insertion, which means a balanced-BST hull. Li Chao gives the same result with far less code and no floating point.",
        "Practical notes: use a dynamic node-based tree rather than an array when the coordinate range is 10^9, keep the sentinel line as slope 0 with a huge intercept so no multiplication can overflow, and make mid floor-divided (lo + (hi - lo) / 2) because plain (lo + hi) / 2 rounds toward zero for negative ranges and breaks the recursion bounds.",
        "Time: O((N + Q) log C) where C is the coordinate range. Space: O(N + Q) nodes times log C in the worst case, O((N + Q) log C).",
      ],
    },
    {
      name: "Frog 3 (Educational DP Contest Z)",
      difficulty: "Medium",
      variation: "1D DP with quadratic jump cost",
      link: "https://atcoder.jp/contests/dp/tasks/dp_z",
      question: [
        "There are N stones numbered 1..N. Stone i has height h_i and the heights are strictly increasing. A frog starts on stone 1 and wants to reach stone N. From stone i it may jump to any stone j with j > i, paying (h_j - h_i)^2 + C. Find the minimum total cost.",
        "Example 1:\nInput:\n5 6\n1 2 3 4 5\nOutput: 20\nExplanation: The cheapest route is 1 -> 3 -> 5. Each jump costs (2)^2 + 6 = 10, so the total is 20. Jumping stone by stone would cost 4 * (1 + 6) = 28.",
        "Example 2:\nInput:\n2 1000000000000\n500000 1000000\nOutput: 1250000000000\nExplanation: Only one jump is possible: (1000000 - 500000)^2 + 10^12 = 2.5 * 10^11 + 10^12.",
        "Constraints:\n- 2 <= N <= 2 * 10^5\n- 1 <= C <= 10^12\n- 1 <= h_1 < h_2 < ... < h_N <= 10^6",
      ],
      code: `const long long INFL = (long long)4e18;

// Li Chao tree for minimum, built over a fixed sorted array of query points.
// Array-based, so memory is O(4n) regardless of how large the coordinates are.
struct LiChaoMin {
    vector<long long> xs, M, C;
    int n;

    LiChaoMin(vector<long long> pts) : xs(std::move(pts)) {
        n = (int)xs.size();
        M.assign(4 * n, 0);
        C.assign(4 * n, INFL);          // sentinel line: slope 0, intercept +inf
    }

    void add(int node, int l, int r, long long m, long long c) {
        int mid = (l + r) / 2;
        bool atL = m * xs[l] + c < M[node] * xs[l] + C[node];
        bool atM = m * xs[mid] + c < M[node] * xs[mid] + C[node];
        if (atM) { swap(M[node], m); swap(C[node], c); }
        if (l == r) return;
        if (atL != atM) add(2 * node, l, mid, m, c);
        else add(2 * node + 1, mid + 1, r, m, c);
    }

    long long query(int node, int l, int r, int pos) {
        long long res = M[node] * xs[pos] + C[node];
        if (l == r) return res;
        int mid = (l + r) / 2;
        if (pos <= mid) return min(res, query(2 * node, l, mid, pos));
        return min(res, query(2 * node + 1, mid + 1, r, pos));
    }

    void add(long long m, long long c) { add(1, 0, n - 1, m, c); }
    long long query(int pos) { return query(1, 0, n - 1, pos); }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    long long C;
    cin >> n >> C;
    vector<long long> h(n);
    for (auto& x : h) cin >> x;
    LiChaoMin tree(h);                  // the only query points are the heights themselves
    vector<long long> dp(n, 0);
    tree.add(-2 * h[0], h[0] * h[0]);   // line for j = 0: slope -2h_j, intercept dp_j + h_j^2
    for (int i = 1; i < n; i++) {
        dp[i] = tree.query(i) + h[i] * h[i] + C;
        tree.add(-2 * h[i], dp[i] + h[i] * h[i]);
    }
    cout << dp[n - 1] << "\\n";
    return 0;
}`,
      explanation: [
        "State: dp[i] is the minimum cost to reach stone i. Transition: dp[i] = min over j < i of dp[j] + (h_i - h_j)^2 + C. Written out that is dp[j] + h_j^2 - 2*h_j*h_i + h_i^2 + C, and the only part that depends on both i and j is the -2*h_j*h_i term.",
        "So group the j-dependent part into a line: for each settled j insert the line with slope m = -2*h_j and intercept c = dp[j] + h_j^2. Evaluating all those lines at x = h_i and taking the minimum, then adding h_i^2 + C, is exactly the transition. This is the standard 'separate the cross term into slope times query' rewrite that turns any DP of this shape into a line-minimum query.",
        "Because every query point is one of the heights and they are known in advance, the tree can be an ordinary array segment tree over the sorted heights instead of a dynamic tree over [1, 10^6]. That keeps memory at O(4N) and removes all pointer chasing; the position of h_i in the sorted array is just i.",
        "Traps: the intercept dp[j] + h_j^2 reaches about 2 * 10^17 here because C can be 10^12, so everything must be long long; and the line for j must be inserted only after dp[j] is final, otherwise a state would be allowed to use itself. Slopes here happen to be decreasing, so a monotone convex hull trick also works - Li Chao is the version that survives when the heights are no longer sorted.",
        "Time: O(N log N). Space: O(N).",
      ],
    },
    {
      name: "Kalila and Dimna in the Logging Industry",
      difficulty: "Medium",
      variation: "Linear cost dp[j] + b[j] * a[i]",
      link: "https://codeforces.com/problemset/problem/319/C",
      question: [
        "There are n trees. Tree i has height a_i and a recharge cost b_i, with a_1 = 1, b_n = 0, the a array strictly increasing and the b array strictly decreasing. A chainsaw cuts one unit of height per charge. To recharge, you pay b_i where i is the largest index such that tree i has already been cut down to height 0 (so the first recharge is always at cost b_1, which is available because tree 1 has height 1). Every tree must end at height 0. Print the minimum total recharge cost.",
        "Example 1:\nInput:\n5\n1 2 3 4 5\n5 4 3 2 0\nOutput: 25\nExplanation: Cut tree 1 (height 1) for free, then cut tree 5 entirely at cost b_1 = 5 per unit: 5 * 5 = 25. Everything afterwards is free because b_5 = 0.",
        "Example 2:\nInput:\n6\n1 2 3 10 20 30\n6 5 4 3 2 0\nOutput: 138\nExplanation: Cut tree 1, then tree 3 at cost b_1 = 6 per unit (18), then tree 6 at cost b_3 = 4 per unit (120). Total 138.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= a_i, b_i <= 10^9\n- a_1 = 1, b_n = 0, a strictly increasing, b strictly decreasing",
      ],
      code: `const long long INFL = (long long)4e18;

struct LiChaoMin {
    vector<long long> xs, M, C;
    int n;

    LiChaoMin(vector<long long> pts) : xs(std::move(pts)) {
        n = (int)xs.size();
        M.assign(4 * n, 0);
        C.assign(4 * n, INFL);
    }

    void add(int node, int l, int r, long long m, long long c) {
        int mid = (l + r) / 2;
        bool atL = m * xs[l] + c < M[node] * xs[l] + C[node];
        bool atM = m * xs[mid] + c < M[node] * xs[mid] + C[node];
        if (atM) { swap(M[node], m); swap(C[node], c); }
        if (l == r) return;
        if (atL != atM) add(2 * node, l, mid, m, c);
        else add(2 * node + 1, mid + 1, r, m, c);
    }

    long long query(int node, int l, int r, int pos) {
        long long res = M[node] * xs[pos] + C[node];
        if (l == r) return res;
        int mid = (l + r) / 2;
        if (pos <= mid) return min(res, query(2 * node, l, mid, pos));
        return min(res, query(2 * node + 1, mid + 1, r, pos));
    }

    void add(long long m, long long c) { add(1, 0, n - 1, m, c); }
    long long query(int pos) { return query(1, 0, n - 1, pos); }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<long long> a(n), b(n);
    for (auto& x : a) cin >> x;
    for (auto& x : b) cin >> x;
    LiChaoMin tree(a);                  // queries happen exactly at the heights a_i
    vector<long long> dp(n, 0);
    tree.add(b[0], 0);                  // tree 1 costs nothing to fell, dp[0] = 0
    for (int i = 1; i < n; i++) {
        dp[i] = tree.query(i);          // min over j < i of dp[j] + b[j] * a[i]
        tree.add(b[i], dp[i]);
    }
    cout << dp[n - 1] << "\\n";
    return 0;
}`,
      explanation: [
        "Key observation: it is never useful to partially cut a tree. Once you can afford charges at rate b_j, felling tree i outright costs b_j * a_i, and unlocking a cheaper rate can only help later. So define dp[i] as the minimum cost to have tree i fully cut down, with dp[1] = 0 because a_1 = 1 and the first charge is free. Then dp[i] = min over j < i of dp[j] + b_j * a_i, and the answer is dp[n] since b_n = 0 makes every remaining tree free after that.",
        "That transition is a line minimum: each settled j contributes the line y = b_j * x + dp[j], and dp[i] is the minimum of those lines at x = a_i. Insert j's line right after dp[j] is computed so no state can use itself.",
        "Since b is strictly decreasing and a strictly increasing, the classic monotone convex hull trick with a stack also solves this. Li Chao is the safer default: it needs no monotonicity, no comparison of slopes as fractions, and no floating-point intersection test. Here the query points are known up front, so an array-based tree indexed by the sorted a array is enough.",
        "Overflow trap: b_j * a_i is up to 10^18, so the products and dp values must be 64-bit, and the sentinel line has to be slope 0 with a huge intercept rather than a real line with huge slope, or the multiplication itself overflows.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Land Acquisition",
      difficulty: "Medium",
      variation: "Partition after removing dominated items",
      link: "https://www.spoj.com/problems/ACQUIRE/",
      question: [
        "You must buy n rectangular plots of land; plot i has width w_i and height h_i. You may buy the plots in any number of groups. The price of one group is (maximum width in the group) * (maximum height in the group), and the total price is the sum over groups. Print the minimum total price.",
        "Example 1:\nInput:\n4\n100 1\n15 15\n20 5\n1 100\nOutput: 500\nExplanation: Use three groups: {(1,100)} costs 1 * 100 = 100, {(15,15), (20,5)} costs 20 * 15 = 300, and {(100,1)} costs 100 * 1 = 100, totalling 500. Buying everything as one group would cost 100 * 100 = 10000.",
        "Example 2:\nInput:\n3\n10 2\n5 5\n2 10\nOutput: 65\nExplanation: No plot dominates another, so one group per plot costs 20 + 25 + 20 = 65. Every merge is worse: {(2,10), (5,5)} costs 5 * 10 = 50 instead of 45, and one group of all three costs 10 * 10 = 100.",
        "Constraints:\n- 1 <= n <= 50000\n- 1 <= w_i, h_i <= 10^6",
      ],
      code: `const long long INFL = (long long)4e18;

struct LiChaoMin {
    vector<long long> xs, M, C;
    int n;

    LiChaoMin(vector<long long> pts) : xs(std::move(pts)) {
        n = (int)xs.size();
        M.assign(4 * n, 0);
        C.assign(4 * n, INFL);
    }

    void add(int node, int l, int r, long long m, long long c) {
        int mid = (l + r) / 2;
        bool atL = m * xs[l] + c < M[node] * xs[l] + C[node];
        bool atM = m * xs[mid] + c < M[node] * xs[mid] + C[node];
        if (atM) { swap(M[node], m); swap(C[node], c); }
        if (l == r) return;
        if (atL != atM) add(2 * node, l, mid, m, c);
        else add(2 * node + 1, mid + 1, r, m, c);
    }

    long long query(int node, int l, int r, int pos) {
        long long res = M[node] * xs[pos] + C[node];
        if (l == r) return res;
        int mid = (l + r) / 2;
        if (pos <= mid) return min(res, query(2 * node, l, mid, pos));
        return min(res, query(2 * node + 1, mid + 1, r, pos));
    }

    void add(long long m, long long c) { add(1, 0, n - 1, m, c); }
    long long query(int pos) { return query(1, 0, n - 1, pos); }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<pair<long long,long long>> r(n);
    for (auto& p : r) cin >> p.first >> p.second;
    sort(r.begin(), r.end());

    // Drop every plot that is dominated (some other plot is at least as wide and as tall).
    vector<pair<long long,long long>> f;
    long long best = 0;
    for (int i = n - 1; i >= 0; i--)
        if (r[i].second > best) { f.push_back(r[i]); best = r[i].second; }
    reverse(f.begin(), f.end());        // now width increasing and height strictly decreasing

    int k = (int)f.size();
    vector<long long> w(k), h(k);
    for (int i = 0; i < k; i++) { w[i] = f[i].first; h[i] = f[i].second; }

    LiChaoMin tree(w);
    vector<long long> dp(k);
    tree.add(h[0], 0);                  // j = -1: empty prefix, group starts at index 0
    for (int i = 0; i < k; i++) {
        dp[i] = tree.query(i);          // min over j of dp[j] + w[i] * h[j+1]
        if (i + 1 < k) tree.add(h[i + 1], dp[i]);
    }
    cout << dp[k - 1] << "\\n";
    return 0;
}`,
      explanation: [
        "First reduction: if plot p is at least as wide and at least as tall as plot q, then q is free - put it in p's group and neither maximum changes. Sorting by width and sweeping from the widest while keeping only plots whose height exceeds every height seen so far removes all dominated plots. What remains has width strictly increasing and height strictly decreasing.",
        "Second reduction: on that filtered list an optimal solution uses contiguous groups. Because heights decrease as widths increase, a group's price is (width of its last plot) * (height of its first plot); interleaving two groups would only raise one of those maxima without lowering anything. So dp[i] = min over j < i of dp[j] + w[i] * h[j+1], with dp[-1] = 0.",
        "That is a line minimum with slope h[j+1] and intercept dp[j], queried at x = w[i]. Insert the line for j immediately after dp[j] is known, and seed the tree with the j = -1 line (slope h[0], intercept 0) so a single group covering the whole prefix is allowed.",
        "The tempting mistake is skipping the dominance filter. Without it heights are not monotone, contiguity of the optimal groups fails, and the DP silently returns a wrong (too large) answer even though the line-minimum machinery runs fine.",
        "Time: O(n log n), dominated by the sort and n tree operations. Space: O(n).",
      ],
    },
    {
      name: "Leaves",
      difficulty: "Medium",
      variation: "Layered partition DP, k layers of line queries",
      link: "https://www.spoj.com/problems/NKLEAVES/",
      question: [
        "There are n piles of leaves standing at positions 1, 2, ..., n; pile i holds a_i leaves. You sweep leaves only to the right, and moving one leaf a distance of one costs 1. You must end with at most k piles. Since sweeping is rightward only, each final pile is formed by a contiguous block of the original piles gathered at the position of the block's rightmost pile, so a block l..r costs sum over i in l..r of a_i * (r - i). Print the minimum total cost.",
        "Example 1:\nInput:\n5 2\n1 5 1 1 1\nOutput: 4\nExplanation: Split into blocks 1..2 and 3..5. The first costs 1 * (2-1) + 5 * 0 = 1, the second costs 1 * 2 + 1 * 1 + 1 * 0 = 3, total 4. Splitting after position 3 would cost 7 + 1 = 8.",
        "Example 2:\nInput:\n4 2\n2 1 1 2\nOutput: 3\nExplanation: Blocks 1..2 and 3..4 cost 2 * 1 + 1 * 0 = 2 and 1 * 1 + 2 * 0 = 1, total 3.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= k <= 10\n- 1 <= a_i <= 1000",
      ],
      code: `const long long INFL = (long long)4e18;

struct LiChaoMin {
    vector<long long> xs, M, C;
    int n;

    LiChaoMin(vector<long long> pts) : xs(std::move(pts)) {
        n = (int)xs.size();
        M.assign(4 * n, 0);
        C.assign(4 * n, INFL);
    }

    void add(int node, int l, int r, long long m, long long c) {
        int mid = (l + r) / 2;
        bool atL = m * xs[l] + c < M[node] * xs[l] + C[node];
        bool atM = m * xs[mid] + c < M[node] * xs[mid] + C[node];
        if (atM) { swap(M[node], m); swap(C[node], c); }
        if (l == r) return;
        if (atL != atM) add(2 * node, l, mid, m, c);
        else add(2 * node + 1, mid + 1, r, m, c);
    }

    long long query(int node, int l, int r, int pos) {
        long long res = M[node] * xs[pos] + C[node];
        if (l == r) return res;
        int mid = (l + r) / 2;
        if (pos <= mid) return min(res, query(2 * node, l, mid, pos));
        return min(res, query(2 * node + 1, mid + 1, r, pos));
    }

    void add(long long m, long long c) { add(1, 0, n - 1, m, c); }
    long long query(int pos) { return query(1, 0, n - 1, pos); }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, k;
    cin >> n >> k;
    vector<long long> a(n + 1), S(n + 1, 0), W(n + 1, 0);
    for (int i = 1; i <= n; i++) {
        cin >> a[i];
        S[i] = S[i - 1] + a[i];             // prefix count of leaves
        W[i] = W[i - 1] + a[i] * i;         // prefix count weighted by position
    }
    if (k >= n) { cout << 0 << "\\n"; return 0; }

    vector<long long> xs(n + 1);
    for (int i = 0; i <= n; i++) xs[i] = i;  // queries happen at x = i
    const long long BIG = (long long)1e18;
    vector<long long> prv(n + 1, BIG), cur(n + 1);
    prv[0] = 0;

    for (int j = 1; j <= k; j++) {
        LiChaoMin tree(xs);                  // one fresh tree per layer
        cur.assign(n + 1, BIG);
        cur[0] = 0;
        for (int i = 1; i <= n; i++) {
            if (prv[i - 1] < BIG) tree.add(-S[i - 1], prv[i - 1] + W[i - 1]);
            long long best = tree.query(i);
            if (best < BIG) cur[i] = min(prv[i], best + (long long)i * S[i] - W[i]);
            else cur[i] = prv[i];            // fewer than j blocks used so far
        }
        prv = cur;
    }
    cout << prv[n] << "\\n";
    return 0;
}`,
      explanation: [
        "Write the block cost with prefix sums: cost(t+1, i) = i * (S[i] - S[t]) - (W[i] - W[t]) where S is the prefix sum of a and W the prefix sum of a_i * i. That form is essential - it turns a sum over the block into O(1) arithmetic on its two endpoints.",
        "State: dp[j][i] is the minimum cost to sweep the first i piles into at most j piles. Transition dp[j][i] = min over t < i of dp[j-1][t] + cost(t+1, i). Substituting the prefix form gives dp[j][i] = min over t of (dp[j-1][t] + W[t] - i * S[t]) + i * S[i] - W[i], so each t contributes the line slope -S[t], intercept dp[j-1][t] + W[t], and the query point is x = i.",
        "Layer j only ever reads dp[j-1], so allocate a fresh Li Chao tree per layer and insert the line for t = i-1 just before computing index i. That ordering is what enforces t < i; inserting all lines up front would let a block be empty on the wrong side and let a state use its own layer. Taking min with prv[i] covers using strictly fewer than j blocks, which is what 'at most k piles' allows.",
        "Two details bite in practice: never insert a line whose intercept is the infinity sentinel, because slope times x plus 10^18 overflows and produces a spuriously small minimum; and note x = i here, so the tree is just an array segment tree over 0..n with xs[i] = i - no coordinate compression needed.",
        "Divide and conquer optimization also solves this layer structure in O(k n log n) because the optimal split point is monotone. Li Chao is preferable when the cost is not known to satisfy the quadrangle inequality but does decompose into slope times query.",
        "Time: O(k n log n). Space: O(n).",
      ],
    },
    {
      name: "Cats Transport",
      difficulty: "Hard",
      variation: "Layered partition with negative query coordinates",
      link: "https://codeforces.com/problemset/problem/311/B",
      question: [
        "There are n hills in a row; the distance between hill i-1 and hill i is d_i for i = 2..n. There are m cats; cat i finishes its walk on hill h_i at time t_i and then waits. There are p feeders. Every feeder starts at hill 1 at a time of its choosing, walks to hill n at speed one distance unit per unit time, and picks up every cat that is already waiting on each hill it passes. Every cat must be picked up. Minimise the total waiting time summed over all cats.",
        "Example 1:\nInput:\n4 6 2\n1 3 5\n1 0\n2 1\n4 9\n1 10\n2 10\n3 12\nOutput: 3\nExplanation: Cumulative distances are 0, 1, 4, 9. A feeder leaving at time s reaches hill h at time s + D[h], so the useful key for a cat is a_i = t_i - D[h_i]: the six cats give 0, 0, 0, 10, 9, 8. One feeder leaves at 0 and collects the three zero-key cats with no waiting; another leaves at 10 and collects keys 8, 9, 10 for a wait of 2 + 1 + 0 = 3.",
        "Example 2:\nInput:\n3 4 1\n2 4\n1 5\n3 1\n2 8\n3 20\nOutput: 36\nExplanation: Cumulative distances are 0, 2, 6, so the keys are 5, -5, 6, 14. A single feeder must leave at time 14, giving waits 19 + 9 + 8 + 0 = 36.",
        "Constraints:\n- 2 <= n <= 10^5, 1 <= m <= 10^5, 1 <= p <= 100\n- 1 <= d_i < 10^4\n- 1 <= h_i <= n, 1 <= t_i <= 10^9",
      ],
      code: `const long long INFL = (long long)4e18;

struct LiChaoMin {
    vector<long long> xs, M, C;
    int n;

    LiChaoMin(vector<long long> pts) : xs(std::move(pts)) {
        n = (int)xs.size();
        M.assign(4 * n, 0);
        C.assign(4 * n, INFL);
    }

    void add(int node, int l, int r, long long m, long long c) {
        int mid = (l + r) / 2;
        bool atL = m * xs[l] + c < M[node] * xs[l] + C[node];
        bool atM = m * xs[mid] + c < M[node] * xs[mid] + C[node];
        if (atM) { swap(M[node], m); swap(C[node], c); }
        if (l == r) return;
        if (atL != atM) add(2 * node, l, mid, m, c);
        else add(2 * node + 1, mid + 1, r, m, c);
    }

    long long query(int node, int l, int r, int pos) {
        long long res = M[node] * xs[pos] + C[node];
        if (l == r) return res;
        int mid = (l + r) / 2;
        if (pos <= mid) return min(res, query(2 * node, l, mid, pos));
        return min(res, query(2 * node + 1, mid + 1, r, pos));
    }

    void add(long long m, long long c) { add(1, 0, n - 1, m, c); }
    long long query(int pos) { return query(1, 0, n - 1, pos); }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m, p;
    cin >> n >> m >> p;
    vector<long long> D(n + 1, 0);
    for (int i = 2; i <= n; i++) { long long d; cin >> d; D[i] = D[i - 1] + d; }

    vector<long long> a(m + 1);
    for (int i = 1; i <= m; i++) {
        long long h, t;
        cin >> h >> t;
        a[i] = t - D[h];                     // earliest departure that still catches this cat
    }
    sort(a.begin() + 1, a.end());
    vector<long long> A(m + 1, 0);
    for (int i = 1; i <= m; i++) A[i] = A[i - 1] + a[i];

    vector<long long> xs(a.begin() + 1, a.end());   // sorted query points, may be negative
    const long long BIG = (long long)4e18;
    vector<long long> prv(m + 1, BIG), cur(m + 1);
    prv[0] = 0;

    for (int j = 1; j <= p; j++) {
        LiChaoMin tree(xs);
        cur.assign(m + 1, BIG);
        cur[0] = 0;
        for (int i = 1; i <= m; i++) {
            if (prv[i - 1] < BIG) tree.add(-(long long)(i - 1), prv[i - 1] + A[i - 1]);
            long long best = tree.query(i - 1);
            if (best < BIG) cur[i] = min(prv[i], best + a[i] * i - A[i]);
            else cur[i] = prv[i];
        }
        prv = cur;
    }
    cout << prv[m] << "\\n";
    return 0;
}`,
      explanation: [
        "Reduce each cat to a single number. A feeder leaving hill 1 at time s reaches hill h at s + D[h], so it collects cat i without the cat waiting iff s + D[h_i] >= t_i, and the wait is s + D[h_i] - t_i. Setting a_i = t_i - D[h_i] makes the wait exactly s - a_i, and the hills disappear from the problem: it is now 'cover m numbers with p departure times'.",
        "Sort the keys. An optimal feeder serves a contiguous block of sorted keys and departs at the block's maximum, so with A the prefix sum of sorted keys the block t+1..i costs a_i * (i - t) - (A[i] - A[t]). Then dp[j][i] = min over t of (dp[j-1][t] + A[t] - a_i * t) + a_i * i - A[i]: slope -t, intercept dp[j-1][t] + A[t], queried at x = a_i.",
        "The reason this problem is a Li Chao showcase rather than a plain hull problem is the coordinates. The keys a_i can be negative (a cat that finishes early), so the query range straddles zero. A Li Chao tree handles that as long as the midpoint uses floor division; here the query points are exactly the sorted keys, so an array-based tree over them sidesteps the issue entirely and also handles duplicate keys.",
        "The slopes -t inserted within a layer are strictly decreasing and the query points a_i are non-decreasing, so a monotone deque hull is the fastest solution. Li Chao costs one extra log but needs no proof of monotonicity, which is why it is the safer thing to write under time pressure.",
        "Guard against inserting unreachable states: dp[j-1][t] can still be the infinity sentinel when t < j-1, and a line with slope -t and a 4 * 10^18 intercept overflows immediately.",
        "Time: O(p * m log m). Space: O(m).",
      ],
    },
    {
      name: "Commando (APIO 2010)",
      difficulty: "Hard",
      variation: "Maximisation mapped onto a min tree by negating lines",
      question: [
        "An army of n soldiers stands in a line; soldier i has strength x_i. You must split the line into contiguous groups. A group whose strengths sum to X has adjusted strength a * X * X + b * X + c, where a, b, c are given and a < 0. Maximise the total adjusted strength over all groups.",
        "Example 1:\nInput:\n4\n-1 10 -20\n2 2 3 4\nOutput: 9\nExplanation: f(X) = -X^2 + 10X - 20 gives f(2) = -4, f(3) = 1, f(4) = 4, f(7) = 1. Splitting as (2,2), (3), (4) scores 4 + 1 + 4 = 9, which beats one group f(11) = -31 and beats every other split.",
        "Example 2:\nInput:\n3\n-1 5 -1\n1 2 3\nOutput: 13\nExplanation: f(X) = -X^2 + 5X - 1 gives f(1) = 3, f(2) = 5, f(3) = 5. One soldier per group scores 3 + 5 + 5 = 13; merging the last two gives 3 + f(5) = 3 - 1 = 2, and one group gives f(6) = -7.",
        "Constraints:\n- 1 <= n <= 10^6\n- -5 <= a <= -1, |b| <= 10^7, |c| <= 10^7\n- 1 <= x_i <= 100",
      ],
      code: `const long long INFL = (long long)4e18;

struct LiChaoMin {
    vector<long long> xs, M, C;
    int n;

    LiChaoMin(vector<long long> pts) : xs(std::move(pts)) {
        n = (int)xs.size();
        M.assign(4 * n, 0);
        C.assign(4 * n, INFL);
    }

    void add(int node, int l, int r, long long m, long long c) {
        int mid = (l + r) / 2;
        bool atL = m * xs[l] + c < M[node] * xs[l] + C[node];
        bool atM = m * xs[mid] + c < M[node] * xs[mid] + C[node];
        if (atM) { swap(M[node], m); swap(C[node], c); }
        if (l == r) return;
        if (atL != atM) add(2 * node, l, mid, m, c);
        else add(2 * node + 1, mid + 1, r, m, c);
    }

    long long query(int node, int l, int r, int pos) {
        long long res = M[node] * xs[pos] + C[node];
        if (l == r) return res;
        int mid = (l + r) / 2;
        if (pos <= mid) return min(res, query(2 * node, l, mid, pos));
        return min(res, query(2 * node + 1, mid + 1, r, pos));
    }

    void add(long long m, long long c) { add(1, 0, n - 1, m, c); }
    long long query(int pos) { return query(1, 0, n - 1, pos); }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    long long A, B, Cc;
    cin >> n >> A >> B >> Cc;
    vector<long long> S(n + 1, 0);
    for (int i = 1; i <= n; i++) { long long x; cin >> x; S[i] = S[i - 1] + x; }

    LiChaoMin tree(S);                   // prefix sums are both the lines' keys and the queries
    vector<long long> dp(n + 1, 0);
    // Max form: line slope -2*A*S_j, intercept dp_j + A*S_j^2 - B*S_j. Store both negated.
    tree.add(2 * A * S[0], -(dp[0] + A * S[0] * S[0] - B * S[0]));
    for (int i = 1; i <= n; i++) {
        dp[i] = -tree.query(i) + A * S[i] * S[i] + B * S[i] + Cc;
        tree.add(2 * A * S[i], -(dp[i] + A * S[i] * S[i] - B * S[i]));
    }
    cout << dp[n] << "\\n";
    return 0;
}`,
      explanation: [
        "State: dp[i] is the best total for the first i soldiers, dp[0] = 0. With prefix sums S, dp[i] = max over j < i of dp[j] + a * (S_i - S_j)^2 + b * (S_i - S_j) + c. Expanding the square and collecting everything that depends only on j gives dp[i] = max over j of ((-2 a S_j) * S_i + (dp[j] + a S_j^2 - b S_j)) + a S_i^2 + b S_i + c - a maximum over lines evaluated at x = S_i.",
        "A min-structure answers max queries by negation and nothing else: insert the line (-m, -k) for every line (m, k) you would have inserted into a max structure, then max over lines at x equals -(min over negated lines at x). Doing it this way means you only ever maintain one implementation, which is worth it because the two versions differ by exactly one comparison sign and mixing them up is a classic silent bug.",
        "Note where a < 0 matters: it makes each group's contribution concave, so splitting can pay. It is also what makes the max-hull non-degenerate. The DP itself does not need a < 0 to be correct, only the intended interpretation does.",
        "Because n is up to 10^6, a dynamic Li Chao tree over the coordinate range would allocate roughly n log C nodes and blow the memory limit. All query points are prefix sums known before the DP starts and they are sorted (strengths are positive), so build the array-based tree directly over S and index it by i. That is the standard fix whenever the query points are known in advance.",
        "Magnitudes: S can reach 10^8 and slopes 2 a S up to 10^9, so slope times query approaches 10^17 - long long throughout, and the sentinel must stay slope 0 with a huge intercept so it never participates in a multiplication.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "The Fair Nut and Rectangles",
      difficulty: "Hard",
      variation: "Geometric DP, union area minus cost",
      link: "https://codeforces.com/problemset/problem/1083/E",
      question: [
        "You are given n rectangles, the i-th with its lower-left corner at the origin and its upper-right corner at (x_i, y_i), plus a cost a_i. No rectangle is contained in another, so sorting by x increasing makes y strictly decreasing. Choose a subset of rectangles to maximise (area of the union of the chosen rectangles) minus (sum of their costs). Print that maximum.",
        "Example 1:\nInput:\n3\n4 4 8\n1 5 0\n5 2 10\nOutput: 9\nExplanation: Taking (1,5) and (4,4) covers 1 * 5 + 3 * 4 = 17 of area for a cost of 0 + 8 = 8, giving 9. Taking (4,4) alone gives 16 - 8 = 8; taking all three gives 19 - 18 = 1.",
        "Example 2:\nInput:\n4\n6 2 4\n1 6 2\n2 4 3\n5 3 8\nOutput: 10\nExplanation: Taking (1,6) and (6,2) covers 1 * 6 + 5 * 2 = 16 for a cost of 2 + 4 = 6, giving 10. Adding (2,4) raises the area to 18 but the cost to 9, giving 9.",
        "Constraints:\n- 1 <= n <= 10^6\n- 1 <= x_i, y_i <= 10^9, 0 <= a_i <= 10^9\n- all x_i distinct, all y_i distinct, no rectangle contains another",
      ],
      code: `const long long INFL = (long long)4e18;

struct LiChaoMin {
    vector<long long> xs, M, C;
    int n;

    LiChaoMin(vector<long long> pts) : xs(std::move(pts)) {
        n = (int)xs.size();
        M.assign(4 * n, 0);
        C.assign(4 * n, INFL);
    }

    void add(int node, int l, int r, long long m, long long c) {
        int mid = (l + r) / 2;
        bool atL = m * xs[l] + c < M[node] * xs[l] + C[node];
        bool atM = m * xs[mid] + c < M[node] * xs[mid] + C[node];
        if (atM) { swap(M[node], m); swap(C[node], c); }
        if (l == r) return;
        if (atL != atM) add(2 * node, l, mid, m, c);
        else add(2 * node + 1, mid + 1, r, m, c);
    }

    long long query(int node, int l, int r, int pos) {
        long long res = M[node] * xs[pos] + C[node];
        if (l == r) return res;
        int mid = (l + r) / 2;
        if (pos <= mid) return min(res, query(2 * node, l, mid, pos));
        return min(res, query(2 * node + 1, mid + 1, r, pos));
    }

    void add(long long m, long long c) { add(1, 0, n - 1, m, c); }
    long long query(int pos) { return query(1, 0, n - 1, pos); }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<array<long long,3>> r(n);
    for (auto& t : r) cin >> t[0] >> t[1] >> t[2];
    sort(r.begin(), r.end());            // by x increasing, so y is decreasing

    vector<long long> ys(n);
    for (int i = 0; i < n; i++) ys[i] = r[i][1];
    sort(ys.begin(), ys.end());          // query points, ascending
    LiChaoMin tree(ys);

    tree.add(0, 0);                      // the empty prefix: slope x_0 = 0, value dp = 0
    long long ans = 0;
    for (int i = 0; i < n; i++) {
        long long x = r[i][0], y = r[i][1], a = r[i][2];
        int pos = (int)(lower_bound(ys.begin(), ys.end(), y) - ys.begin());
        long long dp = -tree.query(pos) + x * y - a;   // max stored as negated min
        ans = max(ans, dp);
        tree.add(x, -dp);
    }
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "Because no rectangle nests inside another, sorting by x increasing forces y decreasing, and the union of a chosen subset becomes a staircase. If the chosen rectangles in x-order are j_1 < j_2 < ... < j_t, the union area telescopes: each chosen rectangle contributes (its x minus the previous chosen x) times its own y. That telescoping is the whole reason a one-dimensional DP works here.",
        "State: dp[i] is the best value of a subset whose largest-x member is i. Transition dp[i] = max over previous chosen j (or the empty prefix with x = 0, dp = 0) of dp[j] - x_j * y_i, then plus x_i * y_i - a_i. So j contributes a line with slope -x_j and intercept dp[j], and the query point is y_i. Store the negated lines and negate the query result to use a min tree.",
        "The answer is the maximum dp[i] over all i, floored at 0 for the empty subset - not dp[n-1]. Reporting dp of the last rectangle is the classic bug, since the widest rectangle can be far too expensive to be worth including.",
        "The query points y_i are all distinct and known up front, so the array-based tree over the sorted y values is right; a dynamic tree over a 10^9 range would need about n log C nodes, far too much for n = 10^6. Also note the query points arrive in decreasing order while the slopes -x_j decrease as well, which is precisely the awkward combination that breaks a naive monotone-pointer hull - Li Chao does not care.",
        "Magnitudes: x * y reaches 10^18 and the line value slope times query is another 10^18, so the sum stays under the 9.2 * 10^18 long long limit but only just; keep the sentinel as slope 0 with a large intercept and never let it multiply.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Segment Add Get Min",
      difficulty: "Hard",
      variation: "Li Chao over segments, not full lines",
      link: "https://judge.yosupo.jp/problem/segment_add_get_min",
      question: [
        "You maintain a set of line segments. A segment is given as (l, r, a, b) and represents the function f(x) = a*x + b restricted to the half-open interval [l, r). Initially the set holds N segments. Then Q operations follow. An operation '0 l r a b' inserts the segment (l, r, a, b). An operation '1 p' asks for the minimum of f(p) over every segment whose interval contains p; print INFINITY if no segment contains p.",
        "Example 1:\nInput:\n2 5\n-3 3 1 0\n0 5 -1 4\n1 -1\n1 4\n1 7\n0 -10 10 0 -5\n1 -1\nOutput:\n-1\n0\nINFINITY\n-5\nExplanation: The starting segments are y = x on [-3, 3) and y = -x + 4 on [0, 5). At p = -1 only the first applies, giving -1. At p = 4 only the second applies, giving 0. At p = 7 neither interval contains the point. After adding the constant -5 on [-10, 10), the point -1 is covered by y = x and by y = -5, so the answer is -5.",
        "Constraints:\n- 1 <= N, Q <= 2 * 10^5\n- -10^9 <= l < r <= 10^9\n- |a| <= 10^9, |b| <= 10^9\n- |p| <= 10^9",
      ],
      code: `const long long INFL = (long long)4e18;
const long long LO = -1000000000LL, HI = 1000000000LL;

struct Node { long long m, c; int l, r; };
vector<Node> t;
int root = -1;

long long val(long long m, long long c, long long x) { return m * x + c; }
int newNode(long long m, long long c) { t.push_back({m, c, -1, -1}); return (int)t.size() - 1; }

// Ordinary Li Chao line insert: the line is valid on the whole of [lo, hi].
int addLine(int node, long long lo, long long hi, long long m, long long c) {
    if (node == -1) return newNode(m, c);
    long long mid = lo + (hi - lo) / 2;
    bool atLo  = val(m, c, lo)  < val(t[node].m, t[node].c, lo);
    bool atMid = val(m, c, mid) < val(t[node].m, t[node].c, mid);
    if (atMid) { swap(t[node].m, m); swap(t[node].c, c); }
    if (lo == hi) return node;
    if (atLo != atMid) { int ch = addLine(t[node].l, lo, mid, m, c); t[node].l = ch; }
    else               { int ch = addLine(t[node].r, mid + 1, hi, m, c); t[node].r = ch; }
    return node;
}

// Segment insert: decompose [l, r] into O(log C) canonical nodes, line-insert into each.
int addSeg(int node, long long lo, long long hi, long long l, long long r,
           long long m, long long c) {
    if (r < lo || hi < l) return node;
    if (l <= lo && hi <= r) return addLine(node, lo, hi, m, c);
    if (node == -1) node = newNode(0, INFL);      // filler node so children can exist
    long long mid = lo + (hi - lo) / 2;
    int L = addSeg(t[node].l, lo, mid, l, r, m, c);        t[node].l = L;
    int R = addSeg(t[node].r, mid + 1, hi, l, r, m, c);    t[node].r = R;
    return node;
}

long long query(int node, long long lo, long long hi, long long x) {
    if (node == -1) return INFL;
    long long mid = lo + (hi - lo) / 2;
    long long res = val(t[node].m, t[node].c, x);
    if (x <= mid) return min(res, query(t[node].l, lo, mid, x));
    return min(res, query(t[node].r, mid + 1, hi, x));
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    for (int i = 0; i < n; i++) {
        long long l, r, a, b;
        cin >> l >> r >> a >> b;
        root = addSeg(root, LO, HI, l, r - 1, a, b);   // half-open input, closed internally
    }
    while (q--) {
        int type;
        cin >> type;
        if (type == 0) {
            long long l, r, a, b;
            cin >> l >> r >> a >> b;
            root = addSeg(root, LO, HI, l, r - 1, a, b);
        } else {
            long long p;
            cin >> p;
            long long res = query(root, LO, HI, p);
            if (res >= INFL) cout << "INFINITY" << "\\n";
            else cout << res << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "A convex hull cannot represent this at all: restricting lines to intervals destroys the global convexity that a hull relies on, and the lower envelope of segments is not convex. Li Chao, on the other hand, extends almost for free, because its query already walks a single root-to-leaf path and takes a minimum over the nodes it meets.",
        "The extension is the standard segment-tree decomposition. Split the insertion interval into the O(log C) canonical nodes that exactly tile it, and run the plain line insertion starting from each of those nodes. Inside such a node the segment covers the whole subtree interval, so it behaves like a genuine line there and the ordinary Li Chao argument applies unchanged.",
        "That is why the cost per segment insert is O(log^2 C) rather than O(log C): O(log C) canonical nodes, each triggering a line insert that may descend another O(log C) levels. Queries stay O(log C) - unchanged from the line-only version, since a query still only reads one line per node on its path.",
        "Implementation details that matter: nodes on the way down to a canonical node may not exist yet, so create them holding the sentinel (slope 0, intercept infinity) rather than skipping them, or the children become unreachable. The input interval is half-open, so insert on [l, r-1] with integer coordinates. And the sentinel must be recognisable at query time so an uncovered point prints INFINITY instead of a garbage number.",
        "Time: O((N + Q) log^2 C) for insertions and O(log C) per query. Space: O((N + Q) log C) nodes.",
      ],
    },
    {
      name: "Escape Through Leaf",
      difficulty: "Hard",
      variation: "Mergeable Li Chao trees over subtrees",
      link: "https://codeforces.com/problemset/problem/932/F",
      question: [
        "You are given a tree with n nodes rooted at node 1. Node i carries two numbers a_i and b_i. From node i you may jump to any node j inside the subtree of i (j not equal to i), paying a_i * b_j. Your goal is to reach a leaf. For every node i print the minimum total cost of a sequence of jumps that starts at i and ends at some leaf of the subtree of i; a leaf itself costs 0.",
        "Example 1:\nInput:\n5\n10 10 100 10 1\n1 2 3 4 5\n1 2\n2 3\n2 4\n1 5\nOutput: 30 30 0 0 0\nExplanation: Nodes 3, 4 and 5 are leaves so they cost 0. Node 2 can jump to 3 for 10 * 3 = 30 or to 4 for 10 * 4 = 40, so 30. Node 1 can jump straight to 3 for 10 * 3 = 30, which beats jumping to 2 for 10 * 2 = 20 and then paying 30 more.",
        "Example 2:\nInput:\n7\n-3 5 2 -7 4 1 -2\n6 -1 3 -4 2 5 -3\n1 2\n1 3\n2 4\n2 5\n3 6\n3 7\nOutput: -17 -20 -6 0 0 0 0\nExplanation: Node 2 jumps to leaf 4 for 5 * (-4) = -20; node 3 jumps to leaf 7 for 2 * (-3) = -6; node 1 jumps to node 2 for (-3) * (-1) = 3 and then pays -20, total -17, which beats every direct jump to a leaf.",
        "Constraints:\n- 2 <= n <= 10^5\n- -10^5 <= a_i, b_i <= 10^5",
        "Note that both a_i and b_i may be negative, so the useful slopes are not monotone in any traversal order.",
      ],
      code: `const long long INFL = (long long)4e18;
const long long LO = -100000, HI = 100000;      // range of a_i, the query coordinates

struct Node { long long m, c; int l, r; };
vector<Node> t;

long long val(long long m, long long c, long long x) { return m * x + c; }

int addLine(int node, long long lo, long long hi, long long m, long long c) {
    if (node == -1) { t.push_back({m, c, -1, -1}); return (int)t.size() - 1; }
    long long mid = lo + (hi - lo) / 2;
    bool atLo  = val(m, c, lo)  < val(t[node].m, t[node].c, lo);
    bool atMid = val(m, c, mid) < val(t[node].m, t[node].c, mid);
    if (atMid) { swap(t[node].m, m); swap(t[node].c, c); }
    if (lo == hi) return node;
    if (atLo != atMid) { int ch = addLine(t[node].l, lo, mid, m, c); t[node].l = ch; }
    else               { int ch = addLine(t[node].r, mid + 1, hi, m, c); t[node].r = ch; }
    return node;
}

long long query(int node, long long lo, long long hi, long long x) {
    if (node == -1) return INFL;
    long long mid = lo + (hi - lo) / 2;
    long long res = val(t[node].m, t[node].c, x);
    if (x <= mid) return min(res, query(t[node].l, lo, mid, x));
    return min(res, query(t[node].r, mid + 1, hi, x));
}

// Merge two Li Chao trees: merge the children, then reinsert the root line of v into u.
int mergeTree(int u, int v, long long lo, long long hi) {
    if (u == -1) return v;
    if (v == -1) return u;
    long long mid = lo + (hi - lo) / 2;
    int L = mergeTree(t[u].l, t[v].l, lo, mid);
    int R = mergeTree(t[u].r, t[v].r, mid + 1, hi);
    t[u].l = L; t[u].r = R;
    long long m = t[v].m, c = t[v].c;
    return addLine(u, lo, hi, m, c);
}

int n;
vector<long long> a, b, dp;
vector<vector<int>> g;
vector<int> rootOf;

void dfs(int u, int p) {
    bool leaf = true;
    for (int v : g[u]) if (v != p) { leaf = false; dfs(v, u); }
    if (leaf) {
        dp[u] = 0;
    } else {
        for (int v : g[u]) if (v != p) rootOf[u] = mergeTree(rootOf[u], rootOf[v], LO, HI);
        dp[u] = query(rootOf[u], LO, HI, a[u]);
    }
    rootOf[u] = addLine(rootOf[u], LO, HI, b[u], dp[u]);   // u itself is a jump target above
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n;
    a.assign(n + 1, 0); b.assign(n + 1, 0); dp.assign(n + 1, 0);
    g.assign(n + 1, {}); rootOf.assign(n + 1, -1);
    for (int i = 1; i <= n; i++) cin >> a[i];
    for (int i = 1; i <= n; i++) cin >> b[i];
    for (int i = 0; i < n - 1; i++) {
        int u, v;
        cin >> u >> v;
        g[u].push_back(v);
        g[v].push_back(u);
    }
    dfs(1, 0);
    for (int i = 1; i <= n; i++) cout << dp[i] << " \\n"[i == n];
    return 0;
}`,
      explanation: [
        "State: dp[u] is the cheapest way to get from u down to some leaf of u's subtree, with dp[leaf] = 0. Transition dp[u] = min over j in subtree(u), j not u, of a_u * b_j + dp[j]. Each candidate target j supplies a line with slope b_j and intercept dp[j], and dp[u] is the minimum of the lines belonging to u's subtree evaluated at x = a_u. So every node needs a line-minimum structure over its whole subtree, not just over its children.",
        "Since a_i and b_i can be negative, slopes and query points are in no useful order, which rules out every monotone hull variant. Li Chao is required here, and the extra requirement is that the structures must combine: the structure for u is the union of its children's structures plus u's own line.",
        "Merging works because a Li Chao tree is a segment tree with one line per node. To merge u and v, recursively merge their corresponding children and then insert v's own single line into the merged u. Every node of v is visited once and pays at most one O(log C) insertion, so the whole tree of merges is O(n log^2 C) - the same accounting as merging ordinary segment trees, and each node is destroyed at most once as it is absorbed.",
        "The wrong-but-tempting alternative is small-to-large with a full rebuild, reinserting every line of the smaller subtree into the larger. That is also O(n log^2 n) if the line lists are kept explicitly, but rebuilding Li Chao trees from scratch is far more code and far more memory; merging in place reuses nodes.",
        "Careful with the sentinel: nodes always hold a real line here, and an empty child is represented by index -1 whose query returns infinity, so no infinite intercept ever participates in a multiplication. Intermediate dp values reach about -10^15 on a long chain, so long long is mandatory.",
        "Time: O(n log^2 C) where C is the range of a and b. Space: O(n log C) nodes.",
      ],
    },
  ],
};
