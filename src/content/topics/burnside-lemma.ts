import type { TopicContent } from "../types";

export const burnsideLemma: TopicContent = {
  quickSummary: [
    "Number of distinct configurations up to symmetry = **the average number of configurations left unchanged** by a symmetry: `orbits = (1/|G|) * sum over g in G of |Fix(g)|`.",
    "Necklaces (`n` beads, `k` colours, rotations only): `(1/n) * sum_{i=0}^{n-1} k^gcd(i,n)` — a rotation by `i` forces beads in the same cycle to match, and there are exactly `gcd(i,n)` cycles.",
    "Bracelets add reflections, so `|G| = 2n`: for odd `n` each of the `n` reflections fixes `k^((n+1)/2)`; for even `n`, `n/2` of them fix `k^(n/2+1)` and `n/2` fix `k^(n/2)`.",
  ],
  detailed: [
    "The lemma trades a hard question for an easy one. Counting distinct objects up to symmetry means counting *orbits* of a group `G` acting on a set of raw configurations — hard, because you must decide when two raw objects are the same. Burnside says instead: for each symmetry `g`, count how many raw configurations `g` leaves untouched, and average.\n\n`#orbits = (1/|G|) * sum over g in G of |Fix(g)|`\n\nThe proof is a double count of the pairs `(g, x)` with `g` fixing `x`. Summing by `g` gives the right-hand side; summing by `x` gives `sum over x of |Stab(x)|`, and the orbit-stabiliser theorem says every `x` in an orbit of size `m` has a stabiliser of size `|G|/m`, so each orbit contributes exactly `|G|`.\n\nKey insight: the identity element always fixes everything, so its term is the raw unconstrained count — Burnside is that number, corrected downward by the other symmetries.",
    "## Necklaces: rotations only\n\nColour `n` beads in a circle with `k` colours; two colourings are the same if one rotates into the other. The group is the `n` rotations. A rotation by `i` positions decomposes the beads into cycles, and a colouring is fixed exactly when every cycle is monochromatic — so `|Fix(rot_i)| = k^(number of cycles)`. That count is `gcd(i, n)`, giving\n\n`N(n,k) = (1/n) * sum_{i=0}^{n-1} k^gcd(i,n)`\n\nGrouping equal gcds turns it into the divisor form `(1/n) * sum over d | n of phi(n/d) * k^d`.\n\nFor example, `n = 4` beads and `k = 3` colours: the gcds are `4, 1, 2, 1`, so the fixed counts are `81, 3, 9, 3`, summing to 96, and `96 / 4 = 24` distinct necklaces.\n\nComplexity of the direct loop is **O(n log n)** — `n` terms, each a `gcd` plus a fast power — with **O(1) extra space**. The divisor form is `O(sqrt(n) + d(n) * log n)` once you can evaluate `phi`.",
    "## Bracelets: add the reflections\n\nIf flipping the necklace over is also allowed, the group is the dihedral group of order `2n`. The `n` rotation terms are unchanged; the `n` reflections split by parity of `n`:\n\n| `n` | Reflection axes | Cycles | Fixed colourings each |\n| --- | --- | --- | --- |\n| odd | `n` axes, each through one bead and the opposite edge midpoint | `(n+1)/2` | `k^((n+1)/2)` |\n| even | `n/2` axes through two opposite beads | `n/2 + 1` | `k^(n/2 + 1)` |\n| even | `n/2` axes through two opposite edge midpoints | `n/2` | `k^(n/2)` |\n\nContinuing the `n = 4`, `k = 3` example: two bead-axes fix `3^3 = 27` each and two edge-axes fix `3^2 = 9` each, so the reflections add `54 + 18 = 72`. Total `(96 + 72) / 8 = 21` bracelets — three fewer than the 24 necklaces, which are the chiral pairs that a flip identifies.\n\nCommon mistake: dividing by `n` instead of `2n` after adding reflection terms, or reusing the odd-`n` reflection formula when `n` is even. Both give a number that is close enough to look plausible and is wrong.",
    "## Doing the division under a modulus\n\nThe `1/|G|` is exact over the integers — the sum is always divisible by `|G|` — but under a modulus you must multiply by the modular inverse of `|G|`. With a prime modulus larger than `|G|` that inverse always exists, so `power(n, MOD-2)` (or `power(2n, MOD-2)`) is safe.\n\nIn practice: verify any Burnside implementation on tiny inputs where you can enumerate by hand — `n = 4, k = 2` gives 6 necklaces and 6 bracelets, and `n = 6, k = 2` gives 14 and 13. If the 6-bead pair does not come out 14 and 13, the reflection split is wrong.\n\nWhen each symmetry's fixed count depends on more than a bead count — say colours have usage quotas — Burnside still applies but `|Fix(g)|` becomes a multinomial per cycle structure; that refinement is Polya enumeration.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Necklaces and bracelets mod p — O(n log n) time, O(1) extra space",
      source: `#include <bits/stdc++.h>
using namespace std;

const long long MOD = 1000000007LL;

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

long long inverse(long long a) { return power(a, MOD - 2); }   // MOD is prime

long long gcdll(long long a, long long b) { return b ? gcdll(b, a % b) : a; }

// Necklaces: n beads, k colours, ROTATIONS only.  |G| = n.
// Rotation by i splits the circle into gcd(i, n) cycles; each must be one colour.
// Time O(n log n).  Space O(1).
long long necklaces(long long n, long long k) {
    long long sum = 0;
    for (long long i = 0; i < n; ++i)
        sum = (sum + power(k % MOD, gcdll(i, n))) % MOD;
    return sum % MOD * inverse(n % MOD) % MOD;
}

// Bracelets: rotations AND reflections.  |G| = 2n.
long long bracelets(long long n, long long k) {
    long long sum = 0;
    for (long long i = 0; i < n; ++i)                       // the n rotations
        sum = (sum + power(k % MOD, gcdll(i, n))) % MOD;

    if (n & 1) {                                            // n axes, (n+1)/2 cycles each
        sum = (sum + n % MOD * power(k % MOD, (n + 1) / 2)) % MOD;
    } else {                                                // two different axis kinds
        sum = (sum + (n / 2) % MOD * power(k % MOD, n / 2 + 1)) % MOD;  // through beads
        sum = (sum + (n / 2) % MOD * power(k % MOD, n / 2)) % MOD;      // through edges
    }
    return sum % MOD * inverse(2 * n % MOD) % MOD;
}

int main() {
    cout << necklaces(4, 3) << " " << bracelets(4, 3) << "\\n";  // 24 21
    cout << necklaces(4, 2) << " " << bracelets(4, 2) << "\\n";  // 6 6
    cout << necklaces(6, 2) << " " << bracelets(6, 2) << "\\n";  // 14 13
    cout << necklaces(3, 3) << " " << bracelets(3, 3) << "\\n";  // 11 10
    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Divisor form with Euler's phi — O(sqrt(n) * log n), for n far beyond the direct loop",
      source: `#include <bits/stdc++.h>
using namespace std;
// Reuses MOD, power() and inverse() from the snippet above.

long long phi(long long m) {                 // O(sqrt(m)) trial division
    long long res = m;
    for (long long p = 2; p * p <= m; ++p)
        if (m % p == 0) { while (m % p == 0) m /= p; res -= res / p; }
    if (m > 1) res -= res / m;
    return res;
}

// Grouping the n rotations by gcd: exactly phi(n/d) of them have gcd d with n.
//   necklaces = (1/n) * sum over d | n of phi(n/d) * k^d
// Time O(sqrt(n) * log n).  Space O(1).  Works for n up to ~1e12.
long long necklacesFast(long long n, long long k) {
    long long sum = 0;
    for (long long d = 1; d * d <= n; ++d) {
        if (n % d) continue;
        sum = (sum + phi(n / d) % MOD * power(k % MOD, d)) % MOD;
        long long e = n / d;
        if (e != d) sum = (sum + phi(n / e) % MOD * power(k % MOD, e)) % MOD;
    }
    return sum * inverse(n % MOD) % MOD;
}

// necklacesFast(4, 3)  = 24   -- matches the O(n) loop
// necklacesFast(6, 2)  = 14
// n = 4, k = 3 by hand: gcd(i,4) = 4,1,2,1 -> 81 + 3 + 9 + 3 = 96, and 96/4 = 24.`,
    },
  ],
  cheatSheet: [
    "Burnside: `orbits = (1/|G|) * sum over g of |Fix(g)|`. The identity term is the raw count.",
    "Necklaces (rotations, `|G| = n`): `(1/n) * sum_{i<n} k^gcd(i,n)` = `(1/n) * sum_{d|n} phi(n/d) k^d`.",
    "Bracelets (`|G| = 2n`): add `n * k^((n+1)/2)` for odd `n`; `(n/2)(k^(n/2+1) + k^(n/2))` for even `n`.",
    "Direct loop O(n log n), O(1) space; divisor form O(sqrt(n) log n) and fine for `n ~ 1e12`.",
    "Worked: `n=4, k=3` → rotations `81+3+9+3=96` → 24 necklaces; `+72` reflections → 21 bracelets.",
  ],
  interviewQA: [
    {
      q: "Count the distinct necklaces of n beads using k colours, where rotations are considered identical. Derive it.",
      a: "This is an orbit count under the rotation group, so I use Burnside: the number of orbits equals the average number of colourings fixed by a group element. There are `n` rotations. Rotating by `i` positions permutes the beads, and that permutation decomposes into `gcd(i, n)` cycles each of length `n/gcd(i,n)`. A colouring is unchanged by the rotation exactly when every bead in a cycle has the same colour, so each cycle can be coloured freely and independently — `k^gcd(i,n)` fixed colourings. Averaging gives `(1/n) * sum over i from 0 to n-1 of k^gcd(i,n)`. Grouping the terms by the value of the gcd gives the equivalent divisor form `(1/n) * sum over d | n of phi(n/d) * k^d`. Sanity check with n = 4, k = 3: the gcds are 4, 1, 2, 1, so the terms are 81, 3, 9, 3, summing to 96, and 96/4 = 24 necklaces. The direct loop is O(n log n) time and O(1) space; the divisor form is O(sqrt(n) log n), which is what I'd use for large n. Under a modulus the division by n becomes multiplication by `power(n, MOD-2)`.",
      followUps: [
        "Now allow flipping the necklace over.",
        "What changes if you must use each colour a fixed number of times?",
      ],
    },
    {
      q: "How does the answer change when reflections are also allowed, and where do people get it wrong?",
      a: "The group grows from the `n` rotations to the dihedral group of order `2n`, so I keep all the rotation terms, add `n` reflection terms, and divide by `2n` rather than `n`. The reflection terms depend on the parity of n. If n is odd, every axis passes through one bead and the midpoint of the opposite edge, giving one fixed point and `(n-1)/2` swapped pairs, so `(n+1)/2` cycles and `k^((n+1)/2)` fixed colourings, for all n axes. If n is even there are two kinds of axis: `n/2` pass through two opposite beads, giving `n/2 + 1` cycles, and `n/2` pass through two opposite edge midpoints, giving `n/2` cycles. The two classic errors are forgetting to change the divisor to `2n`, and applying the odd formula uniformly when n is even — both produce plausible-looking wrong numbers, so I always check a small case I can enumerate. For n = 4, k = 3: rotations give 96, reflections give `2*27 + 2*9 = 72`, and `168/8 = 21` bracelets versus 24 necklaces. The three lost are chiral pairs that a flip merges.",
      followUps: [
        "Why is the sum always divisible by |G|?",
        "How would you extend this to colour counts with quotas?",
      ],
    },
  ],
  flashcards: [
    {
      front: "Burnside's lemma",
      back: "`#orbits = (1/|G|) * sum over g in G of |Fix(g)|` — the number of distinct objects up to symmetry is the *average* number fixed by a symmetry. Proof: double-count pairs `(g, x)` with `g·x = x`.",
    },
    {
      front: "Necklace count (rotations only)",
      back: "`(1/n) * sum_{i=0}^{n-1} k^gcd(i,n)`, because rotation by `i` makes `gcd(i,n)` cycles that each must be monochromatic. Divisor form: `(1/n) * sum_{d|n} phi(n/d) k^d`. O(n log n) or O(sqrt(n) log n).",
    },
    {
      front: "Bracelet reflection terms",
      back: "`|G| = 2n`. Odd `n`: `n` axes each fixing `k^((n+1)/2)`. Even `n`: `n/2` bead-axes fixing `k^(n/2+1)` plus `n/2` edge-axes fixing `k^(n/2)`. Divide the whole sum by `2n`, not `n`.",
    },
  ],
};
