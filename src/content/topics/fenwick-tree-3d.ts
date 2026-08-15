import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const fenwickTree3d: TopicContent = {
  quickSummary: [
    "Three nested lowbit loops give O(log\u00b3 n) point update and prefix-box queries over a 3D grid.",
    "Box sums use 3D inclusion\u2013exclusion (8 prefix terms).",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 Fenwick Tree (3D)",
      source: `class Fenwick_3D {
    int a, b, c;
    vector<vector<vector<int>>>bit;

    Fenwick_3D(int n, int m, int r) {
        a = n;
        b = m;
        c = r;
        bit.resize(a + 1, vector<vector<int>>(b + 1, vector<int>(c + 1)));
    }

    // Add val to 3-d array from lower-right [ind_x,ind_y,ind_z] to upper_left [1,1,1].
    void update(int ind_x, int ind_y, int ind_z, int val) {
        if (ind_x < 0 || ind_y < 0 || ind_z < 0 || ind_x > a || ind_y > b || ind_z > c)return;

        for (int x = ind_x; x <= a; x += (x & (-x)))
            for (int y = ind_y; y <= b; y += (y & (-y)))
                for (int z = ind_z; z <= c; z += (z & (-z)))
                    bit[x][y][z] += val;
    }

    // Add val to 3-d array from upper-left[x1,y1,z1] to lower-right [x2,y2,z2].
    void update(int x1, int y1, int z1, int x2, int y2, int z2, int val) {
        update(x2, y2, z2, val), update(x1 - 1, y1 - 1, z2, val);
        update(x1 - 1, y2, z1 - 1, val), update(x2, y1 - 1, z1 - 1, val);
        update(x1 - 1, y2, z2, -val), update(x2, y1 - 1, z2, -val);
        update(x2, y2, z1 - 1, -val), update(x1 - 1, y1 - 1, z1 - 1, -val);
    }

    // Query for the value at index [ind_x,ind_y,ind_z].
    int query(int ind_x, int ind_y, int ind_z) {
        int res = 0;
        for (int x = ind_x; x; x -= (x & (-x)))
            for (int y = ind_y; y; y -= (y & (-y)))
                for (int z = ind_z; z; z -= (z & (-z)))
                    res += bit[x][y][z];
        return res;
    }

};`,
    },
  ],
  cheatSheet: [
    "Memory is n\u00b3 \u2014 check limits before reaching for it.",
    "Same pattern generalizes to any dimension.",
  ],
};
