import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Dijkstra's Shortest Path in a Weighted Undirected Graph",
      difficulty: "Easy",
      variation: "Single-source Dijkstra, template",
      link: "https://www.geeksforgeeks.org/dijkstras-shortest-path-algorithm-greedy-algo-7/",
      question: [
        "Given a weighted undirected graph with V vertices numbered 0..V-1, an adjacency list where adj[u] holds pairs (v, w) meaning an edge u-v of weight w, and a source vertex src, return an array dist of length V where dist[i] is the length of the shortest path from src to i. If a vertex is unreachable, report a large sentinel value.",
        "Example 1:\nInput: V = 3, adj = [[(1,1),(2,6)], [(0,1),(2,3)], [(0,6),(1,3)]], src = 2\nOutput: [4, 3, 0]\nExplanation: 2 -> 1 costs 3, and 2 -> 1 -> 0 costs 4, which beats the direct edge of weight 6.",
        "Constraints:\n- 1 <= V <= 10^5\n- 0 <= number of edges <= 2 * 10^5\n- 1 <= w <= 10^4 (all weights non-negative)",
      ],
      code: `vector<int> dijkstra(int V, vector<vector<pair<int,int>>>& adj, int src) {
    const int INF = 1e9;
    vector<int> dist(V, INF);
    dist[src] = 0;
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;
    pq.push({0, src});
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;
        for (auto& [v, w] : adj[u]) {
            if (d + w < dist[v]) {
                dist[v] = d + w;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}`,
      explanation: [
        "Keep a min-heap of (tentative distance, vertex). Repeatedly pop the smallest tentative distance, treat it as final, and relax every outgoing edge of that vertex.",
        "The settling argument: when (d, u) is popped, d is the smallest tentative distance among all unsettled vertices. Any other route to u would have to pass through some unsettled vertex whose own tentative distance is at least d, and since every remaining edge weight is non-negative that route can only be longer. So d can never be improved later and is final.",
        "The guard d > dist[u] discards stale heap entries left over from earlier, worse relaxations - this replaces an explicit decrease-key operation at the cost of a slightly larger heap.",
        "Time: O(E log V). Space: O(V + E).",
      ],
    },
    {
      name: "Shortest Routes I",
      difficulty: "Easy",
      variation: "Single-source Dijkstra, 64-bit distances",
      link: "https://cses.fi/problemset/task/1671",
      question: [
        "There are n cities and m flight connections. Each connection is a one-way flight from city a to city b with price c. Print the minimum price of a route from city 1 to every city 1..n. It is guaranteed that every city is reachable from city 1.",
        "Example 1:\nInput:\n3 4\n1 2 6\n1 3 2\n3 2 3\n1 3 4\nOutput: 0 5 2\nExplanation: 1 -> 3 costs 2, and 1 -> 3 -> 2 costs 5, cheaper than the direct flight of price 6.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= m <= 2 * 10^5\n- 1 <= c <= 10^9",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<vector<pair<int,long long>>> adj(n + 1);
    for (int i = 0; i < m; i++) {
        int a, b;
        long long c;
        cin >> a >> b >> c;
        adj[a].push_back({b, c});
    }
    const long long INF = (long long)4e18;
    vector<long long> dist(n + 1, INF);
    dist[1] = 0;
    priority_queue<pair<long long,int>, vector<pair<long long,int>>, greater<>> pq;
    pq.push({0, 1});
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;
        for (auto& [v, w] : adj[u]) {
            if (d + w < dist[v]) {
                dist[v] = d + w;
                pq.push({dist[v], v});
            }
        }
    }
    for (int i = 1; i <= n; i++) cout << dist[i] << " \\n"[i == n];
    return 0;
}`,
      explanation: [
        "Plain single-source Dijkstra on a directed graph. The only real trap is arithmetic: with up to 10^5 edges of price 10^9 a route can cost around 10^14, so distances must be 64-bit even though the individual prices fit in an int.",
        "Edges are stored one-directionally because the flights are one-way; adding the reverse edge would silently produce shorter, illegal routes.",
        "Time: O((n + m) log n). Space: O(n + m).",
      ],
    },
    {
      name: "Network Delay Time",
      difficulty: "Medium",
      variation: "Single-source Dijkstra, eccentricity",
      link: "https://leetcode.com/problems/network-delay-time/",
      question: [
        "You are given n network nodes labelled 1..n and a list of travel times as directed edges times[i] = [u, v, w], meaning a signal takes w time to travel from u to v. A signal is sent from node k. Return the time it takes for all n nodes to receive the signal, or -1 if it is impossible for all nodes to receive it.",
        "Example 1:\nInput: times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2\nOutput: 2\nExplanation: Node 1 receives at time 1, node 3 at time 1, node 4 at time 2.",
        "Constraints:\n- 1 <= k <= n <= 100\n- 1 <= times.length <= 6000\n- 1 <= w <= 100 (all weights positive)",
      ],
      code: `int networkDelayTime(vector<vector<int>>& times, int n, int k) {
    vector<vector<pair<int,int>>> adj(n + 1);
    for (auto& t : times) adj[t[0]].push_back({t[1], t[2]});
    const int INF = 1e9;
    vector<int> dist(n + 1, INF);
    dist[k] = 0;
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;
    pq.push({0, k});
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;
        for (auto& [v, w] : adj[u]) {
            if (d + w < dist[v]) {
                dist[v] = d + w;
                pq.push({dist[v], v});
            }
        }
    }
    int ans = 0;
    for (int i = 1; i <= n; i++) ans = max(ans, dist[i]);
    return ans == INF ? -1 : ans;
}`,
      explanation: [
        "The signal reaches each node along a shortest path, so the time until every node has received it is the maximum shortest-path distance from k - the eccentricity of k.",
        "One Dijkstra run gives all of those distances at once. If any node still holds INF afterwards it was never reachable, and the answer is -1.",
        "Time: O(E log V). Space: O(V + E).",
      ],
    },
    {
      name: "Find the City With the Smallest Number of Neighbors at a Threshold Distance",
      difficulty: "Medium",
      variation: "All-pairs via repeated Dijkstra",
      link: "https://leetcode.com/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance/",
      question: [
        "There are n cities numbered 0..n-1 connected by bidirectional weighted edges given as edges[i] = [from, to, weight], and an integer distanceThreshold. Return the city with the smallest number of other cities reachable through some path of total weight at most distanceThreshold. If there are multiple such cities, return the one with the greatest index.",
        "Example 1:\nInput: n = 4, edges = [[0,1,3],[1,2,1],[1,3,4],[2,3,1]], distanceThreshold = 4\nOutput: 3\nExplanation: Cities 0 and 3 each have two neighbours within distance 4; city 3 has the greater index.",
        "Constraints:\n- 2 <= n <= 100\n- 1 <= edges.length <= n * (n - 1) / 2\n- 1 <= weight, distanceThreshold <= 10^4",
      ],
      code: `int findTheCity(int n, vector<vector<int>>& edges, int distanceThreshold) {
    vector<vector<pair<int,int>>> adj(n);
    for (auto& e : edges) {
        adj[e[0]].push_back({e[1], e[2]});
        adj[e[1]].push_back({e[0], e[2]});
    }
    const int INF = 1e9;
    int best = -1, bestCount = n + 1;
    for (int s = 0; s < n; s++) {
        vector<int> dist(n, INF);
        dist[s] = 0;
        priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;
        pq.push({0, s});
        while (!pq.empty()) {
            auto [d, u] = pq.top(); pq.pop();
            if (d > dist[u]) continue;
            for (auto& [v, w] : adj[u]) {
                if (d + w < dist[v]) {
                    dist[v] = d + w;
                    pq.push({dist[v], v});
                }
            }
        }
        int cnt = 0;
        for (int v = 0; v < n; v++) {
            if (v != s && dist[v] <= distanceThreshold) cnt++;
        }
        if (cnt <= bestCount) {
            bestCount = cnt;
            best = s;
        }
    }
    return best;
}`,
      explanation: [
        "The question needs all-pairs shortest distances, so run Dijkstra once from every city. With n at most 100 this is trivially fast; Floyd-Warshall in O(n^3) also fits, but repeated Dijkstra scales better on sparse graphs.",
        "The tie-break falls out for free: scanning s in increasing order and accepting on cnt <= bestCount means the last city achieving the minimum wins, which is the greatest index.",
        "Time: O(V * E log V). Space: O(V + E).",
      ],
    },
    {
      name: "Path with Maximum Probability",
      difficulty: "Medium",
      variation: "Dijkstra with a max-heap, multiplicative weights",
      link: "https://leetcode.com/problems/path-with-maximum-probability/",
      question: [
        "You are given an undirected weighted graph of n nodes numbered 0..n-1, given as an edge list edges where edges[i] = [a, b] together with succProb[i], the probability of successfully traversing that edge. Given two nodes start_node and end_node, return the maximum probability of success of any path between them, or 0 if no path exists.",
        "Example 1:\nInput: n = 3, edges = [[0,1],[1,2],[0,2]], succProb = [0.5,0.5,0.2], start_node = 0, end_node = 2\nOutput: 0.25000\nExplanation: Going 0 -> 1 -> 2 gives 0.5 * 0.5 = 0.25, better than the direct edge 0.2.",
        "Constraints:\n- 2 <= n <= 10^4\n- 0 <= edges.length <= 2 * 10^4\n- 0 <= succProb[i] <= 1",
      ],
      code: `double maxProbability(int n, vector<vector<int>>& edges, vector<double>& succProb, int start_node, int end_node) {
    vector<vector<pair<int,double>>> adj(n);
    for (int i = 0; i < (int)edges.size(); i++) {
        adj[edges[i][0]].push_back({edges[i][1], succProb[i]});
        adj[edges[i][1]].push_back({edges[i][0], succProb[i]});
    }
    vector<double> best(n, 0.0);
    best[start_node] = 1.0;
    priority_queue<pair<double,int>> pq;
    pq.push({1.0, start_node});
    while (!pq.empty()) {
        auto [p, u] = pq.top(); pq.pop();
        if (p < best[u]) continue;
        if (u == end_node) return p;
        for (auto& [v, q] : adj[u]) {
            if (p * q > best[v]) {
                best[v] = p * q;
                pq.push({best[v], v});
            }
        }
    }
    return 0.0;
}`,
      explanation: [
        "Path cost here is a product to be maximised rather than a sum to be minimised, so the heap becomes a max-heap and relaxation multiplies instead of adding.",
        "The settling argument still holds because every edge probability lies in [0, 1], so extending a path can only multiply its probability by a factor of at most one. The largest unsettled probability popped from the heap can therefore never be beaten later - this is the exact mirror of the non-negative-weight condition. Equivalently, taking -log of each probability turns the problem into ordinary Dijkstra with non-negative additive weights.",
        "Popping end_node lets the search stop early, since its value is already final at that moment.",
        "Time: O(E log V). Space: O(V + E).",
      ],
    },
    {
      name: "Path With Minimum Effort",
      difficulty: "Medium",
      variation: "Minimax Dijkstra (bottleneck path)",
      link: "https://leetcode.com/problems/path-with-minimum-effort/",
      question: [
        "You are a hiker on a grid heights of size rows x columns, where heights[r][c] is the height of cell (r, c). You start at the top-left cell and want to reach the bottom-right cell, moving up, down, left or right. The effort of a route is the maximum absolute height difference between two consecutive cells on it. Return the minimum effort required.",
        "Example 1:\nInput: heights = [[1,2,2],[3,8,2],[5,3,5]]\nOutput: 2\nExplanation: The route [1,2,2,2,5] has a maximum step difference of 2, better than the route through 8.",
        "Example 2:\nInput: heights = [[1,2,3],[3,8,4],[5,3,5]]\nOutput: 1",
        "Constraints:\n- 1 <= rows, columns <= 100\n- 1 <= heights[r][c] <= 10^6",
      ],
      code: `int minimumEffortPath(vector<vector<int>>& heights) {
    int m = heights.size(), n = heights[0].size();
    const int INF = 1e9;
    vector<vector<int>> eff(m, vector<int>(n, INF));
    priority_queue<tuple<int,int,int>, vector<tuple<int,int,int>>, greater<>> pq;
    eff[0][0] = 0;
    pq.push({0, 0, 0});
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    while (!pq.empty()) {
        auto [e, r, c] = pq.top(); pq.pop();
        if (e > eff[r][c]) continue;
        if (r == m - 1 && c == n - 1) return e;
        for (int k = 0; k < 4; k++) {
            int nr = r + dr[k], nc = c + dc[k];
            if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
            int ne = max(e, abs(heights[nr][nc] - heights[r][c]));
            if (ne < eff[nr][nc]) {
                eff[nr][nc] = ne;
                pq.push({ne, nr, nc});
            }
        }
    }
    return 0;
}`,
      explanation: [
        "The cost of a path is a maximum, not a sum, so relaxation becomes new = max(old, edgeWeight) instead of old + edgeWeight. Everything else is unchanged Dijkstra.",
        "Correctness survives because max is monotone: extending a path can never lower its bottleneck, exactly the property that non-negative weights give for sums. So the smallest bottleneck popped from the heap is final.",
        "Binary search on the answer plus a plain BFS reachability check, or a union-find sweep over edges sorted by weight, solve the same problem; the minimax Dijkstra is the one that needs no outer loop.",
        "Time: O(R * C * log(R * C)). Space: O(R * C).",
      ],
    },
    {
      name: "Cheapest Flights Within K Stops",
      difficulty: "Medium",
      variation: "Dijkstra on state (node, edges used)",
      link: "https://leetcode.com/problems/cheapest-flights-within-k-stops/",
      question: [
        "There are n cities connected by some number of flights given as flights[i] = [from, to, price]. You are also given three integers src, dst and k. Return the cheapest price from src to dst using at most k stops, or -1 if there is no such route.",
        "Example 1:\nInput: n = 4, flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src = 0, dst = 3, k = 1\nOutput: 700\nExplanation: 0 -> 1 -> 3 costs 700 using one stop. The cheaper 0 -> 1 -> 2 -> 3 route costs 400 but uses two stops.",
        "Constraints:\n- 1 <= n <= 100\n- 0 <= flights.length <= (n * (n - 1) / 2)\n- 1 <= price <= 10^4\n- 0 <= k < n",
      ],
      code: `int findCheapestPrice(int n, vector<vector<int>>& flights, int src, int dst, int k) {
    vector<vector<pair<int,int>>> adj(n);
    for (auto& f : flights) adj[f[0]].push_back({f[1], f[2]});
    const int INF = 1e9;
    vector<vector<int>> best(n, vector<int>(k + 2, INF));
    priority_queue<tuple<int,int,int>, vector<tuple<int,int,int>>, greater<>> pq;
    best[src][0] = 0;
    pq.push({0, src, 0});
    while (!pq.empty()) {
        auto [cost, u, used] = pq.top(); pq.pop();
        if (u == dst) return cost;
        if (cost > best[u][used]) continue;
        if (used == k + 1) continue;
        for (auto& [v, w] : adj[u]) {
            if (cost + w < best[v][used + 1]) {
                best[v][used + 1] = cost + w;
                pq.push({cost + w, v, used + 1});
            }
        }
    }
    return -1;
}`,
      explanation: [
        "This problem is very commonly mis-solved with plain Dijkstra over cities. That is wrong: the cheapest way to reach an intermediate city may use too many flights, and settling that city discards the more expensive but shorter-in-hops route that the answer needs. In the example above, city 2 is cheapest at 200 via two flights, which is useless when k = 1.",
        "The fix is to make the state a pair (city, number of flights used) and give each layer its own distance entry. Within that expanded graph all weights are still non-negative, so ordinary Dijkstra settling applies to states rather than to cities.",
        "At most k stops means at most k + 1 flights, so layers 0..k+1 exist and expansion stops once used reaches k + 1. Because the heap is ordered by cost, the first time dst is popped in any layer the cost is optimal over all legal layers.",
        "Time: O(E * K log(V * K)). Space: O(V * K).",
      ],
    },
    {
      name: "Number of Ways to Arrive at Destination",
      difficulty: "Medium",
      variation: "Dijkstra with shortest-path counting",
      link: "https://leetcode.com/problems/number-of-ways-to-arrive-at-destination/",
      question: [
        "You are in a city with n intersections numbered 0..n-1 and bidirectional roads roads[i] = [u, v, time]. You want to travel from intersection 0 to intersection n-1 in the minimum possible time. Return the number of ways you can arrive at your destination in the shortest amount of time, modulo 10^9 + 7.",
        "Example 1:\nInput: n = 7, roads = [[0,6,7],[0,1,2],[1,2,3],[1,3,3],[6,3,3],[3,5,1],[6,5,1],[2,5,1],[0,4,5],[4,6,2]]\nOutput: 4\nExplanation: The shortest time is 7 and there are four distinct routes achieving it.",
        "Constraints:\n- 1 <= n <= 200\n- n - 1 <= roads.length <= n * (n - 1) / 2\n- 1 <= time <= 10^9\n- There is at most one road between any two intersections",
      ],
      code: `int countPaths(int n, vector<vector<int>>& roads) {
    const long long MOD = 1000000007LL;
    vector<vector<pair<int,long long>>> adj(n);
    for (auto& r : roads) {
        adj[r[0]].push_back({r[1], r[2]});
        adj[r[1]].push_back({r[0], r[2]});
    }
    const long long INF = (long long)4e18;
    vector<long long> dist(n, INF), ways(n, 0);
    dist[0] = 0;
    ways[0] = 1;
    priority_queue<pair<long long,int>, vector<pair<long long,int>>, greater<>> pq;
    pq.push({0, 0});
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;
        for (auto& [v, w] : adj[u]) {
            if (d + w < dist[v]) {
                dist[v] = d + w;
                ways[v] = ways[u];
                pq.push({dist[v], v});
            } else if (d + w == dist[v]) {
                ways[v] = (ways[v] + ways[u]) % MOD;
            }
        }
    }
    return (int)(ways[n - 1] % MOD);
}`,
      explanation: [
        "Run Dijkstra and carry a second array ways alongside dist. A strictly better relaxation of v resets ways[v] to ways[u]; an equal-cost relaxation adds ways[u] to it.",
        "This is only sound because u is fully settled when it is popped, so ways[u] is already the final count of shortest routes to u and will never change again. Doing the same bookkeeping without the settling guarantee - for example over an unsorted queue - would double count or undercount.",
        "Times reach 10^9 and up to 200 roads can chain, so distances need 64-bit arithmetic while the counts are reduced modulo 10^9 + 7.",
        "Time: O(E log V). Space: O(V + E).",
      ],
    },
    {
      name: "Flight Discount",
      difficulty: "Medium",
      variation: "Dijkstra on state (node, coupon used)",
      link: "https://cses.fi/problemset/task/1195",
      question: [
        "There are n cities and m one-way flights, flight i going from a to b with price c. You want to travel from city 1 to city n. You have a single discount coupon that may be used on exactly one flight, halving its price (rounded down). Print the minimum price of the trip.",
        "Example 1:\nInput:\n3 4\n1 2 3\n2 3 1\n1 3 7\n2 1 5\nOutput: 2\nExplanation: Take 1 -> 2 with the coupon for 1, then 2 -> 3 for 1, total 2.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= m <= 2 * 10^5\n- 1 <= c <= 10^9",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<vector<pair<int,long long>>> adj(n + 1);
    for (int i = 0; i < m; i++) {
        int a, b;
        long long c;
        cin >> a >> b >> c;
        adj[a].push_back({b, c});
    }
    const long long INF = (long long)4e18;
    vector<vector<long long>> dist(n + 1, vector<long long>(2, INF));
    priority_queue<tuple<long long,int,int>, vector<tuple<long long,int,int>>, greater<>> pq;
    dist[1][0] = 0;
    pq.push({0, 1, 0});
    while (!pq.empty()) {
        auto [d, u, used] = pq.top(); pq.pop();
        if (d > dist[u][used]) continue;
        for (auto& [v, w] : adj[u]) {
            if (d + w < dist[v][used]) {
                dist[v][used] = d + w;
                pq.push({d + w, v, used});
            }
            if (used == 0 && d + w / 2 < dist[v][1]) {
                dist[v][1] = d + w / 2;
                pq.push({d + w / 2, v, 1});
            }
        }
    }
    cout << min(dist[n][0], dist[n][1]) << "\\n";
    return 0;
}`,
      explanation: [
        "Duplicate the graph into two layers: layer 0 means the coupon is still in hand, layer 1 means it has been spent. A full-price edge keeps the layer; a half-price edge moves from layer 0 to layer 1 and can only be taken once, because layer 1 has no outgoing discount edges.",
        "The layered graph has 2n nodes and 3m edges and all its weights are non-negative, so ordinary Dijkstra settles states correctly. Greedily discounting the single most expensive edge on the cheapest full-price route would be wrong - the optimal trip may follow a different, pricier route that contains one huge flight worth halving.",
        "Prices reach 10^9 across up to 2 * 10^5 flights, so distances must be 64-bit; the halving uses integer division, which floors as the statement requires.",
        "Time: O(m log n). Space: O(n + m).",
      ],
    },
    {
      name: "Investigation",
      difficulty: "Medium",
      variation: "Dijkstra with count, min-edges and max-edges bookkeeping",
      link: "https://cses.fi/problemset/task/1202",
      question: [
        "There are n cities and m one-way flights from city a to city b with price c. You want to travel from city 1 to city n. Print four values: the minimum price of a route, the number of minimum-price routes modulo 10^9 + 7, the minimum number of flights on a minimum-price route, and the maximum number of flights on a minimum-price route.",
        "Example 1:\nInput:\n4 5\n1 4 5\n1 2 4\n2 4 5\n1 3 2\n3 4 3\nOutput: 5 2 1 2\nExplanation: The cheapest price is 5, achieved by 1 -> 4 (one flight) and 1 -> 3 -> 4 (two flights).",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= m <= 2 * 10^5\n- 1 <= c <= 10^9",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<vector<pair<int,long long>>> adj(n + 1);
    for (int i = 0; i < m; i++) {
        int a, b;
        long long c;
        cin >> a >> b >> c;
        adj[a].push_back({b, c});
    }
    const long long INF = (long long)4e18;
    const long long MOD = 1000000007LL;
    vector<long long> dist(n + 1, INF), ways(n + 1, 0);
    vector<int> mn(n + 1, 0), mx(n + 1, 0);
    dist[1] = 0;
    ways[1] = 1;
    priority_queue<pair<long long,int>, vector<pair<long long,int>>, greater<>> pq;
    pq.push({0, 1});
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;
        for (auto& [v, w] : adj[u]) {
            long long nd = d + w;
            if (nd < dist[v]) {
                dist[v] = nd;
                ways[v] = ways[u];
                mn[v] = mn[u] + 1;
                mx[v] = mx[u] + 1;
                pq.push({nd, v});
            } else if (nd == dist[v]) {
                ways[v] = (ways[v] + ways[u]) % MOD;
                mn[v] = min(mn[v], mn[u] + 1);
                mx[v] = max(mx[v], mx[u] + 1);
            }
        }
    }
    cout << dist[n] << " " << ways[n] % MOD << " " << mn[n] << " " << mx[n] << "\\n";
    return 0;
}`,
      explanation: [
        "One Dijkstra run carries four pieces of information per city: the shortest price, the number of shortest routes, and the fewest and most flights among shortest routes. A strict improvement overwrites all four from the predecessor; a tie merges them.",
        "The merge is valid for the same reason as in the counting variant: when u is popped its four values are final, so every later relaxation reads settled data. Because all prices are positive, no edge can create a zero-cost cycle that would make the flight counts unbounded.",
        "Time: O(m log n). Space: O(n + m).",
      ],
    },
    {
      name: "Minimum Time to Visit a Cell In a Grid",
      difficulty: "Medium",
      variation: "Dijkstra with parity-adjusted waiting",
      link: "https://leetcode.com/problems/minimum-time-to-visit-a-cell-in-a-grid/",
      question: [
        "You are given an m x n matrix grid where grid[r][c] is the minimum time in seconds when you can start to visit that cell. You start at the top-left cell at time 0 and each move to an adjacent cell takes exactly one second. Return the minimum time to reach the bottom-right cell, or -1 if it is impossible.",
        "Example 1:\nInput: grid = [[0,1,3,2],[5,1,2,5],[4,3,8,6]]\nOutput: 7",
        "Example 2:\nInput: grid = [[0,2,4],[3,2,1],[1,0,4]]\nOutput: -1\nExplanation: Both neighbours of the start require a time greater than 1, so no first move is legal.",
        "Constraints:\n- 2 <= m, n <= 1000\n- 0 <= grid[r][c] <= 10^5\n- grid[0][0] == 0",
      ],
      code: `int minimumTime(vector<vector<int>>& grid) {
    int m = grid.size(), n = grid[0].size();
    if (grid[0][1] > 1 && grid[1][0] > 1) return -1;
    const int INF = 1e9;
    vector<vector<int>> dist(m, vector<int>(n, INF));
    priority_queue<tuple<int,int,int>, vector<tuple<int,int,int>>, greater<>> pq;
    dist[0][0] = 0;
    pq.push({0, 0, 0});
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    while (!pq.empty()) {
        auto [t, r, c] = pq.top(); pq.pop();
        if (t > dist[r][c]) continue;
        if (r == m - 1 && c == n - 1) return t;
        for (int k = 0; k < 4; k++) {
            int nr = r + dr[k], nc = c + dc[k];
            if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
            int nt = t + 1;
            if (nt < grid[nr][nc]) {
                int wait = grid[nr][nc] - nt;
                nt = (wait % 2 == 0) ? grid[nr][nc] : grid[nr][nc] + 1;
            }
            if (nt < dist[nr][nc]) {
                dist[nr][nc] = nt;
                pq.push({nt, nr, nc});
            }
        }
    }
    return -1;
}`,
      explanation: [
        "Waiting is possible only by stepping to a neighbour and stepping back, which costs two seconds. So the arrival time at a cell is fixed in parity: it must be congruent to t + 1 modulo 2 where t is the departure time.",
        "If grid[nr][nc] is already reachable at t + 1, the edge weight is 1. Otherwise pad forward to the first time at or after grid[nr][nc] with the right parity: grid value itself when the gap is even, one more when it is odd. All these weights are non-negative, so Dijkstra settles normally.",
        "The single special case is the start: if both immediate neighbours require a time above 1 there is no legal first move at all, and no amount of bouncing helps, so the answer is -1 immediately.",
        "Time: O(m * n * log(m * n)). Space: O(m * n).",
      ],
    },
    {
      name: "Reachable Nodes In Subdivided Graph",
      difficulty: "Hard",
      variation: "Dijkstra plus per-edge accounting",
      link: "https://leetcode.com/problems/reachable-nodes-in-subdivided-graph/",
      question: [
        "You are given an undirected graph of n nodes where each edge edges[i] = [u, v, cnt] is subdivided by inserting cnt new nodes in a line between u and v. Starting from node 0, return how many nodes (original or subdivided) you can reach using at most maxMoves moves, where each move traverses one unit-length segment.",
        "Example 1:\nInput: edges = [[0,1,10],[0,2,1],[1,2,2]], maxMoves = 6, n = 3\nOutput: 13",
        "Example 2:\nInput: edges = [[0,1,4],[1,2,6],[0,2,8],[1,3,1]], maxMoves = 10, n = 4\nOutput: 23",
        "Constraints:\n- 0 <= edges.length <= min(n * (n - 1) / 2, 10^4)\n- 0 <= cnt <= 10^4\n- 0 <= maxMoves <= 10^9\n- 1 <= n <= 3000",
      ],
      code: `int reachableNodes(vector<vector<int>>& edges, int maxMoves, int n) {
    vector<vector<pair<int,int>>> adj(n);
    for (auto& e : edges) {
        adj[e[0]].push_back({e[1], e[2]});
        adj[e[1]].push_back({e[0], e[2]});
    }
    const int INF = 1e9;
    vector<int> dist(n, INF);
    dist[0] = 0;
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;
    pq.push({0, 0});
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;
        for (auto& [v, w] : adj[u]) {
            if (d + w + 1 < dist[v]) {
                dist[v] = d + w + 1;
                pq.push({dist[v], v});
            }
        }
    }
    int ans = 0;
    for (int i = 0; i < n; i++) {
        if (dist[i] <= maxMoves) ans++;
    }
    for (auto& e : edges) {
        int a = dist[e[0]] <= maxMoves ? maxMoves - dist[e[0]] : 0;
        int b = dist[e[1]] <= maxMoves ? maxMoves - dist[e[1]] : 0;
        ans += min(e[2], a + b);
    }
    return ans;
}`,
      explanation: [
        "Never build the subdivided graph - it can have 10^8 nodes. Instead run Dijkstra on the original n nodes where an edge with cnt inserted nodes has weight cnt + 1, giving the true move count between original endpoints.",
        "Then count separately. Every original node with dist <= maxMoves is reachable. For each edge, the leftover budget at u reaches min(cnt, maxMoves - dist[u]) of its subdivided nodes from one side and similarly from v; the total consumed is min(cnt, a + b), and the cap prevents double counting the nodes reachable from both ends.",
        "Nodes with dist above maxMoves contribute nothing and their leftover is clamped to zero, which also avoids the negative-subtraction trap.",
        "Time: O(E log V). Space: O(V + E).",
      ],
    },
    {
      name: "Swim in Rising Water",
      difficulty: "Hard",
      variation: "Minimax Dijkstra (bottleneck path)",
      link: "https://leetcode.com/problems/swim-in-rising-water/",
      question: [
        "You are given an n x n integer matrix grid where grid[r][c] is the elevation at that cell. Rain starts falling and at time t the water depth everywhere is t. You can swim from a cell to any adjacent cell in zero time if both elevations are at most t. Starting at (0, 0), return the least time until you can reach (n-1, n-1).",
        "Example 1:\nInput: grid = [[0,2],[1,3]]\nOutput: 3",
        "Example 2:\nInput: grid = [[0,1,2,3,4],[24,23,22,21,5],[12,13,14,15,16],[11,17,18,19,20],[10,9,8,7,6]]\nOutput: 16",
        "Constraints:\n- 1 <= n <= 50\n- 0 <= grid[r][c] < n * n\n- Each value in grid is unique",
      ],
      code: `int swimInWater(vector<vector<int>>& grid) {
    int n = grid.size();
    const int INF = 1e9;
    vector<vector<int>> best(n, vector<int>(n, INF));
    priority_queue<tuple<int,int,int>, vector<tuple<int,int,int>>, greater<>> pq;
    best[0][0] = grid[0][0];
    pq.push({grid[0][0], 0, 0});
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    while (!pq.empty()) {
        auto [t, r, c] = pq.top(); pq.pop();
        if (t > best[r][c]) continue;
        if (r == n - 1 && c == n - 1) return t;
        for (int k = 0; k < 4; k++) {
            int nr = r + dr[k], nc = c + dc[k];
            if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
            int nt = max(t, grid[nr][nc]);
            if (nt < best[nr][nc]) {
                best[nr][nc] = nt;
                pq.push({nt, nr, nc});
            }
        }
    }
    return -1;
}`,
      explanation: [
        "The time to finish a route is the maximum elevation on it, so this is a bottleneck shortest-path problem: minimise the largest cell value along the way. Relaxation is new = max(current bottleneck, neighbour elevation).",
        "As with minimum effort, max is monotone under path extension, so the smallest bottleneck popped from the heap is final and Dijkstra's settling argument goes through unchanged.",
        "Alternatives: binary search t from 0 to n*n-1 with a flood fill, or add cells in increasing elevation into a union-find and stop when the two corners connect. All three are standard; the heap version is the shortest to write.",
        "Time: O(n^2 log n). Space: O(n^2).",
      ],
    },
    {
      name: "Minimum Cost to Make at Least One Valid Path in a Grid",
      difficulty: "Hard",
      variation: "0-1 weights: Dijkstra or deque BFS",
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
        "Model each cell as a node with four outgoing edges. Following the printed sign costs 0; any of the other three directions costs 1 because the sign has to be rewritten. The answer is the shortest path from (0,0) to (m-1,n-1) in that weighted graph.",
        "Because the only weights are 0 and 1, a deque replaces the heap: zero-cost relaxations go on the front, unit-cost ones on the back. The deque then always holds at most two distinct distance values, d and d + 1, in sorted order, so popping from the front is exactly the min-extract a heap would do - at O(1) instead of O(log V).",
        "An ordinary min-heap Dijkstra on the same graph is equally correct and is the version to reach for if the weights ever stop being 0/1. Note that plain BFS is not enough: the frontier is not uniform in cost.",
        "Time: O(m * n) with the deque, O(m * n * log(m * n)) with a heap. Space: O(m * n).",
      ],
    },
    {
      name: "Second Minimum Time to Reach Destination",
      difficulty: "Hard",
      variation: "Two-label (second shortest) search",
      link: "https://leetcode.com/problems/second-minimum-time-to-reach-destination/",
      question: [
        "A city has n intersections numbered 1..n connected by bidirectional edges. Each edge takes time seconds to traverse. Every intersection has a traffic signal that is green for change seconds then red for change seconds, starting green at time 0, and you may not leave an intersection while its signal is red. Given that all edges take the same time, return the second minimum time in minutes it takes to go from intersection 1 to intersection n. The second minimum is the smallest value strictly greater than the minimum.",
        "Example 1:\nInput: n = 5, edges = [[1,2],[1,3],[1,4],[3,4],[4,5]], time = 3, change = 5\nOutput: 13",
        "Example 2:\nInput: n = 2, edges = [[1,2]], time = 3, change = 2\nOutput: 11\nExplanation: The only route is 1 -> 2; the second minimum must go 1 -> 2 -> 1 -> 2.",
        "Constraints:\n- 2 <= n <= 10^4\n- n - 1 <= edges.length <= min(2 * 10^4, n * (n - 1) / 2)\n- 1 <= time, change <= 10^3\n- The graph is connected with no self loops or duplicate edges",
      ],
      code: `int secondMinimum(int n, vector<vector<int>>& edges, int time, int change) {
    vector<vector<int>> adj(n + 1);
    for (auto& e : edges) {
        adj[e[0]].push_back(e[1]);
        adj[e[1]].push_back(e[0]);
    }
    const int INF = 1e9;
    vector<int> d1(n + 1, INF), d2(n + 1, INF);
    d1[1] = 0;
    queue<pair<int,int>> q;
    q.push({1, 0});
    while (!q.empty()) {
        auto [u, d] = q.front(); q.pop();
        for (int v : adj[u]) {
            int nd = d + 1;
            if (nd < d1[v]) {
                d1[v] = nd;
                q.push({v, nd});
            } else if (nd > d1[v] && nd < d2[v]) {
                d2[v] = nd;
                q.push({v, nd});
            }
        }
    }
    int steps = (d2[n] == INF) ? d1[n] + 2 : d2[n];
    int t = 0;
    for (int i = 0; i < steps; i++) {
        if ((t / change) % 2 == 1) t = (t / change + 1) * change;
        t += time;
    }
    return t;
}`,
      explanation: [
        "Every edge costs the same, so the total time is a strictly increasing function of the number of edges walked. Finding the second smallest time therefore reduces to finding the second smallest edge count, and the traffic-signal delays are applied afterwards.",
        "Keep two labels per node instead of one: d1 for the shortest edge count and d2 for the smallest count strictly greater than d1. This is the standard k-shortest-distinct-distances trick, usable with a heap for weighted graphs and with a plain queue here because all weights are 1.",
        "If no strictly longer route exists (a path graph, for instance) the second minimum is d1 + 2 - step off an edge and come back, which always exists in a connected graph with at least one edge.",
        "Then simulate: before each departure, if the current time falls in a red phase (an odd multiple-of-change block) round up to the start of the next green phase, then add time.",
        "Time: O(V + E). Space: O(V + E).",
      ],
    },
    {
      name: "Minimum Weighted Subgraph With the Required Paths",
      difficulty: "Hard",
      variation: "Three Dijkstra runs, meeting-point search",
      link: "https://leetcode.com/problems/minimum-weighted-subgraph-with-the-required-paths/",
      question: [
        "You are given an integer n denoting the number of nodes of a weighted directed graph, edges where edges[i] = [from, to, weight], and three distinct integers src1, src2 and dest. Return the minimum total weight of a subgraph of the graph such that it is possible to reach dest from both src1 and src2 inside that subgraph, or -1 if it is impossible.",
        "Example 1:\nInput: n = 6, edges = [[0,2,2],[0,5,6],[1,0,3],[1,4,5],[2,1,1],[2,3,3],[2,3,4],[3,4,2],[4,5,1]], src1 = 0, src2 = 1, dest = 5\nOutput: 9",
        "Example 2:\nInput: n = 3, edges = [[0,1,1],[2,1,1]], src1 = 0, src2 = 1, dest = 2\nOutput: -1",
        "Constraints:\n- 3 <= n <= 10^5\n- 0 <= edges.length <= 10^5\n- 1 <= weight <= 10^5",
      ],
      code: `long long minimumWeight(int n, vector<vector<int>>& edges, int src1, int src2, int dest) {
    vector<vector<pair<int,long long>>> g(n), rg(n);
    for (auto& e : edges) {
        g[e[0]].push_back({e[1], e[2]});
        rg[e[1]].push_back({e[0], e[2]});
    }
    const long long INF = (long long)4e18;
    auto run = [&](int s, vector<vector<pair<int,long long>>>& adj) {
        vector<long long> dist(n, INF);
        dist[s] = 0;
        priority_queue<pair<long long,int>, vector<pair<long long,int>>, greater<>> pq;
        pq.push({0, s});
        while (!pq.empty()) {
            auto [d, u] = pq.top(); pq.pop();
            if (d > dist[u]) continue;
            for (auto& [v, w] : adj[u]) {
                if (d + w < dist[v]) {
                    dist[v] = d + w;
                    pq.push({dist[v], v});
                }
            }
        }
        return dist;
    };
    vector<long long> a = run(src1, g);
    vector<long long> b = run(src2, g);
    vector<long long> c = run(dest, rg);
    long long best = INF;
    for (int v = 0; v < n; v++) {
        if (a[v] == INF || b[v] == INF || c[v] == INF) continue;
        best = min(best, a[v] + b[v] + c[v]);
    }
    return best == INF ? -1 : best;
}`,
      explanation: [
        "Any minimal subgraph is the union of two paths that share a suffix. Let v be the first node where the two routes merge; the total weight is dist(src1, v) + dist(src2, v) + dist(v, dest), and shared edges before v would only be counted once, which cannot improve on some other choice of meeting node.",
        "So compute three distance arrays with three Dijkstra runs: from src1 on the graph, from src2 on the graph, and from dest on the reversed graph (which gives distances into dest). Then try every node as the meeting point.",
        "Distances must be 64-bit: three paths of up to 10^5 edges at weight 10^5 sum to around 3 * 10^10. Unreachable nodes are skipped so INF never enters the sum.",
        "Time: O(E log V). Space: O(V + E).",
      ],
    },
    {
      name: "Maximum Path Quality of a Graph",
      difficulty: "Hard",
      variation: "Dijkstra as a pruning oracle for DFS",
      link: "https://leetcode.com/problems/maximum-path-quality-of-a-graph/",
      question: [
        "You are given an undirected graph of n nodes with values[i] the value of node i, edges[j] = [u, v, time] the time to traverse an edge, and an integer maxTime. A valid path starts and ends at node 0 and takes total time at most maxTime; its quality is the sum of the values of the distinct nodes it visits. Return the maximum quality of a valid path. Nodes may be revisited but count once.",
        "Example 1:\nInput: values = [0,32,10,43], edges = [[0,1,10],[1,2,15],[0,3,10]], maxTime = 49\nOutput: 75\nExplanation: 0 -> 1 -> 0 -> 3 -> 0 takes 40 and collects 0 + 32 + 43.",
        "Example 2:\nInput: values = [5,10,15,20], edges = [[0,1,10],[1,2,10],[0,3,10]], maxTime = 30\nOutput: 25",
        "Constraints:\n- 1 <= n <= 1000\n- 0 <= edges.length <= 2000\n- 10 <= time <= 100, 10 <= maxTime <= 100\n- Each node has at most four edges",
      ],
      code: `int maximalPathQuality(vector<int>& values, vector<vector<int>>& edges, int maxTime) {
    int n = values.size();
    vector<vector<pair<int,int>>> adj(n);
    for (auto& e : edges) {
        adj[e[0]].push_back({e[1], e[2]});
        adj[e[1]].push_back({e[0], e[2]});
    }
    const int INF = 1e9;
    vector<int> dist(n, INF);
    dist[0] = 0;
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;
    pq.push({0, 0});
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;
        for (auto& [v, w] : adj[u]) {
            if (d + w < dist[v]) {
                dist[v] = d + w;
                pq.push({dist[v], v});
            }
        }
    }
    vector<int> seen(n, 0);
    int best = 0;
    function<void(int,int,int)> dfs = [&](int u, int left, int quality) {
        if (u == 0) best = max(best, quality);
        for (auto& [v, w] : adj[u]) {
            if (w > left) continue;
            if (dist[v] > left - w) continue;
            int gain = (seen[v] == 0) ? values[v] : 0;
            seen[v]++;
            dfs(v, left - w, quality + gain);
            seen[v]--;
        }
    };
    seen[0] = 1;
    dfs(0, maxTime, values[0]);
    return best;
}`,
      explanation: [
        "Edge times are at least 10 and maxTime is at most 100, so any valid walk uses at most ten edges and with degree at most four the raw search space is small enough to enumerate exhaustively.",
        "Dijkstra is used not to answer the question but as a pruning oracle: dist[v] is the cheapest way back home from v, so a branch that would leave less than dist[v] of budget can never close the loop and is cut immediately. This is what keeps the DFS from exploring dead ends.",
        "The seen counter is incremented and decremented around the recursive call so a node's value is credited only on its first visit within the current walk, matching the distinct-nodes rule while still allowing revisits.",
        "Time: O(E log V + 4^10) in the worst case, small in practice. Space: O(V + E).",
      ],
    },
    {
      name: "K-th Shortest Path Length",
      difficulty: "Hard",
      variation: "Dijkstra with a per-node pop budget",
      question: [
        "Given a directed weighted graph with n nodes numbered 0..n-1 (adjacency list adj, where adj[u] holds pairs (v, w)), a source src, a target dst and an integer k, return the length of the k-th shortest walk from src to dst. Walks may repeat nodes and edges, and the k values are taken with multiplicity, so if two distinct walks have the same length they both count. Return -1 if fewer than k walks exist.",
        "Example 1:\nInput: n = 3, adj = [[(1,1),(2,5)], [(2,1)], []], src = 0, dst = 2, k = 2\nOutput: 5\nExplanation: The walk lengths to node 2 are 2 (0 -> 1 -> 2) and 5 (0 -> 2), so the second shortest is 5.",
        "Constraints:\n- 1 <= n <= 10^5\n- 0 <= number of edges <= 2 * 10^5\n- 1 <= w <= 10^9\n- 1 <= k <= 100",
      ],
      code: `long long kthShortestPath(int n, vector<vector<pair<int,long long>>>& adj, int src, int dst, int k) {
    vector<int> popped(n, 0);
    priority_queue<pair<long long,int>, vector<pair<long long,int>>, greater<>> pq;
    pq.push({0, src});
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (popped[u] >= k) continue;
        popped[u]++;
        if (u == dst && popped[u] == k) return d;
        for (auto& [v, w] : adj[u]) {
            if (popped[v] < k) pq.push({d + w, v});
        }
    }
    return -1;
}`,
      explanation: [
        "Standard Dijkstra settles each node once. To get the k shortest walk lengths, allow each node to be popped up to k times and drop the stale-entry guard entirely - every heap entry now represents a genuine candidate walk rather than a duplicate to be discarded.",
        "Because the heap yields entries in non-decreasing order of length and all weights are non-negative, the i-th time a node is popped its length is the i-th smallest walk length ending there. So the k-th pop of dst is the answer.",
        "The budget check popped[v] < k before pushing is what bounds the work: each node contributes at most k * outdegree pushes, so the heap holds O(k * E) entries overall.",
        "This counts walks, not simple paths. The k shortest loopless paths need Yen's algorithm instead, which is a different and much heavier construction.",
        "Time: O(k * E log(k * E)). Space: O(k * E).",
      ],
    },
  ],
};
