import type { TopicContent } from "../types";

export const pVsNp: TopicContent = {
  quickSummary: [
    "P is the class of decision problems solvable in polynomial time; NP is the class of problems whose solutions can be verified in polynomial time.",
    "The P vs NP question asks whether every problem whose solution can be quickly verified can also be quickly solved — it remains the most important open problem in computer science.",
    "NP-complete problems are the hardest problems in NP: if any one of them has a polynomial-time algorithm, then ALL problems in NP do (P = NP).",
    "NP-hard problems are at least as hard as NP-complete problems but need not be in NP (they may not even be decision problems).",
  ],
  detailed: [
    "A decision problem is one with a yes/no answer: 'Does this graph have a Hamiltonian cycle?' not 'Find the shortest path.' Complexity classes are defined in terms of decision problems. P (Polynomial time) contains all decision problems solvable by a deterministic Turing machine in time O(n^k) for some constant k. Examples include sorting (is the array sorted?), shortest path (is there a path of length ≤ k?), and primality testing (is n prime? — proven to be in P by the AKS algorithm in 2002).",
    "NP (Nondeterministic Polynomial time) contains all decision problems for which a 'yes' answer can be verified in polynomial time given a certificate (proof/witness). For example, if someone claims a graph has a Hamiltonian cycle and hands you the cycle, you can verify it in O(n) time by checking that it visits every vertex exactly once. NP does NOT mean 'not polynomial' or 'exponential.' Every problem in P is also in NP (if you can solve it in polynomial time, you can certainly verify a solution in polynomial time), so P ⊆ NP.",
    "A polynomial-time reduction from problem A to problem B is a polynomial-time algorithm that transforms any instance of A into an instance of B such that the A-instance is a 'yes' if and only if the B-instance is a 'yes.' We write A ≤_p B, meaning 'A reduces to B' or 'B is at least as hard as A.' If B is in P and A ≤_p B, then A is also in P (solve A by reducing to B and solving B). Reductions are the fundamental tool for comparing problem difficulty.",
    "A problem X is NP-hard if every problem in NP can be reduced to X in polynomial time. Intuitively, X is at least as hard as the hardest problems in NP. A problem is NP-complete if it is both NP-hard AND in NP — it sits at the boundary of NP, being the hardest problems within the class. The Cook-Levin theorem (1971) proved that Boolean Satisfiability (SAT) is NP-complete, providing the first NP-complete problem. From SAT, hundreds of other problems were shown NP-complete by reduction: 3-SAT, Clique, Vertex Cover, Hamiltonian Cycle, Subset Sum, Graph Coloring, Traveling Salesman (decision version), and many more.",
    "If any NP-complete problem has a polynomial-time algorithm, then P = NP (because every NP problem reduces to it in polynomial time, composing the reduction with the algorithm gives a polynomial-time solution for every NP problem). Conversely, if any NP problem is proven to require super-polynomial time, then P ≠ NP. Most researchers believe P ≠ NP, but no proof exists. The question has profound implications: if P = NP, cryptography based on computational hardness (RSA, Diffie-Hellman) would collapse, and optimization, AI planning, and theorem proving would become efficiently solvable.",
  ],
  deepDive: [
    "The Cook-Levin theorem proves SAT is NP-complete by showing that any NP problem can be reduced to SAT. The key insight: an NP problem has a polynomial-time verifier V(x, c) that checks whether certificate c is valid for input x. A Turing machine running V can be encoded as a Boolean formula: variables represent the machine's configuration (tape contents, head position, state) at each time step, and clauses enforce valid transitions. The resulting formula is satisfiable if and only if there exists a certificate c making V accept. Since V runs in polynomial time, the formula has polynomial size. This reduction is polynomial, proving every NP problem ≤_p SAT.",
    "Proving a new problem X is NP-complete requires two steps: (1) Show X ∈ NP by describing a polynomial-time verifier. (2) Show X is NP-hard by reducing a known NP-complete problem Y to X (Y ≤_p X). By transitivity of reductions, since every NP problem reduces to Y and Y reduces to X, every NP problem reduces to X. The classic reduction chain starts with SAT → 3-SAT → Clique → Vertex Cover → Hamiltonian Cycle → TSP. Each reduction reveals deep structural connections between seemingly different problems.",
    "Beyond NP, a rich hierarchy of complexity classes exists. co-NP contains problems whose 'no' answers have polynomial-time verifiable certificates (e.g., 'is this formula unsatisfiable?' — a 'yes' answer is hard to verify, but a 'no' answer comes with a satisfying assignment). PSPACE contains problems solvable with polynomial space (includes both NP and co-NP). EXP contains problems solvable in exponential time. The polynomial hierarchy (PH) generalizes NP to alternating quantifiers. If P = NP, the entire polynomial hierarchy collapses to P — another reason experts believe P ≠ NP, as it would be a surprisingly clean simplification.",
    "In practice, NP-hardness does not mean 'impossible to solve.' It means no worst-case polynomial algorithm exists (assuming P ≠ NP), but many strategies work well: approximation algorithms (guarantee solutions within a factor of optimal, e.g., 2-approximation for Vertex Cover), parameterized algorithms (exponential only in a small parameter k, e.g., O(2^k · n) for k-Vertex Cover), heuristics and metaheuristics (genetic algorithms, simulated annealing), SAT solvers (modern solvers handle millions of variables in practical instances), and average-case tractability (many NP-complete problems are easy on random instances). The theory of NP-completeness guides algorithm design: once you prove a problem NP-hard, you know to seek approximations rather than exact polynomial algorithms.",
  ],
  code: [
    {
      language: "python",
      caption: "Demonstrating verification vs solving: Subset Sum",
      source: `# SUBSET SUM: Given a set of integers and a target, is there a subset that sums to target?
# Verification (polynomial) vs Solving (exponential brute force)

def verify_subset_sum(nums, target, certificate):
    """
    Verify a proposed solution in O(len(certificate)) time.
    Certificate is the list of indices forming the subset.
    This is why Subset Sum is in NP.
    """
    subset_sum = sum(nums[i] for i in certificate)
    # Check all indices are valid and distinct
    if len(set(certificate)) != len(certificate):
        return False
    if any(i < 0 or i >= len(nums) for i in certificate):
        return False
    return subset_sum == target

def solve_subset_sum_brute(nums, target):
    """
    Brute force: try all 2^n subsets. Time: O(2^n * n).
    No known polynomial algorithm exists (NP-complete).
    """
    n = len(nums)
    for mask in range(1 << n):       # 2^n subsets
        total = 0
        indices = []
        for i in range(n):
            if mask & (1 << i):
                total += nums[i]
                indices.append(i)
        if total == target:
            return indices
    return None

def solve_subset_sum_dp(nums, target):
    """
    Dynamic programming: O(n * target) — pseudo-polynomial.
    Polynomial in the VALUE of target, not its BIT LENGTH.
    """
    dp = [False] * (target + 1)
    dp[0] = True
    for num in nums:
        for t in range(target, num - 1, -1):
            if dp[t - num]:
                dp[t] = True
    return dp[target]

# Example
nums = [3, 7, 1, 8, -2, 4]
target = 11
certificate = [1, 3]  # nums[1] + nums[3] = 7 + 8 = 15? No. Try [0, 3] = 3+8=11. Yes!
certificate = [0, 3]
print(f"Verify [0,3]: {verify_subset_sum(nums, target, certificate)}")  # True
print(f"Brute force:  {solve_subset_sum_brute(nums, target)}")
print(f"DP solution:  {solve_subset_sum_dp(nums, target)}")              # True`,
    },
    {
      language: "python",
      caption: "Polynomial-time reduction: Vertex Cover to Independent Set",
      source: `# Reduction: VERTEX COVER <=_p INDEPENDENT SET
# A vertex cover of size k exists <=> an independent set of size n-k exists.
# Complement: S is a vertex cover iff V-S is an independent set.

def is_vertex_cover(graph, cover):
    """Check if 'cover' covers every edge."""
    for u, v in graph["edges"]:
        if u not in cover and v not in cover:
            return False
    return True

def is_independent_set(graph, indep):
    """Check if no two vertices in 'indep' share an edge."""
    for u, v in graph["edges"]:
        if u in indep and v in indep:
            return False
    return True

def reduce_vc_to_is(graph, k):
    """
    Reduce: 'Does graph have a vertex cover of size k?'
         => 'Does graph have an independent set of size n-k?'
    Same graph, different parameter. Polynomial-time reduction.
    """
    n = len(graph["vertices"])
    return graph, n - k

# Example
graph = {
    "vertices": [0, 1, 2, 3, 4],
    "edges": [(0,1), (1,2), (2,3), (3,4), (0,4)]
}

# Vertex cover {1, 3, 4} of size 3 => independent set {0, 2} of size 2
cover = {1, 3, 4}
indep = set(graph["vertices"]) - cover
print(f"Cover {cover} valid: {is_vertex_cover(graph, cover)}")
print(f"Independent set {indep} valid: {is_independent_set(graph, indep)}")
# Both True — demonstrates the reduction`,
    },
  ],
  diagrams: [
    {
      title: "Complexity class containment: P ⊆ NP ⊆ PSPACE ⊆ EXP",
      kind: "mindmap",
      caption: "Euler diagram showing the relationship between complexity classes. NP-complete problems sit at the boundary of NP. If P = NP, the P and NP regions merge.",
    },
    {
      title: "Classic NP-completeness reduction chain",
      kind: "flow",
      caption: "SAT → 3-SAT → Clique → Vertex Cover → Hamiltonian Cycle → TSP (decision). Each arrow is a polynomial-time reduction proving the target NP-complete.",
    },
  ],
  animations: [
    {
      title: "Proving a problem NP-complete via reduction",
      steps: [
        {
          label: "Step 1: Show the problem is in NP",
          detail: "Describe a certificate (witness) for a 'yes' instance and show it can be verified in polynomial time. For example, for Hamiltonian Cycle, the certificate is the cycle itself — verify it visits all vertices in O(n).",
        },
        {
          label: "Step 2: Choose a known NP-complete problem",
          detail: "Pick a problem already proven NP-complete, ideally one structurally similar to the target. Common starting points: 3-SAT, Vertex Cover, Subset Sum.",
        },
        {
          label: "Step 3: Construct the reduction",
          detail: "Design a polynomial-time algorithm that transforms any instance of the known problem into an instance of the target problem, preserving yes/no answers.",
        },
        {
          label: "Step 4: Prove correctness (both directions)",
          detail: "Show: (a) if the known-problem instance is a 'yes,' the constructed target instance is a 'yes,' and (b) if the target instance is a 'yes,' the original is a 'yes.' Both directions are essential.",
        },
        {
          label: "Step 5: Verify polynomial time",
          detail: "Confirm the reduction runs in polynomial time and produces an output of polynomial size. The composition of the polynomial reduction with any hypothetical polynomial solver yields a polynomial algorithm for the known NP-complete problem.",
        },
        {
          label: "Step 6: Conclude NP-completeness",
          detail: "Since the problem is in NP (step 1) and NP-hard (steps 2-5 show every NP problem reduces to it via transitivity), it is NP-complete.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Class", "Definition", "Verification", "Example"],
    rows: [
      ["P", "Solvable in polynomial time by a deterministic TM", "N/A (solvable directly)", "Shortest path, sorting, primality (AKS)"],
      ["NP", "'Yes' answers verifiable in polynomial time given a certificate", "Polynomial-time verification", "SAT, Hamiltonian Cycle, Subset Sum"],
      ["co-NP", "'No' answers verifiable in polynomial time given a certificate", "Polynomial-time refutation", "Unsatisfiability, graph non-isomorphism (believed)"],
      ["NP-complete", "In NP AND NP-hard (every NP problem reduces to it)", "Polynomial-time verification", "3-SAT, Clique, Vertex Cover, TSP (decision)"],
      ["NP-hard", "Every NP problem reduces to it (may not be in NP)", "Not necessarily verifiable in poly time", "Halting problem, optimal TSP tour (optimization)"],
    ],
  },
  interviewQA: [
    {
      q: "What does it mean for a problem to be NP-complete, and why does it matter?",
      a: "A problem is NP-complete if: (1) it is in NP (a 'yes' answer can be verified in polynomial time), and (2) it is NP-hard (every problem in NP can be reduced to it in polynomial time). NP-complete problems are the hardest problems in NP. Their significance: if you find a polynomial algorithm for ANY NP-complete problem, you have proven P = NP and can solve ALL NP problems efficiently. Conversely, proving any NP problem requires super-polynomial time would prove P ≠ NP. In practice, once you show a problem is NP-complete, you know to look for approximations, heuristics, or parameterized algorithms rather than exact polynomial solutions.",
      followUps: [
        "How would you prove that a new problem is NP-complete?",
        "Name three NP-complete problems and the reductions connecting them.",
        "What is the practical implication of NP-hardness for software engineering?",
      ],
    },
    {
      q: "Explain the difference between NP-hard and NP-complete.",
      a: "NP-hard means every problem in NP can be reduced to it in polynomial time — it is at least as hard as the hardest NP problems. NP-complete means NP-hard AND in NP. The key difference: NP-hard problems need not be decision problems and need not be in NP. For example, the optimization version of TSP ('find the shortest tour') is NP-hard but not NP-complete because it is not a decision problem. The Halting Problem is NP-hard (you can reduce SAT to it) but not in NP (it is undecidable — no algorithm solves it at all). NP-complete is the intersection of NP and NP-hard.",
      followUps: [
        "Can an undecidable problem be NP-hard?",
        "Is every NP-hard problem at least as hard as NP-complete problems?",
      ],
    },
    {
      q: "What is a polynomial-time reduction and why is it important?",
      a: "A polynomial-time (Karp) reduction from problem A to problem B is a function f computable in polynomial time such that x is a 'yes' instance of A if and only if f(x) is a 'yes' instance of B. Written A ≤_p B, it means 'B is at least as hard as A.' Importance: reductions are the mechanism for proving NP-completeness. If B is in P and A ≤_p B, then A is in P. Contrapositive: if A is not in P and A ≤_p B, then B is not in P either. Reductions transfer hardness results between problems.",
      followUps: [
        "What is the difference between Karp reductions and Turing reductions?",
        "Why must the reduction run in polynomial time?",
      ],
    },
    {
      q: "If P equals NP, what would be the consequences?",
      a: "If P = NP: (1) All modern public-key cryptography (RSA, elliptic curves, Diffie-Hellman) would be insecure, since factoring and discrete log would be solvable in polynomial time. (2) Optimization problems like scheduling, routing, and resource allocation would become efficiently solvable. (3) Mathematical theorem proving could be automated (verifying a proof is in NP). (4) Machine learning would change fundamentally — finding optimal models would be polynomial. However, 'polynomial' might mean O(n^{100}), which is impractical, so the theoretical collapse might not translate to practical efficiency. Most experts believe P ≠ NP.",
      followUps: [
        "Would P = NP necessarily make all crypto insecure in practice?",
      ],
    },
  ],
  followUps: [
    "What are the best known approximation algorithms for NP-hard problems like TSP and Vertex Cover?",
    "How do SAT solvers manage to solve NP-complete problems efficiently in practice?",
    "What is the significance of the polynomial hierarchy and what happens if it collapses?",
    "How does randomness relate to P vs NP — what are BPP and RP?",
  ],
  mcqs: [
    {
      q: "Which of the following is TRUE about the relationship between P and NP?",
      options: [
        "P and NP are disjoint sets",
        "P is a subset of NP",
        "NP is a subset of P",
        "P = NP has been proven",
      ],
      answerIndex: 1,
      explanation: "Every problem solvable in polynomial time (P) can also have its solution verified in polynomial time (NP), so P ⊆ NP. Whether P = NP or P ⊊ NP is the open question.",
    },
    {
      q: "The Cook-Levin theorem proved that:",
      options: [
        "P ≠ NP",
        "Boolean Satisfiability (SAT) is NP-complete",
        "The Traveling Salesman Problem is NP-hard",
        "All NP problems can be solved in exponential time",
      ],
      answerIndex: 1,
      explanation: "Cook (1971) and Levin independently proved that SAT is NP-complete — the first problem shown to be NP-complete. This enabled proving other problems NP-complete via reduction from SAT.",
    },
    {
      q: "A problem is NP-hard but NOT NP-complete. This means:",
      options: [
        "It is in P",
        "It is in NP but not the hardest",
        "It is at least as hard as NP-complete problems but may not be in NP",
        "It cannot be reduced to any NP-complete problem",
      ],
      answerIndex: 2,
      explanation: "NP-complete = NP-hard ∩ NP. An NP-hard problem not in NP is harder than NP-complete — it cannot even be verified in polynomial time. Examples: the Halting Problem, optimization TSP.",
    },
    {
      q: "To prove problem X is NP-complete, you must:",
      options: [
        "Show X is in P and reduce X to a known NP-complete problem",
        "Show X is in NP and reduce a known NP-complete problem to X",
        "Show X is in NP and reduce X to a known NP-complete problem",
        "Show X is NP-hard only; being in NP is not required",
      ],
      answerIndex: 1,
      explanation: "Two steps: (1) X ∈ NP (verify solutions in poly time). (2) Known NP-complete problem Y ≤_p X (reduce TO X, not FROM X). Direction matters: Y ≤_p X means X is at least as hard as Y.",
    },
    {
      q: "Which problem was the FIRST to be proven NP-complete?",
      options: [
        "Traveling Salesman Problem",
        "Graph Coloring",
        "Boolean Satisfiability (SAT)",
        "Hamiltonian Cycle",
      ],
      answerIndex: 2,
      explanation: "The Cook-Levin theorem (1971) proved SAT NP-complete by showing any NP computation can be encoded as a Boolean formula. All other NP-completeness proofs use reductions from SAT or its descendants.",
    },
  ],
  exercises: [
    "Prove that 3-SAT is NP-complete by reducing SAT to 3-SAT. Hint: any clause with k > 3 literals can be split using auxiliary variables.",
    "Show that the Clique problem (does the graph have a clique of size k?) is NP-complete by reducing from 3-SAT. Construct a graph where vertices represent literal occurrences in clauses.",
    "Prove that Vertex Cover ≤_p Independent Set using the complement relationship. If G has a vertex cover of size k, show G has an independent set of size n-k.",
    "Consider the decision version of the Knapsack problem. Show it is in NP and explain why the O(nW) dynamic programming solution does not prove it is in P (distinguish polynomial from pseudo-polynomial).",
  ],
  flashcards: [
    { front: "What is class P?", back: "The set of decision problems solvable by a deterministic Turing machine in O(n^k) time for some constant k. Informally: problems with efficient (polynomial-time) algorithms." },
    { front: "What is class NP?", back: "The set of decision problems whose 'yes' instances have a certificate (proof) that can be verified in polynomial time. Equivalently, problems solvable in polynomial time by a nondeterministic Turing machine." },
    { front: "What does NP-complete mean?", back: "A problem that is both in NP (verifiable in poly time) and NP-hard (every NP problem reduces to it in poly time). The hardest problems within NP." },
    { front: "What is a polynomial-time reduction A ≤_p B?", back: "A polynomial-time computable function f such that x ∈ A ⟺ f(x) ∈ B. It proves B is at least as hard as A." },
    { front: "What did the Cook-Levin theorem prove?", back: "That SAT (Boolean Satisfiability) is NP-complete — the first problem proven NP-complete. Any NP computation can be encoded as a SAT formula of polynomial size." },
    { front: "What is the key difference between NP-hard and NP-complete?", back: "NP-complete = NP-hard ∩ NP. NP-hard problems may not be in NP (e.g., undecidable problems, optimization problems). NP-complete problems must also be verifiable in polynomial time." },
    { front: "Does 'NP' stand for 'Not Polynomial'?", back: "No. NP stands for Nondeterministic Polynomial time — problems solvable in poly time on a nondeterministic Turing machine. P ⊆ NP, so many NP problems ARE polynomial." },
    { front: "Name 5 classic NP-complete problems.", back: "SAT, 3-SAT, Clique, Vertex Cover, Hamiltonian Cycle, Subset Sum, Graph Coloring (k≥3), Traveling Salesman (decision version), Set Cover, Knapsack (decision version)." },
  ],
  revisionNotes: [
    "P ⊆ NP. The open question is whether P = NP or P ⊊ NP. Most experts believe P ≠ NP.",
    "NP means 'verifiable in polynomial time,' NOT 'not polynomial' or 'exponential.'",
    "To prove NP-completeness: (1) show the problem is in NP, (2) reduce a KNOWN NP-complete problem TO it.",
    "Reduction direction matters: to show X is hard, reduce a known hard problem TO X (Y ≤_p X), not the other way.",
    "Cook-Levin: SAT was the first NP-complete problem. All others are proven NP-complete by reduction chains from SAT.",
    "NP-hard problems are at least as hard as NP-complete but need not be in NP. The Halting Problem is NP-hard but undecidable.",
  ],
  cheatSheet: [
    "P: solvable in poly time. NP: verifiable in poly time. P ⊆ NP.",
    "NP-hard: every NP problem reduces to it. NP-complete: NP-hard + in NP.",
    "Prove NP-complete: (1) show in NP, (2) reduce known NP-complete problem TO it.",
    "Reduction: A ≤_p B means B is at least as hard as A. Direction matters!",
    "Classic chain: SAT → 3-SAT → Clique → Vertex Cover → Ham. Cycle → TSP",
    "Pseudo-polynomial ≠ polynomial: O(nW) for Knapsack is exponential in input BIT length.",
  ],
  resources: [
    { label: "Computers and Intractability by Garey & Johnson", kind: "book", note: "The classic reference on NP-completeness with an extensive catalog of NP-complete problems." },
    { label: "CLRS Chapter 34 — NP-Completeness", kind: "book", note: "Rigorous textbook treatment of P, NP, reductions, and the Cook-Levin theorem." },
    { label: "The P vs NP Problem — Clay Mathematics Institute", kind: "article", note: "Official problem statement for the $1 million Millennium Prize." },
    { label: "MIT 6.046J Lecture on Complexity Theory", kind: "video", note: "Covers P, NP, NP-completeness, and reductions with clear examples." },
    { label: "Scott Aaronson's 'P vs NP' survey", kind: "paper", note: "Accessible yet thorough overview of the P vs NP problem, proof barriers, and related results." },
  ],
  glossary: [
    { term: "Decision problem", definition: "A problem with a yes/no answer. Complexity classes P, NP, etc. are formally defined for decision problems." },
    { term: "P (complexity class)", definition: "The set of decision problems solvable in polynomial time O(n^k) by a deterministic Turing machine." },
    { term: "NP (complexity class)", definition: "The set of decision problems whose 'yes' answers have polynomial-time verifiable certificates. Equivalently, solvable in poly time by a nondeterministic TM." },
    { term: "NP-hard", definition: "A problem to which every NP problem can be reduced in polynomial time. At least as hard as the hardest problems in NP, but not necessarily in NP itself." },
    { term: "NP-complete", definition: "A problem that is both in NP and NP-hard. The hardest problems within NP; a poly-time algorithm for any one implies P = NP." },
    { term: "Polynomial-time reduction (≤_p)", definition: "A mapping from instances of problem A to instances of problem B, computable in poly time, preserving yes/no answers. Used to transfer hardness results." },
    { term: "Certificate (witness)", definition: "A piece of evidence that allows a verifier to confirm a 'yes' answer in polynomial time. For SAT, a satisfying assignment; for Hamiltonian Cycle, the cycle." },
    { term: "Cook-Levin theorem", definition: "The 1971 theorem proving SAT is NP-complete by encoding any polynomial-time verifier as a Boolean formula." },
  ],
};
