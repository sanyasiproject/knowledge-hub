import type { TopicContent } from "../types";

export const setTheoryLogic: TopicContent = {
  quickSummary: [
    "A set is an unordered collection of distinct elements. Core operations: union (A U B), intersection (A n B), difference (A \\ B), complement (A'), and Cartesian product (A x B).",
    "Propositional logic deals with statements that are true or false, combined with connectives (AND, OR, NOT, IMPLIES, IFF). Predicate logic adds quantifiers (for-all, there-exists) over domains.",
    "Proof techniques — direct proof, proof by contradiction, proof by contrapositive, and mathematical induction — are the fundamental tools for establishing truth in mathematics and CS.",
    "Logical equivalences (De Morgan's laws, distribution, double negation) let you simplify and transform logical expressions, which directly maps to simplifying boolean conditions in code.",
  ],
  detailed: [
    "Sets are defined by their elements: {1, 2, 3} or by a property {x in Z | x > 0}. Two sets are equal iff they have exactly the same elements (axiom of extensionality). The empty set {} is a subset of every set. Key operations: union (elements in either), intersection (elements in both), difference (in A but not B), symmetric difference (in exactly one of A, B), and complement (all elements not in A, relative to a universal set U). The power set P(A) is the set of all subsets of A and has 2^|A| elements.",
    "Propositional logic models compound statements using connectives. A proposition is an atomic true/false statement (p, q, r). Connectives combine them: negation (NOT p), conjunction (p AND q), disjunction (p OR q), implication (p -> q, which is false only when p is true and q is false), and biconditional (p <-> q, true when both have the same truth value). A tautology is always true; a contradiction is always false; a contingency depends on the assignment. Two formulas are logically equivalent if they have the same truth table.",
    "Predicate logic (first-order logic) extends propositional logic with variables, predicates (functions returning boolean), and quantifiers. The universal quantifier (for-all x, P(x)) asserts P holds for every element of the domain. The existential quantifier (there-exists x, P(x)) asserts P holds for at least one element. Negating quantifiers flips them: NOT(for-all x, P(x)) is equivalent to there-exists x, NOT(P(x)). Predicate logic is the formal foundation of mathematical statements, database query semantics (SQL WHERE clauses), and program specifications.",
    "Direct proof establishes 'if P then Q' by assuming P and deriving Q through logical steps. Proof by contrapositive proves 'if NOT Q then NOT P' instead — logically equivalent but sometimes easier. Proof by contradiction assumes the negation of the statement and derives a logical impossibility. Mathematical induction proves statements about natural numbers: prove the base case P(0), then prove that P(k) implies P(k+1). Strong induction assumes P(j) for all j <= k. Structural induction generalises this to recursively defined structures like trees and lists.",
    "De Morgan's laws — NOT(A AND B) = (NOT A) OR (NOT B) and NOT(A OR B) = (NOT A) AND (NOT B) — are essential for simplifying code conditions. Distribution laws, absorption, idempotence, and double negation round out the key equivalences. In set theory, De Morgan's laws become (A U B)' = A' n B' and (A n B)' = A' U B'. These equivalences are the basis of boolean algebra, which underpins digital circuit design and query optimisation in databases.",
  ],
  deepDive: [
    "The relationship between sets and logic is deep and formal. Set membership (x in A) is a predicate; set operations correspond to logical connectives (union <-> OR, intersection <-> AND, complement <-> NOT). The characteristic function of a set maps each element to 0 or 1, making set operations equivalent to bitwise operations — this is exactly how bit sets, bloom filters, and permission bitmasks work in systems programming.",
    "Proof by induction has profound applications in computer science. Proving algorithm correctness often requires a loop invariant (an inductive property maintained by each iteration) or structural induction over a recursive data type. For example, proving that merge sort produces a sorted list requires structural induction: the base case is a one-element list (trivially sorted), and the inductive step shows that merging two sorted sublists produces a sorted list. Induction is also the foundation of recursive definitions and the principle behind program verification tools.",
    "First-order logic is semi-decidable: if a formula is valid (a tautology), a proof search will eventually find a proof, but if it is not valid, the search may run forever. Propositional logic, by contrast, is decidable (check the truth table) but co-NP-complete (the tautology problem) and the satisfiability problem (SAT) is NP-complete — the first problem proven NP-complete by Cook's theorem. Modern SAT solvers (DPLL, CDCL algorithms) are practical tools used in hardware verification, package dependency resolution, and automated theorem proving.",
    "Zermelo-Fraenkel set theory with the Axiom of Choice (ZFC) is the standard foundation of mathematics. Key axioms include extensionality (sets are determined by elements), pairing, union, power set, infinity (an infinite set exists), separation (subsets defined by properties), and replacement. Russell's paradox — 'the set of all sets that don't contain themselves' — showed naive set theory is inconsistent and motivated the axiomatic approach. ZFC avoids the paradox by restricting set formation. The Axiom of Choice, equivalent to Zorn's lemma and the well-ordering theorem, is used pervasively but has counterintuitive consequences (Banach-Tarski paradox).",
  ],
  code: [
    {
      language: "cpp",
      caption: "Set operations and verification of De Morgan's laws",
      source: `#include <set>
#include <algorithm>
#include <iostream>
#include <iterator>
#include <cassert>
#include <cmath>

// Helper to print a set
void print_set(const std::string& label, const std::set<int>& s) {
    std::cout << label;
    for (int x : s) std::cout << x << " ";
    std::cout << std::endl;
}

int main() {
    std::set<int> A = {1, 2, 3, 4, 5};
    std::set<int> B = {4, 5, 6, 7, 8};
    std::set<int> U;
    for (int i = 1; i <= 10; ++i) U.insert(i); // Universal set {1..10}

    // Core operations using <algorithm>
    std::set<int> union_ab, inter_ab, diff_ab, sym_diff, comp_a;
    std::set_union(A.begin(), A.end(), B.begin(), B.end(),
                   std::inserter(union_ab, union_ab.begin()));
    std::set_intersection(A.begin(), A.end(), B.begin(), B.end(),
                          std::inserter(inter_ab, inter_ab.begin()));
    std::set_difference(A.begin(), A.end(), B.begin(), B.end(),
                        std::inserter(diff_ab, diff_ab.begin()));
    std::set_symmetric_difference(A.begin(), A.end(), B.begin(), B.end(),
                                  std::inserter(sym_diff, sym_diff.begin()));
    std::set_difference(U.begin(), U.end(), A.begin(), A.end(),
                        std::inserter(comp_a, comp_a.begin()));

    print_set("Union:        ", union_ab);    // {1,2,3,4,5,6,7,8}
    print_set("Intersection: ", inter_ab);    // {4,5}
    print_set("Difference:   ", diff_ab);     // {1,2,3}
    print_set("Sym. Diff:    ", sym_diff);    // {1,2,3,6,7,8}
    print_set("Complement:   ", comp_a);      // {6,7,8,9,10}
    std::cout << "Power set size: " << (1 << A.size()) << std::endl; // 32

    // Verify De Morgan's laws
    auto complement = [&U](const std::set<int>& S) {
        std::set<int> result;
        std::set_difference(U.begin(), U.end(), S.begin(), S.end(),
                            std::inserter(result, result.begin()));
        return result;
    };
    auto set_intersect = [](const std::set<int>& X, const std::set<int>& Y) {
        std::set<int> r;
        std::set_intersection(X.begin(), X.end(), Y.begin(), Y.end(),
                              std::inserter(r, r.begin()));
        return r;
    };
    auto set_union_fn = [](const std::set<int>& X, const std::set<int>& Y) {
        std::set<int> r;
        std::set_union(X.begin(), X.end(), Y.begin(), Y.end(),
                       std::inserter(r, r.begin()));
        return r;
    };

    assert(complement(union_ab) == set_intersect(complement(A), complement(B)));
    assert(complement(inter_ab) == set_union_fn(complement(A), complement(B)));
    std::cout << "De Morgan's laws verified!" << std::endl;

    // Subset and superset
    std::set<int> C = {1, 2};
    std::cout << "C subset of A? "
              << std::boolalpha << std::includes(A.begin(), A.end(),
                                                  C.begin(), C.end())
              << std::endl; // true
    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Truth table generator for propositional logic",
      source: `#include <iostream>
#include <iomanip>
#include <string>
#include <vector>
#include <functional>

using Expr = std::function<bool(bool, bool)>;

void truth_table(const std::string& label, Expr expr) {
    std::cout << std::setw(8) << "p" << " | "
              << std::setw(8) << "q" << " | "
              << std::setw(20) << label << std::endl;
    std::cout << std::string(44, '-') << std::endl;

    for (int p = 0; p <= 1; ++p) {
        for (int q = 0; q <= 1; ++q) {
            bool result = expr(p, q);
            std::cout << std::setw(8) << std::boolalpha << (bool)p << " | "
                      << std::setw(8) << (bool)q << " | "
                      << std::setw(20) << result << std::endl;
        }
    }
}

int main() {
    // Verify De Morgan's law: !(p && q) == (!p || !q)
    std::cout << "De Morgan's Law: !(p && q) vs (!p || !q)" << std::endl;
    std::cout << std::endl;
    truth_table("!(p && q)", [](bool p, bool q) { return !(p && q); });
    std::cout << std::endl;
    truth_table("(!p || !q)", [](bool p, bool q) { return (!p || !q); });
    std::cout << std::endl;

    // Verify implication equivalence: (p -> q) == (!p || q)
    std::cout << "Implication: (!p || q) -- equivalent to p -> q" << std::endl;
    truth_table("(!p || q)", [](bool p, bool q) { return (!p || q); });

    return 0;
}`,
    },
  ],
  diagrams: [
    {
      title: "Set Operations Venn Diagram",
      kind: "architecture",
      caption:
        "Visual representation of union, intersection, difference, symmetric difference, and complement using overlapping circles within a universal set.",
    },
    {
      title: "Proof Technique Decision Flowchart",
      kind: "flow",
      caption:
        "Decision tree for choosing the right proof technique: direct proof, contrapositive, contradiction, or induction based on the statement's structure.",
    },
  ],
  animations: [
    {
      title: "Proof by mathematical induction",
      steps: [
        {
          label: "State the property P(n)",
          detail:
            "Clearly define the property you want to prove holds for all natural numbers n >= n0. Example: P(n) = 'the sum 1 + 2 + ... + n equals n(n+1)/2'.",
        },
        {
          label: "Prove the base case P(n0)",
          detail:
            "Verify the property for the smallest value. P(1): 1 = 1(2)/2 = 1. The base case holds.",
        },
        {
          label: "State the inductive hypothesis",
          detail:
            "Assume P(k) is true for some arbitrary k >= n0. This assumption is 'the inductive hypothesis': 1 + 2 + ... + k = k(k+1)/2.",
        },
        {
          label: "Prove the inductive step P(k) => P(k+1)",
          detail:
            "Show that P(k+1) follows: 1 + 2 + ... + k + (k+1) = k(k+1)/2 + (k+1) = (k+1)(k+2)/2. This matches the formula for n = k+1.",
        },
        {
          label: "Conclude by induction",
          detail:
            "By the principle of mathematical induction, P(n) holds for all n >= 1. The base case anchors the chain, and the inductive step extends it to every subsequent natural number.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Proof Technique",
      "When to Use",
      "Structure",
      "Example Statement",
    ],
    rows: [
      [
        "Direct proof",
        "When P -> Q can be shown by straightforward derivation",
        "Assume P, derive Q",
        "'If n is even, then n^2 is even'",
      ],
      [
        "Contrapositive",
        "When NOT Q -> NOT P is easier than P -> Q",
        "Assume NOT Q, derive NOT P",
        "'If n^2 is odd, then n is odd'",
      ],
      [
        "Contradiction",
        "When assuming the negation leads to an impossibility",
        "Assume NOT(statement), derive a contradiction",
        "'sqrt(2) is irrational'",
      ],
      [
        "Mathematical induction",
        "Statements about all natural numbers n >= n0",
        "Base case + inductive step P(k) -> P(k+1)",
        "'Sum of first n integers is n(n+1)/2'",
      ],
      [
        "Strong induction",
        "When P(k+1) depends on multiple earlier cases",
        "Base case + assume P(j) for all j <= k",
        "'Every integer >= 2 has a prime factorisation'",
      ],
    ],
  },
  interviewQA: [
    {
      q: "What is De Morgan's law and how does it apply to programming?",
      a: "De Morgan's laws state: NOT(A AND B) = (NOT A) OR (NOT B), and NOT(A OR B) = (NOT A) AND (NOT B). In programming, they are used to simplify boolean conditions. For example, 'if not (user.isAdmin and user.isActive)' is equivalent to 'if (not user.isAdmin or not user.isActive)'. They also apply to set operations (complement of union = intersection of complements) and are used in query optimisation and circuit simplification.",
      followUps: [
        "How do De Morgan's laws apply to SQL WHERE clauses?",
        "Can you extend De Morgan's to quantifiers in predicate logic?",
      ],
    },
    {
      q: "Explain proof by contradiction with a concrete example.",
      a: "To prove sqrt(2) is irrational, assume the opposite: sqrt(2) = a/b where a, b are integers with no common factors. Then 2 = a^2/b^2, so a^2 = 2b^2. This means a^2 is even, so a is even (say a = 2k). Then 4k^2 = 2b^2, so b^2 = 2k^2, meaning b is also even. But a and b are both even, contradicting our assumption they share no common factor. Therefore sqrt(2) is irrational.",
      followUps: [
        "How is proof by contradiction different from proof by contrapositive?",
        "When should you prefer contradiction over direct proof?",
      ],
    },
    {
      q: "What is the difference between propositional and predicate logic?",
      a: "Propositional logic deals with atomic true/false propositions combined by connectives (AND, OR, NOT, IMPLIES). It cannot express statements about elements of a set. Predicate logic adds variables, predicates (boolean functions), and quantifiers (for-all, there-exists). For example, 'every student passed' requires predicate logic: for-all x, Student(x) -> Passed(x). Propositional logic can only say 'p AND q AND r' for individual named propositions.",
      followUps: [
        "Is propositional satisfiability decidable? What about first-order validity?",
        "How does predicate logic relate to SQL queries?",
      ],
    },
    {
      q: "What is the power set and why does it matter in CS?",
      a: "The power set P(A) of a set A is the set of all subsets of A, including the empty set and A itself. It has 2^|A| elements. This matters in CS because many problems involve searching over all subsets (e.g., the knapsack problem, feature selection, or test case combinations). The exponential size of the power set is why brute-force subset enumeration is O(2^n) and why we need dynamic programming or greedy approximations for subset-optimisation problems.",
      followUps: [
        "How is the power set related to binary numbers?",
        "What is Cantor's theorem about power sets?",
      ],
    },
  ],
  followUps: [
    "How do Boolean algebras generalise propositional logic and set theory?",
    "What is the Curry-Howard correspondence between proofs and programs?",
    "How are SAT solvers used in practical software engineering (package managers, hardware verification)?",
    "What role does first-order logic play in database query languages and program verification?",
  ],
  mcqs: [
    {
      q: "What is the negation of 'for-all x, P(x)' in predicate logic?",
      options: [
        "for-all x, NOT P(x)",
        "there-exists x, NOT P(x)",
        "NOT(there-exists x, P(x))",
        "there-exists x, P(x)",
      ],
      answerIndex: 1,
      explanation:
        "Negating a universal quantifier produces an existential: NOT(for-all x, P(x)) = there-exists x, NOT P(x). It is not the case that P holds for everything iff there exists a counterexample.",
    },
    {
      q: "The implication p -> q is false when:",
      options: [
        "p is false and q is false",
        "p is true and q is true",
        "p is true and q is false",
        "p is false and q is true",
      ],
      answerIndex: 2,
      explanation:
        "An implication is only false when the hypothesis (p) is true but the conclusion (q) is false. In all other cases — including when p is false — the implication is vacuously true.",
    },
    {
      q: "How many elements does the power set of {a, b, c} have?",
      options: ["3", "6", "8", "9"],
      answerIndex: 2,
      explanation:
        "|P(A)| = 2^|A| = 2^3 = 8. The subsets are: {}, {a}, {b}, {c}, {a,b}, {a,c}, {b,c}, {a,b,c}.",
    },
    {
      q: "Which proof technique assumes the statement is false and derives a logical impossibility?",
      options: [
        "Direct proof",
        "Proof by contrapositive",
        "Proof by contradiction",
        "Proof by induction",
      ],
      answerIndex: 2,
      explanation:
        "Proof by contradiction assumes NOT(statement) and derives a contradiction (e.g., both X and NOT X). Since the assumption leads to an impossibility, the original statement must be true.",
    },
    {
      q: "Which of the following is a tautology?",
      options: [
        "p AND NOT p",
        "p OR NOT p",
        "p -> NOT p",
        "p AND q",
      ],
      answerIndex: 1,
      explanation:
        "p OR NOT p is always true regardless of the truth value of p — this is the law of the excluded middle. p AND NOT p is a contradiction. The others depend on the values of p and q.",
    },
  ],
  exercises: [
    "Prove by induction that the sum 1 + 3 + 5 + ... + (2n-1) = n^2 for all positive integers n.",
    "Using De Morgan's laws, simplify the boolean expression: NOT(NOT(a AND b) OR (c AND NOT d)). Show each transformation step.",
    "Prove by contradiction that there are infinitely many prime numbers (Euclid's proof).",
    "Given sets A = {1,2,3,4}, B = {3,4,5,6}, and U = {1,...,8}, compute: A U B, A n B, A \\ B, A ^ B (symmetric difference), complement of A, and P(A n B).",
  ],
  flashcards: [
    {
      front: "De Morgan's laws (logic form)",
      back: "NOT(p AND q) = (NOT p) OR (NOT q). NOT(p OR q) = (NOT p) AND (NOT q). Swap AND/OR when moving NOT inward.",
    },
    {
      front: "De Morgan's laws (set form)",
      back: "(A U B)' = A' n B'. (A n B)' = A' U B'. Complement distributes by swapping union and intersection.",
    },
    {
      front: "When is p -> q false?",
      back: "Only when p is true and q is false. If p is false, the implication is vacuously true regardless of q.",
    },
    {
      front: "Size of the power set P(A)",
      back: "|P(A)| = 2^|A|. Each element is independently included or excluded, giving 2 choices per element.",
    },
    {
      front: "Proof by contrapositive",
      back: "To prove p -> q, instead prove NOT q -> NOT p. These are logically equivalent. Useful when NOT q gives a concrete starting point.",
    },
    {
      front: "Mathematical induction structure",
      back: "1. Base case: prove P(n0). 2. Inductive step: assume P(k) (inductive hypothesis), prove P(k+1). Conclusion: P(n) holds for all n >= n0.",
    },
    {
      front: "Negating quantifiers",
      back: "NOT(for-all x, P(x)) = there-exists x, NOT P(x). NOT(there-exists x, P(x)) = for-all x, NOT P(x). Quantifiers flip, predicate gets negated.",
    },
    {
      front: "Tautology vs contradiction vs contingency",
      back: "Tautology: always true (p OR NOT p). Contradiction: always false (p AND NOT p). Contingency: truth depends on variable values (p AND q).",
    },
  ],
  revisionNotes: [
    "Sets: A U B (union), A n B (intersection), A \\ B (difference), A ^ B (symmetric diff), A' (complement), P(A) (power set, 2^|A| elements).",
    "Implication p -> q is equivalent to NOT p OR q. It is only false when p is true and q is false. Contrapositive (NOT q -> NOT p) is equivalent; converse (q -> p) is NOT.",
    "De Morgan's: push NOT inward by flipping AND/OR (logic) or union/intersection (sets). Essential for simplifying conditionals and queries.",
    "Induction: base case anchors, inductive step extends. Strong induction assumes all P(j) for j <= k. Structural induction works on trees, lists, formulas.",
    "Predicate logic: for-all (universal) and there-exists (existential). Negation flips the quantifier and negates the predicate.",
  ],
  cheatSheet: [
    "Union: A U B = {x | x in A OR x in B}. Intersection: A n B = {x | x in A AND x in B}.",
    "p -> q is false ONLY when p=T, q=F. Equivalent to NOT p OR q. Contrapositive: NOT q -> NOT p.",
    "De Morgan: NOT(p AND q) = NOT p OR NOT q. NOT(p OR q) = NOT p AND NOT q. Same for sets with U and n.",
    "Power set |P(A)| = 2^|A|. Cartesian product |A x B| = |A| * |B|.",
    "Induction: 1) Base case. 2) Assume P(k). 3) Prove P(k+1). Strong induction assumes P(j) for all j <= k.",
    "Quantifier negation: NOT(for-all) = there-exists NOT. NOT(there-exists) = for-all NOT.",
  ],
  resources: [
    {
      label: "Discrete Mathematics and Its Applications (Rosen)",
      kind: "book",
      note: "Standard undergraduate textbook covering sets, logic, proofs, and their applications in computer science.",
    },
    {
      label: "How to Prove It (Velleman)",
      kind: "book",
      note: "Structured introduction to proof techniques with exercises progressing from propositional logic to set theory to induction.",
    },
    {
      label: "MIT OCW 6.042J Mathematics for Computer Science",
      kind: "video",
      note: "Full lecture series covering logic, proofs, sets, and discrete structures with CS-oriented examples.",
    },
    {
      label: "The Book of Proof (Hammack)",
      kind: "book",
      note: "Free online textbook on proof writing covering logic, sets, functions, and cardinality.",
    },
    {
      label: "Brilliant.org — Logic and Sets courses",
      kind: "article",
      note: "Interactive courses with visual problems on propositional logic, set theory, and proof methods.",
    },
  ],
  glossary: [
    {
      term: "Set",
      definition:
        "An unordered collection of distinct elements, defined by membership. Two sets are equal iff they have exactly the same elements.",
    },
    {
      term: "Power Set",
      definition:
        "The set of all subsets of a given set A, denoted P(A). Contains 2^|A| elements.",
    },
    {
      term: "Tautology",
      definition:
        "A propositional formula that is true under every possible truth assignment (e.g., p OR NOT p).",
    },
    {
      term: "Predicate",
      definition:
        "A function from a domain to {true, false}. Example: Even(x) is true iff x is even.",
    },
    {
      term: "Universal Quantifier",
      definition:
        "for-all (upside-down A). 'For-all x, P(x)' asserts that P(x) holds for every element x in the domain.",
    },
    {
      term: "Existential Quantifier",
      definition:
        "there-exists (backwards E). 'There-exists x, P(x)' asserts that P(x) holds for at least one element x in the domain.",
    },
    {
      term: "Logical Equivalence",
      definition:
        "Two formulas are logically equivalent if they have the same truth value under every assignment. Denoted with a triple-bar or double-arrow (<->).",
    },
    {
      term: "Mathematical Induction",
      definition:
        "A proof technique for establishing statements for all natural numbers: prove a base case and an inductive step showing P(k) implies P(k+1).",
    },
  ],
};
