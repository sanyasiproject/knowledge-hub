import type { TopicContent } from "../types";

export const treeDiameter: TopicContent = {
  quickSummary: [
    "The **diameter** is the longest path between any two nodes of a tree, measured in edges or in summed weights.",
    "**Two traversals**: BFS/DFS from any node to find the farthest node `a`, then from `a` to find the farthest node `b`. `dist(a, b)` is the diameter — **O(n)** time, **O(n)** space.",
    "**DP on tree**: at each node combine its two deepest child branches; the answer is the maximum over all nodes — also **O(n)** / **O(n)**, and it survives arbitrary weights.",
  ],
  detailed: [
    "The two-traversal trick rests on one claim: the farthest node from any start is an endpoint of some diameter. Sketch: let the diameter be `u..v` and let `a` be the node farthest from an arbitrary start `s`. Let `m` be the point where the path from `s` meets the `u..v` path. If `a` were not an endpoint of a diameter, then `dist(m, a) > dist(m, u)` and `dist(m, a) > dist(m, v)` cannot both fail, so swapping `a` in for the nearer endpoint yields a strictly longer path — contradicting that `u..v` was longest. So the second traversal, started at `a`, measures a genuine diameter.\n\nKey insight: the proof needs non-negative edge weights and the tree's unique-path property. Both traversals are plain O(n) sweeps, so total cost is O(n) time and O(n) space.",
    "The DP alternative is one post-order pass. Define `down[u]` as the longest downward path from `u` into its subtree. For each node take the two largest values of `down[child] + w(u, child)`; their sum is the best path whose highest point is `u`. Every path in a tree has exactly one highest point, so maximising over all `u` covers every candidate exactly once.",
    "Pick DP when weights can be negative or when you need more than the number. Two-BFS gives you the endpoints cheaply and is easier to get right; the DP generalises to rerooting (farthest node from *every* node), to counting how many paths achieve the maximum, and to weighted trees where the greedy endpoint argument breaks.\n\nWarning: recursive DFS on a path-shaped tree with n = 2·10^5 will overflow the default stack. Use an explicit stack, or an iterative post-order over a BFS ordering reversed.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Two-BFS diameter for an unweighted tree",
      source: `#include <bits/stdc++.h>
using namespace std;

// Returns {farthest node from src, its distance}.
pair<int, int> bfsFarthest(int src, const vector<vector<int>>& adj) {
    int n = (int)adj.size();
    vector<int> dist(n, -1);
    queue<int> q;
    dist[src] = 0;
    q.push(src);
    int best = src;
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        if (dist[u] > dist[best]) best = u;
        for (int v : adj[u])
            if (dist[v] < 0) { dist[v] = dist[u] + 1; q.push(v); }
    }
    return {best, dist[best]};
}

// diameter in edges; also hands back the two endpoints
int treeDiameterBFS(const vector<vector<int>>& adj, int& endA, int& endB) {
    auto [a, d1] = bfsFarthest(0, adj);
    (void)d1;
    auto [b, d2] = bfsFarthest(a, adj);
    endA = a;
    endB = b;
    return d2;
}`,
    },
    {
      language: "cpp",
      caption: "DP on tree, weighted, iterative post-order (no recursion limit)",
      source: `// adj[u] = list of (v, w). Works with negative weights too.
long long treeDiameterDP(const vector<vector<pair<int, long long>>>& adj) {
    int n = (int)adj.size();
    vector<int> parent(n, -1), order;
    order.reserve(n);
    vector<char> seen(n, 0);

    vector<int> st{0};                       // BFS/DFS order, then process in reverse
    seen[0] = 1;
    while (!st.empty()) {
        int u = st.back();
        st.pop_back();
        order.push_back(u);
        for (auto [v, w] : adj[u]) {
            (void)w;
            if (!seen[v]) { seen[v] = 1; parent[v] = u; st.push_back(v); }
        }
    }

    vector<long long> down(n, 0);            // longest downward path from u
    long long ans = 0;
    for (int i = n - 1; i >= 0; --i) {       // children before parents
        int u = order[i];
        long long b1 = 0, b2 = 0;            // two best child branches
        for (auto [v, w] : adj[u]) {
            if (v == parent[u]) continue;
            long long d = down[v] + w;
            if (d > b1) { b2 = b1; b1 = d; }
            else if (d > b2) { b2 = d; }
        }
        down[u] = b1;
        ans = max(ans, b1 + b2);             // path peaking at u
    }
    return ans;
}`,
    },
  ],
  diagrams: [
    {
      title: "Two-traversal method",
      kind: "flow",
      caption: "Any start reaches a diameter endpoint; the second sweep measures the diameter itself.",
      mermaid: `flowchart LR
    A["Pick any node s"] --> B["BFS from s, take farthest node a"]
    B --> C["BFS from a, take farthest node b"]
    C --> D["dist(a, b) is the diameter"]
    C --> E["a and b are the endpoints"]`,
    },
  ],
  cheatSheet: [
    "Both methods: O(n) time, O(n) space.",
    "Two-BFS needs non-negative weights; DP handles any weights.",
    "DP recurrence: `ans = max(ans, best1 + best2)` over child branches at each node.",
    "Initialise `b1 = b2 = 0` so a leaf contributes a path of length 0.",
    "Radius = ceil(diameter / 2); the centre is the middle node(s) of a diameter path.",
  ],
  interviewQA: [
    {
      q: "Why does BFS from an arbitrary node land on a diameter endpoint?",
      a: "Let u..v be a longest path and let a be the node farthest from an arbitrary start s. Let m be the vertex where the s..a path first touches the u..v path. Since a is farthest from s, dist(m, a) is at least dist(m, u) and at least dist(m, v). If dist(m, a) were strictly greater than one of them, replacing that endpoint with a would produce a path longer than u..v, which is impossible — so dist(m, a) equals the larger side, meaning a is itself a valid diameter endpoint. The argument uses unique tree paths and non-negative weights; with negative weights it collapses and you must use the tree DP. Each BFS is O(n) on a tree because it has n - 1 edges.",
      followUps: ["How would you find the tree's centre from the diameter?", "What breaks if the graph has a cycle?"],
    },
    {
      q: "Compare the two-BFS approach with the DP approach.",
      a: "Two-BFS is two linear sweeps, trivially iterative, and hands you the endpoints as a by-product, which matters when the question asks for the actual path or for the centre. Its correctness proof requires non-negative weights. The tree DP does one post-order pass computing down[u], the deepest downward reach, and combines the two best child branches at every node — every path has a unique highest node, so this enumerates all candidate paths once. The DP is the one to reach for with negative weights, when you need counts of optimal paths, or as the first half of a rerooting DP that answers the farthest distance from every node. Both are O(n) time and O(n) space; the DP's only practical hazard is stack depth if written recursively on a degenerate path-shaped tree.",
    },
  ],
  flashcards: [
    { front: "Two-BFS diameter algorithm?", back: "BFS from any node to find farthest node a, BFS from a to find farthest node b; dist(a,b) is the diameter. O(n) time, O(n) space." },
    { front: "Tree-DP diameter recurrence?", back: "down[u] = max over children of down[c] + w; answer = max over u of (best two child branches summed)." },
    { front: "When does two-BFS fail?", back: "With negative edge weights — the exchange argument breaks. Use the tree DP instead." },
  ],
};
