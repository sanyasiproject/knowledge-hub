import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Fibonacci Number",
      difficulty: "Easy",
      variation: "2x2 companion matrix, the template",
      link: "https://leetcode.com/problems/fibonacci-number/",
      question: [
        "The Fibonacci numbers are defined by F(0) = 0, F(1) = 1 and F(n) = F(n-1) + F(n-2) for n > 1. Given n, return F(n). Solve it with matrix exponentiation rather than a loop, because that is the technique this whole topic is built on.",
        "Example 1:\nInput: n = 4\nOutput: 3\nExplanation: M = [[1,1],[1,0]] and M^3 = [[3,2],[2,1]], whose top-left entry is F(4) = 3.",
        "Example 2:\nInput: n = 10\nOutput: 55\nExplanation: M^9 has top-left entry 55.",
        "Constraints:\n- 0 <= n <= 30",
      ],
      code: `class Solution {
    using Mat = array<array<long long, 2>, 2>;

    Mat mul(const Mat& a, const Mat& b) {
        Mat c{};                                  // value-initialised to all zeros
        for (int i = 0; i < 2; i++)
            for (int k = 0; k < 2; k++)
                for (int j = 0; j < 2; j++)
                    c[i][j] += a[i][k] * b[k][j];
        return c;
    }

public:
    int fib(int n) {
        if (n == 0) return 0;
        Mat base = {{{1, 1}, {1, 0}}};            // the companion matrix M
        Mat res  = {{{1, 0}, {0, 1}}};            // identity, the multiplicative unit
        int e = n - 1;
        while (e > 0) {                           // binary exponentiation on matrices
            if (e & 1) res = mul(res, base);
            base = mul(base, base);
            e >>= 1;
        }
        return (int)res[0][0];                    // M^(n-1) top-left entry is F(n)
    }
};`,
      explanation: [
        "The whole pattern rests on one identity. Stack the last two terms into a column vector v(n) = [F(n), F(n-1)]. Then v(n) = M * v(n-1) with M = [[1,1],[1,0]], because the first row computes F(n-1) + F(n-2) and the second row just shifts the old head down. Unrolling gives v(n) = M^(n-1) * v(1) = M^(n-1) * [1, 0], so F(n) is exactly the top-left entry of M^(n-1).",
        "Matrix multiplication is associative, which is the only property binary exponentiation needs. So the same square-and-multiply loop used for integer powers works verbatim: keep a running result, square the base, consume one bit of the exponent per iteration. The identity matrix plays the role that 1 plays for integers.",
        "The tempting mistake is to compute M^n and read entry [0][0], which yields F(n+1), an off-by-one that only shows up on larger n. Anchor the indices by testing the smallest cases: with n = 1 the exponent is 0, res stays the identity, and res[0][0] = 1 = F(1), which pins the convention down.",
        "For this constraint range a loop is obviously better. The reason to learn the matrix form is that its cost depends on log n rather than n, which is what makes n = 10^18 tractable in the harder problems below.",
        "Time: O(log n) matrix multiplies, each O(1) here, so O(log n). Space: O(1).",
      ],
    },
    {
      name: "N-th Tribonacci Number",
      difficulty: "Easy",
      variation: "Order-3 recurrence, larger companion matrix",
      link: "https://leetcode.com/problems/n-th-tribonacci-number/",
      question: [
        "The Tribonacci sequence is defined by T(0) = 0, T(1) = 1, T(2) = 1 and T(n) = T(n-1) + T(n-2) + T(n-3) for n > 2. Given n, return T(n). Build the companion matrix for a depth-3 recurrence instead of hardcoding a 2x2.",
        "Example 1:\nInput: n = 4\nOutput: 4\nExplanation: T(3) = 0 + 1 + 1 = 2 and T(4) = 2 + 1 + 1 = 4.",
        "Example 2:\nInput: n = 25\nOutput: 1389537",
        "Constraints:\n- 0 <= n <= 37\n- The answer fits in a 32-bit signed integer",
      ],
      code: `class Solution {
    using Mat = array<array<long long, 3>, 3>;

    Mat mul(const Mat& a, const Mat& b) {
        Mat c{};
        for (int i = 0; i < 3; i++)
            for (int k = 0; k < 3; k++) {
                if (a[i][k] == 0) continue;       // companion matrices are mostly zero
                for (int j = 0; j < 3; j++)
                    c[i][j] += a[i][k] * b[k][j];
            }
        return c;
    }

public:
    int tribonacci(int n) {
        if (n == 0) return 0;
        if (n <= 2) return 1;
        // state vector is [T(k), T(k-1), T(k-2)]
        Mat base = {{{1, 1, 1}, {1, 0, 0}, {0, 1, 0}}};
        Mat res  = {{{1, 0, 0}, {0, 1, 0}, {0, 0, 1}}};
        int e = n - 2;                            // res = M^(n-2) applied to [T(2), T(1), T(0)]
        while (e > 0) {
            if (e & 1) res = mul(res, base);
            base = mul(base, base);
            e >>= 1;
        }
        // dot the first row with the seed vector [1, 1, 0]
        return (int)(res[0][0] * 1 + res[0][1] * 1 + res[0][2] * 0);
    }
};`,
      explanation: [
        "Any linear recurrence of order d with constant coefficients, x(n) = c1*x(n-1) + ... + cd*x(n-d), turns into a d x d companion matrix: the first row holds the coefficients c1..cd, and the remaining rows form a shifted identity that pushes each old value one slot down the state vector. Here d = 3 and the coefficients are all 1.",
        "Choosing the base exponent is where errors hide. The state vector v(k) = [T(k), T(k-1), T(k-2)] is only fully known once k = 2, so the seed is v(2) = [1, 1, 0] and v(n) = M^(n-2) * v(2). Reading a single matrix entry is no longer enough, because the seed vector is not a unit vector - you have to take the actual dot product of the top row with the seed.",
        "A cheaper alternative that many people miss: instead of computing the whole matrix power and then multiplying by a vector, you can multiply matrix-by-vector at each step of the exponentiation only if you process bits from the top down. Bottom-up bit order forces the full matrix product. For small d neither matters; for d in the hundreds this choice is the difference between d^3 and d^2 per step.",
        "The zero-skip in the multiply loop is worth keeping as a habit: companion matrices have O(d) non-zero entries, so on the first few squarings the inner loop is skipped almost everywhere.",
        "Time: O(d^3 log n) with d = 3, so O(log n). Space: O(d^2) = O(1).",
      ],
    },
    {
      name: "Sparse Matrix Multiplication",
      difficulty: "Medium",
      variation: "The multiply kernel itself, exploiting sparsity",
      link: "https://leetcode.com/problems/sparse-matrix-multiplication/",
      question: [
        "Given two sparse matrices mat1 of size m x k and mat2 of size k x n, return the product mat1 * mat2. You may assume the multiplication is always possible. Sparse means most entries are zero, and the solution should avoid work proportional to the dense size when it can.",
        "Example 1:\nInput: mat1 = [[1,0,0],[-1,0,3]], mat2 = [[7,0,0],[0,0,0],[0,0,1]]\nOutput: [[7,0,0],[-7,0,3]]\nExplanation: Row 0 of the product is 1*[7,0,0] = [7,0,0]. Row 1 is -1*[7,0,0] + 3*[0,0,1] = [-7,0,3].",
        "Example 2:\nInput: mat1 = [[0]], mat2 = [[0]]\nOutput: [[0]]",
        "Constraints:\n- 1 <= m, k, n <= 100\n- -100 <= mat1[i][j], mat2[i][j] <= 100",
      ],
      code: `vector<vector<int>> multiply(vector<vector<int>>& mat1, vector<vector<int>>& mat2) {
    int m = mat1.size(), k = mat2.size(), n = mat2[0].size();
    vector<vector<int>> res(m, vector<int>(n, 0));
    for (int i = 0; i < m; i++)
        for (int p = 0; p < k; p++) {
            if (mat1[i][p] == 0) continue;        // skips an entire row of mat2
            int a = mat1[i][p];
            for (int j = 0; j < n; j++)
                res[i][j] += a * mat2[p][j];      // row-scaled accumulation
        }
    return res;
}`,
      explanation: [
        "The loop order here is i-p-j, not the textbook i-j-p. Both compute the same sums, but i-p-j reads the product as 'row i of the answer is a linear combination of the rows of mat2, weighted by row i of mat1'. That framing is what makes the sparsity test possible: a zero in mat1[i][p] kills the contribution of a whole row of mat2 at once, so one comparison replaces n multiply-adds.",
        "The reordering is also the cache-friendly order for row-major storage: the innermost loop walks res[i] and mat2[p] forward in memory, while i-j-p would stride down a column of mat2. Even on dense input, i-p-j is typically the faster of the two on real hardware, so it is a good default for the matrix-power kernel used throughout this topic.",
        "The wrong-but-tempting version is to build hash maps of non-zero coordinates for both matrices and iterate over pairs. That is a genuine win only when both matrices are extremely sparse; at these sizes the hashing overhead loses badly to a plain triple loop with a zero check.",
        "One correctness note for the modular versions later on: the accumulation res[i][j] += a * mat2[p][j] must not overflow. With entries reduced modulo about 10^9, each product is near 10^18 and a 64-bit accumulator can hold only a handful of them, so a modular kernel has to reduce inside the inner loop rather than at the end.",
        "Time: O(m*k*n) worst case, but only O(m*k + nz*n) where nz is the number of non-zeros in mat1. Space: O(m*n) for the output.",
      ],
    },
    {
      name: "Fibonacci Numbers (CSES)",
      difficulty: "Medium",
      variation: "Huge exponent under a modulus",
      question: [
        "Your task is to calculate the n-th Fibonacci number modulo 10^9 + 7, where F(0) = 0, F(1) = 1 and F(n) = F(n-1) + F(n-2). The input is a single integer n, which can be as large as 10^18, so anything linear in n is hopeless.",
        "Example 1:\nInput: 10\nOutput: 55",
        "Example 2:\nInput: 1000000000000000000\nOutput: 209783453\nExplanation: F(10^18) reduced modulo 10^9 + 7.",
        "Constraints:\n- 0 <= n <= 10^18\n- All arithmetic is modulo 10^9 + 7",
      ],
      code: `const long long MOD = 1000000007;
using Mat = array<array<long long, 2>, 2>;

Mat mul(const Mat& a, const Mat& b) {
    Mat c{};
    for (int i = 0; i < 2; i++)
        for (int k = 0; k < 2; k++)
            for (int j = 0; j < 2; j++)
                c[i][j] = (c[i][j] + a[i][k] * b[k][j]) % MOD;   // reduce every step
    return c;
}

int main() {
    long long n;
    cin >> n;
    if (n == 0) { cout << 0 << "\\n"; return 0; }
    Mat base = {{{1, 1}, {1, 0}}};
    Mat res  = {{{1, 0}, {0, 1}}};
    long long e = n - 1;                          // exponent itself needs 64 bits
    while (e > 0) {
        if (e & 1) res = mul(res, base);
        base = mul(base, base);
        e >>= 1;
    }
    cout << res[0][0] << "\\n";
    return 0;
}`,
      explanation: [
        "Nothing about the algorithm changes from the plain Fibonacci version; only the arithmetic does. Since taking a remainder commutes with addition and multiplication, reducing intermediate entries never changes the final residue, so the matrix power can be carried out entirely inside the ring of integers modulo 10^9 + 7.",
        "The reduction has to happen inside the inner loop. Each entry is below 10^9, so one product is below 10^18, which still fits in a signed 64-bit integer - but two of them summed would not. Accumulating the whole dot product before reducing is the classic overflow bug in this template, and it is silent: small tests pass because the intermediate sums stay small.",
        "The exponent must be a 64-bit type as well. Reading n into an int, or writing the loop counter as int, truncates 10^18 and produces a plausible-looking wrong answer with no crash.",
        "A tempting alternative is Pisano periods - F(n) mod m repeats with some period, so reduce n first. That works but requires knowing or computing the period, and for a general modulus finding it is harder than just doing the log n matrix power. Fast doubling, which computes F(2k) = F(k)*(2*F(k+1) - F(k)) and F(2k+1) = F(k)^2 + F(k+1)^2, is the specialised version of exactly this matrix power and is a fine alternative for Fibonacci alone.",
        "Time: O(log n), around 60 iterations with 8 modular multiplications each. Space: O(1).",
      ],
    },
    {
      name: "Matrix Power (CSES)",
      difficulty: "Medium",
      variation: "Generic n x n power modulo a prime",
      question: [
        "You are given an n x n matrix A and an integer k. Compute A^k modulo 10^9 + 7 and print the resulting matrix, one row per line. Note that k may be zero, in which case the answer is the identity matrix.",
        "Example 1:\nInput:\n2 3\n1 1\n1 0\nOutput:\n3 2\n2 1\nExplanation: this is the Fibonacci companion matrix cubed, whose entries are F(4), F(3), F(3), F(2).",
        "Example 2:\nInput:\n2 0\n1 1\n1 0\nOutput:\n1 0\n0 1\nExplanation: any matrix to the power zero is the identity.",
        "Constraints:\n- 1 <= n <= 100\n- 0 <= k <= 10^9\n- 0 <= A[i][j] <= 10^9",
      ],
      code: `const long long MOD = 1000000007;
using Mat = vector<vector<long long>>;

Mat mul(const Mat& a, const Mat& b) {
    int n = a.size();
    Mat c(n, vector<long long>(n, 0));
    for (int i = 0; i < n; i++)
        for (int k = 0; k < n; k++) {
            if (a[i][k] == 0) continue;
            for (int j = 0; j < n; j++)
                c[i][j] = (c[i][j] + a[i][k] * b[k][j]) % MOD;
        }
    return c;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    long long k;
    cin >> n >> k;
    Mat a(n, vector<long long>(n));
    for (auto& row : a)
        for (auto& x : row) { cin >> x; x %= MOD; }   // reduce the input too
    Mat res(n, vector<long long>(n, 0));
    for (int i = 0; i < n; i++) res[i][i] = 1;        // identity handles k = 0 for free
    while (k > 0) {
        if (k & 1) res = mul(res, a);
        a = mul(a, a);
        k >>= 1;
    }
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            cout << res[i][j] << " \\n"[j == n - 1];
    return 0;
}`,
      explanation: [
        "This is the reusable core of the topic with nothing problem-specific attached. Initialising the accumulator to the identity is what makes k = 0 correct without a special case, and it mirrors initialising an integer power accumulator to 1.",
        "The cost is n^3 per multiply and about 2*log k multiplies, so 100^3 * 2 * 30 is roughly 6*10^7 modular multiply-adds - comfortable, but only because the multiply is a tight triple loop over contiguous memory. Allocating a fresh vector-of-vectors inside mul is the main avoidable overhead; a flat vector of size n*n indexed by i*n+j is measurably faster if a problem is tight.",
        "Two subtle input issues. The entries must be reduced on the way in, because an unreduced 10^9 entry multiplied by another gives a product near 10^18 that leaves no headroom for the running sum. And k must be read as a 64-bit value if the statement allows it to exceed 2^31, which several variants of this problem do.",
        "The standard trap is squaring the wrong operand or updating in the wrong order - writing res = mul(res, a) after a = mul(a, a) inside the same iteration silently computes a different, larger power. Keep the two lines in the fixed order: consume the bit first, then square.",
        "Time: O(n^3 log k). Space: O(n^2).",
      ],
    },
    {
      name: "Knight Dialer",
      difficulty: "Medium",
      variation: "Counting walks on a fixed state graph",
      link: "https://leetcode.com/problems/knight-dialer/",
      question: [
        "A chess knight stands on a phone keypad laid out as three rows 1-2-3, 4-5-6, 7-8-9 and a bottom row containing only 0 in the middle position. The knight may start on any numeric cell and then makes exactly n - 1 valid knight moves, dialling the digit of every cell it lands on, so it dials a number of exactly n digits. Return how many distinct numbers of length n can be dialled, modulo 10^9 + 7.",
        "Example 1:\nInput: n = 1\nOutput: 10\nExplanation: every single digit is reachable as a starting cell.",
        "Example 2:\nInput: n = 2\nOutput: 20\nExplanation: 20 is the number of legal knight moves on this keypad; 5 has none, 4 and 6 have three each, and the other seven digits have two each.",
        "Example 3:\nInput: n = 3131\nOutput: 136006598",
        "Constraints:\n- 1 <= n <= 5000\n- Answer modulo 10^9 + 7",
      ],
      code: `class Solution {
    static const long long MOD = 1000000007;
    using Mat = vector<vector<long long>>;

    Mat mul(const Mat& a, const Mat& b) {
        int n = a.size();
        Mat c(n, vector<long long>(n, 0));
        for (int i = 0; i < n; i++)
            for (int k = 0; k < n; k++) {
                if (!a[i][k]) continue;
                for (int j = 0; j < n; j++)
                    c[i][j] = (c[i][j] + a[i][k] * b[k][j]) % MOD;
            }
        return c;
    }

public:
    int knightDialer(int n) {
        vector<vector<int>> moves = {
            {4, 6}, {6, 8}, {7, 9}, {4, 8}, {3, 9, 0},
            {}, {1, 7, 0}, {2, 6}, {1, 3}, {2, 4}
        };
        Mat a(10, vector<long long>(10, 0));
        for (int u = 0; u < 10; u++)
            for (int v : moves[u]) a[v][u] = 1;    // column u holds the successors of u
        Mat res(10, vector<long long>(10, 0));
        for (int i = 0; i < 10; i++) res[i][i] = 1;
        int e = n - 1;
        while (e > 0) {
            if (e & 1) res = mul(res, a);
            a = mul(a, a);
            e >>= 1;
        }
        long long ans = 0;
        for (int i = 0; i < 10; i++)
            for (int j = 0; j < 10; j++)
                ans = (ans + res[i][j]) % MOD;     // any start, any end
        return (int)ans;
    }
};`,
      explanation: [
        "The key fact behind every counting-walks problem: if A is the adjacency matrix of a directed graph, then (A^L)[u][v] is the number of walks of exactly L edges from u to v. The proof is induction plus the definition of matrix multiplication - the sum over k of walks u to k of length L-1 times edges k to v partitions the length-L walks by their second-to-last vertex, with no overlap and no omission.",
        "Here the graph has 10 vertices, one per digit, and a dialled number of length n is precisely a walk of n - 1 edges. Since the knight may start and end anywhere, the answer is the sum of every entry of A^(n-1). Note that 5 is an isolated vertex, which is exactly why n = 1 gives 10 but n = 2 gives 20 rather than 25 or more.",
        "Orientation matters. Writing a[v][u] = 1 for an edge u to v means the matrix acts on column vectors of counts as count' = A * count, which is the convention every problem in this bank uses. Filling a[u][v] instead computes walks in the transposed graph; for this particular keypad the move relation happens to be symmetric so the bug hides, which is precisely what makes it dangerous to carry into an asymmetric problem.",
        "With n <= 5000 a plain O(10 n) DP is simpler and faster, and in an interview you should say so. The matrix form is the right answer when n grows to 10^9 or larger, and this problem is the cleanest place to learn the adjacency-power idea before applying it to automata that are not graphs on a keypad.",
        "Time: O(V^3 log n) with V = 10, so about 1000 * 26 modular multiplies. Space: O(V^2).",
      ],
    },
    {
      name: "Graph Paths I (CSES)",
      difficulty: "Medium",
      variation: "Walks of exactly k edges between two nodes",
      question: [
        "A game consists of n rooms and m teleporters. At every room you must choose exactly one outgoing teleporter and use it. Your task is to count the number of ways you can move from room 1 to room n using exactly k teleporters, modulo 10^9 + 7. Note that there may be several teleporters between the same pair of rooms, and each of them counts as a distinct way.",
        "Example 1:\nInput:\n4 5 2\n1 2\n2 3\n3 4\n1 3\n2 4\nOutput:\n2\nExplanation: the two-teleporter routes from room 1 to room 4 are 1-2-4 and 1-3-4.",
        "Example 2:\nInput:\n4 5 3\n1 2\n2 3\n3 4\n1 3\n2 4\nOutput:\n1\nExplanation: the only three-teleporter route is 1-2-3-4.",
        "Constraints:\n- 1 <= n <= 100\n- 1 <= m <= 2*10^5\n- 1 <= k <= 10^9\n- Teleporters are directed and may repeat",
      ],
      code: `const long long MOD = 1000000007;
using Mat = vector<vector<long long>>;

Mat mul(const Mat& a, const Mat& b) {
    int n = a.size();
    Mat c(n, vector<long long>(n, 0));
    for (int i = 0; i < n; i++)
        for (int k = 0; k < n; k++) {
            if (!a[i][k]) continue;
            for (int j = 0; j < n; j++)
                c[i][j] = (c[i][j] + a[i][k] * b[k][j]) % MOD;
        }
    return c;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    long long k;
    cin >> n >> m >> k;
    Mat a(n, vector<long long>(n, 0));
    for (int i = 0; i < m; i++) {
        int u, v;
        cin >> u >> v;
        a[u - 1][v - 1]++;              // multiplicity, not a boolean flag
    }
    Mat res(n, vector<long long>(n, 0));
    for (int i = 0; i < n; i++) res[i][i] = 1;
    while (k > 0) {
        if (k & 1) res = mul(res, a);
        a = mul(a, a);
        k >>= 1;
    }
    cout << res[0][n - 1] << "\\n";
    return 0;
}`,
      explanation: [
        "This is the adjacency-power theorem applied literally: the answer is entry [1][n] of A^k, where A[u][v] counts edges from u to v. Because the problem says parallel teleporters are distinguishable, A must store multiplicities - incrementing rather than setting to 1 is the entire difference between correct and wrong here, and with m up to 2*10^5 edges over only 100 rooms duplicates are guaranteed to appear.",
        "Orientation is set by which index is the row. Here a[u-1][v-1] with the answer read at res[0][n-1] means row index is the source, so this convention computes walks from row to column; that is self-consistent as long as the read matches the fill. Mixing this with the column-vector convention used in the automaton problems is the most common source of transposed answers.",
        "Note that the walk is a walk, not a path: rooms and teleporters may repeat, which is exactly why matrix powering works. Counting simple paths of length k is a completely different and much harder problem, and no amount of matrix algebra solves it.",
        "There is no need to special-case unreachability - if no walk of exactly k edges exists the entry is simply 0, which is the required output.",
        "Time: O(n^3 log k + m), about 10^6 * 30 modular operations at n = 100. Space: O(n^2).",
      ],
    },
    {
      name: "Count Vowels Permutation",
      difficulty: "Hard",
      variation: "Automaton over an alphabet with adjacency rules",
      link: "https://leetcode.com/problems/count-vowels-permutation/",
      question: [
        "Count the number of strings of length n that use only the lowercase vowels a, e, i, o, u and satisfy all of the following rules: each 'a' may only be followed by an 'e'; each 'e' may only be followed by an 'a' or an 'i'; each 'i' may not be followed by another 'i'; each 'o' may only be followed by an 'i' or a 'u'; and each 'u' may only be followed by an 'a'. Return the count modulo 10^9 + 7.",
        "Example 1:\nInput: n = 1\nOutput: 5\nExplanation: the five single-letter strings a, e, i, o, u.",
        "Example 2:\nInput: n = 2\nOutput: 10\nExplanation: ae, ea, ei, ia, ie, io, iu, oi, ou, ua.",
        "Example 3:\nInput: n = 5\nOutput: 68",
        "Constraints:\n- 1 <= n <= 2*10^4\n- Answer modulo 10^9 + 7",
      ],
      code: `class Solution {
    static const long long MOD = 1000000007;
    using Mat = vector<vector<long long>>;

    Mat mul(const Mat& a, const Mat& b) {
        int n = a.size();
        Mat c(n, vector<long long>(n, 0));
        for (int i = 0; i < n; i++)
            for (int k = 0; k < n; k++) {
                if (!a[i][k]) continue;
                for (int j = 0; j < n; j++)
                    c[i][j] = (c[i][j] + a[i][k] * b[k][j]) % MOD;
            }
        return c;
    }

public:
    int countVowelPermutation(int n) {
        // states 0..4 are a, e, i, o, u; next[u] lists the letters allowed after u
        vector<vector<int>> nxt = {{1}, {0, 2}, {0, 1, 3, 4}, {2, 4}, {0}};
        Mat a(5, vector<long long>(5, 0));
        for (int u = 0; u < 5; u++)
            for (int v : nxt[u]) a[v][u] = 1;      // column u = successors of u
        Mat res(5, vector<long long>(5, 0));
        for (int i = 0; i < 5; i++) res[i][i] = 1;
        int e = n - 1;
        while (e > 0) {
            if (e & 1) res = mul(res, a);
            a = mul(a, a);
            e >>= 1;
        }
        long long ans = 0;
        for (int i = 0; i < 5; i++)
            for (int j = 0; j < 5; j++)
                ans = (ans + res[i][j]) % MOD;     // any first letter, any last letter
        return (int)ans;
    }
};`,
      explanation: [
        "The five rules are a transition relation on a five-state automaton, so this is Knight Dialer with a different graph. The mechanical step is translating each English rule into edges: 'a may only be followed by e' is the single edge a to e, while 'i may not be followed by i' is the complement - four edges from i to everything except itself. Getting that one rule backwards is the usual failure, because it is the only negative constraint in the list.",
        "Once the edge set is fixed, a string of length n is a walk of n - 1 edges and the answer is the sum of all entries of A^(n-1). The n = 2 example is a direct check on the edge count: 1 + 2 + 4 + 2 + 1 = 10 edges, matching the ten listed two-letter strings.",
        "The tempting shortcut is to reason forwards in English and write recurrences like 'the number ending in a equals the number ending in e plus the number ending in i plus the number ending in u'. That is correct, but it is the transposed reading of the rules - it lists the predecessors of a, derived by inverting each rule. Both formulations work; mixing one rule from each is what produces answers that are right for n <= 2 and wrong afterwards.",
        "At n = 2*10^4 the linear DP over five states is trivially fast, so the matrix version is not needed for the stated limits. It is the reason to structure the solution this way anyway: the identical code answers the same question for n = 10^18, which is how this appears in contest form.",
        "Time: O(S^3 log n) with S = 5 states. Space: O(S^2).",
      ],
    },
    {
      name: "Student Attendance Record II",
      difficulty: "Hard",
      variation: "Compound automaton state, product of two counters",
      link: "https://leetcode.com/problems/student-attendance-record-ii/",
      question: [
        "An attendance record is a string where each character is 'A' for absent, 'L' for late, or 'P' for present. A record is rewardable if it contains strictly fewer than 2 'A' characters in total and never contains 3 or more consecutive 'L' characters. Given n, return the number of rewardable records of length n, modulo 10^9 + 7.",
        "Example 1:\nInput: n = 2\nOutput: 8\nExplanation: of the 9 strings of length 2 only 'AA' is not rewardable, since it holds two absences.",
        "Example 2:\nInput: n = 1\nOutput: 3\nExplanation: 'A', 'L' and 'P' are all rewardable.",
        "Example 3:\nInput: n = 10101\nOutput: 183236316",
        "Constraints:\n- 1 <= n <= 10^5\n- Answer modulo 10^9 + 7",
      ],
      code: `class Solution {
    static const long long MOD = 1000000007;
    using Mat = vector<vector<long long>>;

    Mat mul(const Mat& a, const Mat& b) {
        int n = a.size();
        Mat c(n, vector<long long>(n, 0));
        for (int i = 0; i < n; i++)
            for (int k = 0; k < n; k++) {
                if (!a[i][k]) continue;
                for (int j = 0; j < n; j++)
                    c[i][j] = (c[i][j] + a[i][k] * b[k][j]) % MOD;
            }
        return c;
    }

public:
    int checkRecord(int n) {
        // state = (number of A so far in 0..1, trailing run of L in 0..2), id = a*3 + l
        Mat a(6, vector<long long>(6, 0));
        for (int av = 0; av < 2; av++)
            for (int l = 0; l < 3; l++) {
                int u = av * 3 + l;
                a[av * 3 + 0][u] += 1;                 // append P: L-run resets
                if (av == 0) a[1 * 3 + 0][u] += 1;     // append A: only if none used yet
                if (l < 2) a[av * 3 + l + 1][u] += 1;  // append L: only if run stays <= 2
            }
        Mat res(6, vector<long long>(6, 0));
        for (int i = 0; i < 6; i++) res[i][i] = 1;
        int e = n;
        while (e > 0) {
            if (e & 1) res = mul(res, a);
            a = mul(a, a);
            e >>= 1;
        }
        long long ans = 0;
        for (int i = 0; i < 6; i++)
            ans = (ans + res[i][0]) % MOD;             // start from state (0 A, run 0)
        return (int)ans;
    }
};`,
      explanation: [
        "The state has to capture everything about a prefix that constrains its continuations, and nothing more. Two facts qualify: how many 'A' characters have been used, capped at 1 because 2 is already dead, and the length of the current trailing run of 'L', capped at 2 for the same reason. Everything else about the prefix is irrelevant, giving 2 * 3 = 6 live states.",
        "That product structure is the real lesson: a global counter constraint and a local run constraint compose by taking the Cartesian product of their state spaces, and the transition matrix is built by walking every state and every possible next character. Illegal moves are simply omitted rather than handled as special cases, which is why the loop guards read as 'only if it stays legal'.",
        "Here the exponent is n, not n - 1, because the state vector starts at the empty prefix - state (0, 0) with count 1 - and each matrix application appends one character. Confusing the 'walk of n-1 edges' framing from the previous problems with this 'apply n times from an empty seed' framing is the standard off-by-one. Checking n = 1 against the answer 3 settles it immediately.",
        "Since the seed is a unit vector, only column 0 of the resulting matrix is needed and the answer is the sum of that column - all six states are accepting, since none of them represents a violated rule.",
        "Time: O(S^3 log n) with S = 6, versus O(S n) for the straightforward DP; the matrix form is what extends the same solution to n = 10^9. Space: O(S^2).",
      ],
    },
    {
      name: "Graph Paths II (CSES)",
      difficulty: "Hard",
      variation: "Min-plus matrix power for shortest walk of fixed length",
      question: [
        "A game consists of n rooms and m teleporters, each teleporter directed and having a positive length. Your task is to calculate the minimum total length of a route from room 1 to room n that uses exactly k teleporters. If no such route exists, print -1.",
        "Example 1:\nInput:\n4 5 2\n1 2 4\n2 4 1\n1 3 2\n3 4 6\n2 3 1\nOutput:\n5\nExplanation: the two-teleporter routes are 1-2-4 of length 4+1 = 5 and 1-3-4 of length 2+6 = 8, so 5 wins.",
        "Example 2:\nInput:\n4 5 3\n1 2 4\n2 4 1\n1 3 2\n3 4 6\n2 3 1\nOutput:\n11\nExplanation: the only three-teleporter route is 1-2-3-4 of length 4+1+6 = 11.",
        "Constraints:\n- 1 <= n <= 100\n- 1 <= m <= 2*10^5\n- 1 <= k <= 10^9\n- 1 <= length <= 10^9",
      ],
      code: `const long long INF = (long long)4e18;
using Mat = vector<vector<long long>>;

// (min, +) product: minimum over the intermediate node instead of a sum of products
Mat minplus(const Mat& a, const Mat& b) {
    int n = a.size();
    Mat c(n, vector<long long>(n, INF));
    for (int i = 0; i < n; i++)
        for (int k = 0; k < n; k++) {
            if (a[i][k] == INF) continue;               // guard against INF + INF overflow
            for (int j = 0; j < n; j++)
                if (b[k][j] != INF) c[i][j] = min(c[i][j], a[i][k] + b[k][j]);
        }
    return c;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    long long k;
    cin >> n >> m >> k;
    Mat a(n, vector<long long>(n, INF));
    for (int i = 0; i < m; i++) {
        int u, v;
        long long w;
        cin >> u >> v >> w;
        a[u - 1][v - 1] = min(a[u - 1][v - 1], w);      // keep only the cheapest parallel edge
    }
    Mat res(n, vector<long long>(n, INF));
    for (int i = 0; i < n; i++) res[i][i] = 0;          // identity of (min, +) is 0 on the diagonal
    while (k > 0) {
        if (k & 1) res = minplus(res, a);
        a = minplus(a, a);
        k >>= 1;
    }
    long long ans = res[0][n - 1];
    cout << (ans == INF ? -1 : ans) << "\\n";
    return 0;
}`,
      explanation: [
        "Binary exponentiation needs only associativity, not ordinary arithmetic. Replace multiply by plus and plus by min and you get the tropical or (min, +) semiring, which is associative, so the identical square-and-multiply loop computes tropical powers. In that semiring entry [u][v] of A^k is the minimum total weight of a walk from u to v using exactly k edges - the direct analogue of the counting theorem, with min replacing the sum over decompositions.",
        "The identity element changes and this is the part people get wrong. In (min, +) the neutral element for plus is 0 and the absorbing element is infinity, so the identity matrix has 0 on the diagonal and INF everywhere else, not 1 and 0. Seeding res with the ordinary identity gives nonsense that happens to look plausible for k = 1.",
        "Because parallel edges only ever matter through the cheapest one, storing min on input collapses 2*10^5 edges into an n x n table with no loss - unlike the counting version, where multiplicities had to be preserved.",
        "The overflow guard is not decoration. With INF near 4*10^18, adding two INF values wraps around into a small negative number and silently poisons the result, so both operands must be tested before the addition. Choosing INF as roughly half of the 64-bit maximum plus explicit guards is the robust combination; the true answers reach only about 10^9 * 10^9 = 10^18 in the worst case, which does fit.",
        "Note this is genuinely different from Floyd-Warshall or Dijkstra, which find shortest walks of any length. Fixing the edge count to exactly k makes the problem non-monotone - a longer route can be forced - and that is precisely what the fixed-power formulation captures.",
        "Time: O(n^3 log k + m). Space: O(n^2).",
      ],
    },
  ],
};
