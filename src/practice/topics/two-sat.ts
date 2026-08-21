import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Clause to Implication Translation",
      difficulty: "Medium",
      variation: "Implication graph construction",
      question: [
        "Given a 2-CNF formula as a list of clauses, each clause being two literals (a variable index with a sign), build the implication graph. Return the adjacency list over 2n nodes, where node 2i represents the literal x_i being false and node 2i+1 represents x_i being true. Explain the translation by producing the edges for each clause.",
        "Example 1:\nInput: n = 2, clauses = [[1, 2]]  (meaning x_0 OR x_1, using 1-based signed literals)\nOutput: edges = [(x_0 false -> x_1 true), (x_1 false -> x_0 true)]\nExplanation: A clause (a OR b) fails only when both are false, so asserting NOT a forces b, and asserting NOT b forces a.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= clauses.length <= 10^5\n- A signed literal v means variable |v|-1, positive for true",
      ],
      code: `struct ImplicationGraph {
    int n;
    vector<vector<int>> adj;

    // node(var, value) encodes "variable var takes the given truth value".
    static int node(int var, bool value) { return 2 * var + (value ? 1 : 0); }

    ImplicationGraph(int n) : n(n), adj(2 * n) {}

    // Add the clause (litA OR litB) using signed 1-based literals.
    void addClause(int litA, int litB) {
        int a = abs(litA) - 1;
        bool aVal = litA > 0;
        int b = abs(litB) - 1;
        bool bVal = litB > 0;
        // NOT a implies b
        adj[node(a, !aVal)].push_back(node(b, bVal));
        // NOT b implies a
        adj[node(b, !bVal)].push_back(node(a, aVal));
    }
};`,
      explanation: [
        "Every 2-CNF clause (a OR b) is logically identical to the pair of implications (NOT a -> b) and (NOT b -> a). Adding both directions is essential; adding only one loses information.",
        "Encoding each variable as two nodes turns the whole formula into a directed graph, which is what makes the problem tractable. The graph is skew-symmetric: reversing every edge and swapping each literal with its negation reproduces the same graph.",
        "Time: O(1) per clause. Space: O(n + m).",
      ],
    },
    {
      name: "2-SAT Satisfiability Check",
      difficulty: "Hard",
      variation: "Implication graph + SCC",
      question: [
        "Given a 2-CNF formula with n variables and m clauses (each clause a pair of signed 1-based literals), determine whether a satisfying assignment exists. Return true or false.",
        "Example 1:\nInput: n = 2, clauses = [[1,2],[-1,2],[1,-2],[-1,-2]]\nOutput: false\nExplanation: The four clauses forbid all four assignments of two variables, so the formula is unsatisfiable.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= m <= 10^5",
      ],
      code: `struct TwoSat {
    int n;
    vector<vector<int>> adj, radj;
    vector<int> comp, order;
    vector<char> visited;

    TwoSat(int n) : n(n), adj(2 * n), radj(2 * n), comp(2 * n, -1), visited(2 * n, 0) {}

    static int node(int var, bool value) { return 2 * var + (value ? 1 : 0); }

    void addClause(int litA, int litB) {
        int a = abs(litA) - 1; bool av = litA > 0;
        int b = abs(litB) - 1; bool bv = litB > 0;
        addImplication(node(a, !av), node(b, bv));
        addImplication(node(b, !bv), node(a, av));
    }

    void addImplication(int u, int v) {
        adj[u].push_back(v);
        radj[v].push_back(u);
    }

    void dfs1(int u) {
        visited[u] = 1;
        for (int v : adj[u]) if (!visited[v]) dfs1(v);
        order.push_back(u);
    }

    void dfs2(int u, int c) {
        comp[u] = c;
        for (int v : radj[u]) if (comp[v] == -1) dfs2(v, c);
    }

    bool satisfiable() {
        for (int i = 0; i < 2 * n; i++) if (!visited[i]) dfs1(i);
        int c = 0;
        for (int i = 2 * n - 1; i >= 0; i--)
            if (comp[order[i]] == -1) dfs2(order[i], c++);
        for (int var = 0; var < n; var++)
            if (comp[node(var, false)] == comp[node(var, true)]) return false;
        return true;
    }
};`,
      explanation: [
        "The formula is unsatisfiable exactly when some variable x and its negation land in the same strongly connected component. Being in one SCC means x implies NOT x and NOT x implies x, a contradiction no assignment can escape.",
        "Kosaraju's two passes give the components: one DFS on the graph to fix a finishing order, then a DFS on the reverse graph in decreasing finish order. Any linear-time SCC algorithm works equally well.",
        "Time: O(n + m). Space: O(n + m).",
      ],
    },
    {
      name: "Recover a Satisfying Assignment",
      difficulty: "Hard",
      variation: "Reverse topological order",
      question: [
        "Given a satisfiable 2-CNF formula with n variables, return an actual satisfying assignment as a boolean array of length n.",
        "Example 1:\nInput: n = 2, clauses = [[1,2],[-1,2]]\nOutput: [false, true]\nExplanation: Setting x_1 true satisfies both clauses regardless of x_0.",
        "Constraints:\n- 1 <= n <= 10^5\n- The formula is guaranteed satisfiable",
      ],
      code: `vector<char> assignment(TwoSat& ts) {
    // Assumes ts.satisfiable() has already run and filled comp[].
    // Kosaraju numbers components in reverse topological order,
    // so a SMALLER comp id means LATER in topological order.
    vector<char> value(ts.n);
    for (int var = 0; var < ts.n; var++) {
        int cFalse = ts.comp[TwoSat::node(var, false)];
        int cTrue  = ts.comp[TwoSat::node(var, true)];
        value[var] = cTrue < cFalse ? 1 : 0;
    }
    return value;
}`,
      explanation: [
        "For each variable, pick whichever of its two literals appears LATER in topological order of the condensation DAG. Implications only ever point forward, so choosing the later literal can never force a contradiction downstream.",
        "The skew-symmetry of the implication graph guarantees the two literals of a variable are never in the same component when the formula is satisfiable, so the comparison is always decisive.",
        "Watch the direction convention: Kosaraju assigns component ids in reverse topological order, so the smaller id is the later one. Getting this backwards produces a valid-looking but wrong assignment.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Giant Pizza (Either-Or Topping Requests)",
      difficulty: "Hard",
      variation: "Canonical 2-SAT application",
      link: "https://cses.fi/problemset/task/1684",
      question: [
        "There are m toppings and n customer wishes. Each wish names two toppings, each with a preference: the customer wants that topping either present (+) or absent (-), and is satisfied if at least one of their two preferences holds. Decide which toppings to use so that every customer is satisfied, or report IMPOSSIBLE.",
        "Example 1:\nInput: n = 3, m = 3, wishes = [[+1, +2], [-1, +3], [-2, -3]]\nOutput: A valid selection, for example topping 1 used, topping 2 unused, topping 3 used.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= m <= 10^5",
      ],
      code: `// Each wish "+i or -j" becomes the clause (x_i OR NOT x_j).
// Feed the signed literals straight into TwoSat::addClause.
vector<char> giantPizza(int m, vector<pair<int,int>>& wishes, bool& possible) {
    TwoSat ts(m);
    for (auto& w : wishes) ts.addClause(w.first, w.second);
    possible = ts.satisfiable();
    if (!possible) return {};
    return assignment(ts);
}`,
      explanation: [
        "Each customer's wish is literally a 2-CNF clause: satisfied if at least one of two literals is true. That makes the whole problem a direct 2-SAT instance with one variable per topping.",
        "This problem is the canonical illustration that 2-SAT is a modelling tool first — the algorithmic work is fixed boilerplate, and the skill is recognising that a constraint has the (a OR b) shape.",
        "Time: O(n + m). Space: O(n + m).",
      ],
    },
    {
      name: "Forced Variable Detection",
      difficulty: "Hard",
      variation: "Implied literals",
      question: [
        "Given a satisfiable 2-CNF formula, determine which variables are forced — that is, take the same value in every satisfying assignment. Return a list of (variable, forcedValue) pairs.",
        "Example 1:\nInput: n = 2, clauses = [[1,1],[-2,-2]]\nOutput: [(0, true), (1, false)]\nExplanation: The clause (x_0 OR x_0) forces x_0 true, and (NOT x_1 OR NOT x_1) forces x_1 false.",
        "Constraints:\n- 1 <= n <= 10^5\n- The formula is satisfiable",
      ],
      code: `vector<pair<int,char>> forcedVariables(TwoSat& ts) {
    // A variable is forced when one of its literals reaches the other
    // in the implication graph: x -> NOT x means x must be false.
    vector<pair<int,char>> forced;
    int total = 2 * ts.n;
    for (int var = 0; var < ts.n; var++) {
        int nFalse = TwoSat::node(var, false);
        int nTrue  = TwoSat::node(var, true);
        // BFS from a literal, checking whether it reaches its own negation.
        auto reaches = [&](int from, int target) {
            vector<char> seen(total, 0);
            queue<int> q;
            seen[from] = 1;
            q.push(from);
            while (!q.empty()) {
                int u = q.front(); q.pop();
                if (u == target) return true;
                for (int v : ts.adj[u])
                    if (!seen[v]) { seen[v] = 1; q.push(v); }
            }
            return false;
        };
        if (reaches(nTrue, nFalse)) forced.push_back({var, 0});
        else if (reaches(nFalse, nTrue)) forced.push_back({var, 1});
    }
    return forced;
}`,
      explanation: [
        "If assuming x is true leads by implication to x being false, then x cannot be true in any satisfying assignment — it is forced false. The symmetric check forces the other direction.",
        "The straightforward version above runs a search per variable, which is fine for auditing a small instance. For large inputs, compute the condensation DAG once and test component reachability instead of re-searching.",
        "Time: O(n * (n + m)) as written; O(n + m) with a single condensation and reachability pass. Space: O(n + m).",
      ],
    },
    {
      name: "At-Most-One Constraint Encoding",
      difficulty: "Hard",
      variation: "At-most-one of k",
      question: [
        "You must express the constraint that at most one of k given boolean variables is true, using only 2-CNF clauses. Report the clauses. Then explain why the naive pairwise encoding is quadratic and how a sequential (commander) encoding with auxiliary variables reduces it to linear.",
        "Example 1:\nInput: variables = [x_0, x_1, x_2]\nOutput: pairwise clauses (NOT x_0 OR NOT x_1), (NOT x_0 OR NOT x_2), (NOT x_1 OR NOT x_2)",
        "Constraints:\n- 2 <= k <= 10^5",
      ],
      code: `// Pairwise encoding: O(k^2) clauses, no extra variables.
void atMostOnePairwise(TwoSat& ts, vector<int>& vars) {
    for (size_t i = 0; i < vars.size(); i++)
        for (size_t j = i + 1; j < vars.size(); j++)
            ts.addClause(-(vars[i] + 1), -(vars[j] + 1));
}

// Sequential encoding: O(k) clauses using k prefix variables.
// prefix[i] means "some variable among the first i+1 is true".
void atMostOneSequential(TwoSat& ts, vector<int>& vars, vector<int>& prefix) {
    int k = vars.size();
    for (int i = 0; i < k; i++) {
        // vars[i] implies prefix[i]
        ts.addClause(-(vars[i] + 1), prefix[i] + 1);
        if (i > 0) {
            // prefix[i-1] implies prefix[i]
            ts.addClause(-(prefix[i - 1] + 1), prefix[i] + 1);
            // vars[i] and prefix[i-1] cannot both hold
            ts.addClause(-(vars[i] + 1), -(prefix[i - 1] + 1));
        }
    }
}`,
      explanation: [
        "At-most-one is naturally a set of pairwise mutual exclusions, each of which is already a 2-clause. That gives a correct but quadratic encoding — unusable at k = 10^5.",
        "The sequential encoding introduces prefix variables carrying the running claim some earlier variable is already true. Forbidding a variable from coexisting with a true prefix enforces the same constraint with a linear number of clauses, and every clause still has only two literals so it stays inside 2-SAT.",
        "Time: O(k^2) or O(k) clauses respectively. Space: proportional to the clause count.",
      ],
    },
    {
      name: "Shift Assignment With Pairwise Conflicts",
      difficulty: "Hard",
      variation: "Either-or scheduling",
      question: [
        "Each of n workers must be assigned to either the day shift or the night shift. You are given a list of constraints of three kinds: two workers must be on the same shift, two workers must be on different shifts, or a specific worker must take a specific shift. Decide whether a valid assignment exists and return one.",
        "Example 1:\nInput: n = 3, same = [[0,1]], different = [[1,2]], fixed = [[0, day]]\nOutput: worker 0 day, worker 1 day, worker 2 night",
        "Constraints:\n- 1 <= n <= 10^5\n- Total constraints up to 10^5",
      ],
      code: `// x_i true means worker i takes the night shift.
vector<char> assignShifts(int n, vector<pair<int,int>>& same,
                          vector<pair<int,int>>& different,
                          vector<pair<int,bool>>& fixedShift, bool& ok) {
    TwoSat ts(n);
    for (auto& p : same) {
        int a = p.first + 1, b = p.second + 1;
        ts.addClause(-a, b);   // a implies b
        ts.addClause(a, -b);   // b implies a
    }
    for (auto& p : different) {
        int a = p.first + 1, b = p.second + 1;
        ts.addClause(a, b);    // not both day
        ts.addClause(-a, -b);  // not both night
    }
    for (auto& p : fixedShift) {
        int a = p.first + 1;
        ts.addClause(p.second ? a : -a, p.second ? a : -a);
    }
    ok = ts.satisfiable();
    if (!ok) return {};
    return assignment(ts);
}`,
      explanation: [
        "Equality between two booleans is the clause pair (NOT a OR b) and (a OR NOT b); inequality is (a OR b) and (NOT a OR NOT b). A fixed value is a unit clause written as a clause repeating the same literal twice.",
        "Union-Find with parity solves the same-or-different subproblem more directly, but 2-SAT scales to constraints that parity cannot express, such as if worker 3 is on nights then worker 5 must be too.",
        "Time: O(n + m). Space: O(n + m).",
      ],
    },
    {
      name: "Light Switches With Paired Rooms",
      difficulty: "Hard",
      variation: "Implication chains",
      question: [
        "There are n switches, each either up or down. You are given m rules, each of the form: if switch a is in state s then switch b must be in state t. Decide whether some configuration satisfies every rule, and return one if it exists.",
        "Example 1:\nInput: n = 2, rules = [(switch 0 up implies switch 1 down), (switch 1 up implies switch 0 down)]\nOutput: satisfiable, for example switch 0 up and switch 1 down.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= m <= 10^5",
      ],
      code: `struct Rule { int a; bool aState; int b; bool bState; };

vector<char> solveSwitches(int n, vector<Rule>& rules, bool& ok) {
    TwoSat ts(n);
    for (auto& r : rules) {
        // (a == aState) implies (b == bState)
        // equivalently the clause (a != aState) OR (b == bState)
        int litA = r.aState ? -(r.a + 1) : (r.a + 1);
        int litB = r.bState ? (r.b + 1) : -(r.b + 1);
        ts.addClause(litA, litB);
    }
    ok = ts.satisfiable();
    if (!ok) return {};
    return assignment(ts);
}`,
      explanation: [
        "An implication p -> q is the clause (NOT p OR q), so rules stated as implications need no restructuring at all — they map onto single clauses directly.",
        "This is often the easiest way to spot a 2-SAT problem: any collection of if-then rules over binary states, where each rule mentions at most two states, is 2-SAT.",
        "Time: O(n + m). Space: O(n + m).",
      ],
    },
    {
      name: "Seating Arrangement With Conflicting Guests",
      difficulty: "Hard",
      variation: "Two-table partition",
      question: [
        "You must seat n guests at exactly two tables. Some pairs of guests refuse to share a table, and some pairs insist on sharing one. Determine whether a valid seating exists and return the table (0 or 1) for each guest.",
        "Example 1:\nInput: n = 4, refuse = [[0,1],[2,3]], insist = [[0,2]]\nOutput: guests 0 and 2 at table 0, guests 1 and 3 at table 1",
        "Constraints:\n- 1 <= n <= 10^5\n- Both lists together contain at most 10^5 pairs",
      ],
      code: `vector<char> seatGuests(int n, vector<pair<int,int>>& refuse,
                        vector<pair<int,int>>& insist, bool& ok) {
    TwoSat ts(n);
    for (auto& p : refuse) {
        int a = p.first + 1, b = p.second + 1;
        ts.addClause(a, b);
        ts.addClause(-a, -b);
    }
    for (auto& p : insist) {
        int a = p.first + 1, b = p.second + 1;
        ts.addClause(-a, b);
        ts.addClause(a, -b);
    }
    ok = ts.satisfiable();
    if (!ok) return {};
    return assignment(ts);
}`,
      explanation: [
        "With exactly two tables, each guest's seat is one boolean, so refusals become inequality constraints and insistences become equality constraints — both expressible as clause pairs.",
        "Note the sharp cliff here: two tables is 2-SAT and solvable in linear time, but three tables is graph 3-colouring and NP-complete. The number two is doing essential work.",
        "Time: O(n + m). Space: O(n + m).",
      ],
    },
    {
      name: "Graph 2-Colouring Reduced to 2-SAT",
      difficulty: "Medium",
      variation: "Bipartite check as 2-SAT",
      question: [
        "Given an undirected graph, decide whether it is bipartite by expressing the problem as a 2-SAT instance rather than by BFS colouring. Return true if 2-colourable.",
        "Example 1:\nInput: n = 3, edges = [[0,1],[1,2],[0,2]]\nOutput: false\nExplanation: The triangle is an odd cycle, so the derived formula is unsatisfiable.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= edges.length <= 10^5",
      ],
      code: `bool isBipartiteVia2Sat(int n, vector<pair<int,int>>& edges) {
    TwoSat ts(n);
    for (auto& e : edges) {
        int a = e.first + 1, b = e.second + 1;
        // Endpoints must differ: (a OR b) AND (NOT a OR NOT b)
        ts.addClause(a, b);
        ts.addClause(-a, -b);
    }
    return ts.satisfiable();
}`,
      explanation: [
        "Colour becomes a boolean per vertex, and every edge asserts its endpoints differ. An odd cycle produces an implication chain that returns a literal to its own negation, putting both in one SCC and reporting unsatisfiable.",
        "This is a worked reduction, not the recommended method — BFS 2-colouring is simpler and faster for this specific task. The value is in seeing how a familiar constraint translates, so you recognise the pattern when the constraints stop being pure inequality.",
        "Time: O(n + m). Space: O(n + m).",
      ],
    },
    {
      name: "Symmetry and Antisymmetry Constraints",
      difficulty: "Hard",
      variation: "Skew-symmetry properties",
      question: [
        "Given a 2-SAT instance, verify that the implication graph you built is correctly skew-symmetric: for every edge (u -> v) the edge (NOT v -> NOT u) must also be present. Return true if the invariant holds, false with a counterexample edge otherwise. This is the standard way to catch a buggy clause-adding routine.",
        "Example 1:\nInput: A graph built by adding only one implication per clause\nOutput: false\nExplanation: Adding just (NOT a -> b) without (NOT b -> a) breaks skew-symmetry and silently loses constraints.",
        "Constraints:\n- 1 <= n <= 10^4 for this audit",
      ],
      code: `bool checkSkewSymmetry(TwoSat& ts, pair<int,int>& counterexample) {
    int total = 2 * ts.n;
    // negate(node) flips the truth value while keeping the variable.
    auto negate = [](int node) { return node ^ 1; };
    vector<set<int>> edgeSet(total);
    for (int u = 0; u < total; u++)
        for (int v : ts.adj[u]) edgeSet[u].insert(v);
    for (int u = 0; u < total; u++)
        for (int v : ts.adj[u]) {
            int ru = negate(v), rv = negate(u);
            if (!edgeSet[ru].count(rv)) {
                counterexample = {u, v};
                return false;
            }
        }
    return true;
}`,
      explanation: [
        "Because node 2i and 2i+1 differ only in the low bit, negating a literal is a single XOR with 1 — a detail worth internalising since it makes the whole implementation compact.",
        "The contrapositive of (u -> v) is (NOT v -> NOT u), so a correctly built 2-SAT graph always contains both. Verifying this invariant catches the single most common 2-SAT bug, which is adding only one of the two implications a clause requires.",
        "Time: O((n + m) log m) with the set lookups. Space: O(n + m).",
      ],
    },
    {
      name: "Why Counting 2-SAT Solutions Is Hard",
      difficulty: "Hard",
      variation: "Complexity boundary",
      question: [
        "You are asked to count the number of satisfying assignments of a 2-CNF formula. Explain why the SCC method that decides satisfiability in linear time does not extend to counting, and give a correct exponential-time counting routine for small n as a fallback.",
        "Example 1:\nInput: n = 2, clauses = [[1,2]]\nOutput: 3\nExplanation: Of the four assignments, only x_0 false with x_1 false violates the clause.",
        "Constraints:\n- 1 <= n <= 25 for the brute-force fallback",
      ],
      code: `long long count2SatSolutions(int n, vector<pair<int,int>>& clauses) {
    // Brute force over all 2^n assignments. Correct for small n only.
    long long total = 0;
    for (long long mask = 0; mask < (1LL << n); mask++) {
        bool ok = true;
        for (auto& c : clauses) {
            auto holds = [&](int lit) {
                int var = abs(lit) - 1;
                bool value = (mask >> var) & 1LL;
                return lit > 0 ? value : !value;
            };
            if (!holds(c.first) && !holds(c.second)) { ok = false; break; }
        }
        if (ok) total++;
    }
    return total;
}`,
      explanation: [
        "Deciding satisfiability only needs to know whether any variable collides with its own negation in one SCC — a yes/no structural fact. Counting requires knowing how many consistent choices the condensation DAG admits, and those choices interact across components.",
        "Counting 2-SAT solutions is #P-complete, so no polynomial algorithm is expected even though the decision problem is linear. This is a genuine complexity gap, not a gap in known technique — the same split appears for perfect matchings, where deciding is easy and counting is #P-complete.",
        "Time: O(2^n * m) for the brute force. Space: O(1).",
      ],
    },
    {
      name: "Minimising True Variables Is NP-Hard",
      difficulty: "Hard",
      variation: "Optimisation boundary",
      question: [
        "Given a satisfiable 2-CNF formula, you want the satisfying assignment with the fewest variables set to true. Explain why this optimisation version is not solvable by the standard 2-SAT machinery, and provide a correct exponential search for small n.",
        "Example 1:\nInput: n = 3, clauses = [[1,2],[2,3]]\nOutput: 1\nExplanation: Setting only x_1 (the second variable) true satisfies both clauses.",
        "Constraints:\n- 1 <= n <= 25 for the exhaustive version",
      ],
      code: `int minTrueVariables(int n, vector<pair<int,int>>& clauses) {
    int best = n + 1;
    for (long long mask = 0; mask < (1LL << n); mask++) {
        bool ok = true;
        for (auto& c : clauses) {
            auto holds = [&](int lit) {
                int var = abs(lit) - 1;
                bool value = (mask >> var) & 1LL;
                return lit > 0 ? value : !value;
            };
            if (!holds(c.first) && !holds(c.second)) { ok = false; break; }
        }
        if (ok) best = min(best, __builtin_popcountll(mask));
    }
    return best == n + 1 ? -1 : best;
}`,
      explanation: [
        "The SCC method finds some satisfying assignment by picking the topologically later literal for each variable. That rule is chosen for consistency, not for minimising true variables, and there is no way to bias it toward false without breaking correctness.",
        "Minimum-ones 2-SAT is NP-hard — it generalises vertex cover, which is why no efficient exact algorithm is expected. Recognising that an innocuous-sounding add-on turns a linear problem intractable is the real lesson here.",
        "Time: O(2^n * m). Space: O(1).",
      ],
    },
  ],
};
