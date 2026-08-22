import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Primality Test | Set 3 (Miller-Rabin)",
      difficulty: "Medium",
      variation: "Template: deterministic witnesses for 32-bit input",
      link: "https://www.geeksforgeeks.org/primality-test-set-3-miller-rabin/",
      question: [
        "Implement the Miller-Rabin primality test. Given an integer n, decide whether n is prime. Instead of testing random bases, use the fixed base set {2, 3, 5, 7}, which is known to be a correct and complete witness set for every n below 3,215,031,751 - so the test is fully deterministic over the whole 32-bit range.",
        "Recall the structure the test relies on: write n - 1 = d * 2^s with d odd. If n is prime then for every base a not divisible by n, either a^d = 1 (mod n) or one of a^d, a^(2d), a^(4d), ... , a^(2^(s-1) * d) equals n - 1 (mod n). A base for which neither holds is a witness that proves n composite.",
        "Example 1:\nInput: n = 11\nOutput: true\nExplanation: 11 - 1 = 10 = 5 * 2^1, so d = 5 and s = 1. For a = 2, 2^5 mod 11 = 32 mod 11 = 10 = n - 1, so base 2 is not a witness. The remaining bases 3, 5, 7 also fail to witness, so 11 is prime.",
        "Example 2:\nInput: n = 561\nOutput: false\nExplanation: 561 = 3 * 11 * 17. Here 560 = 35 * 2^4, so d = 35 and s = 4. With a = 2, 2^35 mod 561 = 263, and squaring gives 166, 67, 1 - none of them is 1 at the start and none is 560, so base 2 is a witness and 561 is composite. This is the smallest Carmichael number, which the plain Fermat test would call prime for every coprime base.",
        "Constraints:\n- 0 <= n < 3,215,031,751\n- The answer must be exact, not probabilistic",
      ],
      code: `typedef unsigned long long u64;

u64 powmod(u64 a, u64 e, u64 m) {
    u64 r = 1;
    a %= m;
    while (e) {
        // m < 2^32 here, so a plain 64-bit product cannot overflow
        if (e & 1) r = r * a % m;
        a = a * a % m;
        e >>= 1;
    }
    return r;
}

bool isPrime(u64 n) {
    if (n < 2) return false;
    for (u64 p : {2ULL, 3ULL, 5ULL, 7ULL}) {
        if (n % p == 0) return n == p;   // catches the bases themselves
    }
    u64 d = n - 1;
    int s = 0;
    while ((d & 1) == 0) { d >>= 1; ++s; }   // n - 1 = d * 2^s, d odd
    for (u64 a : {2ULL, 3ULL, 5ULL, 7ULL}) {
        u64 x = powmod(a, d, n);
        if (x == 1 || x == n - 1) continue;  // a is not a witness
        bool composite = true;
        for (int i = 1; i < s; ++i) {
            x = x * x % n;
            if (x == n - 1) { composite = false; break; }
        }
        if (composite) return false;        // a witnesses compositeness
    }
    return true;
}`,
      explanation: [
        "The test is built on two facts about a prime modulus n. First, Fermat: a^(n-1) = 1 (mod n) for every a not divisible by n. Second, and this is the part Fermat alone throws away, the only square roots of 1 modulo a prime are 1 and -1, because x^2 - 1 = (x-1)(x+1) can only be divisible by a prime n if one of the two factors is.",
        "So take the chain a^d, a^(2d), a^(4d), ... , a^((2^s)d) = a^(n-1). If n is prime that chain must end at 1, and the step at which it first becomes 1 must have been entered from n - 1, never from anything else. Hence for a prime either the chain starts at 1, or n - 1 appears somewhere in it. Observing a chain that reaches 1 without passing through n - 1 exposes a nontrivial square root of 1, which is only possible for a composite modulus - that is exactly what a witness is.",
        "The trap is stopping at Fermat. Carmichael numbers such as 561, 1105 and 1729 satisfy a^(n-1) = 1 for every base coprime to them, so a Fermat test can never expose them no matter how many bases you draw. Miller-Rabin has no such blind spot: for every odd composite n at least three quarters of the bases in [2, n-2] are witnesses, and small explicit base sets have been verified to cover fixed ranges exactly.",
        "That verification is what makes this version deterministic rather than probabilistic. {2, 3, 5, 7} is complete below 3,215,031,751 (which is itself a strong pseudoprime to all four bases, so the bound is tight), {2, 7, 61} is complete below 4,759,123,141, and {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37} is complete for every 64-bit value.",
        "The small-prime trial loop at the top is not just an optimisation: it keeps the main loop from ever calling powmod with a base that is a multiple of n, which is the one input the chain argument does not cover.",
        "Time: O(k log n) modular multiplications with k = 4 bases, so O(log n) overall. Space: O(1).",
      ],
    },
    {
      name: "Fermat Method of Primality Test",
      difficulty: "Easy",
      variation: "Fermat base test, the precursor",
      link: "https://www.geeksforgeeks.org/fermat-method-of-primality-test/",
      question: [
        "Implement the Fermat probabilistic primality test. Given an integer n and a repetition count k, pick k random bases a in the range [2, n-2] and check whether a^(n-1) = 1 (mod n). Return false as soon as any base fails, and true if all k bases pass. Returning true means 'probably prime'.",
        "Example 1:\nInput: n = 11, k = 3\nOutput: true\nExplanation: Every base coprime to 11 satisfies a^10 = 1 (mod 11); for instance 2^10 = 1024 = 93 * 11 + 1, so 2^10 mod 11 = 1.",
        "Example 2:\nInput: n = 15, k = 3\nOutput: false\nExplanation: With a = 2, 2^14 mod 15 = 4, not 1, so 15 is reported composite. Any base drawn from [2, 13] either shares a factor with 15 or fails the congruence, so the answer is reliable here.",
        "Constraints:\n- 5 <= n <= 10^18\n- 1 <= k <= 50",
      ],
      code: `typedef unsigned long long u64;

u64 mulmod(u64 a, u64 b, u64 m) {
    return (u64)((__uint128_t)a * b % m);   // 128-bit product, safe for any 64-bit m
}

u64 powmod(u64 a, u64 e, u64 m) {
    u64 r = 1;
    a %= m;
    while (e) {
        if (e & 1) r = mulmod(r, a, m);
        a = mulmod(a, a, m);
        e >>= 1;
    }
    return r;
}

bool isPrimeFermat(u64 n, int k) {
    if (n < 2) return false;
    if (n == 2 || n == 3) return true;
    if (n % 2 == 0) return false;
    while (k--) {
        u64 a = 2 + (u64)rand() % (n - 3);   // a uniform in [2, n-2]
        if (std::gcd(a, n) != 1) return false;  // a shares a factor: n is certainly composite
        if (powmod(a, n - 1, n) != 1) return false;
    }
    return true;                             // probably prime
}`,
      explanation: [
        "Fermat's little theorem says that if n is prime then a^(n-1) = 1 (mod n) for every a in [1, n-1]. The test uses the contrapositive: a base that breaks the congruence proves n composite. Such a base is called a Fermat witness, and one that satisfies the congruence for a composite n is called a Fermat liar.",
        "For a typical composite the liars are rare, so k independent bases drive the error down quickly. The gcd check is a free strengthening - if the drawn base is not coprime to n we have literally found a factor, so we can answer composite with certainty instead of relying on the exponentiation.",
        "The fatal weakness is the Carmichael numbers: composites for which every base coprime to n is a liar. For n = 561 = 3 * 11 * 17 the only bases that expose it are the multiples of 3, 11 or 17, which the gcd check catches but which a pure Fermat implementation would let through, and for larger Carmichael numbers those bases are a vanishing fraction of the range. So no repetition count makes this test safe. Miller-Rabin removes the blind spot by additionally inspecting the square roots of 1 along the way, and it is what you should actually ship.",
        "Time: O(k log n) modular multiplications. Space: O(1).",
      ],
    },
    {
      name: "Carmichael Numbers",
      difficulty: "Easy",
      variation: "Fermat liars: why witnesses must be strong",
      link: "https://www.geeksforgeeks.org/carmichael-numbers/",
      question: [
        "A Carmichael number is a composite number n such that a^(n-1) = 1 (mod n) holds for every integer a in [2, n-1] that is coprime to n. These are exactly the numbers that fool the Fermat primality test. Given n, determine whether it is a Carmichael number.",
        "Example 1:\nInput: n = 561\nOutput: true\nExplanation: 561 = 3 * 11 * 17 is composite, and every a coprime to 561 satisfies a^560 = 1 (mod 561). It is the smallest Carmichael number.",
        "Example 2:\nInput: n = 8\nOutput: false\nExplanation: 8 is composite but a = 3 is coprime to 8 and 3^7 = 2187 = 273 * 8 + 3, so 3^7 mod 8 = 3, not 1.",
        "Constraints:\n- 1 <= n <= 10^5",
      ],
      code: `long long powmod(long long a, long long e, long long m) {
    long long r = 1;
    a %= m;
    while (e) {
        if (e & 1) r = r * a % m;
        a = a * a % m;
        e >>= 1;
    }
    return r;
}

bool isPrimeTrial(long long n) {
    if (n < 2) return false;
    for (long long i = 2; i * i <= n; ++i) {
        if (n % i == 0) return false;
    }
    return true;
}

bool isCarmichael(long long n) {
    if (n < 4) return false;
    if (isPrimeTrial(n)) return false;      // must be composite by definition
    for (long long a = 2; a < n; ++a) {
        if (std::gcd(a, n) != 1) continue;      // only coprime bases are required to pass
        if (powmod(a, n - 1, n) != 1) return false;
    }
    return true;
}`,
      explanation: [
        "The definition is checked directly: reject anything prime, then sweep every base below n, skip the ones sharing a factor with n, and require the Fermat congruence from all the rest. A single failure disqualifies n.",
        "For larger n use Korselt's criterion instead of the sweep: n is Carmichael exactly when n is composite, squarefree, and p - 1 divides n - 1 for every prime p dividing n. For 561 = 3 * 11 * 17 this reads 2 | 560, 10 | 560 and 16 | 560, all true. That turns an O(n log n) sweep into one factorisation.",
        "The point of the exercise is the consequence for primality testing. Carmichael numbers are infinite in number, so 'run Fermat with many random bases' can never be made sound. Miller-Rabin fixes this because it does not only look at a^(n-1): it looks at the whole squaring chain from a^d up, and a composite n always leaks a nontrivial square root of 1 there. That is why at least three quarters of all bases are strong witnesses for every odd composite, Carmichael or not.",
        "Time: O(n log n) for the sweep, O(sqrt(n)) with Korselt's criterion. Space: O(1).",
      ],
    },
    {
      name: "Next Prime",
      difficulty: "Easy",
      variation: "Scan upward with a primality oracle",
      link: "https://atcoder.jp/contests/abc149/tasks/abc149_c",
      question: [
        "Takahashi has an integer X. He wants the smallest prime number that is greater than or equal to X. Read X from standard input and print that prime.",
        "Example 1:\nInput:\n20\nOutput: 23\nExplanation: 20, 21 and 22 are composite; 23 is prime.",
        "Example 2:\nInput:\n2\nOutput: 2\nExplanation: X itself is already prime, so the answer is X.",
        "Constraints:\n- 2 <= X <= 10^5\n- X is an integer",
      ],
      code: `typedef unsigned long long u64;

u64 powmod(u64 a, u64 e, u64 m) {
    u64 r = 1;
    a %= m;
    while (e) {
        if (e & 1) r = r * a % m;
        a = a * a % m;
        e >>= 1;
    }
    return r;
}

bool isPrime(u64 n) {
    if (n < 2) return false;
    for (u64 p : {2ULL, 3ULL, 5ULL, 7ULL}) {
        if (n % p == 0) return n == p;
    }
    u64 d = n - 1;
    int s = 0;
    while ((d & 1) == 0) { d >>= 1; ++s; }
    for (u64 a : {2ULL, 3ULL, 5ULL, 7ULL}) {
        u64 x = powmod(a, d, n);
        if (x == 1 || x == n - 1) continue;
        bool composite = true;
        for (int i = 1; i < s; ++i) {
            x = x * x % n;
            if (x == n - 1) { composite = false; break; }
        }
        if (composite) return false;
    }
    return true;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    long long x;
    cin >> x;
    while (!isPrime(x)) ++x;
    cout << x << "\\n";
    return 0;
}`,
      explanation: [
        "Once you have an O(log n) primality oracle, 'next prime' is just a linear scan. Prime gaps below 10^5 never exceed 72, so the loop runs a tiny number of iterations regardless of where X lands.",
        "This is the canonical reason to reach for Miller-Rabin over a sieve: the test needs no precomputation and no memory proportional to the bound, so the same code works unchanged if the constraint jumps from 10^5 to 10^18. A sieve of Eratosthenes solves this particular version faster in bulk, but only because the bound is small enough to allocate.",
        "The base set {2, 3, 5, 7} is deterministic below 3,215,031,751, which comfortably covers X plus any gap here, so the scan cannot be fooled into stopping early.",
        "Time: O(g log X) where g is the prime gap after X, so O(log X) in practice. Space: O(1).",
      ],
    },
    {
      name: "Prime or Not",
      difficulty: "Medium",
      variation: "Full 64-bit primality with 128-bit modular multiplication",
      link: "https://www.spoj.com/problems/PON/",
      question: [
        "For each of t test cases you are given one integer N. Print 'YES' if N is prime and 'NO' otherwise. N can be as large as a 64-bit value allows, so trial division and sieving are both out of reach.",
        "Example 1:\nInput:\n5\n2\n3\n4\n5\n1000000007\nOutput:\nYES\nYES\nNO\nYES\nYES\nExplanation: 4 = 2 * 2 is composite; 1000000007 is the well-known prime often used as a modulus.",
        "Example 2:\nInput:\n3\n1\n2147483647\n9223372036854775807\nOutput:\nNO\nYES\nNO\nExplanation: 1 is neither prime nor composite, so the answer is NO. 2147483647 = 2^31 - 1 is the Mersenne prime M31. 2^63 - 1 = 7^2 * 73 * 127 * 337 * 92737 * 649657 is composite, and it is the input that overflows any implementation multiplying two residues in 64 bits.",
        "Constraints:\n- 1 <= t <= 500\n- 1 <= N <= 2^63 - 1",
      ],
      code: `typedef unsigned long long u64;

u64 mulmod(u64 a, u64 b, u64 m) {
    return (u64)((__uint128_t)a * b % m);   // the whole trick: widen before multiplying
}

u64 powmod(u64 a, u64 e, u64 m) {
    u64 r = 1;
    a %= m;
    while (e) {
        if (e & 1) r = mulmod(r, a, m);
        a = mulmod(a, a, m);
        e >>= 1;
    }
    return r;
}

bool isPrime(u64 n) {
    if (n < 2) return false;
    for (u64 p : {2ULL, 3ULL, 5ULL, 7ULL, 11ULL, 13ULL, 17ULL, 19ULL, 23ULL, 29ULL, 31ULL, 37ULL}) {
        if (n % p == 0) return n == p;
    }
    u64 d = n - 1;
    int s = 0;
    while ((d & 1) == 0) { d >>= 1; ++s; }
    for (u64 a : {2ULL, 3ULL, 5ULL, 7ULL, 11ULL, 13ULL, 17ULL, 19ULL, 23ULL, 29ULL, 31ULL, 37ULL}) {
        u64 x = powmod(a, d, n);
        if (x == 1 || x == n - 1) continue;
        bool composite = true;
        for (int i = 1; i < s; ++i) {
            x = mulmod(x, x, n);
            if (x == n - 1) { composite = false; break; }
        }
        if (composite) return false;
    }
    return true;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t;
    cin >> t;
    while (t--) {
        u64 n;
        cin >> n;
        cout << (isPrime(n) ? "YES" : "NO") << "\\n";
    }
    return 0;
}`,
      explanation: [
        "The algorithm is unchanged from the 32-bit template; the only thing that breaks at this scale is arithmetic. With n near 2^63 the product of two residues is near 2^126, so a plain 64-bit multiply silently wraps and the test starts returning nonsense - typically declaring large primes composite. Widening to __uint128_t before the multiply and reducing afterwards fixes it exactly.",
        "If the judge's compiler has no 128-bit type, the standard replacements are Russian-peasant multiplication (add-and-double with modular reduction, O(log m) per multiply and about 60 times slower) or long double / Barrett / Montgomery reduction. Montgomery is what competitive libraries use when this is on the hot path.",
        "Correctness of the answer, not just of the arithmetic, comes from the base set: {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37} - the first twelve primes - has been verified to contain a witness for every composite below 3.3 * 10^24, so it is exact for the entire 64-bit range. Random bases would leave a small error probability for no gain in speed.",
        "Two easy input traps: N = 1 must answer NO, and the small-prime pre-loop must return true when N is one of the bases rather than falling into the witness loop with a base divisible by n.",
        "Time: O(t * 12 * log N) modular multiplications. Space: O(1).",
      ],
    },
    {
      name: "Prime Pairs With Target Sum",
      difficulty: "Medium",
      variation: "Primality oracle inside a linear scan",
      link: "https://leetcode.com/problems/prime-pairs-with-target-sum/",
      question: [
        "You are given an integer n. Return a 2D sorted list of prime number pairs [x, y] such that x + y = n, 1 <= x <= y <= n, and both x and y are prime. The list must be sorted in increasing order of x. If there are no such pairs, return an empty list.",
        "Example 1:\nInput: n = 10\nOutput: [[3,7],[5,5]]\nExplanation: 3 + 7 = 10 with both prime, and 5 + 5 = 10 with 5 prime. The pair [2,8] fails because 8 is not prime.",
        "Example 2:\nInput: n = 2\nOutput: []\nExplanation: There is no way to write 2 as a sum of two primes each at least 1.",
        "Constraints:\n- 1 <= n <= 10^6",
      ],
      code: `typedef unsigned long long u64;

u64 powmod(u64 a, u64 e, u64 m) {
    u64 r = 1;
    a %= m;
    while (e) {
        if (e & 1) r = r * a % m;
        a = a * a % m;
        e >>= 1;
    }
    return r;
}

bool isPrime(u64 n) {
    if (n < 2) return false;
    for (u64 p : {2ULL, 3ULL, 5ULL, 7ULL}) {
        if (n % p == 0) return n == p;
    }
    u64 d = n - 1;
    int s = 0;
    while ((d & 1) == 0) { d >>= 1; ++s; }
    for (u64 a : {2ULL, 3ULL, 5ULL, 7ULL}) {
        u64 x = powmod(a, d, n);
        if (x == 1 || x == n - 1) continue;
        bool composite = true;
        for (int i = 1; i < s; ++i) {
            x = x * x % n;
            if (x == n - 1) { composite = false; break; }
        }
        if (composite) return false;
    }
    return true;
}

vector<vector<int>> findPrimePairs(int n) {
    vector<vector<int>> res;
    // x <= y forces x <= n / 2, which also removes every duplicate pair
    for (int x = 2; x <= n / 2; ++x) {
        if (isPrime(x) && isPrime(n - x)) res.push_back({x, n - x});
    }
    return res;
}`,
      explanation: [
        "Fixing x determines y = n - x, so the whole problem is a single pass over candidate x values with two primality queries each. Capping the loop at n / 2 is what enforces x <= y, so no pair is emitted twice and no sorting step is needed - x is already increasing.",
        "Miller-Rabin makes each query O(log n) with zero setup. A sieve of Eratosthenes over [0, n] is the faster choice here at 10^6 because it amortises to roughly constant time per query, but it costs O(n) memory; the witness test is the version that survives if n grows past what you can allocate.",
        "One useful pruning observation: apart from n = 4 = 2 + 2, an odd n can only be split as odd + odd if one summand is 2, and 2 + (n-2) needs n - 2 prime, so odd n yields at most one pair. Even n is the interesting case and is exactly the Goldbach setting.",
        "Time: O(n log n) with the witness test, O(n log log n) with a sieve. Space: O(1) extra beyond the output with the witness test.",
      ],
    },
    {
      name: "Closest Prime Numbers in Range",
      difficulty: "Medium",
      variation: "Minimum prime gap in a window",
      link: "https://leetcode.com/problems/closest-prime-numbers-in-range/",
      question: [
        "Given two positive integers left and right, find the two integers num1 and num2 such that left <= num1 < num2 <= right, both num1 and num2 are prime, and num2 - num1 is the minimum among all such pairs. Return [num1, num2]. If there are multiple pairs achieving the minimum difference, return the one with the smallest num1. If no such pair exists, return [-1, -1].",
        "Example 1:\nInput: left = 10, right = 19\nOutput: [11,13]\nExplanation: The primes in range are 11, 13, 17, 19. The consecutive gaps are 2, 4 and 2; the minimum is 2 and the pair with the smaller first element is [11,13].",
        "Example 2:\nInput: left = 4, right = 6\nOutput: [-1,-1]\nExplanation: 5 is the only prime in the range, so no pair exists.",
        "Constraints:\n- 1 <= left <= right <= 10^6",
      ],
      code: `typedef unsigned long long u64;

u64 powmod(u64 a, u64 e, u64 m) {
    u64 r = 1;
    a %= m;
    while (e) {
        if (e & 1) r = r * a % m;
        a = a * a % m;
        e >>= 1;
    }
    return r;
}

bool isPrime(u64 n) {
    if (n < 2) return false;
    for (u64 p : {2ULL, 3ULL, 5ULL, 7ULL}) {
        if (n % p == 0) return n == p;
    }
    u64 d = n - 1;
    int s = 0;
    while ((d & 1) == 0) { d >>= 1; ++s; }
    for (u64 a : {2ULL, 3ULL, 5ULL, 7ULL}) {
        u64 x = powmod(a, d, n);
        if (x == 1 || x == n - 1) continue;
        bool composite = true;
        for (int i = 1; i < s; ++i) {
            x = x * x % n;
            if (x == n - 1) { composite = false; break; }
        }
        if (composite) return false;
    }
    return true;
}

vector<int> closestPrimes(int left, int right) {
    int prev = -1, a = -1, b = -1;
    for (int x = max(left, 2); x <= right; ++x) {
        if (!isPrime(x)) continue;
        // strict '<' keeps the earliest pair on ties
        if (prev != -1 && (a == -1 || x - prev < b - a)) { a = prev; b = x; }
        prev = x;
        if (b - a == 1) break;              // gap 1 only happens for (2, 3): optimal
    }
    return {a, b};
}`,
      explanation: [
        "The closest pair must be two consecutive primes: inserting any prime between them would give a strictly smaller gap. So a single left-to-right sweep that remembers only the previous prime sees every candidate pair, and no pairwise comparison is needed.",
        "The tie rule falls out of using a strict improvement test. Because x increases, the first pair achieving the minimum gap is the one with the smallest num1, and later pairs with an equal gap are rejected.",
        "Watch the two edge cases: left may be 1 or 0, so the scan starts at max(left, 2), and a range containing fewer than two primes must return [-1, -1], which the sentinel initialisation already does. The gap-1 early exit is valid because 2 and 3 are the only primes one apart.",
        "A sieve over [left, right] is the standard accepted solution at this bound and is faster. Miller-Rabin is the right tool if the same question is posed on a narrow window sitting at 10^18, where a full sieve is impossible and a segmented sieve is far more code.",
        "Time: O((right - left) log right). Space: O(1).",
      ],
    },
    {
      name: "2017-like Number",
      difficulty: "Medium",
      variation: "Precomputed primality plus prefix sums over queries",
      link: "https://atcoder.jp/contests/abc084/tasks/abc084_d",
      question: [
        "Call a positive integer N a 2017-like number if both N and (N + 1) / 2 are prime. The number 2017 qualifies because 2017 is prime and (2017 + 1) / 2 = 1009 is prime. You are given Q queries; the i-th query gives two odd numbers l and r, and you must print how many 2017-like numbers N satisfy l <= N <= r.",
        "Example 1:\nInput:\n1\n3 7\nOutput:\n2\nExplanation: N = 3 works since 3 and (3+1)/2 = 2 are prime. N = 5 works since 5 and 3 are prime. N = 7 fails since (7+1)/2 = 4 is not prime.",
        "Example 2:\nInput:\n1\n13 13\nOutput:\n1\nExplanation: 13 is prime and (13+1)/2 = 7 is prime.",
        "Constraints:\n- 1 <= Q <= 10^5\n- 1 <= l <= r <= 10^5\n- l and r are odd",
      ],
      code: `typedef unsigned long long u64;

u64 powmod(u64 a, u64 e, u64 m) {
    u64 r = 1;
    a %= m;
    while (e) {
        if (e & 1) r = r * a % m;
        a = a * a % m;
        e >>= 1;
    }
    return r;
}

bool isPrime(u64 n) {
    if (n < 2) return false;
    for (u64 p : {2ULL, 3ULL, 5ULL, 7ULL}) {
        if (n % p == 0) return n == p;
    }
    u64 d = n - 1;
    int s = 0;
    while ((d & 1) == 0) { d >>= 1; ++s; }
    for (u64 a : {2ULL, 3ULL, 5ULL, 7ULL}) {
        u64 x = powmod(a, d, n);
        if (x == 1 || x == n - 1) continue;
        bool composite = true;
        for (int i = 1; i < s; ++i) {
            x = x * x % n;
            if (x == n - 1) { composite = false; break; }
        }
        if (composite) return false;
    }
    return true;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const int MAXV = 100000;
    vector<int> pre(MAXV + 1, 0);
    for (int x = 1; x <= MAXV; ++x) {
        int good = (x % 2 == 1 && isPrime(x) && isPrime((x + 1) / 2)) ? 1 : 0;
        pre[x] = pre[x - 1] + good;          // pre[x] = count of 2017-like numbers <= x
    }
    int q;
    cin >> q;
    while (q--) {
        int l, r;
        cin >> l >> r;
        cout << pre[r] - pre[l - 1] << "\\n";
    }
    return 0;
}`,
      explanation: [
        "With up to 10^5 queries over a fixed universe of 10^5 values, answering each query by scanning would be 10^10 operations. Instead classify every value once and store a prefix count, turning each query into a single subtraction.",
        "The classification itself needs two primality checks per value, which is exactly what a constant-time-setup test like Miller-Rabin gives. Note that 1 is neither odd-prime nor prime, so pre[1] must be 0, and pre[0] = 0 makes the pre[l-1] lookup safe for l = 1 without a special case.",
        "The condition is deliberately asymmetric: N must be prime and (N+1)/2 must be prime. Only odd N are even eligible, since (N+1)/2 must be an integer. Forgetting the oddness guard makes the expression (x+1)/2 silently truncate for even x and produces wrong counts.",
        "A sieve up to 10^5 does the same precomputation faster; the witness test is used here because it needs no table and generalises directly if the bound were 10^12 with sparse queries.",
        "Time: O(MAXV log MAXV) precomputation plus O(1) per query. Space: O(MAXV).",
      ],
    },
    {
      name: "Prime Generator",
      difficulty: "Medium",
      variation: "Primality over a narrow window at a large offset",
      link: "https://www.spoj.com/problems/PRIME1/",
      question: [
        "You are given t test cases. Each test case has two numbers m and n, and you must print all prime numbers p with m <= p <= n, one per line, in increasing order. Print an empty line between consecutive test cases. The window is narrow but its offset can be large.",
        "Example 1:\nInput:\n2\n1 10\n3 5\nOutput:\n2\n3\n5\n7\n\n3\n5\nExplanation: The primes up to 10 are 2, 3, 5 and 7; between 3 and 5 they are 3 and 5. A blank line separates the two blocks.",
        "Constraints:\n- 1 <= t <= 10\n- 1 <= m <= n <= 10^9\n- n - m <= 10^5",
      ],
      code: `typedef unsigned long long u64;

u64 powmod(u64 a, u64 e, u64 m) {
    u64 r = 1;
    a %= m;
    while (e) {
        if (e & 1) r = r * a % m;   // m <= 10^9 so a 64-bit product is safe
        a = a * a % m;
        e >>= 1;
    }
    return r;
}

bool isPrime(u64 n) {
    if (n < 2) return false;
    for (u64 p : {2ULL, 3ULL, 5ULL, 7ULL}) {
        if (n % p == 0) return n == p;
    }
    u64 d = n - 1;
    int s = 0;
    while ((d & 1) == 0) { d >>= 1; ++s; }
    for (u64 a : {2ULL, 3ULL, 5ULL, 7ULL}) {
        u64 x = powmod(a, d, n);
        if (x == 1 || x == n - 1) continue;
        bool composite = true;
        for (int i = 1; i < s; ++i) {
            x = x * x % n;
            if (x == n - 1) { composite = false; break; }
        }
        if (composite) return false;
    }
    return true;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t;
    cin >> t;
    for (int tc = 0; tc < t; ++tc) {
        long long m, n;
        cin >> m >> n;
        if (tc) cout << "\\n";               // blank line between blocks, not after the last
        for (long long x = max(m, 2LL); x <= n; ++x) {
            if (isPrime(x)) cout << x << "\\n";
        }
    }
    return 0;
}`,
      explanation: [
        "A sieve of Eratosthenes up to 10^9 needs a billion cells and is impossible here. The two standard answers are a segmented sieve - sieve primes up to sqrt(n) = 31623, then mark their multiples inside the window - and a per-number Miller-Rabin, which is what this solution does.",
        "The witness test wins on code size: no offset arithmetic, no base-sieve, no risk of the classic segmented-sieve bug of starting the marking at p*p instead of the first multiple inside the window. It costs about four modular exponentiations per candidate, so roughly 10^5 * 4 * 30 modular multiplications per test case, which fits comfortably.",
        "Because n <= 10^9, the base set {2, 3, 5, 7} is provably exact and residue products stay below 2^63, so no 128-bit multiply is needed. If the bound were raised to 10^18 the same code works after switching mulmod to __uint128_t and extending the base list to the first twelve primes.",
        "The output format is the other half of the problem: m can be 1, which must not be printed as prime, and the blank line goes between blocks rather than after every block.",
        "Time: O(t * (n - m) log n). Space: O(1).",
      ],
    },
    {
      name: "Prime Palindrome",
      difficulty: "Hard",
      variation: "Generate candidates, test primality (constructive search)",
      link: "https://leetcode.com/problems/prime-palindrome/",
      question: [
        "Given an integer n, return the smallest prime palindrome greater than or equal to n. An integer is a palindrome if it reads the same from left to right as from right to left, and a prime if it is greater than 1 and has no positive divisors other than 1 and itself. It is guaranteed that the answer exists and is at most 2 * 10^8.",
        "Example 1:\nInput: n = 6\nOutput: 7\nExplanation: 7 is both prime and a palindrome.",
        "Example 2:\nInput: n = 13\nOutput: 101\nExplanation: 13 is prime but not a palindrome. The palindromes above it are 22, 33, 44, 55, 66, 77, 88, 99 - every one divisible by 11 and none of them equal to 11 - and then 101, which is prime.",
        "Constraints:\n- 1 <= n <= 10^8",
      ],
      code: `typedef unsigned long long u64;

u64 powmod(u64 a, u64 e, u64 m) {
    u64 r = 1;
    a %= m;
    while (e) {
        if (e & 1) r = r * a % m;
        a = a * a % m;
        e >>= 1;
    }
    return r;
}

bool isPrime(u64 n) {
    if (n < 2) return false;
    for (u64 p : {2ULL, 3ULL, 5ULL, 7ULL}) {
        if (n % p == 0) return n == p;
    }
    u64 d = n - 1;
    int s = 0;
    while ((d & 1) == 0) { d >>= 1; ++s; }
    for (u64 a : {2ULL, 3ULL, 5ULL, 7ULL}) {
        u64 x = powmod(a, d, n);
        if (x == 1 || x == n - 1) continue;
        bool composite = true;
        for (int i = 1; i < s; ++i) {
            x = x * x % n;
            if (x == n - 1) { composite = false; break; }
        }
        if (composite) return false;
    }
    return true;
}

int primePalindrome(int n) {
    if (n <= 11) {
        for (int x : {2, 3, 5, 7, 11}) {
            if (x >= n) return x;            // the only even-length case, 11, lives here
        }
    }
    // every palindrome with an even number of digits is a multiple of 11,
    // so beyond 11 only odd-length palindromes can be prime
    for (long long root = 1; root < 100000; ++root) {
        string s = to_string(root), rev = s;
        reverse(rev.begin(), rev.end());
        long long p = stoll(s + rev.substr(1));   // mirror, sharing the middle digit
        if (p >= n && isPrime(p)) return (int)p;
    }
    return -1;
}`,
      explanation: [
        "Scanning every integer from n upward and testing both properties is far too slow: prime palindromes are extremely sparse, and the answer can sit tens of millions above n. Invert the search - generate palindromes in increasing order and test each one for primality. There are only about 10^5 palindromes below 10^9, so the primality test is called a trivial number of times.",
        "The key number-theoretic prune is that any palindrome with an even number of digits is divisible by 11. Take the alternating digit sum: mirrored digit pairs sit at positions of opposite parity, so the alternating sum cancels to 0, and divisibility by 11 follows. Hence 11 is the only even-length prime palindrome, handled as a special case, and the generator only needs to emit odd-length palindromes.",
        "Odd-length palindromes are produced by taking a root, mirroring it, and dropping the duplicated middle digit: root 10 gives 101, root 123 gives 12321. Iterating root from 1 upward emits them in strictly increasing numeric order, so the first one that is at least n and prime is the answer - no sorting or extra comparison needed.",
        "Roots below 100000 cover palindromes up to nine digits, which is enough because the answer never exceeds 100030001. The tempting shortcut of returning the first palindrome at or above n without a primality check fails immediately on n = 13.",
        "Time: O(P log A) where P is about 10^5 candidate palindromes and A is the answer size. Space: O(1) beyond the small strings.",
      ],
    },
    {
      name: "Divisors",
      difficulty: "Hard",
      variation: "Structure recovery: prime powers via integer roots, semiprimes via gcd",
      link: "https://codeforces.com/problemset/problem/1033/D",
      question: [
        "You are given n integers a_1, ..., a_n. It is guaranteed that each a_i has between 3 and 5 divisors inclusive. Let a be the product of all of them. Print the number of divisors of a modulo 998244353.",
        "Because every a_i has 3, 4 or 5 divisors, it must have one of exactly four shapes: p^2 (3 divisors), p^3 or p * q with distinct primes p and q (4 divisors), or p^4 (5 divisors). The values are far too large to factor by trial division, so you must recover this structure using a primality test, integer roots, and gcds between the inputs.",
        "Example 1:\nInput:\n3\n9 15 143\nOutput:\n32\nExplanation: 9 = 3^2, 15 = 3 * 5, 143 = 11 * 13, so the product is 3^3 * 5 * 11 * 13 and has 4 * 2 * 2 * 2 = 32 divisors.",
        "Example 2:\nInput:\n2\n15 21\nOutput:\n12\nExplanation: gcd(15, 21) = 3 splits both, giving 15 = 3 * 5 and 21 = 3 * 7. The product 315 = 3^2 * 5 * 7 has 3 * 2 * 2 = 12 divisors.",
        "Constraints:\n- 1 <= n <= 500\n- 1 <= a_i <= 2^63 - 1\n- Each a_i has between 3 and 5 divisors",
      ],
      code: `typedef unsigned long long u64;

u64 mulmod(u64 a, u64 b, u64 m) { return (u64)((__uint128_t)a * b % m); }

u64 powmod(u64 a, u64 e, u64 m) {
    u64 r = 1;
    a %= m;
    while (e) {
        if (e & 1) r = mulmod(r, a, m);
        a = mulmod(a, a, m);
        e >>= 1;
    }
    return r;
}

bool isPrime(u64 n) {
    if (n < 2) return false;
    for (u64 p : {2ULL, 3ULL, 5ULL, 7ULL, 11ULL, 13ULL, 17ULL, 19ULL, 23ULL, 29ULL, 31ULL, 37ULL}) {
        if (n % p == 0) return n == p;
    }
    u64 d = n - 1;
    int s = 0;
    while ((d & 1) == 0) { d >>= 1; ++s; }
    for (u64 a : {2ULL, 3ULL, 5ULL, 7ULL, 11ULL, 13ULL, 17ULL, 19ULL, 23ULL, 29ULL, 31ULL, 37ULL}) {
        u64 x = powmod(a, d, n);
        if (x == 1 || x == n - 1) continue;
        bool composite = true;
        for (int i = 1; i < s; ++i) {
            x = mulmod(x, x, n);
            if (x == n - 1) { composite = false; break; }
        }
        if (composite) return false;
    }
    return true;
}

const __int128 LIM = (__int128)1 << 66;

__int128 ipow(u64 b, int k) {
    __int128 r = 1;
    for (int i = 0; i < k; ++i) {
        if (r > LIM / (__int128)b) return LIM + 1;   // saturate instead of overflowing
        r *= (__int128)b;
    }
    return r;
}

u64 iroot(u64 v, int k) {
    u64 lo = 1, hi = 4300000000ULL;                 // covers the square root of 2^63
    while (lo < hi) {
        u64 mid = lo + (hi - lo + 1) / 2;
        if (ipow(mid, k) <= (__int128)v) lo = mid; else hi = mid - 1;
    }
    return lo;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const long long MOD = 998244353;
    int n;
    cin >> n;
    map<u64, long long> expo;      // prime -> exponent in the product
    map<u64, int> pending;         // unsplit p*q value -> how many times it appears
    for (int i = 0; i < n; ++i) {
        u64 v;
        cin >> v;
        bool done = false;
        for (int k = 2; k <= 4 && !done; ++k) {
            u64 r = iroot(v, k);
            // a prime k-th root identifies v as p^k; the three cases are mutually exclusive
            if (ipow(r, k) == (__int128)v && isPrime(r)) {
                expo[r] += k;
                done = true;
            }
        }
        if (!done) pending[v]++;
    }
    bool changed = true;
    while (changed) {
        changed = false;
        for (auto it = pending.begin(); it != pending.end(); ) {
            u64 v = it->first;
            int c = it->second;
            u64 p = 0;
            for (auto& kv : expo) {
                if (v % kv.first == 0) { p = kv.first; break; }
            }
            if (p == 0) {
                for (auto& kv : pending) {
                    if (kv.first == v) continue;
                    u64 g = std::gcd(v, kv.first);
                    if (g > 1) { p = g; break; }     // g is a common prime of two semiprimes
                }
            }
            if (p != 0) {
                expo[p] += c;
                expo[v / p] += c;
                it = pending.erase(it);
                changed = true;
            } else {
                ++it;
            }
        }
    }
    long long ans = 1;
    for (auto& kv : expo) ans = ans * ((kv.second + 1) % MOD) % MOD;
    for (auto& kv : pending) {
        // both primes stay anonymous but each occurs exactly kv.second times
        long long t = (kv.second + 1) % MOD;
        ans = ans * t % MOD * t % MOD;
    }
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "The number of divisors is multiplicative over the prime factorisation: if the product is prod p_i^e_i then the answer is prod (e_i + 1). So the whole task is to recover the exponent multiset, and crucially you never need to know the primes themselves - only how often each occurs.",
        "The divisor-count promise pins each input to one of four shapes. Prime powers are detected by taking exact integer square, cube and fourth roots and asking Miller-Rabin whether the root is prime. The three tests cannot both fire: for p^2 the square root is prime, for p^4 the square root is p^2 which is composite while the fourth root is prime, and for p^3 only the cube root is prime. Compute the roots by binary search with a saturating power, not with pow on doubles, which misjudges perfect powers near 2^63 by one.",
        "Whatever survives is a semiprime p * q with p and q distinct and both far too large to find directly. Two handles remain. First, a prime already known from some prime-power input may divide it, so trial-divide by the recovered primes. Second, two distinct semiprimes that share a prime have that prime as their gcd, since the gcd of p*q and p*r is p and cannot be the whole value when the values differ. Splitting one value creates a new known prime, which may unlock another, so the pass repeats until nothing changes.",
        "A value that stays unsplit is the interesting case, and the one that sinks naive solutions. Its two primes are coprime to every other input, so they appear nowhere else - but the identical value may appear c times, in which case each of its two primes has exponent exactly c. Multiply the answer by (c + 1)^2 without ever learning what they are. Grouping equal values into a multiplicity map before this step is what makes that correct; treating duplicates as separate anonymous pairs would give (1+1)^(2c) instead.",
        "Time: O(n log(max a) + n^2 log(max a)) for the root tests and the pairwise gcd passes. Space: O(n).",
      ],
    },
  ],
};
