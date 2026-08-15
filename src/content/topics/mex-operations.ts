import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const mexOperations: TopicContent = {
  quickSummary: [
    "Maintains the MEX (smallest missing non-negative integer) of a multiset with inserts and erases using counts + an ordered set of absent values.",
    "Answering MEX becomes 'smallest value with count zero' \u2014 O(log n) per operation.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 MEX Operations",
      source: `#include<bits/stdc++.h>
using namespace std;

class mex {
public:
    set<int>st;
    map<int, int>freq;
    int n;
    mex(vector<int>&v) {
        n = v.size();
        for (int i = 0; i <= n; ++i)
        {
            st.insert(i);
        }
        for (int i = 0; i < n; ++i)
        {
            freq[v[i]]++;
            if (st.find(v[i]) != st.end()) {
                st.erase(v[i]);
            }
        }
    }

    int find() {
        return *(st.begin());
    }

    void insert(int val) {
        if (val >= 0 && val <= n) {
            if (freq[val] == 0) {
                st.erase(val);
            }
        }
        freq[val]++;
    }

    void remove(int val) {
        if (val >= 0 && val <= n) {
            if (freq[val] > 0) {
                freq[val]--;
                if (freq[val] == 0) {
                    st.insert(val);
                }
            }
        }
        else {
            if (freq[val] > 0)freq[val]--;
        }
    }

};

int main() {
    int n; cin >> n;
    vector<int>v(n);
    for (int i = 0; i < n; ++i)
    {
        cin >> v[i];
    }
    mex chk(v);
    // After every update find mex of the array;

    int q; cin >> q;
    while (q--) {
        int ind, val; cin >> ind >> val;
        ind--;
        chk.remove(v[ind]);
        v[ind] = val;
        chk.insert(v[ind]);
        cout << chk.find() << " ";
    }
}`,
    },
  ],
  cheatSheet: [
    "MEX \u2264 n for an array of n elements \u2014 never track values beyond that.",
    "Useful for Grundy numbers and constructive problems.",
  ],
};
