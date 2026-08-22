import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Diameter of Binary Tree",
      difficulty: "Easy",
      variation: "Height DP on a binary tree, the template",
      link: "https://leetcode.com/problems/diameter-of-binary-tree/",
      question: [
        "Given the root of a binary tree, return the length of the diameter of the tree. The diameter is the length of the longest path between any two nodes in the tree, and that path may or may not pass through the root. The length of a path is measured in edges.",
        "Example 1:\nInput: root = [1,2,3,4,5]\nOutput: 3\nExplanation: The longest path is 4 -> 2 -> 1 -> 3 (or 5 -> 2 -> 1 -> 3), which uses 3 edges.",
        "Example 2:\nInput: root = [1,2]\nOutput: 1\nExplanation: The only path is 1 -> 2, one edge.",
        "Constraints:\n- The number of nodes is in the range [1, 10^4]\n- -100 <= Node.val <= 100",
      ],
      code: `int diameterOfBinaryTree(TreeNode* root) {
    int best = 0;
    // depth returns the number of nodes on the longest downward chain from node
    function<int(TreeNode*)> depth = [&](TreeNode* node) -> int {
        if (!node) return 0;
        int l = depth(node->left);
        int r = depth(node->right);
        best = max(best, l + r);   // path that bends at node, length in edges
        return 1 + max(l, r);
    };
    depth(root);
    return best;
}`,
      explanation: [
        "Every path in a tree has a unique highest node, the point where it bends. So if for each node you know the longest downward chain into its left subtree and into its right subtree, the best path bending at that node has length l + r edges. Taking the maximum over all nodes covers every path exactly once, which is why a single post-order sweep is enough.",
        "The function returns 1 + max(l, r), the chain the parent can extend, while the answer is accumulated in a variable on the side. Mixing the two is the classic bug: the parent must not be handed a bent path, only a straight downward one.",
        "The tempting wrong answer is height(left) + height(right) at the root only. That fails whenever the diameter lives entirely inside one subtree and never touches the root, for example a long chain hanging off a single child.",
        "Counting in nodes versus edges is the other trap. Here l and r are node counts of the two chains, so l + r happens to be exactly the edge count of the joined path - no off-by-one correction needed.",
        "Time: O(n). Space: O(h) for the recursion stack, O(n) worst case on a degenerate tree.",
      ],
    },
    {
      name: "Tree Diameter",
      difficulty: "Medium",
      variation: "Diameter of a general tree given as an edge list",
      link: "https://leetcode.com/problems/tree-diameter/",
      question: [
        "You are given an undirected tree with n nodes labelled 0..n-1, described by an array edges of n-1 pairs, where edges[i] = [u, v] is an edge between u and v. Return the diameter of the tree: the number of edges on the longest path between any two nodes.",
        "Example 1:\nInput: edges = [[0,1],[0,2]]\nOutput: 2\nExplanation: The longest path is 1 -> 0 -> 2, two edges.",
        "Example 2:\nInput: edges = [[0,1],[1,2],[2,3],[1,4],[4,5]]\nOutput: 4\nExplanation: The longest path is 3 -> 2 -> 1 -> 4 -> 5, four edges.",
        "Constraints:\n- 1 <= n <= 10^4\n- edges.length == n - 1\n- 0 <= u, v < n and the input forms a valid tree",
      ],
      code: `int treeDiameter(vector<vector<int>>& edges) {
    int n = (int)edges.size() + 1;
    vector<vector<int>> adj(n);
    for (auto& e : edges) {
        adj[e[0]].push_back(e[1]);
        adj[e[1]].push_back(e[0]);
    }
    // BFS from src, return {farthest node, its distance}
    auto bfs = [&](int src) {
        vector<int> dist(n, -1);
        dist[src] = 0;
        queue<int> q;
        q.push(src);
        int far = src;
        while (!q.empty()) {
            int u = q.front(); q.pop();
            if (dist[u] > dist[far]) far = u;
            for (int v : adj[u]) {
                if (dist[v] == -1) {
                    dist[v] = dist[u] + 1;
                    q.push(v);
                }
            }
        }
        return make_pair(far, dist[far]);
    };
    int a = bfs(0).first;        // a is guaranteed to be a diameter endpoint
    return bfs(a).second;
}`,
      explanation: [
        "The two-BFS trick: run BFS from any node, take the farthest node a, run BFS again from a; the largest distance found is the diameter. Two linear sweeps, no recursion, no depth limit worries.",
        "Why the first BFS lands on an endpoint: let the diameter be the path between x and y, and let a be the node farthest from the arbitrary start s. The path from s to a meets the diameter path at some node m (in a tree the meeting set is a single vertex or empty-plus-junction). If a were not an endpoint, then dist(m, a) >= dist(m, x) by maximality of a, and swapping x for a would produce a path at least as long as the diameter through m - so a is itself a valid endpoint. The second BFS then measures the true maximum from a real endpoint.",
        "The height-DP of the previous problem also works here (root anywhere, combine the two largest child depths at each node). Use whichever fits: DP generalises to weighted edges and to extra per-node constraints, two-BFS is shorter and iterative.",
        "The trap is doing only one BFS from node 0 and reporting its eccentricity. That undercounts whenever node 0 sits near the middle of the tree - in example 2 a single BFS from 0 returns 3, not 4.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Tree Diameter (CSES)",
      difficulty: "Easy",
      variation: "Judge version, iterative BFS on 2 * 10^5 nodes",
      link: "https://cses.fi/problemset/task/1131",
      question: [
        "You are given a tree of n nodes numbered 1..n. Print the diameter of the tree, that is the maximum number of edges on a path between two nodes. The first input line contains n, and each of the next n-1 lines contains two integers a and b describing an edge.",
        "Example 1:\nInput:\n5\n1 2\n1 3\n3 4\n3 5\nOutput: 3\nExplanation: The longest path is 2 -> 1 -> 3 -> 4 (or 2 -> 1 -> 3 -> 5), three edges.",
        "Example 2:\nInput:\n2\n1 2\nOutput: 1\nExplanation: One edge separates the only two nodes.",
        "Constraints:\n- 1 <= n <= 2 * 10^5\n- 1 <= a, b <= n and the input is a tree",
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
    vector<int> dist(n + 1);
    // BFS from src, return the farthest node; dist is left filled in
    auto bfs = [&](int src) {
        fill(dist.begin(), dist.end(), -1);
        dist[src] = 0;
        vector<int> q;
        q.reserve(n);
        q.push_back(src);
        int far = src;
        for (int i = 0; i < (int)q.size(); i++) {
            int u = q[i];
            if (dist[u] > dist[far]) far = u;
            for (int v : adj[u]) {
                if (dist[v] == -1) {
                    dist[v] = dist[u] + 1;
                    q.push_back(v);
                }
            }
        }
        return far;
    };
    int a = bfs(1);
    int b = bfs(a);
    cout << dist[b] << "\\n";
    return 0;
}`,
      explanation: [
        "Identical algorithm to the previous problem, written for a judge: read the edge list, two BFS passes, print one number. The point of this entry is the engineering, not the idea.",
        "With n up to 2 * 10^5 a recursive DFS can blow the default stack on a path-shaped tree, so the traversal is a hand-rolled vector used as a queue with an index cursor - no recursion and no per-call allocation.",
        "Edge case n = 1: there are no edge lines to read, the first BFS returns node 1, the second returns node 1 again, and dist[1] = 0 is printed, which is the correct diameter of a single node.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Diameter of N-Ary Tree",
      difficulty: "Medium",
      variation: "Top two child depths instead of left and right",
      link: "https://leetcode.com/problems/diameter-of-n-ary-tree/",
      question: [
        "Given the root of an n-ary tree, where every node holds a list of children, return the length of the diameter of the tree. The diameter is the length in edges of the longest path between any two nodes, and it need not pass through the root.",
        "Example 1:\nInput: root = [1,null,3,2,4,null,5,6]\nOutput: 3\nExplanation: Node 1 has children 3, 2, 4 and node 3 has children 5, 6. The longest path is 5 -> 3 -> 1 -> 2, three edges.",
        "Example 2:\nInput: root = [1,null,2,null,3,null,4,null,5,null,6]\nOutput: 5\nExplanation: The tree is a single chain 1 -> 2 -> 3 -> 4 -> 5 -> 6 of six nodes, so the diameter is five edges.",
        "Constraints:\n- The number of nodes is in the range [1, 10^4]\n- The depth of the n-ary tree is at most 1000",
      ],
      code: `int diameter(Node* root) {
    int best = 0;
    // returns the node count of the longest downward chain starting at node
    function<int(Node*)> dfs = [&](Node* node) -> int {
        int b1 = 0, b2 = 0;   // two largest child chain lengths
        for (Node* c : node->children) {
            int h = dfs(c);
            if (h > b1) { b2 = b1; b1 = h; }
            else if (h > b2) b2 = h;
        }
        best = max(best, b1 + b2);   // path bending at node
        return 1 + b1;
    };
    if (root) dfs(root);
    return best;
}`,
      explanation: [
        "The binary version used left and right depth; with an arbitrary number of children the same idea needs the two largest child chains, because a path bending at a node descends into exactly two distinct children (or into one, or none).",
        "Tracking b1 and b2 in a single pass with the two-way comparison is the standard way and costs O(deg) per node, so the whole traversal stays linear in the number of edges. Sorting the child depths would also work but adds a needless log factor.",
        "Keeping b2 initialised to 0 handles both degenerate shapes for free: a node with one child gives b1 + 0, correctly meaning the path just goes straight down, and a leaf gives 0 + 0.",
        "The trap is taking the largest child chain twice, or forgetting that the two best chains must come from different children - that would count a path that leaves and re-enters the same child, which is not a path in a tree.",
        "Time: O(n). Space: O(h) recursion, bounded by the stated depth limit of 1000.",
      ],
    },
    {
      name: "Longest Univalue Path",
      difficulty: "Medium",
      variation: "Diameter restricted by an edge predicate",
      link: "https://leetcode.com/problems/longest-univalue-path/",
      question: [
        "Given the root of a binary tree, return the length of the longest path where every node on the path has the same value. The path does not have to pass through the root, and its length is measured in edges.",
        "Example 1:\nInput: root = [5,4,5,1,1,null,5]\nOutput: 2\nExplanation: The root is 5, its right child is 5, and that node's right child is 5. The path through those three nodes uses two edges.",
        "Example 2:\nInput: root = [1,4,5,4,4,null,5]\nOutput: 2\nExplanation: The left child of the root is 4 and both of its children are 4, so the path 4 -> 4 -> 4 uses two edges.",
        "Constraints:\n- The number of nodes is in the range [0, 10^4]\n- -1000 <= Node.val <= 1000\n- The depth of the tree will not exceed 1000",
      ],
      code: `int longestUnivaluePath(TreeNode* root) {
    int best = 0;
    // returns the longest same-value chain in edges going down from node
    function<int(TreeNode*)> dfs = [&](TreeNode* node) -> int {
        if (!node) return 0;
        int l = dfs(node->left);
        int r = dfs(node->right);
        // a child chain is usable only if the connecting edge is same-valued
        int lu = (node->left && node->left->val == node->val) ? l + 1 : 0;
        int ru = (node->right && node->right->val == node->val) ? r + 1 : 0;
        best = max(best, lu + ru);
        return max(lu, ru);
    };
    dfs(root);
    return best;
}`,
      explanation: [
        "This is the diameter template with an edge filter: the recursion still returns the best downward chain and still combines the two sides at the bend, but an edge only counts when parent and child hold the same value.",
        "Note that both children are recursed into unconditionally, and the filter is applied to the returned value, not to the call. Skipping the recursion when values differ would lose any long same-value path buried deeper in that subtree.",
        "Here the returned quantity is measured in edges rather than nodes, which is why the filter adds 1 and a blocked side collapses to 0. Mixing the two conventions inside one function is the usual source of off-by-one answers in this problem.",
        "The same shape solves any 'longest path under a local constraint' question: the constraint lives on the edge, the combination at the bend never changes.",
        "Time: O(n). Space: O(h).",
      ],
    },
    {
      name: "Binary Tree Maximum Path Sum",
      difficulty: "Hard",
      variation: "Weighted diameter with negative node values",
      link: "https://leetcode.com/problems/binary-tree-maximum-path-sum/",
      question: [
        "A path in a binary tree is a sequence of nodes where each consecutive pair is connected by an edge, and no node appears more than once; the path need not pass through the root. The path sum is the sum of the values of its nodes. Given the root of a binary tree, return the maximum path sum of any non-empty path.",
        "Example 1:\nInput: root = [1,2,3]\nOutput: 6\nExplanation: The path 2 -> 1 -> 3 sums to 2 + 1 + 3 = 6.",
        "Example 2:\nInput: root = [-10,9,20,null,null,15,7]\nOutput: 42\nExplanation: The path 15 -> 20 -> 7 sums to 42; going up through -10 would only lose value.",
        "Constraints:\n- The number of nodes is in the range [1, 3 * 10^4]\n- -1000 <= Node.val <= 1000",
      ],
      code: `int maxPathSum(TreeNode* root) {
    int best = INT_MIN;
    // returns the best downward chain sum starting at node, clamped at 0 below
    function<int(TreeNode*)> dfs = [&](TreeNode* node) -> int {
        if (!node) return 0;
        int l = max(0, dfs(node->left));    // a negative branch is simply refused
        int r = max(0, dfs(node->right));
        best = max(best, node->val + l + r);
        return node->val + max(l, r);
    };
    dfs(root);
    return best;
}`,
      explanation: [
        "Same skeleton as the diameter: every path bends at a unique highest node, so evaluate node->val + bestLeftChain + bestRightChain at each node and take the maximum. Only the weight changes - node values instead of unit edges.",
        "Negative values are the whole difficulty. Clamping each child result at 0 encodes the decision 'do not extend into this branch at all', which is legal because a path may stop at the bend node. Without the clamp a single deep negative subtree drags every enclosing candidate down.",
        "The clamp must not be applied to node->val itself. The answer has to be a non-empty path, so a tree of all negative values must return the largest single value; clamping the node's own contribution would wrongly return 0.",
        "best is seeded with INT_MIN rather than 0 for the same reason. Seeding with 0 is the most common wrong submission and only shows up on all-negative inputs.",
        "Time: O(n). Space: O(h).",
      ],
    },
    {
      name: "Tree Distances I",
      difficulty: "Medium",
      variation: "Eccentricity of every node from the diameter endpoints",
      link: "https://cses.fi/problemset/task/1132",
      question: [
        "You are given a tree of n nodes numbered 1..n. For each node, print the maximum distance to any other node. The first line contains n, and each of the next n-1 lines contains two integers a and b describing an edge.",
        "Example 1:\nInput:\n5\n1 2\n1 3\n3 4\n3 5\nOutput: 2 3 2 3 3\nExplanation: Node 1 is at distance 2 from nodes 4 and 5. Node 2 is at distance 3 from nodes 4 and 5. Node 3 is at distance 2 from node 2. Nodes 4 and 5 are each at distance 3 from node 2.",
        "Example 2:\nInput:\n2\n1 2\nOutput: 1 1",
        "Constraints:\n- 1 <= n <= 2 * 10^5\n- 1 <= a, b <= n and the input is a tree",
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
    auto bfs = [&](int src, vector<int>& dist) {
        dist.assign(n + 1, -1);
        dist[src] = 0;
        vector<int> q;
        q.reserve(n);
        q.push_back(src);
        int far = src;
        for (int i = 0; i < (int)q.size(); i++) {
            int u = q[i];
            if (dist[u] > dist[far]) far = u;
            for (int v : adj[u]) {
                if (dist[v] == -1) {
                    dist[v] = dist[u] + 1;
                    q.push_back(v);
                }
            }
        }
        return far;
    };
    vector<int> d0, da, db;
    int a = bfs(1, d0);      // a is one endpoint of a diameter
    int b = bfs(a, da);      // b is the other endpoint
    bfs(b, db);
    for (int i = 1; i <= n; i++) {
        cout << max(da[i], db[i]) << " \\n"[i == n];
    }
    return 0;
}`,
      explanation: [
        "Claim: for every node v, the farthest node from v is an endpoint of some diameter. So with a and b the two endpoints found by the usual two BFS passes, the answer for v is max(dist(a, v), dist(b, v)) - three BFS runs total.",
        "Proof sketch: let the diameter be the path a..b and let w be the node on that path closest to v. If some node x were strictly farther from v than both a and b, then dist(w, x) > dist(w, a) and dist(w, x) > dist(w, b), so joining x to whichever of a or b lies on the far side of w would beat the diameter - a contradiction.",
        "The alternative is a rerooting DP: one post-order pass computing the deepest chain downward, one pre-order pass pushing the best answer from above down into each child using the top two child depths at the parent. That generalises to weighted trees and to other combinable statistics, but for plain eccentricity the three-BFS version is far shorter and has no prefix-suffix bookkeeping to get wrong.",
        "Both b and the array da matter: da holds distances from a and db distances from b, and taking the max of the two per node is the whole answer. Using only db (distances from one endpoint) is wrong for nodes sitting near b.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Minimum Height Trees",
      difficulty: "Medium",
      variation: "Tree centre, the midpoint of the diameter",
      link: "https://leetcode.com/problems/minimum-height-trees/",
      question: [
        "A tree is an undirected graph with n nodes labelled 0..n-1 and n-1 edges. You may pick any node as the root; the resulting rooted tree has some height, the number of edges on the longest downward path from the root. Given n and the edge list, return all the roots that minimise this height, in any order.",
        "Example 1:\nInput: n = 4, edges = [[1,0],[1,2],[1,3]]\nOutput: [1]\nExplanation: Rooting at 1 gives height 1; any other choice gives height 2.",
        "Example 2:\nInput: n = 6, edges = [[3,0],[3,1],[3,2],[3,4],[5,4]]\nOutput: [3,4]\nExplanation: Rooting at 3 or at 4 gives height 2, which is the minimum.",
        "Constraints:\n- 1 <= n <= 2 * 10^4\n- edges.length == n - 1\n- The input is guaranteed to be a tree",
      ],
      code: `vector<int> findMinHeightTrees(int n, vector<vector<int>>& edges) {
    if (n == 1) return {0};
    vector<vector<int>> adj(n);
    vector<int> deg(n, 0);
    for (auto& e : edges) {
        adj[e[0]].push_back(e[1]);
        adj[e[1]].push_back(e[0]);
        deg[e[0]]++;
        deg[e[1]]++;
    }
    queue<int> q;
    for (int i = 0; i < n; i++) if (deg[i] == 1) q.push(i);
    int remaining = n;
    while (remaining > 2) {          // peel whole leaf layers at once
        int sz = (int)q.size();
        remaining -= sz;
        for (int i = 0; i < sz; i++) {
            int u = q.front(); q.pop();
            for (int v : adj[u]) {
                if (--deg[v] == 1) q.push(v);
            }
        }
    }
    vector<int> res;
    while (!q.empty()) { res.push_back(q.front()); q.pop(); }
    return res;
}`,
      explanation: [
        "The node minimising the height is the centre of the tree, and the centre is the midpoint of any diameter. A tree has exactly one centre when its diameter is even and exactly two adjacent centres when it is odd, which is why the answer list never has more than two entries.",
        "Peeling leaves layer by layer is a topological-sort-style way to walk inward from both ends of every long path simultaneously. Each round strips the current outer shell, so after k rounds the survivors are the nodes at distance more than k from the boundary; the last one or two survivors are the midpoints.",
        "Stopping the loop at remaining <= 2 is exactly the two cases above. Stopping at 1 would be wrong on an even-length path such as 0 - 1 - 2 - 3, where both 1 and 2 achieve height 2.",
        "The tempting brute force is a BFS from every node and pick the minimum eccentricity - correct but O(n^2), too slow at n = 2 * 10^4. An O(n) alternative is to find the diameter path with two BFS runs and return its middle node or middle pair.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Longest Path With Different Adjacent Characters",
      difficulty: "Hard",
      variation: "Diameter on a rooted tree with a character constraint",
      link: "https://leetcode.com/problems/longest-path-with-different-adjacent-characters/",
      question: [
        "You are given a rooted tree of n nodes numbered 0..n-1, described by an array parent where parent[i] is the parent of node i and parent[0] == -1, and a string s where s[i] is the character assigned to node i. Return the length of the longest path in the tree such that no pair of adjacent nodes on the path has the same character. Length is measured in nodes.",
        "Example 1:\nInput: parent = [-1,0,0,1,1,2], s = 'abacbe'\nOutput: 3\nExplanation: The path 0 -> 1 -> 3 carries characters a, b, c, all adjacent pairs differ, so it has 3 nodes. No longer valid path exists.",
        "Example 2:\nInput: parent = [-1,0,0,0], s = 'aabc'\nOutput: 3\nExplanation: The path 2 -> 0 -> 3 carries b, a, c and has 3 nodes. Node 1 shares character a with node 0, so it cannot be attached.",
        "Constraints:\n- 1 <= n <= 10^5\n- 0 <= parent[i] <= n - 1 for i >= 1, parent[0] == -1\n- s.length == n and s consists of lowercase English letters",
      ],
      code: `int longestPath(vector<int>& parent, string s) {
    int n = (int)parent.size();
    vector<vector<int>> ch(n);
    for (int i = 1; i < n; i++) ch[parent[i]].push_back(i);
    // BFS order from the root, then process it in reverse = post-order, no recursion
    vector<int> order;
    order.reserve(n);
    order.push_back(0);
    for (int i = 0; i < (int)order.size(); i++) {
        for (int v : ch[order[i]]) order.push_back(v);
    }
    vector<int> down(n, 1);   // longest valid downward chain in nodes
    int ans = 1;
    for (int i = n - 1; i >= 0; i--) {
        int u = order[i];
        int b1 = 0, b2 = 0;
        for (int v : ch[u]) {
            if (s[v] == s[u]) continue;   // edge unusable
            if (down[v] > b1) { b2 = b1; b1 = down[v]; }
            else if (down[v] > b2) b2 = down[v];
        }
        down[u] = 1 + b1;
        ans = max(ans, 1 + b1 + b2);   // path bending at u
    }
    return ans;
}`,
      explanation: [
        "This is the n-ary diameter with two changes: the weight is nodes rather than edges, and a child chain is only attachable when its character differs from the parent's. The bend combination 1 + b1 + b2 is unchanged.",
        "Because n reaches 10^5 and the tree can be a single chain, recursion is a real stack-overflow risk. Collecting a BFS order from the root and iterating it backwards gives a valid post-order for free: a node always appears before all of its descendants in BFS order, so scanning in reverse guarantees every child's down value is final before its parent is processed.",
        "Blocked children are skipped when computing b1 and b2, but they are never skipped in the traversal - a long valid path can sit entirely inside a subtree hanging off a blocked edge, and ans is a global maximum so it is still picked up.",
        "The answer is at least 1 for any non-empty tree, since a single node is a valid path; initialising ans to 0 would be wrong only for n = 1, exactly the case people forget.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Count Subtrees With Max Distance Between Cities",
      difficulty: "Hard",
      variation: "Diameter of every connected subtree by subset enumeration",
      link: "https://leetcode.com/problems/count-subtrees-with-max-distance-between-cities/",
      question: [
        "There are n cities numbered 1..n connected by n-1 roads forming a tree, given as edges where edges[i] = [u, v]. A subtree is a subset of cities of size at least two that is connected using the roads between them. Return an array of size n-1 where the d-th entry (1-indexed by d) is the number of subtrees whose maximum pairwise distance is exactly d.",
        "Example 1:\nInput: n = 4, edges = [[1,2],[2,3],[2,4]]\nOutput: [3,4,0]\nExplanation: The three subtrees of diameter 1 are the single edges {1,2}, {2,3}, {2,4}. The four of diameter 2 are {1,2,3}, {1,2,4}, {2,3,4} and {1,2,3,4}. None has diameter 3.",
        "Example 2:\nInput: n = 3, edges = [[1,2],[2,3]]\nOutput: [2,1]\nExplanation: {1,2} and {2,3} have diameter 1; {1,2,3} has diameter 2.",
        "Constraints:\n- 2 <= n <= 15\n- edges.length == n - 1\n- 1 <= u, v <= n and the input forms a tree",
      ],
      code: `vector<int> countSubgraphsForEachDiameter(int n, vector<vector<int>>& edges) {
    const int INF = 1e9;
    vector<vector<int>> d(n, vector<int>(n, INF));
    for (int i = 0; i < n; i++) d[i][i] = 0;
    for (auto& e : edges) {
        d[e[0] - 1][e[1] - 1] = 1;
        d[e[1] - 1][e[0] - 1] = 1;
    }
    for (int k = 0; k < n; k++)
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                if (d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j];
    vector<int> res(n - 1, 0);
    for (int mask = 1; mask < (1 << n); mask++) {
        int cnt = __builtin_popcount(mask);
        if (cnt < 2) continue;
        int inside = 0;
        for (auto& e : edges) {
            if ((mask >> (e[0] - 1) & 1) && (mask >> (e[1] - 1) & 1)) inside++;
        }
        if (inside != cnt - 1) continue;   // acyclic + cnt-1 edges => connected
        int diam = 0;
        for (int i = 0; i < n; i++) {
            if (!(mask >> i & 1)) continue;
            for (int j = i + 1; j < n; j++) {
                if (mask >> j & 1) diam = max(diam, d[i][j]);
            }
        }
        res[diam - 1]++;
    }
    return res;
}`,
      explanation: [
        "n is at most 15, which is the signal to enumerate all 2^n vertex subsets and test each one, rather than looking for a clever tree DP. The work per subset is O(n^2), giving about 7 million operations - trivial.",
        "The connectivity test is the interesting part. Any induced subgraph of a tree is a forest, so it has no cycles; a forest on cnt vertices with exactly cnt-1 edges must be a single component. Counting the edges whose both endpoints are in the mask is therefore a complete connectivity check, no union-find or BFS needed.",
        "Once the subset is known to be connected, the distance between two of its nodes inside the subtree equals their distance in the whole tree: the tree path between them is unique, and connectivity of the induced subgraph forces every intermediate node onto that path to be present. That is why one Floyd-Warshall on the full tree suffices and no per-subset BFS is required.",
        "The diameter of a connected subset is just the largest pairwise distance in it, so the answer bucket is res[diam - 1]. Subsets of size 1 are skipped because the problem requires at least two cities, and their diameter of 0 has no bucket.",
        "Time: O(2^n * n^2 + n^3). Space: O(n^2).",
      ],
    },
    {
      name: "Find Minimum Diameter After Merging Two Trees",
      difficulty: "Hard",
      variation: "Diameter, radius and joining two trees at their centres",
      link: "https://leetcode.com/problems/find-minimum-diameter-after-merging-two-trees/",
      question: [
        "You are given two undirected trees with n and m nodes, numbered 0..n-1 and 0..m-1, described by edge lists edges1 and edges2. You must connect one node of the first tree to one node of the second tree with a single new edge, producing one tree. Return the minimum possible diameter of the resulting tree, measured in edges.",
        "Example 1:\nInput: edges1 = [[0,1],[0,2],[0,3]], edges2 = [[0,1]]\nOutput: 3\nExplanation: The first tree is a star of diameter 2 and the second is a single edge of diameter 1. Joining the centre of each gives a tree of diameter 3.",
        "Example 2:\nInput: edges1 = [[0,1],[0,2],[0,3],[2,4],[2,5],[3,6],[2,7]], edges2 = [[0,1],[0,2],[0,3],[2,4],[2,5],[3,6],[2,7]]\nOutput: 5\nExplanation: Each tree has diameter 4 and hence radius 2, so joining the two centres gives 2 + 2 + 1 = 5, which also dominates the individual diameters of 4.",
        "Constraints:\n- 1 <= n, m <= 10^5\n- edges1.length == n - 1 and edges2.length == m - 1\n- Both inputs are valid trees",
      ],
      code: `int minimumDiameterAfterMerge(vector<vector<int>>& edges1, vector<vector<int>>& edges2) {
    auto diameter = [](vector<vector<int>>& edges) {
        int n = (int)edges.size() + 1;
        vector<vector<int>> adj(n);
        for (auto& e : edges) {
            adj[e[0]].push_back(e[1]);
            adj[e[1]].push_back(e[0]);
        }
        vector<int> dist(n);
        auto bfs = [&](int src) {
            fill(dist.begin(), dist.end(), -1);
            dist[src] = 0;
            vector<int> q;
            q.reserve(n);
            q.push_back(src);
            int far = src;
            for (int i = 0; i < (int)q.size(); i++) {
                int u = q[i];
                if (dist[u] > dist[far]) far = u;
                for (int v : adj[u]) {
                    if (dist[v] == -1) {
                        dist[v] = dist[u] + 1;
                        q.push_back(v);
                    }
                }
            }
            return far;
        };
        int a = bfs(0);
        int b = bfs(a);
        return dist[b];
    };
    int d1 = diameter(edges1);
    int d2 = diameter(edges2);
    int r1 = (d1 + 1) / 2;      // radius = ceil(diameter / 2)
    int r2 = (d2 + 1) / 2;
    return max({d1, d2, r1 + r2 + 1});
}`,
      explanation: [
        "The merged diameter is the maximum of three quantities: a longest path staying inside tree one, a longest path staying inside tree two, and a longest path that crosses the new edge. The first two are d1 and d2 no matter where the edge is attached, so only the crossing term can be optimised.",
        "A crossing path is (distance from some node of tree one to the attachment point) + 1 + (distance inside tree two). Its worst case is ecc1(x) + 1 + ecc2(y) where x and y are the chosen endpoints, so the best choice is the node of minimum eccentricity in each tree - the centre - and the minimum eccentricity of a tree is its radius, ceil(d / 2).",
        "So the answer is max(d1, d2, ceil(d1/2) + ceil(d2/2) + 1). Note the radius is a ceiling, not a floor: a path of 3 edges has radius 2, since no node is within 1 edge of both ends. Using d/2 with integer division is the standard wrong answer here.",
        "The two individual diameters must stay in the max. Merging two long thin trees at their centres can leave the crossing term smaller than d1, and reporting only the crossing term would then understate the result.",
        "Each diameter needs only the two-BFS routine, so the whole solution is two linear scans per tree with no rerooting DP and no explicit centre construction.",
        "Time: O(n + m). Space: O(n + m).",
      ],
    },
  ],
};
