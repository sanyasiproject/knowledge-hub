import type { TopicContent } from "../types";

export const combinatorics: TopicContent = {
  quickSummary: [
    "Permutations count ordered arrangements (n! for n items, P(n,r) = n!/(n-r)! for r of n), while combinations count unordered selections (C(n,r) = n!/(r!(n-r)!)), forming the foundation of all counting arguments.",
    "The pigeonhole principle states that if n+1 items are placed into n containers, at least one container holds two or more items — a deceptively simple idea that yields powerful existence proofs.",
    "Inclusion-exclusion computes the size of a union by alternating between adding and subtracting intersection sizes: |A union B union C| = |A|+|B|+|C| - |A inter B| - |A inter C| - |B inter C| + |A inter B inter C|.",
    "Generating functions encode sequences as power series coefficients, transforming counting problems into algebraic manipulations — the sequence a_n becomes the coefficient of x^n in a formal power series.",
  ],
  detailed: [
    "Permutations and combinations are the two fundamental counting operations. A permutation of r items chosen from n is an ordered arrangement: P(n,r) = n!/(n-r)!. When r = n, this is simply n!. A combination is an unordered selection: C(n,r) = n!/(r!(n-r)!) = P(n,r)/r!. The binomial coefficient C(n,r) satisfies Pascal's identity: C(n,r) = C(n-1,r-1) + C(n-1,r), which gives an efficient O(nr) computation via Pascal's triangle. With repetition: permutations of a multiset of n items with groups of sizes n1,...,nk is n!/(n1!*...*nk!); combinations with repetition (stars and bars) gives C(n+r-1, r) ways to choose r items from n types.",
    "The pigeonhole principle (Dirichlet's box principle) seems trivial but proves powerful theorems. The generalized version states: if N items go into k containers, some container has at least ceil(N/k) items. Applications: among any 5 points in a unit square, two are within distance sqrt(2)/2 (divide into 4 sub-squares); in any group of 13 people, at least 2 share a birth month; any sequence of n^2+1 distinct numbers contains a monotone subsequence of length n+1 (Erdos-Szekeres theorem). The probabilistic pigeonhole principle underlies birthday paradox arguments and hash collision analysis.",
    "Inclusion-exclusion generalizes the addition principle to overlapping sets. For n sets: |A1 union ... union An| = sum |Ai| - sum |Ai inter Aj| + sum |Ai inter Aj inter Ak| - ... + (-1)^(n+1)|A1 inter ... inter An|. This has 2^n - 1 terms, so it is only practical for small n or when intersections have a pattern. Classic applications: counting derangements (permutations with no fixed point): D(n) = n! * sum_{i=0}^{n} (-1)^i / i!, which approaches n!/e; counting surjections from an m-set to an n-set; and Euler's totient function phi(n) = n * product_{p|n} (1 - 1/p) counting integers coprime to n.",
    "Generating functions encode a sequence (a0, a1, a2, ...) as the formal power series A(x) = sum a_n x^n. The ordinary generating function (OGF) for the Fibonacci sequence satisfies F(x) = x / (1 - x - x^2), derived from the recurrence. Multiplying two OGFs corresponds to convolution (distributing selections across two sets). Exponential generating functions (EGFs) encode a_n as a_n x^n / n! and are natural for labeled structures. The EGF for permutations is 1/(1-x), and for derangements is e^(-x)/(1-x). Partial fractions and the method of coefficients extract closed-form expressions for a_n from rational generating functions.",
    "Catalan numbers C_n = C(2n,n)/(n+1) count an extraordinary variety of combinatorial structures: balanced parenthesizations of n pairs, binary trees with n internal nodes, paths in an n-by-n grid that stay below the diagonal, triangulations of an (n+2)-gon, and stack-sortable permutations of length n. The recurrence is C_n = sum_{i=0}^{n-1} C_i * C_{n-1-i} with C_0 = 1, reflecting the recursive decomposition of these structures. The generating function is C(x) = (1 - sqrt(1-4x)) / (2x). Recurrence relations in general (linear, with constant or variable coefficients) are solved by the characteristic equation method, generating functions, or matrix exponentiation for O(log n) computation of the n-th term.",
  ],
  deepDive: [
    "Stars and bars (balls and urns) counts the number of ways to distribute r identical objects into n distinct bins: C(n+r-1, r). This models integer solutions to x1 + x2 + ... + xn = r with xi >= 0. With lower bounds (xi >= li), substitute yi = xi - li to reduce to the basic case. With upper bounds, use inclusion-exclusion: subtract cases where any variable exceeds its bound. This technique appears in probability (multinomial distributions), combinatorial optimization, and partition counting. The closely related integer partition problem (unordered sums) has no simple closed form and is studied via generating functions: the partition generating function is the product 1/((1-x)(1-x^2)(1-x^3)...).",
    "The Stirling numbers bridge permutations and combinations with deeper structure. Stirling numbers of the second kind S(n,k) count the partitions of an n-set into exactly k nonempty subsets. They satisfy the recurrence S(n,k) = k*S(n-1,k) + S(n-1,k-1). The Bell numbers B(n) = sum S(n,k) count all partitions. Stirling numbers of the first kind s(n,k) (unsigned) count permutations of n elements with exactly k cycles. These appear in the expansion of rising/falling factorials in terms of ordinary powers and vice versa, connecting combinatorics to polynomial interpolation and finite differences.",
    "Advanced recurrence solving uses the characteristic equation for linear recurrences with constant coefficients: if a_n = c1*a_{n-1} + ... + ck*a_{n-k}, the characteristic polynomial is x^k - c1*x^{k-1} - ... - ck = 0. Distinct roots r1,...,rk give a_n = A1*r1^n + ... + Ak*rk^n. Repeated roots introduce polynomial factors: a root r with multiplicity m contributes (A1 + A2*n + ... + Am*n^{m-1})*r^n. For non-homogeneous recurrences (a_n = c*a_{n-1} + f(n)), use particular solutions or generating functions. Matrix exponentiation computes a_n in O(k^3 log n) by expressing the recurrence as a matrix equation and using fast exponentiation.",
    "The Burnside/Polya enumeration theorem counts distinct objects under symmetry (group actions). The number of distinct colorings equals (1/|G|) * sum_{g in G} |Fix(g)|, where Fix(g) is the set of colorings unchanged by symmetry g. For example, counting distinct necklaces of n beads with k colors under rotation: the group is Z_n (cyclic rotations), and Fix(rotation by d) = k^(gcd(n,d)). This extends to more complex symmetry groups (dihedral for bracelets, cube rotations for face colorings). Polya enumeration refines Burnside by using a cycle index polynomial to count by color usage, enabling weighted enumeration via generating functions.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Core combinatorial functions: C(n,r), derangements, Catalan, stars-and-bars",
      source: `#include <iostream>
#include <vector>
#include <cstdint>

// Binomial coefficient C(n, r)
long long comb(int n, int r) {
    if (r < 0 || r > n) return 0;
    if (r > n - r) r = n - r;  // optimisation: C(n,r) == C(n, n-r)
    long long result = 1;
    for (int i = 0; i < r; ++i) {
        result = result * (n - i) / (i + 1);
    }
    return result;
}

long long factorial(int n) {
    long long f = 1;
    for (int i = 2; i <= n; ++i) f *= i;
    return f;
}

// Count derangements (permutations with no fixed points) via DP.
// D(n) = (n-1)*(D(n-1) + D(n-2)),  D(0)=1, D(1)=0
long long derangements(int n) {
    if (n == 0) return 1;
    if (n == 1) return 0;
    long long prev2 = 1, prev1 = 0;
    for (int i = 2; i <= n; ++i) {
        long long cur = (i - 1) * (prev1 + prev2);
        prev2 = prev1;
        prev1 = cur;
    }
    return prev1;
}

// Catalan number: C_n = C(2n, n) / (n + 1)
long long catalan(int n) {
    return comb(2 * n, n) / (n + 1);
}

// Stars-and-bars: ways to place 'total' identical items into 'n_bins' bins.
// Equivalent to non-negative integer solutions of x1+...+x_n = total.
long long stars_and_bars(int n_bins, int total) {
    return comb(total + n_bins - 1, total);
}

// Multinomial coefficient: n! / (g1! * g2! * ... * gk!)
long long multinomial(int n, const std::vector<int>& groups) {
    long long result = factorial(n);
    for (int g : groups) result /= factorial(g);
    return result;
}

int main() {
    std::cout << "C(10,3) = "           << comb(10, 3)                      << "\\n";  // 120
    std::cout << "D(5) = "              << derangements(5)                   << "\\n";  // 44
    std::cout << "Catalan(5) = "        << catalan(5)                        << "\\n";  // 42
    std::cout << "Stars&bars(3,7) = "   << stars_and_bars(3, 7)             << "\\n";  // 36
    std::cout << "Multinomial(7,[2,3,2]) = "
              << multinomial(7, {2, 3, 2}) << "\\n";  // 210
    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Solving linear recurrences with matrix exponentiation",
      source: `#include <iostream>
#include <vector>

using Matrix = std::vector<std::vector<long long>>;
constexpr long long MOD = 1'000'000'007;

Matrix mat_mult(const Matrix& A, const Matrix& B) {
    int k = static_cast<int>(A.size());
    Matrix C(k, std::vector<long long>(k, 0));
    for (int i = 0; i < k; ++i)
        for (int j = 0; j < k; ++j)
            for (int l = 0; l < k; ++l)
                C[i][j] = (C[i][j] + A[i][l] * B[l][j]) % MOD;
    return C;
}

// Compute M^n mod MOD using fast exponentiation. O(k^3 log n).
Matrix matrix_power(Matrix M, long long n) {
    int k = static_cast<int>(M.size());
    // Identity matrix
    Matrix result(k, std::vector<long long>(k, 0));
    for (int i = 0; i < k; ++i) result[i][i] = 1;

    while (n > 0) {
        if (n & 1) result = mat_mult(result, M);
        M = mat_mult(M, M);
        n >>= 1;
    }
    return result;
}

// Compute F(n) in O(log n) via matrix exponentiation.
// [F(n+1), F(n)] = [[1,1],[1,0]]^n * [F(1), F(0)]
long long fibonacci(long long n) {
    if (n <= 1) return n;
    Matrix M = {{1, 1}, {1, 0}};
    Matrix res = matrix_power(M, n - 1);
    return res[0][0];  // F(n)
}

// Example: a(n) = 2*a(n-1) + 3*a(n-2), a(0)=1, a(1)=2.
// Transformation matrix: [[2, 3], [1, 0]]
long long solve_recurrence(long long n) {
    if (n == 0) return 1;
    if (n == 1) return 2;
    Matrix M = {{2, 3}, {1, 0}};
    Matrix res = matrix_power(M, n - 1);
    return (res[0][0] * 2 + res[0][1] * 1) % MOD;
}

int main() {
    std::cout << "F(10) = " << fibonacci(10)         << "\\n";  // 55
    std::cout << "F(50) = " << fibonacci(50)         << "\\n";  // 12586269025
    std::cout << "a(5) = "  << solve_recurrence(5)   << "\\n";  // a(5) for 2a+3b recurrence
    return 0;
}`,
    },
  ],
  diagrams: [
    {
      title: "Pascal's Triangle and Binomial Coefficients",
      kind: "architecture",
      caption: "Pascal's triangle showing C(n,r) values with the recurrence C(n,r) = C(n-1,r-1) + C(n-1,r) highlighted by arrows; edges annotated with key identities like row sums = 2^n and diagonal sums = Fibonacci numbers",
    },
    {
      title: "Inclusion-Exclusion Venn Diagram",
      kind: "network",
      caption: "Three-set Venn diagram illustrating how |A union B union C| is computed by adding individual sizes, subtracting pairwise intersections, and adding the triple intersection",
    },
  ],
  animations: [
    {
      title: "Inclusion-Exclusion Step by Step",
      steps: [
        { label: "Add individual sets", detail: "Start with |A| + |B| + |C|: this overcounts elements in intersections" },
        { label: "Subtract pairwise intersections", detail: "Subtract |A inter B|, |A inter C|, |B inter C|: elements in exactly two sets were counted twice, now once; but elements in all three were counted 3 - 3 = 0 times" },
        { label: "Add triple intersection", detail: "Add back |A inter B inter C|: elements in all three sets are now counted exactly once" },
        { label: "General pattern", detail: "For n sets: alternate adding and subtracting intersection sizes. The k-subset intersections get sign (-1)^(k+1). Total terms: 2^n - 1." },
        { label: "Apply to derangements", detail: "Let A_i = permutations fixing element i. By inclusion-exclusion: D(n) = n! - |A_1 union ... union A_n| = n! * sum (-1)^k / k! for k=0..n" },
      ],
    },
  ],
  comparison: {
    columns: ["Concept", "Formula", "Order matters?", "Repetition?", "Example"],
    rows: [
      ["Permutation (no rep)", "P(n,r) = n!/(n-r)!", "Yes", "No", "Arrange 3 of 5 books: 60"],
      ["Permutation (with rep)", "n^r", "Yes", "Yes", "3-digit PIN (digits 0-9): 1000"],
      ["Combination (no rep)", "C(n,r) = n!/(r!(n-r)!)", "No", "No", "Choose 3 of 5 books: 10"],
      ["Combination (with rep)", "C(n+r-1, r)", "No", "Yes", "Choose 3 scoops from 5 flavors: 35"],
      ["Multiset permutation", "n!/(n1!...nk!)", "Yes", "N/A (fixed counts)", "Arrangements of MISSISSIPPI: 34650"],
    ],
  },
  interviewQA: [
    {
      q: "In how many ways can you climb n stairs if you can take 1 or 2 steps at a time?",
      a: "This is the Fibonacci recurrence: f(n) = f(n-1) + f(n-2) with f(1)=1, f(2)=2. From step n, the last move was either a 1-step from n-1 or a 2-step from n-2, giving the recurrence. For n=5: f(5) = f(4)+f(3) = (f(3)+f(2))+(f(2)+f(1)) = (3+2)+(2+1) = 8. For large n, compute in O(log n) via matrix exponentiation: [[1,1],[1,0]]^n gives F(n+1) and F(n).",
      followUps: [
        "How would this change if you could take 1, 2, or 3 steps?",
        "How does this relate to tiling a 2xn board with dominoes?",
        "What is the generating function for this recurrence?",
      ],
    },
    {
      q: "Prove that in any group of 6 people, there exist 3 mutual friends or 3 mutual strangers.",
      a: "This is Ramsey number R(3,3) = 6. Take any person A. They have 5 relationships. By pigeonhole, at least 3 are friends or at least 3 are strangers. WLOG, A has 3 friends: B, C, D. If any pair among B, C, D are friends, they form a mutual-friends triple with A's friendship. If none of B, C, D are friends with each other, then B, C, D are 3 mutual strangers. Either way, the claim holds.",
      followUps: [
        "What is the Ramsey number R(3,4) and how is it computed?",
        "How does the pigeonhole principle generalize this argument?",
      ],
    },
    {
      q: "How many ways can you distribute 10 identical balls into 4 distinct boxes with each box having at least 1 ball?",
      a: "First give 1 ball to each box (mandatory), leaving 10-4 = 6 balls to distribute freely among 4 boxes. By stars and bars, this is C(6+4-1, 6) = C(9, 6) = 84. Equivalently, this counts the positive integer solutions to x1+x2+x3+x4 = 10 by substituting yi = xi-1 to get y1+y2+y3+y4 = 6 with yi >= 0.",
      followUps: [
        "What if the balls are distinct instead of identical?",
        "What if some boxes have upper bound constraints?",
      ],
    },
    {
      q: "What are Catalan numbers and where do they appear in computer science?",
      a: "The n-th Catalan number C_n = C(2n,n)/(n+1). In CS, C_n counts: the number of distinct binary search trees with n keys, the number of ways to fully parenthesize n+1 factors, the number of valid sequences of n opening and n closing parentheses, the number of paths in an n-by-n grid that stay on or below the diagonal (ballot sequences), and the number of ways to triangulate a convex polygon with n+2 sides. The first few values are 1, 1, 2, 5, 14, 42, 132.",
      followUps: [
        "How do you derive the closed form from the recurrence?",
        "What is the generating function for Catalan numbers?",
        "How are Catalan numbers related to stack-sortable permutations?",
      ],
    },
  ],
  followUps: [
    "How do generating functions transform the convolution of sequences into simple multiplication of power series?",
    "What is the Burnside/Polya enumeration theorem and how does it count objects up to symmetry?",
    "How are Stirling numbers of the first and second kind related to permutations and set partitions?",
    "What are the practical applications of the probabilistic method in combinatorics (Lovasz Local Lemma, Erdos arguments)?",
  ],
  mcqs: [
    {
      q: "How many ways can 8 identical balls be placed into 3 distinct boxes?",
      options: ["C(8,3) = 56", "C(10,2) = 45", "3^8 = 6561", "8! / 3! = 6720"],
      answerIndex: 1,
      explanation: "Stars and bars: C(n+r-1, r) = C(8+3-1, 8) = C(10, 8) = C(10, 2) = 45. The balls are identical, so order within a box does not matter.",
    },
    {
      q: "What is the number of derangements of 4 elements?",
      options: ["6", "9", "12", "24"],
      answerIndex: 1,
      explanation: "D(4) = 4! * (1 - 1 + 1/2 - 1/6 + 1/24) = 24 * (1/2 - 1/6 + 1/24) = 24 * (12/24 - 4/24 + 1/24) = 24 * 9/24 = 9.",
    },
    {
      q: "The 5th Catalan number C_5 equals:",
      options: ["14", "42", "132", "429"],
      answerIndex: 1,
      explanation: "C_5 = C(10,5)/6 = 252/6 = 42. This counts, for example, the number of distinct binary trees with 5 nodes, or the number of valid sequences of 5 pairs of parentheses.",
    },
    {
      q: "By the pigeonhole principle, what is the minimum number of people needed to guarantee at least 3 share a birthday month?",
      options: ["13", "24", "25", "37"],
      answerIndex: 2,
      explanation: "With 12 months (pigeonholes), to guarantee at least 3 in one month, we need 2*12 + 1 = 25 people. With 24, each month could have exactly 2.",
    },
    {
      q: "How many distinct permutations of the letters in 'BANANA' exist?",
      options: ["720", "120", "60", "30"],
      answerIndex: 2,
      explanation: "BANANA has 6 letters: B(1), A(3), N(2). Multinomial: 6!/(1!*3!*2!) = 720/(1*6*2) = 60.",
    },
  ],
  exercises: [
    "Use inclusion-exclusion to count the number of integers from 1 to 1000 that are divisible by none of 2, 3, or 5. Verify your answer matches Euler's totient function applied to 30.",
    "Derive the closed-form formula for the n-th Catalan number C_n = C(2n,n)/(n+1) from the recurrence C_n = sum_{i=0}^{n-1} C_i * C_{n-1-i} using generating functions.",
    "Implement a function that computes the number of ways to make change for a given amount using coins of specified denominations, using both dynamic programming and generating functions.",
    "Prove using the pigeonhole principle that in any sequence of n^2 + 1 distinct real numbers, there exists a monotonically increasing subsequence of length n+1 or a monotonically decreasing subsequence of length n+1.",
  ],
  flashcards: [
    { front: "What is Pascal's identity?", back: "C(n, r) = C(n-1, r-1) + C(n-1, r). Each element is either in the subset (then choose r-1 from remaining n-1) or not (choose r from n-1)." },
    { front: "What is the formula for derangements D(n)?", back: "D(n) = n! * sum_{i=0}^{n} (-1)^i / i!, or equivalently D(n) = (n-1)(D(n-1) + D(n-2)) with D(0)=1, D(1)=0. Approaches n!/e as n grows." },
    { front: "State the pigeonhole principle.", back: "If n+1 objects are placed into n containers, at least one container has at least 2 objects. Generalized: N objects into k containers means some container has at least ceil(N/k)." },
    { front: "What is the stars and bars formula?", back: "The number of ways to distribute r identical objects into n distinct bins is C(n+r-1, r). Equivalently, non-negative integer solutions to x1+...+xn = r." },
    { front: "What is the Catalan number recurrence?", back: "C_0 = 1; C_n = sum_{i=0}^{n-1} C_i * C_{n-1-i}. Closed form: C_n = C(2n,n)/(n+1). First values: 1, 1, 2, 5, 14, 42, 132." },
    { front: "How do you solve a linear recurrence with matrix exponentiation?", back: "Express [a_n, a_{n-1}, ...] = M * [a_{n-1}, ...] where M is the companion matrix. Then a_n is extracted from M^{n-1} * [initial values]. Runs in O(k^3 log n)." },
    { front: "What is the generating function for 1/(1-x)?", back: "1 + x + x^2 + x^3 + ... = sum x^n. It generates the constant sequence (1, 1, 1, ...) and is the OGF basis for many combinatorial identities." },
    { front: "What does the multinomial coefficient count?", back: "n!/(n1!*n2!*...nk!) counts the permutations of n objects where n_i are identical of type i. Equivalently, the number of ways to partition n distinct items into groups of sizes n1,...,nk." },
  ],
  revisionNotes: [
    "Permutations = ordered, combinations = unordered. When in doubt, ask: does swapping two selected items create a different outcome?",
    "Stars and bars: identical objects into distinct bins. For distinct objects into distinct bins, use n^r (with repetition) or P(n,r) (without).",
    "Inclusion-exclusion alternates signs: +singles, -pairs, +triples, -quadruples, ... Has 2^n - 1 terms total.",
    "Catalan numbers C_n = C(2n,n)/(n+1): binary trees, balanced parens, grid paths below diagonal, triangulations. Recognize the pattern in interview problems.",
    "Recurrence solving: (1) find characteristic roots for homogeneous linear recurrences, (2) use generating functions for non-linear or non-constant coefficient cases, (3) use matrix exponentiation for O(log n) computation.",
    "Pigeonhole arguments: identify the pigeons (objects) and pigeonholes (containers), then count. The generalized version gives ceil(N/k) as the guaranteed minimum occupancy.",
  ],
  cheatSheet: [
    "P(n,r) = n!/(n-r)!. C(n,r) = n!/(r!(n-r)!). C(n,r) = C(n, n-r). Sum of row n of Pascal's triangle = 2^n.",
    "Stars and bars: C(n+r-1, r) ways to put r identical items in n bins. With each bin >= 1: C(r-1, n-1).",
    "Derangements: D(n) = (n-1)(D(n-1)+D(n-2)). D(n) ~ n!/e. Ratio D(n)/n! converges to 1/e very fast.",
    "Inclusion-exclusion for 2 sets: |A union B| = |A| + |B| - |A inter B|. For derangements: D(n) = sum_{k=0}^{n} (-1)^k * C(n,k) * (n-k)!.",
    "Catalan: C_n = C(2n,n)/(n+1). C_0=1, C_1=1, C_2=2, C_3=5, C_4=14, C_5=42. GF: (1-sqrt(1-4x))/(2x).",
    "Characteristic equation for a_n = c1*a_{n-1} + c2*a_{n-2}: solve r^2 = c1*r + c2. General solution: a_n = A*r1^n + B*r2^n (distinct roots) or a_n = (A+Bn)*r^n (repeated root).",
  ],
  resources: [
    { label: "Concrete Mathematics (Graham, Knuth, Patashnik)", kind: "book", note: "The definitive text on discrete math for CS, covering sums, recurrences, generating functions, and combinatorial identities with Knuth's signature rigor" },
    { label: "Generatingfunctionology (Herbert Wilf)", kind: "book", note: "Free online textbook entirely devoted to generating functions as a problem-solving tool — from basics to advanced analytic combinatorics" },
    { label: "Art of Problem Solving: Combinatorics", kind: "article", note: "Community wiki with hundreds of competition-level combinatorics problems organized by technique, with solutions" },
    { label: "MIT 6.042J Mathematics for Computer Science (OCW)", kind: "video", note: "Lectures on counting, pigeonhole, inclusion-exclusion, and generating functions with problem sets and solutions" },
    { label: "Analytic Combinatorics (Flajolet and Sedgewick)", kind: "book", note: "Graduate-level treatment connecting generating functions to complex analysis for asymptotic enumeration — available free online" },
  ],
  glossary: [
    { term: "Permutation", definition: "An ordered arrangement of r items chosen from n. P(n,r) = n!/(n-r)!. When r = n, this is n! (factorial)." },
    { term: "Combination", definition: "An unordered selection of r items from n. C(n,r) = n!/(r!(n-r)!), also called the binomial coefficient 'n choose r'." },
    { term: "Pigeonhole principle", definition: "If n+1 objects are distributed among n containers, at least one container must contain at least 2 objects. Used for existence proofs." },
    { term: "Inclusion-exclusion", definition: "A counting formula for the size of a union of sets that alternately adds and subtracts intersection sizes to correct for overcounting." },
    { term: "Generating function", definition: "A formal power series sum a_n x^n that encodes a sequence. Transforms recurrences into algebraic equations and convolutions into products." },
    { term: "Catalan number", definition: "C_n = C(2n,n)/(n+1). Counts balanced parenthesizations, binary trees, grid paths below the diagonal, and many other structures." },
    { term: "Derangement", definition: "A permutation with no fixed point (no element appears in its original position). Counted by D(n) = n! * sum (-1)^k/k!." },
    { term: "Recurrence relation", definition: "An equation defining each term of a sequence as a function of preceding terms. Solved by characteristic equations, generating functions, or matrix exponentiation." },
  ],
};
