import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Eulerian Path Existence Check (Undirected)",
      difficulty: "Easy",
      variation: "Existence conditions",
      question: [
        "You are given an undirected multigraph with n vertices labelled 0 to n-1 and a list of m edges, where edges[i] = [a, b] means an undirected edge between a and b. Self-loops and repeated edges are allowed. Return 2 if the graph has an Eulerian circuit (a closed walk using every edge exactly once), 1 if it has an Eulerian path but no circuit, and 0 if it has neither. A graph with no edges counts as having a circuit.",
        "Example 1:\nInput: n = 4, edges = [[0,1],[1,2],[2,0],[0,3]]\nOutput: 1\nExplanation: Degrees are 3, 2, 2, 1, so exactly two vertices are odd and the graph is connected - an open Eulerian path exists from 0 to 3.",
        "Example 2:\nInput: n = 3, edges = [[0,1],[1,2],[2,0]]\nOutput: 2\nExplanation: Every degree is 2 and the graph is connected, so a circuit exists.",
        "Constraints:\n- 1 <= n <= 10^5\n- 0 <= m <= 2 * 10^5\n- 0 <= a, b < n",
      ],
      code: `int eulerianType(int n, vector<vector<int>>& edges) {
    vector<int> deg(n, 0), parent(n);
    for (int i = 0; i < n; i++) parent[i] = i;
    auto find = [&](int x) {
        while (parent[x] != x) x = parent[x] = parent[parent[x]];
        return x;
    };
    for (auto& e : edges) {
        int a = e[0], b = e[1];
        deg[a]++;
        deg[b]++;
        int ra = find(a), rb = find(b);
        if (ra != rb) parent[ra] = rb;
    }
    int root = -1;
    for (int v = 0; v < n; v++) {
        if (deg[v] > 0) { root = find(v); break; }
    }
    if (root == -1) return 2;
    for (int v = 0; v < n; v++) {
        if (deg[v] > 0 && find(v) != root) return 0;
    }
    int odd = 0;
    for (int v = 0; v < n; v++) {
        if (deg[v] % 2 == 1) odd++;
    }
    if (odd == 0) return 2;
    if (odd == 2) return 1;
    return 0;
}`,
      explanation: [
        "An undirected graph has an Eulerian circuit exactly when every vertex has even degree and all vertices that carry at least one edge lie in a single connected component. It has an Eulerian path but no circuit exactly when precisely two vertices have odd degree and the same connectivity condition holds.",
        "The degree condition is necessary because a walk enters and leaves an intermediate vertex in pairs, so each visit consumes two incident edges; only the two endpoints of an open walk can be left with an unpaired edge. The connectivity condition is also necessary and is easy to forget: three separate triangles all have even degrees, yet no single walk can jump between components. Isolated vertices are deliberately ignored - they carry no edges, so they never need to be visited.",
        "A disjoint-set union merges the endpoints of every edge, so one pass over the vertices checks that every edge-bearing vertex sits in the same set.",
        "Time: O((n + m) * alpha(n)). Space: O(n).",
      ],
    },
    {
      name: "Eulerian Circuit Existence Check (Directed)",
      difficulty: "Easy",
      variation: "Existence conditions",
      question: [
        "You are given a directed multigraph with n vertices labelled 0 to n-1 and a list of m arcs, where edges[i] = [a, b] means a directed arc from a to b. Return true if the graph has an Eulerian circuit - a closed directed walk that uses every arc exactly once - and false otherwise. A graph with no arcs counts as having a circuit.",
        "Example 1:\nInput: n = 3, edges = [[0,1],[1,2],[2,0]]\nOutput: true",
        "Example 2:\nInput: n = 3, edges = [[0,1],[1,2],[0,2]]\nOutput: false\nExplanation: Vertex 0 has out-degree 2 and in-degree 0, so in-degree and out-degree do not match.",
        "Constraints:\n- 1 <= n <= 10^5\n- 0 <= m <= 2 * 10^5\n- 0 <= a, b < n",
      ],
      code: `bool hasEulerianCircuit(int n, vector<vector<int>>& edges) {
    vector<int> indeg(n, 0), outdeg(n, 0), parent(n);
    for (int i = 0; i < n; i++) parent[i] = i;
    auto find = [&](int x) {
        while (parent[x] != x) x = parent[x] = parent[parent[x]];
        return x;
    };
    for (auto& e : edges) {
        int a = e[0], b = e[1];
        outdeg[a]++;
        indeg[b]++;
        int ra = find(a), rb = find(b);
        if (ra != rb) parent[ra] = rb;
    }
    for (int v = 0; v < n; v++) {
        if (indeg[v] != outdeg[v]) return false;
    }
    int root = -1;
    for (int v = 0; v < n; v++) {
        if (indeg[v] + outdeg[v] > 0) { root = find(v); break; }
    }
    if (root == -1) return true;
    for (int v = 0; v < n; v++) {
        if (indeg[v] + outdeg[v] > 0 && find(v) != root) return false;
    }
    return true;
}`,
      explanation: [
        "A directed graph has an Eulerian circuit exactly when in-degree equals out-degree at every vertex and all arc-bearing vertices are in one connected piece. The balance condition is necessary because a closed walk arrives at and departs from each vertex the same number of times.",
        "The subtle point is that only weak connectivity needs checking here, not strong connectivity: once every vertex is balanced, a weakly connected arc-bearing set is automatically strongly connected. Intuitively, following arcs forward from any vertex can never get permanently stuck at a balanced vertex, so every vertex can reach every other.",
        "The disjoint-set union therefore ignores arc directions and only verifies that the arcs form one component over the vertices they touch.",
        "Time: O((n + m) * alpha(n)). Space: O(n).",
      ],
    },
    {
      name: "Eulerian Path and Circuit",
      difficulty: "Easy",
      variation: "Existence conditions via DFS",
      link: "https://www.geeksforgeeks.org/eulerian-path-and-circuit/",
      question: [
        "Given a connected undirected graph with n vertices given as an adjacency list adj, where adj[v] holds the neighbours of v, determine whether the graph is Eulerian. Return 2 if the graph has an Eulerian circuit, 1 if it has an Eulerian path but no circuit, and 0 if it is not Eulerian at all.",
        "Example 1:\nInput: n = 5, adj = [[1,2,3],[0,2],[0,1],[0,4],[3]]\nOutput: 1\nExplanation: Degrees are 3, 2, 2, 2, 1, so vertices 0 and 4 are the only odd ones and an open Eulerian path exists between them.",
        "Example 2:\nInput: n = 3, adj = [[1,2],[0,2],[0,1]]\nOutput: 2",
        "Constraints:\n- 1 <= n <= 10^4\n- 0 <= number of edges <= 10^5",
      ],
      code: `void markReachable(int u, vector<vector<int>>& adj, vector<char>& vis) {
    vector<int> stack;
    stack.push_back(u);
    vis[u] = 1;
    while (!stack.empty()) {
        int x = stack.back();
        stack.pop_back();
        for (int y : adj[x]) {
            if (!vis[y]) {
                vis[y] = 1;
                stack.push_back(y);
            }
        }
    }
}

int isEulerian(int n, vector<vector<int>>& adj) {
    int start = -1;
    for (int v = 0; v < n; v++) {
        if (!adj[v].empty()) { start = v; break; }
    }
    if (start == -1) return 2;
    vector<char> vis(n, 0);
    markReachable(start, adj, vis);
    for (int v = 0; v < n; v++) {
        if (!adj[v].empty() && !vis[v]) return 0;
    }
    int odd = 0;
    for (int v = 0; v < n; v++) {
        if (adj[v].size() % 2 == 1) odd++;
    }
    if (odd == 0) return 2;
    if (odd == 2) return 1;
    return 0;
}`,
      explanation: [
        "This is the same classification as the disjoint-set version, but connectivity is verified with a single graph traversal instead. Start the traversal at any vertex that actually has an incident edge, then confirm every other edge-bearing vertex was reached.",
        "Starting from an arbitrary vertex would be wrong: an isolated vertex reaches nothing, and isolated vertices must not disqualify a graph that is otherwise Eulerian.",
        "With connectivity established, the count of odd-degree vertices decides everything - zero means a circuit, two means an open path whose endpoints are exactly those two odd vertices, and anything else means no Eulerian walk exists (the number of odd-degree vertices is always even by the handshake lemma).",
        "Time: O(n + m). Space: O(n).",
      ],
    },
    {
      name: "Euler Circuit in a Directed Graph",
      difficulty: "Medium",
      variation: "Balance plus strong connectivity",
      question: [
        "Given a directed graph with n vertices as an adjacency list adj, where adj[u] holds the heads of the arcs leaving u, return true if the graph contains an Euler circuit and false otherwise. Verify the answer using an explicit strong-connectivity test on the arc-bearing vertices rather than relying on the weak-connectivity shortcut.",
        "Example 1:\nInput: n = 5, adj = [[1],[2],[0,3],[4],[2]]\nOutput: true\nExplanation: Every vertex is balanced and the graph is strongly connected; the circuit 0-1-2-3-4-2-0 uses each of the six arcs once.",
        "Example 2:\nInput: n = 3, adj = [[1],[0],[]]\nOutput: true\nExplanation: Vertex 2 carries no arcs and is ignored; 0 and 1 form a balanced, strongly connected 2-cycle.",
        "Constraints:\n- 1 <= n <= 10^4\n- 0 <= number of arcs <= 10^5",
      ],
      code: `void reachFrom(int s, vector<vector<int>>& g, vector<char>& vis) {
    vector<int> stack;
    stack.push_back(s);
    vis[s] = 1;
    while (!stack.empty()) {
        int u = stack.back();
        stack.pop_back();
        for (int v : g[u]) {
            if (!vis[v]) {
                vis[v] = 1;
                stack.push_back(v);
            }
        }
    }
}

bool isEulerCircuit(int n, vector<vector<int>>& adj) {
    vector<vector<int>> rev(n);
    vector<int> indeg(n, 0), outdeg(n, 0);
    for (int u = 0; u < n; u++) {
        for (int v : adj[u]) {
            rev[v].push_back(u);
            outdeg[u]++;
            indeg[v]++;
        }
    }
    for (int v = 0; v < n; v++) {
        if (indeg[v] != outdeg[v]) return false;
    }
    int s = -1;
    for (int v = 0; v < n; v++) {
        if (outdeg[v] > 0) { s = v; break; }
    }
    if (s == -1) return true;
    vector<char> forward(n, 0), backward(n, 0);
    reachFrom(s, adj, forward);
    reachFrom(s, rev, backward);
    for (int v = 0; v < n; v++) {
        if (indeg[v] + outdeg[v] > 0 && (!forward[v] || !backward[v])) return false;
    }
    return true;
}`,
      explanation: [
        "Two conditions are checked. First, in-degree equals out-degree at every vertex, which is forced by the fact that a closed walk leaves a vertex exactly as often as it enters. Second, every arc-bearing vertex lies in one strongly connected component - otherwise the walk could enter a region and never return.",
        "Strong connectivity of the arc-bearing set is tested with two traversals from a single arc-bearing vertex s: one on the graph and one on the reverse graph. A vertex reachable from s and able to reach s is in the same strongly connected component as s, so if every arc-bearing vertex passes both tests the whole arc-bearing set is one component.",
        "Vertices with no arcs are excluded from the check, since an Euler circuit only has to cover arcs.",
        "Time: O(n + m). Space: O(n + m) for the reversed adjacency.",
      ],
    },
    {
      name: "Domino Chain Arrangement",
      difficulty: "Easy",
      variation: "Modelling as an Eulerian walk",
      question: [
        "You are given n dominoes; dominoes[i] = [a, b] means a tile whose two halves show a and b, each between 1 and 6. A tile may be flipped, so [a, b] and [b, a] are the same tile. Return true if all n dominoes can be laid in a single line so that touching halves of adjacent tiles show the same number, and false otherwise.",
        "Example 1:\nInput: dominoes = [[1,2],[2,3],[3,1]]\nOutput: true\nExplanation: 1-2, 2-3, 3-1 forms a closed chain.",
        "Example 2:\nInput: dominoes = [[1,2],[3,4]]\nOutput: false\nExplanation: The two tiles share no number, so they cannot touch.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= a, b <= 6",
      ],
      code: `bool canChainAll(vector<vector<int>>& dominoes) {
    const int V = 7;
    vector<int> deg(V, 0), parent(V);
    for (int i = 0; i < V; i++) parent[i] = i;
    auto find = [&](int x) {
        while (parent[x] != x) x = parent[x] = parent[parent[x]];
        return x;
    };
    for (auto& d : dominoes) {
        int a = d[0], b = d[1];
        deg[a]++;
        deg[b]++;
        int ra = find(a), rb = find(b);
        if (ra != rb) parent[ra] = rb;
    }
    int root = -1;
    for (int v = 1; v < V; v++) {
        if (deg[v] > 0) { root = find(v); break; }
    }
    if (root == -1) return true;
    for (int v = 1; v < V; v++) {
        if (deg[v] > 0 && find(v) != root) return false;
    }
    int odd = 0;
    for (int v = 1; v < V; v++) {
        if (deg[v] % 2 == 1) odd++;
    }
    return odd == 0 || odd == 2;
}`,
      explanation: [
        "Build a multigraph on the six pip values: each domino [a, b] becomes an undirected edge between a and b, and a double [a, a] becomes a self-loop. Laying every tile in a chain with matching contacts is exactly a walk that uses every edge once, that is, an Eulerian path.",
        "So the answer is simply the undirected existence test: all edge-bearing pip values in one component, and either zero or two vertices of odd degree. Self-loops contribute two to a degree, which correctly keeps a double tile parity-neutral.",
        "Note the graph is tiny - at most 6 vertices - so the whole test is dominated by the single pass over the tiles.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Word Chain Formable",
      difficulty: "Medium",
      variation: "Directed Eulerian path modelling",
      question: [
        "You are given an array of n lowercase words. Return true if all n words can be ordered in a sequence so that the last letter of each word equals the first letter of the next word, and false otherwise. Every word must be used exactly once, and duplicate words are allowed.",
        "Example 1:\nInput: words = [\"acm\", \"malform\", \"mouse\"]\nOutput: true\nExplanation: acm -> malform -> mouse chains m to m and m to m.",
        "Example 2:\nInput: words = [\"ok\", \"ok\"]\nOutput: false\nExplanation: Both words start with o and end with k, so k can never be followed by o.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= words[i].length <= 1000\n- words[i] consists of lowercase English letters",
      ],
      code: `bool canFormChain(vector<string>& words) {
    vector<int> indeg(26, 0), outdeg(26, 0), parent(26);
    for (int i = 0; i < 26; i++) parent[i] = i;
    auto find = [&](int x) {
        while (parent[x] != x) x = parent[x] = parent[parent[x]];
        return x;
    };
    for (const string& w : words) {
        int a = w.front() - 'a', b = w.back() - 'a';
        outdeg[a]++;
        indeg[b]++;
        int ra = find(a), rb = find(b);
        if (ra != rb) parent[ra] = rb;
    }
    int root = -1;
    for (int v = 0; v < 26; v++) {
        if (indeg[v] + outdeg[v] > 0) { root = find(v); break; }
    }
    if (root == -1) return true;
    for (int v = 0; v < 26; v++) {
        if (indeg[v] + outdeg[v] > 0 && find(v) != root) return false;
    }
    int plus = 0, minus = 0;
    for (int v = 0; v < 26; v++) {
        int d = outdeg[v] - indeg[v];
        if (d == 1) plus++;
        else if (d == -1) minus++;
        else if (d != 0) return false;
    }
    return (plus == 0 && minus == 0) || (plus == 1 && minus == 1);
}`,
      explanation: [
        "Each word becomes a directed arc from its first letter to its last letter over 26 vertices. The internal letters are irrelevant; only the two endpoints matter. Chaining all words is then exactly an Eulerian path in this 26-vertex multigraph.",
        "A directed Eulerian path exists when the arc-bearing vertices are weakly connected and the degree imbalance out-degree minus in-degree is zero everywhere, or is +1 at one vertex (the start) and -1 at one vertex (the end) and zero elsewhere. The first case gives a circuit, which is also a valid chain.",
        "Any imbalance of absolute value 2 or more is rejected immediately, because a walk can only run a surplus of one at its two endpoints.",
        "Time: O(total input length). Space: O(1) - the graph has 26 vertices.",
      ],
    },
    {
      name: "Hierholzer Euler Path Construction",
      difficulty: "Medium",
      variation: "Hierholzer's algorithm, iterative",
      question: [
        "You are given an undirected multigraph with n vertices labelled 0 to n-1 and m edges given as edges[i] = [a, b]. It is guaranteed that an Eulerian path exists. Return the sequence of m+1 vertices visited by some Eulerian path. Use an iterative implementation so that a path of length 2 * 10^5 does not overflow the call stack.",
        "Example 1:\nInput: n = 4, edges = [[0,1],[1,2],[2,0],[0,3]]\nOutput: [3,0,1,2,0]\nExplanation: The walk 3-0, 0-1, 1-2, 2-0 uses all four edges once. Any valid Eulerian path is accepted.",
        "Example 2:\nInput: n = 3, edges = [[0,1],[1,2],[2,0]]\nOutput: [0,1,2,0]",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= m <= 2 * 10^5\n- An Eulerian path is guaranteed to exist",
      ],
      code: `vector<int> eulerPath(int n, vector<vector<int>>& edges) {
    int m = edges.size();
    vector<vector<pair<int, int>>> adj(n);
    vector<int> deg(n, 0);
    for (int i = 0; i < m; i++) {
        int a = edges[i][0], b = edges[i][1];
        adj[a].push_back({b, i});
        adj[b].push_back({a, i});
        deg[a]++;
        deg[b]++;
    }
    int start = 0;
    for (int v = 0; v < n; v++) {
        if (deg[v] > 0) { start = v; break; }
    }
    for (int v = 0; v < n; v++) {
        if (deg[v] % 2 == 1) { start = v; break; }
    }
    vector<int> ptr(n, 0), stack, path;
    vector<char> used(m, 0);
    stack.push_back(start);
    while (!stack.empty()) {
        int u = stack.back();
        while (ptr[u] < (int)adj[u].size() && used[adj[u][ptr[u]].second]) ptr[u]++;
        if (ptr[u] == (int)adj[u].size()) {
            path.push_back(u);
            stack.pop_back();
        } else {
            int v = adj[u][ptr[u]].first;
            int id = adj[u][ptr[u]].second;
            used[id] = 1;
            ptr[u]++;
            stack.push_back(v);
        }
    }
    reverse(path.begin(), path.end());
    return path;
}`,
      explanation: [
        "Hierholzer's algorithm walks forward greedily, consuming any unused incident edge, until it reaches a vertex with no unused edges left. That vertex is appended to the output and popped, and the walk resumes from the previous vertex on the stack. Reversing the resulting post-order gives a valid Eulerian path.",
        "The post-order append is what makes the algorithm correct. If the greedy walk closes a loop early and gets stuck, the stuck vertex is finished first; any side loop discovered later from an earlier stack vertex is spliced in ahead of it automatically. Nothing has to be backtracked.",
        "The start vertex must be an odd-degree vertex when one exists, otherwise the walk cannot cover the odd endpoint. If all degrees are even, any edge-bearing vertex works. The ptr array makes each vertex scan its adjacency list only once overall, and used marks each undirected edge so that its two directed copies are consumed together.",
        "Time: O(n + m). Space: O(n + m).",
      ],
    },
    {
      name: "Mail Delivery",
      difficulty: "Medium",
      variation: "Eulerian circuit from a fixed start",
      link: "https://cses.fi/problemset/task/1691",
      question: [
        "You have to deliver mail to the inhabitants of a city with n squares and m streets. Your task is to walk along every street exactly once, starting and ending at square 1. Print the route as a sequence of squares, or IMPOSSIBLE if no such route exists. Input: the first line has n and m, then m lines each with two integers a and b describing a street between squares a and b. Squares are numbered from 1 to n.",
        "Example 1:\nInput:\n4 4\n1 2\n2 3\n3 4\n4 1\nOutput:\n1 2 3 4 1\nExplanation: Every square has degree 2, so the four streets form one closed route. Any valid route of m+1 squares is accepted.",
        "Example 2:\nInput:\n3 2\n1 2\n2 3\nOutput:\nIMPOSSIBLE\nExplanation: Squares 1 and 3 have odd degree, so no closed route exists.",
        "Constraints:\n- 2 <= n <= 10^5\n- 1 <= m <= 2 * 10^5\n- 1 <= a, b <= n",
      ],
      code: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, m;
    if (scanf("%d %d", &n, &m) != 2) return 0;
    vector<vector<pair<int, int>>> adj(n + 1);
    vector<int> deg(n + 1, 0);
    for (int i = 0; i < m; i++) {
        int a, b;
        scanf("%d %d", &a, &b);
        adj[a].push_back({b, i});
        adj[b].push_back({a, i});
        deg[a]++;
        deg[b]++;
    }
    for (int v = 1; v <= n; v++) {
        if (deg[v] % 2 != 0) { printf("IMPOSSIBLE\\n"); return 0; }
    }
    vector<int> ptr(n + 1, 0), stack, path;
    vector<char> used(m, 0);
    stack.push_back(1);
    while (!stack.empty()) {
        int u = stack.back();
        while (ptr[u] < (int)adj[u].size() && used[adj[u][ptr[u]].second]) ptr[u]++;
        if (ptr[u] == (int)adj[u].size()) {
            path.push_back(u);
            stack.pop_back();
        } else {
            int v = adj[u][ptr[u]].first;
            int id = adj[u][ptr[u]].second;
            used[id] = 1;
            ptr[u]++;
            stack.push_back(v);
        }
    }
    if ((int)path.size() != m + 1) { printf("IMPOSSIBLE\\n"); return 0; }
    string out;
    for (int i = 0; i < (int)path.size(); i++) {
        out += to_string(path[i]);
        out += (i + 1 == (int)path.size() ? '\\n' : ' ');
    }
    fputs(out.c_str(), stdout);
    return 0;
}`,
      explanation: [
        "The route must be a closed walk using every street once, so it is an Eulerian circuit that has to start at square 1. Two things must hold: every square has even degree, and all squares carrying at least one street are connected and include square 1.",
        "The parity check is done directly. Connectivity is checked implicitly and for free: Hierholzer's algorithm launched from square 1 can only emit m+1 squares if it consumed all m streets, so a size mismatch means either the graph was disconnected or square 1 was isolated. That single comparison replaces a separate traversal.",
        "The construction is the iterative Hierholzer walk - greedily consume unused streets, and append a square to the route only once all its streets are exhausted - then reverse. Because the circuit is closed, reversing is optional here, but it keeps the template identical to the open-path case.",
        "Time: O(n + m). Space: O(n + m).",
      ],
    },
    {
      name: "Teleporters Path",
      difficulty: "Medium",
      variation: "Directed Eulerian path, fixed endpoints",
      link: "https://cses.fi/problemset/task/1693",
      question: [
        "A game has n levels and m teleporters, each teleporter being a one-way link from one level to another. Your task is to travel from level 1 to level n using every teleporter exactly once. Print the route as a sequence of levels, or IMPOSSIBLE if no such route exists. Input: the first line has n and m, then m lines each with two integers a and b meaning a teleporter from level a to level b.",
        "Example 1:\nInput:\n5 6\n1 2\n1 3\n2 4\n2 5\n3 1\n4 2\nOutput:\n1 3 1 2 4 2 5\nExplanation: The route uses each of the six teleporters once and ends at level 5.",
        "Example 2:\nInput:\n2 2\n1 2\n1 2\nOutput:\nIMPOSSIBLE\nExplanation: Level 1 has out-degree 2 and in-degree 0, an imbalance of 2.",
        "Constraints:\n- 2 <= n <= 10^5\n- 1 <= m <= 2 * 10^5\n- 1 <= a, b <= n",
      ],
      code: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, m;
    if (scanf("%d %d", &n, &m) != 2) return 0;
    vector<vector<int>> adj(n + 1);
    vector<int> indeg(n + 1, 0), outdeg(n + 1, 0);
    for (int i = 0; i < m; i++) {
        int a, b;
        scanf("%d %d", &a, &b);
        adj[a].push_back(b);
        outdeg[a]++;
        indeg[b]++;
    }
    bool ok = (outdeg[1] - indeg[1] == 1) && (indeg[n] - outdeg[n] == 1);
    for (int v = 2; v <= n - 1 && ok; v++) {
        if (indeg[v] != outdeg[v]) ok = false;
    }
    if (!ok) { printf("IMPOSSIBLE\\n"); return 0; }
    vector<int> ptr(n + 1, 0), stack, path;
    stack.push_back(1);
    while (!stack.empty()) {
        int u = stack.back();
        if (ptr[u] == (int)adj[u].size()) {
            path.push_back(u);
            stack.pop_back();
        } else {
            int v = adj[u][ptr[u]];
            ptr[u]++;
            stack.push_back(v);
        }
    }
    if ((int)path.size() != m + 1) { printf("IMPOSSIBLE\\n"); return 0; }
    reverse(path.begin(), path.end());
    string out;
    for (int i = 0; i < (int)path.size(); i++) {
        out += to_string(path[i]);
        out += (i + 1 == (int)path.size() ? '\\n' : ' ');
    }
    fputs(out.c_str(), stdout);
    return 0;
}`,
      explanation: [
        "This is a directed Eulerian path with prescribed endpoints. The degree conditions are therefore pinned rather than merely counted: level 1 must have exactly one more outgoing teleporter than incoming, level n exactly one more incoming than outgoing, and every other level must be perfectly balanced.",
        "In the directed case an edge pointer per vertex is enough - no used array is needed - because each arc appears in exactly one adjacency list, so advancing ptr[u] consumes it once and for all.",
        "The post-order stack produces the route reversed, so a final reverse is required. As in Mail Delivery, comparing the route length to m+1 is what verifies connectivity: if some teleporters lie in a piece unreachable from level 1, the walk stops early and the answer is IMPOSSIBLE.",
        "Time: O(n + m). Space: O(n + m).",
      ],
    },
    {
      name: "Reconstruct Itinerary",
      difficulty: "Hard",
      variation: "Hierholzer's algorithm, lexicographic",
      link: "https://leetcode.com/problems/reconstruct-itinerary/",
      question: [
        "You are given a list of airline tickets where tickets[i] = [from, to] represents the departure and arrival airports of one flight. Reconstruct the itinerary in order and return it. All tickets belong to a man who departs from JFK, so the itinerary must begin with JFK, and you must use all the tickets exactly once. If multiple valid itineraries exist, return the lexicographically smallest one when read as a single string list.",
        "Example 1:\nInput: tickets = [[\"MUC\",\"LHR\"],[\"JFK\",\"MUC\"],[\"SFO\",\"SJC\"],[\"LHR\",\"SFO\"]]\nOutput: [\"JFK\",\"MUC\",\"LHR\",\"SFO\",\"SJC\"]",
        "Example 2:\nInput: tickets = [[\"JFK\",\"SFO\"],[\"JFK\",\"ATL\"],[\"SFO\",\"ATL\"],[\"ATL\",\"JFK\"],[\"ATL\",\"SFO\"]]\nOutput: [\"JFK\",\"ATL\",\"JFK\",\"SFO\",\"ATL\",\"SFO\"]\nExplanation: The alternative [\"JFK\",\"SFO\",\"ATL\",\"JFK\",\"ATL\",\"SFO\"] is larger lexicographically.",
        "Constraints:\n- 1 <= tickets.length <= 300\n- Airport codes are three uppercase letters\n- A valid itinerary is guaranteed to exist",
      ],
      code: `vector<string> findItinerary(vector<vector<string>>& tickets) {
    map<string, multiset<string>> adj;
    for (auto& t : tickets) adj[t[0]].insert(t[1]);
    vector<string> route, stack;
    stack.push_back("JFK");
    while (!stack.empty()) {
        string u = stack.back();
        auto it = adj.find(u);
        if (it == adj.end() || it->second.empty()) {
            route.push_back(u);
            stack.pop_back();
        } else {
            string v = *it->second.begin();
            it->second.erase(it->second.begin());
            stack.push_back(v);
        }
    }
    reverse(route.begin(), route.end());
    return route;
}`,
      explanation: [
        "Tickets are arcs of a directed multigraph on airports, and an itinerary using every ticket once is a directed Eulerian path starting at JFK. Hierholzer's algorithm builds it: repeatedly take any unused outgoing ticket, and when an airport has no tickets left, append it to the route and step back.",
        "Always taking the smallest unused destination makes the result lexicographically smallest. Plain greedy would be wrong on its own - the smallest choice can lead into a dead end before all tickets are used - but the post-order append fixes exactly that. The dead end is emitted first and therefore ends up last in the reversed route, which is where it belongs.",
        "The multiset gives sorted access with duplicates, and the iterative stack avoids deep recursion. Reversing the post-order at the end yields the itinerary from JFK onward.",
        "Time: O(E log E). Space: O(E).",
      ],
    },
    {
      name: "Valid Arrangement of Pairs",
      difficulty: "Hard",
      variation: "Directed Eulerian path over sparse labels",
      link: "https://leetcode.com/problems/valid-arrangement-of-pairs/",
      question: [
        "You are given a 0-indexed 2D integer array pairs where pairs[i] = [start_i, end_i]. An arrangement of pairs is valid if for every index i with 1 <= i < pairs.length we have end of the previous pair equal to start of the current pair. Return any valid arrangement of pairs. It is guaranteed that at least one valid arrangement exists. All pairs are distinct.",
        "Example 1:\nInput: pairs = [[5,1],[4,5],[11,9],[9,4]]\nOutput: [[11,9],[9,4],[4,5],[5,1]]",
        "Example 2:\nInput: pairs = [[1,3],[3,2],[2,1]]\nOutput: [[1,3],[3,2],[2,1]]\nExplanation: The arrangement forms a cycle, so any rotation is also valid.",
        "Constraints:\n- 1 <= pairs.length <= 10^5\n- 0 <= start_i, end_i <= 10^9\n- A valid arrangement exists",
      ],
      code: `vector<vector<int>> validArrangement(vector<vector<int>>& pairs) {
    unordered_map<int, vector<int>> adj;
    unordered_map<int, int> balance;
    adj.reserve(pairs.size() * 2);
    balance.reserve(pairs.size() * 2);
    for (auto& p : pairs) {
        adj[p[0]].push_back(p[1]);
        balance[p[0]]++;
        balance[p[1]]--;
    }
    int start = pairs[0][0];
    for (auto& kv : balance) {
        if (kv.second == 1) { start = kv.first; break; }
    }
    vector<int> order, stack;
    stack.push_back(start);
    while (!stack.empty()) {
        int u = stack.back();
        auto it = adj.find(u);
        if (it == adj.end() || it->second.empty()) {
            order.push_back(u);
            stack.pop_back();
        } else {
            int v = it->second.back();
            it->second.pop_back();
            stack.push_back(v);
        }
    }
    reverse(order.begin(), order.end());
    vector<vector<int>> res;
    res.reserve(pairs.size());
    for (int i = 0; i + 1 < (int)order.size(); i++) {
        res.push_back({order[i], order[i + 1]});
    }
    return res;
}`,
      explanation: [
        "Treat every pair as an arc from start to end. A valid arrangement chains the arcs head to tail using each exactly once, which is precisely a directed Eulerian path, so the whole problem reduces to running Hierholzer.",
        "Choosing the start vertex correctly is the only extra work. The path must begin at the vertex whose out-degree exceeds its in-degree by one; if no such vertex exists the graph is balanced, an Eulerian circuit exists, and any vertex with an outgoing arc works - here the start of the first pair.",
        "Node labels go up to 10^9, so hash maps replace arrays. Consuming arcs from the back of each vector is O(1), and the reconstructed vertex order of length pairs.length + 1 is turned back into consecutive pairs. The problem guarantees a solution, so no existence check is needed.",
        "Time: O(n) expected. Space: O(n).",
      ],
    },
    {
      name: "De Bruijn Sequence",
      difficulty: "Hard",
      variation: "Eulerian circuit on a de Bruijn graph",
      link: "https://cses.fi/problemset/task/1692",
      question: [
        "A De Bruijn sequence is a bit string that contains every bit string of length n exactly once as a substring. Your task is to construct such a sequence of length 2^n + n - 1. Input: a single integer n. Output: any valid De Bruijn sequence for that n.",
        "Example 1:\nInput:\n2\nOutput:\n01100\nExplanation: The substrings of length 2 are 01, 11, 10, 00 - all four appear exactly once.",
        "Example 2:\nInput:\n1\nOutput:\n01\nExplanation: The substrings 0 and 1 each appear once, and the length is 2^1 + 1 - 1 = 2.",
        "Constraints:\n- 1 <= n <= 15",
      ],
      code: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int nodes = 1 << (n - 1);
    int mask = nodes - 1;
    vector<int> ptr(nodes, 0);
    vector<pair<int, int>> stack;
    stack.push_back({0, -1});
    string circuit;
    circuit.reserve(1 << n);
    while (!stack.empty()) {
        int u = stack.back().first;
        if (ptr[u] == 2) {
            int bit = stack.back().second;
            stack.pop_back();
            if (bit >= 0) circuit.push_back((char)('0' + bit));
        } else {
            int bit = ptr[u]++;
            int v = ((u << 1) | bit) & mask;
            stack.push_back({v, bit});
        }
    }
    reverse(circuit.begin(), circuit.end());
    string result = circuit;
    for (int i = 0; i < n - 1; i++) result.push_back(circuit[i]);
    result.push_back('\\n');
    fputs(result.c_str(), stdout);
    return 0;
}`,
      explanation: [
        "Build the de Bruijn graph: vertices are the 2^(n-1) bit strings of length n-1, and from vertex u there are two arcs, one per appended bit b, going to the last n-1 bits of u followed by b. That arc represents the length-n string u followed by b, so every length-n string is one arc, and an Eulerian circuit visits each exactly once.",
        "Such a circuit exists because every vertex has in-degree 2 and out-degree 2 (balanced) and the graph is connected - any vertex can be turned into any other by shifting in at most n-1 bits.",
        "Concatenating the bit labels of the circuit's arcs in order gives a cyclic sequence of length 2^n in which every length-n string appears once cyclically. Appending the first n-1 characters unrolls the cycle into a linear string of length 2^n + n - 1 with the same property. The stack stores the bit used to enter each vertex so the label can be emitted at pop time, and the post-order output is reversed at the end.",
        "Time: O(2^n). Space: O(2^n).",
      ],
    },
    {
      name: "Cracking the Safe",
      difficulty: "Hard",
      variation: "k-ary de Bruijn sequence",
      link: "https://leetcode.com/problems/cracking-the-safe/",
      question: [
        "There is a safe protected by a password that is a sequence of n digits, each digit in the range 0 to k-1. The safe has a keypad that stores the most recent n digits typed; if those n digits match the password the safe opens. Return any string of minimum length that is guaranteed to open the safe at some point while it is being typed.",
        "Example 1:\nInput: n = 1, k = 2\nOutput: \"01\"\nExplanation: The password is 0 or 1, and both appear. Any answer of minimum length is accepted.",
        "Example 2:\nInput: n = 2, k = 2\nOutput: \"00110\"\nExplanation: All four two-digit passwords 00, 01, 11, 10 appear as substrings, and the length 5 is minimal.",
        "Constraints:\n- 1 <= n <= 4\n- 1 <= k <= 10\n- 1 <= k^n <= 4096",
      ],
      code: `string crackSafe(int n, int k) {
    int nodes = 1;
    for (int i = 0; i < n - 1; i++) nodes *= k;
    vector<int> ptr(nodes, 0);
    vector<pair<int, int>> stack;
    stack.push_back({0, -1});
    string circuit;
    while (!stack.empty()) {
        int u = stack.back().first;
        if (ptr[u] == k) {
            int d = stack.back().second;
            stack.pop_back();
            if (d >= 0) circuit.push_back((char)('0' + d));
        } else {
            int d = ptr[u]++;
            int v = (u * k + d) % nodes;
            stack.push_back({v, d});
        }
    }
    reverse(circuit.begin(), circuit.end());
    string result(n - 1, '0');
    result += circuit;
    return result;
}`,
      explanation: [
        "A minimum-length string that contains all k^n passwords must have length k^n + n - 1, since it has exactly that many length-n windows and they all have to be distinct. Such a string is a k-ary de Bruijn sequence.",
        "Build the de Bruijn graph on the k^(n-1) prefixes of length n-1, with k arcs out of each vertex, one per appended digit; each arc is one password. Every vertex has in-degree k and out-degree k and the graph is connected, so an Eulerian circuit exists and Hierholzer constructs it.",
        "Starting the circuit at the all-zeros vertex means the walk begins with n-1 zeros already on the keypad, so prefixing n-1 zeros to the concatenated arc digits yields the answer. The stack carries the digit used to enter each vertex so it can be emitted on pop; the post-order is reversed at the end.",
        "Time: O(k^n). Space: O(k^n).",
      ],
    },
    {
      name: "Count Eulerian Circuits in a Directed Graph",
      difficulty: "Hard",
      variation: "BEST theorem and the matrix-tree theorem",
      question: [
        "You are given a directed multigraph with n vertices labelled 0 to n-1 and m arcs. Count the number of Eulerian circuits modulo 10^9 + 7. Two circuits are considered the same if one is a cyclic rotation of the other, so a circuit is counted as a cyclic sequence of arcs. Return 0 if no Eulerian circuit exists.",
        "Example 1:\nInput: n = 3, edges = [[0,1],[1,2],[2,0]]\nOutput: 1\nExplanation: The only circuit is the single triangle.",
        "Example 2:\nInput: n = 2, edges = [[0,1],[1,0],[0,1],[1,0]]\nOutput: 2\nExplanation: There are 2 arborescences toward vertex 0 (either copy of the arc 1 to 0), and (2-1)! * (2-1)! = 1, so the count is 2 - the two circuits pair the parallel arcs in the two possible ways.",
        "Constraints:\n- 1 <= n <= 100\n- 0 <= m <= 10^5",
      ],
      code: `const long long MOD = 1000000007LL;

long long powMod(long long b, long long e) {
    long long r = 1;
    b %= MOD;
    while (e > 0) {
        if (e & 1) r = r * b % MOD;
        b = b * b % MOD;
        e >>= 1;
    }
    return r;
}

long long determinant(vector<vector<long long>> a) {
    int k = a.size();
    long long det = 1;
    for (int c = 0; c < k; c++) {
        int piv = -1;
        for (int r = c; r < k; r++) {
            if (a[r][c] != 0) { piv = r; break; }
        }
        if (piv == -1) return 0;
        if (piv != c) {
            swap(a[piv], a[c]);
            det = (MOD - det) % MOD;
        }
        det = det * a[c][c] % MOD;
        long long inv = powMod(a[c][c], MOD - 2);
        for (int r = c + 1; r < k; r++) {
            long long f = a[r][c] * inv % MOD;
            if (f == 0) continue;
            for (int j = c; j < k; j++) {
                a[r][j] = (a[r][j] - f * a[c][j]) % MOD;
                if (a[r][j] < 0) a[r][j] += MOD;
            }
        }
    }
    return det;
}

long long countEulerianCircuits(int n, vector<vector<int>>& edges) {
    vector<int> indeg(n, 0), outdeg(n, 0);
    vector<vector<long long>> A(n, vector<long long>(n, 0));
    for (auto& e : edges) {
        outdeg[e[0]]++;
        indeg[e[1]]++;
        A[e[0]][e[1]] = (A[e[0]][e[1]] + 1) % MOD;
    }
    for (int v = 0; v < n; v++) {
        if (indeg[v] != outdeg[v]) return 0;
    }
    int root = -1;
    for (int v = 0; v < n; v++) {
        if (outdeg[v] > 0) { root = v; break; }
    }
    if (root == -1) return 1;
    vector<int> ids;
    for (int v = 0; v < n; v++) {
        if (outdeg[v] > 0 && v != root) ids.push_back(v);
    }
    int k = ids.size();
    vector<vector<long long>> L(k, vector<long long>(k, 0));
    for (int i = 0; i < k; i++) {
        for (int j = 0; j < k; j++) {
            long long val = (i == j ? (long long)outdeg[ids[i]] : 0LL) - A[ids[i]][ids[j]];
            L[i][j] = ((val % MOD) + MOD) % MOD;
        }
    }
    long long res = determinant(L);
    for (int v = 0; v < n; v++) {
        for (int t = 1; t < outdeg[v]; t++) res = res * t % MOD;
    }
    return res;
}`,
      explanation: [
        "The BEST theorem (de Bruijn, van Aardenne-Ehrenfest, Smith, Tutte) gives a closed form for connected balanced digraphs: the number of Eulerian circuits equals the number of spanning arborescences oriented toward any fixed vertex, multiplied by the product over all vertices of (out-degree minus 1) factorial.",
        "Intuitively, an Eulerian circuit is determined by choosing, at each vertex, a cyclic order in which its outgoing arcs are used. Most such choices split the arcs into several disjoint closed walks; the arborescence factor counts exactly the choices that glue everything into one circuit, and the factorials count the free orderings of the remaining arcs at each vertex.",
        "The arborescence count comes from the directed matrix-tree theorem: form L = D_out - A, delete the row and column of the chosen root, and take the determinant, which counts spanning trees whose arcs all point toward the root. Vertices with no arcs are excluded from the matrix, since they must not be spanned. Connectivity needs no separate test - a disconnected arc-bearing set has no spanning arborescence, so the determinant is 0.",
        "Time: O(m + n^3 log MOD) for the modular Gaussian elimination. Space: O(n^2).",
      ],
    },
    {
      name: "Chinese Postman Problem",
      difficulty: "Hard",
      variation: "Route inspection via odd-vertex matching",
      question: [
        "You are given a connected undirected weighted graph with n vertices labelled 0 to n-1 and m edges, where edges[i] = [a, b, w] is an edge between a and b of positive weight w. Find the minimum total weight of a closed walk that traverses every edge at least once. Edges may be traversed more than once, and repeated traversals are paid for each time.",
        "Example 1:\nInput: n = 3, edges = [[0,1,1],[1,2,1],[2,0,1]]\nOutput: 3\nExplanation: All degrees are even, so the triangle itself is an Eulerian circuit and no edge is repeated.",
        "Example 2:\nInput: n = 4, edges = [[0,1,1],[1,2,1],[2,3,1],[3,0,1],[0,2,5]]\nOutput: 11\nExplanation: Vertices 0 and 2 are odd, and the cheapest 0-to-2 path costs 2, so the total is 9 + 2 = 11.",
        "Constraints:\n- 1 <= n <= 200\n- 1 <= m <= 10^4\n- 1 <= w <= 10^6\n- The number of odd-degree vertices is at most 16",
      ],
      code: `long long chinesePostman(int n, vector<vector<int>>& edges) {
    const long long INF = (long long)1e18;
    vector<vector<long long>> dist(n, vector<long long>(n, INF));
    for (int v = 0; v < n; v++) dist[v][v] = 0;
    vector<int> deg(n, 0);
    long long total = 0;
    for (auto& e : edges) {
        int a = e[0], b = e[1];
        long long w = e[2];
        total += w;
        deg[a]++;
        deg[b]++;
        if (w < dist[a][b]) { dist[a][b] = w; dist[b][a] = w; }
    }
    for (int k = 0; k < n; k++) {
        for (int i = 0; i < n; i++) {
            if (dist[i][k] == INF) continue;
            for (int j = 0; j < n; j++) {
                if (dist[k][j] == INF) continue;
                if (dist[i][k] + dist[k][j] < dist[i][j]) dist[i][j] = dist[i][k] + dist[k][j];
            }
        }
    }
    vector<int> odd;
    for (int v = 0; v < n; v++) {
        if (deg[v] % 2 == 1) odd.push_back(v);
    }
    int k = odd.size();
    if (k == 0) return total;
    vector<long long> dp(1 << k, INF);
    dp[0] = 0;
    for (int mask = 0; mask < (1 << k); mask++) {
        if (dp[mask] == INF) continue;
        int i = 0;
        while (i < k && (mask & (1 << i))) i++;
        if (i == k) continue;
        for (int j = i + 1; j < k; j++) {
            if (mask & (1 << j)) continue;
            int nxt = mask | (1 << i) | (1 << j);
            long long cand = dp[mask] + dist[odd[i]][odd[j]];
            if (cand < dp[nxt]) dp[nxt] = cand;
        }
    }
    return total + dp[(1 << k) - 1];
}`,
      explanation: [
        "If every degree is even the graph already has an Eulerian circuit, so the answer is just the sum of all edge weights - nothing needs repeating. Otherwise some edges must be walked twice, and duplicating an edge adds one to the degree of each endpoint.",
        "The set of duplicated edges must therefore make every odd-degree vertex even, which means it forms a collection of paths pairing up the odd vertices. Choosing the cheapest such collection is a minimum-weight perfect matching on the odd vertices, where the cost of pairing u with v is the shortest-path distance between them. This is why the Chinese postman problem is genuinely harder than finding an Eulerian circuit: the reduction is to matching, not to a greedy or degree test.",
        "Floyd-Warshall supplies all pairwise distances, and since the number of odd vertices is even and small, the matching is computed by a bitmask DP that always pairs the lowest unmatched vertex with some partner - this visits each perfect matching exactly once. Adding the matching cost to the total edge weight makes all degrees even, and Hierholzer would then produce the actual route.",
        "Time: O(n^3 + 2^k * k) where k is the number of odd vertices. Space: O(n^2 + 2^k).",
      ],
    },
  ],
};
