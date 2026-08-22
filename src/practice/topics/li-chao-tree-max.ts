import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Line Add Get Min",
      difficulty: "Easy",
      variation: "Li Chao template: add a line, query the extreme at a point",
      link: "https://judge.yosupo.jp/problem/line_add_get_min",
      question: [
        "You are given N lines, the i-th being y = a_i * x + b_i, and then Q queries to process in order. A query '0 a b' adds the line y = a * x + b to the set. A query '1 p' asks for the minimum value attained at x = p over all lines currently in the set. Print the answer to every query of the second kind, one per line.",
        "This is the canonical drill for a Li Chao tree. The structure natively answers 'maximum over lines at x', so a minimum query is served by inserting the negated line (-a, -b) and negating the answer back.",
        "Example 1:\nInput:\n2 4\n1 0\n-1 5\n1 0\n1 3\n0 0 -2\n1 3\nOutput:\n0\n2\n-2\nExplanation: The starting set is y = x and y = -x + 5. At x = 0 they give 0 and 5, so the minimum is 0. At x = 3 they give 3 and 2, so the minimum is 2. After adding the constant line y = -2, the minimum at x = 3 becomes -2.",
        "Constraints:\n- 1 <= N, Q <= 2 * 10^5\n- -10^9 <= a_i, b_i <= 10^9\n- -10^9 <= p <= 10^9",
      ],
      code: `struct Line {
    long long m, c;
    long long at(long long x) const { return m * x + c; }
};

const long long NEG = -4000000000000000000LL;   // sentinel: a line that never wins

struct LiChaoMax {                               // dynamic nodes over [LO, HI]
    struct Node { Line ln; int l, r; };
    vector<Node> t;
    long long LO, HI;
    LiChaoMax(long long lo, long long hi) : LO(lo), HI(hi) {
        t.push_back({{0, NEG}, -1, -1});
    }
    void insert(Line nw) { insert(0, LO, HI, nw); }
    void insert(int u, long long lo, long long hi, Line nw) {
        long long mid = lo + (hi - lo) / 2;
        bool bLo = nw.at(lo) > t[u].ln.at(lo);
        bool bMid = nw.at(mid) > t[u].ln.at(mid);
        if (bMid) swap(t[u].ln, nw);              // keep the midpoint winner, push the loser down
        if (lo == hi) return;
        if (bLo != bMid) {                        // the two lines cross inside the left half
            if (t[u].l == -1) { t[u].l = (int)t.size(); t.push_back({{0, NEG}, -1, -1}); }
            insert(t[u].l, lo, mid, nw);
        } else {
            if (t[u].r == -1) { t[u].r = (int)t.size(); t.push_back({{0, NEG}, -1, -1}); }
            insert(t[u].r, mid + 1, hi, nw);
        }
    }
    long long query(long long x) const {
        long long lo = LO, hi = HI, res = NEG;
        int u = 0;
        while (u != -1) {
            res = max(res, t[u].ln.at(x));        // every line on the root-to-leaf path is a candidate
            if (lo == hi) break;
            long long mid = lo + (hi - lo) / 2;
            if (x <= mid) { u = t[u].l; hi = mid; }
            else { u = t[u].r; lo = mid + 1; }
        }
        return res;
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    LiChaoMax tree(-1000000000LL, 1000000000LL);
    for (int i = 0; i < n; i++) {
        long long a, b;
        cin >> a >> b;
        tree.insert({-a, -b});                    // min over lines = -(max over negated lines)
    }
    while (q--) {
        int type;
        cin >> type;
        if (type == 0) {
            long long a, b;
            cin >> a >> b;
            tree.insert({-a, -b});
        } else {
            long long p;
            cin >> p;
            cout << -tree.query(p) << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "The state is a segment tree over the x-axis where every node owns one line - the line that is the best of its subtree somewhere inside the node's range. Nothing else is stored: no hull, no ordering, no sorted slopes.",
        "Insertion works because two distinct lines cross at most once. Compare the incoming line with the node's line at the midpoint and keep the winner in the node. The loser can only be better than the winner on one side of the crossing point, and comparing the two at the left endpoint tells you which side that is, so the loser is pushed into exactly one child. One line therefore touches O(log C) nodes.",
        "A query at x collects the maximum of the lines stored on the single root-to-leaf path for x. That is enough: whichever line is truly optimal at x was, along its insertion path, either kept at some node above the leaf or pushed further towards x, so it sits on that path.",
        "The tempting wrong move is the monotone convex hull trick with a stack or a deque. That needs slopes inserted in sorted order and often queries in sorted order too; here lines arrive in arbitrary order interleaved with queries, and the stack version silently returns wrong answers. The other classic trap is the sentinel: use a value like -4 * 10^18 with slope 0, never LLONG_MIN, or evaluating it overflows.",
        "Time: O((N + Q) log C) where C is the width of the coordinate range. Space: O((N + Q) log C).",
      ],
    },
    {
      name: "Shopping in AtCoder store",
      difficulty: "Medium",
      variation: "Direct maximum over an explicit family of lines",
      link: "https://atcoder.jp/contests/abc289/tasks/abc289_g",
      question: [
        "There are N customers and M products. Customer i has purchasing intent B_i and product j has value C_j. If product j is priced at a non-negative integer P, customer i buys one unit of it exactly when B_i + C_j >= P. For each product independently, print the maximum revenue P * (number of customers who buy it) that can be achieved by choosing P.",
        "Example 1:\nInput:\n3 2\n10 20 30\n0 100\nOutput: 40 330\nExplanation: For the product of value 0, pricing at 20 gets the customers with intent 20 and 30, for revenue 40; no price beats that. For the product of value 100, pricing at 110 gets all three customers, for revenue 330.",
        "Example 2:\nInput:\n2 1\n5 5\n3\nOutput: 16\nExplanation: Pricing at 8 keeps both customers, since 5 + 3 >= 8, giving 2 * 8 = 16.",
        "Constraints:\n- 1 <= N, M <= 2 * 10^5\n- 0 <= B_i, C_j <= 10^9",
      ],
      code: `struct Line {
    long long m, c;
    long long at(long long x) const { return m * x + c; }
};

const long long NEG = -4000000000000000000LL;

struct LiChaoMax {
    struct Node { Line ln; int l, r; };
    vector<Node> t;
    long long LO, HI;
    LiChaoMax(long long lo, long long hi) : LO(lo), HI(hi) {
        t.push_back({{0, NEG}, -1, -1});
    }
    void insert(Line nw) { insert(0, LO, HI, nw); }
    void insert(int u, long long lo, long long hi, Line nw) {
        long long mid = lo + (hi - lo) / 2;
        bool bLo = nw.at(lo) > t[u].ln.at(lo);
        bool bMid = nw.at(mid) > t[u].ln.at(mid);
        if (bMid) swap(t[u].ln, nw);
        if (lo == hi) return;
        if (bLo != bMid) {
            if (t[u].l == -1) { t[u].l = (int)t.size(); t.push_back({{0, NEG}, -1, -1}); }
            insert(t[u].l, lo, mid, nw);
        } else {
            if (t[u].r == -1) { t[u].r = (int)t.size(); t.push_back({{0, NEG}, -1, -1}); }
            insert(t[u].r, mid + 1, hi, nw);
        }
    }
    long long query(long long x) const {
        long long lo = LO, hi = HI, res = NEG;
        int u = 0;
        while (u != -1) {
            res = max(res, t[u].ln.at(x));
            if (lo == hi) break;
            long long mid = lo + (hi - lo) / 2;
            if (x <= mid) { u = t[u].l; hi = mid; }
            else { u = t[u].r; lo = mid + 1; }
        }
        return res;
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<long long> b(n);
    for (auto& v : b) cin >> v;
    sort(b.begin(), b.end(), greater<long long>());
    LiChaoMax tree(0, 1000000000LL);
    // selling to exactly the k keenest customers allows the price b[k-1] + C
    for (int k = 1; k <= n; k++) tree.insert({(long long)k, (long long)k * b[k - 1]});
    for (int j = 0; j < m; j++) {
        long long c;
        cin >> c;
        cout << tree.query(c) << " \\n"[j == m - 1];
    }
    return 0;
}`,
      explanation: [
        "Sort the intents in decreasing order. If you want exactly the k keenest customers to buy product j, the binding customer is the k-th one, so the price may be as high as B_(k) + C_j and no higher. Revenue is then k * B_(k) + k * C_j, which as a function of C_j is a straight line of slope k and intercept k * B_(k).",
        "So the answer for product j is the maximum of N fixed lines evaluated at x = C_j. Build the tree once from the N lines and answer all M products with one query each - the lines never change, only the query point does.",
        "The trap is trying to optimise the price directly for each product, for example by ternary searching P. Revenue as a function of P is not unimodal: it jumps every time another customer drops out, so hill climbing lands on a local peak. Restricting attention to the N candidate prices B_(k) + C_j is what makes the problem linear.",
        "Slopes here happen to be 1..N in sorted order, so a monotone hull would also work; Li Chao needs no such argument and no sorting of the query points, which is why it is the shorter correct answer. Watch the magnitudes: k * B_(k) reaches 2 * 10^14, well past 32 bits.",
        "Time: O(N log N + (N + M) log C). Space: O(N log C).",
      ],
    },
    {
      name: "Frog 3",
      difficulty: "Medium",
      variation: "Quadratic DP transition linearised",
      link: "https://atcoder.jp/contests/dp/tasks/dp_z",
      question: [
        "There are N stones numbered 1..N with strictly increasing heights h_1 < h_2 < ... < h_N, and a constant C. A frog starts on stone 1 and repeatedly jumps to any stone with a strictly larger index. Jumping from stone i to stone j costs (h_i - h_j)^2 + C. Print the minimum possible total cost to reach stone N.",
        "Example 1:\nInput:\n5 6\n1 2 3 4 5\nOutput: 20\nExplanation: The cheapest route is 1 -> 3 -> 5, costing (1-3)^2 + 6 = 10 then (3-5)^2 + 6 = 10.",
        "Example 2:\nInput:\n2 1000000000000\n500000 1000000\nOutput: 1250000000000\nExplanation: The single jump costs 500000^2 + 10^12.",
        "Constraints:\n- 2 <= N <= 2 * 10^5\n- 1 <= C <= 10^12\n- 1 <= h_1 < h_2 < ... < h_N <= 10^6",
      ],
      code: `struct Line {
    long long m, c;
    long long at(long long x) const { return m * x + c; }
};

const long long NEG = -4000000000000000000LL;

struct LiChaoMax {
    struct Node { Line ln; int l, r; };
    vector<Node> t;
    long long LO, HI;
    LiChaoMax(long long lo, long long hi) : LO(lo), HI(hi) {
        t.push_back({{0, NEG}, -1, -1});
    }
    void insert(Line nw) { insert(0, LO, HI, nw); }
    void insert(int u, long long lo, long long hi, Line nw) {
        long long mid = lo + (hi - lo) / 2;
        bool bLo = nw.at(lo) > t[u].ln.at(lo);
        bool bMid = nw.at(mid) > t[u].ln.at(mid);
        if (bMid) swap(t[u].ln, nw);
        if (lo == hi) return;
        if (bLo != bMid) {
            if (t[u].l == -1) { t[u].l = (int)t.size(); t.push_back({{0, NEG}, -1, -1}); }
            insert(t[u].l, lo, mid, nw);
        } else {
            if (t[u].r == -1) { t[u].r = (int)t.size(); t.push_back({{0, NEG}, -1, -1}); }
            insert(t[u].r, mid + 1, hi, nw);
        }
    }
    long long query(long long x) const {
        long long lo = LO, hi = HI, res = NEG;
        int u = 0;
        while (u != -1) {
            res = max(res, t[u].ln.at(x));
            if (lo == hi) break;
            long long mid = lo + (hi - lo) / 2;
            if (x <= mid) { u = t[u].l; hi = mid; }
            else { u = t[u].r; lo = mid + 1; }
        }
        return res;
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    long long n, C;
    cin >> n >> C;
    vector<long long> h(n);
    for (auto& v : h) cin >> v;
    LiChaoMax tree(1, 1000000);
    vector<long long> dp(n, 0);
    tree.insert({2 * h[0], -(h[0] * h[0])});          // line for source i = 0, dp = 0
    for (int j = 1; j < n; j++) {
        dp[j] = h[j] * h[j] + C - tree.query(h[j]);   // -max(...) is the min we want
        tree.insert({2 * h[j], -(dp[j] + h[j] * h[j])});
    }
    cout << dp[n - 1] << "\\n";
    return 0;
}`,
      explanation: [
        "dp[j] is the cheapest cost to reach stone j. Expanding the square, dp[j] = h_j^2 + C + min over i < j of (dp[i] + h_i^2 - 2 * h_i * h_j). The bracket is a line in the variable h_j: slope -2 * h_i, intercept dp[i] + h_i^2. Every earlier stone contributes one line, and the transition is a single minimum-over-lines evaluation at x = h_j.",
        "Because the tree answers maxima, insert the negated line (2 * h_i, -(dp[i] + h_i^2)) and subtract the result. The order is what keeps this honest: the line for stone i is inserted only after dp[i] is final, so a query at stone j sees exactly the lines for i < j - the same set the O(N^2) loop would scan.",
        "The wrong-but-tempting shortcut is assuming the optimal predecessor is the previous stone or moves monotonically and doing a greedy or two-pointer scan. It does not: with a large C the frog wants long jumps, with a small C short ones, and the crossover depends on the height gaps, so only the full minimum is safe.",
        "Slopes -2 * h_i are decreasing and query points h_j are increasing here, so this is the textbook monotone convex hull trick case as well; Li Chao is used because it needs neither monotonicity proof. Note C reaches 10^12, so every accumulator is 64-bit.",
        "Time: O(N log H) where H is the maximum height. Space: O(N log H).",
      ],
    },
    {
      name: "Land Acquisition",
      difficulty: "Medium",
      variation: "Dominance pruning, then min over lines",
      link: "https://www.spoj.com/problems/ACQUIRE/",
      question: [
        "Farmer John must buy N rectangular plots of land; plot i has width w_i and height h_i. He buys them in groups: any subset of the plots may form a group, every plot must belong to exactly one group, and the price of a group is (the largest width in it) * (the largest height in it). Print the minimum total price of buying all N plots.",
        "Example 1:\nInput:\n4\n100 1\n15 15\n20 5\n1 100\nOutput: 500\nExplanation: Use three groups - {100x1} for 100 * 1 = 100, {20x5, 15x15} for 20 * 15 = 300, and {1x100} for 1 * 100 = 100 - giving 500 in total.",
        "Example 2:\nInput:\n2\n10 1\n1 10\nOutput: 20\nExplanation: Buying both together costs 10 * 10 = 100, while two singleton groups cost 10 + 10 = 20.",
        "Constraints:\n- 1 <= N <= 50000\n- 1 <= w_i, h_i <= 10^6",
      ],
      code: `struct Line {
    long long m, c;
    long long at(long long x) const { return m * x + c; }
};

const long long NEG = -4000000000000000000LL;

struct LiChaoMax {
    struct Node { Line ln; int l, r; };
    vector<Node> t;
    long long LO, HI;
    LiChaoMax(long long lo, long long hi) : LO(lo), HI(hi) {
        t.push_back({{0, NEG}, -1, -1});
    }
    void insert(Line nw) { insert(0, LO, HI, nw); }
    void insert(int u, long long lo, long long hi, Line nw) {
        long long mid = lo + (hi - lo) / 2;
        bool bLo = nw.at(lo) > t[u].ln.at(lo);
        bool bMid = nw.at(mid) > t[u].ln.at(mid);
        if (bMid) swap(t[u].ln, nw);
        if (lo == hi) return;
        if (bLo != bMid) {
            if (t[u].l == -1) { t[u].l = (int)t.size(); t.push_back({{0, NEG}, -1, -1}); }
            insert(t[u].l, lo, mid, nw);
        } else {
            if (t[u].r == -1) { t[u].r = (int)t.size(); t.push_back({{0, NEG}, -1, -1}); }
            insert(t[u].r, mid + 1, hi, nw);
        }
    }
    long long query(long long x) const {
        long long lo = LO, hi = HI, res = NEG;
        int u = 0;
        while (u != -1) {
            res = max(res, t[u].ln.at(x));
            if (lo == hi) break;
            long long mid = lo + (hi - lo) / 2;
            if (x <= mid) { u = t[u].l; hi = mid; }
            else { u = t[u].r; lo = mid + 1; }
        }
        return res;
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<pair<long long,long long>> r(n);
    for (auto& p : r) cin >> p.first >> p.second;
    sort(r.begin(), r.end(), [](const pair<long long,long long>& a,
                                const pair<long long,long long>& b) {
        if (a.first != b.first) return a.first > b.first;
        return a.second > b.second;
    });
    vector<long long> w, h;
    for (auto& p : r) {
        if (!h.empty() && p.second <= h.back()) continue;   // dominated: it is free to absorb
        w.push_back(p.first);
        h.push_back(p.second);
    }
    int k = h.size();
    LiChaoMax tree(1, 1000000);
    vector<long long> dp(k + 1, 0);
    for (int i = 1; i <= k; i++) {
        tree.insert({-w[i - 1], -dp[i - 1]});               // group may start at plot i
        dp[i] = -tree.query(h[i - 1]);
    }
    cout << dp[k] << "\\n";
    return 0;
}`,
      explanation: [
        "First prune: sort by width descending and keep a plot only if its height exceeds every height kept so far. A plot with both dimensions no larger than a kept plot can join that plot's group for free, so it never influences any price. What survives is a staircase - widths non-increasing, heights strictly increasing.",
        "On the staircase, an optimal solution groups consecutive plots. dp[i] is the cost of buying the first i staircase plots; a group covering plots j+1..i has width w[j+1] (the first is widest) and height h[i] (the last is tallest), so dp[i] = min over j < i of dp[j] + w[j+1] * h[i]. That bracket is a line of slope w[j+1] and intercept dp[j] evaluated at x = h[i].",
        "Insert the line for prefix j only after dp[j] is known, immediately before computing dp[j+1]; the negation trick turns the minimum into the tree's native maximum. Skipping the dominance pruning is the usual bug - without it the grouping is no longer a contiguous-interval DP and the recurrence above is simply wrong.",
        "Time: O(N log N + N log H). Space: O(N log H).",
      ],
    },
    {
      name: "Kalila and Dimna in the Logging Industry",
      difficulty: "Medium",
      variation: "Min over lines with non-monotone insertion",
      link: "https://codeforces.com/problemset/problem/319/C",
      question: [
        "There are n trees; tree i has height a_i, where a_1 = 1 and the heights are strictly increasing. Tree i also carries a recharge cost b_i, where the costs are strictly decreasing and b_n = 0. Cutting one unit of height off any tree consumes a charge, and a recharge costs b_i where i is the largest index of a tree already cut down to height 0. The chainsaw starts charged, so tree 1 (of height 1) can always be felled first at no cost. Print the minimum total cost to cut all n trees down to height 0.",
        "Example 1:\nInput:\n5\n1 2 3 4 5\n5 4 3 2 0\nOutput: 25\nExplanation: Fell tree 1 for free, then spend 5 per unit to fell tree 5 outright: 5 * 5 = 25. Once tree 5 is down every recharge is free.",
        "Example 2:\nInput:\n6\n1 2 3 10 20 30\n6 5 4 3 2 0\nOutput: 138\nExplanation: Fell tree 1 free, then tree 3 at cost 6 * 3 = 18, then tree 6 at cost 4 * 30 = 120, for 138 in total.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= a_i <= 10^9 and a is strictly increasing with a_1 = 1\n- 0 <= b_i <= 10^9 and b is strictly decreasing with b_n = 0\n- The answer fits in a signed 64-bit integer",
      ],
      code: `struct Line {
    long long m, c;
    long long at(long long x) const { return m * x + c; }
};

const long long NEG = -4000000000000000000LL;

struct LiChaoMax {
    struct Node { Line ln; int l, r; };
    vector<Node> t;
    long long LO, HI;
    LiChaoMax(long long lo, long long hi) : LO(lo), HI(hi) {
        t.push_back({{0, NEG}, -1, -1});
    }
    void insert(Line nw) { insert(0, LO, HI, nw); }
    void insert(int u, long long lo, long long hi, Line nw) {
        long long mid = lo + (hi - lo) / 2;
        bool bLo = nw.at(lo) > t[u].ln.at(lo);
        bool bMid = nw.at(mid) > t[u].ln.at(mid);
        if (bMid) swap(t[u].ln, nw);
        if (lo == hi) return;
        if (bLo != bMid) {
            if (t[u].l == -1) { t[u].l = (int)t.size(); t.push_back({{0, NEG}, -1, -1}); }
            insert(t[u].l, lo, mid, nw);
        } else {
            if (t[u].r == -1) { t[u].r = (int)t.size(); t.push_back({{0, NEG}, -1, -1}); }
            insert(t[u].r, mid + 1, hi, nw);
        }
    }
    long long query(long long x) const {
        long long lo = LO, hi = HI, res = NEG;
        int u = 0;
        while (u != -1) {
            res = max(res, t[u].ln.at(x));
            if (lo == hi) break;
            long long mid = lo + (hi - lo) / 2;
            if (x <= mid) { u = t[u].l; hi = mid; }
            else { u = t[u].r; lo = mid + 1; }
        }
        return res;
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<long long> a(n), b(n);
    for (auto& v : a) cin >> v;
    for (auto& v : b) cin >> v;
    LiChaoMax tree(1, 1000000000LL);
    vector<long long> dp(n, 0);
    tree.insert({-b[0], 0});                 // tree 1 is felled for free, dp = 0
    for (int i = 1; i < n; i++) {
        dp[i] = -tree.query(a[i]);           // cheapest way to fell tree i outright
        tree.insert({-b[i], -dp[i]});
    }
    cout << dp[n - 1] << "\\n";
    return 0;
}`,
      explanation: [
        "The key observation is that the whole task costs exactly what it costs to fell tree n, because b_n = 0 makes every later cut free. So the answer is dp[n], where dp[i] is the minimum cost to have tree i standing at height 0.",
        "To fell tree i you pay for a_i units of cutting, all charged at the rate of some already felled tree j, and it is never worse to fell that tree j completely first: dp[i] = min over j < i of dp[j] + b_j * a_i. The bracket is a line of slope b_j and intercept dp[j] evaluated at x = a_i, so each dp value is one minimum-over-lines query.",
        "The trap is greed: always recharging on the cheapest tree felled so far, or always using tree i-1, both fail. Paying more per unit at a cheaper-to-reach tree can beat paying less per unit at a tree that was expensive to fell, and only the full minimum resolves that trade-off.",
        "Slopes b_j arrive in decreasing order and queries a_i in increasing order, so a monotone hull is possible, but the Li Chao version tolerates any order and any query - useful because a small change to the statement (heights not sorted, say) breaks the monotone version instantly.",
        "Time: O(n log A). Space: O(n log A).",
      ],
    },
    {
      name: "The Fair Nut and Rectangles",
      difficulty: "Medium",
      variation: "Max-DP on a static, coordinate-compressed Li Chao tree",
      link: "https://codeforces.com/problemset/problem/1083/E",
      question: [
        "You are given n rectangles; rectangle i has its lower-left corner at the origin and its upper-right corner at (x_i, y_i), and costs a_i to select. No rectangle is nested in another: there is no pair i != j with x_i <= x_j and y_i <= y_j. Choose a subset of rectangles to maximise (the area of the union of the chosen rectangles) minus (the sum of their costs). The empty subset is allowed and scores 0.",
        "Example 1:\nInput:\n3\n4 4 8\n1 5 0\n5 2 0\nOutput: 13\nExplanation: Choosing the 1x5 and 5x2 rectangles gives a staircase of area 1 * 5 + 4 * 2 = 13 at zero cost. Adding the 4x4 rectangle raises the area to 19 but costs 8, which is worse.",
        "Example 2:\nInput:\n1\n5 5 3\nOutput: 22\nExplanation: Take the only rectangle: area 25 minus cost 3.",
        "Constraints:\n- 1 <= n <= 10^6\n- 1 <= x_i, y_i <= 10^9\n- 0 <= a_i <= x_i * y_i",
      ],
      code: `struct Line {
    long long m, c;
    long long at(long long x) const { return m * x + c; }
};

const long long NEG = -4000000000000000000LL;

// Li Chao over a fixed set of query abscissae - O(n) memory instead of O(n log C)
struct LiChaoPts {
    vector<long long> xs;
    vector<Line> t;
    int n;
    LiChaoPts(vector<long long> pts) : xs(std::move(pts)) {
        n = (int)xs.size();
        t.assign(4 * n, {0, NEG});
    }
    void insert(Line nw) { insert(1, 0, n - 1, nw); }
    void insert(int u, int lo, int hi, Line nw) {
        int mid = lo + (hi - lo) / 2;
        bool bLo = nw.at(xs[lo]) > t[u].at(xs[lo]);
        bool bMid = nw.at(xs[mid]) > t[u].at(xs[mid]);
        if (bMid) swap(t[u], nw);
        if (lo == hi) return;
        if (bLo != bMid) insert(2 * u, lo, mid, nw);
        else insert(2 * u + 1, mid + 1, hi, nw);
    }
    long long query(int pos) const {
        int u = 1, lo = 0, hi = n - 1;
        long long res = NEG;
        while (true) {
            res = max(res, t[u].at(xs[pos]));
            if (lo == hi) break;
            int mid = lo + (hi - lo) / 2;
            if (pos <= mid) { u = 2 * u; hi = mid; }
            else { u = 2 * u + 1; lo = mid + 1; }
        }
        return res;
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<tuple<long long,long long,long long>> r(n);
    for (auto& e : r) cin >> get<0>(e) >> get<1>(e) >> get<2>(e);
    sort(r.begin(), r.end());                       // x increasing, hence y decreasing
    vector<long long> ys(n);
    for (int i = 0; i < n; i++) ys[i] = get<1>(r[i]);
    sort(ys.begin(), ys.end());
    ys.erase(unique(ys.begin(), ys.end()), ys.end());
    LiChaoPts tree(ys);
    tree.insert({0, 0});                            // the empty prefix: dp = 0, x = 0
    long long ans = 0;
    for (int i = 0; i < n; i++) {
        long long x = get<0>(r[i]), y = get<1>(r[i]), a = get<2>(r[i]);
        int pos = (int)(lower_bound(ys.begin(), ys.end(), y) - ys.begin());
        long long dp = x * y - a + tree.query(pos);
        ans = max(ans, dp);
        tree.insert({-x, dp});
    }
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "Sorting by x increasing forces y decreasing, because nesting is forbidden. Any chosen subset is then a staircase, and if rectangle i is the widest chosen one, the area it adds over the previously widest chosen rectangle j is x_i * y_i - x_j * y_i. So dp[i] = x_i * y_i - a_i + max over j < i of (dp[j] - x_j * y_i), with a virtual j = 0 having dp = 0 and x = 0.",
        "The bracket is a line of slope -x_j and intercept dp[j] evaluated at x = y_i, which is a maximum-over-lines query - the pattern in its purest form, no negation needed. The answer is the largest dp value, and it is never negative because a_i <= x_i * y_i makes every singleton non-negative.",
        "With n up to 10^6 and coordinates up to 10^9 a dynamic tree would allocate roughly 3 * 10^7 nodes and blow the memory limit. The fix is that Li Chao only ever needs the set of query abscissae: compress the y values and run a static array-based tree of 4n slots, comparing lines at the real y values stored in xs.",
        "The seductive wrong model is to treat this as 'pick every rectangle whose own area exceeds its cost'. That double counts overlap - two selected rectangles share the strip below the smaller height - so a rectangle profitable in isolation can be a loss once its neighbour is taken, exactly as in the first example.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Product Sum",
      difficulty: "Hard",
      variation: "Two sweeps of max-over-lines",
      link: "https://codeforces.com/problemset/problem/631/E",
      question: [
        "The characteristic of an array a of length n is the sum of i * a_i over i = 1..n, using 1-based indices. You may pick exactly one element and move it to any position of the array, shifting the elements in between; moving an element to its own position is allowed and changes nothing. Print the maximum characteristic obtainable.",
        "Example 1:\nInput:\n4\n4 3 2 5\nOutput: 39\nExplanation: The characteristic starts at 4 + 6 + 6 + 20 = 36. Moving the 2 to the front gives [2, 4, 3, 5] with characteristic 2 + 8 + 9 + 20 = 39.",
        "Example 2:\nInput:\n5\n1 1 2 7 1\nOutput: 49\nExplanation: Moving the last 1 to the front gives [1, 1, 1, 2, 7] with characteristic 1 + 2 + 3 + 8 + 35 = 49.",
        "Constraints:\n- 2 <= n <= 2 * 10^5\n- -10^6 <= a_i <= 10^6",
      ],
      code: `struct Line {
    long long m, c;
    long long at(long long x) const { return m * x + c; }
};

const long long NEG = -4000000000000000000LL;

struct LiChaoMax {
    struct Node { Line ln; int l, r; };
    vector<Node> t;
    long long LO, HI;
    LiChaoMax(long long lo, long long hi) : LO(lo), HI(hi) {
        t.push_back({{0, NEG}, -1, -1});
    }
    void insert(Line nw) { insert(0, LO, HI, nw); }
    void insert(int u, long long lo, long long hi, Line nw) {
        long long mid = lo + (hi - lo) / 2;
        bool bLo = nw.at(lo) > t[u].ln.at(lo);
        bool bMid = nw.at(mid) > t[u].ln.at(mid);
        if (bMid) swap(t[u].ln, nw);
        if (lo == hi) return;
        if (bLo != bMid) {
            if (t[u].l == -1) { t[u].l = (int)t.size(); t.push_back({{0, NEG}, -1, -1}); }
            insert(t[u].l, lo, mid, nw);
        } else {
            if (t[u].r == -1) { t[u].r = (int)t.size(); t.push_back({{0, NEG}, -1, -1}); }
            insert(t[u].r, mid + 1, hi, nw);
        }
    }
    long long query(long long x) const {
        long long lo = LO, hi = HI, res = NEG;
        int u = 0;
        while (u != -1) {
            res = max(res, t[u].ln.at(x));
            if (lo == hi) break;
            long long mid = lo + (hi - lo) / 2;
            if (x <= mid) { u = t[u].l; hi = mid; }
            else { u = t[u].r; lo = mid + 1; }
        }
        return res;
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<long long> a(n + 1);
    for (int i = 1; i <= n; i++) cin >> a[i];
    vector<long long> S(n + 1, 0);
    for (int i = 1; i <= n; i++) S[i] = S[i - 1] + a[i];
    long long base = 0;
    for (int i = 1; i <= n; i++) base += (long long)i * a[i];
    long long best = 0;                                   // moving an element to its own slot
    {
        LiChaoMax tree(-1000000, 1000000);                // move element i left to position j <= i
        for (int i = 1; i <= n; i++) {
            tree.insert({(long long)i, -S[i - 1]});
            best = max(best, tree.query(a[i]) - a[i] * i + S[i - 1]);
        }
    }
    {
        LiChaoMax tree(-1000000, 1000000);                // move element i right to position j >= i
        for (int i = n; i >= 1; i--) {
            tree.insert({(long long)i, -S[i]});
            best = max(best, tree.query(a[i]) - a[i] * i + S[i]);
        }
    }
    cout << base + best << "\\n";
    return 0;
}`,
      explanation: [
        "Write the gain of a move as a function of the two indices. Moving a_i left to position j <= i shifts a_j..a_{i-1} one slot right, so the characteristic changes by (S[i-1] - S[j-1]) + a_i * (j - i), where S is the prefix-sum array. Moving a_i right to position j >= i shifts a_{i+1}..a_j one slot left, changing it by -(S[j] - S[i]) + a_i * (j - i).",
        "Fix i and look at the j-dependent part: for the leftward case it is a_i * j - S[j-1], for the rightward case a_i * j - S[j]. Both are lines in the variable a_i with slope j and intercept -S[j-1] or -S[j]. So each direction is one sweep that inserts the line for destination j and then queries the tree at x = a_i, which is exactly max-over-lines.",
        "The sweeps must be in opposite directions so that the tree holds only legal destinations: increasing i for leftward moves (destinations 1..i are already inserted) and decreasing i for rightward moves. Mixing them into one tree would allow a move to be scored with the shift formula of the wrong direction.",
        "The trap is greedy intuition - move the largest element to the last position, or the smallest to the first. Both fail because shifting a whole block changes the contribution of every element in between, and that displacement term can dominate. Also note the query points a_i are arbitrary and can be negative, so no monotone-query hull applies without extra sorting; a plain Li Chao over [-10^6, 10^6] just works.",
        "Time: O(n log V) where V is the value range. Space: O(n log V).",
      ],
    },
    {
      name: "Bear and Bowling 4",
      difficulty: "Hard",
      variation: "Non-monotone slopes and query points",
      link: "https://codeforces.com/problemset/problem/660/F",
      question: [
        "Limak played n bowling games and scored a_i points in game i. He will keep one contiguous block of games (possibly the empty block) and delete the rest. If the kept block is games l..r, his total is the sum over k = l..r of (k - l + 1) * a_k, so the first kept game is weighted 1, the second 2, and so on. Print the maximum total he can achieve.",
        "Example 1:\nInput:\n5\n1 2 3 4 5\nOutput: 55\nExplanation: Keeping everything gives 1 + 4 + 9 + 16 + 25 = 55, and no shorter block beats it.",
        "Example 2:\nInput:\n2\n-10 5\nOutput: 5\nExplanation: Keeping only the second game scores 5, while keeping both scores -10 + 10 = 0.",
        "Constraints:\n- 1 <= n <= 2 * 10^5\n- -10^7 <= a_i <= 10^7",
      ],
      code: `struct Line {
    long long m, c;
    long long at(long long x) const { return m * x + c; }
};

const long long NEG = -4000000000000000000LL;

struct LiChaoMax {
    struct Node { Line ln; int l, r; };
    vector<Node> t;
    long long LO, HI;
    LiChaoMax(long long lo, long long hi) : LO(lo), HI(hi) {
        t.push_back({{0, NEG}, -1, -1});
    }
    void insert(Line nw) { insert(0, LO, HI, nw); }
    void insert(int u, long long lo, long long hi, Line nw) {
        long long mid = lo + (hi - lo) / 2;
        bool bLo = nw.at(lo) > t[u].ln.at(lo);
        bool bMid = nw.at(mid) > t[u].ln.at(mid);
        if (bMid) swap(t[u].ln, nw);
        if (lo == hi) return;
        if (bLo != bMid) {
            if (t[u].l == -1) { t[u].l = (int)t.size(); t.push_back({{0, NEG}, -1, -1}); }
            insert(t[u].l, lo, mid, nw);
        } else {
            if (t[u].r == -1) { t[u].r = (int)t.size(); t.push_back({{0, NEG}, -1, -1}); }
            insert(t[u].r, mid + 1, hi, nw);
        }
    }
    long long query(long long x) const {
        long long lo = LO, hi = HI, res = NEG;
        int u = 0;
        while (u != -1) {
            res = max(res, t[u].ln.at(x));
            if (lo == hi) break;
            long long mid = lo + (hi - lo) / 2;
            if (x <= mid) { u = t[u].l; hi = mid; }
            else { u = t[u].r; lo = mid + 1; }
        }
        return res;
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<long long> a(n + 1);
    for (int i = 1; i <= n; i++) cin >> a[i];
    vector<long long> A(n + 1, 0), B(n + 1, 0);
    for (int i = 1; i <= n; i++) {
        A[i] = A[i - 1] + a[i];                 // plain prefix sums
        B[i] = B[i - 1] + (long long)i * a[i];  // index-weighted prefix sums
    }
    LiChaoMax tree(-2000000000000LL, 2000000000000LL);   // A[j] can be this large in magnitude
    long long ans = 0;                                   // the empty block scores 0
    for (int j = 1; j <= n; j++) {
        tree.insert({-(long long)(j - 1), (long long)(j - 1) * A[j - 1] - B[j - 1]});
        ans = max(ans, B[j] + tree.query(A[j]));
    }
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "Let A be prefix sums of a and B prefix sums of i * a_i. For the block l..r the score is (B[r] - B[l-1]) - (l-1) * (A[r] - A[l-1]), because every kept element loses exactly (l-1) copies of itself relative to its original index weight. Rearranged for a fixed right end r, the score is B[r] + ( -(l-1) * A[r] + (l-1) * A[l-1] - B[l-1] ).",
        "The parenthesised part is a line in the variable A[r]: slope -(l-1), intercept (l-1) * A[l-1] - B[l-1]. Sweep r upward, insert the line for l = r before querying so that all left ends 1..r are available, and the transition becomes a single maximum-over-lines evaluation at x = A[r].",
        "This is the variation where Li Chao is not a convenience but a necessity. Query points are prefix sums of an array with negative entries, so they are not monotone, and the classical deque hull - which relies on both slopes and queries being sorted - cannot be used without an extra offline sort or a binary search on the hull. Li Chao handles an arbitrary query sequence natively.",
        "The natural wrong turn is a Kadane-style scan: extend the current block while it helps, restart when the running total goes negative. That is invalid here because the weight of every future element depends on where the block started, so a locally bad prefix can still be worth keeping to raise the multipliers behind it.",
        "The coordinate range must cover the prefix sums, about 2 * 10^12, not the input range; and the products slope * x reach 4 * 10^17, so 64-bit throughout with a sentinel comfortably below that.",
        "Time: O(n log C) with C around 4 * 10^12. Space: O(n log C).",
      ],
    },
    {
      name: "Segment Add Get Min",
      difficulty: "Hard",
      variation: "Lines valid only on a sub-segment",
      link: "https://judge.yosupo.jp/problem/segment_add_get_min",
      question: [
        "Maintain a set of line segments. Each segment is given as l r a b and represents the line y = a * x + b restricted to the half-open interval [l, r). You are given N initial segments and then Q queries: '0 l r a b' adds another segment, and '1 p' asks for the minimum value at x = p over all segments whose interval contains p. If no segment covers p, print INFINITY instead of a number.",
        "Example 1:\nInput:\n2 4\n-3 3 0 5\n0 5 1 0\n1 -4\n1 -1\n1 2\n1 4\nOutput:\nINFINITY\n5\n2\n4\nExplanation: x = -4 is outside both intervals. At x = -1 only the constant 5 applies. At x = 2 both apply and give 5 and 2. At x = 4 only y = x applies.",
        "Constraints:\n- 1 <= N, Q <= 2 * 10^5\n- -10^9 <= l < r <= 10^9\n- -10^9 <= a, b <= 10^9\n- -10^9 <= p <= 10^9",
      ],
      code: `struct Line {
    long long m, c;
    long long at(long long x) const { return m * x + c; }
};

const long long NEG = -4000000000000000000LL;

struct LiChaoSeg {
    struct Node { Line ln; int l, r; };
    vector<Node> t;
    long long LO, HI;
    LiChaoSeg(long long lo, long long hi) : LO(lo), HI(hi) {
        t.push_back({{0, NEG}, -1, -1});
    }
    int leftOf(int u) {
        if (t[u].l == -1) { t[u].l = (int)t.size(); t.push_back({{0, NEG}, -1, -1}); }
        return t[u].l;
    }
    int rightOf(int u) {
        if (t[u].r == -1) { t[u].r = (int)t.size(); t.push_back({{0, NEG}, -1, -1}); }
        return t[u].r;
    }
    // ordinary Li Chao insert, but confined to the subtree of u
    void insertAll(int u, long long lo, long long hi, Line nw) {
        long long mid = lo + (hi - lo) / 2;
        bool bLo = nw.at(lo) > t[u].ln.at(lo);
        bool bMid = nw.at(mid) > t[u].ln.at(mid);
        if (bMid) swap(t[u].ln, nw);
        if (lo == hi) return;
        if (bLo != bMid) insertAll(leftOf(u), lo, mid, nw);
        else insertAll(rightOf(u), mid + 1, hi, nw);
    }
    void addSegment(int u, long long lo, long long hi, long long l, long long r, Line nw) {
        if (r < lo || hi < l) return;
        if (l <= lo && hi <= r) { insertAll(u, lo, hi, nw); return; }   // canonical node
        long long mid = lo + (hi - lo) / 2;
        if (l <= mid) addSegment(leftOf(u), lo, mid, l, r, nw);
        if (r > mid) addSegment(rightOf(u), mid + 1, hi, l, r, nw);
    }
    void addSegment(long long l, long long r, Line nw) { addSegment(0, LO, HI, l, r, nw); }
    long long query(long long x) const {
        long long lo = LO, hi = HI, res = NEG;
        int u = 0;
        while (u != -1) {
            res = max(res, t[u].ln.at(x));
            if (lo == hi) break;
            long long mid = lo + (hi - lo) / 2;
            if (x <= mid) { u = t[u].l; hi = mid; }
            else { u = t[u].r; lo = mid + 1; }
        }
        return res;
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    LiChaoSeg tree(-1000000000LL, 1000000000LL);
    for (int i = 0; i < n; i++) {
        long long l, r, a, b;
        cin >> l >> r >> a >> b;
        tree.addSegment(l, r - 1, {-a, -b});      // half-open [l, r) becomes closed [l, r-1]
    }
    while (q--) {
        int type;
        cin >> type;
        if (type == 0) {
            long long l, r, a, b;
            cin >> l >> r >> a >> b;
            tree.addSegment(l, r - 1, {-a, -b});
        } else {
            long long p;
            cin >> p;
            long long res = tree.query(p);
            if (res == NEG) cout << "INFINITY" << "\\n";
            else cout << -res << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "A restricted line cannot simply be inserted at the root, because the plain insert would let it win at points outside its interval. Instead decompose [l, r] into the O(log C) canonical segment-tree nodes that exactly tile it, and run a normal Li Chao insert inside each of those subtrees.",
        "That decomposition preserves the invariant the query relies on: every line stored anywhere in the subtree of a node v is valid on the whole range of v, since it entered at some ancestor-or-self canonical node whose range contains v's range. So within each node the ordinary two-lines-cross-once argument still holds, and a root-to-leaf walk collecting maxima is still correct - it visits every canonical node that could own a line covering x.",
        "The sentinel doubles as the emptiness test: if the walk never beats NEG then no segment covers x and the answer is INFINITY. Comparing against a hand-rolled INF constant instead is the usual bug, since a genuine line can legitimately evaluate to a very negative number.",
        "Cost rises from O(log C) to O(log^2 C) per insertion - one factor for the decomposition, one for the Li Chao descent inside each piece. Note the half-open input interval [l, r) must be converted to the closed [l, r-1] the structure works with; the guarantee l < r makes that non-empty.",
        "Time: O(N log^2 C + Q log^2 C). Space: O((N + Q) log^2 C).",
      ],
    },
    {
      name: "Escape Through Leaf",
      difficulty: "Hard",
      variation: "Merging Li Chao trees over subtrees",
      link: "https://codeforces.com/problemset/problem/932/F",
      question: [
        "You are given a tree of n nodes rooted at node 1. Node i has two integers a_i and b_i. From node i you may jump to any node j in the subtree of i other than i itself, at a cost of a_i * b_j. Starting at node 1, print the minimum total cost of reaching any leaf. A leaf is a node with no children.",
        "Example 1:\nInput:\n4\n1 2 3 4\n1 1 5 3\n1 2\n2 3\n2 4\nOutput: 3\nExplanation: Node 4 is a leaf in the subtree of node 1, so jumping straight from 1 to 4 costs a_1 * b_4 = 1 * 3 = 3. Going 1 -> 2 -> 4 costs 1 * 1 + 2 * 3 = 7.",
        "Example 2:\nInput:\n3\n1 2 3\n4 5 6\n1 2\n1 3\nOutput: 5\nExplanation: Both children are leaves; jumping to node 2 costs 1 * 5 = 5 and to node 3 costs 1 * 6 = 6.",
        "Constraints:\n- 2 <= n <= 10^5\n- -10^5 <= a_i, b_i <= 10^5\n- The n - 1 following lines describe the edges of a tree",
      ],
      code: `struct Line {
    long long m, c;
    long long at(long long x) const { return m * x + c; }
};

const long long NEG = -4000000000000000000LL;
const long long XLO = -100000, XHI = 100000;      // the range of the query points a_i

struct LiChaoMerge {
    struct Node { Line ln; int l, r; };
    vector<Node> t;
    int make() { t.push_back({{0, NEG}, -1, -1}); return (int)t.size() - 1; }
    int insert(int u, long long lo, long long hi, Line nw) {
        if (u == -1) u = make();
        long long mid = lo + (hi - lo) / 2;
        bool bLo = nw.at(lo) > t[u].ln.at(lo);
        bool bMid = nw.at(mid) > t[u].ln.at(mid);
        if (bMid) swap(t[u].ln, nw);
        if (lo == hi) return u;
        if (bLo != bMid) t[u].l = insert(t[u].l, lo, mid, nw);
        else t[u].r = insert(t[u].r, mid + 1, hi, nw);
        return u;
    }
    // fuse two trees over the same coordinate range
    int merge(int u, int v, long long lo, long long hi) {
        if (u == -1) return v;
        if (v == -1) return u;
        long long mid = lo + (hi - lo) / 2;
        Line lv = t[v].ln;
        t[u].l = merge(t[u].l, t[v].l, lo, mid);
        t[u].r = merge(t[u].r, t[v].r, mid + 1, hi);
        return insert(u, lo, hi, lv);              // re-insert v's own line into u
    }
    long long query(int u, long long x) const {
        long long lo = XLO, hi = XHI, res = NEG;
        while (u != -1) {
            res = max(res, t[u].ln.at(x));
            if (lo == hi) break;
            long long mid = lo + (hi - lo) / 2;
            if (x <= mid) { u = t[u].l; hi = mid; }
            else { u = t[u].r; lo = mid + 1; }
        }
        return res;
    }
};

int n;
vector<long long> a, b, dp;
vector<vector<int>> g;
LiChaoMerge tr;

int dfs(int v, int p) {
    int root = -1;
    bool leaf = true;
    for (int to : g[v]) {
        if (to == p) continue;
        leaf = false;
        root = tr.merge(root, dfs(to, v), XLO, XHI);
    }
    dp[v] = leaf ? 0 : -tr.query(root, a[v]);      // cheapest jump into the merged subtree
    return tr.insert(root, XLO, XHI, {-b[v], -dp[v]});
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n;
    a.assign(n + 1, 0);
    b.assign(n + 1, 0);
    dp.assign(n + 1, 0);
    g.assign(n + 1, {});
    for (int i = 1; i <= n; i++) cin >> a[i];
    for (int i = 1; i <= n; i++) cin >> b[i];
    for (int i = 0; i < n - 1; i++) {
        int u, v;
        cin >> u >> v;
        g[u].push_back(v);
        g[v].push_back(u);
    }
    dfs(1, 0);
    cout << dp[1] << "\\n";
    return 0;
}`,
      explanation: [
        "dp[v] is the cheapest cost from v down to some leaf, with dp = 0 at a leaf. For an internal node, dp[v] = min over j in the subtree of v, j != v, of (dp[j] + a_v * b_j). Each candidate j is a line of slope b_j and intercept dp[j], and the query point is a_v - so the recurrence is again min over lines, negated into the tree's max form.",
        "What is new is the scope: the line set is not a growing prefix but exactly the subtree of v. Every node therefore returns a structure holding the lines of its whole subtree, a parent fuses its children's structures, queries at a_v, and finally inserts its own line before handing the result up. Building each set from scratch would be O(n^2).",
        "Two Li Chao trees over the same range are fused by recursing on both in lockstep: keep one node, recurse on the matching children, and reinsert the other node's line into the surviving subtree. The reinsertion is what preserves the invariant - a line that was optimal somewhere in v's range must be re-raced against the lines already there. The amortised cost is O(log^2) per node, because every fusion step consumes a node that then no longer exists as a separate tree.",
        "Small-to-large copying is the tempting alternative: reinsert all lines of the smaller child into the larger. That is O(n log^2 n) too, but only if you compare subtree line counts rather than subtree sizes, and it is easy to get wrong; merging in place avoids the bookkeeping. Also note a_i and b_i may be negative, so nothing here is monotone and no hull-based structure applies.",
        "Time: O(n log^2 V) where V is the coordinate range. Space: O(n log V).",
      ],
    },
  ],
};
