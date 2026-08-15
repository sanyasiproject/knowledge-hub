import type { TopicContent } from "../types";

export const lcaBinaryLifting: TopicContent = {
  quickSummary: [
    "Precompute `up[k][v]` = the 2^k-th ancestor of v, in **O(n log n)** time and **O(n log n)** space.",
    "Query: lift the deeper node to the shallower one's depth, then jump both up together while their ancestors differ — **O(log n)** per query.",
    "Once you have LCA, tree distance is `depth[u] + depth[v] − 2 · depth[lca(u, v)]`.",
  ],
  detailed: [
    "Every jump length decomposes into powers of two, so any ancestor is reachable in at most log n hops. The table is built with one recurrence: `up[k][v] = up[k-1][ up[k-1][v] ]` — going up 2^k equals going up 2^(k−1) twice. A single DFS fills `depth[]` and `up[0][v] = parent[v]`, then log n passes fill the rest.",
    "The query has two phases. First equalize depths: lift the deeper node by `d = depth[u] − depth[v]`, taking every bit set in d. If the two nodes coincide now, that node was an ancestor of the other and is the answer.\n\nKey insight: in the second phase you jump only when `up[k][u] != up[k][v]`. Jumping while the ancestors are *equal* would overshoot past the LCA; by refusing those jumps from the largest k down, both nodes land exactly on the LCA's children, so `up[0][u]` is the answer.",
    "Use a sentinel root parent (`up[k][root] = root`, or 0 with 1-indexing) so overshooting a jump is harmless instead of out-of-bounds.\n\nCommon mistake: sizing LOG too small. You need LOG > log2(n) — for n = 2·10⁵ use LOG = 18 or 20. Also prefer an iterative DFS for deep chains; a recursive one stack-overflows around n = 10⁵.",
    "The same table answers more than LCA: k-th ancestor of v in O(log n), and, by storing an aggregate alongside (min/max/sum edge on the 2^k jump), path minimum or maximum in O(log n).\n\nIn practice: if you only need LCA and can afford the setup, Euler tour + sparse table gives O(1) queries with O(n log n) build; binary lifting wins when you also need k-th ancestor or path aggregates.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Binary lifting: build in O(n log n), query LCA in O(log n)",
      source: `#include <bits/stdc++.h>
using namespace std;

struct LCA {
    int n, LOG;
    vector<vector<int>> up;      // up[k][v] = 2^k-th ancestor of v
    vector<int> depth;

    LCA(int n, const vector<vector<int>>& adj, int root) : n(n) {
        LOG = 1;
        while ((1 << LOG) <= n) ++LOG;          // LOG > log2(n)
        up.assign(LOG, vector<int>(n));
        depth.assign(n, 0);

        // iterative DFS: safe for deep trees
        vector<pair<int, int>> stk{{root, root}};
        while (!stk.empty()) {
            auto [v, p] = stk.back();
            stk.pop_back();
            up[0][v] = p;                       // root's parent is itself
            for (int to : adj[v])
                if (to != p) { depth[to] = depth[v] + 1; stk.push_back({to, v}); }
        }
        for (int k = 1; k < LOG; ++k)
            for (int v = 0; v < n; ++v)
                up[k][v] = up[k - 1][up[k - 1][v]];
    }

    int kthAncestor(int v, int k) const {
        for (int b = 0; b < LOG && v != -1; ++b)
            if (k >> b & 1) v = up[b][v];
        return v;
    }

    int lca(int u, int v) const {
        if (depth[u] < depth[v]) swap(u, v);
        int diff = depth[u] - depth[v];
        for (int k = 0; k < LOG; ++k)           // phase 1: equalize depth
            if (diff >> k & 1) u = up[k][u];
        if (u == v) return u;                   // v was an ancestor of u

        for (int k = LOG - 1; k >= 0; --k)      // phase 2: jump together
            if (up[k][u] != up[k][v]) { u = up[k][u]; v = up[k][v]; }
        return up[0][u];                        // one step above = LCA
    }

    int dist(int u, int v) const {
        return depth[u] + depth[v] - 2 * depth[lca(u, v)];
    }
};`,
    },
  ],
  diagrams: [
    {
      title: "Two-phase LCA query",
      kind: "flow",
      caption: "Equalize depths first, then jump both nodes up only while their 2^k ancestors differ.",
      mermaid: `flowchart TD
    A["Make u the deeper node"] --> B["Lift u by depth[u] - depth[v] using set bits"]
    B --> C{"u == v?"}
    C -- "yes" --> D["v was an ancestor: answer is v"]
    C -- "no" --> E["For k = LOG-1 down to 0"]
    E --> F{"up[k][u] != up[k][v]?"}
    F -- "yes" --> G["u = up[k][u]; v = up[k][v]"]
    F -- "no" --> H["Skip: this jump would overshoot"]
    G --> E
    H --> E
    E --> I["Answer is up[0][u]"]`,
    },
  ],
  cheatSheet: [
    "Build O(n log n) time and space; query O(log n).",
    "`up[k][v] = up[k-1][up[k-1][v]]`.",
    "Phase 2 jumps only when `up[k][u] != up[k][v]`; answer is `up[0][u]`.",
    "dist(u, v) = depth[u] + depth[v] − 2 · depth[lca(u, v)].",
    "LOG = 20 covers n up to 10⁶; use a sentinel root parent.",
  ],
  interviewQA: [
    {
      q: "In phase two, why jump only when the two 2^k ancestors differ?",
      a: "The invariant is that u and v always stay strictly below the LCA. If up[k][u] == up[k][v], that shared ancestor is at or above the LCA, so taking the jump could overshoot and lose the answer. If they differ, both jumps are still strictly below the LCA, so the jump is safe. Processing k from high to low is a greedy binary decomposition of the unknown distance to the LCA's children: after the loop, neither node can move any further without meeting, meaning both sit exactly one edge below the LCA, so up[0][u] is it. Each query touches each k once, giving O(log n).",
      followUps: ["How would you extend this to return the maximum edge weight on the u–v path?"],
    },
    {
      q: "Compare binary lifting with Euler tour + sparse table for LCA.",
      a: "Binary lifting builds in O(n log n) time and O(n log n) space and answers in O(log n). Euler tour plus sparse table over the depth array builds in O(n log n) time and O(n log n) space but answers in O(1), since the LCA is the minimum-depth entry in a range of the Euler tour. If queries are the only cost that matters and you have many of them, the Euler tour version is faster. Binary lifting is preferred when you also need k-th ancestor queries, path aggregates such as max edge weight, or when the tree is built incrementally, because the same table serves all of them with one recurrence.",
    },
  ],
  flashcards: [
    { front: "Binary lifting build and query complexity?", back: "Build O(n log n) time and O(n log n) space; LCA or k-th ancestor query O(log n)." },
    { front: "The binary lifting recurrence?", back: "up[k][v] = up[k-1][up[k-1][v]] — a 2^k jump is two 2^(k-1) jumps." },
    { front: "Tree distance from LCA?", back: "dist(u, v) = depth[u] + depth[v] − 2 · depth[lca(u, v)]." },
  ],
};
