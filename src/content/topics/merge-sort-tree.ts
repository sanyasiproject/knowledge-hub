import type { TopicContent } from "../types";

export const mergeSortTree: TopicContent = {
  quickSummary: [
    "A merge sort tree is a segment tree in which **every node stores its own range in sorted order** — literally the intermediate state of a merge sort, kept instead of discarded.",
    "A query decomposes `[l, r]` into O(log n) canonical nodes and binary-searches each one, so *how many elements <= x in [l, r]* costs **O(log^2 n)**.",
    "Build is O(n log n) time and **O(n log n) space**; the structure is static — supporting updates would mean re-sorting whole nodes.",
  ],
  detailed: [
    "## The structure\n\nBuild an ordinary segment tree, but let node `v` covering `[lo, hi]` hold `sorted(a[lo..hi])` rather than a single aggregate.\n\nEach level of the tree stores a permutation of all `n` elements, and there are `log n + 1` levels, hence **O(n log n) memory**. Building bottom-up with `std::merge` is O(n) per level and **O(n log n) total** — the recursion tree of merge sort with the intermediate arrays retained.\n\nFor example, for `a = [5, 1, 4, 2]` the root holds `[1, 2, 4, 5]`, its children hold `[1, 5]` and `[2, 4]`, and the leaves hold the raw elements.",
    "## Querying: O(log n) nodes x O(log n) binary search\n\nA range `[l, r]` is covered by at most `2 log n` canonical nodes. Each contributes `upper_bound(node, x) - node.begin()`, the count of its elements `<= x`, in O(log n).\n\nMultiplying gives **O(log^2 n) per query**, with no extra allocation. Because the canonical nodes are disjoint and their union is exactly `[l, r]`, summing their counts is exact — no inclusion-exclusion needed.\n\nDerived queries follow immediately: *count in the value range `[x, y]`* is `countLE(y) - countLE(x-1)`; *k-th smallest in `[l, r]`* is a binary search over the answer value, costing O(log^3 n) — which is exactly where a **persistent segment tree** (O(log n)) or a wavelet tree becomes the better tool.",
    "## Where it fits\n\n| Structure | Count `<= x` in range | Build | Space | Updates |\n| --- | --- | --- | --- | --- |\n| Merge sort tree | O(log^2 n) | O(n log n) | O(n log n) | No |\n| Persistent segment tree | O(log n) | O(n log V) | O(n log V) | Version-based |\n| Wavelet tree | O(log V) | O(n log V) | O(n log V) bits | No |\n| Offline BIT + sorted queries | O(log n) amortised | O((n+q) log n) | O(n) | No |\n| Sqrt decomposition | O(sqrt n log n) | O(n log n) | O(n) | Yes, O(sqrt n) |\n\nIn practice: the merge sort tree wins on *implementation time*. It is roughly 20 lines, needs no coordinate compression, and its O(log^2 n) is fine up to about n, q = 1e5.",
    "## Pitfalls\n\nThe tree is **static**. Changing one element invalidates the sorted vector at every node on its root-to-leaf path, and re-sorting them costs O(n) in the worst case (the root alone is length `n`).\n\nWarning: allocating `vector<int>` at 4n nodes fragments memory badly. Prefer sizing `node[v]` exactly to `hi - lo + 1` and merging into it (as below), or flatten all levels into a single `log n` x `n` buffer for cache-friendliness.\n\nIf the elements are large objects, store indices or ranks rather than copies — the O(n log n) space multiplier applies to whatever you put in the nodes.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Merge sort tree — sorted vector per node, count of elements <= x in O(log^2 n)",
      source: `#include <bits/stdc++.h>
using namespace std;

// Merge sort tree: every node keeps its own range in sorted order.
struct MergeSortTree {
    int n;
    vector<vector<int>> node;

    explicit MergeSortTree(const vector<int> &a) : n((int)a.size()), node(4 * a.size() + 4) {
        build(1, 0, n - 1, a);
    }

    void build(int v, int lo, int hi, const vector<int> &a) {
        if (lo == hi) { node[v] = {a[lo]}; return; }
        int mid = (lo + hi) >> 1;
        build(2 * v, lo, mid, a);
        build(2 * v + 1, mid + 1, hi, a);
        node[v].resize(hi - lo + 1);                 // exact size, no slack
        merge(node[2 * v].begin(),     node[2 * v].end(),
              node[2 * v + 1].begin(), node[2 * v + 1].end(), node[v].begin());
    }

    // how many a[i] <= x for i in [l, r]
    int countLE(int v, int lo, int hi, int l, int r, int x) const {
        if (r < lo || hi < l) return 0;                                  // disjoint
        if (l <= lo && hi <= r)                                          // canonical node
            return (int)(upper_bound(node[v].begin(), node[v].end(), x) - node[v].begin());
        int mid = (lo + hi) >> 1;
        return countLE(2 * v, lo, mid, l, r, x)
             + countLE(2 * v + 1, mid + 1, hi, l, r, x);
    }

    int countLE(int l, int r, int x) const { return countLE(1, 0, n - 1, l, r, x); }

    // count of values in [x, y] inside positions [l, r]
    int countInRange(int l, int r, int x, int y) const {
        return countLE(l, r, y) - countLE(l, r, x - 1);
    }
};`,
    },
  ],
  diagrams: [
    {
      title: "Answering count(l, r, <= x)",
      kind: "flow",
      caption: "The range splits into O(log n) canonical nodes; each answers with one binary search over its sorted vector.",
      mermaid: `flowchart TD
    A["query l..r and threshold x"] --> B{"node range vs query"}
    B -- "disjoint" --> C["return 0"]
    B -- "fully inside" --> D["upper_bound(sorted node, x) gives the count, O(log n)"]
    B -- "partial overlap" --> E["recurse into both children"]
    E --> B
    D --> F["sum over the O(log n) canonical nodes"]
    C --> F
    F --> G["answer, total O(log^2 n)"]`,
    },
  ],
  cheatSheet: [
    "Node v stores sorted(a[lo..hi]); each of the log n levels holds all n elements.",
    "Build O(n log n) time via std::merge; space O(n log n).",
    "count(<= x) in [l, r]: O(log n) canonical nodes x O(log n) upper_bound = O(log^2 n).",
    "count in value range [x, y] = countLE(y) - countLE(x - 1). K-th smallest via value binary search = O(log^3 n).",
    "Static only — a point update would force re-sorting every node on the path, up to O(n).",
  ],
  interviewQA: [
    {
      q: "Why is a merge sort tree query O(log^2 n) rather than O(log n)?",
      a: "A segment tree decomposes any range [l, r] into at most about 2 log n canonical nodes whose ranges are disjoint and whose union is exactly [l, r]. In a merge sort tree each of those nodes stores its elements sorted, so the count of elements <= x within that node is one binary search, O(log n). Multiplying the number of nodes by the cost per node gives O(log^2 n). Getting to O(log n) requires fractional cascading — storing, alongside each element of a parent's sorted array, precomputed pointers into the children's arrays so the binary search is done once at the root and then followed by O(1) pointer hops per level.",
      followUps: [
        "What does fractional cascading cost? (Same O(n log n) space asymptotically but larger constants and much more code; a wavelet tree or persistent segment tree is usually preferred instead.)",
      ],
    },
    {
      q: "When would you pick a merge sort tree over a persistent segment tree?",
      a: "Pick the merge sort tree when the array is static, queries are of the counting kind (how many elements <= x, or within a value range, in a positional range), and the input sizes are moderate — roughly n and q up to 1e5. It needs no coordinate compression, no node pool sizing, and is about 20 lines, so it is far less error-prone under time pressure. Pick the persistent segment tree when you need k-th smallest in a range (O(log V) instead of O(log^3 n)), when you must query historical versions of the array, or when the query count is high enough that the extra log factor matters. Both use O(n log n)-ish memory, so memory rarely decides between them.",
      followUps: [
        "Can a merge sort tree support updates? (Not efficiently — use sqrt decomposition with sorted blocks, or a BIT of sorted structures, for O(sqrt n) / O(log^2 n) updates.)",
      ],
    },
  ],
  flashcards: [
    {
      front: "What does each node of a merge sort tree store?",
      back: "Its own index range in sorted order — the intermediate array from merge sort, retained. Every level holds all n elements, so space is O(n log n).",
    },
    {
      front: "Merge sort tree complexities?",
      back: "Build O(n log n) time and O(n log n) space; count of elements <= x in [l, r] is O(log^2 n). Static structure — no efficient updates.",
    },
    {
      front: "How do you get 'count of values in [x, y] within positions [l, r]'?",
      back: "countLE(l, r, y) - countLE(l, r, x - 1), so two O(log^2 n) traversals.",
    },
  ],
};
