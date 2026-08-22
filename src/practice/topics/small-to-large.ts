import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Distinct Colors",
      difficulty: "Easy",
      variation: "Merging sets up the tree, the template",
      link: "https://cses.fi/problemset/task/1139",
      question: [
        "A rooted tree of n nodes is given, rooted at node 1. Each node has a colour. For every node, report the number of distinct colours that appear in its subtree (the node itself included).",
        "The first line has n. The second line has the colours c_1..c_n. The next n-1 lines each describe an edge between two nodes. Print n integers, the answer for nodes 1..n.",
        "Example 1:\nInput:\n5\n2 3 2 2 1\n1 2\n1 3\n3 4\n3 5\nOutput: 3 1 2 1 1\nExplanation: The whole tree holds colours {1,2,3} so node 1 answers 3. Subtree of 3 is {3,4,5} with colours 2, 2, 1, so two distinct colours. Every leaf answers 1.",
        "Example 2:\nInput:\n7\n1 2 1 3 3 2 1\n1 2\n1 3\n2 4\n2 5\n3 6\n3 7\nOutput: 3 2 2 1 1 1 1\nExplanation: Subtree of 2 is {2,4,5} with colours 2, 3, 3 giving {2,3}. Subtree of 3 is {3,6,7} with colours 1, 2, 1 giving {1,2}.",
        "Constraints:\n- 1 <= n <= 2 * 10^5\n- 1 <= c_i <= 10^9",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> c(n + 1);
    for (int i = 1; i <= n; i++) cin >> c[i];
    vector<vector<int>> adj(n + 1);
    for (int i = 0; i < n - 1; i++) {
        int a, b;
        cin >> a >> b;
        adj[a].push_back(b);
        adj[b].push_back(a);
    }
    // Iterative DFS: preorder plus parents. n can be 2*10^5, so avoid recursion.
    vector<int> par(n + 1, 0), order;
    order.reserve(n);
    vector<char> vis(n + 1, 0);
    vector<int> st{1};
    vis[1] = 1;
    while (!st.empty()) {
        int u = st.back(); st.pop_back();
        order.push_back(u);
        for (int v : adj[u]) if (!vis[v]) { vis[v] = 1; par[v] = u; st.push_back(v); }
    }
    vector<set<int>> s(n + 1);
    vector<int> ans(n + 1);
    // Reverse preorder is a valid postorder: every child is finished before its parent.
    for (int i = n - 1; i >= 0; i--) {
        int u = order[i];
        s[u].insert(c[u]);
        ans[u] = (int)s[u].size();
        int p = par[u];
        if (p) {
            if (s[p].size() < s[u].size()) swap(s[p], s[u]);  // parent adopts the bigger set
            for (int x : s[u]) s[p].insert(x);                // then absorb the smaller one
            s[u].clear();
        }
    }
    for (int i = 1; i <= n; i++) cout << ans[i] << " \\n"[i == n];
    return 0;
}`,
      explanation: [
        "The state carried up the tree is the whole set of colours present in a subtree, because 'distinct count' cannot be summed from children - two children may share colours. Naively concatenating children costs O(subtree size) per node and degrades to O(n^2) on a path-like tree.",
        "The fix is ownership rather than copying. When merging a child into its parent, first swap so the parent holds whichever container is already larger, then insert the smaller container's elements one by one. Swapping two std::set objects is O(1) - only internal pointers move - so the only real cost is the elements of the smaller side.",
        "Why the total is near-linear: every time an element is physically re-inserted, it lands in a container at least twice the size of the one it came from (it was on the smaller side of the merge). An element can double its home container's size at most log n times, so each of the n elements is moved O(log n) times overall.",
        "The trap is doing the size test but then copying the small set into a fresh container, or iterating the parent instead of the child. Both throw away the guarantee. The direction of the copy is the whole algorithm; the swap is what makes 'always merge the smaller one' legal even though the result must end up in the parent's slot.",
        "Time: O(n log^2 n) - O(n log n) element moves, each an O(log n) set insertion. Space: O(n).",
      ],
    },
    {
      name: "Number of Nodes in the Sub-Tree With the Same Label",
      difficulty: "Medium",
      variation: "Merging frequency maps",
      link: "https://leetcode.com/problems/number-of-nodes-in-the-sub-tree-with-the-same-label/",
      question: [
        "A tree of n nodes numbered 0..n-1 is rooted at node 0 and given as an undirected edge list. Each node i carries a lowercase letter labels[i]. Return an array ans of length n where ans[i] is the number of nodes in the subtree of i whose label equals labels[i]. Node i counts itself.",
        "Example 1:\nInput: n = 7, edges = [[0,1],[0,2],[1,4],[1,5],[2,3],[2,6]], labels = 'abaedcd'\nOutput: [2,1,1,1,1,1,1]\nExplanation: The subtree of 0 is the whole tree and contains the letter 'a' at nodes 0 and 2, so ans[0] = 2. Every other node is the only occurrence of its own letter inside its own subtree.",
        "Example 2:\nInput: n = 4, edges = [[0,1],[1,2],[0,3]], labels = 'bbbb'\nOutput: [4,2,1,1]\nExplanation: All four labels are 'b'. The subtree of 0 has 4 nodes, the subtree of 1 is {1,2} with 2 nodes, and nodes 2 and 3 are leaves.",
        "Constraints:\n- 1 <= n <= 10^5\n- edges.length == n - 1\n- labels consists of lowercase English letters",
      ],
      code: `class Solution {
public:
    vector<int> countSubTrees(int n, vector<vector<int>>& edges, string labels) {
        vector<vector<int>> adj(n);
        for (auto& e : edges) {
            adj[e[0]].push_back(e[1]);
            adj[e[1]].push_back(e[0]);
        }
        vector<int> ans(n, 0);
        vector<map<char,int>> cnt(n);
        function<void(int,int)> dfs = [&](int u, int p) {
            for (int v : adj[u]) {
                if (v == p) continue;
                dfs(v, u);
                if (cnt[u].size() < cnt[v].size()) swap(cnt[u], cnt[v]);  // keep the bigger table
                for (auto& [ch, k] : cnt[v]) cnt[u][ch] += k;             // absorb the smaller
                cnt[v].clear();
            }
            ans[u] = ++cnt[u][labels[u]];  // add own label last, its new count is the answer
        };
        dfs(0, -1);
        return ans;
    }
};`,
      explanation: [
        "Same skeleton as merging sets, but the aggregate is a multiset: map<letter, count>. Counts are additive, so absorbing a child means adding its counts key by key, and the parent's own label is added once at the end.",
        "Inserting the node's own label last is deliberate. After the merge the table describes the subtree minus u, so ++cnt[u][labels[u]] both completes the table and yields exactly the number the problem asks for, with no second lookup.",
        "The alphabet here is only 26 letters, so an array<int,26> per node with a plain child-into-parent add is also O(26n) and is arguably the better answer for this specific problem. This entry is worth solving with maps anyway: the code is unchanged when the labels become arbitrary integers, where a dense array is impossible and small-to-large is the only cheap option.",
        "The tempting wrong move is to keep a single global counter and re-walk each subtree to read it off. Without an entry/exit rollback that double counts siblings, and with rollback it becomes DSU on tree - correct, but a different technique.",
        "Time: O(n log n) map operations with a 26-key ceiling, so effectively O(n) here. Space: O(n).",
      ],
    },
    {
      name: "Confluence",
      difficulty: "Medium",
      variation: "Small-to-large on a DSU, not a tree",
      link: "https://atcoder.jp/contests/abc183/tasks/abc183_f",
      question: [
        "There are N students numbered 1..N; student i belongs to class C_i. Then Q queries arrive online and must be answered in order. A query '1 a b' merges the group containing student a with the group containing student b (initially every student is alone). A query '2 x y' asks how many students in the group containing x belong to class y.",
        "Example 1:\nInput:\n6 7\n1 2 1 3 2 1\n1 1 2\n1 2 3\n2 1 1\n1 4 5\n2 4 2\n1 3 4\n2 5 1\nOutput:\n2\n1\n2\nExplanation: After the first two merges the group is {1,2,3} with classes 1, 2, 1, so class 1 has 2 members. Then {4,5} has classes 3 and 2, so class 2 has 1 member. The last merge joins everything except student 6, and among {1,2,3,4,5} class 1 appears at students 1 and 3.",
        "Constraints:\n- 1 <= N <= 2 * 10^5\n- 1 <= Q <= 2 * 10^5\n- 1 <= C_i <= N\n- queries must be answered online, in the given order",
      ],
      code: `int n;
vector<int> par, sz;
vector<map<int,int>> cnt;   // only valid at a DSU root

int find(int x) {
    while (par[x] != x) { par[x] = par[par[x]]; x = par[x]; }  // path halving
    return x;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int q;
    cin >> n >> q;
    par.resize(n + 1);
    sz.assign(n + 1, 1);
    cnt.assign(n + 1, {});
    for (int i = 1; i <= n; i++) par[i] = i;
    for (int i = 1; i <= n; i++) { int c; cin >> c; cnt[i][c] = 1; }
    while (q--) {
        int t, a, b;
        cin >> t >> a >> b;
        if (t == 1) {
            int ra = find(a), rb = find(b);
            if (ra == rb) continue;
            if (sz[ra] < sz[rb]) swap(ra, rb);                          // union by size
            if (cnt[ra].size() < cnt[rb].size()) cnt[ra].swap(cnt[rb]);  // but move the smaller map
            for (auto& [c, k] : cnt[rb]) cnt[ra][c] += k;
            cnt[rb].clear();
            par[rb] = ra;
            sz[ra] += sz[rb];
        } else {
            auto& m = cnt[find(a)];
            auto it = m.find(b);
            cout << (it == m.end() ? 0 : it->second) << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "Small-to-large is not a tree technique, it is a merging technique - anything that only ever unions disjoint collections can use it. Here the collections are DSU components and the payload is a class histogram, so a query is one map lookup at the component's root.",
        "Two independent heuristics are at work and they must be kept apart. Union by size (or rank) decides which node becomes the DSU root, which is what bounds find() to near-constant time. Small-to-large decides which histogram is physically copied. They can disagree - a component with many members may have few distinct classes - so the code picks the root by sz and then swaps the maps so that the new root owns the larger histogram before absorbing the smaller.",
        "Correctness of the payload is trivially maintained by the invariant 'cnt[r] is exactly the histogram of r's component, for every root r'. Merging adds two histograms, and only the root's copy is ever read, so stale maps left behind at non-roots do not matter (they are cleared to release memory).",
        "The wrong-but-tempting alternative is offline processing: build the final components and answer everything at the end. It fails here because a type-2 query must see the state at its own moment in time, and answers can shrink relative to the final state only if merges were undone - which never happens, so the answer at query time genuinely differs from the answer at the end.",
        "Time: O((N + Q) log^2 N) - each of the N students is copied O(log N) times, each copy an O(log N) map update. Space: O(N).",
      ],
    },
    {
      name: "Count Descendants",
      difficulty: "Medium",
      variation: "Depth-keyed counts, offline queries",
      link: "https://atcoder.jp/contests/abc202/tasks/abc202_e",
      question: [
        "A rooted tree with N vertices is given; vertex 1 is the root and the parent of vertex i (for i >= 2) is p_i with p_i < i. The depth of the root is 0. Answer Q queries: for a query (U, D), how many vertices v satisfy both 'v is in the subtree of U' and 'depth of v equals D'? Note that U itself counts when depth(U) == D.",
        "Example 1:\nInput:\n7\n1 1 2 2 4 2\n4\n1 2\n7 2\n4 1\n5 5\nOutput:\n3\n1\n0\n0\nExplanation: Depths are v1=0, v2=v3=1, v4=v5=v7=2, v6=3. The subtree of 1 is everything, so depth 2 gives {4,5,7} which is 3. The subtree of 7 is just {7}, whose depth is 2, so the second query is 1. The subtree of 4 is {4,6} at depths 2 and 3, so no vertex has depth 1. Nothing has depth 5.",
        "Constraints:\n- 2 <= N <= 2 * 10^5\n- 1 <= p_i < i\n- 1 <= Q <= 2 * 10^5\n- 1 <= U <= N and 0 <= D <= N - 1",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> par(n + 1, 0);
    vector<vector<int>> kids(n + 1);
    for (int i = 2; i <= n; i++) { cin >> par[i]; kids[par[i]].push_back(i); }
    vector<int> order, dep(n + 1, 0), st{1};
    order.reserve(n);
    while (!st.empty()) {
        int u = st.back(); st.pop_back();
        order.push_back(u);
        for (int v : kids[u]) { dep[v] = dep[u] + 1; st.push_back(v); }
    }
    int q;
    cin >> q;
    vector<int> qd(q), ansq(q, 0);
    vector<vector<int>> at(n + 1);            // queries bucketed by their vertex
    for (int i = 0; i < q; i++) { int u, d; cin >> u >> d; qd[i] = d; at[u].push_back(i); }
    vector<map<int,int>> cnt(n + 1);          // absolute depth -> how many vertices
    for (int i = n - 1; i >= 0; i--) {
        int u = order[i];
        cnt[u][dep[u]]++;
        for (int id : at[u]) {                // subtree of u is complete right here
            auto it = cnt[u].find(qd[id]);
            ansq[id] = (it == cnt[u].end() ? 0 : it->second);
        }
        int p = par[u];
        if (p) {
            if (cnt[p].size() < cnt[u].size()) cnt[p].swap(cnt[u]);
            for (auto& [d, k] : cnt[u]) cnt[p][d] += k;
            cnt[u].clear();
        }
    }
    for (int i = 0; i < q; i++) cout << ansq[i] << "\\n";
    return 0;
}`,
      explanation: [
        "The payload becomes a histogram keyed by absolute depth. Absolute depth, not depth relative to u, is the key that makes merging free: a child's table can be added into the parent's without shifting any key. Relative depths would require re-indexing every entry on every merge, which destroys the whole point.",
        "Queries are answered offline at exactly one moment: bucket each query on its vertex U, and read the table the instant u's own entry has been inserted and all children have been absorbed. At that point cnt[u] is the depth histogram of the subtree of u and never will be again, since it is about to be donated to the parent.",
        "This is the general shape of every small-to-large query problem: the merged structure is alive only in the window between 'children absorbed' and 'donated upward', so all questions about that subtree must be asked there.",
        "For this particular problem an Euler tour plus one sorted list of tin values per depth answers each query with two binary searches in O(log n) and less memory - worth knowing, because it is the standard answer. Small-to-large wins when the per-depth payload is richer than a count, as in the harder variants below.",
        "Time: O((N + Q) log^2 N). Space: O(N + Q).",
      ],
    },
    {
      name: "Lomsat gelral",
      difficulty: "Hard",
      variation: "Merging with a maintained aggregate",
      link: "https://codeforces.com/problemset/problem/600/E",
      question: [
        "A tree of n vertices rooted at vertex 1 is given, and vertex v has colour c_v. A colour is dominating in a subtree if no other colour occurs strictly more times in that subtree, so several colours can be dominating at once. For every vertex, print the sum of the dominating colours of its subtree.",
        "Example 1:\nInput:\n4\n1 2 3 4\n1 2\n2 3\n2 4\nOutput: 10 9 3 4\nExplanation: All colours are distinct, so inside any subtree every present colour occurs once and all of them are dominating. Vertex 1 sums 1+2+3+4 = 10, vertex 2 sums 2+3+4 = 9, and the leaves sum their own colour.",
        "Example 2:\nInput:\n5\n1 1 2 2 3\n1 2\n1 3\n3 4\n3 5\nOutput: 3 1 2 2 3\nExplanation: The subtree of 1 has counts colour1 = 2, colour2 = 2, colour3 = 1, so colours 1 and 2 tie at 2 and the answer is 3. The subtree of 3 is {3,4,5} with colour 2 twice and colour 3 once, so only colour 2 dominates and the answer is 2.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= c_v <= n\n- the sum of dominating colours can exceed 32 bits",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> c(n + 1);
    for (int i = 1; i <= n; i++) cin >> c[i];
    vector<vector<int>> adj(n + 1);
    for (int i = 0; i < n - 1; i++) {
        int a, b;
        cin >> a >> b;
        adj[a].push_back(b);
        adj[b].push_back(a);
    }
    vector<int> par(n + 1, 0), order;
    order.reserve(n);
    vector<char> vis(n + 1, 0);
    vector<int> st{1};
    vis[1] = 1;
    while (!st.empty()) {
        int u = st.back(); st.pop_back();
        order.push_back(u);
        for (int v : adj[u]) if (!vis[v]) { vis[v] = 1; par[v] = u; st.push_back(v); }
    }
    vector<map<int,int>> cnt(n + 1);
    vector<int> best(n + 1, 0);
    vector<long long> sum(n + 1, 0), ans(n + 1, 0);
    // Raise one colour's count and repair (best, sum) in O(1).
    auto bump = [&](int u, int col, int add) {
        int v = (cnt[u][col] += add);
        if (v > best[u]) { best[u] = v; sum[u] = col; }
        else if (v == best[u]) sum[u] += col;
    };
    for (int i = n - 1; i >= 0; i--) {
        int u = order[i];
        bump(u, c[u], 1);
        ans[u] = sum[u];
        int p = par[u];
        if (p) {
            if (cnt[p].size() < cnt[u].size()) {   // the aggregate travels with the table
                cnt[p].swap(cnt[u]);
                swap(best[p], best[u]);
                swap(sum[p], sum[u]);
            }
            for (auto& [col, k] : cnt[u]) bump(p, col, k);
            cnt[u].clear();
        }
    }
    for (int i = 1; i <= n; i++) cout << ans[i] << " \\n"[i == n];
    return 0;
}`,
      explanation: [
        "The answer is not a property of the container as a whole, so it is maintained incrementally alongside it: best is the maximum count currently in the table and sum is the total of all colours achieving it. Recomputing best by scanning the table after each merge would cost O(size) per merge and reintroduce quadratic behaviour.",
        "The O(1) repair is valid only because counts never decrease during a merge. When a colour's count rises to v: if v > best the old maximum is beaten and sum restarts at that single colour; if v == best the colour joins the tie. A colour cannot already be inside sum when it reaches v == best, since its previous count was v - add < best, so no double counting is possible.",
        "The subtle bug worth internalising is the swap. best and sum describe a specific table, so when the parent adopts the child's table it must adopt the child's aggregate in the same breath. Swapping the maps and forgetting best and sum produces answers that look plausible on small trees and collapse on large ones.",
        "The sum needs 64 bits: up to 10^5 colours of value up to 10^5 can tie at count 1, giving roughly 5 * 10^9.",
        "Time: O(n log^2 n). Space: O(n).",
      ],
    },
    {
      name: "Dominant Indices",
      difficulty: "Hard",
      variation: "Depth histogram with a tie-broken argmax",
      link: "https://codeforces.com/problemset/problem/1009/F",
      question: [
        "A tree of n vertices rooted at vertex 1 is given. For a vertex v let d(v, k) be the number of vertices in the subtree of v that are at distance exactly k from v. The dominant index of v is the value k that maximises d(v, k); if several k tie, the smallest such k is the dominant index. Print the dominant index of every vertex from 1 to n, one per line.",
        "Example 1:\nInput:\n4\n1 2\n2 3\n3 4\nOutput:\n0\n0\n0\n0\nExplanation: The tree is a path. In any subtree of a path there is exactly one vertex at each distance, so all counts equal 1 and the smallest maximising distance is 0 everywhere.",
        "Example 2:\nInput:\n4\n1 2\n1 3\n1 4\nOutput:\n1\n0\n0\n0\nExplanation: For vertex 1, d(1,0) = 1 and d(1,1) = 3, so the dominant index is 1. The three leaves each see only themselves, giving 0.",
        "Constraints:\n- 1 <= n <= 10^6\n- the input describes a tree, so there are exactly n - 1 edges",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<vector<int>> adj(n + 1);
    for (int i = 0; i < n - 1; i++) {
        int a, b;
        cin >> a >> b;
        adj[a].push_back(b);
        adj[b].push_back(a);
    }
    vector<int> par(n + 1, 0), dep(n + 1, 0), order, st{1};
    order.reserve(n);
    vector<char> vis(n + 1, 0);
    vis[1] = 1;
    while (!st.empty()) {
        int u = st.back(); st.pop_back();
        order.push_back(u);
        for (int v : adj[u]) if (!vis[v]) { vis[v] = 1; par[v] = u; dep[v] = dep[u] + 1; st.push_back(v); }
    }
    vector<map<int,int>> cnt(n + 1);                 // absolute depth -> count
    vector<int> best(n + 1, 0), bestDep(n + 1, 0), ans(n + 1, 0);
    auto bump = [&](int u, int d, int add) {
        int v = (cnt[u][d] += add);
        // strictly better count wins; equal count wins only if shallower
        if (v > best[u] || (v == best[u] && d < bestDep[u])) { best[u] = v; bestDep[u] = d; }
    };
    for (int i = n - 1; i >= 0; i--) {
        int u = order[i];
        bump(u, dep[u], 1);
        ans[u] = bestDep[u] - dep[u];                // absolute depth back to a distance
        int p = par[u];
        if (p) {
            if (cnt[p].size() < cnt[u].size()) {
                cnt[p].swap(cnt[u]);
                swap(best[p], best[u]);
                swap(bestDep[p], bestDep[u]);
            }
            for (auto& [d, k] : cnt[u]) bump(p, d, k);
            cnt[u].clear();
        }
    }
    for (int i = 1; i <= n; i++) cout << ans[i] << "\\n";
    return 0;
}`,
      explanation: [
        "Keying the histogram by absolute depth keeps merges key-preserving, and the requested distance is recovered at read time as bestDep[u] - dep[u]. The subtraction is the only place the relative view is ever needed.",
        "The tie-break survives incremental maintenance because bestDep always holds the shallowest depth among those attaining best. When a count rises to v: v > best resets the pair; v == best replaces bestDep only if the new depth is shallower, which preserves the invariant; v < best is irrelevant. Counts only grow during merges, so no attained maximum is ever silently lost.",
        "The tempting shortcut of keeping only best and picking any maximising depth fails on symmetric trees, where two depths tie and the judge wants the smaller one - a difference that never shows up on the path example and always shows up on real tests.",
        "Honest note on limits: with n = 10^6 this map-based version is O(n log^2 n) with large constants and heavy memory, so it is a correct reference solution rather than a comfortable one. The intended trick for this problem is the long-path (deepest-child) variant of the same idea - each vertex reuses the array of its deepest child through a shifted pointer instead of a map, which merges shallow siblings only and runs in O(n) time and memory.",
        "Time: O(n log^2 n) as written; O(n) with long-path merging. Space: O(n).",
      ],
    },
    {
      name: "Blood Cousins",
      difficulty: "Hard",
      variation: "Binary lifting plus depth counts on a forest",
      link: "https://codeforces.com/problemset/problem/208/E",
      question: [
        "A family forest of n people is given by a parent array, where parent 0 means the person has no parent recorded. Person x is a 1-ancestor of y if x is y's parent, and an i-ancestor if x is the parent of an (i-1)-ancestor of y. Two distinct people are p-th cousins if they share a common p-ancestor. For each of m queries (v, p) print the number of p-th cousins of v.",
        "Example 1:\nInput:\n6\n0 1 1 0 4 4\n7\n1 1\n1 2\n2 1\n2 2\n4 1\n5 1\n6 1\nOutput: 0 0 1 0 0 1 1\nExplanation: Persons 1 and 4 are roots, so they have no p-ancestor at all and answer 0. Person 2 has 1-ancestor 1, whose subtree holds two people at person 2's depth (2 and 3), so excluding person 2 itself the answer is 1. Person 2 has no 2-ancestor. Persons 5 and 6 are siblings under 4, so each has one 1st cousin.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= m <= 10^5\n- the parent relation is acyclic, so the input is a forest\n- 1 <= p <= n",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> par(n + 1, 0);
    vector<vector<int>> kids(n + 1);
    vector<int> roots;
    for (int i = 1; i <= n; i++) {
        cin >> par[i];
        if (par[i] == 0) roots.push_back(i);
        else kids[par[i]].push_back(i);
    }
    const int LOG = 17;
    vector<array<int,LOG>> up(n + 1);
    vector<int> dep(n + 1, 0), order;
    order.reserve(n);
    vector<int> st(roots.begin(), roots.end());
    while (!st.empty()) {
        int u = st.back(); st.pop_back();
        order.push_back(u);
        up[u][0] = par[u];
        // parents are always expanded before their children, so up[par][j-1] is ready
        for (int j = 1; j < LOG; j++) up[u][j] = up[u][j-1] ? up[up[u][j-1]][j-1] : 0;
        for (int v : kids[u]) { dep[v] = dep[u] + 1; st.push_back(v); }
    }
    auto kth = [&](int v, int k) {
        for (int j = 0; j < LOG && v; j++) if (k >> j & 1) v = up[v][j];
        return v;
    };
    int m;
    cin >> m;
    vector<int> qd(m), ansq(m, 0);
    vector<vector<int>> at(n + 1);
    for (int i = 0; i < m; i++) {
        int v, p;
        cin >> v >> p;
        int a = (p <= dep[v]) ? kth(v, p) : 0;   // p levels above v must exist
        if (a) { at[a].push_back(i); qd[i] = dep[v]; }
    }
    vector<map<int,int>> cnt(n + 1);
    for (int i = n - 1; i >= 0; i--) {
        int u = order[i];
        cnt[u][dep[u]]++;
        for (int id : at[u]) {
            auto it = cnt[u].find(qd[id]);
            ansq[id] = (it == cnt[u].end() ? 0 : it->second - 1);   // drop v itself
        }
        int p = par[u];
        if (p) {
            if (cnt[p].size() < cnt[u].size()) cnt[p].swap(cnt[u]);
            for (auto& [d, k] : cnt[u]) cnt[p][d] += k;
            cnt[u].clear();
        }
    }
    for (int i = 0; i < m; i++) cout << ansq[i] << " \\n"[i == m - 1];
    return 0;
}`,
      explanation: [
        "Rewrite the definition into something a subtree histogram can answer. Two people are p-th cousins exactly when they have the same p-ancestor a, which forces them to sit at the same depth inside the subtree of a. So the answer is (number of vertices at depth dep[v] in the subtree of a) - 1, where a is v's p-ancestor.",
        "Binary lifting locates a in O(log n), and the query is then re-anchored from v to a: it is stored in a's bucket with the target depth dep[v]. The small-to-large pass over the forest builds the depth histogram of every subtree exactly once and reads the buckets at the right instant.",
        "Two edge cases decide the verdict: when p > dep[v] there is no p-ancestor and the answer is 0 rather than a lookup, and the -1 is mandatory because v itself is counted in the histogram and is not its own cousin.",
        "This is a forest, not a tree, so the DFS starts from every parentless node and no single global root may be assumed. The lifting table also needs the 0 sentinel to mean 'off the top', otherwise a jump past a root silently wraps to a valid vertex.",
        "Time: O((n + m) log^2 n). Space: O(n log n) for the lifting table.",
      ],
    },
    {
      name: "Tree Requests",
      difficulty: "Hard",
      variation: "Merging parity bitmasks per depth",
      link: "https://codeforces.com/problemset/problem/570/D",
      question: [
        "A rooted tree of n vertices is given; vertex 1 is the root at depth 1, the parent of vertex i (for i >= 2) is p_i, and every vertex carries a lowercase letter. For each of m queries (v, h) decide whether the letters written on the vertices that lie in the subtree of v and have depth exactly h can be rearranged into a palindrome. Print 'Yes' or 'No'. An empty collection of letters counts as a palindrome.",
        "Example 1:\nInput:\n6 5\n1 1 1 3 3\nzacccd\n1 1\n3 3\n4 1\n6 1\n1 2\nOutput:\nYes\nNo\nYes\nYes\nYes\nExplanation: Depths are v1 = 1, v2 = v3 = v4 = 2, v5 = v6 = 3. Query (1,1) sees only 'z'. Query (3,3) sees vertices 5 and 6, letters 'c' and 'd', two odd counts, so No. Queries (4,1) and (6,1) select no vertex at all. Query (1,2) sees 'a','c','c', which rearranges to cac.",
        "Constraints:\n- 1 <= n, m <= 5 * 10^5\n- 1 <= p_i < i\n- letters are lowercase English letters\n- 1 <= v <= n and 1 <= h <= n",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<int> par(n + 1, 0);
    vector<vector<int>> kids(n + 1);
    for (int i = 2; i <= n; i++) { cin >> par[i]; kids[par[i]].push_back(i); }
    string s;
    cin >> s;
    vector<int> dep(n + 1, 0), order, st{1};
    order.reserve(n);
    dep[1] = 1;
    while (!st.empty()) {
        int u = st.back(); st.pop_back();
        order.push_back(u);
        for (int v : kids[u]) { dep[v] = dep[u] + 1; st.push_back(v); }
    }
    vector<int> qh(m);
    vector<char> ansq(m, 0);
    vector<vector<int>> at(n + 1);
    for (int i = 0; i < m; i++) { int v, h; cin >> v >> h; at[v].push_back(i); qh[i] = h; }
    vector<map<int,int>> mask(n + 1);        // depth -> xor of 1 << letter over that depth
    for (int i = n - 1; i >= 0; i--) {
        int u = order[i];
        mask[u][dep[u]] ^= 1 << (s[u - 1] - 'a');
        for (int id : at[u]) {
            auto it = mask[u].find(qh[id]);
            int mk = (it == mask[u].end() ? 0 : it->second);
            ansq[id] = (__builtin_popcount(mk) <= 1);   // 0 or 1 odd letters
        }
        int p = par[u];
        if (p) {
            if (mask[p].size() < mask[u].size()) mask[p].swap(mask[u]);
            for (auto& [d, k] : mask[u]) mask[p][d] ^= k;   // xor is associative, merge is free
            mask[u].clear();
        }
    }
    for (int i = 0; i < m; i++) cout << (ansq[i] ? "Yes" : "No") << "\\n";
    return 0;
}`,
      explanation: [
        "A multiset of letters can be permuted into a palindrome exactly when at most one letter has an odd multiplicity. Only parities matter, so the entire per-depth payload compresses from 26 counters into a single 26-bit mask, and combining two groups is an xor.",
        "That compression is what makes the merge cheap: the payload for one depth is one int, so absorbing a child costs one map operation per distinct depth in the child rather than per vertex. Storing full counts would be correct but 26 times heavier for no gain, since the query only ever asks a parity question.",
        "Queries are bucketed on their vertex and read in the window where mask[u] describes the whole subtree of u. A query whose depth h is above v, or deeper than the subtree reaches, finds no key and correctly answers Yes on the empty multiset - which is a real test case, not a curiosity.",
        "Note that the root sits at depth 1 in this problem, and h is an absolute depth, not a distance from v. Treating h as relative passes the first sample and fails immediately afterwards.",
        "Time: O((n + m) log^2 n). Space: O(n + m).",
      ],
    },
    {
      name: "Blood Cousins Return",
      difficulty: "Hard",
      variation: "Nested small-to-large: a map of sets",
      link: "https://codeforces.com/problemset/problem/246/E",
      question: [
        "A family forest of n people is given; each person has a name and a parent, where parent 0 means no parent is recorded. Person y is a k-son of person x if x is an ancestor of y exactly k levels above. For each of m queries (v, k) print how many distinct names appear among the k-sons of v.",
        "Example 1:\nInput:\n6\npasha 0\ngerald 1\ngerald 1\nvalera 2\nigor 3\nolesya 1\n5\n1 1\n1 2\n1 3\n3 1\n6 1\nOutput:\n2\n2\n0\n1\n0\nExplanation: The 1-sons of person 1 are persons 2, 3 and 6 with names gerald, gerald, olesya, so two distinct names. The 2-sons of person 1 are persons 4 and 5, valera and igor, so two again. Person 1 has no 3-sons. Person 3 has the single 1-son person 5. Person 6 is a leaf.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= m <= 10^5\n- names are non-empty lowercase strings of length at most 20\n- 1 <= k <= 10^5",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> par(n + 1, 0), name(n + 1, 0);
    vector<vector<int>> kids(n + 1);
    vector<int> roots;
    map<string,int> ids;
    for (int i = 1; i <= n; i++) {
        string s;
        int p;
        cin >> s >> p;
        name[i] = ids.emplace(s, (int)ids.size()).first->second;   // names to small ints
        par[i] = p;
        if (p == 0) roots.push_back(i); else kids[p].push_back(i);
    }
    vector<int> dep(n + 1, 0), order, st(roots.begin(), roots.end());
    order.reserve(n);
    while (!st.empty()) {
        int u = st.back(); st.pop_back();
        order.push_back(u);
        for (int v : kids[u]) { dep[v] = dep[u] + 1; st.push_back(v); }
    }
    int m;
    cin >> m;
    vector<int> qd(m), ansq(m, 0);
    vector<vector<int>> at(n + 1);
    for (int i = 0; i < m; i++) {
        int v, k;
        cin >> v >> k;
        at[v].push_back(i);
        qd[i] = dep[v] + k;                    // absolute depth of the k-th generation below v
    }
    vector<map<int, set<int>>> byDep(n + 1);
    vector<long long> tot(n + 1, 0);           // stored elements, drives the outer choice
    for (int i = n - 1; i >= 0; i--) {
        int u = order[i];
        byDep[u][dep[u]].insert(name[u]);
        tot[u]++;
        for (int id : at[u]) {
            auto it = byDep[u].find(qd[id]);
            ansq[id] = (it == byDep[u].end() ? 0 : (int)it->second.size());
        }
        int p = par[u];
        if (p) {
            if (tot[p] < tot[u]) { byDep[p].swap(byDep[u]); swap(tot[p], tot[u]); }
            for (auto& [d, sm] : byDep[u]) {
                auto& big = byDep[p][d];
                if (big.size() < sm.size()) big.swap(sm);   // small-to-large again, per depth
                for (int x : sm) big.insert(x);
            }
            tot[p] += tot[u];
            byDep[u].clear();
            tot[u] = 0;
        }
    }
    for (int i = 0; i < m; i++) cout << ansq[i] << "\\n";
    return 0;
}`,
      explanation: [
        "The k-sons of v are exactly the vertices of v's subtree at absolute depth dep[v] + k, so the payload is 'for each depth, the set of name ids present'. Names are interned into integers first, because comparing strings inside a hot set merge is a constant factor nobody needs.",
        "The heuristic has to be applied twice, and that is the point of this problem. The outer merge picks whichever vertex already stores more elements (tracked in tot, not the number of map keys - one key can hold a huge set). The inner merge, for each shared depth, swaps so the destination holds the bigger set before absorbing the smaller. Skipping the inner swap makes a single deep merge cost the size of the destination and reopens the quadratic hole the outer swap just closed.",
        "The amortised bound still holds because every element, on every physical move, ends up in a set at least as large as the one it left plus itself; each element therefore moves O(log n) times and each move is an O(log n) insertion.",
        "Distinct counting is why sets are needed rather than counters: two cousins may share a name, and the query wants names, not people. Merging counts and then counting non-zero entries would need a scan and would lose the O(1) size read.",
        "Time: O((n + m) log^2 n). Space: O(n + m).",
      ],
    },
    {
      name: "Smallest Missing Genetic Value in Each Subtree",
      difficulty: "Hard",
      variation: "Merging sets with an amortised mex pointer",
      link: "https://leetcode.com/problems/smallest-missing-genetic-value-in-each-subtree/",
      question: [
        "A rooted tree of n nodes numbered 0..n-1 is given by parents, where parents[0] == -1 and parents[i] is the parent of node i. Each node has a distinct genetic value nums[i]. Return an array ans where ans[i] is the smallest positive integer that does not appear as a genetic value anywhere in the subtree of node i.",
        "Example 1:\nInput: parents = [-1,0,0,2], nums = [1,2,3,4]\nOutput: [5,1,1,1]\nExplanation: The subtree of 0 holds the values {1,2,3,4}, so the smallest missing value is 5. Every other subtree misses the value 1, so the answer there is 1.",
        "Example 2:\nInput: parents = [-1,0,1,0,3,3], nums = [5,4,6,2,1,3]\nOutput: [7,1,1,4,2,1]\nExplanation: The whole tree holds {1,2,3,4,5,6} so ans[0] = 7. The subtree of 3 is {3,4,5} holding {2,1,3}, which misses 4. The subtree of 4 holds only {1}, which misses 2. The subtrees of 1, 2 and 5 do not contain the value 1.",
        "Constraints:\n- 1 <= n <= 10^5\n- parents[0] == -1 and 0 <= parents[i] < i for i >= 1\n- 1 <= nums[i] <= 10^5 and all values in nums are distinct",
      ],
      code: `class Solution {
public:
    vector<int> smallestMissingValueSubtree(vector<int>& parents, vector<int>& nums) {
        int n = parents.size();
        vector<vector<int>> kids(n);
        for (int i = 1; i < n; i++) kids[parents[i]].push_back(i);
        vector<int> ans(n, 1), order;
        order.reserve(n);
        vector<int> st{0};
        while (!st.empty()) {
            int u = st.back(); st.pop_back();
            order.push_back(u);
            for (int v : kids[u]) st.push_back(v);
        }
        vector<unordered_set<int>> seen(n);
        for (int i = n - 1; i >= 0; i--) {
            int u = order[i];
            int mex = 1;
            for (int v : kids[u]) {
                if (seen[u].size() < seen[v].size()) seen[u].swap(seen[v]);
                for (int x : seen[v]) seen[u].insert(x);
                seen[v].clear();
                mex = max(mex, ans[v]);          // at most one child can answer more than 1
            }
            seen[u].insert(nums[u]);
            while (seen[u].count(mex)) mex++;    // never scans a value twice on a branch
            ans[u] = mex;
        }
        return ans;
    }
};`,
      explanation: [
        "Merge the sets of genetic values upward small-to-large, then compute the answer at u by starting the search where the best child already got stuck instead of restarting from 1. Starting there is safe: if a child's subtree contains 1..t-1, so does u's larger subtree, hence ans[u] >= ans[child].",
        "The pointer walk is what keeps this near-linear, and the reason is a structural fact about mex: any subtree that does not contain the value 1 answers exactly 1. So on any vertex, at most one child - the one whose subtree contains the value 1 - can report more than 1. The vertices with answer above 1 therefore form a single path from the holder of value 1 up to the root, and the pointer advances a total of O(n) times along that path rather than once per vertex.",
        "The wrong-but-tempting version keeps the small-to-large merge but recomputes the mex from 1 at every node. That is O(answer) per node and degrades to quadratic on a long chain with values arranged in increasing order, even though the merging half of the algorithm is perfectly efficient.",
        "unordered_set is used because only membership is ever asked, never order, and its swap is still O(1) so the merging heuristic is unaffected. The known O(n) solution skips merging entirely: mark every subtree answer as 1, then walk up from the node holding value 1, flooding each new subtree and advancing one global mex pointer.",
        "Time: O(n log n) expected - O(n log n) element moves plus O(n) total pointer advance. Space: O(n).",
      ],
    },
  ],
};
