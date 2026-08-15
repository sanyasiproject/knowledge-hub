import type { TopicContent } from "../types";

export const eulerTourTechnique: TopicContent = {
  quickSummary: [
    "Flatten a rooted tree with a DFS timer: `tin[v]` is the entry index and `tout[v]` the last index inside `v`'s subtree.",
    "The subtree of `v` becomes the **contiguous range `[tin[v], tout[v]]`**, so subtree queries turn into array range queries handled by a BIT or segment tree.",
    "Flattening is **O(n)** time and space; each point update or subtree query is then **O(log n)**.",
  ],
  detailed: [
    "The technique converts tree structure into array positions. A DFS assigns each node an increasing entry stamp; because DFS fully finishes a subtree before moving on, every descendant of `v` receives a stamp strictly between `tin[v]` and `tout[v]`. That single fact is the whole trick — no tree-shaped data structure is needed afterwards, just an array of length `n`.",
    "Two conventions exist and mixing them is the classic bug. The **entry-only** flattening used here gives each node one slot, `tout[v] = timer - 1` after the children, so the range is inclusive and `tout[v] - tin[v] + 1` is the subtree size. The **entry-and-exit** flattening pushes `v` twice into an array of length `2n`, which is what LCA-by-sparse-table and path-update tricks want.\n\nCommon mistake: writing `tout[v] = timer++` in the one-slot convention. That produces an exclusive bound and silently shifts every range by one; either be consistent with `[tin[v], tout[v])` everywhere or use the inclusive form throughout.",
    "Ancestry becomes two comparisons. `a` is an ancestor of `b` exactly when `tin[a] <= tin[b] && tout[b] <= tout[a]`, an O(1) test that replaces walking parent pointers. This is the building block for offline LCA, virtual trees, and \"is this update inside that subtree\" checks.\n\nIn practice: the technique handles subtree aggregates and point updates. Path queries need heavy-light decomposition or a BIT over an entry/exit array with +1 / -1 stamps.",
    "Use an iterative DFS for large trees. A tree of 2·10^5 nodes shaped like a path will blow the default recursion stack; an explicit stack with a child-pointer per node produces identical stamps at the same O(n) cost.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Iterative flattening: tin, tout (inclusive) and the flat order",
      source: `#include <bits/stdc++.h>
using namespace std;

// tin[v] = entry index, tout[v] = LAST index of v's subtree (inclusive).
// order[i] = the node occupying flat position i.
void eulerFlatten(const vector<vector<int>>& adj, int root,
                  vector<int>& tin, vector<int>& tout, vector<int>& order) {
    int n = (int)adj.size();
    tin.assign(n, 0);
    tout.assign(n, 0);
    order.assign(n, 0);

    vector<int> parent(n, -1), ptr(n, 0), st;
    int timer = 0;

    st.push_back(root);
    tin[root] = timer;
    order[timer++] = root;

    while (!st.empty()) {
        int u = st.back();
        if (ptr[u] < (int)adj[u].size()) {
            int v = adj[u][ptr[u]++];
            if (v == parent[u]) continue;
            parent[v] = u;
            tin[v] = timer;
            order[timer++] = v;
            st.push_back(v);
        } else {
            tout[u] = timer - 1;      // everything pushed since tin[u] is in u
            st.pop_back();
        }
    }
}

// O(1) ancestor test
bool isAncestor(int a, int b, const vector<int>& tin, const vector<int>& tout) {
    return tin[a] <= tin[b] && tout[b] <= tout[a];
}`,
    },
    {
      language: "cpp",
      caption: "Point update on a node, sum over its subtree, via a Fenwick tree",
      source: `struct BIT {
    int n;
    vector<long long> t;
    explicit BIT(int n) : n(n), t(n + 1, 0) {}

    void add(int i, long long delta) {            // 0-based index
        for (++i; i <= n; i += i & -i) t[i] += delta;
    }
    long long prefix(int i) const {               // sum of [0, i]
        long long s = 0;
        for (++i; i > 0; i -= i & -i) s += t[i];
        return s;
    }
    long long range(int l, int r) const {         // inclusive
        return prefix(r) - (l ? prefix(l - 1) : 0);
    }
};

// bit.add(tin[u], delta);                 // update node u
// bit.range(tin[u], tout[u]);             // sum over subtree of u
// int subtreeSize = tout[u] - tin[u] + 1;`,
    },
  ],
  diagrams: [
    {
      title: "Tree to array to range query",
      kind: "flow",
      caption: "One DFS assigns stamps; every subtree question becomes a contiguous range on the flat array.",
      mermaid: `flowchart TD
    A["Rooted tree"] --> B["DFS assigns tin[v] and tout[v]"]
    B --> C["Flat array of length n"]
    C --> D["Subtree of v = positions tin[v]..tout[v]"]
    D --> E["BIT or segment tree answers in O(log n)"]
    B --> F["Ancestor test in O(1)"]`,
    },
  ],
  cheatSheet: [
    "Flatten: O(n) time and space. Query/update afterwards: O(log n).",
    "Inclusive convention: `tout[v] = timer - 1`; subtree size = `tout[v] - tin[v] + 1`.",
    "Ancestor test: `tin[a] <= tin[b] && tout[b] <= tout[a]`.",
    "Subtree sum = `bit.range(tin[v], tout[v])`; node update = `bit.add(tin[v], d)`.",
    "Path queries need HLD; ETT alone covers subtrees.",
  ],
  interviewQA: [
    {
      q: "Why is a subtree guaranteed to be contiguous after a DFS flattening?",
      a: "DFS is depth-first: once it enters v it does not leave v's subtree until every descendant has been visited. So the timer values handed out between entering v and finishing v go exclusively to descendants of v, with no interleaving from outside. That makes tin[v] the smallest stamp in the subtree and tout[v] the largest, with every intermediate index also belonging to the subtree — a contiguous block of length equal to the subtree size. The flattening costs O(n) time and O(n) space, after which a Fenwick tree gives O(log n) point updates and subtree sums.",
      followUps: ["How would you extend this to subtree range-add plus subtree sum?", "What does the 2n entry/exit variant buy you?"],
    },
    {
      q: "Add x to every node in a subtree, and query a single node's value. How?",
      a: "Flip the roles of the update and the query. Build a Fenwick tree supporting range-add and point-query: to add x across the subtree of v, do add(tin[v], +x) and add(tout[v] + 1, -x) on a difference array; the value at node u is then the prefix sum up to tin[u]. Both operations are O(log n) with O(n) memory, and the flattening itself is a one-off O(n). If you need both subtree-add and subtree-sum, use a lazy-propagating segment tree over the same [tin[v], tout[v]] ranges, still O(log n) per operation. The key point is that the tree structure never enters the query — it was fully absorbed into the index mapping.",
    },
  ],
  flashcards: [
    { front: "What does the Euler tour technique give you?", back: "tin/tout stamps so each subtree is a contiguous array range — subtree queries become range queries." },
    { front: "Complexity of ETT plus a Fenwick tree?", back: "O(n) flatten time and space; O(log n) per point update or subtree query." },
    { front: "O(1) ancestor test using tin/tout?", back: "a is an ancestor of b iff tin[a] <= tin[b] and tout[b] <= tout[a]." },
  ],
};
