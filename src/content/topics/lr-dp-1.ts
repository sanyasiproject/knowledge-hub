import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const lrDp1: TopicContent = {
  quickSummary: [
    "Interval DP computes answers for [l, r] from shorter intervals \u2014 iterate by increasing length.",
    "Classic uses: merge costs, palindrome partitions, removal games.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 L-R (Interval) DP \u2014 Part 1",
      source: `// Problem Statement (https://atcoder.jp/contests/dp/tasks/dp_l) :-
// Taro and Jiro will play the following game against each other.Initially, they are given a sequence
// a=(a1,a2,…,aN). Until a becomes empty, the two players perform the following operation alternately,
// starting from Taro:
// Remove the element at the beginning or the end of a. The player earns x points,
// where x is the removed element.
// Let X and Y be Taro's and Jiro's total score at the end of the game,respectively.
// Taro tries to maximize X−Y, while Jiro tries to minimize X−Y.Assuming that the
// two players play optimally, find the resulting value of X−Y.

// Constraints :-
// All values in input are integers.
// 1≤N≤3000
// 1≤a[i]≤10^9

// Explanation:
// Idea is L-R dp
// dp[i][j]= The maximum difference we can attain by considering only numbers
// from index starting from i and terminating at j.
// dp[i][j] can be written as val[i],whenever i and j are equal, because this is the maximum
// difference we can attain after selecting from i to j, whenever i>j dp[i][j]=0, and
// whenever i<j, we can write dp[i][j] as, dp[i][j]=max((val[i]-dp[i+1][j]),(val[j]-dp[i][j-1]))

// code:-

#include<bits/stdc++.h>
using namespace std;
#define int long long
const int M = 1e9 + 7;
signed main()
{
    int n; cin >> n;
    vector<int>v(n + 1);
    for (int i = 1; i <= n; ++i)
    {
        cin >> v[i];
    }
    vector<vector<int>>dp(n + 1, vector<int>(n + 1));
    for (int i = n; i > 0; --i)
    {
        for (int j = i; j <= n; ++j)
        {
            if (i == j) {
                dp[i][j] = v[i];
            }
            else {
                dp[i][j] = max(v[i] - dp[i + 1][j], v[j] - dp[i][j - 1]);
            }
        }
    }
    cout << dp[1][n];
}`,
    },
  ],
  cheatSheet: [
    "State = interval endpoints; transition = split point or endpoint move.",
    "O(n\u00b2) states, often O(n\u00b3) total.",
  ],
};
