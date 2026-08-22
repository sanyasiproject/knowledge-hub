import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Discrete Logarithm",
      difficulty: "Easy",
      variation: "Baby-step giant-step template, coprime modulus",
      question: [
        "Given three integers a, b and m with gcd(a, m) = 1, find the smallest non-negative integer x such that a^x is congruent to b modulo m. Return -1 if no such x exists.",
        "Example 1:\nInput: a = 2, b = 3, m = 5\nOutput: 3\nExplanation: The powers of 2 modulo 5 are 1, 2, 4, 3, so 2^3 = 8 which is 3 modulo 5, and no smaller exponent works.",
        "Example 2:\nInput: a = 3, b = 13, m = 17\nOutput: 4\nExplanation: 3^0 = 1, 3^1 = 3, 3^2 = 9, 3^3 = 10, 3^4 = 13 modulo 17.",
        "Constraints:\n- 2 <= m <= 10^9\n- 0 <= a, b < m\n- gcd(a, m) = 1",
      ],
      code: `long long power(long long a, long long e, long long m) {
    long long r = 1 % m;
    a %= m;
    while (e > 0) {
        if (e & 1) r = r * a % m;
        a = a * a % m;
        e >>= 1;
    }
    return r;
}

long long discreteLog(long long a, long long b, long long m) {
    a %= m;
    b %= m;
    long long n = (long long)sqrtl((long double)m) + 1;   // block size
    long long an = power(a, n, m);                        // the giant step
    unordered_map<long long, long long> tbl;
    long long cur = b;
    for (long long q = 0; q <= n; q++) {
        tbl[cur] = q;          // overwrite keeps the LARGEST q, which minimises n*p - q
        cur = cur * a % m;
    }
    cur = 1 % m;
    for (long long p = 1; p <= n; p++) {
        cur = cur * an % m;
        auto it = tbl.find(cur);
        if (it != tbl.end()) return n * p - it->second;
    }
    return -1;
}`,
      explanation: [
        "Write the unknown exponent as x = n*p - q with n = ceil(sqrt(m)), 1 <= p <= n and 0 <= q <= n. Every x in [0, m) is representable this way, so nothing is missed. Substituting gives a^(n*p) = b * a^q (mod m).",
        "So build a hash table of the n+1 baby steps b * a^q, then walk the giant steps (a^n)^p and stop at the first collision. Two passes of about sqrt(m) modular multiplications replace the m steps a linear scan would need.",
        "Why gcd(a, m) = 1 matters: the rearrangement divides by a^q, which is only legal when a is invertible modulo m. With a shared factor the powers of a are eventually periodic but not purely periodic, and this code can miss the answer - that case needs the extended version.",
        "Two details make the answer minimal rather than merely correct. The table is filled with increasing q so a repeated value keeps the largest q, and p is scanned upward, so the first hit gives the smallest n*p - q. Also, since the exponent search only needs to cover one period of length at most m, if no collision appears within n giant steps there is no solution at all.",
        "Time: O(sqrt(m)) modular multiplications on average with a hash map, O(sqrt(m) log m) with an ordered map. Space: O(sqrt(m)).",
      ],
    },
    {
      name: "Discrete Logging",
      difficulty: "Medium",
      variation: "Prime modulus, judge I/O with multiple queries",
      link: "http://poj.org/problem?id=2417",
      question: [
        "Each line of input contains three integers P, B and N, where P is a prime and 0 <= B, N < P. For every line print the smallest non-negative integer L such that B^L is congruent to N modulo P, or the words 'no solution' if there is none. Input ends at end of file.",
        "Example 1:\nInput:\n5 2 1\n5 2 3\n5 4 2\nOutput:\n0\n3\nno solution\nExplanation: 2^0 = 1 modulo 5. The powers of 2 modulo 5 cycle 1, 2, 4, 3 so 2^3 = 3. The powers of 4 modulo 5 cycle 1, 4 only, so 2 is never reached.",
        "Example 2:\nInput:\n12345701 2 1111111\nOutput:\n9584351",
        "Constraints:\n- 2 <= P < 2^31 and P is prime\n- 0 <= B, N < P\n- Up to a few hundred queries",
      ],
      code: `long long power(long long a, long long e, long long m) {
    long long r = 1 % m;
    a %= m;
    while (e > 0) {
        if (e & 1) r = r * a % m;
        a = a * a % m;
        e >>= 1;
    }
    return r;
}

long long discreteLog(long long a, long long b, long long m) {
    a %= m;
    b %= m;
    long long n = (long long)sqrtl((long double)m) + 1;
    long long an = power(a, n, m);
    unordered_map<long long, long long> tbl;
    long long cur = b;
    for (long long q = 0; q <= n; q++) {
        tbl[cur] = q;
        cur = cur * a % m;
    }
    cur = 1 % m;
    for (long long p = 1; p <= n; p++) {
        cur = cur * an % m;
        auto it = tbl.find(cur);
        if (it != tbl.end()) return n * p - it->second;
    }
    return -1;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    long long P, B, N;
    while (cin >> P >> B >> N) {
        long long r = discreteLog(B, N, P);
        if (r < 0) cout << "no solution" << "\\n";
        else cout << r << "\\n";
    }
    return 0;
}`,
      explanation: [
        "P is prime, so every B in [1, P) is invertible and plain baby-step giant-step applies directly with no preprocessing.",
        "A prime modulus does not guarantee a solution: B generates a cyclic subgroup whose size is the multiplicative order of B, and N is reachable only if it lies in that subgroup. B = 4 modulo 5 has order 2 and reaches only 1 and 4, which is why N = 2 has no solution. Reporting 'no solution' when the giant-step loop finishes is exactly this membership test.",
        "The arithmetic trap: P can be just under 2^31, so a product of two residues reaches almost 2^62. All multiplication must happen in 64-bit; doing it in int silently overflows and produces wrong logs on the large cases.",
        "Each query rebuilds its own table, which is the right choice here because P changes from line to line. If many queries shared one modulus and base, the baby-step table could be built once and reused.",
        "Time: O(sqrt(P)) per query. Space: O(sqrt(P)).",
      ],
    },
    {
      name: "Multiplicative Order",
      difficulty: "Medium",
      variation: "Order of an element, the period behind BSGS",
      question: [
        "Given two integers a and n with gcd(a, n) = 1, find the multiplicative order of a modulo n, that is the smallest positive integer k such that a^k is congruent to 1 modulo n.",
        "Example 1:\nInput: a = 4, n = 7\nOutput: 3\nExplanation: 4^1 = 4, 4^2 = 2, 4^3 = 1 modulo 7.",
        "Example 2:\nInput: a = 3, n = 7\nOutput: 6\nExplanation: The powers of 3 modulo 7 are 3, 2, 6, 4, 5, 1, so 3 is a primitive root and its order is the full group size 6.",
        "Constraints:\n- 1 <= n <= 10^12\n- 1 <= a < n\n- gcd(a, n) = 1",
      ],
      code: `long long gcdll(long long a, long long b) { return b ? gcdll(b, a % b) : a; }

long long power(long long a, long long e, long long m) {
    long long r = 1 % m;
    a %= m;
    while (e > 0) {
        if (e & 1) r = r * a % m;
        a = a * a % m;
        e >>= 1;
    }
    return r;
}

long long multiplicativeOrder(long long a, long long n) {
    if (gcdll(a, n) != 1) return -1;      // order is undefined without invertibility
    long long phi = n, t = n;
    for (long long p = 2; p * p <= t; p++) {   // Euler totient by trial division
        if (t % p == 0) {
            while (t % p == 0) t /= p;
            phi -= phi / p;
        }
    }
    if (t > 1) phi -= phi / t;
    long long ord = phi, e = phi;
    for (long long p = 2; p * p <= e; p++) {   // strip prime factors of phi while still valid
        if (e % p == 0) {
            while (e % p == 0) e /= p;
            while (ord % p == 0 && power(a, ord / p, n) == 1 % n) ord /= p;
        }
    }
    if (e > 1) {
        while (ord % e == 0 && power(a, ord / e, n) == 1 % n) ord /= e;
    }
    return ord;
}`,
      explanation: [
        "The key fact is that the set of exponents k with a^k = 1 (mod n) is exactly the set of multiples of the order. So the order divides any exponent that works, and by Euler's theorem it divides phi(n).",
        "That turns the search into a descent instead of a scan: start at phi(n) and, for each prime p dividing it, keep dividing the candidate by p as long as the smaller exponent still returns 1. When no single prime can be removed any more, no divisor of the current value works either, so the value is the order.",
        "The tempting wrong approach is multiplying a by itself until 1 reappears. That is O(n) and hopeless for n near 10^12, and it is also unnecessary - the divisor structure of phi(n) does the same job in a handful of modular exponentiations.",
        "This is the quantity that bounds any discrete-log search: a^x = b has a solution only if b lies in the cyclic group generated by a, and if x0 is one solution then the full solution set is x0 plus multiples of the order.",
        "Time: O(sqrt(n)) for the two factorisations plus O(log^2 n) modular exponentiations. Space: O(1).",
      ],
    },
    {
      name: "Find a Primitive Root of a Prime Number",
      difficulty: "Medium",
      variation: "Primitive root, the generator a discrete log is taken against",
      question: [
        "Given a prime p, find its smallest primitive root, that is the smallest g in [1, p) whose multiplicative order modulo p is exactly p - 1. Such a g generates every non-zero residue as a power of itself.",
        "Example 1:\nInput: p = 7\nOutput: 3\nExplanation: 2 is not a primitive root because 2^3 = 1 modulo 7, so its order is 3. The powers of 3 are 3, 2, 6, 4, 5, 1, which is all six non-zero residues.",
        "Example 2:\nInput: p = 761\nOutput: 6",
        "Constraints:\n- 2 <= p <= 10^9 and p is prime",
      ],
      code: `long long power(long long a, long long e, long long m) {
    long long r = 1 % m;
    a %= m;
    while (e > 0) {
        if (e & 1) r = r * a % m;
        a = a * a % m;
        e >>= 1;
    }
    return r;
}

long long primitiveRoot(long long p) {
    if (p == 2) return 1;
    vector<long long> qs;
    long long t = p - 1;
    for (long long q = 2; q * q <= t; q++) {     // distinct prime factors of p - 1
        if (t % q == 0) {
            qs.push_back(q);
            while (t % q == 0) t /= q;
        }
    }
    if (t > 1) qs.push_back(t);
    for (long long g = 2; g < p; g++) {
        bool ok = true;
        for (long long q : qs) {
            if (power(g, (p - 1) / q, p) == 1) { ok = false; break; }
        }
        if (ok) return g;
    }
    return -1;
}`,
      explanation: [
        "The order of g divides p - 1, so g fails to be a generator exactly when its order is a proper divisor of p - 1. Every proper divisor divides (p - 1) / q for some prime q dividing p - 1, so checking g^((p-1)/q) != 1 for each such q is enough - there is no need to know the order itself.",
        "That reduces one candidate test to at most nine modular exponentiations, since p - 1 below 10^9 has at most nine distinct prime factors.",
        "The search terminates quickly in practice because primitive roots are dense: their count is phi(p - 1), which is a constant fraction of p, so the smallest one is small for every realistic prime.",
        "Why this belongs to the discrete-log toolkit: once g is known, every non-zero residue has a unique index, and log base g turns multiplication modulo p into addition modulo p - 1. That is the change of coordinates used to solve x^k = a and other power equations.",
        "Time: O(sqrt(p)) to factor p - 1 plus O(g * log(p-1) * log p) for the tests. Space: O(log p).",
      ],
    },
    {
      name: "Sequence in mod P",
      difficulty: "Medium",
      variation: "Affine recurrence reduced to a discrete log",
      link: "https://atcoder.jp/contests/abc270/tasks/abc270_g",
      question: [
        "You are given T independent test cases. Each gives a prime P and four integers A, B, S and G. A sequence is defined by X(0) = S and X(n+1) = (A * X(n) + B) mod P. Print the smallest n with X(n) = G, or -1 if the value G never occurs.",
        "Example 1:\nInput:\n3\n11 3 0 1 9\n13 1 5 2 1\n7 2 1 1 6\nOutput:\n2\n5\n-1\nExplanation: With A = 3, B = 0 the sequence is 1, 3, 9 so n = 2. With A = 1, B = 5 it is 2, 7, 12, 4, 9, 1 so n = 5. With A = 2, B = 1 modulo 7 it cycles 1, 3, 0 forever and never reaches 6.",
        "Example 2:\nInput:\n1\n7 0 4 2 4\nOutput:\n1\nExplanation: X(1) = 0 * 2 + 4 = 4.",
        "Constraints:\n- 1 <= T <= 100\n- 2 <= P <= 10^9 and P is prime\n- 0 <= A, B, S, G < P",
      ],
      code: `long long power(long long a, long long e, long long m) {
    long long r = 1 % m;
    a %= m;
    while (e > 0) {
        if (e & 1) r = r * a % m;
        a = a * a % m;
        e >>= 1;
    }
    return r;
}

long long discreteLog(long long a, long long b, long long m) {
    a %= m;
    b %= m;
    long long n = (long long)sqrtl((long double)m) + 1;
    long long an = power(a, n, m);
    unordered_map<long long, long long> tbl;
    long long cur = b;
    for (long long q = 0; q <= n; q++) {
        tbl[cur] = q;
        cur = cur * a % m;
    }
    cur = 1 % m;
    for (long long p = 1; p <= n; p++) {
        cur = cur * an % m;
        auto it = tbl.find(cur);
        if (it != tbl.end()) return n * p - it->second;
    }
    return -1;
}

long long solve(long long P, long long A, long long B, long long S, long long G) {
    if (S == G) return 0;
    if (A == 0) return (G == B % P) ? 1 : -1;          // constant from index 1 on
    if (A == 1) {                                      // arithmetic progression
        if (B == 0) return -1;
        return (G - S + P) % P * power(B, P - 2, P) % P;
    }
    long long c = B % P * power(A - 1, P - 2, P) % P;  // c = B / (A - 1)
    long long u = (S + c) % P, v = (G + c) % P;
    if (u == 0 || v == 0) return -1;                   // fixed point, or unreachable zero
    return discreteLog(A, v * power(u, P - 2, P) % P, P);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int T;
    cin >> T;
    while (T--) {
        long long P, A, B, S, G;
        cin >> P >> A >> B >> S >> G;
        cout << solve(P, A, B, S, G) << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Shift the sequence so the affine map becomes a pure multiplication. With c = B / (A - 1) the recurrence gives X(n) + c = A * (X(n-1) + c), hence X(n) + c = A^n * (S + c). Setting X(n) = G turns the whole problem into one discrete log: A^n = (G + c) / (S + c) modulo P.",
        "The degenerate cases are where solutions are lost. A = 1 has no inverse of A - 1: there the sequence is S + n*B, an arithmetic progression, so n comes from one modular division, and if B is also 0 the sequence is constant. A = 0 makes the sequence constantly B from index 1.",
        "For A >= 2 the shift can still collapse. If S + c = 0 then S is a fixed point and the sequence never moves, so the answer is -1 unless S = G was already caught. If G + c = 0 with S + c nonzero, we would need A^n = 0 modulo a prime, which is impossible.",
        "A tempting wrong shortcut is to simulate until a value repeats. The cycle can be as long as P - 1, so with P near 10^9 and 100 test cases that is far too slow; BSGS replaces the walk with sqrt(P) work.",
        "Time: O(T * sqrt(P)). Space: O(sqrt(P)).",
      ],
    },
    {
      name: "Power Modulo Inverted",
      difficulty: "Hard",
      variation: "Extended BSGS, base and modulus not coprime",
      link: "https://www.spoj.com/problems/MOD/",
      question: [
        "Given three integers x, z and k on each line, find the smallest non-negative integer y such that x^y mod z equals k, or print 'No Solution' if there is none. The input ends with a line containing three zeros, which must not be processed.",
        "Example 1:\nInput:\n5 58 33\n2 4 3\n0 0 0\nOutput:\n9\nNo Solution\nExplanation: The powers of 5 modulo 58 are 1, 5, 25, 9, 45, 51, 23, 57, 53, 33, so y = 9. The powers of 2 modulo 4 are 1, 2, 0, 0, ... so 3 is never produced.",
        "Example 2:\nInput:\n4 12 8\n0 0 0\nOutput:\nNo Solution\nExplanation: The powers of 4 modulo 12 are 1, 4, 4, 4, ... so 8 never appears even though gcd(4, 12) divides 8.",
        "Constraints:\n- 1 <= x, z, k <= 10^9\n- The number of queries is a few thousand",
      ],
      code: `long long gcdll(long long a, long long b) { return b ? gcdll(b, a % b) : a; }

long long power(long long a, long long e, long long m) {
    long long r = 1 % m;
    a %= m;
    while (e > 0) {
        if (e & 1) r = r * a % m;
        a = a * a % m;
        e >>= 1;
    }
    return r;
}

long long inverse(long long a, long long m) {          // extended Euclid, needs gcd(a, m) = 1
    long long g = m, x = 0, x1 = 1, a1 = ((a % m) + m) % m;
    while (a1) {
        long long q = g / a1;
        long long t = g - q * a1; g = a1; a1 = t;
        t = x - q * x1; x = x1; x1 = t;
    }
    return (x % m + m) % m;
}

long long bsgs(long long a, long long b, long long m) {
    a %= m;
    b %= m;
    long long n = (long long)sqrtl((long double)m) + 1;
    long long an = power(a, n, m);
    unordered_map<long long, long long> tbl;
    long long cur = b;
    for (long long q = 0; q <= n; q++) {
        tbl[cur] = q;
        cur = cur * a % m;
    }
    cur = 1 % m;
    for (long long p = 1; p <= n; p++) {
        cur = cur * an % m;
        auto it = tbl.find(cur);
        if (it != tbl.end()) return n * p - it->second;
    }
    return -1;
}

long long exBsgs(long long a, long long b, long long m) {
    a %= m;
    b %= m;
    if (m == 1) return 0;
    if (b == 1) return 0;                 // y = 0 always works when b is 1
    long long cnt = 0, t = 1 % m, d;
    while ((d = gcdll(a, m)) > 1) {
        if (b % d) return -1;             // no solution with y >= cnt + 1
        b /= d;
        m /= d;
        cnt++;
        t = t * (a / d) % m;              // accumulated prefix a^cnt after the divisions
        if (t == b % m) return cnt;       // exact hit at exponent cnt
    }
    long long r = bsgs(a, b % m * inverse(t, m) % m, m);
    return r < 0 ? -1 : r + cnt;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    long long x, z, k;
    while (cin >> x >> z >> k) {
        if (x == 0 && z == 0 && k == 0) break;
        long long r = exBsgs(x, k, z);
        if (r < 0) cout << "No Solution" << "\\n";
        else cout << r << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Plain BSGS needs a invertible. When d = gcd(a, m) > 1 the powers of a are only eventually periodic, and the rearrangement a^(np) = b * a^q divides by something non-invertible, so the search can silently miss the answer.",
        "The fix peels the common factor off. Assuming y >= 1, a^y = b (mod m) means a^y = b + s*m for some s, and dividing by d gives (a/d) * a^(y-1) = b/d (mod m/d). This is only solvable when d divides b, which is the early rejection. Each peel shrinks m by a factor of at least 2, so the loop runs at most log2(m) times and ends with a coprime modulus.",
        "The accumulated factor t is the product of the (a/d) terms, so the surviving equation is t * a^(y - cnt) = b (mod m) with the reduced b and m. Now a is invertible, t is invertible, and one ordinary BSGS on b * t^(-1) finishes it; add cnt back to the exponent.",
        "Exponents below cnt are not covered by that final call, which is why the loop checks t == b after each peel, and why b == 1 is answered with 0 before anything else. Missing those two checks is the classic bug that reports a too-large exponent or -1 for the small cases.",
        "The second example shows why d dividing b is necessary but not sufficient: gcd(4, 12) = 4 divides 8, yet the peeling reduces to an equation with no solution, and only the final BSGS discovers that.",
        "Time: O(sqrt(z) + log z) per query. Space: O(sqrt(z)).",
      ],
    },
    {
      name: "Discrete Roots",
      difficulty: "Hard",
      variation: "Solving x^k = a via index calculus",
      question: [
        "Given a prime p and integers k >= 1 and a with 0 <= a < p, find every x in [0, p) with x^k congruent to a modulo p, sorted increasingly. Report the empty list when there is no such x.",
        "Example 1:\nInput: p = 7, k = 2, a = 2\nOutput: [3, 4]\nExplanation: 3^2 = 9 = 2 and 4^2 = 16 = 2 modulo 7, and no other residue squares to 2.",
        "Example 2:\nInput: p = 11, k = 3, a = 8\nOutput: [2]\nExplanation: gcd(3, 10) = 1, so cubing is a bijection modulo 11 and the cube root of 8 is unique.",
        "Example 3:\nInput: p = 7, k = 2, a = 3\nOutput: []\nExplanation: 3 is not a quadratic residue modulo 7.",
        "Constraints:\n- 2 <= p <= 10^9 and p is prime\n- 1 <= k <= 10^5\n- 0 <= a < p",
      ],
      code: `long long gcdll(long long a, long long b) { return b ? gcdll(b, a % b) : a; }

long long power(long long a, long long e, long long m) {
    long long r = 1 % m;
    a %= m;
    while (e > 0) {
        if (e & 1) r = r * a % m;
        a = a * a % m;
        e >>= 1;
    }
    return r;
}

long long inverse(long long a, long long m) {
    long long g = m, x = 0, x1 = 1, a1 = ((a % m) + m) % m;
    while (a1) {
        long long q = g / a1;
        long long t = g - q * a1; g = a1; a1 = t;
        t = x - q * x1; x = x1; x1 = t;
    }
    return (x % m + m) % m;
}

long long bsgs(long long a, long long b, long long m) {
    a %= m;
    b %= m;
    long long n = (long long)sqrtl((long double)m) + 1;
    long long an = power(a, n, m);
    unordered_map<long long, long long> tbl;
    long long cur = b;
    for (long long q = 0; q <= n; q++) {
        tbl[cur] = q;
        cur = cur * a % m;
    }
    cur = 1 % m;
    for (long long p = 1; p <= n; p++) {
        cur = cur * an % m;
        auto it = tbl.find(cur);
        if (it != tbl.end()) return n * p - it->second;
    }
    return -1;
}

long long primitiveRoot(long long p) {
    if (p == 2) return 1;
    vector<long long> qs;
    long long t = p - 1;
    for (long long q = 2; q * q <= t; q++) {
        if (t % q == 0) { qs.push_back(q); while (t % q == 0) t /= q; }
    }
    if (t > 1) qs.push_back(t);
    for (long long g = 2; g < p; g++) {
        bool ok = true;
        for (long long q : qs) if (power(g, (p - 1) / q, p) == 1) { ok = false; break; }
        if (ok) return g;
    }
    return -1;
}

vector<long long> discreteRoots(long long p, long long k, long long a) {
    a %= p;
    if (a == 0) return {0};              // x = 0 is the only root of 0
    long long g = primitiveRoot(p);
    long long n = p - 1;
    long long z = bsgs(g, a, p);         // a = g^z
    long long kk = k % n;                // exponents live modulo p - 1
    if (kk == 0) {                       // x^k = 1 for every x, so k >= p - 1 and p is small
        if (z % n != 0) return {};
        vector<long long> all;
        for (long long x = 1; x < p; x++) all.push_back(x);
        return all;
    }
    long long d = gcdll(kk, n);
    if (z % d) return {};                // linear congruence k*y = z (mod p-1) unsolvable
    long long nn = n / d;
    long long y0 = (z / d) % nn * inverse(kk / d, nn) % nn;
    vector<long long> res;
    for (long long i = 0; i < d; i++) res.push_back(power(g, (y0 + i * nn) % n, p));
    sort(res.begin(), res.end());
    return res;
}`,
      explanation: [
        "Take a primitive root g. Every non-zero residue is g^y for exactly one y in [0, p-1), and x = g^y satisfies x^k = a exactly when g^(k*y) = g^z, that is when k*y = z modulo p - 1 where z = log base g of a. So one discrete log converts a multiplicative equation into a linear congruence.",
        "A linear congruence k*y = z (mod n) with d = gcd(k, n) is solvable only when d divides z, and then it has exactly d solutions spaced n/d apart. Mapping them back through g gives all d roots, which is why the answer size is always gcd(k, p-1) or zero - for k = 2 that is the familiar 'two square roots or none'.",
        "Two easy mistakes. Exponents must be reduced modulo p - 1, not modulo p, because that is the order of the group. And the inverse of k/d must be taken modulo n/d, not modulo n: modulo n it does not exist whenever d > 1.",
        "a = 0 sits outside the group entirely and is handled separately - its only root is 0. The k congruent to 0 branch means k is a multiple of p - 1, so every non-zero x works when a = 1; it can only trigger for tiny p because k is bounded.",
        "Time: O(sqrt(p) + d log p), dominated by the primitive-root factorisation and the BSGS. Space: O(sqrt(p) + d).",
      ],
    },
    {
      name: "222",
      difficulty: "Hard",
      variation: "Divisibility of repunits, order of 10 modulo m",
      link: "https://atcoder.jp/contests/abc222/tasks/abc222_g",
      question: [
        "The sequence 2, 22, 222, 2222, ... has as its k-th term the number written with exactly k twos. For each of T given integers K, print the smallest k such that K divides the k-th term, or -1 if no term of the sequence is a multiple of K.",
        "Example 1:\nInput:\n3\n2\n101\n4\nOutput:\n1\n4\n-1\nExplanation: 2 is divisible by 2. 2222 = 101 * 22 and no shorter term works. Every term equals 2 times an odd number, so no term is divisible by 4.",
        "Example 2:\nInput:\n2\n3\n6\nOutput:\n3\n3\nExplanation: 222 = 3 * 74 = 6 * 37, while 2 and 22 are divisible by neither.",
        "Constraints:\n- 1 <= T <= 200\n- 1 <= K <= 10^18",
      ],
      code: `typedef unsigned long long u64;

u64 mulmod(u64 a, u64 b, u64 m) { return (u64)((__int128)a * b % m); }

u64 powmod(u64 a, u64 e, u64 m) {
    u64 r = 1 % m;
    a %= m;
    while (e) { if (e & 1) r = mulmod(r, a, m); a = mulmod(a, a, m); e >>= 1; }
    return r;
}

u64 gcdu(u64 a, u64 b) { return b ? gcdu(b, a % b) : a; }

bool isPrime(u64 n) {                                  // deterministic Miller-Rabin for 64 bits
    if (n < 2) return false;
    for (u64 p : {2ULL, 3ULL, 5ULL, 7ULL, 11ULL, 13ULL, 17ULL, 19ULL, 23ULL, 29ULL, 31ULL, 37ULL}) {
        if (n % p == 0) return n == p;
    }
    u64 d = n - 1;
    int s = 0;
    while ((d & 1) == 0) { d >>= 1; s++; }
    for (u64 a : {2ULL, 3ULL, 5ULL, 7ULL, 11ULL, 13ULL, 17ULL, 19ULL, 23ULL, 29ULL, 31ULL, 37ULL}) {
        u64 x = powmod(a, d, n);
        if (x == 1 || x == n - 1) continue;
        bool composite = true;
        for (int i = 1; i < s; i++) {
            x = mulmod(x, x, n);
            if (x == n - 1) { composite = false; break; }
        }
        if (composite) return false;
    }
    return true;
}

u64 pollard(u64 n) {
    if ((n & 1) == 0) return 2;
    u64 x = 2, y = 2, c = 1, d = 1;
    while (true) {
        x = (mulmod(x, x, n) + c) % n;                  // Floyd cycle finding on x -> x^2 + c
        y = (mulmod(y, y, n) + c) % n;
        y = (mulmod(y, y, n) + c) % n;
        d = gcdu(x > y ? x - y : y - x, n);
        if (d == n) { c++; x = y = 2; continue; }        // retry with another polynomial
        if (d > 1) return d;
    }
}

void factor(u64 n, map<u64,int>& f) {
    if (n == 1) return;
    if (isPrime(n)) { f[n]++; return; }
    u64 d = pollard(n);
    factor(d, f);
    factor(n / d, f);
}

u64 orderOf10(u64 m) {
    map<u64,int> fm;
    factor(m, fm);
    u64 phi = 1;
    for (auto& e : fm) {
        u64 t = e.first - 1;
        for (int i = 1; i < e.second; i++) t *= e.first;
        phi *= t;
    }
    map<u64,int> fp;
    factor(phi, fp);
    u64 ord = phi;
    for (auto& e : fp) {
        while (ord % e.first == 0 && powmod(10, ord / e.first, m) == 1) ord /= e.first;
    }
    return ord;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int T;
    cin >> T;
    while (T--) {
        u64 K;
        cin >> K;
        u64 k1 = (K % 2 == 0) ? K / 2 : K;              // strip the single factor of 2
        u64 m = 9 * k1;
        if (gcdu(10, m) != 1) { cout << -1 << "\\n"; continue; }
        cout << orderOf10(m) << "\\n";
    }
    return 0;
}`,
      explanation: [
        "The k-th term is 2 * R(k) where R(k) = (10^k - 1) / 9 is the repunit of length k. So K divides the term iff K divides 2 * R(k). Cancelling the single factor of two (the repunit is always odd) leaves K1 = K / gcd(K, 2) and the condition K1 divides R(k), which multiplied by 9 becomes 10^k congruent to 1 modulo 9 * K1.",
        "That is exactly a multiplicative order question, and the answer is the order of 10 modulo m = 9 * K1 - the smallest such k, with every other valid k being a multiple of it. If gcd(10, m) is not 1 then 10 is not invertible and no power of it can be 1, which is the -1 case: it fires precisely when K1 is even or divisible by 5.",
        "With K up to 10^18 the modulus m reaches 9 * 10^18, so sqrt(m) is about 3 * 10^9 and baby-step giant-step is far too slow here. The order must be obtained structurally: factor m with Miller-Rabin plus Pollard's rho, build phi(m), then strip prime factors of phi(m) from the candidate exponent while the smaller exponent still gives 1.",
        "Every multiplication is done through __int128 because m near 9 * 10^18 makes the product of two residues overflow 64 bits immediately. This is the single most common way to get this problem wrong.",
        "Cancelling the 2 must be done as gcd(K, 2) and no more: for K = 4 the reduced K1 = 2 is still even, gcd(10, 18) = 2, and the answer is correctly -1 because 2 * odd is never a multiple of 4.",
        "Time: O(T * (m^(1/4) + log^2 m)) dominated by two Pollard factorisations per query. Space: O(log m).",
      ],
    },
    {
      name: "Lunar New Year and a Recursive Sequence",
      difficulty: "Hard",
      variation: "Matrix power in the exponent plus a discrete root",
      link: "https://codeforces.com/problemset/problem/1106/F",
      question: [
        "Let p = 998244353. A sequence is defined by f(1) = f(2) = ... = f(k-1) = 1 and, for i >= k, f(i) = the product over j = 1..k of f(i-j) raised to b(j), taken modulo p. You are given k, the exponents b(1)..b(k), and two integers n and m. Find any value of f(k) in [1, p) that makes f(n) congruent to m modulo p, or report -1 if none exists.",
        "Example 1:\nInput:\n3\n2 3 5\n4 16\nOutput: 4\nExplanation: f(1) = f(2) = 1, so f(4) = f(3)^2 * f(2)^3 * f(1)^5 = f(3)^2. Setting f(3) = 4 gives f(4) = 16. Any value whose square is 16 modulo p is accepted.",
        "Example 2:\nInput:\n2\n1 1\n5 8\nOutput: 2\nExplanation: With k = 2 and both exponents 1, f(3) = f(2) * f(1) = f(2), f(4) = f(3) * f(2) = f(2)^2, f(5) = f(4) * f(3) = f(2)^3, so the cube root of 8 is wanted and 2 is the unique one.",
        "Constraints:\n- 1 <= k <= 100\n- 1 <= b(j) < p\n- k < n <= 10^9\n- 1 <= m < p",
      ],
      code: `const long long P = 998244353, L = 998244352;      // L = P - 1, and 3 is a primitive root of P

long long gcdll(long long a, long long b) { return b ? gcdll(b, a % b) : a; }

long long power(long long a, long long e, long long m) {
    long long r = 1 % m;
    a %= m;
    while (e > 0) {
        if (e & 1) r = r * a % m;
        a = a * a % m;
        e >>= 1;
    }
    return r;
}

long long inverse(long long a, long long m) {
    long long g = m, x = 0, x1 = 1, a1 = ((a % m) + m) % m;
    while (a1) {
        long long q = g / a1;
        long long t = g - q * a1; g = a1; a1 = t;
        t = x - q * x1; x = x1; x1 = t;
    }
    return (x % m + m) % m;
}

long long bsgs(long long a, long long b, long long m) {
    a %= m;
    b %= m;
    long long n = (long long)sqrtl((long double)m) + 1;
    long long an = power(a, n, m);
    unordered_map<long long, long long> tbl;
    long long cur = b;
    for (long long q = 0; q <= n; q++) {
        tbl[cur] = q;
        cur = cur * a % m;
    }
    cur = 1 % m;
    for (long long p = 1; p <= n; p++) {
        cur = cur * an % m;
        auto it = tbl.find(cur);
        if (it != tbl.end()) return n * p - it->second;
    }
    return -1;
}

typedef vector<vector<long long>> Mat;

Mat mul(const Mat& A, const Mat& B) {
    int k = A.size();
    Mat C(k, vector<long long>(k, 0));
    for (int i = 0; i < k; i++)
        for (int t = 0; t < k; t++) {
            if (!A[i][t]) continue;
            for (int j = 0; j < k; j++) C[i][j] = (C[i][j] + A[i][t] * B[t][j]) % L;
        }
    return C;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int k;
    cin >> k;
    vector<long long> b(k);
    for (auto& v : b) cin >> v;
    long long n, m;
    cin >> n >> m;
    Mat M(k, vector<long long>(k, 0));
    for (int j = 0; j < k; j++) M[0][j] = b[j] % L;     // exponents combine modulo P - 1
    for (int i = 1; i < k; i++) M[i][i - 1] = 1;
    Mat R(k, vector<long long>(k, 0));
    for (int i = 0; i < k; i++) R[i][i] = 1;
    long long e = n - k;
    while (e > 0) { if (e & 1) R = mul(R, M); M = mul(M, M); e >>= 1; }
    long long c = R[0][0];                              // exponent of f(k) inside f(n)
    long long z = bsgs(3, m, P);                        // m = 3^z
    if (c == 0) { cout << (z % L == 0 ? 1 : -1) << "\\n"; return 0; }
    long long d = gcdll(c, L);
    if (z % d) { cout << -1 << "\\n"; return 0; }
    long long mm = L / d;
    long long t = (z / d) % mm * inverse(c / d, mm) % mm;
    cout << power(3, t, P) << "\\n";
    return 0;
}`,
      explanation: [
        "The recurrence multiplies powers, so take logarithms. 3 is a primitive root of 998244353, so write every term as f(i) = 3^E(i); then the product recurrence becomes the linear recurrence E(i) = sum of b(j) * E(i-j), taken modulo P - 1 because that is the order of the group.",
        "The initial ones give E(1) = ... = E(k-1) = 0, and E(k) is the unknown t. Since the recurrence is linear and all other seeds are zero, E(n) is simply c * t for a single coefficient c, obtained by raising the k by k companion matrix to the power n - k modulo P - 1 and reading its top-left entry.",
        "One BSGS gives z with m = 3^z, and the problem collapses to the linear congruence c * t = z (mod P - 1). Solve it with the gcd rule: unsolvable when d = gcd(c, P-1) does not divide z, otherwise t = (z/d) * (c/d)^(-1) modulo (P-1)/d, and the answer is f(k) = 3^t. Note d can exceed 1 here because P - 1 = 2^23 * 7 * 17 is very composite, so this really is a discrete-root extraction, not a plain division.",
        "The classic error is reducing the exponents modulo P instead of P - 1, or reducing the matrix entries modulo P. Exponents live in the additive group of order P - 1 by Fermat's little theorem; mixing the two moduli gives answers that pass the small samples and fail everywhere else.",
        "When c is 0 modulo P - 1, f(n) is 1 whatever f(k) is, so any f(k) works if m = 1 and nothing works otherwise. Because several t may satisfy the congruence, several f(k) are valid and the judge accepts any of them.",
        "Time: O(k^3 log n + sqrt(P)). Space: O(k^2 + sqrt(P)).",
      ],
    },
  ],
};
