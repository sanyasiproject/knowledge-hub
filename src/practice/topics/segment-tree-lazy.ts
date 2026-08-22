import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Range Update Queries",
      difficulty: "Easy",
      variation: "Range add, point query - the lazy template",
      link: "https://cses.fi/problemset/task/1651",
      question: [
        "You are given an array of n integers. Process q operations of two kinds. Operation '1 a b u' increases every value in positions a..b by u. Operation '2 k' asks for the current value at position k. Print the answer to every operation of the second kind, one per line. Positions are 1-indexed.",
        "Example 1:\nInput:\n8 3\n3 2 4 5 1 1 5 3\n2 4\n1 2 5 1\n2 4\nOutput:\n5\n6\nExplanation: The value at position 4 is 5 initially. The range add of 1 over positions 2..5 turns the array into 3 3 5 6 2 1 5 3, so position 4 now reads 6.",
        "Constraints:\n- 1 <= n, q <= 2 * 10^5\n- 1 <= a <= b <= n and 1 <= k <= n\n- 1 <= array values <= 10^9 and 1 <= u <= 10^9",
      ],
      code: `long long tre[800005], lz[800005];
int arr[200005];

void build(int node, int l, int r) {
    lz[node] = 0;
    if (l == r) { tre[node] = arr[l]; return; }
    int mid = (l + r) / 2;
    build(2 * node, l, mid);
    build(2 * node + 1, mid + 1, r);
    tre[node] = tre[2 * node] + tre[2 * node + 1];
}

// Invariant: tre[node] is already correct; lz[node] is owed to the CHILDREN only.
void applyAdd(int node, int l, int r, long long v) {
    tre[node] += v * (r - l + 1);
    lz[node] += v;
}

void push(int node, int l, int r) {
    if (lz[node] == 0) return;
    int mid = (l + r) / 2;
    applyAdd(2 * node, l, mid, lz[node]);
    applyAdd(2 * node + 1, mid + 1, r, lz[node]);
    lz[node] = 0;
}

void update(int node, int l, int r, int ql, int qr, long long v) {
    if (qr < l || r < ql) return;
    if (ql <= l && r <= qr) { applyAdd(node, l, r, v); return; }
    push(node, l, r);                       // only split a node after clearing its debt
    int mid = (l + r) / 2;
    update(2 * node, l, mid, ql, qr, v);
    update(2 * node + 1, mid + 1, r, ql, qr, v);
    tre[node] = tre[2 * node] + tre[2 * node + 1];
}

long long query(int node, int l, int r, int ql, int qr) {
    if (qr < l || r < ql) return 0;
    if (ql <= l && r <= qr) return tre[node];
    push(node, l, r);
    int mid = (l + r) / 2;
    return query(2 * node, l, mid, ql, qr) + query(2 * node + 1, mid + 1, r, ql, qr);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    for (int i = 1; i <= n; i++) cin >> arr[i];
    build(1, 1, n);
    while (q--) {
        int type;
        cin >> type;
        if (type == 1) {
            int a, b;
            long long u;
            cin >> a >> b >> u;
            update(1, 1, n, a, b, u);
        } else {
            int k;
            cin >> k;
            cout << query(1, 1, n, k, k) << "\\n";   // a point query is just [k, k]
        }
    }
    return 0;
}`,
      explanation: [
        "This is the whole idea of lazy propagation in one problem. A range add touches O(log n) canonical nodes that together tile the query range. Instead of walking into those nodes and updating every leaf, each canonical node absorbs the update in O(1): its own aggregate is corrected immediately, and a tag records that the same shift is still owed to everything below it.",
        "Fix one invariant and never break it: tre[node] is always the true aggregate of its segment, and lz[node] is a debt owed only to the two children. That is why applyAdd both bumps tre and accumulates lz, and why the debt is settled by push before any recursion that looks at a child. If you ever descend without pushing, the child returns a stale aggregate and the answer is silently wrong.",
        "Add tags compose by simple summation, so lz[node] += v is enough even when several updates pile up on the same node before anyone pushes. This commutativity is what makes add the easiest lazy tag; assign and affine tags later on need explicit composition rules.",
        "The tempting wrong approach here is a difference array. It does handle range add plus point query in O(1) per update, but only offline - once a query can be interleaved with updates you need a prefix sum after every update, which is O(n). The segment tree keeps both operations logarithmic.",
        "Watch the arithmetic: values reach 10^9 and 2 * 10^5 updates of 10^9 can stack on one position, so both the tree and the tags must be 64-bit.",
        "Time: O((n + q) log n). Space: O(n).",
      ],
    },
    {
      name: "Horrible Queries",
      difficulty: "Medium",
      variation: "Range add, range sum",
      link: "https://www.spoj.com/problems/HORRIBLE/",
      question: [
        "You maintain an array of N elements, all initially zero, and answer C commands. A command '0 p q v' adds v to every element in positions p..q. A command '1 p q' prints the sum of the elements in positions p..q. The first line of input is the number of test cases; each test case starts with N and C. Positions are 1-indexed.",
        "Example 1:\nInput:\n1\n8 6\n0 2 4 26\n0 4 8 80\n0 4 5 20\n1 8 8\n0 5 7 14\n1 4 8\nOutput:\n80\n508\nExplanation: After the three adds the array is 0 26 26 126 100 80 80 80, so the sum over 8..8 is 80. Adding 14 over 5..7 makes it 0 26 26 126 114 94 94 80, and 126 + 114 + 94 + 94 + 80 = 508.",
        "Constraints:\n- 1 <= number of test cases <= 10\n- 1 <= N <= 10^5 and 1 <= C <= 10^5\n- 0 <= v <= 10^7\n- Sums do not fit in 32 bits",
      ],
      code: `vector<long long> tre, lz;

void applyAdd(int node, int l, int r, long long v) {
    tre[node] += v * (r - l + 1);
    lz[node] += v;
}

void push(int node, int l, int r) {
    if (lz[node] == 0) return;
    int mid = (l + r) / 2;
    applyAdd(2 * node, l, mid, lz[node]);
    applyAdd(2 * node + 1, mid + 1, r, lz[node]);
    lz[node] = 0;
}

void update(int node, int l, int r, int ql, int qr, long long v) {
    if (qr < l || r < ql) return;
    if (ql <= l && r <= qr) { applyAdd(node, l, r, v); return; }
    push(node, l, r);
    int mid = (l + r) / 2;
    update(2 * node, l, mid, ql, qr, v);
    update(2 * node + 1, mid + 1, r, ql, qr, v);
    tre[node] = tre[2 * node] + tre[2 * node + 1];
}

long long query(int node, int l, int r, int ql, int qr) {
    if (qr < l || r < ql) return 0;
    if (ql <= l && r <= qr) return tre[node];
    push(node, l, r);
    int mid = (l + r) / 2;
    return query(2 * node, l, mid, ql, qr) + query(2 * node + 1, mid + 1, r, ql, qr);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int T;
    cin >> T;
    while (T--) {
        int n, c;
        cin >> n >> c;
        tre.assign(4 * n + 4, 0);           // fresh tree per test case, no stale tags
        lz.assign(4 * n + 4, 0);
        while (c--) {
            int type, p, q;
            cin >> type >> p >> q;
            if (type == 0) {
                long long v;
                cin >> v;
                update(1, 1, n, p, q, v);
            } else {
                cout << query(1, 1, n, p, q) << "\\n";
            }
        }
    }
    return 0;
}`,
      explanation: [
        "Range add combined with range sum is the canonical lazy segment tree. The reason a single scalar tag suffices is that the add operation distributes over the sum aggregate: adding v to every one of len elements changes their sum by exactly v * len, a quantity computable from the tag and the segment length alone, without knowing the individual elements.",
        "Query and update share the same three-case recursion - disjoint, fully covered, partial - and the only extra rule for a query is that it must also push before descending. Beginners often push only in update and get correct sums right up until a query lands under a tagged node.",
        "Multi-test-case judges punish shared global state. Reassigning both arrays per test case is what keeps a tag from the previous case leaking into this one; clearing only the tree and not the lazy array is a classic source of a wrong answer that reproduces on test 2 but never on test 1.",
        "With 10^5 adds of 10^7 across 10^5 positions the total sum reaches roughly 10^17, so 64-bit accumulators are mandatory - an int tree here overflows well before the last query.",
        "Time: O(C log N) per test case. Space: O(N).",
      ],
    },
    {
      name: "Circular RMQ",
      difficulty: "Medium",
      variation: "Range add, range min on a circular array",
      link: "https://codeforces.com/problemset/problem/52/C",
      question: [
        "You are given a circular array a[0..n-1]. Handle m operations. An 'inc lf rg v' operation adds v to every element of the circular segment that starts at index lf and walks forward, wrapping past n-1 back to 0, until index rg. An 'rmq lf rg' operation prints the minimum over that same circular segment. Each operation appears on its own line; a line with two numbers is an rmq, a line with three numbers is an inc.",
        "Example 1:\nInput:\n4\n1 2 3 4\n4\n3 0\n3 0 -1\n0 1\n2 1\nOutput:\n1\n0\n0\nExplanation: The array is 1 2 3 4. The first line has two numbers so it is rmq(3,0), covering indices 3 and 0, giving min(4,1) = 1. The next line has three numbers so it is inc(3,0,-1), leaving 0 2 3 3. Then rmq(0,1) = min(0,2) = 0, and rmq(2,1) covers indices 2,3,0,1, giving min(3,3,0,2) = 0.",
        "Constraints:\n- 1 <= n <= 2 * 10^5\n- 0 <= m <= 2 * 10^5\n- |a[i]| <= 10^6 and |v| <= 10^6\n- 0 <= lf, rg <= n - 1 (lf may exceed rg, which means the segment wraps)",
      ],
      code: `vector<long long> mn, lz;
vector<long long> a;

void build(int node, int l, int r) {
    lz[node] = 0;
    if (l == r) { mn[node] = a[l]; return; }
    int mid = (l + r) / 2;
    build(2 * node, l, mid);
    build(2 * node + 1, mid + 1, r);
    mn[node] = min(mn[2 * node], mn[2 * node + 1]);
}

// min is shift-invariant: adding v to a whole segment adds v to its minimum.
void applyAdd(int node, long long v) {
    mn[node] += v;
    lz[node] += v;
}

void push(int node) {
    if (lz[node] == 0) return;
    applyAdd(2 * node, lz[node]);
    applyAdd(2 * node + 1, lz[node]);
    lz[node] = 0;
}

void update(int node, int l, int r, int ql, int qr, long long v) {
    if (qr < l || r < ql) return;
    if (ql <= l && r <= qr) { applyAdd(node, v); return; }
    push(node);
    int mid = (l + r) / 2;
    update(2 * node, l, mid, ql, qr, v);
    update(2 * node + 1, mid + 1, r, ql, qr, v);
    mn[node] = min(mn[2 * node], mn[2 * node + 1]);
}

long long query(int node, int l, int r, int ql, int qr) {
    if (qr < l || r < ql) return LLONG_MAX;   // identity of min
    if (ql <= l && r <= qr) return mn[node];
    push(node);
    int mid = (l + r) / 2;
    return min(query(2 * node, l, mid, ql, qr), query(2 * node + 1, mid + 1, r, ql, qr));
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    a.assign(n, 0);
    for (int i = 0; i < n; i++) cin >> a[i];
    mn.assign(4 * n + 4, 0);
    lz.assign(4 * n + 4, 0);
    build(1, 0, n - 1);
    int m;
    cin >> m;
    cin.ignore();
    for (int i = 0; i < m; i++) {
        string line;
        if (!getline(cin, line)) break;
        istringstream ss(line);
        vector<long long> num;
        long long x;
        while (ss >> x) num.push_back(x);
        if (num.empty()) { i--; continue; }          // tolerate blank lines
        int lf = (int)num[0], rg = (int)num[1];
        if (num.size() == 2) {
            long long ans;
            if (lf <= rg) ans = query(1, 0, n - 1, lf, rg);
            else ans = min(query(1, 0, n - 1, lf, n - 1), query(1, 0, n - 1, 0, rg));
            cout << ans << "\\n";
        } else {
            long long v = num[2];
            if (lf <= rg) update(1, 0, n - 1, lf, rg, v);
            else {
                update(1, 0, n - 1, lf, n - 1, v);   // wrap = two linear segments
                update(1, 0, n - 1, 0, rg, v);
            }
        }
    }
    return 0;
}`,
      explanation: [
        "Two independent ideas meet here. First, add as a lazy tag over a min aggregate: min(x1+v, ..., xk+v) = v + min(x1, ..., xk), so the tag can be applied to a node in O(1) without the segment length - unlike the sum case, where the length is needed.",
        "Second, circularity is not a new data structure. A wrapped segment lf > rg is exactly the union of the two linear segments [lf, n-1] and [0, rg], so one circular operation becomes at most two ordinary ones. Splitting is safe for both operations: add is applied to disjoint pieces, and min over a union is the min of the pieces.",
        "The real difficulty of this problem is input parsing, not the tree. The operation kind is encoded only by how many integers the line has, so you must read line by line and count tokens; a plain cin >> loop desynchronises immediately and every later answer is garbage.",
        "For an empty query range the recursion must return the identity of the aggregate, LLONG_MAX for min. Returning 0 instead is a subtle bug that only shows up when all values in range are positive.",
        "Values can be as low as -10^6 and 2 * 10^5 updates of -10^6 can stack, so the minimum can reach about -2 * 10^11 - 64-bit again.",
        "Time: O((n + m) log n). Space: O(n).",
      ],
    },
    {
      name: "Light Switching",
      difficulty: "Medium",
      variation: "Range flip (XOR) tag, count of ones",
      link: "https://www.spoj.com/problems/LITE/",
      question: [
        "There are n lights in a row, all initially off, and m operations. An operation '0 i j' toggles every light in positions i..j: those that were on turn off and those that were off turn on. An operation '1 i j' prints how many lights in positions i..j are currently on. Positions are 1-indexed.",
        "Example 1:\nInput:\n4 5\n0 1 2\n0 2 4\n1 2 3\n0 2 4\n1 1 4\nOutput:\n1\n2\nExplanation: Start 0000. Toggling 1..2 gives 1100. Toggling 2..4 gives 1011, so positions 2..3 hold 0 and 1, which is 1 light on. Toggling 2..4 again gives 1100, and positions 1..4 hold two lights on.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= m <= 10^5\n- 1 <= i <= j <= n",
      ],
      code: `vector<int> cntOn, lz;   // lz[node] = 1 means a flip is owed to the children

void applyFlip(int node, int l, int r) {
    cntOn[node] = (r - l + 1) - cntOn[node];   // on and off swap roles
    lz[node] ^= 1;                             // two flips cancel, so XOR not +=
}

void push(int node, int l, int r) {
    if (lz[node] == 0) return;
    int mid = (l + r) / 2;
    applyFlip(2 * node, l, mid);
    applyFlip(2 * node + 1, mid + 1, r);
    lz[node] = 0;
}

void update(int node, int l, int r, int ql, int qr) {
    if (qr < l || r < ql) return;
    if (ql <= l && r <= qr) { applyFlip(node, l, r); return; }
    push(node, l, r);
    int mid = (l + r) / 2;
    update(2 * node, l, mid, ql, qr);
    update(2 * node + 1, mid + 1, r, ql, qr);
    cntOn[node] = cntOn[2 * node] + cntOn[2 * node + 1];
}

int query(int node, int l, int r, int ql, int qr) {
    if (qr < l || r < ql) return 0;
    if (ql <= l && r <= qr) return cntOn[node];
    push(node, l, r);
    int mid = (l + r) / 2;
    return query(2 * node, l, mid, ql, qr) + query(2 * node + 1, mid + 1, r, ql, qr);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    cntOn.assign(4 * n + 4, 0);
    lz.assign(4 * n + 4, 0);
    while (m--) {
        int type, i, j;
        cin >> type >> i >> j;
        if (type == 0) update(1, 1, n, i, j);
        else cout << query(1, 1, n, i, j) << "\\n";
    }
    return 0;
}`,
      explanation: [
        "The aggregate to store is the number of lights on, not the individual bits, because a flip acts on that aggregate in closed form: if k of len lights were on, then len - k are on after the flip. That is the whole reason lazy propagation applies to a toggle at all.",
        "The tag is a single bit and composes by XOR, since flipping twice is the identity. Writing lz[node] += 1 works only until an even number of flips lands on the same node without a push in between, at which point the tree reports the complement of the truth. This is the standard trap for this problem.",
        "Note that no build step is needed: all lights start off, so the all-zero tree is already correct - a small reminder that build exists only to load initial values.",
        "The same tag generalises: for range XOR with an arbitrary constant plus range sum, keep 20 independent trees of this exact shape, one per bit, since each bit of x independently flips or does not.",
        "Time: O(m log n). Space: O(n).",
      ],
    },
    {
      name: "My Calendar III",
      difficulty: "Hard",
      variation: "Range add, global max on a dynamic (implicit) tree",
      link: "https://leetcode.com/problems/my-calendar-iii/",
      question: [
        "A k-booking happens when k events have some non-empty intersection. Implement a class MyCalendarThree supporting book(start, end), which adds the half-open interval [start, end) and returns the largest integer k such that a k-booking exists in the calendar after this event is added.",
        "Example 1:\nInput:\nMyCalendarThree();\nbook(10, 20);\nbook(50, 60);\nbook(10, 40);\nbook(5, 15);\nbook(5, 10);\nbook(25, 55);\nOutput: [null, 1, 1, 2, 3, 3, 3]\nExplanation: The first two events do not overlap, so the maximum is 1. Adding [10,40) makes [10,20) doubly booked. Adding [5,15) makes [10,15) triple booked. Adding [5,10) only raises [5,10) to 2, so the answer stays 3, and [25,55) raises [25,40) to 2, again leaving 3.",
        "Constraints:\n- 0 <= start < end <= 10^9\n- At most 400 calls to book",
      ],
      code: `class MyCalendarThree {
    // Implicit segment tree over [0, 1e9]: nodes are created only by being touched.
    unordered_map<long long, int> mx, lz;

    void update(long long node, int l, int r, int ql, int qr) {
        if (qr < l || r < ql) return;
        if (ql <= l && r <= qr) { mx[node]++; lz[node]++; return; }
        int mid = l + (r - l) / 2;
        update(2 * node, l, mid, ql, qr);
        update(2 * node + 1, mid + 1, r, ql, qr);
        // No pushdown: a node's true max is the children's max plus its own debt.
        mx[node] = max(mx[2 * node], mx[2 * node + 1]) + lz[node];
    }

public:
    MyCalendarThree() {}

    int book(int start, int end) {
        update(1, 0, 1000000000, start, end - 1);   // half-open -> inclusive
        return mx[1];
    }
};`,
      explanation: [
        "Model each booking as adding 1 over an interval; the answer is the global maximum of the resulting count function. So the structure needed is range add with max query, and only the max over the whole domain is ever read, which is exactly mx at the root.",
        "Because the coordinates reach 10^9, the tree cannot be materialised. An implicit tree indexed by the usual 2*node / 2*node+1 numbering, stored in a hash map, allocates only the O(log C) nodes each update actually visits. Node indices reach about 2^31, so the key type must be 64-bit - using int here overflows and silently aliases unrelated nodes.",
        "This solution deliberately skips pushdown. For an add tag over a max aggregate you can keep the debt at the node and recompute mx[node] = max(children) + lz[node] on the way up. The invariant becomes 'mx[node] is correct relative to its subtree given lz[node] is still owed downward', which is enough because every read here starts at the root. If you ever needed a query over an arbitrary sub-range you would either push properly or accumulate the tags along the descent.",
        "The tempting wrong approach is a sweep line over event endpoints recomputed after every booking - correct, but O(n) per call after sorting, and it does not extend to the online setting. A boundary detail that trips people either way: intervals are half-open, so [5,10) and [10,20) must not count as overlapping. Converting to the inclusive range [start, end-1] handles that.",
        "Time: O(log C) per booking, C = 10^9. Space: O(n log C) nodes.",
      ],
    },
    {
      name: "Falling Squares",
      difficulty: "Hard",
      variation: "Range assign tag, range max query, coordinate compressed",
      link: "https://leetcode.com/problems/falling-squares/",
      question: [
        "Squares are dropped one at a time onto the number line. positions[i] = [left, sideLength] describes a square with its left edge at left and side sideLength, occupying the interval [left, left + sideLength). A square falls until it lands on the top of a previously dropped square that it overlaps horizontally, or on the ground. Squares that merely touch at an endpoint do not overlap. Return an array ans where ans[i] is the height of the tallest stack after the i-th square lands.",
        "Example 1:\nInput: positions = [[1,2],[2,3],[6,1]]\nOutput: [2,5,5]\nExplanation: The first square covers [1,3) and reaches height 2. The second covers [2,5), overlaps the first, so it rests at height 2 and its top is 5. The third covers [6,7) and lands on the ground at height 1, leaving the tallest stack at 5.",
        "Example 2:\nInput: positions = [[100,100],[200,100]]\nOutput: [100,100]\nExplanation: The squares cover [100,200) and [200,300). They only touch at 200, so the second lands on the ground and both tops are at 100.",
        "Constraints:\n- 1 <= positions.length <= 1000\n- 1 <= left <= 10^8\n- 1 <= sideLength <= 10^6",
      ],
      code: `class Solution {
    vector<int> mx, lz;   // lz[node] == -1 means no pending assignment

    void applyAssign(int node, int v) {
        mx[node] = v;
        lz[node] = v;     // an assign overwrites any older pending assign
    }

    void push(int node) {
        if (lz[node] == -1) return;
        applyAssign(2 * node, lz[node]);
        applyAssign(2 * node + 1, lz[node]);
        lz[node] = -1;
    }

    void update(int node, int l, int r, int ql, int qr, int v) {
        if (qr < l || r < ql) return;
        if (ql <= l && r <= qr) { applyAssign(node, v); return; }
        push(node);
        int mid = (l + r) / 2;
        update(2 * node, l, mid, ql, qr, v);
        update(2 * node + 1, mid + 1, r, ql, qr, v);
        mx[node] = max(mx[2 * node], mx[2 * node + 1]);
    }

    int query(int node, int l, int r, int ql, int qr) {
        if (qr < l || r < ql) return 0;
        if (ql <= l && r <= qr) return mx[node];
        push(node);
        int mid = (l + r) / 2;
        return max(query(2 * node, l, mid, ql, qr), query(2 * node + 1, mid + 1, r, ql, qr));
    }

public:
    vector<int> fallingSquares(vector<vector<int>>& positions) {
        // Compress inclusive endpoints so that touching squares stay disjoint.
        vector<int> xs;
        for (auto& p : positions) {
            xs.push_back(p[0]);
            xs.push_back(p[0] + p[1] - 1);
        }
        sort(xs.begin(), xs.end());
        xs.erase(unique(xs.begin(), xs.end()), xs.end());
        int m = xs.size();
        mx.assign(4 * m + 4, 0);
        lz.assign(4 * m + 4, -1);
        vector<int> ans;
        int best = 0;
        for (auto& p : positions) {
            int l = lower_bound(xs.begin(), xs.end(), p[0]) - xs.begin();
            int r = lower_bound(xs.begin(), xs.end(), p[0] + p[1] - 1) - xs.begin();
            int top = query(1, 0, m - 1, l, r) + p[1];   // rest on the tallest thing below
            update(1, 0, m - 1, l, r, top);              // the whole footprint is now flat
            best = max(best, top);
            ans.push_back(best);
        }
        return ans;
    }
};`,
      explanation: [
        "Maintain a height function over the line. Dropping a square is exactly two segment tree operations: query the max height over its footprint to learn where it lands, then assign that landing height plus the side length over the whole footprint, because the top of a square is flat.",
        "Assign is a lazy tag with a different composition rule from add: a newer assign destroys an older pending one, so applyAssign overwrites lz instead of accumulating it. This is why a sentinel is needed to distinguish 'assign 0' from 'nothing pending'. Reusing 0 as the sentinel is the classic bug in assign trees.",
        "Range assign is legitimate here only because the assigned value is at least the current max over the footprint, so nothing is lowered. If squares could shrink heights you would need chmax, which lazy propagation cannot express and Segment Tree Beats can.",
        "Coordinates go to 10^8 but only 2n of them matter, so compress. Compress the inclusive endpoints left and left+side-1, not the half-open pair: with inclusive endpoints two compressed ranges overlap if and only if the real intervals overlap, so squares that merely touch stay separate. Compressing left and left+side instead makes touching squares share an index and reports a false stack.",
        "The answer is a running prefix max because a square never lowers any height, so the tallest stack can only grow.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Handling Sum Queries After Update",
      difficulty: "Hard",
      variation: "Flip tag driving an external accumulator",
      link: "https://leetcode.com/problems/handling-sum-queries-after-update/",
      question: [
        "You are given two arrays nums1 (containing only 0s and 1s) and nums2, both of length n, and a list of queries. A query [1, l, r] flips every value of nums1 in the index range l..r (0 becomes 1 and 1 becomes 0). A query [2, p, 0] performs nums2[i] = nums2[i] + nums1[i] * p for every index i. A query [3, 0, 0] asks for the sum of all elements of nums2. Return an array holding the answer to every query of the third kind, in order.",
        "Example 1:\nInput: nums1 = [1,0,1], nums2 = [0,0,0], queries = [[1,1,1],[2,1,0],[3,0,0]]\nOutput: [3]\nExplanation: The flip over index 1..1 makes nums1 = [1,1,1]. The second query adds nums1[i] * 1 to each nums2[i], giving nums2 = [1,1,1], whose sum is 3.",
        "Example 2:\nInput: nums1 = [1], nums2 = [5], queries = [[2,0,0],[3,0,0]]\nOutput: [5]\nExplanation: The second-kind query has p = 0, so nums2 is unchanged and its sum is still 5.",
        "Constraints:\n- 1 <= n <= 10^5\n- 0 <= nums1[i] <= 1 and 0 <= nums2[i] <= 10^9\n- 1 <= queries.length <= 10^5\n- 0 <= p <= 10^6",
      ],
      code: `class Solution {
    vector<int> ones, lz;   // ones[node] = count of 1s; lz[node] = pending flip bit

    void applyFlip(int node, int l, int r) {
        ones[node] = (r - l + 1) - ones[node];
        lz[node] ^= 1;
    }

    void push(int node, int l, int r) {
        if (lz[node] == 0) return;
        int mid = (l + r) / 2;
        applyFlip(2 * node, l, mid);
        applyFlip(2 * node + 1, mid + 1, r);
        lz[node] = 0;
    }

    void build(int node, int l, int r, vector<int>& a) {
        lz[node] = 0;
        if (l == r) { ones[node] = a[l]; return; }
        int mid = (l + r) / 2;
        build(2 * node, l, mid, a);
        build(2 * node + 1, mid + 1, r, a);
        ones[node] = ones[2 * node] + ones[2 * node + 1];
    }

    void update(int node, int l, int r, int ql, int qr) {
        if (qr < l || r < ql) return;
        if (ql <= l && r <= qr) { applyFlip(node, l, r); return; }
        push(node, l, r);
        int mid = (l + r) / 2;
        update(2 * node, l, mid, ql, qr);
        update(2 * node + 1, mid + 1, r, ql, qr);
        ones[node] = ones[2 * node] + ones[2 * node + 1];
    }

public:
    vector<long long> handleQuery(vector<int>& nums1, vector<int>& nums2, vector<vector<int>>& queries) {
        int n = nums1.size();
        ones.assign(4 * n + 4, 0);
        lz.assign(4 * n + 4, 0);
        build(1, 0, n - 1, nums1);
        long long total = 0;
        for (int x : nums2) total += x;
        vector<long long> ans;
        for (auto& q : queries) {
            if (q[0] == 1) update(1, 0, n - 1, q[1], q[2]);
            else if (q[0] == 2) total += (long long)q[1] * ones[1];   // root holds all ones
            else ans.push_back(total);
        }
        return ans;
    }
};`,
      explanation: [
        "The key observation is that nums2 never needs to be stored per element. A type-2 query adds p to nums2[i] for exactly the indices where nums1[i] == 1, so it changes the total by p times the current number of ones. Since only the total is ever queried, one scalar accumulator replaces the entire second array.",
        "That reduces the problem to maintaining the number of ones in nums1 under range flips - the Light Switching tree, with the count of ones as the aggregate and a one-bit XOR tag. The global count is the root value, so type-2 queries are O(1) and no query descent is needed at all.",
        "The trap is trying to make nums2 itself a lazy segment tree with a 'add p where nums1 is 1' update. That is not a valid lazy tag: its effect on a node's sum depends on which positions inside the node are ones, which cannot be recovered from the tag and the segment length. Separating the two arrays is what makes the tag well defined.",
        "Arithmetic: 10^5 elements of 10^9 plus 10^5 queries adding up to 10^6 each across 10^5 ones gives totals near 10^16, so the accumulator and the returned values must be 64-bit.",
        "Time: O(n + q log n). Space: O(n).",
      ],
    },
    {
      name: "Range Module",
      difficulty: "Hard",
      variation: "Range assign 0/1 on a dynamic tree, all-ones query",
      link: "https://leetcode.com/problems/range-module/",
      question: [
        "Design a data structure to track ranges of numbers as a union of half-open intervals. Implement addRange(left, right), which adds every number in [left, right) to the tracked set; queryRange(left, right), which returns true only if every number in [left, right) is currently tracked; and removeRange(left, right), which stops tracking every number in [left, right).",
        "Example 1:\nInput:\nRangeModule();\naddRange(10, 20);\nremoveRange(14, 16);\nqueryRange(10, 14);\nqueryRange(13, 15);\nqueryRange(16, 17);\nOutput: [null, null, null, true, false, true]\nExplanation: After the add and the remove the tracked set is [10,14) union [16,20). So [10,14) is fully covered, [13,15) is not because 14 and 15 are missing, and [16,17) is covered.",
        "Constraints:\n- 1 <= left < right <= 10^9\n- At most 10^4 calls in total",
      ],
      code: `class RangeModule {
    struct Node {
        int lc = 0, rc = 0;   // child indices, 0 means 'not allocated'
        int cnt = 0;          // how many tracked integers in this segment
        int lz = -1;          // -1 none, 0 pending clear, 1 pending fill
    };
    vector<Node> t;
    static const int LO = 1, HI = 1000000000;

    int newNode() {
        t.push_back(Node());
        return (int)t.size() - 1;
    }

    void applyAssign(int node, int l, int r, int v) {
        t[node].cnt = v ? (r - l + 1) : 0;
        t[node].lz = v;
    }

    // Children are materialised only when the recursion truly has to split here.
    void ensure(int node) {
        if (!t[node].lc) { int c = newNode(); t[node].lc = c; }
        if (!t[node].rc) { int c = newNode(); t[node].rc = c; }
    }

    void push(int node, int l, int r) {
        if (t[node].lz == -1) return;
        int mid = l + (r - l) / 2;
        ensure(node);
        applyAssign(t[node].lc, l, mid, t[node].lz);
        applyAssign(t[node].rc, mid + 1, r, t[node].lz);
        t[node].lz = -1;
    }

    void update(int node, int l, int r, int ql, int qr, int v) {
        if (qr < l || r < ql) return;
        if (ql <= l && r <= qr) { applyAssign(node, l, r, v); return; }
        ensure(node);          // needed even when there is no tag to push down
        push(node, l, r);
        int mid = l + (r - l) / 2;
        update(t[node].lc, l, mid, ql, qr, v);
        update(t[node].rc, mid + 1, r, ql, qr, v);
        t[node].cnt = t[t[node].lc].cnt + t[t[node].rc].cnt;
    }

    int query(int node, int l, int r, int ql, int qr) {
        if (qr < l || r < ql || node == 0) return 0;
        if (ql <= l && r <= qr) return t[node].cnt;
        push(node, l, r);
        int mid = l + (r - l) / 2;
        return query(t[node].lc, l, mid, ql, qr) + query(t[node].rc, mid + 1, r, ql, qr);
    }

public:
    RangeModule() {
        t.reserve(700000);
        t.push_back(Node());   // index 0 is the null sentinel
        newNode();             // index 1 is the root over [LO, HI]
    }

    void addRange(int left, int right) { update(1, LO, HI, left, right - 1, 1); }

    bool queryRange(int left, int right) {
        return query(1, LO, HI, left, right - 1) == right - left;
    }

    void removeRange(int left, int right) { update(1, LO, HI, left, right - 1, 0); }
};`,
      explanation: [
        "Treat the number line as a 0/1 array: 1 means tracked. Then addRange is 'assign 1 over a range', removeRange is 'assign 0 over a range', and queryRange asks whether the count of ones over the range equals its length. Counting rather than storing a boolean 'all tracked' flag is convenient because count composes by plain addition.",
        "Assign tags need three states, not two: pending-1, pending-0, and nothing pending. A boolean tag cannot distinguish 'clear this subtree' from 'leave it alone', which is why lz uses -1 as the no-op sentinel. This is the single most common bug in an assign tree.",
        "Because the domain is [1, 10^9], the tree is built lazily. Note where children get created: only inside push, at the moment a tag must be handed down. A node that is entirely covered by an update never allocates children at all, so total allocation stays O(q log C) instead of O(C). The query guard node == 0 treats a never-allocated subtree as empty.",
        "The lazy tree is not the shortest solution - a std::map of disjoint intervals, merging and splitting on the fly, is amortised O(log n) per call and much less code. The tree is the one that generalises: it survives extra operations like 'count tracked numbers in a range' or 'flip a range', which the interval map handles poorly.",
        "Half-open input again needs converting: the operation covers the inclusive range [left, right-1], and queryRange compares against right - left.",
        "Time: O(log C) per call, C = 10^9. Space: O(q log C).",
      ],
    },
    {
      name: "Range Updates and Sums",
      difficulty: "Hard",
      variation: "Two composing tags - range assign plus range add - with range sum",
      link: "https://cses.fi/problemset/task/1735",
      question: [
        "You are given an array of n integers and must process q operations of three kinds. Operation '1 a b x' increases every value in positions a..b by x. Operation '2 a b x' sets every value in positions a..b to x. Operation '3 a b' prints the sum of the values in positions a..b. Print the answer to every operation of the third kind on its own line. Positions are 1-indexed.",
        "Example 1:\nInput:\n5 4\n1 2 3 4 5\n3 1 5\n1 2 3 4\n3 1 5\n3 2 3\nOutput:\n15\n23\n13\nExplanation: The initial sum is 15. Adding 4 over positions 2..3 gives 1 6 7 4 5, whose total is 23, and positions 2..3 now sum to 13.",
        "Example 2:\nInput:\n5 4\n1 2 3 4 5\n2 1 3 2\n3 1 5\n1 4 5 1\n3 3 5\nOutput:\n15\n13\nExplanation: Assigning 2 over positions 1..3 gives 2 2 2 4 5, total 15. Adding 1 over positions 4..5 gives 2 2 2 5 6, so positions 3..5 sum to 2 + 5 + 6 = 13.",
        "Constraints:\n- 1 <= n, q <= 2 * 10^5\n- 0 <= array values <= 10^9 and 0 <= x <= 10^9\n- 1 <= a <= b <= n",
      ],
      code: `long long sm[800005], setVal[800005], addVal[800005];
bool hasSet[800005];
long long arr[200005];

void build(int node, int l, int r) {
    hasSet[node] = false;
    addVal[node] = 0;
    if (l == r) { sm[node] = arr[l]; return; }
    int mid = (l + r) / 2;
    build(2 * node, l, mid);
    build(2 * node + 1, mid + 1, r);
    sm[node] = sm[2 * node] + sm[2 * node + 1];
}

// An assign wipes out every earlier pending operation on this subtree.
void applySet(int node, int l, int r, long long v) {
    sm[node] = v * (r - l + 1);
    hasSet[node] = true;
    setVal[node] = v;
    addVal[node] = 0;
}

// An add stacks on top of whatever is already pending.
void applyAdd(int node, int l, int r, long long v) {
    sm[node] += v * (r - l + 1);
    addVal[node] += v;
}

void push(int node, int l, int r) {
    int mid = (l + r) / 2;
    if (hasSet[node]) {                      // assign first, then the add
        applySet(2 * node, l, mid, setVal[node]);
        applySet(2 * node + 1, mid + 1, r, setVal[node]);
        hasSet[node] = false;
    }
    if (addVal[node] != 0) {
        applyAdd(2 * node, l, mid, addVal[node]);
        applyAdd(2 * node + 1, mid + 1, r, addVal[node]);
        addVal[node] = 0;
    }
}

void rangeAdd(int node, int l, int r, int ql, int qr, long long v) {
    if (qr < l || r < ql) return;
    if (ql <= l && r <= qr) { applyAdd(node, l, r, v); return; }
    push(node, l, r);
    int mid = (l + r) / 2;
    rangeAdd(2 * node, l, mid, ql, qr, v);
    rangeAdd(2 * node + 1, mid + 1, r, ql, qr, v);
    sm[node] = sm[2 * node] + sm[2 * node + 1];
}

void rangeSet(int node, int l, int r, int ql, int qr, long long v) {
    if (qr < l || r < ql) return;
    if (ql <= l && r <= qr) { applySet(node, l, r, v); return; }
    push(node, l, r);
    int mid = (l + r) / 2;
    rangeSet(2 * node, l, mid, ql, qr, v);
    rangeSet(2 * node + 1, mid + 1, r, ql, qr, v);
    sm[node] = sm[2 * node] + sm[2 * node + 1];
}

long long query(int node, int l, int r, int ql, int qr) {
    if (qr < l || r < ql) return 0;
    if (ql <= l && r <= qr) return sm[node];
    push(node, l, r);
    int mid = (l + r) / 2;
    return query(2 * node, l, mid, ql, qr) + query(2 * node + 1, mid + 1, r, ql, qr);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    for (int i = 1; i <= n; i++) cin >> arr[i];
    build(1, 1, n);
    while (q--) {
        int type, a, b;
        cin >> type >> a >> b;
        if (type == 1) {
            long long x;
            cin >> x;
            rangeAdd(1, 1, n, a, b, x);
        } else if (type == 2) {
            long long x;
            cin >> x;
            rangeSet(1, 1, n, a, b, x);
        } else {
            cout << query(1, 1, n, a, b) << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "With two different update kinds the tag is no longer a number, it is a function. The set of functions generated by adds and assigns is exactly 'optionally assign c, then add d', so a node's pending tag is the triple (hasSet, setVal, addVal), interpreted as: assign setVal if hasSet, then add addVal. That family is closed under composition, which is precisely the requirement for a lazy tag.",
        "The two composition rules follow from that reading. A new assign makes every earlier pending operation irrelevant, so applySet must reset addVal to 0 - forgetting that line is the single most common bug in this problem, and it produces answers that are too large only when an add precedes an assign on the same node. A new add simply accumulates into addVal, whether or not an assign is pending.",
        "Order inside push is equally load-bearing: the assign must be handed to the children before the add, since the tag means assign-then-add. Reversing the two lines discards the add.",
        "Once the tag algebra is right, both update routines are the same recursion, and only the leaf action differs. That is the general shape of a lazy tree: an aggregate, a tag monoid, and a rule for applying a tag to an aggregate given a segment length.",
        "Sizes: 2 * 10^5 values up to 10^9 already gives sums near 2 * 10^14, so the tree, both tags and the answers are all 64-bit.",
        "Time: O((n + q) log n). Space: O(n).",
      ],
    },
    {
      name: "Polynomial Queries",
      difficulty: "Hard",
      variation: "Arithmetic-progression tag with range sum",
      link: "https://cses.fi/problemset/task/1736",
      question: [
        "You are given an array of n integers and must process q operations. Operation '1 a b' increases the values in positions a..b as an arithmetic progression: position a increases by 1, position a+1 by 2, position a+2 by 3, and so on, with position b increasing by b - a + 1. Operation '2 a b' prints the sum of the values in positions a..b. Positions are 1-indexed.",
        "Example 1:\nInput:\n5 3\n1 2 3 4 5\n2 1 5\n1 2 4\n2 1 5\nOutput:\n15\n21\nExplanation: The initial sum is 1+2+3+4+5 = 15. The update adds 1, 2 and 3 to positions 2, 3 and 4, giving 1 3 5 7 5, whose sum is 21.",
        "Example 2:\nInput:\n4 4\n1 1 1 1\n1 1 4\n2 1 4\n1 3 4\n2 2 3\nOutput:\n14\n8\nExplanation: The first update adds 1, 2, 3, 4 across the whole array, giving 2 3 4 5 with total 14. The second update adds 1 to position 3 and 2 to position 4, giving 2 3 5 7, so positions 2..3 sum to 3 + 5 = 8.",
        "Constraints:\n- 1 <= n, q <= 2 * 10^5\n- 1 <= array values <= 10^6\n- 1 <= a <= b <= n",
      ],
      code: `long long sm[800005], lzA[800005], lzD[800005];   // tag: value at offset i is A + i*D
long long arr[200005];

void build(int node, int l, int r) {
    lzA[node] = lzD[node] = 0;
    if (l == r) { sm[node] = arr[l]; return; }
    int mid = (l + r) / 2;
    build(2 * node, l, mid);
    build(2 * node + 1, mid + 1, r);
    sm[node] = sm[2 * node] + sm[2 * node + 1];
}

// Add the progression a, a+d, a+2d, ... aligned to this node's left endpoint.
void applyAP(int node, int l, int r, long long a, long long d) {
    long long len = r - l + 1;
    sm[node] += a * len + d * (len * (len - 1) / 2);   // sum of the progression
    lzA[node] += a;
    lzD[node] += d;
}

void push(int node, int l, int r) {
    if (lzA[node] == 0 && lzD[node] == 0) return;
    int mid = (l + r) / 2;
    applyAP(2 * node, l, mid, lzA[node], lzD[node]);
    // The right child starts (mid + 1 - l) steps into the progression.
    applyAP(2 * node + 1, mid + 1, r, lzA[node] + (mid + 1 - l) * lzD[node], lzD[node]);
    lzA[node] = lzD[node] = 0;
}

void update(int node, int l, int r, int ql, int qr) {
    if (qr < l || r < ql) return;
    if (ql <= l && r <= qr) {
        applyAP(node, l, r, (long long)(l - ql + 1), 1);   // position l gets l - ql + 1
        return;
    }
    push(node, l, r);
    int mid = (l + r) / 2;
    update(2 * node, l, mid, ql, qr);
    update(2 * node + 1, mid + 1, r, ql, qr);
    sm[node] = sm[2 * node] + sm[2 * node + 1];
}

long long query(int node, int l, int r, int ql, int qr) {
    if (qr < l || r < ql) return 0;
    if (ql <= l && r <= qr) return sm[node];
    push(node, l, r);
    int mid = (l + r) / 2;
    return query(2 * node, l, mid, ql, qr) + query(2 * node + 1, mid + 1, r, ql, qr);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    for (int i = 1; i <= n; i++) cin >> arr[i];
    build(1, 1, n);
    while (q--) {
        int type, a, b;
        cin >> type >> a >> b;
        if (type == 1) update(1, 1, n, a, b);
        else cout << query(1, 1, n, a, b) << "\\n";
    }
    return 0;
}`,
      explanation: [
        "The tag is now a linear function of position rather than a constant: 'add A + i*D at offset i from my left endpoint'. Two such tags add componentwise, and applying one to a node costs O(1) because the sum of an arithmetic progression over len terms is A*len + D*len*(len-1)/2. Those two facts are exactly what lazy propagation needs.",
        "Making the tag relative to the node's own left endpoint is the trick that keeps composition simple. It also forces the shift in push: the right child begins mid+1-l steps later, so its first term is A + (mid+1-l)*D while D itself is unchanged. Handing the parent's A down to both children unmodified is the bug that this problem is really testing.",
        "At a fully covered node [l, r] inside the query range [ql, qr], the increment at position l is l - ql + 1, so A = l - ql + 1 and D = 1. Note this makes A depend on the node, which is fine - each canonical node gets its own correctly offset tag.",
        "The tempting shortcut is two Fenwick trees in the style of range-add-range-sum. It does not extend: those trees represent a constant added over a range, and a progression is a degree-one function of the index, so you would need a third accumulator plus careful boundary corrections. The AP tag is both simpler to reason about and easy to extend to higher-degree updates.",
        "Magnitudes: a single position can absorb about 2 * 10^5 updates of up to 2 * 10^5 each, so array totals reach roughly 10^16 - well inside 64-bit but far outside 32.",
        "Time: O((n + q) log n). Space: O(n).",
      ],
    },
    {
      name: "Range Affine Range Sum",
      difficulty: "Hard",
      variation: "Affine (b*x + c) tag composition, modular",
      link: "https://atcoder.jp/contests/practice2/tasks/practice2_k",
      question: [
        "You are given a sequence a[0], a[1], ..., a[n-1] of non-negative integers and must process q queries modulo 998244353. A query '0 l r b c' replaces a[i] with b * a[i] + c for every i with l <= i < r. A query '1 l r' prints the sum a[l] + a[l+1] + ... + a[r-1] taken modulo 998244353. Note that both query kinds use half-open ranges.",
        "Example 1:\nInput:\n5 7\n1 2 3 4 5\n1 0 5\n0 2 4 100 101\n1 0 3\n0 1 3 102 103\n1 2 5\n0 2 5 104 105\n1 0 5\nOutput:\n15\n404\n41511\n4317767\nExplanation: The first sum is 15. The affine map on [2,4) sets a[2] = 401 and a[3] = 501, so the sum of [0,3) is 1 + 2 + 401 = 404. The next map on [1,3) gives a[1] = 307 and a[2] = 41005, so [2,5) sums to 41005 + 501 + 5 = 41511. The last map on [2,5) gives 4264625, 52209 and 625, and the whole sequence sums to 4317767.",
        "Constraints:\n- 1 <= n, q <= 5 * 10^5\n- 0 <= a[i], c < 998244353\n- 0 <= b < 998244353\n- 0 <= l < r <= n",
      ],
      code: `const long long MOD = 998244353;
long long sm[2000005], lb[2000005], lc[2000005];   // tag: x -> lb*x + lc
long long arr[500005];

void build(int node, int l, int r) {
    lb[node] = 1;
    lc[node] = 0;
    if (l == r) { sm[node] = arr[l] % MOD; return; }
    int mid = (l + r) / 2;
    build(2 * node, l, mid);
    build(2 * node + 1, mid + 1, r);
    sm[node] = (sm[2 * node] + sm[2 * node + 1]) % MOD;
}

void applyAffine(int node, int l, int r, long long b, long long c) {
    long long len = r - l + 1;
    // sum of (b*x + c) over the segment = b * sum + c * len
    sm[node] = (b * sm[node] + c % MOD * len) % MOD;
    // compose g(f(x)) where f is the pending tag and g is the new one
    lb[node] = lb[node] * b % MOD;
    lc[node] = (lc[node] * b + c) % MOD;
}

void push(int node, int l, int r) {
    if (lb[node] == 1 && lc[node] == 0) return;   // identity tag, nothing to do
    int mid = (l + r) / 2;
    applyAffine(2 * node, l, mid, lb[node], lc[node]);
    applyAffine(2 * node + 1, mid + 1, r, lb[node], lc[node]);
    lb[node] = 1;
    lc[node] = 0;
}

void update(int node, int l, int r, int ql, int qr, long long b, long long c) {
    if (qr < l || r < ql) return;
    if (ql <= l && r <= qr) { applyAffine(node, l, r, b, c); return; }
    push(node, l, r);
    int mid = (l + r) / 2;
    update(2 * node, l, mid, ql, qr, b, c);
    update(2 * node + 1, mid + 1, r, ql, qr, b, c);
    sm[node] = (sm[2 * node] + sm[2 * node + 1]) % MOD;
}

long long query(int node, int l, int r, int ql, int qr) {
    if (qr < l || r < ql) return 0;
    if (ql <= l && r <= qr) return sm[node];
    push(node, l, r);
    int mid = (l + r) / 2;
    return (query(2 * node, l, mid, ql, qr) + query(2 * node + 1, mid + 1, r, ql, qr)) % MOD;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    for (int i = 0; i < n; i++) cin >> arr[i];
    build(1, 0, n - 1);
    while (q--) {
        int type;
        cin >> type;
        if (type == 0) {
            int l, r;
            long long b, c;
            cin >> l >> r >> b >> c;
            update(1, 0, n - 1, l, r - 1, b, c);   // half-open -> inclusive
        } else {
            int l, r;
            cin >> l >> r;
            cout << query(1, 0, n - 1, l, r - 1) << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "This is the general form that every earlier problem is a special case of. The tag is an affine map f(x) = b*x + c; range add is b = 1, range assign is b = 0, and a flip on 0/1 values is b = -1, c = 1. Affine maps are closed under composition, and their effect on a sum is computable from the tag and the segment length alone: sum of b*x + c over len elements is b * sum + c * len. Those are the only two properties lazy propagation ever requires.",
        "Composition order is the one thing that must be right. The pending tag f runs first, then the new tag g, so the stored tag becomes g(f(x)) = (b_g * b_f) * x + (b_g * c_f + c_g). Writing lc = lc + c instead of lc * b + c is the classic error, and it stays invisible until two affine updates overlap on the same node without a push between them.",
        "The identity tag is (1, 0), not (0, 0). Initialising lb to 0 turns every untouched node into a multiply-by-zero, and the no-op check in push must test for the identity rather than for a zero tag.",
        "Every multiplication is of two values below 998244353, so products reach about 10^18 - inside signed 64-bit, but only just. Reduce after each multiply and never widen b or c beyond long long; using int anywhere in applyAffine overflows immediately.",
        "With n and q up to 5 * 10^5 the recursion is fine, but I/O is not: this needs untied, unsynchronised streams, and the half-open input ranges must be converted to inclusive exactly once, at the boundary.",
        "Time: O((n + q) log n). Space: O(n).",
      ],
    },
  ],
};
