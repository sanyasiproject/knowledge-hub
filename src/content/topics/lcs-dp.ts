import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const lcsDp: TopicContent = {
  quickSummary: [
    "dp[i][j] = LCS of prefixes; match extends the diagonal, otherwise take the better of dropping one character.",
    "O(n\u00b7m); reconstruct the subsequence by backtracking.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 Longest Common Subsequence",
      source: `#include <bits/stdc++.h>
using namespace std;
int longestCommonSubsequence(string &s1, string &s2) {
    int n = s1.size();
    int m = s2.size();
    vector<int>dp(m + 1, 0), prev(m + 1, 0);
    for (int i = 1; i <= n; i++)
    {
        for (int j = 1; j <= m; j++)
        {
            if (s1[i - 1] == s2[j - 1])
                dp[j] = 1 + prev[j - 1];
            else dp[j] = max(prev[j], dp[j - 1]);
        }
        prev = dp;
    }
    return dp[m];
}

int main()
{
    string s1, s2; cin >> s1 >> s2;
    cout << longestCommonSubsequence(s1, s2);
}`,
    },
  ],
  cheatSheet: [
    "Foundation for diff tools and many string DPs.",
    "Space reduces to two rows if only the length matters.",
  ],
};
