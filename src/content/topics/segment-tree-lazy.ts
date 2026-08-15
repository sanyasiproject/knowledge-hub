import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const segmentTreeLazy: TopicContent = {
  quickSummary: [
    "Lazy propagation stores pending range updates at nodes and pushes them down only when a query/update needs to descend.",
    "This keeps range update AND range query at O(log n) \u2014 the standard tool for range-add / range-assign problems.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 Segment Tree + Lazy Propagation",
      source: `class Lazy_ST {
    vector<int>seg, lazy;
public:
    Lazy_ST(int n)
    {
        seg.resize(4 * n + 1);
        lazy.resize(4 * n + 1);

    }
public:
    void build(int ind, int low, int high, vector<int>&arr)
    {
        if (low == high)
        {
            seg[ind] = arr[low];
            return;
        }

        int mid = (low + high) >> 1;
        build(2 * ind + 1, low, mid, arr);
        build(2 * ind + 2, mid + 1, high, arr);
        seg[ind] = seg[2 * ind + 1] + seg[2 * ind + 2];
    }
public:
    void update(int ind, int low, int high, int l, int r, int val)
    {

        if (lazy[ind] != 0)
        {
            seg[ind] += (high - low + 1) * lazy[ind];

            if (low != high)
            {
                lazy[2 * ind + 1] += lazy[ind];
                lazy[2 * ind + 2] += lazy[ind];

            }
            lazy[ind] = 0;
        }

        if (high < l || r < low)
        {
            return;
        }
        if (low >= l && high <= r)
        {
            seg[ind] += (high - low + 1) * val;

            if (low != high)
            {
                lazy[2 * ind + 1] += val;
                lazy[2 * ind + 2] += val;
            }
            return;
        }

        int mid = (low + high) >> 1;
        update(2 * ind + 1, low, mid, l, r, val);
        update(2 * ind + 2, mid + 1, high, l, r, val);
        seg[ind] = seg[2 * ind + 1] + seg[2 * ind + 2];
    }

public:
    int query(int ind, int low, int high, int l, int r)
    {

        if (lazy[ind] != 0)
        {
            seg[ind] += (high - low + 1) * lazy[ind];

            if (low != high)
            {
                lazy[2 * ind + 1] += lazy[ind];
                lazy[2 * ind + 2] += lazy[ind];

            }
            lazy[ind] = 0;
        }

        if (high < l || r < low)
            return 0;

        if (low >= l && high <= r)return seg[ind];

        int mid = (low + high) >> 1;
        int left = query(2 * ind + 1, low, mid, l, r);
        int right = query(2 * ind + 2, mid + 1, high, l, r);
        return left + right;
    }
};`,
    },
  ],
  cheatSheet: [
    "Push down before descending; recompute on the way up.",
    "Compose laziness carefully for assign+add combinations.",
  ],
};
