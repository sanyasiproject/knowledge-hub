import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Min-Cost Max-Flow (SPFA Augmentation)",
      difficulty: "Medium",
      variation: "SPFA-based MCMF",
      question: [
        "You are given a directed network with n nodes numbered 0 to n-1, a source s and a sink t, and a list of edges where each edge is (u, v, cap, cost) meaning up to cap units may be sent from u to v at a price of cost per unit. Send the maximum possible number of units from s to t, and among all maximum flows choose one of minimum total cost. Return the pair (maximum flow value, minimum total cost).",
        "Example 1:\nInput: n = 4, s = 0, t = 3, edges = [(0,1,2,1),(0,2,2,3),(1,3,2,3),(2,3,2,1)]\nOutput: flow = 4, cost = 16\nExplanation: Two units along 0-1-3 cost 2 * 4 = 8 and two units along 0-2-3 cost 2 * 4 = 8.",
        "Example 2:\nInput: n = 3, s = 0, t = 2, edges = [(0,1,1,5),(1,2,1,5)]\nOutput: flow = 1, cost = 10",
        "Constraints:\n- 2 <= n <= 500\n- 1 <= number of edges <= 5000\n- 1 <= cap <= 10^6\n- Costs may be negative, but the network contains no negative-cost cycle",
      ],
      code: `struct MCMF {
    struct Edge {
        int to;
        long long cap, flow, cost;
    };
    int n;
    vector<Edge> edges;
    vector<vector<int>> g;
    MCMF(int n) : n(n), g(n) {}
    void addEdge(int u, int v, long long cap, long long cost) {
        g[u].push_back((int)edges.size());
        edges.push_back({v, cap, 0, cost});
        g[v].push_back((int)edges.size());
        edges.push_back({u, 0, 0, -cost});
    }
    pair<long long, long long> minCostMaxFlow(int s, int t) {
        const long long INF = (long long)4e18;
        long long totalFlow = 0, totalCost = 0;
        while (true) {
            vector<long long> dist(n, INF);
            vector<int> inQueue(n, 0), prevEdge(n, -1);
            deque<int> q;
            dist[s] = 0;
            q.push_back(s);
            inQueue[s] = 1;
            while (!q.empty()) {
                int u = q.front();
                q.pop_front();
                inQueue[u] = 0;
                for (int id : g[u]) {
                    if (edges[id].cap - edges[id].flow <= 0) continue;
                    int v = edges[id].to;
                    if (dist[u] + edges[id].cost < dist[v]) {
                        dist[v] = dist[u] + edges[id].cost;
                        prevEdge[v] = id;
                        if (!inQueue[v]) {
                            inQueue[v] = 1;
                            q.push_back(v);
                        }
                    }
                }
            }
            if (dist[t] >= INF) break;
            long long push = INF;
            for (int v = t; v != s; ) {
                int id = prevEdge[v];
                push = min(push, edges[id].cap - edges[id].flow);
                v = edges[id ^ 1].to;
            }
            for (int v = t; v != s; ) {
                int id = prevEdge[v];
                edges[id].flow += push;
                edges[id ^ 1].flow -= push;
                v = edges[id ^ 1].to;
            }
            totalFlow += push;
            totalCost += push * dist[t];
        }
        return {totalFlow, totalCost};
    }
};`,
      explanation: [
        "This is the successive shortest paths method. Repeatedly find a cheapest path from s to t in the residual network and saturate it. Because each augmentation is along a minimum-cost path, the flow of value f produced after each round is a minimum-cost flow of that value, and the loop stops when no augmenting path is left, i.e. at maximum flow.",
        "Why it is correct: a flow of value f is minimum cost if and only if its residual network has no negative-cost cycle. Starting from the zero flow, which trivially has none, augmenting along a shortest path can never create a negative cycle, so the invariant is preserved at every step. That is the standard proof that successive shortest paths yields the cheapest maximum flow.",
        "Residual edges carry the negated cost, which is what lets the algorithm undo an earlier routing decision when a better one appears later. Because those negative arcs exist from the first augmentation onward, plain Dijkstra cannot be used here and a label-correcting shortest path is needed; SPFA is a queue-based Bellman-Ford that is fast in practice. Edges are stored in pairs so that id XOR 1 is the reverse edge.",
        "Time: O(flow * n * E) in the worst case, much faster in practice. Space: O(n + E).",
      ],
    },
    {
      name: "Cheapest Way to Route k Units of Traffic",
      difficulty: "Medium",
      variation: "Min-cost flow of fixed value",
      question: [
        "You run a network of n routers numbered 0 to n-1 connected by directed links; each link is given as (u, v, cap, cost) meaning it can carry up to cap gigabits from u to v at a price of cost per gigabit. You must move exactly k gigabits from router s to router t. Return the minimum total price, or -1 if the network cannot carry k gigabits.",
        "Example 1:\nInput: n = 4, s = 0, t = 3, k = 3, edges = [(0,1,2,1),(0,2,2,2),(1,3,2,1),(2,3,2,1)]\nOutput: 7\nExplanation: Two gigabits along 0-1-3 cost 4, one gigabit along 0-2-3 costs 3.",
        "Example 2:\nInput: n = 3, s = 0, t = 2, k = 5, edges = [(0,1,1,1),(1,2,1,1)]\nOutput: -1\nExplanation: The network carries at most one gigabit.",
        "Constraints:\n- 2 <= n <= 500\n- 1 <= number of edges <= 5000\n- 1 <= k <= 10^6\n- 1 <= cap <= 10^6\n- 0 <= cost <= 10^6",
      ],
      code: `struct MCMF {
    struct Edge {
        int to;
        long long cap, flow, cost;
    };
    int n;
    vector<Edge> edges;
    vector<vector<int>> g;
    MCMF(int n) : n(n), g(n) {}
    void addEdge(int u, int v, long long cap, long long cost) {
        g[u].push_back((int)edges.size());
        edges.push_back({v, cap, 0, cost});
        g[v].push_back((int)edges.size());
        edges.push_back({u, 0, 0, -cost});
    }
    pair<long long, long long> flowOfValue(int s, int t, long long limit) {
        const long long INF = (long long)4e18;
        long long totalFlow = 0, totalCost = 0;
        while (totalFlow < limit) {
            vector<long long> dist(n, INF);
            vector<int> inQueue(n, 0), prevEdge(n, -1);
            deque<int> q;
            dist[s] = 0;
            q.push_back(s);
            inQueue[s] = 1;
            while (!q.empty()) {
                int u = q.front();
                q.pop_front();
                inQueue[u] = 0;
                for (int id : g[u]) {
                    if (edges[id].cap - edges[id].flow <= 0) continue;
                    int v = edges[id].to;
                    if (dist[u] + edges[id].cost < dist[v]) {
                        dist[v] = dist[u] + edges[id].cost;
                        prevEdge[v] = id;
                        if (!inQueue[v]) {
                            inQueue[v] = 1;
                            q.push_back(v);
                        }
                    }
                }
            }
            if (dist[t] >= INF) break;
            long long push = limit - totalFlow;
            for (int v = t; v != s; ) {
                int id = prevEdge[v];
                push = min(push, edges[id].cap - edges[id].flow);
                v = edges[id ^ 1].to;
            }
            for (int v = t; v != s; ) {
                int id = prevEdge[v];
                edges[id].flow += push;
                edges[id ^ 1].flow -= push;
                v = edges[id ^ 1].to;
            }
            totalFlow += push;
            totalCost += push * dist[t];
        }
        return {totalFlow, totalCost};
    }
};

long long cheapestRouting(int n, int s, int t, long long k,
                          vector<array<long long, 4>>& edges) {
    MCMF mcmf(n);
    for (auto& e : edges) mcmf.addEdge((int)e[0], (int)e[1], e[2], e[3]);
    auto res = mcmf.flowOfValue(s, t, k);
    if (res.first < k) return -1;
    return res.second;
}`,
      explanation: [
        "The only change from plain min-cost max-flow is the stopping rule: augment while the flow shipped is still below k, and clamp the last augmentation so the total lands exactly on k.",
        "The clamping is safe because successive shortest paths maintains the invariant that the current flow is a minimum-cost flow of its own value. Stopping early therefore gives the cheapest flow of value exactly k, and partially using a shortest path is still optimal since cost is linear in the number of units sent along it.",
        "If the loop runs out of augmenting paths before reaching k, the network's maximum flow is less than k and the demand is infeasible, so the function reports -1.",
        "Time: O(k * n * E) worst case, in practice bounded by the number of augmentations which is at most the number of distinct shortest-path lengths times E. Space: O(n + E).",
      ],
    },
    {
      name: "Transportation Problem",
      difficulty: "Medium",
      variation: "Supply and demand bipartite flow",
      question: [
        "There are p warehouses and q shops. Warehouse i holds supply[i] identical units and shop j needs demand[j] units. Shipping one unit from warehouse i to shop j costs cost[i][j]. The total supply is at least the total demand. Return the minimum total shipping cost that satisfies every shop's demand exactly.",
        "Example 1:\nInput: supply = [3,4], demand = [2,5], cost = [[1,3],[2,1]]\nOutput: 9\nExplanation: Ship 2 units from warehouse 0 to shop 0 (cost 2) and 1 unit from warehouse 0 to shop 1 (cost 3), then 4 units from warehouse 1 to shop 1 (cost 4). Total 9.",
        "Example 2:\nInput: supply = [5], demand = [5], cost = [[7]]\nOutput: 35",
        "Constraints:\n- 1 <= p, q <= 100\n- 1 <= supply[i], demand[j] <= 10^6\n- 0 <= cost[i][j] <= 10^6\n- The sum of supply is greater than or equal to the sum of demand",
      ],
      code: `struct MCMF {
    struct Edge {
        int to;
        long long cap, flow, cost;
    };
    int n;
    vector<Edge> edges;
    vector<vector<int>> g;
    MCMF(int n) : n(n), g(n) {}
    void addEdge(int u, int v, long long cap, long long cost) {
        g[u].push_back((int)edges.size());
        edges.push_back({v, cap, 0, cost});
        g[v].push_back((int)edges.size());
        edges.push_back({u, 0, 0, -cost});
    }
    pair<long long, long long> minCostMaxFlow(int s, int t) {
        const long long INF = (long long)4e18;
        long long totalFlow = 0, totalCost = 0;
        while (true) {
            vector<long long> dist(n, INF);
            vector<int> inQueue(n, 0), prevEdge(n, -1);
            deque<int> q;
            dist[s] = 0;
            q.push_back(s);
            inQueue[s] = 1;
            while (!q.empty()) {
                int u = q.front();
                q.pop_front();
                inQueue[u] = 0;
                for (int id : g[u]) {
                    if (edges[id].cap - edges[id].flow <= 0) continue;
                    int v = edges[id].to;
                    if (dist[u] + edges[id].cost < dist[v]) {
                        dist[v] = dist[u] + edges[id].cost;
                        prevEdge[v] = id;
                        if (!inQueue[v]) {
                            inQueue[v] = 1;
                            q.push_back(v);
                        }
                    }
                }
            }
            if (dist[t] >= INF) break;
            long long push = INF;
            for (int v = t; v != s; ) {
                int id = prevEdge[v];
                push = min(push, edges[id].cap - edges[id].flow);
                v = edges[id ^ 1].to;
            }
            for (int v = t; v != s; ) {
                int id = prevEdge[v];
                edges[id].flow += push;
                edges[id ^ 1].flow -= push;
                v = edges[id ^ 1].to;
            }
            totalFlow += push;
            totalCost += push * dist[t];
        }
        return {totalFlow, totalCost};
    }
};

long long transportationCost(vector<long long>& supply, vector<long long>& demand,
                             vector<vector<long long>>& cost) {
    int p = supply.size(), q = demand.size();
    int s = p + q, t = p + q + 1;
    MCMF mcmf(p + q + 2);
    for (int i = 0; i < p; i++) mcmf.addEdge(s, i, supply[i], 0);
    for (int j = 0; j < q; j++) mcmf.addEdge(p + j, t, demand[j], 0);
    for (int i = 0; i < p; i++) {
        for (int j = 0; j < q; j++) {
            mcmf.addEdge(i, p + j, min(supply[i], demand[j]), cost[i][j]);
        }
    }
    auto res = mcmf.minCostMaxFlow(s, t);
    return res.second;
}`,
      explanation: [
        "Build a super source connected to each warehouse with capacity equal to its supply and zero cost, a super sink fed by each shop with capacity equal to its demand and zero cost, and a full bipartite layer of shipping edges carrying the per-unit costs with effectively unlimited capacity.",
        "Because the sink edges have capacity exactly demand[j] and total supply covers total demand, the maximum flow saturates every sink edge, so any maximum flow satisfies all demands. Min-cost max-flow then picks the cheapest such shipping plan. Leftover supply simply stays unused, which is the intended behaviour when supply exceeds demand.",
        "Integrality matters here: because all capacities are integers, the successive shortest paths method returns an integral optimal flow, so the answer is a genuine shipment plan in whole units rather than a fractional one.",
        "Time: dominated by the augmentations, O(flow_augmentations * n * E) with n = p + q + 2 and E = p * q. Space: O(p * q).",
      ],
    },
    {
      name: "Assignment Problem via Min-Cost Flow",
      difficulty: "Medium",
      variation: "Minimum cost perfect matching",
      question: [
        "You are given an n x n matrix cost where cost[i][j] is the price of assigning worker i to job j. Every worker must be given exactly one job and every job must be taken by exactly one worker. Return the minimum total price of a complete assignment.",
        "Example 1:\nInput: cost = [[4,1,3],[2,0,5],[3,2,2]]\nOutput: 5\nExplanation: Worker 0 takes job 1 (1), worker 1 takes job 0 (2), worker 2 takes job 2 (2).",
        "Example 2:\nInput: cost = [[1,2],[2,1]]\nOutput: 2",
        "Constraints:\n- 1 <= n <= 150\n- -10^6 <= cost[i][j] <= 10^6",
      ],
      code: `struct MCMF {
    struct Edge {
        int to;
        long long cap, flow, cost;
    };
    int n;
    vector<Edge> edges;
    vector<vector<int>> g;
    MCMF(int n) : n(n), g(n) {}
    void addEdge(int u, int v, long long cap, long long cost) {
        g[u].push_back((int)edges.size());
        edges.push_back({v, cap, 0, cost});
        g[v].push_back((int)edges.size());
        edges.push_back({u, 0, 0, -cost});
    }
    pair<long long, long long> minCostMaxFlow(int s, int t) {
        const long long INF = (long long)4e18;
        long long totalFlow = 0, totalCost = 0;
        while (true) {
            vector<long long> dist(n, INF);
            vector<int> inQueue(n, 0), prevEdge(n, -1);
            deque<int> q;
            dist[s] = 0;
            q.push_back(s);
            inQueue[s] = 1;
            while (!q.empty()) {
                int u = q.front();
                q.pop_front();
                inQueue[u] = 0;
                for (int id : g[u]) {
                    if (edges[id].cap - edges[id].flow <= 0) continue;
                    int v = edges[id].to;
                    if (dist[u] + edges[id].cost < dist[v]) {
                        dist[v] = dist[u] + edges[id].cost;
                        prevEdge[v] = id;
                        if (!inQueue[v]) {
                            inQueue[v] = 1;
                            q.push_back(v);
                        }
                    }
                }
            }
            if (dist[t] >= INF) break;
            long long push = INF;
            for (int v = t; v != s; ) {
                int id = prevEdge[v];
                push = min(push, edges[id].cap - edges[id].flow);
                v = edges[id ^ 1].to;
            }
            for (int v = t; v != s; ) {
                int id = prevEdge[v];
                edges[id].flow += push;
                edges[id ^ 1].flow -= push;
                v = edges[id ^ 1].to;
            }
            totalFlow += push;
            totalCost += push * dist[t];
        }
        return {totalFlow, totalCost};
    }
};

long long minAssignmentCost(vector<vector<long long>>& cost) {
    int n = cost.size();
    int s = 2 * n, t = 2 * n + 1;
    MCMF mcmf(2 * n + 2);
    for (int i = 0; i < n; i++) {
        mcmf.addEdge(s, i, 1, 0);
        mcmf.addEdge(n + i, t, 1, 0);
    }
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) mcmf.addEdge(i, n + j, 1, cost[i][j]);
    }
    auto res = mcmf.minCostMaxFlow(s, t);
    return res.second;
}`,
      explanation: [
        "Every worker gets a unit-capacity edge from the source and every job a unit-capacity edge to the sink, with one unit-capacity edge per worker-job pair carrying its price. A flow of value n therefore selects exactly one job per worker and one worker per job, so integral maximum flows correspond one-to-one with complete assignments.",
        "The maximum flow is always n because the bipartite layer is complete, and min-cost max-flow selects the cheapest assignment among them. Each augmentation ships exactly one unit and corresponds to an augmenting path in the matching, so there are exactly n rounds.",
        "Negative entries in the cost matrix are fine for this SPFA-based solver, and the network has no negative cycle because it is a layered acyclic network before any flow is pushed and the invariant is preserved afterwards. For n in the low thousands the dedicated Hungarian algorithm is the better tool at O(n^3).",
        "Time: O(n * n * E) with E = O(n * n), so roughly O(n^4) worst case. Space: O(n * n).",
      ],
    },
    {
      name: "Minimum Cost to Satisfy All Demands",
      difficulty: "Medium",
      variation: "Feasible flow with supplies and demands",
      question: [
        "You are given a directed network with n nodes numbered 0 to n-1 and edges (u, v, cap, cost). Each node i has a balance b[i]: a positive value means the node produces b[i] units that must leave it, a negative value means the node consumes -b[i] units, and zero means the node only relays. The balances sum to zero. Return the minimum total cost of a flow that satisfies every balance, or -1 if no such flow exists.",
        "Example 1:\nInput: n = 3, b = [2,0,-2], edges = [(0,1,2,1),(1,2,2,2)]\nOutput: 6\nExplanation: Two units travel 0 to 1 to 2 at a per-unit cost of 3.",
        "Example 2:\nInput: n = 2, b = [1,-1], edges = [(1,0,5,1)]\nOutput: -1\nExplanation: The only edge points the wrong way.",
        "Constraints:\n- 2 <= n <= 500\n- 0 <= number of edges <= 5000\n- 1 <= cap <= 10^6\n- 0 <= cost <= 10^6\n- The sum of all b[i] is 0",
      ],
      code: `struct MCMF {
    struct Edge {
        int to;
        long long cap, flow, cost;
    };
    int n;
    vector<Edge> edges;
    vector<vector<int>> g;
    MCMF(int n) : n(n), g(n) {}
    void addEdge(int u, int v, long long cap, long long cost) {
        g[u].push_back((int)edges.size());
        edges.push_back({v, cap, 0, cost});
        g[v].push_back((int)edges.size());
        edges.push_back({u, 0, 0, -cost});
    }
    pair<long long, long long> minCostMaxFlow(int s, int t) {
        const long long INF = (long long)4e18;
        long long totalFlow = 0, totalCost = 0;
        while (true) {
            vector<long long> dist(n, INF);
            vector<int> inQueue(n, 0), prevEdge(n, -1);
            deque<int> q;
            dist[s] = 0;
            q.push_back(s);
            inQueue[s] = 1;
            while (!q.empty()) {
                int u = q.front();
                q.pop_front();
                inQueue[u] = 0;
                for (int id : g[u]) {
                    if (edges[id].cap - edges[id].flow <= 0) continue;
                    int v = edges[id].to;
                    if (dist[u] + edges[id].cost < dist[v]) {
                        dist[v] = dist[u] + edges[id].cost;
                        prevEdge[v] = id;
                        if (!inQueue[v]) {
                            inQueue[v] = 1;
                            q.push_back(v);
                        }
                    }
                }
            }
            if (dist[t] >= INF) break;
            long long push = INF;
            for (int v = t; v != s; ) {
                int id = prevEdge[v];
                push = min(push, edges[id].cap - edges[id].flow);
                v = edges[id ^ 1].to;
            }
            for (int v = t; v != s; ) {
                int id = prevEdge[v];
                edges[id].flow += push;
                edges[id ^ 1].flow -= push;
                v = edges[id ^ 1].to;
            }
            totalFlow += push;
            totalCost += push * dist[t];
        }
        return {totalFlow, totalCost};
    }
};

long long minCostSatisfyDemands(int n, vector<long long>& b,
                                vector<array<long long, 4>>& edges) {
    int s = n, t = n + 1;
    MCMF mcmf(n + 2);
    for (auto& e : edges) mcmf.addEdge((int)e[0], (int)e[1], e[2], e[3]);
    long long needed = 0;
    for (int i = 0; i < n; i++) {
        if (b[i] > 0) {
            mcmf.addEdge(s, i, b[i], 0);
            needed += b[i];
        } else if (b[i] < 0) {
            mcmf.addEdge(i, t, -b[i], 0);
        }
    }
    auto res = mcmf.minCostMaxFlow(s, t);
    if (res.first < needed) return -1;
    return res.second;
}`,
      explanation: [
        "Node balances are converted into ordinary flow by attaching a super source and a super sink. A producing node receives an edge from the super source with capacity equal to its surplus; a consuming node sends an edge to the super sink with capacity equal to its deficit. Both sets of auxiliary edges have zero cost so they do not distort the objective.",
        "A flow satisfying all balances exists exactly when the maximum flow from the super source to the super sink saturates every auxiliary edge, that is, equals the total surplus. Otherwise some producer cannot push out its units or some consumer cannot be reached, and the answer is infeasible.",
        "Because the auxiliary edges cost nothing, the min-cost max-flow value is exactly the cheapest cost of a feasible flow. This construction is the workhorse behind circulation problems: add lower bounds and it becomes the feasible-circulation reduction.",
        "Time: O(flow_augmentations * n * E). Space: O(n + E).",
      ],
    },
    {
      name: "Minimum Cost to Move Chips onto Targets",
      difficulty: "Medium",
      variation: "Grid transportation instance",
      question: [
        "You are given a grid of r rows and c columns as an array of strings. The character C marks a cell holding one chip, the character T marks a target cell, and a dot marks an empty cell. Moving a chip one step up, down, left or right costs 1, chips may pass through any cell freely, and each target must end up holding exactly one chip. The number of chips equals the number of targets. Return the minimum total number of moves.",
        "Example 1:\nInput: grid = [\"CTC..T\"]\nOutput: 4\nExplanation: Chips sit at columns 0 and 2, targets at columns 1 and 5. Sending chip 0 to target 1 costs 1 and chip 2 to target 5 costs 3, total 4. The crossing pairing costs 5 + 1 = 6.",
        "Example 2:\nInput: grid = [\"CT\"]\nOutput: 1",
        "Constraints:\n- 1 <= r, c <= 40\n- The number of C characters equals the number of T characters and is at most 200\n- There are no obstacles, so the cost between two cells is their Manhattan distance",
      ],
      code: `struct MCMF {
    struct Edge {
        int to;
        long long cap, flow, cost;
    };
    int n;
    vector<Edge> edges;
    vector<vector<int>> g;
    MCMF(int n) : n(n), g(n) {}
    void addEdge(int u, int v, long long cap, long long cost) {
        g[u].push_back((int)edges.size());
        edges.push_back({v, cap, 0, cost});
        g[v].push_back((int)edges.size());
        edges.push_back({u, 0, 0, -cost});
    }
    pair<long long, long long> minCostMaxFlow(int s, int t) {
        const long long INF = (long long)4e18;
        long long totalFlow = 0, totalCost = 0;
        while (true) {
            vector<long long> dist(n, INF);
            vector<int> inQueue(n, 0), prevEdge(n, -1);
            deque<int> q;
            dist[s] = 0;
            q.push_back(s);
            inQueue[s] = 1;
            while (!q.empty()) {
                int u = q.front();
                q.pop_front();
                inQueue[u] = 0;
                for (int id : g[u]) {
                    if (edges[id].cap - edges[id].flow <= 0) continue;
                    int v = edges[id].to;
                    if (dist[u] + edges[id].cost < dist[v]) {
                        dist[v] = dist[u] + edges[id].cost;
                        prevEdge[v] = id;
                        if (!inQueue[v]) {
                            inQueue[v] = 1;
                            q.push_back(v);
                        }
                    }
                }
            }
            if (dist[t] >= INF) break;
            long long push = INF;
            for (int v = t; v != s; ) {
                int id = prevEdge[v];
                push = min(push, edges[id].cap - edges[id].flow);
                v = edges[id ^ 1].to;
            }
            for (int v = t; v != s; ) {
                int id = prevEdge[v];
                edges[id].flow += push;
                edges[id ^ 1].flow -= push;
                v = edges[id ^ 1].to;
            }
            totalFlow += push;
            totalCost += push * dist[t];
        }
        return {totalFlow, totalCost};
    }
};

long long minMoves(vector<string>& grid) {
    int r = grid.size(), c = grid[0].size();
    vector<pair<int, int>> chips, targets;
    for (int i = 0; i < r; i++) {
        for (int j = 0; j < c; j++) {
            if (grid[i][j] == 'C') chips.push_back({i, j});
            else if (grid[i][j] == 'T') targets.push_back({i, j});
        }
    }
    int a = chips.size(), b = targets.size();
    int s = a + b, t = a + b + 1;
    MCMF mcmf(a + b + 2);
    for (int i = 0; i < a; i++) mcmf.addEdge(s, i, 1, 0);
    for (int j = 0; j < b; j++) mcmf.addEdge(a + j, t, 1, 0);
    for (int i = 0; i < a; i++) {
        for (int j = 0; j < b; j++) {
            long long d = abs(chips[i].first - targets[j].first) +
                          abs(chips[i].second - targets[j].second);
            mcmf.addEdge(i, a + j, 1, d);
        }
    }
    auto res = mcmf.minCostMaxFlow(s, t);
    return res.second;
}`,
      explanation: [
        "Chips move independently and may overlap, so the total number of moves is just the sum of the distances of whichever chip-to-target pairing is chosen. That makes this a minimum-cost perfect matching on a bipartite graph whose edge weights are Manhattan distances.",
        "Unit capacities on the source and sink edges enforce one chip per target and one target per chip. Since every chip can reach every target, the maximum flow equals the number of chips, and min-cost max-flow returns the cheapest pairing.",
        "Greedily sending each chip to its nearest free target is not correct in general: claiming a nearby target can force a later chip into a much longer trip, and the loss is unbounded. Only a global optimisation, which augmenting along successively cheapest paths performs, gets it right.",
        "If obstacles were added, the only change would be replacing the Manhattan distance with a BFS distance computed per chip; the flow model stays identical.",
        "Time: O(a * n * E) with E = O(a * b). Space: O(a * b).",
      ],
    },
    {
      name: "k Edge-Disjoint Paths with Minimum Total Cost",
      difficulty: "Hard",
      variation: "Unit-capacity min-cost flow",
      question: [
        "You are given a directed graph with n nodes numbered 0 to n-1 and m weighted edges (u, v, w), where each edge may be used by at most one path. Find k paths from node 0 to node n-1 that pairwise share no edge and whose total length is as small as possible. Return the minimum total length, or -1 if k edge-disjoint paths do not exist.",
        "Example 1:\nInput: n = 4, k = 2, edges = [(0,1,1),(0,2,5),(1,3,1),(2,3,1)]\nOutput: 8\nExplanation: Path 0-1-3 has length 2 and path 0-2-3 has length 6, total 8. The two paths share no edge.",
        "Example 2:\nInput: n = 3, k = 2, edges = [(0,1,1),(1,2,1)]\nOutput: -1\nExplanation: Both candidate paths would have to reuse the same two edges.",
        "Constraints:\n- 2 <= n <= 500\n- 1 <= m <= 5000\n- 1 <= k <= 100\n- 1 <= w <= 10^6\n- Paths may share nodes, only edges must be distinct",
      ],
      code: `struct MCMF {
    struct Edge {
        int to;
        long long cap, flow, cost;
    };
    int n;
    vector<Edge> edges;
    vector<vector<int>> g;
    MCMF(int n) : n(n), g(n) {}
    void addEdge(int u, int v, long long cap, long long cost) {
        g[u].push_back((int)edges.size());
        edges.push_back({v, cap, 0, cost});
        g[v].push_back((int)edges.size());
        edges.push_back({u, 0, 0, -cost});
    }
    pair<long long, long long> flowOfValue(int s, int t, long long limit) {
        const long long INF = (long long)4e18;
        long long totalFlow = 0, totalCost = 0;
        while (totalFlow < limit) {
            vector<long long> dist(n, INF);
            vector<int> inQueue(n, 0), prevEdge(n, -1);
            deque<int> q;
            dist[s] = 0;
            q.push_back(s);
            inQueue[s] = 1;
            while (!q.empty()) {
                int u = q.front();
                q.pop_front();
                inQueue[u] = 0;
                for (int id : g[u]) {
                    if (edges[id].cap - edges[id].flow <= 0) continue;
                    int v = edges[id].to;
                    if (dist[u] + edges[id].cost < dist[v]) {
                        dist[v] = dist[u] + edges[id].cost;
                        prevEdge[v] = id;
                        if (!inQueue[v]) {
                            inQueue[v] = 1;
                            q.push_back(v);
                        }
                    }
                }
            }
            if (dist[t] >= INF) break;
            long long push = limit - totalFlow;
            for (int v = t; v != s; ) {
                int id = prevEdge[v];
                push = min(push, edges[id].cap - edges[id].flow);
                v = edges[id ^ 1].to;
            }
            for (int v = t; v != s; ) {
                int id = prevEdge[v];
                edges[id].flow += push;
                edges[id ^ 1].flow -= push;
                v = edges[id ^ 1].to;
            }
            totalFlow += push;
            totalCost += push * dist[t];
        }
        return {totalFlow, totalCost};
    }
};

long long minCostKPaths(int n, int k, vector<array<long long, 3>>& edges) {
    MCMF mcmf(n);
    for (auto& e : edges) mcmf.addEdge((int)e[0], (int)e[1], 1, e[2]);
    auto res = mcmf.flowOfValue(0, n - 1, k);
    if (res.first < k) return -1;
    return res.second;
}`,
      explanation: [
        "Give every graph edge capacity 1 and cost equal to its weight, then send exactly k units from 0 to n-1. An integral flow of value k on a unit-capacity network decomposes into k edge-disjoint paths from source to sink, and the flow's cost is the sum of their lengths, so the two problems are equivalent.",
        "The reason a simple loop of k shortest-path searches is wrong is that the shortest path may need to be partly abandoned to make room for the others. The residual reverse arcs, carrying negated costs, are exactly the mechanism that lets a later augmentation cancel part of an earlier path, and successive shortest paths is guaranteed to reach the global optimum for every intermediate flow value.",
        "Because the residual network contains negative arcs from the first augmentation, the shortest-path subroutine must handle them: SPFA here, or Dijkstra with Johnson potentials for speed.",
        "For node-disjoint paths instead of edge-disjoint, split each intermediate node into an in-copy and an out-copy joined by a unit-capacity zero-cost edge.",
        "Time: O(k * n * E). Space: O(n + E).",
      ],
    },
    {
      name: "Maximum Profit Scheduling with Machine Capacities",
      difficulty: "Hard",
      variation: "Profit maximisation by cost negation",
      question: [
        "There are j jobs and p machines. Machine i can run at most cap[i] jobs. Running job x on machine i earns profit[i][x], where a value of -1 means the job cannot run on that machine. Each job runs at most once and you may leave jobs unscheduled. Return the maximum total profit.",
        "Example 1:\nInput: profit = [[10,1,-1],[2,8,3]], cap = [1,2]\nOutput: 21\nExplanation: Machine 0 runs job 0 for 10, machine 1 runs jobs 1 and 2 for 8 + 3 = 11.",
        "Example 2:\nInput: profit = [[5,-1]], cap = [2]\nOutput: 5\nExplanation: Job 1 cannot run anywhere, so it is skipped.",
        "Constraints:\n- 1 <= p <= 100\n- 1 <= j <= 300\n- 1 <= cap[i] <= j\n- profit[i][x] is -1 or in the range 0 to 10^6",
      ],
      code: `struct MCMF {
    struct Edge {
        int to;
        long long cap, flow, cost;
    };
    int n;
    vector<Edge> edges;
    vector<vector<int>> g;
    MCMF(int n) : n(n), g(n) {}
    void addEdge(int u, int v, long long cap, long long cost) {
        g[u].push_back((int)edges.size());
        edges.push_back({v, cap, 0, cost});
        g[v].push_back((int)edges.size());
        edges.push_back({u, 0, 0, -cost});
    }
    long long minCostFlowStopWhenPositive(int s, int t) {
        const long long INF = (long long)4e18;
        long long totalCost = 0;
        while (true) {
            vector<long long> dist(n, INF);
            vector<int> inQueue(n, 0), prevEdge(n, -1);
            deque<int> q;
            dist[s] = 0;
            q.push_back(s);
            inQueue[s] = 1;
            while (!q.empty()) {
                int u = q.front();
                q.pop_front();
                inQueue[u] = 0;
                for (int id : g[u]) {
                    if (edges[id].cap - edges[id].flow <= 0) continue;
                    int v = edges[id].to;
                    if (dist[u] + edges[id].cost < dist[v]) {
                        dist[v] = dist[u] + edges[id].cost;
                        prevEdge[v] = id;
                        if (!inQueue[v]) {
                            inQueue[v] = 1;
                            q.push_back(v);
                        }
                    }
                }
            }
            if (dist[t] >= INF || dist[t] >= 0) break;
            long long push = INF;
            for (int v = t; v != s; ) {
                int id = prevEdge[v];
                push = min(push, edges[id].cap - edges[id].flow);
                v = edges[id ^ 1].to;
            }
            for (int v = t; v != s; ) {
                int id = prevEdge[v];
                edges[id].flow += push;
                edges[id ^ 1].flow -= push;
                v = edges[id ^ 1].to;
            }
            totalCost += push * dist[t];
        }
        return totalCost;
    }
};

long long maxProfitSchedule(vector<vector<long long>>& profit, vector<long long>& cap) {
    int p = profit.size(), j = profit[0].size();
    int s = p + j, t = p + j + 1;
    MCMF mcmf(p + j + 2);
    for (int i = 0; i < p; i++) mcmf.addEdge(s, i, cap[i], 0);
    for (int x = 0; x < j; x++) mcmf.addEdge(p + x, t, 1, 0);
    for (int i = 0; i < p; i++) {
        for (int x = 0; x < j; x++) {
            if (profit[i][x] < 0) continue;
            mcmf.addEdge(i, p + x, 1, -profit[i][x]);
        }
    }
    return -mcmf.minCostFlowStopWhenPositive(s, t);
}`,
      explanation: [
        "Maximising profit becomes minimising cost by negating every profit. Machines are source-side nodes with capacity cap[i], jobs are sink-side nodes with capacity 1, and each feasible pairing is a unit-capacity edge whose cost is the negated profit.",
        "The subtlety is that jobs may be left unscheduled, so the objective is not maximum flow. The loop therefore stops as soon as the cheapest augmenting path has non-negative cost: from that point on, every additional unit of flow would reduce the total profit. Because successive shortest paths visits augmenting paths in non-decreasing cost order, stopping at the first non-negative one gives the true optimum over all flow values.",
        "Negative edge costs are exactly why SPFA is used rather than Dijkstra. There is still no negative cycle in the network because it is bipartite and acyclic in the forward direction, and augmenting along shortest paths preserves that property.",
        "Time: O(flow * n * E) with flow at most j. Space: O(p * j).",
      ],
    },
    {
      name: "Min-Cost Max-Flow with Johnson Potentials",
      difficulty: "Hard",
      variation: "Johnson potentials with Dijkstra",
      question: [
        "You are given a directed network with n nodes, a source s, a sink t, and edges (u, v, cap, cost) with all costs non-negative. The network is large: up to 5000 nodes and 50000 edges, and the flow value can be in the millions. Compute the maximum flow and its minimum cost using an augmentation routine fast enough for these limits.",
        "Example 1:\nInput: n = 4, s = 0, t = 3, edges = [(0,1,3,1),(0,2,2,1),(1,3,2,1),(2,3,3,2)]\nOutput: flow = 4, cost = 10\nExplanation: Two units along 0-1-3 cost 4 and two units along 0-2-3 cost 6.",
        "Example 2:\nInput: n = 2, s = 0, t = 1, edges = [(0,1,7,3)]\nOutput: flow = 7, cost = 21",
        "Constraints:\n- 2 <= n <= 5000\n- 1 <= number of edges <= 50000\n- 1 <= cap <= 10^9\n- 0 <= cost <= 10^9",
      ],
      code: `struct MCMFPotentials {
    struct Edge {
        int to;
        long long cap, flow, cost;
    };
    int n;
    vector<Edge> edges;
    vector<vector<int>> g;
    vector<long long> pot, dist;
    vector<int> prevEdge;
    MCMFPotentials(int n) : n(n), g(n), pot(n, 0), dist(n, 0), prevEdge(n, -1) {}
    void addEdge(int u, int v, long long cap, long long cost) {
        g[u].push_back((int)edges.size());
        edges.push_back({v, cap, 0, cost});
        g[v].push_back((int)edges.size());
        edges.push_back({u, 0, 0, -cost});
    }
    bool dijkstra(int s, int t) {
        const long long INF = (long long)4e18;
        dist.assign(n, INF);
        prevEdge.assign(n, -1);
        priority_queue<pair<long long, int>, vector<pair<long long, int>>,
                       greater<pair<long long, int>>> pq;
        dist[s] = 0;
        pq.push({0, s});
        while (!pq.empty()) {
            long long d = pq.top().first;
            int u = pq.top().second;
            pq.pop();
            if (d != dist[u]) continue;
            for (int id : g[u]) {
                if (edges[id].cap - edges[id].flow <= 0) continue;
                int v = edges[id].to;
                long long nd = d + edges[id].cost + pot[u] - pot[v];
                if (nd < dist[v]) {
                    dist[v] = nd;
                    prevEdge[v] = id;
                    pq.push({nd, v});
                }
            }
        }
        if (dist[t] >= INF) return false;
        for (int i = 0; i < n; i++) {
            if (dist[i] < INF) pot[i] += dist[i];
        }
        return true;
    }
    pair<long long, long long> minCostMaxFlow(int s, int t) {
        const long long INF = (long long)4e18;
        long long totalFlow = 0, totalCost = 0;
        while (dijkstra(s, t)) {
            long long push = INF;
            for (int v = t; v != s; ) {
                int id = prevEdge[v];
                push = min(push, edges[id].cap - edges[id].flow);
                v = edges[id ^ 1].to;
            }
            long long pathCost = 0;
            for (int v = t; v != s; ) {
                int id = prevEdge[v];
                pathCost += edges[id].cost;
                edges[id].flow += push;
                edges[id ^ 1].flow -= push;
                v = edges[id ^ 1].to;
            }
            totalFlow += push;
            totalCost += push * pathCost;
        }
        return {totalFlow, totalCost};
    }
};`,
      explanation: [
        "The bottleneck of successive shortest paths is the shortest-path search, and Bellman-Ford or SPFA costs O(n * E) per augmentation. Johnson's reweighting replaces it with Dijkstra at O(E log n) per augmentation.",
        "Keep a potential pot[i] per node and search using the reduced cost cost(u,v) + pot[u] - pot[v]. With all original costs non-negative, pot starts at zero and every reduced cost is non-negative at that point. After each Dijkstra, adding the computed reduced distances into pot maintains the invariant: for every residual edge, reduced cost stays non-negative, because pot[v] <= pot[u] + cost(u,v) is precisely the shortest-path inequality, and the reverse arcs created by saturating a shortest path have reduced cost exactly zero.",
        "Reduced costs along any s-to-t path telescope: the sum differs from the true cost only by pot[s] - pot[t], a constant. So the path Dijkstra finds under reduced costs is the same path that is cheapest under true costs, and the algorithm is still successive shortest paths. The code accumulates the real cost by walking the path, which avoids any potential bookkeeping in the final answer.",
        "If some original costs are negative, pot cannot start at zero. One Bellman-Ford pass on the initial network to initialise pot is required first, after which Dijkstra takes over for all augmentations.",
        "Time: O(flow_augmentations * E log n). Space: O(n + E).",
      ],
    },
    {
      name: "Negative-Cost Edges in Min-Cost Flow",
      difficulty: "Hard",
      variation: "Negative costs and potential initialisation",
      question: [
        "You are given a directed network with n nodes, a source s and a sink t, and edges (u, v, cap, cost) where cost may be negative. The network contains no negative-cost cycle. Compute the minimum-cost maximum flow using Dijkstra-based augmentation, which requires initialising Johnson potentials with one Bellman-Ford pass because plain Dijkstra is invalid on negative weights. Return the pair (maximum flow, minimum cost).",
        "Example 1:\nInput: n = 4, s = 0, t = 3, edges = [(0,1,1,4),(0,2,1,1),(1,3,1,-2),(2,3,1,1)]\nOutput: flow = 2, cost = 4\nExplanation: Path 0-1-3 costs 4 + (-2) = 2 and path 0-2-3 costs 2, so the total is 4.",
        "Example 2:\nInput: n = 3, s = 0, t = 2, edges = [(0,1,2,-5),(1,2,2,3)]\nOutput: flow = 2, cost = -4",
        "Constraints:\n- 2 <= n <= 2000\n- 1 <= number of edges <= 20000\n- 1 <= cap <= 10^9\n- -10^6 <= cost <= 10^6\n- The initial network has no negative-cost cycle",
      ],
      code: `struct MCMFNegative {
    struct Edge {
        int to;
        long long cap, flow, cost;
    };
    int n;
    vector<Edge> edges;
    vector<vector<int>> g;
    vector<long long> pot, dist;
    vector<int> prevEdge;
    MCMFNegative(int n) : n(n), g(n), pot(n, 0), dist(n, 0), prevEdge(n, -1) {}
    void addEdge(int u, int v, long long cap, long long cost) {
        g[u].push_back((int)edges.size());
        edges.push_back({v, cap, 0, cost});
        g[v].push_back((int)edges.size());
        edges.push_back({u, 0, 0, -cost});
    }
    void initPotentials() {
        pot.assign(n, 0);
        for (int iter = 0; iter < n; iter++) {
            bool changed = false;
            for (int id = 0; id < (int)edges.size(); id++) {
                if (edges[id].cap - edges[id].flow <= 0) continue;
                int u = edges[id ^ 1].to, v = edges[id].to;
                if (pot[u] + edges[id].cost < pot[v]) {
                    pot[v] = pot[u] + edges[id].cost;
                    changed = true;
                }
            }
            if (!changed) break;
        }
    }
    bool dijkstra(int s, int t) {
        const long long INF = (long long)4e18;
        dist.assign(n, INF);
        prevEdge.assign(n, -1);
        priority_queue<pair<long long, int>, vector<pair<long long, int>>,
                       greater<pair<long long, int>>> pq;
        dist[s] = 0;
        pq.push({0, s});
        while (!pq.empty()) {
            long long d = pq.top().first;
            int u = pq.top().second;
            pq.pop();
            if (d != dist[u]) continue;
            for (int id : g[u]) {
                if (edges[id].cap - edges[id].flow <= 0) continue;
                int v = edges[id].to;
                long long nd = d + edges[id].cost + pot[u] - pot[v];
                if (nd < dist[v]) {
                    dist[v] = nd;
                    prevEdge[v] = id;
                    pq.push({nd, v});
                }
            }
        }
        if (dist[t] >= INF) return false;
        for (int i = 0; i < n; i++) {
            if (dist[i] < INF) pot[i] += dist[i];
        }
        return true;
    }
    pair<long long, long long> minCostMaxFlow(int s, int t) {
        const long long INF = (long long)4e18;
        initPotentials();
        long long totalFlow = 0, totalCost = 0;
        while (dijkstra(s, t)) {
            long long push = INF;
            for (int v = t; v != s; ) {
                int id = prevEdge[v];
                push = min(push, edges[id].cap - edges[id].flow);
                v = edges[id ^ 1].to;
            }
            long long pathCost = 0;
            for (int v = t; v != s; ) {
                int id = prevEdge[v];
                pathCost += edges[id].cost;
                edges[id].flow += push;
                edges[id ^ 1].flow -= push;
                v = edges[id ^ 1].to;
            }
            totalFlow += push;
            totalCost += push * pathCost;
        }
        return {totalFlow, totalCost};
    }
};`,
      explanation: [
        "Dijkstra assumes that once a node is popped with the smallest tentative distance, no cheaper route to it can appear later. A negative edge breaks that assumption directly: a longer-looking prefix can dip below the settled value, so Dijkstra can finalise a wrong distance and the augmentation would follow a path that is not cheapest, destroying the successive-shortest-paths invariant.",
        "Note that even an all-positive input network develops negative arcs the moment the first unit of flow is pushed, because every residual reverse arc carries the negated cost. So negative weights are not an exotic case in min-cost flow; they are the normal state after one augmentation.",
        "Johnson potentials repair this. Choose pot so that every residual edge satisfies pot[u] + cost(u,v) - pot[v] >= 0, then run Dijkstra on those reduced costs. Reduced costs telescope along any path, so the cheapest path is unchanged, while all weights fed to Dijkstra are non-negative. When the original costs are non-negative, pot = 0 already works. When they are not, one Bellman-Ford relaxation pass over the initial network produces a valid pot; this is where the no-negative-cycle precondition is used, since otherwise no such potential function exists.",
        "After each Dijkstra, pot[i] += dist[i] restores the invariant for the new residual network, which is why the initialisation only has to happen once.",
        "Time: O(n * E) once, then O(flow_augmentations * E log n). Space: O(n + E).",
      ],
    },
    {
      name: "Hungarian Algorithm on a Cost Matrix",
      difficulty: "Hard",
      variation: "Hungarian algorithm",
      question: [
        "You are given an n x m cost matrix a with n <= m, where a[i][j] is the price of assigning row i to column j. Assign every row to a distinct column so that the total price is minimum. Return the minimum total price. Use an O(n^2 * m) algorithm so that n = m = 1000 is feasible.",
        "Example 1:\nInput: a = [[4,1,3],[2,0,5],[3,2,2]]\nOutput: 5\nExplanation: Row 0 to column 1 (1), row 1 to column 0 (2), row 2 to column 2 (2).",
        "Example 2:\nInput: a = [[7,3],[5,9]]\nOutput: 8\nExplanation: Row 0 to column 1 and row 1 to column 0 gives 3 + 5 = 8.",
        "Constraints:\n- 1 <= n <= m <= 1000\n- -10^9 <= a[i][j] <= 10^9\n- Every row must receive a distinct column",
      ],
      code: `long long hungarian(vector<vector<long long>>& a) {
    int n = a.size(), m = a[0].size();
    const long long INF = (long long)4e18;
    vector<long long> u(n + 1, 0), v(m + 1, 0);
    vector<int> p(m + 1, 0), way(m + 1, 0);
    for (int i = 1; i <= n; i++) {
        p[0] = i;
        int j0 = 0;
        vector<long long> minv(m + 1, INF);
        vector<char> usedCol(m + 1, 0);
        do {
            usedCol[j0] = 1;
            int i0 = p[j0], j1 = -1;
            long long delta = INF;
            for (int j = 1; j <= m; j++) {
                if (usedCol[j]) continue;
                long long cur = a[i0 - 1][j - 1] - u[i0] - v[j];
                if (cur < minv[j]) {
                    minv[j] = cur;
                    way[j] = j0;
                }
                if (minv[j] < delta) {
                    delta = minv[j];
                    j1 = j;
                }
            }
            for (int j = 0; j <= m; j++) {
                if (usedCol[j]) {
                    u[p[j]] += delta;
                    v[j] -= delta;
                } else {
                    minv[j] -= delta;
                }
            }
            j0 = j1;
        } while (p[j0] != 0);
        do {
            int j1 = way[j0];
            p[j0] = p[j1];
            j0 = j1;
        } while (j0 != 0);
    }
    long long total = 0;
    for (int j = 1; j <= m; j++) {
        if (p[j] != 0) total += a[p[j] - 1][j - 1];
    }
    return total;
}`,
      explanation: [
        "The Hungarian algorithm, also called the Jonker-Volgenant or Kuhn-Munkres method, is successive shortest paths specialised to the assignment problem. Rows are added one at a time, and each row is attached by finding a cheapest augmenting alternating path from it to some free column.",
        "The arrays u and v are the dual variables, the same objects as Johnson potentials in a general min-cost flow. The reduced cost a[i][j] - u[i] - v[j] is kept non-negative for every pair, and zero exactly on edges the current assignment can use. Adding delta to the touched rows and subtracting it from the touched columns shifts the duals so that at least one new zero-reduced-cost edge appears without ever making a reduced cost negative.",
        "The minv array caches, for each unvisited column, the cheapest reduced cost of reaching it from the tree built so far. That is what turns each augmentation into O(n * m) work instead of a full Dijkstra with a heap, giving O(n^2 * m) overall and making n = m = 1000 comfortable.",
        "At the end p[j] holds the row assigned to column j, with p[j] = 0 meaning the column is unused, which happens for m - n columns. Optimality follows from complementary slackness: all reduced costs are non-negative and every assigned pair has reduced cost zero, so the dual objective matches the primal, certifying the minimum.",
        "Time: O(n^2 * m). Space: O(n + m).",
      ],
    },
    {
      name: "Minimum Cost Circulation with Lower Bounds",
      difficulty: "Hard",
      variation: "Lower bounds reduction",
      question: [
        "You are given a directed graph with n nodes and edges (u, v, low, high, cost) meaning the flow on that edge must be at least low and at most high, at a price of cost per unit. Find a circulation, that is an assignment of flows respecting all bounds with conservation at every node, of minimum total cost. Return the minimum cost, or -1 if no feasible circulation exists.",
        "Example 1:\nInput: n = 3, edges = [(0,1,1,2,1),(1,2,1,2,1),(2,0,1,2,1)]\nOutput: 3\nExplanation: One unit around the triangle satisfies every lower bound at a cost of 3.",
        "Example 2:\nInput: n = 2, edges = [(0,1,1,1,5)]\nOutput: -1\nExplanation: One unit must leave node 0 but nothing can return, so conservation is impossible.",
        "Constraints:\n- 1 <= n <= 500\n- 0 <= number of edges <= 5000\n- 0 <= low <= high <= 10^6\n- 0 <= cost <= 10^6",
      ],
      code: `struct MCMF {
    struct Edge {
        int to;
        long long cap, flow, cost;
    };
    int n;
    vector<Edge> edges;
    vector<vector<int>> g;
    MCMF(int n) : n(n), g(n) {}
    void addEdge(int u, int v, long long cap, long long cost) {
        g[u].push_back((int)edges.size());
        edges.push_back({v, cap, 0, cost});
        g[v].push_back((int)edges.size());
        edges.push_back({u, 0, 0, -cost});
    }
    pair<long long, long long> minCostMaxFlow(int s, int t) {
        const long long INF = (long long)4e18;
        long long totalFlow = 0, totalCost = 0;
        while (true) {
            vector<long long> dist(n, INF);
            vector<int> inQueue(n, 0), prevEdge(n, -1);
            deque<int> q;
            dist[s] = 0;
            q.push_back(s);
            inQueue[s] = 1;
            while (!q.empty()) {
                int u = q.front();
                q.pop_front();
                inQueue[u] = 0;
                for (int id : g[u]) {
                    if (edges[id].cap - edges[id].flow <= 0) continue;
                    int v = edges[id].to;
                    if (dist[u] + edges[id].cost < dist[v]) {
                        dist[v] = dist[u] + edges[id].cost;
                        prevEdge[v] = id;
                        if (!inQueue[v]) {
                            inQueue[v] = 1;
                            q.push_back(v);
                        }
                    }
                }
            }
            if (dist[t] >= INF) break;
            long long push = INF;
            for (int v = t; v != s; ) {
                int id = prevEdge[v];
                push = min(push, edges[id].cap - edges[id].flow);
                v = edges[id ^ 1].to;
            }
            for (int v = t; v != s; ) {
                int id = prevEdge[v];
                edges[id].flow += push;
                edges[id ^ 1].flow -= push;
                v = edges[id ^ 1].to;
            }
            totalFlow += push;
            totalCost += push * dist[t];
        }
        return {totalFlow, totalCost};
    }
};

long long minCostCirculation(int n, vector<array<long long, 5>>& edges) {
    int s = n, t = n + 1;
    MCMF mcmf(n + 2);
    vector<long long> excess(n, 0);
    long long baseCost = 0, needed = 0;
    for (auto& e : edges) {
        int u = (int)e[0], v = (int)e[1];
        long long low = e[2], high = e[3], cost = e[4];
        mcmf.addEdge(u, v, high - low, cost);
        baseCost += low * cost;
        excess[v] += low;
        excess[u] -= low;
    }
    for (int i = 0; i < n; i++) {
        if (excess[i] > 0) {
            mcmf.addEdge(s, i, excess[i], 0);
            needed += excess[i];
        } else if (excess[i] < 0) {
            mcmf.addEdge(i, t, -excess[i], 0);
        }
    }
    auto res = mcmf.minCostMaxFlow(s, t);
    if (res.first < needed) return -1;
    return baseCost + res.second;
}`,
      explanation: [
        "Lower bounds are removed by forcing them. Assume every edge already carries its lower bound low, pay low * cost up front, and leave only the free portion high - low as a real capacity. The forced part breaks conservation, since node v gains low extra incoming units and node u loses low outgoing units, so track those imbalances in an excess array.",
        "Repairing conservation is the standard feasible-flow construction: a super source feeds every node with positive excess and a super sink drains every node with negative excess, both at zero cost. A feasible circulation exists exactly when the maximum flow from the super source to the super sink saturates all of those auxiliary edges.",
        "Because the auxiliary edges cost nothing, the min-cost max-flow in the transformed network is the cheapest way to fix the imbalances, and adding baseCost recovers the true cost of the circulation. The result is the minimum-cost feasible circulation.",
        "The transformed network can contain negative residual costs immediately, so a label-correcting shortest path is used. If the goal were a minimum-cost s-to-t flow with lower bounds instead of a circulation, add an unbounded zero-cost edge from t back to s before applying this reduction.",
        "Time: O(flow_augmentations * n * E). Space: O(n + E).",
      ],
    },
    {
      name: "Edge-Disjoint Routes with Minimum Total Cost and Route Recovery",
      difficulty: "Hard",
      variation: "Flow decomposition into routes",
      question: [
        "You are given a directed graph with n nodes numbered 1 to n and m weighted edges (u, v, w), each usable by at most one route. Send as many routes as possible from node 1 to node n such that no two routes share an edge, and among all such maximum collections choose the one with the smallest total weight. Print the number of routes, the total weight, and then each route as its sequence of nodes from 1 to n.",
        "Example 1:\nInput: n = 4, m = 4, edges = [(1,2,1),(1,3,5),(2,4,1),(3,4,1)]\nOutput:\n2 8\n1 2 4\n1 3 4\nExplanation: Two edge-disjoint routes exist, of weight 2 and 6.",
        "Example 2:\nInput: n = 2, m = 1, edges = [(1,2,4)]\nOutput:\n1 4\n1 2",
        "Constraints:\n- 2 <= n <= 500\n- 1 <= m <= 1000\n- 1 <= w <= 10^6\n- Routes may share nodes; only edges must be distinct",
      ],
      code: `struct MCMF {
    struct Edge {
        int to;
        long long cap, flow, cost;
    };
    int n;
    vector<Edge> edges;
    vector<vector<int>> g;
    MCMF(int n) : n(n), g(n) {}
    void addEdge(int u, int v, long long cap, long long cost) {
        g[u].push_back((int)edges.size());
        edges.push_back({v, cap, 0, cost});
        g[v].push_back((int)edges.size());
        edges.push_back({u, 0, 0, -cost});
    }
    pair<long long, long long> minCostMaxFlow(int s, int t) {
        const long long INF = (long long)4e18;
        long long totalFlow = 0, totalCost = 0;
        while (true) {
            vector<long long> dist(n, INF);
            vector<int> inQueue(n, 0), prevEdge(n, -1);
            deque<int> q;
            dist[s] = 0;
            q.push_back(s);
            inQueue[s] = 1;
            while (!q.empty()) {
                int u = q.front();
                q.pop_front();
                inQueue[u] = 0;
                for (int id : g[u]) {
                    if (edges[id].cap - edges[id].flow <= 0) continue;
                    int v = edges[id].to;
                    if (dist[u] + edges[id].cost < dist[v]) {
                        dist[v] = dist[u] + edges[id].cost;
                        prevEdge[v] = id;
                        if (!inQueue[v]) {
                            inQueue[v] = 1;
                            q.push_back(v);
                        }
                    }
                }
            }
            if (dist[t] >= INF) break;
            long long push = INF;
            for (int v = t; v != s; ) {
                int id = prevEdge[v];
                push = min(push, edges[id].cap - edges[id].flow);
                v = edges[id ^ 1].to;
            }
            for (int v = t; v != s; ) {
                int id = prevEdge[v];
                edges[id].flow += push;
                edges[id ^ 1].flow -= push;
                v = edges[id ^ 1].to;
            }
            totalFlow += push;
            totalCost += push * dist[t];
        }
        return {totalFlow, totalCost};
    }
    vector<vector<int>> extractRoutes(int s, int t) {
        vector<vector<int>> routes;
        while (true) {
            vector<int> path;
            int u = s;
            path.push_back(u);
            bool advanced = true;
            while (u != t && advanced) {
                advanced = false;
                for (int id : g[u]) {
                    if (id % 2 == 1) continue;
                    if (edges[id].flow <= 0) continue;
                    edges[id].flow -= 1;
                    u = edges[id].to;
                    path.push_back(u);
                    advanced = true;
                    break;
                }
            }
            if (u != t) break;
            routes.push_back(path);
        }
        return routes;
    }
};

int main() {
    int n, m;
    scanf("%d %d", &n, &m);
    MCMF mcmf(n);
    for (int i = 0; i < m; i++) {
        int u, v;
        long long w;
        scanf("%d %d %lld", &u, &v, &w);
        mcmf.addEdge(u - 1, v - 1, 1, w);
    }
    auto res = mcmf.minCostMaxFlow(0, n - 1);
    printf("%lld %lld\\n", res.first, res.second);
    auto routes = mcmf.extractRoutes(0, n - 1);
    for (auto& path : routes) {
        for (size_t i = 0; i < path.size(); i++) {
            printf("%d%c", path[i] + 1, i + 1 == path.size() ? '\\n' : ' ');
        }
    }
    return 0;
}`,
      explanation: [
        "Each graph edge gets capacity 1 and cost equal to its weight, so an integral maximum flow from 1 to n is a maximum collection of edge-disjoint routes, and min-cost max-flow makes that collection as light as possible.",
        "Recovering the actual routes is a flow decomposition. Walk from the source following any forward edge that still carries flow, decrementing it as you go, until the sink is reached; that traversal is one route. Repeating the walk peels off one route per iteration until no flow-carrying edge leaves the source.",
        "The walk is guaranteed to reach the sink and not stall, because flow conservation means every intermediate node the walk enters still has an outgoing unit available. Only forward edges are considered, identified by an even index, since reverse arcs hold negative flow and are bookkeeping rather than real routing.",
        "One caveat: if the optimal flow happens to contain a cycle of flow, the greedy walk could wander into it. On a min-cost flow this cannot happen with positive weights, because a flow cycle would carry positive cost and removing it would reduce the total, contradicting optimality.",
        "Time: O(flow * n * E) for the flow plus O(flow * n) for the decomposition. Space: O(n + E).",
      ],
    },
  ],
};
