import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Kasai's Algorithm for Construction of the LCP Array",
      difficulty: "Easy",
      variation: "Kasai template, LCP of adjacent suffixes",
      question: [
        "Given a string s of length n and its suffix array sa (sa[i] is the starting index of the i-th smallest suffix), build the LCP array. Define lcp[i] as the length of the longest common prefix of the suffixes starting at sa[i] and sa[i+1], so the LCP array has n-1 entries. Do it in linear time after the suffix array is known.",
        "Example 1:\nInput: s = 'banana'\nOutput: sa = [5, 3, 1, 0, 4, 2], lcp = [1, 3, 0, 0, 2]\nExplanation: The sorted suffixes are a, ana, anana, banana, na, nana. LCP(a, ana) = 1, LCP(ana, anana) = 3, LCP(anana, banana) = 0, LCP(banana, na) = 0, LCP(na, nana) = 2.",
        "Example 2:\nInput: s = 'abcd'\nOutput: sa = [0, 1, 2, 3], lcp = [0, 0, 0]\nExplanation: No two suffixes of a string with all-distinct characters share a first character.",
        "Constraints:\n- 1 <= n <= 10^6\n- s consists of characters with codes 1..255 (code 0 is reserved as an internal sentinel)",
      ],
      code: `// O(n log n) suffix array by cyclic shifts and counting sort.
// A sentinel smaller than every real character is appended so that the
// cyclic order of the shifts equals the lexicographic order of the suffixes.
vector<int> suffixArray(string s) {
    s += char(0);
    int n = s.size(), alphabet = 256;
    vector<int> p(n), c(n), cnt(max(alphabet, n), 0);
    for (int i = 0; i < n; i++) cnt[(unsigned char)s[i]]++;
    for (int i = 1; i < alphabet; i++) cnt[i] += cnt[i - 1];
    for (int i = 0; i < n; i++) p[--cnt[(unsigned char)s[i]]] = i;
    c[p[0]] = 0;
    int classes = 1;
    for (int i = 1; i < n; i++) {
        if (s[p[i]] != s[p[i - 1]]) classes++;
        c[p[i]] = classes - 1;
    }
    vector<int> pn(n), cn(n);
    for (int h = 0; (1 << h) < n; h++) {
        for (int i = 0; i < n; i++) {          // sort by the second half for free
            pn[i] = p[i] - (1 << h);
            if (pn[i] < 0) pn[i] += n;
        }
        fill(cnt.begin(), cnt.begin() + classes, 0);
        for (int i = 0; i < n; i++) cnt[c[pn[i]]]++;
        for (int i = 1; i < classes; i++) cnt[i] += cnt[i - 1];
        for (int i = n - 1; i >= 0; i--) p[--cnt[c[pn[i]]]] = pn[i];   // stable
        cn[p[0]] = 0;
        classes = 1;
        for (int i = 1; i < n; i++) {
            pair<int,int> cur = {c[p[i]], c[(p[i] + (1 << h)) % n]};
            pair<int,int> prv = {c[p[i - 1]], c[(p[i - 1] + (1 << h)) % n]};
            if (cur != prv) classes++;
            cn[p[i]] = classes - 1;
        }
        c.swap(cn);
    }
    return vector<int>(p.begin() + 1, p.end());   // drop the sentinel suffix
}

// Kasai: lcp[i] = LCP(suffix sa[i], suffix sa[i+1]), size n-1.
vector<int> kasai(const string& s, const vector<int>& sa) {
    int n = s.size();
    if (n == 0) return {};
    vector<int> pos(n), lcp(n - 1);
    for (int i = 0; i < n; i++) pos[sa[i]] = i;   // inverse permutation
    int h = 0;
    for (int i = 0; i < n; i++) {                 // walk suffixes by START index
        if (pos[i] == 0) { h = 0; continue; }      // smallest suffix has no predecessor
        int j = sa[pos[i] - 1];
        while (i + h < n && j + h < n && s[i + h] == s[j + h]) h++;
        lcp[pos[i] - 1] = h;
        if (h) h--;                               // h can drop by at most 1 per step
    }
    return lcp;
}`,
      explanation: [
        "The LCP array is the second half of the suffix-array toolkit. Sorting the suffixes puts every pair that shares a long prefix next to each other, and the LCP array records exactly how long that shared prefix is. Almost every substring-counting problem then becomes arithmetic over this array.",
        "Kasai's trick is the order of iteration. Instead of walking the suffixes in sorted order, walk them by starting position i = 0, 1, 2, ... The key fact is: if suffix i and its sorted predecessor share h characters, then suffix i+1 and its own sorted predecessor share at least h-1 characters. Reason: dropping the first character of both strings leaves a common prefix of length h-1, and suffix i+1's actual predecessor in sorted order is at least as close to it as that string is. So h only needs to be decremented by one before each step, never reset.",
        "That gives the amortised bound: h increases at most n times in total across the whole loop and decreases at most once per position, so the total character comparison work is O(n) even though a single step can scan far.",
        "The classic mistake is to reset h = 0 each iteration, which turns the routine into O(n^2) on strings like 'aaaa...a' - the very inputs where LCP values are large and the array actually matters. The other trap is indexing: lcp has n-1 entries and lcp[i] pairs sa[i] with sa[i+1]; off-by-one here silently corrupts every downstream count.",
        "A general query LCP(suffix a, suffix b) for arbitrary a and b equals min(lcp[pos[a] .. pos[b]-1]) when pos[a] < pos[b], so a sparse-table RMQ over the LCP array answers arbitrary pairs in O(1) after O(n log n) preprocessing.",
        "Time: O(n log n) for the suffix array plus O(n) for Kasai. Space: O(n).",
      ],
    },
    {
      name: "Repeating Substring",
      difficulty: "Easy",
      variation: "Longest repeated substring = max LCP",
      link: "https://cses.fi/problemset/task/2106",
      question: [
        "Given a string of length n, find the longest substring that appears in it at least twice. The two occurrences are allowed to overlap. Print that substring, or -1 if no substring occurs twice. If several substrings of the maximum length qualify, any one of them is accepted.",
        "Example 1:\nInput: abcabca\nOutput: abca\nExplanation: 'abca' occurs at positions 0 and 3. No length-5 substring repeats.",
        "Example 2:\nInput: aabaacabaa\nOutput: abaa\nExplanation: 'abaa' occurs at positions 1 and 6. The overlapping candidates 'aa' and 'aba' are shorter.",
        "Example 3:\nInput: abcd\nOutput: -1\nExplanation: Every character is distinct, so nothing repeats.",
        "Constraints:\n- 1 <= n <= 10^5\n- The string consists of lowercase English letters",
      ],
      code: `vector<int> suffixArray(string s) {
    s += char(0);
    int n = s.size(), alphabet = 256;
    vector<int> p(n), c(n), cnt(max(alphabet, n), 0);
    for (int i = 0; i < n; i++) cnt[(unsigned char)s[i]]++;
    for (int i = 1; i < alphabet; i++) cnt[i] += cnt[i - 1];
    for (int i = 0; i < n; i++) p[--cnt[(unsigned char)s[i]]] = i;
    c[p[0]] = 0;
    int classes = 1;
    for (int i = 1; i < n; i++) {
        if (s[p[i]] != s[p[i - 1]]) classes++;
        c[p[i]] = classes - 1;
    }
    vector<int> pn(n), cn(n);
    for (int h = 0; (1 << h) < n; h++) {
        for (int i = 0; i < n; i++) {
            pn[i] = p[i] - (1 << h);
            if (pn[i] < 0) pn[i] += n;
        }
        fill(cnt.begin(), cnt.begin() + classes, 0);
        for (int i = 0; i < n; i++) cnt[c[pn[i]]]++;
        for (int i = 1; i < classes; i++) cnt[i] += cnt[i - 1];
        for (int i = n - 1; i >= 0; i--) p[--cnt[c[pn[i]]]] = pn[i];
        cn[p[0]] = 0;
        classes = 1;
        for (int i = 1; i < n; i++) {
            pair<int,int> cur = {c[p[i]], c[(p[i] + (1 << h)) % n]};
            pair<int,int> prv = {c[p[i - 1]], c[(p[i - 1] + (1 << h)) % n]};
            if (cur != prv) classes++;
            cn[p[i]] = classes - 1;
        }
        c.swap(cn);
    }
    return vector<int>(p.begin() + 1, p.end());
}

vector<int> kasai(const string& s, const vector<int>& sa) {
    int n = s.size();
    vector<int> pos(n), lcp(n - 1);
    for (int i = 0; i < n; i++) pos[sa[i]] = i;
    int h = 0;
    for (int i = 0; i < n; i++) {
        if (pos[i] == 0) { h = 0; continue; }
        int j = sa[pos[i] - 1];
        while (i + h < n && j + h < n && s[i + h] == s[j + h]) h++;
        lcp[pos[i] - 1] = h;
        if (h) h--;
    }
    return lcp;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    int n = s.size();
    vector<int> sa = suffixArray(s);
    vector<int> lcp = kasai(s, sa);
    int best = 0, at = -1;
    for (int i = 0; i + 1 < n; i++) {
        if (lcp[i] > best) { best = lcp[i]; at = i; }
    }
    if (best == 0) cout << -1 << "\\n";
    else cout << s.substr(sa[at], best) << "\\n";
    return 0;
}`,
      explanation: [
        "A substring occurs at least twice exactly when it is a common prefix of two different suffixes. So the answer length is the maximum over all pairs of suffixes of their common-prefix length.",
        "That maximum is always attained by an adjacent pair in the suffix array. For any pair (a, b) with pos[a] < pos[b], LCP(a, b) = min of the lcp values strictly between them, and a minimum of a set never exceeds any single member. So scanning only the n-1 adjacent values loses nothing, and the answer is simply max(lcp).",
        "Recovering the substring itself needs the index of the maximum: if lcp[i] is the maximum, the substring is the first lcp[i] characters of the suffix at sa[i]. Any suffix in that adjacent pair works, since they share that prefix.",
        "The tempting wrong approach is binary searching the length with a hash set of all substrings of that length - it works, but it is O(n log n) hashing with collision risk, and it cannot be extended to the counting variants that follow. Note also that overlap is allowed here: 'aa' in 'aaa' counts as two occurrences, which the LCP formulation handles for free because it only looks at start positions.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Number of Distinct Substrings in a String",
      difficulty: "Medium",
      variation: "Counting distinct substrings",
      link: "https://leetcode.com/problems/number-of-distinct-substrings-in-a-string/",
      question: [
        "Given a string s, return the number of distinct substrings of s. A substring is a contiguous non-empty sequence of characters, and two substrings are the same if they are equal as strings, no matter where they occur.",
        "Example 1:\nInput: s = 'aabbaba'\nOutput: 21\nExplanation: There are 28 substrings counted with position, but only 21 are distinct once duplicates like 'a', 'b' and 'ab' are collapsed.",
        "Example 2:\nInput: s = 'abcdefg'\nOutput: 28\nExplanation: All characters are distinct, so all 7 * 8 / 2 = 28 substrings are different.",
        "Constraints:\n- 1 <= s.length <= 500\n- s consists of lowercase English letters",
      ],
      code: `class Solution {
    vector<int> suffixArray(string s) {
        s += char(0);
        int n = s.size(), alphabet = 256;
        vector<int> p(n), c(n), cnt(max(alphabet, n), 0);
        for (int i = 0; i < n; i++) cnt[(unsigned char)s[i]]++;
        for (int i = 1; i < alphabet; i++) cnt[i] += cnt[i - 1];
        for (int i = 0; i < n; i++) p[--cnt[(unsigned char)s[i]]] = i;
        c[p[0]] = 0;
        int classes = 1;
        for (int i = 1; i < n; i++) {
            if (s[p[i]] != s[p[i - 1]]) classes++;
            c[p[i]] = classes - 1;
        }
        vector<int> pn(n), cn(n);
        for (int h = 0; (1 << h) < n; h++) {
            for (int i = 0; i < n; i++) {
                pn[i] = p[i] - (1 << h);
                if (pn[i] < 0) pn[i] += n;
            }
            fill(cnt.begin(), cnt.begin() + classes, 0);
            for (int i = 0; i < n; i++) cnt[c[pn[i]]]++;
            for (int i = 1; i < classes; i++) cnt[i] += cnt[i - 1];
            for (int i = n - 1; i >= 0; i--) p[--cnt[c[pn[i]]]] = pn[i];
            cn[p[0]] = 0;
            classes = 1;
            for (int i = 1; i < n; i++) {
                pair<int,int> cur = {c[p[i]], c[(p[i] + (1 << h)) % n]};
                pair<int,int> prv = {c[p[i - 1]], c[(p[i - 1] + (1 << h)) % n]};
                if (cur != prv) classes++;
                cn[p[i]] = classes - 1;
            }
            c.swap(cn);
        }
        return vector<int>(p.begin() + 1, p.end());
    }

    vector<int> kasai(const string& s, const vector<int>& sa) {
        int n = s.size();
        vector<int> pos(n), lcp(n - 1);
        for (int i = 0; i < n; i++) pos[sa[i]] = i;
        int h = 0;
        for (int i = 0; i < n; i++) {
            if (pos[i] == 0) { h = 0; continue; }
            int j = sa[pos[i] - 1];
            while (i + h < n && j + h < n && s[i + h] == s[j + h]) h++;
            lcp[pos[i] - 1] = h;
            if (h) h--;
        }
        return lcp;
    }

public:
    int countDistinct(string s) {
        long long n = s.size();
        vector<int> sa = suffixArray(s);
        vector<int> lcp = kasai(s, sa);
        long long total = n * (n + 1) / 2;      // substrings counted with position
        for (int v : lcp) total -= v;           // remove each duplicate exactly once
        return (int)total;
    }
};`,
      explanation: [
        "Every substring is a prefix of some suffix, so counting substrings with position is the same as counting prefixes of suffixes: n*(n+1)/2 in total. The job is to subtract the duplicates.",
        "Process the suffixes in sorted order. Suffix sa[i] has length L = n - sa[i], so it has L prefixes. Of those, the first lcp[i-1] are also prefixes of sa[i-1] and therefore already seen; the remaining L - lcp[i-1] are new. Summing L - lcp[i-1] over all i gives n*(n+1)/2 - sum(lcp).",
        "The correctness hinges on only having to compare against the immediate predecessor. If a prefix of length t of suffix sa[i] appeared earlier at some sa[j] with j < i, then every suffix between j and i also starts with it, because the suffix array is sorted - so in particular sa[i-1] does, which means t <= lcp[i-1]. One comparison per suffix suffices; there is no need for a set or a trie.",
        "The tempting wrong approach for the small constraints here is a hash set of substrings, which is O(n^3) in character copying and blows up past a few thousand characters. The LCP formula scales to n = 10^5 unchanged. Note the count needs 64-bit arithmetic at scale even though LeetCode's small bound hides that.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Distinct Substrings",
      difficulty: "Medium",
      variation: "Counting distinct substrings at judge scale",
      link: "https://cses.fi/problemset/task/2105",
      question: [
        "You are given a string of length n. Calculate the number of distinct substrings it contains. Read the string from standard input and print a single integer.",
        "Example 1:\nInput: abaa\nOutput: 8\nExplanation: The distinct substrings are a, aa, ab, aba, abaa, b, ba, baa. There are 10 substrings counted with position, and 2 of them are repeats of 'a'.",
        "Example 2:\nInput: banana\nOutput: 15\nExplanation: 21 substrings by position, minus the LCP array sum 1 + 3 + 0 + 0 + 2 = 6, gives 15.",
        "Constraints:\n- 1 <= n <= 10^5\n- The string consists of lowercase English letters\n- The answer can reach about 5 * 10^9, so it does not fit in a 32-bit integer",
      ],
      code: `vector<int> suffixArray(string s) {
    s += char(0);
    int n = s.size(), alphabet = 256;
    vector<int> p(n), c(n), cnt(max(alphabet, n), 0);
    for (int i = 0; i < n; i++) cnt[(unsigned char)s[i]]++;
    for (int i = 1; i < alphabet; i++) cnt[i] += cnt[i - 1];
    for (int i = 0; i < n; i++) p[--cnt[(unsigned char)s[i]]] = i;
    c[p[0]] = 0;
    int classes = 1;
    for (int i = 1; i < n; i++) {
        if (s[p[i]] != s[p[i - 1]]) classes++;
        c[p[i]] = classes - 1;
    }
    vector<int> pn(n), cn(n);
    for (int h = 0; (1 << h) < n; h++) {
        for (int i = 0; i < n; i++) {
            pn[i] = p[i] - (1 << h);
            if (pn[i] < 0) pn[i] += n;
        }
        fill(cnt.begin(), cnt.begin() + classes, 0);
        for (int i = 0; i < n; i++) cnt[c[pn[i]]]++;
        for (int i = 1; i < classes; i++) cnt[i] += cnt[i - 1];
        for (int i = n - 1; i >= 0; i--) p[--cnt[c[pn[i]]]] = pn[i];
        cn[p[0]] = 0;
        classes = 1;
        for (int i = 1; i < n; i++) {
            pair<int,int> cur = {c[p[i]], c[(p[i] + (1 << h)) % n]};
            pair<int,int> prv = {c[p[i - 1]], c[(p[i - 1] + (1 << h)) % n]};
            if (cur != prv) classes++;
            cn[p[i]] = classes - 1;
        }
        c.swap(cn);
    }
    return vector<int>(p.begin() + 1, p.end());
}

vector<int> kasai(const string& s, const vector<int>& sa) {
    int n = s.size();
    vector<int> pos(n), lcp(n - 1);
    for (int i = 0; i < n; i++) pos[sa[i]] = i;
    int h = 0;
    for (int i = 0; i < n; i++) {
        if (pos[i] == 0) { h = 0; continue; }
        int j = sa[pos[i] - 1];
        while (i + h < n && j + h < n && s[i + h] == s[j + h]) h++;
        lcp[pos[i] - 1] = h;
        if (h) h--;
    }
    return lcp;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    long long n = s.size();
    vector<int> sa = suffixArray(s);
    vector<int> lcp = kasai(s, sa);
    long long ans = n * (n + 1) / 2;
    for (int v : lcp) ans -= v;      // each duplicated prefix removed once
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "Same identity as the LeetCode version: distinct substrings = n*(n+1)/2 - sum of the LCP array. What changes is that the input is judge-scale, so the O(n^2) or set-based approaches are dead and the arithmetic overflows a 32-bit int.",
        "With n = 10^5 the count of substrings by position is about 5 * 10^9, so n must be promoted to long long before the multiplication - writing n*(n+1)/2 with int n overflows before the assignment ever happens, which is the single most common wrong answer on this task.",
        "The sum of the LCP array is at most n^2/2 in theory but the difference is what matters, and both fit comfortably in 64 bits.",
        "Reading with cin >> s is safe here because the input is a single token; getline would also pick up a trailing carriage return on some inputs and inflate n by one.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Longest Common Substring",
      difficulty: "Medium",
      variation: "Two strings, concatenate with a separator",
      link: "https://www.spoj.com/problems/LCS/",
      question: [
        "You are given two strings A and B. Find the length of the longest string that is a substring of both A and B. Print 0 if they share no character.",
        "Example 1:\nInput:\nalsdfkjfjkdsal\nfdjskalajfkdsla\nOutput: 3\nExplanation: 'kds' occurs in both (at index 9 of A and index 10 of B). No common substring of length 4 exists.",
        "Example 2:\nInput:\nabcdxyz\nxyzabcd\nOutput: 4\nExplanation: 'abcd' is a substring of both.",
        "Constraints:\n- 1 <= |A|, |B| <= 250000\n- The strings consist of lowercase English letters",
      ],
      code: `vector<int> suffixArray(string s) {
    s += char(0);
    int n = s.size(), alphabet = 256;
    vector<int> p(n), c(n), cnt(max(alphabet, n), 0);
    for (int i = 0; i < n; i++) cnt[(unsigned char)s[i]]++;
    for (int i = 1; i < alphabet; i++) cnt[i] += cnt[i - 1];
    for (int i = 0; i < n; i++) p[--cnt[(unsigned char)s[i]]] = i;
    c[p[0]] = 0;
    int classes = 1;
    for (int i = 1; i < n; i++) {
        if (s[p[i]] != s[p[i - 1]]) classes++;
        c[p[i]] = classes - 1;
    }
    vector<int> pn(n), cn(n);
    for (int h = 0; (1 << h) < n; h++) {
        for (int i = 0; i < n; i++) {
            pn[i] = p[i] - (1 << h);
            if (pn[i] < 0) pn[i] += n;
        }
        fill(cnt.begin(), cnt.begin() + classes, 0);
        for (int i = 0; i < n; i++) cnt[c[pn[i]]]++;
        for (int i = 1; i < classes; i++) cnt[i] += cnt[i - 1];
        for (int i = n - 1; i >= 0; i--) p[--cnt[c[pn[i]]]] = pn[i];
        cn[p[0]] = 0;
        classes = 1;
        for (int i = 1; i < n; i++) {
            pair<int,int> cur = {c[p[i]], c[(p[i] + (1 << h)) % n]};
            pair<int,int> prv = {c[p[i - 1]], c[(p[i - 1] + (1 << h)) % n]};
            if (cur != prv) classes++;
            cn[p[i]] = classes - 1;
        }
        c.swap(cn);
    }
    return vector<int>(p.begin() + 1, p.end());
}

vector<int> kasai(const string& s, const vector<int>& sa) {
    int n = s.size();
    vector<int> pos(n), lcp(n - 1);
    for (int i = 0; i < n; i++) pos[sa[i]] = i;
    int h = 0;
    for (int i = 0; i < n; i++) {
        if (pos[i] == 0) { h = 0; continue; }
        int j = sa[pos[i] - 1];
        while (i + h < n && j + h < n && s[i + h] == s[j + h]) h++;
        lcp[pos[i] - 1] = h;
        if (h) h--;
    }
    return lcp;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string a, b;
    cin >> a >> b;
    int na = a.size();
    string s = a + char(1) + b;      // separator below 'a' and absent from both
    int n = s.size();
    vector<int> sa = suffixArray(s);
    vector<int> lcp = kasai(s, sa);
    int ans = 0;
    for (int i = 0; i + 1 < n; i++) {
        int u = sa[i], v = sa[i + 1];
        if (u == na || v == na) continue;             // the separator suffix itself
        if ((u < na) != (v < na)) ans = max(ans, lcp[i]);   // one from each side
    }
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "Concatenate the two strings with a separator character that appears in neither and is lexicographically smaller than every real character. Then a string is a common substring exactly when it is a common prefix of one suffix that starts inside A and one that starts inside B.",
        "The separator is what makes this sound. Without it, a candidate could straddle the boundary and be reported as a common substring even though it exists in neither input alone. Because the separator is unique, no common prefix of two suffixes can ever extend across it - the comparison stops at that character.",
        "As in the repeated-substring version, the best pair is adjacent in the suffix array, so a single linear scan over the LCP array filtering for adjacent pairs whose owners differ gives the answer. The owner test is just 'is the start index below |A|'.",
        "Watch two details: skip the suffix that begins exactly at the separator (it belongs to neither string), and if you build the separator from a printable character like '#' make sure it truly cannot appear in the input. The classic alternative is the O(|A| * |B|) DP, which is simpler to write but quadratic in memory and time and does not generalise to many strings.",
        "Time: O(n log n) with n = |A| + |B| + 1. Space: O(n).",
      ],
    },
    {
      name: "Longest Duplicate Substring",
      difficulty: "Hard",
      variation: "Return the repeated substring itself",
      link: "https://leetcode.com/problems/longest-duplicate-substring/",
      question: [
        "Given a string s, consider all duplicated substrings: contiguous substrings of s that occur two or more times. The occurrences may overlap. Return any duplicated substring that has the longest possible length. If s does not have a duplicated substring, return the empty string.",
        "Example 1:\nInput: s = 'banana'\nOutput: 'ana'\nExplanation: 'ana' occurs at indices 1 and 3, overlapping. Nothing of length 4 repeats.",
        "Example 2:\nInput: s = 'abcd'\nOutput: ''\nExplanation: No substring occurs twice.",
        "Constraints:\n- 2 <= s.length <= 3 * 10^4\n- s consists of lowercase English letters",
      ],
      code: `class Solution {
    vector<int> suffixArray(string s) {
        s += char(0);
        int n = s.size(), alphabet = 256;
        vector<int> p(n), c(n), cnt(max(alphabet, n), 0);
        for (int i = 0; i < n; i++) cnt[(unsigned char)s[i]]++;
        for (int i = 1; i < alphabet; i++) cnt[i] += cnt[i - 1];
        for (int i = 0; i < n; i++) p[--cnt[(unsigned char)s[i]]] = i;
        c[p[0]] = 0;
        int classes = 1;
        for (int i = 1; i < n; i++) {
            if (s[p[i]] != s[p[i - 1]]) classes++;
            c[p[i]] = classes - 1;
        }
        vector<int> pn(n), cn(n);
        for (int h = 0; (1 << h) < n; h++) {
            for (int i = 0; i < n; i++) {
                pn[i] = p[i] - (1 << h);
                if (pn[i] < 0) pn[i] += n;
            }
            fill(cnt.begin(), cnt.begin() + classes, 0);
            for (int i = 0; i < n; i++) cnt[c[pn[i]]]++;
            for (int i = 1; i < classes; i++) cnt[i] += cnt[i - 1];
            for (int i = n - 1; i >= 0; i--) p[--cnt[c[pn[i]]]] = pn[i];
            cn[p[0]] = 0;
            classes = 1;
            for (int i = 1; i < n; i++) {
                pair<int,int> cur = {c[p[i]], c[(p[i] + (1 << h)) % n]};
                pair<int,int> prv = {c[p[i - 1]], c[(p[i - 1] + (1 << h)) % n]};
                if (cur != prv) classes++;
                cn[p[i]] = classes - 1;
            }
            c.swap(cn);
        }
        return vector<int>(p.begin() + 1, p.end());
    }

    vector<int> kasai(const string& s, const vector<int>& sa) {
        int n = s.size();
        vector<int> pos(n), lcp(n - 1);
        for (int i = 0; i < n; i++) pos[sa[i]] = i;
        int h = 0;
        for (int i = 0; i < n; i++) {
            if (pos[i] == 0) { h = 0; continue; }
            int j = sa[pos[i] - 1];
            while (i + h < n && j + h < n && s[i + h] == s[j + h]) h++;
            lcp[pos[i] - 1] = h;
            if (h) h--;
        }
        return lcp;
    }

public:
    string longestDupSubstring(string s) {
        int n = s.size();
        vector<int> sa = suffixArray(s);
        vector<int> lcp = kasai(s, sa);
        int best = 0, at = 0;
        for (int i = 0; i + 1 < n; i++) {
            if (lcp[i] > best) { best = lcp[i]; at = i; }
        }
        return best == 0 ? string() : s.substr(sa[at], best);
    }
};`,
      explanation: [
        "This is the maximum-LCP problem again, but the answer is the substring rather than its length, which is why the index of the maximum has to be tracked. The substring is the first lcp[at] characters of the suffix at sa[at].",
        "Why adjacency is enough: for any two suffixes, their common prefix length is the minimum of the LCP values in the SA range between them, so it can never exceed the largest adjacent value. The global maximum of the LCP array is therefore the longest substring occurring at least twice, and it is realised by the pair that produced it.",
        "The editorial solution is binary search on the length plus Rabin-Karp: check whether some length-L substring repeats by hashing all n-L+1 windows. That is O(n log n) too, but it is probabilistic - a single hash modulus is defeatable and even random moduli need care on adversarial tests. The suffix-array answer is exact and needs no modulus.",
        "The overlap allowance is free here. LCP compares start positions only, so 'aa' inside 'aaa' correctly counts as two occurrences. If the problem had forbidden overlap you would instead need, for each candidate length, the maximum minus minimum start index inside each LCP-block to be at least that length - a different and strictly harder check.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Substring Distribution",
      difficulty: "Hard",
      variation: "Distinct substrings per length, difference array",
      link: "https://cses.fi/problemset/task/2110",
      question: [
        "Given a string of length n, for every k = 1, 2, ..., n calculate the number of distinct substrings of length exactly k. Print the n numbers on one line.",
        "Example 1:\nInput: abaa\nOutput: 2 3 2 1\nExplanation: Length 1: a, b (2). Length 2: ab, ba, aa (3). Length 3: aba, baa (2). Length 4: abaa (1).",
        "Example 2:\nInput: banana\nOutput: 3 3 3 3 2 1\nExplanation: Length 1: a, b, n. Length 2: an, ba, na. Length 3: ana, ban, nan. Length 4: anan, bana, nana. Length 5: anana, banan. Length 6: banana.",
        "Constraints:\n- 1 <= n <= 10^5\n- The string consists of lowercase English letters",
      ],
      code: `vector<int> suffixArray(string s) {
    s += char(0);
    int n = s.size(), alphabet = 256;
    vector<int> p(n), c(n), cnt(max(alphabet, n), 0);
    for (int i = 0; i < n; i++) cnt[(unsigned char)s[i]]++;
    for (int i = 1; i < alphabet; i++) cnt[i] += cnt[i - 1];
    for (int i = 0; i < n; i++) p[--cnt[(unsigned char)s[i]]] = i;
    c[p[0]] = 0;
    int classes = 1;
    for (int i = 1; i < n; i++) {
        if (s[p[i]] != s[p[i - 1]]) classes++;
        c[p[i]] = classes - 1;
    }
    vector<int> pn(n), cn(n);
    for (int h = 0; (1 << h) < n; h++) {
        for (int i = 0; i < n; i++) {
            pn[i] = p[i] - (1 << h);
            if (pn[i] < 0) pn[i] += n;
        }
        fill(cnt.begin(), cnt.begin() + classes, 0);
        for (int i = 0; i < n; i++) cnt[c[pn[i]]]++;
        for (int i = 1; i < classes; i++) cnt[i] += cnt[i - 1];
        for (int i = n - 1; i >= 0; i--) p[--cnt[c[pn[i]]]] = pn[i];
        cn[p[0]] = 0;
        classes = 1;
        for (int i = 1; i < n; i++) {
            pair<int,int> cur = {c[p[i]], c[(p[i] + (1 << h)) % n]};
            pair<int,int> prv = {c[p[i - 1]], c[(p[i - 1] + (1 << h)) % n]};
            if (cur != prv) classes++;
            cn[p[i]] = classes - 1;
        }
        c.swap(cn);
    }
    return vector<int>(p.begin() + 1, p.end());
}

vector<int> kasai(const string& s, const vector<int>& sa) {
    int n = s.size();
    vector<int> pos(n), lcp(n - 1);
    for (int i = 0; i < n; i++) pos[sa[i]] = i;
    int h = 0;
    for (int i = 0; i < n; i++) {
        if (pos[i] == 0) { h = 0; continue; }
        int j = sa[pos[i] - 1];
        while (i + h < n && j + h < n && s[i + h] == s[j + h]) h++;
        lcp[pos[i] - 1] = h;
        if (h) h--;
    }
    return lcp;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    int n = s.size();
    vector<int> sa = suffixArray(s);
    vector<int> lcp = kasai(s, sa);
    vector<long long> diff(n + 2, 0);
    for (int i = 0; i < n; i++) {
        int len = n - sa[i];                 // length of this suffix
        int seen = (i == 0 ? 0 : lcp[i - 1]);  // prefixes already counted
        if (seen + 1 <= len) {               // range update over [seen+1, len]
            diff[seen + 1]++;
            diff[len + 1]--;
        }
    }
    long long run = 0;
    for (int k = 1; k <= n; k++) {
        run += diff[k];
        cout << run << (k == n ? '\\n' : ' ');
    }
    return 0;
}`,
      explanation: [
        "The per-suffix accounting from the distinct-substring count carries over, but instead of adding the number L - lcp[i-1] to a total, record which lengths those new substrings have. They are exactly the lengths lcp[i-1]+1 through L, a contiguous range.",
        "So each suffix contributes +1 to a contiguous range of the answer array. Doing n range increments naively is O(n^2); a difference array turns each into two point updates and one final prefix scan, giving O(n) overall.",
        "Correctness of 'new lengths start at lcp[i-1]+1': a prefix of suffix sa[i] of length t was seen earlier if and only if some earlier suffix in sorted order starts with it, and by sortedness that forces sa[i-1] to start with it too, i.e. t <= lcp[i-1]. Conversely any t > lcp[i-1] is genuinely new because no earlier suffix shares that many characters. Only the immediate predecessor is ever needed.",
        "The trap is double counting a length: if you add contributions from both neighbours, or use max(lcp[i-1], lcp[i]) instead of just lcp[i-1], the totals stop summing to the distinct-substring count. A good self-check is that the sum of the printed numbers must equal n*(n+1)/2 - sum(lcp).",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Substring Order I",
      difficulty: "Hard",
      variation: "k-th smallest distinct substring",
      link: "https://cses.fi/problemset/task/2108",
      question: [
        "You are given a string of length n and an integer k. Consider all distinct substrings of the string, sorted in lexicographic order. Print the k-th substring in that order. It is guaranteed that k does not exceed the number of distinct substrings.",
        "Example 1:\nInput:\nbanana\n5\nOutput: anana\nExplanation: In order the distinct substrings begin a, an, ana, anan, anana, ... so the 5th is 'anana'.",
        "Example 2:\nInput:\naabaa\n3\nOutput: aab\nExplanation: The sorted distinct substrings start a, aa, aab, aaba, aabaa, ab, ... so the 3rd is 'aab'.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= k <= number of distinct substrings (which can exceed 10^9, so read k as a 64-bit value)",
      ],
      code: `vector<int> suffixArray(string s) {
    s += char(0);
    int n = s.size(), alphabet = 256;
    vector<int> p(n), c(n), cnt(max(alphabet, n), 0);
    for (int i = 0; i < n; i++) cnt[(unsigned char)s[i]]++;
    for (int i = 1; i < alphabet; i++) cnt[i] += cnt[i - 1];
    for (int i = 0; i < n; i++) p[--cnt[(unsigned char)s[i]]] = i;
    c[p[0]] = 0;
    int classes = 1;
    for (int i = 1; i < n; i++) {
        if (s[p[i]] != s[p[i - 1]]) classes++;
        c[p[i]] = classes - 1;
    }
    vector<int> pn(n), cn(n);
    for (int h = 0; (1 << h) < n; h++) {
        for (int i = 0; i < n; i++) {
            pn[i] = p[i] - (1 << h);
            if (pn[i] < 0) pn[i] += n;
        }
        fill(cnt.begin(), cnt.begin() + classes, 0);
        for (int i = 0; i < n; i++) cnt[c[pn[i]]]++;
        for (int i = 1; i < classes; i++) cnt[i] += cnt[i - 1];
        for (int i = n - 1; i >= 0; i--) p[--cnt[c[pn[i]]]] = pn[i];
        cn[p[0]] = 0;
        classes = 1;
        for (int i = 1; i < n; i++) {
            pair<int,int> cur = {c[p[i]], c[(p[i] + (1 << h)) % n]};
            pair<int,int> prv = {c[p[i - 1]], c[(p[i - 1] + (1 << h)) % n]};
            if (cur != prv) classes++;
            cn[p[i]] = classes - 1;
        }
        c.swap(cn);
    }
    return vector<int>(p.begin() + 1, p.end());
}

vector<int> kasai(const string& s, const vector<int>& sa) {
    int n = s.size();
    vector<int> pos(n), lcp(n - 1);
    for (int i = 0; i < n; i++) pos[sa[i]] = i;
    int h = 0;
    for (int i = 0; i < n; i++) {
        if (pos[i] == 0) { h = 0; continue; }
        int j = sa[pos[i] - 1];
        while (i + h < n && j + h < n && s[i + h] == s[j + h]) h++;
        lcp[pos[i] - 1] = h;
        if (h) h--;
    }
    return lcp;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    long long k;
    cin >> s >> k;
    int n = s.size();
    vector<int> sa = suffixArray(s);
    vector<int> lcp = kasai(s, sa);
    for (int i = 0; i < n; i++) {
        int len = n - sa[i];
        int seen = (i == 0 ? 0 : lcp[i - 1]);
        long long fresh = len - seen;        // new substrings owned by this suffix
        if (k <= fresh) {                    // the answer is a prefix of this suffix
            cout << s.substr(sa[i], seen + k) << "\\n";
            return 0;
        }
        k -= fresh;
    }
    return 0;
}`,
      explanation: [
        "Assign every distinct substring to the first suffix, in sorted order, that has it as a prefix. Suffix sa[i] then owns the prefixes of lengths lcp[i-1]+1 through n-sa[i], exactly the 'new' lengths from the counting version.",
        "The crucial ordering fact is that this assignment lists the distinct substrings in lexicographic order when you walk the suffix array left to right and, within one suffix, walk its owned prefixes from short to long. Shorter prefixes of the same string come first lexicographically, and every substring owned by a later suffix is strictly larger than every substring owned by an earlier one, because a string owned by sa[i] is a prefix of suffix sa[i] and is not a prefix of any earlier suffix - so it compares greater at the first differing character.",
        "That makes the query a single linear walk: subtract the block size until k lands inside a block, then the answer is the prefix of length lcp[i-1] + k of that suffix. No binary search is needed, though a prefix-sum plus binary search over the block sizes answers many queries in O(log n) each.",
        "Two traps. First, k can exceed 2^31 because there can be about 5 * 10^9 distinct substrings at n = 10^5, so k and the running subtraction must be 64-bit. Second, the offset inside the block is seen + k, not k - counting from length 1 instead of from lcp[i-1]+1 returns a substring that is too short.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Substring 2",
      difficulty: "Hard",
      variation: "Sum of LCP with every other suffix, monotonic stack",
      link: "https://atcoder.jp/contests/abc213/tasks/abc213_f",
      question: [
        "You are given a string S of length N. For 1 <= i <= N let S_i denote the suffix of S starting at position i. Define f(x, y) as the length of the longest common prefix of strings x and y. For every i from 1 to N, print the value of the sum of f(S_i, S_j) over all j from 1 to N. Note that the term j = i contributes the full length of S_i.",
        "Example 1:\nInput:\n3\nabb\nOutput:\n3\n3\n2\nExplanation: For i = 1, S_1 = 'abb' and the sum is f(abb,abb) + f(abb,bb) + f(abb,b) = 3 + 0 + 0 = 3. For i = 2, S_2 = 'bb' gives 0 + 2 + 1 = 3. For i = 3, S_3 = 'b' gives 0 + 1 + 1 = 2.",
        "Example 2:\nInput:\n11\nmississippi\nOutput:\n11\n16\n14\n12\n13\n11\n9\n7\n4\n3\n4\nExplanation: The first value is just |S_1| = 11 since no other suffix starts with 'm'. The second, for 'ississippi', collects 10 from itself plus 4 from 'issippi' plus 1 from 'ippi' plus 1 from 'i', giving 16.",
        "Constraints:\n- 1 <= N <= 10^6\n- S consists of lowercase English letters\n- Answers can reach about 5 * 10^11, so use 64-bit output",
      ],
      code: `vector<int> suffixArray(string s) {
    s += char(0);
    int n = s.size(), alphabet = 256;
    vector<int> p(n), c(n), cnt(max(alphabet, n), 0);
    for (int i = 0; i < n; i++) cnt[(unsigned char)s[i]]++;
    for (int i = 1; i < alphabet; i++) cnt[i] += cnt[i - 1];
    for (int i = 0; i < n; i++) p[--cnt[(unsigned char)s[i]]] = i;
    c[p[0]] = 0;
    int classes = 1;
    for (int i = 1; i < n; i++) {
        if (s[p[i]] != s[p[i - 1]]) classes++;
        c[p[i]] = classes - 1;
    }
    vector<int> pn(n), cn(n);
    for (int h = 0; (1 << h) < n; h++) {
        for (int i = 0; i < n; i++) {
            pn[i] = p[i] - (1 << h);
            if (pn[i] < 0) pn[i] += n;
        }
        fill(cnt.begin(), cnt.begin() + classes, 0);
        for (int i = 0; i < n; i++) cnt[c[pn[i]]]++;
        for (int i = 1; i < classes; i++) cnt[i] += cnt[i - 1];
        for (int i = n - 1; i >= 0; i--) p[--cnt[c[pn[i]]]] = pn[i];
        cn[p[0]] = 0;
        classes = 1;
        for (int i = 1; i < n; i++) {
            pair<int,int> cur = {c[p[i]], c[(p[i] + (1 << h)) % n]};
            pair<int,int> prv = {c[p[i - 1]], c[(p[i - 1] + (1 << h)) % n]};
            if (cur != prv) classes++;
            cn[p[i]] = classes - 1;
        }
        c.swap(cn);
    }
    return vector<int>(p.begin() + 1, p.end());
}

vector<int> kasai(const string& s, const vector<int>& sa) {
    int n = s.size();
    vector<int> pos(n), lcp(n - 1);
    for (int i = 0; i < n; i++) pos[sa[i]] = i;
    int h = 0;
    for (int i = 0; i < n; i++) {
        if (pos[i] == 0) { h = 0; continue; }
        int j = sa[pos[i] - 1];
        while (i + h < n && j + h < n && s[i + h] == s[j + h]) h++;
        lcp[pos[i] - 1] = h;
        if (h) h--;
    }
    return lcp;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    string s;
    cin >> n >> s;
    vector<int> sa = suffixArray(s);
    vector<int> lcp = kasai(s, sa);
    vector<long long> left(n, 0), right(n, 0);
    // left[i] = sum over SA positions j < i of min(lcp[j..i-1])
    {
        vector<pair<long long,long long>> st;   // (value, how many positions collapsed)
        long long cur = 0;
        for (int i = 1; i < n; i++) {
            long long v = lcp[i - 1], cntv = 1;
            while (!st.empty() && st.back().first >= v) {
                cur -= st.back().first * st.back().second;
                cntv += st.back().second;
                st.pop_back();
            }
            st.push_back({v, cntv});
            cur += v * cntv;
            left[i] = cur;
        }
    }
    // right[i] = sum over SA positions j > i of min(lcp[i..j-1])
    {
        vector<pair<long long,long long>> st;
        long long cur = 0;
        for (int i = n - 2; i >= 0; i--) {
            long long v = lcp[i], cntv = 1;
            while (!st.empty() && st.back().first >= v) {
                cur -= st.back().first * st.back().second;
                cntv += st.back().second;
                st.pop_back();
            }
            st.push_back({v, cntv});
            cur += v * cntv;
            right[i] = cur;
        }
    }
    vector<long long> ans(n);
    for (int i = 0; i < n; i++) ans[sa[i]] = (long long)(n - sa[i]) + left[i] + right[i];
    string out;
    for (int i = 0; i < n; i++) out += to_string(ans[i]) + "\\n";
    cout << out;
    return 0;
}`,
      explanation: [
        "Work in suffix-array space. For SA positions a < b, f(sa[a], sa[b]) = min(lcp[a..b-1]). So the answer for the suffix at SA position i is its own length plus the sum of range minima of the LCP array over all windows ending at i-1 and all windows starting at i.",
        "Both of those sums are the classic 'sum of subarray minimums' running total, maintained with a monotonic stack. Keep a stack of (value, multiplicity) pairs that is non-decreasing from bottom to top together with cur = the sum of value*multiplicity. Pushing a new lcp value v pops everything at least v and absorbs their multiplicity, because for every window that used to be minimised by a popped larger value, the new minimum is v. After the push, cur is exactly the sum of minima over all windows that end at the newly added position, which is what left[i] needs.",
        "Doing the same scan right to left gives right[i], and the diagonal term j = i contributes the suffix length n - sa[i]. Adding the three and mapping back through sa gives the answer indexed by original position.",
        "The tempting approach - sparse-table RMQ and a query per pair - is O(N^2) and dies instantly at N = 10^6. The subtle detail in the stack is the comparison: popping on >= (rather than >) collapses equal values into one stack entry, which keeps cur consistent; using > still works numerically here but grows the stack on runs of equal LCP values. Also note the answers reach about 5 * 10^11 for strings like 'aaa...a', so both cur and the outputs must be 64-bit, and at N = 10^6 the output should be buffered rather than printed with N separate stream writes.",
        "Time: O(N log N) for the suffix array plus O(N) for the two stack passes. Space: O(N).",
      ],
    },
    {
      name: "String (Codeforces 123D)",
      difficulty: "Hard",
      variation: "Sum over distinct substrings of occurrences choose two",
      link: "https://codeforces.com/problemset/problem/123/D",
      question: [
        "You are given a string s. Let f(p) be the number of occurrences of the string p in s, where occurrences may overlap. Compute the sum over all distinct non-empty substrings p of s of f(p) * (f(p) + 1) / 2.",
        "Example 1:\nInput: aaaa\nOutput: 20\nExplanation: 'a' occurs 4 times contributing 10, 'aa' occurs 3 times contributing 6, 'aaa' occurs twice contributing 3, and 'aaaa' once contributing 1. Total 10 + 6 + 3 + 1 = 20.",
        "Example 2:\nInput: abcdef\nOutput: 21\nExplanation: All 21 substrings are distinct and each occurs once, so each contributes 1.",
        "Example 3:\nInput: abacabadabacaba\nOutput: 188",
        "Constraints:\n- 1 <= |s| <= 10^5\n- s consists of lowercase English letters\n- The answer can be around 10^14, so it needs 64-bit arithmetic",
      ],
      code: `vector<int> suffixArray(string s) {
    s += char(0);
    int n = s.size(), alphabet = 256;
    vector<int> p(n), c(n), cnt(max(alphabet, n), 0);
    for (int i = 0; i < n; i++) cnt[(unsigned char)s[i]]++;
    for (int i = 1; i < alphabet; i++) cnt[i] += cnt[i - 1];
    for (int i = 0; i < n; i++) p[--cnt[(unsigned char)s[i]]] = i;
    c[p[0]] = 0;
    int classes = 1;
    for (int i = 1; i < n; i++) {
        if (s[p[i]] != s[p[i - 1]]) classes++;
        c[p[i]] = classes - 1;
    }
    vector<int> pn(n), cn(n);
    for (int h = 0; (1 << h) < n; h++) {
        for (int i = 0; i < n; i++) {
            pn[i] = p[i] - (1 << h);
            if (pn[i] < 0) pn[i] += n;
        }
        fill(cnt.begin(), cnt.begin() + classes, 0);
        for (int i = 0; i < n; i++) cnt[c[pn[i]]]++;
        for (int i = 1; i < classes; i++) cnt[i] += cnt[i - 1];
        for (int i = n - 1; i >= 0; i--) p[--cnt[c[pn[i]]]] = pn[i];
        cn[p[0]] = 0;
        classes = 1;
        for (int i = 1; i < n; i++) {
            pair<int,int> cur = {c[p[i]], c[(p[i] + (1 << h)) % n]};
            pair<int,int> prv = {c[p[i - 1]], c[(p[i - 1] + (1 << h)) % n]};
            if (cur != prv) classes++;
            cn[p[i]] = classes - 1;
        }
        c.swap(cn);
    }
    return vector<int>(p.begin() + 1, p.end());
}

vector<int> kasai(const string& s, const vector<int>& sa) {
    int n = s.size();
    vector<int> pos(n), lcp(n - 1);
    for (int i = 0; i < n; i++) pos[sa[i]] = i;
    int h = 0;
    for (int i = 0; i < n; i++) {
        if (pos[i] == 0) { h = 0; continue; }
        int j = sa[pos[i] - 1];
        while (i + h < n && j + h < n && s[i + h] == s[j + h]) h++;
        lcp[pos[i] - 1] = h;
        if (h) h--;
    }
    return lcp;
}

// Sum over every non-empty subarray of a of its minimum.
long long sumOfSubarrayMinimums(const vector<int>& a) {
    long long total = 0, cur = 0;
    vector<pair<long long,long long>> st;   // (value, collapsed count), increasing
    for (size_t i = 0; i < a.size(); i++) {
        long long v = a[i], cntv = 1;
        while (!st.empty() && st.back().first >= v) {
            cur -= st.back().first * st.back().second;
            cntv += st.back().second;
            st.pop_back();
        }
        st.push_back({v, cntv});
        cur += v * cntv;        // cur = sum of minima of all subarrays ending at i
        total += cur;
    }
    return total;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    long long n = s.size();
    vector<int> sa = suffixArray(s);
    vector<int> lcp = kasai(s, sa);
    // f = f-choose-1 plus f-choose-2, summed over distinct substrings
    long long ans = n * (n + 1) / 2 + sumOfSubarrayMinimums(lcp);
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "Split the weight: f*(f+1)/2 = f + f*(f-1)/2. Summing the first term over all distinct substrings counts every substring occurrence once, which is n*(n+1)/2 regardless of the string. Summing the second counts, for each distinct substring, the unordered pairs of positions where it occurs.",
        "Now change the order of summation on that second term. A pair of distinct start positions (a, b) contributes one unit for each common prefix length of the two suffixes, i.e. LCP(a, b) units. So the whole term equals the sum of LCP(a, b) over all unordered pairs of suffixes.",
        "In suffix-array coordinates that sum becomes the sum over all pairs i < j of min(lcp[i..j-1]), which is precisely the sum of minima over every non-empty subarray of the LCP array - the standard monotonic-stack computation. The stack keeps a non-decreasing sequence of (value, count) blocks and a running cur equal to the sum of minima of all subarrays ending at the current index; each new element absorbs every block that is at least as large, since those windows are now minimised by the new, smaller value.",
        "Sanity check on 'aaaa': the LCP array is [1,2,3], whose subarray minima are 1, 2, 3, 1, 2, 1 summing to 10, and n*(n+1)/2 = 10, giving 20 as required.",
        "The traps are arithmetic and structural. The answer reaches roughly 10^14, so every accumulator must be long long including the intermediate value*count products. And the pop condition must use >= so that runs of equal LCP values collapse into one block - with a strict > the count bookkeeping still works but a long constant run makes the stack large.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Longest Common Substring II",
      difficulty: "Hard",
      variation: "Longest substring common to k strings, sliding window over the LCP array",
      link: "https://www.spoj.com/problems/LCS2/",
      question: [
        "You are given up to 10 strings, one per line, until end of input. Find the length of the longest string that is a substring of every one of them. Print 0 if no non-empty string is common to all.",
        "Example 1:\nInput:\nabcdefghijklmnop\nabcdefghijklmnaa\nxxabcdefghijklmn\nOutput: 14\nExplanation: 'abcdefghijklmn' occurs in all three strings. Nothing longer does, since the first two diverge after 14 characters.",
        "Example 2:\nInput:\nbanana\nananas\nanna\nOutput: 2\nExplanation: 'an' occurs in all three. 'ana' is absent from 'anna', so 2 is the maximum.",
        "Constraints:\n- 2 <= number of strings <= 10\n- Each string has length at most 100000 and consists of lowercase English letters",
      ],
      code: `vector<int> suffixArray(string s) {
    s += char(0);
    int n = s.size(), alphabet = 256;
    vector<int> p(n), c(n), cnt(max(alphabet, n), 0);
    for (int i = 0; i < n; i++) cnt[(unsigned char)s[i]]++;
    for (int i = 1; i < alphabet; i++) cnt[i] += cnt[i - 1];
    for (int i = 0; i < n; i++) p[--cnt[(unsigned char)s[i]]] = i;
    c[p[0]] = 0;
    int classes = 1;
    for (int i = 1; i < n; i++) {
        if (s[p[i]] != s[p[i - 1]]) classes++;
        c[p[i]] = classes - 1;
    }
    vector<int> pn(n), cn(n);
    for (int h = 0; (1 << h) < n; h++) {
        for (int i = 0; i < n; i++) {
            pn[i] = p[i] - (1 << h);
            if (pn[i] < 0) pn[i] += n;
        }
        fill(cnt.begin(), cnt.begin() + classes, 0);
        for (int i = 0; i < n; i++) cnt[c[pn[i]]]++;
        for (int i = 1; i < classes; i++) cnt[i] += cnt[i - 1];
        for (int i = n - 1; i >= 0; i--) p[--cnt[c[pn[i]]]] = pn[i];
        cn[p[0]] = 0;
        classes = 1;
        for (int i = 1; i < n; i++) {
            pair<int,int> cur = {c[p[i]], c[(p[i] + (1 << h)) % n]};
            pair<int,int> prv = {c[p[i - 1]], c[(p[i - 1] + (1 << h)) % n]};
            if (cur != prv) classes++;
            cn[p[i]] = classes - 1;
        }
        c.swap(cn);
    }
    return vector<int>(p.begin() + 1, p.end());
}

vector<int> kasai(const string& s, const vector<int>& sa) {
    int n = s.size();
    vector<int> pos(n), lcp(n - 1);
    for (int i = 0; i < n; i++) pos[sa[i]] = i;
    int h = 0;
    for (int i = 0; i < n; i++) {
        if (pos[i] == 0) { h = 0; continue; }
        int j = sa[pos[i] - 1];
        while (i + h < n && j + h < n && s[i + h] == s[j + h]) h++;
        lcp[pos[i] - 1] = h;
        if (h) h--;
    }
    return lcp;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    vector<string> parts;
    string line;
    while (cin >> line) parts.push_back(line);
    int k = parts.size();
    if (k == 0) { cout << 0 << "\\n"; return 0; }
    if (k == 1) { cout << parts[0].size() << "\\n"; return 0; }

    string s;
    vector<int> owner;                       // owner[pos] = which string, -1 = separator
    for (int i = 0; i < k; i++) {
        for (char ch : parts[i]) { s += ch; owner.push_back(i); }
        s += char(1 + i);                    // distinct separators, all below 'a'
        owner.push_back(-1);
    }
    int n = s.size();
    vector<int> sa = suffixArray(s);
    vector<int> lcp = kasai(s, sa);

    // Drop separator suffixes; between two kept neighbours the true LCP is the
    // minimum of the lcp values spanned, since LCP over a range is a range min.
    vector<int> who, gap;
    int run = INT_MAX;
    bool first = true;
    for (int i = 0; i < n; i++) {
        if (!first) run = min(run, lcp[i - 1]);
        if (owner[sa[i]] == -1) continue;
        if (!first) gap.push_back(run);
        who.push_back(owner[sa[i]]);
        first = false;
        run = INT_MAX;
    }
    int m = who.size();
    if (m == 0) { cout << 0 << "\\n"; return 0; }

    vector<int> cnt(k, 0);
    deque<int> dq;                           // indices into gap, increasing gap values
    int have = 0, ans = 0, l = 0;
    for (int r = 0; r < m; r++) {
        if (r > 0) {
            while (!dq.empty() && gap[dq.back()] >= gap[r - 1]) dq.pop_back();
            dq.push_back(r - 1);
        }
        if (cnt[who[r]]++ == 0) have++;
        while (have == k) {                  // window covers every string
            if (l < r) ans = max(ans, gap[dq.front()]);   // min gap in [l, r-1]
            if (--cnt[who[l]] == 0) have--;
            l++;
            while (!dq.empty() && dq.front() < l) dq.pop_front();
        }
    }
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "Concatenate all k strings with pairwise distinct separators that are smaller than every real character. A string common to all k is then a common prefix of a set of suffixes covering all k owners, and for a contiguous group of suffix-array positions the common prefix length of the whole group is the minimum LCP inside the group.",
        "So the answer is the maximum, over all suffix-array windows whose owners cover all k strings, of the minimum LCP inside the window. Two pointers plus a monotonic deque for the sliding range minimum finds that in linear time: grow the right end until all owners are present, then shrink from the left while they still are, recording the window minimum each time. Shrinking is safe because a smaller window has a range minimum that is at least as large, so the optimum is always found at a minimal covering window.",
        "The separator suffixes are filtered out first. Skipping them cannot be done by simply ignoring their positions, because the LCP array is indexed by adjacency - after removing an entry the correct LCP between the surviving neighbours is the minimum of the values spanned, which the running variable computes. Since separators are unique the spanned values are 0 there anyway, so the filtered array is well behaved.",
        "The variation-defining detail is the deque, not the concatenation. With k = 2 you can just scan adjacent pairs, but for k > 2 the shared substring may only appear as a block of several suffixes, so an adjacent-pair scan under-reports. Using distinct separators matters too: reusing one separator character for every boundary lets a suffix from one string match across a boundary into another.",
        "Time: O(n log n) with n the total concatenated length, plus O(n) for the window. Space: O(n).",
      ],
    },
  ],
};
