import type { TopicContent } from "../types";

export const twoSat: TopicContent = {
  quickSummary: [
    "Boolean satisfiability restricted to clauses of exactly two literals — the largest satisfiable-in-polynomial-time fragment of SAT.",
    "Each clause `(a OR b)` becomes two implications, `!a -> b` and `!b -> a`, on a graph of `2n` literal nodes. Solve with **strongly connected components**.",
    "Satisfiable iff no variable has `x` and `!x` in the same SCC. **O(n + m)** time and space for `n` variables and `m` clauses.",
  ],
  detailed: [
    "The implication graph is the whole trick. `(a OR b)` is logically identical to `!a -> b` and to `!b -> a`, so every clause contributes exactly two directed edges — and the graph is *skew-symmetric*: edge `u -> v` always has a mirror `!v -> !u`. Because implication is transitive, anything reachable from a literal must be true whenever that literal is true.",
    "If `x` and `!x` sit in the same SCC, each implies the other, so `x -> !x` and `!x -> x` both hold and no assignment works. Otherwise a valid assignment always exists, and the SCC condensation is a DAG whose topological order gives it directly: set `x = true` when `comp[x]` comes *after* `comp[!x]` in topological order. With Kosaraju, component ids are already emitted in topological order, so the rule is the single comparison `comp[2i] > comp[2i+1]`.\n\nKey insight: the SCC check is not a heuristic — skew-symmetry guarantees the greedy 'pick the topologically later literal' assignment is consistent across every clause.",
    "Encoding constraints is where most of the work is. Force a variable true with the clause `(x OR x)`. 'At most one of a, b' is `(!a OR !b)`. 'a implies b' is `(!a OR b)`. Exclusive choices — one of two rooms, one of two time slots, one of two orientations — map naturally onto one boolean per entity.\n\nCommon mistake: adding only one implication per clause. Both directions are required; a one-sided graph produces wrong SCCs and silently reports satisfiable inputs as unsatisfiable, or vice versa.",
    "For each clause of the form 'these two intervals must not overlap', add the negations pairwise. Problems phrased as 'choose one of two options for each item such that no pair conflicts' are 2-SAT almost by definition. Three options per item is 3-SAT and NP-complete — the jump is abrupt.",
  ],
  code: [
    {
      language: "cpp",
      caption: "2-SAT via Kosaraju SCC; node 2i = 'x_i true', node 2i+1 = 'x_i false'",
      source: `#include <bits/stdc++.h>
using namespace std;

struct TwoSat {
    int n;                          // number of variables
    vector<vector<int>> g, gr;      // implication graph and its reverse
    vector<int> order, comp;
    vector<char> used;

    explicit TwoSat(int n_)
        : n(n_), g(2 * n_), gr(2 * n_), comp(2 * n_, -1), used(2 * n_, 0) {}

    // literal node: 2*i if the variable is used positively, 2*i+1 if negated.
    // XOR with 1 flips a literal.
    void addImplication(int u, int v) { g[u].push_back(v); gr[v].push_back(u); }

    // clause ( (x_a == va) OR (x_b == vb) )
    void addClause(int a, bool va, int b, bool vb) {
        int la = 2 * a + (va ? 0 : 1);
        int lb = 2 * b + (vb ? 0 : 1);
        addImplication(la ^ 1, lb);        // !a  ->  b
        addImplication(lb ^ 1, la);        // !b  ->  a   (BOTH are required)
    }

    void dfs1(int u) {
        used[u] = 1;
        for (int v : g[u]) if (!used[v]) dfs1(v);
        order.push_back(u);                // finish order
    }
    void dfs2(int u, int c) {
        comp[u] = c;
        for (int v : gr[u]) if (comp[v] == -1) dfs2(v, c);
    }

    // returns false if unsatisfiable; otherwise fills value[]
    bool solve(vector<char>& value) {
        for (int i = 0; i < 2 * n; ++i) if (!used[i]) dfs1(i);
        int c = 0;
        for (int i = 2 * n - 1; i >= 0; --i) {          // reverse finish order
            int u = order[i];
            if (comp[u] == -1) dfs2(u, c++);            // ids are topological
        }
        value.assign(n, 0);
        for (int i = 0; i < n; ++i) {
            if (comp[2 * i] == comp[2 * i + 1]) return false;   // x and !x together
            value[i] = comp[2 * i] > comp[2 * i + 1];           // pick the later one
        }
        return true;
    }
};`,
    },
    {
      language: "cpp",
      caption: "Common clause encodings",
      source: `TwoSat ts(n);

ts.addClause(i, true,  i, true);    // force x_i = true
ts.addClause(i, false, i, false);   // force x_i = false
ts.addClause(a, false, b, true);    // a -> b        i.e. (!a OR b)
ts.addClause(a, false, b, false);   // at most one of a, b  i.e. (!a OR !b)
ts.addClause(a, true,  b, true);    // at least one of a, b

vector<char> value;
if (!ts.solve(value)) puts("IMPOSSIBLE");`,
    },
  ],
  diagrams: [
    {
      title: "From clauses to an assignment",
      kind: "flow",
      caption: "Two implications per clause, one SCC pass, then a single comparison per variable.",
      mermaid: `flowchart TD
    A["Clause (x1 OR not x2)"] --> B["Edge: not x1 implies not x2"]
    A --> C["Edge: x2 implies x1"]
    B --> D["Implication graph on 2n literal nodes"]
    C --> D
    D --> E["Condense with SCC (Kosaraju or Tarjan)"]
    E --> F{"comp[x] == comp[not x] for some x?"}
    F -- "yes" --> G["UNSATISFIABLE"]
    F -- "no" --> H["x = true iff comp[x] is topologically later"]`,
    },
  ],
  comparison: {
    columns: ["Problem", "Clause count", "Complexity", "Tractable"],
    rows: [
      ["2-SAT", "2 literals per clause", "O(n + m)", "Yes, via SCC"],
      ["3-SAT", "3 literals per clause", "NP-complete", "No known polynomial algorithm"],
      ["Horn-SAT", "At most one positive literal", "O(n + m)", "Yes, via unit propagation"],
      ["MAX-2-SAT", "Maximise satisfied clauses", "NP-hard", "No, even with 2 literals"],
    ],
  },
  cheatSheet: [
    "O(n + m) time and O(n + m) space for n variables and m clauses.",
    "Node encoding: `2*i` = x_i true, `2*i + 1` = x_i false; `^1` negates a literal.",
    "Every clause adds TWO edges: `!a -> b` and `!b -> a`.",
    "UNSAT iff `comp[2i] == comp[2i+1]` for some i.",
    "Assignment with Kosaraju ids: `x_i = comp[2i] > comp[2i+1]` (later component wins).",
  ],
  interviewQA: [
    {
      q: "Why does 'x and !x in the same SCC' make the formula unsatisfiable?",
      a: "Edges in the implication graph mean logical implication, and being in the same strongly connected component means each literal is reachable from the other. So x implies !x and !x implies x simultaneously. Setting x true forces !x true, a contradiction; setting x false forces x true, the same contradiction. No assignment survives, so the formula is unsatisfiable. The converse also holds: if no variable has both literals in one component, an assignment always exists, obtained by setting each variable to whichever of its two literals lies later in the topological order of the condensation. Skew-symmetry of the graph — every edge u to v mirrored by !v to !u — is what makes that greedy rule globally consistent. Total cost is one SCC pass, O(n + m).",
      followUps: ["Why does the topologically-later literal give a consistent assignment?", "What happens with Tarjan, whose component ids come out reverse-topological?"],
    },
    {
      q: "Each of n events must run in one of two rooms, and certain pairs cannot share a room. Model and solve it.",
      a: "Introduce one boolean per event, x_i meaning 'event i is in room A' and !x_i meaning room B. Each conflicting pair (i, j) that cannot share a room contributes two clauses: (x_i OR x_j) — they cannot both be in B — and (!x_i OR !x_j) — they cannot both be in A. Build the implication graph with two edges per clause, run an SCC algorithm, and report impossible if any variable has both literals in the same component; otherwise read the assignment off the topological order. Complexity is O(n + m) where m is the number of conflict pairs. The important caveat is the two-option restriction: with three rooms the encoding becomes 3-SAT and the problem is NP-complete, so I would switch to graph colouring heuristics or an ILP solver.",
    },
  ],
  flashcards: [
    { front: "2-SAT time and space complexity?", back: "O(n + m) for both, dominated by one SCC pass over the 2n-node implication graph." },
    { front: "How many edges does one clause add?", back: "Two: !a -> b and !b -> a. Adding only one is the classic bug." },
    { front: "How do you read the assignment off the SCCs?", back: "x is true iff comp[x] is topologically later than comp[!x]; with Kosaraju ids that is comp[2i] > comp[2i+1]." },
  ],
};
