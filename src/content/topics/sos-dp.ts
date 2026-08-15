import type { TopicContent } from "../types";

export const sosDp: TopicContent = {
  quickSummary: [
    "Computes `f[mask] = sum of a[sub]` over **every** subset `sub` of `mask`, for all 2ⁿ masks at once, in O(2ⁿ·n) time and O(2ⁿ) space — the naive per-mask subset walk is O(3ⁿ).",
    "The trick is a per-bit relaxation: n passes, and pass i merges only along bit i, so each subset is added exactly once along a unique bit-flip path.",
    "The superset variant (`sum over sup ⊇ mask`) is the same loop with the bit test inverted; both are the workhorse behind counting pairs by mask.",
  ],
  detailed: [
    `SOS DP (also called the subset-sum zeta transform) answers one question for all masks simultaneously: for each \`mask\`, what is the aggregate of \`a[sub]\` over all \`sub\` contained in \`mask\`? Enumerating subsets of every mask directly costs O(3ⁿ), which dies past n = 16. SOS gets the same table in O(2ⁿ·n).

Define an intermediate \`S(i, mask)\` = aggregate over subsets that may differ from \`mask\` **only in bits 0..i**. Then \`S(-1, mask) = a[mask]\`, and \`S(n-1, mask)\` is the answer. The recurrence is one line: if bit i of \`mask\` is 0 nothing new is reachable, so \`S(i, mask) = S(i-1, mask)\`; if bit i is set you may either keep it or drop it, so \`S(i, mask) = S(i-1, mask) + S(i-1, mask ^ (1<<i))\`.`,
    `## The precondition, and why the loop order matters

**Precondition:** the layer index \`i\` must be the OUTER loop and \`mask\` the inner loop. Written in place, pass \`i\` reads only values that pass \`i-1\` finished writing, and the value at \`mask ^ (1<<i)\` is guaranteed to be its \`S(i-1, ·)\` state because that mask has bit i clear and is therefore never written during pass i.

Common mistake: swapping the loops so \`mask\` is outer. That silently double-counts — within one mask you would be reading partially-updated neighbours from mixed layers, and the result is neither the subset sum nor anything meaningful. There is no assertion that catches it; the array just holds wrong numbers.

The merge operation must be **associative and commutative** (sum, XOR, min, max, count, OR). It does *not* need an inverse — that is only needed if you want to run the transform backwards (the Mobius / inverse-zeta transform, which is the same loop with \`+=\` replaced by \`-=\`).`,
    `## Typical uses

- **Counting pairs by mask.** "How many ordered pairs \`(i, j)\` satisfy \`a[i] & a[j] == 0\`?" Bucket the values into \`cnt[mask]\`, run SOS to get \`sub[mask]\` = how many values are subsets of \`mask\`, then the answer is the sum of \`sub[FULL ^ a[i]]\` over all i — because \`a[j]\` avoids every bit of \`a[i]\` exactly when \`a[j]\` is a subset of the complement.
- **Superset aggregation** for "how many values are a supermask of this one", used in divisor-style and compatibility counting.
- **Subset-sum convolution and inclusion–exclusion**: the zeta transform is the forward half; pointwise-multiply two transformed arrays and Mobius back to get an OR-convolution.

For example, with n = 20 the whole table is 1M entries and 20 passes — about 2×10⁷ operations, comfortably under a second, whereas the O(3ⁿ) walk would be 3.5×10⁹.`,
  ],
  code: [
    {
      language: "cpp",
      caption: "Subset zeta transform and its superset twin — note the bit-loop order",
      source: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

// After the call, f[mask] = sum of the ORIGINAL f[sub] over all sub subset-of mask.
// PRECONDITION: bit index i is the OUTER loop, mask the INNER loop.
// O(2^n * n) time, O(1) extra space (transform is in place over the 2^n array).
void subsetSum(vector<ll>& f, int n) {
    for (int i = 0; i < n; ++i)                        // layer: merge along bit i
        for (int mask = 0; mask < (1 << n); ++mask)
            if (mask >> i & 1)                         // bit set -> absorb the "bit cleared" sibling
                f[mask] += f[mask ^ (1 << i)];
}

// After the call, g[mask] = sum of the ORIGINAL g[sup] over all sup superset-of mask.
// Same loop, inverted bit test, sibling taken by SETTING the bit instead of clearing it.
void supersetSum(vector<ll>& g, int n) {
    for (int i = 0; i < n; ++i)
        for (int mask = 0; mask < (1 << n); ++mask)
            if (!(mask >> i & 1))
                g[mask] += g[mask | (1 << i)];
}

// Inverse (Mobius): recovers the original array from a subset-transformed one.
// Requires an invertible merge -- this is why "+" works but "min" does not.
void subsetSumInverse(vector<ll>& f, int n) {
    for (int i = 0; i < n; ++i)
        for (int mask = 0; mask < (1 << n); ++mask)
            if (mask >> i & 1)
                f[mask] -= f[mask ^ (1 << i)];
}`,
    },
    {
      language: "cpp",
      caption: "Counting pairs by mask: how many ordered (i, j) have a[i] & a[j] == 0",
      source: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

// Values must fit in n bits. Counts ORDERED pairs, including i == j
// (which contributes only when a[i] == 0).
// O(2^n * n + N) time, O(2^n) space.
ll countDisjointPairs(const vector<int>& a, int n) {
    const int FULL = (1 << n) - 1;
    vector<ll> cnt(1 << n, 0);
    for (int x : a) cnt[x]++;                  // bucket by exact value

    for (int i = 0; i < n; ++i)                // SOS: cnt[mask] becomes
        for (int mask = 0; mask <= FULL; ++mask)  // "# of values that are subsets of mask"
            if (mask >> i & 1)
                cnt[mask] += cnt[mask ^ (1 << i)];

    ll total = 0;
    for (int x : a)
        total += cnt[FULL ^ x];   // a[j] shares no bit with x  <=>  a[j] subset-of ~x
    return total;
}`,
    },
  ],
  cheatSheet: [
    "Subset: `for i: for mask: if (mask>>i&1) f[mask] += f[mask^(1<<i)];` — bit loop OUTER.",
    "Superset: same shape, `if (!(mask>>i&1)) g[mask] += g[mask|(1<<i)];`.",
    "O(2ⁿ·n) time, O(2ⁿ) space. Replaces the O(3ⁿ) per-mask subset walk.",
    "Merge must be associative + commutative; an inverse is needed only for the Mobius direction.",
    "Disjoint-pair counting: SOS the value histogram, then look up `cnt[FULL ^ a[i]]`.",
    "n ≤ ~22 in practice (2²²·22 ≈ 10⁸ ops, 32 MB for a long long array).",
  ],
  interviewQA: [
    {
      q: "You need f[mask] = sum of a[sub] over all subsets sub of mask, for every one of the 2ⁿ masks. How do you beat O(3ⁿ)?",
      a: "Run the subset zeta transform, better known as SOS DP, which gets all 2ⁿ answers in O(2ⁿ·n) time and O(2ⁿ) space. The idea is to relax one bit at a time rather than enumerating subsets. Define S(i, mask) as the aggregate over subsets that may differ from mask only in bits 0 through i. Then S(i, mask) equals S(i-1, mask) when bit i of mask is clear, and S(i-1, mask) + S(i-1, mask without bit i) when it is set. Implemented in place that is a two-line double loop: for each bit i, for each mask, if bit i is set do f[mask] += f[mask ^ (1<<i)]. The critical detail is that the bit index must be the outer loop and the mask the inner one — that ordering is what makes each subset counted along exactly one bit-flip path. Swap the loops and you silently double-count. The superset version, aggregating over all supermasks, is the identical loop with the bit test inverted and the sibling taken by setting the bit. For n = 20 this is roughly 2×10⁷ operations versus 3.5×10⁹ for the naive walk.",
      followUps: [
        "Which merge operations are valid here, and which additionally support the inverse transform?",
        "How would you use this to count pairs with a[i] & a[j] == 0?",
      ],
    },
    {
      q: "Count the ordered pairs (i, j) in an array of n-bit values such that a[i] & a[j] == 0.",
      a: "a[i] and a[j] share no set bit exactly when a[j] is a subset of the complement of a[i]. So build a histogram cnt[mask] of how many array entries equal mask, run the subset SOS transform over it so cnt[mask] becomes the number of entries that are subsets of mask, then sum cnt[FULL ^ a[i]] over every i. That is O(2ⁿ·n + N) time and O(2ⁿ) space, versus O(N²) for the brute-force double loop — a clear win whenever N is large relative to 2ⁿ. Two caveats worth stating: the result counts ordered pairs, so divide by two and adjust if unordered pairs are wanted, and the pair i == j is included whenever a[i] is zero, since zero is disjoint from itself. If the values exceed the bit budget the histogram array becomes infeasible and you would fall back to a different decomposition.",
    },
  ],
  flashcards: [
    {
      front: "SOS DP: what is the loop order, and what breaks if you swap it?",
      back: "Bit index outer, mask inner. Swapping them reads half-updated siblings from mixed layers and silently double-counts — no error is raised.",
    },
    {
      front: "Time and space cost of SOS DP over n bits?",
      back: "O(2ⁿ·n) time, O(2ⁿ) space (in place). It replaces the O(3ⁿ) enumerate-subsets-of-every-mask approach.",
    },
    {
      front: "How do you turn the subset transform into the superset transform?",
      back: "Invert the bit test and take the sibling by setting the bit: `if (!(mask>>i&1)) g[mask] += g[mask|(1<<i)];`.",
    },
  ],
};
