import type { TopicContent } from "../types";

export const greedyAlgorithms: TopicContent = {
  quickSummary: [
    "Build the answer one locally-best choice at a time, never reconsidering — fast, but only correct when the problem has the right structure.",
    "Proof tools: the **exchange argument** (any optimal solution can be transformed into the greedy one without getting worse) and matroid intuition (greedy is exactly optimal on matroids).",
    "Most greedy solutions are `sort + one pass`: O(n log n) time, O(1) extra space beyond the sort.",
  ],
  detailed: [
    "Greedy commits irrevocably. At each step it picks whatever looks best by some local rule and never backtracks, which is why it runs in the time it takes to sort. The entire difficulty is not writing the code — it is proving the local rule is safe.",
    "## The exchange argument\nThe standard correctness proof has two parts.\n\n1. **Greedy choice property** — there exists an optimal solution that agrees with greedy's first pick. Take any optimal solution, swap its first pick for greedy's, and show the result is still valid and no worse.\n2. **Optimal substructure** — after removing that choice, what remains is the same problem on a smaller input.\n\nInduct and you are done.\n\nKey insight: if you cannot make the exchange work, that is usually evidence greedy is wrong, not that you are bad at proofs.",
    "## Classic wins\n\n- **Interval scheduling** — to fit the most non-overlapping intervals, always take the one that *finishes earliest*. Finishing early leaves the most room for everything after. O(n log n) time, O(1) space.\n- **Fractional knapsack** — sort by value/weight and fill greedily; you may split an item, so no wasted capacity. O(n log n) time, O(1) space.\n- **Huffman coding** — repeatedly merge the two lowest-frequency nodes with a min-heap. O(n log n) time, O(n) space.\n\nMatroid intuition: when your feasible sets are closed under subsets and satisfy the exchange property, sorting by weight and taking greedily is *provably* optimal. Kruskal's MST is the textbook case.",
    "## Where greedy dies\n0/1 knapsack breaks it. With capacity 10 and items (value, weight) = (60, 10), (100, 6), (120, 5), the best ratio is item 1 (6.0/unit), and greedy takes it for value 60. Taking items 2 and 3 fills the same capacity for 220. You cannot split items, so the local ratio rule lies — you need DP over capacity, O(n·W) time and O(W) space.\n\nCommon mistake: testing a greedy rule on three hand-made examples and shipping it. Either produce an exchange argument or brute-force against greedy on thousands of random small inputs before you trust it.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Interval scheduling — maximum non-overlapping intervals, O(n log n)",
      source: `#include <algorithm>
#include <climits>
#include <vector>
using namespace std;

// Returns the maximum number of mutually non-overlapping intervals.
// Greedy rule: always take the interval that finishes earliest.
int maxNonOverlapping(vector<pair<int,int>> iv) {   // {start, end}
    sort(iv.begin(), iv.end(),
         [](const pair<int,int>& a, const pair<int,int>& b) {
             return a.second < b.second;             // sort by finish time
         });

    int count = 0;
    int lastEnd = INT_MIN;
    for (const auto& [s, e] : iv) {
        if (s >= lastEnd) {      // no overlap with the last chosen interval
            ++count;
            lastEnd = e;
        }
    }
    return count;                // O(n log n) time, O(1) extra space
}`,
    },
    {
      language: "cpp",
      caption: "Fractional knapsack — greedy by value/weight ratio, O(n log n)",
      source: `#include <algorithm>
#include <vector>
using namespace std;

// items: {value, weight}. Items MAY be split, which is what makes greedy safe.
double fractionalKnapsack(vector<pair<double,double>> items, double cap) {
    sort(items.begin(), items.end(),
         [](const pair<double,double>& a, const pair<double,double>& b) {
             return a.first / a.second > b.first / b.second;   // best ratio first
         });

    double total = 0.0;
    for (const auto& [value, weight] : items) {
        if (cap <= 0) break;
        if (weight <= cap) {          // take the whole item
            total += value;
            cap   -= weight;
        } else {                      // take the fraction that fits, then stop
            total += value * (cap / weight);
            cap = 0;
        }
    }
    return total;                     // O(n log n) time, O(1) extra space
}`,
    },
  ],
  comparison: {
    columns: ["Aspect", "Greedy", "Dynamic Programming"],
    rows: [
      ["Decision", "Commits once, never revisits", "Explores all choices, keeps best"],
      ["Typical time", "O(n log n) (sort + pass)", "O(n·W) or O(n^2) over a state space"],
      ["Typical space", "O(1)–O(n)", "O(W) or O(n^2) table"],
      ["Needs", "Greedy-choice property + optimal substructure", "Optimal substructure + overlapping subproblems"],
      ["Fails when", "Local best ≠ global best (0/1 knapsack, coin change with odd denominations)", "State space too large to enumerate"],
    ],
  },
  interviewQA: [
    {
      q: "How do you prove a greedy algorithm is correct?",
      a: "Use an exchange argument. Take any optimal solution O and greedy's first choice g. Show you can swap g into O — replacing whatever conflicting element O used — and the result is still feasible and no worse than O. That establishes the greedy-choice property: some optimal solution starts with g. Then argue optimal substructure: after fixing g, the remaining problem is the same problem on a smaller instance. Induction finishes the proof. For interval scheduling, if O's first interval finishes later than greedy's, swapping in greedy's earliest-finishing interval cannot cause a new conflict, so |O| is preserved.",
      followUps: [
        "What is the matroid connection, and which classic algorithm does it justify?",
        "How would you empirically stress-test a greedy rule you cannot prove?",
      ],
    },
    {
      q: "Why does greedy work for fractional knapsack but fail for 0/1 knapsack?",
      a: "In fractional knapsack you can split items, so the greedy exchange always works: if an optimal solution uses any weight of a lower-ratio item while a higher-ratio item is still available, swap an epsilon of weight between them and the value does not decrease. The knapsack always ends exactly full, so there is no wasted capacity. In 0/1 you cannot split, and the leftover capacity from an all-or-nothing choice can be worthless. With capacity 10 and items (60,10), (100,6), (120,5), greedy by ratio takes the first item for 60, while taking the other two gives 220. 0/1 knapsack needs DP: O(n·W) time, O(W) space with a rolling 1-D array.",
      followUps: [
        "When is coin change solvable greedily?",
        "Can you bound how bad greedy gets on 0/1 knapsack?",
      ],
    },
  ],
  flashcards: [
    {
      front: "Greedy rule for maximum non-overlapping intervals?",
      back: "Sort by earliest finish time and take any interval whose start is >= the last chosen end. O(n log n) time, O(1) extra space. Sorting by start time or by shortest duration is wrong.",
    },
    {
      front: "What two properties must hold for greedy to be correct?",
      back: "Greedy-choice property (some optimal solution contains greedy's first pick — proved by exchange argument) and optimal substructure (the remainder is the same problem, smaller).",
    },
    {
      front: "One-line counterexample that greedy fails 0/1 knapsack?",
      back: "cap=10, items (v,w) = (60,10), (100,6), (120,5). Best ratio picks 60; optimal is 100+120 = 220. Use DP: O(n·W) time, O(W) space.",
    },
  ],
  cheatSheet: [
    "Pattern: sort by the right key, then one linear pass — O(n log n) time, O(1) extra space.",
    "Interval scheduling: sort by END time. Interval merging: sort by START time.",
    "Fractional knapsack: sort by value/weight. 0/1 knapsack: DP, not greedy.",
    "Huffman: min-heap, merge two smallest repeatedly — O(n log n) time, O(n) space.",
    "No exchange argument means no proof — stress-test greedy against brute force on random small inputs.",
  ],
};
