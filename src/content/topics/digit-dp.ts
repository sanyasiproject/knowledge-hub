import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const digitDp: TopicContent = {
  quickSummary: [
    "Processes N digit by digit with a 'tight' flag marking whether the prefix still equals N's prefix.",
    "Count over [L, R] = f(R) - f(L-1); states are (position, tight, property-so-far).",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 Digit DP",
      source: `// Problem Statement() :-
// Find the number of integers between 1 and K (inclusive) satisfying the following condition, modulo 1e9+7.
// The sum of the digits in base ten is a multiple of D.

// Constraints :-
// All values in input are integers.
// 1≤K<10^10000
// 1≤D≤100

// Explanation :-
// It is digit dp.
// dp[ind][last][val]=number of integer till index ind and is this is last value of
// index or not and what is sum of digit mod to k for find it's divisibility.



#include<bits/stdc++.h>
using namespace std;
#define int long long
const int M = 1e9 + 7;

int dp[10001][2][101];
string k;
int d;
int solve(int ind, bool last, int val) {
    if (ind == k.size())return (val == 0);
    int &res = dp[ind][last][val];
    if (res != -1)return res;
    int till = (last ? (k[ind] - '0') : 9);
    res = 0;
    for (int i = 0; i <= till; ++i)
    {
        res += solve(ind + 1, (last && (i == till)), (val + i) % d);
        res = res % M;
    }
    return res;
}


signed main()
{
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    cin >> k >> d;
    memset(dp, -1, sizeof(dp));
    cout << (solve(0, 1, 0) - 1 + M) % M << endl;

}`,
    },
  ],
  cheatSheet: [
    "Any 'count numbers with digit condition' question is digit DP.",
    "Memoize only non-tight states \u2014 tight paths are unique.",
  ],
};
