import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Pollard's Rho Algorithm for Prime Factorization",
      difficulty: "Easy",
      variation: "Non-trivial divisor, the template",
      link: "https://www.geeksforgeeks.org/pollards-rho-algorithm-prime-factorization/",
      question: [
        "Given an integer n with 1 < n <= 10^18, return one non-trivial divisor of n, that is a divisor strictly between 1 and n. If n is prime, return n itself. Trial division up to sqrt(n) is far too slow at this size, so use Pollard's rho: iterate the pseudo-random map f(x) = (x*x + c) mod n and take gcd of the distance between a slow and a fast walker with n.",
        "Any valid non-trivial divisor is accepted, not just the smallest one.",
        "Example 1:\nInput: n = 8051\nOutput: 97\nExplanation: 8051 = 83 * 97, so 83 and 97 are both acceptable answers. The rho walk with c = 1 happens to reach 97 first.",
        "Example 2:\nInput: n = 1000000016000000063\nOutput: 1000000007\nExplanation: n = 1000000007 * 1000000009, a product of two primes near 10^9 that trial division would need about 10^9 steps to split.",
        "Constraints:\n- 1 < n <= 10^18\n- The answer must divide n exactly",
      ],
      code: `using u64 = unsigned long long;

u64 mulmod(u64 a, u64 b, u64 m) { return (unsigned __int128)a * b % m; }   // 128-bit product avoids overflow

u64 powmod(u64 a, u64 e, u64 m) {
    u64 r = 1; a %= m;
    while (e) { if (e & 1) r = mulmod(r, a, m); a = mulmod(a, a, m); e >>= 1; }
    return r;
}

bool isPrime(u64 n) {                       // deterministic Miller-Rabin for all 64-bit n
    if (n < 2) return false;
    for (u64 p : {2ULL, 3ULL, 5ULL, 7ULL, 11ULL, 13ULL, 17ULL, 19ULL, 23ULL, 29ULL, 31ULL, 37ULL})
        if (n % p == 0) return n == p;
    u64 d = n - 1; int s = 0;
    while (!(d & 1)) { d >>= 1; s++; }
    for (u64 a : {2ULL, 3ULL, 5ULL, 7ULL, 11ULL, 13ULL, 17ULL, 19ULL, 23ULL, 29ULL, 31ULL, 37ULL}) {
        u64 x = powmod(a, d, n);
        if (x == 1 || x == n - 1) continue;
        bool composite = true;
        for (int i = 1; i < s; i++) { x = mulmod(x, x, n); if (x == n - 1) { composite = false; break; } }
        if (composite) return false;
    }
    return true;
}

u64 gcdu(u64 a, u64 b) { while (b) { u64 t = a % b; a = b; b = t; } return a; }

u64 pollard(u64 n) {                        // n must be odd and composite
    for (u64 c = 1;; c++) {                 // a c that collapses the whole cycle is simply retried
        u64 x = 2, y = 2, d = 1;
        while (d == 1) {
            x = (mulmod(x, x, n) + c) % n;                 // tortoise: one step
            y = (mulmod(y, y, n) + c) % n;
            y = (mulmod(y, y, n) + c) % n;                 // hare: two steps
            d = gcdu(x > y ? x - y : y - x, n);            // gcd of |x - y| with n
        }
        if (d != n) return d;               // d == n means x met y before any factor appeared
    }
}

u64 findFactor(u64 n) {
    if (n % 2 == 0) return 2;
    if (isPrime(n)) return n;
    return pollard(n);
}`,
      explanation: [
        "Let p be an unknown prime divisor of n. The sequence x, f(x), f(f(x)), ... is eventually periodic both modulo n and modulo p. Modulo p it enters its cycle after about sqrt(p) steps by the birthday paradox, which is far sooner than modulo n. Two indices i, j with x_i congruent to x_j modulo p but not modulo n give gcd(|x_i - x_j|, n) equal to a proper divisor of n - that gcd is the factor we return.",
        "Floyd's tortoise and hare finds such a collision without storing any history: run one walker at single speed and one at double speed and test the gcd of their difference each step. Because the map is the same function, if the two walkers ever agree modulo p the gcd fires at that moment.",
        "Two failure modes must be handled explicitly. The gcd can come out as n when the walkers meet modulo n at the same time - then nothing was learned, so restart with a different constant c, which is a different pseudo-random map. And rho cannot split a prime, so Miller-Rabin has to be consulted first; feeding a prime to pollard makes it loop forever bumping c.",
        "The tempting wrong version replaces the collision test with a search for a repeated value modulo n, or fixes c = 1 permanently. Both stall on inputs such as n = 4 or n = 25 where the small cycle degenerates; that is also why the even case is peeled off up front.",
        "Time: O(n^(1/4) log n) expected - about sqrt(p) <= n^(1/4) iterations for the smallest prime factor, each with a gcd. Space: O(1).",
      ],
    },
    {
      name: "Largest Prime Factor of a Number",
      difficulty: "Easy",
      variation: "Largest prime factor of a 64-bit number",
      question: [
        "Given an integer n with 2 <= n <= 10^18, return its largest prime factor. The classic sqrt(n) trial-division loop needs up to 10^9 iterations here, so factor n with Miller-Rabin plus Pollard's rho and take the maximum prime found.",
        "Example 1:\nInput: n = 600851475143\nOutput: 6857\nExplanation: 600851475143 = 71 * 839 * 1471 * 6857, and 6857 is the largest of those primes.",
        "Example 2:\nInput: n = 13195\nOutput: 29\nExplanation: 13195 = 5 * 7 * 13 * 29.",
        "Constraints:\n- 2 <= n <= 10^18\n- If n is prime the answer is n itself",
      ],
      code: `using u64 = unsigned long long;

u64 mulmod(u64 a, u64 b, u64 m) { return (unsigned __int128)a * b % m; }

u64 powmod(u64 a, u64 e, u64 m) {
    u64 r = 1; a %= m;
    while (e) { if (e & 1) r = mulmod(r, a, m); a = mulmod(a, a, m); e >>= 1; }
    return r;
}

bool isPrime(u64 n) {
    if (n < 2) return false;
    for (u64 p : {2ULL, 3ULL, 5ULL, 7ULL, 11ULL, 13ULL, 17ULL, 19ULL, 23ULL, 29ULL, 31ULL, 37ULL})
        if (n % p == 0) return n == p;
    u64 d = n - 1; int s = 0;
    while (!(d & 1)) { d >>= 1; s++; }
    for (u64 a : {2ULL, 3ULL, 5ULL, 7ULL, 11ULL, 13ULL, 17ULL, 19ULL, 23ULL, 29ULL, 31ULL, 37ULL}) {
        u64 x = powmod(a, d, n);
        if (x == 1 || x == n - 1) continue;
        bool composite = true;
        for (int i = 1; i < s; i++) { x = mulmod(x, x, n); if (x == n - 1) { composite = false; break; } }
        if (composite) return false;
    }
    return true;
}

u64 gcdu(u64 a, u64 b) { while (b) { u64 t = a % b; a = b; b = t; } return a; }

u64 pollard(u64 n) {
    for (u64 c = 1;; c++) {
        u64 x = 2, y = 2, d = 1;
        while (d == 1) {
            x = (mulmod(x, x, n) + c) % n;
            y = (mulmod(y, y, n) + c) % n;
            y = (mulmod(y, y, n) + c) % n;
            d = gcdu(x > y ? x - y : y - x, n);
        }
        if (d != n) return d;
    }
}

u64 best;

void factor(u64 n) {                        // splits n and records every prime it reaches
    if (n == 1) return;
    if (isPrime(n)) { best = max(best, n); return; }
    u64 d = (n % 2 == 0) ? 2 : pollard(n);
    factor(d);
    factor(n / d);
}

u64 largestPrimeFactor(u64 n) {
    best = 0;
    factor(n);
    return best;
}`,
      explanation: [
        "Full factorization is a recursion on top of the single-factor primitive: test the current number for primality, and if it is composite split it with rho and recurse into both halves. The recursion tree has one leaf per prime factor with multiplicity, so at most 60 leaves for a 64-bit number.",
        "The divisor rho returns is not necessarily prime and not necessarily the smallest - it is just some proper divisor. That is exactly why each half is re-tested rather than reported: the primality check is what turns an arbitrary split into a prime factorization.",
        "The tempting shortcut of returning the last factor found, or of assuming rho hands back primes in increasing order, is wrong. The output order is essentially arbitrary, so the maximum has to be taken over all leaves (or the list sorted afterwards).",
        "The hardest inputs are semiprimes with two balanced factors near 10^9, such as 1000000007 * 1000000009: there rho does its full n^(1/4) work, roughly 30000 iterations, while trial division would need 10^9.",
        "Time: O(n^(1/4) log n) expected. Space: O(log n) for the recursion depth.",
      ],
    },
    {
      name: "Integer Factorization (15 digits)",
      difficulty: "Medium",
      variation: "Full factorization with multiplicity",
      link: "https://www.spoj.com/problems/FACT0/",
      question: [
        "The first line contains the number of test cases t. Each of the next t lines contains one integer n with 1 < n < 10^15. For each n print its prime factors in non-decreasing order, separated by spaces, repeating a prime as many times as it divides n.",
        "Example 1:\nInput:\n3\n10403\n123456789012\n999982937001071\nOutput:\n101 103\n2 2 3 10288065751\n999983 999999937\nExplanation: 10403 = 101 * 103. 123456789012 = 2^2 * 3 * 10288065751, and 10288065751 is prime. The third value is a product of two large primes that sqrt-trial-division would need about 3 * 10^7 steps to split.",
        "Constraints:\n- 1 <= t <= 10\n- 1 < n < 10^15 (the code below is correct up to 10^18)",
      ],
      code: `using u64 = unsigned long long;

u64 mulmod(u64 a, u64 b, u64 m) { return (unsigned __int128)a * b % m; }

u64 powmod(u64 a, u64 e, u64 m) {
    u64 r = 1; a %= m;
    while (e) { if (e & 1) r = mulmod(r, a, m); a = mulmod(a, a, m); e >>= 1; }
    return r;
}

bool isPrime(u64 n) {
    if (n < 2) return false;
    for (u64 p : {2ULL, 3ULL, 5ULL, 7ULL, 11ULL, 13ULL, 17ULL, 19ULL, 23ULL, 29ULL, 31ULL, 37ULL})
        if (n % p == 0) return n == p;
    u64 d = n - 1; int s = 0;
    while (!(d & 1)) { d >>= 1; s++; }
    for (u64 a : {2ULL, 3ULL, 5ULL, 7ULL, 11ULL, 13ULL, 17ULL, 19ULL, 23ULL, 29ULL, 31ULL, 37ULL}) {
        u64 x = powmod(a, d, n);
        if (x == 1 || x == n - 1) continue;
        bool composite = true;
        for (int i = 1; i < s; i++) { x = mulmod(x, x, n); if (x == n - 1) { composite = false; break; } }
        if (composite) return false;
    }
    return true;
}

u64 gcdu(u64 a, u64 b) { while (b) { u64 t = a % b; a = b; b = t; } return a; }

u64 pollard(u64 n) {
    for (u64 c = 1;; c++) {
        u64 x = 2, y = 2, d = 1;
        while (d == 1) {
            x = (mulmod(x, x, n) + c) % n;
            y = (mulmod(y, y, n) + c) % n;
            y = (mulmod(y, y, n) + c) % n;
            d = gcdu(x > y ? x - y : y - x, n);
        }
        if (d != n) return d;
    }
}

void factor(u64 n, vector<u64>& out) {
    if (n == 1) return;
    if (isPrime(n)) { out.push_back(n); return; }
    u64 d = (n % 2 == 0) ? 2 : pollard(n);
    factor(d, out);
    factor(n / d, out);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t;
    cin >> t;
    while (t--) {
        u64 n;
        cin >> n;
        vector<u64> f;
        factor(n, f);
        sort(f.begin(), f.end());                 // rho returns factors in arbitrary order
        for (size_t i = 0; i < f.size(); i++) cout << f[i] << " \\n"[i + 1 == f.size()];
    }
    return 0;
}`,
      explanation: [
        "This is the reference shape of a factorization routine: peel off small primes or let Miller-Rabin certify the current value, otherwise split with rho and recurse. Multiplicity comes out for free because both halves of a split are factored independently, so a prime dividing n twice is discovered twice.",
        "A practical speed-up on multi-test input is to trial-divide by primes below a few hundred first. It costs almost nothing and removes the small factors that make rho's cycle degenerate, leaving rho to do only what it is good at: splitting large balanced composites.",
        "The trap is arithmetic, not algorithmic. Computing x*x mod n with 64-bit multiplication overflows for n above about 3 * 10^9, and the bug is silent: the walk still runs and still terminates, it just reports a divisor that does not divide n. Either use __int128 as here or Montgomery multiplication.",
        "Sorting the collected primes matters for the judge: the recursion emits, for example, 10288065751 before 2 depending on where the first split lands.",
        "Time: O(t * n^(1/4) log n) expected. Space: O(log n).",
      ],
    },
    {
      name: "Factorize",
      difficulty: "Medium",
      variation: "Batch queries, sorted prime list",
      link: "https://judge.yosupo.jp/problem/factorize",
      question: [
        "The first line contains the number of queries Q. Each of the next Q lines contains one integer a with 1 <= a <= 10^18. For each query print the number of prime factors of a counted with multiplicity, followed by those primes in increasing order, all on one line. For a = 1 print just 0.",
        "Example 1:\nInput:\n3\n1\n12\n1000000016000000063\nOutput:\n0\n3 2 2 3\n2 1000000007 1000000009\nExplanation: 12 = 2 * 2 * 3 has three prime factors with multiplicity. The third value splits into two primes near 10^9.",
        "Example 2:\nInput:\n2\n2023\n999999999999999989\nOutput:\n3 7 17 17\n1 999999999999999989\nExplanation: 2023 = 7 * 17^2. The second value is prime, so it is its own only factor.",
        "Constraints:\n- 1 <= Q <= 100\n- 1 <= a <= 10^18",
      ],
      code: `using u64 = unsigned long long;

u64 mulmod(u64 a, u64 b, u64 m) { return (unsigned __int128)a * b % m; }

u64 powmod(u64 a, u64 e, u64 m) {
    u64 r = 1; a %= m;
    while (e) { if (e & 1) r = mulmod(r, a, m); a = mulmod(a, a, m); e >>= 1; }
    return r;
}

bool isPrime(u64 n) {
    if (n < 2) return false;
    for (u64 p : {2ULL, 3ULL, 5ULL, 7ULL, 11ULL, 13ULL, 17ULL, 19ULL, 23ULL, 29ULL, 31ULL, 37ULL})
        if (n % p == 0) return n == p;
    u64 d = n - 1; int s = 0;
    while (!(d & 1)) { d >>= 1; s++; }
    for (u64 a : {2ULL, 3ULL, 5ULL, 7ULL, 11ULL, 13ULL, 17ULL, 19ULL, 23ULL, 29ULL, 31ULL, 37ULL}) {
        u64 x = powmod(a, d, n);
        if (x == 1 || x == n - 1) continue;
        bool composite = true;
        for (int i = 1; i < s; i++) { x = mulmod(x, x, n); if (x == n - 1) { composite = false; break; } }
        if (composite) return false;
    }
    return true;
}

u64 gcdu(u64 a, u64 b) { while (b) { u64 t = a % b; a = b; b = t; } return a; }

u64 pollard(u64 n) {
    for (u64 c = 1;; c++) {
        u64 x = 2, y = 2, d = 1;
        while (d == 1) {
            x = (mulmod(x, x, n) + c) % n;
            y = (mulmod(y, y, n) + c) % n;
            y = (mulmod(y, y, n) + c) % n;
            d = gcdu(x > y ? x - y : y - x, n);
        }
        if (d != n) return d;
    }
}

void factor(u64 n, vector<u64>& out) {
    if (n == 1) return;
    if (isPrime(n)) { out.push_back(n); return; }
    u64 d = (n % 2 == 0) ? 2 : pollard(n);
    factor(d, out);
    factor(n / d, out);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int q;
    cin >> q;
    while (q--) {
        u64 a;
        cin >> a;
        vector<u64> f;
        for (u64 p = 2; p < 100; p++)                 // cheap peel of tiny primes
            while (a % p == 0) { f.push_back(p); a /= p; }
        factor(a, f);
        sort(f.begin(), f.end());
        cout << f.size();
        for (u64 p : f) cout << " " << p;
        cout << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Same engine as full factorization, but the answer format forces two details: the count is with multiplicity (so the list length, not the number of distinct primes) and the primes must be sorted, which the recursion does not guarantee.",
        "a = 1 is the edge case worth checking by hand. After the small-prime peel a is still 1, factor returns immediately, and the line is just 0 - a routine that assumes at least one factor prints garbage here.",
        "Peeling primes below 100 before calling rho is not cosmetic. Rho behaves poorly on numbers with tiny factors and on perfect powers of small primes, and the peel also guarantees the value handed to pollard is odd, which the tortoise-hare loop assumes.",
        "With Q up to 100 and each value up to 10^18, the worst case is 100 balanced semiprimes; Floyd-based rho handles that comfortably, and Brent's variant with batched gcds is the usual constant-factor upgrade if the judge is tight.",
        "Time: O(Q * a^(1/4) log a) expected. Space: O(log a) per query.",
      ],
    },
    {
      name: "Happy New Year 2023",
      difficulty: "Medium",
      variation: "Recovering p and q from N = p^2 * q",
      link: "https://atcoder.jp/contests/abc284/tasks/abc284_d",
      question: [
        "You are given T test cases. Each test case gives an integer N that is guaranteed to be of the form N = p^2 * q where p and q are distinct primes. For each N print p and q separated by a space.",
        "Example 1:\nInput:\n2\n2023\n63\nOutput:\n17 7\n3 7\nExplanation: 2023 = 17^2 * 7, so p = 17 and q = 7. 63 = 3^2 * 7, so p = 3 and q = 7.",
        "Constraints:\n- 1 <= T <= 10\n- 1 <= N <= 9 * 10^18\n- N = p^2 * q with p and q distinct primes",
      ],
      code: `using u64 = unsigned long long;

u64 mulmod(u64 a, u64 b, u64 m) { return (unsigned __int128)a * b % m; }

u64 powmod(u64 a, u64 e, u64 m) {
    u64 r = 1; a %= m;
    while (e) { if (e & 1) r = mulmod(r, a, m); a = mulmod(a, a, m); e >>= 1; }
    return r;
}

bool isPrime(u64 n) {
    if (n < 2) return false;
    for (u64 p : {2ULL, 3ULL, 5ULL, 7ULL, 11ULL, 13ULL, 17ULL, 19ULL, 23ULL, 29ULL, 31ULL, 37ULL})
        if (n % p == 0) return n == p;
    u64 d = n - 1; int s = 0;
    while (!(d & 1)) { d >>= 1; s++; }
    for (u64 a : {2ULL, 3ULL, 5ULL, 7ULL, 11ULL, 13ULL, 17ULL, 19ULL, 23ULL, 29ULL, 31ULL, 37ULL}) {
        u64 x = powmod(a, d, n);
        if (x == 1 || x == n - 1) continue;
        bool composite = true;
        for (int i = 1; i < s; i++) { x = mulmod(x, x, n); if (x == n - 1) { composite = false; break; } }
        if (composite) return false;
    }
    return true;
}

u64 gcdu(u64 a, u64 b) { while (b) { u64 t = a % b; a = b; b = t; } return a; }

u64 pollard(u64 n) {
    for (u64 c = 1;; c++) {
        u64 x = 2, y = 2, d = 1;
        while (d == 1) {
            x = (mulmod(x, x, n) + c) % n;
            y = (mulmod(y, y, n) + c) % n;
            y = (mulmod(y, y, n) + c) % n;
            d = gcdu(x > y ? x - y : y - x, n);
        }
        if (d != n) return d;
    }
}

void factor(u64 n, vector<u64>& out) {
    if (n == 1) return;
    if (isPrime(n)) { out.push_back(n); return; }
    u64 d = (n % 2 == 0) ? 2 : pollard(n);
    factor(d, out);
    factor(n / d, out);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t;
    cin >> t;
    while (t--) {
        u64 n;
        cin >> n;
        vector<u64> f;
        factor(n, f);
        sort(f.begin(), f.end());
        u64 p = 0, q = 0;
        for (size_t i = 0; i < f.size(); ) {
            size_t j = i;
            while (j < f.size() && f[j] == f[i]) j++;      // run of equal primes = exponent
            if (j - i == 2) p = f[i]; else q = f[i];
            i = j;
        }
        cout << p << " " << q << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Because N = p^2 * q, one of the two primes has exponent 2 and the other exponent 1, so a full factorization plus an exponent count answers the query. The list from rho must be grouped into runs of equal primes; picking the duplicated value by comparing neighbours pairwise is a classic off-by-one source when the exponent-1 prime is the last element.",
        "The size is what forces Pollard here: N up to 9 * 10^18 means p can be near 2 * 10^9 and q near 2 * 10^9 as well, so sqrt(N) trial division is 3 * 10^9 steps. Rho needs about sqrt(min(p, q)) iterations, roughly 45000.",
        "There is a non-rho route worth knowing: p is at most N^(1/3) only when q > p, which is not guaranteed, so the safe closed-form trick is to test the rounded cube root and the rounded square root of N as candidate p. It works but needs careful integer-root correction, whereas rho needs no case analysis.",
        "Note N can exceed 4 * 10^18, so signed 64-bit input is not safe; read into an unsigned 64-bit type and keep every product inside __int128.",
        "Time: O(T * N^(1/4) log N) expected. Space: O(log N).",
      ],
    },
    {
      name: "Trailing Loves (or L'oeufs?)",
      difficulty: "Medium",
      variation: "Legendre exponent after factorising the base",
      link: "https://codeforces.com/problemset/problem/1114/C",
      question: [
        "Given n and b, determine the number of trailing zero digits in the representation of n! (n factorial) in base b.",
        "The number of trailing zeros of a value V in base b is the largest k such that b^k divides V, so you need the largest k with b^k dividing n!.",
        "Example 1:\nInput: n = 6, b = 9\nOutput: 1\nExplanation: 6! = 720, and in base 9 that is 880, which ends in a single zero. Checking it the other way: 9 = 3^2, the exponent of 3 in 6! is 6/3 + 6/9 = 2, so 3^2 divides 6! but 3^4 does not, giving k = 1.",
        "Example 2:\nInput: n = 38, b = 11\nOutput: 3\nExplanation: 11 is prime and the exponent of 11 in 38! is 38/11 = 3.",
        "Constraints:\n- 1 <= n <= 10^18\n- 2 <= b <= 10^12",
      ],
      code: `using u64 = unsigned long long;

u64 mulmod(u64 a, u64 b, u64 m) { return (unsigned __int128)a * b % m; }

u64 powmod(u64 a, u64 e, u64 m) {
    u64 r = 1; a %= m;
    while (e) { if (e & 1) r = mulmod(r, a, m); a = mulmod(a, a, m); e >>= 1; }
    return r;
}

bool isPrime(u64 n) {
    if (n < 2) return false;
    for (u64 p : {2ULL, 3ULL, 5ULL, 7ULL, 11ULL, 13ULL, 17ULL, 19ULL, 23ULL, 29ULL, 31ULL, 37ULL})
        if (n % p == 0) return n == p;
    u64 d = n - 1; int s = 0;
    while (!(d & 1)) { d >>= 1; s++; }
    for (u64 a : {2ULL, 3ULL, 5ULL, 7ULL, 11ULL, 13ULL, 17ULL, 19ULL, 23ULL, 29ULL, 31ULL, 37ULL}) {
        u64 x = powmod(a, d, n);
        if (x == 1 || x == n - 1) continue;
        bool composite = true;
        for (int i = 1; i < s; i++) { x = mulmod(x, x, n); if (x == n - 1) { composite = false; break; } }
        if (composite) return false;
    }
    return true;
}

u64 gcdu(u64 a, u64 b) { while (b) { u64 t = a % b; a = b; b = t; } return a; }

u64 pollard(u64 n) {
    for (u64 c = 1;; c++) {
        u64 x = 2, y = 2, d = 1;
        while (d == 1) {
            x = (mulmod(x, x, n) + c) % n;
            y = (mulmod(y, y, n) + c) % n;
            y = (mulmod(y, y, n) + c) % n;
            d = gcdu(x > y ? x - y : y - x, n);
        }
        if (d != n) return d;
    }
}

void factor(u64 n, vector<u64>& out) {
    if (n == 1) return;
    if (isPrime(n)) { out.push_back(n); return; }
    u64 d = (n % 2 == 0) ? 2 : pollard(n);
    factor(d, out);
    factor(n / d, out);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    u64 n, b;
    cin >> n >> b;
    vector<u64> f;
    factor(b, f);
    sort(f.begin(), f.end());
    u64 ans = ULLONG_MAX;
    for (size_t i = 0; i < f.size(); ) {
        size_t j = i;
        while (j < f.size() && f[j] == f[i]) j++;
        u64 p = f[i], e = j - i, cnt = 0;
        for (u64 pk = p; pk <= n; ) {            // Legendre: exponent of p in n!
            cnt += n / pk;
            if (pk > n / p) break;               // stop before pk * p overflows
            pk *= p;
        }
        ans = min(ans, cnt / e);                 // p^(e*k) needed, so divide by the exponent in b
        i = j;
    }
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "Write b as a product of prime powers p^e. Then b^k divides n! exactly when p^(e*k) divides n! for every such p, so k is bounded by floor(v_p(n!) / e) for each prime and the answer is the minimum of those bounds - the scarcest prime is the bottleneck.",
        "Legendre's formula gives v_p(n!) as the sum of floor(n / p^i) over i >= 1: among 1..n there are floor(n/p) multiples of p, an extra factor for each of the floor(n/p^2) multiples of p^2, and so on.",
        "Two traps. First, the exponent e in b is easy to forget: for b = 9 the answer is v_3(n!) / 2, not v_3(n!). Second, the pk *= p loop overflows silently once pk passes 10^18, which is why the guard compares pk against n / p before multiplying rather than after.",
        "With b up to 10^12 a sqrt(b) = 10^6 trial division would actually pass here, but rho is the version that keeps working when the base is 10^18, and it is the same code either way.",
        "Time: O(b^(1/4) log b + log^2 n). Space: O(log b).",
      ],
    },
    {
      name: "Factorial and Multiple",
      difficulty: "Medium",
      variation: "Smallest N with K dividing N factorial",
      link: "https://atcoder.jp/contests/abc280/tasks/abc280_d",
      question: [
        "Given a positive integer K, find the smallest positive integer N such that N! (N factorial) is a multiple of K.",
        "Example 1:\nInput: K = 30\nOutput: 5\nExplanation: 30 = 2 * 3 * 5. 4! = 24 is not a multiple of 30, but 5! = 120 is. The binding prime is 5, which first appears in 5!.",
        "Example 2:\nInput: K = 25\nOutput: 10\nExplanation: 25 = 5^2 and N! contains two factors of 5 only from N = 10 onward, since 5! through 9! contain exactly one.",
        "Constraints:\n- 2 <= K <= 10^12",
      ],
      code: `using u64 = unsigned long long;

u64 mulmod(u64 a, u64 b, u64 m) { return (unsigned __int128)a * b % m; }

u64 powmod(u64 a, u64 e, u64 m) {
    u64 r = 1; a %= m;
    while (e) { if (e & 1) r = mulmod(r, a, m); a = mulmod(a, a, m); e >>= 1; }
    return r;
}

bool isPrime(u64 n) {
    if (n < 2) return false;
    for (u64 p : {2ULL, 3ULL, 5ULL, 7ULL, 11ULL, 13ULL, 17ULL, 19ULL, 23ULL, 29ULL, 31ULL, 37ULL})
        if (n % p == 0) return n == p;
    u64 d = n - 1; int s = 0;
    while (!(d & 1)) { d >>= 1; s++; }
    for (u64 a : {2ULL, 3ULL, 5ULL, 7ULL, 11ULL, 13ULL, 17ULL, 19ULL, 23ULL, 29ULL, 31ULL, 37ULL}) {
        u64 x = powmod(a, d, n);
        if (x == 1 || x == n - 1) continue;
        bool composite = true;
        for (int i = 1; i < s; i++) { x = mulmod(x, x, n); if (x == n - 1) { composite = false; break; } }
        if (composite) return false;
    }
    return true;
}

u64 gcdu(u64 a, u64 b) { while (b) { u64 t = a % b; a = b; b = t; } return a; }

u64 pollard(u64 n) {
    for (u64 c = 1;; c++) {
        u64 x = 2, y = 2, d = 1;
        while (d == 1) {
            x = (mulmod(x, x, n) + c) % n;
            y = (mulmod(y, y, n) + c) % n;
            y = (mulmod(y, y, n) + c) % n;
            d = gcdu(x > y ? x - y : y - x, n);
        }
        if (d != n) return d;
    }
}

void factor(u64 n, vector<u64>& out) {
    if (n == 1) return;
    if (isPrime(n)) { out.push_back(n); return; }
    u64 d = (n % 2 == 0) ? 2 : pollard(n);
    factor(d, out);
    factor(n / d, out);
}

u64 legendre(u64 n, u64 p) {                 // exponent of p in n!
    u64 c = 0;
    for (u64 pk = p; pk <= n; ) {
        c += n / pk;
        if (pk > n / p) break;
        pk *= p;
    }
    return c;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    u64 k;
    cin >> k;
    vector<u64> f;
    factor(k, f);
    sort(f.begin(), f.end());
    u64 ans = 1;
    for (size_t i = 0; i < f.size(); ) {
        size_t j = i;
        while (j < f.size() && f[j] == f[i]) j++;
        u64 p = f[i], e = j - i;
        u64 lo = p, hi = p * e;                  // p*e! surely holds p^e, so the answer is in [p, p*e]
        while (lo < hi) {
            u64 mid = lo + (hi - lo) / 2;
            if (legendre(mid, p) >= e) hi = mid; else lo = mid + 1;
        }
        ans = max(ans, lo);
        i = j;
    }
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "K divides N! exactly when v_p(N!) >= e for every prime power p^e in K. Each prime gives an independent requirement, and since v_p(N!) is non-decreasing in N, each requirement is satisfied on a suffix of N values. The answer is therefore the maximum over primes of the smallest N meeting that prime's requirement.",
        "Monotonicity is what makes the per-prime search a binary search. The range [p, p*e] is safe: the multiples p, 2p, ..., e*p already contribute e factors of p, and no N below p contributes any.",
        "The tempting greedy of walking N upward one step at a time and dividing K by gcd(N, K) also works and is in fact the intended simple solution, but it is O(answer) and the answer can be K itself when K is a prime near 10^12 - roughly 10^12 iterations. The factor-then-binary-search version is O(polylog) after factorization.",
        "K a large prime is also the case that decides the factorization method: Miller-Rabin recognises it immediately, so no rho work happens at all, while trial division would still grind through 10^6 divisors.",
        "Time: O(K^(1/4) log K + omega(K) log^2 K), where omega(K) is the number of distinct primes. Space: O(log K).",
      ],
    },
    {
      name: "Largest Component Size by Common Factor",
      difficulty: "Hard",
      variation: "Factorization driving a union-find",
      link: "https://leetcode.com/problems/largest-component-size-by-common-factor/",
      question: [
        "You are given an integer array nums of distinct positive integers. Consider a graph with one node per value in nums, where two nodes a and b are connected if and only if gcd(a, b) > 1. Return the size of the largest connected component of that graph.",
        "Example 1:\nInput: nums = [4,6,15,35]\nOutput: 4\nExplanation: 4 and 6 share the factor 2, 6 and 15 share 3, 15 and 35 share 5, so all four values form one component.",
        "Example 2:\nInput: nums = [20,50,9,63]\nOutput: 2\nExplanation: 20 and 50 share 2 and 5; 9 and 63 share 3. The two components each have size 2 and nothing links them.",
        "Constraints:\n- 1 <= nums.length <= 2 * 10^4\n- 1 <= nums[i] <= 10^5\n- All values in nums are distinct",
      ],
      code: `class DSU {
    vector<int> par, sz;
public:
    DSU(int n) : par(n), sz(n, 1) { iota(par.begin(), par.end(), 0); }
    int find(int x) { return par[x] == x ? x : par[x] = find(par[x]); }
    void unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return;
        if (sz[a] < sz[b]) swap(a, b);
        par[b] = a; sz[a] += sz[b];             // union by size
    }
};

class Solution {
public:
    int largestComponentSize(vector<int>& nums) {
        int n = nums.size();
        int mx = *max_element(nums.begin(), nums.end());
        vector<int> spf(mx + 1, 0);
        for (int i = 2; i <= mx; i++)                     // smallest prime factor sieve
            if (!spf[i])
                for (int j = i; j <= mx; j += i)
                    if (!spf[j]) spf[j] = i;

        DSU dsu(n);
        unordered_map<int,int> owner;                     // prime -> index of some node holding it
        for (int i = 0; i < n; i++) {
            int v = nums[i];
            while (v > 1) {
                int p = spf[v];
                while (v % p == 0) v /= p;                // strip the whole prime power
                auto it = owner.find(p);
                if (it == owner.end()) owner[p] = i;
                else dsu.unite(it->second, i);            // same prime => gcd > 1 => same component
            }
        }
        unordered_map<int,int> cnt;
        int ans = 0;
        for (int i = 0; i < n; i++) ans = max(ans, ++cnt[dsu.find(i)]);
        return ans;
    }
};`,
      explanation: [
        "Building the graph explicitly is O(n^2) gcds, 4 * 10^8 here, and it is also the wrong model: connectivity is not about pairs but about shared primes. Add each prime as a hub - every value containing prime p is unioned with the first value that contained p - and two values end up in the same component exactly when a chain of shared primes links them.",
        "That is why a value with several primes glues them together: 6 merges the 2-group and the 3-group, which is how 4 and 15 land in one component in the first example without sharing any prime directly.",
        "Each value has at most 6 distinct primes below 10^5, so the number of union operations is linear in n, and the sieve of smallest prime factors makes each factorization O(log v).",
        "The Pollard connection: the sieve only works because values are bounded by 10^5. Raise the bound to 10^18 - the same problem with 64-bit values - and the sieve is impossible; you swap in Miller-Rabin plus rho per element and every other line of this solution stays identical. Recognising that the factorization step is pluggable is the point.",
        "Time: O(mx log log mx + n log mx) with the sieve, or O(n * v^(1/4) log v) with rho on 64-bit values. Space: O(mx + n).",
      ],
    },
    {
      name: "Divisor Paths",
      difficulty: "Hard",
      variation: "Divisor-lattice shortest paths",
      link: "https://codeforces.com/problemset/problem/1334/E",
      question: [
        "Let D be a positive integer. Build a graph whose vertices are all divisors of D. Two distinct divisors x and y are joined by an edge whenever one divides the other, and the weight of that edge is the absolute difference of their divisor counts, that is |d(x) - d(y)| where d(m) is the number of divisors of m. Answer q queries: given divisors u and v of D, print the length of the shortest path between them.",
        "Example 1:\nInput:\n12 3\n4 4\n12 3\n3 4\nOutput:\n0\n4\n3\nExplanation: d(1) = 1, d(3) = 2, d(4) = 3, d(12) = 6. For u = v = 4 the answer is 0. For (12, 3): gcd is 3, cost d(12) + d(3) - 2*d(3) = 6 + 2 - 4 = 4. For (3, 4): gcd is 1, cost 2 + 3 - 2*1 = 3.",
        "Example 2:\nInput:\n36 2\n36 4\n9 4\nOutput:\n6\n5\nExplanation: d(36) = 9, d(4) = 3, d(9) = 3, d(1) = 1. For (36, 4) the gcd is 4, giving 9 + 3 - 2*3 = 6. For (9, 4) the gcd is 1, giving 3 + 3 - 2 = 5.",
        "Constraints:\n- 1 <= D <= 10^15\n- 1 <= q <= 3 * 10^5\n- u and v are divisors of D",
      ],
      code: `using u64 = unsigned long long;

u64 mulmod(u64 a, u64 b, u64 m) { return (unsigned __int128)a * b % m; }

u64 powmod(u64 a, u64 e, u64 m) {
    u64 r = 1; a %= m;
    while (e) { if (e & 1) r = mulmod(r, a, m); a = mulmod(a, a, m); e >>= 1; }
    return r;
}

bool isPrime(u64 n) {
    if (n < 2) return false;
    for (u64 p : {2ULL, 3ULL, 5ULL, 7ULL, 11ULL, 13ULL, 17ULL, 19ULL, 23ULL, 29ULL, 31ULL, 37ULL})
        if (n % p == 0) return n == p;
    u64 d = n - 1; int s = 0;
    while (!(d & 1)) { d >>= 1; s++; }
    for (u64 a : {2ULL, 3ULL, 5ULL, 7ULL, 11ULL, 13ULL, 17ULL, 19ULL, 23ULL, 29ULL, 31ULL, 37ULL}) {
        u64 x = powmod(a, d, n);
        if (x == 1 || x == n - 1) continue;
        bool composite = true;
        for (int i = 1; i < s; i++) { x = mulmod(x, x, n); if (x == n - 1) { composite = false; break; } }
        if (composite) return false;
    }
    return true;
}

u64 gcdu(u64 a, u64 b) { while (b) { u64 t = a % b; a = b; b = t; } return a; }

u64 pollard(u64 n) {
    for (u64 c = 1;; c++) {
        u64 x = 2, y = 2, d = 1;
        while (d == 1) {
            x = (mulmod(x, x, n) + c) % n;
            y = (mulmod(y, y, n) + c) % n;
            y = (mulmod(y, y, n) + c) % n;
            d = gcdu(x > y ? x - y : y - x, n);
        }
        if (d != n) return d;
    }
}

void factor(u64 n, vector<u64>& out) {
    if (n == 1) return;
    if (isPrime(n)) { out.push_back(n); return; }
    u64 d = (n % 2 == 0) ? 2 : pollard(n);
    factor(d, out);
    factor(n / d, out);
}

vector<u64> primes;

long long divisorCount(u64 x) {              // only primes of D can divide a divisor of D
    long long res = 1;
    for (u64 p : primes) {
        long long e = 0;
        while (x % p == 0) { x /= p; e++; }
        res *= (e + 1);
    }
    return res;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    u64 D;
    int q;
    cin >> D >> q;
    vector<u64> f;
    factor(D, f);
    sort(f.begin(), f.end());
    f.erase(unique(f.begin(), f.end()), f.end());
    primes = f;
    while (q--) {
        u64 u, v;
        cin >> u >> v;
        u64 g = gcdu(u, v);
        cout << divisorCount(u) + divisorCount(v) - 2 * divisorCount(g) << "\\n";
        // at most 13 distinct primes for D <= 10^15, so each query is a handful of divisions
    }
    return 0;
}`,
      explanation: [
        "Any single downward move from x to a divisor y costs d(x) - d(y), so the cost of a path that only ever moves downward telescopes to d(start) - d(end) - every monotone route between the same pair of nested divisors costs the same, and the number of hops is irrelevant.",
        "A path from u to v must therefore turn around somewhere: go down to a common divisor and back up. Descending to any common divisor c costs d(u) + d(v) - 2*d(c), which is minimised by making d(c) as large as possible, and gcd(u, v) is the common divisor with the most divisors since every other common divisor divides it. Turning around upward through a common multiple costs 2*d(m) - d(u) - d(v) with d(m) >= max(d(u), d(v)) and is never better.",
        "So the whole problem collapses to d(u) + d(v) - 2*d(gcd(u, v)) - no Dijkstra, which is fortunate because D <= 10^15 can have thousands of divisors and 3 * 10^5 queries.",
        "The only heavy step is factoring D once: 10^15 makes sqrt-trial-division 3 * 10^7 operations, borderline, and rho makes it instant. After that d(x) for a divisor x is computed by dividing out only the primes of D, at most 13 of them.",
        "The trap is treating the edge weight as 1 per prime step and computing something like the sum of exponent differences. That is a different, cheaper metric and fails on the divisor-count weights; the u = v case returning 0 is also worth an explicit sanity check.",
        "Time: O(D^(1/4) log D + q * omega(D) * log D). Space: O(omega(D)).",
      ],
    },
    {
      name: "Kuroni and the Punishment",
      difficulty: "Hard",
      variation: "Randomized candidate primes from sampled elements",
      link: "https://codeforces.com/problemset/problem/1305/F",
      question: [
        "You are given an array a of n positive integers. In one operation you may pick an index and increase or decrease that element by 1, but no element may drop below 1. Find the minimum number of operations needed to make the gcd of the whole array greater than 1.",
        "Example 1:\nInput:\n3\n6 2 4\nOutput: 0\nExplanation: The gcd is already 2.",
        "Example 2:\nInput:\n5\n9 8 7 3 1\nOutput: 4\nExplanation: Target prime 2: 9 -> 8, 7 -> 8, 3 -> 2 or 4, 1 -> 2, one operation each and 8 untouched, total 4. Target prime 3 also costs 4 (8 -> 9, 7 -> 6, 1 -> 3), and nothing does better.",
        "Constraints:\n- 2 <= n <= 2 * 10^5\n- 1 <= a[i] <= 10^12",
      ],
      code: `using u64 = unsigned long long;

u64 mulmod(u64 a, u64 b, u64 m) { return (unsigned __int128)a * b % m; }

u64 powmod(u64 a, u64 e, u64 m) {
    u64 r = 1; a %= m;
    while (e) { if (e & 1) r = mulmod(r, a, m); a = mulmod(a, a, m); e >>= 1; }
    return r;
}

bool isPrime(u64 n) {
    if (n < 2) return false;
    for (u64 p : {2ULL, 3ULL, 5ULL, 7ULL, 11ULL, 13ULL, 17ULL, 19ULL, 23ULL, 29ULL, 31ULL, 37ULL})
        if (n % p == 0) return n == p;
    u64 d = n - 1; int s = 0;
    while (!(d & 1)) { d >>= 1; s++; }
    for (u64 a : {2ULL, 3ULL, 5ULL, 7ULL, 11ULL, 13ULL, 17ULL, 19ULL, 23ULL, 29ULL, 31ULL, 37ULL}) {
        u64 x = powmod(a, d, n);
        if (x == 1 || x == n - 1) continue;
        bool composite = true;
        for (int i = 1; i < s; i++) { x = mulmod(x, x, n); if (x == n - 1) { composite = false; break; } }
        if (composite) return false;
    }
    return true;
}

u64 gcdu(u64 a, u64 b) { while (b) { u64 t = a % b; a = b; b = t; } return a; }

u64 pollard(u64 n) {
    for (u64 c = 1;; c++) {
        u64 x = 2, y = 2, d = 1;
        while (d == 1) {
            x = (mulmod(x, x, n) + c) % n;
            y = (mulmod(y, y, n) + c) % n;
            y = (mulmod(y, y, n) + c) % n;
            d = gcdu(x > y ? x - y : y - x, n);
        }
        if (d != n) return d;
    }
}

void factor(u64 n, vector<u64>& out) {
    if (n == 1) return;
    if (isPrime(n)) { out.push_back(n); return; }
    u64 d = (n % 2 == 0) ? 2 : pollard(n);
    factor(d, out);
    factor(n / d, out);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<u64> a(n);
    for (auto& x : a) cin >> x;

    u64 best = n;                                  // making everything even costs at most 1 each
    auto cost = [&](u64 p) {
        u64 tot = 0;
        for (u64 x : a) {
            if (x < p) tot += p - x;               // cannot go below 1, so round up
            else { u64 r = x % p; tot += min(r, p - r); }
            if (tot >= best) return best;          // prune: this prime cannot win
        }
        return tot;
    };

    mt19937_64 rng(chrono::steady_clock::now().time_since_epoch().count());
    vector<u64> cands;
    int iters = min(n, 40);                        // 40 samples: failure probability under 2^-40
    for (int it = 0; it < iters; it++) {
        u64 x = a[rng() % n];
        for (u64 y = (x > 1 ? x - 1 : 1); y <= x + 1; y++) factor(y, cands);
    }
    sort(cands.begin(), cands.end());
    cands.erase(unique(cands.begin(), cands.end()), cands.end());
    for (u64 p : cands) best = min(best, cost(p));
    cout << best << "\\n";
    return 0;
}`,
      explanation: [
        "For a fixed target prime p the cost is separable: each element pays the distance to the nearest multiple of p, which is min(a[i] mod p, p - a[i] mod p), except that an element smaller than p must be raised to p because values must stay at least 1. The optimum is over primes only - if a composite g works, so does any prime dividing g, at no greater cost - so the task is to find the right prime out of the primes dividing numbers up to 10^12 + 1.",
        "The key observation bounds the answer: turning every element even costs at most 1 each, so the answer is at most n. Hence in the optimal solution fewer than half of the elements are changed by 2 or more, meaning more than half the elements satisfy a[i] mod p being 0, 1, or p-1 - that is, the optimal p divides a[i] - 1, a[i], or a[i] + 1.",
        "So sample a random index, factor those three neighbours, and add their primes to the candidate set. Each sample misses the optimal prime with probability under 1/2, so 40 independent samples reduce the failure probability below 2^-40. This is where Pollard is mandatory: 120 numbers up to 10^12 + 1 must be factored, and each rho call costs about 10^3 iterations rather than the 10^6 of trial division.",
        "The candidate list stays small (a few hundred distinct primes) and each candidate is scored in O(n), so the scoring loop dominates at a few times 10^7 operations. The early break once the running total reaches the current best keeps that comfortable.",
        "Two easy mistakes: forgetting that a[i] = 1 cannot be decreased to 0, and seeding the random generator with a constant, which lets an adversarial test in a hacking phase pin down the sampled indices.",
        "Time: O(40 * A^(1/4) log A + C * n) expected, where A = max a[i] and C is the number of candidate primes. Space: O(n + C).",
      ],
    },
  ],
};
