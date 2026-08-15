import type { TopicContent } from "../types";

export const prefixSumsDifference: TopicContent = {
  quickSummary: [
    "Prefix sums: O(n) precompute, then **any range sum in O(1)** as `pre[r+1] - pre[l]`.",
    "Difference arrays are the dual: O(1) per range *update*, then one O(n) pass to materialise the final array.",
    "Both extend to 2D — a 2D prefix sum answers submatrix queries in O(1) with inclusion–exclusion.",
  ],
  detailed: [
    "Prefix sums and difference arrays are inverse operations: prefix-summing a difference array reconstructs the original, and differencing a prefix array recovers it. That duality tells you which to reach for — **many queries, no updates** → prefix sums; **many range updates, then one read** → difference array. If you need both interleaved, you have outgrown these and need a Fenwick tree or segment tree at O(log n) per operation.",
    "## 1D prefix sums\n\nDefine `pre[0] = 0` and `pre[i+1] = pre[i] + a[i]`. The extra leading zero is not cosmetic: it makes the range formula `sum(l..r) = pre[r+1] - pre[l]` valid with no special case for `l == 0`.\n\nCommon mistake: sizing the prefix array at n instead of n+1 and then patching `l == 0` with a branch. Use the size-(n+1) form and the off-by-one disappears.\n\nUse a 64-bit accumulator — n values up to 10⁹ overflow `int` well before n reaches 10⁵.",
    "## 2D prefix sums\n\n`pre[i][j]` holds the sum of the submatrix from (0,0) to (i−1,j−1). Building it is one inclusion–exclusion recurrence, and a query on rows [r1,r2] × cols [c1,c2] is four lookups:\n\n`pre[r2+1][c2+1] - pre[r1][c2+1] - pre[r2+1][c1] + pre[r1][c1]`\n\nThe final `+` re-adds the corner subtracted twice. Build is O(nm) time and space; each query is O(1).",
    "## Difference arrays\n\nTo add `v` to every index in `[l, r]`, record `d[l] += v` and `d[r+1] -= v` — O(1) regardless of range length. After all q updates, one prefix-sum pass over `d` yields the final array. Total cost is O(n + q) instead of O(nq). The 2D version stamps four corners (`+v`, `−v`, `−v`, `+v`) and needs a 2D prefix pass to materialise.\n\nIn practice: this is the standard trick for \"apply q interval increments then print the array\" and for sweep-line counting of overlapping intervals.",
  ],
  code: [
    {
      language: "cpp",
      caption: "1D and 2D prefix sums — O(1) range and submatrix queries",
      source: `// --- 1D: build O(n), query O(1) ---
vector<long long> buildPrefix(const vector<int>& a) {
    vector<long long> pre(a.size() + 1, 0);      // pre[0] = 0 is the key
    for (size_t i = 0; i < a.size(); ++i) pre[i + 1] = pre[i] + a[i];
    return pre;
}
long long rangeSum(const vector<long long>& pre, int l, int r) {  // inclusive
    return pre[r + 1] - pre[l];
}

// --- 2D: build O(n*m), query O(1) ---
vector<vector<long long>> buildPrefix2D(const vector<vector<int>>& g) {
    int n = (int)g.size(), m = n ? (int)g[0].size() : 0;
    vector<vector<long long>> pre(n + 1, vector<long long>(m + 1, 0));
    for (int i = 0; i < n; ++i)
        for (int j = 0; j < m; ++j)
            pre[i + 1][j + 1] = g[i][j] + pre[i][j + 1]
                              + pre[i + 1][j] - pre[i][j];
    return pre;
}
long long submatrixSum(const vector<vector<long long>>& pre,
                       int r1, int c1, int r2, int c2) {   // inclusive corners
    return pre[r2 + 1][c2 + 1] - pre[r1][c2 + 1]
         - pre[r2 + 1][c1] + pre[r1][c1];
}`,
    },
    {
      language: "cpp",
      caption: "Difference array — q range updates in O(1) each, then one O(n) pass",
      source: `struct Difference {
    vector<long long> d;
    explicit Difference(int n) : d(n + 1, 0) {}   // one slot of slack for r+1

    void addRange(int l, int r, long long v) {    // add v to a[l..r], O(1)
        d[l] += v;
        d[r + 1] -= v;                            // safe: d has n+1 entries
    }

    vector<long long> materialise(int n) {        // O(n), once, at the end
        vector<long long> a(n);
        long long run = 0;
        for (int i = 0; i < n; ++i) { run += d[i]; a[i] = run; }
        return a;
    }
};
// q updates + one build: O(n + q) instead of O(n*q).
// Need updates and queries interleaved? Use a Fenwick tree: O(log n) each.`,
    },
  ],
  cheatSheet: [
    "`pre[0] = 0`, `pre[i+1] = pre[i] + a[i]`; `sum(l..r) = pre[r+1] - pre[l]`. Build O(n), query O(1).",
    "2D query = `pre[r2+1][c2+1] - pre[r1][c2+1] - pre[r2+1][c1] + pre[r1][c1]` (inclusion–exclusion).",
    "Difference: `d[l] += v; d[r+1] -= v;` then prefix-sum once. O(1) update, O(n) materialise.",
    "Size difference arrays at n+1 so the `r+1` write is always in bounds.",
    "Always accumulate in `long long`; prefix sums overflow `int` fast.",
    "Interleaved updates *and* queries → Fenwick / segment tree, O(log n) per op.",
  ],
  interviewQA: [
    {
      q: "Explain the 2D prefix sum query formula and why the last term is added.",
      a: "Let `pre[i][j]` be the sum of the rectangle from (0,0) to (i−1,j−1). To get the sum of rows r1..r2 and columns c1..c2, I start with the full rectangle `pre[r2+1][c2+1]`, subtract the strip above it `pre[r1][c2+1]`, and subtract the strip to its left `pre[r2+1][c1]`. The top-left corner region `pre[r1][c1]` lies inside both strips, so it has been subtracted twice — I add it back once to correct the double subtraction. That is standard inclusion–exclusion. The build uses the same identity in reverse: `pre[i+1][j+1] = g[i][j] + pre[i][j+1] + pre[i+1][j] - pre[i][j]`. Build is O(nm) time and space; each query is O(1) with four array reads.",
      followUps: [
        "How would you handle range sums on an immutable matrix that does not fit in memory?",
        "What changes if you need submatrix maximum instead of sum?",
      ],
    },
    {
      q: "You need to apply a million range increments to an array of size n and then print it. How?",
      a: "A difference array. Instead of touching every element of each range, I record only the two boundaries: for 'add v to a[l..r]' I do `d[l] += v` and `d[r+1] -= v`, which is O(1) per update regardless of range length. After all q updates I run a single prefix-sum pass over `d`, and the running total at index i is exactly the accumulated value at `a[i]` — because every update contributes v from index l onward and cancels itself from r+1 onward. Total cost is O(n + q) time and O(n) space, versus O(nq) for the naive approach. Two details matter: allocate `d` with n+1 entries so the `r+1` write never goes out of bounds, and use `long long` since the accumulated values can overflow. If reads had to be interleaved with the updates rather than all coming at the end, I would switch to a Fenwick tree with range update and point query, at O(log n) per operation.",
      followUps: [
        "How does the 2D version work?",
        "What if you needed range updates AND range sum queries simultaneously?",
      ],
    },
  ],
  flashcards: [
    {
      front: "Range sum with prefix sums",
      back: "`pre[0]=0`, `pre[i+1]=pre[i]+a[i]`; then `sum(l..r) = pre[r+1] - pre[l]`. Build O(n), query O(1), space O(n).",
    },
    {
      front: "Difference array update",
      back: "Add v to a[l..r]: `d[l] += v; d[r+1] -= v` in O(1). One prefix-sum pass at the end materialises the array. O(n + q) total.",
    },
    {
      front: "Prefix sums vs Fenwick tree",
      back: "Prefix sums: static data, O(1) query, no updates. Fenwick: O(log n) point update and prefix query — use it when updates and queries interleave.",
    },
  ],
};
