import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const dpWithBitset: TopicContent = {
  quickSummary: [
    "When a DP layer is boolean (achievable/not), pack it into std::bitset and transitions become shifted OR operations.",
    "Classic: subset-sum over all values via `dp |= dp << a[i]` \u2014 O(n\u00b7S/64).",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 DP with Bitset",
      source: `// Problem Description(https://leetcode.com/problems/maximum-total-reward-using-operations-ii/description/) :-
// Initially, your total reward x is 0, and all indices are unmarked. You are allowed to perform
// the following operation any number of times:
// Choose an unmarked index i from the range [0, n - 1].If rewardValues[i] is greater than your current
// total reward x, then add rewardValues[i] to x (i.e., x = x + rewardValues[i]), and mark the index i.
// Return an integer denoting the maximum total reward you can collect by performing the operations optimally.

// constrains :-
// 1 <= rewardValues.length <= 5 * 10^4
// 1 <= rewardValues[i] <= 5 * 10^4

// Explanation :-
// It is bitset dp problem.
// Use 2 bitset dp and curr. In dp we check i sum is possible or not and curr is use
// for help in calculating.

#include<bits/stdc++.h>
using namespace std;
#define int long long
const int M = 1e9 + 7;
signed main()
{
    int n; cin >> n;
    vector<int>v(n);
    for (int i = 0; i < n; ++i)
    {
        cin >> v[i];
    }
    const int N = 1e5 + 5;
    sort(v.begin(), v.end());
    bitset < N + 1 > dp, curr;
    dp[0] = 1;
    int pos = 0;
    for (auto it : v)
    {
        while (pos < it) {
            curr[pos] = 1;
            pos++;
        }
        dp = (dp | (dp & curr) << it);
    }
    int res = 0;
    for (int i = N - 1; i >= 0; i--) {
        if (dp[i]) {
            res = i;
            break;
        }
    }
    cout << res << endl;
}`,
    },
  ],
  cheatSheet: [
    "Boolean reachability DP + tight limits \u2192 bitset.",
    "Shift-OR replaces the inner loop entirely.",
  ],
};
