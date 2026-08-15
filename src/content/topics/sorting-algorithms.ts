import type { TopicContent } from "../types";

export const sortingAlgorithms: TopicContent = {
  quickSummary: [
    "Comparison sorts cannot beat O(n log n) — merge, quick and heap sort all sit at that bound with different constants and space profiles.",
    "Counting and radix sort break the bound by not comparing, but only when keys are small integers.",
    "`std::sort` is **introsort**: quicksort, with a heapsort fallback on bad recursion depth and insertion sort on tiny ranges.",
  ],
  detailed: [
    "The Ω(n log n) lower bound is a counting argument, not an engineering limit. A comparison sort's execution is a decision tree; sorting n distinct elements needs at least n! leaves, and a binary tree with n! leaves has height ≥ log₂(n!) = Θ(n log n). Any algorithm whose only tool is `a < b` inherits that floor.\n\nKey insight: counting sort is not \"faster than the bound\" — it sidesteps the bound entirely by using keys as array indices instead of comparing them.",
    "## Stability, and why it matters\n\nA sort is **stable** if equal keys keep their original relative order. Merge, insertion and counting sort are stable; quicksort and heapsort are not. Stability is what lets you sort by multiple keys in passes: sort by secondary key, then stably sort by primary key, and the secondary order survives inside each group. In C++, `std::sort` is unstable and `std::stable_sort` is the O(n log n) stable variant (it uses O(n) scratch memory, degrading to O(n log² n) if allocation fails).",
    "## Why std::sort is introsort\n\nQuicksort has the best cache behaviour and constants of the O(n log n) family, but an adversarial input can drive it to O(n²). Introsort keeps quicksort's speed and caps its worst case: it tracks recursion depth and, past roughly 2·log₂(n), switches the current subrange to heapsort — O(n log n) guaranteed, in place. Subranges under ~16 elements are left unsorted during recursion and cleaned up by a single final insertion-sort pass, which is very fast on nearly-sorted data.\n\nIn practice: this is why `std::sort` gives you O(n log n) worst case, O(log n) stack space, and still beats a hand-written mergesort on typical data.",
    "## When O(n) sorting applies\n\nCounting sort runs in O(n + k) time and O(n + k) space for integer keys in a range of size k — it is a win only when k = O(n). Radix sort applies counting sort digit by digit: O(d · (n + b)) for d digits in base b, stable by construction, and the standard choice for fixed-width integers or strings.\n\nWarning: counting sort on 32-bit keys with no range guarantee allocates a 4-billion-entry table. Always bound k before reaching for it.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Merge sort — stable, O(n log n) worst case, O(n) extra space",
      source: `void mergeSort(vector<int>& a, int lo, int hi, vector<int>& buf) {
    if (hi - lo <= 1) return;                 // half-open [lo, hi)
    int mid = lo + (hi - lo) / 2;
    mergeSort(a, lo, mid, buf);
    mergeSort(a, mid, hi, buf);

    int i = lo, j = mid, k = lo;
    while (i < mid && j < hi)
        buf[k++] = (a[j] < a[i]) ? a[j++] : a[i++];  // '<' keeps it stable
    while (i < mid) buf[k++] = a[i++];
    while (j < hi)  buf[k++] = a[j++];
    for (int t = lo; t < hi; ++t) a[t] = buf[t];
}

void mergeSort(vector<int>& a) {
    vector<int> buf(a.size());
    mergeSort(a, 0, (int)a.size(), buf);
}`,
    },
    {
      language: "cpp",
      caption: "Counting sort — O(n + k), stable, for keys in [0, k)",
      source: `// Stable counting sort of 'a' whose values lie in [0, k).
vector<int> countingSort(const vector<int>& a, int k) {
    vector<int> cnt(k, 0);
    for (int x : a) ++cnt[x];
    for (int v = 1; v < k; ++v) cnt[v] += cnt[v - 1];   // prefix sums

    vector<int> out(a.size());
    for (int i = (int)a.size() - 1; i >= 0; --i)        // reverse => stable
        out[--cnt[a[i]]] = a[i];
    return out;
}
// Time O(n + k), space O(n + k). Only worthwhile when k = O(n).`,
    },
  ],
  comparison: {
    columns: ["Algorithm", "Time (avg / worst)", "Space", "Stable", "When to use"],
    rows: [
      [
        "Merge sort",
        "O(n log n) / O(n log n)",
        "O(n)",
        "Yes",
        "Stability required; linked lists; external sorting of data larger than RAM",
      ],
      [
        "Quicksort",
        "O(n log n) / O(n²)",
        "O(log n) stack",
        "No",
        "General in-memory sorting; best cache locality and constants",
      ],
      [
        "Heapsort",
        "O(n log n) / O(n log n)",
        "O(1)",
        "No",
        "Hard worst-case guarantee with no extra memory; introsort's fallback",
      ],
      [
        "Insertion sort",
        "O(n²) / O(n²)",
        "O(1)",
        "Yes",
        "n ≲ 16 or nearly-sorted input; the final pass inside introsort",
      ],
      [
        "Counting sort",
        "O(n + k) / O(n + k)",
        "O(n + k)",
        "Yes",
        "Small integer key range (k = O(n)), e.g. ages, grades, byte values",
      ],
      [
        "Radix sort (LSD)",
        "O(d(n + b)) / O(d(n + b))",
        "O(n + b)",
        "Yes",
        "Fixed-width integers or equal-length strings; large n, bounded key width",
      ],
    ],
  },
  cheatSheet: [
    "Comparison-sort lower bound: Ω(n log n), from log₂(n!) on the decision tree.",
    "`std::sort` = introsort (quick → heap on deep recursion → insertion on small ranges); unstable, O(n log n) worst case.",
    "`std::stable_sort` = stable, O(n log n) with O(n) scratch, O(n log² n) if allocation fails.",
    "Stable = merge, insertion, counting, radix. Unstable = quick, heap, selection.",
    "Counting sort only when the key range k = O(n); otherwise the count table dominates.",
  ],
  interviewQA: [
    {
      q: "Why is std::sort not stable, and what do you use when you need stability?",
      a: "`std::sort` is introsort — a quicksort variant with a heapsort fallback and a final insertion pass. Quicksort's partition step swaps elements across the array, so equal keys can cross each other; heapsort likewise reorders through the heap. Making them stable would cost O(n) auxiliary memory, and the standard deliberately keeps `std::sort` in-place with O(log n) stack. When I need stability I use `std::stable_sort`, which is O(n log n) with an O(n) buffer (falling back to an in-place merge at O(n log² n) if allocation fails). Alternatively, I make the comparator total by appending the original index as a tiebreaker, which gives stable ordering with an unstable sort.",
      followUps: [
        "Why does multi-key sorting by successive passes require stability?",
        "What is the cost of the index-tiebreaker trick versus stable_sort?",
      ],
    },
    {
      q: "When would you use counting or radix sort instead of a comparison sort?",
      a: "When the keys are integers over a bounded range. Counting sort is O(n + k) time and O(n + k) space for keys in [0, k); it beats O(n log n) only if k is O(n) — sorting a million ages or byte values is ideal, sorting a million arbitrary 64-bit integers is not, because the count table would be astronomically large. Radix sort fixes that by processing d digits in base b with a stable counting sort per digit: O(d·(n + b)) time, O(n + b) space, which handles fixed-width keys like 32-bit integers in 4 passes of base 256. Both are stable. The trade-off is that they need direct key access, so they do not apply to arbitrary comparator-defined orders.",
      followUps: [
        "Why must the per-digit sort inside radix sort be stable?",
        "How would you radix sort signed integers or floats?",
      ],
    },
  ],
  flashcards: [
    {
      front: "Why can't a comparison sort beat O(n log n)?",
      back: "Its execution is a binary decision tree that needs n! leaves to distinguish all permutations; height ≥ log₂(n!) = Θ(n log n).",
    },
    {
      front: "What algorithm is std::sort?",
      back: "Introsort: quicksort, switching to heapsort past ~2·log₂(n) recursion depth, with a final insertion sort on small ranges. Unstable, O(n log n) worst case, O(log n) space.",
    },
    {
      front: "When is counting sort O(n)?",
      back: "When keys are integers in a range k = O(n). Cost is O(n + k) time and space — with unbounded k the count table dominates.",
    },
  ],
};
