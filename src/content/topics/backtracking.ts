import type { TopicContent } from "../types";

export const backtracking: TopicContent = {
  quickSummary: [
    "DFS over a decision tree with one discipline: **choose → explore → un-choose**. The un-choose is what makes it backtracking rather than plain recursion.",
    "Complexity is branching^depth in the worst case; pruning is the only thing that makes it practical.",
    "Space is O(depth) for the recursion stack plus the current partial solution — not O(number of solutions), unless you store them all.",
  ],
  detailed: [
    "Backtracking enumerates candidate solutions incrementally and abandons a partial candidate the moment it cannot possibly extend to a valid one. The skeleton is always the same shape.\n\n1. If the state is complete, record it and return.\n2. Loop over candidate choices; `continue` on any that is infeasible — this is the pruning.\n3. `apply(choice)` — **choose**.\n4. Recurse — **explore**.\n5. `undo(choice)` — **un-choose**.\n\nCommon mistake: forgetting the undo, or undoing something different from what you applied. Every mutation before the recursive call needs an exact mirror after it.",
    "## Three canonical shapes\n\n- **Subsets** — at each index, take it or skip it. 2^n leaves, O(n·2^n) total time to emit all subsets, O(n) stack.\n- **Permutations** — at each depth pick an unused element. n! leaves, O(n·n!) time, O(n) stack plus a `used[]` array.\n- **N-Queens** — place one queen per row, choosing a column. Naive branching is n per row (n^n), but feasibility checks cut it to roughly O(n!) explored nodes, and in practice far fewer.\n\nThe pattern that distinguishes them is only the loop bounds and the feasibility test — the choose/explore/un-choose spine is identical.",
    "## Pruning is the whole game\nA backtracking solution without pruning is just brute force with extra steps. The levers are:\n\n1. **Constraint checks** — reject a choice before recursing (N-Queens column/diagonal sets, giving O(1) checks instead of O(n) scans).\n2. **Sorting + skipping duplicates** — sort the input, then `if (i > start && a[i] == a[i-1]) continue;` to avoid emitting the same combination twice.\n3. **Bounding** — if the best achievable score from here cannot beat the incumbent, cut the branch (branch and bound).\n4. **Ordering** — try the most constrained variable first, so failures surface near the root where they prune the most.\n\nIn practice: an O(1) incremental feasibility check beats an O(n) revalidation at every node, and that constant factor decides whether n=12 or n=30 is reachable.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Subsets — the choose/explore/un-choose spine, O(n·2^n) time, O(n) stack",
      source: `#include <vector>
using namespace std;

void dfs(const vector<int>& a, int start,
         vector<int>& path, vector<vector<int>>& out) {
    out.push_back(path);                 // every node is a valid subset
    for (int i = start; i < (int)a.size(); ++i) {
        path.push_back(a[i]);            // choose
        dfs(a, i + 1, path, out);        // explore (i+1 => no reuse)
        path.pop_back();                 // un-choose
    }
}

vector<vector<int>> subsets(const vector<int>& a) {
    vector<vector<int>> out;
    vector<int> path;
    dfs(a, 0, path, out);
    return out;   // 2^n subsets; O(n * 2^n) time, O(n) stack + O(n * 2^n) output
}`,
    },
    {
      language: "cpp",
      caption: "N-Queens — O(1) pruning with column and diagonal marks",
      source: `#include <vector>
using namespace std;

// col[c], d1[r+c], d2[r-c+n-1] mark occupied column and both diagonals.
void place(int row, int n, vector<bool>& col,
           vector<bool>& d1, vector<bool>& d2, int& solutions) {
    if (row == n) { ++solutions; return; }

    for (int c = 0; c < n; ++c) {
        int i1 = row + c, i2 = row - c + n - 1;
        if (col[c] || d1[i1] || d2[i2]) continue;   // prune in O(1)

        col[c] = d1[i1] = d2[i2] = true;            // choose
        place(row + 1, n, col, d1, d2, solutions);  // explore
        col[c] = d1[i1] = d2[i2] = false;           // un-choose
    }
}

int countNQueens(int n) {
    vector<bool> col(n, false), d1(2 * n - 1, false), d2(2 * n - 1, false);
    int solutions = 0;
    place(0, n, col, d1, d2, solutions);
    return solutions;   // ~O(n!) explored nodes worst case, O(n) space
}`,
    },
  ],
  comparison: {
    columns: ["Shape", "Branching per level", "Leaves", "Time", "Extra space"],
    rows: [
      ["Subsets", "take / skip", "2^n", "O(n·2^n)", "O(n) stack"],
      ["Permutations", "n - depth unused items", "n!", "O(n·n!)", "O(n) stack + used[]"],
      ["Combinations C(n,k)", "n - i remaining", "C(n,k)", "O(k·C(n,k))", "O(k) stack"],
      ["N-Queens", "≤ n columns, pruned", "≈ n! explored", "exponential, heavily pruned", "O(n) marks"],
    ],
  },
  interviewQA: [
    {
      q: "Walk through the backtracking template and explain why the un-choose step matters.",
      a: "The template is: if the state is complete, record it and return; otherwise loop over candidate choices, skip infeasible ones, apply the choice, recurse, then undo it. The undo matters because the state (path vector, used flags, board marks) is shared across the whole recursion rather than copied per branch. Without the undo, choices from one sibling branch leak into the next and you explore an incorrect state space. The alternative is passing a fresh copy of the state down each branch, which is correct but costs O(state) per node instead of O(1) — for subsets that turns O(n·2^n) into something meaningfully worse in constant factors and allocation churn.",
      followUps: [
        "How would you handle duplicates in the input so subsets are unique?",
        "When would you prefer an iterative bitmask enumeration over recursion?",
      ],
    },
    {
      q: "How do you reason about backtracking complexity, and how does pruning change it?",
      a: "The upper bound is branching^depth — the size of the decision tree — times the O(work) done per node. Subsets: 2^n nodes, O(n) to copy a path, so O(n·2^n). Permutations: n! leaves, O(n·n!). Pruning does not change this worst-case bound; it changes the number of nodes actually visited, often by orders of magnitude. For N-Queens, naive placement is n^n, feasibility checks bring the explored tree to roughly O(n!), and O(1) diagonal marks make each node cheap. So state the worst case honestly, then explain the pruning that makes it tractable. Space stays O(depth) for the stack plus whatever marks you keep — independent of how many solutions exist unless you store them.",
      followUps: [
        "What is branch and bound and how does it differ from plain constraint pruning?",
        "Why does trying the most constrained variable first help?",
      ],
    },
  ],
  flashcards: [
    {
      front: "The backtracking skeleton in four words?",
      back: "Choose, explore, un-choose (with a feasibility check before choosing). The undo must exactly mirror the mutation made before the recursive call.",
    },
    {
      front: "Backtracking time and space complexity, generally?",
      back: "Time O(branching^depth × work-per-node): subsets O(n·2^n), permutations O(n·n!). Space O(depth) for the stack plus the current partial solution — not proportional to the number of solutions found.",
    },
    {
      front: "Three ways to prune a backtracking search?",
      back: "1) Constraint checks before recursing (O(1) marks, not O(n) rescans). 2) Sort input and skip duplicate siblings. 3) Bound: cut a branch whose best possible outcome cannot beat the incumbent.",
    },
  ],
  cheatSheet: [
    "Skeleton: base case → loop candidates → feasible? → apply → recurse → undo.",
    "Subsets: recurse with i+1 and record at every node. 2^n results, O(n) stack.",
    "Permutations: used[] array or swap-in-place; n! results, O(n) stack.",
    "Duplicates: sort first, then `if (i > start && a[i] == a[i-1]) continue;`.",
    "N-Queens marks: col[c], diag1[r+c], diag2[r-c+n-1] — O(1) check and O(1) undo.",
  ],
};
