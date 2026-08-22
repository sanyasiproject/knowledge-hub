import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Least Prime Factor of Numbers Till N",
      difficulty: "Easy",
      variation: "Linear sieve for smallest prime factor, the template",
      question: [
        "Given an integer n, compute for every integer i in 1..n its smallest prime factor spf[i]. By convention spf[1] = 1. Build the whole table in one pass so that each composite number is written exactly once.",
        "Example 1:\nInput: n = 10\nOutput: [1, 2, 3, 2, 5, 2, 7, 2, 3, 2]\nExplanation: The entries are spf of 1..10. spf[9] = 3 because 9 = 3 * 3, and spf[10] = 2 because 10 = 2 * 5.",
        "Example 2:\nInput: n = 6\nOutput: [1, 2, 3, 2, 5, 2]\nExplanation: 4 and 6 are even so their smallest prime factor is 2; 3 and 5 are prime so they are their own smallest factor.",
        "Constraints:\n- 1 <= n <= 10^7",
      ],
      code: `vector<int> leastPrimeFactor(int n) {
    vector<int> spf(n + 1, 0);
    vector<int> primes;
    spf[1] = 1;
    for (int i = 2; i <= n; i++) {
        if (spf[i] == 0) {            // i survived, so it is prime
            spf[i] = i;
            primes.push_back(i);
        }
        for (int p : primes) {
            if (p > spf[i]) break;                    // keep the write unique
            if ((long long)p * i > n) break;
            spf[p * i] = p;                           // p is the smallest factor of p*i
        }
    }
    return spf;
}`,
      explanation: [
        "The classic Eratosthenes sieve marks 12 three times (from 2, from 3, and as 2*6 style repeats depending on the variant). The linear sieve fixes the wasted work by giving every composite exactly one representation: c = p * i where p is the smallest prime factor of c and i = c / p.",
        "That representation is enforced by the two break conditions. Iterating primes in increasing order and stopping once p > spf[i] guarantees p is <= every prime factor of i, so p really is the smallest prime factor of p * i. Any larger p would produce a number whose smallest factor is a factor of i instead, and that number is written when the loop reaches its own true smallest prime.",
        "The tempting wrong version is to loop p over all primes without the p > spf[i] guard: it still fills the table correctly but degrades to O(n log log n) and, worse, people often then write spf[p*i] = p unconditionally and overwrite a smaller factor already stored.",
        "spf turns factorisation of any i <= n into a while loop that divides by spf repeatedly, which is why this table is the backbone of every other problem in this bank.",
        "Time: O(n) - each composite is assigned once. Space: O(n) for the table plus O(n / log n) for the prime list.",
      ],
    },
    {
      name: "Prime Factorization Using Sieve",
      difficulty: "Easy",
      variation: "Repeated queries answered in O(log x)",
      question: [
        "Precompute a smallest-prime-factor table once, then answer many queries of the form 'print the prime factorisation of x' in ascending prime order with multiplicity, where each x is at most the sieve limit.",
        "Example 1:\nInput: x = 13195\nOutput: 5 7 13 29\nExplanation: 13195 = 5 * 7 * 13 * 29, and every factor appears once.",
        "Example 2:\nInput: x = 1000\nOutput: 2 2 2 5 5 5\nExplanation: 1000 = 2^3 * 5^3, so 2 is printed three times and 5 three times.",
        "Constraints:\n- 1 <= x <= 10^6\n- up to 10^5 queries",
      ],
      code: `vector<int> spf;

void buildSpf(int n) {
    spf.assign(n + 1, 0);
    vector<int> primes;
    spf[1] = 1;
    for (int i = 2; i <= n; i++) {
        if (spf[i] == 0) { spf[i] = i; primes.push_back(i); }
        for (int p : primes) {
            if (p > spf[i] || (long long)p * i > n) break;
            spf[p * i] = p;
        }
    }
}

// Flat list of primes with multiplicity, already sorted ascending.
vector<int> factorize(int x) {
    vector<int> f;
    while (x > 1) {
        int p = spf[x];
        while (x % p == 0) { f.push_back(p); x /= p; }   // strip the whole power of p
    }
    return f;
}

// Same walk, but collapsed into (prime, exponent) pairs.
vector<pair<int,int>> factorizePairs(int x) {
    vector<pair<int,int>> f;
    while (x > 1) {
        int p = spf[x], e = 0;
        while (x % p == 0) { x /= p; e++; }
        f.push_back({p, e});
    }
    return f;
}`,
      explanation: [
        "Trial division costs O(sqrt(x)) per query, which is about 1000 operations at x = 10^6. With the spf table each step removes at least one prime factor, and x has at most log2(x) < 20 prime factors counted with multiplicity, so a query is at most 20 divisions.",
        "The factors come out already sorted because spf[x] is by definition the smallest prime still dividing x, and stripping its entire power leaves a quotient whose smallest prime is strictly larger.",
        "The inner while loop matters: without it the outer loop still terminates, but only if you divide once per iteration - and people who write x /= spf[x] once and then push spf[x] again from the stale value get a wrong answer. Strip the full power, or divide exactly once, never a mix.",
        "The pair form is what most downstream problems actually want, since divisor count, divisor sum, totient, and Moebius are all products over the (prime, exponent) list.",
        "Time: O(n) precompute, O(log x) per query. Space: O(n).",
      ],
    },
    {
      name: "Distinct Prime Factors of Product of Array",
      difficulty: "Medium",
      variation: "Union of prime supports",
      link: "https://leetcode.com/problems/distinct-prime-factors-of-product-of-array/",
      question: [
        "Given an array nums of positive integers, consider the product of all of its elements. Return the number of distinct prime factors of that product. The product itself may be astronomically large, so it must never be formed explicitly.",
        "Example 1:\nInput: nums = [2,4,3,7,10,6]\nOutput: 4\nExplanation: The product is 10080 = 2^5 * 3^2 * 5 * 7, so the distinct primes are 2, 3, 5, 7.",
        "Example 2:\nInput: nums = [2,4,8,16]\nOutput: 1\nExplanation: Every element is a power of 2, so the product is a power of 2 and the only prime factor is 2.",
        "Constraints:\n- 1 <= nums.length <= 10^4\n- 2 <= nums[i] <= 1000",
      ],
      code: `int distinctPrimeFactors(vector<int>& nums) {
    const int LIM = 1000;
    vector<int> spf(LIM + 1, 0);
    vector<int> primes;
    for (int i = 2; i <= LIM; i++) {
        if (spf[i] == 0) { spf[i] = i; primes.push_back(i); }
        for (int p : primes) {
            if (p > spf[i] || p * i > LIM) break;
            spf[p * i] = p;
        }
    }
    vector<char> seen(LIM + 1, 0);
    for (int x : nums) {
        while (x > 1) {
            int p = spf[x];
            seen[p] = 1;                    // presence only, exponents are irrelevant
            while (x % p == 0) x /= p;
        }
    }
    int cnt = 0;
    for (int p = 2; p <= LIM; p++) cnt += seen[p];
    return cnt;
}`,
      explanation: [
        "The prime support of a product is the union of the prime supports of the factors, because an exponent in the product is the sum of the exponents in the elements and a sum of non-negative integers is positive exactly when one term is. So the exponents can be discarded entirely and only a set of primes needs tracking.",
        "Since nums[i] <= 1000, a single spf sieve up to 1000 answers every factorisation in under 10 divisions. A boolean array indexed by prime is faster and simpler here than a hash set.",
        "The trap is trying to compute the product, even with 64-bit or modular arithmetic. 10^4 elements of size up to 1000 overflow immediately, and a product taken modulo anything loses its factorisation completely - a modular product of 0 tells you nothing about which primes divide it.",
        "Time: O(LIM + n log LIM) where LIM = 1000. Space: O(LIM).",
      ],
    },
    {
      name: "Counting Divisors",
      difficulty: "Medium",
      variation: "Divisor count from exponent vector",
      link: "https://cses.fi/problemset/task/1713",
      question: [
        "You are given n integers. For each of them, print the number of its positive divisors.",
        "Example 1:\nInput:\n3\n16\n17\n18\nOutput:\n5\n2\n6\nExplanation: 16 has divisors 1, 2, 4, 8, 16 (five of them). 17 is prime so it has 2. 18 has 1, 2, 3, 6, 9, 18 (six of them).",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= x <= 10^6",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const int LIM = 1000000;
    vector<int> spf(LIM + 1, 0);
    vector<int> primes;
    for (int i = 2; i <= LIM; i++) {
        if (spf[i] == 0) { spf[i] = i; primes.push_back(i); }
        for (int p : primes) {
            if (p > spf[i] || (long long)p * i > LIM) break;
            spf[p * i] = p;
        }
    }
    int n;
    cin >> n;
    while (n--) {
        int x;
        cin >> x;
        long long ans = 1;
        while (x > 1) {
            int p = spf[x], e = 0;
            while (x % p == 0) { x /= p; e++; }
            ans *= (e + 1);                 // choose an exponent 0..e independently
        }
        cout << ans << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Write x = p1^e1 * ... * pk^ek. A divisor is obtained by choosing, independently for each prime, an exponent between 0 and ei. That gives (e1+1) * ... * (ek+1) divisors, and the choices are in bijection with the divisors because factorisation is unique.",
        "So the only real work is producing the exponent vector, which the spf table does in O(log x) - about 20 divisions worst case at 10^6, versus 1000 for trial division per query. With 10^5 queries the difference is a comfortable pass versus a borderline one.",
        "An alternative is a harmonic-sum sieve: for d = 1..LIM add 1 to every multiple of d, giving the divisor count of every number in O(LIM log LIM). That is also fast enough here, but it needs a 10^6 int array of counts and does not generalise to problems where the exponents themselves are needed.",
        "The trap is counting divisors by looping i from 1 to sqrt(x) per query. That is correct but 10^5 * 1000 = 10^8 modulo operations, and it teaches nothing reusable.",
        "Time: O(LIM + n log LIM). Space: O(LIM).",
      ],
    },
    {
      name: "Program for Moebius Function",
      difficulty: "Medium",
      variation: "Moebius mu via linear sieve",
      question: [
        "The Moebius function mu(n) is defined as 1 if n = 1, as 0 if n is divisible by the square of a prime, and as (-1)^k if n is a product of k distinct primes. Compute mu(i) for all i in 1..n in a single linear sieve.",
        "Example 1:\nInput: n = 10\nOutput: [1, -1, -1, 0, -1, 1, -1, 0, 0, 1]\nExplanation: mu(4) = 0 and mu(8) = 0 and mu(9) = 0 because each is divisible by a square. mu(6) = 1 because 6 = 2 * 3 has two distinct primes, and mu(10) = 1 for the same reason.",
        "Example 2:\nInput: n = 30, then read mu(30)\nOutput: -1\nExplanation: 30 = 2 * 3 * 5 is squarefree with three distinct primes, so mu(30) = (-1)^3 = -1.",
        "Constraints:\n- 1 <= n <= 10^7",
      ],
      code: `vector<int> mobiusSieve(int n) {
    vector<int> spf(n + 1, 0), mu(n + 1, 0);
    vector<int> primes;
    mu[1] = 1;
    for (int i = 2; i <= n; i++) {
        if (spf[i] == 0) {          // i is prime: one distinct prime factor
            spf[i] = i;
            primes.push_back(i);
            mu[i] = -1;
        }
        for (int p : primes) {
            if ((long long)p * i > n) break;
            spf[p * i] = p;
            if (i % p == 0) {       // p already divides i, so p*i has p^2
                mu[p * i] = 0;
                break;              // p == spf[i], stop to keep the sieve linear
            }
            mu[p * i] = -mu[i];     // one new distinct prime multiplies mu by -1
        }
    }
    return mu;
}`,
      explanation: [
        "The sieve reuses the linear-sieve representation c = p * i with p = spf[c]. Two cases cover everything. If p does not divide i then p * i has one more distinct prime than i and stays squarefree exactly when i is, so mu(p*i) = -mu(i) - and if i was not squarefree, mu(i) was already 0 and the negation keeps it 0. If p does divide i then p^2 divides p * i, so mu(p*i) = 0.",
        "The break inside the p | i case is what keeps the loop linear: once p equals spf[i], every later prime q > p would produce q * i whose smallest prime factor is p, not q, so that number belongs to a different iteration.",
        "Why mu matters: it is the inverse of the constant-one function under Dirichlet convolution, which means sum over d | n of mu(d) equals 1 when n = 1 and 0 otherwise. That indicator is the engine behind every coprimality count - it lets you replace the condition gcd = 1 by a signed sum over divisors.",
        "The tempting wrong shortcut is to compute mu by factorising each number separately with spf: correct, but O(n log n) and it needlessly touches every number's factor list when the sieve already knows the answer from a single division.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Counting Coprime Pairs",
      difficulty: "Hard",
      variation: "Moebius over multiples, coprime pair count",
      link: "https://cses.fi/problemset/task/2417",
      question: [
        "You are given an array of n positive integers. Count the number of index pairs (i, j) with i < j such that gcd(a[i], a[j]) = 1.",
        "Example 1:\nInput:\n4\n1 2 3 4\nOutput: 5\nExplanation: The coprime pairs are (1,2), (1,3), (1,4), (2,3) and (3,4) by value. Only (2,4) fails, since gcd(2,4) = 2.",
        "Example 2:\nInput:\n3\n2 4 6\nOutput: 0\nExplanation: All three values are even, so every pair has gcd at least 2.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= a[i] <= 10^6",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const int LIM = 1000000;
    vector<int> spf(LIM + 1, 0), mu(LIM + 1, 0);
    vector<int> primes;
    mu[1] = 1;
    for (int i = 2; i <= LIM; i++) {
        if (spf[i] == 0) { spf[i] = i; primes.push_back(i); mu[i] = -1; }
        for (int p : primes) {
            if ((long long)p * i > LIM) break;
            spf[p * i] = p;
            if (i % p == 0) { mu[p * i] = 0; break; }
            mu[p * i] = -mu[i];
        }
    }
    int n;
    cin >> n;
    vector<int> freq(LIM + 1, 0);
    for (int i = 0; i < n; i++) { int x; cin >> x; freq[x]++; }

    long long ans = 0;
    for (int d = 1; d <= LIM; d++) {
        if (mu[d] == 0) continue;                       // squareful d contributes nothing
        long long c = 0;
        for (int m = d; m <= LIM; m += d) c += freq[m];  // how many values d divides
        ans += (long long)mu[d] * (c * (c - 1) / 2);
    }
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "Let cnt[d] be how many array values are divisible by d. Then the number of pairs whose gcd is a multiple of d is C(cnt[d], 2). Using the Moebius identity sum over d | g of mu(d) = [g = 1], summing mu(d) * C(cnt[d], 2) over all d counts each pair once weighted by sum over d dividing its gcd of mu(d), which is 1 for coprime pairs and 0 for all others.",
        "Concretely on [1,2,3,4]: d = 1 has cnt = 4 and contributes +C(4,2) = +6, d = 2 has cnt = 2 (the values 2 and 4) and contributes -C(2,2) = -1, d = 3 and d = 4 have cnt = 1 so their C(1,2) = 0, and every larger d has cnt 0. Total 6 - 1 = 5.",
        "cnt[d] is built by the harmonic loop over multiples, which is sum over d of LIM/d = O(LIM log LIM) - roughly 1.4 * 10^7 additions at LIM = 10^6, entirely fine. Skipping d with mu(d) = 0 removes about 40 percent of that work for free.",
        "The trap is the answer type. With n = 10^5 all-ones, the count is about 5 * 10^9, so the accumulator and the C(c,2) product must both be 64-bit; computing c * (c - 1) in int overflows silently.",
        "The wrong-but-tempting approach is to iterate over pairs and call gcd - 5 * 10^9 gcd calls is hopeless. Inclusion-exclusion over prime subsets of each value also works but is messier, since mu already encodes exactly those signs.",
        "Time: O(LIM log LIM + n). Space: O(LIM).",
      ],
    },
    {
      name: "Coprime Subsequences",
      difficulty: "Hard",
      variation: "Moebius over multiples, subset counting",
      link: "https://codeforces.com/problemset/problem/803/F",
      question: [
        "You are given an array of n positive integers. Count the number of non-empty subsequences whose elements have gcd exactly 1. Two subsequences are different if their index sets differ, even when the values coincide. Print the answer modulo 10^9 + 7.",
        "Example 1:\nInput:\n3\n1 2 3\nOutput: 5\nExplanation: The good subsequences are {1}, {1,2}, {1,3}, {2,3} and {1,2,3}. The remaining ones, {2} and {3}, have gcd 2 and 3.",
        "Example 2:\nInput:\n4\n1 1 1 1\nOutput: 15\nExplanation: Every one of the 2^4 - 1 = 15 non-empty subsequences has gcd 1.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= a[i] <= 10^5",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const int LIM = 100000;
    const long long MOD = 1000000007LL;
    vector<int> spf(LIM + 1, 0), mu(LIM + 1, 0);
    vector<int> primes;
    mu[1] = 1;
    for (int i = 2; i <= LIM; i++) {
        if (spf[i] == 0) { spf[i] = i; primes.push_back(i); mu[i] = -1; }
        for (int p : primes) {
            if ((long long)p * i > LIM) break;
            spf[p * i] = p;
            if (i % p == 0) { mu[p * i] = 0; break; }
            mu[p * i] = -mu[i];
        }
    }
    int n;
    cin >> n;
    vector<int> freq(LIM + 1, 0);
    for (int i = 0; i < n; i++) { int x; cin >> x; freq[x]++; }

    vector<long long> pw(n + 1);
    pw[0] = 1;
    for (int i = 1; i <= n; i++) pw[i] = pw[i - 1] * 2 % MOD;

    long long ans = 0;
    for (int d = 1; d <= LIM; d++) {
        if (mu[d] == 0) continue;
        int c = 0;
        for (int m = d; m <= LIM; m += d) c += freq[m];
        long long term = (pw[c] - 1 + MOD) % MOD;        // non-empty subsets of those c
        ans = (ans + mu[d] * term % MOD + MOD) % MOD;    // mu[d] is +1 or -1 here
    }
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "Define g(d) as the number of non-empty subsequences all of whose elements are divisible by d. Every such subsequence is an arbitrary non-empty subset of the cnt[d] eligible elements, so g(d) = 2^cnt[d] - 1. Note g(d) counts subsequences whose gcd is a multiple of d, not exactly d.",
        "Summing mu(d) * g(d) over all d weights each subsequence by sum over d dividing its gcd of mu(d), which is 1 precisely when the gcd is 1. That is the same Moebius indicator as the coprime-pair problem, with C(c,2) swapped for 2^c - 1 - the pattern is 'count by divisibility, then filter by mu'.",
        "Check on [1,2,3]: d = 1 gives cnt 3 and +(8-1) = 7, d = 2 gives cnt 1 and -(2-1) = -1, d = 3 gives cnt 1 and -1. Total 5, matching the enumeration.",
        "Two implementation traps. First, mu(d) can be -1, so the accumulator must be normalised back into [0, MOD) after every subtraction or the final answer can come out negative. Second, the exponent of 2 is cnt[d] <= n, so precomputing powers up to n is enough - calling a modpow inside the harmonic loop adds a log factor for nothing.",
        "Time: O(LIM log LIM + n). Space: O(LIM + n).",
      ],
    },
    {
      name: "Largest Component Size by Common Factor",
      difficulty: "Hard",
      variation: "SPF factorisation plus DSU over primes",
      link: "https://leetcode.com/problems/largest-component-size-by-common-factor/",
      question: [
        "You are given an array nums of distinct positive integers. Build a graph whose nodes are the array values, joining two values by an edge whenever they share a common factor greater than 1. Return the size of the largest connected component.",
        "Example 1:\nInput: nums = [4,6,15,35]\nOutput: 4\nExplanation: 4 and 6 share 2, 6 and 15 share 3, 15 and 35 share 5, so all four values form one component.",
        "Example 2:\nInput: nums = [20,50,9,63]\nOutput: 2\nExplanation: 20 and 50 share 2 and 5; 9 and 63 share 3. The two components each have size 2, and no value from one shares a factor with a value from the other.",
        "Constraints:\n- 1 <= nums.length <= 2 * 10^4\n- 1 <= nums[i] <= 10^5\n- all values in nums are distinct",
      ],
      code: `class Solution {
    vector<int> par;

    int find(int x) { return par[x] == x ? x : par[x] = find(par[x]); }

    void unite(int a, int b) {
        a = find(a); b = find(b);
        if (a != b) par[a] = b;
    }

public:
    int largestComponentSize(vector<int>& nums) {
        const int LIM = 100000;
        vector<int> spf(LIM + 1, 0);
        vector<int> primes;
        for (int i = 2; i <= LIM; i++) {
            if (spf[i] == 0) { spf[i] = i; primes.push_back(i); }
            for (int p : primes) {
                if (p > spf[i] || (long long)p * i > LIM) break;
                spf[p * i] = p;
            }
        }
        int n = nums.size();
        // Nodes 0..n-1 are array indices; nodes n+p represent the prime p.
        par.resize(n + LIM + 1);
        for (int i = 0; i < (int)par.size(); i++) par[i] = i;
        for (int i = 0; i < n; i++) {
            int x = nums[i];
            while (x > 1) {
                int p = spf[x];
                unite(i, n + p);            // index joins the class of each of its primes
                while (x % p == 0) x /= p;
            }
        }
        vector<int> cnt(par.size(), 0);
        int best = 0;
        for (int i = 0; i < n; i++) best = max(best, ++cnt[find(i)]);
        return best;
    }
};`,
      explanation: [
        "Adding an edge for every sharing pair would be O(n^2) gcd calls. The fix is to stop connecting values to each other and connect each value to its prime factors instead: two values share a factor greater than 1 exactly when they share a prime, and then both sit in the same DSU class as that prime. Connectivity in the original graph and in this bipartite value-prime graph are identical.",
        "Each value has at most 6 distinct primes below 10^5 (2*3*5*7*11*13 = 30030 already, and adding 17 exceeds 10^5), so the number of unions is tiny - the spf sieve is what makes finding those primes cheap.",
        "Only the value nodes are counted at the end. Counting prime nodes too would inflate every component, and the value 1 has no primes so it correctly stays a singleton of size 1.",
        "The trap beyond the O(n^2) version is factorising by trial division inside the loop: 2 * 10^4 * sqrt(10^5) is about 6 * 10^6 and survives here, but the same shape fails as soon as the value bound grows, whereas the spf table keeps each factorisation at under 17 divisions.",
        "Time: O(LIM + n log LIM) with near-constant DSU. Space: O(LIM + n).",
      ],
    },
    {
      name: "GCD Sort of an Array",
      difficulty: "Hard",
      variation: "Swap-reachability classes via shared primes",
      link: "https://leetcode.com/problems/gcd-sort-of-an-array/",
      question: [
        "You are given an integer array nums. You may repeatedly pick two indices i and j and swap nums[i] with nums[j], but only if gcd(nums[i], nums[j]) > 1. Return true if some sequence of such swaps sorts the array in non-decreasing order, and false otherwise.",
        "Example 1:\nInput: nums = [7,21,3]\nOutput: true\nExplanation: gcd(7,21) = 7 so swap them to get [21,7,3]; gcd(21,3) = 3 so swap positions 0 and 2 to get [3,7,21], which is sorted.",
        "Example 2:\nInput: nums = [5,2,6,2]\nOutput: false\nExplanation: A sorted array must start with 2, but 5 is coprime with 2, 6 and 2, so 5 can never move out of position 0.",
        "Constraints:\n- 1 <= nums.length <= 3 * 10^4\n- 2 <= nums[i] <= 10^5",
      ],
      code: `class Solution {
    vector<int> par;

    int find(int x) { return par[x] == x ? x : par[x] = find(par[x]); }

    void unite(int a, int b) {
        a = find(a); b = find(b);
        if (a != b) par[a] = b;
    }

public:
    bool gcdSort(vector<int>& nums) {
        const int LIM = 100000;
        vector<int> spf(LIM + 1, 0);
        vector<int> primes;
        for (int i = 2; i <= LIM; i++) {
            if (spf[i] == 0) { spf[i] = i; primes.push_back(i); }
            for (int p : primes) {
                if (p > spf[i] || (long long)p * i > LIM) break;
                spf[p * i] = p;
            }
        }
        par.resize(LIM + 1);
        for (int i = 0; i <= LIM; i++) par[i] = i;
        for (int x : nums) {
            int y = x;
            while (y > 1) {
                int p = spf[y];
                unite(x, p);                // value joins the class of each prime dividing it
                while (y % p == 0) y /= p;
            }
        }
        vector<int> sorted = nums;
        sort(sorted.begin(), sorted.end());
        for (int i = 0; i < (int)nums.size(); i++)
            if (find(nums[i]) != find(sorted[i])) return false;   // value cannot reach its slot
        return true;
    }
};`,
      explanation: [
        "Swappability is a transitive relation on positions once you view it through values: if a can swap with b and b with c, then a can be moved to c's slot using b as a courier, even though gcd(a, c) may be 1. So the values partition into equivalence classes, and any permutation of the values inside one class is achievable.",
        "Two values are in the same class exactly when they are connected in the value-prime graph, which is the same DSU trick as the previous problem: union each value with each of its distinct primes.",
        "Given the classes, the array is sortable iff the multiset of values in each class occupies exactly the same set of positions before and after sorting. Comparing nums[i] with sorted[i] class by class is a clean way to check that: sorting is stable with respect to classes, so if every position holds a value from the right class, the within-class rearrangement is legal.",
        "The trap is thinking a swap needs a direct shared factor between the two values that must trade places. Testing only pairwise gcd greater than 1 rejects [7,21,3], which is actually sortable through 21.",
        "Time: O(LIM + n log LIM + n log n). Space: O(LIM + n).",
      ],
    },
    {
      name: "VLATTICE - Visible Lattice Points",
      difficulty: "Hard",
      variation: "Moebius summation in three dimensions",
      link: "https://www.spoj.com/problems/VLATTICE/",
      question: [
        "Consider the lattice points (x, y, z) with 0 <= x, y, z <= N. A point is visible from the origin if the segment joining it to the origin contains no other lattice point. Given N, count how many points other than the origin are visible. Several test cases are given, terminated by N = 0.",
        "A point (x, y, z) other than the origin is visible exactly when gcd(x, y, z) = 1, taking gcd(0, a) = a.",
        "Example 1:\nInput:\n1\n2\n5\n0\nOutput:\n7\n19\n175\nExplanation: For N = 1 the visible points are the three axis points, the three points with one zero coordinate such as (1,1,0), and (1,1,1) - seven in all.",
        "Example 2:\nInput:\n3\n0\nOutput:\n49\nExplanation: 3 axis points, plus 3 * 7 points lying in a coordinate plane with gcd 1, plus 25 strictly positive triples with gcd 1, giving 3 + 21 + 25 = 49.",
        "Constraints:\n- 1 <= N <= 10^6\n- up to 50 test cases",
      ],
      code: `int LIM = 1000000;
vector<int> mu;

void buildMobius() {
    vector<int> spf(LIM + 1, 0);
    mu.assign(LIM + 1, 0);
    vector<int> primes;
    mu[1] = 1;
    for (int i = 2; i <= LIM; i++) {
        if (spf[i] == 0) { spf[i] = i; primes.push_back(i); mu[i] = -1; }
        for (int p : primes) {
            if ((long long)p * i > LIM) break;
            spf[p * i] = p;
            if (i % p == 0) { mu[p * i] = 0; break; }
            mu[p * i] = -mu[i];
        }
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    buildMobius();
    int n;
    while (cin >> n && n != 0) {
        long long two = 0, three = 0;
        for (int d = 1; d <= n; d++) {
            if (mu[d] == 0) continue;
            long long q = n / d;
            two += (long long)mu[d] * q * q;          // coprime pairs in [1,n]^2
            three += (long long)mu[d] * q * q * q;    // coprime triples in [1,n]^3
        }
        // 3 axis points + 3 coordinate planes + the strictly positive octant
        cout << 3 + 3 * two + three << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Split the points by how many coordinates are zero. Exactly two zeros gives the three axis points (1,0,0), (0,1,0), (0,0,1), all visible, and nothing further along an axis is. Exactly one zero gives three symmetric copies of the planar count A = number of (x,y) in [1,N]^2 with gcd 1. No zeros gives B = number of triples in [1,N]^3 with gcd 1.",
        "Both A and B come from the same Moebius identity: the number of tuples whose coordinates are all divisible by d is floor(N/d)^k, so the number with gcd exactly 1 is sum over d of mu(d) * floor(N/d)^k, with k = 2 for the planes and k = 3 for the octant. Both sums share the same loop.",
        "Sanity check at N = 2: A = 4 - 1 = 3, B = 8 - 1 = 7, answer 3 + 9 + 7 = 19, matching the sample. At N = 5, A = 25 - 4 - 1 - 1 = 19 and B = 125 - 8 - 1 - 1 = 115, giving 3 + 57 + 115 = 175.",
        "Two traps. The mu table must be built once outside the test-case loop, otherwise 50 sieves of 10^6 blow the time limit. And q*q*q reaches 10^18 at N = 10^6, so the cast to long long has to happen before the multiplication, not after.",
        "Time: O(LIM) precompute plus O(N) per test case. Space: O(LIM).",
      ],
    },
    {
      name: "Unusual Sequences",
      difficulty: "Hard",
      variation: "Moebius inversion over divisors of a single number",
      link: "https://codeforces.com/problemset/problem/900/D",
      question: [
        "Given two integers x and y, count the sequences of positive integers (order matters, length at least 1) whose greatest common divisor is exactly x and whose sum is exactly y. Print the count modulo 10^9 + 7.",
        "Example 1:\nInput: x = 3, y = 9\nOutput: 3\nExplanation: The sequences are (3,3,3), (3,6) and (6,3). Note (9) alone has gcd 9, not 3.",
        "Example 2:\nInput: x = 5, y = 8\nOutput: 0\nExplanation: Every element is a multiple of 5, so the sum is a multiple of 5, and 8 is not.",
        "Constraints:\n- 1 <= x, y <= 10^9",
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

int solve(int x, int y) {
    const long long MOD = 1000000007LL;
    if (y % x != 0) return 0;              // gcd x forces x | y
    int n = y / x;                         // divide out x: need gcd 1, sum n
    vector<int> ps;
    int t = n;
    for (int p = 2; (long long)p * p <= t; p++) {
        if (t % p == 0) {
            ps.push_back(p);
            while (t % p == 0) t /= p;
        }
    }
    if (t > 1) ps.push_back(t);
    long long ans = 0;
    int k = ps.size();
    for (int mask = 0; mask < (1 << k); mask++) {   // squarefree divisors of n
        long long d = 1;
        int bits = 0;
        for (int i = 0; i < k; i++)
            if (mask >> i & 1) { d *= ps[i]; bits++; }
        long long term = power(2, n / d - 1, MOD);   // compositions of n/d
        if (bits & 1) ans -= term;                  // mu(d) = -1
        else ans += term;                           // mu(d) = +1
        ans %= MOD;
    }
    return (int)((ans % MOD + MOD) % MOD);
}`,
      explanation: [
        "First reduce: every element is a multiple of x, so x must divide y, and dividing every element by x turns the task into counting sequences with gcd exactly 1 and sum n = y/x. Let f(n) be that count.",
        "The count with gcd a multiple of nothing in particular is easier: the number of sequences of positive integers summing to m, with order mattering, is 2^(m-1) - place or omit a divider in each of the m-1 gaps between m unit blocks. Call it g(m). Grouping those sequences by their gcd d, which must divide m, gives g(m) = sum over d | m of f(m/d).",
        "Moebius inversion on that relation yields f(n) = sum over d | n of mu(d) * 2^(n/d - 1). Only squarefree d contribute, so enumerating subsets of the distinct primes of n is enough - n <= 10^9 has at most 9 distinct primes, giving at most 512 terms.",
        "Check on x = 3, y = 9: n = 3, divisors 1 and 3, so f(3) = 2^2 - 2^0 = 4 - 1 = 3, matching (3,3,3), (3,6), (6,3).",
        "The traps are arithmetic rather than conceptual: n/d - 1 can be near 10^9 so the power needs binary exponentiation, and the alternating signs must be normalised into [0, MOD) at the end. Trial division to sqrt(10^9) is about 31623 steps, cheap enough that no sieve is needed here.",
        "Time: O(sqrt(n) + 2^k * (k + log n)) with k <= 9. Space: O(k).",
      ],
    },
  ],
};
