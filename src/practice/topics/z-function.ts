import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Z Algorithm (Compute the Z Array)",
      difficulty: "Easy",
      variation: "Z-array construction, the template",
      link: "https://www.geeksforgeeks.org/z-algorithm-linear-time-pattern-searching-algorithm/",
      question: [
        "Given a string s of length n, build its Z array. z[i] is the length of the longest substring starting at index i that is also a prefix of s. By convention z[0] is set to 0 (it would otherwise trivially be n). Return the whole array.",
        "Example 1:\nInput: s = 'aabxaayaab'\nOutput: [0, 1, 0, 0, 2, 1, 0, 3, 1, 0]\nExplanation: At i = 4 the suffix 'aayaab' shares the prefix 'aa' with s, so z[4] = 2. At i = 7 the suffix 'aab' equals the prefix 'aab' exactly, so z[7] = 3.",
        "Example 2:\nInput: s = 'aaaaa'\nOutput: [0, 4, 3, 2, 1]\nExplanation: Every suffix of a string of equal letters is a prefix, so z[i] = n - i for i >= 1.",
        "Constraints:\n- 1 <= n <= 10^6\n- s consists of printable ASCII characters",
      ],
      code: `// z[i] = length of the longest common prefix of s and the suffix starting at i.
vector<int> zFunction(const string& s) {
    int n = s.size();
    vector<int> z(n, 0);
    int l = 0, r = 0;                              // [l, r) is the rightmost match segment seen so far
    for (int i = 1; i < n; i++) {
        if (i < r) z[i] = min(r - i, z[i - l]);    // reuse the mirror value from inside the box
        while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;   // extend past what was copied
        if (i + z[i] > r) { l = i; r = i + z[i]; } // this match reaches further right, so move the box
    }
    return z;
}`,
      explanation: [
        "The invariant is the 'Z-box' [l, r): a previously found segment such that s[l..r-1] equals s[0..r-l-1]. It is always the match that reaches furthest to the right.",
        "For a new index i inside the box, i - l is the mirrored index in the prefix, so s[i..r-1] equals s[i-l..r-l-1]. Therefore z[i] is at least min(r - i, z[i - l]). The min is essential: beyond r we know nothing about s, and z[i-l] may describe a match that runs past the mirror of r, so it cannot be trusted whole.",
        "Linearity comes from r being monotone. Every brute-force character comparison that succeeds pushes r one step to the right, and r never decreases, so there are at most n successful comparisons in total plus one failed comparison per index.",
        "The tempting bug is writing z[i] = z[i - l] without the min, or forgetting to clamp when z[i - l] exactly equals r - i. In the second case the copied value is a lower bound only and the while loop must still be allowed to extend it, which is why the code always falls through to the loop.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Sum of Similarities of a String With All of Its Suffixes",
      difficulty: "Easy",
      variation: "Direct sum over the Z array",
      question: [
        "The similarity of two strings is the length of their longest common prefix. Given a string s of length n, compute the sum of the similarities of s with each of its n suffixes (the suffixes include s itself).",
        "Example 1:\nInput: s = 'ababa'\nOutput: 9\nExplanation: The Z array is [0, 0, 3, 0, 1]. Similarity with s itself is 5, with 'aba' is 3, with 'a' is 1, and with 'baba' and 'ba' is 0. Total 5 + 3 + 1 = 9.",
        "Example 2:\nInput: s = 'aa'\nOutput: 3\nExplanation: Similarity with 'aa' is 2 and with 'a' is 1, so 3.",
        "Constraints:\n- 1 <= n <= 10^6\n- s consists of lowercase English letters",
      ],
      code: `long long sumOfSimilarities(const string& s) {
    int n = s.size();
    vector<int> z(n, 0);
    int l = 0, r = 0;
    for (int i = 1; i < n; i++) {
        if (i < r) z[i] = min(r - i, z[i - l]);
        while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;
        if (i + z[i] > r) { l = i; r = i + z[i]; }
    }
    long long ans = n;                       // the suffix at index 0 is s itself, similarity n
    for (int i = 1; i < n; i++) ans += z[i]; // every other suffix contributes exactly z[i]
    return ans;
}`,
      explanation: [
        "The similarity of s with the suffix starting at i is by definition the longest common prefix of s and that suffix, which is exactly z[i]. So the answer is n plus the sum of z[1..n-1].",
        "This is the cleanest illustration of what the Z array is for: it answers 'how far does each suffix agree with the whole string' for every suffix at once, which a naive pairwise comparison would need O(n^2) time to do.",
        "The trap is the accumulator width. With n up to 10^6 and a string like 'aaaa...a' the sum is about n^2/2, roughly 5 * 10^11, so an int overflows and the answer silently becomes garbage. Use long long.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Find the Index of the First Occurrence in a String",
      difficulty: "Easy",
      variation: "Pattern matching with a separator",
      link: "https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/",
      question: [
        "Given two strings needle and haystack, return the index of the first occurrence of needle in haystack, or -1 if needle is not part of haystack.",
        "Example 1:\nInput: haystack = 'sadbutsad', needle = 'sad'\nOutput: 0\nExplanation: 'sad' occurs at index 0 and again at index 6; the first index is returned.",
        "Example 2:\nInput: haystack = 'leetcode', needle = 'leeto'\nOutput: -1\nExplanation: 'leeto' never appears in 'leetcode'.",
        "Constraints:\n- 1 <= haystack.length, needle.length <= 10^4\n- both strings consist of lowercase English letters",
      ],
      code: `int strStr(string haystack, string needle) {
    int m = needle.size();
    string t = needle + "#" + haystack;   // '#' appears in neither input, so no match can cross it
    int L = t.size();
    vector<int> z(L, 0);
    int l = 0, r = 0;
    for (int i = 1; i < L; i++) {
        if (i < r) z[i] = min(r - i, z[i - l]);
        while (i + z[i] < L && t[z[i]] == t[i + z[i]]) z[i]++;
        if (i + z[i] > r) { l = i; r = i + z[i]; }
    }
    for (int i = m + 1; i < L; i++)        // skip the pattern and the separator
        if (z[i] == m) return i - m - 1;   // translate concat index back to haystack index
    return -1;
}`,
      explanation: [
        "Searching for a pattern is the same question as 'which suffixes of the concatenation start with the pattern'. Putting the pattern first makes the pattern the prefix, so z[i] measures agreement with the pattern for free.",
        "The separator is what makes the reduction sound. Without it, a run inside the haystack could keep matching characters of the haystack part of t and report a z value larger than m, or the pattern could match into the haystack region across the boundary. Because '#' occurs nowhere else, z[i] is capped at m, and z[i] == m is exactly a full occurrence.",
        "Index translation: position i in t corresponds to position i - (m + 1) in haystack, since the prefix needle plus separator occupies m + 1 characters.",
        "The naive double loop is O(n * m), which is fine for 10^4 but degenerates on inputs like a haystack of 'aaaa...a' with needle 'aaa...ab'. The Z reduction is linear regardless of the input shape.",
        "Time: O(n + m). Space: O(n + m).",
      ],
    },
    {
      name: "String Matching",
      difficulty: "Easy",
      variation: "Count all occurrences",
      link: "https://cses.fi/problemset/task/1753",
      question: [
        "Given a string and a pattern, count how many times the pattern occurs in the string. Occurrences may overlap. The first input line is the string and the second line is the pattern.",
        "Example 1:\nInput:\nsaippuakauppias\npp\nOutput: 2\nExplanation: 'pp' occurs at 0-based positions 3 and 10.",
        "Example 2:\nInput:\naaaa\naa\nOutput: 3\nExplanation: The overlapping occurrences start at positions 0, 1 and 2.",
        "Constraints:\n- both strings have length at most 10^6\n- both strings consist of lowercase English letters",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s, p;
    cin >> s >> p;
    int m = p.size();
    string t = p + "#" + s;
    int L = t.size();
    vector<int> z(L, 0);
    int l = 0, r = 0;
    for (int i = 1; i < L; i++) {
        if (i < r) z[i] = min(r - i, z[i - l]);
        while (i + z[i] < L && t[z[i]] == t[i + z[i]]) z[i]++;
        if (i + z[i] > r) { l = i; r = i + z[i]; }
    }
    long long ans = 0;
    for (int i = m + 1; i < L; i++) if (z[i] == m) ans++;   // z can never exceed m because of '#'
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "Same reduction as first-occurrence search, but instead of returning early we count every index with z[i] == m. Overlaps are handled automatically because each starting position is tested independently - there is no 'skip past the match' step to get wrong.",
        "Memory is the real constraint here. Both strings can be 10^6 characters, so t has about 2 * 10^6 characters and z holds the same number of ints, roughly 8 MB - fine, but building extra copies of t would not be.",
        "The count fits in an int for these limits (at most 10^6), yet using long long costs nothing and removes any doubt when the same code is reused on larger inputs.",
        "Time: O(n + m). Space: O(n + m).",
      ],
    },
    {
      name: "Repeated Substring Pattern",
      difficulty: "Easy",
      variation: "Periodicity test",
      link: "https://leetcode.com/problems/repeated-substring-pattern/",
      question: [
        "Given a string s, return true if it can be constructed by taking some substring of it and appending multiple copies of that substring together. The substring must be a proper substring, so at least two copies are required.",
        "Example 1:\nInput: s = 'abab'\nOutput: true\nExplanation: 'ab' repeated twice. The Z array is [0, 0, 2, 0]; for d = 2 we have 4 % 2 == 0 and z[2] == 4 - 2.",
        "Example 2:\nInput: s = 'aba'\nOutput: false\nExplanation: z[2] = 1 equals 3 - 2, so the suffix 'a' does match the prefix, but 2 does not divide 3, so 'ab' is a period without being a full tiling.",
        "Constraints:\n- 1 <= s.length <= 10^4\n- s consists of lowercase English letters",
      ],
      code: `bool repeatedSubstringPattern(string s) {
    int n = s.size();
    vector<int> z(n, 0);
    int l = 0, r = 0;
    for (int i = 1; i < n; i++) {
        if (i < r) z[i] = min(r - i, z[i - l]);
        while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;
        if (i + z[i] > r) { l = i; r = i + z[i]; }
    }
    for (int d = 1; d < n; d++)
        if (n % d == 0 && z[d] == n - d) return true;   // period d that also divides n tiles s exactly
    return false;
}`,
      explanation: [
        "d is a period of s when shifting s right by d leaves the overlap unchanged, that is s[i] == s[i + d] for every valid i. In Z terms the suffix starting at d must agree with the prefix all the way to the end: z[d] == n - d.",
        "A period alone is not enough - the block must also tile s an integral number of times, which is the n % d == 0 test. 'aba' has period 2 but 2 does not divide 3, and 'aba' is not a repetition of 'ab'.",
        "Conversely, if d divides n and d is a period, then s[i] == s[i mod d] for every i by induction on i / d, so s is exactly n / d copies of its first d characters. Requiring d < n forces at least two copies.",
        "The tempting shortcut is to only test the smallest period, or to only test d = n / 2. Neither is right: 'abcabcabcabc' needs d = 3 while 'aabaab' needs d = 3 too, and the smallest period need not divide n at all, as 'aba' shows. Scanning all divisors of n is both simple and cheap.",
        "Time: O(n) for the Z array plus O(n) for the divisor scan. Space: O(n).",
      ],
    },
    {
      name: "Finding Borders",
      difficulty: "Medium",
      variation: "All borders (proper prefix-suffix pairs)",
      link: "https://cses.fi/problemset/task/1732",
      question: [
        "A border of a string is a proper prefix that is also a suffix of it - proper meaning strictly shorter than the whole string. Given a string, report the lengths of all of its borders in increasing order.",
        "Example 1:\nInput: abcababcab\nOutput: 2 5\nExplanation: 'ab' is both a prefix and a suffix, and so is 'abcab'. No other length works, for instance the prefix 'abcabab' of length 7 differs from the suffix 'ababcab'.",
        "Example 2:\nInput: aaaa\nOutput: 1 2 3\nExplanation: Every proper prefix of a string of equal letters is also a suffix.",
        "Constraints:\n- the string length is between 1 and 10^6\n- the string consists of lowercase English letters",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    int n = s.size();
    vector<int> z(n, 0);
    int l = 0, r = 0;
    for (int i = 1; i < n; i++) {
        if (i < r) z[i] = min(r - i, z[i - l]);
        while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;
        if (i + z[i] > r) { l = i; r = i + z[i]; }
    }
    vector<int> borders;
    for (int i = 1; i < n; i++)
        if (i + z[i] == n) borders.push_back(z[i]);   // the match at i runs to the end, so it is a suffix
    reverse(borders.begin(), borders.end());          // larger i means shorter border
    for (int b : borders) cout << b << ' ';
    cout << "\\n";
    return 0;
}`,
      explanation: [
        "A border of length k is a substring of length k that is simultaneously the prefix s[0..k-1] and the suffix starting at index n - k. Setting i = n - k, that is exactly the statement z[i] == n - i, i.e. i + z[i] == n.",
        "So every index whose match reaches the right end of the string contributes one border, and no index contributes more than one. Because border length is n - i, scanning i upward emits borders in decreasing length, hence the single reverse at the end.",
        "This is where the Z array and the KMP prefix function meet: the KMP approach walks the failure-link chain from pi[n-1] to enumerate the same set. Both are linear, but the Z version needs no chain walk and no separate array of links.",
        "A common mistake is to also accept i = 0, which would report the whole string. The loop starts at i = 1 precisely because borders must be proper. If no border exists the output is an empty line, which is what the loop naturally produces.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Finding Periods",
      difficulty: "Medium",
      variation: "All periods via the border correspondence",
      link: "https://cses.fi/problemset/task/1733",
      question: [
        "A period of a string s of length n is a prefix length p such that s can be built by writing that prefix repeatedly and then cutting the result down to length n. Equivalently s[i] == s[i + p] for every i with i + p < n. Given a string, report all of its periods in increasing order. Note that n itself is always a period.",
        "Example 1:\nInput: abcabcab\nOutput: 3 6 8\nExplanation: Repeating 'abc' gives 'abcabcabc', truncated to 8 characters this is 'abcabcab'. Repeating 'abcabc' and cutting to 8 gives the same string, and p = 8 is the trivial period.",
        "Example 2:\nInput: aaaa\nOutput: 1 2 3 4\nExplanation: Every prefix length works because all characters are equal.",
        "Constraints:\n- the string length is between 1 and 10^6\n- the string consists of lowercase English letters",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    int n = s.size();
    vector<int> z(n, 0);
    int l = 0, r = 0;
    for (int i = 1; i < n; i++) {
        if (i < r) z[i] = min(r - i, z[i - l]);
        while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;
        if (i + z[i] > r) { l = i; r = i + z[i]; }
    }
    for (int p = 1; p < n; p++)
        if (p + z[p] == n) cout << p << ' ';   // shifting by p leaves the whole overlap matching
    cout << n << "\\n";                        // the full length is always a period
    return 0;
}`,
      explanation: [
        "The condition s[i] == s[i + p] for all valid i says the suffix starting at p equals the prefix of the same length, i.e. z[p] == n - p. That is the identical test used for borders, which reflects the classic duality: p is a period exactly when n - p is a border length.",
        "That duality is why nothing extra is needed. Iterating p from 1 upward gives the periods already sorted, so unlike the borders problem there is no reverse step, and p = n is appended unconditionally because the empty string is always a border.",
        "Why the pointwise condition implies the 'repeat and truncate' phrasing: from s[i] == s[i + p] one gets s[i] == s[i mod p] by induction on i / p, which is precisely the string obtained by tiling the first p characters and cutting at n.",
        "The trap is assuming a period must divide n. It need not - 'abcabcab' has period 3 while 8 is not a multiple of 3. Divisibility is only required when you want an exact tiling with no truncation, as in the repeated-substring problem.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Longest Happy Prefix",
      difficulty: "Medium",
      variation: "Longest proper border",
      link: "https://leetcode.com/problems/longest-happy-prefix/",
      question: [
        "A happy prefix is a non-empty prefix of a string that is also a suffix of it, excluding the string itself. Given a string s, return the longest happy prefix of s, or the empty string if there is none.",
        "Example 1:\nInput: s = 'level'\nOutput: 'l'\nExplanation: The non-empty proper prefixes are 'l', 'le', 'lev', 'leve'; only 'l' is also a suffix.",
        "Example 2:\nInput: s = 'ababab'\nOutput: 'abab'\nExplanation: 'abab' is both a prefix and a suffix. 'ab' also qualifies but is shorter.",
        "Constraints:\n- 1 <= s.length <= 10^5\n- s consists of lowercase English letters",
      ],
      code: `string longestPrefix(string s) {
    int n = s.size();
    vector<int> z(n, 0);
    int l = 0, r = 0;
    for (int i = 1; i < n; i++) {
        if (i < r) z[i] = min(r - i, z[i - l]);
        while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;
        if (i + z[i] > r) { l = i; r = i + z[i]; }
    }
    for (int i = 1; i < n; i++)
        if (i + z[i] == n) return s.substr(0, z[i]);   // smallest such i means the longest border
    return "";
}`,
      explanation: [
        "This asks for the single longest border rather than all of them. Border length is n - i, so the first index i >= 1 satisfying i + z[i] == n already gives the maximum, and the scan can return immediately.",
        "Equivalently this is pi[n-1] from the KMP prefix function. Both computations are linear; the Z version is convenient when you already have the Z array for another purpose in the same problem.",
        "The word 'proper' is the whole difficulty of the statement. Starting the scan at i = 1 excludes i = 0, which would return s itself. For a string with no repetition, such as 'abc', the loop finds nothing and the empty string is correct.",
        "A tempting but wrong shortcut is to take max(z[i]) over all i - that finds the longest prefix occurring anywhere, not the longest one anchored at the right end. In 'aabaa...' style inputs those two answers differ.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Password",
      difficulty: "Medium",
      variation: "Border that also occurs strictly inside",
      link: "https://codeforces.com/problemset/problem/126/B",
      question: [
        "Given a string s, find the longest string t that satisfies all three conditions: t is a proper prefix of s, t is a proper suffix of s, and t also occurs somewhere inside s at a position that is neither the very start nor the final suffix position. Print t, or 'Just a legend' if no such t exists.",
        "Example 1:\nInput: fixprefixsuffix\nOutput: fix\nExplanation: 'fix' is a prefix, is a suffix, and also occurs in the middle starting at index 6 ('prefix').",
        "Example 2:\nInput: abcdabc\nOutput: Just a legend\nExplanation: 'abc' is a prefix and a suffix, but it never occurs anywhere strictly between the two, so no candidate survives.",
        "Constraints:\n- 1 <= |s| <= 10^6\n- s consists of lowercase English letters",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    int n = s.size();
    vector<int> z(n, 0);
    int l = 0, r = 0;
    for (int i = 1; i < n; i++) {
        if (i < r) z[i] = min(r - i, z[i - l]);
        while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;
        if (i + z[i] > r) { l = i; r = i + z[i]; }
    }
    vector<int> best(n, 0);                                   // best[j] = max z over indices 1..j
    for (int j = 1; j < n; j++) best[j] = max(best[j - 1], z[j]);
    for (int i = 1; i < n; i++) {
        if (i + z[i] != n) continue;                          // z[i] is a border length
        int k = z[i];
        if (i - 1 >= 1 && best[i - 1] >= k) {                 // some interior index hosts the prefix too
            cout << s.substr(0, k) << "\\n";
            return 0;
        }
    }
    cout << "Just a legend" << "\\n";
    return 0;
}`,
      explanation: [
        "Candidates are exactly the border lengths, found as before by i + z[i] == n with border length k = n - i = z[i]. Iterating i upward walks candidates from longest to shortest, so the first one that passes the middle test is the answer.",
        "The middle test is 'does the prefix of length k occur at some index j with 1 <= j <= n - k - 1'. An occurrence at j means z[j] >= k, and since z[j] <= n - j, any j with z[j] >= k already satisfies j <= n - k. So the only forbidden case is j == n - k, and the safe range is exactly j <= n - k - 1 = i - 1.",
        "Prefix maxima make each test O(1): best[i-1] is the largest match length available anywhere in 1..i-1, and it is >= k precisely when some interior position hosts the full prefix. Recomputing a max per candidate instead would be O(n^2) on inputs like 'aaaa...a', which has n - 1 borders.",
        "The classic wrong solution takes the global maximum of z[1..n-1] and compares it once against the longest border. That fails when the only long interior match sits at the suffix position itself, or when a shorter border would have worked while the longest one does not - both candidates and window must shrink together.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Shortest Palindrome",
      difficulty: "Hard",
      variation: "Z on s + separator + reverse(s)",
      link: "https://leetcode.com/problems/shortest-palindrome/",
      question: [
        "You are given a string s. You may convert it to a palindrome by adding characters in front of it. Return the shortest palindrome you can obtain this way.",
        "Example 1:\nInput: s = 'aacecaaa'\nOutput: 'aaacecaaa'\nExplanation: The longest palindromic prefix is 'aacecaa' of length 7. Only the trailing 'a' is left over, so reversing it and prepending gives 'a' + 'aacecaaa'.",
        "Example 2:\nInput: s = 'abcd'\nOutput: 'dcbabcd'\nExplanation: The longest palindromic prefix is just 'a', so the remaining 'bcd' is reversed to 'dcb' and prepended.",
        "Constraints:\n- 0 <= s.length <= 5 * 10^4\n- s consists of lowercase English letters",
      ],
      code: `string shortestPalindrome(string s) {
    int n = s.size();
    if (n == 0) return s;
    string rev(s.rbegin(), s.rend());
    string t = s + "#" + rev;
    int L = t.size();
    vector<int> z(L, 0);
    int l = 0, r = 0;
    for (int i = 1; i < L; i++) {
        if (i < r) z[i] = min(r - i, z[i - l]);
        while (i + z[i] < L && t[z[i]] == t[i + z[i]]) z[i]++;
        if (i + z[i] > r) { l = i; r = i + z[i]; }
    }
    int best = 0;
    for (int i = n + 1; i < L; i++)
        if (i + z[i] == L) { best = z[i]; break; }   // reaching the end means a palindromic prefix
    return rev.substr(0, n - best) + s;              // prepend the reverse of the leftover tail
}`,
      explanation: [
        "Prepending characters cannot change s, so the answer is forced: pick the longest prefix of s that is already a palindrome, say of length k, and prepend the reverse of the remaining suffix s[k..]. Any shorter prefix leaves more to mirror, and no palindrome can be shorter than 2n - k.",
        "The reduction to Z: let j be an index into rev, sitting at position i = n + 1 + j of t. Then z[i] is the longest common prefix of s and rev[j..], and rev[j..] is the reverse of s[0..n-1-j], of length n - j. The suffix of rev reaches the end of t exactly when z[i] == L - i == n - j, which says s[0..n-j-1] equals its own reverse - a palindromic prefix of length n - j.",
        "Smaller i means larger n - j, so the first index satisfying i + z[i] == L gives the longest palindromic prefix and the loop can break. The single-character prefix always qualifies, so best is at least 1 whenever n >= 1.",
        "The separator is not optional. Without it, matches could run from the s region into the rev region and report lengths that correspond to no palindrome at all - the classic silent wrong answer on inputs like 'aaa...a'.",
        "The tempting O(n^2) approach checks every prefix for palindromicity with two pointers, which times out on a 5 * 10^4 string of repeated characters. Manacher would also work, but the Z trick reuses one template.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Prefixes and Suffixes",
      difficulty: "Hard",
      variation: "Occurrence count of every border",
      link: "https://codeforces.com/problemset/problem/432/D",
      question: [
        "You are given a string s. Consider every prefix of s that is also a suffix of s, including s itself. For each such prefix, report its length together with the number of times it occurs as a substring of s. Print the count of these prefixes on the first line, then one line per prefix in increasing order of length.",
        "Example 1:\nInput: ABACABA\nOutput:\n3\n1 4\n3 2\n7 1\nExplanation: The prefix-suffixes are 'A', 'ABA' and 'ABACABA'. 'A' occurs at positions 0, 2, 4, 6 so 4 times; 'ABA' occurs at positions 0 and 4 so twice; the full string occurs once.",
        "Example 2:\nInput: AAA\nOutput:\n3\n1 3\n2 2\n3 1\nExplanation: 'A' occurs 3 times, 'AA' occurs at positions 0 and 1, and 'AAA' once.",
        "Constraints:\n- 1 <= |s| <= 10^5\n- s consists of uppercase English letters",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    int n = s.size();
    vector<int> z(n, 0);
    int l = 0, r = 0;
    for (int i = 1; i < n; i++) {
        if (i < r) z[i] = min(r - i, z[i - l]);
        while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;
        if (i + z[i] > r) { l = i; r = i + z[i]; }
    }
    vector<long long> cnt(n + 2, 0);
    for (int i = 1; i < n; i++) if (z[i] > 0) cnt[z[i]]++;      // bucket by exact match length
    for (int len = n - 1; len >= 1; len--) cnt[len] += cnt[len + 1];   // suffix sums: z[i] >= len
    vector<int> borders;
    for (int i = 1; i < n; i++) if (i + z[i] == n) borders.push_back(z[i]);
    reverse(borders.begin(), borders.end());                    // increasing length
    borders.push_back(n);                                       // s itself is always counted
    cout << borders.size() << "\\n";
    for (int b : borders) cout << b << ' ' << cnt[b] + 1 << "\\n";   // +1 for the occurrence at index 0
    return 0;
}`,
      explanation: [
        "Two independent facts are needed. Which prefixes are also suffixes: the usual i + z[i] == n test, plus the whole string. How often the prefix of length k occurs: the number of indices i >= 1 with z[i] >= k, plus one for the occurrence at index 0.",
        "Turning 'z[i] >= k' into O(1) lookups is the key step. Bucket every positive z[i] by its exact value, then take suffix sums over the buckets; cnt[k] then holds the number of indices whose match length is at least k. Answering each border with a fresh scan would be O(n^2) on strings like all-equal letters, which have n borders.",
        "Correctness of the count: an occurrence of the prefix of length k starting at index i >= 1 means s[i..i+k-1] equals s[0..k-1], which by definition of the Z array is exactly z[i] >= k. There is no double counting because each start index is counted once.",
        "Two arithmetic traps. The counts can reach about n^2 in aggregate reasoning but each individual answer is at most n, so ints would survive here - still, the bucket suffix sums are cleaner in long long and the pattern generalises. Second, cnt must be sized n + 2 so that cnt[n + 1] exists when the suffix-sum loop starts at len = n - 1.",
        "Time: O(n). Space: O(n).",
      ],
    },
  ],
};
