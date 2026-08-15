import type { TopicContent } from "../types";

export const dfsTraversal: TopicContent = {
  quickSummary: [
    "DFS goes as deep as possible before backtracking — recursion (implicit stack) or an explicit stack, both O(V + E) time and O(V) space.",
    "Entry/exit timestamps tin[v] / tout[v] turn DFS into a tool: ancestry tests, subtree ranges, and edge classification all fall out of them.",
    "The tree/back/forward/cross edge classification is what powers cycle detection, topological sort, bridges, articulation points, and SCCs.",
  ],
  detailed: [
    `DFS visits a vertex, then immediately recurses into its first unvisited neighbour, and only returns once that whole branch is exhausted. The order of vertices is not meaningful in itself — unlike BFS layers, DFS depth tells you nothing about distance. What DFS gives you instead is *structure*: the recursion produces a DFS tree, and the edges that are not in that tree are classified by where they point.

Both forms cost O(V + E) time because each vertex is entered once and each adjacency list is scanned once.`,
    `## Timestamps

Record a counter on entry and on exit:

- \`tin[v]\` — when v was first reached
- \`tout[v]\` — when v's recursion returned

The intervals nest perfectly: u is an ancestor of v in the DFS tree iff \`tin[u] < tin[v] && tout[v] < tout[u]\`. That is an O(1) ancestry test after one O(V + E) pass, and it is the basis of Euler-tour subtree queries.

Key insight: DFS finish order (sorting by decreasing tout) is a valid topological order of any DAG — no separate algorithm needed.`,
    `## Edge classification

On a directed graph, colour each vertex white (unvisited), grey (on the recursion stack), black (finished). When DFS at u looks at edge u -> v:

| colour of v | edge type | meaning |
| --- | --- | --- |
| white | tree | v is discovered by this edge |
| grey | **back** | v is an ancestor — a cycle exists |
| black, tin[u] < tin[v] | forward | v is a finished descendant |
| black, tin[u] > tin[v] | cross | v is in an already-finished branch |

Only back edges indicate a directed cycle, which is the entire content of directed cycle detection. In an *undirected* graph only tree and back edges exist, and the parent edge must be excluded before a back edge counts.`,
    `Warning: recursive DFS overflows the stack on deep graphs. A path graph of 10^5 vertices means 10^5 nested frames; on a typical 1 MB stack with a fat frame that already crashes, and 10^6 vertices certainly will. Either switch to the explicit-stack form, or raise the stack limit if the judge/runtime allows it.

In practice: write the recursive version for clarity in an interview, and say out loud that you would convert it to an explicit stack past roughly 10^5 depth. Interviewers care that you noticed.`,
  ],
  code: [
    {
      language: "cpp",
      caption: "Recursive DFS with entry/exit times and ancestry test (0-indexed)",
      source: `#include <bits/stdc++.h>
using namespace std;

int n, timer_ = 0;
vector<vector<int>> adj;
vector<int> tin, tout_, color;   // 0 = white, 1 = grey (on stack), 2 = black

void dfs(int u) {
    color[u] = 1;
    tin[u] = timer_++;
    for (int v : adj[u]) {
        if (color[v] == 0) {
            dfs(v);                      // tree edge
        } else if (color[v] == 1) {
            // back edge -> directed cycle through u -> v
        } else if (tin[u] < tin[v]) {
            // forward edge
        } else {
            // cross edge
        }
    }
    color[u] = 2;
    tout_[u] = timer_++;
}

// Run over every component so isolated vertices are not missed.
void dfsAll() {
    tin.assign(n, -1);
    tout_.assign(n, -1);
    color.assign(n, 0);
    timer_ = 0;
    for (int v = 0; v < n; ++v)
        if (color[v] == 0) dfs(v);
}

// O(1) after the traversal: is u an ancestor of v in the DFS tree?
bool isAncestor(int u, int v) {
    return tin[u] < tin[v] && tout_[v] < tout_[u];
}`,
    },
    {
      language: "cpp",
      caption: "Explicit-stack DFS — same visit order, no recursion depth limit",
      source: `#include <bits/stdc++.h>
using namespace std;

// Iterative DFS that still knows when a vertex is FINISHED, by keeping an
// index into each vertex's adjacency list on the stack. O(V + E) time, O(V) space.
void dfsIterative(int s, const vector<vector<int>>& adj,
                  vector<int>& tin, vector<int>& tout_, int& timer_) {
    int n = (int)adj.size();
    vector<int> it(n, 0);             // next neighbour index per vertex
    vector<int> stk;

    tin[s] = timer_++;
    stk.push_back(s);

    while (!stk.empty()) {
        int u = stk.back();
        if (it[u] < (int)adj[u].size()) {
            int v = adj[u][it[u]++];  // advance BEFORE descending
            if (tin[v] == -1) {       // tin == -1 means unvisited
                tin[v] = timer_++;
                stk.push_back(v);
            }
        } else {
            tout_[u] = timer_++;      // u is finished
            stk.pop_back();
        }
    }
}`,
    },
  ],
  diagrams: [
    {
      title: "DFS tree with a back edge",
      kind: "flow",
      caption:
        "Solid edges form the DFS tree; the dashed edge D -> B points to a grey ancestor, so it is a back edge and proves a cycle.",
      mermaid: `flowchart TD
    A["A  tin=0"] --> B["B  tin=1"]
    B --> C["C  tin=2"]
    C --> D["D  tin=3"]
    D -.->|"back edge"| B
    A --> E["E  tin=8"]
    E -.->|"cross edge"| C`,
    },
  ],
  cheatSheet: [
    "O(V + E) time, O(V) space — same for recursive and iterative forms.",
    "Loop over all vertices at the top level, or you only traverse one component.",
    "u is an ancestor of v iff tin[u] < tin[v] and tout[v] < tout[u].",
    "Directed: back edge (grey neighbour) == cycle. Undirected: back edge to any visited non-parent == cycle.",
    "Vertices sorted by decreasing tout give a topological order of a DAG.",
    "Depth > ~1e5 : use the explicit-stack version.",
  ],
  interviewQA: [
    {
      q: "What are entry and exit times in DFS and what do you use them for?",
      a: "tin[v] is the timestamp when DFS first reaches v; tout[v] is the timestamp when its recursive call returns. Because DFS finishes a subtree completely before moving on, the intervals [tin, tout] form a laminar family — two intervals are either disjoint or nested. That gives an O(1) ancestry test, isAncestor(u, v) = tin[u] < tin[v] && tout[v] < tout[u], after a single O(V + E) pass. The same timestamps identify a whole subtree as a contiguous range in the Euler tour, which lets you answer subtree aggregate queries with a segment tree or BIT, and sorting by decreasing tout yields a topological order of a DAG.",
      followUps: [
        "How do timestamps generalise to LCA queries?",
        "How do low-link values extend this to bridges and articulation points?",
      ],
    },
    {
      q: "Distinguish tree, back, forward, and cross edges, and say which ones actually matter.",
      a: "Colour vertices white/grey/black for unvisited/on-stack/finished. From u, an edge to a white vertex is a tree edge, to a grey vertex a back edge, and to a black vertex either forward (tin[u] < tin[v], v is a finished descendant) or cross (tin[u] > tin[v], v is in an earlier finished branch). The one that carries real information is the back edge: a directed graph has a cycle if and only if some DFS finds a back edge, which is exactly the recursion-stack cycle test. In an undirected graph, forward and cross edges cannot occur at all — every non-tree edge is a back edge — so cycle detection reduces to finding any edge to a visited vertex other than the parent.",
    },
  ],
  flashcards: [
    {
      front: "Which edge type proves a directed cycle?",
      back: "A back edge — an edge to a vertex currently grey, i.e. still on the recursion stack.",
    },
    {
      front: "Ancestry test using DFS timestamps?",
      back: "u is an ancestor of v iff tin[u] < tin[v] and tout[v] < tout[u]. O(1) after one O(V + E) DFS.",
    },
    {
      front: "Why replace recursive DFS with an explicit stack?",
      back: "Recursion depth equals the longest DFS path; at ~1e5+ vertices in a chain the call stack overflows. The explicit stack moves that state to the heap.",
    },
  ],
};
