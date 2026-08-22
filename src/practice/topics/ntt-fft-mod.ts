import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Convolution (AtCoder Library Practice Contest F)",
      difficulty: "Easy",
      variation: "NTT template, single friendly modulus",
      link: "https://atcoder.jp/contests/practice2/tasks/practice2_f",
      question: [
        "You are given a sequence a of length N and a sequence b of length M, all entries taken modulo 998244353. Compute the convolution c of length N + M - 1, where c[i] is the sum of a[j] * b[i-j] over all valid j, and print every c[i] modulo 998244353.",
        "Because 998244353 is prime and 998244352 = 2^23 * 7 * 17, the field contains a primitive 2^23-th root of unity, so the whole transform can be run in modular integers with no floating point at all. This is the number theoretic transform (NTT).",
        "Example 1:\nInput:\n3 3\n1 2 3\n4 5 6\nOutput: 4 13 28 27 18\nExplanation: (1 + 2x + 3x^2)(4 + 5x + 6x^2) = 4 + 13x + 28x^2 + 27x^3 + 18x^4. For instance the x^2 coefficient is 1*6 + 2*5 + 3*4 = 28.",
        "Example 2:\nInput:\n1 2\n5\n2 3\nOutput: 10 15\nExplanation: 5 * (2 + 3x) = 10 + 15x.",
        "Constraints:\n- 1 <= N, M <= 5 * 10^5\n- 0 <= a[i], b[i] < 998244353",
      ],
      code: `const long long MOD = 998244353;   // 998244352 = 2^23 * 7 * 17, primitive root 3

long long pw(long long b, long long e, long long m) {
    long long r = 1;
    b %= m;
    while (e) {
        if (e & 1) r = r * b % m;
        b = b * b % m;
        e >>= 1;
    }
    return r;
}

void ntt(vector<long long>& a, bool invert) {
    int n = a.size();
    for (int i = 1, j = 0; i < n; i++) {          // bit-reversal permutation
        int bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) swap(a[i], a[j]);
    }
    for (int len = 2; len <= n; len <<= 1) {
        long long w = pw(3, (MOD - 1) / len, MOD);        // primitive len-th root of unity
        if (invert) w = pw(w, MOD - 2, MOD);              // its inverse for the backward pass
        for (int i = 0; i < n; i += len) {
            long long wn = 1;
            for (int j = 0; j < len / 2; j++) {
                long long u = a[i + j], v = a[i + j + len / 2] * wn % MOD;
                a[i + j] = (u + v) % MOD;
                a[i + j + len / 2] = (u - v + MOD) % MOD;
                wn = wn * w % MOD;
            }
        }
    }
    if (invert) {
        long long ninv = pw(n, MOD - 2, MOD);            // divide by n, modularly
        for (long long& x : a) x = x * ninv % MOD;
    }
}

vector<long long> conv(vector<long long> a, vector<long long> b) {
    int need = (int)a.size() + (int)b.size() - 1, n = 1;
    while (n < need) n <<= 1;                            // pad past the result degree
    a.resize(n);
    b.resize(n);
    ntt(a, false);
    ntt(b, false);
    for (int i = 0; i < n; i++) a[i] = a[i] * b[i] % MOD;
    ntt(a, true);
    a.resize(need);
    return a;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<long long> a(n), b(m);
    for (auto& v : a) cin >> v;
    for (auto& v : b) cin >> v;
    vector<long long> c = conv(a, b);
    for (size_t i = 0; i < c.size(); i++) cout << c[i] << " \\n"[i + 1 == c.size()];
    return 0;
}`,
      explanation: [
        "A convolution is a polynomial product. Evaluating both polynomials at n points, multiplying pointwise, and interpolating back costs O(n log n) instead of O(n^2) - provided the evaluation points form a group under multiplication so that the divide and conquer of the FFT works. Complex roots of unity are the usual choice; here the points are powers of a primitive n-th root of unity inside the field Z modulo 998244353.",
        "Such a root exists only when n divides MOD - 1. That is why 998244353 is the standard NTT prime: 998244352 = 2^23 * 7 * 17, so every power of two up to 2^23 is a legal transform size. The element 3 is a primitive root of the whole multiplicative group, so pw(3, (MOD-1)/len) is a primitive len-th root.",
        "Padding to a power of two that is strictly larger than the result degree matters. The transform computes a cyclic convolution of length n, so if n were only as large as the true degree the tail would wrap around and be added back onto the low coefficients.",
        "The trap is reaching for double-based FFT here. With coefficients near 10^9 and length 5 * 10^5 the exact products reach 5 * 10^23, far past the 53-bit mantissa, so rounding destroys the answer. NTT has no rounding at all - every intermediate value is an exact residue.",
        "Time: O((N + M) log(N + M)). Space: O(N + M).",
      ],
    },
    {
      name: "Multiply Strings",
      difficulty: "Medium",
      variation: "Big integer product as a convolution plus carrying",
      link: "https://leetcode.com/problems/multiply-strings/",
      question: [
        "Given two non-negative integers num1 and num2 represented as decimal strings, return their product, also as a string. You must not convert the inputs to a built-in big-integer type.",
        "Example 1:\nInput: num1 = \"123\", num2 = \"456\"\nOutput: \"56088\"\nExplanation: 123 * 456 = 56088.",
        "Example 2:\nInput: num1 = \"999\", num2 = \"999\"\nOutput: \"998001\"\nExplanation: 999 * 999 = 998001.",
        "Constraints:\n- 1 <= num1.length, num2.length <= 200\n- both strings contain only digits and have no leading zero, except the string \"0\" itself",
      ],
      code: `const long long MOD = 998244353;

long long pw(long long b, long long e, long long m) {
    long long r = 1;
    b %= m;
    while (e) {
        if (e & 1) r = r * b % m;
        b = b * b % m;
        e >>= 1;
    }
    return r;
}

void ntt(vector<long long>& a, bool invert) {
    int n = a.size();
    for (int i = 1, j = 0; i < n; i++) {
        int bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) swap(a[i], a[j]);
    }
    for (int len = 2; len <= n; len <<= 1) {
        long long w = pw(3, (MOD - 1) / len, MOD);
        if (invert) w = pw(w, MOD - 2, MOD);
        for (int i = 0; i < n; i += len) {
            long long wn = 1;
            for (int j = 0; j < len / 2; j++) {
                long long u = a[i + j], v = a[i + j + len / 2] * wn % MOD;
                a[i + j] = (u + v) % MOD;
                a[i + j + len / 2] = (u - v + MOD) % MOD;
                wn = wn * w % MOD;
            }
        }
    }
    if (invert) {
        long long ninv = pw(n, MOD - 2, MOD);
        for (long long& x : a) x = x * ninv % MOD;
    }
}

vector<long long> conv(vector<long long> a, vector<long long> b) {
    int need = (int)a.size() + (int)b.size() - 1, n = 1;
    while (n < need) n <<= 1;
    a.resize(n);
    b.resize(n);
    ntt(a, false);
    ntt(b, false);
    for (int i = 0; i < n; i++) a[i] = a[i] * b[i] % MOD;
    ntt(a, true);
    a.resize(need);
    return a;
}

string multiply(string num1, string num2) {
    if (num1 == "0" || num2 == "0") return "0";
    int n = num1.size(), m = num2.size();
    vector<long long> a(n), b(m);
    for (int i = 0; i < n; i++) a[i] = num1[n - 1 - i] - '0';   // index = power of 10
    for (int i = 0; i < m; i++) b[i] = num2[m - 1 - i] - '0';
    vector<long long> c = conv(a, b);   // every c[i] <= 200 * 81, so no wraparound
    string res;
    long long carry = 0;
    for (size_t i = 0; i < c.size(); i++) {
        long long cur = c[i] + carry;
        res += char('0' + cur % 10);
        carry = cur / 10;
    }
    while (carry) {
        res += char('0' + carry % 10);
        carry /= 10;
    }
    reverse(res.begin(), res.end());
    return res;
}`,
      explanation: [
        "Write each number as a polynomial in 10: the digit string d[k-1]...d[0] is sum d[i] * 10^i. The product of the two numbers is the product of the two polynomials evaluated at 10, so the digit-wise convolution gives the coefficients and a single left-to-right carry pass normalises them back to base 10.",
        "Choosing the array index to be the power of 10 means reversing the strings first. Doing it the other way round silently multiplies the reversed numbers.",
        "The reason a single NTT modulus is exact here: each convolution coefficient is at most min(n, m) * 9 * 9 <= 200 * 81 = 16200, far below 998244353, so the residue equals the true integer. That reasoning is the whole discipline of this topic - always bound the largest coefficient of the true convolution and check it against the modulus before trusting the residue.",
        "For 200-digit inputs a plain O(n * m) schoolbook loop is of course faster in practice; the convolution view is what scales to the hundreds-of-thousands-of-digits versions of the same task.",
        "Time: O(L log L) with L = n + m. Space: O(L).",
      ],
    },
    {
      name: "Maximum Self-Matching (SPOJ MAXMATCH)",
      difficulty: "Medium",
      variation: "Autocorrelation of a string, one convolution per letter",
      link: "https://www.spoj.com/problems/MAXMATCH/",
      question: [
        "You are given a string s of length n over the alphabet {a, b, c}. For every shift k with 1 <= k <= n - 1 define M(k) as the number of indices i such that s[i] equals s[i + k], that is the number of matches when the string is laid over itself shifted by k. Print the maximum value of M(k), and on the next line every shift k that attains it, in increasing order.",
        "Example 1:\nInput: aaa\nOutput:\n2\n1\nExplanation: M(1) = 2 (positions 0 and 1 match their neighbours) and M(2) = 1, so the maximum 2 is reached only at shift 1.",
        "Example 2:\nInput: abab\nOutput:\n2\n2\nExplanation: M(1) = 0, M(2) = 2 (a over a and b over b), M(3) = 0.",
        "Constraints:\n- 1 <= n <= 10^5\n- s contains only the letters a, b and c",
      ],
      code: `const long long MOD = 998244353;

long long pw(long long b, long long e, long long m) {
    long long r = 1;
    b %= m;
    while (e) {
        if (e & 1) r = r * b % m;
        b = b * b % m;
        e >>= 1;
    }
    return r;
}

void ntt(vector<long long>& a, bool invert) {
    int n = a.size();
    for (int i = 1, j = 0; i < n; i++) {
        int bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) swap(a[i], a[j]);
    }
    for (int len = 2; len <= n; len <<= 1) {
        long long w = pw(3, (MOD - 1) / len, MOD);
        if (invert) w = pw(w, MOD - 2, MOD);
        for (int i = 0; i < n; i += len) {
            long long wn = 1;
            for (int j = 0; j < len / 2; j++) {
                long long u = a[i + j], v = a[i + j + len / 2] * wn % MOD;
                a[i + j] = (u + v) % MOD;
                a[i + j + len / 2] = (u - v + MOD) % MOD;
                wn = wn * w % MOD;
            }
        }
    }
    if (invert) {
        long long ninv = pw(n, MOD - 2, MOD);
        for (long long& x : a) x = x * ninv % MOD;
    }
}

vector<long long> conv(vector<long long> a, vector<long long> b) {
    int need = (int)a.size() + (int)b.size() - 1, n = 1;
    while (n < need) n <<= 1;
    a.resize(n);
    b.resize(n);
    ntt(a, false);
    ntt(b, false);
    for (int i = 0; i < n; i++) a[i] = a[i] * b[i] % MOD;
    ntt(a, true);
    a.resize(need);
    return a;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    int n = s.size();
    vector<long long> total(2 * n, 0);
    for (char ch : string("abc")) {
        vector<long long> a(n, 0);
        for (int i = 0; i < n; i++) if (s[i] == ch) a[i] = 1;   // indicator of one letter
        vector<long long> b(a.rbegin(), a.rend());              // reversal turns convolution into correlation
        vector<long long> c = conv(a, b);
        for (size_t t = 0; t < c.size(); t++) total[t] += c[t];
    }
    long long best = 0;
    for (int k = 1; k < n; k++) best = max(best, total[n - 1 - k]);
    cout << best << "\\n";
    string out;
    for (int k = 1; k < n; k++)
        if (total[n - 1 - k] == best) out += to_string(k) + " ";
    if (!out.empty()) out.pop_back();
    cout << out << "\\n";
    return 0;
}`,
      explanation: [
        "M(k) is a correlation, not a convolution: it pairs index i with index i + k, whereas convolution pairs indices that sum to a constant. Reversing one operand converts one into the other. With b[j] = a[n-1-j], the product coefficient C[t] equals the sum over i of a[i] * a[i + (n-1-t)], so M(k) = C[n-1-k].",
        "Equality of characters is not multiplicative, so it cannot be tested by a single product. Split by letter instead: for each letter build a 0/1 indicator array, and a pair of positions contributes exactly once, in the array of the letter they share. Summing the three correlations gives the total number of matching positions per shift. Alphabet size multiplies the cost by a constant only.",
        "A single modulus is exact because each M(k) is at most n = 10^5, well under 998244353. That is also the reason nothing needs to be reduced when the three per-letter results are added into total.",
        "The tempting wrong approach is to encode a, b, c as 1, 2, 3 and do one convolution: a product of 2 * 2 is then indistinguishable from 1 * 4, so different letters can be counted as a match.",
        "Time: O(sigma * n log n) with sigma = 3. Space: O(n).",
      ],
    },
    {
      name: "Substring 2 (AtCoder ABC 196 F)",
      difficulty: "Medium",
      variation: "Minimum Hamming distance over all alignments",
      link: "https://atcoder.jp/contests/abc196/tasks/abc196_f",
      question: [
        "You are given two binary strings S and T with |T| <= |S|. Choose a contiguous substring of S of length |T| and then flip as few characters of it as you like so that it becomes equal to T. Print the minimum number of flips needed, taken over all choices of the substring.",
        "Equivalently, print the minimum Hamming distance between T and any window of S of the same length.",
        "Example 1:\nInput:\n0001\n101\nOutput: 1\nExplanation: The windows of length 3 are 000 and 001. Against T = 101 the first differs in 2 positions and the second only in the first position, so the answer is 1.",
        "Example 2:\nInput:\n10101\n010\nOutput: 0\nExplanation: The window starting at position 2 is exactly 010.",
        "Constraints:\n- 1 <= |T| <= |S| <= 10^6\n- S and T consist of the characters 0 and 1 only",
      ],
      code: `const long long MOD = 998244353;

long long pw(long long b, long long e, long long m) {
    long long r = 1;
    b %= m;
    while (e) {
        if (e & 1) r = r * b % m;
        b = b * b % m;
        e >>= 1;
    }
    return r;
}

void ntt(vector<long long>& a, bool invert) {
    int n = a.size();
    for (int i = 1, j = 0; i < n; i++) {
        int bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) swap(a[i], a[j]);
    }
    for (int len = 2; len <= n; len <<= 1) {
        long long w = pw(3, (MOD - 1) / len, MOD);
        if (invert) w = pw(w, MOD - 2, MOD);
        for (int i = 0; i < n; i += len) {
            long long wn = 1;
            for (int j = 0; j < len / 2; j++) {
                long long u = a[i + j], v = a[i + j + len / 2] * wn % MOD;
                a[i + j] = (u + v) % MOD;
                a[i + j + len / 2] = (u - v + MOD) % MOD;
                wn = wn * w % MOD;
            }
        }
    }
    if (invert) {
        long long ninv = pw(n, MOD - 2, MOD);
        for (long long& x : a) x = x * ninv % MOD;
    }
}

vector<long long> conv(vector<long long> a, vector<long long> b) {
    int need = (int)a.size() + (int)b.size() - 1, n = 1;
    while (n < need) n <<= 1;
    a.resize(n);
    b.resize(n);
    ntt(a, false);
    ntt(b, false);
    for (int i = 0; i < n; i++) a[i] = a[i] * b[i] % MOD;
    ntt(a, true);
    a.resize(need);
    return a;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s, t;
    cin >> s >> t;
    int n = s.size(), m = t.size();
    // mismatches = (S is 0 where T is 1) + (S is 1 where T is 0)
    vector<long long> s0(n, 0), s1(n, 0), t0(m, 0), t1(m, 0);
    for (int i = 0; i < n; i++) (s[i] == '0' ? s0 : s1)[i] = 1;
    for (int j = 0; j < m; j++) (t[j] == '0' ? t0 : t1)[j] = 1;
    reverse(t0.begin(), t0.end());   // reversal turns convolution into alignment scoring
    reverse(t1.begin(), t1.end());
    vector<long long> c1 = conv(s0, t1), c2 = conv(s1, t0);
    long long best = m;
    for (int p = 0; p + m <= n; p++)
        best = min(best, c1[p + m - 1] + c2[p + m - 1]);   // window starting at p
    cout << best << "\\n";
    return 0;
}`,
      explanation: [
        "Flipping is free to choose, so the cost of a window is exactly the number of positions where it differs from T - the Hamming distance. The task is therefore to compute the Hamming distance of T against all |S| - |T| + 1 windows at once, which is a classic correlation.",
        "Over a binary alphabet a mismatch is one of two events, S = 0 with T = 1 or S = 1 with T = 0, and each is a product of indicators. Reversing T makes each event count a convolution coefficient: with the reversed pattern, the window starting at p is read off at index p + m - 1.",
        "Every value involved is at most m <= 10^6, so residues mod 998244353 are the true counts and no CRT is needed. Note this is the same trick as the autocorrelation problem, only with two different strings and with mismatches instead of matches.",
        "The naive O(|S| * |T|) comparison is 10^12 operations at the limit, and a bitset speedup still costs |S| * |T| / 64 which is also too slow here. Convolution is the only approach that fits.",
        "Time: O(|S| log |S|). Space: O(|S|).",
      ],
    },
    {
      name: "Very Fast Multiplication (SPOJ VFMUL)",
      difficulty: "Hard",
      variation: "Two NTT moduli plus CRT for exact large coefficients",
      link: "https://www.spoj.com/problems/VFMUL/",
      question: [
        "For each test case you are given two non-negative integers with up to 300000 decimal digits each, one per line. Print their exact product, one per line.",
        "The point of the problem is that the product has up to 600000 digits, so the multiplication has to be a convolution, and the convolution has to be exact - a single NTT modulus near 10^9 is not enough once digits are packed into larger base chunks.",
        "Example 1:\nInput:\n2\n123\n456\n999\n999\nOutput:\n56088\n998001\nExplanation: 123 * 456 = 56088 and 999 * 999 = 998001.",
        "Constraints:\n- each number has at most 300000 digits and no leading zeros\n- the input holds only a handful of test cases",
      ],
      code: `const long long M1 = 998244353;    // 998244352 = 2^23 * 7 * 17, primitive root 3
const long long M2 = 1004535809;   // 1004535808 = 2^21 * 479,     primitive root 3

long long pw(long long b, long long e, long long m) {
    long long r = 1;
    b %= m;
    while (e) {
        if (e & 1) r = r * b % m;
        b = b * b % m;
        e >>= 1;
    }
    return r;
}

void ntt(vector<long long>& a, bool invert, long long mod) {
    int n = a.size();
    for (int i = 1, j = 0; i < n; i++) {
        int bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) swap(a[i], a[j]);
    }
    for (int len = 2; len <= n; len <<= 1) {
        long long w = pw(3, (mod - 1) / len, mod);
        if (invert) w = pw(w, mod - 2, mod);
        for (int i = 0; i < n; i += len) {
            long long wn = 1;
            for (int j = 0; j < len / 2; j++) {
                long long u = a[i + j], v = a[i + j + len / 2] * wn % mod;
                a[i + j] = (u + v) % mod;
                a[i + j + len / 2] = (u - v + mod) % mod;
                wn = wn * w % mod;
            }
        }
    }
    if (invert) {
        long long ninv = pw(n, mod - 2, mod);
        for (long long& x : a) x = x * ninv % mod;
    }
}

vector<long long> convMod(vector<long long> a, vector<long long> b, long long mod) {
    int need = (int)a.size() + (int)b.size() - 1, n = 1;
    while (n < need) n <<= 1;
    for (auto& x : a) x %= mod;
    for (auto& x : b) x %= mod;
    a.resize(n);
    b.resize(n);
    ntt(a, false, mod);
    ntt(b, false, mod);
    for (int i = 0; i < n; i++) a[i] = a[i] * b[i] % mod;
    ntt(a, true, mod);
    a.resize(need);
    return a;
}

// Rebuild the exact value from its residues mod M1 and mod M2 (valid below M1 * M2).
long long crt(long long r1, long long r2) {
    static long long inv = pw(M1 % M2, M2 - 2, M2);
    long long k = (r2 - r1 % M2 + M2) % M2 * inv % M2;
    return r1 + M1 * k;
}

vector<long long> toChunks(const string& s) {
    vector<long long> v;
    for (int i = (int)s.size(); i > 0; i -= 4) {   // base 10^4, least significant chunk first
        int st = max(0, i - 4);
        v.push_back(stoll(s.substr(st, i - st)));
    }
    return v;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int tc;
    if (!(cin >> tc)) return 0;
    while (tc--) {
        string x, y;
        cin >> x >> y;
        vector<long long> a = toChunks(x), b = toChunks(y);
        vector<long long> r1 = convMod(a, b, M1), r2 = convMod(a, b, M2);
        int sz = r1.size();
        vector<long long> digits;
        long long carry = 0;
        for (int i = 0; i < sz; i++) {
            long long cur = crt(r1[i], r2[i]) + carry;   // exact, at most about 7.5e12 + carry
            digits.push_back(cur % 10000);
            carry = cur / 10000;
        }
        while (carry) {
            digits.push_back(carry % 10000);
            carry /= 10000;
        }
        while (digits.size() > 1 && digits.back() == 0) digits.pop_back();
        string out = to_string(digits.back());
        for (int i = (int)digits.size() - 2; i >= 0; i--) {
            string d = to_string(digits[i]);
            out += string(4 - d.size(), '0') + d;   // inner chunks must keep their leading zeros
        }
        cout << out << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Packing four decimal digits per coefficient shrinks the transform length by a factor of four, but it also raises the coefficient bound: each product term is below 10^8 and up to 75000 terms are summed, so a true coefficient can reach about 7.5 * 10^12. That is thousands of times larger than 998244353, so the residue mod a single NTT prime tells you nothing about the real value.",
        "The fix is to run the same convolution under two NTT-friendly primes and reconstruct with the Chinese Remainder Theorem. M1 * M2 is roughly 1.003 * 10^18, comfortably above the 7.5 * 10^12 bound and still inside a signed 64-bit integer, so the reconstruction is exact and overflow-free. Both primes admit 3 as a primitive root, and M2 - 1 is divisible by 2^21 which covers the transform length 2^18 needed here.",
        "After reconstruction the coefficients are a base-10^4 representation with oversized digits; one sweep of divide-and-carry normalises them. Two details bite: strip leading zero chunks before printing, and pad every chunk except the most significant one to exactly four characters.",
        "Long double FFT is the alternative, but with these magnitudes it needs coefficient splitting or a careful 3-FFT scheme to stay inside the mantissa; the two-prime NTT is exact by construction, which is why it is the safer default under a modulus.",
        "Time: O(L log L) per test case with L the number of base-10^4 chunks, times the constant 2 for the two primes. Space: O(L).",
      ],
    },
    {
      name: "Lucky Tickets (Codeforces 1096G)",
      difficulty: "Hard",
      variation: "Power of a polynomial by pointwise exponentiation",
      link: "https://codeforces.com/problemset/problem/1096/G",
      question: [
        "A ticket is a string of exactly n digits, where n is even, and every digit must come from a given set of k allowed digits. A ticket is lucky if the sum of its first n/2 digits equals the sum of its last n/2 digits. Count the lucky tickets modulo 998244353.",
        "Example 1:\nInput:\n4 2\n1 3\nOutput: 6\nExplanation: With two digits per half the reachable half-sums are 2 (as 1+1), 4 (as 1+3 or 3+1) and 6 (as 3+3), with counts 1, 2, 1. Pairing a left half with a right half of the same sum gives 1*1 + 2*2 + 1*1 = 6.",
        "Example 2:\nInput:\n2 1\n0\nOutput: 1\nExplanation: The only ticket is 00, and 0 = 0.",
        "Constraints:\n- 2 <= n <= 2 * 10^5, n is even\n- 1 <= k <= 10\n- the allowed digits are distinct and lie in 0..9",
      ],
      code: `const long long MOD = 998244353;

long long pw(long long b, long long e, long long m) {
    long long r = 1;
    b %= m;
    while (e) {
        if (e & 1) r = r * b % m;
        b = b * b % m;
        e >>= 1;
    }
    return r;
}

void ntt(vector<long long>& a, bool invert) {
    int n = a.size();
    for (int i = 1, j = 0; i < n; i++) {
        int bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) swap(a[i], a[j]);
    }
    for (int len = 2; len <= n; len <<= 1) {
        long long w = pw(3, (MOD - 1) / len, MOD);
        if (invert) w = pw(w, MOD - 2, MOD);
        for (int i = 0; i < n; i += len) {
            long long wn = 1;
            for (int j = 0; j < len / 2; j++) {
                long long u = a[i + j], v = a[i + j + len / 2] * wn % MOD;
                a[i + j] = (u + v) % MOD;
                a[i + j + len / 2] = (u - v + MOD) % MOD;
                wn = wn * w % MOD;
            }
        }
    }
    if (invert) {
        long long ninv = pw(n, MOD - 2, MOD);
        for (long long& x : a) x = x * ninv % MOD;
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    long long n;
    int k;
    cin >> n >> k;
    long long half = n / 2;
    int need = (int)(9 * half) + 1;      // largest reachable half-sum is 9 * half
    int sz = 1;
    while (sz < need) sz <<= 1;          // no wraparound: sz exceeds the result degree
    vector<long long> a(sz, 0);
    for (int i = 0; i < k; i++) {
        int d;
        cin >> d;
        a[d] = 1;                        // generating function of one digit
    }
    ntt(a, false);
    for (long long& x : a) x = pw(x, half, MOD);   // pointwise power == polynomial power
    ntt(a, true);
    long long ans = 0;
    for (int s = 0; s < need; s++) ans = (ans + a[s] * a[s]) % MOD;
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "Let P(x) = sum over allowed digits d of x^d. Then P(x)^(n/2) has, as the coefficient of x^s, the number of ordered half-strings of length n/2 whose digits sum to s. The two halves are independent, so the answer is the sum over s of that coefficient squared.",
        "The key move is that the transform is a ring homomorphism: raising a polynomial to the power e is the same as transforming once, raising each evaluation point to the power e with fast modular exponentiation, and transforming back. That replaces log(e) full convolutions by a single pair of transforms, and it is legal only because the array is padded past 9 * (n/2), the true degree of the result, so cyclic wraparound cannot mix coefficients.",
        "Squaring the coefficients afterwards is exactly the middle coefficient of P^(n/2) times its reverse; there is no need for a second convolution since only one output value is wanted.",
        "The trap is doing the exponentiation by repeated squaring in coefficient space: the degree grows to 9 * 10^5, so every squaring costs a full transform and the constant factor balloons. A second trap is padding only to the degree of P^(n/2) itself rather than strictly beyond it.",
        "Time: O(D log D) with D about 9n/2, plus O(D log n) for the pointwise powers. Space: O(D).",
      ],
    },
    {
      name: "Nikita and Order Statistics (Codeforces 993E)",
      difficulty: "Hard",
      variation: "Counting prefix-sum pairs, exact counts via CRT",
      link: "https://codeforces.com/problemset/problem/993/E",
      question: [
        "You are given an array a of n integers and a value x. For every k from 0 to n, count the number of non-empty contiguous subsegments of a that contain exactly k elements strictly greater than x. Print the n + 1 counts.",
        "Replace each element by 1 if it exceeds x and 0 otherwise and take prefix sums p[0..n]. A subsegment (l, r] then contains p[r] - p[l] marked elements, so the answer for k is the number of index pairs l < r with p[r] - p[l] = k.",
        "Example 1:\nInput:\n5 3\n1 2 3 4 5\nOutput: 6 5 4 0 0 0\nExplanation: The marked positions are the values 4 and 5. Six subsegments lie entirely inside 1 2 3, five contain exactly one of 4 and 5, and four contain both. The three counts sum to 15, the total number of subsegments.",
        "Example 2:\nInput:\n2 0\n1 1\nOutput: 0 2 1\nExplanation: Both elements exceed 0, so the subsegments [1,1] and [2,2] have one marked element and [1,2] has two.",
        "Constraints:\n- 1 <= n <= 2 * 10^5\n- 0 <= x, a[i] <= 10^9",
      ],
      code: `const long long M1 = 998244353;
const long long M2 = 1004535809;

long long pw(long long b, long long e, long long m) {
    long long r = 1;
    b %= m;
    while (e) {
        if (e & 1) r = r * b % m;
        b = b * b % m;
        e >>= 1;
    }
    return r;
}

void ntt(vector<long long>& a, bool invert, long long mod) {
    int n = a.size();
    for (int i = 1, j = 0; i < n; i++) {
        int bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) swap(a[i], a[j]);
    }
    for (int len = 2; len <= n; len <<= 1) {
        long long w = pw(3, (mod - 1) / len, mod);
        if (invert) w = pw(w, mod - 2, mod);
        for (int i = 0; i < n; i += len) {
            long long wn = 1;
            for (int j = 0; j < len / 2; j++) {
                long long u = a[i + j], v = a[i + j + len / 2] * wn % mod;
                a[i + j] = (u + v) % mod;
                a[i + j + len / 2] = (u - v + mod) % mod;
                wn = wn * w % mod;
            }
        }
    }
    if (invert) {
        long long ninv = pw(n, mod - 2, mod);
        for (long long& x : a) x = x * ninv % mod;
    }
}

vector<long long> convMod(vector<long long> a, vector<long long> b, long long mod) {
    int need = (int)a.size() + (int)b.size() - 1, n = 1;
    while (n < need) n <<= 1;
    for (auto& v : a) v %= mod;
    for (auto& v : b) v %= mod;
    a.resize(n);
    b.resize(n);
    ntt(a, false, mod);
    ntt(b, false, mod);
    for (int i = 0; i < n; i++) a[i] = a[i] * b[i] % mod;
    ntt(a, true, mod);
    a.resize(need);
    return a;
}

long long crt(long long r1, long long r2) {
    static long long inv = pw(M1 % M2, M2 - 2, M2);
    long long k = (r2 - r1 % M2 + M2) % M2 * inv % M2;
    return r1 + M1 * k;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    long long x;
    cin >> n >> x;
    vector<long long> p(n + 1, 0);
    for (int i = 0; i < n; i++) {
        long long v;
        cin >> v;
        p[i + 1] = p[i] + (v > x ? 1 : 0);
    }
    int M = n + 1;
    vector<long long> cnt(M, 0);
    for (int i = 0; i <= n; i++) cnt[p[i]]++;          // how many prefixes have each value
    vector<long long> rev(cnt.rbegin(), cnt.rend());
    vector<long long> r1 = convMod(cnt, rev, M1), r2 = convMod(cnt, rev, M2);
    vector<long long> ans(n + 1, 0);
    for (long long c : cnt) ans[0] += c * (c - 1) / 2;  // k = 0 needs l < r, not l = r
    for (int k = 1; k <= n; k++) ans[k] = crt(r1[M - 1 - k], r2[M - 1 - k]);
    for (int k = 0; k <= n; k++) cout << ans[k] << " \\n"[k == n];
    return 0;
}`,
      explanation: [
        "After the 0/1 reduction the question becomes purely about the multiset of prefix-sum values: for k >= 1 the answer is the sum over v of cnt[v] * cnt[v + k], because p is non-decreasing so any pair with difference k automatically has the smaller index first. That sum over all k at once is the autocorrelation of cnt, obtained by convolving cnt with its reverse and reading index M - 1 - k.",
        "k = 0 must be handled separately. The convolution's k = 0 entry is the sum of cnt[v]^2, which counts ordered pairs including l = r; the number of valid subsegments is instead the sum of cnt[v] choose 2.",
        "These are true counts, not counts modulo anything: with n = 2 * 10^5 the k = 0 answer alone can reach about 2 * 10^10, twenty times larger than 998244353. Printing a residue would be wrong, so the convolution is run under two NTT primes and each needed coefficient is rebuilt with CRT, whose range M1 * M2 is about 10^18.",
        "The tempting shortcut is a two-pointer or per-k sliding sum over cnt, but that is O(n^2) across all k. The other trap is monotonicity: this reduction to a plain autocorrelation only works because the prefix sums are non-decreasing, so a difference of k never comes from a pair in the wrong order.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Fuzzy Search (Codeforces 528D)",
      difficulty: "Hard",
      variation: "Approximate matching with an error window",
      link: "https://codeforces.com/problemset/problem/528/D",
      question: [
        "You are given a text S and a pattern T over the alphabet {A, C, G, T}, and an integer k. The pattern is said to occur at position i of S (1-indexed, with i + |T| - 1 <= |S|) if for every j the character T[j] appears somewhere in S within the window of positions [i + j - 1 - k, i + j - 1 + k], clipped to the text. Count the number of positions where the pattern occurs.",
        "Example 1:\nInput:\n4 2 1\nACGT\nAG\nOutput: 2\nExplanation: A is 'available' at text positions 1 and 2, and G at positions 2, 3 and 4. Starting at 1 needs A at position 1 and G at position 2: both available. Starting at 2 needs A at 2 and G at 3: both available. Starting at 3 needs A at position 3, which is not available, so only two occurrences.",
        "Example 2:\nInput:\n4 2 0\nAAAA\nAA\nOutput: 3\nExplanation: With k = 0 this is exact matching, and AA occurs at positions 1, 2 and 3.",
        "Constraints:\n- 1 <= |T| <= |S| <= 2 * 10^5\n- 0 <= k <= 2 * 10^5\n- both strings use only the letters A, C, G, T",
      ],
      code: `const long long MOD = 998244353;

long long pw(long long b, long long e, long long m) {
    long long r = 1;
    b %= m;
    while (e) {
        if (e & 1) r = r * b % m;
        b = b * b % m;
        e >>= 1;
    }
    return r;
}

void ntt(vector<long long>& a, bool invert) {
    int n = a.size();
    for (int i = 1, j = 0; i < n; i++) {
        int bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) swap(a[i], a[j]);
    }
    for (int len = 2; len <= n; len <<= 1) {
        long long w = pw(3, (MOD - 1) / len, MOD);
        if (invert) w = pw(w, MOD - 2, MOD);
        for (int i = 0; i < n; i += len) {
            long long wn = 1;
            for (int j = 0; j < len / 2; j++) {
                long long u = a[i + j], v = a[i + j + len / 2] * wn % MOD;
                a[i + j] = (u + v) % MOD;
                a[i + j + len / 2] = (u - v + MOD) % MOD;
                wn = wn * w % MOD;
            }
        }
    }
    if (invert) {
        long long ninv = pw(n, MOD - 2, MOD);
        for (long long& x : a) x = x * ninv % MOD;
    }
}

vector<long long> conv(vector<long long> a, vector<long long> b) {
    int need = (int)a.size() + (int)b.size() - 1, n = 1;
    while (n < need) n <<= 1;
    a.resize(n);
    b.resize(n);
    ntt(a, false);
    ntt(b, false);
    for (int i = 0; i < n; i++) a[i] = a[i] * b[i] % MOD;
    ntt(a, true);
    a.resize(need);
    return a;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m, k;
    cin >> n >> m >> k;
    string s, t;
    cin >> s >> t;
    vector<long long> score(n + m, 0);
    for (char ch : string("ACGT")) {
        vector<long long> diff(n + 2, 0);
        for (int i = 0; i < n; i++)
            if (s[i] == ch) {                       // this letter covers [i-k, i+k]
                int lo = max(0, i - k), hi = min(n - 1, i + k);
                diff[lo]++;
                diff[hi + 1]--;
            }
        vector<long long> avail(n, 0);
        long long run = 0;
        for (int i = 0; i < n; i++) {
            run += diff[i];
            avail[i] = run > 0 ? 1 : 0;              // 1 if ch is reachable at position i
        }
        vector<long long> pat(m, 0);
        for (int j = 0; j < m; j++) if (t[j] == ch) pat[j] = 1;
        reverse(pat.begin(), pat.end());
        vector<long long> c = conv(avail, pat);
        for (int i = 0; i < (int)c.size() && i < n + m; i++) score[i] += c[i];
    }
    int ans = 0;
    for (int p = 0; p + m <= n; p++)
        if (score[p + m - 1] == m) ans++;            // every pattern character satisfied
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "The k-window condition depends only on the text, not on the alignment: for each letter c, position i of the text either has c somewhere within distance k or it does not. Precompute that as a 0/1 array with a difference array over the intervals [i-k, i+k], which is O(n) per letter.",
        "Now a start position p is an occurrence exactly when, for every j, the letter T[j] is available at text position p + j. Summing the indicator products over j and over the four letters gives a score, and the alignment succeeds if and only if the score equals |T| - it can never exceed it, because each j contributes at most one to exactly one letter's term.",
        "The four correlations are computed with reversed patterns, so the window starting at p is read at index p + m - 1, and each score is at most m <= 2 * 10^5, comfortably exact under a single NTT prime.",
        "The trap is trying to model tolerance by comparing characters directly, or by clamping k against the string ends after the convolution. Both the interval clipping and the per-letter split must happen before any transform. A second trap is using strict inequality on the score: only equality to |T| means every position matched.",
        "Time: O(sigma * (n + m) log(n + m)) with sigma = 4. Space: O(n + m).",
      ],
    },
    {
      name: "Triple Sums (SPOJ TSUM)",
      difficulty: "Hard",
      variation: "Cube of a polynomial with inclusion-exclusion on repeats",
      link: "https://www.spoj.com/problems/TSUM/",
      question: [
        "You are given N distinct integers. For every value s that can be written as the sum of three of them chosen at distinct positions, print s and the number of such unordered triples, in increasing order of s.",
        "Example 1:\nInput:\n4\n1 2 3 4\nOutput:\n6 1\n7 1\n8 1\n9 1\nExplanation: The four triples are 1+2+3 = 6, 1+2+4 = 7, 1+3+4 = 8 and 2+3+4 = 9, each achievable in exactly one way.",
        "Example 2:\nInput:\n4\n-1 0 1 2\nOutput:\n0 1\n1 1\n2 1\n3 1\nExplanation: The triples give -1+0+1 = 0, -1+0+2 = 1, -1+1+2 = 2 and 0+1+2 = 3.",
        "Constraints:\n- 3 <= N <= 40000\n- each value lies in [-20000, 20000] and all values are distinct",
      ],
      code: `const long long M1 = 998244353;
const long long M2 = 1004535809;

long long pw(long long b, long long e, long long m) {
    long long r = 1;
    b %= m;
    while (e) {
        if (e & 1) r = r * b % m;
        b = b * b % m;
        e >>= 1;
    }
    return r;
}

void ntt(vector<long long>& a, bool invert, long long mod) {
    int n = a.size();
    for (int i = 1, j = 0; i < n; i++) {
        int bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) swap(a[i], a[j]);
    }
    for (int len = 2; len <= n; len <<= 1) {
        long long w = pw(3, (mod - 1) / len, mod);
        if (invert) w = pw(w, mod - 2, mod);
        for (int i = 0; i < n; i += len) {
            long long wn = 1;
            for (int j = 0; j < len / 2; j++) {
                long long u = a[i + j], v = a[i + j + len / 2] * wn % mod;
                a[i + j] = (u + v) % mod;
                a[i + j + len / 2] = (u - v + mod) % mod;
                wn = wn * w % mod;
            }
        }
    }
    if (invert) {
        long long ninv = pw(n, mod - 2, mod);
        for (long long& x : a) x = x * ninv % mod;
    }
}

long long crt(long long r1, long long r2) {
    static long long inv = pw(M1 % M2, M2 - 2, M2);
    long long k = (r2 - r1 % M2 + M2) % M2 * inv % M2;
    return r1 + M1 * k;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    const int S = 20000;             // shift so that every exponent is non-negative
    const int NEED = 3 * (2 * S) + 1;
    int sz = 1;
    while (sz < NEED) sz <<= 1;      // sz exceeds the degree of the cube: no wraparound
    vector<long long> A(sz, 0), A2(sz, 0), A3(sz, 0);
    for (int i = 0; i < n; i++) {
        int v;
        cin >> v;
        int e = v + S;
        A[e]++;                      // sum of one element
        A2[2 * e]++;                 // sum of the same element twice
        A3[3 * e]++;                 // three times
    }
    vector<long long> res[2];
    long long mods[2] = {M1, M2};
    for (int t = 0; t < 2; t++) {
        long long mod = mods[t];
        vector<long long> fa(A), fb(A2), fc(A3);
        ntt(fa, false, mod);
        ntt(fb, false, mod);
        ntt(fc, false, mod);
        for (int i = 0; i < sz; i++) {
            long long f = fa[i];
            long long cube = f * f % mod * f % mod;
            long long cross = 3 * f % mod * fb[i] % mod;   // ordered triples with a repeat
            long long same = 2 * fc[i] % mod;              // all three equal, added back
            fa[i] = ((cube - cross + same) % mod + mod) % mod;
        }
        ntt(fa, true, mod);
        res[t] = fa;
    }
    string out;
    for (int i = 0; i < NEED; i++) {
        long long val = crt(res[0][i], res[1][i]);   // exact value of 6 * (number of triples)
        if (val == 0) continue;
        out += to_string(i - 3 * S) + " " + to_string(val / 6) + "\\n";
    }
    cout << out;
    return 0;
}`,
      explanation: [
        "Let A(x) = sum over the input values of x^(v+S), with the shift S = 20000 making all exponents non-negative. A(x)^3 counts ordered triples of positions with repetition allowed, so its coefficients over-count. Inclusion-exclusion on how many positions coincide gives A^3 - 3 * A * A2 + 2 * A3, where A2 and A3 place a term at 2(v+S) and 3(v+S) respectively. That expression counts ordered triples of pairwise distinct positions, which is 6 times the number of unordered triples.",
        "Because the total shift of every term is the same 3S, the three polynomials line up and the whole expression can be evaluated pointwise after one forward transform each - no separate convolutions are needed. The array is padded past 3 * 2S, the true degree, so the cyclic transform computes a linear convolution.",
        "The counts are the real reason this problem belongs to the modular-FFT topic: N choose 3 with N = 40000 is about 1.07 * 10^13, so a coefficient can be far beyond any single NTT prime. Two primes and CRT recover the exact integer (below M1 * M2, about 10^18), and only then is the division by 6 an honest integer division. Note the pointwise formula already adds the +2 * A3 term back, so the reconstructed value is non-negative and no signed correction is needed.",
        "Two tempting mistakes: subtracting only 3 * A * A2 and forgetting to add 2 * A3 back, which makes coefficients where all three elements coincide come out negative; and dividing by 6 modulo a prime, which yields a residue rather than the count the problem wants.",
        "Time: O(V log V) with V about 1.2 * 10^5, times the constant 2 for the two primes. Space: O(V).",
      ],
    },
    {
      name: "Convolution mod 1000000007 (Library Checker)",
      difficulty: "Hard",
      variation: "Arbitrary modulus by 15-bit splitting plus CRT",
      link: "https://judge.yosupo.jp/problem/convolution_mod_1000000007",
      question: [
        "You are given sequences a of length N and b of length M whose entries are residues modulo 1000000007. Print the convolution c of length N + M - 1, where c[i] is the sum of a[j] * b[i-j], each value reduced modulo 1000000007.",
        "The difficulty is that 1000000007 - 1 = 2 * 500000003 with 500000003 prime, so the field has no primitive root of unity of any large power-of-two order. There is no direct NTT under this modulus, and the transform has to be borrowed from other primes.",
        "Example 1:\nInput:\n2 2\n1 2\n3 4\nOutput: 3 10 8\nExplanation: (1 + 2x)(3 + 4x) = 3 + 10x + 8x^2, and all three values are already below the modulus.",
        "Example 2:\nInput:\n1 1\n1000000000\n1000000000\nOutput: 49\nExplanation: 1000000000 is congruent to -7 modulo 1000000007, and (-7) * (-7) = 49.",
        "Constraints:\n- 1 <= N, M <= 5 * 10^5\n- 0 <= a[i], b[i] < 1000000007",
      ],
      code: `const long long MOD = 1000000007;   // not NTT-friendly: MOD - 1 = 2 * 500000003
const long long M1 = 998244353;
const long long M2 = 1004535809;

long long pw(long long b, long long e, long long m) {
    long long r = 1;
    b %= m;
    while (e) {
        if (e & 1) r = r * b % m;
        b = b * b % m;
        e >>= 1;
    }
    return r;
}

void ntt(vector<long long>& a, bool invert, long long mod) {
    int n = a.size();
    for (int i = 1, j = 0; i < n; i++) {
        int bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) swap(a[i], a[j]);
    }
    for (int len = 2; len <= n; len <<= 1) {
        long long w = pw(3, (mod - 1) / len, mod);
        if (invert) w = pw(w, mod - 2, mod);
        for (int i = 0; i < n; i += len) {
            long long wn = 1;
            for (int j = 0; j < len / 2; j++) {
                long long u = a[i + j], v = a[i + j + len / 2] * wn % mod;
                a[i + j] = (u + v) % mod;
                a[i + j + len / 2] = (u - v + mod) % mod;
                wn = wn * w % mod;
            }
        }
    }
    if (invert) {
        long long ninv = pw(n, mod - 2, mod);
        for (long long& x : a) x = x * ninv % mod;
    }
}

long long crt(long long r1, long long r2) {
    static long long inv = pw(M1 % M2, M2 - 2, M2);
    long long k = (r2 - r1 % M2 + M2) % M2 * inv % M2;
    return r1 + M1 * k;   // exact while the true value stays below M1 * M2
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<long long> a(n), b(m);
    for (auto& v : a) cin >> v;
    for (auto& v : b) cin >> v;
    int need = n + m - 1, sz = 1;
    while (sz < need) sz <<= 1;
    long long mods[2] = {M1, M2};
    vector<long long> lo[2], mid[2], hi[2];
    for (int t = 0; t < 2; t++) {
        long long mod = mods[t];
        vector<long long> a0(sz, 0), a1(sz, 0), b0(sz, 0), b1(sz, 0);
        for (int i = 0; i < n; i++) { a0[i] = a[i] & 32767; a1[i] = a[i] >> 15; }
        for (int i = 0; i < m; i++) { b0[i] = b[i] & 32767; b1[i] = b[i] >> 15; }
        ntt(a0, false, mod);
        ntt(a1, false, mod);
        ntt(b0, false, mod);
        ntt(b1, false, mod);
        vector<long long> L(sz), Mi(sz), H(sz);
        for (int i = 0; i < sz; i++) {
            L[i] = a0[i] * b0[i] % mod;
            Mi[i] = (a0[i] * b1[i] + a1[i] * b0[i]) % mod;
            H[i] = a1[i] * b1[i] % mod;
        }
        ntt(L, true, mod);
        ntt(Mi, true, mod);
        ntt(H, true, mod);
        lo[t] = L;
        mid[t] = Mi;
        hi[t] = H;
    }
    const long long P15 = 32768 % MOD, P30 = (1LL << 30) % MOD;
    for (int i = 0; i < need; i++) {
        long long l = crt(lo[0][i], lo[1][i]) % MOD;      // each part is exact before reduction
        long long d = crt(mid[0][i], mid[1][i]) % MOD;
        long long h = crt(hi[0][i], hi[1][i]) % MOD;
        long long res = (l + d * P15 + h * P30) % MOD;
        cout << res << " \\n"[i + 1 == need];
    }
    return 0;
}`,
      explanation: [
        "There is no NTT modulo 1000000007 because the multiplicative group has order 2 * 500000003 and contains no element of order 2^20. The way out is to compute the convolution exactly over the integers and only reduce at the very end - the target modulus never appears inside a transform.",
        "Computing it exactly is hopeless directly: coefficients reach 10^18 * 5 * 10^5. So split each input value into 15-bit halves, a = a1 * 2^15 + a0, giving a[i] * b[j] = a1b1 * 2^30 + (a1b0 + a0b1) * 2^15 + a0b0. Each of the three sub-convolutions has coefficients below 2 * 2^30 * 5 * 10^5, about 1.1 * 10^15, which fits under M1 * M2 (roughly 10^18). Two NTT primes and CRT therefore reconstruct each part exactly, and only then are the parts recombined modulo 1000000007.",
        "The bookkeeping saving is that the middle part needs no extra transforms: all four forward transforms are reused pointwise, so it is 4 forward plus 3 inverse transforms per prime.",
        "The equivalent standard alternative is three NTT primes with Garner reconstruction on the unsplit coefficients; splitting into halves keeps the arithmetic inside 64 bits without a 128-bit CRT. The classic bug in both variants is reducing an intermediate residue by the target modulus too early - once a value has been taken modulo 1000000007 inside the transform, the CRT reconstruction is meaningless.",
        "Time: O(L log L) with L = N + M, times a constant near 14 for the transforms. Space: O(L).",
      ],
    },
  ],
};
