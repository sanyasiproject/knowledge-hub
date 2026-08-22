import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Range Updates and Sums",
      difficulty: "Medium",
      variation: "Composable lazy baseline (what beats replaces)",
      link: "https://cses.fi/problemset/task/1735",
      question: [
        "You are given an array of n integers and q operations of three kinds. Operation '1 a b x' increases every value in positions a..b by x. Operation '2 a b x' assigns the value x to every position in a..b. Operation '3 a b' asks for the sum of values in positions a..b. Print the answer to every sum query.",
        "This is the strongest thing plain lazy propagation can do, and it is worth solving first: assignment and addition compose into a single tag, which is exactly the property that range chmin and chmax lack.",
        "Example 1:\nInput:\n5 5\n1 2 3 4 5\n3 1 5\n2 2 4 3\n3 2 4\n1 1 3 2\n3 1 5\nOutput:\n15\n9\n21\nExplanation: The initial sum is 15. After assigning 3 to positions 2..4 the array is [1,3,3,3,5], so the sum of 2..4 is 9. Adding 2 to positions 1..3 gives [3,5,5,3,5], whose total is 21.",
        "Constraints:\n- 1 <= n, q <= 2 * 10^5\n- 1 <= x <= 10^9 and array values fit in 32 bits, but sums need 64 bits",
      ],
      code: `int n;
vector<long long> sm, addLz, asgLz;
vector<int> ln;
vector<long long> a;

void pull(int p) { sm[p] = sm[p << 1] + sm[p << 1 | 1]; }

void doAsg(int p, long long v) {
    sm[p] = v * ln[p];
    asgLz[p] = v;
    addLz[p] = 0;              // an assignment wipes out any pending add
}

void doAdd(int p, long long v) {
    sm[p] += v * ln[p];
    addLz[p] += v;
}

void push(int p) {
    for (int c = p << 1; c <= (p << 1 | 1); c++) {
        if (asgLz[p] != -1) doAsg(c, asgLz[p]);   // assignment happened first
        if (addLz[p]) doAdd(c, addLz[p]);         // then the adds on top of it
    }
    asgLz[p] = -1;
    addLz[p] = 0;
}

void build(int p, int l, int r) {
    ln[p] = r - l + 1;
    asgLz[p] = -1;
    addLz[p] = 0;
    if (l == r) { sm[p] = a[l]; return; }
    int m = (l + r) >> 1;
    build(p << 1, l, m);
    build(p << 1 | 1, m + 1, r);
    pull(p);
}

void rangeAdd(int p, int l, int r, int ql, int qr, long long v) {
    if (qr < l || r < ql) return;
    if (ql <= l && r <= qr) { doAdd(p, v); return; }
    push(p);
    int m = (l + r) >> 1;
    rangeAdd(p << 1, l, m, ql, qr, v);
    rangeAdd(p << 1 | 1, m + 1, r, ql, qr, v);
    pull(p);
}

void rangeAsg(int p, int l, int r, int ql, int qr, long long v) {
    if (qr < l || r < ql) return;
    if (ql <= l && r <= qr) { doAsg(p, v); return; }
    push(p);
    int m = (l + r) >> 1;
    rangeAsg(p << 1, l, m, ql, qr, v);
    rangeAsg(p << 1 | 1, m + 1, r, ql, qr, v);
    pull(p);
}

long long query(int p, int l, int r, int ql, int qr) {
    if (qr < l || r < ql) return 0;
    if (ql <= l && r <= qr) return sm[p];
    push(p);
    int m = (l + r) >> 1;
    return query(p << 1, l, m, ql, qr) + query(p << 1 | 1, m + 1, r, ql, qr);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int q;
    cin >> n >> q;
    a.assign(n + 1, 0);
    for (int i = 1; i <= n; i++) cin >> a[i];
    int sz = 4 * (n + 1);
    sm.assign(sz, 0);
    addLz.assign(sz, 0);
    asgLz.assign(sz, -1);
    ln.assign(sz, 0);
    build(1, 1, n);
    while (q--) {
        int t, l, r;
        cin >> t >> l >> r;
        if (t == 1) { long long x; cin >> x; rangeAdd(1, 1, n, l, r, x); }
        else if (t == 2) { long long x; cin >> x; rangeAsg(1, 1, n, l, r, x); }
        else cout << query(1, 1, n, l, r) << "\\n";
    }
    return 0;
}`,
      explanation: [
        "The node state is just the subtree sum plus a lazy tag. The tag has to describe a function that any sequence of pending updates collapses into, and here it does: any mix of assigns and adds is equivalent to 'assign v, then add d'. So the pair (asgLz, addLz) is a complete tag, and a new assign simply resets addLz to zero.",
        "That collapsing property is the whole reason lazy propagation works, and the reason it stops working for the next nine problems. Range chmin does not collapse: 'chmin with 5, then chmin with 3' is fine, but a chmin interleaved with an add and applied to a node holding several distinct values cannot be summarised by any constant, because different elements are clipped by different amounts. The sum of the node is not a function of the tag alone.",
        "The tempting bug here is pushing the two tags in the wrong order, or forgetting that doAsg must clear addLz. Using -1 as the 'no assignment' sentinel is only safe because the problem guarantees positive values; with arbitrary values use a separate boolean flag.",
        "Time: O((n + q) log n). Space: O(n).",
      ],
    },
    {
      name: "Gorgeous Sequence",
      difficulty: "Medium",
      variation: "The beats template: range chmin, range max, range sum",
      question: [
        "You are given a sequence a of n integers and m operations of three kinds. '0 x y t' replaces a[i] with min(a[i], t) for every i in x..y. '1 x y' asks for the maximum value in x..y. '2 x y' asks for the sum of x..y. Print the answer to every query. The input begins with the number of test cases.",
        "This is the original Segment Tree Beats problem and the template every later variation extends.",
        "Example 1:\nInput:\n1\n5 3\n1 2 3 4 5\n0 1 3 2\n1 1 5\n2 1 5\nOutput:\n5\n14\nExplanation: Clipping positions 1..3 at 2 turns the array into [1,2,2,4,5]. The maximum over the whole array is 5 and the total is 1 + 2 + 2 + 4 + 5 = 14.",
        "Constraints:\n- 1 <= n, m <= 10^6 over all test cases\n- 0 <= a[i], t <= 2^31 - 1, so sums need 64 bits",
      ],
      code: `const int NEG = -1;

int n;
vector<long long> sm;
vector<int> mx, se, cnt;    // max, strict second max, how many elements equal max

void pull(int p) {
    int l = p << 1, r = l | 1;
    sm[p] = sm[l] + sm[r];
    if (mx[l] == mx[r]) { mx[p] = mx[l]; cnt[p] = cnt[l] + cnt[r]; se[p] = max(se[l], se[r]); }
    else if (mx[l] > mx[r]) { mx[p] = mx[l]; cnt[p] = cnt[l]; se[p] = max(se[l], mx[r]); }
    else { mx[p] = mx[r]; cnt[p] = cnt[r]; se[p] = max(mx[l], se[r]); }
}

// Precondition: se[p] < x < mx[p]. Only the maximal elements move, all to x.
void doChmin(int p, int x) {
    if (x >= mx[p]) return;
    sm[p] -= (long long)(mx[p] - x) * cnt[p];
    mx[p] = x;
}

// The node's own max doubles as the pending chmin tag for its children.
void push(int p) { doChmin(p << 1, mx[p]); doChmin(p << 1 | 1, mx[p]); }

void build(int p, int l, int r, vector<int>& a) {
    if (l == r) { sm[p] = mx[p] = a[l]; se[p] = NEG; cnt[p] = 1; return; }
    int m = (l + r) >> 1;
    build(p << 1, l, m, a);
    build(p << 1 | 1, m + 1, r, a);
    pull(p);
}

void upd(int p, int l, int r, int ql, int qr, int x) {
    if (qr < l || r < ql || mx[p] <= x) return;          // nothing to clip: prune
    if (ql <= l && r <= qr && se[p] < x) { doChmin(p, x); return; }   // tag fits: stop
    push(p);
    int m = (l + r) >> 1;
    upd(p << 1, l, m, ql, qr, x);
    upd(p << 1 | 1, m + 1, r, ql, qr, x);
    pull(p);
}

int qMax(int p, int l, int r, int ql, int qr) {
    if (qr < l || r < ql) return NEG;
    if (ql <= l && r <= qr) return mx[p];
    push(p);
    int m = (l + r) >> 1;
    return max(qMax(p << 1, l, m, ql, qr), qMax(p << 1 | 1, m + 1, r, ql, qr));
}

long long qSum(int p, int l, int r, int ql, int qr) {
    if (qr < l || r < ql) return 0;
    if (ql <= l && r <= qr) return sm[p];
    push(p);
    int m = (l + r) >> 1;
    return qSum(p << 1, l, m, ql, qr) + qSum(p << 1 | 1, m + 1, r, ql, qr);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int T;
    if (!(cin >> T)) return 0;
    while (T--) {
        int m;
        cin >> n >> m;
        vector<int> a(n + 1);
        for (int i = 1; i <= n; i++) cin >> a[i];
        int sz = 4 * (n + 1);
        sm.assign(sz, 0); mx.assign(sz, 0); se.assign(sz, 0); cnt.assign(sz, 0);
        build(1, 1, n, a);
        while (m--) {
            int op, x, y;
            cin >> op >> x >> y;
            if (op == 0) { int t; cin >> t; upd(1, 1, n, x, y, t); }
            else if (op == 1) cout << qMax(1, 1, n, x, y) << "\\n";
            else cout << qSum(1, 1, n, x, y) << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "The node state is (sum, max, strict second max, count of maxima). The insight is that a chmin with x only ever touches elements strictly greater than x, so if x lies in the window (se, mx) then exactly the cnt maximal elements change, all of them to x, and the sum drops by (mx - x) * cnt. That single case is a genuine O(1) tag; nothing else in the node moves.",
        "The recursion therefore has three outcomes per node: x >= mx means nothing changes and we prune; se < x < mx means we apply the O(1) tag and stop; x <= se means the clip splits the node's values and we must recurse. Only the third case costs work, which is what makes the structure fast rather than quadratic.",
        "Why it is fast: define the potential of a node as the number of distinct values in its subtree. A recursion into the third case is only triggered when a node has at least two values above x, and it merges the top two of them into one, permanently reducing that potential. The total potential starts at O(n log n) and each unit is destroyed at most once, so the amortised cost for chmin-only workloads is O((n + m) log n).",
        "The wrong-but-tempting approach is a plain lazy 'pending minimum' tag. That is correct for a max query but silently wrong for the sum, because a single clip value cannot say how much the sum decreased without knowing how many elements exceeded it. The second max is exactly the missing information. Note also that se must be a strict second max: if it were 'second largest with multiplicity' the tag condition se < x would fire on nodes holding two equal maxima and the count bookkeeping would break.",
        "Time: O((n + m) log n) amortised. Space: O(n).",
      ],
    },
    {
      name: "Falling Squares",
      difficulty: "Medium",
      variation: "Range chmax with a max query only (lazy suffices)",
      link: "https://leetcode.com/problems/falling-squares/",
      question: [
        "There are several squares being dropped onto the X axis. You are given positions where positions[i] = [left, sideLength] describes the i-th square, whose left edge is at x = left and whose side length is sideLength. Each square is dropped one at a time and lands on top of the tallest stack it overlaps horizontally, or on the axis itself. Two squares touching only at a single x coordinate do not overlap. Return an array ans where ans[i] is the height of the tallest stack after the i-th square has landed.",
        "Example 1:\nInput: positions = [[1,2],[2,3],[6,1]]\nOutput: [2,5,5]\nExplanation: The first square covers [1,3) and reaches height 2. The second covers [2,5), overlaps the first, and reaches 2 + 3 = 5. The third covers [6,7), overlaps nothing, and reaches 1, so the tallest stack is still 5.",
        "Example 2:\nInput: positions = [[100,100],[200,100]]\nOutput: [100,100]\nExplanation: The intervals [100,200) and [200,300) touch at a point only, so the second square lands on the axis.",
        "Constraints:\n- 1 <= positions.length <= 1000\n- 1 <= left, sideLength <= 10^8",
      ],
      code: `struct Seg {
    int n;
    vector<int> mx, lz;
    Seg(int n) : n(n), mx(4 * n + 4, 0), lz(4 * n + 4, 0) {}

    void doChmax(int p, int v) { mx[p] = max(mx[p], v); lz[p] = max(lz[p], v); }
    void push(int p) { if (lz[p]) { doChmax(p << 1, lz[p]); doChmax(p << 1 | 1, lz[p]); lz[p] = 0; } }

    void upd(int p, int l, int r, int ql, int qr, int v) {
        if (qr < l || r < ql || ql > qr) return;
        if (ql <= l && r <= qr) { doChmax(p, v); return; }
        push(p);
        int m = (l + r) >> 1;
        upd(p << 1, l, m, ql, qr, v);
        upd(p << 1 | 1, m + 1, r, ql, qr, v);
        mx[p] = max(mx[p << 1], mx[p << 1 | 1]);
    }

    int qry(int p, int l, int r, int ql, int qr) {
        if (qr < l || r < ql || ql > qr) return 0;
        if (ql <= l && r <= qr) return mx[p];
        push(p);
        int m = (l + r) >> 1;
        return max(qry(p << 1, l, m, ql, qr), qry(p << 1 | 1, m + 1, r, ql, qr));
    }
};

vector<int> fallingSquares(vector<vector<int>>& positions) {
    vector<int> xs;
    for (auto& p : positions) { xs.push_back(p[0]); xs.push_back(p[0] + p[1]); }
    sort(xs.begin(), xs.end());
    xs.erase(unique(xs.begin(), xs.end()), xs.end());
    int m = xs.size();
    Seg seg(m);
    vector<int> res;
    int best = 0;
    for (auto& p : positions) {
        int l = lower_bound(xs.begin(), xs.end(), p[0]) - xs.begin();
        // half-open interval: the cell that starts at left + side is NOT covered
        int r = lower_bound(xs.begin(), xs.end(), p[0] + p[1]) - xs.begin() - 1;
        int base = seg.qry(1, 0, m - 1, l, r);
        int h = base + p[1];
        seg.upd(1, 0, m - 1, l, r, h);
        best = max(best, h);
        res.push_back(best);
    }
    return res;
}`,
      explanation: [
        "Coordinates go up to 10^8 but only 2000 of them matter, so compress the set of all left and right edges and treat each gap between consecutive coordinates as one cell. A square covering [left, left + side) covers the compressed cells from index(left) up to index(left + side) - 1, and that minus one is what encodes the 'touching at a point does not overlap' rule.",
        "Landing a square is: read the maximum height under its footprint, add its side, then raise every cell in the footprint to that height. Because the new height strictly exceeds every old height in the footprint, the raise is simultaneously an assignment and a chmax - which is why plain lazy propagation is enough here and no beats machinery is needed.",
        "The reason it is enough is that the only query is a max. A chmax tag composes as max of tags, and the node maximum after a chmax with v is simply max(mx, v), independent of how the values inside were distributed. The moment the problem also asked for the sum of the range, that would collapse and you would need the min, strict second min and count-of-minima of Segment Tree Beats.",
        "The answer must be a running prefix maximum, not the height of the current square: a small square dropped later does not lower the skyline.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "SUM and REPLACE",
      difficulty: "Medium",
      variation: "Amortised 'break on condition' updates (value shrinking)",
      link: "https://codeforces.com/problemset/problem/920/F",
      question: [
        "Let d(x) be the number of divisors of x. You are given an array a of n integers and m queries of two kinds. '1 l r' asks for the sum of a[l..r]. '2 l r' replaces a[i] with d(a[i]) for every i in l..r. Print the answer to every sum query.",
        "Example 1:\nInput:\n5 5\n6 4 1 10 3\n1 1 5\n2 1 5\n1 1 5\n2 1 5\n1 1 5\nOutput:\n24\n14\n11\nExplanation: The initial total is 6 + 4 + 1 + 10 + 3 = 24. After one replace the array is [4,3,1,4,2] because d(6) = 4, d(4) = 3, d(1) = 1, d(10) = 4, d(3) = 2, summing to 14. A second replace gives [3,2,1,3,2], summing to 11.",
        "Constraints:\n- 1 <= n, m <= 3 * 10^5\n- 1 <= a[i] <= 10^6\n- Sums can reach 3 * 10^11, so use 64-bit accumulators",
      ],
      code: `const int MAXV = 1000001;

int n;
vector<int> d, mx, a;
vector<long long> sm;

void pull(int p) { sm[p] = sm[p << 1] + sm[p << 1 | 1]; mx[p] = max(mx[p << 1], mx[p << 1 | 1]); }

void build(int p, int l, int r) {
    if (l == r) { sm[p] = mx[p] = a[l]; return; }
    int m = (l + r) >> 1;
    build(p << 1, l, m);
    build(p << 1 | 1, m + 1, r);
    pull(p);
}

void divStep(int p, int l, int r, int ql, int qr) {
    if (qr < l || r < ql || mx[p] <= 2) return;   // d(1) = 1 and d(2) = 2 are fixed points
    if (l == r) { sm[p] = mx[p] = d[mx[p]]; return; }
    int m = (l + r) >> 1;
    divStep(p << 1, l, m, ql, qr);
    divStep(p << 1 | 1, m + 1, r, ql, qr);
    pull(p);
}

long long query(int p, int l, int r, int ql, int qr) {
    if (qr < l || r < ql) return 0;
    if (ql <= l && r <= qr) return sm[p];
    int m = (l + r) >> 1;
    return query(p << 1, l, m, ql, qr) + query(p << 1 | 1, m + 1, r, ql, qr);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int m;
    cin >> n >> m;
    d.assign(MAXV, 0);
    for (int i = 1; i < MAXV; i++)
        for (int j = i; j < MAXV; j += i) d[j]++;   // harmonic sieve of divisor counts
    a.assign(n + 1, 0);
    for (int i = 1; i <= n; i++) cin >> a[i];
    sm.assign(4 * (n + 1), 0);
    mx.assign(4 * (n + 1), 0);
    build(1, 1, n);
    while (m--) {
        int t, l, r;
        cin >> t >> l >> r;
        if (t == 1) cout << query(1, 1, n, l, r) << "\\n";
        else divStep(1, 1, n, l, r);
    }
    return 0;
}`,
      explanation: [
        "There is no lazy tag for 'apply d to everything' - d is not linear and does not compose. The beats answer is to descend to individual leaves and rely on a pruning predicate strong enough to bound the total number of descents.",
        "Here the predicate is mx <= 2. Since d(1) = 1 and d(2) = 2, any element that has reached 1 or 2 is frozen forever, so a subtree whose maximum is at most 2 can be skipped outright. Every other element strictly decreases under d as long as it is above 2 (for x >= 3, d(x) < x), and it takes only a handful of steps to fall from 10^6 to 2.",
        "That gives the amortisation: each of the n elements is individually rewritten O(log log MAXV) times - about six for values up to 10^6 - and each rewrite costs O(log n) to reach its leaf and repair the path. Everything else is pruned at O(log n) per query.",
        "This is the same accounting as the chmin template: the update has no constant-size tag, so instead you bound how many times any single element can actually change and let a monotone node summary cut off all the rest. The trap is omitting the prune, which turns each replace into a full O(range) walk and times out immediately.",
        "Time: O(MAXV log MAXV) for the sieve plus O((n log log MAXV + m) log n). Space: O(MAXV + n).",
      ],
    },
    {
      name: "The Child and Sequence",
      difficulty: "Medium",
      variation: "Range modulo, pruned by the subtree maximum",
      link: "https://codeforces.com/problemset/problem/438/D",
      question: [
        "You are given a sequence a of n integers and m operations of three kinds. '1 l r' asks for the sum of a[l..r]. '2 l r x' replaces a[i] with a[i] mod x for every i in l..r. '3 k x' assigns a[k] = x. Print the answer to every sum query.",
        "Example 1:\nInput:\n5 5\n1 2 3 4 5\n2 3 5 4\n3 3 5\n1 2 5\n2 1 3 3\n1 1 3\nOutput:\n8\n5\nExplanation: Taking positions 3..5 modulo 4 gives [1,2,3,0,1]. Setting a[3] = 5 gives [1,2,5,0,1], whose sum over 2..5 is 2 + 5 + 0 + 1 = 8. Taking positions 1..3 modulo 3 gives [1,2,2,0,1], whose sum over 1..3 is 5.",
        "Constraints:\n- 1 <= n, m <= 10^5\n- 1 <= a[i], x <= 10^9",
      ],
      code: `int n;
vector<long long> sm, mx, a;

void pull(int p) { sm[p] = sm[p << 1] + sm[p << 1 | 1]; mx[p] = max(mx[p << 1], mx[p << 1 | 1]); }

void build(int p, int l, int r) {
    if (l == r) { sm[p] = mx[p] = a[l]; return; }
    int m = (l + r) >> 1;
    build(p << 1, l, m);
    build(p << 1 | 1, m + 1, r);
    pull(p);
}

void modAll(int p, int l, int r, int ql, int qr, long long x) {
    if (qr < l || r < ql || mx[p] < x) return;   // every value already below x: mod is a no-op
    if (l == r) { sm[p] %= x; mx[p] = sm[p]; return; }
    int m = (l + r) >> 1;
    modAll(p << 1, l, m, ql, qr, x);
    modAll(p << 1 | 1, m + 1, r, ql, qr, x);
    pull(p);
}

void setPos(int p, int l, int r, int pos, long long x) {
    if (l == r) { sm[p] = mx[p] = x; return; }
    int m = (l + r) >> 1;
    if (pos <= m) setPos(p << 1, l, m, pos, x);
    else setPos(p << 1 | 1, m + 1, r, pos, x);
    pull(p);
}

long long query(int p, int l, int r, int ql, int qr) {
    if (qr < l || r < ql) return 0;
    if (ql <= l && r <= qr) return sm[p];
    int m = (l + r) >> 1;
    return query(p << 1, l, m, ql, qr) + query(p << 1 | 1, m + 1, r, ql, qr);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int m;
    cin >> n >> m;
    a.assign(n + 1, 0);
    for (int i = 1; i <= n; i++) cin >> a[i];
    sm.assign(4 * (n + 1), 0);
    mx.assign(4 * (n + 1), 0);
    build(1, 1, n);
    while (m--) {
        int t;
        cin >> t;
        if (t == 1) { int l, r; cin >> l >> r; cout << query(1, 1, n, l, r) << "\\n"; }
        else if (t == 2) { int l, r; long long x; cin >> l >> r >> x; modAll(1, 1, n, l, r, x); }
        else { int k; long long x; cin >> k >> x; setPos(1, 1, n, k, x); }
    }
    return 0;
}`,
      explanation: [
        "Range modulo has no composable tag either, so again the structure descends to leaves and leans on a prune: if the subtree maximum is already smaller than x then a[i] mod x = a[i] for every element there, and the whole subtree can be skipped.",
        "The amortisation is the halving argument. If a[i] >= x then a[i] mod x < x <= a[i], and more sharply a[i] mod x <= a[i] / 2 whenever the modulo actually changes the value: either x <= a[i] / 2, in which case the remainder is below x, or x > a[i] / 2, in which case the remainder is a[i] - x < a[i] / 2. So every real rewrite at least halves the element, giving each element at most log(10^9) = 30 rewrites.",
        "Operation 3 is what makes this more than a one-way street: a point assignment can push a value back up to 10^9 and buy it another 30 rewrites. Each of the m assignments adds only O(log A) to the budget, so the total stays O((n + m) log A) leaf visits.",
        "The trap is pruning with the subtree sum instead of the maximum. A subtree can have a small maximum and a huge sum, or the reverse, and only the maximum certifies that no individual element is affected.",
        "Time: O((n + m) log A log n) worst case, where A is the largest value. Space: O(n).",
      ],
    },
    {
      name: "Naive Operations",
      difficulty: "Hard",
      variation: "Amortised counters: minimum deficit as the trigger",
      question: [
        "You are given an array b that is a permutation of 1..n, and an array a of n zeros. Process q operations. 'add l r' increases a[i] by 1 for every i in l..r. 'query l r' asks for the sum of floor(a[i] / b[i]) over i in l..r. Print the answer to every query. Input consists of several test cases until end of file.",
        "Example 1:\nInput:\n5 5\n1 2 3 4 5\nadd 1 5\nquery 1 5\nadd 1 5\nquery 1 5\nquery 2 3\nOutput:\n1\n3\n1\nExplanation: After one add, a = [1,1,1,1,1] and the quotients are 1,0,0,0,0 so the sum is 1. After the second add, a = [2,2,2,2,2] and the quotients are 2,1,0,0,0 giving 3; over positions 2..3 only that gives 1 + 0 = 1.",
        "Constraints:\n- 1 <= n, q <= 10^5 per test case\n- b is a permutation of 1..n, so every b[i] >= 1",
      ],
      code: `int n;
vector<int> rem, lz, b;
vector<long long> ans;

void pull(int p) {
    rem[p] = min(rem[p << 1], rem[p << 1 | 1]);
    ans[p] = ans[p << 1] + ans[p << 1 | 1];
}

void push(int p) {
    if (lz[p]) {
        for (int c = p << 1; c <= (p << 1 | 1); c++) { rem[c] += lz[p]; lz[c] += lz[p]; }
        lz[p] = 0;
    }
}

void build(int p, int l, int r) {
    lz[p] = 0;
    ans[p] = 0;
    if (l == r) { rem[p] = b[l]; return; }   // b[i] more adds until the quotient rises
    int m = (l + r) >> 1;
    build(p << 1, l, m);
    build(p << 1 | 1, m + 1, r);
    pull(p);
}

void add(int p, int l, int r, int ql, int qr) {
    if (qr < l || r < ql) return;
    if (ql <= l && r <= qr && rem[p] > 1) { rem[p]--; lz[p]--; return; }   // no counter reaches 0
    if (l == r) { ans[p]++; rem[p] = b[l]; return; }                       // counter fired, reset
    push(p);
    int m = (l + r) >> 1;
    add(p << 1, l, m, ql, qr);
    add(p << 1 | 1, m + 1, r, ql, qr);
    pull(p);
}

long long query(int p, int l, int r, int ql, int qr) {
    if (qr < l || r < ql) return 0;
    if (ql <= l && r <= qr) return ans[p];
    push(p);
    int m = (l + r) >> 1;
    return query(p << 1, l, m, ql, qr) + query(p << 1 | 1, m + 1, r, ql, qr);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int q;
    while (cin >> n >> q) {
        b.assign(n + 1, 0);
        for (int i = 1; i <= n; i++) cin >> b[i];
        int sz = 4 * (n + 1);
        rem.assign(sz, 0);
        lz.assign(sz, 0);
        ans.assign(sz, 0);
        build(1, 1, n);
        while (q--) {
            string op;
            int l, r;
            cin >> op >> l >> r;
            if (op == "add") add(1, 1, n, l, r);
            else cout << query(1, 1, n, l, r) << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "Do not store a[i] and divide on the fly - there is no tag for that. Instead store per element the deficit rem[i] = how many more increments are needed before floor(a[i] / b[i]) goes up by one, which starts at b[i], and store the current quotient sum separately. An add is then a range decrement of rem plus a repair of every counter that hit zero.",
        "The node summary that makes it efficient is the minimum deficit. If a fully covered node has min rem > 1 the decrement cannot make any counter reach zero, so the whole subtree is handled with an O(1) lazy tag. Only when min rem == 1 do we walk down, and the walk stops at exactly the leaves whose counters fired, where the quotient is incremented and the deficit reset to b[i].",
        "The cost of those walks is paid for by the quotients themselves. Element i can only fire once every b[i] adds, so over q adds the total number of firings is at most sum over i of q / b[i], and since b is a permutation of 1..n that harmonic sum is O(q log n). Each firing costs O(log n) to reach and repair, giving O(q log^2 n) overall.",
        "This is the same shape as the chmin template with the roles renamed: a monotone extremal summary (min deficit instead of max value) certifies that a whole subtree needs no individual attention, and a potential argument (total firings instead of distinct values) bounds how often the certificate can fail. Note that ans must be 64-bit; the quotient sum can reach about 10^10.",
        "Time: O(q log^2 n) amortised. Space: O(n).",
      ],
    },
    {
      name: "Range Chmin Chmax Add Range Sum",
      difficulty: "Hard",
      variation: "Full Ji Driver tree: chmin, chmax, add and sum together",
      link: "https://judge.yosupo.jp/problem/range_chmin_chmax_add_range_sum",
      question: [
        "You are given an array a of n integers and q queries, each of one of four kinds, all using half-open ranges [l, r). '0 l r b' sets a[i] = min(a[i], b) for i in [l, r). '1 l r b' sets a[i] = max(a[i], b) for i in [l, r). '2 l r b' adds b to every a[i] for i in [l, r). '3 l r' asks for the sum over [l, r). Print the answer to every sum query.",
        "This is the complete Segment Tree Beats, sometimes called the Ji Driver Segment Tree: both clipping directions plus a range add, all coexisting with a range sum.",
        "Example 1:\nInput:\n5 6\n1 5 3 4 2\n3 0 5\n0 0 3 3\n3 0 5\n1 1 4 4\n2 0 5 1\n3 0 5\nOutput:\n15\n13\n20\nExplanation: The initial total is 15. Clipping [0,3) at 3 gives [1,3,3,4,2], total 13. Raising [1,4) to at least 4 gives [1,4,4,4,2], and adding 1 everywhere gives [2,5,5,5,3], total 20.",
        "Constraints:\n- 1 <= n, q <= 2 * 10^5\n- absolute values of a[i] and b are at most 10^9, so sums need 64 bits",
      ],
      code: `typedef long long ll;
const ll INF = (ll)4e18;

int n, q;
vector<ll> sm, mx1, mx2, mn1, mn2, ad;
vector<int> cmx, cmn, ln;

void pull(int p) {
    int l = p << 1, r = l | 1;
    sm[p] = sm[l] + sm[r];
    if (mx1[l] == mx1[r]) { mx1[p] = mx1[l]; cmx[p] = cmx[l] + cmx[r]; mx2[p] = max(mx2[l], mx2[r]); }
    else if (mx1[l] > mx1[r]) { mx1[p] = mx1[l]; cmx[p] = cmx[l]; mx2[p] = max(mx2[l], mx1[r]); }
    else { mx1[p] = mx1[r]; cmx[p] = cmx[r]; mx2[p] = max(mx1[l], mx2[r]); }
    if (mn1[l] == mn1[r]) { mn1[p] = mn1[l]; cmn[p] = cmn[l] + cmn[r]; mn2[p] = min(mn2[l], mn2[r]); }
    else if (mn1[l] < mn1[r]) { mn1[p] = mn1[l]; cmn[p] = cmn[l]; mn2[p] = min(mn2[l], mn1[r]); }
    else { mn1[p] = mn1[r]; cmn[p] = cmn[r]; mn2[p] = min(mn1[l], mn2[r]); }
}

void doAdd(int p, ll v) {
    sm[p] += v * ln[p];
    mx1[p] += v;
    mn1[p] += v;
    ad[p] += v;
    if (mx2[p] != -INF) mx2[p] += v;   // never shift the sentinels
    if (mn2[p] != INF) mn2[p] += v;
}

// Precondition: mx2 < x < mx1. Only the maximal elements move.
void doChmin(int p, ll x) {
    if (x >= mx1[p]) return;
    sm[p] -= (mx1[p] - x) * cmx[p];
    if (mn1[p] == mx1[p]) mn1[p] = x;        // node held a single distinct value
    else if (mn2[p] == mx1[p]) mn2[p] = x;   // the max was also the second smallest
    mx1[p] = x;
}

void doChmax(int p, ll x) {
    if (x <= mn1[p]) return;
    sm[p] += (x - mn1[p]) * cmn[p];
    if (mx1[p] == mn1[p]) mx1[p] = x;
    else if (mx2[p] == mn1[p]) mx2[p] = x;
    mn1[p] = x;
}

// The only explicit tag is the add; mx1 and mn1 act as implicit clip tags.
void push(int p) {
    for (int c = p << 1; c <= (p << 1 | 1); c++) {
        if (ad[p]) doAdd(c, ad[p]);
        doChmin(c, mx1[p]);
        doChmax(c, mn1[p]);
    }
    ad[p] = 0;
}

void build(int p, int l, int r, vector<ll>& a) {
    ln[p] = r - l + 1;
    ad[p] = 0;
    if (l == r) { sm[p] = mx1[p] = mn1[p] = a[l]; mx2[p] = -INF; mn2[p] = INF; cmx[p] = cmn[p] = 1; return; }
    int m = (l + r) >> 1;
    build(p << 1, l, m, a);
    build(p << 1 | 1, m + 1, r, a);
    pull(p);
}

void updChmin(int p, int l, int r, int ql, int qr, ll x) {
    if (qr < l || r < ql || mx1[p] <= x) return;
    if (ql <= l && r <= qr && mx2[p] < x) { doChmin(p, x); return; }
    push(p);
    int m = (l + r) >> 1;
    updChmin(p << 1, l, m, ql, qr, x);
    updChmin(p << 1 | 1, m + 1, r, ql, qr, x);
    pull(p);
}

void updChmax(int p, int l, int r, int ql, int qr, ll x) {
    if (qr < l || r < ql || mn1[p] >= x) return;
    if (ql <= l && r <= qr && mn2[p] > x) { doChmax(p, x); return; }
    push(p);
    int m = (l + r) >> 1;
    updChmax(p << 1, l, m, ql, qr, x);
    updChmax(p << 1 | 1, m + 1, r, ql, qr, x);
    pull(p);
}

void updAdd(int p, int l, int r, int ql, int qr, ll v) {
    if (qr < l || r < ql) return;
    if (ql <= l && r <= qr) { doAdd(p, v); return; }
    push(p);
    int m = (l + r) >> 1;
    updAdd(p << 1, l, m, ql, qr, v);
    updAdd(p << 1 | 1, m + 1, r, ql, qr, v);
    pull(p);
}

ll qSum(int p, int l, int r, int ql, int qr) {
    if (qr < l || r < ql) return 0;
    if (ql <= l && r <= qr) return sm[p];
    push(p);
    int m = (l + r) >> 1;
    return qSum(p << 1, l, m, ql, qr) + qSum(p << 1 | 1, m + 1, r, ql, qr);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n >> q;
    vector<ll> a(n);
    for (auto& x : a) cin >> x;
    int sz = 4 * n;
    sm.assign(sz, 0); mx1.assign(sz, 0); mx2.assign(sz, 0);
    mn1.assign(sz, 0); mn2.assign(sz, 0); ad.assign(sz, 0);
    cmx.assign(sz, 0); cmn.assign(sz, 0); ln.assign(sz, 0);
    build(1, 0, n - 1, a);
    while (q--) {
        int t;
        cin >> t;
        if (t == 3) { int l, r; cin >> l >> r; cout << qSum(1, 0, n - 1, l, r - 1) << "\\n"; }
        else {
            int l, r; ll b;
            cin >> l >> r >> b;
            if (t == 0) updChmin(1, 0, n - 1, l, r - 1, b);
            else if (t == 1) updChmax(1, 0, n - 1, l, r - 1, b);
            else updAdd(1, 0, n - 1, l, r - 1, b);
        }
    }
    return 0;
}`,
      explanation: [
        "The node keeps eight numbers: sum, maximum with its strict runner-up and multiplicity, minimum with its strict runner-up and multiplicity, and a pending add. A chmin with x is O(1) exactly when mx2 < x < mx1, because then only the cmx maximal elements move and the sum falls by (mx1 - x) * cmx; symmetrically for chmax on the minimum side. Any other case forces recursion.",
        "Mixing the two directions is where implementations break. When chmin lowers the maximum, the minimum statistics may also refer to the value being changed: if the node held one distinct value then mn1 == mx1 and must follow, and if the node held exactly two then mn2 == mx1 and must follow. Those two lines in doChmin, and their mirrors in doChmax, are the entire subtlety, and omitting them corrupts the sum only on some inputs, which is why this must be stress-tested against a brute force.",
        "Only the add is stored as an explicit lazy tag. The clips are stored implicitly: a parent's mx1 is already the cap for everything below it, so push applies the add first (chronologically first) and then re-clips each child with the parent's mx1 and mn1. The precondition mx2 < x for those pushed clips holds automatically, because whatever cap the parent absorbed was above its own old second maximum, hence above every child's second maximum.",
        "Complexity comes from a potential argument on the number of distinct values per subtree, which is O(n log n) at the start. A chmin-only workload destroys one unit of potential per forced recursion and runs in O((n + q) log n). Adding range add can raise the potential again - an add applied to part of a node splits values apart - and the standard bound becomes O(q log^2 n). Both chmin and chmax together keep that same O(q log^2 n) bound.",
        "Time: O((n + q) log^2 n) amortised. Space: O(n).",
      ],
    },
    {
      name: "Retroactive Range Chmax",
      difficulty: "Hard",
      variation: "Undoable range chmax with point queries",
      link: "https://atcoder.jp/contests/abc342/tasks/abc342_g",
      question: [
        "You are given a sequence A of length N and Q queries, processed in order. '1 l r x' means a[i] = max(a[i], x) for every i in l..r. '2 i' cancels the i-th query, which is guaranteed to be a type 1 query that has not been cancelled yet - the array is as if that update had never been applied. '3 i' asks for the current value of a[i]. Print the answer to every type 3 query.",
        "Example 1:\nInput:\n5\n1 2 3 1 4\n5\n1 1 3 6\n3 2\n2 1\n3 2\n3 5\nOutput:\n6\n2\n4\nExplanation: The chmax raises positions 1..3 to at least 6, so a[2] reads 6. Cancelling that first query restores the original array, so a[2] reads 2 and a[5] reads 4.",
        "Constraints:\n- 1 <= N, Q <= 2 * 10^5\n- 1 <= A[i], x <= 10^9",
      ],
      code: `int n;
vector<multiset<int>> seg;   // per node: the chmax values currently covering that whole node

void applyOp(int p, int l, int r, int ql, int qr, int x, bool del) {
    if (qr < l || r < ql) return;
    if (ql <= l && r <= qr) {
        if (del) seg[p].erase(seg[p].find(x));   // erase one occurrence, not all of them
        else seg[p].insert(x);
        return;
    }
    int m = (l + r) >> 1;
    applyOp(p << 1, l, m, ql, qr, x, del);
    applyOp(p << 1 | 1, m + 1, r, ql, qr, x, del);
}

int query(int p, int l, int r, int pos) {
    int res = seg[p].empty() ? 0 : *seg[p].rbegin();
    if (l == r) return res;
    int m = (l + r) >> 1;
    if (pos <= m) return max(res, query(p << 1, l, m, pos));
    return max(res, query(p << 1 | 1, m + 1, r, pos));
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n;
    vector<int> a(n + 1);
    for (int i = 1; i <= n; i++) cin >> a[i];
    seg.assign(4 * (n + 1), multiset<int>());
    int q;
    cin >> q;
    vector<array<int,3>> ops(q + 1, {0, 0, 0});   // remember each type 1 so it can be undone
    for (int i = 1; i <= q; i++) {
        int t;
        cin >> t;
        if (t == 1) {
            int l, r, x;
            cin >> l >> r >> x;
            ops[i] = {l, r, x};
            applyOp(1, 1, n, l, r, x, false);
        } else if (t == 2) {
            int j;
            cin >> j;
            applyOp(1, 1, n, ops[j][0], ops[j][1], ops[j][2], true);
        } else {
            int p;
            cin >> p;
            cout << max(a[p], query(1, 1, n, p)) << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "Beats-style tags cannot be undone. Once a chmin or chmax has been folded into a node's sum and extremal statistics, the information about what the values used to be is gone, so an arbitrary retroactive cancellation is impossible with that representation. This problem is the cleanest illustration of that limit.",
        "The fix is to stop collapsing and start remembering. Decompose each range chmax into the O(log n) canonical segment tree nodes it covers and push its value x into a multiset stored at each of those nodes. The current value at position i is then max(A[i], the largest value in any multiset on the root-to-leaf path of i) - because a chmax covering i is recorded at exactly one node on that path.",
        "Cancelling is now trivially symmetric: re-decompose the stored (l, r, x) and erase one copy of x from each of the same O(log n) multisets. A multiset rather than a set is essential, since two different queries can push the same x into the same node; erase by iterator, never by value, or all duplicates would vanish.",
        "This representation gives up on range sums - it only answers point queries - which is precisely the trade. Beats collapses the state to support range aggregates and forbids undo; this keeps the state to support undo and forbids range aggregates.",
        "Time: O((N + Q) log^2 N). Space: O(Q log N).",
      ],
    },
    {
      name: "Greedy Shopping",
      difficulty: "Hard",
      variation: "Prefix chmax on a sorted array plus a descending greedy walk",
      link: "https://codeforces.com/problemset/problem/1439/C",
      question: [
        "You are given an array a of n shop prices that is non-increasing, so a[i] >= a[i+1] for every i. Process q queries of two kinds. '1 x y' sets a[i] = max(a[i], y) for every i in 1..x. '2 x y' simulates a customer who starts at shop x with y money and walks right: at each shop i, if a[i] is at most his remaining money he buys one item and pays a[i], otherwise he skips it; print how many items he buys.",
        "Example 1:\nInput:\n5 3\n5 4 3 2 1\n2 1 6\n1 3 4\n2 2 10\nOutput:\n2\n3\nExplanation: With 6 the customer buys at shop 1 for 5, then cannot afford 4, 3 or 2, and buys at shop 5 for 1, so 2 items. The update makes the array [5,4,4,2,1]. Starting at shop 2 with 10 he buys 4, 4 and 2, so 3 items.",
        "Constraints:\n- 1 <= n, q <= 2 * 10^5\n- 1 <= a[i], y <= 10^9",
      ],
      code: `int n;
vector<long long> sm, mn, asg;
vector<int> ln;

void pull(int p) { sm[p] = sm[p << 1] + sm[p << 1 | 1]; mn[p] = min(mn[p << 1], mn[p << 1 | 1]); }
void doAsg(int p, long long v) { sm[p] = v * ln[p]; mn[p] = v; asg[p] = v; }
void push(int p) { if (asg[p] >= 0) { doAsg(p << 1, asg[p]); doAsg(p << 1 | 1, asg[p]); asg[p] = -1; } }

void build(int p, int l, int r, vector<long long>& a) {
    ln[p] = r - l + 1;
    asg[p] = -1;
    if (l == r) { sm[p] = mn[p] = a[l]; return; }
    int m = (l + r) >> 1;
    build(p << 1, l, m, a);
    build(p << 1 | 1, m + 1, r, a);
    pull(p);
}

void rangeAssign(int p, int l, int r, int ql, int qr, long long v) {
    if (qr < l || r < ql || ql > qr) return;
    if (ql <= l && r <= qr) { doAsg(p, v); return; }
    push(p);
    int m = (l + r) >> 1;
    rangeAssign(p << 1, l, m, ql, qr, v);
    rangeAssign(p << 1 | 1, m + 1, r, ql, qr, v);
    pull(p);
}

// leftmost index in 1..x holding a value strictly below y, or x+1 if there is none
int firstLess(int p, int l, int r, int x, long long y) {
    if (l > x || mn[p] >= y) return x + 1;
    if (l == r) return l;
    push(p);
    int m = (l + r) >> 1;
    int res = firstLess(p << 1, l, m, x, y);
    if (res <= x) return res;
    return firstLess(p << 1 | 1, m + 1, r, x, y);
}

int buy(int p, int l, int r, int ql, long long& y) {
    if (r < ql || mn[p] > y) return 0;                             // nothing here is affordable
    if (ql <= l && sm[p] <= y) { y -= sm[p]; return r - l + 1; }   // he can afford the whole block
    if (l == r) { y -= sm[p]; return 1; }
    push(p);
    int m = (l + r) >> 1;
    int c = buy(p << 1, l, m, ql, y);
    return c + buy(p << 1 | 1, m + 1, r, ql, y);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int q;
    cin >> n >> q;
    vector<long long> a(n + 1);
    for (int i = 1; i <= n; i++) cin >> a[i];
    int sz = 4 * (n + 1);
    sm.assign(sz, 0); mn.assign(sz, 0); asg.assign(sz, -1); ln.assign(sz, 0);
    build(1, 1, n, a);
    while (q--) {
        int t;
        long long x, y;
        cin >> t >> x >> y;
        if (t == 1) {
            int k = firstLess(1, 1, n, (int)x, y);
            if (k <= (int)x) rangeAssign(1, 1, n, k, (int)x, y);   // that suffix is exactly the part below y
        } else {
            long long money = y;
            cout << buy(1, 1, n, (int)x, money) << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "The sortedness is the whole trick. On a non-increasing array the elements strictly below y form a suffix, so a prefix chmax with y is not a beats update at all - it is a plain range assignment to the block [k, x], where k is the first index whose value is below y. Binary searching for k inside the tree using the subtree minimum costs O(log n), and the array stays non-increasing afterwards, so the invariant is self-sustaining.",
        "The customer walk is the interesting query. Descend over the nodes covering [x, n] in left-to-right order with two shortcuts: if a node's minimum exceeds the remaining money, nothing inside it is affordable and the entire node is skipped; if a node is fully inside the range and its whole sum is affordable, every shop in it is bought at once and the money drops by the sum.",
        "Neither shortcut alone would be enough, and together they bound the work. Whenever we are forced to split a node, either we buy something and the remaining money drops by at least the smallest price we could afford, or we skip a whole subtree; the standard accounting is that each purchase-splitting step at least halves the remaining money, so a query touches O(log(max y)) nodes at each of O(log n) levels, giving O(log^2 n) per query.",
        "The tempting wrong approach is simulating the walk shop by shop, which is O(n) per query, or trying to answer it with a prefix-sum binary search - that fails because the customer skips shops he cannot afford rather than stopping at the first one.",
        "Time: O((n + q) log^2 n). Space: O(n).",
      ],
    },
    {
      name: "Increasing Array Queries",
      difficulty: "Hard",
      variation: "Offline prefix-maximum sums (historic-sum beats)",
      link: "https://cses.fi/problemset/task/2416",
      question: [
        "You are given an array of n integers and q queries. Each query gives a range [a, b] and asks for the minimum number of operations needed to make the subarray a[a..b] non-decreasing, where a single operation increases one element by one. Queries are independent: the array itself is never modified.",
        "Example 1:\nInput:\n5 3\n3 2 5 1 7\n1 3\n2 4\n1 5\nOutput:\n1\n4\n5\nExplanation: For [3,2,5] only the 2 must be raised to 3, costing 1. For [2,5,1] the 1 must be raised to 5, costing 4. For the whole array [3,2,5,1,7] the targets are [3,3,5,5,7], costing 1 + 4 = 5.",
        "Constraints:\n- 1 <= n, q <= 2 * 10^5\n- 1 <= a[i] <= 10^9\n- Answers can reach about 2 * 10^14, so use 64-bit arithmetic",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    vector<long long> a(n);
    for (auto& x : a) cin >> x;
    vector<long long> pre(n + 1, 0);
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + a[i];
    const int LOG = 18;
    vector<int> up(n + 1, n);
    vector<long long> val(n + 1, 0);      // val[i] = sum of prefix maxima of a[i..n-1]
    vector<vector<int>> jmp(LOG, vector<int>(n + 1, n));
    stack<int> st;
    for (int i = n - 1; i >= 0; i--) {
        while (!st.empty() && a[st.top()] <= a[i]) st.pop();   // next strictly greater element
        up[i] = st.empty() ? n : st.top();
        val[i] = a[i] * (long long)(up[i] - i) + val[up[i]];
        st.push(i);
    }
    for (int i = 0; i <= n; i++) jmp[0][i] = up[i];
    for (int k = 1; k < LOG; k++)
        for (int i = 0; i <= n; i++) jmp[k][i] = jmp[k - 1][jmp[k - 1][i]];
    while (q--) {
        int l, r;
        cin >> l >> r;
        l--; r--;
        int cur = l;
        for (int k = LOG - 1; k >= 0; k--)
            if (jmp[k][cur] <= r) cur = jmp[k][cur];   // last chain node inside [l, r]
        long long g = val[l] - val[cur] + a[cur] * (long long)(r + 1 - cur);
        cout << g - (pre[r + 1] - pre[l]) << "\\n";
    }
    return 0;
}`,
      explanation: [
        "The cost of a range is forced, not chosen: the cheapest non-decreasing target for a[l..r] is the running prefix maximum, since element i can never be lowered and must be at least every element before it. So the answer is sum over i in [l, r] of (max of a[l..i]) minus sum of a[l..r], and the second term is a prefix sum. The whole problem is computing G(l, r), the sum of prefix maxima.",
        "The canonical Segment Tree Beats solution sweeps r upward while maintaining M(l) = max(a[l..r]) for every l. Each new element is a range chmax on M, and because M is non-increasing in l that chmax hits a contiguous suffix - the same monotone-stack blocks. What is needed on top is a historic sum: after every step, add the whole M array into an accumulator F, so that F(l) = G(l, r). That is the beats variant with a historic-sum tag, and it is genuinely fiddly to compose correctly with the range assign.",
        "The version above computes the same quantity without any of that, by exploiting the structure the sweep discovers. Let up[i] be the next index with a strictly greater value. From l the prefix maximum is a[l] until up[l], then a[up[l]] until up[up[l]], and so on, so val[i] = a[i] * (up[i] - i) + val[up[i]] telescopes into the sum of prefix maxima of the entire suffix. For a query, binary-lift along the up chain to the last chain node cur that is at most r; then G(l, r) = val[l] - val[cur] + a[cur] * (r + 1 - cur), because cur is the position of the leftmost maximum of [l, r] and everything after it stays capped at a[cur].",
        "Two details decide correctness. The stack must pop on a[top] <= a[i] so that up skips equal values - otherwise a run of equal maxima double counts. And the final segment must be truncated at r rather than at up[cur], which is what the a[cur] * (r + 1 - cur) term does.",
        "Time: O((n + q) log n). Space: O(n log n) for the jump table.",
      ],
    },
  ],
};
