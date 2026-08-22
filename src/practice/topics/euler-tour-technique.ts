import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Subordinates",
      difficulty: "Easy",
      variation: "Flattening a tree, subtree sizes from tin/tout",
      link: "https://cses.fi/problemset/task/1674",
      question: [
        "A company has n employees numbered 1..n. Employee 1 is the general director and every other employee i has exactly one direct boss p_i, so the reporting structure is a tree rooted at 1. For every employee, print how many subordinates they have, where a subordinate is any employee in their subtree other than themselves.",
        "The input gives n on the first line and then n-1 integers p_2 ... p_n, the boss of each employee 2..n. Print n integers on one line.",
        "Example 1:\nInput:\n5\n1 1 2 3\nOutput: 4 1 1 0 0\nExplanation: Employee 1 has children 2 and 3, employee 2 has child 4, employee 3 has child 5. So 1 has all four others below it, 2 has only 4, 3 has only 5, and 4 and 5 are leaves.",
        "Example 2:\nInput:\n4\n1 1 1\nOutput: 3 0 0 0\nExplanation: A star - all of 2, 3, 4 report directly to 1 and none of them has anyone below.",
        "Constraints:\n- 1 <= n <= 2 * 10^5\n- 1 <= p_i <= n, and the reporting structure is always a tree rooted at employee 1",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<vector<int>> ch(n + 1);
    for (int i = 2; i <= n; i++) {
        int p;
        cin >> p;
        ch[p].push_back(i);
    }
    vector<int> tin(n + 1), tout(n + 1), it(n + 1, 0), st;
    int timer = 0;
    // Iterative Euler tour - n can be 2*10^5 and the tree may be a single path,
    // so a recursive DFS would risk a stack overflow.
    st.push_back(1);
    tin[1] = timer++;
    while (!st.empty()) {
        int u = st.back();
        if (it[u] < (int)ch[u].size()) {
            int v = ch[u][it[u]++];
            tin[v] = timer++;
            st.push_back(v);
        } else {
            tout[u] = timer - 1;   // last position belonging to u's subtree
            st.pop_back();
        }
    }
    // Subtree of u occupies exactly [tin[u], tout[u]], so its size is the range length.
    for (int i = 1; i <= n; i++) cout << tout[i] - tin[i] << " \\n"[i == n];
    return 0;
}`,
      explanation: [
        "The whole technique is this one assignment: stamp every node with an entry time tin when the DFS first reaches it, and an exit time tout equal to the last entry time handed out anywhere inside its subtree. Because a DFS finishes a subtree completely before backing out, the entry times of a subtree form one contiguous block of integers.",
        "So subtree(u) is exactly the index range [tin[u], tout[u]] in the flattened array, its size is tout[u] - tin[u] + 1, and the number of subordinates is that minus one. No separate size DP is needed - the timestamps already carry it.",
        "This same pair of numbers gives the O(1) ancestor test used everywhere later: u is an ancestor of v if and only if tin[u] <= tin[v] and tout[v] <= tout[u]. Two subtrees are either nested or disjoint, never partially overlapping, which is why interval containment decides ancestry.",
        "The tempting wrong move on this problem is to compute sizes with a recursive DFS and 2*10^5 nodes shaped as a path. It is correct in theory and a stack overflow in practice on most judges, so the explicit stack with a per-node child iterator is the habit worth building.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Ki",
      difficulty: "Easy",
      variation: "Offline subtree add via a difference array on the tour",
      link: "https://atcoder.jp/contests/abc138/tasks/abc138_d",
      question: [
        "You are given a rooted tree with N vertices rooted at vertex 1, described by N-1 edges. Every vertex starts with a counter equal to 0. Then Q operations are applied: operation j is a pair (p_j, x_j) meaning add x_j to the counter of every vertex in the subtree of p_j, including p_j itself. After all operations, print the final counter of every vertex 1..N.",
        "Example 1:\nInput:\n4 3\n1 2\n2 3\n2 4\n2 10\n1 100\n3 1\nOutput: 100 110 111 110\nExplanation: The subtree of 2 is {2,3,4}, so the first operation gives each of them 10. The second adds 100 to every vertex. The third adds 1 to the subtree of 3, which is just {3}.",
        "Example 2:\nInput:\n6 2\n1 2\n1 3\n2 4\n3 6\n2 5\n1 10\n1 10\nOutput: 20 20 20 20 20 20\nExplanation: Both operations target the root, so every vertex receives 10 twice.",
        "Constraints:\n- 2 <= N <= 2 * 10^5\n- 1 <= Q <= 2 * 10^5\n- 1 <= x_j <= 10^4",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    vector<vector<int>> adj(n + 1);
    for (int i = 0; i < n - 1; i++) {
        int a, b;
        cin >> a >> b;
        adj[a].push_back(b);
        adj[b].push_back(a);
    }
    vector<int> tin(n + 1), tout(n + 1), par(n + 1, 0), it(n + 1, 0), st;
    int timer = 0;
    st.push_back(1);
    tin[1] = timer++;
    while (!st.empty()) {
        int u = st.back();
        if (it[u] < (int)adj[u].size()) {
            int v = adj[u][it[u]++];
            if (v == par[u]) continue;      // the edge back to the parent
            par[v] = u;
            tin[v] = timer++;
            st.push_back(v);
        } else {
            tout[u] = timer - 1;
            st.pop_back();
        }
    }
    vector<long long> diff(n + 1, 0);
    for (int i = 0; i < q; i++) {
        int p;
        long long x;
        cin >> p >> x;
        diff[tin[p]] += x;                              // range add on [tin[p], tout[p]]
        if (tout[p] + 1 < n) diff[tout[p] + 1] -= x;
    }
    for (int i = 1; i < n; i++) diff[i] += diff[i - 1];  // one prefix pass at the end
    for (int i = 1; i <= n; i++) cout << diff[tin[i]] << " \\n"[i == n];
    return 0;
}`,
      explanation: [
        "Once the tree is flat, a subtree add becomes a range add on an array, and range add with all answers read only at the very end is the classic difference array: +x at the left endpoint, -x just past the right endpoint, then a single prefix-sum sweep.",
        "The key is that all queries are known before any answer is required, so no logarithmic structure is needed at all - the updates are O(1) each and the reconstruction is one linear pass.",
        "The wrong-but-tempting approach is to push the value down the tree per operation, which is O(N) per operation and 4 * 10^10 elementary steps in the worst case. Another common slip is doing the prefix sum over vertex ids instead of over tour positions; only the tour order makes a subtree contiguous.",
        "Values need 64 bits: 2 * 10^5 operations of 10^4 on the root sum to 2 * 10^9, which overflows a 32-bit int.",
        "Time: O(N + Q). Space: O(N).",
      ],
    },
    {
      name: "Subtree Queries",
      difficulty: "Medium",
      variation: "Point update, subtree sum with a Fenwick tree",
      link: "https://cses.fi/problemset/task/1137",
      question: [
        "You are given a rooted tree of n nodes, rooted at node 1, where each node has a value. Process q queries of two kinds: '1 s x' changes the value of node s to x, and '2 s' prints the sum of the values in the subtree of node s (including s).",
        "The input gives n and q, then the n values, then n-1 edges, then the q queries.",
        "Example 1:\nInput:\n5 3\n4 2 5 2 1\n1 2\n1 3\n2 4\n2 5\n2 3\n1 4 9\n2 2\nOutput:\n5\n12\nExplanation: Node 3 is a leaf so its subtree sum is its own value 5. Then node 4 is set to 9, and the subtree of node 2 is {2,4,5} with values 2 + 9 + 1 = 12.",
        "Example 2:\nInput:\n3 2\n1 2 3\n1 2\n2 3\n2 1\n2 2\nOutput:\n6\n5\nExplanation: The tree is the path 1-2-3, so the subtree of 1 is everything (1+2+3=6) and the subtree of 2 is {2,3} (2+3=5).",
        "Constraints:\n- 1 <= n, q <= 2 * 10^5\n- 1 <= value <= 10^9",
      ],
      code: `int n;
vector<long long> bit;

void upd(int i, long long v) {          // i is a 0-based tour position
    for (++i; i <= n; i += i & -i) bit[i] += v;
}
long long pref(int i) {
    long long s = 0;
    for (++i; i > 0; i -= i & -i) s += bit[i];
    return s;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int q;
    cin >> n >> q;
    vector<long long> cur(n + 1);
    for (int i = 1; i <= n; i++) cin >> cur[i];
    vector<vector<int>> adj(n + 1);
    for (int i = 0; i < n - 1; i++) {
        int a, b;
        cin >> a >> b;
        adj[a].push_back(b);
        adj[b].push_back(a);
    }
    vector<int> tin(n + 1), tout(n + 1), par(n + 1, 0), it(n + 1, 0), st;
    int timer = 0;
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
    bit.assign(n + 1, 0);
    for (int i = 1; i <= n; i++) upd(tin[i], cur[i]);
    while (q--) {
        int type, s;
        cin >> type >> s;
        if (type == 1) {
            long long x;
            cin >> x;
            upd(tin[s], x - cur[s]);    // assignment expressed as a delta
            cur[s] = x;
        } else {
            long long total = pref(tout[s]) - (tin[s] ? pref(tin[s] - 1) : 0);
            cout << total << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "This is the canonical use of the technique. Store each node's value at index tin[node] of a flat array; then a subtree sum is the range sum over [tin[s], tout[s]] and a Fenwick tree answers it in O(log n) while still supporting point updates.",
        "A Fenwick tree only knows how to add a delta, not to assign, so keep the current value of every node in a side array and update with x - cur[s]. Forgetting this and calling upd(tin[s], x) accumulates values instead of replacing them - a bug that passes the first sample and fails everything else.",
        "Values reach 10^9 and there can be 2 * 10^5 of them, so a subtree sum can approach 2 * 10^14 and must be accumulated in a long long. The tree indices themselves stay in int range.",
        "Note what is not needed: no per-query traversal, no recomputation of subtree sums. The tour is built once, and after that the tree has effectively disappeared - only an array and its index ranges remain.",
        "Time: O(n + q log n). Space: O(n).",
      ],
    },
    {
      name: "Count Descendants",
      difficulty: "Medium",
      variation: "Ancestor test by interval containment, bucketed by depth",
      link: "https://atcoder.jp/contests/abc202/tasks/abc202_e",
      question: [
        "You are given a rooted tree with N vertices rooted at vertex 1; vertex i (for i >= 2) has parent p_i. The depth of the root is 0. Answer Q queries: for a query (U, D), count the vertices u such that U is an ancestor of U's descendant u and the depth of u is exactly D. Vertex U is not considered an ancestor of itself.",
        "Example 1:\nInput:\n7\n1 1 2 2 4 2\n4\n1 2\n7 2\n4 1\n5 5\nOutput:\n3\n0\n0\n0\nExplanation: Depths are vertex 1 at 0, vertices 2 and 3 at 1, vertices 4, 5 and 7 at 2, vertex 6 at 3. Query (1,2) finds vertices 4, 5 and 7. Query (7,2) finds nothing because 7 has no descendants and does not count itself. Query (4,1) fails because the only strict descendant of 4 is vertex 6 at depth 3. Query (5,5) has no vertex at depth 5 at all.",
        "Example 2:\nInput:\n4\n1 2 3\n2\n1 3\n2 2\nOutput:\n1\n1\nExplanation: The tree is the path 1-2-3-4 with depths 0,1,2,3. The only vertex at depth 3 is vertex 4, and it is a descendant of 1. The only vertex at depth 2 is vertex 3, a descendant of 2.",
        "Constraints:\n- 2 <= N <= 2 * 10^5\n- 1 <= Q <= 2 * 10^5\n- 0 <= D < N",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<vector<int>> ch(n + 1);
    for (int i = 2; i <= n; i++) {
        int p;
        cin >> p;
        ch[p].push_back(i);
    }
    vector<int> tin(n + 1), tout(n + 1), dep(n + 1, 0), it(n + 1, 0), st;
    int timer = 0;
    st.push_back(1);
    tin[1] = timer++;
    while (!st.empty()) {
        int u = st.back();
        if (it[u] < (int)ch[u].size()) {
            int v = ch[u][it[u]++];
            dep[v] = dep[u] + 1;
            tin[v] = timer++;
            st.push_back(v);
        } else {
            tout[u] = timer - 1;
            st.pop_back();
        }
    }
    // Bucket the entry times of all vertices by depth; each bucket is sorted.
    vector<vector<int>> byDepth(n);
    for (int v = 1; v <= n; v++) byDepth[dep[v]].push_back(tin[v]);
    for (auto& vec : byDepth) sort(vec.begin(), vec.end());
    int q;
    cin >> q;
    while (q--) {
        int u, d;
        cin >> u >> d;
        if (d >= n) { cout << 0 << "\\n"; continue; }
        auto& vec = byDepth[d];
        // Strict descendants of u occupy tour positions [tin[u]+1, tout[u]].
        int lo = lower_bound(vec.begin(), vec.end(), tin[u] + 1) - vec.begin();
        int hi = upper_bound(vec.begin(), vec.end(), tout[u]) - vec.begin();
        cout << hi - lo << "\\n";
    }
    return 0;
}`,
      explanation: [
        "The query is an intersection of two conditions: 'inside the subtree of U' and 'at depth exactly D'. The tour turns the first condition into membership in the integer interval [tin[U], tout[U]], and the second is handled by grouping vertices into one sorted list of entry times per depth.",
        "Then the answer is just how many entry times in the depth-D bucket land inside that interval, which two binary searches give. Using tin[U]+1 as the lower end is what excludes U itself; if D equals the depth of U the range is empty anyway, so the same formula handles that case for free.",
        "The buckets are naturally sorted if you append vertices in tour order, but sorting explicitly costs nothing and makes the invariant obvious. Total bucket size is exactly N, so memory stays linear even though there are up to N buckets.",
        "The trap is answering each query by walking the subtree, which is O(N) per query. A second trap is comparing depths only and forgetting the subtree condition, or vice versa - both conditions must be applied together, which is precisely what the sorted-bucket-plus-interval trick achieves.",
        "Time: O(N log N + Q log N). Space: O(N).",
      ],
    },
    {
      name: "Distance Queries",
      difficulty: "Medium",
      variation: "LCA from the 2n-1 Euler walk plus sparse-table RMQ",
      link: "https://cses.fi/problemset/task/1135",
      question: [
        "You are given a tree of n nodes rooted at node 1 and q queries. Each query gives two nodes a and b; print the distance between them, that is the number of edges on the unique path from a to b.",
        "Example 1:\nInput:\n5 3\n1 2\n1 3\n3 4\n3 5\n1 4\n2 5\n1 3\nOutput:\n2\n3\n1\nExplanation: The path 1-3-4 has 2 edges. The path 2-1-3-5 has 3 edges. The path 1-3 has 1 edge.",
        "Example 2:\nInput:\n4 2\n1 2\n2 3\n3 4\n4 1\n2 2\nOutput:\n3\n0\nExplanation: On the path graph 1-2-3-4 the distance from 4 to 1 is 3, and the distance from a node to itself is 0.",
        "Constraints:\n- 1 <= n, q <= 2 * 10^5\n- 1 <= a, b <= n",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    vector<vector<int>> adj(n + 1);
    for (int i = 0; i < n - 1; i++) {
        int a, b;
        cin >> a >> b;
        adj[a].push_back(b);
        adj[b].push_back(a);
    }
    vector<int> par(n + 1, 0), dep(n + 1, 0), first(n + 1, 0), it(n + 1, 0), st, euler;
    euler.reserve(2 * n);
    st.push_back(1);
    first[1] = 0;
    euler.push_back(1);
    while (!st.empty()) {
        int u = st.back();
        if (it[u] < (int)adj[u].size()) {
            int v = adj[u][it[u]++];
            if (v == par[u]) continue;
            par[v] = u;
            dep[v] = dep[u] + 1;
            first[v] = euler.size();
            euler.push_back(v);
            st.push_back(v);
        } else {
            st.pop_back();
            if (!st.empty()) euler.push_back(st.back());   // re-record the parent on the way up
        }
    }
    int m = euler.size();                                  // exactly 2n-1
    int LG = 1;
    while ((1 << LG) <= m) LG++;
    vector<vector<int>> sp(LG, vector<int>(m));
    for (int i = 0; i < m; i++) sp[0][i] = euler[i];
    for (int k = 1; k < LG; k++)
        for (int i = 0; i + (1 << k) <= m; i++) {
            int a = sp[k - 1][i], b = sp[k - 1][i + (1 << (k - 1))];
            sp[k][i] = dep[a] < dep[b] ? a : b;             // argmin by depth
        }
    auto lca = [&](int a, int b) {
        int l = first[a], r = first[b];
        if (l > r) swap(l, r);
        int k = 31 - __builtin_clz(r - l + 1);
        int x = sp[k][l], y = sp[k][r - (1 << k) + 1];
        return dep[x] < dep[y] ? x : y;
    };
    while (q--) {
        int a, b;
        cin >> a >> b;
        cout << dep[a] + dep[b] - 2 * dep[lca(a, b)] << "\\n";
    }
    return 0;
}`,
      explanation: [
        "This is the second face of the technique: instead of recording each node once, record it every time the walk touches it, giving an array of length exactly 2n-1. Between the first occurrence of a and the first occurrence of b, the walk must climb to their lowest common ancestor and cannot go above it, so the shallowest node in that slice is the LCA.",
        "That turns LCA into a range-minimum query on depths, which a sparse table answers in O(1) after O(n log n) preprocessing. Storing the argmin node rather than the depth avoids a second lookup table.",
        "With the LCA in hand, dist(a,b) = dep[a] + dep[b] - 2 * dep[lca] because the two root paths share exactly the prefix down to the LCA and that prefix is counted twice.",
        "Two details bite people. First, the RMQ must be over the 2n-1 walk, not over the n entry times - the compressed tour used for subtree queries cannot answer LCA this way. Second, min over depth is idempotent, so the overlapping two-block sparse-table query is valid; do not switch it to a non-idempotent aggregate like sum without changing the query shape.",
        "Time: O(n log n) preprocessing and O(1) per query. Space: O(n log n).",
      ],
    },
    {
      name: "Path Queries",
      difficulty: "Medium",
      variation: "Root-to-node path sum, +v at entry and -v at exit",
      link: "https://cses.fi/problemset/task/1138",
      question: [
        "You are given a rooted tree of n nodes, rooted at node 1, where each node has a value. Process q queries of two kinds: '1 s x' changes the value of node s to x, and '2 s' prints the sum of the values on the path from the root to node s, inclusive of both ends.",
        "Example 1:\nInput:\n5 4\n4 2 5 2 1\n1 2\n1 3\n2 4\n2 5\n2 4\n2 3\n1 1 10\n2 3\nOutput:\n8\n9\n15\nExplanation: The path 1-2-4 sums to 4 + 2 + 2 = 8. The path 1-3 sums to 4 + 5 = 9. After the root becomes 10, the path 1-3 sums to 10 + 5 = 15.",
        "Example 2:\nInput:\n3 2\n1 2 3\n1 2\n2 3\n2 3\n2 1\nOutput:\n6\n1\nExplanation: The tree is the path 1-2-3, so the root-to-3 path is 1 + 2 + 3 = 6, and the root-to-1 path is just the root value 1.",
        "Constraints:\n- 1 <= n, q <= 2 * 10^5\n- 1 <= value <= 10^9",
      ],
      code: `int n;
vector<long long> bit;

void add(int i, long long v) {
    for (++i; i <= n + 1; i += i & -i) bit[i] += v;
}
long long pref(int i) {
    long long s = 0;
    for (++i; i > 0; i -= i & -i) s += bit[i];
    return s;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int q;
    cin >> n >> q;
    vector<long long> cur(n + 1);
    for (int i = 1; i <= n; i++) cin >> cur[i];
    vector<vector<int>> adj(n + 1);
    for (int i = 0; i < n - 1; i++) {
        int a, b;
        cin >> a >> b;
        adj[a].push_back(b);
        adj[b].push_back(a);
    }
    vector<int> tin(n + 1), tout(n + 1), par(n + 1, 0), it(n + 1, 0), st;
    int timer = 0;
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
    bit.assign(n + 3, 0);
    // Each node contributes +value at its entry and -value just past its exit,
    // so a prefix sum up to tin[s] keeps exactly the ancestors of s that still cover it.
    for (int i = 1; i <= n; i++) {
        add(tin[i], cur[i]);
        add(tout[i] + 1, -cur[i]);
    }
    while (q--) {
        int type, s;
        cin >> type >> s;
        if (type == 1) {
            long long x;
            cin >> x;
            long long d = x - cur[s];
            cur[s] = x;
            add(tin[s], d);
            add(tout[s] + 1, -d);
        } else {
            cout << pref(tin[s]) << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "The trick is to invert the roles from the subtree problem. Here the Fenwick tree holds a difference array: node u's value is added at position tin[u] and removed at position tout[u] + 1. A prefix sum at position tin[s] therefore includes exactly the nodes whose interval still covers tin[s].",
        "By interval containment, the nodes covering tin[s] are precisely the ancestors of s together with s itself, which is the root-to-s path. So one prefix query answers a path query even though the underlying array knows nothing about paths.",
        "An update is symmetric: push the delta x - cur[s] at tin[s] and its negation at tout[s] + 1. That keeps every prefix consistent in O(log n) without touching the rest of the subtree, which is the whole point - a naive 'add delta to the whole subtree range' formulation would need range-update range-query machinery.",
        "The wrong instinct is to reach for heavy-light decomposition. HLD is required for arbitrary u-to-v path queries, but a path that always starts at the root is exactly what the entry/exit difference trick already handles.",
        "Time: O(n log n) to build and O(log n) per operation. Space: O(n).",
      ],
    },
    {
      name: "Counting Paths",
      difficulty: "Medium",
      variation: "Path add, point read - the LCA difference trick",
      link: "https://cses.fi/problemset/task/1136",
      question: [
        "You are given a tree of n nodes rooted at node 1, and m paths. Each path is given by its two endpoints a and b and covers every node on the unique route between them, endpoints included. For each node, print how many of the m paths pass through it.",
        "The input gives n and m, then the n-1 edges, then the m endpoint pairs.",
        "Example 1:\nInput:\n5 3\n1 2\n1 3\n3 4\n3 5\n3 5\n1 5\n2 4\nOutput: 2 1 3 1 2\nExplanation: Path 3-5 covers {3,5}. Path 1-5 covers {1,3,5}. Path 2-4 covers {2,1,3,4}. Counting per node: node 1 is on two paths, node 2 on one, node 3 on all three, node 4 on one, node 5 on two.",
        "Example 2:\nInput:\n3 2\n1 2\n2 3\n1 1\n2 3\nOutput: 1 1 1\nExplanation: The first path has both endpoints at node 1, so it covers only node 1. The second covers {2,3}.",
        "Constraints:\n- 1 <= n, m <= 2 * 10^5\n- 1 <= a, b <= n (a may equal b)",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<vector<int>> adj(n + 1);
    for (int i = 0; i < n - 1; i++) {
        int a, b;
        cin >> a >> b;
        adj[a].push_back(b);
        adj[b].push_back(a);
    }
    int LG = 1;
    while ((1 << LG) < n) LG++;
    LG++;
    vector<int> dep(n + 1, 0), order, it(n + 1, 0), st;
    vector<vector<int>> up(LG, vector<int>(n + 1, 0));
    order.reserve(n);
    st.push_back(1);
    order.push_back(1);                 // nodes in entry order
    while (!st.empty()) {
        int u = st.back();
        if (it[u] < (int)adj[u].size()) {
            int v = adj[u][it[u]++];
            if (v == up[0][u]) continue;
            up[0][v] = u;
            dep[v] = dep[u] + 1;
            order.push_back(v);
            st.push_back(v);
        } else st.pop_back();
    }
    for (int k = 1; k < LG; k++)
        for (int v = 1; v <= n; v++) up[k][v] = up[k - 1][up[k - 1][v]];
    auto lca = [&](int a, int b) {
        if (dep[a] < dep[b]) swap(a, b);
        int diff = dep[a] - dep[b];
        for (int k = 0; k < LG; k++) if (diff >> k & 1) a = up[k][a];
        if (a == b) return a;
        for (int k = LG - 1; k >= 0; k--)
            if (up[k][a] != up[k][b]) { a = up[k][a]; b = up[k][b]; }
        return up[0][a];
    };
    vector<long long> diff(n + 1, 0);
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        int l = lca(a, b);
        diff[a]++;
        diff[b]++;
        diff[l]--;                                  // the LCA was counted twice
        if (up[0][l]) diff[up[0][l]]--;             // stop the contribution above the LCA
    }
    // Accumulate children into parents by walking the entry order backwards.
    for (int i = (int)order.size() - 1; i >= 1; i--) diff[up[0][order[i]]] += diff[order[i]];
    for (int i = 1; i <= n; i++) cout << diff[i] << " \\n"[i == n];
    return 0;
}`,
      explanation: [
        "Define f(v) as the sum of the difference marks over the whole subtree of v. If a path a-b contributes +1 at a and +1 at b, then f(v) counts the path once for every endpoint sitting below v - which is exactly what we want on the two downward legs, but it double counts at the LCA and keeps leaking upward past it.",
        "Fixing that needs two corrections: -1 at the LCA cancels the double count there, and -1 at the parent of the LCA makes the total contribution of this path zero for every strict ancestor, so it stops climbing. Those four marks make f(v) equal the number of paths through v for every v at once.",
        "The accumulation itself is where the tour matters: iterating the entry order backwards guarantees a node is processed only after all of its descendants, so a single reverse loop replaces a recursive post-order DFS and cannot overflow the stack.",
        "The degenerate a = b case works without special handling: two +1 marks at a, one -1 at the LCA which is a itself, and one -1 at its parent, netting +1 at a and 0 above.",
        "The tempting wrong approach is to walk each path node by node. The total length of m paths can be 4 * 10^10 nodes, so the marks-plus-one-sweep formulation is not an optimisation but the only feasible shape.",
        "Time: O((n + m) log n), dominated by the binary-lifting LCA. Space: O(n log n).",
      ],
    },
    {
      name: "Height of Binary Tree After Subtree Removal Queries",
      difficulty: "Hard",
      variation: "Prefix and suffix maxima around a subtree range",
      link: "https://leetcode.com/problems/height-of-binary-tree-after-subtree-removal-queries/",
      question: [
        "You are given the root of a binary tree with n nodes whose values are distinct, and an array queries. For each queries[i], remove the subtree rooted at the node whose value equals queries[i] and return the height of the remaining tree, where height is the number of edges on the longest root-to-leaf path. The queries are independent: the tree is restored to its original state before each one. It is guaranteed that no query removes the root.",
        "Example 1:\nInput: root = [5,8,9,2,1,3,7,4,6], queries = [3,2,4,8]\nOutput: [3,2,3,2]\nExplanation: Depths are 5 at 0, then 8 and 9 at 1, then 2, 1, 3, 7 at 2, then 4 and 6 at 3. Removing leaf 3 leaves 4 and 6 at depth 3, so the height is 3. Removing 2 also removes 4 and 6, leaving a maximum depth of 2. Removing leaf 4 still leaves 6 at depth 3. Removing 8 removes 2, 1, 4 and 6, leaving only 5, 9, 3, 7 with a maximum depth of 2.",
        "Example 2:\nInput: root = [1,3,4,2,null,6,5,null,null,null,null,null,7], queries = [4]\nOutput: [2]\nExplanation: The tree has 1 at depth 0, then 3 and 4 at depth 1, then 2, 6 and 5 at depth 2, then 7 at depth 3. Removing 4 removes 6, 5 and 7 as well, so what remains is 1, 3 and 2 with height 2.",
        "Constraints:\n- 2 <= n <= 10^5\n- 1 <= Node.val <= n and all values are distinct\n- 1 <= queries.length <= min(n, 10^4)",
      ],
      code: `vector<int> treeQueries(TreeNode* root, vector<int>& queries) {
    unordered_map<int,int> tin, tout;
    vector<int> dep;                    // depth of the node at each tour position
    int timer = 0;
    function<void(TreeNode*,int)> dfs = [&](TreeNode* node, int d) {
        tin[node->val] = timer++;
        dep.push_back(d);
        if (node->left) dfs(node->left, d + 1);
        if (node->right) dfs(node->right, d + 1);
        tout[node->val] = timer - 1;
    };
    dfs(root, 0);
    int m = dep.size();
    vector<int> pre(m + 2, -1), suf(m + 2, -1);
    for (int i = 0; i < m; i++) pre[i + 1] = max(pre[i], dep[i]);   // pre[i] = max depth over positions < i
    for (int i = m - 1; i >= 0; i--) suf[i] = max(suf[i + 1], dep[i]);
    vector<int> ans;
    ans.reserve(queries.size());
    for (int q : queries) {
        int l = tin[q], r = tout[q];
        ans.push_back(max(pre[l], suf[r + 1]));   // everything outside [l, r] survives
    }
    return ans;
}`,
      explanation: [
        "Removing a subtree removes exactly one contiguous block [tin[x], tout[x]] of the flattened tree and nothing else. So the height afterwards is the maximum depth over the complement of that block, which is a prefix and a suffix of the tour.",
        "Precompute prefix maxima and suffix maxima of the depth array once and every query becomes max(pre[l], suf[r+1]) in constant time. The root is never removed, so the complement is never empty and the sentinel -1 is never returned.",
        "The popular alternative is to compute, for each depth level, the two largest depths reachable through different children, then answer each query from the level of the removed node. It works, but it needs careful tie handling; the tour formulation has no cases at all because 'outside the interval' is literally the surviving set.",
        "The trap is answering each query with a fresh DFS: 10^4 queries over 10^5 nodes is 10^9 node visits. Another trap is treating height as node count - the problem counts edges, so a single remaining root has height 0.",
        "Time: O(n + q) after the single tour. Space: O(n).",
      ],
    },
    {
      name: "Propagating tree",
      difficulty: "Hard",
      variation: "Alternating-sign subtree update, split by depth parity",
      link: "https://codeforces.com/problemset/problem/383/C",
      question: [
        "You are given a tree of n vertices rooted at vertex 1, where vertex i holds an initial value a_i. The tree is odd: whenever a value val is added to a vertex x, the value -val is added to all children of x, then +val to all grandchildren, and so on with alternating sign down the whole subtree. Process m operations: '1 x val' performs that propagating addition starting at x, and '2 x' prints the current value of vertex x.",
        "Example 1:\nInput:\n5 5\n1 2 1 1 2\n1 2\n1 3\n2 4\n2 5\n1 2 3\n1 1 2\n2 1\n2 2\n2 4\nOutput:\n3\n3\n0\nExplanation: Vertex 1 has children 2 and 3, and vertex 2 has children 4 and 5. The first operation adds 3 to vertex 2 and -3 to vertices 4 and 5, giving values 1, 5, 1, -2, -1. The second adds 2 to vertex 1, -2 to vertices 2 and 3, and +2 to vertices 4 and 5, giving 3, 3, -1, 0, 1. The three reads then print 3, 3 and 0.",
        "Example 2:\nInput:\n3 3\n0 0 0\n1 2\n2 3\n1 1 5\n2 2\n2 3\nOutput:\n-5\n5\nExplanation: On the path 1-2-3, adding 5 at vertex 1 gives -5 at vertex 2 and +5 at vertex 3.",
        "Constraints:\n- 1 <= n <= 2 * 10^5\n- 1 <= m <= 2 * 10^5\n- the absolute value of a_i is at most 1000, and 1 <= val <= 1000",
      ],
      code: `int n;
vector<long long> bitEven, bitOdd;

void addTo(vector<long long>& b, int i, long long v) {
    for (++i; i <= n + 1; i += i & -i) b[i] += v;
}
long long prefOf(vector<long long>& b, int i) {
    long long s = 0;
    for (++i; i > 0; i -= i & -i) s += b[i];
    return s;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int m;
    cin >> n >> m;
    vector<long long> a(n + 1);
    for (int i = 1; i <= n; i++) cin >> a[i];
    vector<vector<int>> adj(n + 1);
    for (int i = 0; i < n - 1; i++) {
        int x, y;
        cin >> x >> y;
        adj[x].push_back(y);
        adj[y].push_back(x);
    }
    vector<int> tin(n + 1), tout(n + 1), par(n + 1, 0), dep(n + 1, 0), it(n + 1, 0), st;
    int timer = 0;
    st.push_back(1);
    tin[1] = timer++;
    while (!st.empty()) {
        int u = st.back();
        if (it[u] < (int)adj[u].size()) {
            int v = adj[u][it[u]++];
            if (v == par[u]) continue;
            par[v] = u;
            dep[v] = dep[u] + 1;
            tin[v] = timer++;
            st.push_back(v);
        } else {
            tout[u] = timer - 1;
            st.pop_back();
        }
    }
    bitEven.assign(n + 3, 0);
    bitOdd.assign(n + 3, 0);
    while (m--) {
        int type, x;
        cin >> type >> x;
        int p = dep[x] & 1;
        vector<long long>& same = p ? bitOdd : bitEven;
        vector<long long>& other = p ? bitEven : bitOdd;
        if (type == 1) {
            long long val;
            cin >> val;
            // Range add over the subtree, filed under the parity of x.
            addTo(same, tin[x], val);
            addTo(same, tout[x] + 1, -val);
        } else {
            // Same parity as the update root means +val, opposite parity means -val.
            cout << a[x] + prefOf(same, tin[x]) - prefOf(other, tin[x]) << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "The alternating sign is a function of one thing only: the parity of the distance from x down to the target. Since the target is in the subtree of x, that distance is dep[target] - dep[x], so the sign is +1 when the two depths share a parity and -1 otherwise.",
        "That means the sign never depends on the shape of the path, only on two parities, so the operation splits cleanly into two independent range adds. File the update under the parity of x, over the range [tin[x], tout[x]], in a Fenwick tree used as a difference array.",
        "Reading vertex u then means: take the total of the updates recorded under u's own parity and covering position tin[u], subtract the total recorded under the opposite parity, and add the initial a[u]. Both tallies are prefix sums, so each read is two O(log n) queries.",
        "The wrong-but-tempting approach is to propagate the value down the subtree per operation, or to store a single signed value and try to flip signs during a lazy push - the second fails because a lazy tag would need to know the parity of every leaf it eventually reaches. Splitting by parity up front removes the problem instead of managing it.",
        "Values stay small individually but 2 * 10^5 updates of 1000 stacking on one vertex reaches 2 * 10^8, which fits in an int; using long long anyway costs nothing and removes the question.",
        "Time: O((n + m) log n). Space: O(n).",
      ],
    },
    {
      name: "Water Tree",
      difficulty: "Hard",
      variation: "Subtree fill versus path-to-root empty, resolved by timestamps",
      link: "https://codeforces.com/problemset/problem/343/D",
      question: [
        "Mad scientist Mike has a tree of n vertices rooted at vertex 1; every vertex is a vessel that is initially empty. Process q operations of three kinds. '1 v' fills vertex v and every vertex in its subtree with water. '2 v' empties vertex v and every ancestor of v up to the root. '3 v' prints 1 if vertex v currently contains water and 0 otherwise.",
        "Example 1:\nInput:\n5\n1 2\n5 1\n2 3\n4 2\n12\n1 1\n2 3\n3 1\n3 2\n3 3\n3 4\n1 2\n2 4\n3 1\n3 3\n3 4\n3 5\nOutput:\n0\n0\n0\n1\n0\n1\n0\n1\nExplanation: Vertex 1 has children 2 and 5, and vertex 2 has children 3 and 4. Filling the root fills everything; emptying vertex 3 also empties 2 and 1, so the first three reads are 0 while vertex 4 is still full. Filling the subtree of 2 refills 2, 3 and 4; emptying vertex 4 then also empties 2 and 1. At that point vertex 1 is empty, vertex 3 is full, vertex 4 is empty and vertex 5 is still full from the very first fill.",
        "Example 2:\nInput:\n3\n1 2\n2 3\n4\n1 2\n3 3\n2 3\n3 2\nOutput:\n1\n0\nExplanation: Filling the subtree of 2 on the path 1-2-3 fills vertices 2 and 3, so vertex 3 reads 1. Emptying vertex 3 also empties its ancestors 2 and 1, so vertex 2 then reads 0.",
        "Constraints:\n- 1 <= n <= 5 * 10^5\n- 1 <= q <= 5 * 10^5",
      ],
      code: `int n;
vector<int> tagFill, segEmpty;

// Tree 1: assign a timestamp over a range, point query the latest one covering a position.
void assignFill(int node, int l, int r, int ql, int qr, int t) {
    if (qr < l || r < ql) return;
    if (ql <= l && r <= qr) { tagFill[node] = t; return; }
    int mid = (l + r) / 2;
    assignFill(2 * node, l, mid, ql, qr, t);
    assignFill(2 * node + 1, mid + 1, r, ql, qr, t);
}
int queryFill(int node, int l, int r, int pos) {
    if (l == r) return tagFill[node];
    int mid = (l + r) / 2;
    int sub = pos <= mid ? queryFill(2 * node, l, mid, pos)
                         : queryFill(2 * node + 1, mid + 1, r, pos);
    return max(tagFill[node], sub);   // tags never need pushing: timestamps only grow
}
// Tree 2: point assign, range max - the latest empty anywhere inside a subtree.
void setEmpty(int node, int l, int r, int pos, int t) {
    if (l == r) { segEmpty[node] = t; return; }
    int mid = (l + r) / 2;
    if (pos <= mid) setEmpty(2 * node, l, mid, pos, t);
    else setEmpty(2 * node + 1, mid + 1, r, pos, t);
    segEmpty[node] = max(segEmpty[2 * node], segEmpty[2 * node + 1]);
}
int queryEmpty(int node, int l, int r, int ql, int qr) {
    if (qr < l || r < ql) return 0;
    if (ql <= l && r <= qr) return segEmpty[node];
    int mid = (l + r) / 2;
    return max(queryEmpty(2 * node, l, mid, ql, qr),
               queryEmpty(2 * node + 1, mid + 1, r, ql, qr));
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n;
    vector<vector<int>> adj(n + 1);
    for (int i = 0; i < n - 1; i++) {
        int a, b;
        cin >> a >> b;
        adj[a].push_back(b);
        adj[b].push_back(a);
    }
    vector<int> tin(n + 1), tout(n + 1), par(n + 1, 0), it(n + 1, 0), st;
    int timer = 0;
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
    tagFill.assign(4 * n, 0);
    segEmpty.assign(4 * n, 0);
    int q;
    cin >> q;
    for (int step = 1; step <= q; step++) {
        int type, v;
        cin >> type >> v;
        if (type == 1) assignFill(1, 0, n - 1, tin[v], tout[v], step);
        else if (type == 2) setEmpty(1, 0, n - 1, tin[v], step);
        else {
            int lastFill = queryFill(1, 0, n - 1, tin[v]);
            int lastEmpty = queryEmpty(1, 0, n - 1, tin[v], tout[v]);
            cout << (lastFill > lastEmpty ? 1 : 0) << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "Do not try to maintain the boolean state directly. Instead ask, for a read on v, which was more recent: the last fill that reached v or the last empty that reached v. A fill of w reaches v exactly when w is an ancestor of v or v itself; an empty of u reaches v exactly when v is an ancestor of u or u itself, that is when u lies in the subtree of v.",
        "Both of those are subtree conditions on the tour, just pointing in opposite directions. Fills are recorded by assigning the operation index over the range [tin[w], tout[w]] and read with a point query, so the answer is the latest fill covering v. Empties are recorded as a point value at tin[u] and read with a range maximum over [tin[v], tout[v]], so the answer is the latest empty inside v's subtree. v holds water iff lastFill > lastEmpty.",
        "The assign tree needs no lazy propagation at all, which is the pleasant surprise: because operation indices only increase, the newest tag covering a position is also the largest, so taking the maximum of the tags along the root-to-leaf path is already the correct answer.",
        "The seductive wrong solution is a single segment tree of zeros and ones where a fill range-assigns 1 and an empty writes a single 0 at tin[v], answering a read with the minimum over the subtree. It matches the sample and then breaks: a later fill of a strict descendant overwrites the 0 that recorded the empty, resurrecting ancestors that should still be dry. Stress-test that variant against a brute force and it fails within a handful of random cases.",
        "The other trap is reaching for heavy-light decomposition to assign along the path to the root. It works but is far heavier than needed, since the timestamp reformulation turns both operation kinds into subtree operations.",
        "Time: O((n + q) log n). Space: O(n).",
      ],
    },
    {
      name: "New Year Tree",
      difficulty: "Hard",
      variation: "Subtree assign plus distinct-count, bitmask over the tour",
      link: "https://codeforces.com/problemset/problem/620/E",
      question: [
        "You are given a tree of n vertices rooted at vertex 1. Vertex i initially has colour c_i, and colours are integers between 1 and 60. Process m queries of two kinds: '1 v c' repaints every vertex in the subtree of v (including v) with colour c, and '2 v' prints the number of distinct colours currently present in the subtree of v.",
        "Example 1:\nInput:\n7 10\n1 1 1 1 1 1 1\n1 2\n1 3\n1 4\n3 5\n3 6\n3 7\n1 3 2\n2 1\n1 4 3\n2 1\n1 2 5\n2 1\n1 6 4\n2 1\n2 2\n2 3\nOutput:\n2\n3\n4\n5\n1\n2\nExplanation: Vertex 1 has children 2, 3 and 4, and vertex 3 has children 5, 6 and 7. After painting the subtree of 3 with colour 2 the whole tree shows colours 1 and 2. Painting vertex 4 with 3 adds a third colour, painting vertex 2 with 5 a fourth, and painting vertex 6 with 4 a fifth. The subtree of vertex 2 is just itself, so one colour. The subtree of vertex 3 holds colours 2, 2, 4 and 2, so two distinct.",
        "Example 2:\nInput:\n3 3\n1 2 3\n1 2\n2 3\n2 1\n1 1 7\n2 1\nOutput:\n3\n1\nExplanation: The path 1-2-3 starts with three distinct colours; repainting the whole tree with colour 7 leaves one.",
        "Constraints:\n- 1 <= n, m <= 4 * 10^5\n- 1 <= c_i <= 60 and 1 <= c <= 60 in queries",
      ],
      code: `int n;
vector<unsigned long long> seg;
vector<int> lz, flatColour;

void build(int node, int l, int r) {
    lz[node] = 0;
    if (l == r) { seg[node] = 1ULL << flatColour[l]; return; }
    int mid = (l + r) / 2;
    build(2 * node, l, mid);
    build(2 * node + 1, mid + 1, r);
    seg[node] = seg[2 * node] | seg[2 * node + 1];
}
void applyC(int node, int c) { seg[node] = 1ULL << c; lz[node] = c; }
void push(int node) {
    if (lz[node]) {
        applyC(2 * node, lz[node]);
        applyC(2 * node + 1, lz[node]);
        lz[node] = 0;
    }
}
void paint(int node, int l, int r, int ql, int qr, int c) {
    if (qr < l || r < ql) return;
    if (ql <= l && r <= qr) { applyC(node, c); return; }
    push(node);
    int mid = (l + r) / 2;
    paint(2 * node, l, mid, ql, qr, c);
    paint(2 * node + 1, mid + 1, r, ql, qr, c);
    seg[node] = seg[2 * node] | seg[2 * node + 1];
}
unsigned long long ask(int node, int l, int r, int ql, int qr) {
    if (qr < l || r < ql) return 0;
    if (ql <= l && r <= qr) return seg[node];
    push(node);
    int mid = (l + r) / 2;
    return ask(2 * node, l, mid, ql, qr) | ask(2 * node + 1, mid + 1, r, ql, qr);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int m;
    cin >> n >> m;
    vector<int> col(n + 1);
    for (int i = 1; i <= n; i++) cin >> col[i];
    vector<vector<int>> adj(n + 1);
    for (int i = 0; i < n - 1; i++) {
        int a, b;
        cin >> a >> b;
        adj[a].push_back(b);
        adj[b].push_back(a);
    }
    vector<int> tin(n + 1), tout(n + 1), par(n + 1, 0), it(n + 1, 0), st;
    int timer = 0;
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
    flatColour.assign(n, 0);
    for (int v = 1; v <= n; v++) flatColour[tin[v]] = col[v];
    seg.assign(4 * n, 0);
    lz.assign(4 * n, 0);
    build(1, 0, n - 1);
    while (m--) {
        int type, v;
        cin >> type >> v;
        if (type == 1) {
            int c;
            cin >> c;
            paint(1, 0, n - 1, tin[v], tout[v], c);
        } else {
            cout << __builtin_popcountll(ask(1, 0, n - 1, tin[v], tout[v])) << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "The tour reduces both operations to ranges: repaint a subtree is a range assign, count distinct colours in a subtree is a range 'set union'. The union is the hard-looking part, but at most 60 colours exist, so a set of colours fits in one unsigned 64-bit word and the union is a bitwise OR.",
        "That gives a segment tree whose node value is a 64-bit mask, whose merge is OR, and whose lazy tag is 'this whole range is a single colour c', applied as mask = 1 << c. Distinct count is then popcount of the queried mask, a single instruction.",
        "The assign tag is idempotent and totally overwrites whatever was below it, so composition is trivial - a newer tag simply replaces the older one, and there is no need to reason about tag order the way an additive lazy would require. Using 0 as the 'no tag' sentinel is safe because colours start at 1.",
        "The trap is trying to maintain a count of distinct colours as the node value instead of the set. Counts do not merge: a left child with 3 colours and a right child with 3 colours may have anywhere from 3 to 6 between them. The set must be carried, and the 60-colour bound is precisely the hint that a bitmask is intended.",
        "Shift with 1ULL, not 1: colour 60 needs bit 60, and shifting a 32-bit int by 60 is undefined behaviour that typically returns garbage rather than failing loudly.",
        "Time: O((n + m) log n) with O(1) merges. Space: O(n).",
      ],
    },
  ],
};
