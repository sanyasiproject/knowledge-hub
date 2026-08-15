import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const sparseTableRmq: TopicContent = {
  quickSummary: [
    "Precompute answers for all power-of-two length windows; a query overlaps two windows that fully cover [l, r].",
    "Works for idempotent ops (min/max/gcd) where overlap doesn't double-count. O(n log n) build, O(1) query.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 Sparse Table (RMQ)",
      source: `const int N = (1 << 14);
const int lg = 14;

class sparse_table {
public:
    int dp[N][lg];
    int pre_lg[N], n;
    sparse_table(int a) {
        memset(dp, 0, sizeof(dp));
        memset(pre_lg, 0, sizeof(pre_lg));
        n = 0;
    }

    void init(vector<int>&a) {
        int n = a.size();
        for (int i = 2; i < 2 * n; i++) {
            pre_lg[i] = pre_lg[i >> 1] + 1;
        }

        for (int i = 0; i < n; i++)dp[i][0] = a[i];

        for (int j = 1;  (1 << j) <= n; j++) {
            for (int i = 0; i < n; i++) {
                dp[i][j] = min(dp[i][j - 1], dp[i + (1 << (j - 1))][j - 1]);
            }
        }
    }

    int query(int l, int r) {
        int k = pre_lg[r - l + 1];
        return min(dp[l][k], dp[r - (1 << k) + 1][k]);
    }
};`,
    },
  ],
  cheatSheet: [
    "Static array + min/max/gcd queries \u2192 sparse table beats segment tree.",
    "No updates allowed \u2014 rebuild is O(n log n).",
  ],
};
