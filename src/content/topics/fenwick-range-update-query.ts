import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const fenwickRangeUpdateQuery: TopicContent = {
  quickSummary: [
    "Two Fenwick trees (B1, B2) together support range add and range sum, both O(log n).",
    "Derivation: a range add contributes a linear function of the index; B1 holds the slope part, B2 the constant part.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 Fenwick: Range Update, Range Query",
      source: `#include<bits/stdc++.h>
using namespace std;
#define ll long long
#define int ll
class BIT_Range_Ops {
public:
    int n;
    vector<vector<int>>bit;
    BIT_Range_Ops(int a)
    {
        n = a;
        bit.resize(n + 7, vector<int>(2));
    }

    void update(int ind, int val, int t)
    {
        for (; ind <= n; ind += (ind & (-ind)))
            bit[ind][t] += val;
    }

    int query(int ind, bool t)
    {
        int res = 0;
        for (; ind; ind -= (ind & (-ind)))
            res += bit[ind][t];
        return res;
    }

    int sum(int x) {
        return (query(x, 0) * x) - query(x, 1);
    }

    void update_range(int l, int r, int val) {
        update(l, val, 0);
        update(r + 1, -val, 0);
        update(l, val * (l - 1), 1);
        update(r + 1, -val * r, 1);
    }

    int range_sum(int l, int r) {
        return sum(r) - sum(l - 1);
    }

};

signed main()
{
    int n, q; cin >> n >> q;
    vector<int>v(n);
    BIT_Range_Ops bt(n);
    for (int i = 0; i < n; ++i)
    {
        cin >> v[i];
        bt.update_range(i + 1, i + 1, v[i]);
    }
    while (q--) {
        int val; cin >> val;
        if (val == 1) {
            int l, r, data; cin >> l >> r >> data;
            bt.update_range(l, r, data);
        }
        else {
            int l, r; cin >> l;
            r = l;
            cout << bt.range_sum(l, r) << endl;
        }
    }
}`,
    },
  ],
  cheatSheet: [
    "Range add + range sum without a lazy segment tree.",
    "update(l, r, v) then prefixSum(i) = B1(i)\u00b7i - B2(i).",
  ],
};
