import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Kth Ancestor in a Tree",
      difficulty: "Easy",
      variation: "Naive walk up the root path",
      question: [
        "You are given the root of a binary tree, an integer k, and the value of a node present in the tree. Return the value of the k-th ancestor of that node, where the parent of a node is its 1st ancestor, the grandparent is its 2nd ancestor, and so on. If the node has fewer than k ancestors, return -1.",
        "All node values are distinct, and no jump table is allowed here - this is the baseline the lifting trick later replaces.",
        "Example 1:\nInput: tree = [1,2,3,4,5] (1 is the root, children 2 and 3; 2 has children 4 and 5), node = 5, k = 2\nOutput: 1\nExplanation: The root-to-node path is 1 -> 2 -> 5. The 1st ancestor of 5 is 2 and the 2nd is 1.",
        "Example 2:\nInput: same tree, node = 4, k = 3\nOutput: -1\nExplanation: 4 has only two ancestors (2 and 1), so a 3rd ancestor does not exist.",
        "Constraints:\n- 1 <= number of nodes <= 10^4\n- 1 <= k <= 10^4\n- all node values are distinct and the queried node exists",
      ],
      code: `// struct Node { int data; Node *left, *right; };

// Push nodes onto path while descending; pop on the way out of a dead branch.
bool findPath(Node* root, int target, vector<Node*>& path) {
    if (!root) return false;
    path.push_back(root);
    if (root->data == target) return true;
    if (findPath(root->left, target, path)) return true;
    if (findPath(root->right, target, path)) return true;
    path.pop_back();                 // this subtree does not contain target
    return false;
}

int kthAncestor(Node* root, int k, int node) {
    vector<Node*> path;
    if (!findPath(root, node, path)) return -1;
    int idx = (int)path.size() - 1 - k;   // path.back() is the node itself
    if (idx < 0) return -1;               // fewer than k ancestors
    return path[idx]->data;
}`,
      explanation: [
        "A binary tree node has no parent pointer, so the only way up is to first record the way down. One DFS builds the unique root-to-node path; the ancestors of the node are exactly the earlier entries of that path, nearest ancestor last.",
        "Indexing is where this goes wrong most often. The node itself sits at path.size() - 1, so its k-th ancestor is at path.size() - 1 - k, and a negative index is precisely the 'not enough ancestors' case that must return -1 rather than wrap around.",
        "The tempting shortcut is a DFS that decrements k on the way back up and returns when k hits zero. It works, but the counter has to be passed by reference and stopped after firing, otherwise a second branch keeps decrementing and reports a wrong ancestor. The explicit path is harder to get wrong.",
        "This is also the reason binary lifting exists: one query is O(n) here, so q queries cost O(n * q), which is hopeless once both are 10^5. Everything that follows is about paying an O(n log n) preprocessing fee once.",
        "Time: O(n) per query. Space: O(h) for the path and recursion, O(n) in the worst case.",
      ],
    },
    {
      name: "Company Queries I",
      difficulty: "Easy",
      variation: "Binary lifting jump table, the template",
      link: "https://cses.fi/problemset/task/1687",
      question: [
        "A company has n employees numbered 1..n. Employee 1 is the general and every other employee has exactly one direct boss, so the structure is a rooted tree. Process q queries: given an employee x and a value k, report the k-th boss of x (the employee reached by following the boss link k times), or -1 if x has fewer than k bosses.",
        "Example 1:\nInput:\n5 3\n1 1 3 3\n4 1\n4 2\n4 3\nOutput:\n3\n1\n-1\nExplanation: The boss of 2 is 1, of 3 is 1, of 4 is 3 and of 5 is 3. Walking up from 4 gives 3, then 1, and then nothing.",
        "Constraints:\n- 1 <= n, q <= 2 * 10^5\n- 1 <= k <= n - 1\n- the boss of employee i is a valid employee and the structure is a tree rooted at 1",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    const int LOG = 18;                        // 2^18 > 2 * 10^5
    // up[j][v] = the 2^j-th boss of v; 0 is a sentinel meaning 'above the general'
    vector<vector<int>> up(LOG, vector<int>(n + 1, 0));
    for (int v = 2; v <= n; v++) cin >> up[0][v];
    for (int j = 1; j < LOG; j++)
        for (int v = 1; v <= n; v++)
            up[j][v] = up[j - 1][up[j - 1][v]];   // 0 is a fixed point, so no branch needed
    while (q--) {
        int x, k;
        cin >> x >> k;
        for (int j = 0; j < LOG && x; j++)
            if (k >> j & 1) x = up[j][x];      // consume one set bit of k per jump
        cout << (x == 0 ? -1 : x) << "\\n";
    }
    return 0;
}`,
      explanation: [
        "The state is up[j][v]: the ancestor 2^j levels above v. The recurrence up[j][v] = up[j-1][up[j-1][v]] is just 2^j = 2^(j-1) + 2^(j-1) - jump half the distance, then jump the same half again from wherever you landed. Because level j only reads level j-1, filling the table row by row is enough.",
        "A query works because every k has a unique binary expansion. Walking the set bits of k from low to high performs jumps of 2^b that sum to exactly k, and since the jumps compose along a single upward chain the order does not matter.",
        "The sentinel 0 is what keeps the code branchless. Setting up[j][0] = 0 for all j makes 'above the root' absorbing, so overshooting lands on 0 and stays there instead of reading out of bounds, and 0 at the end means the answer is -1.",
        "The trap is a table too short for k. LOG must satisfy 2^LOG > max k, otherwise a high bit of k is silently dropped and the query returns an ancestor that is too low - a wrong answer with no crash to point at it.",
        "Time: O(n log n) preprocessing, O(log k) per query. Space: O(n log n).",
      ],
    },
    {
      name: "Kth Ancestor of a Tree Node",
      difficulty: "Medium",
      variation: "Jump table built from a parent array, online queries",
      link: "https://leetcode.com/problems/kth-ancestor-of-a-tree-node/",
      question: [
        "You are given a tree with n nodes numbered 0..n-1 described by a parent array, where parent[i] is the parent of node i and parent[0] = -1 because 0 is the root. Design a structure that answers many queries of the form getKthAncestor(node, k): return the k-th ancestor of node, or -1 if it does not exist. The 1st ancestor is the parent.",
        "Example 1:\nInput: n = 7, parent = [-1,0,0,1,1,2,2], queries = [[3,1],[5,2],[6,3]]\nOutput: [1,0,-1]\nExplanation: The parent of 3 is 1. From 5 we go 5 -> 2 -> 0, so the 2nd ancestor is 0. From 6 we go 6 -> 2 -> 0 and then run out, so the answer is -1.",
        "Example 2:\nInput: n = 3, parent = [-1,0,1], queries = [[2,1],[2,2],[0,1]]\nOutput: [1,0,-1]\nExplanation: The tree is the chain 0 -> 1 -> 2. The root has no ancestors at all.",
        "Constraints:\n- 1 <= n <= 5 * 10^4\n- parent[0] = -1 and 0 <= parent[i] < n for i >= 1\n- 1 <= k <= 5 * 10^4, at most 5 * 10^4 queries",
      ],
      code: `class TreeAncestor {
    int LOG;
    vector<vector<int>> up;                  // up[j][v] = ancestor 2^j levels above v, -1 if none

public:
    TreeAncestor(int n, vector<int>& parent) {
        LOG = 1;
        while ((1 << LOG) < n) LOG++;        // 2^LOG >= n > every legal k
        up.assign(LOG + 1, vector<int>(n, -1));
        up[0] = parent;
        for (int j = 1; j <= LOG; j++)
            for (int v = 0; v < n; v++) {
                int mid = up[j - 1][v];
                up[j][v] = (mid < 0) ? -1 : up[j - 1][mid];   // -1 must not be indexed
            }
    }

    int getKthAncestor(int node, int k) {
        for (int j = 0; j <= LOG && node >= 0; j++)
            if (k >> j & 1) node = up[j][node];
        return node;
    }
};`,
      explanation: [
        "Same table as the CSES version, but the root marker is -1 instead of 0, which is what the problem hands you. That single change forces a branch: -1 is not a valid index, so the doubling step must test the midpoint before following it, and the query loop must stop as soon as node goes negative.",
        "Choosing LOG from n rather than from k is the safe habit here. A legal k that exceeds the number of nodes can only mean 'no such ancestor', and with 2^LOG >= n any bit of k above LOG would have driven the walk off the root anyway - but only if the walk actually inspects it, which is why the loop bound and the table height must agree.",
        "The tempting alternative is to precompute every root-to-node path and index into it. That is O(1) per query but O(n^2) memory on a chain-shaped tree, which is exactly the shape the test data uses. Lifting trades a log factor per query for O(n log n) total memory.",
        "A second wrong-but-plausible idea is to answer each query by walking parents one step at a time and hope the tree is shallow. With 5 * 10^4 queries on a 5 * 10^4-node chain that is 2.5 * 10^9 steps.",
        "Time: O(n log n) to build, O(log k) per query. Space: O(n log n).",
      ],
    },
    {
      name: "Planets Queries I",
      difficulty: "Medium",
      variation: "K-th successor in a functional graph",
      link: "https://cses.fi/problemset/task/1750",
      question: [
        "There are n planets numbered 1..n, and each planet has exactly one teleporter leading to planet t[i] (possibly to itself). Answer q queries: starting from planet x and using teleporters exactly k times, which planet do you end on?",
        "Unlike a tree, this graph may contain cycles, and k can be far larger than n.",
        "Example 1:\nInput:\n4 3\n2 1 1 4\n1 2\n3 4\n4 1\nOutput:\n1\n2\n4\nExplanation: The teleporters are 1 -> 2, 2 -> 1, 3 -> 1, 4 -> 4. From 1 two steps give 1 -> 2 -> 1. From 3 four steps give 3 -> 1 -> 2 -> 1 -> 2. Planet 4 loops on itself.",
        "Constraints:\n- 1 <= n, q <= 2 * 10^5\n- 1 <= t[i] <= n\n- 1 <= k <= 10^9",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    const int LOG = 30;                       // 2^30 > 10^9
    vector<vector<int>> up(LOG, vector<int>(n + 1));
    for (int v = 1; v <= n; v++) cin >> up[0][v];
    for (int j = 1; j < LOG; j++)
        for (int v = 1; v <= n; v++)
            up[j][v] = up[j - 1][up[j - 1][v]];
    while (q--) {
        int x, k;
        cin >> x >> k;
        for (int j = 0; j < LOG; j++)
            if (k >> j & 1) x = up[j][x];
        cout << x << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Binary lifting never needed the tree structure - it only needed a total function 'one step from v'. Here that function is the teleporter, so up[j][v] is the planet reached after 2^j jumps and the same doubling recurrence holds verbatim.",
        "Because every planet has an outgoing teleporter, the walk never falls off the graph: there is no sentinel and no -1 case, which makes this the cleanest form of the pattern. The graph is a set of rho shapes (trees hanging off cycles) and lifting handles the cyclic part with no special casing at all.",
        "LOG is driven by k, not by n. With k up to 10^9 you need 30 rows even though there are only 2 * 10^5 planets - sizing the table by n here would drop high bits of k and quietly return the wrong planet.",
        "The alternative is to find each node's cycle and reduce k modulo the cycle length. That is O(1) per query but needs careful handling of the tail before the cycle, and off-by-ones there are easy; lifting is the same asymptotics up to a log and far less fragile.",
        "Time: O(n log k) preprocessing, O(log k) per query. Space: O(n log k).",
      ],
    },
    {
      name: "Company Queries II",
      difficulty: "Medium",
      variation: "Lowest common ancestor by lifting",
      link: "https://cses.fi/problemset/task/1688",
      question: [
        "A company has n employees numbered 1..n with employee 1 as the general, and every other employee has exactly one direct boss. Process q queries: given two employees a and b, report their lowest common boss, i.e. the deepest employee who is a boss (direct or indirect) of both, counting an employee as a boss of itself.",
        "Example 1:\nInput:\n5 3\n1 1 3 3\n4 5\n2 5\n1 4\nOutput:\n3\n1\n1\nExplanation: 4 and 5 are both direct subordinates of 3. Employee 2 hangs off 1 while 5 sits under 3 under 1, so their lowest common boss is 1. Since 1 is an ancestor of 4, the answer for the last query is 1 itself.",
        "Constraints:\n- 1 <= n, q <= 2 * 10^5\n- the structure is a tree rooted at employee 1",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    const int LOG = 18;
    vector<vector<int>> up(LOG, vector<int>(n + 1, 0));
    vector<vector<int>> child(n + 1);
    for (int v = 2; v <= n; v++) {
        int b;
        cin >> b;
        up[0][v] = b;
        child[b].push_back(v);
    }
    // Iterative DFS from the general: depths must not assume boss index < employee index.
    vector<int> dep(n + 1, 0), stk{1};
    while (!stk.empty()) {
        int v = stk.back();
        stk.pop_back();
        for (int c : child[v]) {
            dep[c] = dep[v] + 1;
            stk.push_back(c);
        }
    }
    for (int j = 1; j < LOG; j++)
        for (int v = 1; v <= n; v++)
            up[j][v] = up[j - 1][up[j - 1][v]];
    auto lca = [&](int a, int b) {
        if (dep[a] < dep[b]) swap(a, b);
        int d = dep[a] - dep[b];
        for (int j = 0; j < LOG; j++)
            if (d >> j & 1) a = up[j][a];     // phase 1: equalise depth
        if (a == b) return a;
        for (int j = LOG - 1; j >= 0; j--)
            if (up[j][a] != up[j][b]) {       // phase 2: jump only while still distinct
                a = up[j][a];
                b = up[j][b];
            }
        return up[0][a];
    };
    while (q--) {
        int a, b;
        cin >> a >> b;
        cout << lca(a, b) << "\\n";
    }
    return 0;
}`,
      explanation: [
        "LCA is the k-th ancestor machinery used twice. Phase one lifts the deeper node by exactly the depth difference, which is one k-th ancestor query. After that both nodes sit on the same level, and the special case a == b means one was an ancestor of the other.",
        "Phase two is a binary search on the answer's height. Scanning j from high to low and jumping only when up[j][a] != up[j][b] keeps the invariant 'a and b are still strictly below the LCA'. Each accepted jump doubles the progress without ever crossing the LCA, so after the loop a and b are the two distinct children of the LCA on their respective sides, and up[0][a] is the answer.",
        "The comparison must be on the ancestors, not on the nodes: testing a != b and jumping would sail past the LCA on the very first step. And the sentinel 0 matters again - once both nodes have overshot the root their lifted ancestors are both 0, compare equal, and the jump is correctly rejected.",
        "Depths come from an explicit traversal rather than from up[0], because reading dep[up[0][v]] in index order only works if every boss has a smaller number than their subordinate. Do not rely on input happening to be sorted that way.",
        "Time: O(n log n) preprocessing, O(log n) per query. Space: O(n log n).",
      ],
    },
    {
      name: "Distance Queries",
      difficulty: "Medium",
      variation: "Path length from depth plus LCA",
      link: "https://cses.fi/problemset/task/1135",
      question: [
        "You are given a tree with n nodes numbered 1..n, described by n-1 edges. Process q queries: for nodes a and b, report the number of edges on the unique path between them.",
        "Example 1:\nInput:\n5 3\n1 2\n1 3\n3 4\n3 5\n2 4\n2 5\n4 5\nOutput:\n3\n3\n2\nExplanation: The path 2 - 1 - 3 - 4 uses 3 edges, 2 - 1 - 3 - 5 uses 3 edges, and 4 - 3 - 5 uses 2.",
        "Constraints:\n- 1 <= n, q <= 2 * 10^5\n- the n-1 edges form a tree",
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
    const int LOG = 18;
    vector<vector<int>> up(LOG, vector<int>(n + 1, 0));
    vector<int> dep(n + 1, 0), order{1};
    vector<char> seen(n + 1, 0);
    seen[1] = 1;
    for (size_t i = 0; i < order.size(); i++) {   // BFS order, safe for a 2 * 10^5 chain
        int v = order[i];
        for (int u : adj[v])
            if (!seen[u]) {
                seen[u] = 1;
                dep[u] = dep[v] + 1;
                up[0][u] = v;
                order.push_back(u);
            }
    }
    for (int j = 1; j < LOG; j++)
        for (int v = 1; v <= n; v++)
            up[j][v] = up[j - 1][up[j - 1][v]];
    auto lca = [&](int a, int b) {
        if (dep[a] < dep[b]) swap(a, b);
        int d = dep[a] - dep[b];
        for (int j = 0; j < LOG; j++)
            if (d >> j & 1) a = up[j][a];
        if (a == b) return a;
        for (int j = LOG - 1; j >= 0; j--)
            if (up[j][a] != up[j][b]) {
                a = up[j][a];
                b = up[j][b];
            }
        return up[0][a];
    };
    while (q--) {
        int a, b;
        cin >> a >> b;
        int l = lca(a, b);
        cout << dep[a] + dep[b] - 2 * dep[l] << "\\n";
    }
    return 0;
}`,
      explanation: [
        "The path from a to b goes up from a to their LCA and back down to b, and those two vertical stretches are disjoint apart from the LCA itself. So the length is (dep[a] - dep[l]) + (dep[b] - dep[l]) = dep[a] + dep[b] - 2 * dep[l].",
        "The subtraction of 2 * dep[l] rather than dep[l] is the classic slip: the LCA is counted once in each vertical stretch, so both copies of the prefix above it have to come off. Checking the formula on a == b (answer 0) and on b = parent(a) (answer 1) catches this immediately.",
        "The input is an edge list, not a parent list, so the parent of each node is only defined once you root the tree. The traversal that assigns up[0] and dep does that rooting; using BFS with an explicit queue avoids blowing the stack on a path-shaped tree with 2 * 10^5 nodes.",
        "For weighted edges nothing about the LCA changes - replace dep by the summed weight from the root and the same formula gives the weighted distance, since the prefix above the LCA cancels identically.",
        "Time: O(n log n) preprocessing, O(log n) per query. Space: O(n log n).",
      ],
    },
    {
      name: "Counting Paths",
      difficulty: "Hard",
      variation: "LCA plus a difference array on the tree",
      link: "https://cses.fi/problemset/task/1136",
      question: [
        "You are given a tree with n nodes numbered 1..n and m paths, each given by its two endpoints. For every node, report how many of the m paths pass through it. A path passes through both of its endpoints.",
        "Example 1:\nInput:\n5 3\n1 2\n1 3\n3 4\n3 5\n1 4\n4 5\n2 5\nOutput:\n2 1 3 2 2\nExplanation: The paths are 1-3-4, 4-3-5 and 2-1-3-5. Node 3 lies on all three, node 2 only on the last one, and nodes 1, 4 and 5 on two each.",
        "Constraints:\n- 1 <= n, m <= 2 * 10^5\n- the n-1 edges form a tree",
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
    const int LOG = 18;
    vector<vector<int>> up(LOG, vector<int>(n + 1, 0));
    vector<int> dep(n + 1, 0), order{1};
    vector<char> seen(n + 1, 0);
    seen[1] = 1;
    for (size_t i = 0; i < order.size(); i++) {
        int v = order[i];
        for (int u : adj[v])
            if (!seen[u]) {
                seen[u] = 1;
                dep[u] = dep[v] + 1;
                up[0][u] = v;
                order.push_back(u);
            }
    }
    for (int j = 1; j < LOG; j++)
        for (int v = 1; v <= n; v++)
            up[j][v] = up[j - 1][up[j - 1][v]];
    auto lca = [&](int a, int b) {
        if (dep[a] < dep[b]) swap(a, b);
        int d = dep[a] - dep[b];
        for (int j = 0; j < LOG; j++)
            if (d >> j & 1) a = up[j][a];
        if (a == b) return a;
        for (int j = LOG - 1; j >= 0; j--)
            if (up[j][a] != up[j][b]) {
                a = up[j][a];
                b = up[j][b];
            }
        return up[0][a];
    };
    // Slot 0 is the dummy parent of the root: writes land there and are never read.
    vector<long long> diff(n + 1, 0);
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        int l = lca(a, b);
        diff[a]++;
        diff[b]++;
        diff[l]--;
        diff[up[0][l]]--;                      // up[0][1] == 0, so the root case self-handles
    }
    vector<long long> ans = diff;
    for (int i = (int)order.size() - 1; i >= 1; i--) {   // children before parents
        int v = order[i];
        ans[up[0][v]] += ans[v];
    }
    for (int v = 1; v <= n; v++) cout << ans[v] << " \\n"[v == n];
    return 0;
}`,
      explanation: [
        "The state is a difference array over the tree: ans[v] is defined as the sum of diff over the whole subtree of v. Adding 1 at a node therefore adds 1 to every ancestor of that node, which is exactly the effect of a root-to-node path.",
        "A path a - b is the symmetric difference of two root paths. Root-to-a plus root-to-b covers the real path but double-counts everything from the LCA up to the root, so subtracting one unit at the LCA and one more at its parent removes exactly one copy of the segment strictly above the LCA and one copy of the LCA itself, leaving each node of the path counted once.",
        "Getting the second subtraction wrong is the standard bug. Only diff[l]-- gives every proper ancestor of the LCA a spurious +1; only diff[parent(l)]-- double counts the LCA. Both are needed, and when the LCA is the root the parent term has nowhere to go and must simply be discarded.",
        "The accumulation direction matters: iterating the BFS order backwards guarantees a node is fully summed before its parent reads it, which is what makes the single linear pass equivalent to a post-order DFS without the recursion depth risk.",
        "Counts fit in 64-bit comfortably here, but the intermediate diff values are legitimately negative, so an unsigned type would silently wrap.",
        "Time: O(n log n + m log n). Space: O(n log n).",
      ],
    },
    {
      name: "Minimum Edge Weight Equilibrium Queries in a Tree",
      difficulty: "Hard",
      variation: "Prefix counts along a path via LCA",
      link: "https://leetcode.com/problems/minimum-edge-weight-equilibrium-queries-in-a-tree/",
      question: [
        "You are given a tree with n nodes numbered 0..n-1 and edges edges[i] = [u, v, w] with 1 <= w <= 26. For each query [a, b] you may repeatedly pick any edge on the path from a to b and change its weight to any value; each such change costs one operation. Return, for every query, the minimum number of operations needed to make all edge weights on that path equal.",
        "Example 1:\nInput: n = 7, edges = [[0,1,1],[1,2,1],[2,3,1],[3,4,2],[4,5,2],[5,6,2]], queries = [[0,3],[3,6],[2,6],[0,6]]\nOutput: [0,0,1,3]\nExplanation: The path 0..3 already has three edges of weight 1. The path 2..6 has weights 1,2,2,2 so one change suffices. The path 0..6 has three 1s and three 2s, so three of the six edges must change.",
        "Example 2:\nInput: n = 8, edges = [[1,2,6],[1,3,4],[2,4,6],[2,5,3],[3,6,6],[3,0,8],[7,0,2]], queries = [[4,6],[0,4],[6,5],[7,4]]\nOutput: [1,2,2,3]\nExplanation: For query [4,6] the path weights are 6,6,4,6, so changing the single 4 is enough. For [7,4] the path weights are 2,8,4,6,6, whose most common value appears twice, so 5 - 2 = 3 changes are needed.",
        "Constraints:\n- 1 <= n <= 10^4\n- 1 <= w <= 26\n- 1 <= number of queries <= 2 * 10^4",
      ],
      code: `class Solution {
public:
    vector<int> minOperationsQueries(int n, vector<vector<int>>& edges, vector<vector<int>>& queries) {
        int LOG = 1;
        while ((1 << LOG) < n) LOG++;
        vector<vector<pair<int,int>>> adj(n);
        for (auto& e : edges) {
            adj[e[0]].push_back({e[1], e[2]});
            adj[e[1]].push_back({e[0], e[2]});
        }
        vector<vector<int>> up(LOG + 1, vector<int>(n, 0));
        vector<array<int,27>> cnt(n);            // cnt[v][w] = count of weight w on root -> v
        vector<int> dep(n, 0), order{0};
        vector<char> seen(n, 0);
        seen[0] = 1;
        for (size_t i = 0; i < order.size(); i++) {
            int v = order[i];
            for (auto& [u, w] : adj[v])
                if (!seen[u]) {
                    seen[u] = 1;
                    dep[u] = dep[v] + 1;
                    up[0][u] = v;
                    cnt[u] = cnt[v];             // inherit the root prefix, then extend it
                    cnt[u][w]++;
                    order.push_back(u);
                }
        }
        for (int j = 1; j <= LOG; j++)
            for (int v = 0; v < n; v++)
                up[j][v] = up[j - 1][up[j - 1][v]];
        auto lca = [&](int a, int b) {
            if (dep[a] < dep[b]) swap(a, b);
            int d = dep[a] - dep[b];
            for (int j = 0; j <= LOG; j++)
                if (d >> j & 1) a = up[j][a];
            if (a == b) return a;
            for (int j = LOG; j >= 0; j--)
                if (up[j][a] != up[j][b]) {
                    a = up[j][a];
                    b = up[j][b];
                }
            return up[0][a];
        };
        vector<int> res;
        res.reserve(queries.size());
        for (auto& qy : queries) {
            int a = qy[0], b = qy[1], l = lca(a, b);
            int len = dep[a] + dep[b] - 2 * dep[l];
            int best = 0;
            for (int w = 1; w <= 26; w++)
                best = max(best, cnt[a][w] + cnt[b][w] - 2 * cnt[l][w]);
            res.push_back(len - best);
        }
        return res;
    }
};`,
      explanation: [
        "One operation fixes one edge, so the cheapest plan is to keep the most frequent weight on the path and rewrite everything else: answer = pathEdges - maxFrequency. The whole problem is therefore reduced to counting each of the 26 weights along an arbitrary path.",
        "That count comes from root prefixes, the same telescoping trick as the distance formula. For any weight w, occurrences on the path a - b equal cnt[a][w] + cnt[b][w] - 2 * cnt[l][w], because the two root prefixes overlap exactly on the prefix above the LCA and that overlap is counted twice in the sum.",
        "The bounded alphabet is what makes this affordable. Storing 27 counters per node is O(26n) memory, and each query scans those 26 buckets in O(26 + log n) time. If weights were unbounded this decomposition would not fit, and you would need small-to-large merging or an offline technique instead.",
        "Two traps: the path length must be measured in edges, so it is the same dep[a] + dep[b] - 2 * dep[l] and not a node count, and the counts must be built from the parent's array during the rooting traversal - recomputing a prefix per query would be O(n) each time.",
        "Time: O(26n + n log n + 26 * q + q log n). Space: O(26n + n log n).",
      ],
    },
    {
      name: "Maximize Value of Function in a Ball Passing Game",
      difficulty: "Hard",
      variation: "Lifting with an aggregated value along the jump",
      link: "https://leetcode.com/problems/maximize-value-of-function-in-a-ball-passing-game/",
      question: [
        "There are n players numbered 0..n-1 and an array receiver where receiver[i] is the player who receives the ball when player i passes it (possibly i itself). Choose a starting player x and make exactly k passes. The score is the sum of the ids of every player who touched the ball, counted once per touch: x + receiver[x] + receiver[receiver[x]] + ... for k passes, i.e. k+1 ids in total. Return the maximum score over all choices of x.",
        "Example 1:\nInput: receiver = [2,0,1], k = 4\nOutput: 6\nExplanation: Starting at 2 the ball goes 2 -> 1 -> 0 -> 2 -> 1, so the score is 2 + 1 + 0 + 2 + 1 = 6.",
        "Example 2:\nInput: receiver = [1,1,1,2,3], k = 3\nOutput: 10\nExplanation: Starting at 4 the ball goes 4 -> 3 -> 2 -> 1, so the score is 4 + 3 + 2 + 1 = 10.",
        "Constraints:\n- 1 <= n <= 10^5\n- 0 <= receiver[i] < n\n- 1 <= k <= 10^10 (so k does not fit in a 32-bit int)",
      ],
      code: `class Solution {
public:
    long long getMaxFunctionValue(vector<int>& receiver, long long k) {
        int n = receiver.size();
        long long m = k + 1;                     // number of ids summed: the start plus k passes
        int LOG = 1;
        while ((1LL << LOG) <= m) LOG++;         // 2^LOG > m, so every bit of m is covered
        vector<vector<int>> up(LOG, vector<int>(n));
        vector<vector<long long>> sum(LOG, vector<long long>(n));
        for (int v = 0; v < n; v++) {
            up[0][v] = receiver[v];
            sum[0][v] = v;                       // one id: v itself
        }
        for (int j = 1; j < LOG; j++)
            for (int v = 0; v < n; v++) {
                int mid = up[j - 1][v];
                up[j][v] = up[j - 1][mid];
                sum[j][v] = sum[j - 1][v] + sum[j - 1][mid];   // two half-blocks, no overlap
            }
        long long best = 0;
        for (int x = 0; x < n; x++) {
            long long total = 0;
            int cur = x;
            for (int j = 0; j < LOG; j++)
                if (m >> j & 1) {
                    total += sum[j][cur];
                    cur = up[j][cur];            // advance past the block just accounted for
                }
            best = max(best, total);
        }
        return best;
    }
};`,
      explanation: [
        "This is lifting over a functional graph with a value carried alongside the pointer. Define sum[j][v] as the total of the first 2^j ids visited starting at v, that is v and its next 2^j - 1 successors, deliberately excluding the endpoint up[j][v].",
        "That half-open convention is what makes the merge work: the block of length 2^j starting at v splits into the block of length 2^(j-1) starting at v and the block of length 2^(j-1) starting at up[j-1][v], with no shared element. If sum[j][v] included its endpoint, the two halves would overlap and every merge would double count one id.",
        "A query decomposes m = k + 1 into set bits, and after adding sum[j][cur] the cursor must advance to up[j][cur] so the next block starts where this one ended. Processing bits low to high or high to low both work as long as the cursor advances in lockstep.",
        "Sizing and typing are the real hazards. k reaches 10^10, so k must be 64-bit and LOG about 35; the score can reach roughly 10^10 * 10^5 = 10^15, far past a 32-bit int. Note also that k+1 cannot overflow here but the shift must be written 1LL << LOG.",
        "The tempting shortcut of detecting each start node's cycle and multiplying the cycle sum by k / cycleLen is valid but fiddly, because the tail before the cycle has to be handled separately for every start. Lifting handles tail and cycle uniformly.",
        "Time: O(n log k). Space: O(n log k).",
      ],
    },
    {
      name: "Minimum spanning tree for each edge",
      difficulty: "Hard",
      variation: "Maximum edge on a path by lifting",
      link: "https://codeforces.com/problemset/problem/609/E",
      question: [
        "You are given a connected weighted undirected graph with n vertices and m edges. For every edge of the graph, print the minimum possible total weight of a spanning tree that is forced to contain that edge.",
        "Example 1:\nInput:\n5 7\n1 2 3\n1 3 1\n1 4 5\n2 3 2\n2 5 3\n3 4 2\n4 5 4\nOutput:\n9\n8\n11\n8\n8\n8\n9\nExplanation: A minimum spanning tree uses edges 1-3 (1), 2-3 (2), 3-4 (2) and 2-5 (3) for a total of 8, so every one of those four edges answers 8. Forcing edge 1-2 of weight 3 replaces the heaviest edge on the tree path 1-3-2, which has weight 2, giving 8 + 3 - 2 = 9. Forcing 1-4 replaces weight 2 on the path 1-3-4, giving 11, and forcing 4-5 replaces weight 3 on the path 4-3-2-5, giving 9.",
        "Constraints:\n- 1 <= n <= 2 * 10^5, n - 1 <= m <= 2 * 10^5\n- 1 <= weight <= 10^9\n- the graph is connected, has no self-loops and no multiple edges",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<int> eu(m), ev(m), ord(m);
    vector<long long> ew(m);
    for (int i = 0; i < m; i++) {
        cin >> eu[i] >> ev[i] >> ew[i];
        ord[i] = i;
    }
    sort(ord.begin(), ord.end(), [&](int a, int b) { return ew[a] < ew[b]; });
    vector<int> dsu(n + 1);
    iota(dsu.begin(), dsu.end(), 0);
    auto find = [&](int x) {                      // iterative, with path halving
        while (dsu[x] != x) {
            dsu[x] = dsu[dsu[x]];
            x = dsu[x];
        }
        return x;
    };
    long long mst = 0;
    vector<char> inMst(m, 0);
    vector<vector<pair<int,long long>>> adj(n + 1);
    for (int id : ord) {
        int a = find(eu[id]), b = find(ev[id]);
        if (a == b) continue;
        dsu[a] = b;
        mst += ew[id];
        inMst[id] = 1;
        adj[eu[id]].push_back({ev[id], ew[id]});
        adj[ev[id]].push_back({eu[id], ew[id]});
    }
    const int LOG = 18;
    vector<vector<int>> up(LOG, vector<int>(n + 1, 0));
    vector<vector<long long>> mx(LOG, vector<long long>(n + 1, 0));   // heaviest edge in the jump
    vector<int> dep(n + 1, 0), order{1};
    vector<char> seen(n + 1, 0);
    seen[1] = 1;
    for (size_t i = 0; i < order.size(); i++) {
        int v = order[i];
        for (auto& [u, w] : adj[v])
            if (!seen[u]) {
                seen[u] = 1;
                dep[u] = dep[v] + 1;
                up[0][u] = v;
                mx[0][u] = w;
                order.push_back(u);
            }
    }
    for (int j = 1; j < LOG; j++)
        for (int v = 1; v <= n; v++) {
            up[j][v] = up[j - 1][up[j - 1][v]];
            mx[j][v] = max(mx[j - 1][v], mx[j - 1][up[j - 1][v]]);
        }
    auto maxOnPath = [&](int a, int b) {
        long long res = 0;
        if (dep[a] < dep[b]) swap(a, b);
        int d = dep[a] - dep[b];
        for (int j = 0; j < LOG; j++)
            if (d >> j & 1) {
                res = max(res, mx[j][a]);
                a = up[j][a];
            }
        if (a == b) return res;
        for (int j = LOG - 1; j >= 0; j--)
            if (up[j][a] != up[j][b]) {
                res = max({res, mx[j][a], mx[j][b]});
                a = up[j][a];
                b = up[j][b];
            }
        return max({res, mx[0][a], mx[0][b]});    // the last two edges below the LCA
    };
    for (int i = 0; i < m; i++) {
        if (inMst[i]) cout << mst << "\\n";
        else cout << mst + ew[i] - maxOnPath(eu[i], ev[i]) << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Build one MST first. If the forced edge is already in it the answer is simply the MST weight. Otherwise adding the forced edge to the MST creates exactly one cycle, and the cheapest way to get back to a spanning tree while keeping that edge is to delete the heaviest other edge of that cycle - the cycle property of minimum spanning trees guarantees no better swap exists.",
        "That heaviest other edge is the maximum-weight edge on the tree path between the forced edge's endpoints, so the answer is mst + w - maxOnPath(u, v). Answering it is the same lifting table as LCA, with a second table mx[j][v] holding the heaviest edge among the 2^j edges the jump crosses; max is associative and idempotent, so the doubling merge max(mx[j-1][v], mx[j-1][up[j-1][v]]) is correct.",
        "The subtle part is that the maximum must be accumulated in both phases: while equalising depths, and while descending in the second phase, plus the final mx[0] of both nodes for the two edges immediately below the LCA. Forgetting that last pair is the most common bug and only shows up when the LCA is a strict ancestor of both endpoints.",
        "Arithmetic: with 2 * 10^5 edges of weight up to 10^9 the MST weight reaches 2 * 10^14, so every accumulator must be 64-bit even though individual weights fit in an int.",
        "Ties do not need care - when several MSTs exist any one of them gives the same optimal value for every forced edge, because the multiset of edge weights of an MST is invariant.",
        "Time: O(m log m + n log n) for the MST and table, O(log n) per edge. Space: O((n + m) log n).",
      ],
    },
  ],
};
