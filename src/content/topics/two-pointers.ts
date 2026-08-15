import type { TopicContent } from "../types";

export const twoPointers: TopicContent = {
  quickSummary: [
    "Replace a nested O(n²) scan with two indices that only ever move forward — O(n) time, O(1) extra space.",
    "Two families: **opposite ends** (converging `lo`/`hi`) and **same direction** (a slow write pointer and a fast read pointer).",
    "The move rule must be justified by an ordering argument — usually sortedness — or the pointer discards a real answer.",
  ],
  detailed: [
    "Two pointers works because each move provably eliminates a whole set of candidate pairs. In sorted pair-sum, if `a[lo] + a[hi] < target`, then `a[lo]` paired with *anything* at or below `hi` is also too small, so the entire row for `lo` dies and `lo` advances. That is n + n moves total instead of n² pairs.\n\nKey insight: the technique is not \"use two variables\" — it is \"prove that one pointer can advance without skipping a solution\".",
    "## Opposite ends\n\n`lo` starts at 0, `hi` at n−1, and they converge. This needs a monotone response to pointer movement, which sortedness supplies: moving `lo` right can only increase the sum, moving `hi` left can only decrease it. Container-with-most-water uses the same shape on an unsorted array, because there the invariant is about the *limiting* height — moving the taller wall inward can never improve the area, so the shorter wall must move.\n\nCommon mistake: applying opposite-ends pair sum to an unsorted array. Without sortedness the elimination argument collapses and you need a hash set instead.",
    "## Same direction\n\nOne pointer reads, the other writes or lags. In-place dedupe on a sorted array keeps `write` at the end of the kept prefix while `read` scans; merging two sorted arrays advances whichever head is smaller. Both are single-pass O(n + m), O(1) extra space beyond the output. The same-direction form is also the backbone of sliding window, where the lagging pointer is the window's left edge.",
    "## Complexity\n\nEvery variant is O(n) time (each pointer traverses the array at most once) and O(1) auxiliary space. If the input must be sorted first, the sort dominates and the total becomes O(n log n) — still far better than the O(n²) brute force, and the reason \"sort, then two pointers\" is such a common opening move in interviews.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Opposite ends — pair sum and container with most water",
      source: `// Sorted array: does any pair sum to target? Returns the indices, or {-1,-1}.
pair<int,int> pairSum(const vector<int>& a, int target) {
    int lo = 0, hi = (int)a.size() - 1;
    while (lo < hi) {
        int s = a[lo] + a[hi];
        if (s == target) return {lo, hi};
        if (s < target) ++lo;      // every pair (lo, j<=hi) is too small
        else            --hi;      // every pair (i>=lo, hi) is too big
    }
    return {-1, -1};
}

// Unsorted heights: largest water area between two walls.
long long maxArea(const vector<int>& h) {
    int lo = 0, hi = (int)h.size() - 1;
    long long best = 0;
    while (lo < hi) {
        long long area = (long long)min(h[lo], h[hi]) * (hi - lo);
        best = max(best, area);
        // The shorter wall caps the area; moving the taller one can't help.
        if (h[lo] < h[hi]) ++lo; else --hi;
    }
    return best;
}
// Both: O(n) time, O(1) space.`,
    },
    {
      language: "cpp",
      caption: "Same direction — in-place dedupe and merge of sorted ranges",
      source: `// Sorted array -> keep one copy of each value. Returns the new length.
int dedupeSorted(vector<int>& a) {
    if (a.empty()) return 0;
    int write = 1;                          // a[0 .. write-1] is the kept prefix
    for (int read = 1; read < (int)a.size(); ++read)
        if (a[read] != a[write - 1])
            a[write++] = a[read];
    return write;
}

// Merge two sorted vectors into one sorted vector.
vector<int> mergeSorted(const vector<int>& a, const vector<int>& b) {
    vector<int> out;
    out.reserve(a.size() + b.size());
    size_t i = 0, j = 0;
    while (i < a.size() && j < b.size())
        out.push_back(a[i] <= b[j] ? a[i++] : b[j++]);   // '<=' keeps a first
    while (i < a.size()) out.push_back(a[i++]);
    while (j < b.size()) out.push_back(b[j++]);
    return out;
}
// dedupe: O(n) time, O(1) space.  merge: O(n + m) time, O(n + m) output.`,
    },
  ],
  cheatSheet: [
    "Opposite ends: `lo = 0, hi = n-1`, `while (lo < hi)`, move the pointer whose side is provably hopeless.",
    "Same direction: `write` marks the kept prefix, `read` scans — classic in-place filter/dedupe.",
    "Precondition is usually sortedness; if the array is unsorted, sort first (O(n log n)) or use a hash set.",
    "Time O(n), auxiliary space O(1) — each pointer moves monotonically, never backtracks.",
    "3-sum = fix one index, two-pointer the remaining sorted suffix → O(n²).",
  ],
  interviewQA: [
    {
      q: "Why does the two-pointer pair-sum require a sorted array?",
      a: "The move rule depends on monotonicity. With `lo` and `hi` converging, if `a[lo] + a[hi] < target` I advance `lo` — and that is only safe because sortedness guarantees `a[lo]` paired with any index ≤ `hi` is also below target, so I am discarding pairs that provably cannot be answers. On an unsorted array that argument fails: a smaller sum at the ends says nothing about interior pairs, so advancing either pointer can skip the real solution. For unsorted input I would use a hash set for O(n) time and O(n) space, or sort first and pay O(n log n) if I also need the elements in order or want O(1) space.",
      followUps: [
        "How does container-with-most-water use two pointers on unsorted data?",
        "How do you extend this to 3-sum, and what is the complexity?",
      ],
    },
    {
      q: "Walk through in-place deduplication of a sorted array.",
      a: "I keep two same-direction pointers: `write` marks the end of the deduplicated prefix, `read` scans the rest. Starting with `write = 1`, for each `read` I compare `a[read]` against `a[write - 1]` — the last value I decided to keep. If they differ, the value is new, so I store it at `a[write]` and increment `write`; if they match, I skip it. Because the array is sorted, all duplicates of a value are adjacent, so comparing only against the last kept element is sufficient. At the end, `write` is the new length and `a[0..write-1]` holds the unique values. One pass, O(n) time, O(1) extra space, and `write` never overtakes `read`, so the writes never clobber unread data.",
      followUps: [
        "How would you modify it to allow at most two copies of each value?",
        "Why is it safe to overwrite in place — could write ever pass read?",
      ],
    },
  ],
  flashcards: [
    {
      front: "What justifies moving a pointer in the two-pointer technique?",
      back: "A proof that every candidate involving the current position is already ruled out — usually from sortedness. Without it, the pointer may skip a valid answer.",
    },
    {
      front: "Two-pointer families",
      back: "Opposite ends (lo/hi converge — sorted pair sum, container with most water) and same direction (slow write + fast read — dedupe, merge, sliding window).",
    },
    {
      front: "Two-pointer complexity",
      back: "O(n) time, O(1) auxiliary space. If the input has to be sorted first, the sort dominates at O(n log n).",
    },
  ],
};
