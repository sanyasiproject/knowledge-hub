import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Pascal's Triangle",
      difficulty: "Easy",
      variation: "Pascal recurrence, full table",
      link: "https://leetcode.com/problems/pascals-triangle/",
      question: [
        "Given an integer numRows, return the first numRows rows of Pascal's triangle. Row i (0-indexed) has i+1 entries, entry j equals C(i, j), the first and last entry of every row are 1, and every other entry is the sum of the two entries directly above it.",
        "Example 1:\nInput: numRows = 5\nOutput: [[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]\nExplanation: Row 3 entry 1 is 1 + 2 = 3 from row 2, and row 4 entry 2 is 3 + 3 = 6.",
        "Example 2:\nInput: numRows = 1\nOutput: [[1]]\nExplanation: C(0, 0) = 1.",
        "Constraints:\n- 1 <= numRows <= 30",
      ],
      code: `vector<vector<int>> generate(int numRows) {
    vector<vector<int>> tri(numRows);
    for (int i = 0; i < numRows; i++) {
        tri[i].assign(i + 1, 1);             // both ends of the row are 1
        for (int j = 1; j < i; j++)          // interior entries only
            tri[i][j] = tri[i - 1][j - 1] + tri[i - 1][j];
    }
    return tri;
}`,
      explanation: [
        "This is the additive definition of the binomial coefficient: C(n, r) = C(n-1, r-1) + C(n-1, r). The combinatorial proof is a case split on one fixed element - either it is in the chosen set, leaving r-1 slots to fill from n-1 candidates, or it is not, leaving r slots from n-1. The two cases are disjoint and cover everything, so the counts add.",
        "Building the table is the right tool whenever you need many small coefficients, when the modulus is not prime (no inverses needed here - only additions), or when no modulus is given at all. It needs zero number theory.",
        "The limit is size: the table is O(n^2) cells, so it dies around n = 5000. It is also why 30 rows is the constraint - C(30, 15) is about 1.5 * 10^8, still inside a 32-bit int, but C(35, 17) already overflows.",
        "The trap is writing the inner loop as j <= i and reading tri[i-1][i], which is out of range. Assigning 1 to both ends first and looping the strict interior avoids any boundary special-casing.",
        "Time: O(numRows^2). Space: O(numRows^2) for the output.",
      ],
    },
    {
      name: "Pascal's Triangle II",
      difficulty: "Easy",
      variation: "Single row, O(k) space, in-place backward update",
      link: "https://leetcode.com/problems/pascals-triangle-ii/",
      question: [
        "Given an integer rowIndex, return the rowIndex-th (0-indexed) row of Pascal's triangle, that is the list C(rowIndex, 0), C(rowIndex, 1), ..., C(rowIndex, rowIndex). Use only O(rowIndex) extra space.",
        "Example 1:\nInput: rowIndex = 3\nOutput: [1,3,3,1]\nExplanation: C(3,0)=1, C(3,1)=3, C(3,2)=3, C(3,3)=1.",
        "Example 2:\nInput: rowIndex = 0\nOutput: [1]\nExplanation: The apex of the triangle.",
        "Constraints:\n- 0 <= rowIndex <= 33",
      ],
      code: `vector<int> getRow(int rowIndex) {
    vector<int> row(rowIndex + 1, 0);
    row[0] = 1;
    for (int i = 1; i <= rowIndex; i++)
        for (int j = i; j >= 1; j--)
            row[j] += row[j - 1];            // right to left: row[j-1] is still row i-1
    return row;
}`,
      explanation: [
        "Only the previous row is ever read, so one array suffices. The direction of the inner loop is the whole trick: sweeping j from high to low means row[j-1] has not been touched yet this pass, so it still holds the value from row i-1, which is exactly what the recurrence wants.",
        "Sweeping left to right instead computes row[j] += row[j-1] where row[j-1] was already updated to row i. That silently produces the wrong sequence - for rowIndex = 3 you get 1,3,6,10 (the triangular-ish prefix sums) instead of 1,3,3,1. This forward/backward distinction is the same one that separates 0/1 knapsack from unbounded knapsack.",
        "An alternative is the multiplicative sweep row[j] = row[j-1] * (n - j + 1) / j, which needs only one pass but needs 64-bit intermediates and relies on each partial product being exactly divisible.",
        "Time: O(rowIndex^2) additions. Space: O(rowIndex), which is the output itself.",
      ],
    },
    {
      name: "Unique Paths",
      difficulty: "Medium",
      variation: "Lattice paths as a single coefficient, no modulus",
      link: "https://leetcode.com/problems/unique-paths/",
      question: [
        "A robot sits on the top-left cell of an m x n grid and wants to reach the bottom-right cell. It can only move one cell right or one cell down at a time. Return the number of distinct paths. The answer is guaranteed to fit in a 32-bit signed integer.",
        "Example 1:\nInput: m = 3, n = 7\nOutput: 28\nExplanation: Every path makes exactly 2 down moves and 6 right moves, so the answer is C(8, 2) = 28.",
        "Example 2:\nInput: m = 3, n = 2\nOutput: 3\nExplanation: C(3, 1) = 3, namely DDR, DRD, RDD.",
        "Constraints:\n- 1 <= m, n <= 100",
      ],
      code: `int uniquePaths(int m, int n) {
    int N = m + n - 2;                 // total moves
    int r = min(m - 1, n - 1);         // choose the smaller side: fewer iterations, smaller values
    long long res = 1;
    for (int i = 1; i <= r; i++)
        res = res * (N - r + i) / i;   // after step i this equals C(N-r+i, i), always an integer
    return (int)res;
}`,
      explanation: [
        "Every monotone path is a word of m-1 D's and n-1 R's, and every such word is a legal path, so the count is the number of ways to place the D's among m+n-2 moves: C(m+n-2, m-1). Recognising a grid-path count as one binomial coefficient is the single most reused fact in this pattern.",
        "The loop computes the coefficient without ever forming a factorial. The invariant is that after iteration i the accumulator equals C(N-r+i, i), which is an integer, so the division by i is exact at every step and no rounding creeps in. Reordering it as res = res / i * (N - r + i) would break that and give wrong answers.",
        "Computing N! and then dividing overflows immediately (100! is astronomically large), and the pure O(m*n) grid DP is fine here but pointless - the closed form is O(min(m,n)) time and O(1) space.",
        "Using C(N, min(m-1, n-1)) rather than C(N, m-1) exploits the symmetry C(N, r) = C(N, N-r) and halves the worst-case intermediate size.",
        "Time: O(min(m, n)). Space: O(1).",
      ],
    },
    {
      name: "Binomial Coefficients (CSES)",
      difficulty: "Medium",
      variation: "Factorial and inverse-factorial precomputation, the template",
      link: "https://cses.fi/problemset/task/1079",
      question: [
        "Your task is to calculate n binomial coefficients modulo 10^9 + 7. The first input line contains an integer n, the number of queries. Each of the next n lines contains two integers a and b: print the value of C(a, b) modulo 10^9 + 7 on its own line.",
        "Example 1:\nInput:\n3\n5 3\n8 2\n6 1\nOutput:\n10\n28\n6\nExplanation: C(5,3) = 10, C(8,2) = 28, C(6,1) = 6.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= b <= a <= 10^6",
      ],
      code: `const long long MOD = 1000000007LL;
const int MX = 1000001;

long long fact[MX], invFact[MX];

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

void buildFactorials() {
    fact[0] = 1;
    for (int i = 1; i < MX; i++) fact[i] = fact[i - 1] * i % MOD;
    invFact[MX - 1] = power(fact[MX - 1], MOD - 2);   // one inverse via Fermat
    for (int i = MX - 1; i >= 1; i--)
        invFact[i - 1] = invFact[i] * i % MOD;        // walk the inverses down for free
}

long long C(long long n, long long r) {
    if (r < 0 || r > n || n < 0) return 0;
    return fact[n] * invFact[r] % MOD * invFact[n - r] % MOD;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    buildFactorials();
    int n;
    cin >> n;
    while (n--) {
        long long a, b;
        cin >> a >> b;
        cout << C(a, b) << "\\n";
    }
    return 0;
}`,
      explanation: [
        "C(n, r) = n! / (r! (n-r)!) has divisions, and division is not defined on residues - you multiply by the modular inverse instead. Because MOD = 10^9 + 7 is prime and every factorial below MOD is nonzero, Fermat's little theorem gives x^(-1) = x^(MOD-2) mod MOD, so C(n, r) = fact[n] * invFact[r] * invFact[n-r].",
        "The precomputation is the part worth memorising. Computing MX modular powers would cost O(MX log MOD); instead compute one power for invFact[MX-1] and use invFact[i-1] = invFact[i] * i, which is just the identity 1/(i-1)! = i / i!. Total O(MX + log MOD), and every later query is three multiplications.",
        "Guard r < 0 || r > n and return 0 before indexing. Without it a query with b > a either reads invFact at a negative index (undefined behaviour) or returns a nonzero garbage residue, and the bug is invisible on small tests.",
        "Two traps specific to modular arithmetic here: a product of two values near 10^9 needs 64-bit, so declare the tables long long and reduce after every multiply; and the answer 0 is meaningful only via the guard - a real coefficient divisible by MOD is possible in principle but cannot happen for n < MOD.",
        "This precomputation is worthwhile only when MOD is prime and larger than n. If MOD is a small prime use Lucas' theorem, and if MOD is composite build the table with Pascal's recurrence or use CRT over the prime powers.",
        "Time: O(MX + log MOD) precomputation, O(1) per query. Space: O(MX).",
      ],
    },
    {
      name: "Number of Ways to Reach a Position After Exactly k Steps",
      difficulty: "Medium",
      variation: "Parity reduction to one coefficient",
      link: "https://leetcode.com/problems/number-of-ways-to-reach-a-position-after-exactly-k-steps/",
      question: [
        "You start on an infinite number line at position startPos and want to be at endPos after exactly k steps. In one step you move either one unit left or one unit right. Two ways are different if the sequence of moves differs, even if the visited positions are the same. Return the number of ways modulo 10^9 + 7.",
        "Example 1:\nInput: startPos = 1, endPos = 2, k = 3\nOutput: 3\nExplanation: The displacement is 1 with 3 steps, so 2 right moves and 1 left move: RRL, RLR, LRR. That is C(3, 2) = 3.",
        "Example 2:\nInput: startPos = 2, endPos = 5, k = 10\nOutput: 0\nExplanation: The displacement is 3 and k = 10, so k - d = 7 is odd and the left moves cannot be split evenly. No sequence works.",
        "Constraints:\n- 1 <= startPos, endPos, k <= 1000",
      ],
      code: `const long long MOD = 1000000007LL;

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

int numberOfWays(int startPos, int endPos, int k) {
    int d = abs(endPos - startPos);
    if (d > k || ((k - d) & 1)) return 0;     // unreachable, or wrong parity
    int r = (k + d) / 2;                      // number of steps taken toward the target
    long long num = 1, den = 1;
    for (int i = 1; i <= r; i++) {
        num = num * ((k - r + i) % MOD) % MOD;
        den = den * i % MOD;
    }
    return (int)(num * power(den, MOD - 2) % MOD);   // one inverse at the end
}`,
      explanation: [
        "Let p be the moves toward the target and q the moves away, so p + q = k and p - q = d where d = |endPos - startPos|. Solving gives p = (k + d) / 2. The answer is the number of ways to choose which of the k steps are the p forward ones, that is C(k, (k+d)/2). Direction of the offset does not matter, which is why the absolute value is taken first.",
        "The two rejections are both necessary. If d > k you cannot cover the distance at all. If k - d is odd then 2q = k - d has no integer solution - each wasted pair of moves is one step out and one step back, so the surplus must be even. Every naive DP over positions gets these right automatically but costs O(k^2); the formula is the point of the exercise.",
        "Because only a single coefficient is needed, precomputing factorial tables is overkill: accumulate the numerator and denominator modulo MOD and pay for exactly one modular inverse. Never compute the numerator and denominator as plain integers and divide - after the modular reduction the numerator is no longer divisible by the denominator.",
        "Time: O(k + log MOD). Space: O(1).",
      ],
    },
    {
      name: "Creating Strings II",
      difficulty: "Medium",
      variation: "Multinomial coefficient (permutations with repeats)",
      link: "https://cses.fi/problemset/task/1715",
      question: [
        "Given a string of length n, count the number of distinct strings that can be created by reordering its characters. Print the answer modulo 10^9 + 7.",
        "Example 1:\nInput:\naabac\nOutput:\n20\nExplanation: The multiset is three a's, one b and one c, so the count is 5! / (3! * 1! * 1!) = 120 / 6 = 20.",
        "Example 2:\nInput:\nabc\nOutput:\n6\nExplanation: All characters are distinct, so the count is 3! = 6.",
        "Constraints:\n- 1 <= n <= 10^6\n- The string consists of lowercase English letters",
      ],
      code: `const long long MOD = 1000000007LL;
const int MX = 1000001;

long long fact[MX], invFact[MX];

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

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    fact[0] = 1;
    for (int i = 1; i < MX; i++) fact[i] = fact[i - 1] * i % MOD;
    invFact[MX - 1] = power(fact[MX - 1], MOD - 2);
    for (int i = MX - 1; i >= 1; i--) invFact[i - 1] = invFact[i] * i % MOD;

    string s;
    cin >> s;
    long long cnt[26] = {0};
    for (char c : s) cnt[c - 'a']++;
    long long ans = fact[(int)s.size()];
    for (int c = 0; c < 26; c++) ans = ans * invFact[cnt[c]] % MOD;   // divide out each repeat group
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "There are n! orderings of the positions, but two orderings that only swap equal characters produce the same string. Each group of k identical characters can be internally permuted k! ways without changing the result, so the classes all have the same size prod(k_c!) and the answer is n! / prod(k_c!) - the multinomial coefficient.",
        "The multinomial is the natural generalisation of the binomial: C(n, r) is exactly the two-group case n! / (r! (n-r)!). The same fact and invFact tables serve both, which is why this precomputation is worth writing once and reusing.",
        "Since the division is modular, multiply by invFact[cnt[c]] rather than dividing. invFact[0] = 1 makes absent letters harmless, so no special case is needed for characters that do not occur.",
        "The trap is computing the numerator without a modulus - 10^6 factorial has no chance of fitting anywhere - or trying to cancel factors before reducing. Work in residues from the very first multiplication.",
        "Time: O(MX + n). Space: O(MX).",
      ],
    },
    {
      name: "Distributing Apples",
      difficulty: "Medium",
      variation: "Stars and bars",
      link: "https://cses.fi/problemset/task/1716",
      question: [
        "There are n children and m identical apples. Count the number of ways to distribute all the apples among the children, where a child may receive zero apples. Two distributions differ if some child receives a different number of apples. Print the answer modulo 10^9 + 7.",
        "Example 1:\nInput:\n3 2\nOutput:\n6\nExplanation: The distributions are (2,0,0), (0,2,0), (0,0,2), (1,1,0), (1,0,1), (0,1,1), that is C(3+2-1, 3-1) = C(4, 2) = 6.",
        "Example 2:\nInput:\n1 5\nOutput:\n1\nExplanation: One child must take all five apples: C(5, 0) = 1.",
        "Constraints:\n- 1 <= n, m <= 10^6",
      ],
      code: `const long long MOD = 1000000007LL;
const int MX = 2000002;

long long fact[MX], invFact[MX];

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

long long C(long long n, long long r) {
    if (r < 0 || r > n || n < 0) return 0;
    return fact[n] * invFact[r] % MOD * invFact[n - r] % MOD;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    fact[0] = 1;
    for (int i = 1; i < MX; i++) fact[i] = fact[i - 1] * i % MOD;
    invFact[MX - 1] = power(fact[MX - 1], MOD - 2);
    for (int i = MX - 1; i >= 1; i--) invFact[i - 1] = invFact[i] * i % MOD;

    long long n, m;
    cin >> n >> m;
    cout << C(n + m - 1, n - 1) << "\\n";   // stars and bars
    return 0;
}`,
      explanation: [
        "Write the distribution as m stars in a row and insert n-1 bars to cut them into n ordered groups. Every arrangement of m stars and n-1 bars is one distribution and vice versa, and there are C(m + n - 1, n - 1) such arrangements. Allowing empty groups is exactly what lets two bars sit next to each other.",
        "The equivalent algebraic statement is that the number of non-negative integer solutions of x1 + ... + xn = m is C(n + m - 1, n - 1). Memorise the shape rather than the letters: total symbols choose separators.",
        "If each child must get at least one apple, hand out one apple to everyone first and solve for m - n, giving C(m - 1, n - 1). If child i needs at least L_i, subtract sum(L_i) from m the same way. An upper bound per child is not a binomial any more - that needs inclusion-exclusion over which children overflow.",
        "The table must reach n + m - 1, up to about 2 * 10^6, not 10^6. Sizing MX to the constraint on n alone is the classic out-of-bounds bug here.",
        "Time: O(MX). Space: O(MX).",
      ],
    },
    {
      name: "Knight (AtCoder ABC 145 D)",
      difficulty: "Medium",
      variation: "Solving for move counts, then one coefficient",
      link: "https://atcoder.jp/contests/abc145/tasks/abc145_d",
      question: [
        "A knight stands at (0, 0) in an infinite two-dimensional grid. From (i, j) it can move to (i+1, j+2) or (i+2, j+1). Given X and Y, count the number of distinct move sequences that take the knight from (0, 0) to (X, Y), modulo 10^9 + 7. If it cannot reach the target, print 0.",
        "Example 1:\nInput:\n3 3\nOutput:\n2\nExplanation: (0,0) -> (1,2) -> (3,3) and (0,0) -> (2,1) -> (3,3).",
        "Example 2:\nInput:\n2 2\nOutput:\n0\nExplanation: Every move adds 3 to i + j, but X + Y = 4 is not a multiple of 3, so the target is unreachable.",
        "Constraints:\n- 1 <= X <= 10^6\n- 1 <= Y <= 10^6",
      ],
      code: `const long long MOD = 1000000007LL;
const int MX = 1000001;

long long fact[MX], invFact[MX];

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

long long C(long long n, long long r) {
    if (r < 0 || r > n || n < 0) return 0;
    return fact[n] * invFact[r] % MOD * invFact[n - r] % MOD;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    fact[0] = 1;
    for (int i = 1; i < MX; i++) fact[i] = fact[i - 1] * i % MOD;
    invFact[MX - 1] = power(fact[MX - 1], MOD - 2);
    for (int i = MX - 1; i >= 1; i--) invFact[i - 1] = invFact[i] * i % MOD;

    long long X, Y;
    cin >> X >> Y;
    if ((X + Y) % 3 != 0) { cout << 0 << "\\n"; return 0; }
    long long n = (X + Y) / 3;      // total number of moves
    long long b = X - n;            // moves of type (+2,+1)
    long long a = 2 * n - X;        // moves of type (+1,+2)
    if (a < 0 || b < 0) { cout << 0 << "\\n"; return 0; }
    cout << C(n, b) << "\\n";
    return 0;
}`,
      explanation: [
        "Let a be the number of (+1,+2) moves and b the number of (+2,+1) moves. Then a + 2b = X and 2a + b = Y. Adding them gives 3(a + b) = X + Y, so the total move count is n = (X + Y) / 3 and divisibility by 3 is the first feasibility test. Substituting back gives b = X - n and a = 2n - X.",
        "Once a and b are pinned down, the moves are interchangeable in order and the answer is just the number of ways to interleave them: C(a + b, b) = C(n, b). The lesson is the general shape - when the multiset of steps is forced, the path count collapses to a single multinomial.",
        "Both non-negativity checks are needed, not just the divisibility one. For X = 1, Y = 8 the sum is 9 so n = 3, but b = 1 - 3 = -2 is impossible; skipping the check indexes the factorial tables with a negative value.",
        "The tempting wrong approach is a two-dimensional DP over reachable cells. It is correct but O(X * Y) = 10^12 cells, hopeless at these limits.",
        "Time: O(MX). Space: O(MX).",
      ],
    },
    {
      name: "Blue and Red Balls (AtCoder ABC 132 D)",
      difficulty: "Medium",
      variation: "Product of two coefficients (compositions plus gap placement)",
      link: "https://atcoder.jp/contests/abc132/tasks/abc132_d",
      question: [
        "There are N balls in a row: K of them are blue and N-K are red, and balls of the same colour are indistinguishable. Takahashi collects the blue balls by repeatedly taking one maximal run of consecutive blue balls per operation. For each i from 1 to K, print the number of distinct arrangements of the N balls that require exactly i operations, modulo 10^9 + 7. Print the K answers on separate lines in order.",
        "Example 1:\nInput:\n5 3\nOutput:\n3\n6\n1\nExplanation: With one blue run there are C(2,0) * C(3,1) = 3 arrangements; with two runs C(2,1) * C(3,2) = 6; with three runs C(2,2) * C(3,3) = 1.",
        "Example 2:\nInput:\n2 1\nOutput:\n2\nExplanation: The single blue ball always needs one operation, and it can sit in either of the C(2,1) = 2 gaps around the one red ball.",
        "Constraints:\n- 1 <= K <= N <= 2000",
      ],
      code: `const long long MOD = 1000000007LL;
const int MX = 4005;

long long fact[MX], invFact[MX];

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

long long C(long long n, long long r) {
    if (r < 0 || r > n || n < 0) return 0;
    return fact[n] * invFact[r] % MOD * invFact[n - r] % MOD;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    fact[0] = 1;
    for (int i = 1; i < MX; i++) fact[i] = fact[i - 1] * i % MOD;
    invFact[MX - 1] = power(fact[MX - 1], MOD - 2);
    for (int i = MX - 1; i >= 1; i--) invFact[i - 1] = invFact[i] * i % MOD;

    long long N, K;
    cin >> N >> K;
    long long red = N - K;
    for (long long i = 1; i <= K; i++) {
        // split K blues into i non-empty runs, then drop those runs into i of the red gaps
        long long ways = C(K - 1, i - 1) * C(red + 1, i) % MOD;
        cout << ways << "\\n";
    }
    return 0;
}`,
      explanation: [
        "The number of operations equals the number of maximal blue runs, so fix that count at i and count arrangements with exactly i runs. Two independent choices determine the arrangement: how the K blue balls are split into i ordered non-empty runs, and which gaps around the red balls those runs occupy.",
        "The split is a composition of K into i positive parts, which is stars and bars with the non-empty variant: place i-1 dividers into the K-1 slots between blues, giving C(K-1, i-1). The placement uses the gap principle - N-K red balls in a row create (N-K)+1 gaps, and the i runs must land in i distinct gaps (two runs in one gap would merge into one run), giving C(N-K+1, i). Multiply because the choices are independent.",
        "The runs are unordered as a set of gaps, not a sequence, which is why the second factor is a plain combination and not a permutation - once you pick which gaps are used, the leftmost chosen gap gets the leftmost run and so on.",
        "The off-by-one to watch is red + 1, not red: a blue run may sit before the first red ball or after the last one. Using C(red, i) undercounts every answer.",
        "When i exceeds red + 1 the coefficient is 0 automatically thanks to the guard in C, so no extra range logic is needed.",
        "Time: O(MX + K). Space: O(MX).",
      ],
    },
    {
      name: "Compute nCr % p using Lucas' Theorem",
      difficulty: "Hard",
      variation: "Small prime modulus, huge n (Lucas' theorem)",
      question: [
        "Given non-negative integers n and r and a small prime p, compute C(n, r) modulo p. Here n can be as large as 10^18, so factorials up to n cannot be precomputed, but p is small enough that a table of size p fits in memory.",
        "Example 1:\nInput: n = 10, r = 2, p = 13\nOutput: 6\nExplanation: C(10, 2) = 45 and 45 mod 13 = 6.",
        "Example 2:\nInput: n = 6, r = 2, p = 5\nOutput: 0\nExplanation: In base 5, n = (1,1) and r = (0,2). The digit pair (1, 2) has r-digit greater than n-digit, so C(1,2) = 0 and the whole product is 0. Directly, C(6,2) = 15 which is divisible by 5.",
        "Constraints:\n- 0 <= r <= n <= 10^18\n- p is prime and 2 <= p <= 10^5",
      ],
      code: `long long power(long long b, long long e, long long m) {
    long long r = 1;
    b %= m;
    while (e > 0) {
        if (e & 1) r = r * b % m;
        b = b * b % m;
        e >>= 1;
    }
    return r;
}

// C(n, r) mod p for n, r < p, using a factorial table modulo p
long long smallBinom(long long n, long long r, long long p, const vector<long long>& f) {
    if (r > n) return 0;
    long long den = f[r] * f[n - r] % p;
    return f[n] * power(den, p - 2, p) % p;   // p is prime, so Fermat gives the inverse
}

long long lucas(long long n, long long r, long long p) {
    vector<long long> f(p);
    f[0] = 1 % p;
    for (long long i = 1; i < p; i++) f[i] = f[i - 1] * i % p;
    long long res = 1 % p;
    while (n > 0 || r > 0) {                  // process base-p digits from least significant up
        long long nd = n % p, rd = r % p;
        res = res * smallBinom(nd, rd, p, f) % p;
        if (res == 0) return 0;               // one zero digit kills the whole product
        n /= p;
        r /= p;
    }
    return res;
}`,
      explanation: [
        "Lucas' theorem says that if n and r are written in base p as digits n_k..n_0 and r_k..r_0 then C(n, r) is congruent modulo p to the product of C(n_i, r_i) over all digits, where C(n_i, r_i) = 0 whenever r_i > n_i. Each digit factor has both arguments below p, so a factorial table of length p handles every one of them.",
        "The reason it works: modulo p the polynomial identity (1+x)^p is congruent to 1 + x^p, so (1+x)^n factors as a product of (1 + x^(p^i))^(n_i). Expanding, the coefficient of x^r can only be assembled by taking r_i from the block of scale p^i, which is exactly the digit-wise product.",
        "This is the tool when the modulus is a small prime and n is astronomically large - the standard fact and invFact tables need size n and are unusable. It also explains a family of results directly, for example C(n, r) mod 2 is 1 exactly when r is a submask of n in binary, which is the digit condition for p = 2.",
        "Two traps. First, the theorem needs p prime; for a prime power use the generalised Lucas variant, and for a general composite modulus factor it and combine the residues with CRT. Second, do not build the length-p table inside the digit loop when answering many queries - hoist it out, otherwise you pay O(p) per digit.",
        "Time: O(p) to build the table plus O(log_p(n) * log p) for the digits. Space: O(p).",
      ],
    },
    {
      name: "Gerald and Giant Chess",
      difficulty: "Hard",
      variation: "Lattice paths avoiding blocked cells (inclusion-exclusion on first bad cell)",
      link: "https://codeforces.com/problemset/problem/559/C",
      question: [
        "You are given an h x w board whose rows are numbered 1..h from the top and columns 1..w from the left. Exactly n of the cells are black and the rest are white; the top-left and bottom-right cells are white. A pawn starts on (1, 1) and moves only one cell right or one cell down. Count the number of paths from (1, 1) to (h, w) that never step on a black cell, modulo 10^9 + 7.",
        "Example 1:\nInput:\n3 4 2\n2 2\n2 3\nOutput:\n2\nExplanation: Of the C(5,2) = 10 unrestricted paths only two avoid both black cells: right-right-right-down-down and down-down-right-right-right.",
        "Example 2:\nInput:\n2 2 1\n1 2\nOutput:\n1\nExplanation: Of the two paths, the one through (1,2) is blocked, so only (1,1) -> (2,1) -> (2,2) survives.",
        "Constraints:\n- 1 <= h, w <= 10^5\n- 1 <= n <= 2000\n- All black cells are distinct",
      ],
      code: `const long long MOD = 1000000007LL;
const int MX = 200005;

long long fact[MX], invFact[MX];

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

long long C(long long n, long long r) {
    if (r < 0 || r > n || n < 0) return 0;
    return fact[n] * invFact[r] % MOD * invFact[n - r] % MOD;
}

// unrestricted monotone paths from (r1,c1) to (r2,c2)
long long paths(long long r1, long long c1, long long r2, long long c2) {
    if (r2 < r1 || c2 < c1) return 0;
    long long dr = r2 - r1, dc = c2 - c1;
    return C(dr + dc, dr);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    fact[0] = 1;
    for (int i = 1; i < MX; i++) fact[i] = fact[i - 1] * i % MOD;
    invFact[MX - 1] = power(fact[MX - 1], MOD - 2);
    for (int i = MX - 1; i >= 1; i--) invFact[i - 1] = invFact[i] * i % MOD;

    long long h, w;
    int n;
    cin >> h >> w >> n;
    vector<pair<long long,long long>> p(n + 1);
    for (int i = 0; i < n; i++) cin >> p[i].first >> p[i].second;
    p[n] = {h, w};                       // treat the destination as the last "point"
    sort(p.begin(), p.end());            // any order with rows and cols non-decreasing works

    vector<long long> dp(n + 1);
    for (int i = 0; i <= n; i++) {
        dp[i] = paths(1, 1, p[i].first, p[i].second);
        for (int j = 0; j < i; j++) {
            if (p[j].second > p[i].second) continue;   // j not reachable before i
            long long sub = dp[j] * paths(p[j].first, p[j].second, p[i].first, p[i].second) % MOD;
            dp[i] = (dp[i] - sub % MOD + MOD) % MOD;
        }
    }
    cout << dp[n] << "\\n";
    return 0;
}`,
      explanation: [
        "Define dp[i] as the number of paths from (1,1) to black cell i that touch no other black cell on the way. Then every path reaching cell i can be classified by the first black cell j it steps on: after that the remainder is an unrestricted path from j to i. Those classes are disjoint and exhaustive, so dp[i] = C(all paths to i) - sum over j of dp[j] * C(paths from j to i). Adding the destination as a pseudo-black point makes dp[n] the answer.",
        "The 'first bad cell' decomposition is the key idea, and it is why the subtraction is not double counting: a path is charged to exactly one j, namely the earliest black cell along it. Naive inclusion-exclusion over subsets of black cells would be 2^n and also much harder to get right.",
        "Sorting by (row, column) guarantees that any cell that can precede i on a monotone path appears earlier in the array, so dp[j] is already final when it is used. The explicit column check is still required - sorting puts cells with a larger column but smaller row before i even though no monotone path visits both.",
        "The unrestricted count between two points is one binomial, C(dr + dc, dr), because a monotone path is a shuffle of dr downs and dc rights. Since h + w can be 2 * 10^5 the factorial tables must reach that, not just 10^5.",
        "A grid DP over all h * w cells would be 10^10 states, which is exactly why the problem gives a small n instead: the work is O(n^2) in the number of obstacles, independent of the board size.",
        "Time: O(h + w + n^2). Space: O(h + w + n).",
      ],
    },
  ],
};
