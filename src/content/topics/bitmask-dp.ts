import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const bitmaskDp: TopicContent = {
  quickSummary: [
    "Encode a subset as a bitmask and iterate masks in increasing order \u2014 each transition adds one element via free bits.",
    "O(2\u207f\u00b7n) covers assignment/TSP-style problems for n \u2264 ~20.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 Iterative Bitmask DP",
      source: `// Problem Statement(https://atcoder.jp/contests/dp/tasks/dp_o) :-
// There are N men and N women, both numbered 1,2,…,N.For each i,j (1≤i,j≤N), the compatibility
// of Man i and Woman j is given as an integer a i,j. If a i,j=1, Man i and Woman j are compatible;
// if a i,j=0, they are not.Taro is trying to make N pairs, each consisting of a man and a woman
// who are compatible. Here, each man and each woman must belong to exactly one pair.
// Find the number of ways in which Taro can make N pairs, modulo 1e9+7;


// Constraints :-
// All values in input are integers.
// 1≤N≤21
// a[i][j] is 0 or 1.


// Explanation :-
// It is a bitmask dp problem.
// dp[i][mask] = Number of ways to match first i men with the set of women indicated by the mask,
// 0 <= i <= n, 0 <= mask <= 2^n. Obviuosly, if i != popcount(mask), dp[i][mask] = 0.
// Fill the dp table by iterating over i and mask. When you fill dp[i][mask],
// you iterate over all possible pairing of i-th man with a woman. So the transition is
// dp[i][mask] = (sum of dp[i-1][mask ^ 1 << j] where j-th woman appeared in the mask).

// code:-
// (Iterative bitmask dp)

#include<bits/stdc++.h>
using namespace std;
#define int long long
const int M = 1e9 + 7;
signed main()
{
    int n; cin >> n;
    vector<vector<int>>v(n, vector<int>(n));
    for (int i = 0; i < n; ++i)
    {
        for (int j = 0; j < n; ++j)
        {
            cin >> v[i][j];
        }
    }
    vector<vector<int>>dp(n + 1, vector<int>((1 << n)));
    dp[0][0] = 1;
    for (int i = 0; i < n; ++i)
    {
        for (int mask = 0; mask < (1 << n); ++mask)
        {
            if (__builtin_popcount(mask) == i) {
                for (int j = 0; j < n; ++j)
                {
                    if (v[i][j] && ((mask & (1 << j)) == 0)) {
                        (dp[i + 1][(mask | (1 << j))] += dp[i][mask]) ;
                        dp[i + 1][(mask | (1 << j))] %= M;
                    }
                }
            }
        }
    }

    cout << dp[n][(1 << n) - 1];

}`,
    },
  ],
  cheatSheet: [
    "Subset iteration: `for (s = m; s; s = (s-1) & m)`.",
    "Mask increasing order guarantees dependencies are ready.",
  ],
};
