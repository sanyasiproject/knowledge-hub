import type { TopicContent } from "../types";

export const pollardRho: TopicContent = {
  quickSummary: [
    "Iterate x -> x^2 + c mod n and take gcd of differences: by the birthday paradox a collision modulo the smallest prime factor p appears after about sqrt(p) steps.",
    "Expected O(n^(1/4)) modular multiplications to split n, O(1) space. Brent's cycle detection plus batched gcds makes the constant small.",
    "Pair it with Miller-Rabin — the primality test decides when to stop recursing, so together they factor 10^18 numbers in milliseconds.",
  ],
  detailed: [
    `Trial division finds a factor p in O(p) work. Pollard's rho finds it in about O(sqrt p), which for a balanced semiprime n = p*q means O(n^(1/4)) instead of O(n^(1/2)) — the difference between 10^9 and 30000 operations at n = 10^18.

The idea is indirect. You cannot see p, but you can iterate a pseudorandom map \`f(x) = x^2 + c mod n\` and reason about its behaviour *modulo p*. The sequence mod p lives in a set of size p, so by the birthday bound two of the first ~sqrt(p) values collide. When xi = xj (mod p) but not mod n, \`gcd(|xi - xj|, n)\` is a proper divisor. The rho in the name is the shape of the trajectory: a tail leading into a cycle.

Key insight: you never test candidate divisors. You detect a collision in an invisible smaller world and let gcd translate it into a real factor.`,
    `## Brent's improvement and batched gcds

Floyd's tortoise-and-hare works but evaluates f three times per step. Brent's variant advances the fast pointer in doubling-length runs and compares against a saved value, costing one f evaluation per step and finding the cycle sooner in practice.

The second and larger win is batching. A gcd costs far more than a multiply, so instead of one gcd per step, accumulate the product \`q = q * |x - y| mod n\` over a block of ~128 steps and take a single gcd of q with n. If that gcd comes back as n itself, the block swallowed two distinct factors — rewind and replay the block one step at a time.

Warning: if the accumulated product hits 0 the gcd is n and you learn nothing. The rewind path is not optional; without it the loop can spin forever on inputs where a factor is found mid-block.`,
    `## Full factorisation, and the details that bite

The complete routine is a mutual recursion: if n is 1 stop, if Miller-Rabin says n is prime emit it, otherwise split with rho and recurse on both halves. Miller-Rabin is what makes the recursion terminate cheaply — without it you cannot tell a prime from a stubborn composite, and rho would loop forever on a prime input.

Three things to get right.

- **mulmod.** \`(__uint128_t)x * x % n\` everywhere. A 64-bit product wraps and the gcds become meaningless.
- **Even n.** \`f(x) = x^2 + c\` degenerates on n = 4; strip factors of 2 first and return 2 directly.
- **Retry with a new c.** A single c can fail (gcd stays n). Pick a fresh random c and restart the outer loop.

For example, 18446744073709551615 = 2^64 - 1 factors as 3 * 5 * 17 * 257 * 641 * 65537 * 6700417 in a handful of milliseconds this way.`,
  ],
  code: [
    {
      language: "cpp",
      caption: "Brent's rho with batched gcds — expected O(n^(1/4)) mulmods, O(1) space",
      source: `#include <bits/stdc++.h>
using namespace std;

typedef unsigned long long u64;
typedef __uint128_t u128;

u64 mulmod(u64 a, u64 b, u64 m) { return (u64)((u128)a * b % m); }
bool isPrime(u64 n);                          // deterministic Miller-Rabin

// Returns SOME nontrivial divisor of composite n (not necessarily prime).
// Expected O(n^(1/4)) modular multiplications, O(1) space.
u64 pollard(u64 n) {
    if ((n & 1) == 0) return 2;               // x^2+c degenerates on even n
    mt19937_64 rng(chrono::steady_clock::now().time_since_epoch().count());

    while (true) {
        u64 c = rng() % (n - 1) + 1;
        u64 y = rng() % n, x = 0, ys = 0, g = 1, q = 1;
        long long batch = 128, r = 1;         // Brent: run lengths double

        while (g == 1) {
            x = y;
            for (long long i = 0; i < r; ++i) y = (u64)(((u128)y * y + c) % n);

            for (long long k = 0; k < r && g == 1; k += batch) {
                ys = y;                                    // block start, for rewind
                long long lim = min(batch, r - k);
                for (long long i = 0; i < lim; ++i) {
                    y = (u64)(((u128)y * y + c) % n);
                    q = mulmod(q, x > y ? x - y : y - x, n);   // batch the gcd
                }
                g = __gcd(q, n);                            // one gcd per ~128 steps
            }
            r <<= 1;
        }

        if (g == n) {                          // block hid the split: replay it
            g = 1;
            while (g == 1) {
                ys = (u64)(((u128)ys * ys + c) % n);
                g = __gcd(x > ys ? x - ys : ys - x, n);
            }
        }
        if (g != n) return g;                  // proper divisor
        // else: unlucky c, try another one
    }
}`,
    },
    {
      language: "cpp",
      caption: "Full factorisation: rho to split, Miller-Rabin to stop",
      source: `#include <bits/stdc++.h>
using namespace std;
typedef unsigned long long u64;

bool isPrime(u64 n);
u64 pollard(u64 n);

// Appends the prime factors of n (with multiplicity, unsorted) to out.
// Miller-Rabin is the base case -- without it the recursion never terminates.
void factor(u64 n, vector<u64>& out) {
    if (n == 1) return;
    if (isPrime(n)) { out.push_back(n); return; }
    u64 d = pollard(n);
    factor(d, out);
    factor(n / d, out);
}

vector<u64> primeFactors(u64 n) {
    vector<u64> f;
    factor(n, f);
    sort(f.begin(), f.end());
    return f;
}

// Verified: product of the returned list equals n and every element is prime,
// for random n up to 10^15 and for these edge cases --
//   998244359987710471   -> 998244353, 1000000007
//   18446744073709551615 -> 3, 5, 17, 257, 641, 65537, 6700417
//   1000000000000000009  -> itself (prime)`,
    },
  ],
  cheatSheet: [
    "Iterate f(x) = x^2 + c mod n; gcd(|x - y|, n) splits n once x = y mod p.",
    "Birthday bound: collision mod p after ~sqrt(p) steps => expected O(n^(1/4)) mulmods, O(1) space.",
    "Brent beats Floyd: one f evaluation per step, doubling run lengths.",
    "Batch ~128 differences into one product, then a single gcd; rewind step-by-step if that gcd is n.",
    "Handle even n separately, retry with a fresh c on failure, and use __int128 for every multiply.",
    "Recursion base case is Miller-Rabin — rho alone cannot recognise a prime.",
  ],
  interviewQA: [
    {
      q: "Explain why Pollard's rho reaches O(n^(1/4)) and what role the birthday paradox plays.",
      a: "Let p be the smallest prime factor of n, so p <= sqrt(n). The iteration x -> x^2 + c mod n behaves like a random map, and I analyse it modulo p even though p is unknown. The values taken modulo p live in a set of size p, so by the birthday bound two of the first roughly sqrt(p) iterates collide. At that moment xi - xj is a multiple of p but generally not of n, so gcd(|xi - xj|, n) returns a proper divisor. The step count is therefore about sqrt(p) <= n^(1/4), and each step is one modular multiplication, giving expected O(n^(1/4)) multiplications with O(1) space since Brent's cycle detection stores only a couple of values. That is the key trick: I get sqrt-of-the-factor behaviour rather than linear-in-the-factor behaviour, without ever being able to observe p.",
      followUps: [
        "Why batch the gcd calls, and what goes wrong when the batch gcd equals n?",
        "What does the algorithm do if you hand it a prime?",
      ],
    },
    {
      q: "Factor a 10^18 number in an interview. Outline the full solution and the correctness traps.",
      a: "I combine deterministic Miller-Rabin with Pollard's rho. Optionally I trial-divide by primes below a few thousand first, which strips the easy factors cheaply. Then factor(n) recurses: return if n is 1, emit n if Miller-Rabin declares it prime, otherwise call rho to get a divisor d and recurse on d and n/d. Miller-Rabin with the twelve fixed bases is exact below 2^64 and is what terminates the recursion — rho would spin forever on a prime. Expected cost is O(n^(1/4)) modular multiplications per split with O(1) space, so a few milliseconds at 10^18. Traps: every multiplication must go through __uint128_t or the products wrap; even n must return 2 directly because x^2 + c degenerates there; a single constant c can fail, so the outer loop retries with a fresh random c; and with batched gcds, a batch that returns n means two factors were found inside one block, which requires replaying the block one step at a time. I would sanity-check by multiplying the output back together and re-testing each factor for primality.",
    },
  ],
  flashcards: [
    {
      front: "Pollard's rho core step and its complexity?",
      back: "Iterate f(x) = x^2 + c mod n, take gcd(|x - y|, n). Expected O(n^(1/4)) modular multiplications, O(1) space.",
    },
    {
      front: "Why must Pollard's rho be paired with Miller-Rabin?",
      back: "Rho only splits composites; it never terminates on a prime. Miller-Rabin is the recursion's base case and stopping condition.",
    },
    {
      front: "What does a batched gcd of n mean, and what do you do?",
      back: "The block contained more than one factor (or the product hit 0). Rewind to the block start and take gcds one step at a time.",
    },
  ],
};
