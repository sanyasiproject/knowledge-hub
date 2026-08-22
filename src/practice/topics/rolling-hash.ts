import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Find the Index of the First Occurrence in a String",
      difficulty: "Easy",
      variation: "Sliding window hash, the template",
      link: "https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/",
      question: [
        "Given two strings haystack and needle, return the index of the first occurrence of needle in haystack, or -1 if needle is not part of haystack. Solve it by maintaining a polynomial hash of the current window instead of comparing characters at every shift.",
        "Example 1:\nInput: haystack = 'sadbutsad', needle = 'sad'\nOutput: 0\nExplanation: 'sad' occurs at index 0 and again at index 6; the first index is returned.",
        "Example 2:\nInput: haystack = 'leetcode', needle = 'leeto'\nOutput: -1\nExplanation: No window of length 5 equals 'leeto'.",
        "Constraints:\n- 1 <= haystack.length, needle.length <= 10^4\n- Both strings consist of lowercase English letters",
      ],
      code: `int strStr(string haystack, string needle) {
    int n = haystack.size(), m = needle.size();
    if (m > n) return -1;
    const long long MOD = 1000000007LL, B = 131;
    long long powB = 1;                       // B^(m-1): the weight of the leaving character
    for (int i = 0; i < m - 1; i++) powB = powB * B % MOD;

    long long target = 0, cur = 0;
    for (int i = 0; i < m; i++) {
        target = (target * B + needle[i]) % MOD;
        cur = (cur * B + haystack[i]) % MOD;
    }

    for (int i = 0; ; i++) {
        // equal hashes are only evidence - confirm with one real comparison
        if (cur == target && haystack.compare(i, m, needle) == 0) return i;
        if (i + m >= n) break;
        cur = (cur - haystack[i] * powB % MOD + MOD) % MOD;   // drop the leading character
        cur = (cur * B + haystack[i + m]) % MOD;              // append the new trailing one
    }
    return -1;
}`,
      explanation: [
        "A polynomial hash treats the window as a number in base B: H = s[0]*B^(m-1) + s[1]*B^(m-2) + ... + s[m-1], all modulo MOD. Sliding one position right is two operations - subtract the leading character times B^(m-1), then multiply by B and add the new trailing character. That is the whole trick: an O(1) update instead of an O(m) rescan.",
        "The subtraction must be done before the multiply, and the intermediate value must be pushed back into [0, MOD) with + MOD, because C++ integer remainder of a negative number is negative and would poison every later window.",
        "The tempting mistake is to return on a hash match alone. A single 32-bit-ish modulus collides, and on adversarial input a hash-only matcher reports wrong indices. Verifying a hash hit with one real string compare costs O(m) but only happens on true matches plus the rare collision, so the expected total stays O(n + m). If you cannot afford the verify, use two independent moduli or a random base.",
        "Picking B larger than the alphabet and MOD prime keeps the map injective-ish; a fixed small base such as 31 with MOD = 2^64 is the classic setup that anti-hash tests break, so randomise the base when a judge is hostile.",
        "Time: O(n + m) expected. Space: O(1).",
      ],
    },
    {
      name: "String Matching (CSES 1753)",
      difficulty: "Easy",
      variation: "Prefix-hash table, count all occurrences",
      link: "https://cses.fi/problemset/task/1753",
      question: [
        "Given a string s and a pattern p, count the number of positions where p occurs as a substring of s. Occurrences may overlap.",
        "Example 1:\nInput:\nsaippuakauppias\npp\nOutput: 2\nExplanation: 'pp' starts at index 3 and at index 10 (0-based).",
        "Example 2:\nInput:\nababab\nab\nOutput: 3\nExplanation: Occurrences start at indices 0, 2 and 4.",
        "Constraints:\n- 1 <= |s| <= 10^6\n- 1 <= |p| <= 10^6\n- Both strings contain only lowercase English letters",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s, p;
    cin >> s >> p;
    int n = s.size(), m = p.size();
    if (m > n) { cout << 0 << "\\n"; return 0; }

    const long long M1 = 1000000007LL, M2 = 998244353LL, B1 = 131, B2 = 137;
    vector<long long> h1(n + 1, 0), h2(n + 1, 0), q1(n + 1, 1), q2(n + 1, 1);
    for (int i = 0; i < n; i++) {
        h1[i + 1] = (h1[i] * B1 + s[i]) % M1;
        h2[i + 1] = (h2[i] * B2 + s[i]) % M2;
        q1[i + 1] = q1[i] * B1 % M1;
        q2[i + 1] = q2[i] * B2 % M2;
    }

    long long t1 = 0, t2 = 0;
    for (int i = 0; i < m; i++) {
        t1 = (t1 * B1 + p[i]) % M1;
        t2 = (t2 * B2 + p[i]) % M2;
    }

    int ans = 0;
    for (int l = 0; l + m <= n; l++) {
        // hash of s[l .. l+m-1] from the prefix table, in O(1)
        long long a = ((h1[l + m] - h1[l] * q1[m]) % M1 + M1) % M1;
        long long b = ((h2[l + m] - h2[l] * q2[m]) % M2 + M2) % M2;
        if (a == t1 && b == t2) ans++;
    }
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "This is the reusable form of the pattern. Precompute h[i] = hash of the prefix s[0..i-1] with h[i+1] = h[i]*B + s[i], and the powers q[k] = B^k. Then the hash of any substring s[l..r-1] is h[r] - h[l]*q[r-l]: the prefix hash of the longer prefix, with the earlier part shifted up to the same place value and cancelled. One O(n) preprocessing pass buys O(1) equality between any two substrings, which is exactly why this beats a bespoke sliding window - it answers arbitrary queries, not just consecutive windows.",
        "With |s| up to 10^6 and no verification step, a single modulus around 10^9 is not safe: there are about 10^6 windows, and by the birthday bound the chance that some pair collides is roughly 10^12 / 10^9, i.e. certain. Two independent moduli make the effective space about 10^18 and the failure probability negligible.",
        "h[l] * q[m] is a product of two values below 10^9, about 10^18, which fits in a signed 64-bit integer but leaves no room to spare - do not add a third factor before reducing. And reduce the difference back into range with + M before use.",
        "The wrong-but-tempting alternative here is to hash every substring into a set and look the pattern up; that is O(n) memory for no benefit when a single target hash is all you compare against.",
        "Time: O(n + m). Space: O(n).",
      ],
    },
    {
      name: "Repeated DNA Sequences",
      difficulty: "Medium",
      variation: "Fixed-width window, exact bit-packed hash",
      link: "https://leetcode.com/problems/repeated-dna-sequences/",
      question: [
        "The DNA sequence is composed of the letters A, C, G and T. Given a string s that represents a DNA sequence, return all the 10-letter-long substrings that occur more than once in s. You may return the answer in any order.",
        "Example 1:\nInput: s = 'AAAAACCCCCAAAAACCCCCCAAAAAGGGTTT'\nOutput: ['AAAAACCCCC', 'CCCCCAAAAA']\nExplanation: Both of those 10-letter windows appear at two different starting positions; every other window is unique.",
        "Example 2:\nInput: s = 'AAAAAAAAAAAAA'\nOutput: ['AAAAAAAAAA']\nExplanation: The only 10-letter window is all A's and it starts at indices 0 through 3.",
        "Constraints:\n- 1 <= s.length <= 10^5\n- s[i] is one of 'A', 'C', 'G', 'T'",
      ],
      code: `vector<string> findRepeatedDnaSequences(string s) {
    int n = s.size();
    vector<string> res;
    if (n < 10) return res;

    int code[26] = {};
    code['C' - 'A'] = 1; code['G' - 'A'] = 2; code['T' - 'A'] = 3;

    const int MASK = (1 << 20) - 1;    // keep only the low 10 letters (2 bits each)
    int cur = 0;
    unordered_map<int, int> seen;
    seen.reserve(2 * n);
    for (int i = 0; i < n; i++) {
        cur = ((cur << 2) | code[s[i] - 'A']) & MASK;   // shift in, mask the old letter out
        if (i >= 9 && ++seen[cur] == 2) res.push_back(s.substr(i - 9, 10));
    }
    return res;
}`,
      explanation: [
        "With an alphabet of size 4 and a window of exactly 10, the polynomial hash in base 4 needs only 20 bits, so it fits in an int with no modulus at all. That makes the hash a perfect bijection: two windows have the same code if and only if they are the same string. No collision handling, no verification.",
        "Shifting left by two and masking to 20 bits performs the drop-the-leading-letter and append-the-new-letter steps in one instruction, because masking off the high bits is exactly subtracting the leading letter times 4^9.",
        "The counter must fire on the transition to 2, not on 'already present'. Using ++seen[cur] == 2 emits each repeated window exactly once; testing seen.count(cur) before inserting would push 'AAAAAAAAAA' three times in Example 2.",
        "The general lesson: before reaching for a modular polynomial hash, check whether the window fits in a machine word after bit packing. When it does, the exact encoding is faster and removes an entire class of bug.",
        "Time: O(n) for the scan, plus O(1) per output substring of fixed length 10. Space: O(n) for the map.",
      ],
    },
    {
      name: "Finding Borders (CSES 1732)",
      difficulty: "Medium",
      variation: "Prefix equals suffix, all border lengths",
      link: "https://cses.fi/problemset/task/1732",
      question: [
        "A border of a string is a proper prefix of it that is also a suffix of it. Given a string, print the lengths of all of its borders in increasing order, separated by spaces.",
        "Example 1:\nInput:\nabcababcab\nOutput: 2 5\nExplanation: The prefix 'ab' equals the last two characters, and the prefix 'abcab' equals the last five characters. No other proper prefix is also a suffix.",
        "Example 2:\nInput:\naaaa\nOutput: 1 2 3\nExplanation: Every proper prefix of a constant string is also a suffix.",
        "Constraints:\n- 1 <= |s| <= 10^6\n- s contains only lowercase English letters",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    int n = s.size();

    const long long M1 = 1000000007LL, M2 = 998244353LL, B1 = 131, B2 = 137;
    vector<long long> h1(n + 1, 0), h2(n + 1, 0), q1(n + 1, 1), q2(n + 1, 1);
    for (int i = 0; i < n; i++) {
        h1[i + 1] = (h1[i] * B1 + s[i]) % M1;
        h2[i + 1] = (h2[i] * B2 + s[i]) % M2;
        q1[i + 1] = q1[i] * B1 % M1;
        q2[i + 1] = q2[i] * B2 % M2;
    }
    auto get1 = [&](int l, int r) {   // hash of s[l .. r-1]
        return ((h1[r] - h1[l] * q1[r - l]) % M1 + M1) % M1;
    };
    auto get2 = [&](int l, int r) {
        return ((h2[r] - h2[l] * q2[r - l]) % M2 + M2) % M2;
    };

    string out;
    for (int k = 1; k < n; k++) {
        // prefix of length k versus suffix of length k
        if (get1(0, k) == get1(n - k, n) && get2(0, k) == get2(n - k, n)) {
            if (!out.empty()) out += ' ';
            out += to_string(k);
        }
    }
    cout << out << "\\n";
    return 0;
}`,
      explanation: [
        "Once prefix hashes exist, the whole problem is n-1 constant-time equality tests: k is a border length exactly when the substring [0, k) equals the substring [n-k, n). There is no clever structure to find - the hash table turns a quadratic definition into a linear scan.",
        "This is the hashing counterpart of the KMP failure function. The prefix function gives the single longest border and the rest by following failure links, in deterministic O(n); hashing gives all of them directly but only with high probability. Prefer KMP when correctness must be certain, hashing when you also need arbitrary substring comparisons elsewhere in the same problem.",
        "The trap is the word proper: k must run to n-1, not n. The whole string trivially equals itself, and including it changes the answer on every test.",
        "Two moduli are not optional at |s| = 10^6. With one 10^9-ish modulus the expected number of false borders over the full input set is above one, and a single false positive prints an extra number.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Finding Periods (CSES 1733)",
      difficulty: "Medium",
      variation: "Periods via prefix-suffix overlap",
      link: "https://cses.fi/problemset/task/1733",
      question: [
        "A period of a string is a prefix such that the string can be built by repeating that prefix, where the final repetition may be cut short. Equivalently, p is a period length when s[i] equals s[i+p] for every valid i. Given a string, print the lengths of all of its periods in increasing order.",
        "Example 1:\nInput:\nabcabca\nOutput: 3 6 7\nExplanation: With p = 3 the string is 'abc' repeated twice plus the partial 'a'. With p = 6 it is 'abcabc' plus the partial 'a'. p = 7 is the whole string, which is always a period.",
        "Example 2:\nInput:\naaaa\nOutput: 1 2 3 4\nExplanation: Every prefix length works for a constant string.",
        "Constraints:\n- 1 <= |s| <= 10^6\n- s contains only lowercase English letters",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    int n = s.size();

    const long long M1 = 1000000007LL, M2 = 998244353LL, B1 = 131, B2 = 137;
    vector<long long> h1(n + 1, 0), h2(n + 1, 0), q1(n + 1, 1), q2(n + 1, 1);
    for (int i = 0; i < n; i++) {
        h1[i + 1] = (h1[i] * B1 + s[i]) % M1;
        h2[i + 1] = (h2[i] * B2 + s[i]) % M2;
        q1[i + 1] = q1[i] * B1 % M1;
        q2[i + 1] = q2[i] * B2 % M2;
    }
    auto get1 = [&](int l, int r) {
        return ((h1[r] - h1[l] * q1[r - l]) % M1 + M1) % M1;
    };
    auto get2 = [&](int l, int r) {
        return ((h2[r] - h2[l] * q2[r - l]) % M2 + M2) % M2;
    };

    string out;
    for (int p = 1; p <= n; p++) {
        int len = n - p;   // p is a period iff the first len chars equal the last len chars
        if (get1(0, len) == get1(p, n) && get2(0, len) == get2(p, n)) {
            if (!out.empty()) out += ' ';
            out += to_string(p);
        }
    }
    cout << out << "\\n";
    return 0;
}`,
      explanation: [
        "The key identity is the periodicity lemma in its cheapest form: s has period p exactly when s shifted left by p agrees with s on the overlap, that is s[0 .. n-p-1] equals s[p .. n-1]. Both sides are substrings, so one hash comparison decides it.",
        "That reformulation is also why periods and borders are the same information read two ways: p is a period length if and only if n - p is a border length. You could solve this problem by running the previous one and subtracting, and the check in the code is literally that substitution.",
        "The natural but wrong approach is to test only divisors of n, or to test the definition character by character. Divisors miss every partial-final-block period such as p = 3 in 'abcabca', and the character loop is O(n^2) at n = 10^6.",
        "p = n always qualifies, since the overlap has length 0 and two empty substrings hash to 0 - the loop bound must be inclusive so it is printed.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Find Substring With Given Hash Value",
      difficulty: "Medium",
      variation: "Rolling right to left to avoid a modular inverse",
      link: "https://leetcode.com/problems/find-substring-with-given-hash-value/",
      question: [
        "The hash of a string of length k is defined as hash(s, p, m) = (val(s[0])*p^0 + val(s[1])*p^1 + ... + val(s[k-1])*p^(k-1)) mod m, where val(c) is the 1-based position of c in the alphabet, so val('a') = 1 and val('z') = 26. Given a string s and the integers power, modulo, k and hashValue, return the first substring of s of length k whose hash equals hashValue. The answer is guaranteed to exist.",
        "Example 1:\nInput: s = 'leetcode', power = 7, modulo = 20, k = 2, hashValue = 0\nOutput: 'ee'\nExplanation: hash('ee') = 5 + 5*7 = 40, and 40 mod 20 = 0. The earlier window 'le' hashes to 12 + 5*7 = 47, which is 7 mod 20.",
        "Example 2:\nInput: s = 'fbxzaad', power = 31, modulo = 100, k = 3, hashValue = 32\nOutput: 'fbx'\nExplanation: hash('fbx') = 6 + 2*31 + 24*961 = 23132, and 23132 mod 100 = 32.",
        "Constraints:\n- 1 <= k <= s.length <= 2 * 10^4\n- 1 <= power, modulo <= 10^9\n- 0 <= hashValue < modulo\n- s consists of lowercase English letters",
      ],
      code: `string subStrHash(string s, long long power, long long modulo, int k, long long hashValue) {
    int n = s.size();
    long long pk = 1;                              // power^k mod modulo
    for (int i = 0; i < k; i++) pk = pk * power % modulo;

    long long h = 0;
    for (int i = n - 1; i >= n - k; i--)           // build the rightmost window
        h = (h * power + (s[i] - 'a' + 1)) % modulo;
    int ans = (h == hashValue) ? n - k : -1;

    for (int i = n - k - 1; i >= 0; i--) {
        h = (h * power + (s[i] - 'a' + 1)) % modulo;             // shift weights up, prepend s[i]
        long long out = (long long)(s[i + k] - 'a' + 1) % modulo * pk % modulo;
        h = (h - out + modulo) % modulo;                         // remove the character that left
        if (h == hashValue) ans = i;                             // keep overwriting: want the first
    }
    return s.substr(ans, k);
}`,
      explanation: [
        "The weights here run the other way from the usual template: the leftmost character carries p^0 and the rightmost carries p^(k-1). Sliding right therefore requires dividing by p, which modulo a non-prime m may be impossible - modulo can be any value up to 10^9 and need not be coprime with power.",
        "The fix is to scan right to left instead. Going from the window at i+1 to the window at i, every existing character moves up one power and one new character enters at weight p^0, while the character at i+k leaves from weight p^(k-1) and becomes p^k after the multiply. So h(i) = h(i+1)*power + val(s[i]) - val(s[i+k])*p^k, all multiplications, no inverse. Because the sweep goes backwards, simply overwriting ans each time a match is found leaves the smallest index.",
        "The wrong-but-tempting approach is to compute a modular inverse of power with Fermat or extended Euclid. Fermat needs a prime modulus; extended Euclid needs gcd(power, modulo) = 1. Neither is guaranteed, and the test data specifically includes cases where power shares a factor with modulo.",
        "Watch the arithmetic width: h is below 10^9 and power is up to 10^9, so h*power reaches 10^18 and must live in a long long, and the subtraction must be brought back into range with + modulo.",
        "Time: O(n + k). Space: O(1) beyond the returned substring.",
      ],
    },
    {
      name: "Maximum Length of Repeated Subarray",
      difficulty: "Medium",
      variation: "Binary search on length, hashing integer arrays",
      link: "https://leetcode.com/problems/maximum-length-of-repeated-subarray/",
      question: [
        "Given two integer arrays nums1 and nums2, return the maximum length of a subarray that appears in both arrays. A subarray is a contiguous block.",
        "Example 1:\nInput: nums1 = [1,2,3,2,1], nums2 = [3,2,1,4,7]\nOutput: 3\nExplanation: The repeated subarray with maximum length is [3,2,1].",
        "Example 2:\nInput: nums1 = [0,0,0,0,0], nums2 = [0,0,0,0,0]\nOutput: 5\nExplanation: The whole array is common.",
        "Constraints:\n- 1 <= nums1.length, nums2.length <= 1000\n- 0 <= nums1[i], nums2[i] <= 100",
      ],
      code: `class Solution {
    static constexpr long long M1 = 1000000007LL, M2 = 998244353LL;
    static constexpr long long B1 = 1000003, B2 = 131;

    // all window hashes of length L, each packed as h1 * M2 + h2
    static void windows(const vector<int>& a, int L, vector<long long>& out) {
        out.clear();
        int n = a.size();
        if (L <= 0 || L > n) return;
        long long p1 = 1, p2 = 1;
        for (int i = 0; i < L - 1; i++) { p1 = p1 * B1 % M1; p2 = p2 * B2 % M2; }
        long long h1 = 0, h2 = 0;
        for (int i = 0; i < L; i++) {
            h1 = (h1 * B1 + a[i] + 1) % M1;      // +1 so a leading zero still counts
            h2 = (h2 * B2 + a[i] + 1) % M2;
        }
        out.push_back(h1 * M2 + h2);
        for (int i = L; i < n; i++) {
            h1 = ((h1 - (a[i - L] + 1) * p1 % M1 + M1) % M1 * B1 + a[i] + 1) % M1;
            h2 = ((h2 - (a[i - L] + 1) * p2 % M2 + M2) % M2 * B2 + a[i] + 1) % M2;
            out.push_back(h1 * M2 + h2);
        }
    }

public:
    int findLength(vector<int>& nums1, vector<int>& nums2) {
        int lo = 0, hi = (int)min(nums1.size(), nums2.size());
        vector<long long> wa, wb;
        while (lo < hi) {
            int mid = (lo + hi + 1) / 2;         // bias up: probe the longer candidate
            windows(nums1, mid, wa);
            windows(nums2, mid, wb);
            unordered_set<long long> seen(wa.begin(), wa.end());
            bool found = false;
            for (long long h : wb) if (seen.count(h)) { found = true; break; }
            if (found) lo = mid; else hi = mid - 1;
        }
        return lo;
    }
};`,
      explanation: [
        "The predicate 'a common subarray of length L exists' is monotone: if one of length L exists then its own prefix of length L-1 also exists in both arrays. Monotone predicate plus an O(n) test per length equals binary search on the answer, which is the standard way hashing beats the O(n*m) DP when the arrays are long.",
        "Nothing here is string-specific. A polynomial hash works over any sequence of small integers; you only need a base larger than the value range so that no carry-style ambiguity arises. That is why the values are stored as a[i] + 1 - mapping the legal value 0 to the digit 0 would make [0], [0,0] and [0,0,0] all hash to the same thing and inflate the answer on Example 2.",
        "Two moduli packed into one 64-bit key give roughly a 10^18 hash space. There are under 10^6 window pairs to distinguish, so a false positive is very unlikely - but note that this solution never verifies, so a collision silently reports a length that does not exist. If certainty matters, keep the start indices alongside the hashes and compare the two candidate windows element by element.",
        "At n, m <= 1000 the plain DP dp[i][j] = dp[i-1][j-1] + 1 is O(n*m) = 10^6 and simpler; hashing is the answer that keeps working when the arrays reach 10^5.",
        "Time: O((n + m) log min(n, m)). Space: O(n + m).",
      ],
    },
    {
      name: "Longest Duplicate Substring",
      difficulty: "Hard",
      variation: "Binary search on answer plus a hash set",
      link: "https://leetcode.com/problems/longest-duplicate-substring/",
      question: [
        "Given a string s, consider all duplicated substrings, meaning contiguous substrings that occur two or more times in s. The occurrences may overlap. Return any duplicated substring of the longest possible length. If s has no duplicated substring, return the empty string.",
        "Example 1:\nInput: s = 'banana'\nOutput: 'ana'\nExplanation: 'ana' occurs at index 1 and at index 3, and no length-4 substring repeats.",
        "Example 2:\nInput: s = 'abcd'\nOutput: ''\nExplanation: Every character is distinct, so not even a length-1 substring repeats.",
        "Constraints:\n- 2 <= s.length <= 3 * 10^4\n- s consists of lowercase English letters",
      ],
      code: `class Solution {
public:
    string longestDupSubstring(string s) {
        int n = s.size();
        const long long M1 = 1000000007LL, M2 = 998244353LL, B1 = 131, B2 = 137;
        vector<long long> h1(n + 1, 0), h2(n + 1, 0), q1(n + 1, 1), q2(n + 1, 1);
        for (int i = 0; i < n; i++) {
            h1[i + 1] = (h1[i] * B1 + s[i]) % M1;
            h2[i + 1] = (h2[i] * B2 + s[i]) % M2;
            q1[i + 1] = q1[i] * B1 % M1;
            q2[i + 1] = q2[i] * B2 % M2;
        }

        // start index of some repeated substring of length L, or -1
        auto check = [&](int L) -> int {
            if (L <= 0) return -1;
            unordered_map<long long, int> seen;
            seen.reserve(2 * n);
            for (int i = 0; i + L <= n; i++) {
                long long a = ((h1[i + L] - h1[i] * q1[L]) % M1 + M1) % M1;
                long long b = ((h2[i + L] - h2[i] * q2[L]) % M2 + M2) % M2;
                long long key = a * M2 + b;
                auto it = seen.find(key);
                if (it != seen.end()) return it->second;
                seen[key] = i;
            }
            return -1;
        };

        int lo = 1, hi = n - 1, start = -1, len = 0;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            int pos = check(mid);
            if (pos >= 0) { start = pos; len = mid; lo = mid + 1; }   // longer might also work
            else hi = mid - 1;
        }
        return len > 0 ? s.substr(start, len) : string();
    }
};`,
      explanation: [
        "Same monotonicity as the previous problem, stated on one string: if some substring of length L appears twice, so does its length-(L-1) prefix. So the set of feasible lengths is a prefix of 1..n-1 and binary search finds its boundary in log n probes.",
        "Each probe is one linear sweep that drops every length-L window hash into a table and stops at the first repeat. Prefix hashes make each window hash O(1), so a probe is O(n) and the whole search O(n log n) - this is the classic Karp-Rabin-plus-binary-search solution, and the practical alternative to building a suffix automaton or a suffix array with LCP.",
        "This is where a single modulus genuinely fails. LeetCode's test set for this problem contains anti-hash strings built against base 26 or 31 with modulus 2^64 or 10^9+7; a lone modulus returns a substring that occurs only once. Two independent moduli packed into one key, or a randomised base chosen at run time, fixes it.",
        "hi starts at n-1, not n, because the full string cannot occur twice. Returning the empty string when len stays 0 is the 'abcd' case.",
        "Time: O(n log n) expected. Space: O(n).",
      ],
    },
    {
      name: "Longest Chunked Palindrome Decomposition",
      difficulty: "Hard",
      variation: "Greedy two-pointer with O(1) chunk equality",
      link: "https://leetcode.com/problems/longest-chunked-palindrome-decomposition/",
      question: [
        "You are given a string text. Split it into k non-empty substrings text = a1 + a2 + ... + ak such that ai equals a(k+1-i) for every i from 1 to k. Return the largest possible value of k.",
        "Example 1:\nInput: text = 'ghiabcdefhelloadamhelloabcdefghi'\nOutput: 7\nExplanation: The split is 'ghi' + 'abcdef' + 'hello' + 'adam' + 'hello' + 'abcdef' + 'ghi'.",
        "Example 2:\nInput: text = 'antaprezatepzapreanta'\nOutput: 11\nExplanation: The split is 'a' + 'nt' + 'a' + 'pre' + 'za' + 'tep' + 'za' + 'pre' + 'a' + 'nt' + 'a', which is 11 chunks and mirrors around the middle 'tep'.",
        "Example 3:\nInput: text = 'merchant'\nOutput: 1\nExplanation: No proper split works, so the only decomposition is the whole string.",
        "Constraints:\n- 1 <= text.length <= 1000\n- text consists of lowercase English letters",
      ],
      code: `int longestDecomposition(string text) {
    int n = text.size();
    const long long MOD = 1000000007LL, B = 131;
    int res = 0, i = 0, j = n - 1;
    long long lh = 0, rh = 0, p = 1;
    bool pending = false;
    while (i < j) {
        lh = (lh * B + text[i]) % MOD;     // grow the left chunk on its right end
        rh = (rh + text[j] * p) % MOD;     // grow the right chunk on its left end
        p = p * B % MOD;
        pending = true;
        if (lh == rh) {                    // shortest matching pair - cut here
            res += 2;
            lh = rh = 0;
            p = 1;
            pending = false;
        }
        i++; j--;
    }
    // an odd middle character, or an unmatched leftover, is one final chunk
    if (pending || i == j) res += 1;
    return res;
}`,
      explanation: [
        "The two hashes are grown in opposite directions so that both represent the same reading order: lh accumulates text[i] at the low place value each step, and rh inserts text[j] at the new highest place value p. They are equal precisely when the growing prefix chunk and the mirrored suffix chunk are the same string, which is the condition ai = a(k+1-i).",
        "Greedy is optimal here, and that is the part worth proving to yourself: if the shortest matching prefix-suffix pair has length L, any valid decomposition's outermost chunk has length L' >= L, and cutting at L leaves a strictly larger remaining string that still admits at least the decomposition induced by the L' split. So taking the shortest match never loses chunks. Cutting at the longest match instead is the classic wrong greedy.",
        "The pending flag matters. Testing lh != 0 instead would be a subtle bug: a leftover chunk whose hash happens to be 0 modulo MOD would be dropped and the count would come out one too small.",
        "Two termination cases: i == j means one middle character survived, and pending means characters were consumed without a match. Either way the unmatched middle forms exactly one more chunk, and both together still add only one.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Shortest Palindrome",
      difficulty: "Hard",
      variation: "Forward hash against reverse hash",
      link: "https://leetcode.com/problems/shortest-palindrome/",
      question: [
        "You are given a string s. You can convert s to a palindrome by adding characters in front of it. Return the shortest palindrome you can find by performing this transformation.",
        "Example 1:\nInput: s = 'aacecaaa'\nOutput: 'aaacecaaa'\nExplanation: The longest palindromic prefix is 'aacecaa'. Only the final 'a' is left over, so one 'a' is prepended.",
        "Example 2:\nInput: s = 'abcd'\nOutput: 'dcbabcd'\nExplanation: The longest palindromic prefix is 'a', so 'bcd' reversed is prepended.",
        "Constraints:\n- 0 <= s.length <= 5 * 10^4\n- s consists of lowercase English letters only",
      ],
      code: `string shortestPalindrome(string s) {
    int n = s.size();
    if (n <= 1) return s;
    const long long MOD = 1000000007LL, B = 131;
    long long fwd = 0, rev = 0, p = 1;
    int best = 1;                         // length of the longest palindromic prefix
    for (int i = 0; i < n; i++) {
        fwd = (fwd * B + s[i]) % MOD;     // hash of s[0..i] read left to right
        rev = (rev + s[i] * p) % MOD;     // hash of s[0..i] read right to left
        p = p * B % MOD;
        if (fwd == rev) best = i + 1;     // this prefix reads the same both ways
    }
    string tail = s.substr(best);
    reverse(tail.begin(), tail.end());
    return tail + s;                       // mirror only what sticks out
}`,
      explanation: [
        "Since characters may only be prepended, the original s must sit at the end of the result. The added block therefore has to be the reverse of whatever suffix of s is not already covered by a palindromic prefix, so the answer length is n + (n - L) where L is the longest palindromic prefix. Maximising L minimises the result, and the problem reduces to finding L.",
        "The test 'is s[0..i] a palindrome' is a single comparison if you carry two hashes at once: one that appends each new character at the low place value (left-to-right reading) and one that appends it at the new high place value (right-to-left reading). A string is a palindrome exactly when those two readings are the same string, so the two hashes coincide.",
        "Tempting and wrong: the direct O(n^2) check of every prefix, which times out at 5*10^4, and the greedy 'strip matching characters from both ends' idea, which is not the same thing as a palindromic prefix. The deterministic alternative is KMP - build the failure function of s + '#' + reverse(s) and read the last value, which is the same L without any collision risk. The separator is essential there so the border cannot straddle the two halves.",
        "best starts at 1 because a single character is always a palindrome, and the loop only ever raises it.",
        "Time: O(n). Space: O(n) for the result.",
      ],
    },
    {
      name: "Distinct Echo Substrings",
      difficulty: "Hard",
      variation: "Counting distinct squares with O(1) equality",
      link: "https://leetcode.com/problems/distinct-echo-substrings/",
      question: [
        "Return the number of distinct non-empty substrings of a given string text that can be written as the concatenation of some string with itself, that is substrings of the form a + a.",
        "Example 1:\nInput: text = 'abcabcabc'\nOutput: 3\nExplanation: The three squares are 'abcabc', 'bcabca' and 'cabcab'.",
        "Example 2:\nInput: text = 'leetcodeleetcode'\nOutput: 2\nExplanation: The two squares are 'ee' and 'leetcodeleetcode'.",
        "Constraints:\n- 1 <= text.length <= 2000\n- text has only lowercase English letters",
      ],
      code: `class Solution {
public:
    int distinctEchoSubstrings(string text) {
        int n = text.size();
        const long long M1 = 1000000007LL, M2 = 998244353LL, B1 = 131, B2 = 137;
        vector<long long> h1(n + 1, 0), h2(n + 1, 0), q1(n + 1, 1), q2(n + 1, 1);
        for (int i = 0; i < n; i++) {
            h1[i + 1] = (h1[i] * B1 + text[i]) % M1;
            h2[i + 1] = (h2[i] * B2 + text[i]) % M2;
            q1[i + 1] = q1[i] * B1 % M1;
            q2[i + 1] = q2[i] * B2 % M2;
        }
        auto get1 = [&](int l, int r) {   // hash of text[l .. r-1]
            return ((h1[r] - h1[l] * q1[r - l]) % M1 + M1) % M1;
        };
        auto get2 = [&](int l, int r) {
            return ((h2[r] - h2[l] * q2[r - l]) % M2 + M2) % M2;
        };

        unordered_set<long long> seen;
        for (int L = 1; 2 * L <= n; L++) {              // L is the half length
            for (int i = 0; i + 2 * L <= n; i++) {
                if (get1(i, i + L) == get1(i + L, i + 2 * L) &&
                    get2(i, i + L) == get2(i + L, i + 2 * L)) {
                    // dedupe by the hash of the whole square, not by its position
                    seen.insert(get1(i, i + 2 * L) * M2 + get2(i, i + 2 * L));
                }
            }
        }
        return (int)seen.size();
    }
};`,
      explanation: [
        "Enumerate every candidate square by its half length L and its start i - that is O(n^2) pairs at n = 2000, about 2*10^6, which is fine. For each pair the question 'do the two halves match' is a substring equality, so prefix hashes answer it in O(1) and the whole scan is O(n^2) instead of O(n^3).",
        "The word distinct is the second half of the problem. Two different positions can hold the same square, so counting matched pairs overcounts: in 'aaaa' the pairs (0,1), (1,1), (2,1) all give 'aa'. Keying a set on the hash of the full 2L-length substring collapses them, and different lengths cannot collide meaningfully since the hash already encodes the content.",
        "Because the hash of the whole square is the deduplication key and nothing is ever verified, one modulus is not enough - both the halves test and the identity test would be at risk. Packing two independent moduli into a single 64-bit key handles both at once.",
        "Note the same reduction is available with Z-functions or a suffix automaton in O(n log n), but the hashing version is the one you can write from scratch under time pressure, and the O(n^2) bound is comfortable at these constraints.",
        "Time: O(n^2) expected. Space: O(n) for the tables plus O(number of distinct squares) for the set.",
      ],
    },
  ],
};
