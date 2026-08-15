import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const editDistance: TopicContent = {
  quickSummary: [
    "dp[i][j] = distance between prefixes; match keeps the diagonal, otherwise 1 + min(insert, delete, replace).",
    "O(n\u00b7m) time; a rolling row cuts memory to O(m).",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 Edit Distance",
      source: `#include <bits/stdc++.h>
using namespace std;
int Edit_Distance(string &s1, string &s2) {
    int n = s1.size(), m = s2.size();
    vector<vector<int>>dp(n + 1, vector<int>(m + 1));
    for (int i = 0; i <= m; i++)
    {
        dp[0][i] = i;
    }
    for (int i = 0; i <= n; i++)
    {
        dp[i][0] = i;
    }

    for (int i = 1; i <= n; i++)
    {
        for (int j = 1; j <= m; j++)
        {
            if (s1[i - 1] == s2[j - 1])
                dp[i][j] = dp[i - 1][j - 1];
            else
                dp[i][j] = 1 + min({dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]});

        }
    }
    return dp[n][m];
}

int main()
{
    string s1, s2; cin >> s1 >> s2;
    cout << Edit_Distance(s1, s2);
}`,
    },
  ],
  cheatSheet: [
    "The template for string similarity questions.",
    "Reconstruct operations by walking the table backwards.",
  ],
};
