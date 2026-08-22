import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Sum Multiples",
      difficulty: "Easy",
      variation: "Three-set inclusion-exclusion, the template",
      link: "https://leetcode.com/problems/sum-multiples/",
      question: [
        "Given a positive integer n, return the sum of all integers x in the range [1, n] such that x is divisible by 3, 5 or 7.",
        "Example 1:\nInput: n = 7\nOutput: 21\nExplanation: The qualifying numbers are 3, 5, 6 and 7, and 3 + 5 + 6 + 7 = 21.",
        "Example 2:\nInput: n = 10\nOutput: 40\nExplanation: The qualifying numbers are 3, 5, 6, 7, 9 and 10. Multiples of 3 contribute 3 + 6 + 9 = 18, multiples of 5 contribute 5 + 10 = 15, multiples of 7 contribute 7, and no number below 11 is a multiple of two of them, so nothing has to be subtracted.",
        "Constraints:\n- 1 <= n <= 10^3",
      ],
      code: `class Solution {
    // Sum of all multiples of d that are <= n: d * (1 + 2 + ... + n/d).
    long long sumOf(int n, int d) {
        long long m = n / d;
        return (long long)d * m * (m + 1) / 2;
    }

public:
    int sumOfMultiples(int n) {
        long long ans = sumOf(n, 3) + sumOf(n, 5) + sumOf(n, 7);
        ans -= sumOf(n, 15) + sumOf(n, 21) + sumOf(n, 35);   // pairwise overlaps
        ans += sumOf(n, 105);                                 // triple overlap added back
        return (int)ans;
    }
};`,
      explanation: [
        "Let A, B, C be the sets of multiples of 3, 5 and 7 in [1, n]. The identity |A|+|B|+|C| - |AB| - |AC| - |BC| + |ABC| counts every element of the union exactly once, and it holds just as well when each element is weighted by its own value, so it can be applied to sums and not only to counts.",
        "Why the alternating signs are forced: an element that lies in exactly t of the three sets is added C(t,1) times, subtracted C(t,2) times and added back C(t,3) times, and the alternating binomial sum C(t,1) - C(t,2) + C(t,3) equals 1 for every t >= 1. That is the whole engine of inclusion-exclusion.",
        "The intersection of the multiples of 3 and the multiples of 5 is the multiples of lcm(3,5) = 15, not of 3*5 in general. Here 3, 5, 7 are pairwise coprime so the products happen to be the lcms, but writing 'product' instead of 'lcm' is the classic bug the moment the divisors share a factor (for example 4 and 6, whose lcm is 12, not 24).",
        "Tempting wrong approach: loop over [1, n] and test each number. For n <= 1000 that is fine, but the closed form is what generalises to n up to 10^18 where a loop is hopeless.",
        "Time: O(1). Space: O(1).",
      ],
    },
    {
      name: "Ubiquity",
      difficulty: "Medium",
      variation: "At-least-one conditions via the complement",
      link: "https://atcoder.jp/contests/abc178/tasks/abc178_c",
      question: [
        "Count the sequences A of length N whose entries satisfy 0 <= A_i <= 9 and which contain at least one entry equal to 0 and at least one entry equal to 9. Print the answer modulo 10^9 + 7.",
        "Example 1:\nInput:\n2\nOutput: 2\nExplanation: Only (0, 9) and (9, 0) work. Every other length-2 sequence misses a 0 or misses a 9.",
        "Example 2:\nInput:\n3\nOutput: 54\nExplanation: There are 10^3 = 1000 sequences in total, 9^3 = 729 avoid 0, 9^3 = 729 avoid 9, and 8^3 = 512 avoid both, so 1000 - 729 - 729 + 512 = 54. Counting directly agrees: 3! * 8 = 48 sequences use one 0, one 9 and one other digit, 3 use two 0s and a 9, and 3 use two 9s and a 0.",
        "Constraints:\n- 1 <= N <= 10^6",
      ],
      code: `long long power(long long b, long long e, long long mod) {
    long long r = 1;
    b %= mod;
    while (e > 0) {
        if (e & 1) r = r * b % mod;
        b = b * b % mod;
        e >>= 1;
    }
    return r;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    long long n;
    cin >> n;
    const long long MOD = 1000000007;
    // Complement: subtract "no 0" and "no 9", add back "neither 0 nor 9".
    long long ans = power(10, n, MOD) - 2 * power(9, n, MOD) + power(8, n, MOD);
    ans %= MOD;
    ans = (ans % MOD + MOD) % MOD;   // two subtractions can push the value negative
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "Counting 'contains at least one 0 and at least one 9' directly is painful because the two requirements interact. Counting the forbidden events is easy: let A be the sequences with no 0 and B the sequences with no 9. The wanted answer is total - |A union B| = total - |A| - |B| + |A intersect B|.",
        "Each of those three terms is a plain power. Avoiding 0 leaves 9 choices per position, avoiding 9 leaves 9 choices, and avoiding both leaves 8, so the answer is 10^N - 2*9^N + 8^N.",
        "The trap is modular: 10^N mod p can easily be smaller than 2*9^N mod p, so the intermediate value goes negative. Normalising once with ((x % MOD) + MOD) % MOD at the end is mandatory; forgetting it is the single most common wrong answer on inclusion-exclusion counting problems.",
        "The generalisation is worth remembering: for k forbidden digits the answer is sum over j of (-1)^j * C(k,j) * (10-j)^N, and this problem is just k = 2.",
        "Time: O(log N) for the three modular exponentiations. Space: O(1).",
      ],
    },
    {
      name: "Ugly Number III",
      difficulty: "Medium",
      variation: "Binary search on the answer plus lcm-based inclusion-exclusion",
      link: "https://leetcode.com/problems/ugly-number-iii/",
      question: [
        "An ugly number is a positive integer divisible by a, b or c. Given four integers n, a, b and c, return the n-th smallest ugly number.",
        "Example 1:\nInput: n = 3, a = 2, b = 3, c = 5\nOutput: 4\nExplanation: The ugly numbers in order are 2, 3, 4, 5, 6, ... so the third is 4.",
        "Example 2:\nInput: n = 4, a = 2, b = 3, c = 4\nOutput: 6\nExplanation: The ugly numbers in order are 2, 3, 4, 6, 8, ... so the fourth is 6. Note that 4 is a multiple of both 2 and 4 and must still be counted once.",
        "Constraints:\n- 1 <= n, a, b, c <= 10^9\n- The result fits in the range [1, 2 * 10^9]",
      ],
      code: `class Solution {
    // lcm that saturates instead of overflowing: any value this large makes x / lcm == 0.
    long long lcmCap(long long x, long long y) {
        const long long CAP = (long long)4e18;
        long long g = std::gcd(x, y);
        long long r = x / g;
        if (r > CAP / y) return CAP;
        return r * y;
    }

public:
    int nthUglyNumber(int n, int a, int b, int c) {
        long long ab = lcmCap(a, b), ac = lcmCap(a, c), bc = lcmCap(b, c);
        long long abc = lcmCap(ab, c);
        long long lo = 1, hi = (long long)2e9;
        while (lo < hi) {
            long long mid = lo + (hi - lo) / 2;
            long long cnt = mid / a + mid / b + mid / c
                          - mid / ab - mid / ac - mid / bc
                          + mid / abc;                       // ugly numbers <= mid
            if (cnt >= n) hi = mid;                          // mid is large enough
            else lo = mid + 1;
        }
        return (int)lo;
    }
};`,
      explanation: [
        "The k-th element of a set is not directly computable here, but 'how many ugly numbers are <= x' is, and that count is non-decreasing in x. So binary search for the smallest x whose count reaches n; because x itself must be ugly at that boundary (the count only increases when x is ugly), the answer is exactly that x.",
        "The counting function is three-set inclusion-exclusion on floor divisions: x/a + x/b + x/c - x/lcm(a,b) - x/lcm(a,c) - x/lcm(b,c) + x/lcm(a,b,c).",
        "Here the lcms genuinely matter. In example 2 with a = 2 and c = 4 the pairwise overlap is the multiples of lcm(2,4) = 4, not of 8; using products would undercount the removals and shift the whole answer.",
        "Overflow is the other trap. lcm(a,b,c) with values near 10^9 can reach 10^27, so the lcm helper saturates at a huge sentinel. Since any sentinel above 2*10^9 makes mid / sentinel equal to 0, saturating is not just safe but exactly right.",
        "Tempting wrong approach: a k-way merge heap that pops n values. With n up to 10^9 that is far too slow, while the binary search does about 31 iterations of constant work.",
        "Time: O(log(2 * 10^9)). Space: O(1).",
      ],
    },
    {
      name: "Nth Magical Number",
      difficulty: "Hard",
      variation: "Two-set inclusion-exclusion with a modular answer",
      link: "https://leetcode.com/problems/nth-magical-number/",
      question: [
        "A positive integer is magical if it is divisible by a or by b. Given n, a and b, return the n-th smallest magical number, modulo 10^9 + 7.",
        "Example 1:\nInput: n = 1, a = 2, b = 3\nOutput: 2\nExplanation: The magical numbers are 2, 3, 4, 6, 8, 9, ... so the first is 2.",
        "Example 2:\nInput: n = 4, a = 2, b = 3\nOutput: 6\nExplanation: The magical numbers in order are 2, 3, 4, 6, so the fourth is 6.",
        "Constraints:\n- 1 <= n <= 10^9\n- 2 <= a, b <= 4 * 10^4",
      ],
      code: `class Solution {
public:
    int nthMagicalNumber(int n, int a, int b) {
        long long l = (long long)a / std::gcd(a, b) * b;        // divide first to avoid overflow
        long long lo = 1, hi = (long long)n * min(a, b);     // the n-th multiple of the smaller value is an upper bound
        while (lo < hi) {
            long long mid = lo + (hi - lo) / 2;
            long long cnt = mid / a + mid / b - mid / l;
            if (cnt >= n) hi = mid;
            else lo = mid + 1;
        }
        return (int)(lo % 1000000007);
    }
};`,
      explanation: [
        "Same shape as the previous problem with only two sets: the number of magical values <= x is x/a + x/b - x/lcm(a,b), because multiples of both a and b are precisely the multiples of their lcm and would otherwise be counted twice.",
        "The search bound must be honest. There are already n multiples of min(a,b) at or below n*min(a,b), so the answer never exceeds that, and with n = 10^9 and a = 4*10^4 the bound is 4*10^13 - comfortably inside a signed 64-bit integer but far outside a 32-bit one.",
        "The modulus is applied only once, at the very end. Reducing distances or counts modulo 10^9 + 7 during the binary search would destroy the monotone comparison cnt >= n and silently return nonsense.",
        "Tempting wrong approach: closed-form arithmetic on the period lcm(a,b). It does work - the pattern repeats every lcm(a,b) - but the index bookkeeping at the block boundary is fiddly, whereas the binary search needs no case analysis at all.",
        "Time: O(log(n * min(a,b))). Space: O(1).",
      ],
    },
    {
      name: "Euler's Totient Function",
      difficulty: "Medium",
      variation: "Coprime count via inclusion-exclusion over distinct primes",
      link: "https://www.geeksforgeeks.org/eulers-totient-function/",
      question: [
        "Given a positive integer n, count the integers x in [1, n] with gcd(x, n) = 1. This count is Euler's totient function phi(n).",
        "Example 1:\nInput: n = 10\nOutput: 4\nExplanation: 1, 3, 7 and 9 are coprime to 10. The prime divisors of 10 are 2 and 5, so the count is 10 - 10/2 - 10/5 + 10/10 = 10 - 5 - 2 + 1 = 4.",
        "Example 2:\nInput: n = 36\nOutput: 12\nExplanation: The distinct prime divisors are 2 and 3, giving 36 - 18 - 12 + 6 = 12. The survivors are 1, 5, 7, 11, 13, 17, 19, 23, 25, 29, 31 and 35.",
        "Constraints:\n- 1 <= n <= 10^12",
      ],
      code: `long long phi(long long n) {
    // Collect the distinct prime divisors of n by trial division up to sqrt(n).
    vector<long long> primes;
    long long m = n;
    for (long long p = 2; p * p <= m; p++) {
        if (m % p == 0) {
            primes.push_back(p);
            while (m % p == 0) m /= p;
        }
    }
    if (m > 1) primes.push_back(m);      // the last prime factor, if any, exceeds sqrt(n)

    int k = primes.size();
    long long ans = 0;
    for (int mask = 0; mask < (1 << k); mask++) {
        long long prod = 1;
        for (int i = 0; i < k; i++)
            if (mask >> i & 1) prod *= primes[i];
        long long term = n / prod;       // multiples of prod inside [1, n]
        if (__builtin_popcount(mask) & 1) ans -= term;
        else ans += term;
    }
    return ans;
}`,
      explanation: [
        "gcd(x, n) = 1 means x is divisible by none of the distinct prime divisors p1..pk of n. Let A_i be the multiples of p_i in [1, n]; the answer is n minus the size of the union of the A_i, which inclusion-exclusion expands into an alternating sum over all 2^k subsets.",
        "The subsets are the key detail: the intersection of A_i for i in a subset S is the multiples of the product of those primes (distinct primes, so their product is their lcm), and there are exactly n / prod of them. Every subset contributes n/prod with sign (-1)^|S|.",
        "Only distinct primes matter. Being divisible by 4 already implies being divisible by 2, so repeated factors must be squeezed out before the enumeration or the same condition gets applied twice and the count is wrong.",
        "Factoring the alternating sum shows it equals n * product of (1 - 1/p_i), which is the familiar product formula for phi - a good self-check that the signs are right. k is at most 11 for n <= 10^12 since the product of the first 12 primes already exceeds that, so the 2^k enumeration is cheap.",
        "The same subset enumeration answers the more general question 'how many x in [1, N] are coprime to n' by replacing n / prod with N / prod, which is how range-restricted coprime counting problems are solved.",
        "Time: O(sqrt(n) + 2^k * k). Space: O(k).",
      ],
    },
    {
      name: "Count Derangements",
      difficulty: "Medium",
      variation: "Permutations with no fixed point",
      question: [
        "A derangement of 1..n is a permutation p in which no element stays in its own place, that is p[i] != i for every i. Given n, return the number of derangements of 1..n modulo 10^9 + 7.",
        "Example 1:\nInput: n = 3\nOutput: 2\nExplanation: Of the six permutations of (1,2,3), only (2,3,1) and (3,1,2) leave nothing fixed.",
        "Example 2:\nInput: n = 4\nOutput: 9\nExplanation: 4! = 24 permutations in total. Inclusion-exclusion over the sets 'position i is fixed' gives 24 - C(4,1)*3! + C(4,2)*2! - C(4,3)*1! + C(4,4)*0! = 24 - 24 + 12 - 4 + 1 = 9.",
        "Constraints:\n- 1 <= n <= 10^6",
      ],
      code: `const long long MOD = 1000000007;

long long power(long long b, long long e) {
    long long r = 1;
    b %= MOD;
    while (e > 0) {
        if (e & 1) r = r * b % MOD;
        b = b * b % MOD;
        e >>= 1;
    }
    return r;
}

long long countDerangements(int n) {
    vector<long long> fact(n + 1), invFact(n + 1);
    fact[0] = 1;
    for (int i = 1; i <= n; i++) fact[i] = fact[i - 1] * i % MOD;
    invFact[n] = power(fact[n], MOD - 2);
    for (int i = n; i > 0; i--) invFact[i - 1] = invFact[i] * i % MOD;

    long long ans = 0;
    for (int k = 0; k <= n; k++) {
        // Choose the k forced fixed points, permute the rest freely: C(n,k) * (n-k)!
        long long term = fact[n] % MOD * invFact[k] % MOD;   // C(n,k)*(n-k)! = n!/k!
        if (k & 1) ans = (ans - term + MOD) % MOD;
        else ans = (ans + term) % MOD;
    }
    return ans;
}`,
      explanation: [
        "Let A_i be the set of permutations that fix position i. A derangement is a permutation in none of the A_i, so the count is n! minus the size of the union. For a subset S of size k, the permutations fixing all of S number (n-k)!, and there are C(n,k) such subsets, giving the alternating sum of C(n,k)*(n-k)! over k.",
        "That term simplifies beautifully: C(n,k)*(n-k)! = n!/k!, so only inverse factorials of k are needed and no binomial table is required. Writing D(n) = n! * sum of (-1)^k / k! also makes the classic limit D(n)/n! -> 1/e visible.",
        "The trap is treating the events as independent and computing something like n! * (1 - 1/n)^n. The A_i overlap heavily and the exact alternating sum is not an approximation - it is the count.",
        "A second correct route is the recurrence D(n) = (n-1) * (D(n-1) + D(n-2)) with D(0) = 1 and D(1) = 0, derived by asking where element 1 goes and whether the swap is mutual. It is O(n) with no inverses, and matching it against the inclusion-exclusion sum for small n is the fastest way to catch a sign error.",
        "Time: O(n + log MOD). Space: O(n).",
      ],
    },
    {
      name: "Number of Onto Functions (Surjections)",
      difficulty: "Medium",
      variation: "Surjective maps / no empty box",
      question: [
        "Given two integers n and m, count the functions from a set of n distinct elements onto a set of m distinct elements, that is functions whose image is the whole codomain, so no target element is left unused. Equivalently, count the ways to distribute n distinct balls into m distinct boxes with no box empty. Return the count modulo 10^9 + 7.",
        "Example 1:\nInput: n = 3, m = 2\nOutput: 6\nExplanation: There are 2^3 = 8 functions in total, and exactly 2 of them are constant and therefore miss a target, so 8 - 2 = 6 are onto.",
        "Example 2:\nInput: n = 4, m = 3\nOutput: 36\nExplanation: 3^4 - C(3,1)*2^4 + C(3,2)*1^4 - C(3,3)*0^4 = 81 - 48 + 3 - 0 = 36.",
        "Constraints:\n- 1 <= m <= n <= 10^6",
      ],
      code: `const long long MOD = 1000000007;

long long power(long long b, long long e) {
    long long r = 1;
    b %= MOD;
    while (e > 0) {
        if (e & 1) r = r * b % MOD;
        b = b * b % MOD;
        e >>= 1;
    }
    return r;
}

long long countOnto(int n, int m) {
    vector<long long> fact(m + 1), invFact(m + 1);
    fact[0] = 1;
    for (int i = 1; i <= m; i++) fact[i] = fact[i - 1] * i % MOD;
    invFact[m] = power(fact[m], MOD - 2);
    for (int i = m; i > 0; i--) invFact[i - 1] = invFact[i] * i % MOD;

    long long ans = 0;
    for (int k = 0; k <= m; k++) {
        // Choose k banned targets, then map everything into the remaining m-k.
        long long binom = fact[m] * invFact[k] % MOD * invFact[m - k] % MOD;
        long long term = binom * power(m - k, n) % MOD;
        if (k & 1) ans = (ans - term + MOD) % MOD;
        else ans = (ans + term) % MOD;
    }
    return ans;
}`,
      explanation: [
        "Let A_j be the functions that never hit target j. An onto function avoids every A_j, so the count is the alternating sum over subsets of banned targets. Only the size k of the banned set matters, because banning any k targets leaves (m-k)^n functions, so the 2^m subsets collapse to a single sum over k with weight C(m,k).",
        "The collapse from subsets to sizes is the practical heart of inclusion-exclusion: whenever the intersection size depends only on |S| and not on which elements S contains, an exponential enumeration becomes a linear alternating sum with binomial weights.",
        "Note that (m-k)^n at k = m contributes 0^n = 0 for n >= 1, so the last term vanishes - but the modular power routine must return 0 there, not 1. A power function that special-cases exponent 0 before checking the base is a real source of off-by-one answers here.",
        "This quantity equals m! * S(n, m) where S is a Stirling number of the second kind, which is the same count with indistinguishable boxes. If the problem says the boxes are identical, divide by m!; forgetting that distinction is the usual modelling mistake.",
        "Time: O(m log n). Space: O(m).",
      ],
    },
    {
      name: "NEQ",
      difficulty: "Hard",
      variation: "Inclusion-exclusion over positions with binomial weights",
      link: "https://atcoder.jp/contests/abc172/tasks/abc172_e",
      question: [
        "Count the pairs of sequences (A, B), each of length N with entries in [1, M], such that A has pairwise distinct entries, B has pairwise distinct entries, and A_i != B_i for every position i. Print the answer modulo 10^9 + 7.",
        "Example 1:\nInput:\n2 2\nOutput: 2\nExplanation: A must be a permutation of (1,2) and then B is forced to be the other one, so the pairs are ((1,2),(2,1)) and ((2,1),(1,2)).",
        "Example 2:\nInput:\n2 3\nOutput: 18\nExplanation: There are P(3,2) = 6 choices for A. For a fixed A, the sequences B with distinct entries and B_i != A_i number 6 - 2 - 2 + 1 = 3, so the total is 6 * 3 = 18.",
        "Constraints:\n- 1 <= N <= M <= 5 * 10^5",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    long long n, m;
    cin >> n >> m;
    const long long MOD = 1000000007;

    vector<long long> fact(m + 1), invFact(m + 1);
    fact[0] = 1;
    for (long long i = 1; i <= m; i++) fact[i] = fact[i - 1] * i % MOD;
    // Fermat inverse of m!, then walk down for the rest.
    long long e = MOD - 2, base = fact[m], inv = 1;
    while (e > 0) {
        if (e & 1) inv = inv * base % MOD;
        base = base * base % MOD;
        e >>= 1;
    }
    invFact[m] = inv;
    for (long long i = m; i > 0; i--) invFact[i - 1] = invFact[i] * i % MOD;

    // P(x, y) = x! / (x - y)! : ordered selections.
    auto perm = [&](long long x, long long y) -> long long {
        if (y < 0 || y > x) return 0;
        return fact[x] * invFact[x - y] % MOD;
    };
    auto binom = [&](long long x, long long y) -> long long {
        if (y < 0 || y > x) return 0;
        return fact[x] * invFact[y] % MOD * invFact[x - y] % MOD;
    };

    long long inner = 0;
    for (long long k = 0; k <= n; k++) {
        // k positions are forced to agree; the other n-k entries of B are placed freely.
        long long term = binom(n, k) * perm(m - k, n - k) % MOD;
        if (k & 1) inner = (inner - term + MOD) % MOD;
        else inner = (inner + term) % MOD;
    }
    long long ans = perm(m, n) * inner % MOD;
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "Fix A first. Because all entries of A are distinct and the entries are otherwise unconstrained, there are P(M,N) choices for A, and by symmetry the number of valid B does not depend on which A was chosen. So the answer factors as P(M,N) times a single inner count.",
        "For the inner count, let A_i-bad be the event B_i = A_i. Choose a set S of k positions forced to be bad: those k values of B are pinned to distinct values (the A_i are distinct), and the remaining N-k positions must take distinct values from the M-k unused ones, which is P(M-k, N-k) ways. There are C(N,k) such sets, so the inner count is the alternating sum of C(N,k)*P(M-k, N-k).",
        "The subtlety that makes P(M-k, N-k) correct is that the pinned values are guaranteed distinct - if A could repeat, the forced positions might collide and the term would not be a clean falling factorial. The distinctness of A is doing real work, not decoration.",
        "Tempting wrong approach: build B position by position and multiply 'available choices' greedily. The number of available values depends on which earlier values were used relative to the A_i, so the naive product overcounts; the alternating sum is what handles those dependencies exactly.",
        "P(M-k, N-k) is zero once k pushes N-k above M-k, which cannot happen for N <= M, so all N+1 terms are genuine and the loop runs in linear time after factorial precomputation.",
        "Time: O(M + N). Space: O(M).",
      ],
    },
    {
      name: "Devu and Flowers",
      difficulty: "Hard",
      variation: "Stars and bars with upper bounds, subset inclusion-exclusion",
      link: "https://codeforces.com/problemset/problem/451/E",
      question: [
        "Devu has n boxes; box i contains f_i flowers, and all flowers inside one box have the same colour while flowers in different boxes have different colours. Devu wants to select exactly s flowers in total. Count the ways to do this, modulo 10^9 + 7. Two selections differ only in how many flowers were taken from each box, since flowers of the same colour are indistinguishable.",
        "Example 1:\nInput:\n2 3\n1 3\nOutput: 2\nExplanation: With x_i flowers taken from box i we need x_1 + x_2 = 3 with x_1 <= 1 and x_2 <= 3, giving (0,3) and (1,2).",
        "Example 2:\nInput:\n2 4\n2 2\nOutput: 1\nExplanation: x_1 + x_2 = 4 with both at most 2 forces (2,2). Inclusion-exclusion agrees: C(5,1) - C(2,1) - C(2,1) + 0 = 5 - 2 - 2 = 1.",
        "Constraints:\n- 1 <= n <= 20\n- 0 <= s <= 10^14\n- 0 <= f_i <= 10^12",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const long long MOD = 1000000007;
    int n;
    long long s;
    cin >> n >> s;
    vector<long long> f(n);
    for (int i = 0; i < n; i++) cin >> f[i];

    // Inverse of (n-1)! by Fermat, since every binomial below has that lower index.
    long long fact = 1;
    for (int i = 1; i <= n - 1; i++) fact = fact * i % MOD;
    long long invFact = 1, base = fact, e = MOD - 2;
    while (e > 0) {
        if (e & 1) invFact = invFact * base % MOD;
        base = base * base % MOD;
        e >>= 1;
    }

    long long ans = 0;
    for (int mask = 0; mask < (1 << n); mask++) {
        long long rem = s;
        for (int i = 0; i < n; i++)
            if (mask >> i & 1) rem -= f[i] + 1;   // force box i to exceed its cap
        if (rem < 0) continue;                    // no solutions once the demand is negative
        // C(rem + n - 1, n - 1) with a huge top and a tiny bottom: multiply n-1 factors.
        long long top = rem + n - 1, c = 1;
        for (int i = 0; i < n - 1; i++) c = c * ((top - i) % MOD) % MOD;
        c = c * invFact % MOD;
        if (__builtin_popcount(mask) & 1) ans = (ans - c + MOD) % MOD;
        else ans = (ans + c) % MOD;
    }
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "Without the caps this is pure stars and bars: the number of non-negative solutions of x_1 + ... + x_n = s is C(s + n - 1, n - 1). The caps x_i <= f_i are the overlapping constraints inclusion-exclusion is built for.",
        "Let A_i be the solutions that violate box i, meaning x_i >= f_i + 1. Substituting x_i = y_i + f_i + 1 turns a violating solution into an unrestricted one for the smaller target s - (f_i + 1), which is a bijection - that substitution is the whole trick. For a subset S the same substitution applies to every member at once, so |intersection over S| = C(s - sum of (f_i + 1) over S + n - 1, n - 1), zero when the argument goes negative.",
        "Summing over all 2^n subsets with sign (-1)^|S| gives the answer. Here the intersection size depends on which boxes are in S (the caps differ), so unlike the surjection problem the sum cannot collapse to a sum over sizes - full subset enumeration is required, which is why n is capped at 20.",
        "The arithmetic is the real hazard: s reaches 10^14 so the binomial's top index does not fit in any factorial table. Because the bottom index is only n-1 <= 19, compute the falling factorial (top)(top-1)...(top-n+2) with each factor reduced mod p and multiply by the inverse of (n-1)!. Reducing top modulo p before the negativity test would be fatal, so the rem < 0 check must happen on the true integer value.",
        "Time: O(2^n * n). Space: O(n).",
      ],
    },
    {
      name: "Mike and Foam",
      difficulty: "Hard",
      variation: "Dynamic coprime-pair counting with squarefree-divisor signs (Mobius)",
      link: "https://codeforces.com/problemset/problem/547/C",
      question: [
        "Mike has n kinds of beer, kind i having foam value a_i. A shelf starts empty. For each of q queries an index x is given: if beer x is not on the shelf it is put there, otherwise it is removed. After each query report the score of the shelf, defined as the number of unordered pairs (i, j) of beers currently on the shelf with gcd(a_i, a_j) = 1.",
        "Example 1:\nInput:\n5 6\n1 2 3 4 6\n1\n2\n3\n4\n5\n1\nOutput:\n0\n1\n3\n5\n6\n2\nExplanation: After the first four insertions the shelf holds values 1, 2, 3, 4 and the coprime pairs are (1,2), (1,3), (1,4), (2,3), (3,4), so the score is 5. Adding 6 only adds the pair (1,6), giving 6. Removing the beer with value 1 destroys three of those pairs and leaves (2,3) and (3,4), so the score is 2.",
        "Constraints:\n- 1 <= n, q <= 2 * 10^5\n- 1 <= a_i <= 5 * 10^5\n- 1 <= x <= n",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const int MX = 500001;
    int n, q;
    cin >> n >> q;
    vector<int> a(n + 1);
    for (int i = 1; i <= n; i++) cin >> a[i];

    vector<int> spf(MX, 0);              // smallest prime factor sieve for fast factorisation
    for (int i = 2; i < MX; i++)
        if (!spf[i])
            for (int j = i; j < MX; j += i)
                if (!spf[j]) spf[j] = i;

    vector<int> cnt(MX, 0);              // cnt[d] = shelf elements divisible by d
    vector<char> on(n + 1, 0);
    long long ans = 0;

    while (q--) {
        int x;
        cin >> x;
        int v = a[x], t = v;
        vector<int> p;
        while (t > 1) {                  // distinct primes only: at most 6 for v <= 5*10^5
            int pr = spf[t];
            p.push_back(pr);
            while (t % pr == 0) t /= pr;
        }
        int k = p.size();
        vector<int> divs(1 << k), sign(1 << k);
        for (int m = 0; m < (1 << k); m++) {
            int d = 1;
            for (int i = 0; i < k; i++)
                if (m >> i & 1) d *= p[i];
            divs[m] = d;
            sign[m] = (__builtin_popcount(m) & 1) ? -1 : 1;
        }
        if (!on[x]) {
            for (int m = 0; m < (1 << k); m++) ans += sign[m] * (long long)cnt[divs[m]];
            for (int m = 0; m < (1 << k); m++) cnt[divs[m]]++;
            on[x] = 1;
        } else {
            for (int m = 0; m < (1 << k); m++) cnt[divs[m]]--;
            for (int m = 0; m < (1 << k); m++) ans -= sign[m] * (long long)cnt[divs[m]];
            on[x] = 0;
        }
        cout << ans << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Recomputing all pairs per query is hopeless, so maintain the score incrementally: inserting a value v changes the score by the number of shelf elements coprime to v, and deleting v subtracts exactly that number computed against the shelf without v.",
        "Counting shelf elements coprime to v is inclusion-exclusion over the distinct primes p_1..p_k of v. Let B_i be the shelf elements divisible by p_i; the coprime count is the alternating sum over subsets S of cnt[product of p_i in S], where cnt[d] is how many shelf elements are divisible by d. Keeping cnt[d] for every squarefree divisor of every a_i makes each query O(2^k).",
        "Written over all divisors this alternating sum is exactly the Mobius identity sum over d dividing v of mu(d) * cnt[d]: non-squarefree d have mu(d) = 0, which is why only the squarefree products appear, and (-1)^|S| is precisely mu of that product.",
        "Order of operations is where implementations break. On insertion, query cnt before incrementing, otherwise v is counted as coprime to itself; on deletion, decrement first and then subtract, so the removed element is not counted against itself. Getting these backwards produces answers that drift by one per query and look almost right.",
        "Note v = 1 has k = 0, so the only divisor is 1 and the contribution is cnt[1], the entire shelf size - correct, because 1 is coprime to everything. Values up to 5*10^5 have at most 6 distinct primes (2*3*5*7*11*13*17 already exceeds it), so 2^k <= 64.",
        "Time: O(MX log log MX + q * 2^6). Space: O(MX).",
      ],
    },
  ],
};
