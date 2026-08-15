import type { TopicContent } from "../types";

export const persistentSegmentTree: TopicContent = {
  quickSummary: [
    "A persistent segment tree keeps **every** past version: an update copies only the O(log n) nodes on the root-to-leaf path and re-points the rest at the old tree (path copying).",
    "Each update is **O(log n) time and O(log n) new nodes**, so `m` updates cost O(m log n) time and O(n + m log n) memory; querying any stored version is O(log n).",
    "The classic application is **k-th smallest in a range**: build one version per prefix, then descend the difference of two roots.",
  ],
  detailed: [
    "## Path copying\n\nA point update in an ordinary segment tree rewrites exactly the nodes from the root down to one leaf — `log n + 1` of them. Everything else is untouched.\n\nPersistence exploits that directly: instead of mutating those nodes, **allocate fresh copies** of them and let each new copy reuse the *unchanged* sibling pointer from the previous version. The old root still describes the old array; the new root describes the new one.\n\nKey insight: versions share structure. Two consecutive versions differ by only O(log n) nodes, which is why keeping all of them is affordable at all.",
    "## Node pool and version roots\n\nImplementation is a flat node pool — parallel `lc[]`, `rc[]`, `cnt[]` arrays plus a counter — and a `root[]` array holding one index per version.\n\n- Index 0 is a shared **null node** with `lc = rc = 0, cnt = 0`, so an empty subtree needs no allocation and no null checks.\n- `root[i]` is the version after the first `i` updates; `root[0] = 0` is the empty tree.\n- Reserve roughly `(m + 1) * (ceil(log2 m_range) + 2)` nodes up front.\n\nCommon mistake: using `vector` push_back inside the recursion without reserving. Reallocation is correctness-safe but the pool sizing is where most TLE/MLE verdicts come from — count nodes as `updates * (log(valueRange) + 2)`, not `4n`.",
    "## K-th smallest in a range\n\nBuild a *counting* tree over the compressed value range. Version `i` inserts `a[i-1]`, so `root[i]` counts the multiset `a[0..i-1]`.\n\nBecause counts are additive, the multiset of `a[l..r]` is exactly `root[r+1]` **minus** `root[l]`, node by node. Descend both roots in lockstep: `leftCnt = cnt[lc[v]] - cnt[lc[u]]` is how many values of `[l..r]` fall in the left half. If `k <= leftCnt` go left, else go right with `k - leftCnt`.\n\nThat is **O(log V) per query** after an O(n log V) build, where V is the number of distinct values. The same subtraction trick answers *count of values in `[x, y]` within `[l, r]`* and *range median*.",
    "## Cost and alternatives\n\n| Operation | Time | New nodes |\n| --- | --- | --- |\n| Build (n prefix versions) | O(n log V) | O(n log V) |\n| Point update -> new version | O(log n) | O(log n) |\n| Query any version | O(log n) | 0 |\n| K-th smallest in `[l, r]` | O(log V) | 0 |\n\nMemory is the real constraint: 1e5 updates over a 1e5-wide value range is roughly 1.7e6 nodes, about 20 MB with three 32-bit arrays. If you only need *offline* order statistics, a merge sort tree (O(log^2 n), less memory) or parallel binary search is often the lighter choice; persistence earns its keep when you must query historical versions or answer online.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Persistent counting segment tree — node pool, version roots, k-th smallest in a range",
      source: `#include <bits/stdc++.h>
using namespace std;

// Persistent segment tree over the compressed value range [0, m).
// Node 0 is the shared "empty" node: lc = rc = 0, cnt = 0.
struct PersistentCounts {
    int m;
    vector<int> lc, rc, cnt;     // the node pool

    PersistentCounts(int m, int updates) : m(m) {
        int cap = 2 + (updates + 1) * (32 - __builtin_clz(max(1, m)) + 2);
        lc.reserve(cap); rc.reserve(cap); cnt.reserve(cap);
        lc.push_back(0); rc.push_back(0); cnt.push_back(0);   // the null node
    }

    int makeNode(int l, int r, int c) {
        lc.push_back(l); rc.push_back(r); cnt.push_back(c);
        return (int)cnt.size() - 1;
    }

    // returns the root of a NEW version = previous version with one more copy of pos
    int insert(int prev, int lo, int hi, int pos) {
        if (lo == hi) return makeNode(0, 0, cnt[prev] + 1);
        int mid = (lo + hi) >> 1;
        if (pos <= mid) {                        // only the touched spine is copied
            int L = insert(lc[prev], lo, mid, pos);
            return makeNode(L, rc[prev], cnt[prev] + 1);      // right child SHARED
        }
        int R = insert(rc[prev], mid + 1, hi, pos);
        return makeNode(lc[prev], R, cnt[prev] + 1);          // left child SHARED
    }

    // k-th smallest (1-indexed) among versions (u, v] = array positions (l-1, r]
    int kth(int u, int v, int lo, int hi, int k) const {
        if (lo == hi) return lo;
        int mid = (lo + hi) >> 1;
        int leftCnt = cnt[lc[v]] - cnt[lc[u]];   // counts subtract across versions
        if (k <= leftCnt) return kth(lc[u], lc[v], lo, mid, k);
        return kth(rc[u], rc[v], mid + 1, hi, k - leftCnt);
    }
};`,
    },
    {
      language: "cpp",
      caption: "Driver — compress values, build one version per prefix, answer queries in O(log V)",
      source: `#include <bits/stdc++.h>
using namespace std;

// assumes PersistentCounts from the previous snippet
int main() {
    int n, q;
    if (!(cin >> n >> q)) return 0;
    vector<int> a(n);
    for (int &x : a) cin >> x;

    vector<int> vals = a;                                  // coordinate compression
    sort(vals.begin(), vals.end());
    vals.erase(unique(vals.begin(), vals.end()), vals.end());
    int m = (int)vals.size();

    PersistentCounts pst(m, n);
    vector<int> root(n + 1, 0);                            // root[0] = empty version
    for (int i = 0; i < n; i++) {
        int c = (int)(lower_bound(vals.begin(), vals.end(), a[i]) - vals.begin());
        root[i + 1] = pst.insert(root[i], 0, m - 1, c);     // version i+1 = prefix a[0..i]
    }

    while (q--) {
        int l, r, k;                                       // 0-indexed l, r; k is 1-indexed
        cin >> l >> r >> k;
        cout << vals[pst.kth(root[l], root[r + 1], 0, m - 1, k)] << "\\n";
    }
    return 0;
}`,
    },
  ],
  diagrams: [
    {
      title: "Path copying on one update",
      kind: "flow",
      caption: "The new version allocates only the root-to-leaf spine; every off-path child pointer is reused from the old version.",
      mermaid: `flowchart TD
    OldRoot["old version root i"] --> OldL["left subtree"]
    OldRoot --> OldR["right subtree"]
    NewRoot["new version root i plus 1"] --> NewL["fresh copy of left node"]
    NewRoot -. "pointer reused, nothing allocated" .-> OldR
    NewL -. "reused" .-> OldLL["untouched grandchild"]
    NewL --> Leaf["fresh leaf with cnt + 1"]`,
    },
  ],
  cheatSheet: [
    "Update = copy the O(log n) root-to-leaf path, share every off-path child. Old roots stay valid forever.",
    "Time: O(log n) per update and per query. Space: O(log n) new nodes per update, O(n + m log n) total.",
    "Node pool sizing: reserve about updates * (log2(valueRange) + 2); node 0 is the shared null.",
    "K-th smallest in [l, r]: descend root[l] and root[r+1] together, leftCnt = cnt[lc[v]] - cnt[lc[u]].",
    "Compress values first; the tree is indexed by value rank, not by array position.",
  ],
  interviewQA: [
    {
      q: "How does a persistent segment tree keep all versions without O(n) memory per update?",
      a: "A point update in a segment tree only rewrites the nodes on the path from the root to one leaf — about log n + 1 nodes. Path copying allocates fresh copies of exactly those nodes; each fresh node keeps one newly created child and reuses the pointer to the other, unchanged child of the previous version. So consecutive versions share all but O(log n) nodes. Each update is O(log n) time and O(log n) memory, and any old root can still be queried in O(log n) because the structure it points to was never mutated. This is only safe because the tree is treated as immutable — no in-place writes anywhere.",
      followUps: [
        "Can you make a lazy-propagation tree persistent? (Yes, but pushing down must also copy children, so lazy tags are usually applied without push-down, e.g. via 'lazy accumulation' on the way down.)",
      ],
    },
    {
      q: "Walk through answering 'k-th smallest value in a[l..r]' with a persistent segment tree.",
      a: "Compress the values to ranks 0..V-1 and build a counting tree over that range, creating one version per array prefix: root[i] counts the values a[0..i-1]. Since node counts are additive over prefixes, the count of any value bucket inside a[l..r] equals the count in root[r+1] minus the count in root[l]. Descend both roots simultaneously from the top: leftCnt = cnt[lc[root_r]] - cnt[lc[root_l]] gives how many of the range's values live in the left half. If k <= leftCnt recurse left with the same k, otherwise recurse right with k - leftCnt. At a leaf, the node's value rank is the answer. Build is O(n log V) time and memory; each query is O(log V) time and allocates nothing.",
      followUps: [
        "How would you also support point updates to the array? (Combine with a BIT of persistent trees — 'BIT of merge sort trees' — for O(log^2 n) per operation.)",
      ],
    },
  ],
  flashcards: [
    {
      front: "What is path copying?",
      back: "On an update, allocate new copies of only the root-to-leaf nodes that change; each copy reuses the previous version's pointer for its unchanged child. O(log n) new nodes per update.",
    },
    {
      front: "Persistent segment tree: time and space per update?",
      back: "O(log n) time, O(log n) new nodes. m updates over an n-wide range cost O(m log n) time and O(n + m log n) space; querying any version is O(log n).",
    },
    {
      front: "Why does k-th smallest in a range work with prefix versions?",
      back: "Counts are additive over prefixes, so the multiset of a[l..r] is root[r+1] minus root[l] node by node. Descending both roots together compares k against cnt[lc[v]] - cnt[lc[u]].",
    },
  ],
};
