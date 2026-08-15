import type { TopicContent } from "../types";

export const kthAncestor: TopicContent = {
  quickSummary: [
    "Precompute `up[b][v]` = the ancestor of `v` exactly `2^b` levels up, built from `up[b][v] = up[b-1][up[b-1][v]]`.",
    "Build is **O(n log n)** time and **O(n log n)** space; each k-th ancestor query is **O(log n)** — jump once per set bit of `k`.",
    "The same table gives **LCA in O(log n)**: level the two nodes, then descend the powers while the ancestors differ.",
  ],
  detailed: [
    "Binary lifting is just binary decomposition of the jump length. Any `k` is a sum of distinct powers of two, so climbing `k` levels is at most `log n` precomputed hops. The table is filled level by level over `b`, and every cell is one array lookup, which is why the build is exactly `n log n` operations rather than anything cleverer.",
    "Sentinels keep the code branch-free. Store `-1` (or the root itself) for jumps that run off the top; with `-1` you must guard the lookup, with the root-as-own-parent convention `up[b][root] = root` the query never leaves the array and a query beyond the root silently returns the root.\n\nCommon mistake: not checking `k > depth[v]` before jumping. Whichever sentinel you choose, an out-of-range `k` should be answered from the depth array up front — `if (k > depth[v]) return -1;` — rather than trusted to the table.",
    "LCA composes directly on top. Lift the deeper node by the depth difference so both sit on the same level; if they coincide, that node is the answer. Otherwise walk `b` from high to low and jump both nodes `u`, `v` whenever `up[b][u] != up[b][v]` — that keeps them strictly below the LCA — and the answer is `up[0][u]` at the end. Same O(log n) per query, no extra memory.\n\nKey insight: the descending loop works because \"ancestors still differ\" is monotone in the jump length. Jumping only when they differ is a greedy binary search for the highest node where they are not yet merged.",
    "Alternatives worth naming. Euler-tour plus a sparse table answers LCA in O(1) after O(n log n) preprocessing but does not give k-th ancestor directly; the ladder decomposition combined with jump pointers reaches O(1) k-th ancestor after O(n log n) preprocessing. Binary lifting stays the default because it is short, cache-friendly enough, and handles both queries with one table.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Build the jump table iteratively and answer k-th ancestor",
      source: `#include <bits/stdc++.h>
using namespace std;

int LOG;
vector<vector<int>> up;     // up[b][v] = 2^b-th ancestor of v, or -1
vector<int> depthOf;

void buildLifting(const vector<vector<int>>& adj, int root) {
    int n = (int)adj.size();
    LOG = 1;
    while ((1 << LOG) < n) ++LOG;              // LOG >= ceil(log2 n)

    up.assign(LOG + 1, vector<int>(n, -1));
    depthOf.assign(n, 0);

    vector<char> seen(n, 0);
    vector<int> st{root};
    seen[root] = 1;
    up[0][root] = -1;

    while (!st.empty()) {                      // iterative DFS: no stack overflow
        int u = st.back();
        st.pop_back();
        for (int v : adj[u]) {
            if (seen[v]) continue;
            seen[v] = 1;
            up[0][v] = u;
            depthOf[v] = depthOf[u] + 1;
            st.push_back(v);
        }
    }

    for (int b = 1; b <= LOG; ++b)
        for (int v = 0; v < n; ++v) {
            int mid = up[b - 1][v];
            up[b][v] = (mid < 0) ? -1 : up[b - 1][mid];
        }
}

// -1 when v has fewer than k ancestors.
int kthAncestor(int v, int k) {
    if (k > depthOf[v]) return -1;
    for (int b = 0; b <= LOG && v != -1; ++b)
        if ((k >> b) & 1) v = up[b][v];
    return v;
}`,
    },
    {
      language: "cpp",
      caption: "LCA reusing the same table",
      source: `int lca(int a, int b) {
    if (depthOf[a] < depthOf[b]) swap(a, b);
    a = kthAncestor(a, depthOf[a] - depthOf[b]);   // level them
    if (a == b) return a;

    for (int k = LOG; k >= 0; --k)
        if (up[k][a] != up[k][b]) {                // still below the LCA
            a = up[k][a];
            b = up[k][b];
        }
    return up[0][a];
}

// distance in edges between a and b
int distTree(int a, int b) {
    int l = lca(a, b);
    return depthOf[a] + depthOf[b] - 2 * depthOf[l];
}`,
    },
  ],
  diagrams: [
    {
      title: "Answering a k-th ancestor query",
      kind: "flow",
      caption: "Reject impossible k from the depth array, then apply one table jump per set bit.",
      mermaid: `flowchart TD
    A["query (v, k)"] --> B{"k > depth[v]?"}
    B -- "yes" --> C["return -1"]
    B -- "no" --> D["b = 0"]
    D --> E{"bit b of k set?"}
    E -- "yes" --> F["v = up[b][v]"]
    E -- "no" --> G["skip"]
    F --> H{"more bits?"}
    G --> H
    H -- "yes" --> I["b = b + 1"]
    I --> E
    H -- "no" --> J["return v"]`,
    },
  ],
  cheatSheet: [
    "Build: O(n log n) time and O(n log n) space. Query: O(log n).",
    "Recurrence: `up[b][v] = up[b-1][up[b-1][v]]`, with `up[0][v] = parent(v)`.",
    "Guard with `if (k > depth[v]) return -1;` before jumping.",
    "LCA: level the deeper node, then jump both while `up[k][a] != up[k][b]`, answer `up[0][a]`.",
    "`dist(a,b) = depth[a] + depth[b] - 2*depth[lca(a,b)]`.",
  ],
  interviewQA: [
    {
      q: "Derive the build recurrence and its cost, and explain the query.",
      a: "up[0][v] is the direct parent. A 2^b jump is two 2^(b-1) jumps, so up[b][v] = up[b-1][up[b-1][v]]; filling the table needs b from 1 to log n over all n nodes, each cell a single lookup, giving O(n log n) time and O(n log n) memory. A query for the k-th ancestor writes k in binary and applies up[b] for each set bit — the order does not matter because jumps compose — so at most log n hops, O(log n) per query. Nodes with fewer than k ancestors are rejected up front with a depth check, or handled by a -1 sentinel propagated through the table.",
      followUps: ["How much memory for n = 2·10^5?", "How would you get O(1) k-th ancestor?"],
    },
    {
      q: "Why does the LCA descent jump only when the two candidate ancestors differ?",
      a: "After levelling, define the predicate 'the 2^k-th ancestor of a differs from the 2^k-th ancestor of b'. It is true precisely while the jump lands strictly below the LCA, and false once the jump reaches the LCA or above it — so it is monotone in the jump size. Sweeping k from high to low and jumping only when the ancestors differ is a greedy binary search that lands both nodes on the two distinct children of the LCA; one more single-step hop, up[0][a], is the answer. Skipping the inequality check would overshoot past the LCA and return a wrong, higher node. Cost is O(log n) per query with no memory beyond the table already built.",
    },
  ],
  flashcards: [
    { front: "Binary lifting build recurrence?", back: "up[b][v] = up[b-1][up[b-1][v]], with up[0][v] = parent(v)." },
    { front: "Binary lifting complexities?", back: "O(n log n) build time and space; O(log n) per k-th ancestor or LCA query." },
    { front: "LCA final step after the descending loop?", back: "Return up[0][a] — both nodes end up on distinct children of the LCA." },
  ],
};
