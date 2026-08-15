import type { TopicContent } from "../types";

export const eulersTotient: TopicContent = {
  quickSummary: [
    "phi(n) counts the integers in [1, n] that are coprime to n — phi(1) = 1, and phi(p) = p - 1 for a prime p.",
    "It is multiplicative, so from the factorisation n = p1^a1 * ... * pk^ak you get phi(n) = n * prod (1 - 1/pi).",
    "One value costs O(sqrt n) by trial division; all values up to N cost O(N log log N) with a sieve, O(N) space.",
  ],
  detailed: [
    `The totient turns "how many residues mod n are invertible" into a closed formula. A residue a has an inverse mod n exactly when gcd(a, n) = 1, so phi(n) is the size of the multiplicative group of units mod n. That single sentence is why phi shows up in inverses, exponent reduction, and RSA.

The formula comes from inclusion-exclusion over the distinct prime factors. Each prime p removes the multiples of p, each pair p*q adds back the double-counted ones, and the alternating sum collapses into the product n * prod (1 - 1/p). Only the *distinct* primes matter — the exponents cancel out.

For example, 36 = 2^2 * 3^2, so phi(36) = 36 * (1/2) * (2/3) = 12.`,
    `## Computing it

Two shapes, pick by how many values you need.

| Need | Method | Time | Space |
| --- | --- | --- | --- |
| one phi(n) | trial-divide to sqrt n, apply the product | O(sqrt n) | O(1) |
| phi(1..N) | sieve: seed phi[i] = i, then for each prime p subtract phi[m]/p over its multiples | O(N log log N) | O(N) |
| huge n (10^18) | Pollard's rho to factor, then the product | ~O(n^(1/4)) | O(log n) |

Key insight: in the trial-division version, write the step as \`result -= result / p\` rather than \`result * (p-1) / p\`. Because p already divides \`result\` at that moment, the division is exact and you never leave the integers or risk an overflow from the intermediate product.`,
    `## Euler's theorem and what it buys you

If gcd(a, n) = 1 then \`a^phi(n) = 1 (mod n)\`. Two direct consequences carry most of the practical weight.

- **Modular inverse for any modulus.** \`a^(phi(n) - 1)\` is the inverse of a mod n. For a prime modulus phi(p) = p - 1, which degenerates to the familiar Fermat form \`a^(p-2)\`. Unlike extended Euclid this needs the factorisation of n, so use extgcd when n is composite and unfactored.
- **Exponent reduction.** \`a^e = a^(e mod phi(n)) (mod n)\` lets you evaluate towers like a^(b^c) by recursing on the modulus: n, phi(n), phi(phi(n)), ... That chain hits 1 in O(log n) steps.

Common mistake: applying \`e mod phi(n)\` when gcd(a, n) != 1. The reduction is only valid for units. The general fix is the lifting-the-exponent form: for e >= log2(n), use \`a^(e mod phi(n) + phi(n))\`, which is correct for every a.`,
  ],
  code: [
    {
      language: "cpp",
      caption: "Single value by trial division — O(sqrt n) time, O(1) space",
      source: `#include <bits/stdc++.h>
using namespace std;

// phi(n) = count of x in [1, n] with gcd(x, n) == 1.
// O(sqrt(n)) time, O(1) space. All arithmetic stays integral.
long long phi(long long n) {
    long long result = n;
    for (long long p = 2; p * p <= n; ++p) {
        if (n % p == 0) {
            while (n % p == 0) n /= p;   // strip the whole prime power
            result -= result / p;        // multiply by (1 - 1/p); p divides result here
        }
    }
    if (n > 1) result -= result / n;     // one prime factor above sqrt() may survive
    return result;
}

// Inverse of a mod m for gcd(a, m) == 1, via Euler: a^(phi(m) - 1).
// Needs phi(m), so it costs O(sqrt(m)) on top of the O(log m) power.
long long inverseByEuler(long long a, long long m) {
    long long e = phi(m) - 1, r = 1;
    a %= m;
    while (e > 0) {
        if (e & 1) r = (__int128)r * a % m;
        a = (__int128)a * a % m;
        e >>= 1;
    }
    return r;
}`,
    },
    {
      language: "cpp",
      caption: "Totients of 1..N in one sieve — O(N log log N) time, O(N) space",
      source: `#include <bits/stdc++.h>
using namespace std;

// phi[i] for every i in [0, N].
// A value is still untouched (phi[p] == p) exactly when p is prime, so the
// outer test doubles as a primality sieve and no separate prime list is needed.
vector<int> totientSieve(int N) {
    vector<int> phi(N + 1);
    for (int i = 0; i <= N; ++i) phi[i] = i;

    for (int p = 2; p <= N; ++p) {
        if (phi[p] == p) {                       // p is prime
            for (int m = p; m <= N; m += p)
                phi[m] -= phi[m] / p;            // apply the (1 - 1/p) factor
        }
    }
    return phi;
}

// Handy corollary: sum over d | n of phi(d) == n.
// So prefix-summing phi over divisors is a common DP trick in counting problems.`,
    },
  ],
  cheatSheet: [
    "phi(n) = n * prod over distinct primes p | n of (1 - 1/p). Only distinct primes matter.",
    "phi(p) = p - 1; phi(p^k) = p^k - p^(k-1); phi(a*b) = phi(a)*phi(b) when gcd(a,b) = 1.",
    "Single value O(sqrt n) time / O(1) space; sieve 1..N is O(N log log N) time / O(N) space.",
    "Euler: gcd(a,n)=1 => a^phi(n) = 1 (mod n). Inverse = a^(phi(n)-1).",
    "Exponent reduction a^e = a^(e mod phi(n)) needs gcd(a,n)=1; otherwise use e mod phi(n) + phi(n).",
    "Sum of phi(d) over all divisors d of n equals n.",
  ],
  interviewQA: [
    {
      q: "Compute a^b mod n where b is given as a 10^5-digit decimal string. How do you handle the exponent?",
      a: "I reduce the exponent with Euler's theorem instead of trying to represent b. First I compute phi(n) by factorising n in O(sqrt n) — or with Pollard's rho if n is near 10^18. Then I stream the decimal string once, keeping e = (e * 10 + digit) mod phi(n), which is O(len(b)) time and O(1) extra space, and finish with binary exponentiation in O(log n) multiplications. The one trap is that a^e = a^(e mod phi(n)) is only valid when gcd(a, n) = 1. Since a and n are arbitrary here, I use the general lifting form: track whether the true exponent reached log2(n), and if so raise a to (e mod phi(n)) + phi(n). That is correct for every a including ones sharing a factor with n. Overall O(sqrt n + len(b) + log n) time.",
      followUps: [
        "How does this extend to a power tower a^(b^c) mod n?",
        "When would you prefer extended Euclid over Euler for the modular inverse?",
      ],
    },
    {
      q: "You need phi(i) for every i up to 10^7. Sketch the sieve and justify its complexity.",
      a: "I allocate an array with phi[i] = i, then loop p from 2 to N. If phi[p] is still equal to p then nothing has divided it yet, which means p has no smaller prime factor, so p is prime. For that p I walk its multiples m = p, 2p, 3p, ... and apply phi[m] -= phi[m] / p, which multiplies the running value by (1 - 1/p). Since each index gets one such update per distinct prime dividing it, and the inner loops together run N/2 + N/3 + N/5 + ... over primes, the total is O(N log log N) time with O(N) space — one int array, about 40 MB at N = 10^7. The elegance is that the primality test is free: I never build a separate prime list, because the untouched-value condition identifies primes exactly. If I also need the smallest prime factor I would switch to a linear sieve, which computes phi in O(N) at the cost of an extra array.",
    },
  ],
  flashcards: [
    {
      front: "phi(n) in terms of the prime factorisation?",
      back: "phi(n) = n * prod over DISTINCT primes p dividing n of (1 - 1/p). Exponents do not appear.",
    },
    {
      front: "Euler's theorem, and the inverse it gives?",
      back: "gcd(a,n)=1 implies a^phi(n) = 1 (mod n), so a^(phi(n)-1) is the inverse of a mod n. For prime p this is a^(p-2).",
    },
    {
      front: "Cost of one phi(n) versus all phi(1..N)?",
      back: "One value: O(sqrt n) time, O(1) space by trial division. All values: O(N log log N) time, O(N) space by sieve.",
    },
  ],
};
