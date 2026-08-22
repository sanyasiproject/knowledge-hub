import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Subordinates",
      difficulty: "Easy",
      variation: "Subtree size, the template",
      link: "https://cses.fi/problemset/task/1674",
      question: [
        "A company has n employees numbered 1..n. Employee 1 is the general director, and every other employee i has exactly one direct boss, given as an integer between 1 and n. The structure is a rooted tree with employee 1 as the root. For every employee, print the number of subordinates below them, that is the number of employees in their subtree excluding themselves.",
        "Example 1:\nInput:\n5\n1 1 2 3\nOutput: 4 1 1 0 0\nExplanation: Employees 2 and 3 report to 1, employee 4 reports to 2, employee 5 reports to 3. Employee 1 has everyone else below them (4), employees 2 and 3 have one each, and 4 and 5 are leaves.",
        "Example 2:\nInput:\n1\nOutput: 0\nExplanation: A single employee has no subordinates, and there are no boss lines to read.",
        "Constraints:\n- 1 <= n <= 2 * 10^5\n- the boss of employee i is a valid employee number and the structure is a tree rooted at 1",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<vector<int>> child(n + 1);
    for (int i = 2; i <= n; i++) {
        int p;
        cin >> p;
        child[p].push_back(i);
    }
    // Iterative DFS: n can be 2*10^5 and a chain-shaped tree blows the stack.
    vector<int> order;
    order.reserve(n);
    vector<int> st{1};
    while (!st.empty()) {
        int u = st.back();
        st.pop_back();
        order.push_back(u);
        for (int v : child[u]) st.push_back(v);
    }
    vector<int> cnt(n + 1, 0);
    // order lists every parent before its children, so walking it backwards is a post-order.
    for (int i = n - 1; i >= 0; i--) {
        int u = order[i];
        for (int v : child[u]) cnt[u] += cnt[v] + 1;   // the child itself plus its own subordinates
    }
    for (int i = 1; i <= n; i++) cout << cnt[i] << " \\n"[i == n];
    return 0;
}`,
      explanation: [
        "This is the skeleton every tree DP is built on. The state is a single node u, and the value is an aggregate over u's subtree - here the count of nodes strictly below u. The transition reads only the children's already-finished values: cnt[u] = sum over children c of (cnt[c] + 1).",
        "Correctness comes from the fact that a rooted tree has no cycles, so the subtrees of distinct children are disjoint and together with u they exactly partition u's subtree. That disjointness is what lets you add child answers without any inclusion-exclusion.",
        "The evaluation order is the only real requirement: a node must be processed after all of its children. Recursion gives that for free, but at n = 2*10^5 a path-shaped tree overflows the default stack, so the standard fix is to record a DFS pre-order and then iterate it in reverse - every reversed pre-order is a valid post-order on a tree.",
        "The tempting wrong move is to loop i from n down to 1 assuming a parent always has a smaller index. Nothing in the statement promises that; the boss of employee 2 could be employee 5. Always derive the order from an actual traversal.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Diameter of Binary Tree",
      difficulty: "Easy",
      variation: "Combine the two best child branches",
      link: "https://leetcode.com/problems/diameter-of-binary-tree/",
      question: [
        "Given the root of a binary tree, return the length of its diameter, that is the number of edges on the longest path between any two nodes in the tree. The path does not need to pass through the root.",
        "Example 1:\nInput: root = [1,2,3,4,5]\nOutput: 3\nExplanation: The path 4 - 2 - 1 - 3 has 3 edges, and no path is longer.",
        "Example 2:\nInput: root = [1,2]\nOutput: 1\nExplanation: The only path uses the single edge.",
        "Constraints:\n- 1 <= number of nodes <= 10^4\n- -100 <= Node.val <= 100",
      ],
      code: `class Solution {
    int best = 0;

    int depth(TreeNode* u) {              // returns edges on the longest downward path from u
        if (!u) return 0;
        int l = depth(u->left);
        int r = depth(u->right);
        best = max(best, l + r);          // the path that turns at u uses both branches
        return 1 + max(l, r);             // what u can offer its own parent: one branch only
    }

public:
    int diameterOfBinaryTree(TreeNode* root) {
        depth(root);
        return best;
    }
};`,
      explanation: [
        "The key idea, and the one that recurs in every path-shaped tree DP: every path has a unique highest node. So instead of searching over paths, iterate over candidate turning points. For each node u, the best path turning at u is its two longest downward branches glued together.",
        "That splits the work into two different quantities. The value returned upward is a one-branch quantity, because a path continuing into u's parent may only use one side of u. The value folded into the global answer is a two-branch quantity. Mixing them up - returning l + r - is the classic bug here.",
        "Because every path is counted exactly once, at its own highest node, one post-order pass over the tree examines every candidate. No node is visited twice.",
        "The tempting wrong approach is to compute the depth of the root's two subtrees and add them. That only finds paths through the root, and the diameter frequently sits entirely inside one subtree.",
        "Time: O(n). Space: O(h) recursion stack, up to O(n) on a skewed tree.",
      ],
    },
    {
      name: "House Robber III",
      difficulty: "Medium",
      variation: "Include or exclude the node: maximum weight independent set",
      link: "https://leetcode.com/problems/house-robber-iii/",
      question: [
        "A thief has found a neighbourhood laid out as a binary tree with a single entrance at the root. Each house holds Node.val money. Two houses that are directly linked, that is a parent and its child, cannot both be robbed on the same night or the alarm goes off. Return the maximum amount of money the thief can rob.",
        "Example 1:\nInput: root = [3,2,3,null,3,null,1]\nOutput: 7\nExplanation: Rob the root (3), then the 3 hanging under the left child and the 1 under the right child: 3 + 3 + 1 = 7.",
        "Example 2:\nInput: root = [3,4,5,1,3,null,1]\nOutput: 9\nExplanation: Skip the root and rob both of its children: 4 + 5 = 9.",
        "Constraints:\n- 1 <= number of nodes <= 10^4\n- 0 <= Node.val <= 10^4",
      ],
      code: `class Solution {
    // {best with u robbed, best with u left alone}
    pair<int,int> dfs(TreeNode* u) {
        if (!u) return {0, 0};
        auto [lRob, lSkip] = dfs(u->left);
        auto [rRob, rSkip] = dfs(u->right);
        int rob = u->val + lSkip + rSkip;                     // children must be skipped
        int skip = max(lRob, lSkip) + max(rRob, rSkip);       // children are unconstrained
        return {rob, skip};
    }

public:
    int rob(TreeNode* root) {
        auto [rob, skip] = dfs(root);
        return max(rob, skip);
    }
};`,
      explanation: [
        "One node index is no longer enough state. Whether a child may be robbed depends on what the parent did, so the state gains a second dimension: dp[u][0] is the best total in u's subtree when u is robbed, dp[u][1] when it is not. Returning a pair from the DFS is the idiomatic way to carry both.",
        "The transitions are read straight off the constraint. Robbing u forbids robbing either child, so it adds only the children's skip values. Skipping u constrains nothing, so each child independently contributes its own maximum. Independence across children is legitimate because the only forbidden pairs are parent-child, never sibling-sibling.",
        "This is exactly maximum weight independent set on a tree, which is NP-hard on general graphs and linear on trees. The reason is that a tree's subtrees interact with the rest of the graph only through their root, so a single bit of context is sufficient summary.",
        "The wrong-but-tempting shortcut is the classic 'rob every other level' or, worse, the recursion val + grandchildren without memoising, which recomputes each subtree twice and degenerates exponentially. Note that dp[u][1] >= dp[u][0] is not guaranteed, so you must keep both values rather than collapsing to one.",
        "Time: O(n) - one visit per node, O(1) work each. Space: O(h) stack.",
      ],
    },
    {
      name: "Maximum Product of Splitted Binary Tree",
      difficulty: "Medium",
      variation: "Two passes: global total, then one cut per edge",
      link: "https://leetcode.com/problems/maximum-product-of-splitted-binary-tree/",
      question: [
        "Given the root of a binary tree, split it into two subtrees by removing exactly one edge. Return the maximum product of the sums of the two resulting subtrees, modulo 10^9 + 7. Maximise the product first and take the modulo only at the end.",
        "Example 1:\nInput: root = [1,2,3,4,5,6]\nOutput: 110\nExplanation: The whole tree sums to 21. Cutting the edge between 1 and 2 leaves a subtree summing to 2 + 4 + 5 = 11 and a remainder of 10, giving 110. Cutting the edge to 3 gives 9 * 12 = 108, which is worse.",
        "Example 2:\nInput: root = [1,null,2,3,4,null,null,5,6]\nOutput: 90\nExplanation: Total is 21. Cutting above node 4 gives 15 * 6 = 90.",
        "Constraints:\n- 2 <= number of nodes <= 5 * 10^4\n- 1 <= Node.val <= 10^4",
      ],
      code: `class Solution {
    long long total = 0, best = 0;

    long long collect(TreeNode* u) {           // pass 1: sum of the whole tree
        if (!u) return 0;
        return u->val + collect(u->left) + collect(u->right);
    }

    long long scan(TreeNode* u) {              // pass 2: cut the edge just above u
        if (!u) return 0;
        long long s = u->val + scan(u->left) + scan(u->right);
        // s == total only at the root, which has no edge above it
        if (s != total) best = max(best, s * (total - s));
        return s;
    }

public:
    int maxProduct(TreeNode* root) {
        total = collect(root);
        scan(root);
        return (int)(best % 1000000007LL);
    }
};`,
      explanation: [
        "Removing one edge always separates the subtree hanging below that edge from everything else. So the candidate set is exactly the n-1 non-root subtrees, and each is fully described by its own sum s: the other side is total - s. The subtree DP therefore only needs one number per node.",
        "Two passes are needed because the objective references a global quantity. The first pass computes total, the second reuses the same subtree-sum recurrence but can now evaluate s * (total - s) as soon as s is known. Trying to do it in one pass fails because the subtrees visited early do not yet know total.",
        "Modular arithmetic is the trap. The product must be maximised over the true integer values and only then reduced; comparing values that have already been taken modulo 10^9 + 7 destroys the ordering and gives a wrong answer. With 5 * 10^4 nodes of value 10^4, total is at most 5 * 10^8 and the product at most about 6.3 * 10^16, so long long holds it comfortably.",
        "A useful sanity check: s * (total - s) is maximised when s is as close as possible to total / 2, so the answer comes from the most balanced achievable cut - but you still have to test every edge, because balance may not be achievable.",
        "Time: O(n) for two linear passes. Space: O(h) stack.",
      ],
    },
    {
      name: "Binary Tree Maximum Path Sum",
      difficulty: "Hard",
      variation: "Path DP with negative weights, dropping bad branches",
      link: "https://leetcode.com/problems/binary-tree-maximum-path-sum/",
      question: [
        "A path in a binary tree is a sequence of nodes where each consecutive pair is connected by an edge, and no node appears more than once. The path does not need to pass through the root. The path sum is the sum of the values of its nodes. Given the root of a binary tree, return the maximum path sum over all non-empty paths.",
        "Example 1:\nInput: root = [1,2,3]\nOutput: 6\nExplanation: The path 2 - 1 - 3 sums to 2 + 1 + 3 = 6.",
        "Example 2:\nInput: root = [-10,9,20,null,null,15,7]\nOutput: 42\nExplanation: The path 15 - 20 - 7 sums to 42. Extending it up through -10 would only lose value.",
        "Constraints:\n- 1 <= number of nodes <= 3 * 10^4\n- -1000 <= Node.val <= 1000",
      ],
      code: `class Solution {
    int best = INT_MIN;

    int down(TreeNode* u) {                 // best sum of a downward path starting at u
        if (!u) return 0;
        int l = max(0, down(u->left));      // a negative branch is better dropped entirely
        int r = max(0, down(u->right));
        best = max(best, u->val + l + r);   // the path turning at u
        return u->val + max(l, r);          // a path continuing upward uses one side only
    }

public:
    int maxPathSum(TreeNode* root) {
        down(root);
        return best;
    }
};`,
      explanation: [
        "Same skeleton as tree diameter - enumerate the highest node of each path and glue its two best downward branches - but with weights that can be negative, which changes one thing: a branch is optional. Clamping each child's contribution at 0 says 'take this branch only if it helps', and that single max is what turns the unweighted argument into a weighted one.",
        "Because every candidate path is considered at its unique topmost node, and at that node both children are optional and independent, the maximum over all nodes is the true maximum over all paths.",
        "The subtlety is that best must be initialised to INT_MIN, not 0. An all-negative tree such as a single node -3 has answer -3, and a zero initialisation silently reports 0 - a path must be non-empty. Note that clamping the children at 0 is still correct here, because u->val itself is never clamped.",
        "The other frequent bug is returning u->val + l + r upward. That value describes a path that already turned at u and cannot be extended through u's parent without revisiting u; propagating it counts a branching shape as a path.",
        "Time: O(n). Space: O(h) stack, up to O(n) on a degenerate chain.",
      ],
    },
    {
      name: "Distribute Coins in Binary Tree",
      difficulty: "Medium",
      variation: "Flow along edges, signed subtree surplus",
      link: "https://leetcode.com/problems/distribute-coins-in-binary-tree/",
      question: [
        "You are given the root of a binary tree with n nodes, where each node holds Node.val coins and there are n coins in total. In one move you may transfer a single coin between two adjacent nodes, in either direction. Return the minimum number of moves needed so that every node holds exactly one coin.",
        "Example 1:\nInput: root = [3,0,0]\nOutput: 2\nExplanation: Move one coin from the root to each child.",
        "Example 2:\nInput: root = [0,3,0]\nOutput: 3\nExplanation: One coin travels left-child to root (1 move), another travels left-child to root to right-child (2 moves), and the left child keeps the third. Total 3.",
        "Constraints:\n- 1 <= n <= 100\n- 0 <= Node.val <= n\n- the sum of all Node.val equals n",
      ],
      code: `class Solution {
    int moves = 0;

    // Returns the signed surplus u's subtree must push up through the edge to its parent:
    // positive means it exports coins, negative means it must import them.
    int dfs(TreeNode* u) {
        if (!u) return 0;
        int l = dfs(u->left);
        int r = dfs(u->right);
        moves += abs(l) + abs(r);        // each unit crossing a child edge costs one move
        return u->val + l + r - 1;       // keep exactly one coin for u itself
    }

public:
    int distributeCoins(TreeNode* root) {
        dfs(root);
        return moves;
    }
};`,
      explanation: [
        "The state per node is a single signed number: how many coins the subtree has left over, or is short of, after every node inside it has been given exactly one coin. That is sum of values in the subtree minus its size, and it is computable bottom-up as val + left surplus + right surplus - 1.",
        "The cost argument is where the insight lives. Consider any single edge. The subtree below it has a fixed surplus d that depends only on the values, not on the strategy, and every coin resolving that imbalance must physically traverse this edge. So the edge is used at least abs(d) times, and summing abs(d) over all edges is a lower bound. It is also achievable: pushing each surplus straight along the edge realises exactly that count, so the bound is tight and the answer is the sum.",
        "Signs cancel naturally: a child returning +2 and a sibling returning -2 contribute 4 to the answer (two edge crossings each) while contributing 0 to the parent's surplus. Taking abs before adding into moves, but not before passing the value upward, is the whole trick.",
        "The tempting wrong model is a greedy simulation that repeatedly moves one coin to the neediest neighbour. It is far slower and easy to get stuck reasoning about, while the per-edge accounting is exact and needs no search at all.",
        "Time: O(n). Space: O(h) stack.",
      ],
    },
    {
      name: "Tree Matching",
      difficulty: "Medium",
      variation: "Maximum matching on a tree, best-child choice in the transition",
      link: "https://cses.fi/problemset/task/1130",
      question: [
        "You are given a tree with n nodes numbered 1..n. A matching is a set of edges such that no node belongs to more than one chosen edge. Print the maximum number of edges in a matching.",
        "Example 1:\nInput:\n5\n1 2\n1 3\n3 4\n3 5\nOutput: 2\nExplanation: Choose edges 1-2 and 3-4. No third edge can be added without reusing node 1 or node 3.",
        "Example 2:\nInput:\n3\n1 2\n2 3\nOutput: 1\nExplanation: Node 2 sits on both edges, so only one of them can be chosen.",
        "Constraints:\n- 1 <= n <= 2 * 10^5\n- the input describes a tree",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<vector<int>> adj(n + 1);
    for (int i = 0; i < n - 1; i++) {
        int a, b;
        cin >> a >> b;
        adj[a].push_back(b);
        adj[b].push_back(a);
    }
    vector<int> par(n + 1, 0), order;
    order.reserve(n);
    vector<char> seen(n + 1, 0);
    vector<int> st{1};
    seen[1] = 1;
    while (!st.empty()) {                     // iterative DFS, root at 1
        int u = st.back();
        st.pop_back();
        order.push_back(u);
        for (int v : adj[u]) if (!seen[v]) {
            seen[v] = 1;
            par[v] = u;
            st.push_back(v);
        }
    }
    // dp0[u]: best matching inside u's subtree with u left free.
    // dp1[u]: best matching inside u's subtree, u allowed to use one edge to a child.
    vector<int> dp0(n + 1, 0), dp1(n + 1, 0);
    for (int i = n - 1; i >= 0; i--) {
        int u = order[i];
        int base = 0, gain = 0;
        for (int v : adj[u]) if (v != par[u]) base += max(dp0[v], dp1[v]);
        for (int v : adj[u]) if (v != par[u]) {
            // swap child v to its "free" value and pay 1 for the edge u-v
            gain = max(gain, 1 + dp0[v] - max(dp0[v], dp1[v]));
        }
        dp0[u] = base;
        dp1[u] = base + gain;
    }
    cout << max(dp0[1], dp1[1]) << "\\n";
    return 0;
}`,
      explanation: [
        "Root the tree anywhere. Each node has one bit of relevant context for its parent: is it already matched, in which case the parent cannot use the edge to it, or is it free. So dp0[u] is the best matching in u's subtree with u guaranteed unmatched, and dp1[u] is the best with no such guarantee.",
        "dp0[u] is just the sum over children of their unconstrained best, since a child being matched downward never conflicts with u staying free. For dp1[u], u may match to at most one child v; doing so forces v to be free, which costs max(dp0[v], dp1[v]) - dp0[v] and earns 1 for the new edge. Maximising that single swap over all children is why the transition is a best-child choice rather than an independent sum.",
        "The delta form matters: computing base once and then testing one swap per child keeps the transition linear in the number of children, so the whole DP is O(n) rather than O(sum of squared degrees). Starting gain at 0 means dp1[u] >= dp0[u] always, which is harmless because dp1 is defined as 'u may or may not be matched'.",
        "The greedy trap is to sort edges or to grab any available edge top-down; that fails on a path of four nodes, where taking the middle edge yields 1 while the two end edges yield 2. Matching a node to its child only when it is genuinely profitable is what the delta computes. The correct greedy for trees is bottom-up leaf matching, which is really this DP in disguise.",
        "Time: O(n) - each adjacency entry is touched a constant number of times. Space: O(n).",
      ],
    },
    {
      name: "Number of Good Leaf Nodes Pairs",
      difficulty: "Medium",
      variation: "Merging depth profiles at the meeting node",
      link: "https://leetcode.com/problems/number-of-good-leaf-nodes-pairs/",
      question: [
        "You are given the root of a binary tree and an integer distance. A pair of two different leaf nodes is called good if the length of the shortest path between them, counted in edges, is less than or equal to distance. Return the number of good leaf node pairs.",
        "Example 1:\nInput: root = [1,2,3,null,4], distance = 3\nOutput: 1\nExplanation: The leaves are 4 and 3. The path 4 - 2 - 1 - 3 has length 3, which is within the limit.",
        "Example 2:\nInput: root = [1,2,3,4,5,6,7], distance = 3\nOutput: 2\nExplanation: The leaves are 4, 5, 6, 7. Pairs (4,5) and (6,7) are at distance 2. The pair (4,6) is at distance 4, which is too far.",
        "Constraints:\n- 1 <= number of nodes <= 2^10\n- 1 <= Node.val <= 100\n- 1 <= distance <= 10",
      ],
      code: `class Solution {
    int ans = 0, D = 0;

    // cnt[d] = number of leaves exactly d edges below u, for d <= D
    vector<int> dfs(TreeNode* u) {
        vector<int> cnt(D + 1, 0);
        if (!u) return cnt;
        if (!u->left && !u->right) { cnt[0] = 1; return cnt; }
        vector<int> L = dfs(u->left), R = dfs(u->right);
        // pair one leaf from each side: path length is a + 1 + 1 + b
        for (int a = 0; a < D; a++)
            for (int b = 0; a + b + 2 <= D; b++) ans += L[a] * R[b];
        for (int d = 0; d < D; d++) cnt[d + 1] = L[d] + R[d];   // deeper than D is useless
        return cnt;
    }

public:
    int countPairs(TreeNode* root, int distance) {
        D = distance;
        dfs(root);
        return ans;
    }
};`,
      explanation: [
        "Instead of one number per subtree, the state is a small vector: the histogram of leaf depths below u, truncated at D. Whenever a plain aggregate is not enough to answer the question, widening the state to a bounded-size profile is the standard tree-DP move.",
        "Every good pair has a unique lowest common ancestor, and at that node the two leaves lie in different child subtrees. Counting at the LCA therefore counts each pair exactly once. The path length is the left leaf's depth below the left child, plus one edge into u, plus one edge down, plus the right leaf's depth - hence a + b + 2.",
        "Truncating the histogram at D is what bounds the work: anything deeper than D can never participate in a good pair through any higher ancestor, so it may be dropped rather than propagated. This keeps each merge at O(D^2) and the total at O(n * D^2).",
        "The wrong-but-tempting approach is to compute all-pairs leaf distances with a BFS from every leaf. It is correct but O(n^2) and, more importantly, it hides the structural fact that makes the DP work - one meeting node per pair.",
        "A detail that bites: counting the cross product before shifting the histograms, and never pairing two leaves from the same child subtree here, is essential. Those same-side pairs are counted lower down at their own LCA.",
        "Time: O(n * D^2). Space: O(h * D) for the vectors alive on the recursion stack.",
      ],
    },
    {
      name: "Binary Tree Cameras",
      difficulty: "Hard",
      variation: "Three-state DP: covering constraint pushed up and down",
      link: "https://leetcode.com/problems/binary-tree-cameras/",
      question: [
        "You are given the root of a binary tree. A camera placed on a node monitors that node, its parent, and its immediate children. Return the minimum number of cameras needed so that every node in the tree is monitored.",
        "Example 1:\nInput: root = [0,0,null,0,0]\nOutput: 1\nExplanation: The tree is a root with one child, which itself has two children. A single camera on the middle node covers the root, itself and both of its children.",
        "Example 2:\nInput: root = [0,0,null,0,null,0,null,null,0]\nOutput: 2\nExplanation: The tree is a chain of five nodes. Two cameras suffice, and one cannot reach all five.",
        "Constraints:\n- 1 <= number of nodes <= 1000\n- Node.val is 0",
      ],
      code: `class Solution {
    static const int INF = 1000000;

    // d[0] = u has a camera; d[1] = u covered by a child's camera; d[2] = u not covered yet
    array<int,3> dfs(TreeNode* u) {
        if (!u) return {INF, 0, 0};   // a null child needs no cover and cannot hold a camera
        array<int,3> L = dfs(u->left), R = dfs(u->right);
        array<int,3> d;
        // camera at u covers u and both children, so children may be in any state
        d[0] = 1 + min({L[0], L[1], L[2]}) + min({R[0], R[1], R[2]});
        // u covered without its own camera: at least one child must hold a camera
        d[1] = min(L[0] + min(R[0], R[1]), R[0] + min(L[0], L[1]));
        // u still uncovered: no child has a camera, and both children are already covered
        d[2] = L[1] + R[1];
        return d;
    }

public:
    int minCameraCover(TreeNode* root) {
        array<int,3> d = dfs(root);
        return min(d[0], d[1]);       // the root has no parent to cover it later
    }
};`,
      explanation: [
        "A camera reaches one level up as well as one level down, so a node's cost depends on information flowing in both directions. The fix is a three-valued state summarising everything a parent needs to know: u holds a camera, u is covered by a child but holds none, or u is not covered yet and the parent must handle it. Each dp value is the cheapest way to cover u's whole subtree except possibly u itself in the third case.",
        "The transitions follow mechanically from the definitions. Placing a camera at u covers the children too, so they are unconstrained. If u must be covered without its own camera, some child needs a camera - state 0 - and the other child only needs to be covered somehow, which is states 0 or 1 but not 2. If u is left uncovered, neither child may hold a camera, so both children sit in state 1.",
        "The null base case {INF, 0, 0} is the piece worth staring at. A missing child cannot hold a camera, hence INF, but it also needs no coverage, hence 0 for both other states. Getting this wrong is the usual source of off-by-one camera counts on nodes with a single child.",
        "At the root, state 2 must be rejected: there is no parent left to cover it. Returning min over all three states is the most common bug and undercounts by one on a chain.",
        "The tempting greedy is bottom-up: place a camera at the parent of any uncovered leaf. That one happens to be correct and is a well-known alternative, but it relies on an exchange argument that is easy to misapply; the three-state DP needs no such argument and generalises to weighted cameras or larger radii.",
        "Time: O(n). Space: O(h) stack.",
      ],
    },
    {
      name: "Tree Distances I",
      difficulty: "Hard",
      variation: "Rerooting: maximum distance from every node",
      link: "https://cses.fi/problemset/task/1132",
      question: [
        "You are given a tree with n nodes numbered 1..n. For every node, print the maximum distance, counted in edges, to any other node in the tree.",
        "Example 1:\nInput:\n5\n1 2\n1 3\n3 4\n3 5\nOutput: 2 3 2 3 3\nExplanation: From node 1 the farthest nodes are 4 and 5 at distance 2. From node 2 they are 4 and 5 at distance 3. From node 4 the farthest is node 2 at distance 3.",
        "Example 2:\nInput:\n2\n1 2\nOutput: 1 1\nExplanation: Each node's only other node is one edge away.",
        "Constraints:\n- 1 <= n <= 2 * 10^5\n- the input describes a tree",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<vector<int>> adj(n + 1);
    for (int i = 0; i < n - 1; i++) {
        int a, b;
        cin >> a >> b;
        adj[a].push_back(b);
        adj[b].push_back(a);
    }
    vector<int> par(n + 1, 0), order;
    order.reserve(n);
    vector<char> seen(n + 1, 0);
    vector<int> st{1};
    seen[1] = 1;
    while (!st.empty()) {
        int u = st.back();
        st.pop_back();
        order.push_back(u);
        for (int v : adj[u]) if (!seen[v]) {
            seen[v] = 1;
            par[v] = u;
            st.push_back(v);
        }
    }
    vector<int> down(n + 1, 0), up(n + 1, 0);
    for (int i = n - 1; i >= 0; i--) {                 // post-order: deepest path downward
        int u = order[i];
        for (int v : adj[u]) if (v != par[u]) down[u] = max(down[u], down[v] + 1);
    }
    for (int i = 0; i < n; i++) {                      // pre-order: push the outside answer down
        int u = order[i];
        int b1 = -1, b2 = -1;                          // two largest values of down[child] + 1
        for (int v : adj[u]) if (v != par[u]) {
            int val = down[v] + 1;
            if (val > b1) { b2 = b1; b1 = val; }
            else if (val > b2) b2 = val;
        }
        for (int v : adj[u]) if (v != par[u]) {
            int other = (down[v] + 1 == b1) ? b2 : b1;    // best branch avoiding v
            up[v] = 1 + max(up[u], max(other, 0));
        }
    }
    for (int i = 1; i <= n; i++) cout << max(down[i], up[i]) << " \\n"[i == n];
    return 0;
}`,
      explanation: [
        "A single rooted DFS gives down[u], the farthest node inside u's subtree, but the answer for a non-root node may lie outside its subtree. Rerooting solves this with a second, top-down pass that computes up[u]: the farthest node reachable from u by first stepping to its parent. The answer is max of the two, since every other node is either below u or through its parent.",
        "The transition for up[v] is the heart of the technique. Leaving v you arrive at u after one edge, and from there the best continuation is either further up - up[u] - or down into a sibling branch, which costs 1 + down[s]. Both are already known when u is processed before its children, which is why this pass walks the pre-order.",
        "Excluding v itself from the sibling maximum is what makes it correct, and recomputing that maximum per child naively would be O(degree^2). Keeping the top two values of down[child] + 1 gives the exclusion in O(1): if v is the argmax, use the runner-up, otherwise use the maximum. This top-two trick appears in nearly every rerooting problem.",
        "The max(other, 0) guards a node with a single child, where there is no sibling branch and b2 stays -1. The tempting wrong answer is to run a BFS from every node, which is O(n^2) and times out at n = 2 * 10^5. A cheaper alternative exists for this exact problem - the answer is max of the distances to the two endpoints of the diameter - but rerooting is the version that survives a change of objective.",
        "Time: O(n) for two linear passes. Space: O(n).",
      ],
    },
    {
      name: "Sum of Distances in Tree",
      difficulty: "Hard",
      variation: "Rerooting an additive aggregate with a size-based edge shift",
      link: "https://leetcode.com/problems/sum-of-distances-in-tree/",
      question: [
        "There is an undirected connected tree with n nodes labelled 0..n-1 and n-1 edges. You are given n and the array edges, where edges[i] = [a, b] is an edge between nodes a and b. Return an array answer of length n where answer[i] is the sum of the distances between node i and every other node.",
        "Example 1:\nInput: n = 6, edges = [[0,1],[0,2],[2,3],[2,4],[2,5]]\nOutput: [8,12,6,10,10,10]\nExplanation: From node 0 the distances are 1, 1, 2, 2, 2 which sum to 8. From node 2 they are 1, 2, 1, 1, 1 which sum to 6.",
        "Example 2:\nInput: n = 2, edges = [[1,0]]\nOutput: [1,1]\nExplanation: The two nodes are one edge apart.",
        "Constraints:\n- 1 <= n <= 3 * 10^4\n- edges.length == n - 1\n- the input is guaranteed to be a tree",
      ],
      code: `class Solution {
public:
    vector<int> sumOfDistancesInTree(int n, vector<vector<int>>& edges) {
        vector<vector<int>> adj(n);
        for (auto& e : edges) {
            adj[e[0]].push_back(e[1]);
            adj[e[1]].push_back(e[0]);
        }
        vector<int> par(n, -1), order;
        order.reserve(n);
        vector<char> seen(n, 0);
        vector<int> st{0};
        seen[0] = 1;
        while (!st.empty()) {
            int u = st.back();
            st.pop_back();
            order.push_back(u);
            for (int v : adj[u]) if (!seen[v]) {
                seen[v] = 1;
                par[v] = u;
                st.push_back(v);
            }
        }
        vector<int> cnt(n, 1), res(n, 0);
        for (int i = n - 1; i > 0; i--) {          // post-order, skipping the root
            int u = order[i];
            cnt[par[u]] += cnt[u];
            res[par[u]] += res[u] + cnt[u];        // every node under u is one edge further away
        }
        for (int i = 1; i < n; i++) {              // pre-order: slide the root across one edge
            int u = order[i];
            res[u] = res[par[u]] + n - 2 * cnt[u];
        }
        return res;
    }
};`,
      explanation: [
        "Pass one roots the tree at 0 and computes two subtree aggregates: cnt[u], the number of nodes in u's subtree, and res[u], the sum of distances from u to those nodes only. The recurrence res[u] = sum over children of (res[c] + cnt[c]) says that each node below a child is exactly one extra edge from u than from that child.",
        "Pass two is the rerooting step, and it is a single arithmetic identity. Move the viewpoint from u to its child v along one edge. The cnt[v] nodes in v's subtree each get one edge closer, and the remaining n - cnt[v] nodes each get one edge farther, so res[v] = res[u] - cnt[v] + (n - cnt[v]) = res[u] + n - 2 * cnt[v].",
        "That identity is only valid when res[u] is already the global answer for u, which is true for the root by construction and then propagates down. Hence the pre-order direction of the second loop - processing a child before its parent would use a subtree-only value as if it were global, which is the single most common bug in rerooting code.",
        "The lesson generalises: rerooting works whenever the aggregate can be adjusted by a closed-form correction when the root slides across one edge. Here the correction depends only on n and cnt[v]; when no such closed form exists you fall back to combining sibling contributions explicitly, as in Tree Distances I.",
        "The brute force is a BFS from each node at O(n^2), which is 9 * 10^8 operations at n = 3 * 10^4 and too slow. Note also that distance sums stay within int range here, but a weighted variant would need 64-bit accumulators.",
        "Time: O(n). Space: O(n).",
      ],
    },
  ],
};
