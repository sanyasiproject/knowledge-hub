import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const lisDp: TopicContent = {
  quickSummary: [
    "Maintain the smallest possible tail for each LIS length; each element binary-searches its place.",
    "The tails array length is the LIS length \u2014 O(n log n) total.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 Longest Increasing Subsequence",
      source: `#include <bits/stdc++.h>
using namespace std;
// TC : O(nlogn)
int lengthOfLIS1(vector<int>& nums) {
    int n = nums.size();
    vector<int>temp;
    temp.push_back(nums[0]);
    for (int i = 0; i < n; i++)
    {
        if (nums[i] > temp.back())
            temp.push_back(nums[i]);
        else
        {
            int ind = lower_bound(temp.begin(), temp.end(), nums[i]) - temp.begin();
            temp[ind] = nums[i];
        }
    }
    return temp.size();
}

// TC : O(n^2)
int lengthOfLIS2(vector<int>& nums) {
    int n = nums.size();
    vector<int>dp(n, 1);
    for (int i = n - 2; i >= 0; --i)
    {
        for (int j = i + 1; j < n; j++)
        {
            if (nums[i] < nums[j])
                dp[i] = max(dp[i], 1 + dp[j]);
        }
    }
    return *max_element(dp.begin(), dp.end());
}

int main()
{
    int n; cin >> n;
    vector<int>v(n);
    for (int i = 0; i < n; ++i)
    {
        cin >> v[i];
    }
    cout << lengthOfLIS1(v) << endl;
    cout << lengthOfLIS2(v);
}`,
    },
  ],
  cheatSheet: [
    "lower_bound = strictly increasing; upper_bound = non-decreasing.",
    "Store predecessors separately if you must reconstruct.",
  ],
};
