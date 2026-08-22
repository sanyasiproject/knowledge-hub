import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Count Primes",
      difficulty: "Easy",
      variation: "Base sieve, the prerequisite",
      link: "https://leetcode.com/problems/count-primes/",
      question: [
        "Given an integer n, return the number of prime numbers that are strictly less than n. Solve it without testing each candidate independently: mark composites in one sweep instead.",
        "Example 1:\nInput: n = 10\nOutput: 4\nExplanation: The primes below 10 are 2, 3, 5 and 7.",
        "Example 2:\nInput: n = 2\nOutput: 0\nExplanation: There is no prime strictly less than 2.",
        "Constraints:\n- 0 <= n <= 5 * 10^6",
      ],
      code: `int countPrimes(int n) {
    if (n < 3) return 0;
    vector<char> composite(n, 0);           // composite[v] == 1 means v is not prime
    int count = 0;
    for (int i = 2; i < n; i++) {
        if (composite[i]) continue;
        count++;
        if ((long long)i * i >= n) continue; // no multiple below n left to mark
        for (long long j = (long long)i * i; j < n; j += i) composite[j] = 1;
    }
    return count;
}`,
      explanation: [
        "The invariant is that when the loop reaches i, every composite below i has already been marked by one of its prime factors, so an unmarked i must be prime. That is why marking can start from the primes only.",
        "Marking begins at i*i rather than 2*i because every smaller multiple k*i with k < i already carries a prime factor below i and was crossed off earlier. This is a constant-factor win, not an asymptotic one.",
        "The tempting wrong version is trial division per candidate, which costs O(n sqrt(n)) and times out around n = 10^6. The sieve trades that for one linear-ish pass over memory.",
        "This template is the foundation of the segmented sieve: it is what you run up to sqrt(R) to obtain the base primes. Its limitation is memory - it cannot address indices near 10^12, which is exactly the gap the segmented version fills.",
        "Time: O(n log log n). Space: O(n) bytes for the flag array.",
      ],
    },
    {
      name: "Almost Prime",
      difficulty: "Easy",
      variation: "Counting distinct prime factors by sieve",
      link: "https://codeforces.com/problemset/problem/26/A",
      question: [
        "A number is called almost prime if it has exactly two distinct prime divisors. For example 6 = 2 * 3 and 18 = 2 * 3 * 3 are almost prime because each has exactly the two distinct prime divisors 2 and 3, while 4 = 2 * 2 and 7 are not. Given n, count how many numbers in the range 1..n are almost prime.",
        "Example 1:\nInput: 10\nOutput: 2\nExplanation: Only 6 = 2 * 3 and 10 = 2 * 5 have exactly two distinct prime divisors.",
        "Example 2:\nInput: 21\nOutput: 8\nExplanation: The almost primes up to 21 are 6, 10, 12, 14, 15, 18, 20 and 21.",
        "Constraints:\n- 1 <= n <= 3000",
      ],
      code: `int main() {
    int n;
    cin >> n;
    vector<int> distinctFactors(n + 1, 0);
    // Sieve variant: instead of a boolean flag, accumulate a counter per number.
    for (int p = 2; p <= n; p++) {
        if (distinctFactors[p] != 0) continue;              // p already has a factor, so p is composite
        for (int j = p; j <= n; j += p) distinctFactors[j]++;
    }
    int answer = 0;
    for (int v = 1; v <= n; v++) if (distinctFactors[v] == 2) answer++;
    cout << answer << "\\n";
    return 0;
}`,
      explanation: [
        "The key idea is that the sieve does not have to store a boolean. Any additive statistic over prime divisors can be accumulated in the same sweep: here every prime p adds one to all of its multiples, so the array ends up holding the number of distinct prime divisors of each value.",
        "Primality detection comes for free from that counter. When the outer loop reaches p, the counter of p is still zero exactly when no smaller prime divides p, which means p is prime. So no separate boolean array is needed.",
        "The inner loop must start at p, not p*p, because we are counting divisors of every multiple, and p itself and small multiples like 2p must receive the increment.",
        "The tempting mistake is factorising each number separately by trial division. It is fine at n = 3000 but the sieve version generalises to n = 10^7 unchanged, which is the form these counting problems usually take.",
        "Time: O(n log log n). Space: O(n).",
      ],
    },
    {
      name: "Segmented Sieve",
      difficulty: "Medium",
      variation: "Primes in [L, R] for huge L, the template",
      link: "https://www.geeksforgeeks.org/segmented-sieve/",
      question: [
        "Given two integers L and R, print every prime number p with L <= p <= R. R can be as large as 10^12, so a plain sieve up to R is impossible, but the window is narrow: R - L is at most 10^6.",
        "Example 1:\nInput: L = 110, R = 130\nOutput: 113 127\nExplanation: Every other value in the window has a small factor - 111 = 3 * 37, 119 = 7 * 17, 121 = 11 * 11, 123 = 3 * 41, 129 = 3 * 43, and the rest are even or divisible by 5.",
        "Example 2:\nInput: L = 1, R = 20\nOutput: 2 3 5 7 11 13 17 19\nExplanation: 1 is not prime, so the window must be clamped to start at 2.",
        "Constraints:\n- 1 <= L <= R <= 10^12\n- R - L <= 10^6",
      ],
      code: `vector<long long> primesInRange(long long L, long long R) {
    if (R < 2) return {};
    L = max(L, 2LL);                                   // 0 and 1 are never prime
    long long lim = (long long)sqrtl((long double)R) + 1;
    // Step 1: ordinary sieve up to sqrt(R) to collect the base primes.
    vector<char> composite(lim + 1, 0);
    vector<long long> base;
    for (long long i = 2; i <= lim; i++) {
        if (composite[i]) continue;
        base.push_back(i);
        for (long long j = i * i; j <= lim; j += i) composite[j] = 1;
    }
    // Step 2: mark multiples of every base prime inside the shifted window.
    vector<char> mark(R - L + 1, 1);
    for (long long p : base) {
        long long start = max(p * p, (L + p - 1) / p * p);  // first multiple of p that is >= L and > p
        for (long long j = start; j <= R; j += p) mark[j - L] = 0;
    }
    vector<long long> result;
    for (long long v = L; v <= R; v++) if (mark[v - L]) result.push_back(v);
    return result;
}`,
      explanation: [
        "Correctness rests on one fact: a composite number n has a prime factor at most sqrt(n). So sieving the window with every prime up to sqrt(R) removes every composite in it, and whatever survives is prime. Primes above sqrt(R) are irrelevant as sieving primes because their smallest multiple inside the window would be a number larger than R.",
        "The window is stored shifted: index i of the mark array represents the value L + i. That is the whole trick - memory is proportional to the window width, not to R, so L can sit at 10^12.",
        "The start offset must be max(p*p, first multiple of p at or above L). The ceiling formula (L + p - 1) / p * p alone would mark p itself when p happens to lie inside the window, wrongly deleting a real prime; taking the max with p*p protects the base primes.",
        "Two classic traps: forgetting to clamp L to 2, which reports 1 as prime, and using int for start or j, which overflows once L approaches 10^12. Every value in the window arithmetic must be 64-bit.",
        "Time: O(sqrt(R) log log sqrt(R) + (R - L) log log R). Space: O(sqrt(R) + (R - L)).",
      ],
    },
    {
      name: "Prime Generator (PRIME1)",
      difficulty: "Medium",
      variation: "Many range queries, judge I/O",
      link: "https://www.spoj.com/problems/PRIME1/",
      question: [
        "The first line holds the number of test cases t. Each of the next t lines holds two integers m and n. For every test case print all prime numbers p with m <= p <= n, one per line, and separate the output of consecutive test cases by an empty line.",
        "Example 1:\nInput:\n2\n1 10\n3 5\nOutput:\n2\n3\n5\n7\n\n3\n5\nExplanation: The first window contributes 2, 3, 5, 7; after the blank line the second window contributes 3 and 5.",
        "Constraints:\n- 1 <= t <= 10\n- 1 <= m <= n <= 10^9\n- n - m <= 10^5",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const int LIM = 31623;                     // just above sqrt(10^9)
    vector<char> composite(LIM + 1, 0);
    vector<int> base;
    for (int i = 2; i <= LIM; i++) {
        if (composite[i]) continue;
        base.push_back(i);
        for (long long j = (long long)i * i; j <= LIM; j += i) composite[j] = 1;
    }
    int t;
    cin >> t;
    string out;
    for (int tc = 0; tc < t; tc++) {
        long long m, n;
        cin >> m >> n;
        long long lo = max(m, 2LL);
        if (tc) out += '\\n';                   // blank line between test cases
        if (lo > n) continue;
        vector<char> mark(n - lo + 1, 1);
        for (int p : base) {
            if ((long long)p * p > n) break;    // remaining base primes cannot mark anything
            long long start = max((long long)p * p, (lo + p - 1) / p * p);
            for (long long j = start; j <= n; j += p) mark[j - lo] = 0;
        }
        for (long long v = lo; v <= n; v++) {
            if (!mark[v - lo]) continue;
            out += to_string(v);
            out += '\\n';
        }
    }
    fwrite(out.data(), 1, out.size(), stdout);
    return 0;
}`,
      explanation: [
        "The base primes up to sqrt(10^9) depend only on the global bound, not on the query, so they are computed once outside the loop. Recomputing them per test case is the most common reason this problem runs slow.",
        "Each query then costs only the window sweep: for every base prime p the inner loop touches about (n - m) / p cells, and summing over primes gives roughly (n - m) log log n work.",
        "Output volume is the real bottleneck here - a window of 10^5 can hold thousands of primes across ten test cases. Building one string and flushing it with a single write avoids the per-line stream overhead that causes time limit exceeded on this problem.",
        "The trap is the blank-line rule: it goes between test cases, so emit it before every case except the first rather than after each one, otherwise the trailing separator can be rejected by strict checkers.",
        "Time: O(sqrt(n) log log sqrt(n) + t * (n - m) log log n). Space: O(sqrt(n) + (n - m)).",
      ],
    },
    {
      name: "Closest Prime Numbers in Range",
      difficulty: "Medium",
      variation: "Closest prime pair inside a window",
      link: "https://leetcode.com/problems/closest-prime-numbers-in-range/",
      question: [
        "Given two integers left and right, find two integers num1 and num2 such that left <= num1 < num2 <= right, both num1 and num2 are prime, and num2 - num1 is the smallest possible among all such pairs. If several pairs tie, return the one with the smallest num1. Return the answer as the pair [num1, num2], or [-1, -1] if no such pair exists.",
        "Example 1:\nInput: left = 10, right = 19\nOutput: [11,13]\nExplanation: The primes in the range are 11, 13, 17, 19. The gaps are 2, 4 and 2; the first pair achieving the minimum gap of 2 is [11,13].",
        "Example 2:\nInput: left = 4, right = 6\nOutput: [-1,-1]\nExplanation: The range holds only one prime, 5, so no pair exists.",
        "Constraints:\n- 1 <= left <= right <= 10^6",
      ],
      code: `vector<int> closestPrimes(int left, int right) {
    vector<char> composite(right + 1, 0);
    // Sieve only up to right; the window scan afterwards is what selects the pair.
    for (long long i = 2; (long long)i * i <= right; i++) {
        if (composite[i]) continue;
        for (long long j = i * i; j <= right; j += i) composite[j] = 1;
    }
    int prev = -1, bestA = -1, bestB = -1, bestGap = INT_MAX;
    for (int v = max(left, 2); v <= right; v++) {
        if (composite[v]) continue;
        if (prev != -1 && v - prev < bestGap) {   // strict <, so ties keep the earlier pair
            bestGap = v - prev;
            bestA = prev;
            bestB = v;
        }
        prev = v;
    }
    return {bestA, bestB};
}`,
      explanation: [
        "Two consecutive primes in the sorted list always give the smallest possible difference for the pair that starts at the earlier one, so only adjacent pairs need to be considered. Keeping just the previous prime seen turns the search into one linear scan.",
        "Using a strict less-than when updating the best gap automatically satisfies the tie-break rule, because the scan visits candidates in increasing num1 order and a later equal gap therefore never overwrites an earlier one.",
        "An early exit once bestGap reaches 2 is valid - twin primes are the tightest possible pair above the single case [2,3] - but it is not needed at 10^6.",
        "Here right is only 10^6, so a full sieve fits. The moment the bound moves to 10^12 with a narrow window this exact scan runs on a segmented window instead, which is why this problem is the natural bridge to the segmented template.",
        "Time: O(right log log right). Space: O(right).",
      ],
    },
    {
      name: "Bear and Prime Numbers",
      difficulty: "Medium",
      variation: "Sieve plus prefix sums over primes",
      link: "https://codeforces.com/problemset/problem/385/C",
      question: [
        "You are given an array of n integers. Define f(p) as the number of array elements divisible by p. For each of m queries (l, r) output the sum of f(p) over all prime numbers p with l <= p <= r.",
        "Example 1:\nInput:\n6\n5 5 7 10 14 15\n3\n2 11\n3 12\n4 4\nOutput:\n9\n7\n0\nExplanation: f(2) = 2 (10, 14), f(3) = 1 (15), f(5) = 4 (5, 5, 10, 15), f(7) = 2 (7, 14), f(11) = 0. The first query sums all five: 2 + 1 + 4 + 2 + 0 = 9. The second drops f(2), giving 7. The third range holds no prime at all, so the answer is 0.",
        "Constraints:\n- 1 <= n, m <= 10^6 (m <= 5 * 10^4)\n- 2 <= array values <= 10^7\n- 1 <= l <= r <= 2 * 10^9",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const int MAX = 10000000;
    int n;
    cin >> n;
    vector<int> cnt(MAX + 1, 0);               // cnt[v] = how many times value v appears
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        cnt[x]++;
    }
    vector<char> composite(MAX + 1, 0);
    for (long long i = 2; i * i <= MAX; i++) {
        if (composite[i]) continue;
        for (long long j = i * i; j <= MAX; j += i) composite[j] = 1;
    }
    cnt[0] = 0;
    cnt[1] = 0;
    long long running = 0;
    // Overwrite cnt in place with the prefix sum: safe because the harmonic loop
    // for index i only reads cells i, 2i, 3i ... which are never below i.
    for (int i = 2; i <= MAX; i++) {
        if (!composite[i]) {
            long long add = 0;
            for (int j = i; j <= MAX; j += i) add += cnt[j];
            running += add;
        }
        cnt[i] = (int)running;
    }
    int m;
    cin >> m;
    string out;
    while (m--) {
        long long l, r;
        cin >> l >> r;
        if (l < 2) l = 2;
        if (r > MAX) r = MAX;                  // no prime above MAX can divide any element
        long long ans = (l > r) ? 0 : (long long)cnt[r] - cnt[l - 1];
        out += to_string(ans);
        out += '\\n';
    }
    fwrite(out.data(), 1, out.size(), stdout);
    return 0;
}`,
      explanation: [
        "f(p) is not computed per query and not by factorising elements. Bucket the values first, then for each prime p add up the buckets at p, 2p, 3p, ... That is the harmonic sieve sum, about MAX * ln ln MAX operations over all primes together.",
        "Once every f(p) is known, a prefix sum over the index axis answers a range query in O(1). Composite indices simply contribute zero, which keeps the prefix array indexable by raw value.",
        "Clamping r to MAX is what makes the 2 * 10^9 bound harmless: a prime larger than the biggest array value divides nothing, so f(p) = 0 there and truncating the range cannot change the answer. Clamping l to 2 handles l = 1.",
        "Memory is the real constraint - two arrays of 10^7 entries. Writing the prefix sums back into the count array in place, and keeping the primality flags as bytes rather than ints, is what fits it. The total sum is bounded by n times the maximum number of distinct prime factors, so it still fits in a 32-bit cell, but the accumulator is kept 64-bit for safety.",
        "Time: O(MAX log log MAX + n + m). Space: O(MAX).",
      ],
    },
    {
      name: "2017-like Number",
      difficulty: "Medium",
      variation: "Prefix counts of a prime predicate",
      link: "https://atcoder.jp/contests/abc084/tasks/abc084_d",
      question: [
        "Call an odd number x similar to 2017 if x is prime and (x + 1) / 2 is also prime. Answer q queries; each query gives two odd numbers l and r and asks how many integers x with l <= x <= r are similar to 2017.",
        "Example 1:\nInput:\n1\n3 7\nOutput:\n2\nExplanation: 3 qualifies since 3 is prime and (3+1)/2 = 2 is prime; 5 qualifies since (5+1)/2 = 3 is prime; 7 fails because (7+1)/2 = 4 is not prime.",
        "Example 2:\nInput:\n4\n13 13\n7 11\n7 11\n2017 2017\nOutput:\n1\n0\n0\n1\nExplanation: 13 qualifies because (13+1)/2 = 7 is prime. In 7..11 the only primes are 7 and 11, and (7+1)/2 = 4 and (11+1)/2 = 6 are both composite. 2017 qualifies because (2017+1)/2 = 1009 is prime.",
        "Constraints:\n- 1 <= q <= 10^5\n- 1 <= l <= r <= 10^5, and both l and r are odd",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const int MAX = 100000;
    vector<char> isPrime(MAX + 1, 1);
    isPrime[0] = isPrime[1] = 0;
    for (long long i = 2; i * i <= MAX; i++) {
        if (!isPrime[i]) continue;
        for (long long j = i * i; j <= MAX; j += i) isPrime[j] = 0;
    }
    vector<int> pref(MAX + 2, 0);
    for (int x = 1; x <= MAX; x++) {
        // Only odd x can satisfy the predicate, and (x+1)/2 stays inside the sieve.
        int good = (x % 2 == 1 && isPrime[x] && isPrime[(x + 1) / 2]) ? 1 : 0;
        pref[x] = pref[x - 1] + good;
    }
    int q;
    cin >> q;
    string out;
    while (q--) {
        int l, r;
        cin >> l >> r;
        out += to_string(pref[r] - pref[l - 1]);
        out += '\\n';
    }
    fwrite(out.data(), 1, out.size(), stdout);
    return 0;
}`,
      explanation: [
        "The predicate is per number and independent of the query, so the whole problem is: sieve once, evaluate the predicate for every value, then answer each range with a prefix-count subtraction.",
        "Because x <= 10^5 the derived value (x + 1) / 2 never exceeds 5 * 10^4, so one sieve up to 10^5 answers both primality tests. No second sieve is needed.",
        "The 3 as a special case is worth noticing: 3 counts because (3+1)/2 = 2 is prime, so the sieve must mark 2 as prime and 1 as non-prime correctly. Setting isPrime[1] = 0 explicitly is what stops x = 1 from leaking in.",
        "The wrong-but-tempting approach is testing primality per query with trial division. With 10^5 queries over ranges of length 10^5 that is 10^10 operations; the prefix table makes each query O(1).",
        "Time: O(MAX log log MAX + q). Space: O(MAX).",
      ],
    },
    {
      name: "Counting Divisors",
      difficulty: "Medium",
      variation: "Divisor-counting sieve",
      link: "https://cses.fi/problemset/task/1713",
      question: [
        "You are given n integers. For each of them, print the number of its positive divisors. Answering each query by trial division up to sqrt(x) is too slow for the largest inputs, so precompute instead.",
        "Example 1:\nInput:\n3\n16\n17\n18\nOutput:\n5\n2\n6\nExplanation: 16 has divisors 1, 2, 4, 8, 16 (five of them); 17 is prime so it has two; 18 has 1, 2, 3, 6, 9, 18 (six).",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= x <= 10^6",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const int MAX = 1000000;
    vector<int> divisors(MAX + 1, 0);
    // Sieve of divisors: every d contributes one divisor to each of its multiples.
    for (int d = 1; d <= MAX; d++)
        for (int m = d; m <= MAX; m += d) divisors[m]++;
    int n;
    cin >> n;
    string out;
    while (n--) {
        int x;
        cin >> x;
        out += to_string(divisors[x]);
        out += '\\n';
    }
    fwrite(out.data(), 1, out.size(), stdout);
    return 0;
}`,
      explanation: [
        "This flips the direction of the usual question. Rather than asking which numbers divide x, iterate over every candidate divisor d and stamp it onto its multiples. Each pair (d, multiple) is visited exactly once, so every divisor is counted exactly once.",
        "The total work is MAX/1 + MAX/2 + MAX/3 + ... which is MAX * H(MAX), about MAX ln MAX - roughly 1.4 * 10^7 increments here. That is why the outer loop starts at 1 and not at the primes: we want all divisors, not just prime ones.",
        "The same skeleton computes other multiplicative statistics by changing what is added: adding d instead of 1 gives the sum of divisors, and adding a Mobius-weighted term gives coprime counts.",
        "The per-query alternative costs O(sqrt(x)) each, which is 10^5 * 10^3 = 10^8 divisions in the worst case and is far slower than one shared precomputation.",
        "Time: O(MAX log MAX) for the table plus O(1) per query. Space: O(MAX).",
      ],
    },
    {
      name: "Distinct Prime Factors of Product of Array",
      difficulty: "Medium",
      variation: "Smallest-prime-factor sieve for factorisation",
      link: "https://leetcode.com/problems/distinct-prime-factors-of-product-of-array/",
      question: [
        "Given an array of positive integers nums, consider the product of all its elements. Return the number of distinct prime factors of that product. Note that a prime p divides the product exactly when it divides at least one element, so the product itself never has to be formed.",
        "Example 1:\nInput: nums = [2,4,3,7,10,6]\nOutput: 4\nExplanation: The product is 10080 = 2^5 * 3^2 * 5 * 7, so the distinct primes are 2, 3, 5 and 7.",
        "Example 2:\nInput: nums = [2,4,8,16]\nOutput: 1\nExplanation: The product is 1024 = 2^10, so 2 is the only prime factor.",
        "Constraints:\n- 1 <= nums.length <= 10^4\n- 2 <= nums[i] <= 1000",
      ],
      code: `int distinctPrimeFactors(vector<int>& nums) {
    const int MAX = 1000;
    vector<int> spf(MAX + 1, 0);
    // Linear-style sieve storing the smallest prime factor of every value.
    for (int i = 2; i <= MAX; i++) {
        if (spf[i]) continue;                       // already has a smaller prime factor
        for (int j = i; j <= MAX; j += i)
            if (!spf[j]) spf[j] = i;                // first prime to reach j is its smallest
    }
    vector<char> seen(MAX + 1, 0);
    int answer = 0;
    for (int x : nums) {
        while (x > 1) {
            int p = spf[x];
            if (!seen[p]) {
                seen[p] = 1;
                answer++;
            }
            while (x % p == 0) x /= p;              // strip the whole power of p at once
        }
    }
    return answer;
}`,
      explanation: [
        "Forming the product is impossible - 10^4 factors of up to 1000 overflow any fixed-width type. But the set of primes dividing a product is the union of the sets dividing the factors, so factorising each element separately is both correct and cheap.",
        "The smallest-prime-factor table turns factorisation into a loop of divisions with no searching: spf[x] is always a prime, dividing it out reduces x, and the next spf lookup gives the next prime factor. The number of iterations is the number of prime factors of x with multiplicity, at most about log2(x).",
        "The guard if (!spf[j]) keeps the smallest prime that reaches j, because the outer loop visits primes in increasing order and the first writer therefore wins. Dropping that guard would leave the largest prime factor instead and break the stripping loop.",
        "A boolean seen array over primes is enough to deduplicate; sorting or using a hash set works too but adds a log factor for no benefit when the value bound is small.",
        "Time: O(MAX log log MAX + n log(max value)). Space: O(MAX).",
      ],
    },
    {
      name: "Printing some primes (TDPRIMES)",
      difficulty: "Hard",
      variation: "Block sieve to 10^8 under tight memory",
      link: "https://www.spoj.com/problems/TDPRIMES/",
      question: [
        "Consider all prime numbers below 10^8, listed in increasing order and indexed from 1. Print the primes sitting at positions 1, 101, 201, 301, and so on - that is, every prime whose one-based index leaves remainder 1 when divided by 100. There is no input.",
        "Example 1:\nInput: (no input)\nOutput:\n2\n547\n1229\n1993\n2749\n...\nExplanation: The 1st prime is 2. The 100th prime is 541 and the 101st is 547. The 200th is 1223 and the 201st is 1229. The 300th is 1987 and the 301st is 1993. The 400th is 2741 and the 401st is 2749.",
        "Constraints:\n- Fixed bound of 10^8, no input to read\n- The output has just over 57000 lines\n- Memory and time limits are tight enough that a flat sieve array of 10^8 bytes is not an option",
      ],
      code: `int main() {
    const long long N = 100000000;              // exclusive upper bound
    const int LIM = 10000;                      // sqrt(N)
    vector<char> composite(LIM + 1, 0);
    vector<int> base;
    for (int i = 2; i <= LIM; i++) {
        if (composite[i]) continue;
        base.push_back(i);
        for (int j = i * i; j <= LIM; j += i) composite[j] = 1;
    }
    const int BLOCK = 1 << 20;                  // window of about 10^6 values, cache friendly
    vector<char> mark(BLOCK);
    long long index = 0;
    string out;
    out.reserve(1 << 19);
    for (long long lo = 2; lo < N; lo += BLOCK) {
        long long hi = min(lo + BLOCK, N);      // window is [lo, hi)
        int width = (int)(hi - lo);
        fill(mark.begin(), mark.begin() + width, 1);
        for (int p : base) {
            if ((long long)p * p >= hi) break;  // this and every later base prime marks nothing
            long long start = max((long long)p * p, (lo + p - 1) / p * p);
            for (long long j = start; j < hi; j += p) mark[j - lo] = 0;
        }
        for (int i = 0; i < width; i++) {
            if (!mark[i]) continue;
            index++;
            if (index % 100 == 1) {             // positions 1, 101, 201, ...
                out += to_string(lo + i);
                out += '\\n';
            }
        }
    }
    fwrite(out.data(), 1, out.size(), stdout);
    return 0;
}`,
      explanation: [
        "This is the segmented sieve used for its second purpose. The range starts at 2, so nothing forces segmentation mathematically - it is forced by memory and cache. One block of about 10^6 bytes is swept a hundred times instead of allocating 10^8 bytes at once, and every marking pass then works inside a buffer that stays in cache.",
        "The base primes up to sqrt(10^8) = 10^4 are computed once and reused for every block, exactly as in the [L, R] template. Only the start offset changes per block: the first multiple of p at or above lo, never below p*p.",
        "Because the blocks are processed in increasing order and each is scanned left to right, the global prime index can simply be carried across blocks in one counter. That is what lets the answer be produced in a single pass with no list of primes ever stored.",
        "Two things sink naive submissions here: printing with a stream per line, which alone can exceed the time limit, and taking the break condition as p*p > N instead of per-block, which makes every block iterate over all base primes. Buffering the output and breaking early on p*p >= hi fix both.",
        "Careful with the index rule - it selects positions congruent to 1 modulo 100, so the very first prime 2 is printed and the 100th prime 541 is not.",
        "Time: O(N log log N) overall with a small cache-resident working set. Space: O(sqrt(N) + block size).",
      ],
    },
  ],
};
