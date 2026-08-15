import type { TopicContent } from "../types";

export const chineseRemainderTheorem: TopicContent = {
  quickSummary: [
    "Given x = r1 (mod m1), ..., x = rk (mod mk) with pairwise coprime moduli, there is exactly one solution modulo M = m1 * ... * mk.",
    "Build it by folding pairs: keep a running (R, M) and merge the next congruence with one extended-Euclid call.",
    "O(k log M) time, O(1) extra space beyond the input. The non-coprime version works too — it just needs gcd(m1,m2) to divide r2 - r1, and yields a modulus of lcm(m1,m2).",
  ],
  detailed: [
    `CRT is a change of coordinates. Instead of storing x as one number mod M, you store the tuple of its residues mod each mi. The theorem says that when the moduli are pairwise coprime this map is a bijection, and it respects addition and multiplication componentwise — so you can do a whole computation in the small moduli and reassemble at the end.

That is the real reason it appears in practice: splitting one hard modulus into several easy ones. Counting mod 4200 becomes counting mod 8, 3, 25 and 7 independently.

In practice: many problems ask for an answer mod a *composite* like 10^9+6 or a product of small primes. Solve mod each prime power where inverses and Lucas-style formulas behave, then CRT the pieces back.`,
    `## The pairwise merge

Rather than the textbook sum over all k terms at once, fold two congruences at a time. Suppose \`x = R (mod M)\` is what you have so far and the next constraint is \`x = r (mod m)\`.

Write x = R + M*t. Substituting gives \`M*t = r - R (mod m)\`. Let g = gcd(M, m). This is solvable iff \`g | (r - R)\`, and then \`t = ((r - R)/g) * inv(M/g) (mod m/g)\`, where the inverse comes straight out of extended Euclid on (M, m) — the coefficient p in \`M*p + m*q = g\` already satisfies \`(M/g)*p = 1 (mod m/g)\`.

The merged result is \`x = R + M*t (mod lcm(M, m))\`. Coprime moduli are just the special case g = 1, where the consistency check never fails and the new modulus is the plain product.

Warning: the intermediate \`t * M\` reaches the size of the new lcm. Once your moduli multiply past 2^63 you must either use __int128 for that product or accept that the answer no longer fits in a long long.`,
    `## When it fails, and the non-coprime generalisation

With non-coprime moduli a system can simply have no solution. \`x = 1 (mod 4)\` and \`x = 2 (mod 6)\` is contradictory: the first forces x odd, the second forces x even. The gcd test \`(r - R) % g == 0\` catches exactly this, and every implementation should return a sentinel rather than a wrong number.

Common mistake: assuming the merged modulus is m1 * m2. For general moduli it is lcm(m1, m2) = m1/g * m2. Using the product silently over-counts solutions and breaks the uniqueness the whole theorem is about.

Also normalise inputs: take \`ri = ((ri % mi) + mi) % mi\` before merging, so negative remainders do not poison the divisibility test.`,
  ],
  code: [
    {
      language: "cpp",
      caption: "Extended Euclid plus a merge that handles non-coprime moduli",
      source: `#include <bits/stdc++.h>
using namespace std;

// Returns g = gcd(a, b) and fills x, y with a*x + b*y = g.  O(log min(a,b)).
long long extgcd(long long a, long long b, long long &x, long long &y) {
    if (b == 0) { x = 1; y = 0; return a; }
    long long x1, y1;
    long long g = extgcd(b, a % b, x1, y1);
    x = y1;
    y = x1 - (a / b) * y1;
    return g;
}

// Merge  x = r1 (mod m1)  with  x = r2 (mod m2)  for ANY positive moduli.
// Returns {remainder, lcm(m1,m2)}, or {-1,-1} when the pair is inconsistent.
// O(log min(m1,m2)) time, O(log) stack for the recursion, O(1) data.
pair<long long, long long> crt2(long long r1, long long m1,
                                long long r2, long long m2) {
    long long p, q;
    long long g = extgcd(m1, m2, p, q);      // (m1/g)*p == 1 (mod m2/g)
    if ((r2 - r1) % g != 0) return {-1, -1}; // no solution

    long long lcm = m1 / g * m2;             // divide first: avoids overflow
    long long mod = m2 / g;

    // t = (r2 - r1)/g * p  (mod m2/g); __int128 keeps the product safe.
    __int128 t = (__int128)(r2 - r1) / g % mod * p % mod;

    long long r = (long long)(((__int128)r1 + t * m1) % lcm);
    if (r < 0) r += lcm;
    return {r, lcm};
}`,
    },
    {
      language: "cpp",
      caption: "Fold a whole system — O(k log M) time, O(1) extra space",
      source: `#include <bits/stdc++.h>
using namespace std;

pair<long long, long long> crt2(long long, long long, long long, long long);

// Solve the system x = r[i] (mod m[i]) for all i.
// Returns {smallest non-negative solution, lcm of all moduli}, or {-1,-1}.
// Precondition: the final lcm must fit in a long long.
pair<long long, long long> crt(const vector<long long>& r,
                               const vector<long long>& m) {
    long long R = 0, M = 1;                       // x = 0 (mod 1): always true
    for (size_t i = 0; i < r.size(); ++i) {
        long long ri = ((r[i] % m[i]) + m[i]) % m[i];   // normalise sign
        pair<long long, long long> merged = crt2(R, M, ri, m[i]);
        if (merged.second == -1) return {-1, -1};       // inconsistent system
        R = merged.first;
        M = merged.second;
    }
    return {R, M};
}

// crt({2,3,2}, {3,5,7})  ->  {23, 105}
// crt2(1, 4, 5, 6)       ->  {5, 12}    (non-coprime, consistent)
// crt2(1, 4, 2, 6)       ->  {-1, -1}   (odd vs even: impossible)`,
    },
  ],
  cheatSheet: [
    "Coprime moduli: unique solution mod M = prod mi. General moduli: unique mod lcm(mi), or none.",
    "Solvability of a pair: gcd(m1,m2) must divide r2 - r1.",
    "Merge step: x = R + M*t where t = (r-R)/g * inv(M/g) mod (m/g); new modulus is lcm.",
    "O(k log M) time, O(1) space. Use __int128 for the t*M product.",
    "Divide before multiplying: lcm = m1 / g * m2, never (m1 * m2) / g.",
  ],
  interviewQA: [
    {
      q: "Walk through solving x = 2 (mod 3), x = 3 (mod 5), x = 2 (mod 7) with the iterative merge.",
      a: "I start with the trivially true state x = 0 (mod 1) and fold one congruence at a time. Merging with x = 2 (mod 3) gives x = 2 (mod 3). Next, merge x = 2 (mod 3) with x = 3 (mod 5): write x = 2 + 3t, so 3t = 1 (mod 5); since 3 inverse mod 5 is 2, t = 2 (mod 5), giving x = 2 + 6 = 8 (mod 15). Finally merge with x = 2 (mod 7): x = 8 + 15t, so 15t = -6 (mod 7), that is t = -6 (mod 7) since 15 = 1 (mod 7), so t = 1 and x = 23 (mod 105). The answer is 23, unique modulo 105 because 3, 5 and 7 are pairwise coprime. Each merge is one extended-Euclid call, so the whole thing is O(k log M) time and O(1) space. I use __int128 for the t*M product because it grows to the size of the running lcm.",
      followUps: [
        "What changes if the moduli are not coprime?",
        "How would you detect that the final modulus overflows 64 bits?",
      ],
    },
    {
      q: "Your CRT routine returns garbage on a test with moduli 4 and 6. What is wrong and how do you fix it?",
      a: "Almost certainly the code assumes coprime moduli. Two things break. First, the new modulus must be lcm(4,6) = 12, not the product 24 — using the product means the returned value is no longer the unique representative and downstream comparisons fail. Second, the system may be unsolvable: with g = gcd(4,6) = 2, a solution exists only if g divides r2 - r1, so x = 1 (mod 4) with x = 2 (mod 6) has no answer at all and must return a sentinel rather than a number. The fix is the general merge: run extended Euclid on (m1, m2) to get g and the Bezout coefficient p, reject when (r2 - r1) % g != 0, otherwise set t = (r2-r1)/g * p mod (m2/g) and return (r1 + t*m1) mod lcm, normalised to be non-negative. I also normalise incoming remainders into [0, mi) first, because a negative remainder makes the divisibility test misleading.",
    },
  ],
  flashcards: [
    {
      front: "When does x = r1 (mod m1), x = r2 (mod m2) have a solution?",
      back: "Exactly when gcd(m1, m2) divides r2 - r1. The solution is then unique modulo lcm(m1, m2).",
    },
    {
      front: "CRT merge formula and complexity?",
      back: "x = r1 + m1*t with t = (r2-r1)/g * inv(m1/g) mod (m2/g); result mod lcm. O(log min(m1,m2)) per merge, O(k log M) total, O(1) space.",
    },
    {
      front: "Why compute lcm as m1 / g * m2?",
      back: "Dividing first keeps the intermediate inside 64 bits; (m1 * m2) / g can overflow before the division happens.",
    },
  ],
};
