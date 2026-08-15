import type { TopicContent } from "../types";

export const stronglyConnectedComponents: TopicContent = {
  quickSummary: [
    "An SCC of a directed graph is a maximal set of vertices where every vertex reaches every other. Undirected connectivity does not apply — you need a dedicated algorithm.",
    "Kosaraju's: DFS the graph pushing vertices on finish, then DFS the **transpose** in reverse finish order — each tree is one SCC. Two passes, O(V + E) time, O(V) space.",
    "Contracting each SCC to a single node yields the condensation graph, which is always a DAG — so DAG techniques (topological sort, longest path, DP) become available on any digraph.",
  ],
  detailed: [
    `Two vertices are strongly connected when u reaches v *and* v reaches u. That relation is an equivalence relation, so it partitions the vertices into SCCs. In an undirected graph this collapses to ordinary connected components; in a directed graph it is genuinely harder, because reachability is one-way.

Where it shows up: deadlock and dependency-cycle detection, 2-SAT (a formula is satisfiable iff no variable shares an SCC with its negation), and collapsing cyclic module graphs before topologically ordering them.`,
    `## Kosaraju's algorithm

1. **Pass 1** — run DFS over all vertices on G. When a vertex finishes, push it onto a stack (this is the reverse topological order of the condensation).
2. **Transpose** — build G^T with every edge reversed.
3. **Pass 2** — pop vertices from the stack; for each still-unvisited vertex, DFS on G^T. Every vertex that DFS reaches belongs to the same SCC.

Why it works: the vertex with the largest finish time lies in a *source* SCC of the condensation. Reversing all edges makes that a *sink*, so DFS from it cannot escape its own SCC — it collects exactly that SCC and stops. Remove it and repeat; the stack order guarantees each new start is again in a source SCC of what remains.

Two DFS passes plus building the transpose is O(V + E) time and O(V + E) space (the transpose costs as much as the graph).`,
    `## Condensation graph

Replace each SCC with one node, keep an edge between two SCC-nodes if any original edge crosses between them. The result has no cycles: a cycle across two SCCs would make all their vertices mutually reachable, contradicting maximality.

Key insight: the condensation being a DAG is the payoff. Any algorithm that needs acyclicity — topological order, longest path, DP over dependencies — can be run on an arbitrary digraph by condensing it first. Pass 2 of Kosaraju emits SCCs in reverse topological order of the condensation, so you often get that ordering for free.`,
    `In practice: Tarjan's algorithm computes the same partition in a **single** DFS using discovery indices and low-link values, and never builds the transpose — better constants and half the memory. Mention it, but write Kosaraju in an interview unless asked otherwise: it is far easier to state correctly under pressure and both are O(V + E).

Warning: both are recursive by default. On graphs with 10^5 or more vertices in a long chain, convert to an explicit stack or raise the stack limit.`,
  ],
  code: [
    {
      language: "cpp",
      caption: "Kosaraju's two-pass SCC — component ids in reverse topological order (0-indexed)",
      source: `#include <bits/stdc++.h>
using namespace std;

// comp[v] = SCC id. Ids are assigned in REVERSE topological order of the
// condensation (id 0 is a source SCC). Returns the number of SCCs.
// O(V + E) time, O(V + E) space.
int kosaraju(int n, const vector<vector<int>>& adj, vector<int>& comp) {
    vector<vector<int>> radj(n);
    for (int u = 0; u < n; ++u)
        for (int v : adj[u]) radj[v].push_back(u);   // transpose

    vector<char> seen(n, 0);
    vector<int> order;                                // finish order
    order.reserve(n);

    // Pass 1: DFS on G, push each vertex when it finishes.
    function<void(int)> dfs1 = [&](int u) {
        seen[u] = 1;
        for (int v : adj[u]) if (!seen[v]) dfs1(v);
        order.push_back(u);
    };
    for (int v = 0; v < n; ++v) if (!seen[v]) dfs1(v);

    // Pass 2: DFS on G^T in decreasing finish time.
    comp.assign(n, -1);
    int nComp = 0;
    function<void(int,int)> dfs2 = [&](int u, int c) {
        comp[u] = c;
        for (int v : radj[u]) if (comp[v] == -1) dfs2(v, c);
    };
    for (int i = n - 1; i >= 0; --i) {
        int v = order[i];
        if (comp[v] == -1) dfs2(v, nComp++);
    }
    return nComp;
}`,
    },
    {
      language: "cpp",
      caption: "Building the condensation DAG from the SCC labels",
      source: `#include <bits/stdc++.h>
using namespace std;

// Given comp[] from kosaraju() and nComp SCCs, build the condensation.
// The result is guaranteed acyclic, so it can be topologically sorted.
// O(V + E) time; duplicate cross-edges are removed with a sort + unique.
vector<vector<int>> condensation(int n, int nComp,
                                 const vector<vector<int>>& adj,
                                 const vector<int>& comp) {
    vector<vector<int>> dag(nComp);
    for (int u = 0; u < n; ++u)
        for (int v : adj[u])
            if (comp[u] != comp[v])          // drop intra-SCC edges
                dag[comp[u]].push_back(comp[v]);

    for (auto& lst : dag) {
        sort(lst.begin(), lst.end());
        lst.erase(unique(lst.begin(), lst.end()), lst.end());
    }
    return dag;
}`,
    },
  ],
  diagrams: [
    {
      title: "SCCs and their condensation",
      kind: "flow",
      caption:
        "A<->B and C<->D<->C are each strongly connected; contracting them leaves S0 -> S1 -> S2, an acyclic graph.",
      mermaid: `flowchart LR
    subgraph S0["SCC 0"]
      A["A"] --> B["B"]
      B --> A
    end
    subgraph S1["SCC 1"]
      C["C"] --> D["D"]
      D --> C
    end
    subgraph S2["SCC 2"]
      E["E"]
    end
    B --> C
    D --> E`,
    },
  ],
  cheatSheet: [
    "Kosaraju: DFS pushing on finish, transpose, DFS in reverse finish order. O(V + E) time, O(V + E) space.",
    "Tarjan does the same in one DFS with low-link values and no transpose — same O(V + E), better constants.",
    "The condensation graph is always a DAG; that is what makes SCCs useful.",
    "Kosaraju's pass 2 emits SCCs in reverse topological order of the condensation.",
    "Undirected graphs have no SCC problem — use plain connected components.",
    "2-SAT: satisfiable iff no variable x has x and NOT x in the same SCC of the implication graph.",
  ],
  interviewQA: [
    {
      q: "Explain Kosaraju's algorithm and why the two passes give exactly the SCCs.",
      a: "First run DFS over every vertex of G and push each vertex onto a stack as it finishes, which orders vertices by decreasing finish time. Then build the transpose G^T with all edges reversed, and pop vertices off the stack; for each one not yet assigned, DFS on G^T and label everything it reaches as one SCC. The correctness rests on the condensation: the vertex with the highest finish time always lies in a source SCC of the condensation, and transposing turns sources into sinks. A DFS started in a sink SCC of G^T cannot leave that SCC, so it captures exactly one component and no more. Removing it and repeating preserves the property, so each subsequent start is again in a source SCC of the remaining graph. Both passes plus the transpose are O(V + E) time and O(V + E) space. Tarjan's algorithm reaches the same result in a single DFS using discovery and low-link values with no transpose, so it is faster in practice, but Kosaraju is easier to state correctly and I would write it first unless asked for one-pass.",
      followUps: [
        "How would you use SCCs to solve 2-SAT?",
        "What does the SCC ordering from pass 2 give you for free?",
      ],
    },
    {
      q: "Why does anyone care about the condensation graph?",
      a: "Contracting each SCC to a single node produces a graph that is provably acyclic — if a cycle existed between two SCC nodes, every vertex in both would be mutually reachable and the two SCCs would actually be one, contradicting maximality. That turns a general directed graph into a DAG in O(V + E), which unlocks every technique that requires acyclicity: topological ordering, longest-path DP, dependency scheduling, reachability counting. A concrete example is a module or task graph containing cyclic dependencies — you cannot topologically sort it directly, but you can condense the cycles into single units and order those. It also gives clean structural answers, such as the minimum number of edges to add to make a digraph strongly connected, which is max(sources, sinks) in the condensation when it has more than one node.",
    },
  ],
  flashcards: [
    {
      front: "Kosaraju's algorithm in one line?",
      back: "DFS on G pushing vertices on finish; DFS on the transpose in decreasing finish order — each tree is one SCC. O(V + E).",
    },
    {
      front: "Why is the condensation graph always a DAG?",
      back: "A cycle among SCC nodes would make all their vertices mutually reachable, so they would form one larger SCC — contradicting maximality.",
    },
    {
      front: "Kosaraju vs Tarjan?",
      back: "Both O(V + E). Kosaraju uses two DFS passes plus a transpose (O(V + E) extra memory); Tarjan uses one DFS with low-link values and no transpose.",
    },
  ],
};
