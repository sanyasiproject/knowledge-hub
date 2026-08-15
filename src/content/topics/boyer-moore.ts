import type { TopicContent } from "../types";

export const boyerMoore: TopicContent = {
  quickSummary: [
    "Aligns the pattern, then compares **right to left**. A mismatch near the right end lets it skip a whole block of text without ever looking at it — the only classic matcher that is *sublinear* in practice.",
    "Two skip rules, take the larger: the **bad-character** heuristic (align the mismatched text character with its rightmost occurrence in the pattern) and the **good-suffix** heuristic (reuse the suffix that already matched).",
    "O(n/m) best case, O(n + m) preprocessing, O(n·m) worst case for the plain version. Space O(σ + m). This is the family GNU grep and `memmem` are built on.",
  ],
  detailed: [
    "The whole idea is that scanning backwards makes ignorance cheap. Line the pattern up at text offset `s` and compare `pat[m-1]` against `text[s+m-1]` first, walking left. If the very first comparison mismatches on a character that does not appear in the pattern at all, none of the m alignments overlapping it can match, so you jump m positions and never read the m−1 characters you skipped.\n\nFor example, searching for `\"WEATHER\"` in English text: most mismatches land on a letter absent from the pattern, so the scan advances 7 bytes per comparison and touches roughly n/7 characters.",
    "The bad-character rule handles the character that broke the match. Precompute `last[c]` = rightmost index of `c` in the pattern (−1 if absent), a table of size σ built in O(σ + m). On a mismatch at pattern index `j` against text character `c`, shift by `j - last[c]`, which slides the pattern right until `c` lines up with its rightmost occurrence. If `c` is not in the pattern, `last[c] = -1` and the shift is `j + 1`.\n\nCommon mistake: `j - last[c]` can be zero or negative when `c` occurs to the *right* of `j` in the pattern. Take `max` with the good-suffix shift (which is always ≥ 1) or the search loop stalls forever.",
    "The good-suffix rule exploits what already matched. The characters `pat[j+1..m-1]` matched before the mismatch at `j`. Two cases: that suffix occurs somewhere else in the pattern preceded by a *different* character, so shift to align that copy; or it does not, in which case shift so the longest prefix of the pattern that is also a suffix of the matched part lines up. Both cases fold into one `gs[0..m]` table built in O(m) with a border-array sweep, exactly parallel to KMP's failure function. Taking `max(badChar, goodSuffix)` each step is what makes the algorithm correct *and* fast.\n\n| Variant | Preprocess | Search (typical) | Search (worst) | Notes |\n| --- | --- | --- | --- | --- |\n| Boyer-Moore | O(m + σ) | ~O(n/m) | O(n·m) | both heuristics |\n| Boyer-Moore-Horspool | O(m + σ) | ~O(n/m) | O(n·m) | bad char only, trivial to write |\n| Apostolico-Giancarlo | O(m + σ) | ~O(n/m) | O(n) | BM plus match memoisation |\n| KMP | O(m) | O(n) | O(n) | reads every character |",
    "In practice, learn Horspool and know that BM exists. Horspool drops the good-suffix table entirely and always shifts on the *last* character of the current window rather than the mismatched one — about eight lines of code, the same sublinear behaviour on real text, and no border-array subtlety to get wrong under interview pressure. Full BM only pulls ahead on small alphabets with heavy periodicity (DNA, binary), where the good-suffix rule saves what the bad-character rule cannot. If you need a hard O(n) guarantee, use KMP or the Z-function; if you need many patterns at once, use Aho-Corasick or Rabin-Karp. Real string libraries hedge: glibc's `memmem` and GNU grep run a Horspool-style skip loop and fall back to a linear-time algorithm when the skip distances collapse.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Full Boyer-Moore — bad-character plus strong good-suffix",
      source: `#include <algorithm>
#include <cstdio>
#include <string>
#include <utility>
#include <vector>
using namespace std;

// Preprocess: O(m + sigma). Search: ~O(n/m) typical, O(n*m) worst. Space: O(m + sigma).
struct BoyerMoore {
    string pat;
    vector<int> last;   // last[c] = rightmost index of c in pat, else -1
    vector<int> gs;     // gs[j] = shift when the mismatch is at pattern index j-1

    explicit BoyerMoore(string p) : pat(std::move(p)) {
        buildBadChar();
        buildGoodSuffix();
    }

    void buildBadChar() {
        last.assign(256, -1);
        for (int i = 0; i < (int)pat.size(); ++i) last[(unsigned char)pat[i]] = i;
    }

    void buildGoodSuffix() {
        int m = (int)pat.size();
        gs.assign(m + 1, 0);
        vector<int> border(m + 2, 0);        // border[i] = widest border of pat[i..]
        int i = m, j = m + 1;
        border[i] = j;
        while (i > 0) {                      // case 1: matched suffix recurs inside pat
            while (j <= m && pat[i - 1] != pat[j - 1]) {
                if (gs[j] == 0) gs[j] = j - i;
                j = border[j];
            }
            --i; --j;
            border[i] = j;
        }
        j = border[0];
        for (i = 0; i <= m; ++i) {           // case 2: only a prefix of pat matches
            if (gs[i] == 0) gs[i] = j;
            if (i == j) j = border[j];
        }
    }

    vector<int> search(const string &text) const {
        vector<int> hits;
        int n = (int)text.size(), m = (int)pat.size();
        if (m == 0 || m > n) return hits;
        int s = 0;
        while (s <= n - m) {
            int j = m - 1;
            while (j >= 0 && pat[j] == text[s + j]) --j;   // compare RIGHT to LEFT
            if (j < 0) {
                hits.push_back(s);
                s += gs[0];                                // shift past this occurrence
            } else {
                // bad-char shift can be <= 0; gs is always >= 1, so max() guarantees progress
                s += max(gs[j + 1], j - last[(unsigned char)text[s + j]]);
            }
        }
        return hits;
    }
};

int main() {
    BoyerMoore bm("abra");
    for (int i : bm.search("abracadabra")) printf("%d ", i);   // prints: 0 7
}`,
    },
    {
      language: "cpp",
      caption: "Boyer-Moore-Horspool — the variant worth memorising",
      source: `#include <cstdio>
#include <string>
#include <vector>
using namespace std;

// Bad-character only, keyed on the LAST character of the window.
// Preprocess O(m + sigma); search ~O(n/m) typical, O(n*m) worst; space O(sigma).
vector<int> horspool(const string &text, const string &pat) {
    vector<int> hits;
    int n = (int)text.size(), m = (int)pat.size();
    if (m == 0 || m > n) return hits;

    vector<int> shift(256, m);                 // unseen character => jump the full width
    for (int i = 0; i < m - 1; ++i) shift[(unsigned char)pat[i]] = m - 1 - i;

    int s = 0;
    while (s <= n - m) {
        int j = m - 1;
        while (j >= 0 && pat[j] == text[s + j]) --j;
        if (j < 0) hits.push_back(s);
        s += shift[(unsigned char)text[s + m - 1]];   // table is built so this is always >= 1
    }
    return hits;
}

int main() {
    for (int i : horspool("abracadabra", "abra")) printf("%d ", i);   // prints: 0 7
}`,
    },
  ],
  cheatSheet: [
    "Scan the pattern right to left; shift by max(bad-character, good-suffix).",
    "Bad character: `last[c]` = rightmost index of c in pat; shift = `j - last[c]` (can be ≤ 0 — clamp it).",
    "Good suffix: O(m) border-array sweep, always ≥ 1, so it guarantees forward progress.",
    "Time: O(m + σ) preprocess, ~O(n/m) typical, O(n·m) worst. Space O(m + σ).",
    "Horspool = bad character only, shift on the window's last character. Eight lines, same practical speed.",
  ],
  interviewQA: [
    {
      q: "How can a string matcher be sublinear when KMP is already O(n)? Doesn't it have to read the text?",
      a: "It does not have to read all of it. Boyer-Moore compares right to left, so a mismatch on the window's rightmost character can prove that all m alignments overlapping that character are impossible — those m−1 text characters are never examined. With pattern length m and a large alphabet, the expected number of characters inspected is about n/m, so a 20-byte pattern in English text touches roughly 5% of the bytes. That is sublinear in the *number of characters read*, not a violation of any lower bound: the Ω(n) bound applies to algorithms that must certify every position, and BM certifies blocks at a time. The catch is that this is average-case behaviour. On a small alphabet with heavy periodicity — text 'aaaa…', pattern 'baaa' — the shifts collapse to 1 and plain BM degrades to O(n·m). The Apostolico-Giancarlo variant remembers previous match lengths and restores an O(n) worst case, and production libraries typically detect collapsing shifts and switch to a linear-time fallback.",
      followUps: [
        "Why does the good-suffix rule matter more on DNA than on English text?",
        "How does Apostolico-Giancarlo avoid the quadratic case?",
      ],
    },
    {
      q: "Write the bad-character shift, then explain the bug that makes it loop forever.",
      a: "Precompute `last[c]` as the rightmost index of character c in the pattern, −1 if absent. On a mismatch at pattern index j against text character c, shift the alignment by `j - last[c]`. When c is absent that is j+1, a full jump past it. The bug is that `last[c]` can be greater than j — the mismatched character does occur in the pattern, but only to the right of the mismatch position. Then `j - last[c]` is zero or negative, meaning the rule wants to shift the pattern *backwards*, and the search loop never advances. Two standard fixes: take `max(1, j - last[c])` for a Horspool-grade matcher, or in full Boyer-Moore take `max(goodSuffix[j+1], j - last[c])` — the good-suffix shift is always at least 1 by construction, so it both guarantees progress and usually gives the better jump. Horspool sidesteps the issue by keying the table on the window's last character with entries built to be in 1..m.",
      followUps: [
        "What does gs[0] mean, and why is it the shift used after a full match?",
        "How large is the bad-character table for Unicode, and what do you do instead?",
      ],
    },
  ],
  flashcards: [
    {
      front: "Boyer-Moore complexity — preprocessing, typical, worst case, space?",
      back: "Preprocess O(m + σ); typical ~O(n/m) sublinear; worst case O(n·m) for plain BM (O(n) with the Apostolico-Giancarlo variant); space O(m + σ).",
    },
    {
      front: "Name Boyer-Moore's two heuristics and what each uses.",
      back: "Bad character: aligns the mismatched *text* character with its rightmost occurrence in the pattern. Good suffix: reuses the already-matched *suffix*, aligning its next occurrence or the longest matching prefix. Shift by the max of the two.",
    },
    {
      front: "How does Horspool differ from full Boyer-Moore?",
      back: "It drops the good-suffix table and always shifts based on the text character aligned with the pattern's last position. Roughly eight lines, same sublinear behaviour on large alphabets, still O(n·m) worst case.",
    },
  ],
};
