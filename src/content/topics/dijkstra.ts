import type { TopicContent } from "../types";

export const dijkstra: TopicContent = {
  quickSummary: [
    "Single-source shortest paths on graphs with **non-negative** edge weights, using a greedy “always expand the closest unfinished node” rule.",
    "Binary-heap implementation runs in **O((V + E) log V)** time and **O(V + E)** space (adjacency list + heap + dist array).",
    "The practical version uses *lazy deletion*: push duplicates, and skip an entry when the popped distance is stale.",
  ],
  detailed: [
    "Dijkstra grows a set of finalized nodes one at a time. It repeatedly picks the unfinalized node with the smallest tentative distance, declares that distance final, and relaxes its outgoing edges. The greedy choice is safe because with non-negative weights, no path that leaves the finalized set can come back cheaper than the direct one already found.",
    "Negative edges break the correctness proof, not just the performance. Once a node is popped it is never reconsidered, so a negative edge discovered later could have shortened a path that was already locked in.\n\nCommon mistake: adding a large constant to every edge to make weights non-negative. That penalizes paths by the number of edges, so it changes which path is shortest. Use Bellman-Ford instead.",
    "Real implementations do not use `decrease-key`. Standard priority queues cannot cheaply lower an existing key, so we push a new `(dist, node)` pair every time we improve a node and let the old entry rot in the heap.\n\nKey insight: when you pop `(d, u)` and `d > dist[u]`, that entry is stale — `continue`. Without this guard each node can be expanded many times and the complexity degrades.",
    "Use `long long` for distances. Summing many `1e9`-scale weights overflows a 32-bit int, and the classic `INT_MAX` sentinel overflows the moment you compute `dist[u] + w`.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Dijkstra with a min-heap and the stale-entry skip",
      source: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

const ll INF = (ll)4e18;

// adj[u] = list of (v, w) with w >= 0
vector<ll> dijkstra(int src, const vector<vector<pair<int, int>>>& adj) {
    int n = (int)adj.size();
    vector<ll> dist(n, INF);
    priority_queue<pair<ll, int>, vector<pair<ll, int>>,
                   greater<pair<ll, int>>> pq;

    dist[src] = 0;
    pq.push({0, src});

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();
        if (d > dist[u]) continue;          // stale entry: already improved
        for (auto [v, w] : adj[u]) {
            if (d + w < dist[v]) {
                dist[v] = d + w;
                pq.push({dist[v], v});      // lazy insert, no decrease-key
            }
        }
    }
    return dist;
}`,
    },
    {
      language: "cpp",
      caption: "Path reconstruction via a parent array",
      source: `vector<ll> dist;      // filled by dijkstra()
vector<int> parent;   // parent[src] = -1, set during relaxation

vector<int> shortestPath(int src, int dst,
                         const vector<vector<pair<int, int>>>& adj) {
    // ... run dijkstra, and inside the relaxation set parent[v] = u ...
    vector<int> path;
    if (dist[dst] == INF) return path;      // unreachable
    for (int cur = dst; cur != -1; cur = parent[cur]) path.push_back(cur);
    reverse(path.begin(), path.end());
    return path;                            // src -> ... -> dst
}`,
    },
  ],
  diagrams: [
    {
      title: "One relaxation step",
      kind: "flow",
      caption: "Pop the closest node, discard it if the distance is stale, otherwise relax its edges and push improved neighbors.",
      mermaid: `flowchart TD
    A["Pop (d, u) from min-heap"] --> B{"d > dist[u]?"}
    B -- "yes" --> C["Stale entry: skip"]
    B -- "no" --> D["Finalize u"]
    D --> E["For each edge (u, v, w)"]
    E --> F{"d + w < dist[v]?"}
    F -- "yes" --> G["dist[v] = d + w; push (dist[v], v)"]
    F -- "no" --> H["Leave dist[v] alone"]
    C --> A
    G --> A
    H --> A`,
    },
  ],
  comparison: {
    columns: ["Algorithm", "Handles negative", "Complexity", "Use when"],
    rows: [
      ["BFS", "No weights at all", "O(V + E)", "All edges have equal weight"],
      ["0-1 BFS (deque)", "No", "O(V + E)", "Every weight is 0 or 1"],
      ["Dijkstra (binary heap)", "No", "O((V + E) log V)", "Non-negative weights, single source"],
      ["Bellman-Ford", "Yes, and detects negative cycles", "O(V · E)", "Negative weights, or you must prove a negative cycle exists"],
      ["Floyd-Warshall", "Yes (no negative cycles)", "O(V³) time, O(V²) space", "All-pairs distances with small V (roughly V ≤ 500)"],
    ],
  },
  cheatSheet: [
    "Time O((V + E) log V), space O(V + E). Non-negative weights only.",
    "`priority_queue<pair<ll,int>, vector<pair<ll,int>>, greater<>>` gives a min-heap.",
    "Always `if (d > dist[u]) continue;` after popping.",
    "Use `long long` and an INF like 4e18, never `INT_MAX`.",
    "Multi-source: push every source at distance 0 before the loop.",
  ],
  interviewQA: [
    {
      q: "Why does Dijkstra fail on negative edge weights?",
      a: "The algorithm finalizes a node the moment it is popped, relying on the invariant that any future path to it must be at least as long. That invariant holds only when all weights are non-negative — extending a path can never shorten it. With a negative edge, a longer-looking path can later become cheaper, but the node is already locked in and never revisited. Shifting all weights up by a constant does not fix it, because that adds cost proportional to path length and changes the optimum. Use Bellman-Ford, or Johnson's algorithm for all-pairs with negative edges.",
      followUps: ["What if only edges leaving the source are negative?", "How does Johnson's reweighting keep distances correct?"],
    },
    {
      q: "Why push duplicates into the heap instead of using decrease-key?",
      a: "std::priority_queue has no decrease-key, and heaps that support it (Fibonacci heaps) have poor constants. The lazy approach pushes a new pair on every improvement, so the heap holds at most O(E) entries; each pop is O(log E) = O(log V), giving the same O((V + E) log V) bound. Correctness comes from the stale-entry guard: an entry whose distance exceeds the current dist[u] is skipped, so each node is expanded exactly once. Memory rises from O(V) to O(E) heap entries, which is the trade-off.",
    },
  ],
  flashcards: [
    { front: "Dijkstra time and space complexity with a binary heap?", back: "O((V + E) log V) time, O(V + E) space." },
    { front: "What single line makes lazy-deletion Dijkstra correct?", back: "`if (d > dist[u]) continue;` right after popping — it discards stale heap entries." },
    { front: "Dijkstra vs Bellman-Ford: pick one.", back: "Non-negative weights: Dijkstra, O((V+E) log V). Negative weights or cycle detection: Bellman-Ford, O(V·E)." },
  ],
};
