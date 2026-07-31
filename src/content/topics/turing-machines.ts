import type { TopicContent } from "../types";

export const turingMachines: TopicContent = {
  quickSummary: [
    "A Turing machine is a theoretical model of computation: a finite-state control reads/writes symbols on an infinite tape and moves left or right one cell per step.",
    "The Church-Turing thesis asserts that any effectively computable function can be computed by a Turing machine — it defines the boundary of what algorithms can do.",
    "The Halting Problem proves that no algorithm can decide, for every program-input pair, whether that program halts — establishing that some problems are undecidable.",
    "Rice's theorem generalises: every non-trivial semantic property of programs is undecidable, so you can never build a perfect bug-finder, optimiser, or equivalence checker.",
  ],
  detailed: [
    "A Turing machine (TM) consists of a finite set of states, an input alphabet, a tape alphabet (which includes a blank symbol), a transition function delta(q, a) -> (q', b, D) mapping a state-symbol pair to a new state, a symbol to write, and a direction to move, plus designated start, accept, and reject states. Despite its simplicity, this model captures everything a real computer can compute (ignoring resource limits).",
    "The Church-Turing thesis — independently proposed by Alonzo Church (via lambda calculus) and Alan Turing (via his machine model) in 1936 — states that any function computable by an effective procedure is Turing-computable. This is a thesis, not a theorem: it cannot be proved because 'effective procedure' is an informal concept, but no counterexample has ever been found and every alternative model (lambda calculus, Post systems, register machines, cellular automata) has been shown equivalent.",
    "A Universal Turing Machine (UTM) takes as input the description of any other TM plus its input, and simulates it step by step. This is the theoretical foundation of stored-program computers: one machine can run any program. The existence of UTMs also enables the diagonalisation argument used to prove undecidability.",
    "The Halting Problem asks: given a TM M and input w, does M eventually halt? Turing proved this undecidable by contradiction — assume a halting decider H exists, build a machine D that feeds its own description to H and does the opposite of what H predicts, producing a contradiction. This was the first concrete example of a well-defined problem that no algorithm can solve.",
    "Decidability classifies languages: a decidable (recursive) language has a TM that always halts and correctly accepts or rejects; a recognisable (recursively enumerable) language has a TM that halts and accepts on members but may loop forever on non-members. The halting problem is recognisable but not decidable. Rice's theorem shows that any property about the language recognised by a TM (beyond trivially true or trivially false) is undecidable, which means static analysis is inherently limited.",
  ],
  deepDive: [
    "Reducibility is the primary technique for proving new problems undecidable. A reduction from problem A to problem B transforms instances of A into instances of B such that a solver for B would solve A. If A is known to be undecidable, B must be too. Many-one (mapping) reductions are the simplest form; Turing reductions allow oracle calls. For example, to prove the language-emptiness problem undecidable, you reduce from the halting problem: given (M, w), construct a TM M' that ignores its own input and simulates M on w — M' accepts something iff M halts on w.",
    "The arithmetical hierarchy stratifies undecidable problems by the number of alternating quantifiers needed to define them. The halting problem sits at Sigma_1 (one existential quantifier: 'there exists a halting computation'). Its complement — the set of non-halting pairs — is Pi_1. Problems higher in the hierarchy, like totality ('does M halt on every input?'), are strictly harder. This gives a rigorous landscape of degrees of unsolvability.",
    "Turing completeness has practical implications for software engineers. Any language that supports conditionals, arbitrary loops, and unbounded memory is Turing-complete and therefore subject to the halting problem. This is why compilers cannot detect all infinite loops, why type-checkers must be conservative or allow unsoundness, and why linters produce false positives. Conversely, deliberately restricting a language (total functional languages, SQL without recursive CTEs, regular expressions without back-references) can make important properties decidable.",
    "Non-deterministic Turing machines (NTMs) can branch into multiple computation paths simultaneously. An NTM accepts if any path accepts. While NTMs are no more powerful than deterministic TMs in terms of what they can compute, the simulation may require exponential slowdown — this is precisely the P vs NP question, the most famous open problem in computer science.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Simple Turing machine simulator",
      source: `#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <tuple>
#include <stdexcept>

struct Transition {
    std::string new_state;
    char write;
    char direction;  // 'L' or 'R'
};

class TuringMachine {
    std::map<std::pair<std::string, char>, Transition> transitions;
    std::string start, accept, reject;
    char blank;

public:
    TuringMachine(
        const std::map<std::pair<std::string, char>, Transition>& trans,
        const std::string& start, const std::string& accept,
        const std::string& reject, char blank = '_')
        : transitions(trans), start(start), accept(accept),
          reject(reject), blank(blank) {}

    bool run(const std::string& input_str, int max_steps = 10000) {
        std::vector<char> tape(input_str.begin(), input_str.end());
        if (tape.empty()) tape.push_back(blank);
        int head = 0;
        std::string state = start;

        for (int step = 0; step < max_steps; ++step) {
            if (state == accept) return true;
            if (state == reject) return false;

            // Expand tape if needed
            while (head >= static_cast<int>(tape.size())) tape.push_back(blank);
            while (head < 0) { tape.insert(tape.begin(), blank); ++head; }

            char sym = tape[head];
            auto key = std::make_pair(state, sym);
            if (transitions.find(key) == transitions.end())
                return false;  // implicit reject

            const auto& t = transitions[key];
            tape[head] = t.write;
            head += (t.direction == 'R') ? 1 : -1;
            state = t.new_state;
        }
        throw std::runtime_error("Exceeded max steps (possible infinite loop)");
    }
};

int main() {
    // TM that accepts strings of the form 0^n 1^n
    std::map<std::pair<std::string, char>, Transition> transitions = {
        {{"q0", '0'}, {"q1", 'X', 'R'}},   // mark a 0
        {{"q1", '0'}, {"q1", '0', 'R'}},   // skip remaining 0s
        {{"q1", 'Y'}, {"q1", 'Y', 'R'}},   // skip marked 1s
        {{"q1", '1'}, {"q2", 'Y', 'L'}},   // mark a matching 1
        {{"q2", 'Y'}, {"q2", 'Y', 'L'}},   // move left past Ys
        {{"q2", '0'}, {"q2", '0', 'L'}},   // move left past 0s
        {{"q2", 'X'}, {"q0", 'X', 'R'}},   // back to start
        {{"q0", 'Y'}, {"q3", 'Y', 'R'}},   // no more 0s
        {{"q3", 'Y'}, {"q3", 'Y', 'R'}},
        {{"q3", '_'}, {"qA", '_', 'R'}},   // all matched -> accept
    };

    TuringMachine tm(transitions, "q0", "qA", "qR");
    std::cout << std::boolalpha;
    std::cout << tm.run("000111") << "\\n";  // true
    std::cout << tm.run("0011") << "\\n";    // true
    std::cout << tm.run("00111") << "\\n";   // false
}`,
    },
    {
      language: "cpp",
      caption: "Demonstrating the halting problem via diagonalisation",
      source: `#include <stdexcept>
#include <string>

// This illustrates WHY a universal halting decider cannot exist.
// Suppose halts(program, input) -> bool existed. Then:

using Program = std::string;

bool halts(const Program& program, const Program& input_data) {
    // Hypothetical oracle -- cannot actually exist
    throw std::logic_error("Undecidable!");
}

void diagonal(const Program& program) {
    // If we could decide halting, this creates a contradiction
    if (halts(program, program)) {
        while (true) {}  // loop forever if program halts on itself
    } else {
        return;  // halt if program doesn't halt on itself
    }
}

// diagonal(diagonal) => contradiction:
//   If diagonal halts on itself, halts returns true, so it loops -- contradiction.
//   If diagonal loops on itself, halts returns false, so it halts -- contradiction.
// Therefore halts() cannot exist.`,
    },
  ],
  diagrams: [
    {
      title: "Turing Machine Architecture",
      kind: "architecture",
      caption:
        "Infinite tape with read/write head, finite-state control, and transition function — the core components of a Turing machine.",
    },
    {
      title: "Decidability Hierarchy",
      kind: "mindmap",
      caption:
        "Relationships between decidable, recognisable (r.e.), co-recognisable, and unrecognisable languages, with example problems at each level.",
    },
  ],
  animations: [
    {
      title: "TM accepting the string '0011' (0^n1^n language)",
      steps: [
        {
          label: "Mark first 0",
          detail:
            "Head is at position 0, state q0. Reads '0', writes 'X', moves right to q1. Tape: X011.",
        },
        {
          label: "Scan right to first unmarked 1",
          detail:
            "In state q1, skip over remaining 0s. Head reaches the first '1', writes 'Y', moves left to q2. Tape: X01Y.",
        },
        {
          label: "Return left to next unmarked 0",
          detail:
            "In state q2, move left past 0s and Ys until reaching 'X'. Transition to q0, move right. Head is now on the second '0'.",
        },
        {
          label: "Mark second 0 and match second 1",
          detail:
            "Read '0', write 'X', scan right past Y to find the remaining '1'. Write 'Y'. Tape: XX YY.",
        },
        {
          label: "Verify no unmatched symbols remain",
          detail:
            "Return to leftmost unmarked position. State q0 reads 'Y' (no more 0s), transitions to q3, scans right to confirm only Ys and blank remain.",
        },
        {
          label: "Accept",
          detail:
            "State q3 reaches the blank symbol and transitions to accept state qA. The string '0011' is in the language 0^n1^n.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Property",
      "Finite Automaton (DFA/NFA)",
      "Pushdown Automaton (PDA)",
      "Turing Machine (TM)",
    ],
    rows: [
      [
        "Memory",
        "None (states only)",
        "One stack (LIFO)",
        "Infinite read/write tape",
      ],
      [
        "Languages recognised",
        "Regular (a*b*)",
        "Context-free (a^n b^n)",
        "Recursively enumerable",
      ],
      [
        "Head movement",
        "Left to right only",
        "Left to right only",
        "Left and right",
      ],
      [
        "Determinism vs non-det power",
        "NFA = DFA (same languages)",
        "NPDA > DPDA",
        "NTM = DTM (same languages)",
      ],
      [
        "Decidability of emptiness",
        "Decidable",
        "Decidable",
        "Undecidable",
      ],
      [
        "Closed under complement",
        "Yes",
        "No",
        "Decidable: yes; R.E.: no",
      ],
    ],
  },
  interviewQA: [
    {
      q: "What is the Halting Problem, and why does it matter for software engineering?",
      a: "The Halting Problem asks whether a given program halts on a given input. Turing proved no algorithm can solve this for all program-input pairs. For engineers, this means perfect static analysis is impossible — no tool can detect all infinite loops, deadlocks, or bugs. Compilers, linters, and verifiers must be conservative (may report false positives) or incomplete (may miss real issues).",
      followUps: [
        "Can you sketch the diagonalisation proof?",
        "Give a real-world example where undecidability limits tooling.",
        "What is the difference between undecidable and intractable?",
      ],
    },
    {
      q: "Explain Rice's theorem in plain language.",
      a: "Rice's theorem states that any non-trivial property about what a program computes (its semantic behaviour) is undecidable. 'Non-trivial' means some programs have the property and some don't. So you cannot write an algorithm that perfectly decides, for example, whether a program always returns positive numbers, whether two programs are equivalent, or whether a program is malware based on its behaviour alone.",
      followUps: [
        "Does Rice's theorem apply to syntactic properties like 'has more than 100 lines'?",
        "How do real-world anti-virus tools work despite Rice's theorem?",
      ],
    },
    {
      q: "What makes a system Turing-complete, and why should engineers care?",
      a: "A system is Turing-complete if it can simulate any Turing machine — practically, it needs conditionals, loops (or recursion), and unbounded memory. Engineers should care because Turing-complete languages inherit all undecidability results: you cannot fully analyse them. Deliberately using sub-Turing languages (like SQL, regexes, or total type systems) can make verification decidable and programs safer.",
      followUps: [
        "Is HTML Turing-complete? What about CSS + HTML?",
        "Name a system that is intentionally not Turing-complete and explain why.",
      ],
    },
    {
      q: "What is the difference between decidable and recognisable (recursively enumerable)?",
      a: "A decidable language has a Turing machine that always halts — it says 'yes' for members and 'no' for non-members. A recognisable (r.e.) language has a TM that halts and accepts members, but may loop forever on non-members. The halting problem is recognisable but not decidable. A language is decidable iff both it and its complement are recognisable.",
      followUps: [
        "Give an example of a language that is not even recognisable.",
        "How does co-recognisability relate to decidability?",
      ],
    },
  ],
  followUps: [
    "How do multi-tape and non-deterministic Turing machines compare to the standard model?",
    "What is the connection between Turing machines and the Chomsky hierarchy of formal languages?",
    "How does Goedel's incompleteness theorem relate to undecidability?",
    "What are practical examples of undecidable problems that affect day-to-day programming?",
  ],
  mcqs: [
    {
      q: "Which of the following problems is decidable?",
      options: [
        "Does a given Turing machine halt on a given input?",
        "Does a given DFA accept at least one string?",
        "Do two given Turing machines recognise the same language?",
        "Does a given Turing machine accept every input?",
      ],
      answerIndex: 1,
      explanation:
        "DFA emptiness is decidable — you can check reachability of accept states. All the others involve Turing machines and are undecidable (halting problem, equivalence, totality).",
    },
    {
      q: "The Church-Turing thesis states that:",
      options: [
        "Turing machines are faster than all other models of computation",
        "Every effectively computable function is computable by a Turing machine",
        "Non-deterministic TMs are strictly more powerful than deterministic TMs",
        "The halting problem is undecidable",
      ],
      answerIndex: 1,
      explanation:
        "The thesis equates the informal notion of 'effectively computable' with formal Turing-computability. It says nothing about speed, and NTMs compute the same class of functions as DTMs.",
    },
    {
      q: "Rice's theorem applies to which kind of property?",
      options: [
        "Any syntactic property of a program's source code",
        "Any non-trivial semantic property of the language recognised by a TM",
        "Only the halting property",
        "Properties of finite automata",
      ],
      answerIndex: 1,
      explanation:
        "Rice's theorem covers non-trivial semantic (behavioural) properties of TMs. Syntactic properties (e.g., number of states) are generally decidable. It does not apply to finite automata, whose properties are typically decidable.",
    },
    {
      q: "A language L is decidable if and only if:",
      options: [
        "There exists a TM that recognises L",
        "L is finite",
        "Both L and its complement are recognisable",
        "L can be described by a context-free grammar",
      ],
      answerIndex: 2,
      explanation:
        "A language is decidable iff both it and its complement are Turing-recognisable. With recognisers for both, you can run them in parallel: one will always halt and accept, giving a decision. Not all decidable languages are finite or context-free.",
    },
    {
      q: "In the proof that the halting problem is undecidable, what technique does Turing use?",
      options: [
        "Pumping lemma",
        "Pigeonhole principle",
        "Diagonalisation / self-reference",
        "Induction on the number of states",
      ],
      answerIndex: 2,
      explanation:
        "Turing's proof constructs a machine that takes its own description as input and does the opposite of what a hypothetical halting decider predicts — a diagonalisation argument, similar in spirit to Cantor's proof that the reals are uncountable.",
    },
  ],
  exercises: [
    "Design a Turing machine that accepts the language { w#w | w in {0,1}* } — strings of the form w#w where the two halves are identical. Describe the states, transitions, and tape operations.",
    "Prove that the problem 'does TM M accept at least one string?' is undecidable by reducing from the halting problem. Write out the full reduction.",
    "Implement a Universal Turing Machine simulator in your preferred language. It should read a TM description and an input string, then simulate the TM step by step, reporting accept/reject/loop-detection.",
    "Show that if a language L is decidable, then its complement L-bar is also decidable. Then explain why this fails for recognisable (r.e.) languages.",
  ],
  flashcards: [
    {
      front: "What are the five components of a Turing machine?",
      back: "A finite set of states, an input alphabet, a tape alphabet (including blank), a transition function delta(q, a) -> (q', b, D), and designated start/accept/reject states.",
    },
    {
      front: "What does the Church-Turing thesis claim?",
      back: "Any function that is effectively computable by an algorithm can be computed by a Turing machine. It equates the informal notion of 'algorithm' with Turing-computability.",
    },
    {
      front: "What is a Universal Turing Machine?",
      back: "A TM that takes the encoded description of another TM and its input, then simulates that TM step by step. It is the theoretical basis of general-purpose stored-program computers.",
    },
    {
      front: "State the Halting Problem.",
      back: "Given a Turing machine M and input w, determine whether M halts (accepts or rejects) on w. This problem is undecidable — no algorithm can solve it for all M and w.",
    },
    {
      front: "Decidable vs Recognisable language",
      back: "Decidable (recursive): a TM always halts, correctly accepting or rejecting. Recognisable (r.e.): a TM halts and accepts members but may loop on non-members.",
    },
    {
      front: "What does Rice's theorem say?",
      back: "Every non-trivial semantic property of the language recognised by a Turing machine is undecidable. 'Non-trivial' means some TMs have the property and some don't.",
    },
    {
      front: "What is a many-one reduction?",
      back: "A computable function f that transforms instances of problem A into instances of problem B such that x is in A iff f(x) is in B. If A is undecidable and reduces to B, then B is undecidable.",
    },
    {
      front: "Are non-deterministic TMs more powerful than deterministic TMs?",
      back: "No — they recognise exactly the same class of languages. However, the deterministic simulation may require exponentially more steps (this is the essence of the P vs NP question).",
    },
  ],
  revisionNotes: [
    "A TM is defined by (Q, Sigma, Gamma, delta, q0, qAccept, qReject) — remember Gamma includes the blank symbol and Sigma is a subset of Gamma.",
    "The halting problem proof uses diagonalisation: assume a decider H exists, construct D that self-refers and contradicts H. This is the template for many undecidability proofs.",
    "Decidable = always halts with correct answer. Recognisable = halts on 'yes' instances, may loop on 'no'. Decidable iff both L and complement(L) are recognisable.",
    "Rice's theorem: if a property P of TM languages is non-trivial (some TMs have P, some don't), then {<M> | L(M) has property P} is undecidable.",
    "Reduction technique: to prove B undecidable, show A <=m B where A is known undecidable. You construct a computable transformation from A-instances to B-instances.",
    "Practical impact: perfect virus detection, program equivalence checking, and complete dead-code elimination are all impossible in general (by Rice's theorem).",
  ],
  cheatSheet: [
    "TM = (Q, Sigma, Gamma, delta, q0, qA, qR) with infinite tape, read/write head, and left/right movement.",
    "Church-Turing thesis: effectively computable <=> Turing-computable. Not proved — a thesis, not a theorem.",
    "Halting problem is undecidable (proof: diagonalisation). It IS recognisable (simulate and wait).",
    "Rice's theorem: any non-trivial semantic property of TMs is undecidable. Syntactic properties can be decidable.",
    "Reduction A <=m B: computable f where x in A iff f(x) in B. Undecidability transfers from A to B.",
    "Chomsky hierarchy: Regular < Context-Free < Context-Sensitive < Recursively Enumerable. Each level adds memory/power.",
  ],
  resources: [
    {
      label: "Introduction to the Theory of Computation (Sipser)",
      kind: "book",
      note: "The gold-standard textbook covering TMs, decidability, and complexity theory with exceptional clarity.",
    },
    {
      label: "Computational Complexity: A Modern Approach (Arora & Barak)",
      kind: "book",
      note: "Graduate-level treatment of complexity theory built on the TM model. Free draft available online.",
    },
    {
      label: "Turing's 1936 paper: On Computable Numbers",
      kind: "paper",
      note: "The original paper defining Turing machines and proving the undecidability of the Entscheidungsproblem.",
    },
    {
      label: "Scott Aaronson — Who Can Name the Bigger Number?",
      kind: "article",
      note: "Accessible essay connecting Turing machines, the Busy Beaver function, and the limits of computation.",
    },
  ],
  glossary: [
    {
      term: "Turing Machine",
      definition:
        "A theoretical model of computation with a finite-state control, an infinite tape, and a read/write head that moves one cell per step.",
    },
    {
      term: "Church-Turing Thesis",
      definition:
        "The assertion that every effectively computable function is computable by a Turing machine.",
    },
    {
      term: "Universal Turing Machine",
      definition:
        "A TM that can simulate any other TM given its description and input — the theoretical basis of programmable computers.",
    },
    {
      term: "Halting Problem",
      definition:
        "The undecidable problem of determining whether a given TM halts on a given input.",
    },
    {
      term: "Decidable (Recursive)",
      definition:
        "A language for which a TM exists that always halts and correctly accepts or rejects every input.",
    },
    {
      term: "Recognisable (Recursively Enumerable)",
      definition:
        "A language for which a TM exists that accepts all members; it may loop on non-members.",
    },
    {
      term: "Rice's Theorem",
      definition:
        "Any non-trivial semantic property of the language recognised by a TM is undecidable.",
    },
    {
      term: "Reduction",
      definition:
        "A transformation from one problem to another that preserves solvability, used to transfer undecidability/hardness results.",
    },
  ],
};
