import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const manacher: TopicContent = {
  quickSummary: [
    "Maintains the rightmost palindrome window and mirrors known radii inside it \u2014 every position's longest palindrome in linear time.",
    "Answers longest palindromic substring and palindrome counting instantly.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 Manacher's Algorithm",
      source: `#include<bits/stdc++.h>
using namespace std;

struct manacher {
    vector<int>p;
    void run_manacher(string s) {
        int n = s.size();
        p.assign(n, 1);
        int l = 1, r = 1;
        for (int i = 0; i < n; ++i)
        {
            p[i] = max(0, min(r - i, p[l + r - i]));
            while (i + p[i] < n && i - p[i] >= 0 && s[i + p[i]] == s[i - p[i]]) {
                p[i]++;
            }
            if (i + p[i] > r) {
                l = i - p[i];
                r = i + p[i];
            }
        }

    }

    // s=babbabbabc
    // t=#b#a#b#b#a#b#b#a#b#c#
    // p[]={1 2 1 4 1 2 7 2 1 10 1 2 7 2 1 4 1 2 1 2 1}

    void build(string s) {
        string t;
        for (auto it : s) {
            t += string("#") + it;
        }
        t += '#';
        run_manacher(t);
    }

    int getlongest(int cen, bool odd) {
        int pos = 2 * cen + 1 + (!odd);
        return p[pos] - 1;
    }

    int checkpalindrome(int l, int r) {
        if ((r - l + 1) <= getlongest((l + r) / 2, l % 2 == r % 2)) {
            return 1;
        }
        else {
            return 0;
        }
    }
} m;


int main()
{
    string s; cin >> s;
    m.build(s);

}`,
    },
  ],
  cheatSheet: [
    "Odd and even palindromes handled by the two radius arrays (or separator trick).",
    "Total palindromic substrings = \u03a3 radii.",
  ],
};
