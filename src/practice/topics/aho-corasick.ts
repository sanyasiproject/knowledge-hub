import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Aho-Corasick Algorithm for Pattern Searching",
      difficulty: "Easy",
      variation: "Build the automaton, report all occurrences",
      link: "https://www.geeksforgeeks.org/aho-corasick-algorithm-pattern-searching/",
      question: [
        "Given a text and a dictionary of words, report every occurrence of every word inside the text in a single left-to-right pass over the text. Return a list per word holding the 0-based starting indices of its occurrences, in increasing order; a word that never occurs gets an empty list. Words may be prefixes of one another and occurrences may overlap.",
        "Example 1:\nInput: text = 'ahishers', words = ['he', 'she', 'hers', 'his']\nOutput: [[4], [3], [4], [1]]\nExplanation: text[4..5] = 'he', text[3..5] = 'she', text[4..7] = 'hers', text[1..3] = 'his'. Note that 'she', 'he' and 'hers' overlap and are all reported.",
        "Example 2:\nInput: text = 'aaaa', words = ['a', 'aa', 'aaa']\nOutput: [[0,1,2,3], [0,1,2], [0,1]]\nExplanation: every window of the matching length is an occurrence.",
        "Constraints:\n- 1 <= text.length <= 10^6\n- 1 <= words.length <= 10^5\n- total length of all words <= 10^6\n- text and words contain lowercase letters a-z only",
      ],
      code: `struct AhoCorasick {
    static const int K = 26;
    vector<array<int,K>> go;      // after build(), a complete DFA transition table
    vector<int> link;             // suffix link: longest proper suffix that is a trie node
    vector<int> exitLink;         // nearest proper suffix that is a whole word
    vector<vector<int>> out;      // ids of words ending exactly at this node

    AhoCorasick() { newNode(); }

    int newNode() {
        array<int,K> row;
        row.fill(-1);
        go.push_back(row);
        link.push_back(0);
        exitLink.push_back(0);
        out.push_back({});
        return (int)go.size() - 1;
    }

    void add(const string& s, int id) {
        int v = 0;
        for (char ch : s) {
            int c = ch - 'a';
            if (go[v][c] == -1) go[v][c] = newNode();
            v = go[v][c];
        }
        out[v].push_back(id);
    }

    void build() {
        queue<int> q;
        for (int c = 0; c < K; c++) {
            int u = go[0][c];
            if (u == -1) go[0][c] = 0;         // missing root edge loops back to root
            else { link[u] = 0; q.push(u); }
        }
        while (!q.empty()) {
            int v = q.front(); q.pop();
            // link[v] is shallower, so its row and exitLink are already final
            exitLink[v] = out[link[v]].empty() ? exitLink[link[v]] : link[v];
            for (int c = 0; c < K; c++) {
                int u = go[v][c];
                if (u == -1) go[v][c] = go[link[v]][c];   // fall back through the suffix link
                else { link[u] = go[link[v]][c]; q.push(u); }
            }
        }
    }
};

vector<vector<int>> searchWords(vector<string>& words, const string& text) {
    AhoCorasick ac;
    for (int i = 0; i < (int)words.size(); i++) ac.add(words[i], i);
    ac.build();
    vector<vector<int>> res(words.size());
    int v = 0;
    for (int i = 0; i < (int)text.size(); i++) {
        v = ac.go[v][text[i] - 'a'];
        for (int w = v; w; w = ac.exitLink[w])       // every word ending at i
            for (int id : ac.out[w]) res[id].push_back(i - (int)words[id].size() + 1);
    }
    return res;
}`,
      explanation: [
        "The state is a single trie node: after reading text[0..i] the automaton sits on the node spelling the longest dictionary prefix that is also a suffix of what has been read. That is the whole invariant, and it is what makes one pass enough for all words at once.",
        "Maintaining it needs the suffix link. When the current node has no child for the next character, the correct next state is the child of the longest strictly shorter suffix, which is exactly go[link[v]][c]. Because BFS processes nodes in order of increasing depth, link[v] is finished before v, so filling the missing entries with go[link[v]][c] turns the trie into a complete DFA and every step becomes a single array lookup.",
        "Reporting is a separate concern from stepping. A node encodes the longest match ending here, but shorter dictionary words that are suffixes of it also end here ('he' inside 'she'). Walking suffix links one by one to find them can cost O(depth) per character; the exit link skips straight from one terminal ancestor to the next, so the reporting cost is proportional to the number of matches actually produced.",
        "The tempting wrong approach is to run KMP once per word. That is O(words * text) and blows up on large dictionaries, and the naive 'search each word with find()' is worse. The other classic bug is forgetting the go[0][c] = 0 self-loops, which leaves -1 in the table and crashes on the first unmatched character.",
        "Time: O(total word length * 26) to build, O(text length + number of matches) to search. Space: O(total word length * 26).",
      ],
    },
    {
      name: "String Matching in an Array",
      difficulty: "Easy",
      variation: "Dictionary against dictionary, containment",
      link: "https://leetcode.com/problems/string-matching-in-an-array/",
      question: [
        "You are given an array of distinct strings words. Return every string in words that is a substring of some other string in words. The answer may be returned in any order.",
        "Example 1:\nInput: words = ['mass','as','hero','superhero']\nOutput: ['as','hero']\nExplanation: 'as' occurs inside 'mass' and 'hero' occurs inside 'superhero'. 'mass' and 'superhero' are not substrings of anything else.",
        "Example 2:\nInput: words = ['leetcode','et','code']\nOutput: ['et','code']\nExplanation: both 'et' and 'code' occur inside 'leetcode'.",
        "Constraints:\n- 1 <= words.length <= 100\n- 1 <= words[i].length <= 30\n- all strings in words are distinct and consist of lowercase letters",
      ],
      code: `class Solution {
    static const int K = 26;
    vector<array<int,K>> go;
    vector<int> link, exitLink;
    vector<vector<int>> out;

    int newNode() {
        array<int,K> row;
        row.fill(-1);
        go.push_back(row);
        link.push_back(0);
        exitLink.push_back(0);
        out.push_back({});
        return (int)go.size() - 1;
    }

public:
    vector<string> stringMatching(vector<string>& words) {
        go.clear(); link.clear(); exitLink.clear(); out.clear();
        newNode();
        int n = words.size();
        for (int i = 0; i < n; i++) {
            int v = 0;
            for (char ch : words[i]) {
                int c = ch - 'a';
                if (go[v][c] == -1) go[v][c] = newNode();
                v = go[v][c];
            }
            out[v].push_back(i);
        }
        queue<int> q;
        for (int c = 0; c < K; c++) {
            int u = go[0][c];
            if (u == -1) go[0][c] = 0;
            else { link[u] = 0; q.push(u); }
        }
        while (!q.empty()) {
            int v = q.front(); q.pop();
            exitLink[v] = out[link[v]].empty() ? exitLink[link[v]] : link[v];
            for (int c = 0; c < K; c++) {
                int u = go[v][c];
                if (u == -1) go[v][c] = go[link[v]][c];
                else { link[u] = go[link[v]][c]; q.push(u); }
            }
        }
        vector<char> isSub(n, 0);
        for (int i = 0; i < n; i++) {          // feed each word back in as the text
            int v = 0;
            for (char ch : words[i]) {
                v = go[v][ch - 'a'];
                for (int w = v; w; w = exitLink[w])
                    for (int id : out[w])
                        if (id != i) isSub[id] = 1;   // id != i skips the word matching itself
            }
        }
        vector<string> res;
        for (int i = 0; i < n; i++) if (isSub[i]) res.push_back(words[i]);
        return res;
    }
};`,
      explanation: [
        "The dictionary and the set of texts are the same collection here, so build the automaton once over all words and then stream each word through it. Any word id reported while scanning word i, other than i itself, is a substring of word i.",
        "The id != i guard is the only delicate part: every word trivially matches itself when it is used as the text, and without the guard every string would be marked. The guard is safe precisely because the problem promises the strings are distinct - with duplicates allowed you would instead have to count how many ids sit at a terminal node and mark when that count exceeds one.",
        "Marking the found id rather than the current text is the right direction. A single pass over word i can reveal several contained words at once, and a word can be contained in many others, so a boolean per word collapses all of that without any deduplication step.",
        "At these constraints the brute force of 100 * 100 calls to find() also passes; the point of the automaton version is that it keeps working when the dictionary and the texts grow, since it is linear in the total input rather than quadratic in the number of strings.",
        "Time: O(total length * 26) to build plus O(total length + matches) to scan. Space: O(total length * 26).",
      ],
    },
    {
      name: "Finding Patterns",
      difficulty: "Medium",
      variation: "Existence query per pattern, suffix-link tree",
      link: "https://cses.fi/problemset/task/2102",
      question: [
        "You are given a string s and k patterns. For each pattern, print YES if it appears as a substring of s and NO otherwise.",
        "Example 1:\nInput:\naybabtu\n3\nbab\nabc\nab\nOutput:\nYES\nNO\nYES\nExplanation: 'bab' is s[2..4] and 'ab' is s[3..4], while 'abc' never occurs.",
        "Example 2:\nInput:\naaa\n2\naaaa\naa\nOutput:\nNO\nYES\nExplanation: 'aaaa' is longer than s, so it cannot occur; 'aa' occurs twice.",
        "Constraints:\n- 1 <= |s| <= 10^5\n- 1 <= k <= 10^5\n- total length of all patterns <= 10^6\n- all strings consist of lowercase letters a-z",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    int k;
    cin >> s >> k;
    vector<array<int,26>> go(1);
    go[0].fill(-1);
    vector<int> link(1, 0);
    vector<int> term(k);
    for (int i = 0; i < k; i++) {
        string p;
        cin >> p;
        int v = 0;
        for (char ch : p) {
            int c = ch - 'a';
            if (go[v][c] == -1) {
                array<int,26> row;
                row.fill(-1);
                go.push_back(row);
                link.push_back(0);
                go[v][c] = (int)go.size() - 1;
            }
            v = go[v][c];
        }
        term[i] = v;                // several equal patterns share one terminal node
    }
    vector<int> order;              // BFS order = nodes sorted by depth
    queue<int> q;
    for (int c = 0; c < 26; c++) {
        int u = go[0][c];
        if (u == -1) go[0][c] = 0;
        else { link[u] = 0; order.push_back(u); q.push(u); }
    }
    while (!q.empty()) {
        int v = q.front(); q.pop();
        for (int c = 0; c < 26; c++) {
            int u = go[v][c];
            if (u == -1) go[v][c] = go[link[v]][c];
            else { link[u] = go[link[v]][c]; order.push_back(u); q.push(u); }
        }
    }
    vector<char> seen(go.size(), 0);
    int v = 0;
    for (char ch : s) {
        v = go[v][ch - 'a'];
        seen[v] = 1;                // this node was reached at least once
    }
    for (int i = (int)order.size() - 1; i >= 0; i--) {
        int u = order[i];           // deepest first, so marks flow up the suffix-link tree
        if (seen[u]) seen[link[u]] = 1;
    }
    for (int i = 0; i < k; i++) cout << (seen[term[i]] ? "YES" : "NO") << "\\n";
    return 0;
}`,
      explanation: [
        "A pattern p occurs in s if and only if, at some position, the automaton state was a node whose suffix-link chain passes through p's terminal node. Equivalently: p occurs iff some node of p's subtree in the suffix-link tree was visited during the scan. So the scan only needs to set one flag per position, and the answer to every query is read off afterwards.",
        "Pushing the flags up the suffix-link tree is what turns 'visited somewhere below' into 'visited'. Suffix links always point to a strictly shallower node, so the BFS order is a topological order of that tree; iterating it backwards guarantees a node is processed only after everything below it, and one OR per node does the whole propagation.",
        "The wrong-but-tempting version marks only the terminal nodes you land on exactly. That misses every pattern that is a proper suffix of a longer dictionary word, for example 'ab' when the walk ended on 'bab' - which is the failure the sample above is built to catch.",
        "Walking the suffix links character by character to check terminals instead is correct but can degenerate to O(|s| * depth). The offline flag-and-propagate version is strictly linear and is why this scales at k = 10^5 queries.",
        "Memory is the real constraint at 10^6 total pattern length: a full 26-way row per node is about 100 bytes per node. If that is too tight, drop the goto table and traverse via suffix links with a hash map of children instead, trading a constant factor of time for space.",
        "Time: O(total pattern length * 26 + |s| + k). Space: O(total pattern length * 26).",
      ],
    },
    {
      name: "Counting Patterns",
      difficulty: "Medium",
      variation: "Occurrence count per pattern, subtree sums",
      link: "https://cses.fi/problemset/task/2103",
      question: [
        "You are given a string s and k patterns. For each pattern, print the number of positions of s where it occurs. Occurrences may overlap.",
        "Example 1:\nInput:\naybabtu\n3\nbab\nab\nb\nOutput:\n1\n1\n2\nExplanation: 'bab' occurs once at index 2, 'ab' once at index 3, and 'b' at indices 2 and 4.",
        "Example 2:\nInput:\naaaa\n2\na\naa\nOutput:\n4\n3\nExplanation: 'a' occurs at 0,1,2,3 and 'aa' at 0,1,2.",
        "Constraints:\n- 1 <= |s| <= 10^5\n- 1 <= k <= 10^5\n- total length of all patterns <= 10^6\n- all strings consist of lowercase letters a-z",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    int k;
    cin >> s >> k;
    vector<array<int,26>> go(1);
    go[0].fill(-1);
    vector<int> link(1, 0);
    vector<int> term(k);
    for (int i = 0; i < k; i++) {
        string p;
        cin >> p;
        int v = 0;
        for (char ch : p) {
            int c = ch - 'a';
            if (go[v][c] == -1) {
                array<int,26> row;
                row.fill(-1);
                go.push_back(row);
                link.push_back(0);
                go[v][c] = (int)go.size() - 1;
            }
            v = go[v][c];
        }
        term[i] = v;
    }
    vector<int> order;
    queue<int> q;
    for (int c = 0; c < 26; c++) {
        int u = go[0][c];
        if (u == -1) go[0][c] = 0;
        else { link[u] = 0; order.push_back(u); q.push(u); }
    }
    while (!q.empty()) {
        int v = q.front(); q.pop();
        for (int c = 0; c < 26; c++) {
            int u = go[v][c];
            if (u == -1) go[v][c] = go[link[v]][c];
            else { link[u] = go[link[v]][c]; order.push_back(u); q.push(u); }
        }
    }
    vector<long long> cnt(go.size(), 0);
    int v = 0;
    for (char ch : s) {
        v = go[v][ch - 'a'];
        cnt[v]++;                   // one visit contributes to every suffix of this node
    }
    for (int i = (int)order.size() - 1; i >= 0; i--) {
        int u = order[i];
        cnt[link[u]] += cnt[u];     // subtree sum in the suffix-link tree
    }
    for (int i = 0; i < k; i++) cout << cnt[term[i]] << "\\n";
    return 0;
}`,
      explanation: [
        "Same machinery as the existence version, but the flag becomes a counter. cnt[v] after the scan is the number of positions where the longest dictionary prefix matched was exactly v; the number of occurrences of the string spelled by v is the sum of cnt over v's whole subtree in the suffix-link tree, because a visit to a deeper node means every suffix of that node's string also ended there.",
        "Reverse BFS order makes the subtree sum a single linear pass: each node adds its accumulated total into its parent exactly once, and no node is read before all of its children have contributed.",
        "Duplicate patterns are handled for free. Two identical query strings land on the same terminal node and both read the same count, so no deduplication or map is needed - just remember which node each query ended on.",
        "The trap is trying to count during the scan by walking suffix links and incrementing every terminal ancestor. That is correct but quadratic in the worst case (s = 'aaaa...' with patterns 'a', 'aa', 'aaa', ...), which is exactly the case the judge tests. Counts fit in 32 bits here since no pattern can occur more than |s| times, but summing into 64-bit costs nothing and removes the question.",
        "Time: O(total pattern length * 26 + |s| + k). Space: O(total pattern length * 26).",
      ],
    },
    {
      name: "Add Bold Tag in String",
      difficulty: "Medium",
      variation: "Union of match intervals",
      link: "https://leetcode.com/problems/add-bold-tag-in-string/",
      question: [
        "Given a string s and an array of strings words, wrap the substrings of s that occur in words with the tags <b> and </b>. If two such substrings overlap, wrap them together with one pair of tags. If two wrapped substrings are consecutive, combine them into one pair of tags. Return s after adding the tags.",
        "Example 1:\nInput: s = 'abcxyz123', words = ['abc','123']\nOutput: '<b>abc</b>xyz<b>123</b>'\nExplanation: the two matches are disjoint and not adjacent, so they get one pair of tags each.",
        "Example 2:\nInput: s = 'aaabbcc', words = ['aaa','aab','bc']\nOutput: '<b>aaabbc</b>c'\nExplanation: 'aaa' covers [0,2], 'aab' covers [1,3] and 'bc' covers [4,5]. The first two overlap into [0,3], which is adjacent to [4,5], so everything merges into [0,5].",
        "Constraints:\n- 1 <= s.length <= 1000\n- 0 <= words.length <= 100\n- 1 <= words[i].length <= 1000\n- s and words[i] consist of English letters and digits",
      ],
      code: `class Solution {
    // alphabet is digits plus both letter cases, so 62 symbols
    static int idx(char ch) {
        if (ch >= '0' && ch <= '9') return ch - '0';
        if (ch >= 'a' && ch <= 'z') return ch - 'a' + 10;
        return ch - 'A' + 36;
    }

public:
    string addBoldTag(string s, vector<string>& words) {
        const int K = 62;
        int n = s.size();
        vector<array<int,62>> go(1);
        go[0].fill(-1);
        vector<int> link(1, 0), depth(1, 0), best(1, 0);   // best[v] = longest word ending at v
        for (const string& w : words) {
            int v = 0;
            for (char ch : w) {
                int c = idx(ch);
                if (go[v][c] == -1) {
                    array<int,62> row;
                    row.fill(-1);
                    go.push_back(row);
                    link.push_back(0);
                    depth.push_back(depth[v] + 1);
                    best.push_back(0);
                    go[v][c] = (int)go.size() - 1;
                }
                v = go[v][c];
            }
            best[v] = depth[v];
        }
        queue<int> q;
        for (int c = 0; c < K; c++) {
            int u = go[0][c];
            if (u == -1) go[0][c] = 0;
            else { link[u] = 0; q.push(u); }
        }
        while (!q.empty()) {
            int v = q.front(); q.pop();
            best[v] = max(best[v], best[link[v]]);   // inherit the best suffix match
            for (int c = 0; c < K; c++) {
                int u = go[v][c];
                if (u == -1) go[v][c] = go[link[v]][c];
                else { link[u] = go[link[v]][c]; q.push(u); }
            }
        }
        vector<int> diff(n + 2, 0);
        int v = 0;
        for (int i = 0; i < n; i++) {
            v = go[v][idx(s[i])];
            int L = best[v];
            if (L > 0) { diff[i - L + 1]++; diff[i + 1]--; }   // cover [i-L+1, i]
        }
        string res;
        int cur = 0;
        bool open = false;
        for (int i = 0; i < n; i++) {
            cur += diff[i];
            if (cur > 0 && !open) { res += "<b>"; open = true; }
            if (cur == 0 && open) { res += "</b>"; open = false; }
            res += s[i];
        }
        if (open) res += "</b>";
        return res;
    }
};`,
      explanation: [
        "The answer only depends on the union of the match intervals, so individual matches never need to be listed. For each end position it is enough to know the longest word ending there: any shorter word ending at the same position covers a subinterval of it and cannot extend the union.",
        "best[v] = max(best[v], best[link[v]]) computed in BFS order is the standard way to get that number. It is the longest dictionary word that is a suffix of the node's string, so one array read per character replaces the whole exit-link walk and the scan becomes O(|s|) with at most one interval per position.",
        "Merging is then a difference array: add 1 at the interval start, subtract 1 past its end, and a prefix sum tells you whether position i is covered. Overlaps and adjacency both fall out automatically, so the fiddly interval-sorting-and-merging code disappears - the tag is opened when the running sum leaves 0 and closed when it returns to 0.",
        "The tempting bug is emitting </b> after the loop only, or checking coverage of position i before adding diff[i], both of which misplace a tag at the very end of the string. The other classic error is treating adjacent intervals as separate, which the sample with [0,3] and [4,5] catches.",
        "Watch the alphabet: this input allows digits and both letter cases, so the usual ch - 'a' indexing walks off the front of the transition row and is silent undefined behaviour rather than a crash. Map the 62 symbols explicitly.",
        "Time: O(total word length * 62 + |s|). Space: O(total word length * 62 + |s|).",
      ],
    },
    {
      name: "Word Combinations",
      difficulty: "Medium",
      variation: "Automaton plus linear DP over the text",
      link: "https://cses.fi/problemset/task/1731",
      question: [
        "You are given a string of length n and a dictionary of k words. In how many ways can the string be created by concatenating words from the dictionary? Each word may be used any number of times. Print the answer modulo 10^9 + 7.",
        "Example 1:\nInput:\nababc\n4\nab\nabab\nc\ncb\nOutput: 2\nExplanation: the string 'ababc' can be built as ab + ab + c or as abab + c.",
        "Example 2:\nInput:\naaa\n2\na\naa\nOutput: 3\nExplanation: a+a+a, a+aa and aa+a.",
        "Constraints:\n- 1 <= n <= 5000\n- 1 <= k <= 10^5\n- total length of all dictionary words <= 10^6\n- all strings consist of lowercase letters a-z",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const long long MOD = 1000000007LL;
    string s;
    int k;
    cin >> s >> k;
    int n = s.size();
    vector<array<int,26>> go(1);
    go[0].fill(-1);
    vector<int> link(1, 0), depth(1, 0), exitLink(1, 0);
    vector<char> isWord(1, 0);
    for (int i = 0; i < k; i++) {
        string p;
        cin >> p;
        int v = 0;
        for (char ch : p) {
            int c = ch - 'a';
            if (go[v][c] == -1) {
                array<int,26> row;
                row.fill(-1);
                go.push_back(row);
                link.push_back(0);
                depth.push_back(depth[v] + 1);
                exitLink.push_back(0);
                isWord.push_back(0);
                go[v][c] = (int)go.size() - 1;
            }
            v = go[v][c];
        }
        isWord[v] = 1;
    }
    queue<int> q;
    for (int c = 0; c < 26; c++) {
        int u = go[0][c];
        if (u == -1) go[0][c] = 0;
        else { link[u] = 0; q.push(u); }
    }
    while (!q.empty()) {
        int v = q.front(); q.pop();
        exitLink[v] = isWord[link[v]] ? link[v] : exitLink[link[v]];
        for (int c = 0; c < 26; c++) {
            int u = go[v][c];
            if (u == -1) go[v][c] = go[link[v]][c];
            else { link[u] = go[link[v]][c]; q.push(u); }
        }
    }
    vector<long long> dp(n + 1, 0);
    dp[0] = 1;                       // the empty prefix has one decomposition
    int v = 0;
    for (int i = 1; i <= n; i++) {
        v = go[v][s[i - 1] - 'a'];
        for (int w = isWord[v] ? v : exitLink[v]; w; w = exitLink[w])
            dp[i] = (dp[i] + dp[i - depth[w]]) % MOD;   // cut off the word ending at i
    }
    cout << dp[n] % MOD << "\\n";
    return 0;
}`,
      explanation: [
        "State: dp[i] = number of ways to build the first i characters, with dp[0] = 1. A decomposition of the prefix of length i is determined by its last word, so dp[i] = sum of dp[i - len] over all dictionary words of length len that end exactly at position i. Each decomposition is counted once because the last word is unique to it.",
        "Finding those words is exactly what the automaton is for. Run the text through it once; at position i the current node plus its exit-link chain enumerate precisely the dictionary words ending at i, longest first, and depth[w] is that word's length.",
        "The chain walk is affordable because all the words ending at one position have distinct lengths, and distinct lengths summing to at most the total dictionary length means at most O(sqrt(total length)) of them. With n <= 5000 the whole DP is trivial; the automaton is what keeps the per-position cost independent of k.",
        "The tempting alternative is dp[i] = sum over all k words of a substring compare, which is O(n * total length) and times out immediately. Also note the words are reusable and order matters, so this is a counting-of-sequences DP, not a subset DP - and every addition needs the modulo, since the count explodes far past 64 bits for inputs like 'aaaa...' with the word 'a'.",
        "Time: O(total word length * 26 + n * sqrt(total word length)). Space: O(total word length * 26 + n).",
      ],
    },
    {
      name: "Stream of Characters",
      difficulty: "Hard",
      variation: "Online streaming queries, terminal-in-chain flag",
      link: "https://leetcode.com/problems/stream-of-characters/",
      question: [
        "Design an algorithm that accepts a stream of characters and checks if a suffix of these characters is a string of a given array of strings words. Implement the class StreamChecker: the constructor takes words, and query(letter) appends letter to the stream and returns true if any non-empty suffix of the stream so far spells one of the words.",
        "Example 1:\nInput: words = ['cd','f','kl'], then query('a'), query('b'), query('c'), query('d'), query('e'), query('f')\nOutput: false, false, false, true, false, true\nExplanation: after 'd' the stream is 'abcd' whose suffix 'cd' is a word; after 'f' the stream is 'abcdef' whose suffix 'f' is a word. No suffix of 'a', 'ab', 'abc' or 'abcde' is a word.",
        "Example 2:\nInput: words = ['ab','ba'], then query('a'), query('b'), query('a')\nOutput: false, true, true\nExplanation: 'ab' is a word after the second query, and 'aba' ends with 'ba'.",
        "Constraints:\n- 1 <= words.length <= 2000\n- 1 <= words[i].length <= 200\n- words[i] consists of lowercase English letters\n- at most 4 * 10^4 calls to query, each with a lowercase letter\n- each query must run in time independent of the stream length",
      ],
      code: `class StreamChecker {
    static const int K = 26;
    vector<array<int,K>> go;
    vector<int> link;
    vector<char> hit;      // hit[v] = some word is a suffix of the string spelled by v
    int cur = 0;           // the single piece of state kept between queries

    int newNode() {
        array<int,K> row;
        row.fill(-1);
        go.push_back(row);
        link.push_back(0);
        hit.push_back(0);
        return (int)go.size() - 1;
    }

public:
    StreamChecker(vector<string>& words) {
        newNode();
        for (const string& w : words) {
            int v = 0;
            for (char ch : w) {
                int c = ch - 'a';
                if (go[v][c] == -1) go[v][c] = newNode();
                v = go[v][c];
            }
            hit[v] = 1;
        }
        queue<int> q;
        for (int c = 0; c < K; c++) {
            int u = go[0][c];
            if (u == -1) go[0][c] = 0;
            else { link[u] = 0; q.push(u); }
        }
        while (!q.empty()) {
            int v = q.front(); q.pop();
            hit[v] = hit[v] || hit[link[v]];   // collapse the whole exit chain into one bit
            for (int c = 0; c < K; c++) {
                int u = go[v][c];
                if (u == -1) go[v][c] = go[link[v]][c];
                else { link[u] = go[link[v]][c]; q.push(u); }
            }
        }
    }

    bool query(char letter) {
        cur = go[cur][letter - 'a'];
        return hit[cur];
    }
};`,
      explanation: [
        "The stream never has to be stored. The automaton state after reading the stream is the longest dictionary prefix that is also a suffix of the stream, and every dictionary word that is a suffix of the stream is a suffix-link ancestor of that state. So the question 'does some word end here' is a property of the state alone.",
        "Precomputing hit[v] = isWord[v] OR hit[link[v]] in BFS order collapses that ancestor walk to a single bit per node, which is what makes query O(1) instead of O(word length). Correctness relies on link[v] being shallower than v and therefore already final when v is popped.",
        "The popular alternative is a trie of reversed words plus a stored stream, walking backwards from the newest character on every query. It is correct, but each query costs O(max word length) and it keeps the entire stream in memory; here it would be 200 steps per query rather than one array lookup.",
        "The trap is treating the current node as significant only when it is exactly a terminal. With words = ['ba'] and stream 'aba' the walk sits on the node for 'ba' fine, but with words = ['b','ab'] and stream 'aab' the state is the node 'ab' while the word that matched could be 'b' - only the inherited hit bit catches both.",
        "Time: O(total word length * 26) to build, O(1) per query. Space: O(total word length * 26).",
      ],
    },
    {
      name: "Construct String with Minimum Cost",
      difficulty: "Hard",
      variation: "Automaton plus shortest-path DP with weights",
      link: "https://leetcode.com/problems/construct-string-with-minimum-cost/",
      question: [
        "You are given a string target, an array of strings words, and an integer array costs of the same length. Starting with an empty string s, you may repeatedly pick an index i, append words[i] to s, and pay costs[i]. Return the minimum total cost to make s equal to target, or -1 if it is impossible.",
        "Example 1:\nInput: target = 'abcdef', words = ['abdef','abc','d','def','ef'], costs = [100,1,1,10,5]\nOutput: 7\nExplanation: append 'abc' for 1, 'd' for 1, then 'ef' for 5, total 7. Using 'def' instead of 'd' and 'ef' would cost 1 + 10 = 11.",
        "Example 2:\nInput: target = 'aaaa', words = ['z','zz','zzz'], costs = [1,10,100]\nOutput: -1\nExplanation: no concatenation of the given words can ever equal 'aaaa'.",
        "Constraints:\n- 1 <= target.length <= 5 * 10^4\n- 1 <= words.length == costs.length <= 5 * 10^4\n- 1 <= words[i].length and the sum of all words[i].length <= 5 * 10^4\n- 1 <= costs[i] <= 10^4\n- target and words[i] consist of lowercase English letters",
      ],
      code: `class Solution {
public:
    int minimumCost(string target, vector<string>& words, vector<int>& costs) {
        const int INF = INT_MAX;
        vector<array<int,26>> go(1);
        go[0].fill(-1);
        vector<int> link(1, 0), depth(1, 0), exitLink(1, 0);
        vector<int> wcost(1, INF);          // cheapest word ending exactly at this node
        for (int i = 0; i < (int)words.size(); i++) {
            int v = 0;
            for (char ch : words[i]) {
                int c = ch - 'a';
                if (go[v][c] == -1) {
                    array<int,26> row;
                    row.fill(-1);
                    go.push_back(row);
                    link.push_back(0);
                    depth.push_back(depth[v] + 1);
                    exitLink.push_back(0);
                    wcost.push_back(INF);
                    go[v][c] = (int)go.size() - 1;
                }
                v = go[v][c];
            }
            wcost[v] = min(wcost[v], costs[i]);   // duplicates collapse to the cheapest
        }
        queue<int> q;
        for (int c = 0; c < 26; c++) {
            int u = go[0][c];
            if (u == -1) go[0][c] = 0;
            else { link[u] = 0; q.push(u); }
        }
        while (!q.empty()) {
            int v = q.front(); q.pop();
            exitLink[v] = (wcost[link[v]] != INF) ? link[v] : exitLink[link[v]];
            for (int c = 0; c < 26; c++) {
                int u = go[v][c];
                if (u == -1) go[v][c] = go[link[v]][c];
                else { link[u] = go[link[v]][c]; q.push(u); }
            }
        }
        int n = target.size();
        const long long BIG = (long long)4e18;
        vector<long long> dp(n + 1, BIG);
        dp[0] = 0;
        int v = 0;
        for (int i = 1; i <= n; i++) {
            v = go[v][target[i - 1] - 'a'];
            for (int w = (wcost[v] != INF ? v : exitLink[v]); w; w = exitLink[w]) {
                long long prev = dp[i - depth[w]];
                if (prev < BIG) dp[i] = min(dp[i], prev + wcost[w]);
            }
        }
        return dp[n] >= BIG ? -1 : (int)dp[n];
    }
};`,
      explanation: [
        "State: dp[i] = minimum cost to produce the first i characters of target exactly. The last appended word must be a suffix of that prefix, so dp[i] = min over words w ending at position i of dp[i - |w|] + cost(w). Since every append lands the string exactly on a prefix boundary, no other decomposition exists and the recurrence is complete.",
        "Enumerating 'words ending at position i' is the automaton's job: one walk over target, and at each position the exit-link chain from the current node lists every such word with depth[w] giving its length. Only the cheapest word per terminal node matters, so duplicates and equal strings with different costs collapse at insert time.",
        "The chain length per position is bounded by the number of distinct word lengths, which is O(sqrt(sum of word lengths)) because distinct lengths must sum to at most that total. With 5 * 10^4 that is a few hundred steps per position - fast enough, and it is why no extra data structure is needed.",
        "The tempting wrong model is a greedy 'take the cheapest word that fits' or 'take the longest match'. Both fail: in the sample the longest match 'abdef' costs 100 and a cheap long word can be worse than two cheap short ones. Keep BIG as an unreachable sentinel and check it before adding, otherwise INF + cost silently overflows into a small number and produces a bogus finite answer.",
        "Time: O(sum of word lengths * 26 + |target| * sqrt(sum of word lengths)). Space: O(sum of word lengths * 26 + |target|).",
      ],
    },
    {
      name: "You Are Given Some Strings...",
      difficulty: "Hard",
      variation: "Two automata, counting concatenated pairs",
      link: "https://codeforces.com/problemset/problem/1202/E",
      question: [
        "You are given a string t and n strings s_1..s_n. Let f(t, s) be the number of occurrences of string s in string t. Compute the sum of f(t, s_i + s_j) over all ordered pairs (i, j) with 1 <= i, j <= n, where s_i + s_j denotes concatenation. Pairs with i = j are included, and the strings s_i need not be distinct.",
        "Example 1:\nInput:\naaabacaa\n2\na\naa\nOutput: 5\nExplanation: the four concatenations are 'aa', 'aaa', 'aaa', 'aaaa'. 'aa' occurs 3 times (positions 1, 2, 7), 'aaa' once each for the two pairs that form it, and 'aaaa' never, so 3 + 1 + 1 + 0 = 5.",
        "Example 2:\nInput:\naaabacaa\n4\na\na\na\nb\nOutput: 33\nExplanation: at every position, 3 strings end there if the character is 'a' and 1 does if it is 'b'; the same holds for strings starting there. Summing endCount(i) * startCount(i+1) over the 7 adjacent pairs of positions gives 9+9+3+3+0+0+9 = 33.",
        "Constraints:\n- 1 <= |t| <= 2 * 10^5\n- 1 <= n <= 2 * 10^5\n- the total length of all s_i <= 2 * 10^5\n- all strings consist of lowercase Latin letters",
      ],
      code: `struct Aho {
    vector<array<int,26>> go;
    vector<int> link;
    vector<long long> cnt;          // number of dictionary strings ending at this state

    Aho() { addNode(); }

    int addNode() {
        array<int,26> row;
        row.fill(-1);
        go.push_back(row);
        link.push_back(0);
        cnt.push_back(0);
        return (int)go.size() - 1;
    }

    void insert(const string& s) {
        int v = 0;
        for (char ch : s) {
            int c = ch - 'a';
            if (go[v][c] == -1) go[v][c] = addNode();
            v = go[v][c];
        }
        cnt[v]++;                   // equal strings stack up on the same node
    }

    void build() {
        queue<int> q;
        for (int c = 0; c < 26; c++) {
            int u = go[0][c];
            if (u == -1) go[0][c] = 0;
            else { link[u] = 0; q.push(u); }
        }
        while (!q.empty()) {
            int v = q.front(); q.pop();
            cnt[v] += cnt[link[v]];      // inherit all shorter strings that also end here
            for (int c = 0; c < 26; c++) {
                int u = go[v][c];
                if (u == -1) go[v][c] = go[link[v]][c];
                else { link[u] = go[link[v]][c]; q.push(u); }
            }
        }
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string t;
    int n;
    cin >> t >> n;
    Aho fwd, bwd;
    for (int i = 0; i < n; i++) {
        string s;
        cin >> s;
        fwd.insert(s);
        reverse(s.begin(), s.end());
        bwd.insert(s);               // reversed dictionary for the 'starts here' counts
    }
    fwd.build();
    bwd.build();
    int m = t.size();
    vector<long long> endAt(m, 0), startAt(m, 0);
    int v = 0;
    for (int i = 0; i < m; i++) {
        v = fwd.go[v][t[i] - 'a'];
        endAt[i] = fwd.cnt[v];
    }
    v = 0;
    for (int j = 0; j < m; j++) {
        v = bwd.go[v][t[m - 1 - j] - 'a'];
        startAt[m - 1 - j] = bwd.cnt[v];   // a reversed match ending here starts here
    }
    long long ans = 0;
    for (int i = 0; i + 1 < m; i++) ans += endAt[i] * startAt[i + 1];   // split point
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "The key reformulation: an occurrence of s_i + s_j in t is exactly a position i where s_i ends and s_j starts at the very next position. So the answer is the sum over every cut between adjacent characters of (number of strings ending on the left side) * (number of strings starting on the right side). Never enumerate the n^2 concatenations - there can be 4 * 10^10 of them.",
        "Counting how many dictionary strings end at each position is the standard automaton scan with cnt[v] = (strings ending exactly at v) + cnt[link[v]], which accumulates every dictionary string that is a suffix of the current state. Multiplicities matter here, so use a counter per node rather than a boolean.",
        "Counting how many strings start at each position is the same question mirrored. Reverse every dictionary string, reverse the direction of the scan over t, and a match 'ending' at reversed position j is a match starting at original position m-1-j. Two independent automata, two linear scans.",
        "Types are the trap: each factor is at most n = 2 * 10^5, so a single product reaches 4 * 10^10 and the total can approach 10^16. The sum must be long long even though every intermediate count fits in an int.",
        "Time: O(total dictionary length * 26 + |t|). Space: O(total dictionary length * 26 + |t|).",
      ],
    },
    {
      name: "Frequency of String",
      difficulty: "Hard",
      variation: "Occurrence positions plus sliding window per pattern",
      link: "https://codeforces.com/problemset/problem/963/D",
      question: [
        "You are given a string s and n queries. Each query consists of an integer k and a string m. For each query, find the length of the shortest substring of s that contains at least k occurrences of m, or -1 if no substring of s contains k occurrences.",
        "Example 1:\nInput:\naaaaa\n5\n3 a\n3 aa\n2 aaa\n3 aaaa\n1 aaaaa\nOutput:\n3\n4\n4\n-1\n5\nExplanation: 'aaa' holds three copies of 'a'; 'aaaa' holds three copies of 'aa' and two of 'aaa'; 'aaaa' occurs only twice in total so k = 3 is impossible.",
        "Example 2:\nInput:\nabbb\n3\n4 b\n1 ab\n2 bbb\nOutput:\n-1\n2\n-1\nExplanation: 'b' occurs only 3 times, 'ab' occurs once at position 0 so the answer is its own length 2, and 'bbb' occurs once so two copies are impossible.",
        "Constraints:\n- 1 <= |s| <= 10^5\n- 1 <= n <= 10^5\n- 1 <= k <= 10^5\n- 1 <= |m| and the total length of all query strings <= 10^5\n- all strings consist of lowercase Latin letters",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    int n;
    cin >> s >> n;
    vector<array<int,26>> go(1);
    go[0].fill(-1);
    vector<int> link(1, 0), depth(1, 0), exitLink(1, 0), listId(1, -1);
    vector<int> qk(n), qnode(n);
    int lists = 0;
    for (int i = 0; i < n; i++) {
        string m;
        cin >> qk[i] >> m;
        int v = 0;
        for (char ch : m) {
            int c = ch - 'a';
            if (go[v][c] == -1) {
                array<int,26> row;
                row.fill(-1);
                go.push_back(row);
                link.push_back(0);
                depth.push_back(depth[v] + 1);
                exitLink.push_back(0);
                listId.push_back(-1);
                go[v][c] = (int)go.size() - 1;
            }
            v = go[v][c];
        }
        if (listId[v] == -1) listId[v] = lists++;   // repeated query strings share one list
        qnode[i] = v;
    }
    queue<int> q;
    for (int c = 0; c < 26; c++) {
        int u = go[0][c];
        if (u == -1) go[0][c] = 0;
        else { link[u] = 0; q.push(u); }
    }
    while (!q.empty()) {
        int v = q.front(); q.pop();
        exitLink[v] = (listId[link[v]] != -1) ? link[v] : exitLink[link[v]];
        for (int c = 0; c < 26; c++) {
            int u = go[v][c];
            if (u == -1) go[v][c] = go[link[v]][c];
            else { link[u] = go[link[v]][c]; q.push(u); }
        }
    }
    vector<vector<int>> occ(lists);
    int v = 0;
    for (int i = 0; i < (int)s.size(); i++) {
        v = go[v][s[i] - 'a'];
        for (int w = (listId[v] != -1 ? v : exitLink[v]); w; w = exitLink[w])
            occ[listId[w]].push_back(i - depth[w] + 1);   // start index, already sorted
    }
    for (int i = 0; i < n; i++) {
        const vector<int>& p = occ[listId[qnode[i]]];
        int L = depth[qnode[i]], k = qk[i], best = -1;
        for (size_t j = 0; j + (size_t)k <= p.size(); j++) {
            int len = p[j + k - 1] + L - p[j];        // window from one start to a later end
            if (best == -1 || len < best) best = len;
        }
        cout << best << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Reduce each query to its own list of occurrence start positions. If m starts at p_1 < p_2 < ... < p_t, any substring containing k occurrences must contain k consecutive ones, and the shortest such substring runs from p_j to p_{j+k-1} + |m| - 1. So the answer is min over j of p_{j+k-1} + |m| - p_j, and -1 when t < k. Only consecutive groups need checking because skipping an occurrence can only widen the window.",
        "One automaton over all query strings produces every one of those lists in a single scan of s, and the positions arrive in increasing order automatically since a pattern's length is fixed and the scan moves left to right. Repeated query strings map to the same terminal node, so they share one list and are answered independently afterwards.",
        "The exit-link chain is required, not optional: when the state is the node for 'aaa', occurrences of the queried strings 'a' and 'aa' also end at that position and would be missed by looking at the current node alone.",
        "Cost analysis is the interesting part. Two distinct patterns of the same length can never start at the same position, so all patterns of a given length contribute at most |s| occurrences in total, and the number of distinct lengths among query strings whose lengths sum to at most 10^5 is O(sqrt(total length)). That bounds the total stored occurrences by |s| * sqrt(total length), which is what makes the straightforward lists viable - but it is also why memory here is worth watching.",
        "Time: O(total query length * 26 + |s| * sqrt(total query length)). Space: same order as the occurrence lists.",
      ],
    },
    {
      name: "Genetic engineering",
      difficulty: "Hard",
      variation: "DP over automaton states with a coverage counter",
      link: "https://codeforces.com/problemset/problem/86/C",
      question: [
        "You are given m DNA fragments over the alphabet A, C, G, T and an integer n. Count the strings of length n over that alphabet in which every single character is covered by at least one occurrence of some fragment - that is, for each position there exists an occurrence of some fragment as a substring that includes that position. Occurrences may overlap freely. Print the count modulo 10^9 + 9.",
        "Example 1:\nInput:\n2 1\nA\nOutput: 1\nExplanation: with only the fragment 'A', every character must sit inside an occurrence of 'A', so the string must be 'AA'.",
        "Example 2:\nInput:\n3 2\nAC\nCA\nOutput: 2\nExplanation: positions 1 and 3 can only be covered by a fragment occupying positions 1-2 and one occupying positions 2-3, so both halves must be fragments. That forces 'ACA' or 'CAC'.",
        "Constraints:\n- 1 <= n <= 1000\n- 1 <= m <= 10\n- 1 <= fragment length <= 10\n- fragments consist of the characters A, C, G, T\n- the answer is taken modulo 10^9 + 9",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const long long MOD = 1000000009LL;      // note: 10^9 + 9, not the usual 10^9 + 7
    int n, m;
    cin >> n >> m;
    vector<array<int,4>> go(1);
    go[0].fill(-1);
    vector<int> link(1, 0), depth(1, 0), best(1, 0);   // best[v] = longest fragment ending at v
    int maxLen = 0;
    auto idx = [](char ch) { return ch == 'A' ? 0 : ch == 'C' ? 1 : ch == 'G' ? 2 : 3; };
    for (int i = 0; i < m; i++) {
        string p;
        cin >> p;
        maxLen = max(maxLen, (int)p.size());
        int v = 0;
        for (char ch : p) {
            int c = idx(ch);
            if (go[v][c] == -1) {
                array<int,4> row;
                row.fill(-1);
                go.push_back(row);
                link.push_back(0);
                depth.push_back(depth[v] + 1);
                best.push_back(0);
                go[v][c] = (int)go.size() - 1;
            }
            v = go[v][c];
        }
        best[v] = depth[v];
    }
    queue<int> q;
    for (int c = 0; c < 4; c++) {
        int u = go[0][c];
        if (u == -1) go[0][c] = 0;
        else { link[u] = 0; q.push(u); }
    }
    while (!q.empty()) {
        int v = q.front(); q.pop();
        best[v] = max(best[v], best[link[v]]);
        for (int c = 0; c < 4; c++) {
            int u = go[v][c];
            if (u == -1) go[v][c] = go[link[v]][c];
            else { link[u] = go[link[v]][c]; q.push(u); }
        }
    }
    int S = go.size();
    // dp[v][j]: automaton state v, j uncovered characters at the tail
    vector<vector<long long>> dp(S, vector<long long>(maxLen + 1, 0)), nd;
    dp[0][0] = 1;
    for (int step = 0; step < n; step++) {
        nd.assign(S, vector<long long>(maxLen + 1, 0));
        for (int v = 0; v < S; v++)
            for (int j = 0; j <= maxLen; j++) {
                long long cur = dp[v][j];
                if (!cur) continue;
                for (int c = 0; c < 4; c++) {
                    int u = go[v][c];
                    int nj = j + 1;
                    if (best[u] >= nj) nj = 0;   // longest match here swallows the whole tail
                    if (nj > maxLen) continue;   // tail can never be covered any more
                    nd[u][nj] = (nd[u][nj] + cur) % MOD;
                }
            }
        dp.swap(nd);
    }
    long long ans = 0;
    for (int v = 0; v < S; v++) ans = (ans + dp[v][0]) % MOD;
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "State: (automaton node, length of the still-uncovered tail). The node is needed to know which fragments can complete next; the tail length is needed because coverage of a character can be decided long after the character was chosen. dp counts strings built so far that reach that pair, and the answer is the total mass in tail length 0 after n characters.",
        "Transition: append a character, move to u = go[v][c], and the tail grows to j+1. If the longest fragment ending at u has length at least j+1, that single occurrence spans the entire uncovered tail plus the new character, so the tail resets to 0. Using only the longest match is sufficient - a shorter match ending at the same position covers a suffix of what the longest one covers, so it can never cover a tail the longest one fails to cover.",
        "The tail can be capped at the maximum fragment length. Every fragment occurrence ends at the current position, so a tail longer than the longest fragment can never be closed and the state is dead; pruning it keeps the table at about 101 * 11 entries.",
        "The tempting simplification is a boolean 'is the previous character covered'. It is wrong: a run of characters can stay uncovered for several steps and then all be covered at once by one long fragment, which only the counted tail can express. The other trap is the modulus - this problem uses 10^9 + 9, and reflexively typing 10^9 + 7 produces a wrong answer on every non-trivial test.",
        "Time: O(states * maxLen * 4 * n), about 4 * 10^6 here. Space: O(states * maxLen).",
      ],
    },
  ],
};
