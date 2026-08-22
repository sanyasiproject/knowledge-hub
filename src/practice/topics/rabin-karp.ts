import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Rabin-Karp Algorithm for Pattern Searching",
      difficulty: "Easy",
      variation: "Rolling-hash template, all occurrences",
      link: "https://www.geeksforgeeks.org/rabin-karp-algorithm-for-pattern-searching/",
      question: [
        "Given a text string of length n and a pattern string of length m, return every 0-based index i such that the substring of text starting at i and of length m equals the pattern. Solve it by hashing the pattern once and then maintaining the hash of the current window of the text, so that sliding the window one position right costs O(1) instead of re-hashing m characters.",
        "Example 1:\nInput: text = 'GEEKS FOR GEEKS', pattern = 'GEEK'\nOutput: [0, 10]\nExplanation: The pattern starts at index 0 and again at index 10 (the second word begins there).",
        "Example 2:\nInput: text = 'AABAACAADAABAABA', pattern = 'AABA'\nOutput: [0, 9, 12]\nExplanation: Occurrences overlap - the match at 12 starts inside the match at 9.",
        "Constraints:\n- 1 <= m <= n <= 10^6\n- Both strings contain printable ASCII characters",
      ],
      code: `vector<int> rabinKarp(const string& text, const string& pat) {
    int n = text.size(), m = pat.size();
    vector<int> res;
    if (m == 0 || m > n) return res;
    const long long MOD = 1000000007, B = 131;
    long long pw = 1;
    for (int i = 0; i + 1 < m; i++) pw = pw * B % MOD;   // B^(m-1), the weight of the leaving char
    long long hp = 0, hw = 0;
    for (int i = 0; i < m; i++) {
        hp = (hp * B + pat[i]) % MOD;
        hw = (hw * B + text[i]) % MOD;
    }
    for (int i = 0; i + m <= n; i++) {
        // hash equality is only a filter; compare() turns it into a certainty
        if (hw == hp && text.compare(i, m, pat) == 0) res.push_back(i);
        if (i + m < n) {
            hw = ((hw - (long long)text[i] % MOD * pw % MOD) % MOD + MOD) % MOD;  // drop text[i]
            hw = (hw * B + text[i + m]) % MOD;                                    // append text[i+m]
        }
    }
    return res;
}`,
      explanation: [
        "Treat a window of m characters as the digits of a number in base B, reduced modulo a large prime. The window hash is c[i]*B^(m-1) + c[i+1]*B^(m-2) + ... + c[i+m-1]. Shifting right by one is then two arithmetic steps: subtract the leaving character times B^(m-1), multiply the rest by B, add the entering character. That is the whole trick - O(1) per window instead of O(m).",
        "The invariant to keep straight is which power belongs to which position. The leading character of the window always carries B^(m-1), so pw must be B^(m-1) and not B^m; getting that off by one produces hashes that never match anything.",
        "Modular arithmetic needs two defences: cast to long long before multiplying (a 32-bit product of two values near 10^9 overflows), and add MOD back after the subtraction because the intermediate value can go negative.",
        "The tempting shortcut is to report a match on hash equality alone. Different strings can share a hash, so a single-modulus filter must be confirmed by a real comparison - which is cheap because false positives are rare, though it is what makes the worst case O(n*m) rather than O(n).",
        "Time: O(n + m) expected, O(n * m) worst case when hashes collide constantly. Space: O(1) beyond the output.",
      ],
    },
    {
      name: "Find the Index of the First Occurrence in a String",
      difficulty: "Easy",
      variation: "First occurrence only",
      link: "https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/",
      question: [
        "Given two strings haystack and needle, return the index of the first occurrence of needle in haystack, or -1 if needle is not part of haystack.",
        "Example 1:\nInput: haystack = 'sadbutsad', needle = 'sad'\nOutput: 0\nExplanation: 'sad' occurs at index 0 and at index 6; the first one is returned.",
        "Example 2:\nInput: haystack = 'leetcode', needle = 'leeto'\nOutput: -1\nExplanation: 'leeto' never appears in 'leetcode'.",
        "Constraints:\n- 1 <= haystack.length, needle.length <= 10^4\n- Both strings consist of lowercase English letters",
      ],
      code: `int strStr(string haystack, string needle) {
    int n = haystack.size(), m = needle.size();
    if (m == 0) return 0;
    if (m > n) return -1;
    const long long MOD = 1000000007, B = 131;
    long long pw = 1;
    for (int i = 0; i + 1 < m; i++) pw = pw * B % MOD;
    long long hp = 0, hw = 0;
    for (int i = 0; i < m; i++) {
        hp = (hp * B + needle[i]) % MOD;
        hw = (hw * B + haystack[i]) % MOD;
    }
    for (int i = 0; i + m <= n; i++) {
        if (hw == hp && haystack.compare(i, m, needle) == 0) return i;   // leftmost match wins
        if (i + m < n) {
            hw = ((hw - (long long)haystack[i] % MOD * pw % MOD) % MOD + MOD) % MOD;
            hw = (hw * B + haystack[i + m]) % MOD;
        }
    }
    return -1;
}`,
      explanation: [
        "Identical machinery to the template, but the scan returns on the first confirmed match, so nothing after it is ever hashed. Scanning left to right is what makes the answer the leftmost index - there is no need to collect all matches and take the minimum.",
        "The early exits matter for correctness, not just speed: with m > n the initial hashing loop would read past the end of haystack, and with m == 0 an empty needle is defined to match at index 0.",
        "Compared with KMP this is the same asymptotic cost on real inputs and much less code, but KMP is worst-case linear while Rabin-Karp is only expected linear. Prefer hashing when you will later need substring comparisons elsewhere too; prefer KMP when an adversary picks the input.",
        "Time: O(n + m) expected. Space: O(1).",
      ],
    },
    {
      name: "String Matching",
      difficulty: "Easy",
      variation: "Counting occurrences, prefix hashes",
      link: "https://cses.fi/problemset/task/1753",
      question: [
        "Given a string and a pattern, count how many times the pattern occurs in the string. Occurrences may overlap. The first input line is the string, the second line is the pattern.",
        "Example 1:\nInput:\nsaippuakauppias\npp\nOutput: 2\nExplanation: 'pp' occurs at 0-based indices 3 and 10.",
        "Example 2:\nInput:\naaaa\naa\nOutput: 3\nExplanation: The windows starting at 0, 1 and 2 all equal 'aa'.",
        "Constraints:\n- 1 <= length of the string <= 10^6\n- 1 <= length of the pattern <= 10^6\n- Both consist of lowercase English letters",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s, p;
    cin >> s >> p;
    int n = s.size(), m = p.size();
    if (m > n) { cout << 0 << "\\n"; return 0; }
    const long long M1 = 1000000007, M2 = 998244353, B1 = 131, B2 = 137;
    long long pw1 = 1, pw2 = 1;
    for (int i = 0; i < m; i++) { pw1 = pw1 * B1 % M1; pw2 = pw2 * B2 % M2; }
    vector<long long> h1(n + 1, 0), h2(n + 1, 0);
    for (int i = 0; i < n; i++) {
        h1[i + 1] = (h1[i] * B1 + s[i]) % M1;
        h2[i + 1] = (h2[i] * B2 + s[i]) % M2;
    }
    long long q1 = 0, q2 = 0;
    for (int i = 0; i < m; i++) {
        q1 = (q1 * B1 + p[i]) % M1;
        q2 = (q2 * B2 + p[i]) % M2;
    }
    long long cnt = 0;
    for (int i = 0; i + m <= n; i++) {
        // hash of s[i .. i+m-1] from the prefix table
        long long g1 = ((h1[i + m] - h1[i] * pw1) % M1 + M1) % M1;
        long long g2 = ((h2[i + m] - h2[i] * pw2) % M2 + M2) % M2;
        if (g1 == q1 && g2 == q2) cnt++;
    }
    cout << cnt << "\\n";
    return 0;
}`,
      explanation: [
        "Precomputing prefix hashes h[i] = hash of the first i characters lets any window be extracted in O(1) as h[r] - h[l] * B^(r-l). This is the reusable form of the rolling hash: instead of one moving window it answers any substring, which every later problem in this topic depends on.",
        "On a judge you cannot afford an O(m) verification on every hash hit, because an adversarial test like a million 'a' characters would make every window a hit and turn the scan quadratic. The fix is two independent moduli: a false positive now needs a simultaneous collision in both, with probability around 1/(M1*M2) per comparison.",
        "The product h1[i] * pw1 reaches about 10^18, which fits in a signed 64-bit integer but leaves no room to spare - reducing pw1 modulo M1 up front is what keeps it in range, and doing the subtraction before any further multiplication is what keeps it correct.",
        "Time: O(n + m). Space: O(n).",
      ],
    },
    {
      name: "String Matching in an Array",
      difficulty: "Easy",
      variation: "Multi-pattern containment",
      link: "https://leetcode.com/problems/string-matching-in-an-array/",
      question: [
        "Given an array of distinct strings words, return all strings in words that are a substring of some other string in words. The answer may be returned in any order.",
        "Example 1:\nInput: words = ['mass','as','hero','superhero']\nOutput: ['as','hero']\nExplanation: 'as' is a substring of 'mass' and 'hero' is a substring of 'superhero'. 'mass' and 'superhero' are not substrings of anything.",
        "Example 2:\nInput: words = ['leetcode','et','code']\nOutput: ['et','code']\nExplanation: Both 'et' and 'code' occur inside 'leetcode'.",
        "Constraints:\n- 1 <= words.length <= 100\n- 1 <= words[i].length <= 30\n- words[i] consists of lowercase English letters and all strings are distinct",
      ],
      code: `class Solution {
    // Rabin-Karp membership test: does hay contain nee?
    bool contains(const string& hay, const string& nee) {
        int n = hay.size(), m = nee.size();
        if (m > n) return false;
        const long long MOD = 1000000007, B = 131;
        long long pw = 1;
        for (int i = 0; i + 1 < m; i++) pw = pw * B % MOD;
        long long hn = 0, hw = 0;
        for (int i = 0; i < m; i++) {
            hn = (hn * B + nee[i]) % MOD;
            hw = (hw * B + hay[i]) % MOD;
        }
        for (int i = 0; i + m <= n; i++) {
            if (hw == hn && hay.compare(i, m, nee) == 0) return true;
            if (i + m < n) {
                hw = ((hw - (long long)hay[i] % MOD * pw % MOD) % MOD + MOD) % MOD;
                hw = (hw * B + hay[i + m]) % MOD;
            }
        }
        return false;
    }

public:
    vector<string> stringMatching(vector<string>& words) {
        vector<string> res;
        int k = words.size();
        for (int i = 0; i < k; i++) {
            for (int j = 0; j < k; j++) {
                // strings are distinct, so an equal-length word can never contain another
                if (i != j && contains(words[j], words[i])) {
                    res.push_back(words[i]);
                    break;
                }
            }
        }
        return res;
    }
};`,
      explanation: [
        "The pattern here is many short patterns against many short texts. Each pair is one independent Rabin-Karp scan, and the break stops as soon as one container is found so a word is never reported twice.",
        "Because the words are guaranteed distinct, the i != j test is enough: a word of the same length as another either equals it (impossible) or cannot be a substring of it, so no extra length guard is needed.",
        "Hashing pays off here mostly as a rehearsal - with 30-character words a direct comparison is just as fast. It becomes essential when the patterns get long, since the pattern hash is computed once and each text window then costs O(1). The genuinely scalable alternative for very many patterns is Aho-Corasick, which builds one automaton over all patterns and scans each text once.",
        "The trap is reporting duplicates or reporting a word as a substring of itself; both come from forgetting that the loop compares every ordered pair.",
        "Time: O(k^2 * L) where k is the number of words and L the maximum length. Space: O(1) beyond the output.",
      ],
    },
    {
      name: "Repeated DNA Sequences",
      difficulty: "Medium",
      variation: "Fixed-length windows, exact fingerprint",
      link: "https://leetcode.com/problems/repeated-dna-sequences/",
      question: [
        "A DNA sequence is a string over the characters 'A', 'C', 'G' and 'T'. Given such a string s, return every 10-letter-long substring that occurs more than once in s. Each such substring must appear exactly once in the answer, and the answer may be in any order.",
        "Example 1:\nInput: s = 'AAAAACCCCCAAAAACCCCCCAAAAAGGGTTT'\nOutput: ['AAAAACCCCC','CCCCCAAAAA']\nExplanation: Both 10-letter windows appear twice; every other window appears once.",
        "Example 2:\nInput: s = 'AAAAAAAAAAAAA'\nOutput: ['AAAAAAAAAA']\nExplanation: The only 10-letter window is 'AAAAAAAAAA' and it starts at four different indices.",
        "Constraints:\n- 1 <= s.length <= 10^5\n- s[i] is one of 'A', 'C', 'G', 'T'",
      ],
      code: `vector<string> findRepeatedDnaSequences(string s) {
    vector<string> res;
    int n = s.size();
    if (n < 10) return res;
    int code[26] = {};
    code['A' - 'A'] = 0; code['C' - 'A'] = 1;
    code['G' - 'A'] = 2; code['T' - 'A'] = 3;
    unordered_map<int,int> cnt;
    cnt.reserve(n * 2);
    int cur = 0, mask = (1 << 20) - 1;   // keep only the last 10 two-bit digits
    for (int i = 0; i < n; i++) {
        cur = ((cur << 2) | code[s[i] - 'A']) & mask;
        // report the moment the count reaches two, so each answer is added once
        if (i >= 9 && ++cnt[cur] == 2) res.push_back(s.substr(i - 9, 10));
    }
    return res;
}`,
      explanation: [
        "The alphabet has four letters, so each character is two bits and a 10-character window is exactly 20 bits. Base 4 with no modulus makes the rolling hash a perfect fingerprint: two windows share a value if and only if they are the same string. No verification step is needed, which is unusual and worth recognising when the alphabet is small and the window is short.",
        "The roll is a shift instead of a multiply: shift left by two to make room, OR in the new character, and AND with the 20-bit mask to evict the character that fell off the front. That mask is doing the job that subtracting c * B^(m-1) does in the general version.",
        "Counting and reporting at exactly count == 2 is what keeps the output free of duplicates. Collecting every hit into a set of strings also works but stores O(n) ten-character strings instead of O(n) integers.",
        "The wrong-but-tempting approach is inserting each substring into an unordered_set<string>. It is correct, but every insert hashes ten characters afresh, so it throws away the whole point of the rolling window.",
        "Time: O(n). Space: O(n) for the counter map.",
      ],
    },
    {
      name: "Check If a String Contains All Binary Codes of Size K",
      difficulty: "Medium",
      variation: "Rolling bitmask, distinct-window counting",
      link: "https://leetcode.com/problems/check-if-a-string-contains-all-binary-codes-of-size-k/",
      question: [
        "Given a binary string s and an integer k, return true if every binary string of length k is a substring of s, and false otherwise.",
        "Example 1:\nInput: s = '00110110', k = 2\nOutput: true\nExplanation: The length-2 windows are 00, 01, 11, 10, 01, 11, 10, which cover all four codes 00, 01, 10, 11.",
        "Example 2:\nInput: s = '0110', k = 2\nOutput: false\nExplanation: The windows are 01, 11, 10. The code 00 never appears.",
        "Constraints:\n- 1 <= s.length <= 5 * 10^5\n- s[i] is '0' or '1'\n- 1 <= k <= 20",
      ],
      code: `bool hasAllCodes(string s, int k) {
    int n = s.size();
    long long total = 1LL << k;
    if (n < k + total - 1) return false;   // n - k + 1 windows must cover every code
    vector<bool> seen(total, false);
    int cur = 0, mask = (int)total - 1;
    long long found = 0;
    for (int i = 0; i < n; i++) {
        cur = ((cur << 1) | (s[i] - '0')) & mask;   // roll: shift in one bit, drop the oldest
        if (i >= k - 1 && !seen[cur]) {
            seen[cur] = true;
            if (++found == total) return true;
        }
    }
    return false;
}`,
      explanation: [
        "A binary window of length k read as a base-2 number is again a collision-free fingerprint, and it doubles as a direct index into a seen array of size 2^k. That is the whole solution: roll the window, mark the code, stop when 2^k distinct codes have been marked.",
        "The pigeonhole precheck is the useful piece of reasoning. There are only n - k + 1 windows, so if n - k + 1 < 2^k the answer is false without looking at a single character. It also protects the loop from k > n.",
        "vector<bool> of size 2^k is at most about a million bits for k = 20, far cheaper than an unordered_set of integers and with no hashing cost per window.",
        "The trap is building each window as a substring and inserting it into a set of strings: that is O(n * k) time and O(n * k) memory and times out at the upper limits.",
        "Time: O(n + 2^k). Space: O(2^k).",
      ],
    },
    {
      name: "Finding Borders",
      difficulty: "Medium",
      variation: "Prefix equals suffix via substring hashes",
      link: "https://cses.fi/problemset/task/1732",
      question: [
        "A border of a string is a proper prefix that is also a suffix of it - proper meaning strictly shorter than the whole string. Given a string, print the lengths of all its borders in increasing order.",
        "Example 1:\nInput: abcababcab\nOutput: 2 5\nExplanation: The prefix 'ab' equals the last two characters, and the prefix 'abcab' equals the last five. No other length works.",
        "Example 2:\nInput: aaaa\nOutput: 1 2 3\nExplanation: Every proper prefix of a constant string is also a suffix.",
        "Constraints:\n- 1 <= length of the string <= 10^6\n- The string consists of lowercase English letters",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    int n = s.size();
    const long long M1 = 1000000007, M2 = 998244353, B1 = 131, B2 = 137;
    vector<long long> h1(n + 1, 0), h2(n + 1, 0), p1(n + 1, 1), p2(n + 1, 1);
    for (int i = 0; i < n; i++) {
        h1[i + 1] = (h1[i] * B1 + s[i]) % M1;
        h2[i + 1] = (h2[i] * B2 + s[i]) % M2;
        p1[i + 1] = p1[i] * B1 % M1;
        p2[i + 1] = p2[i] * B2 % M2;
    }
    // packed double hash of s[i .. i+len-1]
    auto get = [&](int i, int len) {
        long long a = ((h1[i + len] - h1[i] * p1[len]) % M1 + M1) % M1;
        long long b = ((h2[i + len] - h2[i] * p2[len]) % M2 + M2) % M2;
        return a * M2 + b;
    };
    for (int len = 1; len < n; len++)
        if (get(0, len) == get(n - len, len)) cout << len << ' ';
    cout << "\\n";
    return 0;
}`,
      explanation: [
        "Once any substring hash is available in O(1), the definition translates directly: length len is a border exactly when the substring starting at 0 and the substring starting at n - len, both of length len, are equal. One comparison per length gives an O(n) sweep.",
        "Packing the two moduli into a single long long as a * M2 + b lets one == compare both hashes at once. It is safe because a < M1 and b < M2, so the packed value stays under M1 * M2 which is about 10^18 and inside signed 64-bit range.",
        "This is the hashing counterpart of the KMP failure function: the borders of the whole string are exactly the chain pi[n-1], pi[pi[n-1]-1], ... Hashing gets there without building the automaton, at the price of being probabilistic - which is why two moduli rather than one matter on a judge with adversarial anti-hash tests.",
        "The off-by-one to watch is the loop bound. len must stop at n - 1, since len = n would report the string as its own border.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Finding Periods",
      difficulty: "Medium",
      variation: "Periodicity test",
      link: "https://cses.fi/problemset/task/1733",
      question: [
        "A period of a string is a prefix such that repeating it enough times, possibly cutting the last copy short, produces the string. Equivalently, length p is a period when s[i] equals s[i+p] for every valid i. Given a string, print the lengths of all its periods in increasing order. The full length is always a period.",
        "Example 1:\nInput: abcabca\nOutput: 3 6 7\nExplanation: 'abc' repeated gives 'abcabca' after truncation; 'abcabc' plus its first character gives the string; and the whole string is trivially a period.",
        "Example 2:\nInput: aabaa\nOutput: 3 4 5\nExplanation: For p = 3 the prefix 'aa' equals the suffix 'aa', for p = 4 the prefix 'a' equals the suffix 'a', and p = 5 is the whole string.",
        "Constraints:\n- 1 <= length of the string <= 10^6\n- The string consists of lowercase English letters",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    int n = s.size();
    const long long M1 = 1000000007, M2 = 998244353, B1 = 131, B2 = 137;
    vector<long long> h1(n + 1, 0), h2(n + 1, 0), p1(n + 1, 1), p2(n + 1, 1);
    for (int i = 0; i < n; i++) {
        h1[i + 1] = (h1[i] * B1 + s[i]) % M1;
        h2[i + 1] = (h2[i] * B2 + s[i]) % M2;
        p1[i + 1] = p1[i] * B1 % M1;
        p2[i + 1] = p2[i] * B2 % M2;
    }
    auto get = [&](int i, int len) {
        long long a = ((h1[i + len] - h1[i] * p1[len]) % M1 + M1) % M1;
        long long b = ((h2[i + len] - h2[i] * p2[len]) % M2 + M2) % M2;
        return a * M2 + b;
    };
    for (int p = 1; p <= n; p++) {
        // p is a period iff s shifted left by p agrees with s on the overlap
        if (p == n || get(0, n - p) == get(p, n - p)) cout << p << ' ';
    }
    cout << "\\n";
    return 0;
}`,
      explanation: [
        "The condition 's[i] == s[i+p] for all i' says that the string overlaps itself when shifted by p. The overlap has length n - p, so the whole family of n character comparisons collapses into one substring equality: s[0 .. n-p-1] == s[p .. n-1]. With prefix hashes that is O(1) per candidate.",
        "That equality is also the border identity in disguise: p is a period of s exactly when n - p is a border length. So this problem and Finding Borders are the same computation read from the two ends, which is a good sanity check when debugging either.",
        "Handle p == n separately - the overlap is empty there and get(0, 0) would compare two empty substrings, which is harmless but relying on it is fragile. The full length is a period by definition, so just print it.",
        "The wrong-but-tempting approach is checking each p by literally verifying s[i] == s[i+p]. That is O(n) per candidate and O(n^2) overall, which dies at n = 10^6 even though it passes every small hand test.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Longest Duplicate Substring",
      difficulty: "Hard",
      variation: "Binary search on length plus hashing",
      link: "https://leetcode.com/problems/longest-duplicate-substring/",
      question: [
        "Given a string s, consider all substrings that occur at least twice in s; the two occurrences may overlap. Return any longest such duplicated substring. If no substring occurs more than once, return the empty string.",
        "Example 1:\nInput: s = 'banana'\nOutput: 'ana'\nExplanation: 'ana' occurs at indices 1 and 3 (overlapping). No duplicated substring is longer.",
        "Example 2:\nInput: s = 'abcd'\nOutput: ''\nExplanation: Every character, and therefore every substring, is unique.",
        "Constraints:\n- 2 <= s.length <= 3 * 10^4\n- s consists of lowercase English letters",
      ],
      code: `string longestDupSubstring(string s) {
    int n = s.size();
    const long long M1 = 1000000007, M2 = 998244353, B1 = 131, B2 = 137;
    vector<long long> h1(n + 1, 0), h2(n + 1, 0), p1(n + 1, 1), p2(n + 1, 1);
    for (int i = 0; i < n; i++) {
        h1[i + 1] = (h1[i] * B1 + s[i]) % M1;
        h2[i + 1] = (h2[i] * B2 + s[i]) % M2;
        p1[i + 1] = p1[i] * B1 % M1;
        p2[i + 1] = p2[i] * B2 % M2;
    }
    auto get = [&](int i, int len) {
        long long a = ((h1[i + len] - h1[i] * p1[len]) % M1 + M1) % M1;
        long long b = ((h2[i + len] - h2[i] * p2[len]) % M2 + M2) % M2;
        return a * M2 + b;
    };
    // start index of some repeated substring of this length, or -1
    auto probe = [&](int len) {
        unordered_set<long long> seen;
        seen.reserve(n * 2);
        for (int i = 0; i + len <= n; i++)
            if (!seen.insert(get(i, len)).second) return i;
        return -1;
    };
    int lo = 1, hi = n - 1, start = -1, best = 0;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        int pos = probe(mid);
        if (pos >= 0) { start = pos; best = mid; lo = mid + 1; }
        else hi = mid - 1;
    }
    return best > 0 ? s.substr(start, best) : "";
}`,
      explanation: [
        "The predicate 'some substring of length L appears twice' is monotone: if two copies of a length-L string exist, their length-(L-1) prefixes are also a duplicated pair. So the set of feasible lengths is a prefix of 1..n-1 and binary search finds its largest element with O(log n) probes.",
        "Each probe is a single linear pass: hash every window of that length and look for a repeat in a hash set. Storing hashes rather than substrings is what keeps a probe O(n) instead of O(n * L).",
        "Recording the position from the successful probe is what lets the answer be reconstructed. Keeping only the length forces a second search afterwards.",
        "Two moduli are doing real work here. A single 32-bit-prime modulus over roughly 30000 windows has a birthday-collision probability around 0.4, so a plain single hash genuinely returns wrong answers on this problem rather than merely in theory. The alternative deterministic route is a suffix automaton or suffix array with LCP, where the answer is the maximum LCP value.",
        "Time: O(n log n) expected. Space: O(n).",
      ],
    },
    {
      name: "Distinct Echo Substrings",
      difficulty: "Hard",
      variation: "Counting distinct squares",
      link: "https://leetcode.com/problems/distinct-echo-substrings/",
      question: [
        "Return the number of distinct non-empty substrings of a string text that can be written as the concatenation of some string with itself, that is, substrings of the form a + a for a non-empty string a. Two substrings that are equal as strings count once, however many places they occur.",
        "Example 1:\nInput: text = 'abcabcabc'\nOutput: 3\nExplanation: The echo substrings are 'abcabc', 'bcabca' and 'cabcab'.",
        "Example 2:\nInput: text = 'leetcodeleetcode'\nOutput: 2\nExplanation: The echo substrings are 'ee' and the whole string 'leetcodeleetcode'.",
        "Constraints:\n- 1 <= text.length <= 2000\n- text consists of lowercase English letters",
      ],
      code: `int distinctEchoSubstrings(string text) {
    int n = text.size();
    const long long M1 = 1000000007, M2 = 998244353, B1 = 131, B2 = 137;
    vector<long long> h1(n + 1, 0), h2(n + 1, 0), p1(n + 1, 1), p2(n + 1, 1);
    for (int i = 0; i < n; i++) {
        h1[i + 1] = (h1[i] * B1 + text[i]) % M1;
        h2[i + 1] = (h2[i] * B2 + text[i]) % M2;
        p1[i + 1] = p1[i] * B1 % M1;
        p2[i + 1] = p2[i] * B2 % M2;
    }
    auto get = [&](int i, int len) {
        long long a = ((h1[i + len] - h1[i] * p1[len]) % M1 + M1) % M1;
        long long b = ((h2[i + len] - h2[i] * p2[len]) % M2 + M2) % M2;
        return a * M2 + b;
    };
    unordered_set<long long> distinct;
    for (int len = 1; 2 * len <= n; len++)
        for (int i = 0; i + 2 * len <= n; i++)
            // the two halves match -> the window of length 2*len is an echo
            if (get(i, len) == get(i + len, len)) distinct.insert(get(i, 2 * len));
    return distinct.size();
}`,
      explanation: [
        "Fix the half length len and the start i. The window is an echo exactly when its two halves of length len are equal, and each such test is one O(1) hash comparison. That is O(n^2) tests overall, which n <= 2000 comfortably allows.",
        "Deduplication is the subtle half of the problem. Equal echo strings can start at many positions, so the answer is the size of a set keyed by the hash of the entire length-2*len window, not the number of positions that pass the test. Keying the set by (len, i) or counting hits directly overcounts - in 'abcabcabc' the naive count of positions is larger than 3.",
        "Note that the set must be keyed by the full window and not by the half: two different echoes could share nothing, but keying by the half plus the length is equivalent here only because the window is the half twice. Keying by the whole window is the version that stays correct if the shape ever changes.",
        "Hashing halves also avoids the trap of comparing the halves character by character, which would make the inner test O(n) and the whole solution O(n^3) - about 8 * 10^9 operations at the limit.",
        "Time: O(n^2) expected. Space: O(n^2) worst case for the set of distinct echoes.",
      ],
    },
    {
      name: "Shortest Palindrome",
      difficulty: "Hard",
      variation: "Longest palindromic prefix, forward vs reverse hash",
      link: "https://leetcode.com/problems/shortest-palindrome/",
      question: [
        "You are given a string s. You may only add characters in front of it. Return the shortest palindrome you can obtain this way.",
        "Example 1:\nInput: s = 'aacecaaa'\nOutput: 'aaacecaaa'\nExplanation: The longest palindromic prefix is 'aacecaa', so only the final 'a' has to be mirrored to the front.",
        "Example 2:\nInput: s = 'abcd'\nOutput: 'dcbabcd'\nExplanation: The longest palindromic prefix is 'a', so 'bcd' reversed is prepended.",
        "Constraints:\n- 0 <= s.length <= 5 * 10^4\n- s consists of lowercase English letters",
      ],
      code: `string shortestPalindrome(string s) {
    int n = s.size();
    const long long M1 = 1000000007, M2 = 998244353, B1 = 131, B2 = 137;
    long long f1 = 0, g1 = 0, w1 = 1;   // f = prefix read forwards, g = same prefix read backwards
    long long f2 = 0, g2 = 0, w2 = 1;
    int best = 0;
    for (int i = 0; i < n; i++) {
        f1 = (f1 * B1 + s[i]) % M1;
        g1 = (g1 + (long long)s[i] % M1 * w1) % M1;   // new char becomes the most significant digit
        w1 = w1 * B1 % M1;
        f2 = (f2 * B2 + s[i]) % M2;
        g2 = (g2 + (long long)s[i] % M2 * w2) % M2;
        w2 = w2 * B2 % M2;
        if (f1 == g1 && f2 == g2) best = i + 1;       // prefix of length i+1 is a palindrome
    }
    string tail = s.substr(best);
    reverse(tail.begin(), tail.end());
    return tail + s;
}`,
      explanation: [
        "Adding characters only at the front means the suffix of the result is s itself, so the added block must be the reverse of everything after the longest palindromic prefix of s. Minimising the additions is therefore exactly maximising that prefix length.",
        "A prefix is a palindrome when it reads the same forwards and backwards, so keep two hashes of the same growing prefix: f appends each character as the least significant digit, g appends it as the most significant one. They agree precisely when the prefix equals its own reverse, and both update in O(1), so one pass finds the longest palindromic prefix.",
        "Keeping the last i where they agreed - rather than breaking at the first disagreement - is essential. In 'aacecaaa' the prefixes 'a' and 'aa' are palindromes, then several are not, and the answer 'aacecaa' comes later; an early break would return 'aa' and produce a longer result.",
        "The classic alternative is KMP: build the failure function of s + '#' + reverse(s) and read the last value, which is the same length computed deterministically. The hashing version is shorter but needs two moduli, because a single collision here silently yields a non-palindrome.",
        "Time: O(n). Space: O(n) for the returned string, O(1) of working state.",
      ],
    },
  ],
};
