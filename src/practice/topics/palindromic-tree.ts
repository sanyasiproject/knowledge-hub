import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Count of Distinct Palindromic Substrings",
      difficulty: "Easy",
      variation: "Eertree construction, the template",
      question: [
        "Given a lowercase string s, count how many distinct palindromic substrings it contains. Two occurrences of the same palindrome count once. Build a palindromic tree (eertree): a structure with exactly one node per distinct palindromic substring of s, built in one left-to-right pass.",
        "Example 1:\nInput: s = 'abaaa'\nOutput: 5\nExplanation: The distinct palindromic substrings are 'a', 'b', 'aa', 'aaa' and 'aba'.",
        "Example 2:\nInput: s = 'aabb'\nOutput: 4\nExplanation: 'a', 'b', 'aa' and 'bb'. The extra occurrence of 'a' and of 'b' is not counted again.",
        "Constraints:\n- 1 <= s.length <= 10^6\n- s consists of lowercase English letters only",
      ],
      code: `struct Eertree {
    vector<array<int,26>> nxt;   // nxt[v][c] = node for c + palindrome(v) + c
    vector<int> len, link;       // len[v] = length, link[v] = longest proper palindromic suffix
    string s;
    int last;                    // node of the longest palindromic suffix of the prefix so far

    Eertree(int n) {
        nxt.reserve(n + 2); len.reserve(n + 2); link.reserve(n + 2);
        newNode(-1);             // node 0: the imaginary root of length -1
        newNode(0);              // node 1: the empty root of length 0
        link[0] = 0; link[1] = 0;
        last = 1;
        s.reserve(n);
    }

    int newNode(int l) {
        nxt.push_back({});       // value-initialised, so every transition starts absent
        len.push_back(l);
        link.push_back(0);
        return (int)nxt.size() - 1;
    }

    // walk suffix links from v until s[i] can wrap around the palindrome
    int getLink(int v, int i) {
        while (i - len[v] - 1 < 0 || s[i - len[v] - 1] != s[i]) v = link[v];
        return v;
    }

    void add(char c) {
        s.push_back(c);
        int i = (int)s.size() - 1, ch = c - 'a';
        int cur = getLink(last, i);
        if (!nxt[cur][ch]) {                 // this palindrome is seen for the first time
            int now = newNode(len[cur] + 2);
            // the suffix link of the new node is found by continuing the walk from link[cur]
            link[now] = (len[now] == 1) ? 1 : nxt[getLink(link[cur], i)][ch];
            nxt[cur][ch] = now;
        }
        last = nxt[cur][ch];
    }

    int size() const { return (int)nxt.size(); }
};

int countDistinctPalindromes(string s) {
    Eertree t(s.size());
    for (char c : s) t.add(c);
    return t.size() - 2;        // every node except the two roots is one distinct palindrome
}`,
      explanation: [
        "The whole structure rests on one fact: adding a character to a string creates at most one palindromic substring that was never seen before, namely the longest palindromic suffix of the new prefix. Everything shorter that ends at the new position is a palindromic suffix of that one, so it already had a node. That is why the tree has at most n + 2 nodes and why counting nodes counts distinct palindromes.",
        "Two roots are needed because palindromes come in two parities. Wrapping a character around the empty root of length 0 produces a length-2 palindrome, so that root heads the even family; wrapping it around the imaginary root of length -1 produces the length-1 palindrome, so that root heads the odd family. The -1 root also terminates every getLink walk, since i - (-1) - 1 = i makes the test s[i] == s[i] trivially true.",
        "The amortised cost is the classic suffix-link argument: len[last] grows by at most 2 per character, and every step of a getLink walk strictly decreases it, so the total number of walk steps across the whole build is O(n). Both getLink calls are bounded this way.",
        "The tempting wrong approach is to enumerate centres (Manacher) and insert the substrings into a hash set. Manacher finds the maximal palindrome per centre in O(n), but the distinct palindromes still have to be deduplicated, and materialising them costs O(n^2) characters in the worst case, as with 'aaaa...a'.",
        "Time: O(n * 26) to build, O(n) if transitions are stored in a hash map instead of a fixed array. Space: O(n * 26).",
      ],
    },
    {
      name: "Longest Palindromic Substring",
      difficulty: "Medium",
      variation: "Deepest node by length",
      link: "https://leetcode.com/problems/longest-palindromic-substring/",
      question: [
        "Given a string s, return the longest palindromic substring of s. If several substrings tie for the longest, any one of them is accepted.",
        "Example 1:\nInput: s = 'babad'\nOutput: 'bab'\nExplanation: 'aba' is also a correct answer, both have length 3.",
        "Example 2:\nInput: s = 'cbbd'\nOutput: 'bb'\nExplanation: The only palindromic substrings are the single letters and 'bb'.",
        "Constraints:\n- 1 <= s.length <= 1000\n- s consists of digits and English letters",
      ],
      code: `struct Eertree {
    vector<array<int,26>> nxt;
    vector<int> len, link;
    string s;
    int last;

    Eertree(int n) {
        newNode(-1); newNode(0);
        link[0] = 0; link[1] = 0;
        last = 1;
    }
    int newNode(int l) {
        nxt.push_back({}); len.push_back(l); link.push_back(0);
        return (int)nxt.size() - 1;
    }
    int getLink(int v, int i) {
        while (i - len[v] - 1 < 0 || s[i - len[v] - 1] != s[i]) v = link[v];
        return v;
    }
    void add(char c) {
        s.push_back(c);
        int i = (int)s.size() - 1, ch = c - 'a';
        int cur = getLink(last, i);
        if (!nxt[cur][ch]) {
            int now = newNode(len[cur] + 2);
            link[now] = (len[now] == 1) ? 1 : nxt[getLink(link[cur], i)][ch];
            nxt[cur][ch] = now;
        }
        last = nxt[cur][ch];
    }
};

string longestPalindrome(string s) {
    Eertree t(s.size());
    int bestLen = 0, bestStart = 0;
    for (int i = 0; i < (int)s.size(); i++) {
        t.add(s[i]);
        // after add, last is the longest palindromic suffix of s[0..i]
        if (t.len[t.last] > bestLen) {
            bestLen = t.len[t.last];
            bestStart = i - bestLen + 1;
        }
    }
    return s.substr(bestStart, bestLen);
}`,
      explanation: [
        "Every palindromic substring is the palindromic suffix of the prefix that ends where it ends. So the longest palindrome overall is the maximum, over all i, of the longest palindromic suffix of s[0..i] - exactly the value len[last] that the eertree maintains for free.",
        "Recovering the actual substring needs no extra bookkeeping: a palindromic suffix of s[0..i] of length L occupies s[i-L+1 .. i], so remembering i at the moment the record was set is enough.",
        "Note the tie-breaking is settled by the scan order: the first end position that achieves the maximum wins, which is why 'babad' returns 'bab' rather than 'aba'.",
        "For this constraint (n <= 1000) centre expansion in O(n^2) or the DP over intervals both pass, and are shorter to write; the eertree earns its keep only once n is large or the problem also asks for counts. Do note the c - 'a' indexing assumes lowercase letters, so mixed-case or digit input needs a wider alphabet array.",
        "Time: O(n * 26). Space: O(n * 26).",
      ],
    },
    {
      name: "Longest Palindrome",
      difficulty: "Medium",
      variation: "Longest palindrome on a 10^6 input",
      link: "https://cses.fi/problemset/task/1111",
      question: [
        "You are given a string of length n consisting of lowercase letters. Print the longest palindromic substring of the string. If there are several longest palindromes, print any of them.",
        "Example 1:\nInput:\naybabtu\nOutput: bab\nExplanation: 'bab' occupies positions 3..5 (1-indexed) and no palindromic substring is longer.",
        "Example 2:\nInput:\nabaaa\nOutput: aba\nExplanation: 'aaa' also has length 3 and would be accepted too; the scan reports 'aba' because its right endpoint comes first.",
        "Constraints:\n- 1 <= n <= 10^6\n- The string consists of characters a-z",
      ],
      code: `struct Eertree {
    vector<array<int,26>> nxt;
    vector<int> len, link;
    string s;
    int last;

    Eertree(int n) {
        nxt.reserve(n + 2); len.reserve(n + 2); link.reserve(n + 2); s.reserve(n);
        newNode(-1); newNode(0);
        link[0] = 0; link[1] = 0;
        last = 1;
    }
    int newNode(int l) {
        nxt.push_back({}); len.push_back(l); link.push_back(0);
        return (int)nxt.size() - 1;
    }
    int getLink(int v, int i) {
        while (i - len[v] - 1 < 0 || s[i - len[v] - 1] != s[i]) v = link[v];
        return v;
    }
    void add(char c) {
        s.push_back(c);
        int i = (int)s.size() - 1, ch = c - 'a';
        int cur = getLink(last, i);
        if (!nxt[cur][ch]) {
            int now = newNode(len[cur] + 2);
            link[now] = (len[now] == 1) ? 1 : nxt[getLink(link[cur], i)][ch];
            nxt[cur][ch] = now;
        }
        last = nxt[cur][ch];
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    int n = (int)s.size();
    Eertree t(n);
    int bestLen = 0, bestStart = 0;
    for (int i = 0; i < n; i++) {
        t.add(s[i]);
        if (t.len[t.last] > bestLen) {
            bestLen = t.len[t.last];
            bestStart = i - bestLen + 1;
        }
    }
    cout << s.substr(bestStart, bestLen) << "\\n";
    return 0;
}`,
      explanation: [
        "Same one-line observation as the interview version - track len[last] as the tree is built - but now the input size decides the algorithm. An O(n^2) centre expansion is 10^12 operations here and is hopeless; the eertree is linear in the number of characters.",
        "The reserve calls matter in practice. Without them the vector of 26-int transition rows reallocates and copies about 100 MB of data several times during the build; with them there is one allocation.",
        "The memory bound is the real constraint on this input: n + 2 nodes times 26 ints is roughly 104 MB. If a judge is tighter than that, switch the transition array for a first-child / next-sibling pair of int arrays (2 ints per node) and accept an O(26) scan per lookup, or use Manacher, which needs only O(n) ints.",
        "Trap: the tree stores palindromes, not positions, so the answer must be reconstructed at the moment a record is set. Reading len of the longest node after the build tells you the length but not where it sits, since a node can occur many times.",
        "Time: O(n * 26). Space: O(n * 26).",
      ],
    },
    {
      name: "Palindromic Substrings",
      difficulty: "Medium",
      variation: "Palindromic suffixes per position",
      link: "https://leetcode.com/problems/palindromic-substrings/",
      question: [
        "Given a string s, return the number of palindromic substrings in it. A substring is a contiguous sequence of characters, and two substrings are different if they start or end at different indices even when their contents are equal.",
        "Example 1:\nInput: s = 'aaa'\nOutput: 6\nExplanation: The palindromic substrings are 'a' (three times), 'aa' (twice) and 'aaa'.",
        "Example 2:\nInput: s = 'abc'\nOutput: 3\nExplanation: Only the three single characters are palindromes.",
        "Constraints:\n- 1 <= s.length <= 1000\n- s consists of lowercase English letters",
      ],
      code: `struct Eertree {
    vector<array<int,26>> nxt;
    vector<int> len, link, num;   // num[v] = number of palindromic suffixes of palindrome v
    string s;
    int last;

    Eertree(int n) {
        newNode(-1); newNode(0);
        link[0] = 0; link[1] = 0;
        last = 1;
    }
    int newNode(int l) {
        nxt.push_back({}); len.push_back(l); link.push_back(0); num.push_back(0);
        return (int)nxt.size() - 1;
    }
    int getLink(int v, int i) {
        while (i - len[v] - 1 < 0 || s[i - len[v] - 1] != s[i]) v = link[v];
        return v;
    }
    void add(char c) {
        s.push_back(c);
        int i = (int)s.size() - 1, ch = c - 'a';
        int cur = getLink(last, i);
        if (!nxt[cur][ch]) {
            int now = newNode(len[cur] + 2);
            link[now] = (len[now] == 1) ? 1 : nxt[getLink(link[cur], i)][ch];
            num[now] = num[link[now]] + 1;   // depth in the suffix-link tree
            nxt[cur][ch] = now;
        }
        last = nxt[cur][ch];
    }
};

int countSubstrings(string s) {
    Eertree t(s.size());
    long long total = 0;
    for (char c : s) {
        t.add(c);
        total += t.num[t.last];   // palindromes ending exactly at this position
    }
    return (int)total;
}`,
      explanation: [
        "Group the answer by right endpoint: the count is the sum over i of the number of palindromic substrings ending at i. Those are precisely the palindromic suffixes of s[0..i], and they form the chain last, link[last], link[link[last]], ... down to the empty root.",
        "Walking that chain per position would be O(n) each, so instead store its length once at node creation: num[v] = num[link[v]] + 1, which is the node's depth in the suffix-link tree. It is well defined because link[v] is always created before v.",
        "This counts occurrences, while the node count of the tree counts distinct palindromes. Mixing the two up is the standard trap: for 'aaa' the node count gives 3 and the occurrence sum gives 6, and problems ask for one or the other.",
        "Time: O(n * 26). Space: O(n * 26).",
      ],
    },
    {
      name: "Number of Palindromes",
      difficulty: "Medium",
      variation: "Occurrence counts on the suffix-link tree",
      link: "https://www.spoj.com/problems/NUMOFPAL/",
      question: [
        "You are given a single string on one line. Print the number of its palindromic substrings, counting every occurrence separately. Solve it by computing, for each distinct palindrome, how many times it occurs, and then summing those counts - this is the shape needed whenever a problem asks for the most frequent palindrome or for a weighted sum such as maximum length times occurrences.",
        "Example 1:\nInput:\nabab\nOutput: 6\nExplanation: 'a' twice, 'b' twice, 'aba' once, 'bab' once.",
        "Example 2:\nInput:\naaa\nOutput: 6\nExplanation: 'a' occurs 3 times, 'aa' twice, 'aaa' once.",
        "Constraints:\n- 1 <= length of the string <= 1000\n- The string consists of lowercase letters",
      ],
      code: `struct Eertree {
    vector<array<int,26>> nxt;
    vector<int> len, link;
    vector<long long> cnt;      // cnt[v] = occurrences of palindrome v
    string s;
    int last;

    Eertree(int n) {
        newNode(-1); newNode(0);
        link[0] = 0; link[1] = 0;
        last = 1;
    }
    int newNode(int l) {
        nxt.push_back({}); len.push_back(l); link.push_back(0); cnt.push_back(0);
        return (int)nxt.size() - 1;
    }
    int getLink(int v, int i) {
        while (i - len[v] - 1 < 0 || s[i - len[v] - 1] != s[i]) v = link[v];
        return v;
    }
    void add(char c) {
        s.push_back(c);
        int i = (int)s.size() - 1, ch = c - 'a';
        int cur = getLink(last, i);
        if (!nxt[cur][ch]) {
            int now = newNode(len[cur] + 2);
            link[now] = (len[now] == 1) ? 1 : nxt[getLink(link[cur], i)][ch];
            nxt[cur][ch] = now;
        }
        last = nxt[cur][ch];
        cnt[last]++;            // one occurrence ends here; shorter suffixes fixed up later
    }
    int size() const { return (int)nxt.size(); }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    Eertree t(s.size());
    for (char c : s) t.add(c);
    // link[v] < v always, so one reverse sweep pushes counts down the suffix-link tree
    for (int v = t.size() - 1; v >= 2; v--) t.cnt[t.link[v]] += t.cnt[v];
    long long total = 0;
    for (int v = 2; v < t.size(); v++) total += t.cnt[v];
    cout << total << "\\n";
    return 0;
}`,
      explanation: [
        "During the build only the longest palindromic suffix at each position gets its counter bumped, so cnt[v] is initially the number of positions where v is the longest palindromic suffix - an undercount. Every other occurrence of v is an occurrence where some strictly longer palindrome having v as a suffix was the maximal one, i.e. a descendant of v in the suffix-link tree.",
        "So the true occurrence count is the subtree sum of cnt over the suffix-link tree. No explicit tree traversal is required: nodes are created in increasing index order and link[v] is always an already-existing node, so index order is a valid topological order and a single descending loop accumulates every subtree correctly.",
        "With occurrence counts in hand the whole family of weighted questions falls out in one extra pass: the most frequent palindrome is the node maximising cnt, and the classic 'maximise length times occurrences' is the node maximising len[v] * cnt[v].",
        "The trap is doing the sweep in forward index order, or forgetting it entirely. Forward order propagates partially accumulated values and silently undercounts nested palindromes such as 'a' inside 'aaa'.",
        "Time: O(n * 26). Space: O(n * 26).",
      ],
    },
    {
      name: "Shortest Palindrome",
      difficulty: "Hard",
      variation: "Longest palindromic prefix",
      link: "https://leetcode.com/problems/shortest-palindrome/",
      question: [
        "You are given a string s. You may only add characters in front of s. Return the shortest palindrome you can obtain this way.",
        "Example 1:\nInput: s = 'aacecaaa'\nOutput: 'aaacecaaa'\nExplanation: The longest palindromic prefix is 'aacecaa'; only the trailing 'a' has to be mirrored to the front.",
        "Example 2:\nInput: s = 'abcd'\nOutput: 'dcbabcd'\nExplanation: The longest palindromic prefix is just 'a', so 'bcd' reversed is prepended.",
        "Constraints:\n- 0 <= s.length <= 5 * 10^4\n- s consists of lowercase English letters only",
      ],
      code: `struct Eertree {
    vector<array<int,26>> nxt;
    vector<int> len, link;
    string s;
    int last;

    Eertree(int n) {
        newNode(-1); newNode(0);
        link[0] = 0; link[1] = 0;
        last = 1;
    }
    int newNode(int l) {
        nxt.push_back({}); len.push_back(l); link.push_back(0);
        return (int)nxt.size() - 1;
    }
    int getLink(int v, int i) {
        while (i - len[v] - 1 < 0 || s[i - len[v] - 1] != s[i]) v = link[v];
        return v;
    }
    void add(char c) {
        s.push_back(c);
        int i = (int)s.size() - 1, ch = c - 'a';
        int cur = getLink(last, i);
        if (!nxt[cur][ch]) {
            int now = newNode(len[cur] + 2);
            link[now] = (len[now] == 1) ? 1 : nxt[getLink(link[cur], i)][ch];
            nxt[cur][ch] = now;
        }
        last = nxt[cur][ch];
    }
};

string shortestPalindrome(string s) {
    if (s.empty()) return s;
    string r(s.rbegin(), s.rend());
    Eertree t(r.size());
    for (char c : r) t.add(c);
    int L = t.len[t.last];              // longest palindromic suffix of reverse(s)
    return r.substr(0, s.size() - L) + s;   // mirror only the part outside that prefix
}`,
      explanation: [
        "Prepending k characters can only produce a palindrome of the form reverse(tail) + s, and the result is a palindrome exactly when the prefix of s of length n - k is itself a palindrome. Minimising k therefore means maximising the length of a palindromic prefix of s.",
        "The eertree naturally reports palindromic suffixes, not prefixes. Running it on reverse(s) converts one into the other: a suffix of reverse(s) of length L is the reverse of the prefix of s of length L, and reversing preserves palindromicity, so the two are palindromic together. After consuming all of reverse(s), len[last] is that maximal L.",
        "The characters to prepend are then the first n - L characters of reverse(s), which are exactly the last n - L characters of s written backwards - no separate reversal step is needed.",
        "The classic wrong instinct is to test palindromic prefixes one by one from longest to shortest, which is O(n^2) and times out on the worst case 'aaa...ab'. The other standard fix is KMP on s + '#' + reverse(s), where the final failure value is the same L; the eertree gets it without the sentinel trick.",
        "Time: O(n * 26). Space: O(n * 26).",
      ],
    },
    {
      name: "Palindromic Characteristics",
      difficulty: "Hard",
      variation: "k-palindromes via half links",
      link: "https://codeforces.com/problemset/problem/835/D",
      question: [
        "A string is a 1-palindrome if and only if it is an ordinary palindrome. For k >= 2, a string is a k-palindrome if it is a palindrome and its prefix and suffix of length floor(len/2) are (k-1)-palindromes. The palindromic characteristics of a string s is the sequence of n numbers where the k-th number is how many substrings of s (counted by position) are k-palindromes. Note that a k-palindrome is also a j-palindrome for every j < k. Given s, print its palindromic characteristics.",
        "Example 1:\nInput:\nabba\nOutput: 6 1 0 0\nExplanation: The 6 palindromic substrings are 'a' twice, 'b' twice, 'bb' and 'abba'. Of these only 'bb' is a 2-palindrome, because its half 'b' is a palindrome, while the half 'ab' of 'abba' is not.",
        "Example 2:\nInput:\nabacaba\nOutput: 12 4 1 0 0 0 0\nExplanation: 12 palindromic substrings in total; 'aba' (twice), 'aca' and 'abacaba' are 2-palindromes, and 'abacaba' is also a 3-palindrome since its half 'aba' is a 2-palindrome.",
        "Constraints:\n- 1 <= |s| <= 5000\n- s consists of lowercase English letters",
      ],
      code: `struct Eertree {
    vector<array<int,26>> nxt;
    vector<int> len, link;
    vector<long long> cnt;
    string s;
    int last;

    Eertree(int n) {
        newNode(-1); newNode(0);
        link[0] = 0; link[1] = 0;
        last = 1;
    }
    int newNode(int l) {
        nxt.push_back({}); len.push_back(l); link.push_back(0); cnt.push_back(0);
        return (int)nxt.size() - 1;
    }
    int getLink(int v, int i) {
        while (i - len[v] - 1 < 0 || s[i - len[v] - 1] != s[i]) v = link[v];
        return v;
    }
    void add(char c) {
        s.push_back(c);
        int i = (int)s.size() - 1, ch = c - 'a';
        int cur = getLink(last, i);
        if (!nxt[cur][ch]) {
            int now = newNode(len[cur] + 2);
            link[now] = (len[now] == 1) ? 1 : nxt[getLink(link[cur], i)][ch];
            nxt[cur][ch] = now;
        }
        last = nxt[cur][ch];
        cnt[last]++;
    }
    int size() const { return (int)nxt.size(); }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    int n = (int)s.size();
    Eertree t(n);
    for (char c : s) t.add(c);
    int m = t.size();
    for (int v = m - 1; v >= 2; v--) t.cnt[t.link[v]] += t.cnt[v];   // real occurrences

    vector<int> ord(m - 2);
    for (int i = 0; i < m - 2; i++) ord[i] = i + 2;
    // a node's half is shorter than it, so process nodes by increasing length
    sort(ord.begin(), ord.end(), [&](int a, int b) { return t.len[a] < t.len[b]; });

    vector<int> k(m, 0);
    vector<long long> ans(n + 2, 0);
    for (int v : ord) {
        int half = t.len[v] / 2, u = t.link[v];
        while (t.len[u] > half) u = t.link[u];   // longest palindromic suffix of length <= half
        k[v] = (half > 0 && t.len[u] == half) ? k[u] + 1 : 1;
        ans[k[v]] += t.cnt[v];
    }
    for (int i = n; i >= 1; i--) ans[i] += ans[i + 1];   // k implies every smaller k
    for (int i = 1; i <= n; i++) cout << ans[i] << " \\n"[i == n];
    return 0;
}`,
      explanation: [
        "First reduce the definition to something the tree can answer. For a palindrome P the prefix of length m is the reverse of the suffix of length m, so the prefix is a palindrome exactly when the suffix is, and in that case the two are equal. Hence 'the half of P is a palindrome' is the same as 'the suffix-link chain of P contains a node of length exactly floor(len/2)', and when it does, that node is the half. So k[v] = k[half] + 1, and k[v] = 1 otherwise.",
        "That makes the whole computation a single pass over distinct palindromes: sort nodes by length so a half is always finished before the node that needs it, walk up the suffix links until the length drops to at most half, and read off k. Occurrences are folded in at the end by adding cnt[v] into the bucket for k[v], since every occurrence of P has the same k.",
        "The suffix sum at the end encodes the 'a k-palindrome is also a (k-1)-palindrome' clause. Skipping it reports only the exact maximal degree of each substring and fails the samples: 'abba' would print 5 1 0 0 instead of 6 1 0 0.",
        "The tempting alternative is the O(n^2) interval DP with an isPalindrome table, which also passes at n = 5000 but needs 25 million table entries. The eertree version is O(distinct palindromes) states and generalises to n = 10^6, since the only quadratic part left is the link walk, which can be replaced by a precomputed half link maintained during the build.",
        "Time: O(n * 26) to build plus O(n) per link walk, so O(n^2) worst case at n <= 5000. Space: O(n * 26).",
      ],
    },
    {
      name: "Palindrome Partitioning II",
      difficulty: "Hard",
      variation: "Minimum palindromic factorization with series links",
      link: "https://leetcode.com/problems/palindrome-partitioning-ii/",
      question: [
        "Given a string s, partition it so that every part is a palindrome. Return the minimum number of cuts needed, which is one less than the minimum number of parts.",
        "Example 1:\nInput: s = 'aab'\nOutput: 1\nExplanation: One cut gives ['aa', 'b'], and both parts are palindromes.",
        "Example 2:\nInput: s = 'aabbc'\nOutput: 2\nExplanation: ['aa', 'bb', 'c'] uses three parts, so two cuts, and no two-part split works.",
        "Constraints:\n- 1 <= s.length <= 2000\n- s consists of lowercase English letters only",
      ],
      code: `struct Eertree {
    vector<array<int,26>> nxt;
    vector<int> len, link, diff, slink;   // diff[v] = len[v] - len[link[v]], slink = series link
    string s;
    int last;

    Eertree(int n) {
        newNode(-1); newNode(0);
        link[0] = 0; link[1] = 0;
        last = 1;
    }
    int newNode(int l) {
        nxt.push_back({}); len.push_back(l); link.push_back(0);
        diff.push_back(0); slink.push_back(0);
        return (int)nxt.size() - 1;
    }
    int getLink(int v, int i) {
        while (i - len[v] - 1 < 0 || s[i - len[v] - 1] != s[i]) v = link[v];
        return v;
    }
    void add(char c) {
        s.push_back(c);
        int i = (int)s.size() - 1, ch = c - 'a';
        int cur = getLink(last, i);
        if (!nxt[cur][ch]) {
            int now = newNode(len[cur] + 2);
            link[now] = (len[now] == 1) ? 1 : nxt[getLink(link[cur], i)][ch];
            diff[now] = len[now] - len[link[now]];
            // nodes with the same diff form one arithmetic series; slink jumps past the series
            slink[now] = (diff[now] == diff[link[now]]) ? slink[link[now]] : link[now];
            nxt[cur][ch] = now;
        }
        last = nxt[cur][ch];
    }
};

int minCut(string s) {
    int n = (int)s.size();
    const int INF = 1e9;
    Eertree t(n);
    vector<int> dp(n + 1, INF), g(n + 3, INF);   // g is indexed by node and persists across i
    dp[0] = 0;
    for (int i = 1; i <= n; i++) {
        t.add(s[i - 1]);
        for (int v = t.last; t.len[v] > 0; v = t.slink[v]) {
            g[v] = dp[i - t.len[t.slink[v]] - t.diff[v]];   // best dp over this whole series
            if (t.diff[v] == t.diff[t.link[v]]) g[v] = min(g[v], g[t.link[v]]);
            if (g[v] < INF) dp[i] = min(dp[i], g[v] + 1);
        }
    }
    return dp[n] - 1;
}`,
      explanation: [
        "The DP is the obvious one: dp[i] is the fewest palindromic parts covering the first i characters, and dp[i] = 1 + min over palindromic suffixes of that prefix of dp[i - length]. The problem is that a prefix can have O(n) palindromic suffixes, giving O(n^2) transitions.",
        "The fix is the series structure of the suffix-link chain. The palindromic suffixes of any prefix, sorted by length, split into O(log n) maximal groups whose lengths form arithmetic progressions - all nodes in a group share the same diff value, and slink jumps from a node to the last node before its group. Iterating over slink therefore visits O(log n) groups instead of O(n) nodes.",
        "The per-group aggregate g[v] is what makes it work, and the reason it is correct is that a group's set of source indices at position i is the same set as at position i - diff[v], shifted by one element. So g[v] = dp[i - len[slink[v]] - diff[v]] adds the one newly available index and g[link[v]] - deliberately left over from the previous position - supplies the rest. This is exactly why g must be a persistent array indexed by node; clearing it each iteration is the classic bug and silently returns wrong answers on inputs such as 'bbb'.",
        "At n <= 2000 the plain quadratic DP with an isPalindrome table passes and is far easier to get right; this version is the one that scales to n = 10^6 and is the same skeleton used for counting factorizations.",
        "Time: O(n * 26 + n log n). Space: O(n * 26).",
      ],
    },
    {
      name: "Palindrome Partition",
      difficulty: "Hard",
      variation: "Counting symmetric even factorizations",
      link: "https://codeforces.com/problemset/problem/932/G",
      question: [
        "You are given a string s. Count the number of ways to split it into substrings p1, p2, ..., pk such that k is even and p(i) = p(k - i + 1) for every i. Two ways are different if the multiset of cut positions differs. Print the answer modulo 10^9 + 7.",
        "Example 1:\nInput:\nabab\nOutput: 1\nExplanation: The only valid split is 'ab' + 'ab' with k = 2. With k = 4 the split 'a','b','a','b' fails because p1 = 'a' but p4 = 'b'.",
        "Example 2:\nInput:\nabaaba\nOutput: 2\nExplanation: 'aba' + 'aba' with k = 2, and 'a','b','a','a','b','a' with k = 6 where p1 = p6 = 'a', p2 = p5 = 'b', p3 = p4 = 'a'.",
        "Constraints:\n- 1 <= |s| <= 10^6\n- s consists of lowercase English letters",
      ],
      code: `const long long MOD = 1000000007;

struct Eertree {
    vector<array<int,26>> nxt;
    vector<int> len, link, diff, slink;
    string s;
    int last;

    Eertree(int n) {
        nxt.reserve(n + 2); len.reserve(n + 2); link.reserve(n + 2); s.reserve(n);
        newNode(-1); newNode(0);
        link[0] = 0; link[1] = 0;
        last = 1;
    }
    int newNode(int l) {
        nxt.push_back({}); len.push_back(l); link.push_back(0);
        diff.push_back(0); slink.push_back(0);
        return (int)nxt.size() - 1;
    }
    int getLink(int v, int i) {
        while (i - len[v] - 1 < 0 || s[i - len[v] - 1] != s[i]) v = link[v];
        return v;
    }
    void add(char c) {
        s.push_back(c);
        int i = (int)s.size() - 1, ch = c - 'a';
        int cur = getLink(last, i);
        if (!nxt[cur][ch]) {
            int now = newNode(len[cur] + 2);
            link[now] = (len[now] == 1) ? 1 : nxt[getLink(link[cur], i)][ch];
            diff[now] = len[now] - len[link[now]];
            slink[now] = (diff[now] == diff[link[now]]) ? slink[link[now]] : link[now];
            nxt[cur][ch] = now;
        }
        last = nxt[cur][ch];
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    int n = (int)s.size();
    if (n % 2) { cout << 0 << "\\n"; return 0; }

    // interleave outside-in: t = s[0], s[n-1], s[1], s[n-2], ...
    string t(n, 'a');
    for (int i = 0; i < n / 2; i++) { t[2 * i] = s[i]; t[2 * i + 1] = s[n - 1 - i]; }

    Eertree e(n);
    vector<long long> dp(n + 1, 0), g(n + 3, 0);   // g persists across positions
    dp[0] = 1;
    for (int i = 1; i <= n; i++) {
        e.add(t[i - 1]);
        long long acc = 0;
        for (int v = e.last; e.len[v] > 0; v = e.slink[v]) {
            g[v] = dp[i - e.len[e.slink[v]] - e.diff[v]];
            if (e.diff[v] == e.diff[e.link[v]]) g[v] = (g[v] + g[e.link[v]]) % MOD;
            if (i % 2 == 0) acc = (acc + g[v]) % MOD;   // only even prefixes are reachable
        }
        dp[i] = acc;
    }
    cout << dp[n] << "\\n";
    return 0;
}`,
      explanation: [
        "The key move is a change of string. Interleave s from the outside in as t = s[0] s[n-1] s[1] s[n-2] ... Then the first block pair (p1 of length L matched against pk) becomes the prefix of t of length 2L, and that prefix is a palindrome exactly when p1 = pk: t[2j] = s[j] and t[2L-1-2j] = s[n-L+j], so the palindrome condition on t spells out s[j] = s[n-L+j] character by character. Peeling the pair off s corresponds to peeling that even palindrome off t, and the argument repeats on what remains.",
        "So the answer is the number of ways to cut t into even-length palindromes, which is the counting twin of the minimum palindromic factorization: dp[i] = sum of dp[i - L] over palindromic suffixes of t[0..i-1] of length L, aggregated over O(log n) series instead of O(n) suffixes.",
        "Parity is handled for free rather than by filtering lengths. dp is only accumulated at even i, so dp stays 0 at every odd index; an odd-length palindromic suffix of an even prefix lands on an odd index and contributes nothing on its own.",
        "Two traps. First, an odd |s| has no valid split at all, since the blocks pair up. Second, g must survive between iterations of i - it is the previous position's group aggregate that the recurrence reuses - so it has to be a node-indexed array allocated once, and modular reduction must be applied at both places where g is combined.",
        "Time: O(n * 26 + n log n). Space: O(n * 26).",
      ],
    },
    {
      name: "Prefix-Suffix Palindrome (Hard version)",
      difficulty: "Hard",
      variation: "Longest palindromic prefix or suffix of the core",
      link: "https://codeforces.com/problemset/problem/1326/D2",
      question: [
        "You are given a string s. Find the longest string t that is a palindrome and can be written as a + b, where a is a prefix of s, b is a suffix of s, and |a| + |b| <= |s|. Either part may be empty. If several answers have the same maximum length, print any of them. The input has multiple test cases.",
        "Example 1:\nInput:\n2\nabcdfdcecba\nabbaxyzyx\nOutput:\nabcdfdcba\nxyzyx\nExplanation: In the first string the outer characters match for three steps, giving a = 'abc' and b = 'cba'; the core left over is 'dfdce', whose longest palindromic prefix is 'dfd', so the answer is 'abc' + 'dfd' + 'cba'. In the second the very first characters differ, so nothing is peeled and the answer is the longest palindromic prefix or suffix of the whole string, which is the suffix 'xyzyx'.",
        "Example 2:\nInput:\n2\ncodeforces\nacbba\nOutput:\nc\nabba\nExplanation: In 'codeforces' no outer pair matches and every palindromic prefix or suffix has length 1. In 'acbba' the outer 'a's match, the core is 'cbb', and its longest palindromic suffix 'bb' beats its longest palindromic prefix 'c', giving 'a' + 'bb' + 'a'.",
        "Constraints:\n- 1 <= t <= 10^5\n- 1 <= |s| <= 10^6 and the sum of |s| over all test cases is at most 10^6\n- s consists of lowercase English letters",
      ],
      code: `struct Eertree {
    vector<array<int,26>> nxt;
    vector<int> len, link;
    string s;
    int last;

    Eertree(int n) {
        nxt.reserve(n + 2); len.reserve(n + 2); link.reserve(n + 2); s.reserve(n);
        newNode(-1); newNode(0);
        link[0] = 0; link[1] = 0;
        last = 1;
    }
    int newNode(int l) {
        nxt.push_back({}); len.push_back(l); link.push_back(0);
        return (int)nxt.size() - 1;
    }
    int getLink(int v, int i) {
        while (i - len[v] - 1 < 0 || s[i - len[v] - 1] != s[i]) v = link[v];
        return v;
    }
    void add(char c) {
        s.push_back(c);
        int i = (int)s.size() - 1, ch = c - 'a';
        int cur = getLink(last, i);
        if (!nxt[cur][ch]) {
            int now = newNode(len[cur] + 2);
            link[now] = (len[now] == 1) ? 1 : nxt[getLink(link[cur], i)][ch];
            nxt[cur][ch] = now;
        }
        last = nxt[cur][ch];
    }
};

int longestPalSuffix(const string& x) {
    if (x.empty()) return 0;
    Eertree t(x.size());
    for (char c : x) t.add(c);
    return t.len[t.last];
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int T;
    cin >> T;
    while (T--) {
        string s;
        cin >> s;
        int n = (int)s.size(), k = 0;
        while (k < n - 1 - k && s[k] == s[n - 1 - k]) k++;   // peel matching outer pairs
        string mid = s.substr(k, n - 2 * k);
        string best;
        if (!mid.empty()) {
            int ls = longestPalSuffix(mid);
            string rm(mid.rbegin(), mid.rend());
            int lp = longestPalSuffix(rm);                   // longest palindromic prefix of mid
            best = (lp >= ls) ? mid.substr(0, lp) : mid.substr(mid.size() - ls);
        }
        cout << s.substr(0, k) + best + s.substr(n - k) << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Two structural claims turn this into a palindromic-prefix query. First, if s[0] = s[n-1] then some optimal answer uses that pair: any palindromic a + b can be wrapped by the matching outer characters and stays a palindrome, and the wrap only makes it longer. Peeling greedily while the ends match is therefore safe and yields the maximal outer shell of length k on each side.",
        "Second, once s[k] differs from s[n-1-k], the remaining core can contribute only from one side. The contribution is a palindrome that is a prefix of the core or a suffix of the core, and it cannot be both a nonempty prefix and a nonempty suffix, because the first and last characters of the core differ. So the answer is the shell plus the longer of the core's longest palindromic prefix and longest palindromic suffix.",
        "The eertree answers both in linear time: len[last] after consuming the core is its longest palindromic suffix, and the same run on the reversed core gives its longest palindromic prefix. The |a| + |b| <= |s| rule is respected automatically because the shell and the core are disjoint by construction.",
        "The trap is the peeling loop's bound. Using k < n - k instead of k < n - 1 - k lets a fully palindromic string peel its middle character from both sides at once - on 'aba' it would reach k = 2 with only 3 characters available, so the two shells overlap and the substr for the core goes out of range. Stopping one short of the midpoint keeps them disjoint.",
        "Time: O(total length * 26) over all test cases. Space: O(max |s| * 26), freed between test cases.",
      ],
    },
  ],
};
