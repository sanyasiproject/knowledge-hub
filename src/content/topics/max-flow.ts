import type { TopicContent } from "../types";

export const maxFlow: TopicContent = {
  quickSummary: [
    "Push as much flow as possible from **source** to **sink** without exceeding edge capacities; every augmenting-path algorithm works on the **residual graph**, not the original one.",
    "**Edmonds-Karp** (BFS augmenting paths) is **O(V·E²)**; **Dinic** (level graph + blocking flow) is **O(V²·E)**, and **O(E·√V)** on unit-capacity graphs. Space is **O(V + E)**.",
    "The hard part in interviews is not the algorithm — it is *modelling*: turning a scheduling, matching, or selection problem into a capacity network.",
  ],
  detailed: [
    "A residual graph tracks remaining capacity plus the ability to undo. Every directed edge `u -> v` with capacity `c` gets a reverse edge `v -> u` with capacity `0`. Pushing `b` units subtracts `b` from the forward residual and adds `b` to the reverse one, so a later path can cancel an earlier bad decision by routing through that reverse edge. Without reverse edges, greedy augmentation gets stuck at a non-optimal flow.\n\nKey insight: the reverse edge is not a real pipe — it is a record of a decision you are allowed to retract.",
    "An augmenting path is any s-t path in the residual graph with all capacities > 0. Send the bottleneck (minimum residual capacity on the path) and repeat. The flow is maximum exactly when no augmenting path remains.",
    "Dinic beats Edmonds-Karp by batching. A BFS assigns each node a level (distance from `s` in the residual graph), then a DFS pushes a *blocking flow* using only edges that go from level `k` to level `k+1`. Each phase strictly increases the s-t distance, so there are at most `V` phases. The `it[]` current-arc pointer is what makes each phase near-linear — without it, Dinic degenerates.\n\nCommon mistake: resetting `it[]` inside the inner DFS loop instead of once per BFS phase. That re-scans dead edges forever and turns O(V²E) into something much worse.",
    "Flow models a problem when you can express it as *units moving through a constrained network*: bipartite matching (capacity 1 everywhere), scheduling with per-worker limits, edge-disjoint paths (capacity 1 per edge), vertex capacities (split `v` into `v_in -> v_out` with the capacity on the split edge).",
  ],
  code: [
    {
      language: "cpp",
      caption: "Dinic: paired residual edges via e[i^1], level BFS, current-arc DFS",
      source: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

struct Dinic {
    struct Edge { int to; ll cap; };
    int n;
    vector<Edge> e;              // edges come in pairs: e[i^1] is the reverse of e[i]
    vector<vector<int>> g;       // g[u] = edge ids leaving u
    vector<int> level, it;       // it[u] = current-arc pointer

    explicit Dinic(int n_) : n(n_), g(n_), level(n_), it(n_) {}

    void addEdge(int u, int v, ll c) {
        g[u].push_back((int)e.size()); e.push_back({v, c});
        g[v].push_back((int)e.size()); e.push_back({u, 0});   // reverse, capacity 0
    }

    bool bfs(int s, int t) {
        fill(level.begin(), level.end(), -1);
        queue<int> q;
        level[s] = 0; q.push(s);
        while (!q.empty()) {
            int u = q.front(); q.pop();
            for (int id : g[u]) {
                int v = e[id].to;
                if (e[id].cap > 0 && level[v] < 0) {
                    level[v] = level[u] + 1;
                    q.push(v);
                }
            }
        }
        return level[t] >= 0;
    }

    ll dfs(int u, int t, ll f) {
        if (u == t || f == 0) return f;
        for (int &i = it[u]; i < (int)g[u].size(); ++i) {
            int id = g[u][i], v = e[id].to;
            if (e[id].cap <= 0 || level[v] != level[u] + 1) continue;
            ll d = dfs(v, t, min(f, e[id].cap));
            if (d > 0) {
                e[id].cap -= d;
                e[id ^ 1].cap += d;      // give capacity back to the reverse edge
                return d;
            }
        }
        return 0;                        // u is dead for this phase
    }

    ll maxflow(int s, int t) {
        ll flow = 0;
        while (bfs(s, t)) {
            fill(it.begin(), it.end(), 0);          // once per phase, not per path
            while (ll f = dfs(s, t, LLONG_MAX)) flow += f;
        }
        return flow;
    }
};`,
    },
    {
      language: "cpp",
      caption: "Vertex capacities: split each node so the limit sits on an edge",
      source: `// Node v with capacity cap[v] becomes v_in = v and v_out = v + n.
// Every original edge u -> w becomes u_out -> w_in.
Dinic build(int n, const vector<array<int, 2>>& edges, const vector<ll>& cap) {
    Dinic d(2 * n);
    for (int v = 0; v < n; ++v) d.addEdge(v, v + n, cap[v]);      // the vertex limit
    for (auto [u, w] : edges) d.addEdge(u + n, w, LLONG_MAX / 4); // u_out -> w_in
    return d;
}`,
    },
  ],
  diagrams: [
    {
      title: "The augmenting-path loop",
      kind: "flow",
      caption: "Every max-flow algorithm is this loop; they differ only in how they find the next path.",
      mermaid: `flowchart TD
    A["flow = 0; residual = original capacities"] --> B{"Augmenting path s to t in residual?"}
    B -- "no" --> C["Stop: flow is maximum"]
    B -- "yes" --> D["b = min residual capacity on the path"]
    D --> E["Forward edges -= b, reverse edges += b"]
    E --> F["flow = flow + b"]
    F --> B`,
    },
  ],
  comparison: {
    columns: ["Algorithm", "Path choice", "Time", "Use when"],
    rows: [
      ["Ford-Fulkerson", "Any path (DFS)", "O(E · maxflow)", "Tiny integer capacities only; can loop forever on irrationals"],
      ["Edmonds-Karp", "Shortest path (BFS)", "O(V · E²)", "Small graphs, easy to write correctly"],
      ["Dinic", "Blocking flow on level graph", "O(V² · E)", "Default choice for contests and interviews"],
      ["Dinic, unit capacities", "Same", "O(E · √V)", "Bipartite matching, edge-disjoint paths"],
    ],
  },
  cheatSheet: [
    "Dinic: O(V²·E) time, O(V + E) space; O(E·√V) with unit capacities.",
    "Store edges in one array; `e[i^1]` is the reverse — that pairing is why `addEdge` must always push two edges.",
    "Reverse edge starts at capacity 0 for a directed edge, at capacity `c` for an undirected one.",
    "`fill(it.begin(), it.end(), 0)` once per BFS phase, never inside the DFS.",
    "Use `long long` for capacities and flow; `INF = LLONG_MAX / 4` avoids overflow when summing.",
  ],
  interviewQA: [
    {
      q: "Why does the residual graph need reverse edges?",
      a: "Because greedy augmentation can make choices that are individually fine but globally wrong, and there must be a way to undo them. A reverse edge with residual capacity equal to the flow already pushed lets a later augmenting path route backwards, cancelling that many units and rerouting them elsewhere. Without reverse edges the algorithm terminates at a maximal (no path left) but not maximum flow. The max-flow min-cut theorem's proof also depends on them: when no augmenting path exists, the set of nodes reachable from s in the residual graph defines a cut whose capacity equals the flow, and that argument needs residual capacity in both directions.",
      followUps: ["How do you model an undirected edge of capacity c?", "What changes if capacities are real numbers?"],
    },
    {
      q: "How would you decide that a problem is a max-flow problem?",
      a: "Look for three signals: a conserved quantity moving from one side to another, hard per-unit capacity limits, and an objective that is 'as many as possible' rather than 'shortest' or 'cheapest'. Concretely, if you can name a source, a sink, and edges whose capacities encode each constraint, it is flow. Bipartite matching is the canonical case — source to every left node with capacity 1, original edges with capacity 1, every right node to sink with capacity 1. Limits on nodes rather than edges are handled by splitting the node into v_in and v_out with the capacity on the connecting edge. If the objective mixes 'as many as possible' with 'as cheap as possible', it becomes min-cost max-flow instead.",
    },
  ],
  flashcards: [
    { front: "Dinic time and space complexity?", back: "O(V²·E) time in general, O(E·√V) with unit capacities; O(V + E) space." },
    { front: "Why is `e[i^1]` the reverse edge?", back: "Edges are pushed in pairs starting at index 0, so a forward edge at an even index i pairs with the reverse at i+1, and XOR with 1 toggles between them." },
    { front: "How do you enforce a capacity on a vertex, not an edge?", back: "Split v into v_in -> v_out with an edge of that capacity; all incoming edges land on v_in, all outgoing leave v_out." },
  ],
};
