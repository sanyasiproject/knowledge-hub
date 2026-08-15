import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const heavyLightDecomposition: TopicContent = {
  quickSummary: [
    "HLD splits a tree into heavy chains so any root-to-node path crosses O(log n) chains, each a contiguous segment-tree range.",
    "Path query/update = walk chain heads upward, querying each chain's segment; total O(log\u00b2 n).",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 Heavy-Light Decomposition",
      source: `// You are given a rooted tree consisting of n nodes. The nodes are
// numbered 1,2,\\ldots,n, and node 1 is the root. Each node has a value.
// Your task is to process following types of queries:
// 1.change the value of node s to x
// 2.calculate the sum of values on the path from the root to node s


#include<bits/stdc++.h>
using namespace std;
#define ll long long
#define int ll
const int N = 2e5 + 5;
struct node {
    int l, r, mx;
    node *left, *right;
    node(int lt, int rt) {
        l = lt;
        r = rt;
        mx = 0;
        left = NULL;
        right = NULL;
    }

}*root[N];

vector<int>chain[N];
vector<int>adj[N];
vector<int>sze(N);
vector<int>ht(N);
vector<int>par(N);
vector<int>chainhd(N);
vector<int>value(N);
vector<int>pos(N);


void update(node* curr, int ind, int val)
{
    if (curr->l == curr->r)
    {
        curr->mx = val;
        return;
    }

    int mid = (curr->l + curr->r) >> 1;
    update(ind <= mid ? curr->left : curr->right, ind, val);
    curr->mx = (curr->left->mx + curr->right->mx);
}

int query(node* curr, int ql, int qr)
{
    if (qr < curr->l || curr->r < ql)
    {
        return 0;
    }
    if (ql <= curr->l && curr->r <= qr)
    {
        return curr->mx;
    }

    return query(curr->left, ql, qr) + query(curr->right, ql, qr);
}

node* build(int u, int l, int r)
{
    node *curr = new node(l, r);
    if (l < r)
    {
        int md = (l + r) >> 1;
        curr->left = build(u, l, md);
        curr->right = build(u, md + 1, r);
    }

    curr->mx = (l == r) ? value[chain[u][l]] : (curr->left->mx + curr->right->mx);
    return curr;
}


void dfs_built(int u, int p, int l)
{
    par[u] = p;
    ht[u] = l;
    sze[u] = 1;
    for (auto v : adj[u])
    {
        if (v - p)
        {
            dfs_built(v, u, l + 1);
            sze[u] += sze[v];
        }
    }
}

void HLD(int u)
{
    chain[u].push_back(u);
    for (int i = 0; i < chain[u].size(); ++i)
    {
        int v = chain[u][i];
        chainhd[v] = u;
        pos[v] = i;
        for (auto it : adj[v])
        {
            if (it != par[v])
            {
                (sze[it] << 1) >= sze[v] ? chain[u].push_back(it) : HLD(it);
            }
        }
    }
    root[u] = build(u, 0, chain[u].size() - 1);
}

int HLDquery(int u, int v)
{
    int res = 0;
    while (chainhd[u] != chainhd[v])
    {
        if (ht[chainhd[u]] > ht[chainhd[v]])swap(u, v);
        res += query(root[chainhd[v]], 0, pos[v]);

        v = par[chainhd[v]];
    }
    if (pos[u] > pos[v])
        swap(u, v);
    res += query(root[chainhd[u]], pos[u], pos[v]);
    return res;
}


signed main()
{
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n, q; cin >> n >> q;
    for (int i = 1; i <= n; i++)
    {
        cin >> value[i];
    }

    for (int i = 0; i < n - 1; i++)
    {
        int a, b; cin >> a >> b;
        adj[a].push_back(b);
        adj[b].push_back(a);
    }

    dfs_built(1, 1, 0);
    HLD(1);

    while (q--)
    {
        int type; cin >> type;
        if (type == 1)
        {
            int u, val; cin >> u >> val;
            update(root[chainhd[u]], pos[u], val);
        }
        else
        {
            int u; cin >> u;
            cout << HLDquery(1, u) << endl;
        }
    }
}`,
    },
  ],
  cheatSheet: [
    "Use for path aggregates (sum/max) with updates on trees.",
    "Subtree queries are also contiguous: [tin[v], tout[v]].",
  ],
};
