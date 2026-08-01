import type { TopicContent } from "../types";

export const vectorsMatrices: TopicContent = {
  quickSummary: [
    "A vector is an ordered list of numbers representing magnitude and direction; a matrix is a 2-D grid of numbers that can encode linear transformations, systems of equations, and data tables.",
    "Key vector operations — dot product (projection/similarity), cross product (perpendicular vector in 3-D), and norms (length) — are the building blocks of graphics, physics, and machine learning.",
    "Matrix multiplication is not element-wise: the (i, j) entry of AB is the dot product of row i of A with column j of B, and AB ≠ BA in general.",
    "Transpose flips rows and columns (Aᵀ), inverse undoes a transformation (A⁻¹A = I), and the determinant tells you how a matrix scales area/volume — zero determinant means the transformation collapses a dimension.",
  ],
  detailed: [
    "Vectors live in Rⁿ and can be added component-wise or scaled by a scalar. The dot product a·b = Σaᵢbᵢ = |a||b|cosθ measures how aligned two vectors are: positive when they point similarly, zero when perpendicular, negative when opposed. This single operation powers cosine similarity in NLP, projection in graphics, and the neuron activation in neural networks.",
    "The cross product is defined only in R³: a × b yields a vector perpendicular to both a and b with magnitude |a||b|sinθ. It is used for surface normals in 3-D rendering, torque in physics, and determining winding order (clockwise vs counter-clockwise) in computational geometry.",
    "Norms quantify vector length. The L2 (Euclidean) norm √(Σxᵢ²) is the straight-line distance; the L1 (Manhattan) norm Σ|xᵢ| sums absolute values and is more robust to outliers in ML regularization; the L∞ norm max|xᵢ| captures the largest component.",
    "Matrix multiplication AB requires the inner dimensions to match: an (m×k) matrix times a (k×n) matrix produces an (m×n) result. Each entry is a dot product, so the naive algorithm is O(m·k·n). Strassen's algorithm reduces the exponent from 3 to ~2.81 for square matrices by clever sub-problem decomposition.",
    "The determinant det(A) of a square matrix encodes the signed volume scaling factor of the linear transformation A represents. If det(A) = 0 the matrix is singular — it collapses at least one dimension and has no inverse. Computing the determinant via cofactor expansion is O(n!); LU decomposition brings it to O(n³).",
  ],
  deepDive: [
    "A linear transformation T: Rⁿ→Rᵐ can always be represented by a matrix M such that T(x) = Mx. Composing two transformations corresponds to multiplying their matrices. This is why computer graphics pipelines chain model, view, and projection matrices into a single MVP matrix — one multiply per vertex instead of three.",
    "The inverse A⁻¹ exists only when det(A) ≠ 0. Numerically, computing A⁻¹ directly is avoided; instead we solve Ax = b via LU or QR factorization, which is more numerically stable and faster. The condition number κ(A) = |A|·|A⁻¹| measures how sensitive the solution is to floating-point errors — high κ means the system is ill-conditioned.",
    "Orthogonal matrices satisfy QᵀQ = I: their columns form an orthonormal basis. They preserve lengths and angles, making them ideal for rotations and reflections. The QR decomposition factors any matrix into an orthogonal Q and upper-triangular R, and is the workhorse behind least-squares fitting and the QR eigenvalue algorithm.",
    "In machine learning, the data matrix X (samples × features) is central. XᵀX is the Gram matrix whose eigenvalues reveal feature variance; (XᵀX)⁻¹Xᵀy gives the ordinary least-squares solution. Regularization adds λI to XᵀX (Ridge regression) to ensure invertibility when features are collinear.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Core vector and matrix operations",
      source: `#include <iostream>
#include <array>
#include <cmath>
#include <iomanip>

// --- Vector operations (3D) ---
using Vec3 = std::array<double, 3>;

double dot(const Vec3& a, const Vec3& b) {
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
}

Vec3 cross(const Vec3& a, const Vec3& b) {
    return {a[1]*b[2] - a[2]*b[1],
            a[2]*b[0] - a[0]*b[2],
            a[0]*b[1] - a[1]*b[0]};
}

double norm(const Vec3& v) { return std::sqrt(dot(v, v)); }

// --- Matrix operations (2x2) ---
using Mat2 = std::array<std::array<double, 2>, 2>;

Mat2 mat_mul(const Mat2& A, const Mat2& B) {
    return {{{A[0][0]*B[0][0] + A[0][1]*B[1][0], A[0][0]*B[0][1] + A[0][1]*B[1][1]},
             {A[1][0]*B[0][0] + A[1][1]*B[1][0], A[1][0]*B[0][1] + A[1][1]*B[1][1]}}};
}

Mat2 transpose(const Mat2& A) {
    return {{{A[0][0], A[1][0]}, {A[0][1], A[1][1]}}};
}

double det(const Mat2& A) { return A[0][0]*A[1][1] - A[0][1]*A[1][0]; }

Mat2 inverse(const Mat2& A) {
    double d = det(A);
    return {{{ A[1][1]/d, -A[0][1]/d},
             {-A[1][0]/d,  A[0][0]/d}}};
}

int main() {
    Vec3 a = {1, 2, 3}, b = {4, 5, 6};

    double d = dot(a, b);             // 1*4 + 2*5 + 3*6 = 32
    Vec3 c = cross(a, b);             // [-3, 6, -3]
    double l2 = norm(a);              // sqrt(1+4+9) = 3.742
    double cosine_sim = d / (norm(a) * norm(b));

    std::cout << "dot = " << d << "\\n";
    std::cout << "cross = [" << c[0] << ", " << c[1] << ", " << c[2] << "]\\n";
    std::cout << "L2 norm = " << l2 << "\\n";
    std::cout << "cosine sim = " << cosine_sim << "\\n";

    Mat2 A = {{{1, 2}, {3, 4}}};
    Mat2 B = {{{5, 6}, {7, 8}}};

    Mat2 product = mat_mul(A, B);     // matrix multiply
    Mat2 trans = transpose(A);        // transpose
    double determinant = det(A);      // -2
    Mat2 inv = inverse(A);            // inverse (det != 0)

    // Verify: A * A_inv approx I
    Mat2 check = mat_mul(A, inv);
    bool is_identity = std::abs(check[0][0] - 1) < 1e-9
                    && std::abs(check[1][1] - 1) < 1e-9
                    && std::abs(check[0][1]) < 1e-9
                    && std::abs(check[1][0]) < 1e-9;
    std::cout << "A * A_inv == I: " << std::boolalpha << is_identity << "\\n";
}`,
    },
    {
      language: "cpp",
      caption: "2-D rotation matrix and affine transformation",
      source: `#include <iostream>
#include <cmath>
#include <array>
#include <iomanip>

using Vec2 = std::array<double, 2>;
using Mat2 = std::array<std::array<double, 2>, 2>;
using Vec3 = std::array<double, 3>;
using Mat3 = std::array<std::array<double, 3>, 3>;

// Return 2x2 rotation matrix for angle theta (radians)
Mat2 rotation_matrix(double theta) {
    double c = std::cos(theta), s = std::sin(theta);
    return {{{ c, -s},
             { s,  c}}};
}

Vec2 mat_vec_mul(const Mat2& M, const Vec2& v) {
    return {M[0][0]*v[0] + M[0][1]*v[1],
            M[1][0]*v[0] + M[1][1]*v[1]};
}

// Affine transform: 3x3 matrix for rotation + translation
Mat3 affine_2d(double theta, double tx, double ty) {
    double c = std::cos(theta), s = std::sin(theta);
    return {{{ c, -s, tx},
             { s,  c, ty},
             { 0,  0,  1}}};
}

Vec3 mat3_vec_mul(const Mat3& M, const Vec3& v) {
    return {M[0][0]*v[0] + M[0][1]*v[1] + M[0][2]*v[2],
            M[1][0]*v[0] + M[1][1]*v[1] + M[1][2]*v[2],
            M[2][0]*v[0] + M[2][1]*v[1] + M[2][2]*v[2]};
}

int main() {
    constexpr double PI = 3.14159265358979323846;

    // Rotate point (1, 0) by 90 degrees
    Mat2 R = rotation_matrix(PI / 2);
    Vec2 point = {1, 0};
    Vec2 rotated = mat_vec_mul(R, point);  // approx [0, 1]
    std::cout << std::fixed << std::setprecision(4);
    std::cout << "Rotated: [" << rotated[0] << ", " << rotated[1] << "]\\n";

    // Affine transform: apply to homogeneous coordinate [x, y, 1]
    Mat3 T = affine_2d(PI / 4, 5, 3);
    Vec3 p_h = {1, 0, 1};  // homogeneous
    Vec3 result = mat3_vec_mul(T, p_h);  // rotated then translated
    std::cout << "Affine result: [" << result[0] << ", "
              << result[1] << ", " << result[2] << "]\\n";
}`,
    },
  ],
  diagrams: [
    {
      title: "Vector and Matrix Operations",
      kind: "mindmap",
      caption: "Core linear algebra operations on vectors and matrices and their computational complexity.",
      mermaid: `mindmap
  root((Linear Algebra))
    Vectors
      Dot product O(n)
      Magnitude O(n)
      Normalization O(n)
      Cross product O(1) 3D
    Matrices
      Addition O(n squared)
      Multiplication O(n cubed) naive
      Transpose O(n squared)
      Inverse O(n cubed)
    Decompositions
      LU decomposition
      SVD
      Eigendecomposition`,
    },
    {
      title: "Matrix Multiplication Flow",
      kind: "flow",
      caption: "Step-by-step process of multiplying two matrices including dimension compatibility check.",
      mermaid: `flowchart TD
    A(["Multiply A m by k and B k by n"]) --> B{Dimensions compatible?
A cols == B rows}
    B -->|No| ERR(["Error: incompatible dimensions"])
    B -->|Yes| C["Initialize result C m by n with zeros"]
    C --> D["For each row i in A"]
    D --> E["For each col j in B"]
    E --> F["Sum A[i][k] * B[k][j] for all k"]
    F --> G["Store in C[i][j]"]
    G --> H{More elements?}
    H -->|Yes| E
    H -->|No| I(["Return C m by n"])`,
    },
    {
      title: "Linear Transformation Visualization",
      kind: "architecture",
      caption: "How a matrix represents a linear transformation mapping input vectors to output vectors.",
      mermaid: `graph LR
    IV["Input Vector
[x, y]"] --> MT["Matrix Transformation
[a b; c d]"]
    MT --> OV["Output Vector
[ax+by, cx+dy]"]
    MT --> R["Rotation
orthogonal matrix"]
    MT --> S["Scaling
diagonal matrix"]
    MT --> SH["Shear
upper triangular"]
    MT --> P["Projection
rank deficient"]`,
    },
    {
      title: "SVD Application in ML",
      kind: "sequence",
      caption: "How Singular Value Decomposition is used for dimensionality reduction in machine learning.",
      mermaid: `sequenceDiagram
    participant D as Data Matrix X m by n
    participant SVD as SVD Algorithm
    participant Red as Reduced Representation
    D->>SVD: compute X = U S V-transpose
    SVD-->>D: U m by m, S m by n, Vt n by n
    Note over SVD: singular values in S sorted descending
    D->>Red: keep top k singular values
    Red->>Red: X_approx = U_k * S_k * Vt_k
    Red-->>D: compressed m by k representation`,
    },
  ],
  animations: [
    {
      title: "How matrix-vector multiplication transforms a 2-D point",
      steps: [
        { label: "Start with a point", detail: "Take the vector v = [x, y] as a point in 2-D space." },
        { label: "Pick row 1 of M", detail: "Extract the first row [a, b] of the 2×2 matrix M." },
        { label: "Dot product → new x", detail: "Compute a·x + b·y to get the transformed x-coordinate." },
        { label: "Pick row 2 of M", detail: "Extract the second row [c, d] of the matrix M." },
        { label: "Dot product → new y", detail: "Compute c·x + d·y to get the transformed y-coordinate." },
        { label: "Result", detail: "The output [a·x + b·y, c·x + d·y] is the transformed point — the matrix has rotated, scaled, or sheared the original." },
      ],
    },
  ],
  comparison: {
    columns: ["Operation", "Formula", "Result type", "Complexity", "Use case"],
    rows: [
      ["Dot product", "Σaᵢbᵢ", "Scalar", "O(n)", "Similarity, projection, neural activation"],
      ["Cross product", "a × b (3-D only)", "Vector ⊥ to both", "O(1) for 3-D", "Surface normals, torque"],
      ["Matrix multiply", "(AB)ᵢⱼ = Σaᵢₖbₖⱼ", "Matrix (m×n)", "O(m·k·n)", "Composing transformations"],
      ["Transpose", "Aᵀᵢⱼ = Aⱼᵢ", "Matrix (n×m)", "O(m·n)", "Symmetric formulas, solving systems"],
      ["Inverse", "A⁻¹ s.t. AA⁻¹ = I", "Matrix (n×n)", "O(n³)", "Solving Ax = b, undoing transforms"],
      ["Determinant", "det(A)", "Scalar", "O(n³) via LU", "Singularity check, volume scaling"],
    ],
  },
  interviewQA: [
    {
      q: "What is the geometric interpretation of the dot product, and how is it used in machine learning?",
      a: "The dot product a·b = |a||b|cosθ measures how aligned two vectors are. When both vectors are unit-length, it equals cosθ directly — this is cosine similarity. In ML, it underpins attention mechanisms in transformers (query·key), similarity search in recommendation engines, and the linear combination in every dense neural-network layer (wᵀx + b).",
      followUps: [
        "How does cosine similarity differ from Euclidean distance?",
        "Why do transformers scale the dot product by 1/√dₖ?",
      ],
    },
    {
      q: "Why is matrix multiplication not commutative, and when does it matter?",
      a: "AB ≠ BA because the (i,j) entry of AB sums row-i of A with column-j of B, but BA sums row-i of B with column-j of A — different operands in different roles. In graphics, this means the order of transformations matters: rotating then translating gives a different result than translating then rotating. You must compose matrices right-to-left to match the intended transformation order.",
      followUps: [
        "Are there special cases where AB = BA?",
        "How does transformation order affect the MVP matrix?",
      ],
    },
    {
      q: "When is a matrix invertible, and what happens numerically when it is nearly singular?",
      a: "A matrix is invertible iff its determinant is non-zero, equivalently iff all eigenvalues are non-zero, equivalently iff its rows (or columns) are linearly independent. When det(A) is close to zero, the condition number κ(A) is large and small floating-point errors in the input get amplified into large errors in the solution. In practice, you should use LU or QR factorization instead of computing A⁻¹ directly, and check the condition number before trusting the result.",
      followUps: [
        "What is the relationship between rank and invertibility?",
        "How does regularization fix near-singular matrices in regression?",
      ],
    },
    {
      q: "Explain the cross product and where it is used in computer graphics.",
      a: "The cross product a × b returns a vector perpendicular to both a and b with magnitude |a||b|sinθ. Its direction follows the right-hand rule. In graphics, it computes surface normals for lighting (the normal to a triangle defined by two edge vectors), determines face winding order for back-face culling, and is used in constructing orthonormal camera bases (the 'look-at' matrix).",
      followUps: [
        "Why is the cross product only defined in 3-D (and 7-D)?",
        "How do you handle degenerate triangles where the cross product is zero?",
      ],
    },
  ],
  followUps: [
    "How do sparse matrix representations (CSR, CSC) save memory and speed up multiplication?",
    "What is the Strassen algorithm and when is it faster than naive matrix multiply?",
    "How are homogeneous coordinates used to unify rotation and translation into one matrix?",
    "What role do vectors and matrices play in word embeddings (Word2Vec, GloVe)?",
  ],
  mcqs: [
    {
      q: "What is the dot product of [1, 2, 3] and [4, 5, 6]?",
      options: ["15", "32", "21", "[4, 10, 18]"],
      answerIndex: 1,
      explanation: "Dot product = 1×4 + 2×5 + 3×6 = 4 + 10 + 18 = 32. It is a scalar, not a vector.",
    },
    {
      q: "If A is a 3×4 matrix and B is a 4×2 matrix, what is the shape of AB?",
      options: ["4×4", "3×2", "3×4", "2×3"],
      answerIndex: 1,
      explanation: "Matrix multiplication (m×k)(k×n) → (m×n). So (3×4)(4×2) → 3×2.",
    },
    {
      q: "What does a determinant of zero indicate about a square matrix?",
      options: [
        "The matrix is orthogonal",
        "The matrix has no eigenvalues",
        "The matrix is singular and has no inverse",
        "The matrix is symmetric",
      ],
      answerIndex: 2,
      explanation: "det(A) = 0 means the transformation collapses at least one dimension — the rows are linearly dependent, and A⁻¹ does not exist.",
    },
    {
      q: "Which norm is defined as the sum of absolute values of a vector's components?",
      options: ["L2 norm", "L1 norm", "L∞ norm", "Frobenius norm"],
      answerIndex: 1,
      explanation: "The L1 norm (Manhattan norm) is Σ|xᵢ|. L2 is √(Σxᵢ²), L∞ is max|xᵢ|, and Frobenius is for matrices.",
    },
    {
      q: "For a rotation matrix R, which property always holds?",
      options: [
        "det(R) = 0",
        "R = Rᵀ",
        "RᵀR = I and det(R) = 1",
        "R has no inverse",
      ],
      answerIndex: 2,
      explanation: "Rotation matrices are orthogonal (RᵀR = I) with determinant +1. Reflections are also orthogonal but have det = -1.",
    },
  ],
  exercises: [
    "Implement matrix multiplication from scratch (no NumPy) for two 2-D lists and verify it against NumPy's result.",
    "Write a function that computes the inverse of a 2×2 matrix using the formula A⁻¹ = (1/det) × [[d, -b], [-c, a]] and test edge cases where det = 0.",
    "Given a set of 3-D triangle vertices, compute the surface normal using the cross product and determine if the triangle is front-facing or back-facing.",
    "Implement cosine similarity between two vectors and use it to find the most similar pair among a list of word-embedding vectors.",
  ],
  flashcards: [
    { front: "Dot product formula and result type", back: "a·b = Σaᵢbᵢ = |a||b|cosθ. Returns a scalar." },
    { front: "Cross product result and direction rule", back: "a × b returns a vector perpendicular to both with magnitude |a||b|sinθ. Direction follows the right-hand rule. Only defined in 3-D." },
    { front: "Condition for matrix multiplication", back: "A (m×k) can multiply B (k×n) only if inner dimensions match. Result is (m×n)." },
    { front: "What does det(A) = 0 mean?", back: "The matrix is singular: its rows are linearly dependent, it has no inverse, and it collapses at least one dimension." },
    { front: "Transpose definition", back: "Aᵀ flips rows and columns: (Aᵀ)ᵢⱼ = Aⱼᵢ. For an m×n matrix, the transpose is n×m." },
    { front: "L1 vs L2 norm", back: "L1 = Σ|xᵢ| (Manhattan distance, promotes sparsity). L2 = √(Σxᵢ²) (Euclidean distance, penalizes large values)." },
    { front: "Orthogonal matrix property", back: "QᵀQ = I — the inverse equals the transpose. Columns form an orthonormal basis. Preserves lengths and angles." },
    { front: "Condition number κ(A)", back: "κ(A) = ‖A‖·‖A⁻¹‖. Measures sensitivity to numerical errors. High κ = ill-conditioned system." },
  ],
  revisionNotes: [
    "Dot product: scalar, measures alignment (cosθ), zero means perpendicular. Used everywhere in ML (attention, similarity, gradients).",
    "Cross product: vector, perpendicular to both inputs, magnitude = area of parallelogram. Only in 3-D. Key for normals and torque.",
    "Matrix multiply: (m×k)(k×n) → (m×n). Not commutative. Naive O(n³), Strassen O(n^2.81).",
    "Determinant: scalar measure of volume scaling. Zero ⟹ singular (no inverse). Compute via LU, not cofactor expansion.",
    "Inverse: exists iff det ≠ 0. Never compute directly in production — use factorization (LU, QR). Check condition number.",
    "Rotation matrices: orthogonal (RᵀR = I), det = 1. Compose rotations by multiplying matrices right-to-left.",
  ],
  cheatSheet: [
    "a·b = Σaᵢbᵢ = |a||b|cosθ (scalar)",
    "a × b = [a₂b₃−a₃b₂, a₃b₁−a₁b₃, a₁b₂−a₂b₁] (3-D vector, right-hand rule)",
    "‖x‖₂ = √(Σxᵢ²), ‖x‖₁ = Σ|xᵢ|, ‖x‖∞ = max|xᵢ|",
    "(AB)ᵢⱼ = Σₖ Aᵢₖ Bₖⱼ — inner dimensions must match",
    "(AB)ᵀ = BᵀAᵀ — transpose reverses multiplication order",
    "det(2×2) = ad − bc; A⁻¹ = (1/det)[[d,−b],[−c,a]]",
  ],
  resources: [
    { label: "3Blue1Brown — Essence of Linear Algebra", kind: "video", note: "Best visual intuition for what matrices and vectors really do geometrically." },
    { label: "MIT 18.06 — Linear Algebra (Gilbert Strang)", kind: "video", note: "Full university course; the gold standard for rigorous yet accessible treatment." },
    { label: "Linear Algebra Done Right — Sheldon Axler", kind: "book", note: "Proof-oriented, avoids determinants until the end. Great for deep understanding." },
    { label: "NumPy Linear Algebra documentation", kind: "docs", note: "Reference for np.linalg — eigenvalues, SVD, solve, norm, etc." },
    { label: "Immersive Math — Linear Algebra", kind: "article", note: "Interactive online textbook with live diagrams for every concept." },
  ],
  glossary: [
    { term: "Vector", definition: "An ordered list of numbers representing a point or direction in n-dimensional space." },
    { term: "Dot product", definition: "The sum of element-wise products of two vectors; equals |a||b|cosθ and returns a scalar." },
    { term: "Cross product", definition: "A binary operation on two 3-D vectors producing a vector perpendicular to both, with magnitude |a||b|sinθ." },
    { term: "Norm", definition: "A function that assigns a non-negative length to a vector. Common norms: L1, L2, L∞." },
    { term: "Determinant", definition: "A scalar value computed from a square matrix that measures the signed volume scaling factor of its linear transformation." },
    { term: "Singular matrix", definition: "A square matrix with determinant zero — it has no inverse and maps some non-zero vector to zero." },
    { term: "Orthogonal matrix", definition: "A square matrix Q where QᵀQ = I; its columns form an orthonormal basis and it preserves lengths and angles." },
    { term: "Condition number", definition: "κ(A) = ‖A‖·‖A⁻¹‖; measures how much the output of Ax = b changes for small changes in A or b." },
  ],
};
