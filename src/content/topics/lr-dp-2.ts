import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const lrDp2: TopicContent = {
  quickSummary: [
    "A companion interval-DP template covering the endpoint-consuming pattern: answer [l, r] by taking l or r next.",
    "Fits 'pick from either end' games and reordering problems.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 L-R (Interval) DP \u2014 Part 2",
      source: `// Problem Statement(https://atcoder.jp/contests/dp/tasks/dp_n):-
// There are N slimes lining up in a row. Initially, the i-th slime from the left has a size of a(i)
// Taro is trying to combine all the slimes into a larger slime. He will perform the following
// operation repeatedly until there is only one slime:
// Choose two adjacent slimes, and combine them into a new slime. The new slime has a size of x+y,
// where x and y are the sizes of the slimes before combining them. Here, a cost of x+y is incurred.
// The positional relationship of the slimes does not change while combining slimes.
// Find the minimum possible total cost incurred.

// Constraints:-
// All values in input are integers.
// 2≤N≤400
// 1≤a[i]≤10^9

// Explaination:-
// L-R dp with prefix sum of values
// dp[l][r]=what is min value get if the array is l to r.
// we can check for every two parts of l to r(l to j and j+1 to r).



#include<bits/stdc++.h>
using namespace std;
#define int long long
const int M = 1e9 + 7;

int getsum(int l, int r, vector<int>&psm) {
    return psm[r] - psm[l - 1];
}

signed main()
{
    int n; cin >> n ;
    vector<int>v(n + 1);
    vector<int>psm(n + 1);
    for (int i = 1; i <= n; ++i)
    {
        cin >> v[i];
        psm[i] += psm[i - 1] + v[i];
    }
    vector<vector<int>>dp(n + 1, vector<int>(n + 1, 1e18));
    for (int i = 0; i <= n; ++i)
    {
        dp[i][i] = 0;
    }
    for (int len = 2; len <= n ; ++len)
    {
        for (int i = 1; i < n; ++i)
        {
            int l = i, r = min(n, i + len - 1);
            for (int j = l; j < r ; ++j)
            {
                dp[l][r] = min(dp[l][r], dp[l][j] + dp[j + 1][r] + getsum(l, r, psm));
            }
        }
    }
    cout << dp[1][n];


}`,
    },
  ],
  cheatSheet: [
    "When choices happen at the boundary, state (l, r) with two transitions suffices.",
    "Memoized recursion mirrors the interval structure naturally.",
  ],
};
