import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Flood Fill",
      difficulty: "Easy",
      variation: "Grid DFS recolour",
      link: "https://leetcode.com/problems/flood-fill/",
      question: [
        "You are given an m x n image where image[i][j] is the pixel value, a starting pixel (sr, sc) and a new colour. Perform a flood fill: recolour the starting pixel and every pixel connected to it 4-directionally through pixels of the same original colour. Return the modified image.",
        "Example 1:\nInput: image = [[1,1,1],[1,1,0],[1,0,1]], sr = 1, sc = 1, color = 2\nOutput: [[2,2,2],[2,2,0],[2,0,1]]\nExplanation: The bottom-right 1 is not 4-connected to the starting pixel through 1s.",
        "Constraints:\n- m == image.length, n == image[i].length\n- 1 <= m, n <= 50\n- 0 <= image[i][j], color < 2^16",
      ],
      code: `void paint(vector<vector<int>>& image, int r, int c, int from, int color) {
    int m = image.size(), n = image[0].size();
    if (r < 0 || r >= m || c < 0 || c >= n) return;
    if (image[r][c] != from) return;
    image[r][c] = color;
    paint(image, r + 1, c, from, color);
    paint(image, r - 1, c, from, color);
    paint(image, r, c + 1, from, color);
    paint(image, r, c - 1, from, color);
}

vector<vector<int>> floodFill(vector<vector<int>>& image, int sr, int sc, int color) {
    if (image[sr][sc] != color) {
        paint(image, sr, sc, image[sr][sc], color);
    }
    return image;
}`,
      explanation: [
        "This is the minimal DFS skeleton: check bounds, check the cell still matches the source colour, mutate it, then recurse into the four neighbours. Overwriting the pixel before recursing is what marks it visited.",
        "The guard for image[sr][sc] == color is essential - without it, recolouring to the same colour never changes the cell, so the visited test never becomes false and the recursion loops forever.",
        "Time: O(m * n) - every pixel is entered at most once as a matching cell. Space: O(m * n) recursion depth in the worst case.",
      ],
    },
    {
      name: "Path Sum",
      difficulty: "Easy",
      variation: "Root-to-leaf DFS with carried state",
      link: "https://leetcode.com/problems/path-sum/",
      question: [
        "Given the root of a binary tree and an integer targetSum, return true if the tree has a root-to-leaf path such that the sum of the values along the path equals targetSum. A leaf is a node with no children.",
        "Example 1:\nInput: root = [5,4,8,11,null,13,4,7,2,null,null,null,1], targetSum = 22\nOutput: true\nExplanation: The path 5 -> 4 -> 11 -> 2 sums to 22.",
        "Example 2:\nInput: root = [], targetSum = 0\nOutput: false",
        "Constraints:\n- Number of nodes is in [0, 5000]\n- -1000 <= Node.val <= 1000\n- -1000 <= targetSum <= 1000",
      ],
      code: `bool hasPathSum(TreeNode* root, int targetSum) {
    if (!root) return false;
    int rest = targetSum - root->val;
    if (!root->left && !root->right) return rest == 0;
    return hasPathSum(root->left, rest) || hasPathSum(root->right, rest);
}`,
      explanation: [
        "Carry the remaining target down the recursion instead of accumulating a running sum upward. At a leaf the question collapses to a single equality check.",
        "The empty-node case must return false rather than testing the remainder: a node with one child would otherwise be treated as a leaf on its missing side and report a false positive.",
        "The short-circuiting || means the right subtree is skipped as soon as the left one succeeds. Time: O(n). Space: O(h) for the call stack, O(n) on a degenerate tree.",
      ],
    },
    {
      name: "Number of Islands",
      difficulty: "Medium",
      variation: "Connected components via DFS",
      link: "https://leetcode.com/problems/number-of-islands/",
      question: [
        "Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. All four edges of the grid are surrounded by water.",
        "Example 1:\nInput: grid = [[\"1\",\"1\",\"0\",\"0\"],[\"1\",\"1\",\"0\",\"0\"],[\"0\",\"0\",\"1\",\"0\"],[\"0\",\"0\",\"0\",\"1\"]]\nOutput: 3",
        "Constraints:\n- m == grid.length, n == grid[i].length\n- 1 <= m, n <= 300\n- grid[i][j] is '0' or '1'",
      ],
      code: `void sink(vector<vector<char>>& grid, int r, int c) {
    int m = grid.size(), n = grid[0].size();
    if (r < 0 || r >= m || c < 0 || c >= n) return;
    if (grid[r][c] != '1') return;
    grid[r][c] = '0';
    sink(grid, r + 1, c);
    sink(grid, r - 1, c);
    sink(grid, r, c + 1);
    sink(grid, r, c - 1);
}

int numIslands(vector<vector<char>>& grid) {
    int m = grid.size(), n = grid[0].size();
    int count = 0;
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            if (grid[i][j] == '1') {
                count++;
                sink(grid, i, j);
            }
        }
    }
    return count;
}`,
      explanation: [
        "Counting islands is counting connected components. The outer scan only ever finds a land cell that no earlier DFS has consumed, so each increment corresponds to exactly one new component.",
        "The DFS erases the component as it walks it, using the grid itself as the visited set - no extra O(m * n) array is needed. Every cell is written once and read a constant number of times.",
        "Time: O(m * n). Space: O(m * n) recursion depth in the worst case (a snake-shaped island).",
      ],
    },
    {
      name: "Max Area of Island",
      difficulty: "Medium",
      variation: "DFS returning a subtree/component size",
      link: "https://leetcode.com/problems/max-area-of-island/",
      question: [
        "You are given an m x n binary matrix grid. An island is a group of 1s connected 4-directionally. Return the maximum area of an island in grid, where area is the number of cells with value 1 in the island. If there is no island, return 0.",
        "Example 1:\nInput: grid = [[1,1,0,0],[1,1,0,0],[0,0,1,1],[0,0,0,1]]\nOutput: 4",
        "Example 2:\nInput: grid = [[0,0,0]]\nOutput: 0",
        "Constraints:\n- m == grid.length, n == grid[i].length\n- 1 <= m, n <= 50\n- grid[i][j] is 0 or 1",
      ],
      code: `int area(vector<vector<int>>& grid, int r, int c) {
    int m = grid.size(), n = grid[0].size();
    if (r < 0 || r >= m || c < 0 || c >= n) return 0;
    if (grid[r][c] != 1) return 0;
    grid[r][c] = 0;
    return 1 + area(grid, r + 1, c) + area(grid, r - 1, c)
             + area(grid, r, c + 1) + area(grid, r, c - 1);
}

int maxAreaOfIsland(vector<vector<int>>& grid) {
    int best = 0;
    for (int i = 0; i < (int)grid.size(); i++) {
        for (int j = 0; j < (int)grid[0].size(); j++) {
            if (grid[i][j] == 1) best = max(best, area(grid, i, j));
        }
    }
    return best;
}`,
      explanation: [
        "The DFS now returns a value instead of just marking: one for the current cell plus whatever the four recursive calls report. Because a cell is zeroed on entry, it contributes to exactly one of those sums.",
        "That single change - a DFS that aggregates results from its children - is the pattern behind subtree sizes, component sizes and tree DP generally.",
        "Time: O(m * n). Space: O(m * n) worst-case recursion depth.",
      ],
    },
    {
      name: "Number of Provinces",
      difficulty: "Medium",
      variation: "Components on an adjacency matrix",
      link: "https://leetcode.com/problems/number-of-provinces/",
      question: [
        "There are n cities. Some are connected directly, and if a is connected to b and b to c then a is indirectly connected to c. A province is a group of directly or indirectly connected cities with no other cities outside of it. Given an n x n matrix isConnected where isConnected[i][j] == 1 if the i-th and j-th cities are directly connected, return the total number of provinces.",
        "Example 1:\nInput: isConnected = [[1,1,0],[1,1,0],[0,0,1]]\nOutput: 2",
        "Example 2:\nInput: isConnected = [[1,0,0],[0,1,0],[0,0,1]]\nOutput: 3",
        "Constraints:\n- 1 <= n <= 200\n- n == isConnected.length == isConnected[i].length\n- isConnected[i][j] is 1 or 0 and isConnected[i][i] == 1",
      ],
      code: `void visit(vector<vector<int>>& g, vector<bool>& seen, int u) {
    seen[u] = true;
    for (int v = 0; v < (int)g.size(); v++) {
        if (g[u][v] == 1 && !seen[v]) visit(g, seen, v);
    }
}

int findCircleNum(vector<vector<int>>& isConnected) {
    int n = isConnected.size();
    vector<bool> seen(n, false);
    int provinces = 0;
    for (int i = 0; i < n; i++) {
        if (!seen[i]) {
            provinces++;
            visit(isConnected, seen, i);
        }
    }
    return provinces;
}`,
      explanation: [
        "Same component-counting skeleton as Number of Islands, but the graph arrives as an adjacency matrix, so a node's neighbours are found by scanning its whole row.",
        "The seen array is checked before recursing rather than at function entry only, which keeps redundant calls out of the stack; either placement is correct as long as a node is marked before its neighbours are expanded.",
        "Time: O(n^2) - the matrix is read once. Space: O(n).",
      ],
    },
    {
      name: "Keys and Rooms",
      difficulty: "Medium",
      variation: "Reachability DFS on a directed graph",
      link: "https://leetcode.com/problems/keys-and-rooms/",
      question: [
        "There are n rooms labelled 0 to n-1 and all rooms are locked except room 0. Room i contains a set of keys rooms[i], each opening another room. Starting in room 0, return true if you can visit all the rooms.",
        "Example 1:\nInput: rooms = [[1],[2],[3],[]]\nOutput: true",
        "Example 2:\nInput: rooms = [[1,3],[3,0,1],[2],[0]]\nOutput: false\nExplanation: Room 2 has no key pointing to it from any reachable room.",
        "Constraints:\n- n == rooms.length\n- 2 <= n <= 1000\n- 0 <= rooms[i].length <= 1000 and 0 <= rooms[i][j] < n\n- All values in rooms[i] are unique",
      ],
      code: `void walk(vector<vector<int>>& rooms, vector<bool>& seen, int u, int& count) {
    seen[u] = true;
    count++;
    for (int v : rooms[u]) {
        if (!seen[v]) walk(rooms, seen, v, count);
    }
}

bool canVisitAllRooms(vector<vector<int>>& rooms) {
    int n = rooms.size();
    vector<bool> seen(n, false);
    int count = 0;
    walk(rooms, seen, 0, count);
    return count == n;
}`,
      explanation: [
        "Rooms are nodes and keys are directed edges, so the question is whether every node is reachable from node 0 - a single DFS answers it.",
        "Unlike component counting, the traversal starts from one fixed source only; comparing the number of visited nodes to n decides the result. Marking on entry keeps cycles (room A holding a key to room B and back) from looping.",
        "Time: O(V + E) where E is the total number of keys. Space: O(V).",
      ],
    },
    {
      name: "Path Sum II",
      difficulty: "Medium",
      variation: "DFS with backtracking path state",
      link: "https://leetcode.com/problems/path-sum-ii/",
      question: [
        "Given the root of a binary tree and an integer targetSum, return all root-to-leaf paths where the sum of the node values equals targetSum. Each path should be returned as a list of node values.",
        "Example 1:\nInput: root = [5,4,8,11,null,13,4,7,2,5,1], targetSum = 22\nOutput: [[5,4,11,2],[5,8,4,5]]",
        "Example 2:\nInput: root = [1,2,3], targetSum = 5\nOutput: []",
        "Constraints:\n- Number of nodes is in [0, 5000]\n- -1000 <= Node.val <= 1000\n- -1000 <= targetSum <= 1000",
      ],
      code: `void collect(TreeNode* node, int rest, vector<int>& path,
             vector<vector<int>>& out) {
    if (!node) return;
    path.push_back(node->val);
    rest -= node->val;
    if (!node->left && !node->right && rest == 0) {
        out.push_back(path);
    } else {
        collect(node->left, rest, path, out);
        collect(node->right, rest, path, out);
    }
    path.pop_back();
}

vector<vector<int>> pathSum(TreeNode* root, int targetSum) {
    vector<vector<int>> out;
    vector<int> path;
    collect(root, targetSum, path, out);
    return out;
}`,
      explanation: [
        "One shared path vector records the current root-to-node chain. Pushing on entry and popping on exit keeps it exactly equal to the stack of nodes currently being explored - that pop is the backtracking step.",
        "Copying path into the output only happens at a qualifying leaf, so the O(h) copy cost is paid once per answer instead of once per node.",
        "Time: O(n) traversal plus O(total output size) for the copies. Space: O(h) for the path and stack.",
      ],
    },
    {
      name: "All Paths From Source to Target",
      difficulty: "Medium",
      variation: "Enumerate all DAG paths by backtracking",
      link: "https://leetcode.com/problems/all-paths-from-source-to-target/",
      question: [
        "Given a directed acyclic graph of n nodes labelled 0 to n-1, find all possible paths from node 0 to node n-1 and return them in any order. graph[i] is the list of nodes you can visit from node i.",
        "Example 1:\nInput: graph = [[1,2],[3],[3],[]]\nOutput: [[0,1,3],[0,2,3]]",
        "Example 2:\nInput: graph = [[4,3,1],[3,2,4],[3],[4],[]]\nOutput: [[0,4],[0,3,4],[0,1,3,4],[0,1,2,3,4],[0,1,4]]",
        "Constraints:\n- n == graph.length\n- 2 <= n <= 15\n- The graph is a DAG with no self-loops or duplicate edges",
      ],
      code: `void explore(vector<vector<int>>& graph, int u, vector<int>& path,
             vector<vector<int>>& out) {
    path.push_back(u);
    if (u == (int)graph.size() - 1) {
        out.push_back(path);
    } else {
        for (int v : graph[u]) explore(graph, v, path, out);
    }
    path.pop_back();
}

vector<vector<int>> allPathsSourceTarget(vector<vector<int>>& graph) {
    vector<vector<int>> out;
    vector<int> path;
    explore(graph, 0, path, out);
    return out;
}`,
      explanation: [
        "Because the graph is acyclic, no visited array is needed: a node can legitimately appear on many different paths, and there is no risk of an infinite walk.",
        "This is the key contrast with reachability DFS - marking nodes as visited would silently discard valid alternative paths. Here the only state is the current path, pushed on entry and popped on return.",
        "The number of paths can be exponential. Time: O(2^n * n) in the worst case. Space: O(n) excluding the output.",
      ],
    },
    {
      name: "Clone Graph",
      difficulty: "Medium",
      variation: "DFS with a visited map of originals to copies",
      link: "https://leetcode.com/problems/clone-graph/",
      question: [
        "Given a reference to a node in a connected undirected graph, return a deep copy of the graph. Each node contains an integer val and a list of its neighbours. The graph is given by any one of its nodes, and if the given node is null you should return null.",
        "Example 1:\nInput: adjList = [[2,4],[1,3],[2,4],[1,3]]\nOutput: [[2,4],[1,3],[2,4],[1,3]]\nExplanation: A structurally identical graph built from new nodes.",
        "Example 2:\nInput: adjList = [[]]\nOutput: [[]]\nExplanation: A single node with no neighbours.",
        "Constraints:\n- Number of nodes is in [0, 100]\n- 1 <= Node.val <= 100 and values are unique\n- The graph is connected and has no repeated edges or self-loops",
      ],
      code: `Node* build(Node* cur, unordered_map<Node*, Node*>& made) {
    auto it = made.find(cur);
    if (it != made.end()) return it->second;
    Node* copy = new Node(cur->val);
    made[cur] = copy;
    for (Node* nb : cur->neighbors) {
        copy->neighbors.push_back(build(nb, made));
    }
    return copy;
}

Node* cloneGraph(Node* node) {
    if (!node) return nullptr;
    unordered_map<Node*, Node*> made;
    return build(node, made);
}`,
      explanation: [
        "The map from original pointer to clone pointer plays the role of the visited set and of the result table at the same time: a node already in the map has been cloned, so its existing copy is returned.",
        "Registering the clone in the map before recursing into neighbours is what makes cycles terminate - when the recursion comes back around to a node currently being built, it finds the partially filled copy instead of allocating a second one.",
        "Time: O(V + E). Space: O(V) for the map plus O(V) recursion depth.",
      ],
    },
    {
      name: "Surrounded Regions",
      difficulty: "Medium",
      variation: "DFS from the border, complement marking",
      link: "https://leetcode.com/problems/surrounded-regions/",
      question: [
        "You are given an m x n matrix board containing 'X' and 'O'. Capture all regions of 'O' that are 4-directionally surrounded by 'X' by flipping them to 'X'. A region is not captured if any of its cells lies on the border of the board. Modify the board in place.",
        "Example 1:\nInput: board = [[\"X\",\"X\",\"X\",\"X\"],[\"X\",\"O\",\"O\",\"X\"],[\"X\",\"X\",\"O\",\"X\"],[\"X\",\"O\",\"X\",\"X\"]]\nOutput: [[\"X\",\"X\",\"X\",\"X\"],[\"X\",\"X\",\"X\",\"X\"],[\"X\",\"X\",\"X\",\"X\"],[\"X\",\"O\",\"X\",\"X\"]]\nExplanation: Only the bottom-left region touches the border, so it survives.",
        "Constraints:\n- m == board.length, n == board[i].length\n- 1 <= m, n <= 200\n- board[i][j] is 'X' or 'O'",
      ],
      code: `void mark(vector<vector<char>>& board, int r, int c) {
    int m = board.size(), n = board[0].size();
    if (r < 0 || r >= m || c < 0 || c >= n) return;
    if (board[r][c] != 'O') return;
    board[r][c] = 'S';
    mark(board, r + 1, c);
    mark(board, r - 1, c);
    mark(board, r, c + 1);
    mark(board, r, c - 1);
}

void solve(vector<vector<char>>& board) {
    int m = board.size(), n = board[0].size();
    for (int i = 0; i < m; i++) {
        mark(board, i, 0);
        mark(board, i, n - 1);
    }
    for (int j = 0; j < n; j++) {
        mark(board, 0, j);
        mark(board, m - 1, j);
    }
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            if (board[i][j] == 'O') board[i][j] = 'X';
            else if (board[i][j] == 'S') board[i][j] = 'O';
        }
    }
}`,
      explanation: [
        "Detecting whether a region touches the border from inside the region is awkward, so invert the problem: DFS inward from every border 'O' and stamp everything reachable as safe ('S').",
        "After that pass the classification is local - any remaining 'O' belongs to a region that no border cell could reach, so it is surrounded and gets flipped, while 'S' cells are restored to 'O'.",
        "Time: O(m * n). Space: O(m * n) recursion depth worst case.",
      ],
    },
    {
      name: "Course Schedule",
      difficulty: "Medium",
      variation: "DFS cycle detection with three colours",
      link: "https://leetcode.com/problems/course-schedule/",
      question: [
        "There are numCourses courses labelled 0 to numCourses-1. prerequisites[i] = [a, b] means you must take course b before course a. Return true if you can finish all courses.",
        "Example 1:\nInput: numCourses = 2, prerequisites = [[1,0]]\nOutput: true",
        "Example 2:\nInput: numCourses = 2, prerequisites = [[1,0],[0,1]]\nOutput: false\nExplanation: The two courses depend on each other.",
        "Constraints:\n- 1 <= numCourses <= 2000\n- 0 <= prerequisites.length <= 5000\n- All prerequisite pairs are distinct",
      ],
      code: `bool hasCycle(vector<vector<int>>& adj, vector<int>& color, int u) {
    color[u] = 1;
    for (int v : adj[u]) {
        if (color[v] == 1) return true;
        if (color[v] == 0 && hasCycle(adj, color, v)) return true;
    }
    color[u] = 2;
    return false;
}

bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
    vector<vector<int>> adj(numCourses);
    for (auto& p : prerequisites) {
        adj[p[1]].push_back(p[0]);
    }
    vector<int> color(numCourses, 0);
    for (int i = 0; i < numCourses; i++) {
        if (color[i] == 0 && hasCycle(adj, color, i)) return false;
    }
    return true;
}`,
      explanation: [
        "All courses are finishable exactly when the dependency digraph has no directed cycle. Colours encode the DFS state: 0 unvisited, 1 on the current recursion stack, 2 fully explored.",
        "Reaching a grey (1) node means an edge back into the active path, which is a cycle by definition. A black (2) node is already known to lead to no cycle, so it is skipped - this is what keeps the scan linear instead of exponential.",
        "Marking black only after all descendants return is essential; marking it early would misreport back edges as safe. Time: O(V + E). Space: O(V + E).",
      ],
    },
    {
      name: "Pacific Atlantic Water Flow",
      difficulty: "Medium",
      variation: "Reverse DFS from two boundary sets",
      link: "https://leetcode.com/problems/pacific-atlantic-water-flow/",
      question: [
        "There is an m x n rectangular island bordered by the Pacific Ocean on the top and left edges and the Atlantic Ocean on the bottom and right edges. heights[r][c] is the height above sea level of cell (r, c). Rain water flows from a cell to a neighbouring cell of height less than or equal to the current cell, and from any border cell into the adjacent ocean. Return a list of coordinates from which water can flow to both oceans.",
        "Example 1:\nInput: heights = [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]\nOutput: [[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]",
        "Constraints:\n- m == heights.length, n == heights[r].length\n- 1 <= m, n <= 200\n- 0 <= heights[r][c] <= 10^5",
      ],
      code: `void climb(vector<vector<int>>& h, vector<vector<char>>& seen, int r, int c) {
    int m = h.size(), n = h[0].size();
    seen[r][c] = 1;
    int dr[4] = {1, -1, 0, 0};
    int dc[4] = {0, 0, 1, -1};
    for (int d = 0; d < 4; d++) {
        int nr = r + dr[d], nc = c + dc[d];
        if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
        if (seen[nr][nc]) continue;
        if (h[nr][nc] < h[r][c]) continue;
        climb(h, seen, nr, nc);
    }
}

vector<vector<int>> pacificAtlantic(vector<vector<int>>& heights) {
    int m = heights.size(), n = heights[0].size();
    vector<vector<char>> pac(m, vector<char>(n, 0));
    vector<vector<char>> atl(m, vector<char>(n, 0));
    for (int i = 0; i < m; i++) {
        if (!pac[i][0]) climb(heights, pac, i, 0);
        if (!atl[i][n - 1]) climb(heights, atl, i, n - 1);
    }
    for (int j = 0; j < n; j++) {
        if (!pac[0][j]) climb(heights, pac, 0, j);
        if (!atl[m - 1][j]) climb(heights, atl, m - 1, j);
    }
    vector<vector<int>> res;
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            if (pac[i][j] && atl[i][j]) res.push_back({i, j});
        }
    }
    return res;
}`,
      explanation: [
        "Running a DFS from each cell to test whether it drains to both oceans would cost O((m*n)^2). Instead reverse the flow: start at the ocean borders and walk uphill, visiting a neighbour only when it is at least as high as the current cell.",
        "Water flows downhill from x to y exactly when the uphill walk goes from y to x, so the two boolean grids record precisely which cells drain to the Pacific and which to the Atlantic; the answer is their intersection.",
        "Time: O(m * n) - two traversals, each visiting a cell at most once. Space: O(m * n).",
      ],
    },
    {
      name: "Count Sub Islands",
      difficulty: "Medium",
      variation: "DFS with a component-wide predicate",
      link: "https://leetcode.com/problems/count-sub-islands/",
      question: [
        "You are given two m x n binary matrices grid1 and grid2 containing only 0s (water) and 1s (land), where islands are 4-directionally connected groups of 1s. An island in grid2 is a sub-island if every one of its cells is also part of an island in grid1. Return the number of sub-islands in grid2.",
        "Example 1:\nInput: grid1 = [[1,1,1,0,0],[0,1,1,1,1],[0,0,0,0,0],[1,0,0,0,0],[1,1,0,1,1]], grid2 = [[1,1,1,0,0],[0,0,1,1,1],[0,1,0,0,0],[1,0,1,1,0],[0,1,0,1,0]]\nOutput: 3",
        "Constraints:\n- m == grid1.length == grid2.length\n- n == grid1[i].length == grid2[i].length\n- 1 <= m, n <= 500\n- Both grids contain only 0s and 1s",
      ],
      code: `bool sweep(vector<vector<int>>& g1, vector<vector<int>>& g2, int r, int c) {
    int m = g2.size(), n = g2[0].size();
    if (r < 0 || r >= m || c < 0 || c >= n) return true;
    if (g2[r][c] == 0) return true;
    g2[r][c] = 0;
    bool ok = (g1[r][c] == 1);
    ok = sweep(g1, g2, r + 1, c) && ok;
    ok = sweep(g1, g2, r - 1, c) && ok;
    ok = sweep(g1, g2, r, c + 1) && ok;
    ok = sweep(g1, g2, r, c - 1) && ok;
    return ok;
}

int countSubIslands(vector<vector<int>>& grid1, vector<vector<int>>& grid2) {
    int m = grid2.size(), n = grid2[0].size();
    int count = 0;
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            if (grid2[i][j] == 1 && sweep(grid1, grid2, i, j)) count++;
        }
    }
    return count;
}`,
      explanation: [
        "Each grid2 island is flood filled once, and the DFS returns whether every cell it touched is also land in grid1 - a logical AND folded over the component.",
        "The recursive calls are written as ok = sweep(...) && ok rather than ok && sweep(...) on purpose: the second form would short-circuit and leave part of the island unmarked, so those cells would be counted again as a separate island.",
        "Time: O(m * n). Space: O(m * n) recursion depth worst case.",
      ],
    },
    {
      name: "Time Needed to Inform All Employees",
      difficulty: "Medium",
      variation: "DFS on a rooted tree, max over children",
      link: "https://leetcode.com/problems/time-needed-to-inform-all-employees/",
      question: [
        "A company has n employees with unique ids 0 to n-1. manager[i] is the direct manager of employee i, and the head of the company has manager[headID] == -1. To pass news down, an employee needs informTime[i] minutes to inform all of their direct subordinates, who then start informing theirs in parallel. Return the number of minutes needed to inform all employees.",
        "Example 1:\nInput: n = 1, headID = 0, manager = [-1], informTime = [0]\nOutput: 0",
        "Example 2:\nInput: n = 6, headID = 2, manager = [2,2,-1,2,2,2], informTime = [0,0,1,0,0,0]\nOutput: 1\nExplanation: The head informs all five subordinates in parallel in 1 minute.",
        "Constraints:\n- 1 <= n <= 10^5\n- 0 <= headID < n\n- informTime[i] == 0 if employee i has no subordinates\n- The structure is guaranteed to be a valid tree",
      ],
      code: `int spread(vector<vector<int>>& children, vector<int>& informTime, int u) {
    int deepest = 0;
    for (int v : children[u]) {
        deepest = max(deepest, spread(children, informTime, v));
    }
    return deepest + informTime[u];
}

int numOfMinutes(int n, int headID, vector<int>& manager, vector<int>& informTime) {
    vector<vector<int>> children(n);
    for (int i = 0; i < n; i++) {
        if (manager[i] != -1) children[manager[i]].push_back(i);
    }
    return spread(children, informTime, headID);
}`,
      explanation: [
        "The manager array points upward, so first invert it into child lists; the result is a rooted tree and the answer is the maximum weighted depth from the head.",
        "Because a manager informs all direct reports simultaneously, the cost of a subtree is that manager's informTime plus the worst of its children - a max, not a sum. Leaves have informTime 0 and terminate the recursion naturally.",
        "Time: O(n). Space: O(n); on a chain-shaped hierarchy the recursion is n deep, so an explicit stack or BFS is safer at the upper constraint.",
      ],
    },
    {
      name: "Reconstruct Itinerary",
      difficulty: "Hard",
      variation: "Hierholzer DFS post-order (Eulerian path)",
      link: "https://leetcode.com/problems/reconstruct-itinerary/",
      question: [
        "You are given a list of airline tickets where tickets[i] = [from, to]. Reconstruct the itinerary in order, starting from \"JFK\" and using all the tickets exactly once. If multiple valid itineraries exist, return the one with the smallest lexical order when read as a single string. A valid itinerary is guaranteed to exist.",
        "Example 1:\nInput: tickets = [[\"MUC\",\"LHR\"],[\"JFK\",\"MUC\"],[\"SFO\",\"SJC\"],[\"LHR\",\"SFO\"]]\nOutput: [\"JFK\",\"MUC\",\"LHR\",\"SFO\",\"SJC\"]",
        "Example 2:\nInput: tickets = [[\"JFK\",\"SFO\"],[\"JFK\",\"ATL\"],[\"SFO\",\"ATL\"],[\"ATL\",\"JFK\"],[\"ATL\",\"SFO\"]]\nOutput: [\"JFK\",\"ATL\",\"JFK\",\"SFO\",\"ATL\",\"SFO\"]",
        "Constraints:\n- 1 <= tickets.length <= 300\n- Airport codes are exactly 3 uppercase letters\n- from != to",
      ],
      code: `void hierholzer(unordered_map<string, multiset<string>>& adj,
                const string& u, vector<string>& route) {
    auto it = adj.find(u);
    while (it != adj.end() && !it->second.empty()) {
        string v = *it->second.begin();
        it->second.erase(it->second.begin());
        hierholzer(adj, v, route);
    }
    route.push_back(u);
}

vector<string> findItinerary(vector<vector<string>>& tickets) {
    unordered_map<string, multiset<string>> adj;
    for (auto& t : tickets) {
        adj[t[0]].insert(t[1]);
    }
    vector<string> route;
    hierholzer(adj, "JFK", route);
    reverse(route.begin(), route.end());
    return route;
}`,
      explanation: [
        "Tickets are edges that must each be used once, so the itinerary is an Eulerian path from JFK. Storing destinations in a multiset makes the smallest unused destination available in O(log d), which yields the lexicographically smallest walk.",
        "A naive greedy walk can strand itself at an airport with no tickets left while edges remain elsewhere. Hierholzer's fix is the post-order append: a node is written to route only after all of its outgoing edges are exhausted, so dead ends are placed at the end of the reversed list where they belong.",
        "Edges are erased as they are used, which is why the same airport can be revisited legally. Time: O(E log E). Space: O(E).",
      ],
    },
    {
      name: "Making A Large Island",
      difficulty: "Hard",
      variation: "DFS labelling plus component size lookup",
      link: "https://leetcode.com/problems/making-a-large-island/",
      question: [
        "You are given an n x n binary matrix grid. You may change at most one 0 to a 1. Return the size of the largest island in grid after applying this operation, where an island is a 4-directionally connected group of 1s.",
        "Example 1:\nInput: grid = [[1,0],[0,1]]\nOutput: 3",
        "Example 2:\nInput: grid = [[1,1],[1,1]]\nOutput: 4\nExplanation: There is no 0 to flip, so the existing island is the answer.",
        "Constraints:\n- n == grid.length == grid[i].length\n- 1 <= n <= 500\n- grid[i][j] is 0 or 1",
      ],
      code: `int label(vector<vector<int>>& grid, int r, int c, int id) {
    int n = grid.size();
    if (r < 0 || r >= n || c < 0 || c >= n) return 0;
    if (grid[r][c] != 1) return 0;
    grid[r][c] = id;
    return 1 + label(grid, r + 1, c, id) + label(grid, r - 1, c, id)
             + label(grid, r, c + 1, id) + label(grid, r, c - 1, id);
}

int largestIsland(vector<vector<int>>& grid) {
    int n = grid.size();
    unordered_map<int, int> sizeOf;
    int id = 2, best = 0;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            if (grid[i][j] == 1) {
                int s = label(grid, i, j, id);
                sizeOf[id] = s;
                best = max(best, s);
                id++;
            }
        }
    }
    int dr[4] = {1, -1, 0, 0};
    int dc[4] = {0, 0, 1, -1};
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            if (grid[i][j] != 0) continue;
            int total = 1;
            int used[4] = {0, 0, 0, 0};
            int k = 0;
            for (int d = 0; d < 4; d++) {
                int nr = i + dr[d], nc = j + dc[d];
                if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
                int tag = grid[nr][nc];
                if (tag < 2) continue;
                bool dup = false;
                for (int t = 0; t < k; t++) {
                    if (used[t] == tag) dup = true;
                }
                if (dup) continue;
                used[k++] = tag;
                total += sizeOf[tag];
            }
            best = max(best, total);
        }
    }
    return best;
}`,
      explanation: [
        "Flipping each 0 and recomputing island sizes would be O(n^4). Instead label every island with a unique id (starting at 2 so it cannot be confused with 0 or 1) and record its size once.",
        "Then each 0 is evaluated in O(1): the merged island is 1 plus the sizes of the distinct labels among its at most four neighbours. Deduplicating the labels matters because two neighbours often belong to the same island, and counting it twice would inflate the result.",
        "The all-ones case is covered by seeding best from the labelling pass, since there is then no 0 to consider. Time: O(n^2). Space: O(n^2).",
      ],
    },
    {
      name: "Longest Increasing Path in a Matrix",
      difficulty: "Hard",
      variation: "DFS plus memoisation on a DAG",
      link: "https://leetcode.com/problems/longest-increasing-path-in-a-matrix/",
      question: [
        "Given an m x n integers matrix, return the length of the longest strictly increasing path in matrix. From each cell you can move in four directions - left, right, up or down - and you may not move diagonally or outside the boundary.",
        "Example 1:\nInput: matrix = [[9,9,4],[6,6,8],[2,1,1]]\nOutput: 4\nExplanation: The longest increasing path is [1,2,6,9].",
        "Example 2:\nInput: matrix = [[1]]\nOutput: 1",
        "Constraints:\n- m == matrix.length, n == matrix[i].length\n- 1 <= m, n <= 200\n- 0 <= matrix[i][j] <= 2^31 - 1",
      ],
      code: `int best(vector<vector<int>>& mat, vector<vector<int>>& memo, int r, int c) {
    if (memo[r][c] != 0) return memo[r][c];
    int m = mat.size(), n = mat[0].size();
    int dr[4] = {1, -1, 0, 0};
    int dc[4] = {0, 0, 1, -1};
    int longest = 1;
    for (int d = 0; d < 4; d++) {
        int nr = r + dr[d], nc = c + dc[d];
        if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
        if (mat[nr][nc] <= mat[r][c]) continue;
        longest = max(longest, 1 + best(mat, memo, nr, nc));
    }
    memo[r][c] = longest;
    return longest;
}

int longestIncreasingPath(vector<vector<int>>& matrix) {
    int m = matrix.size(), n = matrix[0].size();
    vector<vector<int>> memo(m, vector<int>(n, 0));
    int ans = 0;
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            ans = max(ans, best(matrix, memo, i, j));
        }
    }
    return ans;
}`,
      explanation: [
        "Keeping only strictly increasing moves turns the grid into a DAG - values along any path strictly increase, so no cell can repeat and no visited array is needed.",
        "Acyclicity is exactly what makes memoisation valid: the longest increasing path starting at a cell depends only on strictly larger cells, so once computed it never changes and each cell is solved once.",
        "Without the memo the recursion is exponential. Time: O(m * n) with each cell expanding four edges. Space: O(m * n).",
      ],
    },
    {
      name: "Sum of Distances in Tree",
      difficulty: "Hard",
      variation: "Two-pass DFS rerooting (post-order then pre-order)",
      link: "https://leetcode.com/problems/sum-of-distances-in-tree/",
      question: [
        "There is an undirected connected tree with n nodes labelled 0 to n-1 and n-1 edges. Given the integer n and the array edges, return an array answer of length n where answer[i] is the sum of the distances between node i and all other nodes.",
        "Example 1:\nInput: n = 6, edges = [[0,1],[0,2],[2,3],[2,4],[2,5]]\nOutput: [8,12,6,10,10,10]",
        "Example 2:\nInput: n = 1, edges = []\nOutput: [0]",
        "Constraints:\n- 1 <= n <= 3 * 10^4\n- edges.length == n - 1\n- The given input represents a valid tree",
      ],
      code: `void down(vector<vector<int>>& adj, vector<int>& cnt, vector<int>& res,
          int u, int parent) {
    for (int v : adj[u]) {
        if (v == parent) continue;
        down(adj, cnt, res, v, u);
        cnt[u] += cnt[v];
        res[u] += res[v] + cnt[v];
    }
}

void up(vector<vector<int>>& adj, vector<int>& cnt, vector<int>& res,
        int u, int parent, int n) {
    for (int v : adj[u]) {
        if (v == parent) continue;
        res[v] = res[u] - cnt[v] + (n - cnt[v]);
        up(adj, cnt, res, v, u, n);
    }
}

vector<int> sumOfDistancesInTree(int n, vector<vector<int>>& edges) {
    vector<vector<int>> adj(n);
    for (auto& e : edges) {
        adj[e[0]].push_back(e[1]);
        adj[e[1]].push_back(e[0]);
    }
    vector<int> cnt(n, 1), res(n, 0);
    down(adj, cnt, res, 0, -1);
    up(adj, cnt, res, 0, -1, n);
    return res;
}`,
      explanation: [
        "The post-order pass roots the tree at 0 and computes, for every node, its subtree size cnt[u] and the sum of distances to its own subtree: each child contributes res[v] plus one extra edge for each of its cnt[v] nodes.",
        "The pre-order pass reroots the answer along each edge. Moving the root from u to v brings the cnt[v] nodes of v's subtree one step closer and pushes the other n - cnt[v] nodes one step further, which is exactly res[v] = res[u] - cnt[v] + (n - cnt[v]).",
        "Running the shift downward guarantees res[u] is already the true global answer when v is processed. Time: O(n). Space: O(n), with recursion depth up to n on a path-shaped tree.",
      ],
    },
  ],
};
