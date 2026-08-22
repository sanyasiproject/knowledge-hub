import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Suffix Tree Application 1 - Substring Check",
      difficulty: "Easy",
      variation: "Build the tree, then O(m) substring queries",
      link: "https://www.geeksforgeeks.org/suffix-tree-application-1-substring-check/",
      question: [
        "Given a text of length n, preprocess it once so that you can answer 'is pat a substring of text?' for any pattern in time proportional to the length of the pattern only, independent of n. Build the suffix tree of the text with Ukkonen's algorithm and answer the query by spelling the pattern out from the root.",
        "The suffix tree is the compressed trie of all suffixes of the text: every edge carries a whole block of characters, stored as an offset and a length into the text rather than as a copy, so the whole structure fits in O(n) nodes.",
        "Example 1:\nInput: text = 'THIS IS A TEST TEXT', pat = 'TEST'\nOutput: true\nExplanation: 'TEST' spells out a path from the root, so it is a prefix of the suffix starting at index 10.",
        "Example 2:\nInput: text = 'THIS IS A TEST TEXT', pat = 'TESTING'\nOutput: false\nExplanation: The walk matches 'TEST' and then needs a 'I', but the only continuation after 'TEST' in the text is ' ', so the walk dies.",
        "Constraints:\n- 1 <= text.length <= 10^5\n- 1 <= pat.length <= 10^5\n- The text does not contain the character '$', which is used as the terminator",
      ],
      code: `struct SuffixTree {
    static const int INF = 1e9;
    string s;                            // text built so far, terminator included
    vector<map<char,int>> to;            // children, keyed by the first char of the edge
    vector<int> len, fpos, link;         // edge length, edge start in s, suffix link
    int node = 0, pos = 0;               // active point: node plus offset down its edge

    SuffixTree() { newNode(0, INF); }    // node 0 is the root; len[0] = INF stops goEdge
    int newNode(int p, int l) {
        to.push_back({}); fpos.push_back(p); len.push_back(l); link.push_back(0);
        return (int)to.size() - 1;
    }
    int child(int v, char c) const {     // 0 means "absent": the root is never a child
        auto it = to[v].find(c);
        return it == to[v].end() ? 0 : it->second;
    }
    void goEdge() {                      // walk down while the active length overshoots
        while (pos > len[child(node, s[s.size() - pos])]) {
            node = child(node, s[s.size() - pos]);
            pos -= len[node];
        }
    }
    void addChar(char c) {
        s.push_back(c);
        pos++;
        int last = 0;
        while (pos > 0) {
            goEdge();
            int n = (int)s.size();
            char e = s[n - pos];
            int v = child(node, e);
            if (v == 0) {                              // no such edge: hang an open leaf
                to[node][e] = newNode(n - pos, INF);
                link[last] = node; last = 0;
            } else {
                char t = s[fpos[v] + pos - 1];         // next char along the active edge
                if (t == c) { link[last] = node; return; }   // already implicit, stop
                int u = newNode(fpos[v], pos - 1);     // split the edge at the mismatch
                to[u][c] = newNode(n - 1, INF);
                to[u][t] = v;
                fpos[v] += pos - 1;
                len[v] -= pos - 1;
                to[node][e] = u;
                link[last] = u; last = u;
            }
            if (node == 0) pos--; else node = link[node];   // follow the suffix link
        }
    }
    void build(const string& t) { for (char c : t) addChar(c); }
    int edgeLen(int v) const { return min(len[v], (int)s.size() - fpos[v]); }
};

bool isSubstring(const string& text, const string& pat) {
    SuffixTree st;
    st.build(text + "$");                     // "$" must not occur in text
    int v = 0, i = 0;
    while (i < (int)pat.size()) {
        v = st.child(v, pat[i]);
        if (v == 0) return false;             // no edge starts with this char
        int L = st.edgeLen(v);
        for (int k = 0; k < L && i < (int)pat.size(); k++, i++)
            if (st.s[st.fpos[v] + k] != pat[i]) return false;   // mismatch inside the edge
    }
    return true;
}`,
      explanation: [
        "Every substring of the text is a prefix of some suffix of the text. The suffix tree holds all n+1 suffixes as root-to-leaf paths, so a substring query is just a walk down from the root, spelling the pattern one edge-block at a time. That is why the query never looks at n.",
        "The compression is what makes the structure O(n) rather than O(n^2): an edge stores fpos (where its label starts in the text) and len, not the characters themselves. Because of that, matching inside an edge is a direct comparison against text positions, and edgeLen clamps an open leaf edge (len = INF) to the current end of the text.",
        "Appending a unique terminator '$' matters even here: without it the tree is only implicit, a suffix that is a prefix of another suffix ends in the middle of an edge and has no leaf of its own. Every leaf-based argument in the harder variations depends on that terminator.",
        "The trap in this particular implementation is map lookup. Using to[v][c] to test for a child silently inserts an empty entry, which converts leaves into internal nodes and quietly corrupts every later leaf count; the child() helper does a find() and returns 0 for 'absent', which is safe because the root can never be somebody's child.",
        "Ukkonen builds the tree online in one left-to-right pass. The active point (node, pos) tracks the longest suffix already present, suffix links let you jump from one insertion point to the next in O(1), and the total number of active-point descents is amortised linear.",
        "Time: O(n log a) to build and O(m log a) per query, for alphabet size a. Space: O(n).",
      ],
    },
    {
      name: "Finding Patterns",
      difficulty: "Easy",
      variation: "One tree, many substring queries",
      link: "https://cses.fi/problemset/task/2102",
      question: [
        "You are given a string s and k patterns. For each pattern, report whether it appears in s as a substring. Print YES or NO on its own line for each pattern, in the order given.",
        "Example 1:\nInput:\naybabtu\n3\nbab\nabc\ntu\nOutput:\nYES\nNO\nYES\nExplanation: 'bab' occurs at index 2 (0-based), 'tu' occurs at index 5, and 'abc' never occurs because no 'c' appears in s at all.",
        "Example 2:\nInput:\naaaa\n2\naaaaa\naa\nOutput:\nNO\nYES\nExplanation: The longest run of 'a' in s has length 4, so a pattern of five is impossible; 'aa' occurs three times.",
        "Constraints:\n- 1 <= |s| <= 10^5\n- 1 <= k <= 10^5\n- The total length of all patterns is at most 10^5\n- All characters are lowercase English letters",
      ],
      code: `struct SuffixTree {
    static const int INF = 1e9;
    string s;                            // text built so far, terminator included
    vector<map<char,int>> to;            // children, keyed by the first char of the edge
    vector<int> len, fpos, link;         // edge length, edge start in s, suffix link
    int node = 0, pos = 0;               // active point: node plus offset down its edge

    SuffixTree() { newNode(0, INF); }    // node 0 is the root; len[0] = INF stops goEdge
    int newNode(int p, int l) {
        to.push_back({}); fpos.push_back(p); len.push_back(l); link.push_back(0);
        return (int)to.size() - 1;
    }
    int child(int v, char c) const {     // 0 means "absent": the root is never a child
        auto it = to[v].find(c);
        return it == to[v].end() ? 0 : it->second;
    }
    void goEdge() {                      // walk down while the active length overshoots
        while (pos > len[child(node, s[s.size() - pos])]) {
            node = child(node, s[s.size() - pos]);
            pos -= len[node];
        }
    }
    void addChar(char c) {
        s.push_back(c);
        pos++;
        int last = 0;
        while (pos > 0) {
            goEdge();
            int n = (int)s.size();
            char e = s[n - pos];
            int v = child(node, e);
            if (v == 0) {                              // no such edge: hang an open leaf
                to[node][e] = newNode(n - pos, INF);
                link[last] = node; last = 0;
            } else {
                char t = s[fpos[v] + pos - 1];         // next char along the active edge
                if (t == c) { link[last] = node; return; }   // already implicit, stop
                int u = newNode(fpos[v], pos - 1);     // split the edge at the mismatch
                to[u][c] = newNode(n - 1, INF);
                to[u][t] = v;
                fpos[v] += pos - 1;
                len[v] -= pos - 1;
                to[node][e] = u;
                link[last] = u; last = u;
            }
            if (node == 0) pos--; else node = link[node];   // follow the suffix link
        }
    }
    void build(const string& t) { for (char c : t) addChar(c); }
    int edgeLen(int v) const { return min(len[v], (int)s.size() - fpos[v]); }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    SuffixTree st;
    st.build(s + "$");                        // one tree answers every query
    int k;
    cin >> k;
    while (k--) {
        string p;
        cin >> p;
        int v = 0, i = 0;
        bool ok = true;
        while (ok && i < (int)p.size()) {
            v = st.child(v, p[i]);
            if (v == 0) { ok = false; break; }
            int L = st.edgeLen(v);
            for (int j = 0; j < L && i < (int)p.size(); j++, i++)
                if (st.s[st.fpos[v] + j] != p[i]) { ok = false; break; }
        }
        cout << (ok ? "YES" : "NO") << "\\n";
    }
    return 0;
}`,
      explanation: [
        "The whole point of the variation is that the expensive part is paid once. One suffix tree of s answers every query, and a query costs only its own pattern length, so the total is O(|s| + sum of pattern lengths) up to the alphabet factor.",
        "The tempting wrong move is to run a linear matcher such as KMP per pattern: that is O(k * |s|) in the worst case, which is 10^10 here. The other wrong move is rebuilding the tree per query, which throws the whole advantage away.",
        "A query walks down from the root and dies in one of two ways: no child edge starts with the needed character, or a character inside an edge block disagrees. If the pattern is exhausted first the answer is YES no matter where you stopped, including in the middle of an edge, because every leaf below that point is an occurrence.",
        "Note that s and the patterns are read after the tree is built from s alone. Mixing patterns into the tree text would create substrings that cross a boundary and produce false positives.",
        "Time: O((|s| + sum |p|) log a). Space: O(|s|).",
      ],
    },
    {
      name: "Suffix Tree Application 2 - Searching All Patterns",
      difficulty: "Medium",
      variation: "All occurrence positions from the subtree leaves",
      link: "https://www.geeksforgeeks.org/suffix-tree-application-2-searching-all-patterns/",
      question: [
        "Given a text and a pattern, return every starting index in the text where the pattern occurs, in increasing order. Return an empty list if it never occurs. Use the suffix tree so that the cost is the pattern length plus the number of occurrences, not the text length.",
        "Example 1:\nInput: text = 'AABAACAADAABAABA', pat = 'AABA'\nOutput: [0, 9, 12]\nExplanation: The three copies of 'AABA' start at indices 0, 9 and 12; the occurrences at 9 and 12 overlap.",
        "Example 2:\nInput: text = 'GEEKSFORGEEKS', pat = 'GEEKS'\nOutput: [0, 8]\nExplanation: 'GEEKS' appears at the start and again at index 8.",
        "Constraints:\n- 1 <= text.length <= 10^5\n- 1 <= pat.length <= 10^5\n- The text does not contain '$'",
      ],
      code: `struct SuffixTree {
    static const int INF = 1e9;
    string s;                            // text built so far, terminator included
    vector<map<char,int>> to;            // children, keyed by the first char of the edge
    vector<int> len, fpos, link;         // edge length, edge start in s, suffix link
    int node = 0, pos = 0;               // active point: node plus offset down its edge

    SuffixTree() { newNode(0, INF); }    // node 0 is the root; len[0] = INF stops goEdge
    int newNode(int p, int l) {
        to.push_back({}); fpos.push_back(p); len.push_back(l); link.push_back(0);
        return (int)to.size() - 1;
    }
    int child(int v, char c) const {     // 0 means "absent": the root is never a child
        auto it = to[v].find(c);
        return it == to[v].end() ? 0 : it->second;
    }
    void goEdge() {                      // walk down while the active length overshoots
        while (pos > len[child(node, s[s.size() - pos])]) {
            node = child(node, s[s.size() - pos]);
            pos -= len[node];
        }
    }
    void addChar(char c) {
        s.push_back(c);
        pos++;
        int last = 0;
        while (pos > 0) {
            goEdge();
            int n = (int)s.size();
            char e = s[n - pos];
            int v = child(node, e);
            if (v == 0) {                              // no such edge: hang an open leaf
                to[node][e] = newNode(n - pos, INF);
                link[last] = node; last = 0;
            } else {
                char t = s[fpos[v] + pos - 1];         // next char along the active edge
                if (t == c) { link[last] = node; return; }   // already implicit, stop
                int u = newNode(fpos[v], pos - 1);     // split the edge at the mismatch
                to[u][c] = newNode(n - 1, INF);
                to[u][t] = v;
                fpos[v] += pos - 1;
                len[v] -= pos - 1;
                to[node][e] = u;
                link[last] = u; last = u;
            }
            if (node == 0) pos--; else node = link[node];   // follow the suffix link
        }
    }
    void build(const string& t) { for (char c : t) addChar(c); }
    int edgeLen(int v) const { return min(len[v], (int)s.size() - fpos[v]); }
};

vector<int> findAllOccurrences(const string& text, const string& pat) {
    int n = text.size();
    SuffixTree st;
    st.build(text + "$");
    int v = 0, i = 0, depth = 0;              // depth = string depth of node v
    while (i < (int)pat.size()) {
        v = st.child(v, pat[i]);
        if (v == 0) return {};
        int L = st.edgeLen(v);
        for (int k = 0; k < L && i < (int)pat.size(); k++, i++)
            if (st.s[st.fpos[v] + k] != pat[i]) return {};
        depth += L;                           // land on the node, not mid-edge
    }
    vector<int> res;
    vector<pair<int,int>> stk{{v, depth}};
    while (!stk.empty()) {
        auto [u, d] = stk.back(); stk.pop_back();
        if (st.to[u].empty()) { res.push_back(n + 1 - d); continue; }   // leaf -> suffix start
        for (auto& [c, w] : st.to[u]) stk.push_back({w, d + st.edgeLen(w)});
    }
    sort(res.begin(), res.end());
    return res;
}`,
      explanation: [
        "Walk the pattern down from the root as in the substring check, but keep the string depth of the node you land on. If the pattern ends inside an edge, the locus is still that edge's lower node: every occurrence of the pattern is an occurrence of that node's longer label, so the leaf set is the same.",
        "Each leaf of the tree is one suffix of text + '$'. The leaf reached at string depth d spells a suffix of length d, so it starts at index (n + 1) - d, where n + 1 is the length of the terminated text. Collecting every leaf in the subtree of the locus therefore gives exactly the occurrence positions.",
        "This is why the terminator is not optional here. Without it a suffix that is a prefix of another suffix has no leaf, and that occurrence would simply be missing from the answer.",
        "The naive alternative is scanning the text with a matcher, which is O(n) per query regardless of how few matches exist. Here the subtree of the locus has exactly occ leaves and at most 2*occ nodes, so the reporting cost is proportional to the answer size.",
        "The output must be sorted explicitly: the DFS visits children in character order, not in position order, so the leaf indices come out scrambled.",
        "Time: O(n log a) to build, then O(m log a + occ) per query. Space: O(n).",
      ],
    },
    {
      name: "Suffix Tree Application 4 - Build Linear Time Suffix Array",
      difficulty: "Medium",
      variation: "Suffix array as a lexicographic DFS",
      link: "https://www.geeksforgeeks.org/suffix-tree-application-4-build-linear-time-suffix-array/",
      question: [
        "Given a string of length n, output its suffix array: the indices 0..n-1 sorted by the lexicographic order of the suffixes they start. Derive it from the suffix tree instead of sorting the suffixes directly.",
        "Example 1:\nInput: text = 'banana'\nOutput: [5, 3, 1, 0, 4, 2]\nExplanation: The suffixes in order are 'a' (5), 'ana' (3), 'anana' (1), 'banana' (0), 'na' (4), 'nana' (2).",
        "Example 2:\nInput: text = 'abaaba'\nOutput: [5, 2, 3, 0, 4, 1]\nExplanation: The order is 'a' (5), 'aaba' (2), 'aba' (3), 'abaaba' (0), 'ba' (4), 'baaba' (1).",
        "Constraints:\n- 1 <= text.length <= 10^5\n- The text does not contain '$', and '$' is smaller than every character used",
      ],
      code: `struct SuffixTree {
    static const int INF = 1e9;
    string s;                            // text built so far, terminator included
    vector<map<char,int>> to;            // children, keyed by the first char of the edge
    vector<int> len, fpos, link;         // edge length, edge start in s, suffix link
    int node = 0, pos = 0;               // active point: node plus offset down its edge

    SuffixTree() { newNode(0, INF); }    // node 0 is the root; len[0] = INF stops goEdge
    int newNode(int p, int l) {
        to.push_back({}); fpos.push_back(p); len.push_back(l); link.push_back(0);
        return (int)to.size() - 1;
    }
    int child(int v, char c) const {     // 0 means "absent": the root is never a child
        auto it = to[v].find(c);
        return it == to[v].end() ? 0 : it->second;
    }
    void goEdge() {                      // walk down while the active length overshoots
        while (pos > len[child(node, s[s.size() - pos])]) {
            node = child(node, s[s.size() - pos]);
            pos -= len[node];
        }
    }
    void addChar(char c) {
        s.push_back(c);
        pos++;
        int last = 0;
        while (pos > 0) {
            goEdge();
            int n = (int)s.size();
            char e = s[n - pos];
            int v = child(node, e);
            if (v == 0) {                              // no such edge: hang an open leaf
                to[node][e] = newNode(n - pos, INF);
                link[last] = node; last = 0;
            } else {
                char t = s[fpos[v] + pos - 1];         // next char along the active edge
                if (t == c) { link[last] = node; return; }   // already implicit, stop
                int u = newNode(fpos[v], pos - 1);     // split the edge at the mismatch
                to[u][c] = newNode(n - 1, INF);
                to[u][t] = v;
                fpos[v] += pos - 1;
                len[v] -= pos - 1;
                to[node][e] = u;
                link[last] = u; last = u;
            }
            if (node == 0) pos--; else node = link[node];   // follow the suffix link
        }
    }
    void build(const string& t) { for (char c : t) addChar(c); }
    int edgeLen(int v) const { return min(len[v], (int)s.size() - fpos[v]); }
};

vector<int> buildSuffixArray(const string& text) {
    int n = text.size();
    SuffixTree st;
    st.build(text + "$");                     // "$" must sort before every char of text
    vector<int> sa;
    vector<pair<int,int>> stk{{0, 0}};
    while (!stk.empty()) {
        auto [u, d] = stk.back(); stk.pop_back();
        if (st.to[u].empty()) {
            int start = n + 1 - d;            // suffix start of this leaf
            if (start < n) sa.push_back(start);   // skip the "$"-only suffix
            continue;
        }
        for (auto it = st.to[u].rbegin(); it != st.to[u].rend(); ++it)   // reverse push
            stk.push_back({it->second, d + st.edgeLen(it->second)});     // so pops are sorted
    }
    return sa;
}`,
      explanation: [
        "Sibling edges out of a node begin with distinct characters, so ordering the children by that first character orders their whole subtrees lexicographically. A depth-first traversal that always takes the smallest available child therefore visits the leaves, hence the suffixes, in sorted order.",
        "The leaf at string depth d is the suffix starting at (n + 1) - d in the terminated string, which is the same index computation as the occurrence listing. The terminator-only suffix has index n and is dropped.",
        "The terminator must compare smaller than every real character, not merely be unique. With a large sentinel like '~' the suffix 'a' would sort after 'ab' instead of before it, and the whole array would be wrong. This is the one place where the choice of '$' carries semantics.",
        "Because the traversal uses an explicit stack, children are pushed in reverse order so that they pop in increasing order. A recursive DFS would be cleaner but the suffix tree can be n deep - think of a string of one repeated character - so the stack version avoids blowing the call stack.",
        "The traversal itself is linear in the number of nodes, so the total cost is the cost of building the tree. That is the sense in which the suffix array is obtained 'in linear time' from a suffix tree, modulo the per-node child ordering.",
        "Time: O(n log a). Space: O(n).",
      ],
    },
    {
      name: "Number of Distinct Substrings in a String",
      difficulty: "Medium",
      variation: "Distinct substrings as the sum of edge lengths",
      link: "https://leetcode.com/problems/number-of-distinct-substrings-in-a-string/",
      question: [
        "Given a string s, return the number of distinct non-empty substrings of s.",
        "Example 1:\nInput: s = 'aabbaba'\nOutput: 21\nExplanation: s has 28 substrings counted with multiplicity but only 21 distinct ones, because 'a', 'b', 'ab', 'ba', 'aba' and 'bab' each repeat.",
        "Example 2:\nInput: s = 'abcdefg'\nOutput: 28\nExplanation: All characters are different, so all 7 * 8 / 2 = 28 substrings are distinct.",
        "Constraints:\n- 1 <= s.length <= 500\n- s consists of lowercase English letters",
      ],
      code: `struct SuffixTree {
    static const int INF = 1e9;
    string s;                            // text built so far, terminator included
    vector<map<char,int>> to;            // children, keyed by the first char of the edge
    vector<int> len, fpos, link;         // edge length, edge start in s, suffix link
    int node = 0, pos = 0;               // active point: node plus offset down its edge

    SuffixTree() { newNode(0, INF); }    // node 0 is the root; len[0] = INF stops goEdge
    int newNode(int p, int l) {
        to.push_back({}); fpos.push_back(p); len.push_back(l); link.push_back(0);
        return (int)to.size() - 1;
    }
    int child(int v, char c) const {     // 0 means "absent": the root is never a child
        auto it = to[v].find(c);
        return it == to[v].end() ? 0 : it->second;
    }
    void goEdge() {                      // walk down while the active length overshoots
        while (pos > len[child(node, s[s.size() - pos])]) {
            node = child(node, s[s.size() - pos]);
            pos -= len[node];
        }
    }
    void addChar(char c) {
        s.push_back(c);
        pos++;
        int last = 0;
        while (pos > 0) {
            goEdge();
            int n = (int)s.size();
            char e = s[n - pos];
            int v = child(node, e);
            if (v == 0) {                              // no such edge: hang an open leaf
                to[node][e] = newNode(n - pos, INF);
                link[last] = node; last = 0;
            } else {
                char t = s[fpos[v] + pos - 1];         // next char along the active edge
                if (t == c) { link[last] = node; return; }   // already implicit, stop
                int u = newNode(fpos[v], pos - 1);     // split the edge at the mismatch
                to[u][c] = newNode(n - 1, INF);
                to[u][t] = v;
                fpos[v] += pos - 1;
                len[v] -= pos - 1;
                to[node][e] = u;
                link[last] = u; last = u;
            }
            if (node == 0) pos--; else node = link[node];   // follow the suffix link
        }
    }
    void build(const string& t) { for (char c : t) addChar(c); }
    int edgeLen(int v) const { return min(len[v], (int)s.size() - fpos[v]); }
};

int countDistinctSubstrings(string s) {
    int n = s.size();
    SuffixTree st;
    st.build(s + "$");
    int total = 0;
    for (int v = 1; v < (int)st.to.size(); v++) {      // every node except the root
        int L = st.edgeLen(v);
        if (st.fpos[v] + L == n + 1) L--;              // this edge ends on the terminator
        total += L;
    }
    return total;
}`,
      explanation: [
        "There is a bijection between the distinct substrings of s and the positions on the edges of the suffix tree of s + '$'. Reading down from the root, every distinct substring is spelled by exactly one path, and that path ends at exactly one character position on exactly one edge. So the count is the sum of the edge lengths.",
        "Concretely: a node at string depth d contributes its parent edge's characters as the substrings of lengths (d - edgeLen + 1) .. d that share that locus. Summing over all non-root nodes covers every distinct substring exactly once, which is why no deduplication step is needed at all.",
        "The correction term is the terminator. Any edge whose label reaches position n + 1 in the terminated string ends with '$', and that one character spells a substring that does not exist in s, so its length is reduced by one. Forgetting this over-counts by exactly the number of leaves.",
        "The tempting wrong approaches are inserting all n^2 substrings into a hash set, which is O(n^3) characters of work, or counting nodes instead of characters, which counts loci rather than substrings and is far too small.",
        "The same identity written on a suffix array is n(n+1)/2 minus the sum of the LCP array, and on a suffix automaton it is the sum of len(v) - len(link(v)); all three are the same accounting.",
        "Time: O(n log a). Space: O(n).",
      ],
    },
    {
      name: "Distinct Substrings",
      difficulty: "Medium",
      variation: "Distinct substrings at judge scale, 64-bit",
      link: "https://cses.fi/problemset/task/2105",
      question: [
        "Given a string of length n, count the number of distinct substrings it contains. The input is a single line holding the string; print one integer.",
        "Example 1:\nInput:\nabaa\nOutput:\n8\nExplanation: The distinct substrings are a, b, aa, ab, ba, aba, baa, abaa.",
        "Example 2:\nInput:\naaaa\nOutput:\n4\nExplanation: Only a, aa, aaa and aaaa exist; every other substring is a repeat.",
        "Constraints:\n- 1 <= n <= 10^5\n- The string consists of lowercase English letters",
      ],
      code: `struct SuffixTree {
    static const int INF = 1e9;
    string s;                            // text built so far, terminator included
    vector<map<char,int>> to;            // children, keyed by the first char of the edge
    vector<int> len, fpos, link;         // edge length, edge start in s, suffix link
    int node = 0, pos = 0;               // active point: node plus offset down its edge

    SuffixTree() { newNode(0, INF); }    // node 0 is the root; len[0] = INF stops goEdge
    int newNode(int p, int l) {
        to.push_back({}); fpos.push_back(p); len.push_back(l); link.push_back(0);
        return (int)to.size() - 1;
    }
    int child(int v, char c) const {     // 0 means "absent": the root is never a child
        auto it = to[v].find(c);
        return it == to[v].end() ? 0 : it->second;
    }
    void goEdge() {                      // walk down while the active length overshoots
        while (pos > len[child(node, s[s.size() - pos])]) {
            node = child(node, s[s.size() - pos]);
            pos -= len[node];
        }
    }
    void addChar(char c) {
        s.push_back(c);
        pos++;
        int last = 0;
        while (pos > 0) {
            goEdge();
            int n = (int)s.size();
            char e = s[n - pos];
            int v = child(node, e);
            if (v == 0) {                              // no such edge: hang an open leaf
                to[node][e] = newNode(n - pos, INF);
                link[last] = node; last = 0;
            } else {
                char t = s[fpos[v] + pos - 1];         // next char along the active edge
                if (t == c) { link[last] = node; return; }   // already implicit, stop
                int u = newNode(fpos[v], pos - 1);     // split the edge at the mismatch
                to[u][c] = newNode(n - 1, INF);
                to[u][t] = v;
                fpos[v] += pos - 1;
                len[v] -= pos - 1;
                to[node][e] = u;
                link[last] = u; last = u;
            }
            if (node == 0) pos--; else node = link[node];   // follow the suffix link
        }
    }
    void build(const string& t) { for (char c : t) addChar(c); }
    int edgeLen(int v) const { return min(len[v], (int)s.size() - fpos[v]); }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    int n = s.size();
    SuffixTree st;
    st.build(s + "$");
    long long total = 0;
    for (int v = 1; v < (int)st.to.size(); v++) {
        int L = st.edgeLen(v);
        if (st.fpos[v] + L == n + 1) L--;     // drop the terminator character
        total += L;
    }
    cout << total << "\\n";
    return 0;
}`,
      explanation: [
        "Same identity as the small-input version: the answer is the total number of characters on the edges of the suffix tree of s + '$', with each terminator character discounted. The construction is what changes, because n is now 10^5.",
        "The arithmetic trap is real here. For a string of all distinct characters the answer approaches n(n+1)/2, which is about 5 * 10^9 and overflows a 32-bit int, so the accumulator must be long long even though every edge length fits in an int.",
        "The structural trap is the O(n^2) node count you get if you build an uncompressed trie of all suffixes. Ukkonen's compression keeps the node count below 2n, which is exactly what makes the sum-of-edge-lengths trick affordable.",
        "No traversal is needed at all: edge lengths are read straight off the node arrays in creation order, so the counting pass is a flat loop with no recursion and no stack depth concern.",
        "Time: O(n log a). Space: O(n).",
      ],
    },
    {
      name: "Longest Duplicate Substring",
      difficulty: "Hard",
      variation: "Longest repeated substring - deepest internal node",
      link: "https://leetcode.com/problems/longest-duplicate-substring/",
      question: [
        "Given a string s, return the longest substring that occurs at least twice in s. The two occurrences may overlap. If no substring occurs twice, return the empty string. If several answers have the same maximal length, any one of them is accepted.",
        "Example 1:\nInput: s = 'banana'\nOutput: 'ana'\nExplanation: 'ana' occurs at indices 1 and 3 (overlapping). No length-4 substring repeats.",
        "Example 2:\nInput: s = 'abcd'\nOutput: ''\nExplanation: Every character is distinct, so nothing repeats.",
        "Constraints:\n- 2 <= s.length <= 3 * 10^4\n- s consists of lowercase English letters",
      ],
      code: `struct SuffixTree {
    static const int INF = 1e9;
    string s;                            // text built so far, terminator included
    vector<map<char,int>> to;            // children, keyed by the first char of the edge
    vector<int> len, fpos, link;         // edge length, edge start in s, suffix link
    int node = 0, pos = 0;               // active point: node plus offset down its edge

    SuffixTree() { newNode(0, INF); }    // node 0 is the root; len[0] = INF stops goEdge
    int newNode(int p, int l) {
        to.push_back({}); fpos.push_back(p); len.push_back(l); link.push_back(0);
        return (int)to.size() - 1;
    }
    int child(int v, char c) const {     // 0 means "absent": the root is never a child
        auto it = to[v].find(c);
        return it == to[v].end() ? 0 : it->second;
    }
    void goEdge() {                      // walk down while the active length overshoots
        while (pos > len[child(node, s[s.size() - pos])]) {
            node = child(node, s[s.size() - pos]);
            pos -= len[node];
        }
    }
    void addChar(char c) {
        s.push_back(c);
        pos++;
        int last = 0;
        while (pos > 0) {
            goEdge();
            int n = (int)s.size();
            char e = s[n - pos];
            int v = child(node, e);
            if (v == 0) {                              // no such edge: hang an open leaf
                to[node][e] = newNode(n - pos, INF);
                link[last] = node; last = 0;
            } else {
                char t = s[fpos[v] + pos - 1];         // next char along the active edge
                if (t == c) { link[last] = node; return; }   // already implicit, stop
                int u = newNode(fpos[v], pos - 1);     // split the edge at the mismatch
                to[u][c] = newNode(n - 1, INF);
                to[u][t] = v;
                fpos[v] += pos - 1;
                len[v] -= pos - 1;
                to[node][e] = u;
                link[last] = u; last = u;
            }
            if (node == 0) pos--; else node = link[node];   // follow the suffix link
        }
    }
    void build(const string& t) { for (char c : t) addChar(c); }
    int edgeLen(int v) const { return min(len[v], (int)s.size() - fpos[v]); }
};

string longestDupSubstring(string s) {
    SuffixTree st;
    st.build(s + "$");
    int best = 0, bestEnd = 0;
    vector<pair<int,int>> stk{{0, 0}};
    while (!stk.empty()) {
        auto [u, d] = stk.back(); stk.pop_back();
        if (st.to[u].empty()) continue;                // leaves are single occurrences
        if (u != 0 && d > best) {                      // branching node = repeated substring
            best = d;
            bestEnd = st.fpos[u] + st.edgeLen(u);      // end index of its path label
        }
        for (auto& [c, w] : st.to[u]) stk.push_back({w, d + st.edgeLen(w)});
    }
    return best ? s.substr(bestEnd - best, best) : "";
}`,
      explanation: [
        "A substring occurs at least twice exactly when its locus in the suffix tree of s + '$' has at least two leaves below it, and in a terminated suffix tree that means the locus is at or above an internal (branching) node. Extending a repeated substring by one character keeps it repeated only while you stay above a branching point, so the longest repeat is the string depth of the deepest internal node.",
        "That gives the position too: the internal node's path label ends at fpos + edgeLen, so the answer is the depth-many characters that end there. No occurrence lists or comparisons are needed.",
        "Overlap is handled for free, which is where a hand-rolled two-pointer or greedy attempt usually goes wrong. 'ana' in 'banana' overlaps itself, and the tree does not care: the two leaves at indices 1 and 3 are simply two leaves.",
        "The classic alternative is binary search on the length plus rolling-hash sets, which is O(n log n) but probabilistic - an adversarial test can force a collision and a wrong answer unless you use a random base or double hashing. The suffix tree answer is deterministic.",
        "The traversal is again an explicit stack, because the tree depth can be O(n) for inputs like a long run of one character. Leaves are skipped as candidates since a leaf represents a single occurrence.",
        "Time: O(n log a). Space: O(n).",
      ],
    },
    {
      name: "Longest Common Substring",
      difficulty: "Hard",
      variation: "Generalized suffix tree of two strings",
      link: "https://www.spoj.com/problems/LCS/",
      question: [
        "You are given two strings on two lines. Print the length of the longest string that is a substring of both of them, or 0 if they share no character. Build one generalized suffix tree over both strings and mark, for every node, which of the two inputs its leaves came from.",
        "Example 1:\nInput:\nalsdfkjfjkdsal\nfdjskalajfkdsla\nOutput:\n3\nExplanation: 'jkd' (and also 'kds') appears in both strings, and no common substring of length 4 exists.",
        "Example 2:\nInput:\nbanana\nananas\nOutput:\n5\nExplanation: 'anana' is a substring of both.",
        "Constraints:\n- 1 <= length of each string <= 250000\n- The strings consist of lowercase English letters, and neither contains '#' or '$'",
      ],
      code: `struct SuffixTree {
    static const int INF = 1e9;
    string s;                            // text built so far, terminator included
    vector<map<char,int>> to;            // children, keyed by the first char of the edge
    vector<int> len, fpos, link;         // edge length, edge start in s, suffix link
    int node = 0, pos = 0;               // active point: node plus offset down its edge

    SuffixTree() { newNode(0, INF); }    // node 0 is the root; len[0] = INF stops goEdge
    int newNode(int p, int l) {
        to.push_back({}); fpos.push_back(p); len.push_back(l); link.push_back(0);
        return (int)to.size() - 1;
    }
    int child(int v, char c) const {     // 0 means "absent": the root is never a child
        auto it = to[v].find(c);
        return it == to[v].end() ? 0 : it->second;
    }
    void goEdge() {                      // walk down while the active length overshoots
        while (pos > len[child(node, s[s.size() - pos])]) {
            node = child(node, s[s.size() - pos]);
            pos -= len[node];
        }
    }
    void addChar(char c) {
        s.push_back(c);
        pos++;
        int last = 0;
        while (pos > 0) {
            goEdge();
            int n = (int)s.size();
            char e = s[n - pos];
            int v = child(node, e);
            if (v == 0) {                              // no such edge: hang an open leaf
                to[node][e] = newNode(n - pos, INF);
                link[last] = node; last = 0;
            } else {
                char t = s[fpos[v] + pos - 1];         // next char along the active edge
                if (t == c) { link[last] = node; return; }   // already implicit, stop
                int u = newNode(fpos[v], pos - 1);     // split the edge at the mismatch
                to[u][c] = newNode(n - 1, INF);
                to[u][t] = v;
                fpos[v] += pos - 1;
                len[v] -= pos - 1;
                to[node][e] = u;
                link[last] = u; last = u;
            }
            if (node == 0) pos--; else node = link[node];   // follow the suffix link
        }
    }
    void build(const string& t) { for (char c : t) addChar(c); }
    int edgeLen(int v) const { return min(len[v], (int)s.size() - fpos[v]); }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string a, b;
    cin >> a >> b;
    int na = a.size();
    string t = a + "#" + b + "$";             // two distinct terminators
    SuffixTree st;
    st.build(t);
    int m = st.to.size(), total = t.size();
    vector<int> order, dep(m, 0), stk{0};
    order.reserve(m);
    while (!stk.empty()) {                    // iterative DFS: parents before children
        int u = stk.back(); stk.pop_back();
        order.push_back(u);
        for (auto& pr : st.to[u]) {
            dep[pr.second] = dep[u] + st.edgeLen(pr.second);
            stk.push_back(pr.second);
        }
    }
    vector<char> hasA(m, 0), hasB(m, 0);
    for (int i = m - 1; i >= 0; i--) {        // reverse order = children before parents
        int u = order[i];
        if (st.to[u].empty()) {
            int start = total - dep[u];
            if (start < na) hasA[u] = 1; else hasB[u] = 1;
        }
        for (auto& pr : st.to[u]) { hasA[u] |= hasA[pr.second]; hasB[u] |= hasB[pr.second]; }
    }
    int best = 0;
    for (int v = 1; v < m; v++)
        if (!st.to[v].empty() && hasA[v] && hasB[v]) best = max(best, dep[v]);
    cout << best << "\\n";
    return 0;
}`,
      explanation: [
        "Concatenate as a + '#' + b + '$' and build one suffix tree. Every leaf is a suffix of that combined string, and the suffix's start index tells you which input it belongs to: below |a| it came from a, above it from b. Propagating those two flags upwards marks every node with the set of inputs in which its path label occurs.",
        "The answer is the deepest node carrying both flags. Two distinct separators are essential: with a single character used twice, a substring straddling the join would be a genuine path in the tree and could be reported as a common substring that exists in neither input.",
        "There is a subtlety that makes the depth safe without any clipping. A node with two or more children has a path label occurring at two different positions, but '#' and '$' each occur once, so no branching node's label can contain either separator. Restricting candidates to non-leaf nodes therefore removes the whole class of bugs where the reported length runs past the end of a.",
        "Both passes are iterative. The first DFS records a visit order with parents before children and computes string depths; iterating that order backwards is a valid post-order, so the flags aggregate bottom-up without recursion, which matters because the combined string is half a million characters and the tree can be that deep.",
        "The O(n * m) DP for the longest common substring is fine for a thousand characters, but at 250000 each it is 6 * 10^10 cells. The suffix structure replaces the product with a sum. On memory-tight judges, swapping the per-node map for a fixed-size child array is the usual next step.",
        "Time: O((n + m) log a). Space: O(n + m).",
      ],
    },
    {
      name: "Substring Order I",
      difficulty: "Hard",
      variation: "K-th distinct substring by subtree counts",
      link: "https://cses.fi/problemset/task/2108",
      question: [
        "Given a string s, consider all of its distinct substrings sorted in lexicographic order. Given k, print the k-th substring in that order. The first line of input holds s and the second line holds k. It is guaranteed that s has at least k distinct substrings.",
        "Example 1:\nInput:\naabba\n3\nOutput:\naab\nExplanation: The distinct substrings in order are a, aa, aab, aabb, aabba, ab, abb, abba, b, ba, bb, bba. The third is 'aab'.",
        "Example 2:\nInput:\naabba\n12\nOutput:\nbba\nExplanation: 'bba' is the last of the twelve distinct substrings in that list.",
        "Constraints:\n- 1 <= |s| <= 10^5\n- 1 <= k <= 10^18\n- s consists of lowercase English letters",
      ],
      code: `struct SuffixTree {
    static const int INF = 1e9;
    string s;                            // text built so far, terminator included
    vector<map<char,int>> to;            // children, keyed by the first char of the edge
    vector<int> len, fpos, link;         // edge length, edge start in s, suffix link
    int node = 0, pos = 0;               // active point: node plus offset down its edge

    SuffixTree() { newNode(0, INF); }    // node 0 is the root; len[0] = INF stops goEdge
    int newNode(int p, int l) {
        to.push_back({}); fpos.push_back(p); len.push_back(l); link.push_back(0);
        return (int)to.size() - 1;
    }
    int child(int v, char c) const {     // 0 means "absent": the root is never a child
        auto it = to[v].find(c);
        return it == to[v].end() ? 0 : it->second;
    }
    void goEdge() {                      // walk down while the active length overshoots
        while (pos > len[child(node, s[s.size() - pos])]) {
            node = child(node, s[s.size() - pos]);
            pos -= len[node];
        }
    }
    void addChar(char c) {
        s.push_back(c);
        pos++;
        int last = 0;
        while (pos > 0) {
            goEdge();
            int n = (int)s.size();
            char e = s[n - pos];
            int v = child(node, e);
            if (v == 0) {                              // no such edge: hang an open leaf
                to[node][e] = newNode(n - pos, INF);
                link[last] = node; last = 0;
            } else {
                char t = s[fpos[v] + pos - 1];         // next char along the active edge
                if (t == c) { link[last] = node; return; }   // already implicit, stop
                int u = newNode(fpos[v], pos - 1);     // split the edge at the mismatch
                to[u][c] = newNode(n - 1, INF);
                to[u][t] = v;
                fpos[v] += pos - 1;
                len[v] -= pos - 1;
                to[node][e] = u;
                link[last] = u; last = u;
            }
            if (node == 0) pos--; else node = link[node];   // follow the suffix link
        }
    }
    void build(const string& t) { for (char c : t) addChar(c); }
    int edgeLen(int v) const { return min(len[v], (int)s.size() - fpos[v]); }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    long long k;
    cin >> s >> k;
    int n = s.size();
    SuffixTree st;
    st.build(s + "$");
    int m = st.to.size();
    vector<int> use(m, 0), order, stk{0};
    order.reserve(m);
    for (int v = 1; v < m; v++) {
        int L = st.edgeLen(v);
        if (st.fpos[v] + L == n + 1) L--;     // characters of this edge that are real
        use[v] = L;
    }
    while (!stk.empty()) {
        int u = stk.back(); stk.pop_back();
        order.push_back(u);
        for (auto& pr : st.to[u]) stk.push_back(pr.second);
    }
    vector<long long> cnt(m, 0);              // distinct substrings in the subtree
    for (int i = m - 1; i >= 0; i--) {
        int u = order[i];
        long long tot = use[u];
        for (auto& pr : st.to[u]) tot += cnt[pr.second];
        cnt[u] = tot;
    }
    string res;
    int v = 0;
    while (true) {
        bool moved = false;
        for (auto& pr : st.to[v]) {           // map iteration is in character order
            int w = pr.second;
            if (k <= cnt[w]) {
                if (k <= use[w]) {            // the answer ends inside this edge
                    res.append(st.s, st.fpos[w], (size_t)k);
                    cout << res << "\\n";
                    return 0;
                }
                res.append(st.s, st.fpos[w], (size_t)use[w]);
                k -= use[w];
                v = w; moved = true;
                break;
            }
            k -= cnt[w];                      // skip this whole subtree
        }
        if (!moved) break;
    }
    return 0;
}`,
      explanation: [
        "Annotate every node with cnt(v) = the number of distinct substrings whose path passes through or ends inside v's subtree, which is the usable length of v's own edge plus the cnt of its children. That is the sum-of-edge-lengths identity applied per subtree, and 'usable' again means discounting a terminator character.",
        "Then descend greedily. At a node, walk the children in character order; if k exceeds cnt(child) the whole subtree is skipped and k drops by cnt(child), otherwise the answer lies inside it. Once k is at most the usable length of the chosen edge, the answer stops after k characters of that edge and the walk is over. Lexicographic order across siblings is guaranteed because their edges start with distinct characters, and std::map iterates them in order.",
        "The terminator edge needs no special case: its usable length is 0, so cnt is 0, the branch is never entered and k is unchanged. That is cleaner than filtering it out by hand.",
        "k can be up to 10^18 but the true total of distinct substrings is at most n(n+1)/2, about 5 * 10^9, so the counters fit comfortably in a signed 64-bit integer and no saturating addition is needed. Using int for cnt is the actual bug to avoid here.",
        "Both the ordering pass and the counting pass are iterative for the usual reason: a string like a run of 10^5 equal characters gives a path of depth 10^5, and a recursive post-order would overflow the stack.",
        "Time: O(n log a) to build and annotate, O(|answer| + n) to descend. Space: O(n).",
      ],
    },
    {
      name: "String",
      difficulty: "Hard",
      variation: "Sum over distinct substrings of occurrence pairs",
      link: "https://codeforces.com/problemset/problem/123/D",
      question: [
        "For a string s and a substring x, let cnt(x) be the number of positions where x occurs in s. Compute the sum over all distinct substrings x of cnt(x) * (cnt(x) + 1) / 2. Equivalently, count the number of triples (x, i, j) where x is a substring, i <= j, and both i and j are occurrence positions of x. The input is a single line holding s.",
        "Example 1:\nInput:\naaaa\nOutput:\n20\nExplanation: 'a' occurs 4 times giving 10, 'aa' occurs 3 times giving 6, 'aaa' occurs twice giving 3, 'aaaa' once giving 1, and 10 + 6 + 3 + 1 = 20.",
        "Example 2:\nInput:\nabcdef\nOutput:\n21\nExplanation: All 21 substrings are distinct and each occurs once, so each contributes 1.",
        "Constraints:\n- 1 <= |s| <= 10^5\n- s consists of lowercase English letters",
      ],
      code: `struct SuffixTree {
    static const int INF = 1e9;
    string s;                            // text built so far, terminator included
    vector<map<char,int>> to;            // children, keyed by the first char of the edge
    vector<int> len, fpos, link;         // edge length, edge start in s, suffix link
    int node = 0, pos = 0;               // active point: node plus offset down its edge

    SuffixTree() { newNode(0, INF); }    // node 0 is the root; len[0] = INF stops goEdge
    int newNode(int p, int l) {
        to.push_back({}); fpos.push_back(p); len.push_back(l); link.push_back(0);
        return (int)to.size() - 1;
    }
    int child(int v, char c) const {     // 0 means "absent": the root is never a child
        auto it = to[v].find(c);
        return it == to[v].end() ? 0 : it->second;
    }
    void goEdge() {                      // walk down while the active length overshoots
        while (pos > len[child(node, s[s.size() - pos])]) {
            node = child(node, s[s.size() - pos]);
            pos -= len[node];
        }
    }
    void addChar(char c) {
        s.push_back(c);
        pos++;
        int last = 0;
        while (pos > 0) {
            goEdge();
            int n = (int)s.size();
            char e = s[n - pos];
            int v = child(node, e);
            if (v == 0) {                              // no such edge: hang an open leaf
                to[node][e] = newNode(n - pos, INF);
                link[last] = node; last = 0;
            } else {
                char t = s[fpos[v] + pos - 1];         // next char along the active edge
                if (t == c) { link[last] = node; return; }   // already implicit, stop
                int u = newNode(fpos[v], pos - 1);     // split the edge at the mismatch
                to[u][c] = newNode(n - 1, INF);
                to[u][t] = v;
                fpos[v] += pos - 1;
                len[v] -= pos - 1;
                to[node][e] = u;
                link[last] = u; last = u;
            }
            if (node == 0) pos--; else node = link[node];   // follow the suffix link
        }
    }
    void build(const string& t) { for (char c : t) addChar(c); }
    int edgeLen(int v) const { return min(len[v], (int)s.size() - fpos[v]); }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    int n = s.size();
    SuffixTree st;
    st.build(s + "$");
    int m = st.to.size();
    vector<int> order, stk{0};
    order.reserve(m);
    while (!stk.empty()) {
        int u = stk.back(); stk.pop_back();
        order.push_back(u);
        for (auto& pr : st.to[u]) stk.push_back(pr.second);
    }
    vector<long long> occ(m, 0);
    long long ans = 0;
    for (int i = m - 1; i >= 0; i--) {
        int u = order[i];
        if (st.to[u].empty()) occ[u] = 1;     // one leaf = one occurrence
        else for (auto& pr : st.to[u]) occ[u] += occ[pr.second];
        if (u != 0) {
            int L = st.edgeLen(u);
            if (st.fpos[u] + L == n + 1) L--;
            ans += (long long)L * occ[u] * (occ[u] + 1) / 2;   // L substrings, same count
        }
    }
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "Two facts combine. First, the number of occurrences of a substring equals the number of leaves below its locus in the suffix tree of s + '$'. Second, all the substrings whose locus sits on the same edge share the same locus node and therefore the same occurrence count.",
        "So instead of enumerating the O(n^2) distinct substrings, group them by edge: an edge with usable length L below node v contributes exactly L distinct substrings, each occurring occ(v) times, hence L * occ(v) * (occ(v) + 1) / 2. Summing that over all non-root nodes is the answer, in O(number of nodes) time.",
        "occ is computed by a bottom-up pass where a leaf counts as 1 and an internal node sums its children. The terminator-only leaf hangs directly off the root, so it never inflates any real node's count, and the usable-length correction removes the substrings that would end on '$'.",
        "The magnitude check matters: for a run of 10^5 identical characters the sum is on the order of n^3 / 6, roughly 1.6 * 10^14, so the accumulator must be 64-bit while occ itself stays small enough that occ * (occ + 1) / 2 is safe in 64-bit.",
        "The tempting wrong approach is to hash every substring and count occurrences, which is quadratic at best. The correct alternative structures are a suffix automaton with the same clone-aware occurrence counts, or a suffix array where each distinct substring is charged to an LCP interval - the same grouping argument in a different dress.",
        "Time: O(n log a). Space: O(n).",
      ],
    },
  ],
};
