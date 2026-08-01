import type { TopicContent } from "../types";

export const arraysStrings: TopicContent = {
  quickSummary: [
    "Arrays store elements in contiguous memory, giving O(1) random access by index but O(n) insertion/deletion in the middle due to shifting.",
    "Dynamic arrays (Python list, Java ArrayList, C++ vector) auto-resize by doubling capacity, making append O(1) amortized despite occasional O(n) copies.",
    "The two-pointer and sliding-window techniques solve many subarray/substring problems in O(n) by avoiding redundant re-scanning.",
    "String matching algorithms like KMP and Rabin-Karp achieve O(n+m) by preprocessing the pattern, avoiding the naive O(n·m) worst case.",
  ],
  detailed: [
    "An array is a fixed-size block of contiguous memory where each element occupies the same number of bytes. Accessing element i is O(1): the address is base + i × element_size. This locality makes arrays cache-friendly — sequential scans are fast because adjacent elements are in the same cache line. The downside is that insertion at index i requires shifting n−i elements to the right, which is O(n).",
    "Dynamic arrays solve the fixed-size problem by maintaining a backing array larger than the current element count. When the array is full, a new array of double the capacity is allocated and elements are copied — an O(n) operation. However, because doubling is exponential, the next n/2 appends are free, so the amortized cost per append is O(1). Python lists, Java ArrayLists, and C++ vectors all use this strategy.",
    "The two-pointer technique uses two indices moving through the array (same direction or opposite directions) to solve problems without nested loops. Classic examples: checking if a sorted array has a pair summing to a target (one pointer from each end), removing duplicates in-place (one slow, one fast pointer), and merging two sorted arrays. The key insight is that each pointer moves at most n times, so total work is O(n).",
    "The sliding window technique maintains a window [left, right] that expands rightward and contracts leftward to find optimal subarrays/substrings. For fixed-size windows, advance both pointers together; for variable-size, expand right until a constraint is violated, then shrink left until it is restored. Examples: longest substring without repeating characters, minimum window substring, and maximum sum subarray of size k.",
    "String matching asks: does pattern P (length m) occur in text T (length n)? The naive approach checks each of the n−m+1 starting positions, each costing up to O(m), for O(n·m) total. KMP preprocesses P into a failure function in O(m) that tells the algorithm how far to skip on a mismatch, achieving O(n+m). Rabin-Karp uses a rolling hash: compute hash(P) and hash(T[i..i+m−1]) in O(1) per position, only comparing characters on hash matches.",
  ],
  deepDive: [
    "The KMP failure function (also called the partial match table) encodes the longest proper prefix of P[0..j] that is also a suffix. On a mismatch at position j, instead of restarting from position 0 of the pattern, KMP jumps the pattern pointer to failure[j−1], reusing characters already matched. Building the failure function itself uses the same logic, running in O(m). The combined search is O(n) because the text pointer never moves backward.",
    "Rabin-Karp's rolling hash treats each m-length window as a number in some base (e.g., 26 for lowercase letters) modulo a prime. Sliding the window right removes the leftmost character's contribution and adds the new rightmost character, both in O(1). The expected time is O(n+m) with a good hash, but worst case is O(n·m) if many spurious hash collisions occur. Using a large prime or double hashing reduces collision probability. Rabin-Karp generalizes easily to multi-pattern search.",
    "In-place operations on arrays and strings (like reversing, rotating, or removing elements without extra space) exploit the contiguous memory layout. A classic example: rotate an array by k positions using three reverses — reverse the whole array, reverse the first k, reverse the rest — all in O(n) time and O(1) space. Another: the Dutch National Flag algorithm partitions an array into three sections in a single pass using three pointers.",
    "Anagram detection (checking if one string is a permutation of another) uses a frequency count: build a 26-entry histogram for each string and compare in O(n) time, O(1) space. For finding all anagram substrings of P in T, use a sliding window of length m over T with a frequency map, updating it incrementally — each slide adds one character and removes one, so the total time is O(n). This is equivalent to the fixed-size sliding window pattern.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Sliding window: longest substring without repeating characters",
      source: `#include <iostream>
#include <string>
#include <unordered_map>
#include <algorithm>

// O(n) time, O(min(n, alphabet)) space.
int lengthOfLongestSubstring(const std::string& s) {
    std::unordered_map<char, int> seen; // char -> most recent index
    int left = 0;
    int maxLen = 0;

    for (int right = 0; right < static_cast<int>(s.size()); ++right) {
        char ch = s[right];
        auto it = seen.find(ch);
        if (it != seen.end() && it->second >= left) {
            left = it->second + 1;   // shrink window past the duplicate
        }
        seen[ch] = right;
        maxLen = std::max(maxLen, right - left + 1);
    }
    return maxLen;
}

int main() {
    std::cout << lengthOfLongestSubstring("abcabcbb") << "\\n"; // 3 ("abc")
    std::cout << lengthOfLongestSubstring("bbbbb") << "\\n";    // 1 ("b")
    std::cout << lengthOfLongestSubstring("pwwkew") << "\\n";   // 3 ("wke")
    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "KMP string matching algorithm",
      source: `#include <iostream>
#include <string>
#include <vector>

// Return all start indices where pattern occurs in text. O(n+m).
std::vector<int> kmpSearch(const std::string& text, const std::string& pattern) {
    int n = static_cast<int>(text.size());
    int m = static_cast<int>(pattern.size());
    if (m == 0) return {};

    // Build failure function (longest proper prefix = suffix)
    std::vector<int> fail(m, 0);
    int k = 0;
    for (int j = 1; j < m; ++j) {
        while (k > 0 && pattern[k] != pattern[j])
            k = fail[k - 1];
        if (pattern[k] == pattern[j])
            ++k;
        fail[j] = k;
    }

    // Search
    std::vector<int> matches;
    k = 0;
    for (int i = 0; i < n; ++i) {
        while (k > 0 && pattern[k] != text[i])
            k = fail[k - 1];         // fall back
        if (pattern[k] == text[i])
            ++k;
        if (k == m) {
            matches.push_back(i - m + 1);
            k = fail[k - 1];         // continue searching
        }
    }
    return matches;
}

int main() {
    auto results = kmpSearch("ababcababcabc", "abc");
    for (int idx : results) std::cout << idx << " ";  // 2 7 10
    std::cout << "\\n";
    return 0;
}`,
    },
  ],
  diagrams: [
    {
      title: "Array Memory Layout",
      kind: "architecture",
      caption: "Arrays store elements in contiguous memory. Index arithmetic gives O(1) random access. Dynamic arrays double capacity on overflow.",
      mermaid: `flowchart LR
    subgraph Memory["Contiguous Memory Block"]
        I0["[0]\\n10"]
        I1["[1]\\n20"]
        I2["[2]\\n30"]
        I3["[3]\\n40"]
        I4["[4]\\n50"]
        I0 --- I1 --- I2 --- I3 --- I4
    end
    Ptr["Base Pointer"] --> I0
    Idx["Index i\\naddr = base + i * size"] --> I2`,
    },
    {
      title: "Sliding Window State Machine",
      kind: "state",
      caption: "The sliding window technique maintains a window over a string or array, expanding and contracting to satisfy a constraint.",
      mermaid: `stateDiagram-v2
    [*] --> Init: Set left = 0, right = 0
    Init --> Expand: Move right pointer
    Expand --> Valid: Window satisfies\\nconstraint
    Valid --> RecordResult: Update best result
    RecordResult --> Expand: Move right
    Expand --> Invalid: Window violates\\nconstraint
    Invalid --> Shrink: Move left pointer
    Shrink --> Valid: Constraint restored
    Shrink --> Invalid: Still violating
    Expand --> [*]: right reaches end`,
    },
    {
      title: "Common String Operations Flow",
      kind: "flow",
      caption: "Decision tree for choosing the right string algorithm technique based on the problem structure.",
      mermaid: `flowchart TD
    Problem["String Problem"] --> Q1{"Subarray or\\nsubstring?"}
    Q1 -->|Fixed length| Slide["Sliding Window\\nfixed size"]
    Q1 -->|Variable length| Q2{"Constraint\\ntype?"}
    Q2 -->|At most k| VarSlide["Sliding Window\\nvariable size"]
    Q2 -->|Exact match| TP["Two Pointers\\nor KMP"]
    Problem --> Q3{"Sorted input?"}
    Q3 -->|Yes| TP2["Two Pointers\\npair sum"]
    Q3 -->|No| Hash["HashMap\\nfrequency count"]`,
    },
    {
      title: "Array and String Algorithm Techniques",
      kind: "mindmap",
      caption: "Core algorithmic techniques used for array and string problems.",
      mermaid: `mindmap
  root((Arrays and Strings))
    Two Pointers
      Pair sum in sorted array
      Remove duplicates
      Palindrome check
    Sliding Window
      Longest substring without repeat
      Max sum subarray of size k
    Prefix Sum
      Range sum queries
      Subarray sum equals k
    Hashing
      Anagram detection
      Two sum
      Frequency count`,
    },
  ],
  animations: [
    {
      title: "Two-pointer technique: pair sum in sorted array",
      steps: [
        { label: "Initialize pointers", detail: "Set left = 0 (smallest element), right = n−1 (largest element). Target sum = T." },
        { label: "Compute sum", detail: "Sum = arr[left] + arr[right]. Compare to target T." },
        { label: "Sum too small", detail: "If sum < T, increment left — we need a larger value, and moving left rightward increases the sum." },
        { label: "Sum too large", detail: "If sum > T, decrement right — we need a smaller value, and moving right leftward decreases the sum." },
        { label: "Match found", detail: "If sum == T, record the pair (left, right). Move both pointers inward to search for more pairs." },
        { label: "Termination", detail: "Stop when left >= right. Every element was visited at most once by each pointer, so total work is O(n)." },
      ],
    },
  ],
  comparison: {
    columns: ["Technique", "When to use", "Time", "Space", "Classic problems"],
    rows: [
      ["Brute force / nested loops", "Small n or no better approach known", "O(n²) or worse", "O(1)", "Pair sum (unsorted), all substrings"],
      ["Two pointers (opposite)", "Sorted array, pair search", "O(n)", "O(1)", "Two-sum sorted, container with most water"],
      ["Two pointers (same dir)", "In-place removal, fast/slow", "O(n)", "O(1)", "Remove duplicates, linked list cycle"],
      ["Sliding window (fixed)", "Fixed-size subarray/substring", "O(n)", "O(k) or O(1)", "Max sum subarray of size k, anagrams"],
      ["Sliding window (variable)", "Optimal subarray satisfying constraint", "O(n)", "O(alphabet)", "Longest unique substring, min window substring"],
      ["KMP", "Single pattern exact match", "O(n+m)", "O(m)", "String search, pattern occurrence count"],
      ["Rabin-Karp", "Multi-pattern or substring hash", "O(n+m) expected", "O(m)", "Plagiarism detection, multi-pattern search"],
    ],
  },
  interviewQA: [
    {
      q: "How does the sliding window technique work for finding the longest substring without repeating characters?",
      a: "Maintain a window [left, right] and a hash map from character to its last seen index. Expand right one character at a time. If the new character was already seen at index >= left, jump left to seen[ch] + 1 to exclude the duplicate. Update the map and track the maximum window length. Each pointer moves at most n times, so the total is O(n).",
      followUps: [
        "How would you adapt this for at most k distinct characters?",
        "What data structure replaces the hash map for a fixed alphabet (e.g., ASCII)?",
      ],
    },
    {
      q: "Explain the KMP algorithm and why the text pointer never moves backward.",
      a: "KMP preprocesses the pattern into a failure function: fail[j] = length of the longest proper prefix of P[0..j] that is also a suffix. On a mismatch at pattern position j, the algorithm knows that P[0..fail[j-1]-1] already matches the text, so it sets j = fail[j-1] without re-reading any text character. The text pointer only advances forward. The failure function itself is built in O(m) using the same skip logic, and the search runs in O(n).",
      followUps: [
        "How does the failure function handle overlapping patterns like 'aabaaab'?",
        "When is Rabin-Karp preferred over KMP?",
      ],
    },
    {
      q: "Why is appending to a dynamic array O(1) amortized even though resizing is O(n)?",
      a: "The array doubles on resize, so after a resize that copies n elements, the next n appends are simple O(1) writes. If you account for each element 'paying' for its own copy and one future copy, every element costs O(2) = O(1). Formally, the total cost of n appends is at most 3n (n writes + n copies from previous doublings + n copies from the final doubling), so amortized cost is O(1). This can be proven rigorously via the accounting method or potential method.",
      followUps: [
        "What growth factor minimizes wasted space vs copy overhead?",
        "How does Java's ArrayList differ from C++'s vector in growth strategy?",
      ],
    },
    {
      q: "How do you detect all anagrams of a pattern in a text efficiently?",
      a: "Use a fixed-size sliding window of length m (pattern length) over the text. Maintain a frequency count of characters in the window and compare it to the pattern's frequency count. When the window slides one position right, increment the count of the new character and decrement the count of the outgoing character. If the counts match, the window is an anagram. This runs in O(n) time with O(1) space (26-entry frequency array for lowercase).",
      followUps: [
        "How do you efficiently compare frequency counts without checking all 26 entries each time?",
        "How would you extend this to Unicode strings?",
      ],
    },
  ],
  followUps: [
    "How do gap buffers and ropes improve on arrays for text-editor use cases?",
    "What is the Boyer-Moore algorithm and when does it outperform KMP?",
    "How do suffix arrays and suffix trees solve advanced string problems like longest repeated substring?",
    "What are the trade-offs between array-of-structs and struct-of-arrays for cache performance?",
  ],
  mcqs: [
    {
      q: "What is the time complexity of accessing element at index i in an array?",
      options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
      answerIndex: 2,
      explanation: "Arrays provide O(1) random access because the memory address is computed as base + i × element_size — no traversal needed.",
    },
    {
      q: "A dynamic array has 8 elements and capacity 8. What happens when a 9th element is appended?",
      options: [
        "The element is rejected",
        "A new array of capacity 16 is allocated, 8 elements are copied, then the 9th is added",
        "The element is added at capacity 8 by overwriting the first element",
        "A linked list node is created for overflow",
      ],
      answerIndex: 1,
      explanation: "Dynamic arrays double their capacity on overflow: allocate 2× array, copy existing elements, insert the new one. The old array is freed.",
    },
    {
      q: "In KMP, the failure function fail[j] represents:",
      options: [
        "The number of mismatches at position j",
        "The length of the longest proper prefix of P[0..j] that is also a suffix",
        "The index of the next character to compare in the text",
        "The hash value of the substring P[0..j]",
      ],
      answerIndex: 1,
      explanation: "fail[j] tells KMP how far back in the pattern to fall on a mismatch, reusing already-matched characters without re-reading the text.",
    },
    {
      q: "What is the time complexity of the sliding window approach for the 'longest substring without repeating characters' problem?",
      options: ["O(n²)", "O(n log n)", "O(n)", "O(n·m)"],
      answerIndex: 2,
      explanation: "Each pointer (left and right) traverses the string at most once, and hash map operations are O(1), giving O(n) total.",
    },
    {
      q: "Rotating an array of n elements by k positions can be done in-place in:",
      options: ["O(n) time, O(n) space", "O(n) time, O(1) space", "O(n·k) time, O(1) space", "O(n log n) time, O(1) space"],
      answerIndex: 1,
      explanation: "The three-reversal trick: reverse the whole array, reverse first k, reverse last n−k. Each reversal is O(n) in-place, so total is O(n) time, O(1) space.",
    },
  ],
  exercises: [
    "Implement a dynamic array class from scratch with append, get, set, insert, and delete operations. Track capacity vs size and implement doubling on overflow.",
    "Solve 'minimum window substring': given strings s and t, find the smallest substring of s containing all characters of t. Use the variable-size sliding window technique.",
    "Implement Rabin-Karp string matching with a rolling hash (use base 31, mod 10^9+7). Handle hash collisions by verifying character-by-character on match.",
    "Write an in-place function to move all zeros in an array to the end while preserving the order of non-zero elements, using the two-pointer technique.",
  ],
  flashcards: [
    { front: "Array access time complexity", back: "O(1) — address = base + index × element_size. Contiguous memory layout." },
    { front: "Dynamic array amortized append", back: "O(1) amortized. Doubling capacity means each element 'pays' for its copy plus one future copy." },
    { front: "Two-pointer technique essence", back: "Use two indices (same or opposite direction) to avoid nested loops. Each pointer moves at most n times → O(n) total." },
    { front: "Sliding window: fixed vs variable", back: "Fixed: both pointers advance in lockstep (window size k). Variable: right expands, left shrinks to satisfy a constraint." },
    { front: "KMP failure function", back: "fail[j] = longest proper prefix of P[0..j] that equals its suffix. On mismatch, jump to fail[j−1] instead of restarting." },
    { front: "Rabin-Karp rolling hash", back: "hash(s[i+1..i+m]) = (hash(s[i..i+m-1]) − s[i]·base^(m-1)) · base + s[i+m], all mod p. O(1) per slide." },
    { front: "Three-reversal array rotation", back: "Rotate array by k: reverse all, reverse first k, reverse last n−k. O(n) time, O(1) space." },
    { front: "Anagram detection via frequency count", back: "Two strings are anagrams iff their character frequency histograms are identical. O(n) time, O(1) space (fixed alphabet)." },
  ],
  revisionNotes: [
    "Arrays: contiguous memory, O(1) access, O(n) insert/delete in middle. Cache-friendly for sequential access.",
    "Dynamic arrays: double on overflow → O(1) amortized append. Python list over-allocates by ~12.5% growth, C++ vector by 2×.",
    "Two pointers: opposite ends for sorted pair-sum, same direction for fast/slow (duplicates, cycle detection). Always O(n).",
    "Sliding window: expand right, shrink left. Fixed-size for k-length problems; variable-size for optimal subarray/substring.",
    "KMP: O(n+m) guaranteed. Failure function avoids re-scanning text. Text pointer never backtracks.",
    "Rabin-Karp: O(n+m) expected via rolling hash. Worst case O(nm) on hash collisions. Best for multi-pattern search.",
  ],
  cheatSheet: [
    "arr[i] → O(1); insert/delete at i → O(n) shift",
    "Dynamic array append: O(1) amortized (doubling strategy)",
    "Two pointers on sorted array: left = 0, right = n−1, move inward based on sum comparison",
    "Sliding window template: for right in range(n): expand; while invalid: shrink left",
    "KMP: build fail[] in O(m), search in O(n). fail[j] = longest prefix = suffix of P[0..j]",
    "Rabin-Karp: hash = (hash − old·base^(m−1)) · base + new, mod p",
  ],
  resources: [
    { label: "LeetCode Array/String problem set", kind: "docs", note: "Curated problems sorted by pattern: two-pointer, sliding window, prefix sum, in-place." },
    { label: "CLRS Chapter 32 — String Matching", kind: "book", note: "Rigorous treatment of naive, Rabin-Karp, KMP, and finite-automaton matchers." },
    { label: "Neetcode Sliding Window playlist", kind: "video", note: "Step-by-step video walkthroughs of the most common sliding window interview problems." },
    { label: "CP-Algorithms: String Processing", kind: "article", note: "KMP, Z-algorithm, suffix array, Aho-Corasick, and more with clean C++ implementations." },
    { label: "Python TimeComplexity wiki", kind: "docs", note: "Official CPython time complexity for list, dict, set operations — essential for interview complexity analysis." },
  ],
  glossary: [
    { term: "Contiguous memory", definition: "Memory layout where elements are stored in adjacent addresses with no gaps, enabling O(1) index-based access." },
    { term: "Amortized complexity", definition: "The average cost per operation over a worst-case sequence of operations. Dynamic array append is O(1) amortized despite occasional O(n) resizes." },
    { term: "Two-pointer technique", definition: "An algorithm pattern using two indices that traverse a data structure to solve problems in O(n) without nested loops." },
    { term: "Sliding window", definition: "A technique that maintains a contiguous subarray/substring window and adjusts its boundaries to find optimal results in O(n)." },
    { term: "Failure function (KMP)", definition: "An array where fail[j] is the length of the longest proper prefix of the pattern P[0..j] that is also a suffix, enabling O(1) skip on mismatch." },
    { term: "Rolling hash", definition: "A hash function that updates incrementally when the window slides by one character, enabling O(1) hash computation per position." },
    { term: "In-place algorithm", definition: "An algorithm that transforms data using O(1) extra space, modifying the input array directly." },
    { term: "Cache line", definition: "The smallest unit of data transferred between main memory and CPU cache (typically 64 bytes). Arrays exploit spatial locality because adjacent elements share cache lines." },
  ],
};
