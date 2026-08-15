import type { TopicContent } from "../types";

export const palindromicTree: TopicContent = {
  quickSummary: [
    "The eertree stores every **distinct** palindromic substring as one node — a string of length `n` has at most `n` of them.",
    "Two roots: an imaginary node of length `−1` and the empty node of length `0`; every other node hangs below them.",
    "Built online in **O(n·Σ)** time and space (**O(n)** amortised suffix-link walking), giving distinct and total palindrome counts for free.",
  ],
  detailed: [
    "Each node holds `len` (the palindrome's length), `link` (the longest proper palindromic **suffix** of this palindrome), `cnt` (occurrences), and character transitions. A transition on `c` from node `v` means \"wrap `v` with `c` on both sides\", producing the palindrome `c + v + c` of length `len[v] + 2`.\n\nKey insight: node `−1` exists purely so that the wrapping rule generates single characters uniformly — `len[−1 root] + 2 = 1`. Without it you would need a special case for every odd palindrome of length 1.",
    "## The two roots\n\n- **Node 0**: `len = −1`, the imaginary root. `link[0] = 0`.\n- **Node 1**: `len = 0`, the empty palindrome. `link[1] = 0`.\n\nThe `−1` length makes the suffix-link walk terminate: the test `s[pos − len[v] − 1] == s[pos]` at node 0 reduces to `s[pos] == s[pos]`, which is always true, so the walk can never run off the structure.",
    "## Construction\n\nMaintain `suff` = the node of the longest palindromic suffix of the prefix processed so far. To append `s[pos]`:\n\n1. Walk suffix links from `suff` until `s[pos − len[v] − 1] == s[pos]` — call the result `cur`.\n2. If `cur` already has a `c`-transition, that palindrome is not new: set `suff` to it, bump its count, done.\n3. Otherwise create a node of length `len[cur] + 2`. Its suffix link is node 1 when the new length is `1`; otherwise continue the walk from `link[cur]` and take that node's `c`-transition.\n4. Attach it as `next[cur][c]`, set `suff` to it.\n\nCommon mistake: computing the new node's suffix link *after* pushing it into the vector. Both `cur` and the second walk index into the same container, so a reallocation invalidates the references — compute `len` and `link` into locals, then push. The second most common bug is omitting the `len == 1` special case, which sends the walk into an infinite loop at the `−1` root.",
    "## Counting\n\nThe number of **distinct** palindromic substrings is `nodes − 2` (excluding the two roots). For **total** occurrences, set `cnt = 1` when a node is created or re-visited as `suff`, then after the build push counts down the suffix-link tree by iterating nodes in decreasing index order — node indices increase with creation, and a node's link always has a smaller index, so a plain reverse loop is a valid topological order. The sum of all `cnt` is the number of palindromic substrings counted with multiplicity, all in **O(n)**.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Eertree: two roots, online append, and the suffix-link walk — O(n·Σ) time and space",
      source: `#include <bits/stdc++.h>
using namespace std;

struct Eertree {
    struct Node {
        int len, link;
        long long cnt;
        array<int, 26> next;
    };
    vector<Node> t;
    string s;
    int suff;                    // longest palindromic suffix of the current prefix

    explicit Eertree(int n = 0) {
        t.reserve(n + 3);        // at most n distinct palindromes + 2 roots
        Node imaginary;          // node 0: len -1, makes single chars uniform
        imaginary.len = -1; imaginary.link = 0; imaginary.cnt = 0;
        imaginary.next.fill(-1);
        Node empty;              // node 1: the empty palindrome
        empty.len = 0; empty.link = 0; empty.cnt = 0;
        empty.next.fill(-1);
        t.push_back(imaginary);
        t.push_back(empty);
        suff = 1;
    }

    // Walk suffix links until c + <node> + c is a suffix of s[0..pos].
    // Node 0 (len -1) always satisfies the test, so this terminates.
    int walk(int v, int pos) {
        while (pos - t[v].len - 1 < 0 || s[pos - t[v].len - 1] != s[pos])
            v = t[v].link;
        return v;
    }

    // Returns true if a NEW distinct palindrome was created.
    bool addChar(char ch) {
        s += ch;
        int pos = (int)s.size() - 1, c = ch - 'a';

        int cur = walk(suff, pos);
        if (t[cur].next[c] != -1) {           // palindrome already known
            suff = t[cur].next[c];
            t[suff].cnt++;
            return false;
        }

        // Compute len and link BEFORE push_back (it may reallocate t).
        int newLen = t[cur].len + 2;
        int link = (newLen == 1) ? 1 : t[walk(t[cur].link, pos)].next[c];

        Node nd;
        nd.len = newLen; nd.link = link; nd.cnt = 1;
        nd.next.fill(-1);
        int now = (int)t.size();
        t.push_back(nd);

        t[cur].next[c] = now;
        suff = now;
        return true;
    }

    int distinctPalindromes() const { return (int)t.size() - 2; }
};`,
    },
    {
      language: "cpp",
      caption: "Total palindromic substrings: push counts down the suffix-link tree — O(n)",
      source: `    // Node indices increase with creation and link[v] < v always,
    // so a reverse index loop is a valid topological order.
    long long totalPalindromicSubstrings() {
        for (int v = (int)t.size() - 1; v >= 2; --v)
            t[t[v].link].cnt += t[v].cnt;
        long long total = 0;
        for (size_t v = 2; v < t.size(); ++v) total += t[v].cnt;
        return total;
    }
};

int main() {
    string s;
    cin >> s;
    Eertree e((int)s.size());
    for (char c : s) e.addChar(c);
    cout << e.distinctPalindromes() << " distinct, "
         << e.totalPalindromicSubstrings() << " total\\n";
    // "aabaa"  ->  4 distinct (a, aa, aba, aabaa), 9 total
}`,
    },
  ],
  cheatSheet: [
    "Node count ≤ n + 2 (two roots); a string has at most n distinct palindromic substrings.",
    "Roots: node 0 has `len = −1`, node 1 has `len = 0`; both link to node 0.",
    "Transition on `c` from `v` = the palindrome `c + v + c`, length `len[v] + 2`.",
    "Build: O(n·Σ) time and space; suffix-link walking is O(n) amortised over the whole build.",
    "Distinct = `nodes − 2`. Total = sum of `cnt` after pushing counts down links in reverse index order.",
  ],
  interviewQA: [
    {
      q: "Why does the eertree need a root of length −1?",
      a: "Every transition means 'wrap this palindrome with character c on both sides', producing length len + 2. Single-character palindromes have length 1, so they must come from a parent of length −1. The imaginary root supplies that uniformly, removing what would otherwise be a special case on every append. It also makes the suffix-link walk safe: the loop condition compares s[pos − len[v] − 1] with s[pos], and at len = −1 that is s[pos] == s[pos], always true, so the walk terminates at the imaginary root rather than running off the structure. The one place a special case survives is the new node's suffix link: when the new palindrome has length 1 its link must be set to the empty root directly, because continuing the walk from the imaginary root's link would loop.",
      followUps: ["What is link[node 0] set to, and does it matter?"],
    },
    {
      q: "Why is eertree construction O(n) despite the suffix-link walks inside each append?",
      a: "Use the depth of `suff` in the suffix-link tree as a potential. Each append increases that depth by at most one, because the new longest palindromic suffix extends the previous structure by a bounded amount. Every iteration of a suffix-link walk strictly decreases the depth, so across the whole build the total number of walk steps is bounded by the total depth increase, which is at most n. That gives O(n) amortised link traversal; with array-based transitions the per-node character array makes the overall build O(n·Σ) in time and space, or O(n log Σ) time with a map per node when the alphabet is large.",
      followUps: ["How does this argument compare to the amortised analysis of KMP's failure function?"],
    },
  ],
  flashcards: [
    { front: "What are the eertree's two roots?", back: "Node 0 with len = −1 (imaginary, enables single-character palindromes) and node 1 with len = 0 (empty palindrome). Both link to node 0." },
    { front: "What does an eertree edge labelled c mean?", back: "Wrap the parent palindrome with c on both sides: the child is `c + parent + c`, of length len[parent] + 2." },
    { front: "How many distinct palindromic substrings does the eertree report?", back: "nodes − 2 (excluding both roots). A string of length n has at most n distinct palindromic substrings; the build is O(n·Σ)." },
  ],
};
