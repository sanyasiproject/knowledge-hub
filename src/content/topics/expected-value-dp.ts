import type { TopicContent } from "../types";

export const expectedValueDp: TopicContent = {
  quickSummary: [
    "Define the state as the **expected remaining cost** from that state, then write one linear equation per state and solve backwards.",
    "Linearity of expectation lets you sum per-step or per-item expectations even when the events are dependent.",
    "A self-loop `E = 1 + p·E + Σ q_j·E_j` is removed by algebra: `E = (1 + Σ q_j·E_j) / (1 − p)`.",
  ],
  detailed: [
    "The standard framing is `E[s]` = expected number of remaining steps (or remaining cost) starting from state `s`, with `E[terminal] = 0`. One transition step gives `E[s] = cost(s) + Σ P(s → t) · E[t]`. If the transition graph is acyclic you evaluate states in reverse topological order; if it has cycles you get a linear system and solve with Gaussian elimination — unless the only cycles are self-loops, which collapse algebraically.\n\nKey insight: index states so that every transition moves *forward* in the ordering, and the DP becomes a single backward sweep with no linear solver at all.",
    "## Linearity of expectation\n\n`E[X + Y] = E[X] + E[Y]` holds with **no independence assumption**. That is the whole trick behind most expected-value problems: decompose the quantity you want into a sum of indicator or per-phase random variables, compute each expectation in isolation, and add.\n\nFor example, the expected number of fixed points in a random permutation of `n` elements is `Σ P(element i stays put) = n · (1/n) = 1`, even though the events are heavily dependent.",
    "## Worked example: coupon collector\n\nThere are `n` distinct coupons; each draw is uniform. How many draws to collect them all? Split the process into phases by how many distinct coupons you already hold. In phase `k` (holding `k` distinct), each draw is new with probability `(n − k)/n`, so the number of draws in that phase is geometric with mean `n / (n − k)`.\n\nBy linearity, `E = Σ_{k=0}^{n−1} n/(n − k) = n · H(n) ≈ n·(ln n + γ)`. For `n = 5` that is `11.4167` draws. Computing it is **O(n)** time and **O(1)** space.\n\nCommon mistake: multiplying probabilities of phases together instead of summing their expected lengths. Phases are dependent in duration but linearity does not care — you add expectations, never multiply them.",
    "## Self-loops\n\nWhen a state can transition back to itself with probability `p` (a wasted turn — an overshoot, a re-drawn duplicate, a blocked move), naive DP recurses forever. Write the equation and solve for `E` in place:\n\n`E = 1 + p·E + Σ q_j·E_j`  ⇒  `E·(1 − p) = 1 + Σ q_j·E_j`  ⇒  `E = (1 + Σ q_j·E_j) / (1 − p)`\n\nThis is valid whenever `p < 1`. If `p == 1` the state is absorbing and the expectation is infinite.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Coupon collector by linearity of expectation — O(n) time, O(1) space",
      source: `#include <bits/stdc++.h>
using namespace std;

// Expected draws to collect all n distinct coupons.
// Holding k distinct, P(next draw is new) = (n-k)/n, so that phase lasts
// n/(n-k) draws in expectation. Linearity: sum the phases.
double couponCollector(int n) {
    double e = 0.0;
    for (int k = 0; k < n; ++k)
        e += (double)n / (n - k);       // = n * H(n)
    return e;
}

int main() {
    int n;
    cin >> n;
    cout << fixed << setprecision(6) << couponCollector(n) << "\\n";
    // n = 5  ->  11.416667
}`,
    },
    {
      language: "cpp",
      caption: "Backward expected-value DP with a self-loop resolved algebraically — O(n) time, O(n) space",
      source: `// Squares 0..n on a line. Each turn you roll a fair 6-sided die and advance
// by the result, EXCEPT that a roll overshooting square n does nothing (you
// stay put). Expected number of rolls to land exactly on n.
double expectedRolls(int n) {
    vector<double> E(n + 1, 0.0);          // E[n] = 0 (terminal)
    for (int i = n - 1; i >= 0; --i) {
        double sum = 0.0;
        int stay = 0;
        for (int d = 1; d <= 6; ++d) {
            if (i + d <= n) sum += E[i + d];
            else            ++stay;         // overshoot => self-loop
        }
        // E[i] = 1 + (1/6) * (sum + stay * E[i])
        //  =>   E[i] * (1 - stay/6) = 1 + sum/6
        E[i] = (1.0 + sum / 6.0) / (1.0 - stay / 6.0);
    }
    return E[0];
}
// stay <= 5 for every i < n, so the denominator is never zero.`,
    },
  ],
  cheatSheet: [
    "State = expected remaining cost; `E[terminal] = 0`; fill backwards.",
    "`E[s] = cost + Σ P(s→t)·E[t]`; acyclic ⇒ reverse topological sweep, O(V+E).",
    "Self-loop with probability p: `E = (1 + Σ q_j·E_j) / (1 − p)`; infinite if p = 1.",
    "Linearity of expectation needs no independence — decompose into indicators and sum.",
    "Coupon collector: `n·H(n) ≈ n(ln n + 0.5772)`, computed in O(n) time / O(1) space.",
  ],
  interviewQA: [
    {
      q: "Your expected-value DP has a state that transitions to itself. How do you handle it?",
      a: "Do not recurse — solve the equation. Write `E = 1 + p·E + Σ q_j·E_j`, where p is the self-loop probability and the q_j lead to already-computed states. Move the self-term across: `E·(1 − p) = 1 + Σ q_j·E_j`, so `E = (1 + Σ q_j·E_j) / (1 − p)`. This keeps the DP a single backward pass. It is only valid for p < 1; if p equals 1 the state never leaves and the expectation is infinite. If cycles span multiple states rather than a single self-loop, you have a genuine linear system and need Gaussian elimination, which is O(V^3).",
      followUps: ["When would you prefer Gaussian elimination over a backward sweep?"],
    },
    {
      q: "Derive the expected number of draws in the coupon collector problem.",
      a: "Break the process into phases indexed by the number of distinct coupons already held. In phase k you hold k distinct coupons, and each draw is new with probability (n − k)/n. The phase length is therefore geometric with mean n/(n − k). By linearity of expectation the total is the sum over k = 0..n−1 of n/(n − k), which equals n·H(n) where H(n) is the n-th harmonic number, asymptotically n·ln n + γ·n. For n = 5 the value is about 11.42 draws. Note the phases are not independent in any useful sense, but linearity never required independence.",
      followUps: ["What is the variance?", "How does it change if coupon probabilities are non-uniform?"],
    },
  ],
  flashcards: [
    { front: "Standard state definition for expected-value DP?", back: "E[s] = expected remaining cost/steps from state s, with E[terminal] = 0. Fill backwards along the transition order." },
    { front: "How do you eliminate a self-loop of probability p?", back: "`E = 1 + p·E + Σ q_j·E_j` ⇒ `E = (1 + Σ q_j·E_j) / (1 − p)`. Infinite when p = 1." },
    { front: "Coupon collector expected draws?", back: "n·H(n) = n·Σ_{k=1..n} 1/k ≈ n(ln n + γ). Derived by summing geometric phase lengths n/(n−k)." },
  ],
};
