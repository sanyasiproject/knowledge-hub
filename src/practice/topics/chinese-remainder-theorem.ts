import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Chinese Remainder Theorem",
      difficulty: "Easy",
      variation: "Coprime moduli, incremental lattice walk (the template)",
      question: [
        "You are given two arrays num[] and rem[] of the same length k, where the values in num[] are pairwise coprime. Find the smallest non-negative integer x such that x % num[i] == rem[i] for every i. The Chinese Remainder Theorem guarantees that such an x exists and is unique modulo the product of all num[i].",
        "Solve it without any modular-inverse machinery: build the answer one congruence at a time.",
        "Example 1:\nInput: num = [3, 4, 5], rem = [2, 3, 1]\nOutput: 11\nExplanation: 11 % 3 = 2, 11 % 4 = 3, 11 % 5 = 1, and no smaller non-negative value satisfies all three.",
        "Example 2:\nInput: num = [5, 7], rem = [1, 3]\nOutput: 31\nExplanation: The values congruent to 1 modulo 5 are 1, 6, 11, 16, 21, 26, 31, and the first of those that is congruent to 3 modulo 7 is 31.",
        "Constraints:\n- 1 <= k <= 20\n- 1 <= num[i] <= 10^6, all num[i] pairwise coprime\n- 0 <= rem[i] < num[i]\n- The product of all num[i] fits in a signed 64-bit integer",
      ],
      code: `long long findMinX(vector<long long>& num, vector<long long>& rem) {
    long long x = rem[0] % num[0];   // satisfies the first congruence
    long long prod = num[0];         // period of the current solution set
    for (size_t i = 1; i < num.size(); i++) {
        // every solution so far has the form x + t * prod, so walk that lattice
        while (x % num[i] != rem[i]) x += prod;
        prod *= num[i];              // coprimality makes the new period the product
    }
    return x;
}`,
      explanation: [
        "The invariant is that after processing the first i congruences, the full solution set is exactly the arithmetic progression x, x + prod, x + 2 * prod, ... where prod is the product of the first i moduli. That is the whole content of CRT: intersecting congruences yields another single congruence.",
        "Adding congruence i means finding the first member of that progression that also lands on rem[i] modulo num[i]. Because num[i] is coprime to prod, prod is invertible modulo num[i], so stepping by prod cycles through every residue class modulo num[i] exactly once in num[i] steps. The walk therefore terminates within num[i] iterations and finds the unique valid member.",
        "The tempting wrong version is to scan x = 0, 1, 2, ... testing all k congruences each time. That is correct but costs the product of the moduli, which is astronomically slow. The lattice walk only pays the sum of the moduli.",
        "Coprimality is load-bearing here. If two moduli share a factor the period after merging is the lcm, not the product, and the walk can also fail to find any member - a case this template silently loops forever on. The general merge appears in the later problems.",
        "Time: O(sum of num[i]). Space: O(1) extra.",
      ],
    },
    {
      name: "Chinese Remainder Theorem (Inverse Modulo based implementation)",
      difficulty: "Easy",
      variation: "Coprime moduli, modular-inverse construction",
      question: [
        "Same task as before: given pairwise coprime moduli num[] and residues rem[], find the smallest non-negative x with x % num[i] == rem[i] for all i. This time the moduli are large, so the previous linear walk is too slow. Build the answer with extended Euclid and modular inverses instead, in O(k log M) time.",
        "Example 1:\nInput: num = [3, 4, 5], rem = [2, 3, 1]\nOutput: 11\nExplanation: 11 is congruent to 2, 3 and 1 modulo 3, 4 and 5 respectively.",
        "Example 2:\nInput: num = [7, 13, 17], rem = [3, 5, 7]\nOutput: 1214\nExplanation: 1214 = 7 * 173 + 3, 1214 = 13 * 93 + 5, and 1214 = 17 * 71 + 7. The modulus of the combined congruence is 7 * 13 * 17 = 1547.",
        "Constraints:\n- 1 <= k <= 20\n- 1 <= num[i] <= 10^9, all num[i] pairwise coprime\n- 0 <= rem[i] < num[i]\n- The product of all num[i] fits in a signed 64-bit integer",
      ],
      code: `long long extgcd(long long a, long long b, long long& x, long long& y) {
    if (b == 0) { x = 1; y = 0; return a; }
    long long x1, y1;
    long long g = extgcd(b, a % b, x1, y1);
    x = y1;
    y = x1 - (a / b) * y1;   // unwind Bezout coefficients
    return g;
}

long long modInverse(long long a, long long m) {
    long long x, y;
    extgcd(((a % m) + m) % m, m, x, y);
    return ((x % m) + m) % m;
}

long long crtCoprime(vector<long long>& num, vector<long long>& rem) {
    long long r = ((rem[0] % num[0]) + num[0]) % num[0];
    long long m = num[0];
    for (size_t i = 1; i < num.size(); i++) {
        // want r + m * t == rem[i] (mod num[i]); solve for t
        long long inv = modInverse(m % num[i], num[i]);
        long long diff = ((rem[i] - r) % num[i] + num[i]) % num[i];
        long long t = (long long)((__int128)diff * inv % num[i]);
        r = (long long)(r + (__int128)m * t);   // still below m * num[i], so it fits
        m *= num[i];
    }
    return r;
}`,
      explanation: [
        "This is the same incremental merge as the naive template, but the search for the right lattice step t is replaced by an exact solve. Every solution of the first i congruences is r + m * t, so congruence i+1 becomes the linear congruence m * t == rem[i] - r (mod num[i]).",
        "Since gcd(m, num[i]) = 1 by pairwise coprimality, m has an inverse modulo num[i] and t is determined uniquely modulo num[i]. Extended Euclid produces that inverse in O(log num[i]) from the Bezout identity m * x + num[i] * y = 1, which read modulo num[i] says m * x == 1.",
        "Taking t in [0, num[i]) keeps r inside [0, m * num[i]), which is exactly the smallest non-negative representative of the merged congruence - no final reduction is needed.",
        "The classic textbook formula, x = sum over i of rem[i] * (M / num[i]) * inverse(M / num[i], num[i]) modulo M with M the full product, computes the same value. The incremental form is preferred in practice because it never forms an intermediate product larger than the final modulus, and it degrades gracefully into the non-coprime merge.",
        "The intermediate multiplication m * t can reach the size of the final modulus, so it is done in __int128 even though the result fits in 64 bits. Skipping that cast is the single most common source of wrong answers here.",
        "Time: O(k log M). Space: O(log M) for the recursion.",
      ],
    },
    {
      name: "Biorhythms",
      difficulty: "Easy",
      variation: "Three fixed coprime moduli, shifted start day",
      link: "http://poj.org/problem?id=1006",
      question: [
        "A person has three cycles: physical of length 23 days, emotional of length 28 days and intellectual of length 33 days. Each cycle peaks once per period. Given the day numbers p, e and i on which the three cycles most recently peaked, and the current day number d, print the number of days from day d until the next day on which all three cycles peak simultaneously. The answer is strictly positive, so if all three peak on day d itself the next triple peak is a full period away.",
        "The input contains several test cases, one per line, each holding p, e, i and d. A line of four values equal to -1 ends the input. For test case number c print: Case c: the next triple peak occurs in N days.",
        "Example 1:\nInput:\n0 0 0 0\n0 0 0 100\n-1 -1 -1 -1\nOutput:\nCase 1: the next triple peak occurs in 21252 days.\nCase 2: the next triple peak occurs in 21152 days.\nExplanation: 23 * 28 * 33 = 21252, so the triple peak on day 0 recurs on day 21252. From day 100 the same target is 21152 days away.",
        "Example 2:\nInput:\n5 20 34 325\n-1 -1 -1 -1\nOutput:\nCase 1: the next triple peak occurs in 19575 days.\nExplanation: Day 325 + 19575 = 19900, and 19900 % 23 = 5, 19900 % 28 = 20, 19900 % 33 = 1 = 34 % 33.",
        "Constraints:\n- 0 <= p, e, i <= 365\n- 0 <= d <= 365\n- At most 100 test cases",
      ],
      code: `long long extgcd(long long a, long long b, long long& x, long long& y) {
    if (b == 0) { x = 1; y = 0; return a; }
    long long x1, y1;
    long long g = extgcd(b, a % b, x1, y1);
    x = y1;
    y = x1 - (a / b) * y1;
    return g;
}

long long modInverse(long long a, long long m) {
    long long x, y;
    extgcd(((a % m) + m) % m, m, x, y);
    return ((x % m) + m) % m;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const long long PERIOD = 23LL * 28LL * 33LL;   // 21252, the combined modulus
    long long p, e, i, d;
    int tc = 0;
    while (cin >> p >> e >> i >> d) {
        if (p == -1 && e == -1 && i == -1 && d == -1) break;
        vector<long long> num = {23, 28, 33};
        vector<long long> rem = {p % 23, e % 28, i % 33};
        long long r = rem[0], m = num[0];
        for (int j = 1; j < 3; j++) {
            long long inv = modInverse(m % num[j], num[j]);
            long long diff = ((rem[j] - r) % num[j] + num[j]) % num[j];
            long long t = diff * inv % num[j];
            r = r + m * t;
            m *= num[j];
        }
        long long k = ((r - d) % PERIOD + PERIOD) % PERIOD;
        if (k == 0) k = PERIOD;   // answer must be strictly positive
        cout << "Case " << ++tc << ": the next triple peak occurs in " << k
             << " days.\\n";
    }
    return 0;
}`,
      explanation: [
        "A triple peak happens on absolute day x exactly when x is congruent to p modulo 23, to e modulo 28 and to i modulo 33. Since 23, 28 and 33 are pairwise coprime, CRT collapses those three conditions into a single congruence x == r (mod 21252).",
        "The answer is not r itself but the distance from the current day, so reduce r - d into [0, 21252). The only subtlety is the day-0 case: a difference of zero means today is a triple peak, and the statement asks for the next one, so it is bumped to a full period.",
        "The reduction of the input residues modulo their own cycle length matters, because p, e and i may exceed the cycle lengths - in the second example i = 34 is really the residue 1 modulo 33. Forgetting that reduction is the standard wrong answer on this problem.",
        "Because the moduli are fixed and tiny, the naive lattice walk from the previous problems would also be fast enough; the inverse-based merge is shown to keep the pattern uniform.",
        "Time: O(1) per test case. Space: O(1).",
      ],
    },
    {
      name: "Throne",
      difficulty: "Medium",
      variation: "One linear congruence, gcd solvability test",
      link: "https://atcoder.jp/contests/abc186/tasks/abc186_e",
      question: [
        "There are N chairs arranged in a circle, numbered 0 to N-1 clockwise, and chair 0 is the throne. Takahashi starts on chair S. In one move he walks K chairs clockwise. Find the minimum number of moves needed to land exactly on the throne, or report -1 if he can never reach it. Solve T independent test cases.",
        "Landing on the throne after k moves means S + k * K is a multiple of N, so you must find the smallest non-negative k with K * k congruent to -S modulo N.",
        "Example 1:\nInput:\n1\n10 4 3\nOutput:\n2\nExplanation: Starting at chair 4 and stepping 3 chairs at a time gives chair 7 then chair 0, so two moves.",
        "Example 2:\nInput:\n1\n1000 11 2\nOutput:\n-1\nExplanation: K = 2 and N = 1000 are both even so every reachable chair keeps the parity of S = 11, which is odd, while the throne is chair 0. Formally gcd(2, 1000) = 2 does not divide 11.",
        "Constraints:\n- 1 <= T <= 100\n- 2 <= N <= 10^9\n- 1 <= S < N\n- 1 <= K <= 10^9",
      ],
      code: `long long extgcd(long long a, long long b, long long& x, long long& y) {
    if (b == 0) { x = 1; y = 0; return a; }
    long long x1, y1;
    long long g = extgcd(b, a % b, x1, y1);
    x = y1;
    y = x1 - (a / b) * y1;
    return g;
}

long long modInverse(long long a, long long m) {
    long long x, y;
    extgcd(((a % m) + m) % m, m, x, y);
    return ((x % m) + m) % m;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int T;
    cin >> T;
    while (T--) {
        long long N, S, K;
        cin >> N >> S >> K;
        long long g = gcd(K, N);
        if (S % g != 0) {          // -S is not in the subgroup generated by K
            cout << -1 << "\\n";
            continue;
        }
        long long mod = N / g;     // after dividing out g the coefficient is invertible
        long long inv = modInverse((K / g) % mod, mod);
        long long rhs = ((-(S / g)) % mod + mod) % mod;
        long long k = (long long)((__int128)rhs * inv % mod);
        cout << k << "\\n";
    }
    return 0;
}`,
      explanation: [
        "This is the single-congruence primitive that every CRT merge is built on: solve a * x == b (mod n) for the smallest non-negative x. Here a = K, b = -S and n = N.",
        "Let g = gcd(a, n). The set of values a * x modulo n is exactly the multiples of g, so the congruence is solvable if and only if g divides b. When it does, dividing the whole congruence by g gives (a/g) * x == (b/g) (mod n/g) with a/g now coprime to n/g, hence invertible, and x is unique modulo n/g.",
        "The trap is dividing only the two sides and leaving the modulus at N. That produces a value that satisfies the scaled congruence but not the original one, and it also loses the fact that the true answer is unique modulo N/g rather than modulo N - so it can return a k that is g times too large.",
        "Careless use of the modulo operator on the negative right-hand side is the other frequent bug: in C++ (-S) % mod can be negative, so it must be normalized before multiplying by the inverse.",
        "Time: O(log N) per test case. Space: O(log N) recursion.",
      ],
    },
    {
      name: "C Looooops",
      difficulty: "Medium",
      variation: "Linear congruence modulo a power of two",
      link: "http://poj.org/problem?id=2115",
      question: [
        "Consider the C loop 'for (variable = A; variable != B; variable += C)' where variable is an unsigned integer of k bits, so all arithmetic is done modulo 2^k. Given A, B, C and k, determine how many times the loop body executes, or report that the loop never terminates. Each test case is a line with A, B, C and k; a line of four zeros ends the input.",
        "Print the number of iterations, or the word FOREVER if the loop does not terminate.",
        "Example 1:\nInput:\n3 7 2 16\n7 3 2 16\n0 0 0 0\nOutput:\n2\n32766\nExplanation: From 3 with step 2 the variable takes values 5 then 7, so two iterations. From 7 it must wrap all the way around modulo 65536, which takes 32766 steps.",
        "Example 2:\nInput:\n3 4 2 16\n0 0 0 0\nOutput:\nFOREVER\nExplanation: 3 is odd and the step 2 is even, so the variable stays odd forever and never equals 4. Formally gcd(2, 65536) = 2 does not divide 4 - 3 = 1.",
        "Constraints:\n- 0 <= A, B < 2^k\n- 1 <= C < 2^k\n- 1 <= k <= 32",
      ],
      code: `long long extgcd(long long a, long long b, long long& x, long long& y) {
    if (b == 0) { x = 1; y = 0; return a; }
    long long x1, y1;
    long long g = extgcd(b, a % b, x1, y1);
    x = y1;
    y = x1 - (a / b) * y1;
    return g;
}

long long modInverse(long long a, long long m) {
    long long x, y;
    extgcd(((a % m) + m) % m, m, x, y);
    return ((x % m) + m) % m;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    long long A, B, C, k;
    while (cin >> A >> B >> C >> k) {
        if (A == 0 && B == 0 && C == 0 && k == 0) break;
        long long M = 1LL << k;                  // k can be 32, so 64-bit shift
        long long b = ((B - A) % M + M) % M;     // solve C * x == b (mod M)
        long long g = gcd(C, M);
        if (b % g != 0) {
            cout << "FOREVER" << "\\n";
            continue;
        }
        long long mod = M / g;
        long long inv = modInverse((C / g) % mod, mod);
        long long x = (long long)((__int128)(b / g % mod) * inv % mod);
        cout << x << "\\n";
    }
    return 0;
}`,
      explanation: [
        "The loop counter after x iterations equals A + C * x reduced modulo 2^k, so termination means C * x == B - A (mod 2^k) and the answer is the smallest non-negative solution x - exactly the primitive from the previous problem with n a power of two.",
        "Here g = gcd(C, 2^k) is just the largest power of two dividing C, so the solvability test reads: the loop terminates if and only if the number of trailing zero bits of C is at most the number of trailing zero bits of B - A taken modulo 2^k. That gives a nice bit-level intuition for why gcd divisibility is the right condition.",
        "Two arithmetic traps dominate here. First, k can be 32, so 1 << k must be a 64-bit shift or M silently becomes 0 or negative. Second, B - A can be negative and must be normalized into [0, M) before the divisibility test, otherwise the sign of the C++ remainder corrupts the result.",
        "Note that the answer counts iterations and can be as large as 2^31, so it does not fit comfortably in an int on a 16-bit-int compiler and should be kept in 64-bit throughout.",
        "Time: O(k) per test case. Space: O(k) recursion.",
      ],
    },
    {
      name: "Remainders Game",
      difficulty: "Medium",
      variation: "Deciding when residues determine a value (CRT converse)",
      link: "https://codeforces.com/problemset/problem/687/B",
      question: [
        "Arya and Pari play the following game. Pari picks a secret positive integer x and tells Arya only the value of k and a list of n integers c1..cn. Arya may ask for the value of x modulo any of the ci she likes, and she wants to be able to determine x modulo k with certainty no matter what x is. Decide whether that is always possible: print Yes if knowing x modulo every ci always pins down x modulo k, and No otherwise.",
        "Example 1:\nInput:\n4 5\n2 3 5 12\nOutput:\nYes\nExplanation: One of the given moduli is 5 itself, so x modulo 5 is known outright.",
        "Example 2:\nInput:\n2 7\n2 3\nOutput:\nNo\nExplanation: x = 0 and x = 42 agree modulo 2 and modulo 3 but differ modulo 7, so the residues 0 and 0 do not determine x modulo 7.",
        "Constraints:\n- 1 <= n, k <= 10^6\n- 1 <= ci <= 10^6",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    long long n, k;
    cin >> n >> k;
    long long acc = 1;                 // lcm of gcd(ci, k), always a divisor of k
    for (long long i = 0; i < n; i++) {
        long long c;
        cin >> c;
        long long d = gcd(c, k);       // only the part of c that is shared with k matters
        acc = acc / gcd(acc, d) * d;   // acc divides k, so this never overflows
    }
    cout << (acc == k ? "Yes" : "No") << "\\n";
    return 0;
}`,
      explanation: [
        "Knowing x modulo every ci is exactly knowing x modulo L = lcm(c1..cn), because CRT says the intersection of those congruences is a single congruence modulo L, and nothing finer can be deduced. So the question is whether x mod L determines x mod k, which happens if and only if k divides L.",
        "For the No direction, if k does not divide L then x = 0 and x = L are indistinguishable from the answers Arya receives yet differ modulo k, which is the counterexample the second sample shows with L = 6 and k = 7.",
        "Computing L directly is impossible - it can be astronomically large - so replace each ci by gcd(ci, k). Divisibility of k by L is a statement about each prime power p^e exactly dividing k, namely that some ci is divisible by p^e, and gcd(ci, k) preserves the p-adic valuation of ci capped at e. That is all the test needs.",
        "The payoff is that the running accumulator always divides k, so it stays below 10^6 and the lcm step cannot overflow. Computing the true lcm with a big-integer type, or with a saturating cap, is the tempting but unnecessary route.",
        "Time: O(n log k). Space: O(1).",
      ],
    },
    {
      name: "Strange Way to Express Integers",
      difficulty: "Medium",
      variation: "Non-coprime moduli, pairwise merge with -1 detection",
      link: "http://poj.org/problem?id=2891",
      question: [
        "A positive integer m can be described by a list of pairs (a1, r1), ..., (ak, rk) meaning m % ai == ri for each i. Given such a list, recover the smallest positive integer m that is described by it, or print -1 if no such integer exists. The moduli ai are not assumed to be pairwise coprime, which is what makes the general theorem necessary. The input contains several test cases, each starting with k followed by k lines holding ai and ri.",
        "Example 1:\nInput:\n2\n8 7\n11 9\nOutput:\n31\nExplanation: 31 = 8 * 3 + 7 and 31 = 11 * 2 + 9. The combined congruence is m == 31 (mod 88).",
        "Example 2:\nInput:\n2\n4 1\n6 2\nOutput:\n-1\nExplanation: The first congruence forces m to be odd and the second forces it to be even. gcd(4, 6) = 2 does not divide 2 - 1 = 1, so the pair is inconsistent.",
        "Constraints:\n- 1 <= k <= 1000\n- 1 <= ai <= 10^9\n- 0 <= ri < ai\n- The lcm of all ai fits in a signed 64-bit integer",
      ],
      code: `long long extgcd(long long a, long long b, long long& x, long long& y) {
    if (b == 0) { x = 1; y = 0; return a; }
    long long x1, y1;
    long long g = extgcd(b, a % b, x1, y1);
    x = y1;
    y = x1 - (a / b) * y1;
    return g;
}

// Merge x == r1 (mod m1) and x == r2 (mod m2). Returns {r, lcm}, or {0, -1} if impossible.
pair<long long, long long> crtMerge(long long r1, long long m1, long long r2, long long m2) {
    long long p, q;
    long long g = extgcd(m1, m2, p, q);
    long long diff = r2 - r1;
    if (diff % g != 0) return {0, -1};        // Bezout obstruction
    long long lcm = m1 / g * m2;
    long long m2g = m2 / g;
    // t == (diff / g) * inverse(m1 / g) (mod m2 / g); p is that inverse already
    long long t = (long long)((__int128)(diff / g % m2g) * (p % m2g) % m2g);
    long long r = (long long)(((__int128)r1 + (__int128)m1 * t) % lcm);
    if (r < 0) r += lcm;
    return {r, lcm};
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int k;
    while (cin >> k) {
        long long r = 0, m = 1;
        bool ok = true;
        for (int i = 0; i < k; i++) {
            long long a, rem;
            cin >> a >> rem;
            if (!ok) continue;                 // keep consuming the rest of the input
            auto res = crtMerge(r, m, rem % a, a);
            if (res.second == -1) { ok = false; continue; }
            r = res.first;
            m = res.second;
        }
        if (!ok) cout << -1 << "\\n";
        else cout << (r == 0 ? m : r) << "\\n";   // smallest positive, not smallest non-negative
    }
    return 0;
}`,
      explanation: [
        "Drop the coprimality assumption and the merge becomes a linear congruence with a gcd. Solutions of x == r1 (mod m1) have the form r1 + m1 * t, so the second congruence reads m1 * t == r2 - r1 (mod m2), which is solvable exactly when g = gcd(m1, m2) divides r2 - r1. This divisibility test is the general CRT consistency condition, and it is what the coprime version never has to check.",
        "When it holds, t is unique modulo m2 / g, so x is unique modulo m1 * (m2 / g) = lcm(m1, m2). That is the key structural fact: merging two congruences always yields one congruence, but with the lcm as the new modulus rather than the product.",
        "Extended Euclid on (m1, m2) hands over the Bezout coefficient p with m1 * p + m2 * q = g, and reading that modulo m2 / g shows p is the inverse of m1 / g there - so no separate inverse computation is needed.",
        "Overflow is the real difficulty. The lcm can approach 10^18, so the products m1 * t and (diff / g) * p are formed in __int128; reducing diff / g and p modulo m2 / g first keeps the intermediates as small as possible. Writing lcm as m1 * m2 / g instead of m1 / g * m2 overflows for large inputs.",
        "This problem asks for the smallest positive m, so an all-zero-residue input must report the lcm rather than 0. That single edge case is the classic wrong answer here.",
        "Time: O(k log(max ai)). Space: O(log(max ai)) recursion.",
      ],
    },
    {
      name: "Oversleeping",
      difficulty: "Hard",
      variation: "Enumerate residue windows, CRT each pair",
      link: "https://atcoder.jp/contests/abc193/tasks/abc193_e",
      question: [
        "A tram shuttles between town A and town B. Starting at time 0 it departs A, takes X seconds to reach B, stops there for Y seconds, departs, takes X seconds back to A, stops for Y seconds, and repeats forever. Takahashi sleeps for P seconds then stays awake for Q seconds, repeating, and he is asleep at time 0. He gets off the tram at the first integer time at which the tram is stopped at town B and he is awake. Find that time, or report that it never happens. Solve T test cases.",
        "The tram is stopped at B for times t whose residue modulo 2 * (X + Y) lies in [X, X + Y), and Takahashi is awake for times t whose residue modulo P + Q lies in [P, P + Q). Print the minimum such t, or the word infinity.",
        "Example 1:\nInput:\n1\n5 2 7 6\nOutput:\n20\nExplanation: The tram sits at B when t modulo 14 is 5 or 6, and Takahashi is awake when t modulo 13 is one of 7..12. The first t meeting both is 20, since 20 modulo 14 = 6 and 20 modulo 13 = 7.",
        "Example 2:\nInput:\n1\n1 1 3 1\nOutput:\ninfinity\nExplanation: The tram is at B only when t modulo 4 = 1, and Takahashi is awake only when t modulo 4 = 3, so the two conditions are never satisfied together.",
        "Constraints:\n- 1 <= T <= 20\n- 1 <= X, P <= 10^9\n- 1 <= Y, Q <= 500",
      ],
      code: `long long extgcd(long long a, long long b, long long& x, long long& y) {
    if (b == 0) { x = 1; y = 0; return a; }
    long long x1, y1;
    long long g = extgcd(b, a % b, x1, y1);
    x = y1;
    y = x1 - (a / b) * y1;
    return g;
}

pair<long long, long long> crtMerge(long long r1, long long m1, long long r2, long long m2) {
    long long p, q;
    long long g = extgcd(m1, m2, p, q);
    long long diff = r2 - r1;
    if (diff % g != 0) return {0, -1};
    long long lcm = m1 / g * m2;
    long long m2g = m2 / g;
    long long t = (long long)((__int128)(diff / g % m2g) * (p % m2g) % m2g);
    long long r = (long long)(((__int128)r1 + (__int128)m1 * t) % lcm);
    if (r < 0) r += lcm;
    return {r, lcm};
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int T;
    cin >> T;
    while (T--) {
        long long X, Y, P, Q;
        cin >> X >> Y >> P >> Q;
        long long M1 = 2 * (X + Y), M2 = P + Q;
        long long best = -1;
        for (long long i = X; i < X + Y; i++) {          // at most 500 stop seconds
            for (long long j = P; j < P + Q; j++) {      // at most 500 awake seconds
                auto res = crtMerge(i, M1, j, M2);
                if (res.second == -1) continue;          // this residue pair is impossible
                if (best < 0 || res.first < best) best = res.first;
            }
        }
        if (best < 0) cout << "infinity" << "\\n";
        else cout << best << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Both conditions are periodic, but neither is a single congruence - each is a window of consecutive residues. The whole trick is that the windows are tiny: Y and Q are at most 500, so there are at most 250000 residue pairs, and each pair is one ordinary two-congruence CRT.",
        "For a fixed pair (i, j) the constraints t == i (mod 2(X+Y)) and t == j (mod P+Q) either have no solution, detected by the gcd divisibility test, or have a unique smallest non-negative solution. Taking the minimum over all feasible pairs gives the answer, and the answer is infinity precisely when every pair is infeasible.",
        "Non-coprime merging is unavoidable here: 2(X+Y) and P+Q routinely share factors, and the second sample is exactly the case where the shared factor makes every pair inconsistent. A coprime-only CRT would produce nonsense instead of infinity.",
        "The smallest solution can reach the lcm of the two periods, about 4 * 10^18 as in the extreme case X = 999999999, Y = 1, P = 10^9, Q = 1 whose answer is 1000000000999999999. Every product inside the merge therefore needs __int128, and the answer itself only just fits in a signed 64-bit integer.",
        "A tempting shortcut is to search t forward second by second, or to fix only the tram residue and try to slide the awake window; neither bounds the search, because the first valid time can be astronomically large while both windows stay small.",
        "Time: O(T * Y * Q * log(max period)). Space: O(1) beyond recursion.",
      ],
    },
    {
      name: "Two Arithmetic Progressions",
      difficulty: "Hard",
      variation: "Merge two progressions, then count in a range",
      link: "https://codeforces.com/problemset/problem/710/D",
      question: [
        "You are given six integers a1, b1, a2, b2, L and R. Count the integers x with L <= x <= R that can be written both as x = a1 * k + b1 for some integer k >= 0 and as x = a2 * l + b2 for some integer l >= 0.",
        "Note the two-sided nature of the condition: x must satisfy the congruences x == b1 (mod a1) and x == b2 (mod a2), and it must also be at least b1 and at least b2, because the progression indices are non-negative.",
        "Example 1:\nInput: a1 = 2, b1 = 0, a2 = 3, b2 = 3, L = 5, R = 21\nOutput: 3\nExplanation: The first progression is the even numbers from 0 up and the second is 3, 6, 9, ..., so the common values are the multiples of 6 that are at least 3. Inside [5, 21] those are 6, 12 and 18.",
        "Example 2:\nInput: a1 = 2, b1 = 4, a2 = 3, b2 = 0, L = 6, R = 17\nOutput: 2\nExplanation: The common values are the multiples of 6 that are at least 4, and inside [6, 17] those are 6 and 12.",
        "Constraints:\n- 0 < a1, a2 <= 2 * 10^9\n- -2 * 10^9 <= b1, b2, L, R <= 2 * 10^9\n- L <= R",
      ],
      code: `long long extgcd(long long a, long long b, long long& x, long long& y) {
    if (b == 0) { x = 1; y = 0; return a; }
    long long x1, y1;
    long long g = extgcd(b, a % b, x1, y1);
    x = y1;
    y = x1 - (a / b) * y1;
    return g;
}

pair<long long, long long> crtMerge(long long r1, long long m1, long long r2, long long m2) {
    long long p, q;
    long long g = extgcd(m1, m2, p, q);
    long long diff = r2 - r1;
    if (diff % g != 0) return {0, -1};
    long long lcm = m1 / g * m2;
    long long m2g = m2 / g;
    long long t = (long long)((__int128)(diff / g % m2g) * (p % m2g) % m2g);
    long long r = (long long)(((__int128)r1 + (__int128)m1 * t) % lcm);
    if (r < 0) r += lcm;
    return {r, lcm};
}

// floor division that also works when the dividend is negative
__int128 floorDiv(__int128 a, __int128 b) {
    __int128 q = a / b;
    if (a % b != 0 && ((a < 0) != (b < 0))) q--;
    return q;
}

long long countCommon(long long a1, long long b1, long long a2, long long b2,
                      long long L, long long R) {
    auto res = crtMerge(((b1 % a1) + a1) % a1, a1, ((b2 % a2) + a2) % a2, a2);
    if (res.second == -1) return 0;
    long long r = res.first, M = res.second;
    long long lo = max(L, max(b1, b2));     // non-negative indices force this floor
    if (lo > R) return 0;
    __int128 cnt = floorDiv((__int128)R - r, M) - floorDiv((__int128)lo - 1 - r, M);
    return (long long)cnt;
}`,
      explanation: [
        "Membership in an arithmetic progression splits into two independent facts: a congruence and a lower bound. The congruences x == b1 (mod a1) and x == b2 (mod a2) merge by general CRT into a single x == r (mod M) with M = lcm(a1, a2), or are inconsistent, in which case the answer is 0.",
        "The lower bounds are what the CRT alone cannot express. Because k and l are required to be non-negative, x cannot be smaller than b1 or b2, so the effective interval is [max(L, b1, b2), R] and the count is the number of members of one residue class in that interval.",
        "Counting members of a residue class in an interval is floor((R - r) / M) - floor((lo - 1 - r) / M), but only if the division truly floors. C++ integer division truncates toward zero, which is wrong for negative numerators, and the numerators here genuinely go negative since L and r can be on opposite sides of zero. A custom floorDiv is not optional.",
        "Ranges make this delicate: M can be near 4 * 10^18, and R - r can approach 6 * 10^18, which overflows a signed 64-bit integer. Doing the counting arithmetic in __int128 removes the whole class of overflow bugs. The lcm itself is safe only if written m1 / g * m2.",
        "The naive approach of iterating over one progression fails immediately, since a progression can hold billions of terms inside the range.",
        "Time: O(log(min(a1, a2))). Space: O(log(min(a1, a2))) recursion.",
      ],
    },
    {
      name: "GCD Table",
      difficulty: "Hard",
      variation: "CRT to place a gcd pattern, with lcm as the row index",
      link: "https://codeforces.com/problemset/problem/338/D",
      question: [
        "Consider the n by m table G whose entry in row i and column j, both 1-indexed, is gcd(i, j). Given a sequence a1..ak, decide whether that sequence occurs somewhere as k horizontally consecutive entries of the table: whether there are indices i and j with 1 <= i <= n, 1 <= j and j + k - 1 <= m such that gcd(i, j + t - 1) = at for every t from 1 to k. If such a placement exists print YES on one line and then i and j; otherwise print NO.",
        "The first line holds n, m and k. The second line holds a1..ak.",
        "Example 1:\nInput:\n100 100 5\n5 2 1 2 1\nOutput:\nYES\n10 5\nExplanation: With i = 10 and j = 5 the row entries are gcd(10,5) = 5, gcd(10,6) = 2, gcd(10,7) = 1, gcd(10,8) = 2, gcd(10,9) = 1, matching the sequence.",
        "Example 2:\nInput:\n100 8 5\n5 2 1 2 1\nOutput:\nNO\nExplanation: The only column start consistent with the congruences is j = 5, and then j + k - 1 = 9 exceeds m = 8.",
        "Constraints:\n- 1 <= n, m <= 10^12\n- 1 <= k <= 10^4\n- 1 <= at <= 10^12",
      ],
      code: `long long extgcd(long long a, long long b, long long& x, long long& y) {
    if (b == 0) { x = 1; y = 0; return a; }
    long long x1, y1;
    long long g = extgcd(b, a % b, x1, y1);
    x = y1;
    y = x1 - (a / b) * y1;
    return g;
}

pair<long long, long long> crtMerge(long long r1, long long m1, long long r2, long long m2) {
    long long p, q;
    long long g = extgcd(m1, m2, p, q);
    long long diff = r2 - r1;
    if (diff % g != 0) return {0, -1};
    long long lcm = m1 / g * m2;
    long long m2g = m2 / g;
    long long t = (long long)((__int128)(diff / g % m2g) * (p % m2g) % m2g);
    long long r = (long long)(((__int128)r1 + (__int128)m1 * t) % lcm);
    if (r < 0) r += lcm;
    return {r, lcm};
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    long long n, m, k;
    cin >> n >> m >> k;
    vector<long long> a(k);
    for (long long t = 0; t < k; t++) cin >> a[t];

    long long L = 1;                             // row index must be the lcm of all at
    for (long long t = 0; t < k; t++) {
        long long g = gcd(L, a[t]);
        if (L / g > n / a[t]) { cout << "NO" << "\\n"; return 0; }   // overflow-safe bound test
        L = L / g * a[t];
    }

    long long r = 0, M = 1;
    for (long long t = 0; t < k; t++) {
        long long rt = ((1 - (t + 1)) % a[t] + a[t]) % a[t];   // j == 1 - t (mod at)
        auto res = crtMerge(r, M, rt, a[t]);
        if (res.second == -1) { cout << "NO" << "\\n"; return 0; }
        r = res.first;
        M = res.second;
    }

    long long j = (r == 0 ? M : r);              // smallest positive column start
    if (j > m || j + k - 1 > m) { cout << "NO" << "\\n"; return 0; }
    for (long long t = 0; t < k; t++) {
        if (gcd(L, j + t) != a[t]) { cout << "NO" << "\\n"; return 0; }
    }
    cout << "YES" << "\\n" << L << " " << j << "\\n";
    return 0;
}`,
      explanation: [
        "Two reductions turn this into a CRT problem. First the row: gcd(i, j + t - 1) = at forces at to divide i for every t, so i must be a multiple of L = lcm(a1..ak). Choosing i = L loses nothing, because if some multiple i works then at divides gcd(L, j + t - 1) and that gcd also divides gcd(i, j + t - 1) = at, forcing equality. If L exceeds n there is no valid row at all.",
        "Second the column: at divides j + t - 1 means j == 1 - t (mod at). Merging those k congruences with the general non-coprime CRT gives j == r (mod M) where M is exactly L, the same lcm. An inconsistency here - two indices demanding incompatible parities, say - immediately means NO.",
        "The congruences are only necessary, not sufficient: they guarantee at divides gcd(L, j + t - 1) but not equality. So the candidate must be verified. One candidate suffices, because gcd(L, j + t - 1) depends only on j + t - 1 modulo L and M equals L, so every j in the residue class produces the identical multiset of gcd values. Testing the smallest positive j is therefore both necessary and sufficient, and it also gives the best chance of fitting inside m.",
        "Overflow control matters more than the theory. L can blow past 10^12 within a few terms, so the lcm loop bails out using the division test L / g > n / at rather than multiplying first, which would wrap around silently and produce a bogus YES.",
        "The wrong-but-tempting approach is to pick i as the product of the at values, or to skip the final verification because the congruences look sufficient. The second one breaks on a = [2, 1, 1, 1, 3]: the congruences merge cleanly to j == 2 (mod 6), yet with i = 6 the second entry is gcd(6, 3) = 3 while a2 = 1, so the true answer is NO.",
        "Time: O(k log(max at)) for the merges plus O(k log) for the verification. Space: O(k).",
      ],
    },
  ],
};
