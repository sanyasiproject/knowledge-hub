import type { TopicContent } from "../types";

export const minimumSpanningTree: TopicContent = {
  quickSummary: [
    "An MST connects all V vertices with exactly **V − 1** edges at minimum total weight (undirected, connected graph).",
    "**Kruskal**: sort edges, add each one whose endpoints are in different DSU components — **O(E log E)** time, **O(V + E)** space.",
    "**Prim**: grow one tree, always taking the cheapest edge crossing the frontier — **O(E log V)** with a heap, **O(V²)** with a plain array on dense graphs.",
  ],
  detailed: [
    "Both algorithms are the same greedy theorem applied differently. The **cut property** says: for any partition of the vertices into two sides, the lightest edge crossing that cut belongs to some MST. Kruskal applies it globally by weight order; Prim applies it to the single cut between the built tree and everything else.",
    "Kruskal sorts all edges, then walks them cheapest-first and uses union-find to reject any edge whose endpoints are already connected (it would close a cycle). Sorting dominates at O(E log E); the DSU work is O(E · α(V)). It is the natural choice on **sparse** graphs and when edges arrive as a plain list.",
    "Prim starts at one vertex and repeatedly pulls the cheapest edge leaving the current tree, using a priority queue keyed by “cheapest known edge into this vertex”. With a binary heap that is O(E log V). On **dense** graphs (E ≈ V²) the array version — scan all vertices to find the minimum key each round — is O(V²) and beats the heap.\n\nIn practice: Kruskal for sparse and for anything that already needs a DSU; Prim's O(V²) variant for dense adjacency-matrix inputs.",
    "Uniqueness has a caveat.\n\nKey insight: the MST is unique only if all edge weights are distinct. With ties there can be many MSTs — all with the same total weight, but different edge sets. Problems asking “is the MST unique?” or “count MSTs” hinge on this; the usual test is to check, for each weight class, whether the edges that could be used are forced.\n\nCommon mistake: running MST on a disconnected graph and reporting a total. Check that you accepted exactly V − 1 edges, otherwise the result is a spanning forest, not a tree.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Kruskal — sort edges + DSU",
      source: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

struct Edge { int u, v; ll w; };

struct DSU {
    vector<int> p, sz;
    explicit DSU(int n) : p(n), sz(n, 1) { iota(p.begin(), p.end(), 0); }
    int find(int x) { while (p[x] != x) { p[x] = p[p[x]]; x = p[x]; } return x; }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (sz[a] < sz[b]) swap(a, b);
        p[b] = a; sz[a] += sz[b];
        return true;
    }
};

// returns {total weight, chosen edges}; empty edge list if disconnected
pair<ll, vector<Edge>> kruskal(int n, vector<Edge> edges) {
    sort(edges.begin(), edges.end(),
         [](const Edge& a, const Edge& b) { return a.w < b.w; });

    DSU dsu(n);
    ll total = 0;
    vector<Edge> mst;
    for (const auto& e : edges) {
        if (dsu.unite(e.u, e.v)) {       // skips cycle-forming edges
            total += e.w;
            mst.push_back(e);
            if ((int)mst.size() == n - 1) break;   // done early
        }
    }
    if ((int)mst.size() != n - 1) return {0, {}};  // graph is disconnected
    return {total, mst};
}`,
    },
    {
      language: "cpp",
      caption: "Prim — grow one tree with a min-heap",
      source: `// adj[u] = list of (v, w)
ll prim(int n, const vector<vector<pair<int, int>>>& adj) {
    vector<char> inTree(n, 0);
    priority_queue<pair<ll, int>, vector<pair<ll, int>>,
                   greater<pair<ll, int>>> pq;

    ll total = 0;
    int taken = 0;
    pq.push({0, 0});                     // start from vertex 0, cost 0

    while (!pq.empty()) {
        auto [w, u] = pq.top();
        pq.pop();
        if (inTree[u]) continue;         // stale entry
        inTree[u] = 1;
        total += w;
        ++taken;
        for (auto [v, wt] : adj[u])
            if (!inTree[v]) pq.push({wt, v});
    }
    return taken == n ? total : -1;      // -1 = disconnected
}`,
    },
  ],
  diagrams: [
    {
      title: "Kruskal's accept/reject test",
      kind: "flow",
      caption: "Each edge, cheapest first, is accepted only if it joins two different DSU components.",
      mermaid: `flowchart TD
    A["Sort all edges by weight"] --> B["Take next cheapest edge (u, v)"]
    B --> C{"find(u) == find(v)?"}
    C -- "yes" --> D["Reject: would form a cycle"]
    C -- "no" --> E["Accept: unite(u, v), add w to total"]
    D --> F{"Accepted V - 1 edges?"}
    E --> F
    F -- "no" --> B
    F -- "yes" --> G["MST complete"]`,
    },
  ],
  cheatSheet: [
    "MST has exactly V − 1 edges; fewer accepted ⇒ graph is disconnected.",
    "Kruskal: O(E log E) time, O(V + E) space. Best on sparse graphs.",
    "Prim (heap): O(E log V); Prim (array): O(V²), best on dense graphs.",
    "Cut property: the lightest edge across any cut is in some MST.",
    "Unique MST ⟺ all edge weights distinct (sufficient condition).",
    "Maximum spanning tree: negate weights, or sort descending.",
  ],
  interviewQA: [
    {
      q: "Kruskal or Prim — how do you choose?",
      a: "It comes down to density and input format. Kruskal is O(E log E), dominated by the sort, and needs only an edge list plus a DSU — ideal for sparse graphs (E ≈ V) and when edges are already sorted or sortable in linear time. Prim with a binary heap is O(E log V), similar for sparse graphs, but on dense graphs (E ≈ V²) Kruskal's sort costs O(V² log V) while the array-based Prim is a flat O(V²) with no heap overhead, so Prim wins. Prim also fits streaming/adjacency-matrix inputs better since it never materializes the full edge list. Both produce an MST of the same total weight.",
      followUps: ["How would you handle a graph too large to fit the edge list in memory?"],
    },
    {
      q: "Why is Kruskal's greedy choice correct?",
      a: "By the cut property: for any cut of the vertices, a minimum-weight edge crossing that cut is in some MST. When Kruskal considers the cheapest remaining edge (u, v) and finds u and v in different DSU components, take the cut separating u's component from the rest — every crossing edge has weight at least w(u,v), because all cheaper edges were already processed and none connected these components. So (u, v) is a lightest crossing edge and is safe to add. Rejected edges are exactly those whose endpoints are already connected, and adding one would create a cycle without improving anything.",
    },
  ],
  flashcards: [
    { front: "Kruskal vs Prim complexity?", back: "Kruskal O(E log E) with DSU; Prim O(E log V) with a heap or O(V²) with an array. Both O(V + E) space." },
    { front: "State the cut property.", back: "For any partition of the vertices, the minimum-weight edge crossing the cut belongs to some MST." },
    { front: "When is the MST unique?", back: "When all edge weights are distinct. Ties can yield multiple MSTs with identical total weight." },
  ],
};
