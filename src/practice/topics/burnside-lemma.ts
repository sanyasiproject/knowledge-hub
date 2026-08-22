import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Counting Necklaces",
      difficulty: "Easy",
      variation: "Cyclic group, rotations only - the template",
      link: "https://cses.fi/problemset/task/2209",
      question: [
        "A necklace consists of n pearls arranged in a circle, and each pearl is painted with one of m colours. Two necklaces are considered the same if one can be turned into the other by rotating it. Count the number of distinct necklaces modulo 10^9+7.",
        "Example 1:\nInput: n = 3, m = 2\nOutput: 4\nExplanation: With colours A and B the distinct necklaces are AAA, AAB, ABB, BBB. The string ABA is just a rotation of AAB, so it is not counted again.",
        "Example 2:\nInput: n = 4, m = 2\nOutput: 6\nExplanation: AAAA, AAAB, AABB, ABAB, ABBB, BBBB. Note that AABB and ABAB are different necklaces - no rotation maps one to the other.",
        "Constraints:\n- 1 <= n <= 10^6\n- 1 <= m <= 10^6",
      ],
      code: `const long long MOD = 1000000007;

long long pw(long long b, long long e) {
    long long r = 1;
    b %= MOD;
    while (e > 0) {
        if (e & 1) r = r * b % MOD;
        b = b * b % MOD;
        e >>= 1;
    }
    return r;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    long long n, m;
    cin >> n >> m;
    long long sum = 0;
    for (long long i = 0; i < n; i++) {
        // rotation by i splits the circle into gcd(i, n) cycles, each free to take any colour
        sum = (sum + pw(m, gcd(i, n))) % MOD;
    }
    cout << sum * pw(n, MOD - 2) % MOD << "\\n";
    return 0;
}`,
      explanation: [
        "The group acting on the colourings is the cyclic group of the n rotations. Burnside's lemma says the number of orbits (distinct necklaces) equals the average number of colourings left unchanged by a single group element: answer = (1/|G|) * sum over g of Fix(g).",
        "Fix(g) for the rotation by i positions is easy to count. That rotation, viewed as a permutation of the n positions, decomposes into exactly gcd(i, n) cycles of length n/gcd(i, n). A colouring is unchanged exactly when every position inside a cycle carries the same colour, so each cycle can be coloured independently: Fix(i) = m^gcd(i,n). The identity is i = 0, where gcd(0, n) = n and Fix = m^n, as expected.",
        "The tempting wrong answer is m^n / n. That only works when every orbit has full size n, which fails for any necklace with a period shorter than n - AAAA has an orbit of size 1, ABAB an orbit of size 2. Burnside is exactly the correction that makes the average work regardless of stabiliser sizes.",
        "Dividing by n is done with a modular inverse, which is safe here because n <= 10^6 is smaller than the prime modulus and therefore never congruent to 0. Grouping equal gcd values by divisors (sum over d | n of phi(n/d) * m^d) would cut the loop down further, and that becomes mandatory once n stops fitting in a loop.",
        "Time: O(n log n) - one gcd and one modular power per rotation. Space: O(1).",
      ],
    },
    {
      name: "Necklace of Beads",
      difficulty: "Medium",
      variation: "Dihedral group, fixed palette of 3 colours",
      link: "http://poj.org/problem?id=1286",
      question: [
        "Beads of red, blue or green colours are strung together into a circular necklace of n beads. Two necklaces are the same if one can be obtained from the other by rotating it, or by turning it over (a reflection) and then rotating it. Count the distinct necklaces. The input is a sequence of values of n, terminated by -1; print one count per line.",
        "Example 1:\nInput: 4\nOutput: 21\nExplanation: The 3^4 = 81 coloured circles collapse into 21 classes once the 8 symmetries of the square (4 rotations and 4 reflections) are treated as equivalences.",
        "Example 2:\nInput: 5\nOutput: 39\nExplanation: Rotations fix 3^5 + 4 * 3 = 255 colourings and the 5 reflections fix 5 * 3^3 = 135, giving (255 + 135) / 10 = 39.",
        "Constraints:\n- 0 <= n <= 24, and n = 0 has answer 0\n- exactly 3 colours\n- the answer fits in a signed 64-bit integer",
      ],
      code: `long long ipow(long long b, long long e) {
    long long r = 1;
    while (e > 0) {
        if (e & 1) r *= b;
        b *= b;
        e >>= 1;
    }
    return r;
}

int main() {
    long long n;
    while (cin >> n && n != -1) {
        if (n == 0) { cout << 0 << "\\n"; continue; }
        long long total = 0;
        for (long long i = 0; i < n; i++) total += ipow(3, gcd(i, n));   // rotations
        if (n % 2 == 1) {
            total += n * ipow(3, (n + 1) / 2);                             // axis through a bead and the opposite gap
        } else {
            // n/2 axes through two opposite beads, n/2 axes through two opposite gaps
            total += (n / 2) * (ipow(3, n / 2 + 1) + ipow(3, n / 2));
        }
        cout << total / (2 * n) << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Allowing the necklace to be flipped enlarges the group from the n rotations to the dihedral group of order 2n. Burnside still applies verbatim; only the list of group elements grows, so the total is divided by 2n instead of n.",
        "Counting cycles of a reflection is the whole trick. For odd n every one of the n axes passes through one bead and the midpoint of the opposite gap: one fixed point plus (n-1)/2 swapped pairs, so (n+1)/2 cycles and Fix = 3^((n+1)/2). For even n there are two flavours: n/2 axes through two opposite beads give 2 fixed points plus (n-2)/2 pairs, that is n/2 + 1 cycles, and n/2 axes through two opposite gaps give n/2 pairs and no fixed point, that is n/2 cycles.",
        "The classic mistake is dividing the rotation-only answer by 2. A necklace that is its own mirror image (any palindromic pattern) is not paired with a distinct partner, so halving over-collapses. Burnside handles symmetric and asymmetric necklaces uniformly because it averages fixed points rather than orbits.",
        "No modulus here, so the exact integer must fit: 3^24 is about 2.8 * 10^11, comfortable in a 64-bit integer but an overflow in a 32-bit one. The final division by 2n is guaranteed exact because a sum of fixed-point counts over a group is always |G| times an integer.",
        "Time: O(n log n) per query. Space: O(1).",
      ],
    },
    {
      name: "Let it Bead",
      difficulty: "Medium",
      variation: "Dihedral group, arbitrary number of colours",
      link: "http://poj.org/problem?id=2409",
      question: [
        "A bracelet is a circular string of s beads, each bead painted with one of c available colours. Two bracelets are equal if one can be rotated and/or flipped over to match the other. For each input pair c and s report how many different bracelets exist. The input ends with a line holding two zeros.",
        "Example 1:\nInput: c = 2, s = 6\nOutput: 13\nExplanation: The 6 rotations fix 2^6 + 2 + 2^2 + 2^3 + 2^2 + 2 = 84 colourings and the 6 reflections fix 3 * 2^4 + 3 * 2^3 = 72, so the answer is (84 + 72) / 12 = 13.",
        "Example 2:\nInput: c = 6, s = 2\nOutput: 21\nExplanation: With only two beads the group has 4 elements; rotations fix 6^2 + 6 = 42 and the two reflections fix 6^2 + 6 = 42, giving 84 / 4 = 21. That matches the 15 unordered pairs of distinct colours plus the 6 monochrome bracelets.",
        "Constraints:\n- 1 <= c <= 10\n- 1 <= s <= 10\n- the answer fits in a signed 64-bit integer",
      ],
      code: `long long ipow(long long b, long long e) {
    long long r = 1;
    while (e > 0) {
        if (e & 1) r *= b;
        b *= b;
        e >>= 1;
    }
    return r;
}

int main() {
    long long c, s;
    while (cin >> c >> s && (c != 0 || s != 0)) {
        long long total = 0;
        for (long long i = 0; i < s; i++) total += ipow(c, gcd(i, s));
        if (s % 2 == 1) total += s * ipow(c, (s + 1) / 2);
        else total += (s / 2) * (ipow(c, s / 2 + 1) + ipow(c, s / 2));
        cout << total / (2 * s) << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Structurally identical to the 3-colour necklace count, but writing it with c as a parameter is what makes the cycle-index view obvious: every group element contributes c raised to its number of cycles, and nothing else about the element matters.",
        "So the whole family of problems reduces to one table: cycles(rotation by i) = gcd(i, s); cycles(reflection) = (s+1)/2 for odd s, and either s/2 + 1 or s/2 for even s depending on whether the axis passes through beads or through gaps. Memorise that table and any rotation-or-reflection counting problem on a circle is a five-line loop.",
        "A subtle degenerate case worth checking by hand is s = 1 and s = 2, where the two reflection flavours coincide with rotations as permutations. Burnside does not care: group elements are counted with multiplicity, so listing the same permutation twice because it arises from two different symmetries is correct, not double counting.",
        "Time: O(s log s) per query. Space: O(1).",
      ],
    },
    {
      name: "Arif in Dhaka (First Love Part 2)",
      difficulty: "Medium",
      variation: "Rotation-only versus rotation-plus-reflection in one pass",
      question: [
        "Arif wants to make a chain of n beads using up to t colours. Report two numbers: the number of distinct necklaces, where two chains are the same only if one is a rotation of the other, and the number of distinct bracelets, where a chain may additionally be flipped over before matching. Read pairs n and t until end of input and print the two counts separated by a space.",
        "Example 1:\nInput: n = 6, t = 2\nOutput: 14 13\nExplanation: Rotations alone leave 84 / 6 = 14 classes. Adding the 6 reflections merges exactly one pair of mirror-image chains (AABAB with ABAAB read the other way round), leaving 13 bracelets.",
        "Example 2:\nInput: n = 4, t = 3\nOutput: 24 21\nExplanation: 96 / 4 = 24 necklaces, and (96 + 72) / 8 = 21 bracelets.",
        "Constraints:\n- 1 <= n <= 24\n- 1 <= t <= 10\n- the input guarantees both answers fit in a signed 64-bit integer",
      ],
      code: `long long ipow(long long b, long long e) {
    long long r = 1;
    while (e > 0) {
        if (e & 1) r *= b;
        b *= b;
        e >>= 1;
    }
    return r;
}

int main() {
    long long n, t;
    while (cin >> n >> t) {
        long long rot = 0;
        for (long long i = 0; i < n; i++) rot += ipow(t, gcd(i, n));
        long long refl = 0;
        if (n % 2 == 1) refl = n * ipow(t, (n + 1) / 2);
        else refl = (n / 2) * (ipow(t, n / 2 + 1) + ipow(t, n / 2));
        // the same rotation sum serves both answers - only the group being averaged over changes
        cout << rot / n << " " << (rot + refl) / (2 * n) << "\\n";
    }
    return 0;
}`,
      explanation: [
        "The two questions share all their work. Burnside over the cyclic group needs only the rotation sum; Burnside over the dihedral group needs that same sum plus the reflection sum, divided by 2n. Computing them together makes the relationship explicit: the bracelet count is never simply half the necklace count.",
        "Concretely, bracelets = (necklaces + refl/n) / 2, so the gap between the two answers is governed by how many colourings are fixed by some reflection - the self-mirror patterns. When t = 1 both answers are 1 and the reflection term carries all the weight.",
        "Two implementation traps: the counts are exact integers with no modulus, so 64-bit arithmetic is mandatory (t^n can reach 10^24 only outside the stated limits, but 10^10-scale intermediate sums are routine); and both divisions must be applied to the summed total, never term by term, since individual Fix values are not multiples of the group order.",
        "Time: O(n log n) per query. Space: O(1).",
      ],
    },
    {
      name: "Counting Grids",
      difficulty: "Medium",
      variation: "Rotation group of a square grid, huge exponents",
      link: "https://cses.fi/problemset/task/2210",
      question: [
        "Count the number of distinct n x n grids where each square is either black or white. Two grids are distinct if you cannot rotate one (by 0, 90, 180 or 270 degrees) to obtain the other. Print the answer modulo 10^9+7.",
        "Example 1:\nInput: n = 2\nOutput: 6\nExplanation: Of the 16 two-colour 2x2 grids, the 4 grids with exactly one black square are all rotations of each other and count once, and the 4 grids with two adjacent black squares likewise count once. Together with the all-white, all-black and the two diagonal grids that gives 1 + 1 + 1 + 1 + 1 + 1 = 6 classes.",
        "Example 2:\nInput: n = 3\nOutput: 140\nExplanation: (2^9 + 2 * 2^3 + 2^5) / 4 = (512 + 16 + 32) / 4 = 140. The centre cell is a fixed point of every rotation, which is why the exponents are rounded up rather than exact quarters.",
        "Constraints:\n- 1 <= n <= 10^6\n- the answer is required modulo 10^9+7",
      ],
      code: `const long long MOD = 1000000007;

long long pw(long long b, long long e) {
    long long r = 1;
    b %= MOD;
    while (e > 0) {
        if (e & 1) r = r * b % MOD;
        b = b * b % MOD;
        e >>= 1;
    }
    return r;
}

int main() {
    long long n;
    cin >> n;
    long long sq = n * n;                 // up to 10^12, so the exponent must be 64-bit
    long long id = pw(2, sq);              // identity: every cell free
    long long quarter = pw(2, (sq + 3) / 4);   // 90 and 270 degrees: ceil(sq/4) cycles
    long long half = pw(2, (sq + 1) / 2);      // 180 degrees: ceil(sq/2) cycles
    long long total = (id + 2 * quarter + half) % MOD;
    cout << total * pw(4, MOD - 2) % MOD << "\\n";
    return 0;
}`,
      explanation: [
        "The group has just four elements, so the only real work is counting cycles of each rotation on the n^2 cells. A 90-degree rotation moves cells in orbits of size 4, except that when n is odd the centre cell is alone; the cycle count is therefore ceil(n^2/4) in both parities, which the integer expression (n*n + 3) / 4 computes exactly. The 180-degree rotation pairs cells, giving ceil(n^2/2) cycles, again with the odd centre as the lone singleton.",
        "Rotation by 270 degrees has exactly the same cycle structure as rotation by 90 degrees, hence the factor 2 rather than a separately computed term. That is a general fact: for a rotation by k steps in a group of order g the number of cycles depends only on gcd(k, g).",
        "The traps are all arithmetic. n^2 reaches 10^12 so the exponent cannot be an int; the exponent must not be reduced modulo the prime (only Fermat reduction modulo p-1 would be valid, and there is no need for it since binary exponentiation handles 10^12 in 40 steps); and the division by 4 has to be a modular inverse, not integer division of a value already taken modulo p.",
        "Sanity checks that catch nearly every off-by-one here: n = 1 must give 2 and n = 2 must give 6.",
        "Time: O(log(n^2)). Space: O(1).",
      ],
    },
    {
      name: "The Colored Cubes",
      difficulty: "Medium",
      variation: "Rotation group of the cube acting on faces",
      question: [
        "Each of the six faces of a cube is painted with one of c available colours; a colour may be reused on any number of faces. Two painted cubes are considered the same if one can be rotated in space to look exactly like the other (reflections are not allowed, since a cube cannot be turned inside out). For each integer c in the input, print how many genuinely different cubes can be produced.",
        "Example 1:\nInput: c = 2\nOutput: 10\nExplanation: (2^6 + 3 * 2^4 + 12 * 2^3 + 8 * 2^2) / 24 = (64 + 48 + 96 + 32) / 24 = 10. Counting by the number of black faces gives 1 + 1 + 2 + 2 + 2 + 1 + 1 = 10, matching.",
        "Example 2:\nInput: c = 3\nOutput: 57\nExplanation: (729 + 243 + 324 + 72) / 24 = 1368 / 24 = 57.",
        "Constraints:\n- 1 <= c <= 1000\n- the answer fits in a signed 64-bit integer",
      ],
      code: `int main() {
    long long c;
    while (cin >> c) {
        long long c2 = c * c, c3 = c2 * c, c4 = c3 * c, c6 = c3 * c3;
        // cycle index of the 24 rotations acting on the 6 faces:
        //  1 identity            -> 6 cycles
        //  6 quarter face turns  -> 3 cycles (two fixed faces + one 4-cycle)
        //  3 half face turns     -> 4 cycles (two fixed faces + two 2-cycles)
        //  8 vertex turns        -> 2 cycles (two 3-cycles)
        //  6 edge turns          -> 3 cycles (three 2-cycles)
        long long total = c6 + 3 * c4 + 12 * c3 + 8 * c2;
        cout << total / 24 << "\\n";
    }
    return 0;
}`,
      explanation: [
        "The only difficulty is enumerating the 24 rotations of a cube and their cycle structure on the faces. They fall into five conjugacy classes: the identity; 6 quarter turns about the 3 face axes (2 turns each way per axis); 3 half turns about those same face axes; 8 turns of 120 degrees about the 4 body diagonals; and 6 half turns about the 6 edge-midpoint axes. The class sizes add to 1 + 6 + 3 + 8 + 6 = 24, which is the check to run before trusting any such table.",
        "Faces fixed and cycles formed follow from the geometry. A quarter turn about a face axis keeps the two faces on that axis and rotates the other four in a single 4-cycle, giving 3 cycles. A half turn about the same axis keeps two faces and swaps the other four in pairs, giving 4 cycles. A body-diagonal turn permutes the three faces meeting at each of the two opposite vertices, giving two 3-cycles. An edge-axis half turn swaps faces in three pairs. Summing c^cycles over all 24 elements produces c^6 + 3c^4 + 12c^3 + 8c^2.",
        "Two easy errors: including reflections, which would enlarge the group to 48 and give a smaller, wrong answer for a physical cube; and forgetting that the 6 quarter turns and the 6 edge turns both contribute c^3, so the coefficient of c^3 is 12 rather than 6.",
        "The same machinery counts colourings of the 12 edges or the 8 vertices - only the cycle table changes. For edges the cycle counts are 12, 3, 6, 4 and 7 respectively, giving (c^12 + 6c^3 + 3c^6 + 8c^4 + 6c^7) / 24, which yields 218 for two colours.",
        "Time: O(1) per query. Space: O(1).",
      ],
    },
    {
      name: "Color",
      difficulty: "Hard",
      variation: "n up to 10^9: divisor grouping with Euler phi, no modular inverse",
      link: "http://poj.org/problem?id=2154",
      question: [
        "Beads of n different colours are strung into a circular necklace of n beads. Two necklaces are the same if one is a rotation of the other (flipping is not allowed). Count the distinct necklaces modulo a given number p. The first line holds the number of test cases; each following line holds n and p.",
        "Example 1:\nInput: n = 2, p = 30000\nOutput: 3\nExplanation: With 2 colours and 2 beads the necklaces are AA, AB, BB.",
        "Example 2:\nInput: n = 4, p = 30000\nOutput: 70\nExplanation: (4^4 + 4 + 4^2 + 4) / 4 = 280 / 4 = 70. Grouped by divisors that is phi(4) * 4^0 + phi(2) * 4^1 + phi(1) * 4^3 = 2 + 4 + 64 = 70.",
        "Constraints:\n- 1 <= n <= 10^9\n- 1 <= p <= 30000, and p is not guaranteed to be coprime with n\n- number of test cases up to 3500",
      ],
      code: `long long pw(long long b, long long e, long long mod) {
    long long r = 1 % mod;
    b %= mod;
    while (e > 0) {
        if (e & 1) r = r * b % mod;
        b = b * b % mod;
        e >>= 1;
    }
    return r;
}

// phi(x) reduced modulo mod, using the prime factors of n (x always divides n)
long long phiMod(long long x, const vector<long long>& primes, long long mod) {
    long long res = 1 % mod;
    for (long long q : primes) {
        if (x % q) continue;
        long long e = 0;
        while (x % q == 0) { x /= q; e++; }
        res = res * pw(q, e - 1, mod) % mod * ((q - 1) % mod) % mod;
    }
    return res;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int T;
    cin >> T;
    while (T--) {
        long long n, p;
        cin >> n >> p;
        vector<long long> primes;
        long long x = n;
        for (long long i = 2; i * i <= x; i++) {
            if (x % i == 0) {
                primes.push_back(i);
                while (x % i == 0) x /= i;
            }
        }
        if (x > 1) primes.push_back(x);
        long long ans = 0;
        for (long long d = 1; d * d <= n; d++) {
            if (n % d) continue;
            // the n/d rotations with gcd = d each fix n^d colourings; one factor of n cancels the 1/n
            ans = (ans + phiMod(n / d, primes, p) * pw(n, d - 1, p)) % p;
            long long d2 = n / d;
            if (d2 != d) ans = (ans + phiMod(d, primes, p) * pw(n, d2 - 1, p)) % p;
        }
        cout << ans % p << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Start from Burnside over the n rotations with n colours: answer = (1/n) * sum over i of n^gcd(i,n). Iterating over i is impossible for n = 10^9, so group the rotations by the value of the gcd. For each divisor d of n there are exactly phi(n/d) values of i in [0, n) with gcd(i, n) = d, which turns the sum into (1/n) * sum over d | n of phi(n/d) * n^d.",
        "The decisive observation is that the colour count equals n, so the leading 1/n can be absorbed into the power: the term becomes phi(n/d) * n^(d-1). That removes the division entirely, which matters because p here is an arbitrary modulus - it need not be prime and it may even share a factor with n, so a modular inverse of n simply does not exist. Reaching for pw(n, p-2, p) is the classic wrong reflex on this problem.",
        "Divisors are enumerated in pairs up to sqrt(n) and phi of each cofactor is computed from the prime factorisation of n rather than by factorising each divisor separately - phi(x) = product over primes q | x of q^(e-1) * (q-1), all taken modulo p. Note that phi itself must be reduced modulo p, which is fine because it appears only as a multiplier.",
        "Watch the trivial cases: n = 1 gives a single divisor d = 1 with phi(1) * 1^0 = 1, and if p = 1 every answer must print 0, which is why the powers start from 1 % mod rather than 1.",
        "Time: O(sqrt(n) + D(n) * omega(n) * log n) per test, where D(n) <= 1344 is the divisor count. Space: O(omega(n)).",
      ],
    },
    {
      name: "Cube",
      difficulty: "Hard",
      variation: "Burnside where Fix(g) is itself a counting problem",
      link: "https://atcoder.jp/contests/abc198/tasks/abc198_f",
      question: [
        "You are given an integer S. Write a positive integer on each of the six faces of a cube so that the six numbers sum to exactly S. Two ways are considered the same if one can be rotated into the other. Count the number of different ways modulo 998244353.",
        "Example 1:\nInput: S = 7\nOutput: 1\nExplanation: One face must be 2 and the other five 1. Any two such cubes are related by a rotation, so there is a single way.",
        "Example 2:\nInput: S = 8\nOutput: 3\nExplanation: Either one face is 3 and the rest 1, or two faces are 2 and the rest 1. In the second case the two 2s can be on adjacent faces or on opposite faces, and those cubes are not rotations of each other - giving 1 + 2 = 3.",
        "Constraints:\n- 6 <= S <= 10^18\n- the answer is required modulo 998244353",
      ],
      code: `const long long MOD = 998244353;

long long pw(long long b, long long e) {
    long long r = 1;
    b %= MOD;
    while (e > 0) {
        if (e & 1) r = r * b % MOD;
        b = b * b % MOD;
        e >>= 1;
    }
    return r;
}

int main() {
    long long S;
    cin >> S;
    long long inv2 = pw(2, MOD - 2), inv6 = pw(6, MOD - 2);
    long long inv24 = pw(24, MOD - 2), inv120 = pw(120, MOD - 2);

    // identity, cycle type 1+1+1+1+1+1: positive solutions of a+b+c+d+e+f = S is C(S-1,5)
    long long id = 1;
    for (long long k = 1; k <= 5; k++) id = id * ((S - k) % MOD) % MOD;
    id = id * inv120 % MOD;

    // 6 quarter face turns, cycle type 1+1+4: a+b+4c = S
    long long m = (S - 2) / 4;                       // largest c leaving a+b >= 2
    long long t114 = (((m % MOD) * ((S - 1) % MOD) % MOD
                      - 2 * (m % MOD) % MOD * ((m + 1) % MOD)) % MOD + MOD) % MOD;

    // 3 half face turns, cycle type 1+1+2+2: a+b+2c+2d = S
    long long U = (S - 2) / 2 - 1;                   // U = (c+d) - 1 ranges over 1..U
    if (U < 0) U = 0;
    long long s1 = (U % MOD) * ((U + 1) % MOD) % MOD * inv2 % MOD;                 // sum of u
    long long s2 = (U % MOD) * ((U + 1) % MOD) % MOD * ((2 * U + 1) % MOD) % MOD
                   * inv6 % MOD;                                                   // sum of u squared
    long long t1122 = ((((S - 3) % MOD) * s1 - 2 * s2) % MOD + MOD) % MOD;

    // 8 vertex turns, cycle type 3+3: 3a+3b = S
    long long t33 = (S % 3 == 0) ? ((S / 3 - 1) % MOD) : 0;

    // 6 edge turns, cycle type 2+2+2: 2(a+b+c) = S, count C(S/2-1, 2)
    long long t222 = 0;
    if (S % 2 == 0) {
        long long k = S / 2 - 1;
        t222 = (k % MOD) * ((k - 1) % MOD) % MOD * inv2 % MOD;
    }

    long long total = (id + 6 * t114 + 3 * t1122 + 8 * t33 + 6 * t222) % MOD;
    cout << total * inv24 % MOD << "\\n";
    return 0;
}`,
      explanation: [
        "Same group as the cube-face colouring problem, but the 'colours' are now positive integers under a global constraint, so Fix(g) is no longer c^cycles. A colouring fixed by g is constant on each cycle of g, so if g has cycles of lengths l1..lk then the numbers written are determined by one value x per cycle, and the sum condition becomes l1*x1 + ... + lk*xk = S with every xi >= 1. Fix(g) is the number of positive solutions of that linear equation.",
        "Each of the five cycle types gives a closed form. Type 1+1+1+1+1+1 is C(S-1,5) by stars and bars. Type 1+1+4 is a+b+4c = S: fix c and the pair (a,b) has S-4c-1 choices, so summing an arithmetic progression over c = 1..floor((S-2)/4) gives m(S-1) - 2m(m+1). Type 1+1+2+2 is handled by substituting t = c+d, which has t-1 representations, leaving sum over t of (t-1)(S-2t-1) - a cubic that needs sum u and sum u^2. Type 3+3 forces 3 | S and contributes S/3 - 1. Type 2+2+2 forces S even and contributes C(S/2-1, 2).",
        "The tempting wrong approach is to enumerate the partitions of S into six parts and try to classify each by hand, or to divide the unrestricted count C(S-1,5) by 24. The latter is wrong for exactly the usual reason: symmetric assignments such as all faces equal have small orbits, and only Burnside's averaging accounts for them.",
        "Everything must be done in 64-bit and reduced carefully. S reaches 10^18, so quantities like m and U reach 2.5 * 10^17 and are exact integers, while (S-1) and (S-3) must be reduced modulo p before multiplying. The subtractions can go negative after reduction even though the true value is non-negative, hence the + MOD before the final modulo. Divisions by 120, 24, 6 and 2 are modular inverses.",
        "Time: O(log MOD). Space: O(1).",
      ],
    },
    {
      name: "Magic Bracelet",
      difficulty: "Hard",
      variation: "Burnside plus matrix exponentiation for adjacency constraints",
      link: "http://poj.org/problem?id=2888",
      question: [
        "A bracelet is a circle of n magic beads, each of one of m colours. Some pairs of colours are magically incompatible and may not be placed next to each other on the circle. Two bracelets are the same if one is a rotation of the other (flipping is not allowed). Count the valid bracelets modulo 9973. Input: the number of test cases, then for each case n, m and k, followed by k lines each holding an incompatible pair of colours.",
        "Example 1:\nInput: n = 3, m = 2, k = 0\nOutput: 4\nExplanation: With no restrictions this is the plain necklace count (2^3 + 2 + 2) / 3 = 4.",
        "Example 2:\nInput: n = 4, m = 2, k = 1, forbidden pair (1, 1)\nOutput: 3\nExplanation: Colour 1 may not touch itself, so the valid bracelets are 2222, 1222 and 1212 - three in total.",
        "Constraints:\n- 1 <= n <= 10^9\n- 1 <= m <= 10\n- 0 <= k <= m * (m + 1) / 2\n- n is not divisible by 9973",
      ],
      code: `const long long MOD = 9973;

typedef vector<vector<long long>> Mat;

Mat mul(const Mat& A, const Mat& B) {
    int m = A.size();
    Mat C(m, vector<long long>(m, 0));
    for (int i = 0; i < m; i++)
        for (int k = 0; k < m; k++) {
            if (!A[i][k]) continue;
            for (int j = 0; j < m; j++) C[i][j] = (C[i][j] + A[i][k] * B[k][j]) % MOD;
        }
    return C;
}

Mat mpow(Mat A, long long e) {
    int m = A.size();
    Mat R(m, vector<long long>(m, 0));
    for (int i = 0; i < m; i++) R[i][i] = 1;
    while (e > 0) {
        if (e & 1) R = mul(R, A);
        A = mul(A, A);
        e >>= 1;
    }
    return R;
}

long long pw(long long b, long long e) {
    long long r = 1;
    b %= MOD;
    while (e > 0) {
        if (e & 1) r = r * b % MOD;
        b = b * b % MOD;
        e >>= 1;
    }
    return r;
}

long long phiMod(long long x, const vector<long long>& primes) {
    long long res = 1;
    for (long long q : primes) {
        if (x % q) continue;
        long long e = 0;
        while (x % q == 0) { x /= q; e++; }
        res = res * pw(q, e - 1) % MOD * ((q - 1) % MOD) % MOD;
    }
    return res;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int T;
    cin >> T;
    while (T--) {
        long long n;
        int m, k;
        cin >> n >> m >> k;
        Mat A(m, vector<long long>(m, 1));
        for (int i = 0; i < k; i++) {
            int a, b;
            cin >> a >> b;
            A[a - 1][b - 1] = 0;
            A[b - 1][a - 1] = 0;
        }
        vector<long long> primes;
        long long x = n;
        for (long long i = 2; i * i <= x; i++)
            if (x % i == 0) { primes.push_back(i); while (x % i == 0) x /= i; }
        if (x > 1) primes.push_back(x);

        long long ans = 0;
        for (long long d = 1; d * d <= n; d++) {
            if (n % d) continue;
            long long d2 = n / d;
            // a rotation with gcd = g fixes exactly the valid cyclic words of length g: trace(A^g)
            Mat P = mpow(A, d);
            long long tr = 0;
            for (int i = 0; i < m; i++) tr = (tr + P[i][i]) % MOD;
            ans = (ans + phiMod(d2, primes) * tr) % MOD;
            if (d2 != d) {
                Mat Q = mpow(A, d2);
                long long tr2 = 0;
                for (int i = 0; i < m; i++) tr2 = (tr2 + Q[i][i]) % MOD;
                ans = (ans + phiMod(d, primes) * tr2) % MOD;
            }
        }
        cout << ans * pw(n % MOD, MOD - 2) % MOD << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Burnside still gives answer = (1/n) * sum over divisors d of n of phi(n/d) * Fix(d), where Fix(d) is the number of valid colourings invariant under a rotation whose gcd with n is d. The new ingredient is computing Fix(d) when the colourings are constrained.",
        "Such an invariant colouring is fully described by d consecutive beads, and the constraint set wraps around: the d-th bead sits next to the first in the compressed circle. Let A be the m x m 0/1 matrix with A[i][j] = 1 when colours i and j may be adjacent. The number of closed walks of length d in that graph is trace(A^d), and closed walks of length d are exactly the valid cyclic words of length d. So Fix(d) = trace(A^d) - and the unconstrained case A all-ones recovers trace(A^d) = m^d, matching the plain necklace formula.",
        "Why the compressed circle is the right object is worth pinning down: if the pattern repeats with period d, every adjacency in the full circle of length n is an adjacency somewhere in the length-d cycle, and conversely. Checking adjacency only inside a linear block of d beads and forgetting the wrap-around is the standard bug and silently overcounts.",
        "Modulus 9973 is small and, crucially, not necessarily coprime to arbitrary n - which is why the statement guarantees n is not a multiple of 9973, making the inverse of n well defined by Fermat. All matrix entries stay reduced, so the products never exceed 9972^2 * 10 and fit easily in 64 bits.",
        "Time: O(D(n) * m^3 * log n) per test, with D(n) <= 1344 divisors and m <= 10. Space: O(m^2).",
      ],
    },
  ],
};
