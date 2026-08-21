import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Minimum Edges to Disconnect s From t",
      difficulty: "Medium",
      variation: "Unit-capacity min cut",
      question: [
        "You are given a directed graph with n vertices numbered 0..n-1 and a list of edges. Return the minimum number of edges that must be removed so that there is no path from s to t.",
        "Example 1:\nInput: n = 4, edges = [[0,1],[0,2],[1,3],[2,3]], s = 0, t = 3\nOutput: 2\nExplanation: Two edge-disjoint paths exist (0-1-3 and 0-2-3), so at least two edges must go.",
        "Constraints:\n- 2 <= n <= 200\n- 1 <= edges.length <= 5000\n- s != t",
      ],
      code: `struct Dinic {
    struct Edge { int to; long long cap; };
    vector<Edge> edges;
    vector<vector<int>> adj;
    vector<int> level, iter;
    int n;

    Dinic(int n) : adj(n), level(n), iter(n), n(n) {}

    void addEdge(int u, int v, long long cap) {
        adj[u].push_back(edges.size());
        edges.push_back({v, cap});
        adj[v].push_back(edges.size());
        edges.push_back({u, 0});
    }

    bool bfs(int s, int t) {
        fill(level.begin(), level.end(), -1);
        queue<int> q;
        level[s] = 0;
        q.push(s);
        while (!q.empty()) {
            int u = q.front(); q.pop();
            for (int id : adj[u]) {
                if (edges[id].cap > 0 && level[edges[id].to] == -1) {
                    level[edges[id].to] = level[u] + 1;
                    q.push(edges[id].to);
                }
            }
        }
        return level[t] != -1;
    }

    long long dfs(int u, int t, long long pushed) {
        if (u == t || pushed == 0) return pushed;
        for (int& cid = iter[u]; cid < (int)adj[u].size(); cid++) {
            int id = adj[u][cid];
            int v = edges[id].to;
            if (edges[id].cap <= 0 || level[v] != level[u] + 1) continue;
            long long got = dfs(v, t, min(pushed, edges[id].cap));
            if (got > 0) {
                edges[id].cap -= got;
                edges[id ^ 1].cap += got;
                return got;
            }
        }
        return 0;
    }

    long long maxflow(int s, int t) {
        long long flow = 0;
        while (bfs(s, t)) {
            fill(iter.begin(), iter.end(), 0);
            while (long long pushed = dfs(s, t, LLONG_MAX)) flow += pushed;
        }
        return flow;
    }
};

int minEdgesToDisconnect(int n, vector<vector<int>>& edges, int s, int t) {
    Dinic din(n);
    for (auto& e : edges) din.addEdge(e[0], e[1], 1);
    return (int)din.maxflow(s, t);
}`,
      explanation: [
        "By the max-flow min-cut theorem the minimum number of edges whose removal separates s from t equals the maximum number of edge-disjoint s-t paths. Giving every edge capacity 1 makes the max flow count exactly those paths.",
        "This is Menger's theorem in its edge form. The whole trick is recognising a removal-counting question as a flow question.",
        "Time: O(E * sqrt(E)) for unit capacities with Dinic. Space: O(V + E).",
      ],
    },
    {
      name: "Recover the Cut Edges From the Residual Graph",
      difficulty: "Medium",
      variation: "Residual-graph cut recovery",
      question: [
        "Given a directed graph with capacities, a source s and a sink t, return the actual set of edges forming a minimum s-t cut, not just its total weight.",
        "Example 1:\nInput: n = 4, edges = [[0,1,3],[0,2,2],[1,3,2],[2,3,3]], s = 0, t = 3\nOutput: [[1,3],[0,2]]\nExplanation: Max flow is 4; cutting edge 1->3 (capacity 2) and edge 0->2 (capacity 2) separates s from t at total cost 4.",
        "Constraints:\n- 2 <= n <= 200\n- Capacities are positive integers",
      ],
      code: `struct Dinic {
    struct Edge { int from, to; long long cap; };
    vector<Edge> edges;
    vector<vector<int>> adj;
    vector<int> level, iter;
    int n;

    Dinic(int n) : adj(n), level(n), iter(n), n(n) {}

    void addEdge(int u, int v, long long cap) {
        adj[u].push_back(edges.size());
        edges.push_back({u, v, cap});
        adj[v].push_back(edges.size());
        edges.push_back({v, u, 0});
    }

    bool bfs(int s, int t) {
        fill(level.begin(), level.end(), -1);
        queue<int> q;
        level[s] = 0;
        q.push(s);
        while (!q.empty()) {
            int u = q.front(); q.pop();
            for (int id : adj[u])
                if (edges[id].cap > 0 && level[edges[id].to] == -1) {
                    level[edges[id].to] = level[u] + 1;
                    q.push(edges[id].to);
                }
        }
        return level[t] != -1;
    }

    long long dfs(int u, int t, long long pushed) {
        if (u == t || pushed == 0) return pushed;
        for (int& cid = iter[u]; cid < (int)adj[u].size(); cid++) {
            int id = adj[u][cid];
            int v = edges[id].to;
            if (edges[id].cap <= 0 || level[v] != level[u] + 1) continue;
            long long got = dfs(v, t, min(pushed, edges[id].cap));
            if (got > 0) {
                edges[id].cap -= got;
                edges[id ^ 1].cap += got;
                return got;
            }
        }
        return 0;
    }

    long long maxflow(int s, int t) {
        long long flow = 0;
        while (bfs(s, t)) {
            fill(iter.begin(), iter.end(), 0);
            while (long long pushed = dfs(s, t, LLONG_MAX)) flow += pushed;
        }
        return flow;
    }

    vector<char> minCutSide(int s) {
        vector<char> side(n, 0);
        queue<int> q;
        side[s] = 1;
        q.push(s);
        while (!q.empty()) {
            int u = q.front(); q.pop();
            for (int id : adj[u])
                if (edges[id].cap > 0 && !side[edges[id].to]) {
                    side[edges[id].to] = 1;
                    q.push(edges[id].to);
                }
        }
        return side;
    }
};

vector<pair<int,int>> minCutEdges(int n, vector<vector<int>>& input, int s, int t) {
    Dinic din(n);
    for (auto& e : input) din.addEdge(e[0], e[1], e[2]);
    din.maxflow(s, t);
    vector<char> side = din.minCutSide(s);
    vector<pair<int,int>> cut;
    for (size_t id = 0; id < din.edges.size(); id += 2) {
        int u = din.edges[id].from, v = din.edges[id].to;
        if (side[u] && !side[v]) cut.push_back({u, v});
    }
    return cut;
}`,
      explanation: [
        "After max flow saturates, run one BFS from s in the residual graph. The reachable set S and its complement T form a minimum cut: every original edge from S to T must be saturated, or the BFS would have crossed it.",
        "Only forward edges (even indices) are inspected, so the reverse bookkeeping edges are not mistaken for real cut edges. The reported total always equals the max flow — that equality is the theorem.",
        "Time: O(maxflow cost + V + E). Space: O(V + E).",
      ],
    },
    {
      name: "Police Chase (Cutting Roads Between Two Cities)",
      difficulty: "Medium",
      variation: "Undirected min cut",
      link: "https://cses.fi/problemset/task/1695",
      question: [
        "A network of n cities is connected by m undirected roads. You want to cut the minimum number of roads so that city 1 and city n become disconnected. Output the number of roads to cut and the roads themselves.",
        "Example 1:\nInput: n = 4, m = 5, roads = [[1,2],[1,3],[2,3],[2,4],[3,4]]\nOutput: 2\n2 4\n3 4",
        "Constraints:\n- 2 <= n <= 500\n- 1 <= m <= 1000",
      ],
      code: `// Reuses the Dinic struct (with minCutSide) from question 2 of this bank.
vector<pair<int,int>> policeChase(int n, vector<pair<int,int>>& roads) {
    Dinic din(n + 1);
    for (auto& r : roads) {
        din.addEdge(r.first, r.second, 1);
        din.addEdge(r.second, r.first, 1);
    }
    din.maxflow(1, n);
    vector<char> side = din.minCutSide(1);
    vector<pair<int,int>> cut;
    for (auto& r : roads) {
        if (side[r.first] && !side[r.second]) cut.push_back({r.first, r.second});
        else if (side[r.second] && !side[r.first]) cut.push_back({r.second, r.first});
    }
    return cut;
}`,
      explanation: [
        "An undirected edge of capacity 1 is modelled as two opposing directed edges each of capacity 1. Each direction can carry flow independently, which is exactly the undirected semantics.",
        "The cut is then read off the residual reachability just as in the directed case: report every original road with one endpoint reachable from the source and the other not. Because roads are undirected, both orientations must be checked.",
        "Time: O(V * E) with Dinic on unit capacities. Space: O(V + E).",
      ],
    },
    {
      name: "Minimum Vertex Cut (Node Splitting)",
      difficulty: "Hard",
      variation: "Node splitting",
      question: [
        "Given an undirected graph and two non-adjacent vertices s and t, find the minimum number of vertices (other than s and t) whose removal disconnects s from t.",
        "Example 1:\nInput: n = 5, edges = [[0,1],[0,2],[1,3],[2,3],[3,4]], s = 0, t = 4\nOutput: 1\nExplanation: Removing vertex 3 alone disconnects 0 from 4, since every path passes through it.",
        "Constraints:\n- 3 <= n <= 200\n- s and t are not directly connected by an edge",
      ],
      code: `// Reuses the Dinic struct (with minCutSide) from question 2 of this bank.
int minVertexCut(int n, vector<pair<int,int>>& edges, int s, int t) {
    // Split every vertex v into v_in = v and v_out = v + n.
    Dinic din(2 * n);
    const long long INF = 1e18;
    for (int v = 0; v < n; v++) {
        long long cap = (v == s || v == t) ? INF : 1;
        din.addEdge(v, v + n, cap);
    }
    for (auto& e : edges) {
        din.addEdge(e.first + n, e.second, INF);
        din.addEdge(e.second + n, e.first, INF);
    }
    return (int)din.maxflow(s + n, t);
}`,
      explanation: [
        "Vertex capacities do not exist in a flow network, so each vertex v is split into an in-node and an out-node joined by an edge whose capacity is the cost of deleting v. Any path through v must traverse that internal edge.",
        "Real graph edges get infinite capacity so the minimum cut can never choose them — it is forced to cut internal vertex edges instead. Giving s and t infinite internal capacity protects them from being deleted. This is Menger's theorem in its vertex form.",
        "Time: O(V * E). Space: O(V + E).",
      ],
    },
    {
      name: "König's Theorem: Minimum Vertex Cover in a Bipartite Graph",
      difficulty: "Hard",
      variation: "König duality",
      question: [
        "Given a bipartite graph with left part of size n, right part of size m, and an edge list, return the size of a minimum vertex cover — the smallest set of vertices touching every edge — and the vertices themselves.",
        "Example 1:\nInput: n = 3, m = 3, edges = [[0,0],[0,1],[1,1],[2,2]]\nOutput: size 3, cover = left {0, 2}, right {1}\nExplanation: Maximum matching has size 3, so by König's theorem the minimum vertex cover also has size 3.",
        "Constraints:\n- 1 <= n, m <= 500\n- Edges only run between the two sides",
      ],
      code: `struct Cover { int size; vector<int> left, right; };

Cover minVertexCoverBipartite(int n, int m, vector<pair<int,int>>& edges) {
    vector<vector<int>> adj(n);
    for (auto& e : edges) adj[e.first].push_back(e.second);

    vector<int> matchL(n, -1), matchR(m, -1);
    vector<char> used;
    function<bool(int)> tryKuhn = [&](int u) -> bool {
        for (int v : adj[u]) {
            if (used[v]) continue;
            used[v] = 1;
            if (matchR[v] == -1 || tryKuhn(matchR[v])) {
                matchR[v] = u;
                matchL[u] = v;
                return true;
            }
        }
        return false;
    };
    int matching = 0;
    for (int u = 0; u < n; u++) {
        used.assign(m, 0);
        if (tryKuhn(u)) matching++;
    }

    // Alternating-path search from every unmatched left vertex.
    vector<char> visitL(n, 0), visitR(m, 0);
    function<void(int)> mark = [&](int u) {
        visitL[u] = 1;
        for (int v : adj[u]) {
            if (v == matchL[u] || visitR[v]) continue;
            visitR[v] = 1;
            if (matchR[v] != -1) mark(matchR[v]);
        }
    };
    for (int u = 0; u < n; u++)
        if (matchL[u] == -1 && !visitL[u]) mark(u);

    Cover out;
    for (int u = 0; u < n; u++) if (!visitL[u]) out.left.push_back(u);
    for (int v = 0; v < m; v++) if (visitR[v]) out.right.push_back(v);
    out.size = out.left.size() + out.right.size();
    return out;
}`,
      explanation: [
        "König's theorem states that in a bipartite graph the size of a maximum matching equals the size of a minimum vertex cover. The cover is not just a number — it can be constructed.",
        "The construction: find a maximum matching, then mark everything reachable by alternating paths starting from unmatched left vertices. The cover is the unmarked left vertices plus the marked right vertices. Every edge is covered because a marked-left to unmarked-right edge cannot exist without extending the alternating search.",
        "Time: O(V * E) for Kuhn plus O(V + E) for the marking. Space: O(V + E).",
      ],
    },
    {
      name: "Maximum Independent Set in a Bipartite Graph",
      difficulty: "Hard",
      variation: "Complement of the cover",
      question: [
        "Given a bipartite graph with left part of size n and right part of size m, return the size of a maximum independent set — the largest set of vertices with no edge between any two of them.",
        "Example 1:\nInput: n = 3, m = 3, edges = [[0,0],[0,1],[1,1],[2,2]]\nOutput: 3\nExplanation: Total vertices is 6 and the maximum matching is 3, so the maximum independent set is 6 - 3 = 3.",
        "Constraints:\n- 1 <= n, m <= 500\n- Edges only run between the two sides",
      ],
      code: `int maxIndependentSetBipartite(int n, int m, vector<pair<int,int>>& edges) {
    vector<vector<int>> adj(n);
    for (auto& e : edges) adj[e.first].push_back(e.second);
    vector<int> matchR(m, -1);
    vector<char> used;
    function<bool(int)> tryKuhn = [&](int u) -> bool {
        for (int v : adj[u]) {
            if (used[v]) continue;
            used[v] = 1;
            if (matchR[v] == -1 || tryKuhn(matchR[v])) {
                matchR[v] = u;
                return true;
            }
        }
        return false;
    };
    int matching = 0;
    for (int u = 0; u < n; u++) {
        used.assign(m, 0);
        if (tryKuhn(u)) matching++;
    }
    return n + m - matching;
}`,
      explanation: [
        "A set is independent exactly when its complement is a vertex cover, so the maximum independent set has size V minus the minimum vertex cover. Combined with König's theorem, that is V minus the maximum matching.",
        "This chain of two reductions is why bipartite independent set is easy while the general-graph version is NP-hard. The bipartite structure is doing all the work.",
        "Time: O(V * E). Space: O(V + E).",
      ],
    },
    {
      name: "Project Selection (Maximum Closure)",
      difficulty: "Hard",
      variation: "Maximum closure",
      question: [
        "You may run projects, each with a profit (possibly negative), but a project can only be run if all of its prerequisite projects are also run. Given profits[i] and a list of dependency pairs [a, b] meaning project a requires project b, return the maximum total profit achievable.",
        "Example 1:\nInput: profits = [10, -4, -3], deps = [[0,1],[0,2]]\nOutput: 3\nExplanation: Running project 0 forces projects 1 and 2, giving 10 - 4 - 3 = 3, which beats running nothing.",
        "Constraints:\n- 1 <= number of projects <= 200\n- -10^6 <= profits[i] <= 10^6",
      ],
      code: `// Reuses the Dinic struct (with minCutSide) from question 2 of this bank.
long long maxClosureProfit(vector<long long>& profits, vector<pair<int,int>>& deps) {
    int n = profits.size();
    int s = n, t = n + 1;
    Dinic din(n + 2);
    const long long INF = 1e18;
    long long positiveTotal = 0;
    for (int i = 0; i < n; i++) {
        if (profits[i] > 0) {
            positiveTotal += profits[i];
            din.addEdge(s, i, profits[i]);
        } else if (profits[i] < 0) {
            din.addEdge(i, t, -profits[i]);
        }
    }
    for (auto& d : deps) din.addEdge(d.first, d.second, INF);
    return positiveTotal - din.maxflow(s, t);
}`,
      explanation: [
        "Sum every positive profit first, then use a min cut to decide what to give back. Profitable projects hang off the source with their profit as capacity; costly ones point at the sink with their cost as capacity.",
        "Dependencies get infinite capacity, so the cut can never sever a dependency — it must instead either abandon the profitable project or pay for the prerequisite. The min cut is precisely the cheapest such compromise, so profit equals the positive total minus the max flow.",
        "Time: O(V^2 * E) worst case for Dinic. Space: O(V + E).",
      ],
    },
    {
      name: "Image Segmentation (Two-Label Energy Minimisation)",
      difficulty: "Hard",
      variation: "Two-label MRF",
      question: [
        "Each of n pixels must be labelled foreground or background. Labelling pixel i as foreground costs fg[i] and as background costs bg[i]. Additionally, each neighbouring pair (i, j) incurs a smoothing penalty p if the two receive different labels. Return the minimum total cost.",
        "Example 1:\nInput: n = 2, fg = [1, 5], bg = [5, 1], pairs = [[0,1]], p = 10\nOutput: 6\nExplanation: Labelling pixel 0 foreground and pixel 1 background would cost 1 + 1 but adds the penalty 10, for 12. Labelling both foreground costs 1 + 5 = 6 with no penalty, which is the minimum.",
        "Constraints:\n- 1 <= n <= 500\n- All costs are non-negative",
      ],
      code: `// Reuses the Dinic struct (with minCutSide) from question 2 of this bank.
long long minSegmentationCost(vector<long long>& fg, vector<long long>& bg,
                              vector<pair<int,int>>& pairs, long long penalty) {
    int n = fg.size();
    int s = n, t = n + 1;
    Dinic din(n + 2);
    for (int i = 0; i < n; i++) {
        din.addEdge(s, i, bg[i]);
        din.addEdge(i, t, fg[i]);
    }
    for (auto& pr : pairs) {
        din.addEdge(pr.first, pr.second, penalty);
        din.addEdge(pr.second, pr.first, penalty);
    }
    return din.maxflow(s, t);
}`,
      explanation: [
        "Cutting the source edge of a pixel means labelling it foreground and paying bg[i]; cutting its sink edge means background and paying fg[i]. Exactly one of the two is cut for each pixel, so every cut corresponds to a valid labelling.",
        "A symmetric pair of penalty edges between neighbours is cut only when the two pixels end up on opposite sides, contributing the smoothing penalty exactly once. Minimising the cut therefore minimises the total energy.",
        "Note this works because the penalty is submodular (equal labels are never penalised); non-submodular energies are not min-cut solvable.",
        "Time: O(V^2 * E). Space: O(V + E).",
      ],
    },
    {
      name: "Verify Max-Flow Optimality With a Cut Certificate",
      difficulty: "Medium",
      variation: "Duality certificate",
      question: [
        "Given a flow network and a claimed maximum flow value F together with the per-edge flow assignment, verify that F really is optimal by exhibiting an s-t cut of capacity F. Return true if such a cut exists and the flow is feasible, false otherwise.",
        "Example 1:\nInput: n = 3, edges = [[0,1,2],[1,2,2]], s = 0, t = 2, claimed F = 2 with both edges carrying 2\nOutput: true\nExplanation: The cut {0} versus {1,2} has capacity 2, matching the flow, so 2 is optimal.",
        "Constraints:\n- 2 <= n <= 200\n- Capacities and flows are non-negative integers",
      ],
      code: `bool verifyMaxFlow(int n, vector<array<long long,4>>& edges, int s, int t, long long F) {
    // edges[i] = {u, v, capacity, flow}
    vector<long long> net(n, 0);
    for (auto& e : edges) {
        if (e[3] < 0 || e[3] > e[2]) return false;   // capacity violated
        net[e[0]] -= e[3];
        net[e[1]] += e[3];
    }
    for (int v = 0; v < n; v++) {
        if (v == s || v == t) continue;
        if (net[v] != 0) return false;               // conservation violated
    }
    if (net[t] != F) return false;

    // BFS in the residual graph from s.
    vector<vector<pair<int,long long>>> res(n);
    for (auto& e : edges) {
        if (e[2] - e[3] > 0) res[e[0]].push_back({(int)e[1], e[2] - e[3]});
        if (e[3] > 0) res[e[1]].push_back({(int)e[0], e[3]});
    }
    vector<char> side(n, 0);
    queue<int> q;
    side[s] = 1;
    q.push(s);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (auto& [v, c] : res[u])
            if (!side[v]) { side[v] = 1; q.push(v); }
    }
    if (side[t]) return false;                       // augmenting path remains

    long long cutCapacity = 0;
    for (auto& e : edges)
        if (side[e[0]] && !side[e[1]]) cutCapacity += e[2];
    return cutCapacity == F;
}`,
      explanation: [
        "Weak duality says every flow is at most every cut, so a flow and a cut of equal value prove each other optimal. This turns optimality into something checkable without recomputing the flow.",
        "The check has three parts: the flow respects capacities and conservation, no augmenting path remains in the residual graph, and the induced cut capacity equals F. The middle condition is what the theorem hinges on.",
        "Time: O(V + E). Space: O(V + E).",
      ],
    },
    {
      name: "Minimum Cost to Separate Two Regions on a Grid",
      difficulty: "Hard",
      variation: "Grid min cut",
      question: [
        "You are given an m x n grid where each cell has a positive removal cost. Some cells are marked as source region and some as sink region. Return the minimum total cost of removing cells so that no 4-directionally connected path of remaining cells joins the source region to the sink region. Source and sink cells cannot be removed.",
        "Example 1:\nInput: grid costs = [[1,5,1],[1,5,1]], source = cell (0,0), sink = cell (0,2)\nOutput: 6\nExplanation: Two routes join the corners: the top row through (0,1), and the detour through row 1. Blocking both needs (0,1) at cost 5 plus one row-1 cell, cheapest being (1,0) at cost 1, for a total of 6.",
        "Constraints:\n- 1 <= m, n <= 60\n- 1 <= cost <= 10^6",
      ],
      code: `// Reuses the Dinic struct (with minCutSide) from question 2 of this bank.
long long minCostSeparate(vector<vector<long long>>& cost,
                          vector<pair<int,int>>& sources,
                          vector<pair<int,int>>& sinks) {
    int m = cost.size(), n = cost[0].size();
    int cells = m * n;
    auto inId  = [&](int r, int c) { return r * n + c; };
    auto outId = [&](int r, int c) { return cells + r * n + c; };
    int S = 2 * cells, T = 2 * cells + 1;
    Dinic din(2 * cells + 2);
    const long long INF = 1e18;

    vector<vector<char>> protectedCell(m, vector<char>(n, 0));
    for (auto& p : sources) protectedCell[p.first][p.second] = 1;
    for (auto& p : sinks) protectedCell[p.first][p.second] = 1;

    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++)
            din.addEdge(inId(r, c), outId(r, c),
                        protectedCell[r][c] ? INF : cost[r][c]);

    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++)
            for (int d = 0; d < 4; d++) {
                int nr = r + dr[d], nc = c + dc[d];
                if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
                din.addEdge(outId(r, c), inId(nr, nc), INF);
            }

    for (auto& p : sources) din.addEdge(S, inId(p.first, p.second), INF);
    for (auto& p : sinks) din.addEdge(outId(p.first, p.second), T, INF);
    return din.maxflow(S, T);
}`,
      explanation: [
        "Removing cells means cutting vertices, so each cell is split into an in-node and an out-node joined by an edge of capacity equal to its removal cost. Adjacency edges get infinite capacity so the cut is forced through cell-internal edges.",
        "Protected source and sink cells receive infinite internal capacity, which makes them uncuttable. The min cut then names exactly the cheapest set of removable cells forming a barrier.",
        "Time: O(V^2 * E) worst case; the grid structure keeps it well under that in practice. Space: O(m * n).",
      ],
    },
    {
      name: "Global Minimum Cut (Stoer-Wagner)",
      difficulty: "Hard",
      variation: "Global min cut",
      question: [
        "Given a weighted undirected graph as an n x n symmetric matrix, find the global minimum cut: the minimum total weight of edges whose removal splits the graph into two non-empty parts. Unlike an s-t cut, no terminals are fixed.",
        "Example 1:\nInput: n = 4, w = [[0,3,1,0],[3,0,0,1],[1,0,0,3],[0,1,3,0]]\nOutput: 2\nExplanation: Splitting {0,1} from {2,3} cuts edges of weight 1 and 1.",
        "Constraints:\n- 2 <= n <= 500\n- Weights are non-negative",
      ],
      code: `long long globalMinCut(vector<vector<long long>> w) {
    int n = w.size();
    vector<int> active(n);
    for (int i = 0; i < n; i++) active[i] = i;
    long long best = LLONG_MAX;

    while (active.size() > 1) {
        int m = active.size();
        vector<long long> weight(m, 0);
        vector<char> added(m, 0);
        int prev = -1, last = -1;
        for (int step = 0; step < m; step++) {
            int sel = -1;
            for (int i = 0; i < m; i++)
                if (!added[i] && (sel == -1 || weight[i] > weight[sel])) sel = i;
            added[sel] = 1;
            prev = last;
            last = sel;
            if (step == m - 1) {
                best = min(best, weight[sel]);
                // Merge the last two vertices of the ordering.
                for (int i = 0; i < m; i++) {
                    w[active[prev]][active[i]] += w[active[last]][active[i]];
                    w[active[i]][active[prev]] = w[active[prev]][active[i]];
                }
                active.erase(active.begin() + last);
                break;
            }
            for (int i = 0; i < m; i++)
                if (!added[i]) weight[i] += w[active[sel]][active[i]];
        }
    }
    return best;
}`,
      explanation: [
        "Stoer-Wagner repeatedly builds a maximum-adjacency ordering. The key lemma is that the last two vertices in such an ordering have a minimum cut separating them equal to the last vertex's accumulated weight, so that value is a candidate answer.",
        "Those two vertices are then merged and the process repeats, shrinking the graph by one vertex each phase. Over n-1 phases every possible split is implicitly considered, so the smallest candidate is the global min cut. No max-flow computation is needed.",
        "Time: O(V^3). Space: O(V^2).",
      ],
    },
    {
      name: "Maximum Edge-Disjoint Paths as a Cut Bound",
      difficulty: "Medium",
      variation: "Menger's theorem",
      question: [
        "Given a directed graph, a source s and a sink t, return both the maximum number of pairwise edge-disjoint s-t paths and the minimum number of edges whose removal disconnects s from t, confirming that the two numbers agree.",
        "Example 1:\nInput: n = 5, edges = [[0,1],[0,2],[1,3],[2,3],[3,4]], s = 0, t = 4\nOutput: paths = 1, cut = 1\nExplanation: Every path must use edge 3->4, so only one edge-disjoint path exists and cutting that single edge suffices.",
        "Constraints:\n- 2 <= n <= 200\n- Edges are distinct",
      ],
      code: `// Reuses the Dinic struct (with minCutSide) from question 2 of this bank.
pair<int,int> disjointPathsAndCut(int n, vector<pair<int,int>>& edges, int s, int t) {
    Dinic din(n);
    for (auto& e : edges) din.addEdge(e.first, e.second, 1);
    int flow = (int)din.maxflow(s, t);
    vector<char> side = din.minCutSide(s);
    int cut = 0;
    for (auto& e : edges)
        if (side[e.first] && !side[e.second]) cut++;
    return {flow, cut};
}`,
      explanation: [
        "With unit capacities the max flow decomposes into that many edge-disjoint paths, and the residual cut counts the saturated edges crossing the frontier. Menger's theorem guarantees the two counts are equal.",
        "This pairing is a useful debugging habit: if your flow value and your recovered cut ever disagree, the bug is in the implementation, not the theory.",
        "Time: O(E * sqrt(E)) for unit capacities. Space: O(V + E).",
      ],
    },
    {
      name: "Maximum Profit Project Selection With Shared Resources",
      difficulty: "Hard",
      variation: "Closure with shared prerequisites",
      question: [
        "There are p projects, each with a revenue, and r machines, each with a purchase cost. Every project requires a specific subset of machines, and machines can be shared between projects. Choose a set of projects to maximise revenue minus the total cost of the machines needed. Return that maximum profit.",
        "Example 1:\nInput: revenue = [100, 200, 50], machineCost = [200, 100], needs = [[0],[0,1],[1]]\nOutput: 50\nExplanation: Taking all three projects earns 350 and needs both machines for 300, giving 50. Taking only project 2 earns 50 but needs machine 1 at 100, giving -50. No subset beats 50.",
        "Constraints:\n- 1 <= p, r <= 200\n- Revenues and costs are positive",
      ],
      code: `// Reuses the Dinic struct (with minCutSide) from question 2 of this bank.
long long maxProjectProfit(vector<long long>& revenue, vector<long long>& machineCost,
                           vector<vector<int>>& needs) {
    int p = revenue.size(), r = machineCost.size();
    int S = p + r, T = p + r + 1;
    Dinic din(p + r + 2);
    const long long INF = 1e18;
    long long totalRevenue = 0;
    for (int i = 0; i < p; i++) {
        totalRevenue += revenue[i];
        din.addEdge(S, i, revenue[i]);
        for (int machine : needs[i]) din.addEdge(i, p + machine, INF);
    }
    for (int j = 0; j < r; j++) din.addEdge(p + j, T, machineCost[j]);
    return totalRevenue - din.maxflow(S, T);
}`,
      explanation: [
        "This is the classic maximum-closure construction. Every project's revenue hangs off the source, every machine's cost points at the sink, and requirement edges carry infinite capacity.",
        "A finite cut must, for each project, either give up its revenue (cut the source edge) or pay for all machines it needs (cut those sink edges). Because a machine has a single sink edge, buying it once serves every project using it — sharing falls out naturally. Profit is total revenue minus the min cut.",
        "Time: O(V^2 * E). Space: O(V + E).",
      ],
    },
  ],
};
