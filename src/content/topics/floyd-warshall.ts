import type { TopicContent } from "../types";

export const floydWarshall: TopicContent = {
  quickSummary: [
    "All-pairs shortest paths in **O(V³)** time and **O(V²)** space — three nested loops over a distance matrix.",
    "The DP state is “shortest u → v path using only vertices from {0..k} as intermediates”; **k must be the outermost loop**.",
    "Handles negative edges; a negative `d[i][i]` after the run means a negative cycle. Swap `min/+` for `||/&&` and you get transitive closure.",
  ],
  detailed: [
    "The recurrence is one decision per intermediate vertex: either the best u → v path avoids k entirely, or it goes u → k → v. So `d[u][v] = min(d[u][v], d[u][k] + d[k][v])`, layered over k = 0..V−1. After the k-th layer, every path that uses only the first k+1 vertices as waypoints is optimal.",
    "The loop order is not a style choice.\n\nWarning: k must be the outermost loop. With i or j outermost you would be mixing layers — reading `d[i][k]` values that have not yet absorbed all earlier intermediates — and the results are silently wrong on many graphs while looking right on small ones.",
    "Prefer it over running Dijkstra V times when V is small (roughly V ≤ 400–500, so V³ ≈ 10⁸) or when edges are negative. It is also the simplest correct choice on dense graphs, where V·Dijkstra costs O(V·E log V) ≈ O(V³ log V). It is cache-friendly and has a tiny constant factor, so it often beats its own asymptotics.",
    "Two variants come free. Transitive closure (Warshall): replace the matrix with `bool` and the update with `reach[i][j] |= reach[i][k] && reach[k][j]`. Minimax / bottleneck paths: replace `min(sum)` with `min(max(...))` to get the smallest possible largest edge on any route.\n\nCommon mistake: initializing with `INT_MAX` — `d[i][k] + d[k][j]` overflows immediately. Use a soft infinity like 1e18 (with `long long`) and skip additions where either side is infinite.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Floyd-Warshall with negative-cycle detection",
      source: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

const ll INF = (ll)1e18;

// d[i][j] pre-filled: 0 on the diagonal, edge weight, else INF
// returns false if the graph contains a negative cycle
bool floydWarshall(int n, vector<vector<ll>>& d) {
    for (int k = 0; k < n; ++k)              // k MUST be outermost
        for (int i = 0; i < n; ++i) {
            if (d[i][k] == INF) continue;    // no path i -> k, skip the row
            for (int j = 0; j < n; ++j) {
                if (d[k][j] == INF) continue;
                d[i][j] = min(d[i][j], d[i][k] + d[k][j]);
            }
        }

    for (int i = 0; i < n; ++i)
        if (d[i][i] < 0) return false;       // negative cycle through i
    return true;
}`,
    },
    {
      language: "cpp",
      caption: "Transitive closure (Warshall) — same loops, boolean algebra",
      source: `// reach[i][j] = true if j is reachable from i
void transitiveClosure(int n, vector<vector<char>>& reach) {
    for (int k = 0; k < n; ++k)
        for (int i = 0; i < n; ++i) {
            if (!reach[i][k]) continue;
            for (int j = 0; j < n; ++j)
                if (reach[k][j]) reach[i][j] = 1;
        }
}

// For n <= a few thousand, bitset makes this O(V^3 / 64):
//   vector<bitset<2048>> reach(n);
//   for (int k...) for (int i...) if (reach[i][k]) reach[i] |= reach[k];`,
    },
  ],
  diagrams: [
    {
      title: "The k-as-intermediate decision",
      kind: "flow",
      caption: "At layer k every pair (i, j) chooses between its current best route and the detour through k.",
      mermaid: `flowchart LR
    I["i"] -- "d[i][j] (avoid k)" --> J["j"]
    I -- "d[i][k]" --> K["k"]
    K -- "d[k][j]" --> J
    J --> R["d[i][j] = min(direct, via k)"]`,
    },
  ],
  cheatSheet: [
    "O(V³) time, O(V²) space — practical up to about V = 500.",
    "Loop order k, i, j — k outermost, always.",
    "Init: d[i][i] = 0, edges, else INF ≈ 1e18 (long long).",
    "d[i][i] < 0 after the run ⇒ negative cycle.",
    "Boolean variant = transitive closure; max-of-min variant = bottleneck paths.",
  ],
  interviewQA: [
    {
      q: "Why must k be the outermost loop?",
      a: "The algorithm is a DP over the set of allowed intermediate vertices. Layer k computes d_k[i][j], the best i → j path using only vertices 0..k as waypoints, from the fully-completed layer k−1. Putting k innermost means a given (i, j) pair races through all intermediates while other pairs are still on layer 0, so d[i][k] and d[k][j] may not yet be optimal over the earlier intermediates. With k outermost the in-place update is safe, because d[i][k] and d[k][j] are provably unchanged during layer k (a shortest path to or from k does not need k as an intermediate).",
      followUps: ["Why is the in-place single-matrix version correct without a second buffer?"],
    },
    {
      q: "V = 1000 with non-negative weights and a sparse graph. Floyd-Warshall or V × Dijkstra?",
      a: "V × Dijkstra. Floyd-Warshall would be 10⁹ operations and 10⁶ matrix cells; V Dijkstra runs cost O(V · (V + E) log V), which on a sparse graph with E ≈ 5000 is roughly 1000 · 6000 · 10 ≈ 6 × 10⁷ — more than an order of magnitude cheaper. The picture flips when the graph is dense (E ≈ V²) or when edges are negative, since Dijkstra is then unsound and you would need Johnson's algorithm instead.",
    },
  ],
  flashcards: [
    { front: "Floyd-Warshall complexity?", back: "O(V³) time, O(V²) space." },
    { front: "Floyd-Warshall recurrence?", back: "d[i][j] = min(d[i][j], d[i][k] + d[k][j]), with k as the outermost loop." },
    { front: "How do you spot a negative cycle after Floyd-Warshall?", back: "Any diagonal entry d[i][i] < 0." },
  ],
};
