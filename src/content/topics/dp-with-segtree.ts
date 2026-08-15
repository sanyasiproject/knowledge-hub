import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const dpWithSegtree: TopicContent = {
  quickSummary: [
    "When dp[i] = best over dp[j] for j in a range (often value-ordered), a segment tree over previous states turns O(n\u00b2) into O(n log n).",
    "Typical shape: coordinate-compress values, query max over allowed predecessor range, insert dp[i] back.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 DP Optimized with Segment Tree",
      source: `// Problem Statement
// There are N flowers arranged in a row. For each i (1≤i≤N), the height and the beauty of the i-th
// flower from the left is h[i] and a[i], respectively. Here, h[1],h[2],…,h[N] are all distinct.
// Taro is pulling out some flowers so that the following condition is met:
// The heights of the remaining flowers are monotonically increasing from left to right.
// Find the maximum possible sum of the beauties of the remaining flowers.

// Constraints :-
// All values in input are integers.
// 1≤N≤2×10^5
// 1≤h[i]≤N
// h[1],h[2],…,h[N] are all distinct
// 1≤a[i]≤10^9

// Explanation :-
// It is dp with segment tree problem.
// first we store index of evry height, then start with height=0 to height=n.
// we calculate sum of dp value till this index because all height before it is sorted till now.
// and update the value at this index as this sum and value at index and update in segment tree
// and return maximum value of dp

// code:-

#include<bits/stdc++.h>
using namespace std;
#define int long long
const int M = 1e9 + 7;

class SGTree {
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

};




class Lazy_ST {
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
};


signed main()
{
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n; cin >> n;
    vector<int>h(n);
    vector<int>ind(n);
    vector<int>val(n);
    for (int i = 0; i < n; ++i)
    {
        cin >> h[i];
        h[i]--;
        ind[h[i]] = i;
    }
    for (int i = 0; i < n; ++i)
    {
        cin >> val[i];
    }
    vector<int>dp(n);
    SGTree sgt(n);
    for (int i = 0; i < n; ++i)
    {
        int index = ind[i];
        dp[index] = sgt.query(0, 0, n - 1, 0, index) + val[index];
        sgt.update(0, 0, n - 1, index, dp[index]);
    }
    cout << *max_element(dp.begin(), dp.end());
}`,
    },
  ],
  cheatSheet: [
    "LIS-style and 'best previous in window' DPs fit this.",
    "Think: what range of previous states does each transition read?",
  ],
};
