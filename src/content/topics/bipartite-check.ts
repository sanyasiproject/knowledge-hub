import type { TopicContent } from "../types";

export const bipartiteCheck: TopicContent = {
  quickSummary: [
    "A graph is bipartite iff its vertices split into two sets with every edge crossing between them — equivalently, iff it is 2-colourable, iff it has **no odd-length cycle**.",
    "Test it by colouring during BFS or DFS: give each neighbour the opposite colour; a same-coloured neighbour means not bipartite.",
    "O(V + E) time, O(V) space. Must be run per component — a disconnected graph is bipartite only if every component is.",
  ],
  detailed: [
    `Bipartiteness is the "two teams" property: can you split vertices into sets L and R so that no edge stays inside a set? Matching problems, scheduling with conflicts, and "can these items be split into two groups without a clash" all reduce to it.

The algorithm falls straight out of the definition. Colour the start vertex 0. Every neighbour must be 1, their neighbours 0, and so on. If you ever reach a vertex that already carries the *same* colour as the vertex you came from, no valid split exists.`,
    `## Why "no odd cycle" is the same statement

Walk around a cycle assigning alternating colours. You return to the start after k steps with colour k mod 2. If k is even you get back the colour you started with — consistent. If k is odd you get the opposite colour on the same vertex — contradiction.

Key insight: the conflict edge BFS finds is precisely the edge that closes an odd cycle. That is why the same O(V + E) pass both decides bipartiteness and, with a parent array, reconstructs an odd cycle as a certificate.

Corollary: every tree is bipartite (no cycles at all), and every even-length cycle graph is bipartite while every odd one is not.`,
    `## Per-component handling

Common mistake: colouring from vertex 0 only. A disconnected graph needs the outer loop over all vertices, restarting the colouring with colour 0 in each unvisited component. Components are independent — you may pick either colour as the seed in each.

BFS and DFS both work and cost the same. BFS is slightly preferred for deep graphs since it has no recursion-depth risk, and its layer structure makes the argument obvious: vertices in even layers get colour 0, odd layers colour 1, and any edge inside a single layer is an odd-cycle witness.`,
  ],
  code: [
    {
      language: "cpp",
      caption: "BFS 2-colouring across all components (0-indexed)",
      source: `#include <bits/stdc++.h>
using namespace std;

// color[v] in {-1 uncoloured, 0, 1}. Returns true if the graph is bipartite.
// O(V + E) time, O(V) space.
bool isBipartite(int n, const vector<vector<int>>& adj, vector<int>& color) {
    color.assign(n, -1);

    for (int s = 0; s < n; ++s) {
        if (color[s] != -1) continue;   // per-component restart

        queue<int> q;
        color[s] = 0;
        q.push(s);
        while (!q.empty()) {
            int u = q.front(); q.pop();
            for (int v : adj[u]) {
                if (color[v] == -1) {
                    color[v] = color[u] ^ 1;   // opposite colour
                    q.push(v);
                } else if (color[v] == color[u]) {
                    return false;              // edge inside one side
                }
            }
        }
    }
    return true;
}`,
    },
    {
      language: "cpp",
      caption: "Not bipartite? Return an odd cycle as proof",
      source: `#include <bits/stdc++.h>
using namespace std;

// Returns the vertices of an odd cycle, or an empty vector if bipartite.
// O(V + E) time, O(V) space.
vector<int> findOddCycle(int n, const vector<vector<int>>& adj) {
    vector<int> color(n, -1), par(n, -1);

    for (int s = 0; s < n; ++s) {
        if (color[s] != -1) continue;
        queue<int> q;
        color[s] = 0;
        q.push(s);

        while (!q.empty()) {
            int u = q.front(); q.pop();
            for (int v : adj[u]) {
                if (color[v] == -1) {
                    color[v] = color[u] ^ 1;
                    par[v] = u;
                    q.push(v);
                } else if (color[v] == color[u]) {
                    // u and v have equal colour: climb both to their meeting point.
                    vector<int> pu, pv;
                    int a = u, b = v;
                    // In BFS an edge spans at most one layer, so equal colour
                    // implies equal depth -- the two climbs stay in lockstep.
                    while (a != b) {
                        pu.push_back(a);
                        pv.push_back(b);
                        a = par[a];
                        b = par[b];
                    }
                    vector<int> cycle = pu;
                    cycle.push_back(a);                       // meeting vertex
                    reverse(pv.begin(), pv.end());
                    for (int x : pv) cycle.push_back(x);
                    return cycle;                             // odd length
                }
            }
        }
    }
    return {};
}`,
    },
  ],
  diagrams: [
    {
      title: "2-colouring: bipartite vs odd cycle",
      kind: "flow",
      caption:
        "Left: a 4-cycle alternates cleanly. Right: a triangle forces X and Z to share a colour, so the graph is not bipartite.",
      mermaid: `flowchart LR
    subgraph OK["bipartite - 4-cycle"]
      A["A col 0"] --- B["B col 1"]
      B --- C["C col 0"]
      C --- D["D col 1"]
      D --- A
    end
    subgraph BAD["not bipartite - 3-cycle"]
      X["X col 0"] --- Y["Y col 1"]
      Y --- Z["Z col 0"]
      Z --- X
    end`,
    },
  ],
  cheatSheet: [
    "Bipartite <=> 2-colourable <=> no odd cycle. All three are the same statement.",
    "O(V + E) time, O(V) space, BFS or DFS.",
    "color[v] = color[u] ^ 1 for a neighbour; conflict when color[v] == color[u].",
    "Restart per component — the outer loop is mandatory on disconnected graphs.",
    "Trees and even cycles are always bipartite; any odd cycle kills it.",
    "A self-loop makes a graph non-bipartite immediately.",
  ],
  interviewQA: [
    {
      q: "How do you check bipartiteness, and why is it equivalent to having no odd cycle?",
      a: "I 2-colour the graph during BFS: seed each uncoloured vertex with colour 0, and give every newly discovered neighbour the opposite colour via color[v] = color[u] ^ 1. If I ever find an edge whose endpoints already share a colour, the graph is not bipartite. That runs in O(V + E) time and O(V) space, and it must loop over all vertices so every component is covered. The equivalence to odd cycles: BFS colours a vertex by the parity of its layer, so an edge inside a single layer, or between two layers of the same parity, closes a cycle of odd length. Conversely, walking an odd cycle with alternating colours returns to the start vertex demanding the opposite of its own colour, which is a contradiction, so any graph containing an odd cycle cannot be 2-coloured. Trees, having no cycles, are always bipartite.",
      followUps: [
        "How would you output the odd cycle as a certificate?",
        "Does DFS work as well as BFS here, and does it change complexity?",
      ],
    },
    {
      q: "Your bipartite check passes on the samples but fails on a hidden test. What is the likely cause?",
      a: "By far the most likely cause is only colouring from vertex 0 instead of restarting in every uncoloured component. A disconnected graph is bipartite only if every one of its components is, so an odd cycle sitting in a component that is unreachable from vertex 0 is never examined and the code wrongly answers yes. The fix is an outer loop over all V vertices that starts a fresh colouring wherever color[v] is still -1; each component may independently seed with either colour. Two smaller traps: a self-loop makes a vertex adjacent to itself and must report false immediately, and the graph must be treated as undirected, so both directions of each edge need to be present in the adjacency list.",
    },
  ],
  flashcards: [
    {
      front: "Three equivalent characterisations of a bipartite graph?",
      back: "Vertices split into two sets with all edges crossing; 2-colourable; contains no odd-length cycle.",
    },
    {
      front: "Complexity of the bipartite check?",
      back: "O(V + E) time, O(V) space, using BFS or DFS 2-colouring — run per component.",
    },
    {
      front: "What does BFS layer parity tell you about bipartiteness?",
      back: "Colour = layer parity. Any edge joining two vertices of the same parity closes an odd cycle, so the graph is not bipartite.",
    },
  ],
};
