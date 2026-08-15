import type { TopicContent } from "../types";

export const minimumRotation: TopicContent = {
  quickSummary: [
    "Find the starting index whose rotation of `s` is **lexicographically smallest**, without materialising all n rotations.",
    "Booth's / Duval-style trick: keep two candidate starts `i` and `j`, compare them character by character, and the loser plus every start it skipped past is eliminated in one jump.",
    "O(n) time, O(n) space for the doubled string (O(1) extra if you index modulo n) — versus O(n² log n) for generate-and-sort.",
  ],
  detailed: [
    "The naive approach builds all n rotations and sorts them: O(n²) just to write them down. The linear algorithm instead maintains two live candidates, `i` and `j`, and compares the rotations starting there. Because both candidates are substrings of the same doubled string, comparing them costs only until the first mismatch at offset `k` — and that mismatch tells you far more than which of the two wins.\n\nKey insight: if rotation `i` loses at offset `k`, then every start in `i..i+k` also loses, because each of them shares that same losing prefix positioned against a strictly better one. So the loser jumps forward by `k + 1` instead of by 1, and total pointer movement stays linear.",
    "## When do I reach for this\n\nReach for it when a problem asks for the **canonical form of a cyclic string** — the smallest (or largest) rotation. That shows up as: deciding whether two strings are rotations of each other with a canonical representative, hashing necklaces or circular DNA sequences so equivalent rotations collide, or de-duplicating cyclic patterns. If you only need \"is B a rotation of A\", the far simpler test is `B.size() == A.size() && (A + A).find(B) != npos`; minimum rotation is for when you need one representative per equivalence class.",
    "## The algorithm\n\nWork on `t = s + s` so a rotation starting at `p` is just `t[p .. p + n - 1]`.\n\n1. Start `i = 0`, `j = 1`.\n2. Scan `k` forward while `t[i+k] == t[j+k]`. If `k` reaches `n`, the string is periodic and the two candidates are equal — stop.\n3. Advance the loser: if `t[i+k] > t[j+k]` set `i += k + 1`, else `j += k + 1`.\n4. Keep `i != j` by bumping the one you just moved past the other.\n5. Repeat while both are `< n`; the answer is `min(i, j)`.\n\nCommon mistake: forgetting step 4. If the two pointers collide they compare a rotation against itself, `k` runs to `n`, and the loop exits with a wrong index.",
    "## Cost\n\n**Time O(n)**: each comparison round either terminates or pushes `i + j` forward by at least `k + 1`, and the sum `i + j` is bounded by `2n`. **Space O(n)** for `t`; drop it to O(1) by reading `s[(p + k) % n]` at the cost of a modulo per access. The largest rotation is the same code with the comparison flipped.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Least rotation index in O(n) — two candidate starts, jump past eliminated ones",
      source: `// Returns the start index of the lexicographically smallest rotation of s.
int leastRotationIndex(const string& s) {
    int n = (int)s.size();
    if (n == 0) return 0;
    string t = s + s;                 // rotation p == t[p .. p+n-1]
    int i = 0, j = 1;
    while (i < n && j < n) {
        int k = 0;
        while (k < n && t[i + k] == t[j + k]) ++k;
        if (k >= n) break;            // periodic: both candidates equal
        if (t[i + k] > t[j + k]) {
            i += k + 1;               // i and everything it skipped lose
            if (i <= j) i = j + 1;    // never let the pointers collide
        } else {
            j += k + 1;
            if (j <= i) j = i + 1;
        }
    }
    return min(i, j);
}

string leastRotation(const string& s) {
    if (s.empty()) return s;
    int p = leastRotationIndex(s);
    return s.substr(p) + s.substr(0, p);
}
// Time O(n) — i + j only increases and is bounded by 2n. Space O(n) for t.`,
    },
    {
      language: "cpp",
      caption: "O(1)-space variant, plus the much simpler \"is it a rotation\" test",
      source: `// Same algorithm without building s + s: index modulo n.
int leastRotationIndexInPlace(const string& s) {
    int n = (int)s.size();
    if (n == 0) return 0;
    int i = 0, j = 1;
    while (i < n && j < n) {
        int k = 0;
        while (k < n && s[(i + k) % n] == s[(j + k) % n]) ++k;
        if (k >= n) break;
        if (s[(i + k) % n] > s[(j + k) % n]) { i += k + 1; if (i <= j) i = j + 1; }
        else                                 { j += k + 1; if (j <= i) j = i + 1; }
    }
    return min(i, j);
}

// Different question, much easier answer: is b some rotation of a?
bool isRotation(const string& a, const string& b) {
    return a.size() == b.size() && (a + a).find(b) != string::npos;
}
// leastRotationIndexInPlace: O(n) time, O(1) space.
// isRotation: O(n) with a linear substring search (KMP/Z), O(n) space for a + a.`,
    },
  ],
  cheatSheet: [
    "Goal: canonical form of a cyclic string = its lexicographically smallest rotation.",
    "Two candidates `i`, `j`; compare from offset `k`; loser jumps `k + 1` forward, never let `i == j`.",
    "`k == n` means the string is periodic — break and return `min(i, j)`.",
    "O(n) time, O(n) space with `s + s`, O(1) space with `% n` indexing.",
    "\"Is B a rotation of A?\" is a different, easier problem: search B inside A + A.",
  ],
  interviewQA: [
    {
      q: "Why is the loser allowed to jump forward by k + 1 instead of just 1? Prove you are not skipping the real answer.",
      a: "Say the candidates are `i` and `j`, they agree for `k` characters, and `t[i+k] > t[j+k]` so `i` loses. Take any start `i + d` with `0 <= d <= k`. Compare it against `j + d`, which is also a valid start since both are still inside the doubled string. The two agree on characters `d..k-1` of the shared prefix and then differ at relative offset `k - d`, where `i + k` holds the strictly larger character. So the rotation at `i + d` is strictly worse than the one at `j + d`, and therefore cannot be the minimum. That eliminates all of `i..i+k` at once, which is exactly the jump to `i + k + 1`. The complexity follows immediately: every round advances `i + j` by at least `k + 1` while doing O(k + 1) work, and `i + j` is capped at `2n`, so total time is O(n).",
      followUps: [
        "What changes if you want the lexicographically largest rotation instead?",
        "How does this relate to Duval's algorithm and Lyndon factorisation?",
      ],
    },
    {
      q: "What happens on a periodic input like \"abab\" or \"aaaa\", and why is the k >= n check needed?",
      a: "For a periodic string several starts produce identical rotations, so at some point the two candidates are comparing two equal rotations and the inner scan never finds a mismatch — `k` runs all the way to `n`. Without the `k >= n` break the loop would index past a safe range or spin, and with no mismatch there is no rule for which pointer to advance. Breaking there is correct because equal rotations means either candidate is a valid answer, and `min(i, j)` returns the earliest start, which is the conventional answer. For \"aaaa\" the very first comparison hits this immediately and returns 0; for \"abab\" the candidates converge to two starts producing the same string and it returns the smaller index. The result is still O(n) since that scan runs once and then stops.",
      followUps: [
        "How would you also report the period of the string from this run?",
        "Does the smallest rotation ever need to be unique for the algorithm to be correct?",
      ],
    },
    {
      q: "Interviewer says: just generate all rotations and take the min. What is wrong with that, and when is it actually fine?",
      a: "Generating all n rotations materialises n strings of length n, so it is O(n²) time and O(n²) space just to build them, and taking the running minimum adds another O(n) per comparison, ending at O(n²) time even without an explicit sort — sorting them all pushes it to O(n² log n). The linear algorithm avoids ever writing a rotation down. That said, the naive version is completely fine when n is small (a few hundred characters) or when the call happens once, and it is far easier to get right under time pressure. The right interview move is to state the naive bound, write the O(n) version, and note the O(1)-space variant with modular indexing if memory matters. I would also point out that the related question \"is B a rotation of A\" does not need this machinery at all — substring search in A + A answers it in linear time.",
      followUps: [
        "How would you canonicalise a circular sequence of integers rather than characters?",
        "Can you use this to hash necklaces so that all rotations collide?",
      ],
    },
  ],
  flashcards: [
    {
      front: "Minimum rotation — the core jump rule",
      back: "Candidates `i`, `j` agree for `k` chars then differ; the larger side loses and jumps to `loser + k + 1` (all skipped starts are provably worse). Keep `i != j`.",
    },
    {
      front: "Minimum rotation complexity",
      back: "O(n) time — `i + j` only increases and is bounded by 2n. O(n) space with `s + s`, or O(1) using `% n` indexing.",
    },
    {
      front: "Smallest rotation vs \"is B a rotation of A\"",
      back: "Smallest rotation = canonical form, needs the two-pointer O(n) algorithm. Rotation test = `(A + A).find(B) != npos`, no algorithm needed.",
    },
  ],
};
