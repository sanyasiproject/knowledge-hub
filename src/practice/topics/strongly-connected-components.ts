import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Strongly Connected Components",
      difficulty: "Medium",
      variation: "Kosaraju two passes",
      link: "https://www.geeksforgeeks.org/strongly-connected-components/",
      question: [
        "Given a directed graph with V vertices numbered 0 to V-1 and an adjacency list adj, return the number of strongly connected components. Two vertices belong to the same strongly connected component when each is reachable from the other.",
        "Example 1:\nInput: V = 5, adj = [[2,3],[0],[1],[4],[]]\nOutput: 3\nExplanation: The components are {0,1,2}, {3} and {4}.",
        "Example 2:\nInput: V = 4, adj = [[1],[2],[3],[]]\nOutput: 4\nExplanation: The graph is a simple chain, so no two vertices are mutually reachable.",
        "Constraints:\n- 1 <= V <= 5 * 10^4\n- 0 <= number of edges <= 10^5\n- The graph may be disconnected and may contain self loops",
      ],
      code: `int kosaraju(int V, vector<vector<int>>& adj) {
    vector<int> order, it(V, 0), st;
    vector<char> vis(V, 0);
    for (int s = 0; s < V; s++) {
        if (vis[s]) continue;
        vis[s] = 1;
        st.push_back(s);
        while (!st.empty()) {
            int u = st.back();
            if (it[u] < (int)adj[u].size()) {
                int v = adj[u][it[u]++];
                if (!vis[v]) {
                    vis[v] = 1;
                    st.push_back(v);
                }
            } else {
                order.push_back(u);
                st.pop_back();
            }
        }
    }
    vector<vector<int>> rev(V);
    for (int u = 0; u < V; u++) {
        for (int v : adj[u]) rev[v].push_back(u);
    }
    fill(vis.begin(), vis.end(), 0);
    int comps = 0;
    for (int i = V - 1; i >= 0; i--) {
        int s = order[i];
        if (vis[s]) continue;
        comps++;
        vis[s] = 1;
        st.push_back(s);
        while (!st.empty()) {
            int u = st.back();
            st.pop_back();
            for (int v : rev[u]) {
                if (!vis[v]) {
                    vis[v] = 1;
                    st.push_back(v);
                }
            }
        }
    }
    return comps;
}`,
      explanation: [
        "Kosaraju runs two depth-first sweeps. The first sweep records vertices in order of finishing time. The second sweep walks the reversed graph, taking roots in decreasing finishing time; every vertex a root reaches in the reversed graph is exactly one strongly connected component.",
        "Why the finishing order works: collapse the graph into its component graph, which is acyclic. If component A has an edge to component B then some vertex of A finishes after every vertex of B, so the highest remaining finishing time always belongs to a source component of the part not yet processed. Starting a reversed-graph search from there cannot leak into another component, because leaking would require an edge back into a component that was already removed.",
        "Both passes are written iteratively with an explicit stack and a per-vertex edge cursor, so a chain of 50000 vertices cannot blow the call stack.",
        "Time: O(V + E). Space: O(V + E).",
      ],
    },
    {
      name: "Strongly Connected Components (Tarjan)",
      difficulty: "Medium",
      variation: "Tarjan low-link, single pass",
      question: [
        "Given a directed graph with n vertices numbered 0 to n-1 and an adjacency list adj, return the list of strongly connected components. Each component is a list of its vertex labels, and components may be returned in any internal order.",
        "Example 1:\nInput: n = 5, adj = [[1],[2],[0,3],[4],[3]]\nOutput: [[3,4],[0,1,2]]\nExplanation: {3,4} is a two-cycle and {0,1,2} is a three-cycle. Tarjan emits {3,4} first.",
        "Constraints:\n- 1 <= n <= 10^5\n- 0 <= number of edges <= 2 * 10^5\n- Self loops and repeated edges are allowed",
      ],
      code: `vector<vector<int>> tarjanSCC(int n, vector<vector<int>>& adj) {
    vector<int> tin(n, -1), low(n, 0), stk;
    vector<char> onStack(n, 0);
    vector<vector<int>> comps;
    int timer = 0;
    function<void(int)> dfs = [&](int u) {
        tin[u] = low[u] = timer++;
        stk.push_back(u);
        onStack[u] = 1;
        for (int v : adj[u]) {
            if (tin[v] == -1) {
                dfs(v);
                low[u] = min(low[u], low[v]);
            } else if (onStack[v]) {
                low[u] = min(low[u], tin[v]);
            }
        }
        if (low[u] == tin[u]) {
            vector<int> comp;
            while (true) {
                int v = stk.back();
                stk.pop_back();
                onStack[v] = 0;
                comp.push_back(v);
                if (v == u) break;
            }
            comps.push_back(comp);
        }
    };
    for (int i = 0; i < n; i++) {
        if (tin[i] == -1) dfs(i);
    }
    return comps;
}`,
      explanation: [
        "Tarjan keeps one stack of vertices that have been discovered but not yet assigned to a component. low[u] is the smallest discovery time reachable from u using tree edges plus at most one edge back to a vertex still on that stack.",
        "A vertex u with low[u] == tin[u] is the root of its component: nothing in its subtree can reach an earlier vertex that is still open, so everything above u on the stack forms exactly one strongly connected component and gets popped.",
        "The onStack check matters. An edge into an already-finished component must not update low[u], otherwise two separate components would be merged.",
        "Components come out in reverse topological order of the condensation graph, which is what makes Tarjan convenient for later DP over the condensation.",
        "Time: O(n + m). Space: O(n + m).",
      ],
    },
    {
      name: "Check if a Directed Graph is Strongly Connected",
      difficulty: "Medium",
      variation: "Two-direction reachability",
      question: [
        "Given a directed graph with n vertices numbered 0 to n-1 and an adjacency list adj, return true if the whole graph is a single strongly connected component, that is, every vertex can reach every other vertex.",
        "Example 1:\nInput: n = 4, adj = [[1],[2],[3],[0]]\nOutput: true\nExplanation: The graph is one directed cycle.",
        "Example 2:\nInput: n = 4, adj = [[1],[2],[3],[]]\nOutput: false\nExplanation: Vertex 3 cannot reach vertex 0.",
        "Constraints:\n- 1 <= n <= 10^5\n- 0 <= number of edges <= 2 * 10^5",
      ],
      code: `bool isStronglyConnected(int n, vector<vector<int>>& adj) {
    vector<vector<int>> rev(n);
    for (int u = 0; u < n; u++) {
        for (int v : adj[u]) rev[v].push_back(u);
    }
    auto reachesAll = [&](vector<vector<int>>& g) {
        vector<char> vis(n, 0);
        vector<int> st;
        st.push_back(0);
        vis[0] = 1;
        int seen = 1;
        while (!st.empty()) {
            int u = st.back();
            st.pop_back();
            for (int v : g[u]) {
                if (!vis[v]) {
                    vis[v] = 1;
                    seen++;
                    st.push_back(v);
                }
            }
        }
        return seen == n;
    };
    return reachesAll(adj) && reachesAll(rev);
}`,
      explanation: [
        "A graph is strongly connected exactly when one arbitrary vertex, here vertex 0, can reach everybody and everybody can reach it. The second half is checked by reaching everybody in the reversed graph, since a path from v to 0 in the original graph is a path from 0 to v in the reverse.",
        "Correctness: if 0 reaches every vertex and every vertex reaches 0, then for any u and v the walk u to 0 to v exists, so all pairs are mutually reachable. No full component decomposition is needed.",
        "This is cheaper than running Kosaraju and comparing the component count to one, because only two graph traversals are performed and no finishing order is stored.",
        "Time: O(n + m). Space: O(n + m).",
      ],
    },
    {
      name: "Find a Mother Vertex in a Graph",
      difficulty: "Medium",
      variation: "Last DFS root candidate",
      link: "https://www.geeksforgeeks.org/find-a-mother-vertex-in-a-graph/",
      question: [
        "Given a directed graph with V vertices numbered 0 to V-1, find a mother vertex: a vertex from which every other vertex is reachable. Return any such vertex, or -1 if none exists.",
        "Example 1:\nInput: V = 5, adj = [[1,2],[3],[3],[],[1]]\nOutput: -1\nExplanation: From 0 you reach 1, 2 and 3 but not 4, and from 4 you reach only 1 and 3, so no vertex reaches everything.",
        "Example 2:\nInput: V = 4, adj = [[1],[2],[3],[0]]\nOutput: 0\nExplanation: The graph is one cycle, so every vertex is a mother vertex.",
        "Constraints:\n- 1 <= V <= 10^5\n- 0 <= number of edges <= 2 * 10^5",
      ],
      code: `int findMotherVertex(int V, vector<vector<int>>& adj) {
    vector<char> vis(V, 0);
    vector<int> it(V, 0), st;
    int candidate = 0;
    for (int s = 0; s < V; s++) {
        if (vis[s]) continue;
        vis[s] = 1;
        st.push_back(s);
        while (!st.empty()) {
            int u = st.back();
            if (it[u] < (int)adj[u].size()) {
                int v = adj[u][it[u]++];
                if (!vis[v]) {
                    vis[v] = 1;
                    st.push_back(v);
                }
            } else {
                st.pop_back();
            }
        }
        candidate = s;
    }
    fill(vis.begin(), vis.end(), 0);
    vis[candidate] = 1;
    int seen = 1;
    st.push_back(candidate);
    while (!st.empty()) {
        int u = st.back();
        st.pop_back();
        for (int v : adj[u]) {
            if (!vis[v]) {
                vis[v] = 1;
                seen++;
                st.push_back(v);
            }
        }
    }
    return seen == V ? candidate : -1;
}`,
      explanation: [
        "Sweep the vertices in index order and start a depth-first search from every vertex not yet visited. The root of the last search started is the only possible mother vertex.",
        "Why: a mother vertex must live in a source component of the condensation, and it must be the unique source. The last search root was not reached by any earlier search, so no earlier vertex reaches it; if a mother vertex existed anywhere among the earlier vertices, it would have reached this root and the root would already be visited. So only the last root can qualify.",
        "The candidate still has to be verified with one more traversal, because a graph with two or more source components has no mother vertex at all.",
        "Time: O(V + E). Space: O(V).",
      ],
    },
    {
      name: "Flight Routes Check",
      difficulty: "Medium",
      variation: "Strong connectivity certificate",
      link: "https://cses.fi/problemset/task/1682",
      question: [
        "There are n cities and m one-way flight connections. Your task is to check whether you can travel from every city to every other city. Print YES if that is possible, otherwise print NO followed by two cities a and b such that there is no route from a to b. Cities are numbered 1 to n. Input: the first line has n and m, then m lines each with a and b meaning a flight from a to b.",
        "Example 1:\nInput:\n4 5\n1 2\n2 1\n3 4\n4 1\n1 3\nOutput:\nYES",
        "Example 2:\nInput:\n4 3\n1 2\n2 3\n3 4\nOutput:\nNO\n4 1",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= m <= 2 * 10^5\n- 1 <= a, b <= n",
      ],
      code: `#include <bits/stdc++.h>
using namespace std;

int n, m;

vector<char> reachableFromOne(vector<vector<int>>& g) {
    vector<char> vis(n + 1, 0);
    vector<int> st;
    st.push_back(1);
    vis[1] = 1;
    while (!st.empty()) {
        int u = st.back();
        st.pop_back();
        for (int v : g[u]) {
            if (!vis[v]) {
                vis[v] = 1;
                st.push_back(v);
            }
        }
    }
    return vis;
}

int main() {
    scanf("%d %d", &n, &m);
    vector<vector<int>> adj(n + 1), rev(n + 1);
    for (int i = 0; i < m; i++) {
        int a, b;
        scanf("%d %d", &a, &b);
        adj[a].push_back(b);
        rev[b].push_back(a);
    }
    vector<char> fwd = reachableFromOne(adj);
    for (int v = 1; v <= n; v++) {
        if (!fwd[v]) {
            printf("NO\\n1 %d\\n", v);
            return 0;
        }
    }
    vector<char> bwd = reachableFromOne(rev);
    for (int v = 1; v <= n; v++) {
        if (!bwd[v]) {
            printf("NO\\n%d 1\\n", v);
            return 0;
        }
    }
    printf("YES\\n");
    return 0;
}`,
      explanation: [
        "Instead of building the full condensation, anchor on city 1. Search forward from city 1; any city v it cannot reach is an immediate counterexample pair (1, v). Then search from city 1 in the reversed graph; any city v not reached there cannot reach city 1, giving the pair (v, 1).",
        "If both searches cover everything, city 1 reaches all and is reached by all, so any pair u to v is connected through city 1 and the answer is YES. That is the same certificate argument as the strong-connectivity check.",
        "Printing an explicit failing pair is what makes the anchor trick necessary: a plain component count would say NO without producing a witness.",
        "Time: O(n + m). Space: O(n + m).",
      ],
    },
    {
      name: "Planets and Kingdoms",
      difficulty: "Medium",
      variation: "Kosaraju component labelling",
      link: "https://cses.fi/problemset/task/1683",
      question: [
        "A game has n planets connected by m one-way teleporters. Two planets a and b belong to the same kingdom exactly when you can travel from a to b and from b to a. Print the number of kingdoms and then, for each planet 1 to n, the label of its kingdom. Labels must be between 1 and the number of kingdoms. Input: first line n and m, then m lines with a and b meaning a teleporter from a to b.",
        "Example 1:\nInput:\n5 6\n1 2\n2 3\n3 1\n3 4\n4 5\n5 4\nOutput:\n2\n1 1 1 2 2",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= m <= 2 * 10^5\n- 1 <= a, b <= n",
      ],
      code: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, m;
    scanf("%d %d", &n, &m);
    vector<vector<int>> adj(n), rev(n);
    for (int i = 0; i < m; i++) {
        int a, b;
        scanf("%d %d", &a, &b);
        a--; b--;
        adj[a].push_back(b);
        rev[b].push_back(a);
    }
    vector<int> order, it(n, 0), st;
    vector<char> vis(n, 0);
    for (int s = 0; s < n; s++) {
        if (vis[s]) continue;
        vis[s] = 1;
        st.push_back(s);
        while (!st.empty()) {
            int u = st.back();
            if (it[u] < (int)adj[u].size()) {
                int v = adj[u][it[u]++];
                if (!vis[v]) {
                    vis[v] = 1;
                    st.push_back(v);
                }
            } else {
                order.push_back(u);
                st.pop_back();
            }
        }
    }
    vector<int> comp(n, -1);
    int k = 0;
    for (int i = n - 1; i >= 0; i--) {
        int s = order[i];
        if (comp[s] != -1) continue;
        comp[s] = k;
        st.push_back(s);
        while (!st.empty()) {
            int u = st.back();
            st.pop_back();
            for (int v : rev[u]) {
                if (comp[v] == -1) {
                    comp[v] = k;
                    st.push_back(v);
                }
            }
        }
        k++;
    }
    printf("%d\\n", k);
    for (int i = 0; i < n; i++) {
        printf("%d%c", comp[i] + 1, i + 1 == n ? '\\n' : ' ');
    }
    return 0;
}`,
      explanation: [
        "This is Kosaraju used for its labels rather than just a count. Pass one pushes each planet onto an order list when its exploration finishes; pass two peels components off the reversed graph in decreasing finishing order and stamps every vertex it reaches with the current label.",
        "The reversed-graph search from the latest-finishing unlabeled vertex stays inside one component because that vertex sits in a source component of the still-unlabeled part, and reversing the edges turns its outgoing escape routes into incoming ones that lead only into already-labeled vertices.",
        "Both passes use an explicit stack. With n up to 100000 planets in a single chain, recursive DFS would overflow the stack on many judges.",
        "Time: O(n + m). Space: O(n + m).",
      ],
    },
    {
      name: "Largest Strongly Connected Component",
      difficulty: "Medium",
      variation: "Component size aggregation",
      question: [
        "Given a directed graph with n vertices numbered 0 to n-1 and a list of directed edges, return the number of vertices in the largest strongly connected component.",
        "Example 1:\nInput: n = 7, edges = [[0,1],[1,2],[2,0],[2,3],[3,4],[4,5],[5,3],[5,6]]\nOutput: 3\nExplanation: The components are {0,1,2}, {3,4,5} and {6}; the largest has size 3.",
        "Example 2:\nInput: n = 3, edges = [[0,1],[1,2]]\nOutput: 1\nExplanation: No cycle exists, so every component is a single vertex.",
        "Constraints:\n- 1 <= n <= 10^5\n- 0 <= edges.length <= 2 * 10^5\n- 0 <= edges[i][0], edges[i][1] < n",
      ],
      code: `int largestSCC(int n, vector<vector<int>>& edges) {
    vector<vector<int>> adj(n);
    for (auto& e : edges) adj[e[0]].push_back(e[1]);
    vector<int> tin(n, -1), low(n, 0), comp(n, -1), it(n, 0), stk, call;
    vector<char> onStack(n, 0);
    int timer = 0, k = 0;
    for (int s = 0; s < n; s++) {
        if (tin[s] != -1) continue;
        tin[s] = low[s] = timer++;
        stk.push_back(s);
        onStack[s] = 1;
        call.push_back(s);
        while (!call.empty()) {
            int u = call.back();
            if (it[u] < (int)adj[u].size()) {
                int v = adj[u][it[u]++];
                if (tin[v] == -1) {
                    tin[v] = low[v] = timer++;
                    stk.push_back(v);
                    onStack[v] = 1;
                    call.push_back(v);
                } else if (onStack[v]) {
                    low[u] = min(low[u], tin[v]);
                }
            } else {
                call.pop_back();
                if (low[u] == tin[u]) {
                    while (true) {
                        int v = stk.back();
                        stk.pop_back();
                        onStack[v] = 0;
                        comp[v] = k;
                        if (v == u) break;
                    }
                    k++;
                }
                if (!call.empty()) {
                    int p = call.back();
                    low[p] = min(low[p], low[u]);
                }
            }
        }
    }
    vector<int> size(k, 0);
    for (int i = 0; i < n; i++) size[comp[i]]++;
    int best = 0;
    for (int c = 0; c < k; c++) best = max(best, size[c]);
    return best;
}`,
      explanation: [
        "Label every vertex with its component using Tarjan, then bucket-count the labels and take the maximum bucket. The size question needs the labelling, not just the count, so a plain component counter is not enough.",
        "This version is iterative Tarjan: the call stack holds the recursion frames, it[u] remembers how far each vertex has scanned its adjacency list, and the parent's low value is relaxed with the child's low right after the child frame is popped, which is exactly what the recursive line low[u] = min(low[u], low[v]) does.",
        "Time: O(n + m). Space: O(n + m).",
      ],
    },
    {
      name: "Count Mutually Reachable Ordered Pairs",
      difficulty: "Medium",
      variation: "Component size combinatorics",
      question: [
        "Given a directed graph with n vertices numbered 0 to n-1 and a list of directed edges, count the ordered pairs (a, b) with a != b such that a can reach b and b can reach a. Return the count.",
        "Example 1:\nInput: n = 5, edges = [[0,1],[1,2],[2,0],[3,4]]\nOutput: 6\nExplanation: The only nontrivial component is {0,1,2}; it contributes 3 * 2 = 6 ordered pairs.",
        "Example 2:\nInput: n = 4, edges = [[0,1],[1,0],[2,3],[3,2]]\nOutput: 4\nExplanation: Two components of size 2, each contributing 2 * 1 = 2.",
        "Constraints:\n- 1 <= n <= 10^5\n- 0 <= edges.length <= 2 * 10^5\n- The answer can exceed 32-bit range",
      ],
      code: `long long countMutualPairs(int n, vector<vector<int>>& edges) {
    vector<vector<int>> adj(n);
    for (auto& e : edges) adj[e[0]].push_back(e[1]);
    vector<int> tin(n, -1), low(n, 0), comp(n, -1), it(n, 0), stk, call;
    vector<char> onStack(n, 0);
    int timer = 0, k = 0;
    for (int s = 0; s < n; s++) {
        if (tin[s] != -1) continue;
        tin[s] = low[s] = timer++;
        stk.push_back(s);
        onStack[s] = 1;
        call.push_back(s);
        while (!call.empty()) {
            int u = call.back();
            if (it[u] < (int)adj[u].size()) {
                int v = adj[u][it[u]++];
                if (tin[v] == -1) {
                    tin[v] = low[v] = timer++;
                    stk.push_back(v);
                    onStack[v] = 1;
                    call.push_back(v);
                } else if (onStack[v]) {
                    low[u] = min(low[u], tin[v]);
                }
            } else {
                call.pop_back();
                if (low[u] == tin[u]) {
                    while (true) {
                        int v = stk.back();
                        stk.pop_back();
                        onStack[v] = 0;
                        comp[v] = k;
                        if (v == u) break;
                    }
                    k++;
                }
                if (!call.empty()) low[call.back()] = min(low[call.back()], low[u]);
            }
        }
    }
    vector<long long> size(k, 0);
    for (int i = 0; i < n; i++) size[comp[i]]++;
    long long total = 0;
    for (int c = 0; c < k; c++) total += size[c] * (size[c] - 1);
    return total;
}`,
      explanation: [
        "Mutual reachability is an equivalence relation, and its classes are exactly the strongly connected components. So a and b are mutually reachable if and only if they carry the same component label.",
        "That turns the counting into pure arithmetic: a component of size s contributes s * (s - 1) ordered pairs of distinct vertices. Summing over components gives the answer without ever computing a transitive closure, which would cost O(n * m).",
        "The running total needs 64-bit arithmetic, since a single component of 100000 vertices already contributes about 10^10 pairs.",
        "Time: O(n + m). Space: O(n + m).",
      ],
    },
    {
      name: "Classify Edges as Cyclic or Acyclic",
      difficulty: "Medium",
      variation: "Intra-component vs condensation edges",
      question: [
        "Given a directed graph with n vertices numbered 0 to n-1 and a list of directed edges, an edge is called cyclic if it lies on at least one directed cycle. Return the number of cyclic edges. The remaining edges are the edges of the condensation graph and lie on no cycle.",
        "Example 1:\nInput: n = 4, edges = [[0,1],[1,2],[2,0],[2,3]]\nOutput: 3\nExplanation: Edges 0->1, 1->2 and 2->0 lie on the triangle; 2->3 does not.",
        "Example 2:\nInput: n = 2, edges = [[0,0],[0,1]]\nOutput: 1\nExplanation: The self loop 0->0 is a cycle of length one.",
        "Constraints:\n- 1 <= n <= 10^5\n- 0 <= edges.length <= 2 * 10^5\n- Self loops and repeated edges are allowed",
      ],
      code: `int countCyclicEdges(int n, vector<vector<int>>& edges) {
    vector<vector<int>> adj(n);
    for (auto& e : edges) adj[e[0]].push_back(e[1]);
    vector<int> tin(n, -1), low(n, 0), comp(n, -1), it(n, 0), stk, call;
    vector<char> onStack(n, 0);
    int timer = 0, k = 0;
    for (int s = 0; s < n; s++) {
        if (tin[s] != -1) continue;
        tin[s] = low[s] = timer++;
        stk.push_back(s);
        onStack[s] = 1;
        call.push_back(s);
        while (!call.empty()) {
            int u = call.back();
            if (it[u] < (int)adj[u].size()) {
                int v = adj[u][it[u]++];
                if (tin[v] == -1) {
                    tin[v] = low[v] = timer++;
                    stk.push_back(v);
                    onStack[v] = 1;
                    call.push_back(v);
                } else if (onStack[v]) {
                    low[u] = min(low[u], tin[v]);
                }
            } else {
                call.pop_back();
                if (low[u] == tin[u]) {
                    while (true) {
                        int v = stk.back();
                        stk.pop_back();
                        onStack[v] = 0;
                        comp[v] = k;
                        if (v == u) break;
                    }
                    k++;
                }
                if (!call.empty()) low[call.back()] = min(low[call.back()], low[u]);
            }
        }
    }
    int cyclic = 0;
    for (auto& e : edges) {
        if (comp[e[0]] == comp[e[1]]) cyclic++;
    }
    return cyclic;
}`,
      explanation: [
        "An edge u to v lies on a cycle exactly when v can get back to u, which is exactly when u and v share a strongly connected component. So after labelling, one linear scan over the edge list answers the question.",
        "The complement view is useful: every edge whose endpoints have different labels is an edge of the condensation graph, and the condensation is acyclic, so those edges can never be part of a cycle.",
        "A self loop is handled for free, because comp[u] == comp[u] is trivially true and a self loop really is a cycle of length one.",
        "Time: O(n + m). Space: O(n + m).",
      ],
    },
    {
      name: "Count Source and Sink Components",
      difficulty: "Medium",
      variation: "Condensation degree counting",
      question: [
        "Given a directed graph with n vertices numbered 0 to n-1 and a list of directed edges, build the condensation graph whose nodes are the strongly connected components. Return two numbers: the number of components with in-degree zero (source components) and the number with out-degree zero (sink components), where degrees count only edges between different components.",
        "Example 1:\nInput: n = 6, edges = [[0,1],[1,0],[1,2],[2,3],[3,2],[4,2]]\nOutput: [3, 2]\nExplanation: Components are {0,1}, {2,3}, {4}, {5}. Sources with in-degree zero are {0,1}, {4} and {5}. Sinks with out-degree zero are {2,3} and {5}; the isolated component {5} is counted on both sides.",
        "Example 2:\nInput: n = 3, edges = [[0,1],[1,2]]\nOutput: [1, 1]\nExplanation: Three single-vertex components in a chain; {0} is the only source and {2} the only sink.",
        "Constraints:\n- 1 <= n <= 10^5\n- 0 <= edges.length <= 2 * 10^5\n- An isolated component counts as both a source and a sink",
      ],
      code: `pair<int,int> countSourcesAndSinks(int n, vector<vector<int>>& edges) {
    vector<vector<int>> adj(n);
    for (auto& e : edges) adj[e[0]].push_back(e[1]);
    vector<int> tin(n, -1), low(n, 0), comp(n, -1), it(n, 0), stk, call;
    vector<char> onStack(n, 0);
    int timer = 0, k = 0;
    for (int s = 0; s < n; s++) {
        if (tin[s] != -1) continue;
        tin[s] = low[s] = timer++;
        stk.push_back(s);
        onStack[s] = 1;
        call.push_back(s);
        while (!call.empty()) {
            int u = call.back();
            if (it[u] < (int)adj[u].size()) {
                int v = adj[u][it[u]++];
                if (tin[v] == -1) {
                    tin[v] = low[v] = timer++;
                    stk.push_back(v);
                    onStack[v] = 1;
                    call.push_back(v);
                } else if (onStack[v]) {
                    low[u] = min(low[u], tin[v]);
                }
            } else {
                call.pop_back();
                if (low[u] == tin[u]) {
                    while (true) {
                        int v = stk.back();
                        stk.pop_back();
                        onStack[v] = 0;
                        comp[v] = k;
                        if (v == u) break;
                    }
                    k++;
                }
                if (!call.empty()) low[call.back()] = min(low[call.back()], low[u]);
            }
        }
    }
    vector<int> indeg(k, 0), outdeg(k, 0);
    for (auto& e : edges) {
        int a = comp[e[0]], b = comp[e[1]];
        if (a != b) {
            outdeg[a]++;
            indeg[b]++;
        }
    }
    int sources = 0, sinks = 0;
    for (int c = 0; c < k; c++) {
        if (indeg[c] == 0) sources++;
        if (outdeg[c] == 0) sinks++;
    }
    return {sources, sinks};
}`,
      explanation: [
        "Label all vertices with Tarjan, then walk the edge list once. Only edges whose endpoints have different labels become condensation edges; edges inside a component are dropped because they contribute nothing to the acyclic structure.",
        "A source component has no incoming condensation edge, so nothing outside it can reach it. A sink component has no outgoing condensation edge, so it can reach nothing outside itself. These two counts are the raw material for the minimum-edges-to-make-strongly-connected result.",
        "Parallel condensation edges are counted more than once, which is harmless here because only the zero versus nonzero distinction is used.",
        "Time: O(n + m). Space: O(n + m).",
      ],
    },
    {
      name: "Coin Collector",
      difficulty: "Hard",
      variation: "Condensation DAG DP",
      link: "https://cses.fi/problemset/task/1686",
      question: [
        "There are n rooms and m one-way teleporters. Each room has a certain number of coins. You may start in any room, move along teleporters as long as you like, and collect the coins of every room you visit, but each room's coins can be taken only once. What is the maximum number of coins you can collect? Input: the first line has n and m, the second line has n values k1..kn, then m lines each with a and b meaning a teleporter from a to b.",
        "Example 1:\nInput:\n4 4\n4 5 2 7\n1 2\n2 1\n1 3\n2 4\nOutput:\n16\nExplanation: Rooms 1 and 2 form a cycle worth 9 coins, then move to room 4 for 7 more.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= m <= 2 * 10^5\n- 1 <= ki <= 10^9\n- The answer needs 64-bit arithmetic",
      ],
      code: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, m;
    scanf("%d %d", &n, &m);
    vector<long long> coins(n);
    for (int i = 0; i < n; i++) scanf("%lld", &coins[i]);
    vector<vector<int>> adj(n);
    vector<pair<int,int>> edges(m);
    for (int i = 0; i < m; i++) {
        int a, b;
        scanf("%d %d", &a, &b);
        a--; b--;
        adj[a].push_back(b);
        edges[i] = make_pair(a, b);
    }
    vector<int> tin(n, -1), low(n, 0), comp(n, -1), it(n, 0), stk, call;
    vector<char> onStack(n, 0);
    int timer = 0, k = 0;
    for (int s = 0; s < n; s++) {
        if (tin[s] != -1) continue;
        tin[s] = low[s] = timer++;
        stk.push_back(s);
        onStack[s] = 1;
        call.push_back(s);
        while (!call.empty()) {
            int u = call.back();
            if (it[u] < (int)adj[u].size()) {
                int v = adj[u][it[u]++];
                if (tin[v] == -1) {
                    tin[v] = low[v] = timer++;
                    stk.push_back(v);
                    onStack[v] = 1;
                    call.push_back(v);
                } else if (onStack[v]) {
                    low[u] = min(low[u], tin[v]);
                }
            } else {
                call.pop_back();
                if (low[u] == tin[u]) {
                    while (true) {
                        int v = stk.back();
                        stk.pop_back();
                        onStack[v] = 0;
                        comp[v] = k;
                        if (v == u) break;
                    }
                    k++;
                }
                if (!call.empty()) low[call.back()] = min(low[call.back()], low[u]);
            }
        }
    }
    vector<long long> sum(k, 0), dp(k, 0);
    for (int i = 0; i < n; i++) sum[comp[i]] += coins[i];
    vector<vector<int>> dag(k);
    for (int i = 0; i < m; i++) {
        int a = comp[edges[i].first], b = comp[edges[i].second];
        if (a != b) dag[a].push_back(b);
    }
    long long best = 0;
    for (int c = 0; c < k; c++) {
        long long extra = 0;
        for (int d : dag[c]) extra = max(extra, dp[d]);
        dp[c] = sum[c] + extra;
        best = max(best, dp[c]);
    }
    printf("%lld\\n", best);
    return 0;
}`,
      explanation: [
        "Once you enter a strongly connected component you can tour all of it and come back, so the whole component behaves like a single super-room worth the sum of its coins. Collapsing components gives an acyclic condensation, and the answer is the maximum weight of a path in that DAG.",
        "Tarjan emits components in reverse topological order, so for any condensation edge c to d the label d is strictly smaller than c. Iterating labels from 0 upward therefore guarantees every successor's dp value is already final, and dp[c] = sum[c] + max over successors dp[d] needs no separate topological sort.",
        "Coins reach 10^9 per room and 10^5 rooms, so both the per-component sums and the dp must be 64-bit.",
        "Time: O(n + m). Space: O(n + m).",
      ],
    },
    {
      name: "Longest Path in the Condensation DAG",
      difficulty: "Hard",
      variation: "Condensation DAG DP",
      question: [
        "Given a directed graph with n vertices numbered 0 to n-1 and a list of directed edges, contract every strongly connected component to a single node to obtain the condensation DAG. Return the maximum number of condensation nodes on any directed path in that DAG (a single node counts as a path of length 1).",
        "Example 1:\nInput: n = 6, edges = [[0,1],[1,0],[1,2],[2,3],[3,2],[3,4],[4,5]]\nOutput: 4\nExplanation: The condensation is {0,1} -> {2,3} -> {4} -> {5}, a chain of 4 nodes.",
        "Example 2:\nInput: n = 3, edges = [[0,1],[1,2],[2,0]]\nOutput: 1\nExplanation: Everything collapses into one component.",
        "Constraints:\n- 1 <= n <= 10^5\n- 0 <= edges.length <= 2 * 10^5",
      ],
      code: `int longestCondensationPath(int n, vector<vector<int>>& edges) {
    vector<vector<int>> adj(n);
    for (auto& e : edges) adj[e[0]].push_back(e[1]);
    vector<int> tin(n, -1), low(n, 0), comp(n, -1), it(n, 0), stk, call;
    vector<char> onStack(n, 0);
    int timer = 0, k = 0;
    for (int s = 0; s < n; s++) {
        if (tin[s] != -1) continue;
        tin[s] = low[s] = timer++;
        stk.push_back(s);
        onStack[s] = 1;
        call.push_back(s);
        while (!call.empty()) {
            int u = call.back();
            if (it[u] < (int)adj[u].size()) {
                int v = adj[u][it[u]++];
                if (tin[v] == -1) {
                    tin[v] = low[v] = timer++;
                    stk.push_back(v);
                    onStack[v] = 1;
                    call.push_back(v);
                } else if (onStack[v]) {
                    low[u] = min(low[u], tin[v]);
                }
            } else {
                call.pop_back();
                if (low[u] == tin[u]) {
                    while (true) {
                        int v = stk.back();
                        stk.pop_back();
                        onStack[v] = 0;
                        comp[v] = k;
                        if (v == u) break;
                    }
                    k++;
                }
                if (!call.empty()) low[call.back()] = min(low[call.back()], low[u]);
            }
        }
    }
    vector<vector<int>> dag(k);
    for (auto& e : edges) {
        int a = comp[e[0]], b = comp[e[1]];
        if (a != b) dag[a].push_back(b);
    }
    vector<int> dp(k, 1);
    int best = 1;
    for (int c = 0; c < k; c++) {
        for (int d : dag[c]) dp[c] = max(dp[c], 1 + dp[d]);
        best = max(best, dp[c]);
    }
    return best;
}`,
      explanation: [
        "Longest path is NP-hard on general directed graphs only because of cycles. After contracting strongly connected components the graph is acyclic, so a straight DP over a topological order solves it.",
        "dp[c] is the longest chain of condensation nodes starting at c. Because Tarjan labels components in reverse topological order, every successor of c has a smaller label and is already resolved when c is processed, so a plain increasing loop is a valid evaluation order.",
        "Contracting is what makes the problem tractable: inside a component a walk could revisit nodes forever, and collapsing removes exactly that freedom while preserving reachability between components.",
        "Time: O(n + m). Space: O(n + m).",
      ],
    },
    {
      name: "Minimum Edges to Make a Graph Strongly Connected",
      difficulty: "Hard",
      variation: "Condensation sources and sinks",
      question: [
        "Given a directed graph with n vertices numbered 0 to n-1 and a list of directed edges, return the minimum number of directed edges that must be added so that the whole graph becomes strongly connected. If it is already strongly connected, return 0.",
        "Example 1:\nInput: n = 3, edges = [[0,1],[1,2]]\nOutput: 1\nExplanation: The condensation is a chain with one source and one sink; adding 2->0 closes it.",
        "Example 2:\nInput: n = 5, edges = [[0,1],[0,2],[3,1],[4,2]]\nOutput: 3\nExplanation: The condensation has 3 sources ({0}, {3}, {4}) and 2 sinks ({1}, {2}); the answer is max(3, 2) = 3.",
        "Constraints:\n- 1 <= n <= 10^5\n- 0 <= edges.length <= 2 * 10^5\n- For n == 1 the answer is 0",
      ],
      code: `int minEdgesToStronglyConnect(int n, vector<vector<int>>& edges) {
    vector<vector<int>> adj(n);
    for (auto& e : edges) adj[e[0]].push_back(e[1]);
    vector<int> tin(n, -1), low(n, 0), comp(n, -1), it(n, 0), stk, call;
    vector<char> onStack(n, 0);
    int timer = 0, k = 0;
    for (int s = 0; s < n; s++) {
        if (tin[s] != -1) continue;
        tin[s] = low[s] = timer++;
        stk.push_back(s);
        onStack[s] = 1;
        call.push_back(s);
        while (!call.empty()) {
            int u = call.back();
            if (it[u] < (int)adj[u].size()) {
                int v = adj[u][it[u]++];
                if (tin[v] == -1) {
                    tin[v] = low[v] = timer++;
                    stk.push_back(v);
                    onStack[v] = 1;
                    call.push_back(v);
                } else if (onStack[v]) {
                    low[u] = min(low[u], tin[v]);
                }
            } else {
                call.pop_back();
                if (low[u] == tin[u]) {
                    while (true) {
                        int v = stk.back();
                        stk.pop_back();
                        onStack[v] = 0;
                        comp[v] = k;
                        if (v == u) break;
                    }
                    k++;
                }
                if (!call.empty()) low[call.back()] = min(low[call.back()], low[u]);
            }
        }
    }
    if (k == 1) return 0;
    vector<int> indeg(k, 0), outdeg(k, 0);
    for (auto& e : edges) {
        int a = comp[e[0]], b = comp[e[1]];
        if (a != b) {
            outdeg[a]++;
            indeg[b]++;
        }
    }
    int sources = 0, sinks = 0;
    for (int c = 0; c < k; c++) {
        if (indeg[c] == 0) sources++;
        if (outdeg[c] == 0) sinks++;
    }
    return max(sources, sinks);
}`,
      explanation: [
        "Work on the condensation. Every source component needs at least one new incoming edge and every sink component needs at least one new outgoing edge, so the answer is at least max(sources, sinks).",
        "That bound is achievable. Pair sources with sinks by chaining a sink back to an unused source; each added edge fixes one source and one sink at the same time, and once the smaller side runs out the remaining components on the larger side are attached to any already-merged component. So exactly max(sources, sinks) edges suffice.",
        "The special case matters: if the graph already has a single component the formula would still return max(1, 1) = 1, because that lone component is both a source and a sink, so the k == 1 check must short-circuit to 0. A single isolated vertex is likewise already strongly connected.",
        "Time: O(n + m). Space: O(n + m).",
      ],
    },
    {
      name: "Check if a Directed Graph is Semi-Connected",
      difficulty: "Hard",
      variation: "Hamiltonian chain in the condensation",
      question: [
        "A directed graph is semi-connected if for every pair of vertices u and v, either u reaches v or v reaches u. Given n vertices numbered 0 to n-1 and a list of directed edges, return true if the graph is semi-connected.",
        "Example 1:\nInput: n = 4, edges = [[0,1],[1,2],[2,1],[2,3]]\nOutput: true\nExplanation: The condensation is {0} -> {1,2} -> {3}, a single chain, so every pair is comparable.",
        "Example 2:\nInput: n = 3, edges = [[0,1],[0,2]]\nOutput: false\nExplanation: Vertices 1 and 2 cannot reach each other in either direction.",
        "Constraints:\n- 1 <= n <= 10^5\n- 0 <= edges.length <= 2 * 10^5",
      ],
      code: `bool isSemiConnected(int n, vector<vector<int>>& edges) {
    vector<vector<int>> adj(n);
    for (auto& e : edges) adj[e[0]].push_back(e[1]);
    vector<int> tin(n, -1), low(n, 0), comp(n, -1), it(n, 0), stk, call;
    vector<char> onStack(n, 0);
    int timer = 0, k = 0;
    for (int s = 0; s < n; s++) {
        if (tin[s] != -1) continue;
        tin[s] = low[s] = timer++;
        stk.push_back(s);
        onStack[s] = 1;
        call.push_back(s);
        while (!call.empty()) {
            int u = call.back();
            if (it[u] < (int)adj[u].size()) {
                int v = adj[u][it[u]++];
                if (tin[v] == -1) {
                    tin[v] = low[v] = timer++;
                    stk.push_back(v);
                    onStack[v] = 1;
                    call.push_back(v);
                } else if (onStack[v]) {
                    low[u] = min(low[u], tin[v]);
                }
            } else {
                call.pop_back();
                if (low[u] == tin[u]) {
                    while (true) {
                        int v = stk.back();
                        stk.pop_back();
                        onStack[v] = 0;
                        comp[v] = k;
                        if (v == u) break;
                    }
                    k++;
                }
                if (!call.empty()) low[call.back()] = min(low[call.back()], low[u]);
            }
        }
    }
    if (k == 1) return true;
    vector<set<int>> dag(k);
    for (auto& e : edges) {
        int a = comp[e[0]], b = comp[e[1]];
        if (a != b) dag[a].insert(b);
    }
    for (int c = k - 1; c >= 1; c--) {
        if (dag[c].count(c - 1) == 0) return false;
    }
    return true;
}`,
      explanation: [
        "Vertices inside one strongly connected component always reach each other, so semi-connectivity depends only on the condensation. The condensation is semi-connected exactly when it has a directed Hamiltonian path, that is, when its topological order is a single chain with an edge between every consecutive pair.",
        "Tarjan labels components in reverse topological order, so labels k-1, k-2, ..., 0 already form the unique candidate topological order. Checking that an edge exists from label c to label c-1 for every c is therefore enough; if any consecutive pair is missing an edge, those two components are incomparable and the graph is not semi-connected.",
        "The consecutive-edge test is sufficient because a chain of edges through all components makes every earlier component reach every later one, and it is necessary because a missing consecutive edge means no path can bridge that gap in either direction.",
        "Time: O(n + m log m) because of the set lookups; using a sorted edge list instead makes it O(n + m). Space: O(n + m).",
      ],
    },
    {
      name: "Iterative Tarjan for Deep Graphs",
      difficulty: "Hard",
      variation: "Explicit-stack Tarjan low-link",
      question: [
        "Implement strongly connected component decomposition without recursion, so that it survives a graph that is one long chain of 10^6 vertices. Given n vertices numbered 0 to n-1 and an adjacency list adj, return an array comp of length n where comp[i] is the component label of vertex i, and labels are assigned in reverse topological order of the condensation starting from 0.",
        "Example 1:\nInput: n = 4, adj = [[1],[2],[1],[]]\nOutput: comp = [2,1,1,0]\nExplanation: {3} is emitted first as label 0, then {1,2} as label 1, then {0} as label 2.",
        "Constraints:\n- 1 <= n <= 10^6\n- 0 <= number of edges <= 2 * 10^6\n- Recursive DFS is not allowed",
      ],
      code: `vector<int> sccLabels(int n, vector<vector<int>>& adj) {
    vector<int> tin(n, -1), low(n, 0), comp(n, -1), it(n, 0), stk, call;
    vector<char> onStack(n, 0);
    int timer = 0, k = 0;
    stk.reserve(n);
    call.reserve(n);
    for (int s = 0; s < n; s++) {
        if (tin[s] != -1) continue;
        tin[s] = low[s] = timer++;
        stk.push_back(s);
        onStack[s] = 1;
        call.push_back(s);
        while (!call.empty()) {
            int u = call.back();
            if (it[u] < (int)adj[u].size()) {
                int v = adj[u][it[u]++];
                if (tin[v] == -1) {
                    tin[v] = low[v] = timer++;
                    stk.push_back(v);
                    onStack[v] = 1;
                    call.push_back(v);
                } else if (onStack[v]) {
                    low[u] = min(low[u], tin[v]);
                }
            } else {
                call.pop_back();
                if (low[u] == tin[u]) {
                    while (true) {
                        int v = stk.back();
                        stk.pop_back();
                        onStack[v] = 0;
                        comp[v] = k;
                        if (v == u) break;
                    }
                    k++;
                }
                if (!call.empty()) {
                    int p = call.back();
                    low[p] = min(low[p], low[u]);
                }
            }
        }
    }
    return comp;
}`,
      explanation: [
        "Two stacks are needed and they do different jobs. The call stack simulates recursion frames and is popped as soon as a vertex has scanned all of its edges. The component stack holds every discovered vertex whose component is still unknown and is popped only when a component root is found.",
        "it[u] is the resume point in u's adjacency list, which is what makes each frame re-entrant: every time u comes back to the top of the call stack it continues from the edge it had not looked at yet, so every edge is examined exactly once.",
        "The one subtle line is the parent relaxation after popping a frame. In the recursive version low[u] = min(low[u], low[v]) runs after the child call returns, so here the same update must be applied to the new top of the call stack using the popped vertex's final low value.",
        "Edges to vertices not on the component stack are ignored, which prevents a finished component from being merged into the one currently being built.",
        "Time: O(n + m). Space: O(n + m), all heap allocated rather than on the program stack.",
      ],
    },
  ],
};
