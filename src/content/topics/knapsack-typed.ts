import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const knapsackTyped: TopicContent = {
  quickSummary: [
    "Handles item multiplicity per type: singles, limited copies (binary-split into powers of two), and unlimited copies in one framework.",
    "Binary splitting keeps bounded items at O(log cnt) pseudo-items each.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 Knapsack with Item Types",
      source: `// Problem :- "Modified Knapsack"
// You will be given N elements, each consisting of three numbers.
// They are type, weight and value.
// You will also be given a value K.
// You have to select few elements such that the following property holds:
// 1. You cannot pick more than one element of the same type.
// 2. The total weight of the selected elements have to be less than or equal to K.
// 3. The total value of the selected elements should be as large as possible.
// You have to output the maximized total value of the selected elements.



#include<bits/stdc++.h>
using namespace std;
#define int long long
const int M = 1e9 + 7;

signed main()
{
    int n; cin >> n;
    vector<vector<int>>v(n + 1, vector<int>(3));
    for (int i = 1; i <= n; ++i)
    {
        cin >> v[i][0] >> v[i][1] >> v[i][2];
    }
    int k; cin >> k;
    sort(v.begin() + 1, v.end());
    vector<int>last(n + 5, -1);
    vector<vector<int>>dp(n + 1, vector<int>(k + 1));
    for (int i = 1; i <= n; ++i)
    {
        int type = v[i][0], wt = v[i][1], val = v[i][2];
        int ls = last[type];
        if (ls == -1)ls = i - 1;
        for (int j = 0; j <= k ; ++j)
        {
            dp[i][j] = dp[i - 1][j];
            if (j - wt >= 0) {
                dp[i][j] = max({dp[i][j], dp[ls][j - wt] + val});
            }
        }
        if (last[type] == -1)last[type] = i - 1;
    }
    int res = 0;
    for (int i = 1; i <= n; ++i)
    {
        for (int j = 1; j <= k; ++j)
        {
            res = max(res, dp[i][j]);
            cout << dp[i][j] << " ";
        }
        cout << endl;
    }
    cout << res << endl;
}`,
    },
  ],
  cheatSheet: [
    "Bounded knapsack \u2192 split counts into 1,2,4,\u2026 chunks.",
    "Choose loop direction per item type (0/1 desc, unbounded asc).",
  ],
};
