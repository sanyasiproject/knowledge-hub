import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const xorBasis: TopicContent = {
  quickSummary: [
    "Maintains a linear basis over GF(2): insert numbers, then answer max-XOR subset, representability, and count of distinct XORs.",
    "At most 60 basis vectors regardless of input size.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 XOR Linear Basis",
      source: `#include<bits/stdc++.h>
using namespace std;
const int d = 31;
int basis[d]; // basis[i] keeps the mask of the vector whose f value is i

int sz; // Current size of the basis

void insertVector(int mask) {
    for (int i = d - 1; i >= 0; i--) {
        if ((mask & 1 << i) == 0) continue; // continue if i != f(mask)

        if (!basis[i]) { // If there is no basis vector with the i'th bit set, then insert this vector into the basis
            basis[i] = mask;
            ++sz;

            return;
        }

        mask ^= basis[i]; // Otherwise subtract the basis vector from this vector
    }
}

int main() {
    int n; cin >> n;
    for (int i = 0; i < n; ++i)
    {
        int a; cin >> a;
        insertVector(a);
    }
    int distinct_xor = (1 << sz);
    int max_xor = 0;
    for (int i = d - 1; i >= 0; i--) {
        if (!basis[i]) continue;

        if (max_xor & 1 << i) continue;

        max_xor ^= basis[i];
    }
    cout << distinct_xor << endl; //number of distinct integers that can be represented using xor over the set of the given elements.
    cout << max_xor << endl;  //maximum possible xor of the elements of some subset.
}`,
    },
  ],
  cheatSheet: [
    "Max subset XOR: greedily take basis vectors from the top bit.",
    "Distinct XOR values = 2^(basis size).",
  ],
};
