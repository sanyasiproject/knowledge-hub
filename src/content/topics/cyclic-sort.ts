import type { TopicContent } from "../types";

export const cyclicSort: TopicContent = {
  quickSummary: [
    "When the array holds a permutation-ish set of values from **1..n** (or 0..n), sort it by repeatedly swapping each value to its home slot: value `v` belongs at index `v - 1`.",
    "O(n) time and **O(1) extra space** — each swap places at least one value permanently, so there are at most n swaps despite the nested-looking loop.",
    "After the placement pass, one linear scan for `a[i] != i + 1` answers the entire missing / duplicate / first-mismatch family.",
  ],
  detailed: [
    "General sorting cannot beat O(n log n) with comparisons, but this is not general sorting: the values themselves tell you where they go. That extra information — a bijection between the value range and the index range — replaces comparison with direct addressing, the same reason counting sort escapes the bound. The array becomes its own index.\n\nKey insight: the loop condition is `a[i] != a[target]`, **not** `i != target`. Comparing values rather than indices is what keeps the loop from spinning forever when duplicates exist, since two copies of the same value cannot both be placed.",
    "## When do I reach for this\n\nThe cue is a stated range: the problem says the array contains **n numbers taken from 1..n** (or 0..n, or n + 1 numbers from 1..n) and then asks for something missing, duplicated, or out of place — usually with an explicit O(n) time and O(1) space demand. That combination rules out sorting and rules out a hash set, and cyclic sort is essentially the only remaining tool. If the values are unbounded or unrelated to the indices, the pattern does not apply at all.\n\nClassic problems it solves:\n\n| Problem | After placement, look for |\n| --- | --- |\n| Missing Number (0..n) | the one index with `a[i] != i` |\n| Find All Numbers Disappeared in an Array | every index with `a[i] != i + 1` |\n| Find the Duplicate Number | the value sitting where it does not belong |\n| Find All Duplicates in an Array | same scan, collect all of them |\n| Set Mismatch | the single mismatched index gives both the dup and the missing value |\n| First Missing Positive | place only values in 1..n, then scan |\n| Couples Holding Hands | the same swap-to-home idea on pairs |",
    "## Why it is O(n)\n\nThe `while` inside the outer loop looks quadratic, but count the swaps instead of the iterations. Every swap moves at least one value into its final correct slot, and a value never leaves a correct slot afterwards, so there are at most n swaps in total across the whole run. Each iteration of the inner loop either performs a swap (at most n times overall) or advances `i` (exactly n times overall). Total work is O(n), with O(1) extra space — the same amortisation shape as the two-pointer and sliding-window arguments.\n\nCommon mistake: incrementing `i` after a swap. The value that just arrived at `i` may itself be out of place, so you must re-examine the same index until it is settled, and only then advance.",
    "## First Missing Positive — the variant\n\nHere the array is arbitrary, but the answer is provably in `1..n + 1`, so anything outside `1..n` is noise. Place only the in-range values and ignore the rest, then scan for the first index where `a[i] != i + 1`; if none, the answer is `n + 1`. This keeps O(n) time and O(1) space and is the reason interviewers reach for the problem — the obvious hash-set solution is O(n) space, and sorting is O(n log n).\n\n**Complexity summary**: placement O(n) time and O(1) extra space, plus an O(n) scan. Output space is O(1) for a single answer, O(n) when you must return the full list of missing values.",
  ],
  code: [
    {
      language: "cpp",
      caption: "The placement pass, then missing and duplicate numbers in one scan",
      source: `// Values are in 1..n: put value v at index v - 1.
void cyclicSort(vector<int>& a) {
    int n = (int)a.size(), i = 0;
    while (i < n) {
        int home = a[i] - 1;                    // where a[i] wants to live
        if (a[i] != a[home]) swap(a[i], a[home]);  // compare VALUES, not indices
        else ++i;                                // settled (or a duplicate): move on
    }
}
// O(n) time: each swap fixes at least one value permanently, so <= n swaps. O(1) space.

// n distinct values from 1..n with exactly one replaced by a duplicate.
// Returns {duplicate, missing}.
pair<int,int> setMismatch(vector<int> a) {
    cyclicSort(a);
    int n = (int)a.size();
    for (int i = 0; i < n; ++i)
        if (a[i] != i + 1) return {a[i], i + 1};   // wrong tenant, absent owner
    return {-1, -1};
}

// Every value in 1..n that never appears. Output is O(n), extra working space O(1).
vector<int> findDisappeared(vector<int> a) {
    cyclicSort(a);
    vector<int> missing;
    for (int i = 0; i < (int)a.size(); ++i)
        if (a[i] != i + 1) missing.push_back(i + 1);
    return missing;
}`,
    },
    {
      language: "cpp",
      caption: "Missing Number (0..n) and First Missing Positive — same pass, shifted range",
      source: `// n distinct values from 0..n with one absent: value v belongs at index v.
int missingNumber(vector<int>& a) {
    int n = (int)a.size(), i = 0;
    while (i < n) {
        if (a[i] < n && a[i] != a[a[i]]) swap(a[i], a[a[i]]);  // guard v == n
        else ++i;
    }
    for (int j = 0; j < n; ++j) if (a[j] != j) return j;
    return n;                                   // 0..n-1 all present -> n is missing
}
// O(n) time, O(1) space. (XOR or the sum formula also work here; cyclic sort
// generalises to the cases where they do not.)

// Arbitrary integers; the answer is always in 1..n+1, so ignore everything else.
int firstMissingPositive(vector<int>& a) {
    int n = (int)a.size(), i = 0;
    while (i < n) {
        int v = a[i];
        if (v >= 1 && v <= n && a[i] != a[v - 1]) swap(a[i], a[v - 1]);
        else ++i;                               // out of range or already settled
    }
    for (int j = 0; j < n; ++j) if (a[j] != j + 1) return j + 1;
    return n + 1;
}
// O(n) time, O(1) space — beats sorting (O(n log n)) and a hash set (O(n) space).`,
    },
  ],
  cheatSheet: [
    "Applies only when values come from a known index-sized range: 1..n → index `v - 1`; 0..n → index `v`.",
    "Loop: `if (a[i] != a[home]) swap(a[i], a[home]); else ++i;` — compare **values**, never indices, or duplicates loop forever.",
    "Do not advance `i` after a swap; the newly arrived value may also be misplaced.",
    "O(n) time (≤ n swaps, each one permanently placing a value), O(1) extra space.",
    "Then scan once: `a[i] != i + 1` reveals missing values, duplicates, and mismatches.",
  ],
  interviewQA: [
    {
      q: "The placement loop has a nested while. Why is cyclic sort O(n) and not O(n²)?",
      a: "Count swaps rather than iterations. Every swap sends the value `a[i]` to the index it belongs at, so after that swap at least one more element is in its final position — and once a value is in its home slot nothing ever displaces it, because any later swap targeting that index would first check `a[i] != a[home]` and find them equal. Since there are only n slots, there can be at most n swaps over the entire run. The inner loop body does exactly one of two things: perform a swap, which happens at most n times in total, or increment `i`, which happens exactly n times because `i` never decreases. Total work is bounded by 2n operations, so O(n) time, and everything happens in place, so O(1) extra space. It is the same amortised accounting used for two pointers: the nesting is real but the total number of inner steps is globally bounded, not bounded per outer iteration.",
      followUps: [
        "What is the worst-case number of swaps and which input achieves it?",
        "How does this compare to counting sort's bound?",
      ],
    },
    {
      q: "Why is the swap condition `a[i] != a[home]` rather than `i != home`?",
      a: "The two are equivalent when the values form a true permutation, but they diverge the moment duplicates exist — which is exactly the case in most of the interesting problems, such as Find the Duplicate Number or Set Mismatch. Suppose the value 3 appears twice. The first copy gets placed at index 2. When the second copy reaches the front of the loop, its home is also index 2, and `i != home` is true, so the index-based condition swaps them — but the swap exchanges two equal values, the array is unchanged, `i` never advances, and the loop spins forever. The value-based condition asks the right question: is my home slot already occupied by the value that belongs there? If yes, there is nothing productive to do, so advance `i` and leave this element stranded — and being stranded is precisely the signal the follow-up scan reads, since a duplicate ends up parked at an index whose rightful owner is missing. The same guard is what makes the loop safe on arbitrary input in First Missing Positive, combined with an explicit range check before computing the home index.",
      followUps: [
        "Show an input where the index-based version loops forever.",
        "How do you detect the duplicate and the missing value in the same scan?",
      ],
    },
    {
      q: "For First Missing Positive, why is the answer guaranteed to be in 1..n + 1, and how does that make O(1) space possible?",
      a: "There are n array slots, so at most n distinct positive integers can appear. If the array happened to contain exactly 1 through n, the smallest absent positive is n + 1; in every other case at least one value in 1..n is absent, and the smallest such value is the answer. So the search space is exactly 1..n + 1 and nothing larger, negative, or zero can ever be the answer. That is what licenses the space trick: the array itself has exactly the right number of slots to act as a presence table for the only candidates that matter, so no auxiliary hash set is needed. Values outside 1..n are simply skipped during the placement pass — they occupy slots that will therefore fail the `a[i] == i + 1` check and correctly signal a missing value. After placement, the first index where `a[i] != i + 1` gives the answer `i + 1`, and if the scan completes with no mismatch the answer is n + 1. Time is O(n) for placement plus O(n) for the scan; extra space is O(1), though it does mutate the input, which is worth flagging if the caller needs the original order preserved.",
      followUps: [
        "How would you handle it if mutating the input were forbidden?",
        "Does the argument change if duplicates are present?",
      ],
    },
  ],
  flashcards: [
    {
      front: "Cyclic sort — the loop",
      back: "`int home = a[i] - 1; if (a[i] != a[home]) swap(a[i], a[home]); else ++i;` Compare values, not indices, and never advance `i` right after a swap.",
    },
    {
      front: "Cyclic sort complexity and precondition",
      back: "O(n) time (≤ n swaps, each permanently placing a value), O(1) extra space. Requires values drawn from an index-sized range like 1..n or 0..n.",
    },
    {
      front: "What does the post-placement scan reveal?",
      back: "Any index with `a[i] != i + 1` means `i + 1` is missing and `a[i]` is a duplicate/intruder — covering missing number, all disappeared numbers, duplicates, set mismatch, and first missing positive.",
    },
  ],
};
