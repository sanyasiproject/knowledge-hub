import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Pow(x, n)",
      difficulty: "Medium",
      variation: "Fast power template, negative exponent",
      link: "https://leetcode.com/problems/powx-n/",
      question: [
        "Implement pow(x, n), which computes x raised to the power n, where x is a double and n is a signed 32-bit integer. A negative exponent means the reciprocal of the positive power. You may not call the library pow.",
        "Example 1:\nInput: x = 2.00000, n = 10\nOutput: 1024.00000\nExplanation: 2^10 = 1024.",
        "Example 2:\nInput: x = 2.00000, n = -2\nOutput: 0.25000\nExplanation: 2^-2 = 1 / 2^2 = 1 / 4 = 0.25.",
        "Constraints:\n- -100.0 < x < 100.0\n- -2^31 <= n <= 2^31 - 1\n- either x is not 0 or n > 0\n- -10^4 <= x^n <= 10^4",
      ],
      code: `double myPow(double x, int n) {
    long long e = n;          // widen first: -n overflows when n == INT_MIN
    bool inverse = e < 0;
    if (inverse) e = -e;

    double result = 1.0, base = x;
    while (e > 0) {
        if (e & 1) result *= base;   // this bit of e is set, fold in the current square
        base *= base;                // base becomes x^(2^k) for the next bit
        e >>= 1;
    }
    return inverse ? 1.0 / result : result;
}`,
      explanation: [
        "Write the exponent in binary: e = sum of 2^k over the set bits. Then x^e is the product of x^(2^k) over exactly those k. The loop keeps base = x^(2^k) for the bit currently being inspected, squaring it each round, and multiplies it into the answer only when the bit is set. That is the entire pattern - everything else in this bank is a different multiplication operator plugged into the same skeleton.",
        "The invariant to hold in your head is result * base^e = x^(original e) at the top of every iteration. Squaring base while halving e preserves it, and folding base into result when the low bit is set removes that bit from e. When e hits 0 the invariant says result is the answer.",
        "The one real trap here is n = INT_MIN: -n does not fit in an int, so negating before widening silently keeps the value negative and the loop never runs. Copy into a long long first.",
        "The recursive form (x^e = (x^(e/2))^2, times x when e is odd) is the same algorithm; prefer the loop so you do not pay for log e stack frames. Note also that repeated squaring on doubles is not bit-identical to e-1 sequential multiplications - it is usually more accurate, since fewer multiplications means less accumulated rounding.",
        "Time: O(log e). Space: O(1).",
      ],
    },
    {
      name: "The Last Digit",
      difficulty: "Easy",
      variation: "Fast power under a tiny modulus",
      link: "https://www.spoj.com/problems/LASTDIG/",
      question: [
        "For each test case you are given two non-negative integers a and b. Print the last decimal digit of a^b. The first line of input holds the number of test cases t.",
        "Example 1:\nInput:\n3\n3 10\n6 2\n150 53\nOutput:\n9\n6\n0\nExplanation: 3^10 = 59049 ends in 9; 6^2 = 36 ends in 6; any power of 150 ends in 0.",
        "Constraints:\n- 1 <= t <= 30\n- 0 <= a <= 2 * 10^9\n- 0 <= b <= 2 * 10^9",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t;
    cin >> t;
    while (t--) {
        long long a, b;
        cin >> a >> b;
        long long res = 1, base = a % 10;   // only the last digit of a can matter
        while (b > 0) {
            if (b & 1) res = res * base % 10;
            base = base * base % 10;
            b >>= 1;
        }
        cout << res << "\\n";
    }
    return 0;
}`,
      explanation: [
        "The last digit of a product depends only on the last digits of the factors, so the whole computation can be carried out modulo 10 from the start. Reducing base to a % 10 immediately is what keeps every intermediate value single-digit and makes overflow impossible.",
        "This is the general fact that makes binary exponentiation useful: taking a remainder is a ring homomorphism, so (u * v) mod m = ((u mod m) * (v mod m)) mod m. Squaring under the modulus is therefore legal at every step, and the numbers never grow.",
        "Note that b can be 0, and the loop correctly returns 1 without executing once. Writing the answer as a special case for small b, or looping b times, is where this problem catches people - b reaches 2 * 10^9, so a linear loop is roughly two billion iterations while the binary one is about 31.",
        "The alternative here is to spot that last digits cycle with period dividing 4 and use b mod 4. That works for base 10 but does not generalise; the fast power does.",
        "Time: O(t log b). Space: O(1).",
      ],
    },
    {
      name: "Exponentiation",
      difficulty: "Easy",
      variation: "Modular fast power modulo a large prime",
      link: "https://cses.fi/problemset/task/1095",
      question: [
        "Your task is to efficiently calculate a^b modulo 10^9 + 7. The first line contains the number of test cases n, and each of the next n lines contains two integers a and b. Note that in this problem 0^0 is defined to be 1.",
        "Example 1:\nInput:\n3\n3 4\n2 8\n123 123\nOutput:\n81\n256\n921450052\nExplanation: 3^4 = 81 and 2^8 = 256 are below the modulus; 123^123 is a 258-digit number whose remainder modulo 10^9 + 7 is 921450052.",
        "Constraints:\n- 1 <= n <= 2 * 10^5\n- 0 <= a, b <= 10^9",
      ],
      code: `const long long MOD = 1000000007;

long long powmod(long long base, long long e, long long m) {
    long long res = 1 % m;          // 1 % m, not 1, so that m == 1 also works
    base %= m;
    while (e > 0) {
        if (e & 1) res = res * base % m;
        base = base * base % m;
        e >>= 1;
    }
    return res;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    while (n--) {
        long long a, b;
        cin >> a >> b;
        cout << powmod(a, b, MOD) << "\\n";   // b == 0 falls out as 1, matching 0^0 = 1
    }
    return 0;
}`,
      explanation: [
        "Identical skeleton to the previous problem with m = 10^9 + 7. This is the version worth memorising, because almost every counting problem with a 'modulo 10^9 + 7' clause eventually needs it.",
        "Types are the whole game. Both operands of the multiplication are already reduced, so each is below 10^9 + 7, and the product is below about 10^18 - which fits in a signed 64-bit integer (limit about 9.2 * 10^18) but overflows a 32-bit one after a single multiplication. Declaring base and res as int is the single most common way to get a wrong answer here.",
        "If the modulus itself can exceed roughly 3 * 10^9, the product no longer fits in 64 bits and you need __int128 for the multiply, or a Barrett or Montgomery reduction. That is exactly the situation in 64-bit Miller-Rabin and Pollard rho.",
        "0^0 = 1 is not a special case in the code: with e = 0 the loop body never runs and res stays 1. Adding an explicit branch for it is harmless but unnecessary.",
        "Time: O(n log b). Space: O(1).",
      ],
    },
    {
      name: "Count Good Numbers",
      difficulty: "Medium",
      variation: "Fast power as a counting shortcut",
      link: "https://leetcode.com/problems/count-good-numbers/",
      question: [
        "A digit string is good if the digits at even indices (0-indexed) are even (0, 2, 4, 6 or 8) and the digits at odd indices are prime (2, 3, 5 or 7). Given an integer n, return the number of good digit strings of length n, modulo 10^9 + 7. Leading zeros are allowed.",
        "Example 1:\nInput: n = 1\nOutput: 5\nExplanation: the good strings of length 1 are '0', '2', '4', '6' and '8'.",
        "Example 2:\nInput: n = 4\nOutput: 400\nExplanation: indices 0 and 2 have 5 choices each and indices 1 and 3 have 4 choices each, so 5 * 5 * 4 * 4 = 400.",
        "Example 3:\nInput: n = 50\nOutput: 564908303\nExplanation: 5^25 * 4^25 = 20^25, whose remainder modulo 10^9 + 7 is 564908303.",
        "Constraints:\n- 1 <= n <= 10^15",
      ],
      code: `class Solution {
    static const long long MOD = 1000000007;

    long long powmod(long long base, long long e) {
        long long res = 1;
        base %= MOD;
        while (e > 0) {
            if (e & 1) res = res * base % MOD;
            base = base * base % MOD;
            e >>= 1;
        }
        return res;
    }

public:
    int countGoodNumbers(long long n) {
        long long evenSlots = (n + 1) / 2;   // indices 0, 2, 4, ... - ceil(n/2) of them
        long long oddSlots = n / 2;
        return (int)(powmod(5, evenSlots) * powmod(4, oddSlots) % MOD);
    }
};`,
      explanation: [
        "The positions are independent, so the count is a plain product: 5 choices at each even index times 4 at each odd index. Counting the slots is the only place to slip - with 0-indexing there are ceil(n/2) even indices and floor(n/2) odd ones, so (n+1)/2 and n/2 in integer arithmetic.",
        "The reason this belongs to the fast-power pattern rather than to DP: n reaches 10^15, so you cannot loop over positions at all. Any problem whose answer is a closed-form product of fixed factors raised to a huge count reduces to one or two modular powers.",
        "The two powers are reduced separately and then multiplied once. That final product is at most about 10^18, which is why res must be a 64-bit type before the cast back to int.",
        "A tempting shortcut is powmod(20, n / 2) with a correction factor for odd n. It works, but keeping the two exponents explicit is harder to get wrong and costs nothing.",
        "Time: O(log n). Space: O(1).",
      ],
    },
    {
      name: "Modular Multiplicative Inverse (Fermat's Little Theorem)",
      difficulty: "Medium",
      variation: "Modular inverse via a^(p-2)",
      question: [
        "Given an integer a and a prime modulus m with a not divisible by m, find the modular multiplicative inverse of a under m: the unique value x in the range 0..m-1 such that (a * x) mod m = 1. Solve it using binary exponentiation rather than the extended Euclidean algorithm.",
        "Example 1:\nInput: a = 3, m = 11\nOutput: 4\nExplanation: 3 * 4 = 12 = 1 * 11 + 1, so 3 * 4 is congruent to 1 modulo 11.",
        "Example 2:\nInput: a = 10, m = 17\nOutput: 12\nExplanation: 10 * 12 = 120 = 7 * 17 + 1, so 10 * 12 is congruent to 1 modulo 17.",
        "Constraints:\n- 2 <= m <= 10^9 and m is prime\n- 1 <= a < m",
      ],
      code: `long long powmod(long long base, long long e, long long m) {
    long long res = 1 % m;
    base %= m;
    while (e > 0) {
        if (e & 1) res = res * base % m;
        base = base * base % m;
        e >>= 1;
    }
    return res;
}

// Requires m prime and a not a multiple of m.
long long modInverse(long long a, long long m) {
    return powmod(a, m - 2, m);   // a^(m-2) = a^(m-1) / a = 1 / a  (mod m)
}

// Dividing by a under a prime modulus: multiply by the inverse instead.
long long modDivide(long long p, long long q, long long m) {
    return p % m * modInverse(q, m) % m;
}`,
      explanation: [
        "Fermat's little theorem says a^(m-1) is congruent to 1 modulo a prime m whenever a is not a multiple of m. Splitting off one factor of a gives a * a^(m-2) congruent to 1, so a^(m-2) is by definition the inverse. One call to the fast power computes it.",
        "This is what makes division possible in modular arithmetic. There is no integer division modulo m - (p / q) mod m is meaningless in general - but p * q^(-1) mod m is well defined and is what every 'answer modulo 10^9 + 7' problem involving fractions actually computes.",
        "The primality requirement is not cosmetic. If m is composite, a^(m-2) is generally not the inverse; you need Euler's theorem with a^(phi(m)-1), and even that needs gcd(a, m) = 1. When m is composite and you do not know phi(m), the extended Euclidean algorithm is the right tool - it works whenever the inverse exists at all and needs no factorisation.",
        "The other trap is a congruent to 0 mod m: no inverse exists, and powmod happily returns 0, which then silently poisons everything downstream. Guard the input rather than trusting the output.",
        "Time: O(log m). Space: O(1).",
      ],
    },
    {
      name: "Binomial Coefficients",
      difficulty: "Medium",
      variation: "Precomputed factorials plus one inverse chain",
      link: "https://cses.fi/problemset/task/1079",
      question: [
        "Your task is to calculate n binomial coefficients modulo 10^9 + 7. The first line contains an integer n, the number of queries. Each of the next n lines has two integers a and b, and you must print the value of the binomial coefficient a choose b modulo 10^9 + 7.",
        "Example 1:\nInput:\n3\n5 3\n8 1\n9 5\nOutput:\n10\n8\n126\nExplanation: C(5,3) = 10, C(8,1) = 8, and C(9,5) = 126.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= b <= a <= 10^6",
      ],
      code: `const int MAXN = 1000001;
const long long MOD = 1000000007;

long long fact[MAXN], invFact[MAXN];

long long powmod(long long base, long long e) {
    long long res = 1;
    base %= MOD;
    while (e > 0) {
        if (e & 1) res = res * base % MOD;
        base = base * base % MOD;
        e >>= 1;
    }
    return res;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    fact[0] = 1;
    for (int i = 1; i < MAXN; i++) fact[i] = fact[i - 1] * i % MOD;

    // One fast power for the largest inverse factorial, then walk downwards:
    // invFact[i-1] = invFact[i] * i, because 1/(i-1)! = i / i!
    invFact[MAXN - 1] = powmod(fact[MAXN - 1], MOD - 2);
    for (int i = MAXN - 1; i > 0; i--) invFact[i - 1] = invFact[i] * i % MOD;

    int n;
    cin >> n;
    while (n--) {
        int a, b;
        cin >> a >> b;
        long long ans = fact[a] * invFact[b] % MOD * invFact[a - b] % MOD;
        cout << ans << "\\n";
    }
    return 0;
}`,
      explanation: [
        "C(a, b) = a! / (b! * (a-b)!), and under a prime modulus division becomes multiplication by a modular inverse. So the query itself is O(1) once factorials and inverse factorials are tabulated.",
        "The interesting part is the second precomputation loop. Calling powmod for every inverse factorial would cost O(MAXN log MOD), about 3 * 10^7 modular multiplications. Instead compute only the last one with a fast power and use the identity invFact[i-1] = invFact[i] * i to slide down the table in O(1) each. One fast power total.",
        "Why this is safe: 10^9 + 7 is prime and larger than 10^6, so no factorial in range is divisible by the modulus and every inverse genuinely exists. If the modulus were small or composite, this whole approach collapses and you need Lucas' theorem or a CRT-style decomposition instead.",
        "Watch the chained reduction in the query line. Three 64-bit values below the modulus are multiplied pairwise with a % after each step; skipping the middle % lets the product reach roughly 10^27 and wrap.",
        "Pascal's triangle also answers these queries in O(1), but it needs a 10^6 by 10^6 table. Factorials plus inverses is the O(MAXN) memory version of the same thing.",
        "Time: O(MAXN + log MOD + n). Space: O(MAXN).",
      ],
    },
    {
      name: "Super Pow",
      difficulty: "Medium",
      variation: "Exponent supplied as an array of digits",
      link: "https://leetcode.com/problems/super-pow/",
      question: [
        "Your task is to calculate a^b mod 1337, where a is a positive integer and b is an extremely large positive integer given in the form of an array of its decimal digits, most significant digit first.",
        "Example 1:\nInput: a = 2, b = [3]\nOutput: 8\nExplanation: 2^3 = 8, and 8 mod 1337 = 8.",
        "Example 2:\nInput: a = 2, b = [1, 0]\nOutput: 1024\nExplanation: b represents the number 10, and 2^10 = 1024, which is already below 1337.",
        "Constraints:\n- 1 <= a <= 2^31 - 1\n- 1 <= b.length <= 2000\n- 0 <= b[i] <= 9\n- b contains no leading zeros",
      ],
      code: `class Solution {
    static const int MOD = 1337;

    long long powmod(long long base, int e) {
        long long res = 1;
        base %= MOD;
        while (e > 0) {
            if (e & 1) res = res * base % MOD;
            base = base * base % MOD;
            e >>= 1;
        }
        return res;
    }

public:
    int superPow(int a, vector<int>& b) {
        long long res = 1;
        for (int digit : b) {
            // Horner on the exponent: a^(10*prefix + digit) = (a^prefix)^10 * a^digit
            res = powmod(res, 10) * powmod(a, digit) % MOD;
        }
        return (int)res;
    }
};`,
      explanation: [
        "The exponent has up to 2000 digits, so it cannot be held in any integer type and cannot be reduced modulo anything useful here. The fix is to never materialise it: process the digits left to right the way Horner's rule evaluates a polynomial. If prefix is the number formed by the digits seen so far, then appending digit d turns the exponent into 10 * prefix + d, and a^(10*prefix+d) = (a^prefix)^10 * a^d.",
        "So the running answer is itself raised to the tenth power at each step. Both powers are tiny - exponents 10 and at most 9 - so each digit costs a constant number of modular multiplications.",
        "The reason you cannot just reduce the exponent with Fermat is that 1337 = 7 * 191 is not prime, and even Euler's theorem with phi(1337) = 1140 requires gcd(a, 1337) = 1, which fails for a a multiple of 7 or 191. Reducing the exponent mod 1140 unconditionally is the classic wrong answer on this problem. The Horner walk sidesteps the question entirely and never needs a coprimality assumption.",
        "Note that a is reduced inside powmod: a can be near 2^31, so a * a overflows 32 bits before any reduction happens if you multiply in int.",
        "Time: O(L) modular multiplications for L digits, with a constant factor of about 8 per digit. Space: O(1).",
      ],
    },
    {
      name: "Exponentiation II",
      difficulty: "Hard",
      variation: "Tower of exponents, exponent reduced with Fermat",
      link: "https://cses.fi/problemset/task/1712",
      question: [
        "Your task is to efficiently calculate a^(b^c) modulo 10^9 + 7, where the exponent is itself a power. The first line contains the number of test cases n, and each of the next n lines contains three integers a, b and c.",
        "Example 1:\nInput:\n3\n3 7 1\n15 2 2\n3 4 5\nOutput:\n2187\n50625\n763327764\nExplanation: 3^(7^1) = 3^7 = 2187; 15^(2^2) = 15^4 = 50625; 3^(4^5) = 3^1024, whose remainder modulo 10^9 + 7 is 763327764.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= a, b, c <= 10^9",
      ],
      code: `const long long MOD = 1000000007;

long long powmod(long long base, long long e, long long m) {
    long long res = 1 % m;
    base %= m;
    while (e > 0) {
        if (e & 1) res = res * base % m;
        base = base * base % m;
        e >>= 1;
    }
    return res;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    while (n--) {
        long long a, b, c;
        cin >> a >> b >> c;
        // Inner power is reduced modulo MOD-1 (Fermat), outer modulo MOD.
        long long e = powmod(b, c, MOD - 1);
        cout << powmod(a, e, MOD) << "\\n";
    }
    return 0;
}`,
      explanation: [
        "b^c is astronomically large - up to 10^9 raised to 10^9 - so it can never be computed, only reduced. Fermat's little theorem gives the reduction: for a not divisible by the prime p, a^(p-1) is congruent to 1, so a^E depends only on E modulo p-1. Hence the inner power is taken modulo MOD-1 and the outer one modulo MOD.",
        "The two moduli are different and that asymmetry is the entire problem. Reducing the inner exponent modulo MOD instead of MOD-1 is the standard mistake and produces a plausible-looking wrong answer, because MOD and MOD-1 differ by one and small cases often still agree.",
        "There is a subtlety worth being explicit about: when b^c mod (p-1) comes out as 0 the true exponent was a nonzero multiple of p-1, and a^0 = 1 equals a^(p-1) = 1, so the shortcut is still right. But it is right only because a is coprime to p. If a were a multiple of p, a^0 = 1 while the true value is 0, and you would need the general Euler-lifting rule (reduce to E mod phi(m), then add phi(m) back when E >= phi(m)). Here a <= 10^9 < p and a >= 1, so a is never a multiple of p and the plain version is safe.",
        "This generalises upward: a tower a^(b^(c^d)) needs moduli p, then phi(p), then phi(phi(p)), and the chain of totients collapses to 1 in O(log p) levels - the tetration trick behind problems like 'Tower of powers modulo m'.",
        "Time: O(n log(max value)) - two fast powers per query. Space: O(1).",
      ],
    },
    {
      name: "Fibonacci Numbers",
      difficulty: "Hard",
      variation: "Matrix exponentiation of a 2x2 recurrence",
      link: "https://cses.fi/problemset/task/1722",
      question: [
        "Your task is to calculate the n-th Fibonacci number modulo 10^9 + 7, where the sequence is defined by F(0) = 0, F(1) = 1 and F(k) = F(k-1) + F(k-2) for k >= 2. The only input line contains n.",
        "Example 1:\nInput: 10\nOutput: 55\nExplanation: the sequence starts 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, so F(10) = 55.",
        "Example 2:\nInput: 30\nOutput: 832040\nExplanation: F(30) = 832040, still below the modulus.",
        "Constraints:\n- 0 <= n <= 10^18",
      ],
      code: `const long long MOD = 1000000007;

using Mat = array<array<long long, 2>, 2>;

Mat mul(const Mat& a, const Mat& b) {
    Mat c{};                       // value-initialised to all zeros
    for (int i = 0; i < 2; i++)
        for (int k = 0; k < 2; k++) {
            if (a[i][k] == 0) continue;
            for (int j = 0; j < 2; j++)
                c[i][j] = (c[i][j] + a[i][k] * b[k][j]) % MOD;
        }
    return c;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    long long n;
    cin >> n;

    Mat base = {{{1, 1}, {1, 0}}};      // the Fibonacci transfer matrix
    Mat res = {{{1, 0}, {0, 1}}};       // identity plays the role of 1
    while (n > 0) {
        if (n & 1) res = mul(res, base);
        base = mul(base, base);
        n >>= 1;
    }
    // base^n = [[F(n+1), F(n)], [F(n), F(n-1)]], so entry (0,1) is F(n).
    cout << res[0][1] << "\\n";
    return 0;
}`,
      explanation: [
        "The fast-power skeleton does not care what it is multiplying, only that the operation is associative and has an identity. Swap scalars for 2x2 matrices and identity 1 for the identity matrix and the same loop computes M^n in O(log n) matrix products.",
        "The matrix comes from writing the recurrence as a linear map on the state vector: (F(k+1), F(k)) = M * (F(k), F(k-1)) with M = [[1,1],[1,0]]. Applying it n times from the base state (F(1), F(0)) = (1, 0) gives M^n, and induction on n shows M^n = [[F(n+1), F(n)], [F(n), F(n-1)]]. Reading entry (0,1) is therefore F(n), and it is correct even at n = 0, where res is the identity and the entry is 0.",
        "Every recurrence with constant coefficients yields such a matrix, which is the general lesson: linear recurrences are computable in O(k^3 log n) for k terms, no matter how large n is.",
        "Do not reach for Binet's closed form here. The golden-ratio formula needs irrational arithmetic that cannot be reduced modulo a prime without working in an extension field, and floating point loses all precision long before n = 10^18. The n up to 10^18 in the constraints is the signal that only a logarithmic method will do.",
        "Matrix multiplication is not commutative, so mul(res, base) and mul(base, res) are different expressions in general. For this symmetric matrix either happens to work, but writing the accumulator on the correct side is a habit worth forming before the next two problems, where the operators are not symmetric.",
        "Time: O(log n) matrix multiplications, so O(8 log n) modular multiplications. Space: O(1).",
      ],
    },
    {
      name: "Throwing Dice",
      difficulty: "Hard",
      variation: "Matrix power for a six-term linear recurrence",
      link: "https://cses.fi/problemset/task/1096",
      question: [
        "You throw a standard six-sided die repeatedly until the total of the throws equals n. Count the number of distinct sequences of throws whose values sum to exactly n, and print the answer modulo 10^9 + 7. Two sequences differ if the ordered list of thrown values differs. The only input line contains n.",
        "Example 1:\nInput: 8\nOutput: 125\nExplanation: writing d(k) for the answer at total k, d(0) = 1 and d(k) = d(k-1) + ... + d(k-6) with negative indices treated as 0, which gives 1, 1, 2, 4, 8, 16, 32, 63, 125 for k = 0..8.",
        "Example 2:\nInput: 3\nOutput: 4\nExplanation: the sequences are 1+1+1, 1+2, 2+1 and 3.",
        "Constraints:\n- 1 <= n <= 10^18",
      ],
      code: `const long long MOD = 1000000007;
const int K = 6;

using Mat = array<array<long long, K>, K>;

Mat mul(const Mat& a, const Mat& b) {
    Mat c{};
    for (int i = 0; i < K; i++)
        for (int k = 0; k < K; k++) {
            if (a[i][k] == 0) continue;
            for (int j = 0; j < K; j++)
                c[i][j] = (c[i][j] + a[i][k] * b[k][j]) % MOD;
        }
    return c;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    long long n;
    cin >> n;

    Mat T{}, res{};
    for (int j = 0; j < K; j++) T[0][j] = 1;        // top row: sum of the last six values
    for (int i = 1; i < K; i++) T[i][i - 1] = 1;    // shift the window down one slot
    for (int i = 0; i < K; i++) res[i][i] = 1;      // identity

    long long e = n;
    while (e > 0) {
        if (e & 1) res = mul(res, T);
        T = mul(T, T);
        e >>= 1;
    }
    // Start state is (d(0), d(-1), ..., d(-5)) = (1, 0, 0, 0, 0, 0),
    // so the answer d(n) is entry (0,0) of T^n.
    cout << res[0][0] << "\\n";
    return 0;
}`,
      explanation: [
        "The recurrence is the ordinary dice-combinations DP: split on the value of the last throw, so d(k) = d(k-1) + ... + d(k-6) with d(0) = 1 and d of a negative total equal to 0. With n only up to 10^6 you would just fill the table; at 10^18 the DP has to be turned into a matrix power.",
        "The state vector holds the last six values, v(k) = (d(k), d(k-1), ..., d(k-5)). One step of the recurrence is a linear map: the new first entry is the sum of all six old entries (the all-ones top row) and the other five entries are the old ones shifted down by one (the subdiagonal of ones). That is T, and v(n) = T^n * v(0).",
        "Choosing v(0) = (d(0), d(-1), ..., d(-5)) = (1, 0, 0, 0, 0, 0) is what makes the code short: v(0) is the first standard basis vector, so the first component of T^n * v(0) is simply entry (0,0) of T^n and no explicit matrix-vector multiply is needed. Starting instead from v(5) = (16, 8, 4, 2, 1, 1) also works but then needs T^(n-5) and a special case for n < 5.",
        "Only the first component of the result is ever read, yet the whole matrix must be squared - you cannot restrict the work to one row, because repeated squaring needs the full operator at every level.",
        "Sanity-check any transfer matrix by hand at small n before trusting it: T^1 applied to v(0) must give d(1) = 1 and T^2 must give d(2) = 2. A transposed or misplaced subdiagonal is the usual bug and it is invisible at n = 0.",
        "Time: O(K^3 log n) = O(216 log n) modular multiplications. Space: O(K^2).",
      ],
    },
    {
      name: "Graph Paths I",
      difficulty: "Hard",
      variation: "Adjacency matrix power counts fixed-length walks",
      link: "https://cses.fi/problemset/task/1723",
      question: [
        "You are given a directed graph with n nodes numbered 1..n and m edges. Count the number of walks from node 1 to node n that use exactly k edges, and print the answer modulo 10^9 + 7. Nodes and edges may be repeated along a walk, and the graph may contain multiple parallel edges.",
        "Example 1:\nInput:\n4 5 2\n1 2\n1 3\n1 4\n2 4\n3 4\nOutput:\n2\nExplanation: the walks of exactly two edges from node 1 to node 4 are 1 -> 2 -> 4 and 1 -> 3 -> 4. The single edge 1 -> 4 is only one edge long and does not count.",
        "Example 2:\nInput:\n4 5 1\n1 2\n1 3\n1 4\n2 4\n3 4\nOutput:\n1\nExplanation: the only one-edge walk from node 1 to node 4 is the direct edge 1 -> 4.",
        "Constraints:\n- 1 <= n <= 100\n- 1 <= m <= n^2\n- 1 <= k <= 10^9",
      ],
      code: `const long long MOD = 1000000007;

using Mat = vector<vector<long long>>;

Mat mul(const Mat& a, const Mat& b) {
    int n = a.size();
    Mat c(n, vector<long long>(n, 0));
    for (int i = 0; i < n; i++)
        for (int p = 0; p < n; p++) {
            if (a[i][p] == 0) continue;          // skip a whole inner loop for sparse rows
            long long x = a[i][p];
            for (int j = 0; j < n; j++)
                c[i][j] = (c[i][j] + x * b[p][j]) % MOD;
        }
    return c;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    long long k;
    cin >> n >> m >> k;

    Mat A(n, vector<long long>(n, 0));
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        A[a - 1][b - 1]++;                       // ++ not = 1, parallel edges count separately
    }

    Mat res(n, vector<long long>(n, 0));
    for (int i = 0; i < n; i++) res[i][i] = 1;
    while (k > 0) {
        if (k & 1) res = mul(res, A);
        A = mul(A, A);
        k >>= 1;
    }
    cout << res[0][n - 1] << "\\n";
    return 0;
}`,
      explanation: [
        "Entry (u, v) of the adjacency matrix A is the number of one-edge walks from u to v. Multiplying two such matrices sums over an intermediate node - (A^2)[u][v] = sum over w of A[u][w] * A[w][v] - which is exactly a count of two-edge walks. By induction (A^k)[u][v] is the number of walks of exactly k edges, so the answer is entry (1, n) of A^k.",
        "That identification is the payoff: matrix multiplication is doing the same combine-over-a-middle-point work as a DP over path length, and repeated squaring compresses k = 10^9 layers of that DP into about 30 matrix products.",
        "Loop order matters for speed. The i-p-j ordering with the inner loop walking a row of b is cache friendly; the naive i-j-p ordering strides down a column of b and runs several times slower, which is the difference between passing and timing out at n = 100 with 3 * 10^7 operations.",
        "Two correctness details. Parallel edges must increment the entry rather than set it to 1, otherwise duplicate routes are undercounted. And the values are walks, not simple paths - revisiting a node is allowed here. Counting simple paths of a given length is a genuinely different and much harder problem that no matrix power solves.",
        "Reducing modulo MOD inside the innermost loop is safe because x and b[p][j] are both below 10^9 + 7 so the product stays under 10^18. Deferring the reduction to accumulate several terms first would overflow after only nine additions.",
        "Time: O(n^3 log k). Space: O(n^2).",
      ],
    },
  ],
};
