import type { TopicContent } from "../types";

export const bfsTraversal: TopicContent = {
  quickSummary: [
    "BFS explores a graph in layers from a source using a FIFO queue: all vertices at distance k are visited before any at distance k+1.",
    "Mark visited **on enqueue**, never on dequeue — otherwise a vertex can enter the queue many times and the cost blows up.",
    "Time O(V + E), space O(V) for the queue plus the visited array. Shortest paths are guaranteed only when every edge has the same weight.",
  ],
  detailed: [
    `BFS is a queue-driven level order walk of a graph. Push the source, then repeatedly pop a vertex and push each unvisited neighbour. Because the queue is FIFO, everything reachable in one edge leaves the queue before anything reachable in two, so the pop order is sorted by distance from the source.

That layering is the whole reason BFS is useful. It is not just "another traversal" — the order itself carries distance information that DFS does not have.`,
    `**Mark visited at enqueue time, not at dequeue time.** If you only mark on dequeue, a vertex with d neighbours already in the queue gets pushed d times, and the queue can grow to O(E). Marking on enqueue keeps each vertex in the queue at most once, which is what makes the O(V + E) bound hold.

Common mistake: setting \`visited[v] = true\` inside the pop block instead of inside the neighbour loop. The answer is still correct on small inputs, so this bug survives testing and then times out.`,
    `## Why shortest paths need unit weights

BFS produces shortest paths because "number of edges" and "order of discovery" coincide when every edge costs 1. Add a weight of 5 to one edge and that coincidence breaks: a two-edge path of cost 2 can beat a one-edge path of cost 5, but BFS has already committed to the one-edge path.

Key insight: BFS is Dijkstra with all weights equal to 1 — the queue replaces the priority queue precisely because a sorted structure is unnecessary when every key increases by the same amount. For 0/1 weights use 0-1 BFS with a deque; for general weights use Dijkstra.`,
    `## Grid BFS

A grid is an implicit graph: cell (r, c) is a vertex and its 4 (or 8) in-bounds non-blocked neighbours are its edges. Nothing changes about the algorithm — you just generate neighbours with a direction array instead of reading an adjacency list. An R x C grid has V = R*C and E <= 4*R*C, so BFS is O(R*C) time and space.

Multi-source BFS is the same code with several vertices pushed at distance 0; it computes, for every cell, the distance to the *nearest* source in one pass.`,
  ],
  code: [
    {
      language: "cpp",
      caption: "BFS on an adjacency list — distances and parent tree (0-indexed)",
      source: `#include <bits/stdc++.h>
using namespace std;

// dist[v] = number of edges on a shortest s->v path, -1 if unreachable.
// par[v]  = predecessor of v on that path, -1 for the source / unreachable.
// O(V + E) time, O(V) space.
void bfs(int s, const vector<vector<int>>& adj,
         vector<int>& dist, vector<int>& par) {
    int n = (int)adj.size();
    dist.assign(n, -1);
    par.assign(n, -1);

    queue<int> q;
    dist[s] = 0;          // visited == (dist != -1)
    q.push(s);

    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u]) {
            if (dist[v] == -1) {   // mark ON ENQUEUE
                dist[v] = dist[u] + 1;
                par[v] = u;
                q.push(v);
            }
        }
    }
}

// Rebuild the vertex path s -> t (empty if t is unreachable).
vector<int> restorePath(int s, int t, const vector<int>& par,
                        const vector<int>& dist) {
    if (dist[t] == -1) return {};
    vector<int> path;
    for (int v = t; v != -1; v = par[v]) path.push_back(v);
    reverse(path.begin(), path.end());
    return path;   // path.front() == s
}`,
    },
    {
      language: "cpp",
      caption: "Multi-source grid BFS — distance to the nearest source",
      source: `#include <bits/stdc++.h>
using namespace std;

const int dr[4] = {-1, 1, 0, 0};
const int dc[4] = {0, 0, -1, 1};

// grid: '.' free, '#' blocked. sources: starting cells, all at distance 0.
// Returns dist[r][c] = steps to the nearest source, -1 if unreachable.
// O(R*C) time and space.
vector<vector<int>> multiSourceBFS(const vector<string>& grid,
                                   const vector<pair<int,int>>& sources) {
    int R = (int)grid.size(), C = (int)grid[0].size();
    vector<vector<int>> dist(R, vector<int>(C, -1));
    queue<pair<int,int>> q;

    for (auto [r, c] : sources) {
        if (dist[r][c] == -1 && grid[r][c] != '#') {
            dist[r][c] = 0;
            q.push({r, c});
        }
    }

    while (!q.empty()) {
        auto [r, c] = q.front(); q.pop();
        for (int k = 0; k < 4; ++k) {
            int nr = r + dr[k], nc = c + dc[k];
            if (nr < 0 || nr >= R || nc < 0 || nc >= C) continue;
            if (grid[nr][nc] == '#' || dist[nr][nc] != -1) continue;
            dist[nr][nc] = dist[r][c] + 1;
            q.push({nr, nc});
        }
    }
    return dist;
}`,
    },
  ],
  diagrams: [
    {
      title: "BFS layers from source A",
      kind: "flow",
      caption:
        "Every vertex is discovered at its true edge-distance from A; the queue never mixes layers.",
      mermaid: `flowchart LR
    subgraph L0["Layer 0"]
      A["A"]
    end
    subgraph L1["Layer 1"]
      B["B"]
      C["C"]
    end
    subgraph L2["Layer 2"]
      D["D"]
      E["E"]
    end
    subgraph L3["Layer 3"]
      F["F"]
    end
    A --> B
    A --> C
    B --> D
    C --> D
    C --> E
    E --> F`,
    },
  ],
  cheatSheet: [
    "Time O(V + E), space O(V). Grid variant: O(R*C) both.",
    "Mark visited when you PUSH, not when you POP.",
    "dist[v] == -1 doubles as the visited flag — one array, not two.",
    "Shortest path guarantee holds only for unweighted (unit-weight) edges. 0/1 weights: deque BFS. General weights: Dijkstra.",
    "Push every source at distance 0 for multi-source BFS — gives nearest-source distance in one sweep.",
  ],
  interviewQA: [
    {
      q: "Why does BFS find shortest paths on an unweighted graph, and what breaks when edges are weighted?",
      a: "BFS pops vertices in nondecreasing order of edge-distance from the source, because the FIFO queue empties layer k entirely before layer k+1. So the first time a vertex is discovered, it is discovered via a minimum-edge-count path, and that value can be finalised immediately. With arbitrary positive weights, edge count no longer equals path cost — a path with more edges can be cheaper — so first discovery is no longer optimal. The fix is a priority queue ordered by accumulated cost, i.e. Dijkstra at O((V + E) log V). For weights restricted to 0 and 1 you can keep linear time with a deque: push 0-weight neighbours to the front and 1-weight neighbours to the back.",
      followUps: [
        "How would you recover the actual path, not just its length?",
        "What changes for a bidirectional BFS between a fixed source and target?",
      ],
    },
    {
      q: "A candidate's BFS is correct but times out on a dense graph. What do you look for first?",
      a: "Almost always the visited mark is applied on dequeue instead of on enqueue. Then a vertex can be pushed once per incoming edge, the queue reaches O(E) entries, and every duplicate re-scans that vertex's adjacency list — degrading toward O(V*E). The check: the visited assignment must sit inside the neighbour loop, next to the push. The second thing to check is the neighbour lookup itself — scanning an adjacency matrix makes every expansion O(V), giving O(V^2) regardless of how sparse the graph is.",
    },
  ],
  flashcards: [
    {
      front: "Time and space complexity of BFS on an adjacency list?",
      back: "O(V + E) time, O(V) space (queue + visited/dist array).",
    },
    {
      front: "Where exactly must the visited flag be set in BFS?",
      back: "On enqueue, inside the neighbour loop. Marking on dequeue lets a vertex enter the queue once per incoming edge.",
    },
    {
      front: "When does BFS stop giving shortest paths?",
      back: "As soon as edges carry different weights. Unit weights only; use deque BFS for 0/1 weights and Dijkstra otherwise.",
    },
  ],
};
