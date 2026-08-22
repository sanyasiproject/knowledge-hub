import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Suffix Array",
      difficulty: "Easy",
      variation: "Building the suffix array, the template",
      link: "https://www.spoj.com/problems/SARRAY/",
      question: [
        "Given a string s, output its suffix array: the list of starting indices 0..n-1 of all n suffixes of s, sorted in increasing lexicographic order of the suffixes they start. Print one index per line.",
        "Example 1:\nInput:\nbanana\nOutput:\n5\n3\n1\n0\n4\n2\nExplanation: Sorted suffixes are 'a' (5), 'ana' (3), 'anana' (1), 'banana' (0), 'na' (4), 'nana' (2).",
        "Example 2:\nInput:\nabcdefg\nOutput:\n0\n1\n2\n3\n4\n5\n6\nExplanation: All characters are distinct and increasing, so the first character alone decides every comparison and the suffix array is the identity permutation.",
        "Constraints:\n- 1 <= |s| <= 10^5\n- s consists of printable ASCII characters",
      ],
      code: `// Cyclic-shift doubling with counting sort: O(n log n).
vector<int> buildSuffixArray(const string& s) {
    string t = s + '\\1';          // sentinel smaller than every real character
    int n = t.size();
    const int A = 256;
    vector<int> p(n), c(n), cnt(max(A, n), 0);
    // Round 0: counting sort by the single first character.
    for (int i = 0; i < n; i++) cnt[(unsigned char)t[i]]++;
    for (int i = 1; i < A; i++) cnt[i] += cnt[i - 1];
    for (int i = 0; i < n; i++) p[--cnt[(unsigned char)t[i]]] = i;
    c[p[0]] = 0;
    int classes = 1;
    for (int i = 1; i < n; i++) {
        if (t[p[i]] != t[p[i - 1]]) classes++;
        c[p[i]] = classes - 1;     // equivalence class of the length-1 prefix
    }
    vector<int> pn(n), cn(n);
    for (int h = 0; (1 << h) < n; h++) {
        // Sort by the second half, then stable-counting-sort by the first half.
        for (int i = 0; i < n; i++) {
            pn[i] = p[i] - (1 << h);
            if (pn[i] < 0) pn[i] += n;
        }
        fill(cnt.begin(), cnt.begin() + classes, 0);
        for (int i = 0; i < n; i++) cnt[c[pn[i]]]++;
        for (int i = 1; i < classes; i++) cnt[i] += cnt[i - 1];
        for (int i = n - 1; i >= 0; i--) p[--cnt[c[pn[i]]]] = pn[i];
        cn[p[0]] = 0;
        classes = 1;
        for (int i = 1; i < n; i++) {
            pair<int,int> cur = {c[p[i]], c[(p[i] + (1 << h)) % n]};
            pair<int,int> pre = {c[p[i - 1]], c[(p[i - 1] + (1 << h)) % n]};
            if (cur != pre) classes++;
            cn[p[i]] = classes - 1;
        }
        c.swap(cn);
    }
    p.erase(p.begin());            // drop the sentinel-only suffix
    return p;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    vector<int> sa = buildSuffixArray(s);
    for (int idx : sa) cout << idx << "\\n";
    return 0;
}`,
      explanation: [
        "The trick that makes this O(n log n) rather than O(n^2 log n) is to sort cyclic shifts of the string instead of suffixes, and to do it by doubling. After round h you know the sorted order and the equivalence classes of all cyclic substrings of length 2^h. A length-2^(h+1) substring is exactly the pair (class of its first half, class of its second half), so one round of sorting pairs of already-known small integers advances h by one.",
        "Sorting pairs of small integers is done with radix sort in O(n): first sort by the second component, then stable counting sort by the first. Stability of the second pass is what preserves the order established by the first, so no comparison of actual characters ever happens after round 0.",
        "Appending a sentinel strictly smaller than every real character is what turns cyclic-shift order into suffix order. Without it, the cyclic shift starting at i wraps around and can compare larger than a suffix that is its own prefix - for example the shifts of 'aa' are indistinguishable. With the sentinel, no shift can wrap past it without immediately losing the comparison, so shift order equals suffix order; the sentinel's own shift sorts first and is discarded.",
        "The tempting shortcut is to build a vector of the n suffix strings and hand it to sort. That is O(n^2 log n) time and O(n^2) memory because each comparison copies and scans whole suffixes - fine for n = 1000, hopeless at 10^5.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Kasai's Algorithm for LCP Array Construction",
      difficulty: "Easy",
      variation: "LCP array from the suffix array",
      question: [
        "Given a string s and its suffix array sa, build the LCP array of length n-1 where lcp[i] is the length of the longest common prefix of the suffixes sa[i] and sa[i+1]. Almost every suffix array application needs this array, so it is worth writing once and reusing.",
        "Example 1:\nInput: s = 'banana', sa = [5, 3, 1, 0, 4, 2]\nOutput: [1, 3, 0, 0, 2]\nExplanation: 'a' vs 'ana' share 'a' (1); 'ana' vs 'anana' share 'ana' (3); 'anana' vs 'banana' share nothing (0); 'banana' vs 'na' share nothing (0); 'na' vs 'nana' share 'na' (2).",
        "Example 2:\nInput: s = 'aabbaba', sa = [6, 0, 4, 1, 5, 3, 2]\nOutput: [1, 1, 2, 0, 2, 1]\nExplanation: The sorted suffixes are 'a', 'aabbaba', 'aba', 'abbaba', 'ba', 'baba', 'bbaba', and consecutive pairs share 1, 1, 2, 0, 2 and 1 characters.",
        "Constraints:\n- 1 <= |s| <= 10^5\n- sa is a valid suffix array of s",
      ],
      code: `vector<int> buildLCP(const string& s, const vector<int>& sa) {
    int n = s.size();
    if (n <= 1) return {};
    vector<int> rnk(n), lcp(n - 1);
    for (int i = 0; i < n; i++) rnk[sa[i]] = i;   // inverse permutation
    int k = 0;                                    // carried LCP length
    for (int i = 0; i < n; i++) {                 // walk suffixes by text position
        if (rnk[i] == n - 1) { k = 0; continue; } // last in sorted order: no successor
        int j = sa[rnk[i] + 1];                   // the suffix right after i in sa
        while (i + k < n && j + k < n && s[i + k] == s[j + k]) k++;
        lcp[rnk[i]] = k;
        if (k) k--;                               // amortization: drop one character
    }
    return lcp;
}`,
      explanation: [
        "The array is indexed by suffix-array position but computed in order of text position, and that is the whole idea. Let h(i) be the LCP of suffix i with its successor in the suffix array. The key lemma is h(i+1) >= h(i) - 1: if suffix i shares a prefix of length h with its neighbour, then chopping the first character off both gives two suffixes sharing h-1 characters, and the neighbour of suffix i+1 in sorted order is at least as close to it as that pair, so it cannot share fewer.",
        "So process i = 0, 1, ..., n-1 and keep k as the running answer. Before each step decrement k by one (the lemma says it never has to drop further), then extend by character comparisons. Each iteration decrements k at most once and k never exceeds n, so the total number of successful extensions over the whole loop is at most 2n - the classic amortized argument that makes this linear.",
        "Computing each entry independently by comparing the two suffixes character by character is O(n) per entry and O(n^2) overall, which is the usual first attempt and the reason Kasai's amortization matters. The other trap is confusing the two index spaces: rnk[i] converts text position to suffix-array position and the result must be written at lcp[rnk[i]], not at lcp[i].",
        "With sa and lcp together you get, for free, the longest repeated substring (max lcp), the number of distinct substrings, and O(log n) substring search - which is why these two arrays are always built as a pair.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Search a Pattern Using the Built Suffix Array",
      difficulty: "Medium",
      variation: "Substring search by binary search on suffixes",
      question: [
        "Given a text of length n and a pattern of length m, decide whether the pattern occurs in the text as a contiguous substring and if so return one starting index, or -1 if it does not occur. The suffix array of the text may be precomputed once and reused for many pattern queries.",
        "Example 1:\nInput: text = 'banana', pattern = 'nan'\nOutput: 2\nExplanation: text.substr(2, 3) is 'nan'.",
        "Example 2:\nInput: text = 'banana', pattern = 'ana'\nOutput: 3\nExplanation: 'ana' occurs at both index 1 and index 3. The routine returns 3 because suffix 3 ('ana') is the lexicographically smallest suffix that starts with the pattern.",
        "Example 3:\nInput: text = 'banana', pattern = 'nn'\nOutput: -1\nExplanation: No suffix of 'banana' begins with 'nn'.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= m <= n\n- The suffix array is built once in O(n log n); each query must be O(m log n)",
      ],
      code: `// Assumes buildSuffixArray from the template question.
int searchPattern(const string& text, const string& pat) {
    vector<int> sa = buildSuffixArray(text);
    int n = text.size(), m = pat.size();
    int lo = 0, hi = n - 1, res = -1;
    while (lo <= hi) {
        int mid = (lo + hi) / 2;
        // compare(pos, len, str) clamps len at the end of text, so a short
        // suffix compares as a proper prefix and sorts before the pattern
        int cmp = text.compare(sa[mid], m, pat);
        if (cmp == 0) { res = mid; hi = mid - 1; }  // match; keep hunting left
        else if (cmp < 0) lo = mid + 1;
        else hi = mid - 1;
    }
    return res == -1 ? -1 : sa[res];
}

// Every occurrence: the matching suffixes form one contiguous sa block.
int countOccurrences(const string& text, const string& pat) {
    vector<int> sa = buildSuffixArray(text);
    int n = text.size(), m = pat.size();
    auto firstAtLeast = [&](bool strict) {
        int lo = 0, hi = n;
        while (lo < hi) {
            int mid = (lo + hi) / 2;
            int cmp = text.compare(sa[mid], m, pat);
            if (cmp < 0 || (strict && cmp == 0)) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    };
    return firstAtLeast(true) - firstAtLeast(false);
}`,
      explanation: [
        "A pattern occurs in the text exactly when some suffix of the text starts with it. In the suffix array all suffixes are sorted, and all suffixes sharing the prefix pat sit next to each other in one contiguous block - lexicographic order groups equal prefixes by definition. So the whole search is a binary search over suffix-array positions.",
        "The comparison at each step is prefix-limited: compare only the first m characters of the candidate suffix against the pattern. A suffix shorter than m gets clamped and therefore compares as a strict prefix of the pattern, which is the correct verdict since a suffix that runs out of characters cannot contain the pattern and belongs on the low side.",
        "Because each of the O(log n) probes does an O(m) string comparison the query cost is O(m log n), not O(log n). Sharpening it to O(m + log n) needs the LCP array plus the Manber-Myers refinement; that is rarely worth writing unless m is large.",
        "The two-sided version gives more than existence: lower and upper bounds of the block differ by the number of occurrences, so counting all matches costs the same O(m log n). This is the reason a suffix array beats KMP when many different patterns are queried against one fixed text - the O(n log n) build is amortized away, while KMP pays O(n) per pattern.",
        "Time: O(n log n) to build, O(m log n) per query. Space: O(n).",
      ],
    },
    {
      name: "Number of Distinct Substrings in a String",
      difficulty: "Medium",
      variation: "Counting distinct substrings via the LCP array",
      link: "https://leetcode.com/problems/number-of-distinct-substrings-in-a-string/",
      question: [
        "Given a string s, return the number of distinct non-empty substrings of s. Two substrings are the same if they are equal as strings, regardless of where they occur.",
        "Example 1:\nInput: s = 'aabbaba'\nOutput: 21\nExplanation: There are 7 * 8 / 2 = 28 substrings counted by position; the LCP array of s is [1, 1, 2, 0, 2, 1] summing to 7, so 28 - 7 = 21 are distinct.",
        "Example 2:\nInput: s = 'abcdefg'\nOutput: 28\nExplanation: All characters differ, so every one of the 28 positional substrings is distinct.",
        "Constraints:\n- 1 <= |s| <= 500\n- s consists of lowercase English letters",
      ],
      code: `// Assumes buildSuffixArray and buildLCP from the earlier questions.
int countDistinct(const string& s) {
    int n = s.size();
    vector<int> sa = buildSuffixArray(s);
    vector<int> lcp = buildLCP(s, sa);
    long long total = (long long)n * (n + 1) / 2;  // prefixes of all suffixes
    for (int v : lcp) total -= v;                  // subtract duplicated prefixes
    return (int)total;
}`,
      explanation: [
        "Every substring of s is a prefix of exactly one suffix, and there are n(n+1)/2 (suffix, prefix-length) pairs in total. So the only task is to remove the pairs that spell a string already spelled by an earlier pair.",
        "Fix the counting order to be suffix-array order. When you reach suffix sa[i], its prefixes of length 1..lcp[i-1] are shared with the previous suffix sa[i-1] and were therefore already counted; every longer prefix is brand new, because suffixes are sorted so no suffix outside the immediate neighbour can share more with sa[i] than its neighbour does. Hence suffix sa[i] contributes len(sa[i]) - lcp[i-1] fresh substrings, and summing gives n(n+1)/2 minus the sum of the whole LCP array.",
        "The subtle claim doing the work is that lcp[i-1] and not some max over all earlier suffixes is the right amount to remove. It holds because LCP(sa[i], sa[j]) = min of lcp over the range between them, which is at most lcp[i-1] for any j < i - a fact worth remembering, it powers most other LCP tricks too.",
        "Constraints here allow the O(n^2) hash-set-of-all-substrings solution, and interviewers accept it. The suffix array version is the one that survives |s| = 10^5, where storing substrings is impossible.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "New Distinct Substrings",
      difficulty: "Medium",
      variation: "Distinct substrings at judge scale",
      link: "https://www.spoj.com/problems/SUBST1/",
      question: [
        "The first line contains the number of test cases T. Each of the next T lines contains one string. For each string print the number of distinct non-empty substrings it contains.",
        "Example 1:\nInput:\n2\nCCCCC\nABABA\nOutput:\n5\n9\nExplanation: 'CCCCC' has only the substrings C, CC, CCC, CCCC, CCCCC. 'ABABA' has A, B (2), AB, BA (2), ABA, BAB (2), ABAB, BABA (2) and ABABA (1), so 9 in total.",
        "Example 2:\nInput:\n1\nbanana\nOutput:\n15\nExplanation: 21 positional substrings minus the LCP sum 1 + 3 + 0 + 0 + 2 = 6 gives 15.",
        "Constraints:\n- 1 <= T <= 20\n- 1 <= |s| <= 50000\n- The answer can exceed 2^31, so use 64-bit arithmetic",
      ],
      code: `vector<int> buildSuffixArray(const string& s) {
    string t = s + '\\1';
    int n = t.size();
    const int A = 256;
    vector<int> p(n), c(n), cnt(max(A, n), 0);
    for (int i = 0; i < n; i++) cnt[(unsigned char)t[i]]++;
    for (int i = 1; i < A; i++) cnt[i] += cnt[i - 1];
    for (int i = 0; i < n; i++) p[--cnt[(unsigned char)t[i]]] = i;
    c[p[0]] = 0;
    int classes = 1;
    for (int i = 1; i < n; i++) {
        if (t[p[i]] != t[p[i - 1]]) classes++;
        c[p[i]] = classes - 1;
    }
    vector<int> pn(n), cn(n);
    for (int h = 0; (1 << h) < n; h++) {
        for (int i = 0; i < n; i++) {
            pn[i] = p[i] - (1 << h);
            if (pn[i] < 0) pn[i] += n;
        }
        fill(cnt.begin(), cnt.begin() + classes, 0);
        for (int i = 0; i < n; i++) cnt[c[pn[i]]]++;
        for (int i = 1; i < classes; i++) cnt[i] += cnt[i - 1];
        for (int i = n - 1; i >= 0; i--) p[--cnt[c[pn[i]]]] = pn[i];
        cn[p[0]] = 0;
        classes = 1;
        for (int i = 1; i < n; i++) {
            pair<int,int> cur = {c[p[i]], c[(p[i] + (1 << h)) % n]};
            pair<int,int> pre = {c[p[i - 1]], c[(p[i - 1] + (1 << h)) % n]};
            if (cur != pre) classes++;
            cn[p[i]] = classes - 1;
        }
        c.swap(cn);
    }
    p.erase(p.begin());
    return p;
}

vector<int> buildLCP(const string& s, const vector<int>& sa) {
    int n = s.size();
    if (n <= 1) return {};
    vector<int> rnk(n), lcp(n - 1);
    for (int i = 0; i < n; i++) rnk[sa[i]] = i;
    int k = 0;
    for (int i = 0; i < n; i++) {
        if (rnk[i] == n - 1) { k = 0; continue; }
        int j = sa[rnk[i] + 1];
        while (i + k < n && j + k < n && s[i + k] == s[j + k]) k++;
        lcp[rnk[i]] = k;
        if (k) k--;
    }
    return lcp;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int T;
    cin >> T;
    while (T--) {
        string s;
        cin >> s;
        long long n = s.size();
        vector<int> sa = buildSuffixArray(s);
        vector<int> lcp = buildLCP(s, sa);
        long long ans = n * (n + 1) / 2;   // up to ~1.25e9, needs 64 bits
        for (int v : lcp) ans -= v;
        cout << ans << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Same identity as the small-input version: distinct substrings = n(n+1)/2 minus the sum of the LCP array, because in suffix-array order each suffix contributes only the prefixes longer than the LCP with its predecessor.",
        "What changes at judge scale is arithmetic and I/O. With |s| = 50000 the positional count is about 1.25 * 10^9, which already overflows a signed 32-bit int for a few test cases, so the accumulator must be long long from the start - computing n * (n + 1) / 2 in int and then widening is the classic wrong fix.",
        "T is up to 20, so the suffix array is rebuilt per test case. Nothing is shared between cases, and all buffers are local, which avoids the other classic judge bug of stale state leaking from one test into the next.",
        "A suffix automaton solves this in O(n) by summing len(v) - len(link(v)) over its states, and is the better tool if the same count is needed under character appends. The suffix array route is preferred when the LCP array is wanted for other queries anyway.",
        "Time: O(T * n log n). Space: O(n).",
      ],
    },
    {
      name: "Minimal Rotation",
      difficulty: "Medium",
      variation: "Suffix array of the doubled string",
      question: [
        "A rotation of a string s of length n is obtained by moving some prefix of s to its end. Given s, print the lexicographically smallest rotation of s.",
        "Example 1:\nInput:\nacab\nOutput:\nabac\nExplanation: The four rotations are 'acab', 'caba', 'abac' and 'baca'; 'abac' is the smallest.",
        "Example 2:\nInput:\nbaabaa\nOutput:\naabaab\nExplanation: Rotating by two characters gives 'abaab' + 'ba' = 'aabaab', which is the smallest of the six rotations.",
        "Constraints:\n- 1 <= |s| <= 10^6\n- s consists of lowercase English letters",
      ],
      code: `// Assumes buildSuffixArray from the template question.
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    int n = s.size();
    string d = s + s;                    // every rotation is a length-n window of d
    vector<int> sa = buildSuffixArray(d);
    for (int idx : sa) {
        if (idx < n) {                   // first legal start in sorted order wins
            cout << d.substr(idx, n) << "\\n";
            break;
        }
    }
    return 0;
}`,
      explanation: [
        "Rotation number i of s is exactly the substring d[i .. i+n-1] of d = s + s, for 0 <= i < n. So the answer is the smallest among n specific length-n substrings of d.",
        "Sorting suffixes of d sorts those windows correctly as long as the comparison never needs to look past character n-1 of a window, and it never has to decide a tie beyond that either - if two suffixes agree on all n characters the two rotations are literally equal, so returning whichever comes first is fine. Scanning the suffix array and taking the first index below n therefore yields a smallest rotation.",
        "The tempting shortcut - take the smallest character and compare only the rotations starting there - is wrong in general because those candidates can still tie for many characters, as in 'aabaab' where every rotation starting at an 'a' needs a deeper comparison. Doubling the string is what removes all the wrap-around special cases.",
        "Booth's algorithm and the least-rotation two-pointer both solve this in O(n) time and O(1) extra space and are the right tool at |s| = 10^6 if memory is tight. The suffix array version is the one to write when the array is needed for other queries as well.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Longest Duplicate Substring",
      difficulty: "Hard",
      variation: "Longest repeated substring = maximum LCP entry",
      link: "https://leetcode.com/problems/longest-duplicate-substring/",
      question: [
        "Given a string s, consider all duplicated substrings: contiguous substrings of s that occur two or more times, possibly overlapping. Return any duplicated substring of the longest possible length, or the empty string if there is none.",
        "Example 1:\nInput: s = 'banana'\nOutput: 'ana'\nExplanation: The LCP array of 'banana' is [1, 3, 0, 0, 2]; the maximum entry 3 sits between the sorted suffixes 'ana' and 'anana', so 'ana' repeats (at indices 1 and 3).",
        "Example 2:\nInput: s = 'abcd'\nOutput: ''\nExplanation: All characters are distinct, so no substring repeats and every LCP entry is 0.",
        "Constraints:\n- 2 <= |s| <= 3 * 10^4\n- s consists of lowercase English letters",
      ],
      code: `// Assumes buildSuffixArray and buildLCP from the earlier questions.
string longestDupSubstring(const string& s) {
    vector<int> sa = buildSuffixArray(s);
    vector<int> lcp = buildLCP(s, sa);
    int best = 0, at = 0;
    for (int i = 0; i < (int)lcp.size(); i++) {
        if (lcp[i] > best) { best = lcp[i]; at = sa[i]; }
    }
    return s.substr(at, best);   // empty string when best stays 0
}`,
      explanation: [
        "A substring occurs at least twice exactly when it is a common prefix of two different suffixes. So the longest repeated substring has length max over all pairs of LCP(suffix i, suffix j).",
        "That maximum is always attained by an adjacent pair in the suffix array, because LCP of two suffixes equals the minimum LCP entry strictly between their positions, and a minimum over a range never exceeds any single entry in it. So one linear scan of the LCP array finds the answer - no pair enumeration needed.",
        "Overlap is allowed here and the method handles it for free: 'ana' at indices 1 and 3 in 'banana' overlap, and nothing in the argument above forbids it. If the problem demanded non-overlapping occurrences the LCP maximum would be wrong - you would need, for each candidate length L, the largest and smallest suffix index within each LCP-block of value at least L, and check that they differ by at least L.",
        "The intended LeetCode solution is binary search on the length plus Rabin-Karp rolling hashes at O(n log n) expected, which is shorter to write but probabilistic; a single hash modulus invites anti-hash tests. The suffix array is deterministic.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Last Substring in Lexicographical Order",
      difficulty: "Hard",
      variation: "Largest suffix is the last suffix-array entry",
      link: "https://leetcode.com/problems/last-substring-in-lexicographical-order/",
      question: [
        "Given a string s, return the lexicographically largest substring of s.",
        "Example 1:\nInput: s = 'abab'\nOutput: 'bab'\nExplanation: The substrings are 'a', 'ab', 'aba', 'abab', 'b', 'ba', 'bab'; the largest is 'bab'.",
        "Example 2:\nInput: s = 'leetcode'\nOutput: 'tcode'\nExplanation: 't' is the largest character and it occurs once, so the answer is the suffix starting there.",
        "Constraints:\n- 1 <= |s| <= 4 * 10^5\n- s consists of lowercase English letters",
      ],
      code: `// Assumes buildSuffixArray from the template question.
string lastSubstring(const string& s) {
    vector<int> sa = buildSuffixArray(s);
    return s.substr(sa.back());   // the greatest suffix is the greatest substring
}

// O(n) two-pointer alternative, no suffix array needed.
string lastSubstringLinear(const string& s) {
    int n = s.size(), i = 0, j = 1, k = 0;
    while (j + k < n) {
        if (s[i + k] == s[j + k]) { k++; continue; }
        if (s[i + k] < s[j + k]) i = max(i + k + 1, j);  // i's block is dominated
        else j = j + k + 1;                              // j's block is dominated
        if (i == j) j = i + 1;
        k = 0;
    }
    return s.substr(i);
}`,
      explanation: [
        "The maximum substring is always a suffix. If a substring s[l..r] with r < n-1 were maximal, appending the next character gives a strictly larger string, since a string is always smaller than any of its proper extensions. So the search space collapses from O(n^2) substrings to n suffixes, and the answer is simply the last entry of the suffix array.",
        "The two-pointer version is the intended O(n) solution and is worth understanding as a piece of suffix-comparison reasoning: keep the best candidate start i and a challenger j, extend a common match of length k, and on the first mismatch discard whichever candidate lost. Crucially, when i loses, every start inside i..i+k is also dominated, so i jumps past the whole matched block instead of advancing by one - that is what bounds the total work at O(n).",
        "The wrong-but-tempting approach is to keep only the positions of the largest character and compare naively. On inputs like 'zzzzz...z' with a tail, that degenerates to O(n^2) because all candidates tie for a long time - which is exactly the case the block-skipping rule handles.",
        "The suffix array route is heavier than needed here but immediate to write once the template exists, and it generalizes: the k-th largest substring, or the largest substring of bounded length, both fall out of the same array.",
        "Time: O(n log n) with the suffix array, O(n) with two pointers. Space: O(n) and O(1) respectively.",
      ],
    },
    {
      name: "Longest Common Substring",
      difficulty: "Hard",
      variation: "Two strings joined by a separator",
      link: "https://www.spoj.com/problems/LCS/",
      question: [
        "Two strings are given, one per line. Print the length of their longest common substring, or 0 if they share no character.",
        "Example 1:\nInput:\nalsdfkjfjkdsal\nfdjskalajfkdsla\nOutput:\n3\nExplanation: 'kds' occurs in both ('...jkdsal' and '...fkdsla') and no common substring of length 4 exists.",
        "Example 2:\nInput:\nabcdxyz\nxyzabcd\nOutput:\n4\nExplanation: 'abcd' is common to both and is the longest such block.",
        "Constraints:\n- 1 <= |a|, |b| <= 250000\n- Both strings consist of lowercase Latin letters",
      ],
      code: `vector<int> buildSuffixArray(const string& s) {
    string t = s + '\\1';
    int n = t.size();
    const int A = 256;
    vector<int> p(n), c(n), cnt(max(A, n), 0);
    for (int i = 0; i < n; i++) cnt[(unsigned char)t[i]]++;
    for (int i = 1; i < A; i++) cnt[i] += cnt[i - 1];
    for (int i = 0; i < n; i++) p[--cnt[(unsigned char)t[i]]] = i;
    c[p[0]] = 0;
    int classes = 1;
    for (int i = 1; i < n; i++) {
        if (t[p[i]] != t[p[i - 1]]) classes++;
        c[p[i]] = classes - 1;
    }
    vector<int> pn(n), cn(n);
    for (int h = 0; (1 << h) < n; h++) {
        for (int i = 0; i < n; i++) {
            pn[i] = p[i] - (1 << h);
            if (pn[i] < 0) pn[i] += n;
        }
        fill(cnt.begin(), cnt.begin() + classes, 0);
        for (int i = 0; i < n; i++) cnt[c[pn[i]]]++;
        for (int i = 1; i < classes; i++) cnt[i] += cnt[i - 1];
        for (int i = n - 1; i >= 0; i--) p[--cnt[c[pn[i]]]] = pn[i];
        cn[p[0]] = 0;
        classes = 1;
        for (int i = 1; i < n; i++) {
            pair<int,int> cur = {c[p[i]], c[(p[i] + (1 << h)) % n]};
            pair<int,int> pre = {c[p[i - 1]], c[(p[i - 1] + (1 << h)) % n]};
            if (cur != pre) classes++;
            cn[p[i]] = classes - 1;
        }
        c.swap(cn);
    }
    p.erase(p.begin());
    return p;
}

vector<int> buildLCP(const string& s, const vector<int>& sa) {
    int n = s.size();
    if (n <= 1) return {};
    vector<int> rnk(n), lcp(n - 1);
    for (int i = 0; i < n; i++) rnk[sa[i]] = i;
    int k = 0;
    for (int i = 0; i < n; i++) {
        if (rnk[i] == n - 1) { k = 0; continue; }
        int j = sa[rnk[i] + 1];
        while (i + k < n && j + k < n && s[i + k] == s[j + k]) k++;
        lcp[rnk[i]] = k;
        if (k) k--;
    }
    return lcp;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string a, b;
    cin >> a >> b;
    int cut = a.size();
    string s = a + '\\2' + b;    // separator not present in either string
    int n = s.size();
    vector<int> sa = buildSuffixArray(s);
    vector<int> lcp = buildLCP(s, sa);
    int best = 0;
    for (int i = 0; i + 1 < n; i++) {
        bool leftA = sa[i] < cut, rightA = sa[i + 1] < cut;
        if (leftA != rightA) best = max(best, lcp[i]);  // one from each string
    }
    cout << best << "\\n";
    return 0;
}`,
      explanation: [
        "Concatenate as a + separator + b and build the suffix array of the whole thing. A string is a common substring exactly when it is a common prefix of some suffix starting inside a and some suffix starting inside b, so the answer is the maximum LCP over all such cross pairs.",
        "As in the single-string case, the maximum over any pair is attained by an adjacent suffix-array pair, because LCP over a range is the minimum of the entries between them. So it suffices to scan adjacent positions and keep those whose two suffixes come from different sides of the cut - one linear pass.",
        "The separator must be a character that appears in neither string and it must be there. Without it, a suffix of a runs straight into b and can report a match longer than anything actually present in a, so the separator caps every comparison at the boundary and makes the reported LCP a genuine substring of a.",
        "Comparing only adjacent same-side pairs, or forgetting that a suffix of a is identified by sa[i] < cut, are the two bugs that show up here. Note also that classic DP on two strings costs O(|a| * |b|) time - 6 * 10^10 operations at these limits, which is exactly why the suffix array is the intended route.",
        "Time: O((|a| + |b|) log(|a| + |b|)). Space: O(|a| + |b|).",
      ],
    },
    {
      name: "String (Codeforces 123D)",
      difficulty: "Hard",
      variation: "Sum over distinct substrings of occurrence counts",
      link: "https://codeforces.com/problemset/problem/123/D",
      question: [
        "For a string p, let f(p) be the number of occurrences of p in the given string s (occurrences may overlap). Compute the sum of f(p) * (f(p) + 1) / 2 over all distinct non-empty substrings p of s.",
        "Example 1:\nInput:\naaaa\nOutput:\n20\nExplanation: 'a' occurs 4 times contributing 10, 'aa' 3 times contributing 6, 'aaa' twice contributing 3, 'aaaa' once contributing 1; total 20.",
        "Example 2:\nInput:\nabcdef\nOutput:\n21\nExplanation: Every one of the 21 substrings occurs exactly once and contributes 1.",
        "Example 3:\nInput:\nabacabadabacaba\nOutput:\n188",
        "Constraints:\n- 1 <= |s| <= 10^5\n- s consists of lowercase English letters",
      ],
      code: `vector<int> buildSuffixArray(const string& s) {
    string t = s + '\\1';
    int n = t.size();
    const int A = 256;
    vector<int> p(n), c(n), cnt(max(A, n), 0);
    for (int i = 0; i < n; i++) cnt[(unsigned char)t[i]]++;
    for (int i = 1; i < A; i++) cnt[i] += cnt[i - 1];
    for (int i = 0; i < n; i++) p[--cnt[(unsigned char)t[i]]] = i;
    c[p[0]] = 0;
    int classes = 1;
    for (int i = 1; i < n; i++) {
        if (t[p[i]] != t[p[i - 1]]) classes++;
        c[p[i]] = classes - 1;
    }
    vector<int> pn(n), cn(n);
    for (int h = 0; (1 << h) < n; h++) {
        for (int i = 0; i < n; i++) {
            pn[i] = p[i] - (1 << h);
            if (pn[i] < 0) pn[i] += n;
        }
        fill(cnt.begin(), cnt.begin() + classes, 0);
        for (int i = 0; i < n; i++) cnt[c[pn[i]]]++;
        for (int i = 1; i < classes; i++) cnt[i] += cnt[i - 1];
        for (int i = n - 1; i >= 0; i--) p[--cnt[c[pn[i]]]] = pn[i];
        cn[p[0]] = 0;
        classes = 1;
        for (int i = 1; i < n; i++) {
            pair<int,int> cur = {c[p[i]], c[(p[i] + (1 << h)) % n]};
            pair<int,int> pre = {c[p[i - 1]], c[(p[i - 1] + (1 << h)) % n]};
            if (cur != pre) classes++;
            cn[p[i]] = classes - 1;
        }
        c.swap(cn);
    }
    p.erase(p.begin());
    return p;
}

vector<int> buildLCP(const string& s, const vector<int>& sa) {
    int n = s.size();
    if (n <= 1) return {};
    vector<int> rnk(n), lcp(n - 1);
    for (int i = 0; i < n; i++) rnk[sa[i]] = i;
    int k = 0;
    for (int i = 0; i < n; i++) {
        if (rnk[i] == n - 1) { k = 0; continue; }
        int j = sa[rnk[i] + 1];
        while (i + k < n && j + k < n && s[i + k] == s[j + k]) k++;
        lcp[rnk[i]] = k;
        if (k) k--;
    }
    return lcp;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    long long n = s.size();
    vector<int> sa = buildSuffixArray(s);
    vector<int> lcp = buildLCP(s, sa);
    long long ans = n * (n + 1) / 2;      // the i == j diagonal: len of each suffix
    int m = lcp.size();
    vector<long long> left(m), right(m);
    vector<int> st;
    // left[i]: how far the window can stretch left with lcp[i] still the minimum
    for (int i = 0; i < m; i++) {
        while (!st.empty() && lcp[st.back()] >= lcp[i]) st.pop_back();
        left[i] = st.empty() ? i + 1 : i - st.back();
        st.push_back(i);
    }
    st.clear();
    // strict on one side, non-strict on the other, so equal values are not double counted
    for (int i = m - 1; i >= 0; i--) {
        while (!st.empty() && lcp[st.back()] > lcp[i]) st.pop_back();
        right[i] = st.empty() ? m - i : st.back() - i;
        st.push_back(i);
    }
    for (int i = 0; i < m; i++) ans += (long long)lcp[i] * left[i] * right[i];
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "Rewrite the sum combinatorially. f(p) * (f(p) + 1) / 2 counts unordered pairs (i, j) with i <= j of occurrences of p. Summing over all distinct p and swapping the order of summation gives: for every pair of suffixes i <= j, count the substrings p that are a prefix of both. That count is len(suffix i) when i = j and LCP(suffix i, suffix j) otherwise.",
        "So the answer is n(n+1)/2 for the diagonal plus the sum of LCP(i, j) over all unordered pairs of distinct suffixes. Since LCP of two suffixes equals the minimum LCP-array entry strictly between their suffix-array positions, that second term is the sum of range minima over all sub-arrays of the LCP array.",
        "Sum of all subarray minima is the standard monotonic-stack computation: for each index i find how many subarrays have lcp[i] as their minimum, namely left[i] * right[i] where left and right span until a strictly smaller neighbour. To avoid counting a subarray once per tied minimum, one side must break on >= and the other on >, which is exactly the asymmetry in the two loops.",
        "The value is around n^2 / 2 * n in the worst case ('aaaa...a' gives roughly n^3 / 6, about 1.6 * 10^14 at n = 10^5), so 64-bit accumulation is mandatory. Enumerating substrings, or hashing them, cannot fit in memory at these limits.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Longest Common Substring II",
      difficulty: "Hard",
      variation: "Common substring of many strings, sliding over the suffix array",
      link: "https://www.spoj.com/problems/LCS2/",
      question: [
        "You are given up to 10 strings, one per line, until end of input. Print the length of the longest string that appears as a contiguous substring of every one of them, or 0 if no character is common to all.",
        "Example 1:\nInput:\nalsdfkjfjkdsal\nfdjskalajfkdsla\naaaaajfaaaa\nOutput:\n2\nExplanation: 'jf' appears in all three; no length-3 block does ('kds' is missing from the third string).",
        "Example 2:\nInput:\nabcxyz\nzabcq\nmabcn\nOutput:\n3\nExplanation: 'abc' is common to all three.",
        "Constraints:\n- 1 <= number of strings <= 10\n- 1 <= length of each string <= 100000\n- All strings consist of lowercase Latin letters",
      ],
      code: `vector<int> buildSuffixArray(const string& s) {
    string t = s + '\\1';
    int n = t.size();
    const int A = 256;
    vector<int> p(n), c(n), cnt(max(A, n), 0);
    for (int i = 0; i < n; i++) cnt[(unsigned char)t[i]]++;
    for (int i = 1; i < A; i++) cnt[i] += cnt[i - 1];
    for (int i = 0; i < n; i++) p[--cnt[(unsigned char)t[i]]] = i;
    c[p[0]] = 0;
    int classes = 1;
    for (int i = 1; i < n; i++) {
        if (t[p[i]] != t[p[i - 1]]) classes++;
        c[p[i]] = classes - 1;
    }
    vector<int> pn(n), cn(n);
    for (int h = 0; (1 << h) < n; h++) {
        for (int i = 0; i < n; i++) {
            pn[i] = p[i] - (1 << h);
            if (pn[i] < 0) pn[i] += n;
        }
        fill(cnt.begin(), cnt.begin() + classes, 0);
        for (int i = 0; i < n; i++) cnt[c[pn[i]]]++;
        for (int i = 1; i < classes; i++) cnt[i] += cnt[i - 1];
        for (int i = n - 1; i >= 0; i--) p[--cnt[c[pn[i]]]] = pn[i];
        cn[p[0]] = 0;
        classes = 1;
        for (int i = 1; i < n; i++) {
            pair<int,int> cur = {c[p[i]], c[(p[i] + (1 << h)) % n]};
            pair<int,int> pre = {c[p[i - 1]], c[(p[i - 1] + (1 << h)) % n]};
            if (cur != pre) classes++;
            cn[p[i]] = classes - 1;
        }
        c.swap(cn);
    }
    p.erase(p.begin());
    return p;
}

vector<int> buildLCP(const string& s, const vector<int>& sa) {
    int n = s.size();
    if (n <= 1) return {};
    vector<int> rnk(n), lcp(n - 1);
    for (int i = 0; i < n; i++) rnk[sa[i]] = i;
    int k = 0;
    for (int i = 0; i < n; i++) {
        if (rnk[i] == n - 1) { k = 0; continue; }
        int j = sa[rnk[i] + 1];
        while (i + k < n && j + k < n && s[i + k] == s[j + k]) k++;
        lcp[rnk[i]] = k;
        if (k) k--;
    }
    return lcp;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    vector<string> v;
    string line;
    while (cin >> line) v.push_back(line);
    int k = v.size();
    if (k == 1) { cout << v[0].size() << "\\n"; return 0; }
    string s;
    vector<int> owner;               // owner[pos] = which string, -1 for separators
    for (int i = 0; i < k; i++) {
        for (char ch : v[i]) { s += ch; owner.push_back(i); }
        s += (char)(2 + i);          // a distinct separator per string
        owner.push_back(-1);
    }
    int n = s.size();
    vector<int> sa = buildSuffixArray(s);
    vector<int> lcp = buildLCP(s, sa);
    vector<int> seen(k, 0);
    // Can some length-L block of the suffix array cover all k strings?
    auto feasible = [&](int L) {
        if (L == 0) return true;
        int i = 0;
        while (i < n) {
            int j = i, distinct = 0;
            fill(seen.begin(), seen.end(), 0);
            while (true) {
                int o = owner[sa[j]];
                if (o >= 0 && seen[o]++ == 0) distinct++;
                if (j + 1 < n && lcp[j] >= L) j++;   // stay inside the block
                else break;
            }
            if (distinct == k) return true;
            i = j + 1;
        }
        return false;
    };
    int lo = 0, hi = v[0].size(), ans = 0;
    while (lo <= hi) {
        int mid = (lo + hi) / 2;
        if (feasible(mid)) { ans = mid; lo = mid + 1; }
        else hi = mid - 1;
    }
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "Concatenate all k strings with a distinct separator after each, and build one suffix array of the result. A string of length L is common to all k inputs exactly when there are k suffixes, one owned by each input, that all share a prefix of length L.",
        "Suffixes sharing a prefix of length L form a maximal contiguous block of the suffix array in which every adjacent LCP entry is at least L - that is the same range-minimum property used throughout this topic. So the test 'is L achievable' becomes: split the suffix array at every position where lcp < L, and ask whether any resulting block contains a suffix from all k strings. That check is a single linear sweep with a per-string counter.",
        "Feasibility is monotone in L: any block witnessing length L also witnesses every shorter length, since raising the threshold only splits blocks further. So binary search on L over 0..|v[0]| gives O(n log n) checking on top of the O(n log n) build. The alternative in-place method sweeps a two-pointer window with a monotonic deque for the minimum LCP and avoids the outer log, but is much easier to get wrong.",
        "The separators must be pairwise distinct, not one shared character. With a single repeated separator, a suffix could match across a boundary and report a common substring that spans two inputs. Distinct separators guarantee every reported LCP lies entirely inside one original string. Note the answer is capped by the shortest input, and using v[0] as the upper bound is only safe because feasible() will reject anything longer anyway.",
        "Time: O(n log n) where n is the total length. Space: O(n).",
      ],
    },
  ],
};
