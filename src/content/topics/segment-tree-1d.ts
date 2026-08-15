import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const segmentTree1d: TopicContent = {
  quickSummary: [
    "A binary tree over array intervals: each node stores the aggregate of its range, so updates and queries are O(log n).",
    "Change the combine function (sum/min/max/gcd) to adapt it to almost any associative operation.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 Segment Tree (1D)",
      source: `class SGTree {
    vector<int>seg;
public:
    SGTree(int n)
    {
        seg.resize(4 * n);
    }

    void build (int ind, int low, int high, vector<int>&arr)
    {
        if (low == high)
        {
            seg[ind] = arr[low];
            return;
        }

        int mid = (low + high) >> 1;
        build(2 * ind + 1, low, mid, arr);
        build(2 * ind + 2, mid + 1, high, arr);
        seg[ind] = (seg[2 * ind + 1] + seg[2 * ind + 2]);
    }

    int query(int ind, int low, int high, int l, int r)
    {
        if (r < low || high < l)return 0;

        if (l <= low && high <= r)return seg[ind];

        int mid = (low + high) >> 1;
        int left = query(2 * ind + 1, low, mid, l, r);
        int right = query(2 * ind + 2, mid + 1, high, l, r);
        return (left + right);
    }

    void update(int ind, int low, int high, int i, int val)
    {
        if (low == high)
        {
            seg[ind] = val;
            return;
        }

        int mid = (low + high) >> 1;
        if (i <= mid)update(2 * ind + 1, low, mid, i, val);
        else update(2 * ind + 2, mid + 1, high, i, val);
        seg[ind] = (seg[2 * ind + 1] + seg[2 * ind + 2]);
    }

};`,
    },
  ],
  cheatSheet: [
    "The general tool when Fenwick can't express the operation.",
    "Size 4n array is the safe allocation.",
  ],
};
