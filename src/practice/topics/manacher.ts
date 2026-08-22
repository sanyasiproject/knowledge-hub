import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Longest Palindromic Substring",
      difficulty: "Medium",
      variation: "All palindromic radii, the Manacher template",
      link: "https://leetcode.com/problems/longest-palindromic-substring/",
      question: [
        "Given a string s, return the longest substring of s that is a palindrome. If several substrings tie for the longest, returning any one of them is accepted.",
        "Example 1:\nInput: s = 'babad'\nOutput: 'bab'\nExplanation: 'bab' is a palindrome of length 3. 'aba' is also length 3, so either answer is accepted.",
        "Example 2:\nInput: s = 'cbbd'\nOutput: 'bb'\nExplanation: The only palindromes longer than one character are 'bb', centred between the two b's.",
        "Constraints:\n- 1 <= s.length <= 1000\n- s consists of digits and English letters",
      ],
      code: `class Solution {
public:
    string longestPalindrome(string s) {
        // Interleave with '#' so even and odd centres look the same,
        // and guard both ends with sentinels that never match anything.
        string t = "^";
        for (char ch : s) { t += '#'; t += ch; }
        t += "#$";
        int m = t.size();
        vector<int> p(m, 0);   // p[i] = length in s of the longest palindrome centred at t[i]
        int c = 0, r = 0;      // centre and right end of the rightmost palindrome found so far
        for (int i = 1; i < m - 1; i++) {
            int mirror = 2 * c - i;
            // Inside the current palindrome the mirror answer is reusable,
            // but only up to the boundary r.
            if (i < r) p[i] = min(r - i, p[mirror]);
            while (t[i + 1 + p[i]] == t[i - 1 - p[i]]) p[i]++;   // sentinels stop this loop
            if (i + p[i] > r) { c = i; r = i + p[i]; }
        }
        int best = 0, centre = 0;
        for (int i = 1; i < m - 1; i++)
            if (p[i] > best) { best = p[i]; centre = i; }
        return s.substr((centre - 1 - best) / 2, best);   // map t index back into s
    }
};`,
      explanation: [
        "Expanding around every centre is O(n^2) because two nearby centres redo the same character comparisons. Manacher removes that duplication by remembering the palindrome that currently reaches furthest right, spanning t[c-p[c] .. c+p[c]].",
        "For a new centre i inside that span, the mirror position 2c-i sees an identical neighbourhood, so p[i] starts at p[mirror]. The clamp min(r-i, p[mirror]) is essential: past the boundary r nothing is known yet, so the value can only be trusted up to r-i and the while loop must finish the job.",
        "The interleaving trick is what makes one array enough. In t every palindrome has a single character centre, and the count of matched pairs in t equals the palindrome length in s, so p[i] is directly the length and (i-1-p[i])/2 is the start index in s.",
        "Amortised linearity comes from r: every iteration of the while loop pushes r one step right, and r never decreases, so across the whole run there are at most O(n) successful comparisons plus one failure per centre.",
        "The tempting wrong version drops the clamp and writes p[i] = p[mirror]. That reports palindromes that were never verified beyond r and silently returns strings that are not palindromes.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Palindromic Substrings",
      difficulty: "Medium",
      variation: "Counting all palindromic substrings",
      link: "https://leetcode.com/problems/palindromic-substrings/",
      question: [
        "Given a string s, count how many of its substrings are palindromes. Two substrings are different if they start or end at different indices, even when their contents are equal.",
        "Example 1:\nInput: s = 'abc'\nOutput: 3\nExplanation: The palindromic substrings are 'a', 'b' and 'c'.",
        "Example 2:\nInput: s = 'aaa'\nOutput: 6\nExplanation: 'a' three times, 'aa' twice and 'aaa' once.",
        "Constraints:\n- 1 <= s.length <= 1000\n- s consists of lowercase English letters",
      ],
      code: `class Solution {
public:
    int countSubstrings(string s) {
        string t = "^";
        for (char ch : s) { t += '#'; t += ch; }
        t += "#$";
        int m = t.size();
        vector<int> p(m, 0);
        int c = 0, r = 0;
        for (int i = 1; i < m - 1; i++) {
            int mirror = 2 * c - i;
            if (i < r) p[i] = min(r - i, p[mirror]);
            while (t[i + 1 + p[i]] == t[i - 1 - p[i]]) p[i]++;
            if (i + p[i] > r) { c = i; r = i + p[i]; }
        }
        int ans = 0;
        // A centre with maximal length L hides palindromes of length L, L-2, L-4, ...
        for (int i = 1; i < m - 1; i++) ans += (p[i] + 1) / 2;
        return ans;
    }
};`,
      explanation: [
        "Every palindromic substring has exactly one centre, so the total count is the sum over centres of how many palindromes sit at that centre. Shrinking a palindrome by one character on each side keeps it a palindrome, so a centre whose maximum length is L contributes exactly ceil(L/2) substrings: lengths L, L-2, ... down to 1 or 2.",
        "Written on the interleaved array that is (p[i]+1)/2, and it correctly yields 0 for the artificial '#' centres whose p is 0 - there is no empty palindrome to count.",
        "Sanity check on 'aaa': the radii at the real and virtual centres are 1, 2, 3, 2, 1, giving 1+1+2+1+1 = 6, which matches the enumeration by hand.",
        "The DP alternative (a boolean table isPal[l][r]) also counts correctly but needs O(n^2) time and memory; Manacher gives the same number in linear time and is the only option once n reaches 10^6.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Longest Palindrome (CSES)",
      difficulty: "Medium",
      variation: "Linear-time longest palindrome on a large input",
      link: "https://cses.fi/problemset/task/1111",
      question: [
        "Given a string of n characters, find the longest palindromic substring. Read the string from standard input and print the palindrome. If there are several longest palindromes, any of them is accepted.",
        "Example 1:\nInput:\naybabtu\nOutput: bab\nExplanation: 'bab' occupies indices 2..4 and is the only palindromic substring longer than one character.",
        "Example 2:\nInput:\naaaa\nOutput: aaaa\nExplanation: The whole string is already a palindrome.",
        "Constraints:\n- 1 <= n <= 10^6\n- the string consists of lowercase English letters",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    string t = "^";
    t.reserve(2 * s.size() + 3);
    for (char ch : s) { t += '#'; t += ch; }
    t += "#$";
    int m = t.size();
    vector<int> p(m, 0);
    int c = 0, r = 0;
    for (int i = 1; i < m - 1; i++) {
        int mirror = 2 * c - i;
        if (i < r) p[i] = min(r - i, p[mirror]);
        while (t[i + 1 + p[i]] == t[i - 1 - p[i]]) p[i]++;
        if (i + p[i] > r) { c = i; r = i + p[i]; }
    }
    int best = 0, centre = 0;
    for (int i = 1; i < m - 1; i++)
        if (p[i] > best) { best = p[i]; centre = i; }
    cout << s.substr((centre - 1 - best) / 2, best) << "\\n";
    return 0;
}`,
      explanation: [
        "Same algorithm as the interview version, but the constraints are what make it a Manacher problem: with n up to 10^6 an O(n^2) centre expansion performs around 10^12 comparisons, while Manacher does a few million.",
        "The interleaved string is 2n+3 characters and the radius array is 2n+3 ints, so peak memory is roughly 10 MB of characters plus 8 MB of integers - comfortable, but reserve() avoids repeated reallocation while building t.",
        "The answer is reconstructed rather than stored: keeping only the best radius and its centre, then converting the centre back with (centre-1-best)/2, avoids copying substrings inside the loop.",
        "A worst case worth thinking about is a string of one repeated letter. Naive expansion is quadratic there, whereas Manacher's boundary r advances monotonically and the whole scan stays linear.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Extend to Palindrome",
      difficulty: "Medium",
      variation: "Longest palindromic suffix",
      link: "https://www.spoj.com/problems/EPALIN/",
      question: [
        "For each input string, append as few characters as possible to its end so that the result is a palindrome, and print that palindrome. Input consists of several strings, one per line, terminated by end of file.",
        "The key observation is that if the longest palindromic suffix has length L, the characters before it (a prefix of length n-L) must be mirrored after the string, and no shorter addition can work.",
        "Example 1:\nInput:\naaa\nabc\nOutput:\naaa\nabcba\nExplanation: 'aaa' is already a palindrome, so nothing is appended. For 'abc' the longest palindromic suffix is 'c', so the reversed prefix 'ab' -> 'ba' is appended.",
        "Example 2:\nInput:\naab\nOutput:\naabaa\nExplanation: The longest palindromic suffix of 'aab' is 'b', so the reverse of 'aa' is appended, giving 'aabaa' - two characters, and one is impossible because 'aaba' is not a palindrome.",
        "Constraints:\n- each string has length up to 10^5 and contains no whitespace\n- the number of strings is not bounded in advance; read until EOF",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    while (cin >> s) {
        int n = s.size();
        string t = "^";
        for (char ch : s) { t += '#'; t += ch; }
        t += "#$";
        int m = t.size();
        vector<int> p(m, 0);
        int c = 0, r = 0;
        for (int i = 1; i < m - 1; i++) {
            int mirror = 2 * c - i;
            if (i < r) p[i] = min(r - i, p[mirror]);
            while (t[i + 1 + p[i]] == t[i - 1 - p[i]]) p[i]++;
            if (i + p[i] > r) { c = i; r = i + p[i]; }
        }
        int best = 0;
        // A palindrome ending at the last character satisfies i + p[i] == 2n + 1.
        for (int i = 1; i < m - 1; i++)
            if (i + p[i] == 2 * n + 1) best = max(best, p[i]);
        string add = s.substr(0, n - best);
        reverse(add.begin(), add.end());
        cout << s << add << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Suppose we append k characters. The result has length n+k, and its second half is forced to mirror its first half, which means the suffix of s of length n-k must itself be a palindrome. So minimising k is exactly maximising the length of a palindromic suffix of s.",
        "Manacher gives every radius at once, so the filter is a single arithmetic test. A palindrome centred at t index i covers original indices [(i-1-p[i])/2, (i-1+p[i])/2 - 1]; requiring the right end to be n-1 rearranges to i + p[i] == 2n + 1.",
        "The scan also visits the '#' centres with p = 0. Those satisfy the test only at i = 2n+1 and contribute the empty suffix, which is harmless - it corresponds to mirroring the whole string, the always-valid fallback.",
        "A common wrong move is to take the longest palindromic prefix instead. That is the answer to the mirror-image problem (prepending characters, as in Shortest Palindrome), and on 'aab' it would give 'aa' and produce the non-palindrome 'aabaa' by prepending on the wrong side.",
        "Time: O(n) per string. Space: O(n).",
      ],
    },
    {
      name: "Maximum Number of Non-overlapping Palindrome Substrings",
      difficulty: "Medium",
      variation: "O(1) palindrome test plus greedy scan",
      link: "https://leetcode.com/problems/maximum-number-of-non-overlapping-palindrome-substrings/",
      question: [
        "You are given a string s and a positive integer k. Select a set of non-empty substrings of s such that no two selected substrings overlap, every selected substring has length at least k, and every selected substring is a palindrome. Return the maximum number of substrings you can select.",
        "Example 1:\nInput: s = 'abaccdbbd', k = 3\nOutput: 2\nExplanation: Pick 'aba' at indices 0..2 and 'dbbd' at indices 5..8. They do not overlap and both are palindromes of length at least 3.",
        "Example 2:\nInput: s = 'adbcda', k = 2\nOutput: 0\nExplanation: No substring of length 2 or more is a palindrome, so nothing can be selected.",
        "Constraints:\n- 1 <= k <= s.length <= 2000\n- s consists of lowercase English letters",
      ],
      code: `class Solution {
public:
    int maxPalindromes(string s, int k) {
        int n = s.size();
        string t = "^";
        for (char ch : s) { t += '#'; t += ch; }
        t += "#$";
        int m = t.size();
        vector<int> p(m, 0);
        int c = 0, r = 0;
        for (int i = 1; i < m - 1; i++) {
            int mirror = 2 * c - i;
            if (i < r) p[i] = min(r - i, p[mirror]);
            while (t[i + 1 + p[i]] == t[i - 1 - p[i]]) p[i]++;
            if (i + p[i] > r) { c = i; r = i + p[i]; }
        }
        // s[l..r] is a palindrome iff the radius at its centre covers it.
        auto isPal = [&](int l, int rr) { return p[l + rr + 2] >= rr - l + 1; };
        int ans = 0, last = -1;   // last = right end of the most recently taken piece
        for (int i = 0; i < n; i++)
            for (int len : {k, k + 1}) {
                int l = i - len + 1;
                if (l > last && l >= 0 && isPal(l, i)) { ans++; last = i; break; }
            }
        return ans;
    }
};`,
      explanation: [
        "Two independent ideas combine here. First, only lengths k and k+1 ever need to be considered: any palindrome of length k+2 or more contains, after stripping one character from each end repeatedly, a centred palindrome of length k or k+1. Since a shorter piece leaves strictly more room to the right and still counts as one selection, it is never worse.",
        "Second, given that reduction, a left-to-right greedy is optimal: scan i as the right end and take the first palindrome of length k or k+1 that ends at i and starts after the previous selection. Finishing as early as possible dominates any other choice by the usual interval-scheduling exchange argument.",
        "The palindrome test must be O(1) or the scan degenerates. On the interleaved string the centre of s[l..r] is index l+r+2, so the whole test is p[l+r+2] >= r-l+1 - one array read and one comparison.",
        "The trap is testing every length from k upward at each position. That is O(n^2) tests, and worse, taking a longer palindrome when a shorter one fits can cost a later selection: on 'aaaa' with k = 2, greedily taking 'aaaa' gives 1 while taking 'aa' twice gives 2.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Shortest Palindrome",
      difficulty: "Hard",
      variation: "Longest palindromic prefix",
      link: "https://leetcode.com/problems/shortest-palindrome/",
      question: [
        "You are given a string s. You may only add characters in front of s. Return the shortest palindrome you can obtain this way.",
        "Example 1:\nInput: s = 'aacecaaa'\nOutput: 'aaacecaaa'\nExplanation: The longest palindromic prefix is 'aacecaa' of length 7. Only the leftover 'a' has to be mirrored in front.",
        "Example 2:\nInput: s = 'abcd'\nOutput: 'dcbabcd'\nExplanation: The longest palindromic prefix is just 'a', so 'bcd' reversed is prepended.",
        "Constraints:\n- 0 <= s.length <= 5 * 10^4\n- s consists of lowercase English letters",
      ],
      code: `class Solution {
public:
    string shortestPalindrome(string s) {
        int n = s.size();
        if (n == 0) return "";
        string t = "^";
        for (char ch : s) { t += '#'; t += ch; }
        t += "#$";
        int m = t.size();
        vector<int> p(m, 0);
        int c = 0, r = 0;
        for (int i = 1; i < m - 1; i++) {
            int mirror = 2 * c - i;
            if (i < r) p[i] = min(r - i, p[mirror]);
            while (t[i + 1 + p[i]] == t[i - 1 - p[i]]) p[i]++;
            if (i + p[i] > r) { c = i; r = i + p[i]; }
        }
        int best = 0;
        // The palindrome starts at index 0 exactly when (i - 1 - p[i]) / 2 == 0.
        for (int i = 1; i < m - 1; i++)
            if (i - 1 - p[i] == 0) best = max(best, p[i]);
        string head = s.substr(best);
        reverse(head.begin(), head.end());
        return head + s;
    }
};`,
      explanation: [
        "If we prepend k characters, the result has length n+k and its first half mirrors its second half, which forces the prefix of s of length n-k to be a palindrome. So the shortest answer corresponds to the longest palindromic prefix, and the remaining suffix reversed is prepended.",
        "The prefix condition is again pure arithmetic on the radii: the palindrome at centre i starts at original index (i-1-p[i])/2, so it is a prefix exactly when i - 1 - p[i] == 0. No string comparison is needed.",
        "The classic alternative is KMP: build the failure function of s + '#' + reverse(s) and read the last value, which is the length of the longest palindromic prefix. Manacher is the same complexity and avoids the separator, but note that the KMP version needs the separator or the two halves can overlap and overstate the match.",
        "The naive check - test each prefix for being a palindrome from longest down - is O(n^2) and times out around n = 5 * 10^4 on adversarial inputs like a long run of the same letter followed by a different one.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Palindrome Partitioning IV",
      difficulty: "Hard",
      variation: "Split into exactly three palindromes",
      link: "https://leetcode.com/problems/palindrome-partitioning-iv/",
      question: [
        "Given a string s, return true if it is possible to split s into three non-empty palindromic substrings, and false otherwise. A split must use the whole string: the three parts are contiguous and in order.",
        "Example 1:\nInput: s = 'abcbdd'\nOutput: true\nExplanation: 'a' + 'bcb' + 'dd' - all three parts are palindromes.",
        "Example 2:\nInput: s = 'bcbddxy'\nOutput: false\nExplanation: The last part must end at 'y', so it can only be 'y'. That forces the first two parts to cover 'bcbddx', and no split of 'bcbddx' into two palindromes exists.",
        "Constraints:\n- 3 <= s.length <= 2000\n- s consists of lowercase English letters",
      ],
      code: `class Solution {
public:
    bool checkPartitioning(string s) {
        int n = s.size();
        string t = "^";
        for (char ch : s) { t += '#'; t += ch; }
        t += "#$";
        int m = t.size();
        vector<int> p(m, 0);
        int c = 0, r = 0;
        for (int i = 1; i < m - 1; i++) {
            int mirror = 2 * c - i;
            if (i < r) p[i] = min(r - i, p[mirror]);
            while (t[i + 1 + p[i]] == t[i - 1 - p[i]]) p[i]++;
            if (i + p[i] > r) { c = i; r = i + p[i]; }
        }
        auto isPal = [&](int l, int rr) { return p[l + rr + 2] >= rr - l + 1; };
        for (int i = 1; i < n - 1; i++) {
            if (!isPal(0, i - 1)) continue;          // prune on the first cut
            for (int j = i; j < n - 1; j++)
                if (isPal(i, j) && isPal(j + 1, n - 1)) return true;
        }
        return false;
    }
};`,
      explanation: [
        "The structure of the search is fixed: choose two cut positions, giving parts [0, i-1], [i, j] and [j+1, n-1]. With n up to 2000 that is about two million pairs, which is fine only if each palindrome query is constant time - the whole point of precomputing radii.",
        "Manacher supplies the constant-time query. Because s[l..r] has its centre at index l+r+2 of the interleaved string, and the radius stored there is the maximum palindrome length at that centre, the substring is a palindrome exactly when p[l+r+2] >= r-l+1.",
        "Hoisting the first test out of the inner loop matters in practice: most left cuts fail immediately, so the inner loop only runs for the O(n) positions where the prefix is already a palindrome.",
        "A tempting but wrong shortcut is greedy - take the shortest palindromic prefix, then the shortest palindromic second part. Greedy fails here: on 'aabaa' the shortest prefix 'a' then shortest next 'a' leaves 'baa', which is not a palindrome, although 'a' + 'aba' + 'a' works. Only the full double loop is safe.",
        "The O(n^2) DP table isPal[l][r] gives the same asymptotics but uses 4 MB of booleans and one extra quadratic pass; the radii array is O(n) memory and one linear pass.",
        "Time: O(n^2). Space: O(n).",
      ],
    },
    {
      name: "Maximum Product of the Length of Two Palindromic Substrings",
      difficulty: "Hard",
      variation: "Best odd palindrome per prefix and per suffix",
      link: "https://leetcode.com/problems/maximum-product-of-the-length-of-two-palindromic-substrings/",
      question: [
        "You are given a string s. Choose two non-intersecting palindromic substrings of s, both of odd length, and let their lengths be a and b. Return the maximum possible value of a * b.",
        "Example 1:\nInput: s = 'ababbb'\nOutput: 9\nExplanation: Take 'aba' at indices 0..2 and 'bbb' at indices 3..5. Both have odd length 3 and they do not intersect, so the product is 9.",
        "Example 2:\nInput: s = 'zaaaxbbby'\nOutput: 9\nExplanation: Take 'aaa' and 'bbb', each of length 3.",
        "Constraints:\n- 2 <= s.length <= 10^5\n- s consists of lowercase English letters",
      ],
      code: `class Solution {
public:
    long long maxProduct(string s) {
        int n = s.size();
        string t = "^";
        for (char ch : s) { t += '#'; t += ch; }
        t += "#$";
        int m = t.size();
        vector<int> p(m, 0);
        int c = 0, r = 0;
        for (int i = 1; i < m - 1; i++) {
            int mirror = 2 * c - i;
            if (i < r) p[i] = min(r - i, p[mirror]);
            while (t[i + 1 + p[i]] == t[i - 1 - p[i]]) p[i]++;
            if (i + p[i] > r) { c = i; r = i + p[i]; }
        }
        // Every single character is an odd palindrome, hence the initial 1s.
        vector<int> endBest(n, 1), startBest(n, 1);
        for (int i = 0; i < n; i++) {
            int len = p[2 * i + 2];   // longest odd palindrome centred at s[i]
            endBest[i + len / 2] = max(endBest[i + len / 2], len);
            startBest[i - len / 2] = max(startBest[i - len / 2], len);
        }
        // Shrinking both ends of a palindrome ending at i+1 gives one ending at i.
        for (int i = n - 2; i >= 0; i--) endBest[i] = max(endBest[i], endBest[i + 1] - 2);
        for (int i = 1; i < n; i++) startBest[i] = max(startBest[i], startBest[i - 1] - 2);
        vector<int> pre(n), suf(n);
        pre[0] = endBest[0];
        for (int i = 1; i < n; i++) pre[i] = max(pre[i - 1], endBest[i]);
        suf[n - 1] = startBest[n - 1];
        for (int i = n - 2; i >= 0; i--) suf[i] = max(suf[i + 1], startBest[i]);
        long long ans = 0;
        for (int i = 1; i < n; i++) ans = max(ans, (long long)pre[i - 1] * suf[i]);
        return ans;
    }
};`,
      explanation: [
        "Two non-intersecting substrings are always separated by a cut: there is an index i such that the first lies inside [0, i-1] and the second inside [i, n-1]. So the answer is the maximum over cuts of (best odd palindrome fully inside the prefix) times (best odd palindrome fully inside the suffix).",
        "Manacher gives the maximum length per centre, but what is needed is the maximum length per right endpoint. Register each centre's palindrome at its own right end, then relax right to left with endBest[i] = max(endBest[i], endBest[i+1] - 2): a palindrome of length L ending at i+1 has a length L-2 palindrome ending at i, obtained by dropping one character from each side. Symmetrically for left endpoints.",
        "After the relaxation, a prefix maximum of endBest gives the best palindrome contained in each prefix, and a suffix maximum of startBest does the same on the right. One sweep over the cuts finishes the job.",
        "Two easy mistakes: forgetting that the answer can reach 10^5 / 2 squared, which overflows 32-bit and needs long long; and using max-per-centre directly instead of max-per-endpoint, which lets a palindrome straddle the cut and inflates the product.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Palindrome Degree",
      difficulty: "Hard",
      variation: "Prefix palindrome tests feeding a recursion",
      link: "https://codeforces.com/problemset/problem/7/D",
      question: [
        "A string is called k-palindrome for k >= 1 if it is a palindrome and its prefix of length floor(n/2) is (k-1)-palindrome; every string, including the empty one, is 0-palindrome. The palindrome degree of a string is the largest k for which it is k-palindrome. Given a string s, print the sum of the palindrome degrees of all prefixes of s.",
        "Example 1:\nInput:\na2A\nOutput: 1\nExplanation: 'a' has degree 1. 'a2' and 'a2A' are not palindromes (comparison is case sensitive), so their degree is 0. The sum is 1.",
        "Example 2:\nInput:\nabacaba\nOutput: 6\nExplanation: Degrees of the prefixes are 1, 0, 2, 0, 0, 0, 3. 'abacaba' is a palindrome whose half-prefix 'aba' has degree 2, so its own degree is 3, and the total is 6.",
        "Constraints:\n- 1 <= |s| <= 5 * 10^6\n- s consists of characters a-z, A-Z and 0-9",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    int n = s.size();
    // Two-array Manacher: d1[i] odd radii, d2[i] even radii (no interleaved copy).
    vector<int> d1(n), d2(n);
    for (int i = 0, l = 0, r = -1; i < n; i++) {
        int k = (i > r) ? 1 : min(d1[l + r - i], r - i + 1);
        while (i - k >= 0 && i + k < n && s[i - k] == s[i + k]) k++;
        d1[i] = k--;
        if (i + k > r) { l = i - k; r = i + k; }
    }
    for (int i = 0, l = 0, r = -1; i < n; i++) {
        int k = (i > r) ? 0 : min(d2[l + r - i + 1], r - i + 1);
        while (i - k - 1 >= 0 && i + k < n && s[i - k - 1] == s[i + k]) k++;
        d2[i] = k--;
        if (i + k > r) { l = i - k - 1; r = i + k; }
    }
    vector<int> deg(n + 1, 0);
    long long ans = 0;
    for (int L = 1; L <= n; L++) {
        // Is the prefix of length L a palindrome? Its centre is fixed by L.
        bool pal = (L % 2) ? d1[(L - 1) / 2] >= (L + 1) / 2
                           : d2[L / 2] >= L / 2;
        if (pal) deg[L] = deg[L / 2] + 1;
        ans += deg[L];
    }
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "The definition is already a recursion on prefix lengths: deg[L] = deg[L/2] + 1 when the prefix of length L is a palindrome, and 0 otherwise. Since L/2 < L, a single increasing sweep over L computes every degree, and deg[0] = 0 seeds it.",
        "All that is missing is an O(1) test for 'is the prefix of length L a palindrome'. The centre of a prefix is determined by L alone: for odd L it is character (L-1)/2 and the required radius is (L+1)/2; for even L it is the gap before index L/2 and the required even radius is L/2. Both are single lookups into the Manacher arrays.",
        "This version uses the two-array formulation instead of the interleaved string. The logic is identical - reuse the mirror radius clamped by the current right boundary - but it stores 2n ints rather than building a 2n+3 character copy, which matters at |s| = 5 * 10^6.",
        "Memory is the real hazard: two int arrays at 5 * 10^6 entries are already 40 MB. If the limit is tighter, note that only prefix palindromicity is ever queried, so a rolling hash comparing prefix and reversed-prefix hashes, or a Z-function on s + separator + reverse(s), does the job with one array.",
        "The degrees are up to about log2(n) each over 5 * 10^6 prefixes, so the sum can exceed 2^31 in principle - accumulate in long long.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Prefix-Suffix Palindrome (Hard version)",
      difficulty: "Hard",
      variation: "Greedy outer match plus longest palindromic prefix or suffix",
      link: "https://codeforces.com/problemset/problem/1326/D2",
      question: [
        "For each test case you are given a string s of lowercase letters. Find the longest string t that is a palindrome and can be written as t = a + b, where a is a prefix of s and b is a suffix of s (either may be empty). Print any such longest t.",
        "Example 1:\nInput:\n2\nabcdfdcecba\nacbba\nOutput:\nabcdfdcba\nabba\nExplanation: For the first string three outer pairs match, giving 'abc' on the left and 'cba' on the right; the remaining middle is 'dfdce', whose longest palindromic prefix 'dfd' has length 3 and whose longest palindromic suffix 'e' has length 1, so the answer is 'abc' + 'dfd' + 'cba' of length 9. For the second string only 'a' matches 'a', the middle is 'cbb', and its longest palindromic suffix 'bb' beats its longest palindromic prefix 'c', giving 'a' + 'bb' + 'a'.",
        "Example 2:\nInput:\n2\nabbaxyzyx\ncodeforces\nOutput:\nxyzyx\nc\nExplanation: In 'abbaxyzyx' the first and last characters already differ, so the middle is the whole string; its longest palindromic suffix 'xyzyx' has length 5, beating the palindromic prefix 'abba'. In 'codeforces' nothing longer than a single character is available.",
        "Constraints:\n- 1 <= number of test cases <= 10^5\n- 1 <= |s|, and the sum of |s| over all test cases <= 10^6",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int T;
    cin >> T;
    while (T--) {
        string s;
        cin >> s;
        int n = s.size();
        int l = 0, rr = n - 1;
        while (l < rr && s[l] == s[rr]) { l++; rr--; }   // peel matching outer pairs
        string mid = s.substr(l, rr - l + 1);            // empty when s is an even palindrome
        int q = mid.size();
        string t = "^";
        for (char ch : mid) { t += '#'; t += ch; }
        t += "#$";
        int m = t.size();
        vector<int> p(m, 0);
        int c = 0, r = 0;
        for (int i = 1; i < m - 1; i++) {
            int mirror = 2 * c - i;
            if (i < r) p[i] = min(r - i, p[mirror]);
            while (t[i + 1 + p[i]] == t[i - 1 - p[i]]) p[i]++;
            if (i + p[i] > r) { c = i; r = i + p[i]; }
        }
        int bestPre = 0, bestSuf = 0;
        for (int i = 1; i < m - 1; i++) {
            if (i - 1 - p[i] == 0) bestPre = max(bestPre, p[i]);       // starts at mid[0]
            if (i + p[i] == 2 * q + 1) bestSuf = max(bestSuf, p[i]);   // ends at mid[q-1]
        }
        string core = (bestPre >= bestSuf) ? mid.substr(0, bestPre)
                                          : mid.substr(q - bestSuf);
        cout << s.substr(0, l) << core << s.substr(rr + 1) << "\\n";
    }
    return 0;
}`,
      explanation: [
        "First claim: it is always optimal to peel matching outer pairs greedily. If s[l] == s[r] then taking both costs nothing and adds 2 to the answer, because any palindrome built from the inner part can be wrapped by that pair and stay a palindrome. So march l up and r down while the characters agree.",
        "Second claim: once s[l] != s[r] the two sides can no longer both contribute, since the palindrome's outermost pair would have to be those two unequal characters. Therefore the contribution from the middle is either a prefix of the middle or a suffix of it, and being a palindrome itself, it must be the longest palindromic prefix or the longest palindromic suffix - whichever is longer.",
        "One Manacher pass on the middle answers both questions with the endpoint tests already used above: i - 1 - p[i] == 0 marks a palindromic prefix, i + p[i] == 2q + 1 marks a palindromic suffix.",
        "Edge cases to respect: if s is itself a palindrome the peeling consumes everything, leaving a middle of length 1 (odd s) or 0 (even s). Both fall through correctly, with an empty core and an output equal to s, provided substr is used with a possibly zero length rather than indexed by hand.",
        "The easy-version trap is to test candidate palindromes by comparing strings, which is O(n^2) and dies at a total length of 10^6. Manacher (or a rolling hash) is what makes the hard version pass.",
        "Time: O(n) per test case, O(total length) overall. Space: O(n).",
      ],
    },
  ],
};
