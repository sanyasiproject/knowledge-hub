import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Multiply Two Polynomials",
      difficulty: "Easy",
      variation: "Iterative FFT template, plain convolution",
      link: "https://www.geeksforgeeks.org/multiply-two-polynomials-2/",
      question: [
        "Given two polynomials A and B represented as coefficient arrays, where a[i] is the coefficient of x^i, return the coefficient array of their product. The product has size a.size() + b.size() - 1. Solve it in O(n log n) rather than the schoolbook O(n^2).",
        "Example 1:\nInput: a = [5, 0, 10, 6], b = [1, 2, 4]\nOutput: [5, 10, 30, 26, 52, 24]\nExplanation: (5 + 10x^2 + 6x^3)(1 + 2x + 4x^2) = 5 + 10x + 30x^2 + 26x^3 + 52x^4 + 24x^5.",
        "Example 2:\nInput: a = [1, 1], b = [1, 1]\nOutput: [1, 2, 1]\nExplanation: (1 + x)^2 = 1 + 2x + x^2.",
        "Constraints:\n- 1 <= a.size(), b.size() <= 2 * 10^5\n- |a[i]|, |b[i]| <= 10^4 so every product coefficient fits in a 64-bit integer",
      ],
      code: `using cd = complex<double>;

void fft(vector<cd>& a, bool invert) {
    int n = a.size();
    // bit-reversal permutation so the butterflies can run bottom-up in place
    for (int i = 1, j = 0; i < n; i++) {
        int bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) swap(a[i], a[j]);
    }
    for (int len = 2; len <= n; len <<= 1) {
        double ang = 2 * acos(-1.0) / len * (invert ? -1 : 1);
        cd wlen(cos(ang), sin(ang));
        for (int i = 0; i < n; i += len) {
            cd w(1);
            for (int j = 0; j < len / 2; j++) {
                cd u = a[i + j], v = a[i + j + len / 2] * w;
                a[i + j] = u + v;
                a[i + j + len / 2] = u - v;
                w *= wlen;
            }
        }
    }
    if (invert) for (cd& x : a) x /= n;
}

vector<long long> convolve(const vector<long long>& a, const vector<long long>& b) {
    if (a.empty() || b.empty()) return {};
    int need = (int)a.size() + (int)b.size() - 1;
    int n = 1;
    while (n < need) n <<= 1;
    vector<cd> fa(n), fb(n);
    for (size_t i = 0; i < a.size(); i++) fa[i] = (double)a[i];
    for (size_t i = 0; i < b.size(); i++) fb[i] = (double)b[i];
    fft(fa, false);
    fft(fb, false);
    for (int i = 0; i < n; i++) fa[i] *= fb[i];
    fft(fa, true);
    vector<long long> res(need);
    for (int i = 0; i < need; i++) res[i] = llround(fa[i].real());
    return res;
}

vector<long long> multiplyPolynomials(vector<long long>& a, vector<long long>& b) {
    return convolve(a, b);
}`,
      explanation: [
        "The product coefficient c[k] = sum over i of a[i] * b[k-i] is a convolution. The FFT turns convolution into pointwise multiplication: evaluate both polynomials at the n complex n-th roots of unity, multiply the value vectors elementwise, then interpolate back. Evaluation and interpolation each cost O(n log n), the pointwise step O(n).",
        "Correctness rests on the fact that a polynomial of degree < n is uniquely determined by its values at n distinct points, and the inverse DFT is the same butterfly network with conjugated roots plus a division by n. That is why the transform length must be padded to a power of two at least a.size() + b.size() - 1: otherwise high-degree terms wrap around modulo n and silently corrupt low coefficients.",
        "The trap is precision, not logic. The transform runs in floating point, so coefficients are recovered by llround on the real part. The absolute error grows roughly like maxCoefficient * n * machine epsilon, so with integer inputs above about 10^14 in magnitude, or very long inputs, results start rounding to the wrong integer - that is exactly when you split inputs into smaller limbs or switch to NTT under a prime modulus.",
        "Do not use recursion for production FFT: the iterative bit-reversal version has no allocation per level and runs several times faster on the same asymptotics.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Multiply Strings",
      difficulty: "Medium",
      variation: "Big-integer multiplication as convolution",
      link: "https://leetcode.com/problems/multiply-strings/",
      question: [
        "Given two non-negative integers num1 and num2 represented as decimal strings, return their product, also as a string. You must not convert the inputs to a built-in big-integer type.",
        "Example 1:\nInput: num1 = '2', num2 = '3'\nOutput: '6'",
        "Example 2:\nInput: num1 = '123', num2 = '456'\nOutput: '56088'\nExplanation: 123 * 456 = 56088.",
        "Constraints:\n- 1 <= num1.length, num2.length <= 200\n- Both strings contain only digits and have no leading zero except the value 0 itself",
      ],
      code: `using cd = complex<double>;

void fft(vector<cd>& a, bool invert) {
    int n = a.size();
    for (int i = 1, j = 0; i < n; i++) {
        int bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) swap(a[i], a[j]);
    }
    for (int len = 2; len <= n; len <<= 1) {
        double ang = 2 * acos(-1.0) / len * (invert ? -1 : 1);
        cd wlen(cos(ang), sin(ang));
        for (int i = 0; i < n; i += len) {
            cd w(1);
            for (int j = 0; j < len / 2; j++) {
                cd u = a[i + j], v = a[i + j + len / 2] * w;
                a[i + j] = u + v;
                a[i + j + len / 2] = u - v;
                w *= wlen;
            }
        }
    }
    if (invert) for (cd& x : a) x /= n;
}

vector<long long> convolve(const vector<long long>& a, const vector<long long>& b) {
    if (a.empty() || b.empty()) return {};
    int need = (int)a.size() + (int)b.size() - 1;
    int n = 1;
    while (n < need) n <<= 1;
    vector<cd> fa(n), fb(n);
    for (size_t i = 0; i < a.size(); i++) fa[i] = (double)a[i];
    for (size_t i = 0; i < b.size(); i++) fb[i] = (double)b[i];
    fft(fa, false);
    fft(fb, false);
    for (int i = 0; i < n; i++) fa[i] *= fb[i];
    fft(fa, true);
    vector<long long> res(need);
    for (int i = 0; i < need; i++) res[i] = llround(fa[i].real());
    return res;
}

string multiply(string num1, string num2) {
    if (num1 == "0" || num2 == "0") return "0";
    int n = num1.size(), m = num2.size();
    vector<long long> a(n), b(m);
    // little-endian digit arrays: index i holds the coefficient of 10^i
    for (int i = 0; i < n; i++) a[i] = num1[n - 1 - i] - '0';
    for (int i = 0; i < m; i++) b[i] = num2[m - 1 - i] - '0';
    vector<long long> c = convolve(a, b);
    string out;
    long long carry = 0;
    for (size_t i = 0; i < c.size(); i++) {
        long long cur = c[i] + carry;
        out.push_back(char('0' + cur % 10));
        carry = cur / 10;
    }
    while (carry > 0) {
        out.push_back(char('0' + carry % 10));
        carry /= 10;
    }
    while (out.size() > 1 && out.back() == '0') out.pop_back();
    reverse(out.begin(), out.end());
    return out;
}`,
      explanation: [
        "A decimal number is a polynomial in the base: num = sum of digit[i] * 10^i. Multiplying two numbers is therefore exactly polynomial multiplication followed by carry propagation, and the carry pass is what turns an unbounded coefficient vector back into digits.",
        "So the convolution is computed first with no regard for carries at all - coefficient c[k] may be far above 9 - and only then is a single left-to-right sweep applied that pushes cur / 10 into the next position. Interleaving carries into the multiplication would break the linearity the FFT relies on.",
        "For these constraints the O(n * m) schoolbook loop is entirely sufficient and is what most accepted solutions use; the value here is that the same code scales to hundreds of thousands of digits, where schoolbook does not. Two details still matter: strip leading zeros after reversing, and special-case a zero operand, since otherwise the result is the empty or all-zero string.",
        "Time: O(d log d) where d is the total number of digits. Space: O(d).",
      ],
    },
    {
      name: "Polynomial Multiplication",
      difficulty: "Medium",
      variation: "Judge-style batch convolution",
      link: "https://www.spoj.com/problems/POLYMUL/",
      question: [
        "The first line contains the number of test cases T. Each test case consists of three lines: an integer n, then n + 1 integers giving the coefficients a0..an of a polynomial of degree n, then n + 1 integers giving the coefficients b0..bn of a second polynomial of degree n. For each test case print the 2n + 1 coefficients of the product polynomial, in increasing order of exponent, separated by spaces.",
        "Example 1:\nInput:\n1\n2\n1 2 3\n4 5 6\nOutput: 4 13 28 27 18\nExplanation: (1 + 2x + 3x^2)(4 + 5x + 6x^2) = 4 + 13x + 28x^2 + 27x^3 + 18x^4.",
        "Example 2:\nInput:\n1\n1\n1 1\n1 1\nOutput: 1 2 1",
        "Constraints:\n- 1 <= T <= 20\n- 1 <= n <= 10^5\n- Coefficients are integers with absolute value at most 10^4",
      ],
      code: `using cd = complex<double>;

void fft(vector<cd>& a, bool invert) {
    int n = a.size();
    for (int i = 1, j = 0; i < n; i++) {
        int bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) swap(a[i], a[j]);
    }
    for (int len = 2; len <= n; len <<= 1) {
        double ang = 2 * acos(-1.0) / len * (invert ? -1 : 1);
        cd wlen(cos(ang), sin(ang));
        for (int i = 0; i < n; i += len) {
            cd w(1);
            for (int j = 0; j < len / 2; j++) {
                cd u = a[i + j], v = a[i + j + len / 2] * w;
                a[i + j] = u + v;
                a[i + j + len / 2] = u - v;
                w *= wlen;
            }
        }
    }
    if (invert) for (cd& x : a) x /= n;
}

vector<long long> convolve(const vector<long long>& a, const vector<long long>& b) {
    if (a.empty() || b.empty()) return {};
    int need = (int)a.size() + (int)b.size() - 1;
    int n = 1;
    while (n < need) n <<= 1;
    vector<cd> fa(n), fb(n);
    for (size_t i = 0; i < a.size(); i++) fa[i] = (double)a[i];
    for (size_t i = 0; i < b.size(); i++) fb[i] = (double)b[i];
    fft(fa, false);
    fft(fb, false);
    for (int i = 0; i < n; i++) fa[i] *= fb[i];
    fft(fa, true);
    vector<long long> res(need);
    for (int i = 0; i < need; i++) res[i] = llround(fa[i].real());
    return res;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int T;
    if (!(cin >> T)) return 0;
    while (T--) {
        int n;
        cin >> n;
        vector<long long> a(n + 1), b(n + 1);
        for (int i = 0; i <= n; i++) cin >> a[i];
        for (int i = 0; i <= n; i++) cin >> b[i];
        vector<long long> c = convolve(a, b);
        for (int i = 0; i < (int)c.size(); i++) {
            cout << c[i];
            if (i + 1 < (int)c.size()) cout << ' ';
        }
        cout << "\\n";
    }
    return 0;
}`,
      explanation: [
        "This is the bare template applied to a judge harness: read, convolve, print. The only new concern is the reading and writing cost - with n up to 10^5 across 20 tests the answer has millions of numbers, so untied synchronised streams alone can dominate the FFT time. Hence sync_with_stdio(false) and cin.tie(nullptr).",
        "Negative coefficients are handled with no extra work because the DFT is linear over the reals; there is no need to shift inputs to be non-negative the way one must with some hashing schemes.",
        "The precision budget is comfortable here: the largest product coefficient is bounded by (n + 1) * 10^4 * 10^4, about 10^13, which llround still recovers exactly at transform length 2^18. Had the coefficients been 10^9 instead, this exact code would start returning off-by-one answers and limb splitting or NTT would be mandatory.",
        "Time: O(T * n log n). Space: O(n).",
      ],
    },
    {
      name: "Very Fast Multiplication",
      difficulty: "Medium",
      variation: "Base-10^4 limbs for precision control",
      link: "https://www.spoj.com/problems/VFMUL/",
      question: [
        "The first line contains the number of test cases T. Each of the next T lines contains two non-negative integers separated by a space, each with up to 300000 decimal digits. For each test case print the product of the two numbers on its own line.",
        "Example 1:\nInput:\n2\n123 456\n2 3\nOutput:\n56088\n6",
        "Example 2:\nInput:\n1\n99999 99999\nOutput: 9999800001\nExplanation: 99999^2 = 9999800001.",
        "Constraints:\n- 1 <= T <= 10\n- Each operand has between 1 and 300000 decimal digits and no leading zeros",
      ],
      code: `using cd = complex<double>;

void fft(vector<cd>& a, bool invert) {
    int n = a.size();
    for (int i = 1, j = 0; i < n; i++) {
        int bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) swap(a[i], a[j]);
    }
    for (int len = 2; len <= n; len <<= 1) {
        double ang = 2 * acos(-1.0) / len * (invert ? -1 : 1);
        cd wlen(cos(ang), sin(ang));
        for (int i = 0; i < n; i += len) {
            cd w(1);
            for (int j = 0; j < len / 2; j++) {
                cd u = a[i + j], v = a[i + j + len / 2] * w;
                a[i + j] = u + v;
                a[i + j + len / 2] = u - v;
                w *= wlen;
            }
        }
    }
    if (invert) for (cd& x : a) x /= n;
}

vector<long long> convolve(const vector<long long>& a, const vector<long long>& b) {
    if (a.empty() || b.empty()) return {};
    int need = (int)a.size() + (int)b.size() - 1;
    int n = 1;
    while (n < need) n <<= 1;
    vector<cd> fa(n), fb(n);
    for (size_t i = 0; i < a.size(); i++) fa[i] = (double)a[i];
    for (size_t i = 0; i < b.size(); i++) fb[i] = (double)b[i];
    fft(fa, false);
    fft(fb, false);
    for (int i = 0; i < n; i++) fa[i] *= fb[i];
    fft(fa, true);
    vector<long long> res(need);
    for (int i = 0; i < need; i++) res[i] = llround(fa[i].real());
    return res;
}

// split a decimal string into little-endian limbs of 4 digits, i.e. base 10^4
vector<long long> pack(const string& s) {
    vector<long long> v;
    for (int i = (int)s.size(); i > 0; i -= 4) {
        int start = max(0, i - 4);
        long long cur = 0;
        for (int j = start; j < i; j++) cur = cur * 10 + (s[j] - '0');
        v.push_back(cur);
    }
    return v;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int T;
    if (!(cin >> T)) return 0;
    while (T--) {
        string x, y;
        cin >> x >> y;
        vector<long long> c = convolve(pack(x), pack(y));
        vector<long long> limbs;
        long long carry = 0;
        for (size_t i = 0; i < c.size(); i++) {
            long long cur = c[i] + carry;
            limbs.push_back(cur % 10000);
            carry = cur / 10000;
        }
        while (carry > 0) {
            limbs.push_back(carry % 10000);
            carry /= 10000;
        }
        while (limbs.size() > 1 && limbs.back() == 0) limbs.pop_back();
        string out = to_string(limbs.back());
        for (int i = (int)limbs.size() - 2; i >= 0; i--) {
            string piece = to_string(limbs[i]);
            out += string(4 - piece.size(), '0') + piece; // pad interior limbs
        }
        cout << out << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Packing four decimal digits per limb shortens the transform by a factor of four: 300000 digits become 75000 limbs, so the transform length drops from 2^20 to 2^18. That is both faster and, counter-intuitively, still safe.",
        "Safety is the real design decision here. A product coefficient is bounded by (number of limbs) * (base - 1)^2, about 75000 * 10^8 = 7.5 * 10^12, and a double has 53 bits of mantissa, roughly 9 * 10^15 of exact integer range, leaving three orders of magnitude of slack for accumulated rounding. Packing eight digits per limb would push coefficients past 10^20 and produce silently wrong digits - the classic way this problem fails.",
        "After convolution the limb vector is normalised with a single carry sweep in base 10^4, then printed most-significant limb first. Every interior limb must be zero-padded to exactly four characters; forgetting the padding is the second classic bug, and it only shows up when some middle limb happens to be small.",
        "Time: O(d log d) per test with d the digit count. Space: O(d).",
      ],
    },
    {
      name: "Convolution (AtCoder Library Practice Contest F)",
      difficulty: "Medium",
      variation: "Exact convolution modulo 998244353 via NTT",
      link: "https://atcoder.jp/contests/practice2/tasks/practice2_f",
      question: [
        "You are given two sequences a of length n and b of length m, whose entries are integers modulo 998244353. Compute their convolution c, where c[i] = sum over j of a[j] * b[i-j], with every value reduced modulo 998244353. Print c[0] .. c[n+m-2] separated by spaces.",
        "Example 1:\nInput:\n2 3\n1 2\n1 2 4\nOutput: 1 4 8 8\nExplanation: (1 + 2x)(1 + 2x + 4x^2) = 1 + 4x + 8x^2 + 8x^3.",
        "Example 2:\nInput:\n1 1\n998244352\n2\nOutput: 998244351\nExplanation: 998244352 * 2 = 1996488704, and 1996488704 - 998244353 = 998244351.",
        "Constraints:\n- 1 <= n, m <= 5 * 10^5\n- 0 <= a[i], b[i] < 998244353",
      ],
      code: `const long long MOD = 998244353;

long long pw(long long b, long long e) {
    long long r = 1;
    b %= MOD;
    while (e > 0) {
        if (e & 1) r = r * b % MOD;
        b = b * b % MOD;
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
        // 3 is a primitive root of 998244353, so this is a primitive len-th root
        long long wlen = pw(3, (MOD - 1) / len);
        if (invert) wlen = pw(wlen, MOD - 2);
        for (int i = 0; i < n; i += len) {
            long long w = 1;
            for (int j = 0; j < len / 2; j++) {
                long long u = a[i + j];
                long long v = a[i + j + len / 2] * w % MOD;
                a[i + j] = (u + v) % MOD;
                a[i + j + len / 2] = (u - v + MOD) % MOD;
                w = w * wlen % MOD;
            }
        }
    }
    if (invert) {
        long long ninv = pw(n, MOD - 2);
        for (long long& x : a) x = x * ninv % MOD;
    }
}

vector<long long> convolveMod(vector<long long> a, vector<long long> b) {
    int need = (int)a.size() + (int)b.size() - 1;
    int n = 1;
    while (n < need) n <<= 1;
    a.resize(n, 0);
    b.resize(n, 0);
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
    for (int i = 0; i < n; i++) cin >> a[i];
    for (int i = 0; i < m; i++) cin >> b[i];
    vector<long long> c = convolveMod(a, b);
    for (int i = 0; i < (int)c.size(); i++) {
        cout << c[i];
        if (i + 1 < (int)c.size()) cout << ' ';
    }
    cout << "\\n";
    return 0;
}`,
      explanation: [
        "Complex FFT is hopeless here: entries near 10^9 give product coefficients near 5 * 10^5 * 10^18, far past what a double can round back correctly. The fix is to run the identical butterfly network in a finite field instead of in the complex numbers.",
        "All the FFT needs is a primitive n-th root of unity for n a power of two. The prime 998244353 equals 119 * 2^23 + 1, so its multiplicative group has order divisible by 2^23, and pw(3, (MOD-1)/len) is a primitive len-th root for every power of two len up to 2^23. Every complex operation becomes a modular one, the division by n becomes multiplication by the modular inverse of n, and the result is exact - no rounding exists to go wrong.",
        "The consequence to remember is the transform-length ceiling: this modulus supports lengths only up to 2^23. Exceeding it, or working under a modulus like 10^9 + 7 that has no large power-of-two factor in p - 1, forces either three NTT-friendly primes combined by CRT or the split-input trick.",
        "Time: O((n + m) log(n + m)). Space: O(n + m).",
      ],
    },
    {
      name: "Substring 2",
      difficulty: "Medium",
      variation: "Hamming distance of every alignment",
      link: "https://atcoder.jp/contests/abc196/tasks/abc196_f",
      question: [
        "You are given two binary strings S and T with |T| <= |S|. You may choose any contiguous substring of S whose length equals |T| and then flip characters inside it. Print the minimum number of flips needed so that the chosen substring becomes exactly T, minimised over every choice of substring.",
        "Example 1:\nInput:\n0001\n101\nOutput: 1\nExplanation: The substring starting at index 1 is '001'; flipping its first character gives '101', so one flip suffices.",
        "Example 2:\nInput:\n0101\n01\nOutput: 0\nExplanation: The substring '01' already appears at index 0.",
        "Constraints:\n- 1 <= |T| <= |S| <= 10^6\n- S and T consist only of the characters 0 and 1",
      ],
      code: `using cd = complex<double>;

void fft(vector<cd>& a, bool invert) {
    int n = a.size();
    for (int i = 1, j = 0; i < n; i++) {
        int bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) swap(a[i], a[j]);
    }
    for (int len = 2; len <= n; len <<= 1) {
        double ang = 2 * acos(-1.0) / len * (invert ? -1 : 1);
        cd wlen(cos(ang), sin(ang));
        for (int i = 0; i < n; i += len) {
            cd w(1);
            for (int j = 0; j < len / 2; j++) {
                cd u = a[i + j], v = a[i + j + len / 2] * w;
                a[i + j] = u + v;
                a[i + j + len / 2] = u - v;
                w *= wlen;
            }
        }
    }
    if (invert) for (cd& x : a) x /= n;
}

vector<long long> convolve(const vector<long long>& a, const vector<long long>& b) {
    if (a.empty() || b.empty()) return {};
    int need = (int)a.size() + (int)b.size() - 1;
    int n = 1;
    while (n < need) n <<= 1;
    vector<cd> fa(n), fb(n);
    for (size_t i = 0; i < a.size(); i++) fa[i] = (double)a[i];
    for (size_t i = 0; i < b.size(); i++) fb[i] = (double)b[i];
    fft(fa, false);
    fft(fb, false);
    for (int i = 0; i < n; i++) fa[i] *= fb[i];
    fft(fa, true);
    vector<long long> res(need);
    for (int i = 0; i < need; i++) res[i] = llround(fa[i].real());
    return res;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s, t;
    cin >> s >> t;
    int n = s.size(), m = t.size();
    vector<long long> a1(n), a0(n), b0(m), b1(m);
    for (int i = 0; i < n; i++) {
        a1[i] = (s[i] == '1');
        a0[i] = (s[i] == '0');
    }
    // T is reversed so that index i + m - 1 of the convolution is alignment i
    for (int j = 0; j < m; j++) {
        b0[j] = (t[m - 1 - j] == '0');
        b1[j] = (t[m - 1 - j] == '1');
    }
    vector<long long> c1 = convolve(a1, b0); // S has 1 where T has 0
    vector<long long> c0 = convolve(a0, b1); // S has 0 where T has 1
    long long best = LLONG_MAX;
    for (int i = 0; i + m <= n; i++) best = min(best, c1[i + m - 1] + c0[i + m - 1]);
    cout << best << "\\n";
    return 0;
}`,
      explanation: [
        "The number of flips for alignment i is the Hamming distance between S[i..i+m-1] and T, and for a binary alphabet that distance splits into two independent counts: positions where S is 1 while T is 0, plus positions where S is 0 while T is 1. Each count is a correlation, not a convolution.",
        "Reversing T converts the correlation into a convolution. With b[j] = indicator of T[m-1-j], the term sum over j of a[i+j] * b[m-1-j] lands exactly at output index i + m - 1, so one convolution gives the count for every alignment simultaneously. Getting this offset wrong by one is the single most common bug in FFT string matching, and it is worth checking on a two-character example before trusting the code.",
        "The tempting wrong approach is to slide a window and recompute, which is O(n * m) and times out at 10^6 by six orders of magnitude. A larger alphabet does not break the idea, it just costs one convolution per character rather than two - which is exactly what the next problems exploit.",
        "Precision is safe: coefficients are counts bounded by 10^6, tiny compared to the double mantissa even at transform length 2^21.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Fuzzy Search",
      difficulty: "Hard",
      variation: "Approximate matching with per-character indicator masks",
      link: "https://codeforces.com/problemset/problem/528/D",
      question: [
        "You are given a string S of length n and a string T of length m over the alphabet {A, T, G, C}, plus an integer k. T is said to occur at position i of S (0-indexed) if for every j the character T[j] appears somewhere in S within the index window [i + j - k, i + j + k], clipped to the bounds of S. Count how many positions i admit an occurrence of T.",
        "Example 1:\nInput:\n10 4 1\nAGCAATTCAT\nACAT\nOutput: 3\nExplanation: Occurrences start at positions 1, 2 and 5. At position 0 the final T of the pattern has no T of S within distance 1 of index 3, so it fails.",
        "Example 2:\nInput:\n3 1 0\nAAA\nA\nOutput: 3\nExplanation: With k = 0 this is exact matching, and A occurs at all three positions.",
        "Constraints:\n- 1 <= |T| <= |S| <= 2 * 10^5\n- 0 <= k <= |S|\n- Both strings consist only of the characters A, T, G, C",
      ],
      code: `using cd = complex<double>;

void fft(vector<cd>& a, bool invert) {
    int n = a.size();
    for (int i = 1, j = 0; i < n; i++) {
        int bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) swap(a[i], a[j]);
    }
    for (int len = 2; len <= n; len <<= 1) {
        double ang = 2 * acos(-1.0) / len * (invert ? -1 : 1);
        cd wlen(cos(ang), sin(ang));
        for (int i = 0; i < n; i += len) {
            cd w(1);
            for (int j = 0; j < len / 2; j++) {
                cd u = a[i + j], v = a[i + j + len / 2] * w;
                a[i + j] = u + v;
                a[i + j + len / 2] = u - v;
                w *= wlen;
            }
        }
    }
    if (invert) for (cd& x : a) x /= n;
}

vector<long long> convolve(const vector<long long>& a, const vector<long long>& b) {
    if (a.empty() || b.empty()) return {};
    int need = (int)a.size() + (int)b.size() - 1;
    int n = 1;
    while (n < need) n <<= 1;
    vector<cd> fa(n), fb(n);
    for (size_t i = 0; i < a.size(); i++) fa[i] = (double)a[i];
    for (size_t i = 0; i < b.size(); i++) fb[i] = (double)b[i];
    fft(fa, false);
    fft(fb, false);
    for (int i = 0; i < n; i++) fa[i] *= fb[i];
    fft(fa, true);
    vector<long long> res(need);
    for (int i = 0; i < need; i++) res[i] = llround(fa[i].real());
    return res;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m, k;
    cin >> n >> m >> k;
    string s, t;
    cin >> s >> t;
    string alphabet = "ATGC";
    vector<long long> total(n + m, 0);
    for (char c : alphabet) {
        vector<int> pre(n + 1, 0);
        for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + (s[i] == c);
        vector<long long> a(n), b(m);
        for (int i = 0; i < n; i++) {
            int lo = max(0, i - k), hi = min(n - 1, i + k);
            a[i] = (pre[hi + 1] - pre[lo] > 0) ? 1 : 0; // c is near index i
        }
        for (int j = 0; j < m; j++) b[j] = (t[m - 1 - j] == c) ? 1 : 0;
        vector<long long> r = convolve(a, b);
        for (size_t i = 0; i < r.size(); i++) total[i] += r[i];
    }
    int ans = 0;
    for (int i = 0; i + m <= n; i++) {
        if (total[i + m - 1] == m) ans++;
    }
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "The fuzziness is removed before any matching happens. For each character c, build the mask a_c where a_c[i] = 1 if c occurs in S somewhere within distance k of index i; a prefix-count array answers each such window query in O(1). After that, position i + j of S 'accepts' T[j] precisely when a_{T[j]}[i+j] = 1, which is an ordinary exact-match condition on masks.",
        "Now correlate: for each of the four characters, convolve a_c with the reversed indicator of c in T. Output index i + m - 1 accumulates, over all c, the number of pattern positions j whose character is satisfied at alignment i. Each j contributes to exactly one character's convolution, so the total is at most m and equals m if and only if every position is satisfied - the score-equals-length test that makes the whole family of FFT matching problems work.",
        "The wrong-but-tempting shortcut is to treat 'within distance k' as a per-position relaxation applied to the pattern, or to reuse a single merged mask across characters. Both lose the information about which character was matched and overcount. Note also that the masks are built on S and never on T: the tolerance is defined by where characters occur in S.",
        "Time: O(sigma * n log n) with sigma = 4. Space: O(n + m).",
      ],
    },
    {
      name: "Yet Another String Matching Problem",
      difficulty: "Hard",
      variation: "Character-pair convolutions plus DSU per alignment",
      link: "https://codeforces.com/problemset/problem/954/I",
      question: [
        "You are given strings S and T over the alphabet of the first six lowercase letters, with |T| <= |S|. One operation picks two letters x and y and replaces every occurrence of x in both strings by y. For each substring of S of length |T|, taken left to right, print the minimum number of operations needed to make that substring equal to T.",
        "Example 1:\nInput:\naabbc\nab\nOutput: 1 0 1 2\nExplanation: 'aa' vs 'ab' needs a merged with b, one operation. 'ab' vs 'ab' needs none. 'bb' vs 'ab' needs b merged with a, one operation. 'bc' vs 'ab' forces a, b and c into one class, which costs two operations.",
        "Example 2:\nInput:\nabc\na\nOutput: 0 1 1\nExplanation: Each single character either already equals a or must be merged with it.",
        "Constraints:\n- 1 <= |T| <= |S| <= 125000\n- Both strings consist only of the letters a through f",
      ],
      code: `using cd = complex<double>;

void fft(vector<cd>& a, bool invert) {
    int n = a.size();
    for (int i = 1, j = 0; i < n; i++) {
        int bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) swap(a[i], a[j]);
    }
    for (int len = 2; len <= n; len <<= 1) {
        double ang = 2 * acos(-1.0) / len * (invert ? -1 : 1);
        cd wlen(cos(ang), sin(ang));
        for (int i = 0; i < n; i += len) {
            cd w(1);
            for (int j = 0; j < len / 2; j++) {
                cd u = a[i + j], v = a[i + j + len / 2] * w;
                a[i + j] = u + v;
                a[i + j + len / 2] = u - v;
                w *= wlen;
            }
        }
    }
    if (invert) for (cd& x : a) x /= n;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s, t;
    cin >> s >> t;
    int n = s.size(), m = t.size();
    int sz = 1;
    while (sz < n + m) sz <<= 1;
    vector<vector<cd>> FA(6, vector<cd>(sz)), FB(6, vector<cd>(sz));
    for (int c = 0; c < 6; c++) {
        for (int i = 0; i < n; i++) FA[c][i] = (s[i] - 'a' == c) ? 1.0 : 0.0;
        for (int j = 0; j < m; j++) FB[c][j] = (t[m - 1 - j] - 'a' == c) ? 1.0 : 0.0;
        fft(FA[c], false);
        fft(FB[c], false);
    }
    int cnt = n - m + 1;
    vector<int> conflict(cnt, 0);
    vector<pair<int,int>> pairs;
    int pid = 0;
    for (int c = 0; c < 6; c++) {
        for (int d = c + 1; d < 6; d++) {
            vector<cd> f(sz);
            // both orientations share one inverse transform
            for (int i = 0; i < sz; i++) f[i] = FA[c][i] * FB[d][i] + FA[d][i] * FB[c][i];
            fft(f, true);
            for (int i = 0; i < cnt; i++) {
                if (llround(f[i + m - 1].real()) > 0) conflict[i] |= (1 << pid);
            }
            pairs.push_back({c, d});
            pid++;
        }
    }
    for (int i = 0; i < cnt; i++) {
        int par[6];
        for (int c = 0; c < 6; c++) par[c] = c;
        int ops = 0;
        for (int p = 0; p < (int)pairs.size(); p++) {
            if (!((conflict[i] >> p) & 1)) continue;
            int a = pairs[p].first, b = pairs[p].second;
            while (par[a] != a) a = par[a];
            while (par[b] != b) b = par[b];
            if (a != b) {
                par[a] = b;
                ops++;
            }
        }
        cout << ops << " \\n"[i == cnt - 1];
    }
    return 0;
}`,
      explanation: [
        "The operation is global replacement, so it does not matter where two letters clash, only which letters clash. For a fixed alignment, collect the set of unordered pairs {x, y} such that some position has x in S and y in T. Those pairs must end up in the same equivalence class, and merging a class of size c costs exactly c - 1 operations, so the answer is 6 minus the number of components of the graph on six letters with those pairs as edges.",
        "Detecting the pairs is the FFT part. For each of the 15 unordered pairs there are two orientations - x in S against y in T, and y in S against x in T - and each is a correlation solved by convolving the letter indicator of S with the reversed letter indicator of T. Because the DFT is linear, the two orientations can be added in the frequency domain and share one inverse transform, so 12 forward and 15 inverse transforms suffice instead of 60.",
        "Only whether a coefficient is nonzero matters, never its value, so the 15 results are compressed into a bitmask per alignment and the actual union-find runs on six elements - constant work per alignment. That is what keeps the second phase at O(n) rather than O(n * alphabet^2).",
        "The trap is to answer with the number of clashing pairs, or to run a DSU per position from scratch over the whole substring. The first overcounts whenever pairs share a letter, as in 'bc' against 'ab' above, where two clashes cost two operations only because they chain into one class of three; three pairwise clashes among three letters would also cost two, not three.",
        "Time: O(sigma^2 * n log n) with sigma = 6 folded into constants, so O(n log n) transforms plus O(n) union-find. Space: O(sigma * n).",
      ],
    },
    {
      name: "Nikita and Order Statistics",
      difficulty: "Hard",
      variation: "Self-convolution of a prefix-count histogram",
      link: "https://codeforces.com/problemset/problem/993/E",
      question: [
        "You are given an array a of n integers and an integer x. For every k from 0 to n, count the number of non-empty contiguous subarrays of a that contain exactly k elements strictly less than x. Print the n + 1 counts separated by spaces.",
        "Example 1:\nInput:\n5 3\n1 2 3 4 5\nOutput: 6 5 4 0 0 0\nExplanation: The elements below 3 are a[0] and a[1]. The prefix counts of such elements are 0, 1, 2, 2, 2, 2. Six index pairs share a prefix count, giving the six subarrays with k = 0; five pairs differ by one and four differ by two.",
        "Example 2:\nInput:\n2 6\n-5 9\nOutput: 1 2 0\nExplanation: Only a[0] is below 6. The subarray [9] has k = 0, while [-5] and [-5, 9] each have k = 1.",
        "Constraints:\n- 1 <= n <= 2 * 10^5\n- -10^9 <= a[i], x <= 10^9",
      ],
      code: `using cd = complex<double>;

void fft(vector<cd>& a, bool invert) {
    int n = a.size();
    for (int i = 1, j = 0; i < n; i++) {
        int bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) swap(a[i], a[j]);
    }
    for (int len = 2; len <= n; len <<= 1) {
        double ang = 2 * acos(-1.0) / len * (invert ? -1 : 1);
        cd wlen(cos(ang), sin(ang));
        for (int i = 0; i < n; i += len) {
            cd w(1);
            for (int j = 0; j < len / 2; j++) {
                cd u = a[i + j], v = a[i + j + len / 2] * w;
                a[i + j] = u + v;
                a[i + j + len / 2] = u - v;
                w *= wlen;
            }
        }
    }
    if (invert) for (cd& x : a) x /= n;
}

vector<long long> convolve(const vector<long long>& a, const vector<long long>& b) {
    if (a.empty() || b.empty()) return {};
    int need = (int)a.size() + (int)b.size() - 1;
    int n = 1;
    while (n < need) n <<= 1;
    vector<cd> fa(n), fb(n);
    for (size_t i = 0; i < a.size(); i++) fa[i] = (double)a[i];
    for (size_t i = 0; i < b.size(); i++) fb[i] = (double)b[i];
    fft(fa, false);
    fft(fb, false);
    for (int i = 0; i < n; i++) fa[i] *= fb[i];
    fft(fa, true);
    vector<long long> res(need);
    for (int i = 0; i < need; i++) res[i] = llround(fa[i].real());
    return res;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    long long x;
    cin >> n >> x;
    vector<long long> cnt(n + 1, 0);
    int p = 0;
    cnt[0] = 1; // the empty prefix
    for (int i = 0; i < n; i++) {
        long long v;
        cin >> v;
        if (v < x) p++;
        cnt[p]++;
    }
    long long zero = 0;
    for (int v = 0; v <= n; v++) zero += cnt[v] * (cnt[v] - 1) / 2;
    vector<long long> b(n + 1);
    for (int j = 0; j <= n; j++) b[j] = cnt[n - j]; // reversed histogram
    vector<long long> c = convolve(cnt, b);
    cout << zero;
    for (int k = 1; k <= n; k++) cout << ' ' << c[n - k];
    cout << "\\n";
    return 0;
}`,
      explanation: [
        "Replace each element by 1 if it is below x and 0 otherwise, and let p[0..n] be the prefix sums. A subarray (l, r] contains exactly k marked elements iff p[r] - p[l] = k with l < r. So the whole question becomes: for each k, how many ordered pairs of prefix indices differ by exactly k in value.",
        "Build the histogram cnt[v] = number of indices with prefix value v. For k >= 1 the answer is sum over v of cnt[v] * cnt[v+k], which is precisely a correlation of cnt with itself - one convolution with the histogram reversed produces all n answers at once, with offset k read at output index n - k. The condition l < r comes for free: p is non-decreasing, so p[l] < p[r] already forces l < r.",
        "k = 0 must be handled separately and is where most wrong submissions land. The convolution term for k = 0 would count every ordered pair including l = r, so instead sum C(cnt[v], 2) over v, choosing two distinct indices with equal prefix value.",
        "Counts reach about n^2 / 2 = 2 * 10^10, so the accumulators must be 64-bit. That magnitude is still well inside a double's exact-integer range at transform length 2^19, so plain complex FFT rounds correctly; a problem with counts near 10^16 would need NTT instead.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Thief in a Shop",
      difficulty: "Hard",
      variation: "Polynomial exponentiation with 0/1 clamping",
      link: "https://codeforces.com/problemset/problem/632/E",
      question: [
        "A shop has n kinds of items, the i-th kind costing a[i]. A thief must take exactly k items, and may take the same kind any number of times. Print, in increasing order, every distinct total cost that can be obtained.",
        "Example 1:\nInput:\n3 2\n1 2 3\nOutput: 2 3 4 5 6\nExplanation: The multisets of size two give sums 1+1=2, 1+2=3, 1+3=4, 2+2=4, 2+3=5 and 3+3=6.",
        "Example 2:\nInput:\n5 5\n1 1 1 1 1\nOutput: 5\nExplanation: Every item costs 1, so the only reachable total is 5.",
        "Constraints:\n- 1 <= n, k <= 1000\n- 1 <= a[i] <= 1000",
      ],
      code: `using cd = complex<double>;

void fft(vector<cd>& a, bool invert) {
    int n = a.size();
    for (int i = 1, j = 0; i < n; i++) {
        int bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) swap(a[i], a[j]);
    }
    for (int len = 2; len <= n; len <<= 1) {
        double ang = 2 * acos(-1.0) / len * (invert ? -1 : 1);
        cd wlen(cos(ang), sin(ang));
        for (int i = 0; i < n; i += len) {
            cd w(1);
            for (int j = 0; j < len / 2; j++) {
                cd u = a[i + j], v = a[i + j + len / 2] * w;
                a[i + j] = u + v;
                a[i + j + len / 2] = u - v;
                w *= wlen;
            }
        }
    }
    if (invert) for (cd& x : a) x /= n;
}

// multiply, then keep only reachability: any nonzero coefficient becomes 1
vector<char> mulClamp(const vector<char>& a, const vector<char>& b, int lim) {
    int need = (int)a.size() + (int)b.size() - 1;
    int n = 1;
    while (n < need) n <<= 1;
    vector<cd> fa(n), fb(n);
    for (size_t i = 0; i < a.size(); i++) fa[i] = (double)a[i];
    for (size_t i = 0; i < b.size(); i++) fb[i] = (double)b[i];
    fft(fa, false);
    fft(fb, false);
    for (int i = 0; i < n; i++) fa[i] *= fb[i];
    fft(fa, true);
    int keep = min(need, lim + 1);
    vector<char> res(keep, 0);
    for (int i = 0; i < keep; i++) {
        if (llround(fa[i].real()) > 0) res[i] = 1;
    }
    return res;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, k;
    cin >> n >> k;
    int mx = 0;
    vector<int> a(n);
    for (int i = 0; i < n; i++) {
        cin >> a[i];
        mx = max(mx, a[i]);
    }
    vector<char> base(mx + 1, 0);
    for (int i = 0; i < n; i++) base[a[i]] = 1;
    int lim = k * mx;
    vector<char> res(1, 1); // the constant polynomial 1
    int e = k;
    while (e > 0) {
        if (e & 1) res = mulClamp(res, base, lim);
        e >>= 1;
        if (e > 0) base = mulClamp(base, base, lim);
    }
    bool first = true;
    for (int i = 0; i < (int)res.size(); i++) {
        if (!res[i]) continue;
        if (!first) cout << ' ';
        cout << i;
        first = false;
    }
    cout << "\\n";
    return 0;
}`,
      explanation: [
        "Encode the price list as a polynomial P with a 1 at exponent a[i] for each available price. Then the coefficient of x^s in P^k is the number of ordered ways to pick k items summing to s, so s is achievable exactly when that coefficient is nonzero. Raise P to the k-th power by binary exponentiation: about 2 log k convolutions rather than k of them.",
        "The counts themselves overflow anything - up to 1000^1000 ways - which is why every intermediate polynomial is clamped back to 0/1 after each multiplication. Clamping is sound because reachability is all that is asked and it is preserved under multiplication: a product coefficient is nonzero iff some pair of nonzero factors lands on it, regardless of the actual magnitudes. It is also what keeps the FFT numerically valid, since clamped coefficients keep every product coefficient below about 10^6.",
        "Truncating to lim = k * mx at every step matters as much as clamping: without it the degree doubles each squaring and the transforms grow past any reasonable budget, even though no exponent above k * mx can ever contribute to the answer.",
        "The naive alternative is a knapsack over (items taken, sum) which is O(n * k * maxSum) and far too slow; the FFT version replaces the item loop entirely. The subtle rule is that exponents add while the exactly-k constraint is carried by the power itself, so nothing needs to track how many items were used.",
        "Time: O(k * mx * log(k * mx) * log k). Space: O(k * mx).",
      ],
    },
    {
      name: "Lucky Tickets",
      difficulty: "Hard",
      variation: "Polynomial power under NTT, sum of squared coefficients",
      link: "https://codeforces.com/problemset/problem/1096/G",
      question: [
        "A ticket is a string of n digits, where n is even, and every digit must come from a given set of k allowed digits. A ticket is lucky if the sum of its first n/2 digits equals the sum of its last n/2 digits. Count the lucky tickets modulo 998244353. Leading zeros are allowed.",
        "Example 1:\nInput:\n4 2\n1 8\nOutput: 6\nExplanation: Each half is two digits from {1, 8}, giving half-sums 2, 9, 9 and 16. Sum 2 occurs once, sum 9 twice and sum 16 once, so the pairs of matching halves number 1 + 4 + 1 = 6.",
        "Example 2:\nInput:\n20 1\n6\nOutput: 1\nExplanation: Only one ticket exists at all, and its halves are equal.",
        "Constraints:\n- 2 <= n <= 2 * 10^5 and n is even\n- 1 <= k <= 10\n- The allowed digits are distinct values in 0..9",
      ],
      code: `const long long MOD = 998244353;

long long pw(long long b, long long e) {
    long long r = 1;
    b %= MOD;
    while (e > 0) {
        if (e & 1) r = r * b % MOD;
        b = b * b % MOD;
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
        long long wlen = pw(3, (MOD - 1) / len);
        if (invert) wlen = pw(wlen, MOD - 2);
        for (int i = 0; i < n; i += len) {
            long long w = 1;
            for (int j = 0; j < len / 2; j++) {
                long long u = a[i + j];
                long long v = a[i + j + len / 2] * w % MOD;
                a[i + j] = (u + v) % MOD;
                a[i + j + len / 2] = (u - v + MOD) % MOD;
                w = w * wlen % MOD;
            }
        }
    }
    if (invert) {
        long long ninv = pw(n, MOD - 2);
        for (long long& x : a) x = x * ninv % MOD;
    }
}

vector<long long> polymul(vector<long long> a, vector<long long> b, int lim) {
    int need = (int)a.size() + (int)b.size() - 1;
    int n = 1;
    while (n < need) n <<= 1;
    a.resize(n, 0);
    b.resize(n, 0);
    ntt(a, false);
    ntt(b, false);
    for (int i = 0; i < n; i++) a[i] = a[i] * b[i] % MOD;
    ntt(a, true);
    a.resize(min(need, lim + 1)); // no larger half-sum can ever matter
    return a;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, k;
    cin >> n >> k;
    int mx = 0;
    vector<long long> base(10, 0);
    for (int i = 0; i < k; i++) {
        int d;
        cin >> d;
        base[d] = 1;
        mx = max(mx, d);
    }
    base.resize(mx + 1);
    int half = n / 2;
    int lim = half * mx;
    vector<long long> res(1, 1);
    int e = half;
    while (e > 0) {
        if (e & 1) res = polymul(res, base, lim);
        e >>= 1;
        if (e > 0) base = polymul(base, base, lim);
    }
    long long ans = 0;
    for (size_t i = 0; i < res.size(); i++) ans = (ans + res[i] * res[i]) % MOD;
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "Let P(x) = sum of x^d over the allowed digits d. Then the coefficient of x^s in Q = P^(n/2) counts the half-strings of length n/2 whose digits sum to s. The two halves are chosen independently, so the number of lucky tickets is the sum over s of Q[s]^2 - a single dot product once Q is known.",
        "Q is computed by binary exponentiation, roughly 2 log(n/2) convolutions. The maximum reachable half-sum is (n/2) * maxDigit <= 9 * 10^5, so every intermediate is truncated to that degree; without truncation the working degree would keep doubling for no benefit.",
        "This must be NTT, not complex FFT. Coefficients are genuine counts modulo 998244353, i.e. arbitrary residues up to about 10^9, and their products would exceed the exact range of a double immediately. The modulus is chosen precisely because 998244353 - 1 is divisible by 2^23, which supplies the power-of-two roots of unity the transform needs.",
        "One boundary case is worth checking: if the only allowed digit is 0 then mx = 0, the polynomial is the constant 1, lim = 0, and the answer is correctly 1. Squaring residues also needs 64-bit intermediates before the reduction.",
        "Time: O(n * maxDigit * log(n * maxDigit) * log n). Space: O(n * maxDigit).",
      ],
    },
    {
      name: "Triple Sums",
      difficulty: "Hard",
      variation: "Cubing with inclusion-exclusion for distinct indices",
      link: "https://www.spoj.com/problems/TSUM/",
      question: [
        "The first line contains an integer N, followed by N distinct integers, one per line. For every value s that can be written as the sum of three distinct elements of the input, print s followed by the number of unordered triples achieving it, as a line of the form 's : count', in increasing order of s.",
        "Example 1:\nInput:\n5\n1\n2\n3\n4\n5\nOutput:\n6 : 1\n7 : 1\n8 : 2\n9 : 2\n10 : 2\n11 : 1\n12 : 1\nExplanation: There are C(5,3) = 10 triples in total. Sum 8 comes from {1,2,5} and {1,3,4}; sum 9 from {1,3,5} and {2,3,4}; sum 10 from {1,4,5} and {2,3,5}.",
        "Example 2:\nInput:\n3\n-1\n0\n1\nOutput:\n0 : 1\nExplanation: The only triple is {-1, 0, 1}, summing to 0.",
        "Constraints:\n- 3 <= N <= 10^4\n- The N input values are distinct and each has absolute value at most 20000",
      ],
      code: `using cd = complex<double>;

void fft(vector<cd>& a, bool invert) {
    int n = a.size();
    for (int i = 1, j = 0; i < n; i++) {
        int bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) swap(a[i], a[j]);
    }
    for (int len = 2; len <= n; len <<= 1) {
        double ang = 2 * acos(-1.0) / len * (invert ? -1 : 1);
        cd wlen(cos(ang), sin(ang));
        for (int i = 0; i < n; i += len) {
            cd w(1);
            for (int j = 0; j < len / 2; j++) {
                cd u = a[i + j], v = a[i + j + len / 2] * w;
                a[i + j] = u + v;
                a[i + j + len / 2] = u - v;
                w *= wlen;
            }
        }
    }
    if (invert) for (cd& x : a) x /= n;
}

vector<long long> convolve(const vector<long long>& a, const vector<long long>& b) {
    if (a.empty() || b.empty()) return {};
    int need = (int)a.size() + (int)b.size() - 1;
    int n = 1;
    while (n < need) n <<= 1;
    vector<cd> fa(n), fb(n);
    for (size_t i = 0; i < a.size(); i++) fa[i] = (double)a[i];
    for (size_t i = 0; i < b.size(); i++) fb[i] = (double)b[i];
    fft(fa, false);
    fft(fb, false);
    for (int i = 0; i < n; i++) fa[i] *= fb[i];
    fft(fa, true);
    vector<long long> res(need);
    for (int i = 0; i < need; i++) res[i] = llround(fa[i].real());
    return res;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    if (!(cin >> n)) return 0;
    const int OFF = 20000;
    vector<long long> A(2 * OFF + 1, 0);          // exponent v + OFF
    vector<long long> B(4 * OFF + 1, 0);          // exponent 2v + 2*OFF
    vector<long long> C(6 * OFF + 1, 0);          // exponent 3v + 3*OFF
    for (int i = 0; i < n; i++) {
        int v;
        cin >> v;
        A[v + OFF] += 1;
        B[2 * v + 2 * OFF] += 1;
        C[3 * v + 3 * OFF] += 1;
    }
    vector<long long> A2 = convolve(A, A);
    vector<long long> A3 = convolve(A2, A);       // exponent sum + 3*OFF
    vector<long long> AB = convolve(A, B);        // exponent v1 + 2*v2 + 3*OFF
    int lim = 6 * OFF;
    for (int d = 0; d <= lim; d++) {
        long long total = A3[d];
        total -= 3 * AB[d];
        total += 2 * C[d];
        long long ways = total / 6;               // divides exactly
        if (ways > 0) cout << (d - 3 * OFF) << " : " << ways << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Let A(x) = sum of x^(v + OFF) over the input values, with the offset making all exponents non-negative so negative inputs can be handled at all. A^3 counts ordered triples of indices with repetition allowed, indexed by sum + 3 * OFF; the offset is uniform, so it just shifts the whole answer array.",
        "Removing repeats is pure inclusion-exclusion. With B(x) = sum of x^(2v + 2*OFF) and C(x) = sum of x^(3v + 3*OFF), the product A * B enumerates ordered triples in which a chosen index is used twice, and C those where one index is used three times. The count of ordered triples with three distinct indices is A^3 - 3*A*B + 2*C, and dividing by 3! = 6 gives unordered triples. Note that every one of A^3, A*B and C carries the same total offset 3 * OFF, which is why they can be combined index by index.",
        "The tempting mistake is to cube A and stop, which counts {1,1,4} style multisets that the problem forbids, and also counts each genuine triple six times. Attempting to subtract the duplicates afterwards by scanning sums is O(n^2) at best.",
        "Precision holds because a single coefficient of A^3 is at most about n^2 = 10^8, comfortably exact in a double at transform length 2^18, even though the coefficients sum to n^3 = 10^12. The division by 6 is exact by construction, so integer division is safe.",
        "Time: O(V log V) with V the value range, about 1.2 * 10^5. Space: O(V).",
      ],
    },
  ],
};
