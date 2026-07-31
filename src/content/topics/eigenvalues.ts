import type { TopicContent } from "../types";

export const eigenvalues: TopicContent = {
  quickSummary: [
    "An eigenvector v of a matrix A is a non-zero vector whose direction is unchanged by the transformation: Av = λv, where the scalar λ is the eigenvalue.",
    "Eigenvalues are found by solving det(A − λI) = 0 — the characteristic equation — which yields a polynomial of degree n for an n×n matrix.",
    "Diagonalization A = PDP⁻¹ rewrites a matrix in terms of its eigenvalues (diagonal D) and eigenvectors (columns of P), making matrix powers trivial: Aᵏ = PDᵏP⁻¹.",
    "Real-world applications: PCA projects data onto top eigenvectors of the covariance matrix, PageRank finds the dominant eigenvector of the web graph, and vibration analysis uses eigenvalues as natural frequencies.",
  ],
  detailed: [
    "Given a square matrix A, we seek non-zero vectors v such that Av = λv — the transformation merely scales v by λ. Rearranging: (A − λI)v = 0, which has a non-trivial solution only when det(A − λI) = 0. This determinant equation is the characteristic polynomial, and its roots are the eigenvalues.",
    "For a 2×2 matrix [[a,b],[c,d]], the characteristic polynomial is λ² − (a+d)λ + (ad−bc) = λ² − tr(A)λ + det(A). The sum of eigenvalues equals the trace, and their product equals the determinant — two facts that provide quick sanity checks.",
    "Once eigenvalues are known, each eigenvector is found by solving (A − λI)v = 0 via Gaussian elimination. The set of all eigenvectors for a given λ, plus the zero vector, forms the eigenspace. Its dimension is the geometric multiplicity of λ, which is always ≤ the algebraic multiplicity (the root's multiplicity in the characteristic polynomial).",
    "A matrix is diagonalizable iff it has n linearly independent eigenvectors. When it does, A = PDP⁻¹ where P's columns are eigenvectors and D is diagonal with corresponding eigenvalues. This makes computing Aᵏ trivial: Aᵏ = PDᵏP⁻¹, because raising a diagonal matrix to a power just raises each diagonal entry.",
    "Symmetric matrices (A = Aᵀ) are guaranteed to be diagonalizable with real eigenvalues and orthogonal eigenvectors — the Spectral Theorem. This is why the covariance matrix in PCA always yields a clean decomposition: you get orthogonal principal components with eigenvalues representing variance along each axis.",
  ],
  deepDive: [
    "The power iteration algorithm finds the dominant eigenvalue by repeatedly multiplying a random vector by A and normalizing: vₖ₊₁ = Avₖ/‖Avₖ‖. It converges at rate |λ₂/λ₁|, so a large spectral gap means fast convergence. Google's original PageRank used power iteration on the web's link matrix — the dominant eigenvector gives page importance scores.",
    "The QR algorithm is the standard method for computing all eigenvalues. It repeatedly factors A = QR (orthogonal × upper-triangular) then forms A' = RQ. The sequence converges to an upper-triangular (or block-triangular) matrix whose diagonal entries are the eigenvalues. With shifts, convergence is cubic — this is how LAPACK's dgeev works under the hood.",
    "Spectral decomposition A = Σλᵢuᵢuᵢᵀ (for symmetric A) expresses the matrix as a sum of rank-1 matrices weighted by eigenvalues. Truncating to the top k terms gives the best rank-k approximation in the Frobenius norm — this is the mathematical basis of PCA. The closely related SVD (A = UΣVᵀ) generalizes spectral decomposition to non-square and non-symmetric matrices.",
    "In dynamical systems, eigenvalues of the system matrix determine stability. If all eigenvalues have negative real parts, the system is stable (perturbations decay). If any eigenvalue has a positive real part, the system is unstable. Complex eigenvalues produce oscillations, with the imaginary part setting the frequency. This applies equally to differential equations, control systems, and Markov chains (where |λ| < 1 for all non-dominant eigenvalues ensures convergence to steady state).",
  ],
  code: [
    {
      language: "cpp",
      caption: "Finding eigenvalues and eigenvectors, and using diagonalization with Eigen",
      source: `#include <iostream>
#include <Eigen/Dense>
#include <cmath>

int main() {
    Eigen::Matrix2d A;
    A << 4, 1,
         2, 3;

    // Compute eigenvalues and eigenvectors
    Eigen::EigenSolver<Eigen::Matrix2d> solver(A);
    auto eigenvalues = solver.eigenvalues().real();
    auto eigenvectors = solver.eigenvectors().real();
    std::cout << "Eigenvalues: " << eigenvalues.transpose() << "\\n";
    std::cout << "Eigenvectors (columns):\\n" << eigenvectors << "\\n";

    // Verify: A * v = lambda * v
    for (int i = 0; i < 2; ++i) {
        Eigen::Vector2d v = eigenvectors.col(i);
        double lam = eigenvalues(i);
        bool close = (A * v - lam * v).norm() < 1e-10;
        std::cout << "A * v" << i << " = lam" << i << " * v" << i
                  << ": " << (close ? "true" : "false") << "\\n";
    }

    // Diagonalization: A = P D P^{-1}
    Eigen::Matrix2d P = eigenvectors;
    Eigen::Matrix2d D = eigenvalues.asDiagonal();
    Eigen::Matrix2d P_inv = P.inverse();
    Eigen::Matrix2d A_reconstructed = P * D * P_inv;
    bool matches = (A - A_reconstructed).norm() < 1e-10;
    std::cout << "Reconstruction matches: " << (matches ? "true" : "false") << "\\n";

    // Fast matrix power via diagonalization: A^10
    Eigen::Vector2d ev10;
    ev10 << std::pow(eigenvalues(0), 10), std::pow(eigenvalues(1), 10);
    Eigen::Matrix2d A_10 = P * ev10.asDiagonal() * P_inv;
    std::cout << "A^10 via diagonalization:\\n" << A_10 << "\\n";

    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "PCA via eigendecomposition of the covariance matrix with Eigen",
      source: `#include <iostream>
#include <iomanip>
#include <Eigen/Dense>
#include <random>

int main() {
    // Generate sample data: 100 points in 3-D
    std::mt19937 rng(42);
    std::normal_distribution<double> dist(0.0, 1.0);

    Eigen::MatrixXd raw(100, 3);
    for (int i = 0; i < 100; ++i)
        for (int j = 0; j < 3; ++j)
            raw(i, j) = dist(rng);

    Eigen::Matrix3d transform;
    transform << 3, 1, 0,
                 1, 2, 0.5,
                 0, 0.5, 1;
    Eigen::MatrixXd X = raw * transform;

    // Step 1: Center the data
    Eigen::RowVector3d mean = X.colwise().mean();
    Eigen::MatrixXd X_centered = X.rowwise() - mean;

    // Step 2: Compute covariance matrix
    Eigen::Matrix3d cov =
        (X_centered.transpose() * X_centered) / (X.rows() - 1);

    // Step 3: Eigendecomposition (SelfAdjointEigenSolver for symmetric)
    Eigen::SelfAdjointEigenSolver<Eigen::Matrix3d> solver(cov);
    Eigen::Vector3d eigenvalues = solver.eigenvalues();
    Eigen::Matrix3d eigenvectors = solver.eigenvectors();

    // Step 4: Sort by descending eigenvalue
    // Eigen returns in ascending order, so reverse
    Eigen::Vector3d sorted_vals = eigenvalues.reverse();
    Eigen::Matrix3d sorted_vecs = eigenvectors.rowwise().reverse();

    // Step 5: Project onto top-2 principal components
    Eigen::MatrixXd W = sorted_vecs.leftCols(2);  // top-2 eigenvectors
    Eigen::MatrixXd X_pca = X_centered * W;        // projected (100 x 2)

    // Variance explained
    double total_var = sorted_vals.sum();
    for (int i = 0; i < 3; ++i) {
        std::cout << "PC" << i + 1 << ": variance = "
                  << std::fixed << std::setprecision(2) << sorted_vals(i)
                  << " (" << std::setprecision(1)
                  << 100.0 * sorted_vals(i) / total_var << "%)\\n";
    }
    return 0;
}`,
    },
  ],
  diagrams: [
    {
      title: "Eigenvector transformation",
      kind: "flow",
      caption: "Shows how applying matrix A to an eigenvector v only scales it by λ, while a non-eigenvector changes both direction and magnitude.",
    },
    {
      title: "PCA via eigendecomposition pipeline",
      kind: "architecture",
      caption: "Data → center → covariance matrix → eigendecomposition → select top-k eigenvectors → project data onto lower-dimensional subspace.",
    },
  ],
  animations: [
    {
      title: "Power iteration converging to the dominant eigenvector",
      steps: [
        { label: "Initialize", detail: "Start with a random unit vector v₀. It is a mix of all eigenvector directions." },
        { label: "Multiply", detail: "Compute w = A·v₀. The dominant eigenvector component gets scaled by λ₁ (the largest eigenvalue), growing faster than other components." },
        { label: "Normalize", detail: "Set v₁ = w / ‖w‖. This keeps the vector unit-length while preserving its direction." },
        { label: "Repeat", detail: "Multiply again: w = A·v₁, normalize to get v₂. Each iteration amplifies the dominant component further." },
        { label: "Converge", detail: "After k iterations, vₖ is nearly parallel to the true dominant eigenvector. The ratio ‖Avₖ‖/‖vₖ‖ approximates λ₁." },
        { label: "Extract", detail: "The dominant eigenvalue is λ₁ ≈ vₖᵀAvₖ (Rayleigh quotient). Deflate A to find the next eigenvalue." },
      ],
    },
  ],
  comparison: {
    columns: ["Property", "Eigendecomposition (A = PDP⁻¹)", "SVD (A = UΣVᵀ)"],
    rows: [
      ["Applies to", "Square matrices only", "Any m×n matrix"],
      ["Requires diagonalizability", "Yes — needs n independent eigenvectors", "Always exists"],
      ["Factors are orthogonal", "Only if A is symmetric", "U and V are always orthogonal"],
      ["Diagonal entries", "Eigenvalues (can be negative/complex)", "Singular values (always ≥ 0)"],
      ["Relationship", "σᵢ = |λᵢ| for normal matrices", "σᵢ² = eigenvalues of AᵀA"],
      ["Primary use", "Stability, dynamics, PCA on covariance", "Dimensionality reduction, pseudoinverse, compression"],
    ],
  },
  interviewQA: [
    {
      q: "Explain the connection between eigenvalues and PCA.",
      a: "PCA finds directions of maximum variance in data. The covariance matrix C = XᵀX/(n−1) is symmetric, so the Spectral Theorem guarantees real eigenvalues and orthogonal eigenvectors. The eigenvectors point in the directions of greatest variance, and the corresponding eigenvalues quantify how much variance lies along each direction. Sorting by eigenvalue and keeping the top k gives the best k-dimensional approximation (in the least-squares sense).",
      followUps: [
        "When should you use SVD instead of eigendecomposition for PCA?",
        "How do you choose k — how many components to keep?",
      ],
    },
    {
      q: "How does Google PageRank use eigenvectors?",
      a: "The web is modeled as a directed graph with a transition matrix M where Mᵢⱼ = 1/(outlinks of j) if j links to i. PageRank adds a damping factor (0.85) and a uniform teleportation term to make M stochastic, aperiodic, and irreducible. The PageRank vector is the dominant eigenvector (λ = 1) of this modified matrix, found efficiently by power iteration. A page's score is its entry in this eigenvector — the stationary distribution of a random surfer.",
      followUps: [
        "Why is the damping factor needed?",
        "How does power iteration handle the scale of the web (billions of pages)?",
      ],
    },
    {
      q: "What does it mean for a matrix to be diagonalizable, and when is it not?",
      a: "A matrix is diagonalizable if it has n linearly independent eigenvectors, allowing A = PDP⁻¹. This fails when the geometric multiplicity of some eigenvalue is less than its algebraic multiplicity — there aren't enough independent eigenvectors. The classic example is the 2×2 matrix [[1,1],[0,1]]: it has a repeated eigenvalue λ = 1 but only one independent eigenvector [1,0]. Such matrices can only be put in Jordan normal form, not fully diagonalized.",
      followUps: [
        "What is Jordan normal form?",
        "Are symmetric matrices always diagonalizable?",
      ],
    },
    {
      q: "How do eigenvalues determine the stability of a dynamical system?",
      a: "For a linear system dx/dt = Ax, the solution involves e^(λt) for each eigenvalue λ. If Re(λ) < 0 for all eigenvalues, e^(λt) → 0 and the system is stable (perturbations decay). If any Re(λ) > 0, that component grows exponentially — the system is unstable. For discrete systems xₖ₊₁ = Axₖ, stability requires |λ| < 1 for all eigenvalues. Complex eigenvalues produce oscillations with frequency proportional to the imaginary part.",
      followUps: [
        "What happens at the boundary when Re(λ) = 0?",
        "How does this apply to neural network training stability?",
      ],
    },
  ],
  followUps: [
    "How does the Singular Value Decomposition (SVD) relate to eigendecomposition?",
    "What is the spectral gap and why does it matter for convergence of iterative methods?",
    "How are eigenvalues used in graph theory (spectral clustering, graph Laplacian)?",
  ],
  mcqs: [
    {
      q: "If A has eigenvalues 3 and 7, what is det(A)?",
      options: ["10", "21", "4", "3"],
      answerIndex: 1,
      explanation: "The determinant of a matrix equals the product of its eigenvalues: 3 × 7 = 21.",
    },
    {
      q: "The trace of a matrix equals:",
      options: [
        "The product of its eigenvalues",
        "The sum of its eigenvalues",
        "The largest eigenvalue",
        "The determinant",
      ],
      answerIndex: 1,
      explanation: "tr(A) = Σλᵢ. The trace is the sum of diagonal entries, which equals the sum of eigenvalues.",
    },
    {
      q: "Which matrix is always guaranteed to have real eigenvalues and orthogonal eigenvectors?",
      options: [
        "Any square matrix",
        "Any invertible matrix",
        "A symmetric matrix (A = Aᵀ)",
        "An upper-triangular matrix",
      ],
      answerIndex: 2,
      explanation: "The Spectral Theorem: symmetric (real) matrices have real eigenvalues and can be orthogonally diagonalized.",
    },
    {
      q: "In PCA, what do the eigenvalues of the covariance matrix represent?",
      options: [
        "The mean of each feature",
        "The number of data points",
        "The variance explained by each principal component",
        "The correlation between features",
      ],
      answerIndex: 2,
      explanation: "Each eigenvalue λᵢ is the variance of the data projected onto the corresponding eigenvector (principal component).",
    },
    {
      q: "Power iteration converges to:",
      options: [
        "The smallest eigenvalue",
        "All eigenvalues simultaneously",
        "The eigenvector corresponding to the largest |λ|",
        "The determinant",
      ],
      answerIndex: 2,
      explanation: "Power iteration amplifies the component along the dominant eigenvector (largest |λ|) at each step, so it converges to that eigenvector.",
    },
  ],
  exercises: [
    "Compute the eigenvalues and eigenvectors of [[2, 1], [1, 2]] by hand using the characteristic equation, then verify with NumPy.",
    "Implement power iteration from scratch: given a matrix and a tolerance, iterate until the eigenvalue estimate changes by less than the tolerance, and return both the eigenvalue and eigenvector.",
    "Perform PCA on a 2-D dataset: generate correlated data, compute the covariance matrix, find its eigenvectors, and plot the data along the principal component axes.",
    "Prove that the eigenvalues of a triangular matrix are its diagonal entries (hint: compute det(A − λI) for a triangular matrix).",
  ],
  flashcards: [
    { front: "Eigenvalue equation", back: "Av = λv where v ≠ 0. The vector v is an eigenvector and the scalar λ is the corresponding eigenvalue." },
    { front: "Characteristic polynomial", back: "det(A − λI) = 0. The roots of this polynomial are the eigenvalues of A." },
    { front: "Trace and eigenvalues", back: "tr(A) = Σλᵢ (sum of eigenvalues = sum of diagonal entries)." },
    { front: "Determinant and eigenvalues", back: "det(A) = Πλᵢ (product of all eigenvalues)." },
    { front: "Diagonalization formula", back: "A = PDP⁻¹ where P = [v₁|v₂|...|vₙ] and D = diag(λ₁,...,λₙ). Requires n independent eigenvectors." },
    { front: "Spectral Theorem", back: "Every real symmetric matrix has real eigenvalues and orthogonal eigenvectors: A = QDQᵀ where Q is orthogonal." },
    { front: "Power iteration convergence rate", back: "Converges at rate |λ₂/λ₁| per step. Larger spectral gap ⟹ faster convergence." },
    { front: "Eigenvalue stability criterion", back: "Continuous system dx/dt = Ax is stable iff all Re(λᵢ) < 0. Discrete xₖ₊₁ = Axₖ is stable iff all |λᵢ| < 1." },
  ],
  revisionNotes: [
    "Eigenvalue equation: Av = λv, found by solving det(A − λI) = 0. Sum of eigenvalues = trace, product = determinant.",
    "Diagonalization: A = PDP⁻¹ iff A has n independent eigenvectors. Makes Aᵏ = PDᵏP⁻¹ trivial.",
    "Symmetric matrices always diagonalize with real eigenvalues and orthogonal eigenvectors (Spectral Theorem).",
    "PCA: eigenvectors of covariance matrix = principal components; eigenvalues = variance along each PC.",
    "Power iteration finds the dominant eigenvector. Convergence rate depends on the spectral gap |λ₂/λ₁|.",
    "Eigenvalues determine stability: Re(λ) < 0 ⟹ stable for continuous systems; |λ| < 1 ⟹ stable for discrete systems.",
  ],
  cheatSheet: [
    "Av = λv ⟹ det(A − λI) = 0 gives eigenvalues",
    "tr(A) = Σλᵢ, det(A) = Πλᵢ",
    "A = PDP⁻¹ ⟹ Aᵏ = PDᵏP⁻¹",
    "Symmetric A ⟹ real λ, orthogonal eigenvectors (Spectral Theorem)",
    "Power iteration: vₖ₊₁ = Avₖ / ‖Avₖ‖ → dominant eigenvector",
    "PCA: center data → covariance → eigendecompose → top-k eigenvectors",
  ],
  resources: [
    { label: "3Blue1Brown — Eigenvectors and Eigenvalues", kind: "video", note: "Stunning visual explanation of what eigenvalues mean geometrically." },
    { label: "MIT 18.06 Lecture 21 — Eigenvalues (Gilbert Strang)", kind: "video", note: "Rigorous university lecture covering theory and computation." },
    { label: "The Matrix Cookbook", kind: "paper", note: "Comprehensive reference for matrix identities, derivatives, and eigenvalue properties." },
    { label: "NumPy linalg.eig / eigh documentation", kind: "docs", note: "API reference for computing eigenvalues in Python; eigh is optimized for symmetric matrices." },
    { label: "Mining of Massive Datasets — Ch. 5 (PageRank)", kind: "book", note: "Detailed treatment of PageRank as an eigenvector problem, including power iteration at scale." },
  ],
  glossary: [
    { term: "Eigenvalue", definition: "A scalar λ such that Av = λv for some non-zero vector v. Represents the scaling factor along the eigenvector direction." },
    { term: "Eigenvector", definition: "A non-zero vector v that satisfies Av = λv — it is only scaled, not rotated, by the transformation A." },
    { term: "Characteristic polynomial", definition: "det(A − λI) expanded as a polynomial in λ. Its roots are the eigenvalues." },
    { term: "Diagonalization", definition: "Writing A = PDP⁻¹ where D is diagonal (eigenvalues) and P's columns are eigenvectors." },
    { term: "Spectral Theorem", definition: "States that every real symmetric matrix can be orthogonally diagonalized with real eigenvalues." },
    { term: "Spectral gap", definition: "The ratio |λ₂/λ₁| between the second-largest and largest eigenvalue magnitudes. Controls convergence speed of power iteration." },
    { term: "Algebraic multiplicity", definition: "The multiplicity of an eigenvalue as a root of the characteristic polynomial." },
    { term: "Geometric multiplicity", definition: "The dimension of the eigenspace for a given eigenvalue — the number of independent eigenvectors for that λ." },
  ],
};
