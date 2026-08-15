import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const lpsArray: TopicContent = {
  quickSummary: [
    "\u03c0[i] = length of the longest border of the prefix ending at i \u2014 computed in O(n) by falling back through previous borders.",
    "Drives KMP matching, period detection, and border counting.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 Prefix Function (LPS / KMP)",
      source: `// pi(i) denotes the maximum length of a substring that ends at position i,
// is a prefix of the string, and whose length is at most i-1.


vector<int> pi_function(string &s)
{
    int n = s.size();
    vector<int>lps(n);
    for (int i = 1; i < n; i++)
    {
        int j = lps[i - 1];
        while (j && s[j] != s[i])
            j = lps[j - 1];
        if (s[j] == s[i])
            j++;
        lps[i] = j;
    }
    return lps;
}`,
    },
  ],
  cheatSheet: [
    "Pattern occurrences: compute \u03c0 over pattern#text.",
    "String period = n - \u03c0[n-1] when it divides n.",
  ],
};
