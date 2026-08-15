import type { TopicContent } from "../types";

export const profileDp: TopicContent = {
  quickSummary: [
    "Fills a grid **one cell at a time**, carrying a bitmask of the frontier — the boundary between decided and undecided cells — instead of a mask of a whole row.",
    "O(n·m·2^m) time and O(2^m) space with a rolling pair of layers, where m is the narrower dimension. **Precondition:** transpose so m ≤ ~15–18, since 2^m dominates.",
    "The canonical use is counting domino tilings of an n×m grid; the same skeleton handles tilings with holes, independent sets on a grid, and connectivity-free grid packings.",
  ],
  detailed: [
    `Plain profile DP stores a mask per *row*, transitions row to row, and must enumerate compatible row-pairs — often 3^m or worse. **Broken profile** DP instead advances one cell at a time, so each transition is a decision about a single cell and the mask only ever changes by one or two bits.

The state is \`(cell index, mask)\` where the mask has m bits describing the frontier. The invariant that makes it work: at cell \`(i, j)\`, bits for columns **≥ j** describe row i, and bits for columns **< j** describe row i+1. A bit is set when that cell is already occupied by a piece placed earlier.`,
    `## The three transitions

Standing at cell \`(i, j)\` with the current mask, exactly one of two situations holds.

- **Bit j is set** — the cell was already covered by a vertical domino dropped from row i-1. Nothing to decide: clear bit j (it now describes \`(i+1, j)\`, which is empty) and move on.
- **Bit j is clear** — the cell needs covering, and there are two ways:
  - **Vertical domino** covering \`(i, j)\` and \`(i+1, j)\`: set bit j, which now means "\`(i+1, j)\` is taken". Only legal when \`i + 1 < n\`.
  - **Horizontal domino** covering \`(i, j)\` and \`(i, j+1)\`: set bit j+1. Only legal when \`j + 1 < m\` and bit j+1 is currently clear.

Key insight: clearing bit j is what silently reinterprets it from "row i" to "row i+1". No explicit shift or row-boundary fixup is needed — after processing all m cells of row i, every bit already refers to row i+1, so the loop just continues.

The answer is the count at mask 0 after the last cell: every bit clear means nothing is dangling into the non-existent row n.`,
    `## Cost and the shape of the input

Time is O(n·m·2^m) — one full sweep over 2^m masks per cell — and space is O(2^m) if you keep only the current and next layers. For a 10×15 board that is 150 · 32768 ≈ 5×10⁶ operations.

Warning: the exponent is on the *column count*. Always transpose so the narrower dimension is the mask width; for a 20×6 grid the mask must be 6 bits, not 20. Getting this backwards turns a millisecond into a lifetime.

Common mistake: forgetting the \`i + 1 < n\` guard on the vertical placement. Without it the DP happily hangs dominoes off the bottom edge, and because those states end with a non-zero mask they are *usually* filtered out by reading the answer at mask 0 — but they inflate intermediate counts and break any variant that reads a different final state.

Counts overflow fast: an 8×8 board has 12,988,816 tilings and larger boards blow past 64 bits, so use a modulus or big integers when the grid grows.`,
  ],
  code: [
    {
      language: "cpp",
      caption: "Broken profile DP — count domino tilings of an n×m grid",
      source: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

// Number of ways to tile an n x m grid completely with 1x2 dominoes.
//
// INVARIANT: standing at cell (i, j), mask bits for columns >= j describe row i,
// and bits for columns < j describe row i+1. A set bit means "already occupied".
// PRECONDITION: transpose the input so that m is the SMALLER dimension --
// the cost is exponential in m only.
//
// O(n * m * 2^m) time, O(2^m) space.
ll dominoTilings(int n, int m) {
    if (((ll)n * m) % 2 != 0) return 0;          // odd area: impossible
    const int FULL = 1 << m;

    vector<ll> cur(FULL, 0), nxt(FULL, 0);
    cur[0] = 1;                                   // before cell (0,0): nothing placed

    for (int i = 0; i < n; ++i) {
        for (int j = 0; j < m; ++j) {
            fill(nxt.begin(), nxt.end(), 0LL);
            for (int mask = 0; mask < FULL; ++mask) {
                ll w = cur[mask];
                if (!w) continue;

                if (mask >> j & 1) {
                    // (i,j) already covered from above. Clearing bit j re-points it
                    // at (i+1, j), which is empty.
                    nxt[mask ^ (1 << j)] += w;
                } else {
                    // Vertical domino: covers (i,j) and (i+1,j). Set bit j = "(i+1,j) taken".
                    if (i + 1 < n) nxt[mask | (1 << j)] += w;

                    // Horizontal domino: covers (i,j) and (i,j+1). Set bit j+1,
                    // which still refers to row i since j+1 > j.
                    if (j + 1 < m && !(mask >> (j + 1) & 1))
                        nxt[mask | (1 << (j + 1))] += w;
                }
            }
            cur.swap(nxt);
        }
    }
    // Mask 0 = nothing dangling into the non-existent row n.
    return cur[0];
}

// dominoTilings(2,2) = 2, (2,3) = 3, (4,4) = 36, (8,8) = 12988816.`,
    },
    {
      language: "cpp",
      caption: "Same skeleton with holes: blocked cells just skip the placement branches",
      source: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

// blocked[i][j] == true marks a cell that must stay uncovered.
// Only the per-cell decision changes; the frontier invariant is untouched.
// O(n * m * 2^m) time, O(2^m) space.
ll tilingsWithHoles(int n, int m, const vector<vector<bool>>& blocked) {
    const int FULL = 1 << m;
    vector<ll> cur(FULL, 0), nxt(FULL, 0);
    cur[0] = 1;

    for (int i = 0; i < n; ++i)
        for (int j = 0; j < m; ++j) {
            fill(nxt.begin(), nxt.end(), 0LL);
            for (int mask = 0; mask < FULL; ++mask) {
                ll w = cur[mask];
                if (!w) continue;
                bool occupied = mask >> j & 1;

                if (blocked[i][j]) {
                    // A hole must NOT have been covered by an earlier piece.
                    if (!occupied) nxt[mask] += w;   // bit j already clear; leave it
                    continue;
                }
                if (occupied) {
                    nxt[mask ^ (1 << j)] += w;
                    continue;
                }
                if (i + 1 < n && !blocked[i + 1][j]) nxt[mask | (1 << j)] += w;
                if (j + 1 < m && !blocked[i][j + 1] && !(mask >> (j + 1) & 1))
                    nxt[mask | (1 << (j + 1))] += w;
            }
            cur.swap(nxt);
        }
    return cur[0];
}`,
    },
  ],
  cheatSheet: [
    "State = (cell, m-bit frontier mask). Bits ≥ j describe row i; bits < j describe row i+1.",
    "Set bit = cell already occupied. Clearing bit j at cell (i,j) re-points it at (i+1,j).",
    "Three moves: consume a pre-filled cell; vertical (set bit j, needs `i+1<n`); horizontal (set bit j+1, needs it clear).",
    "O(n·m·2^m) time, O(2^m) space with two rolling layers. Answer = count at mask 0.",
    "ALWAYS transpose so m is the smaller dimension — the exponent is on the column count.",
    "Checks: 2×2 → 2, 2×3 → 3, 4×4 → 36, 8×8 → 12,988,816. Odd area → 0.",
  ],
  interviewQA: [
    {
      q: "Count the ways to tile an n×m grid with 1×2 dominoes. n can be large, m is small.",
      a: "I use broken profile DP, which advances one cell at a time rather than one row at a time. The state is the cell index plus an m-bit frontier mask, with the invariant that at cell (i, j) the bits for columns at or above j describe row i and the bits below j describe row i+1, a set bit meaning the cell is already occupied. At each cell there are only three moves. If bit j is set the cell was covered by a vertical domino from the row above, so I clear bit j — which reinterprets it as row i+1 — and move on. Otherwise I either place a vertical domino, setting bit j to mark the cell below as taken, legal only when i+1 is inside the grid, or place a horizontal domino, setting bit j+1, legal only when j+1 is in range and currently clear. Because clearing bit j does the row hand-off implicitly, there is no special code at row boundaries. The answer is the count at mask 0 after the final cell, meaning nothing dangles below the last row. That is O(n·m·2^m) time and O(2^m) space with two rolling layers. The precondition is that m must be the smaller dimension, so I transpose first — the exponent is only on the column count. I would sanity-check against 2×2 giving 2, 4×4 giving 36, and 8×8 giving 12,988,816, and note that counts overflow 64 bits quickly so a modulus is usually required.",
      followUps: [
        "How does this change if some cells are blocked?",
        "Why is broken profile better than a row-to-row transition?",
      ],
    },
    {
      q: "Why advance cell by cell instead of row by row? Both carry an m-bit mask.",
      a: "The difference is in the transition cost, not the state count. A row-to-row formulation must, for each pair of a source mask and a target mask, verify that the two rows are compatible and that the row can be completed with horizontal pieces — that is a 4^m pair enumeration naively, or roughly 3^m if you precompute compatible pairs by walking the row. Broken profile replaces that entire inner problem with a single-cell decision: from any given mask there are at most two successor states, so a transition is O(1) and the whole sweep is O(n·m·2^m). For m = 15 that is the difference between about 1.4×10⁷ operations and 1.4×10⁷ compatible-pair checks on top of a much larger enumeration. The cell-by-cell form is also far easier to extend — blocked cells, per-cell weights, or different piece shapes become extra branches in the decision rather than a rewrite of the compatibility routine. The cost is that you carry a position index alongside the mask, which is a small constant, and that the frontier invariant is subtle enough to be worth writing down in a comment.",
    },
  ],
  flashcards: [
    {
      front: "Broken profile DP: what does the mask mean at cell (i, j)?",
      back: "Bits for columns ≥ j describe row i; bits for columns < j describe row i+1. A set bit means that cell is already occupied by a previously placed piece.",
    },
    {
      front: "Complexity of broken profile DP on an n×m grid?",
      back: "O(n·m·2^m) time, O(2^m) space with two rolling layers. Transpose so m is the smaller dimension — the exponent is on the column count only.",
    },
    {
      front: "How does the DP hand off from row i to row i+1?",
      back: "Implicitly. Clearing bit j when consuming a pre-filled cell re-points that bit at (i+1, j), so after all m cells of row i every bit already describes row i+1. No boundary code needed.",
    },
  ],
};
