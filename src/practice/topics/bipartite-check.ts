import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Two-Colour a Tree",
      difficulty: "Easy",
      variation: "BFS depth parity on a tree",
      question: [
        "You are given a tree with n nodes labeled 0 to n-1 and its n-1 undirected edges. Assign each node a colour, 0 or 1, so that no edge joins two nodes of the same colour. Return the colour array. Explain why such an assignment always exists for a tree.",
        "Example 1:\nInput: n = 4, edges = [[0,1],[0,2],[1,3]]\nOutput: [0,1,1,0]\nExplanation: Node 0 gets 0, its children 1 and 2 get 1, and node 3 gets 0 again.",
        "Example 2:\nInput: n = 1, edges = []\nOutput: [0]",
        "Constraints:\n- 1 <= n <= 10^5\n- edges.length == n - 1\n- The input is guaranteed to be a connected tree",
      ],
      code: `vector<int> twoColourTree(int n, vector<vector<int>>& edges) {
    vector<vector<int>> adj(n);
    for (auto& e : edges) {
        adj[e[0]].push_back(e[1]);
        adj[e[1]].push_back(e[0]);
    }
    vector<int> colour(n, -1);
    colour[0] = 0;
    queue<int> q;
    q.push(0);
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        for (int v : adj[u]) {
            if (colour[v] == -1) {
                colour[v] = colour[u] ^ 1;
                q.push(v);
            }
        }
    }
    return colour;
}`,
      explanation: [
        "Root the tree anywhere and colour each node by the parity of its depth: even depths get 0, odd depths get 1. BFS from node 0 does exactly this, since every child is coloured as the XOR of its parent's colour with 1.",
        "The assignment can never conflict because a tree has no cycles at all, and in particular no odd cycle. Every edge of a rooted tree joins a parent to a child, whose depths differ by exactly one, so their parities - and hence colours - always differ. A tree is therefore always bipartite, and no failure branch is needed.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Two-Colour a Grid",
      difficulty: "Easy",
      variation: "Checkerboard parity colouring",
      question: [
        "You are given an m x n grid where each cell is either free ('.') or blocked ('#'). Assign each free cell a colour, 0 or 1, so that no two side-adjacent free cells share a colour. Blocked cells get -1. Return the colour grid, and argue that it always exists.",
        "Example 1:\nInput: grid = [['.','.'],['#','.']]\nOutput: [[0,1],[-1,0]]",
        "Example 2:\nInput: grid = [['.']]\nOutput: [[0]]",
        "Constraints:\n- 1 <= m, n <= 1000\n- grid[i][j] is '.' or '#'",
      ],
      code: `vector<vector<int>> colourGrid(vector<vector<char>>& grid) {
    int m = grid.size();
    int n = grid[0].size();
    vector<vector<int>> colour(m, vector<int>(n, -1));
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            if (grid[r][c] == '.') colour[r][c] = (r + c) % 2;
        }
    }
    return colour;
}`,
      explanation: [
        "No traversal is required: colour every free cell by the parity of r + c, the classic checkerboard pattern.",
        "Any two side-adjacent cells differ by one in exactly one coordinate, so their r + c values differ by exactly one and always have opposite parity. The grid graph is therefore bipartite by construction, and removing cells (blocking them) can only delete edges, which never creates an odd cycle. Every grid subgraph is bipartite.",
        "Time: O(m * n). Space: O(m * n) for the output.",
      ],
    },
    {
      name: "Is Graph Bipartite?",
      difficulty: "Medium",
      variation: "BFS 2-colouring",
      link: "https://leetcode.com/problems/is-graph-bipartite/",
      question: [
        "Given an undirected graph with n nodes described by an adjacency list graph, where graph[u] is the list of nodes adjacent to u, return true if the graph is bipartite - that is, the nodes can be split into two sets with every edge crossing between the sets.",
        "Example 1:\nInput: graph = [[1,2,3],[0,2],[0,1,3],[0,2]]\nOutput: false\nExplanation: There is no way to split the nodes into two independent sets; 1 - 2 - 0 - 1 is an odd cycle.",
        "Example 2:\nInput: graph = [[1,3],[0,2],[1,3],[0,2]]\nOutput: true\nExplanation: The split is {0, 2} and {1, 3}.",
        "Constraints:\n- graph.length == n\n- 1 <= n <= 100\n- The graph may be disconnected, has no self-edges and no parallel edges",
      ],
      code: `bool isBipartite(vector<vector<int>>& graph) {
    int n = graph.size();
    vector<int> colour(n, -1);
    for (int s = 0; s < n; s++) {
        if (colour[s] != -1) continue;
        colour[s] = 0;
        queue<int> q;
        q.push(s);
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (int v : graph[u]) {
                if (colour[v] == -1) {
                    colour[v] = colour[u] ^ 1;
                    q.push(v);
                } else if (colour[v] == colour[u]) {
                    return false;
                }
            }
        }
    }
    return true;
}`,
      explanation: [
        "BFS assigns every newly discovered node the opposite colour of its parent, so the colour of a node equals the parity of its BFS distance from the start.",
        "An edge joining two same-coloured nodes means both endpoints have the same distance parity from the start. Combining the two BFS tree paths with that edge produces a closed walk of odd length, which always contains an odd cycle - and a graph is bipartite exactly when it has no odd cycle. So the conflict test is not a heuristic, it is a proof of non-bipartiteness.",
        "The outer loop restarts the colouring on each component, so disconnected graphs are handled. Time: O(V + E). Space: O(V).",
      ],
    },
    {
      name: "Bipartite Check Using DFS",
      difficulty: "Medium",
      variation: "DFS 2-colouring",
      question: [
        "Given an undirected graph with V vertices numbered 0 to V-1 and an adjacency list adj, return true if the graph is bipartite. Use depth-first search rather than BFS. The graph may be disconnected.",
        "Example 1:\nInput: V = 4, adj = [[1,3],[0,2],[1,3],[0,2]]\nOutput: true",
        "Example 2:\nInput: V = 3, adj = [[1,2],[0,2],[0,1]]\nOutput: false\nExplanation: A triangle is an odd cycle.",
        "Constraints:\n- 1 <= V <= 10^5\n- 0 <= number of edges <= 2 * 10^5\n- No self-loops",
      ],
      code: `bool isBipartiteDFS(int V, vector<vector<int>>& adj) {
    vector<int> colour(V, -1);
    function<bool(int, int)> dfs = [&](int u, int c) -> bool {
        colour[u] = c;
        for (int v : adj[u]) {
            if (colour[v] == -1) {
                if (!dfs(v, c ^ 1)) return false;
            } else if (colour[v] == c) {
                return false;
            }
        }
        return true;
    };
    for (int i = 0; i < V; i++) {
        if (colour[i] == -1 && !dfs(i, 0)) return false;
    }
    return true;
}`,
      explanation: [
        "The DFS colours a vertex on entry and hands the flipped colour to each uncoloured neighbour. Any neighbour already carrying the current vertex's colour is a conflict and the failure propagates straight back up.",
        "DFS and BFS are equally valid here, unlike in cycle detection: bipartiteness only depends on the parity of tree-path lengths, and in an undirected search every non-tree edge joins a vertex to an ancestor or a same-parity relative, so a colour clash always closes an odd cycle regardless of traversal order.",
        "Time: O(V + E). Space: O(V) plus recursion depth.",
      ],
    },
    {
      name: "Building Teams (CSES 1668)",
      difficulty: "Medium",
      variation: "BFS 2-colouring with output",
      link: "https://cses.fi/problemset/task/1668",
      question: [
        "There are n pupils and m known friendships between them. Your task is to divide the pupils into two teams so that no two pupils in the same team are friends. Print an assignment of teams 1 and 2 for every pupil, or IMPOSSIBLE if no valid division exists.",
        "Example 1:\nInput:\n5 3\n1 2\n1 3\n4 5\nOutput:\n1 2 2 1 2\nExplanation: Any valid assignment is accepted.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= m <= 2 * 10^5\n- Friendships are undirected; the graph may be disconnected",
      ],
      code: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<vector<int>> adj(n + 1);
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        adj[a].push_back(b);
        adj[b].push_back(a);
    }
    vector<int> team(n + 1, 0);
    for (int s = 1; s <= n; s++) {
        if (team[s] != 0) continue;
        team[s] = 1;
        queue<int> q;
        q.push(s);
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (int v : adj[u]) {
                if (team[v] == 0) {
                    team[v] = 3 - team[u];
                    q.push(v);
                } else if (team[v] == team[u]) {
                    cout << "IMPOSSIBLE" << endl;
                    return 0;
                }
            }
        }
    }
    for (int i = 1; i <= n; i++) {
        if (i > 1) cout << " ";
        cout << team[i];
    }
    cout << endl;
    return 0;
}`,
      explanation: [
        "This is the constructive form of the bipartite check: the two teams are the two colour classes. Team 0 means uncoloured, so 3 - team[u] flips between 1 and 2.",
        "BFS from every still-uncoloured pupil handles the disconnected case, and each component may be seeded arbitrarily since flipping a whole component's colours is still valid. A same-team friendship proves an odd cycle exists, at which point no division can work and IMPOSSIBLE is printed.",
        "Time: O(n + m). Space: O(n + m).",
      ],
    },
    {
      name: "Count Bipartite Components",
      difficulty: "Medium",
      variation: "Per-component check on a disconnected graph",
      question: [
        "Given n vertices labeled 0 to n-1 and a list of undirected edges forming a possibly disconnected graph, return how many of its connected components are bipartite. An isolated vertex counts as a bipartite component.",
        "Example 1:\nInput: n = 7, edges = [[0,1],[1,2],[2,0],[3,4],[4,5]]\nOutput: 2\nExplanation: The triangle {0,1,2} is not bipartite; the path {3,4,5} and the isolated vertex {6} are.",
        "Example 2:\nInput: n = 3, edges = []\nOutput: 3",
        "Constraints:\n- 1 <= n <= 10^5\n- 0 <= edges.length <= 2 * 10^5\n- No self-loops",
      ],
      code: `int countBipartiteComponents(int n, vector<vector<int>>& edges) {
    vector<vector<int>> adj(n);
    for (auto& e : edges) {
        adj[e[0]].push_back(e[1]);
        adj[e[1]].push_back(e[0]);
    }
    vector<int> colour(n, -1);
    int good = 0;
    for (int s = 0; s < n; s++) {
        if (colour[s] != -1) continue;
        colour[s] = 0;
        bool ok = true;
        queue<int> q;
        q.push(s);
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (int v : adj[u]) {
                if (colour[v] == -1) {
                    colour[v] = colour[u] ^ 1;
                    q.push(v);
                } else if (colour[v] == colour[u]) {
                    ok = false;
                }
            }
        }
        if (ok) good++;
    }
    return good;
}`,
      explanation: [
        "Bipartiteness is a property of each component independently, so run one 2-colouring BFS per component and tally the components that finish without a conflict.",
        "The important detail is that a conflict sets a flag instead of returning. The BFS must run to completion so every vertex of the bad component gets coloured and marked visited - bailing out early would leave part of it uncoloured and it would be counted a second time as a fresh component.",
        "Time: O(V + E). Space: O(V + E).",
      ],
    },
    {
      name: "Bipartite Check with Union-Find",
      difficulty: "Medium",
      variation: "Union-Find with a doubled vertex set",
      question: [
        "Given n vertices labeled 0 to n-1 and a list of undirected edges, decide whether the graph is bipartite using a disjoint-set union structure rather than a traversal.",
        "Example 1:\nInput: n = 4, edges = [[0,1],[1,2],[2,3],[3,0]]\nOutput: true\nExplanation: A 4-cycle is bipartite.",
        "Example 2:\nInput: n = 4, edges = [[0,1],[1,2],[2,0]]\nOutput: false",
        "Constraints:\n- 1 <= n <= 10^5\n- 0 <= edges.length <= 2 * 10^5\n- No self-loops",
      ],
      code: `bool isBipartiteDSU(int n, vector<vector<int>>& edges) {
    vector<int> parent(2 * n);
    for (int i = 0; i < 2 * n; i++) parent[i] = i;
    function<int(int)> find = [&](int x) -> int {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    };
    auto unite = [&](int a, int b) {
        int ra = find(a);
        int rb = find(b);
        if (ra != rb) parent[ra] = rb;
    };
    for (auto& e : edges) {
        int u = e[0];
        int v = e[1];
        if (find(u) == find(v)) return false;
        unite(u, v + n);
        unite(v, u + n);
    }
    return true;
}`,
      explanation: [
        "Give every vertex u two slots: u meaning 'u is on side A' and u + n meaning 'u is on side B'. For each edge, merge u with the opposite side of v and v with the opposite side of u, recording the constraint that they must differ.",
        "Before merging, check whether u and v already share a set. If they do, earlier constraints have already forced them onto the same side, and the new edge demands the opposite - a contradiction, which is exactly an odd cycle. The doubled-vertex trick encodes 'must differ' inside a structure that natively only records 'must be equal'.",
        "Time: O(n + E) with near-constant amortized operations. Space: O(n).",
      ],
    },
    {
      name: "Divide Players Into Two Teams",
      difficulty: "Medium",
      variation: "2-colouring, report the actual split",
      question: [
        "You are given n players labeled 0 to n-1 and a list of dislike pairs. Split all players into exactly two teams so that no two players who dislike each other are on the same team. Return the two teams as lists of player labels, or an empty result if no valid split exists.",
        "Example 1:\nInput: n = 4, dislikes = [[0,1],[1,2],[2,3]]\nOutput: [[0,2],[1,3]]",
        "Example 2:\nInput: n = 3, dislikes = [[0,1],[1,2],[0,2]]\nOutput: []\nExplanation: Three mutually disliking players cannot fill two teams.",
        "Constraints:\n- 1 <= n <= 10^5\n- 0 <= dislikes.length <= 2 * 10^5\n- No player dislikes themselves and no pair repeats",
      ],
      code: `vector<vector<int>> divideIntoTeams(int n, vector<vector<int>>& dislikes) {
    vector<vector<int>> adj(n);
    for (auto& d : dislikes) {
        adj[d[0]].push_back(d[1]);
        adj[d[1]].push_back(d[0]);
    }
    vector<int> colour(n, -1);
    for (int s = 0; s < n; s++) {
        if (colour[s] != -1) continue;
        colour[s] = 0;
        queue<int> q;
        q.push(s);
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (int v : adj[u]) {
                if (colour[v] == -1) {
                    colour[v] = colour[u] ^ 1;
                    q.push(v);
                } else if (colour[v] == colour[u]) {
                    return {};
                }
            }
        }
    }
    vector<vector<int>> teams(2);
    for (int i = 0; i < n; i++) {
        teams[colour[i]].push_back(i);
    }
    return teams;
}`,
      explanation: [
        "Build the dislike graph and 2-colour it. The two colour classes are the two teams, since every dislike edge is guaranteed to cross between them.",
        "A same-colour edge proves an odd cycle of dislikes, and no odd cycle can be split into two independent sets, so the empty result is genuinely 'impossible' rather than 'this attempt failed'. Players with no dislikes at all are seeded as their own component and land in team 0, which is always safe.",
        "Time: O(n + D) where D is the number of dislike pairs. Space: O(n + D).",
      ],
    },
    {
      name: "Possible Bipartition",
      difficulty: "Medium",
      variation: "BFS 2-colouring, 1-indexed people",
      link: "https://leetcode.com/problems/possible-bipartition/",
      question: [
        "We want to split a group of n people labeled 1 to n into two groups of any size. Given the array dislikes where dislikes[i] = [ai, bi] means person ai and person bi must not be in the same group, return true if it is possible to split everyone into two groups this way.",
        "Example 1:\nInput: n = 4, dislikes = [[1,2],[1,3],[2,4]]\nOutput: true\nExplanation: Groups {1,4} and {2,3} work.",
        "Example 2:\nInput: n = 3, dislikes = [[1,2],[1,3],[2,3]]\nOutput: false",
        "Constraints:\n- 1 <= n <= 2000\n- 0 <= dislikes.length <= 10^4\n- 1 <= ai < bi <= n\n- All dislike pairs are distinct",
      ],
      code: `bool possibleBipartition(int n, vector<vector<int>>& dislikes) {
    vector<vector<int>> adj(n + 1);
    for (auto& d : dislikes) {
        adj[d[0]].push_back(d[1]);
        adj[d[1]].push_back(d[0]);
    }
    vector<int> colour(n + 1, -1);
    for (int s = 1; s <= n; s++) {
        if (colour[s] != -1) continue;
        colour[s] = 0;
        queue<int> q;
        q.push(s);
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (int v : adj[u]) {
                if (colour[v] == -1) {
                    colour[v] = colour[u] ^ 1;
                    q.push(v);
                } else if (colour[v] == colour[u]) {
                    return false;
                }
            }
        }
    }
    return true;
}`,
      explanation: [
        "The dislike relation is an undirected graph and the question is literally whether it is bipartite, so a plain 2-colouring BFS answers it.",
        "Groups may be any size, including empty, so there is no extra constraint beyond the colouring - the only obstruction is an odd cycle of mutual dislikes. Because every person must be placed, the loop restarts on each component; people with no dislikes are trivially colourable.",
        "Time: O(n + D). Space: O(n + D).",
      ],
    },
    {
      name: "Flower Planting With No Adjacent",
      difficulty: "Medium",
      variation: "Greedy colouring with bounded degree",
      link: "https://leetcode.com/problems/flower-planting-with-no-adjacent/",
      question: [
        "You have n gardens labeled 1 to n and an array paths where paths[i] = [xi, yi] is a bidirectional path between gardens xi and yi. In each garden you want to plant one of four flower types, numbered 1 to 4, so that no two gardens connected by a path have the same type. Each garden has at most 3 paths coming into or leaving it. Return any valid answer as a 0-indexed array where answer[i] is the type for garden i+1.",
        "Example 1:\nInput: n = 3, paths = [[1,2],[2,3],[3,1]]\nOutput: [1,2,3]",
        "Example 2:\nInput: n = 4, paths = [[1,2],[3,4]]\nOutput: [1,2,1,2]",
        "Constraints:\n- 1 <= n <= 10^4\n- 0 <= paths.length <= 2 * 10^4\n- No garden has more than 3 paths, no repeated paths and no self-paths",
      ],
      code: `vector<int> gardenNoAdj(int n, vector<vector<int>>& paths) {
    vector<vector<int>> adj(n + 1);
    for (auto& p : paths) {
        adj[p[0]].push_back(p[1]);
        adj[p[1]].push_back(p[0]);
    }
    vector<int> res(n, 0);
    for (int u = 1; u <= n; u++) {
        bool used[5] = {false, false, false, false, false};
        for (int v : adj[u]) {
            int c = res[v - 1];
            if (c != 0) used[c] = true;
        }
        for (int c = 1; c <= 4; c++) {
            if (!used[c]) {
                res[u - 1] = c;
                break;
            }
        }
    }
    return res;
}`,
      explanation: [
        "Process gardens in label order and give each one the smallest flower type not already used by any of its already-planted neighbours.",
        "Greedy never gets stuck because a garden has at most 3 neighbours, so at most 3 of the 4 types can be blocked and a free type always remains. This is the general fact that a graph of maximum degree d is greedily (d+1)-colourable - the same 2-colouring idea as bipartite checking, generalised beyond two colours. A bipartite graph would need only 2 types, but degree-3 graphs can contain odd cycles, so 2 is not always enough.",
        "Time: O(n + P). Space: O(n + P).",
      ],
    },
    {
      name: "Count the 2-Colourings of a Graph",
      difficulty: "Medium",
      variation: "Bipartite check plus component counting",
      question: [
        "Given n vertices labeled 0 to n-1 and a list of undirected edges, count the number of ways to colour every vertex with one of two colours so that no edge joins two vertices of the same colour. Return the count modulo 10^9 + 7, or 0 if no valid colouring exists.",
        "Example 1:\nInput: n = 4, edges = [[0,1],[2,3]]\nOutput: 4\nExplanation: Two independent components, each with 2 valid colourings.",
        "Example 2:\nInput: n = 3, edges = [[0,1],[1,2],[0,2]]\nOutput: 0",
        "Constraints:\n- 1 <= n <= 10^5\n- 0 <= edges.length <= 2 * 10^5\n- No self-loops",
      ],
      code: `int countTwoColourings(int n, vector<vector<int>>& edges) {
    const long long MOD = 1000000007LL;
    vector<vector<int>> adj(n);
    for (auto& e : edges) {
        adj[e[0]].push_back(e[1]);
        adj[e[1]].push_back(e[0]);
    }
    vector<int> colour(n, -1);
    long long ways = 1;
    for (int s = 0; s < n; s++) {
        if (colour[s] != -1) continue;
        colour[s] = 0;
        queue<int> q;
        q.push(s);
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (int v : adj[u]) {
                if (colour[v] == -1) {
                    colour[v] = colour[u] ^ 1;
                    q.push(v);
                } else if (colour[v] == colour[u]) {
                    return 0;
                }
            }
        }
        ways = (ways * 2) % MOD;
    }
    return (int)ways;
}`,
      explanation: [
        "Within a connected component, fixing the colour of one vertex forces the colour of every other vertex, because the colour equals the start colour XOR the parity of the path length. So a bipartite component has exactly 2 valid colourings and a non-bipartite one has 0.",
        "Components are independent, so the totals multiply: the answer is 2 raised to the number of components if every component is bipartite, and 0 otherwise. Any colour conflict makes the whole product 0, so the function can return immediately.",
        "Time: O(V + E). Space: O(V + E).",
      ],
    },
    {
      name: "Report an Odd-Length Cycle",
      difficulty: "Hard",
      variation: "BFS conflict edge plus LCA reconstruction",
      question: [
        "Given n vertices labeled 0 to n-1 and a list of undirected edges, return the vertices of any cycle of odd length, in order along the cycle. Return an empty list if the graph is bipartite.",
        "Example 1:\nInput: n = 5, edges = [[0,1],[1,2],[2,0],[2,3],[3,4]]\nOutput: [0,1,2]\nExplanation: A triangle; any rotation of it is accepted.",
        "Example 2:\nInput: n = 4, edges = [[0,1],[1,2],[2,3],[3,0]]\nOutput: []\nExplanation: The only cycle has even length 4, so the graph is bipartite.",
        "Constraints:\n- 1 <= n <= 10^5\n- 0 <= edges.length <= 2 * 10^5\n- No self-loops and no parallel edges",
      ],
      code: `vector<int> findOddCycle(int n, vector<vector<int>>& edges) {
    vector<vector<int>> adj(n);
    for (auto& e : edges) {
        adj[e[0]].push_back(e[1]);
        adj[e[1]].push_back(e[0]);
    }
    vector<int> depth(n, -1);
    vector<int> par(n, -1);
    for (int s = 0; s < n; s++) {
        if (depth[s] != -1) continue;
        depth[s] = 0;
        queue<int> q;
        q.push(s);
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (int v : adj[u]) {
                if (depth[v] == -1) {
                    depth[v] = depth[u] + 1;
                    par[v] = u;
                    q.push(v);
                } else if (((depth[u] ^ depth[v]) & 1) == 0) {
                    int a = u;
                    int b = v;
                    vector<int> left;
                    vector<int> right;
                    while (depth[a] > depth[b]) {
                        left.push_back(a);
                        a = par[a];
                    }
                    while (depth[b] > depth[a]) {
                        right.push_back(b);
                        b = par[b];
                    }
                    while (a != b) {
                        left.push_back(a);
                        right.push_back(b);
                        a = par[a];
                        b = par[b];
                    }
                    reverse(left.begin(), left.end());
                    vector<int> cycle;
                    cycle.push_back(a);
                    for (int x : left) cycle.push_back(x);
                    for (int x : right) cycle.push_back(x);
                    return cycle;
                }
            }
        }
    }
    return {};
}`,
      explanation: [
        "Run a BFS that stores depth and parent. A non-tree edge (u, v) whose endpoints have the same depth parity is a colour conflict in the 2-colouring sense, and it is the witness for an odd cycle.",
        "To produce the cycle itself, climb from u and v through parent pointers until they meet at their lowest common ancestor, collecting the two half-paths. The cycle is that ancestor, then the path down to u, then across the conflict edge to v, then back up to the ancestor. Its length is (depth[u] - depth[lca]) + (depth[v] - depth[lca]) + 1, and because the two depths share a parity the first two terms sum to an even number, making the total odd.",
        "This is the constructive half of the bipartite theorem: a graph is non-bipartite if and only if such a cycle exists. Time: O(V + E). Space: O(V + E).",
      ],
    },
    {
      name: "Maximum Bipartite Subgraph by Edges (Max-Cut)",
      difficulty: "Hard",
      variation: "Local search, half-of-edges guarantee",
      question: [
        "Given n vertices labeled 0 to n-1 and a list of undirected edges, split the vertices into two sides so that as many edges as possible cross between the sides. The crossing edges form a bipartite subgraph. Return the number of crossing edges achieved by local search, which is guaranteed to be at least half of all edges.",
        "Example 1:\nInput: n = 3, edges = [[0,1],[1,2],[2,0]]\nOutput: 2\nExplanation: Any split of a triangle leaves one edge inside a side, so 2 is optimal.",
        "Example 2:\nInput: n = 4, edges = [[0,1],[1,2],[2,3],[3,0]]\nOutput: 4\nExplanation: The graph is already bipartite, so every edge can cross.",
        "Constraints:\n- 1 <= n <= 10^4\n- 0 <= edges.length <= 5 * 10^4\n- No self-loops",
      ],
      code: `int maxCutLocalSearch(int n, vector<vector<int>>& edges) {
    vector<vector<int>> adj(n);
    for (auto& e : edges) {
        adj[e[0]].push_back(e[1]);
        adj[e[1]].push_back(e[0]);
    }
    vector<int> side(n, 0);
    bool improved = true;
    while (improved) {
        improved = false;
        for (int u = 0; u < n; u++) {
            int same = 0;
            int cross = 0;
            for (int v : adj[u]) {
                if (side[v] == side[u]) same++;
                else cross++;
            }
            if (same > cross) {
                side[u] ^= 1;
                improved = true;
            }
        }
    }
    int cut = 0;
    for (auto& e : edges) {
        if (side[e[0]] != side[e[1]]) cut++;
    }
    return cut;
}`,
      explanation: [
        "Start with every vertex on side 0 and repeatedly flip any vertex that has more same-side neighbours than crossing ones. Each flip converts those same-side edges into crossing edges and vice versa.",
        "A flip strictly increases the cut by same - cross, which is at least 1, so the cut value is a strictly increasing integer bounded by the edge count and the loop must terminate after at most E flips. At the fixed point every vertex has at least half of its edges crossing, and summing that over all vertices counts each crossing edge twice, giving a cut of at least E/2.",
        "This is the approximate cousin of bipartite checking: if the graph really is bipartite the optimum is E, and the check answers yes; otherwise odd cycles force some edges to stay inside a side, and max-cut is NP-hard to solve exactly. Time: O(E^2) worst case. Space: O(n + E).",
      ],
    },
    {
      name: "Maximum Induced Bipartite Subgraph",
      difficulty: "Hard",
      variation: "Bitmask enumeration plus bipartite check",
      question: [
        "Given a small undirected graph on n vertices labeled 0 to n-1, choose the largest possible subset S of vertices such that the subgraph induced on S is bipartite. Return the size of S.",
        "Example 1:\nInput: n = 3, edges = [[0,1],[1,2],[2,0]]\nOutput: 2\nExplanation: Any two vertices of the triangle induce a single edge, which is bipartite; all three form an odd cycle.",
        "Example 2:\nInput: n = 4, edges = [[0,1],[1,2],[2,3],[3,0]]\nOutput: 4\nExplanation: The whole 4-cycle is already bipartite.",
        "Constraints:\n- 1 <= n <= 20\n- 0 <= edges.length <= n * (n - 1) / 2\n- No self-loops and no repeated edges",
      ],
      code: `int maxBipartiteSubset(int n, vector<vector<int>>& edges) {
    vector<int> nbr(n, 0);
    for (auto& e : edges) {
        nbr[e[0]] |= (1 << e[1]);
        nbr[e[1]] |= (1 << e[0]);
    }
    int best = 0;
    for (int sub = 0; sub < (1 << n); sub++) {
        int cnt = __builtin_popcount((unsigned int)sub);
        if (cnt <= best) continue;
        vector<int> colour(n, -1);
        bool ok = true;
        for (int s = 0; s < n && ok; s++) {
            if (((sub >> s) & 1) == 0) continue;
            if (colour[s] != -1) continue;
            colour[s] = 0;
            vector<int> stk;
            stk.push_back(s);
            while (!stk.empty() && ok) {
                int u = stk.back();
                stk.pop_back();
                for (int v = 0; v < n; v++) {
                    if (((nbr[u] >> v) & 1) == 0) continue;
                    if (((sub >> v) & 1) == 0) continue;
                    if (colour[v] == -1) {
                        colour[v] = colour[u] ^ 1;
                        stk.push_back(v);
                    } else if (colour[v] == colour[u]) {
                        ok = false;
                        break;
                    }
                }
            }
        }
        if (ok) best = cnt;
    }
    return best;
}`,
      explanation: [
        "Adjacency is stored as a bitmask per vertex so membership tests inside a candidate subset are single bit operations. Enumerate all 2^n subsets and 2-colour the induced subgraph of each.",
        "Correctness rests on the same odd-cycle theorem: the induced subgraph is bipartite exactly when the DFS 2-colouring finds no same-colour edge among the selected vertices. Deleting vertices can only destroy odd cycles, never create them, so the property is monotone downward and the largest feasible subset is a well-posed answer. Choosing which vertices to delete is the hard part, which is why exhaustive enumeration is used - the problem is NP-hard in general.",
        "The prune that skips subsets no larger than the current best cuts most of the work. Time: O(2^n * n^2). Space: O(n).",
      ],
    },
  ],
};
