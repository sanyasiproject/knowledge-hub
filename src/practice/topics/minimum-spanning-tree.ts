import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Building Roads",
      difficulty: "Easy",
      variation: "Spanning forest, zero-cost connectivity",
      link: "https://cses.fi/problemset/task/1666",
      question: [
        "There are n cities and m roads between them. Your task is to determine the minimum number of new roads needed so that there is a route between any two cities, and print one valid set of such roads.",
        "Example 1:\nInput:\n4 2\n1 2\n3 4\nOutput:\n1\n1 3\nExplanation: The two components {1,2} and {3,4} need a single road between them.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= m <= 2 * 10^5\n- 1 <= a, b <= n",
      ],
      code: `#include <bits/stdc++.h>
using namespace std;

struct DSU {
    vector<int> parent, size;
    int components;
    DSU(int n) : parent(n), size(n, 1), components(n) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (size[a] < size[b]) swap(a, b);
        parent[b] = a;
        size[a] += size[b];
        components--;
        return true;
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    DSU dsu(n + 1);
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        dsu.unite(a, b);
    }
    vector<int> reps;
    for (int i = 1; i <= n; i++)
        if (dsu.find(i) == i) reps.push_back(i);
    string out = to_string((int)reps.size() - 1);
    out += '\\n';
    for (size_t i = 1; i < reps.size(); i++) {
        out += to_string(reps[0]);
        out += ' ';
        out += to_string(reps[i]);
        out += '\\n';
    }
    cout << out;
    return 0;
}`,
      explanation: [
        "This is the degenerate minimum spanning tree question: all candidate new roads cost the same, so only connectivity matters. Union the existing roads to find the spanning forest, then count components.",
        "Joining c components into one always takes exactly c - 1 new roads, and any set of c - 1 roads that links distinct components works. Picking one representative per component and chaining them all to the first representative is the simplest such set.",
        "Representatives are found by scanning nodes 1..n and keeping those that are their own root, which avoids a second map. Slot 0 of the DSU is allocated but never used because cities are 1-indexed.",
        "Time: O((n + m) * alpha(n)). Space: O(n + m).",
      ],
    },
    {
      name: "Minimum Spanning Tree Weight with Kruskal",
      difficulty: "Easy",
      variation: "Kruskal",
      question: [
        "You are given a connected or disconnected weighted undirected graph with n nodes labeled from 0 to n - 1, described by a list of edges where each edge is a triple (weight, u, v). Return the total weight of a minimum spanning tree, or -1 if the graph is not connected. Implement it with the edge-sorting (Kruskal) approach.",
        "Example 1:\nInput: n = 4, edges = [(1,0,1),(2,1,2),(3,2,3),(4,0,3),(5,0,2)]\nOutput: 6\nExplanation: Taking edges of weight 1, 2 and 3 spans all four nodes.",
        "Example 2:\nInput: n = 3, edges = [(1,0,1)]\nOutput: -1\nExplanation: Node 2 is unreachable, so no spanning tree exists.",
        "Constraints:\n- 1 <= n <= 10^5\n- 0 <= edges.length <= 2 * 10^5\n- 1 <= weight <= 10^9\n- 0 <= u, v < n",
      ],
      code: `struct DSU {
    vector<int> parent, size;
    int components;
    DSU(int n) : parent(n), size(n, 1), components(n) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (size[a] < size[b]) swap(a, b);
        parent[b] = a;
        size[a] += size[b];
        components--;
        return true;
    }
};

// edges[i] = {weight, u, v}
long long kruskalMST(int n, vector<array<int, 3>> edges) {
    sort(edges.begin(), edges.end());
    DSU dsu(n);
    long long total = 0;
    int picked = 0;
    for (auto& e : edges) {
        if (dsu.unite(e[1], e[2])) {
            total += e[0];
            picked++;
            if (picked == n - 1) break;
        }
    }
    return picked == n - 1 ? total : -1;
}`,
      explanation: [
        "Kruskal scans edges from lightest to heaviest and keeps an edge only when its endpoints are in different components. The DSU is what makes the would-this-create-a-cycle test cheap.",
        "Correctness comes from the cut property: for any partition of the nodes into two sides, the lightest edge crossing that cut belongs to some minimum spanning tree. When Kruskal accepts an edge, that edge is the lightest one crossing the cut that separates one endpoint's current component from everything else, because all lighter edges were already examined and none of them crossed.",
        "The mirror image is the cycle property, which justifies the rejections: the heaviest edge of any cycle is in no minimum spanning tree, and a rejected edge is exactly the heaviest edge of the cycle it would have closed.",
        "Storing the weight first in the triple lets the default lexicographic sort do the ordering, and the loop stops early once n - 1 edges are chosen. Fewer than n - 1 means the graph is disconnected.",
        "Time: O(m log m). Space: O(n + m).",
      ],
    },
    {
      name: "Minimum Spanning Tree Weight with Prim and a Heap",
      difficulty: "Medium",
      variation: "Prim with a heap",
      question: [
        "You are given a weighted undirected graph with n nodes labeled from 0 to n - 1 as an adjacency list where adj[u] holds pairs (v, w) for each edge u-v of weight w. Return the total weight of a minimum spanning tree, or -1 if the graph is not connected. Implement it with the grow-one-tree (Prim) approach using a priority queue.",
        "Example 1:\nInput: n = 4, adj = [[(1,1),(3,4),(2,5)],[(0,1),(2,2)],[(1,2),(3,3),(0,5)],[(2,3),(0,4)]]\nOutput: 6",
        "Example 2:\nInput: n = 2, adj = [[],[]]\nOutput: -1",
        "Constraints:\n- 1 <= n <= 10^5\n- The total number of adjacency entries is at most 4 * 10^5\n- 1 <= w <= 10^9",
      ],
      code: `long long primMST(int n, vector<vector<pair<int, int>>>& adj) {
    vector<char> inMST(n, 0);
    priority_queue<pair<long long, int>, vector<pair<long long, int>>,
                   greater<pair<long long, int>>> pq;
    pq.push({0LL, 0});
    long long total = 0;
    int taken = 0;
    while (!pq.empty()) {
        pair<long long, int> top = pq.top();
        pq.pop();
        long long w = top.first;
        int u = top.second;
        if (inMST[u]) continue;
        inMST[u] = 1;
        total += w;
        taken++;
        for (auto& pr : adj[u]) {
            int v = pr.first, wt = pr.second;
            if (!inMST[v]) pq.push({(long long)wt, v});
        }
    }
    return taken == n ? total : -1;
}`,
      explanation: [
        "Prim keeps a single growing tree. The heap holds candidate crossing edges; popping the smallest gives the cheapest edge leaving the current tree, which by the cut property belongs to some minimum spanning tree.",
        "This is the lazy variant: instead of decreasing keys, stale entries are simply pushed and skipped later with the inMST check. Every adjacency entry is pushed at most once, so the heap holds at most m items and the asymptotics are unchanged while the code stays short.",
        "The starting node contributes weight 0. If the loop ends with fewer than n nodes taken, the start node's component does not cover the graph and no spanning tree exists.",
        "Prim with a heap is preferable on sparse graphs given as adjacency lists; on dense graphs the O(n^2) array version of Prim beats both Prim-with-heap and Kruskal because it never sorts m edges.",
        "Time: O(m log m). Space: O(n + m).",
      ],
    },
    {
      name: "Road Reparation",
      difficulty: "Medium",
      variation: "Kruskal",
      link: "https://cses.fi/problemset/task/1675",
      question: [
        "There are n cities and m roads between them. Unfortunately the condition of the roads is so poor that they cannot be used. Your task is to determine the minimum cost of repairing roads so that there is a route between any two cities. Print the minimum total cost, or IMPOSSIBLE if there is no solution.",
        "Example 1:\nInput:\n5 6\n1 2 3\n2 3 5\n2 4 2\n3 5 7\n1 4 1\n4 5 4\nOutput:\n10\nExplanation: Repair the roads of cost 1, 2, 3 and 4.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= m <= 2 * 10^5\n- 1 <= a, b <= n\n- 1 <= c <= 10^9",
      ],
      code: `#include <bits/stdc++.h>
using namespace std;

struct DSU {
    vector<int> parent, size;
    int components;
    DSU(int n) : parent(n), size(n, 1), components(n) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (size[a] < size[b]) swap(a, b);
        parent[b] = a;
        size[a] += size[b];
        components--;
        return true;
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<array<long long, 3>> edges(m);
    for (int i = 0; i < m; i++) {
        long long a, b, c;
        cin >> a >> b >> c;
        edges[i] = {c, a, b};
    }
    sort(edges.begin(), edges.end());
    DSU dsu(n + 1);
    long long total = 0;
    int picked = 0;
    for (auto& e : edges) {
        if (dsu.unite((int)e[1], (int)e[2])) {
            total += e[0];
            picked++;
            if (picked == n - 1) break;
        }
    }
    if (picked != n - 1) cout << "IMPOSSIBLE" << '\\n';
    else cout << total << '\\n';
    return 0;
}`,
      explanation: [
        "Plain Kruskal. Costs go up to 10^9 and up to 10^5 - 1 edges can be chosen, so the running total must be a 64-bit integer; accumulating in int overflows.",
        "The greedy choice is safe by the cut property: each accepted edge is the cheapest road crossing the cut between one endpoint's current component and the rest, so some optimal repair plan contains it.",
        "If fewer than n - 1 roads are accepted the road network was disconnected to begin with and no repair plan can connect everything, which is the IMPOSSIBLE case.",
        "Time: O(m log m). Space: O(m).",
      ],
    },
    {
      name: "Min Cost to Connect All Points",
      difficulty: "Medium",
      variation: "Prim on a dense graph",
      link: "https://leetcode.com/problems/min-cost-to-connect-all-points/",
      question: [
        "You are given an array points representing integer coordinates of some points on a 2D plane where points[i] = [xi, yi]. The cost of connecting two points is the Manhattan distance between them, that is |xi - xj| + |yi - yj|. Return the minimum cost to make all points connected, where all points are connected if there is exactly one simple path between any two points.",
        "Example 1:\nInput: points = [[0,0],[2,2],[3,10],[5,2],[7,0]]\nOutput: 20",
        "Example 2:\nInput: points = [[3,12],[-2,5],[-4,1]]\nOutput: 18",
        "Constraints:\n- 1 <= points.length <= 1000\n- -10^6 <= xi, yi <= 10^6\n- All pairs of points are distinct",
      ],
      code: `int minCostConnectPoints(vector<vector<int>>& points) {
    int n = points.size();
    if (n <= 1) return 0;
    vector<int> minDist(n, INT_MAX);
    vector<char> used(n, 0);
    minDist[0] = 0;
    long long total = 0;
    for (int iter = 0; iter < n; iter++) {
        int u = -1;
        for (int v = 0; v < n; v++)
            if (!used[v] && (u == -1 || minDist[v] < minDist[u])) u = v;
        used[u] = 1;
        total += minDist[u];
        for (int v = 0; v < n; v++) {
            if (used[v]) continue;
            int w = abs(points[u][0] - points[v][0]) + abs(points[u][1] - points[v][1]);
            if (w < minDist[v]) minDist[v] = w;
        }
    }
    return (int)total;
}`,
      explanation: [
        "The graph is complete: every pair of points is an edge, so m is about n^2 / 2. Materialising and sorting all n^2 / 2 edges for Kruskal would be roughly 500000 edges plus a sort, whereas the O(n^2) array version of Prim never builds the edge list at all.",
        "minDist[v] holds the cheapest known edge from the current tree to the outside node v. Each round picks the outside node with the smallest such value, which is exactly the cheapest edge crossing the cut, then relaxes minDist for the remaining nodes against the newly added node only.",
        "By the cut property the chosen edge is safe, so after n rounds the accumulated total is a minimum spanning tree weight. Distances are computed on the fly, which keeps memory linear.",
        "Time: O(n^2). Space: O(n).",
      ],
    },
    {
      name: "Connecting Cities With Minimum Cost",
      difficulty: "Medium",
      variation: "Kruskal with connectivity check",
      question: [
        "There are n cities labeled from 1 to n. You are given connections where connections[i] = [xi, yi, costi] indicates that the cost of connecting city xi and city yi is costi. Return the minimum cost to connect all n cities so that there is at least one path between each pair of cities. If it is impossible to connect all cities, return -1.",
        "Example 1:\nInput: n = 3, connections = [[1,2,5],[1,3,6],[2,3,1]]\nOutput: 6\nExplanation: Choose the connections of cost 1 and 5.",
        "Example 2:\nInput: n = 4, connections = [[1,2,3],[3,4,4]]\nOutput: -1\nExplanation: Cities 1 and 2 cannot reach cities 3 and 4.",
        "Constraints:\n- 1 <= n <= 10^4\n- 1 <= connections.length <= 10^4\n- connections[i].length == 3\n- 1 <= xi, yi <= n and xi != yi\n- 0 <= costi <= 10^5",
      ],
      code: `struct DSU {
    vector<int> parent, size;
    int components;
    DSU(int n) : parent(n), size(n, 1), components(n) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (size[a] < size[b]) swap(a, b);
        parent[b] = a;
        size[a] += size[b];
        components--;
        return true;
    }
};

int minimumCost(int n, vector<vector<int>>& connections) {
    sort(connections.begin(), connections.end(),
         [](const vector<int>& a, const vector<int>& b) { return a[2] < b[2]; });
    DSU dsu(n + 1);
    long long total = 0;
    int picked = 0;
    for (auto& c : connections) {
        if (dsu.unite(c[0], c[1])) {
            total += c[2];
            picked++;
            if (picked == n - 1) break;
        }
    }
    return picked == n - 1 ? (int)total : -1;
}`,
      explanation: [
        "Textbook Kruskal on 1-indexed cities. Because the cost sits in the third slot rather than the first, an explicit comparator is needed instead of the default lexicographic order.",
        "The DSU is sized n + 1 and slot 0 is never touched, so connectivity is verified by counting accepted edges rather than by reading the component counter, which would report 2 for a fully connected graph.",
        "Note that a cost of 0 is allowed; Kruskal handles zero and repeated weights without any special case, since the argument only relies on non-decreasing order.",
        "Time: O(m log m). Space: O(n).",
      ],
    },
    {
      name: "Maximum Spanning Tree",
      difficulty: "Medium",
      variation: "Kruskal reversed (maximum spanning tree)",
      question: [
        "You are given a weighted undirected graph with n nodes labeled from 0 to n - 1 as a list of edges, each a triple (weight, u, v). Return the maximum possible total weight of a spanning tree of the graph, or -1 if the graph is not connected.",
        "Example 1:\nInput: n = 4, edges = [(1,0,1),(2,1,2),(3,2,3),(4,0,3),(5,0,2)]\nOutput: 12\nExplanation: Taking weights 5, 4 and 3 spans all four nodes.",
        "Example 2:\nInput: n = 3, edges = [(7,0,1)]\nOutput: -1",
        "Constraints:\n- 1 <= n <= 10^5\n- 0 <= edges.length <= 2 * 10^5\n- 1 <= weight <= 10^9\n- 0 <= u, v < n",
      ],
      code: `struct DSU {
    vector<int> parent, size;
    int components;
    DSU(int n) : parent(n), size(n, 1), components(n) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (size[a] < size[b]) swap(a, b);
        parent[b] = a;
        size[a] += size[b];
        components--;
        return true;
    }
};

// edges[i] = {weight, u, v}
long long maximumSpanningTree(int n, vector<array<int, 3>> edges) {
    sort(edges.rbegin(), edges.rend());
    DSU dsu(n);
    long long total = 0;
    int picked = 0;
    for (auto& e : edges) {
        if (dsu.unite(e[1], e[2])) {
            total += e[0];
            picked++;
            if (picked == n - 1) break;
        }
    }
    return picked == n - 1 ? total : -1;
}`,
      explanation: [
        "Kruskal's proof never uses the sign or direction of the weights, only that edges are examined in a consistent order. Reversing the sort turns the cut property into its dual - for any cut, the heaviest crossing edge lies in some maximum spanning tree - so the same greedy loop is correct.",
        "An equivalent framing is to negate every weight and run the ordinary minimum spanning tree algorithm; the reverse iterator version avoids the negation and any overflow worries around it.",
        "This variant shows up whenever the objective is bottleneck maximisation, for example maximising the minimum capacity link that must be crossed, since the maximum spanning tree is also a maximum-bottleneck tree.",
        "Time: O(m log m). Space: O(n + m).",
      ],
    },
    {
      name: "Path With Minimum Effort",
      difficulty: "Medium",
      variation: "Bottleneck path via Kruskal",
      link: "https://leetcode.com/problems/path-with-minimum-effort/",
      question: [
        "You are a hiker preparing for a trip and are given heights, a rows x columns 2D array where heights[row][col] is the height of the cell. You start at the top-left cell and want to travel to the bottom-right cell, moving up, down, left or right. The effort of a route is the maximum absolute difference in heights between two consecutive cells of the route. Return the minimum effort required to travel from the top-left cell to the bottom-right cell.",
        "Example 1:\nInput: heights = [[1,2,2],[3,8,2],[5,3,5]]\nOutput: 2\nExplanation: The route [1,2,2,2,5] has a maximum absolute difference of 2, better than the route through 8.",
        "Example 2:\nInput: heights = [[1,2,3],[3,8,4],[5,3,5]]\nOutput: 1",
        "Constraints:\n- rows == heights.length\n- columns == heights[i].length\n- 1 <= rows, columns <= 100\n- 1 <= heights[i][j] <= 10^6",
      ],
      code: `struct DSU {
    vector<int> parent, size;
    int components;
    DSU(int n) : parent(n), size(n, 1), components(n) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (size[a] < size[b]) swap(a, b);
        parent[b] = a;
        size[a] += size[b];
        components--;
        return true;
    }
};

int minimumEffortPath(vector<vector<int>>& heights) {
    int m = heights.size(), n = heights[0].size();
    if (m * n == 1) return 0;
    vector<array<int, 3>> edges;
    edges.reserve(2 * m * n);
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            int id = r * n + c;
            if (r + 1 < m)
                edges.push_back({abs(heights[r][c] - heights[r + 1][c]), id, id + n});
            if (c + 1 < n)
                edges.push_back({abs(heights[r][c] - heights[r][c + 1]), id, id + 1});
        }
    }
    sort(edges.begin(), edges.end());
    DSU dsu(m * n);
    for (auto& e : edges) {
        dsu.unite(e[1], e[2]);
        if (dsu.find(0) == dsu.find(m * n - 1)) return e[0];
    }
    return 0;
}`,
      explanation: [
        "The objective is a bottleneck, not a sum: minimise the largest edge used. Add grid edges in increasing weight order and stop the moment the start and target become connected; the weight of the edge that closed the connection is the answer.",
        "This works because the minimum-bottleneck path between any two nodes has the same bottleneck as their path in the minimum spanning tree. Kruskal builds that tree in weight order, so the first threshold at which the two cells join is exactly the minimax value.",
        "Adding only the right and down neighbour per cell covers every grid edge once, since the graph is undirected. The alternatives are Dijkstra with max instead of plus, or binary search on the answer plus a flood fill; the Kruskal version needs no distance array.",
        "Time: O(m * n * log(m * n)). Space: O(m * n).",
      ],
    },
    {
      name: "Minimum Spanning Tree Uniqueness",
      difficulty: "Medium",
      variation: "Kruskal, equal-weight classes",
      question: [
        "You are given a connected weighted undirected graph with n nodes labeled from 0 to n - 1 as a list of edges, each a triple (weight, u, v). Determine whether the minimum spanning tree is unique, that is whether exactly one set of n - 1 edges achieves the minimum total weight. Return true if it is unique and false otherwise.",
        "Example 1:\nInput: n = 3, edges = [(1,0,1),(2,1,2),(3,0,2)]\nOutput: true\nExplanation: The only minimum spanning tree uses weights 1 and 2.",
        "Example 2:\nInput: n = 3, edges = [(1,0,1),(2,1,2),(2,0,2)]\nOutput: false\nExplanation: Either weight-2 edge can complete the tree.",
        "Constraints:\n- 1 <= n <= 10^5\n- n - 1 <= edges.length <= 2 * 10^5\n- 1 <= weight <= 10^9\n- 0 <= u, v < n and the graph is connected",
      ],
      code: `struct DSU {
    vector<int> parent, size;
    int components;
    DSU(int n) : parent(n), size(n, 1), components(n) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (size[a] < size[b]) swap(a, b);
        parent[b] = a;
        size[a] += size[b];
        components--;
        return true;
    }
};

// edges[i] = {weight, u, v}
bool isMSTUnique(int n, vector<array<int, 3>> edges) {
    sort(edges.begin(), edges.end());
    DSU dsu(n);
    int m = edges.size();
    int i = 0;
    while (i < m) {
        int j = i;
        while (j < m && edges[j][0] == edges[i][0]) j++;
        int candidates = 0;
        for (int k = i; k < j; k++)
            if (dsu.find(edges[k][1]) != dsu.find(edges[k][2])) candidates++;
        int accepted = 0;
        for (int k = i; k < j; k++)
            if (dsu.unite(edges[k][1], edges[k][2])) accepted++;
        if (candidates > accepted) return false;
        i = j;
    }
    return true;
}`,
      explanation: [
        "Kruskal is only ever ambiguous inside a block of equal-weight edges: across different weights the choice is forced. So process the edges weight class by weight class.",
        "For one weight class, first count how many of its edges are useful, meaning their endpoints are still in different components at the moment the class begins. Then apply the unions and count how many were actually accepted. If more edges were useful than accepted, at least one useful edge got crowded out by an interchangeable sibling of the same weight, and swapping them yields a different tree of the same total weight.",
        "The two loops must be separated. Counting and uniting in a single pass would see components that the current class has already merged, undercount the candidates, and wrongly report uniqueness.",
        "Time: O(m log m). Space: O(n + m).",
      ],
    },
    {
      name: "Optimize Water Distribution in a Village",
      difficulty: "Hard",
      variation: "Kruskal with a virtual source node",
      question: [
        "There are n houses in a village labeled from 1 to n. You must supply water to all of them by either building a well inside a house or laying pipes between houses. The cost of building a well in house i is wells[i - 1], and the cost of laying a pipe is given by pipes where pipes[j] = [house1, house2, cost]. Return the minimum total cost to supply water to all houses.",
        "Example 1:\nInput: n = 3, wells = [1,2,2], pipes = [[1,2,1],[2,3,1]]\nOutput: 3\nExplanation: Build a well in house 1 for 1, then pipe 1-2 for 1 and 2-3 for 1.",
        "Example 2:\nInput: n = 2, wells = [1,1], pipes = [[1,2,1]]\nOutput: 2\nExplanation: Two wells cost 2, which ties the well-plus-pipe option.",
        "Constraints:\n- 1 <= n <= 10^4\n- wells.length == n\n- 0 <= wells[i] <= 10^5\n- 1 <= pipes.length <= 10^4\n- pipes[j].length == 3\n- 1 <= house1, house2 <= n and house1 != house2\n- 0 <= cost <= 10^5",
      ],
      code: `struct DSU {
    vector<int> parent, size;
    int components;
    DSU(int n) : parent(n), size(n, 1), components(n) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (size[a] < size[b]) swap(a, b);
        parent[b] = a;
        size[a] += size[b];
        components--;
        return true;
    }
};

int minCostToSupplyWater(int n, vector<int>& wells, vector<vector<int>>& pipes) {
    vector<array<int, 3>> edges;
    edges.reserve(n + pipes.size());
    // Node 0 is a virtual water source; a well is an edge from the source.
    for (int i = 0; i < n; i++) edges.push_back({wells[i], 0, i + 1});
    for (auto& p : pipes) edges.push_back({p[2], p[0], p[1]});
    sort(edges.begin(), edges.end());
    DSU dsu(n + 1);
    long long total = 0;
    int picked = 0;
    for (auto& e : edges) {
        if (dsu.unite(e[1], e[2])) {
            total += e[0];
            picked++;
            if (picked == n) break;
        }
    }
    return (int)total;
}`,
      explanation: [
        "The two cost types look different but are the same thing once a virtual node 0 representing the water source is added: building a well in house i is an edge of weight wells[i - 1] from the source to house i, and a pipe is an ordinary edge.",
        "A house has water exactly when it is connected to the virtual source, so supplying every house means connecting all n + 1 nodes. That is a minimum spanning tree on n + 1 nodes, which needs n edges, and Kruskal solves it directly.",
        "The graph is always connected because every house has a well edge, so the picked count always reaches n and no impossibility case exists. The virtual-source pattern generalises to any problem mixing per-node activation costs with pairwise linking costs.",
        "Time: O((n + m) log(n + m)). Space: O(n + m).",
      ],
    },
    {
      name: "Find Critical and Pseudo-Critical Edges in Minimum Spanning Tree",
      difficulty: "Hard",
      variation: "MST with forced and banned edges",
      link: "https://leetcode.com/problems/find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree/",
      question: [
        "Given a weighted undirected connected graph with n vertices numbered from 0 to n - 1 and an array edges where edges[i] = [ai, bi, weighti], find all the critical and pseudo-critical edges in the minimum spanning tree. An edge is critical if deleting it from the graph would cause the minimum spanning tree weight to increase. An edge is pseudo-critical if it can appear in some minimum spanning tree but is not critical. Return them as a list of two lists of edge indices, in any order.",
        "Example 1:\nInput: n = 5, edges = [[0,1,1],[1,2,1],[2,3,2],[0,3,2],[0,4,3],[3,4,3],[1,4,6]]\nOutput: [[0,1],[2,3,4,5]]",
        "Example 2:\nInput: n = 4, edges = [[0,1,1],[1,2,1],[2,3,1],[0,3,1]]\nOutput: [[],[0,1,2,3]]\nExplanation: Every edge appears in some minimum spanning tree and none is critical.",
        "Constraints:\n- 2 <= n <= 100\n- 1 <= edges.length <= min(200, n * (n - 1) / 2)\n- edges[i].length == 3\n- 0 <= ai < bi < n\n- 1 <= weighti <= 1000\n- All pairs are distinct",
      ],
      code: `struct DSU {
    vector<int> parent, size;
    int components;
    DSU(int n) : parent(n), size(n, 1), components(n) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (size[a] < size[b]) swap(a, b);
        parent[b] = a;
        size[a] += size[b];
        components--;
        return true;
    }
};

vector<vector<int>> findCriticalAndPseudoCriticalEdges(int n, vector<vector<int>>& edges) {
    int m = edges.size();
    vector<int> order(m);
    for (int i = 0; i < m; i++) order[i] = i;
    sort(order.begin(), order.end(),
         [&](int a, int b) { return edges[a][2] < edges[b][2]; });

    auto mstWeight = [&](int forced, int banned) -> int {
        DSU dsu(n);
        int total = 0, picked = 0;
        if (forced >= 0) {
            dsu.unite(edges[forced][0], edges[forced][1]);
            total += edges[forced][2];
            picked++;
        }
        for (int idx : order) {
            if (idx == banned || idx == forced) continue;
            if (dsu.unite(edges[idx][0], edges[idx][1])) {
                total += edges[idx][2];
                picked++;
            }
        }
        return picked == n - 1 ? total : INT_MAX;
    };

    int base = mstWeight(-1, -1);
    vector<int> critical, pseudo;
    for (int i = 0; i < m; i++) {
        if (mstWeight(-1, i) > base) critical.push_back(i);
        else if (mstWeight(i, -1) == base) pseudo.push_back(i);
    }
    return {critical, pseudo};
}`,
      explanation: [
        "With n at most 100 and m at most 200, the direct definition is affordable: run Kruskal once for the baseline weight, then twice more per edge.",
        "Banning edge i and rebuilding tells you whether it is critical - if the best achievable weight rises (or the graph falls apart, treated as infinity), no minimum spanning tree can avoid it. Forcing edge i in first and rebuilding tells you whether it can appear at all - if the resulting weight still equals the baseline, some minimum spanning tree contains it.",
        "Forcing must happen before the sorted loop so the edge is in the tree regardless of its weight, and it must then be skipped inside the loop so it is not considered twice.",
        "Sorting the edge indices once outside the lambda avoids re-sorting on every one of the 2m + 1 Kruskal runs.",
        "Time: O(m^2 * alpha(n)) after one O(m log m) sort. Space: O(n + m).",
      ],
    },
    {
      name: "Minimum Spanning Tree with Boruvka's Algorithm",
      difficulty: "Hard",
      variation: "Boruvka (component-wise cheapest edge)",
      question: [
        "You are given a weighted undirected graph with n nodes labeled from 0 to n - 1 as a list of edges, each a triple (weight, u, v). Return the total weight of a minimum spanning tree, or -1 if the graph is not connected. Implement Boruvka's algorithm, which repeatedly selects the cheapest outgoing edge of every component at once.",
        "Example 1:\nInput: n = 4, edges = [(1,0,1),(2,1,2),(3,2,3),(4,0,3),(5,0,2)]\nOutput: 6",
        "Example 2:\nInput: n = 4, edges = [(1,0,1),(1,2,3)]\nOutput: -1",
        "Constraints:\n- 1 <= n <= 10^5\n- 0 <= edges.length <= 2 * 10^5\n- 1 <= weight <= 10^9\n- 0 <= u, v < n",
      ],
      code: `struct DSU {
    vector<int> parent, size;
    int components;
    DSU(int n) : parent(n), size(n, 1), components(n) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (size[a] < size[b]) swap(a, b);
        parent[b] = a;
        size[a] += size[b];
        components--;
        return true;
    }
};

// edges[i] = {weight, u, v}
long long boruvkaMST(int n, vector<array<int, 3>>& edges) {
    int m = edges.size();
    DSU dsu(n);
    long long total = 0;
    // Strict tie-break by index so equal weights can never form a cycle.
    auto better = [&](int i, int j) {
        if (j == -1) return true;
        if (edges[i][0] != edges[j][0]) return edges[i][0] < edges[j][0];
        return i < j;
    };
    while (dsu.components > 1) {
        vector<int> best(n, -1);
        for (int i = 0; i < m; i++) {
            int a = dsu.find(edges[i][1]);
            int b = dsu.find(edges[i][2]);
            if (a == b) continue;
            if (better(i, best[a])) best[a] = i;
            if (better(i, best[b])) best[b] = i;
        }
        bool merged = false;
        for (int r = 0; r < n; r++) {
            if (best[r] == -1) continue;
            int i = best[r];
            if (dsu.unite(edges[i][1], edges[i][2])) {
                total += edges[i][0];
                merged = true;
            }
        }
        if (!merged) return -1;
    }
    return total;
}`,
      explanation: [
        "Boruvka works in rounds. In each round every current component independently finds its own cheapest outgoing edge, and all of those edges are added together. Each such edge is the lightest edge crossing the cut that separates its component from the rest, so the cut property makes all of them safe simultaneously.",
        "Every surviving component merges with at least one other in a round, so the component count at least halves and there are at most log n rounds. Each round rescans the edge list, giving O(m log n) overall without ever sorting.",
        "Ties must be broken deterministically, here by edge index. Without a strict total order, two components can each pick the same-weight edge pointing at the other and the batch of selected edges can contain a cycle, producing a non-tree. The DSU union call also silently drops the duplicate when two components pick the same edge.",
        "A round that merges nothing while more than one component remains means the graph is disconnected.",
        "Time: O(m log n). Space: O(n + m).",
      ],
    },
    {
      name: "Minimum Cost to Connect Pre-Grouped Nodes",
      difficulty: "Hard",
      variation: "Kruskal on a pre-seeded DSU",
      question: [
        "You are given n nodes labeled from 0 to n - 1, an array group of length n where group[i] is the identifier of the group node i belongs to, and a list of weighted edges, each a triple (weight, u, v). Nodes inside the same group are already connected to each other at no cost. Return the minimum total edge weight needed so that all n nodes end up connected, or -1 if that is impossible.",
        "Example 1:\nInput: n = 5, group = [0,0,1,1,2], edges = [(4,1,2),(7,3,4),(9,0,4)]\nOutput: 11\nExplanation: Groups {0,1}, {2,3} and {4} are free internally; the edges of weight 4 and 7 join all three groups.",
        "Example 2:\nInput: n = 4, group = [0,0,1,1], edges = []\nOutput: -1\nExplanation: The two groups have no edge between them.",
        "Constraints:\n- 1 <= n <= 10^5\n- group.length == n and 0 <= group[i] < n\n- 0 <= edges.length <= 2 * 10^5\n- 1 <= weight <= 10^9\n- 0 <= u, v < n",
      ],
      code: `struct DSU {
    vector<int> parent, size;
    int components;
    DSU(int n) : parent(n), size(n, 1), components(n) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (size[a] < size[b]) swap(a, b);
        parent[b] = a;
        size[a] += size[b];
        components--;
        return true;
    }
};

// edges[i] = {weight, u, v}
long long minCostConnectGroups(int n, vector<int>& group, vector<array<int, 3>> edges) {
    DSU dsu(n);
    unordered_map<int, int> firstOf;
    for (int i = 0; i < n; i++) {
        auto it = firstOf.find(group[i]);
        if (it == firstOf.end()) firstOf[group[i]] = i;
        else dsu.unite(i, it->second);
    }
    sort(edges.begin(), edges.end());
    long long total = 0;
    for (auto& e : edges)
        if (dsu.unite(e[1], e[2])) total += e[0];
    return dsu.components == 1 ? total : -1;
}`,
      explanation: [
        "Free internal connectivity is expressed by seeding the DSU before Kruskal starts: union every node with the first node seen from its group, so each group collapses into a single component with zero cost paid.",
        "From there, Kruskal runs unchanged over the weighted edges. The greedy argument is unaffected by the pre-seeding, because a DSU that already has some merges applied simply represents a graph in which those merges were free edges of weight 0, and the cut property still selects the lightest crossing edge for every remaining cut.",
        "This is the general pattern for minimum spanning forest completion: start the DSU from whatever is already connected, then run Kruskal only on the payable edges. The answer is feasible exactly when a single component remains.",
        "Time: O(n + m log m). Space: O(n + m).",
      ],
    },
    {
      name: "Second-Best Minimum Spanning Tree",
      difficulty: "Hard",
      variation: "MST edge exchange",
      question: [
        "You are given a connected weighted undirected graph with n nodes labeled from 0 to n - 1 as a list of edges, each a triple (weight, u, v). Return the smallest total weight of a spanning tree whose edge set differs from the minimum spanning tree that the algorithm produced, or -1 if no other spanning tree exists. The second-best weight may equal the minimum weight when the minimum spanning tree is not unique.",
        "Example 1:\nInput: n = 3, edges = [(1,0,1),(2,1,2),(3,0,2)]\nOutput: 4\nExplanation: The minimum spanning tree has weight 3; replacing the weight-2 edge with the weight-3 edge gives 4.",
        "Example 2:\nInput: n = 3, edges = [(1,0,1),(2,1,2),(2,0,2)]\nOutput: 3\nExplanation: The tree is not unique, so the second-best weight ties the best.",
        "Constraints:\n- 2 <= n <= 1000\n- n - 1 <= edges.length <= 2 * 10^5\n- 1 <= weight <= 10^9\n- 0 <= u, v < n and the graph is connected",
      ],
      code: `struct DSU {
    vector<int> parent, size;
    int components;
    DSU(int n) : parent(n), size(n, 1), components(n) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (size[a] < size[b]) swap(a, b);
        parent[b] = a;
        size[a] += size[b];
        components--;
        return true;
    }
};

// edges[i] = {weight, u, v}
long long secondBestMST(int n, vector<array<int, 3>> edges) {
    sort(edges.begin(), edges.end());
    int m = edges.size();
    DSU dsu(n);
    vector<vector<pair<int, int>>> tree(n);
    vector<char> inTree(m, 0);
    long long total = 0;
    int picked = 0;
    for (int i = 0; i < m; i++) {
        if (dsu.unite(edges[i][1], edges[i][2])) {
            inTree[i] = 1;
            total += edges[i][0];
            picked++;
            tree[edges[i][1]].push_back({edges[i][2], edges[i][0]});
            tree[edges[i][2]].push_back({edges[i][1], edges[i][0]});
        }
    }
    if (picked != n - 1) return -1;

    // maxEdge[s][v] = heaviest edge on the tree path from s to v.
    vector<vector<int>> maxEdge(n, vector<int>(n, 0));
    for (int s = 0; s < n; s++) {
        vector<char> seen(n, 0);
        queue<int> q;
        q.push(s);
        seen[s] = 1;
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (auto& pr : tree[u]) {
                int v = pr.first, w = pr.second;
                if (seen[v]) continue;
                seen[v] = 1;
                maxEdge[s][v] = max(maxEdge[s][u], w);
                q.push(v);
            }
        }
    }

    long long best = LLONG_MAX;
    for (int i = 0; i < m; i++) {
        if (inTree[i]) continue;
        int u = edges[i][1], v = edges[i][2];
        long long cand = total - maxEdge[u][v] + edges[i][0];
        best = min(best, cand);
    }
    return best == LLONG_MAX ? -1 : best;
}`,
      explanation: [
        "Any spanning tree other than the minimum one differs from it by at least one edge, and the cheapest such tree differs by exactly one swap: remove one tree edge and insert one non-tree edge that reconnects the two halves.",
        "Adding a non-tree edge (u, v) creates exactly one cycle, namely that edge plus the unique tree path from u to v. To keep the total as small as possible the removed edge must be the heaviest edge on that path, so the candidate weight is total - maxEdge[u][v] + w. The cycle property guarantees w is at least that heaviest edge, so no candidate ever undercuts the minimum.",
        "The heaviest edge on every tree path is precomputed by running a BFS from each node over the n - 1 tree edges, propagating a running maximum. For larger n this table is replaced by binary lifting or by Tarjan offline least-common-ancestor, both of which answer the same query in logarithmic or near-constant time.",
        "Time: O(m log m + n^2). Space: O(n^2 + m).",
      ],
    },
    {
      name: "Maximum Edge Weight on the MST Path Between Two Nodes",
      difficulty: "Hard",
      variation: "MST + binary lifting (minimax queries)",
      question: [
        "You are given a connected weighted undirected graph with n nodes labeled from 0 to n - 1 as a list of edges, each a triple (weight, u, v), plus q queries. For each query (a, b), report the smallest possible value of the heaviest edge on any path from a to b. Equivalently, report the heaviest edge on the path between a and b in a minimum spanning tree of the graph.",
        "Example 1:\nInput: n = 4, edges = [(1,0,1),(2,1,2),(3,2,3),(9,0,3)], queries = [(0,2),(0,3),(1,3)]\nOutput: [2,3,3]",
        "Example 2:\nInput: n = 2, edges = [(5,0,1),(7,0,1)], queries = [(0,1)]\nOutput: [5]",
        "Constraints:\n- 1 <= n <= 2 * 10^5\n- n - 1 <= edges.length <= 4 * 10^5\n- 1 <= weight <= 10^9\n- 1 <= q <= 2 * 10^5\n- The graph is connected",
      ],
      code: `struct DSU {
    vector<int> parent, size;
    int components;
    DSU(int n) : parent(n), size(n, 1), components(n) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (size[a] < size[b]) swap(a, b);
        parent[b] = a;
        size[a] += size[b];
        components--;
        return true;
    }
};

struct TreePathMax {
    int n, LOG;
    vector<vector<pair<int, int>>> adj;
    vector<vector<int>> up, mx;
    vector<int> depth;

    TreePathMax(int nodes) : n(nodes), adj(nodes), depth(nodes, 0) {
        LOG = 1;
        while ((1 << LOG) < max(n, 2)) LOG++;
        LOG++;
        up.assign(LOG, vector<int>(n, 0));
        mx.assign(LOG, vector<int>(n, 0));
    }

    void addEdge(int u, int v, int w) {
        adj[u].push_back({v, w});
        adj[v].push_back({u, w});
    }

    void build(int root) {
        vector<char> seen(n, 0);
        queue<int> q;
        q.push(root);
        seen[root] = 1;
        up[0][root] = root;
        mx[0][root] = 0;
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (auto& pr : adj[u]) {
                int v = pr.first, w = pr.second;
                if (seen[v]) continue;
                seen[v] = 1;
                depth[v] = depth[u] + 1;
                up[0][v] = u;
                mx[0][v] = w;
                q.push(v);
            }
        }
        for (int k = 1; k < LOG; k++) {
            for (int v = 0; v < n; v++) {
                up[k][v] = up[k - 1][up[k - 1][v]];
                mx[k][v] = max(mx[k - 1][v], mx[k - 1][up[k - 1][v]]);
            }
        }
    }

    int query(int u, int v) {
        if (depth[u] < depth[v]) swap(u, v);
        int res = 0;
        int diff = depth[u] - depth[v];
        for (int k = 0; k < LOG; k++) {
            if (diff & (1 << k)) {
                res = max(res, mx[k][u]);
                u = up[k][u];
            }
        }
        if (u == v) return res;
        for (int k = LOG - 1; k >= 0; k--) {
            if (up[k][u] != up[k][v]) {
                res = max(res, mx[k][u]);
                res = max(res, mx[k][v]);
                u = up[k][u];
                v = up[k][v];
            }
        }
        res = max(res, mx[0][u]);
        res = max(res, mx[0][v]);
        return res;
    }
};

// edges[i] = {weight, u, v}
vector<int> maxEdgeOnMSTPath(int n, vector<array<int, 3>> edges,
                             vector<pair<int, int>>& queries) {
    sort(edges.begin(), edges.end());
    DSU dsu(n);
    TreePathMax t(n);
    for (auto& e : edges)
        if (dsu.unite(e[1], e[2])) t.addEdge(e[1], e[2], e[0]);
    t.build(0);
    vector<int> res;
    res.reserve(queries.size());
    for (auto& q : queries) res.push_back(t.query(q.first, q.second));
    return res;
}`,
      explanation: [
        "The minimum spanning tree is also a minimum-bottleneck spanning tree: for any pair of nodes, the heaviest edge on their tree path equals the smallest achievable maximum edge over all paths in the whole graph. So the query reduces to a path-maximum query on the tree.",
        "Why the reduction holds: suppose some graph path from a to b had a strictly smaller maximum edge W. Then all edges of that path are lighter than the heaviest tree-path edge e, so deleting e and reconnecting through that path would give a lighter spanning tree, contradicting minimality. This is the cycle property again.",
        "Binary lifting stores, for each node and each power of two, both the ancestor and the maximum edge weight along that jump. A query lifts the deeper node to equal depth while tracking the maximum, then lifts both together until their parents coincide, and finally accounts for the last two edges into the least common ancestor.",
        "The tree is rooted with a BFS rather than a recursive depth-first search so that a path of 2 * 10^5 nodes cannot overflow the call stack. The root's parent is set to itself, which makes over-long jumps harmless.",
        "Time: O(m log m + n log n + q log n). Space: O(n log n).",
      ],
    },
  ],
};
