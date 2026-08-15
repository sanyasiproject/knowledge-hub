import type { TopicContent } from "../types";

export const quickselect: TopicContent = {
  quickSummary: [
    "Quicksort that recurses into **only one side** — finds the k-th smallest element without fully sorting.",
    "O(n) expected time, O(n²) worst case, O(1) extra space with an iterative loop.",
    "In C++ this is `std::nth_element`; median-of-medians makes the worst case O(n) at the cost of a large constant.",
  ],
  detailed: [
    "Quickselect exploits the fact that a partition step tells you exactly where the pivot belongs in sorted order. After partitioning around index p, the pivot is final: everything left of it is smaller, everything right is larger. If `p == k` you are done; otherwise only one side can contain the k-th element, so you discard the other half entirely instead of recursing into both like quicksort does.\n\nKey insight: quicksort's recursion is T(n) = 2T(n/2) + n = O(n log n); quickselect's is T(n) = T(n/2) + n, and that geometric series n + n/2 + n/4 + … sums to 2n = O(n).",
    "## Why the worst case is O(n²)\n\nThe linear bound is *expected*, over the randomness of pivot choice. If every pivot lands at an extreme — a sorted array with last-element pivots is the classic trigger — each partition removes one element and you do n + (n−1) + … = O(n²) work. The fix is cheap: pick the pivot uniformly at random (or median-of-three). Randomisation makes the bad case depend on the RNG rather than the input, so no adversarial test can reliably trigger it.\n\nWarning: a deterministic first- or last-element pivot on already-sorted input is the single most common way quickselect blows up in practice.",
    "## Median of medians\n\nBlum–Floyd–Pratt–Rivest–Tarjan gives a *guaranteed* O(n) worst case: split into groups of five, take each group's median, recursively select the median of those, and use it as the pivot. It provably discards at least 30% of the array per step, yielding T(n) = T(n/5) + T(7n/10) + O(n) = O(n). It is a beautiful result and almost never used in practice — the constant factor is large enough that randomised quickselect wins on real inputs. Know it for interviews and for hard real-time guarantees.",
    "## Use std::nth_element\n\n`std::nth_element(first, nth, last)` partially reorders the range so the element at `nth` is the one that would be there after a full sort, with everything before it ≤ it. It is introselect — randomised quickselect with a median-of-medians-style fallback on bad recursion depth — so it is O(n) average with a guarded worst case. Use it for medians, top-k and percentile queries: O(n) beats sorting's O(n log n), and for top-k it also beats a size-k heap's O(n log k).",
  ],
  code: [
    {
      language: "cpp",
      caption: "Iterative quickselect with a randomised Lomuto partition",
      source: `#include <random>

static std::mt19937 rng(random_device{}());

// Lomuto partition on a[lo..hi] (inclusive); returns the pivot's final index.
int partitionLomuto(vector<int>& a, int lo, int hi) {
    int r = lo + (int)(rng() % (unsigned)(hi - lo + 1));  // random pivot
    swap(a[r], a[hi]);                                    // park it at the end
    int pivot = a[hi], i = lo;
    for (int j = lo; j < hi; ++j)
        if (a[j] < pivot) swap(a[i++], a[j]);
    swap(a[i], a[hi]);                                    // pivot to its place
    return i;                                             // a[i] is now final
}

// Returns the k-th smallest element, k is 0-indexed. Modifies 'a'.
int quickselect(vector<int>& a, int k) {
    int lo = 0, hi = (int)a.size() - 1;
    while (lo < hi) {
        int p = partitionLomuto(a, lo, hi);
        if (p == k) return a[k];
        if (p < k) lo = p + 1;      // k-th lies strictly right of the pivot
        else       hi = p - 1;      // k-th lies strictly left of the pivot
    }
    return a[k];                    // lo == hi == k
}
// Expected O(n) time (n + n/2 + n/4 + ... = 2n); worst case O(n^2).
// Space O(1) - the loop replaces the tail recursion.`,
    },
    {
      language: "cpp",
      caption: "The standard-library way — std::nth_element for median and top-k",
      source: `// Median of a vector (lower median for even n). O(n) average.
int median(vector<int> a) {                 // by value: nth_element reorders
    size_t mid = a.size() / 2;
    nth_element(a.begin(), a.begin() + mid, a.end());
    return a[mid];                          // a[mid] is now the correct value
}

// k largest elements, unordered. O(n) average, beats a size-k heap's O(n log k).
vector<int> topK(vector<int> a, int k) {
    if (k >= (int)a.size()) return a;
    nth_element(a.begin(), a.begin() + k, a.end(), greater<int>());
    a.resize(k);                            // a[0..k-1] are the k largest
    return a;
}
// Post-condition of nth_element: *nth is the element that would sit there
// after a full sort, and no element before nth compares greater than it.
// Neither side is itself sorted.`,
    },
  ],
  cheatSheet: [
    "Partition, then recurse into ONE side — T(n) = T(n/2) + n = O(n) expected.",
    "Worst case O(n²) on adversarial pivots; randomise the pivot to make it practically unreachable.",
    "Space O(1) if you loop instead of recursing on the surviving side.",
    "Median of medians (groups of 5) = guaranteed O(n), large constant, rarely worth it.",
    "C++: `std::nth_element` (introselect). Median, percentiles, top-k in O(n) instead of O(n log n).",
  ],
  interviewQA: [
    {
      q: "Why is quickselect O(n) on average while quicksort is O(n log n)?",
      a: "Both do an O(n) partition, but quicksort then recurses into both halves while quickselect recurses into only one — the pivot's final position tells it which half can contain the k-th element, so the other half is discarded entirely. Quicksort's recurrence is T(n) = 2T(n/2) + O(n) = O(n log n). Quickselect's is T(n) = T(n/2) + O(n), which expands to n + n/2 + n/4 + … — a geometric series summing to 2n, so O(n). The 'n/2' assumes a balanced split, which holds in expectation with a random pivot. The worst case, where every pivot is an extreme, is O(n²) for both. Quickselect uses O(1) extra space if the recursion is written as a loop.",
      followUps: [
        "How does median-of-medians make the worst case O(n)?",
        "What is the expected number of comparisons, more precisely?",
      ],
    },
    {
      q: "Find the k largest elements in an array of n elements. What are your options?",
      a: "Three approaches. Sorting is O(n log n) time and gives the k elements in order for free. A size-k min-heap is O(n log k) time and O(k) space — the right choice for streaming data or when n does not fit in memory, since it makes a single pass. Quickselect is O(n) expected time and O(1) extra space: partition around the k-th largest, after which the first k slots hold the answer, unordered. In C++ that is `std::nth_element(a.begin(), a.begin()+k, a.end(), greater<int>())`. Quickselect is fastest when the whole array is in memory and I do not need the results sorted; if I do, I can sort just those k afterwards for O(n + k log k). The caveat is quickselect's O(n²) worst case and that it permutes the input — use a random pivot, and copy the array first if the caller needs it intact.",
      followUps: [
        "Which do you pick if the data arrives as an unbounded stream?",
        "How would you find the k largest across a distributed dataset?",
      ],
    },
  ],
  flashcards: [
    {
      front: "Quickselect complexity",
      back: "O(n) expected (T(n) = T(n/2) + n → geometric series 2n), O(n²) worst case, O(1) space when written iteratively.",
    },
    {
      front: "Why randomise the pivot?",
      back: "A fixed first/last pivot degrades to O(n²) on sorted input. A random pivot makes the bad case depend on the RNG, so no input can reliably trigger it.",
    },
    {
      front: "What does std::nth_element guarantee?",
      back: "After the call, `*nth` is the element that a full sort would place there, and nothing before it compares greater. Neither side is sorted. O(n) average (introselect).",
    },
  ],
};
