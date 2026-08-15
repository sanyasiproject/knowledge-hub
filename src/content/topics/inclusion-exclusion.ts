import type { TopicContent } from "../types";

export const inclusionExclusion: TopicContent = {
  quickSummary: [
    "Add the singles, subtract the pairs, add the triples: `|A ∪ B ∪ C| = |A|+|B|+|C| - |A∩B| - |A∩C| - |B∩C| + |A∩B∩C|`. The sign is `(-1)^(|S|+1)`.",
    "Complement form is the one you actually code: items satisfying *none* of `k` constraints = `sum over subsets S of (-1)^|S| * count(S)`. Iterate `mask` from `0` to `2^k - 1`; the sign is the parity of `popcount(mask)`.",
    "Mobius inversion is inclusion-exclusion wearing a number-theory hat — `mu(d)` *is* the `(-1)^|S|` sign over the distinct prime factors of `d`.",
  ],
  detailed: [
    "Every element is counted with net weight exactly one. Take an element that satisfies exactly `t` of the constraints. It appears in `nCr(t, j)` of the `j`-element intersections, so the alternating sum counts it `sum over j of (-1)^j * nCr(t,j)` times, which is `(1-1)^t` — zero when `t > 0`, one when `t = 0`. That single line is the whole proof, and it is also why the signs must alternate rather than being some other pattern.\n\nThe practical form for \"count things that avoid all bad properties\":\n\n`answer = sum over S subset of {1..k} of (-1)^|S| * count(items satisfying every constraint in S)`\n\nThe empty subset contributes the total with a `+` sign, and everything else corrects it.",
    "## Subset iteration in code\n\nWith `k` constraints, loop `mask` over `[0, 2^k)`. Bits of `mask` select which constraints are forced. The sign is `+1` when `popcount(mask)` is even and `-1` when odd. Complexity is **O(2^k * f)** where `f` is the cost of evaluating one intersection, and **O(k) space** for the constraint list.\n\nFor example, count integers in `[1, 100]` divisible by none of `2, 3, 5`. Forced intersections are just divisibility by the product: `100 - (50 + 33 + 20) + (16 + 10 + 6) - 3 = 26`. Those 26 are exactly the numbers coprime to 30 in that range.\n\nCommon mistake: reusing the pattern when the constraints are not independent enough for `count(S)` to be computable in closed form. Inclusion-exclusion needs cheap intersections; if computing `count(S)` is itself hard, the `2^k` loop buys nothing.",
    "## The number-theory face: Mobius\n\nCounting `x <= n` coprime to `m` means avoiding divisibility by each distinct prime of `m`. Forcing a subset `S` of those primes means forcing divisibility by their product `d`, which happens `floor(n/d)` times, with sign `(-1)^|S|`. Collect terms by `d` and the sign is precisely the Mobius function:\n\n`mu(1) = 1`; `mu(d) = (-1)^r` if `d` is a product of `r` distinct primes; `mu(d) = 0` if any prime is squared.\n\nSo `count(x <= n : gcd(x,m) = 1) = sum over d | m of mu(d) * floor(n/d)`, and Euler's totient `phi(m) = m * sum over d|m of mu(d)/d` is the `n = m` case. A linear sieve computes `mu` for all values up to `N` in **O(N) time and O(N) space**; enumerating the divisors of a single `m` from its `r` distinct primes is **O(2^r)**.\n\nKey insight: `mu(d) = 0` on non-squarefree `d` is not a special rule — a repeated prime is the same constraint twice, and it simply never appears as a subset product.",
    "## Choosing the direction\n\nThe union form and the complement form are the same identity rearranged; pick whichever has fewer terms to evaluate. Two practical cousins:\n\n- **At least / exactly `m`**: the number of elements in exactly `m` of the sets is `sum over j >= m of (-1)^(j-m) * nCr(j,m) * S_j`, where `S_j` is the total size of all `j`-fold intersections.\n- **Bounded compositions**: the standard use inside stars-and-bars, where each constraint is \"variable `i` exceeds its cap\" and forcing a subset just shifts the total.\n\nWarning: `2^k` is the real limit. Beyond roughly `k = 20` constraints, look for structure — a sieve over `mu`, a DP over the constraint values, or a different decomposition — because the subset loop will not finish.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Subset-mask inclusion-exclusion: count x in [1,n] divisible by none of the given primes — O(2^k) time, O(k) space",
      source: `#include <bits/stdc++.h>
using namespace std;

// Constraints are "divisible by p[i]"; we want the count avoiding all of them.
// Forcing a subset means forcing divisibility by the product of that subset.
// Time O(2^k * k).  Space O(k).
long long countAvoidingAll(long long n, const vector<long long>& p) {
    int k = (int)p.size();
    long long total = 0;
    for (int mask = 0; mask < (1 << k); ++mask) {
        long long prod = 1;
        bool overflow = false;
        for (int i = 0; i < k; ++i)
            if (mask >> i & 1) {
                if (prod > n / p[i]) { overflow = true; break; }  // prod*p[i] > n
                prod *= p[i];
            }
        if (overflow) continue;                       // that intersection is empty
        long long term = n / prod;                    // multiples of prod in [1, n]
        total += (__builtin_popcount(mask) & 1) ? -term : term;
    }
    return total;
}

int main() {
    vector<long long> p = {2, 3, 5};
    cout << countAvoidingAll(100, p) << "\\n";   // 26
    // 100 - (50+33+20) + (16+10+6) - 3 = 26
    cout << countAvoidingAll(30, p) << "\\n";    // 8 = phi(30)
    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Mobius sieve, then coprime counting by divisors — O(N) sieve, O(2^r) per query",
      source: `#include <bits/stdc++.h>
using namespace std;

const int N = 1000001;
int mu[N], smallestPrime[N];

// Linear sieve for the Mobius function.  Time O(N).  Space O(N).
void sieveMobius() {
    vector<int> primes;
    mu[1] = 1;
    for (int i = 2; i < N; ++i) {
        if (smallestPrime[i] == 0) { smallestPrime[i] = i; primes.push_back(i); mu[i] = -1; }
        for (int q : primes) {
            if ((long long)q * i >= N || q > smallestPrime[i]) break;
            smallestPrime[q * i] = q;
            mu[q * i] = (q == smallestPrime[i]) ? 0 : -mu[i];  // squared prime -> 0
        }
    }
}

// #{ x in [1, n] : gcd(x, m) == 1 } = sum over squarefree d | m of mu(d) * (n / d).
// Only the DISTINCT primes of m matter, so enumerate their 2^r products.
long long coprimeCount(long long n, int m) {
    vector<int> pr;
    for (int x = m; x > 1; ) { int q = smallestPrime[x]; pr.push_back(q); while (x % q == 0) x /= q; }
    int r = (int)pr.size();
    long long total = 0;
    for (int mask = 0; mask < (1 << r); ++mask) {
        long long d = 1;
        for (int i = 0; i < r; ++i) if (mask >> i & 1) d *= pr[i];
        total += (__builtin_popcount(mask) & 1) ? -(n / d) : (n / d);
    }
    return total;
}

int main() {
    sieveMobius();
    cout << coprimeCount(100, 30) << "\\n";  // 26
    cout << coprimeCount(30, 30) << "\\n";   // 8  == phi(30)
    cout << mu[30] << " " << mu[12] << "\\n"; // -1 0   (30 squarefree, 12 has 2^2)
    return 0;
}`,
    },
  ],
  cheatSheet: [
    "Avoid-all form: `sum over subsets S of (-1)^|S| * count(S)`; empty subset = the total.",
    "Loop `mask` in `[0, 2^k)`; sign from `__builtin_popcount(mask) & 1`. O(2^k) time, O(k) space.",
    "Proof in one line: an item in `t` sets is counted `(1-1)^t` times — 1 if `t=0`, else 0.",
    "`mu(d)` is the same sign over distinct primes; `#{x<=n : gcd(x,m)=1} = sum_{d|m} mu(d)*floor(n/d)`.",
    "Worked: `[1,100]` avoiding 2,3,5 → `100-103+32-3 = 26`. Linear Mobius sieve is O(N).",
  ],
  interviewQA: [
    {
      q: "Count integers in [1, n] that are divisible by at least one of k given primes. Walk through your approach and its complexity.",
      a: "I use inclusion-exclusion over subsets of the primes. For a subset `S`, the integers divisible by every prime in `S` are exactly the multiples of their product `d`, and there are `floor(n/d)` of them. The union is `sum over non-empty S of (-1)^(|S|+1) * floor(n/d_S)`. In code I loop `mask` from 1 to `2^k - 1`, build the product, and take the sign from the parity of the popcount. Two implementation details matter: I guard the product against overflow by checking `prod > n / p[i]` before multiplying — once the product exceeds `n` the term is zero anyway, so I skip it; and the primes must be distinct, otherwise a repeated factor double-counts the same constraint. Complexity is O(2^k * k) time and O(k) space. Concretely for n = 100 and primes 2, 3, 5: 50+33+20 - 16-10-6 + 3 = 74, so 26 integers avoid all three. If k grew past about 20 I'd switch to a Mobius sieve over the whole range instead, which is O(n) and independent of k.",
      followUps: [
        "How does the answer change if the given numbers are not pairwise coprime?",
        "What if you need this for many n values against the same prime set?",
      ],
    },
    {
      q: "What is the Mobius function and how is it related to inclusion-exclusion?",
      a: "`mu(1) = 1`, `mu(d) = (-1)^r` when `d` is a product of `r` distinct primes, and `mu(d) = 0` when `d` is divisible by a square. It is literally the inclusion-exclusion sign, indexed by the product of the chosen constraints rather than by the subset itself. If I want integers up to `n` coprime to `m`, the constraints are 'divisible by p' for each distinct prime `p` of `m`. Forcing a subset means forcing divisibility by the product `d`, which occurs `floor(n/d)` times with sign `(-1)^|S|` — and regrouping the sum by `d` turns the sign into `mu(d)`, giving `sum over d | m of mu(d) * floor(n/d)`. The vanishing on non-squarefree `d` is not an extra rule: a squared prime would mean choosing the same constraint twice, which no subset does. Practically, `mu` for all values up to N comes from a linear sieve in O(N) time and O(N) space, and per-query I only enumerate `2^r` divisor products where `r` is the number of distinct primes of `m` — at most 8 or so for values under a million.",
      followUps: [
        "Derive Euler's totient from that formula.",
        "How would you count coprime pairs (a, b) with both at most n?",
      ],
    },
  ],
  flashcards: [
    {
      front: "Inclusion-exclusion, complement form",
      back: "Items satisfying none of `k` constraints = `sum over subsets S of (-1)^|S| * count(S)`. Loop `mask` in `[0, 2^k)`, sign = parity of popcount. O(2^k) time, O(k) space.",
    },
    {
      front: "Why do the signs alternate?",
      back: "An item satisfying exactly `t` constraints is counted `sum_j (-1)^j * nCr(t,j) = (1-1)^t` times — 0 for `t > 0`, 1 for `t = 0`. Any other sign pattern would not telescope to zero.",
    },
    {
      front: "Mobius function values and use",
      back: "`mu(1)=1`; `(-1)^r` for `r` distinct primes; `0` if a prime repeats. `#{x<=n : gcd(x,m)=1} = sum_{d|m} mu(d)*floor(n/d)`. Linear sieve builds `mu` up to N in O(N).",
    },
  ],
};
