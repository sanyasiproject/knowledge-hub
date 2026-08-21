import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Average of Levels in Binary Tree",
      difficulty: "Easy",
      variation: "Level-order BFS, per-level aggregate",
      link: "https://leetcode.com/problems/average-of-levels-in-binary-tree/",
      question: [
        "Given the root of a binary tree, return the average value of the nodes on each level, as an array ordered from the root level downwards. Answers within 10^-5 of the actual answer are accepted.",
        "Example 1:\nInput: root = [3,9,20,null,null,15,7]\nOutput: [3.00000,14.50000,11.00000]\nExplanation: Level 0 is [3], level 1 is [9,20] averaging 14.5, level 2 is [15,7] averaging 11.",
        "Constraints:\n- Number of nodes is in [1, 10^4]\n- -2^31 <= Node.val <= 2^31 - 1",
      ],
      code: `vector<double> averageOfLevels(TreeNode* root) {
    vector<double> res;
    if (!root) return res;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        int sz = q.size();
        long long sum = 0;
        for (int i = 0; i < sz; i++) {
            TreeNode* node = q.front(); q.pop();
            sum += node->val;
            if (node->left) q.push(node->left);
            if (node->right) q.push(node->right);
        }
        res.push_back((double)sum / sz);
    }
    return res;
}`,
      explanation: [
        "Snapshot the queue size before draining a level: that count is exactly the number of nodes at the current depth, so children enqueued during the loop belong to the next round and cannot contaminate this level's sum.",
        "The sum is accumulated in a long long because up to 10^4 values near 2^31 would overflow a 32-bit int before the division happens.",
        "Time: O(n). Space: O(w) where w is the maximum level width.",
      ],
    },
    {
      name: "Maximum Depth of Binary Tree",
      difficulty: "Easy",
      variation: "Level counting BFS",
      link: "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
      question: [
        "Given the root of a binary tree, return its maximum depth: the number of nodes along the longest path from the root node down to the farthest leaf node.",
        "Example 1:\nInput: root = [3,9,20,null,null,15,7]\nOutput: 3",
        "Example 2:\nInput: root = [1,null,2]\nOutput: 2",
        "Constraints:\n- Number of nodes is in [0, 10^4]\n- -100 <= Node.val <= 100",
      ],
      code: `int maxDepth(TreeNode* root) {
    if (!root) return 0;
    queue<TreeNode*> q;
    q.push(root);
    int depth = 0;
    while (!q.empty()) {
        int sz = q.size();
        for (int i = 0; i < sz; i++) {
            TreeNode* node = q.front(); q.pop();
            if (node->left) q.push(node->left);
            if (node->right) q.push(node->right);
        }
        depth++;
    }
    return depth;
}`,
      explanation: [
        "Instead of recursing, count how many complete level sweeps the queue survives. Each outer iteration consumes exactly one full level, so the number of iterations equals the number of levels, which is the maximum depth.",
        "The BFS formulation avoids recursion depth limits on highly skewed trees, at the cost of holding one level in memory.",
        "Time: O(n). Space: O(w) where w is the maximum level width.",
      ],
    },
    {
      name: "Minimum Depth of Binary Tree",
      difficulty: "Easy",
      variation: "Early-exit BFS on first leaf",
      link: "https://leetcode.com/problems/minimum-depth-of-binary-tree/",
      question: [
        "Given a binary tree, find its minimum depth: the number of nodes along the shortest path from the root node down to the nearest leaf node. A leaf is a node with no children.",
        "Example 1:\nInput: root = [3,9,20,null,null,15,7]\nOutput: 2\nExplanation: 9 is a leaf at depth 2.",
        "Example 2:\nInput: root = [2,null,3,null,4,null,5,null,6]\nOutput: 5",
        "Constraints:\n- Number of nodes is in [0, 10^5]\n- -1000 <= Node.val <= 1000",
      ],
      code: `int minDepth(TreeNode* root) {
    if (!root) return 0;
    queue<TreeNode*> q;
    q.push(root);
    int depth = 1;
    while (!q.empty()) {
        int sz = q.size();
        for (int i = 0; i < sz; i++) {
            TreeNode* node = q.front(); q.pop();
            if (!node->left && !node->right) return depth;
            if (node->left) q.push(node->left);
            if (node->right) q.push(node->right);
        }
        depth++;
    }
    return depth;
}`,
      explanation: [
        "BFS visits nodes in non-decreasing order of depth, so the very first leaf it dequeues is a shallowest leaf and its depth is the answer - the search can stop immediately.",
        "A DFS would have to explore the entire tree before knowing the minimum; the layer invariant is what buys the early exit. Note that a node with a single child is not a leaf, which is why both children must be checked.",
        "Time: O(n) worst case, but only O(nodes above the shallowest leaf) in practice. Space: O(w).",
      ],
    },
    {
      name: "Binary Tree Level Order Traversal",
      difficulty: "Medium",
      variation: "Level-order BFS",
      link: "https://leetcode.com/problems/binary-tree-level-order-traversal/",
      question: [
        "Given the root of a binary tree, return the level order traversal of its nodes' values, as a list of levels from left to right.",
        "Example 1:\nInput: root = [3,9,20,null,null,15,7]\nOutput: [[3],[9,20],[15,7]]",
        "Example 2:\nInput: root = []\nOutput: []",
        "Constraints:\n- Number of nodes is in [0, 2000]\n- -1000 <= Node.val <= 1000",
      ],
      code: `vector<vector<int>> levelOrder(TreeNode* root) {
    vector<vector<int>> out;
    if (!root) return out;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        int sz = q.size();
        vector<int> level;
        for (int i = 0; i < sz; i++) {
            TreeNode* node = q.front(); q.pop();
            level.push_back(node->val);
            if (node->left) q.push(node->left);
            if (node->right) q.push(node->right);
        }
        out.push_back(level);
    }
    return out;
}`,
      explanation: [
        "This is the canonical BFS template every other layered problem specialises. A FIFO queue guarantees nodes come out in the order they went in, and pushing left before right keeps each level ordered left to right.",
        "Snapshotting the queue size at the top of each iteration fixes how many nodes belong to the current level, so children pushed during the loop are processed in the next round.",
        "Time: O(n). Space: O(w) where w is the maximum width.",
      ],
    },
    {
      name: "Binary Tree Level Order Traversal II",
      difficulty: "Medium",
      variation: "Level-order BFS, bottom-up output",
      link: "https://leetcode.com/problems/binary-tree-level-order-traversal-ii/",
      question: [
        "Given the root of a binary tree, return the bottom-up level order traversal of its nodes' values: from the deepest level to the root level, each level read left to right.",
        "Example 1:\nInput: root = [3,9,20,null,null,15,7]\nOutput: [[15,7],[9,20],[3]]",
        "Constraints:\n- Number of nodes is in [0, 2000]\n- -1000 <= Node.val <= 1000",
      ],
      code: `vector<vector<int>> levelOrderBottom(TreeNode* root) {
    vector<vector<int>> out;
    if (!root) return out;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        int sz = q.size();
        vector<int> level;
        for (int i = 0; i < sz; i++) {
            TreeNode* node = q.front(); q.pop();
            level.push_back(node->val);
            if (node->left) q.push(node->left);
            if (node->right) q.push(node->right);
        }
        out.push_back(level);
    }
    reverse(out.begin(), out.end());
    return out;
}`,
      explanation: [
        "The traversal itself is unchanged - only the presentation differs, so collect levels top-down and reverse the outer vector once at the end.",
        "Reversing after the fact is cheaper and clearer than inserting at the front of the result on every level, which would cost O(depth) per insertion.",
        "Time: O(n). Space: O(n) for the output plus O(w) for the queue.",
      ],
    },
    {
      name: "Binary Tree Zigzag Level Order Traversal",
      difficulty: "Medium",
      variation: "Level-order BFS, alternating direction",
      link: "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/",
      question: [
        "Given the root of a binary tree, return the zigzag level order traversal of its nodes' values: the first level left to right, the next right to left, and alternating for the remaining levels.",
        "Example 1:\nInput: root = [3,9,20,null,null,15,7]\nOutput: [[3],[20,9],[15,7]]",
        "Constraints:\n- Number of nodes is in [0, 2000]\n- -100 <= Node.val <= 100",
      ],
      code: `vector<vector<int>> zigzagLevelOrder(TreeNode* root) {
    vector<vector<int>> out;
    if (!root) return out;
    queue<TreeNode*> q;
    q.push(root);
    bool leftToRight = true;
    while (!q.empty()) {
        int sz = q.size();
        vector<int> level(sz);
        for (int i = 0; i < sz; i++) {
            TreeNode* node = q.front(); q.pop();
            int pos = leftToRight ? i : sz - 1 - i;
            level[pos] = node->val;
            if (node->left) q.push(node->left);
            if (node->right) q.push(node->right);
        }
        out.push_back(level);
        leftToRight = !leftToRight;
    }
    return out;
}`,
      explanation: [
        "Keep the queue strictly FIFO and left-to-right; only the write position inside the pre-sized level vector flips. This keeps the BFS structure untouched, which matters because reversing the queue itself would break the parent ordering of the next level.",
        "Pre-sizing the level vector lets each value be placed in O(1) at index i or sz - 1 - i depending on the direction flag.",
        "Time: O(n). Space: O(w).",
      ],
    },
    {
      name: "Binary Tree Right Side View",
      difficulty: "Medium",
      variation: "Level-order BFS, last node per level",
      link: "https://leetcode.com/problems/binary-tree-right-side-view/",
      question: [
        "Given the root of a binary tree, imagine yourself standing on the right side of it. Return the values of the nodes you can see, ordered from top to bottom.",
        "Example 1:\nInput: root = [1,2,3,null,5,null,4]\nOutput: [1,3,4]",
        "Example 2:\nInput: root = [1,null,3]\nOutput: [1,3]",
        "Constraints:\n- Number of nodes is in [0, 100]\n- -100 <= Node.val <= 100",
      ],
      code: `vector<int> rightSideView(TreeNode* root) {
    vector<int> res;
    if (!root) return res;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        int sz = q.size();
        for (int i = 0; i < sz; i++) {
            TreeNode* node = q.front(); q.pop();
            if (i == sz - 1) res.push_back(node->val);
            if (node->left) q.push(node->left);
            if (node->right) q.push(node->right);
        }
    }
    return res;
}`,
      explanation: [
        "The node visible from the right at a given depth is simply the rightmost node of that level, which in a left-to-right BFS is the last node dequeued before the level boundary.",
        "Because the level size is snapshotted, the index i == sz - 1 identifies that last node exactly, even when the level is ragged and some parents have only one child.",
        "Time: O(n). Space: O(w). Swapping the condition to i == 0 gives the left side view.",
      ],
    },
    {
      name: "Number of Islands",
      difficulty: "Medium",
      variation: "Grid BFS flood fill",
      link: "https://leetcode.com/problems/number-of-islands/",
      question: [
        "Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. All four edges of the grid are surrounded by water.",
        "Example 1:\nInput: grid = [[\"1\",\"1\",\"0\",\"0\"],[\"1\",\"1\",\"0\",\"0\"],[\"0\",\"0\",\"1\",\"0\"],[\"0\",\"0\",\"0\",\"1\"]]\nOutput: 3",
        "Constraints:\n- m == grid.length, n == grid[i].length\n- 1 <= m, n <= 300\n- grid[i][j] is '0' or '1'",
      ],
      code: `int numIslands(vector<vector<char>>& grid) {
    int m = grid.size(), n = grid[0].size();
    int dr[4] = {1, -1, 0, 0};
    int dc[4] = {0, 0, 1, -1};
    int count = 0;
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            if (grid[i][j] != '1') continue;
            count++;
            queue<pair<int, int>> q;
            q.push({i, j});
            grid[i][j] = '0';
            while (!q.empty()) {
                auto [r, c] = q.front(); q.pop();
                for (int d = 0; d < 4; d++) {
                    int nr = r + dr[d], nc = c + dc[d];
                    if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
                    if (grid[nr][nc] != '1') continue;
                    grid[nr][nc] = '0';
                    q.push({nr, nc});
                }
            }
        }
    }
    return count;
}`,
      explanation: [
        "Scan the grid; every unvisited land cell starts a new island, and a BFS from it consumes the whole connected component by sinking each reached cell to '0'.",
        "Marking a cell at push time (not at pop time) is essential: it guarantees a cell is never enqueued twice, so the queue stays bounded and the total work is linear in the number of cells.",
        "Time: O(m * n) - each cell is enqueued at most once. Space: O(m * n) for the queue in the worst case.",
      ],
    },
    {
      name: "01 Matrix",
      difficulty: "Medium",
      variation: "Multi-source BFS",
      link: "https://leetcode.com/problems/01-matrix/",
      question: [
        "Given an m x n binary matrix mat, return the distance of the nearest 0 for each cell. The distance between two adjacent cells is 1 (adjacency is horizontal or vertical).",
        "Example 1:\nInput: mat = [[0,0,0],[0,1,0],[1,1,1]]\nOutput: [[0,0,0],[0,1,0],[1,2,1]]",
        "Constraints:\n- m == mat.length, n == mat[i].length\n- 1 <= m, n <= 10^4 and 1 <= m * n <= 10^4\n- At least one 0 exists in mat",
      ],
      code: `vector<vector<int>> updateMatrix(vector<vector<int>>& mat) {
    int m = mat.size(), n = mat[0].size();
    vector<vector<int>> dist(m, vector<int>(n, -1));
    queue<pair<int, int>> q;
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            if (mat[i][j] == 0) {
                dist[i][j] = 0;
                q.push({i, j});
            }
        }
    }
    int dr[4] = {1, -1, 0, 0};
    int dc[4] = {0, 0, 1, -1};
    while (!q.empty()) {
        auto [r, c] = q.front(); q.pop();
        for (int d = 0; d < 4; d++) {
            int nr = r + dr[d], nc = c + dc[d];
            if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
            if (dist[nr][nc] != -1) continue;
            dist[nr][nc] = dist[r][c] + 1;
            q.push({nr, nc});
        }
    }
    return dist;
}`,
      explanation: [
        "Rather than running one BFS per cell, seed the queue with every zero at distance 0. This is equivalent to adding a virtual super-source connected to all zeros, so a single BFS computes each cell's distance to the closest zero.",
        "The layer invariant still holds with many sources: the queue always contains cells of at most two consecutive distance values, so the first time a cell is reached it is reached along a shortest path and its distance is final.",
        "Time: O(m * n). Space: O(m * n).",
      ],
    },
    {
      name: "Rotting Oranges",
      difficulty: "Medium",
      variation: "Multi-source BFS, layer as time step",
      link: "https://leetcode.com/problems/rotting-oranges/",
      question: [
        "You are given an m x n grid where each cell is 0 (empty), 1 (fresh orange) or 2 (rotten orange). Every minute, any fresh orange that is 4-directionally adjacent to a rotten orange becomes rotten. Return the minimum number of minutes until no cell has a fresh orange, or -1 if that is impossible.",
        "Example 1:\nInput: grid = [[2,1,1],[1,1,0],[0,1,1]]\nOutput: 4",
        "Example 2:\nInput: grid = [[2,1,1],[0,1,1],[1,0,1]]\nOutput: -1\nExplanation: The bottom-left orange is never reached.",
        "Constraints:\n- m == grid.length, n == grid[i].length\n- 1 <= m, n <= 10\n- grid[i][j] is 0, 1 or 2",
      ],
      code: `int orangesRotting(vector<vector<int>>& grid) {
    int m = grid.size(), n = grid[0].size();
    queue<pair<int, int>> q;
    int fresh = 0;
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            if (grid[i][j] == 2) q.push({i, j});
            else if (grid[i][j] == 1) fresh++;
        }
    }
    if (fresh == 0) return 0;
    int dr[4] = {1, -1, 0, 0};
    int dc[4] = {0, 0, 1, -1};
    int minutes = 0;
    while (!q.empty() && fresh > 0) {
        int sz = q.size();
        for (int i = 0; i < sz; i++) {
            auto [r, c] = q.front(); q.pop();
            for (int d = 0; d < 4; d++) {
                int nr = r + dr[d], nc = c + dc[d];
                if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
                if (grid[nr][nc] != 1) continue;
                grid[nr][nc] = 2;
                fresh--;
                q.push({nr, nc});
            }
        }
        minutes++;
    }
    return fresh == 0 ? minutes : -1;
}`,
      explanation: [
        "All initially rotten oranges are sources of the same BFS, and one BFS layer is exactly one minute of spreading - so the number of level sweeps is the elapsed time.",
        "The fresh counter is the termination test: if the queue drains while fresh oranges remain, those cells are unreachable from any rotten source and the answer is -1. Counting down avoids a second full grid scan.",
        "The loop stops as soon as fresh hits zero so the last empty expansion round is not counted as a minute. Time: O(m * n). Space: O(m * n).",
      ],
    },
    {
      name: "Shortest Path in Binary Matrix",
      difficulty: "Medium",
      variation: "8-directional grid BFS",
      link: "https://leetcode.com/problems/shortest-path-in-binary-matrix/",
      question: [
        "Given an n x n binary matrix grid, return the length of the shortest clear path from the top-left cell (0, 0) to the bottom-right cell (n-1, n-1), or -1 if there is no clear path. A clear path visits only cells with value 0, and consecutive visited cells are connected 8-directionally. The length of a path is the number of visited cells.",
        "Example 1:\nInput: grid = [[0,1],[1,0]]\nOutput: 2",
        "Example 2:\nInput: grid = [[0,0,0],[1,1,0],[1,1,0]]\nOutput: 4",
        "Constraints:\n- n == grid.length == grid[i].length\n- 1 <= n <= 100\n- grid[i][j] is 0 or 1",
      ],
      code: `int shortestPathBinaryMatrix(vector<vector<int>>& grid) {
    int n = grid.size();
    if (grid[0][0] != 0 || grid[n - 1][n - 1] != 0) return -1;
    vector<vector<int>> dist(n, vector<int>(n, -1));
    queue<pair<int, int>> q;
    q.push({0, 0});
    dist[0][0] = 1;
    int dr[8] = {1, 1, 1, 0, 0, -1, -1, -1};
    int dc[8] = {1, 0, -1, 1, -1, 1, 0, -1};
    while (!q.empty()) {
        auto [r, c] = q.front(); q.pop();
        if (r == n - 1 && c == n - 1) return dist[r][c];
        for (int d = 0; d < 8; d++) {
            int nr = r + dr[d], nc = c + dc[d];
            if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
            if (grid[nr][nc] != 0 || dist[nr][nc] != -1) continue;
            dist[nr][nc] = dist[r][c] + 1;
            q.push({nr, nc});
        }
    }
    return -1;
}`,
      explanation: [
        "Every move costs the same one cell, so the graph is unweighted and plain BFS gives the shortest path - no Dijkstra needed. Only the neighbour list changes from 4 to 8 offsets.",
        "Distances are stored in the dist grid, which doubles as the visited set: a cell with dist != -1 has already been reached along a shortest path and must not be relaxed again.",
        "Path length counts cells, so the source starts at 1 rather than 0. Time: O(n^2). Space: O(n^2).",
      ],
    },
    {
      name: "All Nodes Distance K in Binary Tree",
      difficulty: "Medium",
      variation: "Tree as undirected graph, BFS from target",
      link: "https://leetcode.com/problems/all-nodes-distance-k-in-binary-tree/",
      question: [
        "Given the root of a binary tree, a target node in that tree, and an integer k, return an array of the values of all nodes that are at distance k from the target node. The answer can be returned in any order.",
        "Example 1:\nInput: root = [3,5,1,6,2,0,8,null,null,7,4], target = 5, k = 2\nOutput: [7,4,1]",
        "Example 2:\nInput: root = [1], target = 1, k = 3\nOutput: []",
        "Constraints:\n- Number of nodes is in [1, 500]\n- 0 <= Node.val <= 500 and all values are unique\n- 0 <= k <= 1000",
      ],
      code: `vector<int> distanceK(TreeNode* root, TreeNode* target, int k) {
    unordered_map<TreeNode*, TreeNode*> parent;
    queue<TreeNode*> walk;
    walk.push(root);
    parent[root] = nullptr;
    while (!walk.empty()) {
        TreeNode* cur = walk.front(); walk.pop();
        if (cur->left) { parent[cur->left] = cur; walk.push(cur->left); }
        if (cur->right) { parent[cur->right] = cur; walk.push(cur->right); }
    }
    unordered_set<TreeNode*> seen;
    queue<TreeNode*> q;
    q.push(target);
    seen.insert(target);
    int dist = 0;
    while (!q.empty()) {
        if (dist == k) {
            vector<int> res;
            while (!q.empty()) {
                res.push_back(q.front()->val);
                q.pop();
            }
            return res;
        }
        int sz = q.size();
        for (int i = 0; i < sz; i++) {
            TreeNode* cur = q.front(); q.pop();
            TreeNode* nbrs[3] = {cur->left, cur->right, parent[cur]};
            for (int j = 0; j < 3; j++) {
                TreeNode* nb = nbrs[j];
                if (nb && seen.find(nb) == seen.end()) {
                    seen.insert(nb);
                    q.push(nb);
                }
            }
        }
        dist++;
    }
    return {};
}`,
      explanation: [
        "Distance in a tree can go up as well as down, so first record every node's parent with one pass. That turns the tree into an undirected graph where each node has up to three neighbours.",
        "A level-by-level BFS from the target then makes the whole k-th layer the answer. The seen set is what prevents walking back into the subtree you just came from, which would otherwise double count nodes.",
        "Time: O(n). Space: O(n) for the parent map and visited set.",
      ],
    },
    {
      name: "Jump Game III",
      difficulty: "Medium",
      variation: "Implicit graph BFS over indices",
      link: "https://leetcode.com/problems/jump-game-iii/",
      question: [
        "Given an array of non-negative integers arr and a starting index start, you can jump from index i to i + arr[i] or i - arr[i] as long as you stay inside the array. Return true if you can reach any index whose value is 0.",
        "Example 1:\nInput: arr = [4,2,3,0,3,1,2], start = 5\nOutput: true\nExplanation: 5 -> 4 -> 1 -> 3, and arr[3] == 0.",
        "Example 2:\nInput: arr = [3,0,2,1,2], start = 2\nOutput: false\nExplanation: Only indices 2, 4 and 0 are reachable and none of them holds 0.",
        "Constraints:\n- 1 <= arr.length <= 5 * 10^4\n- 0 <= arr[i] < arr.length\n- 0 <= start < arr.length",
      ],
      code: `bool canReach(vector<int>& arr, int start) {
    int n = arr.size();
    vector<bool> seen(n, false);
    queue<int> q;
    q.push(start);
    seen[start] = true;
    while (!q.empty()) {
        int i = q.front(); q.pop();
        if (arr[i] == 0) return true;
        int nexts[2] = {i + arr[i], i - arr[i]};
        for (int t = 0; t < 2; t++) {
            int j = nexts[t];
            if (j < 0 || j >= n || seen[j]) continue;
            seen[j] = true;
            q.push(j);
        }
    }
    return false;
}`,
      explanation: [
        "The array is a graph in disguise: indices are nodes and each index has at most two outgoing edges. Reachability is then a plain traversal - BFS is used here, and DFS would work equally well since only reachability, not distance, is asked.",
        "The seen array is mandatory: jumps can form cycles (for example i -> j -> i), and without it the queue would never drain.",
        "Time: O(n) - each index is enqueued at most once and expands two edges. Space: O(n).",
      ],
    },
    {
      name: "Steps by Knight",
      difficulty: "Medium",
      variation: "BFS on a board, 8 knight moves",
      link: "https://www.geeksforgeeks.org/minimum-steps-reach-target-knight/",
      question: [
        "Given a square chessboard of size N x N, the current position of a knight and a target position, return the minimum number of knight moves needed to reach the target. Positions are 1-indexed pairs (row, column) and the knight may land on any square of the board.",
        "Example 1:\nInput: N = 6, KnightPos = [4, 5], TargetPos = [1, 1]\nOutput: 3\nExplanation: One shortest route is (4,5) -> (5,3) -> (3,2) -> (1,1).",
        "Example 2:\nInput: N = 8, KnightPos = [7, 7], TargetPos = [7, 7]\nOutput: 0",
        "Constraints:\n- 1 <= N <= 1000\n- 1 <= knight and target coordinates <= N",
      ],
      code: `int minStepToReachTarget(vector<int>& KnightPos, vector<int>& TargetPos, int N) {
    vector<vector<int>> dist(N + 1, vector<int>(N + 1, -1));
    queue<pair<int, int>> q;
    q.push({KnightPos[0], KnightPos[1]});
    dist[KnightPos[0]][KnightPos[1]] = 0;
    int dx[8] = {1, 1, -1, -1, 2, 2, -2, -2};
    int dy[8] = {2, -2, 2, -2, 1, -1, 1, -1};
    while (!q.empty()) {
        auto [x, y] = q.front(); q.pop();
        if (x == TargetPos[0] && y == TargetPos[1]) return dist[x][y];
        for (int d = 0; d < 8; d++) {
            int nx = x + dx[d], ny = y + dy[d];
            if (nx < 1 || nx > N || ny < 1 || ny > N) continue;
            if (dist[nx][ny] != -1) continue;
            dist[nx][ny] = dist[x][y] + 1;
            q.push({nx, ny});
        }
    }
    return -1;
}`,
      explanation: [
        "Squares are nodes and the eight legal knight jumps are unit-cost edges, so the minimum number of moves is an unweighted shortest path and BFS solves it directly.",
        "Greedy heuristics such as always moving toward the target fail on a knight's move geometry; the BFS layer invariant is what guarantees optimality, because a square is first reached exactly at its true minimum distance.",
        "Time: O(N^2). Space: O(N^2). Bidirectional BFS from both ends roughly halves the explored area on large boards.",
      ],
    },
    {
      name: "Open the Lock",
      difficulty: "Medium",
      variation: "State-space BFS with dead states",
      link: "https://leetcode.com/problems/open-the-lock/",
      question: [
        "You have a lock with 4 circular wheels, each holding the digits 0 to 9, and turning a wheel one slot changes a digit by one with 9 wrapping to 0. The lock starts at \"0000\". Given a list of deadends (codes the lock must never display, or it jams) and a target, return the minimum number of turns to open the lock, or -1 if it is impossible.",
        "Example 1:\nInput: deadends = [\"0201\",\"0101\",\"0102\",\"1212\",\"2002\"], target = \"0202\"\nOutput: 6\nExplanation: A valid sequence is \"0000\" -> \"1000\" -> \"1100\" -> \"1200\" -> \"1201\" -> \"1202\" -> \"0202\".",
        "Example 2:\nInput: deadends = [\"0000\"], target = \"8888\"\nOutput: -1",
        "Constraints:\n- 1 <= deadends.length <= 500\n- deadends[i].length == 4 and target.length == 4\n- All strings consist of digits only",
      ],
      code: `int openLock(vector<string>& deadends, string target) {
    unordered_set<string> blocked(deadends.begin(), deadends.end());
    string start = "0000";
    if (blocked.count(start)) return -1;
    if (target == start) return 0;
    unordered_set<string> seen;
    seen.insert(start);
    queue<string> q;
    q.push(start);
    int turns = 0;
    while (!q.empty()) {
        int sz = q.size();
        turns++;
        for (int i = 0; i < sz; i++) {
            string cur = q.front(); q.pop();
            for (int p = 0; p < 4; p++) {
                char old = cur[p];
                int deltas[2] = {1, 9};
                for (int t = 0; t < 2; t++) {
                    cur[p] = '0' + ((old - '0' + deltas[t]) % 10);
                    if (blocked.count(cur) || seen.count(cur)) continue;
                    if (cur == target) return turns;
                    seen.insert(cur);
                    q.push(cur);
                }
                cur[p] = old;
            }
        }
    }
    return -1;
}`,
      explanation: [
        "Each of the 10000 lock codes is a node, and a single wheel turn is a unit-cost edge, giving 8 neighbours per state (4 wheels, up or down). Deadends are simply nodes removed from the graph.",
        "One BFS layer equals one turn, so the layer counter is the answer the first time target is generated. Adding +9 mod 10 is the wrap-around decrement, avoiding a negative modulo.",
        "Time: O(10^4 * 8) - bounded by the state space, not the input. Space: O(10^4).",
      ],
    },
    {
      name: "Snakes and Ladders",
      difficulty: "Medium",
      variation: "Board flattened to a graph, BFS",
      link: "https://leetcode.com/problems/snakes-and-ladders/",
      question: [
        "You are given an n x n integer board where cells are numbered 1 to n*n in boustrophedon order, starting at the bottom-left and alternating direction each row. From square curr you may move to any of curr+1 .. curr+6 that is at most n*n; if that destination has a snake or ladder (board value not -1) you must move to the destination it points to. You may take at most one snake or ladder per move. Return the least number of moves to reach square n*n, or -1 if impossible.",
        "Example 1:\nInput: board = [[-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1],[-1,35,-1,-1,13,-1],[-1,-1,-1,-1,-1,-1],[-1,15,-1,-1,-1,-1]]\nOutput: 4\nExplanation: Move to 2, take the ladder to 15, move to 17, take the ladder to 13, move to 14, take the ladder to 35, then move to 36.",
        "Example 2:\nInput: board = [[-1,-1],[-1,3]]\nOutput: 1",
        "Constraints:\n- n == board.length == board[i].length\n- 2 <= n <= 20\n- board[i][j] is -1 or in [1, n*n]",
      ],
      code: `int snakesAndLadders(vector<vector<int>>& board) {
    int n = board.size();
    int last = n * n;
    vector<int> dist(last + 1, -1);
    queue<int> q;
    q.push(1);
    dist[1] = 0;
    while (!q.empty()) {
        int cur = q.front(); q.pop();
        if (cur == last) return dist[cur];
        for (int step = 1; step <= 6 && cur + step <= last; step++) {
            int sq = cur + step;
            int quot = (sq - 1) / n;
            int rem = (sq - 1) % n;
            int r = n - 1 - quot;
            int c = (quot % 2 == 0) ? rem : n - 1 - rem;
            int nxt = board[r][c] == -1 ? sq : board[r][c];
            if (dist[nxt] != -1) continue;
            dist[nxt] = dist[cur] + 1;
            q.push(nxt);
        }
    }
    return -1;
}`,
      explanation: [
        "Collapse the board into squares 1..n*n so a state is a single integer. Every die roll costs one move regardless of how far a ladder carries you, so the graph is unweighted and BFS finds the fewest moves.",
        "The index conversion undoes the boustrophedon numbering: quot is the row counted from the bottom, and odd rows are traversed right to left, so the column is mirrored.",
        "A snake or ladder is a forced relabel of the destination, applied once - which is why nxt, not sq, is the node inserted into the queue. Time: O(n^2). Space: O(n^2).",
      ],
    },
    {
      name: "Shortest Bridge",
      difficulty: "Hard",
      variation: "Flood fill one component, then multi-source BFS",
      link: "https://leetcode.com/problems/shortest-bridge/",
      question: [
        "You are given an n x n binary matrix grid containing exactly two islands (4-directionally connected groups of 1s). You may change 0s to 1s to connect the two islands. Return the smallest number of 0s that must be flipped.",
        "Example 1:\nInput: grid = [[0,1],[1,0]]\nOutput: 1",
        "Example 2:\nInput: grid = [[0,1,0],[0,0,0],[0,0,1]]\nOutput: 2",
        "Constraints:\n- n == grid.length == grid[i].length\n- 2 <= n <= 100\n- grid[i][j] is 0 or 1\n- There are exactly two islands",
      ],
      code: `int shortestBridge(vector<vector<int>>& grid) {
    int n = grid.size();
    int dr[4] = {1, -1, 0, 0};
    int dc[4] = {0, 0, 1, -1};
    queue<pair<int, int>> frontier;
    bool found = false;
    for (int i = 0; i < n && !found; i++) {
        for (int j = 0; j < n && !found; j++) {
            if (grid[i][j] != 1) continue;
            found = true;
            queue<pair<int, int>> fill;
            fill.push({i, j});
            grid[i][j] = 2;
            while (!fill.empty()) {
                auto [r, c] = fill.front(); fill.pop();
                frontier.push({r, c});
                for (int d = 0; d < 4; d++) {
                    int nr = r + dr[d], nc = c + dc[d];
                    if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
                    if (grid[nr][nc] != 1) continue;
                    grid[nr][nc] = 2;
                    fill.push({nr, nc});
                }
            }
        }
    }
    int steps = 0;
    while (!frontier.empty()) {
        int sz = frontier.size();
        for (int i = 0; i < sz; i++) {
            auto [r, c] = frontier.front(); frontier.pop();
            for (int d = 0; d < 4; d++) {
                int nr = r + dr[d], nc = c + dc[d];
                if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
                if (grid[nr][nc] == 1) return steps;
                if (grid[nr][nc] != 0) continue;
                grid[nr][nc] = 2;
                frontier.push({nr, nc});
            }
        }
        steps++;
    }
    return -1;
}`,
      explanation: [
        "Phase one flood fills the first island found, repainting it as 2 and collecting all of its cells; phase two runs a multi-source BFS outward from that entire island at once.",
        "Treating the whole island as one source is what makes the answer correct - the bridge may start from any of its cells, and BFS expands all candidates in lockstep so the first contact with a remaining 1 is the minimum flip count.",
        "steps counts completed water layers, so it equals the number of 0s flipped when the second island is touched. Time: O(n^2). Space: O(n^2).",
      ],
    },
    {
      name: "Word Ladder",
      difficulty: "Hard",
      variation: "Implicit graph BFS over strings",
      link: "https://leetcode.com/problems/word-ladder/",
      question: [
        "A transformation sequence from beginWord to endWord is a sequence of words where every adjacent pair differs by exactly one letter and every word after beginWord is in wordList. Given beginWord, endWord and wordList, return the number of words in the shortest transformation sequence, or 0 if none exists.",
        "Example 1:\nInput: beginWord = \"hit\", endWord = \"cog\", wordList = [\"hot\",\"dot\",\"dog\",\"lot\",\"log\",\"cog\"]\nOutput: 5\nExplanation: \"hit\" -> \"hot\" -> \"dot\" -> \"dog\" -> \"cog\" has 5 words.",
        "Example 2:\nInput: beginWord = \"hit\", endWord = \"cog\", wordList = [\"hot\",\"dot\",\"dog\",\"lot\",\"log\"]\nOutput: 0\nExplanation: endWord is not in wordList.",
        "Constraints:\n- 1 <= beginWord.length <= 10\n- 1 <= wordList.length <= 5000 and all words have the same length\n- All words consist of lowercase English letters and wordList has no duplicates",
      ],
      code: `int ladderLength(string beginWord, string endWord, vector<string>& wordList) {
    unordered_set<string> dict(wordList.begin(), wordList.end());
    if (dict.find(endWord) == dict.end()) return 0;
    dict.erase(beginWord);
    queue<string> q;
    q.push(beginWord);
    int steps = 1;
    while (!q.empty()) {
        int sz = q.size();
        for (int i = 0; i < sz; i++) {
            string cur = q.front(); q.pop();
            if (cur == endWord) return steps;
            for (int p = 0; p < (int)cur.size(); p++) {
                char old = cur[p];
                for (char ch = 'a'; ch <= 'z'; ch++) {
                    if (ch == old) continue;
                    cur[p] = ch;
                    if (dict.find(cur) != dict.end()) {
                        dict.erase(cur);
                        q.push(cur);
                    }
                }
                cur[p] = old;
            }
        }
        steps++;
    }
    return 0;
}`,
      explanation: [
        "Words are nodes and one-letter substitutions are unit edges. Rather than comparing all pairs of words in O(N^2 * L), generate each word's neighbours by trying all 26 letters at every position and testing membership in a hash set.",
        "Erasing a word from the dictionary the moment it is enqueued acts as the visited marker: since BFS reaches every word at its minimum distance first, any later path to it can only be longer, so removal loses no shortest path.",
        "The count includes both endpoints, hence starting steps at 1. Time: O(N * L * 26) with L the word length. Space: O(N * L).",
      ],
    },
  ],
};
