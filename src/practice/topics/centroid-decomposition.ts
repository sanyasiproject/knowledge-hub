import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Centroid of a Tree",
      difficulty: "Easy",
      variation: "Locating the centroid, the building block",
      question: [
        "You are given a tree with n vertices numbered 0..n-1 as an adjacency list. A centroid is a vertex whose removal splits the tree into connected components that each contain at most n/2 vertices. Every tree has one or two centroids. Return the index of a centroid; if there are two, return the smaller index.",
        "Example 1:\nInput: n = 5, adj = [[1], [0,2], [1,3], [2,4], [3]]\nOutput: 2\nExplanation: The tree is the path 0-1-2-3-4. Removing vertex 2 leaves the components {0,1} and {3,4}, both of size 2, and 2 <= 5/2. Removing vertex 1 would leave {2,3,4} of size 3, which is too big.",
        "Example 2:\nInput: n = 4, adj = [[1], [0,2,3], [1], [1]]\nOutput: 1\nExplanation: Removing the hub 1 leaves three singleton components.",
        "Constraints:\n- 1 <= n <= 10^5\n- adj describes a tree, so it has exactly n-1 edges and is connected",
      ],
      code: `int findCentroid(int n, vector<vector<int>>& adj) {
    vector<int> sz(n, 1), best(n, 0), par(n, -1), order;
    order.reserve(n);
    vector<char> vis(n, 0);
    vector<int> st{0};
    vis[0] = 1;
    while (!st.empty()) {                 // iterative DFS, avoids deep recursion
        int u = st.back(); st.pop_back();
        order.push_back(u);
        for (int v : adj[u]) if (!vis[v]) { vis[v] = 1; par[v] = u; st.push_back(v); }
    }
    for (int i = n - 1; i >= 1; i--) {    // children come after parents in order
        int u = order[i];
        sz[par[u]] += sz[u];
        best[par[u]] = max(best[par[u]], sz[u]);   // largest child component
    }
    int ans = 0;
    for (int u = 0; u < n; u++) {
        best[u] = max(best[u], n - sz[u]);         // the component above u
        if (best[u] < best[ans]) ans = u;          // strict <, so ties keep the smaller index
    }
    return ans;
}`,
      explanation: [
        "Root the tree anywhere and compute subtree sizes. Deleting vertex u produces one component per child of u, of size sz[child], plus one component of size n - sz[u] hanging above u. The vertex minimising the largest of those pieces is a centroid.",
        "Why the minimum is always at most n/2: walk from the root and repeatedly step into the child whose subtree holds more than n/2 vertices. There is at most one such child, so the walk is deterministic, and it must stop, because when you step into a child of size s > n/2 the component above it has size n - s < n/2. The stopping vertex has every piece at most n/2.",
        "The tempting shortcut is to pick the vertex of maximum degree, or the middle of the diameter. Neither is the centroid: a caterpillar with one huge leg has its hub as the maximum-degree vertex but the balance point lies inside the leg, and the diameter middle is the tree centre, a different object entirely.",
        "This single scan is the primitive that every later problem calls once per recursive component, so keep it O(component size) and never O(n) per call - that is what makes the whole decomposition O(n log n).",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Minimum Height Trees",
      difficulty: "Medium",
      variation: "Tree centre by leaf peeling - centre vs centroid",
      link: "https://leetcode.com/problems/minimum-height-trees/",
      question: [
        "A tree is an undirected graph with n nodes labelled 0..n-1 and exactly n-1 edges. Given n and the edge list, you may root the tree at any node. The result is a rooted tree whose height is the number of edges on the longest downward path from the root. A node that minimises this height is called a minimum height tree root. Return the list of all such labels in any order. It is guaranteed that there are at most two of them.",
        "Example 1:\nInput: n = 4, edges = [[1,0],[1,2],[1,3]]\nOutput: [1]\nExplanation: Rooting at 1 gives height 1; rooting at any leaf gives height 2.",
        "Example 2:\nInput: n = 6, edges = [[3,0],[3,1],[3,2],[3,4],[5,4]]\nOutput: [3,4]\nExplanation: The longest path is 0-3-4-5 with 3 edges, so its two middle nodes 3 and 4 both give height 2.",
        "Constraints:\n- 1 <= n <= 2 * 10^4\n- edges.length == n - 1\n- the input is a valid tree with no duplicate edges",
      ],
      code: `vector<int> findMinHeightTrees(int n, vector<vector<int>>& edges) {
    if (n == 1) return {0};
    vector<vector<int>> adj(n);
    vector<int> deg(n, 0);
    for (auto& e : edges) {
        adj[e[0]].push_back(e[1]);
        adj[e[1]].push_back(e[0]);
        deg[e[0]]++; deg[e[1]]++;
    }
    vector<int> leaves;
    for (int i = 0; i < n; i++) if (deg[i] == 1) leaves.push_back(i);
    int remaining = n;
    while (remaining > 2) {                 // peel whole layers of leaves at once
        remaining -= (int)leaves.size();
        vector<int> next;
        for (int u : leaves)
            for (int v : adj[u])
                if (--deg[v] == 1) next.push_back(v);   // v just became a leaf
        leaves = std::move(next);
    }
    return leaves;                          // 1 or 2 survivors: the tree centre
}`,
      explanation: [
        "The height of the tree rooted at v is the eccentricity of v, and the minimisers of eccentricity form the centre of the tree, which is the middle vertex (or the two middle vertices) of any diameter. So the answer set has size 1 or 2.",
        "Peeling leaves layer by layer shrinks every branch by one from the outside simultaneously, so the diameter drops by exactly two per round. Stopping when one or two vertices remain leaves precisely the middle of the diameter.",
        "This problem is here as a deliberate contrast. The centre balances distances; the centroid balances subtree sizes, and they can be far apart - hang a long path off one leaf of a big star and the centre slides into the path while the centroid stays near the star. Centroid decomposition needs the size-balanced vertex, because only the size guarantee bounds the recursion depth at O(log n). Splitting on the centre gives no such bound.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Ciel the Commander",
      difficulty: "Medium",
      variation: "Building the centroid tree, labelling by level",
      link: "https://codeforces.com/problemset/problem/321/C",
      question: [
        "A company has n employees numbered 1..n connected by n-1 two-way channels forming a tree. Each employee must be given a rank, a letter from 'A' to 'Z', where 'A' is the highest rank. The assignment is valid when, for any two distinct employees x and y of the same rank, the path from x to y passes through some employee of strictly higher rank. Output any valid assignment of ranks as n letters, or print 'Impossible!' if none exists.",
        "Example 1:\nInput:\n4\n1 2\n1 3\n1 4\nOutput: A B B B\nExplanation: Employees 2, 3 and 4 all hold rank B, but every path between them runs through employee 1, who holds the higher rank A.",
        "Example 2:\nInput:\n4\n1 2\n2 3\n3 4\nOutput: B A B C\nExplanation: The centroid of the path is 2, so it takes A. Removing it leaves {1} and {3,4}; 1 takes B, the centroid 3 of the second piece takes B, and 4 takes C. Any valid labelling is accepted, so 'A B C D' would also be correct.",
        "Constraints:\n- 2 <= n <= 10^5\n- the channels form a tree",
      ],
      code: `int n;
vector<vector<int>> adj;
vector<int> sz;
vector<char> removed, label;

int calcSize(int u, int p) {
    sz[u] = 1;
    for (int v : adj[u]) if (v != p && !removed[v]) sz[u] += calcSize(v, u);
    return sz[u];
}

int findCentroid(int u, int p, int tot) {
    for (int v : adj[u])
        if (v != p && !removed[v] && sz[v] * 2 > tot) return findCentroid(v, u, tot);
    return u;                                  // no child holds more than half
}

void decompose(int u, int depth) {
    int tot = calcSize(u, -1);
    int c = findCentroid(u, -1, tot);
    label[c] = 'A' + depth;                    // depth in the centroid tree
    removed[c] = 1;
    for (int v : adj[c]) if (!removed[v]) decompose(v, depth + 1);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n;
    adj.assign(n + 1, {});
    sz.assign(n + 1, 0);
    removed.assign(n + 1, 0);
    label.assign(n + 1, '?');
    for (int i = 0; i < n - 1; i++) {
        int a, b; cin >> a >> b;
        adj[a].push_back(b);
        adj[b].push_back(a);
    }
    decompose(1, 0);
    for (int i = 1; i <= n; i++) cout << label[i] << " \\n"[i == n];
    return 0;
}`,
      explanation: [
        "Label each vertex with its depth in the centroid tree: the centroid of the whole tree gets 'A', the centroids of the pieces left behind get 'B', and so on. The condition then holds automatically, because two vertices with the same label sit in different pieces of some earlier centroid, and the path between them must cross that centroid, whose label is strictly higher.",
        "The removal guarantee bounds the depth. Each piece has at most half the vertices of its parent piece, so after 17 levels the pieces are empty for n <= 10^5. Since 17 < 26 the letters never run out and 'Impossible!' is unreachable under these constraints - it exists in the statement only as a trap for solutions that split on the root or on a high-degree vertex, which can need n levels on a path.",
        "This is exactly the centroid tree: decompose creates the parent-child edges implicitly by recursing into each leftover piece. Later problems keep those edges explicitly, because the key property is that any vertex has only O(log n) centroid ancestors, and the path between any two vertices passes through their lowest common centroid ancestor.",
        "calcSize must be recomputed inside every recursive call and must only walk the current piece, which the removed flags enforce. Reusing global sizes computed once at the start is the classic bug: after a centroid is deleted the sizes of the surviving pieces are wrong and findCentroid drifts off balance.",
        "Time: O(n log n) - each of the O(log n) levels touches every surviving vertex once. Space: O(n).",
      ],
    },
    {
      name: "Distance in Tree",
      difficulty: "Medium",
      variation: "Counting unordered pairs at an exact distance",
      link: "https://codeforces.com/problemset/problem/161/D",
      question: [
        "You are given a tree with n vertices numbered 1..n and an integer k. Count the number of unordered pairs of distinct vertices whose distance, measured as the number of edges on the path between them, equals exactly k.",
        "Example 1:\nInput:\n5 2\n1 2\n2 3\n3 4\n2 5\nOutput: 4\nExplanation: The pairs at distance 2 are (1,3), (1,5), (3,5) and (2,4).",
        "Example 2:\nInput:\n5 3\n1 2\n2 3\n3 4\n4 5\nOutput: 2\nExplanation: On the path 1-2-3-4-5 only (1,4) and (2,5) are three edges apart.",
        "Constraints:\n- 1 <= n <= 50000\n- 1 <= k <= 500",
      ],
      code: `int n, K;
vector<vector<int>> adj;
vector<int> sz, cnt;
vector<char> removed;
long long ans = 0;

int calcSize(int u, int p) {
    sz[u] = 1;
    for (int v : adj[u]) if (v != p && !removed[v]) sz[u] += calcSize(v, u);
    return sz[u];
}

int findCentroid(int u, int p, int tot) {
    for (int v : adj[u])
        if (v != p && !removed[v] && sz[v] * 2 > tot) return findCentroid(v, u, tot);
    return u;
}

void collect(int u, int p, int d, vector<int>& depths) {
    if (d > K) return;                        // a leg longer than k is useless
    depths.push_back(d);
    for (int v : adj[u]) if (v != p && !removed[v]) collect(v, u, d + 1, depths);
}

void decompose(int u) {
    int tot = calcSize(u, -1);
    int c = findCentroid(u, -1, tot);
    removed[c] = 1;
    cnt[0] = 1;                               // the centroid itself: a leg of length 0
    vector<int> touched{0};
    for (int v : adj[c]) {
        if (removed[v]) continue;
        vector<int> depths;
        collect(v, c, 1, depths);
        for (int d : depths) ans += cnt[K - d];        // partner sits in an earlier branch
        for (int d : depths) if (cnt[d]++ == 0) touched.push_back(d);
    }
    for (int d : touched) cnt[d] = 0;         // clear only the slots that were used
    for (int v : adj[c]) if (!removed[v]) decompose(v);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n >> K;
    adj.assign(n + 1, {});
    sz.assign(n + 1, 0);
    removed.assign(n + 1, 0);
    cnt.assign(K + 1, 0);
    for (int i = 0; i < n - 1; i++) {
        int a, b; cin >> a >> b;
        adj[a].push_back(b);
        adj[b].push_back(a);
    }
    decompose(1);
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "This is the canonical divide and conquer on trees. Every path either passes through the centroid c or lies entirely inside one of the pieces left after deleting c. Count the first kind directly and recurse for the second kind, and every path is counted in exactly one recursive call - the one whose centroid it passes through.",
        "A path through c splits into two legs meeting at c, of lengths d1 and d2 with d1 + d2 = k, and the legs must live in different branches of c. Processing branches one at a time and querying cnt[k - d] before inserting the current branch's depths enforces that automatically: cnt only ever holds depths from strictly earlier branches plus the centroid itself, so no pair is formed inside one branch and no pair is formed twice.",
        "The tempting wrong version fills cnt with the whole component first and then queries, which counts pairs whose legs lie in the same branch. Those pairs do not actually pass through c and their real distance is smaller, so the answer comes out too large. The fix is either the incremental order used here or an explicit subtraction of each branch's internal pairs.",
        "Two details keep the bound honest. collect prunes at depth k, and the reset walks a touched list instead of clearing the whole array - with k up to 500 a full clear per centroid would still pass here, but the habit is what makes the same code survive k up to n.",
        "Time: O(n log n) - the recursion has O(log n) levels and each level scans every vertex once. Space: O(n + k).",
      ],
    },
    {
      name: "Fixed-Length Paths I",
      difficulty: "Hard",
      variation: "Exact path length at scale, O(touched) reset",
      link: "https://cses.fi/problemset/task/2080",
      question: [
        "Given a tree of n nodes numbered 1..n, count the number of distinct paths that consist of exactly k edges. A path is an unordered pair of distinct nodes, so each path is counted once.",
        "Example 1:\nInput:\n5 2\n1 2\n2 3\n3 4\n3 5\nOutput: 4\nExplanation: The node pairs two edges apart are (1,3), (2,4), (2,5) and (4,5).",
        "Example 2:\nInput:\n5 2\n1 2\n1 3\n1 4\n1 5\nOutput: 6\nExplanation: In a star every two leaves are two edges apart, giving C(4,2) = 6 paths.",
        "Constraints:\n- 1 <= n <= 2 * 10^5\n- 1 <= k <= n - 1",
      ],
      code: `int n, K;
vector<vector<int>> adj;
vector<int> sz, sub;
vector<long long> cnt;
vector<char> removed;
long long ans = 0;

int calcSize(int u, int p) {
    sz[u] = 1;
    for (int v : adj[u]) if (v != p && !removed[v]) sz[u] += calcSize(v, u);
    return sz[u];
}

int findCentroid(int u, int p, int tot) {
    for (int v : adj[u])
        if (v != p && !removed[v] && sz[v] * 2 > tot) return findCentroid(v, u, tot);
    return u;
}

void collect(int u, int p, int d) {
    if (d > K) return;
    sub.push_back(d);
    for (int v : adj[u]) if (v != p && !removed[v]) collect(v, u, d + 1);
}

void decompose(int u) {
    int tot = calcSize(u, -1);
    int c = findCentroid(u, -1, tot);
    removed[c] = 1;
    vector<int> touched;
    cnt[0] = 1; touched.push_back(0);
    for (int v : adj[c]) {
        if (removed[v]) continue;
        sub.clear();
        collect(v, c, 1);
        for (int d : sub) ans += cnt[K - d];   // legs from strictly earlier branches
        for (int d : sub) {
            if (cnt[d] == 0) touched.push_back(d);
            cnt[d]++;
        }
    }
    for (int d : touched) cnt[d] = 0;          // O(touched), never O(n)
    for (int v : adj[c]) if (!removed[v]) decompose(v);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n >> K;
    adj.assign(n + 1, {});
    sz.assign(n + 1, 0);
    removed.assign(n + 1, 0);
    cnt.assign(n + 1, 0);
    for (int i = 0; i < n - 1; i++) {
        int a, b; cin >> a >> b;
        adj[a].push_back(b);
        adj[b].push_back(a);
    }
    decompose(1);
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "Same decomposition as the smaller counting problem, but now k can be as large as n, which changes the engineering. The depth-count array has to be sized n+1, and there are n centroids, so clearing it wholesale per centroid would be O(n^2). Recording the indices actually written and zeroing only those makes the reset proportional to the work already done, which is the only way the O(n log n) bound survives.",
        "The answer can reach roughly n^2 / 2 = 2 * 10^10, so it must be 64-bit. An int accumulator silently overflows on a star or a broom-shaped tree with a moderate k.",
        "The depth prune inside collect matters for correctness of the complexity, not of the result: a leg longer than k can never be half of a valid path, and skipping its whole subtree keeps deep chains cheap.",
        "One more subtlety worth internalising: the recursion depth of the centroid tree is O(log n), but calcSize and collect still recurse along real tree edges, so on a path of 2 * 10^5 nodes the plain recursion goes 2 * 10^5 frames deep. That fits in the default stack on most judges, but converting these two to explicit stacks is the safe move when the limit is tight.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Fixed-Length Paths II",
      difficulty: "Hard",
      variation: "Length in a range, BIT over depths",
      link: "https://cses.fi/problemset/task/2081",
      question: [
        "Given a tree of n nodes numbered 1..n and two integers k1 and k2, count the number of distinct paths whose length in edges is at least k1 and at most k2.",
        "Example 1:\nInput:\n5 2 3\n1 2\n2 3\n3 4\n3 5\nOutput: 6\nExplanation: The qualifying pairs are (1,3) and (2,4), (2,5), (4,5) at distance 2, plus (1,4) and (1,5) at distance 3.",
        "Example 2:\nInput:\n5 1 2\n1 2\n1 3\n1 4\n1 5\nOutput: 10\nExplanation: A star on five nodes has 4 pairs at distance 1 and 6 at distance 2, and every pair qualifies.",
        "Constraints:\n- 1 <= n <= 2 * 10^5\n- 1 <= k1 <= k2 <= n - 1",
      ],
      code: `int n, K1, K2;
vector<vector<int>> adj;
vector<int> sz, sub, bit;
vector<char> removed;
long long ans = 0;

void bitAdd(int i, int v) { for (i++; i <= n + 1; i += i & -i) bit[i] += v; }
long long bitSum(int i) { long long s = 0; for (i++; i > 0; i -= i & -i) s += bit[i]; return s; }
long long bitRange(int l, int r) {            // stored legs with length in [l, r]
    r = min(r, n);
    l = max(l, 0);
    if (l > r) return 0;
    return bitSum(r) - (l ? bitSum(l - 1) : 0);
}

int calcSize(int u, int p) {
    sz[u] = 1;
    for (int v : adj[u]) if (v != p && !removed[v]) sz[u] += calcSize(v, u);
    return sz[u];
}

int findCentroid(int u, int p, int tot) {
    for (int v : adj[u])
        if (v != p && !removed[v] && sz[v] * 2 > tot) return findCentroid(v, u, tot);
    return u;
}

void collect(int u, int p, int d) {
    if (d > K2) return;                       // longer than the upper bound is useless
    sub.push_back(d);
    for (int v : adj[u]) if (v != p && !removed[v]) collect(v, u, d + 1);
}

void decompose(int u) {
    int tot = calcSize(u, -1);
    int c = findCentroid(u, -1, tot);
    removed[c] = 1;
    vector<int> added;
    bitAdd(0, 1); added.push_back(0);         // the centroid, a leg of length 0
    for (int v : adj[c]) {
        if (removed[v]) continue;
        sub.clear();
        collect(v, c, 1);
        for (int d : sub) ans += bitRange(K1 - d, K2 - d);
        for (int d : sub) { bitAdd(d, 1); added.push_back(d); }
    }
    for (int d : added) bitAdd(d, -1);        // roll the tree back to all zeros
    for (int v : adj[c]) if (!removed[v]) decompose(v);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n >> K1 >> K2;
    adj.assign(n + 1, {});
    sz.assign(n + 1, 0);
    removed.assign(n + 1, 0);
    bit.assign(n + 3, 0);
    for (int i = 0; i < n - 1; i++) {
        int a, b; cin >> a >> b;
        adj[a].push_back(b);
        adj[b].push_back(a);
    }
    decompose(1);
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "An exact target needs one lookup, cnt[k - d]. A range target needs a sum over a window, cnt[k1 - d .. k2 - d], so the plain array becomes a Fenwick tree over leg lengths and each query is a prefix-sum difference. Everything else - centroid, branch-by-branch insertion, pairing only across branches - is unchanged.",
        "The window has to be clamped on both sides. k2 - d can exceed the largest index ever stored, and k1 - d can go negative when the current leg is already long enough on its own; clamping to [0, n] both prevents an out-of-bounds read and keeps the count correct, since a leg of length 0 is the centroid itself and legitimately completes a path.",
        "Undoing the inserts by re-adding -1 at the same positions is the range analogue of the touched list. Rebuilding or clearing the whole Fenwick tree per centroid would add O(n) per centroid and push the total to O(n^2).",
        "An alternative that avoids the log factor: gather the whole component's depths, sort them, and sweep with two pointers, subtracting the same-branch pairs computed the same way. That is O(n log n) overall rather than O(n log^2 n), but it needs the subtraction step done carefully and is easier to get wrong.",
        "Time: O(n log^2 n). Space: O(n).",
      ],
    },
    {
      name: "Race",
      difficulty: "Hard",
      variation: "Weighted path of exact total, minimise edge count",
      question: [
        "You are given a tree with N nodes numbered 0..N-1, described by an array H where H[i][0] and H[i][1] are the endpoints of edge i, and an array L where L[i] is that edge's length. Given an integer K, find a path whose total length is exactly K and which uses as few edges as possible, and return that number of edges. Return -1 if no path has total length exactly K.",
        "Example 1:\nInput: N = 4, K = 3, H = [[0,1],[1,2],[1,3]], L = [1,2,4]\nOutput: 2\nExplanation: The path 0-1-2 has length 1 + 2 = 3 and uses 2 edges. No single edge has length 3.",
        "Example 2:\nInput: N = 3, K = 5, H = [[0,1],[1,2]], L = [2,2]\nOutput: -1\nExplanation: The only available lengths are 2, 2 and 4, so 5 is unreachable.",
        "Constraints:\n- 1 <= N <= 2 * 10^5\n- 1 <= K <= 10^6\n- 1 <= L[i] <= 10^6",
      ],
      code: `const int INF = 1e9;
int n, K, ans;
vector<vector<pair<int,int>>> adj;            // (neighbour, edge length)
vector<int> sz, bestEdges;                    // bestEdges[w] = fewest edges for weight w
vector<char> removed;
vector<pair<int,int>> sub;                    // (weight, edges) inside one branch

int calcSize(int u, int p) {
    sz[u] = 1;
    for (auto& [v, w] : adj[u]) if (v != p && !removed[v]) sz[u] += calcSize(v, u);
    return sz[u];
}

int findCentroid(int u, int p, int tot) {
    for (auto& [v, w] : adj[u])
        if (v != p && !removed[v] && sz[v] * 2 > tot) return findCentroid(v, u, tot);
    return u;
}

void collect(int u, int p, int dw, int de) {
    if (dw > K) return;                       // over budget, and weights are positive
    sub.push_back({dw, de});
    for (auto& [v, w] : adj[u]) if (v != p && !removed[v]) collect(v, u, dw + w, de + 1);
}

void decompose(int u) {
    int tot = calcSize(u, -1);
    int c = findCentroid(u, -1, tot);
    removed[c] = 1;
    vector<int> touched;
    bestEdges[0] = 0; touched.push_back(0);   // the centroid alone: weight 0, 0 edges
    for (auto& [v, w] : adj[c]) {
        if (removed[v]) continue;
        sub.clear();
        collect(v, c, w, 1);
        for (auto& [dw, de] : sub)
            if (bestEdges[K - dw] != INF) ans = min(ans, de + bestEdges[K - dw]);
        for (auto& [dw, de] : sub) {          // merge this branch in afterwards
            if (bestEdges[dw] == INF) touched.push_back(dw);
            bestEdges[dw] = min(bestEdges[dw], de);
        }
    }
    for (int w : touched) bestEdges[w] = INF;
    for (auto& [v, w] : adj[c]) if (!removed[v]) decompose(v);
}

int best_path(int N, int Kin, int H[][2], int L[]) {
    n = N; K = Kin; ans = INF;
    adj.assign(n, {});
    sz.assign(n, 0);
    removed.assign(n, 0);
    bestEdges.assign(K + 1, INF);
    for (int i = 0; i < n - 1; i++) {
        adj[H[i][0]].push_back({H[i][1], L[i]});
        adj[H[i][1]].push_back({H[i][0], L[i]});
    }
    decompose(0);
    return ans == INF ? -1 : ans;
}`,
      explanation: [
        "The bookkeeping now has two dimensions: paths are matched on weight but scored on edge count. So the per-centroid table is indexed by weight and stores a minimum rather than a count - bestEdges[w] is the fewest edges among legs of weight exactly w seen in earlier branches. A leg of weight dw with de edges pairs with bestEdges[K - dw].",
        "Seeding bestEdges[0] = 0 for the centroid covers paths that stop at the centroid, since a leg of weight exactly K then reads bestEdges[0] and pays no extra edges. Without that seed those paths are silently missed.",
        "Because all lengths are positive, pruning a leg once its weight exceeds K is safe and is what keeps the table lookups in range. If zero-weight edges were allowed the prune would still be safe but the table would need a min over edge counts at weight 0 as well.",
        "Note that the table is indexed by weight, not depth, so it has K + 1 = 10^6 + 1 slots while a component may hold far fewer distinct weights. Resetting it via the touched list rather than a refill is not an optimisation here, it is the difference between passing and O(n * K).",
        "Time: O(n log n) plus O(K) for the one-off table. Space: O(n + K).",
      ],
    },
    {
      name: "Xenia and Tree",
      difficulty: "Hard",
      variation: "Centroid tree as a nearest-marked-node structure",
      link: "https://codeforces.com/problemset/problem/342/E",
      question: [
        "You are given a tree with n nodes numbered 1..n. Node 1 is initially painted red and all other nodes are blue. Then m queries follow. A query '1 v' paints node v red (it may already be red). A query '2 v' asks for the minimum number of edges between node v and any currently red node; print that value. Note that the answer is 0 when v itself is red.",
        "Example 1:\nInput:\n5 4\n1 2\n2 3\n2 4\n4 5\n2 1\n2 5\n1 2\n2 5\nOutput:\n0\n3\n2\nExplanation: Node 1 is red, so the first query is 0. The distance from 5 to 1 along 5-4-2-1 is 3. After painting node 2, the distance from 5 to the nearest red node is 5-4-2, which is 2.",
        "Example 2:\nInput:\n3 3\n1 2\n2 3\n2 3\n1 3\n2 3\nOutput:\n2\n0\nExplanation: Only node 1 is red at first, and node 3 is two edges away. After node 3 is painted, its own distance is 0.",
        "Constraints:\n- 1 <= n, m <= 10^5\n- queries are of the two forms above with 1 <= v <= n",
      ],
      code: `const int INF = 1e9;
int n, LOG;
vector<vector<int>> adj, up;
vector<int> depth, sz, cpar, best;            // best[c] = closest red node inside c's part
vector<char> removed;

void rootTree(int root) {
    vector<int> st{root};
    vector<char> vis(n + 1, 0);
    vis[root] = 1; up[0][root] = root;
    while (!st.empty()) {
        int u = st.back(); st.pop_back();
        for (int k = 1; k < LOG; k++) up[k][u] = up[k - 1][up[k - 1][u]];
        for (int v : adj[u]) if (!vis[v]) { vis[v] = 1; depth[v] = depth[u] + 1; up[0][v] = u; st.push_back(v); }
    }
}

int lca(int a, int b) {
    if (depth[a] < depth[b]) swap(a, b);
    int diff = depth[a] - depth[b];
    for (int k = 0; k < LOG; k++) if (diff >> k & 1) a = up[k][a];
    if (a == b) return a;
    for (int k = LOG - 1; k >= 0; k--) if (up[k][a] != up[k][b]) { a = up[k][a]; b = up[k][b]; }
    return up[0][a];
}

int dist(int a, int b) { return depth[a] + depth[b] - 2 * depth[lca(a, b)]; }

int calcSize(int u, int p) {
    sz[u] = 1;
    for (int v : adj[u]) if (v != p && !removed[v]) sz[u] += calcSize(v, u);
    return sz[u];
}

int findCentroid(int u, int p, int tot) {
    for (int v : adj[u])
        if (v != p && !removed[v] && sz[v] * 2 > tot) return findCentroid(v, u, tot);
    return u;
}

void decompose(int u, int parent) {
    int tot = calcSize(u, -1);
    int c = findCentroid(u, -1, tot);
    cpar[c] = parent;                         // explicit centroid-tree edge
    removed[c] = 1;
    for (int v : adj[c]) if (!removed[v]) decompose(v, c);
}

void paint(int v) {
    for (int x = v; x != 0; x = cpar[x]) best[x] = min(best[x], dist(v, x));
}

int query(int v) {
    int res = INF;
    for (int x = v; x != 0; x = cpar[x]) res = min(res, best[x] + dist(v, x));
    return res;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int m;
    cin >> n >> m;
    LOG = 1;
    while ((1 << LOG) < n) LOG++;
    LOG++;
    adj.assign(n + 1, {});
    up.assign(LOG, vector<int>(n + 1, 0));
    depth.assign(n + 1, 0);
    sz.assign(n + 1, 0);
    cpar.assign(n + 1, 0);
    best.assign(n + 1, INF);
    removed.assign(n + 1, 0);
    for (int i = 0; i < n - 1; i++) {
        int a, b; cin >> a >> b;
        adj[a].push_back(b);
        adj[b].push_back(a);
    }
    rootTree(1);
    decompose(1, 0);
    paint(1);
    while (m--) {
        int t, v; cin >> t >> v;
        if (t == 1) paint(v);
        else cout << query(v) << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Here the decomposition is kept as a data structure rather than used once. Store cpar, the centroid-tree parent, so each node has at most O(log n) centroid ancestors, and the crucial fact is that for any two nodes u and v the tree path between them passes through their lowest common centroid ancestor. So every pair is representable as leg-plus-leg at some ancestor of both.",
        "Painting v updates best[x] = min over red nodes r in x's part of dist(r, x) for each of v's O(log n) centroid ancestors x. Querying v takes min over the same ancestors of best[x] + dist(v, x). The value returned is never an underestimate, because best[x] + dist(v, x) is a genuine walk length from v to some red node by the triangle inequality, and never an overestimate, because the true nearest red node r shares a lowest common centroid ancestor x with v, and at that x the sum is exactly dist(v, r).",
        "The distances must be measured in the original tree, not in the centroid tree, which is why the LCA structure is built on the real tree before decomposing. Using centroid-tree depths instead is the standard wrong turn and gives numbers that are not tree distances at all.",
        "Only the minimum needs to be stored per centroid because red is permanent - nodes are never unpainted, so a single min value can only improve. The moment un-marking is allowed, a min collapses and a multiset or heap per centroid is required.",
        "Time: O((n + m) log^2 n) - O(log n) ancestors per operation, each costing an O(log n) LCA. Space: O(n log n) for the binary lifting table.",
      ],
    },
    {
      name: "Query on a Tree V",
      difficulty: "Hard",
      variation: "Toggled marks, a multiset per centroid",
      link: "https://www.spoj.com/problems/QTREE5/",
      question: [
        "You are given a tree with n nodes numbered 1..n, where dist(a, b) is the number of edges on the path from a to b. Every node starts black. Then q instructions follow. An instruction '0 i' flips the colour of node i - black becomes white and white becomes black. An instruction '1 v' asks for the minimum dist(u, v) over all white nodes u, where u may equal v; print -1 if no node is currently white.",
        "Example 1:\nInput:\n3\n1 2\n2 3\n6\n1 1\n0 2\n1 1\n1 2\n0 2\n1 3\nOutput:\n-1\n1\n0\n-1\nExplanation: Nothing is white at first, so the answer is -1. After node 2 turns white, node 1 is one edge away and node 2 is zero. Flipping node 2 again makes everything black, so the last query is -1 again.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= q <= 10^5\n- instructions are of the two forms above with 1 <= i, v <= n",
      ],
      code: `int n, LOG;
vector<vector<int>> adj, up;
vector<int> depth, sz, cpar;
vector<char> removed, white;
vector<multiset<int>> ms;                     // ms[c] = distances from c to white nodes of its part

void rootTree(int root) {
    vector<int> st{root};
    vector<char> vis(n + 1, 0);
    vis[root] = 1; up[0][root] = root;
    while (!st.empty()) {
        int u = st.back(); st.pop_back();
        for (int k = 1; k < LOG; k++) up[k][u] = up[k - 1][up[k - 1][u]];
        for (int v : adj[u]) if (!vis[v]) { vis[v] = 1; depth[v] = depth[u] + 1; up[0][v] = u; st.push_back(v); }
    }
}

int lca(int a, int b) {
    if (depth[a] < depth[b]) swap(a, b);
    int diff = depth[a] - depth[b];
    for (int k = 0; k < LOG; k++) if (diff >> k & 1) a = up[k][a];
    if (a == b) return a;
    for (int k = LOG - 1; k >= 0; k--) if (up[k][a] != up[k][b]) { a = up[k][a]; b = up[k][b]; }
    return up[0][a];
}

int dist(int a, int b) { return depth[a] + depth[b] - 2 * depth[lca(a, b)]; }

int calcSize(int u, int p) {
    sz[u] = 1;
    for (int v : adj[u]) if (v != p && !removed[v]) sz[u] += calcSize(v, u);
    return sz[u];
}

int findCentroid(int u, int p, int tot) {
    for (int v : adj[u])
        if (v != p && !removed[v] && sz[v] * 2 > tot) return findCentroid(v, u, tot);
    return u;
}

void decompose(int u, int parent) {
    int tot = calcSize(u, -1);
    int c = findCentroid(u, -1, tot);
    cpar[c] = parent;
    removed[c] = 1;
    for (int v : adj[c]) if (!removed[v]) decompose(v, c);
}

void toggle(int v) {
    if (!white[v]) {
        white[v] = 1;
        for (int x = v; x != 0; x = cpar[x]) ms[x].insert(dist(v, x));
    } else {
        white[v] = 0;
        for (int x = v; x != 0; x = cpar[x]) ms[x].erase(ms[x].find(dist(v, x)));
    }
}

int query(int v) {
    int res = INT_MAX;
    for (int x = v; x != 0; x = cpar[x])
        if (!ms[x].empty()) res = min(res, *ms[x].begin() + dist(v, x));
    return res == INT_MAX ? -1 : res;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n;
    LOG = 1;
    while ((1 << LOG) < n) LOG++;
    LOG++;
    adj.assign(n + 1, {});
    up.assign(LOG, vector<int>(n + 1, 0));
    depth.assign(n + 1, 0);
    sz.assign(n + 1, 0);
    cpar.assign(n + 1, 0);
    removed.assign(n + 1, 0);
    white.assign(n + 1, 0);
    ms.assign(n + 1, multiset<int>());
    for (int i = 0; i < n - 1; i++) {
        int a, b; cin >> a >> b;
        adj[a].push_back(b);
        adj[b].push_back(a);
    }
    rootTree(1);
    decompose(1, 0);
    int q; cin >> q;
    while (q--) {
        int t, v; cin >> t >> v;
        if (t == 0) toggle(v);
        else cout << query(v) << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Structurally identical to the paint-only version, with one change that matters: marks can be removed, so a single minimum per centroid is no longer maintainable. Each centroid keeps a multiset of the distances to the white nodes of its part, and the smallest element plays the role the min used to play.",
        "Insert and erase both walk the same O(log n) centroid ancestors, and erase uses find so exactly one copy is removed - calling erase with the value would delete every white node sitting at that distance and corrupt the structure. That is the single most common bug in this problem.",
        "The correctness argument is unchanged. Any answer produced is a real walk length by the triangle inequality, and the true optimum is achieved exactly at the lowest common centroid ancestor of v and the nearest white node, which is one of the ancestors scanned.",
        "A cheaper alternative for the same operations is a lazy heap per centroid, pushing on mark and popping stale tops on query, which trades the multiset's erase for amortised cleanup. It is faster in practice but only works when marks are monotone or the staleness can be detected, so a multiset is the safer default under toggling.",
        "Time: O((n + q) log^2 n). Space: O(n log n) - each node appears in O(log n) multisets.",
      ],
    },
    {
      name: "Palindromes in a Tree",
      difficulty: "Hard",
      variation: "Bitmask parity paths, an answer per vertex",
      link: "https://codeforces.com/problemset/problem/914/E",
      question: [
        "You are given a tree with n vertices numbered 1..n. Each vertex carries one lowercase letter from the first 20 letters of the alphabet. A path is palindromic if the multiset of letters on it can be rearranged into a palindrome, that is, at most one letter occurs an odd number of times. For every vertex v, output the number of palindromic paths that pass through v. Paths are unordered, and a single vertex counts as a path through itself.",
        "Example 1:\nInput:\n5\n1 2\n2 3\n3 4\n3 5\nabcbb\nOutput: 1 3 4 3 3\nExplanation: The palindromic paths are the five single vertices plus (2,4), (2,5) and (4,5), each of which reads b, c, b. Vertex 3 lies on all three of those, so its count is 1 + 3 = 4.",
        "Example 2:\nInput:\n7\n6 2\n4 3\n3 7\n5 2\n7 2\n1 4\nafefdfs\nOutput: 1 4 1 1 2 4 2",
        "Constraints:\n- 1 <= n <= 2 * 10^5\n- each letter is one of the first 20 lowercase letters",
      ],
      code: `const int A = 20;                             // only the first 20 letters occur
int n;
vector<vector<int>> adj;
vector<int> sz, letter, cnt, cntB;             // cnt, cntB are indexed by parity mask
vector<char> removed;
vector<long long> ans;

int calcSize(int u, int p) {
    sz[u] = 1;
    for (int v : adj[u]) if (v != p && !removed[v]) sz[u] += calcSize(v, u);
    return sz[u];
}

int findCentroid(int u, int p, int tot) {
    for (int v : adj[u])
        if (v != p && !removed[v] && sz[v] * 2 > tot) return findCentroid(v, u, tot);
    return u;
}

void decompose(int u) {
    int tot = calcSize(u, -1);
    int c = findCentroid(u, -1, tot);
    removed[c] = 1;
    // Flatten the component, parents before children, tagging the branch of c.
    vector<int> order{c}, par{-1}, mask{1 << letter[c]}, top{-1};
    for (size_t i = 0; i < order.size(); i++) {
        int x = order[i], p = par[i] < 0 ? -1 : order[par[i]];
        for (int v : adj[x]) {
            if (removed[v] || v == p) continue;
            order.push_back(v);
            par.push_back((int)i);
            mask.push_back(mask[i] ^ (1 << letter[v]));       // parity of c..v inclusive
            top.push_back(i == 0 ? (int)order.size() - 1 : top[i]);
        }
    }
    int m = (int)order.size(), cb = 1 << letter[c];
    for (int k = 0; k < m; k++) cnt[mask[k]]++;
    vector<vector<int>> groups;
    vector<int> gid(m, -1);
    for (int k = 1; k < m; k++) if (top[k] == k) { gid[k] = (int)groups.size(); groups.push_back({}); }
    for (int k = 1; k < m; k++) groups[gid[top[k]]].push_back(k);

    vector<long long> h(m, 0);                 // h[k] = palindromic paths through c ending at k
    long long endsAtC = 0;
    for (auto& grp : groups) {
        for (int k : grp) cntB[mask[k]]++;     // partners in the same branch do not count
        for (int k : grp) {
            int base = mask[k] ^ cb;           // c's letter is shared by both legs
            long long t = cnt[base] - cntB[base];
            for (int b = 0; b < A; b++) t += cnt[base ^ (1 << b)] - cntB[base ^ (1 << b)];
            h[k] = t;
            if (__builtin_popcount(mask[k]) <= 1) endsAtC++;
        }
        for (int k : grp) cntB[mask[k]]--;
    }
    long long sumH = 0;
    for (int k = 1; k < m; k++) sumH += h[k];
    ans[c] += (sumH - endsAtC) / 2 + endsAtC;  // two-ended paths were counted twice
    vector<long long> g = h;                   // subtree sums: children come after parents
    for (int k = m - 1; k >= 1; k--) {
        ans[order[k]] += g[k];
        if (par[k] > 0) g[par[k]] += g[k];
    }
    for (int k = 0; k < m; k++) cnt[mask[k]]--;
    for (int v : adj[c]) if (!removed[v]) decompose(v);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n;
    adj.assign(n + 1, {});
    sz.assign(n + 1, 0);
    removed.assign(n + 1, 0);
    letter.assign(n + 1, 0);
    ans.assign(n + 1, 0);
    cnt.assign(1 << A, 0);
    cntB.assign(1 << A, 0);
    for (int i = 0; i < n - 1; i++) {
        int a, b; cin >> a >> b;
        adj[a].push_back(b);
        adj[b].push_back(a);
    }
    string s; cin >> s;
    for (int i = 1; i <= n; i++) letter[i] = s[i - 1] - 'a';
    decompose(1);
    for (int i = 1; i <= n; i++) cout << ans[i] + 1 << " \\n"[i == n];   // +1 for the single vertex
    return 0;
}`,
      explanation: [
        "Only parities matter, so compress each path to a 20-bit mask and call it palindromic when the mask is 0 or a single bit. With mask[x] the parity of the letters on c..x inclusive, the path x-c-y has parity mask[x] xor mask[y] xor bit(c), because c's own letter is counted in both prefixes and must be put back once. So for a fixed x there are 21 acceptable partner masks, and each is a single array lookup.",
        "The new difficulty is that the answer is per vertex, not global. A path through c that has an endpoint x passes through exactly the vertices on the c-to-x walk in x's branch plus the mirror walk on the other side. Equivalently, a vertex u other than c lies on such a path exactly when the path has an endpoint inside u's subtree, rooted at c. So compute h[x] for every endpoint x, then take subtree sums downward-up: ans[u] gains the total h over u's subtree. Doing it as a subtree sum instead of walking each path is what avoids the quadratic blow-up.",
        "The centroid's own tally needs care. In the sum of h, a path with both endpoints away from c is counted twice, once from each endpoint, while a path that stops at c is counted once - it shows up when mask[x] itself has at most one bit set. Hence (sumH - endsAtC) / 2 + endsAtC. Single-vertex paths are always palindromic and are added once at the very end for every vertex, so they must not be counted inside the recursion.",
        "Subtracting the current branch's own counts, cnt minus cntB, does double duty: it removes partners lying in the same branch, whose real path avoids c, and it removes x pairing with itself, which would otherwise register as the bogus mask bit(c).",
        "Time: O(21 * n log n). Space: O(n + 2^20) - the two mask arrays are allocated once and rolled back per centroid rather than cleared.",
      ],
    },
  ],
};
