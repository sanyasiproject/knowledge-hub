import type { TopicContent } from "../types";

export const catalanNumbers: TopicContent = {
  quickSummary: [
    "`C(0) = 1`, `C(n+1) = sum over i of C(i)*C(n-i)` — split at the matching partner and multiply the two independent halves.",
    "Closed form `C(n) = nCr(2n, n) / (n+1)`, equivalently `nCr(2n, n) - nCr(2n, n+1)`. With precomputed factorials that is **O(1) per query**.",
    "One sequence, many disguises: balanced brackets, BST shapes, polygon triangulations, and lattice paths that stay under the diagonal.",
  ],
  detailed: [
    "The recurrence comes from a single structural choice. Take a balanced bracket string of `n+1` pairs. The opening bracket at position 0 has exactly one matching partner. Whatever sits *inside* that pair is itself a balanced string, say of `i` pairs, and whatever sits *after* it is balanced too, of `n-i` pairs. Those two parts are independent, so multiply their counts and sum over every legal split:\n\n`C(0) = 1`, `C(n+1) = C(0)*C(n) + C(1)*C(n-1) + ... + C(n)*C(0)`\n\nThe first values are `1, 1, 2, 5, 14, 42, 132, 429, 1430, 4862`. Evaluating this table is **O(n^2) time and O(n) space**.\n\nKey insight: every Catalan proof is the same proof — find the unique \"first return to the baseline\" and cut there. Inside and outside are smaller instances of the same problem.",
    "## Closed form and the reflection argument\n\nCount all monotonic lattice paths from `(0,0)` to `(n,n)` using right and up steps: there are `nCr(2n, n)` of them. A path is *bad* if it ever rises above the diagonal. Reflect a bad path across the line one step above the diagonal, starting from its first violating step: the endpoint moves from `(n,n)` to `(n-1, n+1)`, and the map is a bijection onto all paths to that new endpoint. So bad paths number `nCr(2n, n+1)`, and\n\n`C(n) = nCr(2n, n) - nCr(2n, n+1) = nCr(2n, n) / (n+1)`\n\nFor example, `C(3) = nCr(6,3)/4 = 20/4 = 5`, and the five bracket strings are `((()))`, `(()())`, `(())()`, `()(())`, `()()()`.\n\nWarning: `nCr(2n,n)/(n+1)` is an integer over the rationals, but under a modulus you cannot just divide — multiply by the modular inverse of `n+1`, or use the subtraction form which needs no division at all.",
    "## The family of things it counts\n\n| Object of size `n` | Why it is Catalan |\n| --- | --- |\n| Balanced bracket strings with `n` pairs | Split at the partner of the first `(` |\n| Shapes of a BST on `n` distinct keys | Choose the root; left and right subtrees are independent |\n| Triangulations of a convex `(n+2)`-gon | Fix one edge; its triangle splits the polygon in two |\n| Monotonic lattice paths under the diagonal | Reflection argument above |\n| Full binary trees with `n` internal nodes | Same root split as BST shapes |\n| Ways to fully parenthesise `n+1` factors | Choose the outermost multiplication |\n\nAll of them decompose into two independent sub-instances whose sizes sum to `n-1`, which is precisely the convolution in the recurrence.\n\nIn practice: if a counting problem reduces to \"a sequence of +1 and -1 steps whose running sum never goes negative and ends at zero\", the answer is Catalan before you finish reading the statement.",
    "## Ballot-style generalisations\n\nPaths from `(0,0)` to `(a,b)` with `a >= b` that never rise above the diagonal number `((a-b+1)/(a+1)) * nCr(a+b, b)` — the *ballot numbers*, of which Catalan is the `a = b` case. Bracket sequences with `n` pairs of which `k` are already fixed open follow the same reflection surgery: subtract the reflected count with a shifted endpoint.\n\nGrowth is roughly `4^n / (n^1.5 * sqrt(pi))`, so `C(n)` overflows a signed 64-bit integer around `n = 33`. Anything larger needs a modulus or big integers.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Catalan numbers mod p from precomputed factorials — O(maxN) setup, O(1) per query",
      source: `#include <bits/stdc++.h>
using namespace std;

const long long MOD = 1000000007LL;
const int MAXF = 400005;           // must reach 2*n for C(n)

long long fct[MAXF], ifct[MAXF];

long long power(long long b, long long e) {
    long long r = 1 % MOD;
    b %= MOD;
    while (e > 0) {
        if (e & 1) r = r * b % MOD;
        b = b * b % MOD;
        e >>= 1;
    }
    return r;
}

void buildFactorials() {
    fct[0] = 1;
    for (int i = 1; i < MAXF; ++i) fct[i] = fct[i - 1] * i % MOD;
    ifct[MAXF - 1] = power(fct[MAXF - 1], MOD - 2);   // one inverse only
    for (int i = MAXF - 1; i > 0; --i) ifct[i - 1] = ifct[i] * i % MOD;
}

long long nCr(long long n, long long r) {
    if (r < 0 || r > n || n < 0) return 0;
    return fct[n] * ifct[r] % MOD * ifct[n - r] % MOD;
}

// C(n) = nCr(2n, n) - nCr(2n, n+1).  No modular division needed.
long long catalan(long long n) {
    return (nCr(2 * n, n) - nCr(2 * n, n + 1) + MOD) % MOD;
}

int main() {
    buildFactorials();
    for (int n = 0; n <= 9; ++n) cout << catalan(n) << " ";
    cout << "\\n";                 // 1 1 2 5 14 42 132 429 1430 4862
    cout << catalan(3) << "\\n";   // 5 -- the five bracket strings of 3 pairs
    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Convolution recurrence — O(n^2) time, O(n) space, useful when the split itself is weighted",
      source: `#include <bits/stdc++.h>
using namespace std;

const long long MOD = 1000000007LL;

// C[0] = 1;  C[k+1] = sum_{i=0..k} C[i] * C[k-i]
// Slower than the closed form, but this is the shape you adapt when each
// split carries an extra cost (weighted trees, restricted triangulations).
vector<long long> catalanTable(int n) {
    vector<long long> C(n + 1, 0);
    C[0] = 1;
    for (int k = 0; k < n; ++k) {
        long long s = 0;
        for (int i = 0; i <= k; ++i) s = (s + C[i] * C[k - i]) % MOD;
        C[k + 1] = s;
    }
    return C;
}

int main() {
    vector<long long> C = catalanTable(9);
    for (long long v : C) cout << v << " ";
    cout << "\\n";                 // 1 1 2 5 14 42 132 429 1430 4862
    return 0;
}`,
    },
  ],
  cheatSheet: [
    "`C(n) = nCr(2n,n)/(n+1) = nCr(2n,n) - nCr(2n,n+1)`. Second form avoids modular division.",
    "Recurrence `C(n+1) = sum C(i)*C(n-i)` — O(n^2) time, O(n) space.",
    "Closed form with factorial tables — O(maxN) precompute, O(1) per query, O(maxN) space.",
    "First terms: `1, 1, 2, 5, 14, 42, 132, 429, 1430, 4862`. Overflows int64 near `n = 33`.",
    "Counts: balanced brackets, BST shapes, `(n+2)`-gon triangulations, sub-diagonal lattice paths.",
  ],
  interviewQA: [
    {
      q: "How many distinct binary search tree *shapes* exist on n distinct keys, and how do you derive it?",
      a: "It is the nth Catalan number. The derivation is a root choice: sort the keys, then pick which one is the root. If the root is the `(i+1)`th smallest, exactly `i` keys must land in the left subtree and `n-1-i` in the right, and because BST order is forced there is no further choice about *which* keys go where — only about the shapes of the two subtrees. Those shapes are independent, so the count is `f(i) * f(n-1-i)`, and summing over every root gives `f(n) = sum over i of f(i)*f(n-1-i)` with `f(0) = 1`. That is exactly the Catalan convolution, so `f(n) = nCr(2n,n)/(n+1)`. For n = 3 it gives 5. If I need it once, I evaluate the O(n^2) table; if I need many queries under a modulus I precompute factorials and inverse factorials in O(maxN) and answer each in O(1), using the subtraction form `nCr(2n,n) - nCr(2n,n+1)` so I never divide by `n+1` modularly.",
      followUps: [
        "How does the answer change if the keys are not distinct?",
        "What if you also count the labelling, not just the shape?",
      ],
    },
    {
      q: "Count strings of n opening and n closing brackets that are balanced. Why is it not just nCr(2n, n)?",
      a: "`nCr(2n,n)` counts all arrangements of the multiset, including illegal ones like `)(`. The constraint is that every prefix must have at least as many opens as closes — a lattice path that never rises above the diagonal. I count the bad paths by reflection: take the first prefix where closes exceed opens, and flip every bracket from that point onward. This maps bad strings bijectively onto all arrangements with `n-1` opens and `n+1` closes, of which there are `nCr(2n, n+1)`. So the answer is `nCr(2n,n) - nCr(2n,n+1)`, which simplifies to `nCr(2n,n)/(n+1)`, the nth Catalan number. For n = 3 that is 20 - 15 = 5. Complexity is O(1) per query after O(n) factorial precomputation, O(n) space. I'd add that the reflection is the reusable part — the same surgery handles unbalanced endpoints and partially fixed prefixes.",
      followUps: [
        "How would you count balanced strings with two different bracket types?",
        "Generate the kth balanced string in lexicographic order.",
      ],
    },
  ],
  flashcards: [
    {
      front: "Catalan recurrence and closed form",
      back: "`C(0)=1`, `C(n+1) = sum_i C(i)*C(n-i)`. Closed: `C(n) = nCr(2n,n)/(n+1) = nCr(2n,n) - nCr(2n,n+1)`. O(n^2) table, or O(1) per query after factorial precompute.",
    },
    {
      front: "Name four things the nth Catalan number counts",
      back: "Balanced bracket strings with n pairs; BST/full-binary-tree shapes on n nodes; triangulations of a convex (n+2)-gon; monotonic lattice paths (0,0)→(n,n) staying under the diagonal.",
    },
    {
      front: "Why use `nCr(2n,n) - nCr(2n,n+1)` instead of dividing by n+1?",
      back: "Under a modulus, division needs the modular inverse of `n+1`. The subtraction form is exactly equal and uses only precomputed factorials — no inverse, no risk when `n+1` shares a factor with a composite modulus.",
    },
  ],
};
