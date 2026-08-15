import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const coordinateCompression: TopicContent = {
  quickSummary: [
    "Sort + dedupe the values, then replace each element with its index \u2014 huge coordinates become 1..k for array-indexed structures.",
    "Essential preprocessing before BIT/segment-tree solutions when values go up to 1e9+.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 Coordinate Compression",
      source: `#include<bits/stdc++.h>
using namespace std;

void convert(vector<int>&arr)
{
    int n = arr.size();
    vector<int>temp(n);
    for (int i = 0; i < n; i++)
        temp[i] = arr[i];
    sort(temp.begin(), temp.end());
    for (int i = 0; i < n; i++) {
        arr[i] = lower_bound(temp.begin(), temp.end() , arr[i]) - temp.begin() + 1;
    }
}

signed main()
{
    int n; cin >> n;
    vector<int>v(n);
    for (int i = 0; i < n; ++i) {
        cin >> v[i];
    }
    convert(v);
    for (int i = 0; i < n; ++i) {
        cout << v[i] << " ";
    }
}`,
    },
  ],
  cheatSheet: [
    "sort \u2192 unique \u2192 lower_bound gives the rank.",
    "Compress queries together with array values if queries introduce new coordinates.",
  ],
};
