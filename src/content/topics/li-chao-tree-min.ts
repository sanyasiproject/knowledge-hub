import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const liChaoTreeMin: TopicContent = {
  quickSummary: [
    "Identical structure to the max version with comparisons flipped \u2014 supports minimum queries over inserted lines.",
    "Common in divide-conquer-free CHT optimizations of quadratic DPs.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 Li Chao Tree (Min)",
      source: `#include<bits/stdc++.h>
using namespace std;
#define int long long
#define mymax 1000000000000000001
const int N = 1e6;
struct line {
    int m, c;
    line() {
        m = c = 0;
    }
    line(int _m, int _c) {
        m = _m;
        c = _c;
    }
    int value(int x) {
        return m * x + c;
    }
};

//min

class li_chao_tree {
public:
    vector<line>st;
    int mx, mn;
    li_chao_tree(int _mn, int _mx) {
        mx = _mx;
        mn = _mn;
        st.resize(4 * (mx - mn + 1), line(0, mymax));
    }

    void add_line(int ind, int low, int high, line curr) {
        int mid = low + (high - low) / 2;
        bool l = (st[ind].c == mymax || curr.value(low) < st[ind].value(low));
        bool m = (st[ind].c == mymax || curr.value(mid) < st[ind].value(mid));
        if (m)swap(curr, st[ind]);
        if (low == high)return;
        if (l ^ m) {
            add_line(ind << 1, low, mid, curr);
        }
        else {
            add_line((ind << 1) | 1, mid + 1, high, curr);
        }
    }

    int find(int ind, int low, int high, int x) {
        int mid = low + (high - low) / 2;
        if (low == high)return st[ind].value(x);
        if (x <= mid) {
            return min(st[ind].value(x), find(ind << 1, low, mid, x));
        }
        else {
            return min(st[ind].value(x), find((ind << 1) | 1, mid + 1, high, x));
        }
    }

};


signed main()
{
    int n; cin >> n;
    vector<int>s(n + 1), f(n + 1);
    cin >> f[0];
    for (int i = 1; i <= n; ++i)
    {
        cin >> s[i];
    }
    int res = 0;
    li_chao_tree tree(1, N);
    int mx = N;
    line nln(f[0], 0);
    tree.add_line(1, 1, mx, nln);
    for (int i = 1; i <= n; ++i)
    {
        cin >> f[i];
        res = tree.find(1, 1, mx, s[i]);
        line ln(f[i], res);
        tree.add_line(1, 1, mx, ln);
    }
    cout << res << endl;


}`,
    },
  ],
  cheatSheet: [
    "dp transitions of form min(m_j\u00b7x + c_j) \u2192 Li Chao.",
    "O(log C) insert and query, no slope ordering needed.",
  ],
};
