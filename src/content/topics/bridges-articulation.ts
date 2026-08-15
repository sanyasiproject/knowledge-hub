import type { TopicContent } from "../types";

export const bridgesArticulation: TopicContent = {
  quickSummary: [
    "A **bridge** is an edge whose removal disconnects the graph; an **articulation point** (cut vertex) is a vertex whose removal does. Both are single points of failure.",
    "One DFS finds all of them using Tarjan's **low-link**: `tin[u]` = discovery time, `low[u]` = earliest `tin` reachable from `u`'s subtree using at most one back edge.",
    "**O(V + E)** time, **O(V + E)** space (adjacency list, `tin`, `low`, and the recursion stack).",
  ],
  detailed: [
    "A DFS on an undirected graph produces only tree edges and back edges — no cross edges. That is the fact everything rests on: if the subtree rooted at `v` can reach an ancestor of `u`, there is a cycle through the edge `(u, v)`, so that edge is redundant.",
    "`low[v] > tin[u]` means bridge. It says nothing in `v`'s subtree can reach `u` or anything above `u` except through the edge `(u, v)` itself, so cutting that edge severs the subtree. The articulation condition relaxes the inequality to `low[v] >= tin[u]`: the subtree can reach `u` but no higher, so deleting the *vertex* `u` isolates it.\n\nKey insight: strict `>` for bridges, `>=` for articulation points — the difference is whether reaching `u` itself still counts as escaping.",
    "The DFS root is a special case for vertices, not for edges. The root has no parent to be cut off from, so it is an articulation point exactly when it has more than one DFS child. A root with a single child is not.\n\nCommon mistake: skipping the parent by comparing vertex ids (`if (v == parent) continue;`). With parallel edges between `u` and `v` that wrongly ignores a genuine second edge and reports a bridge that does not exist. Skip by *edge id* instead.",
    "In network terms, bridges are links with no redundant route and articulation points are routers or services whose failure partitions the topology. Running this on a service dependency graph or a datacentre link map produces exactly the list of components that need a redundant peer. Contracting all non-bridge edges yields the **bridge tree** (2-edge-connected components condensed), where every remaining edge is a bridge.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Tarjan low-link: bridges and articulation points in one DFS",
      source: `#include <bits/stdc++.h>
using namespace std;

int n, timer_ = 0;
vector<vector<pair<int, int>>> adj;   // adj[u] = {neighbour, edge id}
vector<int> tin, low;
vector<char> visited, isArticulation;
vector<int> bridges;                  // edge ids

void dfs(int u, int parentEdge) {
    visited[u] = 1;
    tin[u] = low[u] = timer_++;
    int children = 0;

    for (auto [v, id] : adj[u]) {
        if (id == parentEdge) continue;        // skip by EDGE id, not vertex id
        if (visited[v]) {
            low[u] = min(low[u], tin[v]);      // back edge: use tin, never low
        } else {
            dfs(v, id);
            low[u] = min(low[u], low[v]);      // tree edge: absorb child's low
            if (low[v] > tin[u]) bridges.push_back(id);
            if (low[v] >= tin[u] && parentEdge != -1) isArticulation[u] = 1;
            ++children;
        }
    }
    if (parentEdge == -1 && children > 1) isArticulation[u] = 1;   // root rule
}

void run() {
    tin.assign(n, -1); low.assign(n, -1);
    visited.assign(n, 0); isArticulation.assign(n, 0);
    bridges.clear(); timer_ = 0;
    for (int u = 0; u < n; ++u)
        if (!visited[u]) dfs(u, -1);           // handles disconnected graphs
}`,
    },
    {
      language: "cpp",
      caption: "Bridge tree: contract 2-edge-connected components into a forest",
      source: `// After run(): mark bridge ids, then flood-fill components without crossing them.
vector<int> comp;                              // comp[v] = 2-edge-connected component id

int buildBridgeTree(vector<pair<int, int>>& treeEdges) {
    vector<char> isBridge(adj.size() * 2, 0);  // sized by edge count
    for (int id : bridges) isBridge[id] = 1;

    comp.assign(n, -1);
    int c = 0;
    for (int s = 0; s < n; ++s) {
        if (comp[s] != -1) continue;
        queue<int> q; q.push(s); comp[s] = c;
        while (!q.empty()) {
            int u = q.front(); q.pop();
            for (auto [v, id] : adj[u])
                if (!isBridge[id] && comp[v] == -1) { comp[v] = c; q.push(v); }
        }
        ++c;
    }
    for (int u = 0; u < n; ++u)
        for (auto [v, id] : adj[u])
            if (isBridge[id] && comp[u] < comp[v])
                treeEdges.push_back({comp[u], comp[v]});
    return c;                                   // number of nodes in the bridge tree
}`,
    },
  ],
  diagrams: [
    {
      title: "Low-link decision at edge u -> v",
      kind: "flow",
      caption: "One DFS, two conditions: strict inequality flags a bridge, non-strict flags an articulation point.",
      mermaid: `flowchart TD
    A["dfs(u): tin[u] = low[u] = timer++"] --> B{"Neighbour v via edge id"}
    B -- "id == parent edge" --> C["Skip"]
    B -- "v already visited" --> D["low[u] = min(low[u], tin[v])"]
    B -- "v unvisited" --> E["dfs(v); low[u] = min(low[u], low[v])"]
    E --> F{"low[v] > tin[u]?"}
    F -- "yes" --> G["Edge (u, v) is a bridge"]
    F -- "no" --> H{"low[v] >= tin[u] and u is not the root?"}
    H -- "yes" --> I["u is an articulation point"]
    H -- "no" --> J["Nothing critical here"]`,
    },
  ],
  cheatSheet: [
    "O(V + E) time and O(V + E) space; one DFS finds both bridges and articulation points.",
    "Bridge: `low[v] > tin[u]`. Articulation (non-root): `low[v] >= tin[u]`. Root: more than one DFS child.",
    "Back edge updates use `tin[v]`, tree edges use `low[v]` — mixing them silently breaks results.",
    "Skip the parent by edge id so parallel edges are handled correctly.",
    "Loop over all vertices as DFS roots; the graph may be disconnected.",
  ],
  interviewQA: [
    {
      q: "Why does `low[v] > tin[u]` mean the edge (u, v) is a bridge?",
      a: "low[v] is the smallest discovery time reachable from v's DFS subtree using tree edges plus at most one back edge. If that value is strictly greater than tin[u], nothing in the subtree can reach u or any ancestor of u by an alternative route — every escape path goes through the tree edge (u, v). Removing it therefore disconnects the subtree, which is the definition of a bridge. The strictness matters: low[v] == tin[u] means a back edge lands exactly on u, so the edge lies on a cycle and is not a bridge, though u itself becomes an articulation point in that case. The whole computation is a single DFS in O(V + E) time and O(V + E) space, and it relies on undirected DFS producing no cross edges.",
      followUps: ["Why must the back-edge update use tin[v] rather than low[v]?", "How do parallel edges change the answer?"],
    },
    {
      q: "How would you use this to audit a network for single points of failure?",
      a: "Model devices as vertices and links as edges, then run one Tarjan pass. Articulation points are devices whose failure partitions the network — those need a redundant peer or a bypass path. Bridges are links with no alternative route — those need a second physical path or a diverse carrier. Contracting every non-bridge edge produces the bridge tree, whose nodes are 2-edge-connected regions that stay internally reachable under any single link failure and whose edges are exactly the fragile links, which makes it a good executive-level view. Complexity is O(V + E), so it scales to very large topologies. Two caveats worth stating: the analysis assumes single failures only, and it treats the graph as undirected, so asymmetric routing or one-way policy filters need a strongly-connected-components analysis instead.",
    },
  ],
  flashcards: [
    { front: "Bridge condition vs articulation point condition?", back: "Bridge: low[v] > tin[u]. Articulation (non-root u): low[v] >= tin[u]. Root: articulation iff it has more than one DFS child." },
    { front: "Complexity of finding all bridges and cut vertices?", back: "O(V + E) time, O(V + E) space, in a single DFS." },
    { front: "Why skip the parent by edge id rather than vertex id?", back: "Parallel edges between u and v are real alternative routes; skipping by vertex id ignores them and falsely reports a bridge." },
  ],
};
