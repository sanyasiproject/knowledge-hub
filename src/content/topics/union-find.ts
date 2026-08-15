import type { TopicContent } from "../types";

export const unionFind: TopicContent = {
  quickSummary: [
    "Maintains a partition of n elements under two operations: `find(x)` (which set?) and `unite(a, b)` (merge two sets).",
    "With **path compression + union by size/rank**, both run in **O(α(n))** amortized — inverse Ackermann, under 5 for any n you will ever see. Space is **O(n)**.",
    "Powers Kruskal's MST, dynamic connectivity, cycle detection in undirected graphs, and offline grouping problems.",
  ],
  detailed: [
    "Each set is a rooted tree, stored as a `parent[]` array; the root is the set's representative. `find` walks to the root, `unite` links one root under the other. Naive linking degenerates into a chain and makes `find` O(n), so both optimizations exist to keep trees shallow.",
    "Union by size (or rank) always attaches the smaller tree under the larger, bounding depth at O(log n) on its own. Path compression re-points every node visited during a `find` directly at the root, flattening the path for all future queries. Together they give the α(n) bound; either alone gives O(log n).",
    "Cycle detection falls out for free: while scanning undirected edges, if `find(u) == find(v)` before uniting, that edge closes a cycle. This is exactly the test Kruskal uses to reject an edge.\n\nCommon mistake: calling `unite` and assuming the return value is a boolean “were they different?”. Return that explicitly — Kruskal and cycle detection both depend on it.",
    "DSU is one-directional. It cannot split a set, and it cannot undo a union, because path compression destroys the original tree shape.\n\nIn practice: when you need undo (offline dynamic connectivity, segment-tree-on-time tricks), drop path compression and use union by size only, pushing each link onto a rollback stack. Operations become O(log n) but every union becomes reversible.",
  ],
  code: [
    {
      language: "cpp",
      caption: "DSU with path compression and union by size",
      source: `#include <bits/stdc++.h>
using namespace std;

struct DSU {
    vector<int> parent, sz;
    int components;

    explicit DSU(int n) : parent(n), sz(n, 1), components(n) {
        iota(parent.begin(), parent.end(), 0);   // parent[i] = i
    }

    int find(int x) {                            // path compression
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];       // path halving
            x = parent[x];
        }
        return x;
    }

    bool unite(int a, int b) {                   // false if already joined
        a = find(a);
        b = find(b);
        if (a == b) return false;
        if (sz[a] < sz[b]) swap(a, b);           // union by size
        parent[b] = a;
        sz[a] += sz[b];
        --components;
        return true;
    }

    bool connected(int a, int b) { return find(a) == find(b); }
    int size(int x) { return sz[find(x)]; }
};`,
    },
    {
      language: "cpp",
      caption: "Cycle detection in an undirected graph",
      source: `bool hasCycle(int n, const vector<pair<int, int>>& edges) {
    DSU dsu(n);
    for (auto [u, v] : edges)
        if (!dsu.unite(u, v))    // endpoints already in the same set
            return true;
    return false;
}
// A connected undirected graph is a tree iff
// edges.size() == n - 1 and hasCycle() is false.`,
    },
  ],
  diagrams: [
    {
      title: "Path compression flattens the tree",
      kind: "flow",
      caption: "Before: find(4) walks a chain. After: every node on the path points straight at the root.",
      mermaid: `flowchart LR
    subgraph Before
      B1["1 (root)"] --> B2["2"]
      B2 --> B3["3"]
      B3 --> B4["4"]
    end
    subgraph After
      A1["1 (root)"] --> A2["2"]
      A1 --> A3["3"]
      A1 --> A4["4"]
    end`,
    },
  ],
  cheatSheet: [
    "O(α(n)) amortized per op with both optimizations; O(n) space.",
    "`iota(parent.begin(), parent.end(), 0)` to initialize.",
    "`unite` returns false when already connected — that is your cycle test.",
    "Track `components` and `sz[root]` for free connectivity stats.",
    "No undo: for rollback, drop path compression and keep a union stack.",
  ],
  interviewQA: [
    {
      q: "What do path compression and union by size each contribute, and what is the combined complexity?",
      a: "Union by size keeps trees balanced by always hanging the smaller tree under the larger, so any node's depth is O(log n) — a node's depth only increases when its set at least doubles. Path compression re-points every node on a find path directly to the root, so repeated queries get cheaper. Either optimization alone gives O(log n) amortized; together they give O(α(n)) amortized, where α is the inverse Ackermann function and is at most 4 for n below 2^65536. Space is O(n) for the parent and size arrays.",
      followUps: ["Why is the α(n) bound amortized rather than worst case per operation?"],
    },
    {
      q: "Why can't DSU support deleting an edge or splitting a set?",
      a: "The structure only ever merges, and path compression rewrites parent pointers so the history of how sets were built is lost — there is no record of which subtree came from where. Two standard workarounds: process the problem offline in reverse, turning deletions into unions (useful when all queries are known upfront), or use rollback DSU — union by size with no path compression, pushing each modified (node, size) pair onto a stack so a union can be undone in O(1). Rollback costs O(log n) per operation and is the basis of offline dynamic connectivity via divide and conquer on time.",
    },
  ],
  flashcards: [
    { front: "DSU complexity with path compression + union by size?", back: "O(α(n)) amortized per operation (α < 5 in practice), O(n) space." },
    { front: "How does DSU detect a cycle in an undirected graph?", back: "If find(u) == find(v) before uniting edge (u, v), that edge closes a cycle." },
    { front: "How do you make DSU unions reversible?", back: "Drop path compression, use union by size only, and push each link onto a rollback stack — O(log n) per op." },
  ],
};
