import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Subordinates",
      difficulty: "Easy",
      variation: "Subtree aggregation, the template",
      link: "https://cses.fi/problemset/task/1674",
      question: [
        "A company has n employees numbered 1..n. Employee 1 is the general director, and every other employee i has exactly one direct boss, given as an integer. For every employee, report how many subordinates they have, where a subordinate is any employee below them in the hierarchy, at any depth.",
        "Example 1:\nInput:\n5\n1 1 2 3\nOutput: 4 1 1 0 0\nExplanation: The bosses of employees 2,3,4,5 are 1,1,2,3. Employee 1 sits above everyone, so 4 subordinates. Employee 2 has only 4 below, employee 3 has only 5 below, and 4 and 5 are leaves.",
        "Example 2:\nInput:\n2\n1\nOutput: 1 0\nExplanation: Employee 2 is the single subordinate of employee 1.",
        "Constraints:\n- 1 <= n <= 2 * 10^5\n- the input describes a valid rooted tree with root 1",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<vector<int>> ch(n + 1);
    for (int i = 2; i <= n; i++) {
        int b;
        cin >> b;
        ch[b].push_back(i);
    }
    // Iterative pre-order: a parent is always pushed into 'order' before its descendants.
    vector<int> order;
    order.reserve(n);
    vector<int> st{1};
    while (!st.empty()) {
        int u = st.back();
        st.pop_back();
        order.push_back(u);
        for (int v : ch[u]) st.push_back(v);
    }
    vector<int> sz(n + 1, 1);
    for (int i = n - 1; i >= 0; i--) {       // reverse pre-order = every child before its parent
        int u = order[i];
        for (int v : ch[u]) sz[u] += sz[v];
    }
    for (int i = 1; i <= n; i++) cout << sz[i] - 1 << " \\n"[i == n];
    return 0;
}`,
      explanation: [
        "Every subtree problem starts here: the value at a node is a fold over the values of its children. Here the fold is addition of subtree sizes, and the answer for u is size(u) - 1 because u is not its own subordinate.",
        "The correctness condition is only about order: a node may be evaluated no earlier than all of its children. A pre-order list has every parent before its descendants, so walking that list backwards is a valid post-order for aggregation purposes. Using the iterative version instead of recursion matters at n = 2 * 10^5, where a degenerate chain would otherwise blow the call stack.",
        "The tempting wrong approach is to answer each employee independently with a fresh traversal of their subtree. That is O(n^2) on a chain, and it is the exact cost that DSU on tree exists to remove: information already computed for a child must be reused, never recomputed.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Number of Nodes in the Sub-Tree With the Same Label",
      difficulty: "Medium",
      variation: "Fixed-alphabet counter merge",
      link: "https://leetcode.com/problems/number-of-nodes-in-the-sub-tree-with-the-same-label/",
      question: [
        "You are given a tree of n nodes numbered 0..n-1 rooted at node 0, described by n-1 undirected edges, and a string labels of length n where labels[i] is the lowercase letter assigned to node i. Return an array ans of length n where ans[i] is the number of nodes in the subtree of node i that carry the same label as node i (node i itself counts).",
        "Example 1:\nInput: n = 7, edges = [[0,1],[0,2],[1,4],[1,5],[2,3],[2,6]], labels = 'abaedcd'\nOutput: [2,1,1,1,1,1,1]\nExplanation: The subtree of node 0 is the whole tree and contains the letter 'a' at nodes 0 and 2, so ans[0] = 2. Every other node is the only occurrence of its own letter inside its own subtree.",
        "Example 2:\nInput: n = 4, edges = [[0,1],[1,2],[0,3]], labels = 'bbbb'\nOutput: [4,2,1,1]\nExplanation: All labels are 'b'. Subtree sizes are 4, 2, 1 and 1.",
        "Constraints:\n- 1 <= n <= 10^5\n- edges describes a tree\n- labels consists of lowercase English letters only",
      ],
      code: `vector<int> countSubTrees(int n, vector<vector<int>>& edges, string labels) {
    vector<vector<int>> g(n);
    for (auto& e : edges) {
        g[e[0]].push_back(e[1]);
        g[e[1]].push_back(e[0]);
    }
    vector<int> par(n, -1), order;
    order.reserve(n);
    vector<char> seen(n, 0);
    vector<int> st{0};
    seen[0] = 1;
    while (!st.empty()) {
        int u = st.back();
        st.pop_back();
        order.push_back(u);
        for (int v : g[u]) if (!seen[v]) { seen[v] = 1; par[v] = u; st.push_back(v); }
    }
    vector<array<int, 26>> cnt(n);
    for (auto& c : cnt) c.fill(0);
    vector<int> ans(n);
    for (int i = n - 1; i >= 0; i--) {          // children finished before their parent
        int u = order[i];
        cnt[u][labels[u] - 'a']++;              // u itself joins its own bucket
        ans[u] = cnt[u][labels[u] - 'a'];
        if (u != 0)
            for (int c = 0; c < 26; c++) cnt[par[u]][c] += cnt[u][c];   // push the whole histogram up
    }
    return ans;
}`,
      explanation: [
        "The state carried up the tree is no longer one number but a 26-slot histogram of the letters inside the subtree. Once the histogram of subtree(u) exists, the answer for u is a single lookup at u's own letter.",
        "Merging is safe because the subtrees of distinct children are disjoint, so counts add without any inclusion-exclusion. This is the point where the pattern generalises: any commutative, associative aggregate over a multiset of subtree values can be folded the same way.",
        "The alphabet being fixed at 26 is what keeps a naive merge cheap. Each edge moves 26 integers, so the total is 26n. The moment the value domain becomes large (colours up to 10^5, arbitrary strings) this direct merge becomes O(n * domain) and you must switch to small-to-large or to the heavy-child sack, which is exactly what the later problems in this list need.",
        "Time: O(26n). Space: O(26n) for the per-node histograms; reusing the child's array in place instead of allocating one per node drops it to O(n + 26 * depth).",
      ],
    },
    {
      name: "Distinct Colors",
      difficulty: "Medium",
      variation: "Small-to-large set merging",
      link: "https://cses.fi/problemset/task/1139",
      question: [
        "A rooted tree of n nodes is given, rooted at node 1. Each node has a colour, an integer. For every node, report the number of distinct colours in its subtree.",
        "Example 1:\nInput:\n5\n2 3 2 2 1\n1 2\n1 3\n3 4\n3 5\nOutput: 3 1 2 1 1\nExplanation: The whole tree holds colours 1, 2 and 3, so node 1 answers 3. Subtree of 3 is nodes 3,4,5 with colours 2,2,1, so 2 distinct. The leaves answer 1 each, and node 2 alone has colour 3.",
        "Example 2:\nInput:\n4\n1 1 2 2\n1 2\n2 3\n3 4\nOutput: 2 2 1 1\nExplanation: The tree is the path 1-2-3-4. Subtrees of 1 and 2 both contain a 1 and a 2; subtrees of 3 and 4 contain only colour 2.",
        "Constraints:\n- 1 <= n <= 2 * 10^5\n- 1 <= colour <= 10^9",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> col(n + 1);
    for (int i = 1; i <= n; i++) cin >> col[i];
    vector<vector<int>> g(n + 1);
    for (int i = 0; i < n - 1; i++) {
        int a, b;
        cin >> a >> b;
        g[a].push_back(b);
        g[b].push_back(a);
    }
    vector<int> par(n + 1, 0), order;
    order.reserve(n);
    vector<char> seen(n + 1, 0);
    vector<int> st{1};
    seen[1] = 1;
    while (!st.empty()) {
        int u = st.back();
        st.pop_back();
        order.push_back(u);
        for (int v : g[u]) if (!seen[v]) { seen[v] = 1; par[v] = u; st.push_back(v); }
    }
    vector<set<int>> bag(n + 1);
    vector<int> id(n + 1);
    for (int i = 1; i <= n; i++) id[i] = i;     // id[v] = which bag currently belongs to v
    vector<int> ans(n + 1);
    for (int i = n - 1; i >= 0; i--) {
        int u = order[i];
        bag[id[u]].insert(col[u]);
        ans[u] = (int)bag[id[u]].size();
        int p = par[u];
        if (p) {
            if (bag[id[p]].size() < bag[id[u]].size()) swap(id[p], id[u]);  // steal the bigger bag
            for (int x : bag[id[u]]) bag[id[p]].insert(x);
            bag[id[u]].clear();
        }
    }
    for (int i = 1; i <= n; i++) cout << ans[i] << " \\n"[i == n];
    return 0;
}`,
      explanation: [
        "The aggregate is now a set, and set union has no cheap incremental form: copying the union costs the size of what you copy. The fix is small-to-large - always pour the smaller set into the larger one and hand the larger container to the parent, keeping only a pointer swap, never a full copy.",
        "The bound is a counting argument on a single element. An element is physically moved only when the set holding it loses the size contest, and the set it lands in is at least twice as large as before. A set can double at most log2(n) times, so each of the n elements is moved O(log n) times, giving O(n log n) insertions in total.",
        "The indirection through id[] is the load-bearing detail: a node does not own a bag, it owns a handle to one. Without the swap - if you always merged into the parent's own container - a star-shaped or bamboo tree degrades to O(n^2) copying, and the whole idea is lost.",
        "Duplicate colours cost nothing extra here because a set absorbs them, which is why this problem needs no counters. Ties into DSU on tree: the heavy-child sack is the same trick with the 'large' side made explicit by subtree size, using a global structure instead of per-node containers.",
        "Time: O(n log^2 n) - O(n log n) insertions, each O(log n) in a balanced tree. Space: O(n).",
      ],
    },
    {
      name: "Smallest Missing Genetic Value in Each Subtree",
      difficulty: "Hard",
      variation: "Small-to-large with a monotone mex pointer",
      link: "https://leetcode.com/problems/smallest-missing-genetic-value-in-each-subtree/",
      question: [
        "There is a family tree of n nodes numbered 0..n-1, given as an array parents where parents[i] is the parent of node i and parents[0] = -1 marks the root. You are also given nums, an array of n distinct positive integers, where nums[i] is the genetic value of node i. Return an array ans of length n where ans[i] is the smallest positive integer that does not appear as the genetic value of any node in the subtree rooted at i.",
        "Example 1:\nInput: parents = [-1,0,0,2], nums = [1,2,3,4]\nOutput: [5,1,1,1]\nExplanation: The subtree of 0 holds the values 1,2,3,4 so the smallest missing value is 5. The subtree of 1 holds only 2, of 2 holds 3 and 4, of 3 holds 4; none of them contains 1.",
        "Example 2:\nInput: parents = [-1,0,1,0,3,3], nums = [5,4,6,2,1,3]\nOutput: [7,1,1,4,2,1]\nExplanation: Node 0 has children 1 and 3; node 1 has child 2; node 3 has children 4 and 5. The whole tree holds 1..6 so ans[0] = 7. Subtree of 3 holds 2,1,3 so its smallest missing value is 4. Subtree of 4 holds only 1, so 2. The rest miss 1.",
        "Constraints:\n- 1 <= n <= 10^5\n- 0 <= parents[i] <= n-1 for i >= 1, parents[0] = -1\n- 1 <= nums[i] <= 10^5 and all nums[i] are distinct",
      ],
      code: `vector<int> smallestMissingValueSubtree(vector<int>& parents, vector<int>& nums) {
    int n = parents.size();
    vector<vector<int>> ch(n);
    for (int i = 1; i < n; i++) ch[parents[i]].push_back(i);
    vector<int> order;
    order.reserve(n);
    vector<int> st{0};
    while (!st.empty()) {
        int u = st.back();
        st.pop_back();
        order.push_back(u);
        for (int v : ch[u]) st.push_back(v);
    }
    vector<set<int>> bag(n);
    vector<int> id(n), ans(n, 1);
    for (int i = 0; i < n; i++) id[i] = i;
    for (int i = n - 1; i >= 0; i--) {
        int u = order[i];
        int keep = -1;
        for (int v : ch[u])
            if (keep == -1 || bag[id[v]].size() > bag[id[keep]].size()) keep = v;
        int best = 1;
        if (keep != -1) id[u] = id[keep];             // inherit the largest child's bag
        for (int v : ch[u]) {
            best = max(best, ans[v]);                 // mex is monotone: it can only grow upward
            if (v != keep) {
                for (int x : bag[id[v]]) bag[id[u]].insert(x);
                bag[id[v]].clear();
            }
        }
        bag[id[u]].insert(nums[u]);
        while (bag[id[u]].count(best)) best++;         // resume scanning, never restart from 1
        ans[u] = best;
    }
    return ans;
}`,
      explanation: [
        "The aggregate is the set of genetic values in the subtree and the answer is its mex. Small-to-large gives the set cheaply; the interesting part is computing the mex without rescanning.",
        "Two facts make the scan free. First, mex is monotone under set inclusion: subtree(u) contains subtree(v) for every child v, so ans[u] >= ans[v], and starting the scan at max(ans[children]) can never overshoot the true answer. Second, charge each node u the amount (ans[u] - ans[m]) where m is its argmax child. Those u -> m links form vertex-disjoint chains, each telescoping to at most n + 1, so the total number of pointer advances over the whole tree is O(n).",
        "Restarting the mex scan from 1 at every node is the trap - correct, but O(n) per node on a chain of small values, so O(n^2) overall. Rebuilding the set per node instead of stealing the biggest child's set is the same mistake one level down.",
        "Worth knowing the O(n) alternative for this specific problem: every node off the path from the holder of value 1 up to the root answers 1, so you only need to walk that one path, marking each newly absorbed subtree once. Small-to-large is the version that survives when the values are not a permutation.",
        "Time: O(n log^2 n). Space: O(n).",
      ],
    },
    {
      name: "Lomsat gelral",
      difficulty: "Hard",
      variation: "Canonical sack: dominating colour",
      link: "https://codeforces.com/problemset/problem/600/E",
      question: [
        "A tree of n vertices rooted at vertex 1 is given, and every vertex has a colour. A colour c dominates in the subtree of vertex v if no other colour occurs strictly more often than c inside that subtree, so several colours may dominate at once. For every vertex v, print the sum of all colours that dominate in the subtree of v.",
        "Example 1:\nInput:\n5\n1 2 1 2 3\n1 2\n1 3\n3 4\n3 5\nOutput: 3 2 6 2 3\nExplanation: Subtree of 3 is vertices 3,4,5 with colours 1,2,3 once each, so all three dominate and the sum is 6. The whole tree has colour 1 twice (vertices 1,3), colour 2 twice (vertices 2,4) and colour 3 once, so colours 1 and 2 dominate and the sum is 3. The leaves answer their own colour.",
        "Example 2:\nInput:\n2\n1 2\n1 2\nOutput: 3 2\nExplanation: In the subtree of vertex 1 both colours occur once, so both dominate and the answer is 1 + 2 = 3.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= colour <= n",
      ],
      code: `const int N = 100005;
int n, col[N], sz[N];
vector<int> g[N];
long long cnt[N], ans[N];
long long mx, sum;                 // current maximum frequency and sum of colours reaching it

void dfsSize(int u, int p) {
    sz[u] = 1;
    for (int v : g[u]) if (v != p) { dfsSize(v, u); sz[u] += sz[v]; }
}

void upd(int c, int delta) {
    cnt[c] += delta;
    if (delta > 0) {               // only insertions can raise the maximum
        if (cnt[c] > mx) { mx = cnt[c]; sum = c; }
        else if (cnt[c] == mx) sum += c;
    }
}

void trav(int u, int p, int delta) {
    upd(col[u], delta);
    for (int v : g[u]) if (v != p) trav(v, u, delta);
}

void dfs(int u, int p, bool keep) {
    int big = -1;
    for (int v : g[u]) if (v != p && (big == -1 || sz[v] > sz[big])) big = v;
    for (int v : g[u]) if (v != p && v != big) dfs(v, u, false);   // light children clean up after themselves
    if (big != -1) dfs(big, u, true);                              // the heavy child's counters stay in place
    for (int v : g[u]) if (v != p && v != big) trav(v, u, 1);       // re-add only the light subtrees
    upd(col[u], 1);
    ans[u] = sum;
    if (!keep) { trav(u, p, -1); mx = 0; sum = 0; }                 // structure is empty again
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n;
    for (int i = 1; i <= n; i++) cin >> col[i];
    for (int i = 0; i < n - 1; i++) {
        int a, b;
        cin >> a >> b;
        g[a].push_back(b);
        g[b].push_back(a);
    }
    dfsSize(1, 0);
    dfs(1, 0, true);
    for (int i = 1; i <= n; i++) cout << ans[i] << " \\n"[i == n];
    return 0;
}`,
      explanation: [
        "This is DSU on tree proper. There is one global structure - cnt[] plus the pair (mx, sum) - and the invariant is that when dfs(u, ., .) is entered the structure is empty, and when it returns with keep = true the structure holds exactly the multiset of colours of subtree(u).",
        "The saving is the heavy child. Recursing into it last with keep = true means its whole subtree is already loaded, so u only has to walk its light subtrees and itself. A vertex is therefore re-inserted once for every light edge above it, and any root path contains at most log2(n) light edges because crossing a light edge at least halves the remaining subtree size. Total inserts and deletes: O(n log n).",
        "Maintaining (mx, sum) incrementally works only for insertions: a deletion could lower the maximum and there is no cheap way to find the new one. That is why removal is always a full wipe of the subtree followed by mx = sum = 0, valid precisely because the structure is empty at that moment. Trying to keep (mx, sum) correct across arbitrary deletions is the classic wrong turn here.",
        "Note that sum must be 64-bit: up to 10^5 distinct colours of value up to 10^5 can tie, so the answer reaches about 5 * 10^9.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Tree and Queries",
      difficulty: "Hard",
      variation: "Offline queries with counts-of-counts",
      link: "https://codeforces.com/problemset/problem/375/D",
      question: [
        "You are given a tree of n vertices rooted at vertex 1, where vertex i has colour c_i, and m queries. Query j is a pair (v_j, k_j) and asks how many colours occur at least k_j times among the vertices of the subtree of v_j. Answer all queries.",
        "Example 1:\nInput:\n8 5\n1 2 2 3 3 2 3 3\n1 2\n1 5\n2 3\n2 4\n5 6\n5 7\n5 8\n1 2\n1 3\n1 4\n2 3\n5 3\nOutput:\n2\n2\n1\n0\n1\nExplanation: In the whole tree colour 1 occurs once, colour 2 three times (vertices 2,3,6) and colour 3 four times (vertices 4,5,7,8). So at least 2 gives 2 colours, at least 3 gives 2, at least 4 gives only colour 3. Subtree of 2 is 2,3,4 with colour 2 twice and colour 3 once, so at least 3 gives 0. Subtree of 5 is 5,6,7,8 with colour 3 three times, so at least 3 gives 1.",
        "Example 2:\nInput:\n3 2\n1 1 1\n1 2\n1 3\n1 3\n2 1\nOutput:\n1\n1\nExplanation: Colour 1 occurs three times in the subtree of 1, so at least 3 gives 1. The subtree of 2 is a single vertex, so at least 1 gives 1.",
        "Constraints:\n- 1 <= n, m <= 10^5\n- 1 <= c_i <= 10^5\n- 1 <= v_j <= n, 1 <= k_j <= 10^5",
      ],
      code: `const int N = 100005;
int n, m, col[N], sz[N];
int cnt[N];                        // cnt[c]  = occurrences of colour c currently loaded
int cc[N];                         // cc[k]   = how many colours occur at least k times
vector<int> g[N];
vector<pair<int,int>> qs[N];       // per vertex: (k, query index)
int ansq[N];

void dfsSize(int u, int p) {
    sz[u] = 1;
    for (int v : g[u]) if (v != p) { dfsSize(v, u); sz[u] += sz[v]; }
}

void upd(int c, int delta) {
    if (delta > 0) { cnt[c]++; cc[cnt[c]]++; }      // colour c just reached cnt[c] occurrences
    else { cc[cnt[c]]--; cnt[c]--; }
}

void trav(int u, int p, int delta) {
    upd(col[u], delta);
    for (int v : g[u]) if (v != p) trav(v, u, delta);
}

void dfs(int u, int p, bool keep) {
    int big = -1;
    for (int v : g[u]) if (v != p && (big == -1 || sz[v] > sz[big])) big = v;
    for (int v : g[u]) if (v != p && v != big) dfs(v, u, false);
    if (big != -1) dfs(big, u, true);
    for (int v : g[u]) if (v != p && v != big) trav(v, u, 1);
    upd(col[u], 1);
    for (auto& q : qs[u]) ansq[q.second] = cc[q.first];
    if (!keep) trav(u, p, -1);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n >> m;
    for (int i = 1; i <= n; i++) cin >> col[i];
    for (int i = 0; i < n - 1; i++) {
        int a, b;
        cin >> a >> b;
        g[a].push_back(b);
        g[b].push_back(a);
    }
    for (int j = 0; j < m; j++) {
        int v, k;
        cin >> v >> k;
        qs[v].push_back({k, j});
    }
    dfsSize(1, 0);
    dfs(1, 0, true);
    for (int j = 0; j < m; j++) cout << ansq[j] << "\\n";
    return 0;
}`,
      explanation: [
        "Two levels of counting. cnt[c] is the frequency of colour c inside the loaded subtree, and cc[k] is the number of colours whose frequency is at least k. A query is then a single array read, which is the only reason this fits in the time limit.",
        "cc[] can be maintained in O(1) per element because frequencies move by one. When colour c grows from x to x+1 the only threshold it newly satisfies is k = x+1, so cc[x+1]++ is the complete update; a decrement is the exact inverse. Trying to keep 'exactly k occurrences' instead of 'at least k' forces two array writes and makes each query a suffix sum, which is worse for no gain.",
        "The queries must be answered offline, grouped by their vertex, because the sack visits each subtree in exactly one moment in time. Attaching queries to vertices before the traversal starts is the standard way to bolt query answering onto any subtree aggregation.",
        "No guard on cc[k] is needed for k up to 10^5 as long as the array is that large: a colour can never occur more than n times, so cc[k] is genuinely 0 for k > n.",
        "Time: O((n log n) + m). Space: O(n + m).",
      ],
    },
    {
      name: "Blood Cousins",
      difficulty: "Hard",
      variation: "Counts per depth plus binary lifting",
      link: "https://codeforces.com/problemset/problem/208/E",
      question: [
        "A rooted forest of n vertices is given by the parent of each vertex, where 0 means the vertex is a root. Vertex u is a p-th cousin of vertex v if u and v are different vertices and they share the same p-th ancestor. Answer m queries, each giving v and p, with the number of p-th cousins of v.",
        "Example 1:\nInput:\n6\n0 1 1 0 4 4\n7\n1 1\n1 2\n2 1\n2 2\n4 1\n5 1\n6 1\nOutput: 0 0 1 0 0 1 1\nExplanation: The forest has two roots, 1 (children 2,3) and 4 (children 5,6). Vertices 1 and 4 have no ancestors at all, so their queries answer 0. Vertex 2 has 1st ancestor 1, whose subtree holds two vertices at depth 1 (2 and 3), so one cousin. Vertex 2 has no 2nd ancestor. Vertices 5 and 6 are 1st cousins of each other.",
        "Example 2:\nInput:\n3\n0 1 2\n2\n3 1\n3 2\nOutput: 0 0\nExplanation: The forest is the chain 1-2-3. Vertex 3 is the only vertex at its depth, so it has no cousins at any level.",
        "Constraints:\n- 1 <= n, m <= 10^5\n- 1 <= v <= n, 1 <= p <= n",
      ],
      code: `const int N = 100005, LG = 17;
int n, m, dep[N], sz[N], up[LG][N];
vector<int> g[N];
vector<pair<int,int>> qs[N];        // per ancestor: (target depth, query index)
int cntDepth[N], ansq[N];

void dfsSize(int u) {
    sz[u] = 1;
    for (int v : g[u]) { dep[v] = dep[u] + 1; dfsSize(v); sz[u] += sz[v]; }
}

int kth(int v, int k) {             // 0 if v has fewer than k ancestors
    for (int j = 0; j < LG && v; j++) if (k >> j & 1) v = up[j][v];
    return v;
}

void trav(int u, int delta) {
    cntDepth[dep[u]] += delta;
    for (int v : g[u]) trav(v, delta);
}

void dfs(int u, bool keep) {
    int big = -1;
    for (int v : g[u]) if (big == -1 || sz[v] > sz[big]) big = v;
    for (int v : g[u]) if (v != big) dfs(v, false);
    if (big != -1) dfs(big, true);
    for (int v : g[u]) if (v != big) trav(v, 1);
    cntDepth[dep[u]]++;
    for (auto& q : qs[u]) ansq[q.second] = cntDepth[q.first] - 1;   // exclude the queried vertex itself
    if (!keep) trav(u, -1);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n;
    vector<int> roots;
    for (int i = 1; i <= n; i++) {
        int p;
        cin >> p;
        up[0][i] = p;
        if (p) g[p].push_back(i);
        else roots.push_back(i);
    }
    for (int j = 1; j < LG; j++)
        for (int i = 1; i <= n; i++) up[j][i] = up[j - 1][up[j - 1][i]];   // up[.][0] stays 0
    for (int r : roots) { dep[r] = 0; dfsSize(r); }
    cin >> m;
    for (int j = 0; j < m; j++) {
        int v, p;
        cin >> v >> p;
        int a = kth(v, p);
        if (!a) ansq[j] = 0;
        else qs[a].push_back({dep[v], j});
    }
    for (int r : roots) dfs(r, false);      // false: each root wipes cntDepth[] for the next one
    for (int j = 0; j < m; j++) cout << ansq[j] << " \\n"[j == m - 1];
    return 0;
}`,
      explanation: [
        "Rewrite the question so it becomes a subtree query. Let a be the p-th ancestor of v. Every p-th cousin of v is a vertex of subtree(a) at the same absolute depth as v, and conversely, so the answer is (number of vertices at depth dep[v] inside subtree(a)) minus 1 for v itself. If a does not exist the answer is 0.",
        "Two independent tools compose: binary lifting locates a in O(log n) per query during preprocessing, and the sack maintains cntDepth[] - how many currently loaded vertices sit at each absolute depth - so the reformulated query is one array read at the moment subtree(a) is loaded.",
        "Absolute depth is the right key, not depth relative to a. Relative depth would force a shift of the whole array when merging a child into a parent; absolute depth makes the structure a plain global array that additions and deletions touch in O(1). The same choice reappears in every depth-flavoured variant of this pattern.",
        "The input is a forest, not a tree, so sizes and the sack must be run once per root, and up[j][0] = 0 acts as the off-the-top sentinel that makes kth return 0 when v is too shallow.",
        "Time: O(n log n + m log n). Space: O(n log n) for the jump table.",
      ],
    },
    {
      name: "Tree Requests",
      difficulty: "Hard",
      variation: "Per-depth parity bitmask",
      link: "https://codeforces.com/problemset/problem/570/D",
      question: [
        "A tree of n vertices rooted at vertex 1 is given by the parent of each vertex 2..n, and each vertex is labelled with a lowercase letter. The root is at depth 1 and a child is one deeper than its parent. Answer m queries: for a query (v, h), take all vertices at depth exactly h that lie in the subtree of v and decide whether their letters can be rearranged into a palindrome. Print 'Yes' or 'No'. An empty collection counts as a palindrome.",
        "Example 1:\nInput:\n6 5\n1 1 1 3 3\nzacccd\n1 1\n3 3\n4 1\n6 1\n1 2\nOutput:\nYes\nNo\nYes\nYes\nYes\nExplanation: Vertex 1 is the root with children 2,3,4; vertex 3 has children 5,6. Query (1,1) sees only 'z'. Query (3,3) sees vertices 5 and 6, letters 'c' and 'd', two odd counts, so No. Queries (4,1) and (6,1) see no vertices at depth 1 inside those subtrees. Query (1,2) sees vertices 2,3,4 with letters 'a','c','c', one odd count, so Yes.",
        "Example 2:\nInput:\n3 2\n1 1\nabc\n1 2\n2 2\nOutput:\nNo\nYes\nExplanation: Vertex 1 is the root with letter 'a' at depth 1; vertices 2 and 3 sit at depth 2 with letters 'b' and 'c'. Query (1,2) collects 'b' and 'c', two odd counts, so No. Query (2,2) collects only vertex 2, the single letter 'b', so Yes.",
        "Constraints:\n- 1 <= n, m <= 500000\n- parent of vertex i is smaller than i\n- 1 <= v, h <= n",
      ],
      code: `const int N = 500005;
int n, m, dep[N], sz[N], msk[N];   // msk[d] = parity bitmask of letters currently loaded at depth d
char ch[N];
vector<int> g[N];
vector<pair<int,int>> qs[N];       // per vertex: (h, query index)
bool ansq[N];

void dfsSize(int u) {
    sz[u] = 1;
    for (int v : g[u]) { dep[v] = dep[u] + 1; dfsSize(v); sz[u] += sz[v]; }
}

void trav(int u) {                 // xor is its own inverse, so one routine both adds and removes
    msk[dep[u]] ^= 1 << (ch[u] - 'a');
    for (int v : g[u]) trav(v);
}

void dfs(int u, bool keep) {
    int big = -1;
    for (int v : g[u]) if (big == -1 || sz[v] > sz[big]) big = v;
    for (int v : g[u]) if (v != big) dfs(v, false);
    if (big != -1) dfs(big, true);
    for (int v : g[u]) if (v != big) trav(v);
    msk[dep[u]] ^= 1 << (ch[u] - 'a');
    for (auto& q : qs[u]) ansq[q.second] = __builtin_popcount(msk[q.first]) <= 1;
    if (!keep) trav(u);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n >> m;
    for (int i = 2; i <= n; i++) {
        int p;
        cin >> p;
        g[p].push_back(i);
    }
    string s;
    cin >> s;
    for (int i = 1; i <= n; i++) ch[i] = s[i - 1];
    for (int j = 0; j < m; j++) {
        int v, h;
        cin >> v >> h;
        qs[v].push_back({h, j});
    }
    dep[1] = 1;
    dfsSize(1);
    dfs(1, true);
    for (int j = 0; j < m; j++) cout << (ansq[j] ? "Yes" : "No") << "\\n";
    return 0;
}`,
      explanation: [
        "A multiset of letters can be permuted into a palindrome exactly when at most one letter has odd multiplicity, so the only information a query needs is the parity vector of the 26 counts. That fits in one int per depth, and the test is popcount(mask) <= 1.",
        "Parity is what makes this variant unusually clean for the sack: xor is an involution, so adding a subtree and removing it are the same code, and no separate rollback logic or recomputation of a maximum is needed. Compare this with the dominating-colour problem, where deletion cannot be done incrementally at all.",
        "Depths are absolute, so a query with h < dep[v] reads a slot that no loaded vertex touches; it is 0, popcount 0, and the correct answer Yes falls out without a special case.",
        "The trap is thinking you need the actual counts. Storing 26 counters per depth is 26 * 5 * 10^5 ints and every insert touches one of them - it also works, but the parity bitmask is a single word and makes the query O(1) instead of O(26).",
        "Time: O(n log n + m). Space: O(n + m).",
      ],
    },
    {
      name: "Blood Cousins Return",
      difficulty: "Hard",
      variation: "Distinct values restricted to one depth",
      link: "https://codeforces.com/problemset/problem/246/E",
      question: [
        "A rooted forest of n people is given: for each person you get a name and the index of their parent, where 0 means the person is a root. Answer m queries of the form (v, k): how many distinct names appear among the descendants of v that are exactly k generations below v.",
        "Example 1:\nInput:\n6\npasha 0\ngerald 1\ngerald 1\nvalera 2\nigor 3\nolesya 1\n5\n1 1\n1 2\n1 3\n3 1\n6 1\nOutput:\n2\n2\n0\n1\n0\nExplanation: Person 1 has children 2 (gerald), 3 (gerald) and 6 (olesya), so one generation down holds two distinct names. Two generations down holds valera and igor, so 2. Three generations down is empty. Below person 3 there is only igor. Person 6 has no descendants.",
        "Example 2:\nInput:\n3\nann 0\nann 1\nbob 1\n2\n1 1\n2 1\nOutput:\n2\n0\nExplanation: One generation below person 1 there are ann and bob, two distinct names. Person 2 is a leaf.",
        "Constraints:\n- 1 <= n, m <= 10^5\n- names are non-empty lowercase strings of length at most 20\n- 1 <= v <= n, 1 <= k <= 10^5",
      ],
      code: `const int N = 100005;
int n, m, dep[N], sz[N], nameId[N];
vector<int> g[N];
vector<pair<int,int>> qs[N];       // per vertex: (absolute target depth, query index)
int distinctAt[N];                 // distinct names currently loaded at each depth
unordered_map<long long,int> occ;  // (depth, name) -> how many loaded vertices match
int ansq[N];

void dfsSize(int u) {
    sz[u] = 1;
    for (int v : g[u]) { dep[v] = dep[u] + 1; dfsSize(v); sz[u] += sz[v]; }
}

void touch(int u, int delta) {
    long long key = (long long)dep[u] * (N + 1) + nameId[u];
    if (delta > 0) { if (occ[key]++ == 0) distinctAt[dep[u]]++; }   // first copy of this name here
    else { if (--occ[key] == 0) distinctAt[dep[u]]--; }
}

void trav(int u, int delta) {
    touch(u, delta);
    for (int v : g[u]) trav(v, delta);
}

void dfs(int u, bool keep) {
    int big = -1;
    for (int v : g[u]) if (big == -1 || sz[v] > sz[big]) big = v;
    for (int v : g[u]) if (v != big) dfs(v, false);
    if (big != -1) dfs(big, true);
    for (int v : g[u]) if (v != big) trav(v, 1);
    touch(u, 1);
    for (auto& q : qs[u]) ansq[q.second] = distinctAt[q.first];
    if (!keep) trav(u, -1);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n;
    vector<int> roots;
    unordered_map<string,int> ids;
    for (int i = 1; i <= n; i++) {
        string s;
        int p;
        cin >> s >> p;
        auto it = ids.find(s);
        if (it == ids.end()) { nameId[i] = (int)ids.size(); ids[s] = nameId[i]; }
        else nameId[i] = it->second;
        if (p) g[p].push_back(i);
        else roots.push_back(i);
    }
    for (int r : roots) { dep[r] = 0; dfsSize(r); }
    cin >> m;
    for (int j = 0; j < m; j++) {
        int v, k;
        cin >> v >> k;
        long long d = (long long)dep[v] + k;
        if (d >= n) ansq[j] = 0;                 // deeper than any vertex can be
        else qs[v].push_back({(int)d, j});
    }
    for (int r : roots) dfs(r, false);      // false: each root empties the structure for the next one
    for (int j = 0; j < m; j++) cout << ansq[j] << "\\n";
    return 0;
}`,
      explanation: [
        "This combines the two hard ingredients seen separately earlier: the answer is restricted to one absolute depth, as in Blood Cousins, and it is a count of distinct values, as in Distinct Colors. The state is therefore keyed by the pair (depth, name).",
        "Distinctness cannot be maintained by a bare set here, because the sack inserts and deletes the same name many times and a set has no idea when the last copy leaves. Keeping a multiplicity per (depth, name) fixes that: distinctAt[d] changes only on the 0 -> 1 and 1 -> 0 transitions, which is what makes deletion exactly reversible.",
        "Names are mapped to small integers first so the key packs into a single 64-bit value; comparing strings inside the hot loop would multiply the constant factor by the name length for no benefit.",
        "The trap is answering with relative depth. The query gives k generations below v, so the target must be converted to the absolute depth dep[v] + k before it can be looked up in a global per-depth array, and values beyond n - 1 have to be short-circuited to 0.",
        "Time: O(n log n + m) expected, with a hash-map constant on every insert and delete. Space: O(n + m).",
      ],
    },
    {
      name: "Dominant Indices",
      difficulty: "Hard",
      variation: "Heavy-child array reuse, linear time",
      link: "https://codeforces.com/problemset/problem/1009/F",
      question: [
        "A tree of n vertices rooted at vertex 1 is given. For a vertex v let d(v, k) be the number of vertices in the subtree of v that lie exactly k edges below v, so d(v, 0) = 1. The dominant index of v is the value of k that maximises d(v, k), and among ties the smallest such k. Print the dominant index of every vertex.",
        "Example 1:\nInput:\n4\n1 2\n2 3\n3 4\nOutput:\n0\n0\n0\n0\nExplanation: The tree is the path 1-2-3-4. Every subtree is a chain, so d(v, k) is 1 for each reachable k and the smallest maximiser is always k = 0.",
        "Example 2:\nInput:\n4\n1 2\n1 3\n1 4\nOutput:\n1\n0\n0\n0\nExplanation: Vertex 1 has d(1,0) = 1 and d(1,1) = 3, so its dominant index is 1. The three leaves have only k = 0.",
        "Constraints:\n- 1 <= n <= 10^6\n- the n-1 edges describe a tree",
      ],
      code: `const int MAXN = 1000005;
vector<int> g[MAXN];
int len[MAXN], hv[MAXN], ansRel[MAXN];
int *cnt[MAXN];
int pool[MAXN], used = 0;

void dfs1(int u, int p) {
    len[u] = 1;
    hv[u] = 0;
    for (int v : g[u]) if (v != p) {
        dfs1(v, u);
        if (len[v] + 1 > len[u]) { len[u] = len[v] + 1; hv[u] = v; }   // heavy = deepest child
    }
}

void dfs2(int u, int p) {
    cnt[u][0] = 1;                       // u itself at relative depth 0
    int best = 0;
    if (hv[u]) {
        cnt[hv[u]] = cnt[u] + 1;         // the heavy child writes into u's own block, shifted by one
        dfs2(hv[u], u);
        best = ansRel[hv[u]] + 1;        // its argmax, reinterpreted from u
    }
    for (int v : g[u]) if (v != p && v != hv[u]) {
        cnt[v] = pool + used;            // every light child gets a fresh, zeroed block
        used += len[v];
        dfs2(v, u);
        for (int d = 0; d < len[v]; d++) {
            cnt[u][d + 1] += cnt[v][d];
            if (cnt[u][d + 1] > cnt[u][best] ||
                (cnt[u][d + 1] == cnt[u][best] && d + 1 < best)) best = d + 1;
        }
    }
    if (cnt[u][best] == 1) best = 0;     // all depths hold one vertex, so the smallest index wins
    ansRel[u] = best;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    for (int i = 0; i < n - 1; i++) {
        int a, b;
        cin >> a >> b;
        g[a].push_back(b);
        g[b].push_back(a);
    }
    dfs1(1, 0);
    cnt[1] = pool;
    used = len[1];
    dfs2(1, 0);
    for (int i = 1; i <= n; i++) cout << ansRel[i] << "\\n";
    return 0;
}`,
      explanation: [
        "The aggregate is the histogram of relative depths, and the observation that makes it linear is that the histogram of a child, shifted one slot deeper, is a prefix of the parent's histogram. So the parent can literally hand its own memory block, offset by one, to one chosen child and pay nothing for the merge - that is 'keep the heavy child' taken to its physical extreme.",
        "Heavy here means deepest, not largest, because the cost of a merge is the length of the child's array. Each light child of size-in-depth L costs L, and summing over all light children is the same as summing the lengths of all vertical path segments, which is O(n) - this is long-path decomposition, the depth-flavoured cousin of heavy-light.",
        "The argmax has to be carried, not searched. Scanning the merged array for its maximum would be O(depth) per vertex and O(n^2) on a path. Instead best starts as the heavy child's argmax shifted by one, and is re-examined only at the slots a light child actually touched, since every other slot keeps its heavy value and cannot overtake the heavy argmax. The final check cnt[u][best] == 1 collapses the all-ones case to k = 0, which is where a careless tie-break gets the smallest-index rule wrong.",
        "With n up to 10^6 a bamboo tree gives recursion depth 10^6; on judges with a small stack both dfs passes must be rewritten iteratively or the stack must be enlarged explicitly.",
        "Time: O(n). Space: O(n) - a single pool of n integers holds every histogram.",
      ],
    },
    {
      name: "Arpa's letter-marked tree and Mehrdad's Dokhtar-kosh paths",
      difficulty: "Hard",
      variation: "Path merging over xor masks",
      link: "https://codeforces.com/problemset/problem/741/D",
      question: [
        "A tree of n vertices rooted at vertex 1 is given; each vertex i >= 2 is described by its parent and by a letter from 'a' to 'v' written on the edge to that parent, so there are at most 22 distinct letters. A path is called Dokhtar-kosh if the letters on its edges can be rearranged into a palindrome. For every vertex v, print the number of edges on the longest Dokhtar-kosh path that lies entirely inside the subtree of v, or 0 if only single vertices qualify.",
        "Example 1:\nInput:\n4\n1 s\n2 a\n3 s\nOutput: 3 1 1 0\nExplanation: The tree is the path 1-2-3-4 with edge letters s, a, s. The full path 1-2-3-4 spells s,a,s which has one odd count, so it is Dokhtar-kosh with 3 edges. Inside the subtree of 2 the path 2-3-4 spells a,s with two odd counts and fails, so the best is a single edge. Vertex 4 alone has no edges.",
        "Example 2:\nInput:\n3\n1 a\n1 b\nOutput: 1 0 0\nExplanation: The path 2-1-3 spells a,b, two odd counts, so it fails. Each single edge is a valid path of length 1.",
        "Constraints:\n- 1 <= n <= 500000\n- edge letters are in 'a'..'v' (22 letters)",
      ],
      code: `const int N = 500005, M = 1 << 22, NEG = -1;
int n;
vector<pair<int,int>> g[N];        // (child, letter bit)
int dep[N], msk[N], sz[N], hv[N], ans[N];
int tin[N], tout[N], flat[N], timer_ = 0;
int f[M];                          // f[mask] = deepest loaded vertex carrying that root-xor mask

void dfs1(int u) {
    sz[u] = 1;
    hv[u] = 0;
    tin[u] = timer_;
    flat[timer_++] = u;
    for (auto& e : g[u]) {
        int v = e.first;
        dep[v] = dep[u] + 1;
        msk[v] = msk[u] ^ e.second;
        dfs1(v);
        sz[u] += sz[v];
        if (!hv[u] || sz[v] > sz[hv[u]]) hv[u] = v;
    }
    tout[u] = timer_;              // subtree of u occupies flat[tin[u] .. tout[u]-1]
}

inline void ins(int u) { f[msk[u]] = max(f[msk[u]], dep[u]); }

// Best path through the lca 'anc' that ends at u and starts at an already loaded vertex.
inline int query(int u, int anc) {
    int res = 0;
    if (f[msk[u]] >= 0) res = max(res, f[msk[u]] + dep[u] - 2 * dep[anc]);
    for (int b = 0; b < 22; b++) {                 // allow exactly one odd letter
        int m = msk[u] ^ (1 << b);
        if (f[m] >= 0) res = max(res, f[m] + dep[u] - 2 * dep[anc]);
    }
    return res;
}

void dfs2(int u, bool keep) {
    int best = 0;
    for (auto& e : g[u]) if (e.first != hv[u]) { dfs2(e.first, false); best = max(best, ans[e.first]); }
    if (hv[u]) { dfs2(hv[u], true); best = max(best, ans[hv[u]]); }
    best = max(best, query(u, u));                 // paths from u down into the heavy subtree
    ins(u);
    for (auto& e : g[u]) if (e.first != hv[u]) {
        int v = e.first;
        for (int i = tin[v]; i < tout[v]; i++) best = max(best, query(flat[i], u));
        for (int i = tin[v]; i < tout[v]; i++) ins(flat[i]);   // insert only after querying
    }
    ans[u] = best;
    if (!keep) for (int i = tin[u]; i < tout[u]; i++) f[msk[flat[i]]] = NEG;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n;
    for (int i = 2; i <= n; i++) {
        int p;
        char c;
        cin >> p >> c;
        g[p].push_back({i, 1 << (c - 'a')});
    }
    for (int i = 0; i < M; i++) f[i] = NEG;
    dfs1(1);
    dfs2(1, true);
    for (int i = 1; i <= n; i++) cout << ans[i] << " \\n"[i == n];
    return 0;
}`,
      explanation: [
        "First linearise the palindrome condition. Let msk[v] be the xor of the letter bits from the root to v. For any pair u, w the letters on the path between them have parity msk[u] ^ msk[w], and a multiset is rearrangeable into a palindrome exactly when at most one count is odd, so the path is good iff msk[u] ^ msk[w] is 0 or a single bit - 23 candidate masks to probe.",
        "Then decompose by lowest common ancestor: every path is counted once, at its lca. At vertex u the structure f[] maps a mask to the largest depth currently loaded, and a candidate path has length f[m] + dep[u'] - 2 * dep[u]. Loading the heavy subtree first, then querying each light subtree before inserting it, guarantees the two endpoints of any considered pair sit in different branches, so u really is their lca and no path is double counted or missed.",
        "Querying a light subtree and inserting it must be two separate loops. Interleaving them lets a pair of vertices from the same light child be matched here, which would report a path whose lca is inside that child - already handled by ans[child] and wrong at u because the length formula would use the wrong lca depth.",
        "Cleanup relies on the same invariant as the simpler sacks: at the moment a non-kept subtree is discarded, f[] holds exactly that subtree, so writing NEG at the mask of each of its vertices restores the empty state. f[] is 2^22 ints, about 16 MB, which is the price of making each of the 23 probes an O(1) array read instead of a hash lookup.",
        "Time: O(23 * n log n). Space: O(2^22 + n).",
      ],
    },
  ],
};
