import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const treeDp: TopicContent = {
  quickSummary: [
    "Compute dp[v] from children during post-order DFS \u2014 subtree sizes, path counts, independent sets all follow this shape.",
    "Rerooting extends it: combine 'down' answers with 'up' contributions to answer for every root in O(n).",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 Tree DP",
      source: `// Problem Statement(https://atcoder.jp/contests/dp/tasks/dp_p) :-
// There is a tree with N vertices, numbered 1,2,…,N. For each i (1≤i≤N−1), the i-th edge connects
// Vertex x[i] and y[i].
// Taro has decided to paint each vertex in white or black. Here, it is not allowed to paint two adjacent
// ertices both in black.Find the number of ways in which the vertices can be painted, modulo 1e9+7.

// Constraints :-
// All values in input are integers.
// 1≤N≤10^5
// 1≤x[i],y[i]≤N
// The given graph is a tree.


// Explanation :-
// It is dp with trees.
// dp[i][0]=possible number of set if current node is black;
// dp[i][1]=possible number of set if current node is white;
//             "current"

//         /       |  ...  \\
//   "child1"  "child2" ... "childK"

// If current is black, then all childs should be white:
// dp[current][black] = dp[child1][white] * dp[child2][white]*...*dp[childK][white];
// If current is white, then all childs color does not matter:
// dp[current][white] = (dp[child1][white] + dp[child1][black]) * (dp[child2][white] + dp[child2][black])*...*(dp[childK][white] + dp[childK][black]);
// After update all nodes, the last one will be the root node and answer is dp[root][white] + dp[root][black].

// code:-

#include<bits/stdc++.h>
using namespace std;
#define int long long
const int M = 1e9 + 7;

void dfs(int u, int par, vector<int>adj[], vector<vector<int>>&dp) {
    dp[u][0] = dp[u][1] = 1;
    for (auto it : adj[u]) {
        if (it == par)continue;
        dfs(it, u, adj, dp);
        dp[u][0] = (dp[u][0] * dp[it][1]);
        dp[u][1] = (dp[u][1] * (dp[it][0] + dp[it][1]));
        dp[u][0] %= M;
        dp[u][1] %= M;

    }
}

signed main()
{
    int n; cin >> n;
    vector<int>adj[n + 1];
    for (int i = 0; i < n - 1; ++i)
    {
        int u, v; cin >> u >> v;
        adj[u].push_back(v);
        adj[v].push_back(u);
    }
    vector<vector<int>>dp(n + 1, vector<int>(2));
    dfs(1, 0, adj, dp);
    cout << (dp[1][0] + dp[1][1]) % M;
}`,
    },
  ],
  cheatSheet: [
    "State = per-node answer for its subtree.",
    "Watch recursion depth \u2014 bump stack or convert to iterative for n \u2265 1e5.",
  ],
};
