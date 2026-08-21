import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Course Schedule",
      difficulty: "Medium",
      variation: "Kahn's algorithm, cycle detection",
      link: "https://leetcode.com/problems/course-schedule/",
      question: [
        "There are numCourses courses labelled 0 to numCourses-1. prerequisites[i] = [a, b] means you must take course b before course a. Return true if you can finish all the courses.",
        "Example 1:\nInput: numCourses = 2, prerequisites = [[1,0]]\nOutput: true\nExplanation: Take course 0 then course 1.",
        "Example 2:\nInput: numCourses = 2, prerequisites = [[1,0],[0,1]]\nOutput: false\nExplanation: The two courses depend on each other, so neither can be taken first.",
        "Constraints:\n- 1 <= numCourses <= 2000\n- 0 <= prerequisites.length <= 5000\n- prerequisites[i].length == 2 and all pairs are distinct",
      ],
      code: `bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
    vector<vector<int>> adj(numCourses);
    vector<int> indeg(numCourses, 0);
    for (auto& p : prerequisites) {
        adj[p[1]].push_back(p[0]);
        indeg[p[0]]++;
    }
    queue<int> q;
    for (int i = 0; i < numCourses; i++) {
        if (indeg[i] == 0) q.push(i);
    }
    int taken = 0;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        taken++;
        for (int v : adj[u]) {
            if (--indeg[v] == 0) q.push(v);
        }
    }
    return taken == numCourses;
}`,
      explanation: [
        "Build the dependency digraph with an edge from prerequisite to course and count each node's in-degree - the number of prerequisites it still needs. Every node with in-degree 0 is immediately takeable.",
        "Kahn's argument: removing a takeable node and decrementing its successors' in-degrees can only ever unlock more nodes. If the queue drains before all nodes are emitted, the remaining nodes all still have unmet prerequisites, which is only possible inside a directed cycle - so the count test is exactly a cycle test.",
        "Time: O(V + E). Space: O(V + E).",
      ],
    },
    {
      name: "Course Schedule II",
      difficulty: "Medium",
      variation: "Kahn's algorithm, emit the order",
      link: "https://leetcode.com/problems/course-schedule-ii/",
      question: [
        "There are numCourses courses labelled 0 to numCourses-1 and prerequisites[i] = [a, b] means you must take b before a. Return any ordering of courses you should take to finish them all. If it is impossible, return an empty array.",
        "Example 1:\nInput: numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]\nOutput: [0,1,2,3]\nExplanation: [0,2,1,3] is also valid.",
        "Example 2:\nInput: numCourses = 2, prerequisites = [[0,1],[1,0]]\nOutput: []",
        "Constraints:\n- 1 <= numCourses <= 2000\n- 0 <= prerequisites.length <= numCourses * (numCourses - 1)\n- All prerequisite pairs are distinct",
      ],
      code: `vector<int> findOrder(int numCourses, vector<vector<int>>& prerequisites) {
    vector<vector<int>> adj(numCourses);
    vector<int> indeg(numCourses, 0);
    for (auto& p : prerequisites) {
        adj[p[1]].push_back(p[0]);
        indeg[p[0]]++;
    }
    queue<int> q;
    for (int i = 0; i < numCourses; i++) {
        if (indeg[i] == 0) q.push(i);
    }
    vector<int> order;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        order.push_back(u);
        for (int v : adj[u]) {
            if (--indeg[v] == 0) q.push(v);
        }
    }
    if ((int)order.size() != (int)numCourses) return {};
    return order;
}`,
      explanation: [
        "Identical to Course Schedule except the popped nodes are recorded. The emitted sequence is a topological order: a node is only popped once every predecessor has already been popped, so no edge ever points backwards in the output.",
        "A short order means some nodes were never freed, i.e. the graph has a cycle, and the problem asks for an empty array in that case.",
        "Replacing the queue with a min-heap yields the lexicographically smallest valid order at an extra O(log V) per pop. Time: O(V + E). Space: O(V + E).",
      ],
    },
    {
      name: "Detect Cycle in a Directed Graph",
      difficulty: "Medium",
      variation: "Kahn's in-degree count as a cycle test",
      link: "https://www.geeksforgeeks.org/detect-cycle-in-a-directed-graph/",
      question: [
        "Given a directed graph with V vertices labelled 0 to V-1, represented as an adjacency list adj where adj[i] holds the vertices reachable from i by one edge, return true if the graph contains a cycle and false otherwise.",
        "Example 1:\nInput: V = 4, adj = [[1],[2],[3],[3]]\nOutput: true\nExplanation: Vertex 3 has a self-loop, which is a cycle.",
        "Example 2:\nInput: V = 3, adj = [[1],[2],[]]\nOutput: false",
        "Constraints:\n- 1 <= V <= 10^5\n- 0 <= number of edges <= 10^5",
      ],
      code: `bool isCyclic(int V, vector<vector<int>>& adj) {
    vector<int> indeg(V, 0);
    for (int u = 0; u < V; u++) {
        for (int v : adj[u]) indeg[v]++;
    }
    queue<int> q;
    for (int i = 0; i < V; i++) {
        if (indeg[i] == 0) q.push(i);
    }
    int processed = 0;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        processed++;
        for (int v : adj[u]) {
            if (--indeg[v] == 0) q.push(v);
        }
    }
    return processed != V;
}`,
      explanation: [
        "A directed graph has a topological order if and only if it is acyclic, so running Kahn's algorithm and checking whether every vertex was emitted decides acyclicity.",
        "Vertices inside a cycle can never reach in-degree 0: each one has a predecessor that is itself never emitted, so the decrements never arrive. That is why processed < V is precisely the cycle condition, and a self-loop is caught as a length-1 cycle.",
        "The alternative is a DFS with white/grey/black colours, detecting an edge into a grey (on-stack) vertex. Time: O(V + E). Space: O(V).",
      ],
    },
    {
      name: "Course Schedule (CSES 1679)",
      difficulty: "Medium",
      variation: "Kahn's algorithm with IMPOSSIBLE output",
      link: "https://cses.fi/problemset/task/1679",
      question: [
        "You have to complete n courses. There are m requirements of the form \"course a has to be completed before course b\". Your task is to find an order in which you can complete the courses, or report that it cannot be done. Print n integers giving a valid order, or IMPOSSIBLE if no order exists.",
        "Example 1:\nInput:\n5 3\n1 2\n3 1\n4 5\nOutput:\n3 4 1 5 2\nExplanation: Any order respecting all three requirements is accepted.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= m <= 2 * 10^5\n- 1 <= a, b <= n",
      ],
      code: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<vector<int>> adj(n + 1);
    vector<int> indeg(n + 1, 0);
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        adj[a].push_back(b);
        indeg[b]++;
    }
    queue<int> q;
    for (int i = 1; i <= n; i++) {
        if (indeg[i] == 0) q.push(i);
    }
    vector<int> order;
    order.reserve(n);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        order.push_back(u);
        for (int v : adj[u]) {
            if (--indeg[v] == 0) q.push(v);
        }
    }
    if ((int)order.size() != n) {
        cout << "IMPOSSIBLE" << endl;
        return 0;
    }
    for (int i = 0; i < n; i++) {
        cout << order[i];
        if (i + 1 < n) cout << ' ';
    }
    cout << endl;
    return 0;
}`,
      explanation: [
        "The competitive-programming form of Course Schedule II: read the edges, run Kahn's algorithm from all in-degree-0 vertices and print the emitted order.",
        "Vertices are 1-indexed, so the arrays are sized n + 1 and the seeding loop starts at 1. If fewer than n vertices are emitted the requirements contain a cycle and IMPOSSIBLE is printed.",
        "Fast I/O matters at m = 2 * 10^5. Time: O(n + m). Space: O(n + m).",
      ],
    },
    {
      name: "Build Order",
      difficulty: "Medium",
      variation: "Kahn's algorithm over named nodes",
      question: [
        "You are given a list of project names and a list of dependency pairs (first, second) meaning project first must be built before project second. Return a build order that satisfies every dependency, or an empty list if no such order exists.",
        "Example 1:\nInput: projects = [\"a\",\"b\",\"c\",\"d\",\"e\",\"f\"], deps = [(\"a\",\"d\"),(\"f\",\"b\"),(\"b\",\"d\"),(\"f\",\"a\"),(\"d\",\"c\")]\nOutput: [\"e\",\"f\",\"b\",\"a\",\"d\",\"c\"]\nExplanation: Every dependency points earlier in the returned list; other valid orders exist.",
        "Example 2:\nInput: projects = [\"a\",\"b\"], deps = [(\"a\",\"b\"),(\"b\",\"a\")]\nOutput: []",
        "Constraints:\n- 1 <= projects.length <= 10^5\n- 0 <= deps.length <= 2 * 10^5\n- Project names are unique and every dependency names existing projects",
      ],
      code: `vector<string> buildOrder(vector<string>& projects,
                          vector<pair<string, string>>& deps) {
    int n = projects.size();
    unordered_map<string, int> id;
    for (int i = 0; i < n; i++) id[projects[i]] = i;
    vector<vector<int>> adj(n);
    vector<int> indeg(n, 0);
    for (auto& d : deps) {
        int u = id[d.first], v = id[d.second];
        adj[u].push_back(v);
        indeg[v]++;
    }
    queue<int> q;
    for (int i = 0; i < n; i++) {
        if (indeg[i] == 0) q.push(i);
    }
    vector<string> order;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        order.push_back(projects[u]);
        for (int v : adj[u]) {
            if (--indeg[v] == 0) q.push(v);
        }
    }
    if ((int)order.size() != n) return {};
    return order;
}`,
      explanation: [
        "Real dependency graphs arrive with string labels, so the first step is interning each name to a dense integer index; everything after that is the standard in-degree sweep.",
        "Projects with no dependencies at all start in the queue and appear early in the output, which is correct - a topological order only constrains pairs joined by an edge.",
        "An empty result signals a dependency cycle, since a cyclic node never reaches in-degree 0. Time: O(V + E) expected, with hashing for the name lookup. Space: O(V + E).",
      ],
    },
    {
      name: "Find Eventual Safe States",
      difficulty: "Medium",
      variation: "Kahn's algorithm on the reversed graph",
      link: "https://leetcode.com/problems/find-eventual-safe-states/",
      question: [
        "There is a directed graph of n nodes where graph[i] is the list of nodes reachable from node i. A node is terminal if it has no outgoing edges, and a node is safe if every possible path starting from it leads to a terminal node. Return an array of all safe nodes in ascending order.",
        "Example 1:\nInput: graph = [[1,2],[2,3],[5],[0],[5],[],[]]\nOutput: [2,4,5,6]",
        "Example 2:\nInput: graph = [[1,2,3,4],[1,2],[3,4],[0,4],[]]\nOutput: [4]",
        "Constraints:\n- n == graph.length\n- 1 <= n <= 10^4\n- 0 <= graph[i].length <= n and the graph may contain self-loops",
      ],
      code: `vector<int> eventualSafeNodes(vector<vector<int>>& graph) {
    int n = graph.size();
    vector<vector<int>> rev(n);
    vector<int> outdeg(n, 0);
    for (int u = 0; u < n; u++) {
        outdeg[u] = graph[u].size();
        for (int v : graph[u]) rev[v].push_back(u);
    }
    queue<int> q;
    for (int i = 0; i < n; i++) {
        if (outdeg[i] == 0) q.push(i);
    }
    vector<char> safe(n, 0);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        safe[u] = 1;
        for (int p : rev[u]) {
            if (--outdeg[p] == 0) q.push(p);
        }
    }
    vector<int> res;
    for (int i = 0; i < n; i++) {
        if (safe[i]) res.push_back(i);
    }
    return res;
}`,
      explanation: [
        "Reverse the roles: a node is safe when all of its successors are safe, and terminal nodes are the base case. That is Kahn's algorithm run on out-degrees instead of in-degrees, with edges reversed so a node can notify its predecessors when it becomes safe.",
        "A node whose out-degree never reaches zero has at least one successor that is never marked safe, which means it can reach a cycle - exactly the unsafe condition.",
        "Scanning indices at the end gives the required ascending order for free. Time: O(V + E). Space: O(V + E).",
      ],
    },
    {
      name: "Loud and Rich",
      difficulty: "Medium",
      variation: "DFS memoisation over a DAG order",
      link: "https://leetcode.com/problems/loud-and-rich/",
      question: [
        "There are n people labelled 0 to n-1. richer[i] = [a, b] means person a has more money than person b, and quiet[i] is the quietness of person i. All the given data is logically consistent. Return an array answer where answer[x] is the label of the least quiet person among all people who have at least as much money as person x (including x).",
        "Example 1:\nInput: richer = [[1,0],[2,1],[2,5],[3,0],[3,5],[4,3],[5,3],[6,3]], quiet = [3,2,5,4,6,1,7,0]\nOutput: [5,5,2,5,4,5,6,7]",
        "Example 2:\nInput: richer = [], quiet = [0]\nOutput: [0]",
        "Constraints:\n- n == quiet.length and 1 <= n <= 500\n- 0 <= quiet[i] < n and all values of quiet are unique\n- All pairs in richer are logically consistent (the richer relation forms a DAG)",
      ],
      code: `int quietest(int u, vector<vector<int>>& richerThan, vector<int>& quiet,
             vector<int>& memo) {
    if (memo[u] != -1) return memo[u];
    memo[u] = u;
    for (int v : richerThan[u]) {
        int cand = quietest(v, richerThan, quiet, memo);
        if (quiet[cand] < quiet[memo[u]]) memo[u] = cand;
    }
    return memo[u];
}

vector<int> loudAndRich(vector<vector<int>>& richer, vector<int>& quiet) {
    int n = quiet.size();
    vector<vector<int>> richerThan(n);
    for (auto& r : richer) {
        richerThan[r[1]].push_back(r[0]);
    }
    vector<int> memo(n, -1), res(n);
    for (int i = 0; i < n; i++) {
        res[i] = quietest(i, richerThan, quiet, memo);
    }
    return res;
}`,
      explanation: [
        "Edges are stored from the poorer person to the richer one, so the set of people at least as rich as x is exactly the set reachable from x. The answer for x is then the minimum-quiet node over that reachable set.",
        "Consistency of the data means the relation is a DAG, which makes memoisation sound: the answer for a node depends only on strictly richer nodes, so once computed it can never improve and each node is expanded once.",
        "Seeding memo[u] with u itself handles the include-x clause and gives the base case for people nobody is richer than. Time: O(V + E). Space: O(V + E).",
      ],
    },
    {
      name: "Minimum Height Trees",
      difficulty: "Medium",
      variation: "Layered leaf peeling (topological trimming)",
      link: "https://leetcode.com/problems/minimum-height-trees/",
      question: [
        "A tree is an undirected graph with n nodes labelled 0 to n-1 and n-1 edges. When rooted at node x, the height is the number of edges on the longest downward path. Given n and the edges, return the list of all root labels that give a minimum height tree, in any order.",
        "Example 1:\nInput: n = 4, edges = [[1,0],[1,2],[1,3]]\nOutput: [1]",
        "Example 2:\nInput: n = 6, edges = [[3,0],[3,1],[3,2],[3,4],[5,4]]\nOutput: [3,4]",
        "Constraints:\n- 1 <= n <= 2 * 10^4\n- edges.length == n - 1 and the input is a valid tree",
      ],
      code: `vector<int> findMinHeightTrees(int n, vector<vector<int>>& edges) {
    if (n == 1) return {0};
    vector<vector<int>> adj(n);
    vector<int> deg(n, 0);
    for (auto& e : edges) {
        adj[e[0]].push_back(e[1]);
        adj[e[1]].push_back(e[0]);
        deg[e[0]]++;
        deg[e[1]]++;
    }
    queue<int> q;
    for (int i = 0; i < n; i++) {
        if (deg[i] == 1) q.push(i);
    }
    int remaining = n;
    while (remaining > 2) {
        int sz = q.size();
        remaining -= sz;
        for (int i = 0; i < sz; i++) {
            int u = q.front(); q.pop();
            for (int v : adj[u]) {
                if (--deg[v] == 1) q.push(v);
            }
        }
    }
    vector<int> res;
    while (!q.empty()) {
        res.push_back(q.front());
        q.pop();
    }
    return res;
}`,
      explanation: [
        "The best roots are the centroids of the tree, the midpoints of its longest path. Peel all current leaves layer by layer - the same degree-driven sweep as Kahn's algorithm, using degree 1 instead of in-degree 0 because the graph is undirected.",
        "Each peel shortens every remaining longest path by one at both ends, so the last one or two surviving nodes are exactly the centres. A tree has at most two centroids, which is why the loop stops at remaining <= 2.",
        "The n == 1 case is special-cased because that single node has degree 0 and would never enter the queue. Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Sequence Reconstruction",
      difficulty: "Medium",
      variation: "Uniqueness of the topological order",
      question: [
        "You are given an integer array nums of length n which is a permutation of the integers 1 to n, and a list of integer arrays sequences where each sequences[i] is a subsequence of nums. Return true if nums is the only shortest supersequence of all the given sequences - that is, if the sequences force exactly one valid ordering and that ordering is nums.",
        "Example 1:\nInput: nums = [1,2,3], sequences = [[1,2],[1,3]]\nOutput: false\nExplanation: [1,3,2] is also consistent with both sequences, so the order is not unique.",
        "Example 2:\nInput: nums = [1,2,3], sequences = [[1,2],[1,3],[2,3]]\nOutput: true",
        "Constraints:\n- n == nums.length and 1 <= n <= 10^4\n- 1 <= sequences.length <= 10^4\n- The total number of integers across all sequences is at most 10^5",
      ],
      code: `bool sequenceReconstruction(vector<int>& nums, vector<vector<int>>& sequences) {
    int n = nums.size();
    vector<vector<int>> adj(n + 1);
    vector<int> indeg(n + 1, 0);
    for (auto& s : sequences) {
        for (int i = 0; i < (int)s.size(); i++) {
            if (s[i] < 1 || s[i] > n) return false;
            if (i + 1 < (int)s.size()) {
                adj[s[i]].push_back(s[i + 1]);
                indeg[s[i + 1]]++;
            }
        }
    }
    queue<int> q;
    for (int i = 1; i <= n; i++) {
        if (indeg[i] == 0) q.push(i);
    }
    int idx = 0;
    while (!q.empty()) {
        if (q.size() > 1) return false;
        int u = q.front(); q.pop();
        if (idx >= n || nums[idx] != u) return false;
        idx++;
        for (int v : adj[u]) {
            if (--indeg[v] == 0) q.push(v);
        }
    }
    return idx == n;
}`,
      explanation: [
        "Each consecutive pair inside a sequence is a precedence edge. The order forced by all the sequences is unique exactly when Kahn's queue never holds two nodes at the same time - two simultaneously free nodes could be emitted in either order, giving a second valid supersequence.",
        "Checking the emitted node against nums[idx] at every step verifies that the unique order is nums itself, and the final idx == n guard rejects cycles and missing numbers.",
        "Duplicate edges inflate in-degrees symmetrically, so the counts still reach zero correctly. Time: O(n + total sequence length). Space: O(n + edges).",
      ],
    },
    {
      name: "Course Schedule IV",
      difficulty: "Medium",
      variation: "Kahn's algorithm propagating reachability sets",
      link: "https://leetcode.com/problems/course-schedule-iv/",
      question: [
        "There are numCourses courses labelled 0 to numCourses-1 and prerequisites[i] = [a, b] means course a must be taken before course b. Prerequisites are transitive. Given queries where queries[j] = [u, v], return a boolean array whose j-th entry is true if course u is a prerequisite (direct or indirect) of course v.",
        "Example 1:\nInput: numCourses = 3, prerequisites = [[1,2],[1,0],[2,0]], queries = [[1,0],[1,2]]\nOutput: [true,true]",
        "Example 2:\nInput: numCourses = 2, prerequisites = [], queries = [[1,0],[0,1]]\nOutput: [false,false]",
        "Constraints:\n- 2 <= numCourses <= 100\n- 0 <= prerequisites.length <= numCourses * (numCourses - 1) / 2\n- The prerequisites graph has no cycles\n- 1 <= queries.length <= 10^4",
      ],
      code: `vector<bool> checkIfPrerequisite(int numCourses, vector<vector<int>>& prerequisites,
                                 vector<vector<int>>& queries) {
    int n = numCourses;
    vector<vector<int>> adj(n);
    vector<int> indeg(n, 0);
    for (auto& p : prerequisites) {
        adj[p[0]].push_back(p[1]);
        indeg[p[1]]++;
    }
    vector<vector<char>> reach(n, vector<char>(n, 0));
    queue<int> q;
    for (int i = 0; i < n; i++) {
        if (indeg[i] == 0) q.push(i);
    }
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u]) {
            reach[u][v] = 1;
            for (int k = 0; k < n; k++) {
                if (reach[k][u]) reach[k][v] = 1;
            }
            if (--indeg[v] == 0) q.push(v);
        }
    }
    vector<bool> res;
    res.reserve(queries.size());
    for (auto& qr : queries) {
        res.push_back(reach[qr[0]][qr[1]] == 1);
    }
    return res;
}`,
      explanation: [
        "Queries ask for transitive reachability, so precompute the full reachability matrix once and answer each query in O(1).",
        "Processing nodes in topological order is what makes a single pass sufficient: when u is popped, every ancestor of u has already been popped, so the column reach[*][u] is final and can be copied straight onto each successor v along with the direct edge.",
        "Time: O(V * E + Q) for the propagation and queries. Space: O(V^2), which is fine at V <= 100.",
      ],
    },
    {
      name: "Parallel Courses",
      difficulty: "Medium",
      variation: "Kahn's algorithm by layers (longest chain)",
      question: [
        "You are given an integer n of courses labelled 1 to n and an array relations where relations[i] = [prev, next] means course prev must be taken before course next. In one semester you may take any number of courses as long as all of their prerequisites were taken in earlier semesters. Return the minimum number of semesters needed to take all courses, or -1 if it is impossible.",
        "Example 1:\nInput: n = 3, relations = [[1,3],[2,3]]\nOutput: 2\nExplanation: Take courses 1 and 2 in semester 1, then course 3.",
        "Example 2:\nInput: n = 3, relations = [[1,2],[2,3],[3,1]]\nOutput: -1",
        "Constraints:\n- 1 <= n <= 5000\n- 1 <= relations.length <= 5000\n- All relation pairs are distinct",
      ],
      code: `int minimumSemesters(int n, vector<vector<int>>& relations) {
    vector<vector<int>> adj(n + 1);
    vector<int> indeg(n + 1, 0);
    for (auto& r : relations) {
        adj[r[0]].push_back(r[1]);
        indeg[r[1]]++;
    }
    queue<int> q;
    for (int i = 1; i <= n; i++) {
        if (indeg[i] == 0) q.push(i);
    }
    int studied = 0, semesters = 0;
    while (!q.empty()) {
        int sz = q.size();
        semesters++;
        for (int i = 0; i < sz; i++) {
            int u = q.front(); q.pop();
            studied++;
            for (int v : adj[u]) {
                if (--indeg[v] == 0) q.push(v);
            }
        }
    }
    return studied == n ? semesters : -1;
}`,
      explanation: [
        "Because a semester has unlimited capacity, the optimal schedule takes every currently free course at once. Draining the Kahn queue one full layer at a time models exactly that, so the number of layers is the answer.",
        "That layer count equals the length of the longest chain of prerequisites, which is a lower bound no schedule can beat - hence the greedy layering is optimal.",
        "If fewer than n courses are emitted the relations contain a cycle. Time: O(V + E). Space: O(V + E).",
      ],
    },
    {
      name: "Longest Path in a DAG",
      difficulty: "Medium",
      variation: "Topological-order DP on weighted edges",
      question: [
        "You are given a weighted directed acyclic graph with n nodes labelled 0 to n-1, given as an adjacency list where adj[u] holds pairs (v, w) for an edge u to v of weight w, and a source node src. Return an array dist where dist[i] is the maximum total weight of any path from src to i, or the sentinel value for nodes unreachable from src.",
        "Example 1:\nInput: n = 5, adj = [[(1,2),(2,3)],[(3,4)],[(3,1)],[(4,2)],[]], src = 0\nOutput: [0, 2, 3, 6, 8]\nExplanation: The heaviest route to node 4 is 0 -> 1 -> 3 -> 4 with weight 2 + 4 + 2 = 8.",
        "Constraints:\n- 1 <= n <= 10^5\n- 0 <= number of edges <= 2 * 10^5\n- The graph is acyclic and edge weights fit in a 32-bit integer",
      ],
      code: `vector<long long> longestPaths(int n, vector<vector<pair<int, int>>>& adj, int src) {
    const long long NEG = LLONG_MIN / 4;
    vector<int> indeg(n, 0);
    for (int u = 0; u < n; u++) {
        for (auto& e : adj[u]) indeg[e.first]++;
    }
    queue<int> q;
    for (int i = 0; i < n; i++) {
        if (indeg[i] == 0) q.push(i);
    }
    vector<long long> dist(n, NEG);
    dist[src] = 0;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (auto& e : adj[u]) {
            int v = e.first;
            long long w = e.second;
            if (dist[u] != NEG && dist[u] + w > dist[v]) {
                dist[v] = dist[u] + w;
            }
            if (--indeg[v] == 0) q.push(v);
        }
    }
    return dist;
}`,
      explanation: [
        "Longest path is NP-hard in general graphs but linear on a DAG, because a topological order lets each node be finalised before any of its successors is relaxed.",
        "When u is popped, every predecessor of u has already relaxed it, so dist[u] is final and can be pushed forward. Taking a maximum instead of a minimum is the only change from the shortest-path version - no Dijkstra-style priority queue is needed even with negative weights.",
        "Unreachable nodes keep the NEG sentinel, and the dist[u] != NEG guard stops the sentinel from propagating as a real distance. Time: O(V + E). Space: O(V + E).",
      ],
    },
    {
      name: "Alien Dictionary",
      difficulty: "Hard",
      variation: "Kahn's algorithm on inferred letter edges",
      question: [
        "There is a new alien language that uses the English alphabet with an unknown order of letters. You are given a list of words from the alien dictionary, sorted lexicographically by that unknown order. Return a string of the unique letters sorted in the alien order. If the ordering is invalid, return the empty string; if there are multiple valid orders, return any of them.",
        "Example 1:\nInput: words = [\"wrt\",\"wrf\",\"er\",\"ett\",\"rftt\"]\nOutput: \"wertf\"",
        "Example 2:\nInput: words = [\"abc\",\"ab\"]\nOutput: \"\"\nExplanation: A prefix must sort before the longer word, so this input is invalid.",
        "Constraints:\n- 1 <= words.length <= 100\n- 1 <= words[i].length <= 100\n- words[i] consists of lowercase English letters",
      ],
      code: `string alienOrder(vector<string>& words) {
    vector<vector<int>> adj(26);
    vector<int> indeg(26, 0);
    vector<bool> present(26, false);
    vector<vector<bool>> edge(26, vector<bool>(26, false));
    for (const string& w : words) {
        for (char c : w) present[c - 'a'] = true;
    }
    for (int i = 0; i + 1 < (int)words.size(); i++) {
        const string& a = words[i];
        const string& b = words[i + 1];
        int len = (int)min(a.size(), b.size());
        int j = 0;
        while (j < len && a[j] == b[j]) j++;
        if (j == len) {
            if (a.size() > b.size()) return "";
            continue;
        }
        int u = a[j] - 'a', v = b[j] - 'a';
        if (!edge[u][v]) {
            edge[u][v] = true;
            adj[u].push_back(v);
            indeg[v]++;
        }
    }
    queue<int> q;
    int total = 0;
    for (int i = 0; i < 26; i++) {
        if (!present[i]) continue;
        total++;
        if (indeg[i] == 0) q.push(i);
    }
    string order;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        order.push_back((char)('a' + u));
        for (int v : adj[u]) {
            if (--indeg[v] == 0) q.push(v);
        }
    }
    return (int)order.size() == total ? order : "";
}`,
      explanation: [
        "Each adjacent pair of words yields exactly one ordering fact: the first position where they differ tells you that a[j] comes before b[j]. Later positions carry no information, so the comparison stops there.",
        "Two failure modes must both be handled - a longer word placed before its own prefix is inconsistent regardless of the alphabet, and a cycle among the inferred edges leaves some letters unemitted, which the order.size() == total check catches.",
        "Deduplicating edges keeps in-degrees accurate when the same fact is implied twice. Time: O(total input length + 26^2). Space: O(26^2).",
      ],
    },
    {
      name: "Parallel Courses III",
      difficulty: "Hard",
      variation: "Topological DP on completion times",
      link: "https://leetcode.com/problems/parallel-courses-iii/",
      question: [
        "You are given an integer n of courses labelled 1 to n, an array relations where relations[i] = [prev, next] means prev must be completed before next starts, and an array time where time[i-1] is the number of months to complete course i. Courses may run in parallel and a course starts as soon as all of its prerequisites are complete. Return the minimum number of months needed to complete all courses.",
        "Example 1:\nInput: n = 3, relations = [[1,3],[2,3]], time = [3,2,5]\nOutput: 8\nExplanation: Courses 1 and 2 start at month 0 and finish at 3 and 2; course 3 starts at month 3 and finishes at month 8.",
        "Example 2:\nInput: n = 5, relations = [[1,5],[2,5],[3,5],[3,4],[4,5]], time = [1,2,3,4,5]\nOutput: 12",
        "Constraints:\n- 1 <= n <= 5 * 10^4\n- 0 <= relations.length <= min(n * (n - 1) / 2, 5 * 10^4)\n- 1 <= time[i] <= 10^4\n- The given graph is a DAG",
      ],
      code: `int minimumTime(int n, vector<vector<int>>& relations, vector<int>& time) {
    vector<vector<int>> adj(n + 1);
    vector<int> indeg(n + 1, 0);
    for (auto& r : relations) {
        adj[r[0]].push_back(r[1]);
        indeg[r[1]]++;
    }
    vector<int> finish(n + 1, 0);
    queue<int> q;
    for (int i = 1; i <= n; i++) {
        if (indeg[i] == 0) {
            finish[i] = time[i - 1];
            q.push(i);
        }
    }
    int ans = 0;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        ans = max(ans, finish[u]);
        for (int v : adj[u]) {
            finish[v] = max(finish[v], finish[u] + time[v - 1]);
            if (--indeg[v] == 0) q.push(v);
        }
    }
    return ans;
}`,
      explanation: [
        "With durations attached this becomes a critical-path computation: a course starts at the latest finish time among its prerequisites, so finish[v] is the maximum over predecessors of finish[u] plus time[v].",
        "Kahn's order guarantees finish[u] is complete when u is popped, because every predecessor has already contributed its relaxation. That is why one linear pass is enough and no re-relaxation is required.",
        "The answer is the largest finish time overall - the length of the critical path. Time: O(V + E). Space: O(V + E).",
      ],
    },
    {
      name: "Largest Color Value in a Directed Graph",
      difficulty: "Hard",
      variation: "Topological DP with a 26-wide state",
      link: "https://leetcode.com/problems/largest-color-value-in-a-directed-graph/",
      question: [
        "You are given a directed graph of n nodes labelled 0 to n-1, where colors[i] is a lowercase letter giving the colour of node i, and edges[j] = [a, b] is a directed edge from a to b. The value of a path is the largest number of nodes sharing the same colour along it. Return the largest value of any valid path, or -1 if the graph contains a cycle.",
        "Example 1:\nInput: colors = \"abaca\", edges = [[0,1],[0,2],[2,3],[3,4]]\nOutput: 3\nExplanation: The path 0 -> 2 -> 3 -> 4 contains three nodes coloured 'a'.",
        "Example 2:\nInput: colors = \"a\", edges = [[0,0]]\nOutput: -1\nExplanation: The self-loop is a cycle.",
        "Constraints:\n- n == colors.length and 1 <= n <= 10^5\n- 0 <= edges.length <= 10^5\n- colors consists of lowercase English letters",
      ],
      code: `int largestPathValue(string colors, vector<vector<int>>& edges) {
    int n = colors.size();
    vector<vector<int>> adj(n);
    vector<int> indeg(n, 0);
    for (auto& e : edges) {
        adj[e[0]].push_back(e[1]);
        indeg[e[1]]++;
    }
    vector<vector<int>> dp(n, vector<int>(26, 0));
    queue<int> q;
    for (int i = 0; i < n; i++) {
        if (indeg[i] == 0) q.push(i);
    }
    int seen = 0, ans = 0;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        seen++;
        dp[u][colors[u] - 'a']++;
        for (int c = 0; c < 26; c++) {
            ans = max(ans, dp[u][c]);
        }
        for (int v : adj[u]) {
            for (int c = 0; c < 26; c++) {
                dp[v][c] = max(dp[v][c], dp[u][c]);
            }
            if (--indeg[v] == 0) q.push(v);
        }
    }
    return seen == n ? ans : -1;
}`,
      explanation: [
        "dp[u][c] holds the maximum count of colour c over all paths that end at u. When u is popped every predecessor has already pushed its vector into u, so taking the elementwise maximum and then incrementing u's own colour completes the state.",
        "The topological order is what makes the elementwise maximum valid - a later predecessor could otherwise raise a count after u was already used, and the propagation would be wrong.",
        "If the queue drains before all n nodes are emitted the graph has a cycle, so no valid path value exists and -1 is returned. Time: O(26 * (V + E)). Space: O(26 * V).",
      ],
    },
    {
      name: "Longest Flight Route (CSES 1680)",
      difficulty: "Hard",
      variation: "Topological DP with path reconstruction",
      link: "https://cses.fi/problemset/task/1680",
      question: [
        "Uolevi has won a contest and the prize is a free trip that can consist of one or more flights through cities. There are n cities and m flights, and he wants to travel from city 1 to city n visiting as many cities as possible. Print the maximum number of cities on such a route and then the route itself, or IMPOSSIBLE if there is no route from city 1 to city n.",
        "Example 1:\nInput:\n5 5\n1 2\n1 3\n2 5\n3 4\n4 5\nOutput:\n4\n1 3 4 5",
        "Constraints:\n- 2 <= n <= 10^5\n- 1 <= m <= 2 * 10^5\n- The flight network is a DAG with one-way flights",
      ],
      code: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<vector<int>> adj(n + 1);
    vector<int> indeg(n + 1, 0);
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        adj[a].push_back(b);
        indeg[b]++;
    }
    const int NEG = INT_MIN / 4;
    vector<int> dp(n + 1, NEG), from(n + 1, 0);
    dp[1] = 1;
    queue<int> q;
    for (int i = 1; i <= n; i++) {
        if (indeg[i] == 0) q.push(i);
    }
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u]) {
            if (dp[u] != NEG && dp[u] + 1 > dp[v]) {
                dp[v] = dp[u] + 1;
                from[v] = u;
            }
            if (--indeg[v] == 0) q.push(v);
        }
    }
    if (dp[n] == NEG) {
        cout << "IMPOSSIBLE" << endl;
        return 0;
    }
    vector<int> path;
    for (int cur = n; cur != 0; cur = from[cur]) path.push_back(cur);
    reverse(path.begin(), path.end());
    cout << (int)path.size() << endl;
    for (int i = 0; i < (int)path.size(); i++) {
        cout << path[i];
        if (i + 1 < (int)path.size()) cout << ' ';
    }
    cout << endl;
    return 0;
}`,
      explanation: [
        "Maximising the number of visited cities is a longest-path DP on a DAG with unit vertex weights: dp[v] is the most cities on any route from city 1 to v, computed in topological order so every predecessor is final before v is used.",
        "Recording from[v] whenever dp[v] improves stores the predecessor on the best route, so the actual itinerary is recovered by walking backwards from n and reversing. from[1] stays 0, which terminates the walk.",
        "Cities not reachable from 1 keep the NEG sentinel and the guard prevents it from spreading, so dp[n] == NEG means IMPOSSIBLE. Time: O(n + m). Space: O(n + m).",
      ],
    },
    {
      name: "All Topological Sorts of a DAG",
      difficulty: "Hard",
      variation: "Backtracking over in-degree-0 choices",
      link: "https://www.geeksforgeeks.org/all-topological-sorts-of-a-directed-acyclic-graph/",
      question: [
        "Given a directed acyclic graph with n vertices labelled 0 to n-1 as an adjacency list, enumerate every valid topological ordering of the vertices and return them as a list of orderings.",
        "Example 1:\nInput: n = 4, adj = [[1,2],[3],[3],[]]\nOutput: [[0,1,2,3],[0,2,1,3]]\nExplanation: Vertices 1 and 2 are independent, so they may be emitted in either order.",
        "Example 2:\nInput: n = 2, adj = [[],[]]\nOutput: [[0,1],[1,0]]",
        "Constraints:\n- 1 <= n <= 12 (the number of orderings can be factorial in n)\n- The graph is acyclic",
      ],
      code: `void enumerate(int n, vector<vector<int>>& adj, vector<int>& indeg,
               vector<bool>& used, vector<int>& path,
               vector<vector<int>>& out) {
    if ((int)path.size() == n) {
        out.push_back(path);
        return;
    }
    for (int u = 0; u < n; u++) {
        if (used[u] || indeg[u] != 0) continue;
        used[u] = true;
        path.push_back(u);
        for (int v : adj[u]) indeg[v]--;
        enumerate(n, adj, indeg, used, path, out);
        for (int v : adj[u]) indeg[v]++;
        path.pop_back();
        used[u] = false;
    }
}

vector<vector<int>> allTopologicalSorts(int n, vector<vector<int>>& adj) {
    vector<int> indeg(n, 0);
    for (int u = 0; u < n; u++) {
        for (int v : adj[u]) indeg[v]++;
    }
    vector<bool> used(n, false);
    vector<int> path;
    vector<vector<int>> out;
    enumerate(n, adj, indeg, used, path, out);
    return out;
}`,
      explanation: [
        "Kahn's algorithm commits to one arbitrary in-degree-0 vertex at each step; enumerating all orders means trying every such vertex instead, which turns the sweep into a backtracking search.",
        "Choosing u decrements its successors' in-degrees exactly as Kahn's would, and undoing those decrements on the way back out restores the state so the next candidate at this level sees the correct graph. The used flag stops a vertex already on the path from being picked again.",
        "The output can be factorial in size, so this only applies to small graphs. Time: O(n! * n) worst case. Space: O(n) per branch plus the output.",
      ],
    },
    {
      name: "Sort Items by Groups Respecting Dependencies",
      difficulty: "Hard",
      variation: "Two-level topological sort (groups and items)",
      link: "https://leetcode.com/problems/sort-items-by-groups-respecting-dependencies/",
      question: [
        "There are n items labelled 0 to n-1 divided into m groups. group[i] is the group of item i or -1 if it belongs to no group, and beforeItems[i] lists items that must come before item i. Return a sorted list of the items such that all dependencies are respected and items in the same group are contiguous in the result. If no such ordering exists, return an empty array.",
        "Example 1:\nInput: n = 8, m = 2, group = [-1,-1,1,0,0,1,0,-1], beforeItems = [[],[6],[5],[6],[3,6],[],[],[]]\nOutput: [6,3,4,1,5,2,0,7]",
        "Example 2:\nInput: n = 8, m = 2, group = [-1,-1,1,0,0,1,0,-1], beforeItems = [[],[6],[5],[6],[3],[],[4],[]]\nOutput: []\nExplanation: The dependencies force items of group 0 to be split apart.",
        "Constraints:\n- 1 <= m <= n <= 3 * 10^4\n- group.length == beforeItems.length == n\n- -1 <= group[i] <= m - 1 and 0 <= beforeItems[i][j] <= n - 1",
      ],
      code: `vector<int> kahn(int n, vector<vector<int>>& adj, vector<int> indeg) {
    queue<int> q;
    for (int i = 0; i < n; i++) {
        if (indeg[i] == 0) q.push(i);
    }
    vector<int> order;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        order.push_back(u);
        for (int v : adj[u]) {
            if (--indeg[v] == 0) q.push(v);
        }
    }
    if ((int)order.size() != n) return {};
    return order;
}

vector<int> sortItems(int n, int m, vector<int>& group,
                      vector<vector<int>>& beforeItems) {
    int groups = m;
    for (int i = 0; i < n; i++) {
        if (group[i] == -1) group[i] = groups++;
    }
    vector<vector<int>> itemAdj(n), groupAdj(groups);
    vector<int> itemIn(n, 0), groupIn(groups, 0);
    for (int i = 0; i < n; i++) {
        for (int j : beforeItems[i]) {
            itemAdj[j].push_back(i);
            itemIn[i]++;
            if (group[j] != group[i]) {
                groupAdj[group[j]].push_back(group[i]);
                groupIn[group[i]]++;
            }
        }
    }
    vector<int> itemOrder = kahn(n, itemAdj, itemIn);
    vector<int> groupOrder = kahn(groups, groupAdj, groupIn);
    if (itemOrder.empty() || groupOrder.empty()) return {};
    vector<vector<int>> bucket(groups);
    for (int it : itemOrder) bucket[group[it]].push_back(it);
    vector<int> res;
    res.reserve(n);
    for (int g : groupOrder) {
        for (int it : bucket[g]) res.push_back(it);
    }
    return res;
}`,
      explanation: [
        "Every ungrouped item is first given a private group of its own, which removes the -1 special case: contiguity is then trivially satisfied for those items and the problem becomes uniform.",
        "Two independent topological sorts are run - one over items and one over groups, where a cross-group dependency becomes a group-level edge. Sorting groups then concatenating each group's items in item order satisfies both constraints, because within a group the item order is already topological and across groups the group order respects every cross edge.",
        "An empty result from either sort means a cycle exists at that level, so no valid arrangement is possible. Time: O(V + E) over both levels. Space: O(V + E).",
      ],
    },
  ],
};
