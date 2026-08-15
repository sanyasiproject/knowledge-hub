import type { TopicContent } from "../types";

export const segmentTreeBeats: TopicContent = {
  quickSummary: [
    "Segment Tree Beats makes **range chmin** (`a[i] = min(a[i], x)` over a range) work alongside range sum, which ordinary lazy propagation cannot express as a composable tag.",
    "Each node stores the maximum, the **strict second maximum**, and how many elements equal the maximum; that triple is exactly what lets one tag update the sum in O(1).",
    "Range chmin plus range sum/max runs in **amortised O(n log^2 n)** total for n operations, with O(n) space — the second log is a potential-function artefact, not a per-query cost.",
  ],
  detailed: [
    "## Why plain lazy propagation fails\n\nA lazy tag must be a function you can *compose* and *apply to a whole node in O(1)*. `add v` qualifies: the sum shifts by `v * len`. `chmin with x` does not — how much the sum drops depends on **which** elements exceed `x`, which the node's aggregate does not know.\n\nKey insight: the node does not need to know all of them, only the maximum, how many elements achieve it, and the next distinct value below it.",
    "## The three tags\n\nEvery node keeps `mx` (maximum), `se` (largest value strictly less than `mx`, or -infinity), and `cntMx` (multiplicity of `mx`).\n\nA `chmin(range, x)` visit then has three cases:\n\n- `mx <= x` — **prune**. Nothing in this subtree exceeds `x`; return immediately.\n- `se < x < mx` — **apply**. Exactly the `cntMx` maxima drop to `x`; `sum -= (mx - x) * cntMx`, `mx = x`, and `se`/`cntMx` are unchanged. O(1).\n- `se >= x` — **break down**. Two or more distinct values exceed `x`, so recurse into both children and re-`pull`.\n\nOnly the third case costs anything, and it is the case that *destroys distinct values*.",
    "## Amortisation, intuitively\n\nDefine the potential of the tree as the total number of **distinct values** present across all nodes' subtrees, summed over nodes. Initially that is O(n log n) — each of the n values appears in the log n nodes above it.\n\nThe expensive 'break down' case only happens when a node holds at least two distinct values above `x`; after the recursion completes, those values have been **merged into one**, permanently reducing the potential by at least one. A `chmin` operation can raise the potential by at most O(log n) (the O(log n) canonical nodes may each gain one new distinct value).\n\nSo across `m` operations the potential rises by O(m log n) and starts at O(n log n); each unit of extra recursion consumes a unit of potential and costs O(log n) to walk. The total is **O((n + m) log^2 n)** — the second log is paid globally, not per query. Any individual `chmin` may still recurse deeply; only the sum over all of them is bounded.\n\nCommon mistake: reading O(n log^2 n) as a per-operation cost and rejecting Beats as too slow. In practice it runs at roughly 2-3x an ordinary lazy segment tree.",
    "## Scope and cost\n\n| Operation set | Bound |\n| --- | --- |\n| chmin + sum + max | amortised O((n + m) log^2 n) |\n| chmin + chmax + sum | amortised O((n + m) log^2 n) |\n| chmin + chmax + range add + sum | amortised O((n + m) log^2 n), heavy constants |\n\nSpace is **O(n)** — four arrays of size 4n. Note that `se` must be a *strict* second maximum: if a node holds `[7, 7, 3]` then `mx = 7`, `cntMx = 2`, `se = 3`. Getting `se` wrong (allowing it to equal `mx`) breaks the O(1) apply case and silently corrupts sums.\n\nWarning: adding range-`add` on top requires two separate lazy tags — one for the maxima and one for the non-maxima — because the two groups must shift independently. That is where most Beats implementations go wrong.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Segment Tree Beats — range chmin with range sum and range max",
      source: `#include <bits/stdc++.h>
using namespace std;
typedef long long ll;

const ll NEG = LLONG_MIN / 4;   // sentinel for "no second maximum"

struct Beats {
    int n;
    vector<ll> sum, mx, se;     // se = STRICT second maximum of the node
    vector<int> cntMx;          // how many elements in the node equal mx

    explicit Beats(const vector<ll> &a) : n((int)a.size()),
        sum(4 * a.size() + 4), mx(4 * a.size() + 4),
        se(4 * a.size() + 4), cntMx(4 * a.size() + 4) {
        build(1, 0, n - 1, a);
    }

    void pull(int v) {
        int l = 2 * v, r = 2 * v + 1;
        sum[v] = sum[l] + sum[r];
        if (mx[l] == mx[r]) {
            mx[v] = mx[l]; cntMx[v] = cntMx[l] + cntMx[r]; se[v] = max(se[l], se[r]);
        } else if (mx[l] > mx[r]) {
            mx[v] = mx[l]; cntMx[v] = cntMx[l];            se[v] = max(se[l], mx[r]);
        } else {
            mx[v] = mx[r]; cntMx[v] = cntMx[r];            se[v] = max(mx[l], se[r]);
        }
    }

    void build(int v, int lo, int hi, const vector<ll> &a) {
        if (lo == hi) { sum[v] = mx[v] = a[lo]; se[v] = NEG; cntMx[v] = 1; return; }
        int mid = (lo + hi) >> 1;
        build(2 * v, lo, mid, a);
        build(2 * v + 1, mid + 1, hi, a);
        pull(v);
    }

    // Safe ONLY when se[v] < x < mx[v]: exactly the cntMx[v] maxima drop to x.
    void applyMin(int v, ll x) {
        if (x >= mx[v]) return;
        sum[v] -= (mx[v] - x) * cntMx[v];
        mx[v] = x;                       // se and cntMx are untouched
    }

    void push(int v) { applyMin(2 * v, mx[v]); applyMin(2 * v + 1, mx[v]); }

    void chmin(int v, int lo, int hi, int l, int r, ll x) {
        if (r < lo || hi < l || mx[v] <= x) return;                      // (1) prune
        if (l <= lo && hi <= r && se[v] < x) { applyMin(v, x); return; }  // (2) O(1) apply
        int mid = (lo + hi) >> 1;                                        // (3) break down
        push(v);
        chmin(2 * v, lo, mid, l, r, x);
        chmin(2 * v + 1, mid + 1, hi, l, r, x);
        pull(v);
    }

    ll querySum(int v, int lo, int hi, int l, int r) {
        if (r < lo || hi < l) return 0;
        if (l <= lo && hi <= r) return sum[v];
        int mid = (lo + hi) >> 1;
        push(v);
        return querySum(2 * v, lo, mid, l, r) + querySum(2 * v + 1, mid + 1, hi, l, r);
    }

    ll queryMax(int v, int lo, int hi, int l, int r) {
        if (r < lo || hi < l) return NEG;
        if (l <= lo && hi <= r) return mx[v];
        int mid = (lo + hi) >> 1;
        push(v);
        return max(queryMax(2 * v, lo, mid, l, r), queryMax(2 * v + 1, mid + 1, hi, l, r));
    }

    void chmin(int l, int r, ll x) { chmin(1, 0, n - 1, l, r, x); }
    ll querySum(int l, int r)      { return querySum(1, 0, n - 1, l, r); }
    ll queryMax(int l, int r)      { return queryMax(1, 0, n - 1, l, r); }
};`,
    },
  ],
  diagrams: [
    {
      title: "The three chmin cases",
      kind: "flow",
      caption: "Only the third case recurses, and it permanently merges two distinct values — which is what pays for the amortised bound.",
      mermaid: `flowchart TD
    A["chmin(node, x)"] --> B{"mx less than or equal to x?"}
    B -- "yes" --> C["prune: nothing here exceeds x"]
    B -- "no" --> D{"node fully covered and se less than x?"}
    D -- "yes" --> E["apply: sum minus (mx - x) times cntMx, set mx = x, O(1)"]
    D -- "no" --> F["push tags to children"]
    F --> G["recurse into both children"]
    G --> H["pull: recompute mx, se, cntMx, sum"]
    H --> I["two distinct values merged, potential drops"]`,
    },
  ],
  cheatSheet: [
    "Per node: sum, mx, se (STRICT second max, -inf if absent), cntMx.",
    "Three cases: mx <= x prune; se < x < mx apply in O(1); otherwise recurse and pull.",
    "Apply rule: sum -= (mx - x) * cntMx; mx = x. se and cntMx stay put.",
    "Total cost amortised O((n + m) log^2 n) for m operations; space O(n) (four 4n arrays).",
    "Adding range-add needs separate tags for the maxima and the non-maxima — do not reuse one tag.",
  ],
  interviewQA: [
    {
      q: "Why can't ordinary lazy propagation handle range chmin with range sum?",
      a: "A lazy tag has to satisfy two properties: it composes with other pending tags, and applying it to a node updates that node's aggregate in O(1). 'Add v to the range' satisfies both — the sum changes by v times the node's length. 'chmin with x' does not: the change to the sum equals the total excess of all elements above x, and a node storing only its sum has no way to compute that. Segment Tree Beats fixes exactly this by augmenting each node with the maximum, its multiplicity, and the strict second maximum. When x sits strictly between the second maximum and the maximum, the affected elements are precisely the cntMx maxima, so the sum update becomes sum -= (mx - x) * cntMx — an O(1) applicable tag again.",
      followUps: [
        "What if x is below the second maximum? (The tag is not applicable; you must recurse into both children — that is the expensive case the amortisation bounds.)",
      ],
    },
    {
      q: "Explain intuitively why Segment Tree Beats is amortised O(n log^2 n) rather than worst-case per-operation.",
      a: "Use the number of distinct values held across all nodes as a potential. At the start each of the n values appears in the log n nodes on its root path, so the potential is O(n log n). The only case that recurses beyond the canonical nodes is when a node contains at least two distinct values greater than x — and after the recursion those values have all been collapsed to x, permanently removing at least one distinct value from that node's multiset. So every unit of extra work is paid for by a permanent drop in potential. Each chmin operation can only increase the potential by O(log n), since it introduces a new value at each of its O(log n) canonical nodes. Summing, the total extra work over m operations is bounded by O((n + m) log n) potential units, each costing O(log n) to walk, giving O((n + m) log^2 n) overall. A single chmin can still be slow; only the total is bounded.",
      followUps: [
        "Is the log^2 tight? (For chmin alone the bound is provably O((n + m) log n); log^2 is the safe bound once chmax or range-add is mixed in.)",
      ],
    },
  ],
  flashcards: [
    {
      front: "What three extra fields does a Segment Tree Beats node store?",
      back: "mx (maximum), se (strict second maximum, -infinity if the node is uniform), and cntMx (how many elements equal mx) — alongside the usual sum.",
    },
    {
      front: "The O(1) chmin apply rule?",
      back: "Valid only when se < x < mx: sum -= (mx - x) * cntMx; mx = x. se and cntMx are unchanged because only the maxima moved.",
    },
    {
      front: "Segment Tree Beats complexity?",
      back: "Amortised O((n + m) log^2 n) total for m chmin/query operations, O(n) space. The bound is global — a single operation may recurse deeply.",
    },
  ],
};
