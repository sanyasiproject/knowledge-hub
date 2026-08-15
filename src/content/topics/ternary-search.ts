import type { TopicContent } from "../types";

export const ternarySearch: TopicContent = {
  quickSummary: [
    "Finds the extremum of a strictly unimodal function — one that increases then decreases (or the reverse) with no flat stretches.",
    "Probe two interior points m1 < m2 and compare: f(m1) < f(m2) means the maximum lies right of m1, so discard [lo, m1]. Each round keeps 2/3 of the range.",
    "O(log(range)) function evaluations, O(1) space. On reals use a fixed ~200 iterations; on integers stop at a window of 2-3 and scan it.",
  ],
  detailed: [
    `Binary search needs a monotone predicate. Ternary search relaxes that to *unimodal*: the function rises to a single peak and then falls. One probe is not enough to tell which side the peak is on — a single value carries no direction — so you take two and compare them.

Split [lo, hi] into thirds at m1 = lo + (hi-lo)/3 and m2 = hi - (hi-lo)/3. For a maximum, if f(m1) < f(m2) the peak cannot lie in [lo, m1], so move lo up; otherwise it cannot lie in (m2, hi], so move hi down. Either way the interval shrinks by a factor of 3/2 per round, at a cost of two evaluations. For a minimum, flip the comparison.

Warning: unimodality must be *strict*. A plateau where f(m1) == f(m2) makes both branches wrong, and the algorithm can discard the region containing the answer. Integer problems with ties are the usual victim — check that your function really has no flat stretch before reaching for this.`,
    `## Reals versus integers

They fail in different ways and need different stopping rules.

| | Reals | Integers |
| --- | --- | --- |
| Stop when | fixed iteration count (~200), or hi - lo < eps | hi - lo <= 2 |
| Finish with | return (lo + hi) / 2 | linear scan of the 2-3 survivors |
| Precision limit | ~sqrt(machine eps), about 1e-8 relative | exact |

On reals, a fixed loop count is safer than an epsilon test because an absolute epsilon behaves badly across scales. But do not expect 1e-15: near a smooth peak the function is locally quadratic, so f(m1) and f(m2) differ by less than a double can represent once you are within ~1e-8 of the optimum, and further iterations are just noise.

Common mistake: on integers, writing \`lo = m1\` instead of \`lo = m1 + 1\`. When hi - lo == 3 you get m1 == lo + 1, and assigning lo = m1 still shrinks — but with other gaps the interval can stall and the loop never terminates. Advancing past the discarded probe, plus a final scan of the small window, makes termination unconditional.`,
    `## When to prefer binary search instead

If you can evaluate the *difference* f(x+1) - f(x) (integers) or the derivative f'(x) (reals), that quantity is monotone for a unimodal f — positive before the peak, negative after. Binary searching for the sign change costs one evaluation per round instead of two, and it is more robust because comparing against zero has no tie problem in the same way.

In practice: reach for the derivative form whenever the difference is cheap and exactly computable, and keep ternary search for black-box functions you can only sample. Both are O(log(range)) evaluations and O(1) space; the derivative version simply has half the constant.

Typical uses: minimising the distance from a point to a parabola or a moving object, optimising a split point in a cost function, and "choose k to minimise a convex cost" subproblems inside a larger DP.`,
  ],
  code: [
    {
      language: "cpp",
      caption: "Real-valued maximum — fixed iteration count, O(1) space",
      source: `#include <bits/stdc++.h>
using namespace std;

// Argmax of a STRICTLY unimodal f on [lo, hi].
// 200 iterations shrink the range by (2/3)^200, far below any double's
// resolution -- the real limit is ~1e-8, since near the peak f is flat.
// O(1) space, 400 evaluations of f.
double ternaryMaxReal(double lo, double hi, double (*f)(double)) {
    for (int it = 0; it < 200; ++it) {
        double m1 = lo + (hi - lo) / 3.0;
        double m2 = hi - (hi - lo) / 3.0;
        if (f(m1) < f(m2)) lo = m1;      // peak is right of m1
        else               hi = m2;      // peak is left of (or at) m2
    }
    return (lo + hi) / 2.0;
}

// For a MINIMUM, flip the comparison: if (f(m1) > f(m2)) lo = m1; else hi = m2;
//
// On f(x) = -(x - 2.5)^2 + 7 over [-10, 10] this returns 2.499999978...
// -- the residual 2e-8 error is the flat-peak limit, not a loop bug.`,
    },
    {
      language: "cpp",
      caption: "Integer maximum — guaranteed termination via a small-window scan",
      source: `#include <bits/stdc++.h>
using namespace std;

// Argmax of a STRICTLY unimodal integer function on [lo, hi].
// O(log(hi - lo)) evaluations, O(1) space.
long long ternaryMaxInt(long long lo, long long hi, long long (*f)(long long)) {
    while (hi - lo > 2) {                     // stop at a window of <= 3 values
        long long m1 = lo + (hi - lo) / 3;    // hi-lo >= 3 guarantees
        long long m2 = hi - (hi - lo) / 3;    // lo < m1 < m2 < hi
        if (f(m1) < f(m2)) lo = m1 + 1;       // peak strictly right of m1
        else               hi = m2;           // peak at or left of m2
    }
    // Both branches move an endpoint past the probe, so the gap strictly
    // shrinks every iteration -- no stall, no infinite loop.
    long long best = lo;
    for (long long x = lo + 1; x <= hi; ++x)
        if (f(x) > f(best)) best = x;
    return best;
}

// Verified against brute force on every [lo, hi] window around the true
// argmax, including degenerate ranges where lo == hi.
//
// Cheaper alternative when f(x+1) - f(x) is easy: binary search that
// difference for its sign change -- one evaluation per round instead of two.`,
    },
  ],
  cheatSheet: [
    "Requires STRICT unimodality. Plateaus break both branches — ties are the classic wrong-answer source.",
    "m1 = lo + (hi-lo)/3, m2 = hi - (hi-lo)/3. Max: f(m1) < f(m2) => move lo; else move hi.",
    "O(log(range)) evaluations, O(1) space. Two evaluations per round.",
    "Reals: fixed ~200 iterations, return (lo+hi)/2, expect ~1e-8 accuracy at a smooth peak.",
    "Integers: loop while hi - lo > 2, use lo = m1 + 1, then linearly scan the last 2-3 values.",
    "If f(x+1) - f(x) or f'(x) is available, binary search its sign change instead — half the evaluations.",
  ],
  interviewQA: [
    {
      q: "Why does ternary search need two probes where binary search needs one, and what shrink factor do you get?",
      a: "Binary search relies on a monotone predicate, so a single evaluation tells you which half to keep. For a unimodal function a single value carries no directional information — f(m) being large tells you nothing about whether the peak is left or right. Two probes m1 < m2 give a comparison, and unimodality turns that comparison into an exclusion: for a maximum, f(m1) < f(m2) means f is still rising at m1, so no point in [lo, m1] can be the peak. Placing the probes at the third points discards a third of the interval each round, so the range shrinks by 3/2 per round at a cost of two evaluations, giving O(log(hi - lo)) evaluations and O(1) space. If instead I can compute the difference f(x+1) - f(x), that difference is monotone for a unimodal f, so I can binary search its sign change with one evaluation per round — strictly better when the difference is cheap and exact.",
      followUps: [
        "How do you guarantee the integer version terminates?",
        "What breaks if the function has a flat region?",
      ],
    },
    {
      q: "Write the integer version and explain how you avoid an infinite loop and off-by-one errors.",
      a: "I loop while hi - lo > 2, setting m1 = lo + (hi-lo)/3 and m2 = hi - (hi-lo)/3. With hi - lo >= 3 those satisfy lo < m1 < m2 < hi, so both probes are strictly interior. For a maximum: if f(m1) < f(m2) the peak is strictly right of m1, so I set lo = m1 + 1; otherwise the peak is at or left of m2, so hi = m2. Both assignments move an endpoint strictly inward, which is what guarantees termination — the common bug is lo = m1, which for some gap sizes leaves the interval unchanged and spins forever. I deliberately do not chase the loop down to a single element, because the thirds get unreliable at small widths; instead I exit with at most three candidates and pick the best with a linear scan, which is O(1) extra work and removes every remaining off-by-one. Overall O(log(hi - lo)) evaluations and O(1) space. The precondition worth stating out loud is strict unimodality: if f has a plateau then f(m1) == f(m2) makes both branches unjustified and the answer can be discarded.",
    },
  ],
  flashcards: [
    {
      front: "Precondition for ternary search, and why it matters?",
      back: "Strict unimodality — one peak, no flat stretches. On a plateau f(m1) == f(m2) makes both branches unsound and the answer can be discarded.",
    },
    {
      front: "Complexity and stopping rules?",
      back: "O(log(range)) evaluations, O(1) space. Reals: ~200 fixed iterations. Integers: stop at hi - lo <= 2 and scan the survivors.",
    },
    {
      front: "When should you use binary search instead of ternary search?",
      back: "When f(x+1) - f(x) or f'(x) is cheap and exact — it is monotone for a unimodal f, so binary searching its sign change halves the evaluations.",
    },
  ],
};
