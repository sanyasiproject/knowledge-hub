import type { TopicContent } from "../types";

export const lyndonDuval: TopicContent = {
  quickSummary: [
    "A **Lyndon word** is a non-empty string strictly smaller than every one of its own proper suffixes — equivalently, strictly smallest among all its rotations, which makes it aperiodic.",
    "**Chen-Fox-Lyndon**: every string factors *uniquely* into Lyndon words `w1 w2 ... wk` with `w1 ≥ w2 ≥ ... ≥ wk`. Duval's algorithm produces that factorization in **O(n) time and O(1) extra space**.",
    "Running Duval over `s + s` and stopping at the factor that reaches position n gives the **smallest cyclic rotation** in O(n) time — the same answer as the Booth-style approach in the minimum rotation topic, from a different direction.",
  ],
  detailed: [
    "Get the definition exactly right, because everything follows from it. `w` is Lyndon if `w < v` for every proper suffix `v` of `w`. `\"a\"`, `\"ab\"`, `\"aab\"`, `\"abb\"` are Lyndon; `\"aa\"` is not (suffix `\"a\"` is smaller), and `\"abab\"` is not (suffix `\"ab\"` is smaller). Two consequences worth memorising: a Lyndon word is strictly smaller than all its rotations, and it is therefore aperiodic — no Lyndon word is `u^k` for `k ≥ 2`. A useful closure property: if `u` and `v` are Lyndon and `u < v`, then `uv` is Lyndon, which is how Lyndon words are generated in order.\n\nKey insight: uniqueness is what makes the factorization useful. `s = w1 w2 ... wk` with the factors non-increasing is the *only* way to write s as a non-increasing product of Lyndon words, so the factorization is a canonical form you can reason about.",
    "Duval's algorithm is a three-pointer scan that never backtracks. Keep `i` at the start of the current unprocessed region, `j` scanning forward, and `k` trailing exactly one candidate period behind `j`. While `s[k] <= s[j]`: on a strict `<` the prefix got larger, so reset `k = i` (the period restarts); on `==` advance `k` in step with `j`. When the loop stops, `p = j - k` is the period of the Lyndon prefix, and the algorithm emits `s[i..i+p)` repeatedly while `i <= k` — that inner emit is how a repeated factor like `\"ab\" \"ab\"` in `\"abab\"` comes out as two equal Lyndon words rather than one non-Lyndon `\"abab\"`.\n\nTotal work is **O(n)**: `j` only moves forward, and the amortised cost of the resets is bounded by the characters already consumed. Extra space is **O(1)** — the factorization can be streamed rather than stored.",
    "The smallest cyclic rotation falls out for free. Every rotation of `s` is a length-n window of `s + s`. Run Duval over the doubled string; the start of the factor that spans or reaches index n is the index of the least rotation. The reason is that the least rotation is exactly the position where a maximal Lyndon-like run begins, and Duval visits precisely those starts. Cost: **O(n) time, O(n) space** for the doubled string, or O(1) extra if you index modulo n instead of materialising the copy.\n\nThis is the same problem the **minimum rotation** topic solves with Booth's least-rotation scan; both are O(n), and Duval's version is the shorter loop to reproduce from memory.",
    "Where it shows up.\n\n| Use | How |\n| --- | --- |\n| Smallest cyclic rotation | Duval over `s+s`, take the factor start reaching n |\n| Largest rotation | run the same code with the comparison reversed |\n| Suffix array construction | the Lyndon factorization underpins the linear-time SACA-K / bijective BWT family |\n| Necklace generation | Lyndon words in lexicographic order enumerate binary necklaces |\n| Canonical form of a cycle | factorize once, compare canonical forms |\n\nCommon mistake: emitting one factor per outer iteration. When the Lyndon prefix repeats — `\"abab\"` — the correct output is `\"ab\"`, `\"ab\"`, so the emit must be a `while (i <= k)` loop, not a single `push_back`. A quick self-check for any implementation: concatenating the factors must reproduce the input exactly, and the factor list must be non-increasing.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Duval's algorithm — Lyndon factorization in O(n) time, O(1) extra space",
      source: `#include <cstdio>
#include <string>
#include <vector>
using namespace std;

// Chen-Fox-Lyndon factorization. Returns the unique non-increasing sequence
// of Lyndon words whose concatenation is s. O(n) time, O(1) extra space
// (the output vector aside -- factors can be streamed instead).
vector<string> duval(const string &s) {
    int n = (int)s.size(), i = 0;
    vector<string> factors;
    while (i < n) {
        int j = i + 1, k = i;          // j scans forward, k trails one period behind
        while (j < n && s[k] <= s[j]) {
            if (s[k] < s[j]) k = i;    // strictly larger => the period restarts
            else ++k;                  // equal => stay in step with the current period
            ++j;
        }
        // j - k is the period of the Lyndon prefix; emit every whole copy of it.
        while (i <= k) {
            factors.push_back(s.substr(i, j - k));
            i += j - k;
        }
    }
    return factors;
}

// Smallest cyclic rotation: Duval over s+s, keeping the last factor start
// that begins before position n. O(n) time, O(n) space for the doubled string.
int leastRotation(const string &s) {
    int n = (int)s.size();
    if (n == 0) return 0;
    string d = s + s;
    int best = 0, i = 0;
    while (i < n) {
        best = i;
        int j = i + 1, k = i;
        while (j < 2 * n && d[k] <= d[j]) {
            if (d[k] < d[j]) k = i; else ++k;
            ++j;
        }
        while (i <= k) i += j - k;
    }
    return best;
}

int main() {
    for (const string &w : duval("bbababaabaabab")) printf("%s ", w.c_str());
    // prints: b b ab ab aabaabab   (non-increasing, concatenates back to the input)
    printf("\\n");
    string s = "bbaaccaadd";
    int r = leastRotation(s);
    printf("%d %s\\n", r, (s.substr(r) + s.substr(0, r)).c_str());   // 2 aaccaaddbb
}`,
    },
  ],
  cheatSheet: [
    "Lyndon word: strictly smaller than all its proper suffixes ⇔ strictly smallest of its rotations ⇒ aperiodic.",
    "Chen-Fox-Lyndon: unique factorization `s = w1 w2 ... wk` with `w1 ≥ w2 ≥ ... ≥ wk`.",
    "Duval: O(n) time, O(1) extra space; pointers `i` (factor start), `j` (scan), `k` (period trail); period = `j - k`.",
    "Emit `while (i <= k)`, not once — repeated prefixes must split into equal factors.",
    "Least rotation: Duval over `s+s`, O(n) time; same result as Booth's scan in the minimum rotation topic.",
  ],
  interviewQA: [
    {
      q: "Define a Lyndon word and prove the factorization of any string into Lyndon words is unique.",
      a: "A Lyndon word is a non-empty string strictly smaller than every proper suffix of itself; equivalently it is strictly smallest among its rotations, which forces it to be aperiodic. Chen-Fox-Lyndon says every string s has a factorization s = w1 w2 … wk into Lyndon words with w1 ≥ w2 ≥ … ≥ wk, and that it is unique. Existence is easy: single characters are Lyndon, so start with the character-wise factorization and repeatedly merge any adjacent pair with wi < wi+1, which is legal because u < v with both Lyndon implies uv is Lyndon; the process terminates since the factor count strictly drops. For uniqueness, note that w1 must be the longest Lyndon prefix of s. Suppose it were not — if the first factor were shorter, the following factor would have to be less than or equal to it while the longer Lyndon prefix would extend across the boundary, and comparing the two at their first differing character contradicts either the non-increasing condition or the minimality of the Lyndon factor. So w1 is forced, and induction on the remaining suffix forces the rest. Duval's algorithm is the constructive version, computing exactly this in O(n) time and O(1) extra space.",
      followUps: [
        "Why does u < v with both Lyndon imply uv is Lyndon?",
        "How many Lyndon words of length n are there over a binary alphabet?",
      ],
    },
    {
      q: "Give the index of the lexicographically smallest rotation of a string in O(n). Walk through why your method works.",
      a: "Run Duval's scan over s + s and take the start of the last factor that begins at an index below n. The reason: every rotation of s is a length-n window of s + s, and the smallest rotation begins where a Lyndon factor begins — if the minimal rotation started strictly inside a factor, that factor would have a proper suffix smaller than itself, contradicting the Lyndon property. Duval visits exactly the factor starts, in increasing order, so the last start below n is the answer. Cost is O(n) time; O(n) space for the doubled string, reducible to O(1) extra by indexing modulo n. Two edge cases matter. If s is a repetition like 'aaaa', many rotations tie and the algorithm returns the first, which is fine since the resulting strings are identical — a correctness test should compare the rotated strings, not the indices. And the outer loop must be bounded by i < n rather than i < 2n, otherwise it keeps scanning into the duplicated half and reports an index ≥ n. The minimum rotation topic solves the same problem with Booth's least-rotation scan; both are O(n), and this one is the shorter loop to reconstruct under pressure.",
      followUps: [
        "How do you get the largest rotation with the same code?",
        "How would you compare two necklaces for equivalence in O(n)?",
      ],
    },
  ],
  flashcards: [
    {
      front: "What is a Lyndon word?",
      back: "A non-empty string strictly smaller than every one of its proper suffixes. Equivalently, strictly smallest among all its rotations — which implies it is aperiodic (never u^k for k ≥ 2).",
    },
    {
      front: "State the Chen-Fox-Lyndon theorem and Duval's complexity.",
      back: "Every string factors uniquely as w1 w2 … wk where each wi is Lyndon and w1 ≥ w2 ≥ … ≥ wk. Duval computes it in O(n) time and O(1) extra space, in a single non-backtracking left-to-right scan.",
    },
    {
      front: "How does Duval give the smallest cyclic rotation?",
      back: "Run the scan over s + s and return the start of the last factor beginning before index n. The minimal rotation must start at a Lyndon factor boundary. O(n) time, O(n) space for the doubled string (O(1) extra if you index mod n). Same result as Booth's scan in the minimum rotation topic.",
    },
  ],
};
