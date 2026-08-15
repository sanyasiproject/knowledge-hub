import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const binaryExponentiation: TopicContent = {
  quickSummary: [
    "Square the base and halve the exponent \u2014 computes a\u1d49 (mod m) in O(log e) multiplications.",
    "The building block for modular inverse (a^(m-2)) and matrix power.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 Binary Exponentiation",
      source: `const int M = 1e9 + 7;
long long binpow(long long a, long long b) {
    long long res = 1;
    while (b > 0) {
        if (b & 1)
            res = res * a;
        a = a * a;
        b >>= 1;
        res = res % M;
        a = a % M;
    }
    return res;
}`,
    },
  ],
  cheatSheet: [
    "Always reduce mod m at every multiply.",
    "Inverse mod prime p: power(a, p-2, p).",
  ],
};
