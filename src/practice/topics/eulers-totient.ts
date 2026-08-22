import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Euler's Totient Function",
      difficulty: "Easy",
      variation: "Single value via trial-division factorisation, the template",
      link: "https://www.geeksforgeeks.org/eulers-totient-function/",
      question: [
        "Euler's totient function phi(n) counts the integers in 1..n that are coprime to n, that is the count of i with gcd(i, n) = 1. By convention phi(1) = 1. Given a single integer n, return phi(n).",
        "Example 1:\nInput: n = 36\nOutput: 12\nExplanation: 36 = 2^2 * 3^2, so phi(36) = 36 * (1 - 1/2) * (1 - 1/3) = 12. The twelve values are 1, 5, 7, 11, 13, 17, 19, 23, 25, 29, 31, 35.",
        "Example 2:\nInput: n = 11\nOutput: 10\nExplanation: 11 is prime, so every one of 1..10 is coprime to it.",
        "Constraints:\n- 1 <= n <= 10^12",
      ],
      code: `long long phi(long long n) {
    long long result = n;
    for (long long p = 2; p * p <= n; p++) {
        if (n % p == 0) {
            while (n % p == 0) n /= p;   // strip the whole power, p counted once
            result -= result / p;        // multiply by (1 - 1/p) without fractions
        }
    }
    if (n > 1) result -= result / n;     // the leftover is a prime above sqrt(original n)
    return result;
}`,
      explanation: [
        "phi is multiplicative over coprime parts, and for a prime power phi(p^k) = p^k - p^(k-1). Combining the two gives the product formula phi(n) = n * product over distinct primes p dividing n of (1 - 1/p). Only the set of distinct primes matters, never the exponents.",
        "The loop divides out each prime completely so a prime is applied exactly once. Writing the factor as result -= result / p instead of result * (p - 1) / p keeps every intermediate an exact integer: at the moment of the update result is still divisible by p, because p was one of the factors of n that has not yet been cancelled.",
        "The trap is stopping the loop without handling the remainder. After trial division up to sqrt, whatever is left of n is either 1 or a single prime larger than sqrt of the original value, and forgetting that final case makes phi(2 * 1000003) come out wrong.",
        "Counting with a gcd loop over 1..n is the obvious alternative and is fine up to about 10^7, but it dies well before 10^12; factorisation is what makes the large range reachable.",
        "Time: O(sqrt n). Space: O(1).",
      ],
    },
    {
      name: "Euler Totient Function for all numbers smaller than or equal to n",
      difficulty: "Easy",
      variation: "Sieve of phi over a whole range",
      question: [
        "Given an integer n, compute phi(i) for every i in 1..n and return them as an array. You must not call the O(sqrt i) routine n times; the whole table has to be built in one sieve pass.",
        "Example 1:\nInput: n = 12\nOutput: [1, 1, 2, 2, 4, 2, 6, 4, 6, 4, 10, 4]\nExplanation: The entries are phi(1) through phi(12) in order; for instance phi(12) = 12 * (1/2) * (2/3) = 4, the values 1, 5, 7, 11.",
        "Example 2:\nInput: n = 5\nOutput: [1, 1, 2, 2, 4]",
        "Constraints:\n- 1 <= n <= 10^7",
      ],
      code: `vector<int> totientSieve(int n) {
    vector<int> phi(n + 1);
    for (int i = 0; i <= n; i++) phi[i] = i;   // start each entry at i itself
    for (int p = 2; p <= n; p++) {
        if (phi[p] == p) {                    // untouched, so p has no smaller prime factor
            for (int m = p; m <= n; m += p) phi[m] -= phi[m] / p;
        }
    }
    vector<int> ans(phi.begin() + 1, phi.end());
    return ans;
}`,
      explanation: [
        "The array doubles as a primality marker. Entry i is initialised to i, and the only thing that ever changes phi[m] is a prime factor of m. So when the outer loop reaches p and finds phi[p] still equal to p, no smaller prime has touched it and p must be prime.",
        "For each prime p every multiple m gets the factor (1 - 1/p) applied exactly once, in increasing order of p. By the time the loop finishes, phi[m] has been multiplied by (1 - 1/p) for each distinct prime p dividing m, which is precisely the product formula.",
        "The subtraction phi[m] -= phi[m] / p is again exact rather than fractional. Because primes are processed in increasing order and each is applied once, the current value of phi[m] always still carries the full power of p from m.",
        "The tempting mistake is to apply the factor once per prime power, iterating over p, p^2, p^4 as well. That is wrong: phi(8) is 4, not 8 * (1/2)^3 = 1.",
        "Time: O(n log log n). Space: O(n).",
      ],
    },
    {
      name: "ETF - Euler Totient Function",
      difficulty: "Easy",
      variation: "Many queries answered from a precomputed table",
      link: "https://www.spoj.com/problems/ETF/",
      question: [
        "The first line of input contains the number of test cases T. Each of the following T lines holds one integer n. For every test case print phi(n) on its own line, where phi is Euler's totient function.",
        "Example 1:\nInput:\n5\n1\n2\n3\n4\n5\nOutput:\n1\n1\n2\n2\n4\nExplanation: phi(1) = 1, phi(2) = 1, phi(3) = 2, phi(4) = 2 (the values 1 and 3), phi(5) = 4.",
        "Constraints:\n- 1 <= T <= 20000\n- 1 <= n <= 10^6",
      ],
      code: `const int MX = 1000001;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    vector<int> phi(MX);
    for (int i = 0; i < MX; i++) phi[i] = i;
    for (int p = 2; p < MX; p++) {
        if (phi[p] == p) {
            for (int m = p; m < MX; m += p) phi[m] -= phi[m] / p;
        }
    }
    int t;
    cin >> t;
    while (t--) {
        int n;
        cin >> n;
        cout << phi[n] << "\\n";
    }
    return 0;
}`,
      explanation: [
        "The decision here is purely about which side to pay on. With T up to 2 * 10^4 and n up to 10^6, per-query trial division costs about 2 * 10^4 * 10^3 = 2 * 10^7 divisions, which also passes; but one sieve costs about 10^6 * log log 10^6 operations total and then answers every query in O(1), so it is both faster and simpler to reason about.",
        "Building the table before reading T is deliberate: the sieve cost is independent of the input, so there is nothing to gain from lazy construction and no risk of recomputing.",
        "The one real correctness detail is the range: the table must be sized to the constraint maximum plus one, so index 10^6 exists. An off-by-one here reads out of bounds only on the largest legal input, which is exactly the case a judge will supply.",
        "Time: O(N log log N + T) with N = 10^6. Space: O(N).",
      ],
    },
    {
      name: "Optimized Euler Totient Function for Multiple Evaluations",
      difficulty: "Medium",
      variation: "Smallest-prime-factor table for O(log n) per query",
      question: [
        "You are given a limit N and a list of queries, each a value n with 1 <= n <= N. Answer every query with phi(n). The number of queries may be far smaller than N, so you want a preprocessing step that lets each individual value be factorised quickly rather than a full table of totients.",
        "Example 1:\nInput: N = 1000000, queries = [100, 97, 1]\nOutput: [40, 96, 1]\nExplanation: 100 = 2^2 * 5^2 gives 100 * (1/2) * (4/5) = 40; 97 is prime so phi(97) = 96; phi(1) = 1 by convention.",
        "Example 2:\nInput: N = 100, queries = [36, 12]\nOutput: [12, 4]",
        "Constraints:\n- 1 <= N <= 10^7\n- 1 <= n <= N for every query",
      ],
      code: `const int MX = 10000001;
vector<int> spf(MX);

void buildSpf() {
    for (int i = 1; i < MX; i++) spf[i] = i;
    for (int i = 2; (long long)i * i < MX; i++) {
        if (spf[i] == i) {                       // i is prime
            for (int j = i * i; j < MX; j += i) {
                if (spf[j] == j) spf[j] = i;     // only the first (smallest) prime writes
            }
        }
    }
}

int phi(int n) {
    int result = n;
    while (n > 1) {
        int p = spf[n];                          // smallest prime factor, O(1)
        while (n % p == 0) n /= p;               // remove the whole power
        result -= result / p;
    }
    return result;
}`,
      explanation: [
        "A smallest-prime-factor table turns factorisation into pointer chasing: repeatedly read spf[n] and divide it out. Since every division at least halves n, a value has at most log2(n) prime factors with multiplicity, so a query costs O(log n) instead of O(sqrt n).",
        "The guard if (spf[j] == j) is what makes the entry the smallest prime factor rather than the largest. Primes are visited in increasing order, so the first one to reach j is the smallest, and later primes must not overwrite it.",
        "Starting the inner loop at i * i is safe because any composite j < i * i already has a prime factor below i and was written earlier. It does mean the loop bound needs the (long long) cast, otherwise i * i overflows int near the top of a 10^7 table.",
        "This is the right structure when you need factorisations, not just totients - divisor counts, Mobius values, or the multiset of primes. If all you ever want is phi over a contiguous range, the plain totient sieve is smaller and faster.",
        "Time: O(N log log N) preprocessing, O(log n) per query. Space: O(N).",
      ],
    },
    {
      name: "Simplified Fractions",
      difficulty: "Medium",
      variation: "Coprime counting, Farey sequence",
      link: "https://leetcode.com/problems/simplified-fractions/",
      question: [
        "Given an integer n, return a list of all simplified fractions strictly between 0 and 1 whose denominator is less than or equal to n. A fraction a/b is simplified when gcd(a, b) = 1. The fractions may be returned in any order.",
        "Example 1:\nInput: n = 4\nOutput: ['1/2', '1/3', '1/4', '2/3', '3/4']\nExplanation: There are 5 of them, which is phi(2) + phi(3) + phi(4) = 1 + 2 + 2.",
        "Example 2:\nInput: n = 2\nOutput: ['1/2']",
        "Constraints:\n- 1 <= n <= 100",
      ],
      code: `vector<string> simplifiedFractions(int n) {
    vector<string> ans;
    for (int b = 2; b <= n; b++) {
        for (int a = 1; a < b; a++) {
            if (std::gcd(a, b) == 1) ans.push_back(to_string(a) + "/" + to_string(b));
        }
    }
    return ans;
}`,
      explanation: [
        "Group the answers by denominator. For a fixed b, the valid numerators are exactly the integers in 1..b-1 that are coprime to b, and since gcd(b, b) = b never qualifies for b >= 2, that count is exactly phi(b). So the size of the output is the sum of phi(b) for b = 2..n - this is the length of the Farey sequence F_n minus its two endpoints 0/1 and 1/1.",
        "That identity is why the enumeration cannot produce duplicates: each reduced fraction has a unique reduced denominator, so it is generated under exactly one b. Iterating over all pairs and reducing afterwards would emit 1/2, 2/4, 3/6 as separate strings and then need a de-duplicating set.",
        "With n <= 100 the direct gcd double loop is the right call. The phi view is what you need when the question asks only for the count and n is 10^6 or more: sieve phi once and take a prefix sum, which is O(n log log n) instead of O(n^2 log n).",
        "Time: O(n^2 log n) for the gcd calls. Space: O(n^2) for the output, which dominates.",
      ],
    },
    {
      name: "Exponentiation II",
      difficulty: "Medium",
      variation: "Reducing a tower exponent with Fermat's little theorem",
      link: "https://cses.fi/problemset/task/1712",
      question: [
        "Your task is to calculate a raised to the power b raised to the power c, that is a^(b^c), modulo 10^9 + 7. The first line of input holds the number of test cases n, and each of the next n lines holds three integers a, b and c.",
        "Example 1:\nInput:\n3\n3 7 1\n2 3 2\n2 2 2\nOutput:\n2187\n512\n16\nExplanation: 3^(7^1) = 3^7 = 2187; 2^(3^2) = 2^9 = 512; 2^(2^2) = 2^4 = 16.",
        "Constraints:\n- 1 <= n <= 2 * 10^5\n- 1 <= a, b, c <= 10^9",
      ],
      code: `long long pw(long long b, long long e, long long m) {
    long long r = 1 % m;
    b %= m;
    while (e) {
        if (e & 1) r = r * b % m;
        b = b * b % m;
        e >>= 1;
    }
    return r;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const long long MOD = 1000000007LL;
    int n;
    cin >> n;
    while (n--) {
        long long a, b, c;
        cin >> a >> b >> c;
        long long e = pw(b, c, MOD - 1);   // exponent reduced modulo phi(MOD) = MOD - 1
        cout << pw(a, e, MOD) << "\\n";
    }
    return 0;
}`,
      explanation: [
        "The exponent b^c is astronomically large - up to (10^9)^(10^9) - so it can never be materialised. The fix is Euler's theorem in its Fermat special case: MOD is prime, so phi(MOD) = MOD - 1, and for any a not divisible by MOD we have a^(MOD-1) congruent to 1. Exponents therefore live modulo MOD - 1, not modulo MOD.",
        "So compute the inner power b^c modulo MOD - 1 = 10^9 + 6, then raise a to that reduced exponent modulo MOD. Two calls to binary exponentiation, and note the two moduli are different - reducing the exponent modulo MOD instead of MOD - 1 is the single most common wrong answer here.",
        "The coprimality precondition holds for free: a is at least 1 and at most 10^9, which is strictly below MOD, so a is never a multiple of MOD. If a could be a multiple of the modulus, plain Fermat reduction would be invalid and the generalised form with the extra +phi(m) offset would be needed instead.",
        "When the reduced exponent comes out as 0 while the true exponent is positive, the answer 1 is still correct, because the true exponent is then a multiple of MOD - 1.",
        "Time: O(n log(10^9)) overall. Space: O(1).",
      ],
    },
    {
      name: "Super Pow",
      difficulty: "Medium",
      variation: "Huge exponent modulo a composite - why naive Fermat fails",
      link: "https://leetcode.com/problems/super-pow/",
      question: [
        "Your task is to calculate a^b modulo 1337, where a is a positive integer and b is an extremely large positive integer given as an array of its decimal digits, most significant digit first.",
        "Example 1:\nInput: a = 2, b = [1, 0]\nOutput: 1024\nExplanation: 2^10 = 1024, which is already less than 1337.",
        "Example 2:\nInput: a = 2, b = [3]\nOutput: 8",
        "Constraints:\n- 1 <= a <= 2^31 - 1\n- 1 <= b.length <= 2000\n- 0 <= b[i] <= 9\n- b has no leading zeros",
      ],
      code: `int myPow(int a, int k) {
    int r = 1;
    a %= 1337;
    for (int i = 0; i < k; i++) r = r * a % 1337;   // k <= 10, so a loop is enough
    return r;
}

int superPow(int a, vector<int>& b) {
    int res = 1;
    a %= 1337;
    for (int d : b) {
        // Horner on the exponent: a^(10*prefix + d) = (a^prefix)^10 * a^d
        res = myPow(res, 10) * myPow(a, d) % 1337;
    }
    return res;
}`,
      explanation: [
        "The exponent has up to 2000 digits, so it cannot be reduced to a machine integer. Instead evaluate it by Horner's method in the exponent: if P is the prefix read so far and the next digit is d, the new exponent is 10P + d, and a^(10P + d) = (a^P)^10 * a^d. Each step is two tiny modular powers, so the whole thing is O(len(b)) work with numbers never exceeding 1336 * 1336, which fits in an int.",
        "The tempting shortcut is Euler reduction: 1337 = 7 * 191, so phi(1337) = 6 * 190 = 1140, then reduce the 2000-digit exponent modulo 1140 by digit-wise Horner and finish with one power. That is wrong in general, because Euler's theorem requires gcd(a, 1337) = 1 and a may be a multiple of 7 or 191 - a = 7 with a huge exponent breaks it.",
        "The repair, if you insist on reducing, is the generalised Euler theorem: for an exponent E >= log2(m), a^E is congruent to a^(E mod phi(m) + phi(m)) modulo m, with no coprimality requirement. Since 2000 digits is comfortably above log2(1337), reducing to (E mod 1140) + 1140 and taking one power is correct for every a. The Horner version simply sidesteps the whole question.",
        "This problem is the cleanest illustration of the boundary of Euler's theorem: the theorem is about the multiplicative group of units modulo m, and a non-unit a is not in that group.",
        "Time: O(len(b)). Space: O(1).",
      ],
    },
    {
      name: "Multipliers",
      difficulty: "Hard",
      variation: "Exponent arithmetic modulo phi(p) for a divisor product",
      link: "https://codeforces.com/problemset/problem/615/D",
      question: [
        "Ayrat has a number n given not directly but through its prime factorisation: the first line holds m, the number of prime factors counted with multiplicity, and the second line holds those m primes in arbitrary order, so n is their product. Compute the product of all positive divisors of n, modulo 10^9 + 7.",
        "Example 1:\nInput:\n2\n2 3\nOutput: 36\nExplanation: n = 6, its divisors are 1, 2, 3, 6, and 1 * 2 * 3 * 6 = 36.",
        "Example 2:\nInput:\n3\n2 3 2\nOutput: 1728\nExplanation: n = 12, its divisors are 1, 2, 3, 4, 6, 12, whose product is 1728.",
        "Constraints:\n- 1 <= m <= 2 * 10^5\n- 2 <= each prime <= 2 * 10^5",
      ],
      code: `long long pw(long long b, long long e, long long m) {
    long long r = 1 % m;
    b %= m;
    while (e) {
        if (e & 1) r = r * b % m;
        b = b * b % m;
        e >>= 1;
    }
    return r;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const long long MOD = 1000000007LL, PHI = MOD - 1;
    int m;
    cin >> m;
    map<long long,long long> cnt;
    for (int i = 0; i < m; i++) {
        long long p;
        cin >> p;
        cnt[p]++;
    }
    vector<long long> primes, e;
    for (auto& kv : cnt) {
        primes.push_back(kv.first);
        e.push_back(kv.second);
    }
    int k = primes.size();
    // prefix and suffix products of (e[j] + 1) so we can drop one factor cheaply
    vector<long long> pre(k + 1, 1), suf(k + 1, 1);
    for (int i = 0; i < k; i++) pre[i + 1] = pre[i] * ((e[i] + 1) % PHI) % PHI;
    for (int i = k - 1; i >= 0; i--) suf[i] = suf[i + 1] * ((e[i] + 1) % PHI) % PHI;
    long long ans = 1;
    for (int i = 0; i < k; i++) {
        long long t = e[i] * (e[i] + 1) / 2 % PHI;   // exact integer before reduction
        long long ex = t * (pre[i] * suf[i + 1] % PHI) % PHI;
        ans = ans * pw(primes[i], ex, MOD) % MOD;
    }
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "Write n = product of p_i^(e_i) and let D be the divisor count, the product of (e_i + 1). Pairing each divisor d with n/d shows the product of all divisors is n^(D/2). So the exponent of p_i in the answer is e_i * D / 2, which we regroup as (e_i * (e_i + 1) / 2) * product over j not equal to i of (e_j + 1) - the first factor sums the exponents 0..e_i and the second counts the choices for the other primes.",
        "Those exponents are enormous - D alone can be around 2^(2 * 10^5) - so they must live modulo phi(MOD) = MOD - 1, valid by Fermat because every input prime is at most 2 * 10^5 and hence not a multiple of MOD. This is the whole point of the problem: two different moduli, MOD for the bases and MOD - 1 for the exponents.",
        "The regrouping exists precisely to avoid dividing by 2 modulo MOD - 1. MOD - 1 = 10^9 + 6 is even, so 2 has no inverse there and computing D mod (MOD - 1) then halving is simply wrong. Because e_i * (e_i + 1) / 2 is an exact integer at most about 2 * 10^10, it is computed in 64-bit first and only then reduced.",
        "Dropping the factor (e_i + 1) from the product is done with prefix and suffix products rather than a modular inverse, for the same reason: (e_i + 1) can share a factor with MOD - 1 and be non-invertible.",
        "Time: O(m log m) for the grouping plus O(k log MOD) for the powers. Space: O(k).",
      ],
    },
    {
      name: "GCD Extreme",
      difficulty: "Hard",
      variation: "Sum of pairwise gcd via the divisor identity for phi",
      link: "https://www.spoj.com/problems/GCDEX/",
      question: [
        "Define G(n) as the sum of gcd(i, j) over all pairs with 1 <= i < j <= n. The input consists of several lines, each holding one integer n, and terminates with a line containing 0. For every n print G(n).",
        "Example 1:\nInput:\n10\n0\nOutput:\n67\nExplanation: Summing gcd over all 45 pairs below or equal to 10 gives 67.",
        "Example 2:\nInput:\n4\n5\n0\nOutput:\n7\n11\nExplanation: For n = 4 the pairwise gcds are 1, 1, 1, 1, 2, 1, totalling 7. Adding the pairs that end at 5, each of gcd 1, gives 11.",
        "Constraints:\n- 1 < n < 1000001\n- Up to about 20000 lines of input",
      ],
      code: `const int MX = 1000001;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    vector<int> phi(MX);
    for (int i = 0; i < MX; i++) phi[i] = i;
    for (int p = 2; p < MX; p++) {
        if (phi[p] == p) {
            for (int m = p; m < MX; m += p) phi[m] -= phi[m] / p;
        }
    }
    // g[m] = sum of gcd(i, m) for i = 1..m-1, built as sum over proper divisors d of d * phi(m/d)
    vector<long long> g(MX, 0);
    for (int d = 1; d < MX; d++) {
        for (int m = 2 * d; m < MX; m += d) g[m] += (long long)d * phi[m / d];
    }
    for (int i = 1; i < MX; i++) g[i] += g[i - 1];   // prefix sums give G(n)
    int n;
    while (cin >> n && n) cout << g[n] << "\\n";
    return 0;
}`,
      explanation: [
        "Split the double sum by its larger index: G(n) is the sum over m = 2..n of g(m), where g(m) is the sum of gcd(i, m) for i < m. So one array of g values plus a prefix sum answers every query in O(1).",
        "The key identity is that the sum of gcd(i, m) for i = 1..m equals the sum over divisors d of m of d * phi(m/d). The reason: group the i by their gcd. Exactly phi(m/d) values of i in 1..m satisfy gcd(i, m) = d, because writing i = d * t requires t <= m/d and gcd(t, m/d) = 1. Excluding i = m just drops the d = m term, which is why the inner loop starts at 2 * d.",
        "The build is a divisor sieve run the other way round: instead of finding the divisors of each m, iterate over each d and walk its multiples. That is O(N log N) rather than the O(N sqrt N) a per-value factorisation would cost.",
        "Two traps. The sums exceed 32 bits well before the limit - G(200000) is 143295493160 - so g must be 64-bit. And the answer is a prefix sum, not g(n) itself; returning g(n) alone answers a different question.",
        "Time: O(N log N) preprocessing with N = 10^6, then O(1) per query. Space: O(N).",
      ],
    },
    {
      name: "LCM Sum",
      difficulty: "Hard",
      variation: "Sum of lcm(i, n) via a totient-weighted divisor sum",
      link: "https://www.spoj.com/problems/LCMSUM/",
      question: [
        "Given n, find the sum of lcm(1, n) + lcm(2, n) + ... + lcm(n, n), where lcm(i, n) is the least common multiple of i and n. The first line of input holds the number of test cases T, and each of the next T lines holds one integer n.",
        "Example 1:\nInput:\n3\n1\n2\n5\nOutput:\n1\n4\n55\nExplanation: For n = 5 the terms are 5, 10, 15, 20, 5, which sum to 55.",
        "Example 2:\nInput:\n1\n6\nOutput:\n66\nExplanation: The terms are 6, 6, 6, 12, 30, 6.",
        "Constraints:\n- 1 <= T <= 300000\n- 1 <= n <= 1000000",
      ],
      code: `const int MX = 1000001;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    vector<int> phi(MX);
    for (int i = 0; i < MX; i++) phi[i] = i;
    for (int p = 2; p < MX; p++) {
        if (phi[p] == p) {
            for (int m = p; m < MX; m += p) phi[m] -= phi[m] / p;
        }
    }
    // S[n] = sum over divisors d of n of d * phi(d)
    vector<long long> S(MX, 0);
    for (long long d = 1; d < MX; d++) {
        long long v = d * phi[d];
        for (long long m = d; m < MX; m += d) S[m] += v;
    }
    int t;
    cin >> t;
    while (t--) {
        long long n;
        cin >> n;
        cout << n * (S[n] + 1) / 2 << "\\n";   // always an integer, see explanation
    }
    return 0;
}`,
      explanation: [
        "Since lcm(i, n) = i * n / gcd(i, n), group the terms by g = gcd(i, n). Writing i = g * t with gcd(t, n/g) = 1 and t <= n/g, each such i contributes t * n. Summing the t coprime to and at most n/g gives (n/g) * phi(n/g) / 2 for n/g > 1, because coprime residues pair up as t and n/g - t. Substituting d = n/g and adding the single leftover term for d = 1 yields the closed form: the answer is (n / 2) * (1 + sum over divisors d of n of d * phi(d)).",
        "So precompute S[n] = sum over divisors d of n of d * phi(d) with a divisor sieve - iterate d and push d * phi(d) onto every multiple - then every query is a multiply and a shift.",
        "The division by 2 is exact, which is worth checking rather than assuming. If n is even the factor n supplies it. If n is odd then every divisor d is odd, and for odd d > 1 the value phi(d) is even, so S[n] is 1 plus a sum of even numbers, making S[n] + 1 even.",
        "Overflow is the real hazard: for n near 10^6 the value S[n] reaches roughly 1.6 * 10^12 and the answer approaches 10^18, so both the table and the arithmetic must be 64-bit and the multiplication must happen before the halving in a signed 64-bit type.",
        "Time: O(N log N) preprocessing with N = 10^6, then O(1) per query. Space: O(N).",
      ],
    },
    {
      name: "Power Tower",
      difficulty: "Hard",
      variation: "Generalised Euler theorem down the phi chain",
      link: "https://codeforces.com/problemset/problem/906/D",
      question: [
        "You are given an array w of n positive integers and a modulus m. For each of q queries (l, r) compute the right-associated power tower w[l] ^ (w[l+1] ^ (... ^ w[r])) modulo m. The modulus is an arbitrary integer, not necessarily prime, and the array values are not necessarily coprime to it.",
        "Example 1:\nInput:\n6 1000000000\n1 2 2 3 3 3\n8\n1 1\n1 6\n2 2\n2 3\n2 4\n4 4\n4 5\n4 6\nOutput:\n1\n1\n2\n4\n256\n3\n27\n597484987\nExplanation: Query 2 4 is 2^(2^3) = 2^8 = 256, and query 4 6 is 3^(3^3) = 3^27 = 7625597484987, whose last nine digits are 597484987.",
        "Constraints:\n- 1 <= n <= 100000\n- 1 <= m <= 1000000000\n- 1 <= w[i] <= 1000000000\n- 1 <= q <= 100000\n- 1 <= l <= r <= n",
      ],
      code: `long long phi(long long n) {
    long long res = n;
    for (long long p = 2; p * p <= n; p++) {
        if (n % p == 0) {
            while (n % p == 0) n /= p;
            res -= res / p;
        }
    }
    if (n > 1) res -= res / n;
    return res;
}

vector<long long> ch;   // m, phi(m), phi(phi(m)), ... down to 1
vector<long long> w;

// Values are carried in a saturating encoding: x = v when the true v < m,
// otherwise x = v % m + m, so "x >= m" means "the true value was at least m".
long long mulE(long long x, long long y, long long m) {
    if (x >= m || y >= m) return (x % m) * (y % m) % m + m;
    long long p = x * y;                 // both below m <= 1e9, so no overflow
    return p >= m ? p % m + m : p;
}

long long powE(long long a, long long e, long long m) {
    long long r = 1, b = (a >= m) ? a % m + m : a;
    while (e > 0) {
        if (e & 1) r = mulE(r, b, m);
        e >>= 1;
        if (e) b = mulE(b, b, m);
    }
    return r;
}

long long solve(int i, int r, int d) {
    long long m = ch[d];
    if (m == 1) return 1;                                  // everything is 0 mod 1
    if (i == r) return (w[i] >= m) ? w[i] % m + m : w[i];
    long long e = solve(i + 1, r, d + 1);                  // exponent, already reduced mod phi(m)
    return powE(w[i], e, m);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    long long m;
    cin >> n >> m;
    w.assign(n + 1, 0);
    for (int i = 1; i <= n; i++) cin >> w[i];
    for (long long x = m; ; x = phi(x)) {
        ch.push_back(x);
        if (x == 1) break;
    }
    int q;
    cin >> q;
    while (q--) {
        int l, r;
        cin >> l >> r;
        cout << solve(l, r, 0) % m << "\\n";
    }
    return 0;
}`,
      explanation: [
        "The tool is the generalised Euler theorem: for any a, any m and any exponent E with E >= log2(m), a^E is congruent to a^(E mod phi(m) + phi(m)) modulo m. Unlike plain Euler it needs no coprimality, which matters because w[i] may share factors with m. Applying it recursively means the tower at depth k is evaluated modulo the k-th iterate of phi, so the recursion runs down the chain m, phi(m), phi(phi(m)), ... which reaches 1 in O(log m) steps. That is what bounds the work: only the top O(log m) elements of a query range can ever matter.",
        "The subtle part is that the theorem's two cases need different treatment, and you cannot test E >= log2(m) directly because E is astronomical. The saturating encoding solves it: every recursive call returns either the exact value, when it is below the modulus, or the residue plus the modulus, when it is not. That single number is simultaneously the residue and a flag, and feeding it straight into powE as the exponent implements exactly E when E < phi and (E mod phi) + phi otherwise.",
        "Why that is sound in the awkward middle range: when phi <= E < 2 * phi the encoding produces (E - phi) + phi = E, the true exponent, so no theorem is invoked at all. When E >= 2 * phi(m) then E is comfortably above log2(m) - phi(m) grows like sqrt(m) - so the theorem applies. There is no gap.",
        "Two implementation traps. First, phi must be precomputed once as a chain, not called per level per query; O(sqrt m) trial division times 30 levels times 10^5 queries would be hopeless. Second, mulE must branch before multiplying: once either operand is at or above m the product certainly is too, and multiplying the raw encodings would overflow.",
        "The naive alternative - reduce every exponent modulo phi with plain Euler - fails on inputs like a tower of 2s modulo an even m, where the base is not a unit and the +phi(m) offset is exactly what saves the answer.",
        "Time: O((n + q) log m * log m) in practice, since each query descends at most O(log m) levels and each level costs a binary exponentiation. Space: O(n + log m).",
      ],
    },
  ],
};
