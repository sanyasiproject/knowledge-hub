import type { TopicContent } from "../types";

export const connectedComponents: TopicContent = {
  quickSummary: [
    "Loop over every vertex; if it is unvisited, start a BFS/DFS from it and label everything it reaches with the same component id. The number of loop starts is the component count.",
    "Flood fill is the same algorithm on a grid — neighbours are the 4 or 8 adjacent cells instead of an adjacency list. 'Count the islands' is literally this.",
    "O(V + E) time, O(V) space (O(R*C) on a grid). DSU is the alternative when edges stream in or you need incremental merging.",
  ],
  detailed: [
    `A connected component of an undirected graph is a maximal set of mutually reachable vertices. The algorithm is deliberately boring: for each vertex v, if v has no label yet, run a traversal from v and stamp every reached vertex with the current component id, then increment the id.

Key insight: the outer loop is the algorithm. A single traversal only covers one component — forgetting the loop is the most common way this is gotten wrong, and it silently returns 1 on any disconnected input.

Cost is O(V + E) total, not per component: each vertex is stamped once and each adjacency list scanned once across all components combined.`,
    `## Flood fill and grids

Treat cell (r, c) as a vertex and its in-bounds, non-blocked 4-neighbours as edges. Counting islands in a grid of land and water is exactly component counting; painting a region in an image editor is the same walk with a colour write instead of a label.

Common mistake: choosing 8-connectivity when the problem says 4 (or vice versa). Diagonal adjacency changes the answer, so read the statement — and be aware some problems use 4-connectivity for land and 8 for water.

Warning: recursive flood fill on a 1000 x 1000 grid can recurse a million deep and blow the stack. Use the BFS/queue form for large grids.`,
    `## BFS vs DFS vs DSU

BFS and DFS give identical components; pick BFS on grids to avoid deep recursion, DFS when you want the code shorter. DSU is a different trade: process edges in any order, union endpoints, and at the end each distinct root is a component. That costs O(E * alpha(V)) and is the right tool when edges arrive incrementally or when you also need "are u and v connected?" queries interleaved with additions.

Note that all of this is for **undirected** graphs. The directed analogue — mutual reachability — is strongly connected components, which needs Kosaraju's or Tarjan's, not this.`,
  ],
  code: [
    {
      language: "cpp",
      caption: "Labelling components with BFS (0-indexed, returns component count)",
      source: `#include <bits/stdc++.h>
using namespace std;

// comp[v] = component id in [0, count). O(V + E) time, O(V) space.
int connectedComponents(int n, const vector<vector<int>>& adj,
                        vector<int>& comp) {
    comp.assign(n, -1);
    int count = 0;

    for (int s = 0; s < n; ++s) {
        if (comp[s] != -1) continue;   // the OUTER LOOP is the algorithm

        queue<int> q;
        comp[s] = count;
        q.push(s);
        while (!q.empty()) {
            int u = q.front(); q.pop();
            for (int v : adj[u]) {
                if (comp[v] == -1) {
                    comp[v] = count;
                    q.push(v);
                }
            }
        }
        ++count;
    }
    return count;
}`,
    },
    {
      language: "cpp",
      caption: "Flood fill on a grid — count islands, iterative (no stack overflow)",
      source: `#include <bits/stdc++.h>
using namespace std;

// grid: '1' = land, '0' = water. 4-connectivity.
// Returns the number of islands; grid is modified in place as the visited mark.
// O(R*C) time and space.
int numIslands(vector<vector<char>>& grid) {
    if (grid.empty() || grid[0].empty()) return 0;
    int R = (int)grid.size(), C = (int)grid[0].size();
    const int dr[4] = {-1, 1, 0, 0};
    const int dc[4] = {0, 0, -1, 1};

    int islands = 0;
    for (int r = 0; r < R; ++r) {
        for (int c = 0; c < C; ++c) {
            if (grid[r][c] != '1') continue;
            ++islands;

            queue<pair<int,int>> q;
            grid[r][c] = '0';            // sink on ENQUEUE
            q.push({r, c});
            while (!q.empty()) {
                auto [cr, cc] = q.front(); q.pop();
                for (int k = 0; k < 4; ++k) {
                    int nr = cr + dr[k], nc = cc + dc[k];
                    if (nr < 0 || nr >= R || nc < 0 || nc >= C) continue;
                    if (grid[nr][nc] != '1') continue;
                    grid[nr][nc] = '0';
                    q.push({nr, nc});
                }
            }
        }
    }
    return islands;
}`,
    },
  ],
  diagrams: [
    {
      title: "Three components in one graph",
      kind: "flow",
      caption:
        "The outer loop restarts at A, then at E, then at G — three traversals, three component ids, still O(V + E) overall.",
      mermaid: `flowchart LR
    subgraph C0["component 0"]
      A["A"] --- B["B"]
      B --- C["C"]
      A --- D["D"]
    end
    subgraph C1["component 1"]
      E["E"] --- F["F"]
    end
    subgraph C2["component 2"]
      G["G"]
    end`,
    },
  ],
  cheatSheet: [
    "O(V + E) time, O(V) space total — across all components, not per component.",
    "Never forget the outer for-loop over all vertices; one traversal covers one component.",
    "Grid: V = R*C, E <= 4*R*C, so O(R*C). Use BFS to avoid deep recursion.",
    "Mark cells visited on enqueue, exactly as in plain BFS.",
    "Read whether the problem wants 4- or 8-connectivity; it changes the count.",
    "Directed graphs need SCC (Kosaraju/Tarjan), not this.",
  ],
  interviewQA: [
    {
      q: "How do you count connected components, and what is the complexity?",
      a: "Keep a comp array initialised to -1. Iterate v from 0 to V-1; whenever comp[v] is still -1, increment the component counter and run a BFS or DFS from v that stamps every reachable vertex with the current id. The number of times the outer loop starts a traversal is the component count. The complexity is O(V + E) time and O(V) space in total, not per component, because each vertex is labelled exactly once and each adjacency list is scanned exactly once across the whole run. The single most common bug is running one traversal from vertex 0 and reporting whatever it reached — that returns 1 for any disconnected graph. If edges arrive incrementally instead of being given up front, I would use DSU: union each edge's endpoints and count distinct roots, at O(E * alpha(V)).",
      followUps: [
        "How would you also report the size of the largest component?",
        "What changes if the graph is directed?",
      ],
    },
    {
      q: "Count the islands in an R x C grid of land and water. Walk through your approach.",
      a: "It is connected-component counting on an implicit graph: each land cell is a vertex, and edges join in-bounds land cells that are 4-adjacent. Scan every cell; when I find unvisited land I increment the island count and flood fill from it, marking each reached land cell visited — I usually overwrite the grid itself with water to avoid a second array, after confirming mutation is acceptable. Marking must happen when a cell is pushed, not popped, or the same cell enters the queue once per neighbour. Time and space are O(R*C). I would use the iterative BFS form rather than recursion, because a 1000 x 1000 all-land grid recurses a million frames deep and overflows the stack. I would also confirm whether the problem intends 4- or 8-connectivity, since diagonals change the answer.",
    },
  ],
  flashcards: [
    {
      front: "Total complexity of labelling all connected components?",
      back: "O(V + E) time and O(V) space overall — each vertex labelled once, each adjacency list scanned once.",
    },
    {
      front: "What is flood fill in graph terms?",
      back: "BFS/DFS on an implicit grid graph: cell = vertex, in-bounds 4- or 8-adjacent passable cells = edges. Counting islands is component counting.",
    },
    {
      front: "When is DSU preferable to BFS/DFS for components?",
      back: "When edges arrive incrementally or connectivity queries interleave with edge additions — O(E * alpha(V)), no re-traversal needed.",
    },
  ],
};
