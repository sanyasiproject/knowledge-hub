import type { TopicContent } from "../types";

export const eulerianPath: TopicContent = {
  quickSummary: [
    "An **Eulerian circuit** uses every edge exactly once and returns to the start; an **Eulerian path** uses every edge exactly once but may end elsewhere.",
    "Existence is a pure **degree plus connectivity** test — undirected needs 0 or 2 odd-degree vertices, directed needs balanced in/out with at most one +1 / -1 pair.",
    "**Hierholzer's algorithm** constructs one in **O(V + E)** time and **O(V + E)** space using a stack and a per-vertex edge pointer.",
  ],
  detailed: [
    "The degree conditions come from a simple accounting argument. Every visit to a vertex consumes one edge to arrive and one to leave, so interior vertices must have even degree; only the two endpoints of an open path can be left unpaired.\n\n| Graph | Circuit exists | Path exists |\n| --- | --- | --- |\n| Undirected | every degree even | exactly 0 or 2 odd-degree vertices |\n| Directed | `in(v) == out(v)` for all `v` | one vertex with `out - in == 1` (start), one with `in - out == 1` (end), rest balanced |",
    "Connectivity is the condition people forget. Degrees can be perfect while the edges sit in two separate clumps — no single walk can cover both.\n\nWarning: check connectivity over vertices **that have at least one edge**, ignoring isolated vertices. For directed graphs the requirement is that those vertices are connected in the underlying undirected sense; combined with the balance condition this implies the edges form one strongly connected block.",
    "Hierholzer works by splicing cycles, not by backtracking. Push the start vertex on a stack; repeatedly look at the top vertex and, if it still has an unused edge, consume it and push the head. When a vertex has no edges left, it is a dead end — pop it into the output. Reversing the output gives the tour. The per-vertex pointer `ptr[u]` never moves backward, so each edge is examined a constant number of times.\n\nCommon mistake: naive backtracking (\"try an edge, recurse, undo\") is exponential. Hierholzer never undoes a step — the popped dead ends are spliced into the answer in exactly the right order.",
    "For an undirected graph mark **edge ids**, not vertex pairs. Each undirected edge appears in two adjacency lists, so a shared `used[edgeId]` flag is what stops it being walked twice. Directed graphs need no flag: a monotone `ptr[u]` is enough.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Directed Hierholzer — iterative, returns E+1 vertices",
      source: `#include <bits/stdc++.h>
using namespace std;

// adj[u] = list of heads. Assumes an Eulerian path/circuit exists and
// 'start' is the correct starting vertex.
vector<int> eulerDirected(vector<vector<int>>& adj, int start) {
    int n = (int)adj.size();
    vector<int> ptr(n, 0), st, tour;
    st.push_back(start);

    while (!st.empty()) {
        int u = st.back();
        if (ptr[u] < (int)adj[u].size()) {
            st.push_back(adj[u][ptr[u]++]);   // consume one out-edge
        } else {
            tour.push_back(u);                // dead end: emit it
            st.pop_back();
        }
    }
    reverse(tour.begin(), tour.end());
    return tour;                              // size == E + 1 if valid
}

// Pick the start: the vertex with out - in == 1, else any vertex with edges.
int pickStartDirected(const vector<int>& in, const vector<int>& out) {
    int fallback = -1;
    for (int v = 0; v < (int)in.size(); ++v) {
        if (out[v] - in[v] == 1) return v;
        if (out[v] > 0 && fallback < 0) fallback = v;
    }
    return fallback;
}`,
    },
    {
      language: "cpp",
      caption: "Undirected Hierholzer — shared used[] flag per edge id",
      source: `// adj[u] = list of (v, edgeId); each edge appears in both endpoints' lists.
vector<int> eulerUndirected(const vector<vector<pair<int, int>>>& adj,
                            int m, int start) {
    vector<int> ptr(adj.size(), 0), st, tour;
    vector<char> used(m, 0);
    st.push_back(start);

    while (!st.empty()) {
        int u = st.back();
        while (ptr[u] < (int)adj[u].size() && used[adj[u][ptr[u]].second])
            ++ptr[u];                          // skip edges taken from the other side

        if (ptr[u] == (int)adj[u].size()) {
            tour.push_back(u);
            st.pop_back();
        } else {
            auto [v, id] = adj[u][ptr[u]++];
            used[id] = 1;
            st.push_back(v);
        }
    }
    reverse(tour.begin(), tour.end());
    return tour;
}`,
    },
  ],
  diagrams: [
    {
      title: "Existence test for an undirected graph",
      kind: "flow",
      caption: "Count odd-degree vertices, then confirm all edge-carrying vertices sit in one component.",
      mermaid: `flowchart TD
    A["Count degree of every vertex"] --> B{"Edges all in one component?"}
    B -- "no" --> X["Neither path nor circuit"]
    B -- "yes" --> C{"How many odd degrees?"}
    C -- "0" --> D["Eulerian circuit: start anywhere"]
    C -- "2" --> E["Eulerian path: start at an odd vertex"]
    C -- "other" --> X`,
    },
  ],
  cheatSheet: [
    "Hierholzer: O(V + E) time, O(V + E) space. Output has exactly E + 1 vertices.",
    "Undirected: 0 odd degrees = circuit, 2 odd = path, anything else = none.",
    "Directed: all balanced = circuit; one `out-in=1` and one `in-out=1` = path.",
    "Connectivity is checked only over vertices with degree > 0.",
    "Undirected needs `used[edgeId]`; directed needs only a monotone `ptr[u]`.",
  ],
  interviewQA: [
    {
      q: "Give the full existence conditions for an Eulerian path in a directed graph, and say why degree checks alone are not enough.",
      a: "Every vertex must satisfy in(v) == out(v), except that at most one vertex may have out - in == 1 (the start) and at most one may have in - out == 1 (the end); those two exceptions come as a pair or not at all. On top of that, all vertices with at least one incident edge must lie in a single connected component of the underlying undirected graph. Degrees alone are insufficient because two disjoint balanced cycles satisfy every degree constraint yet admit no single walk covering both — there is no edge to cross between them. Verifying both conditions is O(V + E), the same cost as constructing the tour.",
      followUps: ["How do you decide the start vertex when a circuit exists?", "What changes for a multigraph with self-loops?"],
    },
    {
      q: "Walk through why Hierholzer's stack version produces the tour in reverse, and what its complexity is.",
      a: "The stack holds the current partial walk. While the top vertex still has an unused edge we consume it and push the head, so the stack extends the walk greedily. When the top vertex has no unused edges left, the walk is stuck there — in a graph satisfying the Euler conditions that can only happen at the tour's true endpoint of the current cycle — so that vertex is finalised and popped into the output. Vertices are therefore emitted in order of when they become dead ends, which is the reverse of the tour; a final reverse fixes it, and any sub-cycles found later are spliced in automatically because they are popped between their neighbours. Each edge is pushed and popped once and the pointer ptr[u] only moves forward, giving O(V + E) time and O(V + E) space for the stack and output.",
    },
  ],
  flashcards: [
    { front: "Undirected Eulerian path condition?", back: "Exactly 0 or 2 odd-degree vertices, and all edge-carrying vertices in one connected component. Start at an odd vertex when there are two." },
    { front: "Directed Eulerian circuit condition?", back: "in(v) == out(v) for every vertex, plus all edge-carrying vertices connected." },
    { front: "Hierholzer complexity and output size?", back: "O(V + E) time and space; the tour lists E + 1 vertices." },
  ],
};
