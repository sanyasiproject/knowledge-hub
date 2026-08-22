import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Find the Index of the First Occurrence in a String",
      difficulty: "Easy",
      variation: "Full Boyer-Moore, the template",
      link: "https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/",
      question: [
        "Given two strings haystack and needle, return the index of the first occurrence of needle in haystack, or -1 if needle is not part of haystack. Solve it with Boyer-Moore: align the pattern with the text, compare characters from right to left, and on a mismatch jump forward by the larger of the bad-character shift and the good-suffix shift.",
        "Example 1:\nInput: haystack = 'sadbutsad', needle = 'sad'\nOutput: 0\nExplanation: 'sad' occurs at index 0 and again at index 6; the first occurrence is index 0.",
        "Example 2:\nInput: haystack = 'leetcode', needle = 'leeto'\nOutput: -1\nExplanation: No alignment of 'leeto' matches, so the answer is -1.",
        "Constraints:\n- 1 <= haystack.length, needle.length <= 10^4\n- haystack and needle consist of lowercase English letters only",
      ],
      code: `class Solution {
    // bpos[i] = start of the widest border of the suffix pat[i..m-1]
    void buildGoodSuffix(const string& pat, vector<int>& shift, vector<int>& bpos) {
        int m = pat.size();
        int i = m, j = m + 1;
        bpos[i] = j;
        while (i > 0) {
            // pat[i-1] fails while pat[j-1] is the candidate continuation
            while (j <= m && pat[i - 1] != pat[j - 1]) {
                if (shift[j] == 0) shift[j] = j - i;   // first (smallest) shift wins
                j = bpos[j];
            }
            i--; j--;
            bpos[i] = j;
        }
        // case 2: only a prefix of pat matches the matched suffix
        j = bpos[0];
        for (i = 0; i <= m; i++) {
            if (shift[i] == 0) shift[i] = j;
            if (i == j) j = bpos[j];
        }
    }

public:
    int strStr(string haystack, string needle) {
        int n = haystack.size(), m = needle.size();
        if (m > n) return -1;
        vector<int> bad(256, -1);
        for (int i = 0; i < m; i++) bad[(unsigned char)needle[i]] = i;  // last index of each char
        vector<int> shift(m + 2, 0), bpos(m + 2, 0);
        buildGoodSuffix(needle, shift, bpos);
        int s = 0;
        while (s <= n - m) {
            int j = m - 1;
            while (j >= 0 && needle[j] == haystack[s + j]) j--;   // scan right to left
            if (j < 0) return s;
            s += max(shift[j + 1], j - bad[(unsigned char)haystack[s + j]]);
        }
        return -1;
    }
};`,
      explanation: [
        "Boyer-Moore compares the pattern to the text from the right end backwards. That order is what makes it fast: a mismatch at the very first comparison already tells you something about a character m-1 positions ahead of the current alignment, so you can often skip a whole pattern length without ever looking at the characters in between.",
        "The bad-character rule uses the mismatching text character c at pattern index j. If c occurs in the pattern, its rightmost occurrence bad[c] must be brought under position j, giving a shift of j - bad[c]; if c never occurs, the whole pattern can move past it. Because bad[c] can be greater than j this value may be non-positive, which is why it is combined with the good-suffix shift by max instead of used alone.",
        "The good-suffix rule uses the suffix pat[j+1..m-1] that did match. Either that suffix occurs again inside the pattern preceded by a different character (case 1), or only some prefix of the pattern equals a suffix of the matched part (case 2). shift[j+1] is the smallest slide that satisfies one of those, so no occurrence can be skipped. Taking max of the two rules is safe precisely because each rule alone never skips an occurrence.",
        "The tempting shortcut is to advance by only 1 on a mismatch, or to use the bad-character rule with max(1, ...) and drop good-suffix entirely. That still gives correct answers (it is Boyer-Moore-Horspool) but degrades to O(n*m) on inputs like a text of all 'a' with pattern 'baaaa'; the good-suffix table is what removes that family of worst cases.",
        "Time: O(n + m + sigma) preprocessing plus sublinear behaviour in practice, O(n*m) in the theoretical worst case without the Galil rule. Space: O(m + sigma).",
      ],
    },
    {
      name: "String Matching in an Array",
      difficulty: "Easy",
      variation: "All-pairs substring containment",
      link: "https://leetcode.com/problems/string-matching-in-an-array/",
      question: [
        "Given an array of strings words, return every string of words that is a substring of some other string in words. A substring is a contiguous sequence of characters. You may return the answer in any order, and each qualifying string only once.",
        "Example 1:\nInput: words = ['mass','as','hero','superhero']\nOutput: ['as','hero']\nExplanation: 'as' is a substring of 'mass' and 'hero' is a substring of 'superhero'. 'mass' and 'superhero' are not substrings of anything else.",
        "Example 2:\nInput: words = ['leetcode','et','code']\nOutput: ['et','code']\nExplanation: Both 'et' and 'code' appear inside 'leetcode'.",
        "Constraints:\n- 1 <= words.length <= 100\n- 1 <= words[i].length <= 30\n- words[i] consists of lowercase English letters\n- All words[i] are distinct",
      ],
      code: `class Solution {
    // Boyer-Moore-Horspool: bad-character rule only, clamped to a shift of >= 1
    bool contains(const string& txt, const string& pat) {
        int n = txt.size(), m = pat.size();
        if (m > n) return false;
        vector<int> bad(256, -1);
        for (int i = 0; i < m; i++) bad[(unsigned char)pat[i]] = i;
        int s = 0;
        while (s <= n - m) {
            int j = m - 1;
            while (j >= 0 && pat[j] == txt[s + j]) j--;
            if (j < 0) return true;
            s += max(1, j - bad[(unsigned char)txt[s + j]]);   // clamp keeps progress
        }
        return false;
    }

public:
    vector<string> stringMatching(vector<string>& words) {
        vector<string> ans;
        for (int i = 0; i < (int)words.size(); i++) {
            for (int j = 0; j < (int)words.size(); j++) {
                if (i == j) continue;
                if (contains(words[j], words[i])) { ans.push_back(words[i]); break; }
            }
        }
        return ans;
    }
};`,
      explanation: [
        "The outer double loop is just the definition of the problem: word i qualifies as soon as one other word contains it. The break after the first hit is what keeps each answer unique, since the words are guaranteed distinct.",
        "The inner search is Boyer-Moore stripped to its bad-character rule, the Horspool variant. Dropping the good-suffix table costs nothing here because the strings are at most 30 characters, and it keeps the preprocessing to a single pass over the pattern.",
        "The clamp max(1, j - bad[c]) is mandatory, not cosmetic. When the mismatching text character occurs in the pattern to the right of the mismatch position, j - bad[c] is negative or zero and the alignment would slide backwards, looping forever. The clamp guarantees the alignment strictly advances.",
        "The wrong-but-tempting version is to skip the i == j guard and let a word match itself - then every word is reported. Comparing lengths instead (only search when words[i] is shorter) also works and is slightly faster, but the identity guard is enough because the words are distinct.",
        "Time: O(k^2 * L) where k is the number of words and L the maximum length, so at most about 100 * 100 * 30 character comparisons. Space: O(sigma) per search plus the output.",
      ],
    },
    {
      name: "Maximum Repeating Substring",
      difficulty: "Easy",
      variation: "Search a repeated concatenation",
      link: "https://leetcode.com/problems/maximum-repeating-substring/",
      question: [
        "For a string sequence, word is called k-repeating if word concatenated k times is a substring of sequence. The value 0 is always valid because the empty concatenation is trivially present. Given sequence and word, return the maximum k such that word repeated k times is a substring of sequence.",
        "Example 1:\nInput: sequence = 'ababc', word = 'ab'\nOutput: 2\nExplanation: 'abab' is a substring of 'ababc' but 'ababab' is not, so the answer is 2.",
        "Example 2:\nInput: sequence = 'ababc', word = 'ba'\nOutput: 1\nExplanation: 'ba' occurs at index 2 but 'baba' does not occur.",
        "Constraints:\n- 1 <= sequence.length <= 100\n- 1 <= word.length <= 100\n- sequence and word consist of lowercase English letters",
      ],
      code: `class Solution {
    bool contains(const string& txt, const string& pat) {
        int n = txt.size(), m = pat.size();
        if (m > n) return false;
        vector<int> bad(256, -1);
        for (int i = 0; i < m; i++) bad[(unsigned char)pat[i]] = i;
        int s = 0;
        while (s <= n - m) {
            int j = m - 1;
            while (j >= 0 && pat[j] == txt[s + j]) j--;
            if (j < 0) return true;
            s += max(1, j - bad[(unsigned char)txt[s + j]]);
        }
        return false;
    }

public:
    int maxRepeating(string sequence, string word) {
        int limit = sequence.size() / word.size();   // k cannot exceed this
        string cur;
        int ans = 0;
        for (int k = 1; k <= limit; k++) {
            cur += word;                             // cur = word repeated k times
            if (!contains(sequence, cur)) break;     // monotone: no larger k can fit
            ans = k;
        }
        return ans;
    }
};`,
      explanation: [
        "The predicate 'word repeated k times occurs in sequence' is monotone decreasing in k: if word repeated k times occurs then so does word repeated k-1 times, since the shorter concatenation is a prefix of the longer one. So the first k that fails is the answer plus one and the loop can stop there.",
        "The upper bound sequence.length / word.length is a hard cap on k because k copies of word need exactly k * word.length characters of room. Without it the loop would build ever longer patterns forever.",
        "Each candidate is located with a Boyer-Moore bad-character search. Notice the pattern grows by word.length each round, which actually helps Boyer-Moore: longer patterns give longer skips, so the later, more expensive-looking iterations scan fewer positions than you would expect.",
        "The trap is to look for k occurrences of word anywhere in sequence rather than k adjacent copies. In 'abxab' the word 'ab' occurs twice but is only 1-repeating, because the copies are not contiguous.",
        "Time: O(n^2 / m) character work in the worst case, since there are at most n/m iterations and each search scans O(n) alignments, with n = sequence.length and m = word.length. Space: O(n) for the built pattern.",
      ],
    },
    {
      name: "Rotate String",
      difficulty: "Easy",
      variation: "Cyclic rotation via text doubling",
      link: "https://leetcode.com/problems/rotate-string/",
      question: [
        "Given two strings s and goal, return true if and only if s can become goal after some number of left shifts. A left shift on s moves the leftmost character to the rightmost position, so 'abcde' becomes 'bcdea' after one shift.",
        "Example 1:\nInput: s = 'abcde', goal = 'cdeab'\nOutput: true\nExplanation: Two left shifts turn 'abcde' into 'cdeab'.",
        "Example 2:\nInput: s = 'abcde', goal = 'abced'\nOutput: false\nExplanation: No number of left shifts produces 'abced'.",
        "Constraints:\n- 1 <= s.length, goal.length <= 100\n- s and goal consist of lowercase English letters",
      ],
      code: `class Solution {
    bool contains(const string& txt, const string& pat) {
        int n = txt.size(), m = pat.size();
        if (m > n) return false;
        vector<int> bad(256, -1);
        for (int i = 0; i < m; i++) bad[(unsigned char)pat[i]] = i;
        int s = 0;
        while (s <= n - m) {
            int j = m - 1;
            while (j >= 0 && pat[j] == txt[s + j]) j--;
            if (j < 0) return true;
            s += max(1, j - bad[(unsigned char)txt[s + j]]);
        }
        return false;
    }

public:
    bool rotateString(string s, string goal) {
        if (s.size() != goal.size()) return false;   // must check first
        return contains(s + s, goal);
    }
};`,
      explanation: [
        "Every rotation of s appears as a length-|s| window of s + s, and every such window is a rotation of s. So 'goal is a rotation of s' is exactly 'goal is a substring of s + s', once the two lengths are known to be equal.",
        "The length check cannot be skipped. Without it a shorter goal such as 'ab' would be found inside 'abcabc' and reported as a rotation, which it is not.",
        "Boyer-Moore is a natural fit for the doubled text: the pattern is as long as half the text, so the bad-character rule can leap almost the whole pattern on a single mismatch, and typically only a handful of alignments are ever examined.",
        "A tempting alternative is to compare character counts or sorted characters. Equal multisets is a necessary condition, not a sufficient one: 'abab' and 'aabb' contain the same characters with the same multiplicities, yet the rotations of 'abab' are only 'abab' and 'baba'.",
        "Time: O(n) preprocessing plus a search over a text of length 2n, sublinear in practice. Space: O(n) for the doubled string.",
      ],
    },
    {
      name: "A Needle in the Haystack",
      difficulty: "Medium",
      variation: "Report every occurrence position",
      link: "https://www.spoj.com/problems/NHAY/",
      question: [
        "The input consists of several test cases. Each test case is three lines: the length of the pattern, then the pattern itself, then the text to search. For each test case print the zero-based starting position of every occurrence of the pattern in the text, one position per line, in increasing order, followed by a blank line. Occurrences may overlap.",
        "Example 1:\nInput:\n2\nna\nbanananobano\nOutput:\n2\n4\nExplanation: The text is b a n a n a n o b a n o. 'na' starts at index 2 and index 4. The window at index 6 is 'no', so it does not count.",
        "Constraints:\n- The pattern length is at most 10^6\n- The text length is at most 10^6 per test case\n- Read test cases until end of input",
      ],
      code: `void buildGoodSuffix(const string& pat, vector<int>& shift, vector<int>& bpos) {
    int m = pat.size();
    int i = m, j = m + 1;
    bpos[i] = j;
    while (i > 0) {
        while (j <= m && pat[i - 1] != pat[j - 1]) {
            if (shift[j] == 0) shift[j] = j - i;
            j = bpos[j];
        }
        i--; j--;
        bpos[i] = j;
    }
    j = bpos[0];
    for (i = 0; i <= m; i++) {
        if (shift[i] == 0) shift[i] = j;
        if (i == j) j = bpos[j];
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int m;
    string pat, txt;
    while (cin >> m >> pat >> txt) {
        int n = txt.size();
        m = pat.size();
        vector<int> bad(256, -1);
        for (int i = 0; i < m; i++) bad[(unsigned char)pat[i]] = i;
        vector<int> shift(m + 2, 0), bpos(m + 2, 0);
        buildGoodSuffix(pat, shift, bpos);
        string out;
        int s = 0;
        while (s <= n - m) {
            int j = m - 1;
            while (j >= 0 && pat[j] == txt[s + j]) j--;
            if (j < 0) {
                out += to_string(s);
                out += '\\n';
                s += shift[0];        // shift[0] is the period of the pattern
            } else {
                s += max(shift[j + 1], j - bad[(unsigned char)txt[s + j]]);
            }
        }
        out += '\\n';                 // blank line after each test case
        cout << out;
    }
    return 0;
}`,
      explanation: [
        "Finding all occurrences instead of the first one changes exactly one line: after a full match the alignment must advance by an amount that cannot skip an overlapping occurrence. That amount is shift[0], which the good-suffix preprocessing sets to m minus the length of the longest border of the pattern - in other words the period of the pattern.",
        "Advancing by m after a match is the classic bug here. With pattern 'aa' and text 'aaaa' the occurrences are at 0, 1 and 2; a jump of m = 2 reports only 0 and 2. Advancing by 1 is always safe but turns a periodic pattern into quadratic work, whereas the period is both safe and maximal.",
        "The bad-character table is indexed by unsigned char so that inputs outside the 7-bit range do not produce a negative index. On a judge with arbitrary byte input that cast is a correctness issue, not a style choice.",
        "Output is accumulated into one string and flushed once per test case. With up to 10^6 reported positions, one cout per line dominates the runtime even with sync_with_stdio disabled.",
        "Time: O(n + m) preprocessing plus the search, sublinear in practice per test case. Space: O(m) for the tables plus the output buffer.",
      ],
    },
    {
      name: "String Matching",
      difficulty: "Medium",
      variation: "Count occurrences, judge problem",
      link: "https://cses.fi/problemset/task/1753",
      question: [
        "Given a string and a pattern, count how many times the pattern occurs in the string. Occurrences may overlap. The first input line is the string and the second line is the pattern, both consisting of characters a-z.",
        "Example 1:\nInput:\nsaippuakauppias\npp\nOutput: 2\nExplanation: The string is s a i p p u a k a u p p i a s. 'pp' occurs at index 3 and at index 10.",
        "Example 2:\nInput:\naaaa\naa\nOutput: 3\nExplanation: Overlapping occurrences count, so 'aa' starts at indices 0, 1 and 2.",
        "Constraints:\n- 1 <= |string| <= 10^6\n- 1 <= |pattern| <= 10^6\n- Both strings contain only lowercase English letters",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string txt, pat;
    cin >> txt >> pat;
    int n = txt.size(), m = pat.size();
    if (m > n) { cout << 0 << "\\n"; return 0; }
    vector<int> bad(256, -1);
    for (int i = 0; i < m; i++) bad[(unsigned char)pat[i]] = i;
    // strong good-suffix preprocessing
    vector<int> shift(m + 2, 0), bpos(m + 2, 0);
    {
        int i = m, j = m + 1;
        bpos[i] = j;
        while (i > 0) {
            while (j <= m && pat[i - 1] != pat[j - 1]) {
                if (shift[j] == 0) shift[j] = j - i;
                j = bpos[j];
            }
            i--; j--;
            bpos[i] = j;
        }
        j = bpos[0];
        for (i = 0; i <= m; i++) {
            if (shift[i] == 0) shift[i] = j;
            if (i == j) j = bpos[j];
        }
    }
    long long cnt = 0;
    int s = 0;
    while (s <= n - m) {
        int j = m - 1;
        while (j >= 0 && pat[j] == txt[s + j]) j--;
        if (j < 0) {
            cnt++;
            s += shift[0];   // period of the pattern: safe for overlaps
        } else {
            s += max(shift[j + 1], j - bad[(unsigned char)txt[s + j]]);
        }
    }
    cout << cnt << "\\n";
    return 0;
}`,
      explanation: [
        "Only the count is needed, so the search loop is identical to the all-occurrences version with the output replaced by an increment. The interesting part is that overlaps are counted, which forces the post-match shift to be the pattern period rather than m.",
        "Why shift[0] is the period: bpos[0] is the starting index of the widest border of the whole pattern, and the case-2 pass fills shift[0] with that value. Sliding by the period aligns the longest prefix that can still be part of an occurrence, so nothing is missed and nothing is rechecked unnecessarily.",
        "The pathological case for this problem is a text of 10^6 identical characters with a pattern of 10^6 identical characters minus one. Pure bad-character Horspool is quadratic there; with the good-suffix table the post-match shift becomes 1 but each mismatch still shifts by a full period, and the classic fix for the remaining overlap re-scanning is the Galil rule, which remembers how much of the suffix was already verified.",
        "The counter must be 64-bit in principle - a text of length 10^6 with a pattern of length 1 yields 10^6 occurrences, which fits in an int, but making the accumulator long long costs nothing and removes the question.",
        "Time: O(n + m) preprocessing plus the scan, effectively linear on this input class. Space: O(n + m).",
      ],
    },
    {
      name: "Repeated Substring Pattern",
      difficulty: "Medium",
      variation: "Periodicity by self-search",
      link: "https://leetcode.com/problems/repeated-substring-pattern/",
      question: [
        "Given a string s, return true if it can be constructed by taking some proper substring of it and appending multiple copies of that substring together. In other words, decide whether s equals some non-empty string t repeated k >= 2 times.",
        "Example 1:\nInput: s = 'abab'\nOutput: true\nExplanation: s is 'ab' repeated twice.",
        "Example 2:\nInput: s = 'aba'\nOutput: false\nExplanation: No proper substring repeated two or more times gives 'aba'.",
        "Example 3:\nInput: s = 'abcabcabcabc'\nOutput: true\nExplanation: s is 'abc' repeated four times, and also 'abcabc' repeated twice.",
        "Constraints:\n- 1 <= s.length <= 10^4\n- s consists of lowercase English letters",
      ],
      code: `class Solution {
    bool contains(const string& txt, const string& pat) {
        int n = txt.size(), m = pat.size();
        if (m > n) return false;
        vector<int> bad(256, -1);
        for (int i = 0; i < m; i++) bad[(unsigned char)pat[i]] = i;
        int s = 0;
        while (s <= n - m) {
            int j = m - 1;
            while (j >= 0 && pat[j] == txt[s + j]) j--;
            if (j < 0) return true;
            s += max(1, j - bad[(unsigned char)txt[s + j]]);
        }
        return false;
    }

public:
    bool repeatedSubstringPattern(string s) {
        int n = s.size();
        if (n < 2) return false;
        string doubled = s + s;
        // drop the first and last character so the trivial matches at 0 and n vanish
        string mid = doubled.substr(1, 2 * n - 2);
        return contains(mid, s);
    }
};`,
      explanation: [
        "The key fact: s is a repetition of a proper substring exactly when s occurs inside s + s at some position strictly between 0 and n. If s occurs at position p with 0 < p < n then s is invariant under a rotation by p, which forces gcd(p, n) to be a period of s that is smaller than n, so s is built from a block of that length.",
        "Cutting one character off each end of s + s is the clean way to exclude the two trivial matches at positions 0 and n. Searching the full doubled string and checking that some found position lies in (0, n) works too, but requires collecting positions instead of a single boolean.",
        "Boyer-Moore is well suited here because the pattern is exactly half the text, so the bad-character rule usually skips almost n characters per mismatch and the search touches very few alignments.",
        "The tempting wrong approach is to test only divisors d of n by comparing s to its prefix of length d repeated n/d times. That is actually correct, but people often forget that the block length must divide n and try every length, or forget to exclude d = n and report true for every string.",
        "Time: O(n) to build the doubled string plus a Boyer-Moore search over 2n characters. Space: O(n).",
      ],
    },
    {
      name: "Repeated String Match",
      difficulty: "Medium",
      variation: "Minimum repeats to contain a pattern",
      link: "https://leetcode.com/problems/repeated-string-match/",
      question: [
        "Given two strings a and b, return the minimum number of times you must repeat a so that b is a substring of the result. If it is impossible for b to ever be a substring of a repeated, return -1.",
        "Example 1:\nInput: a = 'abcd', b = 'cdabcdab'\nOutput: 3\nExplanation: Repeating a three times gives 'abcdabcdabcd', which contains 'cdabcdab' starting at index 2. Two copies give only 8 characters and do not contain it.",
        "Example 2:\nInput: a = 'a', b = 'aa'\nOutput: 2\nExplanation: 'aa' is a repeated twice.",
        "Constraints:\n- 1 <= a.length, b.length <= 10^4\n- a and b consist of lowercase English letters",
      ],
      code: `class Solution {
    int search(const string& txt, const string& pat) {
        int n = txt.size(), m = pat.size();
        if (m > n) return -1;
        vector<int> bad(256, -1);
        for (int i = 0; i < m; i++) bad[(unsigned char)pat[i]] = i;
        int s = 0;
        while (s <= n - m) {
            int j = m - 1;
            while (j >= 0 && pat[j] == txt[s + j]) j--;
            if (j < 0) return s;
            s += max(1, j - bad[(unsigned char)txt[s + j]]);
        }
        return -1;
    }

public:
    int repeatedStringMatch(string a, string b) {
        int la = a.size(), lb = b.size();
        int copies = lb / la + 2;          // enough room for any possible alignment
        string txt;
        txt.reserve((size_t)copies * la);
        for (int i = 0; i < copies; i++) txt += a;
        int p = search(txt, b);
        if (p == -1) return -1;
        return (p + lb + la - 1) / la;     // ceil((p + lb) / la)
    }
};`,
      explanation: [
        "If b ever occurs in a repeated, it occurs in a repeated lb/la + 2 times. Reason: an occurrence starts at some offset p that can be taken with p < la (otherwise slide it left by whole copies of a), and it spans lb further characters, so p + lb < la + lb <= la * (lb/la + 2). One extra copy covers the offset, one more covers the rounding.",
        "Once the leftmost occurrence is at index p, the number of copies actually consumed is the number of blocks of length la needed to cover the range [0, p + lb), which is ceil((p + lb) / la). Using the leftmost p is what makes this minimal, and Boyer-Moore naturally returns the leftmost match because alignments are tried in increasing order.",
        "The tempting bug is to build only lb/la + 1 copies. For a = 'abcd', b = 'cdabcdab' that gives 'abcdabcd' of length 8, in which b does not occur even though the true answer is 3, so the function wrongly returns -1.",
        "A cheap early rejection - checking that every distinct character of b appears in a - is a nice optimisation but not a substitute for the search; 'ab' contains both characters of 'ba' yet 'ba' does occur in 'abab', so character sets decide nothing on their own.",
        "Time: O((la + lb) * something) for the search over a text of length O(la + lb), plus O(la + lb) to build it. Space: O(la + lb).",
      ],
    },
    {
      name: "Form Array by Concatenating Subarrays of Another Array",
      difficulty: "Medium",
      variation: "Pattern matching over integer arrays",
      link: "https://leetcode.com/problems/form-array-by-concatenating-subarrays-of-another-array/",
      question: [
        "You are given a 2D integer array groups of length n and an integer array nums. You may choose n disjoint subarrays of nums such that the i-th chosen subarray equals groups[i] element by element, and the chosen subarrays appear in nums in the same order as in groups. Return true if such a choice exists, false otherwise. Two subarrays are disjoint if they do not share any index of nums.",
        "Example 1:\nInput: groups = [[1,-1,-1],[3,-2,0]], nums = [1,-1,0,1,-1,-1,3,-2,0]\nOutput: true\nExplanation: Take nums[3..5] = [1,-1,-1] and nums[6..8] = [3,-2,0]. They are disjoint and in order.",
        "Example 2:\nInput: groups = [[1,2,3],[3,4]], nums = [7,7,1,2,3,4,7,7]\nOutput: false\nExplanation: The only copy of [1,2,3] is nums[2..4] and the only copy of [3,4] is nums[4..5]; they overlap at index 4, so no disjoint choice exists.",
        "Constraints:\n- 1 <= groups.length <= 10^3\n- 1 <= groups[i].length, nums.length <= 10^3\n- -10^7 <= groups[i][j], nums[k] <= 10^7",
      ],
      code: `class Solution {
    // Boyer-Moore bad-character search over ints, starting at index from
    int search(const vector<int>& txt, const vector<int>& pat, int from) {
        int n = txt.size(), m = pat.size();
        unordered_map<int,int> last;
        for (int i = 0; i < m; i++) last[pat[i]] = i;   // rightmost index per value
        int s = from;
        while (s + m <= n) {
            int j = m - 1;
            while (j >= 0 && pat[j] == txt[s + j]) j--;
            if (j < 0) return s;
            auto it = last.find(txt[s + j]);
            int lastPos = (it == last.end()) ? -1 : it->second;
            s += max(1, j - lastPos);
        }
        return -1;
    }

public:
    bool canChoose(vector<vector<int>>& groups, vector<int>& nums) {
        int pos = 0;
        for (auto& g : groups) {
            int p = search(nums, g, pos);   // leftmost match at or after pos
            if (p == -1) return false;
            pos = p + (int)g.size();        // next group must start after this one
        }
        return true;
    }
};`,
      explanation: [
        "Greedy from the left is optimal. If any valid assignment exists, replacing the first group's chosen occurrence by the leftmost occurrence at or after position 0 only frees up suffix space for the remaining groups, and the same exchange argument applies inductively to every later group. So taking the leftmost feasible match each time never loses a solution.",
        "Disjointness and ordering both come out of the single variable pos: the next search starts at p + |g|, which is the first index after the match just consumed. There is no need for a separate overlap check.",
        "Boyer-Moore transfers to integer arrays unchanged - the alphabet is just not small enough for an array table, so the rightmost-occurrence map becomes a hash map. Values absent from the pattern map to -1 and let the alignment jump past them entirely, which is where the speedup comes from.",
        "The trap is treating the problem as subsequence matching. The groups must appear as contiguous blocks; scanning nums and consuming group elements one at a time whenever they match would accept [1,2,3] inside [1,9,2,9,3].",
        "Time: O(sum of |groups[i]| * |nums|) in the worst case, comfortably fast for inputs of size 10^3. Space: O(max |groups[i]|) for the shift map.",
      ],
    },
    {
      name: "Find Beautiful Indices in the Given Array II",
      difficulty: "Hard",
      variation: "Two pattern searches plus distance query",
      link: "https://leetcode.com/problems/find-beautiful-indices-in-the-given-array-ii/",
      question: [
        "You are given a string s, two strings a and b, and an integer k. An index i is beautiful if s[i..i+|a|-1] equals a and there exists an index j with s[j..j+|b|-1] equal to b and |j - i| <= k. Return the array of beautiful indices in sorted increasing order.",
        "Example 1:\nInput: s = 'isawsquirrelnearmysquirrelhouseohmy', a = 'my', b = 'squirrel', k = 15\nOutput: [16,33]\nExplanation: 'my' occurs at 16 and 33; 'squirrel' occurs at 4 and 18. For i = 16 take j = 18 with distance 2, and for i = 33 take j = 18 with distance 15. Both are within k = 15.",
        "Example 2:\nInput: s = 'abcd', a = 'a', b = 'a', k = 4\nOutput: [0]\nExplanation: 'a' occurs only at index 0, and j = 0 gives distance 0.",
        "Constraints:\n- 1 <= k <= s.length <= 5 * 10^5\n- 1 <= a.length, b.length <= 5 * 10^5\n- s, a and b consist of lowercase English letters",
      ],
      code: `class Solution {
    vector<int> allOccurrences(const string& txt, const string& pat) {
        int n = txt.size(), m = pat.size();
        vector<int> res;
        if (m > n) return res;
        vector<int> bad(256, -1);
        for (int i = 0; i < m; i++) bad[(unsigned char)pat[i]] = i;
        vector<int> shift(m + 2, 0), bpos(m + 2, 0);
        {
            int i = m, j = m + 1;
            bpos[i] = j;
            while (i > 0) {
                while (j <= m && pat[i - 1] != pat[j - 1]) {
                    if (shift[j] == 0) shift[j] = j - i;
                    j = bpos[j];
                }
                i--; j--;
                bpos[i] = j;
            }
            j = bpos[0];
            for (i = 0; i <= m; i++) {
                if (shift[i] == 0) shift[i] = j;
                if (i == j) j = bpos[j];
            }
        }
        int s = 0;
        while (s <= n - m) {
            int j = m - 1;
            while (j >= 0 && pat[j] == txt[s + j]) j--;
            if (j < 0) { res.push_back(s); s += shift[0]; }
            else s += max(shift[j + 1], j - bad[(unsigned char)txt[s + j]]);
        }
        return res;
    }

public:
    vector<int> beautifulIndices(string s, string a, string b, int k) {
        vector<int> A = allOccurrences(s, a);
        vector<int> B = allOccurrences(s, b);
        vector<int> ans;
        for (int i : A) {
            // first j >= i - k; beautiful iff that j also satisfies j <= i + k
            auto it = lower_bound(B.begin(), B.end(), i - k);
            if (it != B.end() && *it - i <= k) ans.push_back(i);
        }
        return ans;
    }
};`,
      explanation: [
        "The problem factors cleanly into two independent parts: locate every occurrence of a and of b, then answer for each occurrence i of a whether some occurrence of b lies in the window [i-k, i+k]. Both occurrence lists come out of Boyer-Moore already sorted, because alignments are tried in increasing order.",
        "The window test only needs the smallest candidate. If the first element of B that is at least i-k is still at most i+k, the window is non-empty; if it exceeds i+k then every later element does too, so the window is empty. That is why one lower_bound suffices instead of scanning the window.",
        "Reporting all occurrences means the post-match shift must be shift[0], the pattern period, not the pattern length. With a = 'aa' and s = 'aaaa' a shift of |a| would silently drop the occurrence at index 1 and produce a wrong answer rather than a slow one.",
        "The obvious quadratic approach - for every i in A scan all of B - is the trap at these constraints, since both lists can hold on the order of 5 * 10^5 entries. A two-pointer sweep over the two sorted lists is an equally valid linear alternative to the binary search.",
        "One honest caveat: classic Boyer-Moore without the Galil rule is O(n*m) in the worst case, so on adversarial highly periodic input a Z-function or prefix-function search is the safer choice for the occurrence lists; the good-suffix table removes the common bad cases but not all of them.",
        "Time: O(n + |a| + |b|) preprocessing plus the two searches, then O(|A| log |B|) for the queries. Space: O(n) for the occurrence lists.",
      ],
    },
    {
      name: "MUH and Cube Walls",
      difficulty: "Hard",
      variation: "Matching on a difference array",
      link: "https://codeforces.com/problemset/problem/471/D",
      question: [
        "Horace has a wall of n towers, the i-th of height a[i], and the bear has a wall of w towers, the i-th of height b[i]. Horace can see the bear's wall inside his own if some w consecutive towers of his wall, after being shifted up or down by one common amount, exactly equal the bear's wall. Count how many such positions exist in Horace's wall.",
        "Example 1:\nInput:\n5 3\n1 2 1 2 1\n7 8 7\nOutput: 2\nExplanation: The differences of Horace's wall are [1,-1,1,-1] and of the bear's wall are [1,-1]. The pattern [1,-1] occurs in [1,-1,1,-1] at offsets 0 and 2, so the windows a[0..2] = [1,2,1] and a[2..4] = [1,2,1] both match after shifting down by 6.",
        "Example 2:\nInput:\n4 1\n5 5 5 5\n9\nOutput: 4\nExplanation: A single tower can always be matched by choosing the right shift, so every one of the 4 positions counts.",
        "Constraints:\n- 1 <= n, w <= 2 * 10^5\n- 1 <= a[i], b[i] <= 10^9",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, w;
    cin >> n >> w;
    vector<long long> a(n), b(w);
    for (auto& x : a) cin >> x;
    for (auto& x : b) cin >> x;
    if (w == 1) { cout << n << "\\n"; return 0; }   // any single tower matches
    if (w > n) { cout << 0 << "\\n"; return 0; }
    vector<long long> txt(n - 1), pat(w - 1);
    for (int i = 0; i + 1 < n; i++) txt[i] = a[i + 1] - a[i];   // shift-invariant form
    for (int i = 0; i + 1 < w; i++) pat[i] = b[i + 1] - b[i];
    int N = txt.size(), m = pat.size();
    unordered_map<long long,int> last;
    last.reserve(m * 2);
    for (int i = 0; i < m; i++) last[pat[i]] = i;
    long long cnt = 0;
    int s = 0;
    while (s + m <= N) {
        int j = m - 1;
        while (j >= 0 && pat[j] == txt[s + j]) j--;
        if (j < 0) { cnt++; s += 1; }               // overlaps allowed, advance by one
        else {
            auto it = last.find(txt[s + j]);
            int lastPos = (it == last.end()) ? -1 : it->second;
            s += max(1, j - lastPos);
        }
    }
    cout << cnt << "\\n";
    return 0;
}`,
      explanation: [
        "The whole problem is choosing the right normal form. A vertical shift changes every height by the same constant, so it leaves consecutive differences untouched. Two windows are equal up to a shift exactly when their difference sequences are identical, which turns 'count shift-equal windows of length w' into 'count occurrences of a pattern of length w-1 in a text of length n-1'.",
        "The two degenerate cases must be handled before the differencing. When w = 1 the difference pattern is empty and every one of the n positions trivially matches, so the answer is n, not 0. When w > n no window exists at all.",
        "Occurrences may overlap - example 1 has matches at difference offsets 0 and 2 with the underlying windows sharing tower index 2 - so after a full match the alignment must advance by a value that cannot skip an overlapping match. Advancing by 1 is the simple safe choice; the pattern period from the good-suffix table would be the faster one.",
        "Heights reach 10^9 so differences span roughly plus or minus 10^9 and the alphabet is effectively unbounded. That rules out an array-indexed bad-character table and forces a hash map, which is also why the practical alternative on this problem is the Z-function or prefix function on the concatenated difference arrays - both are strictly O(n + w) with no hashing.",
        "The wrong-but-tempting normal form is to subtract the first element of each window instead of taking differences. That is equally shift invariant but is not a fixed pattern - the normalised window changes with the window, so no single string search applies.",
        "Time: O((n + w) * expected constant) for the hashed Boyer-Moore scan, O(n * w) in the adversarial worst case. Space: O(n + w).",
      ],
    },
  ],
};
