import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Bridges in a Graph",
      difficulty: "Medium",
      variation: "Tarjan low-link bridges",
      link: "https://www.geeksforgeeks.org/bridge-in-a-graph/",
      question: [
        "Given an undirected graph with V vertices numbered 0 to V-1 and a list of edges, find all bridges. A bridge is an edge whose removal increases the number of connected components. Return the bridges as pairs of endpoints in any order.",
        "Example 1:\nInput: V = 5, edges = [[0,1],[1,2],[2,0],[1,3],[3,4]]\nOutput: [[3,4],[1,3]]\nExplanation: The triangle 0-1-2 has no bridge; the edges 1-3 and 3-4 hang off it and each disconnects a piece.",
        "Example 2:\nInput: V = 4, edges = [[0,1],[1,2],[2,3],[3,0]]\nOutput: []\nExplanation: A cycle has no bridge, since every edge has an alternative route.",
        "Constraints:\n- 1 <= V <= 10^5\n- 0 <= edges.length <= 2 * 10^5\n- The graph is simple: no self loops and no repeated edges\n- The graph may be disconnected",
      ],
      code: `vector<vector<int>> findBridges(int V, vector<vector<int>>& edges) {
    vector<vector<int>> adj(V);
    for (auto& e : edges) {
        adj[e[0]].push_back(e[1]);
        adj[e[1]].push_back(e[0]);
    }
    vector<int> tin(V, -1), low(V, 0);
    vector<vector<int>> bridges;
    int timer = 0;
    function<void(int,int)> dfs = [&](int u, int parent) {
        tin[u] = low[u] = timer++;
        for (int v : adj[u]) {
            if (v == parent) continue;
            if (tin[v] != -1) {
                low[u] = min(low[u], tin[v]);
            } else {
                dfs(v, u);
                low[u] = min(low[u], low[v]);
                if (low[v] > tin[u]) bridges.push_back({u, v});
            }
        }
    };
    for (int i = 0; i < V; i++) {
        if (tin[i] == -1) dfs(i, -1);
    }
    return bridges;
}`,
      explanation: [
        "A depth-first search on an undirected graph produces only tree edges and back edges, never cross edges. tin[u] is u's discovery time and low[u] is the smallest discovery time reachable from u's subtree using subtree tree edges plus at most one back edge.",
        "The bridge test is the strict inequality low[v] > tin[u] on a tree edge u to v. It says nothing inside v's subtree has a back edge to u or to any earlier vertex, so the only route out of that subtree is the edge u-v itself, making it a bridge. If low[v] equalled tin[u] there would be a back edge landing on u, giving an alternative route and no bridge.",
        "Skipping only the parent vertex, rather than every already-visited vertex, is essential: back edges must be allowed to lower low[u], and treating them as forbidden would make every edge look like a bridge.",
        "Time: O(V + E). Space: O(V + E).",
      ],
    },
    {
      name: "Count Bridges with Parallel Edges",
      difficulty: "Medium",
      variation: "Parent edge id instead of parent vertex",
      question: [
        "Given an undirected multigraph with n vertices numbered 0 to n-1 and a list of m edges that may contain repeated pairs and self loops, return the number of bridges. Two parallel edges between the same pair of vertices are never bridges, since either one can substitute for the other.",
        "Example 1:\nInput: n = 3, edges = [[0,1],[0,1],[1,2]]\nOutput: 1\nExplanation: The doubled edge 0-1 is not a bridge; only 1-2 is.",
        "Example 2:\nInput: n = 2, edges = [[0,1],[0,0]]\nOutput: 1\nExplanation: The self loop is never a bridge; the edge 0-1 is.",
        "Constraints:\n- 1 <= n <= 10^5\n- 0 <= m <= 2 * 10^5\n- Repeated edges and self loops are allowed",
      ],
      code: `int countBridges(int n, vector<vector<int>>& edges) {
    int m = edges.size();
    vector<vector<pair<int,int>>> adj(n);
    for (int i = 0; i < m; i++) {
        adj[edges[i][0]].push_back(make_pair(edges[i][1], i));
        adj[edges[i][1]].push_back(make_pair(edges[i][0], i));
    }
    vector<int> tin(n, -1), low(n, 0), it(n, 0), pe(n, -1), st;
    int timer = 0, bridges = 0;
    for (int s = 0; s < n; s++) {
        if (tin[s] != -1) continue;
        tin[s] = low[s] = timer++;
        st.push_back(s);
        while (!st.empty()) {
            int u = st.back();
            if (it[u] < (int)adj[u].size()) {
                int v = adj[u][it[u]].first;
                int id = adj[u][it[u]].second;
                it[u]++;
                if (id == pe[u]) continue;
                if (tin[v] == -1) {
                    tin[v] = low[v] = timer++;
                    pe[v] = id;
                    st.push_back(v);
                } else {
                    low[u] = min(low[u], tin[v]);
                }
            } else {
                st.pop_back();
                if (!st.empty()) {
                    int p = st.back();
                    low[p] = min(low[p], low[u]);
                    if (low[u] > tin[p]) bridges++;
                }
            }
        }
    }
    return bridges;
}`,
      explanation: [
        "The classic v == parent guard breaks on parallel edges: the second copy of edge u-v would also be skipped, so u-v would wrongly look like a bridge. Storing an edge id with every adjacency entry and skipping only the exact edge the search arrived on fixes this, because the duplicate copy has a different id and is correctly treated as a back edge.",
        "Self loops are handled for free. A loop at u reaches u itself, which is already visited, so it only performs low[u] = min(low[u], tin[u]) and can never satisfy the strict bridge inequality.",
        "The traversal is iterative: st is the frame stack, it[u] is the resume position in u's adjacency list, and pe[u] is the id of the edge used to enter u. When a frame pops, the parent's low is relaxed and the bridge test low[child] > tin[parent] is applied, exactly mirroring the recursive version.",
        "Time: O(n + m). Space: O(n + m).",
      ],
    },
    {
      name: "Does the Network Stay Connected After Removing an Edge",
      difficulty: "Medium",
      variation: "Offline bridge lookup",
      question: [
        "You are given a connected undirected graph with n nodes numbered 0 to n-1 and m edges given as a list, plus q independent queries. Query i gives an edge index and asks whether the graph would still be connected if only that edge were removed. Return an array of booleans, one per query. Queries are independent: an edge removed for one query is restored for the next.",
        "Example 1:\nInput: n = 4, edges = [[0,1],[1,2],[2,0],[2,3]], queries = [0, 3]\nOutput: [true, false]\nExplanation: Edge 0 (0-1) lies on the triangle so the graph survives; edge 3 (2-3) is a bridge.",
        "Constraints:\n- 2 <= n <= 10^5\n- n-1 <= m <= 2 * 10^5\n- 1 <= q <= 2 * 10^5\n- The input graph is connected\n- 0 <= queries[i] < m",
      ],
      code: `vector<bool> staysConnected(int n, vector<vector<int>>& edges, vector<int>& queries) {
    int m = edges.size();
    vector<vector<pair<int,int>>> adj(n);
    for (int i = 0; i < m; i++) {
        adj[edges[i][0]].push_back(make_pair(edges[i][1], i));
        adj[edges[i][1]].push_back(make_pair(edges[i][0], i));
    }
    vector<int> tin(n, -1), low(n, 0);
    vector<char> isBridge(m, 0);
    int timer = 0;
    function<void(int,int)> dfs = [&](int u, int pid) {
        tin[u] = low[u] = timer++;
        for (auto& pr : adj[u]) {
            int v = pr.first, id = pr.second;
            if (id == pid) continue;
            if (tin[v] != -1) {
                low[u] = min(low[u], tin[v]);
            } else {
                dfs(v, id);
                low[u] = min(low[u], low[v]);
                if (low[v] > tin[u]) isBridge[id] = 1;
            }
        }
    };
    for (int i = 0; i < n; i++) {
        if (tin[i] == -1) dfs(i, -1);
    }
    vector<bool> ans;
    ans.reserve(queries.size());
    for (int q : queries) ans.push_back(!isBridge[q]);
    return ans;
}`,
      explanation: [
        "Answering each query by deleting the edge and re-running a connectivity check would cost O(q * (n + m)). Instead, note that a connected graph stays connected after deleting one edge exactly when that edge is not a bridge, which is the definition of a bridge.",
        "So one Tarjan pass precomputes a boolean per edge id and every query becomes an array lookup. This offline-precompute-then-answer shape is the standard way to turn per-query graph surgery into constant time.",
        "Marking bridges by edge id rather than by endpoint pair keeps the lookup exact even when the same pair appears twice, and lets the query reference the edge by its original index.",
        "Time: O(n + m + q). Space: O(n + m).",
      ],
    },
    {
      name: "Classify Edges as Critical or Redundant",
      difficulty: "Medium",
      variation: "Bridge complement equals cycle edges",
      question: [
        "Given a connected undirected simple graph with n nodes numbered 0 to n-1 and a list of edges, return the indices of the redundant edges: those that lie on at least one cycle, so that removing any single one of them keeps the graph connected. The remaining edges are the critical ones.",
        "Example 1:\nInput: n = 5, edges = [[0,1],[1,2],[2,0],[2,3],[3,4],[4,2]]\nOutput: [0,1,2,3,4,5]\nExplanation: Both triangles cover every edge, so no edge is critical.",
        "Example 2:\nInput: n = 4, edges = [[0,1],[1,2],[2,0],[2,3]]\nOutput: [0,1,2]\nExplanation: Edge index 3 (2-3) is the only critical edge.",
        "Constraints:\n- 2 <= n <= 10^5\n- n-1 <= edges.length <= 2 * 10^5\n- The graph is connected and simple",
      ],
      code: `vector<int> redundantEdges(int n, vector<vector<int>>& edges) {
    int m = edges.size();
    vector<vector<pair<int,int>>> adj(n);
    for (int i = 0; i < m; i++) {
        adj[edges[i][0]].push_back(make_pair(edges[i][1], i));
        adj[edges[i][1]].push_back(make_pair(edges[i][0], i));
    }
    vector<int> tin(n, -1), low(n, 0);
    vector<char> isBridge(m, 0);
    int timer = 0;
    function<void(int,int)> dfs = [&](int u, int pid) {
        tin[u] = low[u] = timer++;
        for (auto& pr : adj[u]) {
            int v = pr.first, id = pr.second;
            if (id == pid) continue;
            if (tin[v] != -1) {
                low[u] = min(low[u], tin[v]);
            } else {
                dfs(v, id);
                low[u] = min(low[u], low[v]);
                if (low[v] > tin[u]) isBridge[id] = 1;
            }
        }
    };
    for (int i = 0; i < n; i++) {
        if (tin[i] == -1) dfs(i, -1);
    }
    vector<int> res;
    for (int i = 0; i < m; i++) {
        if (!isBridge[i]) res.push_back(i);
    }
    return res;
}`,
      explanation: [
        "An undirected edge lies on a cycle if and only if it is not a bridge. If the edge is on a cycle, the rest of the cycle is an alternative route, so deleting it preserves connectivity. If it is not on a cycle, it is the unique route between the two sides and deleting it splits them.",
        "So the same low-link pass answers both questions at once: bridges are the critical edges and everything else is redundant. There is no separate cycle enumeration, which would be exponential.",
        "In a spanning-tree view, redundant edges are exactly the non-tree edges plus every tree edge covered by some back edge; the strict inequality low[v] > tin[u] is precisely the statement that no back edge covers the tree edge u-v.",
        "Time: O(n + m). Space: O(n + m).",
      ],
    },
    {
      name: "Articulation Points",
      difficulty: "Medium",
      variation: "Tarjan low-link cut vertices",
      link: "https://www.geeksforgeeks.org/articulation-points-or-cut-vertices-in-a-graph/",
      question: [
        "Given an undirected graph with V vertices numbered 0 to V-1 and an adjacency list adj, return all articulation points in sorted order. An articulation point (cut vertex) is a vertex whose removal, together with its incident edges, increases the number of connected components. If there is no articulation point, return the single-element list [-1].",
        "Example 1:\nInput: V = 5, adj = [[1,2],[0,2],[0,1,3],[2,4],[3]]\nOutput: [2,3]\nExplanation: Removing 2 detaches {3,4}; removing 3 detaches {4}.",
        "Example 2:\nInput: V = 3, adj = [[1,2],[0,2],[0,1]]\nOutput: [-1]\nExplanation: A triangle has no cut vertex.",
        "Constraints:\n- 1 <= V <= 10^5\n- 0 <= number of edges <= 2 * 10^5\n- The graph is simple and may be disconnected",
      ],
      code: `vector<int> articulationPoints(int V, vector<vector<int>>& adj) {
    vector<int> tin(V, -1), low(V, 0);
    vector<char> isCut(V, 0);
    int timer = 0;
    function<void(int,int)> dfs = [&](int u, int parent) {
        tin[u] = low[u] = timer++;
        int children = 0;
        for (int v : adj[u]) {
            if (v == parent) continue;
            if (tin[v] != -1) {
                low[u] = min(low[u], tin[v]);
            } else {
                dfs(v, u);
                low[u] = min(low[u], low[v]);
                children++;
                if (parent != -1 && low[v] >= tin[u]) isCut[u] = 1;
            }
        }
        if (parent == -1 && children > 1) isCut[u] = 1;
    };
    for (int i = 0; i < V; i++) {
        if (tin[i] == -1) dfs(i, -1);
    }
    vector<int> res;
    for (int i = 0; i < V; i++) {
        if (isCut[i]) res.push_back(i);
    }
    if (res.empty()) res.push_back(-1);
    return res;
}`,
      explanation: [
        "The cut-vertex test uses the non-strict inequality low[v] >= tin[u], unlike the strict low[v] > tin[u] used for bridges. For a vertex, a back edge landing exactly on u does not help: u is the thing being deleted, so a route that passes through u is not an alternative route. For an edge, a back edge landing on u does help, because u itself survives.",
        "The DFS root must be special-cased. The root has no parent, so the inequality would be satisfied by every child and would falsely flag every root. The correct rule is that the root is an articulation point exactly when it has two or more children in the DFS tree, because in an undirected DFS there are no cross edges, so two distinct root subtrees can only communicate through the root.",
        "A non-root u is a cut vertex as soon as one child subtree cannot climb above u; that subtree becomes its own component once u is gone.",
        "Time: O(V + E). Space: O(V).",
      ],
    },
    {
      name: "Network Single Point of Failure Audit",
      difficulty: "Medium",
      variation: "Components created by one cut vertex",
      question: [
        "A company network has n servers numbered 0 to n-1 and a list of undirected links; the network is currently connected. Auditing for single points of failure, report the worst case: the maximum number of connected pieces the network can be broken into by taking down exactly one server (that server itself is not counted as a piece). If no single server can break the network, return 1.",
        "Example 1:\nInput: n = 5, links = [[0,1],[1,2],[1,3],[3,4]]\nOutput: 3\nExplanation: Taking down server 1 leaves {0}, {2} and {3,4}, three pieces.",
        "Example 2:\nInput: n = 4, links = [[0,1],[1,2],[2,3],[3,0]]\nOutput: 1\nExplanation: A ring survives any single failure as one piece.",
        "Constraints:\n- 2 <= n <= 10^5\n- The network is connected and simple\n- 1 <= links.length <= 2 * 10^5",
      ],
      code: `int worstSinglePointOfFailure(int n, vector<vector<int>>& links) {
    vector<vector<int>> adj(n);
    for (auto& e : links) {
        adj[e[0]].push_back(e[1]);
        adj[e[1]].push_back(e[0]);
    }
    vector<int> tin(n, -1), low(n, 0);
    int timer = 0, best = 1;
    function<void(int,int)> dfs = [&](int u, int parent) {
        tin[u] = low[u] = timer++;
        int children = 0, separated = 0;
        for (int v : adj[u]) {
            if (v == parent) continue;
            if (tin[v] != -1) {
                low[u] = min(low[u], tin[v]);
            } else {
                dfs(v, u);
                low[u] = min(low[u], low[v]);
                children++;
                if (low[v] >= tin[u]) separated++;
            }
        }
        int pieces = (parent == -1) ? children : separated + 1;
        best = max(best, pieces);
    };
    dfs(0, -1);
    return best;
}`,
      explanation: [
        "Removing a non-root vertex u splits its DFS subtree exactly along the children v whose subtree cannot escape above u, that is low[v] >= tin[u]. Each such child subtree becomes its own piece, and everything else, including u's parent side and any child that does have a back edge above u, stays joined as one further piece. Hence pieces = separated + 1.",
        "The root is different because it has no parent side. Removing it leaves exactly one piece per DFS child subtree, since distinct root subtrees cannot be connected by any edge in an undirected DFS. Hence pieces = children, which also reproduces the standard rule that the root is a cut vertex only when it has at least two children.",
        "Taking the maximum over all vertices gives the worst-case fragmentation, and initialising the answer to 1 covers a 2-edge-connected network where no vertex is critical.",
        "Time: O(n + m). Space: O(n + m).",
      ],
    },
    {
      name: "Critical Connections in a Network",
      difficulty: "Hard",
      variation: "Tarjan bridges",
      link: "https://leetcode.com/problems/critical-connections-in-a-network/",
      question: [
        "There are n servers numbered 0 to n-1 connected by undirected server-to-server connections forming a network, where connections[i] = [ai, bi] represents a connection between ai and bi. Any server can reach any other server directly or indirectly. A critical connection is a connection that, if removed, will make some servers unable to reach some other server. Return all critical connections in the network in any order.",
        "Example 1:\nInput: n = 4, connections = [[0,1],[1,2],[2,0],[1,3]]\nOutput: [[1,3]]\nExplanation: [[3,1]] is also accepted.",
        "Example 2:\nInput: n = 2, connections = [[0,1]]\nOutput: [[0,1]]",
        "Constraints:\n- 2 <= n <= 10^5\n- n-1 <= connections.length <= 10^5\n- 0 <= ai, bi <= n-1\n- ai != bi\n- There are no repeated connections",
      ],
      code: `vector<vector<int>> criticalConnections(int n, vector<vector<int>>& connections) {
    vector<vector<int>> adj(n);
    for (auto& e : connections) {
        adj[e[0]].push_back(e[1]);
        adj[e[1]].push_back(e[0]);
    }
    vector<int> tin(n, -1), low(n, 0), it(n, 0), par(n, -1), st;
    vector<vector<int>> bridges;
    int timer = 0;
    tin[0] = low[0] = timer++;
    st.push_back(0);
    while (!st.empty()) {
        int u = st.back();
        if (it[u] < (int)adj[u].size()) {
            int v = adj[u][it[u]++];
            if (v == par[u]) continue;
            if (tin[v] == -1) {
                tin[v] = low[v] = timer++;
                par[v] = u;
                st.push_back(v);
            } else {
                low[u] = min(low[u], tin[v]);
            }
        } else {
            st.pop_back();
            if (!st.empty()) {
                int p = st.back();
                low[p] = min(low[p], low[u]);
                if (low[u] > tin[p]) bridges.push_back({p, u});
            }
        }
    }
    return bridges;
}`,
      explanation: [
        "Critical connections are exactly the bridges of the undirected graph, so this is the low-link algorithm applied to the LeetCode statement. The network is guaranteed connected, so a single search from server 0 covers everything.",
        "low[u] is the earliest discovery time reachable from u's subtree using at most one back edge. A tree edge p-u is a bridge when low[u] > tin[p]: no back edge from u's subtree reaches p or higher, so that edge is the only route between the subtree and the rest.",
        "The version here is iterative, because n can be 100000 and the graph can be one long path, which would overflow the recursion stack on many judges. st is the frame stack, it[u] is the resume index into u's adjacency list, and the parent's low relaxation plus the bridge test both happen at pop time.",
        "Because the input has no repeated connections, comparing against the parent vertex is safe; with parallel edges the parent edge id would have to be tracked instead.",
        "Time: O(n + m). Space: O(n + m).",
      ],
    },
    {
      name: "Articulation Points and the Pieces They Separate",
      difficulty: "Hard",
      variation: "Subtree sizes with low-link",
      question: [
        "Given a connected undirected simple graph with n nodes numbered 0 to n-1 and a list of edges, for every articulation point report the size of the largest connected piece that remains after that node is removed. Return a list of pairs (node, largestPieceSize) sorted by node.",
        "Example 1:\nInput: n = 5, edges = [[0,1],[1,2],[1,3],[3,4]]\nOutput: [[1,2],[3,3]]\nExplanation: Removing node 1 leaves {0}, {2} and {3,4}, so the largest piece has size 2. Removing node 3 leaves {4} and {0,1,2}, so the largest piece has size 3.",
        "Example 2:\nInput: n = 3, edges = [[0,1],[1,2],[2,0]]\nOutput: []\nExplanation: A triangle has no articulation point.",
        "Constraints:\n- 2 <= n <= 10^5\n- The graph is connected and simple\n- 1 <= edges.length <= 2 * 10^5",
      ],
      code: `vector<vector<int>> articulationImpact(int n, vector<vector<int>>& edges) {
    vector<vector<int>> adj(n);
    for (auto& e : edges) {
        adj[e[0]].push_back(e[1]);
        adj[e[1]].push_back(e[0]);
    }
    vector<int> tin(n, -1), low(n, 0), sz(n, 1), largest(n, -1);
    int timer = 0;
    function<void(int,int)> dfs = [&](int u, int parent) {
        tin[u] = low[u] = timer++;
        int children = 0, sepSum = 0, bestChild = 0;
        for (int v : adj[u]) {
            if (v == parent) continue;
            if (tin[v] != -1) {
                low[u] = min(low[u], tin[v]);
            } else {
                dfs(v, u);
                sz[u] += sz[v];
                low[u] = min(low[u], low[v]);
                children++;
                if (low[v] >= tin[u]) {
                    sepSum += sz[v];
                    bestChild = max(bestChild, sz[v]);
                }
            }
        }
        int rest = n - 1 - sepSum;
        bool isCut = (parent == -1) ? (children > 1) : (sepSum > 0);
        if (isCut) largest[u] = max(bestChild, rest);
    };
    dfs(0, -1);
    vector<vector<int>> res;
    for (int u = 0; u < n; u++) {
        if (largest[u] != -1) res.push_back({u, largest[u]});
    }
    return res;
}`,
      explanation: [
        "Compute DFS subtree sizes alongside tin and low. When u is removed, every child v with low[v] >= tin[u] takes its whole subtree away as an isolated piece of size sz[v]. Everything not in one of those subtrees, that is n - 1 - sepSum nodes, stays glued together, because each remaining child has a back edge above u and the parent side is connected through it.",
        "The largest surviving piece is therefore the maximum of the separated subtree sizes and that remainder. For the DFS root the remainder is automatically zero, since all of the root's children satisfy the inequality and their sizes total n - 1, so the same formula works once the root's cut condition is checked as children > 1 instead of sepSum > 0.",
        "That root special case is the only asymmetry in the whole algorithm: the root has no parent side, so the low[v] >= tin[u] test carries no information for it.",
        "Time: O(n + m). Space: O(n + m).",
      ],
    },
    {
      name: "Minimum Nodes to Remove to Disconnect a Graph",
      difficulty: "Hard",
      variation: "Vertex connectivity via cut vertices",
      question: [
        "Given an undirected simple graph with n nodes numbered 0 to n-1 and a list of edges, return the minimum number of nodes that must be removed to make the graph disconnected. It is guaranteed that removing at most two nodes suffices, and that n >= 3.",
        "Example 1:\nInput: n = 4, edges = [[0,1],[1,2],[2,3]]\nOutput: 1\nExplanation: Node 1 (or 2) is an articulation point.",
        "Example 2:\nInput: n = 4, edges = [[0,1],[1,2],[2,3],[3,0]]\nOutput: 2\nExplanation: The 4-cycle has no cut vertex, but removing two opposite nodes splits it.",
        "Constraints:\n- 3 <= n <= 10^5\n- 0 <= edges.length <= 2 * 10^5\n- The graph is simple\n- It is guaranteed that the answer is 0, 1 or 2",
      ],
      code: `int minNodesToDisconnect(int n, vector<vector<int>>& edges) {
    vector<vector<int>> adj(n);
    for (auto& e : edges) {
        adj[e[0]].push_back(e[1]);
        adj[e[1]].push_back(e[0]);
    }
    vector<int> tin(n, -1), low(n, 0);
    vector<char> isCut(n, 0);
    int timer = 0, roots = 0;
    function<void(int,int)> dfs = [&](int u, int parent) {
        tin[u] = low[u] = timer++;
        int children = 0;
        for (int v : adj[u]) {
            if (v == parent) continue;
            if (tin[v] != -1) {
                low[u] = min(low[u], tin[v]);
            } else {
                dfs(v, u);
                low[u] = min(low[u], low[v]);
                children++;
                if (parent != -1 && low[v] >= tin[u]) isCut[u] = 1;
            }
        }
        if (parent == -1 && children > 1) isCut[u] = 1;
    };
    for (int i = 0; i < n; i++) {
        if (tin[i] == -1) {
            roots++;
            dfs(i, -1);
        }
    }
    if (roots > 1) return 0;
    for (int i = 0; i < n; i++) {
        if (isCut[i]) return 1;
    }
    return 2;
}`,
      explanation: [
        "This asks for the vertex connectivity, capped at 2 by the guarantee. Zero removals suffice when the graph is already disconnected, which the search detects by starting more than one DFS root. One removal suffices exactly when an articulation point exists, which is the standard low-link test with the root handled as children > 1.",
        "If the graph is connected and has no cut vertex it is 2-vertex-connected, so at least two removals are needed, and the guarantee says two are enough, giving the answer 2.",
        "Without that guarantee this shortcut is wrong: general vertex connectivity is not decidable by low-link alone. A complete graph on four nodes has no cut vertex and no pair of nodes whose removal disconnects it, so its connectivity is 3. Computing vertex connectivity in general requires repeated max-flow between vertex-split pairs.",
        "Time: O(n + m). Space: O(n + m).",
      ],
    },
    {
      name: "2-Edge-Connected Components",
      difficulty: "Hard",
      variation: "Flood fill without crossing bridges",
      question: [
        "Given an undirected multigraph with n nodes numbered 0 to n-1 and a list of m edges, partition the nodes into 2-edge-connected components: maximal sets of nodes that remain mutually connected after any single edge is deleted. Return an array comp of length n where comp[i] is the component label of node i, labels starting at 0.",
        "Example 1:\nInput: n = 6, edges = [[0,1],[1,2],[2,0],[2,3],[3,4],[4,5],[5,3]]\nOutput: comp = [0,0,0,1,1,1]\nExplanation: The two triangles are the components; the bridge 2-3 separates them.",
        "Example 2:\nInput: n = 3, edges = [[0,1],[1,2]]\nOutput: comp = [0,1,2]\nExplanation: Both edges are bridges, so every node is alone.",
        "Constraints:\n- 1 <= n <= 10^5\n- 0 <= m <= 2 * 10^5\n- Repeated edges and self loops are allowed",
      ],
      code: `vector<int> twoEdgeConnectedComponents(int n, vector<vector<int>>& edges) {
    int m = edges.size();
    vector<vector<pair<int,int>>> adj(n);
    for (int i = 0; i < m; i++) {
        adj[edges[i][0]].push_back(make_pair(edges[i][1], i));
        adj[edges[i][1]].push_back(make_pair(edges[i][0], i));
    }
    vector<int> tin(n, -1), low(n, 0), it(n, 0), pe(n, -1), st;
    vector<char> isBridge(m, 0);
    int timer = 0;
    for (int s = 0; s < n; s++) {
        if (tin[s] != -1) continue;
        tin[s] = low[s] = timer++;
        st.push_back(s);
        while (!st.empty()) {
            int u = st.back();
            if (it[u] < (int)adj[u].size()) {
                int v = adj[u][it[u]].first;
                int id = adj[u][it[u]].second;
                it[u]++;
                if (id == pe[u]) continue;
                if (tin[v] == -1) {
                    tin[v] = low[v] = timer++;
                    pe[v] = id;
                    st.push_back(v);
                } else {
                    low[u] = min(low[u], tin[v]);
                }
            } else {
                st.pop_back();
                if (!st.empty()) {
                    int p = st.back();
                    low[p] = min(low[p], low[u]);
                    if (low[u] > tin[p]) isBridge[pe[u]] = 1;
                }
            }
        }
    }
    vector<int> comp(n, -1);
    int k = 0;
    for (int s = 0; s < n; s++) {
        if (comp[s] != -1) continue;
        comp[s] = k;
        st.push_back(s);
        while (!st.empty()) {
            int u = st.back();
            st.pop_back();
            for (auto& pr : adj[u]) {
                if (isBridge[pr.second]) continue;
                if (comp[pr.first] == -1) {
                    comp[pr.first] = k;
                    st.push_back(pr.first);
                }
            }
        }
        k++;
    }
    return comp;
}`,
      explanation: [
        "Two nodes survive the deletion of any single edge together exactly when no bridge lies on every path between them. So the 2-edge-connected components are precisely the connected components of the graph with all bridges deleted.",
        "The algorithm is therefore two phases: one low-link pass that marks each bridge by its edge id, then a plain flood fill that refuses to traverse marked edges. Marking by edge id, and skipping only the entry edge pe[u], keeps parallel edges correct: a doubled edge is never a bridge and never blocks the fill.",
        "Contracting each component to a single node turns the graph into a forest, which is the bridge tree used by later problems.",
        "Time: O(n + m). Space: O(n + m).",
      ],
    },
    {
      name: "Bridge Tree Construction",
      difficulty: "Hard",
      variation: "Contract 2-edge-connected components",
      question: [
        "Given a connected undirected simple graph with n nodes numbered 0 to n-1 and a list of m edges, build its bridge tree: contract every 2-edge-connected component to a single node and keep exactly the bridges as tree edges. Return the number of tree nodes k and the list of k-1 tree edges as pairs of component labels.",
        "Example 1:\nInput: n = 6, edges = [[0,1],[1,2],[2,0],[2,3],[3,4],[4,5],[5,3]]\nOutput: k = 2, treeEdges = [[0,1]]\nExplanation: The two triangles collapse to two nodes joined by the bridge 2-3.",
        "Example 2:\nInput: n = 4, edges = [[0,1],[1,2],[2,3]]\nOutput: k = 4, treeEdges = [[0,1],[1,2],[2,3]]\nExplanation: A path has no cycles, so the bridge tree is the path itself.",
        "Constraints:\n- 2 <= n <= 10^5\n- n-1 <= m <= 2 * 10^5\n- The graph is connected and simple",
      ],
      code: `pair<int, vector<vector<int>>> buildBridgeTree(int n, vector<vector<int>>& edges) {
    int m = edges.size();
    vector<vector<pair<int,int>>> adj(n);
    for (int i = 0; i < m; i++) {
        adj[edges[i][0]].push_back(make_pair(edges[i][1], i));
        adj[edges[i][1]].push_back(make_pair(edges[i][0], i));
    }
    vector<int> tin(n, -1), low(n, 0);
    vector<char> isBridge(m, 0);
    int timer = 0;
    function<void(int,int)> dfs = [&](int u, int pid) {
        tin[u] = low[u] = timer++;
        for (auto& pr : adj[u]) {
            int v = pr.first, id = pr.second;
            if (id == pid) continue;
            if (tin[v] != -1) {
                low[u] = min(low[u], tin[v]);
            } else {
                dfs(v, id);
                low[u] = min(low[u], low[v]);
                if (low[v] > tin[u]) isBridge[id] = 1;
            }
        }
    };
    dfs(0, -1);
    vector<int> comp(n, -1), st;
    int k = 0;
    for (int s = 0; s < n; s++) {
        if (comp[s] != -1) continue;
        comp[s] = k;
        st.push_back(s);
        while (!st.empty()) {
            int u = st.back();
            st.pop_back();
            for (auto& pr : adj[u]) {
                if (isBridge[pr.second]) continue;
                if (comp[pr.first] == -1) {
                    comp[pr.first] = k;
                    st.push_back(pr.first);
                }
            }
        }
        k++;
    }
    vector<vector<int>> treeEdges;
    for (int i = 0; i < m; i++) {
        if (isBridge[i]) treeEdges.push_back({comp[edges[i][0]], comp[edges[i][1]]});
    }
    return make_pair(k, treeEdges);
}`,
      explanation: [
        "Find the bridges, flood fill the 2-edge-connected components while refusing to cross bridges, then map each bridge to a pair of component labels. The result has no cycles: any cycle among components would need a non-bridge edge between two different components, and by construction every such edge stays inside one component.",
        "Since the input graph is connected, the result is a tree with exactly one node per component and one edge per bridge, so the number of tree edges is k - 1.",
        "The bridge tree is the standard preprocessing for questions like how many bridges lie on the path between two nodes, or which pairs get separated by a single failure. Those become simple tree path queries once the cyclic parts are collapsed.",
        "Time: O(n + m). Space: O(n + m).",
      ],
    },
    {
      name: "Count Pairs Separated by a Bridge",
      difficulty: "Hard",
      variation: "Bridge tree size combinatorics",
      question: [
        "Given a connected undirected simple graph with n nodes numbered 0 to n-1 and a list of edges, count the unordered pairs of distinct nodes (u, v) for which there exists at least one edge whose removal would disconnect u from v. Return the count.",
        "Example 1:\nInput: n = 6, edges = [[0,1],[1,2],[2,0],[2,3],[3,4],[4,5],[5,3]]\nOutput: 9\nExplanation: The bridge 2-3 separates the triangle {0,1,2} from {3,4,5}, giving 3 * 3 = 9 vulnerable pairs; pairs inside a triangle survive any single removal.",
        "Example 2:\nInput: n = 4, edges = [[0,1],[1,2],[2,3],[3,0]]\nOutput: 0\nExplanation: A cycle has no bridge, so no pair is vulnerable.",
        "Constraints:\n- 2 <= n <= 10^5\n- n-1 <= edges.length <= 2 * 10^5\n- The graph is connected and simple\n- The answer can exceed 32-bit range",
      ],
      code: `long long countVulnerablePairs(int n, vector<vector<int>>& edges) {
    int m = edges.size();
    vector<vector<pair<int,int>>> adj(n);
    for (int i = 0; i < m; i++) {
        adj[edges[i][0]].push_back(make_pair(edges[i][1], i));
        adj[edges[i][1]].push_back(make_pair(edges[i][0], i));
    }
    vector<int> tin(n, -1), low(n, 0);
    vector<char> isBridge(m, 0);
    int timer = 0;
    function<void(int,int)> dfs = [&](int u, int pid) {
        tin[u] = low[u] = timer++;
        for (auto& pr : adj[u]) {
            int v = pr.first, id = pr.second;
            if (id == pid) continue;
            if (tin[v] != -1) {
                low[u] = min(low[u], tin[v]);
            } else {
                dfs(v, id);
                low[u] = min(low[u], low[v]);
                if (low[v] > tin[u]) isBridge[id] = 1;
            }
        }
    };
    dfs(0, -1);
    vector<int> comp(n, -1), st;
    int k = 0;
    for (int s = 0; s < n; s++) {
        if (comp[s] != -1) continue;
        comp[s] = k;
        st.push_back(s);
        while (!st.empty()) {
            int u = st.back();
            st.pop_back();
            for (auto& pr : adj[u]) {
                if (isBridge[pr.second]) continue;
                if (comp[pr.first] == -1) {
                    comp[pr.first] = k;
                    st.push_back(pr.first);
                }
            }
        }
        k++;
    }
    vector<long long> size(k, 0);
    for (int i = 0; i < n; i++) size[comp[i]]++;
    long long total = (long long)n * (n - 1) / 2;
    for (int c = 0; c < k; c++) total -= size[c] * (size[c] - 1) / 2;
    return total;
}`,
      explanation: [
        "A pair (u, v) is safe from every single-edge failure exactly when u and v are 2-edge-connected, that is when they share a 2-edge-connected component. Every other pair has at least one bridge on all of its routes and is therefore vulnerable.",
        "So the answer is the total number of pairs minus the pairs that live inside a single component: n choose 2 minus the sum of size choose 2 over components. No per-bridge accounting is needed, which avoids double counting pairs separated by several different bridges.",
        "With n up to 100000 the total pair count is about 5 * 10^9, so 64-bit arithmetic is mandatory.",
        "Time: O(n + m). Space: O(n + m).",
      ],
    },
    {
      name: "Longest Chain of Bridges",
      difficulty: "Hard",
      variation: "Bridge tree diameter",
      question: [
        "Given a connected undirected simple graph with n nodes numbered 0 to n-1 and a list of edges, find the maximum number of bridges that can appear on a single simple path between two nodes. Equivalently, contract the 2-edge-connected components and return the diameter of the resulting bridge tree, measured in edges.",
        "Example 1:\nInput: n = 7, edges = [[0,1],[1,2],[2,0],[2,3],[3,4],[4,5],[5,3],[5,6]]\nOutput: 2\nExplanation: The bridge tree is {0,1,2} - {3,4,5} - {6}, a path of two edges, so a route can cross at most two bridges.",
        "Example 2:\nInput: n = 4, edges = [[0,1],[1,2],[2,3],[3,0]]\nOutput: 0\nExplanation: No bridges exist, so the bridge tree is a single node.",
        "Constraints:\n- 2 <= n <= 10^5\n- n-1 <= edges.length <= 2 * 10^5\n- The graph is connected and simple",
      ],
      code: `int longestBridgeChain(int n, vector<vector<int>>& edges) {
    int m = edges.size();
    vector<vector<pair<int,int>>> adj(n);
    for (int i = 0; i < m; i++) {
        adj[edges[i][0]].push_back(make_pair(edges[i][1], i));
        adj[edges[i][1]].push_back(make_pair(edges[i][0], i));
    }
    vector<int> tin(n, -1), low(n, 0);
    vector<char> isBridge(m, 0);
    int timer = 0;
    function<void(int,int)> dfs = [&](int u, int pid) {
        tin[u] = low[u] = timer++;
        for (auto& pr : adj[u]) {
            int v = pr.first, id = pr.second;
            if (id == pid) continue;
            if (tin[v] != -1) {
                low[u] = min(low[u], tin[v]);
            } else {
                dfs(v, id);
                low[u] = min(low[u], low[v]);
                if (low[v] > tin[u]) isBridge[id] = 1;
            }
        }
    };
    dfs(0, -1);
    vector<int> comp(n, -1), st;
    int k = 0;
    for (int s = 0; s < n; s++) {
        if (comp[s] != -1) continue;
        comp[s] = k;
        st.push_back(s);
        while (!st.empty()) {
            int u = st.back();
            st.pop_back();
            for (auto& pr : adj[u]) {
                if (isBridge[pr.second]) continue;
                if (comp[pr.first] == -1) {
                    comp[pr.first] = k;
                    st.push_back(pr.first);
                }
            }
        }
        k++;
    }
    vector<vector<int>> tree(k);
    for (int i = 0; i < m; i++) {
        if (isBridge[i]) {
            int a = comp[edges[i][0]], b = comp[edges[i][1]];
            tree[a].push_back(b);
            tree[b].push_back(a);
        }
    }
    auto bfs = [&](int src) {
        vector<int> dist(k, -1);
        deque<int> q;
        dist[src] = 0;
        q.push_back(src);
        int far = src;
        while (!q.empty()) {
            int u = q.front();
            q.pop_front();
            if (dist[u] > dist[far]) far = u;
            for (int v : tree[u]) {
                if (dist[v] == -1) {
                    dist[v] = dist[u] + 1;
                    q.push_back(v);
                }
            }
        }
        return make_pair(far, dist[far]);
    };
    int a = bfs(0).first;
    return bfs(a).second;
}`,
      explanation: [
        "Bridges on a path between two nodes correspond exactly to edges of the bridge tree on the path between their components, because inside a 2-edge-connected component you can move without using any bridge. So the maximum bridge count is the bridge tree's diameter.",
        "Tree diameter is found with the two-BFS trick: a farthest node from any start is guaranteed to be an endpoint of some diameter, and a second BFS from it measures the diameter. This is valid on trees, though not on general graphs.",
        "When the whole graph is 2-edge-connected the bridge tree is a single node, both BFS runs return distance 0, and the answer is 0, which is correct.",
        "Time: O(n + m). Space: O(n + m).",
      ],
    },
    {
      name: "Biconnected Components",
      difficulty: "Hard",
      variation: "Edge-stack biconnected blocks",
      question: [
        "Given an undirected simple graph with n nodes numbered 0 to n-1 and a list of edges, decompose the edge set into biconnected components: maximal sets of edges such that any two edges of a set lie on a common simple cycle. Return the components as lists of edges. A bridge forms a component consisting of exactly that one edge.",
        "Example 1:\nInput: n = 5, edges = [[0,1],[1,2],[2,0],[2,3],[3,4],[4,2]]\nOutput: [[[4,2],[3,4],[2,3]], [[2,0],[1,2],[0,1]]]\nExplanation: Two triangles sharing the cut vertex 2; each triangle is its own block, popped in reverse push order.",
        "Example 2:\nInput: n = 3, edges = [[0,1],[1,2]]\nOutput: [[[1,2]], [[0,1]]]\nExplanation: Both edges are bridges, so each is a block by itself.",
        "Constraints:\n- 1 <= n <= 10^5\n- 0 <= edges.length <= 2 * 10^5\n- The graph is simple and may be disconnected",
      ],
      code: `vector<vector<pair<int,int>>> biconnectedComponents(int n, vector<vector<int>>& edges) {
    int m = edges.size();
    vector<vector<pair<int,int>>> adj(n);
    for (int i = 0; i < m; i++) {
        adj[edges[i][0]].push_back(make_pair(edges[i][1], i));
        adj[edges[i][1]].push_back(make_pair(edges[i][0], i));
    }
    vector<int> tin(n, -1), low(n, 0);
    vector<pair<int,int>> estk;
    vector<vector<pair<int,int>>> comps;
    int timer = 0;
    function<void(int,int)> dfs = [&](int u, int pid) {
        tin[u] = low[u] = timer++;
        for (auto& pr : adj[u]) {
            int v = pr.first, id = pr.second;
            if (id == pid) continue;
            if (tin[v] == -1) {
                estk.push_back(make_pair(u, v));
                dfs(v, id);
                low[u] = min(low[u], low[v]);
                if (low[v] >= tin[u]) {
                    vector<pair<int,int>> comp;
                    while (true) {
                        pair<int,int> e = estk.back();
                        estk.pop_back();
                        comp.push_back(e);
                        if (e.first == u && e.second == v) break;
                    }
                    comps.push_back(comp);
                }
            } else if (tin[v] < tin[u]) {
                estk.push_back(make_pair(u, v));
                low[u] = min(low[u], tin[v]);
            }
        }
    };
    for (int i = 0; i < n; i++) {
        if (tin[i] == -1) dfs(i, -1);
    }
    return comps;
}`,
      explanation: [
        "Biconnected components partition the edges, not the vertices: a cut vertex belongs to several blocks at once. So the algorithm keeps a stack of edges rather than vertices, pushing each tree edge before descending and each back edge that goes upward.",
        "The pop condition is the articulation-point inequality low[v] >= tin[u]. When it holds, every edge pushed since the tree edge u-v, including that edge, forms one complete block, and u is the articulation point that anchors it. This is the vertex-flavoured non-strict comparison, in contrast with the strict low[v] > tin[u] that detects bridges.",
        "The tin[v] < tin[u] guard on back edges makes each back edge pushed exactly once, from the deeper endpoint upward; without it every back edge would be pushed twice and blocks would contain duplicates.",
        "A bridge naturally comes out as a block of size one, because nothing is pushed between the tree edge and its pop.",
        "Time: O(n + m). Space: O(n + m).",
      ],
    },
  ],
};
