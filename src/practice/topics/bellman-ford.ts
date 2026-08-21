import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Shortest Path in a Weighted DAG with Negative Edges",
      difficulty: "Easy",
      variation: "Relaxation in topological order",
      question: [
        "Given a directed acyclic graph with n nodes numbered 0..n-1 (adjacency list adj where adj[u] holds pairs (v, w)) and a source src, return the shortest distance from src to every node. Edge weights may be negative. Report a large sentinel for unreachable nodes.",
        "Example 1:\nInput: n = 4, adj = [[(1,2),(2,5)], [(2,-4)], [(3,1)], []], src = 0\nOutput: [0, 2, -2, -1]\nExplanation: 0 -> 1 -> 2 costs -2, beating the direct edge of weight 5.",
        "Constraints:\n- 1 <= n <= 10^5\n- 0 <= number of edges <= 2 * 10^5\n- -10^9 <= w <= 10^9\n- The graph has no cycles",
      ],
      code: `vector<long long> dagShortestPath(int n, vector<vector<pair<int,int>>>& adj, int src) {
    vector<int> indeg(n, 0);
    for (int u = 0; u < n; u++) {
        for (auto& p : adj[u]) indeg[p.first]++;
    }
    queue<int> q;
    for (int u = 0; u < n; u++) {
        if (indeg[u] == 0) q.push(u);
    }
    vector<int> order;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        order.push_back(u);
        for (auto& p : adj[u]) {
            if (--indeg[p.first] == 0) q.push(p.first);
        }
    }
    const long long INF = (long long)4e18;
    vector<long long> dist(n, INF);
    dist[src] = 0;
    for (int u : order) {
        if (dist[u] == INF) continue;
        for (auto& [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
        }
    }
    return dist;
}`,
      explanation: [
        "Dijkstra cannot handle negative edges, but on a DAG there is a cheaper fix than Bellman-Ford. Process nodes in topological order: when u is reached, every predecessor of u has already been processed, so dist[u] is final before any of its outgoing edges are relaxed.",
        "That gives a single relaxation pass instead of V-1 rounds. This is the right baseline to know, because it isolates what Bellman-Ford really buys you - the ability to cope with cycles, not merely with negative weights.",
        "Unreachable nodes are skipped rather than relaxed so the INF sentinel never participates in arithmetic and overflow is impossible.",
        "Time: O(V + E). Space: O(V + E).",
      ],
    },
    {
      name: "Relaxation Rounds Needed by Bellman-Ford",
      difficulty: "Easy",
      variation: "Early termination, round counting",
      question: [
        "Implement Bellman-Ford so that it also reports how many full relaxation rounds were actually needed before the distances stopped changing. Given n nodes, an edge list edges[i] = [u, v, w] and a source src, return the distance array together with the number of rounds used, or -1 rounds if a negative cycle is reachable from src.",
        "Example 1:\nInput: n = 4, edges = [[0,1,1],[1,2,1],[2,3,1]], src = 0\nOutput: dist = [0,1,2,3], rounds = 3\nExplanation: The path 0 -> 1 -> 2 -> 3 has three edges, so three rounds are needed if the edges happen to be relaxed in a favourable order.",
        "Example 2:\nInput: n = 3, edges = [[0,1,1],[1,2,-3],[2,1,1]], src = 0\nOutput: rounds = -1\nExplanation: The cycle 1 -> 2 -> 1 has total weight -2.",
        "Constraints:\n- 1 <= n <= 500\n- 0 <= edges.length <= 5000\n- -10^6 <= w <= 10^6",
      ],
      code: `pair<vector<long long>, int> bellmanFordRounds(int n, vector<vector<int>>& edges, int src) {
    const long long INF = (long long)1e18;
    vector<long long> dist(n, INF);
    dist[src] = 0;
    int rounds = 0;
    for (int i = 0; i < n; i++) {
        bool changed = false;
        for (auto& e : edges) {
            int u = e[0], v = e[1], w = e[2];
            if (dist[u] == INF) continue;
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                changed = true;
            }
        }
        if (!changed) break;
        rounds = i + 1;
        if (i == n - 1) return {dist, -1};
    }
    return {dist, rounds};
}`,
      explanation: [
        "Claim: after round i, dist[v] is at most the weight of the cheapest path from src to v that uses at most i edges. Proof by induction - round i relaxes every edge once, so any path of i edges has its last edge relaxed after its prefix of i-1 edges was already correct by the previous round.",
        "A shortest path in a graph with no negative cycle is simple, so it has at most n-1 edges. Hence n-1 rounds are always sufficient, and the loop can stop early the moment a round changes nothing, because with no change the next round would relax nothing either.",
        "Contrapositive of the same bound: if round n (the n-th round, index n-1) still improves something, some shortest walk uses n or more edges, which means it repeats a node and the repeated portion has negative total weight. That is exactly a negative cycle, so the function reports -1.",
        "Time: O(V * E). Space: O(V).",
      ],
    },
    {
      name: "Distance from the Source (Bellman-Ford)",
      difficulty: "Medium",
      variation: "Single-source with negative weights",
      link: "https://www.geeksforgeeks.org/bellman-ford-algorithm-dp-23/",
      question: [
        "Given a weighted directed graph with V vertices numbered 0..V-1 and an edge list edges where edges[i] = [u, v, w] (w may be negative), and a source vertex src, compute the shortest distance from src to every vertex. Use 10^8 as the value for unreachable vertices. If the graph contains a negative-weight cycle reachable from src, return an array containing only -1.",
        "Example 1:\nInput: V = 5, edges = [[1,3,2],[4,3,-1],[2,4,1],[1,2,1],[0,1,5]], src = 0\nOutput: [0, 5, 6, 6, 7]",
        "Example 2:\nInput: V = 2, edges = [[0,1,5]], src = 1\nOutput: [100000000, 0]",
        "Constraints:\n- 1 <= V <= 500\n- 1 <= edges.length <= V * (V - 1)\n- -1000 <= w <= 1000",
      ],
      code: `vector<int> bellmanFord(int V, vector<vector<int>>& edges, int src) {
    const long long INF = 100000000LL;
    vector<long long> dist(V, INF);
    dist[src] = 0;
    for (int round = 0; round < V - 1; round++) {
        bool changed = false;
        for (auto& e : edges) {
            int u = e[0], v = e[1], w = e[2];
            if (dist[u] == INF) continue;
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                changed = true;
            }
        }
        if (!changed) break;
    }
    for (auto& e : edges) {
        int u = e[0], v = e[1], w = e[2];
        if (dist[u] == INF) continue;
        if (dist[u] + w < dist[v]) return vector<int>{-1};
    }
    vector<int> res(V);
    for (int i = 0; i < V; i++) res[i] = (int)dist[i];
    return res;
}`,
      explanation: [
        "Bellman-Ford does not pick a next node to settle - it simply relaxes every edge, V-1 times over. That is what lets it survive negative weights: it never commits to a distance, so a later negative edge can still pull a value down.",
        "Why V-1 rounds are enough: with no negative cycle, some shortest path to each vertex is simple and so uses at most V-1 edges, and round i guarantees correctness for all paths of at most i edges.",
        "The extra pass afterwards is the negative-cycle test. If any edge still relaxes after V-1 rounds, no finite shortest path exists for the affected vertices, because a cycle of negative total weight can be looped forever.",
        "The dist[u] == INF guard matters: without it, INF + a negative weight would look like an improvement and manufacture phantom paths out of unreachable vertices.",
        "Time: O(V * E). Space: O(V).",
      ],
    },
    {
      name: "Detect a Negative-Weight Cycle Anywhere in a Graph",
      difficulty: "Medium",
      variation: "Negative-cycle detection with a virtual super-source",
      question: [
        "Given a directed weighted graph with n nodes numbered 0..n-1 and an edge list edges where edges[i] = [u, v, w], return true if the graph contains any cycle whose total edge weight is negative. The cycle need not be reachable from node 0.",
        "Example 1:\nInput: n = 3, edges = [[0,1,4],[1,2,-6],[2,1,1]]\nOutput: true\nExplanation: The cycle 1 -> 2 -> 1 has weight -5.",
        "Example 2:\nInput: n = 4, edges = [[0,1,1],[1,2,-2],[2,3,1]]\nOutput: false\nExplanation: There is a negative edge but no cycle at all.",
        "Constraints:\n- 1 <= n <= 500\n- 0 <= edges.length <= 5000\n- -10^6 <= w <= 10^6",
      ],
      code: `bool hasNegativeCycle(int n, vector<vector<int>>& edges) {
    vector<long long> dist(n, 0);
    for (int i = 0; i < n - 1; i++) {
        bool changed = false;
        for (auto& e : edges) {
            if (dist[e[0]] + e[2] < dist[e[1]]) {
                dist[e[1]] = dist[e[0]] + e[2];
                changed = true;
            }
        }
        if (!changed) return false;
    }
    for (auto& e : edges) {
        if (dist[e[0]] + e[2] < dist[e[1]]) return true;
    }
    return false;
}`,
      explanation: [
        "Running Bellman-Ford from a single source only finds negative cycles reachable from that source. The standard fix is to add a virtual node with a zero-weight edge to every vertex - which is implemented for free by initialising all distances to 0 instead of setting one source to 0 and the rest to INF.",
        "Every node is then effectively at distance 0 from the virtual source, so every cycle in the graph lies on some path from it. After n-1 rounds all shortest distances from the virtual source are final unless a negative cycle exists, so any edge that still relaxes on the n-th pass proves one.",
        "Early exit when a round changes nothing is not just an optimisation here: once relaxation has stabilised, no negative cycle can exist, so returning false immediately is correct.",
        "Distances start at 0 and can only drop by at most (n-1) * maxWeight over n-1 rounds, so 64-bit arithmetic cannot overflow and no INF guard is needed.",
        "Time: O(V * E). Space: O(V).",
      ],
    },
    {
      name: "Cheapest Flights Within K Stops",
      difficulty: "Medium",
      variation: "Bounded relaxation (exactly K+1 rounds)",
      link: "https://leetcode.com/problems/cheapest-flights-within-k-stops/",
      question: [
        "There are n cities connected by some number of flights given as flights[i] = [from, to, price]. You are also given three integers src, dst and k. Return the cheapest price from src to dst using at most k stops, or -1 if there is no such route.",
        "Example 1:\nInput: n = 4, flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src = 0, dst = 3, k = 1\nOutput: 700\nExplanation: 0 -> 1 -> 3 costs 700 with one stop. The cheaper 0 -> 1 -> 2 -> 3 route costs 400 but uses two stops.",
        "Example 2:\nInput: n = 3, flights = [[0,1,100],[1,2,100],[0,2,500]], src = 0, dst = 2, k = 0\nOutput: 500",
        "Constraints:\n- 1 <= n <= 100\n- 0 <= flights.length <= (n * (n - 1) / 2)\n- 1 <= price <= 10^4\n- 0 <= k < n",
      ],
      code: `int findCheapestPrice(int n, vector<vector<int>>& flights, int src, int dst, int k) {
    const int INF = 1e9;
    vector<int> dist(n, INF);
    dist[src] = 0;
    for (int i = 0; i <= k; i++) {
        vector<int> next = dist;
        for (auto& f : flights) {
            int u = f[0], v = f[1], w = f[2];
            if (dist[u] == INF) continue;
            if (dist[u] + w < next[v]) next[v] = dist[u] + w;
        }
        dist = next;
    }
    return dist[dst] == INF ? -1 : dist[dst];
}`,
      explanation: [
        "This is the canonical use of bounded relaxation. Bellman-Ford's round structure is exactly what the problem asks about: after i rounds, dist[v] is the cheapest route to v using at most i edges. At most k stops means at most k+1 flights, so run exactly k+1 rounds and read the answer off.",
        "Plain Dijkstra over cities is the classic wrong answer here. Dijkstra settles a city at its globally cheapest price and discards alternatives, but the cheapest way into an intermediate city may use too many flights - in Example 1, city 2 settles at 200 via two flights, which is unusable when k = 1. Bellman-Ford never settles anything, so the hop bound is respected by construction.",
        "The copy next = dist before each round is essential and the most common bug when this is written from memory. Relaxing in place would let a single round chain two or more flights together (u improves v, then v improves w in the same pass), silently exceeding the stop limit.",
        "Time: O(K * E). Space: O(V).",
      ],
    },
    {
      name: "Shortest Path Using Exactly K Edges",
      difficulty: "Medium",
      variation: "Layered relaxation, exact edge count",
      question: [
        "Given a directed weighted graph with n nodes numbered 0..n-1, an edge list edges where edges[i] = [u, v, w] with possibly negative weights, a source src, a target dst and an integer k, return the minimum total weight of a walk from src to dst that uses exactly k edges. Nodes and edges may repeat. Return a large sentinel if no such walk exists.",
        "Example 1:\nInput: n = 4, edges = [[0,1,10],[0,2,3],[1,3,7],[2,1,2]], src = 0, dst = 3, k = 2\nOutput: 17\nExplanation: 0 -> 1 -> 3 uses exactly two edges and costs 17.",
        "Example 2:\nInput: n = 4, edges = [[0,1,10],[0,2,3],[1,3,7],[2,1,2]], src = 0, dst = 3, k = 3\nOutput: 12\nExplanation: 0 -> 2 -> 1 -> 3 costs 3 + 2 + 7.",
        "Constraints:\n- 1 <= n <= 500\n- 0 <= edges.length <= 5000\n- -10^6 <= w <= 10^6\n- 1 <= k <= 500",
      ],
      code: `long long shortestExactlyKEdges(int n, vector<vector<int>>& edges, int src, int dst, int k) {
    const long long INF = (long long)1e18;
    vector<long long> dist(n, INF);
    dist[src] = 0;
    for (int step = 0; step < k; step++) {
        vector<long long> next(n, INF);
        for (auto& e : edges) {
            int u = e[0], v = e[1], w = e[2];
            if (dist[u] == INF) continue;
            if (dist[u] + w < next[v]) next[v] = dist[u] + w;
        }
        dist = next;
    }
    return dist[dst];
}`,
      explanation: [
        "The difference from the at-most-k variant is one line: next starts as all-INF rather than as a copy of dist. Seeding it from dist would let a walk stop early and carry its value forward, which answers at most k; starting from INF forces every entry of next to be built from exactly one more edge.",
        "After step rounds, dist[v] is therefore the cheapest walk of exactly step edges from src to v. Negative weights are fine because nothing is ever settled, and a negative cycle is harmless here since the edge count is pinned to k.",
        "The same layered idea generalises: keeping all k layers instead of just the previous one lets you answer queries for every edge count at once, which is the standard preprocessing for min-plus matrix-power tricks.",
        "Time: O(K * E). Space: O(V).",
      ],
    },
    {
      name: "Minimum Cost Route with Negative Discounts",
      difficulty: "Medium",
      variation: "Mixed-sign weights, why Dijkstra fails",
      question: [
        "A delivery network has n hubs numbered 0..n-1 and one-way roads roads[i] = [u, v, cost], where cost may be negative because some routes carry a fuel rebate that exceeds the toll. The network is guaranteed to have no cycle of negative total cost. Return the minimum total cost of travelling from src to dst, or -1 if dst is unreachable.",
        "Example 1:\nInput: n = 4, roads = [[0,1,5],[0,2,2],[2,1,-4],[1,3,1]], src = 0, dst = 3\nOutput: -1\nExplanation: 0 -> 2 -> 1 -> 3 costs 2 - 4 + 1 = -1, cheaper than 0 -> 1 -> 3 at 6.",
        "Example 2:\nInput: n = 3, roads = [[0,1,3],[1,2,-1]], src = 0, dst = 2\nOutput: 2",
        "Constraints:\n- 1 <= n <= 1000\n- 0 <= roads.length <= 10^4\n- -10^4 <= cost <= 10^4\n- No negative-cost cycle exists",
      ],
      code: `long long minCostWithDiscounts(int n, vector<vector<int>>& roads, int src, int dst) {
    const long long INF = (long long)1e18;
    vector<long long> dist(n, INF);
    dist[src] = 0;
    for (int i = 0; i < n - 1; i++) {
        bool changed = false;
        for (auto& r : roads) {
            int u = r[0], v = r[1], w = r[2];
            if (dist[u] == INF) continue;
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                changed = true;
            }
        }
        if (!changed) break;
    }
    return dist[dst] == INF ? -1 : dist[dst];
}`,
      explanation: [
        "Example 1 is a minimal Dijkstra counterexample worth memorising. Dijkstra pops hub 2 at cost 2, then hub 1 at cost 5 and marks it settled; the rebate edge 2 -> 1 of weight -4 would have lowered hub 1 to -2, but the settling rule has already thrown that possibility away. The greedy exchange argument breaks the moment a single edge can reduce a running total.",
        "Bellman-Ford has no settling step at all, so a value can be revised any number of times. V-1 rounds cover every simple path, and because the statement rules out negative cycles some shortest path to each hub is simple.",
        "The early break is safe and often makes the run far shorter than V-1 rounds in practice: a stable round means relaxation has converged.",
        "Time: O(V * E). Space: O(V).",
      ],
    },
    {
      name: "SPFA: Queue-Based Bellman-Ford",
      difficulty: "Medium",
      variation: "SPFA with negative-cycle detection",
      question: [
        "Implement the Shortest Path Faster Algorithm: a Bellman-Ford variant that only relaxes edges out of nodes whose distance actually changed. Given n nodes, an adjacency list adj where adj[u] holds pairs (v, w) with possibly negative w, and a source src, return the distance array and set a flag if a negative cycle is reachable from src.",
        "Example 1:\nInput: n = 4, adj = [[(1,1),(2,4)], [(2,-2)], [(3,3)], []], src = 0\nOutput: dist = [0, 1, -1, 2], negativeCycle = false",
        "Example 2:\nInput: n = 3, adj = [[(1,1)], [(2,-4)], [(1,1)]], src = 0\nOutput: negativeCycle = true",
        "Constraints:\n- 1 <= n <= 10^5\n- 0 <= number of edges <= 5 * 10^5\n- -10^6 <= w <= 10^6",
      ],
      code: `vector<long long> spfa(int n, vector<vector<pair<int,int>>>& adj, int src, bool& negativeCycle) {
    const long long INF = (long long)1e18;
    vector<long long> dist(n, INF);
    vector<int> enqueued(n, 0);
    vector<char> inQueue(n, 0);
    dist[src] = 0;
    negativeCycle = false;
    queue<int> q;
    q.push(src);
    inQueue[src] = 1;
    enqueued[src] = 1;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        inQueue[u] = 0;
        for (auto& [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                if (!inQueue[v]) {
                    if (++enqueued[v] > n) {
                        negativeCycle = true;
                        return dist;
                    }
                    q.push(v);
                    inQueue[v] = 1;
                }
            }
        }
    }
    return dist;
}`,
      explanation: [
        "Plain Bellman-Ford re-relaxes all E edges every round even though most of them cannot possibly improve. SPFA keeps a queue of nodes whose distance changed since they were last processed and only relaxes edges out of those, which is the same set of relaxations a round would perform minus the useless ones.",
        "Correctness is inherited from Bellman-Ford: relaxation is always sound, and a node whose distance did not change cannot improve any neighbour, so skipping it loses nothing. The inQueue flag avoids storing the same node twice.",
        "Negative-cycle detection replaces the round counter with an enqueue counter. In a graph with no negative cycle a node's distance can drop at most n-1 times, so being enqueued more than n times proves a cycle of negative weight.",
        "SPFA is often much faster than V*E in practice, but its worst case is still O(V * E) and adversarial graphs do hit it - so it is a practical optimisation, not an asymptotic one.",
        "Time: O(V * E) worst case, typically far less. Space: O(V + E).",
      ],
    },
    {
      name: "Nodes Affected by a Negative Cycle",
      difficulty: "Hard",
      variation: "Negative-cycle propagation to unbounded nodes",
      question: [
        "Given a directed weighted graph with n nodes numbered 0..n-1, an edge list edges where edges[i] = [u, v, w] with possibly negative weights, and a source src, return a boolean array where entry i is true if the shortest distance from src to i is not well defined, that is if i is reachable from src through some negative-weight cycle.",
        "Example 1:\nInput: n = 5, edges = [[0,1,1],[1,2,-1],[2,1,-1],[2,3,1],[0,4,5]], src = 0\nOutput: [false, true, true, true, false]\nExplanation: The cycle 1 -> 2 -> 1 has weight -2, so nodes 1, 2 and 3 have no finite shortest distance. Node 4 is unaffected.",
        "Constraints:\n- 1 <= n <= 1000\n- 0 <= edges.length <= 10^4\n- -10^6 <= w <= 10^6",
      ],
      code: `vector<char> affectedByNegativeCycle(int n, vector<vector<int>>& edges, int src) {
    const long long INF = (long long)1e18;
    vector<long long> dist(n, INF);
    dist[src] = 0;
    for (int i = 0; i < n - 1; i++) {
        bool changed = false;
        for (auto& e : edges) {
            int u = e[0], v = e[1], w = e[2];
            if (dist[u] == INF) continue;
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                changed = true;
            }
        }
        if (!changed) break;
    }
    vector<char> affected(n, 0);
    for (auto& e : edges) {
        int u = e[0], v = e[1], w = e[2];
        if (dist[u] == INF) continue;
        if (dist[u] + w < dist[v]) affected[v] = 1;
    }
    vector<vector<int>> adj(n);
    for (auto& e : edges) adj[e[0]].push_back(e[1]);
    queue<int> q;
    for (int i = 0; i < n; i++) {
        if (affected[i]) q.push(i);
    }
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u]) {
            if (!affected[v]) {
                affected[v] = 1;
                q.push(v);
            }
        }
    }
    return affected;
}`,
      explanation: [
        "The standard negative-cycle check answers a yes/no question. To identify which nodes are ruined, note that an edge still relaxable after n-1 rounds must have its head on or downstream of a negative cycle, so collect all such heads as seeds.",
        "Then propagate: anything reachable from a seed can route through the cycle, loop it arbitrarily many times, and drive its distance to minus infinity. A plain BFS or DFS over the forward edges from the seed set marks exactly those nodes.",
        "Both steps are needed. The relaxation pass alone misses nodes hanging off the cycle (node 3 in the example), and reachability alone cannot tell which cycles are negative.",
        "Nodes not reachable from src are never seeded and never marked, since their distances stay INF and are skipped - unreachable is a different condition from unbounded.",
        "Time: O(V * E). Space: O(V + E).",
      ],
    },
    {
      name: "Cycle Finding",
      difficulty: "Hard",
      variation: "Negative-cycle detection with reconstruction",
      link: "https://cses.fi/problemset/task/1197",
      question: [
        "You are given a directed graph with n nodes and m edges, and your task is to find out if it contains a negative cycle and also give an example of such a cycle. Print NO if there is none; otherwise print YES followed by the nodes of a negative cycle in their order along it, starting and ending at the same node.",
        "Example 1:\nInput:\n4 5\n1 2 1\n2 4 1\n3 1 1\n4 1 -3\n4 3 -2\nOutput:\nYES\n1 2 4 1",
        "Constraints:\n- 1 <= n <= 2500\n- 1 <= m <= 5000\n- -10^9 <= weight <= 10^9\n- The cycle need not be reachable from node 1",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<array<long long,3>> edges(m);
    for (int i = 0; i < m; i++) {
        long long a, b, c;
        cin >> a >> b >> c;
        edges[i] = {a, b, c};
    }
    vector<long long> dist(n + 1, 0);
    vector<int> parent(n + 1, -1);
    int x = -1;
    for (int i = 0; i < n; i++) {
        x = -1;
        for (auto& e : edges) {
            int u = (int)e[0], v = (int)e[1];
            if (dist[u] + e[2] < dist[v]) {
                dist[v] = dist[u] + e[2];
                parent[v] = u;
                x = v;
            }
        }
        if (x == -1) break;
    }
    if (x == -1) {
        cout << "NO\\n";
        return 0;
    }
    for (int i = 0; i < n; i++) x = parent[x];
    vector<int> cycle;
    for (int v = x;; v = parent[v]) {
        cycle.push_back(v);
        if (v == x && cycle.size() > 1) break;
    }
    reverse(cycle.begin(), cycle.end());
    cout << "YES\\n";
    for (int v : cycle) cout << v << " ";
    cout << "\\n";
    return 0;
}`,
      explanation: [
        "Initialising every distance to 0 rather than INF is the virtual super-source trick, and it is required here because the statement does not promise the cycle is reachable from node 1.",
        "Run n rounds instead of n-1 and remember the last node relaxed. If round n changed nothing the graph has no negative cycle; if it did, that node x is reachable from a negative cycle by the usual argument.",
        "Reconstruction: x itself may only be downstream of the cycle, so walk n parent pointers back from it. Each step moves one edge backwards along the relaxation tree, and after n steps you are guaranteed to have entered the cycle, because the walk can leave the cycle at most n-1 times. Then follow parents from that point until the node repeats, which traces the cycle exactly.",
        "Distances start at 0 and drop by up to n * m * maxWeight over the run, roughly 1.25 * 10^16 here, so 64-bit is mandatory but cannot overflow.",
        "Time: O(n * m). Space: O(n + m).",
      ],
    },
    {
      name: "High Score",
      difficulty: "Hard",
      variation: "Longest path with positive-cycle detection",
      link: "https://cses.fi/problemset/task/1673",
      question: [
        "You play a game with n rooms and m tunnels between them. Each tunnel has a score, possibly negative, and you want to walk from room 1 to room n collecting the maximum possible score. Tunnels are one-way and rooms may be revisited. Print the maximum score, or -1 if you can collect an arbitrarily large score.",
        "Example 1:\nInput:\n4 5\n1 2 3\n2 4 -1\n1 3 -2\n3 4 7\n1 4 4\nOutput: 5\nExplanation: 1 -> 3 -> 4 scores -2 + 7 = 5.",
        "Constraints:\n- 1 <= n <= 2500\n- 1 <= m <= 5000\n- -10^9 <= score <= 10^9",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<array<long long,3>> edges(m);
    vector<vector<int>> fwd(n + 1), rev(n + 1);
    for (int i = 0; i < m; i++) {
        long long a, b, c;
        cin >> a >> b >> c;
        edges[i] = {a, b, -c};
        fwd[(int)a].push_back((int)b);
        rev[(int)b].push_back((int)a);
    }
    vector<char> fromStart(n + 1, 0), toEnd(n + 1, 0);
    queue<int> q;
    q.push(1);
    fromStart[1] = 1;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : fwd[u]) {
            if (!fromStart[v]) {
                fromStart[v] = 1;
                q.push(v);
            }
        }
    }
    q.push(n);
    toEnd[n] = 1;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : rev[u]) {
            if (!toEnd[v]) {
                toEnd[v] = 1;
                q.push(v);
            }
        }
    }
    const long long INF = (long long)1e18;
    vector<long long> dist(n + 1, INF);
    dist[1] = 0;
    for (int i = 0; i < n - 1; i++) {
        bool changed = false;
        for (auto& e : edges) {
            int u = (int)e[0], v = (int)e[1];
            if (dist[u] == INF) continue;
            if (dist[u] + e[2] < dist[v]) {
                dist[v] = dist[u] + e[2];
                changed = true;
            }
        }
        if (!changed) break;
    }
    for (auto& e : edges) {
        int u = (int)e[0], v = (int)e[1];
        if (dist[u] == INF) continue;
        if (dist[u] + e[2] < dist[v] && fromStart[u] && toEnd[v]) {
            cout << -1 << "\\n";
            return 0;
        }
    }
    cout << -dist[n] << "\\n";
    return 0;
}`,
      explanation: [
        "Maximisation becomes minimisation by negating every score. A cycle of positive score turns into a negative cycle, so the whole problem reduces to Bellman-Ford plus negative-cycle detection.",
        "The subtlety, and the reason a naive solution fails the CSES tests, is that not every negative cycle matters. Only a cycle that sits on some walk from room 1 to room n can be exploited. So precompute reachability from 1 over the forward edges and reachability to n over the reversed edges with two BFS passes, and report -1 only when a still-relaxable edge has its tail reachable from 1 and its head able to reach n.",
        "Without that filter, an unrelated positive cycle elsewhere in the graph would wrongly produce -1; with only one of the two filters, a cycle reachable from 1 but with no route onward to n would do the same.",
        "Answer is printed as -dist[n] to undo the negation. Scores of 10^9 across 5000 tunnels demand 64-bit arithmetic.",
        "Time: O(n * m). Space: O(n + m).",
      ],
    },
    {
      name: "Currency Arbitrage Detection",
      difficulty: "Hard",
      variation: "Negative-cycle detection after a log transform",
      question: [
        "You are given an n x n matrix rate where rate[i][j] is the amount of currency j obtained for one unit of currency i (0 if no direct exchange exists, and rate[i][i] is unused). Return true if an arbitrage opportunity exists, that is a sequence of exchanges starting and ending at the same currency whose rates multiply to strictly more than 1.",
        "Example 1:\nInput: n = 3, rate = [[0, 2.0, 0.0], [0, 0, 1.0], [0.8, 0, 0]]\nOutput: true\nExplanation: 0 -> 1 -> 2 -> 0 multiplies to 2.0 * 1.0 * 0.8 = 1.6 > 1.",
        "Example 2:\nInput: n = 2, rate = [[0, 2.0], [0.4, 0]]\nOutput: false\nExplanation: The only cycle multiplies to 0.8.",
        "Constraints:\n- 2 <= n <= 200\n- 0 <= rate[i][j] <= 10^3\n- Rates are given as doubles",
      ],
      code: `bool hasArbitrage(int n, vector<vector<double>>& rate) {
    const double EPS = 1e-12;
    vector<double> dist(n, 0.0);
    for (int i = 0; i < n - 1; i++) {
        bool changed = false;
        for (int u = 0; u < n; u++) {
            for (int v = 0; v < n; v++) {
                if (u == v || rate[u][v] <= 0.0) continue;
                double w = -log(rate[u][v]);
                if (dist[u] + w < dist[v] - EPS) {
                    dist[v] = dist[u] + w;
                    changed = true;
                }
            }
        }
        if (!changed) return false;
    }
    for (int u = 0; u < n; u++) {
        for (int v = 0; v < n; v++) {
            if (u == v || rate[u][v] <= 0.0) continue;
            if (dist[u] - log(rate[u][v]) < dist[v] - EPS) return true;
        }
    }
    return false;
}`,
      explanation: [
        "Arbitrage asks whether some cycle has a product of rates above 1. Taking logarithms turns the product into a sum: the product of rates on a cycle exceeds 1 exactly when the sum of -log(rate) around it is strictly negative. So arbitrage detection is literally negative-cycle detection.",
        "All distances start at 0, the virtual super-source setup, because an arbitrage cycle may involve any subset of currencies and need not touch currency 0.",
        "Working in floating point requires an epsilon on the comparison. Without it, accumulated rounding on a break-even cycle can look like a tiny improvement forever and produce a false positive; the EPS margin demands a genuine improvement before relaxing.",
        "Missing exchange pairs (rate 0) are skipped rather than given weight infinity, since log(0) is undefined.",
        "Time: O(V^3) with the dense adjacency matrix. Space: O(V).",
      ],
    },
    {
      name: "Difference Constraints Feasibility",
      difficulty: "Hard",
      variation: "System of inequalities as a shortest-path problem",
      question: [
        "You are given n variables x[0]..x[n-1] and a list of constraints, each of the form x[v] - x[u] <= c, given as cons[i] = [u, v, c]. Decide whether the system has a solution over the integers, and if so return one satisfying assignment. Any valid assignment is acceptable, since adding a constant to every variable preserves all the constraints.",
        "Example 1:\nInput: n = 3, cons = [[0,1,2],[1,2,3],[2,0,-4]]\nOutput: feasible = true, for example x = [0, 2, 5] shifted so that x satisfies every inequality",
        "Example 2:\nInput: n = 2, cons = [[0,1,-1],[1,0,-1]]\nOutput: feasible = false\nExplanation: The two constraints require x[1] <= x[0] - 1 and x[0] <= x[1] - 1, which sum to 0 <= -2.",
        "Constraints:\n- 1 <= n <= 1000\n- 0 <= cons.length <= 10^4\n- -10^6 <= c <= 10^6",
      ],
      code: `vector<long long> solveDifferenceConstraints(int n, vector<vector<int>>& cons, bool& feasible) {
    vector<long long> x(n, 0);
    for (int i = 0; i < n; i++) {
        bool changed = false;
        for (auto& c : cons) {
            int u = c[0], v = c[1], w = c[2];
            if (x[u] + w < x[v]) {
                x[v] = x[u] + w;
                changed = true;
            }
        }
        if (!changed) break;
    }
    feasible = true;
    for (auto& c : cons) {
        if (x[c[0]] + c[2] < x[c[1]]) {
            feasible = false;
            break;
        }
    }
    return x;
}`,
      explanation: [
        "A constraint x[v] - x[u] <= c is exactly the triangle inequality dist[v] <= dist[u] + c for an edge u -> v of weight c. So build that graph, and any valid shortest-distance array is a satisfying assignment - shortest distances always obey every triangle inequality.",
        "Add a virtual source joined to all variables at weight 0, implemented by initialising every x to 0, because the system has no distinguished starting variable. Then run n rounds of relaxation over all constraints.",
        "The system is infeasible precisely when the constraint graph has a negative cycle. Summing the inequalities around such a cycle cancels all the variables and leaves 0 <= (negative total), a contradiction - which is exactly what Example 2 shows. Conversely, no negative cycle means the shortest distances are finite and give a solution.",
        "The final pass is the standard post-check: any constraint still violated after relaxation converged proves a negative cycle.",
        "Time: O(V * E). Space: O(V).",
      ],
    },
    {
      name: "Maximum Profit Route with Penalties",
      difficulty: "Hard",
      variation: "Maximisation by negation, unbounded detection",
      question: [
        "A courier network has n depots numbered 0..n-1 and one-way legs edges[i] = [u, v, profit], where profit may be negative when the leg carries a penalty. Starting at src and ending at dst, return the maximum total profit of a route, where depots and legs may be reused. Set a flag if the profit can be made arbitrarily large, and return a sentinel if dst is unreachable.",
        "Example 1:\nInput: n = 4, edges = [[0,1,5],[1,2,-2],[2,3,4],[0,3,3]], src = 0, dst = 3\nOutput: 7, unbounded = false\nExplanation: 0 -> 1 -> 2 -> 3 profits 5 - 2 + 4 = 7.",
        "Example 2:\nInput: n = 4, edges = [[0,1,1],[1,2,3],[2,1,-1],[2,3,1]], src = 0, dst = 3\nOutput: unbounded = true\nExplanation: The cycle 1 -> 2 -> 1 profits 2 per lap and can reach dst afterwards.",
        "Constraints:\n- 1 <= n <= 1000\n- 0 <= edges.length <= 10^4\n- -10^6 <= profit <= 10^6",
      ],
      code: `long long maxProfitRoute(int n, vector<vector<int>>& edges, int src, int dst, bool& unbounded) {
    const long long INF = (long long)1e18;
    vector<long long> dist(n, INF);
    dist[src] = 0;
    for (int i = 0; i < n - 1; i++) {
        bool changed = false;
        for (auto& e : edges) {
            int u = e[0], v = e[1];
            long long w = -(long long)e[2];
            if (dist[u] == INF) continue;
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                changed = true;
            }
        }
        if (!changed) break;
    }
    vector<char> bad(n, 0);
    for (auto& e : edges) {
        int u = e[0], v = e[1];
        long long w = -(long long)e[2];
        if (dist[u] == INF) continue;
        if (dist[u] + w < dist[v]) bad[v] = 1;
    }
    vector<vector<int>> adj(n);
    for (auto& e : edges) adj[e[0]].push_back(e[1]);
    queue<int> q;
    for (int i = 0; i < n; i++) {
        if (bad[i]) q.push(i);
    }
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u]) {
            if (!bad[v]) {
                bad[v] = 1;
                q.push(v);
            }
        }
    }
    unbounded = bad[dst];
    if (unbounded) return 0;
    return dist[dst] == INF ? INF : -dist[dst];
}`,
      explanation: [
        "Negate the profits and the problem becomes ordinary shortest path: maximum profit equals minus the minimum cost. A positive-profit cycle becomes a negative-weight cycle, which is exactly the unbounded case.",
        "Detection has two stages, because a cycle being negative is not enough - it must also be able to reach dst. Collect the heads of edges still relaxable after n-1 rounds as seeds, then BFS forward from them; dst is unbounded if and only if it is marked.",
        "Only if dst is not marked is dist[dst] meaningful, and negating it back gives the maximum profit. Unreachable dst keeps INF and is reported separately, since no route at all is a different answer from an unbounded one.",
        "Time: O(V * E). Space: O(V + E).",
      ],
    },
  ],
};
