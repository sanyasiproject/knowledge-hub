import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const segmentTree2d: TopicContent = {
  quickSummary: [
    "An outer tree over rows where each node holds an inner tree over columns \u2014 rectangle queries and point updates in O(log\u00b2 n).",
    "Memory is O(n\u00b7m\u00b7constant); viable for grids around 1024\u00d71024.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 Segment Tree (2D)",
      source: `#include<bits/stdc++.h>
using namespace std;
class SGTree {
public:
    vector<vector<int>>seg;
    int n, m;
    SGTree(int a, int b)
    {
        n = a;
        m = b;
        seg.resize(4 * a, vector<int>(4 * b));
    }

    void build_y (int ind_x, int lx, int rx, int ind_y, int ly, int ry, vector<vector<int>>&arr)
    {
        if (ly == ry) {
            if (lx == rx) {
                seg[ind_x][ind_y] = arr[lx][ly];
            }
            else {
                seg[ind_x][ind_y] = seg[2 * ind_x + 1][ind_y] + seg[2 * ind_x + 2][ind_y];
            }
        }
        else {
            int mid = (ly + ry) >> 1;
            build_y(ind_x, lx, rx, 2 * ind_y + 1, ly, mid, arr);
            build_y(ind_x, lx, rx, 2 * ind_y + 2, mid + 1, ry, arr);
            seg[ind_x][ind_y] = (seg[ind_x][2 * ind_y + 1] + seg[ind_x][2 * ind_y + 2]);
        }
    }
    void build_x (int ind_x, int lx, int rx, vector<vector<int>>&arr)
    {
        if (lx != rx)
        {
            int mid = (lx + rx) >> 1;
            build_x(2 * ind_x + 1, lx, mid, arr);
            build_x(2 * ind_x + 2, mid + 1, rx, arr);
        }
        build_y(ind_x, lx, rx, 0, 0, m - 1, arr);

    }

    int query_y(int ind_x, int ind_y, int tly, int try_, int ly, int ry) {
        if (ly > ry)
            return 0;
        if (ly == tly && try_ == ry)
            return seg[ind_x][ind_y];
        int tmy = (tly + try_) / 2;
        return query_y(ind_x, ind_y * 2 + 1, tly, tmy, ly, min(ry, tmy))
               + query_y(ind_x, ind_y * 2 + 2, tmy + 1, try_, max(ly, tmy + 1), ry);
    }
    int query_x(int ind_x, int tlx, int trx, int lx, int rx, int ly, int ry) {
        if (lx > rx)
            return 0;
        if (lx == tlx && trx == rx)
            return query_y(ind_x, 0, 0, m - 1, ly, ry);
        int tmx = (tlx + trx) / 2;
        return query_x(ind_x * 2 + 1, tlx, tmx, lx, min(rx, tmx), ly, ry)
               + query_x(ind_x * 2 + 2, tmx + 1, trx, max(lx, tmx + 1), rx, ly, ry);
    }

    void update_y(int ind_x, int lx, int rx, int ind_y, int ly, int ry, int x, int y, int new_val) {
        if (ly == ry) {
            if (lx == rx)
                seg[ind_x][ind_y] = new_val;
            else
                seg[ind_x][ind_y] = seg[ind_x * 2 + 1][ind_y] + seg[ind_x * 2 + 2][ind_y];
        } else {
            int my = (ly + ry) / 2;
            if (y <= my)
                update_y(ind_x, lx, rx, ind_y * 2 + 1, ly, my, x, y, new_val);
            else
                update_y(ind_x, lx, rx, ind_y * 2 + 2, my + 1, ry, x, y, new_val);
            seg[ind_x][ind_y] = seg[ind_x][ind_y * 2 + 1] + seg[ind_x][ind_y * 2 + 2];
        }
    }
    void update_x(int ind_x, int lx, int rx, int x, int y, int new_val) {
        if (lx != rx) {
            int mx = (lx + rx) / 2;
            if (x <= mx)
                update_x(ind_x * 2 + 1, lx, mx, x, y, new_val);
            else
                update_x(ind_x * 2 + 2, mx + 1, rx, x, y, new_val);
        }
        update_y(ind_x, lx, rx, 0, 0, m - 1, x, y, new_val);
    }

};

int main() {
    int n, m; cin >> n >> m;
    std::vector<vector<int>> v(n, vector<int>(m));
    for (int i = 0; i < n; ++i) {
        for (int j = 0; j < m; ++j) {
            cin >> v[i][j];
        }
    }
    SGTree sgt(n, m);
    sgt.build_x(0, 0, n - 1, v);
    int q; cin >> q;
    while (q--) {
        int val; cin >> val;
        if (val == 1) {
            int lx, ly, rx,  ry; cin >> lx >> ly >>  rx   >> ry;
            lx--; ly--; rx--; ry--;
            cout << sgt.query_x(0, 0, n - 1, lx, rx, ly, ry) << endl;
        }
        else {
            int x, y, data; cin >> x >> y >> data;
            x--; y--;
            sgt.update_x(0, 0, n - 1, x, y, data);
        }
    }
}`,
    },
  ],
  cheatSheet: [
    "Use when 2D BIT can't express the aggregate (e.g. max).",
    "Both update and query are nested descents: outer rows, inner cols.",
  ],
};
