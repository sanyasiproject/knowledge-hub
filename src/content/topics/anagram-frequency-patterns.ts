import type { TopicContent } from "../types";

export const anagramFrequencyPatterns: TopicContent = {
  quickSummary: [
    "For lowercase input, a fixed `int cnt[26]` replaces every hash map: O(1) lookup, no hashing, cache-friendly, and trivially comparable.",
    "Two strings are anagrams iff their count vectors are equal — so the count vector is also the **grouping key** and the **window signature**.",
    "Keep a `diff` counter of mismatched slots and each window slide costs O(1) instead of an O(26) array comparison.",
  ],
  detailed: [
    "An anagram question is a **multiset equality** question in disguise. Order never matters, only how many of each character you hold, so the entire family reduces to building and comparing frequency vectors. Over a known alphabet that vector is a `int cnt[26]`; over arbitrary Unicode it becomes a hash map, but the algorithm shape is identical.\n\nKey insight: once you see \"rearrangement\", \"permutation\", or \"same letters\", stop thinking about the strings and start thinking about their count vectors.",
    "## Recognition cue\n\nReach for a frequency array when **any** of these appear:\n\n- \"is X a rearrangement / permutation / anagram of Y\"\n- \"group the words that are anagrams of each other\"\n- \"find every starting index where a permutation of `p` occurs in `s`\"\n- \"does `s2` contain any permutation of `s1`\"\n- the alphabet is small and fixed (lowercase letters, digits, DNA bases)\n\nClassic problems: **Valid Anagram**, **Group Anagrams**, **Find All Anagrams in a String**, **Permutation in String**.",
    "## Two grouping keys, two costs\n\nGrouping anagrams needs a canonical form per word. The two candidates:\n\n| Key | Build cost | Total for n words of length k |\n| --- | --- | --- |\n| Sorted characters | O(k log k) | O(n·k log k) |\n| 26-slot count string | O(k) | O(n·k) |\n\nThe sorted key is one line and fine in an interview; the count key is asymptotically better and the answer they want when they ask \"can you do better\". Serialise the count key with a separator (`#3#0#1…`) — concatenating raw digits makes `1,11` and `11,1` collide.",
    "## The count-difference trick\n\nFor \"find all anagrams of `p` in `s`\", the naive fixed window rebuilds or re-compares 26 slots per position: O(26n). Instead track a single integer `diff` = the number of slots where `win[c] != need[c]`. When you increment `win[c]`, it either just *became* equal (`diff--`), just *left* equality (`diff++`), or changed nothing. A window is an anagram exactly when `diff == 0`.\n\nCommon mistake: re-deriving `diff` by scanning the array after every slide — that throws away the whole optimisation. Update it only from the two slots that actually changed.\n\nTime O(n) with O(1) extra space (26 ints), versus O(26n) for the compare-every-window version.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Valid anagram, and grouping by count key instead of sorted key",
      source: `// Single count array: += for one string, -= for the other. All zero => anagram.
bool isAnagram(const string& a, const string& b) {
    if (a.size() != b.size()) return false;          // cheap reject first
    int cnt[26] = {0};
    for (size_t i = 0; i < a.size(); ++i) { ++cnt[a[i] - 'a']; --cnt[b[i] - 'a']; }
    for (int c : cnt) if (c) return false;
    return true;
}
// Time O(n), space O(1) — the 26 slots do not grow with input.

// Group Anagrams: the count vector IS the bucket key. O(n*k) beats sorting's O(n*k log k).
vector<vector<string>> groupAnagrams(const vector<string>& words) {
    unordered_map<string, vector<string>> buckets;
    for (const string& w : words) {
        int cnt[26] = {0};
        for (char ch : w) ++cnt[ch - 'a'];
        string key;
        for (int i = 0; i < 26; ++i) { key += '#'; key += to_string(cnt[i]); }
        buckets[key].push_back(w);                   // '#' separator: "1,11" != "11,1"
    }
    vector<vector<string>> out;
    for (auto& kv : buckets) out.push_back(kv.second);
    return out;
}
// Time O(n*k) for n words of length k, space O(n*k) for the buckets.`,
    },
    {
      language: "cpp",
      caption: "Find all anagram start indices — fixed window with an O(1) diff check",
      source: `vector<int> findAnagrams(const string& s, const string& p) {
    vector<int> res;
    int n = (int)s.size(), m = (int)p.size();
    if (n < m) return res;
    int need[26] = {0}, win[26] = {0};
    for (char ch : p) ++need[ch - 'a'];
    int diff = 0;                                    // slots where win != need
    for (int i = 0; i < 26; ++i) if (need[i]) ++diff;

    for (int r = 0; r < n; ++r) {
        int in = s[r] - 'a';                         // add the entering char
        if (++win[in] == need[in]) --diff;           // slot just became equal
        else if (win[in] == need[in] + 1) ++diff;    // slot just left equality

        if (r >= m) {                                // drop the leaving char
            int out = s[r - m] - 'a';
            if (--win[out] == need[out]) --diff;
            else if (win[out] == need[out] - 1) ++diff;
        }
        if (r >= m - 1 && diff == 0) res.push_back(r - m + 1);
    }
    return res;
}
// Time O(n) — each step touches exactly two slots. Space O(1).

// Permutation in String is the same routine asking only "does one exist?".
bool checkInclusion(const string& p, const string& s) {
    return !findAnagrams(s, p).empty();
}`,
    },
  ],
  cheatSheet: [
    "Anagram test = multiset equality. One `int cnt[26]`: `++` for A, `--` for B, all zeros wins.",
    "Length mismatch is an instant `false` — check it before touching the counts.",
    "Group Anagrams: sorted key O(k log k) per word vs count key O(k). Separate count fields with `#`.",
    "Fixed window over counts: maintain `diff` (mismatched slots); report when `diff == 0`. O(1) per slide.",
    "Complexity across the family: O(n) time, O(1) space for a fixed alphabet; O(n) space with a hash map for Unicode.",
  ],
  interviewQA: [
    {
      q: "Why prefer a 26-slot array over an unordered_map<char,int> for anagram problems?",
      a: "Both are O(1) per operation asymptotically, but the array wins on every constant factor and on ergonomics. There is no hashing, no allocation, no rehash, and the 26 ints sit in a single cache line pair, so it is typically several times faster in practice. It also makes comparison trivial — two count vectors are equal iff all 26 slots match, and I can serialise it directly into a grouping key. A hash map needs care because an entry that drops to zero must be erased or the size-based checks go wrong. The array only works when the alphabet is known and small; for arbitrary Unicode or case-sensitive mixed input I switch to a hash map and accept O(distinct) space, keeping exactly the same algorithm.",
      followUps: [
        "How would you extend the count array to handle both cases and digits?",
        "What changes if the input is UTF-8 and characters are multi-byte?",
      ],
    },
    {
      q: "Walk me through finding every start index in s where a permutation of p occurs, in O(n).",
      a: "I build `need[26]` from p, then slide a fixed window of length m = |p| across s. Naively I would compare the window's 26 counts against `need` at every position, which is O(26n). Instead I keep an integer `diff` equal to the number of slots where the window count differs from the needed count, initialised to the number of distinct characters in p. Each slide changes exactly two slots — the entering character and the leaving one — so I update `diff` from those two updates alone: if incrementing a slot makes it equal to `need`, `diff` drops; if it moves from equal to one-over, `diff` rises; the symmetric rules apply on removal. Whenever `diff == 0` and the window is full I record the start index. That is O(n) time with O(1) space, and it is exactly the same routine that answers Permutation in String — that variant just returns true on the first hit.",
      followUps: [
        "How do you handle the very first window without special-casing it?",
        "What if p can contain characters outside the window's alphabet?",
      ],
    },
    {
      q: "Can you group anagrams without sorting each word, and when does that actually matter?",
      a: "Yes — use the frequency vector itself as the map key instead of the sorted string. Counting is O(k) per word versus O(k log k) for sorting, so total work goes from O(n·k log k) to O(n·k). It matters when words are long; for typical dictionary words of five to ten characters the sorted key is often faster in wall-clock terms because it avoids building a 26-field key string. The correctness detail people miss is key serialisation: I emit a separator between counts, because concatenating raw counts lets distinct vectors collide — a word with one 'a' and eleven 'b's would produce the same digit run as eleven 'a's and one 'b'. An alternative with no string building is hashing a `std::array<int,26>` directly as the map key, which avoids the collision question entirely.",
      followUps: [
        "How would you key the map if the alphabet were the full Unicode range?",
        "Could you use a product-of-primes hash instead, and what breaks?",
      ],
    },
  ],
  flashcards: [
    {
      front: "Anagram check in one sentence",
      back: "Multiset equality: length must match, then one `int cnt[26]` with `++` for A and `--` for B must end all zeros. O(n) time, O(1) space.",
    },
    {
      front: "Group Anagrams — count key vs sorted key",
      back: "Sorted key: O(k log k) per word. Count key (26 fields with `#` separators): O(k) per word. Separator is required or distinct vectors collide.",
    },
    {
      front: "The `diff` trick for anagram windows",
      back: "Track the number of slots where `win != need`. Each slide changes two slots, so update `diff` incrementally — window matches iff `diff == 0`. O(1) per step instead of O(26).",
    },
  ],
};
