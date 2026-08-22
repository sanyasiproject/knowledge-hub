import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Prime Number",
      difficulty: "Easy",
      variation: "Trial division up to sqrt(n), the template",
      question: [
        "Given a positive integer n, determine whether it is prime. A prime is an integer greater than 1 whose only positive divisors are 1 and itself. Return true if n is prime and false otherwise.",
        "Example 1:\nInput: n = 29\nOutput: true\nExplanation: No integer d with 2 <= d <= 5 divides 29, and 6*6 = 36 > 29, so the search stops there.",
        "Example 2:\nInput: n = 91\nOutput: false\nExplanation: 91 = 7 * 13, so the loop stops at d = 7.",
        "Constraints:\n- 1 <= n <= 10^12",
      ],
      code: `bool isPrime(long long n) {
    if (n < 2) return false;              // 0 and 1 are not prime
    if (n % 2 == 0) return n == 2;        // handle the only even prime, then skip evens
    for (long long d = 3; d * d <= n; d += 2)   // d*d <= n avoids a sqrt call and its rounding
        if (n % d == 0) return false;
    return true;
}`,
      explanation: [
        "The whole pattern rests on one fact: if n = a * b with a <= b, then a * a <= a * b = n, so a <= sqrt(n). Any composite therefore has at least one divisor no larger than sqrt(n). Finding none in [2, sqrt(n)] proves n is prime, so the loop can stop there instead of at n-1.",
        "Write the bound as d * d <= n rather than d <= sqrt(n). Floating-point sqrt of a large 64-bit value can land just below the true root and make the loop miss the final divisor - a real failure mode for numbers like a perfect square of a large prime.",
        "Peeling off 2 first and then stepping by 2 halves the work. The same idea extended (skip multiples of 2 and 3, stepping 6k+1, 6k+5) gives another factor of 1.5 and is the usual competitive form.",
        "The tempting wrong version is looping d from 2 to n/2: correct but 10^6 times slower here, and for n near 10^12 it simply will not finish. The other classic bug is returning true for n = 1, which passes the divisor loop vacuously.",
        "Time: O(sqrt(n)) per query. Space: O(1).",
      ],
    },
    {
      name: "Prime Number of Set Bits in Binary Representation",
      difficulty: "Easy",
      variation: "Primality on a tiny fixed range",
      link: "https://leetcode.com/problems/prime-number-of-set-bits-in-binary-representation/",
      question: [
        "You are given two integers left and right. Count the numbers x in the inclusive range [left, right] whose binary representation has a prime number of set bits (1 bits).",
        "Example 1:\nInput: left = 6, right = 10\nOutput: 4\nExplanation: 6 = 110 has 2 set bits (prime), 7 = 111 has 3 (prime), 8 = 1000 has 1 (not prime), 9 = 1001 has 2 (prime), 10 = 1010 has 2 (prime).",
        "Example 2:\nInput: left = 10, right = 15\nOutput: 5\nExplanation: only 15 = 1111 with 4 set bits fails.",
        "Constraints:\n- 1 <= left <= right <= 10^6\n- 0 <= right - left <= 10^4",
      ],
      code: `int countPrimeSetBits(int left, int right) {
    // right < 2^20, so a popcount is in [1, 20]; precompute which of those are prime
    const int primeMask = (1 << 2) | (1 << 3) | (1 << 5) | (1 << 7)
                        | (1 << 11) | (1 << 13) | (1 << 17) | (1 << 19);
    int cnt = 0;
    for (int x = left; x <= right; x++)
        if (primeMask >> __builtin_popcount(x) & 1) cnt++;   // bit test instead of a primality call
    return cnt;
}`,
      explanation: [
        "The value being tested for primality is not x but its popcount, and the constraint right <= 10^6 < 2^20 caps that at 20. When the universe of candidate values is that small, the right move is to enumerate it once rather than run a divisor loop per element.",
        "Packing the primes below 20 into a 20-bit mask turns each test into a shift and an and. A boolean lookup array is equally fine; the point is O(1) per element instead of O(sqrt(popcount)).",
        "The trap is scale confusion: writing isPrime(x) instead of isPrime(popcount(x)). It compiles, runs, and returns a plausible wrong answer.",
        "Time: O(right - left). Space: O(1).",
      ],
    },
    {
      name: "Prime Arrangements",
      difficulty: "Easy",
      variation: "Counting primes up to n, then combinatorics",
      link: "https://leetcode.com/problems/prime-arrangements/",
      question: [
        "Return the number of permutations of the integers 1..n such that every prime number sits at a prime index. Indices are 1-based, so index 1 is not prime. Because the answer can be large, return it modulo 10^9 + 7.",
        "Example 1:\nInput: n = 5\nOutput: 12\nExplanation: there are 3 primes (2, 3, 5) and 3 prime indices (2, 3, 5), so the count is 3! * 2! = 6 * 2 = 12.",
        "Example 2:\nInput: n = 100\nOutput: 682289015\nExplanation: 25 primes are at most 100, so the answer is 25! * 75! mod (10^9 + 7).",
        "Constraints:\n- 1 <= n <= 100",
      ],
      code: `int numPrimeArrangements(int n) {
    const long long MOD = 1000000007LL;
    int p = 0;
    for (int i = 2; i <= n; i++) {            // n <= 100, so trial division per value is plenty
        bool prime = true;
        for (int d = 2; d * d <= i; d++)
            if (i % d == 0) { prime = false; break; }
        p += prime;
    }
    long long ans = 1;
    for (int i = 2; i <= p; i++) ans = ans * i % MOD;        // p! : primes among prime slots
    for (int i = 2; i <= n - p; i++) ans = ans * i % MOD;    // (n-p)! : the rest among the rest
    return (int)ans;
}`,
      explanation: [
        "The counting argument: the number of prime values in 1..n equals the number of prime indices in 1..n, call it p, because both are just 'primes at most n'. Primes may be permuted freely among the p prime slots and non-primes freely among the remaining n-p slots, and the two choices are independent, giving p! * (n-p)!.",
        "So the only algorithmic content is counting primes up to n. With n <= 100 a per-value trial division is trivially fast; a sieve would also work and is what you would reach for if n were 10^6.",
        "Take the modulus inside the factorial loop, not after. 25! alone is about 1.5 * 10^25 and overflows 64-bit long long, so a single multiply-then-reduce at the end silently corrupts the answer.",
        "Time: O(n sqrt(n)) for the counting, O(n) for the factorials. Space: O(1).",
      ],
    },
    {
      name: "Count Primes",
      difficulty: "Medium",
      variation: "Sieve of Eratosthenes instead of per-number tests",
      link: "https://leetcode.com/problems/count-primes/",
      question: [
        "Given an integer n, return the number of prime numbers that are strictly less than n.",
        "Example 1:\nInput: n = 10\nOutput: 4\nExplanation: the primes below 10 are 2, 3, 5 and 7.",
        "Example 2:\nInput: n = 2\nOutput: 0\nExplanation: there is no prime strictly less than 2.",
        "Constraints:\n- 0 <= n <= 5 * 10^6",
      ],
      code: `int countPrimes(int n) {
    if (n < 3) return 0;
    vector<char> composite(n, 0);            // composite[i] for i in [0, n-1]
    int cnt = 0;
    for (int i = 2; i < n; i++) {
        if (composite[i]) continue;
        cnt++;
        if ((long long)i * i >= n) continue;         // no multiple to mark inside the range
        for (long long j = (long long)i * i; j < n; j += i)   // start at i*i, smaller multiples already marked
            composite[j] = 1;
    }
    return cnt;
}`,
      explanation: [
        "Testing every number separately costs O(n sqrt(n)) - about 10^10 operations at n = 5 * 10^6. The sieve inverts the work: instead of asking each number for its divisors, each prime crosses out its own multiples, and the total marking work is n * sum(1/p) over primes p < n, which is O(n log log n).",
        "Marking may start at i*i, not 2*i. Any multiple k*i with k < i has a prime factor smaller than i and was therefore already crossed out when that smaller prime ran. Skipping to i*i is what makes the constant factor good.",
        "Because every composite is removed by its smallest prime factor before the outer loop reaches it, an unmarked i is guaranteed prime at the moment it is examined - no separate verification is needed.",
        "Use char or a bitset rather than vector<bool> if you care about speed; vector<bool> packs bits and pays for masking on every access. Also keep the products in 64-bit: i*i overflows int once i passes about 46341.",
        "Time: O(n log log n). Space: O(n) bytes (O(n/8) with a bitset).",
      ],
    },
    {
      name: "Distinct Prime Factors of Product of Array",
      difficulty: "Medium",
      variation: "Prime factorization by trial division",
      link: "https://leetcode.com/problems/distinct-prime-factors-of-product-of-array/",
      question: [
        "Given an array of positive integers nums, consider the product of all its elements. Return the number of distinct prime factors of that product.",
        "Example 1:\nInput: nums = [2,4,3,7,10,6]\nOutput: 4\nExplanation: the product is 10080 = 2^5 * 3^2 * 5 * 7, so the distinct primes are 2, 3, 5 and 7.",
        "Example 2:\nInput: nums = [2,4,8,16]\nOutput: 1\nExplanation: every element is a power of 2, so the only prime factor is 2.",
        "Constraints:\n- 1 <= nums.length <= 10^4\n- 2 <= nums[i] <= 1000",
      ],
      code: `int distinctPrimeFactors(vector<int>& nums) {
    set<int> primes;
    for (int x : nums) {
        for (int d = 2; d * d <= x; d++) {
            while (x % d == 0) { primes.insert(d); x /= d; }   // divide out d fully
        }
        if (x > 1) primes.insert(x);   // whatever survives is a prime larger than sqrt(original)
    }
    return (int)primes.size();
}`,
      explanation: [
        "Never form the product - with 10^4 factors it has thousands of digits. A prime divides a product exactly when it divides at least one factor, so factorizing each element independently and unioning the primes gives the same answer.",
        "The trial-division factorizer is the same sqrt bound as the primality template with one extra move: once d divides x, divide it out completely. That keeps x shrinking, so the loop bound d*d <= x tightens as it goes, and it guarantees every d that ever divides x is prime - all smaller prime factors have already been removed.",
        "The final if (x > 1) is the step people forget. After the loop, x is either 1 or a single prime greater than sqrt of its current value; dropping it loses the largest prime factor of numbers like 2 * 499.",
        "Since nums[i] <= 1000, a smallest-prime-factor sieve up to 1000 would make each factorization O(log x) instead of O(sqrt x) - the standard upgrade when many numbers from a bounded range must be factorized.",
        "Time: O(n sqrt(maxVal) + k log k) for k distinct primes. Space: O(k).",
      ],
    },
    {
      name: "Almost Prime",
      difficulty: "Easy",
      variation: "Counting numbers by their distinct-prime count",
      link: "https://codeforces.com/problemset/problem/26/A",
      question: [
        "A number is called almost prime if it has exactly two distinct prime divisors. Given an integer n, count how many numbers in the range 1..n are almost prime. Read n from standard input and print the count.",
        "Example 1:\nInput:\n10\nOutput: 2\nExplanation: only 6 = 2 * 3 and 10 = 2 * 5 qualify.",
        "Example 2:\nInput:\n21\nOutput: 8\nExplanation: the qualifying numbers are 6, 10, 12, 14, 15, 18, 20 and 21. Note 12 = 2^2 * 3 counts, because only the number of distinct primes matters.",
        "Constraints:\n- 1 <= n <= 3000",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    int ans = 0;
    for (int i = 1; i <= n; i++) {
        int cnt = 0, x = i;
        for (int d = 2; d * d <= x; d++)
            if (x % d == 0) {
                cnt++;                          // d is prime here: all smaller primes are gone
                while (x % d == 0) x /= d;      // count multiplicity once
            }
        if (x > 1) cnt++;                       // leftover large prime
        if (cnt == 2) ans++;
    }
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "This is the factorization loop wrapped in a counter, and the key reading of the statement is 'distinct'. 12 = 2^2 * 3 has three prime factors with multiplicity but only two distinct ones, so the inner while that divides d out fully is what makes the count correct.",
        "With n <= 3000 the direct O(n sqrt(n)) scan is about 1.6 * 10^5 operations. If n were 10^6 the better shape is a sieve variant: for each prime p, walk its multiples and increment a counter array, giving the distinct-prime count of every number in O(n log log n) total.",
        "The tempting shortcut - counting numbers of the form p*q for distinct primes p, q - undercounts, because it misses 12, 18, 20 and every other number where a prime appears more than once.",
        "Time: O(n sqrt(n)). Space: O(1).",
      ],
    },
    {
      name: "Closest Prime Numbers in Range",
      difficulty: "Medium",
      variation: "Smallest prime gap in an interval",
      link: "https://leetcode.com/problems/closest-prime-numbers-in-range/",
      question: [
        "Given two integers left and right, find two integers num1 and num2 such that left <= num1 < num2 <= right, both num1 and num2 are prime, and num2 - num1 is as small as possible. Among all pairs achieving that minimum difference, return the one with the smallest num1. If no such pair exists, return [-1, -1].",
        "Example 1:\nInput: left = 10, right = 19\nOutput: [11,13]\nExplanation: the primes in range are 11, 13, 17, 19 with gaps 2, 4, 2. The minimum gap 2 is achieved by (11,13) and (17,19), and 11 is the smaller start.",
        "Example 2:\nInput: left = 4, right = 6\nOutput: [-1,-1]\nExplanation: 5 is the only prime in range, so no pair exists.",
        "Constraints:\n- 1 <= left <= right <= 10^6",
      ],
      code: `vector<int> closestPrimes(int left, int right) {
    vector<char> composite(right + 1, 0);
    composite[0] = 1;
    if (right >= 1) composite[1] = 1;
    for (int i = 2; (long long)i * i <= right; i++)
        if (!composite[i])
            for (long long j = (long long)i * i; j <= right; j += i) composite[j] = 1;

    vector<int> ans{-1, -1};
    int prev = -1, best = INT_MAX;
    for (int x = max(left, 2); x <= right; x++) {
        if (composite[x]) continue;
        if (prev != -1 && x - prev < best) { best = x - prev; ans = {prev, x}; }
        prev = x;   // remember only the previous prime: consecutive primes minimise the gap
        if (best == 2) break;   // 2 is the smallest possible gap above the pair (2,3)
    }
    return ans;
}`,
      explanation: [
        "The minimal difference is always attained by two consecutive primes: if p < q are primes with another prime r strictly between them, then both p..r and r..q are shorter. So one left-to-right pass keeping only the previous prime suffices - no nested loop over pairs.",
        "Using strict < when comparing against the best gap is what delivers the tie-break for free: the first pair achieving a given minimum is kept, and the scan runs in increasing order of num1.",
        "Right upper bound is 10^6, so a full sieve up to right costs about 10^6 marks and dominates nothing. Trial-dividing each of up to 10^6 candidates instead is roughly 10^9 operations and times out.",
        "The special case worth remembering is (2,3) with gap 1, which is why the early break tests for 2 rather than assuming 2 is the floor: for left = 1 or 2 the answer can be [2,3].",
        "Time: O(right log log right). Space: O(right).",
      ],
    },
    {
      name: "Prime Pairs With Target Sum",
      difficulty: "Medium",
      variation: "Sieve plus complement lookup",
      link: "https://leetcode.com/problems/prime-pairs-with-target-sum/",
      question: [
        "You are given an integer n. Find all pairs of integers [x, y] such that x + y = n, 1 <= x <= y <= n, and both x and y are prime. Return the list of such pairs sorted in increasing order of x, or an empty list if none exist.",
        "Example 1:\nInput: n = 10\nOutput: [[3,7],[5,5]]\nExplanation: 3 + 7 = 10 with both prime, and 5 + 5 = 10 with both prime. 2 + 8 fails because 8 is not prime.",
        "Example 2:\nInput: n = 2\nOutput: []\nExplanation: the only candidate is 1 + 1, and 1 is not prime.",
        "Constraints:\n- 1 <= n <= 10^6",
      ],
      code: `vector<vector<int>> findPrimePairs(int n) {
    vector<vector<int>> res;
    if (n < 4) return res;                    // 2+2 = 4 is the smallest valid sum
    vector<char> composite(n + 1, 0);
    composite[0] = composite[1] = 1;
    for (int i = 2; (long long)i * i <= n; i++)
        if (!composite[i])
            for (long long j = (long long)i * i; j <= n; j += i) composite[j] = 1;

    for (int x = 2; x <= n / 2; x++)          // x <= n/2 enforces x <= y and avoids duplicates
        if (!composite[x] && !composite[n - x]) res.push_back({x, n - x});
    return res;
}`,
      explanation: [
        "One sieve up to n answers every membership query in O(1), and the pair search is then a single scan: for each candidate x, its partner is forced to be n - x, so there is nothing to search for.",
        "Stopping at x <= n/2 is the deduplication mechanism - it keeps [3,7] and drops [7,3], while still allowing x = y = n/2 when n/2 is prime, as in n = 10.",
        "Results come out already sorted by x because the scan is increasing, so no explicit sort is needed.",
        "A useful sanity check on the answer size: for odd n the only possible pair is (2, n-2), since two odd primes sum to an even number. For even n the count is the Goldbach pair count, which has no closed form but is small relative to n.",
        "Time: O(n log log n). Space: O(n) plus the output.",
      ],
    },
    {
      name: "T-primes",
      difficulty: "Medium",
      variation: "Exactly three divisors - prime squares",
      link: "https://codeforces.com/problemset/problem/230/B",
      question: [
        "A positive integer is a T-prime if it has exactly three distinct positive divisors. You are given n numbers; for each one print YES if it is a T-prime and NO otherwise. Read n on the first line and the n numbers on the second, and print one answer per line.",
        "Example 1:\nInput:\n3\n4 5 6\nOutput:\nYES\nNO\nNO\nExplanation: 4 has divisors 1, 2, 4 - exactly three. 5 has two divisors and 6 has four.",
        "Example 2:\nInput:\n2\n1 1000000000000\nOutput:\nNO\nNO\nExplanation: 1 has a single divisor. 10^12 = (10^6)^2 but 10^6 is not prime, so it has many divisors.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= each number <= 10^12",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const int LIM = 1000000;                   // sqrt(10^12)
    vector<char> composite(LIM + 1, 0);
    composite[0] = composite[1] = 1;
    for (int i = 2; (long long)i * i <= LIM; i++)
        if (!composite[i])
            for (int j = i * i; j <= LIM; j += i) composite[j] = 1;

    int n;
    cin >> n;
    while (n--) {
        long long x;
        cin >> x;
        long long r = (long long)sqrtl((long double)x);
        while (r > 0 && r * r > x) r--;                 // repair floating-point drift
        while ((r + 1) * (r + 1) <= x) r++;
        bool ok = (r * r == x) && r <= LIM && !composite[r];
        cout << (ok ? "YES" : "NO") << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Characterise the answer first. If x = product of p_i^e_i then its divisor count is product of (e_i + 1). That equals 3 only when there is one prime with exponent 2, so the T-primes are exactly the squares of primes.",
        "That reduces each query to two O(1)-ish checks: is x a perfect square, and is its root prime. Since x <= 10^12 the root is at most 10^6, so a single sieve up to 10^6 handles every query. Factorizing each x directly would be 10^5 * 10^6 operations and hopeless.",
        "The real trap is the square root. sqrtl on a value near 10^12 can return something like r - 0.0000001 which truncates to r - 1, so the perfect-square test silently fails. Clamping with the two adjustment loops, or comparing r*r in exact integer arithmetic, is mandatory.",
        "Second trap: x = 1 has one divisor and r = 1, which is why composite[1] must be pre-marked. Numbers below 4 are never T-primes.",
        "Time: O(LIM log log LIM + n). Space: O(LIM).",
      ],
    },
    {
      name: "Prime Generator",
      difficulty: "Hard",
      variation: "Segmented sieve over a shifted window",
      link: "https://www.spoj.com/problems/PRIME1/",
      question: [
        "You are given t test cases. Each test case is a pair m n; print all prime numbers p with m <= p <= n, one per line, in increasing order. Separate the output of consecutive test cases with an empty line.",
        "Example 1:\nInput:\n2\n1 10\n3 5\nOutput:\n2\n3\n5\n7\n\n3\n5\nExplanation: the primes in [1,10] are 2, 3, 5, 7 and the primes in [3,5] are 3, 5.",
        "Constraints:\n- 1 <= t <= 10\n- 1 <= m <= n <= 10^9\n- n - m <= 10^5",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const int LIM = 31623;                     // just above sqrt(10^9)
    vector<char> comp(LIM + 1, 0);
    vector<int> base;
    for (int i = 2; i <= LIM; i++) {
        if (comp[i]) continue;
        base.push_back(i);
        for (long long j = (long long)i * i; j <= LIM; j += i) comp[j] = 1;
    }

    int t;
    cin >> t;
    while (t--) {
        long long m, n;
        cin >> m >> n;
        if (m < 2) m = 2;                      // 0 and 1 are not prime
        long long len = m > n ? 0 : n - m + 1;
        vector<char> seg(len, 0);              // seg[i] describes the number m + i
        for (int p : base) {
            if ((long long)p * p > n) break;
            // first multiple of p that is >= m, but never below p*p (p itself must survive)
            long long start = max((long long)p * p, ((m + p - 1) / p) * (long long)p);
            for (long long j = start; j <= n; j += p) seg[j - m] = 1;
        }
        for (long long i = 0; i < len; i++)
            if (!seg[i]) cout << (m + i) << "\\n";
        if (t) cout << "\\n";                   // blank line between test cases only
    }
    return 0;
}`,
      explanation: [
        "A sieve up to 10^9 needs a billion cells and is out of the question, but the window is only 10^5 wide. The segmented sieve keeps the window in memory and indexes it by offset: seg[i] stands for m + i.",
        "Correctness comes straight from the sqrt bound. Any composite c <= n has a prime factor at most sqrt(n) <= 31623, so crossing out the multiples of every prime up to 31623 removes every composite in the window and nothing else. That is why the small base sieve is enough.",
        "The two subtleties are both in the start value. Rounding m up to the next multiple of p with ((m + p - 1) / p) * p keeps the inner loop O(window / p) instead of scanning from p. Taking max with p*p prevents a prime p that lies inside the window from crossing itself out - without it, [3,5] would print nothing.",
        "Do the multiple arithmetic in 64-bit: p*p for p near 31623 is about 10^9, and the naive int product overflows on the way.",
        "Time: O(sqrt(n) log log sqrt(n)) once, plus O((n - m) log log n) per test case. Space: O(sqrt(n) + (n - m)).",
      ],
    },
    {
      name: "Prime Palindrome",
      difficulty: "Hard",
      variation: "Generate candidates, then test primality",
      link: "https://leetcode.com/problems/prime-palindrome/",
      question: [
        "Given an integer n, return the smallest integer that is greater than or equal to n and is both prime and a palindrome. It is guaranteed that the answer exists and is less than 2 * 10^8.",
        "Example 1:\nInput: n = 6\nOutput: 7\nExplanation: 7 is prime and a single digit, hence a palindrome.",
        "Example 2:\nInput: n = 13\nOutput: 101\nExplanation: 13 is prime but not a palindrome; 11 is below n; the next palindromic prime is 101.",
        "Example 3:\nInput: n = 8\nOutput: 11\nExplanation: 8, 9 and 10 are not palindromic primes, and 11 is both.",
        "Constraints:\n- 1 <= n <= 10^8",
      ],
      code: `bool isPrime(long long x) {
    if (x < 2) return false;
    if (x % 2 == 0) return x == 2;
    for (long long d = 3; d * d <= x; d += 2)
        if (x % d == 0) return false;
    return true;
}

int primePalindrome(int n) {
    if (n <= 2) return 2;
    if (n <= 3) return 3;
    if (n <= 5) return 5;
    if (n <= 7) return 7;
    if (n <= 11) return 11;
    // every palindrome with an even number of digits is divisible by 11, so only odd lengths remain
    for (int root = 1; root < 100000; root++) {
        string s = to_string(root), rev = s;
        reverse(rev.begin(), rev.end());
        long long cand = stoll(s + rev.substr(1));    // mirror around the last digit of the root
        if (cand >= n && isPrime(cand)) return (int)cand;
    }
    return -1;   // unreachable for n <= 10^8
}`,
      explanation: [
        "Iterating x upward and testing both properties is far too slow: palindromes are sparse, so almost every sqrt(x) primality test is wasted. Flip the generator - enumerate palindromes in increasing order and test only those. Between 10^8 and 2 * 10^8 there are only a few thousand candidates.",
        "The decisive pruning is a divisibility fact: the alternating digit sum of an even-length palindrome is 0, so 11 divides it. Hence 11 is the only even-length palindromic prime, and past 11 the search can consider odd-length palindromes exclusively. Without this the search would also have to scan 4-, 6- and 8-digit palindromes.",
        "Odd-length palindromes are generated from a root by mirroring all but the root's last digit: root 12 gives 121, root 123 gives 12321. Roots in increasing order produce palindromes in increasing order (roots 1..9 give 1 digit, 10..99 give 3 digits, and so on), which is what lets the first hit be returned immediately.",
        "The small hard-coded prefix is not laziness: it covers the single-digit primes and 11, exactly the cases the odd-length generator would either miss or reach out of order.",
        "Time: about O(P * sqrt(A)) where A < 2 * 10^8 is the answer and P is the few thousand palindromes below it. Space: O(1) beyond the small strings.",
      ],
    },
  ],
};
