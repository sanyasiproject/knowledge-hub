import type { TopicContent } from "../types";

export const graphTheory: TopicContent = {
  quickSummary: [
    "A graph G = (V, E) is a set of vertices (nodes) connected by edges; edges can be directed or undirected, weighted or unweighted.",
    "Two canonical representations are adjacency matrices (O(V^2) space, O(1) edge lookup) and adjacency lists (O(V + E) space, better for sparse graphs).",
    "BFS explores level-by-level (shortest path in unweighted graphs); DFS explores depth-first (useful for cycle detection, topological sort, and connected components).",
    "Classic algorithms include Dijkstra and Bellman-Ford for shortest paths, Prim and Kruskal for minimum spanning trees, and Kahn's / DFS-based algorithms for topological sorting.",
  ],
  detailed: [
    "A graph is a pair G = (V, E) where V is a finite set of vertices and E is a set of edges connecting pairs of vertices. In an undirected graph each edge {u, v} is an unordered pair; in a directed graph (digraph) each edge (u, v) is an ordered pair from u to v. Weighted graphs assign a numerical cost or distance to each edge.",
    "An adjacency matrix is a V x V matrix where entry M[i][j] is 1 (or the edge weight) if an edge exists from vertex i to vertex j, and 0 otherwise. It uses O(V^2) space and allows O(1) edge existence queries but wastes memory on sparse graphs. An adjacency list stores, for each vertex, a list of its neighbors (and optionally weights), using O(V + E) space and enabling efficient iteration over neighbors.",
    "Breadth-First Search (BFS) uses a queue to visit vertices layer by layer from a source, guaranteeing shortest paths in unweighted graphs with O(V + E) time. Depth-First Search (DFS) uses a stack (or recursion) to plunge as deep as possible before backtracking. DFS naturally discovers back edges (cycle detection), tree edges, forward edges, and cross edges, and its finish-time ordering yields topological sorts of DAGs.",
    "Shortest-path algorithms vary by constraints. Dijkstra's algorithm (O((V + E) log V) with a binary heap) works for non-negative weights. Bellman-Ford (O(V * E)) handles negative weights and detects negative cycles. Floyd-Warshall (O(V^3)) computes all-pairs shortest paths using dynamic programming over intermediate vertices.",
    "A Minimum Spanning Tree (MST) of a connected, undirected, weighted graph is a subset of edges connecting all vertices with minimum total weight. Kruskal's algorithm sorts edges by weight and greedily adds them if they do not form a cycle (using Union-Find), running in O(E log E). Prim's algorithm grows the MST from a single vertex using a priority queue, running in O((V + E) log V) with a binary heap.",
  ],
  deepDive: [
    "Topological sorting is only defined for Directed Acyclic Graphs (DAGs). Kahn's algorithm maintains an in-degree count for every vertex, initializes a queue with all zero in-degree vertices, and repeatedly dequeues a vertex, appending it to the sorted order and decrementing in-degrees of its neighbors. If the sorted order contains fewer than V vertices, the graph has a cycle. Alternatively, a DFS-based topological sort appends vertices in reverse finish order.",
    "Graph coloring assigns colors to vertices such that no two adjacent vertices share the same color. The chromatic number chi(G) is the minimum number of colors needed. Determining chi(G) is NP-hard in general, but greedy coloring with a good vertex ordering often produces near-optimal results. Bipartite graphs are exactly the 2-colorable graphs, and a graph is bipartite if and only if it contains no odd-length cycle (testable via BFS).",
    "A graph is planar if it can be drawn in the plane without edge crossings. By Kuratowski's theorem, a graph is planar if and only if it contains no subdivision of K5 or K3,3. Euler's formula for connected planar graphs states V - E + F = 2, where F is the number of faces. This implies E <= 3V - 6 for simple planar graphs with V >= 3, giving a quick non-planarity test.",
    "Strongly Connected Components (SCCs) of a directed graph are maximal subsets of vertices where every vertex is reachable from every other. Tarjan's algorithm finds all SCCs in O(V + E) using a single DFS pass with a stack and low-link values. Kosaraju's algorithm achieves the same by running DFS twice: once on the original graph to get finish ordering, and once on the transposed graph in reverse finish order.",
  ],
  code: [
    {
      language: "cpp",
      caption: "BFS and DFS on an adjacency list",
      source: `#include <iostream>
#include <queue>
#include <stack>
#include <unordered_map>
#include <unordered_set>
#include <vector>
#include <algorithm>

using Graph = std::unordered_map<int, std::vector<int>>;

// Return vertices in BFS order from start. O(V + E).
std::vector<int> bfs(const Graph& graph, int start) {
    std::unordered_set<int> visited = {start};
    std::queue<int> q;
    q.push(start);
    std::vector<int> order;

    while (!q.empty()) {
        int v = q.front(); q.pop();
        order.push_back(v);
        for (int neighbor : graph.at(v)) {
            if (visited.find(neighbor) == visited.end()) {
                visited.insert(neighbor);
                q.push(neighbor);
            }
        }
    }
    return order;
}

// Return vertices in DFS order from start (iterative). O(V + E).
std::vector<int> dfs(const Graph& graph, int start) {
    std::unordered_set<int> visited;
    std::stack<int> stk;
    stk.push(start);
    std::vector<int> order;

    while (!stk.empty()) {
        int v = stk.top(); stk.pop();
        if (visited.count(v)) continue;
        visited.insert(v);
        order.push_back(v);
        // Push neighbors in reverse for consistent ordering
        auto& neighbors = graph.at(v);
        for (auto it = neighbors.rbegin(); it != neighbors.rend(); ++it) {
            if (!visited.count(*it))
                stk.push(*it);
        }
    }
    return order;
}

int main() {
    // Undirected graph as adjacency list
    Graph graph = {
        {0, {1, 2}},
        {1, {0, 3}},
        {2, {0, 3}},
        {3, {1, 2, 4}},
        {4, {3}},
    };

    std::cout << "BFS:";
    for (int v : bfs(graph, 0)) std::cout << " " << v;
    std::cout << "\\n"; // 0 1 2 3 4

    std::cout << "DFS:";
    for (int v : dfs(graph, 0)) std::cout << " " << v;
    std::cout << "\\n"; // 0 1 3 2 4

    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Dijkstra's shortest path algorithm",
      source: `#include <iostream>
#include <queue>
#include <unordered_map>
#include <vector>
#include <limits>

using WeightedGraph = std::unordered_map<int, std::vector<std::pair<int,int>>>;

// Compute shortest distances from start.
// graph: {node: [(neighbor, weight), ...]}
// Returns: {node: shortest_distance}
std::unordered_map<int,int> dijkstra(const WeightedGraph& graph, int start) {
    constexpr int INF = std::numeric_limits<int>::max();
    std::unordered_map<int,int> dist;
    dist[start] = 0;

    // Min-heap: (distance, vertex)
    using Pair = std::pair<int,int>;
    std::priority_queue<Pair, std::vector<Pair>, std::greater<Pair>> heap;
    heap.push({0, start});

    while (!heap.empty()) {
        auto [d, u] = heap.top(); heap.pop();
        // Skip stale entries
        if (dist.count(u) && d > dist[u]) continue;

        auto it = graph.find(u);
        if (it == graph.end()) continue;
        for (auto [v, w] : it->second) {
            int new_dist = d + w;
            if (!dist.count(v) || new_dist < dist[v]) {
                dist[v] = new_dist;
                heap.push({new_dist, v});
            }
        }
    }
    return dist;
}

int main() {
    // Weighted directed graph
    WeightedGraph graph = {
        {0, {{1, 4}, {2, 1}}},
        {1, {{3, 1}}},
        {2, {{1, 2}, {3, 5}}},
        {3, {}},
    };

    auto dist = dijkstra(graph, 0);
    for (auto& [node, d] : dist)
        std::cout << "dist[" << node << "] = " << d << "\\n";
    // dist[0] = 0, dist[2] = 1, dist[1] = 3, dist[3] = 4

    return 0;
}`,
    },
  ],
  diagrams: [
    {
      title: "Graph Types Taxonomy",
      kind: "mindmap",
      caption: "Classification of graphs by direction, weight, and special properties.",
      mermaid: `mindmap
  root((Graph Types))
    By Direction
      Undirected
      Directed DAG
      Directed cyclic
    By Weight
      Unweighted
      Weighted edges
    By Connectivity
      Connected
      Disconnected
      Strongly connected
    Special
      Tree
      Bipartite
      Complete graph`,
    },
    {
      title: "Shortest Path Algorithm Selection",
      kind: "flow",
      caption: "Choosing the right shortest path algorithm based on graph properties.",
      mermaid: `flowchart TD
    A[Find Shortest Path] --> B{Negative weights?}
    B -- Yes --> C{Negative cycles?}
    C -- Yes --> D[No solution - Bellman-Ford detects]
    C -- No --> E[Bellman-Ford O of VE]
    B -- No --> F{Single source?}
    F -- Yes --> G{Unweighted?}
    G -- Yes --> H[BFS O of V plus E]
    G -- No --> I[Dijkstra O of E log V]
    F -- No --> J[Floyd-Warshall O of V cubed]`,
    },
    {
      title: "BFS vs DFS Mechanics",
      kind: "architecture",
      caption: "Contrasting BFS queue-based and DFS stack-based traversal mechanics.",
      mermaid: `graph TD
    subgraph BFS Breadth First
        BQ[Queue FIFO] --> BN[Dequeue and visit node]
        BN --> BE[Enqueue unvisited neighbors]
        BE --> BQ
        BN --> BL[Explores level by level]
    end
    subgraph DFS Depth First
        DS[Stack or recursion] --> DN[Pop and visit node]
        DN --> DP[Push unvisited neighbors]
        DP --> DS
        DN --> DD[Explores depth first]
    end`,
    },
    {
      title: "Graph Algorithm Use Cases",
      kind: "network",
      caption: "Sample weighted graph for algorithm demonstrations.",
      mermaid: `graph LR
    A -- 4 --- B
    A -- 2 --- C
    B -- 5 --- C
    B -- 10 --- D
    C -- 3 --- D
    C -- 8 --- E
    D -- 7 --- E`,
    },
  ],
  animations: [
    {
      title: "Dijkstra's algorithm step-by-step",
      steps: [
        {
          label: "Initialize",
          detail:
            "Set dist[source] = 0, all others = infinity. Insert source into the priority queue.",
        },
        {
          label: "Extract minimum",
          detail:
            "Pop the vertex u with the smallest tentative distance from the priority queue.",
        },
        {
          label: "Relax edges",
          detail:
            "For each neighbor v of u, if dist[u] + weight(u,v) < dist[v], update dist[v] and push v into the queue.",
        },
        {
          label: "Mark finalized",
          detail:
            "Vertex u is now finalized; its shortest distance will never change.",
        },
        {
          label: "Repeat",
          detail:
            "Continue extracting and relaxing until the priority queue is empty.",
        },
        {
          label: "Result",
          detail:
            "dist[] now contains the shortest distance from source to every reachable vertex.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Algorithm",
      "Problem",
      "Time Complexity",
      "Negative Weights?",
      "Notes",
    ],
    rows: [
      [
        "BFS",
        "Shortest path (unweighted)",
        "O(V + E)",
        "N/A",
        "Uses a queue; guarantees shortest path in unweighted graphs",
      ],
      [
        "Dijkstra",
        "Single-source shortest path",
        "O((V + E) log V)",
        "No",
        "Greedy; uses a min-heap; fails with negative edges",
      ],
      [
        "Bellman-Ford",
        "Single-source shortest path",
        "O(V * E)",
        "Yes",
        "Detects negative-weight cycles; slower than Dijkstra",
      ],
      [
        "Floyd-Warshall",
        "All-pairs shortest path",
        "O(V^3)",
        "Yes",
        "DP over intermediate vertices; simple but cubic",
      ],
      [
        "Kruskal",
        "MST",
        "O(E log E)",
        "N/A",
        "Sort edges + Union-Find; good for sparse graphs",
      ],
      [
        "Prim",
        "MST",
        "O((V + E) log V)",
        "N/A",
        "Grows MST from a vertex using a priority queue",
      ],
    ],
  },
  interviewQA: [
    {
      q: "When would you use an adjacency matrix versus an adjacency list?",
      a: "Use an adjacency matrix when the graph is dense (E close to V^2) or you need O(1) edge-existence checks. Use an adjacency list for sparse graphs where V + E is much less than V^2, as it saves memory and allows efficient neighbor iteration.",
      followUps: [
        "What is the space complexity of each representation?",
        "How does the choice affect BFS/DFS time complexity?",
      ],
    },
    {
      q: "How do you detect a cycle in a directed graph?",
      a: "Run DFS and track vertices currently on the recursion stack (gray vertices). If you encounter a gray vertex, you have found a back edge, which indicates a cycle. Alternatively, attempt a topological sort; if it does not include all vertices, a cycle exists.",
      followUps: [
        "How does cycle detection differ for undirected graphs?",
        "Can you use BFS for cycle detection?",
      ],
    },
    {
      q: "Why does Dijkstra's algorithm fail with negative edge weights?",
      a: "Dijkstra assumes that once a vertex is extracted from the priority queue, its shortest distance is finalized. A negative-weight edge could later provide a shorter path to an already-finalized vertex, violating this invariant.",
      followUps: [
        "What algorithm would you use instead?",
        "Can you modify Dijkstra to handle negative weights by adding a constant to all edges?",
      ],
    },
    {
      q: "Explain Kruskal's algorithm and the role of Union-Find.",
      a: "Kruskal's algorithm sorts all edges by weight and iterates through them, adding an edge to the MST if it connects two different components. Union-Find (disjoint set) efficiently tracks which component each vertex belongs to, supporting near-O(1) union and find operations with path compression and union by rank.",
      followUps: [
        "What is the time complexity of Union-Find operations with path compression?",
        "When would Prim's algorithm be preferred over Kruskal's?",
      ],
    },
  ],
  followUps: [
    "Explore network flow algorithms (Ford-Fulkerson, Edmonds-Karp) for max-flow / min-cut problems.",
    "Study strongly connected components via Tarjan's or Kosaraju's algorithm.",
    "Look into A* search as a heuristic-guided extension of Dijkstra for pathfinding in games and maps.",
    "Investigate graph databases (Neo4j) and how graph theory applies to social networks and recommendation systems.",
  ],
  mcqs: [
    {
      q: "What is the time complexity of BFS on a graph represented as an adjacency list?",
      options: ["O(V)", "O(E)", "O(V + E)", "O(V * E)"],
      answerIndex: 2,
      explanation:
        "BFS visits each vertex once (O(V)) and examines each edge once (O(E)), giving O(V + E) total.",
    },
    {
      q: "Which algorithm can detect negative-weight cycles?",
      options: ["Dijkstra", "Bellman-Ford", "Prim", "Kruskal"],
      answerIndex: 1,
      explanation:
        "Bellman-Ford runs V-1 relaxation passes. If a V-th pass still reduces a distance, a negative-weight cycle exists.",
    },
    {
      q: "A topological sort is possible only for which type of graph?",
      options: [
        "Undirected acyclic graph",
        "Directed Acyclic Graph (DAG)",
        "Complete graph",
        "Bipartite graph",
      ],
      answerIndex: 1,
      explanation:
        "Topological ordering requires directed edges and no cycles. Only DAGs satisfy both conditions.",
    },
    {
      q: "In Kruskal's algorithm, what data structure prevents adding an edge that would form a cycle?",
      options: ["Priority queue", "Hash map", "Union-Find (Disjoint Set)", "Stack"],
      answerIndex: 2,
      explanation:
        "Union-Find tracks connected components. Before adding an edge (u, v), we check if u and v are already in the same set; if so, adding the edge would create a cycle.",
    },
    {
      q: "Euler's formula for connected planar graphs states V - E + F = ?",
      options: ["0", "1", "2", "V"],
      answerIndex: 2,
      explanation:
        "Euler's formula states V - E + F = 2 for any connected planar graph, where F includes the outer (unbounded) face.",
    },
  ],
  exercises: [
    "Implement topological sort using both Kahn's algorithm (BFS-based) and DFS-based approach. Verify they produce valid orderings on the same DAG.",
    "Given a weighted undirected graph, implement both Prim's and Kruskal's MST algorithms and verify they produce the same total weight.",
    "Write a function that determines whether a given undirected graph is bipartite using BFS-based 2-coloring.",
    "Implement Bellman-Ford and construct a graph with a negative-weight cycle. Verify your implementation detects it.",
  ],
  flashcards: [
    {
      front: "What is the difference between a directed and undirected graph?",
      back: "In a directed graph, edges have a direction (u -> v). In an undirected graph, edges are bidirectional ({u, v}).",
    },
    {
      front: "Time complexity of Dijkstra with a binary heap?",
      back: "O((V + E) log V). Each vertex is extracted once (V log V) and each edge is relaxed once (E log V).",
    },
    {
      front: "What does Bellman-Ford's V-th iteration detect?",
      back: "A negative-weight cycle. If any distance decreases on the V-th pass, the graph contains a negative cycle reachable from the source.",
    },
    {
      front: "What is the chromatic number of a graph?",
      back: "The minimum number of colors needed to color vertices so that no two adjacent vertices share the same color.",
    },
    {
      front: "When is a graph bipartite?",
      back: "When its vertices can be divided into two disjoint sets such that every edge connects a vertex in one set to a vertex in the other. Equivalently, when it contains no odd-length cycle.",
    },
    {
      front: "Kruskal's vs Prim's: which is better for sparse graphs?",
      back: "Kruskal's, because it sorts edges (O(E log E)) and sparse graphs have E close to V. Prim's is often better for dense graphs where E approaches V^2.",
    },
    {
      front: "What is Floyd-Warshall's recurrence relation?",
      back: "dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]) for each intermediate vertex k from 1 to V.",
    },
    {
      front: "What is a strongly connected component (SCC)?",
      back: "A maximal subset of vertices in a directed graph where every vertex is reachable from every other vertex in the subset.",
    },
  ],
  revisionNotes: [
    "Graphs: G = (V, E). Directed vs undirected. Weighted vs unweighted. Adjacency matrix O(V^2) space, adjacency list O(V + E) space.",
    "BFS: queue-based, O(V + E), shortest path in unweighted graphs. DFS: stack/recursion-based, O(V + E), used for cycle detection and topological sort.",
    "Dijkstra: greedy, non-negative weights only, O((V+E) log V). Bellman-Ford: handles negative weights, O(VE), detects negative cycles.",
    "Floyd-Warshall: all-pairs shortest paths, O(V^3), DP over intermediate vertices.",
    "MST: Kruskal (sort edges + Union-Find, O(E log E)) vs Prim (grow from vertex + min-heap, O((V+E) log V)).",
    "Planarity: no K5 or K3,3 subdivision. Euler's formula: V - E + F = 2. For simple planar graphs: E <= 3V - 6.",
  ],
  cheatSheet: [
    "Adjacency list: O(V + E) space, O(deg(v)) neighbor lookup. Adjacency matrix: O(V^2) space, O(1) edge check.",
    "BFS = queue + visited set. DFS = stack (or recursion) + visited set.",
    "Topological sort: only for DAGs. Kahn's: process zero in-degree vertices. DFS: reverse finish order.",
    "Dijkstra: min-heap, relax edges, no negative weights. Bellman-Ford: V-1 passes, relax all edges, handles negatives.",
    "Kruskal: sort edges, Union-Find to avoid cycles. Prim: min-heap, grow MST from a source vertex.",
    "Bipartite check: BFS 2-coloring. If conflict found, graph has an odd cycle and is not bipartite.",
  ],
  resources: [
    {
      label: "Introduction to Algorithms (CLRS) - Graph Algorithms chapters",
      kind: "book",
      note: "The definitive reference covering BFS, DFS, shortest paths, MST, and network flow.",
    },
    {
      label: "Visualgo - Graph Traversal & Shortest Path Visualizations", url: "https://visualgo.net/",
      kind: "article",
      note: "Interactive animations for BFS, DFS, Dijkstra, Bellman-Ford, and more.",
    },
    {
      label: "William Fiset - Graph Theory Playlist (YouTube)",
      kind: "video",
      note: "Comprehensive video series covering graph algorithms from basics to advanced topics.",
    },
    {
      label: "CP-Algorithms (e-maxx) - Graph section",
      kind: "docs",
      note: "Detailed write-ups with implementations for competitive programming graph problems.",
    },
  ],
  glossary: [
    {
      term: "Adjacency List",
      definition:
        "A graph representation where each vertex stores a list of its neighbors. Uses O(V + E) space.",
    },
    {
      term: "Adjacency Matrix",
      definition:
        "A V x V matrix where entry [i][j] indicates the presence (and optionally weight) of an edge from i to j.",
    },
    {
      term: "DAG",
      definition:
        "Directed Acyclic Graph. A directed graph with no cycles, enabling topological sorting.",
    },
    {
      term: "Minimum Spanning Tree (MST)",
      definition:
        "A subset of edges in a connected, undirected, weighted graph that connects all vertices with minimum total edge weight and no cycles.",
    },
    {
      term: "Topological Sort",
      definition:
        "A linear ordering of vertices in a DAG such that for every directed edge (u, v), u appears before v.",
    },
    {
      term: "Relaxation",
      definition:
        "The process of updating a shortest-path estimate: if dist[u] + w(u,v) < dist[v], set dist[v] = dist[u] + w(u,v).",
    },
    {
      term: "Union-Find",
      definition:
        "A data structure (disjoint set) supporting efficient union and find operations, used in Kruskal's algorithm to detect cycles.",
    },
    {
      term: "Chromatic Number",
      definition:
        "The minimum number of colors needed to color the vertices of a graph so that no two adjacent vertices share the same color.",
    },
  ],
};
