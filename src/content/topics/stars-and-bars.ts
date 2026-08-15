import type { TopicContent } from "../types";

export const starsAndBars: TopicContent = {
  quickSummary: [
    "Identical items into distinct bins, empties allowed: `n` stars and `k-1` bars in a row — `nCr(n + k - 1, k - 1)` arrangements.",
    "Every bin non-empty: hand each bin one item first, then distribute the remaining `n - k` freely — `nCr(n - 1, k - 1)`.",
    "Upper bounds need inclusion-exclusion: subtract the arrangements where a chosen bin overflows, by pre-spending `cap + 1` items into it.",
  ],
  detailed: [
    "The bijection is the whole idea. Write `n` identical stars in a row and insert `k - 1` identical bars among them; the bars cut the row into `k` ordered groups, and group `i` is the amount given to bin `i`. Any sequence of `n` stars and `k - 1` bars is a valid distribution and every distribution gives exactly one such sequence, so\n\n`#{ x1 + ... + xk = n, xi >= 0 } = nCr(n + k - 1, k - 1)`\n\nBins are **distinct** (positions in the row) and items are **identical** (stars carry no labels). Swap either assumption and this formula is wrong — labelled items into distinct bins is `k^n`, and identical items into identical bins is the integer-partition count, which has no closed form.\n\nCommon mistake: writing `nCr(n + k - 1, k)` instead of `nCr(n + k - 1, k - 1)`. They are not equal in general — count the *bars*, not the bins.",
    "## The positivity constraint\n\nRequiring `xi >= 1` costs `k` items up front. Give one to each bin, then distribute the remaining `n - k` with no constraint at all:\n\n`#{ x1 + ... + xk = n, xi >= 1 } = nCr(n - 1, k - 1)`\n\nThe same substitution handles any lower bounds: to force `xi >= Li`, replace `n` by `n - sum(Li)` and use the non-negative formula. If the shifted total goes negative, the answer is zero.\n\nFor example, distributing 7 identical candies among 3 distinct children gives `nCr(9, 2) = 36` ways with empties allowed, and `nCr(6, 2) = 15` ways when every child must get at least one.",
    "## Upper bounds via inclusion-exclusion\n\nCaps have no substitution trick, because `xi <= u` is not a shift. Instead treat \"bin `i` overflows\" as a bad property: forcing it means pre-spending `u_i + 1` items into that bin, after which the rest is unconstrained. Inclusion-exclusion over the set of overflowing bins gives\n\n`answer = sum over S of (-1)^|S| * nCr(n - sum_{i in S}(u_i + 1) + k - 1, k - 1)`\n\nwith any term whose top argument goes negative contributing zero. That is **O(2^k)** in general. When every cap is the same value `u`, the subsets of a given size are interchangeable and it collapses to a single loop:\n\n`answer = sum_{j=0}^{k} (-1)^j * nCr(k, j) * nCr(n - j*(u+1) + k - 1, k - 1)`\n\nwhich is **O(k) time** after an **O(maxN) factorial precompute**, with **O(maxN) space**.\n\nFor example, 7 candies among 3 children with at most 3 each: `36 - 3*nCr(5,2) + 0 = 36 - 30 = 6`, and the six are the permutations of `(1,3,3)` and `(2,2,3)`.\n\nIn practice: the `j` loop terminates early — once `j*(u+1) > n` every remaining term is zero, so the real cost is `min(k, n/(u+1)) + 1` binomials.",
    "## Common restatements\n\n| Problem phrasing | Formula |\n| --- | --- |\n| `x1+...+xk = n`, `xi >= 0` | `nCr(n+k-1, k-1)` |\n| `x1+...+xk = n`, `xi >= 1` | `nCr(n-1, k-1)` |\n| `x1+...+xk <= n`, `xi >= 0` | `nCr(n+k, k)` — add a slack bin |\n| Multisets of size `n` from `k` types | `nCr(n+k-1, k-1)` — same problem |\n| `xi >= Li` | shift `n` down by `sum Li` |\n| `xi <= u` (uniform) | alternating `nCr(k,j)` loop above |\n\nThe `<=` row is worth memorising: introducing a slack variable `x_{k+1} >= 0` turns an inequality into an equality with one extra bin.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Factorial tables, then the three basic counts — O(maxN) setup, O(1) per query",
      source: `#include <bits/stdc++.h>
using namespace std;

const long long MOD = 1000000007LL;
const int MAXF = 1000005;

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
    ifct[MAXF - 1] = power(fct[MAXF - 1], MOD - 2);
    for (int i = MAXF - 1; i > 0; --i) ifct[i - 1] = ifct[i] * i % MOD;
}

long long nCr(long long n, long long r) {
    if (r < 0 || n < 0 || r > n) return 0;          // guards every degenerate case
    return fct[n] * ifct[r] % MOD * ifct[n - r] % MOD;
}

// n identical items into k distinct bins, empty bins allowed.
long long barsNonNegative(long long n, long long k) { return nCr(n + k - 1, k - 1); }

// ... every bin non-empty: spend k items first, then distribute n - k freely.
long long barsPositive(long long n, long long k) {
    if (n < k) return 0;
    return nCr(n - 1, k - 1);
}

// x1 + ... + xk <= n  -->  add a slack bin and solve the equality with k+1 bins.
long long barsAtMost(long long n, long long k) { return nCr(n + k, k); }

int main() {
    buildFactorials();
    cout << barsNonNegative(7, 3) << "\\n";  // 36
    cout << barsPositive(7, 3) << "\\n";     // 15
    cout << barsAtMost(7, 3) << "\\n";       // 120
    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Uniform upper bound by inclusion-exclusion — O(k) time after the factorial precompute",
      source: `#include <bits/stdc++.h>
using namespace std;
// Reuses MOD, nCr() and buildFactorials() from the snippet above.

// #{ x1 + ... + xk = n : 0 <= xi <= u }
//   = sum_{j} (-1)^j * nCr(k, j) * nCr(n - j*(u+1) + k - 1, k - 1)
// j counts how many bins are FORCED to overflow; forcing one pre-spends u+1 items.
// Time O(k) (really O(min(k, n/(u+1)))).  Space O(1) beyond the factorial tables.
long long barsWithCap(long long n, long long k, long long u) {
    long long total = 0;
    for (long long j = 0; j <= k; ++j) {
        long long rest = n - j * (u + 1);
        if (rest < 0) break;                       // all later terms vanish too
        long long term = nCr(k, j) * nCr(rest + k - 1, k - 1) % MOD;
        total = (j & 1) ? (total - term + MOD) % MOD : (total + term) % MOD;
    }
    return total;
}

// barsWithCap(7, 3, 3) = 36 - 3*10 + 0 = 6
//   -> (1,3,3) (3,1,3) (3,3,1) (2,2,3) (2,3,2) (3,2,2)
// barsWithCap(7, 3, 7) = 36  (cap is not binding)
// barsWithCap(7, 3, 1) = 0   (3 bins * cap 1 cannot reach 7)`,
    },
  ],
  cheatSheet: [
    "`xi >= 0`: `nCr(n+k-1, k-1)`. `xi >= 1`: `nCr(n-1, k-1)`. Count the bars, not the bins.",
    "Sum `<= n`: add a slack bin → `nCr(n+k, k)`. Lower bounds `Li`: shift `n` down by `sum Li`.",
    "Uniform cap `u`: `sum_j (-1)^j nCr(k,j) nCr(n - j(u+1) + k - 1, k - 1)`. O(k) time.",
    "Distinct caps: full subset loop, O(2^k). Terms with a negative top argument are 0.",
    "Worked: 7 candies, 3 kids → 36 free, 15 all-positive, 6 with each `<= 3`.",
  ],
  interviewQA: [
    {
      q: "How many ways can you distribute n identical balls into k distinct boxes, and how does the answer change if no box may be empty?",
      a: "With empties allowed it is `nCr(n + k - 1, k - 1)`. The bijection: lay out `n` stars and insert `k - 1` bars; the bars cut the row into `k` ordered groups, so choosing which of the `n + k - 1` positions hold bars determines the distribution uniquely, and vice versa. If no box may be empty, I place one ball in each box up front — that is forced, so it costs no choices — and then distribute the remaining `n - k` balls with no restriction, giving `nCr(n - 1, k - 1)`, and zero if `n < k`. The two assumptions that make this work are that the balls are identical and the boxes are distinct; with labelled balls the answer would be `k^n`, and with identical boxes it becomes the partition function, which has no closed form. Complexity is O(1) per query after precomputing factorials and inverse factorials to the maximum `n + k` in O(maxN) time and space.",
      followUps: [
        "What if the total only has to be at most n?",
        "How do you handle a lower bound of 2 on one specific box?",
      ],
    },
    {
      q: "Now add an upper bound: each box holds at most u balls. How do you count that?",
      a: "Upper bounds cannot be absorbed by a substitution the way lower bounds can, so I use inclusion-exclusion on the set of boxes that violate their cap. Forcing box `i` to overflow means pre-placing `u + 1` balls in it; the remainder is then unconstrained, so a forced set of size `j` contributes `nCr(n - j*(u+1) + k - 1, k - 1)`. Since the caps are all equal, the `nCr(k, j)` ways to choose which boxes overflow all give the same count, and the answer collapses to `sum over j of (-1)^j * nCr(k,j) * nCr(n - j*(u+1) + k - 1, k - 1)`. I break the loop as soon as `n - j*(u+1)` goes negative because every later term is zero too, so it is O(k) time — really O(min(k, n/(u+1))) — after the O(maxN) factorial precompute. Checking it on a small case: 7 balls, 3 boxes, cap 3 gives `36 - 3*nCr(5,2) = 36 - 30 = 6`, and enumerating by hand gives the permutations of (1,3,3) and (2,2,3), which is 6. If the caps differed per box I'd fall back to the full `2^k` subset loop.",
      followUps: [
        "What if the caps are all different and k is 40?",
        "Can you get the same count with a DP instead, and when is that better?",
      ],
    },
  ],
  flashcards: [
    {
      front: "Stars and bars, the two base formulas",
      back: "`x1+...+xk = n` with `xi >= 0`: `nCr(n+k-1, k-1)`. With `xi >= 1`: `nCr(n-1, k-1)`. Items identical, bins distinct. O(1) per query after factorial precompute.",
    },
    {
      front: "Turning `x1+...+xk <= n` into an equality",
      back: "Add a slack variable `x_{k+1} >= 0` that absorbs the shortfall. The count becomes `nCr(n + k, k)` — `k+1` bins, so `k` bars.",
    },
    {
      front: "Uniform upper bound `xi <= u`",
      back: "`sum_j (-1)^j * nCr(k,j) * nCr(n - j*(u+1) + k - 1, k - 1)`. Forcing a bin to overflow pre-spends `u+1` items. Break when the remainder goes negative. O(k) time.",
    },
  ],
};
