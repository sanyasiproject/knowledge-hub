import type { TopicContent } from "../types";

export const rabinKarp: TopicContent = {
  quickSummary: [
    "Slides a fixed-width window over the text and compares a **rolling hash** instead of the characters — O(n + m) expected time, O(1) extra space beyond the input.",
    "A hash match is only a candidate: you must re-verify the m characters. Worst case is O(n·m) when every window collides or genuinely matches.",
    "Its real edge over KMP is **many patterns at once** (hash the whole set into a table and do one pass) and **2D pattern search** (hash rows, then hash the column of row-hashes).",
  ],
  detailed: [
    "The algorithm turns each length-m window into a number and compares numbers, not strings. Treat the window as a polynomial in a base `B` modulo a large prime `M`: `h = c0·B^(m-1) + c1·B^(m-2) + ... + c(m-1)`. Sliding right one position is two operations — subtract the outgoing character's contribution `c_i·B^(m-1)`, multiply by `B`, add the incoming character. That is O(1) per window, so all n − m + 1 window hashes cost O(n) total.\n\nKey insight: equal hashes do not mean equal strings. Every hash hit must be confirmed with a real `memcmp` of m bytes — the *spurious-hit recheck*. Skipping it is the single most common way this algorithm ships as a correctness bug.",
    "Complexity depends entirely on how often you pay for that recheck. With a random base modulo a prime near 2^61, a single false hit has probability about m/M, so across n windows the expected number of spurious rechecks is negligible and the total is **O(n + m) expected**. The **worst case is O(n·m)**: it materialises when the pattern truly occurs at almost every position (`text = \"aaaa...\"`, `pattern = \"aaa\"`) — there the rechecks are real matches, not collisions, so no hashing scheme can help. Space is O(1) for one pattern, O(k) for a set of k patterns.\n\nWarning: a fixed, well-known base and modulus is attackable. Anyone can precompute a text where thousands of windows collide, forcing the O(n·m) path — this is a routine way competitive-programming submissions get hacked. Seed the base from a runtime clock or `random_device` per run.",
    "Multiple patterns are where Rabin-Karp beats KMP outright. Group the patterns by length; for each length, hash all of them into an `unordered_map<hash, ids>` and make one pass over the text, probing the map with each window hash. Searching k patterns of the same length costs **O(n + total pattern length) expected**, versus running KMP k separate times for O(k·n). The same trick lifts to 2D: hash every row-window of width `w` to get a matrix of row-hashes, then run a 1-D rolling hash down each column to match an h×w block in O(rows·cols) expected.",
    "Pick the right tool against the neighbours.\n\n| Algorithm | Time | Guarantee | Best at |\n| --- | --- | --- | --- |\n| Rabin-Karp | O(n+m) expected | probabilistic | many patterns, 2D, streaming |\n| KMP / Z-function | O(n+m) | deterministic worst case | one pattern, adversarial input |\n| Aho-Corasick | O(n + Σm + occ) | deterministic | many patterns of *differing* lengths |\n| Boyer-Moore | O(n/m) best, O(n·m) worst | none | long patterns, large alphabets |\n\nNote the division of labour with the **rolling hash** topic: that one is the *primitive* (prefix hashes, O(1) substring hash, double hashing). Rabin-Karp is the *matching algorithm* built on it — the primitive is reusable for substring comparison, binary-searching LCP, and dedup; Rabin-Karp is the specific one-pass search loop.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Rabin-Karp, single pattern — randomised base mod 2^61-1, with the spurious-hit recheck",
      source: `#include <chrono>
#include <cstdio>
#include <random>
#include <string>
#include <vector>
using namespace std;

static const unsigned long long HMOD = (1ULL << 61) - 1;   // Mersenne prime

static unsigned long long addm(unsigned long long a, unsigned long long b) {
    unsigned long long r = a + b;
    return r >= HMOD ? r - HMOD : r;
}
// Fast mod-2^61-1 multiply: fold the high 64 bits back in instead of dividing.
static unsigned long long mulm(unsigned long long a, unsigned long long b) {
    __uint128_t c = (__uint128_t)a * b;
    unsigned long long lo = (unsigned long long)(c & HMOD);
    unsigned long long hi = (unsigned long long)(c >> 61);
    return addm(lo, hi);
}
// Randomised per run => no precomputed anti-hash input can target you.
static unsigned long long pickBase() {
    static mt19937_64 rng(chrono::steady_clock::now().time_since_epoch().count());
    return 256 + rng() % (HMOD - 512);
}

// Returns every start index where pat occurs in text.
// O(n + m) expected, O(n * m) worst case, O(1) extra space.
vector<int> rabinKarp(const string &text, const string &pat) {
    vector<int> hits;
    int n = (int)text.size(), m = (int)pat.size();
    if (m == 0 || m > n) return hits;

    unsigned long long base = pickBase();
    unsigned long long hp = 0, hw = 0, top = 1;      // top ends up as base^(m-1)
    for (int i = 0; i < m; ++i) {
        hp = addm(mulm(hp, base), (unsigned char)pat[i] + 1ULL);
        hw = addm(mulm(hw, base), (unsigned char)text[i] + 1ULL);
        if (i) top = mulm(top, base);
    }

    for (int i = 0;; ++i) {
        // A hash match is only a CANDIDATE — verify the m bytes before reporting.
        if (hw == hp && text.compare(i, m, pat) == 0) hits.push_back(i);
        if (i + m >= n) break;
        hw = addm(hw, HMOD - mulm((unsigned char)text[i] + 1ULL, top)); // drop leftmost char
        hw = addm(mulm(hw, base), (unsigned char)text[i + m] + 1ULL);   // append next char
    }
    return hits;
}

int main() {
    string t = "abracadabra", p = "abra";
    for (int i : rabinKarp(t, p)) printf("%d ", i);   // prints: 0 7
}`,
    },
    {
      language: "cpp",
      caption: "The reason to reach for Rabin-Karp — k patterns of one length in a single pass",
      source: `#include <string>
#include <unordered_map>
#include <utility>
#include <vector>
using namespace std;
// assumes addm / mulm / pickBase / HMOD from the snippet above

// All patterns must share one length m (bucket by length and call once per bucket).
// Returns (text position, pattern id) pairs.
// O(n + k*m) expected, O(n*k*m) worst case, O(k) space for the hash table.
vector<pair<int, int>> rabinKarpMulti(const string &text, const vector<string> &pats) {
    vector<pair<int, int>> hits;
    if (pats.empty()) return hits;
    int m = (int)pats[0].size(), n = (int)text.size();
    for (const string &p : pats) if ((int)p.size() != m) return hits;
    if (m == 0 || m > n) return hits;

    unsigned long long base = pickBase(), top = 1;
    for (int i = 1; i < m; ++i) top = mulm(top, base);

    // Hash the whole SET once; the text is then scanned exactly once.
    unordered_map<unsigned long long, vector<int>> bucket;
    for (int id = 0; id < (int)pats.size(); ++id) {
        unsigned long long h = 0;
        for (char c : pats[id]) h = addm(mulm(h, base), (unsigned char)c + 1ULL);
        bucket[h].push_back(id);
    }

    unsigned long long hw = 0;
    for (int i = 0; i < m; ++i) hw = addm(mulm(hw, base), (unsigned char)text[i] + 1ULL);
    for (int i = 0;; ++i) {
        auto it = bucket.find(hw);
        if (it != bucket.end())
            for (int id : it->second)                    // several patterns may share a hash
                if (text.compare(i, m, pats[id]) == 0) hits.push_back({i, id});
        if (i + m >= n) break;
        hw = addm(hw, HMOD - mulm((unsigned char)text[i] + 1ULL, top));
        hw = addm(mulm(hw, base), (unsigned char)text[i + m] + 1ULL);
    }
    return hits;
}`,
    },
  ],
  cheatSheet: [
    "Time: O(n + m) expected, O(n·m) worst case. Space: O(1) for one pattern, O(k) for k patterns.",
    "Rolling update: `h = (h - out·B^(m-1))·B + in`, all mod a large prime.",
    "Always re-verify on a hash hit — hash equality is a candidate, not a match.",
    "Randomise the base every run; a fixed base/mod is hackable into the O(n·m) path.",
    "Choose it for multi-pattern (same length) and 2D search; choose KMP when you need a hard worst-case bound.",
  ],
  interviewQA: [
    {
      q: "Rabin-Karp is O(n+m) expected but O(n·m) worst case. Where does the worst case come from, and can you engineer it away?",
      a: "Two separate causes. The first is hash collisions: distinct windows hashing equal force a full m-character recheck each time. That one you can engineer away — use a modulus near 2^61 and a base drawn at random at run time, which pushes the expected number of false hits across the whole text below one and, crucially, prevents an adversary from precomputing a colliding input. With a fixed textbook base like 31 mod 1e9+7, anyone can construct a text that collides on nearly every window. The second cause is genuine: if the pattern really occurs at almost every position — text 'aaaa…a', pattern 'aaa' — every window is a true match and verification is unavoidable work. No hashing scheme fixes that, because the output itself is Θ(n) matches. If you need a deterministic O(n+m) bound regardless of input, use KMP or the Z-function instead.",
      followUps: [
        "How would you extend the rolling hash to search a 2D pattern inside a 2D grid?",
        "Why is a Mersenne prime like 2^61-1 convenient as the modulus?",
      ],
    },
    {
      q: "You need to find whether any of 10,000 known 16-byte signatures appears in a 1 GB stream. Which algorithm, and why not KMP?",
      a: "Rabin-Karp on the pattern set. All signatures share one length, so hash all 10,000 into a hash table up front, then make a single pass over the stream maintaining one rolling hash and probing the table per byte — O(n + k·m) expected, one pass, and it works on a stream because the window only ever needs the outgoing and incoming byte. KMP would mean 10,000 independent scans at O(k·n), which is roughly 10^13 byte comparisons here. Aho-Corasick is the other correct answer and gives a deterministic bound, but it builds a trie plus failure links whose memory scales with total pattern length, and it is the one to prefer when the patterns have *different* lengths — Rabin-Karp needs one pass per distinct length. Either way, keep the verification step: on a table hit, compare the 16 real bytes.",
      followUps: [
        "How does the choice change if the signatures have lengths from 4 to 400 bytes?",
        "What memory does Aho-Corasick use versus the Rabin-Karp table here?",
      ],
    },
  ],
  flashcards: [
    {
      front: "Rabin-Karp time and space complexity?",
      back: "O(n + m) expected time, O(n·m) worst case (all windows collide, or the pattern genuinely occurs everywhere). Space O(1) for a single pattern, O(k) for a set of k patterns.",
    },
    {
      front: "What is the spurious-hit recheck and why is it mandatory?",
      back: "When a window's hash equals the pattern's hash, the algorithm still compares the m actual characters. Hash equality only implies a candidate; without the recheck the algorithm reports false positives on any collision.",
    },
    {
      front: "When do you pick Rabin-Karp over KMP?",
      back: "Multiple patterns of the same length in one pass (hash the set into a table), 2D pattern search, and streaming input. Pick KMP when you need a deterministic worst-case O(n+m) on adversarial input.",
    },
    {
      front: "How does the rolling-hash topic differ from this one?",
      back: "Rolling hash is the primitive — polynomial prefix hashes giving O(1) substring hashes, reusable for comparison, LCP binary search, and dedup. Rabin-Karp is the specific search loop built on that primitive.",
    },
  ],
};
