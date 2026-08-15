import type { TopicContent } from "../types";

export const mosAlgorithm: TopicContent = {
  quickSummary: [
    "Mo's algorithm answers `q` **offline** range queries by sorting them cleverly and sliding one window `[curL, curR]` from each query to the next.",
    "Sort by (block of `L`, then `R`); `L` moves O(sqrt n) per query and `R` moves O(n) per block, giving **O((n + q) sqrt n)** time and O(n) space.",
    "It only needs an O(1) `add(i)` / `remove(i)` pair that maintains the answer incrementally — no merge rule, no associativity required.",
  ],
  detailed: [
    "## The reordering argument\n\nQueries arrive as `(l, r)` pairs. Maintain a window `[curL, curR]` and an incrementally-maintained answer; moving to the next query costs `|l - curL| + |r - curR|` pointer steps.\n\nSort queries by the block index of `l`, breaking ties by `r`. Then:\n\n- **`curL`** stays inside one block of width `B`, so it moves at most O(B) per query -> O(qB) total.\n- **`curR`** increases monotonically within a block and resets at most once per block, so it moves at most O(n) per block -> O(n * n/B) total.\n\nTotal is O(qB + n^2/B), minimised at `B = n / sqrt(q)` for **O((n + q) sqrt n)**. With n = q = 1e5 that is roughly 3e7 pointer steps — comfortably fast.",
    "## Pointer discipline\n\nThe four while-loops must be written so the window is **never empty in a way that lets an index be removed twice**. The safe order is: grow first, shrink second.\n\n```\nwhile (curR < r) add(++curR);\nwhile (curL > l) add(--curL);\nwhile (curR > r) remove(curR--);\nwhile (curL < l) remove(curL++);\n```\n\nWarning: writing `add(curR++)` instead of `add(++curR)`, or shrinking before growing, produces an off-by-one that only manifests on adjacent or single-element ranges — exactly the cases small hand tests miss.\n\nStart from `curL = 0, curR = -1` (an empty window) so the very first query is built purely by `add` calls.",
    "## Serpentine and Hilbert orderings\n\nA cheap upgrade: within odd-numbered blocks sort `r` **descending** instead of ascending. `curR` then snakes back and forth rather than jumping from the far right to the far left at every block boundary, typically cutting runtime by 30-50% for free.\n\nA stronger ordering treats `(l, r)` as a point in the plane and sorts by its index along a **Hilbert curve**. Because the Hilbert curve preserves locality in both coordinates, consecutive queries are close in *both* `l` and `r`, not just in `l`. It keeps the same O((n + q) sqrt n) worst-case bound but has better constants, and it removes the need to tune `B`.\n\nIn practice: serpentine ordering is three extra characters and almost always enough; reach for Hilbert order only when a solution is genuinely borderline.",
    "## What it can and cannot do\n\nMo's requires all queries up front (**offline**) and no updates between them. The aggregate must survive single-element `add` and `remove` in O(1), otherwise that cost multiplies into the bound — an O(log n) add makes the whole thing O((n + q) sqrt(n) log n).\n\nGood fits: number of distinct values in a range, count of values occurring exactly `k` times, sum of `cnt[x]^2`, XOR-pair counting. Poor fits: anything needing removal that is not the inverse of addition (a running maximum, for instance).\n\n| Variant | Bound | Note |\n| --- | --- | --- |\n| Plain Mo's | O((n + q) sqrt n) | B = n / sqrt(q) |\n| Mo's with updates | O(n^(5/3)) | third pointer over the update timeline |\n| Mo's on trees | O((n + q) sqrt n) | run it over the Euler tour |",
  ],
  code: [
    {
      language: "cpp",
      caption: "Mo's algorithm — distinct values per range, block size and comparator shown",
      source: `#include <bits/stdc++.h>
using namespace std;

struct Query { int l, r, idx; };

int blockSize;
vector<int> a;      // values, already coordinate-compressed to [0, V)
vector<int> freq;   // freq[v] = occurrences of v inside the current window
int distinctNow = 0;

inline void addAt(int i)    { if (freq[a[i]]++ == 0) distinctNow++; }
inline void removeAt(int i) { if (--freq[a[i]] == 0) distinctNow--; }

vector<int> solve(int n, int V, vector<Query> qs) {
    freq.assign(V, 0);
    distinctNow = 0;

    // B = n / sqrt(q) balances O(q*B) for L against O(n * n/B) for R
    blockSize = max(1, (int)(n / max(1.0, sqrt((double)qs.size()))));

    sort(qs.begin(), qs.end(), [](const Query &x, const Query &y) {
        int bx = x.l / blockSize, by = y.l / blockSize;
        if (bx != by) return bx < by;
        return (bx & 1) ? x.r > y.r : x.r < y.r;   // serpentine: snake R back and forth
    });

    vector<int> ans(qs.size());
    int curL = 0, curR = -1;                        // empty window
    for (const Query &Q : qs) {
        // grow first, then shrink -- never the other way round
        while (curR < Q.r) addAt(++curR);
        while (curL > Q.l) addAt(--curL);
        while (curR > Q.r) removeAt(curR--);
        while (curL < Q.l) removeAt(curL++);
        ans[Q.idx] = distinctNow;
    }
    return ans;
}`,
    },
  ],
  diagrams: [
    {
      title: "Window movement per query",
      kind: "flow",
      caption: "Sorting by (block of L, R) bounds how far each pointer can travel across the whole query set.",
      mermaid: `flowchart TD
    A["read all q queries offline"] --> B["choose B = n / sqrt(q)"]
    B --> C["sort by block(L), then R ascending in even blocks and descending in odd blocks"]
    C --> D["curL = 0, curR = -1"]
    D --> E["grow: while curR less than r, add; while curL greater than l, add"]
    E --> F["shrink: while curR greater than r, remove; while curL less than l, remove"]
    F --> G["record answer for this query index"]
    G --> H{"more queries?"}
    H -- "yes" --> E
    H -- "no" --> I["restore original query order"]`,
    },
  ],
  cheatSheet: [
    "Block size B = n / sqrt(q); complexity O((n + q) sqrt n) time, O(n + q) space.",
    "Comparator: block(l) ascending, then r ascending in even blocks / descending in odd blocks.",
    "Pointer order: add(++curR), add(--curL), remove(curR--), remove(curL++) — grow before shrink.",
    "Initialise curL = 0, curR = -1 and answer into ans[Q.idx] so the original order is recoverable.",
    "add/remove must be O(1); an O(log n) update multiplies the whole bound by log n.",
  ],
  interviewQA: [
    {
      q: "Derive the O((n + q) sqrt n) bound for Mo's algorithm.",
      a: "With block size B, the left pointer stays inside a single block for all queries in that block, so it moves at most B steps per query — O(qB) overall. The right pointer is sorted ascending within each block, so across one block it moves at most n steps total; there are n/B blocks, giving O(n^2/B). Total cost is O(qB + n^2/B), which is minimised when qB = n^2/B, i.e. B = n/sqrt(q), yielding O(n sqrt q). When n and q are the same order this is the familiar O((n + q) sqrt n). Space is O(n + q) for the frequency table and the stored queries.",
      followUps: [
        "What if B is fixed at sqrt(n) instead? (Still O((n + q) sqrt n) when q is around n, but suboptimal when q is much smaller or larger than n.)",
      ],
    },
    {
      q: "What is Hilbert-curve ordering and why does it help?",
      a: "Instead of sorting by (block of l, then r), you map each query to the point (l, r) and sort by its position along a Hilbert space-filling curve. The Hilbert curve has strong locality in both dimensions, so consecutive queries in the sorted order are close in l and in r simultaneously, whereas block ordering only bounds l. The asymptotic worst case is unchanged at O((n + q) sqrt n), but the measured pointer movement drops noticeably and there is no block-size constant to tune. It is worth the extra code only when a straightforward Mo's solution is borderline on time.",
      followUps: [
        "Cheaper alternative? (Serpentine ordering — reverse the r comparison in odd blocks — gets much of the benefit for one line of code.)",
      ],
    },
  ],
  flashcards: [
    {
      front: "Mo's algorithm: sort key and block size?",
      back: "Sort by (l / B, then r, reversed in odd blocks). B = n / sqrt(q). Gives O((n + q) sqrt n) time, O(n + q) space.",
    },
    {
      front: "Correct pointer-move order in Mo's algorithm?",
      back: "Grow before shrink: add(++curR); add(--curL); remove(curR--); remove(curL++). Starting window is curL = 0, curR = -1.",
    },
    {
      front: "What disqualifies a problem from Mo's algorithm?",
      back: "Online queries, updates interleaved with queries, or an aggregate with no O(1) inverse for remove (e.g. a running maximum).",
    },
  ],
};
