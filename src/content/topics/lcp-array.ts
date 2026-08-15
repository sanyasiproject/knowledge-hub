import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const lcpArray: TopicContent = {
  quickSummary: [
    "Kasai's algorithm builds the LCP array from a suffix array in O(n) using the h \u2265 previous-h - 1 property.",
    "LCP + suffix array answer distinct substrings, repeats, and common substring problems.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 LCP Array (Kasai)",
      source: `#include<bits/stdc++.h>
using namespace std;

const int N = 100010;
int RA[N], tempRA[N];
int SA[N], tempSA[N];
int c[N];

void countingSort(int k, int n) {
    // up to 255 ASCII chars or length of n
    int i, sum, maxi = max(300, n);
    memset(c, 0, sizeof c);
    // count the frequency of each integer rank
    for (i = 0; i < n; i++)
        c[i + k < n ? RA[i + k] : 0]++;

    for (i = sum = 0; i < maxi; i++) {
        int t = c[i]; c[i] = sum; sum += t;
    }
    // shuffle the suffix array if necessary
    for (i = 0; i < n; i++)
        tempSA[c[SA[i] + k < n ? RA[SA[i] + k] : 0]++] = SA[i];

    for (i = 0; i < n; i++)
        SA[i] = tempSA[i];
}

void constructSA(string &s ) {
    int i, k, r;
    int n = s.size();
    // initial rankings
    for (i = 0; i < n; i++) RA[i] = s[i];
    // initial SA: {0, 1, 2, ..., n-1}
    for (i = 0; i < n; i++) SA[i] = i;
    // repeat sorting process log n times
    for (k = 1; k < n; k <<= 1) {
        // actually radix sort: sort based on the second item
        countingSort(k, n);
        // then (stable) sort based on the first item
        countingSort(0, n);
        // re-ranking; start from rank r = 0
        tempRA[SA[0]] = r = 0;
        // compare adjacent suffixes
        for (i = 1; i < n; i++)
            // if same pair => same rank r; otherwise, increase r
            tempRA[SA[i]] = (RA[SA[i]] == RA[SA[i - 1]] && RA[SA[i] + k] == RA[SA[i - 1] + k]) ? r : ++r;
        for (i = 0; i < n; i++)
            RA[i] = tempRA[i];
        // nice optimization trick
        if (RA[SA[n - 1]] == n - 1) break;
    }
}

vector<int> build_LCP(string &s) {
    int n = s.size();
    int rank[n + 1], h = 0;
    vector<int>LCP(n);
    for (int i = 0; i < n; i++)
        rank[SA[i]] = i;
    for (int i = 0; i < n; ++i) {
        if (rank[i] > 0) {
            int k = SA[rank[i] - 1];
            while (s[i + h] == s[k + h])h++;
            LCP[rank[i]] = h;
            if (h > 0)h--;
        }
    }
    return LCP;
}

int main() {
    string s; cin >> s;
    s += '$'; // add terminating character
    constructSA(s);

    std::vector<int> Lcp = build_LCP(s);
    for (int i = 0; i < Lcp.size(); ++i)
    {
        cout << Lcp[i] << " ";
    }
}`,
    },
  ],
  cheatSheet: [
    "Distinct substrings = n(n+1)/2 - \u03a3 lcp.",
    "Range-min over LCP gives LCP of any two suffixes.",
  ],
};
