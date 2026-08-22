import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Sieve of Eratosthenes",
      difficulty: "Easy",
      variation: "Boolean sieve, the template",
      link: "https://www.geeksforgeeks.org/sieve-of-eratosthenes/",
      question: [
        "Given an integer n, return every prime number in the range [2, n] in increasing order. Do not test each number independently - build the answer for the whole range in one pass.",
        "Example 1:\nInput: n = 20\nOutput: [2, 3, 5, 7, 11, 13, 17, 19]\nExplanation: 4, 6, 8, ... are struck out as multiples of 2, 9 and 15 as multiples of 3, and 25 is already past n.",
        "Example 2:\nInput: n = 1\nOutput: []\nExplanation: 1 is neither prime nor composite, so the range [2, 1] is empty.",
        "Constraints:\n- 0 <= n <= 10^7\n- Output must be sorted increasingly",
      ],
      code: `vector<int> sieve(int n) {
    vector<char> isPrime(max(n + 1, 2), 1);
    isPrime[0] = isPrime[1] = 0;
    for (int i = 2; (long long)i * i <= n; i++) {
        if (!isPrime[i]) continue;              // i already struck out, its multiples too
        for (int j = i * i; j <= n; j += i)     // start at i*i, smaller multiples of i are done
            isPrime[j] = 0;
    }
    vector<int> primes;
    for (int i = 2; i <= n; i++)
        if (isPrime[i]) primes.push_back(i);
    return primes;
}`,
      explanation: [
        "The state is a single flag per number: isPrime[x] says 'no proper divisor of x found yet'. The invariant is that when the outer loop reaches i, every composite with a smallest prime factor below i has already been cleared, so if isPrime[i] is still set then i has no divisor below i and is prime.",
        "Two bounds make it fast. The outer loop stops at sqrt(n) because any composite x <= n has a prime factor at most sqrt(x); once i exceeds sqrt(n) every remaining composite has already been struck. The inner loop starts at i*i because a multiple i*k with k < i was already removed when the smaller prime factor of k was processed.",
        "The tempting wrong approach is trial division on each number, which costs O(n sqrt(n)) - roughly 10^10 operations at n = 10^7 and far too slow. The sieve trades that for one array write per (prime, multiple) pair, and the sum of n/p over primes p <= n is n * ln(ln n).",
        "Use vector<char> rather than vector<bool>: vector<bool> packs bits and each access needs shifting and masking, which measurably slows the inner loop. Also note i*i must be computed in 64-bit inside the loop condition when n is near the int limit.",
        "Time: O(n log log n). Space: O(n).",
      ],
    },
    {
      name: "Count Primes",
      difficulty: "Easy",
      variation: "Counting primes below n",
      link: "https://leetcode.com/problems/count-primes/",
      question: [
        "Given an integer n, return the number of prime numbers that are strictly less than n.",
        "Example 1:\nInput: n = 10\nOutput: 4\nExplanation: The primes below 10 are 2, 3, 5 and 7.",
        "Example 2:\nInput: n = 0\nOutput: 0\nExplanation: There are no primes below 0.",
        "Constraints:\n- 0 <= n <= 5 * 10^6",
      ],
      code: `int countPrimes(int n) {
    if (n < 3) return 0;                 // no prime is below 2
    vector<char> composite(n, 0);        // indices 0 .. n-1, the half-open range we care about
    for (int i = 2; (long long)i * i < n; i++) {
        if (composite[i]) continue;
        for (int j = i * i; j < n; j += i)
            composite[j] = 1;
    }
    int cnt = 0;
    for (int i = 2; i < n; i++)
        if (!composite[i]) cnt++;
    return cnt;
}`,
      explanation: [
        "Identical to the template sieve, with the range half-open because the problem asks for primes strictly below n. Sizing the array to exactly n and using < everywhere avoids the classic off-by-one where n itself gets counted.",
        "Flipping the flag from isPrime to composite lets the array start zero-initialised, which is what a fresh vector<char> gives for free.",
        "The guard n < 3 covers n = 0, 1 and 2 in one shot; without it the array of size 0 or 1 would be indexed at composite[2].",
        "Time: O(n log log n). Space: O(n).",
      ],
    },
    {
      name: "Prime Pairs With Target Sum",
      difficulty: "Medium",
      variation: "Sieve as an O(1) primality lookup",
      link: "https://leetcode.com/problems/prime-pairs-with-target-sum/",
      question: [
        "Given an integer n, find all ordered pairs [x, y] such that x + y = n, both x and y are prime, and 1 <= x <= y <= n. Return the list sorted by increasing x. If no such pair exists, return an empty list.",
        "Example 1:\nInput: n = 10\nOutput: [[3,7],[5,5]]\nExplanation: 3 + 7 = 10 with both prime, and 5 + 5 = 10 with 5 prime. The pair 2 + 8 fails because 8 is composite.",
        "Example 2:\nInput: n = 2\nOutput: []\nExplanation: The only candidate is 1 + 1, and 1 is not prime.",
        "Constraints:\n- 1 <= n <= 10^6",
      ],
      code: `vector<vector<int>> findPrimePairs(int n) {
    vector<vector<int>> res;
    if (n < 4) return res;               // smallest prime pair sums to 2 + 2 = 4
    vector<char> composite(n + 1, 0);
    for (int i = 2; (long long)i * i <= n; i++) {
        if (composite[i]) continue;
        for (int j = i * i; j <= n; j += i)
            composite[j] = 1;
    }
    for (int x = 2; x <= n / 2; x++) {   // x <= y forces x <= n/2
        int y = n - x;
        if (!composite[x] && !composite[y]) res.push_back({x, y});
    }
    return res;
}`,
      explanation: [
        "One sieve up to n turns primality into an array read, so the scan over candidate x is linear. Restricting x to at most n/2 both enforces x <= y and stops each unordered pair from being reported twice.",
        "Sieving is the right call here even though only about n/2 primality questions are asked: n/2 trial divisions cost O(n sqrt(n)) in total, while the sieve answers all of them after O(n log log n) preprocessing.",
        "Worth noting from the parity: for odd n one of x, y must be even, so the only possible pair is [2, n-2]. The general loop handles that automatically, but it explains why odd inputs produce at most one pair.",
        "Time: O(n log log n). Space: O(n).",
      ],
    },
    {
      name: "Closest Prime Numbers in Range",
      difficulty: "Medium",
      variation: "Consecutive primes in a range",
      link: "https://leetcode.com/problems/closest-prime-numbers-in-range/",
      question: [
        "Given two integers left and right, find two integers num1 and num2 such that left <= num1 < num2 <= right, both num1 and num2 are prime, and num2 - num1 is as small as possible. Among all pairs with that minimal difference, return the one with the smallest num1. Return [-1, -1] if fewer than two primes lie in the range.",
        "Example 1:\nInput: left = 10, right = 19\nOutput: [11,13]\nExplanation: The primes in range are 11, 13, 17, 19. The gaps are 2, 4 and 2; the pair (11,13) ties with (17,19) on gap and wins on smaller num1.",
        "Example 2:\nInput: left = 4, right = 6\nOutput: [-1,-1]\nExplanation: 5 is the only prime in range, so no pair exists.",
        "Constraints:\n- 1 <= left <= right <= 10^6",
      ],
      code: `vector<int> closestPrimes(int left, int right) {
    vector<char> composite(right + 1, 0);
    composite[0] = 1;
    if (right >= 1) composite[1] = 1;
    for (int i = 2; (long long)i * i <= right; i++) {
        if (composite[i]) continue;
        for (int j = i * i; j <= right; j += i)
            composite[j] = 1;
    }
    int prev = -1, a = -1, b = -1;
    for (int x = max(left, 2); x <= right; x++) {
        if (composite[x]) continue;
        // strict < keeps the earliest pair on ties, which is what the tie-break asks for
        if (prev != -1 && (b == -1 || x - prev < b - a)) { a = prev; b = x; }
        prev = x;
    }
    return {a, b};
}`,
      explanation: [
        "The minimal-gap pair must be two consecutive primes: if any prime sat strictly between num1 and num2 it would form a smaller gap with one of them. So a single left-to-right sweep that remembers only the previous prime is enough - no nested comparison of all pairs.",
        "Comparing with strict less-than means the first pair achieving a given gap is kept and later ties are rejected, which automatically yields the smallest num1.",
        "The trap is sieving only the window [left, right] with trial division per element, which at right = 10^6 and a wide window is much slower than one sieve to right. It is also easy to forget to mark 0 and 1 as non-prime, which would report 1 as part of a pair when left = 1.",
        "Time: O(right log log right). Space: O(right).",
      ],
    },
    {
      name: "Prime Subtraction Operation",
      difficulty: "Medium",
      variation: "Sieve plus greedy per element",
      link: "https://leetcode.com/problems/prime-subtraction-operation/",
      question: [
        "You are given a 0-indexed integer array nums. In one operation you may pick an index i that has not been picked before and subtract from nums[i] any prime p with p < nums[i]. Return true if it is possible to make nums strictly increasing using some number of such operations, and false otherwise.",
        "Example 1:\nInput: nums = [4,9,6,10]\nOutput: true\nExplanation: Subtract 3 from nums[0] and 7 from nums[1] to get [1,2,6,10], then subtract 3 from nums[2] to get [1,2,3,10], which is strictly increasing.",
        "Example 2:\nInput: nums = [5,8,3]\nOutput: false\nExplanation: The best achievable prefix is [2,3,...], and nums[2] = 3 cannot be reduced to anything above 3, so no sequence of operations works.",
        "Constraints:\n- 1 <= nums.length <= 1000\n- 1 <= nums[i] <= 1000",
      ],
      code: `bool primeSubOperation(vector<int>& nums) {
    const int M = 1001;
    vector<char> composite(M, 0);
    composite[0] = composite[1] = 1;
    for (int i = 2; i * i < M; i++) {
        if (composite[i]) continue;
        for (int j = i * i; j < M; j += i) composite[j] = 1;
    }
    int prev = 0;                            // 0 is below every legal value, so it is a safe seed
    for (int x : nums) {
        int best = -1;
        for (int p = 0; p < x; p++) {         // p = 0 means "do not operate on this index"
            if (p != 0 && composite[p]) continue;
            if (x - p > prev) best = x - p;   // p grows, so the last hit is the smallest value
        }
        if (best == -1) return false;
        prev = best;
    }
    return true;
}`,
      explanation: [
        "The greedy claim is that each element should be pushed as low as it can go while staying strictly above its predecessor. Making element i smaller never hurts element i+1 (it only loosens the constraint) and never helps any earlier element, so the pointwise minimum choice is optimal - an exchange argument on the first index where an optimal solution differs.",
        "The sieve supplies the set of legal subtrahends. Since p ranges over 0 and the primes below x, and x - p decreases as p increases, scanning p upward and keeping the last p that still satisfies x - p > prev lands exactly on the minimum achievable value.",
        "Two traps: p must be strictly less than nums[i] (so the result stays positive), and 'no operation' must remain an option, which is what p = 0 encodes. Dropping p = 0 breaks inputs that are already strictly increasing.",
        "Values are bounded by 1000, so a sieve to 1000 is built once and each element scans at most 1000 candidates.",
        "Time: O(M log log M + n * M) with M = 1000. Space: O(M).",
      ],
    },
    {
      name: "Four Divisors",
      difficulty: "Medium",
      variation: "Divisor-count and divisor-sum sieve",
      link: "https://leetcode.com/problems/four-divisors/",
      question: [
        "Given an integer array nums, consider each element that has exactly four divisors. Return the sum of the divisors of all such elements. If no element has exactly four divisors, return 0.",
        "Example 1:\nInput: nums = [21,4,7]\nOutput: 32\nExplanation: 21 has divisors 1, 3, 7, 21 - exactly four, summing to 32. 4 has three divisors and 7 has two, so neither contributes.",
        "Example 2:\nInput: nums = [21,21]\nOutput: 64\nExplanation: Both elements qualify and each contributes 32.",
        "Constraints:\n- 1 <= nums.length <= 10^4\n- 1 <= nums[i] <= 10^5",
      ],
      code: `int sumFourDivisors(vector<int>& nums) {
    int mx = *max_element(nums.begin(), nums.end());
    vector<int> cnt(mx + 1, 0);
    vector<long long> sum(mx + 1, 0);
    // harmonic sieve: walk each divisor d over its own multiples
    for (int d = 1; d <= mx; d++)
        for (int m = d; m <= mx; m += d) { cnt[m]++; sum[m] += d; }
    long long ans = 0;
    for (int x : nums)
        if (cnt[x] == 4) ans += sum[x];
    return (int)ans;
}`,
      explanation: [
        "This is the sieve pattern generalised: instead of marking multiples of primes only, every d from 1 to mx walks its multiples and contributes to them. After the double loop, cnt[m] is the number of divisors of m and sum[m] their sum, for every m at once.",
        "The cost is the harmonic sum mx/1 + mx/2 + ... + mx/mx, which is about mx * ln(mx) - around 1.2 * 10^6 operations at mx = 10^5, so the precomputation is essentially free and each query is a lookup.",
        "The number-theoretic shortcut is that exactly four divisors means x = p*q with distinct primes p, q (sum 1 + p + q + pq) or x = p^3 (sum 1 + p + p^2 + p^3), so a smallest-prime-factor sieve also solves it. The divisor sieve avoids that case analysis entirely.",
        "Per-element trial division to sqrt(x) is also fast enough here, but it re-does work when values repeat - as in example 2 - and does not generalise to millions of queries.",
        "Time: O(mx log mx + n). Space: O(mx).",
      ],
    },
    {
      name: "Counting Divisors",
      difficulty: "Medium",
      variation: "Divisor sieve answering many queries (CSES)",
      link: "https://cses.fi/problemset/task/1713",
      question: [
        "You are given n integers. For each of them, print the number of its divisors. All values are at most 10^6, and there can be up to 10^5 queries, so each query must be answered in constant time after preprocessing.",
        "Example 1:\nInput:\n3\n16\n17\n18\nOutput:\n5\n2\n6\nExplanation: 16 has divisors 1, 2, 4, 8, 16; 17 is prime so it has 2; 18 has 1, 2, 3, 6, 9, 18.",
        "Example 2:\nInput:\n2\n1\n1000000\nOutput:\n1\n49\nExplanation: 1 has only itself. 10^6 = 2^6 * 5^6, so it has (6+1)*(6+1) = 49 divisors.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= x <= 10^6",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const int N = 1000000;
    vector<int> divs(N + 1, 0);
    for (int d = 1; d <= N; d++)
        for (int m = d; m <= N; m += d) divs[m]++;   // about N ln N increments in total
    int n;
    cin >> n;
    while (n--) {
        int x;
        cin >> x;
        cout << divs[x] << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Every query value lives under a fixed bound, so the whole answer table is built once rather than per query. The divisor-count sieve is the cleanest way: d contributes exactly one to each of its multiples, and every divisor of m is some such d, so no divisor is counted twice or missed.",
        "The work is the harmonic sum, roughly 10^6 * ln(10^6) = 1.4 * 10^7 array increments - comfortably inside the time limit and cheaper than 10^5 separate factorisations once queries repeat values.",
        "The alternative is a smallest-prime-factor sieve plus the formula product of (e_i + 1) over the prime exponents. Same asymptotics for the sieve, but it needs an inner factorisation loop per query and more code; the divisor sieve makes each query a single read.",
        "Watch the memory: an int array of 10^6 + 1 entries is 4 MB, fine here, but a long long array of divisor sums would double that. Keep the table as narrow as the values allow.",
        "Time: O(N log N) preprocessing plus O(1) per query. Space: O(N).",
      ],
    },
    {
      name: "Distinct Prime Factors of Product of Array",
      difficulty: "Medium",
      variation: "Smallest-prime-factor sieve for factorisation",
      link: "https://leetcode.com/problems/distinct-prime-factors-of-product-of-array/",
      question: [
        "Given an array of positive integers nums, consider the product of all its elements. Return the number of distinct prime factors of that product.",
        "Example 1:\nInput: nums = [2,4,3,7,10,6]\nOutput: 4\nExplanation: The product is 10080 = 2^5 * 3^2 * 5 * 7, so the distinct primes are 2, 3, 5 and 7.",
        "Example 2:\nInput: nums = [2,4,8,16]\nOutput: 1\nExplanation: Every element is a power of 2, so the product is a power of 2 and only the prime 2 appears.",
        "Constraints:\n- 1 <= nums.length <= 10^4\n- 2 <= nums[i] <= 1000",
      ],
      code: `int distinctPrimeFactors(vector<int>& nums) {
    const int N = 1000;
    vector<int> spf(N + 1);
    for (int i = 0; i <= N; i++) spf[i] = i;
    for (int i = 2; i * i <= N; i++)
        if (spf[i] == i)                         // i is prime
            for (int j = i * i; j <= N; j += i)
                if (spf[j] == j) spf[j] = i;     // only the first (smallest) prime writes
    vector<char> seen(N + 1, 0);
    int ans = 0;
    for (int x : nums) {
        while (x > 1) {
            int p = spf[x];
            if (!seen[p]) { seen[p] = 1; ans++; }
            while (x % p == 0) x /= p;           // strip the whole prime power at once
        }
    }
    return ans;
}`,
      explanation: [
        "Never build the product - with 10^4 factors of up to 1000 it has thousands of digits. The set of primes dividing a product is the union of the prime sets of the factors, so each element can be factorised independently and the primes collected in a boolean set.",
        "The sieve is upgraded from a boolean flag to a smallest-prime-factor table: instead of writing 'composite', each pass writes the striking prime, guarded so only the first (hence smallest) prime factor is recorded. Repeatedly dividing x by spf[x] then factorises x in O(log x) steps with no division trial at all.",
        "Multiplicities are irrelevant, so the inner while loop strips the entire prime power in one go, keeping the outer loop count equal to the number of distinct primes of x.",
        "Time: O(N log log N + n log(max value)). Space: O(N).",
      ],
    },
    {
      name: "Prime Generator",
      difficulty: "Hard",
      variation: "Segmented sieve over a high narrow range (SPOJ)",
      link: "https://www.spoj.com/problems/PRIME1/",
      question: [
        "For each of t test cases you are given two integers m and n. Print, one per line, every prime p with m <= p <= n. Separate the output of consecutive test cases with a blank line. The bounds go up to 10^9, so a full sieve to n is impossible, but the window is narrow: n - m is at most 10^5.",
        "Example 1:\nInput:\n2\n1 10\n3 5\nOutput:\n2\n3\n5\n7\n\n3\n5\nExplanation: The primes in [1,10] are 2, 3, 5, 7 and the primes in [3,5] are 3, 5, with a blank line between the two blocks.",
        "Example 2:\nInput:\n1\n999999937 999999940\nOutput:\n999999937\nExplanation: 999999937 is the largest prime below 10^9; 999999938, 939 and 940 are all composite.",
        "Constraints:\n- 1 <= t <= 10\n- 1 <= m <= n <= 10^9\n- n - m <= 10^5",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const int LIM = 31623;                       // just above sqrt(10^9)
    vector<char> comp(LIM + 1, 0);
    vector<int> base;
    for (int i = 2; i <= LIM; i++) {
        if (comp[i]) continue;
        base.push_back(i);
        for (int j = i * i; j <= LIM; j += i) comp[j] = 1;
    }
    int t;
    cin >> t;
    while (t--) {
        long long m, n;
        cin >> m >> n;
        if (m < 2) m = 2;                        // 0 and 1 are not prime
        vector<char> isP(n >= m ? n - m + 1 : 0, 1);
        for (int p : base) {
            if ((long long)p * p > n) break;      // beyond sqrt(n) nothing new is struck
            // first multiple of p that is >= m, but never below p*p (p itself must survive)
            long long start = max((long long)p * p, ((m + p - 1) / p) * (long long)p);
            for (long long j = start; j <= n; j += p) isP[j - m] = 0;
        }
        for (long long x = m; x <= n; x++)
            if (isP[x - m]) cout << x << "\\n";
        if (t) cout << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Any composite x <= n has a prime factor at most sqrt(n) <= 31623. So a small base sieve up to 31623 holds every prime that can ever strike a number in the window, and the window itself only needs an array of size n - m + 1 indexed by offset x - m.",
        "For each base prime p, the first multiple to strike is ceil(m/p)*p. Clamping the start up to p*p is what keeps p itself alive when p lies inside the window - without it, the range [2, 10] would wrongly mark 2, 3, 5 and 7 as composite.",
        "The tempting wrong approach is a full sieve to n: at n = 10^9 that is a gigabyte of flags. The other trap is arithmetic - m, n and the multiple j all exceed the int range once n approaches 10^9, so they must be 64-bit even though the base primes fit in an int.",
        "Time: O(sqrt(n) log log sqrt(n)) once, plus O((n - m + 1) log log n) per query. Space: O(sqrt(n) + (n - m + 1)).",
      ],
    },
    {
      name: "Largest Component Size by Common Factor",
      difficulty: "Hard",
      variation: "SPF sieve plus DSU over prime nodes",
      link: "https://leetcode.com/problems/largest-component-size-by-common-factor/",
      question: [
        "You are given an array nums of unique positive integers. Build a graph whose nodes are the values of nums, with an edge between two values whenever their greatest common divisor is greater than 1. Return the size of the largest connected component in that graph.",
        "Example 1:\nInput: nums = [4,6,15,35]\nOutput: 4\nExplanation: 4-6 share 2, 6-15 share 3, 15-35 share 5, so all four values form one component.",
        "Example 2:\nInput: nums = [20,50,9,63]\nOutput: 2\nExplanation: 20 and 50 share 2 and 5; 9 and 63 share 3. The two groups have no common prime, so the largest component has size 2.",
        "Constraints:\n- 1 <= nums.length <= 2 * 10^4\n- 1 <= nums[i] <= 10^5\n- All values in nums are unique",
      ],
      code: `int largestComponentSize(vector<int>& nums) {
    int n = nums.size();
    int mx = *max_element(nums.begin(), nums.end());
    vector<int> spf(mx + 1);
    for (int i = 0; i <= mx; i++) spf[i] = i;
    for (int i = 2; (long long)i * i <= mx; i++)
        if (spf[i] == i)
            for (int j = i * i; j <= mx; j += i)
                if (spf[j] == j) spf[j] = i;
    // node i is array index i, node n + p is the prime p
    vector<int> par(n + mx + 1);
    for (int i = 0; i < (int)par.size(); i++) par[i] = i;
    function<int(int)> find = [&](int x) { return par[x] == x ? x : par[x] = find(par[x]); };
    for (int i = 0; i < n; i++) {
        int x = nums[i];
        while (x > 1) {
            int p = spf[x];
            int a = find(i), b = find(n + p);
            if (a != b) par[a] = b;
            while (x % p == 0) x /= p;
        }
    }
    unordered_map<int,int> cnt;
    int best = 0;
    for (int i = 0; i < n; i++) best = max(best, ++cnt[find(i)]);
    return best;
}`,
      explanation: [
        "Testing all pairs is 4 * 10^8 gcd calls and far too slow. The reframing: two values are adjacent exactly when they share a prime, so instead of value-to-value edges, attach every value to each of its prime factors. Two values then land in the same DSU component precisely when a chain of shared primes links them - the same connectivity, with O(log v) unions per value instead of O(n) comparisons.",
        "Primes need their own node ids, which is why the DSU spans n + mx + 1 slots and prime p is stored at index n + p. The prime nodes are helper nodes only, so the final count iterates over the n value indices and never counts a prime root as a member.",
        "The smallest-prime-factor sieve makes the factorisation cheap: dividing repeatedly by spf[x] gives each distinct prime once, so a value contributes at most six or seven unions at these bounds.",
        "Edge cases: a value of 1 has no prime factors and stays a singleton, and the case nums = [1] must return 1 - the loop over value indices handles both without a special branch.",
        "Time: O(mx log log mx + n log(mx) * alpha). Space: O(mx + n).",
      ],
    },
    {
      name: "Greatest Common Divisor Traversal",
      difficulty: "Hard",
      variation: "Full connectivity check via shared primes",
      link: "https://leetcode.com/problems/greatest-common-divisor-traversal/",
      question: [
        "You are given a 0-indexed integer array nums. You may travel from index i to index j (in either direction) if gcd(nums[i], nums[j]) > 1. Return true if for every pair of indices (i, j) there is a sequence of such moves connecting them, and false otherwise.",
        "Example 1:\nInput: nums = [2,3,6]\nOutput: true\nExplanation: gcd(2,6) = 2 and gcd(3,6) = 3, so index 2 bridges indices 0 and 1 and every pair is connected.",
        "Example 2:\nInput: nums = [3,9,5]\nOutput: false\nExplanation: gcd(5,3) = gcd(5,9) = 1, so index 2 is isolated and cannot be reached.",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- 1 <= nums[i] <= 10^5",
      ],
      code: `bool canTraverseAllPairs(vector<int>& nums) {
    int n = nums.size();
    if (n == 1) return true;                    // a single index is trivially connected
    int mx = *max_element(nums.begin(), nums.end());
    vector<int> spf(mx + 1);
    for (int i = 0; i <= mx; i++) spf[i] = i;
    for (int i = 2; (long long)i * i <= mx; i++)
        if (spf[i] == i)
            for (int j = i * i; j <= mx; j += i)
                if (spf[j] == j) spf[j] = i;
    vector<int> par(n + mx + 1), sz(n + mx + 1, 1);
    for (int i = 0; i < (int)par.size(); i++) par[i] = i;
    function<int(int)> find = [&](int x) { return par[x] == x ? x : par[x] = find(par[x]); };
    auto unite = [&](int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return;
        if (sz[a] < sz[b]) swap(a, b);           // union by size keeps the trees shallow
        par[b] = a;
        sz[a] += sz[b];
    };
    for (int i = 0; i < n; i++) {
        int x = nums[i];
        while (x > 1) {
            int p = spf[x];
            unite(i, n + p);                     // prime p is node n + p
            while (x % p == 0) x /= p;
        }
    }
    int root = find(0);
    for (int i = 1; i < n; i++)
        if (find(i) != root) return false;
    return true;
}`,
      explanation: [
        "Same bipartite trick as the previous problem - values on one side, primes on the other - but now the question is whether the whole index set forms a single component, so after the unions it is enough to compare every index's root against index 0's root.",
        "Correctness of the reduction: a direct move i to j exists iff nums[i] and nums[j] share a prime p, which in the DSU means both were united with node n + p. Conversely any DSU path between two index nodes alternates value, prime, value, ..., and each value-prime-value hop is a legal move. So DSU connectivity and traversal reachability are the same relation.",
        "The trap is any element equal to 1. It has no prime factors, so it is united with nothing and stays alone; with n >= 2 the answer must be false, and the root comparison delivers that without a special case. The other trap is trying to detect connectivity by checking gcd of the whole array - [6,10,15] has overall gcd 1 yet is fully connected.",
        "Path compression plus union by size keeps the DSU near constant time, so the dominant cost is the sieve plus O(log v) unions per element.",
        "Time: O(mx log log mx + n log(mx) * alpha). Space: O(mx + n).",
      ],
    },
  ],
};
