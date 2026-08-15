import type { TopicContent } from "../types";

export const zeroOneBfs: TopicContent = {
  quickSummary: [
    "When every edge weight is **0 or 1**, a deque replaces the heap: `push_front` on a 0-edge, `push_back` on a 1-edge.",
    "That gives shortest paths in **O(V + E)** time and **O(V)** space — strictly better than Dijkstra's log factor.",
    "Multi-source BFS: seed the queue with *all* sources at distance 0 and run one ordinary BFS to get distance-to-nearest-source for every node.",
  ],
  detailed: [
    "0-1 BFS keeps the deque's distances sorted with at most two distinct values, `d` and `d + 1`. A 0-edge produces a node at the same distance so it belongs at the front; a 1-edge produces `d + 1` so it belongs at the back. That invariant makes the deque behave exactly like a priority queue for this weight set, without any comparisons.",
    "Because a node can be pushed more than once, keep the same stale-entry discipline as Dijkstra: check `if (d > dist[u]) continue;` after popping, or equivalently relax only on strict improvement. Each edge is processed O(1) times, hence O(V + E).\n\nIn practice: this shows up as grid problems — “moving in your current direction is free, turning costs 1”, or “you may flip at most k walls”. Model the state, not just the cell.",
    "Multi-source BFS is a different trick with the same shape. Instead of running BFS from each of the k sources (O(k · (V + E))), push every source with `dist = 0` in one pass. The result is `dist[v] = min over sources s of d(s, v)`, computed in a single O(V + E) sweep. It is equivalent to adding a virtual super-source with 0-weight edges to all real sources.\n\nKey insight: multi-source works because BFS only needs its frontier to be non-decreasing in distance — starting with many zeros preserves that.",
    "Generalization: with weights limited to {0, 1, …, k}, use dial's algorithm — k + 1 buckets indexed by `dist mod (k+1)` — for O(V + E·k) or so. Beyond that, go back to Dijkstra.",
  ],
  code: [
    {
      language: "cpp",
      caption: "0-1 BFS with a deque",
      source: `#include <bits/stdc++.h>
using namespace std;

const int INF = INT_MAX;

// adj[u] = list of (v, w) with w in {0, 1}
vector<int> zeroOneBfs(int src, const vector<vector<pair<int, int>>>& adj) {
    int n = (int)adj.size();
    vector<int> dist(n, INF);
    deque<int> dq;

    dist[src] = 0;
    dq.push_back(src);

    while (!dq.empty()) {
        int u = dq.front();
        dq.pop_front();
        for (auto [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                if (w == 0) dq.push_front(v);   // same layer
                else        dq.push_back(v);    // next layer
            }
        }
    }
    return dist;
}`,
    },
    {
      language: "cpp",
      caption: "Multi-source BFS on a grid — distance to the nearest source",
      source: `// grid: 'S' = source, '#' = wall, '.' = free
vector<vector<int>> multiSourceBfs(const vector<string>& grid) {
    int n = (int)grid.size(), m = (int)grid[0].size();
    vector<vector<int>> dist(n, vector<int>(m, -1));
    queue<pair<int, int>> q;

    for (int i = 0; i < n; ++i)
        for (int j = 0; j < m; ++j)
            if (grid[i][j] == 'S') { dist[i][j] = 0; q.push({i, j}); }

    const int dx[4] = {1, -1, 0, 0}, dy[4] = {0, 0, 1, -1};
    while (!q.empty()) {
        auto [x, y] = q.front();
        q.pop();
        for (int k = 0; k < 4; ++k) {
            int nx = x + dx[k], ny = y + dy[k];
            if (nx < 0 || ny < 0 || nx >= n || ny >= m) continue;
            if (grid[nx][ny] == '#' || dist[nx][ny] != -1) continue;
            dist[nx][ny] = dist[x][y] + 1;
            q.push({nx, ny});
        }
    }
    return dist;   // -1 = unreachable
}`,
    },
  ],
  diagrams: [
    {
      title: "Which end of the deque?",
      kind: "flow",
      caption: "A 0-edge keeps the node in the current distance layer (front); a 1-edge moves it to the next layer (back).",
      mermaid: `flowchart TD
    A["Pop u from deque front"] --> B["Relax edge (u, v, w)"]
    B --> C{"dist[u] + w < dist[v]?"}
    C -- "no" --> A
    C -- "yes" --> D["dist[v] = dist[u] + w"]
    D --> E{"w == 0?"}
    E -- "yes" --> F["push_front(v): same layer"]
    E -- "no" --> G["push_back(v): next layer"]
    F --> A
    G --> A`,
    },
  ],
  cheatSheet: [
    "0-1 BFS: O(V + E) time, O(V) space — beats Dijkstra's log V.",
    "push_front on weight 0, push_back on weight 1.",
    "Relax only on strict improvement (or skip stale pops).",
    "Multi-source: enqueue all sources at dist 0, then one plain BFS.",
    "Weights in {0..k}: dial's algorithm with k + 1 buckets.",
  ],
  interviewQA: [
    {
      q: "Why is a deque enough when weights are only 0 and 1?",
      a: "BFS-style algorithms are correct as long as nodes are dequeued in non-decreasing distance order. With 0/1 weights, relaxing from a node at distance d can only produce d or d + 1, so at any moment the deque holds at most two distinct distance values with all the d's ahead of all the d+1's. Pushing a 0-edge result to the front and a 1-edge result to the back preserves exactly that ordering. Since ordering comes for free, no heap is needed and the total cost drops from O((V+E) log V) to O(V + E).",
      followUps: ["What breaks if weights are 0, 1 and 2?"],
    },
    {
      q: "You have 500 fire sources on a 1000×1000 grid and need each cell's time to burn. Approach?",
      a: "Multi-source BFS in a single pass. Push all 500 burning cells with dist 0, then run standard BFS; every cell gets the minimum distance to any source. Cost is O(V + E) = O(rows × cols × 4) ≈ 4 × 10⁶ operations and O(rows × cols) space. Running 500 separate BFS runs and taking the elementwise min would be 500× more expensive for the identical answer. If some moves were free and others cost 1 — say fire spreads instantly through fuel — swap the queue for a deque and use 0-1 BFS.",
    },
  ],
  flashcards: [
    { front: "0-1 BFS rule?", back: "push_front on a weight-0 edge, push_back on a weight-1 edge; O(V + E) time, O(V) space." },
    { front: "How do you compute distance to the nearest of k sources in one pass?", back: "Multi-source BFS: enqueue all k sources at distance 0, then run one ordinary BFS. O(V + E)." },
    { front: "Why not just use Dijkstra for 0/1 weights?", back: "It works but costs an extra log V factor; the deque already keeps the frontier ordered." },
  ],
};
