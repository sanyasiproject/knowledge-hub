import type { TopicContent } from "../types";

export const randomizedAlgorithms: TopicContent = {
  quickSummary: [
    "Randomness converts *worst-case-over-inputs* into *expected-case-over-coin-flips* — an adversary can no longer pick the input that hurts you.",
    "Randomized quicksort is **O(n log n)** expected time; quickselect is **O(n)** expected, both **O(log n)** expected stack space.",
    "**Las Vegas** algorithms are always correct with random runtime; **Monte Carlo** algorithms have bounded runtime with a small error probability.",
  ],
  detailed: [
    "Deterministic quicksort with a fixed pivot rule (first, last, or middle element) has an O(n²) worst case that is trivially reproducible — anyone who knows the rule can hand you the killer input. Choosing the pivot uniformly at random makes the runtime depend on your coin flips, not on the input, giving **O(n log n)** expected comparisons for any input whatsoever. Quickselect with a random pivot recurses on one side only, giving **O(n)** expected time (the recurrence `T(n) = T(n/2) + O(n)` sums to `2n`).\n\nKey insight: randomization does not remove the bad cases — it removes the adversary's ability to *find* them.",
    "## Shuffling and random hash bases\n\nTwo cheap defences appear constantly.\n\n- **Shuffle the input** before running a structure with input-order sensitivity (unbalanced BST insertion, plain quicksort, treap-free constructions). A Fisher-Yates shuffle is O(n) and makes any fixed adversarial ordering irrelevant.\n- **Randomize hash parameters.** Polynomial string hashing with a hard-coded base and modulus is breakable — anti-hash tests exist for every popular constant. Draw the base at random once per run and the adversary cannot precompute a collision.\n\nWarning: seed your generator with `std::chrono::steady_clock::now().time_since_epoch().count()`, never with a fixed literal like `mt19937 rng(12345)`. A fixed seed makes the algorithm deterministic again, which defeats the entire point — and `rand()` on many platforms has only 15 random bits, so prefer `mt19937` / `mt19937_64`.",
    "## Monte Carlo vs Las Vegas\n\n| | Correctness | Runtime |\n|---|---|---|\n| **Las Vegas** | always correct | random (bounded in expectation) |\n| **Monte Carlo** | correct with probability `1 − ε` | deterministic bound |\n\nRandomized quicksort and quickselect are Las Vegas: the output is always the right answer, only the time varies. Miller-Rabin primality and hash-based equality checks are Monte Carlo: they finish in a fixed budget but may be wrong with tiny probability. A Monte Carlo algorithm whose answers you can *verify* converts to Las Vegas by re-running until the check passes.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Randomized quickselect (Lomuto partition) — O(n) expected time, O(1) extra space",
      source: `#include <bits/stdc++.h>
using namespace std;

// Seed from the clock, never from a fixed constant.
mt19937_64 rng(chrono::steady_clock::now().time_since_epoch().count());

// k-th smallest element (0-indexed). Rearranges a in place.
// Expected O(n); worst case O(n^2) but only with probability ~0.
int quickselect(vector<int>& a, int k) {
    int lo = 0, hi = (int)a.size() - 1;
    while (lo < hi) {
        int p = lo + (int)(rng() % (unsigned)(hi - lo + 1));   // random pivot
        swap(a[p], a[hi]);
        int pivot = a[hi], store = lo;
        for (int i = lo; i < hi; ++i)
            if (a[i] < pivot) swap(a[i], a[store++]);
        swap(a[store], a[hi]);

        if (k == store) return a[k];
        if (k < store) hi = store - 1;
        else           lo = store + 1;
    }
    return a[lo];
}

int main() {
    vector<int> a = {7, 2, 9, 4, 1, 8, 3};
    // Defensive shuffle: also useful before any input-order-sensitive structure.
    shuffle(a.begin(), a.end(), rng);
    cout << quickselect(a, 3) << "\\n";   // 4 (the 4th smallest)
}`,
    },
    {
      language: "cpp",
      caption: "Polynomial string hash with a random base mod 2^61−1 — O(n) build, O(1) per range query",
      source: `// Random base per run defeats precomputed anti-hash tests.
struct StringHash {
    static const unsigned long long M = (1ULL << 61) - 1;   // Mersenne prime

    static unsigned long long mul(unsigned long long a, unsigned long long b) {
        __uint128_t r = (__uint128_t)a * b;
        unsigned long long lo = (unsigned long long)(r & M);
        unsigned long long hi = (unsigned long long)(r >> 61);
        lo += hi;
        if (lo >= M) lo -= M;
        return lo;
    }

    unsigned long long base;
    vector<unsigned long long> h, p;

    explicit StringHash(const string& s) {
        base = M / 4 + rng() % (M / 2);      // random, fixed for this run
        int n = (int)s.size();
        h.assign(n + 1, 0);
        p.assign(n + 1, 1);
        for (int i = 0; i < n; ++i) {
            h[i + 1] = (mul(h[i], base) + (unsigned char)s[i]) % M;
            p[i + 1] = mul(p[i], base);
        }
    }

    // hash of s[l, r) -- half-open
    unsigned long long get(int l, int r) const {
        return (h[r] + M - mul(h[l], p[r - l])) % M;
    }
};`,
    },
  ],
  cheatSheet: [
    "Random pivot: quicksort O(n log n) expected, quickselect O(n) expected; worst case unchanged but unreachable by an adversary.",
    "Fisher-Yates shuffle: O(n) time, O(1) space — insurance against adversarial input order.",
    "Seed with `chrono::steady_clock::now().time_since_epoch().count()`, use `mt19937_64`, never `rand()` or a fixed literal.",
    "Las Vegas = always correct, random time. Monte Carlo = fixed time, small error probability.",
    "Random hash base mod 2^61−1: collision probability ≈ q/M per comparison, negligible for q ≤ 10^6.",
  ],
  interviewQA: [
    {
      q: "Randomized quicksort still has an O(n²) worst case. Why is it considered safe?",
      a: "Because the worst case is no longer a property of the input. With a fixed pivot rule, an adversary (or just an unlucky real-world dataset like an already-sorted array) reliably triggers the quadratic path. With a uniformly random pivot, the running time depends only on the algorithm's own coin flips, so the expected comparison count is about 2n·ln n for every input, and the probability of exceeding a constant multiple of n log n decays exponentially. The caveat is that the randomness must be genuine: a fixed seed makes the sequence reproducible, and if the seed is guessable the adversarial construction comes back.",
      followUps: ["How would you make quicksort worst-case O(n log n) deterministically?"],
    },
    {
      q: "Distinguish Monte Carlo from Las Vegas algorithms, with an example of each.",
      a: "A Las Vegas algorithm is always correct but its running time is a random variable — randomized quickselect always returns the true k-th smallest element, and only the time to do so varies (O(n) expected). A Monte Carlo algorithm has a deterministic time bound but may return a wrong answer with bounded probability — Miller-Rabin with k rounds runs in fixed time and declares a composite prime with probability at most 4^-k. If the Monte Carlo output can be verified cheaply, you can convert it to Las Vegas by looping until verification succeeds, trading the error probability for a random runtime.",
      followUps: ["Which would you prefer inside a hard real-time system?"],
    },
  ],
  flashcards: [
    { front: "Expected complexity of randomized quicksort and quickselect?", back: "Quicksort O(n log n) expected time; quickselect O(n) expected time. Worst case is still O(n²) but not adversarially reachable." },
    { front: "Las Vegas vs Monte Carlo?", back: "Las Vegas: always correct, random runtime (quickselect). Monte Carlo: bounded runtime, small error probability (Miller-Rabin)." },
    { front: "How should you seed a PRNG in competitive/production code?", back: "`mt19937_64 rng(chrono::steady_clock::now().time_since_epoch().count())`. A fixed literal seed is reproducible and therefore attackable." },
  ],
};
