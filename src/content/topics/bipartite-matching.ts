import type { TopicContent } from "../types";

export const bipartiteMatching: TopicContent = {
  quickSummary: [
    "Pick the largest set of edges in a bipartite graph such that no vertex is used twice — assignments of workers to jobs, students to slots, rows to columns.",
    "**Kuhn's algorithm** repeatedly looks for an augmenting path from an unmatched left vertex: **O(V·E)** time, **O(V + E)** space. **Hopcroft-Karp** batches augmenting paths by length for **O(E·√V)**.",
    "**König's theorem**: in a bipartite graph, *maximum matching = minimum vertex cover*, and the complement of that cover is the *maximum independent set*.",
  ],
  detailed: [
    "An augmenting path alternates unmatched and matched edges, starting and ending at free vertices. Flipping every edge along it increases the matching size by exactly one, because the path has one more unmatched edge than matched. Berge's theorem says a matching is maximum precisely when no augmenting path exists — that is the entire correctness argument for both algorithms.",
    "Kuhn's is a DFS with one subtlety: the `used[]` marker. It marks right-side vertices visited *within the current augmentation attempt*, and must be reset before each left vertex is processed, never inside the recursion.\n\nCommon mistake: resetting `used[]` inside `tryKuhn`, which lets one attempt revisit the same right vertex and loop forever, or clearing it once for the whole run, which silently misses valid augmentations.",
    "Hopcroft-Karp is Dinic specialised to unit capacities. A BFS layers the graph by distance, then a DFS finds a maximal set of *vertex-disjoint* shortest augmenting paths at once. Shortest augmenting-path length strictly grows each phase, so there are O(√V) phases, giving O(E·√V). Use it when V is large (say ≥ 10⁴) or the graph is dense; Kuhn's is fine below that and much shorter to write.",
    "König's theorem turns matching into a covering answer. Compute a maximum matching, then take `Z` = vertices reachable by alternating paths from unmatched left vertices; the minimum vertex cover is `(Left \\ Z) ∪ (Right ∩ Z)`. Maximum independent set is everything not in that cover.\n\nKey insight: whenever a problem asks for the fewest rows-plus-columns covering all marked cells, it is a minimum vertex cover, hence a maximum matching.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Kuhn's augmenting-path matching, O(V·E)",
      source: `#include <bits/stdc++.h>
using namespace std;

int nLeft, nRight;
vector<vector<int>> adj;   // adj[u] = right vertices adjacent to left vertex u
vector<int> matchR;        // matchR[v] = left vertex matched to right v, or -1
vector<char> used;         // right vertices tried in the CURRENT attempt

bool tryKuhn(int u) {
    for (int v : adj[u]) {
        if (used[v]) continue;
        used[v] = 1;
        // v is free, or its current partner can move somewhere else
        if (matchR[v] == -1 || tryKuhn(matchR[v])) {
            matchR[v] = u;
            return true;
        }
    }
    return false;
}

int maxMatching() {
    matchR.assign(nRight, -1);
    int res = 0;
    for (int u = 0; u < nLeft; ++u) {
        used.assign(nRight, 0);       // reset ONCE per left vertex
        if (tryKuhn(u)) ++res;
    }
    return res;                        // matchR holds the actual pairing
}`,
    },
    {
      language: "cpp",
      caption: "Minimum vertex cover from a maximum matching (König)",
      source: `// matchL[u] / matchR[v] describe a MAXIMUM matching.
// Alternating BFS from every unmatched left vertex marks the set Z.
pair<vector<int>, vector<int>> minVertexCover(const vector<vector<int>>& adj,
                                              const vector<int>& matchL,
                                              const vector<int>& matchR) {
    int nL = (int)matchL.size(), nR = (int)matchR.size();
    vector<char> zL(nL, 0), zR(nR, 0);
    queue<int> q;
    for (int u = 0; u < nL; ++u)
        if (matchL[u] == -1) { zL[u] = 1; q.push(u); }

    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u]) {
            if (v == matchL[u] || zR[v]) continue;   // walk unmatched edges forward
            zR[v] = 1;
            int w = matchR[v];                       // walk the matched edge back
            if (w != -1 && !zL[w]) { zL[w] = 1; q.push(w); }
        }
    }

    vector<int> coverL, coverR;
    for (int u = 0; u < nL; ++u) if (!zL[u]) coverL.push_back(u);   // Left \\ Z
    for (int v = 0; v < nR; ++v) if (zR[v]) coverR.push_back(v);    // Right n Z
    return {coverL, coverR};             // size == maximum matching
}`,
    },
  ],
  comparison: {
    columns: ["Approach", "Time", "Space", "Use when"],
    rows: [
      ["Kuhn (augmenting DFS)", "O(V · E)", "O(V + E)", "Default; simplest to write, fast in practice"],
      ["Hopcroft-Karp", "O(E · √V)", "O(V + E)", "Large or dense bipartite graphs"],
      ["Dinic on a unit network", "O(E · √V)", "O(V + E)", "You already have a flow template"],
      ["Hungarian algorithm", "O(V³)", "O(V²)", "Weighted assignment (minimum total cost), not just cardinality"],
    ],
  },
  cheatSheet: [
    "Kuhn: O(V·E) time, O(V + E) space. Hopcroft-Karp: O(E·√V).",
    "`used[]` is per-left-vertex — reset it in `maxMatching`, never inside the DFS.",
    "Berge: matching is maximum iff no augmenting path exists.",
    "König (bipartite only): max matching = min vertex cover; max independent set = V − max matching.",
    "Weighted assignment is a different problem: Hungarian O(V³) or min-cost max-flow.",
  ],
  interviewQA: [
    {
      q: "Explain König's theorem and give a problem where you would use it.",
      a: "In a bipartite graph the size of a maximum matching equals the size of a minimum vertex cover. Constructively: take a maximum matching, let Z be all vertices reachable from unmatched left vertices along alternating paths, and the cover is (Left minus Z) union (Right intersect Z). The classic use is a grid where you may delete an entire row or column and must remove all marked cells with as few deletions as possible — model rows as left vertices, columns as right vertices, and each marked cell as an edge. The minimum number of deletions is the minimum vertex cover, which equals the maximum matching, computable with Kuhn in O(V·E). The complement gives maximum independent set, which answers 'place as many non-attacking pieces as possible' variants. Note the equality is bipartite-only; in general graphs minimum vertex cover is NP-hard.",
      followUps: ["What is the corresponding statement for maximum independent set?", "How does Hall's theorem relate to a perfect matching existing?"],
    },
    {
      q: "When would you switch from Kuhn's algorithm to Hopcroft-Karp?",
      a: "When V·E stops being acceptable. Kuhn runs one DFS per left vertex, each costing O(E), so it is O(V·E) worst case — perfectly fine up to roughly a few thousand vertices, and often much faster in practice with a greedy initial matching. Hopcroft-Karp finds a maximal set of vertex-disjoint shortest augmenting paths per phase; because the shortest augmenting length strictly increases each phase, only O(√V) phases are needed, giving O(E·√V). I reach for it on graphs with tens of thousands of vertices or dense edge sets. Both use O(V + E) space. If the edges carry weights and the objective is minimum total cost rather than maximum count, neither applies — that is the Hungarian algorithm or min-cost max-flow.",
    },
  ],
  flashcards: [
    { front: "Kuhn's algorithm complexity?", back: "O(V·E) time, O(V + E) space — one O(E) DFS per left vertex." },
    { front: "König's theorem?", back: "In a bipartite graph, maximum matching size = minimum vertex cover size; the complement of the cover is a maximum independent set." },
    { front: "What makes a path augmenting?", back: "It alternates unmatched and matched edges and both endpoints are free; flipping it grows the matching by one (Berge's theorem)." },
  ],
};
