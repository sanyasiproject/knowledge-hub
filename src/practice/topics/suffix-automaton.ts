import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Finding Patterns",
      difficulty: "Easy",
      variation: "Suffix automaton template, substring membership",
      link: "https://cses.fi/problemset/task/2102",
      question: [
        "You are given a string s and k patterns. For each pattern report whether it appears in s as a substring. Print YES if it does and NO otherwise.",
        "Example 1:\nInput:\naybabtu\n3\nbab\nabc\nbaby\nOutput:\nYES\nNO\nNO\nExplanation: 'bab' sits at positions 2..4 of aybabtu. 'abc' never appears, and 'baby' dies after 'bab' because the next character of s is 't'.",
        "Constraints:\n- 1 <= |s| <= 10^5\n- 1 <= k <= 10^5\n- total length of all patterns <= 10^6\n- s and the patterns consist of lowercase English letters",
      ],
      code: `struct SAM {
    vector<int> len, link;
    vector<array<int,26>> nxt;
    int last;
    SAM(int n = 0) {
        len.reserve(2 * n + 5); link.reserve(2 * n + 5); nxt.reserve(2 * n + 5);
        newNode(0, -1);
        last = 0;
    }
    int newNode(int l, int lk) {
        len.push_back(l);
        link.push_back(lk);
        array<int,26> a; a.fill(-1);
        nxt.push_back(a);
        return (int)len.size() - 1;
    }
    void extend(int c) {
        int cur = newNode(len[last] + 1, -1);
        int p = last;
        // every suffix of the old string with no c-transition now gets one
        while (p != -1 && nxt[p][c] == -1) { nxt[p][c] = cur; p = link[p]; }
        if (p == -1) link[cur] = 0;
        else {
            int q = nxt[p][c];
            if (len[p] + 1 == len[q]) link[cur] = q;   // q is already exactly the right class
            else {
                int cl = newNode(len[p] + 1, link[q]); // split q into clone + q
                nxt[cl] = nxt[q];
                link[q] = cl;
                link[cur] = cl;
                while (p != -1 && nxt[p][c] == q) { nxt[p][c] = cl; p = link[p]; }
            }
        }
        last = cur;
    }
    int size() const { return (int)len.size(); }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    int k;
    cin >> k;
    SAM sam((int)s.size());
    for (char ch : s) sam.extend(ch - 'a');
    while (k--) {
        string p;
        cin >> p;
        int v = 0;
        bool ok = true;
        for (char ch : p) {
            int c = ch - 'a';
            if (sam.nxt[v][c] == -1) { ok = false; break; }
            v = sam.nxt[v][c];
        }
        cout << (ok ? "YES" : "NO") << "\\n";
    }
    return 0;
}`,
      explanation: [
        "A suffix automaton is the smallest DFA that accepts exactly the suffixes of s. Its key property for this problem is stronger: every path starting at the initial state spells a distinct substring of s, and every substring of s is spelled by exactly one such path. So membership is just a walk - feed the pattern one character at a time and fail the moment a transition is missing.",
        "A state is an equivalence class of substrings sharing the same endpos set (the set of positions where they end). len[v] is the length of the longest string in the class, and link[v] points to the state holding the longest proper suffix that lies in a different class. The link tree and the transition DAG together are what make every later variation cheap.",
        "The construction is the whole trick. Adding character c creates a state cur for the new whole prefix, then walks up the suffix links of last adding c-transitions to cur. When it meets a state p that already has a c-transition to q, either len[p] + 1 == len[q], in which case q is exactly the class of the string we wanted and becomes the link of cur, or q is too long and must be split: a clone with len[p] + 1 keeps q's transitions and absorbs the short strings, while q keeps the long ones.",
        "The tempting wrong build is to skip the clone case and just set link[cur] = q. That silently merges classes with different endpos sets, which breaks every occurrence count built on top of the automaton even though simple substring queries still happen to pass.",
        "The automaton has at most 2n - 1 states and 3n - 4 transitions, and the amortised cost of the two suffix-link walks per character is O(1) with a fixed alphabet.",
        "Time: O(|s| * 26) to build, O(|p|) per query. Space: O(|s| * 26).",
      ],
    },
    {
      name: "Distinct Substrings",
      difficulty: "Easy",
      variation: "Counting distinct substrings",
      link: "https://cses.fi/problemset/task/2105",
      question: [
        "You are given a string of length n. Calculate the number of distinct substrings it contains.",
        "Example 1:\nInput:\nabaa\nOutput:\n8\nExplanation: The distinct substrings are a, b, ab, ba, aa, aba, baa, abaa.",
        "Example 2:\nInput:\naaa\nOutput:\n3\nExplanation: Only a, aa and aaa.",
        "Constraints:\n- 1 <= n <= 10^5\n- the string consists of lowercase English letters\n- the answer can reach about 5 * 10^9, so it needs 64-bit arithmetic",
      ],
      code: `struct SAM {
    vector<int> len, link;
    vector<array<int,26>> nxt;
    int last;
    SAM(int n = 0) {
        len.reserve(2 * n + 5); link.reserve(2 * n + 5); nxt.reserve(2 * n + 5);
        newNode(0, -1);
        last = 0;
    }
    int newNode(int l, int lk) {
        len.push_back(l);
        link.push_back(lk);
        array<int,26> a; a.fill(-1);
        nxt.push_back(a);
        return (int)len.size() - 1;
    }
    void extend(int c) {
        int cur = newNode(len[last] + 1, -1);
        int p = last;
        while (p != -1 && nxt[p][c] == -1) { nxt[p][c] = cur; p = link[p]; }
        if (p == -1) link[cur] = 0;
        else {
            int q = nxt[p][c];
            if (len[p] + 1 == len[q]) link[cur] = q;
            else {
                int cl = newNode(len[p] + 1, link[q]);
                nxt[cl] = nxt[q];
                link[q] = cl;
                link[cur] = cl;
                while (p != -1 && nxt[p][c] == q) { nxt[p][c] = cl; p = link[p]; }
            }
        }
        last = cur;
    }
    int size() const { return (int)len.size(); }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    SAM sam((int)s.size());
    for (char ch : s) sam.extend(ch - 'a');
    long long ans = 0;
    // state v owns exactly the lengths len[link[v]] + 1 .. len[v]
    for (int v = 1; v < sam.size(); v++) ans += sam.len[v] - sam.len[sam.link[v]];
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "Distinct substrings correspond one-to-one with non-empty paths out of the initial state, so the answer is the number of such paths. Counting them by DP over the DAG works, but there is a closed form that needs no traversal at all.",
        "Each state v collects the substrings of one endpos class. Those substrings are exactly the suffixes of the longest one whose lengths run from len[link[v]] + 1 up to len[v] - anything shorter has a strictly larger endpos set and therefore lives in an ancestor. So state v contributes precisely len[v] - len[link[v]] distinct strings, and the classes partition all substrings.",
        "The trap is forgetting that clone states are real states carrying real strings: skipping them, or accidentally counting the initial state (whose link is -1), throws the sum off. Start the loop at 1 and include every other node, clones included.",
        "The same number is obtained from a suffix array as n * (n + 1) / 2 minus the sum of the LCP array; the automaton version is linear and needs no sorting.",
        "Time: O(n * 26). Space: O(n * 26).",
      ],
    },
    {
      name: "Substring Distribution",
      difficulty: "Medium",
      variation: "Distinct substrings per length",
      link: "https://cses.fi/problemset/task/2110",
      question: [
        "You are given a string of length n. For every length 1..n, report the number of distinct substrings of that length.",
        "Example 1:\nInput:\nabaa\nOutput:\n2 3 2 1\nExplanation: Length 1 gives a and b. Length 2 gives ab, ba, aa. Length 3 gives aba, baa. Length 4 gives abaa.",
        "Example 2:\nInput:\naaa\nOutput:\n1 1 1\nExplanation: For each length there is only the all-a string of that length.",
        "Constraints:\n- 1 <= n <= 10^5\n- the string consists of lowercase English letters",
      ],
      code: `struct SAM {
    vector<int> len, link;
    vector<array<int,26>> nxt;
    int last;
    SAM(int n = 0) {
        len.reserve(2 * n + 5); link.reserve(2 * n + 5); nxt.reserve(2 * n + 5);
        newNode(0, -1);
        last = 0;
    }
    int newNode(int l, int lk) {
        len.push_back(l);
        link.push_back(lk);
        array<int,26> a; a.fill(-1);
        nxt.push_back(a);
        return (int)len.size() - 1;
    }
    void extend(int c) {
        int cur = newNode(len[last] + 1, -1);
        int p = last;
        while (p != -1 && nxt[p][c] == -1) { nxt[p][c] = cur; p = link[p]; }
        if (p == -1) link[cur] = 0;
        else {
            int q = nxt[p][c];
            if (len[p] + 1 == len[q]) link[cur] = q;
            else {
                int cl = newNode(len[p] + 1, link[q]);
                nxt[cl] = nxt[q];
                link[q] = cl;
                link[cur] = cl;
                while (p != -1 && nxt[p][c] == q) { nxt[p][c] = cl; p = link[p]; }
            }
        }
        last = cur;
    }
    int size() const { return (int)len.size(); }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    int n = (int)s.size();
    SAM sam(n);
    for (char ch : s) sam.extend(ch - 'a');
    vector<long long> diff(n + 2, 0);
    for (int v = 1; v < sam.size(); v++) {
        diff[sam.len[sam.link[v]] + 1]++;   // one distinct string for each length in the range
        diff[sam.len[v] + 1]--;
    }
    long long cur = 0;
    for (int L = 1; L <= n; L++) {
        cur += diff[L];
        cout << cur << " \\n"[L == n];
    }
    return 0;
}`,
      explanation: [
        "This is the previous problem refined by length. State v contributes exactly one distinct substring for each length in the closed interval [len[link[v]] + 1, len[v]], so instead of adding the width of the interval to a single total, add 1 across the interval.",
        "Adding 1 to a whole range for every state would be O(n^2) in the worst case, so use a difference array: +1 at the left end, -1 just past the right end, then one prefix-sum sweep. That keeps the whole answer linear.",
        "The correctness rests on the same partition argument: no substring is owned by two states, and inside a state the owned lengths form a contiguous run of suffixes with no gaps. If the run had a gap the automaton would not be minimal.",
        "A suffix-array solution needs, for each length L, the count of adjacent pairs with LCP >= L, which turns into the same difference-array trick over the LCP values - useful as a cross-check on small inputs.",
        "Time: O(n * 26). Space: O(n * 26).",
      ],
    },
    {
      name: "Counting Patterns",
      difficulty: "Medium",
      variation: "Occurrence counts from endpos sizes",
      link: "https://cses.fi/problemset/task/2103",
      question: [
        "You are given a string s and k patterns. For each pattern report the number of positions at which it occurs in s. Occurrences may overlap.",
        "Example 1:\nInput:\nabaa\n3\na\naa\nab\nOutput:\n3\n1\n1\nExplanation: 'a' ends at positions 1, 3 and 4 of abaa. 'aa' occurs only at positions 3..4, and 'ab' only at 1..2.",
        "Example 2:\nInput:\naaa\n2\naa\nb\nOutput:\n2\n0\nExplanation: 'aa' occurs at 1..2 and 2..3, overlapping. 'b' does not occur at all.",
        "Constraints:\n- 1 <= |s| <= 10^5\n- 1 <= k <= 10^5\n- total length of all patterns <= 10^6\n- all strings consist of lowercase English letters",
      ],
      code: `struct SAM {
    vector<int> len, link;
    vector<array<int,26>> nxt;
    int last;
    SAM(int n = 0) {
        len.reserve(2 * n + 5); link.reserve(2 * n + 5); nxt.reserve(2 * n + 5);
        newNode(0, -1);
        last = 0;
    }
    int newNode(int l, int lk) {
        len.push_back(l);
        link.push_back(lk);
        array<int,26> a; a.fill(-1);
        nxt.push_back(a);
        return (int)len.size() - 1;
    }
    void extend(int c) {
        int cur = newNode(len[last] + 1, -1);
        int p = last;
        while (p != -1 && nxt[p][c] == -1) { nxt[p][c] = cur; p = link[p]; }
        if (p == -1) link[cur] = 0;
        else {
            int q = nxt[p][c];
            if (len[p] + 1 == len[q]) link[cur] = q;
            else {
                int cl = newNode(len[p] + 1, link[q]);
                nxt[cl] = nxt[q];
                link[q] = cl;
                link[cur] = cl;
                while (p != -1 && nxt[p][c] == q) { nxt[p][c] = cl; p = link[p]; }
            }
        }
        last = cur;
    }
    int size() const { return (int)len.size(); }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    int k;
    cin >> k;
    int n = (int)s.size();
    SAM sam(n);
    vector<long long> occ(2 * n + 5, 0);
    for (char ch : s) {
        sam.extend(ch - 'a');
        occ[sam.last] = 1;              // prefix states are the only ones seeded, clones get 0
    }
    int m = sam.size();
    vector<int> order(m - 1);
    for (int v = 1; v < m; v++) order[v - 1] = v;
    sort(order.begin(), order.end(), [&](int a, int b) { return sam.len[a] > sam.len[b]; });
    for (int v : order) occ[sam.link[v]] += occ[v];   // endpos sizes add up the link tree
    while (k--) {
        string p;
        cin >> p;
        int v = 0;
        bool ok = true;
        for (char ch : p) {
            int c = ch - 'a';
            if (sam.nxt[v][c] == -1) { ok = false; break; }
            v = sam.nxt[v][c];
        }
        cout << (ok ? occ[v] : 0) << "\\n";
    }
    return 0;
}`,
      explanation: [
        "The number of occurrences of a substring is the size of its endpos set, and every string in one state shares the same endpos set. So walk the pattern to its state and print that size - all patterns landing in the same state have the same count, which is exactly why the automaton is so compact.",
        "Endpos sizes come from one observation: endpos(v) is the disjoint union of endpos(u) over the children u of v in the suffix-link tree, plus the position i itself when v is the state of the prefix s[0..i]. So seed 1 on the |s| prefix states created as 'cur' during construction and push the values up the link tree.",
        "Clones must be seeded with 0, not 1. A clone represents strings that already existed before the split; giving it a 1 double counts one position for it and for every ancestor. This is the single most common bug in suffix-automaton occurrence counting, and it is invisible on tiny tests where no split happens.",
        "Sorting states by len descending is a valid topological order of the link tree because len[link[v]] < len[v] always holds; a counting sort over len makes the whole thing linear if the extra log matters.",
        "Time: O(n * 26 + n log n) to build and accumulate, O(|p|) per query. Space: O(n * 26).",
      ],
    },
    {
      name: "Substrings (SPOJ NSUBSTR)",
      difficulty: "Medium",
      variation: "Maximum occurrence count per length",
      link: "https://www.spoj.com/problems/NSUBSTR/",
      question: [
        "You are given a string S. Define F(x) as the maximum number of times that some substring of length x occurs in S. For every x from 1 to |S|, output F(x).",
        "Example 1:\nInput:\nababa\nOutput:\n3\n2\n2\n1\n1\nExplanation: 'a' occurs 3 times. Both length-2 substrings 'ab' and 'ba' occur twice. 'aba' occurs twice, at positions 1..3 and 3..5. Nothing longer repeats.",
        "Example 2:\nInput:\naaa\nOutput:\n3\n2\n1\nExplanation: 'a' occurs 3 times, 'aa' twice (overlapping), 'aaa' once.",
        "Constraints:\n- 1 <= |S| <= 250000\n- S consists of lowercase English letters",
      ],
      code: `struct SAM {
    vector<int> len, link;
    vector<array<int,26>> nxt;
    int last;
    SAM(int n = 0) {
        len.reserve(2 * n + 5); link.reserve(2 * n + 5); nxt.reserve(2 * n + 5);
        newNode(0, -1);
        last = 0;
    }
    int newNode(int l, int lk) {
        len.push_back(l);
        link.push_back(lk);
        array<int,26> a; a.fill(-1);
        nxt.push_back(a);
        return (int)len.size() - 1;
    }
    void extend(int c) {
        int cur = newNode(len[last] + 1, -1);
        int p = last;
        while (p != -1 && nxt[p][c] == -1) { nxt[p][c] = cur; p = link[p]; }
        if (p == -1) link[cur] = 0;
        else {
            int q = nxt[p][c];
            if (len[p] + 1 == len[q]) link[cur] = q;
            else {
                int cl = newNode(len[p] + 1, link[q]);
                nxt[cl] = nxt[q];
                link[q] = cl;
                link[cur] = cl;
                while (p != -1 && nxt[p][c] == q) { nxt[p][c] = cl; p = link[p]; }
            }
        }
        last = cur;
    }
    int size() const { return (int)len.size(); }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    int n = (int)s.size();
    SAM sam(n);
    vector<int> occ(2 * n + 5, 0);
    for (char ch : s) { sam.extend(ch - 'a'); occ[sam.last] = 1; }
    int m = sam.size();
    vector<int> order(m - 1);
    for (int v = 1; v < m; v++) order[v - 1] = v;
    sort(order.begin(), order.end(), [&](int a, int b) { return sam.len[a] > sam.len[b]; });
    for (int v : order) occ[sam.link[v]] += occ[v];
    vector<int> best(n + 2, 0);
    for (int v = 1; v < m; v++) best[sam.len[v]] = max(best[sam.len[v]], occ[v]);
    // a length-(L+1) string occurring c times forces some length-L string to occur >= c times
    for (int L = n - 1; L >= 1; L--) best[L] = max(best[L], best[L + 1]);
    for (int L = 1; L <= n; L++) cout << best[L] << "\\n";
    return 0;
}`,
      explanation: [
        "Build the automaton, compute endpos sizes exactly as in the occurrence-count problem, and record for each state the pair (len[v], occ[v]). That covers the longest string of every class.",
        "The shorter strings inside a class need no separate handling. If a string of length L + 1 occurs c times then its length-L prefix occurs at least c times, so a single backward sweep best[L] = max(best[L], best[L + 1]) propagates every candidate down to all shorter lengths at once. This is why seeding only len[v] per state is enough instead of the whole interval [len[link[v]] + 1, len[v]].",
        "The tempting mistake is to sweep upward instead of downward, or to seed the answer at len[link[v]] + 1. Both give a monotone-looking but wrong array: F is non-increasing in x, and only the downward sweep preserves that.",
        "Time: O(n * 26 + n log n). Space: O(n * 26).",
      ],
    },
    {
      name: "Repeating Substring",
      difficulty: "Medium",
      variation: "Longest substring occurring at least twice",
      link: "https://cses.fi/problemset/task/2106",
      question: [
        "You are given a string of length n. Find the longest substring that appears at least twice in it. Occurrences may overlap. If no such substring exists, print -1.",
        "Example 1:\nInput:\naabaa\nOutput:\naa\nExplanation: 'aa' occurs at positions 1..2 and 4..5. No length-3 substring repeats.",
        "Example 2:\nInput:\nabcd\nOutput:\n-1\nExplanation: Every substring of abcd is unique.",
        "Constraints:\n- 1 <= n <= 10^5\n- the string consists of lowercase English letters\n- if several answers exist, any one of them is accepted",
      ],
      code: `struct SAM {
    vector<int> len, link, fpos;
    vector<array<int,26>> nxt;
    int last;
    SAM(int n = 0) {
        len.reserve(2 * n + 5); link.reserve(2 * n + 5);
        fpos.reserve(2 * n + 5); nxt.reserve(2 * n + 5);
        newNode(0, -1, -1);
        last = 0;
    }
    int newNode(int l, int lk, int fp) {
        len.push_back(l);
        link.push_back(lk);
        fpos.push_back(fp);
        array<int,26> a; a.fill(-1);
        nxt.push_back(a);
        return (int)len.size() - 1;
    }
    void extend(int c) {
        int cur = newNode(len[last] + 1, -1, len[last]);   // this prefix ends at index len[last]
        int p = last;
        while (p != -1 && nxt[p][c] == -1) { nxt[p][c] = cur; p = link[p]; }
        if (p == -1) link[cur] = 0;
        else {
            int q = nxt[p][c];
            if (len[p] + 1 == len[q]) link[cur] = q;
            else {
                int cl = newNode(len[p] + 1, link[q], fpos[q]);   // clone inherits an end position
                nxt[cl] = nxt[q];
                link[q] = cl;
                link[cur] = cl;
                while (p != -1 && nxt[p][c] == q) { nxt[p][c] = cl; p = link[p]; }
            }
        }
        last = cur;
    }
    int size() const { return (int)len.size(); }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    int n = (int)s.size();
    SAM sam(n);
    vector<int> occ(2 * n + 5, 0);
    for (char ch : s) { sam.extend(ch - 'a'); occ[sam.last] = 1; }
    int m = sam.size();
    vector<int> order(m - 1);
    for (int v = 1; v < m; v++) order[v - 1] = v;
    sort(order.begin(), order.end(), [&](int a, int b) { return sam.len[a] > sam.len[b]; });
    for (int v : order) occ[sam.link[v]] += occ[v];
    int bestV = -1;
    for (int v = 1; v < m; v++) {
        if (occ[v] >= 2 && (bestV == -1 || sam.len[v] > sam.len[bestV])) bestV = v;
    }
    if (bestV == -1) { cout << -1 << "\\n"; return 0; }
    cout << s.substr(sam.fpos[bestV] - sam.len[bestV] + 1, sam.len[bestV]) << "\\n";
    return 0;
}`,
      explanation: [
        "A substring repeats iff its endpos set has size at least two, and all strings in a state share that set. So the answer length is max over states of len[v] subject to occ[v] >= 2, and only the longest string of a state ever needs checking - the shorter ones in the same class are strictly worse candidates with the same count.",
        "To print the substring rather than its length, store for every state one end position of one occurrence. A state created as cur ends at index len[last] of the string being built; a clone inherits the end position of the state it was split from, which is legal because their endpos sets intersect. Then the substring is s[fpos - len + 1 .. fpos].",
        "The naive alternative is binary search on the length plus hashing all windows, which is O(n log n) expected and can be defeated by anti-hash tests. The automaton answers exactly and deterministically in one pass.",
        "Do not forget the -1 case: when every substring is unique the automaton is a path-like structure where every state has occ == 1, and no candidate exists.",
        "Time: O(n * 26 + n log n). Space: O(n * 26).",
      ],
    },
    {
      name: "Longest Common Substring (SPOJ LCS)",
      difficulty: "Medium",
      variation: "Matching a second string against the automaton",
      link: "https://www.spoj.com/problems/LCS/",
      question: [
        "A string is a substring of another if it occurs as a contiguous block inside it. Given two strings, find the length of their longest common substring. If they share nothing, the answer is 0.",
        "Example 1:\nInput:\nalsdfkjfjkdsal\nfdjskalajfkdsla\nOutput:\n3\nExplanation: 'kds' occurs in both (at positions 10..12 of the first and 11..13 of the second). No common block of length 4 exists.",
        "Example 2:\nInput:\nabcde\ncdeab\nOutput:\n3\nExplanation: 'cde' is common; 'ab' is common too but shorter.",
        "Constraints:\n- 1 <= length of each string <= 250000\n- both strings consist of lowercase English letters",
      ],
      code: `struct SAM {
    vector<int> len, link;
    vector<array<int,26>> nxt;
    int last;
    SAM(int n = 0) {
        len.reserve(2 * n + 5); link.reserve(2 * n + 5); nxt.reserve(2 * n + 5);
        newNode(0, -1);
        last = 0;
    }
    int newNode(int l, int lk) {
        len.push_back(l);
        link.push_back(lk);
        array<int,26> a; a.fill(-1);
        nxt.push_back(a);
        return (int)len.size() - 1;
    }
    void extend(int c) {
        int cur = newNode(len[last] + 1, -1);
        int p = last;
        while (p != -1 && nxt[p][c] == -1) { nxt[p][c] = cur; p = link[p]; }
        if (p == -1) link[cur] = 0;
        else {
            int q = nxt[p][c];
            if (len[p] + 1 == len[q]) link[cur] = q;
            else {
                int cl = newNode(len[p] + 1, link[q]);
                nxt[cl] = nxt[q];
                link[q] = cl;
                link[cur] = cl;
                while (p != -1 && nxt[p][c] == q) { nxt[p][c] = cl; p = link[p]; }
            }
        }
        last = cur;
    }
    int size() const { return (int)len.size(); }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string a, b;
    cin >> a >> b;
    SAM sam((int)a.size());
    for (char ch : a) sam.extend(ch - 'a');
    int v = 0, l = 0, best = 0;
    for (char ch : b) {
        int c = ch - 'a';
        // drop the longest matched suffix until a c-transition exists
        while (v != 0 && sam.nxt[v][c] == -1) { v = sam.link[v]; l = sam.len[v]; }
        if (sam.nxt[v][c] != -1) { v = sam.nxt[v][c]; l++; }
        else { v = 0; l = 0; }
        best = max(best, l);
    }
    cout << best << "\\n";
    return 0;
}`,
      explanation: [
        "Build the automaton of the first string only, then stream the second string through it while maintaining a pair (v, l): v is the state reached and l is the length of the longest suffix of the prefix read so far that is a substring of the first string. The answer is the maximum l ever seen.",
        "The update is the automaton analogue of the KMP failure jump. If v has a c-transition, extend: l grows by one. Otherwise the current match is too long, so follow suffix links, which chops the match down to the longest strictly shorter suffix in a different class - and the correct new l is len[v] of that state, not l - 1, because a link jump can shorten the match by more than one character.",
        "Setting l = l - 1 on a link jump instead of l = len[v] is the classic bug here. It leaves l larger than the string actually spelled by v, so best can be overreported.",
        "Each character does one extension plus some link steps, and every link step strictly decreases l while an extension increases it by one, so the total number of link steps is bounded by the length of the second string.",
        "The alternative O(n * m) DP on a table of common suffix lengths is fine at n = 1000 but hopeless at 250000, and building a generalized suffix automaton of both strings is more machinery than this needs.",
        "Time: O((|a| + |b|) * 26). Space: O(|a| * 26).",
      ],
    },
    {
      name: "Substring Order I",
      difficulty: "Medium",
      variation: "k-th smallest distinct substring",
      link: "https://cses.fi/problemset/task/2108",
      question: [
        "You are given a string s and an integer k. Consider all distinct substrings of s sorted in lexicographic order, each counted once. Print the k-th substring in that order.",
        "Example 1:\nInput:\naabaa\n5\nOutput:\naabaa\nExplanation: The 11 distinct substrings in order are a, aa, aab, aaba, aabaa, ab, aba, abaa, b, ba, baa. The fifth is aabaa.",
        "Example 2:\nInput:\naabaa\n9\nOutput:\nb\nExplanation: Positions 6 to 8 of that list are ab, aba, abaa, so the ninth is b.",
        "Constraints:\n- 1 <= |s| <= 10^5\n- 1 <= k <= number of distinct substrings of s, which can reach about 5 * 10^9\n- s consists of lowercase English letters",
      ],
      code: `struct SAM {
    vector<int> len, link;
    vector<array<int,26>> nxt;
    int last;
    SAM(int n = 0) {
        len.reserve(2 * n + 5); link.reserve(2 * n + 5); nxt.reserve(2 * n + 5);
        newNode(0, -1);
        last = 0;
    }
    int newNode(int l, int lk) {
        len.push_back(l);
        link.push_back(lk);
        array<int,26> a; a.fill(-1);
        nxt.push_back(a);
        return (int)len.size() - 1;
    }
    void extend(int c) {
        int cur = newNode(len[last] + 1, -1);
        int p = last;
        while (p != -1 && nxt[p][c] == -1) { nxt[p][c] = cur; p = link[p]; }
        if (p == -1) link[cur] = 0;
        else {
            int q = nxt[p][c];
            if (len[p] + 1 == len[q]) link[cur] = q;
            else {
                int cl = newNode(len[p] + 1, link[q]);
                nxt[cl] = nxt[q];
                link[q] = cl;
                link[cur] = cl;
                while (p != -1 && nxt[p][c] == q) { nxt[p][c] = cl; p = link[p]; }
            }
        }
        last = cur;
    }
    int size() const { return (int)len.size(); }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    long long k;
    cin >> s >> k;
    SAM sam((int)s.size());
    for (char ch : s) sam.extend(ch - 'a');
    int m = sam.size();
    vector<int> order(m);
    for (int v = 0; v < m; v++) order[v] = v;
    // transitions always go to a strictly larger len, so this is a topological order
    sort(order.begin(), order.end(), [&](int a, int b) { return sam.len[a] > sam.len[b]; });
    vector<long long> f(m, 0);
    for (int v : order) {
        for (int c = 0; c < 26; c++) {
            int u = sam.nxt[v][c];
            if (u != -1) f[v] += 1 + f[u];   // the one-character string c, plus all extensions
        }
    }
    string res;
    int v = 0;
    while (k > 0) {
        for (int c = 0; c < 26; c++) {
            int u = sam.nxt[v][c];
            if (u == -1) continue;
            long long tot = 1 + f[u];
            if (k > tot) { k -= tot; continue; }   // whole c-subtree ranks before the answer
            res.push_back((char)('a' + c));
            k -= 1;
            v = u;
            break;
        }
    }
    cout << res << "\\n";
    return 0;
}`,
      explanation: [
        "Distinct substrings are exactly the non-empty paths from the initial state, and reading transitions in alphabet order makes a depth-first walk enumerate them in lexicographic order. So this is a rank-select on the transition DAG.",
        "Precompute f[v] = number of distinct non-empty strings spelled by paths starting at v: f[v] = sum over existing transitions v -> u of (1 + f[u]), where the 1 counts the single character itself. Since every transition strictly increases len, sorting states by len descending is a topological order and the DP is a single sweep.",
        "The descent is then standard. At state v, try characters in order; the block of substrings beginning with c has size 1 + f[nxt[v][c]]. If k exceeds it, subtract and move on; otherwise commit to c, spend one unit of k on the string that stops right here, and recurse into the child.",
        "Two traps: the counts overflow 32 bits (about 5 * 10^9 substrings at n = 10^5), and the automaton must be used rather than a trie of suffixes - the trie has O(n^2) nodes while the automaton has O(n), yet enumerates the same set of paths.",
        "Time: O(n * 26) to build and DP, O(|answer| * 26) to descend. Space: O(n * 26).",
      ],
    },
    {
      name: "Substring Order II",
      difficulty: "Hard",
      variation: "k-th substring counting repetitions",
      link: "https://cses.fi/problemset/task/2109",
      question: [
        "You are given a string s and an integer k. Consider all substrings of s sorted in lexicographic order, where a substring occurring several times is listed once per occurrence. Print the k-th substring in that order.",
        "Example 1:\nInput:\naabaa\n7\nOutput:\naab\nExplanation: aabaa has 15 substring occurrences. In order they are a, a, a, a, aa, aa, aab, aaba, aabaa, ab, aba, abaa, b, ba, baa. The seventh is aab.",
        "Example 2:\nInput:\naabaa\n13\nOutput:\nb\nExplanation: The four copies of 'a' fill ranks 1 to 4 and the two copies of 'aa' fill 5 and 6, pushing 'b' to rank 13.",
        "Constraints:\n- 1 <= |s| <= 10^5\n- 1 <= k <= |s| * (|s| + 1) / 2, which can reach about 5 * 10^9\n- s consists of lowercase English letters",
      ],
      code: `struct SAM {
    vector<int> len, link;
    vector<array<int,26>> nxt;
    int last;
    SAM(int n = 0) {
        len.reserve(2 * n + 5); link.reserve(2 * n + 5); nxt.reserve(2 * n + 5);
        newNode(0, -1);
        last = 0;
    }
    int newNode(int l, int lk) {
        len.push_back(l);
        link.push_back(lk);
        array<int,26> a; a.fill(-1);
        nxt.push_back(a);
        return (int)len.size() - 1;
    }
    void extend(int c) {
        int cur = newNode(len[last] + 1, -1);
        int p = last;
        while (p != -1 && nxt[p][c] == -1) { nxt[p][c] = cur; p = link[p]; }
        if (p == -1) link[cur] = 0;
        else {
            int q = nxt[p][c];
            if (len[p] + 1 == len[q]) link[cur] = q;
            else {
                int cl = newNode(len[p] + 1, link[q]);
                nxt[cl] = nxt[q];
                link[q] = cl;
                link[cur] = cl;
                while (p != -1 && nxt[p][c] == q) { nxt[p][c] = cl; p = link[p]; }
            }
        }
        last = cur;
    }
    int size() const { return (int)len.size(); }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    long long k;
    cin >> s >> k;
    int n = (int)s.size();
    SAM sam(n);
    vector<long long> occ(2 * n + 5, 0);
    for (char ch : s) { sam.extend(ch - 'a'); occ[sam.last] = 1; }
    int m = sam.size();
    vector<int> order(m);
    for (int v = 0; v < m; v++) order[v] = v;
    sort(order.begin(), order.end(), [&](int a, int b) { return sam.len[a] > sam.len[b]; });
    for (int v : order) if (v != 0) occ[sam.link[v]] += occ[v];
    vector<long long> f(m, 0);
    for (int v : order) {
        for (int c = 0; c < 26; c++) {
            int u = sam.nxt[v][c];
            if (u != -1) f[v] += occ[u] + f[u];   // occ[u] copies stop here, f[u] continue
        }
    }
    string res;
    int v = 0;
    while (true) {
        for (int c = 0; c < 26; c++) {
            int u = sam.nxt[v][c];
            if (u == -1) continue;
            long long tot = occ[u] + f[u];
            if (k > tot) { k -= tot; continue; }
            res.push_back((char)('a' + c));
            k -= occ[u];
            v = u;
            break;
        }
        if (k <= 0) break;
    }
    cout << res << "\\n";
    return 0;
}`,
      explanation: [
        "This is the previous problem with multiplicities, so every path is weighted by how many times its string occurs. Compute endpos sizes occ[v] up the link tree first, then f[v] = sum over transitions v -> u of (occ[u] + f[u]): reaching u accounts for occ[u] listings of the string that ends there, plus f[u] listings of everything longer.",
        "The descent mirrors that split. At state v with remaining rank k, the block of listings beginning with character c has total weight occ[u] + f[u]. If k is larger, skip the block. Otherwise subtract only occ[u] - the copies of the string that terminates at u - and if k is still positive the answer is strictly longer, so descend into u.",
        "The correctness hinges on the two counts staying separate. Subtracting occ[u] + f[u] before the comparison, or subtracting 1 as in the distinct-substrings version, misplaces the boundary between 'the answer ends here' and 'the answer continues'.",
        "Sums reach n * (n + 1) / 2, about 5 * 10^9, so f, occ and k are all 64-bit. And clones must again be seeded with occ 0 or every count inflates.",
        "Time: O(n * 26 + n log n). Space: O(n * 26).",
      ],
    },
    {
      name: "Fake News (hard)",
      difficulty: "Hard",
      variation: "Self-similarity: sum of squared occurrence counts",
      link: "https://codeforces.com/problemset/problem/802/I",
      question: [
        "For a string s, define its self-similarity as the sum over all non-empty strings p of the square of the number of occurrences of p in s. Since only substrings of s contribute, this is the sum of cnt(p)^2 over all distinct substrings p of s. Given several strings, output the self-similarity of each.",
        "Example 1:\nInput:\n4\naa\nabcd\nccc\nabcc\nOutput:\n5\n10\n14\n12\nExplanation: For 'aa', p = a occurs twice and p = aa once, giving 4 + 1 = 5. For 'ccc' the counts are 3, 2, 1, giving 9 + 4 + 1 = 14. For 'abcd' every substring is unique, so the answer is just the number of substrings, 4 + 3 + 2 + 1 = 10.",
        "Example 2:\nInput:\n1\nabab\nOutput:\n16\nExplanation: The distinct substrings with their counts are a(2), b(2), ab(2), ba(1), aba(1), bab(1), abab(1), so the sum is 4 + 4 + 4 + 1 + 1 + 1 + 1 = 16.",
        "Constraints:\n- 1 <= number of test cases <= 10\n- 1 <= |s| <= 100000\n- s consists of lowercase English letters\n- the answer needs 64-bit arithmetic",
      ],
      code: `struct SAM {
    vector<int> len, link;
    vector<array<int,26>> nxt;
    int last;
    SAM(int n = 0) {
        len.reserve(2 * n + 5); link.reserve(2 * n + 5); nxt.reserve(2 * n + 5);
        newNode(0, -1);
        last = 0;
    }
    int newNode(int l, int lk) {
        len.push_back(l);
        link.push_back(lk);
        array<int,26> a; a.fill(-1);
        nxt.push_back(a);
        return (int)len.size() - 1;
    }
    void extend(int c) {
        int cur = newNode(len[last] + 1, -1);
        int p = last;
        while (p != -1 && nxt[p][c] == -1) { nxt[p][c] = cur; p = link[p]; }
        if (p == -1) link[cur] = 0;
        else {
            int q = nxt[p][c];
            if (len[p] + 1 == len[q]) link[cur] = q;
            else {
                int cl = newNode(len[p] + 1, link[q]);
                nxt[cl] = nxt[q];
                link[q] = cl;
                link[cur] = cl;
                while (p != -1 && nxt[p][c] == q) { nxt[p][c] = cl; p = link[p]; }
            }
        }
        last = cur;
    }
    int size() const { return (int)len.size(); }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int T;
    if (!(cin >> T)) return 0;
    while (T--) {
        string s;
        cin >> s;
        int n = (int)s.size();
        SAM sam(n);
        vector<long long> occ(2 * n + 5, 0);
        for (char ch : s) { sam.extend(ch - 'a'); occ[sam.last] = 1; }
        int m = sam.size();
        vector<int> order(m - 1);
        for (int v = 1; v < m; v++) order[v - 1] = v;
        sort(order.begin(), order.end(), [&](int a, int b) { return sam.len[a] > sam.len[b]; });
        for (int v : order) occ[sam.link[v]] += occ[v];
        long long ans = 0;
        // every string in state v shares occ[v], and v owns len[v] - len[link[v]] of them
        for (int v = 1; v < m; v++) {
            ans += occ[v] * occ[v] * (sam.len[v] - sam.len[sam.link[v]]);
        }
        cout << ans << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Only substrings of s have a non-zero count, so the infinite sum collapses to a sum over distinct substrings. Grouping those substrings by state is what makes it linear: all strings inside one state have identical endpos sets, hence identical counts.",
        "State v therefore contributes occ[v]^2 once for each of the len[v] - len[link[v]] strings it owns. Multiply, add over all states except the initial one, done. This is the distinct-substring count formula with each term weighted by the squared occurrence count.",
        "The wrong-but-tempting reading is to sum occ[v]^2 once per state. That undercounts badly whenever a class holds several lengths - for 'abcd' it would return 4 instead of 10, since the single long chain of states owns many lengths each.",
        "Counts multiply up fast: occ can be n and there are O(n) distinct lengths, so the total is around n^3 in the worst case for n = 10^5 patterns like 'aaaa...a'. Verify: for all-a of length n the answer is sum of i^2 for i = 1..n, about 3.3 * 10^14 - comfortably inside a signed 64-bit integer but far outside 32 bits.",
        "Time: O(n * 26 + n log n) per test case. Space: O(n * 26).",
      ],
    },
    {
      name: "Longest Common Substring II (SPOJ LCS2)",
      difficulty: "Hard",
      variation: "Longest common substring of many strings",
      link: "https://www.spoj.com/problems/LCS2/",
      question: [
        "You are given at most 10 strings, one per line. Find the length of the longest string that is a substring of every one of them. Print 0 if there is no common substring.",
        "Example 1:\nInput:\nalsdfkjfjkdsal\nfdjskalajfkdsla\naaaajfaaaa\nOutput:\n2\nExplanation: 'jf' occurs in all three. Nothing of length 3 does - the third string only contains ajf, jfa and runs of a, and neither ajf nor jfa occurs in the first string.",
        "Example 2:\nInput:\nabcabc\nbcabcd\ndbcab\nOutput:\n4\nExplanation: 'bcab' occurs in all three strings, at positions 2..5, 1..4 and 2..5 respectively.",
        "Constraints:\n- 1 <= number of strings <= 10\n- 1 <= length of each string <= 100000\n- all strings consist of lowercase English letters",
      ],
      code: `struct SAM {
    vector<int> len, link;
    vector<array<int,26>> nxt;
    int last;
    SAM(int n = 0) {
        len.reserve(2 * n + 5); link.reserve(2 * n + 5); nxt.reserve(2 * n + 5);
        newNode(0, -1);
        last = 0;
    }
    int newNode(int l, int lk) {
        len.push_back(l);
        link.push_back(lk);
        array<int,26> a; a.fill(-1);
        nxt.push_back(a);
        return (int)len.size() - 1;
    }
    void extend(int c) {
        int cur = newNode(len[last] + 1, -1);
        int p = last;
        while (p != -1 && nxt[p][c] == -1) { nxt[p][c] = cur; p = link[p]; }
        if (p == -1) link[cur] = 0;
        else {
            int q = nxt[p][c];
            if (len[p] + 1 == len[q]) link[cur] = q;
            else {
                int cl = newNode(len[p] + 1, link[q]);
                nxt[cl] = nxt[q];
                link[q] = cl;
                link[cur] = cl;
                while (p != -1 && nxt[p][c] == q) { nxt[p][c] = cl; p = link[p]; }
            }
        }
        last = cur;
    }
    int size() const { return (int)len.size(); }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string first;
    if (!(cin >> first)) return 0;
    SAM sam((int)first.size());
    for (char ch : first) sam.extend(ch - 'a');
    int m = sam.size();
    vector<int> order(m);
    for (int v = 0; v < m; v++) order[v] = v;
    sort(order.begin(), order.end(), [&](int x, int y) { return sam.len[x] > sam.len[y]; });
    vector<int> best(m);
    for (int v = 0; v < m; v++) best[v] = sam.len[v];   // start optimistic, then intersect
    string t;
    while (cin >> t) {
        vector<int> cur(m, 0);
        int v = 0, l = 0;
        for (char ch : t) {
            int c = ch - 'a';
            while (v != 0 && sam.nxt[v][c] == -1) { v = sam.link[v]; l = sam.len[v]; }
            if (sam.nxt[v][c] != -1) { v = sam.nxt[v][c]; l++; }
            else { v = 0; l = 0; }
            cur[v] = max(cur[v], l);
        }
        for (int u : order) {                    // longest len first, so children before parents
            if (u == 0) continue;
            int p = sam.link[u];
            cur[p] = max(cur[p], min(sam.len[p], cur[u]));
        }
        for (int u = 0; u < m; u++) best[u] = min(best[u], cur[u]);
    }
    int ans = 0;
    for (int u = 1; u < m; u++) ans = max(ans, best[u]);
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "Build the automaton of the first string once. Any common substring is a substring of that string, so it is spelled by some path and lives in some state. For each remaining string, compute cur[v] = the length of the longest string of state v that also occurs in that string, then keep the running minimum in best[v]. The answer is the largest best over all non-initial states.",
        "The matching walk is the two-string LCS walk, but recording the match length at the state it landed in. That alone is not enough: a match of length l ending in state v also witnesses matches for every ancestor of v in the link tree, capped at that ancestor's own len. Hence the propagation cur[link[u]] = max(cur[link[u]], min(len[link[u]], cur[u])) processed in order of decreasing len, which visits every child before its parent.",
        "Skipping that propagation is the standard failure: the answer comes out too small because the state actually holding the common substring was never touched by the walk. Forgetting the min with len[parent] is the opposite error - it credits a parent with a longer string than it owns and overreports.",
        "best[v] starts at len[v], the longest string v can possibly represent, and is intersected with each string in turn, so a state surviving with best[v] = L means some length-L string of that class occurs in every input. Since the strings of a class are nested suffixes, that L is realisable.",
        "Time: O(sum of lengths * 26 + k * n log n) for k strings. Space: O(n * 26).",
      ],
    },
    {
      name: "Cyclical Quest",
      difficulty: "Hard",
      variation: "Occurrences of all cyclic shifts",
      link: "https://codeforces.com/problemset/problem/235/C",
      question: [
        "You are given a text s and n queries. Each query is a string x. For each query, count the total number of positions in s where some cyclic shift of x occurs. Cyclic shifts that are equal as strings must be counted only once, so if x is periodic the repeated shifts contribute once each.",
        "Example 1:\nInput:\nbaabaabaaa\n5\na\nba\nbaa\naabaa\naaba\nOutput:\n7\n5\n7\n3\n5\nExplanation: 'a' has one shift, occurring 7 times. 'ba' has shifts ba (3 times) and ab (2 times), total 5. 'aabaa' has 5 distinct shifts, of which aabaa occurs twice and abaaa once, total 3.",
        "Example 2:\nInput:\naaaa\n2\naa\nab\nOutput:\n3\n0\nExplanation: Both shifts of 'aa' are the string aa, counted once, and it occurs 3 times in aaaa. No shift of 'ab' occurs in aaaa.",
        "Constraints:\n- 1 <= |s| <= 10^6\n- 1 <= n <= 10^5\n- total length of all queries <= 10^6\n- all strings consist of lowercase English letters",
      ],
      code: `struct SAM {
    vector<int> len, link;
    vector<array<int,26>> nxt;
    int last;
    SAM(int n = 0) {
        len.reserve(2 * n + 5); link.reserve(2 * n + 5); nxt.reserve(2 * n + 5);
        newNode(0, -1);
        last = 0;
    }
    int newNode(int l, int lk) {
        len.push_back(l);
        link.push_back(lk);
        array<int,26> a; a.fill(-1);
        nxt.push_back(a);
        return (int)len.size() - 1;
    }
    void extend(int c) {
        int cur = newNode(len[last] + 1, -1);
        int p = last;
        while (p != -1 && nxt[p][c] == -1) { nxt[p][c] = cur; p = link[p]; }
        if (p == -1) link[cur] = 0;
        else {
            int q = nxt[p][c];
            if (len[p] + 1 == len[q]) link[cur] = q;
            else {
                int cl = newNode(len[p] + 1, link[q]);
                nxt[cl] = nxt[q];
                link[q] = cl;
                link[cur] = cl;
                while (p != -1 && nxt[p][c] == q) { nxt[p][c] = cl; p = link[p]; }
            }
        }
        last = cur;
    }
    int size() const { return (int)len.size(); }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    int n = (int)s.size();
    SAM sam(n);
    vector<long long> occ(2 * n + 5, 0);
    for (char ch : s) { sam.extend(ch - 'a'); occ[sam.last] = 1; }
    int m = sam.size();
    vector<int> order(m - 1);
    for (int v = 1; v < m; v++) order[v - 1] = v;
    sort(order.begin(), order.end(), [&](int a, int b) { return sam.len[a] > sam.len[b]; });
    for (int v : order) occ[sam.link[v]] += occ[v];
    int q;
    cin >> q;
    vector<char> seen(m, 0);
    while (q--) {
        string x;
        cin >> x;
        int L = (int)x.size();
        long long ans = 0;
        vector<int> touched;
        int v = 0, l = 0;
        for (int i = 0; i < 2 * L - 1; i++) {      // walk x twice: every shift is a window
            int c = x[i % L] - 'a';
            while (v != 0 && sam.nxt[v][c] == -1) { v = sam.link[v]; l = sam.len[v]; }
            if (sam.nxt[v][c] != -1) { v = sam.nxt[v][c]; l++; }
            else { v = 0; l = 0; }
            if (l > L) {                            // shrink the window back to exactly L
                while (sam.len[sam.link[v]] >= L) v = sam.link[v];
                l = L;
            }
            if (l == L && i >= L - 1 && !seen[v]) {
                seen[v] = 1;
                touched.push_back(v);
                ans += occ[v];
            }
        }
        for (int u : touched) seen[u] = 0;          // reset only what was set
        cout << ans << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Every cyclic shift of x is a length-L window of x + x, so streaming x twice through the automaton of s while keeping a window of exactly L characters visits all L shifts in order. The state reached after a full window is the state of that shift, and occ of that state is its number of occurrences in s.",
        "Two mechanics keep the window at length L. Growing is the usual match walk: extend when the transition exists, otherwise follow suffix links resetting l to len[v]. Shrinking happens when l exceeds L: climb suffix links while len[link[v]] >= L, which lands on the unique state whose length interval contains L, then set l = L. Climbing one link too far would drop below L and undercount.",
        "Deduplication is where this problem bites. A state plus a length determines a unique string, so two distinct shifts of the same length always land in distinct states - therefore marking visited states is exactly the right way to count each distinct shift once. Counting all L windows instead would multiply the answer by the number of periods for a periodic query like 'aa'.",
        "The seen array must be cleared per query, but only at the positions actually touched: a full clear of a 2 * 10^6 entry array for each of 10^5 queries is quadratic and times out even though the logic is right.",
        "Finally, only windows with i >= L - 1 are complete; the first L - 1 iterations are just filling the window and must not be counted.",
        "Time: O(|s| * 26) to build plus O(|x| * 26) per query. Space: O(|s| * 26).",
      ],
    },
  ],
};
