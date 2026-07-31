import type { TopicContent } from "../types";

export const booleanLogic: TopicContent = {
  quickSummary: [
    "Boolean algebra operates on two values (0/1, true/false) using fundamental gates: AND, OR, NOT, XOR, NAND, NOR, and XNOR.",
    "De Morgan's laws let you transform expressions: NOT(A AND B) = (NOT A) OR (NOT B), and NOT(A OR B) = (NOT A) AND (NOT B).",
    "Karnaugh maps (K-maps) provide a visual method for simplifying Boolean expressions, grouping adjacent minterms to eliminate variables.",
    "Combinational circuits (adders, multiplexers) produce output purely from current inputs; sequential circuits (flip-flops, counters) also depend on stored state.",
  ],
  detailed: [
    "Boolean algebra, formalized by George Boole in the 1840s and applied to switching circuits by Claude Shannon in 1938, is the mathematical foundation of all digital systems. Every computation a CPU performs ultimately reduces to sequences of Boolean operations on binary signals. The three primitive operations — AND (conjunction), OR (disjunction), and NOT (complement) — are functionally complete, meaning any Boolean function can be expressed using only these three.",
    "Beyond the three primitives, derived gates play critical roles. XOR (exclusive-or) outputs 1 when inputs differ and is essential in parity checking, arithmetic circuits, and cryptography. NAND and NOR are each individually universal — any Boolean function can be built using only NAND gates or only NOR gates. This universality makes NAND the gate of choice in CMOS fabrication because it requires fewer transistors than an equivalent AND-OR implementation.",
    "De Morgan's theorems are the key algebraic identities for manipulating Boolean expressions. The first theorem states that the complement of a product equals the sum of the complements: (A . B)' = A' + B'. The second states that the complement of a sum equals the product of the complements: (A + B)' = A' . B'. These laws are essential for converting between Sum-of-Products (SOP) and Product-of-Sums (POS) forms, for pushing inversions through circuit diagrams (bubble-pushing), and for DeMorgan-based gate substitution during logic synthesis.",
    "Karnaugh maps are a graphical tool for minimizing Boolean functions of up to five or six variables. Cells are arranged so that adjacent cells differ by exactly one variable (Gray code ordering). By grouping 1-cells into the largest possible power-of-two rectangles, you identify prime implicants and eliminate redundant variables. For functions with more variables, the Quine-McCluskey algorithm provides a systematic tabular approach that can be automated.",
    "Combinational circuits like half adders, full adders, multiplexers, decoders, and encoders produce outputs that are strictly a function of current inputs with no memory. Sequential circuits incorporate storage elements — latches, flip-flops — and have outputs that depend on both current inputs and previous state. The distinction is fundamental: combinational circuits implement Boolean functions, while sequential circuits implement finite state machines.",
  ],
  deepDive: [
    "A half adder computes the sum and carry of two single-bit inputs using an XOR gate for the sum and an AND gate for the carry. A full adder extends this to accept a carry-in, chaining together to form a ripple-carry adder for multi-bit addition. The critical path through an n-bit ripple-carry adder is O(n) gate delays because each carry must propagate through all stages. Carry-lookahead adders reduce this to O(log n) by computing carries in parallel using generate (G = A . B) and propagate (P = A XOR B) signals across groups of bits.",
    "Logic minimization beyond K-maps uses the Quine-McCluskey algorithm, which systematically finds all prime implicants by iteratively combining minterms that differ by one variable. A covering problem then selects the minimum set of prime implicants that covers all minterms. This is equivalent to the set cover problem and is NP-hard in general, but heuristic methods like Espresso (developed at UC Berkeley) handle practical circuits efficiently. Modern EDA tools use these algorithms along with technology mapping to optimize circuits for area, delay, and power.",
    "In CMOS technology, NAND and NOR gates are the natural primitives. A 2-input NAND requires 4 transistors (2 PMOS in parallel, 2 NMOS in series), while a 2-input AND requires 6 (a NAND followed by an inverter). This is why real chips are designed as networks of NAND/NOR gates rather than AND/OR/NOT. The De Morgan equivalences allow designers to freely convert between AND-OR-Invert and OR-AND-Invert structures, choosing whichever topology minimizes transistor count and balances signal timing.",
    "Don't-care conditions (denoted X or d in truth tables) arise when certain input combinations are impossible or when the output for those combinations is irrelevant. Exploiting don't-cares during minimization can dramatically reduce circuit complexity because the optimizer is free to assign 0 or 1 to those cells, whichever yields larger K-map groups. In practice, don't-cares come from system constraints (e.g., BCD inputs where values 10-15 never occur) and are specified explicitly in hardware description languages like Verilog and VHDL.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Truth table generation and De Morgan's law verification",
      source: `#include <iostream>
#include <functional>
#include <vector>
#include <string>
#include <cassert>

// Generate a truth table for a Boolean function of n variables
void truth_table(int n_vars, std::function<int(const std::vector<int>&)> func) {
    // Print headers: A, B, C, ...
    for (int i = 0; i < n_vars; ++i) {
        if (i > 0) std::cout << " | ";
        std::cout << static_cast<char>('A' + i);
    }
    std::cout << " | F\\n";
    std::cout << std::string(4 * n_vars + 4, '-') << "\\n";

    // Iterate all combinations of 0/1
    int total = 1 << n_vars;
    for (int mask = 0; mask < total; ++mask) {
        std::vector<int> values(n_vars);
        for (int i = 0; i < n_vars; ++i)
            values[i] = (mask >> (n_vars - 1 - i)) & 1;
        int result = func(values);
        for (int i = 0; i < n_vars; ++i) {
            if (i > 0) std::cout << " | ";
            std::cout << values[i];
        }
        std::cout << " | " << result << "\\n";
    }
}

int main() {
    // De Morgan's first law: NOT(A AND B) == (NOT A) OR (NOT B)
    auto lhs = [](const std::vector<int>& v) { return !(v[0] && v[1]) ? 1 : 0; };
    auto rhs = [](const std::vector<int>& v) { return (!v[0] || !v[1]) ? 1 : 0; };

    std::cout << "De Morgan's first law verification:\\n";
    truth_table(2, lhs);
    std::cout << "\\n";
    truth_table(2, rhs);

    // Verify they are identical for all inputs
    for (int a = 0; a <= 1; ++a)
        for (int b = 0; b <= 1; ++b)
            assert(lhs({a, b}) == rhs({a, b}));

    std::cout << "\\nVerified: NOT(A AND B) == (NOT A) OR (NOT B)\\n";
    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Full adder implementation and ripple-carry adder",
      source: `#include <vector>
#include <iostream>
#include <utility>
#include <algorithm>

// Returns {sum, carry}
std::pair<int, int> half_adder(int a, int b) {
    return {a ^ b, a & b};
}

// Returns {sum, carry_out}
std::pair<int, int> full_adder(int a, int b, int cin) {
    auto [s1, c1] = half_adder(a, b);
    auto [s2, c2] = half_adder(s1, cin);
    return {s2, c1 | c2};
}

// Add two binary numbers (LSB first). Returns result bits (LSB first).
std::vector<int> ripple_carry_add(std::vector<int> a_bits, std::vector<int> b_bits) {
    size_t n = std::max(a_bits.size(), b_bits.size());
    a_bits.resize(n, 0);
    b_bits.resize(n, 0);

    std::vector<int> result;
    int carry = 0;
    for (size_t i = 0; i < n; ++i) {
        auto [s, c] = full_adder(a_bits[i], b_bits[i], carry);
        result.push_back(s);
        carry = c;
    }
    if (carry) result.push_back(carry);
    return result;
}

int main() {
    // Example: 5 (101) + 3 (011) = 8 (1000)
    std::vector<int> a = {1, 0, 1};  // 5 in LSB-first binary
    std::vector<int> b = {1, 1, 0};  // 3 in LSB-first binary
    auto result = ripple_carry_add(a, b);

    int value = 0;
    for (size_t i = 0; i < result.size(); ++i)
        value += result[i] * (1 << i);

    std::cout << "5 + 3 = " << value << "\\n";  // 8
    return 0;
}`,
    },
  ],
  diagrams: [
    {
      title: "Full adder circuit",
      kind: "architecture",
      caption:
        "Internal structure of a full adder built from two half adders and an OR gate, showing the dataflow from inputs A, B, Cin through XOR/AND gates to outputs Sum and Cout.",
    },
    {
      title: "Logic gate hierarchy and universality",
      kind: "mindmap",
      caption:
        "Relationships between logic gates showing how AND, OR, NOT derive from NAND alone, demonstrating NAND universality.",
    },
  ],
  animations: [
    {
      title: "Karnaugh map minimization",
      steps: [
        {
          label: "Write the truth table",
          detail:
            "List all input combinations and their output values. For a 3-variable function F(A,B,C), this gives 8 rows.",
        },
        {
          label: "Fill the K-map grid",
          detail:
            "Place output values into a 2x4 grid (for 3 variables) using Gray code ordering so adjacent cells differ by exactly one variable.",
        },
        {
          label: "Identify groups of 1s",
          detail:
            "Circle the largest possible rectangular groups of 1-cells. Groups must be powers of 2 (1, 2, 4, 8). Groups may wrap around edges.",
        },
        {
          label: "Extract prime implicants",
          detail:
            "For each group, identify which variables remain constant — these form a product term. Variables that change within the group are eliminated.",
        },
        {
          label: "Write the minimized expression",
          detail:
            "OR together all the product terms from step 4 to get the minimized Sum-of-Products expression.",
        },
        {
          label: "Verify against original",
          detail:
            "Check the minimized expression against the truth table to confirm equivalence. Every minterm must still be covered.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Gate", "Symbol", "Expression", "Output = 1 when", "Transistors (CMOS)"],
    rows: [
      ["AND", "A . B", "A AND B", "Both inputs are 1", "6"],
      ["OR", "A + B", "A OR B", "At least one input is 1", "6"],
      ["NOT", "A'", "NOT A", "Input is 0", "2"],
      ["XOR", "A ⊕ B", "A XOR B", "Inputs differ", "8-12"],
      ["NAND", "(A . B)'", "NOT(A AND B)", "At least one input is 0", "4"],
      ["NOR", "(A + B)'", "NOT(A OR B)", "Both inputs are 0", "4"],
      ["XNOR", "(A ⊕ B)'", "NOT(A XOR B)", "Inputs are the same", "8-12"],
    ],
  },
  interviewQA: [
    {
      q: "Why is NAND called a universal gate?",
      a: "NAND is universal because any Boolean function can be implemented using only NAND gates. You can build NOT by connecting both NAND inputs together, AND by following a NAND with a NOT-from-NAND, and OR by applying NOT-from-NAND to each input then combining with NAND. Since AND, OR, and NOT form a functionally complete set, and all three can be derived from NAND, any circuit can be built with NAND alone.",
      followUps: [
        "How many NAND gates do you need to build a 2-input XOR? (4 NAND gates.)",
        "Why is NAND preferred over NOR in CMOS design? (NMOS transistors are faster than PMOS; NAND has NMOS in series and PMOS in parallel, which is faster than NOR's PMOS in series.)",
        "Is {AND, XOR} a functionally complete set? (No — you cannot produce OR or NOT from AND and XOR alone without a constant.)",
      ],
    },
    {
      q: "Explain De Morgan's laws and give a practical use case.",
      a: "De Morgan's first law: (A . B)' = A' + B'. Second law: (A + B)' = A' . B'. They let you convert AND-of-negations to NOR, and OR-of-negations to NAND, which is critical in circuit design. A practical use: when implementing an expression in NAND-only logic, you apply De Morgan's to push bubbles (inversions) through the circuit, converting AND-OR networks into NAND-NAND networks without changing functionality.",
      followUps: [
        "How do De Morgan's laws extend to more than two variables?",
        "What is bubble pushing in circuit diagrams?",
      ],
    },
    {
      q: "What is the difference between a half adder and a full adder?",
      a: "A half adder takes two single-bit inputs and produces a sum (A XOR B) and a carry (A AND B). A full adder adds three single-bit inputs (A, B, and carry-in) and produces a sum and carry-out. The full adder is needed for multi-bit addition because it can chain the carry output of one stage into the carry input of the next.",
      followUps: [
        "What is the propagation delay of an n-bit ripple-carry adder? (O(n) gate delays.)",
        "How does a carry-lookahead adder improve on this? (It computes carries in O(log n) using generate/propagate signals.)",
      ],
    },
    {
      q: "How do you minimize a Boolean function using a Karnaugh map?",
      a: "Fill a K-map grid with the function's output values using Gray code ordering so adjacent cells differ by one variable. Group adjacent 1-cells into the largest power-of-two rectangles possible (groups can wrap around edges). Each group yields a product term containing only the variables that stay constant across the group. OR the product terms together for the minimized SOP expression. Don't-care cells can be included in groups to create larger rectangles.",
      followUps: [
        "What are the limitations of K-maps for functions with more than 5-6 variables?",
        "What algorithm replaces K-maps for larger functions? (Quine-McCluskey or Espresso.)",
      ],
    },
  ],
  followUps: [
    "How do sequential logic circuits (flip-flops, latches) build on combinational Boolean logic?",
    "How does Boolean algebra connect to set theory and predicate logic?",
    "What role does Boolean satisfiability (SAT) play in hardware verification and AI?",
  ],
  mcqs: [
    {
      q: "Which gate is universal (can implement any Boolean function by itself)?",
      options: ["AND", "OR", "XOR", "NAND"],
      answerIndex: 3,
      explanation:
        "NAND is universal — NOT, AND, and OR can all be constructed from NAND gates alone, making any Boolean function realizable with only NAND.",
    },
    {
      q: "According to De Morgan's law, NOT(A OR B) equals:",
      options: [
        "(NOT A) OR (NOT B)",
        "(NOT A) AND (NOT B)",
        "A AND B",
        "NOT A OR B",
      ],
      answerIndex: 1,
      explanation:
        "De Morgan's second law: (A + B)' = A' . B'. The complement of a sum is the product of the complements.",
    },
    {
      q: "A full adder has how many inputs?",
      options: ["1", "2", "3", "4"],
      answerIndex: 2,
      explanation:
        "A full adder accepts three inputs: A, B, and carry-in (Cin). It produces two outputs: sum and carry-out.",
    },
    {
      q: "In a K-map, why are cells ordered using Gray code?",
      options: [
        "To minimize the number of cells needed",
        "To ensure adjacent cells differ by exactly one variable",
        "To make the map easier to draw",
        "To sort outputs in ascending order",
      ],
      answerIndex: 1,
      explanation:
        "Gray code ordering ensures that physically adjacent cells in the K-map differ by only one input variable, which is the property that makes grouping adjacent 1-cells equivalent to algebraic simplification.",
    },
    {
      q: "What does XOR output when both inputs are 1?",
      options: ["1", "0", "Undefined", "Depends on implementation"],
      answerIndex: 1,
      explanation:
        "XOR (exclusive-or) outputs 1 when inputs differ and 0 when inputs are the same. With both inputs equal to 1, the output is 0.",
    },
  ],
  exercises: [
    "Minimize the Boolean function F(A,B,C) = Σm(0,1,2,5,7) using a Karnaugh map. Verify your result by expanding it back and checking against the original minterms.",
    "Build a 2-to-1 multiplexer using only NAND gates. Draw the circuit and verify its truth table.",
    "Implement a 4-bit ripple-carry adder in your language of choice. Test it by adding all pairs of 4-bit numbers (0-15) and comparing against native addition.",
    "Prove De Morgan's laws algebraically starting from the axioms of Boolean algebra (identity, complement, commutative, distributive laws).",
  ],
  flashcards: [
    {
      front: "What are the three fundamental Boolean operations?",
      back: "AND (conjunction, A . B), OR (disjunction, A + B), and NOT (complement, A'). Every Boolean function can be expressed using these three.",
    },
    {
      front: "State De Morgan's two laws.",
      back: "First: (A . B)' = A' + B'. Second: (A + B)' = A' . B'. The complement of a product is the sum of complements; the complement of a sum is the product of complements.",
    },
    {
      front: "Why is NAND preferred in CMOS chip design?",
      back: "NAND requires only 4 transistors in CMOS (vs. 6 for AND), is universal (can implement any function), and has NMOS in series / PMOS in parallel, which is faster than the NOR topology.",
    },
    {
      front: "What is the difference between combinational and sequential circuits?",
      back: "Combinational circuits produce output purely from current inputs (no memory). Sequential circuits have storage elements (flip-flops/latches) so output depends on both current inputs and previous state.",
    },
    {
      front: "What does a K-map group of 4 adjacent 1-cells represent?",
      back: "A product term with two fewer variables than the total. The two variables that change within the group are eliminated from the term.",
    },
    {
      front: "Full adder outputs?",
      back: "Sum = A XOR B XOR Cin. Carry-out = (A AND B) OR (Cin AND (A XOR B)). It produces two output bits from three input bits.",
    },
    {
      front: "What is a don't-care condition in Boolean minimization?",
      back: "An input combination where the output is irrelevant (never occurs or doesn't matter). Denoted X or d, it can be treated as 0 or 1 to create larger K-map groups and simpler expressions.",
    },
    {
      front: "XOR truth table summary?",
      back: "0 XOR 0 = 0, 0 XOR 1 = 1, 1 XOR 0 = 1, 1 XOR 1 = 0. Output is 1 when inputs differ. Also known as modulo-2 addition.",
    },
  ],
  revisionNotes: [
    "AND, OR, NOT are functionally complete. NAND alone and NOR alone are each also functionally complete (universal gates).",
    "De Morgan's: break the bar, change the sign. NOT(AND) becomes OR-of-NOTs; NOT(OR) becomes AND-of-NOTs.",
    "K-map groups must be powers of 2 (1, 2, 4, 8...) and may wrap around map edges. Larger groups mean simpler terms.",
    "Half adder: 2 inputs (A, B), outputs Sum and Carry. Full adder: 3 inputs (A, B, Cin), outputs Sum and Cout.",
    "Ripple-carry adder delay is O(n); carry-lookahead adder reduces to O(log n) using generate and propagate signals.",
    "SOP = Sum of Products (OR of AND terms); POS = Product of Sums (AND of OR terms). K-maps naturally produce SOP forms.",
  ],
  cheatSheet: [
    "AND: A . 0 = 0, A . 1 = A, A . A = A, A . A' = 0",
    "OR: A + 0 = A, A + 1 = 1, A + A = A, A + A' = 1",
    "De Morgan's: (A . B)' = A' + B' and (A + B)' = A' . B'",
    "XOR: A ⊕ B = A'B + AB' (output 1 when inputs differ)",
    "K-map grouping: groups of 2^k cells eliminate k variables from the product term",
    "Full adder: Sum = A ⊕ B ⊕ Cin, Cout = AB + Cin(A ⊕ B)",
  ],
  resources: [
    {
      label: "Digital Design by M. Morris Mano",
      kind: "book",
      note: "Classic textbook covering Boolean algebra, K-maps, combinational and sequential circuit design from fundamentals to advanced topics.",
    },
    {
      label: "Nand2Tetris (nand2tetris.org)",
      kind: "repo",
      note: "Build a complete computer from NAND gates up. Hands-on project that makes Boolean logic tangible.",
    },
    {
      label: "Ben Eater - Building an 8-bit Breadboard Computer",
      kind: "video",
      note: "YouTube series showing physical construction of logic gates, adders, and a CPU on breadboards.",
    },
    {
      label: "Introduction to the Theory of Computation by Michael Sipser",
      kind: "book",
      note: "Covers Boolean circuits in the context of computational complexity (circuit complexity chapter).",
    },
  ],
  glossary: [
    {
      term: "Boolean algebra",
      definition:
        "A branch of algebra where variables take values 0 or 1 and operations are AND, OR, and NOT. The mathematical foundation of digital logic.",
    },
    {
      term: "Universal gate",
      definition:
        "A gate type from which any Boolean function can be constructed. NAND and NOR are each universal gates.",
    },
    {
      term: "Minterm",
      definition:
        "A product term in which every variable appears exactly once (complemented or uncomplemented). Each minterm corresponds to exactly one row of the truth table where the output is 1.",
    },
    {
      term: "Karnaugh map (K-map)",
      definition:
        "A graphical method for simplifying Boolean expressions by grouping adjacent 1-cells in a Gray-code-ordered grid to identify prime implicants.",
    },
    {
      term: "Prime implicant",
      definition:
        "A product term that cannot be combined with any other term to eliminate a variable. Essential prime implicants cover minterms not covered by any other prime implicant.",
    },
    {
      term: "Don't-care condition",
      definition:
        "An input combination for which the output value is unspecified, allowing the optimizer to choose 0 or 1 to produce a simpler circuit.",
    },
    {
      term: "Functional completeness",
      definition:
        "A set of Boolean operations is functionally complete if every Boolean function can be expressed using only operations from that set.",
    },
    {
      term: "Sum of Products (SOP)",
      definition:
        "A Boolean expression written as an OR of AND terms (e.g., AB + A'C). The canonical form produced by K-map minimization.",
    },
  ],
};
