import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const dpWithPrefixSum: TopicContent = {
  quickSummary: [
    "When dp[i] sums dp[j] over a contiguous range, keep a running prefix array of the previous layer \u2014 each transition becomes O(1).",
    "Turns many O(n\u00b7k\u00b7n) counting DPs into O(n\u00b7k).",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 DP with Prefix Sums",
      source: `// Problem Statement(https://atcoder.jp/contests/dp/tasks/dp_m) : -
// There are N children, numbered 1, 2, …, N.They have decided to share K candies among
// themselves. Here, for each i (1≤i≤N), Child i must receive between 0 and a(i)
// candies (inclusive). Also, no candies should be left over.Find the number of
// ways for them to share candies, modulo 10 ^ 9 + 7.Here, two ways are said to
// be different when there exists a child who receives a different number of candies.
// Constraints : -
// 	All values in input are integers.
// 	1≤N≤100
// 	0≤K≤10 ^ 5
// 	0≤a[i]≤K

// Explanation : -
// 		Idea is dynamic programming with prefix sum.
// 		Let dp[i][j] be the number of ways of distributing j chocolates to the first i people.
// 		Then we can give the i - th person - 0, 1, 2, ... , v[i] chocolates.
// 		So, dp[i][j] = dp[i - 1][j] + dp[i - 1][j - 1] + ... + dp[i - 1][j - v[i]].
// 		so first calculate prefix sum of previous row and calculate this value as
// 		dp[i][j] = dp[i - 1][j] - ((j - v[i] - 1) < 0 ? 0 : dp[i - 1][j - v[i] - 1]);
// 		So the base case is that f(0, 0) = 1 and f(0, j) = 0 for all other j.

// code :-

#include<bits/stdc++.h>
using namespace std;
#define int long long
const int M = 1e9 + 7;

signed main()
{
	int n, k; cin >> n >> k;
	vector<int>v(n + 1);
	for (int i = 1; i <= n; ++i)
	{
		cin >> v[i];
	}
	vector<vector<int>>dp(n + 1, vector<int>(k + 1));

	dp[0][0] = 1;
	for (int i = 1; i <= n; ++i)
	{
		for (int j = 1; j <= k ; ++j)
		{
			dp[i - 1][j] += dp[i - 1][j - 1];
			dp[i - 1][j] = dp[i - 1][j] % M;
		}
		for (int j = 0; j <= k; ++j)
		{
			dp[i][j] = dp[i - 1][j];
			if (j - v[i] - 1 >= 0) {
				dp[i][j] -= dp[i - 1][j - v[i] - 1];
			}
			dp[i][j] = ((dp[i][j] % M) + M) % M;
		}
	}
	cout << dp[n][k] << endl;
}`,
    },
  ],
  cheatSheet: [
    "Spot it: transition reads a window sum of the previous layer.",
    "Rebuild the prefix per layer; mind modulo when subtracting.",
  ],
};
