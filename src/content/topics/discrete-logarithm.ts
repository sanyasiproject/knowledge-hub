import type { TopicContent } from "../types";

export const discreteLogarithm: TopicContent = {
  quickSummary: [
    "Solve a^x = b (mod m) for the smallest x >= 0. Baby-step giant-step splits x = p*n - q with n = ceil(sqrt m), turning O(m) search into O(sqrt m).",
    "Store the n+1 baby steps b*a^q in a hash map, then walk the giant steps a^(p*n) and look each one up.",
    "O(sqrt m) time and O(sqrt m) space — the classic meet-in-the-middle trade. Requires gcd(a, m) = 1; otherwise strip common factors first.",
  ],
  detailed: [
    `Modular exponentiation is easy in one direction and hard in the other: computing a^x mod m costs O(log x), but recovering x from the result has no known polynomial algorithm. That asymmetry is the foundation of Diffie-Hellman.

Baby-step giant-step is the generic square-root attack. Write \`x = p*n - q\` with \`n = ceil(sqrt m)\`, \`1 <= p <= n\` and \`0 <= q < n\`. Every x in [0, m) is representable this way. Substituting into a^x = b and multiplying both sides by a^q gives

\`a^(p*n) = b * a^q (mod m)\`

Now the left side depends only on p and the right side only on q. Enumerate all n right-hand values into a hash map, then try each of the n left-hand values against it. Two loops of length sqrt(m) replace one loop of length m.`,
    `## Complexity and the smallest-x detail

Both loops run about sqrt(m) times, each iteration doing one modular multiplication and one hash operation, so it is O(sqrt m) time and O(sqrt m) space. At m = 10^9 that is ~32000 entries — trivial. At m = 10^18 the memory becomes the wall, and you would switch to Pollard's rho for logarithms, which is O(sqrt m) time in O(1) space.

For example, at m = 10^9+7 the whole search is about 60000 operations instead of a billion.

Key insight: to get the *smallest* x, store the largest q for each key (later writes overwrite earlier ones, which is what a plain \`table[value] = q\` in an increasing loop already does) and scan p upwards, returning on the first hit. Since x = p*n - q, a larger q shrinks x for a fixed p, and the smallest p wins overall.`,
    `## Preconditions and the non-invertible case

The derivation multiplies by a^q, which needs a to be invertible, so \`gcd(a, m) = 1\` is required. When it is not, reduce first: let g = gcd(a, m). If g does not divide b there is no solution unless b = 1 (giving x = 0). Otherwise divide the congruence through — replace b by b/g, m by m/g, and fold the leftover a/g factor into a running coefficient — then recurse. Each step shrinks m by a factor of at least 2, so at most log m reductions are needed before the coprime solver applies.

Common mistake: forgetting the m = 1 case, where every value is 0 and the answer is x = 0, and forgetting to reduce a and b mod m before starting. Both produce wrong answers on tiny hidden tests rather than crashes.

Use \`__int128\` for the products: a and the running value are each below m, and m can approach 2^62.`,
  ],
  code: [
    {
      language: "cpp",
      caption: "Baby-step giant-step — O(sqrt m) time, O(sqrt m) space",
      source: `#include <bits/stdc++.h>
using namespace std;

// Smallest x >= 0 with a^x = b (mod m). Requires gcd(a, m) == 1.
// Returns -1 when no such x exists.
// O(sqrt(m)) modular multiplications and O(sqrt(m)) hash-map entries.
long long bsgs(long long a, long long b, long long m) {
    if (m == 1) return 0;                    // everything is 0 mod 1
    a %= m;
    b %= m;

    long long n = (long long)sqrtl((long double)m) + 1;   // block size

    // Baby steps: key = b * a^q, value = q. Writing in increasing q order
    // keeps the LARGEST q per key, which minimises x = p*n - q.
    unordered_map<long long, long long> table;
    table.reserve(n * 2);
    long long cur = b;
    for (long long q = 0; q <= n; ++q) {
        table[cur] = q;
        cur = (long long)((__int128)cur * a % m);
    }

    // an = a^n, computed once.
    long long an = 1;
    for (long long i = 0; i < n; ++i) an = (long long)((__int128)an * a % m);

    // Giant steps: a^(p*n) for p = 1..n. First hit gives the smallest x.
    cur = 1;
    for (long long p = 1; p <= n; ++p) {
        cur = (long long)((__int128)cur * an % m);
        unordered_map<long long, long long>::iterator it = table.find(cur);
        if (it != table.end()) return p * n - it->second;
    }
    return -1;
}

// bsgs(2, 3, 5)  -> 3   since 2^3 = 8 = 3 (mod 5)
// bsgs(3, 1, 7)  -> 0   the trivial solution is found, not missed
// Cross-checked against brute force for all coprime (a, b, m) with m < 500.`,
    },
  ],
  cheatSheet: [
    "Split x = p*n - q with n = ceil(sqrt m), 1 <= p <= n, 0 <= q < n; solve a^(p*n) = b*a^q.",
    "O(sqrt m) time, O(sqrt m) space. Baby steps go in a hash map, giant steps look up.",
    "Precondition gcd(a, m) = 1. Otherwise divide out gcds first (<= log m reductions).",
    "Keep the largest q per key and scan p upward to get the SMALLEST x.",
    "Handle m = 1 (answer 0) and reduce a, b mod m before starting.",
    "Need O(1) memory instead? Use Pollard's rho for discrete logs — same O(sqrt m) time.",
  ],
  interviewQA: [
    {
      q: "Derive baby-step giant-step and state its complexity.",
      a: "I want the smallest x with a^x = b mod m, and a naive scan is O(m). Set n = ceil(sqrt m) and write x = p*n - q with 1 <= p <= n and 0 <= q < n; every x below m has such a representation. Substituting gives a^(p*n - q) = b, and multiplying both sides by a^q gives a^(p*n) = b * a^q mod m. The point is that the two sides now depend on disjoint variables. So I precompute all n+1 values of b * a^q into a hash map keyed by the value with q as the payload, then compute a^n once and walk cur = a^(p*n) for p = 1, 2, ..., n, checking each against the map. A hit gives x = p*n - q. Both phases are about sqrt(m) modular multiplications, so it is O(sqrt m) time and O(sqrt m) space — a textbook meet-in-the-middle. Multiplying by a^q requires a to be invertible, so gcd(a, m) = 1 is a precondition.",
      followUps: [
        "How do you guarantee the returned x is the smallest?",
        "What if gcd(a, m) != 1?",
      ],
    },
    {
      q: "Your BSGS returns a valid exponent but not the minimum one. What is wrong?",
      a: "Two places control minimality. First, the baby-step map may hold the wrong q for a repeated key. Since x = p*n - q, for a fixed p a larger q gives a smaller x, so for each key I want the largest q. Iterating q from 0 upward with a plain table[value] = q assignment does this naturally because later writes overwrite earlier ones — but a guard like inserting only if the key is absent silently keeps the smallest q and inflates the answer. Second, the giant-step loop must run p from 1 upward and return on the very first hit, since p dominates the value of x; collecting all hits and taking any one, or iterating p downward, breaks it. Two related edge cases worth checking: m = 1 must return 0 immediately, and a and b must be reduced mod m before the loops so that the trivial solution x = 0 (found at p = 1, q = n) is not missed. I would validate by brute-forcing every coprime triple with m below a few hundred and comparing.",
    },
  ],
  flashcards: [
    {
      front: "BSGS split and the equation it solves?",
      back: "x = p*n - q with n = ceil(sqrt m); solve a^(p*n) = b * a^q (mod m), baby steps in a map, giant steps looked up.",
    },
    {
      front: "Time and space of baby-step giant-step?",
      back: "O(sqrt m) modular multiplications and O(sqrt m) hash-map entries. Pollard's rho for logs gets O(sqrt m) time in O(1) space.",
    },
    {
      front: "Precondition of plain BSGS?",
      back: "gcd(a, m) = 1, because the derivation multiplies through by a^q. Non-coprime cases need gcd division first.",
    },
  ],
};
