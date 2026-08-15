import type { TopicContent } from "../types";

export const dsuOnTree: TopicContent = {
  quickSummary: [
    "DSU on tree (small-to-large on subtrees) answers a query for **every** subtree offline by reusing one global counter array instead of rebuilding it per node.",
    "The trick: recurse into light children and erase their contribution, recurse into the heavy child **last** and keep its contribution, then re-add only the node itself plus the light subtrees.",
    "Every node is added/removed once per light edge above it, and a root-to-node path has at most `log n` light edges, so total work is O(n log n) time and O(n) extra space.",
  ],
  detailed: [
    "## The problem shape\n\nDSU on tree fits questions of the form *for each vertex `v`, report something about the multiset of values in the subtree of `v`* — most-frequent colour, number of distinct colours, count of a given value, sum of values appearing exactly once.\n\nThe brute force recomputes the multiset at each vertex: O(n) per vertex, O(n^2) overall. A merge-based fix (merge child maps into the parent) works but pays for allocating and moving maps.\n\nKey insight: you do not need per-node structures at all — one global `cnt[]` array is enough if you are disciplined about when you erase it.",
    "## Heavy child, kept; light children, recomputed\n\nDefine the **heavy child** of `v` as the child with the largest subtree. The recursion is:\n\n1. Visit every **light** child with `keep = false` — it computes its own answer and then wipes itself from `cnt[]`.\n2. Visit the **heavy** child with `keep = true` — its counts stay in `cnt[]`.\n3. Walk `v` and all light subtrees again, adding them into `cnt[]`. Now `cnt[]` describes exactly the subtree of `v`; record the answer.\n4. If `keep` is false, wipe the whole subtree of `v`.\n\nThe heavy child is never re-walked, which is where the saving comes from.",
    "## Why it is O(n log n)\n\nA vertex `u` is re-added at step 3 of an ancestor `v` only when the edge from `v` towards `u` is a **light** edge. Going down a light edge at least halves the subtree size, so any root-to-leaf path crosses at most `log2(n)` light edges.\n\nEach vertex is therefore touched O(log n) times, giving **O(n log n) time**. Memory is **O(n)**: adjacency, subtree sizes, the single `cnt[]` array, and the answers — no per-node containers.\n\n| Approach | Time | Space |\n| --- | --- | --- |\n| Recompute per subtree | O(n^2) | O(n) |\n| Merge maps small-to-large | O(n log n) with map constants | O(n) maps |\n| DSU on tree (this) | O(n log n) | O(n) flat arrays |",
    "## Constraints worth remembering\n\nThe technique is **offline and read-only**: it answers all subtree queries in one DFS pass and does not support updates interleaved with queries.\n\nThe aggregate must be maintainable by single-element `add` / `remove` calls in O(1) (or O(log n)) — a running distinct-count or frequency table qualifies; something like *median of the subtree* does not, unless you back it with an extra structure.\n\nCommon mistake: forgetting to erase the subtree when `keep` is false. The stale counts silently leak into a sibling's answer and the bug only shows on larger trees.",
  ],
  code: [
    {
      language: "cpp",
      caption: "DSU on tree — distinct colours in every subtree, O(n log n)",
      source: `#include <bits/stdc++.h>
using namespace std;

const int MAXN = 200005;

vector<int> adj[MAXN];
int col[MAXN], sz[MAXN], heavy[MAXN];
int cnt[MAXN];        // cnt[c] = how many nodes of colour c are currently "active"
int distinctNow = 0;  // number of colours with cnt > 0
int ans[MAXN];

void calcSize(int u, int p) {
    sz[u] = 1;
    heavy[u] = -1;
    int best = 0;
    for (int v : adj[u]) {
        if (v == p) continue;
        calcSize(v, u);
        sz[u] += sz[v];
        if (sz[v] > best) { best = sz[v]; heavy[u] = v; }
    }
}

// add = +1 inserts the subtree of u, add = -1 erases it; the subtree rooted
// at "skip" is left untouched (that is the heavy child we want to preserve).
void touch(int u, int p, int skip, int add) {
    if (add == 1) {
        if (cnt[col[u]]++ == 0) distinctNow++;
    } else {
        if (--cnt[col[u]] == 0) distinctNow--;
    }
    for (int v : adj[u])
        if (v != p && v != skip) touch(v, u, skip, add);
}

void dfs(int u, int p, bool keep) {
    // light children first, each one cleaning up after itself
    for (int v : adj[u])
        if (v != p && v != heavy[u]) dfs(v, u, false);
    // heavy child last, and we KEEP its counters
    if (heavy[u] != -1) dfs(heavy[u], u, true);
    // re-add u plus every light subtree (the heavy side is already in place)
    touch(u, p, heavy[u], +1);
    ans[u] = distinctNow;
    if (!keep) touch(u, p, -1, -1);   // wipe the whole subtree of u
}

// usage: calcSize(root, 0); dfs(root, 0, true); ans[v] is ready for all v.`,
    },
  ],
  diagrams: [
    {
      title: "One DSU-on-tree step",
      kind: "flow",
      caption: "Light children are computed then erased; the heavy child's counters survive and are reused.",
      mermaid: `flowchart TD
    A["enter dfs(v, keep)"] --> B["recurse into each LIGHT child with keep = false"]
    B --> C["each light child erases itself from the counter array"]
    C --> D["recurse into HEAVY child with keep = true"]
    D --> E["heavy counters stay in the counter array"]
    E --> F["add v itself and all light subtrees"]
    F --> G["record the answer for v"]
    G --> H{"keep?"}
    H -- "yes" --> I["return, leave the counter array intact"]
    H -- "no" --> J["erase whole subtree of v"]`,
    },
  ],
  cheatSheet: [
    "Precompute subtree sizes once; heavy[v] = child with the largest sz.",
    "Order matters: all light children (keep=false) BEFORE the heavy child (keep=true).",
    "After the heavy call, re-add v and the light subtrees only — never re-walk the heavy side.",
    "Time O(n log n), space O(n). Offline, all-subtrees, no updates.",
    "Recursion depth is O(n) on a path graph — raise the stack or iterate for n around 1e5+.",
  ],
  interviewQA: [
    {
      q: "Why is DSU on tree O(n log n) and not O(n^2)?",
      a: "A vertex is re-inserted into the global counter only when it hangs below a light edge from the ancestor currently being processed. Descending a light edge means moving into a child whose subtree is at most half the parent's subtree, so any root-to-vertex path contains at most log2(n) light edges. Each vertex is therefore added and removed O(log n) times, and each add/remove is O(1), giving O(n log n) total time with O(n) space.",
      followUps: [
        "What changes if you pick an arbitrary child as 'heavy' instead of the largest? (The light-edge halving argument breaks and the bound degrades to O(n^2) on a path-like tree.)",
      ],
    },
    {
      q: "When would you reach for small-to-large merging instead of DSU on tree?",
      a: "Use merging when each vertex genuinely needs its own persistent structure — for example when you must answer later queries against a stored per-vertex set, or when the aggregate cannot be maintained by O(1) add/remove on a shared array. Small-to-large merging of sets or maps also gives O(n log n) merges but carries container allocation and pointer-chasing constants. DSU on tree is strictly faster when a single flat frequency array suffices and all queries are answerable during the DFS.",
      followUps: [
        "Can DSU on tree handle updates between queries? (No — it is a one-pass offline technique; use heavy-light decomposition or Euler tour plus a BIT for online updates.)",
      ],
    },
  ],
  flashcards: [
    {
      front: "In DSU on tree, which child is visited last and why?",
      back: "The heavy child (largest subtree), visited last with keep = true so its contribution stays in the global counter array and never has to be recomputed.",
    },
    {
      front: "Complexity of DSU on tree?",
      back: "O(n log n) time, O(n) space. The log factor comes from each vertex sitting below at most log2(n) light edges.",
    },
    {
      front: "What kinds of aggregates does DSU on tree support?",
      back: "Anything maintainable by O(1)-ish add(x) / remove(x) on a shared frequency table: distinct count, most frequent value, count of a specific value, sum of values with a given frequency.",
    },
  ],
};
