import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Longest Prefix Suffix",
      difficulty: "Easy",
      variation: "Prefix function, the template",
      link: "https://www.geeksforgeeks.org/problems/longest-prefix-suffix2527/1",
      question: [
        "Given a string s, find the length of the longest proper prefix of s that is also a suffix of s. A proper prefix is a prefix that is not the whole string, so the answer is always strictly less than the length of s.",
        "Example 1:\nInput: s = 'abab'\nOutput: 2\nExplanation: The prefix 'ab' is also a suffix. The next candidate 'aba' is not a suffix of 'abab'.",
        "Example 2:\nInput: s = 'aaaa'\nOutput: 3\nExplanation: 'aaa' is both a proper prefix and a suffix.",
        "Constraints:\n- 1 <= s.length <= 10^5\n- s consists of lowercase English letters",
      ],
      code: `// pi[i] = length of the longest proper prefix of s[0..i] that is also its suffix.
vector<int> prefixFunction(const string& s) {
    int n = s.size();
    vector<int> pi(n, 0);
    for (int i = 1; i < n; i++) {
        int k = pi[i - 1];                       // best border of the previous prefix
        while (k > 0 && s[i] != s[k]) k = pi[k - 1];   // fall back along the border chain
        if (s[i] == s[k]) k++;
        pi[i] = k;
    }
    return pi;
}

int lps(const string& s) {
    if (s.empty()) return 0;
    return prefixFunction(s).back();
}`,
      explanation: [
        "The state is pi[i]: the length of the longest border (proper prefix that is also a suffix) of the prefix s[0..i]. Everything in this whole topic is built from that one array.",
        "The transition is the key insight. If pi[i-1] = k, then s[0..k-1] equals the k characters ending at i-1. Extending the border by one is possible exactly when s[i] == s[k]. If it is not, the next candidate border length is not k-1 but pi[k-1], because any border of s[0..i] shorter than k+1 must itself be a border of s[0..k-1]. Skipping straight to pi[k-1] is what makes this linear instead of quadratic.",
        "The loop looks like it could be O(n^2), but k only ever increases by one per outer step and never goes below zero, so the total number of fallback iterations across the whole run is bounded by the total increase of k, which is at most n. This amortized argument is the standard proof.",
        "The tempting wrong approach is to compare every prefix against every suffix directly, which is O(n^2) and blows up at n = 10^5. The other classic slip is off-by-one confusion between the '0-indexed pi over s' convention used here and the '1-indexed pi with pi[0] = -1' convention seen in older KMP write-ups; pick one and stay with it.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Find the Index of the First Occurrence in a String",
      difficulty: "Easy",
      variation: "KMP pattern matching",
      link: "https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/",
      question: [
        "Given two strings haystack and needle, return the index of the first occurrence of needle in haystack, or -1 if needle is not part of haystack.",
        "Example 1:\nInput: haystack = 'sadbutsad', needle = 'sad'\nOutput: 0\nExplanation: 'sad' occurs at index 0 and again at index 6. The first one is returned.",
        "Example 2:\nInput: haystack = 'leetcode', needle = 'leeto'\nOutput: -1\nExplanation: 'leeto' does not occur in 'leetcode'.",
        "Constraints:\n- 1 <= haystack.length, needle.length <= 10^4\n- Both strings consist of lowercase English letters",
      ],
      code: `int strStr(string haystack, string needle) {
    int n = haystack.size(), m = needle.size();
    if (m > n) return -1;
    vector<int> pi(m, 0);
    for (int i = 1; i < m; i++) {
        int k = pi[i - 1];
        while (k > 0 && needle[i] != needle[k]) k = pi[k - 1];
        if (needle[i] == needle[k]) k++;
        pi[i] = k;
    }
    int k = 0;                                   // characters of needle matched so far
    for (int i = 0; i < n; i++) {
        while (k > 0 && haystack[i] != needle[k]) k = pi[k - 1];
        if (haystack[i] == needle[k]) k++;
        if (k == m) return i - m + 1;             // full match ends at i
    }
    return -1;
}`,
      explanation: [
        "Build the prefix function of the pattern only, then scan the text once with a single counter k = how many pattern characters currently match, ending at the character just read.",
        "On a mismatch, naive search would restart the pattern at the next text position and re-read text characters. KMP instead sets k = pi[k-1]: the longest border of the matched part is still matched against the text, so the text pointer never moves backwards. That is the whole speedup, and it is why the algorithm is O(n + m) rather than O(n * m).",
        "The state to be careful about is k after a full match. Here we return immediately, but if you wanted every occurrence you must set k = pi[m-1] (not 0) before continuing, otherwise overlapping occurrences are missed - searching 'aa' in 'aaa' would report one hit instead of two.",
        "An alternative to the two-array version is to run the prefix function over needle + '#' + haystack and look for a value equal to m. It is shorter to write but uses O(n + m) memory and needs a separator character that cannot appear in either string.",
        "Time: O(n + m). Space: O(m).",
      ],
    },
    {
      name: "String Matching",
      difficulty: "Easy",
      variation: "Counting all occurrences, overlaps included",
      link: "https://cses.fi/problemset/task/1753",
      question: [
        "Given a string and a pattern, count how many times the pattern occurs in the string. Occurrences may overlap. The first input line is the string, the second is the pattern.",
        "Example 1:\nInput:\nsaippuakauppias\npp\nOutput: 2\nExplanation: 'pp' appears at 0-based indices 3 and 10.",
        "Example 2:\nInput:\naaaa\naa\nOutput: 3\nExplanation: 'aa' starts at indices 0, 1 and 2 - overlapping occurrences all count.",
        "Constraints:\n- 1 <= length of each string <= 10^6\n- Both strings consist of lowercase English letters",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s, p;
    cin >> s >> p;
    int n = s.size(), m = p.size();
    if (m > n) {
        cout << 0 << "\\n";
        return 0;
    }
    vector<int> pi(m, 0);
    for (int i = 1; i < m; i++) {
        int k = pi[i - 1];
        while (k > 0 && p[i] != p[k]) k = pi[k - 1];
        if (p[i] == p[k]) k++;
        pi[i] = k;
    }
    long long ans = 0;
    int k = 0;
    for (int i = 0; i < n; i++) {
        while (k > 0 && s[i] != p[k]) k = pi[k - 1];
        if (s[i] == p[k]) k++;
        if (k == m) {
            ans++;
            k = pi[m - 1];      // keep the longest border so overlaps are not skipped
        }
    }
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "Same scan as first-occurrence search, but instead of returning we record the hit and continue. The only line that matters is the reset: k = pi[m-1], the longest border of the pattern.",
        "Why that is correct: after a full match the last m characters of the text equal the pattern, so the last pi[m-1] characters of the text also equal the pattern's prefix of that length. Setting k to anything smaller throws away real matched state and can miss an overlapping occurrence; setting k = 0 in the 'aaaa' / 'aa' example would give 2 instead of 3.",
        "Memory matters at these sizes. Storing the concatenation p + '#' + s costs 2 * 10^6 ints for the prefix function; keeping pi over the pattern alone and streaming the text is the leaner form and is what is written here.",
        "The count itself can reach 10^6, which fits in an int, but a long long costs nothing and removes the question.",
        "Time: O(n + m). Space: O(m).",
      ],
    },
    {
      name: "Repeated Substring Pattern",
      difficulty: "Easy",
      variation: "Smallest period detection",
      link: "https://leetcode.com/problems/repeated-substring-pattern/",
      question: [
        "Given a string s, check if it can be constructed by taking some substring of it and appending multiple copies of that substring together. In other words, decide whether s is a proper power of some shorter string.",
        "Example 1:\nInput: s = 'abab'\nOutput: true\nExplanation: s is 'ab' repeated twice.",
        "Example 2:\nInput: s = 'aba'\nOutput: false\nExplanation: No shorter substring repeats to form 'aba'.",
        "Constraints:\n- 1 <= s.length <= 10^4\n- s consists of lowercase English letters",
      ],
      code: `bool repeatedSubstringPattern(string s) {
    int n = s.size();
    vector<int> pi(n, 0);
    for (int i = 1; i < n; i++) {
        int k = pi[i - 1];
        while (k > 0 && s[i] != s[k]) k = pi[k - 1];
        if (s[i] == s[k]) k++;
        pi[i] = k;
    }
    int period = n - pi[n - 1];        // smallest period of the whole string
    return pi[n - 1] > 0 && n % period == 0;
}`,
      explanation: [
        "The bridge between borders and periods: p is a period of s (meaning s[i] == s[i+p] for every valid i) exactly when s has a border of length n - p. So the smallest period is n minus the largest border, which is n - pi[n-1].",
        "A string is a proper power of a shorter block precisely when that smallest period divides n and is strictly less than n. The divisibility check is what separates 'abab' (period 2, divides 4) from 'abcab' (period 3, does not divide 5) - the latter has a border but is not a repetition.",
        "The condition pi[n-1] > 0 rules out period = n, i.e. a string with no border at all such as 'abc'. Without it every string would be reported as a repetition of itself.",
        "The classic trick answer, checking whether s occurs in (s + s) with the first and last characters removed, is also correct and rests on exactly this period argument - but it does not generalise to 'how many times' or 'what is the block', while the prefix function gives both.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Longest Happy Prefix",
      difficulty: "Medium",
      variation: "Longest border of the whole string",
      link: "https://leetcode.com/problems/longest-happy-prefix/",
      question: [
        "A string is called a happy prefix if it is a non-empty proper prefix that is also a suffix (excluding the string itself). Given a string s, return the longest happy prefix of s. Return an empty string if no such prefix exists.",
        "Example 1:\nInput: s = 'level'\nOutput: 'l'\nExplanation: The non-empty proper prefixes are 'l', 'le', 'lev', 'leve'. Only 'l' is also a suffix.",
        "Example 2:\nInput: s = 'ababab'\nOutput: 'abab'\nExplanation: 'abab' is a prefix and also a suffix. 'ab' also qualifies but is shorter.",
        "Constraints:\n- 1 <= s.length <= 10^5\n- s consists of lowercase English letters",
      ],
      code: `string longestPrefix(string s) {
    int n = s.size();
    vector<int> pi(n, 0);
    for (int i = 1; i < n; i++) {
        int k = pi[i - 1];
        while (k > 0 && s[i] != s[k]) k = pi[k - 1];
        if (s[i] == s[k]) k++;
        pi[i] = k;
    }
    return s.substr(0, pi[n - 1]);       // the longest border, by definition of pi
}`,
      explanation: [
        "This is the definition of the prefix function stated as a problem: pi[n-1] is the length of the longest proper prefix of s that is also a suffix, so the answer is just that many leading characters.",
        "Worth internalising because it is the reduction that makes the harder variations work. Whenever a problem says 'the text ends with something that also starts it', or 'overlap between the end and the beginning', the quantity being asked for is a border, and the border chain pi[n-1], pi[pi[n-1]-1], ... enumerates all of them from longest to shortest.",
        "The naive comparison of each prefix against the matching suffix is O(n^2) in the worst case and times out at n = 10^5, for example on a string of 10^5 identical characters where every candidate matches almost entirely.",
        "Rolling hash also solves this in O(n) expected time, but a single-modulus hash is anti-hash-attackable; the prefix function is deterministic and has no such caveat.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Finding Borders",
      difficulty: "Medium",
      variation: "Enumerating the border chain",
      link: "https://cses.fi/problemset/task/1732",
      question: [
        "A border of a string is a proper prefix of it that is also a suffix. Given a string, print the lengths of all of its borders, in increasing order.",
        "Example 1:\nInput:\nabcababcab\nOutput: 2 5\nExplanation: The prefix 'ab' matches the last two characters, and the prefix 'abcab' matches the last five. No other length works.",
        "Example 2:\nInput:\naaaa\nOutput: 1 2 3\nExplanation: Every proper prefix of a uniform string is also a suffix.",
        "Constraints:\n- 1 <= length of the string <= 10^6\n- The string consists of lowercase English letters",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    int n = s.size();
    vector<int> pi(n, 0);
    for (int i = 1; i < n; i++) {
        int k = pi[i - 1];
        while (k > 0 && s[i] != s[k]) k = pi[k - 1];
        if (s[i] == s[k]) k++;
        pi[i] = k;
    }
    vector<int> borders;
    int k = pi[n - 1];
    while (k > 0) {                 // walk the border chain: longest to shortest
        borders.push_back(k);
        k = pi[k - 1];
    }
    reverse(borders.begin(), borders.end());
    for (size_t i = 0; i < borders.size(); i++) {
        cout << borders[i] << (i + 1 == borders.size() ? '\\n' : ' ');
    }
    if (borders.empty()) cout << "\\n";
    return 0;
}`,
      explanation: [
        "The central structural fact: the set of border lengths of s is exactly the chain pi[n-1], pi[pi[n-1]-1], and so on down to 0. Nothing is missing and nothing extra appears.",
        "Proof sketch in both directions. Any border of s of length b < pi[n-1] is a prefix of s that is also a suffix of s, hence it is also a border of the prefix of length pi[n-1] (since that prefix is itself a suffix of s), so it lies further down the chain. Conversely every element of the chain is a prefix that is a suffix of a suffix of s, hence a suffix of s.",
        "The chain has at most O(log n) distinct values in many cases but can be as long as n - 1 on a uniform string such as 'aaaa...a', which is why the second example matters and why the output must be built into a vector rather than printed with recursion.",
        "The tempting O(n^2) route is to test each candidate length by comparing characters. It passes small tests and dies at n = 10^6.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Finding Periods",
      difficulty: "Medium",
      variation: "Borders to periods duality",
      link: "https://cses.fi/problemset/task/1733",
      question: [
        "A period of a string is a prefix such that the string can be written as a concatenation of copies of that prefix, where the last copy may be truncated. Equivalently, p is a period length when s[i] == s[i + p] for every index i where both positions exist. Given a string, print the lengths of all of its periods in increasing order. The full length always counts as a period.",
        "Example 1:\nInput:\nabcabcab\nOutput: 3 6 8\nExplanation: With p = 3 the string is 'abc' + 'abc' + 'ab'. With p = 6 it is 'abcabc' + 'ab'. p = 8 is the whole string.",
        "Example 2:\nInput:\naaa\nOutput: 1 2 3\nExplanation: 'a' repeated, 'aa' plus a truncated copy, and the whole string.",
        "Constraints:\n- 1 <= length of the string <= 10^6\n- The string consists of lowercase English letters",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    int n = s.size();
    vector<int> pi(n, 0);
    for (int i = 1; i < n; i++) {
        int k = pi[i - 1];
        while (k > 0 && s[i] != s[k]) k = pi[k - 1];
        if (s[i] == s[k]) k++;
        pi[i] = k;
    }
    int k = pi[n - 1];
    while (true) {
        cout << n - k << ' ';      // border of length k <=> period of length n - k
        if (k == 0) break;
        k = pi[k - 1];
    }
    cout << "\\n";
    return 0;
}`,
      explanation: [
        "Periods and borders are two views of the same object: p is a period of s if and only if s has a border of length n - p. Reading the border chain from longest to shortest therefore emits periods from shortest to longest, so no sorting is needed.",
        "The direction that is easy to miss: the border of length 0 is always valid, and it maps to the period n, which is why the loop prints before testing k == 0. Forgetting that costs the trailing value on every test case.",
        "This duality is the reason the prefix function shows up in compression, repetition detection and cyclic-shift problems. Concretely, the smallest period is n - pi[n-1]; if it divides n the string is a proper power, which is the Repeated Substring Pattern problem above.",
        "Note that periods are not closed downwards - 'abcabcab' has periods 3, 6, 8 but not 4, 5 or 7 - so you cannot shortcut by finding the smallest one and taking multiples.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Find Beautiful Indices in the Given Array I",
      difficulty: "Medium",
      variation: "Two occurrence lists plus a proximity check",
      link: "https://leetcode.com/problems/find-beautiful-indices-in-the-given-array-i/",
      question: [
        "You are given a 0-indexed string s, two strings a and b, and an integer k. An index i is beautiful if s[i..i+a.length-1] equals a and there exists an index j such that s[j..j+b.length-1] equals b and the absolute difference between i and j is at most k. Return the sorted array of all beautiful indices.",
        "Example 1:\nInput: s = 'isawsquirrelnearmysquirrelhouseohmy', a = 'my', b = 'squirrel', k = 15\nOutput: [16, 33]\nExplanation: 'my' occurs at indices 16 and 33; 'squirrel' occurs at 4 and 18. Index 16 pairs with 4 (difference 12) and index 33 pairs with 18 (difference 15).",
        "Example 2:\nInput: s = 'abcd', a = 'a', b = 'a', k = 4\nOutput: [0]\nExplanation: 'a' occurs only at index 0, and it pairs with itself at difference 0.",
        "Constraints:\n- 1 <= k <= s.length <= 10^5\n- 1 <= a.length, b.length <= 10\n- s, a and b consist of lowercase English letters",
      ],
      code: `vector<int> allOccurrences(const string& s, const string& p) {
    int n = s.size(), m = p.size();
    vector<int> res;
    if (m > n) return res;
    vector<int> pi(m, 0);
    for (int i = 1; i < m; i++) {
        int k = pi[i - 1];
        while (k > 0 && p[i] != p[k]) k = pi[k - 1];
        if (p[i] == p[k]) k++;
        pi[i] = k;
    }
    int k = 0;
    for (int i = 0; i < n; i++) {
        while (k > 0 && s[i] != p[k]) k = pi[k - 1];
        if (s[i] == p[k]) k++;
        if (k == m) {
            res.push_back(i - m + 1);
            k = pi[m - 1];
        }
    }
    return res;
}

vector<int> beautifulIndices(string s, string a, string b, int k) {
    vector<int> A = allOccurrences(s, a), B = allOccurrences(s, b);
    vector<int> ans;
    for (int i : A) {
        // B is already sorted, so binary search for any j in [i-k, i+k]
        auto it = lower_bound(B.begin(), B.end(), i - k);
        if (it != B.end() && *it <= i + k) ans.push_back(i);
    }
    return ans;
}`,
      explanation: [
        "Split the problem in two. First, get every occurrence of a and of b with the linear KMP scan - the occurrence lists come out already in increasing order, which is what makes the second half cheap.",
        "Second, for each candidate index i we only need to know whether any b-occurrence falls in the window [i-k, i+k]. Binary searching for the first element at least i-k and testing it against i+k answers that in O(log |B|), because if the smallest candidate above the lower bound is out of range then every larger one is too.",
        "A two-pointer sweep over the two sorted lists works equally well and drops the log factor, since i is increasing across the outer loop. Either is fine here; the binary search is harder to get subtly wrong.",
        "The trap is scanning all pairs (i, j), which is O(|A| * |B|) and quadratic when both patterns are single characters occurring everywhere - the exact case the harder version of this problem is built to punish.",
        "Time: O(n + |A| log |B|). Space: O(n).",
      ],
    },
    {
      name: "Shortest Palindrome",
      difficulty: "Hard",
      variation: "Prefix function of s + separator + reverse(s)",
      link: "https://leetcode.com/problems/shortest-palindrome/",
      question: [
        "You are given a string s. You can convert s to a palindrome by adding characters in front of it. Return the shortest palindrome you can find by performing this transformation.",
        "Example 1:\nInput: s = 'aacecaaa'\nOutput: 'aaacecaaa'\nExplanation: The longest palindromic prefix is 'aacecaa'. Only the trailing 'a' has to be mirrored to the front.",
        "Example 2:\nInput: s = 'abcd'\nOutput: 'dcbabcd'\nExplanation: The longest palindromic prefix is 'a', so 'bcd' reversed must be prepended.",
        "Constraints:\n- 0 <= s.length <= 5 * 10^4\n- s consists of lowercase English letters",
      ],
      code: `string shortestPalindrome(string s) {
    int n = s.size();
    if (n <= 1) return s;
    string r = s;
    reverse(r.begin(), r.end());
    string t = s + '#' + r;          // '#' cannot appear in s, so no match crosses it
    int m = t.size();
    vector<int> pi(m, 0);
    for (int i = 1; i < m; i++) {
        int k = pi[i - 1];
        while (k > 0 && t[i] != t[k]) k = pi[k - 1];
        if (t[i] == t[k]) k++;
        pi[i] = k;
    }
    int len = pi[m - 1];             // longest palindromic prefix of s
    string add = s.substr(len);
    reverse(add.begin(), add.end());
    return add + s;
}`,
      explanation: [
        "Prepending characters can never change the tail of the string, so the answer has the form reverse(tail) + s where s = head + tail and head is a palindrome. Minimising what is added means maximising the length of the palindromic prefix head.",
        "That maximum is what the prefix function computes here. pi over s + '#' + reverse(s) at the last position is the longest string that is both a prefix of s and a suffix of reverse(s). A suffix of reverse(s) is a reversed prefix of s, so the quantity is the longest prefix of s that equals its own reversal - exactly the longest palindromic prefix.",
        "The separator is not decorative. Without it, a match could span from s into reverse(s) and report a length greater than n, for instance on s = 'aaa' where the concatenation is uniform.",
        "The tempting O(n^2) approach - test each prefix for being a palindrome from the longest down - is quadratic on inputs like 5 * 10^4 identical characters. Rolling hash comparing prefix hashes forward and backward is the other standard linear solution.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "MUH and Cube Walls",
      difficulty: "Hard",
      variation: "KMP on a difference array (shape matching)",
      link: "https://codeforces.com/problemset/problem/471/D",
      question: [
        "Horace has a wall made of w columns, the i-th of height b[i]. He looks at a city wall of n columns with heights a[1..n]. He recognises a contiguous segment of w columns of the city wall as his own wall if the segment's heights equal his heights after adding one fixed integer to every column - that is, the two walls have the same shape but possibly different absolute heights. Count how many such segments exist.",
        "Example 1:\nInput:\n7 3\n1 2 3 1 2 3 4\n4 5 6\nOutput: 3\nExplanation: Horace's shape is 'rise by 1, rise by 1'. The city segments starting at columns 1, 4 and 5 are [1,2,3], [1,2,3] and [2,3,4], all of that shape.",
        "Example 2:\nInput:\n3 1\n5 5 5\n7\nOutput: 3\nExplanation: A single-column wall has no shape constraint at all, so every one of the 3 columns matches.",
        "Constraints:\n- 1 <= n, w <= 2 * 10^5\n- 1 <= a[i], b[i] <= 10^9",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, w;
    cin >> n >> w;
    vector<long long> a(n), b(w);
    for (auto& x : a) cin >> x;
    for (auto& x : b) cin >> x;
    if (w == 1) {                       // no differences to compare
        cout << n << "\\n";
        return 0;
    }
    if (w > n) {
        cout << 0 << "\\n";
        return 0;
    }
    vector<long long> da(n - 1), db(w - 1);
    for (int i = 0; i + 1 < n; i++) da[i] = a[i + 1] - a[i];
    for (int i = 0; i + 1 < w; i++) db[i] = b[i + 1] - b[i];
    int m = db.size();
    vector<int> pi(m, 0);
    for (int i = 1; i < m; i++) {
        int k = pi[i - 1];
        while (k > 0 && db[i] != db[k]) k = pi[k - 1];
        if (db[i] == db[k]) k++;
        pi[i] = k;
    }
    long long ans = 0;
    int k = 0;
    for (int i = 0; i < (int)da.size(); i++) {
        while (k > 0 && da[i] != db[k]) k = pi[k - 1];
        if (da[i] == db[k]) k++;
        if (k == m) {
            ans++;
            k = pi[m - 1];
        }
    }
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "Two integer sequences are equal up to a common additive shift exactly when their consecutive-difference sequences are identical. So replace both walls by their difference arrays and the shape-matching question becomes plain pattern matching, which KMP answers in linear time.",
        "Nothing about the prefix function requires characters; it only needs equality comparison on the elements. Running it over a vector of long long differences is the same algorithm with != instead of a character compare.",
        "Two boundary cases decide the verdict on this problem. When w == 1 the difference pattern is empty, every single column trivially matches, and the answer is n - a naive implementation searches for an empty pattern and prints 0 or crashes. When w > n the answer is 0. Otherwise a segment of w columns corresponds to w - 1 differences, so occurrences in the length n - 1 difference array map one-to-one onto valid segments.",
        "Heights reach 10^9, so a difference can be as low as -10^9 + 1; keeping the arrays in long long (or at least signed 32-bit, never unsigned) avoids the sign trap.",
        "Time: O(n + w). Space: O(n + w).",
      ],
    },
    {
      name: "Prefixes and Suffixes",
      difficulty: "Hard",
      variation: "Occurrence counts along the border chain",
      link: "https://codeforces.com/problemset/problem/432/D",
      question: [
        "You are given a string s. Consider every prefix of s that is also a suffix of s, including s itself. For each such prefix, in increasing order of length, print its length and the number of times it occurs in s as a substring. First print the number of these prefixes.",
        "Example 1:\nInput:\nABACABA\nOutput:\n3\n1 4\n3 2\n7 1\nExplanation: The prefixes that are also suffixes are 'A', 'ABA' and 'ABACABA'. 'A' occurs at indices 0, 2, 4, 6; 'ABA' occurs at indices 0 and 4; the whole string occurs once.",
        "Example 2:\nInput:\nAAA\nOutput:\n3\n1 3\n2 2\n3 1\nExplanation: 'A' occurs three times, 'AA' twice, 'AAA' once.",
        "Constraints:\n- 1 <= s.length <= 10^5\n- s consists of uppercase English letters",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    int n = s.size();
    vector<int> pi(n, 0);
    for (int i = 1; i < n; i++) {
        int k = pi[i - 1];
        while (k > 0 && s[i] != s[k]) k = pi[k - 1];
        if (s[i] == s[k]) k++;
        pi[i] = k;
    }
    // cnt[L] = number of positions where the prefix of length L occurs.
    vector<long long> cnt(n + 1, 0);
    for (int L = 1; L <= n; L++) cnt[L] = 1;      // each prefix length ends at >= 1 position
    for (int L = n; L >= 1; L--) cnt[pi[L - 1]] += cnt[L];   // push counts down the chain
    vector<int> lens;
    int k = n;
    while (k > 0) {
        lens.push_back(k);
        k = pi[k - 1];
    }
    reverse(lens.begin(), lens.end());
    cout << lens.size() << "\\n";
    for (int L : lens) cout << L << ' ' << cnt[L] << "\\n";
    return 0;
}`,
      explanation: [
        "Two independent pieces are combined. Which prefixes qualify is the border chain of s, plus s itself: start at k = n and follow k = pi[k-1] until zero. How often each qualifying prefix occurs is a separate count over all prefix lengths.",
        "The counting recurrence is the interesting half. Initialise cnt[L] = 1 for every L, meaning 'the prefix of length L is matched at position L-1 at least by the prefix itself'. Then sweep L from n down to 1 and add cnt[L] into cnt[pi[L-1]]. The reasoning: whenever the prefix of length L ends at some position, the prefix of length pi[L-1] ends there too, because it is a border of that occurrence. Processing lengths in decreasing order guarantees cnt[L] is already final before it is propagated, so every occurrence is counted exactly once at each of its border lengths.",
        "Equivalently, think of the automaton where L points to pi[L-1]: the answer for L is the number of nodes in its subtree, and the descending sweep is a subtree-sum accumulation on that tree without ever building it.",
        "The wrong-but-tempting approach is to run a separate KMP search for each qualifying prefix. The chain can have length n - 1 (a uniform string), so that is O(n^2) and times out. Also note cnt[0] ends up holding n and must be ignored; the empty prefix is not an answer.",
        "Time: O(n). Space: O(n).",
      ],
    },
  ],
};
