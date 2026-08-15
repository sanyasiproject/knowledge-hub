import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const knapsackDp: TopicContent = {
  quickSummary: [
    "dp[w] = best value at capacity w; iterate items outside, capacity DESCENDING inside so each item is used once.",
    "Ascending inner loop instead gives the unbounded variant \u2014 one line of difference.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 0/1 Knapsack",
      source: `#include <bits/stdc++.h>
using namespace std;

// if constrains are :
// 1 ≤ N ≤ 100
// 1 ≤ W ≤ 10^5
// 1 ≤ w[i] ≤ W
// 1 ≤ v[i] ≤ 10^9

// code TC : O(N*W) ;
// code SC : O(W);

// Solution :- dp[i][j] = maximum value collect till index i with weight j;
// we need only last dp value so replace first state of dp as index as prev and curr;

long long knapSack1(vector<long long>&wt, vector<long long>&val, long long W)
{
    long long n = val.size();
    vector<long long> prev_dp(W + 1, 0);

    for (long long i = 1; i <= n ; ++i)
    {
        vector<long long>curr_dp(W + 1, 0);
        for (long long j = 1; j < W + 1; ++j)
        {
            if (wt[i - 1] <= j)
            {
                curr_dp[j] = max(val[i - 1] + prev_dp[j - wt[i - 1]], prev_dp[j]);
            }
            else
                curr_dp[j] = prev_dp[j];
        }
        prev_dp = curr_dp;
    }

    return prev_dp[W];
}


// if constrains are :
// 1 ≤ N ≤ 100
// 1 ≤ W ≤ 10^9
// 1 ≤ w[i] ≤ W
// 1 ≤ v[i] ≤ 10^3

// code TC : O(N*(sum of v=10^5)) ;
// code SC : O(sum of val);

// Solution :- dp[i][j] = Is till i th index with val j weight is possible or not;
// we need only last dp value so replace first state of dp as index as prev and curr;

long long knapSack2(vector<long long>&wt, vector<long long>&value, long long w)
{
    long long n = value.size();
    const long long MAXN = 1e13;
    vector<long long>prev_min_wt(100001, MAXN);
    vector<long long>prev_dp(100001);

    prev_dp[0] = 1;
    prev_min_wt[0] = 0;

    for (long long i = 1; i <= n; ++i)
    {
        vector<long long>curr_dp(100001);
        vector<long long>curr_min_wt(100001, MAXN);
        for (long long val = 0; val < 100001; ++val)
        {
            // not take item
            if (prev_dp[val]) {
                curr_dp[val] = 1;
                curr_min_wt[val] = min(curr_min_wt[val], prev_min_wt[val]);
            }

            // take item
            if (val - value[i - 1] >= 0 && prev_dp[val - value[i - 1]] && prev_min_wt[val - value[i - 1]] + wt[i - 1] <= w) {
                curr_dp[val] = 1;
                curr_min_wt[val] = min(curr_min_wt[val], prev_min_wt[val - value[i - 1]] + wt[i - 1]);
            }
        }
        prev_dp = curr_dp;
        prev_min_wt = curr_min_wt;
    }
    long long res = 0;
    for (long long i = 0; i < 100001; ++i)
    {
        if (prev_dp[i])res = i;
    }
    return res;
}

int main()
{
    int n, w; cin >> n >> w;
    vector<long long>wt(n), val(n);
    for (int i = 0; i < n; ++i)
    {
        cin >> wt[i] >> val[i];
    }
    cout << knapSack1(wt, val, w) << endl;
    cout << knapSack2(wt, val, w) << endl;
}`,
    },
  ],
  cheatSheet: [
    "0/1: reverse capacity loop. Unbounded: forward loop.",
    "O(n\u00b7W) \u2014 bitset if only feasibility is needed.",
  ],
};
