import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Nearest Facility on a Grid",
      difficulty: "Easy",
      variation: "Multi-source BFS, template",
      question: [
        "You are given an m x n grid where 0 is an open cell, 1 is a blocked cell and 2 is a facility. For every cell, compute the number of moves (up, down, left, right, through open cells only) to the nearest facility. Return a matrix dist where dist[r][c] is that number, 0 for facility cells, and -1 for blocked or unreachable cells.",
        "Example 1:\nInput: grid = [[2,0,0],[0,1,0],[0,0,2]]\nOutput: [[0,1,2],[1,-1,1],[2,1,0]]",
        "Constraints:\n- 1 <= m, n <= 1000\n- grid[r][c] is 0, 1 or 2\n- There is at least one facility",
      ],
      code: `vector<vector<int>> nearestFacility(vector<vector<int>>& grid) {
    int m = grid.size(), n = grid[0].size();
    vector<vector<int>> dist(m, vector<int>(n, -1));
    queue<pair<int,int>> q;
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            if (grid[r][c] == 2) {
                dist[r][c] = 0;
                q.push({r, c});
            }
        }
    }
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    while (!q.empty()) {
        auto [r, c] = q.front(); q.pop();
        for (int k = 0; k < 4; k++) {
            int nr = r + dr[k], nc = c + dc[k];
            if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
            if (grid[nr][nc] == 1 || dist[nr][nc] != -1) continue;
            dist[nr][nc] = dist[r][c] + 1;
            q.push({nr, nc});
        }
    }
    return dist;
}`,
      explanation: [
        "Instead of running one BFS per facility, seed the queue with every facility at distance 0 before the loop starts. This is exactly a BFS from a virtual super-source joined to all facilities by zero-weight edges.",
        "The frontier stays sorted because all seeds share distance 0 and every edge costs 1, so the queue holds at most two distinct distance values at any moment. The first time a cell is dequeued its distance is therefore the minimum over all facilities, and marking on enqueue prevents any cell being processed twice.",
        "The whole grid is swept once regardless of how many facilities there are - the cost does not multiply by the number of sources.",
        "Time: O(m * n). Space: O(m * n).",
      ],
    },
    {
      name: "Walls and Gates",
      difficulty: "Easy",
      variation: "Multi-source BFS, in-place fill",
      question: [
        "You are given an m x n grid rooms where -1 is a wall, 0 is a gate, and INT_MAX (2147483647) is an empty room. Fill each empty room with the distance to its nearest gate, measured in four-directional moves through empty rooms. If it is impossible to reach a gate, leave the value as INT_MAX. Modify the grid in place.",
        "Example 1:\nInput: rooms = [[2147483647,-1,0,2147483647],[2147483647,2147483647,2147483647,-1],[2147483647,-1,2147483647,-1],[0,-1,2147483647,2147483647]]\nOutput: [[3,-1,0,1],[2,2,1,-1],[1,-1,2,-1],[0,-1,3,4]]",
        "Constraints:\n- 1 <= m, n <= 250\n- rooms[r][c] is -1, 0, or 2147483647",
      ],
      code: `void wallsAndGates(vector<vector<int>>& rooms) {
    const int EMPTY = 2147483647;
    int m = rooms.size(), n = rooms[0].size();
    queue<pair<int,int>> q;
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            if (rooms[r][c] == 0) q.push({r, c});
        }
    }
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    while (!q.empty()) {
        auto [r, c] = q.front(); q.pop();
        for (int k = 0; k < 4; k++) {
            int nr = r + dr[k], nc = c + dc[k];
            if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
            if (rooms[nr][nc] != EMPTY) continue;
            rooms[nr][nc] = rooms[r][c] + 1;
            q.push({nr, nc});
        }
    }
}`,
      explanation: [
        "The naive approach is a BFS from every empty room searching for a gate, which costs O((m*n)^2). Reversing the direction - one multi-source BFS outward from all gates - solves every room in a single sweep.",
        "The grid doubles as the visited set: a cell still holding INT_MAX has not been reached, and any other value means it is a wall, a gate, or already assigned its final minimum distance. Unreachable rooms simply keep INT_MAX.",
        "Time: O(m * n). Space: O(m * n) for the queue in the worst case.",
      ],
    },
    {
      name: "01 Matrix",
      difficulty: "Medium",
      variation: "Multi-source BFS, distance to nearest zero",
      link: "https://leetcode.com/problems/01-matrix/",
      question: [
        "Given an m x n binary matrix mat, return the distance of the nearest 0 for each cell, where the distance between two adjacent cells is 1 (four-directional movement).",
        "Example 1:\nInput: mat = [[0,0,0],[0,1,0],[0,0,0]]\nOutput: [[0,0,0],[0,1,0],[0,0,0]]",
        "Example 2:\nInput: mat = [[0,0,0],[0,1,0],[1,1,1]]\nOutput: [[0,0,0],[0,1,0],[1,2,1]]",
        "Constraints:\n- 1 <= m, n <= 10^4\n- 1 <= m * n <= 10^4\n- mat[i][j] is either 0 or 1\n- There is at least one 0 in mat",
      ],
      code: `vector<vector<int>> updateMatrix(vector<vector<int>>& mat) {
    int m = mat.size(), n = mat[0].size();
    vector<vector<int>> dist(m, vector<int>(n, -1));
    queue<pair<int,int>> q;
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            if (mat[r][c] == 0) {
                dist[r][c] = 0;
                q.push({r, c});
            }
        }
    }
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    while (!q.empty()) {
        auto [r, c] = q.front(); q.pop();
        for (int k = 0; k < 4; k++) {
            int nr = r + dr[k], nc = c + dc[k];
            if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
            if (dist[nr][nc] != -1) continue;
            dist[nr][nc] = dist[r][c] + 1;
            q.push({nr, nc});
        }
    }
    return dist;
}`,
      explanation: [
        "This is the canonical multi-source BFS. Push every zero cell at distance 0, then expand outward; each one cell learns its distance from whichever zero reaches it first, which is by construction the nearest one.",
        "The separate dist matrix initialised to -1 serves as the visited marker, so no cell is relaxed twice and the queue processes each cell exactly once.",
        "Time: O(m * n). Space: O(m * n).",
      ],
    },
    {
      name: "Rotting Oranges",
      difficulty: "Medium",
      variation: "Multi-source BFS, level-by-level timing",
      link: "https://leetcode.com/problems/rotting-oranges/",
      question: [
        "You are given an m x n grid where each cell is 0 (empty), 1 (a fresh orange) or 2 (a rotten orange). Every minute, any fresh orange four-directionally adjacent to a rotten orange becomes rotten. Return the minimum number of minutes until no cell has a fresh orange, or -1 if that is impossible.",
        "Example 1:\nInput: grid = [[2,1,1],[1,1,0],[0,1,1]]\nOutput: 4",
        "Example 2:\nInput: grid = [[2,1,1],[0,1,1],[1,0,1]]\nOutput: -1\nExplanation: The orange in the bottom-left corner is never reached.",
        "Constraints:\n- 1 <= m, n <= 10\n- grid[i][j] is 0, 1 or 2",
      ],
      code: `int orangesRotting(vector<vector<int>>& grid) {
    int m = grid.size(), n = grid[0].size();
    queue<pair<int,int>> q;
    int fresh = 0;
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            if (grid[r][c] == 2) q.push({r, c});
            else if (grid[r][c] == 1) fresh++;
        }
    }
    if (fresh == 0) return 0;
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    int minutes = 0;
    while (!q.empty()) {
        int sz = q.size();
        bool rotted = false;
        for (int i = 0; i < sz; i++) {
            auto [r, c] = q.front(); q.pop();
            for (int k = 0; k < 4; k++) {
                int nr = r + dr[k], nc = c + dc[k];
                if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
                if (grid[nr][nc] != 1) continue;
                grid[nr][nc] = 2;
                fresh--;
                rotted = true;
                q.push({nr, nc});
            }
        }
        if (rotted) minutes++;
    }
    return fresh == 0 ? minutes : -1;
}`,
      explanation: [
        "Rot spreads from all rotten oranges simultaneously, which is precisely multi-source BFS. Seeding every 2 into the queue makes one minute of real time equal one BFS level.",
        "Levels are separated by recording the queue size at the top of each iteration and draining exactly that many cells, so the counter increments once per minute rather than once per orange. The rotted flag stops the counter from over-counting the final level, which enqueues nothing.",
        "Tracking the number of fresh oranges gives the impossibility test for free: any left over at the end were unreachable, so return -1. The empty-grid case is handled up front, since zero fresh oranges means zero minutes.",
        "Time: O(m * n). Space: O(m * n).",
      ],
    },
    {
      name: "Map of Highest Peak",
      difficulty: "Medium",
      variation: "Multi-source BFS, constructive assignment",
      link: "https://leetcode.com/problems/map-of-highest-peak/",
      question: [
        "You are given an m x n matrix isWater where 1 marks a water cell and 0 a land cell. Assign each cell a non-negative height so that every water cell has height 0 and any two adjacent cells (four-directionally) differ in height by at most 1. Return a height matrix that maximises the highest peak; any valid answer maximising it is accepted.",
        "Example 1:\nInput: isWater = [[0,1],[0,0]]\nOutput: [[1,0],[2,1]]",
        "Example 2:\nInput: isWater = [[0,0,1],[1,0,0],[0,0,0]]\nOutput: [[1,1,0],[0,1,1],[1,2,2]]",
        "Constraints:\n- 1 <= m, n <= 1000\n- isWater[i][j] is 0 or 1\n- There is at least one water cell",
      ],
      code: `vector<vector<int>> highestPeak(vector<vector<int>>& isWater) {
    int m = isWater.size(), n = isWater[0].size();
    vector<vector<int>> h(m, vector<int>(n, -1));
    queue<pair<int,int>> q;
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            if (isWater[r][c] == 1) {
                h[r][c] = 0;
                q.push({r, c});
            }
        }
    }
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    while (!q.empty()) {
        auto [r, c] = q.front(); q.pop();
        for (int k = 0; k < 4; k++) {
            int nr = r + dr[k], nc = c + dc[k];
            if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
            if (h[nr][nc] != -1) continue;
            h[nr][nc] = h[r][c] + 1;
            q.push({nr, nc});
        }
    }
    return h;
}`,
      explanation: [
        "The adjacency rule forces height(cell) <= distance to the nearest water cell, because walking from water to that cell can raise the height by at most 1 per step. Setting every height exactly equal to that BFS distance therefore hits the upper bound everywhere at once and is automatically valid.",
        "So the answer is just a multi-source BFS from all water cells - the same code as 01 Matrix with a different story around it.",
        "Time: O(m * n). Space: O(m * n).",
      ],
    },
    {
      name: "As Far from Land as Possible",
      difficulty: "Medium",
      variation: "Multi-source BFS, maximise the minimum distance",
      link: "https://leetcode.com/problems/as-far-from-land-as-possible/",
      question: [
        "Given an n x n grid containing only 0 (water) and 1 (land), find a water cell whose distance to the nearest land cell is maximised, and return that distance. Distance is Manhattan distance measured by four-directional moves. If no land or no water exists, return -1.",
        "Example 1:\nInput: grid = [[1,0,1],[0,0,0],[1,0,1]]\nOutput: 2\nExplanation: The centre cell (1, 1) is distance 2 from all land.",
        "Example 2:\nInput: grid = [[1,0,0],[0,0,0],[0,0,0]]\nOutput: 4",
        "Constraints:\n- 1 <= n <= 100\n- grid[i][j] is 0 or 1",
      ],
      code: `int maxDistance(vector<vector<int>>& grid) {
    int n = grid.size();
    vector<vector<int>> dist(n, vector<int>(n, -1));
    queue<pair<int,int>> q;
    for (int r = 0; r < n; r++) {
        for (int c = 0; c < n; c++) {
            if (grid[r][c] == 1) {
                dist[r][c] = 0;
                q.push({r, c});
            }
        }
    }
    if (q.empty() || (int)q.size() == n * n) return -1;
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    int best = 0;
    while (!q.empty()) {
        auto [r, c] = q.front(); q.pop();
        for (int k = 0; k < 4; k++) {
            int nr = r + dr[k], nc = c + dc[k];
            if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
            if (dist[nr][nc] != -1) continue;
            dist[nr][nc] = dist[r][c] + 1;
            best = max(best, dist[nr][nc]);
            q.push({nr, nc});
        }
    }
    return best;
}`,
      explanation: [
        "Compute the distance to the nearest land for every water cell with one multi-source BFS from all land, then take the maximum. Running a BFS from each water cell instead would cost O(n^4).",
        "Since BFS assigns distances in non-decreasing order, the last cell to be assigned already holds the maximum; tracking a running maximum during the sweep is just the simplest way to read it off.",
        "The two degenerate cases - an all-water grid (empty queue) and an all-land grid (queue of size n*n) - are checked before the sweep and return -1.",
        "Time: O(n^2). Space: O(n^2).",
      ],
    },
    {
      name: "Number of Enclaves",
      difficulty: "Medium",
      variation: "Multi-source BFS from the border",
      link: "https://leetcode.com/problems/number-of-enclaves/",
      question: [
        "You are given an m x n binary matrix grid where 0 is a sea cell and 1 is a land cell. A move consists of walking from one land cell to another four-directionally adjacent land cell, or walking off the boundary of the grid. Return the number of land cells from which you cannot walk off the boundary in any number of moves.",
        "Example 1:\nInput: grid = [[0,0,0,0],[1,0,1,0],[0,1,1,0],[0,0,0,0]]\nOutput: 3\nExplanation: The three land cells in the middle are enclosed; the one touching the left edge is not.",
        "Example 2:\nInput: grid = [[0,1,1,0],[0,0,1,0],[0,0,1,0],[0,0,0,0]]\nOutput: 0",
        "Constraints:\n- 1 <= m, n <= 500\n- grid[i][j] is 0 or 1",
      ],
      code: `int numEnclaves(vector<vector<int>>& grid) {
    int m = grid.size(), n = grid[0].size();
    queue<pair<int,int>> q;
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            bool border = (r == 0 || c == 0 || r == m - 1 || c == n - 1);
            if (border && grid[r][c] == 1) {
                grid[r][c] = 0;
                q.push({r, c});
            }
        }
    }
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    while (!q.empty()) {
        auto [r, c] = q.front(); q.pop();
        for (int k = 0; k < 4; k++) {
            int nr = r + dr[k], nc = c + dc[k];
            if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
            if (grid[nr][nc] != 1) continue;
            grid[nr][nc] = 0;
            q.push({nr, nc});
        }
    }
    int count = 0;
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) count += grid[r][c];
    }
    return count;
}`,
      explanation: [
        "Rather than testing each island for escape, invert the question: a land cell can walk off the grid exactly when it is connected to a border land cell. So seed a multi-source BFS with every land cell on the border and erase everything it reaches.",
        "Whatever land survives is enclosed, so the answer is simply the sum of the remaining ones. Sinking cells to 0 on enqueue doubles as the visited marker, so no extra array is needed.",
        "The same border-seeded sweep solves Surrounded Regions and Pacific Atlantic Water Flow; only the seeding rule changes.",
        "Time: O(m * n). Space: O(m * n).",
      ],
    },
    {
      name: "Shortest Path in Binary Matrix",
      difficulty: "Medium",
      variation: "Single-source BFS, eight-directional",
      link: "https://leetcode.com/problems/shortest-path-in-binary-matrix/",
      question: [
        "Given an n x n binary matrix grid, return the length of the shortest clear path from the top-left cell (0, 0) to the bottom-right cell (n-1, n-1), or -1 if there is none. A clear path visits only cells with value 0, all visited cells are eight-directionally connected, and the length is the number of visited cells.",
        "Example 1:\nInput: grid = [[0,1],[1,0]]\nOutput: 2",
        "Example 2:\nInput: grid = [[0,0,0],[1,1,0],[1,1,0]]\nOutput: 4",
        "Constraints:\n- 1 <= n <= 100\n- grid[i][j] is 0 or 1",
      ],
      code: `int shortestPathBinaryMatrix(vector<vector<int>>& grid) {
    int n = grid.size();
    if (grid[0][0] == 1 || grid[n - 1][n - 1] == 1) return -1;
    vector<vector<int>> dist(n, vector<int>(n, -1));
    queue<pair<int,int>> q;
    dist[0][0] = 1;
    q.push({0, 0});
    while (!q.empty()) {
        auto [r, c] = q.front(); q.pop();
        if (r == n - 1 && c == n - 1) return dist[r][c];
        for (int dr = -1; dr <= 1; dr++) {
            for (int dc = -1; dc <= 1; dc++) {
                if (dr == 0 && dc == 0) continue;
                int nr = r + dr, nc = c + dc;
                if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
                if (grid[nr][nc] == 1 || dist[nr][nc] != -1) continue;
                dist[nr][nc] = dist[r][c] + 1;
                q.push({nr, nc});
            }
        }
    }
    return -1;
}`,
      explanation: [
        "Every legal move costs exactly 1, so plain BFS is optimal - no heap and no deque needed. The only twist is that the neighbourhood has eight members instead of four, generated by the nested dr/dc loops with the (0, 0) case skipped.",
        "Because the path length counts cells rather than moves, the start is seeded at 1 instead of 0. Marking distances on enqueue guarantees each cell is finalised once, and popping the target returns immediately since its distance is already minimal.",
        "Both endpoints are checked up front: a blocked corner makes any path impossible, including the n = 1 case.",
        "Time: O(n^2). Space: O(n^2).",
      ],
    },
    {
      name: "Shortest Bridge",
      difficulty: "Medium",
      variation: "Flood fill to seed a multi-source BFS",
      link: "https://leetcode.com/problems/shortest-bridge/",
      question: [
        "You are given an n x n binary matrix grid containing exactly two islands, where an island is a four-directionally connected group of 1s. You may change 0s to 1s to connect the two islands. Return the smallest number of 0s you must flip.",
        "Example 1:\nInput: grid = [[0,1],[1,0]]\nOutput: 1",
        "Example 2:\nInput: grid = [[0,1,0],[0,0,0],[0,0,1]]\nOutput: 2",
        "Constraints:\n- 2 <= n <= 100\n- grid[i][j] is 0 or 1\n- There are exactly two islands in grid",
      ],
      code: `int shortestBridge(vector<vector<int>>& grid) {
    int n = grid.size();
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    queue<pair<int,int>> frontier;
    bool found = false;
    for (int r = 0; r < n && !found; r++) {
        for (int c = 0; c < n && !found; c++) {
            if (grid[r][c] != 1) continue;
            found = true;
            queue<pair<int,int>> fill;
            fill.push({r, c});
            grid[r][c] = 2;
            while (!fill.empty()) {
                auto [a, b] = fill.front(); fill.pop();
                frontier.push({a, b});
                for (int k = 0; k < 4; k++) {
                    int na = a + dr[k], nb = b + dc[k];
                    if (na < 0 || na >= n || nb < 0 || nb >= n) continue;
                    if (grid[na][nb] != 1) continue;
                    grid[na][nb] = 2;
                    fill.push({na, nb});
                }
            }
        }
    }
    int steps = 0;
    while (!frontier.empty()) {
        int sz = frontier.size();
        for (int i = 0; i < sz; i++) {
            auto [r, c] = frontier.front(); frontier.pop();
            for (int k = 0; k < 4; k++) {
                int nr = r + dr[k], nc = c + dc[k];
                if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
                if (grid[nr][nc] == 2) continue;
                if (grid[nr][nc] == 1) return steps;
                grid[nr][nc] = 2;
                frontier.push({nr, nc});
            }
        }
        steps++;
    }
    return -1;
}`,
      explanation: [
        "Two phases. First a flood fill from the first 1 encountered marks the whole of island A as 2 and collects all of its cells. Second, a multi-source BFS expands outward from every cell of island A at once, so the water is explored in rings of increasing distance from the island as a whole.",
        "Seeding with the entire island rather than a single cell is what makes the answer correct - the shortest bridge may leave from any of its cells, and a single-source BFS would measure distances from the wrong starting point.",
        "The level counter counts rings of flipped water cells, so the moment the frontier touches a 1 (island B) the current steps value is exactly the number of water cells crossed.",
        "Time: O(n^2). Space: O(n^2).",
      ],
    },
    {
      name: "Deque 0-1 BFS on a Weighted Graph",
      difficulty: "Medium",
      variation: "Deque 0-1 BFS, template",
      question: [
        "Given a directed graph with n nodes numbered 0..n-1 where every edge weight is either 0 or 1 (adjacency list adj, adj[u] holds pairs (v, w) with w in {0, 1}) and a source src, return an array dist where dist[i] is the shortest path weight from src to i, or a large sentinel if i is unreachable. Solve it without a priority queue.",
        "Example 1:\nInput: n = 4, adj = [[(1,0),(2,1)], [(3,1)], [(3,0)], []], src = 0\nOutput: [0, 0, 1, 1]\nExplanation: 0 -> 1 costs 0, 0 -> 2 -> 3 costs 1, tying with 0 -> 1 -> 3.",
        "Constraints:\n- 1 <= n <= 10^6\n- 0 <= number of edges <= 2 * 10^6\n- w is 0 or 1",
      ],
      code: `vector<int> zeroOneBfs(int n, vector<vector<pair<int,int>>>& adj, int src) {
    const int INF = 1e9;
    vector<int> dist(n, INF);
    deque<int> dq;
    dist[src] = 0;
    dq.push_back(src);
    while (!dq.empty()) {
        int u = dq.front(); dq.pop_front();
        for (auto& [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                if (w == 0) dq.push_front(v);
                else dq.push_back(v);
            }
        }
    }
    return dist;
}`,
      explanation: [
        "This is Dijkstra with the heap replaced by a deque. A relaxation across a 0-weight edge produces a node at the same distance as the one just popped, so it belongs at the front; a 1-weight edge produces distance d + 1, which belongs at the back.",
        "That placement keeps the invariant that the deque's distances are non-decreasing from front to back and span at most two values, d and d + 1. Front-popping is therefore a genuine minimum extraction, and every node is finalised the first time it is popped for the usual non-negative-weight reason.",
        "The payoff is dropping the log factor: each push and pop is O(1), so the whole run is O(V + E) instead of O(E log V). A node can be pushed more than once if a better distance is found later, but the total number of pushes stays O(E).",
        "Time: O(V + E). Space: O(V + E).",
      ],
    },
    {
      name: "Minimum Edge Reversals to Reach a Node",
      difficulty: "Medium",
      variation: "Deque 0-1 BFS on a directed graph",
      question: [
        "You are given a directed graph with n nodes numbered 1..n and a list of directed edges. You may reverse the direction of any edge at a cost of 1. Given src and dst, return the minimum number of reversals needed so that a directed path from src to dst exists, or -1 if dst is unreachable even with reversals.",
        "Example 1:\nInput: n = 4, edges = [(1,2),(3,2),(3,4)], src = 1, dst = 4\nOutput: 1\nExplanation: Reverse 3 -> 2 into 2 -> 3, giving 1 -> 2 -> 3 -> 4.",
        "Example 2:\nInput: n = 3, edges = [(1,2),(1,3)], src = 2, dst = 3\nOutput: 1",
        "Constraints:\n- 1 <= n <= 10^5\n- 0 <= edges.size() <= 2 * 10^5\n- 1 <= src, dst <= n",
      ],
      code: `int minReversals(int n, vector<pair<int,int>>& edges, int src, int dst) {
    vector<vector<pair<int,int>>> adj(n + 1);
    for (auto& e : edges) {
        adj[e.first].push_back({e.second, 0});
        adj[e.second].push_back({e.first, 1});
    }
    const int INF = 1e9;
    vector<int> dist(n + 1, INF);
    deque<int> dq;
    dist[src] = 0;
    dq.push_back(src);
    while (!dq.empty()) {
        int u = dq.front(); dq.pop_front();
        for (auto& [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                if (w == 0) dq.push_front(v);
                else dq.push_back(v);
            }
        }
    }
    return dist[dst] == INF ? -1 : dist[dst];
}`,
      explanation: [
        "Build an augmented graph: every original edge u -> v contributes a forward edge of weight 0 (walk it as given) and a backward edge v -> u of weight 1 (pay to reverse it). The answer is then the shortest path from src to dst in that graph.",
        "Only weights 0 and 1 appear, so a deque BFS is enough: free traversals jump to the front of the frontier, paid reversals go to the back, and the frontier's two-value invariant keeps front-popping equivalent to extracting the minimum.",
        "Note that the augmented graph is connected wherever the underlying undirected graph is, so -1 only happens when src and dst lie in different undirected components.",
        "Time: O(V + E). Space: O(V + E).",
      ],
    },
    {
      name: "Minimum Turns in a Grid Maze",
      difficulty: "Hard",
      variation: "Deque 0-1 BFS on state (cell, direction)",
      question: [
        "You are given an m x n grid where 0 is open and 1 is a wall, with the top-left and bottom-right cells open. You start at the top-left facing any direction of your choice. Moving one cell forward in your current facing direction is free; changing your facing direction by 90 or 180 degrees costs 1 turn. Return the minimum number of turns needed to reach the bottom-right cell, or -1 if it is unreachable.",
        "Example 1:\nInput: grid = [[0,0,0],[1,1,0],[0,0,0]]\nOutput: 2\nExplanation: Go right along the top row, turn down, then turn right along the bottom row.",
        "Example 2:\nInput: grid = [[0,0],[0,0]]\nOutput: 1",
        "Constraints:\n- 2 <= m, n <= 500\n- grid[r][c] is 0 or 1\n- grid[0][0] == 0 and grid[m-1][n-1] == 0",
      ],
      code: `int minTurns(vector<vector<int>>& grid) {
    int m = grid.size(), n = grid[0].size();
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    const int INF = 1e9;
    vector<vector<vector<int>>> dist(m, vector<vector<int>>(n, vector<int>(4, INF)));
    deque<tuple<int,int,int>> dq;
    for (int d = 0; d < 4; d++) {
        dist[0][0][d] = 0;
        dq.push_back({0, 0, d});
    }
    while (!dq.empty()) {
        auto [r, c, d] = dq.front(); dq.pop_front();
        int cur = dist[r][c][d];
        int nr = r + dr[d], nc = c + dc[d];
        if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] == 0) {
            if (cur < dist[nr][nc][d]) {
                dist[nr][nc][d] = cur;
                dq.push_front({nr, nc, d});
            }
        }
        for (int e = 0; e < 4; e++) {
            if (e == d) continue;
            if (cur + 1 < dist[r][c][e]) {
                dist[r][c][e] = cur + 1;
                dq.push_back({r, c, e});
            }
        }
    }
    int best = INF;
    for (int d = 0; d < 4; d++) best = min(best, dist[m - 1][n - 1][d]);
    return best == INF ? -1 : best;
}`,
      explanation: [
        "Position alone is not enough state: whether a move is free depends on which way you are already facing. So the node becomes the triple (row, column, facing), giving 4 * m * n states.",
        "Two kinds of transition leave a state. Advancing one cell in the current facing keeps the turn count, a weight-0 edge. Switching to any of the other three facings without moving costs one turn, a weight-1 edge. Only 0 and 1 appear, so a deque BFS applies: free advances push to the front, turns push to the back, and the frontier stays monotone in exactly two values.",
        "All four initial facings are seeded at cost 0 because the starting direction is free to choose, and the answer takes the minimum over the four facings at the destination.",
        "Time: O(m * n). Space: O(m * n).",
      ],
    },
    {
      name: "Minimum Obstacle Removal to Reach Corner",
      difficulty: "Hard",
      variation: "Deque 0-1 BFS on a grid",
      link: "https://leetcode.com/problems/minimum-obstacle-removal-to-reach-corner/",
      question: [
        "You are given a 0-indexed m x n integer matrix grid where each cell is 0 (empty, you can move through it) or 1 (an obstacle that can be removed). You start at the top-left cell and want to reach the bottom-right cell, moving four-directionally. Return the minimum number of obstacles to remove so that a path exists.",
        "Example 1:\nInput: grid = [[0,1,1],[1,1,0],[1,1,0]]\nOutput: 2\nExplanation: Remove the obstacles at (0,1) and (0,2), then go right, right, down, down.",
        "Example 2:\nInput: grid = [[0,1,0,0,0],[0,1,0,1,0],[0,0,0,1,0]]\nOutput: 0",
        "Constraints:\n- 1 <= m, n <= 10^5\n- 2 <= m * n <= 10^5\n- grid[i][j] is 0 or 1\n- grid[0][0] == grid[m-1][n-1] == 0",
      ],
      code: `int minimumObstacles(vector<vector<int>>& grid) {
    int m = grid.size(), n = grid[0].size();
    const int INF = 1e9;
    vector<vector<int>> dist(m, vector<int>(n, INF));
    deque<pair<int,int>> dq;
    dist[0][0] = grid[0][0];
    dq.push_back({0, 0});
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    while (!dq.empty()) {
        auto [r, c] = dq.front(); dq.pop_front();
        for (int k = 0; k < 4; k++) {
            int nr = r + dr[k], nc = c + dc[k];
            if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
            int w = grid[nr][nc];
            if (dist[r][c] + w < dist[nr][nc]) {
                dist[nr][nc] = dist[r][c] + w;
                if (w == 0) dq.push_front({nr, nc});
                else dq.push_back({nr, nc});
            }
        }
    }
    return dist[m - 1][n - 1];
}`,
      explanation: [
        "Give each move a cost equal to the value of the cell being entered: 0 for an empty cell, 1 for an obstacle that must be removed. The answer is the shortest path in that grid, and the weights are exactly 0 and 1.",
        "So a deque replaces the heap. Stepping into an empty cell keeps the cost, so that neighbour goes on the front; stepping into an obstacle raises it by one, so that neighbour goes on the back. The frontier holds at most the two values d and d + 1 in order, which is why front-popping still yields the global minimum and each cell is settled correctly on its first pop.",
        "The grid may be a very thin 10^5 x 1 strip, so the code must not assume a square shape - m and n are read independently and the returned cell is (m-1, n-1).",
        "Time: O(m * n). Space: O(m * n).",
      ],
    },
    {
      name: "Minimum Cost to Make at Least One Valid Path in a Grid",
      difficulty: "Hard",
      variation: "Deque 0-1 BFS, canonical form",
      link: "https://leetcode.com/problems/minimum-cost-to-make-at-least-one-valid-path-in-a-grid/",
      question: [
        "Given an m x n grid where grid[r][c] is a sign pointing to the next cell you should visit (1 = right, 2 = left, 3 = down, 4 = up), you start at (0, 0) and must reach (m-1, n-1). You may change the sign of any cell at a cost of 1, and each cell's sign may be changed at most once. Return the minimum total cost to make at least one valid path from the top-left to the bottom-right cell.",
        "Example 1:\nInput: grid = [[1,1,1,1],[2,2,2,2],[1,1,1,1],[2,2,2,2]]\nOutput: 3\nExplanation: Change the sign at the end of each row to point down, three times.",
        "Example 2:\nInput: grid = [[1,1,3],[3,2,2],[1,1,4]]\nOutput: 0",
        "Constraints:\n- 1 <= m, n <= 100\n- 1 <= grid[r][c] <= 4",
      ],
      code: `int minCost(vector<vector<int>>& grid) {
    int m = grid.size(), n = grid[0].size();
    int dr[5] = {0, 0, 0, 1, -1}, dc[5] = {0, 1, -1, 0, 0};
    const int INF = 1e9;
    vector<vector<int>> dist(m, vector<int>(n, INF));
    deque<pair<int,int>> dq;
    dist[0][0] = 0;
    dq.push_back({0, 0});
    while (!dq.empty()) {
        auto [r, c] = dq.front(); dq.pop_front();
        for (int d = 1; d <= 4; d++) {
            int nr = r + dr[d], nc = c + dc[d];
            if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
            int w = (grid[r][c] == d) ? 0 : 1;
            if (dist[r][c] + w < dist[nr][nc]) {
                dist[nr][nc] = dist[r][c] + w;
                if (w == 0) dq.push_front({nr, nc});
                else dq.push_back({nr, nc});
            }
        }
    }
    return dist[m - 1][n - 1];
}`,
      explanation: [
        "This is the textbook 0-1 BFS problem. Each cell has four outgoing edges, one per direction; following the sign already printed there costs 0, and each of the other three costs 1 because the sign has to be rewritten. Note the cost depends on the cell you leave, not the one you enter.",
        "Indexing the direction offsets from 1 to 4 makes the sign value double as the direction index, so the weight test collapses to grid[r][c] == d.",
        "The deque keeps the frontier monotone: pushing zero-cost neighbours to the front and unit-cost ones to the back means the deque only ever holds distances d and d + 1 in sorted order, so popping the front is a true minimum extraction and each cell settles on its first pop. Plain BFS would be wrong here because moves have different costs, and a min-heap would work but pay an unnecessary log factor.",
        "The at-most-one-change-per-cell rule needs no bookkeeping: an optimal shortest path leaves each cell at most once, so no cell's sign is ever rewritten twice.",
        "Time: O(m * n). Space: O(m * n).",
      ],
    },
    {
      name: "Monsters",
      difficulty: "Hard",
      variation: "Two multi-source BFS passes with path reconstruction",
      link: "https://cses.fi/problemset/task/1194",
      question: [
        "You and some monsters are in a labyrinth given as an n x m grid of characters: '#' is a wall, '.' is floor, 'A' is you, and 'M' is a monster. Each turn you and all monsters move one step to an adjacent floor square, or stay put. Your goal is to reach a boundary square and escape. Print YES followed by the number of moves and a string of characters U, D, L, R describing a route that escapes without ever sharing a square with a monster, or NO if no such route exists.",
        "Example 1:\nInput:\n5 8\n########\n#M..A..#\n#.#.M#.#\n#M#..#..\n#.######\nOutput:\nYES\n5\nRRDDR",
        "Constraints:\n- 1 <= n, m <= 1000\n- Every character is '#', '.', 'A' or 'M'\n- There is exactly one 'A'",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<string> g(n);
    for (int i = 0; i < n; i++) cin >> g[i];
    const int INF = 1e9;
    vector<vector<int>> md(n, vector<int>(m, INF)), pd(n, vector<int>(m, INF));
    vector<vector<pair<int,int>>> par(n, vector<pair<int,int>>(m, {-1, -1}));
    int dr[4] = {-1, 1, 0, 0}, dc[4] = {0, 0, -1, 1};
    string dch = "UDLR";
    queue<pair<int,int>> q;
    int sr = -1, sc = -1;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) {
            if (g[i][j] == 'M') {
                md[i][j] = 0;
                q.push({i, j});
            } else if (g[i][j] == 'A') {
                sr = i;
                sc = j;
            }
        }
    }
    while (!q.empty()) {
        auto [r, c] = q.front(); q.pop();
        for (int k = 0; k < 4; k++) {
            int nr = r + dr[k], nc = c + dc[k];
            if (nr < 0 || nr >= n || nc < 0 || nc >= m) continue;
            if (g[nr][nc] == '#' || md[nr][nc] != INF) continue;
            md[nr][nc] = md[r][c] + 1;
            q.push({nr, nc});
        }
    }
    pd[sr][sc] = 0;
    q.push({sr, sc});
    int er = -1, ec = -1;
    while (!q.empty()) {
        auto [r, c] = q.front(); q.pop();
        if (r == 0 || c == 0 || r == n - 1 || c == m - 1) {
            er = r;
            ec = c;
            break;
        }
        for (int k = 0; k < 4; k++) {
            int nr = r + dr[k], nc = c + dc[k];
            if (nr < 0 || nr >= n || nc < 0 || nc >= m) continue;
            if (g[nr][nc] == '#' || pd[nr][nc] != INF) continue;
            if (md[nr][nc] <= pd[r][c] + 1) continue;
            pd[nr][nc] = pd[r][c] + 1;
            par[nr][nc] = {r, c};
            q.push({nr, nc});
        }
    }
    if (er == -1) {
        cout << "NO\\n";
        return 0;
    }
    string path;
    int r = er, c = ec;
    while (!(r == sr && c == sc)) {
        auto [pr, pc] = par[r][c];
        for (int k = 0; k < 4; k++) {
            if (pr + dr[k] == r && pc + dc[k] == c) {
                path += dch[k];
                break;
            }
        }
        r = pr;
        c = pc;
    }
    reverse(path.begin(), path.end());
    cout << "YES\\n" << path.size() << "\\n" << path << "\\n";
    return 0;
}`,
      explanation: [
        "First pass: a multi-source BFS seeded with every monster gives md[r][c], the earliest turn any monster can occupy that square. Because monsters move optimally and simultaneously, this single sweep captures all of them at once - one BFS per monster would be far too slow at 10^6 cells.",
        "Second pass: an ordinary BFS from 'A' computing pd, your arrival turn, but only entering a square when pd < md there (written as md[nr][nc] <= pd + 1 being rejected). A square a monster can reach no later than you is fatal, and since both distances are shortest-path values this local test is enough - a monster that could cut you off later would already be closer to some square on your route.",
        "Your BFS explores turns in increasing order, so the first boundary square it dequeues is reached in the fewest moves; the search stops there. Parent pointers stored during relaxation are then walked backwards and the direction characters reversed to print the route. If 'A' already sits on the boundary the path is empty and the answer is 0 moves.",
        "Time: O(n * m). Space: O(n * m).",
      ],
    },
  ],
};
