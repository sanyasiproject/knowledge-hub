import type { TopicContent } from "../types";

export const derangements: TopicContent = {
  quickSummary: [
    "A derangement is a permutation with **no fixed point** — nobody gets their own hat back. Written `!n` or `D(n)`.",
    "Two recurrences: `D(n) = (n-1) * (D(n-1) + D(n-2))` from a structural case split, and `D(n) = n*D(n-1) + (-1)^n` as a one-term shortcut. Both are **O(n) time, O(n) space**.",
    "Inclusion-exclusion gives `D(n) = n! * sum_{i=0}^{n} (-1)^i / i!`, so `D(n) ≈ n!/e` and the ratio `D(n)/n!` converges to `1/e ≈ 0.3679` almost immediately.",
  ],
  detailed: [
    "Start from inclusion-exclusion, because it explains the constant. Let `A_i` be the permutations fixing element `i`. Forcing a set of `j` specific elements to be fixed leaves `(n-j)!` arrangements for the rest, and there are `nCr(n,j)` such sets, so\n\n`D(n) = sum_{j=0}^{n} (-1)^j * nCr(n,j) * (n-j)! = n! * sum_{j=0}^{n} (-1)^j / j!`\n\nThe inner sum is the truncated series for `e^-1`, which is why `D(n)/n!` sits at `1/e`. The truncation error is under `1/(n+1)!`, so for every `n >= 1` the exact value is `round(n!/e)`.\n\nFirst values: `D(0)=1, D(1)=0, D(2)=1, D(3)=2, D(4)=9, D(5)=44, D(6)=265, D(7)=1854`.\n\nFor example, `D(4) = 24 * (1 - 1 + 1/2 - 1/6 + 1/24) = 24 * 9/24 = 9`, and `24/e = 8.829`, which rounds to 9.",
    "## The structural recurrence\n\nBuild a derangement of `n` elements by deciding where element 1 goes. It has `n - 1` choices, say position `k`. Now split on what happens to element `k`:\n\n- Element `k` maps to position 1 — the two swap, and the remaining `n - 2` elements must be deranged among themselves: `D(n-2)` ways.\n- Element `k` does *not* map to position 1 — then `k` behaves exactly like an element forbidden from one specific position, so the remaining `n - 1` elements form a derangement of size `n - 1`: `D(n-1)` ways.\n\nMultiplying by the `n - 1` choices gives `D(n) = (n-1)*(D(n-1) + D(n-2))` with `D(0) = 1`, `D(1) = 0`. Telescoping this yields the cheaper `D(n) = n*D(n-1) + (-1)^n`, which is what I actually type under a modulus.\n\nKey insight: `(-1)^n` under a modulus is `MOD - 1` for odd `n`, not `-1`. Add `MOD` before reducing or the table goes negative and every later term is wrong.",
    "## Partial derangements — exactly k fixed points\n\nChoose which `k` elements stay put, then derange the rest:\n\n`E(n, k) = nCr(n, k) * D(n - k)`\n\nSumming `E(n,k)` over all `k` returns `n!`, which is a free correctness check on any implementation.\n\nFor example, permutations of 5 elements with exactly 2 fixed points: `nCr(5,2) * D(3) = 10 * 2 = 20`. And the full row for `n = 4` is `9, 8, 6, 0, 1` for `k = 0..4`, summing to 24 — note `k = 3` is 0, since fixing three of four forces the fourth.\n\nWith factorials and a derangement table both precomputed, each query is **O(1)** in **O(n) space**.",
    "## Where it shows up\n\nThe hat-check and secret-santa framings are the obvious ones, but the reusable pattern is *counting permutations that avoid a forbidden set of positions*. Derangements are the case where the forbidden set is the diagonal. Generalisations:\n\n- **Forbidden positions given as a bipartite graph**: use the permanent / rook polynomial, or bitmask DP in `O(2^n * n)` for small `n`.\n- **Two forbidden positions each** (the *menage*-style problems): same inclusion-exclusion skeleton with a different intersection count.\n\nWarning: the `round(n!/e)` shortcut is exact mathematically but useless in code past `n = 20` — `double` loses integer precision long before `n!` needs a modulus. Use the recurrence.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Derangement table plus exactly-k-fixed-points — O(n) precompute, O(1) per query",
      source: `#include <bits/stdc++.h>
using namespace std;

const long long MOD = 1000000007LL;
const int MAXN = 1000005;

long long der[MAXN], fct[MAXN], ifct[MAXN];

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

void build() {
    fct[0] = 1;
    for (int i = 1; i < MAXN; ++i) fct[i] = fct[i - 1] * i % MOD;
    ifct[MAXN - 1] = power(fct[MAXN - 1], MOD - 2);
    for (int i = MAXN - 1; i > 0; --i) ifct[i - 1] = ifct[i] * i % MOD;

    // D(n) = n*D(n-1) + (-1)^n.  Under a modulus the -1 must become MOD-1.
    der[0] = 1;
    der[1] = 0;
    for (int i = 2; i < MAXN; ++i) {
        long long sign = (i & 1) ? MOD - 1 : 1;
        der[i] = (der[i - 1] * i + sign) % MOD;
    }
}

long long nCr(long long n, long long r) {
    if (r < 0 || n < 0 || r > n) return 0;
    return fct[n] * ifct[r] % MOD * ifct[n - r] % MOD;
}

// Permutations of n elements with EXACTLY k fixed points.
long long exactlyKFixed(int n, int k) {
    if (k < 0 || k > n) return 0;
    return nCr(n, k) * der[n - k] % MOD;
}

int main() {
    build();
    for (int i = 0; i <= 7; ++i) cout << der[i] << " ";
    cout << "\\n";                             // 1 0 1 2 9 44 265 1854
    cout << exactlyKFixed(5, 2) << "\\n";      // 20 = nCr(5,2) * D(3) = 10 * 2

    long long check = 0;                       // sum over k of E(4,k) must be 4! = 24
    for (int k = 0; k <= 4; ++k) { cout << exactlyKFixed(4, k) << " "; check += exactlyKFixed(4, k); }
    cout << "-> " << check << "\\n";           // 9 8 6 0 1 -> 24
    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "The structural recurrence, and the n!/e check for small n",
      source: `#include <bits/stdc++.h>
using namespace std;

// D(n) = (n-1) * (D(n-1) + D(n-2)),  D(0) = 1, D(1) = 0.
// Element 1 picks one of n-1 targets k; then either k swaps back (D(n-2))
// or it does not, which is a size-(n-1) derangement (D(n-1)).
// Time O(n).  Space O(n) -- or O(1) if you roll two variables.
vector<long long> derangementTable(int n) {
    vector<long long> d(max(n + 1, 2));
    d[0] = 1;
    d[1] = 0;
    for (int i = 2; i <= n; ++i) d[i] = (long long)(i - 1) * (d[i - 1] + d[i - 2]);
    d.resize(n + 1);
    return d;
}

int main() {
    vector<long long> d = derangementTable(12);
    for (int i = 0; i <= 7; ++i) cout << d[i] << " ";
    cout << "\\n";                                  // 1 0 1 2 9 44 265 1854

    // D(n) == round(n!/e) for every n >= 1 -- only usable while doubles stay exact.
    double f = 1.0;
    for (int n = 1; n <= 12; ++n) {
        f *= n;
        long long approx = llround(f / M_E);
        cout << n << ": exact=" << d[n] << " round(n!/e)=" << approx
             << (approx == d[n] ? " ok" : " MISMATCH") << "\\n";
    }
    return 0;
}`,
    },
  ],
  cheatSheet: [
    "`D(n) = (n-1)*(D(n-1) + D(n-2))`, `D(0)=1`, `D(1)=0`. Shortcut: `D(n) = n*D(n-1) + (-1)^n`.",
    "`D(n) = n! * sum_{i<=n} (-1)^i/i!` = `round(n!/e)` for `n >= 1`. Ratio `D(n)/n! -> 1/e ≈ 0.368`.",
    "First terms: `1, 0, 1, 2, 9, 44, 265, 1854`. O(n) time and space to build, O(1) per lookup.",
    "Exactly `k` fixed points: `nCr(n,k) * D(n-k)`. Summing over `k` must give `n!`.",
    "Under a modulus write `(-1)^n` as `MOD-1` for odd `n` — a raw `-1` poisons the whole table.",
  ],
  interviewQA: [
    {
      q: "n people each drop a hat into a box and take one at random. How many outcomes leave nobody with their own hat, and what is the probability?",
      a: "That count is the derangement number `D(n)`. I derive it by inclusion-exclusion: let `A_i` be the outcomes where person `i` gets their own hat. Forcing any specific `j` people to be correct leaves `(n-j)!` ways to arrange the rest, and there are `nCr(n,j)` such sets, so `D(n) = sum over j of (-1)^j * nCr(n,j) * (n-j)!`, which simplifies to `n! * sum over j of (-1)^j / j!`. The probability is therefore that alternating sum, which is the truncated series for `1/e` — so it converges to about 0.3679 and is accurate to three decimals by n = 6. The counterintuitive part is that the probability is essentially independent of n. For computing it I use the recurrence `D(n) = n*D(n-1) + (-1)^n` with `D(0) = 1`, giving 1, 0, 1, 2, 9, 44, 265 — O(n) time and O(n) space for a table, O(1) space if I only need the last value. Under a modulus I write the `-1` as `MOD - 1`, otherwise the table goes negative.",
      followUps: [
        "Why is the probability almost constant in n?",
        "What is the expected number of people who do get their own hat?",
      ],
    },
    {
      q: "Count permutations of n elements with exactly k fixed points.",
      a: "Split the decision in two independent parts: choose which `k` elements are fixed, then make sure none of the remaining `n - k` are. The first is `nCr(n,k)` and the second is `D(n-k)`, so the answer is `nCr(n,k) * D(n-k)`. The reason `D` appears rather than `(n-k)!` is that 'exactly k' forbids the leftover elements from also being fixed — using `(n-k)!` would count 'at least k' instead, which is the classic error here. A concrete check: for n = 5, k = 2, that is `10 * D(3) = 10 * 2 = 20`. A good sanity test on any implementation is that summing over all k must return `n!`; for n = 4 the row is 9, 8, 6, 0, 1 and it sums to 24, and the zero at k = 3 makes sense because fixing three of four elements forces the fourth. With factorials, inverse factorials and the derangement table all precomputed in O(n) time and O(n) space, each query is O(1).",
      followUps: [
        "What is the expected number of fixed points in a random permutation?",
        "How would you count permutations avoiding an arbitrary set of forbidden positions?",
      ],
    },
  ],
  flashcards: [
    {
      front: "Derangement recurrences",
      back: "`D(n) = (n-1)*(D(n-1)+D(n-2))` with `D(0)=1, D(1)=0`; equivalently `D(n) = n*D(n-1) + (-1)^n`. O(n) time and space; values 1, 0, 1, 2, 9, 44, 265, 1854.",
    },
    {
      front: "Why is `D(n)/n!` close to `1/e`?",
      back: "Inclusion-exclusion gives `D(n) = n! * sum_{i=0}^{n} (-1)^i/i!`, the truncated series for `e^-1`. The error is under `1/(n+1)!`, so `D(n) = round(n!/e)` exactly for all `n >= 1`.",
    },
    {
      front: "Permutations with exactly k fixed points",
      back: "`nCr(n,k) * D(n-k)` — choose the fixed ones, derange the rest. Using `(n-k)!` instead counts *at least* k. Summing over k returns `n!`.",
    },
  ],
};
