import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const inversionCountBit: TopicContent = {
  quickSummary: [
    "Scan the array and, for each element, count already-seen elements greater than it using a Fenwick tree over (compressed) values.",
    "Total inversions = sum of those counts \u2014 O(n log n) versus O(n\u00b2) brute force.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 Inversion Count via BIT",
      source: `#include<bits/stdc++.h>
using namespace std;

class Fenwick {
public:
    int n;
    vector<int>bit;
    Fenwick(int a)
    {
        n = a;
        bit.resize(n + 1);
    }
    void update(int ind, int val)
    {
        for (; ind <= n; ind += (ind & (-ind)))
            bit[ind] += val;
    }

    int query(int ind)
    {
        int res = 0;
        for (; ind; ind -= (ind & (-ind)))
            res += bit[ind];
        return res;
    }

};

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

int inversion_count(vector<int>&arr) {
    int n = arr.size();
    int inv_count = 0;
    convert(arr);
    Fenwick fen(n + 1);
    for (int i = n - 1; i >= 0; i--) {
        inv_count += fen.query(arr[i] - 1);
        fen.update(arr[i], 1);
    }
    return inv_count;
}

signed main()
{
    int n; cin >> n;
    vector<int>v(n);
    for (int i = 0; i < n; ++i) {
        cin >> v[i];
    }
    cout << inversion_count(v);
}`,
    },
  ],
  cheatSheet: [
    "Also solvable by merge sort; BIT version is shorter and handles online variants.",
    "Compress values first if they exceed array bounds.",
  ],
};
