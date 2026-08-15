import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const centroidDecomposition: TopicContent = {
  quickSummary: [
    "Repeatedly removing the centroid (node whose largest remaining component is minimal) builds a decomposition tree of depth O(log n).",
    "Path problems decompose into 'paths through the current centroid', each solved over O(n log n) total work.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 Centroid Decomposition",
      source: `// Q.Given a tree of n nodes, your task is to count the number
// of distinct paths that consist of exactly k edges.


#include<bits/stdc++.h>
using namespace std;
#define ll long long
#define int ll
const int N = 2e5 + 5;
vector<int>adj[N];
int sub[N], cnt[N], n, k, max_d;
int res;
bool vis[N];

void dfs_sub(int u, int par) {
    sub[u] = 1;
    for (auto it : adj[u]) {
        if (!vis[it] && it != par) {
            dfs_sub(it, u);
            sub[u] += sub[it];
        }
    }
}

int find_centroid(int u, int par, int tree_size) {
    for (auto it : adj[u]) {
        if (!vis[it] && it != par && sub[it] > tree_size) {
            return find_centroid(it, u, tree_size);
        }
    }
    return u;
}

void dfs(int u, int par, int dep, bool is_cal) {
    if (dep > k)return;
    if (is_cal) {
        res += cnt[k - dep];
    }
    else {
        cnt[dep]++;
    }
    max_d = max(max_d, dep);
    for (auto it : adj[u]) {
        if (!vis[it] && it != par) {
            dfs(it, u, dep + 1, is_cal);
        }
    }
}


void centroid_decompose(int u) {
    dfs_sub(u, -1);
    int centroid = find_centroid(u, -1, sub[u] >> 1);
    vis[centroid] = true;
    cnt[0] = 1;
    max_d = 0;
    for (auto it : adj[centroid]) {
        if (!vis[it]) {
            dfs(it, centroid, 1, true);
            dfs(it, centroid, 1, false);
        }
    }
    fill(cnt, cnt + max_d + 10, 0);
    for (auto it : adj[centroid]) {
        if (!vis[it]) {
            centroid_decompose(it);
        }
    }
}

signed main()
{
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    cin >> n >> k;
    for (int i = 0; i < n - 1; ++i)
    {
        int a, b; cin >> a >> b;
        adj[a].push_back(b);
        adj[b].push_back(a);
    }
    centroid_decompose(1);
    cout << res << endl;
}`,
    },
  ],
  cheatSheet: [
    "Use for counting/optimizing paths with a property (length k, etc.).",
    "Every tree path is covered exactly once at the LCA centroid.",
  ],
};
