import type { TopicContent } from "../types";

export const kWayMerge: TopicContent = {
  quickSummary: [
    "Merge k sorted sequences by keeping a **heap of the k current heads**: pop the global minimum, emit it, push that list's next element.",
    "O(N log k) time for N total elements and O(k) space — versus O(N log N) for concatenate-and-sort, and O(Nk) for repeated pairwise scanning.",
    "The heap entry must carry **which list** the value came from (and where in it), otherwise you cannot advance the right cursor.",
  ],
  detailed: [
    "At any moment the smallest unemitted element across all k lists must be one of the k heads, because each list is internally sorted. So you only ever need to compare k candidates, and a min-heap answers \"which head is smallest\" in O(log k). Pop it, append it to the output, and push the successor from the same list. Repeat until the heap drains.\n\nKey insight: the heap size is bounded by **k**, not by N. That is the whole complexity story — every element enters and leaves the heap exactly once, at O(log k) each.",
    "## When do I reach for this\n\nThe cue is the phrase **\"k sorted\"** — k sorted lists, k sorted arrays, k sorted files, k shards of a query result. More generally, reach for it whenever you must consume several already-ordered streams in global order without materialising them all, which is exactly what external merge sort and LSM-tree compaction do on disk. If instead you have one list and want the k best elements, that is the top-k pattern, not this one.\n\nClassic problems it solves:\n\n| Problem | Heap holds |\n| --- | --- |\n| Merge k Sorted Lists | the k current list nodes |\n| Merge Sorted Array (k = 2) | trivial two-pointer, no heap needed |\n| Smallest Range Covering Elements from K Lists | one element per list; range is `maxSoFar - heap.top()` |\n| Kth Smallest Element in a Sorted Matrix | row heads, pop k - 1 times |\n| Find K Pairs with Smallest Sums | frontier of (i, j) index pairs |\n| Merge k sorted files / external sort | one buffered head per input file |",
    "## Smallest range covering k lists\n\nThe variant worth knowing: pick one number from each of k sorted lists so the covering range is minimal. Seed the heap with the first element of each list and track the maximum among them. The current window is `[heap.top(), maxSoFar]` and it covers every list by construction. To shrink it you must raise the minimum, so pop the smallest and push its list's successor, updating `maxSoFar`. Stop when any list is exhausted — at that point no smaller range can still cover everything.\n\nCommon mistake: advancing the list whose head is the *maximum*. That widens the window instead of tightening it and never terminates usefully; you always advance past the current minimum.",
    "## Cost and alternatives\n\n**Time O(N log k)**, **space O(k)** for the heap plus O(N) for the output if you materialise it. Alternatives: concatenating everything and sorting is O(N log N) — worse whenever k < N, which is essentially always — and it needs all N elements in memory. Merging pairwise in sequence (list 1 with 2, then with 3, …) is O(Nk) because early elements are copied k times. Merging pairwise in a **tournament**, halving the number of lists each round, is also O(N log k) and is the usual choice when the merge step is already implemented and you want to avoid heap bookkeeping.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Merge k sorted linked lists with a heap of heads — O(N log k)",
      source: `struct ListNode { int val; ListNode* next; };

struct ByValue {                       // greater<> on val => min-heap
    bool operator()(ListNode* a, ListNode* b) const { return a->val > b->val; }
};

ListNode* mergeKLists(vector<ListNode*>& lists) {
    priority_queue<ListNode*, vector<ListNode*>, ByValue> h;
    for (ListNode* node : lists) if (node) h.push(node);   // seed with the heads

    ListNode dummy{0, nullptr};
    ListNode* tail = &dummy;
    while (!h.empty()) {
        ListNode* smallest = h.top(); h.pop();
        tail->next = smallest;                  // splice, do not copy
        tail = smallest;
        if (smallest->next) h.push(smallest->next);   // advance THAT list
    }
    tail->next = nullptr;
    return dummy.next;
}
// Time O(N log k): every node is pushed and popped once. Space O(k).

// Same idea over k sorted arrays: the heap entry must carry (list, index).
vector<int> mergeKArrays(const vector<vector<int>>& xs) {
    using Item = tuple<int, int, int>;          // (value, listIdx, elemIdx)
    priority_queue<Item, vector<Item>, greater<Item>> h;
    size_t total = 0;
    for (int i = 0; i < (int)xs.size(); ++i) {
        total += xs[i].size();
        if (!xs[i].empty()) h.push({xs[i][0], i, 0});
    }
    vector<int> out;
    out.reserve(total);
    while (!h.empty()) {
        auto [v, li, ei] = h.top(); h.pop();
        out.push_back(v);
        if (ei + 1 < (int)xs[li].size()) h.push({xs[li][ei + 1], li, ei + 1});
    }
    return out;
}
// Time O(N log k), space O(k) for the heap plus O(N) for the output.`,
    },
    {
      language: "cpp",
      caption: "Smallest range covering one element from each of k lists",
      source: `// Returns [lo, hi]: the narrowest range containing at least one element per list.
pair<int,int> smallestRange(const vector<vector<int>>& xs) {
    using Item = tuple<int, int, int>;          // (value, listIdx, elemIdx)
    priority_queue<Item, vector<Item>, greater<Item>> h;
    int hi = INT_MIN;
    for (int i = 0; i < (int)xs.size(); ++i) {
        if (xs[i].empty()) return {0, 0};       // cannot cover an empty list
        h.push({xs[i][0], i, 0});
        hi = max(hi, xs[i][0]);                 // track the current maximum head
    }

    int bestLo = get<0>(h.top()), bestHi = hi;
    while (true) {
        auto [lo, li, ei] = h.top(); h.pop();
        if (hi - lo < bestHi - bestLo) { bestLo = lo; bestHi = hi; }
        if (ei + 1 == (int)xs[li].size()) break;   // that list is exhausted: stop
        int nxt = xs[li][ei + 1];                  // always advance past the MIN
        hi = max(hi, nxt);
        h.push({nxt, li, ei + 1});
    }
    return {bestLo, bestHi};
}
// Time O(N log k), space O(k). The window [heap.top(), hi] always covers every list.`,
    },
  ],
  cheatSheet: [
    "Heap holds exactly one entry per list — the current head. Size is bounded by k, never N.",
    "Entry must be `(value, listIdx, elemIdx)` or a node pointer, so you know which cursor to advance.",
    "Pop the min, emit it, push that list's successor. Repeat until the heap is empty.",
    "O(N log k) time, O(k) space. Concatenate-and-sort is O(N log N); sequential pairwise merging is O(Nk).",
    "Smallest range: window is `[heap.top(), maxSoFar]`; always advance the minimum; stop when a list runs out.",
  ],
  interviewQA: [
    {
      q: "Why is merging k sorted lists with a heap O(N log k) and not O(N log N)?",
      a: "Because the heap only ever holds k items — one live head per list — so every heap operation costs log k rather than log N. Each of the N elements is pushed exactly once, when its predecessor in the same list is popped, and popped exactly once, when it is emitted. That is 2N heap operations at O(log k) each, plus O(k) to seed, giving O(N log k) total and O(k) space. Compare the alternatives: dumping everything into one array and sorting is O(N log N) and throws away the fact that the inputs are already ordered, and it needs all N elements resident. Merging the lists one at a time — result with list 2, then with list 3, and so on — re-copies the accumulated prefix on every round, so the first list's elements are touched k times and the total is O(Nk). A tournament merge that pairs lists up and halves the count each round is also O(N log k), and is often the cleaner implementation when a two-way merge already exists.",
      followUps: [
        "How does the tournament variant's memory profile differ from the heap's?",
        "What if the lists have wildly different lengths?",
      ],
    },
    {
      q: "What exactly do you store in the heap, and what breaks if you store only the value?",
      a: "You store the value together with its provenance: either the list node pointer itself, or a tuple of `(value, listIndex, elementIndex)`. The reason is that after popping the global minimum you must push its successor, and with only the value in hand you have no idea which list to advance. Storing bare values would force a linear scan over all k lists to find the source, degrading each step to O(k) and the whole merge to O(Nk), and it would be outright ambiguous when the same value appears in several lists. With linked lists the pointer already encodes both, since the node knows its own `next`. With arrays a tuple works and, conveniently, the default lexicographic comparison on `(value, listIdx, elemIdx)` orders by value first, which is exactly the ordering you want, with a deterministic tie-break as a free bonus. The one thing to watch is that the comparator must compare values, not pointers — comparing raw pointer addresses compiles fine and produces nonsense.",
      followUps: [
        "How would you make the merge stable across lists?",
        "What changes if the lists are on disk rather than in memory?",
      ],
    },
    {
      q: "In Smallest Range Covering Elements from K Lists, why do you always advance the list holding the minimum, and why stop when one list is exhausted?",
      a: "The heap holds one element per list, so the interval from the current minimum to the current maximum covers every list by construction — that is the invariant. To improve on it you must shrink the interval, and there are only two ways: lower the maximum or raise the minimum. Lowering the maximum is impossible, because each list's cursor only moves forward through sorted data and can never produce a smaller value. So the only productive move is to raise the minimum, which means replacing the current smallest head with its successor in the same list. That is why you always advance past the minimum; advancing anything else would leave the minimum in place and could only keep the range the same or widen it. You stop the moment the list containing the minimum is exhausted, because from then on no valid window exists — every candidate range would have to include a value at least as large as that list's last element while still covering it, and any such range is no narrower than one already considered. Complexity is O(N log k) time and O(k) space, with the best range recorded before each advance.",
      followUps: [
        "How would you also return which element was chosen from each list?",
        "Can this be reformulated as a sliding window over the merged sequence?",
      ],
    },
  ],
  flashcards: [
    {
      front: "K-way merge — the loop",
      back: "Seed a min-heap with each list's head. Pop the min, emit it, push that list's next element. Heap size stays ≤ k.",
    },
    {
      front: "K-way merge complexity",
      back: "O(N log k) time, O(k) space — each of N elements is pushed and popped once at log k. Concatenate-and-sort: O(N log N). Sequential pairwise: O(Nk).",
    },
    {
      front: "Smallest range over k lists — invariant",
      back: "Window `[heap.top(), maxSoFar]` always covers every list. Only the minimum can be raised, so always advance the min's list; stop when that list is exhausted.",
    },
  ],
};
