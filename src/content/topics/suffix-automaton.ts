import type { TopicContent } from "../types";

export const suffixAutomaton: TopicContent = {
  quickSummary: [
    "The minimal DFA accepting exactly the suffixes of a string; every path from the root spells a distinct substring.",
    "Built **online**, one character at a time, in **O(n·Σ)** time and **O(n·Σ)** space (**O(n)** states — at most `2n − 1` — and at most `3n − 4` transitions).",
    "Answers distinct-substring counts, occurrence counts, and longest common substring directly from `len` and `link`.",
  ],
  detailed: [
    "Each state groups all substrings that occur at exactly the same set of end positions (one *endpos* equivalence class). A state stores `len` — the length of the longest string in its class — and `link`, the suffix link to the state holding the longest proper suffix in a *different* class. The strings in a state are a contiguous range of suffix lengths: `len[link[v]] + 1 .. len[v]`.\n\nKey insight: `len` and `link` are the whole data structure. Almost every application is a one-line formula over those two arrays plus a traversal of the suffix-link tree.",
    "## Online construction and the clone\n\n`extend(c)` creates a new state `cur` with `len[cur] = len[last] + 1`, then walks suffix links from `last` adding `c`-transitions to `cur`. Three cases:\n\n1. The walk falls off the end (`p == -1`) ⇒ `link[cur] = root`.\n2. It stops at `p` with `q = next[p][c]` and `len[p] + 1 == len[q]` ⇒ `link[cur] = q`.\n3. Otherwise `q` is *too long* for this context. Split it: **clone** `q` into a new state with the same transitions and same `link` but `len[clone] = len[p] + 1`; set `link[q] = link[cur] = clone`; then redirect every `c`-transition still pointing at `q` along the link chain to `clone`.\n\nCommon mistake: writing `st.push_back(st[q])` — the reference into the vector can dangle if the push reallocates. Copy `st[q]` into a local first. The other classic bug is giving the clone `cnt = 1`; clones represent no new occurrence and must start at `0`.",
    "## What it buys you\n\n| Query | Formula | Cost |\n|---|---|---|\n| distinct substrings | `Σ_v (len[v] − len[link[v]])` | O(n) |\n| occurrence count of `p` | walk `p`, read `cnt` at the landing state | O(&#124;p&#124;) |\n| longest common substring of `s`, `t` | build on `s`, stream `t` tracking current length | O(&#124;t&#124;) |\n| number of occurrences per state | `cnt[v] = 1` at creation (0 for clones), then propagate up the link tree | O(n) |\n\nPropagation must go in decreasing `len` order — a counting sort over `len` gives that ordering in O(n).",
  ],
  code: [
    {
      language: "cpp",
      caption: "Suffix automaton: online construction with the clone split — O(n·Σ) time and space",
      source: `#include <bits/stdc++.h>
using namespace std;

struct SuffixAutomaton {
    struct State {
        int len = 0, link = -1;
        long long cnt = 0;
        array<int, 26> next{};
    };
    vector<State> st;
    int last = 0;

    explicit SuffixAutomaton(int n = 0) {
        st.reserve(2 * n + 5);              // at most 2n - 1 states
        State root;
        root.len = 0;
        root.link = -1;
        root.next.fill(-1);
        st.push_back(root);
    }

    void extend(char ch) {
        int c = ch - 'a';
        State node;
        node.len = st[last].len + 1;
        node.link = -1;
        node.cnt = 1;                       // a real end position
        node.next.fill(-1);
        int cur = (int)st.size();
        st.push_back(node);

        int p = last;
        while (p != -1 && st[p].next[c] == -1) {
            st[p].next[c] = cur;
            p = st[p].link;
        }

        if (p == -1) {
            st[cur].link = 0;
        } else {
            int q = st[p].next[c];
            if (st[p].len + 1 == st[q].len) {
                st[cur].link = q;
            } else {
                // Split q. Copy FIRST: push_back may reallocate st.
                State cl = st[q];
                cl.len = st[p].len + 1;
                cl.cnt = 0;                 // a clone is not a new occurrence
                int clone = (int)st.size();
                st.push_back(cl);

                st[q].link = clone;
                st[cur].link = clone;
                while (p != -1 && st[p].next[c] == q) {
                    st[p].next[c] = clone;
                    p = st[p].link;
                }
            }
        }
        last = cur;
    }

    // Number of distinct non-empty substrings. O(n).
    long long distinctSubstrings() const {
        long long total = 0;
        for (size_t v = 1; v < st.size(); ++v)
            total += st[v].len - st[st[v].link].len;
        return total;
    }
};`,
    },
    {
      language: "cpp",
      caption: "Occurrence counts: propagate up the suffix-link tree in decreasing len — O(n)",
      source: `    // Call once after all extend() calls.
    void buildCounts() {
        int n = (int)st.size(), maxLen = 0;
        for (const State& s : st) maxLen = max(maxLen, s.len);

        // counting sort of states by len
        vector<int> bucket(maxLen + 2, 0), order(n);
        for (const State& s : st) bucket[s.len]++;
        for (int i = 1; i <= maxLen; ++i) bucket[i] += bucket[i - 1];
        for (int v = n - 1; v >= 0; --v) order[--bucket[st[v].len]] = v;

        // longest first: a state's count flows into its suffix link
        for (int i = n - 1; i >= 1; --i) {
            int v = order[i];
            st[st[v].link].cnt += st[v].cnt;
        }
    }

    // How many times does p occur in the original string? O(|p|).
    long long countOccurrences(const string& p) const {
        int v = 0;
        for (char ch : p) {
            int c = ch - 'a';
            if (st[v].next[c] == -1) return 0;
            v = st[v].next[c];
        }
        return st[v].cnt;
    }`,
    },
  ],
  cheatSheet: [
    "States ≤ 2n − 1, transitions ≤ 3n − 4; build is O(n·Σ) time, O(n·Σ) space with array transitions.",
    "Each state covers substring lengths `len[link[v]] + 1 .. len[v]`.",
    "Distinct substrings = `Σ (len[v] − len[link[v]])`, O(n).",
    "Occurrences: `cnt = 1` on creation, `cnt = 0` on clones, propagate in decreasing `len`.",
    "LCS of two strings: build on one, stream the other keeping a running match length; O(|t|).",
  ],
  interviewQA: [
    {
      q: "When does suffix automaton construction clone a state, and what exactly does the clone represent?",
      a: "A clone happens in the third case of extend: we walk suffix links from `last`, stop at a state `p` that already has a c-transition to `q`, and find that `len[p] + 1 != len[q]`. That inequality means `q`'s endpos class contains strings longer than the one we actually arrived at, so `q` mixes two different endpos classes once the new character is added. We create `clone` with the same outgoing transitions and same suffix link as `q` but with `len[clone] = len[p] + 1`, representing the shorter half of the split class. Then `link[q]` and `link[cur]` both point at `clone`, and every c-transition along the remaining link chain that pointed at `q` is redirected to `clone`. The clone contributes no new end position, so its occurrence counter starts at zero.",
      followUps: ["Why is the total state count bounded by 2n − 1?", "What happens if you forget to redirect the transitions?"],
    },
    {
      q: "How do you count distinct substrings and occurrences of a pattern with a suffix automaton?",
      a: "Distinct substrings: each state v represents exactly `len[v] − len[link[v]]` distinct strings (the contiguous length range it owns), so the answer is the sum of that over all non-root states — one O(n) pass, no traversal needed. Occurrences of a pattern p: walk p's characters through the transitions from the root; if any transition is missing the answer is zero, otherwise the landing state's `cnt` is the occurrence count, costing O(|p|). `cnt` is precomputed by setting 1 on each state created by extend, 0 on clones, then adding each state's count into its suffix link in decreasing order of `len` — a counting sort by `len` gives that order in O(n).",
      followUps: ["How would you also report the first occurrence position?"],
    },
  ],
  flashcards: [
    { front: "What does a suffix automaton state represent?", back: "One endpos equivalence class — all substrings sharing the same set of end positions. It owns lengths `len[link[v]]+1 .. len[v]`." },
    { front: "Suffix automaton size bounds and build cost?", back: "At most 2n − 1 states and 3n − 4 transitions; O(n·Σ) time and space, built online one character at a time." },
    { front: "Distinct substring count formula?", back: "`Σ over non-root states (len[v] − len[link[v]])`, computed in O(n)." },
  ],
};
