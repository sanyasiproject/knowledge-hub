import type { TopicContent } from "../types";

export const bellmanFord: TopicContent = {
  quickSummary: [
    "Relax **every** edge **V − 1** times — that is enough because any shortest path has at most V − 1 edges.",
    "A successful relaxation on a **V-th** round proves a negative cycle is reachable from the source.",
    "**O(V · E)** time, **O(V)** space. Slower than Dijkstra, but it is the one that survives negative weights.",
  ],
  detailed: [
    "Bellman-Ford is dynamic programming over path length. After round k, `dist[v]` is the cheapest path from the source to v using at most k edges. Since a shortest simple path visits at most V nodes, it has at most V − 1 edges, so V − 1 rounds converge.",
    "The V-th round is the negative-cycle detector. If any edge still relaxes after V − 1 rounds, no finite answer exists along that route — you can loop the cycle forever and keep getting cheaper.\n\nKey insight: the V-th round detects cycles *reachable from the source*. To find negative cycles anywhere in the graph, add a virtual node with a 0-weight edge to every vertex and start there.",
    "You reach for it when weights can be negative: currency arbitrage (take −log of exchange rates, a negative cycle is a profitable loop), scheduling with rewards and penalties, and difference constraint systems (x_j − x_i ≤ w becomes an edge i → j of weight w).\n\nIn practice: SPFA (queue-based Bellman-Ford) is much faster on typical graphs but still O(V · E) worst case, and adversarial tests target it. On sparse graphs prefer plain Bellman-Ford with an early exit.",
    "Two implementation guards matter. Break out early if a full round makes no change — that is the common case and it turns many runs into a couple of passes. And skip relaxing from an unreached vertex (`dist[u] == INF`), otherwise `INF + w` overflows and manufactures bogus distances.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Bellman-Ford with early exit and negative-cycle detection",
      source: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

struct Edge { int u, v; ll w; };
const ll INF = (ll)4e18;

// returns false if a negative cycle is reachable from src
bool bellmanFord(int n, int src, const vector<Edge>& edges, vector<ll>& dist) {
    dist.assign(n, INF);
    dist[src] = 0;

    for (int round = 0; round < n - 1; ++round) {
        bool changed = false;
        for (const auto& e : edges) {
            if (dist[e.u] == INF) continue;         // avoid INF + w overflow
            if (dist[e.u] + e.w < dist[e.v]) {
                dist[e.v] = dist[e.u] + e.w;
                changed = true;
            }
        }
        if (!changed) break;                        // converged early
    }

    // V-th round: any further relaxation means a negative cycle
    for (const auto& e : edges) {
        if (dist[e.u] == INF) continue;
        if (dist[e.u] + e.w < dist[e.v]) return false;
    }
    return true;
}`,
    },
    {
      language: "cpp",
      caption: "Recovering the vertices on a negative cycle",
      source: `// After n rounds, remember which vertex relaxed last.
vector<int> findNegativeCycle(int n, const vector<Edge>& edges) {
    vector<ll> dist(n, 0);        // dist all 0 = virtual super-source
    vector<int> parent(n, -1);
    int last = -1;

    for (int i = 0; i < n; ++i) {
        last = -1;
        for (const auto& e : edges) {
            if (dist[e.u] + e.w < dist[e.v]) {
                dist[e.v] = dist[e.u] + e.w;
                parent[e.v] = e.u;
                last = e.v;
            }
        }
    }
    if (last == -1) return {};    // no negative cycle

    int v = last;
    for (int i = 0; i < n; ++i) v = parent[v];   // step into the cycle

    vector<int> cycle;
    for (int cur = v;; cur = parent[cur]) {
        cycle.push_back(cur);
        if (cur == v && cycle.size() > 1) break;
    }
    reverse(cycle.begin(), cycle.end());
    return cycle;
}`,
    },
  ],
  diagrams: [
    {
      title: "Round structure",
      kind: "flow",
      caption: "V − 1 relaxation rounds converge; a relaxation on the V-th round is the negative-cycle signal.",
      mermaid: `flowchart TD
    A["dist[src] = 0, rest = INF"] --> B["Round k: relax all E edges"]
    B --> C{"Any change?"}
    C -- "no" --> D["Converged: exit early"]
    C -- "yes" --> E{"k < V - 1?"}
    E -- "yes" --> B
    E -- "no" --> F["Extra V-th round"]
    F --> G{"Still relaxes?"}
    G -- "yes" --> H["Negative cycle reachable"]
    G -- "no" --> I["dist[] is final"]`,
    },
  ],
  cheatSheet: [
    "Time O(V · E), space O(V). Works with negative weights.",
    "V − 1 rounds converge; the V-th round detects negative cycles.",
    "Guard `if (dist[u] == INF) continue;` to avoid overflow.",
    "Early-exit when a round changes nothing.",
    "Arbitrage: edge weight = −log(rate); a negative cycle is a profit loop.",
  ],
  interviewQA: [
    {
      q: "Why exactly V − 1 rounds, and what does the V-th round tell you?",
      a: "A shortest path in a graph with no negative cycles is simple, so it uses at most V vertices and therefore at most V − 1 edges. Round k guarantees all shortest paths with at most k edges are correct, so V − 1 rounds finish the job regardless of edge processing order. If a V-th round still relaxes an edge, some path is improving beyond V − 1 edges, which is only possible if it repeats a vertex on a cycle of negative total weight reachable from the source.",
      followUps: ["How would you detect a negative cycle anywhere, not just reachable from src?"],
    },
    {
      q: "When would you choose Bellman-Ford over Dijkstra?",
      a: "Only when weights can be negative, or you must decide whether a negative cycle exists. Dijkstra is asymptotically far better — O((V+E) log V) versus O(V·E) — but its greedy finalization is unsound with negative edges. Typical Bellman-Ford use cases: currency arbitrage detection with weights of −log(rate), difference constraint systems, and as the first phase of Johnson's algorithm, which runs Bellman-Ford once from a virtual source to compute potentials, then reweights edges to be non-negative and runs Dijkstra from every vertex.",
    },
  ],
  flashcards: [
    { front: "Bellman-Ford complexity?", back: "O(V · E) time, O(V) space." },
    { front: "How is a negative cycle detected?", back: "Run one extra (V-th) relaxation round; if any edge still relaxes, a negative cycle is reachable from the source." },
    { front: "Why guard `dist[u] == INF` before relaxing?", back: "INF + w overflows and creates fake finite distances from unreachable vertices." },
  ],
};
