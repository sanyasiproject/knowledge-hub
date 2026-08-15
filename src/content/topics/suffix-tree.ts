import type { TopicContent } from "../types";

export const suffixTree: TopicContent = {
  quickSummary: [
    "A **compressed trie of every suffix** of `s$`: each edge carries a substring (stored as two indices, not a copy), every internal node has ≥ 2 children, and every suffix ends at exactly one leaf. n leaves, < n internal nodes, so O(n) nodes.",
    "Buys O(m) pattern matching independent of n, longest repeated substring in O(n) (deepest branching node), and longest common substring of two strings via a **generalized** suffix tree.",
    "Ukkonen builds it in O(n) time and O(n·σ) space. In real code a suffix **automaton** or suffix **array** is usually the better choice — same power, far less to get wrong.",
  ],
  detailed: [
    "Start from the naive object and compress it. Insert all n+1 suffixes of `s` into a trie and you get every substring as a root-to-somewhere path, but O(n²) nodes. Collapse every non-branching chain into a single edge labelled by the substring it spelled, and store that label as the index pair `[start, end)` into `s` rather than as text. Now branching nodes are the only nodes, there are fewer than n of them, and the whole structure is O(n) words.\n\nAppending a terminator `$` that occurs nowhere else is not cosmetic: without it a suffix that is a prefix of another suffix (`s = \"aa\"`) ends in the middle of an edge and has no leaf, which breaks every leaf-based query.",
    "Three queries justify the whole structure.\n\n- **Substring / count occurrences**: walk down from the root spelling the pattern — O(m), *independent of n*. The number of leaves under the arrival point is the occurrence count; their suffix indices are the positions.\n- **Longest repeated substring**: the deepest internal node by string depth. An internal node exists precisely because two different suffixes diverge there, so its path label occurs at least twice. One O(n) DFS.\n- **Longest common substring of A and B**: build a *generalized* suffix tree over `A#B$` and find the deepest internal node whose subtree contains leaves from both strings. O(|A| + |B|).\n\nAlso: matching statistics, longest palindromic substring, and all maximal repeats fall out of the same tree.",
    "Ukkonen's O(n) construction, conceptually. It builds the tree online, extending by one character at a time, and gets to linear via three ideas. (1) **Implicit trees**: it maintains the tree of `s[0..i]` without the terminator, so suffixes may end mid-edge; adding `$` at the very end converts the implicit tree into the real one. (2) **Three extension rules** when appending character `c` to suffix path `p`: *rule 1*, `p` ends at a leaf — just extend the leaf's edge, which the \"open leaf\" trick (`end = ∞`, a shared variable) makes free forever after; *rule 2*, `p` ends where no `c` continues — create a new leaf, splitting the edge first if `p` ends mid-edge; *rule 3*, `c` already continues `p` — do nothing and **stop the whole phase**, because every shorter suffix is also already present. (3) **Suffix links**: a pointer from the node spelling `xα` to the node spelling `α`, so after handling one suffix the algorithm hops to the next in O(1) instead of re-descending from the root. Rules 1 and 3 are free, rule 2 fires at most once per node created, and the active point moves monotonically — hence O(n) total.\n\nIn practice: do not write Ukkonen from memory in an interview or a deadline. The active-point bookkeeping (active node, active edge, active length, `remainder`) is where correct-looking implementations quietly break. Build the naive compressed tree if n is small, and reach for a suffix automaton or suffix array otherwise.",
    "Pick the structure, not the tradition.\n\n| Structure | Build | Space | Match | Reality |\n| --- | --- | --- | --- | --- |\n| Suffix tree (naive compressed) | O(n²) | O(n) nodes | O(m) | easy to write and verify; fine to n ≈ 10^4 |\n| Suffix tree (Ukkonen) | O(n) | O(n·σ) | O(m) | linear but genuinely fiddly |\n| Suffix automaton | O(n) | O(n·σ) | O(m) | ~30 lines, does nearly everything a suffix tree does |\n| Suffix array + LCP | O(n log n) | O(n) ints | O(m log n) | smallest memory, most cache-friendly, easiest to debug |\n\nThe suffix automaton of `s` is the suffix *link tree* of the suffix tree of the reversed string — that duality is why the automaton substitutes for the tree in almost every problem. Choose the suffix array when memory or constant factors dominate, the automaton when you want tree-like power with a fraction of the code, and the actual suffix tree mainly when the problem statement is phrased in terms of it.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Naive compressed suffix tree — O(n²) build, O(m) matching, O(n) longest repeated substring",
      source: `#include <cstdio>
#include <map>
#include <string>
#include <vector>
using namespace std;

// Compressed trie of every suffix, built by inserting suffixes one at a time.
// Build: O(n^2) time, O(n) nodes. Ukkonen builds the SAME tree in O(n).
// Queries are already optimal: contains() is O(m), longestRepeated() is O(n).
struct SuffixTree {
    struct Node {
        int start, end;          // edge label = s[start, end)  -- indices, never copies
        int suffixIndex = -1;    // set on leaves
        map<char, int> next;
    };
    string s;                    // input plus a unique terminator
    vector<Node> t;

    explicit SuffixTree(const string &input) : s(input + "\\x01") {
        t.push_back({0, 0, -1, {}});                   // root carries an empty edge
        for (int i = 0; i < (int)s.size(); ++i) addSuffix(i);
    }

    int newNode(int a, int b) { t.push_back({a, b, -1, {}}); return (int)t.size() - 1; }

    void addSuffix(int i) {
        int n = (int)s.size(), v = 0, pos = i;
        while (pos < n) {
            char c = s[pos];
            auto it = t[v].next.find(c);
            if (it == t[v].next.end()) {               // no edge starts with c: hang a leaf
                int leaf = newNode(pos, n);
                t[leaf].suffixIndex = i;
                t[v].next[c] = leaf;
                return;
            }
            int u = it->second, len = t[u].end - t[u].start, k = 0;
            while (k < len && s[t[u].start + k] == s[pos + k]) ++k;
            if (k == len) { v = u; pos += k; continue; }        // consumed the edge, descend
            int mid = newNode(t[u].start, t[u].start + k);      // split the edge at offset k
            t[v].next[c] = mid;
            t[u].start += k;
            t[mid].next[s[t[u].start]] = u;
            int leaf = newNode(pos + k, n);
            t[leaf].suffixIndex = i;
            t[mid].next[s[pos + k]] = leaf;
            return;
        }
    }

    // Is pat a substring? O(m) -- the text length never enters the cost.
    bool contains(const string &pat) const {
        int v = 0, i = 0, m = (int)pat.size();
        while (i < m) {
            auto it = t[v].next.find(pat[i]);
            if (it == t[v].next.end()) return false;
            int u = it->second, len = t[u].end - t[u].start, k = 0;
            while (k < len && i + k < m && s[t[u].start + k] == pat[i + k]) ++k;
            if (i + k == m) return true;               // pattern exhausted, possibly mid-edge
            if (k < len) return false;                 // diverged inside the edge
            v = u; i += k;
        }
        return true;
    }

    // Longest repeated substring = deepest node with >= 2 children. O(n).
    string longestRepeated() const {
        int bestLen = 0, bestEnd = 0;
        dfs(0, 0, bestLen, bestEnd);
        return s.substr(bestEnd - bestLen, bestLen);
    }
    void dfs(int v, int depth, int &bestLen, int &bestEnd) const {
        if (v != 0 && t[v].next.size() >= 2 && depth > bestLen) {
            bestLen = depth; bestEnd = t[v].end;       // node is branching => path repeats
        }
        for (const auto &e : t[v].next) {
            int u = e.second;
            dfs(u, depth + (t[u].end - t[u].start), bestLen, bestEnd);
        }
    }
};

int main() {
    SuffixTree st("banana");
    printf("%d %d %d\\n", st.contains("ana"), st.contains("banana"), st.contains("nb")); // 1 1 0
    printf("%s\\n", st.longestRepeated().c_str());                                        // ana
}`,
    },
  ],
  cheatSheet: [
    "O(n) nodes: n+1 leaves, < n internal nodes. Edges store index pairs, never substrings.",
    "Always append a terminator that occurs nowhere else, or suffixes that are prefixes lose their leaf.",
    "Match O(m) regardless of n; occurrence count = leaves in the subtree; LRS = deepest branching node.",
    "Ukkonen: implicit trees + suffix links + 3 extension rules → O(n) time, O(n·σ) space.",
    "Default to suffix automaton (O(n), ~30 lines) or suffix array + LCP (O(n log n), least memory) instead.",
  ],
  interviewQA: [
    {
      q: "Why is a suffix tree only O(n) space when it represents all O(n²) substrings?",
      a: "Because the tree stores structure, not text. Two compressions do it. First, path compression: a node is kept only where two suffixes diverge. There are n+1 leaves (one per suffix of s$) and every internal node is branching with at least two children, so a binary-tree counting argument caps internal nodes at n — under 2n+1 nodes total. Second, edge labels are stored as an index pair [start, end) into the original string rather than as a copied substring, so an edge spelling 10,000 characters still costs two integers. Every one of the O(n²) substrings is still represented: it is exactly some root-directed path ending on a node or partway along an edge, and reading it costs time proportional to its own length, which is unavoidable. The real space caveat is the child map, not the node count — with a σ-sized array per node it is O(n·σ), which is why implementations use hash maps or ordered maps when the alphabet is large, trading a constant factor of time for space.",
      followUps: [
        "Show the counting argument that a tree with n+1 leaves and no unary internal nodes has at most n internal nodes.",
        "How does the child-storage choice (array vs map vs hash) change the O(m) match bound?",
      ],
    },
    {
      q: "You need longest common substring of two 200,000-character strings. Suffix tree, automaton, or array?",
      a: "All three solve it; I would write a suffix automaton, and a suffix array if memory were tight. With a generalized suffix tree you build over A#B$ with two distinct separators, then DFS for the deepest internal node whose subtree contains leaves from both A and B — O(|A|+|B|) and conceptually the cleanest statement of the problem, but Ukkonen is the most error-prone code of the three. With a suffix automaton, build it on A and then stream B through it, tracking the current match length and resetting via suffix links on failure; the running maximum is the answer, in O(|A|+|B|) and about thirty lines. With a suffix array over A#B plus an LCP array, scan adjacent pairs and take the largest LCP between suffixes originating in different strings — O(n log n) build, the smallest memory footprint, and the easiest to debug because every intermediate array can be printed. At 400,000 characters all three are fast; the decision is entirely about implementation risk, and that argues against the suffix tree.",
      followUps: [
        "Why must the two separators be distinct characters, and what breaks if you reuse one?",
        "How would you extend the suffix-array approach to k strings (longest common substring of k inputs)?",
      ],
    },
  ],
  flashcards: [
    {
      front: "Suffix tree: node count, space, and match complexity?",
      back: "n+1 leaves and fewer than n internal nodes, so O(n) nodes; O(n·σ) space with array children, O(n) with maps. Pattern matching is O(m), independent of n.",
    },
    {
      front: "What are Ukkonen's three ingredients for O(n) construction?",
      back: "Implicit trees (build online without the terminator, finalize at the end), suffix links (jump from the node spelling xα to the one spelling α in O(1)), and three extension rules — extend a leaf (free via end = ∞), split and add a leaf, or stop the phase early because the character is already present.",
    },
    {
      front: "Three classic suffix-tree queries and their costs?",
      back: "Substring test / occurrence count: O(m) walk plus subtree leaves. Longest repeated substring: deepest branching node, O(n) DFS. Longest common substring of A and B: generalized tree over A#B$, deepest node with leaves from both, O(|A|+|B|).",
    },
    {
      front: "Why is a suffix automaton or suffix array usually preferred?",
      back: "Same query power with far less implementation risk — the automaton is O(n) in about 30 lines, the suffix array is O(n log n) with the smallest memory and trivially debuggable arrays. Ukkonen's active-point bookkeeping is the classic source of subtle bugs.",
    },
  ],
};
