import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Transitive Closure of a Graph",
      difficulty: "Medium",
      variation: "Reachability closure",
      link: "https://www.geeksforgeeks.org/transitive-closure-of-a-graph/",
      question: [
        "Given a directed graph as an n x n adjacency matrix graph where graph[i][j] = 1 means there is a direct edge from i to j, return the transitive closure: an n x n matrix reach where reach[i][j] = 1 if j is reachable from i through any number of edges (a vertex always reaches itself).",
        "Example 1:\nInput: graph = [[1,1,0,1],[0,1,1,0],[0,0,1,1],[0,0,0,1]]\nOutput: [[1,1,1,1],[0,1,1,1],[0,0,1,1],[0,0,0,1]]",
        "Constraints:\n- 1 <= n <= 100\n- graph[i][j] is 0 or 1",
      ],
      code: `vector<vector<int>> transitiveClosure(vector<vector<int>>& graph) {
    int n = graph.size();
    vector<vector<int>> reach = graph;
    for (int i = 0; i < n; i++) reach[i][i] = 1;
    for (int k = 0; k < n; k++)
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                if (reach[i][k] && reach[k][j]) reach[i][j] = 1;
    return reach;
}`,
      explanation: [
        "This is Floyd-Warshall with boolean OR replacing addition and min. After the k-th outer iteration, reach[i][j] is true exactly when a path from i to j exists using only vertices 0..k as intermediates.",
        "The k loop MUST be the outermost loop. If k is placed inside, the algorithm is reading half-updated rows and silently misses longer paths — this is the single most common Floyd-Warshall bug.",
        "Time: O(n^3). Space: O(n^2).",
      ],
    },
    {
      name: "All-Pairs Shortest Paths (Floyd-Warshall)",
      difficulty: "Medium",
      variation: "Core APSP",
      link: "https://www.geeksforgeeks.org/floyd-warshall-algorithm-dp-16/",
      question: [
        "Given a weighted directed graph as an n x n matrix dist where dist[i][j] is the edge weight from i to j and a large sentinel value INF marks the absence of an edge, modify the matrix in place so that dist[i][j] becomes the shortest path distance from i to j. Edge weights may be negative but the graph contains no negative cycle.",
        "Example 1:\nInput: dist = [[0,5,INF,10],[INF,0,3,INF],[INF,INF,0,1],[INF,INF,INF,0]]\nOutput: [[0,5,8,9],[INF,0,3,4],[INF,INF,0,1],[INF,INF,INF,0]]",
        "Constraints:\n- 1 <= n <= 500\n- No negative cycles are present",
      ],
      code: `void floydWarshall(vector<vector<int>>& dist) {
    int n = dist.size();
    const int INF = 1e9;
    for (int k = 0; k < n; k++)
        for (int i = 0; i < n; i++) {
            if (dist[i][k] >= INF) continue;
            for (int j = 0; j < n; j++) {
                if (dist[k][j] >= INF) continue;
                dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]);
            }
        }
}`,
      explanation: [
        "The invariant is that after processing intermediate vertex k, dist[i][j] holds the shortest i-to-j path whose interior vertices all come from the set {0..k}. Adding vertex k either helps (route through k) or it does not, which is exactly the min being taken.",
        "The two INF guards matter with negative weights: without them, INF + (a negative number) becomes smaller than INF and forges a path across a non-existent edge.",
        "Time: O(n^3). Space: O(1) extra, operating in place.",
      ],
    },
    {
      name: "Find the City With the Smallest Number of Neighbors at a Threshold Distance",
      difficulty: "Medium",
      variation: "APSP then count",
      link: "https://leetcode.com/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance/",
      question: [
        "There are n cities numbered 0..n-1 and an array edges where edges[i] = [from, to, weight] describes a bidirectional weighted edge. Return the city with the smallest number of other cities reachable within distanceThreshold. If there is more than one such city, return the city with the greatest number.",
        "Example 1:\nInput: n = 4, edges = [[0,1,3],[1,2,1],[1,3,4],[2,3,1]], distanceThreshold = 4\nOutput: 3\nExplanation: City 0 reaches {1,2}, city 1 reaches {0,2,3}, city 2 reaches {1,3}, city 3 reaches {1,2}. Cities 0, 2 and 3 all reach 2 others, so the greatest label wins.",
        "Constraints:\n- 2 <= n <= 100\n- 1 <= weight <= 10^4",
      ],
      code: `int findTheCity(int n, vector<vector<int>>& edges, int distanceThreshold) {
    const int INF = 1e9;
    vector<vector<int>> dist(n, vector<int>(n, INF));
    for (int i = 0; i < n; i++) dist[i][i] = 0;
    for (auto& e : edges) {
        dist[e[0]][e[1]] = min(dist[e[0]][e[1]], e[2]);
        dist[e[1]][e[0]] = min(dist[e[1]][e[0]], e[2]);
    }
    for (int k = 0; k < n; k++)
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                if (dist[i][k] + dist[k][j] < dist[i][j])
                    dist[i][j] = dist[i][k] + dist[k][j];
    int best = -1, bestCount = INF;
    for (int i = 0; i < n; i++) {
        int cnt = 0;
        for (int j = 0; j < n; j++)
            if (i != j && dist[i][j] <= distanceThreshold) cnt++;
        if (cnt <= bestCount) { bestCount = cnt; best = i; }
    }
    return best;
}`,
      explanation: [
        "With n <= 100, one O(n^3) Floyd-Warshall pass is cheaper and simpler than running Dijkstra from every source, and it gives the whole distance matrix at once.",
        "Taking min when inserting edges handles duplicate edges between the same pair. Using <= in the final comparison naturally keeps the largest label among ties, which is what the problem asks for.",
        "Time: O(n^3). Space: O(n^2).",
      ],
    },
    {
      name: "Course Schedule IV",
      difficulty: "Medium",
      variation: "Boolean reachability queries",
      link: "https://leetcode.com/problems/course-schedule-iv/",
      question: [
        "There are numCourses courses labelled 0..numCourses-1 and prerequisites[i] = [a, b] meaning a must be taken before b. Prerequisites are transitive. For each query queries[j] = [u, v], return whether u is a prerequisite of v.",
        "Example 1:\nInput: numCourses = 3, prerequisites = [[1,2],[1,0],[2,0]], queries = [[1,0],[1,2]]\nOutput: [true,true]",
        "Constraints:\n- 2 <= numCourses <= 100\n- The prerequisite graph is a DAG with no duplicate edges",
      ],
      code: `vector<bool> checkIfPrerequisite(int numCourses, vector<vector<int>>& prerequisites,
                                 vector<vector<int>>& queries) {
    int n = numCourses;
    vector<vector<char>> reach(n, vector<char>(n, 0));
    for (auto& p : prerequisites) reach[p[0]][p[1]] = 1;
    for (int k = 0; k < n; k++)
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                if (reach[i][k] && reach[k][j]) reach[i][j] = 1;
    vector<bool> ans;
    for (auto& q : queries) ans.push_back(reach[q[0]][q[1]] == 1);
    return ans;
}`,
      explanation: [
        "Transitivity of prerequisites is exactly reachability, so precomputing the closure once answers every query in O(1) rather than running a fresh traversal per query.",
        "With numCourses <= 100 the n^3 closure is about a million operations, far cheaper than up to 10^4 separate searches.",
        "Time: O(n^3 + q). Space: O(n^2).",
      ],
    },
    {
      name: "Graph Diameter",
      difficulty: "Medium",
      variation: "Eccentricity and diameter",
      question: [
        "Given a connected weighted undirected graph with n vertices given as an n x n distance matrix (INF where no direct edge exists), return the diameter of the graph: the largest shortest-path distance between any pair of vertices.",
        "Example 1:\nInput: n = 4, matrix = [[0,1,INF,INF],[1,0,2,INF],[INF,2,0,3],[INF,INF,3,0]]\nOutput: 6\nExplanation: The farthest pair is 0 and 3, at distance 1 + 2 + 3 = 6.",
        "Constraints:\n- 2 <= n <= 400\n- The graph is connected and all weights are positive",
      ],
      code: `int graphDiameter(vector<vector<int>> dist) {
    int n = dist.size();
    const int INF = 1e9;
    for (int k = 0; k < n; k++)
        for (int i = 0; i < n; i++) {
            if (dist[i][k] >= INF) continue;
            for (int j = 0; j < n; j++) {
                if (dist[k][j] >= INF) continue;
                dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]);
            }
        }
    int diameter = 0;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            if (dist[i][j] < INF) diameter = max(diameter, dist[i][j]);
    return diameter;
}`,
      explanation: [
        "The diameter is defined over shortest-path distances, not raw edges, so the distance matrix must be completed first. After Floyd-Warshall the answer is simply the maximum finite entry.",
        "Note this is the general-graph method. On a tree the diameter can be found with two BFS passes in O(n), which is far better — reach for Floyd-Warshall only when the graph has cycles and n is small.",
        "Time: O(n^3). Space: O(n^2).",
      ],
    },
    {
      name: "Count Pairs Reachable Within Distance K",
      difficulty: "Medium",
      variation: "Counting over the matrix",
      question: [
        "Given a weighted directed graph with n vertices as an n x n matrix (INF for absent edges) and an integer k, return the number of ordered pairs (i, j) with i != j such that the shortest path from i to j has total weight at most k.",
        "Example 1:\nInput: n = 3, matrix = [[0,2,INF],[INF,0,2],[INF,INF,0]], k = 4\nOutput: 3\nExplanation: Pairs (0,1) at 2, (1,2) at 2, and (0,2) at 4.",
        "Constraints:\n- 2 <= n <= 400\n- 0 <= k <= 10^9\n- All edge weights are positive",
      ],
      code: `long long countPairsWithinK(vector<vector<long long>> dist, long long k) {
    int n = dist.size();
    const long long INF = 1e18;
    for (int x = 0; x < n; x++)
        for (int i = 0; i < n; i++) {
            if (dist[i][x] >= INF) continue;
            for (int j = 0; j < n; j++) {
                if (dist[x][j] >= INF) continue;
                dist[i][j] = min(dist[i][j], dist[i][x] + dist[x][j]);
            }
        }
    long long count = 0;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            if (i != j && dist[i][j] <= k) count++;
    return count;
}`,
      explanation: [
        "Once every pairwise shortest distance is known, the count is a single scan of the matrix. The work is entirely in completing the matrix.",
        "Using long long throughout prevents the additive overflow that a 32-bit INF sentinel invites when two large-but-finite distances are summed.",
        "Time: O(n^3). Space: O(n^2).",
      ],
    },
    {
      name: "Shortest Path With Next-Hop Reconstruction",
      difficulty: "Medium",
      variation: "Path reconstruction",
      question: [
        "Given a weighted directed graph as an n x n matrix, answer queries of the form (u, v) by returning the actual sequence of vertices on a shortest path from u to v, or an empty list if v is unreachable from u. Preprocessing may be O(n^3) but each query should be linear in the path length.",
        "Example 1:\nInput: n = 4, matrix = [[0,5,INF,10],[INF,0,3,INF],[INF,INF,0,1],[INF,INF,INF,0]], query = (0,3)\nOutput: [0,1,2,3]\nExplanation: 5 + 3 + 1 = 9 beats the direct edge of weight 10.",
        "Constraints:\n- 1 <= n <= 300\n- No negative cycles",
      ],
      code: `struct APSP {
    int n;
    vector<vector<long long>> dist;
    vector<vector<int>> nxt;
    static const long long INF = 1e18;

    APSP(vector<vector<long long>> matrix) : n(matrix.size()), dist(matrix),
                                             nxt(n, vector<int>(n, -1)) {
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                if (dist[i][j] < INF) nxt[i][j] = j;
        for (int k = 0; k < n; k++)
            for (int i = 0; i < n; i++) {
                if (dist[i][k] >= INF) continue;
                for (int j = 0; j < n; j++) {
                    if (dist[k][j] >= INF) continue;
                    if (dist[i][k] + dist[k][j] < dist[i][j]) {
                        dist[i][j] = dist[i][k] + dist[k][j];
                        nxt[i][j] = nxt[i][k];
                    }
                }
            }
    }

    vector<int> path(int u, int v) {
        if (nxt[u][v] == -1) return {};
        vector<int> out{u};
        while (u != v) {
            u = nxt[u][v];
            out.push_back(u);
        }
        return out;
    }
};`,
      explanation: [
        "Alongside the distance matrix, nxt[i][j] records the first hop on a shortest i-to-j path. When routing through k improves the distance, the first hop toward j becomes the first hop toward k.",
        "Walking the nxt table reconstructs the path one edge at a time, so a query costs only the number of vertices it outputs. This is exactly how a routing table works.",
        "Time: O(n^3) preprocessing, O(path length) per query. Space: O(n^2).",
      ],
    },
    {
      name: "Bottleneck Shortest Path (Minimax Path)",
      difficulty: "Medium",
      variation: "Min-max semiring variant",
      question: [
        "Given a weighted undirected graph as an n x n matrix, for every pair of vertices find the minimum possible value of the largest edge weight along a path between them. Return the resulting n x n matrix. This is the classic bottleneck or minimax path problem — a road network where you want to minimise the worst bridge you must cross.",
        "Example 1:\nInput: n = 3, matrix = [[0,9,4],[9,0,3],[4,3,0]]\nOutput: [[0,4,4],[4,0,3],[4,3,0]]\nExplanation: Going 0 -> 2 -> 1 has a worst edge of 4, better than the direct edge of 9.",
        "Constraints:\n- 2 <= n <= 400\n- Weights are positive; INF marks absent edges",
      ],
      code: `vector<vector<long long>> bottleneckPaths(vector<vector<long long>> w) {
    int n = w.size();
    const long long INF = 1e18;
    for (int k = 0; k < n; k++)
        for (int i = 0; i < n; i++) {
            if (w[i][k] >= INF) continue;
            for (int j = 0; j < n; j++) {
                if (w[k][j] >= INF) continue;
                long long through = max(w[i][k], w[k][j]);
                if (through < w[i][j]) w[i][j] = through;
            }
        }
    return w;
}`,
      explanation: [
        "Floyd-Warshall is really an algebraic template: replace (+, min) with (max, min) and the same triple loop computes minimax paths instead of shortest paths. The cost of a path becomes its largest edge, and we minimise that.",
        "The same invariant holds — after iteration k, w[i][j] is the best bottleneck using only vertices up to k as intermediates — which is why swapping the operators is legitimate.",
        "Time: O(n^3). Space: O(n^2).",
      ],
    },
    {
      name: "Detect a Negative Cycle Using Floyd-Warshall",
      difficulty: "Medium",
      variation: "Negative cycle via the diagonal",
      question: [
        "Given a weighted directed graph as an n x n matrix that may contain negative edge weights, determine whether the graph contains a negative-weight cycle.",
        "Example 1:\nInput: n = 3, matrix = [[0,1,INF],[INF,0,-3],[1,INF,0]]\nOutput: true\nExplanation: The cycle 0 -> 1 -> 2 -> 0 has total weight 1 + (-3) + 1 = -1, so dist[0][0] ends up negative.",
        "Example 2:\nInput: n = 3, matrix = [[0,1,INF],[INF,0,-3],[3,INF,0]]\nOutput: false\nExplanation: The same cycle now sums to 1 + (-3) + 3 = 1, which is positive, so no negative cycle exists.",
        "Constraints:\n- 1 <= n <= 400\n- Weights may be negative",
      ],
      code: `bool hasNegativeCycle(vector<vector<long long>> dist) {
    int n = dist.size();
    const long long INF = 1e18;
    for (int k = 0; k < n; k++)
        for (int i = 0; i < n; i++) {
            if (dist[i][k] >= INF) continue;
            for (int j = 0; j < n; j++) {
                if (dist[k][j] >= INF) continue;
                if (dist[i][k] + dist[k][j] < dist[i][j])
                    dist[i][j] = dist[i][k] + dist[k][j];
            }
        }
    for (int i = 0; i < n; i++)
        if (dist[i][i] < 0) return true;
    return false;
}`,
      explanation: [
        "dist[i][i] starts at 0. If the completed matrix shows a negative value there, some closed walk from i back to itself has negative total weight, which is precisely a negative cycle.",
        "Caveat: with a negative cycle present the other distance entries are meaningless (they can be driven arbitrarily low), so run this check before trusting any distance. Bellman-Ford is the better tool when you only care about one source.",
        "Time: O(n^3). Space: O(n^2).",
      ],
    },
    {
      name: "Minimum Cost to Reach Every Node From Every Node",
      difficulty: "Medium",
      variation: "Feasibility over the full matrix",
      question: [
        "Given a weighted directed graph with n vertices as an n x n matrix, return the total cost of all pairwise shortest paths if every vertex can reach every other vertex, or -1 if any ordered pair is mutually unreachable.",
        "Example 1:\nInput: n = 2, matrix = [[0,3],[4,0]]\nOutput: 7\nExplanation: dist(0,1) = 3 and dist(1,0) = 4.",
        "Constraints:\n- 1 <= n <= 400\n- All weights are positive",
      ],
      code: `long long totalPairwiseCost(vector<vector<long long>> dist) {
    int n = dist.size();
    const long long INF = 1e18;
    for (int k = 0; k < n; k++)
        for (int i = 0; i < n; i++) {
            if (dist[i][k] >= INF) continue;
            for (int j = 0; j < n; j++) {
                if (dist[k][j] >= INF) continue;
                dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]);
            }
        }
    long long total = 0;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) {
            if (i == j) continue;
            if (dist[i][j] >= INF) return -1;
            total += dist[i][j];
        }
    return total;
}`,
      explanation: [
        "Completing the matrix answers both questions at once: any remaining INF entry proves the graph is not strongly connected, and otherwise the sum is a direct scan.",
        "Accumulating into a long long is necessary — up to 160000 pairs each with a large distance overflows 32 bits easily.",
        "Time: O(n^3). Space: O(n^2).",
      ],
    },
    {
      name: "Check Whether a Directed Graph Is Strongly Connected",
      difficulty: "Medium",
      variation: "Closure-based connectivity test",
      question: [
        "Given a directed graph as an n x n adjacency matrix, determine whether it is strongly connected — every vertex can reach every other vertex.",
        "Example 1:\nInput: graph = [[0,1,0],[0,0,1],[1,0,0]]\nOutput: true\nExplanation: The single cycle 0 -> 1 -> 2 -> 0 makes every vertex reachable from every other.",
        "Constraints:\n- 1 <= n <= 300\n- graph[i][j] is 0 or 1",
      ],
      code: `bool isStronglyConnected(vector<vector<int>>& graph) {
    int n = graph.size();
    vector<vector<char>> reach(n, vector<char>(n, 0));
    for (int i = 0; i < n; i++) {
        reach[i][i] = 1;
        for (int j = 0; j < n; j++) if (graph[i][j]) reach[i][j] = 1;
    }
    for (int k = 0; k < n; k++)
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                if (reach[i][k] && reach[k][j]) reach[i][j] = 1;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            if (!reach[i][j]) return false;
    return true;
}`,
      explanation: [
        "Strong connectivity means the transitive closure is the all-ones matrix, so building the closure and scanning it settles the question directly.",
        "This is the simple-to-write answer, not the fast one: Kosaraju's two DFS passes decide the same property in O(V + E). Prefer the closure only when n is small and you already want the full reachability matrix.",
        "Time: O(n^3). Space: O(n^2).",
      ],
    },
    {
      name: "Maximum Probability Path Between All Pairs",
      difficulty: "Medium",
      variation: "Max-product semiring variant",
      question: [
        "Given n nodes and an n x n matrix prob where prob[i][j] in [0, 1] is the success probability of the direct link from i to j (0 meaning no link), compute for every pair the maximum probability of successfully traversing a path from i to j. A path's probability is the product of its edge probabilities.",
        "Example 1:\nInput: n = 3, prob = [[1,0.5,0.2],[0.5,1,0.5],[0.2,0.5,1]]\nOutput: prob[0][2] becomes 0.25\nExplanation: Going 0 -> 1 -> 2 gives 0.5 * 0.5 = 0.25, better than the direct 0.2.",
        "Constraints:\n- 1 <= n <= 300\n- 0 <= prob[i][j] <= 1",
      ],
      code: `vector<vector<double>> maxProbabilityAllPairs(vector<vector<double>> p) {
    int n = p.size();
    for (int i = 0; i < n; i++) p[i][i] = max(p[i][i], 1.0);
    for (int k = 0; k < n; k++)
        for (int i = 0; i < n; i++) {
            if (p[i][k] == 0.0) continue;
            for (int j = 0; j < n; j++) {
                double through = p[i][k] * p[k][j];
                if (through > p[i][j]) p[i][j] = through;
            }
        }
    return p;
}`,
      explanation: [
        "Swapping (+, min) for (*, max) turns the same triple loop into a maximum-reliability computation. Because probabilities are at most 1, multiplying along a path only shrinks it, which keeps the relaxation well behaved.",
        "The skip when p[i][k] is zero avoids pointless work on missing links. For a single source, LeetCode 1514 is the Dijkstra-flavoured version of this same idea.",
        "Time: O(n^3). Space: O(n^2).",
      ],
    },
    {
      name: "Count Restricted Paths Under a Distance Budget",
      difficulty: "Hard",
      variation: "APSP plus DP",
      question: [
        "Given a weighted undirected graph with n vertices as an n x n matrix and a budget B, count the number of ordered vertex pairs (i, j), i != j, whose shortest distance is at most B, and additionally report the pair achieving the largest such distance. Return the count and that maximum distance.",
        "Example 1:\nInput: n = 3, matrix = [[0,1,5],[1,0,1],[5,1,0]], B = 3\nOutput: count = 6, maxWithinBudget = 2\nExplanation: All six ordered pairs are within 3; the largest qualifying distance is dist(0,2) = 2 via vertex 1.",
        "Constraints:\n- 2 <= n <= 400\n- Weights are positive",
      ],
      code: `pair<long long, long long> countAndMaxWithinBudget(vector<vector<long long>> dist, long long B) {
    int n = dist.size();
    const long long INF = 1e18;
    for (int k = 0; k < n; k++)
        for (int i = 0; i < n; i++) {
            if (dist[i][k] >= INF) continue;
            for (int j = 0; j < n; j++) {
                if (dist[k][j] >= INF) continue;
                dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]);
            }
        }
    long long count = 0, best = 0;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) {
            if (i == j) continue;
            if (dist[i][j] <= B) {
                count++;
                best = max(best, dist[i][j]);
            }
        }
    return {count, best};
}`,
      explanation: [
        "The pattern here is the reason Floyd-Warshall stays useful despite its cubic cost: once the full matrix exists, a whole family of aggregate questions becomes a linear scan with no further graph work.",
        "Note that a shortest path can beat a direct edge, so filtering must happen after the matrix is completed, never on the raw input.",
        "Time: O(n^3). Space: O(n^2).",
      ],
    },
    {
      name: "Second Shortest Distance Between All Pairs",
      difficulty: "Hard",
      variation: "Tracking two best values",
      question: [
        "Given a weighted directed graph with n vertices, compute for every ordered pair the length of the strictly second-shortest walk from i to j (a walk may repeat vertices; the second value must be strictly greater than the shortest). Report INF where no second distinct length exists.",
        "Example 1:\nInput: n = 3, edges: 0->1 (1), 1->2 (1), 0->2 (5)\nOutput: second[0][2] = 5\nExplanation: The shortest 0-to-2 walk costs 2 via vertex 1; the next distinct length is the direct edge at 5.",
        "Constraints:\n- 2 <= n <= 150\n- All weights are positive",
      ],
      code: `struct TwoBest {
    long long best, second;
};

vector<vector<TwoBest>> secondShortestAllPairs(vector<vector<long long>>& w) {
    int n = w.size();
    const long long INF = 1e18;
    vector<vector<TwoBest>> d(n, vector<TwoBest>(n, {INF, INF}));
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            d[i][j].best = w[i][j];
    auto offer = [](TwoBest& slot, long long value) {
        if (value >= INF) return;
        if (value < slot.best) {
            slot.second = slot.best;
            slot.best = value;
        } else if (value > slot.best && value < slot.second) {
            slot.second = value;
        }
    };
    for (int k = 0; k < n; k++)
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++) {
                long long a = d[i][k].best, b = d[k][j].best;
                long long a2 = d[i][k].second, b2 = d[k][j].second;
                if (a < INF && b < INF) offer(d[i][j], a + b);
                if (a < INF && b2 < INF) offer(d[i][j], a + b2);
                if (a2 < INF && b < INF) offer(d[i][j], a2 + b);
            }
    return d;
}`,
      explanation: [
        "Each cell keeps the two smallest distinct walk lengths. A candidate second-best route through k is built from either (best, second) or (second, best) of the two halves — combining two seconds can never beat those, so three combinations suffice.",
        "The offer helper enforces strictness: an equal value is discarded rather than becoming the second-best, which is what keeps the two stored lengths distinct.",
        "Time: O(n^3) with a constant factor of about 3. Space: O(n^2).",
      ],
    },
  ],
};
