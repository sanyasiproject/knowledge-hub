import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Lowest Common Ancestor of a Binary Tree",
      difficulty: "Medium",
      variation: "Single-query recursive LCA (the baseline)",
      link: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/",
      question: [
        "Given the root of a binary tree and two distinct nodes p and q that are both present in the tree, return their lowest common ancestor: the deepest node that has both p and q as descendants, where a node is allowed to be a descendant of itself.",
        "Example 1:\nInput: root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1\nOutput: 3\nExplanation: 5 sits in the left subtree of 3 and 1 in the right subtree, so 3 is the deepest node containing both.",
        "Example 2:\nInput: root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 4\nOutput: 5\nExplanation: 4 is a descendant of 5 (5 -> 2 -> 4), and a node counts as its own descendant, so the answer is 5 itself.",
        "Constraints:\n- 2 <= number of nodes <= 10^5\n- All node values are unique\n- p != q and both exist in the tree",
      ],
      code: `TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
    if (!root || root == p || root == q) return root;   // found one, stop descending
    TreeNode* left = lowestCommonAncestor(root->left, p, q);
    TreeNode* right = lowestCommonAncestor(root->right, p, q);
    if (left && right) return root;   // the two targets split here, so this is the LCA
    return left ? left : right;       // otherwise pass the single hit upwards
}`,
      explanation: [
        "This is the one-query version of the problem and the mental model everything else builds on. Each call returns 'the shallowest interesting node found in my subtree': either a target, or the LCA if it was already resolved below.",
        "Correctness rests on a single case split. If p and q live in different child subtrees of the current node, both recursive calls return non-null and the current node is by definition the deepest common ancestor. If they live in the same subtree, only one side is non-null and that answer is propagated up unchanged. If the current node is itself a target, returning it early is safe because the other target can only be below it, which makes the current node the answer.",
        "The trap is that this costs O(n) per query. With many queries on a static tree that becomes O(qn), which is exactly why binary lifting exists: preprocess once, then answer each query in O(log n). Every later problem in this bank uses the lifting table instead.",
        "Time: O(n) per query. Space: O(h) recursion stack, h the tree height.",
      ],
    },
    {
      name: "Kth Ancestor of a Tree Node",
      difficulty: "Medium",
      variation: "Jump table, k-th ancestor queries",
      link: "https://leetcode.com/problems/kth-ancestor-of-a-tree-node/",
      question: [
        "You are given a rooted tree with n nodes numbered 0..n-1 and a parent array where parent[i] is the parent of node i, with parent[0] = -1 because 0 is the root. Implement a class TreeAncestor with a constructor TreeAncestor(n, parent) and a method getKthAncestor(node, k) that returns the k-th ancestor of node, or -1 if there is no such ancestor. The 1st ancestor is the parent, the 2nd is the grandparent, and so on.",
        "Example 1:\nInput:\nTreeAncestor(7, [-1,0,0,1,1,2,2])\ngetKthAncestor(3, 1)\ngetKthAncestor(5, 2)\ngetKthAncestor(6, 3)\nOutput: 1, 0, -1\nExplanation: The parent of 3 is 1. Walking up twice from 5 gives 2 then 0. Node 6 only has two ancestors (2 and 0), so the 3rd does not exist.",
        "Constraints:\n- 1 <= n <= 5 * 10^4\n- parent[0] = -1 and 0 <= parent[i] < n for i > 0\n- 1 <= k <= 10^5, up to 5 * 10^4 calls to getKthAncestor",
      ],
      code: `class TreeAncestor {
    int n, LOG;
    vector<vector<int>> up;   // up[j][v] = the 2^j-th ancestor of v, or -1

public:
    TreeAncestor(int n, vector<int>& parent) : n(n) {
        LOG = 1;
        while ((1 << LOG) < n) LOG++;        // 2^LOG >= n covers every depth
        up.assign(LOG + 1, vector<int>(n, -1));
        up[0] = parent;
        for (int j = 1; j <= LOG; j++)
            for (int v = 0; v < n; v++) {
                int mid = up[j - 1][v];      // halfway up
                up[j][v] = (mid == -1 ? -1 : up[j - 1][mid]);
            }
    }

    int getKthAncestor(int node, int k) {
        if (k >= n) return -1;               // deeper than any possible chain
        for (int j = 0; j <= LOG && node != -1; j++)
            if (k >> j & 1) node = up[j][node];   // consume one set bit of k
        return node;
    }
};`,
      explanation: [
        "The table is the whole pattern. up[0] is the parent array; up[j][v] is reached by taking two jumps of length 2^(j-1), which is why the recurrence up[j][v] = up[j-1][up[j-1][v]] is correct - jumping halfway twice lands exactly 2^j levels up.",
        "A query decomposes k into its binary representation and performs one jump per set bit, so at most log n jumps. Order does not matter because the jumps commute along a single upward chain; processing low bits first is just convenient.",
        "-1 is an absorbing state: once the walk falls off the root every further jump keeps returning -1, so no bounds checking is needed inside the loop. The guard k >= n matters because k can exceed n, and bits of k above LOG would otherwise be silently ignored and produce a wrong non-negative answer.",
        "The tempting wrong approach is to walk up one parent at a time, which is O(k) per query and degenerates to O(nq) on a path-shaped tree.",
        "Time: O(n log n) preprocessing, O(log n) per query. Space: O(n log n).",
      ],
    },
    {
      name: "Company Queries I",
      difficulty: "Easy",
      variation: "K-th ancestor on a judge, iterative build",
      link: "https://cses.fi/problemset/task/1687",
      question: [
        "A company has n employees numbered 1..n. Employee 1 is the general director and every other employee i has exactly one boss, given as an array. Process q queries of the form (x, k): print the k-th boss of employee x, that is the employee reached by moving up the hierarchy k times, or -1 if no such employee exists.",
        "Example 1:\nInput:\n5 3\n1 1 3 3\n4 1\n4 2\n4 3\nOutput:\n3\n1\n-1\nExplanation: The bosses of 2,3,4,5 are 1,1,3,3. From employee 4 the chain upwards is 3 then 1, and then it ends, so the third step has no answer.",
        "Constraints:\n- 1 <= n, q <= 2 * 10^5\n- 1 <= k <= 10^9",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    const int LOG = 18;   // 2^18 > 2*10^5, enough for any depth
    vector<vector<int>> up(LOG, vector<int>(n + 1, 0));   // 0 means 'no ancestor'
    for (int i = 2; i <= n; i++) cin >> up[0][i];
    for (int j = 1; j < LOG; j++)
        for (int v = 1; v <= n; v++)
            up[j][v] = up[j - 1][up[j - 1][v]];   // up[*][0] == 0, so 0 absorbs
    while (q--) {
        int x;
        long long k;
        cin >> x >> k;
        if (k >= n) { cout << -1 << "\\n"; continue; }   // deeper than the tree
        for (int j = 0; j < LOG && x; j++)
            if (k >> j & 1) x = up[j][x];
        cout << (x ? x : -1) << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Same jump table as the previous problem, but with 0 rather than -1 as the sentinel for 'no ancestor'. That lets up[j][v] = up[j-1][up[j-1][v]] be written without a branch, because row entries for the fake node 0 stay 0 forever.",
        "The build is iterative and bottom-up over j, not a DFS, so it needs no recursion and cannot stack overflow on a chain of 2 * 10^5 employees. It also does not assume boss[i] < i.",
        "k can be as large as 10^9 while depths are below n. Reading k into a 64-bit value and short-circuiting k >= n keeps the bit loop inside the 18 columns that actually exist; forgetting that check is the classic wrong answer here.",
        "Time: O(n log n + q log n). Space: O(n log n).",
      ],
    },
    {
      name: "Company Queries II",
      difficulty: "Medium",
      variation: "LCA with binary lifting, the template",
      link: "https://cses.fi/problemset/task/1688",
      question: [
        "A company has n employees numbered 1..n, employee 1 being the general director, and every other employee has one boss. Process q queries: given two employees a and b, print their lowest common boss, i.e. the deepest employee who is a superior of both (an employee counts as a superior of themself).",
        "Example 1:\nInput:\n5 3\n1 1 3 3\n4 5\n2 5\n1 4\nOutput:\n3\n1\n1\nExplanation: The hierarchy is 1 -> {2,3} and 3 -> {4,5}. Employees 4 and 5 share boss 3. Employees 2 and 5 only meet at 1. For 1 and 4 the answer is 1 itself, since 1 is an ancestor of 4.",
        "Constraints:\n- 1 <= n, q <= 2 * 10^5\n- The hierarchy is a tree rooted at employee 1",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    const int LOG = 18;
    vector<vector<int>> up(LOG, vector<int>(n + 1, 0));
    vector<vector<int>> child(n + 1);
    for (int i = 2; i <= n; i++) {
        int b;
        cin >> b;
        up[0][i] = b;
        child[b].push_back(i);
    }
    vector<int> depth(n + 1, 0), order;
    order.reserve(n);
    order.push_back(1);
    for (int i = 0; i < (int)order.size(); i++) {   // BFS instead of DFS: no stack limit
        int u = order[i];
        for (int v : child[u]) {
            depth[v] = depth[u] + 1;
            order.push_back(v);
        }
    }
    for (int j = 1; j < LOG; j++)
        for (int v = 1; v <= n; v++)
            up[j][v] = up[j - 1][up[j - 1][v]];

    auto lca = [&](int a, int b) {
        if (depth[a] < depth[b]) swap(a, b);
        int d = depth[a] - depth[b];
        for (int j = 0; j < LOG; j++)              // step 1: equalise depths
            if (d >> j & 1) a = up[j][a];
        if (a == b) return a;                      // b was an ancestor of a
        for (int j = LOG - 1; j >= 0; j--)         // step 2: jump as high as still differs
            if (up[j][a] != up[j][b]) { a = up[j][a]; b = up[j][b]; }
        return up[0][a];                           // now the parents coincide
    };

    while (q--) {
        int a, b;
        cin >> a >> b;
        cout << lca(a, b) << "\\n";
    }
    return 0;
}`,
      explanation: [
        "LCA is two phases on top of the same jump table. First lift the deeper node by exactly the depth difference so both nodes sit on the same level. If they became equal, one was an ancestor of the other and we are done - handling this case separately is essential, the second phase would otherwise skip past the answer.",
        "The second phase is a descending greedy: for j from high to low, jump both nodes by 2^j whenever their 2^j-th ancestors still differ. The invariant maintained is that a and b are always strictly below the LCA and at equal depth. Jumping only when the ancestors differ guarantees we never overshoot above the LCA, and after the loop a and b are the two distinct children of the LCA on their respective branches, so up[0][a] is the answer.",
        "Why comparing up[j][a] != up[j][b] is the right test: the set of levels where the two upward chains have already merged is an upward-closed suffix, so 'still different' is a monotone predicate and the standard binary-decomposition greedy applies, exactly like binary search on the merge point.",
        "Depths are computed with an explicit BFS queue rather than recursion because a chain of 2 * 10^5 nodes can overflow the default stack on many judges.",
        "Time: O(n log n) preprocessing, O(log n) per query. Space: O(n log n).",
      ],
    },
    {
      name: "Find Distance in a Binary Tree",
      difficulty: "Medium",
      variation: "Distance via LCA on a small tree",
      link: "https://leetcode.com/problems/find-distance-in-a-binary-tree/",
      question: [
        "Given the root of a binary tree and two integer values p and q that both appear in the tree, return the number of edges on the shortest path between the nodes holding those values.",
        "Example 1:\nInput: root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 0\nOutput: 3\nExplanation: The path is 5 -> 3 -> 1 -> 0, which is 3 edges.",
        "Example 2:\nInput: root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 7\nOutput: 2\nExplanation: 7 lies under 5 via 5 -> 2 -> 7, so the distance is 2. If p == q the distance is 0.",
        "Constraints:\n- 1 <= number of nodes <= 10^4\n- All node values are unique and both p and q exist in the tree",
      ],
      code: `class Solution {
    TreeNode* lca(TreeNode* r, int p, int q) {
        if (!r || r->val == p || r->val == q) return r;
        TreeNode* L = lca(r->left, p, q);
        TreeNode* R = lca(r->right, p, q);
        if (L && R) return r;
        return L ? L : R;
    }

    int depthTo(TreeNode* r, int target) {        // edges from r down to target, -1 if absent
        if (!r) return -1;
        if (r->val == target) return 0;
        int L = depthTo(r->left, target);
        if (L >= 0) return L + 1;
        int R = depthTo(r->right, target);
        return R >= 0 ? R + 1 : -1;
    }

public:
    int findDistance(TreeNode* root, int p, int q) {
        if (p == q) return 0;
        TreeNode* l = lca(root, p, q);
        return depthTo(l, p) + depthTo(l, q);
    }
};`,
      explanation: [
        "The key identity of this whole topic: dist(u, v) = depth(u) + depth(v) - 2 * depth(lca(u, v)). The unique tree path from u to v climbs from u to the LCA and then descends to v, and the segment from the root down to the LCA is shared by both root-paths, hence subtracted twice.",
        "Here the tree is tiny and unrooted-by-index, so the distances are measured directly from the LCA downwards instead of from precomputed depths - same identity, just rearranged as dist = dist(l, p) + dist(l, q).",
        "The p == q shortcut matters: the generic code path would still return 0, but only because depthTo(l, p) is 0 twice; making it explicit documents the intent and guards against variants where p == q is illegal.",
        "On a static tree with many distance queries you would instead root once, precompute depth plus the lifting table, and answer each query with the identity above in O(log n) - that is the next problem.",
        "Time: O(n). Space: O(h) recursion stack.",
      ],
    },
    {
      name: "Distance Queries",
      difficulty: "Medium",
      variation: "Path length from depths and LCA",
      link: "https://cses.fi/problemset/task/1135",
      question: [
        "You are given a tree with n nodes numbered 1..n. Process q queries: for each pair (a, b) print the number of edges on the path between nodes a and b.",
        "Example 1:\nInput:\n5 3\n1 2\n1 3\n3 4\n3 5\n1 5\n2 4\n2 5\nOutput:\n2\n3\n3\nExplanation: The edges are 1-2, 1-3, 3-4, 3-5. The path 1-3-5 has 2 edges, 2-1-3-4 has 3 edges and 2-1-3-5 has 3 edges.",
        "Constraints:\n- 1 <= n, q <= 2 * 10^5\n- The n-1 given edges form a tree",
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
    vector<int> depth(n + 1, 0), order;
    order.reserve(n);
    order.push_back(1);
    vector<char> seen(n + 1, 0);
    seen[1] = 1;
    for (int i = 0; i < (int)order.size(); i++) {   // BFS root at 1
        int u = order[i];
        for (int v : adj[u]) if (!seen[v]) {
            seen[v] = 1;
            up[0][v] = u;
            depth[v] = depth[u] + 1;
            order.push_back(v);
        }
    }
    for (int j = 1; j < LOG; j++)
        for (int v = 1; v <= n; v++)
            up[j][v] = up[j - 1][up[j - 1][v]];

    auto lca = [&](int a, int b) {
        if (depth[a] < depth[b]) swap(a, b);
        int d = depth[a] - depth[b];
        for (int j = 0; j < LOG; j++)
            if (d >> j & 1) a = up[j][a];
        if (a == b) return a;
        for (int j = LOG - 1; j >= 0; j--)
            if (up[j][a] != up[j][b]) { a = up[j][a]; b = up[j][b]; }
        return up[0][a];
    };

    while (q--) {
        int a, b;
        cin >> a >> b;
        cout << depth[a] + depth[b] - 2 * depth[lca(a, b)] << "\\n";
    }
    return 0;
}`,
      explanation: [
        "The tree is given as undirected edges, so it must first be rooted: one BFS from node 1 assigns every node a parent and a depth, and only then does the lifting table make sense.",
        "With depths in hand each query is the identity dist(a, b) = depth[a] + depth[b] - 2 * depth[lca(a, b)]. No path is ever walked, which is what keeps 2 * 10^5 queries fast.",
        "A subtle build detail: the BFS visited array is required, otherwise the parent edge is traversed back down and depths get corrupted. Using up[0][v] itself as the visited marker also works, but only because the root is the sole node with parent 0.",
        "Rooting the tree at an arbitrary node is free here - LCA depends on the root, but the distance formula gives the same value for every choice of root, since the tree path between two nodes is unique.",
        "Time: O(n log n + q log n). Space: O(n log n).",
      ],
    },
    {
      name: "Counting Paths",
      difficulty: "Hard",
      variation: "Node path counting with LCA plus subtree difference",
      link: "https://cses.fi/problemset/task/1136",
      question: [
        "You are given a tree with n nodes numbered 1..n and m paths, each path given as its two endpoints. For every node print the number of the m paths that pass through it (an endpoint counts as being on its own path).",
        "Example 1:\nInput:\n5 3\n1 2\n1 3\n3 4\n3 5\n1 4\n4 5\n2 5\nOutput:\n2 1 3 2 2\nExplanation: The tree edges are 1-2, 1-3, 3-4, 3-5. The paths cover the node sets {1,3,4}, {4,3,5} and {2,1,3,5}. Node 3 lies on all three, node 2 on only one.",
        "Constraints:\n- 1 <= n, m <= 2 * 10^5\n- The n-1 edges form a tree",
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
    vector<int> depth(n + 1, 0), order;
    order.reserve(n);
    order.push_back(1);
    vector<char> seen(n + 1, 0);
    seen[1] = 1;
    for (int i = 0; i < (int)order.size(); i++) {
        int u = order[i];
        for (int v : adj[u]) if (!seen[v]) {
            seen[v] = 1;
            up[0][v] = u;
            depth[v] = depth[u] + 1;
            order.push_back(v);
        }
    }
    for (int j = 1; j < LOG; j++)
        for (int v = 1; v <= n; v++)
            up[j][v] = up[j - 1][up[j - 1][v]];

    auto lca = [&](int a, int b) {
        if (depth[a] < depth[b]) swap(a, b);
        int d = depth[a] - depth[b];
        for (int j = 0; j < LOG; j++)
            if (d >> j & 1) a = up[j][a];
        if (a == b) return a;
        for (int j = LOG - 1; j >= 0; j--)
            if (up[j][a] != up[j][b]) { a = up[j][a]; b = up[j][b]; }
        return up[0][a];
    };

    vector<long long> diff(n + 1, 0);
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        int l = lca(a, b);
        diff[a]++;
        diff[b]++;
        diff[l]--;                      // l counted twice by the two endpoints
        if (up[0][l]) diff[up[0][l]]--; // cancel the contribution above l
    }
    for (int i = (int)order.size() - 1; i >= 1; i--) {   // children before parents
        int v = order[i];
        diff[up[0][v]] += diff[v];
    }
    for (int i = 1; i <= n; i++) cout << diff[i] << " \\n"[i == n];
    return 0;
}`,
      explanation: [
        "Think of each path a-b as +1 on every node of the path. The trick is to express that as O(1) point updates plus one global subtree-sum pass, because m paths of length O(n) cannot be walked explicitly.",
        "Add +1 at a and +1 at b, then accumulate each node's value as the sum of its subtree. A single +1 at a propagates upwards along the whole root-path of a, which over-covers everything strictly above the LCA. Correcting it needs -1 at l and -1 at parent(l): the two endpoint marks both reach l, so one must be removed there, and both must be fully cancelled from parent(l) upwards, which the two decrements together achieve.",
        "Concretely for the sample the accumulated diff array before summing is [-2, 1, -1, 2, 2] for nodes 1..5, and the subtree sums come out as 2, 1, 3, 2, 2 - matching the expected answer.",
        "The subtree sums are taken in reverse BFS order, which guarantees every child is finished before its parent and avoids recursion entirely. Writing diff[up[0][v]] is safe for the root because index 0 is a scratch slot.",
        "The tempting wrong version puts -2 at the LCA (the correct choice for edge counting) and produces answers that are off by one at every ancestor - node versus edge marking is the classic bug here.",
        "Time: O((n + m) log n). Space: O(n log n).",
      ],
    },
    {
      name: "Fools and Roads",
      difficulty: "Hard",
      variation: "Edge path counting, difference on edges",
      link: "https://codeforces.com/problemset/problem/191/C",
      question: [
        "There are n cities connected by n-1 roads forming a tree. k people each travel from a city a to a city b along the unique path between them. For every road, in the order the roads were given in the input, print how many of the k people used it.",
        "Example 1:\nInput:\n5\n1 2\n1 3\n2 4\n2 5\n2\n1 4\n3 5\nOutput:\n2 1 1 1\nExplanation: The traveller 1 -> 4 uses roads (1,2) and (2,4). The traveller 3 -> 5 goes 3 -> 1 -> 2 -> 5 and uses roads (1,3), (1,2), (2,5). So road (1,2) is used twice and the other three once each.",
        "Example 2:\nInput:\n5\n3 4\n4 5\n1 4\n2 4\n3\n2 3\n1 3\n3 5\nOutput:\n3 1 1 1\nExplanation: All three trips pass through road (3,4), while roads (4,5), (1,4) and (2,4) each carry exactly one trip.",
        "Constraints:\n- 2 <= n <= 10^5\n- 0 <= k <= 10^5\n- The n-1 roads form a tree",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> ea(n), eb(n);
    vector<vector<int>> adj(n + 1);
    for (int i = 1; i < n; i++) {
        cin >> ea[i] >> eb[i];
        adj[ea[i]].push_back(eb[i]);
        adj[eb[i]].push_back(ea[i]);
    }
    const int LOG = 17;
    vector<vector<int>> up(LOG, vector<int>(n + 1, 0));
    vector<int> depth(n + 1, 0), order;
    order.reserve(n);
    order.push_back(1);
    vector<char> seen(n + 1, 0);
    seen[1] = 1;
    for (int i = 0; i < (int)order.size(); i++) {
        int u = order[i];
        for (int v : adj[u]) if (!seen[v]) {
            seen[v] = 1;
            up[0][v] = u;
            depth[v] = depth[u] + 1;
            order.push_back(v);
        }
    }
    for (int j = 1; j < LOG; j++)
        for (int v = 1; v <= n; v++)
            up[j][v] = up[j - 1][up[j - 1][v]];

    auto lca = [&](int a, int b) {
        if (depth[a] < depth[b]) swap(a, b);
        int d = depth[a] - depth[b];
        for (int j = 0; j < LOG; j++)
            if (d >> j & 1) a = up[j][a];
        if (a == b) return a;
        for (int j = LOG - 1; j >= 0; j--)
            if (up[j][a] != up[j][b]) { a = up[j][a]; b = up[j][b]; }
        return up[0][a];
    };

    int k;
    cin >> k;
    vector<long long> diff(n + 1, 0);
    while (k--) {
        int a, b;
        cin >> a >> b;
        int l = lca(a, b);
        diff[a]++;
        diff[b]++;
        diff[l] -= 2;          // edge version: kill both marks exactly at the LCA
    }
    for (int i = (int)order.size() - 1; i >= 1; i--) {
        int v = order[i];
        diff[up[0][v]] += diff[v];
    }
    for (int i = 1; i < n; i++) {
        int deeper = depth[ea[i]] > depth[eb[i]] ? ea[i] : eb[i];   // edge is identified by its lower endpoint
        cout << diff[deeper] << " \\n"[i == n - 1];
    }
    return 0;
}`,
      explanation: [
        "Every edge of a rooted tree is uniquely identified by its deeper endpoint v: it is the edge (parent(v), v). So an answer per edge is the same thing as an answer per non-root node, and the subtree sum of a difference array gives all of them in one pass.",
        "For a trip a-b the edges used are exactly those whose deeper endpoint lies on the path and is strictly below the LCA. Marking +1 at a and +1 at b and summing subtrees credits every ancestor edge of a and of b; subtracting 2 at the LCA cancels both marks from the LCA's own parent edge upwards, leaving precisely the path edges.",
        "Contrast with the previous problem: node counting uses -1 at l and -1 at parent(l), edge counting uses -2 at l. The difference is whether the LCA itself should be counted, and mixing the two up is the single most common mistake in this family.",
        "Output order must follow the input edge order, so the endpoints of each input edge are stored and the deeper one is looked up afterwards - the BFS may orient edges either way relative to the input.",
        "Time: O((n + k) log n). Space: O(n log n).",
      ],
    },
    {
      name: "A and B and Lecture Rooms",
      difficulty: "Hard",
      variation: "Midpoint of a path via k-th ancestor and subtree sizes",
      link: "https://codeforces.com/problemset/problem/519/E",
      question: [
        "You are given a tree with n rooms numbered 1..n connected by n-1 corridors. Answer m queries: for a pair of rooms (a, b), count the rooms that are at the same distance from a as from b.",
        "Example 1:\nInput:\n4\n1 2\n1 3\n2 4\n1\n2 3\nOutput:\n1\nExplanation: Only room 1 is equidistant from rooms 2 and 3 (distance 1 to each). Rooms 2, 3 and 4 all have different distances to the two endpoints.",
        "Example 2:\nInput:\n4\n1 2\n2 3\n2 4\n2\n1 2\n1 3\nOutput:\n0\n2\nExplanation: The distance from 1 to 2 is 1, an odd number, so no room can be equidistant. For the pair (1,3) the distance is 2 and the midpoint is room 2; rooms 2 and 4 are both at distance 1 from each endpoint.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= m <= 10^5\n- If a == b the answer is n, since every room is trivially equidistant",
      ],
      code: `int n, LOG = 17;
vector<vector<int>> adj, up;
vector<int> depth_, sz, order;

int kth(int v, int k) {                     // k-th ancestor of v
    for (int j = 0; j < LOG && v; j++)
        if (k >> j & 1) v = up[j][v];
    return v;
}

int lca(int a, int b) {
    if (depth_[a] < depth_[b]) swap(a, b);
    int d = depth_[a] - depth_[b];
    for (int j = 0; j < LOG; j++)
        if (d >> j & 1) a = up[j][a];
    if (a == b) return a;
    for (int j = LOG - 1; j >= 0; j--)
        if (up[j][a] != up[j][b]) { a = up[j][a]; b = up[j][b]; }
    return up[0][a];
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
    up.assign(LOG, vector<int>(n + 1, 0));
    depth_.assign(n + 1, 0);
    sz.assign(n + 1, 1);
    order.reserve(n);
    order.push_back(1);
    vector<char> seen(n + 1, 0);
    seen[1] = 1;
    for (int i = 0; i < (int)order.size(); i++) {
        int u = order[i];
        for (int v : adj[u]) if (!seen[v]) {
            seen[v] = 1;
            up[0][v] = u;
            depth_[v] = depth_[u] + 1;
            order.push_back(v);
        }
    }
    for (int i = (int)order.size() - 1; i >= 1; i--) sz[up[0][order[i]]] += sz[order[i]];
    for (int j = 1; j < LOG; j++)
        for (int v = 1; v <= n; v++)
            up[j][v] = up[j - 1][up[j - 1][v]];

    int m;
    cin >> m;
    while (m--) {
        int a, b;
        cin >> a >> b;
        if (a == b) { cout << n << "\\n"; continue; }
        int l = lca(a, b);
        int d = depth_[a] + depth_[b] - 2 * depth_[l];
        if (d & 1) { cout << 0 << "\\n"; continue; }   // odd path has no middle node
        int h = d / 2;
        if (depth_[a] < depth_[b]) swap(a, b);         // a is the deeper endpoint
        if (depth_[a] - depth_[l] == h) {
            // the middle node is the LCA itself: drop the two branches it came from
            int ca = kth(a, h - 1), cb = kth(b, h - 1);
            cout << n - sz[ca] - sz[cb] << "\\n";
        } else {
            int mid = kth(a, h), c = kth(a, h - 1);    // middle lies strictly below the LCA
            cout << sz[mid] - sz[c] << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "Any node equidistant from a and b must be equidistant from the midpoint of the a-b path, so the whole answer is a subtree-size computation around one node found by k-th-ancestor jumps. If the path length is odd there is no middle node and the answer is 0 immediately.",
        "Two geometrically different cases. If both endpoints are exactly h = d/2 above the LCA, the midpoint is the LCA, and the equidistant set is everything except the two branches hanging off it towards a and towards b - those branches are strictly closer to one endpoint. Hence n minus the sizes of the two children subtrees, found as kth(a, h-1) and kth(b, h-1).",
        "Otherwise the deeper endpoint is more than h above the LCA, so the midpoint mid = kth(a, h) lies strictly inside a's side of the path. Everything in mid's subtree except the child branch containing a is equidistant, giving sz[mid] - sz[kth(a, h-1)]. Nodes outside mid's subtree reach a only through mid and are therefore strictly closer to b.",
        "The a == b case must be special-cased to n, and the deeper-endpoint swap must happen after the LCA and the distance are computed, otherwise h is measured from the wrong side.",
        "Time: O(n log n) preprocessing, O(log n) per query. Space: O(n log n).",
      ],
    },
    {
      name: "Minimum Edge Weight Equilibrium Queries in a Tree",
      difficulty: "Hard",
      variation: "Carrying prefix aggregates to the LCA",
      link: "https://leetcode.com/problems/minimum-edge-weight-equilibrium-queries-in-a-tree/",
      question: [
        "You are given an undirected tree with n nodes numbered 0..n-1, described by edges[i] = [u, v, w] where w is the weight of the edge, with 1 <= w <= 26. For each query [a, b] you may repeatedly pick any edge of the tree and change its weight to any value; return the minimum number of such changes needed so that all edges on the path from a to b have the same weight. Queries are independent: the tree is restored to its original weights before each one.",
        "Example 1:\nInput: n = 7, edges = [[0,1,1],[1,2,1],[2,3,6],[3,4,3],[3,5,6],[2,6,1]], queries = [[0,3],[0,5]]\nOutput: [1,2]\nExplanation: The path 0-1-2-3 has weights 1,1,6; keeping the two 1s and rewriting the 6 costs 1 change. The path 0-1-2-3-5 has weights 1,1,6,6; the best kept weight appears twice, so 4 - 2 = 2 changes are needed.",
        "Example 2:\nInput: n = 4, edges = [[1,0,4],[2,0,4],[3,0,4]], queries = [[0,1],[1,2],[2,3]]\nOutput: [0,0,0]\nExplanation: Every edge already has weight 4, so every path is already uniform and no change is ever required.",
        "Constraints:\n- 1 <= n <= 10^4\n- 1 <= w <= 26\n- 1 <= queries.length <= 2 * 10^4",
      ],
      code: `class Solution {
public:
    vector<int> minOperationsQueries(int n, vector<vector<int>>& edges, vector<vector<int>>& queries) {
        vector<vector<pair<int,int>>> adj(n);
        for (auto& e : edges) {
            adj[e[0]].push_back({e[1], e[2]});
            adj[e[1]].push_back({e[0], e[2]});
        }
        int LOG = 1;
        while ((1 << LOG) < n) LOG++;
        vector<vector<int>> up(LOG + 1, vector<int>(n, 0));
        vector<vector<int>> cnt(n, vector<int>(27, 0));   // cnt[v][w] on the root->v path
        vector<int> depth(n, 0), order;
        order.reserve(n);
        order.push_back(0);
        vector<char> seen(n, 0);
        seen[0] = 1;
        for (int i = 0; i < (int)order.size(); i++) {
            int u = order[i];
            for (auto& [v, w] : adj[u]) if (!seen[v]) {
                seen[v] = 1;
                up[0][v] = u;
                depth[v] = depth[u] + 1;
                cnt[v] = cnt[u];        // inherit the ancestor prefix, then add this edge
                cnt[v][w]++;
                order.push_back(v);
            }
        }
        for (int j = 1; j <= LOG; j++)
            for (int v = 0; v < n; v++)
                up[j][v] = up[j - 1][up[j - 1][v]];

        auto lca = [&](int a, int b) {
            if (depth[a] < depth[b]) swap(a, b);
            int d = depth[a] - depth[b];
            for (int j = 0; j <= LOG; j++)
                if (d >> j & 1) a = up[j][a];
            if (a == b) return a;
            for (int j = LOG; j >= 0; j--)
                if (up[j][a] != up[j][b]) { a = up[j][a]; b = up[j][b]; }
            return up[0][a];
        };

        vector<int> ans;
        ans.reserve(queries.size());
        for (auto& qr : queries) {
            int a = qr[0], b = qr[1], l = lca(a, b);
            int len = depth[a] + depth[b] - 2 * depth[l];
            int best = 0;
            for (int w = 1; w <= 26; w++)                       // inclusion-exclusion per weight
                best = max(best, cnt[a][w] + cnt[b][w] - 2 * cnt[l][w]);
            ans.push_back(len - best);
        }
        return ans;
    }
};`,
      explanation: [
        "Each operation fixes one edge, and the cheapest plan keeps whichever weight is most frequent on the path and rewrites all the others. So the answer is pathLength - maxFrequency, and both quantities must be obtained without walking the path.",
        "Both are prefix aggregates over root-paths, and both use the same subtraction as the distance formula: for any additive statistic f, f(path a-b) = f(root..a) + f(root..b) - 2 * f(root..lca). Length uses depth; frequency uses a 26-slot counter per node, inherited from the parent during the BFS and incremented by the incoming edge's weight.",
        "Because the weight alphabet is tiny, storing a full histogram per node costs only 26n memory and makes each query a 26-way scan. That is what makes the aggregate liftable at all - the same idea with arbitrary weights would need a different decomposition, for instance small-to-large or persistent structures.",
        "The tempting wrong answer is len - 1 assuming the majority weight always appears at least once usefully, or forgetting the factor 2 on the LCA term, which double-counts the shared root prefix and inflates the frequency.",
        "Time: O(26n + n log n + 26q + q log n). Space: O(26n + n log n).",
      ],
    },
    {
      name: "Minimum spanning tree for each edge",
      difficulty: "Hard",
      variation: "Maximum edge on a path via lifting with aggregates",
      link: "https://codeforces.com/problemset/problem/609/E",
      question: [
        "You are given a connected weighted undirected graph with n vertices and m edges. For every edge, print the minimum possible total weight of a spanning tree of the graph that is required to contain that edge.",
        "Example 1:\nInput:\n5 7\n1 2 3\n1 3 1\n1 4 5\n2 3 2\n2 5 3\n3 4 2\n4 5 4\nOutput:\n9\n8\n11\n8\n8\n8\n9\nExplanation: A minimum spanning tree uses edges (1,3,1), (2,3,2), (3,4,2) and (2,5,3) for a total of 8, so every edge already in it answers 8. Forcing edge (1,2,3) creates a cycle with tree path 1-3-2 whose heaviest edge weighs 2, so the answer is 8 - 2 + 3 = 9. Forcing (1,4,5) gives 8 - 2 + 5 = 11 and forcing (4,5,4) gives 8 - 3 + 4 = 9.",
        "Constraints:\n- 1 <= n <= 2 * 10^5, n-1 <= m <= 2 * 10^5\n- 1 <= weight <= 10^9\n- The graph is connected and has no self-loops or multiple edges",
      ],
      code: `int n, m, LOG = 18;
vector<int> par;

int findp(int x) { return par[x] == x ? x : par[x] = findp(par[x]); }   // DSU with compression

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n >> m;
    vector<int> eu(m), ev(m);
    vector<long long> ew(m);
    vector<int> idx(m);
    for (int i = 0; i < m; i++) {
        cin >> eu[i] >> ev[i] >> ew[i];
        idx[i] = i;
    }
    sort(idx.begin(), idx.end(), [&](int x, int y) { return ew[x] < ew[y]; });

    par.resize(n + 1);
    for (int i = 1; i <= n; i++) par[i] = i;
    vector<char> inMst(m, 0);
    vector<vector<pair<int,long long>>> adj(n + 1);
    long long total = 0;
    for (int i : idx) {
        int a = findp(eu[i]), b = findp(ev[i]);
        if (a == b) continue;
        par[a] = b;
        inMst[i] = 1;
        total += ew[i];
        adj[eu[i]].push_back({ev[i], ew[i]});
        adj[ev[i]].push_back({eu[i], ew[i]});
    }

    vector<vector<int>> up(LOG, vector<int>(n + 1, 0));
    vector<vector<long long>> mx(LOG, vector<long long>(n + 1, 0));   // heaviest edge in the jump
    vector<int> depth(n + 1, 0), order;
    order.reserve(n);
    order.push_back(1);
    vector<char> seen(n + 1, 0);
    seen[1] = 1;
    for (int i = 0; i < (int)order.size(); i++) {
        int u = order[i];
        for (auto& [v, w] : adj[u]) if (!seen[v]) {
            seen[v] = 1;
            up[0][v] = u;
            mx[0][v] = w;
            depth[v] = depth[u] + 1;
            order.push_back(v);
        }
    }
    for (int j = 1; j < LOG; j++)
        for (int v = 1; v <= n; v++) {
            int mid = up[j - 1][v];
            up[j][v] = up[j - 1][mid];
            mx[j][v] = max(mx[j - 1][v], mx[j - 1][mid]);   // combine the two halves
        }

    auto maxOnPath = [&](int a, int b) {
        long long best = 0;
        if (depth[a] < depth[b]) swap(a, b);
        int d = depth[a] - depth[b];
        for (int j = 0; j < LOG; j++)
            if (d >> j & 1) { best = max(best, mx[j][a]); a = up[j][a]; }
        if (a == b) return best;
        for (int j = LOG - 1; j >= 0; j--)
            if (up[j][a] != up[j][b]) {
                best = max({best, mx[j][a], mx[j][b]});
                a = up[j][a];
                b = up[j][b];
            }
        return max({best, mx[0][a], mx[0][b]});   // the last two edges into the LCA
    };

    for (int i = 0; i < m; i++) {
        if (inMst[i]) cout << total << "\\n";
        else cout << total - maxOnPath(eu[i], ev[i]) + ew[i] << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Build one MST with Kruskal. If the forced edge is already in it the answer is simply the MST weight. Otherwise adding the edge (u, v, w) to the MST creates exactly one cycle, and the cheapest spanning tree containing it must drop the heaviest other edge of that cycle - which is the heaviest edge on the MST path from u to v. This is the cycle property of minimum spanning trees, and it also guarantees the replacement is optimal over all spanning trees containing the edge, not just over modifications of this one MST.",
        "So the query becomes 'maximum edge weight on a tree path', and binary lifting answers it by storing an aggregate alongside each jump: mx[j][v] is the heaviest of the 2^j edges above v, combined as max of two half-jumps exactly like the ancestor pointers themselves. Max is associative and idempotent, which is why no care about overlapping ranges is needed.",
        "The subtlety is finishing the second phase. After the descending loop a and b are the children of the LCA, so mx[0][a] and mx[0][b] must still be folded in - dropping them silently underestimates the heaviest edge whenever the answer is one of the two edges touching the LCA.",
        "Arithmetic: with 2 * 10^5 edges of weight up to 10^9 the MST weight reaches 2 * 10^14, so totals and answers must be 64-bit. Sorting only an index permutation keeps the original input order available for output.",
        "Time: O(m log m + n log n). Space: O(n log n + m).",
      ],
    },
  ],
};
