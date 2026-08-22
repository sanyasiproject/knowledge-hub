import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Gaussian Elimination to Solve Linear Equations",
      difficulty: "Easy",
      variation: "Square system with a unique solution, template",
      question: [
        "You are given a system of n linear equations in n unknowns, supplied as an n x (n + 1) augmented matrix a, where row i holds the coefficients a[i][0..n-1] followed by the right-hand side a[i][n]. Reduce the matrix to diagonal form using Gauss-Jordan elimination with partial pivoting and return the solution vector x. If the coefficient matrix is singular (no unique solution), return an empty vector.",
        "Example 1:\nInput: a = [[3,2,-4,3],[2,3,3,15],[5,-3,1,14]]\nOutput: [3, 1, 2]\nExplanation: 3*3 + 2*1 - 4*2 = 3, 2*3 + 3*1 + 3*2 = 15, and 5*3 - 3*1 + 1*2 = 14, so x = 3, y = 1, z = 2.",
        "Example 2:\nInput: a = [[1,1,3],[2,3,8]]\nOutput: [1, 2]\nExplanation: x + y = 3 and 2x + 3y = 8 give x = 1, y = 2.",
        "Constraints:\n- 1 <= n <= 300\n- All entries fit comfortably in a double\n- Answers are accepted within 1e-6 absolute error",
      ],
      code: `vector<double> gaussJordan(vector<vector<double>> a) {
    int n = a.size();               // a is n x (n + 1), already augmented
    const double EPS = 1e-9;
    for (int col = 0; col < n; col++) {
        int sel = col;
        for (int i = col; i < n; i++)
            if (fabs(a[i][col]) > fabs(a[sel][col])) sel = i;   // partial pivot: largest magnitude
        if (fabs(a[sel][col]) < EPS) return {};                 // singular coefficient matrix
        swap(a[sel], a[col]);
        for (int i = 0; i < n; i++) {
            if (i == col) continue;                             // clear the column above AND below
            double f = a[i][col] / a[col][col];
            for (int j = col; j <= n; j++) a[i][j] -= f * a[col][j];
        }
    }
    vector<double> x(n);
    for (int i = 0; i < n; i++) x[i] = a[i][n] / a[i][i];        // matrix is now diagonal
    return x;
}`,
      explanation: [
        "The state is the augmented matrix itself. Every operation applied - swapping two rows, and adding a multiple of one row to another - is an invertible row operation, so the solution set of the system is unchanged at every step. That invariance is the whole correctness argument: at the end the matrix is diagonal, and a diagonal system can be read off directly.",
        "Gauss-Jordan differs from plain Gaussian elimination only in that the pivot column is cleared above the pivot as well as below it. That removes the back-substitution loop at the cost of the same asymptotic work, and it is what makes the augmented-identity trick for matrix inverses fall out for free.",
        "Partial pivoting is not cosmetic. Choosing the largest-magnitude pivot in the remaining column keeps the multipliers f at most 1 in absolute value, which stops rounding error from being amplified. A tempting but wrong implementation just uses a[col][col] as the pivot and only checks it against zero: on a matrix like [[1e-12, 1],[1, 1]] that is technically non-singular but the elimination loses every significant digit.",
        "Comparing a pivot against an epsilon rather than against exact zero is likewise required with floating point - an exactly singular matrix rarely produces an exact zero after a few subtractions.",
        "Time: O(n^3). Space: O(n^2).",
      ],
    },
    {
      name: "Program for Rank of a Matrix",
      difficulty: "Easy",
      variation: "Row echelon form, rank of a rectangular matrix",
      question: [
        "Given a matrix of size n x m, return its rank - the number of linearly independent rows, equivalently the number of non-zero pivots produced by reducing the matrix to row echelon form.",
        "Example 1:\nInput: mat = [[1,2,3],[2,4,6],[3,6,9]]\nOutput: 1\nExplanation: Row 2 is 2 times row 1 and row 3 is 3 times row 1, so only one row is independent.",
        "Example 2:\nInput: mat = [[10,20,10],[-20,-30,10],[30,50,0]]\nOutput: 2\nExplanation: Row 3 equals row 1 minus row 2, so the third row adds nothing; the first two rows are independent.",
        "Constraints:\n- 1 <= n, m <= 500\n- Entries fit in a double",
      ],
      code: `int matrixRank(vector<vector<double>> a) {
    int n = a.size(), m = a[0].size();
    const double EPS = 1e-9;
    int rk = 0;
    for (int col = 0; col < m && rk < n; col++) {
        int sel = rk;
        for (int i = rk; i < n; i++)
            if (fabs(a[i][col]) > fabs(a[sel][col])) sel = i;
        if (fabs(a[sel][col]) < EPS) continue;   // no pivot in this column, move on without advancing the rank
        swap(a[sel], a[rk]);
        for (int i = rk + 1; i < n; i++) {       // echelon form is enough, no need to clear upwards
            double f = a[i][col] / a[rk][col];
            for (int j = col; j < m; j++) a[i][j] -= f * a[rk][j];
        }
        rk++;
    }
    return rk;
}`,
      explanation: [
        "Rank is the dimension of the row space, and row operations do not change the row space. So reducing to echelon form and counting non-zero pivot rows gives the rank of the original matrix.",
        "The loop decouples the column index from the row index. A column that is entirely zero from the current pivot row downwards contributes no pivot, so col advances while rank does not - this is the only structural difference from a square-system solve, and it is what makes the routine work on rectangular and rank-deficient input.",
        "Because the matrix need not be square, rank <= min(n, m) automatically: the loop stops when either the columns run out or every row has become a pivot row.",
        "The trap is the epsilon. With integer input it is tempting to work in exact integers via fraction-free elimination, but with doubles a dependent row typically reduces to values around 1e-16 rather than 0, and comparing to exact zero then overcounts the rank.",
        "Time: O(n * m * min(n, m)). Space: O(n * m).",
      ],
    },
    {
      name: "Determinant of a Matrix",
      difficulty: "Medium",
      variation: "Determinant as the product of pivots",
      question: [
        "Given an n x n matrix, compute its determinant using Gaussian elimination rather than the recursive cofactor expansion.",
        "Example 1:\nInput: mat = [[1,2],[3,4]]\nOutput: -2\nExplanation: 1*4 - 2*3 = -2.",
        "Example 2:\nInput: mat = [[6,1,1],[4,-2,5],[2,8,7]]\nOutput: -306\nExplanation: 6*(-14-40) - 1*(28-10) + 1*(32+4) = -324 - 18 + 36 = -306.",
        "Constraints:\n- 1 <= n <= 300\n- Entries fit in a double",
      ],
      code: `double determinant(vector<vector<double>> a) {
    int n = a.size();
    const double EPS = 1e-9;
    double det = 1.0;
    for (int col = 0; col < n; col++) {
        int sel = col;
        for (int i = col; i < n; i++)
            if (fabs(a[i][col]) > fabs(a[sel][col])) sel = i;
        if (fabs(a[sel][col]) < EPS) return 0.0;                 // a zero column means rank deficiency
        if (sel != col) { swap(a[sel], a[col]); det = -det; }    // each row swap flips the sign
        det *= a[col][col];
        for (int i = col + 1; i < n; i++) {
            double f = a[i][col] / a[col][col];
            for (int j = col; j < n; j++) a[i][j] -= f * a[col][j];
        }
    }
    return det;
}`,
      explanation: [
        "Adding a multiple of one row to another leaves the determinant untouched, and swapping two rows negates it. Those two facts mean the determinant of the original matrix equals the determinant of the resulting upper-triangular matrix, up to the sign accumulated from the swaps.",
        "An upper-triangular determinant is just the product of the diagonal, so the answer is the product of the pivots times (-1) raised to the number of swaps. Multiplying each pivot in as it is discovered avoids a second pass.",
        "The subtlety is that partial pivoting is now mandatory for a reason beyond stability: without a swap a zero appearing at a[col][col] would force a division by zero even when the matrix is perfectly invertible. Conversely, if the entire remaining column is zero the rank is deficient and the determinant is exactly 0, so returning early is correct.",
        "Scaling a row to make the pivot 1 is a common variation, but then you must divide the running determinant by the same factor - forgetting that is the classic bug. Leaving pivots unscaled, as here, sidesteps it.",
        "For an exact answer on integer input, run the same elimination modulo a prime (or use fraction-free Bareiss elimination) instead of doubles; large determinants overflow the mantissa long before they overflow the exponent.",
        "Time: O(n^3). Space: O(n^2).",
      ],
    },
    {
      name: "Finding Inverse of a Matrix Using Gauss-Jordan Elimination",
      difficulty: "Medium",
      variation: "Augmented identity, reduced row echelon form",
      question: [
        "Given an n x n matrix a, compute its inverse by augmenting it with the n x n identity matrix and reducing the left block to the identity with Gauss-Jordan elimination. The right block then holds the inverse. Return an empty matrix if a is singular.",
        "Example 1:\nInput: a = [[2,1],[1,1]]\nOutput: [[1,-1],[-1,2]]\nExplanation: The determinant is 1, and multiplying the two matrices gives the identity.",
        "Example 2:\nInput: a = [[1,2],[3,4]]\nOutput: [[-2,1],[1.5,-0.5]]\nExplanation: The determinant is -2, so the inverse is (1 / -2) * [[4,-2],[-3,1]].",
        "Constraints:\n- 1 <= n <= 300\n- Entries fit in a double\n- Answers are accepted within 1e-6 absolute error",
      ],
      code: `vector<vector<double>> inverse(vector<vector<double>> a) {
    int n = a.size();
    const double EPS = 1e-9;
    for (int i = 0; i < n; i++) {
        a[i].resize(2 * n, 0.0);
        a[i][n + i] = 1.0;                  // augment with the identity
    }
    for (int col = 0; col < n; col++) {
        int sel = col;
        for (int i = col; i < n; i++)
            if (fabs(a[i][col]) > fabs(a[sel][col])) sel = i;
        if (fabs(a[sel][col]) < EPS) return {};   // singular, no inverse exists
        swap(a[sel], a[col]);
        double piv = a[col][col];
        for (int j = 0; j < 2 * n; j++) a[col][j] /= piv;   // normalise the pivot row to 1
        for (int i = 0; i < n; i++) {
            if (i == col) continue;
            double f = a[i][col];
            if (fabs(f) < EPS) continue;
            for (int j = 0; j < 2 * n; j++) a[i][j] -= f * a[col][j];
        }
    }
    vector<vector<double>> inv(n, vector<double>(n));
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) inv[i][j] = a[i][n + j];
    return inv;
}`,
      explanation: [
        "The whole sequence of row operations that turns a into the identity is itself a matrix product E = E_k ... E_1 with E * a = I, so E is exactly a inverse. Applying the same operations to an appended identity block computes E * I = E, which is why the right half emerges as the inverse with no extra work.",
        "This is precisely the variation Gauss-Jordan exists for. Plain Gaussian elimination stops at echelon form and would need n separate back-substitutions, one per column of the identity; clearing above the pivot as well turns all n solves into a single sweep.",
        "Pivot normalisation matters here in a way it did not for the determinant: the left block must end up as I, not merely diagonal, so each pivot row is divided by its pivot. Do that division across the full width 2n, not just the left half, or the answer comes out scaled by garbage.",
        "The tempting alternative - adjugate divided by determinant - is O(n^4) or worse via cofactors and is only ever practical for 2x2 and 3x3. Also, an ill-conditioned matrix is a warning sign: if you only need to solve a * x = b, solve the system directly rather than forming the inverse and multiplying, which is both slower and numerically worse.",
        "Time: O(n^3). Space: O(n^2).",
      ],
    },
    {
      name: "Find Maximum Subset XOR of a Given Set",
      difficulty: "Medium",
      variation: "Gaussian elimination over GF(2), linear basis",
      question: [
        "Given an array of non-negative integers, choose a non-empty subset whose bitwise XOR is as large as possible and return that maximum XOR value.",
        "Example 1:\nInput: a = [9, 8, 5]\nOutput: 13\nExplanation: 8 XOR 5 = 13, and no other subset beats it (9 XOR 8 = 1, 9 XOR 5 = 12, 9 XOR 8 XOR 5 = 4).",
        "Example 2:\nInput: a = [2, 4, 5]\nOutput: 7\nExplanation: 2 XOR 5 = 7 is the best of the seven subsets.",
        "Constraints:\n- 1 <= a.size() <= 10^5\n- 0 <= a[i] < 2^31",
      ],
      code: `int maxSubsetXOR(vector<int>& a) {
    vector<int> basis(32, 0);      // basis[b] is a vector whose highest set bit is b
    for (int v : a) {
        for (int b = 31; b >= 0; b--) {
            if (!((v >> b) & 1)) continue;
            if (!basis[b]) { basis[b] = v; break; }   // new independent direction
            v ^= basis[b];                            // reduce and keep looking
        }
    }
    int ans = 0;
    for (int b = 31; b >= 0; b--)
        if ((ans ^ basis[b]) > ans) ans ^= basis[b];   // greedily take any bit that improves
    return ans;
}`,
      explanation: [
        "Treat each number as a row vector over GF(2), one coordinate per bit. XOR is addition in that field, so the set of achievable subset XORs is exactly the linear span of the input rows, and the elimination loop is Gaussian elimination building a row echelon basis - basis[b] is the pivot row whose leading bit is b.",
        "Because at most one basis vector has a given leading bit, the greedy second pass is optimal: scanning from the top bit downwards, XOR-ing in basis[b] flips bit b and can only touch strictly lower bits. So taking the bit whenever it improves the answer is a lexicographic maximisation over the bits, and higher bits always outweigh everything below them.",
        "The naive approaches both fail at scale. Enumerating all 2^n subsets is hopeless, and greedily picking the largest elements is simply wrong - in example 1 the largest element 9 is not in the optimal subset at all.",
        "One boundary detail: an input of all zeros yields an empty basis and the answer 0, which is correct since any non-empty subset of zeros XORs to 0.",
        "Time: O(n * B) with B = 32 bit positions. Space: O(B).",
      ],
    },
    {
      name: "Xor Sum 3",
      difficulty: "Medium",
      variation: "GF(2) basis restricted to a bit mask",
      link: "https://atcoder.jp/contests/abc141/tasks/abc141_f",
      question: [
        "You are given N non-negative integers A_1 .. A_N. Split them into two non-empty groups. The score of a split is (XOR of the numbers in the first group) plus (XOR of the numbers in the second group). Print the maximum possible score.",
        "Example 1:\nInput:\n3\n3 6 5\nOutput: 12\nExplanation: The XOR of everything is 0, so both group XORs are equal; taking group one to be the single element 6 gives 6 + 6 = 12.",
        "Example 2:\nInput:\n4\n23 36 66 65\nOutput: 188\nExplanation: The XOR of everything is 48, which is fixed; the free bits contribute 2 * 70, for 48 + 140 = 188.",
        "Constraints:\n- 2 <= N <= 10^5\n- 0 <= A_i < 2^60",
      ],
      code: `int main() {
    int n;
    cin >> n;
    vector<unsigned long long> a(n);
    unsigned long long total = 0;
    for (auto& x : a) { cin >> x; total ^= x; }
    unsigned long long freeMask = ~total;          // bits where the two group XORs must agree
    vector<unsigned long long> basis(60, 0);
    for (auto x : a) {
        unsigned long long v = x & freeMask;       // drop the bits whose contribution is already fixed
        for (int b = 59; b >= 0; b--) {
            if (!((v >> b) & 1ULL)) continue;
            if (!basis[b]) { basis[b] = v; break; }
            v ^= basis[b];
        }
    }
    unsigned long long best = 0;
    for (int b = 59; b >= 0; b--)
        if ((best ^ basis[b]) > best) best ^= basis[b];
    cout << total + 2 * best << "\\n";
    return 0;
}`,
      explanation: [
        "Let X be the XOR of all N numbers and let P and Q be the two group XORs, so P XOR Q = X. Look at one bit position. If that bit is set in X then exactly one of P and Q has it, contributing 2^b to the sum no matter how the split is made. If the bit is clear in X then P and Q agree there, contributing either 0 or 2 * 2^b.",
        "So the score is X + 2 * (P restricted to the bits where X is zero), and the problem collapses to maximising a subset XOR over those free bits only. Masking every input with the complement of X and running the standard GF(2) elimination does exactly that.",
        "The masking step is what makes this a variation rather than a copy of the plain maximum-subset-XOR problem. Building the basis on the unmasked values and then maximising would let the greedy pick up bits of X, double counting them and overshooting the true answer.",
        "The non-empty constraint costs nothing: any achievable value of the masked span is realised by some subset, and if the optimal subset were empty the answer 0 is still attainable by any single-element split, so no special case is needed.",
        "Time: O(N * 60). Space: O(N).",
      ],
    },
    {
      name: "Square Subsets",
      difficulty: "Medium",
      variation: "GF(2) nullity, counting solutions of a homogeneous system",
      link: "https://codeforces.com/problemset/problem/895/C",
      question: [
        "You are given an array of n integers, each between 1 and 70. Count the number of non-empty subsets whose product is a perfect square. Two subsets are different if their index sets differ, even if the multisets of values coincide. Print the count modulo 10^9 + 7.",
        "Example 1:\nInput:\n4\n1 1 1 1\nOutput: 15\nExplanation: Every one of the 2^4 - 1 non-empty subsets has product 1, a perfect square.",
        "Example 2:\nInput:\n5\n1 2 4 5 8\nOutput: 7\nExplanation: The exponent-parity vectors span a 2-dimensional space, so 2^(5-2) - 1 = 7 subsets work.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= a_i <= 70",
      ],
      code: `int main() {
    const long long MOD = 1000000007LL;
    int primes[19] = {2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67};
    int n;
    cin >> n;
    vector<int> basis(19, 0);
    int rk = 0;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        int mask = 0;
        for (int p = 0; p < 19; p++) {
            int c = 0;
            while (x % primes[p] == 0) { x /= primes[p]; c++; }
            if (c & 1) mask |= 1 << p;     // only the parity of each exponent matters
        }
        for (int b = 18; b >= 0; b--) {    // incremental Gaussian elimination over GF(2)
            if (!((mask >> b) & 1)) continue;
            if (!basis[b]) { basis[b] = mask; rk++; break; }
            mask ^= basis[b];
        }
    }
    long long ans = 1;
    for (int i = 0; i < n - rk; i++) ans = ans * 2 % MOD;   // 2^(n - rank) elements in the kernel
    cout << (ans - 1 + MOD) % MOD << "\\n";
    return 0;
}`,
      explanation: [
        "A product is a perfect square exactly when every prime exponent in it is even. Only 19 primes are at most 70, so map each a_i to a 19-bit vector recording the parity of each prime exponent. Choosing a subset adds the chosen vectors over GF(2), and the subset is good precisely when the sum is the zero vector.",
        "That makes the good subsets the kernel (null space) of the 19 x n matrix whose columns are those vectors. The rank-nullity theorem gives the kernel size directly: 2^(n - rank). Subtract one to exclude the empty subset.",
        "Rank is computed incrementally, which is the point of the exercise - there is no need to store 10^5 rows. Each new vector is reduced against the current basis; if it survives non-zero it is a new pivot and the rank grows, otherwise it lies in the existing span and contributes a free variable.",
        "The tempting wrong model is a subset-sum or bitmask DP over 2^19 parity states. It is correct but needs 10^5 * 5 * 10^5 work, far too slow; the linear-algebraic view replaces the whole DP with one number.",
        "Note that rank <= 19 always, so n - rank is huge and the answer is dominated by free variables - a good sanity check on any implementation.",
        "Time: O(n * 19). Space: O(19).",
      ],
    },
    {
      name: "Spanning Set",
      difficulty: "Hard",
      variation: "Minimum-weight basis of a linear matroid",
      link: "https://atcoder.jp/contests/abc236/tasks/abc236_f",
      question: [
        "You are given an integer N and costs C_1 .. C_{2^N - 1}, where C_i is the cost of buying the integer i. Choose a set S of integers from 1 to 2^N - 1 such that every integer from 1 to 2^N - 1 can be written as the XOR of some non-empty subset of S. Print the minimum possible total cost of S.",
        "Example 1:\nInput:\n2\n1 2 3\nOutput: 3\nExplanation: Buying 1 (cost 1) and 2 (cost 2) spans 1, 2 and 3 for a total of 3.",
        "Example 2:\nInput:\n2\n3 1 2\nOutput: 3\nExplanation: Here 1 costs 3, 2 costs 1 and 3 costs 2, so buying 2 and 3 spans everything for 1 + 2 = 3, cheaper than any other independent pair.",
        "Constraints:\n- 1 <= N <= 18\n- 1 <= C_i <= 10^9",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    int m = (1 << n) - 1;
    vector<long long> c(m + 1);
    vector<int> idx;
    for (int i = 1; i <= m; i++) { cin >> c[i]; idx.push_back(i); }
    sort(idx.begin(), idx.end(), [&](int x, int y) { return c[x] < c[y]; });
    vector<int> basis(n, 0);
    long long ans = 0;
    int cnt = 0;
    for (int v : idx) {
        if (cnt == n) break;                     // a spanning set needs exactly n vectors
        int x = v;
        for (int b = n - 1; b >= 0; b--) {
            if (!((x >> b) & 1)) continue;
            if (!basis[b]) { basis[b] = x; ans += c[v]; cnt++; break; }
            x ^= basis[b];
        }
    }
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "The integers 1 .. 2^N - 1 together with XOR form the vector space GF(2)^N minus the zero vector. Spanning all of them means S must span the whole space, so S has to contain N linearly independent vectors and nothing more is ever useful. The task is therefore to pick a minimum-cost basis.",
        "Linear independence over a field is a matroid, and for matroids the cheapest-first greedy is optimal - the same exchange argument that makes Kruskal correct for spanning trees. Sort all 2^N - 1 candidates by cost and try to insert each into a growing Gaussian basis; keep it and pay its cost only if it is independent of what is already there.",
        "The independence test is the elimination itself: reduce the candidate against the current pivots, and if it does not collapse to zero its leading bit is a fresh pivot. Crucially the cost added is the original C_v, not the cost of the reduced vector - the reduction is only a test, the purchase is of v.",
        "The wrong-but-tempting answer is to buy the N powers of two, since they obviously span. That is a valid spanning set but rarely the cheapest one, as example 2 shows: there 1 is expensive and the pair (2, 3) spans just as well.",
        "Time: O(2^N * (N + log(2^N))) which is about 2^N * N. Space: O(2^N).",
      ],
    },
    {
      name: "(Zero XOR Subset)-less",
      difficulty: "Hard",
      variation: "Rank of prefix XORs, maximising independent parts",
      link: "https://codeforces.com/problemset/problem/1101/G",
      question: [
        "You are given an array a of n integers. Split it into the maximum possible number of non-empty consecutive segments such that no non-empty subset of the segment XOR values has XOR equal to zero. Here a segment's value is the XOR of its elements, and every element must belong to exactly one segment. Print the maximum number of segments, or -1 if no valid split exists.",
        "Example 1:\nInput:\n4\n5 5 7 2\nOutput: 2\nExplanation: The XOR of the whole array is 5, and the values 5, 5, 7, 2 span a 2-dimensional space, so at most 2 segments are possible.",
        "Example 2:\nInput:\n3\n1 2 3\nOutput: -1\nExplanation: 1 XOR 2 XOR 3 = 0, so whatever the split, the set of all segment values XORs to zero.",
        "Example 3:\nInput:\n3\n3 1 10\nOutput: 3\nExplanation: The total XOR is 8, non-zero, and 3, 1, 10 are independent over GF(2), so each element can be its own segment.",
        "Constraints:\n- 1 <= n <= 2 * 10^5\n- 0 <= a_i < 2^30",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> basis(30, 0);
    int rk = 0, total = 0;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        total ^= x;
        int v = x;
        for (int b = 29; b >= 0; b--) {
            if (!((v >> b) & 1)) continue;
            if (!basis[b]) { basis[b] = v; rk++; break; }
            v ^= basis[b];
        }
    }
    if (total == 0) { cout << -1 << "\\n"; return 0; }   // every split contains a zero-XOR subset
    cout << rk << "\\n";
    return 0;
}`,
      explanation: [
        "Fix a split with cut positions and let p_i be the prefix XOR after i elements. A segment value is p_r XOR p_l, so the multiset of segment values is determined by the chosen prefix values p_{c_1}, .., p_{c_k} = p_n. The condition that no subset of the segment values XORs to zero is exactly the condition that those chosen prefix values are linearly independent over GF(2).",
        "That reframing gives both halves of the answer. The maximum number of segments is the largest number of independent vectors selectable from the prefix values, which is the rank of the span of p_1 .. p_n - and that span equals the span of a_1 .. a_n, since each set is obtained from the other by XOR combinations. So computing the rank of the input array directly is enough, and no actual splitting need be constructed.",
        "The last segment always ends at position n, so p_n = total XOR must be one of the chosen vectors. If it is zero it can never belong to an independent set, hence the -1 case. This is the trap: a solution that only prints the rank passes the first and third samples and silently fails on any array with total XOR zero.",
        "Given total XOR non-zero, a valid split of size rank really exists: extend p_n to a maximal independent subset of the prefix values and cut at those positions, in increasing order of index.",
        "Time: O(n * 30). Space: O(30).",
      ],
    },
    {
      name: "Broken Robot",
      difficulty: "Hard",
      variation: "Expected-value system, tridiagonal Gaussian elimination per row",
      link: "https://codeforces.com/problemset/problem/24/D",
      question: [
        "A robot stands on cell (i, j) of an N x M grid. At each step it picks uniformly at random among the moves that keep it inside the grid: stay in place, move one cell left, move one cell right, or move one cell down. It never moves up. Print the expected number of steps until the robot reaches the last row.",
        "Example 1:\nInput:\n10 10\n10 10\nOutput: 0.0000000000\nExplanation: The robot is already in the last row.",
        "Example 2:\nInput:\n2 1\n1 1\nOutput: 2.0000000000\nExplanation: With a single column the only choices are stay and move down, each with probability 1/2, so the expected number of steps to descend one row is 2.",
        "Constraints:\n- 1 <= N, M <= 1000\n- 1 <= i <= N, 1 <= j <= M\n- Answers are accepted within 1e-4",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m, r, c;
    cin >> n >> m >> r >> c;
    cout << fixed << setprecision(10);
    if (r == n) { cout << 0.0 << "\\n"; return 0; }
    if (m == 1) { cout << 2.0 * (n - r) << "\\n"; return 0; }   // only stay or descend
    vector<double> nxt(m + 1, 0.0), cur(m + 1, 0.0);
    vector<double> lo(m + 1), di(m + 1), up(m + 1), rhs(m + 1);
    for (int i = n - 1; i >= r; i--) {
        for (int j = 1; j <= m; j++) {
            if (j == 1)      { lo[j] =  0; di[j] = 2; up[j] = -1; rhs[j] = 3 + nxt[j]; }
            else if (j == m) { lo[j] = -1; di[j] = 2; up[j] =  0; rhs[j] = 3 + nxt[j]; }
            else             { lo[j] = -1; di[j] = 3; up[j] = -1; rhs[j] = 4 + nxt[j]; }
        }
        for (int j = 2; j <= m; j++) {          // forward elimination on a tridiagonal matrix
            double f = lo[j] / di[j - 1];
            di[j] -= f * up[j - 1];
            rhs[j] -= f * rhs[j - 1];
        }
        cur[m] = rhs[m] / di[m];
        for (int j = m - 1; j >= 1; j--) cur[j] = (rhs[j] - up[j] * cur[j + 1]) / di[j];
        nxt = cur;
    }
    cout << nxt[c] << "\\n";
    return 0;
}`,
      explanation: [
        "Let E[i][j] be the expected number of remaining steps from cell (i, j). The last row gives E[n][j] = 0. For any other row, the recurrence involves E[i][j-1] and E[i][j+1] as well as E[i][j] itself, so the cells of one row are mutually dependent and cannot be filled in by a plain DP sweep - the row is a system of linear equations.",
        "Write the equations with the next row treated as known. Interior cells give 4*E[i][j] = 4 + E[i][j] + E[i][j-1] + E[i][j+1] + E[i+1][j], that is 3*E[i][j] - E[i][j-1] - E[i][j+1] = 4 + E[i+1][j]. The border cells have only three moves and give 2*E[i][1] - E[i][2] = 3 + E[i+1][1] and symmetrically at column m.",
        "That matrix is tridiagonal, so Gaussian elimination degenerates to the Thomas algorithm: one forward pass eliminating the single sub-diagonal entry per row, then one back substitution. Running a general O(m^3) elimination for each of the n rows would be 10^12 operations; exploiting the band structure makes it O(n * m).",
        "The diagonal is strictly dominant (3 against 2, or 2 against 1), which guarantees the pivots never vanish. That is why no pivoting or row swapping is needed here - a rare and pleasant exception, and the reason the compact three-array formulation is safe.",
        "Two special cases must be handled before the loop: starting already in the last row (answer 0) and a single column, where the row system degenerates to E[i][1] = 2 + E[i+1][1] and the tridiagonal setup with both a first-column and a last-column equation would be inconsistent.",
        "Time: O(N * M). Space: O(M).",
      ],
    },
  ],
};
