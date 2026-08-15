import type { TopicContent } from "../types";

export const sqrtDecomposition: TopicContent = {
  quickSummary: [
    "Split the array into blocks of size about `sqrt(n)` and keep one precomputed aggregate per block; a range then touches at most two partial blocks plus O(sqrt n) whole blocks.",
    "Query and update both land at **O(sqrt n)** time with **O(n)** space, after an O(n) build — worse asymptotics than a segment tree, far more flexibility.",
    "The same 'rebuild threshold' idea generalises far beyond arrays: batch changes into a small buffer, rebuild the heavy structure every sqrt(n) operations.",
  ],
  detailed: [
    "## The block layout\n\nWith `n` elements and block size `B`, there are `ceil(n / B)` blocks. A query on `[l, r]` splits into three parts: a partial prefix inside `l`'s block, a run of complete blocks, and a partial suffix inside `r`'s block.\n\nThe partial parts cost O(B) elements each; the complete blocks cost O(n / B) aggregate reads. Total is O(B + n/B), minimised at `B = sqrt(n)` for **O(sqrt n)** per operation.\n\nFor example, with n = 1,000,000 a query scans roughly 1000 raw elements plus 1000 block summaries instead of a million elements.",
    "## Range updates need a per-block tag\n\nA point update is trivial: patch the element, patch its block aggregate. A **range** update needs the same partial/complete split — elements in partial blocks are updated directly, while complete blocks get a lazy tag (`blockAdd[b]`) and a corrected aggregate.\n\nThis is the same idea as segment-tree lazy propagation, but with exactly one level of laziness instead of `log n` levels, which makes it dramatically easier to get right.\n\nCommon mistake: adding `val * B` to a block's aggregate for the *last* block, which may hold fewer than `B` elements. Only fully-covered interior blocks are safe to scale by `B`.",
    "## The rebuild threshold, generalised\n\nSqrt decomposition is really a **cost-balancing pattern**, not a data structure. Whenever reads are cheap on a static structure but writes are expensive, keep the static structure plus a small buffer of pending writes:\n\n- A read answers from the static structure, then patches with the O(sqrt n) buffered writes.\n- Once the buffer reaches sqrt(n) entries, rebuild the static structure from scratch in O(n) and clear the buffer.\n\nAmortised, rebuilding costs O(n) every sqrt(n) operations = O(sqrt n) per operation. Sqrt decomposition on trees (blocks along an Euler tour), sqrt decomposition on queries (rebuild a convex hull or a bitset periodically), and offline batching all follow this template.",
    "## When it beats a segment tree\n\nA segment tree wins on paper — O(log n) vs O(sqrt n). Reach for blocks when the segment tree's requirements do not hold:\n\n| Situation | Why blocks win |\n| --- | --- |\n| The operation is not associative / has no clean merge | A block can hold *any* summary (a sorted vector, a `bitset`, a hash set) |\n| Updates and queries are of unrelated kinds | No lazy-tag composition rule to invent |\n| The per-block work is vectorisable | Scanning a contiguous block is cache-friendly and auto-vectorises |\n| Small n, or few queries | O(sqrt n) with a tiny constant can beat O(log n) with a big one |\n| It is a 2-hour contest and correctness matters more than speed | 20 readable lines vs a subtle lazy tree |\n\nIn practice: sqrt decomposition is the fallback that always works, so it is worth writing first and optimising only if it times out.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Blocks of size sqrt(n) — range add and range sum, both O(sqrt n)",
      source: `#include <bits/stdc++.h>
using namespace std;

struct SqrtDecomp {
    int n, bs, nb;                             // size, block size, block count
    vector<long long> a, blockSum, blockAdd;   // raw values, aggregates, lazy tags

    explicit SqrtDecomp(const vector<long long> &v) {
        n  = (int)v.size();
        bs = max(1, (int)sqrt((double)n));      // the sqrt(n) choice
        nb = (n + bs - 1) / bs;
        a  = v;
        blockSum.assign(nb, 0);
        blockAdd.assign(nb, 0);
        for (int i = 0; i < n; i++) blockSum[i / bs] += a[i];   // O(n) build
    }

    // add val to every element of [l, r]
    void rangeAdd(int l, int r, long long val) {
        int bl = l / bs, br = r / bs;
        if (bl == br) {                                  // single partial block
            for (int i = l; i <= r; i++) { a[i] += val; blockSum[bl] += val; }
            return;
        }
        for (int i = l; i < (bl + 1) * bs; i++) { a[i] += val; blockSum[bl] += val; }
        for (int b = bl + 1; b < br; b++) {              // interior: tag only
            blockAdd[b]  += val;
            blockSum[b]  += val * bs;                    // safe: interior blocks are full
        }
        for (int i = br * bs; i <= r; i++) { a[i] += val; blockSum[br] += val; }
    }

    long long rangeSum(int l, int r) {
        int bl = l / bs, br = r / bs;
        long long s = 0;
        if (bl == br) {
            for (int i = l; i <= r; i++) s += a[i] + blockAdd[bl];
            return s;
        }
        for (int i = l; i < (bl + 1) * bs; i++) s += a[i] + blockAdd[bl];
        for (int b = bl + 1; b < br; b++) s += blockSum[b];   // one read per block
        for (int i = br * bs; i <= r; i++) s += a[i] + blockAdd[br];
        return s;
    }
};`,
    },
  ],
  diagrams: [
    {
      title: "How a range query splits",
      kind: "flow",
      caption: "Two partial blocks are scanned element by element; every interior block contributes one precomputed aggregate.",
      mermaid: `flowchart LR
    Q["query l..r"] --> S{"same block?"}
    S -- "yes" --> D["scan l..r directly, O(sqrt n)"]
    S -- "no" --> P1["scan tail of block(l), O(sqrt n)"]
    P1 --> M["read blockSum for each interior block, O(sqrt n)"]
    M --> P2["scan head of block(r), O(sqrt n)"]
    P2 --> R["combine into answer"]
    D --> R`,
    },
  ],
  cheatSheet: [
    "Block size B = sqrt(n); cost is O(B + n/B), minimised at B = sqrt(n) -> O(sqrt n) per op.",
    "Build O(n), query O(sqrt n), update O(sqrt n), space O(n).",
    "Range update = touch partial blocks element-wise, tag interior blocks lazily.",
    "Only interior blocks are guaranteed full; never scale the last block's aggregate by B.",
    "General pattern: buffer up to sqrt(n) writes, rebuild the static structure in O(n), repeat.",
  ],
  interviewQA: [
    {
      q: "Why is sqrt(n) the optimal block size, and when would you deliberately pick something else?",
      a: "A range operation costs O(B) for the two partial blocks plus O(n/B) for the interior aggregates, so total cost is O(B + n/B). That expression is minimised when B = n/B, i.e. B = sqrt(n), giving O(sqrt n). You pick a different B when the two halves have different constants: if scanning raw elements is very cheap (contiguous, vectorised) but reading a block summary is expensive, a larger B is better, and vice versa. With q queries and n elements the balance also shifts — Mo's algorithm, for example, uses B = n / sqrt(q).",
      followUps: [
        "How does the analysis change with a rebuild step? (Rebuilding in O(n) every sqrt(n) operations amortises to O(sqrt n) per operation, preserving the bound.)",
      ],
    },
    {
      q: "A segment tree is O(log n) per operation. Why would you ever ship O(sqrt n) blocks instead?",
      a: "Because a segment tree requires the operation to have an associative merge and, for range updates, a composable lazy tag — and many real problems have neither. A block can store an arbitrary summary: a sorted vector for order-statistics queries, a bitset for subset-sum feasibility, a hash set for membership. Blocks also have excellent cache behaviour and trivially simple code, so for n up to roughly 1e5 with 1e5 queries they often run within time. The rule of thumb: reach for blocks when the operation is 'weird', reach for a segment tree when the merge is clean and n is large.",
      followUps: [
        "What is the practical n ceiling for sqrt decomposition? (Roughly n, q around 1e5 in a 1-2 second limit; beyond that the sqrt factor dominates.)",
      ],
    },
  ],
  flashcards: [
    {
      front: "Sqrt decomposition complexities?",
      back: "Build O(n), query O(sqrt n), update O(sqrt n), space O(n). Block size B = sqrt(n) minimises O(B + n/B).",
    },
    {
      front: "What is the 'rebuild threshold' idea?",
      back: "Keep a fast static structure plus a buffer of at most sqrt(n) pending writes. Reads consult both; once the buffer fills, rebuild the static structure in O(n). Amortised O(sqrt n) per operation.",
    },
    {
      front: "Name one thing a block can store that a segment tree node cannot easily merge.",
      back: "A sorted copy of the block's elements (for count-less-than queries) or a bitset of achievable subset sums — summaries with no cheap associative merge rule.",
    },
  ],
};
