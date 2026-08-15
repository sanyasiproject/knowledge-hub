import type { TopicContent } from "../types";

export const millerRabin: TopicContent = {
  quickSummary: [
    "Write n - 1 = d * 2^s with d odd; a base a is a witness for compositeness unless a^d = 1 or some a^(d*2^i) = n - 1.",
    "Randomised, each round is wrong with probability at most 1/4 — but with the fixed 12-base set {2,3,5,7,11,13,17,19,23,29,31,37} it is deterministic for every n < 2^64.",
    "O(k log n) modular multiplications, O(1) space. At n ~ 10^18 that is a few hundred operations against 10^9 for trial division.",
  ],
  detailed: [
    `The test rests on one fact about a prime modulus p: the equation x^2 = 1 has only the roots x = 1 and x = -1, because the field has no zero divisors. Composite moduli generally have extra square roots of 1, and finding one exposes the composite.

So factor out the twos: n - 1 = d * 2^s with d odd. If n were prime, Fermat gives a^(n-1) = 1, and repeatedly halving the exponent means the sequence a^d, a^(2d), a^(4d), ..., a^(n-1) must reach 1 and can only do so by stepping through -1. A base whose sequence reaches 1 without ever hitting n - 1 has produced a nontrivial square root of 1, which is a proof that n is composite.

Key insight: a failing base is a *certificate* of compositeness, not a guess. Only the "probably prime" verdict carries uncertainty, and even that is one-sided.`,
    `## From probabilistic to deterministic

For a composite n, at least three quarters of the bases in [2, n-2] are witnesses, so k independent random bases err with probability at most 4^-k. Twenty rounds is beyond any practical doubt.

But randomness is avoidable in the 64-bit range. Checking the first twelve primes as bases is known to be sufficient for all n < 2^64, so the test becomes exact and reproducible.

| Range | Bases that suffice |
| --- | --- |
| n < 3,215,031,751 | 2, 3, 5, 7 |
| n < 3.4 * 10^14 | 2, 3, 5, 7, 11, 13, 17 |
| n < 2^64 | the first 12 primes, 2 through 37 |

Warning: 3215031751 is the smallest composite that survives bases 2, 3, 5 and 7 — a favourite test case. Truncating the base list for speed is how "works on every sample" turns into a wrong answer.`,
    `## Why it beats trial division

Trial division to sqrt(n) is O(sqrt n) divisions: fine to 10^12, hopeless at 10^18 where it is 10^9 operations *per query*. Miller-Rabin is O(k log n) multiplications — roughly 12 * 64 * 2 modular multiplies at 64 bits, a few thousand cycles, and it is flat in n rather than exponential in the bit length.

The one implementation hazard is the multiplication itself. Two 64-bit residues multiply to 128 bits, so \`a * b % m\` in plain \`unsigned long long\` silently wraps. Use \`(__uint128_t)a * b % m\`, which compiles to a single hardware widening multiply plus a division on x86-64.

Common mistake: reusing a signed \`long long\` mulmod, or the \`long double\` trick, for moduli above 2^62. Both lose exactness exactly where Miller-Rabin is supposed to be exact. Reach for __int128 first and only optimise to Montgomery multiplication if profiling demands it.`,
  ],
  code: [
    {
      language: "cpp",
      caption: "Deterministic Miller-Rabin for all n < 2^64 — O(12 log n) mulmods, O(1) space",
      source: `#include <bits/stdc++.h>
using namespace std;

typedef unsigned long long u64;
typedef __uint128_t u128;

// 64x64 -> 128 bit product, reduced. The __int128 cast is what makes this exact
// for any modulus below 2^64; plain u64 arithmetic would wrap silently.
u64 mulmod(u64 a, u64 b, u64 m) { return (u64)((u128)a * b % m); }

u64 powmod(u64 a, u64 e, u64 m) {
    u64 r = 1;
    a %= m;
    while (e) {
        if (e & 1) r = mulmod(r, a, m);
        a = mulmod(a, a, m);
        e >>= 1;
    }
    return r;
}

// One round. n - 1 == d * 2^s with d odd.
// Returns false only when base a PROVES n composite.
bool passesBase(u64 a, u64 n, u64 d, int s) {
    u64 x = powmod(a, d, n);
    if (x == 1 || x == n - 1) return true;
    for (int i = 1; i < s; ++i) {            // square up to a^(n-1)
        x = mulmod(x, x, n);
        if (x == n - 1) return true;
    }
    return false;                            // hit 1 without passing -1
}

// Exact for every n that fits in 64 bits.
bool isPrime(u64 n) {
    if (n < 2) return false;
    for (u64 p : {2ULL,3ULL,5ULL,7ULL,11ULL,13ULL,17ULL,19ULL,23ULL,29ULL,31ULL,37ULL})
        if (n % p == 0) return n == p;       // clears small n and all bases

    u64 d = n - 1;
    int s = 0;
    while ((d & 1) == 0) { d >>= 1; ++s; }

    for (u64 a : {2ULL,3ULL,5ULL,7ULL,11ULL,13ULL,17ULL,19ULL,23ULL,29ULL,31ULL,37ULL})
        if (!passesBase(a, n, d, s)) return false;
    return true;
}

// Checked against a sieve for every n <= 200000, plus:
//   isPrime(18446744073709551557) == true   (largest prime below 2^64)
//   isPrime(3215031751)           == false  (survives bases 2,3,5,7 only)`,
    },
  ],
  cheatSheet: [
    "n - 1 = d * 2^s, d odd. Base a survives iff a^d = 1 or a^(d*2^i) = n-1 for some 0 <= i < s.",
    "Deterministic below 2^64 with bases {2,3,5,7,11,13,17,19,23,29,31,37}; {2,3,5,7} only below 3.2 * 10^9.",
    "O(k log n) modular multiplications, O(1) space. Random rounds err with probability <= 4^-k, one-sided.",
    "mulmod MUST use (__uint128_t)a * b % m — plain u64 wraps above 2^32-ish operands.",
    "Trial-divide by the small primes first: it handles n < 2 and stops a base being a multiple of n.",
    "A failing base is a proof of compositeness; a passing base is only evidence of primality.",
  ],
  interviewQA: [
    {
      q: "Why is Miller-Rabin stronger than a plain Fermat test, and how does the s-step squaring loop work?",
      a: "The Fermat test only checks a^(n-1) = 1 mod n, and Carmichael numbers such as 561 satisfy that for every base coprime to n, so no amount of random sampling helps. Miller-Rabin looks inside that exponentiation. It writes n - 1 = d * 2^s with d odd, computes a^d, then squares s - 1 more times, watching the whole chain rather than just the endpoint. If n is prime, the only square roots of 1 are +1 and -1, so the chain must either start at 1 or pass through n - 1 before reaching 1. If it reaches 1 from something that is neither 1 nor n - 1, we have found a nontrivial square root of 1, which cannot exist modulo a prime, so n is composite and the base is a proof. That extra structure is precisely what Carmichael numbers cannot fake. Cost is O(log n) modular multiplications per base, O(1) space.",
      followUps: [
        "What is the error probability per random base and why 1/4?",
        "How would you make the test deterministic without randomness?",
      ],
    },
    {
      q: "You need a primality test for numbers up to 10^18, called 10^6 times. What do you implement and what are the pitfalls?",
      a: "Deterministic Miller-Rabin with the twelve fixed prime bases 2 through 37, which is exact for everything below 2^64. Per call that is about 12 * 60 squarings, so roughly 10^9 modular multiplications total across 10^6 queries — a couple of seconds, versus trial division's 10^9 divisions for a single query, which is completely infeasible. Time is O(k log n) per query and space is O(1). Three pitfalls. First, mulmod must be (__uint128_t)a * b % m; a 64-bit product overflows and the test then reports nonsense. Second, do not trim the base list to 2, 3, 5, 7 as a speed hack — 3215031751 is composite yet passes those four. Third, handle n < 2 and the bases themselves up front by trial-dividing by the twelve primes, which also guarantees no base is ever a multiple of n. If profiling shows the modulo dominating, the next step is Montgomery multiplication, which replaces the division with shifts and multiplies.",
    },
  ],
  flashcards: [
    {
      front: "Miller-Rabin condition for a base a to pass?",
      back: "With n-1 = d*2^s and d odd: a^d = 1 (mod n), or a^(d*2^i) = n-1 for some 0 <= i < s.",
    },
    {
      front: "Which bases make it deterministic below 2^64?",
      back: "The first 12 primes: 2,3,5,7,11,13,17,19,23,29,31,37. Complexity O(12 log n) mulmods, O(1) space.",
    },
    {
      front: "Why does Miller-Rabin beat the Fermat test?",
      back: "It detects nontrivial square roots of 1, which Carmichael numbers cannot hide — Fermat's test passes every base on them.",
    },
  ],
};
