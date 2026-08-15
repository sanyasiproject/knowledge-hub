import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const zFunction: TopicContent = {
  quickSummary: [
    "z[i] = length of the longest substring starting at i that matches the string's prefix \u2014 O(n) with the Z-box window.",
    "Pattern matching: build Z over pattern$text and read positions where z \u2265 |pattern|.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 Z-Function",
      source: `// z(i) denotes the maximum length of a substring that begins at
// position i and is a prefix of the string. In addition, z(1)=0.

vector<int> z_function(string &s)
{
    int n = s.size();
    vector<int>z(n);
    for (int i = 1, l = 0, r = 0; i < n; ++i)
    {
        if (i <= r) {
            z[i] = min(z[i - l], r - i + 1);
        }
        while (i + z[i] < n && s[z[i]] == s[i + z[i]])
            z[i]++;
        if (i + z[i] - 1 > r) {
            l = i;
            r = i + z[i] - 1;
        }
    }
    return z;
}`,
    },
  ],
  cheatSheet: [
    "Alternative to KMP with a more direct definition.",
    "Also used for period and border reasoning.",
  ],
};
