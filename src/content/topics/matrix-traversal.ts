import type { TopicContent } from "../types";

export const matrixTraversal: TopicContent = {
  quickSummary: [
    "Most 2-D grid problems are index arithmetic, not algorithms: **spiral** = four shrinking bounds, **rotate** = transpose then reverse rows, **diagonals** = group cells by `i + j` or `i - j`.",
    "Recognition cue: you are asked to *visit every cell in a prescribed order* or *rearrange in place* → index arithmetic. You are asked about *regions, distances, or reachability* → the grid is a graph, so BFS/DFS.",
    "Layout traversals are O(m·n) time and O(1) extra space (output aside); grid BFS/DFS is O(m·n) time and O(m·n) worst-case queue or recursion depth.",
  ],
  detailed: [
    "## Spiral order with four bounds\n\nKeep `top`, `bottom`, `left`, `right` and peel one ring per outer iteration: left-to-right along `top` then `++top`; top-to-bottom along `right` then `--right`; right-to-left along `bottom` then `--bottom`; bottom-to-top along `left` then `++left`. Loop while `top <= bottom && left <= right`.\n\nCommon mistake: skipping the re-check before the bottom row and left column. After `++top` and `--right` the remaining region may be empty, and without guarding those two passes a single-row or single-column matrix emits duplicate cells. Guard the third pass with `top <= bottom` and the fourth with `left <= right`.\n\nO(m·n) time, O(1) extra space. Classic problems: **Spiral Matrix**, **Spiral Matrix II** (fill 1..n² by writing instead of reading).",
    "## Rotate in place: transpose, then reverse\n\nRotating an n×n matrix 90° clockwise is two trivial passes. **Transpose** — swap `a[i][j]` with `a[j][i]` for `j > i` only, or you swap everything back. Then **reverse each row**. For counter-clockwise, transpose and reverse each *column* instead (equivalently: reverse the rows' order first, then transpose).\n\nWhy it works: transposing maps `(i, j) → (j, i)`, a reflection across the main diagonal; reversing rows maps `(i, j) → (i, n-1-j)`, a reflection across the vertical axis. Two reflections about axes 45° apart compose into a 90° rotation.\n\nO(n²) time, O(1) space. Classic problem: **Rotate Image**. The same decomposition also solves 180° (reverse rows *and* reverse row order).",
    "## Diagonals: the `i + j` and `i - j` identities\n\nEvery cell on the same **anti-diagonal** (↗) shares a constant `i + j`; every cell on the same **main diagonal** (↘) shares a constant `i - j`. That one fact collapses most diagonal problems into a bucket-by-key loop with no direction vectors at all — for example, a diagonal-sort or diagonal-sum becomes a single pass into `map<int, vector<int>>` keyed by `i - j`.\n\nFor zigzag diagonal order, iterate `d` from `0` to `m + n - 2` and walk the anti-diagonal `i + j == d`, reversing the emission direction on alternate `d`. Clamp the start: `i` runs from `max(0, d - n + 1)` to `min(d, m - 1)`.\n\nO(m·n) time. Classic problems: **Diagonal Traverse**, **Sort the Matrix Diagonally**, **Matrix Diagonal Sum**.",
    "## Boundary walks and the flood-fill-from-the-edge trick\n\nWalking just the border is the outermost spiral ring — one pass each along the top row, right column, bottom row and left column, with the same emptiness guards to avoid double-counting corners on degenerate shapes.\n\nThe pattern earns its keep in problems where the border defines a special condition: to find regions *not* touching the edge, start a DFS/BFS from every border cell, mark everything reachable as safe, then whatever is left unmarked is enclosed. This is much cleaner than trying to detect enclosure from the inside.\n\nClassic problems: **Surrounded Regions**, **Number of Enclaves**, **Pacific Atlantic Water Flow** (two border-seeded traversals, then intersect).",
    "## When the matrix is really a graph\n\nKey insight: the moment the question is about **connectivity, shortest path, or spreading**, stop thinking about traversal order and treat each cell as a vertex with edges to its 4 (or 8) neighbours. Use a `dr[] = {-1,1,0,0}` / `dc[] = {0,0,-1,1}` pair, bounds-check once inside the neighbour loop, and mark visited.\n\nUse **DFS** (or union-find) for counting components — islands, region sizes. Use **BFS** whenever the answer is a minimum number of steps on an unweighted grid, and **multi-source BFS** (seed the queue with every source before the first pop) when many cells start at time zero. If moves have different costs, it is Dijkstra with a priority queue, not BFS.\n\nO(m·n) time and O(m·n) space. Classic problems: **Number of Islands**, **Rotting Oranges**, **01 Matrix**, **Word Search**, **Shortest Path in Binary Matrix**.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Spiral order — four shrinking bounds, with the two guards that prevent duplicate cells",
      source: `vector<int> spiralOrder(const vector<vector<int>>& a) {
    vector<int> out;
    if (a.empty() || a[0].empty()) return out;

    int top = 0, bottom = (int)a.size() - 1;
    int left = 0, right = (int)a[0].size() - 1;
    out.reserve((size_t)(bottom + 1) * (right + 1));

    while (top <= bottom && left <= right) {
        for (int j = left; j <= right; ++j) out.push_back(a[top][j]);
        ++top;
        for (int i = top; i <= bottom; ++i) out.push_back(a[i][right]);
        --right;

        if (top <= bottom) {                 // GUARD: single row already consumed
            for (int j = right; j >= left; --j) out.push_back(a[bottom][j]);
            --bottom;
        }
        if (left <= right) {                 // GUARD: single column already consumed
            for (int i = bottom; i >= top; --i) out.push_back(a[i][left]);
            ++left;
        }
    }
    return out;
}
// Time O(m*n) — every cell pushed exactly once. Space O(1) beyond the output.

// Border only: the outermost ring, same guards.
vector<int> boundary(const vector<vector<int>>& a) {
    vector<int> out;
    if (a.empty() || a[0].empty()) return out;
    int m = (int)a.size(), n = (int)a[0].size();
    for (int j = 0; j < n; ++j) out.push_back(a[0][j]);
    for (int i = 1; i < m; ++i) out.push_back(a[i][n - 1]);
    if (m > 1) for (int j = n - 2; j >= 0; --j) out.push_back(a[m - 1][j]);
    if (n > 1) for (int i = m - 2; i >= 1; --i) out.push_back(a[i][0]);
    return out;
}`,
    },
    {
      language: "cpp",
      caption: "Rotate 90° in place (transpose + reverse) and zigzag diagonal order via i + j",
      source: `// Rotate an n x n matrix 90 degrees CLOCKWISE, in place.
void rotate90(vector<vector<int>>& a) {
    int n = (int)a.size();
    for (int i = 0; i < n; ++i)
        for (int j = i + 1; j < n; ++j)      // j > i ONLY, else you undo each swap
            swap(a[i][j], a[j][i]);          // transpose: (i,j) -> (j,i)
    for (auto& row : a)
        reverse(row.begin(), row.end());     // mirror horizontally
}
// Counter-clockwise: transpose, then reverse the ORDER of the rows instead.
// Time O(n^2), space O(1).

// Zigzag over anti-diagonals: every cell on diagonal d satisfies i + j == d.
vector<int> diagonalOrder(const vector<vector<int>>& a) {
    vector<int> out;
    if (a.empty() || a[0].empty()) return out;
    int m = (int)a.size(), n = (int)a[0].size();
    out.reserve((size_t)m * n);

    for (int d = 0; d <= m + n - 2; ++d) {
        int lo = max(0, d - n + 1);          // clamp so j = d - i stays in [0, n)
        int hi = min(d, m - 1);
        if (d % 2 == 0)                      // even d: walk upward (i decreasing)
            for (int i = hi; i >= lo; --i) out.push_back(a[i][d - i]);
        else                                 // odd d: walk downward
            for (int i = lo; i <= hi; ++i) out.push_back(a[i][d - i]);
    }
    return out;
}
// Time O(m*n), space O(1) beyond the output.
// Main diagonals instead? Key on i - j (offset by m to keep it non-negative).`,
    },
  ],
  cheatSheet: [
    "Spiral: four bounds, peel a ring per loop, re-check `top <= bottom` and `left <= right` before passes 3 and 4.",
    "Rotate 90° CW = transpose (`j > i` only) + reverse each row. CCW = transpose + reverse row order. O(n²) time, O(1) space.",
    "Anti-diagonal ↗ ⇒ constant `i + j`. Main diagonal ↘ ⇒ constant `i - j`. Bucket by that key.",
    "Diagonal `d` clamps: `i` from `max(0, d - n + 1)` to `min(d, m - 1)`, with `j = d - i`.",
    "Enclosed-region questions: seed the traversal from the **border**, mark reachable, invert.",
    "Connectivity / shortest steps / spreading ⇒ it's a graph. DFS or union-find to count, BFS (multi-source if needed) for minimum steps. O(m·n) time and space.",
  ],
  interviewQA: [
    {
      q: "Print an m×n matrix in spiral order. Which edge cases break the naive four-loop version?",
      a: "I maintain `top`, `bottom`, `left`, `right` and peel one ring per outer iteration: left-to-right across `top` then `++top`, top-to-bottom down `right` then `--right`, right-to-left across `bottom` then `--bottom`, bottom-to-top up `left` then `++left`, looping while `top <= bottom && left <= right`.\n\nThe edge cases are non-square leftovers. When the remaining region is a single row, the first pass consumes it and `++top` makes `top > bottom` — but the third pass would still run and re-emit that same row backwards. The mirror case is a single remaining column and the fourth pass. So the fix is to re-test `top <= bottom` before the bottom-row pass and `left <= right` before the left-column pass, *inside* the loop body rather than relying on the outer condition, because two bounds have already moved by then. I would also guard an empty matrix and an empty first row up front. Complexity is O(m·n) time — each cell is emitted exactly once — and O(1) extra space beyond the output vector. The write-instead-of-read variant that fills 1..n² in spiral order is literally the same loop with the push replaced by an assignment.",
      followUps: [
        "Adapt it to fill an n×n matrix with 1..n² in spiral order.",
        "How would you emit only the k-th ring without walking the outer ones?",
      ],
    },
    {
      q: "Rotate an n×n image 90 degrees clockwise in place. Why does transpose-then-reverse work, and what is the classic off-by-one?",
      a: "Two passes. Transpose the matrix by swapping `a[i][j]` with `a[j][i]`, then reverse each row. The bug everyone hits is looping `j` over the full row: that visits each pair twice and swaps it back, leaving the matrix untouched. The inner loop must start at `j = i + 1` so only the strict upper triangle is swapped.\n\nAs for why it works — transposing is a reflection across the main diagonal, mapping `(i, j)` to `(j, i)`. Reversing each row is a reflection across the vertical centre line, mapping `(i, j)` to `(i, n-1-j)`. Composing them sends `(i, j)` to `(j, n-1-i)`, which is exactly the 90° clockwise rotation: the first row becomes the last column. Two reflections about axes meeting at 45° give a rotation of 90°. Counter-clockwise is the same transpose followed by reversing the order of the rows instead of the contents. It is O(n²) time and O(1) extra space. The alternative, rotating four cells at a time in cycles ring by ring, is a single pass but far more index arithmetic to get right on a whiteboard, so I only reach for it if the interviewer explicitly wants one pass. Note that neither approach generalises to a non-square matrix in place — there the output has different dimensions and needs a new allocation.",
      followUps: [
        "Do it as a single pass with four-way cyclic swaps.",
        "What changes for a rectangular m×n matrix?",
      ],
    },
    {
      q: "How do you decide whether a grid problem is index arithmetic or a graph problem?",
      a: "I look at what the question asks me to produce. If it prescribes a *visiting order* or an *in-place rearrangement* — spiral, diagonal, rotate, transpose, zigzag — the cells' geometry is the whole problem and the solution is bounds and index identities, typically O(m·n) time and O(1) extra space. The tells are words like 'in spiral order', 'rotate', 'in place'.\n\nIf instead the question is about *connectivity, reachability, distance, or spreading* — count the islands, minimum steps to cross, how long until everything is infected, which cells can drain to both oceans — then adjacency is what matters and I model each cell as a vertex with edges to its four or eight neighbours. Concretely: DFS or union-find when I need to count or size components, BFS when the answer is a minimum number of moves on an unweighted grid, multi-source BFS when several cells start at distance zero (seed them all into the queue before the first pop, which gets rotting-oranges and 01-matrix in one pass instead of one BFS per source), and Dijkstra if the moves carry different costs. Border-seeded traversal is the specialised case for enclosure questions. Graph variants are O(m·n) time and O(m·n) space for the visited grid plus the queue.",
      followUps: [
        "Why is multi-source BFS still O(m·n) rather than O(sources · m · n)?",
        "When would union-find beat DFS for counting islands?",
      ],
    },
  ],
  flashcards: [
    {
      front: "Rotate an n×n matrix 90° clockwise in place",
      back: "Transpose (swap `a[i][j]`/`a[j][i]` for `j > i` only) then reverse each row. O(n²) time, O(1) space. CCW = transpose + reverse row order.",
    },
    {
      front: "Diagonal index identities",
      back: "Anti-diagonal (↗): `i + j` is constant. Main diagonal (↘): `i - j` is constant. Bucket cells by that key to solve most diagonal problems in one pass.",
    },
    {
      front: "Spiral traversal: the two guards",
      back: "Re-check `top <= bottom` before the bottom-row pass and `left <= right` before the left-column pass — otherwise a single remaining row or column is emitted twice.",
    },
  ],
};
