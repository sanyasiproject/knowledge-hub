import type { TopicContent } from "../types";

export const twoHeaps: TopicContent = {
  quickSummary: [
    "Split the data at the median: a **max-heap for the lower half** and a **min-heap for the upper half**. The two roots straddle the middle, so the median is one or two O(1) lookups.",
    "Every insert pushes into one side, moves the offending root across, then rebalances so the sizes differ by at most one — O(log n) per element, O(1) per query.",
    "O(n log n) to consume n elements, O(n) space. The alternative — re-sorting on every query — is O(n log n) *per query*.",
  ],
  detailed: [
    "The problem this solves is maintaining an order statistic under insertion, and the median is the canonical case. A sorted array gives O(1) median but O(n) insertion; a plain heap gives O(log n) insertion but only exposes an extreme, not the middle. Two heaps get both by making the middle *be* the extremes: the largest of the small half and the smallest of the large half sit at the two roots.\n\nKey insight: you never search for the median. You maintain an invariant — `lower.top() <= upper.top()` and `|lower.size() - upper.size()| <= 1` — and the median falls out of the roots for free.",
    "## When do I reach for this\n\nThe cue is **\"median\" or \"middle element\" over data that keeps arriving**, or more generally any problem where you must repeatedly split a growing set into a smaller part and a larger part and query the boundary. It also fits scheduling-style problems that pair a \"cheapest available\" set against a \"most expensive committed\" set. If the data is static, just sort once — two heaps buy nothing.\n\nClassic problems it solves:\n\n| Problem | The two halves |\n| --- | --- |\n| Find Median from Data Stream | lower half / upper half |\n| Sliding Window Median | same, plus lazy deletion (see below) |\n| IPO / Maximize Capital | affordable projects vs. not-yet-affordable |\n| Finding MK Average | a three-way split on the same idea |\n\n## The insert dance\n\nThree steps, in this exact order:\n\n1. Push onto `lower` (the max-heap).\n2. Move `lower.top()` to `upper` — this guarantees the ordering invariant regardless of where the value belonged.\n3. If `upper` is now bigger than `lower`, move `upper.top()` back.\n\nThe median is `lower.top()` when the sizes differ, and the average of the two roots when they are equal.\n\nCommon mistake: comparing the new value against a root and pushing it directly onto the \"right\" side without the cross-move. It looks equivalent but breaks on the empty-heap edge case and on values exactly equal to a root — the unconditional push-then-move version has no special cases at all.",
    "## Sliding-window median: the caveat\n\nExtending this to a fixed window seems trivial — insert the entering element, remove the leaving one — but binary heaps have **no O(log n) delete-arbitrary**; only the root is reachable. Two workarounds:\n\n- **Lazy deletion**: keep a hash map of counts pending removal, and whenever a root is marked stale, pop it. Sizes must then be tracked separately from `heap.size()`, since stale entries still occupy space. Amortised O(log n) per step.\n- **Ordered multiset**: in C++ use two `multiset`s (or one plus an iterator marking the middle), which does support O(log n) erase of a specific element. Simpler to reason about, slightly slower constants.\n\nWarning: mixing up the logical size with `heap.size()` under lazy deletion is the single most common bug here — the rebalancing condition must use the logical counts.\n\n**Cost**: insert O(log n), median query O(1), space O(n). Sliding-window median is O(n log k) for window size k.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Median of a data stream — max-heap lower half, min-heap upper half",
      source: `class MedianFinder {
    priority_queue<int> lower;                                  // max-heap, small half
    priority_queue<int, vector<int>, greater<int>> upper;       // min-heap, large half
public:
    void addNum(int x) {
        lower.push(x);                       // 1. always push left
        upper.push(lower.top());             // 2. move its root right (fixes ordering)
        lower.pop();
        if (upper.size() > lower.size()) {   // 3. rebalance: lower may be +1, never -1
            lower.push(upper.top());
            upper.pop();
        }
    }
    double findMedian() const {
        if (lower.size() > upper.size()) return lower.top();     // odd count
        return (lower.top() + 0.0 + upper.top()) / 2.0;          // even count
    }
};
// addNum O(log n), findMedian O(1), space O(n).
// The unconditional push-then-move needs no empty-heap or equal-value special case.`,
    },
    {
      language: "cpp",
      caption: "Sliding-window median with lazy deletion — the tricky variant",
      source: `class WindowMedian {
    priority_queue<int> lower;                                // max-heap
    priority_queue<int, vector<int>, greater<int>> upper;     // min-heap
    unordered_map<int, int> pending;                          // value -> deletions owed
    int lowN = 0, upN = 0;                 // LOGICAL sizes; heap.size() includes stale

    void pruneLower() { while (!lower.empty() && pending[lower.top()] > 0) { --pending[lower.top()]; lower.pop(); } }
    void pruneUpper() { while (!upper.empty() && pending[upper.top()] > 0) { --pending[upper.top()]; upper.pop(); } }

    void rebalance() {
        if (lowN > upN + 1) { pruneLower(); upper.push(lower.top()); lower.pop(); --lowN; ++upN; }
        else if (lowN < upN) { pruneUpper(); lower.push(upper.top()); upper.pop(); ++lowN; --upN; }
        pruneLower(); pruneUpper();
    }
public:
    void insert(int x) {
        pruneLower();
        if (lower.empty() || x <= lower.top()) { lower.push(x); ++lowN; }
        else                                   { upper.push(x); ++upN; }
        rebalance();
    }
    void erase(int x) {                    // heaps cannot delete in place: defer it
        ++pending[x];
        pruneLower();
        if (!lower.empty() && x <= lower.top()) --lowN; else --upN;
        rebalance();
    }
    double median() {
        pruneLower(); pruneUpper();
        if (lowN > upN) return lower.top();
        return (lower.top() + 0.0 + upper.top()) / 2.0;
    }
};
// Amortised O(log k) per insert/erase, O(1) per query, O(k) live entries.
// Two std::multiset objects are the simpler alternative: real O(log k) erase, no pruning.`,
    },
  ],
  cheatSheet: [
    "`lower` = **max**-heap of the small half; `upper` = **min**-heap of the large half. Roots straddle the median.",
    "Invariants: `lower.top() <= upper.top()` and `0 <= lower.size() - upper.size() <= 1`.",
    "Insert: push to `lower` → move `lower.top()` to `upper` → if `upper` is larger, move one back. No special cases.",
    "Median = `lower.top()` if sizes differ, else the average of the two roots. Use a `double` to avoid integer overflow on the sum.",
    "Insert O(log n), query O(1), space O(n). Sliding window needs lazy deletion or a multiset — heaps have no arbitrary erase.",
  ],
  interviewQA: [
    {
      q: "Design a structure that supports addNum and findMedian on a stream. Justify the complexity.",
      a: "Keep two heaps: a max-heap holding the smaller half of the values and a min-heap holding the larger half, with the size invariant that the max-heap has either the same count or exactly one more. Then the max-heap's root is the largest of the small half and the min-heap's root is the smallest of the large half, so those two roots bracket the median. For an odd total the median is the max-heap's root; for an even total it is the average of the two roots. Insertion is unconditional and branch-free: push onto the max-heap, move its root to the min-heap, and if the min-heap is now larger move its root back. That is at most three heap operations, so O(log n) per element, O(1) per query, and O(n) space for n elements. The alternatives are worse on one axis each: a sorted array gives O(1) median but O(n) insertion because of the shift; a balanced BST with subtree sizes gives O(log n) for both but is far more code; re-sorting on every query is O(n log n) per query. Two heaps are the minimal structure that makes the middle an extreme.",
      followUps: [
        "How would you extend this to an arbitrary percentile rather than the median?",
        "What if values are bounded small integers?",
      ],
    },
    {
      q: "Why the unconditional push-to-lower-then-move-to-upper, instead of comparing the new value against a root and pushing to the correct side?",
      a: "Both are correct if you handle the edge cases, but the unconditional version has none. If you branch on `x <= lower.top()` you must first check that `lower` is non-empty, which is a special case on the very first insert. You also have to think about values exactly equal to a root and about the case where the correct side is already the larger one, which needs a rebalance in the opposite direction. The push-then-move version sidesteps all of it: after pushing `x` onto the max-heap, its root is by definition the largest of the small half including `x`, and moving that root to the min-heap therefore preserves `lower.top() <= upper.top()` no matter where `x` actually belonged. The only remaining condition is the single size check. The cost is one extra pair of heap operations per insert, which does not change the O(log n) bound and buys a function with no branches to get wrong under interview pressure. I would still mention the branching version, since it is marginally faster and some interviewers expect it.",
      followUps: [
        "Which invariant would you assert in a unit test?",
        "Does the argument still hold if you keep the extra element on the min-heap instead?",
      ],
    },
    {
      q: "Extend this to a sliding window of size k. What goes wrong and how do you fix it?",
      a: "The insert side is unchanged, but the removal side breaks: a binary heap only exposes its root, so there is no O(log k) way to delete the element leaving the window — finding it is O(k) and repairing the heap after an arbitrary removal is not supported by `std::priority_queue` at all. Two standard fixes. The first is lazy deletion: record the departing value in a map of pending removals, and whenever a heap root turns out to be marked, pop and discard it before reading or rebalancing. Crucially you must track the *logical* size of each half separately from `heap.size()`, because stale entries still sit in the container, and using the physical size in the rebalance condition is the classic bug — the median silently drifts. Each element is inserted and lazily removed once, so the amortised cost stays O(log k) per step and O(n log k) overall. The second fix, cleaner in C++, is to hold the two halves in `std::multiset` instead, which supports erasing a specific element by iterator in O(log k) with no pruning logic; a common further simplification is a single multiset plus an iterator kept parked on the median, advanced or retreated by one on each update. I would reach for the multiset version unless the interviewer explicitly wants heaps.",
      followUps: [
        "How large can the stale entries grow before memory becomes a problem?",
        "How does an order-statistic tree compare for this?",
      ],
    },
  ],
  flashcards: [
    {
      front: "Two heaps — the setup",
      back: "Max-heap `lower` = smaller half, min-heap `upper` = larger half. Invariants: `lower.top() <= upper.top()`, sizes differ by ≤ 1 with `lower` allowed the extra.",
    },
    {
      front: "Two heaps — insert and complexity",
      back: "Push to `lower`, move `lower.top()` to `upper`, move back if `upper` is larger. O(log n) insert, O(1) median, O(n) space.",
    },
    {
      front: "Why is sliding-window median harder?",
      back: "Heaps have no arbitrary erase. Use lazy deletion with a pending-count map plus separately tracked logical sizes, or two `multiset`s. O(n log k).",
    },
  ],
};
