import type { TopicContent } from "../types";

export const graphs: TopicContent = {
  quickSummary: [
    "A graph G = (V, E) is a collection of vertices (nodes) and edges (connections between nodes); graphs model networks, maps, social connections, dependency chains, and countless other structures.",
    "The two dominant in-memory representations are the adjacency matrix (|V| x |V| 2-D array) and the adjacency list (array of per-vertex neighbor lists), each with distinct time/space trade-offs.",
    "Edge lists and incidence matrices are simpler but less query-efficient; Compressed Sparse Row (CSR) is a cache-friendly, read-optimized format used in high-performance graph libraries.",
    "Choosing the right representation depends on graph density, the dominant operations (edge lookup vs. neighbor iteration), mutability requirements, and memory constraints.",
  ],
  detailed: [
    "Graphs are one of the most versatile data structures in computer science. A graph G = (V, E) consists of a set of vertices V and a set of edges E, where each edge connects two vertices. Edges can be directed (u -> v) or undirected (u -- v), weighted or unweighted, and the graph may contain self-loops or parallel edges (multigraphs). The choice of representation profoundly affects the performance of every algorithm that operates on the graph.",
    "An adjacency matrix stores a |V| x |V| boolean (or weight) matrix where entry M[i][j] indicates whether an edge exists from vertex i to vertex j. This makes edge existence queries O(1) but consumes O(V^2) space regardless of how many edges actually exist. For dense graphs where |E| is close to |V|^2, this is acceptable; for sparse graphs it is prohibitively wasteful.",
    "An adjacency list stores, for each vertex, a list (array, linked list, or hash set) of its neighbors. Space usage is O(V + E), which is optimal for sparse graphs. Iterating over a vertex's neighbors is O(degree), and adding an edge is O(1), but checking whether a specific edge (u, v) exists requires scanning u's neighbor list in O(degree(u)) unless the list is a hash set.",
    "Beyond these two primary representations, edge lists store all edges as (u, v, w?) tuples in a flat array -- useful for algorithms like Kruskal's MST that process edges globally. Incidence matrices (|V| x |E|) encode which vertices each edge touches, and are mainly of theoretical interest. Compressed Sparse Row (CSR) packs adjacency data into two contiguous arrays -- an offset array and a neighbors array -- achieving excellent cache locality and minimal memory overhead at the cost of being expensive to modify.",
    "In practice, libraries like NetworkX use adjacency dicts-of-dicts for flexibility, Boost.Graph uses bundled adjacency lists, and high-performance systems (e.g., graph databases like Neo4j, or frameworks like Gunrock for GPU graph analytics) use CSR or variants. The representation choice is an architectural decision that ripples through every algorithm's constant factor and cache behavior.",
  ],
  deepDive: [
    "The adjacency matrix is a |V| x |V| 2-D array where M[i][j] stores the edge weight (or 1/0 for unweighted graphs). For undirected graphs the matrix is symmetric, so only the upper triangle needs storage (reducing space by half, though this complicates indexing). Matrix-based graph algorithms -- such as computing transitive closure via repeated Boolean matrix multiplication, or finding shortest paths via the Floyd-Warshall algorithm -- map naturally to this representation. The matrix also enables spectral graph theory: the eigenvalues of the adjacency matrix (or the related Laplacian matrix L = D - A) reveal structural properties like connectivity, expansion, and clustering. However, iterating over a vertex's neighbors always costs O(V) even if the vertex has only a handful of edges, making BFS/DFS on sparse graphs significantly slower than with adjacency lists.",
    "The adjacency list is the workhorse representation for most graph algorithms. Each vertex u maintains a container of its outgoing neighbors (and edge weights, if applicable). Implementations vary: a vector<vector<int>> in C++ gives cache-friendly, contiguous per-vertex storage; a HashMap<u32, Vec<u32>> in Rust supports non-contiguous vertex IDs; Python's defaultdict(list) is convenient for scripting. For undirected graphs, each edge (u, v) appears in both u's and v's lists. To support O(1) edge lookup per vertex, the neighbor container can be a hash set instead of a list, at the cost of higher constant-factor memory and loss of edge ordering. Adjacency lists support O(V + E) BFS and DFS, O((V + E) log V) Dijkstra with a binary heap, and O(VE) Bellman-Ford, all with optimal asymptotic cache behavior on sparse graphs.",
    "An edge list is simply an array of (u, v, w?) tuples. It uses O(E) space and is trivially sortable, making it ideal for Kruskal's MST algorithm (sort edges by weight, then union-find). However, answering 'what are vertex u's neighbors?' requires a full O(E) scan. Edge lists also arise naturally when reading graph data from files (e.g., edge-per-line formats like DIMACS or SNAP datasets).",
    "The incidence matrix is a |V| x |E| matrix where entry B[v][e] is +1 if edge e leaves vertex v, -1 if it enters v (for directed graphs), or 1 if v is an endpoint (for undirected). It uses O(V * E) space, which is worse than both adjacency matrices and adjacency lists for most practical graphs. Its main utility is in algebraic graph theory and network flow formulations where the incidence matrix directly encodes the constraint matrix of the LP relaxation.",
    "Compressed Sparse Row (CSR) is the gold standard for static, read-heavy graph workloads. It uses two arrays: an offset array of length |V|+1 where offset[i] is the starting index in the neighbors array for vertex i's adjacency list, and a neighbors array of length |E| (or 2|E| for undirected) storing the concatenated neighbor lists. Vertex i's neighbors are neighbors[offset[i]..offset[i+1]]. This layout is extremely cache-friendly because all data is contiguous and there are no pointer indirections. CSR is used by SuiteSparse, scipy.sparse.csr_matrix, the METIS partitioner, and most GPU graph frameworks. The downside is that inserting or deleting an edge requires rebuilding the entire structure. A related format, Compressed Sparse Column (CSC), transposes the layout to optimize column-wise (i.e., incoming-neighbor) access.",
  ],
  code: [
    {
      language: "python",
      caption: "Adjacency list representation with BFS and DFS",
      source: `from collections import defaultdict, deque
from typing import List, Dict, Set

class GraphAdjList:
    """Directed graph using adjacency list (dict of lists)."""

    def __init__(self):
        self.adj: Dict[int, List[int]] = defaultdict(list)

    def add_edge(self, u: int, v: int) -> None:
        self.adj[u].append(v)
        # For undirected: self.adj[v].append(u)

    def bfs(self, start: int) -> List[int]:
        """Breadth-first traversal from start. O(V + E)."""
        visited: Set[int] = {start}
        queue = deque([start])
        order: List[int] = []
        while queue:
            node = queue.popleft()
            order.append(node)
            for neighbor in self.adj[node]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        return order

    def dfs(self, start: int) -> List[int]:
        """Iterative depth-first traversal from start. O(V + E)."""
        visited: Set[int] = set()
        stack = [start]
        order: List[int] = []
        while stack:
            node = stack.pop()
            if node in visited:
                continue
            visited.add(node)
            order.append(node)
            # Reverse to visit neighbors in natural order
            for neighbor in reversed(self.adj[node]):
                if neighbor not in visited:
                    stack.append(neighbor)
        return order

# Example usage
g = GraphAdjList()
for u, v in [(0,1),(0,2),(1,3),(2,3),(3,4)]:
    g.add_edge(u, v)
print("BFS:", g.bfs(0))   # [0, 1, 2, 3, 4]
print("DFS:", g.dfs(0))   # [0, 1, 3, 4, 2]`,
    },
    {
      language: "python",
      caption: "Adjacency matrix representation with edge lookup and neighbor iteration",
      source: `class GraphAdjMatrix:
    """Undirected, unweighted graph using an adjacency matrix."""

    def __init__(self, n: int):
        self.n = n
        self.matrix = [[0] * n for _ in range(n)]

    def add_edge(self, u: int, v: int) -> None:
        self.matrix[u][v] = 1
        self.matrix[v][u] = 1  # symmetric for undirected

    def has_edge(self, u: int, v: int) -> bool:
        """O(1) edge existence check."""
        return self.matrix[u][v] == 1

    def neighbors(self, u: int) -> list:
        """O(V) neighbor scan -- expensive for sparse graphs."""
        return [v for v in range(self.n) if self.matrix[u][v]]

    def degree(self, u: int) -> int:
        return sum(self.matrix[u])

# Example
g = GraphAdjMatrix(5)
for u, v in [(0,1),(0,2),(1,3),(2,3),(3,4)]:
    g.add_edge(u, v)
print("Edge 0-1?", g.has_edge(0, 1))   # True
print("Edge 0-4?", g.has_edge(0, 4))   # False
print("Neighbors of 3:", g.neighbors(3))  # [1, 2, 4]`,
    },
    {
      language: "cpp",
      caption: "Compressed Sparse Row (CSR) construction and traversal in C++",
      source: `#include <vector>
#include <algorithm>
#include <iostream>

struct CSRGraph {
    int num_vertices;
    std::vector<int> offset;   // size V+1
    std::vector<int> neighbors; // size E (or 2E for undirected)

    // Build CSR from edge list
    static CSRGraph from_edges(int V,
            const std::vector<std::pair<int,int>>& edges) {
        CSRGraph g;
        g.num_vertices = V;
        g.offset.assign(V + 1, 0);

        // Count degrees
        for (auto& [u, v] : edges) {
            g.offset[u + 1]++;
            g.offset[v + 1]++; // undirected
        }
        // Prefix sum to get offsets
        for (int i = 1; i <= V; i++)
            g.offset[i] += g.offset[i - 1];

        g.neighbors.resize(g.offset[V]);
        std::vector<int> pos(g.offset.begin(), g.offset.end());

        for (auto& [u, v] : edges) {
            g.neighbors[pos[u]++] = v;
            g.neighbors[pos[v]++] = u; // undirected
        }
        return g;
    }

    // Iterate over neighbors of vertex u
    void for_each_neighbor(int u, auto&& fn) const {
        for (int i = offset[u]; i < offset[u + 1]; i++)
            fn(neighbors[i]);
    }
};

int main() {
    auto g = CSRGraph::from_edges(5,
        {{0,1},{0,2},{1,3},{2,3},{3,4}});
    std::cout << "Neighbors of 3: ";
    g.for_each_neighbor(3, [](int v) {
        std::cout << v << " ";
    });
    // Output: Neighbors of 3: 1 2 4
}`,
    },
  ],
  diagrams: [
    {
      title: "Graph representation comparison",
      kind: "architecture",
      caption:
        "Side-by-side view of how the same 5-node graph is stored as an adjacency matrix, adjacency list, edge list, and CSR format.",
    },
    {
      title: "BFS vs DFS traversal order",
      kind: "flow",
      caption:
        "Flow diagram showing the order in which nodes are visited during BFS (level-by-level) versus DFS (depth-first backtracking) on the same graph.",
    },
    {
      title: "CSR memory layout",
      kind: "architecture",
      caption:
        "How the offset and neighbors arrays are laid out contiguously in memory, with arrows showing how offset[i]..offset[i+1] indexes into the neighbors array.",
    },
  ],
  animations: [
    {
      title: "Building an adjacency list from edges",
      steps: [
        {
          label: "Initialize empty adjacency list",
          detail:
            "Create an empty dictionary (or array of empty lists) with one entry per vertex: {0: [], 1: [], 2: [], 3: [], 4: []}.",
        },
        {
          label: "Insert edge (0, 1)",
          detail:
            "Append 1 to vertex 0's list and 0 to vertex 1's list (undirected). State: {0: [1], 1: [0], 2: [], 3: [], 4: []}.",
        },
        {
          label: "Insert edge (0, 2)",
          detail:
            "Append 2 to vertex 0's list and 0 to vertex 2's list. State: {0: [1, 2], 1: [0], 2: [0], 3: [], 4: []}.",
        },
        {
          label: "Insert edge (1, 3)",
          detail:
            "Append 3 to vertex 1's list and 1 to vertex 3's list. State: {0: [1, 2], 1: [0, 3], 2: [0], 3: [1], 4: []}.",
        },
        {
          label: "Insert edge (2, 3)",
          detail:
            "Append 3 to vertex 2's list and 2 to vertex 3's list. State: {0: [1, 2], 1: [0, 3], 2: [0, 3], 3: [1, 2], 4: []}.",
        },
        {
          label: "Insert edge (3, 4)",
          detail:
            "Append 4 to vertex 3's list and 3 to vertex 4's list. Final: {0: [1, 2], 1: [0, 3], 2: [0, 3], 3: [1, 2, 4], 4: [3]}.",
        },
      ],
    },
    {
      title: "BFS traversal step-by-step",
      steps: [
        {
          label: "Start at vertex 0",
          detail:
            "Mark vertex 0 as visited, enqueue it. Queue: [0]. Visited: {0}.",
        },
        {
          label: "Dequeue 0, explore neighbors",
          detail:
            "Dequeue 0. Neighbors are 1 and 2 -- both unvisited. Enqueue both. Queue: [1, 2]. Visited: {0, 1, 2}. Output: [0].",
        },
        {
          label: "Dequeue 1, explore neighbors",
          detail:
            "Dequeue 1. Neighbors are 0 (visited) and 3 (unvisited). Enqueue 3. Queue: [2, 3]. Visited: {0, 1, 2, 3}. Output: [0, 1].",
        },
        {
          label: "Dequeue 2, explore neighbors",
          detail:
            "Dequeue 2. Neighbors are 0 (visited) and 3 (visited). Nothing to enqueue. Queue: [3]. Output: [0, 1, 2].",
        },
        {
          label: "Dequeue 3, explore neighbors",
          detail:
            "Dequeue 3. Neighbors are 1 (visited), 2 (visited), and 4 (unvisited). Enqueue 4. Queue: [4]. Output: [0, 1, 2, 3].",
        },
        {
          label: "Dequeue 4, traversal complete",
          detail:
            "Dequeue 4. No unvisited neighbors. Queue empty. Final BFS order: [0, 1, 2, 3, 4].",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Property",
      "Adjacency Matrix",
      "Adjacency List",
      "Edge List",
    ],
    rows: [
      ["Space", "O(V^2)", "O(V + E)", "O(E)"],
      ["Check edge (u,v)", "O(1)", "O(degree(u))", "O(E)"],
      [
        "Iterate neighbors of u",
        "O(V)",
        "O(degree(u))",
        "O(E)",
      ],
      ["Add edge", "O(1)", "O(1) amortized", "O(1) amortized"],
      [
        "Remove edge",
        "O(1)",
        "O(degree(u))",
        "O(E)",
      ],
      [
        "Add vertex",
        "O(V^2) -- rebuild matrix",
        "O(1)",
        "O(1)",
      ],
      [
        "Memory locality",
        "Excellent (contiguous 2-D array)",
        "Good (per-vertex contiguous)",
        "Excellent (flat array)",
      ],
      [
        "Best suited for",
        "Dense graphs, matrix algorithms",
        "Sparse graphs, BFS/DFS/Dijkstra",
        "Kruskal's MST, batch edge processing",
      ],
    ],
  },
  interviewQA: [
    {
      q: "When would you choose an adjacency matrix over an adjacency list?",
      a: "Use an adjacency matrix when the graph is dense (|E| close to |V|^2), when you need O(1) edge existence checks, or when the algorithm is matrix-based (e.g., Floyd-Warshall all-pairs shortest paths, transitive closure). The O(V^2) space is already proportional to the number of edges in a dense graph, so the overhead is acceptable.",
      followUps: [
        "How would you handle a weighted graph in an adjacency matrix? (Store weights instead of 1/0; use a sentinel like infinity for non-edges.)",
        "Can you store only the upper triangle for an undirected graph? What is the trade-off? (Yes, halves memory, but index calculation becomes i*(2V-i-1)/2 + j.)",
      ],
    },
    {
      q: "Explain how BFS finds the shortest path in an unweighted graph.",
      a: "BFS explores vertices in order of increasing distance from the source. The first time BFS reaches a vertex v, it has taken the fewest possible edges to get there, because all vertices at distance d are dequeued before any vertex at distance d+1. By recording each vertex's parent during BFS, you can reconstruct the shortest path by backtracking from the destination to the source.",
      followUps: [
        "What happens if the graph is weighted? (BFS no longer gives shortest paths; use Dijkstra's algorithm instead.)",
        "What is the time complexity of BFS? (O(V + E) with an adjacency list.)",
      ],
    },
    {
      q: "What is the difference between a directed and an undirected graph in terms of representation?",
      a: "In an undirected graph, an edge (u, v) implies both u->v and v->u, so the adjacency matrix is symmetric and each edge appears in both vertices' adjacency lists (doubling storage in the list). In a directed graph, edge (u, v) only appears once -- M[u][v] = 1 but M[v][u] may be 0, and only u's adjacency list contains v.",
      followUps: [
        "How do you compute in-degree efficiently with an adjacency list? (Maintain a separate in-degree counter array, or use a reverse adjacency list.)",
      ],
    },
    {
      q: "How would you detect a cycle in a directed graph?",
      a: "Use DFS with a three-color marking scheme: WHITE (unvisited), GRAY (in the current DFS recursion stack), BLACK (fully processed). If DFS encounters a GRAY vertex, a back edge exists and the graph has a cycle. Alternatively, attempt a topological sort using Kahn's algorithm (BFS-based); if the resulting order contains fewer than |V| vertices, the graph has a cycle.",
      followUps: [
        "How does cycle detection differ in an undirected graph? (Any back edge that does not go to the immediate parent indicates a cycle; union-find also works.)",
        "What is the time complexity? (O(V + E) for both DFS and Kahn's approaches.)",
      ],
    },
    {
      q: "What is the Compressed Sparse Row (CSR) format and when is it used?",
      a: "CSR stores a graph in two contiguous arrays: an offset array of size |V|+1 where offset[i] marks where vertex i's neighbors start in the second array, and a neighbors array of size |E| (or 2|E| for undirected) containing all neighbor lists concatenated. Vertex i's neighbors are neighbors[offset[i]..offset[i+1]]. CSR is used in high-performance computing (BLAS sparse matrix operations, graph analytics frameworks like Gunrock, scipy.sparse) because it minimizes memory allocations and maximizes CPU cache utilization. The trade-off is that edge insertions and deletions require rebuilding the structure.",
      followUps: [
        "What is CSC and how does it relate to CSR? (Compressed Sparse Column is the transpose -- it gives efficient access to incoming neighbors instead of outgoing.)",
        "How would you build a CSR from an edge list? (Count per-vertex degrees, compute prefix sum for offsets, scatter edges into the neighbors array.)",
      ],
    },
    {
      q: "Given a graph with 10 million vertices and 50 million edges, which representation would you use and why?",
      a: "An adjacency list, because the graph is sparse (average degree 5). An adjacency matrix would require 10^14 entries (100 terabytes), which is infeasible. An adjacency list uses O(V + E) = ~60 million entries, roughly 240 MB with 4-byte integers. If the graph is static and performance-critical, CSR would be even better due to its contiguous memory layout and cache efficiency.",
    },
  ],
  followUps: [
    "Graph traversals: BFS and DFS in depth",
    "Shortest path algorithms: Dijkstra, Bellman-Ford, Floyd-Warshall",
    "Minimum spanning tree: Kruskal's and Prim's algorithms",
    "Topological sorting and DAGs",
    "Strongly connected components: Tarjan's and Kosaraju's algorithms",
    "Network flow: Ford-Fulkerson, Edmonds-Karp",
    "Graph coloring and chromatic number",
    "Bipartite graphs and matching",
  ],
  mcqs: [
    {
      q: "What is the space complexity of an adjacency matrix for a graph with V vertices?",
      options: ["O(V)", "O(V + E)", "O(V^2)", "O(E)"],
      answerIndex: 2,
      explanation:
        "An adjacency matrix stores a V x V grid, requiring O(V^2) space regardless of how many edges exist.",
    },
    {
      q: "Which representation is best for checking whether edge (u, v) exists in O(1) time?",
      options: [
        "Adjacency list with a linked list",
        "Edge list",
        "Adjacency matrix",
        "Incidence matrix",
      ],
      answerIndex: 2,
      explanation:
        "The adjacency matrix allows direct indexing with M[u][v], giving O(1) lookup. Adjacency lists require O(degree) scanning unless backed by a hash set.",
    },
    {
      q: "In an undirected graph stored as an adjacency list, how many times does each edge appear?",
      options: ["Once", "Twice", "V times", "It depends on the implementation"],
      answerIndex: 1,
      explanation:
        "Each undirected edge (u, v) is stored in both u's and v's neighbor lists, so it appears twice in total.",
    },
    {
      q: "What is the time complexity of BFS on a graph represented as an adjacency list?",
      options: ["O(V)", "O(E)", "O(V + E)", "O(V * E)"],
      answerIndex: 2,
      explanation:
        "BFS visits each vertex once (O(V)) and examines each edge once (O(E)), giving O(V + E) total.",
    },
    {
      q: "Which data structure is used in BFS to determine the order of vertex exploration?",
      options: ["Stack", "Queue", "Priority queue", "Deque"],
      answerIndex: 1,
      explanation:
        "BFS uses a FIFO queue to ensure vertices are explored in order of their distance from the source. DFS uses a stack (or recursion).",
    },
    {
      q: "In Compressed Sparse Row (CSR) format, how do you find the neighbors of vertex i?",
      options: [
        "Scan the entire neighbors array",
        "Look up row i in a hash map",
        "Read neighbors[offset[i]..offset[i+1]]",
        "Check the incidence matrix column i",
      ],
      answerIndex: 2,
      explanation:
        "CSR uses an offset array where offset[i] and offset[i+1] define the slice of the contiguous neighbors array that contains vertex i's neighbors.",
    },
    {
      q: "For Kruskal's minimum spanning tree algorithm, which graph representation is most natural?",
      options: [
        "Adjacency matrix",
        "Adjacency list",
        "Edge list",
        "CSR",
      ],
      answerIndex: 2,
      explanation:
        "Kruskal's algorithm sorts all edges by weight and processes them one by one, which maps directly to an edge list. No per-vertex neighbor access is needed.",
    },
  ],
  exercises: [
    "Implement a function that converts an adjacency matrix to an adjacency list and vice versa. Verify correctness by round-tripping a sample graph.",
    "Write BFS and DFS for both directed and undirected graphs. For BFS, also record the shortest-path distance from the source to every reachable vertex.",
    "Implement cycle detection in a directed graph using DFS with the three-color (WHITE/GRAY/BLACK) scheme. Return one cycle if found.",
    "Build a CSR representation from an edge list. Implement neighbor iteration and verify it matches the adjacency list output for the same graph.",
    "Given an unweighted undirected graph, write a function that finds all connected components and returns them as lists of vertex sets.",
    "Implement topological sort for a DAG using both DFS (reverse post-order) and BFS (Kahn's algorithm). Verify both produce valid orderings.",
    "Write a function that determines whether a graph is bipartite using BFS-based 2-coloring. Return the two partitions if bipartite, or a witness odd cycle if not.",
  ],
  flashcards: [
    {
      front: "What is the space complexity of an adjacency list?",
      back: "O(V + E). Each vertex has an entry, and each edge is stored once (directed) or twice (undirected).",
    },
    {
      front: "What is the space complexity of an adjacency matrix?",
      back: "O(V^2). A V x V array is allocated regardless of edge count.",
    },
    {
      front: "How do you check if edge (u, v) exists in an adjacency matrix?",
      back: "Access M[u][v] directly -- O(1) time.",
    },
    {
      front: "How do you iterate over all neighbors of vertex u in an adjacency list?",
      back: "Traverse adj[u] -- O(degree(u)) time.",
    },
    {
      front: "What traversal algorithm uses a queue?",
      back: "Breadth-First Search (BFS). It explores all vertices at distance d before those at distance d+1.",
    },
    {
      front: "What traversal algorithm uses a stack (or recursion)?",
      back: "Depth-First Search (DFS). It explores as deep as possible along each branch before backtracking.",
    },
    {
      front: "What is CSR format?",
      back: "Compressed Sparse Row: two arrays -- offset[V+1] and neighbors[E]. Vertex i's neighbors are neighbors[offset[i]..offset[i+1]]. Cache-friendly but hard to modify.",
    },
    {
      front: "When is an edge list the best representation?",
      back: "When algorithms process edges globally (e.g., Kruskal's MST: sort edges by weight, iterate). Edge lists are also the simplest input format.",
    },
    {
      front: "How do you detect a cycle in a directed graph using DFS?",
      back: "Use three colors: WHITE (unvisited), GRAY (in stack), BLACK (done). A back edge to a GRAY vertex indicates a cycle.",
    },
    {
      front: "What is the time complexity of BFS and DFS?",
      back: "Both are O(V + E) when using an adjacency list. With an adjacency matrix, both become O(V^2).",
    },
  ],
  revisionNotes: [
    "Graph G = (V, E): vertices and edges. Directed vs. undirected. Weighted vs. unweighted.",
    "Adjacency matrix: O(V^2) space, O(1) edge lookup, O(V) neighbor iteration. Best for dense graphs and matrix algorithms.",
    "Adjacency list: O(V + E) space, O(degree) edge lookup (O(1) with hash set), O(degree) neighbor iteration. Best for sparse graphs.",
    "Edge list: O(E) space, O(E) for most queries. Best for global edge processing (sorting, filtering).",
    "CSR: O(V + E) space, contiguous arrays, excellent cache locality. Best for static, read-heavy, high-performance workloads.",
    "BFS uses a queue, gives shortest paths in unweighted graphs, runs in O(V + E).",
    "DFS uses a stack/recursion, used for cycle detection, topological sort, SCC, runs in O(V + E).",
    "For undirected graphs, each edge appears twice in adjacency lists and the matrix is symmetric.",
    "Degree of vertex u: number of edges incident to u. In-degree and out-degree are distinct for directed graphs.",
    "Key interview tip: always state which representation you are using and why, as it affects every complexity analysis.",
  ],
  cheatSheet: [
    "Adjacency matrix: space O(V^2) | edge check O(1) | neighbors O(V) | add edge O(1)",
    "Adjacency list: space O(V+E) | edge check O(deg) | neighbors O(deg) | add edge O(1)",
    "Edge list: space O(E) | edge check O(E) | neighbors O(E) | add edge O(1)",
    "CSR: space O(V+E) | edge check O(log deg) with sorted | neighbors O(deg) | add edge O(V+E) rebuild",
    "BFS: queue-based, O(V+E), shortest paths in unweighted graphs",
    "DFS: stack-based, O(V+E), cycle detection / topological sort / SCC",
    "Sparse graph (E << V^2): use adjacency list or CSR",
    "Dense graph (E ~ V^2): adjacency matrix is acceptable",
    "Undirected: symmetric matrix, edges stored twice in adj list",
    "Directed: asymmetric matrix, edges stored once in adj list",
    "Floyd-Warshall (all-pairs shortest paths): requires adjacency matrix, O(V^3)",
    "Dijkstra (single-source shortest paths): best with adjacency list + min-heap, O((V+E) log V)",
  ],
  resources: [
    {
      label: "CLRS: Introduction to Algorithms, Ch. 22 -- Elementary Graph Algorithms",
      kind: "book",
      note: "The definitive textbook treatment of graph representations, BFS, and DFS with rigorous proofs.",
    },
    {
      label: "Sedgewick & Wayne: Algorithms, 4th Ed. -- Graph chapter",
      kind: "book",
      note: "Excellent Java-based presentation with visualizations and practical implementations.",
    },
    {
      label: "William Fiset -- Graph Theory Playlist (YouTube)",
      kind: "video",
      note: "Comprehensive video series covering graph representations, traversals, and advanced algorithms with animations.",
    },
    {
      label: "NetworkX documentation -- Graph types and data structures",
      kind: "docs",
      note: "Reference for Python's most popular graph library; shows dict-of-dicts adjacency structure.",
    },
    {
      label: "SuiteSparse -- Sparse matrix collection and CSR/CSC formats",
      kind: "repo",
      note: "Industry-standard sparse matrix library; useful for understanding CSR in practice.",
    },
    {
      label: "Skiena: The Algorithm Design Manual, Ch. 5 -- Graph Traversal",
      kind: "book",
      note: "Practical perspective on choosing graph representations with war stories from real applications.",
    },
    {
      label: "Bader & Madduri: Designing Multithreaded Algorithms for BFS and ST-Connectivity (2006)",
      kind: "paper",
      note: "Influential paper on parallel graph traversal using CSR representation.",
    },
  ],
  glossary: [
    {
      term: "Vertex (Node)",
      definition:
        "A fundamental unit of a graph representing an entity. The set of all vertices is denoted V.",
    },
    {
      term: "Edge",
      definition:
        "A connection between two vertices. In a directed graph, an edge has a source and a destination; in an undirected graph, it connects two vertices symmetrically.",
    },
    {
      term: "Adjacency Matrix",
      definition:
        "A |V| x |V| 2-D array where entry M[i][j] indicates whether an edge exists from vertex i to vertex j (and its weight, for weighted graphs).",
    },
    {
      term: "Adjacency List",
      definition:
        "A collection of per-vertex lists (or sets) storing the neighbors of each vertex. Uses O(V + E) space.",
    },
    {
      term: "Edge List",
      definition:
        "A flat array of (u, v) or (u, v, w) tuples representing all edges in the graph.",
    },
    {
      term: "Degree",
      definition:
        "The number of edges incident to a vertex. For directed graphs, in-degree counts incoming edges and out-degree counts outgoing edges.",
    },
    {
      term: "Sparse Graph",
      definition:
        "A graph where |E| is much less than |V|^2, typically O(V) or O(V log V) edges.",
    },
    {
      term: "Dense Graph",
      definition:
        "A graph where |E| is close to |V|^2, meaning most possible edges are present.",
    },
    {
      term: "BFS (Breadth-First Search)",
      definition:
        "A graph traversal that explores all vertices at distance d from the source before those at distance d+1, using a FIFO queue.",
    },
    {
      term: "DFS (Depth-First Search)",
      definition:
        "A graph traversal that explores as deep as possible along each branch before backtracking, using a stack or recursion.",
    },
    {
      term: "CSR (Compressed Sparse Row)",
      definition:
        "A compact, cache-friendly graph storage format using an offset array and a contiguous neighbors array. Efficient for static graphs in high-performance computing.",
    },
    {
      term: "Incidence Matrix",
      definition:
        "A |V| x |E| matrix where entry B[v][e] indicates whether vertex v is an endpoint of edge e. Mainly used in algebraic graph theory.",
    },
  ],
};
