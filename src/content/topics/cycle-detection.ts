import type { TopicContent } from "../types";

export const cycleDetection: TopicContent = {
  quickSummary: [
    "Undirected and directed cycle detection are **different algorithms** — the undirected test needs a parent skip, the directed test needs a recursion-stack check.",
    "Undirected: DFS with parent skip, or DSU (union two endpoints; an edge whose endpoints already share a root closes a cycle).",
    "Directed: white/grey/black DFS where a grey neighbour is a back edge, or Kahn's leftover count. All variants are O(V + E) time and O(V) space.",
  ],
  detailed: [
    `The single thing to get right here is that the undirected and directed cases are not the same problem with a flag flipped. Applying the undirected rule to a digraph reports cycles that do not exist; applying the directed rule to an undirected graph reports a cycle for every single edge.

Reason: an undirected edge u—v is stored twice in the adjacency list, once in each direction. So from v you immediately see u as "already visited" — which looks like a back edge but is just the edge you arrived on.`,
    `## Undirected graphs

**DFS with parent skip.** Recurse carrying the vertex you came from. An edge to an already-visited vertex that is *not* the parent is a real back edge and closes a cycle.

Common mistake: skipping by parent *vertex* breaks with parallel edges — two distinct edges between u and v are a valid 2-cycle, but the parent check swallows the second one. Skip by parent *edge id* if multi-edges are possible. Self-loops are always a cycle and must be handled explicitly.

**DSU alternative.** Process each edge once: if find(u) == find(v) the edge closes a cycle, else union them. O(E * alpha(V)) — effectively linear — and it is the natural choice when edges arrive as a stream or you are already running Kruskal's.`,
    `## Directed graphs

**Colour DFS.** white = unvisited, grey = on the current recursion stack, black = finished. From u, an edge to a grey vertex is a back edge and proves a cycle. An edge to a *black* vertex is a forward or cross edge and is harmless — this is the second classic bug: using a plain boolean visited array flags every re-encounter and reports phantom cycles.

**Kahn's leftover.** Run in-degree BFS; if fewer than V vertices are emitted, the leftovers are exactly the vertices on or reachable-into a cycle. No colours, no recursion — the preferred answer when you already need a topological order.`,
    `## Choosing

| graph | method | cost | notes |
| --- | --- | --- | --- |
| undirected | DFS + parent skip | O(V + E) | watch parallel edges |
| undirected | DSU | O(E * alpha(V)) | streaming / incremental edges |
| directed | 3-colour DFS | O(V + E) | also recovers the cycle itself |
| directed | Kahn's leftover | O(V + E) | free if you want a topo order too |

In practice: state which case you are in before writing a line of code. Interviewers deliberately leave "graph" ambiguous to see whether you ask.`,
  ],
  code: [
    {
      language: "cpp",
      caption: "Undirected — DFS with parent skip (0-indexed, handles all components)",
      source: `#include <bits/stdc++.h>
using namespace std;

// Skip by PARENT EDGE ID so parallel edges are detected correctly.
// adj[u] holds pairs (neighbour, edge id).
bool hasCycleUndirected(int n, const vector<vector<pair<int,int>>>& adj) {
    vector<char> visited(n, 0);

    // Iterative-friendly recursive helper.
    function<bool(int,int)> dfs = [&](int u, int parentEdge) -> bool {
        visited[u] = 1;
        for (auto [v, id] : adj[u]) {
            if (id == parentEdge) continue;   // the edge we arrived on
            if (visited[v]) return true;      // back edge -> cycle
            if (dfs(v, id)) return true;
        }
        return false;
    };

    for (int v = 0; v < n; ++v)
        if (!visited[v] && dfs(v, -1)) return true;
    return false;
}

// DSU alternative: O(E * alpha(V)). Assumes no self-loops (those are cycles
// by definition and should be checked first).
struct DSU {
    vector<int> p, r;
    explicit DSU(int n) : p(n), r(n, 0) { iota(p.begin(), p.end(), 0); }
    int find(int x) { return p[x] == x ? x : p[x] = find(p[x]); }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;             // already connected -> cycle
        if (r[a] < r[b]) swap(a, b);
        p[b] = a;
        if (r[a] == r[b]) ++r[a];
        return true;
    }
};

bool hasCycleDSU(int n, const vector<pair<int,int>>& edges) {
    DSU dsu(n);
    for (auto [u, v] : edges) {
        if (u == v) return true;              // self-loop
        if (!dsu.unite(u, v)) return true;
    }
    return false;
}`,
    },
    {
      language: "cpp",
      caption: "Directed — 3-colour DFS that also recovers one cycle",
      source: `#include <bits/stdc++.h>
using namespace std;

// color: 0 white (unvisited), 1 grey (on stack), 2 black (finished).
// Returns the vertices of one cycle in order, or an empty vector if acyclic.
// O(V + E) time, O(V) space.
vector<int> findDirectedCycle(int n, const vector<vector<int>>& adj) {
    vector<int> color(n, 0), par(n, -1);
    int cycleStart = -1, cycleEnd = -1;

    function<bool(int)> dfs = [&](int u) -> bool {
        color[u] = 1;
        for (int v : adj[u]) {
            if (color[v] == 0) {
                par[v] = u;
                if (dfs(v)) return true;
            } else if (color[v] == 1) {       // GREY only -- black is fine
                cycleStart = v;
                cycleEnd = u;
                return true;
            }
        }
        color[u] = 2;
        return false;
    };

    for (int v = 0; v < n && cycleStart == -1; ++v)
        if (color[v] == 0) dfs(v);

    if (cycleStart == -1) return {};

    vector<int> cycle;
    for (int v = cycleEnd; v != cycleStart; v = par[v]) cycle.push_back(v);
    cycle.push_back(cycleStart);
    reverse(cycle.begin(), cycle.end());
    return cycle;
}`,
    },
  ],
  diagrams: [
    {
      title: "Why the parent skip is needed",
      kind: "state",
      caption:
        "Undirected edge U—V is stored both ways; without the parent skip, arriving at V and looking back at U falsely reads as a back edge.",
      mermaid: `stateDiagram-v2
    [*] --> AtU: start DFS at U
    AtU --> AtV: follow edge U to V
    AtV --> Skip: sees U visited and U IS the parent
    AtV --> Cycle: sees W visited and W is NOT the parent
    Skip: not a cycle
    Cycle: real back edge
    Skip --> AtV: ignore and continue
    Cycle --> [*]: report cycle`,
    },
  ],
  cheatSheet: [
    "Undirected != directed. Ask which one before coding.",
    "Undirected DFS: skip the parent EDGE, not the parent vertex (parallel edges).",
    "Directed DFS: only a GREY neighbour is a cycle; black neighbours are forward/cross edges and harmless.",
    "Kahn's: emitted count < V means a cycle. Zero extra code if you already need a topo order.",
    "DSU for undirected: find(u) == find(v) before union means this edge closes a cycle. O(E * alpha(V)).",
    "All approaches O(V + E) time, O(V) space.",
  ],
  interviewQA: [
    {
      q: "Why can't you use the same cycle-detection code for undirected and directed graphs?",
      a: "In an undirected adjacency list every edge appears twice, once per endpoint. So after walking u -> v, the vertex v immediately sees u marked visited, and a naive back-edge rule would call that a cycle even though it is the very edge you traversed. The undirected algorithm therefore carries the parent and ignores it. In a directed graph the opposite trap applies: an edge to a visited vertex is not necessarily a cycle, because the target may be in an already-finished branch — a forward or cross edge. You must distinguish 'visited and still on the recursion stack' from 'visited and finished', which is why the directed version needs three colours rather than a boolean. Using the boolean version on a digraph reports cycles in perfectly acyclic DAGs like A->B, A->C, B->C.",
      followUps: [
        "How do you also output the vertices of the cycle, not just a yes/no?",
        "What if the undirected graph can contain parallel edges or self-loops?",
      ],
    },
    {
      q: "You need cycle detection on an undirected graph where edges arrive one at a time. What do you use?",
      a: "Disjoint Set Union. Maintain a DSU over the V vertices; for each incoming edge (u, v), if find(u) == find(v) the two endpoints are already connected, so this edge closes a cycle — report it. Otherwise union them. With path compression and union by rank the total cost is O(E * alpha(V)), essentially linear, and it is fully incremental: no need to re-run a traversal after each edge, which DFS would require. The caveat is that plain DSU is undirected-only and does not support edge deletion, so a dynamic graph with removals needs something heavier such as link-cut trees. Self-loops must be special-cased since find(u) == find(u) trivially.",
    },
  ],
  flashcards: [
    {
      front: "Directed cycle detection: which vertex colour signals a cycle?",
      back: "Grey — still on the recursion stack. A black (finished) neighbour is a forward or cross edge, not a cycle.",
    },
    {
      front: "What does the parent skip do in undirected DFS, and how can it be wrong?",
      back: "It ignores the edge you arrived on, which appears in both directions. Skipping by parent vertex misses genuine parallel-edge cycles — skip by edge id instead.",
    },
    {
      front: "How does Kahn's algorithm detect a cycle?",
      back: "Fewer than V vertices are emitted; the leftovers never reached in-degree 0 because they sit on or downstream of a cycle. O(V + E).",
    },
  ],
};
