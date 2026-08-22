import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Subtree Queries",
      difficulty: "Easy",
      variation: "Flattened tree, subtree as one range",
      link: "https://cses.fi/problemset/task/1137",
      question: [
        "You are given a rooted tree of n nodes, rooted at node 1. Every node has a value. Process q queries of two kinds: '1 s x' changes the value of node s to x, and '2 s' prints the sum of the values of every node in the subtree of s (including s itself).",
        "Example 1:\nInput:\n5 3\n4 2 5 2 1\n1 2\n1 3\n2 4\n2 5\n2 3\n1 4 -2\n2 1\nOutput:\n5\n10\nExplanation: The subtree of node 3 is just node 3, so the first answer is 5. Setting node 4 to -2 makes the whole tree sum 4 + 2 + 5 + (-2) + 1 = 10.",
        "Example 2:\nInput:\n5 3\n4 2 5 2 1\n1 2\n1 3\n2 4\n2 5\n2 2\n1 5 7\n2 2\nOutput:\n5\n11\nExplanation: The subtree of node 2 is {2, 4, 5}, so 2 + 2 + 1 = 5. After node 5 becomes 7 the same subtree sums to 2 + 2 + 7 = 11.",
        "Constraints:\n- 1 <= n, q <= 2 * 10^5\n- 1 <= value of a node <= 10^9\n- The n-1 given edges form a tree",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    vector<long long> val(n + 1);
    for (int i = 1; i <= n; i++) cin >> val[i];
    vector<vector<int>> adj(n + 1);
    for (int i = 0; i < n - 1; i++) {
        int a, b;
        cin >> a >> b;
        adj[a].push_back(b);
        adj[b].push_back(a);
    }
    // Iterative Euler tour: tin[u]..tout[u] is exactly the subtree of u.
    vector<int> tin(n + 1), tout(n + 1), par(n + 1, 0), it(n + 1, 0);
    int timer = 0;
    vector<int> st;
    st.push_back(1);
    tin[1] = timer++;
    while (!st.empty()) {
        int u = st.back();
        if (it[u] < (int)adj[u].size()) {
            int v = adj[u][it[u]++];
            if (v == par[u]) continue;
            par[v] = u;
            tin[v] = timer++;
            st.push_back(v);
        } else {
            tout[u] = timer - 1;
            st.pop_back();
        }
    }
    vector<long long> bit(n + 1, 0);
    auto upd = [&](int i, long long d) { for (++i; i <= n; i += i & -i) bit[i] += d; };
    auto pre = [&](int i) { long long s = 0; for (++i; i > 0; i -= i & -i) s += bit[i]; return s; };
    for (int i = 1; i <= n; i++) upd(tin[i], val[i]);
    while (q--) {
        int type;
        cin >> type;
        if (type == 1) {
            int s;
            long long x;
            cin >> s >> x;
            upd(tin[s], x - val[s]);   // Fenwick stores deltas, so push the difference
            val[s] = x;
        } else {
            int s;
            cin >> s;
            cout << pre(tout[s]) - pre(tin[s] - 1) << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "This is the half of heavy-light decomposition that comes for free: a DFS preorder labels every node with an entry time, and because a DFS finishes a whole subtree before backtracking, the subtree of u occupies the contiguous block of labels tin[u]..tout[u]. Any range structure over that flat array now answers subtree questions.",
        "A Fenwick tree over the flattened array gives point update and prefix sum in O(log n). Since the tree stores deltas, a 'set node s to x' operation is pushed as x minus the old value, and the old value is cached separately.",
        "The DFS is written iteratively on purpose. With n = 2 * 10^5 a path-shaped tree gives recursion depth 2 * 10^5, which overflows the default stack on many judges - the same trap appears in every problem in this topic, so the explicit stack is the habit worth building.",
        "The tempting wrong move is to answer each subtree query by walking the subtree. That is O(n) per query and degrades to O(nq) on a star or a path; flattening turns the shape of the tree into a non-issue.",
        "Time: O((n + q) log n). Space: O(n).",
      ],
    },
    {
      name: "Path Queries",
      difficulty: "Medium",
      variation: "Root-to-node path sum via chains",
      link: "https://cses.fi/problemset/task/1138",
      question: [
        "You are given a rooted tree of n nodes, rooted at node 1, where each node has a value. Process q queries of two kinds: '1 s x' changes the value of node s to x, and '2 s' prints the sum of the values on the path from the root to node s, inclusive of both ends.",
        "Example 1:\nInput:\n5 3\n4 2 5 2 1\n1 2\n1 3\n2 4\n2 5\n2 4\n1 2 -1\n2 5\nOutput:\n8\n4\nExplanation: The path 1 -> 2 -> 4 sums to 4 + 2 + 2 = 8. After node 2 becomes -1, the path 1 -> 2 -> 5 sums to 4 + (-1) + 1 = 4.",
        "Example 2:\nInput:\n5 2\n4 2 5 2 1\n1 2\n1 3\n2 4\n2 5\n2 3\n2 1\nOutput:\n9\n4\nExplanation: The path to node 3 is 4 + 5 = 9, and the path to the root is just the root, 4.",
        "Constraints:\n- 1 <= n, q <= 2 * 10^5\n- 1 <= value of a node <= 10^9\n- The n-1 given edges form a tree",
      ],
      code: `int n;
vector<vector<int>> adj;
vector<int> par, sz, heavy, head, pos, dep;

// Standard iterative HLD: parents/depths, then sizes bottom-up, then chain layout.
void decompose() {
    par.assign(n + 1, 0); sz.assign(n + 1, 1); heavy.assign(n + 1, 0);
    head.assign(n + 1, 0); pos.assign(n + 1, 0); dep.assign(n + 1, 0);
    sz[0] = 0;                                  // sentinel so 'no heavy child yet' loses every comparison
    vector<int> order, st{1};
    while (!st.empty()) {
        int u = st.back(); st.pop_back(); order.push_back(u);
        for (int v : adj[u]) if (v != par[u]) { par[v] = u; dep[v] = dep[u] + 1; st.push_back(v); }
    }
    for (int i = (int)order.size() - 1; i >= 0; i--) {   // reverse preorder = children before parents
        int u = order[i], best = 0;
        for (int v : adj[u]) if (v != par[u]) { sz[u] += sz[v]; if (sz[v] > sz[best]) best = v; }
        heavy[u] = best;
    }
    int cur = 0;
    vector<int> chains{1};
    while (!chains.empty()) {
        int h = chains.back(); chains.pop_back();
        for (int u = h; u; u = heavy[u]) {       // walk the whole chain, numbering it consecutively
            head[u] = h; pos[u] = cur++;
            for (int v : adj[u]) if (v != par[u] && v != heavy[u]) chains.push_back(v);
        }
    }
}

vector<long long> bit;
void bupd(int i, long long d) { for (++i; i <= n; i += i & -i) bit[i] += d; }
long long bpre(int i) { long long s = 0; for (++i; i > 0; i -= i & -i) s += bit[i]; return s; }
long long rangeSum(int l, int r) { return bpre(r) - bpre(l - 1); }

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int q;
    cin >> n >> q;
    vector<long long> val(n + 1);
    for (int i = 1; i <= n; i++) cin >> val[i];
    adj.assign(n + 1, {});
    for (int i = 0; i < n - 1; i++) {
        int a, b;
        cin >> a >> b;
        adj[a].push_back(b);
        adj[b].push_back(a);
    }
    decompose();
    bit.assign(n + 1, 0);
    for (int i = 1; i <= n; i++) bupd(pos[i], val[i]);
    while (q--) {
        int type;
        cin >> type;
        if (type == 1) {
            int s;
            long long x;
            cin >> s >> x;
            bupd(pos[s], x - val[s]);
            val[s] = x;
        } else {
            int s;
            cin >> s;
            long long res = 0;
            for (int u = s; u; u = par[head[u]])       // one range per chain touched
                res += rangeSum(pos[head[u]], pos[u]);
            cout << res << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "The decomposition itself: for each node the child with the largest subtree is its heavy child, and following heavy edges from a node down to a leaf produces a chain. Every node belongs to exactly one chain, and the chain layout numbers each chain as a contiguous block of the base array.",
        "The key counting fact is that walking from any node up to the root crosses at most O(log n) light edges. Crossing a light edge from v to par[v] at least doubles the subtree size, because the heavy sibling was at least as large as v, so there can only be log n such steps. That is why the root path splits into O(log n) contiguous ranges.",
        "So a root-to-s sum is a loop: add the range from the head of the current chain down to the current node, jump to the parent of that head, repeat. A Fenwick tree makes each range O(log n), giving O(log^2 n) per query.",
        "This particular problem also yields to a plain Euler tour with range add and point query (add x to the whole subtree, ask a point), which is a log factor faster. It is used here because it is the smallest problem where the chain-climbing loop is the entire answer and nothing else gets in the way.",
        "Time: O(n + q log^2 n). Space: O(n).",
      ],
    },
    {
      name: "Company Queries II",
      difficulty: "Medium",
      variation: "LCA from chain heads, no jump table",
      link: "https://cses.fi/problemset/task/1688",
      question: [
        "A company has n employees numbered 1..n. Employee 1 is the general director, and every other employee i has exactly one direct boss, so the structure is a tree rooted at 1. For each of q queries, given two employees a and b, print the lowest employee that is a boss (direct or indirect) of both, treating an employee as a boss of themselves. That is, print the lowest common ancestor of a and b.",
        "Example 1:\nInput:\n5 3\n1 1 3 3\n4 5\n2 5\n1 4\nOutput:\n3\n1\n1\nExplanation: The bosses of employees 2..5 are 1, 1, 3, 3. Employees 4 and 5 share boss 3. Employees 2 and 5 only meet at the director 1, and 1 is an ancestor of 4 so the answer is 1.",
        "Example 2:\nInput:\n4 2\n1 2 3\n4 2\n3 3\nOutput:\n2\n3\nExplanation: The tree is the path 1 - 2 - 3 - 4. Node 2 is an ancestor of 4, so LCA(4, 2) = 2, and the LCA of a node with itself is the node.",
        "Constraints:\n- 1 <= n, q <= 2 * 10^5\n- The boss list describes a valid tree rooted at 1",
      ],
      code: `int n;
vector<vector<int>> child;
vector<int> par, sz, heavy, head, dep;

void decompose() {
    sz.assign(n + 1, 1); heavy.assign(n + 1, 0);
    head.assign(n + 1, 0); dep.assign(n + 1, 0);
    sz[0] = 0;
    vector<int> order, st{1};
    while (!st.empty()) {
        int u = st.back(); st.pop_back(); order.push_back(u);
        for (int v : child[u]) { dep[v] = dep[u] + 1; st.push_back(v); }
    }
    for (int i = (int)order.size() - 1; i >= 0; i--) {
        int u = order[i], best = 0;
        for (int v : child[u]) { sz[u] += sz[v]; if (sz[v] > sz[best]) best = v; }
        heavy[u] = best;
    }
    vector<int> chains{1};
    while (!chains.empty()) {
        int h = chains.back(); chains.pop_back();
        for (int u = h; u; u = heavy[u]) {
            head[u] = h;
            for (int v : child[u]) if (v != heavy[u]) chains.push_back(v);
        }
    }
}

int lca(int u, int v) {
    while (head[u] != head[v]) {
        // Retire the node whose chain head is deeper - its chain cannot contain the LCA.
        if (dep[head[u]] < dep[head[v]]) swap(u, v);
        u = par[head[u]];
    }
    return dep[u] < dep[v] ? u : v;   // same chain now, so the shallower one is the ancestor
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int q;
    cin >> n >> q;
    par.assign(n + 1, 0);
    child.assign(n + 1, {});
    for (int i = 2; i <= n; i++) {
        cin >> par[i];
        child[par[i]].push_back(i);
    }
    decompose();
    while (q--) {
        int a, b;
        cin >> a >> b;
        cout << lca(a, b) << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Once the chains exist, LCA needs no extra structure at all. If u and v sit on different chains then at most one of those chains can contain the LCA, and it is not the one whose head is deeper - so lift that node above its chain head and repeat. When both land on the same chain, the LCA is whichever is shallower.",
        "Correctness of the choice: suppose head[u] is strictly deeper than head[v]. Every ancestor of v on v's chain is at depth <= dep[head[v]] going up, and the LCA is a common ancestor, so if it were on u's chain it would have to be an ancestor of head[u] too, contradiction with it lying at or below head[u]. Hence discarding u's chain is safe.",
        "Each iteration climbs one light edge, so the loop runs O(log n) times - the same bound that makes path queries work, reused here for free.",
        "Compared with binary lifting this uses O(n) memory rather than O(n log n) and needs no jump table, which matters when the tree is huge. Binary lifting is still preferable when you also need the k-th ancestor, which HLD does not give directly.",
        "Time: O(n) preprocessing, O(log n) per query. Space: O(n).",
      ],
    },
    {
      name: "Path Queries II",
      difficulty: "Hard",
      variation: "Path maximum with point updates (canonical HLD)",
      link: "https://cses.fi/problemset/task/2134",
      question: [
        "You are given a tree of n nodes, rooted at node 1, where each node has a value. Process q queries of two kinds: '1 s x' changes the value of node s to x, and '2 a b' prints the maximum node value on the path between nodes a and b, inclusive of both endpoints.",
        "Example 1:\nInput:\n5 4\n4 2 5 2 1\n1 2\n1 3\n2 4\n2 5\n2 4 3\n1 3 -2\n2 4 3\n2 4 5\nOutput:\n5\n4\n2\nExplanation: The path 4 - 2 - 1 - 3 holds values 2, 2, 4, 5, so the maximum is 5. After node 3 becomes -2 the same path holds 2, 2, 4, -2 with maximum 4. The path 4 - 2 - 5 holds 2, 2, 1 with maximum 2.",
        "Example 2:\nInput:\n3 2\n7 3 9\n1 2\n2 3\n2 1 3\n2 2 2\nOutput:\n9\n3\nExplanation: The path 1 - 2 - 3 has maximum 9, and a single-node path 2 to 2 has maximum 3.",
        "Constraints:\n- 1 <= n, q <= 2 * 10^5\n- 1 <= value of a node <= 10^9\n- The n-1 given edges form a tree",
      ],
      code: `int n;
vector<vector<int>> adj;
vector<int> par, sz, heavy, head, pos, dep;

void decompose() {
    par.assign(n + 1, 0); sz.assign(n + 1, 1); heavy.assign(n + 1, 0);
    head.assign(n + 1, 0); pos.assign(n + 1, 0); dep.assign(n + 1, 0);
    sz[0] = 0;
    vector<int> order, st{1};
    while (!st.empty()) {
        int u = st.back(); st.pop_back(); order.push_back(u);
        for (int v : adj[u]) if (v != par[u]) { par[v] = u; dep[v] = dep[u] + 1; st.push_back(v); }
    }
    for (int i = (int)order.size() - 1; i >= 0; i--) {
        int u = order[i], best = 0;
        for (int v : adj[u]) if (v != par[u]) { sz[u] += sz[v]; if (sz[v] > sz[best]) best = v; }
        heavy[u] = best;
    }
    int cur = 0;
    vector<int> chains{1};
    while (!chains.empty()) {
        int h = chains.back(); chains.pop_back();
        for (int u = h; u; u = heavy[u]) {
            head[u] = h; pos[u] = cur++;
            for (int v : adj[u]) if (v != par[u] && v != heavy[u]) chains.push_back(v);
        }
    }
}

const long long NEG = -4e18;
int SZ;
vector<long long> seg;   // iterative bottom-up max segment tree

void segSet(int i, long long v) {
    for (seg[i += SZ] = v, i >>= 1; i >= 1; i >>= 1) seg[i] = max(seg[2 * i], seg[2 * i + 1]);
}
long long segMax(int l, int r) {
    long long res = NEG;
    for (l += SZ, r += SZ + 1; l < r; l >>= 1, r >>= 1) {
        if (l & 1) res = max(res, seg[l++]);
        if (r & 1) res = max(res, seg[--r]);
    }
    return res;
}

long long pathMax(int u, int v) {
    long long res = NEG;
    while (head[u] != head[v]) {
        if (dep[head[u]] < dep[head[v]]) swap(u, v);
        res = max(res, segMax(pos[head[u]], pos[u]));
        u = par[head[u]];
    }
    if (pos[u] > pos[v]) swap(u, v);          // same chain: the shallower node has the smaller index
    return max(res, segMax(pos[u], pos[v]));
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int q;
    cin >> n >> q;
    vector<long long> val(n + 1);
    for (int i = 1; i <= n; i++) cin >> val[i];
    adj.assign(n + 1, {});
    for (int i = 0; i < n - 1; i++) {
        int a, b;
        cin >> a >> b;
        adj[a].push_back(b);
        adj[b].push_back(a);
    }
    decompose();
    SZ = 1;
    while (SZ < n) SZ <<= 1;
    seg.assign(2 * SZ, NEG);
    for (int i = 1; i <= n; i++) seg[SZ + pos[i]] = val[i];
    for (int i = SZ - 1; i >= 1; i--) seg[i] = max(seg[2 * i], seg[2 * i + 1]);
    while (q--) {
        int type;
        cin >> type;
        if (type == 1) {
            int s;
            long long x;
            cin >> s >> x;
            segSet(pos[s], x);
        } else {
            int a, b;
            cin >> a >> b;
            cout << pathMax(a, b) << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "This is the reference HLD problem: an arbitrary path a..b, not just a root path. The trick is that the path a..b is the concatenation of a..lca and lca..b, and the climbing loop handles both at once by always lifting whichever endpoint has the deeper chain head. When the two endpoints share a chain the remainder is a single range and the loop ends.",
        "Two ranges of the same chain are never queried twice and the LCA is covered exactly once, by the final range, so an idempotent operation like max and a non-idempotent one like sum both work with this loop unchanged.",
        "Each endpoint climbs O(log n) light edges, and each chain segment costs one O(log n) segment tree query, hence O(log^2 n) per query. Updates are a single point assignment, O(log n).",
        "Two implementation traps. First, the ordering test inside the loop must compare dep[head[u]] against dep[head[v]], not dep[u] against dep[v] - comparing the nodes themselves can lift the wrong endpoint past the LCA and silently include nodes that are not on the path. Second, the identity for max must be smaller than any legal value; using 0 breaks as soon as values can be negative.",
        "Because updates are point-only here, an alternative is Euler tour plus a sparse table for a static LCA, but that cannot absorb the value changes; segment tree over chains is what makes the structure dynamic.",
        "Time: O(n + q log^2 n). Space: O(n).",
      ],
    },
    {
      name: "Query on a Tree (QTREE)",
      difficulty: "Hard",
      variation: "Edge weights instead of node values",
      link: "https://www.spoj.com/problems/QTREE/",
      question: [
        "You are given a tree with n nodes; the n-1 edges are numbered 1..n-1 in input order and each has a weight. Handle a sequence of instructions: 'CHANGE i ti' sets the weight of edge i to ti, 'QUERY a b' prints the maximum edge weight on the path from a to b (print 0 when a equals b), and 'DONE' ends the test case. The first line of input is the number of test cases.",
        "Example 1:\nInput:\n1\n3\n1 2 1\n2 3 2\nQUERY 1 2\nCHANGE 1 3\nQUERY 1 2\nDONE\nOutput:\n1\n3\nExplanation: The path 1 - 2 uses only edge 1, of weight 1. After edge 1 is reweighted to 3 the same query gives 3.",
        "Example 2:\nInput:\n1\n5\n1 2 4\n1 3 7\n2 4 2\n2 5 9\nQUERY 4 3\nQUERY 4 5\nCHANGE 4 1\nQUERY 4 5\nDONE\nOutput:\n7\n9\n2\nExplanation: The path 4 - 2 - 1 - 3 uses edges of weight 2, 4, 7 so the answer is 7. The path 4 - 2 - 5 uses weights 2 and 9. After edge 4 (the edge 2 - 5) drops to weight 1 the maximum on that path becomes 2.",
        "Constraints:\n- 1 <= n <= 10000\n- Edge weights are non-negative integers\n- Several test cases per input file",
      ],
      code: `int n;
vector<vector<int>> adj;
vector<int> par, sz, heavy, head, pos, dep;

void decompose() {
    par.assign(n + 1, 0); sz.assign(n + 1, 1); heavy.assign(n + 1, 0);
    head.assign(n + 1, 0); pos.assign(n + 1, 0); dep.assign(n + 1, 0);
    sz[0] = 0;
    vector<int> order, st{1};
    while (!st.empty()) {
        int u = st.back(); st.pop_back(); order.push_back(u);
        for (int v : adj[u]) if (v != par[u]) { par[v] = u; dep[v] = dep[u] + 1; st.push_back(v); }
    }
    for (int i = (int)order.size() - 1; i >= 0; i--) {
        int u = order[i], best = 0;
        for (int v : adj[u]) if (v != par[u]) { sz[u] += sz[v]; if (sz[v] > sz[best]) best = v; }
        heavy[u] = best;
    }
    int cur = 0;
    vector<int> chains{1};
    while (!chains.empty()) {
        int h = chains.back(); chains.pop_back();
        for (int u = h; u; u = heavy[u]) {
            head[u] = h; pos[u] = cur++;
            for (int v : adj[u]) if (v != par[u] && v != heavy[u]) chains.push_back(v);
        }
    }
}

int SZ;
vector<int> seg;
void segSet(int i, int v) {
    for (seg[i += SZ] = v, i >>= 1; i >= 1; i >>= 1) seg[i] = max(seg[2 * i], seg[2 * i + 1]);
}
int segMax(int l, int r) {
    int res = 0;
    for (l += SZ, r += SZ + 1; l < r; l >>= 1, r >>= 1) {
        if (l & 1) res = max(res, seg[l++]);
        if (r & 1) res = max(res, seg[--r]);
    }
    return res;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int T;
    cin >> T;
    while (T--) {
        cin >> n;
        adj.assign(n + 1, {});
        vector<array<int,3>> edges(n);
        for (int i = 1; i < n; i++) {
            int a, b, c;
            cin >> a >> b >> c;
            edges[i] = {a, b, c};
            adj[a].push_back(b);
            adj[b].push_back(a);
        }
        decompose();
        SZ = 1;
        while (SZ < max(n, 1)) SZ <<= 1;
        seg.assign(2 * SZ, 0);
        vector<int> deeper(n);
        for (int i = 1; i < n; i++) {
            int a = edges[i][0], b = edges[i][1];
            deeper[i] = (par[a] == b) ? a : b;      // store an edge at its lower endpoint
            seg[SZ + pos[deeper[i]]] = edges[i][2];
        }
        for (int i = SZ - 1; i >= 1; i--) seg[i] = max(seg[2 * i], seg[2 * i + 1]);
        string op;
        while (cin >> op && op != "DONE") {
            if (op == "CHANGE") {
                int i, w;
                cin >> i >> w;
                segSet(pos[deeper[i]], w);
            } else {
                int u, v;
                cin >> u >> v;
                int res = 0;
                while (head[u] != head[v]) {
                    if (dep[head[u]] < dep[head[v]]) swap(u, v);
                    res = max(res, segMax(pos[head[u]], pos[u]));
                    u = par[head[u]];
                }
                if (u != v) {
                    if (pos[u] > pos[v]) swap(u, v);
                    res = max(res, segMax(pos[u] + 1, pos[v]));   // skip the LCA's own slot
                }
                cout << res << "\\n";
            }
        }
    }
    return 0;
}`,
      explanation: [
        "Weights live on edges, not nodes, so each edge is assigned to its lower endpoint. This is a bijection between the n-1 edges and the n-1 non-root nodes, so the same base array and the same chain climbing loop work with one change.",
        "The change is in the last step. The final range now runs from pos[lca] + 1 to pos[deeper], because the value stored at the LCA represents the edge going up out of the LCA, which is above the path and must not be counted. The intermediate chain ranges need no adjustment: whenever head[u] differs from head[v] the head is strictly below the LCA, so the edge above it really is on the path.",
        "Forgetting the +1 is the classic bug and it is easy to miss because it only shows up when the answer happens to lie on the edge just above the meeting point. Also guard u != v so a query with both endpoints equal produces 0 rather than an empty-but-inverted range.",
        "With multiple test cases every array must be rebuilt per case. Leftover state in seg or heavy from the previous tree is the second most common cause of wrong answers here.",
        "Time: O(n + q log^2 n) per test case. Space: O(n).",
      ],
    },
    {
      name: "Grass Planting (GRASSPLA)",
      difficulty: "Hard",
      variation: "Range add along a path, point query on an edge",
      link: "https://www.spoj.com/problems/GRASSPLA/",
      question: [
        "There are n pastures connected by n-1 bidirectional paths forming a tree rooted at pasture 1. Process m operations. 'P a b' plants grass on every path along the route from pasture a to pasture b. 'Q a' asks how many times grass has been planted on the single path connecting pasture a to its parent; a is never the root.",
        "Example 1:\nInput:\n5 7\n1 2\n1 3\n2 4\n2 5\nP 4 3\nQ 4\nQ 2\nQ 5\nP 4 5\nQ 4\nQ 5\nOutput:\n1\n1\n0\n2\n1\nExplanation: The route 4 - 2 - 1 - 3 plants the edges (4,2), (2,1) and (1,3) once each, so Q 4 and Q 2 give 1 while the untouched edge (5,2) gives 0. The route 4 - 2 - 5 then plants (4,2) and (2,5), so edge (4,2) reaches 2 and edge (5,2) reaches 1.",
        "Example 2:\nInput:\n3 4\n1 2\n2 3\nP 1 3\nQ 2\nQ 3\nQ 2\nOutput:\n1\n1\n1\nExplanation: The route 1 - 2 - 3 covers both edges once, and a Q operation never changes the state so repeating it repeats the answer.",
        "Constraints:\n- 1 <= n, m <= 10^5\n- The n-1 given paths form a tree",
      ],
      code: `int n;
vector<vector<int>> adj;
vector<int> par, sz, heavy, head, pos, dep;

void decompose() {
    par.assign(n + 1, 0); sz.assign(n + 1, 1); heavy.assign(n + 1, 0);
    head.assign(n + 1, 0); pos.assign(n + 1, 0); dep.assign(n + 1, 0);
    sz[0] = 0;
    vector<int> order, st{1};
    while (!st.empty()) {
        int u = st.back(); st.pop_back(); order.push_back(u);
        for (int v : adj[u]) if (v != par[u]) { par[v] = u; dep[v] = dep[u] + 1; st.push_back(v); }
    }
    for (int i = (int)order.size() - 1; i >= 0; i--) {
        int u = order[i], best = 0;
        for (int v : adj[u]) if (v != par[u]) { sz[u] += sz[v]; if (sz[v] > sz[best]) best = v; }
        heavy[u] = best;
    }
    int cur = 0;
    vector<int> chains{1};
    while (!chains.empty()) {
        int h = chains.back(); chains.pop_back();
        for (int u = h; u; u = heavy[u]) {
            head[u] = h; pos[u] = cur++;
            for (int v : adj[u]) if (v != par[u] && v != heavy[u]) chains.push_back(v);
        }
    }
}

// Fenwick over a difference array: range add in O(log n), point read as a prefix sum.
vector<long long> bit;
void bupd(int i, long long d) { for (++i; i <= n; i += i & -i) bit[i] += d; }
long long bpre(int i) { long long s = 0; for (++i; i > 0; i -= i & -i) s += bit[i]; return s; }
void rangeAdd(int l, int r) { bupd(l, 1); bupd(r + 1, -1); }

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int m;
    cin >> n >> m;
    adj.assign(n + 1, {});
    for (int i = 0; i < n - 1; i++) {
        int a, b;
        cin >> a >> b;
        adj[a].push_back(b);
        adj[b].push_back(a);
    }
    decompose();
    bit.assign(n + 2, 0);
    while (m--) {
        char c;
        cin >> c;
        if (c == 'P') {
            int u, v;
            cin >> u >> v;
            while (head[u] != head[v]) {
                if (dep[head[u]] < dep[head[v]]) swap(u, v);
                rangeAdd(pos[head[u]], pos[u]);
                u = par[head[u]];
            }
            if (u != v) {
                if (pos[u] > pos[v]) swap(u, v);
                rangeAdd(pos[u] + 1, pos[v]);
            }
        } else {
            int a;
            cin >> a;
            cout << bpre(pos[a]) << "\\n";   // edge (a, parent a) is stored at pos[a]
        }
    }
    return 0;
}`,
      explanation: [
        "The query direction is inverted compared with QTREE: updates now cover a whole path and reads are single edges. That is exactly the setting where a difference array beats a lazy segment tree - add 1 at l and -1 at r+1, and a point value is the prefix sum up to that index.",
        "Edges are again keyed by their lower endpoint, so 'the edge from a to its parent' is literally index pos[a], and a path update decomposes into the same O(log n) chain ranges with the same pos[lca] + 1 correction on the last one.",
        "The cost is O(log^2 n) per plant and O(log n) per question, with a single Fenwick array and no lazy propagation to get wrong. A lazy segment tree would also work but is more code for no gain when reads are points.",
        "The wrong-but-tempting approach is to walk the path edge by edge and increment each counter. On a path-shaped tree with m operations that is O(nm), around 10^10 steps here.",
        "Time: O(n + m log^2 n). Space: O(n).",
      ],
    },
    {
      name: "Distance Queries on a Tree",
      difficulty: "Hard",
      variation: "Path sum of edge weights with edge updates",
      question: [
        "You are given a tree with n vertices whose n-1 edges are numbered 1..n-1, edge i joining u_i and v_i with weight w_i. Process q queries of two kinds: '1 i w' changes the weight of edge i to w, and '2 u v' prints the distance between u and v, that is the sum of the weights of the edges on the unique path between them.",
        "Example 1:\nInput:\n5\n1 2 4\n1 3 7\n2 4 2\n2 5 9\n4\n2 4 3\n1 1 1\n2 4 3\n2 4 5\nOutput:\n13\n10\n11\nExplanation: The path 4 - 2 - 1 - 3 uses weights 2 + 4 + 7 = 13. Setting edge 1 (the edge 1 - 2) to weight 1 makes the same path 2 + 1 + 7 = 10. The path 4 - 2 - 5 uses 2 + 9 = 11 and is unaffected by that update.",
        "Example 2:\nInput:\n3\n1 2 5\n2 3 6\n3\n2 1 3\n1 2 1\n2 1 3\nOutput:\n11\n6\nExplanation: On the path 1 - 2 - 3 the distance is 5 + 6 = 11. After edge 2 drops to weight 1 the distance is 5 + 1 = 6.",
        "Constraints:\n- 2 <= n <= 2 * 10^5\n- 1 <= q <= 2 * 10^5\n- 1 <= w_i, w <= 10^9",
      ],
      code: `int n;
vector<vector<int>> adj;
vector<int> par, sz, heavy, head, pos, dep;

void decompose() {
    par.assign(n + 1, 0); sz.assign(n + 1, 1); heavy.assign(n + 1, 0);
    head.assign(n + 1, 0); pos.assign(n + 1, 0); dep.assign(n + 1, 0);
    sz[0] = 0;
    vector<int> order, st{1};
    while (!st.empty()) {
        int u = st.back(); st.pop_back(); order.push_back(u);
        for (int v : adj[u]) if (v != par[u]) { par[v] = u; dep[v] = dep[u] + 1; st.push_back(v); }
    }
    for (int i = (int)order.size() - 1; i >= 0; i--) {
        int u = order[i], best = 0;
        for (int v : adj[u]) if (v != par[u]) { sz[u] += sz[v]; if (sz[v] > sz[best]) best = v; }
        heavy[u] = best;
    }
    int cur = 0;
    vector<int> chains{1};
    while (!chains.empty()) {
        int h = chains.back(); chains.pop_back();
        for (int u = h; u; u = heavy[u]) {
            head[u] = h; pos[u] = cur++;
            for (int v : adj[u]) if (v != par[u] && v != heavy[u]) chains.push_back(v);
        }
    }
}

vector<long long> bit;
void bupd(int i, long long d) { for (++i; i <= n; i += i & -i) bit[i] += d; }
long long bpre(int i) { long long s = 0; for (++i; i > 0; i -= i & -i) s += bit[i]; return s; }
long long rangeSum(int l, int r) { return l > r ? 0 : bpre(r) - bpre(l - 1); }

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n;
    adj.assign(n + 1, {});
    vector<array<long long,3>> e(n);
    for (int i = 1; i < n; i++) {
        long long a, b, w;
        cin >> a >> b >> w;
        e[i] = {a, b, w};
        adj[a].push_back((int)b);
        adj[b].push_back((int)a);
    }
    decompose();
    bit.assign(n + 1, 0);
    vector<int> deeper(n);
    vector<long long> wt(n, 0);
    for (int i = 1; i < n; i++) {
        int a = (int)e[i][0], b = (int)e[i][1];
        deeper[i] = (par[a] == b) ? a : b;
        wt[i] = e[i][2];
        bupd(pos[deeper[i]], wt[i]);
    }
    int q;
    cin >> q;
    while (q--) {
        int type;
        cin >> type;
        if (type == 1) {
            int i;
            long long w;
            cin >> i >> w;
            bupd(pos[deeper[i]], w - wt[i]);   // Fenwick holds deltas
            wt[i] = w;
        } else {
            int u, v;
            cin >> u >> v;
            long long res = 0;
            while (head[u] != head[v]) {
                if (dep[head[u]] < dep[head[v]]) swap(u, v);
                res += rangeSum(pos[head[u]], pos[u]);
                u = par[head[u]];
            }
            if (u != v) {
                if (pos[u] > pos[v]) swap(u, v);
                res += rangeSum(pos[u] + 1, pos[v]);
            }
            cout << res << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "Distance is a path sum over edges, so this is the additive twin of QTREE: edge i lives at pos of its lower endpoint, and the path decomposes into O(log n) chain ranges with the LCA's slot excluded.",
        "Sum is not idempotent, which makes the loop's disjointness matter. Each chain range covers a strictly different stretch of the path and the ranges never overlap, because after handling head[u]..u the walk jumps to par[head[u]], strictly above everything already added. So double counting is impossible.",
        "Arithmetic trap: up to 2 * 10^5 edges of weight 10^9 give distances near 2 * 10^14, so the Fenwick tree and the accumulator must be 64-bit even though each individual weight fits in an int.",
        "An alternative with a better constant is an Euler tour Fenwick holding +w at tin and -w at tout of the lower endpoint, plus any LCA structure: then dist(u,v) = d(u) + d(v) - 2 * d(lca) with d computed as a prefix sum, giving O(log n) per operation. HLD is shown because it generalises to non-invertible combines such as max, where that subtraction trick does not exist.",
        "Time: O(n + q log^2 n). Space: O(n).",
      ],
    },
    {
      name: "Beard Graph",
      difficulty: "Hard",
      variation: "Path feasibility with blocked edges",
      link: "https://codeforces.com/problemset/problem/165/D",
      question: [
        "You are given a tree with n vertices whose n-1 edges are numbered 1..n-1 in input order. Every edge starts out black. Process m queries: '1 i' repaints edge i black, '2 i' repaints edge i white, and '3 a b' asks for the number of edges on the path from a to b provided every edge on that path is black; if any edge on the path is white, print -1. For a equal to b print 0.",
        "Example 1:\nInput:\n3\n1 2\n2 3\n7\n3 1 2\n3 1 3\n3 2 3\n2 2\n3 1 2\n3 1 3\n3 2 3\nOutput:\n1\n2\n1\n1\n-1\n-1\nExplanation: While both edges are black the three paths have 1, 2 and 1 edges. After edge 2 (the edge 2 - 3) turns white, the path 1 - 2 is still fully black with 1 edge, but both paths that use edge 2 are now impossible.",
        "Example 2:\nInput:\n4\n1 2\n2 3\n3 4\n5\n2 1\n3 1 4\n3 2 4\n1 1\n3 1 4\nOutput:\n-1\n2\n3\nExplanation: Whitening edge 1 blocks any path leaving vertex 1, so the first query is -1, while the path 2 - 3 - 4 avoids it and has 2 edges. Repainting edge 1 black restores the full path of 3 edges.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= m <= 3 * 10^5\n- The n-1 given edges form a tree",
      ],
      code: `int n;
vector<vector<int>> adj;
vector<int> par, sz, heavy, head, pos, dep;

void decompose() {
    par.assign(n + 1, 0); sz.assign(n + 1, 1); heavy.assign(n + 1, 0);
    head.assign(n + 1, 0); pos.assign(n + 1, 0); dep.assign(n + 1, 0);
    sz[0] = 0;
    vector<int> order, st{1};
    while (!st.empty()) {
        int u = st.back(); st.pop_back(); order.push_back(u);
        for (int v : adj[u]) if (v != par[u]) { par[v] = u; dep[v] = dep[u] + 1; st.push_back(v); }
    }
    for (int i = (int)order.size() - 1; i >= 0; i--) {
        int u = order[i], best = 0;
        for (int v : adj[u]) if (v != par[u]) { sz[u] += sz[v]; if (sz[v] > sz[best]) best = v; }
        heavy[u] = best;
    }
    int cur = 0;
    vector<int> chains{1};
    while (!chains.empty()) {
        int h = chains.back(); chains.pop_back();
        for (int u = h; u; u = heavy[u]) {
            head[u] = h; pos[u] = cur++;
            for (int v : adj[u]) if (v != par[u] && v != heavy[u]) chains.push_back(v);
        }
    }
}

const long long BIG = 1000000000LL;   // one white edge alone exceeds any legal answer
vector<long long> bit;
void bupd(int i, long long d) { for (++i; i <= n; i += i & -i) bit[i] += d; }
long long bpre(int i) { long long s = 0; for (++i; i > 0; i -= i & -i) s += bit[i]; return s; }
long long rangeSum(int l, int r) { return l > r ? 0 : bpre(r) - bpre(l - 1); }

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n;
    adj.assign(n + 1, {});
    vector<pair<int,int>> e(n);
    for (int i = 1; i < n; i++) {
        int a, b;
        cin >> a >> b;
        e[i] = {a, b};
        adj[a].push_back(b);
        adj[b].push_back(a);
    }
    decompose();
    bit.assign(n + 1, 0);
    vector<int> deeper(n);
    vector<long long> cost(n, 1);
    for (int i = 1; i < n; i++) {
        int a = e[i].first, b = e[i].second;
        deeper[i] = (par[a] == b) ? a : b;
        bupd(pos[deeper[i]], 1);
    }
    int m;
    cin >> m;
    while (m--) {
        int type;
        cin >> type;
        if (type == 1 || type == 2) {
            int i;
            cin >> i;
            long long nc = (type == 1) ? 1 : BIG;
            bupd(pos[deeper[i]], nc - cost[i]);
            cost[i] = nc;
        } else {
            int u, v;
            cin >> u >> v;
            long long res = 0;
            while (head[u] != head[v]) {
                if (dep[head[u]] < dep[head[v]]) swap(u, v);
                res += rangeSum(pos[head[u]], pos[u]);
                u = par[head[u]];
            }
            if (u != v) {
                if (pos[u] > pos[v]) swap(u, v);
                res += rangeSum(pos[u] + 1, pos[v]);
            }
            cout << (res >= BIG ? -1 : res) << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "Two questions are asked at once - is the path usable, and how long is it - and a single weighting answers both. Give a black edge cost 1 and a white edge cost BIG = 10^9. A path has at most 10^5 - 1 edges, so the total stays below BIG exactly when no white edge is present, and in that case the total is precisely the edge count.",
        "That collapses the problem to one path sum with point updates on edges, which is the plain HLD edge template again: edges keyed at their lower endpoint, O(log n) chain ranges, LCA slot skipped.",
        "The alternative encoding is to keep two structures, a white counter and a length, and check the counter first; it works but doubles the code for no benefit. The single sentinel weight is the neater invariant, provided BIG is chosen strictly greater than the largest possible legal answer - picking BIG too small is the real trap.",
        "Do not try to answer the length part with depths alone as dep[a] + dep[b] - 2 * dep[lca] and only use the structure for the white check. It happens to be correct here, but it stops generalising the moment edges get real weights, whereas the sentinel formulation does not care.",
        "Time: O(n + m log^2 n). Space: O(n).",
      ],
    },
    {
      name: "Water Tree",
      difficulty: "Hard",
      variation: "Subtree assign plus path-to-root assign",
      link: "https://codeforces.com/problemset/problem/343/D",
      question: [
        "A rooted tree of n vertices, rooted at vertex 1, models a system of water tanks; every vertex starts empty. Process q operations. '1 v' pours water into v, which fills v and every vertex in its subtree. '2 v' empties v, and the water drains through its ancestors, so v and every ancestor of v become empty. '3 v' prints 1 if vertex v currently holds water and 0 otherwise.",
        "Example 1:\nInput:\n5\n1 2\n5 1\n2 3\n4 2\n12\n1 1\n2 3\n3 1\n3 2\n3 3\n3 4\n1 2\n2 4\n3 1\n3 3\n3 4\n3 5\nOutput:\n0\n0\n0\n1\n0\n1\n0\n1\nExplanation: Filling vertex 1 fills everything; emptying vertex 3 drains 3, 2 and 1, leaving only 4 and 5 full. Filling vertex 2 refills 2, 3 and 4, then emptying vertex 4 drains 4, 2 and 1, so only 3 and 5 remain full.",
        "Example 2:\nInput:\n3\n1 2\n2 3\n5\n1 2\n3 3\n2 3\n3 2\n3 3\nOutput:\n1\n0\n0\nExplanation: Filling vertex 2 fills 2 and 3, so vertex 3 reports 1. Emptying vertex 3 drains 3, 2 and 1, so both later queries report 0.",
        "Constraints:\n- 1 <= n <= 5 * 10^5\n- 1 <= q <= 5 * 10^5\n- The n-1 given edges form a tree",
      ],
      code: `int n;
vector<vector<int>> adj;
vector<int> par, sz, heavy, head, pos, dep;

void decompose() {
    par.assign(n + 1, 0); sz.assign(n + 1, 1); heavy.assign(n + 1, 0);
    head.assign(n + 1, 0); pos.assign(n + 1, 0); dep.assign(n + 1, 0);
    sz[0] = 0;
    vector<int> order, st{1};
    while (!st.empty()) {
        int u = st.back(); st.pop_back(); order.push_back(u);
        for (int v : adj[u]) if (v != par[u]) { par[v] = u; dep[v] = dep[u] + 1; st.push_back(v); }
    }
    for (int i = (int)order.size() - 1; i >= 0; i--) {
        int u = order[i], best = 0;
        for (int v : adj[u]) if (v != par[u]) { sz[u] += sz[v]; if (sz[v] > sz[best]) best = v; }
        heavy[u] = best;
    }
    int cur = 0;
    vector<int> chains{1};
    while (!chains.empty()) {
        int h = chains.back(); chains.pop_back();
        for (int u = h; u; u = heavy[u]) {
            head[u] = h; pos[u] = cur++;
            for (int v : adj[u]) if (v != par[u] && v != heavy[u]) chains.push_back(v);
        }
    }
}

// Segment tree with assignment lazy; lazy = -1 means 'nothing pending'.
vector<int> val, lz;
void applyAll(int node, int v) { val[node] = v; lz[node] = v; }
void push(int node) {
    if (lz[node] != -1) { applyAll(2 * node, lz[node]); applyAll(2 * node + 1, lz[node]); lz[node] = -1; }
}
void assign(int node, int l, int r, int ql, int qr, int v) {
    if (qr < l || r < ql) return;
    if (ql <= l && r <= qr) { applyAll(node, v); return; }
    push(node);
    int m = (l + r) / 2;
    assign(2 * node, l, m, ql, qr, v);
    assign(2 * node + 1, m + 1, r, ql, qr, v);
    val[node] = (val[2 * node] && val[2 * node + 1]) ? 1 : 0;
}
int query(int node, int l, int r, int p) {
    if (l == r) return val[node];
    push(node);
    int m = (l + r) / 2;
    return p <= m ? query(2 * node, l, m, p) : query(2 * node + 1, m + 1, r, p);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n;
    adj.assign(n + 1, {});
    for (int i = 0; i < n - 1; i++) {
        int a, b;
        cin >> a >> b;
        adj[a].push_back(b);
        adj[b].push_back(a);
    }
    decompose();
    val.assign(4 * n, 0);
    lz.assign(4 * n, -1);
    int q;
    cin >> q;
    while (q--) {
        int type, v;
        cin >> type >> v;
        if (type == 1) {
            // HLD order is a DFS order, so the subtree of v is one contiguous block.
            assign(1, 0, n - 1, pos[v], pos[v] + sz[v] - 1, 1);
        } else if (type == 2) {
            for (int u = v; u; u = par[head[u]]) assign(1, 0, n - 1, pos[head[u]], pos[u], 0);
        } else {
            cout << query(1, 0, n - 1, pos[v]) << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "The two updates pull in opposite directions: filling is a subtree range, emptying is a root path. HLD serves both from one array, because the chain numbering is itself a valid DFS preorder - each chain is laid out consecutively and a node's whole subtree is emitted before the next sibling chain starts. So pos[v]..pos[v]+sz[v]-1 is the subtree, and the chain loop covers the root path.",
        "The stored value must be an assignment, not a toggle or an addition, since both operations overwrite history: the last write to a cell decides its state. That is what makes a single lazy tag of type 'set everything in this range to v' sufficient, with -1 as the 'no pending write' marker.",
        "Order of application is the whole correctness argument. Lazy tags are pushed down before any child is touched, so a later operation never sees a stale ancestor tag, and the operations therefore take effect in exactly the order they were issued.",
        "The tempting wrong model is to treat 'empty v' as only clearing v. The drain reaches every ancestor, and skipping them lets a vertex report full while its parent is empty - inconsistent with the physical model the problem describes.",
        "Time: O(n + q log^2 n) - fills cost O(log n), drains O(log^2 n). Space: O(n).",
      ],
    },
    {
      name: "Query on a Tree III (QTREE3)",
      difficulty: "Hard",
      variation: "Topmost marked node on the root path",
      link: "https://www.spoj.com/problems/QTREE3/",
      question: [
        "You are given a tree with n nodes rooted at node 1; every node starts white. Process q instructions. '0 i' flips the colour of node i, white to black or black to white. '1 v' prints the first black node encountered when walking from the root down to v, that is the black node on that path closest to the root, or -1 if no node on the path is black.",
        "Example 1:\nInput:\n9 8\n1 2\n1 3\n2 4\n2 9\n5 9\n7 9\n8 9\n6 8\n1 3\n0 8\n1 6\n1 7\n0 2\n1 9\n0 2\n1 9\nOutput:\n-1\n8\n-1\n2\n-1\nExplanation: Nothing is black at first, so the path to 3 answers -1. After node 8 turns black the path 1 - 2 - 9 - 8 - 6 meets it, giving 8, while the path 1 - 2 - 9 - 7 misses it. Turning node 2 black makes the path to 9 answer 2, since 2 is nearer the root, and flipping 2 back to white leaves that path with no black node.",
        "Example 2:\nInput:\n4 5\n1 2\n2 3\n3 4\n0 3\n1 4\n0 2\n1 4\n1 2\nOutput:\n3\n2\n2\nExplanation: On the path 1 - 2 - 3 - 4 only node 3 is black, so the answer is 3. After node 2 also turns black the topmost black node on that path is 2, and the query for node 2 itself also answers 2.",
        "Constraints:\n- 1 <= n, q <= 10^5\n- The n-1 given edges form a tree",
      ],
      code: `int n;
vector<vector<int>> adj;
vector<int> par, sz, heavy, head, pos, dep;

void decompose() {
    par.assign(n + 1, 0); sz.assign(n + 1, 1); heavy.assign(n + 1, 0);
    head.assign(n + 1, 0); pos.assign(n + 1, 0); dep.assign(n + 1, 0);
    sz[0] = 0;
    vector<int> order, st{1};
    while (!st.empty()) {
        int u = st.back(); st.pop_back(); order.push_back(u);
        for (int v : adj[u]) if (v != par[u]) { par[v] = u; dep[v] = dep[u] + 1; st.push_back(v); }
    }
    for (int i = (int)order.size() - 1; i >= 0; i--) {
        int u = order[i], best = 0;
        for (int v : adj[u]) if (v != par[u]) { sz[u] += sz[v]; if (sz[v] > sz[best]) best = v; }
        heavy[u] = best;
    }
    int cur = 0;
    vector<int> chains{1};
    while (!chains.empty()) {
        int h = chains.back(); chains.pop_back();
        for (int u = h; u; u = heavy[u]) {
            head[u] = h; pos[u] = cur++;
            for (int v : adj[u]) if (v != par[u] && v != heavy[u]) chains.push_back(v);
        }
    }
}

const int NONE = 1 << 30;
int SZ;
vector<int> seg;   // min index that is black, NONE if the range has no black node
void segSet(int i, int v) {
    for (seg[i += SZ] = v, i >>= 1; i >= 1; i >>= 1) seg[i] = min(seg[2 * i], seg[2 * i + 1]);
}
int segMin(int l, int r) {
    int res = NONE;
    for (l += SZ, r += SZ + 1; l < r; l >>= 1, r >>= 1) {
        if (l & 1) res = min(res, seg[l++]);
        if (r & 1) res = min(res, seg[--r]);
    }
    return res;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int q;
    cin >> n >> q;
    adj.assign(n + 1, {});
    for (int i = 0; i < n - 1; i++) {
        int a, b;
        cin >> a >> b;
        adj[a].push_back(b);
        adj[b].push_back(a);
    }
    decompose();
    vector<int> at(n);
    for (int i = 1; i <= n; i++) at[pos[i]] = i;   // inverse of pos
    SZ = 1;
    while (SZ < n) SZ <<= 1;
    seg.assign(2 * SZ, NONE);
    vector<char> black(n + 1, 0);
    while (q--) {
        int type, v;
        cin >> type >> v;
        if (type == 0) {
            black[v] ^= 1;
            segSet(pos[v], black[v] ? pos[v] : NONE);
        } else {
            int ans = -1;
            for (int u = v; u; u = par[head[u]]) {
                int p = segMin(pos[head[u]], pos[u]);
                if (p != NONE) ans = at[p];   // later chains are higher, so the last hit wins
            }
            cout << ans << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "The answer is not an aggregate value but a position, so store positions: a black node keeps its own index in the base array and a white node keeps NONE, and the segment tree takes minima. Within one chain the smaller index is the shallower node, so the range minimum is directly the highest black node of that chain segment.",
        "Climbing from v to the root visits chain segments strictly bottom to top. Overwriting the candidate on every segment that contains a black node therefore leaves the highest one, which is the answer - no depth comparison needed, the iteration order does the work.",
        "Combining minima across the whole path in one go would be wrong in general, because a smaller base-array index in a different chain says nothing about depth. Indices are only comparable as depths inside a single chain, and that is exactly the granularity at which the minimum is taken here.",
        "Toggling is handled by keeping the colour in a side array; a flip is a single point assignment of either pos[v] or NONE. Trying to derive the colour from the tree alone forces a read before every write.",
        "Time: O(n + q log^2 n). Space: O(n).",
      ],
    },
  ],
};
