import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Flood Fill",
      difficulty: "Easy",
      variation: "Grid BFS, recolour one component",
      link: "https://leetcode.com/problems/flood-fill/",
      question: [
        "You are given an m x n image where image[i][j] is the pixel value, plus a starting pixel (sr, sc) and an integer color. Perform a flood fill: starting from the pixel (sr, sc), recolour it and every pixel connected to it 4-directionally that shares its original value. Return the modified image.",
        "Example 1:\nInput: image = [[1,1,1],[1,1,0],[1,0,1]], sr = 1, sc = 1, color = 2\nOutput: [[2,2,2],[2,2,0],[2,0,1]]\nExplanation: The bottom-right 1 is not connected to the starting pixel through same-valued pixels.",
        "Example 2:\nInput: image = [[0,0,0],[0,0,0]], sr = 0, sc = 0, color = 0\nOutput: [[0,0,0],[0,0,0]]\nExplanation: The starting pixel already has the target colour, so nothing changes.",
        "Constraints:\n- m == image.length, n == image[i].length\n- 1 <= m, n <= 50\n- 0 <= image[i][j], color < 2^16",
      ],
      code: `vector<vector<int>> floodFill(vector<vector<int>>& image, int sr, int sc, int color) {
    int original = image[sr][sc];
    if (original == color) return image;
    int m = image.size();
    int n = image[0].size();
    int dr[4] = {-1, 1, 0, 0};
    int dc[4] = {0, 0, -1, 1};
    queue<pair<int, int>> q;
    image[sr][sc] = color;
    q.push(make_pair(sr, sc));
    while (!q.empty()) {
        int r = q.front().first;
        int c = q.front().second;
        q.pop();
        for (int k = 0; k < 4; k++) {
            int nr = r + dr[k];
            int nc = c + dc[k];
            if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
            if (image[nr][nc] != original) continue;
            image[nr][nc] = color;
            q.push(make_pair(nr, nc));
        }
    }
    return image;
}`,
      explanation: [
        "A grid is an implicit graph: each cell is a vertex with edges to its four neighbours of the same original value. Flood fill is just a traversal of the component containing the start cell.",
        "Recolouring a cell at the moment it is pushed doubles as the visited mark, so no separate visited array is needed and no cell is queued twice. The early return when original equals color is essential - without it the recolour would never change anything, so the visited mark would never take effect and the queue would loop forever.",
        "Time: O(m * n). Space: O(m * n) for the queue in the worst case.",
      ],
    },
    {
      name: "Island Perimeter",
      difficulty: "Easy",
      variation: "Per-cell edge counting, no traversal",
      link: "https://leetcode.com/problems/island-perimeter/",
      question: [
        "You are given a grid where grid[i][j] is 1 for land and 0 for water. Cells are connected 4-directionally, and the grid contains exactly one island with no lakes inside it. Return the perimeter of the island.",
        "Example 1:\nInput: grid = [[0,1,0,0],[1,1,1,0],[0,1,0,0],[1,1,0,0]]\nOutput: 16",
        "Example 2:\nInput: grid = [[1]]\nOutput: 4",
        "Constraints:\n- row == grid.length, col == grid[i].length\n- 1 <= row, col <= 100\n- grid[i][j] is 0 or 1\n- There is exactly one island",
      ],
      code: `int islandPerimeter(vector<vector<int>>& grid) {
    int m = grid.size();
    int n = grid[0].size();
    int perimeter = 0;
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            if (grid[r][c] != 1) continue;
            perimeter += 4;
            if (r > 0 && grid[r - 1][c] == 1) perimeter -= 2;
            if (c > 0 && grid[r][c - 1] == 1) perimeter -= 2;
        }
    }
    return perimeter;
}`,
      explanation: [
        "Every land cell contributes 4 unit sides on its own. Each pair of adjacent land cells hides one side on both cells, so it removes 2 from the total.",
        "Only the up and left neighbours are checked, which visits each adjacent pair exactly once and avoids double counting. Because the island is a single connected component with no holes, no traversal is required at all - the perimeter is a purely local sum.",
        "Time: O(m * n). Space: O(1).",
      ],
    },
    {
      name: "Number of Provinces",
      difficulty: "Medium",
      variation: "Adjacency-matrix DFS component count",
      link: "https://leetcode.com/problems/number-of-provinces/",
      question: [
        "There are n cities. Some are connected directly, and if a is connected to b and b to c, then a and c are connected indirectly. A province is a group of directly or indirectly connected cities with no other cities outside the group. You are given an n x n matrix isConnected where isConnected[i][j] = 1 means cities i and j are directly connected. Return the total number of provinces.",
        "Example 1:\nInput: isConnected = [[1,1,0],[1,1,0],[0,0,1]]\nOutput: 2",
        "Example 2:\nInput: isConnected = [[1,0,0],[0,1,0],[0,0,1]]\nOutput: 3",
        "Constraints:\n- 1 <= n <= 200\n- n == isConnected.length == isConnected[i].length\n- isConnected[i][j] is 1 or 0, isConnected[i][i] == 1, isConnected[i][j] == isConnected[j][i]",
      ],
      code: `int findCircleNum(vector<vector<int>>& isConnected) {
    int n = isConnected.size();
    vector<int> visited(n, 0);
    int provinces = 0;
    for (int s = 0; s < n; s++) {
        if (visited[s]) continue;
        provinces++;
        vector<int> stk;
        stk.push_back(s);
        visited[s] = 1;
        while (!stk.empty()) {
            int u = stk.back();
            stk.pop_back();
            for (int v = 0; v < n; v++) {
                if (isConnected[u][v] == 1 && !visited[v]) {
                    visited[v] = 1;
                    stk.push_back(v);
                }
            }
        }
    }
    return provinces;
}`,
      explanation: [
        "This is the definition of counting connected components. Loop over all vertices; every time an unvisited vertex is found, increment the counter and exhaust its whole component with one traversal.",
        "Correctness follows from the fact that a traversal started at s reaches exactly the vertices in s's component, so each component is counted once - at its first-encountered vertex - and never again.",
        "The graph is given as a matrix, so each expansion scans a full row. Time: O(n^2). Space: O(n).",
      ],
    },
    {
      name: "Number of Islands",
      difficulty: "Medium",
      variation: "Grid BFS component count",
      link: "https://leetcode.com/problems/number-of-islands/",
      question: [
        "Given an m x n 2D binary grid where '1' is land and '0' is water, return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are surrounded by water.",
        "Example 1:\nInput: grid = [['1','1','1','1','0'],['1','1','0','1','0'],['1','1','0','0','0'],['0','0','0','0','0']]\nOutput: 1",
        "Example 2:\nInput: grid = [['1','1','0','0','0'],['1','1','0','0','0'],['0','0','1','0','0'],['0','0','0','1','1']]\nOutput: 3",
        "Constraints:\n- m == grid.length, n == grid[i].length\n- 1 <= m, n <= 300\n- grid[i][j] is '0' or '1'",
      ],
      code: `int numIslands(vector<vector<char>>& grid) {
    int m = grid.size();
    int n = grid[0].size();
    int dr[4] = {-1, 1, 0, 0};
    int dc[4] = {0, 0, -1, 1};
    int islands = 0;
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            if (grid[i][j] != '1') continue;
            islands++;
            queue<pair<int, int>> q;
            grid[i][j] = '0';
            q.push(make_pair(i, j));
            while (!q.empty()) {
                int r = q.front().first;
                int c = q.front().second;
                q.pop();
                for (int k = 0; k < 4; k++) {
                    int nr = r + dr[k];
                    int nc = c + dc[k];
                    if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
                    if (grid[nr][nc] != '1') continue;
                    grid[nr][nc] = '0';
                    q.push(make_pair(nr, nc));
                }
            }
        }
    }
    return islands;
}`,
      explanation: [
        "Scan the grid; each time an unsunk land cell is found it must belong to a new island, so increment the count and flood the whole island to water.",
        "Sinking cells as they are enqueued is the visited mark. Because a cell is turned to '0' before it is ever revisited, every land cell is processed once and the island that consumed it can never be counted again.",
        "Time: O(m * n). Space: O(min(m, n) * something) in practice, O(m * n) worst case for the queue.",
      ],
    },
    {
      name: "Max Area of Island",
      difficulty: "Medium",
      variation: "Grid DFS returning component size",
      link: "https://leetcode.com/problems/max-area-of-island/",
      question: [
        "You are given an m x n binary matrix grid where 1 represents land and 0 represents water. The area of an island is the number of cells with value 1 in that island. Return the maximum area of an island in grid, or 0 if there is no island.",
        "Example 1:\nInput: grid = [[0,0,1,0,0],[0,0,0,0,0],[0,1,1,0,0],[0,1,1,0,0]]\nOutput: 4",
        "Example 2:\nInput: grid = [[0,0,0,0,0]]\nOutput: 0",
        "Constraints:\n- m == grid.length, n == grid[i].length\n- 1 <= m, n <= 50\n- grid[i][j] is 0 or 1",
      ],
      code: `int maxAreaOfIsland(vector<vector<int>>& grid) {
    int m = grid.size();
    int n = grid[0].size();
    function<int(int, int)> dfs = [&](int r, int c) -> int {
        if (r < 0 || r >= m || c < 0 || c >= n) return 0;
        if (grid[r][c] != 1) return 0;
        grid[r][c] = 0;
        int size = 1;
        size += dfs(r - 1, c);
        size += dfs(r + 1, c);
        size += dfs(r, c - 1);
        size += dfs(r, c + 1);
        return size;
    };
    int best = 0;
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            if (grid[r][c] == 1) best = max(best, dfs(r, c));
        }
    }
    return best;
}`,
      explanation: [
        "The DFS returns the size of the component it explores: one for the current cell plus the sizes returned by the four recursive calls.",
        "Marking the cell as water before recursing guarantees each land cell contributes exactly one to exactly one island's total, so the returned sizes are exact and never overlap between islands.",
        "Time: O(m * n). Space: O(m * n) recursion depth in the worst case.",
      ],
    },
    {
      name: "Count Connected Components in an Undirected Graph",
      difficulty: "Medium",
      variation: "Union-Find component count",
      link: "https://www.geeksforgeeks.org/connected-components-in-an-undirected-graph/",
      question: [
        "Given n vertices labeled 0 to n-1 and a list of undirected edges, return the number of connected components in the graph.",
        "Example 1:\nInput: n = 5, edges = [[0,1],[1,2],[3,4]]\nOutput: 2",
        "Example 2:\nInput: n = 4, edges = []\nOutput: 4\nExplanation: With no edges, each vertex is its own component.",
        "Constraints:\n- 1 <= n <= 10^5\n- 0 <= edges.length <= 2 * 10^5\n- Edges are undirected; duplicates are allowed",
      ],
      code: `int countComponents(int n, vector<vector<int>>& edges) {
    vector<int> parent(n);
    vector<int> rnk(n, 0);
    for (int i = 0; i < n; i++) parent[i] = i;
    function<int(int)> find = [&](int x) -> int {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    };
    int components = n;
    for (auto& e : edges) {
        int a = find(e[0]);
        int b = find(e[1]);
        if (a == b) continue;
        if (rnk[a] < rnk[b]) swap(a, b);
        parent[b] = a;
        if (rnk[a] == rnk[b]) rnk[a]++;
        components--;
    }
    return components;
}`,
      explanation: [
        "Start with n singleton components. Each edge that joins two different components reduces the count by one; an edge inside a single component changes nothing.",
        "This is exact because union-by-rank with path halving maintains the invariant that two vertices share a representative if and only if some sequence of processed edges connects them. Duplicate and redundant edges are absorbed harmlessly.",
        "Time: O(n + E) with near-constant amortized operations. Space: O(n).",
      ],
    },
    {
      name: "Counting Rooms (CSES 1192)",
      difficulty: "Medium",
      variation: "Grid flood fill on characters",
      link: "https://cses.fi/problemset/task/1192",
      question: [
        "You are given a map of a building with n rows and m columns, where each square is either floor ('.') or wall ('#'). Two floor squares belong to the same room if they are adjacent horizontally or vertically. Count the number of rooms.",
        "Example 1:\nInput:\n5 8\n########\n#..#...#\n####.#.#\n#..#...#\n########\nOutput:\n3",
        "Constraints:\n- 1 <= n, m <= 1000\n- Each square is '.' or '#'",
      ],
      code: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<string> g(n);
    for (int i = 0; i < n; i++) cin >> g[i];
    int dr[4] = {-1, 1, 0, 0};
    int dc[4] = {0, 0, -1, 1};
    int rooms = 0;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) {
            if (g[i][j] != '.') continue;
            rooms++;
            queue<pair<int, int>> q;
            g[i][j] = '#';
            q.push(make_pair(i, j));
            while (!q.empty()) {
                int r = q.front().first;
                int c = q.front().second;
                q.pop();
                for (int k = 0; k < 4; k++) {
                    int nr = r + dr[k];
                    int nc = c + dc[k];
                    if (nr < 0 || nr >= n || nc < 0 || nc >= m) continue;
                    if (g[nr][nc] != '.') continue;
                    g[nr][nc] = '#';
                    q.push(make_pair(nr, nc));
                }
            }
        }
    }
    cout << rooms << endl;
    return 0;
}`,
      explanation: [
        "Identical to Number of Islands with walls playing the role of water. Each unvisited floor square starts a new room, and one BFS consumes the entire room.",
        "Overwriting visited floor squares with '#' avoids a separate visited grid, which matters at the 1000 x 1000 upper bound. BFS rather than recursive DFS also avoids a one-million-deep recursion stack on a fully open map.",
        "Time: O(n * m). Space: O(n * m).",
      ],
    },
    {
      name: "Building Roads (CSES 1666)",
      difficulty: "Medium",
      variation: "Union-Find, connect components into one",
      link: "https://cses.fi/problemset/task/1666",
      question: [
        "Byteland has n cities and m roads between them. Your task is to build new roads so that there is a route between any two cities. Print the minimum number of new roads and then, on separate lines, the pairs of cities the new roads should connect.",
        "Example 1:\nInput:\n4 2\n1 2\n3 4\nOutput:\n1\n2 3\nExplanation: Any single road joining the two components is accepted.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= m <= 2 * 10^5\n- Roads are undirected and may repeat",
      ],
      code: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<int> parent(n + 1);
    for (int i = 1; i <= n; i++) parent[i] = i;
    function<int(int)> find = [&](int x) -> int {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    };
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        int ra = find(a);
        int rb = find(b);
        if (ra != rb) parent[ra] = rb;
    }
    vector<int> reps;
    for (int i = 1; i <= n; i++) {
        if (find(i) == i) reps.push_back(i);
    }
    cout << (int)reps.size() - 1 << endl;
    for (size_t i = 1; i < reps.size(); i++) {
        cout << reps[0] << " " << reps[i] << endl;
    }
    return 0;
}`,
      explanation: [
        "Merge all existing roads with Union-Find, then collect one representative city per component. If there are c components, exactly c-1 new roads are needed and sufficient.",
        "The lower bound holds because a single new road can reduce the number of components by at most one. The construction achieves it by wiring every other representative to the first one, forming a star over the components.",
        "Time: O(n + m). Space: O(n).",
      ],
    },
    {
      name: "Surrounded Regions",
      difficulty: "Medium",
      variation: "Border-seeded flood fill (escape marking)",
      link: "https://leetcode.com/problems/surrounded-regions/",
      question: [
        "You are given an m x n matrix board containing 'X' and 'O'. Capture all regions that are 4-directionally surrounded by 'X' by flipping every 'O' in such a region to 'X'. A region is not captured if any of its cells lies on the border of the board.",
        "Example 1:\nInput: board = [['X','X','X','X'],['X','O','O','X'],['X','X','O','X'],['X','O','X','X']]\nOutput: [['X','X','X','X'],['X','X','X','X'],['X','X','X','X'],['X','O','X','X']]\nExplanation: The bottom-left 'O' touches the border, so it survives.",
        "Constraints:\n- m == board.length, n == board[i].length\n- 1 <= m, n <= 200\n- board[i][j] is 'X' or 'O'",
      ],
      code: `void solve(vector<vector<char>>& board) {
    int m = board.size();
    int n = board[0].size();
    int dr[4] = {-1, 1, 0, 0};
    int dc[4] = {0, 0, -1, 1};
    queue<pair<int, int>> q;
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            bool border = (r == 0 || r == m - 1 || c == 0 || c == n - 1);
            if (border && board[r][c] == 'O') {
                board[r][c] = 'S';
                q.push(make_pair(r, c));
            }
        }
    }
    while (!q.empty()) {
        int r = q.front().first;
        int c = q.front().second;
        q.pop();
        for (int k = 0; k < 4; k++) {
            int nr = r + dr[k];
            int nc = c + dc[k];
            if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
            if (board[nr][nc] != 'O') continue;
            board[nr][nc] = 'S';
            q.push(make_pair(nr, nc));
        }
    }
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            if (board[r][c] == 'S') board[r][c] = 'O';
            else if (board[r][c] == 'O') board[r][c] = 'X';
        }
    }
}`,
      explanation: [
        "Instead of testing each region for being surrounded, invert the problem: flood from every border 'O' and mark everything reachable as safe with a temporary letter.",
        "A region survives exactly when it contains a border cell, and connectivity is symmetric, so a region is safe if and only if some border 'O' reaches it. Every unmarked 'O' left after the flood is therefore genuinely enclosed. A final sweep restores safe cells and captures the rest.",
        "Time: O(m * n). Space: O(m * n).",
      ],
    },
    {
      name: "Number of Enclaves",
      difficulty: "Medium",
      variation: "Border-seeded flood fill, count survivors",
      link: "https://leetcode.com/problems/number-of-enclaves/",
      question: [
        "You are given an m x n binary matrix grid where 0 is a sea cell and 1 is a land cell. A move consists of walking from one land cell to another 4-directionally adjacent land cell, or walking off the boundary of the grid. Return the number of land cells from which you cannot walk off the boundary in any number of moves.",
        "Example 1:\nInput: grid = [[0,0,0,0],[1,0,1,0],[0,1,1,0],[0,0,0,0]]\nOutput: 3\nExplanation: The three land cells in the middle are enclosed; the one at row 1 column 0 touches the boundary.",
        "Example 2:\nInput: grid = [[0,1,1,0],[0,0,1,0],[0,0,1,0],[0,0,0,0]]\nOutput: 0",
        "Constraints:\n- m == grid.length, n == grid[i].length\n- 1 <= m, n <= 500\n- grid[i][j] is 0 or 1",
      ],
      code: `int numEnclaves(vector<vector<int>>& grid) {
    int m = grid.size();
    int n = grid[0].size();
    int dr[4] = {-1, 1, 0, 0};
    int dc[4] = {0, 0, -1, 1};
    queue<pair<int, int>> q;
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            bool border = (r == 0 || r == m - 1 || c == 0 || c == n - 1);
            if (border && grid[r][c] == 1) {
                grid[r][c] = 0;
                q.push(make_pair(r, c));
            }
        }
    }
    while (!q.empty()) {
        int r = q.front().first;
        int c = q.front().second;
        q.pop();
        for (int k = 0; k < 4; k++) {
            int nr = r + dr[k];
            int nc = c + dc[k];
            if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
            if (grid[nr][nc] != 1) continue;
            grid[nr][nc] = 0;
            q.push(make_pair(nr, nc));
        }
    }
    int count = 0;
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            count += grid[r][c];
        }
    }
    return count;
}`,
      explanation: [
        "Walking off the boundary is possible exactly from land components that touch the border. Flood every border land cell and sink its whole component.",
        "Whatever land remains belongs to components with no border cell, so no sequence of moves can escape from them. Counting the remaining ones gives the answer directly, without ever identifying individual components.",
        "Time: O(m * n). Space: O(m * n).",
      ],
    },
    {
      name: "Number of Closed Islands",
      difficulty: "Medium",
      variation: "Border pre-flood, then count components",
      link: "https://leetcode.com/problems/number-of-closed-islands/",
      question: [
        "Given a 2D grid consisting of 0s (land) and 1s (water), an island is a maximal 4-directionally connected group of 0s, and a closed island is an island totally surrounded by 1s. Return the number of closed islands.",
        "Example 1:\nInput: grid = [[1,1,1,1,1,1,1,0],[1,0,0,0,0,1,1,0],[1,0,1,0,1,1,1,0],[1,0,0,0,0,1,0,1],[1,1,1,1,1,1,1,0]]\nOutput: 2",
        "Example 2:\nInput: grid = [[0,0,1,0,0],[0,1,0,1,0],[0,1,1,1,0]]\nOutput: 1",
        "Constraints:\n- 1 <= grid.length, grid[0].length <= 100\n- 0 <= grid[i][j] <= 1\n- Note that 0 is land and 1 is water here",
      ],
      code: `int closedIsland(vector<vector<int>>& grid) {
    int m = grid.size();
    int n = grid[0].size();
    function<void(int, int)> fill = [&](int r, int c) {
        if (r < 0 || r >= m || c < 0 || c >= n) return;
        if (grid[r][c] != 0) return;
        grid[r][c] = 1;
        fill(r - 1, c);
        fill(r + 1, c);
        fill(r, c - 1);
        fill(r, c + 1);
    };
    for (int r = 0; r < m; r++) {
        fill(r, 0);
        fill(r, n - 1);
    }
    for (int c = 0; c < n; c++) {
        fill(0, c);
        fill(m - 1, c);
    }
    int closed = 0;
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            if (grid[r][c] == 0) {
                closed++;
                fill(r, c);
            }
        }
    }
    return closed;
}`,
      explanation: [
        "Two passes. First drown every land component that touches the border, since such an island can never be closed. Then count the components that remain - each is fully enclosed by water.",
        "This ordering is what makes the count correct: after the pre-flood, the mere existence of a land cell proves its component avoids the border, so counting components and testing closedness collapse into the same operation.",
        "Time: O(m * n). Space: O(m * n) recursion depth.",
      ],
    },
    {
      name: "Count Sub Islands",
      difficulty: "Medium",
      variation: "Component traversal with a whole-component predicate",
      link: "https://leetcode.com/problems/count-sub-islands/",
      question: [
        "You are given two m x n binary matrices grid1 and grid2 containing only 0s (water) and 1s (land). An island in grid2 is a sub-island if every cell of that island is also land in grid1 at the same position. Return the number of sub-islands in grid2.",
        "Example 1:\nInput: grid1 = [[1,1,1,0,0],[0,1,1,1,1],[0,0,0,0,0],[1,0,0,0,0],[1,1,0,1,1]], grid2 = [[1,1,1,0,0],[0,0,1,1,1],[1,0,1,1,1],[0,1,0,0,0],[1,0,1,1,0]]\nOutput: 3",
        "Constraints:\n- m == grid1.length == grid2.length\n- n == grid1[i].length == grid2[i].length\n- 1 <= m, n <= 500\n- grid1[i][j] and grid2[i][j] are 0 or 1",
      ],
      code: `int countSubIslands(vector<vector<int>>& grid1, vector<vector<int>>& grid2) {
    int m = grid2.size();
    int n = grid2[0].size();
    function<bool(int, int)> dfs = [&](int r, int c) -> bool {
        if (r < 0 || r >= m || c < 0 || c >= n) return true;
        if (grid2[r][c] != 1) return true;
        grid2[r][c] = 0;
        bool ok = (grid1[r][c] == 1);
        if (!dfs(r - 1, c)) ok = false;
        if (!dfs(r + 1, c)) ok = false;
        if (!dfs(r, c - 1)) ok = false;
        if (!dfs(r, c + 1)) ok = false;
        return ok;
    };
    int count = 0;
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            if (grid2[r][c] == 1 && dfs(r, c)) count++;
        }
    }
    return count;
}`,
      explanation: [
        "Traverse each island of grid2 exactly once and return whether every visited cell is also land in grid1. The result is the logical AND over the whole component.",
        "The subtle point is that the recursion must not short-circuit. Each of the four recursive calls is made unconditionally and the flag is only then updated, so the entire island is always sunk. Returning early on the first bad cell would leave part of the island unmarked, and that leftover would be counted again as a separate island.",
        "Time: O(m * n). Space: O(m * n) recursion depth.",
      ],
    },
    {
      name: "Find All Groups of Farmland",
      difficulty: "Medium",
      variation: "Rectangular components, corner detection",
      link: "https://leetcode.com/problems/find-all-groups-of-farmland/",
      question: [
        "You are given a 0-indexed m x n binary matrix land where 0 is forested and 1 is farmland. Groups of farmland form rectangles, and two groups are never 4-directionally adjacent. For each group, report [r1, c1, r2, c2] where (r1, c1) is its top-left corner and (r2, c2) its bottom-right corner. Return the coordinates in any order.",
        "Example 1:\nInput: land = [[1,0,0],[0,1,1],[0,1,1]]\nOutput: [[0,0,0,0],[1,1,2,2]]",
        "Example 2:\nInput: land = [[0]]\nOutput: []",
        "Constraints:\n- m == land.length, n == land[i].length\n- 1 <= m, n <= 300\n- land consists of only 0s and 1s\n- Groups of farmland are rectangular and never adjacent to each other",
      ],
      code: `vector<vector<int>> findFarmland(vector<vector<int>>& land) {
    int m = land.size();
    int n = land[0].size();
    vector<vector<int>> res;
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            if (land[r][c] != 1) continue;
            if (r > 0 && land[r - 1][c] == 1) continue;
            if (c > 0 && land[r][c - 1] == 1) continue;
            int r2 = r;
            while (r2 + 1 < m && land[r2 + 1][c] == 1) r2++;
            int c2 = c;
            while (c2 + 1 < n && land[r][c2 + 1] == 1) c2++;
            res.push_back(vector<int>{r, c, r2, c2});
        }
    }
    return res;
}`,
      explanation: [
        "The guarantee that groups are rectangles and never touch each other removes the need for a traversal. A cell is the top-left corner of a group exactly when it is farmland and has no farmland above it and none to its left.",
        "From a corner, the bottom edge is found by walking down its column and the right edge by walking right along its row - a rectangle's extent is fully determined by those two runs. Non-adjacency guarantees the runs cannot spill into a neighbouring group.",
        "Time: O(m * n) - each cell is scanned once in the outer sweep and touched at most twice more by the two runs. Space: O(1) beyond the output.",
      ],
    },
    {
      name: "Number of Distinct Islands",
      difficulty: "Medium",
      variation: "Component shape normalisation",
      question: [
        "Given a binary grid where 1 is land and 0 is water, count the number of distinct island shapes. Two islands are the same shape if one can be translated (moved up, down, left or right) to match the other exactly; rotations and reflections are not allowed.",
        "Example 1:\nInput: grid = [[1,1,0,0,0],[1,1,0,0,0],[0,0,0,1,1],[0,0,0,1,1]]\nOutput: 1\nExplanation: Both islands are 2x2 squares, so only one distinct shape.",
        "Example 2:\nInput: grid = [[1,1,0,1,1],[1,0,0,0,0],[0,0,0,0,1],[1,1,0,1,1]]\nOutput: 3",
        "Constraints:\n- 1 <= grid.length, grid[0].length <= 50\n- grid[i][j] is 0 or 1",
      ],
      code: `int countDistinctIslands(vector<vector<int>>& grid) {
    int m = grid.size();
    int n = grid[0].size();
    int dr[4] = {-1, 1, 0, 0};
    int dc[4] = {0, 0, -1, 1};
    set<vector<pair<int, int>>> shapes;
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            if (grid[r][c] != 1) continue;
            vector<pair<int, int>> shape;
            queue<pair<int, int>> q;
            grid[r][c] = 0;
            q.push(make_pair(r, c));
            while (!q.empty()) {
                int cr = q.front().first;
                int cc = q.front().second;
                q.pop();
                shape.push_back(make_pair(cr - r, cc - c));
                for (int k = 0; k < 4; k++) {
                    int nr = cr + dr[k];
                    int nc = cc + dc[k];
                    if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
                    if (grid[nr][nc] != 1) continue;
                    grid[nr][nc] = 0;
                    q.push(make_pair(nr, nc));
                }
            }
            sort(shape.begin(), shape.end());
            shapes.insert(shape);
        }
    }
    return (int)shapes.size();
}`,
      explanation: [
        "Explore each island once and record every cell as an offset from the island's anchor - the cell where the scan first entered it. Subtracting the anchor makes the description translation-invariant.",
        "Sorting the offset list gives a canonical form, so two islands produce identical vectors precisely when one is a translate of the other. Inserting into a set then counts distinct shapes. The anchor is well defined because the row-major scan always enters an island at its topmost, then leftmost, cell.",
        "Time: O(m * n * log(m * n)) dominated by sorting and set insertion. Space: O(m * n).",
      ],
    },
    {
      name: "Number of Operations to Make Network Connected",
      difficulty: "Medium",
      variation: "Union-Find, redundant cables vs components",
      link: "https://leetcode.com/problems/number-of-operations-to-make-network-connected/",
      question: [
        "There are n computers numbered 0 to n-1 connected by ethernet cables given as connections, where connections[i] = [a, b] connects computers a and b. You can extract a cable between two directly connected computers and place it between any pair of disconnected computers. Return the minimum number of such operations needed to connect all computers, or -1 if it is impossible.",
        "Example 1:\nInput: n = 4, connections = [[0,1],[0,2],[1,2]]\nOutput: 1\nExplanation: Move the cable [1,2] to connect computer 3.",
        "Example 2:\nInput: n = 6, connections = [[0,1],[0,2],[0,3],[1,2]]\nOutput: 2",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= connections.length <= min(n * (n - 1) / 2, 10^5)\n- There are no repeated connections and no self-connections",
      ],
      code: `int makeConnected(int n, vector<vector<int>>& connections) {
    if ((int)connections.size() < n - 1) return -1;
    vector<int> parent(n);
    for (int i = 0; i < n; i++) parent[i] = i;
    function<int(int)> find = [&](int x) -> int {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    };
    int components = n;
    for (auto& e : connections) {
        int a = find(e[0]);
        int b = find(e[1]);
        if (a == b) continue;
        parent[a] = b;
        components--;
    }
    return components - 1;
}`,
      explanation: [
        "Connecting n computers requires at least n-1 cables, so fewer than that is immediately impossible. Otherwise count the components with Union-Find; joining c components needs exactly c-1 moves.",
        "The cables are always available: with at least n-1 edges and c components, the number of redundant edges is E - (n - c), which is at least c-1 whenever E is at least n-1. So the component count alone determines the answer.",
        "Time: O(n + E). Space: O(n).",
      ],
    },
    {
      name: "Number of Complete Components",
      difficulty: "Medium",
      variation: "Component traversal with degree-sum test",
      link: "https://leetcode.com/problems/number-of-complete-components/",
      question: [
        "You are given an integer n of vertices numbered 0 to n-1 and a 2D array edges of an undirected graph. Return the number of complete connected components, where a component is complete if every pair of its vertices is joined by an edge.",
        "Example 1:\nInput: n = 6, edges = [[0,1],[0,2],[1,2],[3,4]]\nOutput: 3\nExplanation: The triangle {0,1,2}, the edge {3,4} and the isolated vertex {5} are all complete.",
        "Example 2:\nInput: n = 6, edges = [[0,1],[0,2],[1,2],[3,4],[3,5]]\nOutput: 1\nExplanation: {3,4,5} is missing the edge 4 - 5.",
        "Constraints:\n- 1 <= n <= 50\n- 0 <= edges.length <= n * (n - 1) / 2\n- There are no repeated edges and no self-loops",
      ],
      code: `int countCompleteComponents(int n, vector<vector<int>>& edges) {
    vector<vector<int>> adj(n);
    for (auto& e : edges) {
        adj[e[0]].push_back(e[1]);
        adj[e[1]].push_back(e[0]);
    }
    vector<int> visited(n, 0);
    int complete = 0;
    for (int s = 0; s < n; s++) {
        if (visited[s]) continue;
        long long vertices = 0;
        long long degreeSum = 0;
        queue<int> q;
        visited[s] = 1;
        q.push(s);
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            vertices++;
            degreeSum += (long long)adj[u].size();
            for (int v : adj[u]) {
                if (!visited[v]) {
                    visited[v] = 1;
                    q.push(v);
                }
            }
        }
        if (degreeSum == vertices * (vertices - 1)) complete++;
    }
    return complete;
}`,
      explanation: [
        "Traverse each component while accumulating two numbers: how many vertices it has and the sum of their degrees. The degree sum counts each internal edge twice.",
        "A complete graph on k vertices has k*(k-1)/2 edges, so its degree sum is exactly k*(k-1). Since every neighbour of a vertex in a component is inside that same component, and the input has no duplicate edges or self-loops, matching that number is both necessary and sufficient - no explicit pairwise check is needed.",
        "Time: O(n + E). Space: O(n + E).",
      ],
    },
    {
      name: "Most Stones Removed with Same Row or Column",
      difficulty: "Medium",
      variation: "Union-Find on shared rows and columns",
      link: "https://leetcode.com/problems/most-stones-removed-with-same-row-or-column/",
      question: [
        "On a 2D plane, some stones are placed at integer coordinates given by stones, where stones[i] = [xi, yi]. A stone can be removed if it shares a row or a column with another stone that has not been removed. Return the largest possible number of stones that can be removed.",
        "Example 1:\nInput: stones = [[0,0],[0,1],[1,0],[1,2],[2,1],[2,2]]\nOutput: 5",
        "Example 2:\nInput: stones = [[0,0]]\nOutput: 0",
        "Constraints:\n- 1 <= stones.length <= 1000\n- 0 <= xi, yi <= 10^4\n- No two stones share the same coordinate",
      ],
      code: `int removeStones(vector<vector<int>>& stones) {
    int n = stones.size();
    vector<int> parent(n);
    for (int i = 0; i < n; i++) parent[i] = i;
    function<int(int)> find = [&](int x) -> int {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    };
    unordered_map<int, int> rowFirst;
    unordered_map<int, int> colFirst;
    int components = n;
    for (int i = 0; i < n; i++) {
        int r = stones[i][0];
        int c = stones[i][1];
        if (rowFirst.count(r)) {
            int a = find(i);
            int b = find(rowFirst[r]);
            if (a != b) {
                parent[a] = b;
                components--;
            }
        } else {
            rowFirst[r] = i;
        }
        if (colFirst.count(c)) {
            int a = find(i);
            int b = find(colFirst[c]);
            if (a != b) {
                parent[a] = b;
                components--;
            }
        } else {
            colFirst[c] = i;
        }
    }
    return n - components;
}`,
      explanation: [
        "Treat stones as vertices, with an edge between any two that share a row or a column. Rather than building all pairs, link each stone to the first stone seen in its row and the first in its column, which yields the same components with only O(n) unions.",
        "Within one component of size k, exactly k-1 stones can be removed: repeatedly remove a leaf of a spanning tree of the component, which always still has a partner. One stone per component must survive, because the last stone standing has no companion left. So the answer is n minus the number of components.",
        "Time: O(n) amortized. Space: O(n).",
      ],
    },
    {
      name: "Making A Large Island",
      difficulty: "Hard",
      variation: "Component labelling plus neighbour merge",
      link: "https://leetcode.com/problems/making-a-large-island/",
      question: [
        "You are given an n x n binary matrix grid. You are allowed to change at most one 0 into a 1. Return the size of the largest island you can obtain, where an island is a 4-directionally connected group of 1s.",
        "Example 1:\nInput: grid = [[1,0],[0,1]]\nOutput: 3\nExplanation: Changing one 0 joins the two single-cell islands.",
        "Example 2:\nInput: grid = [[1,1],[1,1]]\nOutput: 4\nExplanation: No 0 exists to flip; the whole grid is already one island.",
        "Constraints:\n- n == grid.length == grid[i].length\n- 1 <= n <= 500\n- grid[i][j] is 0 or 1",
      ],
      code: `int largestIsland(vector<vector<int>>& grid) {
    int n = grid.size();
    vector<vector<int>> id(n, vector<int>(n, 0));
    vector<int> compSize(1, 0);
    int dr[4] = {-1, 1, 0, 0};
    int dc[4] = {0, 0, -1, 1};
    int nextId = 1;
    for (int r = 0; r < n; r++) {
        for (int c = 0; c < n; c++) {
            if (grid[r][c] != 1 || id[r][c] != 0) continue;
            int cur = nextId++;
            int count = 0;
            queue<pair<int, int>> q;
            id[r][c] = cur;
            q.push(make_pair(r, c));
            while (!q.empty()) {
                int cr = q.front().first;
                int cc = q.front().second;
                q.pop();
                count++;
                for (int k = 0; k < 4; k++) {
                    int nr = cr + dr[k];
                    int nc = cc + dc[k];
                    if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
                    if (grid[nr][nc] != 1 || id[nr][nc] != 0) continue;
                    id[nr][nc] = cur;
                    q.push(make_pair(nr, nc));
                }
            }
            compSize.push_back(count);
        }
    }
    int best = 0;
    for (int s : compSize) best = max(best, s);
    for (int r = 0; r < n; r++) {
        for (int c = 0; c < n; c++) {
            if (grid[r][c] != 0) continue;
            int total = 1;
            int seen[4] = {0, 0, 0, 0};
            int seenCount = 0;
            for (int k = 0; k < 4; k++) {
                int nr = r + dr[k];
                int nc = c + dc[k];
                if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
                int label = id[nr][nc];
                if (label == 0) continue;
                bool dup = false;
                for (int t = 0; t < seenCount; t++) {
                    if (seen[t] == label) dup = true;
                }
                if (dup) continue;
                seen[seenCount++] = label;
                total += compSize[label];
            }
            best = max(best, total);
        }
    }
    return best;
}`,
      explanation: [
        "First pass: label every island with a unique id and record its size, so each land cell knows which component it belongs to in O(1).",
        "Second pass: for each water cell, flipping it merges the distinct islands touching its four sides into one island of size 1 plus the sum of those island sizes. Deduplicating labels is essential - two different sides can touch the same island, and adding its size twice would overcount.",
        "The initial best is the largest existing island, which covers the case where the grid has no water at all. Time: O(n^2). Space: O(n^2).",
      ],
    },
  ],
};
