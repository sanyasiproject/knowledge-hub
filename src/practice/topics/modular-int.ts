import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Exponentiation",
      difficulty: "Easy",
      variation: "Modular power, the Mint template",
      link: "https://cses.fi/problemset/task/1095",
      question: [
        "You are given n queries. Each query gives two integers a and b, and you must print a^b modulo 10^9 + 7. Note that 0^0 = 1 by convention.",
        "Example 1:\nInput:\n3\n3 4\n2 8\n123 123\nOutput:\n81\n256\n921450052\nExplanation: 3^4 = 81 and 2^8 = 256 both fit under the modulus. 123^123 is astronomically large, so only its residue 921450052 is printed.",
        "Constraints:\n- 1 <= n <= 2 * 10^5\n- 0 <= a, b <= 10^9",
      ],
      code: `const long long MOD = 1000000007;

struct Mint {
    long long v;
    Mint(long long x = 0) { v = x % MOD; if (v < 0) v += MOD; }   // normalise once, at the boundary
    Mint& operator+=(const Mint& o) { v += o.v; if (v >= MOD) v -= MOD; return *this; }
    Mint& operator-=(const Mint& o) { v -= o.v; if (v < 0) v += MOD; return *this; }
    Mint& operator*=(const Mint& o) { v = v * o.v % MOD; return *this; }
    Mint pow(long long e) const {
        Mint b = *this, r = 1;
        while (e > 0) { if (e & 1) r *= b; b *= b; e >>= 1; }      // binary exponentiation
        return r;
    }
    Mint inv() const { return pow(MOD - 2); }                     // Fermat, valid only because MOD is prime
    Mint& operator/=(const Mint& o) { return *this *= o.inv(); }
    friend Mint operator+(Mint a, const Mint& b) { return a += b; }
    friend Mint operator-(Mint a, const Mint& b) { return a -= b; }
    friend Mint operator*(Mint a, const Mint& b) { return a *= b; }
    friend Mint operator/(Mint a, const Mint& b) { return a /= b; }
    friend ostream& operator<<(ostream& os, const Mint& m) { return os << m.v; }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    while (n--) {
        long long a, b;
        cin >> a >> b;
        cout << Mint(a).pow(b) << "\\n";
    }
    return 0;
}`,
      explanation: [
        "This is the template question for the whole topic. A Mint is a one-field wrapper around a residue in [0, MOD) whose invariant is exactly that: v is always reduced. Every operator restores the invariant before returning, so downstream code never has to remember a single percent sign.",
        "The invariant is what makes the arithmetic safe. Addition of two reduced values is at most 2*MOD - 2, which fits in a long long, so a single conditional subtraction is enough - no percent needed. Multiplication of two reduced values is under 10^18, also inside long long, so one reduction suffices. If you allowed unreduced values in, both of those bounds break and multiplication overflows.",
        "pow is binary exponentiation: square the base and halve the exponent, folding in the current base whenever the low bit of the exponent is set. That gives O(log e) multiplications instead of e of them.",
        "The tempting wrong version is to store v in an int and write v = v * o.v % MOD. Two ints near 10^9 multiply to about 10^18, which overflows a 32-bit int long before the modulo runs. Keeping v as long long is not optional.",
        "Time: O(n log b) overall, O(log b) per query. Space: O(1).",
      ],
    },
    {
      name: "Dice Combinations",
      difficulty: "Easy",
      variation: "Counting DP with a running modular sum",
      link: "https://cses.fi/problemset/task/1633",
      question: [
        "Your task is to count the number of ordered ways to construct the sum n by throwing a dice one or more times. Each throw produces an outcome between 1 and 6. Two sequences of throws are different if the order of outcomes differs. Print the answer modulo 10^9 + 7.",
        "Example 1:\nInput:\n3\nOutput:\n4\nExplanation: The four sequences are 1+1+1, 1+2, 2+1 and 3.",
        "Example 2:\nInput:\n8\nOutput:\n125\nExplanation: The counts for sums 0..8 are 1, 1, 2, 4, 8, 16, 32, 63, 125 - each one is the sum of the previous six.",
        "Constraints:\n- 1 <= n <= 10^6",
      ],
      code: `const long long MOD = 1000000007;

struct Mint {
    long long v;
    Mint(long long x = 0) { v = x % MOD; if (v < 0) v += MOD; }
    Mint& operator+=(const Mint& o) { v += o.v; if (v >= MOD) v -= MOD; return *this; }
    Mint& operator*=(const Mint& o) { v = v * o.v % MOD; return *this; }
    friend Mint operator+(Mint a, const Mint& b) { return a += b; }
    friend Mint operator*(Mint a, const Mint& b) { return a *= b; }
    friend ostream& operator<<(ostream& os, const Mint& m) { return os << m.v; }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<Mint> dp(n + 1);
    dp[0] = 1;                                  // one empty sequence sums to 0
    for (int i = 1; i <= n; i++)
        for (int f = 1; f <= 6 && f <= i; f++)
            dp[i] += dp[i - f];                 // += hides the reduction entirely
    cout << dp[n] << "\\n";
    return 0;
}`,
      explanation: [
        "State: dp[i] is the number of ordered throw sequences summing to exactly i. Every such sequence has a unique last throw f in 1..6, and removing it leaves a sequence summing to i - f. The six cases are disjoint (they differ in the value of the final throw) and exhaustive, so dp[i] is the plain sum of dp[i-1] .. dp[i-6].",
        "dp[0] = 1 is the base case that carries all the weight: there is exactly one way to reach sum 0, namely throwing nothing. Setting it to 0 zeroes out the entire table.",
        "This is the everyday case for a Mint: the recurrence is one line of pure addition, and with an ordinary long long array you would have to remember a % MOD on every single accumulation. Forget one and the values silently drift past 10^18 and overflow. With Mint the += operator owns that responsibility, so the recurrence reads exactly like the mathematics.",
        "The answer is a residue, not a count, so never compare it against a threshold or use it in a min or max. Once you take a modulus, ordering information is gone - that is a common bug when a counting DP and an optimisation DP get merged into one table.",
        "Time: O(6n). Space: O(n).",
      ],
    },
    {
      name: "Count Good Numbers",
      difficulty: "Medium",
      variation: "Splitting a huge exponent into two modular powers",
      link: "https://leetcode.com/problems/count-good-numbers/",
      question: [
        "A digit string is good if the digits at even indices (0-indexed) are even, and the digits at odd indices are prime. The even digits are 0, 2, 4, 6, 8 and the prime digits are 2, 3, 5, 7. Given an integer n, return the total number of good digit strings of length n, modulo 10^9 + 7. Leading zeroes are allowed.",
        "Example 1:\nInput: n = 1\nOutput: 5\nExplanation: The only index is 0, which must hold an even digit, so the strings are 0, 2, 4, 6 and 8.",
        "Example 2:\nInput: n = 4\nOutput: 400\nExplanation: Indices 0 and 2 have 5 choices each and indices 1 and 3 have 4 choices each, giving 5 * 4 * 5 * 4 = 400.",
        "Example 3:\nInput: n = 50\nOutput: 564908303",
        "Constraints:\n- 1 <= n <= 10^15",
      ],
      code: `const long long MOD = 1000000007;

struct Mint {
    long long v;
    Mint(long long x = 0) { v = x % MOD; if (v < 0) v += MOD; }
    Mint& operator*=(const Mint& o) { v = v * o.v % MOD; return *this; }
    Mint pow(long long e) const {
        Mint b = *this, r = 1;
        while (e > 0) { if (e & 1) r *= b; b *= b; e >>= 1; }
        return r;
    }
    friend Mint operator*(Mint a, const Mint& b) { return a *= b; }
};

class Solution {
public:
    int countGoodNumbers(long long n) {
        // ceil(n/2) even positions, floor(n/2) odd positions
        Mint ans = Mint(5).pow((n + 1) / 2) * Mint(4).pow(n / 2);
        return (int)ans.v;
    }
};`,
      explanation: [
        "The positions are independent, so the count is a product: each of the ceil(n/2) even indices contributes a factor of 5 and each of the floor(n/2) odd indices contributes a factor of 4. The whole problem reduces to two modular powers.",
        "n reaches 10^15, so the true answer has roughly 10^15 digits. There is no way to compute it and reduce afterwards - the reduction has to happen inside the exponentiation, which is precisely what Mint::pow does by squaring a reduced base 50 times.",
        "The tempting wrong approach is to loop n times multiplying by 5 or 4. That is O(n) at 10^15 iterations and will never finish. The other classic slip is computing pow(5, (n+1)/2) with the standard library's double-precision pow, which loses all significance well before 10^15.",
        "Note that (n + 1) / 2 in integer arithmetic is ceil(n/2) for non-negative n, which is why odd lengths correctly get one extra even-index slot.",
        "Time: O(log n). Space: O(1).",
      ],
    },
    {
      name: "Number of Dice Rolls With Target Sum",
      difficulty: "Medium",
      variation: "Two-dimensional counting DP under a prime modulus",
      link: "https://leetcode.com/problems/number-of-dice-rolls-with-target-sum/",
      question: [
        "You have n dice, and each dice has k faces numbered from 1 to k. Return the number of possible ways, modulo 10^9 + 7, to roll all n dice so that the sum of the face-up numbers equals target. Dice are distinguishable, so different orderings count separately.",
        "Example 1:\nInput: n = 1, k = 6, target = 3\nOutput: 1\nExplanation: One dice, one way to show a 3.",
        "Example 2:\nInput: n = 2, k = 6, target = 7\nOutput: 6\nExplanation: The ordered pairs are (1,6), (2,5), (3,4), (4,3), (5,2) and (6,1).",
        "Example 3:\nInput: n = 30, k = 30, target = 500\nOutput: 222616187",
        "Constraints:\n- 1 <= n, k <= 30\n- 1 <= target <= 1000",
      ],
      code: `const long long MOD = 1000000007;

struct Mint {
    long long v;
    Mint(long long x = 0) { v = x % MOD; if (v < 0) v += MOD; }
    Mint& operator+=(const Mint& o) { v += o.v; if (v >= MOD) v -= MOD; return *this; }
    friend Mint operator+(Mint a, const Mint& b) { return a += b; }
};

class Solution {
public:
    int numRollsToTarget(int n, int k, int target) {
        vector<Mint> dp(target + 1);
        dp[0] = 1;                                  // zero dice, sum zero
        for (int i = 1; i <= n; i++) {
            vector<Mint> nd(target + 1);            // fresh row: each dice used exactly once
            for (int s = 1; s <= target; s++)
                for (int f = 1; f <= k && f <= s; f++)
                    nd[s] += dp[s - f];
            dp = nd;
        }
        return (int)dp[target].v;
    }
};`,
      explanation: [
        "State: dp[i][s] is the number of ways the first i dice sum to s. Splitting on the face shown by dice i gives dp[i][s] = sum over f in 1..k of dp[i-1][s-f]. Because the split is on a specific dice's value, the cases are disjoint and every configuration is counted once.",
        "The row must be rebuilt rather than updated in place. Writing dp[s] += dp[s-f] on a single array would let one dice contribute several times to the same total, turning the answer into an unbounded-multiset count instead of an exactly-n-dice count. This is the same in-place-versus-fresh-row distinction as 0/1 knapsack versus unbounded knapsack.",
        "Only addition appears, so a Mint with just += is enough. The maximum row width is 1000 and the inner loop runs at most 30 times per cell, so the whole table is trivially small - the modulus is here for the magnitude of the count, not for speed.",
        "A tighter inner bound is f <= min(k, s - (n - i)), skipping states that cannot leave at least 1 for every remaining dice, but at these constraints it changes nothing measurable.",
        "Time: O(n * target * k). Space: O(target).",
      ],
    },
    {
      name: "Knight Dialer",
      difficulty: "Medium",
      variation: "Counting DP mod p over a fixed transition graph",
      link: "https://leetcode.com/problems/knight-dialer/",
      question: [
        "A chess knight stands on a phone keypad laid out as three rows 1 2 3 / 4 5 6 / 7 8 9 and a bottom row containing star, 0 and hash. The knight may only stand on numeric cells and moves in the usual L shape. Given an integer n, you place the knight on any numeric cell and then perform n - 1 valid knight moves, dialing the digit under the knight at each of the n positions. Return how many distinct phone numbers of length n can be dialed, modulo 10^9 + 7.",
        "Example 1:\nInput: n = 1\nOutput: 10\nExplanation: No moves are made, so any single digit 0..9 is a valid number.",
        "Example 2:\nInput: n = 2\nOutput: 20\nExplanation: Every starting digit except 5 has knight moves available; summing the out-degrees of 0,1,2,3,4,6,7,8,9 gives 20.",
        "Example 3:\nInput: n = 3131\nOutput: 136006598",
        "Constraints:\n- 1 <= n <= 5000",
      ],
      code: `const long long MOD = 1000000007;

struct Mint {
    long long v;
    Mint(long long x = 0) { v = x % MOD; if (v < 0) v += MOD; }
    Mint& operator+=(const Mint& o) { v += o.v; if (v >= MOD) v -= MOD; return *this; }
    friend Mint operator+(Mint a, const Mint& b) { return a += b; }
};

class Solution {
public:
    int knightDialer(int n) {
        // knight moves on the keypad; digit 5 is isolated
        vector<vector<int>> nxt = {
            {4, 6}, {6, 8}, {7, 9}, {4, 8}, {3, 9, 0},
            {}, {1, 7, 0}, {2, 6}, {1, 3}, {2, 4}
        };
        vector<Mint> dp(10, 1);                     // length-1 numbers: one per digit
        for (int step = 1; step < n; step++) {
            vector<Mint> nd(10);
            for (int d = 0; d < 10; d++)
                for (int t : nxt[d])
                    nd[t] += dp[d];                 // push the count along each edge
            dp = nd;
        }
        Mint ans = 0;
        for (int d = 0; d < 10; d++) ans += dp[d];
        return (int)ans.v;
    }
};`,
      explanation: [
        "State: dp[step][d] is the number of length-(step+1) dialable prefixes ending on digit d. The transition just walks the knight-move graph, and because a prefix is identified by its full digit sequence, different predecessors always give different numbers - so summing incoming edges never double counts.",
        "Digit 5 has no knight moves at all, so its column dies after the first step. That is why n = 2 gives 20 rather than 25: the two-digit numbers are counted by out-degree, and 5 contributes zero.",
        "The reduction has to be inside the loop. The true count grows roughly like 2.4^n, so at n = 5000 it has thousands of digits; every += must land back in [0, MOD). This is exactly the class of code where a Mint pays for itself, since the transition is written once and never mentions the modulus.",
        "Because the transition matrix is a fixed 10 by 10, the same recurrence can be run in O(10^3 log n) with matrix exponentiation, which is what you need if n were 10^9 instead of 5000.",
        "Time: O(n) with a constant of about 20 edge relaxations per step. Space: O(1) - two rows of ten.",
      ],
    },
    {
      name: "Binomial Coefficients",
      difficulty: "Medium",
      variation: "Modular division via inverse factorials",
      link: "https://cses.fi/problemset/task/1079",
      question: [
        "Your task is to calculate n binomial coefficients modulo 10^9 + 7. Each of the n queries gives two integers a and b, and you must print the binomial coefficient a choose b.",
        "Example 1:\nInput:\n3\n5 3\n8 1\n9 5\nOutput:\n10\n8\n126\nExplanation: C(5,3) = 10, C(8,1) = 8 and C(9,5) = 126.",
        "Example 2:\nInput:\n1\n20 10\nOutput:\n184756\nExplanation: C(20,10) = 184756, which is still below the modulus so no wraparound is visible.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= b <= a <= 10^6",
      ],
      code: `const long long MOD = 1000000007;

struct Mint {
    long long v;
    Mint(long long x = 0) { v = x % MOD; if (v < 0) v += MOD; }
    Mint& operator*=(const Mint& o) { v = v * o.v % MOD; return *this; }
    Mint pow(long long e) const {
        Mint b = *this, r = 1;
        while (e > 0) { if (e & 1) r *= b; b *= b; e >>= 1; }
        return r;
    }
    Mint inv() const { return pow(MOD - 2); }
    friend Mint operator*(Mint a, const Mint& b) { return a *= b; }
    friend ostream& operator<<(ostream& os, const Mint& m) { return os << m.v; }
};

const int MX = 1000001;
vector<Mint> fact(MX), ifact(MX);

void build() {
    fact[0] = 1;
    for (int i = 1; i < MX; i++) fact[i] = fact[i - 1] * i;
    ifact[MX - 1] = fact[MX - 1].inv();               // one exponentiation for the whole table
    for (int i = MX - 1; i > 0; i--) ifact[i - 1] = ifact[i] * i;   // walk inverses downwards
}

Mint C(int a, int b) {
    if (b < 0 || b > a) return 0;
    return fact[a] * ifact[b] * ifact[a - b];
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    build();
    int n;
    cin >> n;
    while (n--) {
        int a, b;
        cin >> a >> b;
        cout << C(a, b) << "\\n";
    }
    return 0;
}`,
      explanation: [
        "C(a,b) = a! / (b! (a-b)!) is a division, and division does not exist in modular arithmetic - it is multiplication by a modular inverse. Since 10^9 + 7 is prime and no factorial below it is a multiple of it, Fermat's little theorem gives x^(-1) = x^(MOD-2), which is exactly what Mint::inv computes.",
        "The key efficiency trick is the downward inverse-factorial sweep. Inverting each factorial separately would be 10^6 exponentiations, about 3 * 10^7 multiplications. Instead invert only the last factorial and use the identity ifact[i-1] = ifact[i] * i, since 1/(i-1)! = i/i!. That is one exponentiation plus 10^6 multiplications.",
        "Building the tables once and answering each query in O(1) is the whole point. Recomputing per query, or using Pascal's triangle at a = 10^6, would need a 10^12-entry table and is hopeless.",
        "The trap worth naming: Fermat's inverse is only valid when the modulus is prime and the value is not a multiple of it. Under a composite modulus, or when the numerator genuinely contains the prime, you need Lucas' theorem or a CRT-based generalisation instead.",
        "Time: O(MX + n) after O(log MOD) for the single inversion. Space: O(MX).",
      ],
    },
    {
      name: "Creating Strings II",
      difficulty: "Medium",
      variation: "Multinomial coefficient as a modular quotient",
      link: "https://cses.fi/problemset/task/1715",
      question: [
        "Given a string of lowercase letters, count the number of distinct strings that can be created by reordering its characters. Print the answer modulo 10^9 + 7.",
        "Example 1:\nInput:\naabac\nOutput:\n20\nExplanation: The string has length 5 with three copies of 'a', one 'b' and one 'c', so the count is 5! / (3! 1! 1!) = 120 / 6 = 20.",
        "Example 2:\nInput:\naaaa\nOutput:\n1\nExplanation: Every reordering is the same string, so 4! / 4! = 1.",
        "Constraints:\n- 1 <= length of the string <= 10^6\n- the string consists of characters a-z",
      ],
      code: `const long long MOD = 1000000007;

struct Mint {
    long long v;
    Mint(long long x = 0) { v = x % MOD; if (v < 0) v += MOD; }
    Mint& operator*=(const Mint& o) { v = v * o.v % MOD; return *this; }
    Mint pow(long long e) const {
        Mint b = *this, r = 1;
        while (e > 0) { if (e & 1) r *= b; b *= b; e >>= 1; }
        return r;
    }
    Mint inv() const { return pow(MOD - 2); }
    Mint& operator/=(const Mint& o) { return *this *= o.inv(); }
    friend Mint operator*(Mint a, const Mint& b) { return a *= b; }
    friend Mint operator/(Mint a, const Mint& b) { return a /= b; }
    friend ostream& operator<<(ostream& os, const Mint& m) { return os << m.v; }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    int n = s.size();
    vector<Mint> fact(n + 1);
    fact[0] = 1;
    for (int i = 1; i <= n; i++) fact[i] = fact[i - 1] * i;
    int cnt[26] = {0};
    for (char c : s) cnt[c - 'a']++;
    Mint ans = fact[n];
    for (int i = 0; i < 26; i++) ans /= fact[cnt[i]];   // at most 26 inversions total
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "Treat the letters as distinguishable first: n! orderings. Every distinct string is then produced exactly cnt['a']! * cnt['b']! * ... times, once for each way of permuting the identical copies among themselves. Dividing by that product gives the multinomial coefficient n! / prod(cnt[c]!).",
        "The overloaded /= is what makes this readable, but it is worth knowing what it costs: each division is a full O(log MOD) exponentiation. Here there are only 26 of them, so it is free. Inside a 10^6-iteration loop the same operator would be a 30x slowdown - that is when you switch to a precomputed inverse-factorial table.",
        "The distinctness argument requires the divisor group to be exact. Dividing by n! / something-approximate, or forgetting a letter with count 1 (whose 1! = 1 makes it harmless here), is where multinomial counts usually go wrong.",
        "Since every cnt[i] <= n < MOD, no factorial in the denominator is divisible by the modulus, so all the inverses exist. If the modulus were smaller than n the whole Fermat approach would collapse and you would need Lucas.",
        "Time: O(n + 26 log MOD). Space: O(n) for the factorial table.",
      ],
    },
    {
      name: "Super Pow",
      difficulty: "Medium",
      variation: "Composite modulus - division is unavailable",
      link: "https://leetcode.com/problems/super-pow/",
      question: [
        "Your task is to calculate a raised to the power b modulo 1337, where a is a positive integer and b is an extremely large positive integer given as an array of its decimal digits, most significant digit first.",
        "Example 1:\nInput: a = 2, b = [3]\nOutput: 8\nExplanation: 2^3 = 8, and 8 mod 1337 = 8.",
        "Example 2:\nInput: a = 2, b = [1,0]\nOutput: 1024\nExplanation: 2^10 = 1024, and 1024 mod 1337 = 1024.",
        "Example 3:\nInput: a = 1, b = [4,3,3,8,5,2]\nOutput: 1\nExplanation: 1 raised to any power is 1.",
        "Constraints:\n- 1 <= a <= 2^31 - 1\n- 1 <= b.length <= 2000\n- 0 <= b[i] <= 9\n- b has no leading zeroes",
      ],
      code: `// The modulus 1337 = 7 * 191 is NOT prime, so this Mint deliberately
// exposes no division and no inv - Fermat's little theorem does not apply.
const long long MOD1337 = 1337;

struct Mint {
    long long v;
    Mint(long long x = 0) { v = x % MOD1337; if (v < 0) v += MOD1337; }
    Mint& operator*=(const Mint& o) { v = v * o.v % MOD1337; return *this; }
    Mint pow(long long e) const {
        Mint b = *this, r = 1;
        while (e > 0) { if (e & 1) r *= b; b *= b; e >>= 1; }
        return r;
    }
    friend Mint operator*(Mint a, const Mint& b) { return a *= b; }
};

class Solution {
public:
    int superPow(int a, vector<int>& b) {
        Mint base(a), res = 1;
        // Horner on the exponent: a^(10*p + d) = (a^p)^10 * a^d
        for (int d : b) res = res.pow(10) * base.pow(d);
        return (int)res.v;
    }
};`,
      explanation: [
        "The exponent has up to 2000 decimal digits, so it cannot be held in any integer type. Instead build it digit by digit with Horner's rule on the exponent: if the prefix so far represents p, appending digit d makes the exponent 10p + d, and a^(10p+d) = (a^p)^10 * a^d. So each step raises the running result to the tenth power and multiplies in a small power of the base.",
        "This is the important counterexample for the Mint pattern. 1337 = 7 * 191 is composite, so x^(MOD-2) is not an inverse and division is simply not defined for values sharing a factor with 1337. A Mint written for a composite modulus must not offer / or inv, otherwise it silently returns garbage. Multiplication and pow remain perfectly valid.",
        "It is equally wrong to try to shrink the exponent with Fermat here. Reducing b mod 1336 is meaningless; the correct exponent-reduction tool for a composite modulus is Carmichael's or Euler's theorem, and it requires gcd(a, 1337) = 1, which is not guaranteed. The Horner walk avoids the whole question by never reducing the exponent at all.",
        "Values stay well under 1337^2, so a plain long long has room to spare - overflow is not a concern at this modulus.",
        "Time: O(L log 10) with L = b.length, so effectively O(L). Space: O(1).",
      ],
    },
    {
      name: "Exponentiation II",
      difficulty: "Hard",
      variation: "Exponent reduction with Fermat, tower of powers",
      link: "https://cses.fi/problemset/task/1712",
      question: [
        "You are given n queries. Each query gives three integers a, b and c, and you must print a^(b^c) modulo 10^9 + 7. Powers are evaluated top-down, so the exponent is b^c, not (a^b)^c. Use the convention 0^0 = 1.",
        "Example 1:\nInput:\n3\n3 7 1\n2 3 2\n2 3 3\nOutput:\n2187\n512\n134217728\nExplanation: 7^1 = 7 so the first is 3^7 = 2187. 3^2 = 9 so the second is 2^9 = 512. 3^3 = 27 so the third is 2^27 = 134217728, all still under the modulus.",
        "Example 2:\nInput:\n1\n5 10 9\nOutput:\n142848001\nExplanation: The exponent is 10^9, so 5^(10^9) is reduced by working with the exponent modulo 10^9 + 6.",
        "Constraints:\n- 1 <= n <= 10^5\n- 0 <= a, b, c <= 10^9",
      ],
      code: `const long long MOD = 1000000007;

struct Mint {
    long long v;
    Mint(long long x = 0) { v = x % MOD; if (v < 0) v += MOD; }
    Mint& operator*=(const Mint& o) { v = v * o.v % MOD; return *this; }
    Mint pow(long long e) const {
        Mint b = *this, r = 1;
        while (e > 0) { if (e & 1) r *= b; b *= b; e >>= 1; }
        return r;
    }
    friend Mint operator*(Mint a, const Mint& b) { return a *= b; }
    friend ostream& operator<<(ostream& os, const Mint& m) { return os << m.v; }
};

// The exponent lives in a DIFFERENT ring (mod MOD-1), so Mint cannot be used for it.
long long powmod(long long b, long long e, long long m) {
    b %= m;
    long long r = 1 % m;
    while (e > 0) {
        if (e & 1) r = r * b % m;
        b = b * b % m;
        e >>= 1;
    }
    return r;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    while (n--) {
        long long a, b, c;
        cin >> a >> b >> c;
        if (a % MOD == 0) {
            // b^c is zero only when b = 0 and c > 0, and 0^0 = 1
            cout << ((b == 0 && c > 0) ? 1 : 0) << "\\n";
            continue;
        }
        long long e = powmod(b, c, MOD - 1);        // Fermat: exponents reduce mod p-1
        cout << Mint(a).pow(e) << "\\n";
    }
    return 0;
}`,
      explanation: [
        "b^c can be 10^9 raised to 10^9, a number with billions of digits, so it cannot even be stored - it has to be reduced before it is used as an exponent. Fermat's little theorem says a^(p-1) = 1 mod p whenever p is prime and a is not a multiple of p, so the map e -> a^e has period p-1 and only e mod (p-1) matters.",
        "That is the crucial asymmetry of this problem: the base is reduced modulo p = 10^9 + 7 while the exponent is reduced modulo p - 1 = 10^9 + 6. Two different moduli, two different rings. A Mint type is hard-wired to one modulus, so the exponent computation deliberately uses a separate plain powmod - trying to force the Mint to do both is the mistake this problem is designed to catch.",
        "The a divisible by p case must be split out, because Fermat's hypothesis fails there and a^(e mod (p-1)) would wrongly report 1 whenever the reduced exponent hits 0. Here a <= 10^9 < p, so the only such value is a = 0, and 0^x is 0 for x > 0 and 1 for x = 0.",
        "The other silent failure is reducing the exponent modulo p instead of p - 1. It gives the right answer on small inputs where no reduction actually happens, and wrong answers everywhere else, which makes it a nasty bug to spot from samples alone.",
        "In general, when the exponent tower is deeper than two levels or the modulus is composite, the correct tool is the generalised Euler theorem: a^e = a^((e mod phi(m)) + phi(m)) mod m for e >= log2(m).",
        "Time: O(n log MOD) - two exponentiations per query. Space: O(1).",
      ],
    },
    {
      name: "Graph Paths I",
      difficulty: "Hard",
      variation: "Matrix exponentiation over the Mint ring",
      link: "https://cses.fi/problemset/task/1723",
      question: [
        "A game consists of n levels connected by m one-way teleporters. Your task is to count the number of distinct walks of length exactly k from level 1 to level n, where the length of a walk is its number of teleporters. Levels and teleporters may be revisited, and parallel teleporters count separately. Print the answer modulo 10^9 + 7.",
        "Example 1:\nInput:\n4 6 4\n1 2\n2 1\n2 3\n3 4\n1 4\n4 4\nOutput:\n3\nExplanation: The three walks of length 4 from 1 to 4 are 1-2-3-4-4, 1-2-1-4-4 and 1-4-4-4-4.",
        "Example 2:\nInput:\n4 6 5\n1 2\n2 1\n2 3\n3 4\n1 4\n4 4\nOutput:\n5\nExplanation: The five walks are 1-2-1-2-3-4, 1-2-3-4-4-4, 1-2-1-4-4-4, 1-4-4-4-4-4 and 1-2-1-2-1-4.",
        "Constraints:\n- 1 <= n <= 100\n- 1 <= m <= n^2\n- 1 <= k <= 10^9",
      ],
      code: `const long long MOD = 1000000007;

struct Mint {
    long long v;
    Mint(long long x = 0) { v = x % MOD; if (v < 0) v += MOD; }
    Mint& operator+=(const Mint& o) { v += o.v; if (v >= MOD) v -= MOD; return *this; }
    Mint& operator*=(const Mint& o) { v = v * o.v % MOD; return *this; }
    friend Mint operator+(Mint a, const Mint& b) { return a += b; }
    friend Mint operator*(Mint a, const Mint& b) { return a *= b; }
    friend ostream& operator<<(ostream& os, const Mint& m) { return os << m.v; }
};

using Matrix = vector<vector<Mint>>;

Matrix mul(const Matrix& A, const Matrix& B) {
    int n = A.size();
    Matrix C(n, vector<Mint>(n));
    for (int i = 0; i < n; i++)
        for (int t = 0; t < n; t++) {
            if (A[i][t].v == 0) continue;           // skip a whole inner loop when possible
            Mint a = A[i][t];
            for (int j = 0; j < n; j++) C[i][j] += a * B[t][j];
        }
    return C;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    long long k;
    cin >> n >> m >> k;
    Matrix A(n, vector<Mint>(n));
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        A[a - 1][b - 1] += 1;                       // += so parallel edges accumulate
    }
    Matrix R(n, vector<Mint>(n));
    for (int i = 0; i < n; i++) R[i][i] = 1;        // identity
    while (k > 0) {
        if (k & 1) R = mul(R, A);
        A = mul(A, A);
        k >>= 1;
    }
    cout << R[0][n - 1] << "\\n";
    return 0;
}`,
      explanation: [
        "Let A be the adjacency matrix with A[u][v] = number of edges u to v. The standard identity is that (A^k)[u][v] counts walks of exactly k edges from u to v, because a matrix product sums over all choices of the intermediate vertex - which is exactly the one-more-edge recurrence written as linear algebra.",
        "k is up to 10^9, so the powers are taken by repeated squaring on matrices, the same binary exponentiation as for scalars. The reason this works is that n by n matrices over the integers mod p form a ring: multiplication is associative, so A^k is unambiguous no matter how the squarings are grouped.",
        "Everything happens over Mint, which is what makes the code short. A single entry of the product is a sum of n terms each under 10^18, so with raw long longs you would need a reduction inside the innermost loop or a 128-bit accumulator. Mint's operator*= reduces at every step and the correctness question disappears.",
        "Note the += when reading edges: parallel teleporters are distinct routes and must each add 1. Assigning 1 instead would silently collapse multi-edges and undercount.",
        "The main performance trap is a naive triple loop with the multiply inside the j loop over a non-contiguous B column. Iterating i, t, j as above keeps B[t][j] sequential in memory and, with the zero-skip, comfortably fits the 30 squarings at n = 100.",
        "Time: O(n^3 log k). Space: O(n^2).",
      ],
    },
    {
      name: "Fancy Sequence",
      difficulty: "Hard",
      variation: "Lazy affine transform inverted with a modular inverse",
      link: "https://leetcode.com/problems/fancy-sequence/",
      question: [
        "Design a data structure called Fancy that supports the following four operations on a sequence of integers, with every reported value taken modulo 10^9 + 7. append(val) appends val to the end of the sequence. addAll(inc) adds inc to every element currently in the sequence. multAll(m) multiplies every element currently in the sequence by m. getIndex(idx) returns the element at index idx, or -1 if idx is not a valid index.",
        "Example 1:\nInput: append(2), addAll(3), append(7), multAll(2), getIndex(0), addAll(3), append(10), multAll(2), getIndex(0), getIndex(1), getIndex(2)\nOutput: 10, 26, 34, 20\nExplanation: The sequence evolves [2] -> [5] -> [5,7] -> [10,14], so getIndex(0) is 10. Then [13,17] -> [13,17,10] -> [26,34,20], giving 26, 34 and 20.",
        "Example 2:\nInput: append(4), multAll(3), getIndex(0), getIndex(1)\nOutput: 12, -1\nExplanation: After multAll the single element is 12. Index 1 does not exist, so -1 is returned.",
        "Constraints:\n- 1 <= number of calls <= 10^5\n- 1 <= val, inc, m <= 100\n- 0 <= idx <= 10^5",
      ],
      code: `const long long MOD = 1000000007;

struct Mint {
    long long v;
    Mint(long long x = 0) { v = x % MOD; if (v < 0) v += MOD; }
    Mint& operator+=(const Mint& o) { v += o.v; if (v >= MOD) v -= MOD; return *this; }
    Mint& operator-=(const Mint& o) { v -= o.v; if (v < 0) v += MOD; return *this; }
    Mint& operator*=(const Mint& o) { v = v * o.v % MOD; return *this; }
    Mint pow(long long e) const {
        Mint b = *this, r = 1;
        while (e > 0) { if (e & 1) r *= b; b *= b; e >>= 1; }
        return r;
    }
    Mint inv() const { return pow(MOD - 2); }
    Mint& operator/=(const Mint& o) { return *this *= o.inv(); }
    friend Mint operator+(Mint a, const Mint& b) { return a += b; }
    friend Mint operator-(Mint a, const Mint& b) { return a -= b; }
    friend Mint operator*(Mint a, const Mint& b) { return a *= b; }
    friend Mint operator/(Mint a, const Mint& b) { return a /= b; }
};

class Fancy {
    // Global affine map: true value of stored[i] is mulLazy * stored[i] + addLazy.
    vector<Mint> stored;
    Mint mulLazy = 1, addLazy = 0;

public:
    Fancy() {}

    void append(int val) {
        // Invert the pending transform so the invariant holds for the new element too.
        stored.push_back((Mint(val) - addLazy) / mulLazy);
    }

    void addAll(int inc) { addLazy += inc; }

    void multAll(int m) {
        // f(x) = m*(a*x + b) = (m*a)*x + (m*b), so both parts scale.
        mulLazy *= m;
        addLazy *= m;
    }

    int getIndex(int idx) {
        if (idx < 0 || idx >= (int)stored.size()) return -1;
        return (int)(mulLazy * stored[idx] + addLazy).v;
    }
};`,
      explanation: [
        "The two bulk operations are both affine, and affine maps compose into affine maps, so the entire history of addAll and multAll calls collapses into a single pair (a, b) with true_value = a * stored + b. addAll(inc) becomes b += inc; multAll(m) becomes a *= m and b *= m, because the multiplication distributes over the already-pending shift.",
        "append is where the modular inverse earns its keep. The new element must satisfy the same invariant as the old ones, so its stored form is (val - b) / a. That division is a genuine modular inverse - and it exists for every reachable a because a is a product of factors in 1..100, none of which is a multiple of the prime 10^9 + 7, so a is never 0 mod p.",
        "The tempting wrong design is to actually apply each addAll and multAll to the array, which is O(n) per call and O(n^2) overall - about 10^10 operations at the constraint limit. The whole trick is to keep the transform lazy and un-apply it at insertion.",
        "The Mint type is what makes the invariant readable: append and getIndex are one expression each, written in the algebra of the problem, with every reduction and every underflow-to-negative case handled by the operators. Writing this with raw long longs means five separate manual reductions plus a signed correction on (val - b).",
        "A common variant of the same bug is caching the inverse of a. That is fine, but it must be recomputed on every multAll, not just once - a stale inverse gives correct answers until the first multAll and wrong ones after.",
        "Time: O(log MOD) per append (one exponentiation), O(1) for addAll, multAll and getIndex. Space: O(number of appends).",
      ],
    },
  ],
};
