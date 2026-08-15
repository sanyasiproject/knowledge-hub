import type { TopicContent } from "../types";

export const bitManipulation: TopicContent = {
  quickSummary: [
    "Four idioms carry most problems: `x & -x` (lowest set bit), `x & (x-1)` (clear it), `x ^ y` (difference / self-cancelling), and `1 << i` masks for set membership.",
    "Bit tricks are O(1) time and O(1) space per operation — they turn set operations on ≤64 elements into single instructions.",
    "The pitfalls are all in C++ semantics: `1 << 31` overflows `int`, shifting by ≥ width is undefined, and `x & -x` on signed types flirts with UB at `INT_MIN`.",
  ],
  detailed: [
    "Two's complement is what makes the tricks work. Negating x flips every bit and adds one, so `-x` agrees with `~x + 1`: all bits below the lowest set bit are zero in both, the lowest set bit itself matches, and everything above is inverted. Therefore `x & -x` isolates exactly the lowest set bit, and `x & (x - 1)` clears it (subtracting one borrows through the trailing zeros and flips that bit off).\n\nFor example, x = 0b10110: `x & -x` = 0b00010, and `x & (x-1)` = 0b10100.",
    "## Core idioms\n\n| Goal | Expression |\n|---|---|\n| Test bit i | `(x >> i) & 1` |\n| Set bit i | `x \\|= 1u << i` |\n| Clear bit i | `x &= ~(1u << i)` |\n| Toggle bit i | `x ^= 1u << i` |\n| Lowest set bit | `x & -x` |\n| Clear lowest set bit | `x & (x - 1)` |\n| Is power of two | `x && !(x & (x - 1))` |\n| Popcount | `__builtin_popcountll(x)` |\n\nXOR is the workhorse: `a ^ a == 0` and `a ^ 0 == a`, so XOR-ing an array where every value appears twice except one leaves exactly the single number — O(n) time, O(1) space, versus O(n) space for a hash set.",
    "## Enumerating submasks\nTo visit every subset of a mask `m`, iterate `for (int s = m; s; s = (s - 1) & m)` and handle `0` separately. Subtracting one borrows into the mask's own bits, and the `& m` keeps you inside it, so this enumerates each submask exactly once in decreasing order. Cost is O(2^popcount(m)) per mask, and summed over all masks of n bits it is O(3^n) — the standard bound behind subset-sum DP.",
    "## C++ pitfalls\nWarning: `1 << 31` is undefined behaviour on 32-bit `int` (signed overflow). Use `1u << 31` or `1LL << 31`. Likewise `1 << 40` does not silently widen — you must write `1LL << 40`.\n\n- Shifting by a count ≥ the type width is **undefined**, not zero. Guard `i < 64` yourself.\n- Right shift of a negative signed value is implementation-defined arithmetic shift; use unsigned types when you want logical shift.\n- `x & -x` on the most negative signed value negates out of range; prefer `unsigned` for bit work.\n- `__builtin_popcount` takes `unsigned int`; use `__builtin_popcountll` for 64-bit values or you silently drop the high half.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Core idioms — popcount, single number, power-of-two check",
      source: `#include <vector>
using namespace std;

// Kernighan popcount: loops once per SET bit, not once per bit.
int popcount(unsigned long long x) {
    int c = 0;
    while (x) { x &= x - 1; ++c; }   // clear lowest set bit
    return c;                        // O(popcount(x)) time, O(1) space
}

// Every value appears twice except one. XOR cancels the pairs.
int singleNumber(const vector<int>& a) {
    int acc = 0;
    for (int v : a) acc ^= v;
    return acc;                      // O(n) time, O(1) space
}

bool isPowerOfTwo(unsigned long long x) {
    return x && !(x & (x - 1));      // exactly one set bit
}

unsigned long long lowestSetBit(unsigned long long x) {
    return x & (~x + 1ULL);          // == x & -x, written overflow-safely
}`,
    },
    {
      language: "cpp",
      caption: "Submask enumeration — every subset of a mask, O(2^popcount(m))",
      source: `#include <cstdio>

// Visits every submask of m exactly once, in decreasing numeric order.
void forEachSubmask(unsigned m) {
    for (unsigned s = m; s; s = (s - 1) & m) {
        printf("%u\\n", s);          // s is a non-empty submask of m
    }
    printf("0\\n");                  // the empty submask, handled separately
}

// Summed over all m in [0, 2^n): sum of 2^popcount(m) = 3^n.
// So a "for every mask, for every submask" DP is O(3^n) time, O(2^n) space.`,
    },
  ],
  interviewQA: [
    {
      q: "Explain why `x & -x` isolates the lowest set bit and `x & (x-1)` clears it.",
      a: "In two's complement, `-x == ~x + 1`. Write x as a prefix P, then its lowest set bit, then k trailing zeros. Inverting gives ~P, a 0, then k ones; adding 1 carries through those k ones back into the bit position, producing ~P, a 1, then k zeros. ANDing with x kills the prefix (P & ~P = 0) and keeps only that one bit. For `x & (x-1)`: subtracting 1 borrows through the k trailing zeros, turning them into ones and flipping the lowest set bit to 0 while leaving the prefix intact; the AND therefore clears exactly that bit. That gives Kernighan's popcount, which loops once per set bit — O(popcount) rather than O(width) — in O(1) space.",
      followUps: [
        "Why should you use unsigned types for these expressions in C++?",
        "When would you use `__builtin_popcountll` instead of the loop?",
      ],
    },
    {
      q: "An array has every element twice except one appearing once. Find it in O(1) space. What if two elements appear once?",
      a: "XOR everything: pairs cancel because a ^ a == 0, leaving the single value. O(n) time, O(1) space. For two singletons a and b, XOR the whole array to get d = a ^ b, which is non-zero. Take any set bit of d — conveniently `d & -d` — since that bit differs between a and b. Partition the array by that bit and XOR each group independently: one group yields a, the other b. Every duplicate pair lands in the same group so it still cancels. Still O(n) time and O(1) space, in two passes or one pass with two accumulators.",
      followUps: [
        "What changes if every element appears three times except one?",
        "How does this compare to a hash-set solution in space?",
      ],
    },
  ],
  flashcards: [
    {
      front: "`x & -x` and `x & (x-1)` — what do they do?",
      back: "`x & -x` isolates the lowest set bit; `x & (x-1)` clears it. Both O(1). Repeatedly clearing gives Kernighan's popcount in O(popcount(x)) iterations, O(1) space.",
    },
    {
      front: "How do you enumerate all submasks of a mask m?",
      back: "`for (int s = m; s; s = (s - 1) & m)` then handle s = 0 separately. O(2^popcount(m)) per mask; O(3^n) summed over all n-bit masks.",
    },
    {
      front: "Three C++ shift pitfalls?",
      back: "1) `1 << 31` overflows signed int — use `1u`/`1LL`. 2) Shifting by >= the type's width is undefined behaviour, not zero. 3) `__builtin_popcount` is 32-bit; use `__builtin_popcountll` for 64-bit values.",
    },
  ],
  cheatSheet: [
    "Test/set/clear/toggle bit i: `(x>>i)&1`, `x |= 1u<<i`, `x &= ~(1u<<i)`, `x ^= 1u<<i` — all O(1).",
    "`x & -x` = lowest set bit; `x & (x-1)` = clear it; `x && !(x & (x-1))` = power of two.",
    "XOR: a^a=0, a^0=a — single-number in O(n) time, O(1) space.",
    "Submasks: `for (s = m; s; s = (s-1) & m)`; all-mask-all-submask loops are O(3^n).",
    "Always use unsigned / `1LL` for shifts; shifting by >= width is UB.",
  ],
};
