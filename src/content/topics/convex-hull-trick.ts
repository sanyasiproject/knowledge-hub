import type { TopicContent } from "../types";

export const convexHullTrick: TopicContent = {
  quickSummary: [
    "Turns `dp[i] = min over j of (m_j·x_i + c_j)` from O(n²) into O(n) by keeping only the lines that are minimal somewhere — the lower envelope of a set of lines is convex.",
    "**Precondition for the O(n) monotone version:** lines must be inserted in monotone slope order *and* queries must arrive in monotone x order. Break either and this variant is wrong, not just slow.",
    "Insertion pops the previous line while it is provably never minimal (`bad()` compares two intersection abscissas); queries walk a pointer forward. Both are O(1) amortised.",
  ],
  detailed: [
    `A huge family of DPs has the shape \`dp[i] = min over j < i of (dp[j] + f(j)·g(i) + h(i))\`. Rewriting \`m_j = f(j)\` and \`c_j = dp[j]\`, each earlier state j contributes a **line** \`y = m_j·x + c_j\`, and computing \`dp[i]\` means evaluating all those lines at \`x = g(i)\` and taking the minimum. Doing that literally is O(n²).

The saving observation is that the pointwise minimum of a set of lines is a convex piecewise-linear function, and only O(n) of the lines ever touch it. Maintain that lower envelope — the "hull" — and each query is a lookup on it rather than a scan.`,
    `## The pop-when-worse condition

Store lines sorted by strictly decreasing slope (for minimum queries). Given three consecutive lines A, B, C, line B is redundant precisely when A and C already cross at or before the point where A and B cross — beyond that abscissa C is below A, and B never gets a turn.

Writing intersection abscissas out, B is bad when \`(c_C - c_A)/(m_A - m_C) <= (c_B - c_A)/(m_A - m_B)\`. Both denominators are positive because slopes strictly decrease, so cross-multiplying keeps the inequality direction and removes the division:

\`\`\`
(c_C - c_A) * (m_A - m_B)  <=  (c_B - c_A) * (m_A - m_C)
\`\`\`

Warning: those products are the classic overflow bug. With 64-bit slopes and intercepts each factor can approach 2⁶³, so the product needs 128 bits — cast to \`__int128\`. \`long double\` also works and is faster, but it carries only 64 bits of mantissa, so it can misjudge near-ties and corrupt the hull. Prefer \`__int128\` unless you have measured that it matters.

Each line is pushed once and popped at most once, so insertion is O(1) amortised. With queries monotone in x, a single forward pointer never moves backwards: also O(1) amortised. Total O(n) time, O(n) space.`,
    `## Choosing the right variant

| Slopes | Queries | Structure | Per-op cost |
| --- | --- | --- | --- |
| monotone | monotone | monotone CHT (vector + pointer) | O(1) amortised |
| monotone | arbitrary | same hull, binary search the query | O(log n) |
| arbitrary | arbitrary | **Li Chao tree** or LineContainer | O(log C) / O(log n) |

Key insight: the pointer walk is the *only* part that needs monotone queries, and the \`bad()\` popping is the *only* part that needs monotone slopes. If just the queries are unordered, keep the same hull and binary-search it for O(log n). If the slopes arrive in no useful order, abandon the hull entirely — that is exactly the case the **Li Chao tree** topic covers, which inserts any line in O(log C) with no ordering assumption at all, at the cost of a log factor and a bounded x-domain.

Common mistake: reusing a monotone-CHT template on a problem where slopes happen to be sorted but queries are not. It compiles, runs fast, and returns wrong answers on the tests where x decreases — reset the pointer to zero per query and binary-search instead, or switch to Li Chao.

For maximum queries, either negate everything (insert \`-m, -c\` and negate the result) or flip both comparison directions and insert in *increasing* slope order.`,
  ],
  code: [
    {
      language: "cpp",
      caption: "Monotone CHT for minimum queries — O(1) amortised add and query",
      source: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

// Lower envelope of lines y = m*x + c, answering MINIMUM queries.
//
// PRECONDITIONS (both required for the O(1) amortised behaviour AND correctness):
//   1. add() is called with strictly DECREASING slopes.
//   2. query() is called with NON-DECREASING x.
//
// O(1) amortised per operation -> O(n) total time, O(n) space.
struct MonotoneCHT {
    vector<ll> m, c;
    size_t ptr = 0;

    // Is the middle line b redundant, given neighbours a (steeper) and d (flatter)?
    // b is never the minimum iff  x_intersect(a,d) <= x_intersect(a,b), i.e.
    //   (c[d]-c[a]) / (m[a]-m[d])  <=  (c[b]-c[a]) / (m[a]-m[b]).
    // Slopes strictly decrease so both denominators are > 0 and cross-multiplying
    // preserves the direction.
    //
    // OVERFLOW: each factor can reach ~2^63, so the product needs 128 bits.
    // __int128 is exact. (long double is faster but has a 64-bit mantissa and can
    // misjudge near-ties, silently corrupting the hull -- avoid unless measured.)
    bool bad(size_t a, size_t b, size_t d) const {
        return (__int128)(c[d] - c[a]) * (m[a] - m[b])
            <= (__int128)(c[b] - c[a]) * (m[a] - m[d]);
    }

    void add(ll slope, ll intercept) {
        m.push_back(slope);
        c.push_back(intercept);
        // Pop the SECOND-TO-LAST line while it is provably never minimal.
        while (m.size() >= 3 && bad(m.size() - 3, m.size() - 2, m.size() - 1)) {
            m.erase(m.end() - 2);
            c.erase(c.end() - 2);
        }
        if (ptr >= m.size()) ptr = m.size() - 1;   // a pop may have passed the pointer
    }

    ll eval(size_t i, ll x) const { return m[i] * x + c[i]; }

    ll query(ll x) {
        if (ptr >= m.size()) ptr = m.size() - 1;
        // Monotone x: the optimum only ever moves forward, so this never rewinds.
        while (ptr + 1 < m.size() && eval(ptr + 1, x) <= eval(ptr, x)) ++ptr;
        return eval(ptr, x);
    }
};`,
    },
    {
      language: "cpp",
      caption: "Unordered queries: keep the hull, binary-search it — O(log n) per query",
      source: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

// Drop-in replacement for MonotoneCHT::query when x is NOT monotone.
// The hull itself is unchanged, so slopes must still be inserted in decreasing order.
// O(log n) per query. If SLOPES are also unordered, use a Li Chao tree instead.
ll queryAnyX(const vector<ll>& m, const vector<ll>& c, ll x) {
    // The envelope is convex in the index, so eval(i) is unimodal: binary-search
    // for the first index whose successor is not an improvement.
    size_t lo = 0, hi = m.size() - 1;
    while (lo < hi) {
        size_t mid = lo + (hi - lo) / 2;
        if (m[mid + 1] * x + c[mid + 1] <= m[mid] * x + c[mid]) lo = mid + 1;
        else hi = mid;
    }
    return m[lo] * x + c[lo];
}`,
    },
  ],
  cheatSheet: [
    "Recognise the shape `dp[i] = min_j (dp[j] + f(j)·g(i)) + h(i)` → line `y = f(j)·x + dp[j]`, query at `x = g(i)`.",
    "Monotone CHT precondition: slopes decreasing (for min) AND queries non-decreasing. Both, or it is wrong.",
    "bad(A,B,C): `(c_C-c_A)*(m_A-m_B) <= (c_B-c_A)*(m_A-m_C)` — wrap in `__int128`.",
    "O(n) total time, O(n) space when monotone; O(n log n) with binary-searched queries.",
    "Slopes unordered → Li Chao tree, O(log C) per op, no ordering assumption.",
    "Maximum instead of minimum: negate m and c, or flip comparisons and insert increasing slopes.",
  ],
  interviewQA: [
    {
      q: "Your DP is dp[i] = min over j < i of (dp[j] + a[j]·b[i]), which is O(n²). How do you speed it up, and what must be true for your method to work?",
      a: "Each j defines a line y = a[j]·x + dp[j], and computing dp[i] is evaluating every line at x = b[i] and taking the minimum. The pointwise minimum of a set of lines is a convex piecewise-linear function, so only the lines on that lower envelope ever matter — that is the convex hull trick. If a[j] arrives in strictly decreasing order I keep the hull in a vector, and when pushing a new line I pop the second-to-last while it is provably never minimal, which is the condition that the outer two lines already cross at or before where the first two cross. If b[i] is also non-decreasing, a single forward pointer finds the optimum, never rewinding. Each line is pushed and popped once and the pointer only advances, so the whole DP is O(n) time and O(n) space. The preconditions are load-bearing: monotone slopes are what make the pop-from-the-back insertion valid, and monotone queries are what make the pointer walk valid. If only the queries are unordered I keep the same hull and binary-search it for O(log n) per query. If the slopes are unordered too, I switch to a Li Chao tree, which inserts any line in O(log C) over a bounded x-domain with no ordering assumption at all.",
      followUps: [
        "Where does this overflow, and how do you fix it?",
        "How would you handle maximum queries instead of minimum?",
      ],
    },
    {
      q: "A convex hull trick implementation gives correct answers on small tests and wrong ones on large inputs. Where do you look first?",
      a: "The overwhelmingly likely cause is integer overflow in the redundancy check. That test compares two intersection abscissas, and to avoid floating-point division it is cross-multiplied into a product of two differences. With 64-bit slopes and intercepts each factor can approach 2⁶³, so the product overflows a signed 64-bit type, the comparison flips, and a line that should have been popped survives — or a needed line is discarded. The fix is to cast both sides to __int128. Using long double is a common substitute but it carries only a 64-bit mantissa, so it can misjudge near-ties and corrupt the hull in a way that only shows up on adversarial data. The second thing I would check is a precondition violation: a monotone-CHT template silently produces wrong answers if the query x values are not non-decreasing, because the forward pointer can never go back to a line it has already passed. Finally I would verify strict slope monotonicity — equal slopes need explicit handling, keeping only the one with the smaller intercept, or the intersection denominator becomes zero.",
    },
  ],
  flashcards: [
    {
      front: "What two preconditions does the O(1)-amortised monotone CHT require?",
      back: "Lines inserted in monotone slope order (decreasing, for min queries) AND queries arriving in monotone x order. Violating either gives wrong answers, not just slow ones.",
    },
    {
      front: "State the CHT pop-when-worse condition for lines A, B, C with decreasing slopes.",
      back: "B is redundant when `(c_C - c_A)·(m_A - m_B) <= (c_B - c_A)·(m_A - m_C)` — i.e. A and C cross at or before A and B cross. Compute in `__int128`.",
    },
    {
      front: "Slopes arrive in arbitrary order — what replaces the hull?",
      back: "A Li Chao tree: O(log C) insert and query over a bounded x-domain, with no slope or query ordering assumption. Costs a log factor versus the O(1) amortised monotone hull.",
    },
  ],
};
